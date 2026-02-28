"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const faqs = [
    {
      question: "What's a sheet of on smart logo?",
      answer: "Our smart logo sheets are comprehensive design guides that ensure brand consistency across all digital and print mediums. They include color palettes, typography rules, and spacing guidelines tailored for your specific business needs."
    },
    {
      question: "How do I improve your questions?",
      answer: "You can improve questions by providing clear context and specific details. Our system uses advanced algorithms to refine user queries, ensuring you get the most accurate and helpful responses possible."
    },
    {
      question: "What is the environment of your smart logo?",
      answer: "The environment refers to the ecosystem where your logo lives—from mobile apps to large-scale billboards. We optimize every logo to be responsive, meaning it looks perfect regardless of the screen size or background color."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="min-h-screen bg-[#f8faff] py-8 md:py-12 px-6 flex flex-col items-center">
      
      {/* Header Section */}
      <motion.div 
        className="text-center mb-10 md:mb-12" 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-3 mb-4">
          Frequently Asked Questions (FAQ)
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          For frequently asked questions and detailed support, please browse through our help center sections.
        </p>
      </motion.div>

      {/* FAQ List */}
      <motion.div 
        className="w-full max-w-3xl space-y-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;
          
          return (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className={`bg-white rounded-2xl border transition-all duration-300 ${
                isOpen ? 'border-blue-200 shadow-xl shadow-blue-500/5' : 'border-gray-100 shadow-sm'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none" // Padding adjust
              >
                {/* Question Text */}
                <motion.span 
                  className={`text-base md:text-lg font-bold ${
                    isOpen 
                    ? 'bg-linear-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent' 
                    : 'text-gray-800'
                  }`}
                  animate={{ scale: isOpen ? 1.02 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Q. {faq.question}
                </motion.span>

                {/* Icon */}
                <motion.div 
                  className={`ml-4 shrink-0 p-2 rounded-full transition-colors duration-300 ${
                    isOpen ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </motion.div>
              </button>

              {/* Answer Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 md:px-6 pb-6 text-gray-500 leading-relaxed border-t border-gray-50 pt-5 text-sm md:text-base">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default FAQSection;