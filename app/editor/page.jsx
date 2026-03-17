"use client";
import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Palette, Type, Zap, Save, ShoppingCart, ChevronDown, Loader2, Menu, X } from 'lucide-react';
import { useSelector } from 'react-redux'; // Redux check ke liye

const LogoCanvas = dynamic(() => import('../../components/Editor/Canvas'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-white animate-pulse rounded-3xl" />
});

const gradients = {
  primary: "bg-gradient-to-r from-[#FF6B00] via-[#E02424] to-[#2563EB]",
  text: "bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] via-[#E02424] to-[#2563EB]",
};

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading Editor...</div>}>
      <EditorUI />
    </Suspense>
  );
}

function EditorUI() {
  const searchParams = useSearchParams();

  // --- STEP 5: URL Handover Logic ---
  // Results page se bheja gaya data yahan receive ho raha hai
  const urlImage = searchParams.get('img');
  const urlName = searchParams.get('text');

  // Redux se fallback data (agar URL mein na ho)
  const { formData } = useSelector((state) => state.logo);

  const [logoConfig, setLogoConfig] = useState({
    imageUrl: urlImage || '/photo1.jfif', // Priority to URL
    text: urlName || formData.name || 'BRAND', // URL -> Redux -> Default
    bgColor: '#FFFFFF',
    fontFamily: 'Arial',
    textColor: '#1A1A1A'
  });

  // URL change hone par state update karna (Security/Sync)
  useEffect(() => {
    if (urlImage || urlName) {
      setLogoConfig(prev => ({
        ...prev,
        imageUrl: urlImage || prev.imageUrl,
        text: urlName || prev.text
      }));
    }
  }, [urlImage, urlName]);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fonts = ['Arial', 'Verdana', 'Georgia', 'Courier New', 'Impact', 'serif', 'mono'];
  const colors = [
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'SoftBlue', value: '#E0F2FE' },
    { name: 'Mint', value: '#DCFCE7' },
    { name: 'Peach', value: '#FFEDD5' },
    { name: 'Dark', value: '#1A1A1A' },
  ];

  const variations = [
    { id: 1, label: 'Modern' }, { id: 2, label: 'Clean' },
    { id: 3, label: 'Soft' }, { id: 4, label: 'Minimal' },
  ];

  return (
    <div className="fixed inset-0 bg-[#f4f7fa] flex flex-col lg:flex-row overflow-hidden font-sans">

      {/* SIDEBAR (Variations) */}
      <div className={`fixed inset-0 z-200 lg:hidden transition-all duration-300 ${sidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-80 bg-white shadow-2xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-6 border-b flex justify-between items-center">
            <span className={`font-bold text-500 ${gradients.text}`}>VARIATIONS</span>
            <X onClick={() => setSidebarOpen(false)} className="cursor-pointer text-gray-400" size={24} />
          </div>
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
            {variations.map((v) => (
              <div key={v.id} onClick={() => { setLogoConfig({ ...logoConfig, bgColor: colors[v.id % colors.length].value }); setSidebarOpen(false); }}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:border-orange-400 cursor-pointer">
                <div className="w-full aspect-video rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: logoConfig.bgColor }}>
                  <img src={logoConfig.imageUrl} className="w-12 h-12 object-contain" alt="preview" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase">{v.label}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col shrink-0">
        <div className="p-8 border-b border-gray-50">
          <h2 className={`text-xs font-black uppercase tracking-widest ${gradients.text}`}>Variations</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
          {variations.map((v) => (
            <div key={v.id} onClick={() => setLogoConfig({ ...logoConfig, bgColor: colors[v.id % colors.length].value })} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-orange-400 cursor-pointer transition-all">
              <div className="w-full aspect-video rounded-xl mb-2 flex items-center justify-center" style={{ backgroundColor: logoConfig.bgColor }}>
                <img src={logoConfig.imageUrl} alt="preview" className="w-12 h-12 object-contain" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{v.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative h-full min-w-0">

        {/* TOPBAR */}
        <div className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-center px-4 md:px-8 shrink-0 z-100">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 bg-gray-50 rounded-xl">
              <Menu size={22} className="text-gray-600" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-white text-orange-600 rounded-full font-bold text-sm border border-orange-200">
              <ShoppingCart size={18} /> <span>Style</span>
            </button><button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-white text-orange-600 rounded-full font-bold text-sm border border-orange-200">
              <ShoppingCart size={18} /> <span>Layout</span>
            </button>
            {/* Font Dropdown */}
            <div className="relative">
              <button onClick={() => setActiveDropdown(activeDropdown === 'font' ? null : 'font')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-bold transition-all ${gradients.primary}`}>
                <Type size={14} /> <span>Font</span> <ChevronDown size={12} />
              </button>
              {activeDropdown === 'font' && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-2xl rounded-2xl z-110 border border-gray-100 p-2">
                  {fonts.map(f => (
                    <button key={f} onClick={() => { setLogoConfig({ ...logoConfig, fontFamily: f }); setActiveDropdown(null); }}
                      className="w-full text-left p-2.5 hover:bg-gray-50 rounded-xl text-sm" style={{ fontFamily: f }}>{f}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Color Dropdown */}
            <div className="relative">
              <button onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-bold transition-all ${gradients.primary}`}>
                <Palette size={14} /> <span>Color</span> <ChevronDown size={12} />
              </button>
              {activeDropdown === 'color' && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-2xl rounded-3xl z-110 border border-gray-100 p-4 grid grid-cols-2 gap-2">
                  {colors.map(c => (
                    <button key={c.value} onClick={() => { setLogoConfig({ ...logoConfig, bgColor: c.value }); setActiveDropdown(null); }}
                      className="flex items-center gap-2 p-2 border border-gray-50 rounded-xl hover:bg-gray-50 transition-all">
                      <span className="w-6 h-6 rounded-lg shrink-0 shadow-inner" style={{ backgroundColor: c.value }} />
                      <span className="text-[10px] font-bold text-gray-600">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          </div>
        {/* </div> */}

        {/* CANVAS */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-10 bg-[#f8fafc] overflow-hidden">
          <LogoCanvas config={logoConfig} />
        </div>

        {/* BOTTOM NAV */}
        <div className="h-20 md:h-24 bg-white border-t border-gray-100 flex items-center justify-center gap-4 px-6 shrink-0 z-50">
          <button className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-3.5 rounded-full font-bold text-white text-sm shadow-xl transition-all ${gradients.primary}`}>
            <Save size={18} />
            <span>Preview</span>
          </button>
          <button className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-3.5 rounded-full font-bold text-white text-sm shadow-xl transition-all ${gradients.primary}`}>
            <Save size={18} />
            <span>Save Design</span>
          </button>

          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-orange-600 rounded-full font-bold text-sm border border-orange-200">
            <ShoppingCart size={18} /> <span>Download</span>
          </button>
        </div>
      </main>
    </div>
  );
}

