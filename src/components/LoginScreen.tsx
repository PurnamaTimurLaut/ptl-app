"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Apple, Lock, Car, Building2, Settings2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginScreen() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // we handle the state update manually below
    });

    if (result?.error) {
      setErrorMessage("Invalid credentials. Please try again.");
      setIsPending(false);
    } else {
      // Success! useSession will automatically pick up the new session 
      // cookie or we can trigger a hard reload if needed. Let's just 
      // let NextAuth handle the react state sync, but if it doesn't:
      window.location.reload(); 
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-ios-gray-6)] font-sans items-center py-20 px-8">
      
      {/* Logo Placeholder */}
      <div className="w-24 h-24 rounded-full border-4 border-black flex items-center justify-center mb-8">
        {/* Placeholder for real logo */}
      </div>

      <h1 className="text-[28px] font-bold tracking-tight text-black text-center mb-12 leading-tight">
        Selamat Datang<br/>Kembali,
      </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <Input id="email" name="email" placeholder="Email" type="email" required disabled={isPending} />
          <Input id="password" name="password" placeholder="Password" type="password" required disabled={isPending} />
          
          <Button type="submit" variant="primary" fullWidth className="!bg-black !text-white !rounded-full !font-bold" disabled={isPending}>
            {isPending ? "Tunggu sebentar..." : "Masuk"}
          </Button>

          {errorMessage && (
            <p className="text-sm text-red-500 text-center">{errorMessage}</p>
          )}

          <Button type="button" variant="ghost" fullWidth className="!bg-transparent !text-black border border-black !rounded-full !font-bold hover:!bg-black/[0.05]">
            Masuk dengan Nomor Telepon
          </Button>
        </form>

      <div className="mt-auto text-center">
        <p className="text-[10px] text-[var(--color-ios-gray-1)] leading-tight">
          © 2026 PT Purnama Timur Laut.<br/>
          Seluruh Hak Cipta Dilindungi Undang-Undang.
        </p>
      </div>
    </div>
  );
}
