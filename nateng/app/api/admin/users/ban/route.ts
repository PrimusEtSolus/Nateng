import { NextResponse } from 'next/server'
import { addBannedUser } from '@/lib/banned-users'

export async function POST(request: Request) {
  try {
    const { userId, reason, userEmail } = await request.json()

    if (!userId || !reason || !userEmail) {
      return NextResponse.json(
        { error: 'User ID, email, and reason are required' },
        { status: 400 }
      )
    }

    // Add user to banned list
    addBannedUser(userEmail)
    
    // Log the ban action for security
    console.log(`User ${userEmail} (ID: ${userId}) banned by admin. Reason: ${reason}`)
    
    // TODO: When schema is properly updated, also update the database:
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { 
    //     isBanned: true,
    //     bannedAt: new Date(),
    //     banReason: reason
    //   }
    // })

    return NextResponse.json({ 
      message: 'User banned successfully. Access restrictions applied immediately.' 
    })
  } catch (error) {
    console.error('Ban user error:', error)
    return NextResponse.json(
      { error: 'Failed to ban user' },
      { status: 500 }
    )
  }
}
