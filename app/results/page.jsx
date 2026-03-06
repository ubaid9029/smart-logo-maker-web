"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Edit3, Bookmark, X, Loader2, ShoppingCart } from 'lucide-react';
import { useSelector } from "react-redux";

const ResultsPage = () => {
  const router = useRouter();
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [logos, setLogos] = useState([]);
  
  // Redux state se data lein
  const { formData, results, status } = useSelector((state) => state.logo);

  // 1. Data mapping logic ko useEffect ke bahar rakhein ya use handle karein
  useEffect(() => {
    if (status === 'succeeded' && results && results.length > 0) {
      const formattedLogos = results.map((tpl, index) => ({
        id: tpl.id || index,
        name: `Design ${index + 1}`,
        src: tpl.image_url || '../../image1.jpg',
        initials: formData?.name || "BRAND",
        themeColor: tpl.color || '#8b5e3c'
      }));
      setLogos(formattedLogos);
    }
  }, [status, results, formData]);

  // 2. Loading State: Agar status 'loading' hai, spinner dikhayein
  if (status === 'loading') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-pink-50">
        <Loader2 className="animate-spin text-pink-600 mb-4" size={48} />
        <p className="text-slate-600 font-bold">Fetching your brand designs...</p>
      </div>
    );
  }

  // 3. Fallback: Agar data nahi hai aur loading khatam ho chuki hai
  if (status !== 'loading' && (!results || results.length === 0)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-pink-50">
        <p className="text-lg text-slate-700 font-bold">No designs found or session expired.</p>
        <button 
          onClick={() => router.push('/create')} 
          className="mt-6 bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition-all"
        >
          Back to Create
        </button>
      </div>
    );
  }

  const handleBack = () => router.push('/create');

  const handleEditOnCanva = (design) => {
    const params = new URLSearchParams({
      img: design.src,
      text: design.initials,
      color: design.themeColor,
      name: design.name
    });
    router.push(`/editor?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-pink-50 w-full pb-20 pt-10">
      <div className="max-w-6xl mx-auto p-8 flex flex-col items-center">
        {/* Header Section */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-slate-900">Designs for {formData?.name || "Brand"}</h1>
            <p className="text-slate-600 mt-1">AI has generated these unique styles for your brand</p>
          </div>
          <button onClick={handleBack} className="flex items-center gap-2 bg-white px-6 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all font-bold">
            <ChevronLeft size={20} /> Change Info
          </button>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {logos.map((design) => (
            <motion.div
              key={design.id}
              whileHover={{ y: -8 }}
              className="group bg-white p-4 rounded-[2.5rem] shadow-md relative overflow-hidden flex flex-col items-center border border-transparent hover:border-pink-200 transition-all"
            >
              <div className="w-full aspect-square relative rounded-[2rem] overflow-hidden bg-slate-50 mb-4">
                <Image src={design.src} alt={design.name} fill className="object-contain p-4" unoptimized />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 px-2">
                  <div className="flex flex-row gap-2 w-full justify-center px-2">
                    <button onClick={() => setSelectedDesign(design)} className="flex-1 flex items-center justify-center gap-1 bg-white text-sky-500 py-2.5 rounded-full text-[10px] font-black shadow-md hover:scale-105 transition-transform">
                      <Bookmark size={12} /> Preview
                    </button>
                    <button onClick={() => handleEditOnCanva(design)} className="flex-1 flex items-center justify-center gap-1 bg-white text-emerald-500 py-2.5 rounded-full text-[10px] font-black shadow-md hover:scale-105 transition-transform">
                      <Edit3 size={12} /> Edit
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 bg-orange-500 text-white py-2.5 rounded-full text-[10px] font-black shadow-md hover:scale-105 transition-transform">
                      <ShoppingCart size={12} /> Buy
                    </button>
                  </div>
                </div>
              </div>
              <span className="text-slate-500 font-medium pb-2">{design.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
      {/* AnimatePresence for modal remains same... */}
    </div>
  );
};

export default ResultsPage;