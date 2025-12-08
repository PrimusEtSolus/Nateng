import { NextResponse } from 'next/server'
import { addAppeal, getAppealByUserEmail } from '@/lib/banned-users'

export async function POST(request: Request) {
  try {
    const { userEmail, userName, appealReason, appealDetails } = await request.json()

    if (!userEmail || !userName || !appealReason) {
      return NextResponse.json(
        { error: 'User email, name, and appeal reason are required' },
        { status: 400 }
      )
    }

    // Check if user already has a pending appeal
    const existingAppeal = getAppealByUserEmail(userEmail)
    if (existingAppeal) {
      return NextResponse.json(
        { error: 'You already have a pending appeal. Please wait for the review.' },
        { status: 400 }
      )
    }

    // Create appeal record
    const appealId = addAppeal({
      userEmail,
      userName,
      appealReason,
      appealDetails
    })

    console.log(`New appeal submitted (${appealId}):`, {
      userEmail,
      userName,
      appealReason,
      appealDetails,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    })

    return NextResponse.json({ 
      message: 'Appeal submitted successfully. Your case is under review.',
      appealId
    })
  } catch (error) {
    console.error('Submit appeal error:', error)
    return NextResponse.json(
      { error: 'Failed to submit appeal' },
      { status: 500 }
    )
  }
}
