"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useStore, type Product } from "@/lib/store"
import ProductForm from "../../product-form"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { products } = useStore()
  const [product, setProduct] = useState<Product | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      const foundProduct = products.find((p) => p.id === params.id)

      if (foundProduct) {
        setProduct(foundProduct)
      } else {
        // Product not found, redirect to products page
        router.push("/dashboard/products")
      }
    }

    setLoading(false)
  }, [params.id, products, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Update product information and inventory</p>
      </div>

      <ProductForm product={product} isEditing />
    </div>
  )
}

