'use client';
import { useState } from 'react';
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

  const handleBack = () => {
    console.log("Navigating back...");
    // router.back(); // Uncomment if using next/router
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6 ">

      
      {/* 1. Top Left Back Button */}
      <button 
        onClick={handleBack}
        className="flex items-center gap-2 hover:text-slate-900 transition-colors  bg-white text-black hover:bg-gray-200 rounded-md px-3 py-3 border-2"
      >
        <ChevronLeft size={20} />
        Back
      </button>
      {/* Main Container */}
      <div className="w-80 max-w-5xl mx-auto flex flex-col items-center ">
        
        {/* Title Section */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="p-4 rounded-3xl bg-white shadow-inner mb-6">
            <LayoutGrid size={40} className="text-pink-600" />
          </div>
          <h1 className="text-5xl font-extrabold text-slate-950 mb-3">Choose Your Industry</h1>
          <p className="text-xl text-slate-600">Select the category that best describes your business</p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mb-12">
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
                {/* Icon Wrapper */}
                <div className={`${industry.color} text-white p-4 rounded-2xl`}>
                  <Icon size={28} />
                </div>
                
                {/* Text */}
                <span className="text-sm font-semibold text-slate-800 text-center">
                  {industry.name}
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
            disabled={!selectedIndustry}
            className={`
              w-2xl px-12 py-4 rounded-md text-lg font-bold text-white
              transition-all duration-300 ease-in-out
              ${selectedIndustry 
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
}

export default IndustrySelection;