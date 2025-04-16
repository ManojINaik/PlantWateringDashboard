import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "GreenBalcony | Plant Watering Admin Dashboard",
  description: "Professional monitoring and management of plant watering schedules and status in real-time",
  keywords: "plant watering, IoT dashboard, smart gardening, plant management",
  authors: [{ name: "GreenBalcony" }],
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
} 