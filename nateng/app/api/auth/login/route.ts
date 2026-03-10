import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isUserBanned } from '@/lib/banned-users';
import { logger } from '@/lib/logger';
import { Validator, Sanitizer } from '@/lib/validation';

export async function POST(req: NextRequest) {
  let email: string = '';
  try {
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
    const passwordValidation = Validator.password(sanitizedPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        error: passwordValidation.errors[0] 
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
    // Create a simple token for authentication (in production, use JWT)
    const token = `token_${user.id}_${Date.now()}`;
    logger.authSuccess('login', userWithoutPassword.id.toString(), user.email);
    return NextResponse.json({ 
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  } catch (error: unknown) {
    logger.authError('login', error, email);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

