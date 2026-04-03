'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown, Heart, LogOut, UserRound } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { clearFavoriteLogosRepositoryCache, loadFavoriteLogos } from '../../lib/favoriteLogosRepository';
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

const isMissingAuthSessionError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return error?.name === 'AuthSessionMissingError' || message.includes('auth session missing');
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
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [avatarStatus, setAvatarStatus] = useState('idle');
  const mobileMenuId = 'primary-mobile-menu';
  const profileMenuId = 'profile-menu-panel';

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'App Preview', href: '/#app-preview' },
  ];

  useEffect(() => {
    const supabase = createClient();

    const syncUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error && !isMissingAuthSessionError(error)) {
        console.error('Unable to read auth user:', error);
      }
      setAuthUser(data?.user || null);
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const syncFavoriteCount = async () => {
      const favorites = await loadFavoriteLogos();
      setFavoriteCount(Array.isArray(favorites) ? favorites.length : 0);
    };

    void syncFavoriteCount();

    return subscribeFavoriteLogos(() => {
      void syncFavoriteCount();
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
  const profileInitials = getUserInitials(profileName);
  const currentLocation = useMemo(() => {
    const query = currentSearchParams?.toString();
    return `${pathname || '/'}${query ? `?${query}` : ''}`;
  }, [currentSearchParams, pathname]);
  const signInHref = useMemo(() => `/auth/signin?next=${encodeURIComponent(currentLocation)}`, [currentLocation]);

  useEffect(() => {
    if (!profileAvatar || !isRenderableAvatarUrl(profileAvatar)) {
      setAvatarStatus('failed');
      return undefined;
    }

    let isActive = true;
    const previewImage = new window.Image();

    setAvatarStatus('loading');
    previewImage.onload = () => {
      if (isActive) {
        setAvatarStatus('loaded');
      }
    };
    previewImage.onerror = () => {
      if (isActive) {
        setAvatarStatus('failed');
      }
    };
    previewImage.src = profileAvatar;

    return () => {
      isActive = false;
      previewImage.onload = null;
      previewImage.onerror = null;
    };
  }, [profileAvatar]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearFavoriteLogosRepositoryCache();
    setFavoriteCount(0);
    setProfileMenuOpen(false);
    setIsOpen(false);
    router.push('/');
    router.refresh();
  };

  const ProfileAvatar = ({ className = '' }) => (
    avatarStatus === 'loaded' ? (
      <img
        src={profileAvatar}
        alt={profileName}
        className={`h-12 w-12 rounded-full object-cover ${className}`.trim()}
      />
    ) : (
      <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-[#FF5C00] via-[#FF007A] to-[#C400FF] text-sm font-black text-white ${className}`.trim()}>
        {profileInitials}
      </div>
    )
  );

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
                  <ProfileAvatar className="h-9 w-9 text-[11px]" />
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileMenuOpen && (
                  <div
                    id={profileMenuId}
                    role="menu"
                    aria-label="Profile menu"
                    className="absolute right-0 top-[calc(100%+14px)] w-[23rem] rounded-[2rem] border border-pink-100 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
                  >
                    <div className="rounded-[1.6rem] bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar />
                        <div className="min-w-0">
                          <p className="truncate text-[1.45rem] font-black leading-none text-slate-900">{profileName}</p>
                          <p className="mt-2 truncate text-sm font-semibold text-slate-500">{profileEmail}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.6rem] border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-400">Profile</p>
                          <p className="mt-2 text-sm font-semibold text-slate-600">Your logo workspace shortcuts</p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-pink-50 text-pink-600">
                          <UserRound size={22} />
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.5rem] border border-pink-200 px-4 py-3">
                        <Link
                          href="/favorites"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-slate-100 text-slate-700">
                              <Heart size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">Favorite Logos</p>
                              <p className="text-xs font-medium text-slate-500">Saved designs for quick access</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">{favoriteCount}</span>
                        </Link>
                      </div>

                      <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Profile Details</p>
                        <div className="mt-3 space-y-2 text-sm">
                          <p className="font-bold text-slate-900">{profileName}</p>
                          <p className="truncate font-medium text-slate-500">{profileEmail}</p>
                          <p className="font-semibold text-slate-600">Favorites: {favoriteCount}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleSignOut}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(255,0,122,0.24)] transition hover:opacity-95"
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
          className={`absolute left-0 top-18 w-full overflow-hidden bg-white transition-all duration-300 md:hidden ${isOpen ? 'max-h-[34rem] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="flex flex-col space-y-5 p-6">
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
                  <ProfileAvatar />
                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-slate-900">{profileName}</p>
                    <p className="truncate text-sm font-medium text-slate-500">{profileEmail}</p>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Profile</p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">Favorites: {favoriteCount}</p>
                </div>

                <Link
                  href="/favorites"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Heart size={16} /> Favorite Logos
                  </span>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">{favoriteCount}</span>
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
