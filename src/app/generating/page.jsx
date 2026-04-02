'use client';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { useSelector } from 'react-redux';
import { loadGeneratedResultsSnapshot } from '../../lib/generatedResultsStorage';
import { hasCreateDraft } from '../../lib/logoResumeStorage';

const CreatingLogos = () => {
  const router = useRouter();
  const fallbackTimerRef = useRef(null);
  const { status, results, error, formData } = useSelector((state) => state.logo);

  useEffect(() => {
    const persistedResults = loadGeneratedResultsSnapshot();

    if (status === 'succeeded' && results.length > 0) {
      router.replace('/results');
      return;
    }

    if (status === 'idle' && persistedResults.length > 0) {
      router.replace('/results');
      return;
    }

    if (status !== 'loading') {
      fallbackTimerRef.current = window.setTimeout(() => {
        const fallbackResults = loadGeneratedResultsSnapshot();

        if (fallbackResults.length > 0) {
          router.replace('/results');
          return;
        }

        router.replace(hasCreateDraft(formData) ? '/create?step=4' : '/create?fresh=1');
      }, 900);
    }

    return () => {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [formData, results, router, status]);

  const steps = [
    { id: 1, text: 'Analyzing your preferences...', icon: '?', color: 'from-pink-500 to-orange-400' },
    { id: 2, text: 'Selecting color combinations...', icon: '??', color: 'from-pink-500 to-orange-400' },
    { id: 3, text: 'Generating logo variations...', icon: '?', color: 'from-pink-500 to-orange-400' },
    { id: 4, text: 'Finalizing your designs...', icon: '?', color: 'from-pink-500 to-orange-400' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.8 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const barVariants = {
    hidden: { x: '-100%' },
    visible: { x: '0%', transition: { duration: 1.5, ease: 'easeInOut' } },
  };

  if (status === 'failed') {
    return (
      <div className="mt-20 min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-xl rounded-3xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
          <h1 className="mb-3 text-3xl font-extrabold text-slate-900">Logo Generation Failed</h1>
          <p className="mb-6 text-sm font-medium text-red-600">{error || 'Something went wrong while generating logos.'}</p>
          <button
            onClick={() => router.push('/create?step=4')}
            className="rounded-2xl bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" mt-20 min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-2xl p-6 md:p-12 flex flex-col items-center text-center">
        <div className="p-4 rounded-full bg-pink-100 text-pink-600 mb-8 animate-bounce">
          <Zap size={48} fill="currentColor" />
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Creating Your Logos
        </h1>
        <p className="text-lg text-slate-500 mb-12">
          Please wait while our AI crafts your brand identity...
        </p>

        <motion.div
          className="w-full max-w-lg flex flex-col gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {steps.map((step) => (
            <motion.div
              key={step.id}
              className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm overflow-hidden"
              variants={itemVariants}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${step.color} text-white text-xl`}>
                  {step.icon}
                </div>
                <span className="text-slate-700 font-semibold text-lg">{step.text}</span>
              </div>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                <motion.div
                  className={`absolute top-0 left-0 h-full w-full bg-gradient-to-r ${step.color}`}
                  variants={barVariants}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex items-center gap-2 mt-12">
          <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
};

export default CreatingLogos;