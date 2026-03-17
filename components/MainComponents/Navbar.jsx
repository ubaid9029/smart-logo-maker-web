'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Humne yahan 'minimal' prop receive kiya hai
const Navbar = ({ minimal }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '/#features' }, // Added / taake doosre pages se bhi scroll ho sake
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'App Preview', href: '/#app-preview' },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section - Hamesha visible rahega */}
          <div className="flex items-center">
            <Link href="/" className="w-30 h-30 cursor-pointer flex items-center justify-center shrink-0">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center justify-center w-full h-full"
              >
                <img
                  src="/logo3.svg" // Added / for absolute path
                  alt="Smart Logo Maker"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Menu - Sirf tab dikhega jab minimal false ho */}
          {!minimal && (
            <div className="hidden md:flex items-center space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative text-[#4B5563] text-[15px] font-semibold transition-colors hover:text-black group py-1"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#FF4D00] to-[#E302FF] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}

              <button className="bg-linear-to-r from-[#FF5C00] via-[#FF007A] to-[#C400FF] text-white px-8 py-3 rounded-full font-bold text-[15px] shadow-[0_4px_15px_rgba(255,0,122,0.3)] hover:scale-105 transition-transform duration-200">
                <Link href="/auth/signin" className='font-bold text-lg'>Login</Link>
              </button>
            </div>
          )}

          {/* Hamburger Button - Sirf tab dikhega jab minimal false ho */}
          {!minimal && (
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-[#111827] p-2">
                {isOpen ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu w-6 h-6" >
                    <line x1="4" x2="20" y1="12" y2="12"></line>
                    <line x1="4" x2="20" y1="6" y2="6"></line>
                    <line x1="4" x2="20" y1="18" y2="18"></line>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown - Sirf tab dikhega jab minimal false ho */}
      {!minimal && (
        <div className={`md:hidden absolute top-18 left-0 w-full bg-white transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 flex flex-col space-y-5">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-gray-600 font-bold text-lg hover:text-[#FF007A]">
                {link.name}
              </Link>
            ))}
            
            <button className="w-full bg-linear-to-r from-[#FF5C00] to-[#C400FF] text-white py-2 rounded-4xl ">
              <Link href="/auth/signin" className='font-bold text-lg'>Login</Link>
            </button>
          </div>
        </div>
      )}
    </nav >
  );
};

export default Navbar;