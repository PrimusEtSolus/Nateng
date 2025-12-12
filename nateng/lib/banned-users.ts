// Server-side ban management using database
// This replaces the in-memory system with proper database persistence

import prisma from './prisma';

export async function addBannedUser(email: string, reason?: string, adminEmail?: string): Promise<void> {
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: {
      isBanned: true,
      bannedAt: new Date(),
      banReason: reason || 'Banned by administrator'
    }
  });

  // Create audit log
  if (adminEmail) {
    await prisma.auditLog.create({
      data: {
        action: 'ban',
        actor: adminEmail,
        reason: reason || 'Banned by administrator',
        metadata: JSON.stringify({ email })
      }
    });
  }
}

export async function removeBannedUser(email: string, adminEmail?: string): Promise<void> {
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: {
      isBanned: false,
      bannedAt: null,
      banReason: null
    }
  });

  // Create audit log
  if (adminEmail) {
    await prisma.auditLog.create({
      data: {
        action: 'unban',
        actor: adminEmail,
        reason: 'User unbanned',
        metadata: JSON.stringify({ email })
      }
    });
  }
}

export async function isUserBanned(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { isBanned: true }
  });
  return user?.isBanned || false;
}

export async function getBannedUsers(): Promise<Array<{email: string, bannedAt: Date | null, banReason: string | null}>> {
  const bannedUsers = await prisma.user.findMany({
    where: { isBanned: true },
    select: { email: true, bannedAt: true, banReason: true }
  });
  return bannedUsers;
}

// Appeals system using database
export async function addAppeal(appeal: {
  userId: number;
  appealReason: string;
  appealDetails?: string;
}): Promise<string> {
  const newAppeal = await prisma.appeal.create({
    data: {
      userId: appeal.userId,
      appealReason: appeal.appealReason,
      appealDetails: appeal.appealDetails,
      status: 'pending'
    }
  });
  return newAppeal.id.toString();
}

export async function getAppeals(): Promise<Array<{
  id: number;
  userId: number;
  user: { name: string; email: string };
  appealReason: string;
  appealDetails: string | null;
  status: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  adminNotes: string | null;
}>> {
  const appeals = await prisma.appeal.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: { submittedAt: 'desc' }
  });
  return appeals;
}

export async function updateAppealStatus(
  appealId: string, 
  status: 'approved' | 'rejected', 
  adminEmail: string, 
  adminNotes?: string
): Promise<boolean> {
  const appealIdNum = parseInt(appealId);
  if (isNaN(appealIdNum)) return false;

  const appeal = await prisma.appeal.findUnique({
    where: { id: appealIdNum },
    include: { user: true }
  });

  if (!appeal) return false;

  await prisma.appeal.update({
    where: { id: appealIdNum },
    data: {
      status,
      reviewedAt: new Date(),
      reviewedBy: adminEmail,
      adminNotes: adminNotes || null
    }
  });

  // If approved, unban the user
  if (status === 'approved' && appeal.user) {
    await removeBannedUser(appeal.user.email, adminEmail);
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      action: status === 'approved' ? 'approve_appeal' : 'reject_appeal',
      actor: adminEmail,
      reason: adminNotes || `Appeal ${status}`,
      metadata: JSON.stringify({ appealId, userId: appeal.userId })
    }
  });

  return true;
}

export async function getAppealByUserId(userId: number): Promise<{
  id: number;
  userId: number;
  appealReason: string;
  appealDetails: string | null;
  status: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  adminNotes: string | null;
} | null> {
  const appeal = await prisma.appeal.findFirst({
    where: { 
      userId,
      status: 'pending'
    }
  });
  return appeal;
}
