import {
  CARD_HEIGHT,
  CARD_X,
  CARD_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  EDITOR_FONT_FAMILIES,
  gradientDirectionOptions,
} from './editorConstants';

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

export const getCombinedTextValue = (businessValue, sloganValue) => {
  const safeBusiness = (businessValue || '').trim();
  const safeSlogan = (sloganValue || '').trim();

  if (!safeBusiness) {
    return safeSlogan || 'BRAND';
  }

  return safeSlogan ? `${safeBusiness} | ${safeSlogan}` : safeBusiness;
};

export const getEditorTextValue = (item = {}) => {
  const directText = typeof item.text === 'string' ? item.text.trim() : '';
  if (directText) {
    return directText;
  }

  return getCombinedTextValue(item.businessValue, item.sloganValue);
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
  letterSpacing,
}) => {
  const context = getTextMeasurementContext();
  if (!context) {
    return null;
  }

  const normalizedStyle = fontStyle && fontStyle !== 'normal' ? `${fontStyle} ` : '';
  context.font = `${normalizedStyle}${fontSize}px ${fontFamily || 'Arial'}`;

  const metrics = context.measureText(value || ' ');
  const trackingWidth = Number(letterSpacing || 0) * Math.max(0, String(value || '').length - 1);

  return {
    width: metrics.width + trackingWidth,
    height: (metrics.actualBoundingBoxAscent || fontSize * 0.82) + (metrics.actualBoundingBoxDescent || fontSize * 0.28),
  };
};

export const getTextBlockMetrics = (item = {}) => {
  const safeValue = getEditorTextValue(item) || 'BRAND';
  const explicitFontSize = Number(item.fontSize || 0);
  const fontSize = explicitFontSize > 0
    ? explicitFontSize
    : safeValue.length > 28 ? 24 : safeValue.length > 20 ? 30 : safeValue.length > 12 ? 38 : 46;
  const explicitWidth = Number(item.width || 0);
  const explicitHeight = Number(item.height || 0);
  const fontWidthFactor = getFontWidthFactor(item.fontFamily);
  const measuredBounds = measureTextBounds({
    value: safeValue,
    fontFamily: item.fontFamily,
    fontSize,
    fontStyle: item.fontStyle,
    letterSpacing: item.letterSpacing,
  });
  const measuredWidth = Math.min(
    620,
    Math.max(160, Math.ceil((measuredBounds?.width || (safeValue.length * (fontSize * fontWidthFactor))) + 32))
  );
  const measuredHeight = Math.max(
    fontSize + 18,
    Math.ceil((measuredBounds?.height || fontSize) + 24)
  );
  const blockWidth = item.renderMode === 'svg'
    ? (explicitWidth > 0 ? explicitWidth : measuredWidth)
    : Math.max(explicitWidth, measuredWidth);
  const blockHeight = item.renderMode === 'svg'
    ? (explicitHeight > 0 ? explicitHeight : measuredHeight)
    : Math.max(explicitHeight, measuredHeight);

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
  fontStyle: item.fontStyle || fallback.fontStyle || 'normal',
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

const applySvgPresentationToMarkup = (svgMarkup, style = {}) => {
  if (typeof svgMarkup !== 'string' || !svgMarkup.trim()) {
    return null;
  }

  const hasFillOverride = Boolean(style.applyColorOverrides && style.fillColor);
  const hasOutline = Number(style.outlineWidth || 0) > 0 && Boolean(style.outlineColor);

  let nextMarkup = svgMarkup
    .replace(/\sstroke="[^"]*"/gi, '')
    .replace(/\sstroke-width="[^"]*"/gi, '')
    .replace(/\spaint-order="[^"]*"/gi, '');

  if (hasFillOverride) {
    nextMarkup = nextMarkup.replace(/\sfill="(?!none)[^"]*"/gi, ` fill="${style.fillColor}"`);
  }

  if (hasOutline) {
    nextMarkup = nextMarkup.replace(
      /<(g|text)\b([^>]*)>/gi,
      `<$1$2 stroke="${style.outlineColor}" stroke-width="${Number(style.outlineWidth)}" paint-order="stroke fill">`
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
  width: 0,
  height: 0,
  fontSize: Number(template.fontSize || 46),
  align: template.align || 'center',
  fill: template.fill || '#1A1A1A',
  fontFamily: template.fontFamily || 'Arial',
  fontUrl: template.fontUrl || null,
  fontStyle: template.fontStyle || 'normal',
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
  const scaleX = transform.scaleX ?? 1;
  const scaleY = transform.scaleY ?? 1;
  let width = 0;
  let height = 0;

  if (type === 'logo') {
    width = Number(item.baseWidth || item.width || 280) * Math.abs(scaleX);
    height = Number(item.baseHeight || item.height || 200) * Math.abs(scaleY);
  } else {
    const metrics = getTextMetrics(item);
    width = metrics.width * Math.abs(scaleX);
    height = metrics.height * Math.abs(scaleY);
  }

  const minX = 0;
  const maxX = Math.max(minX, CANVAS_WIDTH - width);
  const minY = 0;
  const maxY = Math.max(minY, CANVAS_HEIGHT - height);

  return {
    ...transform,
    x: Math.min(Math.max(transform.x, minX), maxX),
    y: Math.min(Math.max(transform.y, minY), maxY),
  };
};

export const buildDefaultItemStyle = (fillColor = '#111827') => ({
  fillColor,
  outlineColor: '#111827',
  outlineWidth: 0,
  applyColorOverrides: false,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
});

export const normalizePayloadLogoItem = (item) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  if (item.imageUrl && item.transform) {
    return {
      ...item,
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

  const imageUrl = item.src || item.imageUrl || '';
  if (!imageUrl) {
    return null;
  }

  return {
    id: item.id || `logo-${Date.now()}`,
    imageUrl,
    baseWidth: Number(item.width || 220),
    baseHeight: Number(item.height || 160),
    transform: {
      x: Number(item.x ?? (CARD_X + 170)),
      y: Number(item.y ?? (CARD_Y + 64)),
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
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
      width: Number(item.width || 0),
      height: Number(item.height || 0),
      fontSize: Number(item.fontSize || 46),
      letterSpacing: Number(item.letterSpacing || 0),
      fontFamily: item.fontFamily || 'Arial',
      fontUrl: item.fontUrl || null,
      fontStyle: item.fontStyle || 'normal',
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
    width: Number(item.width || 0),
    height: Number(item.height || 0),
    fontSize,
    align: item.align || 'center',
    fill,
    fontFamily: item.fontFamily || 'Arial',
    fontUrl: item.fontUrl || null,
    fontStyle: item.fontStyle || 'normal',
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
  const fallbackTextTemplate = extractTextTemplate({
    text: initialBusinessValue,
    fontSize: 46,
    align: 'center',
    fill: urlTextColor || '#1A1A1A',
    fontFamily: EDITOR_FONT_FAMILIES[formData?.fontId] || 'Arial',
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
    fontFamily: EDITOR_FONT_FAMILIES[formData?.fontId] || 'Arial',
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

  if (!payload || typeof payload !== 'object') {
    return fallbackPresent;
  }

  const payloadLogoItems = Array.isArray(payload.logoItems)
    ? payload.logoItems.map(normalizePayloadLogoItem).filter(Boolean)
    : [];
  const payloadTextItems = Array.isArray(payload.textItems)
    ? payload.textItems.map(normalizePayloadTextItem).filter(Boolean)
    : [];
  const payloadTextTemplate = payload.textTemplate
    ? extractTextTemplate(payload.textTemplate, fallbackTextTemplate)
    : extractTextTemplate(payloadTextItems[0] || {}, fallbackTextTemplate);

  return {
    ...fallbackPresent,
    bgColor: payload.backgroundColor || payload.bgColor || fallbackPresent.bgColor,
    bgOpacity: Number(payload.bgOpacity ?? payload.backgroundOpacity ?? fallbackPresent.bgOpacity),
    bgFill: payload.bgFill || fallbackPresent.bgFill,
    bgImageUrl: payload.bgImageUrl || fallbackPresent.bgImageUrl,
    backgroundShape: payload.backgroundShape || fallbackPresent.backgroundShape,
    fontFamily: payload.fontFamily || fallbackPresent.fontFamily,
    textColor: payload.textColor || fallbackPresent.textColor,
    textTemplate: payloadTextTemplate,
    logoItems: payloadLogoItems.length ? payloadLogoItems : fallbackPresent.logoItems,
    textItems: payloadTextItems.length ? payloadTextItems : fallbackPresent.textItems,
  };
};
