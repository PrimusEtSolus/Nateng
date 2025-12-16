import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, stallLocation, municipality, businessType } = await req.json();

    // Input validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, role' },
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

    // Email/Mobile format validation
    if (role === 'farmer') {
      // Farmers use mobile numbers as identifier
      const mobileRegex = /^09\d{9}$/;
      if (!mobileRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid mobile number format. Use format: 09123456789' },
          { status: 400 }
        );
      }
    } else {
      // Other roles use email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    const validRoles = ['farmer', 'buyer', 'business', 'reseller', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
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
          businessType: businessType
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
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

