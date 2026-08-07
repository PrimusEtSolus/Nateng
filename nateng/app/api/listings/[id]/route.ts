import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { handleError } from '@/lib/api-error';
import { ListingUpdateSchema } from '@/lib/validation-schemas';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const targetId = Number(id);
    if (isNaN(targetId) || targetId <= 0) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: targetId },
      include: {
        product: { include: { farmer: { select: { id: true, name: true, email: true, minimumOrderKg: true } } } },
        seller: { select: { id: true, name: true, role: true, email: true, minimumOrderKg: true, address: true, city: true, province: true, country: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error: unknown) {
    return handleError(error, 'GET /api/listings/[id]');
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
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    // ── Fetch listing to check ownership ──
    const existingListing = await prisma.listing.findUnique({
      where: { id: targetId },
      select: { sellerId: true },
    });

    if (!existingListing) {
      return NextResponse.json({ error: 'listing not found' }, { status: 404 });
    }

    // ── Authorization: only seller or admin ──
    if (existingListing.sellerId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied — you can only edit your own listings' }, { status: 403 });
    }

    // ── Input validation with Zod ──
    const body = await req.json();
    const parsed = ListingUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.update({
      where: { id: targetId },
      data: parsed.data,
      include: {
        product: { include: { farmer: { select: { id: true, name: true } } } },
        seller: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(listing);
  } catch (error: unknown) {
    return handleError(error, 'PATCH /api/listings/[id]');
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
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    // ── Fetch listing to check ownership ──
    const existingListing = await prisma.listing.findUnique({
      where: { id: targetId },
      select: { sellerId: true },
    });

    if (!existingListing) {
      return NextResponse.json({ error: 'listing not found' }, { status: 404 });
    }

    // ── Authorization: only seller or admin ──
    if (existingListing.sellerId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied — you can only delete your own listings' }, { status: 403 });
    }

    await prisma.listing.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ message: 'listing deleted' });
  } catch (error: unknown) {
    return handleError(error, 'DELETE /api/listings/[id]');
  }
}