import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  ImagePlus,
  Layers3,
  Palette,
  PenSquare,
  Sparkles,
  Type,
  Wand2,
} from 'lucide-react';

export const metadata = {
  title: 'How It Works | Smart Logo Maker',
};

const workflowSteps = [
  {
    id: '01',
    title: 'Enter your brand details',
    summary: 'Start with the business information that shapes the direction of every generated concept.',
    details: [
      'Add your business name so the generator knows the primary wordmark to feature.',
      'Include a slogan if you want a secondary line in the layout. Leave it empty if you prefer a cleaner mark.',
      'Choose an industry so the logo suggestions feel relevant to your business category.',
    ],
  },
  {
    id: '02',
    title: 'Pick a visual direction',
    summary: 'Choose the style signals that guide the first set of logo concepts.',
    details: [
      'Select a font direction to influence the tone of the brand, such as modern, elegant, bold, or minimal.',
      'Pick a color palette to guide the mood and energy of the generated concepts.',
      'These preferences create a strong starting point, but you can still refine everything later in the editor.',
    ],
  },
  {
    id: '03',
    title: 'Generate logo concepts',
    summary: 'The app creates multiple logo cards with different layouts, symbols, colors, and compositions.',
    details: [
      'Some cards emphasize the brand name, while others lead with an icon or a more balanced composition.',
      'Spacing, hierarchy, symbol treatment, and slogan placement can vary from card to card.',
      'The goal at this stage is to pick the strongest direction, not to perfect every small detail yet.',
    ],
  },
  {
    id: '04',
    title: 'Review and compare results',
    summary: 'Use the results page to compare concepts and decide which direction best fits your brand.',
    details: [
      'Scan several cards side by side to identify the strongest concept for your industry and audience.',
      'Open the preview to get a larger look at the composition before editing.',
      'If a concept is close but not final, send it to the editor for detailed refinement.',
    ],
  },
  {
    id: '05',
    title: 'Refine the design in the editor',
    summary: 'The selected logo opens as an editable composition so you can polish text, graphics, and background styling.',
    details: [
      'Select text or graphics directly on the canvas to reveal the controls that belong to that element.',
      'Adjust placement, scale, rotation, colors, outlines, and other visual properties without rebuilding the design.',
      'Use the background tools to switch between solid colors, gradients, textures, images, and decorative shapes.',
    ],
  },
  {
    id: '06',
    title: 'Update text without losing style',
    summary: 'Edit the brand name, slogan, or added text while keeping the design consistent.',
    details: [
      'Update the wording while preserving the current text styling, such as color, size, and family.',
      'Add extra text layers when you need a sub-label, tagline, or secondary message.',
      'Fine-tune the typography until the layout feels balanced and readable.',
    ],
  },
  {
    id: '07',
    title: 'Preview, save, and keep iterating',
    summary: 'Review the latest version before you export so you can catch any spacing or contrast issues.',
    details: [
      'Open preview to see the composition in a cleaner presentation state.',
      'Save your work to preserve the current editor state and continue from the same point later.',
      'Create variations by saving one version first and then experimenting with colors or typography.',
    ],
  },
  {
    id: '08',
    title: 'Download the final file',
    summary: 'Export the logo in the format that matches your next use case.',
    details: [
      'Choose from formats such as SVG, PNG, JPG, WebP, or PDF depending on where the design will be used.',
      'Use vector formats when you need maximum flexibility and crisp scaling.',
      'Use raster formats for quick previews, sharing, mockups, or lightweight web delivery.',
    ],
  },
];

const editorAreas = [
  {
    title: 'Text Editing',
    description: 'Change wording, font styling, size, color, and outlines while keeping the brand presentation consistent.',
    icon: Type,
  },
  {
    title: 'Element Controls',
    description: 'Move, rotate, scale, duplicate, align, and layer individual elements directly on the canvas.',
    icon: Layers3,
  },
  {
    title: 'Color Tools',
    description: 'Adjust single-element colors or apply a broader palette shift to change the overall brand mood.',
    icon: Palette,
  },
  {
    title: 'Background Design',
    description: 'Build the presentation with flat colors, gradients, shapes, textures, and uploaded imagery.',
    icon: ImagePlus,
  },
  {
    title: 'Creative Styling',
    description: 'Use outlines, subtle 3D rotation, and positioning changes to make the design feel more deliberate.',
    icon: Wand2,
  },
  {
    title: 'Export Flow',
    description: 'Preview the result, save your progress, and download the design in the format you need.',
    icon: Download,
  },
];

const practicalTips = [
  'Pick the strongest concept first, then refine. It is faster than trying to rebuild every logo from scratch.',
  'If the brand name is long, prioritize readability before decoration.',
  'Review your design in preview mode before downloading to catch alignment or contrast issues.',
  'Save a stable version before testing a new palette or typography direction.',
];

const exportFormats = [
  {
    format: 'SVG',
    useCase: 'Best for scalable brand assets, UI usage, and future editing.',
  },
  {
    format: 'PNG',
    useCase: 'Best for transparent-background sharing, presentations, and mockups.',
  },
  {
    format: 'JPG',
    useCase: 'Useful for quick previews and image-heavy sharing workflows.',
  },
  {
    format: 'WebP',
    useCase: 'Great for web delivery when you want smaller file sizes.',
  },
  {
    format: 'PDF',
    useCase: 'Helpful for print workflows, documents, and design handoff.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="relative overflow-hidden bg-[#fffaf7]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,92,1,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.12),transparent_28%),linear-gradient(180deg,#fffaf7_0%,#ffffff_45%,#fff7ed_100%)]" />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />

      <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ff5c01]/20 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#ff5c01] shadow-sm">
              <Sparkles className="h-4 w-4" />
              How Smart Logo Maker Works
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">
              A complete walkthrough from brand idea to final download.
            </h1>
            <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
              This guide explains the full Smart Logo Maker workflow in clear English, including concept generation, editor controls,
              saving, previewing, and exporting. If you want to understand the full process before you start, this is the page to use.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
              >
                Start Creating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                Back to Home
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_25px_90px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-slate-950 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/60">Workflow</p>
                <p className="mt-3 text-3xl font-black">8 steps</p>
                <p className="mt-2 text-sm leading-6 text-white/70">From brand setup to export-ready files.</p>
              </div>
              <div className="rounded-[1.4rem] bg-[#fff4ed] p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff5c01]">Core Areas</p>
                <p className="mt-3 text-3xl font-black text-slate-950">6 tools</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Text, canvas objects, colors, background, styling, and export.</p>
              </div>
              <div className="rounded-[1.4rem] border border-slate-100 bg-white p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Best For</p>
                <p className="mt-3 text-lg font-black text-slate-950">Founders, creators, and teams</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Ideal when you need a fast starting point and a flexible editor.</p>
              </div>
              <div className="rounded-[1.4rem] border border-slate-100 bg-white p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Result</p>
                <p className="mt-3 text-lg font-black text-slate-950">Saved and downloadable logos</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Keep refining until the final design feels ready for launch.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-16 sm:pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5c01]">Step-by-step</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              The full workflow
            </h2>
          </div>
          <p className="hidden max-w-md text-right text-sm font-medium leading-6 text-slate-500 lg:block">
            Follow the same sequence when you want the fastest route to a clean, polished logo.
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          {workflowSteps.map((step) => (
            <article
              key={step.id}
              className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff5c01] via-[#ff007a] to-[#7c3aed] text-sm font-black text-white shadow-lg">
                  {step.id}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-950">{step.title}</h3>
                      <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-slate-700">
                        {step.summary}
                      </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Workflow step
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-3">
                    {step.details.map((detail) => (
                      <div
                        key={detail}
                        className="rounded-[1.25rem] border border-slate-100 bg-slate-50 px-4 py-4"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5c01]" />
                          <p className="text-sm font-medium leading-6 text-slate-600">{detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-6 pb-16 lg:grid-cols-[1.05fr_0.95fr] sm:pb-20">
        <div className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5c01]">Inside the editor</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">What you can refine</h2>
            </div>
            <PenSquare className="hidden h-7 w-7 text-slate-300 sm:block" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {editorAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div
                  key={area.title}
                  className="rounded-[1.4rem] border border-slate-100 bg-slate-50/90 p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#ff5c01] shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950">{area.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{area.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/60">Export formats</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Choose the right output</h2>
            <div className="mt-6 space-y-3">
              {exportFormats.map((item) => (
                <div key={item.format} className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-base font-black">{item.format}</span>
                    <Download className="h-4 w-4 shrink-0 text-white/50" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/70">{item.useCase}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5c01]">Practical tips</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Before you export</h2>
            <div className="mt-6 space-y-3">
              {practicalTips.map((tip, index) => (
                <div key={tip} className="flex items-start gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium leading-6 text-slate-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2.2rem] border border-white/70 bg-gradient-to-r from-slate-950 via-[#1f1037] to-[#4a1628] px-6 py-8 text-white shadow-[0_25px_90px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/60">Ready to try it?</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Build, refine, save, and download your logo from one workflow.
              </h2>
              <p className="mt-4 text-sm font-medium leading-7 text-white/75 sm:text-base">
                Start with a strong concept, polish the details in the editor, and export the final version when it is ready.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-slate-100"
              >
                Start Creating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/15"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
