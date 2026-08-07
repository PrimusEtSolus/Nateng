import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { handleError } from '@/lib/api-error'
import { AdminUnbanSchema } from '@/lib/validation-schemas'

export async function POST(request: Request) {
  try {
    // ── Authentication: admin only ──
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied — admin only' }, { status: 403 });
    }

    const body = await request.json();

    // ── Input validation with Zod ──
    const parsed = AdminUnbanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    // Use the authenticated admin's email as the actor instead of trusting client input
    const actorEmail = currentUser.email;

    // Update user in database
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        isBanned: false,
        bannedAt: null,
        banReason: null
      }
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'unban',
        actor: actorEmail,
        reason: 'User unbanned by administrator',
        metadata: JSON.stringify({ userName: user.name, userEmail: user.email })
      }
    })
    
    logger.info(`User ${user.email} (ID: ${userId}) unbanned in database`)

    return NextResponse.json({ 
      message: 'User unbanned successfully. Access restrictions removed immediately.',
      user: {
        id: user.id,
        email: user.email,
        isBanned: user.isBanned,
        bannedAt: user.bannedAt,
        banReason: user.banReason
      }
    })
  } catch (error: unknown) {
    logger.error('Unban user error', { error })
    return handleError(error, 'POST /api/admin/users/unban');
  }
}