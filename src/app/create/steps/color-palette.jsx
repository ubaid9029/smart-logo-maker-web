'use client';
import { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import { PremiumInlineLoader } from '../../../components/Shared/PremiumLoader';
import { updateFormData, generateLogosAction } from "../../../store/slices/logoSlice";

const palettes = [
  { id: "1", name: 'Vibrant Energy', gradient: 'from-orange-400 via-pink-500 to-yellow-400', colors: ['bg-orange-400', 'bg-pink-500', 'bg-yellow-400', 'bg-red-400'] },
  { id: "2", name: 'Professional Blue', gradient: 'from-blue-600 to-blue-400', colors: ['bg-blue-800', 'bg-blue-600', 'bg-sky-400', 'bg-slate-200'] },
  { id: "3", name: 'Warm Sunset', gradient: 'from-orange-600 to-yellow-400', colors: ['bg-orange-600', 'bg-orange-400', 'bg-yellow-500', 'bg-yellow-200'] },
  { id: "4", name: 'Cool Ocean', gradient: 'from-blue-700 to-cyan-400', colors: ['bg-blue-900', 'bg-blue-600', 'bg-cyan-400', 'bg-cyan-100'] },
  { id: "5", name: 'Natural Green', gradient: 'from-emerald-600 to-emerald-400', colors: ['bg-emerald-800', 'bg-emerald-600', 'bg-emerald-400', 'bg-emerald-200'] },
  { id: "6", name: 'Elegant Gold', gradient: 'from-slate-900 to-amber-500', colors: ['bg-slate-900', 'bg-amber-700', 'bg-amber-500', 'bg-amber-200'] },
];

const ColorPalette = ({ onBack, data, setData }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [submissionError, setSubmissionError] = useState("");
  const { status, formData } = useSelector((state) => state.logo);
  const isLoading = status === 'loading';

  const handleSelect = (palette) => {
    setData((currentData) => ({ ...currentData, colorId: palette.id }));
    setSubmissionError("");
  };

  const handleGenerate = useCallback(async () => {
    setSubmissionError("");
    const selectedColorId = data.colorId || formData?.colorId || '';

    // Build payload with defaults to empty strings for missing values
    const payload = {
      name: formData?.name || '',
      slogan: formData?.slogan || '',
      industryId: formData?.industryId || null,
      fontId: formData?.fontId || '',
      colorId: selectedColorId || '',
    };

    try {
      // Update Redux with color if selected
      if (selectedColorId) {
        dispatch(updateFormData({ colorId: String(selectedColorId) }));
      }
      
      // Dispatch API call
      dispatch(generateLogosAction(payload));
      
      // Navigate to generating page
      router.push('/generating');
    } catch (error) {
      setSubmissionError(error?.message || "Failed to generate logos. Please try again.");
    }
  }, [data.colorId, dispatch, formData, router]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && !isLoading) {
        event.preventDefault();
        handleGenerate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.colorId, handleGenerate, isLoading]);

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* ── FIXED TOP: Heading + Buttons ── */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-md pb-4 pt-6 md:pb-6 md:pt-8 w-full max-w-5xl mx-auto px-2 md:px-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
          <div className="text-center md:text-left mb-3 md:mb-0">
            <h1 className="mb-1.5 text-3xl font-black leading-tight tracking-tight text-[#111827] md:text-5xl">
              Choose Your Colors
            </h1>
            <p className="text-base md:text-xl font-semibold leading-relaxed text-slate-600">
              Select a color scheme that matches your brand personality
            </p>
            <p className="mt-1 text-xs md:text-sm font-medium text-slate-500">
              Choose a palette to shape the mood, or generate with default colors.
            </p>
          </div>
          <div className="flex flex-row items-center justify-center gap-2 md:gap-3 w-full md:w-auto">
            <button
              onClick={onBack}
              className="brand-button-outline w-1/2 md:w-auto rounded-2xl py-2.5 px-6 text-sm font-bold"
            >
              Go Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-1/2 md:w-auto flex items-center justify-center gap-2 rounded-2xl py-2.5 px-6 text-sm font-black transition-all duration-300 ${!isLoading
                ? 'brand-button-primary hover:scale-[1.02] shadow-pink-500/30'
                : 'cursor-not-allowed bg-slate-200 opacity-60'
                }`}
            >
              {isLoading ? (
                <>
                  <PremiumInlineLoader size={14} />
                  <span>Generating...</span>
                </>
              ) : "Generate Logo"}
            </button>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE GRID ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 px-2 md:px-3 w-full max-w-5xl mx-auto pt-2">
        {submissionError && (
          <div className="mb-4 text-center text-sm font-semibold text-red-600 rounded-xl bg-red-50 py-2.5 border border-red-100">
            {submissionError}
          </div>
        )}
        <div className="mx-auto grid w-full flex-1 grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3 md:gap-x-3 md:gap-y-3">
          {palettes.map((palette) => {
            const isSelected = data.colorId === palette.id;

            return (
              <button
                key={palette.id}
                onClick={() => handleSelect(palette)}
                className={`relative flex h-[132px] flex-col items-center justify-between gap-2 rounded-[1rem] border-2 px-3 py-3 transition-all duration-500 ease-out sm:h-[144px] md:h-[178px] md:rounded-[1.15rem] md:px-4 md:py-4 ${isSelected
                  ? 'z-10 scale-[1.02] border-pink-300 bg-white shadow-[0_22px_40px_-16px_rgba(255,0,122,0.35)]'
                  : 'border-slate-100 bg-white/85 hover:border-slate-200 hover:bg-white hover:shadow-md'
                  }`}
              >
                <div className={`h-14 w-full rounded-[0.9rem] bg-linear-to-r shadow-inner sm:h-16 md:h-[78px] ${palette.gradient}`}></div>

                <div className="flex w-full justify-center gap-1.5 sm:gap-2.5">
                  {palette.colors.map((colorClass, index) => (
                    <div key={index} className={`h-3.5 w-3.5 rounded-full border border-white shadow-sm sm:h-[16px] sm:w-[16px] md:h-[22px] md:w-[22px] ${colorClass}`}></div>
                  ))}
                </div>

                <span className={`mb-0.5 text-[15px] font-black leading-tight sm:text-[16px] md:text-[18px] ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{palette.name}</span>

                {isSelected && (
                  <div className="absolute right-2 top-2 rounded-full border-2 border-white bg-linear-to-r from-[#FF5C00] to-[#FF007A] p-1.5 shadow-lg md:-right-2 md:-top-2 md:p-2">
                    <Check size={14} className="text-white md:w-4" strokeWidth={4} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
