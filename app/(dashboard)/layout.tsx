"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/app/contexts/auth-context"
import { AuthProvider } from "@/app/contexts/auth-context"
import { LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, Menu, Tags, Layers, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  isActive: boolean
  onClick?: () => void
}

function NavItem({ href, icon, title, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
        isActive ? "bg-muted font-medium text-primary" : "text-muted-foreground",
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  )
}

function DashboardNav() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const closeSheet = () => {
    setIsOpen(false)
  }

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: "Dashboard",
    },
    {
      href: "/dashboard/products",
      icon: <Package className="h-5 w-5" />,
      title: "Products",
    },
    {
      href: "/dashboard/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      title: "Orders",
    },
    {
      href: "/dashboard/inventory",
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Inventory",
    },
    {
      href: "/dashboard/categories",
      icon: <Layers className="h-5 w-5" />,
      title: "Categories",
    },
    {
      href: "/dashboard/brands",
      icon: <Tags className="h-5 w-5" />,
      title: "Brands",
    },
    {
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
      title: "Users",
    },
  ]

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="ml-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <img src="/azushop-admin.svg" alt="Admin Dashboard" className="h-full w-full object-contain mx-auto" />
            </div>
            <div className="flex-1 overflow-auto py-2 px-4">
              <nav className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <NavItem
                    key={`${item.href}-${index}`}
                    href={item.href}
                    icon={item.icon}
                    title={item.title}
                    isActive={pathname === item.href}
                    onClick={closeSheet}
                  />
                ))}
              </nav>
            </div>
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <img src="/azushop-admin.svg" alt="Admin Dashboard" className="h-full w-full object-contain mx-auto" />
          </div>
          <div className="flex-1 overflow-auto py-4 px-3">
            <nav className="flex flex-col gap-1">
              {navItems.map((item, index) => (
                <NavItem
                  key={`${item.href}-${index}`}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  isActive={pathname === item.href}
                />
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav />
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>
            <div className="flex-1 flex items-center justify-between">
            <h1 className="text-lg font-semibold">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h1>
            <script>
              {`
              setInterval(() => {
                document.querySelector('h1').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              }, 1000);
              `}
            </script>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" aria-label="Notifications">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                />
              </svg>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Profile">
              <img
                src="/profile-placeholder.png"
                alt="Profile"
                className="h-8 w-8 rounded-full"
              />
              </Button>
            </div>
            </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Welcome, {user.username}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  )
}

