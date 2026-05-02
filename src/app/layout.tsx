import "./globals.css";
import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GymManager — Gestión de gimnasios",
  description: "Plataforma SaaS para gestión de gimnasios",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={cn(inter.variable, display.variable)}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
