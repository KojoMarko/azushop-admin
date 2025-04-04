// components/login-form.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Add this effect to handle the verified parameter
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setSuccess("Your email has been verified! You can now log in.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        let errorMessage = result.error;

        // Make error messages more user-friendly
        if (result.error === "CredentialsSignin") {
          errorMessage = "Invalid email or password";
        } else if (result.error.includes("verify")) {
          errorMessage = "Please verify your email before logging in. Check your inbox for a verification code.";
        }

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Store user data in localStorage after successful login
      const user = { email: formData.email }; // Add more user details if available
      localStorage.setItem("admin-user", JSON.stringify(user));

      // Successful login, redirect to dashboard
      console.log("Login successful. Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login submission error:", error);
      setError("An unexpected error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    // Let NextAuth handle the redirect for OAuth providers
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6 px-2", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to log in.
          </p>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              className="h-14 text-xl"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              
              <a
                href="#"
                className="text-sm underline-offset-4 hover:underline"
                onClick={(e: React.MouseEvent) => { 
                  e.preventDefault(); 
                  alert("Password reset not implemented yet."); 
                }}
              >
                Forgot your password?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="h-14 text-xl"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full h-14 text-xl"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>

        <div className="relative text-center text-sm">
          <div className="absolute inset-0 top-1/2 h-[1px] w-full bg-border" />
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-14 text-xl gap-2"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <img src="/google-icon.svg" alt="Google Icon" className="h-6 w-6" />
          Login with Google
        </Button>

        <div className="text-center text-sm">
          No account?{" "}
          <a href="/register" className="underline underline-offset-4">
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
}