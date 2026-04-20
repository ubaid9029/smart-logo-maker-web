'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Key,
  ShieldCheck,
  Zap,
  Code2,
  Copy,
  Check,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Cpu
} from 'lucide-react';

const API_DOCS = {
  baseUrl: 'https://www.smart-logomaker.com/api/v1',
  endpoints: [
    {
      id: 'generate',
      name: 'Generate Logo',
      method: 'POST',
      path: '/generate',
      description: 'Generate professional AI logo templates based on brand name and industry.',
      parameters: [
        { name: 'name', type: 'string', required: true, description: 'The business or brand name to display on the logo.' },
        { name: 'slogan', type: 'string', required: false, description: 'An optional slogan or tagline.' },
        { name: 'industryId', type: 'number', required: false, description: 'Default is 23. The industry category ID.' },
        { name: 'colorId', type: 'string', required: false, description: 'Default is "1". Supported range: 1-6.' }
      ],
      exampleRequest: {
        name: "EcoBrand",
        slogan: "Nature in every drop",
        industryId: 23,
        colorId: "2"
      }
    }
  ],
  errors: [
    { code: 400, message: 'Bad Request', description: 'Missing required fields or invalid parameters.' },
    { code: 401, message: 'Unauthorized', description: 'Invalid or missing X-API-KEY header.' },
    { code: 429, message: 'Too Many Requests', description: 'Usage limit exceeded for your API key.' },
    { code: 500, message: 'Internal Server Error', description: 'An unexpected error occurred on our end.' }
  ]
};

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState('js');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeSnippet = (lang) => {
    if (lang === 'js') {
      return `const response = await fetch('https://www.smart-logomaker.com/api/v1/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'your_api_key_here'
  },
  body: JSON.stringify({
    name: 'My Brand',
    slogan: 'Leading the way',
    industryId: 23
  })
});

const data = await response.json();
console.log(data.templates);`;
    }
    if (lang === 'python') {
      return `import requests

url = "https://www.smart-logomaker.com/api/v1/generate"
headers = {
    "X-API-KEY": "your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "name": "My Brand",
    "slogan": "Leading the way",
    "industryId": 23
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    }
    return `curl -X POST https://www.smart-logomaker.com/api/v1/generate \\
     -H "X-API-KEY: your_api_key_here" \\
     -H "Content-Type: application/json" \\
     -d '{
       "name": "My Brand",
       "slogan": "Leading the way"
     }'`;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Cpu className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm font-bold tracking-widest text-blue-400 uppercase">Developer Hub</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
          >
            Smart Logo <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">API</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl leading-relaxed"
          >
            Integrate our powerful AI logo generation engine into your own applications with just a few lines of code.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-20">

            {/* Authentication Section */}
            <section id="auth">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Authentication</h2>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                The Smart Logo API uses API keys to authenticate requests. You can view and manage your API keys in your developer dashboard.
              </p>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-center justify-between group">
                <code className="text-blue-400 font-mono">X-API-KEY: your_api_key_here</code>
                <Key className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </section>

            {/* Endpoints Section */}
            {API_DOCS.endpoints.map((endpoint) => (
              <section key={endpoint.id} id={endpoint.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs font-bold text-blue-400">
                    {endpoint.method}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{endpoint.name}</h2>
                </div>

                <p className="text-slate-400 mb-8">{endpoint.description}</p>

                <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/50 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-300">Parameters</span>
                    <Terminal className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="p-0">
                    {endpoint.parameters.map((param, i) => (
                      <div key={param.name} className={`px-6 py-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-8 ${i !== endpoint.parameters.length - 1 ? 'border-b border-slate-800/30' : ''}`}>
                        <div className="w-32">
                          <span className="font-mono text-sm text-blue-400">{param.name}</span>
                          {param.required && <span className="ml-2 text-[10px] text-rose-500 font-bold uppercase">Required</span>}
                        </div>
                        <div className="flex-1 text-sm text-slate-400">{param.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}

            {/* Error Codes */}
            <section id="errors">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-rose-400" />
                <h2 className="text-2xl font-bold text-white">Error Codes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {API_DOCS.errors.map((error) => (
                  <div key={error.code} className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
                    <div className="text-lg font-bold text-white mb-1">{error.code} — {error.message}</div>
                    <div className="text-sm text-slate-500">{error.description}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Code Snippets */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="bg-[#0b1120] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex gap-4">
                    {['js', 'python', 'curl'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className={`text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === lang ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => copyToClipboard(getCodeSnippet(activeTab))}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />}
                  </button>
                </div>
                <div className="p-8 overflow-x-auto">
                  <pre className="text-sm font-mono leading-relaxed text-blue-50/80">
                    <code>{getCodeSnippet(activeTab)}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-4">
                <Zap className="w-6 h-6 text-blue-400 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-white mb-1">Quick Start</div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    Most developers integrate our API in less than 5 minutes. Need help? Contact our developer support team.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
