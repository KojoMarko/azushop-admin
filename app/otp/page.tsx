"use client";

import { OtpForm } from "@/components/otp-form";

export default function OtpPage() {
  const handleOtpSubmit = async (otp: string) => {
    // Handle OTP verification logic here
    console.log("Submitted OTP:", otp);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-3 md:p-5">
        <div className="flex justify-center md:justify-start">
          <div className="flex h-40 w-40 items-center justify-center">
            <img src="/azushop-admin.svg" alt="Azushop Admin Logo" className="h-40 w-40" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm sm:max-w-md">
            <h1 className="text-2xl font-bold text-center mb-4">Verify Your Account</h1>
            <p className="text-sm text-center text-muted-foreground mb-6">
              Enter the OTP sent to your email to verify your account.
            </p>
            <OtpForm onSubmit={handleOtpSubmit} />
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