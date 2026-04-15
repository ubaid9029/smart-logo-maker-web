"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";

import BusinessInfo from "./steps/business-info";
import Category from "./steps/category";
import Fonts from "./steps/fonts";
import ColorPalette from "./steps/color-palette";
import { resetLogoProcess, setCreateStep } from "../../store/slices/logoSlice";
import { clearGeneratedResultsSnapshot } from "../../lib/generatedResultsStorage";
import { deriveCreateResumeStep, hasCreateDraft } from "../../lib/logoResumeStorage";

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

function CreateFlowContent({
  initialFormData,
  initialStep,
  progressPercentage,
  hasSavedDraft,
  onStartOver,
  onStepPersist,
  showMissingResultsNotice,
}) {
  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState(initialFormData);
  const totalSteps = 4;

  useEffect(() => {
    onStepPersist(step);
  }, [onStepPersist, step]);

  const nextStep = () => {
    if (step < totalSteps) {
      setStep((currentStep) => currentStep + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((currentStep) => currentStep - 1);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-white to-[#fff8fb]">
      {/* Progress bar — fixed at top */}
      <div className="flex-shrink-0 z-40 w-full border-b border-gray-100 bg-white/92 px-3 py-2.5 backdrop-blur-md md:px-6 md:py-3.5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-sm md:text-base font-bold text-slate-700">Step {step} of {totalSteps}</span>
            <div className="flex items-center gap-3">
              {hasSavedDraft && (
                <button
                  onClick={onStartOver}
                  className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-700"
                >
                  Start Over
                </button>
              )}
              <span className="text-sm font-bold text-slate-500">{Math.round(progressPercentage(step, totalSteps))}%</span>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] transition-all duration-700 ease-in-out"
              style={{ width: `${progressPercentage(step, totalSteps)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content — fills remaining height, each step controls its own scroll */}
      <div className="flex flex-1 flex-col overflow-visible mx-auto w-full max-w-6xl px-3 md:px-5">
        {showMissingResultsNotice && (
          <div className="mb-3 mt-2 flex-shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-700 shadow-sm">
            Previous results were no longer available, so we returned you to Create.
          </div>
        )}
        <div className="flex flex-1 flex-col overflow-visible transition-opacity duration-500">
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

export default function CreateLogoPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData: savedFormData, createStep: savedCreateStep } = useSelector((state) => state.logo);
  const shouldResetDraft = searchParams.get('fresh') === '1';
  const showMissingResultsNotice = searchParams.get('notice') === 'missing-results';
  const hasExplicitResumeStep = searchParams.has('step');
  const requestedResumeStep = Math.max(1, Math.min(4, Number(searchParams.get('step')) || 0));
  const routeResumeToken = searchParams.toString();
  const hasSavedDraft = hasCreateDraft(savedFormData);
  const appliedResumeTokenRef = useRef('');
  const getProgressPercentage = (currentStep, totalSteps = 4) => (currentStep / totalSteps) * 100;
  const initialCreateState = useMemo(() => {
    if (!hasSavedDraft) {
      return {
        formData: EMPTY_FORM_DATA,
        step: hasExplicitResumeStep ? requestedResumeStep : 1,
      };
    }

    return {
      formData: buildInitialCreateData(savedFormData),
      step: hasExplicitResumeStep ? requestedResumeStep : deriveCreateResumeStep(savedFormData, savedCreateStep),
    };
  }, [hasExplicitResumeStep, hasSavedDraft, requestedResumeStep, savedCreateStep, savedFormData]);

  useEffect(() => {
    if (!shouldResetDraft) {
      return;
    }

    appliedResumeTokenRef.current = '';
    clearGeneratedResultsSnapshot();
    dispatch(resetLogoProcess());
    router.replace('/create');
  }, [dispatch, router, shouldResetDraft]);

  if (shouldResetDraft) {
    return null;
  }

  const flowKey = routeResumeToken || 'create-flow';

  return (
    <CreateFlowContent
      key={flowKey}
      initialFormData={initialCreateState.formData}
      initialStep={initialCreateState.step}
      progressPercentage={getProgressPercentage}
      hasSavedDraft={hasSavedDraft}
      onStartOver={() => router.push('/create?fresh=1')}
      onStepPersist={(nextStep) => dispatch(setCreateStep(nextStep))}
      showMissingResultsNotice={showMissingResultsNotice}
    />
  );
}
