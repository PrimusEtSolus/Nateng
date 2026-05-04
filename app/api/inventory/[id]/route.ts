import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quantity, adjustmentType, reorderLevel, unit, name } = body

    const inventoryItem = await prisma.inventory.findUnique({
      where: { id: parseInt(id) },
    })

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    if (inventoryItem.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const today = new Date()
    let updatedStock = inventoryItem.inStock

    if (quantity !== undefined && adjustmentType) {
      const qty = Number(quantity)
      const delta = adjustmentType === 'increase' ? qty : -qty
      updatedStock = Math.max(0, updatedStock + delta)
    }

    const updateData: any = {
      inStock: updatedStock,
      lastUpdated: today,
    }

    if (adjustmentType === 'increase') {
      updateData.lastOrderDate = today
    }

    if (reorderLevel !== undefined) {
      updateData.reorderLevel = Number(reorderLevel)
    }

    if (unit) {
      updateData.unit = unit
    }

    if (name) {
      updateData.name = name
    }


    const updated = await prisma.inventory.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Inventory PATCH error:', error.message)
    return NextResponse.json({ 
      error: 'Failed to update inventory',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inventoryItem = await prisma.inventory.findUnique({
      where: { id: parseInt(id) },
    })

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    if (inventoryItem.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    
    await prisma.inventory.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Inventory DELETE error:', error.message)
    return NextResponse.json({ 
      error: 'Failed to delete inventory',
      details: error.message 
    }, { status: 500 })
  }
}
