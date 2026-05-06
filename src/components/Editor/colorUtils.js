// Utility to extract a palette of dominant colors from an image
export function extractPaletteFromImage(img, colorCount = 3) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 32, 32);
  const data = ctx.getImageData(0, 0, 32, 32).data;
  const colorMap = {};
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const key = `${Math.round(data[i] / 32) * 32},${Math.round(data[i + 1] / 32) * 32},${Math.round(data[i + 2] / 32) * 32}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }
  const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, colorCount).map(([rgb]) => {
    const parts = rgb.split(',').map(Number);
    return { r: parts[0], g: parts[1], b: parts[2] };
  });
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hueDistance(a, b) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function isHueUnique(candidateHue, sourceHues, minDistance = 40) {
  if (!sourceHues.length) return true;
  return sourceHues.every((hue) => hueDistance(candidateHue, hue) >= minDistance);
}

function pickUniqueHue(baseHue, sourceHues) {
  const offsets = [150, 210, 120, 240, 90, 270, 180, 60, 300, 30, 330];
  for (const offset of offsets) {
    const candidate = (baseHue + offset) % 360;
    if (isHueUnique(candidate, sourceHues, 40)) {
      return candidate;
    }
  }

  // Fallback for very wide/multi-color logos: take the farthest hue from all logo hues.
  let bestHue = (baseHue + 180) % 360;
  let bestScore = -1;
  for (let h = 0; h < 360; h += 5) {
    const score = sourceHues.length
      ? Math.min(...sourceHues.map((sourceHue) => hueDistance(h, sourceHue)))
      : 180;
    if (score > bestScore) {
      bestScore = score;
      bestHue = h;
    }
  }
  return bestHue;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatHsl(h, s, l) {
  return `hsl(${Math.round((h % 360 + 360) % 360)}, ${Math.round(clamp(s, 0, 100))}%, ${Math.round(clamp(l, 0, 100))}%)`;
}

function buildSoftGradient(hslColors, mode, hasVeryBrightElements, hasBlackElements) {
  const lightStops = hasVeryBrightElements
    ? [
      formatHsl(36, 10, 98),
      formatHsl(214, 9, 94),
      formatHsl(220, 10, 90),
    ]
    : [
      formatHsl(210, 8, 98),
      formatHsl(220, 7, 95),
      formatHsl(210, 8, 92),
    ];

  const darkStops = hasBlackElements
    ? [
      formatHsl(220, 8, 34),
      formatHsl(225, 8, 40),
      formatHsl(220, 9, 46),
    ]
    : [
      formatHsl(220, 7, 30),
      formatHsl(225, 8, 36),
      formatHsl(220, 7, 42),
    ];

  if (mode === 'light') {
    return `radial-gradient(circle at 18% 16%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.76) 24%, rgba(255,255,255,0) 64%), linear-gradient(135deg, ${lightStops[0]} 0%, ${lightStops[1]} 54%, ${lightStops[2]} 100%)`;
  }

  return `radial-gradient(circle at 18% 16%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 22%, rgba(255,255,255,0) 62%), linear-gradient(135deg, ${darkStops[0]} 0%, ${darkStops[1]} 54%, ${darkStops[2]} 100%)`;
}

export function generateSmartMockupPalette(logoColors) {
  if (!logoColors || logoColors.length === 0) {
    return ['#f8fafc', '#1e293b', '#f1f5f9'];
  }

  const hslColors = logoColors.map(c => rgbToHsl(c.r, c.g, c.b));
  const avgLuminance = hslColors.reduce((sum, c) => sum + c.l, 0) / hslColors.length;

  const vividHues = hslColors.filter((c) => c.s >= 12).map((c) => c.h);
  const hasBlackElements = hslColors.some((c) => c.l <= 14 && c.s <= 35);
  const hasVeryBrightElements = hslColors.some((c) => c.l >= 82);

  const lightGradient = buildSoftGradient(hslColors, 'light', hasVeryBrightElements, hasBlackElements);
  const darkGradient = buildSoftGradient(hslColors, 'dark', hasVeryBrightElements, hasBlackElements);

  const accentHue = 220;
  const accentSat = hasVeryBrightElements ? 8 : 6;
  const accentLum = hasVeryBrightElements ? 94 : 86;

  return [
    lightGradient,
    darkGradient,
    `hsl(${Math.round(accentHue)}, ${accentSat}%, ${accentLum}%)`,
  ];
}
