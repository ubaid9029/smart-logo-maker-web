"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Layer, Line, Rect, Shape as KonvaShape, Stage, Text, Transformer } from 'react-konva';
import useImage from 'use-image';

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

const getCombinedTextValue = (businessValue, sloganValue) => {
  const safeBusiness = (businessValue || '').trim();
  const safeSlogan = (sloganValue || '').trim();

  if (!safeBusiness) {
    return safeSlogan || 'BRAND';
  }

  return safeSlogan ? `${safeBusiness} | ${safeSlogan}` : safeBusiness;
};

const getTextRenderValue = (item = {}) => {
  const directText = typeof item.text === 'string' ? item.text.trim() : '';
  if (directText) {
    return directText;
  }

  return getCombinedTextValue(item.businessValue, item.sloganValue);
};

const getTextNodeMetrics = (item = {}) => {
  const value = getTextRenderValue(item);
  const explicitFontSize = Number(item.fontSize || 0);
  const fontSize = explicitFontSize > 0
    ? explicitFontSize
    : value.length > 28 ? 24 : value.length > 20 ? 30 : value.length > 12 ? 38 : 46;
  const explicitWidth = Number(item.width || 0);
  const explicitHeight = Number(item.height || 0);
  const blockWidth = explicitWidth > 0
    ? explicitWidth
    : Math.min(520, Math.max(240, value.length * (fontSize * 0.6)));
  const blockHeight = explicitHeight > 0 ? explicitHeight : fontSize + 16;

  return { value, fontSize, blockWidth, blockHeight };
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

const clampCanvasItemPosition = (item, type, position) => {
  const transform = item.transform || {};
  const { width, height } = getCanvasItemSize(item, type);
  const scaleX = Math.abs(Number(transform.scaleX ?? 1));
  const scaleY = Math.abs(Number(transform.scaleY ?? 1));
  const maxX = Math.max(0, CANVAS_WIDTH - (width * scaleX));
  const maxY = Math.max(0, CANVAS_HEIGHT - (height * scaleY));

  return {
    x: Math.min(Math.max(position.x, 0), maxX),
    y: Math.min(Math.max(position.y, 0), maxY),
  };
};

const drawRoundedRectPath = (context, x, y, width, height, radius) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
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

const getCoverCrop = (image, targetWidth, targetHeight) => {
  const sourceWidth = image?.width || targetWidth;
  const sourceHeight = image?.height || targetHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;

  if (sourceRatio > targetRatio) {
    const cropWidth = sourceHeight * targetRatio;
    return {
      cropX: (sourceWidth - cropWidth) / 2,
      cropY: 0,
      cropWidth,
      cropHeight: sourceHeight,
    };
  }

  const cropHeight = sourceWidth / targetRatio;
  return {
    cropX: 0,
    cropY: (sourceHeight - cropHeight) / 2,
    cropWidth: sourceWidth,
    cropHeight,
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

const getBackgroundShapeGeometry = (shapeType, cardX, cardY, cardWidth, cardHeight) => {
  const centerX = cardX + (cardWidth / 2);
  const centerY = cardY + (cardHeight / 2);
  const createRegularPolygonPoints = (sides, radius, rotationOffset = -Math.PI / 2) => {
    const points = [];
    for (let index = 0; index < sides; index += 1) {
      const angle = rotationOffset + (index * Math.PI * 2) / sides;
      points.push(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    }
    return points;
  };

  if (shapeType === 'full') {
    return { kind: 'rect', x: cardX, y: cardY, width: cardWidth, height: cardHeight, cornerRadius: 40 };
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
      cornerRadius: 28,
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
  const strokeWidth = 4;
  const opacity = Math.max(0.05, Math.min(1, Number(backgroundOpacity ?? 1)));
  const geometry = getBackgroundShapeGeometry(shape.type, cardX, cardY, cardWidth, cardHeight);
  const fillProps = fillColor ? { fill: fillColor } : { fillEnabled: false };

  if (!geometry) {
    return null;
  }

  const renderShapeNode = (extraProps = {}, fillOverrides = fillProps) => {
    if (geometry.kind === 'rect') {
      return (
        <Rect
          x={geometry.x}
          y={geometry.y}
          width={geometry.width}
          height={geometry.height}
          cornerRadius={geometry.cornerRadius}
          {...fillOverrides}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          name="card-background"
          {...extraProps}
        />
      );
    }

    if (geometry.kind === 'line') {
      return (
        <Line
          points={geometry.points}
          closed
          {...fillOverrides}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          name="card-background"
          {...extraProps}
        />
      );
    }

    if (geometry.kind === 'heart') {
      return (
        <KonvaShape
          {...fillOverrides}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          name="card-background"
          {...extraProps}
          sceneFunc={(context, currentShape) => {
            traceBackgroundShapePath(context, geometry);
            context.fillStrokeShape(currentShape);
          }}
        />
      );
    }

    return null;
  };

  return renderShapeNode();
}

const restyleSvgMarkup = (svgMarkup, style = {}) => {
  if (!svgMarkup) {
    return null;
  }

  const targetColor = style.targetColor || style.fillColor || style.outlineColor || '#111827';
  const shapePattern = /<(path|circle|ellipse|polygon|polyline|rect|line)\b([^>]*)>/g;
  const nextSvgMarkup = svgMarkup.replace(shapePattern, (match, tagName, attrs) => {
    let nextAttrs = attrs;
    const hasVisibleFill = /fill="(?!none)[^"]*"/.test(nextAttrs);
    const hasFillNone = /fill="none"/.test(nextAttrs);
    const hasVisibleStroke = /stroke="(?!none)[^"]*"/.test(nextAttrs);
    const hasStrokeNone = /stroke="none"/.test(nextAttrs);
    const hasStrokeWidth = /stroke-width="[^"]*"/.test(nextAttrs);

    if (hasVisibleFill) {
      nextAttrs = nextAttrs.replace(/fill="(?!none)[^"]*"/g, `fill="${targetColor}"`);
    } else if (!hasFillNone && tagName !== 'line' && tagName !== 'polyline') {
      nextAttrs += ` fill="${targetColor}"`;
    }

    // Stroke-only icons disappear if we remove or nullify their strokes.
    if (hasVisibleStroke || hasFillNone || hasStrokeNone || tagName === 'line' || tagName === 'polyline') {
      if (/stroke="[^"]*"/.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/stroke="[^"]*"/g, `stroke="${targetColor}"`);
      } else {
        nextAttrs += ` stroke="${targetColor}"`;
      }

      if (!hasStrokeWidth) {
        nextAttrs += ' stroke-width="1.5"';
      }
    }

    return `<${tagName}${nextAttrs}>`;
  });

  return nextSvgMarkup.replace(/<svg\b([^>]*)>/, (match, attrs) => {
    let nextAttrs = attrs;

    if (/overflow="[^"]*"/.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/overflow="[^"]*"/, 'overflow="visible"');
    } else {
      nextAttrs += ' overflow="visible"';
    }

    return `<svg${nextAttrs}>`;
  });
};

function LogoNode({
  item,
  selected,
  onSelect,
  onTransformChange,
  onNodeDragStart,
  onNodeDragMove,
  onNodeDragEnd,
  setCursor,
  registerNode,
}) {
  const transform = item.transform || {
    x: Number(item.x || 0),
    y: Number(item.y || 0),
    scaleX: Number(item.scaleX || 1),
    scaleY: Number(item.scaleY || 1),
    rotation: Number(item.rotation || 0),
  };
  const isLineNode = item.kind === 'line' || item.type === 'line';
  const outlineWidth = Math.max(0, Number(item.style?.outlineWidth || 0));
  const styledImageUrl = useMemo(() => {
    if (isLineNode) {
      return "";
    }

    if (!item.style?.applyColorOverrides) {
      return item.imageUrl || "";
    }

    const svgMarkup = decodeSvgDataUri(item.imageUrl || "");
    if (!svgMarkup) {
      return item.imageUrl || "";
    }

    const nextSvgMarkup = restyleSvgMarkup(svgMarkup, {
      targetColor: item.style?.fillColor || '#111827',
    });
    return nextSvgMarkup ? encodeSvgDataUri(nextSvgMarkup) : item.imageUrl || "";
  }, [isLineNode, item.imageUrl, item.style]);
  const outlineImageUrl = useMemo(() => {
    if (isLineNode || !outlineWidth || !item.style?.applyColorOverrides) {
      return "";
    }

    const svgMarkup = decodeSvgDataUri(item.imageUrl || "");
    if (!svgMarkup) {
      return "";
    }

    const nextSvgMarkup = restyleSvgMarkup(svgMarkup, {
      targetColor: item.style?.outlineColor || '#111827',
    });
    return nextSvgMarkup ? encodeSvgDataUri(nextSvgMarkup) : "";
  }, [isLineNode, item.imageUrl, item.style, outlineWidth]);
  const [img] = useImage(styledImageUrl || "");
  const [outlineImg] = useImage(outlineImageUrl || "");
  const transform3d = get3dTransforms(item.style);
  let imageWidth = Number(item.baseWidth || item.width || 220);
  let imageHeight = Number(item.baseHeight || item.height || 160);

  if (!isLineNode && !(item.baseWidth || item.width) && img?.width && img?.height) {
    const maxLogoWidth = 280;
    const maxLogoHeight = 200;
    const logoScale = Math.min(maxLogoWidth / img.width, maxLogoHeight / img.height);
    imageWidth = img.width * logoScale;
    imageHeight = img.height * logoScale;
  }
  const actualScaleX = transform.scaleX || 1;
  const actualScaleY = transform.scaleY || 1;
  const maxX = Math.max(0, CANVAS_WIDTH - (imageWidth * Math.abs(actualScaleX)));
  const maxY = Math.max(0, CANVAS_HEIGHT - (imageHeight * Math.abs(actualScaleY)));

  const getBoundedPosition = (position) => ({
    x: Math.min(Math.max(position.x, 0), maxX),
    y: Math.min(Math.max(position.y, 0), maxY),
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
      draggable
      onClick={(event) => onSelect(event)}
      onTap={(event) => onSelect(event)}
      onDragStart={(event) => {
        onSelect(event);
        setCursor('grabbing');
        onNodeDragStart?.(event, item, 'logo');
      }}
      onDragMove={(event) => {
        event.target.position(getBoundedPosition({
          x: event.target.x(),
          y: event.target.y(),
        }));
        onNodeDragMove?.(event, item, 'logo');
      }}
      onDragEnd={(event) => {
        event.target.position(getBoundedPosition({
          x: event.target.x(),
          y: event.target.y(),
        }));
        setCursor('grab');
        onNodeDragEnd?.(event, item, 'logo', getTransformPayload(event));
      }}
      onTransformStart={() => setCursor('grabbing')}
      onTransformEnd={(event) => {
        setCursor('grab');
        onTransformChange(getTransformPayload(event));
      }}
      onMouseEnter={() => setCursor('grab')}
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
              stroke={item.style?.fillColor || item.stroke || item.style?.outlineColor || '#475569'}
              strokeWidth={Number(item.strokeWidth || 2)}
              hitStrokeWidth={Math.max(20, Number(item.strokeWidth || 2) + 16)}
              opacity={item.opacity ?? 1}
              lineCap="round"
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
                    opacity={0.92}
                  />
                ))}
              </>
            )}
            <KonvaImage image={img} width={imageWidth} height={imageHeight} />
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
  onSelect,
  onTransformChange,
  onNodeDragStart,
  onNodeDragMove,
  onNodeDragEnd,
  setCursor,
  registerNode,
}) {
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
  const actualScaleX = transform.scaleX || 1;
  const actualScaleY = transform.scaleY || 1;
  const maxX = Math.max(0, CANVAS_WIDTH - (blockWidth * Math.abs(actualScaleX)));
  const maxY = Math.max(0, CANVAS_HEIGHT - (blockHeight * Math.abs(actualScaleY)));

  const getBoundedPosition = (position) => ({
    x: Math.min(Math.max(position.x, 0), maxX),
    y: Math.min(Math.max(position.y, 0), maxY),
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
      draggable
      onClick={(event) => onSelect(event)}
      onTap={(event) => onSelect(event)}
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
      onTransformStart={() => setCursor('grabbing')}
      onTransformEnd={(event) => {
        setCursor('grab');
        onTransformChange(getTransformPayload(event));
      }}
      onMouseEnter={() => setCursor('grab')}
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
        {selected && (
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
          <KonvaImage image={svgTextImage} width={blockWidth} height={blockHeight} />
        ) : (
          <Text
            text={value}
            width={blockWidth}
            height={blockHeight}
            fontSize={fontSize}
            fontFamily={item.fontFamily || fontFamily || 'Arial'}
            fontStyle={item.fontStyle || "bold"}
            fill={item.style?.fillColor || item.fill || textColor || '#1F2937'}
            stroke={Number(item.style?.outlineWidth || 0) > 0 ? item.style?.outlineColor || '#111827' : undefined}
            strokeWidth={Number(item.style?.outlineWidth || 0)}
            align={item.align || "center"}
            verticalAlign="middle"
            letterSpacing={Number(item.letterSpacing || 0)}
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
  selectionOverride,
  clearSelectionToken = 0,
  stageRef: externalStageRef = null,
  zoom = 1,
}) {
  const containerRef = useRef(null);
  const transformerRef = useRef(null);
  const nodeMapRef = useRef({});
  const dragSelectionRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 500, scale: 1 });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [backgroundImage] = useImage(config.bgImageUrl || '');

  const canvasWidth = CANVAS_WIDTH;
  const canvasHeight = CANVAS_HEIGHT;
  const cardWidth = 620;
  const cardHeight = 420;
  const cardX = (canvasWidth - cardWidth) / 2;
  const cardY = (canvasHeight - cardHeight) / 2;

  const logoItems = useMemo(() => config.logoItems || [], [config.logoItems]);
  const textItems = useMemo(() => config.textItems || [], [config.textItems]);
  const backgroundShape = useMemo(() => config.backgroundShape || null, [config.backgroundShape]);
  const backgroundOpacity = useMemo(() => Math.max(0.05, Math.min(1, Number(config.bgOpacity ?? 1))), [config.bgOpacity]);
  const backgroundImageCrop = useMemo(() => {
    if (!backgroundImage) {
      return null;
    }

    return getCoverCrop(backgroundImage, cardWidth, cardHeight);
  }, [backgroundImage, cardHeight, cardWidth]);
  const cardFillProps = useMemo(() => {
    return getBackgroundFillProps(config.bgColor || '#FFFFFF', config.bgFill || null, cardWidth, cardHeight);
  }, [config.bgColor, config.bgFill, cardHeight, cardWidth]);
  const viewportWidth = cardWidth * dimensions.scale * zoom;
  const viewportHeight = cardHeight * dimensions.scale * zoom;
  const viewportOffsetX = cardX * dimensions.scale * zoom;
  const viewportOffsetY = cardY * dimensions.scale * zoom;

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

  useEffect(() => {
    if (!transformerRef.current) {
      return;
    }

    const key = selectedItems.length === 1 ? `${selectedItems[0].type}:${selectedItems[0].id}` : null;
    const node = key ? nodeMapRef.current[key] : null;
    transformerRef.current.nodes(node ? [node] : []);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedItems, logoItems, textItems]);

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
      const nextSelection = selectionOverride ?? null;
      setSelectedItem(nextSelection);
      setSelectedItems(nextSelection ? [nextSelection] : []);
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

    onConfigChange({
      [collectionName]: (config[collectionName] || []).map((item) =>
        item.id === itemId
          ? { ...item, transform: nextTransform }
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

  const commitSelectionTransforms = (updates) => {
    if (typeof onConfigChange !== 'function' || !updates.size) {
      return;
    }

    onConfigChange({
      logoItems: logoItems.map((item) => {
        const nextTransform = updates.get(`logo:${item.id}`);
        return nextTransform ? { ...item, transform: nextTransform } : item;
      }),
      textItems: textItems.map((item) => {
        const nextTransform = updates.get(`text:${item.id}`);
        return nextTransform ? { ...item, transform: nextTransform } : item;
      }),
    });
  };

  const handleNodeDragStart = (event, item, type) => {
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
      }).filter((entry) => entry.item),
    };
  };

  const handleNodeDragMove = (event, item, type) => {
    const dragSelection = dragSelectionRef.current;
    if (!dragSelection || dragSelection.draggedKey !== `${type}:${item.id}`) {
      return;
    }

    const deltaX = event.target.x() - dragSelection.origin.x;
    const deltaY = event.target.y() - dragSelection.origin.y;

    dragSelection.items.forEach((entry) => {
      const nodeKey = `${entry.type}:${entry.id}`;
      const node = nodeMapRef.current[nodeKey];
      if (!node) {
        return;
      }

      const nextPosition = clampCanvasItemPosition(
        entry.item,
        entry.type,
        { x: entry.start.x + deltaX, y: entry.start.y + deltaY }
      );
      node.position(nextPosition);
    });

    event.target.getLayer()?.batchDraw();
  };

  const handleNodeDragEnd = (event, item, type, nextTransform) => {
    const dragSelection = dragSelectionRef.current;
    if (!dragSelection || dragSelection.draggedKey !== `${type}:${item.id}`) {
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
    commitSelectionTransforms(updates);
  };

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="overflow-hidden rounded-[2.5rem] border border-gray-50 bg-white shadow-2xl"
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
              <Rect
                x={cardX}
                y={cardY}
                width={cardWidth}
                height={cardHeight}
                {...cardFillProps}
                opacity={backgroundOpacity}
                cornerRadius={40}
                name="card-background"
              />
              {backgroundImage && backgroundImageCrop ? (
                <Group
                  clipFunc={(context) => {
                    drawRoundedRectPath(context, cardX, cardY, cardWidth, cardHeight, 40);
                  }}
                >
                  <KonvaImage
                    image={backgroundImage}
                    x={cardX}
                    y={cardY}
                    width={cardWidth}
                    height={cardHeight}
                    crop={backgroundImageCrop}
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

              {logoItems.map((item) => (
              <LogoNode
                key={item.id}
                item={item}
                selected={selectedItems.some((entry) => entry.type === 'logo' && entry.id === item.id)}
                  onSelect={(event) => handleItemSelect({ type: 'logo', id: item.id }, event)}
                  onTransformChange={(transform) => updateItemTransform('logoItems', item.id, transform)}
                  onNodeDragStart={handleNodeDragStart}
                  onNodeDragMove={handleNodeDragMove}
                  onNodeDragEnd={handleNodeDragEnd}
                  setCursor={setCursor}
                  registerNode={registerNode}
                />
              ))}

              {textItems.map((item) => (
              <TextNode
                key={item.id}
                item={item}
                fontFamily={config.fontFamily}
                textColor={config.textColor}
                selected={selectedItems.some((entry) => entry.type === 'text' && entry.id === item.id)}
                  onSelect={(event) => handleItemSelect({ type: 'text', id: item.id }, event)}
                  onTransformChange={(transform) => updateItemTransform('textItems', item.id, transform)}
                  onNodeDragStart={handleNodeDragStart}
                  onNodeDragMove={handleNodeDragMove}
                  onNodeDragEnd={handleNodeDragEnd}
                  setCursor={setCursor}
                  registerNode={registerNode}
                />
              ))}

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

                  if (newBox.width > CANVAS_WIDTH || newBox.height > CANVAS_HEIGHT) {
                    return oldBox;
                  }

                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
