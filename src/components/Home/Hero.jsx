'use client';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { HiArrowRight } from "react-icons/hi";
import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

const Hero = () => {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const dotsData = useMemo(() => (
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      width: `${4 + ((i * 3) % 9)}px`,
      height: `${4 + ((i * 5) % 9)}px`,
      left: `${(i * 11) % 100}%`,
      top: `${60 + ((i * 7) % 40)}%`,
      duration: 5 + (i % 5),
      delay: (i % 6) * 0.4,
    }))
  ), []);

  const howItWorksSteps = [
    {
      id: '01',
      title: 'Enter Brand Details',
      description: 'Business name, slogan, industry, font, aur color style choose karo taa ke AI ko clear direction mile.',
    },
    {
      id: '02',
      title: 'Generate Logo Concepts',
      description: 'System multiple branded concepts create karta hai jahan icon, typography, palette, aur card background already styled hotay hain.',
    },
    {
      id: '03',
      title: 'Refine In Editor',
      description: 'Result me se best design select karke text, logo parts, colors, outlines, background, shapes aur textures sab customize karo.',
    },
    {
      id: '04',
      title: 'Preview, Save, Download',
      description: 'Final review ke baad design save karo aur SVG, PNG, JPG, WebP, ya PDF me export kar lo.',
    },
  ];

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const { body, documentElement } = document;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    if (howItWorksOpen) {
      body.classList.add('modal-open');
      documentElement.classList.add('modal-open');
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
    } else {
      const lockedTop = body.style.top;
      body.classList.remove('modal-open');
      documentElement.classList.remove('modal-open');
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';

      if (lockedTop) {
        const nextScrollY = Math.abs(parseInt(lockedTop, 10)) || 0;
        window.scrollTo(0, nextScrollY);
      }
    }

    return () => {
      const lockedTop = body.style.top;
      body.classList.remove('modal-open');
      documentElement.classList.remove('modal-open');
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';

      if (lockedTop) {
        const nextScrollY = Math.abs(parseInt(lockedTop, 10)) || 0;
        window.scrollTo(0, nextScrollY);
      }
    };
  }, [howItWorksOpen]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20">

      {/* 1. BACKGROUND IMAGE*/}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/logos/logo1.svg"
          alt="background-decoration"
          className="absolute 
               /* Position fixing */
               -right-[5%] -bottom-[15%] 
               md:-right-[8%] md:-bottom-[15%] 
               
               /* Size handling */
               w-70 sm:w-100 md:w-150 lg:w-187.5 
               
               /* Magic part: niche wala hissa chhupane ke liye */
               object-cover object-top 
               
               /* Styling */
               rotate-12 md:rotate-15 
               opacity-15 blur-[1px] 
               transition-all duration-700 ease-in-out"
          style={{
            // Isse niche wala black part mazeed cut ho jayega
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
          }}
          onError={() => console.log("Check if /logos/logo1.svg exists")}
        />
      </div>

      {/* 2. ANIMATED DOTS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {dotsData.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute rounded-full bg-linear-to-r from-[#ff5c01] to-[#c400ff] opacity-20"
            style={{
              width: dot.width,
              height: dot.height,
              left: dot.left,
              top: dot.top,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot.delay
            }}
          />
        ))}
      </div>

      {/* 3. BACKGROUND BLOBS */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] right-[-5%] w-64 h-64 md:w-125 md:h-125 bg-purple-200/40 rounded-full blur-[80px] md:blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] left-[-5%] w-60 h-60 md:w-112.5 md:h-112.5 bg-orange-200/30 rounded-full blur-[80px] md:blur-[100px]"
      />

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[36px] sm:text-[50px] md:text-[80px] font-black text-[#0f172a] tracking-tight leading-[1.1] mb-6"
        >
          Create Stunning Logos <br />
          <span className="relative inline-block mt-2">
            <span className="bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] bg-clip-text text-transparent">
              In Seconds
            </span>

            {/* THE CURVED UNDERLINE */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute -bottom-1 md:-bottom-2 left-0 w-full flex justify-center overflow-hidden"
            >
              <svg width="100%" height="12" viewBox="0 0 200 12" fill="none" className="w-[95%]">
                <path d="M4 8C40 2 160 2 196 8" stroke="url(#line_grad)" strokeWidth="4" strokeLinecap="round" />
                <defs>
                  <linearGradient id="line_grad" x1="4" y1="5" x2="196" y2="5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff5c01" />
                    <stop offset="0.5" stopColor="#ff007a" />
                    <stop offset="1" stopColor="#c400ff" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-gray-500 text-base md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed"
        >
          Transform your brand vision into reality with AI-powered logo generation. Professional designs made easy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
        >
          <Link href="/create">
            <button className="brand-button-primary group gap-3 px-8 md:px-10 py-3 md:py-4 text-base md:text-lg">
              Get Started Free
              <HiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button
            onClick={() => setHowItWorksOpen(true)}
            className="brand-button-outline px-8 md:px-10 py-3 md:py-4 text-base md:text-lg"
          >
            See How It Works
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {howItWorksOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md"
            onClick={() => setHowItWorksOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="relative m-[10px] max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/60 bg-white/95 shadow-[0_30px_120px_rgba(15,23,42,0.28)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-[#ff5c01]/20 via-[#ff007a]/15 to-[#c400ff]/20" />
              <div className="relative p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center rounded-full border border-[#ff5c01]/15 bg-[#fff4ed] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#ff5c01]">
                      Smart Flow
                    </div>
                    <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                      How The Logo Builder Works
                    </h3>
                    <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">
                      Simple flow, professional output. Start from brand details, refine every layer in editor, then export the final logo in production-ready formats.
                    </p>
                  </div>
                  <button
                    onClick={() => setHowItWorksOpen(false)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {howItWorksSteps.map((step) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: Number(step.id) * 0.05 }}
                      className="rounded-[1.6rem] border border-slate-100 bg-white/90 p-5 shadow-[0_12px_45px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] text-sm font-black text-white shadow-lg">
                          {step.id}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900">{step.title}</h4>
                          <p className="mt-2 text-sm font-medium leading-7 text-slate-600">{step.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    Tip: results ke baad editor me har major element ko independently adjust kar sakte ho.
                  </p>
                  <Link href="/create">
                    <button className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] px-6 py-3 text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.02]">
                      Start Creating
                      <HiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;
