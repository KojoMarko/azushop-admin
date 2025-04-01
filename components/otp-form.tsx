"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OtpFormProps {
  onSubmit: (otp: string) => void;
  error: string;
  countdown: number;
  formatTime: (seconds: number) => string;
  handleResendOTP: () => void;
  isSubmitting: boolean;
}

export function OtpForm({
  onSubmit,
  error,
  countdown,
  formatTime,
  handleResendOTP,
  isSubmitting,
}: OtpFormProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="otp" className="text-lg sm:text-xl">
          Enter OTP
        </Label>
        <Input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter the OTP sent to your email"
          required
          className="h-16 text-2xl"
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <Button
        type="submit"
        className="w-full h-16 text-2xl"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Verifying..." : "Verify OTP"}
      </Button>

      <div className="mt-4 text-center text-sm">
        <p>
          Code expires in:{" "}
          <span
            className={countdown < 60 ? "text-red-500 font-bold" : ""}
          >
            {formatTime(countdown)}
          </span>
        </p>

        <button
          onClick={handleResendOTP}
          disabled={isSubmitting || countdown > 540} // Allow resend after 1 minute
          className="mt-2 text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
        >
          Resend Code{" "}
          {countdown > 540 && `(${formatTime(countdown - 540)})`}
        </button>
      </div>
    </form>
  );
}
