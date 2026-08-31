import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ktluxurycars.com"),
  title: {
    default:
      "KT Luxury Cars | Premium Car Rental in Marrakech",
    template: "%s | KT Luxury Cars",
  },
  description:
    "Rent carefully selected cars in Marrakech with airport delivery, transparent pricing and personal assistance. Economy, SUV, premium and luxury vehicles.",
  keywords: [
    "car rental Marrakech",
    "Marrakech airport car rental",
    "luxury car rental Marrakech",
    "rent a car Morocco",
    "location voiture Marrakech",
    "Marrakech rental cars",
  ],
  openGraph: {
    title: "KT Luxury Cars Marrakech",
    description:
      "Premium car rental in Marrakech with airport delivery and personal assistance.",
    type: "website",
    locale: "en_GB",
    siteName: "KT Luxury Cars",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}