import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mongodb';
import Subcategory from '../../../models/Subcategory';

export async function GET() {
  await db.connect();
  const subcategories = await Subcategory.find({});
  return NextResponse.json(subcategories);
}

export async function POST(req: NextRequest) {
  await db.connect();
  const data = await req.json();
  const subcategory = await Subcategory.create(data);
  return NextResponse.json(subcategory, { status: 201 });
}
