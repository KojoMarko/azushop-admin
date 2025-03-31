"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OtpForm({ onSubmit }: { onSubmit: (otp: string) => void }) {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="otp" className="text-lg sm:text-xl">Enter OTP</Label>
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
      <Button type="submit" className="w-full h-16 text-2xl">
        Verify OTP
      </Button>
    </form>
  );
}