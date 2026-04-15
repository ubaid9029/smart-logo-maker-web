import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import ConditionalLayout from "../components/MainComponents/ConditionalLayout";
import { Providers } from "./providers";
import ClientPersistGate from "../components/ClientPersistGate";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteTitle = "Smart Logo Maker";
const siteDescription =
  "Create professional logos in seconds with Smart Logo Maker. Generate, customize, edit, and download AI-powered brand designs for your business online today.";
const ogImage = "/assets/icons/SmartLogoMaker.png";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Smart Logo Maker preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable}`}>
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
