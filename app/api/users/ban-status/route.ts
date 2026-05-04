import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        isBanned: true,
        bannedAt: true,
        banReason: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      isBanned: user.isBanned,
      bannedAt: user.bannedAt?.toISOString(),
      banReason: user.banReason
    })
  } catch (error) {
    console.error('Check ban status error:', error)
    return NextResponse.json(
      { error: 'Failed to check ban status' },
      { status: 500 }
    )
  }
}
