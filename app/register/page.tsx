import Image from "next/image";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-3 md:p-5">
        <div className="flex justify-center md:justify-start">
          <div className="flex h-10 w-40 items-center justify-center">
            <Image src="/azushop-admin.svg" alt="Azushop Admin Logo" className="h-40 w-40" width={160} height={160} />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm sm:max-w-md">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/login-image.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          layout="fill"
        />
      </div>
    </div>
  );
}