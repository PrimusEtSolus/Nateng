import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favoriteId = parseInt(params.id)
    if (isNaN(favoriteId)) {
      return NextResponse.json({ error: 'Invalid favorite ID' }, { status: 400 })
    }

    // Check if favorite exists and belongs to user
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId }
    })

    if (!favorite) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
    }

    if (favorite.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.favorite.delete({
      where: { id: favoriteId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE favorite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
