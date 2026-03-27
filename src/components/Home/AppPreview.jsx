'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { HiArrowRight, HiDevicePhoneMobile } from 'react-icons/hi2';

const steps = [
  { id: 1, title: "Home Dashboard", desc: "Quick access to all features", img: "/images/app1.PNG", color: "shadow-pink-500/40", offset: "lg:-mt-12" },
  { id: 2, title: "Logo Editor", desc: "Advanced editing canvas", img: "/images/app2.PNG", color: "shadow-orange-500/40", offset: "lg:mt-12" },
  { id: 3, title: "Font Selection", desc: "Choose perfect typography", img: "/images/app3.PNG", color: "shadow-purple-500/40", offset: "lg:-mt-12" },
  { id: 4, title: "AI Generation", desc: "Auto-generate stunning logos", img: "/images/app4.PNG", color: "shadow-blue-500/40", offset: "lg:mt-12" },
];

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
            Professional logo creation at your fingertips with our powerful mobile app
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
              <div className="group relative cursor-pointer">
                <div className="absolute -right-4 -top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border-[6px] border-[#0b0f1a] bg-pink-600 text-xl font-black text-white shadow-xl md:h-14 md:w-14 md:text-2xl">
                  {step.id}
                </div>

                <div
                  className={`relative aspect-1/2 w-full overflow-hidden rounded-[2.5rem] border-4 border-gray-800 bg-gray-900 transition-all duration-500 group-active:scale-95 group-hover:scale-105 group-hover:shadow-[0_0_60px_-15px] md:rounded-[3rem] md:border-8 ${step.color}`}
                >
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    sizes="(min-width: 1024px) 18rem, (min-width: 640px) 40vw, 90vw"
                    className="object-cover"
                  />
                </div>
              </div>

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
          <button className="mx-auto flex items-center gap-3 rounded-full bg-linear-to-r from-orange-600 to-purple-600 px-8 py-4 text-sm font-bold text-white transition-all hover:shadow-[0_0_40px_rgba(196,0,255,0.4)] md:px-10 md:text-base">
            <span className="text-xl">Mobile</span> Coming Soon on Play Store
            <HiArrowRight className="text-2xl transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-150" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
