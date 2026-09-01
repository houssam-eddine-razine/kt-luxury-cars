import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import {
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
} from "next/font/google";

import { BusinessStructuredData } from "@/components/seo/structured-data";

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
    "Rent carefully selected cars in Marrakech with airport delivery, transparent pricing and personal assistance. Explore economy, SUV, premium and luxury vehicles.",

  keywords: [
    "car rental Marrakech",
    "Marrakech airport car rental",
    "luxury car rental Marrakech",
    "rent a car Morocco",
    "location voiture Marrakech",
    "location voiture aéroport Marrakech",
    "voiture de luxe Marrakech",
    "Marrakech rental cars",
  ],

  authors: [
    {
      name: "KT Luxury Cars",
    },
  ],

  creator: "KT Luxury Cars",
  publisher: "KT Luxury Cars",

  openGraph: {
    title: "KT Luxury Cars Marrakech",
    description:
      "Premium car rental in Marrakech with airport delivery, transparent conditions and personal assistance.",
    url: "https://ktluxurycars.com",
    siteName: "KT Luxury Cars",
    type: "website",
    locale: "en_GB",
    alternateLocale: ["fr_FR"],
  },

  twitter: {
    card: "summary_large_image",
    title: "KT Luxury Cars Marrakech",
    description:
      "Premium car rental in Marrakech with airport delivery and personal assistance.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const language = locale === "fr" ? "fr" : "en";

  return (
    <html
      lang={language}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <BusinessStructuredData locale={language} />

        {children}
      </body>
    </html>
  );
}