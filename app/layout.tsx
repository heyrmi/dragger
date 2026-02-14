import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dragger — Quit together",
  description:
    "Track your cigarette consumption with friends. Social accountability to help you quit.",
  openGraph: {
    title: "Dragger — Quit together",
    description:
      "Track your cigarette consumption with friends. Social accountability to help you quit.",
    type: "website",
    siteName: "Dragger",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dragger — Quit together",
    description:
      "Track your cigarette consumption with friends. Social accountability to help you quit.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
