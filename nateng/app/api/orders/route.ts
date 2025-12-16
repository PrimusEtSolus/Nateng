import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { validateMarketplaceTransaction } from '@/lib/marketplace-rules';
import type { UserRole } from '@/lib/types';

interface OrderItem {
  listingId: number;
  quantity: number;
}

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(req);
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
      if (user.role === 'buyer' || user.role === 'business') {
        where.buyerId = user.id;
      } else if (user.role === 'farmer' || user.role === 'reseller') {
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
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { buyerId, sellerId, items }: { buyerId: number; sellerId: number; items: OrderItem[] } = body;
    
    if (!buyerId || !sellerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'buyerId, sellerId, and items array are required' },
        { status: 400 }
      );
    }

    // Users can only create orders as themselves unless they're admin
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

    // Validate marketplace transaction rules
    const buyer = user.role === 'admin' 
      ? await prisma.user.findUnique({ where: { id: Number(buyerId) }, select: { role: true } })
      : user;

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
      let totalCents = 0;
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
        if (buyer.role === 'business' && listing.product.minimumOrderKg) {
          const totalKgNeeded = item.quantity;
          if (totalKgNeeded < listing.product.minimumOrderKg) {
            throw new Error(`Minimum order requirement not met for ${listing.product.name}`);
          }
        }

        const itemTotalCents = item.quantity * listing.priceCents;
        totalCents += itemTotalCents;

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

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          buyerId: Number(buyerId),
          sellerId: Number(sellerId),
          totalCents,
          status: 'PENDING',
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

    return NextResponse.json(order);
  } catch (error: any) {
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
