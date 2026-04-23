import dynamic from "next/dynamic";
import Link from "next/link";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smart-logomaker.com";
const tutorialVideoUrl =
  process.env.NEXT_PUBLIC_TUTORIAL_VIDEO_URL ||
  "https://www.youtube.com/embed?listType=search&list=Smart+Logo+Maker+tutorial";

export const metadata = {
  title: "Free AI Logo Maker | No Watermark, No Signup | Smart Logo",
  description: "Experience the fastest AI logo maker with NO watermark and 10+ vector export formats. 100% free to use for everyone—no signup, no hidden fees, just professional brand design.",
  keywords: "free ai logo maker, logo maker no signup, no watermark logo maker, ai logo generator 2026, professional vector logos free, best free logo creator",
  robots: "index, follow",
  alternates: {
    canonical: siteUrl,
  },
};

const VideoTutorialSection = () => (
  <section className="relative bg-white px-6 py-16 md:py-20">
    <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
      <div>
        <p className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-700">
          Quick Tutorial
        </p>
        <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
          Watch how to create a logo in under two minutes.
        </h2>
        <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-700 md:text-lg">
          This guided walkthrough helps first-time visitors understand the full flow: create, customize, preview, and download.
          It improves onboarding confidence and reduces drop-off before users start designing.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/create?fresh=1"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
          >
            Try It Now
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            Read Step-by-Step Guide
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.20)]">
        <div className="aspect-video w-full">
          <iframe
            src={tutorialVideoUrl}
            title="Smart Logo Maker tutorial video"
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  </section>
);

const AeoDirectAnswer = () => (
  <section className="bg-white py-12 px-6 border-b border-slate-50">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">What is the best free AI logo maker in 2026?</h2>
      <div className="bg-slate-50 border-l-4 border-[#FF481B] p-6 rounded-r-2xl shadow-sm">
        <ul className="list-disc space-y-3 pl-5 text-base leading-relaxed text-slate-700 sm:text-lg">
          <li>
            <Link href="/create?fresh=1" className="font-semibold text-[#FF481B]  decoration-indigo-300 underline-offset-2 ">
              Smart Logo Maker
            </Link>{' '}
            is an <strong>AI-powered</strong> logo platform built for fast, professional brand design.
          </li>
          <li>
            Create logos with <strong>No Watermark</strong> and no signup required, making it ideal for startups, creators, and small businesses.
          </li>
          <li>
            Get{' '}
            <Link href="/create?fresh=1" className="font-semibold text-[#FF481B]  decoration-indigo-300 underline-offset-2 ">
              Free vector (SVG) exports
            </Link>{' '}
            and modern logo options optimized for <strong>2026</strong> search and branding trends.
          </li>
        </ul>
      </div>
    </div>
  </section>
);

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Smart Logo Maker",
      alternateName: "Smart Logo Maker AI",
      description:
        "Create professional logos in seconds with Smart Logo Maker. Generate, customize, edit, and download AI-powered brand designs for your business online today.",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Smart Logo Maker",
      url: siteUrl,
      logo: `${siteUrl}/assets/icons/SmartLogoMaker.png`,
      email: "support@smart-logomaker.com",
      sameAs: [
        "https://twitter.com/smartlogomaker",
        "https://www.facebook.com/smartlogomaker",
        "https://www.instagram.com/smartlogomaker",
      ],
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
      featureList: [
        "AI Logo Generation",
        "Drag & Drop Editor",
        "Vector Export",
        "Custom Palettes",
        "Font Library",
      ],
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
        <AeoDirectAnswer />
        <Features />
        <Suspense fallback={<SectionPlaceholder title="workflow" />}>
          <Howitworks />
        </Suspense>
        <VideoTutorialSection />
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
