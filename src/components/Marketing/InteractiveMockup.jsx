'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function InteractiveMockup({ src, alt, title, label, accentColor = 'indigo' }) {
  const accentClasses = {
    indigo: 'bg-indigo-600/20 border-white/30',
    red: 'bg-red-600/20 border-white/30',
    slate: 'bg-white/90 text-slate-950 border-slate-200'
  };

  const textClasses = {
    indigo: 'text-white',
    red: 'text-white',
    slate: 'text-slate-950'
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 mt-16 md:mt-24">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative group rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white"
      >
        <Image 
          src={src} 
          alt={alt}
          width={1200}
          height={675}
          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000"
          priority
        />
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-700 ${accentColor === 'slate' ? 'bg-slate-950/20 group-hover:bg-transparent' : 'bg-linear-to-t from-slate-950/40 to-transparent'}`} />
        
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
          <div className={accentColor === 'slate' ? 'text-slate-950 opacity-0 group-hover:opacity-100 transition-opacity' : 'text-white'}>
            <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">{label}</p>
            <h4 className="text-2xl font-black">{title}</h4>
          </div>
          <div className={`backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border transition-all ${accentClasses[accentColor]}`}>
            Live Preview
          </div>
        </div>
        
        {accentColor === 'slate' && (
           <div className="absolute top-8 left-8">
              <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full text-slate-950 text-sm font-black uppercase tracking-widest border border-slate-200">
                 Fashion Exhibit 2026
              </div>
           </div>
        )}
      </motion.div>
    </div>
  );
}
