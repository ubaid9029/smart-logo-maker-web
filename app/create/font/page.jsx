'use client';
import { useState } from 'react';
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
  // FIX: State variable ka naam sahi kiya (selectedFont)
  const [selectedFont, setSelectedFont] = useState(null);

  const handleBack = () => {
    console.log("Navigating back...");
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      {/* 1. Top Left Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 hover:text-slate-900 transition-colors bg-white text-black hover:bg-gray-200 rounded-md px-3 py-3 border-2"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Title Section */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="p-4 rounded-3xl bg-white shadow-inner mb-6">
            <Type size={40} className="text-pink-600" />
          </div>
          <h1 className="text-5xl font-extrabold text-slate-950 mb-3">Choose Your Font Style</h1>
          <p className="text-xl text-slate-600">Select a typography style that matches your brand personality</p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full mb-12">
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
                {/* Font Preview Text */}
                <span className={`text-6xl text-slate-950 ${font.style}`}>
                  AaBbCc
                </span>

                {/* Font Name */}
                <span className="text-lg font-bold text-slate-950 mt-2">
                  {font.name}
                </span>

                {/* Font Description */}
                <span className="text-sm text-slate-600 text-center">
                  {font.description}
                </span>

                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-linear-to-r from-pink-500 to-orange-400 p-1.5 rounded-full shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Action Section */}
        <div className="flex items-center gap-6 max-w-full">
          {/* 2. Back Button near Continue */}
          <button 
            onClick={handleBack}
            className="w-2xl px-12 py-4 rounded-md text-lg font-semibold text-slate-700 bg-white shadow-md hover:bg-slate-100 transition-all"
          >
            Back
          </button>

          {/* Continue Button */}
          <button
            disabled={!selectedFont}
            className={`
              w-2xl px-12 py-4 rounded-md text-lg font-bold text-white
              transition-all duration-300 ease-in-out
              ${selectedFont 
                ? 'bg-linear-to-r from-pink-500 to-orange-400 hover:opacity-90 shadow-lg' 
                : 'bg-slate-300 cursor-not-allowed'
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