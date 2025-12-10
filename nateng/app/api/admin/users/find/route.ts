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

    // Find user by email using raw SQL
    const users = await prisma.$queryRaw`
      SELECT id, name, email, isBanned, role FROM User 
      WHERE email = ${email}
      LIMIT 1
    `

    if (Array.isArray(users) && users.length > 0) {
      return NextResponse.json({ 
        user: users[0]
      })
    } else {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error finding user:', error)
    return NextResponse.json(
      { error: 'Failed to find user' },
      { status: 500 }
    )
  }
}
