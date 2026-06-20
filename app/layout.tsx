import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TekMarketing — AI Marketing Manager",
  description: "Autonomous 24/7 AI marketing agent. Plans, creates, and schedules content with human approval on every publish.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-[#09090b] text-[#f4f4f5] flex flex-col">
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          closeButton 
          className="sonner-toaster"
        />
      </body>
    </html>
  );
}
