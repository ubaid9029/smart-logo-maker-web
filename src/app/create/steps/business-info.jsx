"use client";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateFormData } from "../../../store/slices/logoSlice";

const BusinessInfo = ({ onNext, data, setData }) => {
  const dispatch = useDispatch();
  const isFormValid = data.businessName.trim() !== '';

  const handleInputChange = (field, value) => {
    setData((currentData) => ({ ...currentData, [field]: value }));
  };

  const submitBusinessInfo = useCallback((businessName, slogan) => {
    const normalizedBusinessName = businessName.trim();
    const normalizedSlogan = slogan.trim();

    if (!normalizedBusinessName) {
      return;
    }

    setData((currentData) => ({
      ...currentData,
      businessName: normalizedBusinessName,
      slogan: normalizedSlogan,
    }));

    dispatch(updateFormData({
      name: normalizedBusinessName,
      slogan: normalizedSlogan,
    }));
    onNext();
  }, [dispatch, onNext, setData]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    submitBusinessInfo(
      String(formData.get("businessName") || ""),
      String(formData.get("slogan") || "")
    );
  }, [submitBusinessInfo]);

  return (
    <div className="mx-auto w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 md:px-3">
      <div className="flex flex-col justify-center py-6 md:py-8">
        <div className="mb-3 text-center md:mb-5">
          <h1 className="mb-2 text-2xl font-black leading-tight tracking-tight text-[#1A1A1A] md:text-4xl lg:text-5xl">
            Let&apos;s Get Started
          </h1>
          <p className="mx-auto max-w-xl px-2 text-sm font-medium leading-relaxed text-slate-600 md:text-base lg:text-lg">
            Tell us about your business to create the perfect logo
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="w-full rounded-[1.6rem] border border-white bg-white p-4 shadow-[0_24px_55px_-18px_rgba(0,0,0,0.06)] md:rounded-[2rem] md:p-6 lg:p-7">
            <div className="space-y-3.5 md:space-y-5">
              <div className="w-full">
                <label className="mb-2 block text-sm font-bold text-slate-800 md:mb-2.5 md:ml-1 md:text-base">
                  Business Name <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={data.businessName}
                  onChange={(event) => handleInputChange("businessName", event.target.value)}
                  placeholder="Enter your business name"
                  className="w-full rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 py-2.5 text-base font-medium outline-none transition-all duration-300 focus:border-pink-200 focus:ring-6 focus:ring-pink-500/5 md:px-5 md:py-3 md:text-lg"
                />
              </div>

              <div className="w-full">
                <label className="mb-2 block text-sm font-bold text-slate-800 md:mb-2.5 md:ml-1 md:text-base">
                  Slogan <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="slogan"
                  value={data.slogan}
                  onChange={(event) => handleInputChange("slogan", event.target.value)}
                  placeholder="Enter your slogan (optional)"
                  className="w-full rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 py-2.5 text-base font-medium outline-none transition-all duration-300 focus:border-purple-200 focus:ring-6 focus:ring-purple-500/5 md:px-5 md:py-3 md:text-lg"
                />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-3 flex w-full max-w-xl justify-center pb-[10px] md:mt-5">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`flex w-full items-center justify-center rounded-2xl py-3.5 text-lg font-black transition-all duration-500 md:w-56 md:py-4 md:text-xl ${isFormValid
                  ? "brand-button-primary hover:scale-[1.01] shadow-pink-500/30"
                  : "cursor-not-allowed bg-slate-200 text-slate-400 opacity-90"
                }`}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessInfo;
