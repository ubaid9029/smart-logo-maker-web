'use client';
import { motion } from 'framer-motion';
import { 
  HiOutlineSearch, 
  HiOutlinePencilAlt, 
  HiOutlineColorSwatch, 
  HiOutlineSparkles, 
  HiOutlineDownload 
} from 'react-icons/hi';

const steps = [
  { id: "01", title: "Select Category", desc: "Choose your business category from our curated list.", icon: <HiOutlineSearch /> },
  { id: "02", title: "Enter Details", desc: "Provide your business name, optional slogan, and preferences.", icon: <HiOutlinePencilAlt /> },
  { id: "03", title: "Customize Design", desc: "Select font styles, color schemes, and design preferences.", icon: <HiOutlineColorSwatch /> },
  { id: "04", title: "Generate Logo", desc: "Get AI-generated variations instantly with one click.", icon: <HiOutlineSparkles /> },
  { id: "05", title: "Edit & Download", desc: "Fine-tune with our editor and download in your preferred format.", icon: <HiOutlineDownload /> }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden font-sans">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.5]" 
           style={{ 
             backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`, 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-[15px] font-bold tracking-[0.2em] uppercase bg-orange-300 border border-pink-100 mb-6 text-bold bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] bg-clip-text text-transparent"
          >
            SIMPLE PROCESS
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[40px] md:text-[56px] font-black text-[#0f172a] mb-4"
          >
            How It Works
          </motion.h2>
          <p className="text-gray-500 text-lg md:text-xl font-medium">
            Create your perfect logo in 5 simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-6 relative">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center relative">
              
              {/* --- 1. SOLID GRADIENT ANIMATED LINE --- */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[55%] w-[70%] z-0">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                        duration: 0.8, 
                        delay: 1.0 + (index * 0.2), 
                        ease: "circOut" 
                    }}
                    style={{ originX: 0 }} 
                    className="h-1 w-full bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] rounded-full opacity-60"
                  />
                </div>
              )}

              {/* Step Indicator (Circle) */}
              <div className="relative mb-10 z-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  
                  // --- 2. DIAGONAL HOVER MOVEMENT ---
                  whileHover={{ 
                    y: -15,         // Top side movement (negative value means up)
                    rotate: 12,    // Slight tilt
                    scale: 1.08,    
                    transition: { type: "spring", stiffness: 400, damping: 20 }
                  }}
                  className="w-24 h-24 rounded-full bg-linear-to-br from-[#ff5c01] via-[#ff007a] to-[#c400ff] flex items-center justify-center text-white text-[28px] font-black shadow-2xl shadow-pink-200/60 cursor-pointer"
                >
                  {step.id}
                </motion.div>
                
                {/* Floating Icon Badge */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + (index * 0.1) }}
                  className="absolute -bottom-2 -right-1 w-11 h-11 bg-white rounded-full shadow-xl flex items-center justify-center text-[#ff007a] border border-gray-100 z-20 text-xl"
                >
                  {step.icon}
                </motion.div>
              </div>

              {/* Content */}
              <h3 className="text-[20px] font-extrabold text-[#0f172a] mb-3">
                {step.title}
              </h3>
              <p className="text-gray-500 text-[14px] leading-relaxed font-medium px-2">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;