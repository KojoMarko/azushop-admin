import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mongodb';
import Category from '../../../models/Category';

export async function GET() {
  await db.connect();
  const categories = await Category.find({});
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  await db.connect();
  const data = await req.json();
  const category = await Category.create(data);
  return NextResponse.json(category, { status: 201 });
}
