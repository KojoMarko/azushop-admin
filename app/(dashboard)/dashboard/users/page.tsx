"use client"

import { useState } from "react"
import { useStore, type User, type ActivityLog } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Eye, Trash, Clock, ShoppingCart, LogIn, LogOut } from "lucide-react"

export default function UsersPage() {
  const { users, activityLogs, orders, deleteUser } = useStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get activity logs for a user
  const getUserActivityLogs = (userId: string) => {
    return activityLogs.filter((log) => log.userId === userId)
  }

  // Get orders for a user
  const getUserOrders = (userId: string) => {
    return orders.filter((order) => order.userId === userId)
  }

  // Handle user deletion
  const handleDeleteUser = () => {
    if (!userToDelete) return

    deleteUser(userToDelete.id)
    setUserToDelete(null)

    toast(`${userToDelete.username} has been deleted.`)
  }

  // Format activity action for display
  const formatActivityAction = (action: ActivityLog["action"]) => {
    switch (action) {
      case "login":
        return "Logged in"
      case "logout":
        return "Logged out"
      case "view_product":
        return "Viewed product"
      case "add_to_cart":
        return "Added to cart"
      case "remove_from_cart":
        return "Removed from cart"
      case "purchase":
        return "Made a purchase"
      default:
        return action
    }
  }

  // Get icon for activity action
  const getActivityIcon = (action: ActivityLog["action"]) => {
    switch (action) {
      case "login":
        return <LogIn className="h-4 w-4" />
      case "logout":
        return <LogOut className="h-4 w-4" />
      case "view_product":
        return <Eye className="h-4 w-4" />
      case "add_to_cart":
      case "remove_from_cart":
        return <ShoppingCart className="h-4 w-4" />
      case "purchase":
        return <ShoppingCart className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage users and track their activity</p>
      </div>

      {/* Search */}
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  {users.length === 0 ? <p>No users yet.</p> : <p>No users match your search.</p>}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow key={`${user.id}-${index}`}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => setUserToDelete(user)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Activity Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Activity: {selectedUser?.username}</DialogTitle>
            <DialogDescription>View detailed activity logs and purchase history</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                <TabsTrigger value="orders">Purchase History</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="space-y-4 pt-4 max-h-[400px] overflow-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {getUserActivityLogs(selectedUser.id).length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No activity recorded for this user.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4">
                        {getUserActivityLogs(selectedUser.id).map((log, index) => (
                          <div key={`${log.id}-${index}`} className="flex items-start gap-3 pb-3 border-b last:border-0">
                            <div className="bg-muted p-2 rounded-full">{getActivityIcon(log.action)}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{formatActivityAction(log.action)}</span>
                                  <Badge variant="outline">{log.action}</Badge>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{log.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4 pt-4 max-h-[400px] overflow-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Purchase History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {getUserOrders(selectedUser.id).length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No purchases recorded for this user.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getUserOrders(selectedUser.id).map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>{order.items.length}</TableCell>
                              <TableCell>${order.total.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {order.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{userToDelete?.username}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

