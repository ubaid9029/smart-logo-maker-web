import React from 'react';

const NumbersSection = () => {
  const stats = [
    { value: '10K+', label: 'Logos Created' },
    { value: '25+', label: 'Industry Focuses' },
    { value: '4.9★', label: 'Global Rating' },
  ];

  return (
    <section className="bg-gray-50 py-20 px-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Styled Header */}
        <h2 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tighter">
          Numbers That <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-red-500">Matter</span>
        </h2>
        <p className="text-gray-600 text-lg mb-16 max-w-lg mx-auto">
          We're making a lot of noise comparing our solution.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {stats.map((stat, index) => (
            <div key={index} className="group flex flex-col items-center">
              {/* Gradient Number with Zoom Effect */}
              <div className="text-7xl font-extrabold mb-3 bg-clip-text text-transparent bg-linear-to-r from-red-500 via-purple-500 to-purple-700 transition-transform duration-300 group-hover:scale-110">
                {stat.value}
              </div>
              
              {/* Label */}
              <div className="text-lg font-semibold text-gray-800 bg-white px-4 py-1 rounded-full shadow-inner">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NumbersSection;