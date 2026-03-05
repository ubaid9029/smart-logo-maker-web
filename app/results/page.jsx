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
  const [loadingState, setLoadingState] = useState(true);

  const { formData, results, loading } = useSelector((state) => state.logo);

  useEffect(() => {
    if (results && results.length > 0) {
      // Mapping API results to UI format
      const formattedLogos = results.map((tpl, index) => ({
        id: tpl.id || index,
        name: `Design ${index + 1}`,
        src: tpl.image_url || '../../image1.jpg',
        initials: formData.name || "BRAND",
        themeColor: tpl.color || '#8b5e3c'
      }));
      setLogos(formattedLogos);
      setLoadingState(false);
    } else if (!loading) {
      // Fallback: Agar results empty hain to wapis bhejien ya re-fetch karein
      router.push('/create');
    }
  }, [results, formData, loading, router]);

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

  if (loadingState || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-pink-50">
        <Loader2 className="animate-spin text-pink-600 mb-4" size={48} />
        <p className="text-slate-600 font-bold">Fetching your brand designs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 w-full pb-20 pt-10">
      <div className="max-w-6xl mx-auto p-8 flex flex-col items-center">

        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-slate-900">Designs for {formData.name}</h1>
            <p className="text-slate-600 mt-1">AI has generated these unique styles for your brand</p>
          </div>
          <button onClick={handleBack} className="flex items-center gap-2 bg-white px-6 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all font-bold">
            <ChevronLeft size={20} /> Change Info
          </button>
        </div>

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

      <AnimatePresence>
        {selectedDesign && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDesign(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative z-10 p-8">
              <button onClick={() => setSelectedDesign(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Logo Preview</h2>
              <div className="bg-slate-50 rounded-[2rem] p-12 flex items-center justify-center mb-8 border border-dashed border-slate-200 h-64">
                <Image src={selectedDesign.src} alt="Preview" width={250} height={250} className="object-contain" unoptimized />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => handleEditOnCanva(selectedDesign)} className="flex-1 py-4 rounded-2xl font-bold bg-pink-600 text-white flex items-center justify-center gap-2 hover:bg-pink-700">
                  <Edit3 size={20} /> Edit Design
                </button>
                <button className="flex-1 py-4 rounded-2xl font-bold bg-orange-500 text-white flex items-center justify-center gap-2 hover:bg-orange-600">
                  <ShoppingCart size={20} /> Buy Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultsPage;

// "use client";
// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ChevronLeft, Edit3, Bookmark, X, Loader2, ShoppingCart } from 'lucide-react';
// // import { useSelector } from "react-redux";
// // import { RootState } from "@/store/store";

// const ResultsPage = () => {
//   const router = useRouter();
//   const [selectedDesign, setSelectedDesign] = useState(null);
//   const [logos, setLogos] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchLogos = async () => {
//       try {
//         const response = await fetch('https://www.logoai.com/api/getAllInfo', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             name: "ARHAM",
//             industry: 23,
//             color: "1",
//             font: "1",
//             p: 2,
//             dataPage: 0,
//             select: "55540,55014,54795,54792,54558,54559,54553"
//           }),
//         });

//         const result = await response.json();

//         if (result && result.templates) {
//           const formattedLogos = result.templates.slice(0, 6).map((tpl, index) => ({
//             id: tpl.id || index,
//             name: `Design ${index + 1}`,
//             src: tpl.image_url || '/image1.jpg',
//             initials: "ARHAM",
//             themeColor: tpl.color || '#8b5e3c'
//           }));
//           setLogos(formattedLogos);
//         } else {
//           setLogos([
//             { id: 1, name: 'Design 1', src: '/photo6.jfif', initials: 'ARHAM', themeColor: '#8b5e3c' },
//             { id: 2, name: 'Design 2', src: '/photo1.jfif', initials: 'ARHAM', themeColor: '#00a884' },
//             { id: 4, name: 'Design 4', src: '/photo3.jfif', initials: 'ARHAM', themeColor: '#2c3e50' },
//             { id: 3, name: 'Design 3', src: '/photo2.jfif', initials: 'ARHAM', themeColor: '#d91e18' },
//             { id: 6, name: 'Design 6', src: '/photo5.jfif', initials: 'ARHAM', themeColor: '#8e44ad' },
//             { id: 5, name: 'Design 5', src: '/photo4.jfif', initials: 'ARHAM', themeColor: '#f39c12' },
//           ]);
//         }
//       } catch (error) {
//         console.error("API Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLogos();
//   }, []);

//   const handleBack = () => router.back();

//   const handleEditOnCanva = (design) => {
//     const params = new URLSearchParams({
//       img: design.src,
//       text: design.initials,
//       color: design.themeColor,
//       name: design.name
//     });
//     router.push(`/editor?${params.toString()}`);
//   };

//   if (loading) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center bg-pink-50">
//         <Loader2 className="animate-spin text-pink-600 mb-4" size={48} />
//         <p className="text-slate-600 font-bold">Generating your brand designs...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-pink-50 w-full pb-20 pt-10">
//       <div className="max-w-6xl mx-auto p-8 flex flex-col items-center">

//         <div className="w-full flex justify-between items-center mb-12">
//           <div className="flex flex-col">
//             <h1 className="text-4xl font-extrabold text-slate-900">Your Logo Designs</h1>
//             <p className="text-slate-600 mt-1">Premium logo styles for your brand</p>
//           </div>
//           <button onClick={handleBack} className="flex items-center gap-2 bg-white px-6 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
//             <ChevronLeft size={20} /> Back
//           </button>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
//           {logos.map((design) => (
//             <motion.div
//               key={design.id}
//               whileHover={{ y: -8 }}
//               className="group bg-white p-4 rounded-[2.5rem] shadow-md relative overflow-hidden flex flex-col items-center border border-transparent hover:border-pink-200 transition-all"
//             >
//               <div className="w-full aspect-square relative rounded-[2rem] overflow-hidden bg-slate-50 mb-4">
//                 <Image src={design.src} alt={design.name} fill className="object-contain p-4" unoptimized />

//                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 px-2">
//                   <div className="flex flex-row gap-2 w-full justify-center px-2">
//                     <button
//                       onClick={() => setSelectedDesign(design)}
//                       className="flex-1 flex items-center justify-center gap-1 bg-white text-sky-500 py-2.5 rounded-full text-[10px] font-black shadow-md"
//                     >
//                       <Bookmark size={12} /> Preview
//                     </button>

//                     <button
//                       onClick={() => handleEditOnCanva(design)}
//                       className="flex-1 flex items-center justify-center gap-1 bg-white text-emerald-500 py-2.5 rounded-full text-[10px] font-black shadow-md"
//                     >
//                       <Edit3 size={12} /> Edit
//                     </button>

//                     <button
//                       className="flex-1 flex items-center justify-center gap-1 bg-orange-500 text-white py-2.5 rounded-full text-[10px] font-black shadow-md"
//                     >
//                       <ShoppingCart size={12} /> Buy
//                     </button>
//                   </div>
//                 </div>
//               </div>
//               <span className="text-slate-500 font-medium pb-2">{design.name}</span>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       <AnimatePresence>
//         {selectedDesign && (
//           <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setSelectedDesign(null)}
//               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
//             />
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl relative z-10 p-8"
//             >
//               <button onClick={() => setSelectedDesign(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full">
//                 <X size={20} />
//               </button>
//               <h2 className="text-2xl font-bold mb-6 text-slate-800">Logo Preview</h2>
//               <div className="bg-slate-50 rounded-[2rem] p-12 flex items-center justify-center mb-8 border border-dashed border-slate-200">
//                 <Image src={selectedDesign.src} alt="Preview" width={300} height={300} className="object-contain" unoptimized />
//               </div>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <button onClick={() => handleEditOnCanva(selectedDesign)} className="flex-1 py-4 rounded-2xl font-bold bg-pink-600 text-white">
//                   <Edit3 size={20} /> Edit Design
//                 </button>
//                 <button className="flex-1 py-4 rounded-2xl font-bold bg-orange-500 text-white">
//                   <ShoppingCart size={20} /> Buy Now
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default ResultsPage;