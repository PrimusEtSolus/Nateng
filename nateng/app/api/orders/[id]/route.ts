import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { handleError } from '@/lib/api-error';
import { OrderStatusSchema } from '@/lib/validation-schemas';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: targetId },
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
    if (order.buyerId !== currentUser.id && order.sellerId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: unknown) {
    return handleError(error, 'GET /api/orders/[id]');
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // ── Input validation with Zod ──
    const body = await req.json();
    const parsed = OrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    // Get the order first to check permissions
    const existingOrder = await prisma.order.findUnique({
      where: { id: targetId },
      select: { sellerId: true, buyerId: true, status: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'order not found' }, { status: 404 });
    }

    // Check permissions - only seller or admin can update status
    if (existingOrder.sellerId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const order = await prisma.order.update({
      where: { id: targetId },
      data: { status },
      include: {
        items: { include: { listing: { include: { product: true } } } },
        buyer: { select: { id: true, name: true, email: true, role: true } },
        seller: { select: { id: true, name: true, email: true, role: true } },
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
  } catch (error: unknown) {
    return handleError(error, 'PATCH /api/orders/[id]');
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Only allow deletion of PENDING orders
    const order = await prisma.order.findUnique({
      where: { id: targetId },
      select: { buyerId: true, sellerId: true, status: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'order not found' }, { status: 404 });
    }

    // Check permissions - only buyer or admin can delete
    if (order.buyerId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: `cannot delete order with status ${order.status}` },
        { status: 400 }
      );
    }

    // Restore inventory
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: targetId },
    });

    for (const item of orderItems) {
      await prisma.listing.update({
        where: { id: item.listingId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    await prisma.order.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ message: 'order deleted' });
  } catch (error: unknown) {
    return handleError(error, 'DELETE /api/orders/[id]');
  }
}