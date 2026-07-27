import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airbnb | Holiday rentals and unique homes",
  description: "Book unique places to stay and things to do on Airbnb.",
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
