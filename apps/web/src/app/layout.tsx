import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "DOPPEL | Find Your Visual Twin",
  description: "Consent-based AI doppelgänger discovery network powered by 512-dimensional ArcFace deep facial embeddings and vector similarity search.",
  keywords: ["AI Doppelgänger", "Visual Twin", "Facial Vector Search", "Biometric Privacy", "ArcFace", "pgvector"],
  authors: [{ name: "DOPPEL Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#06090F] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
