import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  return (
    <form className={cn("flex flex-col gap-6 px-4 sm:px-6 md:px-8 lg:px-10", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">Create your account</h1>
        <p className="text-sm text-muted-foreground sm:text-base md:text-lg">
          Enter your details to sign up.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" type="text" placeholder="Your Name" required className="h-12 sm:h-14 text-lg sm:text-xl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required className="h-12 sm:h-14 text-lg sm:text-xl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required className="h-12 sm:h-14 text-lg sm:text-xl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" required className="h-12 sm:h-14 text-lg sm:text-xl" />
        </div>
        <Button type="submit" className="w-full h-12 sm:h-14 text-lg sm:text-xl">
          Sign Up
        </Button>
      </div>
      <div className="text-center text-sm sm:text-base">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Login
        </a>
      </div>
      <div className="relative text-center text-sm sm:text-base">
        <div className="absolute inset-0 top-1/2 h-[1px] w-full bg-border" />
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>
      <Button variant="outline" className="w-full h-12 sm:h-14 text-lg sm:text-xl gap-2">
        <img src="/google-icon.svg" alt="Google Icon" className="h-5 w-5 sm:h-6 sm:w-6" />
        Sign up with Google
      </Button>
    </form>
  );
}