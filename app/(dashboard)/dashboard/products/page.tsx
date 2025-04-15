"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import { type Product, useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, MoreHorizontal, Search, Edit, Trash } from "lucide-react"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const { products: storedProducts, addProduct, deleteProduct: deleteProductFromStore } = useStore(); // Get products from store and actions

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products");
        response.data.forEach((product: Product) => {
          addProduct(product); 
        });
        console.log("Products in Store after Fetch:", JSON.stringify(storedProducts, null, 2));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (storedProducts.length === 0) { // Check if products are already in the store
      fetchProducts();
    }
  }, [storedProducts, addProduct]);
  
  // Filter products based on search query using the stored products
  const filteredProducts = storedProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Log product IDs to check for duplicates
  console.log('Product IDs:', filteredProducts.map(p => p.id));

  // Handle product deletion
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
  }

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await axios.delete(`/api/products?id=${productToDelete.id}`);
        deleteProductFromStore(productToDelete.id); // Use the Zustand action to delete from the store
        setProductToDelete(null);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Products table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {storedProducts.length === 0 ? (
            <p>No products yet. Add your first product to get started.</p>
          ) : (
            <p>No products match your search.</p>
          )}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredProducts.map((product, idx) => {
  console.log("Product ID for Edit Link:", product.id); // Debugging line
  return (
    <TableRow key={`${product.id}-${idx}`}>
      <TableCell>
        <div className="h-12 w-12 relative">
          <Image
            src={product.image || "/placeholder.svg?height=48&width=48"}
            alt={product.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>${product.price.toFixed(2)}</TableCell>
      <TableCell>
        <span className={product.inventory <= 5 ? "text-red-500 font-medium" : ""}>
          {product.inventory} units
        </span>
      </TableCell>
      <TableCell>{new Date(product.updatedAt).toLocaleDateString()}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={`/dashboard/products/edit/${product.id}`}>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(product)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
})}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

