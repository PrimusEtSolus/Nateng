import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return empty stats for now
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch daily stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, totalUsers, activeUsers, totalOrders, totalRevenue, totalListings } = await request.json()

    // Just log the stats for now
    console.log('Daily Stats:', {
      date,
      totalUsers,
      activeUsers,
      totalOrders,
      totalRevenue,
      totalListings,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update daily stats:', error)
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    )
  }
}
