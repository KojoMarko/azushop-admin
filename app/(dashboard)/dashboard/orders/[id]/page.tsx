"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useStore, type Order } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"
import { ArrowLeft, Truck, Package } from "lucide-react"
import Link from "next/link"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { orders, products, updateOrderStatus, fulfillOrder } = useStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      const foundOrder = orders.find((o) => o.id === params.id)

      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        // Order not found, redirect to orders page
        router.push("/dashboard/orders")
      }
    }

    setLoading(false)
  }, [params.id, orders, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000) // Clear the message after 3 seconds
  }

  const handleStatusChange = (status: Order["status"]) => {
    updateOrderStatus(order.id, status)
    showToast(`Order #${order.id.slice(0, 8)} status changed to ${status}`)
  }

  const handleFulfillOrder = () => {
    // Check if all products have enough inventory
    const insufficientItems = order.items.filter((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product && product.inventory < item.quantity
    })

    if (insufficientItems.length > 0) {
      showToast("Some products don't have enough inventory to fulfill this order.")
      return
    }

    fulfillOrder(order.id)
    showToast(`Order #${order.id.slice(0, 8)} has been fulfilled and inventory updated.`)
  }

  // Format date for display
  const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Check if order can be fulfilled (has enough inventory and is not already shipped/delivered)
  const canFulfill = order.status !== "shipped" && order.status !== "delivered"

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white p-4 rounded shadow">
          {toastMessage}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to orders</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-muted-foreground">Placed on {orderDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={order.status} onValueChange={handleStatusChange} disabled={order.status === "delivered"}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          {canFulfill && (
            <Button onClick={handleFulfillOrder}>
              <Truck className="mr-2 h-4 w-4" />
              Fulfill Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Shipping Address</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{order.shippingAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-sm">Status</p>
                <Badge
                  variant="outline"
                  className={`
                    ${order.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" : ""}
                    ${order.status === "processing" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : ""}
                    ${order.status === "shipped" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}
                    ${order.status === "delivered" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" : ""}
                  `}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Order Date</p>
                <p className="text-sm font-medium">{orderDate}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Items</p>
                <p className="text-sm font-medium">{order.items.length}</p>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <p>Total</p>
                <p>${order.total.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fulfillment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Fulfillment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {order.status === "shipped" || order.status === "delivered"
                      ? "Order Fulfilled"
                      : "Awaiting Fulfillment"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.status === "shipped" || order.status === "delivered"
                      ? "Inventory has been updated"
                      : "Inventory will be updated when fulfilled"}
                  </p>
                </div>
              </div>
              {canFulfill && (
                <Button variant="outline" className="w-full" onClick={handleFulfillOrder}>
                  <Truck className="mr-2 h-4 w-4" />
                  Fulfill Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => {
                const product = products.find((p) => p.id === item.productId)
                const hasEnoughInventory = product ? product.inventory >= item.quantity : true

                return (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">
                      {item.productName}
                      {!hasEnoughInventory && canFulfill && (
                        <Badge variant="destructive" className="ml-2">
                          Low Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">${order.total.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

