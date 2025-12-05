import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        farmer: { select: { id: true, name: true, role: true, email: true } },
        listings: { include: { seller: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, farmerId, imageUrl } = body;

    if (!name || !farmerId) {
      return NextResponse.json({ error: 'missing fields: name, farmerId' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        farmerId: Number(farmerId),
        ...(imageUrl && { imageUrl }),
      },
      include: {
        farmer: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
