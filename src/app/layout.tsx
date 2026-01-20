import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { AuthButton } from "@/components/AuthButton";
import Link from "next/link";

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
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#80a0c3] border-b-4 border-black">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
              <h1>Coup de Tête</h1>
            </Link>
            <AuthButton />
          </div>
        </header>
        <main className="pt-16">
          {children}
        </main>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
