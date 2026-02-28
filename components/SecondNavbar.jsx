import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const SecondNavbar = () => {
  return (
    <nav className="bg-white w-full border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <div className="w-30 h-30 cursor-pointer flex items-center justify-center shrink-0">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center justify-center w-full h-full"
              >
                <img
                  src="logo3.svg"
                  alt="Smart Logo Maker"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SecondNavbar;