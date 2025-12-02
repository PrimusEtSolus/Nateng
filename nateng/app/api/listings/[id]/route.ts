import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id: Number(id) },
      include: {
        product: { include: { farmer: { select: { id: true, name: true, email: true } } } },
        seller: { select: { id: true, name: true, role: true, email: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { quantity, priceCents, available } = body;

    const listing = await prisma.listing.update({
      where: { id: Number(id) },
      data: {
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(priceCents !== undefined && { priceCents: Number(priceCents) }),
        ...(available !== undefined && { available }),
      },
      include: {
        product: { include: { farmer: true } },
        seller: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(listing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.listing.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'listing deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
