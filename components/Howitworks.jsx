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
  {
    id: "01",
    title: "Select Category",
    desc: "Choose your business category from our curated list.",
    icon: <HiOutlineSearch />,
  },
  {
    id: "02",
    title: "Enter Details",
    desc: "Provide your business name, optional slogan, and preferences.",
    icon: <HiOutlinePencilAlt />,
  },
  {
    id: "03",
    title: "Customize Design",
    desc: "Select font styles, color schemes, and design preferences.",
    icon: <HiOutlineColorSwatch />,
  },
  {
    id: "04",
    title: "Generate Logo",
    desc: "Get AI-generated variations instantly with one click.",
    icon: <HiOutlineSparkles />,
  },
  {
    id: "05",
    title: "Edit & Download",
    desc: "Fine-tune with our editor and download in your preferred format.",
    icon: <HiOutlineDownload />,
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden font-sans">
      {/* Grid Background Effect */}
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
            className="bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] bg-clip-text inline-block px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase bg-orange-50 text-orange-600 border border-orange-100 mb-6 shadow-sm"
          >
            Simple Process
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[40px] md:text-[56px] font-black text-[#0f172a] leading-tight mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg md:text-xl font-medium"
          >
            Create your perfect logo in 5 simple steps
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connecting Gradient Line (Hidden on Mobile) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] opacity-20"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-6 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Step Indicator (Circle) */}
                <div className="relative mb-10">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-24 h-24 rounded-full bg-linear-to-br from-[#ff5c01] via-[#ff007a] to-[#c400ff] flex items-center justify-center text-white text-[28px] font-black shadow-2xl shadow-pink-200/60 z-10 relative"
                  >
                    {step.id}
                  </motion.div>
                  
                  {/* Floating Icon Badge */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                    className="absolute -bottom-2 -right-1 w-11 h-11 bg-white rounded-full shadow-xl flex items-center justify-center text-[#ff007a] border border-gray-100 z-20 text-xl"
                  >
                    {step.icon}
                  </motion.div>
                </div>

                {/* Content */}
                <h3 className="text-[22px] font-extrabold text-[#0f172a] mb-3 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-[15px] leading-relaxed font-medium px-2">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;