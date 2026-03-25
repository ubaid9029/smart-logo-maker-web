"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

import BusinessInfo from "./steps/bussiness-info";
import Category from "./steps/category";
import Fonts from "./steps/fonts";
import ColorPalette from "./steps/color-palette";
import { resetLogoProcess } from "../../store/slices/logoSlice";

const EMPTY_FORM_DATA = {
  businessName: "",
  slogan: "",
  category: "",
  industry: null,
  font: "",
  color: "",
};

const INDUSTRY_NAMES = {
  23: 'Retail & E-commerce',
  24: 'Food & Beverage',
  25: 'Health & Wellness',
  26: 'Creative & Design',
  27: 'Technology & IT',
  28: 'Photography & Video',
  29: 'Music & Entertainment',
  30: 'Cafe & Coffee Shop',
  31: 'Real Estate',
  32: 'Fitness & Sports',
  33: 'Education & Training',
  34: 'Consulting & Business',
};

const FONT_NAMES = {
  "1": 'Modern Sans',
  "2": 'Elegant Serif',
  "3": 'Bold Display',
  "4": 'Playful Rounded',
  "5": 'Minimal Light',
  "6": 'Classic Script',
};

const COLOR_NAMES = {
  "1": 'Vibrant Energy',
  "2": 'Professional Blue',
  "3": 'Warm Sunset',
  "4": 'Cool Ocean',
  "5": 'Natural Green',
  "6": 'Elegant Gold',
};

const buildInitialCreateData = (source) => ({
  businessName: source?.name || "",
  slogan: source?.slogan || "",
  category: INDUSTRY_NAMES[Number(source?.industryId)] || "",
  industry: source?.industryId ?? null,
  font: FONT_NAMES[String(source?.fontId || "")] || "",
  color: COLOR_NAMES[String(source?.colorId || "")] || "",
});

export default function CreateLogoPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { formData: savedFormData } = useSelector((state) => state.logo);
  const shouldPreserveInputs = searchParams.get('preserve') === '1';
  const initialCreateData = shouldPreserveInputs ? buildInitialCreateData(savedFormData) : EMPTY_FORM_DATA;
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const progressPercentage = (step / totalSteps) * 100;

  const [formData, setFormData] = useState(initialCreateData);

  useEffect(() => {
    if (!shouldPreserveInputs) {
      dispatch(resetLogoProcess());
    }
  }, [dispatch, shouldPreserveInputs]);

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-white">
      <div className="fixed left-0 top-16 z-40 w-full border-b border-gray-50 bg-white/80 px-3 py-2.5 backdrop-blur-md md:top-20 md:px-6 md:py-3.5">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-sm font-bold text-slate-700">Step {step} of {totalSteps}</span>
            <span className="text-sm font-bold text-slate-500">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] transition-all duration-700 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-full max-w-5xl flex-col px-3 pb-[10px] pt-[6.6rem] md:px-5 md:pt-[8.1rem]">
        <div className="mt-1 flex-1 min-h-0 overflow-hidden transition-opacity duration-500 md:mt-2">
          {step === 1 && (
            <BusinessInfo onNext={nextStep} data={formData} setData={setFormData} />
          )}

          {step === 2 && (
            <Category onNext={nextStep} onBack={prevStep} data={formData} setData={setFormData} />
          )}

          {step === 3 && (
            <Fonts onNext={nextStep} onBack={prevStep} data={formData} setData={setFormData} />
          )}

          {step === 4 && (
            <ColorPalette onBack={prevStep} data={formData} setData={setFormData} />
          )}
        </div>
      </div>
    </div>
  );
}
