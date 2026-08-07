import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { canCreateListings, getAllowedSellersForBuyer } from '@/lib/marketplace-rules';
import type { UserRole } from '@/lib/types';
import { ListingCreateSchema } from '@/lib/validation-schemas';

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const sellerId = params.get('sellerId');
    const productId = params.get('productId');
    const available = params.get('available');
    const userRole = params.get('userRole');
    const search = params.get('search');
    const sortBy = params.get('sortBy') || 'createdAt-desc';
    const limit = params.get('limit');

    const where: Record<string, unknown> = {};
    if (sellerId) where.sellerId = Number(sellerId);
    if (productId) where.productId = Number(productId);
    if (available !== null) where.available = available === 'true';

    if (search) {
      where.product = {
        name: { contains: search, mode: 'insensitive' }
      };
    }

    const orderByMap: Record<string, Record<string, 'asc' | 'desc'>> = {
      'createdAt-desc': { createdAt: 'desc' },
      'createdAt-asc': { createdAt: 'asc' },
      'price-asc': { priceCents: 'asc' },
      'price-desc': { priceCents: 'desc' },
      'quantity-desc': { quantity: 'desc' },
      'quantity-asc': { quantity: 'asc' },
    };
    const orderBy = orderByMap[sortBy] || { createdAt: 'desc' as const };

    const queryOptions = {
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        product: { 
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            farmer: { select: { id: true, name: true, email: true, minimumOrderKg: true } }
          }
        },
        seller: { select: { id: true, name: true, role: true, email: true, minimumOrderKg: true, address: true, city: true, province: true, country: true } },
      },
      orderBy,
    };

    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        (queryOptions as Record<string, unknown>).take = limitNum;
      }
    }

    const listings = await prisma.listing.findMany(queryOptions);

    // Filter listings based on user role if provided
    let filteredListings = listings;
    if (userRole && userRole !== 'admin') {
      const allowedSellers = getAllowedSellersForBuyer(userRole as UserRole);
      filteredListings = listings.filter((listing) => 
        listing.seller && allowedSellers.includes(listing.seller.role as UserRole)
      );
    }

    return NextResponse.json(filteredListings);
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

    const body = await req.json();

    // ── Input validation with Zod ──
    const parsed = ListingCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { productId, sellerId, priceCents, quantity, available } = parsed.data;

    if (currentUser.role !== 'admin' && sellerId !== currentUser.id) {
      return NextResponse.json({ error: 'Cannot create listings for other users' }, { status: 403 });
    }

    const listingPermission = canCreateListings(currentUser.role as UserRole);
    if (!listingPermission.allowed) {
      return NextResponse.json(
        { error: listingPermission.reason || 'Not allowed to create listings' },
        { status: 403 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        productId: Number(productId),
        sellerId: Number(sellerId),
        priceCents: Number(priceCents),
        quantity: Number(quantity),
        available: available !== undefined ? Boolean(available) : true,
      },
      include: {
        product: { 
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            farmer: { select: { id: true, name: true, email: true, minimumOrderKg: true } }
          }
        },
        seller: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}