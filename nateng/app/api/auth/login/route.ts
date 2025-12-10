import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isUserBanned } from '@/lib/banned-users';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // For development: if password is not hashed (old users), check plain text
    // In production, always use bcrypt
    const isValidPassword = user.password.startsWith('$2')
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user is banned (from database)
    const banned = user.isBanned;
    
    if (banned) {
      return NextResponse.json({ 
        error: 'Account suspended. Your account has been banned by administrator. Please submit an appeal at http://localhost:3000/contact if you believe this is an error.',
        isBanned: true
      }, { status: 403 });
    }

    // Return user without password for successful login
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

