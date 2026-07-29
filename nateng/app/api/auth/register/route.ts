import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { generateToken } from '@/lib/jwt';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  let email: string = '';
  try {
    // Rate limiting based on IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = rateLimit(ip, 3, 60 * 60 * 1000); // 3 registrations per hour
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { 
          status: 429,
          headers: getRateLimitHeaders(ip, 3, 60 * 60 * 1000)
        }
      );
    }

    const { name, email: userEmail, password, role, location, municipality, businessType } = await req.json();
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email or mobile number is required' }, { status: 400 });
    }
    email = userEmail.trim();

    // Input validation
    if (!name || !password || !role) {
      return NextResponse.json(
        { error: 'Name, password, and role are required' },
        { status: 400 }
      );
    }

    // Detect if input is email or mobile number (ALL roles can use either)
    const isMobile = /^09\d{9}$/.test(email);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isMobile && !isEmail) {
      return NextResponse.json(
        { error: 'Please enter a valid email address (user@example.com) or mobile number (09123456789)' },
        { status: 400 }
      );
    }

    // Name validation
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters long' },
        { status: 400 }
      );
    }

    const validRoles = ['farmer', 'buyer', 'bulkBuyer', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Determine storage: if mobile, store in phone field and generate placeholder email
    // If email, store lowercased in email field
    let storedEmail: string;
    let storedPhone: string | undefined;

    if (isMobile) {
      // User registered with phone number — generate a unique placeholder email
      storedEmail = `phone_${email}@natenghub.ph`;
      storedPhone = email;
    } else {
      // User registered with email — normalize to lowercase
      storedEmail = email.toLowerCase();
    }

    // Check if user already exists (case-insensitive for email, exact for phone)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: storedEmail, mode: 'insensitive' } },
          ...(storedPhone ? [{ phone: storedPhone }] : []),
          // Also check if the raw input matches an existing phone or email
          { phone: email },
          { email: { equals: email, mode: 'insensitive' } },
        ]
      }
    });

    if (existingUser) {
      const conflictField = existingUser.phone === email ? 'Mobile number' : 'Email';
      return NextResponse.json({ error: `${conflictField} already registered` }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: storedEmail,
        password: hashedPassword,
        role,
        // Save phone number if provided
        ...(storedPhone && { phone: storedPhone }),
        // Save location data based on role
        ...(role === 'farmer' && municipality && { 
          address: municipality,
          city: municipality,
          province: 'Benguet',
          country: 'Philippines'
        }),
        // Save location for bulkBuyer
        ...(role === 'bulkBuyer' && location && {
          address: location,
          city: location,
          province: 'Benguet',
          country: 'Philippines'
        }),
        // Save business name for bulkBuyer
        ...(role === 'bulkBuyer' && businessType && {
          businessName: businessType
        }),
        // Default location data for buyer
        ...(role === 'buyer' && {
          city: 'Baguio',
          province: 'Benguet', 
          country: 'Philippines'
        }),
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // Set httpOnly cookie for security
    const response = NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    logger.authSuccess('register', userWithoutPassword.id.toString(), email);
    return response;
  } catch (error: unknown) {
    logger.authError('register', error, email);
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Email or phone number already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}