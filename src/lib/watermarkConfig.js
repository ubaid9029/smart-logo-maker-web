export const BRAND_WATERMARK_SRC = '/logos/logo3.svg';
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
export const BRAND_WATERMARK_GRID_GAP_Y_RATIO = 0.3;
export const BRAND_WATERMARK_GRID_ITEM_FILL_RATIO = 90;

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
  const watermarkHref = typeof options.watermarkHref === 'string' && options.watermarkHref.trim()
    ? options.watermarkHref.trim()
    : BRAND_WATERMARK_SRC;
  const layerCount = Math.max(1, Math.round(Number(options.layerCount) || BRAND_WATERMARK_DIAGONAL_LAYER_COUNT));
  const marginRatio = Math.max(0, Math.min(0.45, Number(options.innerMarginRatio) || BRAND_WATERMARK_DIAGONAL_INNER_MARGIN_RATIO));
  const marginX = width * marginRatio;
  const marginY = height * marginRatio;
  const columns = Math.max(1, Math.round(Number(options.columns) || BRAND_WATERMARK_GRID_COLUMNS));
  const rows = Math.max(1, Math.ceil(layerCount / columns));
  const containerX = minX + marginX;
  const containerY = minY + marginY;
  const containerWidth = Math.max(1, width - (marginX * 2));
  const containerHeight = Math.max(1, height - (marginY * 2));
  const baseGapX = containerWidth * BRAND_WATERMARK_GRID_GAP_X_RATIO;
  const baseGapY = containerHeight * BRAND_WATERMARK_GRID_GAP_Y_RATIO;
  const gapX = columns > 1 ? Math.min(baseGapX, containerWidth * 0.28) : 0;
  const gapY = rows > 1 ? Math.min(baseGapY, containerHeight * 0.3) : 0;
  const slotWidth = Math.max(1, (containerWidth - (gapX * (columns - 1))) / columns);
  const slotHeight = Math.max(1, (containerHeight - (gapY * (rows - 1))) / rows);
  const layerSize = Math.max(16, Math.min(slotWidth, slotHeight) * BRAND_WATERMARK_GRID_ITEM_FILL_RATIO);
  const imageLayersMarkup = Array.from({ length: layerCount }, (_, index) => {
    const columnIndex = index % columns;
    const rowIndex = Math.floor(index / columns);
    const slotX = containerX + (columnIndex * (slotWidth + gapX));
    const slotY = containerY + (rowIndex * (slotHeight + gapY));
    const layerX = slotX + ((slotWidth - layerSize) / 2);
    const layerY = slotY + ((slotHeight - layerSize) / 2);
    return `<image href="${watermarkHref}" x="${layerX.toFixed(2)}" y="${layerY.toFixed(2)}" width="${layerSize.toFixed(2)}" height="${layerSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />`;
  }).join('');

  const layerMarkup = [
    `<g data-brand-watermark="true" pointer-events="none" opacity="${BRAND_WATERMARK_OPACITY}" transform="rotate(${BRAND_WATERMARK_ROTATION} ${centerX.toFixed(2)} ${centerY.toFixed(2)})">`,
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
