import { NextResponse, NextRequest } from 'next/server';
import { verifyTwoFactorCode, verifyBackupCode } from '@/lib/two-factor-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, code, useBackupCode } = body;

    if (!userId || !code) {
      return NextResponse.json({ error: 'User ID and verification code are required' }, { status: 400 });
    }

    let result;
    if (useBackupCode) {
      result = verifyBackupCode(userId, code);
    } else {
      result = verifyTwoFactorCode(userId, code);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification successful'
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
