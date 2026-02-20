import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { createTwoFactorSetup, generateQRCodeData } from '@/lib/two-factor-auth';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Create 2FA setup
    const twoFactorSetup = createTwoFactorSetup(user.id);
    const qrCodeData = generateQRCodeData(user.id);

    return NextResponse.json({
      success: true,
      setup: {
        secret: twoFactorSetup.secret,
        backupCodes: twoFactorSetup.backupCodes,
        qrCodeData
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
