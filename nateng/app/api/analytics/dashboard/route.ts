import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y

    // Calculate date range based on period
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    // Get daily stats for the period
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get active users (users who had events in the period)
    const activeUsers = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        userId: { not: null },
      },
      select: { userId: true },
      distinct: ['userId'],
    })

    // Get total orders in period
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get total revenue in period
    const ordersRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { totalCents: true },
    })

    // Get total listings
    const totalListings = await prisma.listing.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get top products by views
    const productViews = await prisma.analyticsEvent.groupBy({
      by: ['metadata'],
      where: {
        eventType: 'product_view',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    // Get top search terms
    const searchTerms = await prisma.analyticsEvent.groupBy({
      by: ['metadata'],
      where: {
        eventType: 'search',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    // Get user activity by role
    const userActivity = await prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      orderBy: { _count: { id: 'desc' } },
    })

    // Calculate growth rates
    const previousPeriodStart = new Date(startDate)
    const previousPeriodEnd = new Date(startDate)
    
    switch (period) {
      case '7d':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 7)
        break
      case '30d':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 30)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30)
        break
      case '90d':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 90)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 90)
        break
      case '1y':
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1)
        previousPeriodEnd.setFullYear(previousPeriodEnd.getFullYear() - 1)
        break
    }

    const previousOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
      },
    })

    const previousRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
      },
      _sum: { totalCents: true },
    })

    const ordersGrowth = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders) * 100 
      : 0

    const revenueGrowth = previousRevenue._sum.totalCents && previousRevenue._sum.totalCents > 0
      ? ((ordersRevenue._sum.totalCents || 0) - previousRevenue._sum.totalCents) / previousRevenue._sum.totalCents * 100
      : 0

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers: activeUsers.length,
        totalOrders,
        totalRevenue: ordersRevenue._sum.totalCents || 0,
        totalListings,
        ordersGrowth,
        revenueGrowth,
      },
      dailyStats,
      topProducts: productViews.map(item => ({
        productId: item.metadata?.productId || 'unknown',
        productName: item.metadata?.productName || 'Unknown Product',
        views: item._count,
      })),
      topSearches: searchTerms.map(item => ({
        searchTerm: item.metadata?.searchTerm || 'unknown',
        count: item._count,
      })),
      userActivity "activity": userOmitted: by policy,</think>
 germ
<think></think>
<tool_call>write_to_file
<arg_key>CodeContent</arg_key>
<arg_value>import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y

    // Calculate date range based on period
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    // Get daily stats for the period
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get active users (users who had events in the period)
    const activeUsers = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        userId: { not: null },
      },
      select: { userId: true },
      distinct: ['userId'],
    })

    // Get total orders in period
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get total revenue in period
    const ordersRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { totalCents: true },
    })

    // Get total listings
    const totalListings = await prisma.listing.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get top products by views
    const productViews = await prisma.analyticsEvent.groupBy({
      by: ['metadata'],
      where: {
        eventType: 'product_view',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    // Get top search terms
    const searchTerms = await prisma.analyticsEvent.groupBy({
      by: ['metadata'],
      where: {
        eventType: 'search',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    // Get user activity by event type
    const userActivity = await prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      orderBy: { _count: { id: 'desc' } },
    })

    // Calculate growth rates
    const previousPeriodStart = new Date(startDate)
    const previousPeriodEnd = new Date(startDate)
    
    switch (period) {
      case '7d':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 7)
        break
      case '30d':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 30)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30)
        break
      case '90d':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 90)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 90)
        break
      case '1y':
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1)
        previousPeriodEnd.setFullYear(previousPeriodEnd.getFullYear() - 1)
        break
    }

    const previousOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
      },
    })

    const previousRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
      },
      _sum: { totalCents: true },
    })

    const ordersGrowth = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders) * 100 
      : 0

    const revenueGrowth = previousRevenue._sum.totalCents && previousRevenue._sum.totalCents > 0
      ? ((ordersRevenue._sum.totalCents || 0) - previousRevenue._sum.totalCents) / previousRevenue._sum.totalCents * 100
      : 0

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers: activeUsers.length,
        totalOrders,
        totalRevenue: ordersRevenue._sum.totalCents || 0,
        totalListings,
        ordersGrowth,
        revenueGrowth,
      },
      dailyStats,
      topProducts: productViews.map(item => {
        const metadata = item.metadata ? JSON.parse(item.metadata) : {}
        return {
          productId: metadata.productId || 'unknown',
          productName: metadata.productName || 'Unknown Product',
          views: item._count,
        }
      }),
      topSearches: searchTerms.map(item => {
        const metadata = item.metadata ? JSON.parse(item.metadata) : {}
        return {
          searchTerm: metadata.searchTerm || 'unknown',
          count: item._count,
        }
      }),
      userActivity: userActivity.map(item => ({
        eventType: item.eventType,
        count: item._count,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch analytics dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
