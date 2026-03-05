"use client";
import { HiOutlineSparkles } from 'react-icons/hi';
import { ChevronLeft } from 'lucide-react';
import { useDispatch } from "react-redux";
import { setFormData } from "../../../store/slice/logoSlice";

const BusinessInfo = ({ onNext, data, setData }) => {
  const dispatch = useDispatch();
  const isFormValid = data.businessName.trim() !== '';

  const handleInputChange = (field, value) => {
    setData({ ...data, [field]: value });
    dispatch(setFormData({ [field]: value }));
  };

  return (
    <div className="pt-20 w-full flex flex-col items-center pt-6 md:pt-10 max-w-6xl mx-auto relative animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">

      {/* Back Button Section - Responsive Width */}
      <div className="w-full max-w-4xl flex justify-start mb-6 md:mb-10">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-black transition-all bg-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl border border-slate-100 shadow-sm font-bold active:scale-95 text-sm md:text-base"
        >
          <ChevronLeft size={18} strokeWidth={3} />
          Back
        </button>
      </div>

      {/* Header Section */}
      <div className="text-center mb-8 md:mb-12">
        <div className="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-[#FF5C00] via-[#FF007A] to-[#C400FF] rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 shadow-2xl shadow-pink-200 border-2 md:border-4 border-white">
          <HiOutlineSparkles className="text-white text-3xl md:text-5xl" />
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#1A1A1A] tracking-tight mb-3 md:mb-5 leading-tight">
          Let's Get Started
        </h1>
        <p className="text-slate-500 text-lg md:text-xl lg:text-2xl font-medium max-w-2xl mx-auto px-2">
          Tell us about your business to create the perfect logo
        </p>
      </div>

      {/* Main Form Card - Responsive Padding & Width */}
      <div className="w-full max-w-4xl bg-white p-6 md:p-12 lg:p-16 rounded-[2rem] md:rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-white">
        <div className="space-y-6 md:y-10">
          
          {/* Business Name Input */}
          <div className="w-full">
            <label className="block text-lg md:text-xl font-bold text-slate-800 mb-3 md:mb-4 ml-1 md:ml-2">
              Business Name <span className='text-pink-500'>*</span>
            </label>
            <input
              type="text"
              value={data.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="Enter your business name"
              className='w-full px-5 py-4 md:px-8 md:py-6 rounded-2xl md:rounded-3xl border-2 border-slate-50 outline-none transition-all duration-300 focus:border-pink-200 focus:ring-[8px] md:focus:ring-[12px] focus:ring-pink-500/5 bg-slate-50/50 text-xl md:text-2xl font-medium'
            />
          </div>

          {/* Slogan Input */}
          <div className="w-full">
            <label className="block text-lg md:text-xl font-bold text-slate-800 mb-3 md:mb-4 ml-1 md:ml-2">
              Slogan <span className="text-slate-400 font-normal ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              value={data.slogan}
              onChange={(e) => handleInputChange('slogan', e.target.value)}
              placeholder="Enter your slogan"
              className='w-full px-5 py-4 md:px-8 md:py-6 rounded-2xl md:rounded-3xl border-2 border-slate-50 outline-none transition-all duration-300 focus:border-purple-200 focus:ring-[8px] md:focus:ring-[12px] focus:ring-purple-500/5 bg-slate-50/50 text-xl md:text-2xl font-medium'
            />
          </div>
        </div>

        {/* Tip Box - Text wrapping for mobile */}
        <div className="mt-8 md:mt-12 flex items-start md:items-center justify-center gap-3 md:gap-4 bg-slate-50/80 p-4 md:py-4 rounded-xl md:rounded-2xl border border-slate-100">
          <span className="text-xl md:text-2xl">💡</span>
          <p className="text-slate-500 font-bold italic text-sm md:text-lg">
            Your information helps our AI create personalized logo designs
          </p>
        </div>
      </div>

      {/* Continue Button Section */}
      <div className="w-full max-w-2xl mt-8 md:mt-12 mb-10 px-4 md:px-0">
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className={`w-full py-5 md:py-7 rounded-2xl md:rounded-[1.5rem] text-white font-black text-2xl md:text-3xl transition-all duration-500 shadow-2xl flex items-center justify-center gap-3
          ${isFormValid
              ? 'bg-gradient-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] hover:scale-[1.01] active:scale-95 shadow-pink-500/30'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-90'}`}
        >
          Continue <span className="text-3xl md:text-4xl">→</span>
        </button>
      </div>
    </div>
  );
};

export default BusinessInfo;