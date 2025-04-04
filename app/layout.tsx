import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { AuthProvider } from "@/app/contexts/auth-context";
import ClientSideEffect from "../components/ClientSideEffect";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Azushop Admin",
  description: "Azushop Admin dashboard for managing products, orders, and inventory",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ClientSideEffect />
            {children}
            <Sonner />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

