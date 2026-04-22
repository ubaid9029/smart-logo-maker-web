import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import ConditionalLayout from "../components/MainComponents/ConditionalLayout";
import { Providers } from "./providers";
import ClientPersistGate from "../components/ClientPersistGate";
import Script from 'next/script';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteTitle = "Smart Logo Maker | Free 100%, No Signup & No Watermark";
const siteDescription =
  "The best and fastest AI logo maker. 100% free to use, no signup, and NO watermark. Export in 10+ formats including high-quality vector assets. Openly available and free for everyone.";
const ogImage = "/assets/icons/SmartLogoMaker.png";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | Smart Logo Maker`,
  },
  description: siteDescription,
  keywords: [
    "No watermark logo maker",
    "Free 100% AI logos",
    "10+ formats vector exports",
    "No signup logo generator",
    "Free for everyone branding",
    "Best fast AI logos",
    "Smart Logo Maker",
    "Open logo API",
    "Free vector logos",
  ],
  authors: [{ name: "Smart Logo Maker Team" }],
  creator: "Smart Logo Maker",
  publisher: "Smart Logo Maker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Smart Logo Maker | Best Free AI Logos (No Watermark)",
    description: "Create professional AI logos fast. 100% free, no signup, no watermark. Export in 10+ formats including vectors. Openly available for everyone.",
    url: siteUrl,
    siteName: siteTitle,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Smart Logo Maker - Best Free AI Logos No Watermark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "100% Free AI Logo Maker | No Watermark & No Signup",
    description: "The best way to create AI logos. 10+ formats including vector exports. 100% free for everyone, openly available.",
    images: [ogImage],
    creator: "@smartlogomaker",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/assets/icons/logo_app.png",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/assets/icons/logo_app.png",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable}`}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-7942163788647740" />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7182ZQFKJT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-7182ZQFKJT');
          `}
        </Script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7942163788647740"
          crossorigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <ClientPersistGate>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </ClientPersistGate>
        </Providers>
      </body>
    </html>
  );
}
