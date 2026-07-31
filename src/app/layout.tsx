import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { RouteLoader } from "@/components/shared/route-loader";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Brand display face — condensed & heavy, standing in for Helvetica Neue Condensed Black.
const oswald = Oswald({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://motorcycleproducts.co.za"),
  title: {
    default: "Motorcycle Products — SA's Trusted Motorcycle Parts Marketplace",
    template: "%s | Motorcycle Products",
  },
  description:
    "Buy and sell new and used motorcycle parts across South Africa. Buyer Protection payments, verified sellers, nationwide delivery.",
  keywords: [
    "motorcycle parts",
    "used motorcycle parts",
    "South Africa",
    "OEM parts",
    "bike breakers",
  ],
  openGraph: {
    title: "Motorcycle Products",
    description:
      "South Africa's most trusted marketplace for new and used motorcycle parts.",
    type: "website",
    locale: "en_ZA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Suspense fallback={null}>
          <RouteLoader />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
