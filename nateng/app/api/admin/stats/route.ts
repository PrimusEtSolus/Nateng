import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get system statistics
    const [totalUsers, totalProducts, totalListings, totalOrders, bannedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.listing.count(),
      prisma.order.count(),
      prisma.user.count({ where: { isBanned: true } })
    ])

    // Get pending appeals count
    const pendingAppeals = await prisma.appeal.count({
      where: { status: 'pending' }
    })

    // Simulate online users count (in production, this would come from a real-time system)
    // For demo purposes, we'll use a random number between 5-20% of total users
    const onlineUsers = Math.floor(totalUsers * (0.05 + Math.random() * 0.15))

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalListings,
      totalOrders,
      onlineUsers,
      bannedUsers,
      pendingAppeals
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
