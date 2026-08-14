import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue, Barlow_Condensed, Playfair_Display } from "next/font/google";
import ScrollProvider from "@/components/providers/ScrollProvider";
import PopupSponsor from "@/components/common/PopupSponsor";
import IndependencePopup from "@/components/common/IndependencePopup";
import "./globals.css";

// Load Google Fonts and map them to custom CSS variables
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Beast Hunter Challenge | Premium Fitness Events & Challenges",
    template: "%s | The Beast Hunter Challenge",
  },
  description: "Discover upcoming races, register online, challenge yourself, and push your limits with the premium fitness event platform.",
  keywords: ["fitness events", "marathons", "runs", "challenges", "athletic races", "India runs", "The Beast Hunter Challenge"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://thebeasthunterchallenge.com"
  ),
  openGraph: {
    title: "The Beast Hunter Challenge | Premium Fitness Events",
    description: "Discover upcoming races, register online, and push your limits.",
    url: "/",
    siteName: "The Beast Hunter Challenge",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Beast Hunter Challenge | Premium Fitness Events",
    description: "Discover upcoming races, register online, and push your limits.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebasNeue.variable} ${barlowCondensed.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-deep-black text-white flex flex-col noise-overlay">
        <ScrollProvider>
          {children}
          <PopupSponsor />
          <IndependencePopup />
        </ScrollProvider>
      </body>
    </html>
  );
}
