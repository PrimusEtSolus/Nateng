import { NextResponse } from 'next/server'
import { removeBannedUser } from '@/lib/banned-users'

export async function POST(request: Request) {
  try {
    const { userId, userEmail } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Remove user from banned list
    removeBannedUser(userEmail)
    
    // Log the unban action for security
    console.log(`User ${userEmail} (ID: ${userId}) unbanned by admin`)
    
    // TODO: When schema is properly updated, also update the database:
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { 
    //     isBanned: false,
    //     bannedAt: null,
    //     banReason: null
    //   }
    // })

    return NextResponse.json({ 
      message: 'User unbanned successfully. Access restrictions removed immediately.' 
    })
  } catch (error) {
    console.error('Unban user error:', error)
    return NextResponse.json(
      { error: 'Failed to unban user' },
      { status: 500 }
    )
  }
}
