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
  Code2,
  User,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/MainComponents/Navbar';
import { createClient } from '@/lib/supabaseClient';
import { 
  createApiKey, 
  getApiKeys, 
  deleteApiKey, 
  getUsageStats, 
  getGlobalUsageStats 
} from './actions';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [globalLogs, setGlobalLogs] = useState([]);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [showPassInput, setShowPassInput] = useState(false);
  
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
      
      const currentUser = session.user;
      setUser(currentUser);
      
      // Admin Check
      const adminEmail = 'ubaid9029@gmail.com';
      const isUserAdmin = currentUser.email === adminEmail;
      setIsAdmin(isUserAdmin);

      await Promise.all([
        fetchKeys(), 
        fetchUsage(),
        fetchDesigns(),
        isUserAdmin ? fetchGlobalUsage() : Promise.resolve()
      ]);
      setLoading(false);
    };
    checkAuth();
  }, [router, supabase]);

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('user_logos') // Assuming this is the table name
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setDesigns(data || []);
    } catch (err) {
      console.error("Failed to fetch designs:", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const fullName = e.target.elements.fullName.value;
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile: " + err.message);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const newPassword = e.target.elements.newPassword.value;
    if (newPassword.length < 6) return alert("Password must be at least 6 characters.");
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      alert("Password updated successfully! Next time you login, use your new password.");
      e.target.reset();
      setShowPassInput(false);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const fetchKeys = async () => {
    try {
      const keys = await getApiKeys();
      setApiKeys(keys || []);
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    }
  };

  const fetchUsage = async () => {
    try {
      const stats = await getUsageStats();
      setUsageLogs(stats || []);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchGlobalUsage = async () => {
    try {
      const response = await getGlobalUsageStats();
      if (response.data) {
        setGlobalLogs(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch global stats:", err);
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
                ...(isAdmin ? [{ id: 'admin', name: 'Admin Portal', icon: Zap }] : []),
                { id: 'settings', name: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                    activeTab === item.id 
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm' 
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
                    { label: 'Total Designs', value: designs.length.toString(), icon: Database, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                    { label: 'Weekly API Volume', value: usageLogs.length.toString(), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
                   <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                     <Activity className="w-5 h-5 text-orange-400" /> Recent Activity
                   </h3>
                   
                   {usageLogs.length === 0 ? (
                     <div className="text-center py-10">
                       <History className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                       <h4 className="text-sm font-bold text-slate-400">No recent activity detected.</h4>
                       <p className="text-xs text-slate-600 mt-1">Start using your API keys to see live data here.</p>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {usageLogs.slice(0, 5).map((log, i) => (
                          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
                            <div className="flex items-center gap-4">
                               <div className={`px-2 py-1 rounded text-[10px] font-bold ${log.status_code < 400 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                 {log.status_code}
                               </div>
                               <div>
                                 <div className="text-sm font-medium text-slate-200 uppercase">{log.endpoint.split('/').pop()}</div>
                                 <div className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleString()}</div>
                               </div>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">Method: POST</div>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              </motion.div>
            )}

            {activeTab === 'usage' && (
              <motion.div key="usage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <header>
                   <h1 className="text-3xl font-black text-white mb-2">Usage Statistics</h1>
                   <p className="text-slate-400 text-sm">Detailed performance metrics for your API integrations.</p>
                 </header>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-slate-800/10 border border-slate-700/20 rounded-[2rem]">
                       <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Requests Summary</div>
                       <div className="flex items-end justify-between">
                          <div>
                             <div className="text-4xl font-black text-white">{usageLogs.length}</div>
                             <div className="text-[11px] text-slate-500 mt-1">Total requests this week</div>
                          </div>
                          <div className="text-right">
                             <div className="text-emerald-400 font-bold text-sm">{usageLogs.filter(l => l.status_code < 400).length} OK</div>
                             <div className="text-rose-400 font-bold text-sm">{usageLogs.filter(l => l.status_code >= 400).length} Failed</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-800/20 border border-slate-700/40 rounded-[2rem] overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-700/50 bg-slate-900/40 font-bold text-white flex items-center gap-2">
                       <Activity className="w-4 h-4 text-orange-400" /> Full Request Log
                    </div>
                    <div className="p-4 space-y-2">
                       {usageLogs.length === 0 ? (
                         <div className="py-20 text-center text-slate-600 text-sm font-bold">No usage data recorded yet.</div>
                       ) : (
                         usageLogs.map((log, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-slate-800/20 border border-slate-700/20 rounded-2xl">
                              <div className="flex items-center gap-4">
                                 <span className={`px-2 py-1 rounded text-[10px] font-black ${log.status_code < 400 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {log.status_code}
                                 </span>
                                 <div>
                                    <div className="text-sm font-bold text-slate-200">POST {log.endpoint.split('/').pop()}</div>
                                    <div className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleString()}</div>
                                 </div>
                              </div>
                              <div className="text-[11px] text-blue-400 font-mono text-right">
                                 IP: {log.ip || '---'}
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'admin' && isAdmin && (
              <motion.div key="admin" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <header className="flex items-center justify-between">
                   <div>
                     <h1 className="text-3xl font-black text-white mb-2">Admin Control Center</h1>
                     <p className="text-slate-400 text-sm italic">Global platform health monitoring and traffic analysis.</p>
                   </div>
                   <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                      <span className="text-xs font-black text-orange-400 uppercase tracking-widest">System Online</span>
                   </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Global Traffic', value: globalLogs.length.toString(), icon: Zap, color: 'text-orange-400' },
                    { label: 'Active Users', value: new Set(globalLogs.map(l => l.user_id)).size.toString(), icon: Database, color: 'text-indigo-400' },
                    { label: 'Successful', value: globalLogs.filter(l => l.status_code < 400).length.toString(), icon: Check, color: 'text-emerald-400' },
                    { label: 'Failed', value: globalLogs.filter(l => l.status_code >= 400).length.toString(), icon: X, color: 'text-rose-400' },
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-slate-800/10 border border-slate-700/30 rounded-3xl">
                       <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                       <div className="text-xl font-black text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#020617]/40 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                   <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-pink-500" /> Platform Live Feed
                      </h3>
                      <button onClick={fetchGlobalUsage} className="text-[10px] font-black text-blue-400 hover:underline uppercase tracking-widest">Refresh Feed</button>
                   </div>
                   <div className="p-4 space-y-2">
                      {globalLogs.length === 0 ? (
                        <div className="py-20 text-center text-slate-600 text-sm font-bold">No global traffic recorded in this period.</div>
                      ) : (
                        globalLogs.map((log, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-slate-800/20 border border-slate-700/20 rounded-2xl group hover:border-slate-600 transition-all">
                             <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-[9px] font-black ${log.status_code < 400 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                   {log.status_code}
                                </span>
                                <div>
                                   <div className="text-sm font-bold text-slate-200">User: <span className="text-slate-500 font-mono text-[10px]">{log.user_id.slice(0, 8)}...</span></div>
                                   <div className="text-[11px] text-orange-400 font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{log.endpoint.split('/').pop()}</div>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</div>
                                <div className="text-[9px] text-slate-600 uppercase font-black tracking-tighter">Live Monitor</div>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <header>
                  <h1 className="text-3xl font-black text-white mb-2">Account Settings</h1>
                  <p className="text-slate-400 text-sm">Manage your profile and security preferences.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <form onSubmit={handleUpdateProfile} className="p-8 bg-slate-800/20 border border-slate-700/40 rounded-[2.5rem] space-y-6">
                         <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-orange-400" /> Personal Information
                         </h3>
                         
                         <div className="space-y-4">
                            <div>
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Full Name</label>
                               <input 
                                 type="text" 
                                 name="fullName"
                                 defaultValue={user?.user_metadata?.full_name}
                                 className="w-full bg-[#020617] border border-slate-800 rounded-2xl px-6 py-4 text-slate-200 focus:border-orange-500/50 outline-none transition-all"
                                 placeholder="Enter your name"
                               />
                            </div>
                            <div>
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Email Address</label>
                               <input 
                                 type="email" 
                                 value={user?.email}
                                 disabled
                                 className="w-full bg-[#020617]/50 border border-slate-800/50 rounded-2xl px-6 py-4 text-slate-500 cursor-not-allowed outline-none"
                               />
                               <p className="text-[10px] text-slate-600 mt-2 px-1 italic">Connected via Google Authentication.</p>
                            </div>
                         </div>
                         
                         <button type="submit" className="w-full md:w-auto bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-8 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-[0_8px_25px_rgba(255,0,122,0.2)] hover:scale-[1.02] transition-all">
                            Save Profile Changes
                         </button>
                      </form>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'designs' && (
              <motion.div key="designs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <header>
                  <h1 className="text-3xl font-black text-white mb-2">Logo History</h1>
                  <p className="text-slate-400 text-sm">A list of all logos you have generated or saved across the platform.</p>
                </header>

                <div className="bg-slate-800/20 border border-slate-700/40 rounded-[2rem] overflow-hidden">
                   {designs.length === 0 ? (
                     <div className="text-center py-20">
                        <History className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-400">No designs found</h3>
                        <p className="text-sm text-slate-600 mt-1">Visit our editor to start creating professional logos.</p>
                     </div>
                   ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="border-b border-slate-700/50 bg-slate-900/40">
                                 <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Logo Name</th>
                                 <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Created At</th>
                                 <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-700/30">
                              {designs.map((design, i) => (
                                <tr key={i} className="hover:bg-slate-800/10 transition-colors">
                                   <td className="px-8 py-5">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                            <LayoutGrid className="w-5 h-5 text-orange-400" />
                                         </div>
                                         <span className="font-bold text-slate-200">{design.name || 'Untitled Design'}</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-5 text-sm text-slate-500">
                                      {new Date(design.created_at).toLocaleDateString()}
                                   </td>
                                   <td className="px-8 py-5 text-right">
                                      <button className="text-xs font-black text-blue-400 hover:underline uppercase tracking-widest">Open Editor</button>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                   )}
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
