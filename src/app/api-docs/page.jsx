'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Database,
  Globe,
  Code2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import Navbar from '@/components/MainComponents/Navbar';

export default function ApiDocsPage() {
  const [activeLang, setActiveLang] = useState('js');
  const [copied, setCopied] = useState(false);

  const baseUrl = 'https://www.smart-logomaker.com/api';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeSnippet = (lang) => {
    if (lang === 'js') {
      return `// Create a professional logo with all parameters
const response = await fetch('${baseUrl}/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'Smart Brand',      // Required: Business Name
    slogan: 'Innovate More',  // Optional: Tagline
    industryId: 23,           // Optional: Category ID (from /industries)
    colorId: '4',             // Optional: Mood palette (1-6)
    fontId: 105               // Optional: Specific font style ID
  })
});

const data = await response.json();
console.log(data.templates); // Returns logo variations`;
    }
    if (lang === 'python') {
      return `import requests

url = "${baseUrl}/generate"
headers = {
    "X-API-KEY": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "name": "Smart Brand",
    "slogan": "Innovate More",
    "industryId": 23,
    "colorId": "4",
    "fontId": 105
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    }
    return `curl -X POST ${baseUrl}/generate \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Smart Brand",
    "slogan": "Innovate More",
    "industryId": 23,
    "colorId": "4",
    "fontId": 105
  }'`;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-plusJakarta">
      <Navbar minimal />
      
      <div className="max-w-[1280px] mx-auto px-6 pt-32 pb-20 lg:flex gap-12">
        {/* Sticky Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-32 space-y-6">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Getting Started</h3>
              <nav className="space-y-1">
                <a href="#intro" className="block px-3 py-2 text-sm font-bold hover:text-white rounded-xl hover:bg-slate-800 transition-all">Overview</a>
                <a href="#auth" className="block px-3 py-2 text-sm font-bold hover:text-white rounded-xl hover:bg-slate-800 transition-all">Authentication</a>
              </nav>
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Reference</h3>
              <nav className="space-y-1">
                <a href="#generate" className="block px-3 py-2 text-sm font-bold hover:text-white rounded-xl hover:bg-slate-800 transition-all">Create Logo</a>
                <a href="#industries" className="block px-3 py-2 text-sm font-bold hover:text-white rounded-xl hover:bg-slate-800 transition-all">Industries</a>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-20 min-w-0">
          
          <header id="intro">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">API Documentation</h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-8">
              Integrate logo generation into your workflow. Use our production-ready endpoints to build branding tools at scale.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/dashboard" 
                className="inline-block bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-8 py-3.5 rounded-full text-white font-black text-[15px] shadow-[0_8px_25px_rgba(255,0,122,0.3)] hover:scale-105 transition-all duration-300"
              >
                Open Developer Dashboard
              </Link>
            </div>
          </header>

          <section className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-3xl">
             <div className="flex items-center gap-3 text-orange-400 mb-4 font-bold text-sm">
                <Globe className="w-4 h-4" /> Global Base URL
             </div>
             <code className="text-xl font-black text-white break-all">{baseUrl}</code>
          </section>

          <section id="auth" className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> Authentication
            </h2>
            <p className="text-slate-400 leading-relaxed">
               Requests must include your API key in the <code className="text-orange-400 bg-orange-500/5 px-2 py-0.5 rounded font-mono">X-API-KEY</code> header. Keep your keys secret.
            </p>
            <div className="bg-[#020617] p-6 rounded-2xl border border-slate-800">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Required Header</span>
               <code className="text-orange-400 text-sm">X-API-KEY: sk_live_xxxxxxxxxxxx</code>
            </div>
          </section>

          <section id="generate" className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-white">Create Logo (POST /generate)</h2>
              <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-[10px] font-black tracking-widest uppercase">Endpoint</span>
            </div>
            
            <div className="space-y-4">
               <h4 className="text-white font-bold">Request Body Parameters</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'name', type: 'string', desc: 'Required. Business name to appear in the logo.' },
                    { name: 'slogan', type: 'string', desc: 'Optional. Tagline or sub-text for the brand.' },
                    { name: 'industryId', type: 'number', desc: 'Optional. Industry niche ID (see /industries).' },
                    { name: 'colorId', type: 'string', desc: 'Optional. Color palette ID (1-6).' },
                    { name: 'fontId', type: 'number', desc: 'Optional. Specific font style ID to enforce.' },
                  ].map((p) => (
                    <div key={p.name} className="p-4 bg-slate-800/20 border border-slate-800 rounded-2xl">
                       <div className="flex items-center justify-between mb-1">
                          <code className="text-orange-400 font-bold">{p.name}</code>
                          <span className="text-[10px] text-slate-600 font-mono italic">{p.type}</span>
                       </div>
                       <p className="text-xs text-slate-500">{p.desc}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-[#020617] rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
               <div className="px-8 py-4 bg-slate-900 flex gap-6 border-b border-slate-800">
                  {['js', 'python', 'curl'].map(l => (
                    <button key={l} onClick={() => setActiveLang(l)} className={`text-[11px] font-black uppercase tracking-widest ${activeLang === l ? 'text-orange-400 border-b-2 border-orange-400 pb-3' : 'text-slate-600'}`}>
                       {l}
                    </button>
                  ))}
               </div>
               <div className="p-8">
                  <pre className="text-sm font-mono text-orange-100/90 whitespace-pre-wrap">
                    <code>{getCodeSnippet(activeLang)}</code>
                  </pre>
               </div>
            </div>
          </section>

          <section id="industries" className="space-y-6 pt-10">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
               <Database className="w-6 h-6 text-amber-400" /> Industry Discovery
            </h2>
            <p className="text-slate-400 leading-relaxed italic">
               GET {baseUrl}/industries
            </p>
            <p className="text-sm text-slate-500">
               Returns an array of objects containing <code className="text-slate-400">id</code> and <code className="text-slate-400">name</code>. Use these IDs in your generation requests.
            </p>
          </section>

          {/* Error Codes */}
          <section id="errors" className="space-y-10 pt-10">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
               <AlertCircle className="w-6 h-6 text-rose-400" /> Response Error Codes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[
                 { code: '400', name: 'Bad Request', desc: 'Missing required fields or invalid parameters in the request body.' },
                 { code: '401', name: 'Unauthorized', desc: 'Invalid or missing X-API-KEY header. Check your developer dashboard.' },
                 { code: '429', name: 'Too Many Requests', desc: 'API rate limit exceeded (10 requests per minute). Please slow down your requests.' },
                 { code: '500', name: 'Internal Server Error', desc: 'An unexpected error occurred on our end. Try again later.' },
               ].map((err) => (
                 <div key={err.code} className="p-6 bg-slate-800/10 border border-slate-700/30 rounded-3xl group hover:border-rose-500/20 transition-all">
                    <div className="text-2xl font-black text-white mb-2 group-hover:text-rose-400">
                       {err.code} — {err.name}
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{err.desc}</p>
                 </div>
               ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
