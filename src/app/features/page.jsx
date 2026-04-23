import Link from 'next/link';
import Features from '../../components/Home/Features.jsx';

export const metadata = {
  title: 'AI Logo Maker Features | Smart Logo Maker',
  description:
    'Explore all Smart Logo Maker features including AI logo generation, customization tools, templates, and high-quality exports for professional branding.',
  keywords: [
    'AI logo maker features',
    'logo design tools',
    'logo customization',
    'logo templates',
    'high quality logo export',
  ],
  alternates: {
    canonical: '/features',
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smart-logomaker.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'AI Logo Maker Features',
  description:
    'Complete feature overview for Smart Logo Maker, including AI generation, customization controls, templates, and export options.',
  url: `${siteUrl}/features`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Smart Logo Maker',
    url: siteUrl,
  },
};

export default function FeaturesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="bg-white pt-24">
        <section className="mx-auto max-w-7xl px-6 pb-8 text-center">
          <p className="inline-flex items-center rounded-full border border-[#ff5c01]/20 bg-[#fff7ed] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#ff5c01]">
            Product Capabilities
          </p>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Powerful AI Logo Maker Features
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
            Discover every core feature that helps you create, customize, and export professional logos fast.
            This page is dedicated to the Smart Logo Maker feature set so you can evaluate the platform before you start designing.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/create?fresh=1"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
            >
              Start Creating
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              See How It Works
            </Link>
          </div>
        </section>

        <Features />
      </main>
    </>
  );
}
