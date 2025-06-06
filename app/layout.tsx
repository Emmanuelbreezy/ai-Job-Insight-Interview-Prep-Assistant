import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "@/context/ConvexClientProvider";
import { Suspense } from "react";
import FallbackLoader from "@/components/FallbackLoader";

const onest = Onest({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`w-full bg-white ${onest.className}`}
          suppressHydrationWarning
        >
          <ConvexClientProvider>
            <Suspense fallback={<FallbackLoader />}>
              <NuqsAdapter>{children}</NuqsAdapter>
            </Suspense>
          </ConvexClientProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
