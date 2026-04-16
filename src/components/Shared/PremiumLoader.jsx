'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const PREMIUM_LOADER_LOGO_SRC = '/logos/logo1.svg';

const SIZE_MAP = {
  xs: {
    frame: 28,
    logo: 14,
    container: 'h-8',
    titleClass: 'text-[11px]',
  },
  sm: {
    frame: 84,
    logo: 40,
    container: 'h-32',
    titleClass: 'text-sm',
  },
  md: {
    frame: 110,
    logo: 54,
    container: 'h-48',
    titleClass: 'text-base',
  },
  lg: {
    frame: 140,
    logo: 68,
    container: 'h-64',
    titleClass: 'text-lg',
  },
  xl: {
    frame: 170,
    logo: 82,
    container: 'h-80',
    titleClass: 'text-xl',
  },
  full: {
    frame: 210,
    logo: 104,
    container: 'h-screen',
    titleClass: 'text-2xl',
  },
};

export function PremiumInlineLoader({ size = 16, className = '' }) {
  const frameSize = Math.max(12, Number(size) + 10);

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: frameSize, height: frameSize }} aria-hidden>
      <motion.span
        className="absolute inset-0 rounded-full border border-[#FF5C00]/35 border-t-[#FF007A] border-r-[#FF5C00]"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
      />
      <Image
        src={PREMIUM_LOADER_LOGO_SRC}
        alt=""
        width={size}
        height={size}
        className="object-contain"
      />
    </span>
  );
}

export default function PremiumLoader({
  size = 'md',
  text = 'Loading your experience...',
  showText = true,
  className = '',
  textClassName = '',
}) {
  const config = SIZE_MAP[size] || SIZE_MAP.md;
  const frameSize = config.frame;
  const logoSize = config.logo;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative flex flex-col items-center justify-center overflow-hidden ${config.container} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,0,122,0.18)_0%,_rgba(255,92,0,0.06)_40%,_transparent_75%)]"
          animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.38, 0.7, 0.38] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            width: frameSize,
            height: frameSize,
            left: `calc(50% - ${frameSize / 2}px)`,
            top: `calc(50% - ${frameSize / 2}px)`,
            background: 'conic-gradient(from 40deg, rgba(255,92,0,0.18), rgba(255,0,122,0.85), rgba(196,0,255,0.2), rgba(255,92,0,0.18))',
            filter: 'blur(1px)',
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        />

        <motion.div
          className="relative z-10 flex items-center justify-center rounded-full border border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(255,0,122,0.22)] backdrop-blur-md"
          style={{ width: frameSize, height: frameSize }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            animate={{ scale: [0.98, 1.04, 0.98] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src={PREMIUM_LOADER_LOGO_SRC}
              alt="Smart Logo Maker"
              width={logoSize}
              height={logoSize}
              priority
              className="object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
            />
          </motion.div>
        </motion.div>

        <motion.span
          className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-[calc(50%+56px)] rounded-full bg-[#FF007A] shadow-[0_0_16px_rgba(255,0,122,0.7)]"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
          style={{ transformOrigin: '0 56px' }}
        />
      </div>

      {showText ? (
        <div className="relative z-10 mt-6 flex flex-col items-center gap-2">
          <motion.p
            className={`${config.titleClass} font-extrabold tracking-[0.02em] text-slate-700 ${textClassName}`}
            animate={{ opacity: [0.52, 1, 0.52] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {text}
          </motion.p>
          <div className="flex items-center gap-1.5" aria-hidden>
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-linear-to-r from-[#FF5C00] to-[#FF007A]"
                animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
                transition={{
                  duration: 0.95,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.14,
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

      <span className="sr-only">{text}</span>
    </div>
  );
}

export function PremiumLoaderOverlay({ text = 'Loading...', size = 'full', className = '' }) {
  return (
    <div className={`fixed inset-0 z-[320] flex items-center justify-center bg-white/88 backdrop-blur-sm ${className}`}>
      <PremiumLoader size={size} text={text} />
    </div>
  );
}
