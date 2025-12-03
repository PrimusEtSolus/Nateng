import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateDeliverySchedule, requiresTruckBanCompliance } from '@/lib/truck-ban';

/**
 * PATCH /api/orders/[id]/schedule
 * Schedule delivery for an order with truck ban compliance validation
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = Number(params.id);
    
    // Validate order ID
    if (isNaN(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      scheduledDate,
      scheduledTime,
      route,
      isCBD,
      truckWeightKg,
      deliveryAddress,
      isExempt,
      exemptionType,
    } = body;

    // Validate required fields
    if (!scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: 'scheduledDate and scheduledTime are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const scheduledDateObj = new Date(scheduledDate);
    if (isNaN(scheduledDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduledDate format' },
        { status: 400 }
      );
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(scheduledTime)) {
      return NextResponse.json(
        { error: 'Invalid scheduledTime format. Expected HH:mm format' },
        { status: 400 }
      );
    }

    // Validate truck weight
    if (truckWeightKg === undefined || truckWeightKg === null) {
      return NextResponse.json(
        { error: 'truckWeightKg is required' },
        { status: 400 }
      );
    }

    const weight = Number(truckWeightKg);
    if (isNaN(weight) || weight < 0) {
      return NextResponse.json(
        { error: 'truckWeightKg must be a positive number' },
        { status: 400 }
      );
    }

    // Validate exemption
    if (isExempt && !exemptionType) {
      return NextResponse.json(
        { error: 'exemptionType is required when isExempt is true' },
        { status: 400 }
      );
    }

    // Check if truck requires compliance
    if (requiresTruckBanCompliance(weight) && !isExempt) {
      // Validate against truck ban
      try {
        const validation = validateDeliverySchedule({
          date: scheduledDateObj,
          time: scheduledTime,
          route: route || '',
          isCBD: Boolean(isCBD),
          truckWeightKg: weight,
          isExempt: Boolean(isExempt),
          exemptionType: exemptionType || null,
        });

        if (!validation.isValid) {
          return NextResponse.json(
            {
              error: 'Truck ban violation',
              violations: validation.violations,
              warnings: validation.warnings,
              suggestions: validation.suggestions,
            },
            { status: 400 }
          );
        }
      } catch (validationError: any) {
        return NextResponse.json(
          { error: validationError.message || 'Validation error' },
          { status: 400 }
        );
      }
    }

    // Update order with delivery schedule
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        scheduledDate: scheduledDateObj,
        scheduledTime,
        route: route || null,
        isCBD: Boolean(isCBD),
        truckWeightKg: weight,
        deliveryAddress: deliveryAddress || null,
        isExempt: Boolean(isExempt),
        exemptionType: exemptionType || null,
      },
      include: {
        buyer: true,
        seller: true,
        items: {
          include: {
            listing: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('Error scheduling delivery:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule delivery' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/[id]/schedule
 * Get delivery schedule for an order
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = Number(params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        scheduledDate: true,
        scheduledTime: true,
        route: true,
        isCBD: true,
        truckWeightKg: true,
        deliveryAddress: true,
        isExempt: true,
        exemptionType: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error fetching delivery schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch delivery schedule' },
      { status: 500 }
    );
  }
}

