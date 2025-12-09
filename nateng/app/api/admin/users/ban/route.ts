import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { userId, reason, userEmail } = await request.json()

    if (!userId || !reason || !userEmail) {
      return NextResponse.json(
        { error: 'User ID, email, and reason are required' },
        { status: 400 }
      )
    }

    // Update user in database
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason
      }
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'ban',
        actor: userEmail, // This should be the admin email, but we need proper auth
        reason: reason,
        metadata: JSON.stringify({ userName: user.name, userEmail: user.email })
      }
    })
    
    console.log(`User ${user.email} (ID: ${userId}) banned in database. Reason: ${reason}`)

    return NextResponse.json({ 
      message: 'User banned successfully. Access restrictions applied immediately.',
      user: {
        id: user.id,
        email: user.email,
        isBanned: user.isBanned,
        bannedAt: user.bannedAt,
        banReason: user.banReason
      }
    })
  } catch (error) {
    console.error('Ban user error:', error)
    return NextResponse.json(
      { error: 'Failed to ban user' },
      { status: 500 }
    )
  }
}
