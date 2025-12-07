import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listingId = parseInt(params.listingId)
    if (isNaN(listingId)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 })
    }

    // Find and delete favorite by user and listing
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: currentUser.id,
          listingId: listingId
        }
      }
    })

    if (!favorite) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
    }

    await prisma.favorite.delete({
      where: { id: favorite.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE favorite by listing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
