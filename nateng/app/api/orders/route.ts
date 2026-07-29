import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { validateMarketplaceTransaction } from '@/lib/marketplace-rules';
import type { UserRole } from '@/lib/types';
import { logger } from '@/lib/logger';

interface OrderItem {
  listingId: number;
  quantity: number;
}

export async function GET(req: NextRequest) {
  let user: any = null;
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

    const where: Record<string, unknown> = {};
    
    // Users can only see their own orders unless they're admin
    if (user.role !== 'admin') {
      if (user.role === 'buyer' || user.role === 'bulkBuyer') {
        where.buyerId = user.id;
      } else if (user.role === 'farmer' || user.role === 'bulkBuyer') {
        where.sellerId = user.id;
      }
    } else {
      // Admin can filter by any parameters
      if (buyerId) where.buyerId = Number(buyerId);
      if (sellerId) where.sellerId = Number(sellerId);
      if (status) where.status = status;
    }

    const orders = await prisma.order.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error: unknown) {
    logger.apiError('GET', '/api/orders', error, user?.id?.toString());
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let user: any = null;
  try {
    // Optional authentication - allow guest orders for business users
    user = await getCurrentUser();
    
    const body = await req.json();
    const { buyerId, sellerId, items, deliveryAddress, scheduledDate, scheduledTime, route, isCBD, truckWeightKg, isExempt, exemptionType }: {
      buyerId: number;
      sellerId: number;
      items: OrderItem[];
      deliveryAddress?: string;
      scheduledDate?: string;
      scheduledTime?: string;
      route?: string;
      isCBD?: boolean;
      truckWeightKg?: number;
      isExempt?: boolean;
      exemptionType?: string;
    } = body;
    
    if (!buyerId || !sellerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'buyerId, sellerId, and items array are required' },
        { status: 400 }
      );
    }

    // If authenticated user, they can only create orders as themselves unless they're admin
    if (user && user.role !== 'admin' && buyerId !== user.id) {
      return NextResponse.json({ error: 'Cannot create orders for other users' }, { status: 403 });
    }
    
    // If no authentication, allow the order to proceed (for business users)
    // This enables guest checkout functionality

    // Get seller information to validate marketplace rules
    const seller = await prisma.user.findUnique({
      where: { id: Number(sellerId) },
      select: { role: true }
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Validate marketplace transaction rules
    let buyer;
    if (user) {
      buyer = user.role === 'admin' 
        ? await prisma.user.findUnique({ where: { id: Number(buyerId) }, select: { role: true } })
        : user;
    } else {
      // For guest orders, fetch buyer from database
      buyer = await prisma.user.findUnique({ where: { id: Number(buyerId) }, select: { role: true } });
    }

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Validate marketplace rules
    const validationResult = validateMarketplaceTransaction(
      seller.role as UserRole,
      buyer.role as UserRole
    );

    if (!validationResult.allowed) {
      return NextResponse.json(
        { error: validationResult.reason || 'Transaction not allowed' },
        { status: 400 }
      );
    }

    // Create order and update listings in a transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // Calculate total price
      let calculatedTotalCents = 0;
      const orderItems = [];

      for (const item of items) {
        const listing = await tx.listing.findUnique({
          where: { id: item.listingId },
          include: { product: true }
        });

        if (!listing) {
          throw new Error(`Listing ${item.listingId} not found`);
        }

        if (listing.quantity < item.quantity) {
          throw new Error(`Insufficient quantity for listing ${item.listingId}`);
        }

        // Validate minimum order requirements
        if (buyer.role === 'bulkBuyer' && listing.product.minimumOrderKg) {
          const totalKgNeeded = item.quantity;
          if (totalKgNeeded < listing.product.minimumOrderKg) {
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
                      farmer: true
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
            message: `You have a new order #${order.id} from ${user?.name || 'a customer'}`,
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
    } catch (notificationError) {
      logger.error('Failed to create order notifications', { notificationError });
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
    } catch (analyticsError) {
      logger.error('Failed to track order analytics', { analyticsError });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    logger.apiError('POST', '/api/orders', error, user?.id?.toString());
    const message = typeof error?.message === 'string' ? error.message : 'Internal server error';
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