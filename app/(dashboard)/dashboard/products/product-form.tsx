"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useStore, type Product } from "@/lib/store"
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
  const { addProduct, updateProduct, categories, subcategories, brands } = useStore()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    inventory: "",
    categoryId: "",
    subcategoryId: "",
    brandId: "",
    specifications: {} as Record<string, string>,
  })

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
    inventory: "",
    categoryId: "",
    brandId: "",
  })

  // Filter subcategories based on selected category
  const filteredSubcategories = subcategories.filter((sub) => sub.categoryId === formData.categoryId)

  // Load product data if editing
  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image: product.image,
        inventory: product.inventory.toString(),
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        brandId: product.brandId,
        specifications: product.specifications || {},
      })
    }
  }, [isEditing, product])

  const validateForm = () => {
    let valid = true
    const newErrors = {
      name: "",
      description: "",
      price: "",
      inventory: "",
      categoryId: "",
      brandId: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
      valid = false
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product description is required"
      valid = false
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
      newErrors.inventory = "Inventory must be a non-negative number"
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

    setErrors(newErrors)
    return valid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // If changing category, reset subcategory
    if (name === "categoryId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        subcategoryId: "",
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    // If changing category, reset subcategory
    if (name === "categoryId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        subcategoryId: "",
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when user selects
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }))

    // Clear error when user types
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: "" }))
    }
  }

  const handleSpecificationsChange = (value: Record<string, string>) => {
    setFormData((prev) => ({ ...prev, specifications: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        image: formData.image || "/placeholder.svg?height=200&width=200",
        inventory: Number.parseInt(formData.inventory),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        brandId: formData.brandId,
        specifications: formData.specifications,
      }

      if (isEditing && product) {
        updateProduct(product.id, productData)
        toast.success(`${productData.name} has been updated successfully.`)
      } else {
        addProduct(productData)
        toast.success(`${productData.name} has been added to your catalog.`)
      }

      router.push("/dashboard/products")
    } catch (error) {
      toast.error("There was an error saving the product.")
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

        <TabsContent value="basic" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
                  <SelectTrigger id="categoryId" className={errors.categoryId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategoryId">Subcategory</Label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(value) => handleSelectChange("subcategoryId", value)}
                  disabled={!formData.categoryId || filteredSubcategories.length === 0}
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
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandId">Brand</Label>
                <Select value={formData.brandId} onValueChange={(value) => handleSelectChange("brandId", value)}>
                  <SelectTrigger id="brandId" className={errors.brandId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.brandId && <p className="text-sm text-red-500">{errors.brandId}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
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
                    min="0"
                    value={formData.inventory}
                    onChange={handleChange}
                    placeholder="0"
                    className={errors.inventory ? "border-red-500" : ""}
                  />
                  {errors.inventory && <p className="text-sm text-red-500">{errors.inventory}</p>}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="description" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Enter product description"
                minHeight="200px"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2 pt-4">
              <Label>Specifications</Label>
              <SpecificationsEditor value={formData.specifications} onChange={handleSpecificationsChange} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Product Image URL</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL for the product image, or leave blank for a placeholder
              </p>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {formData.image ? (
                  <div className="relative aspect-square w-full">
                    <Image
                      src={formData.image || "/placeholder.svg"}
                      alt="Product preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center aspect-square bg-muted">
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

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>
          Cancel
        </Button>
        <Button type="submit">{isEditing ? "Update Product" : "Add Product"}</Button>
      </div>
    </form>
  )
}

