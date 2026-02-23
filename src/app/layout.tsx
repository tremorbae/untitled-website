import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "untitled :p",
  description: "Generative Collection — 2,000 Supply — Launching June 2026 on Ethereum via scatter.art",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/w95fa.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-pixel" suppressHydrationWarning>{children}</body>
    </html>
  );
}
