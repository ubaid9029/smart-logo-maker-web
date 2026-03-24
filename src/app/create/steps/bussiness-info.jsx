"use client";
import { HiOutlineSparkles } from 'react-icons/hi';
import { ChevronLeft } from 'lucide-react';
import { useDispatch } from "react-redux";
import { updateFormData } from "../../../store/slices/logoSlice";

const BusinessInfo = ({ onNext, data, setData }) => {
  const dispatch = useDispatch();
  
  // Validation check: Name aur slogan dono lazmi hain
  const isFormValid = data.businessName.trim() !== '' && data.slogan.trim() !== '';

  const handleInputChange = (field, value) => {
    // 1. Local state update (Form container ke liye)
    setData({ ...data, [field]: value });
    
    // 2. Redux state update (API ke liye name aur slogan sync karna)
    // Hum 'name' field update kar rahe hain kyunke API 'name' mangti hai
    if (field === 'businessName') {
      dispatch(updateFormData({ name: value }));
    } else {
      dispatch(updateFormData({ [field]: value }));
    }
  };

  // Continue button click handler
  const handleContinue = () => {
    if (isFormValid) {
      onNext(); // Parent page ka nextStep() trigger karega
    }
  };

  return (
<div className="pt-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">      {/* Back Button Section */}
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
        <div className="mx-auto w-16 h-16 md:w-24 md:h-24 bg-linear-to-br from-[#FF5C00] via-[#FF007A] to-[#C400FF] rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 shadow-2xl shadow-pink-200 border-2 md:border-4 border-white">
          <HiOutlineSparkles className="text-white text-3xl md:text-5xl" />
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#1A1A1A] tracking-tight mb-3 md:mb-5 leading-tight">
          Let&apos;s Get Started
        </h1>
        <p className="text-slate-500 text-lg md:text-xl lg:text-2xl font-medium max-w-2xl mx-auto px-2">
          Tell us about your business to create the perfect logo
        </p>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-4xl bg-white p-6 md:p-12 lg:p-16 rounded-[2rem] md:rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-white">
        <div className="space-y-6 md:space-y-10">
          
          {/* Business Name Input */}
          <div className="w-full">
            <label className="block text-lg md:text-xl font-bold text-slate-800 mb-3 md:mb-4 ml-1 md:ml-2">
              Business Name <span className='text-pink-500'>*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={data.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="Enter your business name"
              className='w-full px-5 py-4 md:px-8 md:py-6 rounded-2xl md:rounded-3xl border-2 border-slate-50 outline-none transition-all duration-300 focus:border-pink-200 focus:ring-8 md:focus:ring-12 focus:ring-pink-500/5 bg-slate-50/50 text-xl md:text-2xl font-medium'
            />
          </div>

          {/* Slogan Input */}
          <div className="w-full">
            <label className="block text-lg md:text-xl font-bold text-slate-800 mb-3 md:mb-4 ml-1 md:ml-2">
              Slogan <span className='text-pink-500'>*</span>
            </label>
            <input
              type="text"
              name="slogan"
              value={data.slogan}
              onChange={(e) => handleInputChange('slogan', e.target.value)}
              placeholder="Enter your slogan"
              className='w-full px-5 py-4 md:px-8 md:py-6 rounded-2xl md:rounded-3xl border-2 border-slate-50 outline-none transition-all duration-300 focus:border-purple-200 focus:ring-12 md:focus:ring-12 focus:ring-purple-500/5 bg-slate-50/50 text-xl md:text-2xl font-medium'
            />
          </div>
        </div>
      </div>

      {/* Continue Button Section */}
      <div className="w-full max-w-2xl mt-8 md:mt-12 mb-10 px-4 md:px-0">
        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          className={`w-full py-5 md:py-7 rounded-2xl md:rounded-[1.5rem] text-white font-black text-2xl md:text-3xl transition-all duration-500 shadow-2xl flex items-center justify-center gap-3
          ${isFormValid
              ? 'bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] hover:scale-[1.01] active:scale-95 shadow-pink-500/30'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-90'}`}
        >
          Continue <span className="text-3xl md:text-4xl">→</span>
        </button>
      </div>
    </div>
  );
};

export default BusinessInfo;

