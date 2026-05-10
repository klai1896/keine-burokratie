import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShellLayout } from "@/components/AppShellLayout";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-app-sans",
});

const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-app-display",
});

export const metadata: Metadata = {
  title: "Keine Bürokratie — Berlin relocation & immigration companion",
  description:
    "Plain-English guidance for registration, settlement, and citizenship in Berlin — with optional appointment helpers (non-official).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppShellLayout>{children}</AppShellLayout>
      </body>
    </html>
  );
}
