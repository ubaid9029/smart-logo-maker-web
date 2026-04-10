'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown, LayoutGrid, LogOut, PencilLine } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  clearFavoriteLogosRepositoryCache,
  isLogoLibraryUpgradeRequiredError,
  isSupabaseAuthSessionMissingError,
  loadLogoLibrary,
  peekLogoLibraryCache,
} from '../../lib/favoriteLogosRepository';
import { readAuthSession } from '../../lib/authSession';
import { createClient } from '../../lib/supabaseClient';
import { subscribeFavoriteLogos } from '../../lib/favoriteLogosStorage';

const getUserDisplayName = (user) => {
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
  if (typeof fullName === 'string' && fullName.trim()) {
    return fullName.trim();
  }

  if (typeof user?.email === 'string' && user.email.includes('@')) {
    return user.email.split('@')[0];
  }

  return 'My Profile';
};

const getUserAvatar = (user) => {
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  return typeof avatarUrl === 'string' && avatarUrl.trim() ? avatarUrl.trim() : null;
};

const getUserInitials = (label) => {
  const source = String(label || '').trim();
  if (!source) {
    return 'U';
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

const isRenderableAvatarUrl = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  const nextValue = value.trim();
  return /^https?:\/\//i.test(nextValue) || nextValue.startsWith('data:image/');
};

export default function Navbar({ minimal }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [designCount, setDesignCount] = useState(0);
  const [brokenAvatarUrl, setBrokenAvatarUrl] = useState(null);
  const mobileMenuId = 'primary-mobile-menu';
  const profileMenuId = 'profile-menu-panel';
  const currentLocation = useMemo(() => {
    const query = currentSearchParams?.toString();
    return `${pathname || '/'}${query ? `?${query}` : ''}`;
  }, [currentSearchParams, pathname]);
  const signInHref = useMemo(() => `/auth/signin?next=${encodeURIComponent(currentLocation)}`, [currentLocation]);

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'App Preview', href: '/#app-preview' },
  ];

  useEffect(() => {
    let isActive = true;
    const supabase = createClient();

    const syncUserFromServer = async () => {
      try {
        const payload = await readAuthSession();
        const nextUser = payload?.user || null;

        if (isActive) {
          setAuthUser(nextUser);
        }
        return nextUser;
      } catch {
        return null;
      }
    };

    const syncUserFromClient = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error && !isSupabaseAuthSessionMissingError(error)) {
        console.error('Unable to read auth user:', error);
      }

      if (isActive) {
        setAuthUser(data?.session?.user || null);
      }
    };

    const syncUser = async () => {
      const serverUser = await syncUserFromServer();

      if (!isActive || serverUser) {
        return;
      }

      await syncUserFromClient();
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
      void syncUserFromServer();
    });

    const handleWindowFocus = () => {
      void syncUser();
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleWindowFocus);

    return () => {
      isActive = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleWindowFocus);
    };
  }, [currentLocation, pathname]);

  useEffect(() => {
    const syncLibraryCountsFromCache = () => {
      const cachedLogos = peekLogoLibraryCache(authUser?.id || null);
      setDesignCount(Array.isArray(cachedLogos) ? cachedLogos.length : 0);
    };

    const syncLibraryCounts = async () => {
      try {
        const libraryLogos = await loadLogoLibrary();
        setDesignCount(Array.isArray(libraryLogos) ? libraryLogos.length : 0);
      } catch (error) {
        if (!isLogoLibraryUpgradeRequiredError(error)) {
          console.error('Unable to load logo library counts:', error);
        }
        setDesignCount(0);
      }
    };

    syncLibraryCountsFromCache();
    void syncLibraryCounts();

    return subscribeFavoriteLogos(() => {
      syncLibraryCountsFromCache();
    });
  }, [authUser?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const profileName = useMemo(() => getUserDisplayName(authUser), [authUser]);
  const profileEmail = typeof authUser?.email === 'string' ? authUser.email : 'Signed in user';
  const profileAvatar = getUserAvatar(authUser);
  const canRenderProfileAvatar = Boolean(
    profileAvatar &&
    isRenderableAvatarUrl(profileAvatar) &&
    profileAvatar !== brokenAvatarUrl
  );
  const profileInitials = getUserInitials(profileName);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = 'auth-return-to=; path=/; max-age=0; samesite=lax';
    document.cookie = 'oauth-return-to=; path=/; max-age=0; samesite=lax';
    clearFavoriteLogosRepositoryCache();
    setAuthUser(null);
    setDesignCount(0);
    setBrokenAvatarUrl(null);
    setProfileMenuOpen(false);
    setIsOpen(false);
    router.replace(currentLocation);
    router.refresh();
  };

  return (
    <nav aria-label="Primary navigation" className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" aria-label="Smart Logo Maker home" className="flex h-30 w-30 shrink-0 cursor-pointer items-center justify-center">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="flex h-full w-full items-center justify-center"
              >
                <Image
                  src="/logos/logo3.svg"
                  alt="Smart Logo Maker"
                  width={120}
                  height={120}
                  className="h-full w-full object-contain"
                />
              </motion.div>
            </Link>
          </div>

          <div aria-label="Desktop navigation links" className="hidden items-center space-x-12 md:flex">
            {!minimal && navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="group relative py-1 text-[15px] font-semibold text-[#4B5563] transition-colors hover:text-black"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-linear-to-r from-[#FF4D00] to-[#E302FF] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            {!authUser ? (
              <Link
                href={signInHref}
                className="rounded-full bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-8 py-3 text-[15px] font-bold text-white shadow-[0_4px_15px_rgba(255,0,122,0.3)] transition-transform duration-200 hover:scale-105"
              >
                Login
              </Link>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setProfileMenuOpen((current) => !current)}
                  aria-label="Open profile menu"
                  aria-expanded={profileMenuOpen}
                  aria-controls={profileMenuId}
                  aria-haspopup="menu"
                  className="flex items-center gap-1.5 rounded-full border border-pink-200 bg-white px-1.5 py-1.5 shadow-sm transition hover:border-pink-300 hover:shadow-md"
                >
                  {canRenderProfileAvatar ? (
                    <Image
                      src={profileAvatar}
                      alt={profileName}
                      width={36}
                      height={36}
                      unoptimized
                      className="h-9 w-9 rounded-full object-cover text-[11px]"
                      onError={() => setBrokenAvatarUrl(profileAvatar)}
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-[#FF5C00] via-[#FF007A] to-[#C400FF] text-[11px] font-black text-white">
                      {profileInitials}
                    </div>
                  )}
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileMenuOpen && (
                  <div
                    id={profileMenuId}
                    role="menu"
                    aria-label="Profile menu"
                    className="absolute right-0 top-[calc(100%+12px)] max-h-[calc(100vh-6rem)] w-[21.5rem] overflow-y-auto rounded-[1.6rem] border border-pink-100 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
                  >
                    <div className="rounded-[1.35rem] bg-slate-50 p-3">
                      <div className="flex items-center gap-2.5">
                        {canRenderProfileAvatar ? (
                          <Image
                            src={profileAvatar}
                            alt={profileName}
                            width={42}
                            height={42}
                            unoptimized
                            className="h-10.5 w-10.5 rounded-full object-cover"
                            onError={() => setBrokenAvatarUrl(profileAvatar)}
                          />
                        ) : (
                          <div className="flex h-10.5 w-10.5 items-center justify-center rounded-full bg-linear-to-br from-[#FF5C00] via-[#FF007A] to-[#C400FF] text-sm font-black text-white">
                            {profileInitials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-[1.2rem] font-black leading-none text-slate-900">{profileName}</p>
                          <p className="mt-1.5 truncate text-[13px] font-semibold text-slate-500">{profileEmail}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-[1.35rem] border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-400">Profile</p>
                          <p className="mt-1.5 text-[13px] font-semibold text-slate-600">Your logo workspace shortcuts</p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-pink-50 text-pink-600"
                          aria-label="Edit profile"
                        >
                          <PencilLine size={20} />
                        </Link>
                      </div>

                      <div className="mt-3 rounded-[1.25rem] border border-pink-200 px-3 py-2.5">
                        <Link
                          href="/my-designs"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-slate-100 text-slate-700">
                              <LayoutGrid size={17} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">My Designs</p>
                              <p className="text-[12px] leading-5 font-medium text-slate-500">All favorites, saved, and downloads</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">{designCount}</span>
                        </Link>
                      </div>

                      <button
                        onClick={handleSignOut}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[1.25rem] bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(255,0,122,0.24)] transition hover:opacity-95"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!minimal && (
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close mobile navigation menu' : 'Open mobile navigation menu'}
                aria-expanded={isOpen}
                aria-controls={mobileMenuId}
                className="p-2 text-[#111827]"
              >
                {isOpen ? (
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {!minimal && (
        <div
          id={mobileMenuId}
          aria-label="Mobile navigation"
          className={`absolute left-0 top-18 z-40 w-full overflow-hidden bg-white transition-all duration-300 md:hidden ${isOpen ? 'max-h-[calc(100svh-4.5rem)] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="flex max-h-[calc(100svh-4.5rem)] flex-col space-y-5 overflow-y-auto px-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] pt-6">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-lg font-bold text-gray-600 hover:text-[#FF007A]">
                {link.name}
              </Link>
            ))}

            {!authUser ? (
              <Link
                href={signInHref}
                onClick={() => setIsOpen(false)}
                className="w-full rounded-4xl bg-linear-to-r from-[#FF5C00] to-[#C400FF] py-2 text-center text-lg font-bold text-white"
              >
                Login
              </Link>
            ) : (
              <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  {canRenderProfileAvatar ? (
                    <Image
                      src={profileAvatar}
                      alt={profileName}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-full object-cover"
                      onError={() => setBrokenAvatarUrl(profileAvatar)}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-[#FF5C00] via-[#FF007A] to-[#C400FF] text-sm font-black text-white">
                      {profileInitials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-slate-900">{profileName}</p>
                    <p className="truncate text-sm font-medium text-slate-500">{profileEmail}</p>
                  </div>
                </div>

                <Link
                  href="/my-designs"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <LayoutGrid size={16} /> My Designs
                  </span>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">{designCount}</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <PencilLine size={16} /> Edit Profile
                  </span>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">Go</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-4 py-3 text-sm font-bold text-white"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
