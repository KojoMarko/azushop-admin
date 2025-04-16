import axios from "axios";
import { Category, Brand, Subcategory, Product } from "@/lib/store";

// ======================
// Categories
// ======================

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await axios.get("/api/categories");
  return data.map((cat: any) => ({
    ...cat,
    id: cat._id?.toString() || cat.id,
  }));
};

export const createCategory = async (category: Partial<Category>) => {
  const { data } = await axios.post("/api/categories", category);
  return {
    ...data,
    id: data._id?.toString() || data.id,
  };
};

// ======================
// Subcategories
// ======================

export const fetchSubcategories = async (): Promise<Subcategory[]> => {
  const { data } = await axios.get("/api/subcategories");
  return data.map((sub: any) => ({
    ...sub,
    id: sub._id?.toString() || sub.id,
  }));
};

export const createSubcategory = async (subcategory: Partial<Subcategory>) => {
  const { data } = await axios.post("/api/subcategories", subcategory);
  return {
    ...data,
    id: data._id?.toString() || data.id,
  };
};

// ======================
// Brands
// ======================

export const fetchBrands = async (): Promise<Brand[]> => {
  const { data } = await axios.get("/api/brands");
  return data.map((brand: any) => ({
    ...brand,
    id: brand._id?.toString() || brand.id,
  }));
};

export const createBrand = async (brand: Partial<Brand>) => {
  const { data } = await axios.post("/api/brands", brand);
  return {
    ...data,
    id: data._id?.toString() || data.id,
  };
};

// ======================
// Products (optional future)
// ======================

export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get("/api/products");
  return data.map((product: any) => ({
    ...product,
    id: product._id?.toString() || product.id,
  }));
};

export const createProduct = async (product: Partial<Product>) => {
  const { data } = await axios.post("/api/products", product);
  return {
    ...data,
    id: data._id?.toString() || data.id,
  };
};
