import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { handleError } from '@/lib/api-error';
import { ProductUpdateSchema } from '@/lib/validation-schemas';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: targetId },
      include: {
        farmer: { select: { id: true, name: true, role: true, email: true } },
        listings: {
          include: { seller: { select: { id: true, name: true, role: true } } },
          where: { available: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    return handleError(error, 'GET /api/products/[id]');
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
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // ── Fetch product to check ownership ──
    const existingProduct = await prisma.product.findUnique({
      where: { id: targetId },
      select: { farmerId: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'product not found' }, { status: 404 });
    }

    // ── Authorization: only owner (farmerId) or admin ──
    if (existingProduct.farmerId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied — you can only edit your own products' }, { status: 403 });
    }

    // ── Input validation with Zod ──
    const body = await req.json();
    const parsed = ProductUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: targetId },
      data: parsed.data,
      include: { farmer: { select: { id: true, name: true } } },
    });

    return NextResponse.json(product);
  } catch (error: unknown) {
    return handleError(error, 'PATCH /api/products/[id]');
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
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // ── Fetch product to check ownership ──
    const existingProduct = await prisma.product.findUnique({
      where: { id: targetId },
      select: { farmerId: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'product not found' }, { status: 404 });
    }

    // ── Authorization: only owner (farmerId) or admin ──
    if (existingProduct.farmerId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied — you can only delete your own products' }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ message: 'product deleted' });
  } catch (error: unknown) {
    return handleError(error, 'DELETE /api/products/[id]');
  }
}