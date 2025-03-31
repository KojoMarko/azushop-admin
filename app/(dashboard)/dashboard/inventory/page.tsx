"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Toaster } from "@/components/ui/sonner"
import { Search, AlertTriangle, Edit, Plus, Minus, X } from "lucide-react"
import { toast } from "sonner";

export default function InventoryPage() {
  const { products, inventoryAlerts, updateInventory, dismissAlert } = useStore()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter products based on search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort products by inventory level (low to high)
  const sortedProducts = [...filteredProducts].sort((a, b) => a.inventory - b.inventory)

  // Handle inventory update
  const handleInventoryUpdate = (productId: string, change: number) => {
    const product = products.find((p) => p.id === productId)

    if (!product) return

    const newInventory = Math.max(0, product.inventory + change)
    updateInventory(productId, newInventory)

    toast(`${product.name} inventory updated to ${newInventory} units.`)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Track and update product inventory levels</p>
      </div>

      {/* Inventory Alerts */}
      {inventoryAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
          <div className="space-y-3">
            {inventoryAlerts.map((alert) => (
              <Alert key={alert.productId} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <div className="flex-1">
                  <AlertTitle className="flex items-center justify-between">
                    <span>Low Inventory: {alert.productName}</span>
                    <Button variant="ghost" size="icon" onClick={() => dismissAlert(alert.productId)}>
                      <span className="sr-only">Dismiss</span>
                      <X className="h-4 w-4" />
                    </Button>
                  </AlertTitle>
                  <AlertDescription>
                    Current stock: {alert.inventory} units (below threshold of {alert.threshold})
                    <div className="mt-2">
                      <Link href={`/dashboard/products/edit/${alert.productId}`}>
                        <Button variant="outline" size="sm">
                          Update Inventory
                        </Button>
                      </Link>
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryAlerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.inventory === 0).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
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

      {/* Inventory Table */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {products.length === 0 ? (
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
                <TableHead>Product</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 relative">
                        <Image
                          src={product.image || "/placeholder.svg?height=40&width=40"}
                          alt={product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={product.inventory <= 5 ? "text-red-500 font-medium" : ""}>
                      {product.inventory} units
                    </span>
                  </TableCell>
                  <TableCell>
                    {product.inventory === 0 ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : product.inventory <= 5 ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        In Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleInventoryUpdate(product.id, -1)}
                        disabled={product.inventory === 0}
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Decrease</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleInventoryUpdate(product.id, 1)}>
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Increase</span>
                      </Button>
                      <Link href={`/dashboard/products/edit/${product.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

