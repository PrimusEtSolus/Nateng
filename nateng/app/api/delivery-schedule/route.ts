import { NextResponse, NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const params = new URL(req.url).searchParams
    const orderId = params.get('orderId')
    const status = params.get('status')

    const where: Record<string, unknown> = {}
    
    // Users can only see schedules for their own orders
    if (user.role !== 'admin') {
      where.OR = [
        { order: { buyerId: user.id } },
        { order: { sellerId: user.id } },
        { proposedBy: user.id },
        { confirmedBy: user.id }
      ]
    }

    if (orderId) where.orderId = Number(orderId)
    if (status) where.status = status

    const schedules = await prisma.deliverySchedule.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        order: {
          include: {
            buyer: { select: { id: true, name: true, email: true, role: true } },
            seller: { select: { id: true, name: true, email: true, role: true } },
            items: {
              include: {
                listing: {
                  include: {
                    product: { select: { id: true, name: true } }
                  }
                }
              }
            }
          }
        },
        proposer: { select: { id: true, name: true, email: true, role: true } },
        confirmer: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(schedules)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      orderId, 
      scheduledDate, 
      scheduledTime, 
      route, 
      isCBD, 
      truckWeightKg, 
      deliveryAddress, 
      notes 
    } = body

    if (!orderId || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ 
        error: 'orderId, scheduledDate, and scheduledTime are required' 
      }, { status: 400 })
    }

    // Verify the user is involved in this order
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        buyer: { select: { id: true } },
        seller: { select: { id: true } }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if user is buyer or seller
    const isBuyer = order.buyerId === user.id
    const isSeller = order.sellerId === user.id

    if (!isBuyer && !isSeller && user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'You can only propose schedules for orders you are involved in' 
      }, { status: 403 })
    }

    // Check if there's already a proposed schedule for this order
    const existingSchedule = await prisma.deliverySchedule.findFirst({
      where: {
        orderId: Number(orderId),
        status: 'proposed'
      }
    })

    if (existingSchedule) {
      return NextResponse.json({ 
        error: 'There is already a proposed schedule for this order' 
      }, { status: 400 })
    }

    const schedule = await prisma.deliverySchedule.create({
      data: {
        orderId: Number(orderId),
        proposedBy: user.id,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        route: route || null,
        isCBD: Boolean(isCBD),
        truckWeightKg: truckWeightKg ? Number(truckWeightKg) : null,
        deliveryAddress: deliveryAddress || null,
        notes: notes || null,
        status: 'proposed'
      },
      include: {
        order: {
          include: {
            buyer: { select: { id: true, name: true, email: true } },
            seller: { select: { id: true, name: true, email: true } }
          }
        },
        proposer: { select: { id: true, name: true, email: true } }
      }
    })

    // Create notification for the other party
    const notificationRecipientId = isBuyer ? order.sellerId : order.buyerId
    const recipientRole = isBuyer ? 'seller' : 'buyer'
    
    await prisma.notification.create({
      data: {
        userId: notificationRecipientId,
        type: 'schedule_proposed',
        title: 'Delivery Schedule Proposed',
        message: `${user.name} has proposed a delivery schedule for order #${orderId}`,
        link: `/orders/${orderId}/schedule`,
      }
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
