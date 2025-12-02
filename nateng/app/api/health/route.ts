import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const count = await prisma.product.count();
    return NextResponse.json({ 
      status: 'ok', 
      productsInDatabase: count,
      message: 'Database connection successful'
    });
  } catch (error: any) {
    console.error('[DB-CHECK] Error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
