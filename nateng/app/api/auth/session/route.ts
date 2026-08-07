import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';


export async function GET(request: NextRequest) {
  try {
    // Get token from httpOnly cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Verify JWT token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePhotoUrl: true,
        createdAt: true,
        businessName: true,
        isBanned: true,
      }
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Never return password — select above explicitly omits it
    return NextResponse.json({ user });
  } catch (error: unknown) {
    // Don't leak error details on auth endpoints
    return NextResponse.json({ user: null });
  }
}