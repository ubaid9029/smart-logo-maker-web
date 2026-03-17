'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiArrowRight } from "react-icons/hi";
import { useState, useEffect } from 'react';

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  const [dotsData, setDotsData] = useState([]);

  useEffect(() => {
    const generatedDots = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      width: Math.random() * 8 + 4 + 'px',
      height: Math.random() * 8 + 4 + 'px',
      left: Math.random() * 100 + '%',
      top: (Math.random() * 40 + 60) + '%',
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5
    }));
    setDotsData(generatedDots);
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20">

      {/* 1. BACKGROUND IMAGE*/}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/logo1.svg"
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
          onError={(e) => console.log("Check if /logo1.svg exists")}
        />
      </div>

      {/* 2. ANIMATED DOTS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted && dotsData.map((dot) => (
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
          <Link href="/create/bussiness-info">
            <button className="group flex items-center gap-3 bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-bold text-base md:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
              Get Started Free
              <HiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button className="px-8 md:px-10 py-3 md:py-4 text-[#0f172a] font-bold text-base md:text-lg border-2 border-gray-100 rounded-full bg-white hover:border-[#0f172a] hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm">
            See How It Works
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;