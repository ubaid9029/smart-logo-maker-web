'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react'; 

const steps = [
  { id: 1, text: 'Analyzing your preferences...', icon: '✨', color: 'from-pink-500 to-orange-400' },
  { id: 2, text: 'Selecting color combinations...', icon: '🎨', color: 'from-pink-500 to-orange-400' },
  { id: 3, text: 'Generating logo variations...', icon: '🪄', color: 'from-pink-500 to-orange-400' },
  { id: 4, text: 'Finalizing your designs...', icon: '⚡', color: 'from-pink-500 to-orange-400' },
];

// --- Framer Motion Variants ---

// Parent container animation (staggering)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.4, // Ek ke baad ek step aayega
    },
  },
};

// Har step ki entry animation (fade and slide up)
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// --- YAHAN HAI MAIN ANIMATION ---
// Progress bar right se left aayega
const barVariants = {
  hidden: { x: '100%', opacity: 0 }, // Shuru mein bahar right par
  visible: { 
    x: '0%', // Apni jagah par aa jayega
    opacity: 1, 
    transition: { 
      duration: 1.5, // Slide hone ki speed
      ease: "easeInOut",
      delay: 0.3 // Item aane ke thodi der baad start hoga
    } 
  },
};

const CreatingLogos = () => {
  const router = useRouter();

  useEffect(() => {
    // Navigate to next page after 7 seconds
    const navigateTimer = setTimeout(() => {
      router.push('/create/results'); 
    }, 7000);

    return () => clearTimeout(navigateTimer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 ">
      
      {/* Main Card */}
      <div className="w-full max-w-2xl p-6 md:p-12 flex flex-col items-center text-center  rounded-3xl border-gray-100">
        
        {/* Animated 360 Rotating Icon */}
        <div className="p-4 rounded-full bg-pink-100 text-pink-600 mb-8 animate-[spin_3s_linear_infinite]">
          <Zap size={48} />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-slate-950 mb-3">Creating Your Logos</h1>
        <p className="text-lg text-slate-600 mb-12">Our AI is crafting unique designs just for you</p>

        {/* --- STEPS CONTAINER --- */}
        <motion.div 
          className="w-2xl flex flex-col gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {steps.map((step) => (
            <motion.div 
              key={step.id} 
              className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm overflow-hidden"
              variants={itemVariants}
            >
              {/* Left Side: Icon + Text */}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-linear-to-br ${step.color} text-white text-xl`}>
                  {step.icon}
                </div>
                <span className="text-gray-800 font-medium text-lg">
                  {step.text}
                </span>
              </div>

              {/* --- RIGHT SIDE: ANIMATED BAR --- */}
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden relative">
                <motion.div 
                  className={`absolute top-0 left-0 h-full w-full rounded-full bg-linear-to-r ${step.color}`}
                  variants={barVariants}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Processing Dots */}
        <div className="flex items-center gap-2 mt-12 text-slate-500 font-medium">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"></div>
          <span className="ml-2">Processing...</span>
        </div>
      </div>
    </div>
  );
}

export default CreatingLogos;