'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { HiDevicePhoneMobile } from 'react-icons/hi2';
import { FaGooglePlay } from 'react-icons/fa';

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
              className={`flex w-full max-w-[17.5rem] flex-col items-center ${step.offset}`}
            >
              <div className="group relative w-full cursor-pointer">
                <div
                  className={`relative aspect-[10/19] w-full overflow-hidden rounded-[2.5rem] border-4 border-gray-800 bg-gray-900 transition-all duration-500 group-active:scale-95 group-hover:-translate-y-2 group-hover:scale-[1.04] group-hover:shadow-[0_0_60px_-15px] md:rounded-[3rem] md:border-8 ${step.color}`}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-linear-to-b from-white/18 via-white/6 to-transparent" />
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    sizes="(min-width: 1024px) 18rem, (min-width: 640px) 40vw, 90vw"
                    className="object-cover object-top"
                    priority={step.id === 1}
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
          <a
            href="https://play.google.com/store/apps/details?id=com.devsinntechnologies.smartlogomaker"
            target="_blank"
            rel="noreferrer"
            className="mx-auto flex w-fit flex-col items-center gap-2 rounded-[2rem] bg-linear-to-r from-orange-600 to-purple-600 px-8 py-4 text-center text-sm font-bold text-white transition-all hover:shadow-[0_0_40px_rgba(196,0,255,0.4)] md:px-10 md:text-base"
          >
            <span className="inline-flex items-center gap-3">
              <FaGooglePlay className="text-xl" />
              Available on Play Store
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              Free app experience
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
