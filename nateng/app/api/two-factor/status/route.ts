import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getTwoFactorStatus, disableTwoFactor } from '@/lib/two-factor-auth';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get 2FA status
    const status = getTwoFactorStatus(user.id);

    return NextResponse.json({
      success: true,
      status: status ? {
        enabled: status.isEnabled,
        createdAt: status.createdAt
      } : {
        enabled: false
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Disable 2FA
    const result = disableTwoFactor(user.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Two-factor authentication disabled successfully'
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
