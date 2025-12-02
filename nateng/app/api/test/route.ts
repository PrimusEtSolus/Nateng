import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[TEST ROUTE] GET /api/test called');
  return NextResponse.json({ message: 'API is working!', timestamp: new Date().toISOString() });
}
