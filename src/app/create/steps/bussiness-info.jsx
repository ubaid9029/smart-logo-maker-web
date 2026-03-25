"use client";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateFormData } from "../../../store/slices/logoSlice";

const BusinessInfo = ({ onNext, data, setData }) => {
  const dispatch = useDispatch();
  const isFormValid = data.businessName.trim() !== '' && data.slogan.trim() !== '';

  const handleInputChange = (field, value) => {
    setData({ ...data, [field]: value });

    if (field === 'businessName') {
      dispatch(updateFormData({ name: value }));
    } else {
      dispatch(updateFormData({ [field]: value }));
    }
  };

  const handleContinue = useCallback(() => {
    if (isFormValid) {
      onNext();
    }
  }, [isFormValid, onNext]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Enter' || event.shiftKey) {
        return;
      }
      if (isFormValid) {
        event.preventDefault();
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleContinue, isFormValid]);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 md:px-3">
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="mb-3 text-center md:mb-5">
          <h1 className="mb-2 text-2xl font-black leading-tight tracking-tight text-[#1A1A1A] md:text-4xl lg:text-5xl">
            Let&apos;s Get Started
          </h1>
          <p className="mx-auto max-w-xl px-2 text-sm font-medium text-slate-500 md:text-base lg:text-lg">
            Tell us about your business to create the perfect logo
          </p>
        </div>

        <div className="w-full rounded-[1.6rem] border border-white bg-white p-4 shadow-[0_24px_55px_-18px_rgba(0,0,0,0.06)] md:rounded-[2rem] md:p-6 lg:p-7">
          <div className="space-y-3.5 md:space-y-5">
            <div className="w-full">
              <label className="mb-2 block text-sm font-bold text-slate-800 md:mb-2.5 md:ml-1 md:text-base">
                Business Name <span className='text-pink-500'>*</span>
              </label>
              <input
                type="text"
                name="businessName"
                value={data.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter your business name"
                className="w-full rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 py-2.5 text-base font-medium outline-none transition-all duration-300 focus:border-pink-200 focus:ring-6 focus:ring-pink-500/5 md:px-5 md:py-3 md:text-lg"
              />
            </div>

            <div className="w-full">
              <label className="mb-2 block text-sm font-bold text-slate-800 md:mb-2.5 md:ml-1 md:text-base">
                Slogan <span className='text-pink-500'>*</span>
              </label>
              <input
                type="text"
                name="slogan"
                value={data.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                placeholder="Enter your slogan"
                className="w-full rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 py-2.5 text-base font-medium outline-none transition-all duration-300 focus:border-purple-200 focus:ring-6 focus:ring-purple-500/5 md:px-5 md:py-3 md:text-lg"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-3 flex w-full max-w-xl justify-center pb-[10px] md:mt-5">
          <button
            onClick={handleContinue}
            disabled={!isFormValid}
            className={`flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 text-lg font-black text-white shadow-2xl transition-all duration-500 md:w-56 md:py-4 md:text-xl ${
              isFormValid
                ? 'bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] hover:scale-[1.01] active:scale-95 shadow-pink-500/30'
                : 'cursor-not-allowed bg-slate-200 text-slate-400 opacity-90'
            }`}
          >
            Continue <span className="text-xl md:text-2xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfo;
