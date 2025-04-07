import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  switch (req.method) {
    case "GET":
      try {
        const products = await Product.find();
        res.status(200).json(products);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch products." });
      }
      break;

    case "POST":
      try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
      } catch (error) {
        res.status(500).json({ message: "Failed to create product." });
      }
      break;

    case "PUT":
      try {
        const { id, ...updateData } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json(updatedProduct);
      } catch (error) {
        res.status(500).json({ message: "Failed to update product." });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully." });
      } catch (error) {
        res.status(500).json({ message: "Failed to delete product." });
      }
      break;

    default:
      res.status(405).json({ message: "Method not allowed." });
  }
}