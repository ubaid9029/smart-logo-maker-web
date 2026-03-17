'use client';
import { motion } from 'framer-motion';
import { HiArrowRight, HiDevicePhoneMobile } from 'react-icons/hi2';

const AppPreview = () => {
    const steps = [
        { id: 1, title: "Home Dashboard", desc: "Quick access to all features", img: "/app1.PNG", color: "shadow-pink-500/40", offset: "lg:-mt-12" },
        { id: 2, title: "Logo Editor", desc: "Advanced editing canvas", img: "/app2.PNG", color: "shadow-orange-500/40", offset: "lg:mt-12" },
        { id: 3, title: "Font Selection", desc: "Choose perfect typography", img: "/app3.PNG", color: "shadow-purple-500/40", offset: "lg:-mt-12" },
        { id: 4, title: "AI Generation", desc: "Auto-generate stunning logos", img: "/app4.PNG", color: "shadow-blue-500/40", offset: "lg:mt-12" }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 0.8, ease: "easeOut" } 
        }
    };

    return (
        <section id="app-preview" className="relative c py-32 px-6 overflow-hidden bg-[#03030b]">
            {/* Background Glows & Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.30]" style={{ backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
                <div className="absolute top-[30%] right-[10%] w-75 h-75 bg-orange-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-150 h-150 bg-purple-600/20 blur-[150px] rounded-full"></div>
                <div className="absolute top-[-10%] left-[-5%] w-125 h-125 bg-blue-600/20 blur-[100px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto text-center relative z-10">
                {/* Header Animation */}
                <motion.div 
                    initial={{ opacity: 0, y: 0 }}
                    whileInView={{ opacity: 1, y: -20 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
                        <HiDevicePhoneMobile className="text-orange-500" />
                        <span className="text-pink-500 text-xs font-bold uppercase tracking-widest">Experience the App</span>
                    </div>

                    <h2 className="text-white text-[32px] md:text-[52px] font-black leading-tight mb-8 px-4">
                        Design Anywhere,<br className="hidden md:block" /> Anytime
                    </h2>
                    <p className="text-gray-400 text-lg md:text-2xl max-w-4xl mx-auto mb-20 font-medium px-4">
                        Professional logo creation at your fingertips with our powerful mobile app
                    </p>
                </motion.div>

                {/* --- FIX: Responsive Grid Alignment --- */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    /* Mobile: 1 col | Tablet (768px+): 2 cols | Desktop (1024px+): 4 cols */
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-20 gap-x-10 items-center justify-items-center"
                >
                    {steps.map((step) => (
                        <motion.div
                            key={step.id}
                            variants={itemVariants}
                            /* Zig-zag sirf bari screens par apply hoga */
                            className={`flex flex-col items-center w-full max-w-70 ${step.offset}`}
                        >
                            <div className="relative group cursor-pointer">
                                {/* Big Badge */}
                                <div className="absolute -top-6 -right-4 z-20 w-12 h-12 md:w-14 md:h-14 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl md:text-2xl font-black border-[6px] border-[#0b0f1a] shadow-xl">
                                    {step.id}
                                </div>

                                {/* Phone Frame */}
                                <div className={`relative w-full aspect-1/2 rounded-[2.5rem] md:rounded-[3rem] border-4 md:border-8 border-gray-800 bg-gray-900 overflow-hidden transition-all duration-500 
                                group-hover:scale-105 group-active:scale-95 group-hover:shadow-[0_0_60px_-15px] ${step.color}`}>
                                    <img src={step.img} alt={step.title} className="w-full h-full object-cover" />
                                </div>
                            </div>

                            {/* Text Info */}
                            <h3 className="text-white font-bold text-xl md:text-2xl mt-8 mb-1">{step.title}</h3>
                            <p className="text-gray-500 text-[11px] md:text-[13px] font-bold uppercase tracking-widest">{step.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Button Fade In */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mt-32"
                >
                    <button className="group bg-linear-to-r from-orange-600 to-purple-600 text-white px-8 md:px-10 py-4 rounded-full font-bold flex items-center gap-3 mx-auto transition-all hover:shadow-[0_0_40px_rgba(196,0,255,0.4)] text-sm md:text-base">
                        <span className="text-xl">📱</span> Coming Soon on Play Store
                        <HiArrowRight className="text-2xl transition-transform duration-300 group-hover:scale-150 group-hover:translate-x-2" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default AppPreview;