import React from "react";
import { motion } from "framer-motion";

export function OrangeCardDark({ backgroundColor = '#1e293b', accentColors = [], children }) {
  const lightness = parseInt(backgroundColor.split(',').pop()) || 15;
  const isDark = lightness < 45;

  const primaryAccent = accentColors[0] || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)');
  const secondaryAccent = accentColors[1] || (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)');

  return (
    <motion.div
      className="w-[340px] h-[200px] rounded-[1.8rem] overflow-hidden relative cursor-pointer group"
      style={{
        backgroundColor,
        boxShadow: isDark
          ? '0 30px 100px rgba(0,0,0,0.7), inset 0 0 0 1.5px rgba(255,255,255,0.08)'
          : '0 30px 100px rgba(0,0,0,0.15), inset 0 0 0 1.5px rgba(0,0,0,0.05)',
      }}
      whileHover={{ scale: 1.025 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Texture Layer */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay z-10"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Top Left Gradient Triangle - BIG for impact */}
      <div
        className="absolute -top-12 -left-12 w-[180px] h-[130px] z-10 opacity-95"
        style={{
          background: `linear-gradient(135deg, ${primaryAccent}, transparent)`,
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          filter: 'drop-shadow(4px 4px 20px rgba(0,0,0,0.25)) brightness(0.4)',
        }}
      />

      {/* Top Right Subtle Accent - Larger */}
      <div
        className="absolute top-0 right-0 w-[80px] h-[50px] z-10 opacity-50"
        style={{
          background: primaryAccent,
          clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
          filter: 'brightness(0.3)',
        }}
      />

      {/* Bottom Right Gradient Triangle - BIG for impact */}
      <div
        className="absolute -bottom-12 -right-12 w-[200px] h-[150px] z-10 opacity-75"
        style={{
          background: `linear-gradient(-45deg, ${secondaryAccent}, transparent)`,
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          filter: 'drop-shadow(-4px -4px 20px rgba(0,0,0,0.2)) brightness(0.35)',
        }}
      />


      {/* Surface Gloss */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/[0.04] pointer-events-none z-20" />

      {/* The Logo Container - MAX SAFE ZONE Padding */}
      <div className="absolute inset-0 flex items-center justify-center z-30 p-24">
        <div className="drop-shadow-[0_15px_35px_rgba(0,0,0,0.25)] scale-110">
          {children}
        </div>
      </div>


    </motion.div>
  );
}




