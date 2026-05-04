import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inventory = await prisma.inventory.findMany({
      where: { userId: user.id },
      orderBy: { lastUpdated: 'desc' },
    })

    return NextResponse.json(inventory)
  } catch (error: any) {
    console.error('Inventory GET error:', error.message)
    return NextResponse.json({ 
      error: 'Failed to fetch inventory',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const { name, quantity, unit, reorderLevel, supplier, imageUrl } = body

    if (!name || quantity === undefined || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid input: name and quantity required' }, { status: 400 })
    }

    // Check if item already exists
    const existingItem = await prisma.inventory.findFirst({
      where: {
        userId: user.id,
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })

    const today = new Date()

    if (existingItem) {
      const updated = await prisma.inventory.update({
        where: { id: existingItem.id },
        data: {
          inStock: existingItem.inStock + Number(quantity),
          lastUpdated: today,
          lastOrderDate: today,
          reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : existingItem.reorderLevel,
          unit: unit || existingItem.unit,
          supplier: supplier || existingItem.supplier,
          imageUrl: imageUrl || existingItem.imageUrl,
        },
      })
      return NextResponse.json(updated)
    } else {
      const newItem = await prisma.inventory.create({
        data: {
          userId: user.id,
          name,
          inStock: Number(quantity),
          unit: unit || 'kg',
          reorderLevel: Number(reorderLevel) || 20,
          supplier,
          imageUrl,
          lastOrderDate: today,
          lastUpdated: today,
        },
      })
      return NextResponse.json(newItem)
    }
  } catch (error: any) {
    console.error('Inventory POST error:', error.message)
    return NextResponse.json({ 
      error: 'Failed to add inventory',
      details: error.message 
    }, { status: 500 })
  }
}
