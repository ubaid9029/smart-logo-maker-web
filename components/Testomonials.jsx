'use client';
import { motion } from 'framer-motion';
// hi2 use karein, ye zyada stable hai
import { HiStar } from 'react-icons/hi2'; 

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Startup Founder",
    text: '"Smart Logo Maker helped me create a professional logo in minutes. The AI suggestions were spot-on!"'
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    role: "Freelance Designer",
    text: '"The editor is incredibly powerful. I can fine-tune every detail exactly how I want it."'
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "Small Business Owner",
    text: '"I never thought creating a logo could be this easy and fun. Highly recommend!"'
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase bg-pink-50 text-[#FF007A] border border-pink-100 mb-6"
          >
            Testimonials
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[36px] md:text-[52px] font-black text-[#1b1e27] leading-tight mb-4"
          >
            Loved by Creators
          </motion.h2>
<p className="text-2xl text-[rgb(84,85,88)]">Join thousands of satisfied users worldwide</p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -8 }}
              className="p-10 rounded-[40px] bg-linear-to-br from-[#fffafa] to-[#f9f5ff] border border-pink-50  flex flex-col justify-between shadow-sm hover:shadow-3xl  transition-shadow duration-700"
            >
              <div>
                {/* 5 Stars Rendering (Simple Loop) */}
                <div className="flex gap-1 mb-6">
                  <HiStar className="text-[#FFB800] text-xl" />
                  <HiStar className="text-[#FFB800] text-xl" />
                  <HiStar className="text-[#FFB800] text-xl" />
                  <HiStar className="text-[#FFB800] text-xl" />
                  <HiStar className="text-[#FFB800] text-xl" />
                </div>

                <p className="text-[#334155] text-lg leading-relaxed font-medium italic mb-8">
                  {item.text}
                </p>
              </div>

              <div>
                <h4 className="text-[18px] font-black text-[#0f172a]">{item.name}</h4>
                <p className="text-gray-500 text-sm font-semibold">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;