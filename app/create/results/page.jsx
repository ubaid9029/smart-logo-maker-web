"use client";
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion'; // Smooth animation ke liye
import { ChevronLeft, Edit3, Download, Bookmark, X } from 'lucide-react'; // Icons

const logoDesigns = [
  { id: 1, name: 'Design 1', src: '/photo1.jfif' },
  { id: 2, name: 'Design 2', src: '/photo2.jfif' },
  { id: 3, name: 'Design 3', src: '/photo3.jfif' },
  { id: 4, name: 'Design 4', src: '/photo4.jfif' },
  { id: 5, name: 'Design 5', src: '/photo5.jfif' },
  { id: 6, name: 'Design 6', src: '/photo6.jfif' },
];

const ResultsPage = () => {
  const router = useRouter();
  const [selectedDesign, setSelectedDesign] = useState(null);

  const handleBack = () => router.back();

  return (
    <div className="min-h-screen bg-pink-50 w-full pb-20">
      <div className="max-w-6xl mx-auto p-8  -m-5 flex flex-col items-center">
        
        {/* Top Header Section */}
        <div className="w-full flex justify-between items-center mb-12">
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-slate-900">Your Logo Designs</h1>
            <p className="text-slate-600 mt-1">Click on any design to preview, edit, or save</p>
          </div>
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            <ChevronLeft size={20} />
            Back
          </button>
        </div>

        {/* Designs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {logoDesigns.map((design) => (
            <motion.div 
              key={design.id}
              whileHover={{ y: -8 }} // Hover animation
              onClick={() => setSelectedDesign(design)}
              className="bg-white p-4 rounded-[2.5rem] shadow-md hover:shadow-xl cursor-pointer transition-shadow border border-white flex flex-col items-center"
            >
              <div className="w-full aspect-square relative rounded-[2rem] overflow-hidden bg-slate-50 mb-4">
                <Image 
                  src={design.src} 
                  alt={design.name}
                  fill
                  className="object-contain p-4"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors flex items-center justify-center group">
                   <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                     Click to Preview
                   </span>
                </div>
              </div>
              <span className="text-slate-500 font-medium pb-2">{design.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- POPUP MODAL WITH FRAMER MOTION --- */}
      <AnimatePresence>
        {selectedDesign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop Animation */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDesign(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Content Animation */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedDesign(null)}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 px-2">Logo Preview</h2>
                
                {/* Main Preview Image */}
                <div className="bg-slate-50 rounded-[2rem] p-12 flex items-center justify-center border border-slate-100 mb-8">
                  <div className="w-72 h-72 relative">
                    <Image 
                      src={selectedDesign.src} 
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 border-slate-200 hover:bg-slate-50 transition-all">
                    <Edit3 size={18} /> Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 border-slate-200 hover:bg-slate-50 transition-all">
                    <Download size={18} /> Download
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-pink-200 hover:opacity-90 transition-all">
                    <Bookmark size={18} /> Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultsPage;