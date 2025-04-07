import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import formidable from "formidable";
import type { Fields, Files } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const form = new formidable.IncomingForm({
    uploadDir: "./public/uploads",
    keepExtensions: true,
  });

  try {
    await connectToDatabase();

    form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ message: "Error processing file upload" });
      }

      const getFieldValue = (field: string | string[] | undefined): string => {
        return Array.isArray(field) ? field[0] : field || "";
      };

      const name = getFieldValue(fields.name);
      const description = getFieldValue(fields.description);
      const price = getFieldValue(fields.price);
      const inventory = getFieldValue(fields.inventory);
      const categoryId = getFieldValue(fields.categoryId);
      const subcategoryId = getFieldValue(fields.subcategoryId);
      const brandId = getFieldValue(fields.brandId);
      const specifications = getFieldValue(fields.specifications);

      if (!name || !price || !inventory || !categoryId || !brandId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const imageFile = files.image;
      let imagePath = "";

      if (imageFile) {
        const file = Array.isArray(imageFile) ? imageFile[0] : imageFile;
        imagePath = `/uploads/${file.newFilename}`;
      }

      const newProduct = new Product({
        name,
        description,
        price: parseFloat(price),
        image: imagePath,
        inventory: parseInt(inventory, 10),
        categoryId,
        subcategoryId,
        brandId,
        specifications: JSON.parse(specifications || "{}"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newProduct.save();

      res.status(201).json({ message: "Product added successfully", product: newProduct });
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}