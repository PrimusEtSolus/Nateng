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

    return NextResponse.json({ 
      success: true,
      message: 'Message marked as reviewed successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark message as reviewed' },
      { status: 500 }
    )
  }
}
