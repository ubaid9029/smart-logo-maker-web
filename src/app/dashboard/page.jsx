'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  LayoutDashboard, 
  Key, 
  History, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Zap, 
  Database,
  ChevronRight,
  MoreVertical,
  Activity,
  Copy,
  Check,
  Trash2,
  X,
  ArrowRight,
  Code2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/MainComponents/Navbar';
import { createClient } from '@/lib/supabaseClient';
import { createApiKey, getApiKeys, deleteApiKey } from './actions';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  
  const [newKeyData, setNewKeyData] = useState(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking dashboard auth...");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session, redirecting to login");
        router.push('/auth/signin?next=/dashboard');
        return;
      }
      setUser(session.user);
      await fetchKeys();
      setLoading(false);
    };
    checkAuth();
  }, [router, supabase]);

  const fetchKeys = async () => {
    try {
      const keys = await getApiKeys();
      setApiKeys(keys || []);
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    }
  };

  const handleCreateKey = async () => {
    console.log("Create Key button clicked");
    setIsCreatingKey(true);
    try {
      const result = await createApiKey('Default Key');
      console.log("Key created successfully:", result.key_preview);
      setNewKeyData(result);
      setShowNewKeyModal(true);
      await fetchKeys();
    } catch (err) {
      console.error("Key creation error:", err);
      alert('Failed to create key. Please check console.');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleDeleteKey = async (id) => {
    if (confirm('Are you sure you want to revoke this key?')) {
      try {
        await deleteApiKey(id);
        await fetchKeys();
      } catch (err) {
        alert("Failed to delete key");
      }
    }
  };

  const copyToClipboard = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-plusJakarta">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-bold">Synchronizing account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-plusJakarta selection:bg-blue-500/30">
      <Navbar minimal />
      
      <div className="max-w-[1440px] mx-auto px-6 pt-28 pb-12 lg:flex gap-10">
        
        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0 mb-10 lg:mb-0">
          <div className="sticky top-28 space-y-8">
            <div className="flex items-center gap-4 px-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-white truncate">{user?.user_metadata?.full_name || 'Designer'}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'overview', name: 'Overview', icon: LayoutDashboard },
                { id: 'keys', name: 'API Keys', icon: Key },
                { id: 'usage', name: 'Usage Stats', icon: Activity },
                { id: 'designs', name: 'Logo History', icon: History },
                { id: 'settings', name: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                    activeTab === item.id 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              ))}
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 font-bold text-sm hover:bg-rose-500/5 transition-all mt-4"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <header>
                  <h1 className="text-3xl font-black text-white mb-2">Welcome Back!</h1>
                  <p className="text-slate-400 text-sm">Here's what's happening with your brand assets and API.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Designs', value: '12', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Monthly Traffic', value: '0', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Active Keys', value: apiKeys.length.toString(), icon: Key, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-slate-800/20 border border-slate-700/40 rounded-3xl backdrop-blur-sm shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-slate-800/20 border border-slate-700/40 rounded-[2.5rem]">
                   <div className="text-center py-10">
                     <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                     <h4 className="text-lg font-bold text-white mb-2">No Generation History</h4>
                     <p className="text-sm text-slate-500">Your logo generation activity will appear here once you start using the API.</p>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'keys' && (
              <motion.div key="keys" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-3xl font-black text-white mb-2">API Keys</h1>
                    <p className="text-slate-400 text-sm">Create and manage access keys for external applications.</p>
                  </div>
                  <button 
                    onClick={handleCreateKey}
                    disabled={isCreatingKey}
                    className="brand-button-primary px-8 py-3.5 flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" /> {isCreatingKey ? 'Creating...' : 'Create New Key'}
                  </button>
                </header>

                <div className="space-y-4">
                  {apiKeys.length === 0 ? (
                    <div className="p-10 bg-slate-800/20 border border-slate-700/40 rounded-[3rem] text-center">
                       <Key className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                       <h3 className="text-xl font-bold text-white mb-2">No active keys</h3>
                       <p className="text-slate-500 text-sm mb-6">Generate your first key to get started.</p>
                       <button onClick={handleCreateKey} className="text-blue-400 font-bold hover:underline flex items-center gap-2 mx-auto disabled:opacity-50">
                          {isCreatingKey ? 'Working...' : 'Create your first key now'} <ArrowRight className="w-4 h-4 rotate-[-45deg]" />
                       </button>
                    </div>
                  ) : (
                    apiKeys.map((k) => (
                      <div key={k.id} className="p-6 bg-slate-800/20 border border-slate-700/40 rounded-3xl flex items-center justify-between gap-6 hover:border-slate-600 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                             <div className="text-sm font-bold text-white">{k.name}</div>
                             {k.is_active ? <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Active</span> : null}
                          </div>
                          <div className="font-mono text-xs text-slate-500">{k.key_preview}</div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500 text-xs">
                           <div>Modified: {new Date(k.created_at).toLocaleDateString()}</div>
                           <button onClick={() => handleDeleteKey(k.id)} title="Revoke Key" className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* NEW KEY MODAL */}
      <AnimatePresence>
        {showNewKeyModal && newKeyData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-10 relative shadow-2xl"
            >
              <button 
                onClick={() => setShowNewKeyModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              <div className="w-16 h-16 rounded-3xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30 mx-auto">
                <Check className="w-8 h-8 text-blue-400" />
              </div>

              <h2 className="text-2xl font-black text-center text-white mb-2">Key Created!</h2>
              <p className="text-sm text-slate-500 text-center mb-8 px-4">
                Please copy your API key now. For your security, <span className="text-rose-400 font-bold underline">you won't be able to see it again</span>.
              </p>

              <div className="bg-[#020617] border border-slate-800 rounded-2xl p-6 flex items-center justify-between group mb-8">
                <code className="text-blue-400 font-mono text-sm break-all mr-4">{newKeyData.rawKey}</code>
                <button 
                  onClick={() => copyToClipboard(newKeyData.rawKey, 'modal')}
                  className="p-3 bg-slate-800 rounded-xl hover:bg-blue-500 transition-all text-white flex-shrink-0"
                >
                  {copiedKeyId === 'modal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button 
                onClick={() => setShowNewKeyModal(false)}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all"
              >
                I've stored the key securely
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
