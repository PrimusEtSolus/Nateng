import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { enableTwoFactor } from '@/lib/two-factor-auth';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { verificationCode } = body;

    if (!verificationCode) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    // Enable 2FA
    const result = enableTwoFactor(user.id, verificationCode);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Two-factor authentication enabled successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
