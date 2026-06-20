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
  title: "TekMarketing — Open Core AI Marketing Agent by TEKHERO",
  description:
    "Strategic AI marketing agent with human-in-the-loop approval. Open Core by TEKHERO — planning, multi-platform content, and full audit trail.",
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
