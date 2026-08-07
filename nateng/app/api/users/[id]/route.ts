import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { handleError } from '@/lib/api-error';
import { UserUpdateSchema } from '@/lib/validation-schemas';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ── Authentication ──
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // ── Authorization: self or admin only ──
    if (targetId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // ── NEVER return password field ──
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePhotoUrl: true,
        createdAt: true,
        businessName: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
        minimumOrderKg: true,
        deliveryAreas: true,
        paymentMethods: true,
        phone: true,
        address: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            createdAt: true
          }
        },
        listings: {
          select: {
            id: true,
            priceCents: true,
            quantity: true,
            available: true,
            createdAt: true,
          }
        },
        ordersAsBuyer: {
          select: {
            id: true,
            totalCents: true,
            status: true,
            createdAt: true,
            buyerId: true,
            sellerId: true
          }
        },
        ordersAsSeller: {
          select: {
            id: true,
            totalCents: true,
            status: true,
            createdAt: true,
            buyerId: true,
            sellerId: true
          }
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    return handleError(error, 'GET /api/users/[id]');
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ── Authentication ──
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // ── Authorization: self or admin only ──
    if (targetId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // ── Input validation with Zod ──
    const body = await req.json();
    const parsed = UserUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    // ── Prevent privilege escalation: strip role unless current user is admin ──
    const validatedData = { ...parsed.data };
    if (validatedData.role && currentUser.role !== 'admin') {
      delete validatedData.role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePhotoUrl: true,
        createdAt: true,
        businessName: true,
        isBanned: true,
        phone: true,
        address: true,
        city: true,
        province: true,
        country: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    return handleError(error, 'PATCH /api/users/[id]');
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ── Authentication ──
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // ── Authorization: self or admin only ──
    if (targetId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ message: 'user deleted' });
  } catch (error: unknown) {
    return handleError(error, 'DELETE /api/users/[id]');
  }
}
