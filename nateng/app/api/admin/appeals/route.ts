import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const appeals = await prisma.appeal.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isBanned: true,
            bannedAt: true,
            banReason: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json(appeals)
  } catch (error) {
    console.error('Get appeals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appeals' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { appealId, status, adminEmail, adminNotes } = await request.json()

    if (!appealId || !status || !adminEmail) {
      return NextResponse.json(
        { error: 'Appeal ID, status, and admin email are required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either approved or rejected' },
        { status: 400 }
      )
    }

    // Get the appeal with user info
    const appeal = await prisma.appeal.findUnique({
      where: { id: appealId },
      include: { user: true }
    })

    if (!appeal) {
      return NextResponse.json(
        { error: 'Appeal not found' },
        { status: 404 }
      )
    }

    // Update appeal status
    const updatedAppeal = await prisma.appeal.update({
      where: { id: appealId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: adminEmail,
        adminNotes
      }
    })

    // If approved, unban the user
    if (status === 'approved' && appeal.user) {
      await prisma.user.update({
        where: { id: appeal.userId },
        data: {
          isBanned: false,
          bannedAt: null,
          banReason: null
        }
      })
    }

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: appeal.userId,
        action: status === 'approved' ? 'approve_appeal' : 'reject_appeal',
        actor: adminEmail,
        reason: adminNotes || `Appeal ${status}`,
        metadata: JSON.stringify({
          appealId,
          userName: appeal.user?.name,
          userEmail: appeal.user?.email,
          appealReason: appeal.appealReason,
          adminNotes
        })
      }
    })

    console.log(`Appeal ${appealId} ${status} by admin ${adminEmail}`, { adminNotes })

    return NextResponse.json({ 
      message: `Appeal ${status} successfully`,
      status,
      appeal: updatedAppeal
    })
  } catch (error) {
    console.error('Update appeal error:', error)
    return NextResponse.json(
      { error: 'Failed to update appeal' },
      { status: 500 }
    )
  }
}
