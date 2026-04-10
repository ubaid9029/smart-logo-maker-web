import Link from 'next/link';
import { BriefcaseBusiness, Building2, Rocket, ShoppingBag, Stethoscope } from 'lucide-react';

export const metadata = {
  title: 'Logo Case Studies | Smart Logo Maker',
  description:
    'Review logo case study examples across startups, ecommerce, healthcare, and service businesses to understand stronger branding directions.',
};

const caseStudies = [
  {
    title: 'Startup launch brand',
    summary: 'A fast-moving startup needs a logo that feels modern, scalable, and credible from day one.',
    takeaway: 'Clean symbols, restrained color, and confident typography usually outperform overly decorative directions.',
    icon: Rocket,
  },
  {
    title: 'Ecommerce product brand',
    summary: 'A product-led store needs a mark that is memorable in small spaces like packaging, thumbnails, and ads.',
    takeaway: 'Strong silhouette, tighter hierarchy, and clear color contrast improve recognition across channels.',
    icon: ShoppingBag,
  },
  {
    title: 'Professional services firm',
    summary: 'Consultants, agencies, and advisors often need logos that feel reliable without looking generic.',
    takeaway: 'Typography-led systems with controlled accent color often feel more trustworthy than busy icon-first concepts.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Healthcare or wellness business',
    summary: 'Brands in care-focused industries need logos that feel calm, readable, and reassuring.',
    takeaway: 'Balanced spacing, soft color decisions, and high readability help the logo feel more dependable.',
    icon: Stethoscope,
  },
  {
    title: 'Local business identity',
    summary: 'Local brands often need a flexible logo that works on signs, social media, and printed material.',
    takeaway: 'Simple shapes and clear wordmarks travel better across everyday local business touchpoints.',
    icon: Building2,
  },
];

const relatedLinks = [
  {
    href: '/templates',
    title: 'Start from templates',
    description: 'Use template directions when you want faster brand exploration after reviewing these examples.',
  },
  {
    href: '/guides',
    title: 'Learn the design logic',
    description: 'Pair these scenarios with practical brand guides for fonts, colors, and refinement.',
  },
  {
    href: '/create',
    title: 'Build your own logo',
    description: 'Take what you learned from the examples and test it in the actual creation flow.',
  },
];

export default function CaseStudiesPage() {
  return (
    <main className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.05),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,92,1,0.10),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fffaf7_100%)]" />

      <section className="relative mx-auto max-w-7xl px-6 pb-14 pt-28 sm:pb-20 sm:pt-32">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-700 shadow-sm">
            <BriefcaseBusiness className="h-4 w-4 text-[#ff5c01]" />
            Case Studies
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Example logo scenarios to show how branding decisions change by industry and business type.
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
            These case-study style examples help users understand why one logo direction works better than another in different contexts.
            They also create stronger internal topic coverage for search and navigation.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-16 sm:pb-20">
        <div className="grid gap-5 xl:grid-cols-2">
          {caseStudies.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff4ed] text-[#ff5c01] shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-black tracking-tight text-slate-950">{item.title}</h2>
                    <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{item.summary}</p>
                    <div className="mt-4 rounded-[1.25rem] bg-slate-50 px-4 py-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Key takeaway</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{item.takeaway}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2.2rem] border border-white/70 bg-gradient-to-r from-slate-950 via-[#1f1037] to-[#4a1628] px-6 py-8 text-white shadow-[0_25px_90px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/60">Internal links</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Move from examples to action.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {relatedLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10"
                >
                  <h3 className="text-base font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/create?fresh=1"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-slate-100"
            >
              Start Creating
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
