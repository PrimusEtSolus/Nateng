import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
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
    // Authenticate user
    const user = await getCurrentUser(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only farmers can create products
    if (user.role !== 'farmer') {
      return NextResponse.json({ error: 'Only farmers can create products' }, { status: 403 });
    }
    const body = await req.json();
    const { name, description, farmerId, imageUrl } = body;

    if (!name || !farmerId) {
      return NextResponse.json({ error: 'missing fields: name, farmerId' }, { status: 400 });
    }

    // Farmers can only create products for themselves
    if (farmerId !== user.id) {
      return NextResponse.json({ error: 'Cannot create products for other farmers' }, { status: 403 });
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
