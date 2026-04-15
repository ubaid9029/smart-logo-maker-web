"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Layer, Line, Path as KonvaPath, Rect, Shape as KonvaShape, Stage, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import { applySvgPresentationToMarkup, clampTransformToCard, getEditorTextValue, getOrderedCanvasItems, getTextBlockMetrics, getTextTypography, isBackgroundCanvasItem, isCanvasItemLocked, normalizeFillGradient, syncCanvasLayerOrder } from './editorUtils';
import { CARD_CORNER_RADIUS } from './editorConstants';
import {
  BRAND_WATERMARK_OPACITY,
  BRAND_WATERMARK_OVERLAY_INSET,
  BRAND_WATERMARK_OVERLAY_SCALE,
  BRAND_WATERMARK_PATTERN_STYLE,
  BRAND_WATERMARK_ROTATION,
} from '../../lib/watermarkConfig';

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;

const getAxisTilt = (angle) => {
  const normalized = ((Number(angle || 0) % 360) + 360) % 360;

  if (normalized === 0 || normalized === 180 || normalized === 360) {
    return 0;
  }

  const radians = (normalized * Math.PI) / 180;
  // Konva skew values work best in a very small radian range.
  // Keep the 3D feel subtle and stable instead of collapsing the element.
  return Number((Math.sin(radians) * 0.22).toFixed(4));
};

const get3dTransforms = (style = {}) => {
  const rotateX = Number(style.rotateX || 0);
  const rotateY = Number(style.rotateY || 0);
  const rotateZ = Number(style.rotateZ || 0);
  const skewX = getAxisTilt(rotateY);
  const skewY = getAxisTilt(rotateX);

  return {
    // Keep the visual node slightly compensated while the outer node stays stable for selection/transforming.
    scaleXMultiplier: 1,
    scaleYMultiplier: 1,
    skewX,
    skewY,
    rotateZ,
  };
};

const decodeSvgDataUri = (uri) => {
  if (!uri || !uri.startsWith('data:image/svg+xml')) {
    return null;
  }

  const [, data = ""] = uri.split(',');
  try {
    return decodeURIComponent(data);
  } catch {
    return null;
  }
};

const encodeSvgDataUri = (svgMarkup) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`;

const encodeSvgBase64DataUri = (svgMarkup) => {
  if (typeof svgMarkup !== 'string' || !svgMarkup.trim()) {
    return '';
  }

  try {
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgMarkup)))}`;
    }

    if (typeof Buffer !== 'undefined') {
      return `data:image/svg+xml;base64,${Buffer.from(svgMarkup, 'utf8').toString('base64')}`;
    }
  } catch {
    return encodeSvgDataUri(svgMarkup);
  }

  return encodeSvgDataUri(svgMarkup);
};

const parseSvgViewBox = (svgMarkup) => {
  const match = String(svgMarkup || '').match(/viewBox="([^"]+)"/i);
  const [minX = 0, minY = 0, width = 100, height = 100] = match?.[1]?.split(/\s+/).map(Number) || [];

  return {
    minX: Number.isFinite(minX) ? minX : 0,
    minY: Number.isFinite(minY) ? minY : 0,
    width: Number.isFinite(width) && width > 0 ? width : 100,
    height: Number.isFinite(height) && height > 0 ? height : 100,
  };
};

const parseSvgPathFallbacks = (svgMarkup) => {
  const matches = [...String(svgMarkup || '').matchAll(/<path\b([^>]*)\/?>/gi)];

  return matches.map((match, index) => {
    const attrs = match[1] || '';
    const getAttr = (name) => {
      const attrMatch = attrs.match(new RegExp(`${name}="([^"]*)"`, 'i'));
      return attrMatch?.[1] || '';
    };

    const data = getAttr('d');
    if (!data) {
      return null;
    }

    return {
      key: `svg-path-${index}`,
      data,
      fill: getAttr('fill') || '#111827',
      stroke: getAttr('stroke') || undefined,
      strokeWidth: Number(getAttr('stroke-width') || 0),
      opacity: Number(getAttr('opacity') || 1),
    };
  }).filter(Boolean);
};

const getImageVisibleBounds = (image) => {
  const sourceWidth = Number(image?.naturalWidth || image?.width || 0);
  const sourceHeight = Number(image?.naturalHeight || image?.height || 0);

  if (!sourceWidth || !sourceHeight || typeof document === 'undefined') {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    return null;
  }

  context.clearRect(0, 0, sourceWidth, sourceHeight);
  context.drawImage(image, 0, 0, sourceWidth, sourceHeight);

  const { data } = context.getImageData(0, 0, sourceWidth, sourceHeight);
  let minX = sourceWidth;
  let minY = sourceHeight;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < sourceHeight; y += 1) {
    for (let x = 0; x < sourceWidth; x += 1) {
      const alpha = data[((y * sourceWidth) + x) * 4 + 3];
      if (alpha < 8) {
        continue;
      }

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: (maxX - minX) + 1,
    height: (maxY - minY) + 1,
    sourceWidth,
    sourceHeight,
  };
};

const getLinearGradientPoints = (direction, width, height) => {
  switch (direction) {
    case 'up':
      return [0, height, 0, 0];
    case 'left':
      return [width, 0, 0, 0];
    case 'right':
      return [0, 0, width, 0];
    case 'down':
    default:
      return [0, 0, 0, height];
  }
};

const getRadialGradientPoints = (angle, width, height) => {
  const safeAngle = Number(angle || 0);
  const radians = (safeAngle * Math.PI) / 180;
  const centerX = width / 2;
  const centerY = height / 2;
  const offsetX = Math.cos(radians) * (width * 0.38);
  const offsetY = Math.sin(radians) * (height * 0.38);

  return {
    start: [centerX + offsetX, centerY + offsetY],
    end: [centerX, centerY],
    startRadius: 0,
    endRadius: Math.max(width, height) * 0.85,
  };
};

const getTextRenderValue = (item = {}) => {
  if (typeof item.text === 'string') {
    return item.text.replace(/\r?\n/g, ' ');
  }

  return getEditorTextValue(item);
};

const getTextNodeMetrics = (item = {}) => {
  const metrics = getTextBlockMetrics(item);

  return {
    value: getTextRenderValue(item),
    fontSize: metrics.fontSize,
    blockWidth: metrics.width,
    blockHeight: metrics.height,
  };
};

const getCanvasItemSize = (item, type) => {
  if (type === 'logo') {
    return {
      width: Number(item.baseWidth || item.width || 220),
      height: Number(item.baseHeight || item.height || 160),
    };
  }

  const { blockWidth, blockHeight } = getTextNodeMetrics(item);
  return {
    width: blockWidth,
    height: blockHeight,
  };
};

const getScaledCanvasItemSize = (item, type, transformOverride = null) => {
  const transform = transformOverride || item.transform || {};
  const { width, height } = getCanvasItemSize(item, type);

  return {
    width: width * Math.abs(Number(transform.scaleX ?? 1)),
    height: height * Math.abs(Number(transform.scaleY ?? 1)),
  };
};

const getItemBox = (item, type) => {
  const transform = item.transform || {};
  const { width, height } = getScaledCanvasItemSize(item, type, transform);

  return {
    x: Number(transform.x ?? 0),
    y: Number(transform.y ?? 0),
    width,
    height,
  };
};

const getGuideStops = (logoItems, textItems, cardX, cardY, cardWidth, cardHeight, skipKeysInput) => {
  const skipKeys = skipKeysInput instanceof Set
    ? skipKeysInput
    : new Set(skipKeysInput ? [skipKeysInput] : []);
  const vertical = [0, CANVAS_WIDTH / 2, CANVAS_WIDTH, cardX, cardX + cardWidth / 2, cardX + cardWidth];
  const horizontal = [0, CANVAS_HEIGHT / 2, CANVAS_HEIGHT, cardY, cardY + cardHeight / 2, cardY + cardHeight];

  [...logoItems.map((item) => ({ type: 'logo', item })), ...textItems.map((item) => ({ type: 'text', item }))].forEach(({ type, item }) => {
    const itemKey = `${type}:${item.id}`;
    if (skipKeys.has(itemKey)) {
      return;
    }

    const box = getItemBox(item, type);
    vertical.push(box.x, box.x + box.width / 2, box.x + box.width);
    horizontal.push(box.y, box.y + box.height / 2, box.y + box.height);
  });

  return { vertical, horizontal };
};

const getCombinedBox = (items) => {
  if (!items.length) {
    return null;
  }

  const boxes = items.map(({ item, type, x, y }) => {
    const { width, height } = getScaledCanvasItemSize(item, type, item.transform || {});

    return {
      x,
      y,
      width,
      height,
    };
  });

  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const getObjectSnappingEdges = (box) => ({
  vertical: [
    { guide: box.x, offset: 0, snap: 'start' },
    { guide: box.x + box.width / 2, offset: box.width / 2, snap: 'center' },
    { guide: box.x + box.width, offset: box.width, snap: 'end' },
  ],
  horizontal: [
    { guide: box.y, offset: 0, snap: 'start' },
    { guide: box.y + box.height / 2, offset: box.height / 2, snap: 'center' },
    { guide: box.y + box.height, offset: box.height, snap: 'end' },
  ],
});

const getClosestGuide = (lineGuideStops, itemBounds, threshold = 6) => {
  const itemEdges = getObjectSnappingEdges(itemBounds);

  const verticalMatches = [];
  lineGuideStops.vertical.forEach((lineGuide) => {
    itemEdges.vertical.forEach((itemEdge) => {
      const diff = Math.abs(lineGuide - itemEdge.guide);
      if (diff < threshold) {
        verticalMatches.push({
          lineGuide,
          diff,
          offset: itemEdge.offset,
          snap: itemEdge.snap,
        });
      }
    });
  });

  const horizontalMatches = [];
  lineGuideStops.horizontal.forEach((lineGuide) => {
    itemEdges.horizontal.forEach((itemEdge) => {
      const diff = Math.abs(lineGuide - itemEdge.guide);
      if (diff < threshold) {
        horizontalMatches.push({
          lineGuide,
          diff,
          offset: itemEdge.offset,
          snap: itemEdge.snap,
        });
      }
    });
  });

  const minVertical = verticalMatches.sort((a, b) => a.diff - b.diff)[0];
  const minHorizontal = horizontalMatches.sort((a, b) => a.diff - b.diff)[0];

  return { vertical: minVertical, horizontal: minHorizontal };
};

const clampCanvasItemPosition = (item, type, position) => {
  return {
    x: Number(position?.x ?? 0),
    y: Number(position?.y ?? 0),
  };
};

const parseEditorColor = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const hexMatch = normalized.match(/^#([\da-f]{3,8})$/i);
  if (hexMatch) {
    const rawHex = hexMatch[1];
    const expandedHex = rawHex.length === 3 || rawHex.length === 4
      ? rawHex.split('').map((char) => char + char).join('')
      : rawHex;

    if (expandedHex.length === 6 || expandedHex.length === 8) {
      return {
        r: parseInt(expandedHex.slice(0, 2), 16),
        g: parseInt(expandedHex.slice(2, 4), 16),
        b: parseInt(expandedHex.slice(4, 6), 16),
        a: expandedHex.length === 8 ? parseInt(expandedHex.slice(6, 8), 16) / 255 : 1,
      };
    }
  }

  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const [r = 0, g = 0, b = 0, a = 1] = rgbMatch[1]
      .split(',')
      .map((part) => Number(part.trim()));

    return {
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b)),
      a: Number.isFinite(a) ? Math.max(0, Math.min(1, a)) : 1,
    };
  }

  return null;
};

const getInlineEditorTheme = (textColor) => {
  const parsed = parseEditorColor(textColor);

  if (!parsed) {
    return {
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(251,146,60,0.6)',
      ringColor: 'rgba(254,215,170,0.85)',
      shadowColor: 'rgba(15,23,42,0.18)',
      textShadow: 'none',
    };
  }

  const brightness = ((parsed.r * 299) + (parsed.g * 587) + (parsed.b * 114)) / 1000;
  const isLightText = parsed.a < 0.45 || brightness > 205;

  if (isLightText) {
    return {
      backgroundColor: 'rgba(15,23,42,0.92)',
      borderColor: 'rgba(255,255,255,0.22)',
      ringColor: 'rgba(59,130,246,0.26)',
      shadowColor: 'rgba(15,23,42,0.42)',
      textShadow: '0 1px 1px rgba(15,23,42,0.58)',
    };
  }

  return {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: 'rgba(251,146,60,0.6)',
    ringColor: 'rgba(254,215,170,0.85)',
    shadowColor: 'rgba(15,23,42,0.18)',
    textShadow: 'none',
  };
};

const drawRoundedRectPath = (context, x, y, width, height, radius) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  if (safeRadius <= 0) {
    context.beginPath();
    context.rect(x, y, width, height);
    context.closePath();
    return;
  }
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.arcTo(x + width, y, x + width, y + safeRadius, safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.arcTo(x + width, y + height, x + width - safeRadius, y + height, safeRadius);
  context.lineTo(x + safeRadius, y + height);
  context.arcTo(x, y + height, x, y + height - safeRadius, safeRadius);
  context.lineTo(x, y + safeRadius);
  context.arcTo(x, y, x + safeRadius, y, safeRadius);
  context.closePath();
};

const getContainPlacement = (image, targetWidth, targetHeight, offsetX = 0, offsetY = 0) => {
  const sourceWidth = image?.width || targetWidth;
  const sourceHeight = image?.height || targetHeight;

  if (!sourceWidth || !sourceHeight || !targetWidth || !targetHeight) {
    return {
      x: offsetX,
      y: offsetY,
      width: targetWidth,
      height: targetHeight,
    };
  }

  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;

  if (sourceRatio > targetRatio) {
    const width = targetWidth;
    const height = width / sourceRatio;
    return {
      x: offsetX,
      y: offsetY + (targetHeight - height) / 2,
      width,
      height,
    };
  }

  const height = targetHeight;
  const width = height * sourceRatio;
  return {
    x: offsetX + (targetWidth - width) / 2,
    y: offsetY,
    width,
    height,
  };
};

const getBackgroundFillProps = (bgColor, bgFill, width, height) => {
  if (!bgFill || !bgFill.type || bgFill.type === 'solid') {
    return { fill: bgColor || '#FFFFFF' };
  }

  if (bgFill.type === 'linear') {
    const [x0, y0, x1, y1] = getLinearGradientPoints(bgFill.direction, width, height);
    return {
      fillLinearGradientStartPoint: { x: x0, y: y0 },
      fillLinearGradientEndPoint: { x: x1, y: y1 },
      fillLinearGradientColorStops: [
        0,
        bgFill.startColor || '#000000',
        1,
        bgFill.endColor || '#64748B',
      ],
    };
  }

  if (bgFill.type === 'radial') {
    const radial = getRadialGradientPoints(bgFill.radialAngle, width, height);
    return {
      fillRadialGradientStartPoint: { x: radial.start[0], y: radial.start[1] },
      fillRadialGradientEndPoint: { x: radial.end[0], y: radial.end[1] },
      fillRadialGradientStartRadius: radial.startRadius,
      fillRadialGradientEndRadius: radial.endRadius,
      fillRadialGradientColorStops: [
        0,
        bgFill.startColor || '#000000',
        1,
        bgFill.endColor || '#64748B',
      ],
    };
  }

  return { fill: bgColor || '#FFFFFF' };
};

const mapGradientFillProps = (gradientProps = {}, target = 'fill') => {
  if (target === 'stroke') {
    return Object.entries(gradientProps).reduce((result, [key, value]) => {
      const mappedKey = key.replace(/^fill/, 'stroke');
      result[mappedKey] = value;
      return result;
    }, {});
  }

  return gradientProps;
};

const getNodeGradientProps = (fillGradient, width, height, target = 'fill') => {
  const normalizedGradient = normalizeFillGradient(fillGradient);

  if (!normalizedGradient) {
    return null;
  }

  const gradientProps = normalizedGradient.type === 'linear'
    ? (() => {
        const [x0, y0, x1, y1] = getLinearGradientPoints(normalizedGradient.direction, width, height);
        return {
          fillLinearGradientStartPoint: { x: x0, y: y0 },
          fillLinearGradientEndPoint: { x: x1, y: y1 },
          fillLinearGradientColorStops: [
            0,
            normalizedGradient.startColor,
            1,
            normalizedGradient.endColor,
          ],
        };
      })()
    : (() => {
        const radial = getRadialGradientPoints(normalizedGradient.radialAngle, width, height);
        return {
          fillRadialGradientStartPoint: { x: radial.start[0], y: radial.start[1] },
          fillRadialGradientEndPoint: { x: radial.end[0], y: radial.end[1] },
          fillRadialGradientStartRadius: radial.startRadius,
          fillRadialGradientEndRadius: radial.endRadius,
          fillRadialGradientColorStops: [
            0,
            normalizedGradient.startColor,
            1,
            normalizedGradient.endColor,
          ],
        };
      })();

  return mapGradientFillProps(gradientProps, target);
};

const getNodeFillProps = (fillColor, fillGradient, width, height) => {
  const gradientProps = getNodeGradientProps(fillGradient, width, height, 'fill');

  if (gradientProps) {
    return gradientProps;
  }

  return fillColor && fillColor !== 'transparent'
    ? { fill: fillColor }
    : { fillEnabled: false };
};

const getNodeStrokeProps = (strokeColor, strokeGradient, width, height) => {
  const gradientProps = getNodeGradientProps(strokeGradient, width, height, 'stroke');

  if (gradientProps) {
    return gradientProps;
  }

  return strokeColor
    ? { stroke: strokeColor }
    : { strokeEnabled: false };
};

const getBackgroundShapeGeometry = (shapeType, cardX, cardY, cardWidth, cardHeight, options = {}) => {
  const centerX = cardX + (cardWidth / 2);
  const centerY = cardY + (cardHeight / 2);
  const requestedCornerRadius = Math.max(0, Number(options.cornerRadius ?? 28));
  const createRegularPolygonPoints = (sides, radius, rotationOffset = -Math.PI / 2) => {
    const points = [];
    for (let index = 0; index < sides; index += 1) {
      const angle = rotationOffset + (index * Math.PI * 2) / sides;
      points.push(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    }
    return points;
  };

  if (shapeType === 'full') {
    return {
      kind: 'rect',
      x: cardX,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      cornerRadius: Math.min(requestedCornerRadius || 40, cardWidth / 2, cardHeight / 2),
    };
  }

  if (shapeType === 'rectangle') {
    const width = cardWidth * 0.8;
    const height = cardHeight * 0.42;
    return {
      kind: 'rect',
      x: centerX - (width / 2),
      y: centerY - (height / 2),
      width,
      height,
      cornerRadius: Math.min(requestedCornerRadius, width / 2, height / 2),
    };
  }

  if (shapeType === 'diamond') {
    const width = cardWidth * 0.56;
    const height = cardHeight * 0.56;
    return {
      kind: 'line',
      points: [
        centerX, centerY - (height / 2),
        centerX + (width / 2), centerY,
        centerX, centerY + (height / 2),
        centerX - (width / 2), centerY,
      ],
    };
  }

  if (shapeType === 'triangle') {
    const width = cardWidth * 0.62;
    const height = cardHeight * 0.54;
    return {
      kind: 'line',
      points: [
        centerX, centerY - (height / 2),
        centerX - (width / 2), centerY + (height / 2),
        centerX + (width / 2), centerY + (height / 2),
      ],
    };
  }

  if (shapeType === 'pentagon') {
    return { kind: 'line', points: createRegularPolygonPoints(5, Math.min(cardWidth, cardHeight) * 0.24) };
  }

  if (shapeType === 'hexagon') {
    return { kind: 'line', points: createRegularPolygonPoints(6, Math.min(cardWidth, cardHeight) * 0.25) };
  }

  if (shapeType === 'heart') {
    const width = cardWidth * 0.44;
    const height = cardHeight * 0.4;
    return {
      kind: 'heart',
      centerX,
      centerY,
      halfWidth: width / 2,
      halfHeight: height / 2,
    };
  }

  if (shapeType === 'star') {
    const outerRadius = Math.min(cardWidth, cardHeight) * 0.26;
    const innerRadius = outerRadius * 0.45;
    const points = [];

    for (let index = 0; index < 10; index += 1) {
      const angle = (-Math.PI / 2) + (index * Math.PI) / 5;
      const radius = index % 2 === 0 ? outerRadius : innerRadius;
      points.push(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    }

    return { kind: 'line', points };
  }

  if (shapeType === 'arrow') {
    const width = cardWidth * 0.72;
    const height = cardHeight * 0.28;
    const headWidth = width * 0.3;
    const tailHeight = height * 0.48;
    return {
      kind: 'line',
      points: [
        centerX - (width / 2), centerY - (tailHeight / 2),
        centerX + (width / 2) - headWidth, centerY - (tailHeight / 2),
        centerX + (width / 2) - headWidth, centerY - (height / 2),
        centerX + (width / 2), centerY,
        centerX + (width / 2) - headWidth, centerY + (height / 2),
        centerX + (width / 2) - headWidth, centerY + (tailHeight / 2),
        centerX - (width / 2), centerY + (tailHeight / 2),
      ],
    };
  }

  return null;
};

const traceBackgroundShapePath = (context, geometry) => {
  if (!geometry) {
    return;
  }

  if (geometry.kind === 'rect') {
    drawRoundedRectPath(context, geometry.x, geometry.y, geometry.width, geometry.height, geometry.cornerRadius || 0);
    return;
  }

  if (geometry.kind === 'line') {
    const [firstX = 0, firstY = 0, ...rest] = geometry.points || [];
    context.beginPath();
    context.moveTo(firstX, firstY);
    for (let index = 0; index < rest.length; index += 2) {
      context.lineTo(rest[index], rest[index + 1]);
    }
    context.closePath();
    return;
  }

  if (geometry.kind === 'heart') {
    context.beginPath();
    context.moveTo(geometry.centerX, geometry.centerY + geometry.halfHeight);
    context.bezierCurveTo(
      geometry.centerX + geometry.halfWidth,
      geometry.centerY + (geometry.halfHeight * 0.35),
      geometry.centerX + geometry.halfWidth,
      geometry.centerY - (geometry.halfHeight * 0.7),
      geometry.centerX,
      geometry.centerY - (geometry.halfHeight * 0.15)
    );
    context.bezierCurveTo(
      geometry.centerX - geometry.halfWidth,
      geometry.centerY - (geometry.halfHeight * 0.7),
      geometry.centerX - geometry.halfWidth,
      geometry.centerY + (geometry.halfHeight * 0.35),
      geometry.centerX,
      geometry.centerY + geometry.halfHeight
    );
    context.closePath();
  }
};

function ShapeGeometryNode({
  geometry,
  fillColor,
  fillGradient,
  strokeColor,
  strokeWidth = 4,
  opacity = 1,
  nodeName,
  gradientWidth = 0,
  gradientHeight = 0,
}) {
  if (!geometry) {
    return null;
  }

  const resolvedGradientWidth = gradientWidth || geometry.width || 0;
  const resolvedGradientHeight = gradientHeight || geometry.height || 0;
  const fillProps = getNodeFillProps(fillColor, fillGradient, resolvedGradientWidth, resolvedGradientHeight);

  if (geometry.kind === 'rect') {
    return (
      <Rect
        x={geometry.x}
        y={geometry.y}
        width={geometry.width}
        height={geometry.height}
        cornerRadius={geometry.cornerRadius}
        {...fillProps}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        name={nodeName}
      />
    );
  }

  if (geometry.kind === 'line') {
    return (
      <Line
        points={geometry.points}
        closed
        {...fillProps}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        name={nodeName}
      />
    );
  }

  if (geometry.kind === 'heart') {
    return (
      <KonvaShape
        {...fillProps}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        name={nodeName}
        sceneFunc={(context, currentShape) => {
          traceBackgroundShapePath(context, geometry);
          context.fillStrokeShape(currentShape);
        }}
      />
    );
  }

  return null;
}

function BackgroundDecoration({
  shape,
  cardX,
  cardY,
  cardWidth,
  cardHeight,
  backgroundOpacity = 1,
}) {
  if (!shape?.type || shape.type === 'none') {
    return null;
  }

  const fillColor = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(shape.fillColor || '')
    ? shape.fillColor
    : undefined;
  const stroke = shape.strokeColor || fillColor || '#111111';
  const strokeWidth = Math.max(1, Number(shape.strokeWidth || 4));
  const opacity = Math.max(
    0.05,
    Math.min(1, Number(shape.opacity ?? 1) * Number(backgroundOpacity ?? 1))
  );

  if (shape.transform && (shape.baseWidth || shape.baseHeight)) {
    const width = Number(shape.baseWidth || 220) * Math.abs(Number(shape.transform.scaleX ?? 1));
    const height = Number(shape.baseHeight || 160) * Math.abs(Number(shape.transform.scaleY ?? 1));
    const geometry = getBackgroundShapeGeometry(shape.type, 0, 0, width, height);

    return (
      <Group
        x={Number(shape.transform.x ?? cardX)}
        y={Number(shape.transform.y ?? cardY)}
        rotation={Number(shape.transform.rotation ?? 0)}
      >
        <ShapeGeometryNode
          geometry={geometry}
          fillColor={fillColor}
          fillGradient={null}
          strokeColor={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          nodeName="card-background"
          gradientWidth={width}
          gradientHeight={height}
        />
      </Group>
    );
  }

  const geometry = getBackgroundShapeGeometry(shape.type, cardX, cardY, cardWidth, cardHeight);
  return (
    <ShapeGeometryNode
      geometry={geometry}
      fillColor={fillColor}
      fillGradient={null}
      strokeColor={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      nodeName="card-background"
      gradientWidth={cardWidth}
      gradientHeight={cardHeight}
    />
  );
}

function LogoNode({
  item,
  selected,
  onSelect,
  onTransformChange,
  onTransformPreview,
  onTransformFinish,
  onNodeDragStart,
  onNodeDragMove,
  onNodeDragEnd,
  setCursor,
  registerNode,
}) {
  const isLocked = isCanvasItemLocked(item);
  const transform = item.transform || {
    x: Number(item.x || 0),
    y: Number(item.y || 0),
    scaleX: Number(item.scaleX || 1),
    scaleY: Number(item.scaleY || 1),
    rotation: Number(item.rotation || 0),
  };
  const isLineNode = item.kind === 'line' || item.type === 'line';
  const isShapeNode = item.kind === 'shape' || item.type === 'shape';
  const outlineWidth = Math.max(0, Number(item.style?.outlineWidth || 0));
  const fillGradient = normalizeFillGradient(item.style?.fillGradient);
  const decodedSvgMarkup = useMemo(
    () => decodeSvgDataUri(item.imageUrl || item.src || ''),
    [item.imageUrl, item.src]
  );
  const styledSvgMarkup = useMemo(() => {
    if (isLineNode || isShapeNode) {
      return '';
    }

    if (!decodedSvgMarkup) {
      return '';
    }

    if (!item.style?.applyColorOverrides) {
      return decodedSvgMarkup;
    }

    const nextSvgMarkup = applySvgPresentationToMarkup(decodedSvgMarkup, {
      ...item.style,
      fillColor: item.style?.fillColor || undefined,
      fillGradient,
      outlineColor: item.style?.outlineColor || undefined,
      outlineWidth,
    });
    return nextSvgMarkup || decodedSvgMarkup;
  }, [decodedSvgMarkup, fillGradient, isLineNode, isShapeNode, item.style, outlineWidth]);
  const styledImageUrl = useMemo(() => {
    if (styledSvgMarkup) {
      return encodeSvgBase64DataUri(styledSvgMarkup);
    }

    return item.imageUrl || item.src || '';
  }, [item.imageUrl, item.src, styledSvgMarkup]);
  const outlineImageUrl = useMemo(() => {
    if (decodedSvgMarkup || isLineNode || isShapeNode || !outlineWidth || !item.style?.applyColorOverrides || !item.style?.outlineColor) {
      return "";
    }

    const svgMarkup = decodeSvgDataUri(item.imageUrl || item.src || '');
    if (!svgMarkup) {
      return "";
    }

    const nextSvgMarkup = restyleSvgMarkup(svgMarkup, {
      targetColor: item.style?.outlineColor || '#111827',
    });
    return nextSvgMarkup ? encodeSvgDataUri(nextSvgMarkup) : "";
  }, [decodedSvgMarkup, isLineNode, isShapeNode, item.imageUrl, item.src, item.style, outlineWidth]);

  const [img, imageStatus] = useImage(styledImageUrl || '');
  const [outlineImg] = useImage(outlineImageUrl || "");
  const transform3d = get3dTransforms(item.style);
  const nodeOpacity = Math.max(0.05, Math.min(1, Number(item.opacity ?? 1)));
  const fallbackSvgMarkup = styledSvgMarkup || decodedSvgMarkup || '';
  const svgViewBox = useMemo(() => parseSvgViewBox(fallbackSvgMarkup), [fallbackSvgMarkup]);
  const svgPathFallbacks = useMemo(() => parseSvgPathFallbacks(fallbackSvgMarkup), [fallbackSvgMarkup]);
  const imageVisibleBounds = useMemo(() => {
    if (!decodedSvgMarkup || !img) {
      return null;
    }

    return getImageVisibleBounds(img);
  }, [decodedSvgMarkup, img]);
  const { imageWidth, imageHeight } = useMemo(() => {
    const baseImageWidth = Number(item.baseWidth || item.width || 220);
    const baseImageHeight = Number(item.baseHeight || item.height || 160);

    if (!isLineNode && !isShapeNode && !(item.baseWidth || item.width) && img?.width && img?.height) {
      const maxLogoWidth = 280;
      const maxLogoHeight = 200;
      const logoScale = Math.min(maxLogoWidth / img.width, maxLogoHeight / img.height);

      return {
        imageWidth: img.width * logoScale,
        imageHeight: img.height * logoScale,
      };
    }

    return {
      imageWidth: baseImageWidth,
      imageHeight: baseImageHeight,
    };
  }, [img, isLineNode, isShapeNode, item.baseHeight, item.baseWidth, item.height, item.width]);
  const actualScaleX = transform.scaleX || 1;
  const actualScaleY = transform.scaleY || 1;
  const imageContentCrop = useMemo(() => {
    if (item.preserveContentBounds || !decodedSvgMarkup || !img || !imageVisibleBounds) {
      return null;
    }

    const horizontalPaddingRatio = Math.max(
      0,
      (imageVisibleBounds.sourceWidth - imageVisibleBounds.width) / imageVisibleBounds.sourceWidth
    );
    const verticalPaddingRatio = Math.max(
      0,
      (imageVisibleBounds.sourceHeight - imageVisibleBounds.height) / imageVisibleBounds.sourceHeight
    );

    if (horizontalPaddingRatio < 0.08 && verticalPaddingRatio < 0.08) {
      return null;
    }

    return {
      x: imageVisibleBounds.x,
      y: imageVisibleBounds.y,
      width: imageVisibleBounds.width,
      height: imageVisibleBounds.height,
    };
  }, [decodedSvgMarkup, imageVisibleBounds, img, item.preserveContentBounds]);

  const getFreePosition = (position) => ({
    x: Number(position?.x ?? 0),
    y: Number(position?.y ?? 0),
  });

  const getTransformPayload = (event) => ({
    x: event.target.x(),
    y: event.target.y(),
    scaleX: event.target.scaleX(),
    scaleY: event.target.scaleY(),
    rotation: event.target.rotation(),
  });

  return (
    <Group
      ref={(node) => registerNode(`logo:${item.id}`, node)}
      x={transform.x}
      y={transform.y}
      scaleX={actualScaleX}
      scaleY={actualScaleY}
      rotation={transform.rotation || 0}
      draggable={!isLocked}
      onClick={(event) => onSelect(event)}
      onTap={(event) => onSelect(event)}
      onDragStart={(event) => {
        onSelect(event);
        setCursor('grabbing');
        onNodeDragStart?.(event, item, 'logo');
      }}
      onDragMove={(event) => {
        event.target.position(getFreePosition({
          x: event.target.x(),
          y: event.target.y(),
        }));
        onNodeDragMove?.(event, item, 'logo');
      }}
      onDragEnd={(event) => {
        event.target.position(getFreePosition({
          x: event.target.x(),
          y: event.target.y(),
        }));
        setCursor('grab');
        onNodeDragEnd?.(event, item, 'logo', getTransformPayload(event));
      }}
      onTransformStart={() => {
        if (!isLocked) {
          setCursor('grabbing');
        }
      }}
      onTransform={(event) => {
        if (!isLocked) {
          onTransformPreview?.(event, item, 'logo');
        }
      }}
      onTransformEnd={(event) => {
        if (isLocked) {
          return;
        }
        setCursor('grab');
        onTransformFinish?.();
        onTransformChange(getTransformPayload(event));
      }}
      onMouseEnter={() => setCursor(isLocked ? 'not-allowed' : 'grab')}
      onMouseLeave={() => {
        if (!selected) {
          setCursor('default');
        }
      }}
    >
      <Group
        x={imageWidth / 2}
        y={imageHeight / 2}
        offsetX={imageWidth / 2}
        offsetY={imageHeight / 2}
        skewX={transform3d.skewX}
        skewY={transform3d.skewY}
        scaleX={transform3d.scaleXMultiplier}
        scaleY={transform3d.scaleYMultiplier}
        rotation={transform3d.rotateZ}
      >
        {isLineNode ? (
          <>
            <Rect
              x={-12}
              y={-12}
              width={imageWidth + 24}
              height={imageHeight + 24}
              fill="rgba(0,0,0,0.001)"
            />
            {selected && (
              <Rect
                x={-10}
                y={-10}
                width={imageWidth + 20}
                height={imageHeight + 20}
                stroke="#2563EB"
                strokeWidth={2}
                dash={[8, 5]}
                cornerRadius={14}
              />
            )}
            <Line
              points={item.points || [0, imageHeight / 2, imageWidth, imageHeight / 2]}
              {...getNodeStrokeProps(
                item.style?.fillColor || item.stroke || item.style?.outlineColor || '#475569',
                fillGradient,
                imageWidth,
                imageHeight
              )}
              strokeWidth={Number(item.strokeWidth || 2)}
              hitStrokeWidth={Math.max(20, Number(item.strokeWidth || 2) + 16)}
              opacity={item.opacity ?? 1}
              lineCap="round"
            />
          </>
        ) : isShapeNode ? (
          <>
            {selected && (
              <Rect
                x={-10}
                y={-10}
                width={imageWidth + 20}
                height={imageHeight + 20}
                stroke="#2563EB"
                strokeWidth={2}
                dash={[8, 5]}
                cornerRadius={14}
              />
            )}
            <ShapeGeometryNode
              geometry={getBackgroundShapeGeometry(
                item.shapeType || 'rectangle',
                0,
                0,
                imageWidth,
                imageHeight,
                { cornerRadius: item.style?.cornerRadius }
              )}
              fillColor={item.style?.fillColor || '#F8FAFC'}
              fillGradient={fillGradient}
              strokeColor={item.style?.outlineColor || '#111827'}
              strokeWidth={Math.max(1, Number(item.style?.outlineWidth || 4))}
              opacity={nodeOpacity}
              gradientWidth={imageWidth}
              gradientHeight={imageHeight}
            />
          </>
        ) : (
          <>
            {selected && (
              <Rect
                x={-10}
                y={-10}
                width={imageWidth + 20}
                height={imageHeight + 20}
                stroke="#2563EB"
                strokeWidth={2}
                dash={[8, 5]}
                cornerRadius={14}
              />
            )}
            {outlineImg && outlineWidth > 0 && (
              <>
                {[
                  [-outlineWidth, 0],
                  [outlineWidth, 0],
                  [0, -outlineWidth],
                  [0, outlineWidth],
                  [-outlineWidth, -outlineWidth],
                  [outlineWidth, -outlineWidth],
                  [-outlineWidth, outlineWidth],
                  [outlineWidth, outlineWidth],
                ].map(([offsetX, offsetY], index) => (
                  <KonvaImage
                    key={`outline-${index}`}
                    image={outlineImg}
                    x={offsetX}
                    y={offsetY}
                    width={imageWidth}
                    height={imageHeight}
                    crop={imageContentCrop || undefined}
                    opacity={Math.min(0.92, nodeOpacity)}
                  />
                ))}
              </>
            )}
            {img ? (
              <KonvaImage
                image={img}
                width={imageWidth}
                height={imageHeight}
                crop={imageContentCrop || undefined}
                opacity={nodeOpacity}
              />
            ) : imageStatus === 'failed' && svgPathFallbacks.length > 0 ? (
              <Group
                x={(-svgViewBox.minX * imageWidth) / svgViewBox.width}
                y={(-svgViewBox.minY * imageHeight) / svgViewBox.height}
                scaleX={imageWidth / svgViewBox.width}
                scaleY={imageHeight / svgViewBox.height}
              >
                {svgPathFallbacks.map((pathItem) => (
                  <KonvaPath
                    key={pathItem.key}
                    data={pathItem.data}
                    fill={pathItem.fill === 'none' || pathItem.fill.startsWith('url(') ? undefined : pathItem.fill}
                    stroke={pathItem.stroke === 'none' ? undefined : pathItem.stroke}
                    strokeWidth={pathItem.strokeWidth}
                    opacity={Math.max(0.05, Math.min(1, pathItem.opacity * nodeOpacity))}
                  />
                ))}
              </Group>
            ) : null}
          </>
        )}
      </Group>
    </Group>
  );
}

function TextNode({
  item,
  fontFamily,
  textColor,
  selected,
  isInlineEditing,
  onSelect,
  onStartInlineEdit,
  onTransformChange,
  onTransformPreview,
  onTransformFinish,
  onNodeDragStart,
  onNodeDragMove,
  onNodeDragEnd,
  setCursor,
  registerNode,
}) {
  const isLocked = isCanvasItemLocked(item);
  const [fontRenderVersion, setFontRenderVersion] = useState(0);
  const transform = item.transform || {
    x: Number(item.x || 0),
    y: Number(item.y || 0),
    scaleX: Number(item.scaleX || 1),
    scaleY: Number(item.scaleY || 1),
    rotation: Number(item.rotation || 0),
  };
  const { value, fontSize, blockWidth, blockHeight } = getTextNodeMetrics(item);
  const shouldRenderSvgText = item.renderMode === 'svg' && Boolean(item.svgDataUri);
  const [svgTextImage] = useImage(shouldRenderSvgText ? item.svgDataUri : '');
  const transform3d = get3dTransforms(item.style);
  const nodeOpacity = Math.max(0.05, Math.min(1, Number(item.opacity ?? 1)));
  const fillGradient = normalizeFillGradient(item.style?.fillGradient);
  const typography = getTextTypography(item, { fontFamily, fontSize });
  const resolvedFontFamily = typography.fontFamily;
  const actualScaleX = transform.scaleX || 1;
  const actualScaleY = transform.scaleY || 1;
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof FontFace === 'undefined' ||
      !item.fontUrl ||
      !resolvedFontFamily
    ) {
      return undefined;
    }

    let cancelled = false;
    const normalizedFamily = resolvedFontFamily.replace(/["']/g, '').trim();
    const existingFont = Array.from(document.fonts || []).find(
      (fontFace) => fontFace.family.replace(/["']/g, '').trim() === normalizedFamily
    );

    if (existingFont) {
      return undefined;
    }

    const customFont = new FontFace(resolvedFontFamily, `url(${item.fontUrl})`);
    customFont.load()
      .then((loadedFont) => {
        document.fonts.add(loadedFont);
        if (!cancelled) {
          setFontRenderVersion((value) => value + 1);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFontRenderVersion((value) => value + 1);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [item.fontUrl, resolvedFontFamily]);

  const getBoundedPosition = (position) => ({
    x: Number(position?.x ?? 0),
    y: Number(position?.y ?? 0),
  });

  const getTransformPayload = (event) => ({
    x: event.target.x(),
    y: event.target.y(),
    scaleX: event.target.scaleX(),
    scaleY: event.target.scaleY(),
    rotation: event.target.rotation(),
  });

  return (
    <Group
      ref={(node) => registerNode(`text:${item.id}`, node)}
      x={transform.x}
      y={transform.y}
      scaleX={actualScaleX}
      scaleY={actualScaleY}
      rotation={transform.rotation || 0}
      draggable={!isInlineEditing && !isLocked}
      onClick={(event) => onSelect(event)}
      onTap={(event) => onSelect(event)}
      onDblClick={(event) => {
        onSelect(event);
        if (!isLocked) {
          onStartInlineEdit?.(item.id);
        }
      }}
      onDblTap={(event) => {
        onSelect(event);
        if (!isLocked) {
          onStartInlineEdit?.(item.id);
        }
      }}
      onDragStart={(event) => {
        onSelect(event);
        setCursor('grabbing');
        onNodeDragStart?.(event, item, 'text');
      }}
      onDragMove={(event) => {
        event.target.position(getBoundedPosition({
          x: event.target.x(),
          y: event.target.y(),
        }));
        onNodeDragMove?.(event, item, 'text');
      }}
      onDragEnd={(event) => {
        event.target.position(getBoundedPosition({
          x: event.target.x(),
          y: event.target.y(),
        }));
        setCursor('grab');
        onNodeDragEnd?.(event, item, 'text', getTransformPayload(event));
      }}
      onTransformStart={() => {
        if (!isLocked) {
          setCursor('grabbing');
        }
      }}
      onTransform={(event) => {
        if (!isLocked) {
          onTransformPreview?.(event, item, 'text');
        }
      }}
      onTransformEnd={(event) => {
        if (isLocked) {
          return;
        }
        setCursor('grab');
        onTransformFinish?.();
        onTransformChange(getTransformPayload(event));
      }}
      onMouseEnter={() => setCursor(isLocked ? 'not-allowed' : 'grab')}
      onMouseLeave={() => {
        if (!selected) {
          setCursor('default');
        }
      }}
    >
      <Group
        x={blockWidth / 2}
        y={blockHeight / 2}
        offsetX={blockWidth / 2}
        offsetY={blockHeight / 2}
        skewX={transform3d.skewX}
        skewY={transform3d.skewY}
        scaleX={transform3d.scaleXMultiplier}
        scaleY={transform3d.scaleYMultiplier}
        rotation={transform3d.rotateZ}
      >
        {selected && !isInlineEditing && (
          <Rect
            x={-10}
            y={-10}
            width={blockWidth + 20}
            height={blockHeight + 20}
            stroke="#2563EB"
            strokeWidth={2}
            dash={[8, 5]}
            cornerRadius={14}
          />
        )}
        {shouldRenderSvgText && svgTextImage ? (
          <KonvaImage image={svgTextImage} width={blockWidth} height={blockHeight} opacity={isInlineEditing ? 0 : nodeOpacity} />
        ) : (
          <Text
            key={`${item.id}-${fontRenderVersion}`}
            text={value}
            width={blockWidth}
            height={blockHeight}
            fontSize={fontSize}
            fontFamily={resolvedFontFamily}
            fontStyle={typography.konvaFontStyle}
            lineHeight={typography.lineHeight || undefined}
            {...getNodeFillProps(
              item.style?.fillColor || item.fill || textColor || '#1F2937',
              fillGradient,
              blockWidth,
              blockHeight
            )}
            stroke={Number(item.style?.outlineWidth || 0) > 0 ? item.style?.outlineColor || '#111827' : undefined}
            strokeWidth={Number(item.style?.outlineWidth || 0)}
            align={item.align || "center"}
            verticalAlign="middle"
            letterSpacing={Number(item.letterSpacing || 0)}
            opacity={isInlineEditing ? 0 : nodeOpacity}
          />
        )}
      </Group>
    </Group>
  );
}

export default function Canvas({
  config = {},
  onConfigChange,
  onSelectionChange,
  onTextEditCommit,
  inlineTextEditRequest = null,
  selectionOverride,
  clearSelectionToken = 0,
  stageRef: externalStageRef = null,
  zoom = 1,
  hasLockedSelection = false,
  hideSelectionUi = false,
  clipContentToCard = false,
  renderElementsOnly = false,
}) {
  const containerRef = useRef(null);
  const transformerRef = useRef(null);
  const nodeMapRef = useRef({});
  const dragSelectionRef = useRef(null);
  const inlineEditorInputRef = useRef(null);
  const inlineEditBlurModeRef = useRef(null);
  const handledInlineRequestRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 500, scale: 1 });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [guideLines, setGuideLines] = useState({ vertical: [], horizontal: [] });
  const [rotationInfo, setRotationInfo] = useState(null);
  const [inlineEditor, setInlineEditor] = useState(null);
  const [inlineEditorLayout, setInlineEditorLayout] = useState(null);
  const [backgroundImage] = useImage(config.bgImageUrl || '');

  const canvasWidth = CANVAS_WIDTH;
  const canvasHeight = CANVAS_HEIGHT;
  const cardWidth = 620;
  const cardHeight = 420;
  const cardX = (canvasWidth - cardWidth) / 2;
  const cardY = (canvasHeight - cardHeight) / 2;

  const logoItems = useMemo(() => config.logoItems || [], [config.logoItems]);
  const textItems = useMemo(() => config.textItems || [], [config.textItems]);
  const layerOrder = useMemo(
    () => syncCanvasLayerOrder(config.layerOrder, logoItems, textItems),
    [config.layerOrder, logoItems, textItems]
  );
  const orderedCanvasItems = useMemo(
    () => getOrderedCanvasItems(logoItems, textItems, layerOrder),
    [layerOrder, logoItems, textItems]
  );
  const orderedBackgroundCanvasItems = useMemo(
    () => orderedCanvasItems.filter(({ type, item }) => type === 'logo' && isBackgroundCanvasItem(item)),
    [orderedCanvasItems]
  );
  const orderedForegroundCanvasItems = useMemo(
    () => orderedCanvasItems.filter(({ type, item }) => !(type === 'logo' && isBackgroundCanvasItem(item))),
    [orderedCanvasItems]
  );
  const backgroundShape = useMemo(() => config.backgroundShape || null, [config.backgroundShape]);
  const backgroundOpacity = useMemo(() => Math.max(0.05, Math.min(1, Number(config.bgOpacity ?? 1))), [config.bgOpacity]);
  const backgroundImagePlacement = useMemo(() => {
    if (!backgroundImage) {
      return null;
    }

    return getContainPlacement(backgroundImage, cardWidth, cardHeight, cardX, cardY);
  }, [backgroundImage, cardHeight, cardWidth, cardX, cardY]);
  const cardFillProps = useMemo(() => {
    return getBackgroundFillProps(config.bgColor || '#FFFFFF', config.bgFill || null, cardWidth, cardHeight);
  }, [config.bgColor, config.bgFill, cardHeight, cardWidth]);
  const isWatermarkVisible = !renderElementsOnly && config.watermarkEnabled !== false;
  const viewportWidth = cardWidth * dimensions.scale * zoom;
  const viewportHeight = cardHeight * dimensions.scale * zoom;
  const viewportOffsetX = cardX * dimensions.scale * zoom;
  const viewportOffsetY = cardY * dimensions.scale * zoom;
  const inlineEditingItem = inlineEditor?.id
    ? textItems.find((item) => item.id === inlineEditor.id) || null
    : null;
  const selectionUiHidden = hideSelectionUi || Boolean(inlineEditor);
  const canvasSelectionIncludesLockedItem = useMemo(
    () => selectedItems.some((entry) => {
      const sourceItem = entry.type === 'logo'
        ? logoItems.find((item) => item.id === entry.id)
        : textItems.find((item) => item.id === entry.id);

      return isCanvasItemLocked(sourceItem);
    }),
    [logoItems, selectedItems, textItems]
  );
  const inlineEditorTheme = useMemo(
    () => getInlineEditorTheme(inlineEditorLayout?.color),
    [inlineEditorLayout?.color]
  );

  const setCursor = (value) => {
    if (containerRef.current) {
      containerRef.current.style.cursor = value;
    }
  };

  const registerNode = (key, node) => {
    if (node) {
      nodeMapRef.current[key] = node;
    } else {
      delete nodeMapRef.current[key];
    }
  };

  const clearHelpers = () => {
    setGuideLines({ vertical: [], horizontal: [] });
    setRotationInfo(null);
  };

  const closeInlineEditor = useCallback(() => {
    inlineEditBlurModeRef.current = null;
    setInlineEditor(null);
  }, []);

  const commitInlineEditor = useCallback(() => {
    if (!inlineEditor?.id) {
      closeInlineEditor();
      return;
    }

    const nextValue = typeof inlineEditor.value === 'string' ? inlineEditor.value.trim() : '';
    if (nextValue) {
      onTextEditCommit?.(inlineEditor.id, nextValue);
    }

    if (inlineEditor.clearSelectionOnCommit) {
      setSelectedItem(null);
      setSelectedItems([]);
    }

    closeInlineEditor();
  }, [closeInlineEditor, inlineEditor, onTextEditCommit]);

  const startInlineEditor = useCallback((itemId) => {
    const targetItem = textItems.find((item) => item.id === itemId);
    if (!targetItem) {
      return;
    }

    if (isCanvasItemLocked(targetItem)) {
      return;
    }

    const currentValue = getTextRenderValue(targetItem);
    setInlineEditor((previousValue) => {
      if (previousValue?.id && previousValue.id !== itemId) {
        const safePrevious = typeof previousValue.value === 'string' ? previousValue.value.trim() : '';
        if (safePrevious) {
          onTextEditCommit?.(previousValue.id, safePrevious);
        }
      }

      return {
        id: itemId,
        value: currentValue,
        clearSelectionOnCommit: Boolean(inlineTextEditRequest?.clearSelectionOnCommit && inlineTextEditRequest?.id === itemId),
      };
    });
  }, [inlineTextEditRequest?.clearSelectionOnCommit, inlineTextEditRequest?.id, onTextEditCommit, textItems]);

  useEffect(() => {
    if (!transformerRef.current) {
      return;
    }

    if (selectionUiHidden || hasLockedSelection || canvasSelectionIncludesLockedItem) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }

    const key = selectedItems.length === 1 ? `${selectedItems[0].type}:${selectedItems[0].id}` : null;
    const node = key ? nodeMapRef.current[key] : null;
    transformerRef.current.nodes(node ? [node] : []);
    transformerRef.current.getLayer()?.batchDraw();
  }, [canvasSelectionIncludesLockedItem, hasLockedSelection, selectionUiHidden, selectedItems, logoItems, textItems]);

  useEffect(() => {
    if (typeof onSelectionChange === 'function') {
      onSelectionChange({
        primary: selectedItem,
        items: selectedItems,
      });
    }
  }, [onSelectionChange, selectedItem, selectedItems]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextSelectionItems = Array.isArray(selectionOverride?.items)
        ? selectionOverride.items
        : selectionOverride
          ? [selectionOverride]
          : [];
      const nextPrimarySelection = Array.isArray(selectionOverride?.items)
        ? selectionOverride?.primary || nextSelectionItems[nextSelectionItems.length - 1] || null
        : selectionOverride ?? null;

      setSelectedItem(nextPrimarySelection);
      setSelectedItems(nextSelectionItems);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectionOverride]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSelectedItem(null);
      setSelectedItems([]);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [clearSelectionToken]);

  useEffect(() => {
    if (!inlineEditor?.id || !inlineEditorLayout || !inlineEditorInputRef.current) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const inputNode = inlineEditorInputRef.current;
      if (!inputNode) {
        return;
      }

      inputNode.focus();
      const textLength = inputNode.value.length;
      inputNode.setSelectionRange(textLength, textLength);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [inlineEditor?.id, inlineEditorLayout]);

  useEffect(() => {
    if (!inlineEditor?.id) {
      return;
    }

    const stillExists = textItems.some((item) => item.id === inlineEditor.id);
    if (!stillExists) {
      const frame = window.requestAnimationFrame(() => {
        closeInlineEditor();
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [closeInlineEditor, inlineEditor?.id, textItems]);

  useEffect(() => {
    if (!inlineTextEditRequest?.id) {
      return;
    }

    const requestKey = `${inlineTextEditRequest.id}:${inlineTextEditRequest.nonce || 0}`;
    if (handledInlineRequestRef.current === requestKey) {
      return;
    }

    const targetExists = textItems.some((item) => item.id === inlineTextEditRequest.id);
    if (!targetExists) {
      return;
    }

    handledInlineRequestRef.current = requestKey;
    const frame = window.requestAnimationFrame(() => {
      startInlineEditor(inlineTextEditRequest.id);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [inlineTextEditRequest?.id, inlineTextEditRequest?.nonce, startInlineEditor, textItems]);

  useEffect(() => {
    const handleSelectAll = (event) => {
      const target = event.target;
      const isTypingTarget = target instanceof HTMLElement && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      if (isTypingTarget || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'a') {
        return;
      }

      const allItems = [
        ...logoItems.map((item) => ({ type: 'logo', id: item.id })),
        ...textItems.map((item) => ({ type: 'text', id: item.id })),
      ];

      if (!allItems.length) {
        return;
      }

      event.preventDefault();
      setSelectedItems(allItems);
      setSelectedItem(allItems[allItems.length - 1] || null);
    };

    window.addEventListener('keydown', handleSelectAll);
    return () => window.removeEventListener('keydown', handleSelectAll);
  }, [logoItems, textItems]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) {
        return;
      }

      const { clientWidth, clientHeight } = containerRef.current;
      const padding = 40;
      const availableW = clientWidth - padding;
      const availableH = clientHeight - padding;
      const scale = Math.min(availableW / canvasWidth, availableH / canvasHeight);

      setDimensions({
        width: canvasWidth * scale,
        height: canvasHeight * scale,
        scale,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [canvasHeight, canvasWidth]);

  const updateItemTransform = (collectionName, itemId, nextTransform) => {
    if (typeof onConfigChange !== 'function') {
      return;
    }

    const itemType = collectionName === 'textItems' ? 'text' : 'logo';
    onConfigChange({
      [collectionName]: (config[collectionName] || []).map((item) =>
        item.id === itemId
          ? {
              ...item,
              transform: clampTransformToCard(itemType, item, nextTransform),
            }
          : item
      ),
    });
  };

  const handleItemSelect = (item, event) => {
    const addToSelectionPressed = Boolean(event?.evt?.shiftKey);
    const removeFromSelectionPressed = Boolean(event?.evt?.ctrlKey || event?.evt?.metaKey);
    const itemKey = `${item.type}:${item.id}`;

    setSelectedItems((previousItems) => {
      if (removeFromSelectionPressed) {
        const nextItems = previousItems.filter((entry) => `${entry.type}:${entry.id}` !== itemKey);
        setSelectedItem(nextItems.length ? nextItems[nextItems.length - 1] : null);
        return nextItems;
      }

      if (!addToSelectionPressed) {
        const alreadySelected = previousItems.some((entry) => `${entry.type}:${entry.id}` === itemKey);
        const nextItems = alreadySelected && previousItems.length > 1 ? previousItems : [item];
        setSelectedItem(nextItems.length ? nextItems[nextItems.length - 1] : null);
        return nextItems;
      }

      const exists = previousItems.some((entry) => `${entry.type}:${entry.id}` === itemKey);
      const nextItems = exists
        ? previousItems
        : [...previousItems, item];
      setSelectedItem(nextItems.length ? nextItems[nextItems.length - 1] : null);
      return nextItems;
    });
  };

  useEffect(() => {
    let frame = null;

    if (!inlineEditingItem) {
      frame = window.requestAnimationFrame(() => {
        setInlineEditorLayout(null);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    frame = window.requestAnimationFrame(() => {
      const containerNode = containerRef.current;
      const stage = externalStageRef?.current;
      const stageContainer = stage?.container?.();

      if (!containerNode || !stage || !stageContainer) {
        setInlineEditorLayout(null);
        return;
      }

      const stageRect = stageContainer.getBoundingClientRect();
      const containerRect = containerNode.getBoundingClientRect();
      const transform = inlineEditingItem.transform || {};
      const canvasRight = CANVAS_WIDTH;
      const canvasBottom = CANVAS_HEIGHT;
      const safeX = Math.min(
        Math.max(Number(transform.x ?? 0), 0),
        canvasRight - 48
      );
      const safeY = Math.min(
        Math.max(Number(transform.y ?? 0), 0),
        canvasBottom - 36
      );
      const availableWidth = Math.max(48, canvasRight - safeX);
      const availableHeight = Math.max(36, canvasBottom - safeY);
      const previewMetrics = getTextBlockMetrics({
        ...inlineEditingItem,
        text: inlineEditor?.value ?? getTextRenderValue(inlineEditingItem),
        width: 0,
        height: 0,
        maxWidth: availableWidth,
      });
      const fontSize = previewMetrics.fontSize;
      const blockWidth = previewMetrics.width;
      const blockHeight = previewMetrics.height;
      const itemScaleX = Math.abs(Number(transform.scaleX ?? 1));
      const itemScaleY = Math.abs(Number(transform.scaleY ?? 1));
      const stageScaleX = Number(stage.scaleX() || 1);
      const stageScaleY = Number(stage.scaleY() || 1);
      const typography = getTextTypography(inlineEditingItem, {
        fontFamily: config.fontFamily || 'Arial',
        fontSize,
      });
      const maxEditorWidth = Math.max(48, availableWidth * itemScaleX * stageScaleX);
      const maxEditorHeight = Math.max(36, availableHeight * itemScaleY * stageScaleY);

      setInlineEditorLayout({
        left: (stageRect.left - containerRect.left) + (safeX * stageScaleX),
        top: (stageRect.top - containerRect.top) + (safeY * stageScaleY),
        width: Math.min(maxEditorWidth, Math.max(48, blockWidth * itemScaleX * stageScaleX)),
        height: Math.min(maxEditorHeight, Math.max(36, blockHeight * itemScaleY * stageScaleY)),
        transform: `rotate(${Number(transform.rotation || 0)}deg)`,
        fontSize: Math.max(12, fontSize * itemScaleY * stageScaleY),
        fontFamily: typography.fontFamily,
        fontStyle: typography.cssFontStyle,
        fontWeight: typography.cssFontWeight,
        lineHeight: typography.lineHeight || 1.1,
        letterSpacing: Number(inlineEditingItem.letterSpacing || 0) * itemScaleX * stageScaleX,
        color: inlineEditingItem.style?.fillColor || inlineEditingItem.fill || config.textColor || '#1F2937',
        textAlign: inlineEditingItem.align || 'center',
        padding: `${Math.max(6, Math.round(10 * itemScaleY * stageScaleY))}px ${Math.max(8, Math.round(16 * itemScaleX * stageScaleX))}px`,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    config.fontFamily,
    config.textColor,
    dimensions.height,
    dimensions.scale,
    dimensions.width,
    externalStageRef,
    inlineEditingItem,
    inlineEditor?.value,
    zoom,
  ]);

  const commitSelectionTransforms = (updates) => {
    if (typeof onConfigChange !== 'function' || !updates.size) {
      return;
    }

    onConfigChange({
      logoItems: logoItems.map((item) => {
        const nextTransform = updates.get(`logo:${item.id}`);
        return nextTransform
          ? { ...item, transform: clampTransformToCard('logo', item, nextTransform) }
          : item;
      }),
      textItems: textItems.map((item) => {
        const nextTransform = updates.get(`text:${item.id}`);
        return nextTransform
          ? { ...item, transform: clampTransformToCard('text', item, nextTransform) }
          : item;
      }),
    });
  };

  const handleNodeDragStart = (event, item, type) => {
    clearHelpers();
    const itemKey = `${type}:${item.id}`;
    const isGroupDrag = selectedItems.length > 1 && selectedItems.some((entry) => `${entry.type}:${entry.id}` === itemKey);
    if (!isGroupDrag) {
      dragSelectionRef.current = null;
      return;
    }

    dragSelectionRef.current = {
      draggedKey: itemKey,
      origin: { x: event.target.x(), y: event.target.y() },
      items: selectedItems.map((entry) => {
        const sourceItem = entry.type === 'logo'
          ? logoItems.find((candidate) => candidate.id === entry.id)
          : textItems.find((candidate) => candidate.id === entry.id);
        const node = nodeMapRef.current[`${entry.type}:${entry.id}`];

        return {
          ...entry,
          item: sourceItem,
          start: {
            x: node?.x() ?? sourceItem?.transform?.x ?? 0,
            y: node?.y() ?? sourceItem?.transform?.y ?? 0,
          },
        };
      }).filter((entry) => entry.item && !isCanvasItemLocked(entry.item)),
    };
  };

  const handleNodeDragMove = (event, item, type) => {
    const dragSelection = dragSelectionRef.current;
    if (!dragSelection || dragSelection.draggedKey !== `${type}:${item.id}`) {
      const itemKey = `${type}:${item.id}`;
      const currentItem = type === 'logo'
        ? logoItems.find((entry) => entry.id === item.id) || item
        : textItems.find((entry) => entry.id === item.id) || item;
      const widthHeight = getCanvasItemSize(currentItem, type);
      const scaleX = Math.abs(Number(event.target.scaleX() || currentItem.transform?.scaleX || 1));
      const scaleY = Math.abs(Number(event.target.scaleY() || currentItem.transform?.scaleY || 1));
      const boundedPosition = clampCanvasItemPosition(currentItem, type, {
        x: event.target.x(),
        y: event.target.y(),
      });
      const activeBox = {
        x: boundedPosition.x,
        y: boundedPosition.y,
        width: widthHeight.width * scaleX,
        height: widthHeight.height * scaleY,
      };
      const guideStops = getGuideStops(logoItems, textItems, cardX, cardY, cardWidth, cardHeight, itemKey);
      const activeGuides = getClosestGuide(guideStops, activeBox);
      const nextPosition = { ...boundedPosition };

      if (activeGuides.vertical) {
        nextPosition.x = activeGuides.vertical.lineGuide - activeGuides.vertical.offset;
      }

      if (activeGuides.horizontal) {
        nextPosition.y = activeGuides.horizontal.lineGuide - activeGuides.horizontal.offset;
      }

      const finalPosition = clampCanvasItemPosition(currentItem, type, nextPosition);
      event.target.position(finalPosition);
      setGuideLines({
        vertical: activeGuides.vertical ? [activeGuides.vertical.lineGuide] : [],
        horizontal: activeGuides.horizontal ? [activeGuides.horizontal.lineGuide] : [],
      });
      return;
    }

    const deltaX = event.target.x() - dragSelection.origin.x;
    const deltaY = event.target.y() - dragSelection.origin.y;
    const selectedKeys = new Set(dragSelection.items.map((entry) => `${entry.type}:${entry.id}`));
    const proposedItems = dragSelection.items.map((entry) => ({
      ...entry,
      x: entry.start.x + deltaX,
      y: entry.start.y + deltaY,
    }));
    const combinedBox = getCombinedBox(proposedItems);
    const guideStops = getGuideStops(logoItems, textItems, cardX, cardY, cardWidth, cardHeight, selectedKeys);
    const activeGuides = combinedBox ? getClosestGuide(guideStops, combinedBox) : { vertical: null, horizontal: null };
    const snappedDeltaX = activeGuides.vertical
      ? deltaX + (activeGuides.vertical.lineGuide - (combinedBox.x + activeGuides.vertical.offset))
      : deltaX;
    const snappedDeltaY = activeGuides.horizontal
      ? deltaY + (activeGuides.horizontal.lineGuide - (combinedBox.y + activeGuides.horizontal.offset))
      : deltaY;

    dragSelection.items.forEach((entry) => {
      const nodeKey = `${entry.type}:${entry.id}`;
      const node = nodeMapRef.current[nodeKey];
      if (!node) {
        return;
      }

      const nextPosition = clampCanvasItemPosition(
        entry.item,
        entry.type,
        { x: entry.start.x + snappedDeltaX, y: entry.start.y + snappedDeltaY }
      );
      node.position(nextPosition);
    });

    setGuideLines({
      vertical: activeGuides.vertical ? [activeGuides.vertical.lineGuide] : [],
      horizontal: activeGuides.horizontal ? [activeGuides.horizontal.lineGuide] : [],
    });
    event.target.getLayer()?.batchDraw();
  };

  const handleNodeDragEnd = (event, item, type, nextTransform) => {
    const dragSelection = dragSelectionRef.current;
    if (!dragSelection || dragSelection.draggedKey !== `${type}:${item.id}`) {
      clearHelpers();
      updateItemTransform(type === 'logo' ? 'logoItems' : 'textItems', item.id, nextTransform);
      return;
    }

    const updates = new Map();
    dragSelection.items.forEach((entry) => {
      const node = nodeMapRef.current[`${entry.type}:${entry.id}`];
      if (!node) {
        return;
      }

      updates.set(`${entry.type}:${entry.id}`, {
        ...(entry.item?.transform || {}),
        x: node.x(),
        y: node.y(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        rotation: node.rotation(),
      });
    });

    dragSelectionRef.current = null;
    clearHelpers();
    commitSelectionTransforms(updates);
  };

  const handleTransformPreview = (event, item, type) => {
    const node = event.target;
    const currentItem = type === 'logo'
      ? logoItems.find((entry) => entry.id === item.id) || item
      : textItems.find((entry) => entry.id === item.id) || item;
    const size = getCanvasItemSize(currentItem, type);
    const scaleX = Math.abs(Number(node.scaleX() || 1));
    const width = size.width * scaleX;
    const x = node.x();
    const y = node.y();
    const normalizedRotation = ((Number(node.rotation() || 0) % 360) + 360) % 360;

    setRotationInfo({
      x: x + width / 2,
      y: Math.max(24, y - 26),
      rotation: Math.round(normalizedRotation),
    });
  };

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative overflow-hidden rounded-none border border-gray-50 bg-white shadow-2xl"
        style={{ width: viewportWidth, height: viewportHeight }}
      >
        <div
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transform: `translate(${-viewportOffsetX}px, ${-viewportOffsetY}px)`,
            transformOrigin: 'top left',
          }}
        >
          <Stage
            ref={externalStageRef}
            width={dimensions.width}
            height={dimensions.height}
            scaleX={dimensions.scale * zoom}
            scaleY={dimensions.scale * zoom}
            onMouseDown={(event) => {
              const clickedOnEmptyArea =
                event.target === event.target.getStage() ||
                event.target.name() === 'card-background';

              if (clickedOnEmptyArea) {
                setSelectedItems([]);
                setSelectedItem(null);
                setCursor('default');
              }
            }}
            onTouchStart={(event) => {
              const tappedOnEmptyArea =
                event.target === event.target.getStage() ||
                event.target.name() === 'card-background';

              if (tappedOnEmptyArea) {
                setSelectedItems([]);
                setSelectedItem(null);
              }
            }}
          >
            <Layer>
              {!renderElementsOnly ? (
                <>
                  <Rect
                    x={cardX}
                    y={cardY}
                    width={cardWidth}
                    height={cardHeight}
                    {...cardFillProps}
                    opacity={backgroundOpacity}
                    cornerRadius={CARD_CORNER_RADIUS}
                    name="card-background"
                  />
                  {backgroundImage && backgroundImagePlacement ? (
                    <Group
                      clipFunc={(context) => {
                        drawRoundedRectPath(context, cardX, cardY, cardWidth, cardHeight, CARD_CORNER_RADIUS);
                      }}
                    >
                      <KonvaImage
                        image={backgroundImage}
                        x={backgroundImagePlacement.x}
                        y={backgroundImagePlacement.y}
                        width={backgroundImagePlacement.width}
                        height={backgroundImagePlacement.height}
                        opacity={backgroundOpacity}
                        name="card-background"
                      />
                    </Group>
                  ) : null}
                  <BackgroundDecoration
                    shape={backgroundShape}
                    cardX={cardX}
                    cardY={cardY}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    backgroundOpacity={backgroundOpacity}
                  />

                  <Group
                    clipFunc={(context) => {
                      drawRoundedRectPath(context, cardX, cardY, cardWidth, cardHeight, CARD_CORNER_RADIUS);
                    }}
                  >
                    {orderedBackgroundCanvasItems.map(({ item }) => (
                      <LogoNode
                        key={`logo:${item.id}`}
                        item={item}
                        selected={!selectionUiHidden && selectedItems.some((entry) => entry.type === 'logo' && entry.id === item.id)}
                        onSelect={(event) => handleItemSelect({ type: 'logo', id: item.id }, event)}
                        onTransformChange={(transform) => updateItemTransform('logoItems', item.id, transform)}
                        onTransformPreview={handleTransformPreview}
                        onTransformFinish={clearHelpers}
                        onNodeDragStart={handleNodeDragStart}
                        onNodeDragMove={handleNodeDragMove}
                        onNodeDragEnd={handleNodeDragEnd}
                        setCursor={setCursor}
                        registerNode={registerNode}
                      />
                    ))}
                  </Group>
                </>
              ) : null}

              <Group
                clipFunc={clipContentToCard
                  ? (context) => {
                      drawRoundedRectPath(context, cardX, cardY, cardWidth, cardHeight, CARD_CORNER_RADIUS);
                    }
                  : undefined}
              >
                {orderedForegroundCanvasItems.map(({ type, item }) => (
                  type === 'logo' ? (
                    <LogoNode
                      key={`logo:${item.id}`}
                      item={item}
                      selected={!selectionUiHidden && selectedItems.some((entry) => entry.type === 'logo' && entry.id === item.id)}
                      onSelect={(event) => handleItemSelect({ type: 'logo', id: item.id }, event)}
                      onTransformChange={(transform) => updateItemTransform('logoItems', item.id, transform)}
                      onTransformPreview={handleTransformPreview}
                      onTransformFinish={clearHelpers}
                      onNodeDragStart={handleNodeDragStart}
                      onNodeDragMove={handleNodeDragMove}
                      onNodeDragEnd={handleNodeDragEnd}
                      setCursor={setCursor}
                      registerNode={registerNode}
                    />
                  ) : (
                    <TextNode
                      key={`text:${item.id}`}
                      item={item}
                      fontFamily={config.fontFamily}
                      textColor={config.textColor}
                      selected={!selectionUiHidden && selectedItems.some((entry) => entry.type === 'text' && entry.id === item.id)}
                      isInlineEditing={inlineEditor?.id === item.id}
                      onSelect={(event) => handleItemSelect({ type: 'text', id: item.id }, event)}
                      onStartInlineEdit={startInlineEditor}
                      onTransformChange={(transform) => updateItemTransform('textItems', item.id, transform)}
                      onTransformPreview={handleTransformPreview}
                      onTransformFinish={clearHelpers}
                      onNodeDragStart={handleNodeDragStart}
                      onNodeDragMove={handleNodeDragMove}
                      onNodeDragEnd={handleNodeDragEnd}
                      setCursor={setCursor}
                      registerNode={registerNode}
                    />
                  )
                ))}
              </Group>

              {!selectionUiHidden && guideLines.vertical.map((guideX) => (
                <Line
                  key={`guide-v-${guideX}`}
                  points={[guideX, 0, guideX, CANVAS_HEIGHT]}
                  stroke="#22C55E"
                  strokeWidth={1.5}
                  dash={[6, 6]}
                  listening={false}
                />
              ))}

              {!selectionUiHidden && guideLines.horizontal.map((guideY) => (
                <Line
                  key={`guide-h-${guideY}`}
                  points={[0, guideY, CANVAS_WIDTH, guideY]}
                  stroke="#22C55E"
                  strokeWidth={1.5}
                  dash={[6, 6]}
                  listening={false}
                />
              ))}

              {!selectionUiHidden && rotationInfo ? (
                <Group x={rotationInfo.x} y={rotationInfo.y} listening={false}>
                  <Rect
                    x={-28}
                    y={-16}
                    width={56}
                    height={24}
                    cornerRadius={12}
                    fill="#111827"
                    opacity={0.92}
                    shadowColor="#0F172A"
                    shadowBlur={10}
                    shadowOpacity={0.18}
                  />
                  <Text
                    x={-28}
                    y={-10}
                    width={56}
                    align="center"
                    text={`${rotationInfo.rotation}°`}
                    fontSize={12}
                    fontStyle="bold"
                    fill="#FFFFFF"
                  />
                </Group>
              ) : null}

              {!selectionUiHidden && (
                <Transformer
                  ref={transformerRef}
                  rotateEnabled
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                  borderStroke="#2563EB"
                  borderStrokeWidth={2}
                  borderDash={[8, 5]}
                  anchorFill="#ffffff"
                  anchorStroke="#2563EB"
                  anchorStrokeWidth={2}
                  anchorSize={10}
                  keepRatio={selectedItem?.type === 'logo'}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 70 || newBox.height < 24) {
                      return oldBox;
                    }

                    return newBox;
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>
        {isWatermarkVisible ? (
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <div
              className="absolute"
              style={{
                ...BRAND_WATERMARK_PATTERN_STYLE,
                inset: BRAND_WATERMARK_OVERLAY_INSET,
                opacity: BRAND_WATERMARK_OPACITY,
                transform: `rotate(${BRAND_WATERMARK_ROTATION}deg) scale(${BRAND_WATERMARK_OVERLAY_SCALE})`,
              }}
            />
          </div>
        ) : null}
      </div>
      {inlineEditor && inlineEditorLayout ? (
        <input
          ref={inlineEditorInputRef}
          type="text"
          value={inlineEditor.value}
          onChange={(event) => {
            setInlineEditor((previousValue) => (
              previousValue
                ? {
                    ...previousValue,
                    value: event.target.value,
                  }
                : previousValue
            ));
          }}
          onBlur={() => {
            if (inlineEditBlurModeRef.current === 'cancel') {
              closeInlineEditor();
              return;
            }

            commitInlineEditor();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              inlineEditBlurModeRef.current = 'cancel';
              event.currentTarget.blur();
              return;
            }

            if (event.key === 'Enter') {
              event.preventDefault();
              inlineEditBlurModeRef.current = 'save';
              event.currentTarget.blur();
            }
          }}
          spellCheck={false}
          autoComplete="off"
          className="absolute z-[130] overflow-hidden rounded-xl border outline-none backdrop-blur-sm"
          style={{
            left: inlineEditorLayout.left,
            top: inlineEditorLayout.top,
            width: inlineEditorLayout.width,
            height: inlineEditorLayout.height,
            transform: inlineEditorLayout.transform,
            transformOrigin: 'top left',
            fontSize: inlineEditorLayout.fontSize,
            fontFamily: inlineEditorLayout.fontFamily,
            fontStyle: inlineEditorLayout.fontStyle,
            fontWeight: inlineEditorLayout.fontWeight,
            letterSpacing: inlineEditorLayout.letterSpacing,
            color: inlineEditorLayout.color,
            textAlign: inlineEditorLayout.textAlign,
            padding: inlineEditorLayout.padding,
            lineHeight: inlineEditorLayout.lineHeight,
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            backgroundColor: inlineEditorTheme.backgroundColor,
            borderColor: inlineEditorTheme.borderColor,
            boxShadow: `0 18px 40px ${inlineEditorTheme.shadowColor}, 0 0 0 2px ${inlineEditorTheme.ringColor}`,
            caretColor: inlineEditorLayout.color,
            textShadow: inlineEditorTheme.textShadow,
          }}
        />
      ) : null}
    </div>
  );
}
