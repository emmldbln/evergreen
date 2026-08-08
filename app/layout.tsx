import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Allura,
} from "next/font/google";

import "./globals.css";

import BottomNavigation from "./components/navigation/BottomNavigation";
import MiniPlayer from "./components/player/MiniPlayer";

import { PlaybackProvider } from "@/lib/playback-store";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

const handwriting = Allura({
  subsets: ["latin"],
  variable: "--font-handwriting",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Evergreen",
  description:
    "A private place for memories, letters, and little moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${handwriting.variable}`}
      suppressHydrationWarning
    >
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#F6FAF5",
          overflowX: "hidden",
          fontFamily: "var(--font-serif)",
          color: "#3F5345",
        }}
      >
        <PlaybackProvider>
          {children}

          {/* ONE MiniPlayer */}
          <MiniPlayer />

          {/* ONE BottomNavigation */}
          <BottomNavigation />
        </PlaybackProvider>
      </body>
    </html>
  );
}