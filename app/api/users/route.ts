import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only admins can view all users
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const params = new URL(req.url).searchParams;
    const role = params.get('role');
    const page = parseInt(params.get('page') || '1');
    const limit = parseInt(params.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = role ? { role } : undefined;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          isBanned: true,
          products: { 
            select: { 
              id: true, 
              name: true 
            } 
          },
          listings: { 
            select: { 
              id: true, 
              quantity: true, 
              available: true 
            } 
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users,
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
    const body = await req.json();
    const { name, email, role, password } = body;

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: 'missing fields: name, email, role, password' }, { status: 400 });
    }

    const validRoles = ['farmer', 'buyer', 'business', 'reseller', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `invalid role. must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    try {
      const user = await prisma.user.create({
        data: { name, email, role, password },
      });
      return NextResponse.json(user, { status: 201 });
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ error: 'email already exists' }, { status: 409 });
      }
      throw err;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
