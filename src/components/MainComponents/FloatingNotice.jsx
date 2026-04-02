"use client";

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Heart, Info } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  favorite: Heart,
  info: Info,
};

export default function FloatingNotice({ notice, onClose }) {
  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose?.();
    }, notice.duration || 2400);

    return () => window.clearTimeout(timeoutId);
  }, [notice, onClose]);

  const Icon = ICONS[notice?.type] || CheckCircle2;

  return (
    <AnimatePresence>
      {notice ? (
        <motion.div
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed right-4 top-24 z-[120] max-w-[22rem] rounded-[1.35rem] border border-pink-100 bg-white/95 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur sm:right-6"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5C00] via-[#FF007A] to-[#C400FF] text-white">
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900">{notice.title || 'Updated'}</p>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{notice.message}</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
