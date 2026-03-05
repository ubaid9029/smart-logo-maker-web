'use client';
import { LayoutGrid, ShoppingBag, Utensils, Heart, Palette, Code, Camera, Music, Coffee, Building, Dumbbell, GraduationCap, Briefcase, ChevronLeft, Check } from 'lucide-react';

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

const Category = ({ onNext, onBack, data, setData }) => {
  return (
    // Max-width ko 6xl kar diya taake width barh jaye
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <div className="w-4xl flex justify-start mb-10 mt-10">
        <button onClick={onBack} className=" flex items-center gap-2 text-slate-600 hover:text-black transition-all bg-white px-5 py-2.5 rounded-xl border border-slate-100 shadow-sm font-bold active:scale-95">
          <ChevronLeft size={18} strokeWidth={3} /> Back
        </button>
      </div>

      <div className="flex flex-col items-center mb-12 text-center">
        <div className="p-5 rounded-[2rem] bg-white shadow-xl mb-6 border border-white">
          <LayoutGrid size={40} className="text-pink-600" />
        </div>
        <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tight mb-4">Choose Your Industry</h1>
        <p className="text-slate-500 font-medium">Select the category that best fits your brand</p>
      </div>

      {/* Grid container ki width barhai gayi hai */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16 w-5xl pt-10 px-4">
        {industries.map((item) => {
          const IconComponent = item.icon; 
          const isSelected = data.category === item.name;

          return (
            <button
              key={item.name}
              onClick={() => setData({ ...data, category: item.name })}
              // Padding p-10 kar di width barhane ke liye
              className={`relative p-10 rounded-[2.5rem] flex flex-col items-center transition-all duration-500 border-2 ${
                isSelected 
                ? 'bg-white shadow-2xl border-pink-400 scale-105 z-10' 
                : 'bg-white/70 border-transparent hover:border-slate-200 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className={`${item.color} text-white p-6 rounded-2xl mb-4 shadow-lg`}>
                <IconComponent size={36} />
              </div>
              <span className={`text-base font-bold text-center ${isSelected ? 'text-black' : 'text-slate-600'}`}>
                {item.name}
              </span>

              {/* Tick Mark Logic */}
              {isSelected && (
                <div className="absolute -top-3 -right-3 bg-linear-to-r from-pink-500 to-orange-400 p-2 rounded-full shadow-lg border-4 border-white animate-in zoom-in duration-300">
                  <Check size={20} className="text-white" strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-200 mb-10">
        <button onClick={onBack} className="w-2xl md:w-1/2 py-5 rounded-3xl font-bold text-slate-400 bg-white shadow-sm border border-slate-100 hover:text-slate-600 transition-all">
          Go Back
        </button>
        <button 
          onClick={onNext} 
          disabled={!data.category}
          className={`w-2xl md:w-1/2 py-6 rounded-[2rem] text-xl font-black text-white transition-all duration-300 shadow-xl ${
            data.category 
            ? 'bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] hover:scale-[1.02] active:scale-95' 
            : 'bg-slate-200 cursor-not-allowed opacity-60'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Category;