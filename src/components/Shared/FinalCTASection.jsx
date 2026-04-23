"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const featureBadges = ["Free to Start", "No Credit Card", "Instant Access"];

const stats = [
  { value: "10K+", label: "Happy Users", gradient: "from-orange-400 to-pink-500" },
  { value: "50,000+", label: "Logos Created", gradient: "from-pink-500 to-purple-500" },
  { value: "4.9/5", label: "Rating", gradient: "from-purple-500 to-blue-500" },
];

export default function FinalCTASection() {
  return (
    <section id="final-cta" className="relative overflow-hidden bg-[#0f172a] py-12 md:py-16 text-white">
      <div className="absolute left-1/4 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="absolute right-1/4 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-orange-600/20 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        <motion.div className="mb-8 flex justify-center">
          <Image
            src="/logos/logo1.svg"
            alt="Smart Logo Maker"
            width={80}
            height={80}
            className="h-20 w-20 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-[40px] font-black leading-[1.1] tracking-tight md:text-[56px]"
        >
          Ready to Create Your <br className="hidden md:block" /> Perfect Logo?
        </motion.h2>

        <p className="mx-auto mb-8 md:mb-10 max-w-2xl text-lg font-medium text-slate-200 md:text-xl">
          Join thousands of creators and bring your brand to life today
        </p>

        <div className="mb-10 md:mb-12 flex justify-center">
          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 40px rgba(255, 0, 122, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/create?fresh=1"
              className="group relative flex items-center overflow-hidden rounded-full bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-10 py-4 text-lg font-bold transition-all duration-300"
            >
              <span className="absolute inset-0 h-full w-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative z-10">Get Started Now</span>
            </Link>
          </motion.div>
        </div>

        <div className="mb-12 md:mb-14 flex flex-wrap justify-center gap-6 text-[14px] font-bold uppercase tracking-widest text-slate-200">
          {featureBadges.map((feature) => (
            <span
              key={feature}
              className="flex cursor-default items-center gap-2 transition-transform duration-300 hover:scale-110"
            >
              <FaCheckCircle className="text-lg text-[#22c55e]" />
              {feature}
            </span>
          ))}
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 border-t border-gray-800/50 pt-10 md:grid-cols-3">
          {stats.map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -5 }} className="flex flex-col items-center">
              <span className={`bg-linear-to-r ${stat.gradient} bg-clip-text text-5xl font-black text-transparent`}>
                {stat.value}
              </span>
              <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-300">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
