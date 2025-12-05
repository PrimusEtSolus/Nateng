import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { eventType, userId, sessionId, metadata } = await request.json()

    const event = await prisma.analyticsEvent.create({
      data: {
        eventType,
        userId: userId || null,
        sessionId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Failed to track analytics event:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const eventType = searchParams.get('eventType')
    const userId = searchParams.get('userId')

    const where: any = {}
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }
    if (eventType) where.eventType = eventType
    if (userId) where.userId = parseInt(userId)

    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    // Parse metadata back to JSON
    const eventsWithParsedMetadata = events.map(event => ({
      ...event,
      metadata: event.metadata ? JSON.parse(event.metadata) : null
    }))

    return NextResponse.json(eventsWithParsedMetadata)
  } catch (error) {
    console.error('Failed to fetch analytics events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
