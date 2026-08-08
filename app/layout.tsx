import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Life is a Game — Habit Tracker",
  description: "Clean SaaS Habit Tracker, Task Planner & Yearly Budget Dashboard",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Life is a Game" },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){
              navigator.serviceWorker.getRegistrations().then(function(regs){
                for(var r of regs){ r.update(); }
              });
              navigator.serviceWorker.register('/sw.js');
            }`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
          <Navigation />
        </Providers>
      </body>
    </html>
  );
}
