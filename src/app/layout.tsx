import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getBranding, brandingCss } from "@/server/services/settings";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "DDU Clinic",
    template: "%s · DDU Clinic",
  },
  description:
    "ERP clinic management platform for the Dire Dawa University Student Clinic Center.",
  applicationName: "DDU Clinic",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "DDU Clinic", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#16a085",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const branding = await getBranding();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandingCss(branding) }} />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
