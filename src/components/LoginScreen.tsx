"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Immersion for login page: make the entire viewport black
    const originalBodyBg = document.body.style.backgroundColor;
    const originalHtmlBg = document.documentElement.style.backgroundColor;

    document.body.style.backgroundColor = "black";
    document.documentElement.style.backgroundColor = "black";

    return () => {
      // Restore original styles on unmount
      document.body.style.backgroundColor = originalBodyBg;
      document.documentElement.style.backgroundColor = originalHtmlBg;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans items-center justify-center px-8 lowercase overflow-hidden relative">

      <div className="w-full max-w-xs flex flex-col items-center">
        {/* GIF Container with Layered Text */}
        <div className="relative w-full aspect-square flex items-center justify-center">
          <img
            src="/water.gif"
            alt="Water Background"
            className="w-full h-full object-contain scale-[1.8] mix-blend-screen opacity-80"
            style={{
              maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)'
            }}
          />
          <h1
            className="absolute text-[24px] font-medium tracking-tight text-white/90 text-center pointer-events-none select-none"
            style={{ fontFamily: '"Milanesa Serif", serif' }}
          >
            selamat datang kembali
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-3 -mt-8 z-10">
          <Input
            id="email"
            name="email"
            placeholder="username"
            type="email"
            required
            disabled={isPending}
            className="!bg-transparent !border-white/20 !text-white/60 !placeholder:text-white/20 !rounded-xl !py-6 !px-6"
          />
          <Input
            id="password"
            name="password"
            placeholder="password"
            type="password"
            required
            disabled={isPending}
            className="!bg-transparent !border-white/20 !text-white/60 !placeholder:text-white/20 !rounded-xl !py-6 !px-6"
          />

          <div className="flex justify-center pt-10">
            <button
              type="submit"
              disabled={isPending}
              className="p-4 text-white hover:text-white/70 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <span className="animate-pulse">...</span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-log-in"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-400 text-center pt-2 opacity-70">
              {errorMessage.toLowerCase()}
            </p>
          )}
        </form>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center opacity-20">
        <p className="text-[10px] text-white leading-relaxed normal-case">
          © 2026 PT. Purnama Timur Laut.<br />
          Seluruh Hak Cipta Dilindungi Undang Undang.
        </p>
      </div>
    </div>
  );
}
