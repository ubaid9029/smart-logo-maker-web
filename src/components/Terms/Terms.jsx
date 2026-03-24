'use client';
import React from 'react';
import Head from 'next/head';

const TermsOfService = () => {
  return (
    <>
      <Head>
        <title>Terms of Service | Smart Logo Maker</title>
      </Head>

      <div className="min-h-screen bg-white text-gray-900 scroll-smooth pt-20">
        {/* Hero Section */}
        <section className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 py-20 px-4 text-center text-white">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight animate-fade-in-up">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-300 mb-6 font-medium animate-fade-in-up delay-100">
            Last Updated: February 27, 2026
          </p>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Welcome to Smart Logo Maker. Please read these terms carefully before using our services.
          </p>
        </section>

        {/* Content Section - Updated Timeline Design */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto relative">
            
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform md:-translate-x-1/2"></div>

            {/* Terms Items */}
            {[
              { title: '1. Introduction', content: 'By accessing or using Smart Logo Maker, you agree to be bound by these Terms of Service.' },
              { title: '2. User Accounts', content: 'You are responsible for safeguarding the password that you use to access the service and for any activities under your password.' },
              { title: '3. Intellectual Property', content: 'You own your inputs. Upon payment, ownership of generated logos is transferred to you. Our website design is our property.' },
              { title: '4. Acceptable Use', content: 'Do not use the service to generate content that is unlawful, harmful, or infringes upon the intellectual property rights of others.' },
              { title: '5. Payments & Refunds', content: 'All purchases are final. We do not offer refunds once a logo has been generated and delivered.' },
              { title: '6. Limitation of Liability', content: 'Smart Logo Maker shall not be liable for any damages arising from your use of the service.' },
            ].map((term, index) => (
              <div key={index} className={`relative mb-12 group animate-fade-in-up delay-${(index + 3) * 100}`}>
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-pink-500 rounded-full transform -translate-x-1/2 mt-2 border-4 border-white shadow transition-all duration-300 group-hover:scale-125 group-hover:bg-pink-600"></div>
                
                {/* Content Block */}
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'}`}>
                  <div className="pl-10 md:pl-0">
                    <h3 className="text-xl font-bold text-gray-950 mb-2">{term.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:border-pink-200 group-hover:shadow-md group-hover:-translate-y-1">
                      {term.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Width Contact Section - Animated */}
          <div className="max-w-4xl mx-auto mt-16 group animate-fade-in-up delay-600">
            <div className="bg-gray-950 p-10 rounded-3xl text-white shadow-xl transition-all duration-500 group-hover:shadow-pink-500/20 group-hover:shadow-2xl group-hover:scale-[1.02]">
              <h3 className="text-3xl font-bold mb-4 text-center">Questions?</h3>
              <p className="text-gray-300 text-center mb-8 max-w-lg mx-auto leading-relaxed">
                If you have any questions about these Terms, please contact our support team. We are here to help.
              </p>
              <div className="text-center">
                <a href="mailto:support@smartlogomaker.com" className="inline-block bg-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-pink-500/30">
                  support@smartlogomaker.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;