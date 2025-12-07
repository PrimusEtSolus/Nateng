import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: currentUser.id },
      include: {
        listing: {
          include: {
            product: {
              include: {
                farmer: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
            seller: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('GET favorites error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { listingId } = body

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: currentUser.id,
          listingId: listingId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 409 })
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: currentUser.id,
        listingId: listingId
      },
      include: {
        listing: {
          include: {
            product: true,
            seller: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    console.error('POST favorite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
