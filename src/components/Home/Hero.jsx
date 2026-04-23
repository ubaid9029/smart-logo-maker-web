'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiStar } from "react-icons/hi2";
import { useMemo } from 'react';

const Hero = () => {
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
  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-8 md:pb-16 w-full flex flex-col items-center">
      
      {/* Background Container — Keeps backgrounds relative to the 1440px center, preventing extreme stretching on ultra-wide screens */}
        <div className="absolute inset-0 z-0 mx-auto w-full max-w-360 pointer-events-none select-none">
        {/* Background logo decoration */}
        <Image
          src="/logos/logo1.svg"
          alt="background-decoration"
          width={750}
          height={750}
          className="absolute -right-[5%] -bottom-[15%] w-48 rotate-12 object-cover object-top opacity-15 blur-[1px] transition-all duration-700 ease-in-out sm:w-64 md:-right-[8%] md:-bottom-[15%] md:w-96 md:rotate-15 lg:w-120"
          style={{
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          }}
        />

        {/* Animated dots */}
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
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot.delay,
            }}
          />
        ))}

        {/* Blur orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] right-0 h-64 w-64 rounded-full bg-purple-200/40 blur-[80px] md:h-96 md:w-96 md:blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-orange-200/30 blur-[80px] md:h-80 md:w-80 md:blur-[100px]"
        />
      </div>

      {/* Content Container — only textual/interactive content is contained within max-w-[1440px] */}
      <div className="relative z-10 w-full max-w-360 px-6 pb-16 md:px-12 md:pb-20">
        
        {/* Main content */}
        <div className="relative z-10 text-center pt-10 md:pt-14">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-[36px] font-black leading-[1.1] tracking-tight text-[#0f172a] sm:text-[50px] md:text-[80px]"
        >
          Create Stunning Logos <br />
          <span className="relative mt-2 inline-block">
            <span className="bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] bg-clip-text text-transparent">
              In Seconds
            </span>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute -bottom-1 left-0 flex w-full justify-center overflow-hidden md:-bottom-2"
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
          className="mx-auto mb-10 max-w-2xl text-base font-medium leading-relaxed text-slate-700 md:text-xl"
        >
          Transform your brand vision into reality with AI-powered logo generation. Professional designs made easy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-6"
        >
          <Link href="/create?fresh=1" className="brand-button-primary inline-flex px-8 py-3 text-base md:px-10 md:py-4 md:text-lg">
            Get Started Free
          </Link>
          <Link href="/how-it-works" className="brand-button-outline inline-flex px-8 py-3 text-base md:px-10 md:py-4 md:text-lg">
            See How It Works
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-600 md:text-base"
        >
          <div className="flex items-center gap-2 rounded-full border border-pink-100 bg-white/90 px-4 py-2 shadow-sm">
            <div className="flex items-center gap-0.5 text-[#FFB800]">
              <HiStar className="text-base" />
              <HiStar className="text-base" />
              <HiStar className="text-base" />
              <HiStar className="text-base" />
              <HiStar className="text-base" />
            </div>
            <span>4.9/5 average rating</span>
          </div>

          <div className="rounded-full border border-pink-100 bg-white/90 px-4 py-2 shadow-sm">
            Trusted by 10,000+ users
          </div>

          <div className="rounded-full border border-pink-100 bg-white/90 px-4 py-2 shadow-sm">
            50,000+ logos created
          </div>

          <div className="rounded-full border border-pink-100 bg-white/90 px-4 py-2 shadow-sm">
            Free logo creation flow
          </div>
        </motion.div>
      </div>
      </div>
    </section>
  );
};

export default Hero;
