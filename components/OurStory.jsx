'use client';

import React from 'react';
import { Pencil, FileText, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const OurStory = () => {
  const steps = [
    {
      icon: <Pencil className="w-5 h-5" />,
      title: "Manual Design",
      desc: "Original process costs and custom logos.",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "The First Design",
      desc: "Premium embody high-resolution bespoke design.",
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      title: "The AI Revolution",
      desc: "Advanced AI to create stunning logos in seconds.",
    },
  ];

  return (
    <section className="relative w-full py-20 px-6 bg-[#f9faff] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200/50 blur-3xl rounded-full" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-100/50 blur-3xl rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-16 relative z-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Our Story
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Side: Text Content with Staggered Entrance */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-purple-600 transition-colors cursor-default">
                Original problem
              </h3>
              <p className="text-gray-500 leading-relaxed">
                High costs and long timelines of over custom logos or uneconomically 
                making at the high timelines of custom logos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-purple-600 transition-colors cursor-default">
                Solution
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Using advanced AI to create stunning logos to create stunning logos 
                in seconds. Join early logos as everparent.
              </p>
            </motion.div>
          </div>

          {/* Right Side: Animated Illustration */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative flex justify-center cursor-pointer"
          >
             <div className="relative w-full max-w-87.5 aspect-square bg-linear-to-tr from-purple-50 to-blue-50 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center overflow-hidden relative">
                   <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 bg-linear-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full blur-sm opacity-80" 
                   />
                </div>
             </div>
          </motion.div>
        </div>

        {/* Bottom Timeline Steps with 360 Rotation on Hover */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center text-center max-w-50 group cursor-pointer"
              >
                {/* Icon Container with 360 Rotation on Hover */}
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4 shadow-inner text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300"
                >
                  {step.icon}
                </motion.div>
                
                <h4 className="font-bold text-gray-800 mb-2 transition-colors">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-400 leading-tight">
                  {step.desc}
                </p>
              </motion.div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-px bg-gray-200 relative mb-12">
                   <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute inset-0 bg-purple-200"
                   />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default OurStory;