"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
import { HiOutlineSparkles } from 'react-icons/hi';
import { ChevronLeft } from 'lucide-react'; 

const GetStarted = () => {
  const router = useRouter(); 
  const [businessName, setBusinessName] = useState('');
  const [slogan, setSlogan] = useState('');

  const isFormValid = businessName.trim() !== '';

  // 4. Handle Back function
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#FDF2F8] flex flex-col items-center justify-center p-5 mt-20">
      {/* Back Button */}
      <div className="absolute top-5 left-5">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors bg-white hover:bg-gray-100 rounded-xl px-4 py-2 border border-gray-200 shadow-sm"
        >
          <ChevronLeft size={20} />
          Back
        </button>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] rounded-sm flex items-center justify-center mb-4">
          <HiOutlineSparkles className="text-white text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Let's Get Started</h1>
        <p className="text-gray-500 mt-2">Tell us about your business to create the perfect logo</p>
      </div>

      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 ">Business Name <span className='text-pink-500'>*</span> </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"            
              className='mt-2 block w-full px-4 py-3 rounded-xl border border-gray-200 outline-none transition-all duration-300 hover:border-pink-300 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 bg-gray-50'
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Slogan <span className="text-gray-400">(Optional)</span></label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Enter your slogan or tagline"
              className='mt-2 block w-full px-4 py-3 rounded-xl border border-gray-200 outline-none transition-all duration-300 hover:border-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 bg-gray-50'
            />
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center bg-gray-50 p-4 rounded-xl">
          <span className="mr-2">💡</span> Your information helps our AI create personalized logo designs
        </p>
      </div>

      {/* Continue Button */}
      <Link href="/create/business-info" className="w-full max-w-2xl">
        <button
          disabled={!isFormValid}
          className={`w-full mt-8 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg 
            ${isFormValid
            ? 'bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] hover:scale-[1.02] shadow-pink-500/30'
            : 'bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] hover:scale-[1.02] shadow-pink-500/30 opacity-10 cursor-not-allowed'}`}
        >
          Continue →
        </button>
      </Link>
    </div>
  );
}

export default GetStarted;