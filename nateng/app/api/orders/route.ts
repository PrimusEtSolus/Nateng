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
      if (user.role === 'buyer') {
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
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
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

    const transactionValidation = validateMarketplaceTransaction(
      seller.role as UserRole,
      buyer.role as UserRole
    );

    if (!transactionValidation.allowed) {
      return NextResponse.json(
        { error: transactionValidation.reason || 'Transaction not allowed by marketplace rules' },
        { status: 403 }
      );
    }

    // Transactional create: check quantities, decrement, create order
    const createdOrder = await prisma.$transaction(async (tx) => {
      let totalCents = 0;
      const order = await tx.order.create({
        data: {
          buyerId: Number(buyerId),
          sellerId: Number(sellerId),
          totalCents: 0,
          status: 'PENDING',
        },
      });

      for (const it of items) {
        const listing = await tx.listing.findUnique({ 
          where: { id: Number(it.listingId) },
          include: { seller: { select: { role: true, minimumOrderKg: true } }, product: { include: { farmer: { select: { minimumOrderKg: true } } } } }
        });
        if (!listing) throw new Error(`listing ${it.listingId} not found`);
        
        // Check minimum order requirement for farmers
        if (listing.seller.role === 'farmer') {
          const minOrder = listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50;
          if (Number(it.quantity) < minOrder) {
            throw new Error(`minimum order requirement not met for listing ${it.listingId}. Minimum: ${minOrder}kg, Requested: ${it.quantity}kg`);
          }
        }
        
        if (listing.quantity < Number(it.quantity)) {
          throw new Error(`insufficient quantity for listing ${it.listingId}. Available: ${listing.quantity}, Requested: ${it.quantity}`);
        }

        const itemTotal = Number(it.quantity) * listing.priceCents;
        totalCents += itemTotal;

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            listingId: listing.id,
            quantity: Number(it.quantity),
            priceCents: listing.priceCents,
          },
        });

        await tx.listing.update({
          where: { id: listing.id },
          data: { quantity: listing.quantity - Number(it.quantity) },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { totalCents },
      });

      return order;
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: createdOrder.id },
      include: {
        items: { include: { listing: { include: { product: true } } } },
        buyer: true,
        seller: true,
      },
    });

    // Create notification for seller
    await prisma.notification.create({
      data: {
        userId: Number(sellerId),
        type: 'order_placed',
        title: 'New Order Received',
        message: `You have received a new order from ${fullOrder?.buyer.name || 'a buyer'}`,
        link: `/orders/${createdOrder.id}`,
      },
    });

    // Create notification for buyer
    await prisma.notification.create({
      data: {
        userId: Number(buyerId),
        type: 'order_placed',
        title: 'Order Placed',
        message: `Your order has been placed successfully. Total: ₱${((fullOrder?.totalCents || 0) / 100).toFixed(2)}`,
        link: `/orders/${createdOrder.id}`,
      },
    });

    return NextResponse.json(fullOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
