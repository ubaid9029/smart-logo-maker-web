import Link from 'next/link';
import { ArrowRight, LayoutTemplate, Palette, Sparkles, Tags, Type } from 'lucide-react';

export const metadata = {
  title: 'Logo Templates | Smart Logo Maker',
  description:
    'Explore logo template ideas for startups, ecommerce brands, consultants, creators, and local businesses. Start faster with proven design directions.',
};

const templateCategories = [
  {
    title: 'Startup Templates',
    description: 'Modern wordmarks, clean icon systems, and confident tech-friendly compositions for new ventures.',
    icon: Sparkles,
  },
  {
    title: 'Ecommerce Templates',
    description: 'Bold, memorable logo directions designed for online stores, product brands, and digital-first retail.',
    icon: Tags,
  },
  {
    title: 'Service Business Templates',
    description: 'Professional layouts for agencies, consultants, coaches, builders, and other client-facing businesses.',
    icon: LayoutTemplate,
  },
  {
    title: 'Minimal Brand Templates',
    description: 'Simple logo systems with restrained color, elegant spacing, and typography-led presentation.',
    icon: Type,
  },
  {
    title: 'Color-Driven Concepts',
    description: 'Template directions built around strong palettes, contrast, and brand mood exploration.',
    icon: Palette,
  },
];

const relatedLinks = [
  {
    href: '/guides',
    title: 'Read logo guides',
    description: 'Learn how to choose styles, colors, and structure before you generate.',
  },
  {
    href: '/case-studies',
    title: 'See case studies',
    description: 'Review example brand scenarios and how different logo directions can work.',
  },
  {
    href: '/how-it-works',
    title: 'See the workflow',
    description: 'Understand the full journey from setup to editing and download.',
  },
];

export default function TemplatesPage() {
  return (
    <main className="relative overflow-hidden bg-[#fffaf7]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,92,1,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(196,0,255,0.10),transparent_30%),linear-gradient(180deg,#fffaf7_0%,#ffffff_55%,#fff7ed_100%)]" />

      <section className="relative mx-auto max-w-7xl px-6 pb-14 pt-28 sm:pb-20 sm:pt-32">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff5c01]/20 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#ff5c01] shadow-sm">
            <LayoutTemplate className="h-4 w-4" />
            Logo Templates
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Template directions to help you start with stronger logo ideas.
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
            Use these template categories to think faster about structure, mood, and brand style before you generate.
            They are not fixed files. They are practical directions that help you pick better starting points inside Smart Logo Maker.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
            >
              Create a Logo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/guides"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Read Guides
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-16 sm:pb-20">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templateCategories.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff5c01] via-[#ff007a] to-[#7c3aed] text-white shadow-lg">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{item.description}</p>
                <Link
                  href="/create"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#ff5c01] transition hover:text-[#e25500]"
                >
                  Use this direction
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2.2rem] border border-white/70 bg-white/92 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5c01]">Related resources</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Keep exploring the site structure</h2>
            </div>
            <p className="max-w-2xl text-sm font-medium leading-7 text-slate-600">
              These pages support the same logo creation journey and help users understand style choices, workflow, and use cases.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {relatedLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.5rem] border border-slate-100 bg-slate-50 px-5 py-5 transition hover:border-slate-200 hover:bg-white"
              >
                <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
