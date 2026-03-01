'use client';
import React from 'react';
import { motion } from 'framer-motion';

const AboutHero = () => {
  // Floating animation settings for background shapes
  const floatingAnim = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="mt-20 relative w-full min-h-screen bg-[#FDF2F8] p-4 flex flex-col items-center justify-center overflow-hidden">
      
      {/* --- Decorative Background Shapes --- */}
      
      {/* Small Circles */}
      <motion.div 
        variants={floatingAnim}
        animate="animate"
        className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-pink-300 shadow-xl opacity-80" 
      />
      <motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-purple-300 shadow-xl opacity-80" 
      />
      
      {/* Larger Geometric Shapes */}
      <motion.div 
        initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
        animate={{ opacity: 1, rotate: -15, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-[60%] left-[10%] w-24 h-24 rounded-tl-[40px] rounded-br-[40px] bg-linear-to-br from-purple-400/70 to-pink-300/60" 
      />
      
      <motion.div 
        initial={{ opacity: 0, rotate: 45, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 15, scale: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="absolute top-[60%] right-[10%] w-24 h-24 rounded-tl-[40px] rounded-br-[40px] bg-linear-to-br from-purple-400/70 to-pink-300/60" 
      />

      {/* --- Main Content --- */}
      <div className="relative z-10 text-center max-w-3xl">
        
        {/* Title Animation: Slips up from bottom */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-[#1F2937] leading-tight mb-6"
        >
          About <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-500">Smart Logo</span> Maker
        </motion.h1>
        
        {/* Paragraph Animation: Fades in slightly later */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg md:text-xl text-[#6B7280] font-medium max-w-xl mx-auto leading-relaxed"
        >
          We are on a mission to democratize logo design, making professional branding accessible and affordable for everyone.
        </motion.p>

        {/* Optional: Simple Scroll indicator or Decorative Line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-8 h-1 w-24 bg-purple-400 mx-auto rounded-full"
        />
      </div>

    </section>
  );
};

export default AboutHero;