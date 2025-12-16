import { NextResponse, NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('API called with params:', params)
    console.log('Raw params.id:', params.id)

    const body = await req.json()
    const { action, notes, orderId } = body // action: 'confirm' or 'reject'

    const parsedScheduleId = Number(params.id)
    const hasValidScheduleId = Boolean(params.id) && !isNaN(parsedScheduleId) && parsedScheduleId > 0
    const parsedOrderId = Number(orderId)
    const hasValidOrderId = orderId !== undefined && orderId !== null && !isNaN(parsedOrderId) && parsedOrderId > 0

    console.log('Parsed scheduleId:', parsedScheduleId)
    console.log('Has valid scheduleId?:', hasValidScheduleId)
    console.log('Parsed orderId (body):', parsedOrderId)
    console.log('Has valid orderId?:', hasValidOrderId)

    if (!hasValidScheduleId && !hasValidOrderId) {
      console.error('Invalid schedule ID and no valid orderId fallback:', params.id, orderId)
      return NextResponse.json({ error: 'Invalid schedule ID' }, { status: 400 })
    }

    if (!action || !['confirm', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'action must be either "confirm" or "reject"' 
      }, { status: 400 })
    }

    // Get the schedule with order details using Prisma
    console.log('Looking for schedule with:', hasValidScheduleId ? { id: parsedScheduleId } : { orderId: parsedOrderId })
    const schedule = await prisma.deliverySchedule.findFirst({
      where: hasValidScheduleId ? { id: parsedScheduleId } : { orderId: parsedOrderId },
      include: {
        order: {
          include: {
            buyer: { select: { id: true, name: true, email: true, role: true } },
            seller: { select: { id: true, name: true, email: true, role: true } }
          }
        },
        proposer: { select: { id: true, name: true, email: true, role: true } }
      }
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    if (schedule.status !== 'proposed') {
      return NextResponse.json({ 
        error: 'This schedule has already been processed' 
      }, { status: 400 })
    }

    // Check if user is the other party (not the proposer)
    const isBuyer = schedule.order.buyerId === user.id
    const isSeller = schedule.order.sellerId === user.id
    const isProposer = schedule.proposedBy === user.id

    if (isProposer) {
      return NextResponse.json({ 
        error: 'You cannot confirm your own proposed schedule' 
      }, { status: 403 })
    }

    if (!isBuyer && !isSeller && user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'You can only respond to schedules for orders you are involved in' 
      }, { status: 403 })
    }

    // Update the schedule using Prisma
    const newStatus = action === 'confirm' ? 'confirmed' : 'rejected'
    const confirmedBy = user.id
    
    const updatedSchedule = await prisma.deliverySchedule.update({
      where: { id: schedule.id },
      data: {
        status: newStatus,
        confirmedBy: confirmedBy,
        notes: notes || schedule.notes
      },
      include: {
        order: {
          include: {
            buyer: { select: { id: true, name: true, email: true, role: true } },
            seller: { select: { id: true, name: true, email: true, role: true } }
          }
        },
        proposer: { select: { id: true, name: true, email: true, role: true } },
        confirmer: { select: { id: true, name: true, email: true, role: true } }
      }
    })

    // Create notification for the proposer using Prisma
    const actionText = action === 'confirm' ? 'confirmed' : 'rejected'
    await prisma.notification.create({
      data: {
        userId: schedule.proposedBy,
        type: `schedule_${action}`,
        title: `Delivery Schedule ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
        message: `${user.name} has ${actionText} your delivery schedule proposal for order #${schedule.orderId}`,
        link: `/orders/${schedule.orderId}/schedule`
      }
    })

    // If confirmed, also update the order with the schedule details
    if (action === 'confirm') {
      await prisma.order.update({
        where: { id: schedule.orderId },
        data: {
          scheduledDate: schedule.scheduledDate,
          scheduledTime: schedule.scheduledTime,
          route: schedule.route,
          isCBD: schedule.isCBD,
          truckWeightKg: schedule.truckWeightKg,
          deliveryAddress: schedule.deliveryAddress,
          status: 'CONFIRMED'
        }
      })
    }

    return NextResponse.json(updatedSchedule)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
