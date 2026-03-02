'use client';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#121a31] pt-20 pb-10 text-white border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Logo and Description */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <img src="/logo2.svg" alt="Smart Logo Maker" className="w-30 h-30" />
            </div>
            <p className="text-gray-400 text-sm md:text-base max-w-sm leading-relaxed">
              Transform your brand vision into reality with AI-powered logo generation. Professional designs made easy.
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3 md:ml-auto">
            <h4 className="text-white font-bold text-lg mb-6">Product</h4>
            <ul className="flex flex-col space-y-4">
              {[
                { name: 'Features', path: '../page.jsx' },
                { name: 'How It Works', path: 'components/Howitworks' },
                { name: 'App Preview', path: 'components/AppPreview.jsx' },
                { name: 'Get Started', path: '../create/bussiness-info' }
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path} 
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-3 md:ml-auto">
            <h4 className="text-white font-bold text-lg mb-6">Company</h4>
            <ul className="flex flex-col space-y-4">
              {[
                { name: 'About Us', path: 'about' },
                { name: 'Contact', path: '/contact' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' }
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path} 
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50 pt-8 flex flex-col items-center">
          <p className="text-gray-300 text-[13px] text-center">
            © {currentYear} Smart Logo Maker. All rights reserved. Made with
            <span className="text-pink-500 px-1 inline-block animate-pulse">❤</span>
            by creators, for creators.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;