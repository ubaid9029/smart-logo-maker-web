import React from "react";
import { motion } from "framer-motion";

export function GeometricCardLight({ backgroundColor = '#f8fafc', accentColors = [], children }) {
  const lightness = parseInt(backgroundColor.split(',').pop()) || 98;
  const isDark = lightness < 45;

  const primaryAccent = accentColors[0] || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)');
  const secondaryAccent = accentColors[1] || (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)');

  return (
    <motion.div
      className="w-[340px] h-[200px] rounded-[1.8rem] overflow-hidden relative cursor-pointer group"
      style={{
        backgroundColor,
        boxShadow: isDark
          ? '0 25px 80px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.06)'
          : '0 25px 80px rgba(0,0,0,0.1), inset 0 0 0 1.5px rgba(0,0,0,0.04)',
      }}
      whileHover={{ scale: 1.025 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Premium Stationery Texture */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Decorative Layered Path - Slightly larger but kept at edge */}
      <div
        className="absolute top-0 left-0 w-[110px] h-[55px] z-10"
        style={{
          background: `linear-gradient(135deg, ${primaryAccent}, transparent)`,
          clipPath: 'polygon(0 0, 100% 0, 75% 100%, 0 100%)',
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15)) brightness(0.6)',
        }}
      />

      {/* Decorative Trace */}
      <div
        className="absolute top-0 left-0 w-[120px] h-[60px] opacity-40"
        style={{
          borderBottom: `2px solid ${primaryAccent}`,
          borderRight: `2px solid ${primaryAccent}`,
          clipPath: 'polygon(0 0, 100% 0, 75% 100%, 0 100%)',
          filter: 'brightness(0.5)',
        }}
      />

      {/* Bottom Wave - Larger for impact */}
      <div className="absolute bottom-0 left-0 w-full h-[40px] opacity-25 pointer-events-none">
        <svg viewBox="0 0 340 40" className="w-full h-full" preserveAspectRatio="none" style={{ filter: 'brightness(0.4)' }}>
          <path d="M0 20 Q85 0, 170 20 T340 20 L340 40 L0 40 Z" fill={primaryAccent} />
        </svg>
      </div>

      {/* Main Logo Surface - Increased SAFE ZONE Padding */}
      <div className="absolute inset-0 flex items-center justify-center z-20 p-20">
        <div className="drop-shadow-[0_10px_25px_rgba(0,0,0,0.18)]">
          {children}
        </div>
      </div>

      {/* Surface Depth Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.02] to-white/[0.04] pointer-events-none" />
    </motion.div>
  );
}



