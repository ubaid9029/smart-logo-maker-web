'use client';
import { useDispatch } from 'react-redux';
import { updateFormData } from "../../../store/slices/logoSlice";
import { Type, ChevronLeft } from 'lucide-react';

// Industry standard ke mutabiq IDs add ki hain jo API ko chahiye
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
    // 1. Local state update (UI highlighting ke liye)
    setData({ ...data, font: fontItem.name });

    // 2. Redux state update (cURL API ke liye Font ID)
    dispatch(updateFormData({ fontId: fontItem.id }));
  };

  return (
    <div className="pt-10 flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl px-4 md:px-0 mx-auto ">
      
      {/* Back Button */}
      <div className="w-full max-w-4xl flex justify-start mb-6 md:mb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-black transition-all bg-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl border border-slate-100 shadow-sm font-bold active:scale-95"
        >
          <ChevronLeft size={18} strokeWidth={3} />
          Back
        </button>
      </div>

      {/* Title Section */}
      <div className="flex flex-col items-center mb-8 md:mb-12 text-center">
        <div className="p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] bg-white shadow-xl shadow-pink-100/50 mb-4 md:mb-6 border border-white">
          <Type size={32} className="text-pink-600 md:w-10 md:h-10" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tight mb-3 md:mb-4 px-2">
          Choose Your Font
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-md md:max-w-lg px-4">
          Select a typography style that matches your brand personality
        </p>
      </div>

      {/* Fonts Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
        {fontStyles.map((font) => {
          const isSelected = data.font === font.name;

          return (
            <button
              key={font.id}
              onClick={() => handleSelect(font)}
              className={`
                relative p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center gap-3 md:gap-4
                transition-all duration-500 ease-out border-2
                ${isSelected
                  ? 'bg-white shadow-[0_20px_40px_-10px_rgba(255,0,122,0.15)] border-pink-200 scale-[1.02] md:scale-105 z-10'
                  : 'bg-white/60 shadow-sm border-transparent hover:border-slate-100 hover:bg-white hover:shadow-md'
                }
              `}
            >
              <span className={`text-3xl md:text-5xl text-slate-900 mb-1 md:mb-2 ${font.style}`}>
                Aa
              </span>

              <div className="text-center">
                <span className={`text-base md:text-lg font-bold block ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                  {font.name}
                </span>
                <span className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">
                  {font.description}
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 md:-top-2 md:-right-2 bg-linear-to-r from-[#FF5C00] to-[#FF007A] p-1.5 rounded-full shadow-lg border-2 border-white animate-in zoom-in-50 duration-300">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-2xl px-2 pb-10">
          <button
            onClick={onBack}
            className="w-full md:w-1/2 py-4 md:py-5 rounded-2xl text-lg font-bold text-slate-400 bg-white shadow-sm hover:text-slate-600 transition-all border border-slate-50 active:scale-95"
          >
            Go Back
          </button>
          
          <button
            onClick={onNext}
            disabled={!data.font}
            className={`
              w-full md:w-1/2 py-5 md:py-6 rounded-2xl text-lg md:text-xl font-black text-white
              transition-all duration-500 shadow-2xl tracking-wide flex items-center justify-center gap-3
              ${data.font
                ? 'bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] hover:scale-[1.02] active:scale-95 shadow-pink-500/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
              }
            `}
          >
            Continue <span>→</span>
          </button>
      </div>
    </div>
  );
};

export default Fonts;

