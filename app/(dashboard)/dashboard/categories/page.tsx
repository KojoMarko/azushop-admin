"use client"

import { useState } from "react"
import { useStore, type Category, type Subcategory } from "@/lib/store"
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash, Layers } from "lucide-react"

export default function CategoriesPage() {
  const {
    categories,
    subcategories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useStore()

  // Category state
  const [categoryName, setCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Subcategory state
  const [subcategoryName, setSubcategoryName] = useState("")
  const [subcategoryParent, setSubcategoryParent] = useState("")
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null)

  // Handle category actions
  const handleAddCategory = () => {
    if (!categoryName.trim()) return

    addCategory({ name: categoryName.trim() })
    setCategoryName("")

    toast(`${categoryName} has been added successfully.`)
  }

  const handleUpdateCategory = () => {
    if (!editingCategory || !categoryName.trim()) return

    updateCategory(editingCategory.id, { name: categoryName.trim() })
    setEditingCategory(null)
    setCategoryName("")

    toast(`Category has been updated successfully.`)
  }

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return

    // Check if category has subcategories or products
    const hasSubcategories = subcategories.some((sub) => sub.categoryId === categoryToDelete.id)
    const hasProducts = products.some((product) => product.categoryId === categoryToDelete.id)

    if (hasSubcategories || hasProducts) {
      toast("This category has associated subcategories or products.")
      setCategoryToDelete(null)
      return
    }

    deleteCategory(categoryToDelete.id)
    setCategoryToDelete(null)

    toast(`${categoryToDelete.name} has been deleted.`)
  }

  const startEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
  }

  // Handle subcategory actions
  const handleAddSubcategory = () => {
    if (!subcategoryName.trim() || !subcategoryParent) return

    addSubcategory({
      name: subcategoryName.trim(),
      categoryId: subcategoryParent,
    })
    setSubcategoryName("")
    setSubcategoryParent("")

    toast(`${subcategoryName} has been added successfully.`)
  }

  const handleUpdateSubcategory = () => {
    if (!editingSubcategory || !subcategoryName.trim()) return

    updateSubcategory(editingSubcategory.id, {
      name: subcategoryName.trim(),
      categoryId: subcategoryParent || editingSubcategory.categoryId,
    })
    setEditingSubcategory(null)
    setSubcategoryName("")
    setSubcategoryParent("")

    toast(`Subcategory has been updated successfully.`)
  }

  const handleDeleteSubcategory = () => {
    if (!subcategoryToDelete) return

    // Check if subcategory has products
    const hasProducts = products.some((product) => product.subcategoryId === subcategoryToDelete.id)

    if (hasProducts) {
      toast("This subcategory has associated products.")
      setSubcategoryToDelete(null)
      return
    }

    deleteSubcategory(subcategoryToDelete.id)
    setSubcategoryToDelete(null)

    toast(`${subcategoryToDelete.name} has been deleted.`)
  }

  const startEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory)
    setSubcategoryName(subcategory.name)
    setSubcategoryParent(subcategory.categoryId)
  }

  // Get subcategories for a category
  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter((sub) => sub.categoryId === categoryId)
  }

  // Count products in a category or subcategory
  const countProductsInCategory = (categoryId: string) => {
    return products.filter((product) => product.categoryId === categoryId).length
  }

  const countProductsInSubcategory = (subcategoryId: string) => {
    return products.filter((product) => product.subcategoryId === subcategoryId).length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories & Subcategories</h1>
        <p className="text-muted-foreground">Manage your product categories and subcategories</p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
              <CardDescription>Create a new top-level category for your products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Electronics, Clothing, Books"
                  />
                </div>
                {editingCategory ? (
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateCategory} disabled={!categoryName.trim()}>
                      Update
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(null)
                        setCategoryName("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleAddCategory} disabled={!categoryName.trim()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Category
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No categories yet. Add your first category to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{getSubcategoriesForCategory(category.id).length}</TableCell>
                      <TableCell>{countProductsInCategory(category.id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => startEditCategory(category)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => setCategoryToDelete(category)}>
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

          {/* Category Details Accordion */}
          {categories.length > 0 && (
            <div className="border rounded-md">
              <Accordion type="single" collapsible className="w-full">
                {categories.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 mr-2" />
                        {category.name}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Subcategories</h4>
                        {getSubcategoriesForCategory(category.id).length === 0 ? (
                          <p className="text-sm text-muted-foreground">No subcategories yet.</p>
                        ) : (
                          <ul className="text-sm space-y-1">
                            {getSubcategoriesForCategory(category.id).map((sub) => (
                              <li key={sub.id} className="flex items-center justify-between">
                                <span>{sub.name}</span>
                                <span className="text-muted-foreground">
                                  {countProductsInSubcategory(sub.id)} products
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </TabsContent>

        {/* Subcategories Tab */}
        <TabsContent value="subcategories" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Subcategory</CardTitle>
              <CardDescription>Create a new subcategory and assign it to a parent category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subcategory-name">Subcategory Name</Label>
                  <Input
                    id="subcategory-name"
                    value={subcategoryName}
                    onChange={(e) => setSubcategoryName(e.target.value)}
                    placeholder="e.g., Smartphones, Laptops, Tablets"
                  />
                </div>
                <div>
                  <Label htmlFor="parent-category">Parent Category</Label>
                  <Select value={subcategoryParent} onValueChange={setSubcategoryParent}>
                    <SelectTrigger id="parent-category">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  {editingSubcategory ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpdateSubcategory}
                        disabled={!subcategoryName.trim() || !subcategoryParent}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingSubcategory(null)
                          setSubcategoryName("")
                          setSubcategoryParent("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleAddSubcategory} disabled={!subcategoryName.trim() || !subcategoryParent}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subcategory
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subcategory Name</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No subcategories yet. Add your first subcategory to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  subcategories.map((subcategory) => {
                    const parentCategory = categories.find((c) => c.id === subcategory.categoryId)
                    return (
                      <TableRow key={subcategory.id}>
                        <TableCell className="font-medium">{subcategory.name}</TableCell>
                        <TableCell>{parentCategory?.name || "Unknown"}</TableCell>
                        <TableCell>{countProductsInSubcategory(subcategory.id)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => startEditSubcategory(subcategory)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setSubcategoryToDelete(subcategory)}>
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Category Dialog */}
      <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Dialog */}
      <Dialog open={!!subcategoryToDelete} onOpenChange={(open) => !open && setSubcategoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the subcategory "{subcategoryToDelete?.name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubcategoryToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubcategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

