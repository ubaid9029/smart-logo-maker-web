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

export const BRAND_WATERMARK_PATTERN_STYLE = {
  backgroundImage: `url("${BRAND_WATERMARK_SRC}")`,
  backgroundRepeat: 'repeat',
  backgroundSize: `${BRAND_WATERMARK_TILE_SIZE}px ${BRAND_WATERMARK_TILE_SIZE}px`,
  backgroundPosition: '0 0',
};

export const BRAND_WATERMARK_HTML_OVERLAY_STYLE = {
  ...BRAND_WATERMARK_PATTERN_STYLE,
  inset: BRAND_WATERMARK_OVERLAY_INSET,
  opacity: BRAND_WATERMARK_OPACITY,
  transform: `rotate(${BRAND_WATERMARK_ROTATION}deg) scale(${BRAND_WATERMARK_OVERLAY_SCALE})`,
  transformOrigin: 'center center',
};

const getSvgNumericBounds = (svgMarkup) => {
  const viewBoxMatch = svgMarkup.match(/viewBox="([^"]+)"/i);
  if (viewBoxMatch) {
    const [minX = 0, minY = 0, width = 340, height = 250] = viewBoxMatch[1]
      .split(/\s+/)
      .map(Number);

    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return {
        minX: Number.isFinite(minX) ? minX : 0,
        minY: Number.isFinite(minY) ? minY : 0,
        width,
        height,
      };
    }
  }

  const widthMatch = svgMarkup.match(/width="([^"]+)"/i);
  const heightMatch = svgMarkup.match(/height="([^"]+)"/i);
  const width = Number(widthMatch?.[1]);
  const height = Number(heightMatch?.[1]);

  return {
    minX: 0,
    minY: 0,
    width: Number.isFinite(width) && width > 0 ? width : 340,
    height: Number.isFinite(height) && height > 0 ? height : 250,
  };
};

const parseHexColor = (value) => {
  const normalized = String(value || '').trim();
  const match = normalized.match(/^#([\da-f]{3}|[\da-f]{6})$/i);

  if (!match) {
    return null;
  }

  const raw = match[1];
  const expanded = raw.length === 3
    ? raw.split('').map((char) => char + char).join('')
    : raw;

  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
};

const parseRgbColor = (value) => {
  const normalized = String(value || '').trim();
  const match = normalized.match(/^rgba?\(([^)]+)\)$/i);

  if (!match) {
    return null;
  }

  const [r = 0, g = 0, b = 0] = match[1]
    .split(',')
    .map((part) => Number(part.trim()));

  if (![r, g, b].every((channel) => Number.isFinite(channel))) {
    return null;
  }

  return {
    r: Math.max(0, Math.min(255, r)),
    g: Math.max(0, Math.min(255, g)),
    b: Math.max(0, Math.min(255, b)),
  };
};

const parseColorToRgb = (value) => parseHexColor(value) || parseRgbColor(value);

const getRelativeBrightness = (rgb) => {
  if (!rgb) {
    return null;
  }

  return ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
};

const extractSvgBackgroundColor = (svgMarkup) => {
  if (typeof svgMarkup !== 'string') {
    return null;
  }

  const rectMatches = [...svgMarkup.matchAll(/<rect\b[^>]*\bfill="([^"]+)"[^>]*>/gi)];

  for (const match of rectMatches) {
    const [, fill = ''] = match;
    const rgb = parseColorToRgb(fill);
    if (rgb) {
      return fill;
    }
  }

  return null;
};

const resolveWatermarkHref = (svgMarkup, explicitHref) => {
  if (typeof explicitHref === 'string' && explicitHref.trim()) {
    return explicitHref.trim();
  }

  const backgroundColor = extractSvgBackgroundColor(svgMarkup);
  const brightness = getRelativeBrightness(parseColorToRgb(backgroundColor));

  if (brightness !== null && brightness < 128) {
    return BRAND_WATERMARK_LIGHT_SRC;
  }

  return BRAND_WATERMARK_SRC;
};

export const resolveBrandWatermarkAsset = (options = {}) => {
  const explicitHref = typeof options.watermarkHref === 'string' ? options.watermarkHref : '';
  if (explicitHref.trim()) {
    return explicitHref.trim();
  }

  const brightness = getRelativeBrightness(
    parseColorToRgb(options.backgroundColor || extractSvgBackgroundColor(options.svgMarkup))
  );

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

export const injectBrandWatermarkIntoSvgMarkup = (svgMarkup, options = {}) => {
  if (typeof svgMarkup !== 'string' || !svgMarkup.includes('<svg')) {
    return svgMarkup;
  }

  if (svgMarkup.includes('data-brand-watermark="true"')) {
    return svgMarkup;
  }

  const openSvgTagMatch = svgMarkup.match(/<svg\b[^>]*>/i);
  if (!openSvgTagMatch) {
    return svgMarkup;
  }

  const { minX, minY, width, height } = getSvgNumericBounds(svgMarkup);
  const centerX = minX + (width / 2);
  const centerY = minY + (height / 2);
  const watermarkHref = resolveBrandWatermarkAsset({
    svgMarkup,
    backgroundColor: options.backgroundColor,
    watermarkHref: options.watermarkHref,
  });
  const layout = getBrandWatermarkLayout(width, height, options);
  const imageLayersMarkup = layout.layers.map((layer) => {
    const layerX = minX + layer.x;
    const layerY = minY + layer.y;
    return `<image href="${watermarkHref}" x="${layerX.toFixed(2)}" y="${layerY.toFixed(2)}" width="${layer.size.toFixed(2)}" height="${layer.size.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />`;
  }).join('');

  const layerMarkup = [
    `<g data-brand-watermark="true" pointer-events="none" opacity="${layout.opacity}" transform="rotate(${layout.rotation} ${centerX.toFixed(2)} ${centerY.toFixed(2)})">`,
    imageLayersMarkup,
    '</g>',
  ].join('');

  const withLayer = svgMarkup;
  const firstRectMatch = withLayer.match(/<rect\b[^>]*>/i);

  if (firstRectMatch) {
    return withLayer.replace(firstRectMatch[0], `${firstRectMatch[0]}${layerMarkup}`);
  }

  if (/<\/svg>\s*$/i.test(withLayer)) {
    return withLayer.replace(/<\/svg>\s*$/i, `${layerMarkup}</svg>`);
  }

  return withLayer;
};
