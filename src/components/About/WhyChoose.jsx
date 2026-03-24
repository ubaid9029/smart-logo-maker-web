"use client"; 
import React from 'react';
import { Zap, ShieldCheck, Settings2, Gem, Sparkles } from 'lucide-react'; 

const WhyChoose = () => {
  const cards = [
    {
      title: "Unmatched Speed:",
      description: "Logos in Seconds.",
      icon: <Zap className="w-8 h-8 text-purple-400" />, 
      tag: "⚡ Fast"
    },
    {
      title: "Premium Quality:",
      description: "High-Resolution Designs.",
      icon: <ShieldCheck className="w-8 h-8 text-purple-400" />, 
      tag: "💎 HD"
    },
    {
      title: "Infinite Customization:",
      description: "Make It Truly Yours.",
      icon: <Settings2 className="w-8 h-8 text-purple-400" />, 
      tag: "🛠️ Pro"
    },
    {
      title: "Exceptional Value:",
      description: "Top Design without Top Prices.",
      icon: <Gem className="w-8 h-8 text-purple-400" />, 
      tag: "💰 Cheap"
    }
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#03030b] text-white flex flex-col items-center justify-center py-20 px-6 overflow-hidden">

      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.30]" style={{ backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-[30%] right-[10%] w-75 h-75 bg-orange-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-150 h-150 bg-purple-600/20 blur-[150px] rounded-full"></div>
      <div className="absolute top-[-10%] left-[-5%] w-125 h-125 bg-blue-600/20 blur-[100px] rounded-full"></div>

      {/* Header Section */}
      <div className="relative z-10 max-w-3xl w-full text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-[11px] uppercase tracking-widest text-purple-300 font-bold">
            Why Recommended
          </span>
        </div>

        <h2 className="text-3xl md:text-6xl font-extrabold mb-6 tracking-normal bg-linear-to-b from-white to-gray-400 bg-clip-text text-transparent">
          Why Choose Smart Logo Maker?
        </h2>

        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          We&apos;re companion to earn Smart Logo Maker.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        {cards.map((card, index) => (
          <div
            key={index}
            className="group relative bg-[#0f111a]/60 border border-white/5 backdrop-blur-xl rounded-4xl p-8 md:p-10 transition-all duration-500 hover:scale-[1.02] hover:bg-white/5 hover:border-white/20"
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChoose;