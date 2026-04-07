'use client';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateFormData } from "../../../store/slices/logoSlice";
import {
  ShoppingBag, Utensils, Heart, Palette,
  Code, Camera, Music, Coffee, Building, Dumbbell,
  GraduationCap, Briefcase, Check
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
    setData({ ...data, category: item.name, industry: item.id });
  };

  const handleContinue = useCallback(() => {
    if (!data?.category || !data?.industry) {
      return;
    }

    dispatch(updateFormData({ industryId: data.industry }));
    onNext();
  }, [data, dispatch, onNext]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && data?.category) {
        event.preventDefault();
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data?.category, handleContinue]);

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 px-2 md:px-3">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex flex-col items-center text-center md:mb-4">
          <h1 className="mb-2 text-2xl font-black leading-tight tracking-tight text-[#1A1A1A] md:text-4xl">
            Choose Your Industry
          </h1>
          <p className="px-4 text-xs font-medium text-slate-500 md:text-sm">Select the category that best fits your brand</p>
        </div>

        <div className="mx-auto grid w-full max-w-[760px] flex-1 grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-4 md:gap-2.5">
          {industries.map((item) => {
            const IconComponent = item.icon;
            const isSelected = data?.category === item.name;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`relative flex min-h-[72px] flex-col items-center justify-center rounded-[0.95rem] border-2 p-1.5 transition-all duration-500 sm:min-h-[78px] md:min-h-[96px] md:rounded-[1.15rem] md:p-2.5 ${
                  isSelected
                    ? 'z-10 scale-105 border-pink-400 bg-white shadow-2xl'
                    : 'border-transparent bg-white/70 hover:border-slate-200 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className={`${item.color} mb-1 rounded-lg p-1.5 text-white shadow-lg md:mb-2 md:p-2`}>
                  <IconComponent className="h-3 w-3 md:h-4.5 md:w-4.5" />
                </div>
                <span className={`text-center text-[7px] font-bold leading-snug sm:text-[7.5px] md:text-[10px] ${isSelected ? 'text-black' : 'text-slate-600'}`}>
                  {item.name}
                </span>

                {isSelected && (
                  <div className="absolute -right-2 -top-2 rounded-full border-2 border-white bg-linear-to-r from-pink-500 to-orange-400 p-1.5 shadow-lg md:-right-3 md:-top-3 md:border-4 md:p-2">
                    <Check className="h-4 w-4 text-white md:h-5 md:w-5" strokeWidth={4} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-2 flex w-full max-w-xl flex-col-reverse items-center justify-center gap-2 px-2 pb-[10px] pt-2 md:mt-4 md:flex-row md:justify-center md:gap-3">
          <button
            onClick={onBack}
            className="brand-button-outline w-full rounded-2xl py-3 text-sm md:w-48"
          >
            Go Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!data?.category}
            className={`w-full rounded-2xl py-3 text-base font-black transition-all duration-300 md:w-48 ${
              data?.category
                ? 'brand-button-primary hover:scale-[1.02] shadow-pink-500/30'
                : 'cursor-not-allowed bg-slate-200 opacity-60'
            }`}
          >
            Continue -&gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Category;
