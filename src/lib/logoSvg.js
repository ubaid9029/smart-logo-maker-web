import {
  BRAND_WATERMARK_SRC,
  BRAND_WATERMARK_TILE_SIZE,
  BRAND_WATERMARK_PATTERN_GAP,
  BRAND_WATERMARK_ROTATION,
  BRAND_WATERMARK_OPACITY,
} from './watermarkConfig';

const SVG_CARD_WIDTH = 340;
const SVG_CARD_HEIGHT = 250;

const DEFAULT_TEXT_COLOR = '#111827';
const DEFAULT_META_COLOR = '#475569';

const buildEditorFontUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const nextValue = value.trim();
  if (!/^https?:\/\//i.test(nextValue)) {
    return nextValue;
  }

  return `/api/font-proxy?src=${encodeURIComponent(nextValue)}`;
};

const normalizeStringValue = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const isPlaceholderSlogan = (value) => normalizeStringValue(value).toUpperCase() === 'SLOGAN';

const resolveSloganText = (item, options) => {
  const apiSlogan = normalizeStringValue(item?.slogan_name);
  const fallbackSlogan = normalizeStringValue(options?.slogan);

  if (apiSlogan && !isPlaceholderSlogan(apiSlogan)) {
    return apiSlogan;
  }

  if (fallbackSlogan && !isPlaceholderSlogan(fallbackSlogan)) {
    return fallbackSlogan;
  }

  return '';
};

export const normalizeBackgroundColor = (value) => {
  if (!value || typeof value !== 'string') return '#ffffff';
  if (value.startsWith('#')) return value;
  return '#ffffff';
};

export const svgToDataUri = (svgMarkup) => {
  if (!svgMarkup || typeof svgMarkup !== 'string') return null;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`;
};

const clampNumber = (value, fallback = 0) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
};

const escapeXml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const extractSvgParts = (svgMarkup, fallbackViewBox = '0 0 100 100') => {
  if (!svgMarkup || typeof svgMarkup !== 'string') {
    return null;
  }

  const match = svgMarkup.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i);
  if (!match) {
    return {
      innerMarkup: svgMarkup,
      viewBox: fallbackViewBox,
    };
  }

  const attrs = match[1] || '';
  const innerMarkup = match[2] || '';
  const viewBoxMatch = attrs.match(/viewBox="([^"]+)"/i);

  return {
    innerMarkup,
    viewBox: viewBoxMatch?.[1] || fallbackViewBox,
  };
};

const buildStandaloneSvgMarkup = (svgMarkup, options = {}) => {
  if (typeof svgMarkup !== 'string' || !svgMarkup.trim()) {
    return null;
  }

  const width = Math.max(1, clampNumber(options.width, 100));
  const height = Math.max(1, clampNumber(options.height, 100));
  const viewBox = options.viewBox || '0 0 100 100';

  if (!/<svg\b/i.test(svgMarkup)) {
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width.toFixed(2)}" height="${height.toFixed(2)}" viewBox="${escapeXml(viewBox)}" preserveAspectRatio="xMidYMid meet" overflow="visible">`,
      svgMarkup,
      '</svg>',
    ].join('');
  }

  return svgMarkup.replace(/<svg\b([^>]*)>/i, (_match, attrs = '') => {
    const baseAttrs = String(attrs || '')
      .replace(/\sxmlns(?::xlink)?="[^"]*"/gi, '')
      .replace(/\swidth="[^"]*"/gi, '')
      .replace(/\sheight="[^"]*"/gi, '')
      .replace(/\sviewBox="[^"]*"/gi, '')
      .replace(/\spreserveAspectRatio="[^"]*"/gi, '')
      .trim();
    const rebuiltAttrs = [
      'xmlns="http://www.w3.org/2000/svg"',
      'xmlns:xlink="http://www.w3.org/1999/xlink"',
      `width="${width.toFixed(2)}"`,
      `height="${height.toFixed(2)}"`,
      `viewBox="${escapeXml(viewBox)}"`,
      'preserveAspectRatio="xMidYMid meet"',
      'overflow="visible"',
      baseAttrs,
    ].filter(Boolean).join(' ');

    return `<svg ${rebuiltAttrs}>`;
  });
};

const getBoundsFromRatio = (ratio = {}) => {
  const x1 = clampNumber(ratio.x1, 0);
  const y1 = clampNumber(ratio.y1, 0);
  const x2 = clampNumber(ratio.x2, x1 + 1);
  const y2 = clampNumber(ratio.y2, y1 + 1);

  return {
    x1,
    y1,
    width: Math.max(1, x2 - x1),
    height: Math.max(1, y2 - y1),
  };
};

const getRenderableNameSegments = (item) => {
  const nameSegments = Array.isArray(item?.font?.name) ? item.font.name : [];
  return nameSegments.filter((segment) => typeof segment?.path === 'string' && segment.path.trim());
};

const getPrimaryNameSegment = (item) => {
  const segments = getRenderableNameSegments(item);
  return segments[0] || null;
};

const getRenderableSloganSegment = (item) => {
  const rawSlogan = item?.font?.slogan;
  const sloganSegment = Array.isArray(rawSlogan) ? rawSlogan[0] : rawSlogan;
  if (!sloganSegment || typeof sloganSegment?.path !== 'string' || !sloganSegment.path.trim()) {
    return null;
  }

  return sloganSegment;
};

export const getApiBusinessName = (item) => (
  normalizeStringValue(item?.logo_name)
  || normalizeStringValue(item?.company_name)
  || normalizeStringValue(item?.business_name)
  || normalizeStringValue(item?.brand_name)
  || ''
);

export const getApiSloganText = (item) => {
  const sloganText = normalizeStringValue(item?.slogan_name);
  return sloganText && !isPlaceholderSlogan(sloganText) ? sloganText : '';
};

export const getApiTextColor = (item) => {
  const primaryNameSegment = getPrimaryNameSegment(item);
  return primaryNameSegment?.color || normalizeStringValue(item?.name_color) || '';
};

export const getApiFontFamily = (item) => {
  const primaryNameSegment = getPrimaryNameSegment(item);
  return normalizeStringValue(primaryNameSegment?.name);
};

export const hasRenderableApiLogoData = (item) => Boolean(
  getApiBusinessName(item)
  && normalizeStringValue(item?.background_color)
  && getRenderableNameSegments(item).length > 0
);

const parseViewBoxSize = (viewBox = '0 0 100 100') => {
  const [x = 0, y = 0, width = 100, height = 100] = String(viewBox).split(/\s+/).map((value) => clampNumber(value, 0));

  return {
    x,
    y,
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
};

const getResolvedIconAsset = (item) => {
  if (item?.icon_normal) {
    return item.icon_normal;
  }

  if (Array.isArray(item?.name_icon?.list) && item.name_icon.list.length > 0) {
    const indexedAsset = typeof item?.icon_index === 'number'
      ? item.name_icon.list[item.icon_index]
      : null;

    return indexedAsset || item.name_icon.list[0];
  }

  return item?.name_icon || null;
};

const getIconSvgSource = (item) => {
  const iconAsset = getResolvedIconAsset(item);
  return iconAsset?.svg_source_code || iconAsset?.source_code || null;
};

const positionMarkup = (markup, x, y) => (
  `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">${markup}</g>`
);

const getAlignedOffset = (containerWidth, blockWidth, align = 'center', marginLeft = 0) => {
  const safeMarginLeft = clampNumber(marginLeft, 0);
  const freeSpace = Math.max(0, containerWidth - blockWidth);

  if (align === 'left') {
    return Math.min(freeSpace, safeMarginLeft);
  }

  if (align === 'right') {
    return Math.max(0, freeSpace - safeMarginLeft);
  }

  return Math.max(0, (freeSpace / 2) + safeMarginLeft);
};

const buildPathSegmentMarkup = (segment, x, y, targetHeight, fallbackColor) => {
  const bounds = getBoundsFromRatio(segment?.ratioObj);
  const scale = targetHeight / bounds.height;
  const translatedX = Number(x.toFixed(2));
  const translatedY = Number(y.toFixed(2));
  const color = segment?.color || fallbackColor || DEFAULT_TEXT_COLOR;

  return {
    width: Number((bounds.width * scale).toFixed(2)),
    markup: [
      `<g fill="${escapeXml(color)}" transform="translate(${translatedX} ${translatedY}) scale(${scale.toFixed(4)}) translate(${(-bounds.x1).toFixed(2)} ${(-bounds.y1).toFixed(2)})">`,
      segment.path,
      '</g>',
    ].join(''),
  };
};

const buildNameBlock = (segments, targetHeight, fallbackTextColor, fallbackText, maxWidth) => {
  if (!segments.length) {
    let fontSize = targetHeight;
    let width = Math.max(fontSize * 2.4, String(fallbackText || 'BRAND').length * fontSize * 0.58);

    if (maxWidth && width > maxWidth) {
      const scale = maxWidth / width;
      fontSize *= scale;
      width = maxWidth;
    }

    return {
      width,
      height: fontSize,
      markup: [
        `<text x="${(width / 2).toFixed(2)}" y="${(fontSize * 0.82).toFixed(2)}" text-anchor="middle" fill="${escapeXml(fallbackTextColor)}" font-size="${fontSize.toFixed(2)}" font-family="Arial, sans-serif" font-weight="700">`,
        escapeXml(fallbackText),
        '</text>',
      ].join(''),
    };
  }

  const gap = targetHeight * 0.1;
  const renderedSegments = segments.map((segment) => buildPathSegmentMarkup(segment, 0, 0, targetHeight, fallbackTextColor));
  const totalWidth = renderedSegments.reduce((sum, segment, index) => sum + segment.width + (index === renderedSegments.length - 1 ? 0 : gap), 0);
  let currentX = 0;
  const baseMarkup = renderedSegments.map((segment, index) => {
    const markup = segment.markup.replace('translate(0 0)', `translate(${currentX.toFixed(2)} 0)`);
    currentX += segment.width + (index === renderedSegments.length - 1 ? 0 : gap);
    return markup;
  }).join('');

  if (maxWidth && totalWidth > maxWidth) {
    const scale = maxWidth / totalWidth;
    return {
      width: maxWidth,
      height: targetHeight * scale,
      markup: `<g transform="scale(${scale.toFixed(4)})">${baseMarkup}</g>`,
    };
  }

  return {
    width: totalWidth,
    height: targetHeight,
    markup: baseMarkup,
  };
};

const buildInlineNameWithLeadingIcon = (
  item,
  targetHeight,
  fallbackTextColor,
  fallbackText,
  maxWidth,
) => {
  const iconBlock = buildIconBlock(item, targetHeight * 1.45, Math.max(28, targetHeight * 0.95));
  const nameBlock = buildNameBlock([], targetHeight, fallbackTextColor, fallbackText, maxWidth);

  if (!iconBlock) {
    return nameBlock;
  }

  const gap = Math.max(8, targetHeight * 0.14);
  const width = iconBlock.width + gap + nameBlock.width;
  const height = Math.max(iconBlock.height, nameBlock.height);
  const markup = [
    positionMarkup(iconBlock.markup, 0, (height - iconBlock.height) / 2),
    positionMarkup(nameBlock.markup, iconBlock.width + gap, (height - nameBlock.height) / 2),
  ].join('');

  if (maxWidth && width > maxWidth) {
    const scale = maxWidth / width;
    return {
      width: maxWidth,
      height: height * scale,
      markup: `<g transform="scale(${scale.toFixed(4)})">${markup}</g>`,
    };
  }

  return { width, height, markup };
};

const buildSloganBlock = (segment, sloganText, textColor, areaWidth) => {
  if (!segment && !sloganText) {
    return { width: 0, height: 0, markup: '' };
  }

  const blockWidth = Math.max(0, areaWidth);
  const lineGap = 16;
  const displayText = getSloganDisplayText(segment, sloganText);
  const safeText = escapeXml(displayText);
  const maxTextWidth = Math.max(32, blockWidth - 56);
  const estimatedTextWidth = Math.max(48, displayText.length * 7.2);
  const fitRatio = Math.min(1, maxTextWidth / estimatedTextWidth);
  const fontSize = Math.max(8.5, 11 * fitRatio);
  const letterSpacing = Math.max(0.6, 1.3 * fitRatio);
  const textWidth = Math.min(maxTextWidth, estimatedTextWidth * fitRatio);
  const textMarkup = [
    `<text x="${(blockWidth / 2).toFixed(2)}" y="${(fontSize * 0.84).toFixed(2)}" text-anchor="middle" fill="${escapeXml(textColor)}" font-size="${fontSize.toFixed(2)}" font-family="Arial, sans-serif" letter-spacing="${letterSpacing.toFixed(2)}" textLength="${textWidth.toFixed(2)}" lengthAdjust="spacingAndGlyphs">`,
    safeText,
    '</text>',
  ].join('');

  const lineY = 4;
  const leftEnd = Math.max(18, ((blockWidth - textWidth) / 2) - lineGap);
  const rightStart = Math.min(blockWidth - 18, ((blockWidth + textWidth) / 2) + lineGap);

  return {
    width: blockWidth,
    height: 12,
    markup: [
      `<line x1="0" y1="${lineY}" x2="${leftEnd.toFixed(2)}" y2="${lineY}" stroke="${escapeXml(textColor)}" stroke-width="1" opacity="0.35" />`,
      `<line x1="${rightStart.toFixed(2)}" y1="${lineY}" x2="${blockWidth.toFixed(2)}" y2="${lineY}" stroke="${escapeXml(textColor)}" stroke-width="1" opacity="0.35" />`,
      textMarkup,
    ].join(''),
  };
};

const getSloganTextMetrics = (text, width) => {
  const displayText = getSloganDisplayText(null, text);
  const safeWidth = Math.max(32, width);
  const maxTextWidth = Math.max(24, safeWidth - 8);
  const estimatedTextWidth = Math.max(32, displayText.length * 7.2);
  const fitRatio = Math.min(1, maxTextWidth / estimatedTextWidth);
  const fontSize = Math.max(8.5, 11 * fitRatio);
  const letterSpacing = Math.max(0.6, 1.3 * fitRatio);
  const textWidth = Math.min(maxTextWidth, estimatedTextWidth * fitRatio);

  return {
    displayText,
    fontSize,
    letterSpacing,
    textWidth,
  };
};

const buildIconBlock = (item, maxWidth, maxHeight) => {
  const iconAsset = getResolvedIconAsset(item);
  const iconSvg = iconAsset?.svg_source_code || iconAsset?.source_code || null;

  if (!iconSvg) {
    return null;
  }

  const svgParts = extractSvgParts(iconSvg, iconAsset?.view_box || '0 0 100 100');
  if (!svgParts) {
    return null;
  }

  const viewBoxSize = parseViewBoxSize(svgParts.viewBox);
  const scale = Math.min(maxWidth / viewBoxSize.width, maxHeight / viewBoxSize.height);
  const width = viewBoxSize.width * scale;
  const height = viewBoxSize.height * scale;

  return {
    width,
    height,
    markup: [
      `<svg x="0" y="0" width="${width.toFixed(2)}" height="${height.toFixed(2)}" viewBox="${escapeXml(svgParts.viewBox)}" preserveAspectRatio="xMidYMid meet" overflow="visible">`,
      svgParts.innerMarkup,
      '</svg>',
    ].join(''),
  };
};

const shouldUseInlineLeadingIconTemplate = (item, businessName, rawNameSegments = []) => {
  const iconAsset = getResolvedIconAsset(item);
  const layout = String(iconAsset?.layout || '').toLowerCase();
  const safeBusinessName = normalizeStringValue(businessName);

  if (!iconAsset || !getIconSvgSource(item) || layout !== 'left' || safeBusinessName.length < 2) {
    return false;
  }

  if (!Array.isArray(rawNameSegments) || rawNameSegments.length < 2) {
    return false;
  }

  const normalizedSegmentTexts = rawNameSegments
    .map((segment) => normalizeStringValue(segment?.text))
    .filter(Boolean);

  if (normalizedSegmentTexts.length !== rawNameSegments.length) {
    return false;
  }

  if (!normalizedSegmentTexts.every((segmentText) => segmentText.length === 1)) {
    return false;
  }

  return normalizedSegmentTexts[0].toUpperCase() === safeBusinessName.charAt(0).toUpperCase();
};

const detectLogoTemplate = (item, businessName, rawNameSegments) => {
  const iconAsset = getResolvedIconAsset(item);
  const layout = (iconAsset?.layout || '').toLowerCase();
  const hasIcon = Boolean(getIconSvgSource(item));
  const hasNameSegments = rawNameSegments.length > 0;

  let isBadge = false;
  if (layout === '3' || layout === '4' || layout === 'badge' || layout === 'surround' || layout === 'circular') {
    isBadge = true;
  } else if (hasNameSegments && rawNameSegments.length >= 3) {
    let minNY1 = Infinity, maxNY1 = -Infinity, totalH = 0;
    rawNameSegments.forEach(s => {
       if (s?.ratioObj) {
          const b = getBoundsFromRatio(s.ratioObj);
          if (b.y1 < minNY1) minNY1 = b.y1;
          if (b.y1 > maxNY1) maxNY1 = b.y1;
          totalH += b.height;
       }
    });
    if (totalH > 0 && maxNY1 > -Infinity && minNY1 < Infinity) {
       let avgH = totalH / rawNameSegments.length;
       if (maxNY1 - minNY1 > Math.max(15, avgH * 0.8)) {
           isBadge = true;
       }
    }
  }

  if (isBadge && hasIcon && hasNameSegments) {
    return 'badge-native';
  }

  if (shouldUseInlineLeadingIconTemplate(item, businessName, rawNameSegments)) {
    return 'iconline-inline';
  }

  if (hasIcon && layout === 'left') {
    return 'icon-left';
  }

  if (hasIcon && layout === 'middle') {
    return 'icon-middle';
  }

  if (hasIcon && hasNameSegments) {
    return 'icon-stacked';
  }

  if (hasNameSegments) {
    return 'wordmark';
  }

  return 'fallback';
};

const renderLeftTemplate = ({
  item,
  primaryNameSegment,
  nameSegments,
  sloganSegment,
  sloganText,
  textColor,
  sloganColor,
  displayBusinessName,
  nameBaseSize,
  contentX,
  contentWidth,
}) => {
  let iconMarkup = '';
  let nameMarkup = '';
  let sloganMarkup = '';
  const iconBlock = buildIconBlock(item, 90, 90);
  const iconWidth = iconBlock?.width || 0;
  const gapX = iconBlock ? 18 : 0;
  const textAreaWidth = contentWidth - iconWidth - gapX;
  const nameBlock = buildNameBlock(
    nameSegments,
    Math.min(36, Math.max(30, nameBaseSize * 0.92)),
    textColor,
    displayBusinessName,
    textAreaWidth,
  );
  const sloganBlock = buildSloganBlock(sloganSegment, sloganText, sloganColor, textAreaWidth);
  const sloganGap = sloganBlock.markup
    ? Math.max(8, 10 + clampNumber(sloganSegment?.marginTop, 0))
    : 0;
  const textStackHeight = nameBlock.height + (sloganBlock.markup ? sloganGap + sloganBlock.height : 0);
  const totalHeight = Math.max(iconBlock?.height || 0, textStackHeight);
  const startY = (SVG_CARD_HEIGHT - totalHeight) / 2;
  const iconY = startY + ((totalHeight - (iconBlock?.height || 0)) / 2);
  const textY = startY + ((totalHeight - textStackHeight) / 2);
  const textX = contentX + iconWidth + gapX;

  if (iconBlock) {
    iconMarkup = positionMarkup(iconBlock.markup, contentX, iconY);
  }

  nameMarkup = positionMarkup(
    nameBlock.markup,
    textX + getAlignedOffset(textAreaWidth, nameBlock.width, primaryNameSegment?.align, primaryNameSegment?.marginLeft),
    textY,
  );

  if (sloganBlock.markup) {
    sloganMarkup = positionMarkup(sloganBlock.markup, textX, textY + nameBlock.height + sloganGap);
  }

  return { iconMarkup, nameMarkup, sloganMarkup };
};

const renderStackedTemplate = ({
  item,
  primaryNameSegment,
  nameSegments,
  sloganSegment,
  sloganText,
  textColor,
  sloganColor,
  displayBusinessName,
  nameBaseSize,
  contentX,
  contentWidth,
}) => {
  let iconMarkup = '';
  let nameMarkup = '';
  let sloganMarkup = '';
  const iconBlock = buildIconBlock(item, 124, 96);
  const nameBlock = buildNameBlock(
    nameSegments,
    Math.min(iconBlock ? 40 : 48, Math.max(iconBlock ? 32 : 36, nameBaseSize)),
    textColor,
    displayBusinessName,
    contentWidth,
  );
  const sloganBlock = buildSloganBlock(sloganSegment, sloganText, sloganColor, contentWidth);
  const gapAfterIcon = iconBlock ? Math.max(12, 10 + clampNumber(primaryNameSegment?.marginTop, 0)) : 0;
  const gapAfterName = sloganBlock.markup ? Math.max(8, 10 + clampNumber(sloganSegment?.marginTop, 0)) : 0;
  const totalHeight = (iconBlock?.height || 0) + gapAfterIcon + nameBlock.height + gapAfterName + (sloganBlock.markup ? sloganBlock.height : 0);
  const startY = (SVG_CARD_HEIGHT - totalHeight) / 2;
  let cursorY = startY;

  if (iconBlock) {
    iconMarkup = positionMarkup(iconBlock.markup, (SVG_CARD_WIDTH - iconBlock.width) / 2, cursorY);
    cursorY += iconBlock.height + gapAfterIcon;
  }

  nameMarkup = positionMarkup(
    nameBlock.markup,
    contentX + getAlignedOffset(contentWidth, nameBlock.width, primaryNameSegment?.align, primaryNameSegment?.marginLeft),
    cursorY,
  );
  cursorY += nameBlock.height;

  if (sloganBlock.markup) {
    cursorY += gapAfterName;
    sloganMarkup = positionMarkup(sloganBlock.markup, contentX, cursorY);
  }

  return { iconMarkup, nameMarkup, sloganMarkup };
};

const renderMiddleTemplate = ({
  item,
  primaryNameSegment,
  nameSegments,
  sloganSegment,
  sloganText,
  textColor,
  sloganColor,
  displayBusinessName,
  nameBaseSize,
  contentX,
  contentWidth,
}) => {
  let iconMarkup = '';
  let nameMarkup = '';
  let sloganMarkup = '';

  const iconBlock = buildIconBlock(item, 90, 90);
  const nameBlock = buildNameBlock(
    nameSegments,
    Math.min(38, Math.max(28, nameBaseSize * 0.88)),
    textColor,
    displayBusinessName,
    contentWidth,
  );
  const sloganBlock = buildSloganBlock(sloganSegment, sloganText, sloganColor, contentWidth);

  const gapAfterIcon = iconBlock ? Math.max(10, 8 + clampNumber(primaryNameSegment?.marginTop, 0)) : 0;
  const gapAfterName = sloganBlock.markup ? Math.max(8, 10 + clampNumber(sloganSegment?.marginTop, 0)) : 0;
  const totalHeight = (iconBlock?.height || 0) + gapAfterIcon + nameBlock.height + gapAfterName + (sloganBlock.markup ? sloganBlock.height : 0);
  const startY = (SVG_CARD_HEIGHT - totalHeight) / 2 + 4;
  let cursorY = startY;

  if (iconBlock) {
    iconMarkup = positionMarkup(iconBlock.markup, (SVG_CARD_WIDTH - iconBlock.width) / 2, cursorY);
    cursorY += iconBlock.height + gapAfterIcon;
  }

  nameMarkup = positionMarkup(
    nameBlock.markup,
    contentX + getAlignedOffset(contentWidth, nameBlock.width, primaryNameSegment?.align, primaryNameSegment?.marginLeft),
    cursorY,
  );
  cursorY += nameBlock.height;

  if (sloganBlock.markup) {
    cursorY += gapAfterName;
    sloganMarkup = positionMarkup(sloganBlock.markup, contentX, cursorY);
  }

  return { iconMarkup, nameMarkup, sloganMarkup };
};

const renderInlineLeadingIconTemplate = ({
  item,
  sloganSegment,
  sloganText,
  textColor,
  sloganColor,
  displayBusinessName,
  nameBaseSize,
  contentX,
  contentWidth,
}) => {
  const inlineNameBlock = buildInlineNameWithLeadingIcon(
    item,
    Math.min(42, Math.max(34, nameBaseSize)),
    textColor,
    displayBusinessName,
    contentWidth,
  );
  const sloganBlock = buildSloganBlock(sloganSegment, sloganText, sloganColor, contentWidth);
  const gapAfterName = sloganBlock.markup ? 16 : 0;
  const totalHeight = inlineNameBlock.height + gapAfterName + (sloganBlock.markup ? sloganBlock.height : 0);
  let cursorY = (SVG_CARD_HEIGHT - totalHeight) / 2;

  const nameMarkup = positionMarkup(
    inlineNameBlock.markup,
    contentX + Math.max(0, (contentWidth - inlineNameBlock.width) / 2),
    cursorY,
  );
  cursorY += inlineNameBlock.height;

  const sloganMarkup = sloganBlock.markup
    ? positionMarkup(sloganBlock.markup, contentX, cursorY + gapAfterName)
    : '';

  return {
    iconMarkup: '',
    nameMarkup,
    sloganMarkup,
  };
};

const estimatePathBounds = (pathStr) => {
  if (!pathStr || typeof pathStr !== 'string') return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const regex = /[MmLlCcQqZz]\s*([^A-Za-z]+)?/g;
  let match;
  while ((match = regex.exec(pathStr)) !== null) {
      if (!match[1]) continue;
      const coords = match[1].match(/-?\d*\.?\d+/g);
      if (coords && coords.length >= 2) {
          for (let i = 0; i < coords.length - 1; i += 2) {
              const x = parseFloat(coords[i]);
              const y = parseFloat(coords[i+1]);
              if (!isNaN(x)) {
                 minX = Math.min(minX, x);
                 maxX = Math.max(maxX, x);
              }
              if (!isNaN(y)) {
                 minY = Math.min(minY, y);
                 maxY = Math.max(maxY, y);
              }
          }
      }
  }
  if (minX === Infinity) return null;
  return { x1: minX, y1: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
};

const getRobustBounds = (segment) => {
  if (segment?.path) {
      const pb = estimatePathBounds(segment.path);
      if (pb && pb.width > 0) return pb;
  }
  if (segment?.ratioObj) {
      return getBoundsFromRatio(segment.ratioObj);
  }
  return null;
};

const renderBadgeTemplate = ({
  item,
  rawNameSegments,
  sloganSegment,
  textColor,
  sloganColor,
}) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const updateExtents = (bounds) => {
    if (!bounds || bounds.width <= 0) return;
    minX = Math.min(minX, bounds.x1);
    minY = Math.min(minY, bounds.y1);
    maxX = Math.max(maxX, bounds.x1 + bounds.width);
    maxY = Math.max(maxY, bounds.y1 + bounds.height);
  };
  
  const iconAsset = getResolvedIconAsset(item);
  if (iconAsset?.ratioObj) updateExtents(getBoundsFromRatio(iconAsset.ratioObj));
  rawNameSegments.forEach(s => updateExtents(getRobustBounds(s)));
  if (sloganSegment) updateExtents(getRobustBounds(sloganSegment));
  
  if (minX === Infinity) {
    return { iconMarkup:'', nameMarkup:'', sloganMarkup:'' }; 
  }
  
  const nativeWidth = Math.max(1, maxX - minX);
  const nativeHeight = Math.max(1, maxY - minY);
  const maxWidth = SVG_CARD_WIDTH - 60;
  const maxHeight = SVG_CARD_HEIGHT - 60;
  const scale = Math.min(maxWidth / nativeWidth, maxHeight / nativeHeight);
  
  const scaledWidth = nativeWidth * scale;
  const scaledHeight = nativeHeight * scale;
  const startX = (SVG_CARD_WIDTH - scaledWidth) / 2;
  const startY = (SVG_CARD_HEIGHT - scaledHeight) / 2;
  
  let iconMarkup = '';
  if (iconAsset?.ratioObj) {
     const b = getBoundsFromRatio(iconAsset.ratioObj);
     const iconSvg = iconAsset?.svg_source_code || iconAsset?.source_code || '';
     const svgParts = extractSvgParts(iconSvg, iconAsset?.view_box || '0 0 100 100');
     if (svgParts) {
       const ix = startX + (b.x1 - minX) * scale;
       const iy = startY + (b.y1 - minY) * scale;
       const iw = b.width * scale;
       const ih = b.height * scale;
       iconMarkup = [
         `<svg x="${ix.toFixed(2)}" y="${iy.toFixed(2)}" width="${iw.toFixed(2)}" height="${ih.toFixed(2)}" viewBox="${escapeXml(svgParts.viewBox)}" preserveAspectRatio="xMidYMid meet" overflow="visible">`,
         svgParts.innerMarkup,
         '</svg>',
       ].join('');
     }
  }
  
  const nameMarkupChunks = rawNameSegments.map(segment => {
     const b = getRobustBounds(segment) || { x1: 0, y1: 0 };
     const ix = startX + (b.x1 - minX) * scale;
     const iy = startY + (b.y1 - minY) * scale;
     const fillCol = segment?.color || textColor;
     return [
       `<g fill="${escapeXml(fillCol)}" transform="translate(${ix.toFixed(2)} ${iy.toFixed(2)}) scale(${scale.toFixed(4)}) translate(${(-b.x1).toFixed(2)} ${(-b.y1).toFixed(2)})">`,
       segment.path,
       '</g>'
     ].join('');
  });
  const nameMarkup = nameMarkupChunks.join('');
  
  let sloganMarkup = '';
  if (sloganSegment) {
     const b = getRobustBounds(sloganSegment) || { x1: 0, y1: 0 };
     const ix = startX + (b.x1 - minX) * scale;
     const iy = startY + (b.y1 - minY) * scale;
     const fillCol = sloganSegment?.color || sloganColor;
     sloganMarkup = [
       `<g fill="${escapeXml(fillCol)}" transform="translate(${ix.toFixed(2)} ${iy.toFixed(2)}) scale(${scale.toFixed(4)}) translate(${(-b.x1).toFixed(2)} ${(-b.y1).toFixed(2)})">`,
       sloganSegment.path,
       '</g>'
     ].join('');
  }
  
  return { iconMarkup, nameMarkup, sloganMarkup };
};

export const buildLogoCardSvg = (item, options = {}) => {
  const businessName = (item?.logo_name || options.businessName || 'BRAND').trim();
  const backgroundColor = normalizeBackgroundColor(item?.background_color);
  const primaryNameSegment = getPrimaryNameSegment(item);
  const sloganSegment = getRenderableSloganSegment(item);
  const sloganText = resolveSloganText(item, options);
  const textColor = primaryNameSegment?.color || item?.name_color || options.textColor || DEFAULT_TEXT_COLOR;
  const sloganColor = sloganSegment?.color || options.metaColor || DEFAULT_META_COLOR;
  const rawNameSegments = getRenderableNameSegments(item);
  const iconLayout = (getResolvedIconAsset(item)?.layout || '').toLowerCase();
  const hasSlogan = Boolean(sloganText || sloganSegment);
  const contentWidth = SVG_CARD_WIDTH - 48;
  const contentX = 24;
  const nameBaseSize = clampNumber(primaryNameSegment?.size, hasSlogan ? 40 : 46);
  const template = detectLogoTemplate(item, businessName, rawNameSegments);
  const useInlineLeadingIcon = template === 'iconline-inline';
  const useLeadingLetterIconReplacement = shouldUseInlineLeadingIconTemplate(item, businessName, rawNameSegments);
  const displayBusinessName = (useInlineLeadingIcon || useLeadingLetterIconReplacement) && businessName.length > 1
    ? businessName.slice(1).trim() || businessName
    : businessName;
  const nameSegments = useLeadingLetterIconReplacement ? rawNameSegments.slice(1) : rawNameSegments;

  let iconMarkup = '';
  let nameMarkup = '';
  let sloganMarkup = '';

  const renderArgs = {
    item,
    primaryNameSegment,
    nameSegments,
    sloganSegment,
    sloganText,
    textColor,
    sloganColor,
    displayBusinessName,
    nameBaseSize,
    contentX,
    contentWidth,
    iconLayout,
  };

  if (template === 'iconline-inline') {
    ({ iconMarkup, nameMarkup, sloganMarkup } = renderInlineLeadingIconTemplate(renderArgs));
  } else if (template === 'icon-left') {
    ({ iconMarkup, nameMarkup, sloganMarkup } = renderLeftTemplate(renderArgs));
  } else if (template === 'icon-middle') {
    ({ iconMarkup, nameMarkup, sloganMarkup } = renderMiddleTemplate(renderArgs));
  } else if (template === 'badge-native') {
    ({ iconMarkup, nameMarkup, sloganMarkup } = renderBadgeTemplate({
      item,
      rawNameSegments,
      sloganSegment,
      textColor,
      sloganColor,
    }));
  } else {
    ({ iconMarkup, nameMarkup, sloganMarkup } = renderStackedTemplate(renderArgs));
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${SVG_CARD_WIDTH} ${SVG_CARD_HEIGHT}" preserveAspectRatio="xMidYMid meet">`,
    `<rect x="0" y="0" width="${SVG_CARD_WIDTH}" height="${SVG_CARD_HEIGHT}" rx="28" fill="${escapeXml(backgroundColor)}" />`,
    iconMarkup,
    nameMarkup,
    sloganMarkup,
    '</svg>',
  ].join('');
};

const EDITOR_CARD_X = 40;
const EDITOR_CARD_Y = 40;
const EDITOR_CARD_WIDTH = 620;
const EDITOR_CARD_HEIGHT = 420;

const scaleEditorPosX = (value) => EDITOR_CARD_X + (value / SVG_CARD_WIDTH) * EDITOR_CARD_WIDTH;
const scaleEditorPosY = (value) => EDITOR_CARD_Y + (value / SVG_CARD_HEIGHT) * EDITOR_CARD_HEIGHT;
const scaleEditorWidth = (value) => (value / SVG_CARD_WIDTH) * EDITOR_CARD_WIDTH;
const scaleEditorHeight = (value) => (value / SVG_CARD_HEIGHT) * EDITOR_CARD_HEIGHT;

const buildBlockSvgDataUri = (width, height, markup) => {
  if (!markup || width <= 0 || height <= 0) {
    return null;
  }

  return svgToDataUri([
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" overflow="visible">`,
    markup,
    '</svg>',
  ].join(''));
};

const getSloganDisplayText = (segment, sloganText) => {
  const normalizedSloganText = normalizeStringValue(sloganText);
  const segmentText = normalizeStringValue(segment?.text);
  return (normalizedSloganText || segmentText).toUpperCase();
};

const buildSloganTextMarkup = (text, textColor, width) => {
  const { displayText, fontSize, letterSpacing, textWidth } = getSloganTextMetrics(text, width);
  const safeText = escapeXml(displayText);
  const safeWidth = Math.max(32, width);

  return [
    `<text x="${(safeWidth / 2).toFixed(2)}" y="${(fontSize * 0.84).toFixed(2)}" text-anchor="middle" fill="${escapeXml(textColor)}" font-size="${fontSize.toFixed(2)}" font-family="Arial, sans-serif" letter-spacing="${letterSpacing.toFixed(2)}" textLength="${textWidth.toFixed(2)}" lengthAdjust="spacingAndGlyphs">`,
    safeText,
    '</text>',
  ].join('');
};

export const buildEditableLogoPayload = (item, options = {}) => {
  // Keep editor payload aligned with the exact text the results SVG uses.
  // Results rendering prefers `item.logo_name` (when present) which can differ in casing
  // from the user-entered business name. We mirror that priority here so editor matches previews.
  const businessName = (
    normalizeStringValue(item?.logo_name)
    || normalizeStringValue(options?.businessName)
    || normalizeStringValue(item?.company_name)
    || normalizeStringValue(item?.business_name)
    || normalizeStringValue(item?.brand_name)
    || 'BRAND'
  );
  const backgroundColor = normalizeBackgroundColor(item?.background_color || options.backgroundColor);
  const primaryNameSegment = getPrimaryNameSegment(item);
  const sloganSegment = getRenderableSloganSegment(item);
  const sloganText = resolveSloganText(item, options);
  const textColor = primaryNameSegment?.color || item?.name_color || options.textColor || DEFAULT_TEXT_COLOR;
  const sloganColor = sloganSegment?.color || options.metaColor || DEFAULT_META_COLOR;
  const rawNameSegments = getRenderableNameSegments(item);
  const contentWidth = SVG_CARD_WIDTH - 48;
  const contentX = 24;
  const nameBaseSize = clampNumber(primaryNameSegment?.size, sloganText || sloganSegment ? 40 : 46);
  const template = detectLogoTemplate(item, businessName, rawNameSegments);
  const useLeadingLetterIconReplacement = shouldUseInlineLeadingIconTemplate(item, businessName, rawNameSegments);
  const iconAsset = getResolvedIconAsset(item);
  const iconSvgSource = getIconSvgSource(item);
  const iconParts = extractSvgParts(iconSvgSource, iconAsset?.view_box || '0 0 100 100');
  const displayBusinessName = useLeadingLetterIconReplacement && businessName.length > 1
    ? businessName.slice(1).trim() || businessName
    : businessName;
  const sloganDisplayText = getSloganDisplayText(sloganSegment, sloganText);
  const preferredFontFamily = primaryNameSegment?.name || options.fontFamily || 'Arial';
  const preferredFontUrl = buildEditorFontUrl(primaryNameSegment?.font_url || null);
  const sloganFontFamily = sloganSegment?.name || preferredFontFamily;
  const sloganFontUrl = buildEditorFontUrl(sloganSegment?.font_url || null) || preferredFontUrl;
  const nameSegments = useLeadingLetterIconReplacement ? rawNameSegments.slice(1) : rawNameSegments;

  let iconFrame = null;
  let nameFrame = null;
  let sloganFrame = null;
  let nameSvgDataUri = null;
  let sloganSvgDataUri = null;

  if (template === 'badge-native') {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const updateExtents = (bounds) => {
      if (!bounds || bounds.width <= 0) return;
      minX = Math.min(minX, bounds.x1);
      minY = Math.min(minY, bounds.y1);
      maxX = Math.max(maxX, bounds.x1 + bounds.width);
      maxY = Math.max(maxY, bounds.y1 + bounds.height);
    };
    
    if (iconAsset?.ratioObj) updateExtents(getBoundsFromRatio(iconAsset.ratioObj));
    rawNameSegments.forEach(s => updateExtents(getRobustBounds(s)));
    if (sloganSegment) updateExtents(getRobustBounds(sloganSegment));
    
    if (minX !== Infinity) {
      const nativeW = Math.max(1, maxX - minX);
      const nativeH = Math.max(1, maxY - minY);
      const maxW = EDITOR_CARD_WIDTH - 80;
      const maxH = EDITOR_CARD_HEIGHT - 80;
      const scale = Math.min(maxW / nativeW, maxH / nativeH);
      
      const scaledW = nativeW * scale;
      const scaledH = nativeH * scale;
      const startX = EDITOR_CARD_X + (EDITOR_CARD_WIDTH - scaledW) / 2;
      const startY = EDITOR_CARD_Y + (EDITOR_CARD_HEIGHT - scaledH) / 2;

      if (iconAsset?.ratioObj && iconParts) {
         const b = getBoundsFromRatio(iconAsset.ratioObj);
         iconFrame = {
            x: startX + (b.x1 - minX) * scale,
            y: startY + (b.y1 - minY) * scale,
            width: b.width * scale,
            height: b.height * scale,
            viewBox: iconParts.viewBox,
            innerMarkup: iconParts.innerMarkup
         };
      }
      
      if (rawNameSegments.length > 0) {
         let nMinX = Infinity, nMinY = Infinity, nMaxX = -Infinity, nMaxY = -Infinity;
         rawNameSegments.forEach(s => {
            const b = getRobustBounds(s);
            if (!b) return;
            nMinX = Math.min(nMinX, b.x1);
            nMinY = Math.min(nMinY, b.y1);
            nMaxX = Math.max(nMaxX, b.x1 + b.width);
            nMaxY = Math.max(nMaxY, b.y1 + b.height);
         });
         
         const bnW = Math.max(1, nMaxX - nMinX);
         const bnH = Math.max(1, nMaxY - nMinY);
         
         const nameMarkupChunks = rawNameSegments.map(segment => {
            const b = getRobustBounds(segment) || { x1: 0, y1: 0 };
            const ix = (b.x1 - nMinX);
            const iy = (b.y1 - nMinY);
            return `<g fill="${escapeXml(segment?.color || textColor)}" transform="translate(${ix.toFixed(2)} ${iy.toFixed(2)}) translate(${(-b.x1).toFixed(2)} ${(-b.y1).toFixed(2)})">${segment.path || ''}</g>`;
         });
         
         nameFrame = {
            x: startX + (nMinX - minX) * scale,
            y: startY + (nMinY - minY) * scale,
            width: bnW * scale,
            height: bnH * scale,
            fontSize: Math.max(12, 40 * scale),
            align: 'center',
            color: textColor,
         };
         nameSvgDataUri = buildBlockSvgDataUri(bnW, bnH, nameMarkupChunks.join(''));
      }
      
      if (sloganSegment) {
         const b = getRobustBounds(sloganSegment) || { x1: 0, y1: 0, width: 100, height: 100 };
         sloganFrame = {
            x: startX + (b.x1 - minX) * scale,
            y: startY + (b.y1 - minY) * scale,
            width: b.width * scale,
            height: b.height * scale,
            color: sloganSegment?.color || sloganColor,
         };
         const markup = `<g fill="${escapeXml(sloganFrame.color)}" transform="translate(0 0) translate(${(-b.x1).toFixed(2)} ${(-b.y1).toFixed(2)})">${sloganSegment.path || ''}</g>`;
         sloganSvgDataUri = buildBlockSvgDataUri(Math.max(1, b.width), Math.max(1, b.height), markup);
      }
    }
  } else if (template === 'icon-left') {
    const iconBlock = buildIconBlock(item, 90, 90);
    const iconWidth = iconBlock?.width || 0;
    const gapX = iconBlock ? 18 : 0;
    const textAreaWidth = contentWidth - iconWidth - gapX;
    const nameBlock = buildNameBlock(nameSegments, Math.min(36, Math.max(30, nameBaseSize * 0.92)), textColor, displayBusinessName, textAreaWidth);
    const sloganBlock = buildSloganBlock(sloganSegment, sloganText, sloganColor, textAreaWidth);
    const sloganGap = sloganBlock.markup ? Math.max(8, 10 + clampNumber(sloganSegment?.marginTop, 0)) : 0;
    const textStackHeight = nameBlock.height + (sloganBlock.markup ? sloganGap + sloganBlock.height : 0);
    const totalHeight = Math.max(iconBlock?.height || 0, textStackHeight);
    const startY = (SVG_CARD_HEIGHT - totalHeight) / 2;

    if (iconBlock && iconParts) {
      iconFrame = {
        x: contentX,
        y: startY + ((totalHeight - iconBlock.height) / 2),
        width: iconBlock.width,
        height: iconBlock.height,
        viewBox: iconParts.viewBox,
        innerMarkup: iconParts.innerMarkup,
      };
    }

    const textX = contentX + iconWidth + gapX;
    const textY = startY + ((totalHeight - textStackHeight) / 2);
    nameFrame = {
      x: textX + getAlignedOffset(textAreaWidth, nameBlock.width, primaryNameSegment?.align, primaryNameSegment?.marginLeft),
      y: textY,
      width: nameBlock.width,
      height: nameBlock.height,
      fontSize: Math.min(36, Math.max(30, nameBaseSize * 0.92)),
      align: primaryNameSegment?.align || 'center',
      color: textColor,
    };
    nameSvgDataUri = buildBlockSvgDataUri(nameBlock.width, nameBlock.height, nameBlock.markup);

    if (sloganBlock.markup || sloganText || sloganSegment) {
      const sloganTextMetrics = getSloganTextMetrics(sloganDisplayText, textAreaWidth);
      const sloganElementWidth = Math.min(
        textAreaWidth,
        Math.max(48, sloganTextMetrics.textWidth + 24)
      );
      sloganFrame = {
        x: textX + Math.max(0, (textAreaWidth - sloganElementWidth) / 2),
        y: textY + nameBlock.height + sloganGap,
        width: sloganElementWidth,
        height: sloganBlock.height || 12,
        areaX: textX,
        areaWidth: textAreaWidth,
        color: sloganColor,
      };

      const sloganMarkup = buildSloganTextMarkup(sloganDisplayText, sloganColor, sloganFrame.width);

      sloganSvgDataUri = buildBlockSvgDataUri(sloganFrame.width, sloganFrame.height, sloganMarkup);
    }
  } else {
    const iconBlock = buildIconBlock(item, template === 'icon-middle' ? 90 : 124, template === 'icon-middle' ? 90 : 96);
    const nameFontSize = template === 'icon-middle'
      ? Math.min(38, Math.max(28, nameBaseSize * 0.88))
      : Math.min(iconBlock ? 40 : 48, Math.max(iconBlock ? 32 : 36, nameBaseSize));
    const nameBlock = buildNameBlock(nameSegments, nameFontSize, textColor, displayBusinessName, contentWidth);
    const sloganBlock = buildSloganBlock(sloganSegment, sloganText, sloganColor, contentWidth);
    const gapAfterIcon = iconBlock
      ? (template === 'icon-middle'
        ? Math.max(10, 8 + clampNumber(primaryNameSegment?.marginTop, 0))
        : Math.max(12, 10 + clampNumber(primaryNameSegment?.marginTop, 0)))
      : 0;
    const gapAfterName = sloganBlock.markup ? Math.max(8, 10 + clampNumber(sloganSegment?.marginTop, 0)) : 0;
    const totalHeight = (iconBlock?.height || 0) + gapAfterIcon + nameBlock.height + gapAfterName + (sloganBlock.markup ? sloganBlock.height : 0);
    let cursorY = (SVG_CARD_HEIGHT - totalHeight) / 2 + (template === 'icon-middle' ? 4 : 0);

    if (iconBlock && iconParts) {
      iconFrame = {
        x: (SVG_CARD_WIDTH - iconBlock.width) / 2,
        y: cursorY,
        width: iconBlock.width,
        height: iconBlock.height,
        viewBox: iconParts.viewBox,
        innerMarkup: iconParts.innerMarkup,
      };
      cursorY += iconBlock.height + gapAfterIcon;
    }

    nameFrame = {
      x: contentX + getAlignedOffset(contentWidth, nameBlock.width, primaryNameSegment?.align, primaryNameSegment?.marginLeft),
      y: cursorY,
      width: nameBlock.width,
      height: nameBlock.height,
      fontSize: nameFontSize,
      align: primaryNameSegment?.align || 'center',
      color: textColor,
    };
    nameSvgDataUri = buildBlockSvgDataUri(nameBlock.width, nameBlock.height, nameBlock.markup);
    cursorY += nameBlock.height;

    if (sloganBlock.markup || sloganText || sloganSegment) {
      cursorY += gapAfterName;
      const sloganTextMetrics = getSloganTextMetrics(sloganDisplayText, contentWidth);
      const sloganElementWidth = Math.min(
        contentWidth,
        Math.max(48, sloganTextMetrics.textWidth + 24)
      );
      sloganFrame = {
        x: contentX + Math.max(0, (contentWidth - sloganElementWidth) / 2),
        y: cursorY,
        width: sloganElementWidth,
        height: sloganBlock.height || 12,
        areaX: contentX,
        areaWidth: contentWidth,
        color: sloganColor,
      };

      const sloganMarkup = buildSloganTextMarkup(sloganDisplayText, sloganColor, sloganFrame.width);

      sloganSvgDataUri = buildBlockSvgDataUri(sloganFrame.width, sloganFrame.height, sloganMarkup);
    }
  }

  const logoItems = [];
  const textItems = [];

  if (iconFrame) {
    const iconFrameMarkup = [
      `<svg x="0" y="0" width="${iconFrame.width.toFixed(2)}" height="${iconFrame.height.toFixed(2)}" viewBox="${escapeXml(iconFrame.viewBox)}" preserveAspectRatio="xMidYMid meet">`,
      iconFrame.innerMarkup,
      '</svg>',
    ].join('');
    const iconImageUrl = buildBlockSvgDataUri(iconFrame.width, iconFrame.height, iconFrameMarkup)
      || svgToDataUri(buildStandaloneSvgMarkup(iconSvgSource || iconFrame.innerMarkup, {
        width: iconFrame.width,
        height: iconFrame.height,
        viewBox: iconFrame.viewBox,
      }) || iconFrameMarkup);
    const iconX = scaleEditorPosX(iconFrame.x);
    const iconY = scaleEditorPosY(iconFrame.y);
    const iconWidth = scaleEditorWidth(iconFrame.width);
    const iconHeight = scaleEditorHeight(iconFrame.height);

    logoItems.push({
      id: 'icon',
      type: 'svg',
      src: iconImageUrl,
      imageUrl: iconImageUrl,
      x: iconX,
      y: iconY,
      width: iconWidth,
      height: iconHeight,
      baseWidth: iconWidth,
      baseHeight: iconHeight,
      preserveContentBounds: true,
      transform: {
        x: iconX,
        y: iconY,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    });
  }

  if (nameFrame) {
    textItems.push({
      id: 'brand-name',
      type: 'text',
      text: displayBusinessName,
      x: scaleEditorPosX(nameFrame.x),
      y: scaleEditorPosY(nameFrame.y),
      width: scaleEditorWidth(nameFrame.width),
      height: Math.max(30, scaleEditorHeight(nameFrame.height)),
      fontSize: Math.max(18, scaleEditorHeight(nameFrame.fontSize)),
      align: nameFrame.align,
      fill: nameFrame.color,
      fontFamily: preferredFontFamily,
      fontUrl: preferredFontUrl,
      fontStyle: primaryNameSegment?.style || 'normal',
      renderMode: nameSvgDataUri ? 'svg' : 'text',
      svgDataUri: nameSvgDataUri,
      style: {
        fillColor: nameFrame.color,
        outlineColor: '#111827',
        outlineWidth: 0,
        applyColorOverrides: false,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
      },
    });
  }

  if (sloganFrame && (sloganDisplayText || sloganSegment)) {
    const scaledX = scaleEditorPosX(sloganFrame.x);
    const scaledY = scaleEditorPosY(sloganFrame.y);
    const scaledWidth = scaleEditorWidth(sloganFrame.width);
    const scaledHeight = scaleEditorHeight(sloganFrame.height);
    const scaledAreaX = scaleEditorPosX(sloganFrame.areaX ?? sloganFrame.x);
    const scaledAreaWidth = scaleEditorWidth(sloganFrame.areaWidth || sloganFrame.width);
    const lineGap = 32;
    const leftEnd = Math.max(18, (scaledX - scaledAreaX) - lineGap);
    const rightStart = Math.min(scaledAreaWidth - 18, (scaledX - scaledAreaX) + scaledWidth + lineGap);

    logoItems.push({
      id: 'slogan-line-left',
      type: 'line',
      x1: scaledAreaX,
      y1: scaledY + 8,
      x2: scaledAreaX + leftEnd,
      y2: scaledY + 8,
      stroke: sloganFrame.color,
      opacity: 0.35,
      strokeWidth: 2,
    });

    logoItems.push({
      id: 'slogan-line-right',
      type: 'line',
      x1: scaledAreaX + rightStart,
      y1: scaledY + 8,
      x2: scaledAreaX + scaledAreaWidth,
      y2: scaledY + 8,
      stroke: sloganFrame.color,
      opacity: 0.35,
      strokeWidth: 2,
    });

      textItems.push({
        id: 'slogan',
      type: 'text',
      text: sloganDisplayText,
      x: scaledX,
      y: scaledY,
      width: scaledWidth,
      height: Math.max(16, scaledHeight),
      fontSize: Math.max(12, scaledHeight),
        align: 'center',
        fill: sloganFrame.color,
        fontFamily: sloganFontFamily,
        fontUrl: sloganFontUrl,
        fontStyle: sloganSegment?.style || 'normal',
        letterSpacing: 2,
        renderMode: sloganSvgDataUri ? 'svg' : 'text',
        svgDataUri: sloganSvgDataUri,
        style: {
          fillColor: sloganFrame.color,
          outlineColor: '#111827',
          outlineWidth: 0,
          applyColorOverrides: false,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
        },
      });
  }

  return {
    backgroundColor,
    watermarkEnabled: true,
    textColor,
    fontFamily: preferredFontFamily,
    textTemplate: {
      fontSize: textItems[0]?.fontSize || Math.max(18, scaleEditorHeight(nameBaseSize)),
      align: textItems[0]?.align || 'center',
      fill: textItems[0]?.fill || textColor,
      fontFamily: preferredFontFamily,
      fontUrl: textItems[0]?.fontUrl || preferredFontUrl,
      fontStyle: textItems[0]?.fontStyle || primaryNameSegment?.style || 'normal',
      letterSpacing: Number(textItems[0]?.letterSpacing || 0),
      style: {
        fillColor: textItems[0]?.style?.fillColor || textColor,
        outlineColor: textItems[0]?.style?.outlineColor || '#111827',
        outlineWidth: Number(textItems[0]?.style?.outlineWidth || 0),
        applyColorOverrides: Boolean(textItems[0]?.style?.applyColorOverrides),
        rotateX: Number(textItems[0]?.style?.rotateX || 0),
        rotateY: Number(textItems[0]?.style?.rotateY || 0),
        rotateZ: Number(textItems[0]?.style?.rotateZ || 0),
      },
    },
    svgDataUri: svgToDataUri(buildLogoCardSvg(item, options)),
    logoItems,
    textItems,
  };
};
