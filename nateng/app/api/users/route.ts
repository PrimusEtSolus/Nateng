import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, role } = body;
  if (!name || !email || !role) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

  try {
    const user = await prisma.user.create({ data: { name, email, role } });
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
