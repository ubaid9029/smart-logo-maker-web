'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar({ minimal }) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'App Preview', href: '/#app-preview' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex h-30 w-30 shrink-0 cursor-pointer items-center justify-center">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
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

          {!minimal && (
            <div className="hidden items-center space-x-12 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group relative py-1 text-[15px] font-semibold text-[#4B5563] transition-colors hover:text-black"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-linear-to-r from-[#FF4D00] to-[#E302FF] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}

              <button className="rounded-full bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] px-8 py-3 text-[15px] font-bold text-white shadow-[0_4px_15px_rgba(255,0,122,0.3)] transition-transform duration-200 hover:scale-105">
                <Link href="/auth/signin" className="text-lg font-bold">Login</Link>
              </button>
            </div>
          )}

          {!minimal && (
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-[#111827]">
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
        <div className={`absolute left-0 top-18 w-full overflow-hidden bg-white transition-all duration-300 md:hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col space-y-5 p-6">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-lg font-bold text-gray-600 hover:text-[#FF007A]">
                {link.name}
              </Link>
            ))}

            <button className="w-full rounded-4xl bg-linear-to-r from-[#FF5C00] to-[#C400FF] py-2 text-white">
              <Link href="/auth/signin" className="text-lg font-bold">Login</Link>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
