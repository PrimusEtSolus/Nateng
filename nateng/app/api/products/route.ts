import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { handleError } from '@/lib/api-error';
import { ProductCreateSchema } from '@/lib/validation-schemas';

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const page = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    const farmerId = params.get('farmerId');
    const search = params.get('search');
    const sortBy = params.get('sortBy') || 'createdAt-desc';

    const where: Record<string, unknown> = {};
    if (farmerId) where.farmerId = Number(farmerId);
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const orderByMap: Record<string, Record<string, 'asc' | 'desc'>> = {
      'createdAt-desc': { createdAt: 'desc' },
      'createdAt-asc': { createdAt: 'asc' },
      'name-asc': { name: 'asc' },
      'name-desc': { name: 'desc' },
    };
    const orderBy = orderByMap[sortBy] || { createdAt: 'desc' as const };

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
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
            take: 5
          },
        },
        orderBy,
        take: limit,
        skip: skip,
      }),
      prisma.product.count({
        where: Object.keys(where).length > 0 ? where : undefined
      })
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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (currentUser.role !== 'farmer' && currentUser.role !== 'bulkBuyer') {
      return NextResponse.json({ error: 'Only farmers and bulkBuyers can create products' }, { status: 403 });
    }

    const body = await req.json();

    // ── Input validation with Zod ──
    const parsed = ProductCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, description, imageUrl, farmerId } = parsed.data;

    if (farmerId !== currentUser.id) {
      return NextResponse.json({ error: 'Cannot create products for other users' }, { status: 403 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        farmerId: Number(farmerId),
        ...(imageUrl ? { imageUrl } : {}),
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