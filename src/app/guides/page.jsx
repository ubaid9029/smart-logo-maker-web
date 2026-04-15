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
    <main className="relative flex min-h-[calc(100dvh-80px)] flex-col justify-between overflow-hidden bg-[#f8fafc]">
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 mx-auto w-full max-w-7xl rounded-[1.75rem] bg-[radial-gradient(circle_at_top_right,rgba(255,92,1,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.10),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_50%,#fffaf7_100%)]" />

      <section className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 pb-6 sm:pb-8 pt-24 sm:pt-28">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-700 shadow-sm">
            <BookOpenText className="h-4 w-4 text-[#ff5c01]" />
            Logo Design Guides
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Practical guides to help you make better branding decisions before you click generate.
          </h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base font-medium leading-7 text-slate-600">
            These guides explain how to think about fonts, color, style, and refinement so your generated logos start stronger and need fewer corrections later.
          </p>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 pb-6 sm:pb-8">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <article
                key={guide.title}
                className="rounded-[1.4rem] border border-white/70 bg-white/92 p-4 sm:p-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-950">{guide.title}</h2>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{guide.description}</p>
                    <Link
                      href="/create?fresh=1"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#ff5c01] transition hover:text-[#e25500]"
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

      <section className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 pb-2 sm:pb-3">
        <div className="rounded-[1.6rem] border border-white/70 bg-slate-950 px-4 sm:px-6 py-5 sm:py-6 text-white shadow-[0_12px_35px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/60">Related pages</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                Connect the guide content to the rest of the site.
              </h2>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              {relatedLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[1rem] border border-white/10 bg-white/5 px-3 py-3 transition hover:bg-white/10"
                >
                  <h3 className="text-sm sm:text-base font-black">{item.title}</h3>
                  <p className="mt-1 text-xs sm:text-sm leading-5 text-white/70">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
