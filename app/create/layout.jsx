"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Progress } from "@/components/ui/progress";

export default function CreateLayout({ children }) {
  const pathname = usePathname();
  const [animatedValue, setAnimatedValue] = useState(0);

  const steps = {
    "/create/bussiness-info": { step: 1, percentage: 25 },
    "/create/category": { step: 2, percentage: 50 },
    "/create/fonts": { step: 3, percentage: 75 },
    "/create/color-palette": { step: 4, percentage: 100 },
  };

  const currentStepData = steps[pathname] || { step: 0, percentage: 0 };
  const { step, percentage } = currentStepData;

  useEffect(() => {
    setAnimatedValue(0);
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="min-h-screen bg-white">
      {/* --- FIXED HEADER START --- */}
      <header className="sticky top-0 z-50 w-full bg-white backdrop-blur-md">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 border-b border-gray-100">
            <div className="relative w-20 h-20">
              <Image
                src="/logo3.svg"
                alt="Smart Logo Maker"
                fill
                className="object-contain"
                priority
              />
            </div>   
        </nav>

        {/* Progress Bar*/}
        {step > 0 && (
          <div className="max-w-xl mx-auto py-4 px-4">
            <div className="flex justify-between items-center text-sm mb-2 text-gray-600 font-medium">
              <span>Step {step} of 4</span>
              <span>{percentage}%</span>
            </div>
            <Progress 
              value={animatedValue} 
              className="h-2 bg-gray-100 transition-all duration-1000 ease-out [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:via-pink-500 [&>div]:to-purple-600 [&>div]:transition-all [&>div]:duration-1000" 
            />
          </div>
        )}
      </header>

      <main className="mt-4">
        {children}
      </main>
    </div>
  );
}