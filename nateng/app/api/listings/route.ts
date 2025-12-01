import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const seller = params.get('sellerId');

  const where = seller ? { sellerId: Number(seller) } : undefined;
  const listings = await prisma.listing.findMany({
    where,
    include: {
      product: true,
      seller: { select: { id: true, name: true, role: true } },
    },
  });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { productId, sellerId, priceCents, quantity } = body;
  if (!productId || !sellerId || !priceCents || !quantity) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      productId: Number(productId),
      sellerId: Number(sellerId),
      priceCents: Number(priceCents),
      quantity: Number(quantity),
    },
  });

  return NextResponse.json(listing, { status: 201 });
}
