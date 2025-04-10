"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  username: string
  role: "admin"
  name?: string
  email?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set to true when the component mounts on the client
    try {
      const storedUser = localStorage.getItem("admin-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing stored user from localStorage:", error);
      localStorage.removeItem("admin-user"); // Clear invalid data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    // Simulate API call
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple authentication logic (in a real app, this would be a server call)
    if (username === "admin" && password === "password") {
      const user: User = {
        id: "1",
        username: "admin",
        role: "admin",
      }
      setUser(user)
      localStorage.setItem("admin-user", JSON.stringify(user))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("admin-user")
  }

  useEffect(() => {
    console.log("AuthProvider initialized. User:", user, "IsLoading:", isLoading);
  }, [user, isLoading]);

  // Only render the provider on the client-side
  if (!isClient) {
    return null; // Or a loading indicator if you prefer
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

