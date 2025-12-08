import { NextResponse } from 'next/server'
import { getAppeals, updateAppealStatus } from '@/lib/banned-users'

export async function GET() {
  try {
    const appeals = getAppeals()
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

    const success = updateAppealStatus(appealId, status, adminEmail, adminNotes)

    if (!success) {
      return NextResponse.json(
        { error: 'Appeal not found' },
        { status: 404 }
      )
    }

    console.log(`Appeal ${appealId} ${status} by admin ${adminEmail}`, { adminNotes })

    return NextResponse.json({ 
      message: `Appeal ${status} successfully`,
      status
    })
  } catch (error) {
    console.error('Update appeal error:', error)
    return NextResponse.json(
      { error: 'Failed to update appeal' },
      { status: 500 }
    )
  }
}
