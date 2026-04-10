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
    setData({ ...data, font: fontItem.name });
  };

  const handleContinue = useCallback(() => {
    const selectedFont = fontStyles.find((font) => font.name === data.font);
    if (!selectedFont) {
      return;
    }

    dispatch(updateFormData({ fontId: selectedFont.id }));
    onNext();
  }, [data, dispatch, onNext]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && data.font) {
        event.preventDefault();
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.font, handleContinue]);

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 px-2 md:px-3">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex flex-col items-center text-center pt-1 md:mb-3 md:pt-1.5">
          <h1 className="mb-2 px-2 text-2xl font-black tracking-tight text-[#1A1A1A] md:text-4xl">
            Choose Your Font
          </h1>
          <p className="max-w-md px-4 text-xs font-medium leading-relaxed text-slate-600 md:max-w-lg md:text-sm">
            Select a typography style that matches your brand personality
          </p>
        </div>

        <div className="mx-auto mt-3 grid w-full max-w-[860px] flex-1 grid-cols-2 gap-x-2 gap-y-1.5 sm:grid-cols-2 md:mt-4 md:grid-cols-3 md:gap-x-2.5 md:gap-y-2">
          {fontStyles.map((font) => {
            const isSelected = data.font === font.name;

            return (
              <button
                key={font.id}
                onClick={() => handleSelect(font)}
                className={`relative flex h-[102px] flex-col items-center justify-center gap-1 rounded-[1rem] border-2 px-2.5 py-2 transition-all duration-500 ease-out sm:h-[114px] md:h-[152px] md:rounded-[1.15rem] md:px-4 md:py-3.5 ${
                  isSelected
                    ? 'z-10 scale-[1.02] border-pink-200 bg-white shadow-[0_20px_40px_-10px_rgba(255,0,122,0.15)] md:scale-105'
                    : 'border-transparent bg-white/60 shadow-sm hover:border-slate-100 hover:bg-white hover:shadow-md'
                }`}
              >
                <span className={`mb-0.5 text-[18px] text-slate-900 sm:text-[20px] md:text-[27px] ${font.style}`}>
                  Aa
                </span>

                <div className="space-y-0.5 text-center">
                  <span className={`block text-[11px] font-bold sm:text-[12px] md:text-[15px] ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                    {font.name}
                  </span>
                  <span className="block text-[8px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:text-[9px] md:text-[11px]">
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

        <div className="mx-auto flex w-full max-w-xl flex-col-reverse items-center justify-center gap-2 px-2 pb-[10px] pt-2 md:flex-row md:justify-center md:gap-1">
          <button
            onClick={onBack}
            className="brand-button-outline w-full rounded-2xl py-3 text-sm md:w-48"
          >
            Go Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!data.font}
            className={`flex w-full items-center justify-center rounded-2xl py-3 text-base font-black transition-all duration-500 md:w-48 ${
              data.font
                ? 'brand-button-primary hover:scale-[1.02] shadow-pink-500/30'
                : 'cursor-not-allowed bg-slate-200 text-slate-400 opacity-60 shadow-none'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Fonts;
