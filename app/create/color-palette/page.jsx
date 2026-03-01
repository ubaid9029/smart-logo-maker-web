'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { Palette, ChevronLeft } from 'lucide-react';

const palettes = [
  { name: 'Vibrant Energy', gradient: 'from-orange-400 via-pink-500 to-yellow-400', colors: ['bg-red-400', 'bg-teal-500', 'bg-yellow-300', 'bg-emerald-300'] },
  { name: 'Professional Blue', gradient: 'from-blue-600 to-blue-400', colors: ['bg-slate-800', 'bg-sky-500', 'bg-slate-100', 'bg-slate-500'] },
  { name: 'Warm Sunset', gradient: 'from-orange-600 to-yellow-400', colors: ['bg-orange-500', 'bg-orange-400', 'bg-yellow-400', 'bg-orange-500'] },
  { name: 'Cool Ocean', gradient: 'from-blue-700 to-cyan-400', colors: ['bg-blue-600', 'bg-sky-500', 'bg-cyan-200', 'bg-sky-200'] },
  { name: 'Natural Green', gradient: 'from-emerald-600 to-emerald-400', colors: ['bg-emerald-700', 'bg-emerald-500', 'bg-emerald-400', 'bg-emerald-300'] },
  { name: 'Elegant Gold', gradient: 'from-slate-900 to-amber-500', colors: ['bg-slate-900', 'bg-amber-600', 'bg-amber-200', 'bg-white'] },
  { name: 'Soft Pastel', gradient: 'from-pink-300 to-yellow-100', colors: ['bg-pink-200', 'bg-purple-300', 'bg-sky-200', 'bg-yellow-100'] },
  { name: 'Monochrome', gradient: 'from-slate-900 to-slate-200', colors: ['bg-black', 'bg-slate-700', 'bg-slate-500', 'bg-white'] },
];

const ColorPaletteGrid = () => {
  const [selectedPalette, setSelectedPalette] = useState(null);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (selectedPalette) {
      router.push('/create/generating');
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 w-full">
      {/* Wrapper to center everything */}
      <div className="max-w-6xl mx-auto p-6 flex flex-col items-center">
        
        {/* Top Left Back Button Section */}
        <div className="w-full flex justify-start mb-6">
        <Link href="..\create\fonts">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 hover:text-slate-900 transition-colors bg-white text-black hover:bg-gray-200 rounded-md px-4 py-2 border-2"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          </Link>
        </div>

        {/* Title Section */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="p-4 rounded-3xl bg-white shadow-inner mb-6">
            <Palette size={40} className="text-pink-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 mb-3 tracking-tight">
            Choose Your Color Palette
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            Select a color scheme that matches your brand personality
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
          {palettes.map((palette) => {
            const isSelected = selectedPalette === palette.name;

            return (
              <button
                key={palette.name}
                onClick={() => setSelectedPalette(palette.name)}
                className={`
                  relative p-4 rounded-3xl flex flex-col items-center justify-between gap-4
                  transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-lg
                  ${isSelected
                    ? 'bg-white shadow-xl ring-2 ring-orange-400'
                    : 'bg-white shadow-md border-2 border-transparent'
                  }
                `}
              >
                {/* Gradient Preview */}
                <div className={`w-full h-32 rounded-2xl bg-linear-to-r ${palette.gradient} shadow-inner`}></div>

                {/* Small Color Circles */}
                <div className="flex gap-2 justify-center w-full">
                  {palette.colors.map((color, index) => (
                    <div key={index} className={`w-6 h-6 rounded-full ${color} border border-slate-200`}></div>
                  ))}
                </div>

                <span className="text-sm font-bold text-slate-950 mt-1">
                  {palette.name}
                </span>

                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-linears-to-r from-pink-500 to-orange-400 p-1.5 rounded-full shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Action Section - Centered Fix */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-2xl">
          <button 
            onClick={handleBack}
            className="w-full md:w-1/2 py-4 rounded-xl text-lg font-semibold text-slate-700 bg-white shadow-md hover:bg-slate-100 transition-all border border-gray-100"
          >
           <Link href="..\create\fonts">Back</Link> 
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedPalette}
            className={`
              w-full md:w-1/2 py-4 rounded-xl text-lg font-bold text-white
              transition-all duration-300 ease-in-out shadow-lg
              ${selectedPalette 
                ? 'bg-linear-to-r from-pink-500 to-orange-400 hover:opacity-90 active:scale-95' 
                : 'bg-slate-300 cursor-not-allowed shadow-none opacity-50'
              }
            `}
          >
            Continue &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteGrid;