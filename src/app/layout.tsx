// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./component/layout/LayoutWrapper";
import SmartsuppScript from "./component/layout/TawkToScript";
import PageViewTracker from "./component/user/profile/PageViewTracker";
 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChainRise-Patners | Secure Crypto Investment Platform",
  description: "ChainRise-Patners empowers you to grow your wealth through secure, transparent, and high-yield crypto investments.",
  // ... rest of your metadata
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <SmartsuppScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PageViewTracker />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}