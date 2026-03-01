'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { LayoutGrid, ShoppingBag, Utensils, Heart, Palette, Code, Camera, Music, Coffee, Building, Dumbbell, GraduationCap, Briefcase, ChevronLeft } from 'lucide-react';

const industries = [
  { name: 'Retail & E-commerce', icon: ShoppingBag, color: 'bg-red-500' },
  { name: 'Food & Beverage', icon: Utensils, color: 'bg-pink-500' },
  { name: 'Health & Wellness', icon: Heart, color: 'bg-purple-500' },
  { name: 'Creative & Design', icon: Palette, color: 'bg-blue-500' },
  { name: 'Technology & IT', icon: Code, color: 'bg-sky-500' },
  { name: 'Photography & Video', icon: Camera, color: 'bg-teal-500' },
  { name: 'Music & Entertainment', icon: Music, color: 'bg-green-500' },
  { name: 'Cafe & Coffee Shop', icon: Coffee, color: 'bg-orange-500' },
  { name: 'Real Estate', icon: Building, color: 'bg-emerald-500' },
  { name: 'Fitness & Sports', icon: Dumbbell, color: 'bg-rose-500' },
  { name: 'Education & Training', icon: GraduationCap, color: 'bg-indigo-500' },
  { name: 'Consulting & Business', icon: Briefcase, color: 'bg-slate-800' },
];

const IndustrySelection = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const router = useRouter();

  // FIX 1: handleBack logic
  const handleBack = () => {
    router.back();
  };

  // FIX 2: handleContinue function define kiya
  const handleContinue = () => {
    if (selectedIndustry) {
      router.push('/create/font'); // Agle step ka route
    }
  };

  return (
    <div className='bg-pink-50 min-h-screen w-full'>
      <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
        
        {/* Top Left Back Button */}
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
            <LayoutGrid size={40} className="text-pink-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 mb-3">Choose Your Industry</h1>
          <p className="text-lg text-slate-600">Select the category that best describes your business</p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 w-full">
          {industries.map((industry) => {
            const isSelected = selectedIndustry === industry.name;
            const Icon = industry.icon;
            
            return (
              <button
                key={industry.name}
                onClick={() => setSelectedIndustry(industry.name)}
                className={`
                  relative p-6 rounded-3xl flex flex-col items-center justify-center gap-4
                  transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-lg
                  ${isSelected 
                    ? 'bg-white shadow-xl ring-2 ring-orange-400' 
                    : 'bg-white shadow-md border-2 border-transparent'
                  }
                `}
              >
                <div className={`${industry.color} text-white p-4 rounded-2xl`}>
                  <Icon size={28} />
                </div>
                
                <span className="text-sm font-semibold text-slate-800 text-center leading-tight">
                  {industry.name}
                </span>

                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-orange-400 p-1.5 rounded-full shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Action Section */}
        {/* FIX 3: Buttons width aur alignment center kiya */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-2xl">
          <button 
            onClick={handleBack}
            className="w-full md:w-1/2 py-4 rounded-xl text-lg font-semibold text-slate-700 bg-white shadow-md hover:bg-slate-100 transition-all border border-gray-100"
          >
            Back
          </button>

          <button
            onClick={handleContinue}
            // FIX 4: Disabled state selectedIndustry par depend karni chahiye
            disabled={!selectedIndustry}
            className={`
              w-full md:w-1/2 py-4 rounded-xl text-lg font-bold text-white
              transition-all duration-300 ease-in-out shadow-lg
              ${selectedIndustry 
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
}

export default IndustrySelection;