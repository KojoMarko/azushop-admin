import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mongodb';
import Brand from '@/models/Brand';

export async function GET() {
  await db.connect();
  const brands = await Brand.find({});
  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  await db.connect();
  const data = await req.json();
  const brand = await Brand.create(data);
  return NextResponse.json(brand, { status: 201 });
}
