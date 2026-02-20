import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const page = parseInt(params.get('page') || '1');
    const limit = parseInt(params.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        include: {
          farmer: { 
            select: { 
              id: true, 
              name: true, 
              role: true, 
              email: true 
            } 
          },
          listings: { 
            select: { 
              id: true, 
              quantity: true, 
              available: true,
              priceCents: true,
              seller: { 
                select: { 
                  id: true, 
                  name: true 
                } 
              }
            },
            where: { available: true },
            orderBy: { createdAt: 'desc' },
            take: 5 // Limit listings per product for performance
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
      }),
      prisma.product.count()
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only farmers and resellers can create products
    if (user.role !== 'farmer' && user.role !== 'reseller') {
      return NextResponse.json({ error: 'Only farmers and resellers can create products' }, { status: 403 });
    }
    const body = await req.json();
    const { name, description, farmerId, imageUrl } = body;

    if (!name || !farmerId) {
      return NextResponse.json({ error: 'missing fields: name, farmerId' }, { status: 400 });
    }

    // Farmers and resellers can only create products for themselves
    if (farmerId !== user.id) {
      return NextResponse.json({ error: 'Cannot create products for other users' }, { status: 403 });
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
