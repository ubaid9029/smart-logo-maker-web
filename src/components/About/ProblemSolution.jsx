'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserX, Sparkles } from 'lucide-react';

const ProblemSolution = () => {
  const data = [
    {
      type: "problem",
      title: "Expensive Designers & Long Lead Times.",
      desc: "Expensive Designers & Long Lead Times, the cost effectively prices logos.",
      icon: <UserX className="w-10 h-10 text-purple-600" />,
      image: "https://cdn-icons-png.flaticon.com/512/9439/9439247.png" // Placeholder for the 'confused designer' illustration
    },
    {
      type: "solution",
      title: "Instant, Affordable, High-Quality Logos with Smart AI",
      desc: "Instant, Affordable, High-Quality Logos with Smart AI.",
      icon: <Sparkles className="w-10 h-10 text-blue-600" />,
      image: "https://cdn-icons-png.flaticon.com/512/10569/10569502.png" // Placeholder for 'AI Computer' illustration
    }
  ];

  return (
    <section className="relative py-24 px-6 bg-[#f8faff] overflow-hidden">
      {/* Background Grid Pattern */}
      <div 
        className="absolute top-0 right-0 w-1/3 h-1/3 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
        >
          The Problem & Solution
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 text-lg mb-16"
        >
          We're optimize problem and smart logo services
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center group cursor-default"
            >
              {/* Illustration Container */}
              <div className="mb-8 relative">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-32 h-32 flex items-center justify-center"
                >
                  
                  <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                </motion.div>
                
                {/* Subtle glow behind icon on hover */}
                <div className="absolute inset-0 bg-purple-200/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="text-left space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-base md:text-lg">
                  {item.desc}
                </p>
              </div>

              {/* Decorative accent line */}
              <div className={`mt-8 w-full h-1 rounded-full transition-all duration-500 ${
                item.type === 'problem' ? 'bg-gray-100 group-hover:bg-red-400' : 'bg-gray-100 group-hover:bg-green-400'
              }`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;