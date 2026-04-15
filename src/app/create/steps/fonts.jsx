'use client';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateFormData } from "../../../store/slices/logoSlice";

const fontStyles = [
  { id: "1", name: 'Modern Sans', description: 'Clean and contemporary', style: 'font-sans' },
  { id: "2", name: 'Elegant Serif', description: 'Sophisticated and timeless', style: 'font-serif' },
  { id: "3", name: 'Bold Display', description: 'Strong and impactful', style: 'font-extrabold tracking-tighter' },
  { id: "4", name: 'Playful Rounded', description: 'Friendly and approachable', style: 'font-mono text-pink-500' },
  { id: "5", name: 'Minimal Light', description: 'Subtle and refined', style: 'font-light' },
  { id: "6", name: 'Classic Script', description: 'Elegant and decorative', style: 'italic font-serif' },
];

const Fonts = ({ onNext, onBack, data, setData }) => {
  const dispatch = useDispatch();

  const handleSelect = (fontItem) => {
    setData((currentData) => ({ ...currentData, fontId: fontItem.id }));
  };

  const handleContinue = useCallback(() => {
    if (!data.fontId) {
      return;
    }

    dispatch(updateFormData({ fontId: data.fontId }));
    onNext();
  }, [data.fontId, dispatch, onNext]);

  const handleSkip = useCallback(() => {
    setData((currentData) => ({ ...currentData, fontId: '' }));
    dispatch(updateFormData({ fontId: '' }));
    onNext();
  }, [dispatch, onNext, setData]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && data.fontId) {
        event.preventDefault();
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.fontId, handleContinue]);

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* ── FIXED TOP: Heading + Buttons ── */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-md pb-4 pt-6 md:pb-6 md:pt-8 w-full max-w-5xl mx-auto px-2 md:px-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
          <div className="text-center md:text-left mb-3 md:mb-0">
            <h1 className="mb-1.5 text-3xl font-black leading-tight tracking-tight text-[#111827] md:text-5xl">
              Choose Your Font
            </h1>
            <p className="text-base md:text-xl font-semibold leading-relaxed text-slate-600">
              Select a typography style that matches your brand personality
            </p>
            <p className="mt-1 text-xs md:text-sm font-medium text-slate-500">
              Choose one style for stronger logo direction, or skip to use a default font.
            </p>
          </div>
          <div className="flex flex-row items-center justify-center gap-2 md:gap-3 w-full md:w-auto">
            <button
              onClick={onBack}
              className="brand-button-outline w-1/2 md:w-auto rounded-2xl py-2.5 px-6 text-sm font-bold"
            >
              Go Back
            </button>
            {data.fontId ? (
              <button
                onClick={handleContinue}
                className="w-1/2 md:w-auto rounded-2xl py-2.5 px-8 text-sm font-black transition-all duration-300 brand-button-primary hover:scale-[1.02] shadow-pink-500/30"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="w-1/2 md:w-auto rounded-2xl py-2.5 px-8 text-sm font-black transition-all duration-300 brand-button-secondary"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE GRID ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 px-2 md:px-3 w-full max-w-5xl mx-auto pt-2">
        <div className="mx-auto grid w-full flex-1 grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2 md:grid-cols-3 md:gap-x-3 md:gap-y-3">
          {fontStyles.map((font) => {
            const isSelected = data.fontId === font.id;

            return (
              <button
                key={font.id}
                onClick={() => handleSelect(font)}
                className={`relative flex h-[126px] flex-col items-center justify-center gap-1.5 rounded-[1rem] border-2 px-3 py-3 transition-all duration-500 ease-out sm:h-[138px] md:h-[176px] md:rounded-[1.15rem] md:px-5 md:py-4 ${isSelected
                  ? 'z-10 scale-[1.01] border-pink-300 bg-white shadow-[0_22px_40px_-16px_rgba(255,0,122,0.3)] md:scale-[1.02]'
                  : 'border-slate-100 bg-white/85 shadow-sm hover:border-slate-200 hover:bg-white hover:shadow-md'
                  }`}
              >
                <span className={`mb-1 text-[28px] text-slate-900 sm:text-[30px] md:text-[38px] ${font.style}`}>
                  Aa
                </span>

                <div className="space-y-1 text-center">
                  <span className={`block text-[15px] font-bold sm:text-[16px] md:text-[20px] ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                    {font.name}
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px] md:text-[13px]">
                    {font.description}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute right-2 top-2 rounded-full border-2 border-white bg-linear-to-r from-[#FF5C00] to-[#FF007A] p-1.5 shadow-lg md:-right-2 md:-top-2">
                    <svg className="h-3 w-3 text-white md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
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

export default Fonts;
