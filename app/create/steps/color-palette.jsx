'use client';
import { Palette, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import { updateFormData, generateLogosAction } from "../../../store/slices/logoSlice";
import { useEffect } from 'react';


const palettes = [
  { id: "1", name: 'Vibrant Energy', gradient: 'from-orange-400 via-pink-500 to-yellow-400', colors: ['bg-orange-400', 'bg-pink-500', 'bg-yellow-400', 'bg-red-400'] },
  { id: "2", name: 'Professional Blue', gradient: 'from-blue-600 to-blue-400', colors: ['bg-blue-800', 'bg-blue-600', 'bg-sky-400', 'bg-slate-200'] },
  { id: "3", name: 'Warm Sunset', gradient: 'from-orange-600 to-yellow-400', colors: ['bg-orange-600', 'bg-orange-400', 'bg-yellow-500', 'bg-yellow-200'] },
  { id: "4", name: 'Cool Ocean', gradient: 'from-blue-700 to-cyan-400', colors: ['bg-blue-900', 'bg-blue-600', 'bg-cyan-400', 'bg-cyan-100'] },
  { id: "5", name: 'Natural Green', gradient: 'from-emerald-600 to-emerald-400', colors: ['bg-emerald-800', 'bg-emerald-600', 'bg-emerald-400', 'bg-emerald-200'] },
  { id: "6", name: 'Elegant Gold', gradient: 'from-slate-900 to-amber-500', colors: ['bg-slate-900', 'bg-amber-700', 'bg-amber-500', 'bg-amber-200'] },
  { id: "7", name: 'Soft Pastel', gradient: 'from-pink-300 to-yellow-100', colors: ['bg-pink-300', 'bg-purple-200', 'bg-sky-200', 'bg-yellow-100'] },
  { id: "8", name: 'Monochrome', gradient: 'from-slate-900 to-slate-200', colors: ['bg-black', 'bg-slate-700', 'bg-slate-400', 'bg-slate-100'] },
  { id: "9", name: 'Vibrant', gradient: 'from-purple-900 to-purple-200', colors: ['bg-purple', 'bg-slate-700', 'bg-slate-400', 'bg-slate-100'] },
];

const ColorPalette = ({ onBack, data, setData }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux se data nikaalna
  const { loading, formData } = useSelector((state) => state.logo);

  const handleSelect = (palette) => {
    setData({ ...data, color: palette.name });
    // Color ID ko Redux mein update karna
    dispatch(updateFormData({ colorId: palette.id }));
  };

  const handleGenerate = async () => {
    if (data.color) {
      // initiateGeneration() yahan se hata dein
      router.push('/generating'); // Page move karein

      const selectedPalette = palettes.find(p => p.name === data.color);

      dispatch(generateLogosAction({
        ...formData, // Spread operator ka use karein
        colorId: selectedPalette?.id || "1"
      }));
    }
  };

  return (
    <div className="pt-10 flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto px-4 md:px-6">

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

      {/* Header */}
      <div className="flex flex-col items-center mb-8 md:mb-12 text-center">
        <div className=" p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] bg-white shadow-xl shadow-pink-100/50 mb-4 md:mb-6 border border-white">
          <Palette size={32} className="text-pink-600 md:w-10 md:h-10" />
        </div> 
        <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tight mb-3 md:mb-4">Choose Your Colors</h1>
        <p className="text-base md:text-xl text-slate-500 font-medium max-w-lg px-2">Select a color scheme that matches your brand personality</p>
      </div>

      {/* Palette Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mb-10 md:mb-12">
        {palettes.map((palette) => {
          const isSelected = data.color === palette.name;

          return (
            <button
              key={palette.id}
              onClick={() => handleSelect(palette)}
              className={`relative p-4 md:p-5 rounded-[1.8rem] md:rounded-[2.5rem] flex flex-col items-center justify-between gap-4 md:gap-5 transition-all duration-500 ease-out border-2 ${isSelected ? 'bg-white shadow-2xl border-pink-300 scale-[1.03] z-10' : 'bg-white/60 border-transparent hover:bg-white hover:shadow-md'
                }`}
            >
              <div className={`w-full h-24 md:h-32 rounded-[1.2rem] md:rounded-[1.5rem] bg-linear-to-r ${palette.gradient} shadow-inner`}></div>

              <div className="flex gap-2 justify-center w-full">
                {palette.colors.map((colorClass, index) => (
                  <div key={index} className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${colorClass} border border-white shadow-sm`}></div>
                ))}
              </div>

              <span className={`text-xs md:text-sm font-black mb-1 md:mb-2 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{palette.name}</span>

              {isSelected && (
                <div className="absolute top-2 right-2 md:-top-2 md:-right-2 bg-linear-to-r from-[#FF5C00] to-[#FF007A] p-1.5 md:p-2 rounded-full shadow-lg border-2 border-white animate-in zoom-in-50 duration-300">
                  <Check size={14} className="text-white md:w-4" strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-2xl mb-10">
        <button
          onClick={onBack}
          className="w-full md:w-1/2 py-4 md:py-5 rounded-2xl text-lg font-bold text-slate-400 bg-white shadow-sm hover:text-slate-600 border border-slate-50 transition-all active:scale-95"
        >
          Go Back
        </button>

        <button
          onClick={handleGenerate}
          disabled={!data.color || loading}
          className={`w-full md:w-1/2 py-5 md:py-6 rounded-2xl text-lg md:text-xl font-black text-white transition-all duration-500 shadow-xl flex items-center justify-center gap-3 ${data.color && !loading
              ? 'bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] hover:scale-[1.02] active:scale-95 shadow-pink-500/30'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span>Generating...</span>
            </div>
          ) : "Generate Logo"}
        </button>
      </div>
    </div>
  );
};

export default ColorPalette;

