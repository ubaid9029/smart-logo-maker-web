import {
  CARD_HEIGHT,
  CARD_X,
  CARD_Y,
  EDITOR_FONT_FAMILIES,
  gradientDirectionOptions,
} from './editorConstants';
import { getEditorFontOption, DEFAULT_EDITOR_FONT_FAMILY } from '../../lib/editorFonts';

export const waitForNextFrame = () => new Promise((resolve) => {
  if (typeof window === 'undefined') {
    resolve();
    return;
  }

  window.requestAnimationFrame(() => resolve());
});

export const waitForFrames = async (count = 1) => {
  for (let index = 0; index < count; index += 1) {
    await waitForNextFrame();
  }
};

export const getCollectionNameByType = (type) => {
  if (type === 'logo') return 'logoItems';
  if (type === 'text') return 'textItems';
  return null;
};

export const getCanvasLayerKey = (type, id) => {
  if (!type || !id) {
    return null;
  }

  return `${type}:${id}`;
};

export const isBackgroundCanvasItem = (item) => Boolean(item?.isBackground);
export const isCanvasItemLocked = (item) => Boolean(item?.locked);

export const getCanvasItemByLayerKey = (logoItems = [], textItems = [], layerKey = '') => {
  const [type, id] = String(layerKey || '').split(':');
  const sourceItems = type === 'logo'
    ? (Array.isArray(logoItems) ? logoItems : [])
    : type === 'text'
      ? (Array.isArray(textItems) ? textItems : [])
      : [];

  return sourceItems.find((item) => item?.id === id) || null;
};

const toTitleCase = (value = '') => value
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const ASSET_LABEL_PATTERNS = [
  { pattern: /^bg[_-]?(\d+)$/i, label: 'Background' },
  { pattern: /^texture[_-]?(\d+)$/i, label: 'Texture' },
  { pattern: /^ef(\d+)$/i, label: 'Effect' },
  { pattern: /^art(\d+)$/i, label: 'Art' },
  { pattern: /^logo[_-]?(\d+)$/i, label: 'Logo' },
];

export const getAssetDisplayLabel = (assetPath = '', fallback = 'Image') => {
  if (typeof assetPath !== 'string' || !assetPath.trim()) {
    return fallback;
  }

  if (assetPath.startsWith('data:')) {
    return fallback;
  }

  const rawFileName = assetPath.split('/').pop() || '';
  const baseName = rawFileName.replace(/\.[a-z0-9]+$/i, '');

  if (!baseName) {
    return fallback;
  }

  for (const entry of ASSET_LABEL_PATTERNS) {
    const match = baseName.match(entry.pattern);
    if (match?.[1]) {
      return `${entry.label} ${match[1]}`;
    }
  }

  const normalized = baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return toTitleCase(normalized || fallback);
};

export const getCanvasItemDisplayLabel = (type, item) => {
  if (!item || typeof item !== 'object') {
    return 'Layer';
  }

  if (type === 'text') {
    return String(item.text || item.businessValue || 'Text').trim() || 'Text';
  }

  if (item.kind === 'shape' || item.type === 'shape') {
    return `${item.shapeType || 'shape'} shape`;
  }

  if (item.kind === 'line') {
    return 'Line';
  }

  if (typeof item.layerLabel === 'string' && item.layerLabel.trim()) {
    return item.layerLabel.trim();
  }

  return getAssetDisplayLabel(item.imageUrl, item.imageUrl?.startsWith('data:') ? 'Uploaded image' : 'Image');
};

export const syncCanvasLayerOrder = (layerOrder = [], logoItems = [], textItems = []) => {
  const logoKeys = (Array.isArray(logoItems) ? logoItems : [])
    .map((item) => getCanvasLayerKey('logo', item?.id))
    .filter(Boolean);
  const textKeys = (Array.isArray(textItems) ? textItems : [])
    .map((item) => getCanvasLayerKey('text', item?.id))
    .filter(Boolean);
  const knownKeys = new Set([...logoKeys, ...textKeys]);
  const nextOrder = [];
  const seenKeys = new Set();

  (Array.isArray(layerOrder) ? layerOrder : []).forEach((key) => {
    if (!knownKeys.has(key) || seenKeys.has(key)) {
      return;
    }

    seenKeys.add(key);
    nextOrder.push(key);
  });

  [...logoKeys, ...textKeys].forEach((key) => {
    if (!key || seenKeys.has(key)) {
      return;
    }

    seenKeys.add(key);
    nextOrder.push(key);
  });

  return nextOrder;
};

export const getOrderedCanvasItems = (logoItems = [], textItems = [], layerOrder = []) => {
  const logoMap = new Map((Array.isArray(logoItems) ? logoItems : []).map((item) => [getCanvasLayerKey('logo', item?.id), item]));
  const textMap = new Map((Array.isArray(textItems) ? textItems : []).map((item) => [getCanvasLayerKey('text', item?.id), item]));

  return syncCanvasLayerOrder(layerOrder, logoItems, textItems)
    .map((key) => {
      if (logoMap.has(key)) {
        return { type: 'logo', item: logoMap.get(key) };
      }

      if (textMap.has(key)) {
        return { type: 'text', item: textMap.get(key) };
      }

      return null;
    })
    .filter(Boolean);
};

export const canMoveCanvasLayers = (layerOrder = [], selectedKeysInput = [], direction = 'forward') => {
  const selectedKeys = selectedKeysInput instanceof Set
    ? selectedKeysInput
    : new Set(Array.isArray(selectedKeysInput) ? selectedKeysInput : [selectedKeysInput].filter(Boolean));
  const order = Array.isArray(layerOrder) ? layerOrder : [];

  if (!selectedKeys.size || !order.length) {
    return false;
  }

  if (direction === 'front') {
    return order.slice(-selectedKeys.size).some((key) => !selectedKeys.has(key));
  }

  if (direction === 'back') {
    return order.slice(0, selectedKeys.size).some((key) => !selectedKeys.has(key));
  }

  if (direction === 'forward') {
    return order.some((key, index) => (
      selectedKeys.has(key) &&
      index < order.length - 1 &&
      !selectedKeys.has(order[index + 1])
    ));
  }

  if (direction === 'backward') {
    return order.some((key, index) => (
      selectedKeys.has(key) &&
      index > 0 &&
      !selectedKeys.has(order[index - 1])
    ));
  }

  return false;
};

export const moveCanvasLayers = (layerOrder = [], selectedKeysInput = [], direction = 'forward') => {
  const selectedKeys = selectedKeysInput instanceof Set
    ? selectedKeysInput
    : new Set(Array.isArray(selectedKeysInput) ? selectedKeysInput : [selectedKeysInput].filter(Boolean));
  const order = [...(Array.isArray(layerOrder) ? layerOrder : [])];

  if (!selectedKeys.size || !order.length || !canMoveCanvasLayers(order, selectedKeys, direction)) {
    return order;
  }

  if (direction === 'front') {
    return [
      ...order.filter((key) => !selectedKeys.has(key)),
      ...order.filter((key) => selectedKeys.has(key)),
    ];
  }

  if (direction === 'back') {
    return [
      ...order.filter((key) => selectedKeys.has(key)),
      ...order.filter((key) => !selectedKeys.has(key)),
    ];
  }

  if (direction === 'forward') {
    for (let index = order.length - 2; index >= 0; index -= 1) {
      if (selectedKeys.has(order[index]) && !selectedKeys.has(order[index + 1])) {
        [order[index], order[index + 1]] = [order[index + 1], order[index]];
      }
    }

    return order;
  }

  if (direction === 'backward') {
    for (let index = 1; index < order.length; index += 1) {
      if (selectedKeys.has(order[index]) && !selectedKeys.has(order[index - 1])) {
        [order[index], order[index - 1]] = [order[index - 1], order[index]];
      }
    }
  }

  return order;
};

export const reorderCanvasLayerOrder = (layerOrder = [], draggedKey, targetKey) => {
  const order = [...(Array.isArray(layerOrder) ? layerOrder : [])];
  const draggedIndex = order.indexOf(draggedKey);
  const targetIndex = order.indexOf(targetKey);

  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
    return order;
  }

  const [draggedItem] = order.splice(draggedIndex, 1);
  const nextTargetIndex = order.indexOf(targetKey);
  order.splice(nextTargetIndex, 0, draggedItem);
  return order;
};

export const isValidHexColor = (value) => /^#([0-9A-F]{6})$/i.test(value || '');

export const normalizeHexColor = (value, fallback = '#111827') => {
  const next = (value || '').trim();
  if (!next) return fallback;

  const withHash = next.startsWith('#') ? next : `#${next}`;
  if (!/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(withHash)) {
    return fallback;
  }

  if (withHash.length === 4) {
    return `#${withHash[1]}${withHash[1]}${withHash[2]}${withHash[2]}${withHash[3]}${withHash[3]}`.toUpperCase();
  }

  return withHash.toUpperCase();
};

export const hexToRgb = (hex) => {
  const normalized = normalizeHexColor(hex);
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
};

export const rgbToHex = ({ r, g, b }) => {
  const toHex = (channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export const buildShadeScale = (baseHex, total = 10) => {
  const base = hexToRgb(baseHex);
  const safeTotal = Math.max(1, total);
  const shades = [normalizeHexColor(baseHex, '#111827')];

  for (let index = 1; index < safeTotal; index += 1) {
    const ratio = safeTotal === 1 ? 0 : index / (safeTotal - 1);
    const mixWithWhite = ratio * 0.9;

    shades.push(
      rgbToHex({
        r: base.r + (255 - base.r) * mixWithWhite,
        g: base.g + (255 - base.g) * mixWithWhite,
        b: base.b + (255 - base.b) * mixWithWhite,
      })
    );
  }

  return shades;
};

export const getLinearGradientCss = (direction, startColor, endColor) => {
  const selected = gradientDirectionOptions.find((option) => option.id === direction);
  const cssDirection = selected?.cssDirection || 'to bottom';
  return `linear-gradient(${cssDirection}, ${startColor} 0%, ${endColor} 100%)`;
};

export const getRadialGradientCss = (angle, startColor, endColor) => {
  const safeAngle = Number(angle || 0);
  const radians = (safeAngle * Math.PI) / 180;
  const x = 50 + Math.cos(radians) * 38;
  const y = 50 + Math.sin(radians) * 38;
  return `radial-gradient(circle at ${x}% ${y}%, ${startColor} 0%, ${endColor} 70%)`;
};

export const normalizeFillGradient = (fillGradient, fallback = null) => {
  if (!fillGradient || typeof fillGradient !== 'object') {
    return fallback;
  }

  const type = fillGradient.type === 'radial'
    ? 'radial'
    : fillGradient.type === 'linear'
      ? 'linear'
      : null;

  if (!type) {
    return fallback;
  }

  return {
    type,
    startColor: normalizeHexColor(fillGradient.startColor || '#000000', '#000000'),
    endColor: normalizeHexColor(fillGradient.endColor || '#64748B', '#64748B'),
    direction: fillGradient.direction || 'down',
    radialAngle: Number(fillGradient.radialAngle ?? 225),
  };
};

const getSvgLinearGradientVector = (direction = 'down') => {
  switch (direction) {
    case 'up':
      return { x1: '0%', y1: '100%', x2: '0%', y2: '0%' };
    case 'left':
      return { x1: '100%', y1: '0%', x2: '0%', y2: '0%' };
    case 'right':
      return { x1: '0%', y1: '0%', x2: '100%', y2: '0%' };
    case 'down':
    default:
      return { x1: '0%', y1: '0%', x2: '0%', y2: '100%' };
  }
};

const getSvgRadialGradientVector = (angle = 225) => {
  const safeAngle = Number(angle || 0);
  const radians = (safeAngle * Math.PI) / 180;
  const fx = 50 + Math.cos(radians) * 38;
  const fy = 50 + Math.sin(radians) * 38;

  return {
    cx: '50%',
    cy: '50%',
    fx: `${fx}%`,
    fy: `${fy}%`,
    r: '70%',
  };
};

const buildSvgFillGradientMarkup = (fillGradient, gradientId) => {
  const normalizedGradient = normalizeFillGradient(fillGradient);

  if (!normalizedGradient) {
    return '';
  }

  if (normalizedGradient.type === 'linear') {
    const vector = getSvgLinearGradientVector(normalizedGradient.direction);

    return `
      <linearGradient id="${gradientId}" x1="${vector.x1}" y1="${vector.y1}" x2="${vector.x2}" y2="${vector.y2}">
        <stop offset="0%" stop-color="${normalizedGradient.startColor}" />
        <stop offset="100%" stop-color="${normalizedGradient.endColor}" />
      </linearGradient>
    `.trim();
  }

  const vector = getSvgRadialGradientVector(normalizedGradient.radialAngle);

  return `
    <radialGradient id="${gradientId}" cx="${vector.cx}" cy="${vector.cy}" fx="${vector.fx}" fy="${vector.fy}" r="${vector.r}">
      <stop offset="0%" stop-color="${normalizedGradient.startColor}" />
      <stop offset="100%" stop-color="${normalizedGradient.endColor}" />
    </radialGradient>
  `.trim();
};

export const getCombinedTextValue = (businessValue, sloganValue) => {
  const safeBusiness = (businessValue || '').trim();
  const safeSlogan = (sloganValue || '').trim();

  if (!safeBusiness) {
    return safeSlogan || 'BRAND';
  }

  return safeSlogan ? `${safeBusiness} | ${safeSlogan}` : safeBusiness;
};

export const getEditorTextValue = (item = {}) => {
  if (typeof item.text === 'string') {
    return item.text.replace(/\r?\n/g, ' ');
  }

  return getCombinedTextValue(item.businessValue, item.sloganValue);
};

const getPayloadPrimaryTextItem = (payload) => {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.textItems)) {
    return null;
  }

  return payload.textItems.find((item) => (
    item
    && typeof item === 'object'
    && (
      typeof item.businessValue === 'string'
      || typeof item.sloganValue === 'string'
      || typeof item.text === 'string'
    )
  )) || null;
};

const getTrimmedPayloadValue = (value) => (
  typeof value === 'string' && value.trim() ? value.trim() : ''
);

export const getPayloadBusinessValue = (payload) => {
  const primaryTextItem = getPayloadPrimaryTextItem(payload);

  return getTrimmedPayloadValue(primaryTextItem?.businessValue)
    || getTrimmedPayloadValue(primaryTextItem?.text)
    || getTrimmedPayloadValue(payload?.businessName)
    || '';
};

export const getPayloadSloganValue = (payload) => {
  const primaryTextItem = getPayloadPrimaryTextItem(payload);

  return getTrimmedPayloadValue(primaryTextItem?.sloganValue)
    || getTrimmedPayloadValue(payload?.slogan)
    || '';
};

export const getPayloadFontFamily = (payload) => {
  const primaryTextItem = getPayloadPrimaryTextItem(payload);

  return getTrimmedPayloadValue(primaryTextItem?.fontFamily)
    || getTrimmedPayloadValue(payload?.fontFamily)
    || '';
};

export const getPayloadTextColor = (payload) => {
  const primaryTextItem = getPayloadPrimaryTextItem(payload);

  return getTrimmedPayloadValue(primaryTextItem?.fill)
    || getTrimmedPayloadValue(primaryTextItem?.style?.fillColor)
    || getTrimmedPayloadValue(payload?.textColor)
    || '';
};

export const getPayloadBackgroundColor = (payload) => (
  getTrimmedPayloadValue(payload?.backgroundColor)
  || getTrimmedPayloadValue(payload?.bgColor)
  || ''
);

export const getPayloadPrimaryImageUrl = (payload) => {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.logoItems)) {
    return '';
  }

  const primaryLogoItem = payload.logoItems.find((item) => (
    item
    && typeof item === 'object'
    && typeof item.imageUrl === 'string'
    && item.imageUrl.trim()
  ));

  return getTrimmedPayloadValue(primaryLogoItem?.imageUrl);
};

export const normalizeTextFontStyleValue = (fontStyleValue) => {
  const tokens = new Set(
    String(fontStyleValue || 'normal')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
  );
  const orderedTokens = ['bold', 'italic'].filter((token) => tokens.has(token));

  return orderedTokens.length ? orderedTokens.join(' ') : 'normal';
};

export const normalizeTextFontWeight = (fontWeightValue, fallback = null) => {
  if (fontWeightValue === null || fontWeightValue === undefined || fontWeightValue === '') {
    return fallback;
  }

  if (typeof fontWeightValue === 'string') {
    const normalized = fontWeightValue.trim().toLowerCase();

    if (!normalized) {
      return fallback;
    }

    if (normalized === 'normal') {
      return 400;
    }

    if (normalized === 'bold') {
      return 700;
    }

    const parsedValue = Number(normalized);
    if (!Number.isFinite(parsedValue)) {
      return fallback;
    }

    return Math.max(100, Math.min(900, parsedValue));
  }

  const parsedValue = Number(fontWeightValue);
  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(100, Math.min(900, parsedValue));
};

export const normalizeTextLineHeight = (lineHeightValue, fontSizeValue, fallback = null) => {
  if (lineHeightValue === null || lineHeightValue === undefined || lineHeightValue === '') {
    return fallback;
  }

  const safeFontSize = Number(fontSizeValue || 0);
  const normalizeRatio = (value) => {
    if (!Number.isFinite(value) || value <= 0) {
      return fallback;
    }

    const ratioValue = value > 4 && safeFontSize > 0 ? value / safeFontSize : value;
    if (!Number.isFinite(ratioValue) || ratioValue <= 0) {
      return fallback;
    }

    return Number(ratioValue.toFixed(4));
  };

  if (typeof lineHeightValue === 'string') {
    const normalized = lineHeightValue.trim().toLowerCase();

    if (!normalized) {
      return fallback;
    }

    if (normalized === 'normal') {
      return fallback;
    }

    if (normalized.endsWith('%')) {
      const parsedPercent = Number(normalized.slice(0, -1));
      return normalizeRatio(parsedPercent / 100);
    }

    if (normalized.endsWith('px')) {
      const parsedPixels = Number(normalized.slice(0, -2));
      return normalizeRatio(parsedPixels);
    }

    return normalizeRatio(Number(normalized));
  }

  return normalizeRatio(Number(lineHeightValue));
};

export const getTextTypography = (item = {}, fallback = {}) => {
  const normalizedFontStyle = normalizeTextFontStyleValue(item.fontStyle || fallback.fontStyle || 'normal');
  const fallbackFontWeight = normalizedFontStyle.includes('bold') ? 700 : 400;
  const fontWeight = normalizeTextFontWeight(
    item.fontWeight ?? fallback.fontWeight,
    fallbackFontWeight
  );
  const lineHeight = normalizeTextLineHeight(
    item.lineHeight ?? fallback.lineHeight,
    item.fontSize ?? fallback.fontSize,
    null
  );

  return {
    fontFamily: item.fontFamily || fallback.fontFamily || 'Arial',
    fontStyle: normalizedFontStyle,
    fontWeight,
    lineHeight,
    cssFontStyle: normalizedFontStyle.includes('italic') ? 'italic' : 'normal',
    cssFontWeight: fontWeight ?? fallbackFontWeight,
    konvaFontStyle: [
      (fontWeight ?? fallbackFontWeight) >= 600 || normalizedFontStyle.includes('bold') ? 'bold' : null,
      normalizedFontStyle.includes('italic') ? 'italic' : null,
    ].filter(Boolean).join(' ') || 'normal',
  };
};

export const getFontWidthFactor = (fontFamily = '') => {
  const normalized = String(fontFamily || '').toLowerCase();

  if (normalized.includes('impact')) return 0.56;
  if (normalized.includes('courier')) return 0.62;
  if (normalized.includes('georgia')) return 0.62;
  if (normalized.includes('times')) return 0.61;
  if (normalized.includes('verdana')) return 0.6;
  if (normalized.includes('tahoma')) return 0.59;
  if (normalized.includes('garamond')) return 0.6;
  if (normalized.includes('palatino')) return 0.61;

  return 0.6;
};

let textMeasurementCanvas = null;
export const TEXT_BLOCK_HORIZONTAL_PADDING = 12;
export const TEXT_BLOCK_VERTICAL_PADDING = 0;

const getTextMeasurementContext = () => {
  if (typeof document === 'undefined') {
    return null;
  }

  if (!textMeasurementCanvas) {
    textMeasurementCanvas = document.createElement('canvas');
  }

  return textMeasurementCanvas.getContext('2d');
};

const measureTextBounds = ({
  value,
  fontFamily,
  fontSize,
  fontStyle,
  fontWeight,
  lineHeight,
  letterSpacing,
}) => {
  const context = getTextMeasurementContext();
  if (!context) {
    return null;
  }

  const typography = getTextTypography({
    fontFamily,
    fontSize,
    fontStyle,
    fontWeight,
    lineHeight,
  });
  const fontTokens = [
    typography.cssFontStyle !== 'normal' ? typography.cssFontStyle : null,
    typography.cssFontWeight ? String(typography.cssFontWeight) : null,
    `${fontSize}px`,
    typography.fontFamily || 'Arial',
  ].filter(Boolean);
  context.font = fontTokens.join(' ');

  const normalizedValue = String(value || ' ').replace(/\r?\n/g, ' ');
  const trackingValue = Number(letterSpacing || 0);
  const metrics = context.measureText(normalizedValue || ' ');
  const widestLine = metrics.width + (trackingValue * Math.max(0, normalizedValue.length - 1));
  const baseHeightMetrics = context.measureText(normalizedValue || 'Mg');
  const measuredAscent = baseHeightMetrics.actualBoundingBoxAscent || fontSize * 0.78;
  const measuredDescent = baseHeightMetrics.actualBoundingBoxDescent || fontSize * 0.22;
  const measuredLineHeight = Math.max(
    fontSize * 0.92,
    Math.ceil(measuredAscent + measuredDescent)
  );
  const resolvedLineHeight = typography.lineHeight
    ? Math.max(measuredLineHeight, fontSize * typography.lineHeight)
    : measuredLineHeight;

  return {
    width: widestLine,
    height: resolvedLineHeight,
  };
};

export const getTextBlockMetrics = (item = {}) => {
  const hasDirectText = typeof item.text === 'string';
  const safeValue = (getEditorTextValue(item) || (hasDirectText ? ' ' : 'BRAND')).replace(/\r?\n/g, ' ');
  const explicitFontSize = Number(item.fontSize || 0);
  const baseFontSize = explicitFontSize > 0
    ? explicitFontSize
    : safeValue.length > 28 ? 24 : safeValue.length > 20 ? 30 : safeValue.length > 12 ? 38 : 46;
  const explicitWidth = Number(item.width || 0);
  const shouldAutoFit = item.autoFit !== false;
  let fontSize = baseFontSize;
  const explicitHeight = Number(item.height || 0);
  const fontWidthFactor = getFontWidthFactor(item.fontFamily);
  const maxBlockWidth = Math.max(48, Math.min(620, Number(item.maxWidth || 620)));
  const maxTextWidth = Math.max(16, maxBlockWidth - TEXT_BLOCK_HORIZONTAL_PADDING);
  let measuredBounds = measureTextBounds({
    value: safeValue,
    fontFamily: item.fontFamily,
    fontSize,
    fontStyle: item.fontStyle,
    fontWeight: item.fontWeight,
    lineHeight: item.lineHeight,
    letterSpacing: item.letterSpacing,
  });

  if (shouldAutoFit && measuredBounds?.width && measuredBounds.width > maxTextWidth) {
    const scaledFontSize = Math.max(12, Math.floor(fontSize * (maxTextWidth / measuredBounds.width)));
    fontSize = scaledFontSize;
    measuredBounds = measureTextBounds({
      value: safeValue,
      fontFamily: item.fontFamily,
      fontSize,
      fontStyle: item.fontStyle,
      fontWeight: item.fontWeight,
      lineHeight: item.lineHeight,
      letterSpacing: item.letterSpacing,
    });

    while (fontSize > 12 && measuredBounds?.width > maxTextWidth) {
      fontSize -= 1;
      measuredBounds = measureTextBounds({
        value: safeValue,
        fontFamily: item.fontFamily,
        fontSize,
        fontStyle: item.fontStyle,
        fontWeight: item.fontWeight,
        lineHeight: item.lineHeight,
        letterSpacing: item.letterSpacing,
      });
    }
  }

  const naturalMeasuredWidth = Math.max(
    120,
    Math.ceil((measuredBounds?.width || (safeValue.length * (fontSize * fontWidthFactor))) + TEXT_BLOCK_HORIZONTAL_PADDING)
  );
  const measuredWidth = shouldAutoFit
    ? Math.min(maxBlockWidth, Math.max(Math.min(160, maxBlockWidth), naturalMeasuredWidth))
    : naturalMeasuredWidth;
  const measuredHeight = Math.max(
    Math.ceil(fontSize * 0.9),
    Math.ceil((measuredBounds?.height || fontSize) + TEXT_BLOCK_VERTICAL_PADDING)
  );
  const blockWidth = item.renderMode === 'svg'
    ? (explicitWidth > 0 ? explicitWidth : measuredWidth)
    : measuredWidth;
  const blockHeight = item.renderMode === 'svg'
    ? (explicitHeight > 0 ? explicitHeight : measuredHeight)
    : measuredHeight;

  return {
    value: safeValue,
    fontSize,
    width: blockWidth,
    height: blockHeight,
  };
};

export const getTextMetrics = (item = {}) => {
  const { width, height } = getTextBlockMetrics(item);
  return { width, height };
};

export const getEditableTextBaseFontSize = (item = {}) => {
  const fallbackFontSize = Math.max(12, Number(item.fontSize || getTextBlockMetrics(item).fontSize || 46));

  if (!(item.renderMode === 'svg' && item.svgDataUri)) {
    return fallbackFontSize;
  }

  const sourceMetrics = getTextMetrics(item);
  const editableCandidateMetrics = getTextBlockMetrics({
    ...item,
    autoFit: false,
    renderMode: 'text',
    svgDataUri: null,
    width: 0,
    height: 0,
    fontSize: fallbackFontSize,
  });
  const widthRatio = sourceMetrics.width / Math.max(1, editableCandidateMetrics.width || 1);
  const heightRatio = sourceMetrics.height / Math.max(1, editableCandidateMetrics.height || 1);
  const scaleRatio = Math.max(1, Math.min(8, Math.max(widthRatio, heightRatio)));

  return Math.max(12, fallbackFontSize * scaleRatio);
};

export const getEffectiveTextFontSize = (item = {}) => {
  const renderedFontSize = getEditableTextBaseFontSize(item);
  const scaleY = Math.abs(Number(item.transform?.scaleY ?? item.scaleY ?? 1)) || 1;
  return renderedFontSize * scaleY;
};

export const resolveTextFontSizeFromRenderedTarget = (item = {}, targetRenderedFontSize) => {
  const currentRenderedFontSize = Math.max(1, getEffectiveTextFontSize(item));
  const currentBaseFontSize = Math.max(1, getEditableTextBaseFontSize(item));
  const safeTargetRenderedFontSize = Math.max(12, Number(targetRenderedFontSize || currentRenderedFontSize));
  const resizeRatio = safeTargetRenderedFontSize / currentRenderedFontSize;

  return Math.max(12, currentBaseFontSize * resizeRatio);
};

export const bakeTextTransformIntoTypography = (item = {}, overrides = {}) => {
  const resolvedTransform = {
    x: Number(overrides.transform?.x ?? item.transform?.x ?? item.x ?? (CARD_X + 110)),
    y: Number(overrides.transform?.y ?? item.transform?.y ?? item.y ?? (CARD_Y + CARD_HEIGHT - 150)),
    scaleX: Number(overrides.transform?.scaleX ?? item.transform?.scaleX ?? item.scaleX ?? 1),
    scaleY: Number(overrides.transform?.scaleY ?? item.transform?.scaleY ?? item.scaleY ?? 1),
    rotation: Number(overrides.transform?.rotation ?? item.transform?.rotation ?? item.rotation ?? 0),
  };
  const previousItem = {
    ...item,
    fontSize: getEditableTextBaseFontSize(item),
    transform: resolvedTransform,
  };
  const resolvedFontSize = Number(overrides.fontSize);
  const nextFontSize = Number.isFinite(resolvedFontSize)
    ? resolvedFontSize
    : getEffectiveTextFontSize(previousItem);
  const nextItem = withMeasuredTextBox({
    ...previousItem,
    ...overrides,
    width: 0,
    height: 0,
    fontSize: Math.max(12, nextFontSize),
    transform: resolvedTransform,
  });
  const previousMetrics = getTextMetrics(previousItem);
  const nextMetrics = getTextMetrics(nextItem);
  const previousScaleX = Math.abs(resolvedTransform.scaleX || 1) || 1;
  const previousScaleY = Math.abs(resolvedTransform.scaleY || 1) || 1;
  const centerX = resolvedTransform.x + (previousMetrics.width * previousScaleX) / 2;
  const centerY = resolvedTransform.y + (previousMetrics.height * previousScaleY) / 2;
  const signedScaleX = Math.sign(resolvedTransform.scaleX || 1) || 1;
  const signedScaleY = Math.sign(resolvedTransform.scaleY || 1) || 1;

  return {
    ...nextItem,
    transform: {
      ...resolvedTransform,
      x: centerX - (nextMetrics.width * Math.abs(signedScaleX)) / 2,
      y: centerY - (nextMetrics.height * Math.abs(signedScaleY)) / 2,
      scaleX: signedScaleX,
      scaleY: signedScaleY,
    },
  };
};

export const preserveTextCenterTransform = (previousItem = {}, nextItem = {}) => {
  const previousTransform = previousItem.transform || { x: CARD_X + 110, y: CARD_Y + CARD_HEIGHT - 150, scaleX: 1, scaleY: 1, rotation: 0 };
  const previousMetrics = getTextMetrics(previousItem);
  const nextMetrics = getTextMetrics(nextItem);
  const scaleX = Math.abs(previousTransform.scaleX ?? 1);
  const scaleY = Math.abs(previousTransform.scaleY ?? 1);
  const centerX = previousTransform.x + (previousMetrics.width * scaleX) / 2;
  const centerY = previousTransform.y + (previousMetrics.height * scaleY) / 2;

  return {
    ...previousTransform,
    x: centerX - (nextMetrics.width * scaleX) / 2,
    y: centerY - (nextMetrics.height * scaleY) / 2,
  };
};

export const preserveTextAnchorTransform = (previousItem = {}, nextItem = {}) => {
  const previousTransform = previousItem.transform || {
    x: CARD_X + 110,
    y: CARD_Y + CARD_HEIGHT - 150,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  };
  const previousMetrics = getTextMetrics(previousItem);
  const nextMetrics = getTextMetrics(nextItem);
  const scaleX = Math.abs(previousTransform.scaleX ?? 1);
  const scaleY = Math.abs(previousTransform.scaleY ?? 1);
  const align = String(previousItem.align || nextItem.align || 'center').toLowerCase();
  const previousLeft = previousTransform.x;
  const previousCenterX = previousLeft + (previousMetrics.width * scaleX) / 2;
  const previousRight = previousLeft + (previousMetrics.width * scaleX);
  const previousCenterY = previousTransform.y + (previousMetrics.height * scaleY) / 2;

  let nextX = previousLeft;

  if (align === 'right') {
    nextX = previousRight - (nextMetrics.width * scaleX);
  } else if (align === 'center') {
    nextX = previousCenterX - (nextMetrics.width * scaleX) / 2;
  }

  return {
    ...previousTransform,
    x: nextX,
    y: previousCenterY - (nextMetrics.height * scaleY) / 2,
  };
};

export const preserveTextPositionTransform = (previousItem = {}, nextItem = {}) => {
  const previousTransform = previousItem.transform || {
    x: CARD_X + 110,
    y: CARD_Y + CARD_HEIGHT - 150,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  };
  const nextTransform = nextItem.transform || {};

  return {
    ...nextTransform,
    ...previousTransform,
    x: previousTransform.x,
    y: previousTransform.y,
  };
};

export const withMeasuredTextBox = (item = {}) => {
  const metrics = getTextMetrics(item);

  return {
    ...item,
    width: metrics.width,
    height: metrics.height,
  };
};

const resolveTemplateFillColor = (item = {}, fallback = {}) => (
  item?.style?.fillColor ||
  item?.fill ||
  fallback?.style?.fillColor ||
  fallback?.fill ||
  '#1A1A1A'
);

export const extractTextTemplate = (item = {}, fallback = {}) => ({
  text: typeof item.text === 'string' ? item.text : (fallback.text || ''),
  fontSize: Number(item.fontSize || fallback.fontSize || 46),
  align: item.align || fallback.align || 'center',
  fill: resolveTemplateFillColor(item, fallback),
  fontFamily: item.fontFamily || fallback.fontFamily || 'Arial',
  fontUrl: item.fontUrl || fallback.fontUrl || null,
  fontStyle: normalizeTextFontStyleValue(item.fontStyle || fallback.fontStyle || 'normal'),
  fontWeight: normalizeTextFontWeight(
    item.fontWeight ?? fallback.fontWeight,
    null
  ),
  lineHeight: normalizeTextLineHeight(
    item.lineHeight ?? fallback.lineHeight,
    Number(item.fontSize || fallback.fontSize || 46),
    null
  ),
  letterSpacing: Number(item.letterSpacing || fallback.letterSpacing || 0),
  style: {
    ...buildDefaultItemStyle(resolveTemplateFillColor(item, fallback)),
    ...(fallback.style || {}),
    ...(item.style || {}),
    fillColor: resolveTemplateFillColor(item, fallback),
    outlineColor: item?.style?.outlineColor || fallback?.style?.outlineColor || '#111827',
    outlineWidth: Number(item?.style?.outlineWidth ?? fallback?.style?.outlineWidth ?? 0),
    applyColorOverrides: Boolean(item?.style?.applyColorOverrides ?? fallback?.style?.applyColorOverrides ?? false),
    rotateX: Number(item?.style?.rotateX ?? fallback?.style?.rotateX ?? 0),
    rotateY: Number(item?.style?.rotateY ?? fallback?.style?.rotateY ?? 0),
    rotateZ: Number(item?.style?.rotateZ ?? fallback?.style?.rotateZ ?? 0),
  },
});

export const getPreferredTextTemplateSource = (textItems = [], preferredIds = []) => {
  const safeTextItems = Array.isArray(textItems) ? textItems.filter(Boolean) : [];

  for (const preferredId of preferredIds) {
    const matchedItem = safeTextItems.find((item) => item?.id === preferredId);
    if (matchedItem) {
      return matchedItem;
    }
  }

  return safeTextItems.find((item) => item?.id === 'brand-name') || safeTextItems[0] || null;
};

const decodeSvgDataUri = (value) => {
  if (typeof value !== 'string' || !value.startsWith('data:image/svg+xml')) {
    return null;
  }

  const dataIndex = value.indexOf(',');
  if (dataIndex === -1) {
    return null;
  }

  try {
    return decodeURIComponent(value.slice(dataIndex + 1));
  } catch {
    return null;
  }
};

const encodeSvgDataUri = (markup) => (
  typeof markup === 'string' && markup.trim()
    ? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`
    : null
);

const stripSvgStyleProperties = (styleValue = '', properties = []) => {
  const blockedProperties = new Set(
    (Array.isArray(properties) ? properties : [])
      .map((property) => String(property || '').trim().toLowerCase())
      .filter(Boolean)
  );

  const nextTokens = String(styleValue || '')
    .split(';')
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => {
      const separatorIndex = token.indexOf(':');
      if (separatorIndex === -1) {
        return true;
      }

      const propertyName = token.slice(0, separatorIndex).trim().toLowerCase();
      return !blockedProperties.has(propertyName);
    });

  return nextTokens.join('; ');
};

export const applySvgPresentationToMarkup = (svgMarkup, style = {}) => {
  if (typeof svgMarkup !== 'string' || !svgMarkup.trim()) {
    return null;
  }

  const fillGradient = normalizeFillGradient(style.fillGradient);
  const gradientId = 'editor-fill-gradient';
  const fillOverrideValue = fillGradient
    ? `url(#${gradientId})`
    : style.fillColor || null;
  const hasFillOverride = Boolean(style.applyColorOverrides && fillOverrideValue);
  const hasOutline = Number(style.outlineWidth || 0) > 0 && Boolean(style.outlineColor);
  const strokeOverrideValue = hasOutline
    ? style.outlineColor
    : (hasFillOverride ? fillOverrideValue : null);

  let nextMarkup = svgMarkup
    .replace(/<defs\b[^>]*data-editor-fill-gradient="true"[^>]*>[\s\S]*?<\/defs>/gi, '')
    .replace(/\spaint-order="[^"]*"/gi, '')
    .replace(/\scolor="[^"]*"/gi, '')
    .replace(/\sstyle="([^"]*)"/gi, (_match, styleValue) => {
      const cleanedStyleValue = stripSvgStyleProperties(styleValue, [
        'fill',
        'stroke',
        'stroke-width',
        'paint-order',
        'color',
      ]);

      return cleanedStyleValue ? ` style="${cleanedStyleValue}"` : '';
    });

  if (hasFillOverride) {
    nextMarkup = nextMarkup.replace(/\sfill="(?!none)[^"]*"/gi, ` fill="${fillOverrideValue}"`);
  }

  if (strokeOverrideValue) {
    nextMarkup = nextMarkup.replace(/\sstroke="(?!none)[^"]*"/gi, ` stroke="${strokeOverrideValue}"`);
  }

  if (hasOutline) {
    nextMarkup = nextMarkup.replace(/\sstroke-width="[^"]*"/gi, ` stroke-width="${Number(style.outlineWidth)}"`);
  }

  nextMarkup = nextMarkup.replace(/<svg\b([^>]*)>/i, (match, attrs = '') => {
    const baseAttrs = String(attrs || '')
      .replace(/\sfill="[^"]*"/gi, '')
      .replace(/\sstroke="[^"]*"/gi, '')
      .replace(/\sstroke-width="[^"]*"/gi, '')
      .replace(/\spaint-order="[^"]*"/gi, '')
      .replace(/\scolor="[^"]*"/gi, '')
      .replace(/\sstyle="([^"]*)"/gi, (_styleMatch, styleValue) => {
        const cleanedStyleValue = stripSvgStyleProperties(styleValue, [
          'fill',
          'stroke',
          'stroke-width',
          'paint-order',
          'color',
        ]);

        return cleanedStyleValue ? ` style="${cleanedStyleValue}"` : '';
      });
    const nextAttrs = [
      baseAttrs.trim(),
      hasFillOverride ? `fill="${fillOverrideValue}"` : '',
      strokeOverrideValue ? `stroke="${strokeOverrideValue}"` : '',
      hasOutline ? `stroke-width="${Number(style.outlineWidth)}"` : '',
      hasOutline ? 'paint-order="stroke fill"' : '',
      hasFillOverride && !fillGradient ? `color="${style.fillColor}"` : '',
    ].filter(Boolean).join(' ');

    return `<svg ${nextAttrs}>`;
  });

  if (hasOutline) {
    nextMarkup = nextMarkup.replace(
      /<(g|text)\b([^>]*)>/gi,
      `<$1$2 stroke="${style.outlineColor}" stroke-width="${Number(style.outlineWidth)}" paint-order="stroke fill">`
    );
  }

  if (fillGradient) {
    const gradientMarkup = buildSvgFillGradientMarkup(fillGradient, gradientId);
    nextMarkup = nextMarkup.replace(
      /<svg\b[^>]*>/i,
      (match) => `${match}<defs data-editor-fill-gradient="true">${gradientMarkup}</defs>`
    );
  }

  return nextMarkup;
};

export const buildTextItemFromTemplate = ({
  id,
  text = '',
  transform,
  template = {},
}) => withMeasuredTextBox({
  id,
  text,
  autoFit: false,
  width: 0,
  height: 0,
  fontSize: Number(template.fontSize || 46),
  align: template.align || 'center',
  fill: template.fill || '#1A1A1A',
  fontFamily: template.fontFamily || 'Arial',
  fontUrl: template.fontUrl || null,
  fontStyle: normalizeTextFontStyleValue(template.fontStyle || 'normal'),
  fontWeight: normalizeTextFontWeight(template.fontWeight, null),
  lineHeight: normalizeTextLineHeight(template.lineHeight, Number(template.fontSize || 46), null),
  letterSpacing: Number(template.letterSpacing || 0),
  renderMode: 'text',
  svgDataUri: null,
  transform,
  style: {
    ...buildDefaultItemStyle(template.fill || '#1A1A1A'),
    ...(template.style || {}),
  },
});

export const applyStyleToTextItem = (item, styleUpdate = {}) => {
  const nextStyle = {
    ...(item?.style || {}),
    ...(styleUpdate || {}),
  };
  const nextFill = nextStyle.fillColor || item?.fill || '#1A1A1A';

  if (item?.renderMode === 'svg' && item?.svgDataUri) {
    const svgMarkup = decodeSvgDataUri(item.svgDataUri);
    const nextSvgMarkup = applySvgPresentationToMarkup(svgMarkup, nextStyle);

    if (nextSvgMarkup) {
      return {
        ...item,
        fill: nextFill,
        style: nextStyle,
        renderMode: 'svg',
        svgDataUri: encodeSvgDataUri(nextSvgMarkup),
      };
    }
  }

  const nextItem = withMeasuredTextBox({
    ...item,
    fill: nextFill,
    renderMode: 'text',
    svgDataUri: null,
    width: 0,
    height: 0,
    style: nextStyle,
  });

  return {
    ...nextItem,
    transform: preserveTextCenterTransform(item, nextItem),
  };
};

export const clampTransformToCard = (type, item, transform) => {
  return {
    ...transform,
    x: Number(transform?.x ?? 0),
    y: Number(transform?.y ?? 0),
    scaleX: Number(transform?.scaleX ?? 1),
    scaleY: Number(transform?.scaleY ?? 1),
    rotation: Number(transform?.rotation ?? 0),
  };
};

export const buildDefaultItemStyle = (fillColor = '#111827') => ({
  fillColor,
  fillGradient: null,
  outlineColor: '#111827',
  outlineWidth: 0,
  applyColorOverrides: false,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
});

export const getDefaultShapeDimensions = (shapeType = 'rectangle') => {
  switch (shapeType) {
    case 'triangle':
      return { width: 190, height: 170 };
    case 'diamond':
      return { width: 180, height: 180 };
    case 'pentagon':
      return { width: 180, height: 180 };
    case 'hexagon':
      return { width: 200, height: 170 };
    case 'heart':
      return { width: 190, height: 165 };
    case 'star':
      return { width: 190, height: 190 };
    case 'arrow':
      return { width: 220, height: 120 };
    case 'full':
    case 'rectangle':
    default:
      return { width: 220, height: 160 };
  }
};

export const buildShapeItemFromType = ({
  id,
  shapeType = 'rectangle',
  transform,
} = {}) => {
  const dimensions = getDefaultShapeDimensions(shapeType);

  return {
    id: id || `shape-${Date.now()}`,
    kind: 'shape',
    type: 'shape',
    shapeType,
    baseWidth: dimensions.width,
    baseHeight: dimensions.height,
    opacity: 1,
    transform: {
      x: Number(transform?.x ?? CARD_X + 170),
      y: Number(transform?.y ?? CARD_Y + 90),
      scaleX: Number(transform?.scaleX ?? 1),
      scaleY: Number(transform?.scaleY ?? 1),
      rotation: Number(transform?.rotation ?? 0),
    },
    style: {
      ...buildDefaultItemStyle('#F8FAFC'),
      fillColor: '#F8FAFC',
      outlineColor: '#111827',
      outlineWidth: 4,
      applyColorOverrides: true,
    },
  };
};

export const buildShapeItemFromBackgroundShape = (backgroundShape = {}, options = {}) => {
  const safeShapeType = backgroundShape.type || backgroundShape.shapeType || 'rectangle';
  const dimensions = getDefaultShapeDimensions(safeShapeType);
  const fillColor = backgroundShape.fillColor || '#F8FAFC';

  return {
    id: options.id || `shape-${Date.now()}`,
    kind: 'shape',
    type: 'shape',
    shapeType: safeShapeType,
    baseWidth: Number(backgroundShape.baseWidth || dimensions.width),
    baseHeight: Number(backgroundShape.baseHeight || dimensions.height),
    opacity: Math.max(0.05, Math.min(1, Number(backgroundShape.opacity ?? 1))),
    transform: {
      x: Number(backgroundShape.transform?.x ?? CARD_X + 170),
      y: Number(backgroundShape.transform?.y ?? CARD_Y + 90),
      scaleX: Number(backgroundShape.transform?.scaleX ?? 1),
      scaleY: Number(backgroundShape.transform?.scaleY ?? 1),
      rotation: Number(backgroundShape.transform?.rotation ?? 0),
    },
    style: {
      ...buildDefaultItemStyle(fillColor),
      fillColor,
      outlineColor: backgroundShape.strokeColor || '#111827',
      outlineWidth: Math.max(0, Number(backgroundShape.strokeWidth ?? 4)),
      applyColorOverrides: true,
    },
  };
};

export const buildBackgroundShapeFromShapeItem = (item = {}) => {
  if (!item || (item.kind !== 'shape' && item.type !== 'shape')) {
    return null;
  }

  const safeShapeType = item.shapeType || item.backgroundShapeType || 'rectangle';
  const dimensions = getDefaultShapeDimensions(safeShapeType);

  return {
    type: safeShapeType,
    fillColor: item.style?.fillColor || '#F8FAFC',
    strokeColor: item.style?.outlineColor || '#111827',
    strokeWidth: Math.max(0, Number(item.style?.outlineWidth ?? 4)),
    baseWidth: Number(item.baseWidth || item.width || dimensions.width),
    baseHeight: Number(item.baseHeight || item.height || dimensions.height),
    opacity: Math.max(0.05, Math.min(1, Number(item.opacity ?? 1))),
    transform: {
      x: Number(item.transform?.x ?? CARD_X + 170),
      y: Number(item.transform?.y ?? CARD_Y + 90),
      scaleX: Number(item.transform?.scaleX ?? 1),
      scaleY: Number(item.transform?.scaleY ?? 1),
      rotation: Number(item.transform?.rotation ?? 0),
    },
  };
};

export const normalizePayloadLogoItem = (item) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  if (item.kind === 'shape' || item.type === 'shape') {
    const safeShapeType = item.shapeType || item.backgroundShapeType || 'rectangle';
    const dimensions = getDefaultShapeDimensions(safeShapeType);

    return {
      ...item,
      kind: 'shape',
      type: 'shape',
      shapeType: safeShapeType,
      baseWidth: Number(item.baseWidth || item.width || dimensions.width),
      baseHeight: Number(item.baseHeight || item.height || dimensions.height),
      opacity: item.opacity ?? 1,
      transform: {
        x: Number(item.transform?.x ?? item.x ?? (CARD_X + 170)),
        y: Number(item.transform?.y ?? item.y ?? (CARD_Y + 90)),
        scaleX: Number(item.transform?.scaleX ?? item.scaleX ?? 1),
        scaleY: Number(item.transform?.scaleY ?? item.scaleY ?? 1),
        rotation: Number(item.transform?.rotation ?? item.rotation ?? 0),
      },
      style: {
        ...buildDefaultItemStyle('#F8FAFC'),
        fillColor: '#F8FAFC',
        outlineColor: '#111827',
        outlineWidth: 4,
        applyColorOverrides: true,
        ...(item.style || {}),
      },
    };
  }

  const resolvedImageUrl = item.imageUrl || item.src || '';

  if (resolvedImageUrl && item.transform) {
    return {
      ...item,
      src: resolvedImageUrl,
      imageUrl: resolvedImageUrl,
      baseWidth: Number(item.baseWidth || item.width || 220),
      baseHeight: Number(item.baseHeight || item.height || 160),
      transform: {
        x: Number(item.transform?.x ?? item.x ?? (CARD_X + 170)),
        y: Number(item.transform?.y ?? item.y ?? (CARD_Y + 64)),
        scaleX: Number(item.transform?.scaleX ?? item.scaleX ?? 1),
        scaleY: Number(item.transform?.scaleY ?? item.scaleY ?? 1),
        rotation: Number(item.transform?.rotation ?? item.rotation ?? 0),
      },
      style: {
        ...buildDefaultItemStyle('#111827'),
        ...(item.style || {}),
      },
    };
  }

  if (item.kind === 'line' || item.type === 'line') {
    if (item.transform) {
      return {
        ...item,
        kind: 'line',
        points: Array.isArray(item.points) ? item.points : [0, 6, Number(item.baseWidth || item.width || 120), 6],
        stroke: item.stroke || item.style?.fillColor || '#475569',
        strokeWidth: Number(item.strokeWidth || 2),
        opacity: item.opacity ?? 1,
        baseWidth: Number(item.baseWidth || item.width || 120),
        baseHeight: Number(item.baseHeight || item.height || 12),
        transform: {
          x: Number(item.transform?.x ?? item.x ?? CARD_X),
          y: Number(item.transform?.y ?? item.y ?? CARD_Y),
          scaleX: Number(item.transform?.scaleX ?? item.scaleX ?? 1),
          scaleY: Number(item.transform?.scaleY ?? item.scaleY ?? 1),
          rotation: Number(item.transform?.rotation ?? item.rotation ?? 0),
        },
        style: {
          ...buildDefaultItemStyle(item.stroke || '#475569'),
          ...(item.style || {}),
        },
      };
    }

    const x1 = Number(item.x1 || 0);
    const y1 = Number(item.y1 || 0);
    const x2 = Number(item.x2 || 0);
    const y2 = Number(item.y2 || 0);
    const strokeWidth = Number(item.strokeWidth || 2);
    const baseWidth = Math.max(24, Math.abs(x2 - x1));
    const baseHeight = Math.max(12, strokeWidth * 6);
    const centerY = (y1 + y2) / 2;

    return {
      id: item.id || `line-${Date.now()}`,
      kind: 'line',
      points: [0, baseHeight / 2, baseWidth, baseHeight / 2],
      stroke: item.stroke || '#475569',
      strokeWidth,
      opacity: item.opacity ?? 1,
      baseWidth,
      baseHeight,
      transform: {
        x: Math.min(x1, x2),
        y: centerY - (baseHeight / 2),
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      style: buildDefaultItemStyle(item.stroke || '#475569'),
    };
  }

  if (!resolvedImageUrl) {
    return null;
  }

  return {
    id: item.id || `logo-${Date.now()}`,
    src: resolvedImageUrl,
    imageUrl: resolvedImageUrl,
    baseWidth: Number(item.baseWidth || item.width || 220),
    baseHeight: Number(item.baseHeight || item.height || 160),
    transform: {
      x: Number(item.transform?.x ?? item.x ?? (CARD_X + 170)),
      y: Number(item.transform?.y ?? item.y ?? (CARD_Y + 64)),
      scaleX: Number(item.transform?.scaleX ?? item.scaleX ?? 1),
      scaleY: Number(item.transform?.scaleY ?? item.scaleY ?? 1),
      rotation: Number(item.transform?.rotation ?? item.rotation ?? 0),
    },
    style: buildDefaultItemStyle('#111827'),
  };
};

export const normalizePayloadTextItem = (item) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  if ((item.text || item.businessValue || item.sloganValue) && item.transform) {
    return withMeasuredTextBox({
      ...item,
      autoFit: item.autoFit ?? true,
      width: Number(item.width || 0),
      height: Number(item.height || 0),
      fontSize: Number(item.fontSize || 46),
      letterSpacing: Number(item.letterSpacing || 0),
      fontFamily: item.fontFamily || 'Arial',
      fontUrl: item.fontUrl || null,
      fontStyle: normalizeTextFontStyleValue(item.fontStyle || 'normal'),
      fontWeight: normalizeTextFontWeight(item.fontWeight, null),
      lineHeight: normalizeTextLineHeight(item.lineHeight, Number(item.fontSize || 46), null),
      renderMode: item.renderMode || (item.svgDataUri ? 'svg' : 'text'),
      svgDataUri: item.svgDataUri || null,
      transform: {
        x: Number(item.transform?.x ?? item.x ?? (CARD_X + 110)),
        y: Number(item.transform?.y ?? item.y ?? (CARD_Y + CARD_HEIGHT - 150)),
        scaleX: Number(item.transform?.scaleX ?? item.scaleX ?? 1),
        scaleY: Number(item.transform?.scaleY ?? item.scaleY ?? 1),
        rotation: Number(item.transform?.rotation ?? item.rotation ?? 0),
      },
      style: {
        ...buildDefaultItemStyle(item.fill || '#1A1A1A'),
        ...(item.style || {}),
      },
    });
  }

  const textValue = typeof item.text === 'string' ? item.text : '';
  if (!textValue.trim()) {
    return null;
  }

  const fill = item.fill || '#1A1A1A';
  const fontSize = Number(item.fontSize || 46);

  return withMeasuredTextBox({
    id: item.id || `text-${Date.now()}`,
    text: textValue,
    autoFit: item.autoFit ?? true,
    width: Number(item.width || 0),
    height: Number(item.height || 0),
    fontSize,
    align: item.align || 'center',
    fill,
    fontFamily: item.fontFamily || 'Arial',
    fontUrl: item.fontUrl || null,
    fontStyle: normalizeTextFontStyleValue(item.fontStyle || 'normal'),
    fontWeight: normalizeTextFontWeight(item.fontWeight, null),
    lineHeight: normalizeTextLineHeight(item.lineHeight, fontSize, null),
    letterSpacing: Number(item.letterSpacing || 0),
    renderMode: item.renderMode || (item.svgDataUri ? 'svg' : 'text'),
    svgDataUri: item.svgDataUri || null,
    transform: {
      x: Number(item.x ?? (CARD_X + 110)),
      y: Number(item.y ?? (CARD_Y + CARD_HEIGHT - 150)),
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    },
    style: buildDefaultItemStyle(fill),
  });
};

export const buildInitialPresent = ({
  urlBgColor,
  urlTextColor,
  urlImage,
  initialBusinessValue,
  initialSloganValue,
  formData,
  payload,
}) => {
  const fallbackFontFamily = payload?.fontFamily || EDITOR_FONT_FAMILIES[formData?.fontId] || DEFAULT_EDITOR_FONT_FAMILY;
  const fallbackFontOption = getEditorFontOption(fallbackFontFamily);
  const fallbackTextTemplate = extractTextTemplate({
    text: initialBusinessValue,
    fontSize: 46,
    align: 'center',
    fill: urlTextColor || '#1A1A1A',
    fontFamily: fallbackFontFamily,
    fontUrl: fallbackFontOption?.fontUrl || null,
    fontStyle: 'normal',
    letterSpacing: 0,
    style: buildDefaultItemStyle(urlTextColor || '#1A1A1A'),
  });
  const fallbackPrimaryTextItem = withMeasuredTextBox({
    id: 'text-1',
    ...(initialSloganValue
      ? {
        businessValue: initialBusinessValue,
        sloganValue: initialSloganValue,
      }
      : {
        text: initialBusinessValue,
      }),
    fontSize: fallbackTextTemplate.fontSize,
    align: fallbackTextTemplate.align,
    fill: fallbackTextTemplate.fill,
    fontFamily: fallbackTextTemplate.fontFamily,
    fontStyle: fallbackTextTemplate.fontStyle,
    letterSpacing: fallbackTextTemplate.letterSpacing,
    renderMode: 'text',
    svgDataUri: null,
    width: 0,
    height: 0,
    transform: {
      x: CARD_X + 70,
      y: CARD_Y + CARD_HEIGHT - 74,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    },
    style: fallbackTextTemplate.style,
  });

  const fallbackPresent = {
    bgColor: urlBgColor || '#FFFFFF',
    bgOpacity: 1,
    bgFill: null,
    bgImageUrl: null,
    backgroundShape: null,
    watermarkEnabled: true,
    fontFamily: fallbackFontFamily,
    textColor: urlTextColor || '#1A1A1A',
    textTemplate: fallbackTextTemplate,
    logoItems: [
      {
        id: 'logo-1',
        imageUrl: urlImage || '/images/photo1.jfif',
        transform: {
          x: CARD_X + 170,
          y: CARD_Y + 64,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
        style: buildDefaultItemStyle('#111827'),
      },
    ],
    textItems: [
      {
        ...fallbackPrimaryTextItem,
        businessValue: initialBusinessValue,
        sloganValue: initialSloganValue,
      },
    ],
  };
  fallbackPresent.layerOrder = syncCanvasLayerOrder(
    [],
    fallbackPresent.logoItems,
    fallbackPresent.textItems
  );

  if (!payload || typeof payload !== 'object') {
    return fallbackPresent;
  }

  const payloadIncludesLogoItems = Array.isArray(payload.logoItems);
  const payloadLogoItems = Array.isArray(payload.logoItems)
    ? payload.logoItems.map(normalizePayloadLogoItem).filter(Boolean)
    : [];
  const payloadTextItems = Array.isArray(payload.textItems)
    ? payload.textItems.map(normalizePayloadTextItem).filter(Boolean)
    : [];
  const payloadTextTemplate = payload.textTemplate
    ? extractTextTemplate(payload.textTemplate, fallbackTextTemplate)
    : extractTextTemplate(payloadTextItems[0] || {}, fallbackTextTemplate);
  const resolvedLogoItems = payloadIncludesLogoItems
    ? payloadLogoItems
    : fallbackPresent.logoItems;
  const resolvedTextItems = payloadTextItems.length
    ? payloadTextItems
    : fallbackPresent.textItems;

  return {
    ...fallbackPresent,
    bgColor: payload.backgroundColor || payload.bgColor || fallbackPresent.bgColor,
    bgOpacity: Number(payload.bgOpacity ?? payload.backgroundOpacity ?? fallbackPresent.bgOpacity),
    bgFill: payload.bgFill || fallbackPresent.bgFill,
    bgImageUrl: payload.bgImageUrl || fallbackPresent.bgImageUrl,
    backgroundShape: payload.backgroundShape || fallbackPresent.backgroundShape,
    watermarkEnabled: payload.watermarkEnabled ?? fallbackPresent.watermarkEnabled,
    fontFamily: payload.fontFamily || fallbackPresent.fontFamily,
    textColor: payload.textColor || fallbackPresent.textColor,
    textTemplate: payloadTextTemplate,
    logoItems: resolvedLogoItems,
    textItems: resolvedTextItems,
    layerOrder: syncCanvasLayerOrder(
      payload.layerOrder,
      resolvedLogoItems,
      resolvedTextItems
    ),
  };
};
