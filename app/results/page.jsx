"use client";
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Edit3, Bookmark, Loader2, ShoppingCart, X } from 'lucide-react';
import { useSelector } from "react-redux";

const ResultsPage = () => {
  const router = useRouter();
  const [selectedDesign, setSelectedDesign] = useState(null);
  const { formData, results, status } = useSelector((state) => state.logo);

  const logos = useMemo(() => {
    const count = 6;
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: `Design ${index + 1}`,
      src: `/photo${index + 1}.jfif`,
      initials: formData?.name || "BRAND",
      themeColor: '#8b5e3c'
    }));
  }, [formData]);

  // Loading State fix: Brace add kiya
  if (status === 'loading') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-pink-50">
        <Loader2 className="animate-spin text-pink-600 mb-4" size={48} />
        <p className="text-slate-600 font-bold">Fetching your brand designs...</p>
      </div>
    );
  }

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
    <div className="mt-20 min-h-screen bg-pink-50 w-full pb-20 pt-10">
      <div className="max-w-6xl mx-auto p-8 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900">Designs for {formData?.name || "Brand"}</h1>
          <button onClick={() => router.push('/create')} className="flex items-center gap-2 bg-white px-6 py-2.5 rounded-xl border shadow-sm font-bold">
            <ChevronLeft size={20} /> Change Info
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {logos.map((design) => (
            <motion.div key={design.id} className="group bg-white p-4 rounded-[2.5rem] shadow-md relative border border-transparent hover:border-pink-200 transition-all">
              <div className="w-full aspect-square relative rounded-[2rem] overflow-hidden bg-slate-50 mb-4">
                <Image src={design.src} alt={design.name} fill className="object-contain p-4" unoptimized />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <div className="flex gap-2 px-2 w-full justify-center">
                    <button onClick={() => setSelectedDesign(design)} className="bg-white text-sky-500 p-3 rounded-full shadow-md"><Bookmark size={16} /></button>
                    <button onClick={() => handleEditOnCanva(design)} className="bg-white text-emerald-500 p-3 rounded-full shadow-md"><Edit3 size={16} /></button>
                    <button className="bg-orange-500 text-white p-3 rounded-full shadow-md"><ShoppingCart size={16} /></button>
                  </div>
                </div>
              </div>
              <span className="text-slate-500 font-medium block text-center">{design.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PREVIEW MODAL */}
    <AnimatePresence>
  {selectedDesign && (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={() => setSelectedDesign(null)}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white p-6 md:p-8 rounded-[3rem] max-w-lg w-full relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={() => setSelectedDesign(null)} 
          className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 transition-colors rounded-full z-10"
        >
          <X size={24} />
        </button>

        {/* Image Preview Container */}
        <div className="w-full aspect-square relative rounded-[2rem] overflow-hidden bg-slate-50 mb-6 border border-slate-100">
          <Image 
            src={selectedDesign.src} 
            alt="Preview" 
            fill 
            className="object-contain p-6" 
            unoptimized 
          />
        </div>

        {/* Text & Info */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedDesign.name}</h2>
          <p className="text-slate-500 font-medium mt-1">Ready to customize or purchase</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Edit Button - Redirects to Canvas */}
          <button 
            onClick={() => handleEditOnCanva(selectedDesign)}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Edit3 size={18} />
            Edit Design
          </button>

          {/* Buy Button */}
          <button 
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#E02424] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-orange-200"
          >
            <ShoppingCart size={18} />
            Buy Now
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default ResultsPage;