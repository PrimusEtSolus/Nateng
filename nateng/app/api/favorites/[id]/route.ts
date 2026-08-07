import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { handleError } from '@/lib/api-error'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const favoriteId = parseInt(resolvedParams.id)
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
  } catch (error: unknown) {
    return handleError(error, 'DELETE /api/favorites/[id]')
  }
}