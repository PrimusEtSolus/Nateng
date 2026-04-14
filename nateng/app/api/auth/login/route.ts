import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isUserBanned } from '@/lib/banned-users';
import { logger } from '@/lib/logger';
import { Validator, Sanitizer } from '@/lib/validation';
import { generateToken } from '@/lib/jwt';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  let email: string = '';
  try {
    // Rate limiting based on IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = rateLimit(ip, 5, 15 * 60 * 1000); // 5 requests per 15 minutes
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: getRateLimitHeaders(ip, 5, 15 * 60 * 1000)
        }
      );
    }

    const { email: userEmail, password } = await req.json();
    
    // Sanitize inputs
    email = Sanitizer.string(userEmail);
    const sanitizedPassword = Sanitizer.string(password);

    // Validate required fields
    const requiredValidation = Validator.combine(
      Validator.required(email, 'Email or mobile number'),
      Validator.required(sanitizedPassword, 'Password')
    );
    
    if (!requiredValidation.isValid) {
      return NextResponse.json({ 
        error: requiredValidation.errors[0] 
      }, { status: 400 });
    }

    // Determine if input is email or mobile number and validate accordingly
    const isMobile = /^09\d{9}$/.test(email);
    const validation = isMobile ? Validator.mobileNumber(email) : Validator.email(email);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: validation.errors[0] 
      }, { status: 400 });
    }

    // Password validation
    if (sanitizedPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
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
    const isValidPassword = await bcrypt.compare(sanitizedPassword, user.password);

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
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // Set httpOnly cookie for security
    const response = NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Login successful'
    });
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    logger.authSuccess('login', userWithoutPassword.id.toString(), user.email);
    return response;
  } catch (error: unknown) {
    logger.authError('login', error, email);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

