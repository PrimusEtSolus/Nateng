import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { listing: { include: { product: true } } } }, buyer: true, seller: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { buyerId, sellerId, items } = body; // items: [{ listingId, quantity }]
  if (!buyerId || !sellerId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  // simple transactional create: check quantities, decrement, create order
  const connect = await prisma.$transaction(async (tx: any) => {
    let totalCents = 0;
    const createdOrder = await tx.order.create({
      data: {
        buyerId: Number(buyerId),
        sellerId: Number(sellerId),
        totalCents: 0,
      },
    });

    for (const it of items) {
      const listing = await tx.listing.findUnique({ where: { id: Number(it.listingId) } });
      if (!listing) throw new Error(`listing ${it.listingId} not found`);
      if (listing.quantity < Number(it.quantity)) throw new Error(`insufficient quantity for listing ${it.listingId}`);

      const itemTotal = Number(it.quantity) * listing.priceCents;
      totalCents += itemTotal;

      await tx.orderItem.create({
        data: {
          orderId: createdOrder.id,
          listingId: listing.id,
          quantity: Number(it.quantity),
          priceCents: listing.priceCents,
        },
      });

      await tx.listing.update({ where: { id: listing.id }, data: { quantity: listing.quantity - Number(it.quantity) } });
    }

    await tx.order.update({ where: { id: createdOrder.id }, data: { totalCents } });

    return createdOrder;
  });

  return NextResponse.json(connect, { status: 201 });
}
