"use client"

import type React from "react"
import axios from "axios"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useStore, type Product } from "@/lib/store" // Ensure store provides unique IDs
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImagePlus } from "lucide-react"
import { RichTextEditor } from "@/components/rich-text-editor"
import { SpecificationsEditor } from "@/components/specifications-editor"

interface ProductFormProps {
  product?: Product
  isEditing?: boolean
}

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const { categories, subcategories, brands } = useStore() // <<< PROBLEM IS LIKELY IN THE DATA HERE

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "", // Ensure `image` is included here
    inventory: "",
    categoryId: "",
    subcategoryId: "",
    brandId: "",
    specifications: {} as Record<string, string>,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null); // For previewing existing or newly uploaded images

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
    inventory: "",
    categoryId: "",
    brandId: "",
    image: "", // Add image error state if needed
  })

  // --- Debugging useEffect to check category data ---
  useEffect(() => {
    console.log("Raw Categories data from store:", JSON.stringify(categories, null, 2));
    if (categories && categories.length > 0) {
        const ids = categories.map(c => c.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
          console.error("🔴 DUPLICATE CATEGORY IDs DETECTED IN categories ARRAY:", categories);
          // Find the duplicates
          const duplicateIds = ids.filter((item, index) => ids.indexOf(item) !== index);
          console.error("🔴 Duplicate IDs:", duplicateIds);
        } else {
          console.log("🟢 No duplicate category IDs found.");
        }
    }
  }, [categories]);
  // --- End Debugging useEffect ---

  // Filter subcategories based on selected category
  const filteredSubcategories = subcategories.filter((sub) => sub.categoryId === formData.categoryId)

  // Load product data if editing
  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image: product.image || "", // Keep existing image URL if editing
        inventory: product.inventory.toString(),
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || "", // Ensure subcategoryId is handled
        brandId: product.brandId,
        specifications: product.specifications || {},
      })
      // Set initial image preview if editing and image exists
      if (product.image) {
        setImageUrl(product.image);
      }
    }
  }, [isEditing, product])

  // Effect to create object URL for previewing newly selected file
  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImageUrl(objectUrl);

      // Clean up the object URL when the component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else if (isEditing && product?.image) {
        // If file is cleared, revert to original image if editing
        setImageUrl(product.image);
    } else {
        setImageUrl(null); // Clear preview if no file and not editing/no original image
    }
  }, [imageFile, isEditing, product]);


  const validateForm = () => {
    let valid = true
    const newErrors = {
      name: "",
      description: "",
      price: "",
      inventory: "",
      categoryId: "",
      brandId: "",
      image: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
      valid = false
    }

    // Add validation for description if needed (e.g., minimum length)
    // For now, just checking if it exists (though RichTextEditor might handle empty state)
    if (!formData.description || formData.description === '<p><br></p>' || formData.description.trim() === "") {
       // Example check for empty state from some rich text editors
       // newErrors.description = "Product description is required"
       // valid = false
       // Decide if description is truly mandatory
    }


    if (!formData.price.trim()) {
      newErrors.price = "Price is required"
      valid = false
    } else if (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number"
      valid = false
    }

    if (!formData.inventory.trim()) {
      newErrors.inventory = "Inventory quantity is required"
      valid = false
    } else if (isNaN(Number.parseInt(formData.inventory)) || Number.parseInt(formData.inventory) < 0) {
      newErrors.inventory = "Inventory must be a non-negative integer"
      valid = false
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required"
      valid = false
    }

    if (!formData.brandId) {
      newErrors.brandId = "Brand is required"
      valid = false
    }

    // Add image validation if needed (e.g., required for new products)
    // if (!isEditing && !imageFile) {
    //   newErrors.image = "Product image is required";
    //   valid = false;
    // }

    setErrors(newErrors)
    return valid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    console.log(`handleSelectChange called with name: ${name}, value: ${value}`);
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      // If changing category, reset subcategory
      if (name === "categoryId") {
        newState.subcategoryId = "";
      }
      return newState;
    });

    // Clear error when user selects
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }))

    // Clear description error if user interacts
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: "" }))
    }
  }

  const handleSpecificationsChange = (value: Record<string, string>) => {
    setFormData((prev) => ({ ...prev, specifications: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file) // Store the File object

     // Clear image error if user interacts
     if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }))
      }
  }

  // Function to upload image to Cloudinary (or your storage)
  const uploadImage = async (file: File): Promise<string | null> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!); // Ensure you have this preset in Cloudinary and the env variable set

      try {
          const response = await axios.post(
              `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/image/upload`, // Ensure you have cloud name env var
              formData
          );
          return response.data.secure_url; // Return the URL of the uploaded image
      } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Image upload failed. Please try again.");
          return null;
      }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    let uploadedImageUrl = formData.image; // Keep existing image URL by default

    // If a new file was selected, upload it
    if (imageFile) {
        const result = await uploadImage(imageFile);
        if (!result) {
            // Upload failed, error already shown by uploadImage function
            return;
        }
        uploadedImageUrl = result; // Use the new image URL
    }


    try {
      // Use correct types for price and inventory
      const productData = {
        name: formData.name.trim(),
        description: formData.description, // Assuming RichTextEditor provides safe HTML or markdown
        price: parseFloat(formData.price),
        inventory: parseInt(formData.inventory, 10),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || null, // Send null if empty
        brandId: formData.brandId,
        specifications: formData.specifications,
        image: uploadedImageUrl, // Use the potentially updated image URL
      };

      if (isEditing && product) {
        // Make sure your API can handle receiving 'id' in the payload for PUT
        await axios.put("/api/products", { id: product.id, ...productData });
        toast.success(`Product "${productData.name}" has been updated successfully.`);
      } else {
        await axios.post("/api/products", productData);
        toast.success(`Product "${productData.name}" has been added successfully.`);
      }

      router.push("/dashboard/products"); // Navigate back to product list
      router.refresh(); // Optional: Force refresh of the product list page data

    } catch (error: any) {
      console.error("Error saving product:", error);
      const errorMessage = error.response?.data?.message || "There was an error saving the product.";
      toast.error(errorMessage);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="description">Description & Specs</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleSelectChange("categoryId", value)}
                    name="categoryId"
                >
                  <SelectTrigger id="categoryId" className={errors.categoryId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      // This key generation is correct.
                      // Ensure category.id is unique in the `categories` array itself.
                      <SelectItem key={`category-${category.id}`} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategoryId">Subcategory (Optional)</Label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(value) => handleSelectChange("subcategoryId", value)}
                  disabled={!formData.categoryId || filteredSubcategories.length === 0}
                  name="subcategoryId"
                >
                  <SelectTrigger id="subcategoryId">
                    <SelectValue
                      placeholder={
                        !formData.categoryId
                          ? "Select a category first"
                          : filteredSubcategories.length === 0
                            ? "No subcategories available"
                            : "Select subcategory"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubcategories.map((subcategory) => (
                      <SelectItem key={`subcategory-${subcategory.id}`} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 {/* No error message needed if optional */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandId">Brand</Label>
                <Select
                    value={formData.brandId}
                    onValueChange={(value) => handleSelectChange("brandId", value)}
                    name="brandId"
                >
                  <SelectTrigger id="brandId" className={errors.brandId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={`brand-${brand.id}`} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.brandId && <p className="text-sm text-red-500">{errors.brandId}</p>}
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01" // Price should be positive
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventory">Inventory</Label>
                  <Input
                    id="inventory"
                    name="inventory"
                    type="number"
                    step="1" // Inventory should be whole numbers
                    min="0"
                    value={formData.inventory}
                    onChange={handleChange}
                    placeholder="0"
                    className={errors.inventory ? "border-red-500" : ""}
                  />
                  {errors.inventory && <p className="text-sm text-red-500">{errors.inventory}</p>}
                </div>
              </div>
              {/* Add other fields for column 2 if needed */}
            </div>
          </div>
        </TabsContent>

        {/* Description & Specs Tab */}
        <TabsContent value="description" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Enter detailed product description..."
                minHeight="200px" // Example min height
              />
              {/* You might want less strict validation here, or none if optional */}
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2 pt-4">
              <Label>Specifications (Optional)</Label>
              <SpecificationsEditor
                value={formData.specifications}
                onChange={handleSpecificationsChange}
               />
            </div>
          </div>
        </TabsContent>

        {/* Image Tab */}
        <TabsContent value="image" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Product Image</Label>
              <Input
                id="image-upload" // Changed ID slightly to avoid conflict if reusing 'image'
                name="imageFile" // Changed name to reflect it's the file input
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp" // Be specific about accepted types
                onChange={handleFileChange}
                className={errors.image ? "border-red-500" : ""}
              />
              {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
              <p className="text-xs text-muted-foreground">
                Upload a new image or replace the existing one (if editing). JPG, PNG, GIF, WEBP accepted.
              </p>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {imageUrl ? (
                  <div className="relative aspect-square w-full max-w-md mx-auto"> {/* Added max-width and centering */}
                    <Image
                      src={imageUrl} // Use the state variable for preview URL
                      alt="Product preview"
                      fill
                      className="object-contain" // Changed to contain to see the whole image
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center aspect-square bg-muted max-w-md mx-auto"> {/* Added max-width and centering */}
                    <div className="text-center p-4">
                      <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Image preview will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>
          Cancel
        </Button>
        <Button type="submit">{isEditing ? "Update Product" : "Add Product"}</Button>
      </div>
    </form>
  )
}