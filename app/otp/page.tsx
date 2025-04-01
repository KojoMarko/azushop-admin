"use client";

import OtpForm from "@/components/otp-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

export default function OtpPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Get registration data from sessionStorage and start the countdown
  useEffect(() => {
    const data = sessionStorage.getItem("registrationData");
    if (!data) {
      router.push("/register");
      return;
    }
    const parsedData = JSON.parse(data);
    setUserEmail(parsedData.email);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleResendOTP = async () => {
    try {
      setIsSubmitting(true);
      const data = JSON.parse(sessionStorage.getItem("registrationData") || "{}");

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend OTP");
      }

      setCountdown(600); // Reset countdown
      setError(""); // Clear error message
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError("Failed to resend verification code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const registrationData = JSON.parse(sessionStorage.getItem("registrationData") || "{}");

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registrationData.email,
          otp,
          userData: registrationData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "OTP verification failed");
      }

      // Remove registration data from session storage
      sessionStorage.removeItem("registrationData");
      
      // Store token for client-side auth if returned
      if (result.token) {
        localStorage.setItem("authToken", result.token);
      }
      
      // Use NextAuth to create a session
      const loginResult = await signIn("credentials", {
        redirect: false,
        email: registrationData.email,
        password: registrationData.password
      });
      
      if (loginResult?.error) {
        console.log("Auto-login error:", loginResult.error);
        // If auto-login fails, direct to login page
        router.push("/login?verified=true");
        return;
      }
      
      // Success! Direct user to dashboard
      router.push("/dashboard");
      
    } catch (error) {
      console.error("Verification error:", error);
      if (error instanceof Error) {
        setError(error.message || "Invalid verification code");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-3 md:p-5">
        <div className="flex justify-center md:justify-start">
          <div className="flex h-40 w-40 items-center justify-center">
            <img
              src="/azushop-admin.svg"
              alt="Azushop Admin Logo"
              className="h-40 w-40"
            />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm sm:max-w-md">
            <h1 className="text-2xl font-bold text-center mb-4">
              Verify Your Account
            </h1>
            <p className="text-sm text-center text-muted-foreground mb-6">
              Enter the OTP sent to your email to verify your account.
            </p>

            <OtpForm
              onSubmit={handleOtpSubmit}
              error={error}
              countdown={countdown}
              formatTime={formatTime}
              handleResendOTP={handleResendOTP}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/login-image.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}