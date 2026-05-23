import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import PageTransition from "../components/PageTransition";
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: "Online Shopping Site for Mobiles, Electronics, Fashion & More | Flipkart Clone",
  description: "Shop online for mobiles, electronics, fashion, appliances and more at best deals. Flipkart Clone built with Next.js 15, Prisma & SQLite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <div>
          <Suspense fallback={<div className="bg-fk-blue text-white py-4 text-center font-semibold">Loading...</div>}>
            <Header />
          </Suspense>
          <main className="w-full">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
        <Footer />
        <Toast />
      </body>
    </html>
  );
}
