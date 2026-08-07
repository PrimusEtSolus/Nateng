import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, subject, type } = await request.json()

    if (!name || !email || !message || !subject || !type) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const created = await prisma.contactMessage.create({
      data: { name, email, subject, message, type, status: 'pending' },
      select: { id: true },
    })

    return NextResponse.json({ 
      success: true,
      message: type === 'appeal' 
        ? 'Appeal submitted successfully. We will review your case and contact you soon.'
        : 'Message sent successfully. We will get back to you soon.',
      id: created.id
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest) {
  try {
    // No auth required here - the admin page handles frontend auth
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
