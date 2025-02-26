import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
} 