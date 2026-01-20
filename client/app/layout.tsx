import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SyncFlix | Synchronized Movie Watching",
  description: "Watch movies together with friends in perfect sync, no matter where you are. Real-time synchronized streaming.",
  keywords: ["watch party", "synchronized viewing", "watch together", "movie sync", "video streaming"],
  authors: [{ name: "SyncFlix" }],
  openGraph: {
    title: "SyncFlix | Synchronized Movie Watching",
    description: "Watch movies together with friends in perfect sync, no matter where you are",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${bebasNeue.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
