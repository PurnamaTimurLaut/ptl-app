import type { Metadata } from "next";
import AppSessionProvider from "@/components/AppSessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catering App",
  description: "Catering App Built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-100 text-foreground overflow-x-hidden">
        <AppSessionProvider>
          {children}
        </AppSessionProvider>
      </body>
    </html>
  );
}
