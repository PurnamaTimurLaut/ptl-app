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
    <div className="flex flex-col min-h-screen bg-black font-sans items-center py-20 px-8 lowercase">
      
      {/* Logo GIF */}
      <div className="w-32 h-32 mb-8 flex items-center justify-center overflow-hidden rounded-full border border-white/10 shadow-2xl">
        <img src="/water.gif" alt="Water Logo" className="w-full h-full object-cover scale-110" />
      </div>

      <h1 className="text-[20px] font-medium tracking-tight text-white text-center mb-12 leading-tight" style={{ fontFamily: '"Milanesa Serif", serif' }}>
        selamat datang kembali,
      </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <Input id="email" name="email" placeholder="email" type="email" required disabled={isPending} 
            className="!bg-white/[0.05] !border-white/10 !text-white !placeholder:text-white/30 !rounded-2xl" />
          <Input id="password" name="password" placeholder="password" type="password" required disabled={isPending} 
            className="!bg-white/[0.05] !border-white/10 !text-white !placeholder:text-white/30 !rounded-2xl" />
          
          <Button type="submit" variant="primary" fullWidth className="!bg-white !text-black !rounded-full !font-bold py-4 mt-4" disabled={isPending}>
            {isPending ? "tunggu sebentar..." : "masuk"}
          </Button>

          {errorMessage && (
            <p className="text-sm text-red-400 text-center">{errorMessage.toLowerCase()}</p>
          )}

          <Button type="button" variant="ghost" fullWidth className="!bg-transparent !text-white/50 border border-white/20 !rounded-full !font-medium py-4 text-xs hover:!bg-white/[0.05]">
            masuk dengan nomor telepon
          </Button>
        </form>

      <div className="mt-auto text-center opacity-30">
        <p className="text-[10px] text-white leading-tight">
          © 2026 pt purnama timur laut.<br/>
          seluruh hak cipta dilindungi undang-undang.
        </p>
      </div>
    </div>
  );
}
