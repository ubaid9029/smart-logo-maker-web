import Link from 'next/link';
import { BookOpen, Calendar, Clock, ChevronRight } from 'lucide-react';

export const metadata = {
  title: "AI Logo Design Blog | Tips, Trends & Guides | Smart Logo Maker",
  description: "Read the latest about AI logo design, startup branding, color psychology, and branding trends for 2026. 100% free tips for everyone.",
  alternates: {
    canonical: "/blog",
  },
};

const blogPosts = [
  {
    title: "How to Design a Logo for a Startup in 2026",
    excerpt: "Launch your venture identity fast with our 2026 guide to AI startup logos. No signup, no watermark, 100% free.",
    date: "April 19, 2026",
    readTime: "15 min",
    category: "Startup",
    href: "/blog/how-to-design-startup-logo-2026",
  },
  {
    title: "Best Logo Colors for Brands",
    excerpt: "Master color psychology for your brand. Find the perfect palette for tech, wellness, and fashion niches.",
    date: "April 19, 2026",
    readTime: "12 min",
    category: "Design",
    href: "/blog/best-logo-colors",
  },
  {
    title: "AI vs Human Logo Design – Which is Better?",
    excerpt: "A deep dive into the collision of algorithmic speed and human creativity in the brand building world.",
    date: "April 19, 2026",
    readTime: "10 min",
    category: "Tech",
    href: "/blog/ai-vs-human-design",
  },
];

export default function BlogIndexPage() {
  return (
    <article className="bg-[#f8fafc] min-h-screen">
      <header className="bg-white border-b border-slate-100 pt-32 pb-20">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-widest mb-8">
               <BookOpen className="w-4 h-4" /> The AI Design Blog
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-8 mb-8 tracking-tighter">
               Brand Building for <br />
               <span className="text-indigo-600">The 2026 Economy</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
               Expert insights on AI logos, fast branding, and successful market entry. All our knowledge, openly available for free.
            </p>
         </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-20">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogPosts.map((post) => (
               <Link 
                  key={post.href}
                  href={post.href}
                  className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
               >
                  <div className="p-8 pb-0">
                     <span className="inline-block px-4 py-1.5 rounded-full bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {post.category}
                     </span>
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-between">
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                           {post.title}
                        </h2>
                        <p className="text-slate-500 font-medium line-clamp-3 mb-8">
                           {post.excerpt}
                        </p>
                     </div>
                     <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-4">
                           <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                           <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </Link>
            ))}
         </div>
         
         <div className="mt-20 text-center">
             <p className="text-slate-400 font-bold mb-8 italic">More posts coming weekly...</p>
             <Link href="/create" className="brand-button-primary px-10 py-5 text-xl font-black">
                Design Your Logo Now
             </Link>
         </div>
      </div>
    </article>
  );
}
