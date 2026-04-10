"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import Navbar from '../../components/MainComponents/Navbar';
import { createClient } from '../../lib/supabaseClient';
import { isSupabaseAuthSessionMissingError } from '../../lib/favoriteLogosRepository';

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error && !isSupabaseAuthSessionMissingError(error)) {
        console.error('Unable to read auth session:', error);
      }

      const nextUser = data?.session?.user || null;
      if (!active) return;

      setUser(nextUser);
      setAuthChecked(true);
      setFullName(String(nextUser?.user_metadata?.full_name || nextUser?.user_metadata?.name || '').trim());
      setAvatarUrl(String(nextUser?.user_metadata?.avatar_url || nextUser?.user_metadata?.picture || '').trim());
    };

    void sync();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      setUser(nextUser);
      setAuthChecked(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const payload = {
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim(),
      };

      const { error } = await supabase.auth.updateUser({ data: payload });
      if (error) {
        throw error;
      }

      setNotice({ type: 'success', message: 'Profile updated.' });
    } catch (error) {
      console.error('Unable to update profile:', error);
      setNotice({ type: 'error', message: 'Unable to update profile right now. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar minimal />
      <div className="mx-auto max-w-2xl px-6 pb-16 pt-28">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-400">Profile</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Edit Profile</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Update your display name and avatar. Changes apply across the app.</p>
            </div>
            <Link
              href="/my-designs"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>
          </div>

          {!authChecked ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">Loading...</div>
          ) : !user ? (
            <div className="mt-6 rounded-xl border border-pink-100 bg-pink-50 p-4 text-sm font-semibold text-slate-700">
              Sign in to edit your profile.
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Full Name</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-pink-300"
                    placeholder="Your name"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Avatar URL</span>
                  <input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-pink-300"
                    placeholder="https://..."
                  />
                </label>
              </div>

              {notice ? (
                <div className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${notice.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {notice.message}
                </div>
              ) : null}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="brand-button-primary px-6 py-3 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

