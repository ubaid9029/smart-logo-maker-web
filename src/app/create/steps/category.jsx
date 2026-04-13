'use client';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateFormData } from "../../../store/slices/logoSlice";
import {
  ShoppingBag, Utensils, Heart,
  Building, Dumbbell,
  Briefcase, Check, Plane, Gavel, Globe,
  Bot, Sofa, PartyPopper, Activity, DollarSign, HelpingHand,
  Gamepad2, Hammer, BookOpen, Sparkles, Car, Dog,
  ChevronDown, Coffee, Camera, Music, Flower2, Paintbrush,
  Scissors, Pizza, Bike, Church, Baby, Shield, Shirt,
  Laptop, Film, HeartHandshake, Leaf, Sun, Moon, Zap,
  Truck, Wrench, Stethoscope, Gem, Crown, Mountain,
  Waves, Palette, Rocket, TreePine, Fish, Bird,
  Cat, Scale, Mic, Radio, Store, Home, Monitor,
  Clapperboard, GraduationCap, Headphones,
} from 'lucide-react';

// Visual mapping for the top 20 API icons
const iconMapping = {
  "Travel": { icon: Plane, color: "bg-sky-500" },
  "Sports Fitness": { icon: Dumbbell, color: "bg-rose-500" },
  "Retail": { icon: ShoppingBag, color: "bg-red-500" },
  "Religious": { icon: Heart, color: "bg-amber-500" },
  "Real Estate": { icon: Building, color: "bg-emerald-500" },
  "Legal": { icon: Gavel, color: "bg-slate-700" },
  "Internet": { icon: Globe, color: "bg-blue-500" },
  "Technology": { icon: Bot, color: "bg-indigo-500" },
  "Home Family": { icon: Sofa, color: "bg-orange-500" },
  "Events": { icon: PartyPopper, color: "bg-pink-500" },
  "Medical Dental": { icon: Activity, color: "bg-teal-500" },
  "Restaurant": { icon: Utensils, color: "bg-orange-600" },
  "Finance": { icon: DollarSign, color: "bg-green-600" },
  "Nonprofit": { icon: HelpingHand, color: "bg-purple-500" },
  "Entertainment": { icon: Gamepad2, color: "bg-violet-500" },
  "Construction": { icon: Hammer, color: "bg-yellow-600" },
  "Education": { icon: BookOpen, color: "bg-blue-600" },
  "Beauty Spa": { icon: Sparkles, color: "bg-pink-400" },
  "Automotive": { icon: Car, color: "bg-slate-600" },
  "Animals Pets": { icon: Dog, color: "bg-amber-600" }
};

// Keyword → icon+color for "others" categories
const keywordIconMap = [
  { keywords: ['coffee', 'cafe', 'tea'], icon: Coffee, color: 'bg-amber-700' },
  { keywords: ['pizza', 'burger', 'food', 'fried', 'sushi', 'noodle', 'bbq', 'taco', 'cookie', 'cake', 'bakery', 'snack', 'ice cream', 'chocolate', 'vegan', 'organic'], icon: Pizza, color: 'bg-orange-500' },
  { keywords: ['restaurant', 'bar', 'pub', 'cocktail', 'beer', 'drink', 'catering'], icon: Utensils, color: 'bg-orange-600' },
  { keywords: ['photo', 'camera'], icon: Camera, color: 'bg-teal-600' },
  { keywords: ['music', 'band', 'dj', 'audio', 'headphone'], icon: Music, color: 'bg-purple-600' },
  { keywords: ['podcast', 'radio'], icon: Mic, color: 'bg-violet-600' },
  { keywords: ['film', 'movie', 'video', 'tv'], icon: Clapperboard, color: 'bg-slate-700' },
  { keywords: ['flower', 'flori', 'garden'], icon: Flower2, color: 'bg-pink-500' },
  { keywords: ['art', 'paint', 'creative', 'design', 'craft', 'handmade', 'handcraft', 'street art'], icon: Paintbrush, color: 'bg-indigo-500' },
  { keywords: ['hair', 'salon', 'barber', 'beauty', 'makeup', 'cosmetic', 'lash', 'eyelash', 'nail', 'skin', 'spa', 'massage', 'aesthetic'], icon: Scissors, color: 'bg-pink-500' },
  { keywords: ['sport', 'fitness', 'gym', 'exercise', 'running', 'yoga', 'boxing', 'mma', 'fighting', 'golf', 'basketball', 'skating', 'racing'], icon: Dumbbell, color: 'bg-rose-500' },
  { keywords: ['bike', 'cycling'], icon: Bike, color: 'bg-lime-600' },
  { keywords: ['church', 'religious'], icon: Church, color: 'bg-amber-600' },
  { keywords: ['baby', 'child', 'kid', 'cute'], icon: Baby, color: 'bg-sky-400' },
  { keywords: ['security', 'safety', 'shield'], icon: Shield, color: 'bg-slate-600' },
  { keywords: ['fashion', 'apparel', 'cloth', 'boutique', 'shirt', 'tshirt', 'thrift'], icon: Shirt, color: 'bg-fuchsia-500' },
  { keywords: ['tech', 'software', 'saas', 'it', 'data', 'programming', 'digital', 'app', 'web', 'ai', 'artificial', 'robot', 'cyber'], icon: Laptop, color: 'bg-indigo-600' },
  { keywords: ['gaming', 'game', 'video game', 'esport', 'pubg', 'discord', 'twitch'], icon: Gamepad2, color: 'bg-purple-600' },
  { keywords: ['charity', 'nonprofit', 'caring'], icon: HeartHandshake, color: 'bg-emerald-500' },
  { keywords: ['eco', 'environment', 'green', 'solar', 'nature', 'organic', 'recycle'], icon: Leaf, color: 'bg-green-600' },
  { keywords: ['farm', 'agriculture', 'lawn'], icon: TreePine, color: 'bg-green-700' },
  { keywords: ['sun', 'energy', 'power'], icon: Sun, color: 'bg-amber-500' },
  { keywords: ['night', 'dark', 'moon'], icon: Moon, color: 'bg-slate-800' },
  { keywords: ['electric', 'electron', 'bolt', 'zap'], icon: Zap, color: 'bg-yellow-500' },
  { keywords: ['truck', 'transport', 'shipping', 'delivery', 'logistic', 'moving', 'mover'], icon: Truck, color: 'bg-slate-600' },
  { keywords: ['car', 'auto', 'vehicle', 'car wash'], icon: Car, color: 'bg-blue-600' },
  { keywords: ['plumb', 'handyman', 'maintenance', 'repair', 'hvac', 'contractor', 'builder', 'roofing', 'flooring', 'remodel'], icon: Wrench, color: 'bg-orange-700' },
  { keywords: ['medical', 'health', 'clinic', 'dentist', 'dental', 'doctor', 'nurse', 'wellness', 'drug', 'pharma', 'nutrition', 'laborator'], icon: Stethoscope, color: 'bg-teal-500' },
  { keywords: ['jewel', 'diamond', 'gold', 'gem', 'silver'], icon: Gem, color: 'bg-amber-500' },
  { keywords: ['crown', 'luxury', 'royal', 'premium'], icon: Crown, color: 'bg-amber-600' },
  { keywords: ['mountain', 'outdoor', 'camp', 'hiking', 'hunt', 'adventure'], icon: Mountain, color: 'bg-emerald-700' },
  { keywords: ['beach', 'vacation', 'wave', 'ocean', 'surf', 'swim'], icon: Waves, color: 'bg-cyan-500' },
  { keywords: ['space', 'rocket', 'futur', 'metaverse', 'vr'], icon: Rocket, color: 'bg-indigo-600' },
  { keywords: ['fish', 'dolphin', 'aqua'], icon: Fish, color: 'bg-blue-500' },
  { keywords: ['bird', 'eagle', 'hawk'], icon: Bird, color: 'bg-sky-600' },
  { keywords: ['cat', 'pet', 'animal', 'dog', 'horse', 'monkey', 'chicken', 'elephant', 'wolf', 'lion', 'dragon'], icon: Cat, color: 'bg-amber-600' },
  { keywords: ['law', 'legal', 'lawyer', 'attorney', 'advocate'], icon: Scale, color: 'bg-slate-700' },
  { keywords: ['real estate', 'realtor', 'property', 'architect', 'interior'], icon: Building, color: 'bg-emerald-600' },
  { keywords: ['home', 'house', 'furniture', 'decor', 'laundry', 'cleaning', 'kitchen'], icon: Home, color: 'bg-orange-500' },
  { keywords: ['invest', 'finance', 'account', 'bank', 'payment', 'trade', 'insurance', 'crypto', 'bitcoin', 'blockchain', 'nft'], icon: DollarSign, color: 'bg-green-600' },
  { keywords: ['coach', 'consult', 'business', 'corporate', 'management', 'hr', 'startup', 'agency', 'freelan', 'advisor', 'solution'], icon: Briefcase, color: 'bg-slate-700' },
  { keywords: ['market', 'brand', 'social media', 'blog', 'media', 'communication'], icon: Radio, color: 'bg-blue-500' },
  { keywords: ['shop', 'store', 'ecommerce', 'online', 'grocery'], icon: Store, color: 'bg-red-500' },
  { keywords: ['studio', 'workshop', 'print'], icon: Monitor, color: 'bg-slate-600' },
  { keywords: ['school', 'learn', 'study', 'education', 'training', 'tutor'], icon: GraduationCap, color: 'bg-blue-600' },
  { keywords: ['wedding', 'event', 'party', 'anniversary', 'dating', 'love'], icon: Heart, color: 'bg-rose-500' },
  { keywords: ['candle', 'hobby', 'lifestyle'], icon: Sparkles, color: 'bg-amber-400' },
  { keywords: ['travel', 'tour', 'hotel', 'flight', 'passport'], icon: Plane, color: 'bg-sky-500' },
  { keywords: ['abstract', 'geometric', 'minimal', 'simple', 'modern', 'gradient', 'retro', 'vintage', 'cool', 'colorful', 'funky', 'fun'], icon: Palette, color: 'bg-violet-500' },
  { keywords: ['pest', 'control', 'exterminator'], icon: Shield, color: 'bg-red-600' },
  { keywords: ['tattoo', 'ink'], icon: Paintbrush, color: 'bg-slate-800' },
  { keywords: ['cannabis', 'weed'], icon: Leaf, color: 'bg-green-500' },
  { keywords: ['yoga'], icon: HeartHandshake, color: 'bg-purple-400' },
  { keywords: ['drone'], icon: Rocket, color: 'bg-sky-600' },
  { keywords: ['personal', 'signature', 'monogram', 'initial', 'letter', 'font', 'text', 'wordmark', 'acronym'], icon: BookOpen, color: 'bg-slate-500' },
  { keywords: ['flag', 'political', 'public'], icon: Globe, color: 'bg-blue-700' },
];

function getIconForName(name) {
  const lower = name.toLowerCase();
  for (const entry of keywordIconMap) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) return { icon: entry.icon, color: entry.color };
    }
  }
  return { icon: Briefcase, color: 'bg-slate-500' };
}

const BATCH = 20;

const Category = ({ onNext, onBack, data, setData }) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [mainIndustries, setMainIndustries] = useState([]);
  const [otherIndustries, setOtherIndustries] = useState([]);
  const [othersLoaded, setOthersLoaded] = useState(0);

  const fetchIndustries = async () => {
    try {
      const res = await fetch('/api/industries');
      const apiData = await res.json();

      const usedIcons = new Set();
      let mainInds = [];
      if (apiData?.industry) {
        mainInds = apiData.industry.map(item => {
          const icon = iconMapping[item.cate_name]?.icon || Briefcase;
          usedIcons.add(icon);
          return {
            id: item.cat_id,
            name: item.cate_name,
            icon,
            color: iconMapping[item.cate_name]?.color || 'bg-slate-500'
          };
        });
        setMainIndustries(mainInds);
      }

      if (apiData?.noiconIndustry) {
        const fallbackIcons = [
          Briefcase, Coffee, Camera, Music, Flower2, Paintbrush,
          Scissors, Pizza, Bike, Church, Baby, Shield, Shirt,
          Laptop, Film, HeartHandshake, Leaf, Sun, Moon, Zap,
          Truck, Wrench, Stethoscope, Gem, Crown, Mountain,
          Waves, Palette, Rocket, TreePine, Fish, Bird,
          Cat, Scale, Mic, Radio, Store, Home, Monitor,
          Clapperboard, GraduationCap, Headphones,
        ];
        const fallbackColors = [
          'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
          'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500',
          'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
          'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
          'bg-pink-500', 'bg-rose-500'
        ];
        
        let fallbackIndex = 0;
        let colorIndex = 0;

        setOtherIndustries(apiData.noiconIndustry.map(item => {
          let match = getIconForName(item.cate_name);
          
          if (usedIcons.has(match.icon) || match.icon === Briefcase) {
            // Find next unused fallback icon
            while (fallbackIndex < fallbackIcons.length && usedIcons.has(fallbackIcons[fallbackIndex])) {
              fallbackIndex++;
            }
            if (fallbackIndex < fallbackIcons.length) {
              match.icon = fallbackIcons[fallbackIndex];
              usedIcons.add(match.icon);
            }
            match.color = fallbackColors[colorIndex % fallbackColors.length];
            colorIndex++;
          } else {
             usedIcons.add(match.icon);
          }

          return {
            id: item.cat_id,
            name: item.cate_name,
            icon: match.icon,
            color: match.color,
          };
        }));
      }
    } catch (error) {
      console.error("Failed to fetch industries", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIndustries(); }, []);

  const handleSelect = (item) => {
    setData({ ...data, category: item.name, industry: item.id });
  };

  const handleContinue = useCallback(() => {
    if (!data?.category || !data?.industry) return;
    dispatch(updateFormData({ industryId: data.industry }));
    onNext();
  }, [data, dispatch, onNext]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Enter' && data?.category) { e.preventDefault(); handleContinue(); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [data?.category, handleContinue]);

  const loadMore = () => {
    setOthersLoaded(prev => prev + BATCH);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  const visibleOthers = otherIndustries.slice(0, othersLoaded);
  const hasMore = othersLoaded < otherIndustries.length;
  const isOtherSelected = data?.industry && !mainIndustries.find(m => m.id === data.industry);
  const allItems = [...mainIndustries, ...visibleOthers];

  const GRID = "grid w-full grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 md:gap-2.5";

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── FIXED TOP: Heading + Buttons (never scrolls) ── */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-md pb-4 pt-6 md:pb-5 md:pt-8 w-full max-w-6xl mx-auto px-2 md:px-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
          <div className="text-center md:text-left mb-3 md:mb-0">
            <h1 className="mb-1 text-2xl font-black leading-tight tracking-tight text-[#1A1A1A] md:text-3xl">
              Choose Your Industry
            </h1>
            <p className="text-xs font-medium leading-relaxed text-slate-600 md:text-sm">
              Select the category that best fits your brand
            </p>
          </div>
          <div className="flex flex-row items-center justify-center gap-2 md:gap-3 w-full md:w-auto">
            <button onClick={onBack} className="brand-button-outline w-1/2 md:w-auto rounded-2xl py-2.5 px-6 text-sm font-bold">
              Go Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!data?.category}
              className={`w-1/2 md:w-auto rounded-2xl py-2.5 px-8 text-sm font-black transition-all duration-300 ${data?.category
                ? 'brand-button-primary hover:scale-[1.02] shadow-pink-500/30'
                : 'cursor-not-allowed bg-slate-200 opacity-60'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE: Card grid area ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden pb-6 px-2 md:px-3">
        {loading ? (
          <div className={GRID}>
            {[...Array(21)].map((_, i) => (
              <div key={i} className="min-h-[90px] sm:min-h-[100px] md:min-h-[120px] rounded-[0.95rem] md:rounded-[1.15rem] bg-slate-100 animate-pulse border-2 border-transparent" />
            ))}
          </div>
        ) : (
          <div className={GRID}>
            {allItems.map((item) => {
              const IconComponent = item.icon;
              const isSelected = data?.category === item.name;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`relative flex min-h-[90px] sm:min-h-[100px] md:min-h-[120px] flex-col items-center justify-center rounded-[0.95rem] border-2 p-2 transition-all duration-300 md:rounded-[1.15rem] md:p-3 ${isSelected
                    ? 'z-10 scale-105 border-pink-400 bg-white shadow-2xl'
                    : 'border-transparent bg-white/70 hover:border-slate-200 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`${item.color} mb-1.5 rounded-lg p-2 text-white shadow-lg md:mb-2.5 md:p-3`}>
                    <IconComponent className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <span className={`text-center text-[10px] font-bold leading-snug sm:text-[11px] md:text-[14px] ${isSelected ? 'text-black' : 'text-slate-600'}`}>
                    {item.name}
                  </span>
                  {isSelected && (
                    <div className="absolute -right-2 -top-2 rounded-full border-2 border-white bg-linear-to-r from-pink-500 to-orange-400 p-1.5 shadow-lg md:-right-3 md:-top-3 md:border-4 md:p-2">
                      <Check className="h-4 w-4 text-white md:h-6 md:w-6" strokeWidth={4} />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Others / Load More — last card */}
            {hasMore && (
              <button
                onClick={loadMore}
                className={`relative flex min-h-[90px] sm:min-h-[100px] md:min-h-[120px] flex-col items-center justify-center rounded-[0.95rem] border-2 border-dashed p-2 transition-all duration-300 md:rounded-[1.15rem] md:p-3 border-slate-300 bg-slate-50/50 hover:border-pink-300 hover:bg-pink-50/30 hover:shadow-md`}
              >
                <div className={`mb-1.5 rounded-lg p-2 shadow-sm md:mb-2.5 md:p-3 bg-gradient-to-br from-pink-500 to-orange-400 text-white`}>
                  <ChevronDown className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <span className={`text-center text-[10px] font-bold leading-snug sm:text-[11px] md:text-[14px] text-pink-600`}>
                  {othersLoaded === 0 ? 'Others' : 'Load More'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
