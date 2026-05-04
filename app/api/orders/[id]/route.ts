import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const user = await getCurrentUser(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: { include: { listing: { include: { product: { include: { farmer: true } } } } } },
        buyer: { select: { id: true, name: true, email: true, role: true } },
        seller: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'order not found' }, { status: 404 });
    }

    // Check if user has permission to view this order
    if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const user = await getCurrentUser(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `invalid status. must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Get the order first to check permissions
    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(id) }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'order not found' }, { status: 404 });
    }

    // Check permissions - only seller or admin can update status
    if (existingOrder.sellerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        items: { include: { listing: { include: { product: true } } } },
        buyer: true,
        seller: true,
      },
    });

    // Create notifications based on status change
    const statusMessages: Record<string, { buyer: string; seller: string }> = {
      CONFIRMED: {
        buyer: 'Your order has been confirmed by the seller',
        seller: 'You have confirmed the order',
      },
      SHIPPED: {
        buyer: 'Your order has been shipped',
        seller: 'You have marked the order as shipped',
      },
      DELIVERED: {
        buyer: 'Your order has been delivered',
        seller: 'You have marked the order as delivered',
      },
      CANCELLED: {
        buyer: 'Your order has been cancelled',
        seller: 'The order has been cancelled',
      },
    };

    if (statusMessages[status]) {
      const messages = statusMessages[status];
      
      // Notify buyer
      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: `order_${status.toLowerCase()}`,
          title: `Order ${status}`,
          message: messages.buyer,
          link: `/orders/${order.id}`,
        },
      });

      // Notify seller
      await prisma.notification.create({
        data: {
          userId: order.sellerId,
          type: `order_${status.toLowerCase()}`,
          title: `Order ${status}`,
          message: messages.seller,
          link: `/orders/${order.id}`,
        },
      });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Only allow deletion of PENDING orders
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
    });

    if (!order) {
      return NextResponse.json({ error: 'order not found' }, { status: 404 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: `cannot delete order with status ${order.status}` },
        { status: 400 }
      );
    }

    // Restore inventory
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: Number(id) },
    });

    for (const item of orderItems) {
      await prisma.listing.update({
        where: { id: item.listingId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    await prisma.order.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'order deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
