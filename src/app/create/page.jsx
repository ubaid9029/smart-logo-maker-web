"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import BusinessInfo from "./steps/bussiness-info";
import Category from "./steps/category";
import Fonts from "./steps/fonts";
import ColorPalette from "./steps/color-palette";
import { resetLogoProcess } from "../../store/slices/logoSlice";

export default function CreateLogoPage() {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const progressPercentage = (step / totalSteps) * 100;

  // Local state for UI feedback
  const [formData, setFormData] = useState({
    businessName: "",
    slogan: "",
    category: "",
    industry: null,
    font: "",
    color: ""
  });

  useEffect(() => {
    dispatch(resetLogoProcess());
  }, [dispatch]);

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        
        {/* PROGRESS BAR SECTION */}
        <div className="fixed top-20 left-0 w-full bg-white/80 backdrop-blur-md z-40 py-4 px-6 border-b border-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-sm font-bold text-slate-700">Step {step} of {totalSteps}</span>
              <span className="text-sm font-bold text-slate-500">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] transition-all duration-700 ease-in-out rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* DYNAMIC STEPS */}
        <div className="mt-8 transition-opacity duration-500">
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
            <ColorPalette 
              onBack={prevStep} 
              data={formData} 
              setData={setFormData} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
