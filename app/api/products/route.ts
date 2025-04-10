import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth'; // Import getServerSession
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import { NextAuthOptions } from 'next-auth'; // Import NextAuthOptions if needed



// Mock database for demonstration purposes
const products: any[] = [];

//Get handler for fetching all products
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(products);
}

// POST handler for creating a new product
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions); // Get the session

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const newProduct = { id: Date.now().toString(), ...body };
    products.push(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}

// PUT handler for updating an existing product
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions); // Get the session

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updatedFields } = body;
    const productIndex = products.findIndex((product) => product.id === id);

    if (productIndex === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    products[productIndex] = { ...products[productIndex], ...updatedFields };
    return NextResponse.json(products[productIndex], { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Failed to update product' }, { status: 500 });
  }
}

// OPTIONS handler for handling preflight requests (CORS)
export async function OPTIONS(req: NextRequest) {
  // Handle preflight requests for CORS if needed
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*', // Adjust as needed
      'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { method } = req;

//   switch (method) {
//     case 'POST': {
//       // Add a new product
//       const newProduct = { id: Date.now().toString(), ...req.body };
//       products.push(newProduct);
//       return res.status(201).json(newProduct);
//     }

//     case 'PUT': {
//       // Update an existing product
//       const { id, ...updatedFields } = req.body;
//       const productIndex = products.findIndex((product) => product.id === id);

//       if (productIndex === -1) {
//         return res.status(404).json({ message: 'Product not found' });
//       }

//       products[productIndex] = { ...products[productIndex], ...updatedFields };
//       return res.status(200).json(products[productIndex]);
//     }

//     default:
//       res.setHeader('Allow', ['POST', 'PUT']);
//       return res.status(405).end(`Method ${method} Not Allowed`);
//   }
// }