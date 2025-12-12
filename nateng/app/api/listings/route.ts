import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { canCreateListings, filterListingsByUserRole } from '@/lib/marketplace-rules';
import type { UserRole } from '@/lib/types';

interface ListingBody {
  productId: number;
  sellerId: number;
  priceCents: number;
  quantity: number;
  available?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    // GET is public - no authentication required for browsing listings
    const params = new URL(req.url).searchParams;
    const sellerId = params.get('sellerId');
    const productId = params.get('productId');
    const available = params.get('available');
    const userRole = params.get('userRole'); // Optional: filter for specific user role

    const where: Record<string, unknown> = {};
    if (sellerId) where.sellerId = Number(sellerId);
    if (productId) where.productId = Number(productId);
    if (available !== null) where.available = available === 'true';

    const listings = await prisma.listing.findMany({
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
        seller: { select: { id: true, name: true, role: true, email: true, minimumOrderKg: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter listings based on user role if provided
    let filteredListings = listings;
    if (userRole) {
      filteredListings = filterListingsByUserRole(listings, userRole as UserRole);
    }

    return NextResponse.json(filteredListings);
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

    const body = await req.json();
    const { productId, sellerId, priceCents, quantity, available }: ListingBody = body;
    if (!productId || !sellerId || priceCents === undefined || !quantity) {
      return NextResponse.json({ error: 'missing fields: productId, sellerId, priceCents, quantity' }, { status: 400 });
    }

    // Users can only create listings for themselves unless they're admin
    if (user.role !== 'admin' && sellerId !== user.id) {
      return NextResponse.json({ error: 'Cannot create listings for other users' }, { status: 403 });
    }

    // Check if user is allowed to create listings based on their role
    const listingPermission = canCreateListings(user.role as any);
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
