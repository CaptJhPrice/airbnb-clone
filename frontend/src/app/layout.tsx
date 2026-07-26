import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Staybnb | Holiday rentals and unique homes",
  description: "A full-stack Airbnb-inspired rental marketplace built with Next.js and FastAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-white text-neutral-950">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
