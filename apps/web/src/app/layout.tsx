import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "DOPPEL | Find Your Visual Twin",
  description: "Consent-based AI visual doppelgänger discovery network powered by 512-dimensional deep facial embeddings and zero-scraping privacy architecture.",
  keywords: ["AI Doppelgänger", "Visual Twin", "Facial Vector Search", "Biometric Privacy", "ArcFace", "pgvector"],
  authors: [{ name: "DOPPEL Network" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-background text-content-primary antialiased selection:bg-brand-cyan selection:text-black">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
