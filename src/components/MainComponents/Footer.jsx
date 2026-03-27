'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800/50 bg-[#121a31] pb-10 pt-20 text-white">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <Image src="/logos/logo2.svg" alt="Smart Logo Maker" width={120} height={120} className="h-30 w-30" />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-gray-400 md:text-base">
              Transform your brand vision into reality with AI-powered logo generation. Professional designs made easy.
            </p>
          </div>

          <div className="md:col-span-3 md:ml-auto">
            <h4 className="mb-6 text-lg font-bold text-white">Product</h4>
            <ul className="flex flex-col space-y-4">
              {[
                { name: 'Features', path: '#features' },
                { name: 'How It Works', path: '#how-it-works' },
                { name: 'App Preview', path: '#app-preview' },
                { name: 'Get Started', path: '../create' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-sm font-medium text-gray-400 transition-colors duration-300 hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 md:ml-auto">
            <h4 className="mb-6 text-lg font-bold text-white">Company</h4>
            <ul className="flex flex-col space-y-4">
              {[
                { name: 'About Us', path: 'about' },
                { name: 'Contact', path: '/contact' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-sm font-medium text-gray-400 transition-colors duration-300 hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center border-t border-gray-800/50 pt-8">
          <p className="text-center text-[13px] text-gray-300">
            &copy; {currentYear} Smart Logo Maker. All rights reserved. Made with care by creators, for creators.
          </p>
        </div>
      </div>
    </footer>
  );
}
