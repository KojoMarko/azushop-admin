// app\api\subcategories\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mongodb';
import Subcategory from '../../../../models/Subcategory';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  await db.connect();
  try {
    const data = await req.json();
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(id, data, { new: true });
    if (!updatedSubcategory) {
      return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });
    }
    return NextResponse.json(updatedSubcategory);
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json({ message: 'Failed to update subcategory' }, { status: 500 });
  }
}