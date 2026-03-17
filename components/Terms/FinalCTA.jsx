'use client';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi2';
import { FaCheckCircle } from 'react-icons/fa';

const FinalCTA = () => {
  return (
    <section id="final-cta" className="relative py-24 bg-[#0f172a] overflow-hidden text-white">
      {/* Background Orbs/Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-purple-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-orange-600/20 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

        {/* Floating Logo Icon */}
        <motion.div
          
          className="flex justify-center mb-8"
        >
          <img src="/logo1.svg" alt="Logo" className="w-20 h-20 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[40px] md:text-[56px] font-black leading-[1.1] mb-6 tracking-tight"
        >
          Ready to Create Your <br className="hidden md:block" /> Perfect Logo?
        </motion.h2>

        <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
          Join thousands of creators and bring your brand to life today
        </p>

        {/* Animated Gradient Button */}
        <div className="flex justify-center mb-14">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 40px rgba(255, 0, 122, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all duration-300 overflow-hidden"
          >
            {/* Glossy Overlay effect on hover */}
            <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>

            Get Started Now
            <HiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Mini Features List */}
        <div className="flex flex-wrap justify-center gap-8 text-[14px] font-bold text-gray-300 uppercase tracking-widest mb-20">

          {/* Free to Start */}
          
            <span className="flex items-center gap-2 cursor-default transition-transform duration-300 hover:scale-110">
              <FaCheckCircle className="text-[#22c55e] text-lg" /> Free to Start
            </span>
          
          {/* No Credit Card */}
          <span className="flex items-center gap-2 cursor-default transition-transform duration-300 hover:scale-110 ">
            <FaCheckCircle className="text-[#22c55e] text-lg" /> No Credit Card
          </span>

          {/* Instant Access */}
          <span className="flex items-center gap-2 cursor-default transition-transform duration-300 hover:scale-110 ">
            <FaCheckCircle className="text-[#22c55e] text-lg" /> Instant Access
          </span>

        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto border-t border-gray-800/50 pt-16">
          <motion.div
            whileHover={{ y: -5 }}
            className="flex flex-col items-center"
          >
            <span className="text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-pink-500">
              10K+
            </span>
            <span className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.3em] mt-2">Happy Users</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="flex flex-col items-center"
          >
            <span className="text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-purple-500">
              25+
            </span>
            <span className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.3em] mt-2">Templates</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="flex flex-col items-center"
          >
            <span className="text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-blue-500">
              4.9★
            </span>
            <span className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.3em] mt-2">Rating</span>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default FinalCTA;