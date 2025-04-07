import { NextApiRequest, NextApiResponse } from 'next';

// Mock database for demonstration purposes
const products: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST': {
      // Add a new product
      const newProduct = { id: Date.now().toString(), ...req.body };
      products.push(newProduct);
      return res.status(201).json(newProduct);
    }

    case 'PUT': {
      // Update an existing product
      const { id, ...updatedFields } = req.body;
      const productIndex = products.findIndex((product) => product.id === id);

      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
      }

      products[productIndex] = { ...products[productIndex], ...updatedFields };
      return res.status(200).json(products[productIndex]);
    }

    default:
      res.setHeader('Allow', ['POST', 'PUT']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}