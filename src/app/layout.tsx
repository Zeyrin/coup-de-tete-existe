import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { AuthButton } from "@/components/AuthButton";
import { HeaderLogo } from "@/components/HeaderLogo";
import Providers from "@/components/Providers";
import HeaderNav from "@/components/HeaderNav";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Coup de Tête - Aventure Spontanée",
  description: "Découvre ta prochaine destination en un coup de roue!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <Providers>
          <header className="fixed top-0 left-0 right-0 z-50 bg-[#80a0c3] border-b-4 border-black">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <HeaderLogo />
              <div className="flex items-center gap-1.5 sm:gap-2">
                <HeaderNav />
                <AuthButton />
              </div>
            </div>
          </header>
          <main className="pt-16">
            {children}
          </main>
          <Analytics />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
