import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const userId = params.get('userId');
    const unreadOnly = params.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const where: any = { userId: parseInt(userId) };
    if (unreadOnly) {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { notificationId, read } = await req.json();

    if (!notificationId || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: notificationId, read' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.update({
      where: { id: parseInt(notificationId) },
      data: { read },
    });

    return NextResponse.json(notification);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

