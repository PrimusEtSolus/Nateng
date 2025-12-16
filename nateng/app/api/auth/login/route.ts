import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isUserBanned } from '@/lib/banned-users';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email or mobile number and password are required' }, { status: 400 });
    }

    // Determine if input is email or mobile number
    const isMobile = /^09\d{9}$/.test(email);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isMobile && !isEmail) {
      return NextResponse.json({ error: 'Invalid email or mobile number format' }, { status: 400 });
    }

    // Password length validation
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Find user by email or mobile number
    let user;
    if (isMobile) {
      // For mobile numbers, search by phone field (farmers) or email field (backward compatibility)
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: email },
            { email: email } // Fallback for existing farmers
          ]
        }
      });
    } else {
      // For email addresses, search by email field
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or mobile number or password' }, { status: 401 });
    }

    // Always use bcrypt for password verification
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or mobile number or password' }, { status: 401 });
    }

    // Check if user is banned (from database)
    const banned = await isUserBanned(user.email);
    
    if (banned) {
      return NextResponse.json({ 
        error: 'Your account has been suspended. Please contact an administrator.'
      }, { status: 403 });
    }

    // Return user without password for successful login
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

