import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Update message status to reviewed using raw SQL
    const result = await prisma.$queryRaw`
      UPDATE ContactMessage 
      SET status = 'reviewed', updatedAt = datetime('now')
      WHERE id = ${messageId}
    `

    console.log(`Message ${messageId} marked as reviewed`)

    return NextResponse.json({ 
      success: true,
      message: 'Message marked as reviewed successfully'
    })
  } catch (error) {
    console.error('Error marking message as reviewed:', error)
    return NextResponse.json(
      { error: 'Failed to mark message as reviewed' },
      { status: 500 }
    )
  }
}
