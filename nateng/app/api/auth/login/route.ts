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

    // Check if user is banned
    const banned = isUserBanned(email.toLowerCase());
    
    // Return user without password, but include ban status
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ 
      user: {
        ...userWithoutPassword,
        isBanned: banned
      },
      message: banned ? 'Account suspended. Limited access available for appeals.' : 'Login successful'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

