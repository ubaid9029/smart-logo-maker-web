'use client';
import { useDispatch } from 'react-redux';
import { updateFormData } from "../../../store/slices/logoSlice";
import { 
  LayoutGrid, ShoppingBag, Utensils, Heart, Palette, 
  Code, Camera, Music, Coffee, Building, Dumbbell, 
  GraduationCap, Briefcase, ChevronLeft, Check 
} from 'lucide-react';

const industries = [
  { id: 23, name: 'Retail & E-commerce', icon: ShoppingBag, color: 'bg-red-500' },
  { id: 24, name: 'Food & Beverage', icon: Utensils, color: 'bg-pink-500' },
  { id: 25, name: 'Health & Wellness', icon: Heart, color: 'bg-purple-500' },
  { id: 26, name: 'Creative & Design', icon: Palette, color: 'bg-blue-500' },
  { id: 27, name: 'Technology & IT', icon: Code, color: 'bg-sky-500' },
  { id: 28, name: 'Photography & Video', icon: Camera, color: 'bg-teal-500' },
  { id: 29, name: 'Music & Entertainment', icon: Music, color: 'bg-green-500' },
  { id: 30, name: 'Cafe & Coffee Shop', icon: Coffee, color: 'bg-orange-500' },
  { id: 31, name: 'Real Estate', icon: Building, color: 'bg-emerald-500' },
  { id: 32, name: 'Fitness & Sports', icon: Dumbbell, color: 'bg-rose-500' },
  { id: 33, name: 'Education & Training', icon: GraduationCap, color: 'bg-indigo-500' },
  { id: 34, name: 'Consulting & Business', icon: Briefcase, color: 'bg-slate-800' },
];

const Category = ({ onNext, onBack, data, setData }) => {
  const dispatch = useDispatch();

  const handleSelect = (item) => {
    // 1. Local state update (taake UI par selection dikhe)
    setData({ ...data, category: item.name, industry: item.id });
    
    // 2. Redux store update (Global state for API)
    dispatch(updateFormData({ industryId: item.id }));
    
    // Optional: Agar aap chahte hain ke click hote hi next page par jaye, 
    // to niche wali line ko uncomment kar dein:
    // onNext();
  };

  return (
    <div className=" flex flex-col items-center w-full max-w-10xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 px-4">
      
      {/* Back Button */}
      <div className="w-full max-w-4xl flex justify-start mb-6 md:mb-10 mt-6 md:mt-10">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-600 hover:text-black transition-all bg-white px-5 py-2.5 rounded-xl border border-slate-100 shadow-sm font-bold active:scale-95"
        >
          <ChevronLeft size={18} strokeWidth={3} /> Back
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center mb-12 text-center">
        <div className="p-5 rounded-[2rem] bg-white shadow-xl mb-6 border border-white">
          <LayoutGrid size={40} className="text-pink-600" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tight mb-4 leading-tight">
          Choose Your Industry
        </h1>
        <p className="text-slate-500 font-medium px-4">Select the category that best fits your brand</p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8 mb-16 w-full max-w-4xl pt-4 md:pt-10">
        {industries.map((item) => {
          const IconComponent = item.icon; 
          const isSelected = data?.category === item.name;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`relative p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col items-center transition-all duration-500 border-2 ${
                isSelected 
                ? 'bg-white shadow-2xl border-pink-400 scale-105 z-10' 
                : 'bg-white/70 border-transparent hover:border-slate-200 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className={`${item.color} text-white p-4 md:p-6 rounded-2xl mb-4 shadow-lg`}>
                <IconComponent className="w-6 h-6 md:w-9 md:h-9" />
              </div>
              <span className={`text-xs md:text-base font-bold text-center ${isSelected ? 'text-black' : 'text-slate-600'}`}>
                {item.name}
              </span>

              {isSelected && (
                <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-linear-to-r from-pink-500 to-orange-400 p-1.5 md:p-2 rounded-full shadow-lg border-2 md:border-4 border-white animate-in zoom-in duration-300">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6 w-full max-w-2xl mb-10 px-2">
        <button 
          onClick={onBack} 
          className="w-full md:w-1/2 py-4 md:py-5 rounded-2xl md:rounded-3xl font-bold text-slate-400 bg-white shadow-sm border border-slate-100 hover:text-slate-600 transition-all text-lg"
        >
          Go Back
        </button>
        <button 
          onClick={onNext} 
          disabled={!data?.category}
          className={`w-full md:w-1/2 py-5 md:py-6 rounded-2xl md:rounded-3xl text-xl font-black text-white transition-all duration-300 shadow-xl ${
            data?.category 
            ? 'bg-linear-to-r from-[#ff5c01] via-[#ff007a] to-[#c400ff] hover:scale-[1.02] active:scale-95 shadow-pink-500/30' 
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

