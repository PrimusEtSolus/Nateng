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

    const { name, email: userEmail, password, role, stallLocation, municipality, businessType } = await req.json();
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    email = userEmail;

    // Input validation
    if (!name || !password || !role) {
      return NextResponse.json(
        { error: 'Name, password, and role are required' },
        { status: 400 }
      );
    }

    // For farmers, email should be a mobile number
    if (role === 'farmer') {
      const isMobile = /^09\d{9}$/.test(email);
      if (!isMobile) {
        return NextResponse.json(
          { error: 'Invalid mobile number format. Use format: 09xxxxxxxx' },
          { status: 400 }
        );
      }
    } else {
      // For other roles, validate email format
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmail) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Name validation
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters long' },
        { status: 400 }
      );
    }

    const validRoles = ['farmer', 'buyer', 'business', 'reseller', 'admin'];
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
    
    // Password complexity validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, numbers, and special characters' },
        { status: 400 }
      );
    }

    // Check if user already exists (email or phone for farmers)
    let existingUser;
    if (role === 'farmer') {
      // For farmers, check both email and phone fields
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { phone: email } // Farmers register with mobile number as email
          ]
        }
      });
    } else {
      // For other roles, check email only
      existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    }

    if (existingUser) {
      const conflictField = role === 'farmer' && existingUser.phone === email ? 'Mobile number' : 'Email';
      return NextResponse.json({ error: `${conflictField} already registered` }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: role === 'farmer' ? email : email.toLowerCase(), // Farmers keep mobile format, others use lowercase email
        password: hashedPassword,
        role,
        // Save phone number for farmers
        ...(role === 'farmer' && { phone: email }),
        // Save location data based on role
        ...(role === 'farmer' && municipality && { 
          address: municipality,
          city: municipality,
          province: 'Benguet',
          country: 'Philippines'
        }),
        ...(role === 'reseller' && stallLocation && { 
          address: stallLocation
        }),
        ...(role === 'business' && businessType && { 
          address: businessType // Store business type in address field temporarily
        }),
        // Default location data
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
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

