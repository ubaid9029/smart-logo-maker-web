export const BRAND_WATERMARK_SRC = '/logos/logo3.svg';
export const BRAND_WATERMARK_LIGHT_SRC = '/logos/logo3-light.svg';
export const BRAND_WATERMARK_TILE_SIZE = 92;
export const BRAND_WATERMARK_PATTERN_GAP = 44;
export const BRAND_WATERMARK_OPACITY = 0.16;
export const BRAND_WATERMARK_ROTATION = 30;
export const BRAND_WATERMARK_OVERLAY_INSET = '-20%';
export const BRAND_WATERMARK_OVERLAY_SCALE = 1.08;
export const BRAND_WATERMARK_DIAGONAL_LAYER_COUNT = 30;
export const BRAND_WATERMARK_DIAGONAL_IMAGE_RATIO = 0.26;
export const BRAND_WATERMARK_DIAGONAL_INNER_MARGIN_RATIO = 0.1;
export const BRAND_WATERMARK_GRID_COLUMNS = 3;
export const BRAND_WATERMARK_GRID_GAP_X_RATIO = 1.9;
export const BRAND_WATERMARK_GRID_GAP_Y_RATIO = 0.5;
export const BRAND_WATERMARK_GRID_ITEM_FILL_RATIO = 90;
export const BRAND_WATERMARK_REFERENCE_WIDTH = 340;
export const BRAND_WATERMARK_REFERENCE_HEIGHT = 250;

const parseColorToRgb = (value) => {
  const normalized = String(value || '').trim();
  const hexMatch = normalized.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  
  if (hexMatch) {
    const raw = hexMatch[1];
    const expanded = raw.length === 3
      ? raw.split('').map((char) => char + char).join('')
      : raw;
    
    return {
      r: Number.parseInt(expanded.slice(0, 2), 16),
      g: Number.parseInt(expanded.slice(2, 4), 16),
      b: Number.parseInt(expanded.slice(4, 6), 16),
    };
  }
  
  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const [r = 0, g = 0, b = 0] = rgbMatch[1]
      .split(',')
      .map((part) => Number(part.trim()));
    
    if ([r, g, b].every((channel) => Number.isFinite(channel))) {
      return {
        r: Math.max(0, Math.min(255, r)),
        g: Math.max(0, Math.min(255, g)),
        b: Math.max(0, Math.min(255, b)),
      };
    }
  }
  
  return null;
};

const getRelativeBrightness = (rgb) => {
  if (!rgb) return null;
  return ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
};

export const resolveBrandWatermarkAsset = (options = {}) => {
  const explicitHref = typeof options.watermarkHref === 'string' ? options.watermarkHref : '';
  if (explicitHref.trim()) {
    return explicitHref.trim();
  }

  const brightness = getRelativeBrightness(parseColorToRgb(options.backgroundColor));

  if (brightness !== null && brightness < 128) {
    return BRAND_WATERMARK_LIGHT_SRC;
  }

  return BRAND_WATERMARK_SRC;
};

export const getBrandWatermarkLayout = (width, height, options = {}) => {
  const safeWidth = Math.max(1, Number(width) || 0);
  const safeHeight = Math.max(1, Number(height) || 0);
  const referenceWidth = Math.max(1, Number(options.referenceWidth) || safeWidth);
  const referenceHeight = Math.max(1, Number(options.referenceHeight) || safeHeight);
  const layerCount = Math.max(1, Math.round(Number(options.layerCount) || BRAND_WATERMARK_DIAGONAL_LAYER_COUNT));
  const columns = Math.max(1, Math.round(Number(options.columns) || BRAND_WATERMARK_GRID_COLUMNS));
  const rows = Math.max(1, Math.ceil(layerCount / columns));
  const marginRatio = Math.max(0, Math.min(0.45, Number(options.innerMarginRatio) || BRAND_WATERMARK_DIAGONAL_INNER_MARGIN_RATIO));
  const marginX = referenceWidth * marginRatio;
  const marginY = referenceHeight * marginRatio;
  const containerWidth = Math.max(1, referenceWidth - (marginX * 2));
  const containerHeight = Math.max(1, referenceHeight - (marginY * 2));
  const baseGapX = containerWidth * BRAND_WATERMARK_GRID_GAP_X_RATIO;
  const baseGapY = containerHeight * BRAND_WATERMARK_GRID_GAP_Y_RATIO;
  const gapX = columns > 1 ? Math.min(baseGapX, containerWidth * 0.28) : 0;
  const gapY = rows > 1 ? Math.min(baseGapY, containerHeight * 0.3) : 0;
  const slotWidth = Math.max(1, (containerWidth - (gapX * (columns - 1))) / columns);
  const slotHeight = Math.max(1, (containerHeight - (gapY * (rows - 1))) / rows);
  const layerSize = Math.max(16, Math.min(slotWidth, slotHeight) * BRAND_WATERMARK_GRID_ITEM_FILL_RATIO);
  const scaleX = safeWidth / referenceWidth;
  const scaleY = safeHeight / referenceHeight;
  const sizeScale = Math.max(scaleX, scaleY);

  return {
    layerCount,
    columns,
    rows,
    marginX,
    marginY,
    containerWidth,
    containerHeight,
    gapX,
    gapY,
    slotWidth,
    slotHeight,
    layerSize: layerSize * sizeScale,
    opacity: BRAND_WATERMARK_OPACITY,
    rotation: BRAND_WATERMARK_ROTATION,
    layers: Array.from({ length: layerCount }, (_, index) => {
      const columnIndex = index % columns;
      const rowIndex = Math.floor(index / columns);
      const slotX = marginX + (columnIndex * (slotWidth + gapX));
      const slotY = marginY + (rowIndex * (slotHeight + gapY));
      const scaledSize = layerSize * sizeScale;

      return {
        x: (slotX + ((slotWidth - layerSize) / 2)) * scaleX,
        y: (slotY + ((slotHeight - layerSize) / 2)) * scaleY,
        size: scaledSize,
      };
    }),
  };
};
