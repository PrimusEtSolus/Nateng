import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { userEmail, userName, appealReason, appealDetails } = await request.json()

    if (!userEmail || !userName || !appealReason) {
      return NextResponse.json(
        { error: 'User email, name, and appeal reason are required' },
        { status: 400 }
      )
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has a pending appeal
    const existingAppeal = await prisma.appeal.findFirst({
      where: {
        userId: user.id,
        status: 'pending'
      }
    })

    if (existingAppeal) {
      return NextResponse.json(
        { error: 'You already have a pending appeal. Please wait for the review.' },
        { status: 400 }
      )
    }

    // Create appeal record
    const appeal = await prisma.appeal.create({
      data: {
        userId: user.id,
        appealReason,
        appealDetails
      }
    })

    console.log(`New appeal submitted (${appeal.id}):`, {
      userEmail,
      userName,
      appealReason,
      appealDetails,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    })

    return NextResponse.json({ 
      message: 'Appeal submitted successfully. Your case is under review.',
      appealId: appeal.id
    })
  } catch (error) {
    console.error('Submit appeal error:', error)
    return NextResponse.json(
      { error: 'Failed to submit appeal' },
      { status: 500 }
    )
  }
}
