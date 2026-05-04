import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const userId = params.get('userId');
    const conversationWith = params.get('conversationWith');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let messages;
    if (conversationWith) {
      // Get conversation between two users
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: parseInt(userId), receiverId: parseInt(conversationWith) },
            { senderId: parseInt(conversationWith), receiverId: parseInt(userId) },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      // Get all messages for user
      messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: parseInt(userId) }, { receiverId: parseInt(userId) }],
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(messages);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId, content, orderId } = await req.json();

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: senderId, receiverId, content' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        content,
        orderId: orderId ? parseInt(orderId) : null,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: parseInt(receiverId),
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${message.sender.name}`,
        link: `/messages?conversationWith=${senderId}`,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

