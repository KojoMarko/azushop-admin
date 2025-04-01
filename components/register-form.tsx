"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Validation schema using Zod
const schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .max(100, "Email is too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password is too long"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Send form data to API to generate OTP and send email
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send OTP');
      }
      
      // Store user data in sessionStorage to retrieve on OTP page
      // Don't store password in plain text in sessionStorage in production!
      // This is just for demonstration - in production use a more secure approach
      sessionStorage.setItem('registrationData', JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }));
      
      // Redirect to OTP verification page
      router.push('/verify-otp');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6 px-4 sm:px-6 md:px-8 lg:px-10", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">Create your account</h1>
        <p className="text-sm text-muted-foreground sm:text-base md:text-lg">
          Enter your details to sign up.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your Name"
            {...register("name")}
            className="h-12 sm:h-14 text-lg sm:text-xl"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message as string}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
            className="h-12 sm:h-14 text-lg sm:text-xl"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message as string}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            className="h-12 sm:h-14 text-lg sm:text-xl"
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message as string}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            {...register("confirmPassword")}
            className="h-12 sm:h-14 text-lg sm:text-xl"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message as string}</p>}
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 sm:h-14 text-lg sm:text-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Sign Up"}
        </Button>
      </div>
      <div className="text-center text-sm sm:text-base">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Login
        </a>
      </div>
    </form>
  );
}