"use client";

import React from 'react';
import { Settings, CreditCard, MessageSquare, Users, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion'; 

const HowIthelps = () => {
  const cards = [
    {
      title: "Technical Support",
      description: "Our dedicated technical team provides 24/7 monitoring and rapid troubleshooting to ensure your platform's infrastructure remains robust, scalable, and error-free for your global community.",
      icon: <Settings className="w-6 h-6 text-purple-400" />,
      tag: "Support"
    },
    {
      title: "Billing & Subscriptions",
      description: "Get complete transparency over your financial transactions. Manage custom enterprise plans, download detailed tax invoices, and resolve any credit queries with our automated billing dashboard.",
      icon: <CreditCard className="w-6 h-6 text-blue-400" />,
      tag: "Finance"
    },
    {
      title: "Submit Feedback",
      description: "Your insights drive our innovation. Send us detailed feature requests or report workflow bottlenecks so we can continuously optimize our tools to prevent future business hurdles and fortify your growth.",
      icon: <MessageSquare className="w-6 h-6 text-pink-400" />,
      tag: "Insights"
    },
    {
      title: "Strategic Partnerships",
      description: "Join a network of industry leaders to create high-value collaborations. We provide the resources and API access needed to build meaningful charity-focused projects and co-branded experiences.",
      icon: <Users className="w-6 h-6 text-green-400" />,
      tag: "Network"
    },
  ];

  // Animation Variants for Scroll
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-[#03030b] text-white flex flex-col items-center justify-center py-20 px-6 overflow-hidden">

      {/* Background Effects */}
      <div className="absolute inset-0 opacity-[0.30]" style={{ backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-[30%] right-[10%] w-75 h-75 bg-orange-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-150 h-150 bg-purple-600/20 blur-[150px] rounded-full"></div>
      <div className="absolute top-[-10%] left-[-5%] w-125 h-125 bg-blue-600/20 blur-[100px] rounded-full"></div>

      {/* Header Section with Animation */}
      <motion.div 
        className="relative z-10 max-w-3xl w-full text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-[11px] uppercase tracking-widest text-purple-300 font-bold">
            Customer Excellence Center
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight bg-linear-to-b from-white to-gray-400 bg-clip-text text-transparent">
          How can we help you?
        </h2>

        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          We're scoping services designed to eliminate technical barriers and streamline your business operations. Choose a category below to get started.
        </p>
      </motion.div>

      {/* Cards Grid with Scroll & Stagger Animation */}
      <motion.div 
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="group relative bg-[#0f111a]/60 border border-white/5 backdrop-blur-xl rounded-4xl p-8 md:p-10 transition-all duration-500 hover:border-white/20"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            {/* Tag */}
            <span className="absolute top-8 right-8 text-[10px] font-mono text-gray-500 tracking-tighter uppercase">
              {card.tag}
            </span>

            {/* Icon Box */}
            <div className="w-16 h-16 mb-8 flex items-center justify-center rounded-2xl bg-linear-to-br from-white/10 to-transparent border border-white/10 group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] transition-all duration-500">
              {card.icon}
            </div>

            <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-300 transition-colors">
              {card.title}
            </h3>

            <p className="text-gray-400 text-[15px] leading-relaxed font-light">
              {card.description}
            </p>

            {/* Bottom Accent Line */}
            <div className="mt-8 h-px w-0 bg-linear-to-r from-transparent via-purple-500 to-transparent group-hover:w-full transition-all duration-700"></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Trust Badge */}
      <motion.div 
        className="mt-16 flex items-center gap-2 text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <ShieldCheck size={16} />
        <span>Enterprise-grade security and support guaranteed.</span>
      </motion.div>
    </div>
  );
};

export default HowIthelps;