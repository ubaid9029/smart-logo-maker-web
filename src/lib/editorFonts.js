const RAW_EDITOR_FONT_CATALOG = [
  { id: 'inter', family: 'Inter', queryFamily: 'Inter', weight: 500, previewText: 'Brand' },
  { id: 'manrope', family: 'Manrope', queryFamily: 'Manrope', weight: 600, previewText: 'Clarity' },
  { id: 'plus-jakarta-sans', family: 'Plus Jakarta Sans', queryFamily: 'Plus Jakarta Sans', weight: 600, previewText: 'Jakarta' },
  { id: 'dm-sans', family: 'DM Sans', queryFamily: 'DM Sans', weight: 500, previewText: 'Modern' },
  { id: 'urbanist', family: 'Urbanist', queryFamily: 'Urbanist', weight: 600, previewText: 'Urban' },
  { id: 'sora', family: 'Sora', queryFamily: 'Sora', weight: 600, previewText: 'Future' },
  { id: 'bebas-neue', family: 'Bebas Neue', queryFamily: 'Bebas Neue', weight: 400, previewText: 'POSTER' },
  { id: 'oswald', family: 'Oswald', queryFamily: 'Oswald', weight: 600, previewText: 'Narrow' },
  { id: 'barlow-condensed', family: 'Barlow Condensed', queryFamily: 'Barlow Condensed', weight: 600, previewText: 'Condensed' },
  { id: 'rajdhani', family: 'Rajdhani', queryFamily: 'Rajdhani', weight: 600, previewText: 'Tech' },
  { id: 'space-grotesk', family: 'Space Grotesk', queryFamily: 'Space Grotesk', weight: 600, previewText: 'Orbit' },
  { id: 'abril-fatface', family: 'Abril Fatface', queryFamily: 'Abril Fatface', weight: 400, previewText: 'Fashion' },
  { id: 'cinzel', family: 'Cinzel', queryFamily: 'Cinzel', weight: 700, previewText: 'Empire' },
  { id: 'syne', family: 'Syne', queryFamily: 'Syne', weight: 700, previewText: 'Syne' },
  { id: 'archivo-black', family: 'Archivo Black', queryFamily: 'Archivo Black', weight: 400, previewText: 'Impact' },
  { id: 'anton', family: 'Anton', queryFamily: 'Anton', weight: 400, previewText: 'Punch' },
  { id: 'league-spartan', family: 'League Spartan', queryFamily: 'League Spartan', weight: 700, previewText: 'Spartan' },
  { id: 'fjalla-one', family: 'Fjalla One', queryFamily: 'Fjalla One', weight: 400, previewText: 'Headline' },
  { id: 'josefin-sans', family: 'Josefin Sans', queryFamily: 'Josefin Sans', weight: 600, previewText: 'Elegant' },
  { id: 'fraunces', family: 'Fraunces', queryFamily: 'Fraunces', weight: 600, previewText: 'Modern' },
  { id: 'playfair-display', family: 'Playfair Display', queryFamily: 'Playfair Display', weight: 700, previewText: 'Luxury' },
  { id: 'merriweather', family: 'Merriweather', queryFamily: 'Merriweather', weight: 700, previewText: 'Editorial' },
  { id: 'cormorant-garamond', family: 'Cormorant Garamond', queryFamily: 'Cormorant Garamond', weight: 600, previewText: 'Classic' },
  { id: 'bodoni-moda', family: 'Bodoni Moda', queryFamily: 'Bodoni Moda', weight: 700, previewText: 'Bodoni' },
  { id: 'prata', family: 'Prata', queryFamily: 'Prata', weight: 400, previewText: 'Prata' },
  { id: 'libre-baskerville', family: 'Libre Baskerville', queryFamily: 'Libre Baskerville', weight: 700, previewText: 'Serif' },
  { id: 'lora', family: 'Lora', queryFamily: 'Lora', weight: 700, previewText: 'Lora' },
  { id: 'crimson-text', family: 'Crimson Text', queryFamily: 'Crimson Text', weight: 600, previewText: 'Crimson' },
  { id: 'ibm-plex-mono', family: 'IBM Plex Mono', queryFamily: 'IBM Plex Mono', weight: 500, previewText: 'Mono' },
  { id: 'space-mono', family: 'Space Mono', queryFamily: 'Space Mono', weight: 700, previewText: 'Code' },
  { id: 'jetbrains-mono', family: 'JetBrains Mono', queryFamily: 'JetBrains Mono', weight: 600, previewText: 'Pixels' },
  { id: 'pacifico', family: 'Pacifico', queryFamily: 'Pacifico', weight: 400, previewText: 'Script' },
  { id: 'great-vibes', family: 'Great Vibes', queryFamily: 'Great Vibes', weight: 400, previewText: 'Signature' },
  { id: 'dancing-script', family: 'Dancing Script', queryFamily: 'Dancing Script', weight: 700, previewText: 'Dancing' },
  { id: 'caveat', family: 'Caveat', queryFamily: 'Caveat', weight: 700, previewText: 'Sketch' },
];

export const DEFAULT_EDITOR_FONT_FAMILY = RAW_EDITOR_FONT_CATALOG[0].family;

export const buildEditorFontProxyUrl = ({
  family,
  weight = 400,
} = {}) => {
  if (typeof family !== 'string' || !family.trim()) {
    return null;
  }

  const params = new URLSearchParams({
    family: family.trim(),
    weight: String(Number(weight) || 400),
  });

  return `/api/font-proxy?${params.toString()}`;
};

export const EDITOR_FONT_CATALOG = RAW_EDITOR_FONT_CATALOG.map((font) => ({
  ...font,
  label: font.family,
  previewText: font.previewText || font.family,
  fontUrl: buildEditorFontProxyUrl({ family: font.family, weight: font.weight || 400 }),
}));

export const getEditorFontOption = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object' && typeof value.family === 'string') {
    return EDITOR_FONT_CATALOG.find((font) => font.family === value.family) || null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  return EDITOR_FONT_CATALOG.find((font) => font.family === value) || null;
};

export const getEditorFontUrl = (value) => getEditorFontOption(value)?.fontUrl || null;

export const getEditorFontFaceCss = () => EDITOR_FONT_CATALOG.map((font) => (
  `@font-face{font-family:"${font.family}";src:url("${font.fontUrl}");font-style:normal;font-weight:${font.weight || 400};font-display:swap;}`
)).join('');
