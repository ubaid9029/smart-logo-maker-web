'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { Type, ChevronLeft } from 'lucide-react';

const fontStyles = [
  { name: 'Modern Sans', description: 'Clean and contemporary', style: 'font-sans' },
  { name: 'Elegant Serif', description: 'Sophisticated and timeless', style: 'font-serif' },
  { name: 'Bold Display', description: 'Strong and impactful', style: 'font-extrabold tracking-tighter' },
  { name: 'Playful Rounded', description: 'Friendly and approachable', style: 'font-mono' },
  { name: 'Minimal Light', description: 'Subtle and refined', style: 'font-light' },
  { name: 'Classic Script', description: 'Elegant and decorative', style: 'font-serif italic' },
];

const FontSelection = () => {
  const [selectedFont, setSelectedFont] = useState(null);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  // FIX 1: handleContinue function add kiya
  const handleContinue = () => {
    if (selectedFont) {
      router.push('/create/color-palette'); // Agla step
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 w-full">
      <div className="max-w-5xl mx-auto p-6 flex flex-col items-center">
        
        {/* Top Left Back Button Section */}
        <div className="w-full flex justify-start mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 hover:text-slate-900 transition-colors bg-white text-black hover:bg-gray-200 rounded-md px-4 py-2 border-2"
          >
            <ChevronLeft size={20} />
            Back
          </button>
        </div>

        {/* Title Section */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="p-4 rounded-3xl bg-white shadow-inner mb-6">
            <Type size={40} className="text-pink-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 mb-3 tracking-tight">
            Choose Your Font Style
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            Select a typography style that matches your brand personality
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full mb-12">
          {fontStyles.map((font) => {
            const isSelected = selectedFont === font.name;

            return (
              <button
                key={font.name}
                onClick={() => setSelectedFont(font.name)}
                className={`
                  relative p-10 rounded-3xl flex flex-col items-center justify-center gap-4
                  transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-lg
                  ${isSelected
                    ? 'bg-white shadow-xl ring-2 ring-orange-400'
                    : 'bg-white shadow-md border-2 border-transparent'
                  }
                `}
              >
                <span className={`text-5xl md:text-6xl text-slate-950 ${font.style}`}>
                  AaBbCc
                </span>

                <span className="text-lg font-bold text-slate-950 mt-2">
                  {font.name}
                </span>

                <span className="text-sm text-slate-600 text-center">
                  {font.description}
                </span>

                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-orange-400 p-1.5 rounded-full shadow-lg">
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
            Back
          </button>

          <button
            onClick={handleContinue}
            // FIX 2: selectedPalette ko selectedFont se replace kiya
            disabled={!selectedFont}
            className={`
              w-full md:w-1/2 py-4 rounded-xl text-lg font-bold text-white
              transition-all duration-300 ease-in-out shadow-lg
              ${selectedFont 
                ? 'bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90 active:scale-95' 
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

export default FontSelection;