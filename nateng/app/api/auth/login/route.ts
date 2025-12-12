import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isUserBanned } from '@/lib/banned-users';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Password length validation
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Always use bcrypt for password verification
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
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
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

