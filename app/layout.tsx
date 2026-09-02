import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Instrument_Serif } from "next/font/google";

import { CartDrawer, CartButton } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IconSprite } from "@/components/Icons";
import { CookieNotice, MobileDock } from "@/components/MobileDock";
import { ScrollProgress } from "@/components/ScrollProgress";
import { CartProvider } from "@/lib/cart";
import { SITE, SITE_URL } from "@/lib/site.config";

import "./globals.css";

/* next/font downloads these at build time and serves them from our own origin,
   so there is no runtime request to Google and no layout shift as they swap. */
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-serif",
  display: "swap",
});

const DESCRIPTION =
  "Evening chai café. Whole spices pounded daily, Assam leaf boiled three times and never steeped, degree filter kaapi, cold shakes and all-day bites. Open from 4pm, every day.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Chuckles & Chai | Masala Chai, Filter Kaapi & Café Food",
    template: "%s | Chuckles & Chai",
  },
  description: DESCRIPTION,
  applicationName: SITE.business.name,
  authors: [{ name: SITE.business.name }],
  keywords: [
    "chai cafe",
    "masala chai",
    "kulhad chai",
    "filter coffee",
    "cafe near me",
    "Chuckles and Chai",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    type: "website",
    siteName: SITE.business.name,
    locale: "en_IN",
    url: "/",
    title: `Chuckles & Chai — ${SITE.business.tagline}`,
    description:
      "Slow-boiled masala chai, degree filter kaapi and food worth staying for. Open from 4pm.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "A glass of hot masala chai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Chuckles & Chai — ${SITE.business.tagline}`,
    description: "Slow-boiled masala chai, degree filter kaapi and food worth staying for.",
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/images/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#FBF8F2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Only pays for cart context when order-ahead is switched on. */
function Shell({ children }: { children: React.ReactNode }) {
  return SITE.features.ordering ? <CartProvider>{children}</CartProvider> : <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable} ${serif.variable}`}>
      <body>
        {/* CartProvider wraps everything so the basket survives navigation
            between the homepage and the legal pages. When ordering is switched
            off the provider is skipped entirely and no basket code ships. */}
        <Shell>
          <a className="skip" href="#main">
            Skip to content
          </a>
          <ScrollProgress />
          <IconSprite />
          <Header />
          {children}
          <Footer />
          <MobileDock />
          <CookieNotice />
          {SITE.features.ordering && (
            <>
              <CartButton />
              <CartDrawer />
            </>
          )}
        </Shell>
      </body>
    </html>
  );
}
