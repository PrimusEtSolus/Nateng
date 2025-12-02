import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const sellerId = params.get('sellerId');
    const productId = params.get('productId');
    const available = params.get('available');

    const where: any = {};
    if (sellerId) where.sellerId = Number(sellerId);
    if (productId) where.productId = Number(productId);
    if (available !== null) where.available = available === 'true';

    const listings = await prisma.listing.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        product: { include: { farmer: { select: { id: true, name: true, email: true } } } },
        seller: { select: { id: true, name: true, role: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(listings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, sellerId, priceCents, quantity } = body;
    if (!productId || !sellerId || priceCents === undefined || !quantity) {
      return NextResponse.json({ error: 'missing fields: productId, sellerId, priceCents, quantity' }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        productId: Number(productId),
        sellerId: Number(sellerId),
        priceCents: Number(priceCents),
        quantity: Number(quantity),
        available: true,
      },
      include: {
        product: { include: { farmer: true } },
        seller: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
