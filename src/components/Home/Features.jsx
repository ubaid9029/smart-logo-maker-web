'use client';
import { motion } from 'framer-motion';
import {
  HiOutlineSparkles, HiOutlineColorSwatch, HiLightningBolt,
  HiOutlinePencilAlt, HiOutlineTemplate, HiCloudDownload
} from 'react-icons/hi';

const featuresData = [
  { title: "AI-Powered Design", desc: "Create professional logos instantly with advanced AI technology tailored to your brand identity.", icon: <HiOutlineSparkles />, iconColor: "bg-[#FF5C5C]" },
  { title: "Customizable Styles", desc: "Choose from multiple font styles, vibrant color schemes, and design templates.", icon: <HiOutlineColorSwatch />, iconColor: "bg-[#F33CC0]" },
  { title: "Instant Generation", desc: "Get multiple logo variations instantly and preview them in real-time.", icon: <HiLightningBolt />, iconColor: "bg-[#A855F7]" },
  { title: "Advanced Logo Editor", desc: "Fine-tune every detail with our powerful editor. Adjust colors, fonts, layouts, and export in multiple formats.", icon: <HiOutlinePencilAlt />, iconColor: "bg-[#3B82F6]" },
  { title: "Professional Templates", desc: "Access 25+ professionally designed templates across 6 categories to jumpstart your design.", icon: <HiOutlineTemplate />, iconColor: "bg-[#0095FF]" },
  { title: "High-Quality Export", desc: "Download your logos in high-resolution PNG, SVG, and other formats for any use case.", icon: <HiCloudDownload />, iconColor: "bg-[#14B8A6]" }
];

const Features = () => {
  return (
    <section id="features" className="relative overflow-hidden bg-white pb-24">
      {/* Shared hero-style background gradient — continues the hero feel */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-pink-50/30 to-white" />
        <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-orange-200/20 blur-[80px] md:h-96 md:w-96" />
        <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-purple-200/20 blur-[80px] md:h-96 md:w-96" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 md:px-12">

        <div className="text-center mb-16 pt-4">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-[15px] font-bold tracking-[0.2em] uppercase bg-orange-300 border border-pink-100 mb-6 text-bold bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] bg-clip-text text-transparent"
          >
            Powerful Features
          </motion.span>
          <h2 className="text-[36px] md:text-[52px] font-black text-[#0f172a] mb-6 leading-tight">
            Everything You Need
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
            Create, customize, and perfect your brand identity with our <br /> comprehensive toolkit
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -12, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)" }}
              className="p-10 rounded-[40px] bg-white border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 group"
            >
              {/* Animated Icon Box (Only rotates on Hover) */}
              <motion.div
                variants={{
                  initial: { rotate: 0 },
                  hover: {
                    rotate: 360,
                    transition: { duration: 2, repeat: Infinity, ease: "linear" }
                  }
                }}
                initial="initial"
                whileHover="hover"
                className={`${feature.iconColor} w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-inherit/20 cursor-pointer`}
              >
                <span className="text-white text-2xl">
                  {feature.icon}
                </span>
              </motion.div>

              <h3 className="text-[22px] font-extrabold text-[#0f172a] mb-4 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-[#64748b] leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
