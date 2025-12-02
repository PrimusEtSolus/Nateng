import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const role = params.get('role');

    const where = role ? { role } : undefined;

    const users = await prisma.user.findMany({
      where,
      include: {
        products: { select: { id: true, name: true } },
        listings: { select: { id: true, quantity: true, available: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'missing fields: name, email, role' }, { status: 400 });
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
        data: { name, email, role },
      });
      return NextResponse.json(user, { status: 201 });
    } catch (err: any) {
      if (err.code === 'P2002') {
        return NextResponse.json({ error: 'email already exists' }, { status: 409 });
      }
      throw err;
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
