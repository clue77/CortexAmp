import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CortexAmp - Learn AI by doing",
  description: "Daily AI challenges with instant feedback and progress tracking.",
  openGraph: {
    title: "CortexAmp - Learn AI by doing",
    description: "Daily AI challenges with instant feedback and progress tracking.",
    url: "https://cortexamp.com",
    siteName: "CortexAmp",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CortexAmp - Learn AI by doing",
    description: "Daily AI challenges with instant feedback and progress tracking.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
