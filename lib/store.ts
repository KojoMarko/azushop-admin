import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid"; // Import uuid for unique IDs
import {
  fetchCategories,
  createCategory,
  fetchSubcategories,
  createSubcategory,
  fetchBrands,
  createBrand,
  // fetchProducts, // Optional future
  // createProduct, // Optional future
  updateSubcategoryApi // Import the new API function
} from "@/lib/api";

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inventory: number;
  categoryId: string;
  subcategoryId: string;
  brandId: string;
  specifications: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAlert {
  productId: string;
  productName: string;
  inventory: number;
  threshold: number;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: "login" | "logout" | "view_product" | "add_to_cart" | "purchase" | "remove_from_cart";
  details: string;
  timestamp: string;
}

interface StoreState {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  orders: Order[];
  inventoryAlerts: InventoryAlert[];
  users: User[];
  activityLogs: ActivityLog[];

  // Product actions
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>) => void;
  deleteProduct: (id: string) => void;

  // Category actions
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateCategory: (id: string, category: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>) => void;
  deleteCategory: (id: string) => void;
  setCategories: (categories: Category[]) => void; // Add the setCategories action

  // Subcategory actions
  addSubcategory: (subcategory: Omit<Subcategory, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateSubcategory: (id: string, subcategory: Partial<Omit<Subcategory, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  deleteSubcategory: (id: string) => void;
  setSubcategories: (subcategories: Subcategory[]) => void; // Add the setSubcategories action

  // Brand actions
  addBrand: (brand: Omit<Brand, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateBrand: (id: string, brand: Partial<Omit<Brand, "id" | "createdAt" | "updatedAt">>) => void;
  deleteBrand: (id: string) => void;
  setBrands: (brands: Brand[]) => void; // Add the setBrands action

  // Order actions
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  fulfillOrder: (id: string) => void;

  // Inventory actions
  updateInventory: (productId: string, quantity: number) => void;
  checkLowInventory: () => void;
  dismissAlert: (productId: string) => void;

  // User actions
  addUser: (user: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, user: Partial<Omit<User, "id" | "createdAt">>) => void;
  deleteUser: (id: string) => void;

  // Activity log actions
  logActivity: (log: Omit<ActivityLog, "id" | "timestamp">) => void;
}

// Threshold for low inventory alerts
const LOW_INVENTORY_THRESHOLD = 5;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: [],
      subcategories: [],
      brands: [],
      orders: [],
      inventoryAlerts: [],
      users: [],
      activityLogs: [],

      // Product actions
      addProduct: (product) => {
        const now = new Date().toISOString();
        const id = product._id ? product._id.toString() : uuidv4();
        // Prevent duplicates: only add if not already present
        set((state) => {
          if (state.products.some((p) => p.id === id)) {
            return {};
          }
          const newProduct: Product = {
            id,
            _id: product._id,
            ...product,
            createdAt: now,
            updatedAt: now,
          };
          return {
            products: [...state.products, newProduct],
          };
        });
        get().checkLowInventory();
      },

      updateProduct: (id, updatedFields) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? {
                  ...product,
                  ...updatedFields,
                  updatedAt: new Date().toISOString(),
                }
              : product,
          ),
        }));

        get().checkLowInventory();
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          inventoryAlerts: state.inventoryAlerts.filter((alert) => alert.productId !== id),
        }));
      },

      // Category actions
      addCategory: async (category) => {
        try {
          const now = new Date().toISOString();
          const newCategory = await createCategory({ ...category, createdAt: now, updatedAt: now });
          set((state) => ({
            categories: [...state.categories, newCategory],
          }));
        } catch (error) {
          console.error("Error creating category:", error);
          // Optionally handle the error (e.g., display a notification)
        }
      },

      updateCategory: (id, updatedFields) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id
              ? {
                  ...category,
                  ...updatedFields,
                  updatedAt: new Date().toISOString(),
                }
              : category,
          ),
        }));
      },

      deleteCategory: (id) => {
        const { subcategories, products } = get();
        const hasSubcategories = subcategories.some((sub) => sub.categoryId === id);
        const hasProducts = products.some((product) => product.categoryId === id);

        if (hasSubcategories || hasProducts) {
          console.error("Cannot delete category with associated subcategories or products");
          return;
        }

        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
        }));
      },

      setCategories: (newCategories: Category[]) => set({ categories: newCategories }), // Implementation of setCategories

      // Subcategory actions
      addSubcategory: async (subcategory) => {
        try {
          const now = new Date().toISOString();
          const newSubcategory = await createSubcategory({ ...subcategory, createdAt: now, updatedAt: now });
          set((state) => ({
            subcategories: [...state.subcategories, newSubcategory],
          }));
        } catch (error) {
          console.error("Error creating subcategory:", error);
          // Optionally handle the error
        }
      },

      updateSubcategory: async (id, updatedFields) => {
        try {
          const now = new Date().toISOString();
          const updatedSubcategory = await updateSubcategoryApi(id, { ...updatedFields, updatedAt: now });

          set((state) => ({
            subcategories: state.subcategories.map((subcategory) =>
              subcategory.id === id
                ? {
                    ...subcategory,
                    ...updatedFields,
                    updatedAt: now,
                  }
                : subcategory,
            ),
          }));
        } catch (error) {
          console.error("Error updating subcategory:", error);
          // Optionally handle the error (e.g., display a notification)
        }
      },

      deleteSubcategory: (id) => {
        const { products } = get();
        const hasProducts = products.some((product) => product.subcategoryId === id);

        if (hasProducts) {
          console.error("Cannot delete subcategory with associated products");
          return;
        }

        set((state) => ({
          subcategories: state.subcategories.filter((subcategory) => subcategory.id !== id),
        }));
      },

      setSubcategories: (newSubcategories: Subcategory[]) => set({ subcategories: newSubcategories }), // Implementation of setSubcategories

      // Brand actions
      addBrand: async (brand) => {
        try {
          const now = new Date().toISOString();
          const newBrand = await createBrand({ ...brand, createdAt: now, updatedAt: now });
          set((state) => ({
            brands: [...state.brands, newBrand],
          }));
        } catch (error) {
          console.error("Error creating brand:", error);
          // Optionally handle the error
        }
      },

      updateBrand: (id, updatedFields) => {
        set((state) => ({
          brands: state.brands.map((brand) =>
            brand.id === id
              ? {
                  ...brand,
                  ...updatedFields,
                  updatedAt: new Date().toISOString(),
                }
              : brand,
          ),
        }));
      },

      deleteBrand: (id) => {
        const { products } = get();
        const hasProducts = products.some((product) => product.brandId === id);

        if (hasProducts) {
          console.error("Cannot delete brand with associated products");
          return;
        }

        set((state) => ({
          brands: state.brands.filter((brand) => brand.id !== id),
        }));
      },

      setBrands: (newBrands: Brand[]) => set({ brands: newBrands }), // Implementation of setBrands

      // Order actions
      addOrder: (order) => {
        const now = new Date().toISOString();
        const newOrder: Order = {
          id: uuidv4(), // Use uuid
          ...order,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          orders: [...state.orders, newOrder],
        }));

        get().logActivity({
          userId: order.userId,
          username: order.customerName,
          action: "purchase",
          details: `Purchased ${order.items.length} items for $${order.total.toFixed(2)}`,
        });
      },

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order,
          ),
        }));
      },

      fulfillOrder: (id) => { // Fixed syntax from "Guilty:" to proper arrow function
        const { orders, products } = get();
        const order = orders.find((o) => o.id === id);

        if (!order || order.status === "shipped" || order.status === "delivered") {
          return;
        }

        get().updateOrderStatus(id, "shipped");

        order.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            get().updateInventory(item.productId, product.inventory - item.quantity);
          }
        });
      },

      // Inventory actions
      updateInventory: (productId, quantity) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  inventory: quantity,
                  updatedAt: new Date().toISOString(),
                }
              : product,
          ),
        }));

        get().checkLowInventory();
      },

      checkLowInventory: () => {
        const { products, inventoryAlerts } = get();
        const now = new Date().toISOString();

        const lowInventoryProducts = products.filter(
          (product) => product.inventory <= LOW_INVENTORY_THRESHOLD,
        );

        const newAlerts = lowInventoryProducts
          .filter((product) => !inventoryAlerts.some((alert) => alert.productId === product.id))
          .map((product) => ({
            productId: product.id,
            productName: product.name,
            inventory: product.inventory,
            threshold: LOW_INVENTORY_THRESHOLD,
            createdAt: now,
          }));

        const updatedAlerts = inventoryAlerts
          .map((alert) => {
            const product = products.find((p) => p.id === alert.productId);
            if (!product) return null;

            if (product.inventory > LOW_INVENTORY_THRESHOLD) {
              return null;
            }

            return {
              ...alert,
              inventory: product.inventory,
            };
          })
          .filter(Boolean) as InventoryAlert[];

        set({
          inventoryAlerts: [...updatedAlerts, ...newAlerts],
        });
      },

      dismissAlert: (productId) => {
        set((state) => ({
          inventoryAlerts: state.inventoryAlerts.filter((alert) => alert.productId !== productId),
        }));
      },

      // User actions
      addUser: (user) => {
        const now = new Date().toISOString();
        const newUser: User = {
          id: uuidv4(), // Use uuid
          ...user,
          createdAt: now,
          lastLogin: now,
        };

        set((state) => ({
          users: [...state.users, newUser],
        }));
      },

      updateUser: (id, updatedFields) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, ...updatedFields } : user)),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          activityLogs: state.activityLogs.filter((log) => log.userId !== id),
        }));
      },

      // Activity log actions
      logActivity: (log) => {
        const newLog: ActivityLog = {
          id: uuidv4(), // Use uuid
          ...log,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          activityLogs: [newLog, ...state.activityLogs],
        }));
      },
    }),
    {
      name: "Azushop Admin Store", // Name of the storage (must be unique)
    },
  ),
);