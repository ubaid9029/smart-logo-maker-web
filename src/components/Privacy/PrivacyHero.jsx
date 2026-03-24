import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 scroll-smooth">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-pink-100 via-purple-50 to-blue-50 py-20 px-4 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-600 mb-6 font-medium">
          Last Updated: February 27, 2026
        </p>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          At Smart Logo Maker, your trust is paramount. This policy outlines how we protect your information.
        </p>
      </section>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation - Sticky */}
        <aside className="w-full md:w-1/4">
          <div className="sticky top-6 bg-gray-950 p-6 rounded-2xl text-white shadow-xl">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-3">Navigation</h2>
            <ul className="space-y-3 text-gray-300">
              {[
                {name: 'Introduction', id: 'introduction'},
                {name: 'Information We Collect', id: 'information-we-collect'},
                {name: 'How We Use Info', id: 'usage'},
                {name: 'Sharing Data', id: 'sharing'},
                {name: 'Data Security', id: 'security'},
                {name: 'Cookies', id: 'cookies'},
                {name: 'Your Rights', id: 'rights'},
                {name: 'Contact Us', id: 'contact'},
              ].map(item => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`} 
                    className="block p-2 rounded-lg hover:bg-gray-800 hover:text-pink-400 transition-all duration-300 ease-in-out transform hover:translate-x-2"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
            <button className="mt-10 w-full bg-pink-600 text-white py-3 rounded-full font-semibold hover:bg-pink-700 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/30">
              Back to Home
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full md:w-3/4 space-y-8 mt-4">
          
          {/* Section 1 - scroll-mt-24 added */}
          <section id="introduction" className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-4 text-gray-950">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">Welcome to Smart Logo Maker. This policy explains our commitment to protecting your privacy and outlines how we collect, use, and safeguard your data when you use our services.</p>
          </section>

         
          <section id="information-we-collect" className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-4 text-gray-950">2. Information We Collect</h2>
            <ul className="list-none space-y-3 text-gray-700">
              <li className="flex items-center gap-2">✨ <strong>Account Info:</strong> Name, email address.</li>
              <li className="flex items-center gap-2">✨ <strong>Usage Data:</strong> Inputs, prompts, and design styles used for logo generation.</li>
              <li className="flex items-center gap-2">✨ <strong>Technical Data:</strong> IP address and browser information for analytics.</li>
            </ul>
          </section>

         
          <section id="usage" className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-4 text-gray-950">3. How We Use Information</h2>
            <p className="text-gray-700 leading-relaxed">We use the information to operate and improve our logo generation services, manage your user account, and provide customer support.</p>
          </section>

         
          <section id="sharing" className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-4 text-gray-950">4. Sharing Your Information</h2>
            <p className="text-gray-700 leading-relaxed"><strong>We do not sell your personal data.</strong> Information is only shared with trusted service providers (hosting, payment processors) necessary to run the site, or to comply with legal obligations.</p>
          </section>

          
          <section id="security" className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-4 text-gray-950">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">We implement industry-standard measures to protect your data from unauthorized access or misuse.</p>
          </section>

         
          <section id="cookies" className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-4 text-gray-950">6. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">We use cookies to enhance your browsing experience and analyze site traffic.</p>
          </section>

         
          <section id="rights" className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-4 text-gray-950">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed">You have the right to access, update, or request the deletion of your personal data and account at any time.</p>
          </section>

          
          <section id="contact" className="bg-white p-8 rounded-3xl border-2 border-pink-100 shadow-inner scroll-mt-24">
            <h2 className="text-3xl font-bold mb-4 text-gray-950">8. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">For any questions regarding this policy, please email us:</p>
            <a href="mailto:support@smartlogomaker.com" className="text-pink-600 font-semibold text-lg mt-2 inline-block hover:text-pink-700 transition">
              support@smartlogomaker.com
            </a>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;