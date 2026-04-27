'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiDevicePhoneMobile } from 'react-icons/hi2';

const steps = [
  {
    id: 1,
    title: 'AI Design Studio',
    desc: 'Generate stunning logos instantly',
    img: '/images/app1.png',
    alt: 'Smart Logo Maker - AI-powered Home Dashboard Interface',
    offset: 'lg:-mt-12',
  },
  {
    id: 2,
    title: 'Secure Access',
    desc: 'Easy login and sign up options',
    img: '/images/app2.png',
    alt: 'Smart Logo Maker app login and sign up interface for secure account access',
    offset: 'lg:mt-12',
  },
  {
    id: 3,
    title: 'Logo Gallery',
    desc: 'Browse generated design variations',
    img: '/images/app3.png',
    alt: 'Smart Logo Maker generated logo gallery with multiple AI-powered design options',
    offset: 'lg:-mt-12',
  },
  {
    id: 4,
    title: 'Main Dashboard',
    desc: 'Create, customize, and manage logos',
    img: '/images/app4.png',
    alt: 'Smart Logo Maker main dashboard with templates, customization tools, and design history',
    offset: 'lg:mt-12',
  },
];

const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.devsinntechnologies.smartlogomaker';
const playStoreQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(playStoreUrl)}`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function AppPreview() {
  const [activeStep, setActiveStep] = useState(null);

  useEffect(() => {
    if (!activeStep) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveStep(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeStep]);

  return (
    <section id="app-preview" className="relative c overflow-hidden bg-[#03030b] px-6 py-32">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.30]"
          style={{
            backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute right-[10%] top-[30%] h-75 w-75 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-150 w-150 rounded-full bg-purple-600/20 blur-[150px]" />
        <div className="absolute left-[-5%] top-[-10%] h-125 w-125 rounded-full bg-blue-600/20 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: -20 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <HiDevicePhoneMobile className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-pink-500">Experience the App</span>
          </div>

          <h2 className="mb-8 px-4 text-[32px] font-black leading-tight text-white md:text-[52px]">
            Design Anywhere,<br className="hidden md:block" /> Anytime
          </h2>
          <p className="mx-auto mb-20 max-w-4xl px-4 text-lg font-medium text-gray-400 md:text-2xl">
            Professional logo creation at your fingertips with our powerful free mobile app experience
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 items-center justify-items-center gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step) => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              className={`flex w-full max-w-70 flex-col items-center ${step.offset}`}
            >
              <button
                type="button"
                onClick={() => setActiveStep(step)}
                aria-label={`Open full preview: ${step.title}`}
                className="group relative w-full cursor-zoom-in"
              >
                <div className="w-full transition-all duration-500 group-active:scale-95 group-hover:-translate-y-2 group-hover:scale-[1.04]">
                  <Image
                    src={step.img}
                    alt={step.alt}
                    width={777}
                    height={1558}
                    quality={100}
                    sizes="(min-width: 1024px) 18rem, (min-width: 640px) 40vw, 90vw"
                    className="h-auto w-full"
                    priority={step.id === 1}
                  />
                </div>
              </button>

              <h3 className="mb-1 mt-8 text-xl font-bold text-white md:text-2xl">{step.title}</h3>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 md:text-[13px]">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-32"
        >
          <div className="mx-auto flex w-fit flex-col items-center justify-center gap-4 md:flex-row md:items-stretch">
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-fit flex-col items-center justify-center gap-2 rounded-[2rem] bg-linear-to-r from-orange-600 to-purple-600 px-8 py-4 text-center text-sm font-bold text-white transition-all hover:shadow-[0_0_40px_rgba(196,0,255,0.4)] md:px-10 md:text-base"
            >
              <span className="inline-flex items-center flex-col gap-2">
                <Image
                  src="/play-store.png"
                  alt="Download Smart Logo Maker on Google Play"
                  width={200}
                  height={40}
                  className="h-15 w-52 object-contain"
                />
                Available on Play Store
              </span>
            </a>

            <Link
              href="/create?fresh=1"
              className="flex min-w-60 flex-col items-center justify-center rounded-[2rem] border border-white/20 bg-white/5 px-8 py-4 text-center text-sm font-bold text-white transition-all hover:border-white/40 hover:bg-white/10 md:text-base"
            >
              <span>Use Web Editor Now</span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Desktop friendly</span>
            </Link>

            <div className="flex min-w-60 flex-col items-center justify-center rounded-[2rem] border border-white/20 bg-white px-4 py-4 text-center shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
              <img
                src={playStoreQrUrl}
                alt="Scan QR code to download Smart Logo Maker from Google Play"
                width="132"
                height="132"
                loading="lazy"
                className="h-33 w-33 rounded-xl"
              />
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700">Scan to Install</p>
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-[11px] font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-700"
              >
                Open Play Store Link
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {activeStep && (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center bg-black/90 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeStep.title} full-screen preview`}
          onClick={() => setActiveStep(null)}
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setActiveStep(null)}
            className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-sm font-bold text-white"
          >
            Close
          </button>

          <div className="relative max-h-[92vh] w-full max-w-md" onClick={(event) => event.stopPropagation()}>
            <Image
              src={activeStep.img}
              alt={activeStep.alt}
              width={777}
              height={1558}
              quality={100}
              sizes="(max-width: 768px) 90vw, 35vw"
              className="h-auto w-full rounded-2xl object-contain shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
              priority
            />
            <p className="mt-3 text-center text-sm font-semibold text-white/90">{activeStep.title}</p>
          </div>
        </div>
      )}
    </section>
  );
}
