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

export function generateSmartMockupPalette(logoColors) {
  if (!logoColors || logoColors.length === 0) {
    return ['#f8fafc', '#020617', '#f1f5f9'];
  }

  const hslColors = logoColors.map(c => rgbToHsl(c.r, c.g, c.b));
  const avgLuminance = hslColors.reduce((sum, c) => sum + c.l, 0) / hslColors.length;

  return hslColors.map((color, index) => {
    let targetL;
    // Map directly to logo's own hue for brand consistency
    let targetH = color.h; 
    let targetS = Math.min(color.s, 10); 

    if (avgLuminance > 55) {
      // Logo is bright: use a deep theme
      targetL = 6 + (index * 2.5);
      targetS = Math.max(targetS, 8);
    } else {
      // Logo is dark: use a light theme
      targetL = 98 - (index * 1.5);
      targetS = Math.min(targetS, 4);
    }

    return `hsl(${Math.round(targetH)}, ${Math.round(targetS)}%, ${Math.round(targetL)}%)`;
  });
}
