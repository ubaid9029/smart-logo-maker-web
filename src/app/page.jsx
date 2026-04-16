import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense } from "react";
import PremiumLoader from "../components/Shared/PremiumLoader.jsx";

import Hero from "../components/Home/Hero.jsx";
import Features from "../components/Home/Features.jsx";

const SectionPlaceholder = ({ title, tone = "light" }) => (
  <section
    aria-hidden="true"
    className={`px-6 py-20 ${tone === "dark" ? "bg-[#03030b]" : "bg-white"}`}
  >
    <div className="mx-auto max-w-7xl">
      <PremiumLoader
        size="md"
        text={`Loading ${title}...`}
        className={tone === "dark" ? "text-white" : ""}
      />
    </div>
  </section>
);

const Howitworks = dynamic(() => import("../components/Home/HowItWorks.jsx"), {
  suspense: true,
});

const AppPreview = dynamic(() => import("../components/Home/AppPreview.jsx"), {
  suspense: true,
});

const Testimonials = dynamic(() => import("../components/Home/Testimonials.jsx"), {
  suspense: true,
});

const FinalCTA = dynamic(() => import("../components/Home/FinalCTA.jsx"), {
  suspense: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Smart Logo Maker",
      description:
        "Create professional logos in seconds with Smart Logo Maker. Generate, customize, edit, and download AI-powered brand designs for your business online today.",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Smart Logo Maker",
      url: siteUrl,
      logo: `${siteUrl}/assets/icons/SmartLogoMaker.png`,
      email: "support@smartlogomaker.com",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Smart Logo Maker",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "AI-powered logo maker for creating, customizing, editing, and downloading professional brand logos online.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="w-full bg-white overflow-hidden relative">
        <Hero />
        <Features />
        <Suspense fallback={<SectionPlaceholder title="workflow" />}>
          <Howitworks />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder title="app preview" tone="dark" />}>
          <AppPreview />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder title="testimonials" />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder title="call to action" />}>
          <FinalCTA />
        </Suspense>
      </main>
    </>
  );
}
