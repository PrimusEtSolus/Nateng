import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser, AuthUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { validateMarketplaceTransaction } from '@/lib/marketplace-rules';
import type { UserRole } from '@/lib/types';
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/api-error';
import { OrderCreateSchema } from '@/lib/validation-schemas';

export async function GET(req: NextRequest) {
  let user: AuthUser | null = null;
  try {
    // Authenticate user
    user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const params = new URL(req.url).searchParams;

    const buyerId = params.get('buyerId');
    const sellerId = params.get('sellerId');
    const status = params.get('status');
    const sortBy = params.get('sortBy') || 'createdAt-desc';
    const limit = params.get('limit');

    // @ts-ignore - Dynamic Prisma where clause
    const where: Record<string, unknown> = {};

    // Users can only see their own orders unless they're admin
    if (user.role !== 'admin') {
      if (user.role === 'buyer') {
        where.buyerId = user.id;
      } else if (user.role === 'farmer') {
        where.sellerId = user.id;
      } else if (user.role === 'bulkBuyer') {
        // BulkBuyers can be both buyers and sellers — allow explicit filtering
        if (buyerId && Number(buyerId) === user.id) {
          where.buyerId = user.id;
        } else if (sellerId && Number(sellerId) === user.id) {
          where.sellerId = user.id;
        } else if (!buyerId && !sellerId) {
          where.buyerId = user.id;
        } else {
          // Trying to query another user's orders — block it
          return NextResponse.json({ error: 'Cannot view other users orders' }, { status: 403 });
        }
      }
    } else {
      // Admin can filter by any parameters
      if (buyerId) where.buyerId = Number(buyerId);
      if (sellerId) where.sellerId = Number(sellerId);
    }

    // Status filtering (allowed for all users — they're already scoped to their own orders)
    if (status) {
      // Support comma-separated statuses (e.g., ?status=PENDING,CONFIRMED)
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
      if (statuses.length === 1) {
        where.status = statuses[0];
      } else if (statuses.length > 1) {
        // @ts-ignore - Prisma allows { in: [...] } for IN queries
        where.status = { in: statuses };
      }
    }

    // Build orderBy from sortBy param
    const orderByMap: Record<string, Record<string, 'asc' | 'desc'>> = {
      'createdAt-desc': { createdAt: 'desc' },
      'createdAt-asc': { createdAt: 'asc' },
      'totalCents-desc': { totalCents: 'desc' },
      'totalCents-asc': { totalCents: 'asc' },
    };
    const orderBy = orderByMap[sortBy] || { createdAt: 'desc' as const };

    // Build query options
    const queryOptions: Record<string, unknown> = {
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        items: { include: { listing: { include: { product: { include: { farmer: true } } } } } },
        buyer: { select: { id: true, name: true, email: true, role: true } },
        seller: { select: { id: true, name: true, email: true, role: true } },
        deliverySchedule: {
          include: {
            proposer: { select: { id: true, name: true, email: true, role: true } },
            confirmer: { select: { id: true, name: true, email: true, role: true } }
          }
        }
      },
      orderBy,
    };

    // Apply limit if provided (for dashboard "recent orders")
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        // @ts-ignore - Adding dynamic take property
        queryOptions.take = limitNum;
      }
    }

    // @ts-ignore - Complex Prisma query type
    const orders = await prisma.order.findMany(queryOptions);

    return NextResponse.json(orders);
  } catch (error: unknown) {
    logger.apiError('GET', '/api/orders', error, user?.id?.toString());
    return handleError(error, 'GET /api/orders');
  }
}

export async function POST(req: NextRequest) {
  let user: AuthUser | null = null;
  try {
    // ── Authentication: guest path removed — all orders require an authenticated user ──
    user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();

    // ── Input validation with Zod ──
    const parsed = OrderCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { buyerId, sellerId, items, deliveryAddress, scheduledDate, scheduledTime, route, isCBD, truckWeightKg, isExempt, exemptionType } = parsed.data;

    if (!buyerId || !sellerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'buyerId, sellerId, and items array are required' },
        { status: 400 }
      );
    }

    // Authenticated user can only create orders as themselves unless admin
    if (user.role !== 'admin' && buyerId !== user.id) {
      return NextResponse.json({ error: 'Cannot create orders for other users' }, { status: 403 });
    }

    // Get seller information to validate marketplace rules
    const seller = await prisma.user.findUnique({
      where: { id: Number(sellerId) },
      select: { role: true }
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Validate marketplace rules
    const validationResult = validateMarketplaceTransaction(
      seller.role as UserRole,
      (user as AuthUser).role as UserRole
    );

    if (!validationResult.allowed) {
      return NextResponse.json(
        { error: validationResult.reason || 'Transaction not allowed' },
        { status: 400 }
      );
    }

    // Create order and update listings in a transaction
    const order = await prisma.$transaction(async (tx) => {
      let calculatedTotalCents = 0;
      const orderItems: Array<{ listingId: number; quantity: number; priceCents: number }> = [];

      for (const item of items) {
        const listing = await tx.listing.findUnique({
          where: { id: item.listingId },
          include: { 
            product: { 
              select: { 
                id: true, 
                name: true, 
                description: true, 
                imageUrl: true, 
                farmerId: true
              } 
            },
            seller: {
              select: {
                id: true,
                minimumOrderKg: true
              }
            }
          }
        });

        if (!listing) {
          throw new Error(`Listing ${item.listingId} not found`);
        }

        if (listing.quantity < item.quantity) {
          throw new Error(`Insufficient quantity for listing ${item.listingId}`);
        }

        // Validate minimum order requirements
        if ((user as AuthUser).role === 'bulkBuyer' && listing.seller?.minimumOrderKg) {
          const totalKgNeeded = item.quantity;
          if (totalKgNeeded < listing.seller.minimumOrderKg) {
            throw new Error(`Minimum order requirement not met for ${listing.product.name}`);
          }
        }

        const itemTotalCents = item.quantity * listing.priceCents;
        calculatedTotalCents += itemTotalCents;

        // Update listing quantity
        await tx.listing.update({
          where: { id: item.listingId },
          data: {
            quantity: listing.quantity - item.quantity,
            available: (listing.quantity - item.quantity) > 0
          }
        });

        orderItems.push({
          listingId: item.listingId,
          quantity: item.quantity,
          priceCents: listing.priceCents
        });
      }

      // Create the order with delivery scheduling fields
      const newOrder = await tx.order.create({
        data: {
          buyerId: Number(buyerId),
          sellerId: Number(sellerId),
          totalCents: calculatedTotalCents,
          status: 'PENDING',
          deliveryAddress: deliveryAddress || null,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          scheduledTime: scheduledTime || null,
          route: route || null,
          isCBD: Boolean(isCBD),
          truckWeightKg: truckWeightKg ? Number(truckWeightKg) : null,
          isExempt: Boolean(isExempt),
          exemptionType: exemptionType || null,
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              listing: {
                include: {
                  product: {
                    include: {
                      farmer: { select: { id: true, name: true } }
                    }
                  }
                }
              }
            }
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      return newOrder;
    });

    // Create notifications for buyer and seller
    try {
      await prisma.notification.createMany({
        data: [
          {
            userId: Number(sellerId),
            type: 'order_placed',
            title: 'New Order Received',
            message: `You have a new order #${order.id} from ${user.name}`,
            link: `/orders/${order.id}`,
          },
          {
            userId: Number(buyerId),
            type: 'order_placed',
            title: 'Order Placed Successfully',
            message: `Your order #${order.id} has been placed with ${order.seller.name}`,
            link: `/orders/${order.id}`,
          }
        ]
      });
    } catch {
      // Notifications are non-critical; continue even if they fail
    }

    // Record analytics event for order placement
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: Number(buyerId),
          eventType: 'order_placed',
          metadata: JSON.stringify({ orderId: order.id, sellerId: Number(sellerId), totalCents: order.totalCents, itemCount: items.length }),
        },
      });
    } catch {
      // Analytics are non-critical; continue even if they fail
    }

    return NextResponse.json(order);
  } catch (error: unknown) {
    logger.apiError('POST', '/api/orders', error, user?.id?.toString());
    const message = error instanceof Error ? error.message : 'Internal server error';
    const isBusinessError =
      typeof message === 'string' &&
      (message.includes('minimum order requirement not met') ||
        message.includes('insufficient quantity') ||
        message.includes('listing') ||
        message.includes('quantity'));

    return NextResponse.json(
      { error: message },
      { status: isBusinessError ? 400 : 500 }
    );
  }
}