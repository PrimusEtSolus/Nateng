import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        products: true,
        listings: { include: { product: true } },
        ordersAsBuyer: { include: { items: true } },
        ordersAsSeller: { include: { items: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, role } = body;

    if (role) {
      const validRoles = ['farmer', 'buyer', 'business', 'reseller', 'admin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: `invalid role. must be one of: ${validRoles.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'user deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
