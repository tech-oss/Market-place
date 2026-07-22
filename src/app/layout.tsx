import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
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
    "Buy and sell new and used motorcycle parts across South Africa. Escrow-protected payments, verified sellers, nationwide delivery.",
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
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
