import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const stats = await prisma.dailyStats.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 365, // Last year of data
    })

    return NextResponse.json(stats)
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

    const stats = await prisma.dailyStats.upsert({
      where: { date: new Date(date) },
      update: {
        totalUsers,
        activeUsers,
        totalOrders,
        totalRevenue,
        totalListings,
      },
      create: {
        date: new Date(date),
        totalUsers,
        activeUsers,
        totalOrders,
        totalRevenue,
        totalListings,
      },
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to update daily stats:', error)
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    )
  }
}
