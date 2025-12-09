import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { userId, userEmail } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Update user in database
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        isBanned: false,
        bannedAt: null,
        banReason: null
      }
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'unban',
        actor: userEmail, // This should be the admin email, but we need proper auth
        reason: 'User unbanned by administrator',
        metadata: JSON.stringify({ userName: user.name, userEmail: user.email })
      }
    })
    
    console.log(`User ${user.email} (ID: ${userId}) unbanned in database`)

    return NextResponse.json({ 
      message: 'User unbanned successfully. Access restrictions removed immediately.',
      user: {
        id: user.id,
        email: user.email,
        isBanned: user.isBanned,
        bannedAt: user.bannedAt,
        banReason: user.banReason
      }
    })
  } catch (error) {
    console.error('Unban user error:', error)
    return NextResponse.json(
      { error: 'Failed to unban user' },
      { status: 500 }
    )
  }
}
