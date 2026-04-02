'use client';
import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import { updateFormData, generateLogosAction } from "../../../store/slices/logoSlice";

const palettes = [
  { id: "1", name: 'Vibrant Energy', gradient: 'from-orange-400 via-pink-500 to-yellow-400', colors: ['bg-orange-400', 'bg-pink-500', 'bg-yellow-400', 'bg-red-400'] },
  { id: "2", name: 'Professional Blue', gradient: 'from-blue-600 to-blue-400', colors: ['bg-blue-800', 'bg-blue-600', 'bg-sky-400', 'bg-slate-200'] },
  { id: "3", name: 'Warm Sunset', gradient: 'from-orange-600 to-yellow-400', colors: ['bg-orange-600', 'bg-orange-400', 'bg-yellow-500', 'bg-yellow-200'] },
  { id: "4", name: 'Cool Ocean', gradient: 'from-blue-700 to-cyan-400', colors: ['bg-blue-900', 'bg-blue-600', 'bg-cyan-400', 'bg-cyan-100'] },
  { id: "5", name: 'Natural Green', gradient: 'from-emerald-600 to-emerald-400', colors: ['bg-emerald-800', 'bg-emerald-600', 'bg-emerald-400', 'bg-emerald-200'] },
  { id: "6", name: 'Elegant Gold', gradient: 'from-slate-900 to-amber-500', colors: ['bg-slate-900', 'bg-amber-700', 'bg-amber-500', 'bg-amber-200'] },
];

const SUPPORTED_PALETTE_IDS = new Set(palettes.map((palette) => palette.id));

const ColorPalette = ({ onBack, data, setData }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [submissionError, setSubmissionError] = useState("");
  const { status, formData } = useSelector((state) => state.logo);
  const isLoading = status === 'loading';

  const handleSelect = (palette) => {
    setData({ ...data, color: palette.name });
    setSubmissionError("");
  };

  const handleGenerate = useCallback(async () => {
    const selectedPalette = palettes.find((palette) => palette.name === data.color);
    const selectedColorId = selectedPalette?.id || formData?.colorId;

    const payload = {
      ...formData,
      colorId: selectedColorId,
    };

    if (
      !payload.name?.trim() ||
      !payload.slogan?.trim() ||
      payload.industryId === undefined ||
      payload.industryId === null ||
      !payload.fontId ||
      !payload.colorId
    ) {
      setSubmissionError("Please complete business name, slogan, industry, font, and color before generating.");
      return;
    }

    if (!SUPPORTED_PALETTE_IDS.has(String(payload.colorId))) {
      setSubmissionError("This color palette is not supported right now. Please choose one of the available palettes.");
      return;
    }

    setSubmissionError("");
    dispatch(updateFormData({ colorId: String(payload.colorId) }));
    router.push('/generating');
    dispatch(generateLogosAction(payload));
  }, [data.color, dispatch, formData, router]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && data.color && !isLoading) {
        event.preventDefault();
        handleGenerate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.color, handleGenerate, isLoading]);

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 px-2 md:px-3">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex flex-col items-center text-center pt-1 md:mb-3 md:pt-1.5">
          <h1 className="mb-2 text-2xl font-black tracking-tight text-[#1A1A1A] md:text-4xl">Choose Your Colors</h1>
          <p className="max-w-lg px-2 text-xs font-medium text-slate-500 md:text-sm">Select a color scheme that matches your brand personality</p>
        </div>

        <div className="mx-auto mt-3 grid w-full max-w-[880px] flex-1 grid-cols-2 gap-x-2 gap-y-1.5 lg:grid-cols-3 md:mt-4 md:gap-x-2.5 md:gap-y-2">
          {palettes.map((palette) => {
            const isSelected = data.color === palette.name;

            return (
              <button
                key={palette.id}
                onClick={() => handleSelect(palette)}
                className={`relative flex h-[104px] flex-col items-center justify-between gap-1.5 rounded-[1rem] border-2 px-2.5 py-2.5 transition-all duration-500 ease-out sm:h-[122px] md:h-[162px] md:rounded-[1.15rem] md:px-4 md:py-4 ${
                  isSelected
                    ? 'z-10 scale-[1.03] border-pink-300 bg-white shadow-2xl'
                    : 'border-transparent bg-white/60 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className={`h-10 w-full rounded-[0.9rem] bg-linear-to-r shadow-inner sm:h-12 md:h-[72px] ${palette.gradient}`}></div>

                <div className="flex w-full justify-center gap-1.5 sm:gap-2.5">
                  {palette.colors.map((colorClass, index) => (
                    <div key={index} className={`h-3.5 w-3.5 rounded-full border border-white shadow-sm sm:h-[16px] sm:w-[16px] md:h-[22px] md:w-[22px] ${colorClass}`}></div>
                  ))}
                </div>

                <span className={`mb-0.5 text-[9px] font-black leading-tight sm:text-[11px] md:text-[14px] ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{palette.name}</span>

                {isSelected && (
                  <div className="absolute right-2 top-2 rounded-full border-2 border-white bg-linear-to-r from-[#FF5C00] to-[#FF007A] p-1.5 shadow-lg md:-right-2 md:-top-2 md:p-2">
                    <Check size={14} className="text-white md:w-4" strokeWidth={4} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mx-auto flex w-full max-w-xl flex-col-reverse items-center justify-center gap-2 pb-[10px] pt-2 md:flex-row md:justify-center md:gap-1">
          <button
            onClick={onBack}
            className="brand-button-outline w-full rounded-2xl py-3 text-sm md:w-48"
          >
            Go Back
          </button>

          <button
            onClick={handleGenerate}
            disabled={!data.color || isLoading}
            className={`flex w-full items-center justify-center gap-3 rounded-2xl py-3 text-base font-black transition-all duration-500 md:w-48 ${
              data.color && !isLoading
                ? 'brand-button-primary hover:scale-[1.02] shadow-pink-500/30'
                : 'cursor-not-allowed bg-slate-200 text-slate-400 opacity-60'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={24} />
                <span>Generating...</span>
              </div>
            ) : "Generate Logo"}
          </button>
        </div>

        {submissionError && (
          <p className="pb-4 text-sm font-medium text-red-500">{submissionError}</p>
        )}
      </div>
    </div>
  );
};

export default ColorPalette;
