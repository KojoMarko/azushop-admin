"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Package, ShoppingCart, AlertTriangle, TrendingUp, DollarSign, X, Users, Layers, Tags } from "lucide-react"

export default function DashboardPage() {
  const {
    products,
    orders,
    inventoryAlerts,
    categories,
    subcategories,
    brands,
    users,
    activityLogs,
    dismissAlert,
    addCategory,
    addSubcategory,
    addBrand,
    addUser,
    logActivity,
  } = useStore()

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalUsers: 0,
  })

  useEffect(() => {
    setStats({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter((order) => order.status === "pending" || order.status === "processing").length,
      totalCategories: categories.length,
      totalBrands: brands.length,
      totalUsers: users.length,
    })
  }, [products, orders, categories, brands, users])

  // Add sample data if store is empty
  useEffect(() => {
    if (
      categories.length === 0 &&
      subcategories.length === 0 &&
      brands.length === 0 &&
      products.length === 0 &&
      orders.length === 0 &&
      users.length === 0
    ) {
      // Add sample categories
      const sampleCategories = [{ name: "Electronics" }, { name: "Clothing" }, { name: "Home & Kitchen" }]

      const store = useStore.getState()

      sampleCategories.forEach((category) => {
        store.addCategory(category)
      })

      // Add sample brands
      const sampleBrands = [{ name: "Apple" }, { name: "Samsung" }, { name: "Nike" }, { name: "Adidas" }]

      sampleBrands.forEach((brand) => {
        store.addBrand(brand)
      })

      // Add sample users
      const sampleUsers = [
        {
          username: "johndoe",
          name: "John Doe",
          email: "john.doe@example.com",
          lastLogin: new Date().toISOString(),
        },
        {
          username: "janesmith",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          lastLogin: new Date().toISOString(),
        },
      ]

      sampleUsers.forEach((user) => {
        store.addUser(user)
      })

      // Add sample subcategories after categories are added
      setTimeout(() => {
        const categories = useStore.getState().categories

        if (categories.length > 0) {
          const electronicsCategory = categories.find((c) => c.name === "Electronics")
          const clothingCategory = categories.find((c) => c.name === "Clothing")

          if (electronicsCategory) {
            const sampleElectronicsSubcategories = [
              { name: "Smartphones", categoryId: electronicsCategory.id },
              { name: "Laptops", categoryId: electronicsCategory.id },
              { name: "Tablets", categoryId: electronicsCategory.id },
            ]

            sampleElectronicsSubcategories.forEach((subcategory) => {
              store.addSubcategory(subcategory)
            })
          }

          if (clothingCategory) {
            const sampleClothingSubcategories = [
              { name: "Men's Clothing", categoryId: clothingCategory.id },
              { name: "Women's Clothing", categoryId: clothingCategory.id },
            ]

            sampleClothingSubcategories.forEach((subcategory) => {
              store.addSubcategory(subcategory)
            })
          }

          // Add sample products after categories, subcategories, and brands are added
          setTimeout(() => {
            const categories = useStore.getState().categories
            const subcategories = useStore.getState().subcategories
            const brands = useStore.getState().brands

            if (categories.length > 0 && subcategories.length > 0 && brands.length > 0) {
              const electronicsCategory = categories.find((c) => c.name === "Electronics")
              const smartphonesSubcategory = subcategories.find((s) => s.name === "Smartphones")
              const laptopsSubcategory = subcategories.find((s) => s.name === "Laptops")
              const appleBrand = brands.find((b) => b.name === "Apple")
              const samsungBrand = brands.find((b) => b.name === "Samsung")

              if (electronicsCategory && smartphonesSubcategory && laptopsSubcategory && appleBrand && samsungBrand) {
                const sampleProducts = [
                  {
                    name: "iPhone 13 Pro",
                    description: "The latest iPhone with advanced features",
                    price: 999.99,
                    image: "/placeholder.svg?height=200&width=200",
                    inventory: 25,
                    categoryId: electronicsCategory.id,
                    subcategoryId: smartphonesSubcategory.id,
                    brandId: appleBrand.id,
                    specifications: {
                      Display: "6.1-inch Super Retina XDR",
                      Processor: "A15 Bionic",
                      Storage: "128GB",
                      Battery: "Up to 22 hours",
                    },
                  },
                  {
                    name: "Samsung Galaxy S21",
                    description: "Flagship Android smartphone with premium features",
                    price: 799.99,
                    image: "/placeholder.svg?height=200&width=200",
                    inventory: 15,
                    categoryId: electronicsCategory.id,
                    subcategoryId: smartphonesSubcategory.id,
                    brandId: samsungBrand.id,
                    specifications: {
                      Display: "6.2-inch Dynamic AMOLED",
                      Processor: "Snapdragon 888",
                      Storage: "128GB",
                      Battery: "4000mAh",
                    },
                  },
                  {
                    name: "MacBook Pro",
                    description: "Powerful laptop for professionals",
                    price: 1499.99,
                    image: "/placeholder.svg?height=200&width=200",
                    inventory: 4,
                    categoryId: electronicsCategory.id,
                    subcategoryId: laptopsSubcategory.id,
                    brandId: appleBrand.id,
                    specifications: {
                      Display: "13.3-inch Retina",
                      Processor: "Apple M1 Pro",
                      Storage: "512GB SSD",
                      Battery: "Up to 17 hours",
                    },
                  },
                ]

                sampleProducts.forEach((product) => {
                  store.addProduct(product)
                })

                // Add sample user activity logs
                const users = useStore.getState().users

                if (users.length > 0) {
                  const user1 = users[0]
                  const user2 = users.length > 1 ? users[1] : users[0]

                  const sampleActivityLogs = [
                    {
                      userId: user1.id,
                      username: user1.username,
                      action: "login" as const,
                      details: "Logged in from Chrome on Windows",
                    },
                    {
                      userId: user1.id,
                      username: user1.username,
                      action: "view_product" as const,
                      details: "Viewed iPhone 13 Pro",
                    },
                    {
                      userId: user1.id,
                      username: user1.username,
                      action: "add_to_cart" as const,
                      details: "Added iPhone 13 Pro to cart",
                    },
                    {
                      userId: user2.id,
                      username: user2.username,
                      action: "login" as const,
                      details: "Logged in from Safari on macOS",
                    },
                    {
                      userId: user2.id,
                      username: user2.username,
                      action: "view_product" as const,
                      details: "Viewed MacBook Pro",
                    },
                  ]

                  sampleActivityLogs.forEach((log) => {
                    store.logActivity(log)
                  })
                }

                // Add sample orders after products are added
                setTimeout(() => {
                  const products = useStore.getState().products
                  const users = useStore.getState().users

                  if (products.length > 0 && users.length > 0) {
                    const user1 = users[0]
                    const user2 = users.length > 1 ? users[1] : users[0]

                    const sampleOrders = [
                      {
                        userId: user1.id,
                        customerName: user1.name,
                        customerEmail: user1.email,
                        shippingAddress: "123 Main St, Anytown, USA",
                        items: [
                          {
                            productId: products[0].id,
                            productName: products[0].name,
                            quantity: 1,
                            price: products[0].price,
                          },
                          {
                            productId: products[2].id,
                            productName: products[2].name,
                            quantity: 1,
                            price: products[2].price,
                          },
                        ],
                        total: products[0].price + products[2].price,
                        status: "pending" as "pending",
                      },
                      {
                        userId: user2.id,
                        customerName: user2.name,
                        customerEmail: user2.email,
                        shippingAddress: "456 Oak Ave, Somewhere, USA",
                        items: [
                          {
                            productId: products[1].id,
                            productName: products[1].name,
                            quantity: 1,
                            price: products[1].price,
                          },
                        ],
                        total: products[1].price,
                        status: "processing" as "processing",
                      },
                    ]

                    sampleOrders.forEach((order) => {
                      store.addOrder(order)
                    })
                  }
                }, 100)
              }
            }
          }, 100)
        }
      }, 100)
    }
  }, [categories.length, subcategories.length, brands.length, products.length, orders.length, users.length])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your e-commerce store</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/products" className="text-blue-500 hover:underline">
                Manage products
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/orders" className="text-blue-500 hover:underline">
                View all orders
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Orders awaiting fulfillment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/categories" className="text-blue-500 hover:underline">
                Manage categories
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brands</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBrands}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/brands" className="text-blue-500 hover:underline">
                Manage brands
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/users" className="text-blue-500 hover:underline">
                Manage users
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      {inventoryAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Inventory Alerts</h2>
          <div className="space-y-3">
            {inventoryAlerts.map((alert, index) => (
              <Alert key={`${alert.productId}-${index}`} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <div className="flex-1">
                  <AlertTitle className="flex items-center justify-between">
                    <span>Low Inventory: {alert.productName}</span>
                    <Button variant="ghost" size="icon" onClick={() => dismissAlert(alert.productId)}>
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

      {/* Recent Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link href="/dashboard/orders">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <p className="text-sm capitalize">{order.status}</p>
                    </div>
                    <div>
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

