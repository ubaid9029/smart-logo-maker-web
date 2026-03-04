'use client';
import { Palette, ChevronLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Router import kiya
import { useDispatch, useSelector } from "react-redux";
import { generateLogo } from "./store/logoSlice";
import { useRouter } from "next/navigation";

const dispatch = useDispatch();
const router = useRouter();

const handleGenerate = async () => {
  await dispatch(
    generateLogo({
      color: "1",
      font: "1",
      industry: 23,
      name: businessNameFromRedux,
    })
  );

  router.push("/generating");
};

const palettes = [
  { name: 'Vibrant Energy', gradient: 'from-orange-400 via-pink-500 to-yellow-400', colors: ['bg-orange-400', 'bg-pink-500', 'bg-yellow-400', 'bg-red-400'] },
  { name: 'Professional Blue', gradient: 'from-blue-600 to-blue-400', colors: ['bg-blue-800', 'bg-blue-600', 'bg-sky-400', 'bg-slate-200'] },
  { name: 'Warm Sunset', gradient: 'from-orange-600 to-yellow-400', colors: ['bg-orange-600', 'bg-orange-400', 'bg-yellow-500', 'bg-yellow-200'] },
  { name: 'Cool Ocean', gradient: 'from-blue-700 to-cyan-400', colors: ['bg-blue-900', 'bg-blue-600', 'bg-cyan-400', 'bg-cyan-100'] },
  { name: 'Natural Green', gradient: 'from-emerald-600 to-emerald-400', colors: ['bg-emerald-800', 'bg-emerald-600', 'bg-emerald-400', 'bg-emerald-200'] },
  { name: 'Elegant Gold', gradient: 'from-slate-900 to-amber-500', colors: ['bg-slate-900', 'bg-amber-700', 'bg-amber-500', 'bg-amber-200'] },
  { name: 'Soft Pastel', gradient: 'from-pink-300 to-yellow-100', colors: ['bg-pink-300', 'bg-purple-200', 'bg-sky-200', 'bg-yellow-100'] },
  { name: 'Monochrome', gradient: 'from-slate-900 to-slate-200', colors: ['bg-black', 'bg-slate-700', 'bg-slate-400', 'bg-slate-100'] },
];

const ColorPalette = ({ onBack, data, setData }) => {
  const router = useRouter(); // Router initialize kiya

  const handleSelect = (paletteName) => {
    setData({ ...data, color: paletteName });
  };

  // --- GENERATE LOGO CLICK HANDLER ---
  const handleGenerate = () => {
    if (data.color) {
      // Yahan hum /generating page par move kar rahe hain
      router.push('/generating'); 
    }
  };

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl">
      
      {/* Back Button */}
      <div className="w-full flex justify-start mb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-black transition-all bg-white px-5 py-2.5 rounded-xl border border-slate-100 shadow-sm font-bold active:scale-95"
        >
          <ChevronLeft size={18} strokeWidth={3} />
          Back
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center mb-12 text-center">
        <div className="p-5 rounded-[2rem] bg-white shadow-xl shadow-pink-100/50 mb-6 border border-white">
          <Palette size={40} className="text-pink-600" />
        </div>
        <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tight mb-4">Choose Your Colors</h1>
        <p className="text-xl text-slate-500 font-medium max-w-lg">Select a color scheme that matches your brand personality</p>
      </div>

      {/* Palette Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-4xl mb-12">
        {palettes.map((palette) => {
          const isSelected = data.color === palette.name;

          return (
            <button
              key={palette.name}
              onClick={() => handleSelect(palette.name)}
              className={`relative p-4 rounded-[2.5rem] flex flex-col items-center justify-between gap-5 transition-all duration-500 ease-out border-2 ${
                isSelected ? 'bg-white shadow-[0_20px_40px_-10px_rgba(255,0,122,0.15)] border-pink-200 scale-105 z-10' : 'bg-white/60 border-transparent hover:bg-white'
              }`}
            >
              <div className={`w-full h-32 rounded-[1.5rem] bg-linear-to-r ${palette.gradient} shadow-inner`}></div>
              <div className="flex gap-2 justify-center w-full">
                {palette.colors.map((colorClass, index) => (
                  <div key={index} className={`w-6 h-6 rounded-full ${colorClass} border border-white shadow-sm`}></div>
                ))}
              </div>
              <span className={`text-sm font-black mb-2 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{palette.name}</span>
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-linear-to-r from-[#FF5C00] to-[#FF007A] p-1.5 rounded-full shadow-lg border-2 border-white animate-in zoom-in-50 duration-300">
                  <Check size={16} className="text-white" strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-2xl">
        <button onClick={onBack} className="w-full md:w-1/2 py-5 rounded-3xl text-lg font-bold text-slate-400 bg-white shadow-sm hover:text-slate-600 border border-slate-50">
          Go Back
        </button>
        
        {/* Generate Button with router.push */}
        <button
          onClick={handleGenerate}
          disabled={!data.color}
          className={`w-full md:w-1/2 py-6 rounded-[2rem] text-xl font-black text-white transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 ${
            data.color ? 'bg-linear-to-r from-[#FFB88C] via-[#FF007A] to-[#C400FF] hover:scale-[1.02] shadow-pink-500/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          Generate Logo 
        </button>
      </div>
    </div>
  );
};

export default ColorPalette;