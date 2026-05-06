'use client';

import Image from 'next/image';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { extractPaletteFromImage, generateSmartMockupPalette } from './colorUtils';

const MOCKUP_ITEMS = [
  {
    id: 'card',
    label: 'Card',
    src: '/assets/mockups/card.svg',
    type: 'card',
  },
  {
    id: 'mug',
    label: 'Mug',
    src: '/assets/mockups/mug.svg',
    type: 'mug',
  },
  {
    id: 'tshirt',
    label: 'T-Shirt',
    src: '/assets/mockups/t-shirt.svg',
    type: 'tshirt',
  },
  {
    id: 'mobile',
    label: 'Mobile',
    src: '/assets/mockups/mobile.svg',
    type: 'mobile',
  },
  {
    id: 'laptop',
    label: 'Laptop',
    src: '/assets/mockups/laptop.svg',
    type: 'laptop',
  },
  {
    id: 'billboard',
    label: 'Billboard',
    src: '/assets/mockups/billboard.svg',
    type: 'billboard',
  },
  {
    id: 'bottle',
    label: 'Bottle',
    src: '/assets/mockups/bottel.svg',
    type: 'bottle',
  },
];

const MOCKUP_SCENES = {
  card: {
    viewBox: '0 0 1000 1000',
    className: 'animate-[float_3s_ease-in-out_infinite]',
    items: [
      {
        kind: 'image',
        href: '/assets/mockups/card.svg',
        x: -400,
        y: -390,
        width: 1800,
        height: 1800,
        opacity: 1,
        rotate: 0,
      },
      {
        kind: 'logo',
        x: 240,
        y: 600,
        width: 650,
        height: 330,
        opacity: 1,
        // transform: 'translate(-125 -125)',
        rotate: 31,
      },
      {
        kind: 'logo',
        x: 600,
        y: 400,
        width: 650,
        height: 400,
        opacity: 1,
        rotate: 31,
      },
    ],
  },
  mug: {
    viewBox: '0 0 1000 1000',
    className: 'animate-[float_4.2s_ease-in-out_infinite]',
    items: [
      {
        kind: 'image',
        href: '/assets/mockups/mug.svg',
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
      },
      {
        kind: 'logo',
        x: 310,
        y: 510,
        width: 300,
        height: 240,
        opacity: 1,
        rotate: 0,
      },
      {
        kind: 'logo',
        x: 720,
        y: 530,
        width: 300,
        height: 240,
        opacity: 1,
        rotate: -22,
      },
    ],
  },
  tshirt: {
    viewBox: '0 0 1000 1000',
    className: 'animate-[float_3.8s_ease-in-out_infinite]',
    items: [
      {
        kind: 'image',
        href: '/assets/mockups/t-shirt.svg',
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
        rotate: 20,
      },
      {
        kind: 'logo',
        x: 255,
        y: 486,
        width: 350,
        height: 350,
        opacity: 1,
        rotate: 0,
      },
      {
        kind: 'logo',
        x: 720,
        y: 486,
        width: 350,
        height: 350,
        opacity: 1,
        rotate: 0,
      },
    ],
  },
  mobile: {
    viewBox: '0 0 1000 1000',
    className: 'animate-[float_3s_ease-in-out_infinite]',
    items: [
      {
        kind: 'image',
        href: '/assets/mockups/mobile.svg',
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
      },
      {
        kind: 'logo',
        x: 300,
        y: 395,
        width: 400,
        height: 250,
        opacity: 1,
        rotate: 78,
      },
      {
        kind: 'logo',
        x: 710,
        y: 402,
        width: 400,
        height: 250,
        opacity: 1,
        rotate: -78,
      },
    ],
  },
  laptop: {
    viewBox: '0 0 1000 1000',
    className: 'animate-[float_3.4s_ease-in-out_infinite]',
    items: [
      {
        kind: 'image',
        href: '/assets/mockups/laptop.svg',
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
        rotate: 10,
      },
      {
        kind: 'logo',
        x: 400,
        y: 320,
        width: 420,
        height: 310,
        opacity: 1,
        rotate: -2,
      },
     {
        kind: 'logo',
        x: 800,
        y: 670,
        width: 230,
        height: 120,
        opacity: 1,
        rotate: -75,
      },
    ],
  },
  billboard: {
    viewBox: '0 0 1000 1000',
    className: 'animate-[float_3.6s_ease-in-out_infinite]',
    items: [
      {
        kind: 'image',
        href: '/assets/mockups/billboard.svg',
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
      },
      {
        kind: 'logo',
        x: 500,
        y: 460,
        width: 930,
        height: 190,
        opacity: 1,
        rotate: 0,
      },
    ],
  },
  bottle: {
    viewBox: '0 0 1000 1000',
    className: 'animate-[float_3.7s_ease-in-out_infinite]',
    items: [
      {
        kind: 'image',
        href: '/assets/mockups/bottel.svg',
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
      },
      {
        kind: 'logo',
        x: 430,
        y: 560,
        width: 460,
        height: 240,
        opacity: 1,
        rotate: 96,
      },
    ],
  },
};

function SvgSceneImage({ item }) {
  const transform = item.transform ?? (item.rotate ? `rotate(${item.rotate} ${item.x + item.width / 2} ${item.y + item.height / 2})` : undefined);

  return (
    <image
      href={item.href}
      x={item.x}
      y={item.y}
      width={item.width}
      height={item.height}
      preserveAspectRatio="xMidYMid meet"
      opacity={item.opacity ?? 1}
      transform={transform}
    />
  );
}

function SvgSceneLogo({ item, logoUrl }) {
  const translateX = item.x - item.width / 2;
  const translateY = item.y - item.height / 2;
  const rotate = item.rotate || 0;

  return (
    <g transform={`translate(${translateX} ${translateY}) rotate(${rotate} ${item.width / 2} ${item.height / 2})`} opacity={item.opacity ?? 1}>
      <image href={logoUrl} x={0} y={0} width={item.width} height={item.height} preserveAspectRatio="xMidYMid meet" />
    </g>
  );
}

function MockupCanvas({ item, logoUrl }) {
  const scene = MOCKUP_SCENES[item.type];

  if (!scene) {
    return null;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <div className={`absolute inset-0 ${scene.className}`}>
        <svg viewBox={scene.viewBox} preserveAspectRatio="xMidYMid meet" className="block h-full w-full">
          {scene.items.map((sceneItem, sceneIndex) => {
            if (sceneItem.kind === 'image') {
              return <SvgSceneImage key={`${item.type}-image-${sceneIndex}`} item={sceneItem} />;
            }

            if (!logoUrl) {
              return null;
            }

            return <SvgSceneLogo key={`${item.type}-logo-${sceneIndex}`} item={sceneItem} logoUrl={logoUrl} />;
          })}
        </svg>
      </div>
    </div>
  );
}

export default function MockupPreviewGallery({ logoUrl, fullscreen = false, onBack }) {
  const [palette, setPalette] = React.useState(['#f8fafc', '#020617', '#e2e8f0']);
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0);

  React.useEffect(() => {
    setActiveSlideIndex(0);
  }, [logoUrl]);

  React.useEffect(() => {
    if (!logoUrl || typeof window === 'undefined') {
      setPalette(['#f8fafc', '#020617', '#e2e8f0']);
      return undefined;
    }

    let cancelled = false;
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (cancelled) {
        return;
      }

      const logoColors = extractPaletteFromImage(image, 3);
      const nextPalette = generateSmartMockupPalette(logoColors);
      if (nextPalette && nextPalette.length >= 3) {
        setPalette(nextPalette);
      }
    };
    image.onerror = () => {
      if (!cancelled) {
        setPalette(['#f8fafc', '#020617', '#e2e8f0']);
      }
    };
    image.src = logoUrl;

    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  const cardSurfaceStyles = React.useMemo(() => {
    const lightSurfaceBg = palette[0] || 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 54%, #e2e8f0 100%)';
    const darkSurfaceBg = palette[1] || 'linear-gradient(135deg, #1e293b 0%, #334155 54%, #475569 100%)';
    const accentSurface = palette[2] || '#e2e8f0';

    return {
      whiteCard: {
        background: lightSurfaceBg,
      },
      blackCard: {
        background: darkSurfaceBg,
      },
      whiteAccent: accentSurface,
      darkAccent: accentSurface,
    };
  }, [palette]);

  const activeItem = MOCKUP_ITEMS[activeSlideIndex] || MOCKUP_ITEMS[0];

  const goToPrevious = React.useCallback(() => {
    setActiveSlideIndex((currentIndex) => (currentIndex - 1 + MOCKUP_ITEMS.length) % MOCKUP_ITEMS.length);
  }, []);

  const goToNext = React.useCallback(() => {
    setActiveSlideIndex((currentIndex) => (currentIndex + 1) % MOCKUP_ITEMS.length);
  }, []);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(0deg);
          }
        }
        @keyframes float-dark {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(0deg);
          }
        }
      `}</style>
      <div className={`relative flex w-full flex-col overflow-hidden bg-transparent ${fullscreen ? 'h-full min-h-[70vh]' : 'h-[min(74vh,820px)] sm:h-[min(72vh,760px)]'}`}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="relative z-30 mb-4 inline-flex w-fit self-start shrink-0 items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-black/60"
          >
            <ArrowLeft size={16} />
            Back to Simple View
          </button>
        )}

        <div className="relative min-h-0 flex-1 w-full">
          <MockupCanvas item={activeItem} logoUrl={logoUrl} />

          {MOCKUP_ITEMS.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                className={`absolute bottom-6 left-0 z-20 rounded-full border border-white/20 bg-white/90 text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.18)] transition-all hover:scale-105 hover:bg-white ${fullscreen ? 'h-12 w-12' : 'h-10 w-10'}`}
                aria-label="Previous mockup"
              >
                <span className="text-xl leading-none">‹</span>
              </button>

              <button
                type="button"
                onClick={goToNext}
                className={`absolute bottom-6 right-0 z-20 rounded-full border border-white/20 bg-white/90 text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.18)] transition-all hover:scale-105 hover:bg-white ${fullscreen ? 'h-12 w-12' : 'h-10 w-10'}`}
                aria-label="Next mockup"
              >
                <span className="text-xl leading-none">›</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
