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
  } catch (error: unknown) {
    console.error('[DB-CHECK] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      status: 'error', 
      error: message
    }, { status: 500 });
  }
}
