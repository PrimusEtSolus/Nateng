import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    await prisma.contactMessage.update({
      where: { id: Number(messageId) },
      data: { status: 'reviewed' },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Message marked as reviewed successfully'
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to mark message as reviewed' },
      { status: 500 }
    )
  }
}
