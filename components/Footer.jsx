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
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo3.svg" alt="Smart Logo Maker" className="w-20 h-20" />
              <div className="flex flex-col">
              </div>
            </div>
            <p className="text-gray-400 text-sm md:text-base max-w-sm leading-relaxed">
              Transform your brand vision into reality with AI-powered logo generation. Professional designs made easy.
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3 md:ml-auto">
            <h4 className="text-white font-bold text-lg mb-6">Product</h4>
            <ul className="flex flex-col space-y-4">
              {['Features', 'How It Works', 'App Preview', 'Get Started'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-3 md:ml-auto">
            <h4 className="text-white font-bold text-lg mb-6">Company</h4>
            <ul className="flex flex-col space-y-4">
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Link 
                    href="/" 
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium"
                  >
                    {item}
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