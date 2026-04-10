import Link from 'next/link';
import { BookOpenText, Palette, PenTool, Type, WandSparkles } from 'lucide-react';

export const metadata = {
  title: 'Logo Guides | Smart Logo Maker',
  description:
    'Read practical logo design guides for choosing styles, fonts, colors, and brand directions before generating and editing your next logo.',
};

const guides = [
  {
    title: 'How to choose a logo style',
    description: 'Match your logo direction to your audience, market position, and brand personality before generating concepts.',
    icon: WandSparkles,
  },
  {
    title: 'How to pick logo fonts',
    description: 'Understand when modern, elegant, bold, or minimal typography creates the right tone for your business.',
    icon: Type,
  },
  {
    title: 'How to choose brand colors',
    description: 'Use color psychology and contrast to build a palette that feels deliberate, readable, and memorable.',
    icon: Palette,
  },
  {
    title: 'How to refine a generated logo',
    description: 'Know what to edit first after generation so you improve the mark instead of overworking it.',
    icon: PenTool,
  },
];

const relatedLinks = [
  {
    href: '/templates',
    title: 'Browse template ideas',
    description: 'Use template categories when you want faster starting directions for different business types.',
  },
  {
    href: '/case-studies',
    title: 'Review example outcomes',
    description: 'See how branding decisions can shift across industries and use cases.',
  },
  {
    href: '/create',
    title: 'Apply it in the app',
    description: 'Move from reading guides to creating and testing concepts inside the product.',
  },
];

export default function GuidesPage() {
  return (
    <main className="relative overflow-hidden bg-[#f8fafc]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,92,1,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.10),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_50%,#fffaf7_100%)]" />

      <section className="relative mx-auto max-w-7xl px-6 pb-14 pt-28 sm:pb-20 sm:pt-32">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-700 shadow-sm">
            <BookOpenText className="h-4 w-4 text-[#ff5c01]" />
            Logo Design Guides
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Practical guides to help you make better branding decisions before you click generate.
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
            These guides explain how to think about fonts, color, style, and refinement so your generated logos start stronger and need fewer corrections later.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-16 sm:pb-20">
        <div className="grid gap-5 lg:grid-cols-2">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <article
                key={guide.title}
                className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-950">{guide.title}</h2>
                    <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{guide.description}</p>
                    <Link
                      href="/create?fresh=1"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#ff5c01] transition hover:text-[#e25500]"
                    >
                      Try this in the creator
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2.2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_25px_90px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/60">Related pages</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Connect the guide content to the rest of the site.
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
        </div>
      </section>
    </main>
  );
}
