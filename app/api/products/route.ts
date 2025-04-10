import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mongodb'; // Import your database connection utility
import Product from '@/models/Product'; // Import your Product model

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.connect(); // Connect to MongoDB
    const products = await Product.find({}); // Fetch all products
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.connect(); // Connect to MongoDB
    const body = await req.json();
    const newProduct = await Product.create(body); // Create a new product in the database
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.connect(); // Connect to MongoDB
    const body = await req.json();
    const { id, ...updatedFields } = body;
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Failed to update product' }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*', // Adjust as needed
      'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}