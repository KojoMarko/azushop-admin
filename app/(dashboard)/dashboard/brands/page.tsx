"use client"

import { useState, useEffect } from "react" // Import useEffect
import { useStore, type Brand } from "@/lib/store" // Remove fetchAndSetBrands import
import { fetchBrands } from "@/lib/api"; // Import fetchBrands from the API file
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast, Toaster } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash } from "lucide-react"

export default function BrandsPage() {
  const { brands, products, addBrand, updateBrand, deleteBrand, setBrands } = useStore(); // Assuming you might want a direct setter
  const [brandName, setBrandName] = useState("");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  useEffect(() => {
    console.log("BrandsPage useEffect: Fetching brands...");
    const loadBrands = async () => {
      try {
        const fetchedBrands = await fetchBrands();
        setBrands(fetchedBrands); // Use the setter to update the store
      } catch (error: any) {
        console.error("Error fetching brands:", error);
        toast.error(`Failed to fetch brands: ${error.message || "An unexpected error occurred."}`);
      }
    };

    loadBrands();
  }, [setBrands]); // Include setBrands in the dependency array if it's stable

  // Handle brand actions
  const handleAddBrand = async () => {
    <Toaster />
    if (!brandName.trim()) return;
    try {
      await addBrand({ name: brandName.trim() });
      setBrandName("");
      toast("Brand added successfully.");
    } catch (error: any) {
      toast.error(`Failed to add brand: ${error.message || "An unexpected error occurred."}`);
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand || !brandName.trim()) return;
    try {
      await updateBrand(editingBrand.id, { name: brandName.trim() });
      setEditingBrand(null);
      setBrandName("");
      toast("Brand updated successfully.");
    } catch (error: any) {
      toast.error(`Failed to update brand: ${error.message || "An unexpected error occurred."}`);
    }
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;
    // Check if brand has products
    const hasProducts = products.some((product) => product.brandId === brandToDelete.id);
    if (hasProducts) {
      toast("Cannot delete brand: This brand has associated products.");
      setBrandToDelete(null);
      return;
    }
    try {
      await deleteBrand(brandToDelete.id);
      setBrandToDelete(null);
      toast(`${brandToDelete.name} has been deleted.`);
    } catch (error: any) {
      toast.error(`Failed to delete brand: ${error.message || "An unexpected error occurred."}`);
    }
  };

  const startEditBrand = (brand: Brand) => {
    setEditingBrand(brand)
    setBrandName(brand.name)
  }

  // Count products for a brand
  const countProductsForBrand = (brandId: string) => {
    return products.filter((product) => product.brandId === brandId).length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
        <p className="text-muted-foreground">Manage your product brands</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Brand</CardTitle>
          <CardDescription>Create a new brand for your products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., Apple, Samsung, Nike"
              />
            </div>
            {editingBrand ? (
              <div className="flex gap-2">
                <Button onClick={handleUpdateBrand} disabled={!brandName.trim()}>
                  Update
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingBrand(null)
                    setBrandName("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={handleAddBrand} disabled={!brandName.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Brand
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No brands yet. Add your first brand to get started.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{countProductsForBrand(brand.id)}</TableCell>
                  <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => startEditBrand(brand)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setBrandToDelete(brand)}>
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Brand Dialog */}
      <Dialog open={!!brandToDelete} onOpenChange={(open) => !open && setBrandToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the brand "{brandToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrandToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBrand}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}