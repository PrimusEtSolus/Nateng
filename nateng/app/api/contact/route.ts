import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, email, message, subject, type } = await request.json()

    if (!name || !email || !message || !subject || !type) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create contact message using raw SQL since Prisma client hasn't been regenerated
    const result = await prisma.$queryRaw`
      INSERT INTO ContactMessage (name, email, subject, message, type, status, createdAt, updatedAt)
      VALUES (${name}, ${email}, ${subject}, ${message}, ${type}, 'pending', datetime('now'), datetime('now'))
      RETURNING id
    `

    console.log(`Contact message received: ${type} from ${email} (${name}) - ID: ${(result as any)[0]?.id}`)

    return NextResponse.json({ 
      success: true,
      message: type === 'appeal' 
        ? 'Appeal submitted successfully. We will review your case and contact you soon.'
        : 'Message sent successfully. We will get back to you soon.',
      id: (result as any)[0]?.id
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('admin')
    
    // Simple admin check (in production, use proper authentication)
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch messages using raw SQL
    const messages = await prisma.$queryRaw`
      SELECT * FROM ContactMessage 
      ORDER BY createdAt DESC
    `

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
