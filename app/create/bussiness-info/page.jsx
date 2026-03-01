"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineSparkles } from 'react-icons/hi';
import { ChevronLeft } from 'lucide-react';
import { div } from 'framer-motion/client';

const GetStarted = () => {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [slogan, setSlogan] = useState('');

  const isFormValid = businessName.trim() !== '';

  const handleBack = () => {
    router.back();
  };

  return (
    <div className='bg-pink-50'>
    <div className="flex flex-col items-center p-5 mt-10 max-w-4xl mx-auto relative">

      {/* 1. Back Button - Left Aligned */}
      <div className="w-full flex justify-start mb-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 hover:text-slate-900 transition-colors bg-white text-black hover:bg-gray-100 rounded-lg px-4 py-2 border border-gray-200 shadow-sm"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      {/* Title Section */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-pink-200">
          <HiOutlineSparkles className="text-white text-3xl" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Let's Get Started</h1>
        <p className="text-gray-500 mt-2 text-lg">Tell us about your business to create the perfect logo</p>
      </div>

      {/* Card Section */}
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Business Name <span className='text-pink-500'>*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"
              className='mt-2 block w-full px-5 py-4 rounded-2xl border border-gray-100 outline-none transition-all duration-300 hover:border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/5 bg-gray-50/50 text-lg'
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Slogan <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Enter your slogan or tagline"
              className='mt-2 block w-full px-5 py-4 rounded-2xl border border-gray-100 outline-none transition-all duration-300 hover:border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/5 bg-gray-50/50 text-lg'
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
          
          <p className="text-sm text-slate-600 leading-relaxed m-auto">
           <span className="text-xl">💡</span> Your information helps our AI create personalized logo designs          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="w-full max-w-2xl">
        <button
          onClick={() => router.push('/create/category')}
          disabled={!isFormValid}
          className={`w-full mt-10 py-3 rounded-2xl text-white font-bold text-xl transition-all duration-300 shadow-2xl flex items-center justify-center gap-2
            ${isFormValid
              ? 'bg-gradient-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] hover:scale-[1.01] active:scale-95 shadow-pink-500/25 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
        >
          Continue <span className="text-2xl">→</span>
        </button>
      </div>
    </div>
    </div>
  );
}

export default GetStarted;