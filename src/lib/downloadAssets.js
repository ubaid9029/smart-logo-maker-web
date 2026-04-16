import {
  BRAND_WATERMARK_DIAGONAL_INNER_MARGIN_RATIO,
  BRAND_WATERMARK_DIAGONAL_LAYER_COUNT,
  BRAND_WATERMARK_GRID_COLUMNS,
  BRAND_WATERMARK_GRID_GAP_X_RATIO,
  BRAND_WATERMARK_GRID_GAP_Y_RATIO,
  BRAND_WATERMARK_GRID_ITEM_FILL_RATIO,
  BRAND_WATERMARK_OPACITY,
  BRAND_WATERMARK_ROTATION,
  BRAND_WATERMARK_SRC,
  injectBrandWatermarkIntoSvgMarkup,
} from './watermarkConfig';

export const DOWNLOAD_FORMATS = [
  { id: 'svg', label: 'SVG', description: 'Best for editing and print' },
  { id: 'png', label: 'PNG', description: 'Recommended for transparent-style sharing' },
  { id: 'pdf', label: 'PDF', description: 'Best for documents and print handoff' },
  { id: 'jpg', label: 'JPG', description: 'Good for previews and uploads' },
  { id: 'webp', label: 'WebP', description: 'Modern lightweight web format' },
];

let watermarkSvgTextPromise = null;
let watermarkSvgDataUriPromise = null;

export const getDownloadBaseName = (value) => (
  (value || 'logo')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase() || 'logo'
);

export const getSvgCanvasSize = (svgMarkup) => {
  const viewBoxMatch = svgMarkup?.match(/viewBox="([^"]+)"/i);
  if (viewBoxMatch) {
    const [, viewBox] = viewBoxMatch;
    const [, , width, height] = viewBox.split(/\s+/).map(Number);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return { width, height };
    }
  }

  const widthMatch = svgMarkup?.match(/width="([^"]+)"/i);
  const heightMatch = svgMarkup?.match(/height="([^"]+)"/i);
  const width = Number(widthMatch?.[1]);
  const height = Number(heightMatch?.[1]);

  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return { width, height };
  }

  return { width: 340, height: 250 };
};

const escapeXmlAttribute = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');


export const triggerBlobDownload = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

export const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new window.Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const loadWatermarkSvgText = async () => {
  if (watermarkSvgTextPromise) {
    return watermarkSvgTextPromise;
  }

  watermarkSvgTextPromise = fetch(BRAND_WATERMARK_SRC, { cache: 'force-cache' })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Unable to load watermark asset');
      }

      return response.text();
    })
    .catch((error) => {
      watermarkSvgTextPromise = null;
      throw error;
    });

  return watermarkSvgTextPromise;
};

export const getWatermarkSvgDataUri = async () => {
  if (watermarkSvgDataUriPromise) {
    return watermarkSvgDataUriPromise;
  }

  watermarkSvgDataUriPromise = loadWatermarkSvgText()
    .then((svgMarkup) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`)
    .catch((error) => {
      watermarkSvgDataUriPromise = null;
      throw error;
    });

  return watermarkSvgDataUriPromise;
};

export const buildWatermarkedSvgMarkup = async (svgMarkup) => {
  if (!svgMarkup || typeof svgMarkup !== 'string') {
    return svgMarkup;
  }

  try {
    const watermarkHref = await getWatermarkSvgDataUri();
    return injectBrandWatermarkIntoSvgMarkup(svgMarkup, { watermarkHref });
  } catch {
    return svgMarkup;
  }
};

export const renderSvgToCanvas = async (svgMarkup, scale = 4) => {
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(objectUrl);
    const { width, height } = getSvgCanvasSize(svgMarkup);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas context unavailable');
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return { canvas, width, height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const renderDataUrlToCanvas = async (dataUrl) => {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, image.width);
  canvas.height = Math.max(1, image.height);
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas context unavailable');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return { canvas, width: image.width, height: image.height };
};

export const cropCanvasToArea = (sourceCanvas, area = {}) => {
  const sourceWidth = Number(sourceCanvas?.width || 0);
  const sourceHeight = Number(sourceCanvas?.height || 0);
  const x = Math.max(0, Math.round(Number(area.x) || 0));
  const y = Math.max(0, Math.round(Number(area.y) || 0));
  const width = Math.max(1, Math.round(Number(area.width) || sourceWidth));
  const height = Math.max(1, Math.round(Number(area.height) || sourceHeight));
  const safeWidth = Math.max(1, Math.min(width, sourceWidth - x));
  const safeHeight = Math.max(1, Math.min(height, sourceHeight - y));
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = safeWidth;
  outputCanvas.height = safeHeight;
  const outputContext = outputCanvas.getContext('2d');

  if (!outputContext) {
    throw new Error('Canvas context unavailable');
  }

  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = 'high';
  outputContext.drawImage(
    sourceCanvas,
    x,
    y,
    safeWidth,
    safeHeight,
    0,
    0,
    safeWidth,
    safeHeight
  );

  return outputCanvas;
};

export const getScaledCanvasArea = (sourceCanvas, area = {}, logicalSize = {}) => {
  const sourceWidth = Number(sourceCanvas?.width || 0);
  const sourceHeight = Number(sourceCanvas?.height || 0);
  const targetWidth = Math.max(1, Math.round(Number(area.width) || sourceWidth));
  const targetHeight = Math.max(1, Math.round(Number(area.height) || sourceHeight));

  if (
    Math.abs(sourceWidth - targetWidth) <= 2 &&
    Math.abs(sourceHeight - targetHeight) <= 2
  ) {
    return {
      x: 0,
      y: 0,
      width: sourceWidth,
      height: sourceHeight,
    };
  }

  const logicalWidth = Math.max(1, Number(logicalSize.width) || sourceWidth);
  const logicalHeight = Math.max(1, Number(logicalSize.height) || sourceHeight);
  const scaleX = sourceWidth / logicalWidth;
  const scaleY = sourceHeight / logicalHeight;

  return {
    x: Math.round((Number(area.x) || 0) * scaleX),
    y: Math.round((Number(area.y) || 0) * scaleY),
    width: Math.round(targetWidth * scaleX),
    height: Math.round(targetHeight * scaleY),
  };
};

export const cropCanvasToLogicalArea = (sourceCanvas, area = {}, logicalSize = {}) => (
  cropCanvasToArea(sourceCanvas, getScaledCanvasArea(sourceCanvas, area, logicalSize))
);

export const cropCanvasToVisibleContent = (sourceCanvas, options = {}) => {
  const sourceWidth = Number(sourceCanvas?.width || 0);
  const sourceHeight = Number(sourceCanvas?.height || 0);

  if (!sourceWidth || !sourceHeight) {
    return sourceCanvas;
  }

  const context = sourceCanvas.getContext?.('2d', { willReadFrequently: true });
  if (!context) {
    return sourceCanvas;
  }

  const alphaThreshold = Math.max(0, Math.min(255, Number(options.alphaThreshold ?? 8)));
  const padding = Math.max(0, Math.round(Number(options.padding ?? 24)));
  const { data } = context.getImageData(0, 0, sourceWidth, sourceHeight);
  let minX = sourceWidth;
  let minY = sourceHeight;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < sourceHeight; y += 1) {
    for (let x = 0; x < sourceWidth; x += 1) {
      const alpha = data[((y * sourceWidth) + x) * 4 + 3];
      if (alpha <= alphaThreshold) {
        continue;
      }

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    return sourceCanvas;
  }

  return cropCanvasToArea(sourceCanvas, {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: Math.min(sourceWidth, (maxX - minX) + 1 + (padding * 2)),
    height: Math.min(sourceHeight, (maxY - minY) + 1 + (padding * 2)),
  });
};

export const buildRasterImageSvgMarkup = (imageUrl, width, height) => {
  const safeWidth = Math.max(1, Math.round(Number(width) || 0));
  const safeHeight = Math.max(1, Math.round(Number(height) || 0));

  if (!imageUrl || !safeWidth || !safeHeight) {
    return null;
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}" preserveAspectRatio="xMidYMid meet">`,
    `<image href="${escapeXmlAttribute(imageUrl)}" x="0" y="0" width="${safeWidth}" height="${safeHeight}" preserveAspectRatio="none" />`,
    '</svg>',
  ].join('');
};

const drawCanvasDiagonalWatermarks = (context, canvas, image, options) => {
  const layerCount = Math.max(1, Math.round(Number(options.layerCount) || BRAND_WATERMARK_DIAGONAL_LAYER_COUNT));
  const columns = Math.max(1, BRAND_WATERMARK_GRID_COLUMNS);
  const rows = Math.max(1, Math.ceil(layerCount / columns));
  const marginX = canvas.width * BRAND_WATERMARK_DIAGONAL_INNER_MARGIN_RATIO;
  const marginY = canvas.height * BRAND_WATERMARK_DIAGONAL_INNER_MARGIN_RATIO;
  const containerWidth = Math.max(1, canvas.width - (marginX * 2));
  const containerHeight = Math.max(1, canvas.height - (marginY * 2));
  const baseGapX = containerWidth * BRAND_WATERMARK_GRID_GAP_X_RATIO;
  const baseGapY = containerHeight * BRAND_WATERMARK_GRID_GAP_Y_RATIO;
  const gapX = columns > 1 ? Math.min(baseGapX, containerWidth * 0.28) : 0;
  const gapY = rows > 1 ? Math.min(baseGapY, containerHeight * 0.3) : 0;
  const slotWidth = Math.max(1, (containerWidth - (gapX * (columns - 1))) / columns);
  const slotHeight = Math.max(1, (containerHeight - (gapY * (rows - 1))) / rows);
  const baseSize = Math.min(slotWidth, slotHeight) * BRAND_WATERMARK_GRID_ITEM_FILL_RATIO;
  const sourceRatio = image?.width && image?.height ? (image.height / image.width) : 1;
  const drawWidth = Math.max(8, baseSize);
  const drawHeight = Math.max(8, baseSize * sourceRatio);
  const minX = ((-canvas.width / 2) + marginX);
  const minY = ((-canvas.height / 2) + marginY);

  context.save();
  context.globalAlpha = options.opacity;
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((options.rotation * Math.PI) / 180);

  for (let index = 0; index < layerCount; index += 1) {
    const columnIndex = index % columns;
    const rowIndex = Math.floor(index / columns);
    const slotX = minX + (columnIndex * (slotWidth + gapX));
    const slotY = minY + (rowIndex * (slotHeight + gapY));
    const layerX = slotX + ((slotWidth - drawWidth) / 2);
    const layerY = slotY + ((slotHeight - drawHeight) / 2);
    context.drawImage(image, layerX, layerY, drawWidth, drawHeight);
  }

  context.restore();
};

export const applyWatermarkToCanvas = async (canvas, options = {}) => {
  const context = canvas?.getContext?.('2d');

  if (!context) {
    throw new Error('Canvas context unavailable');
  }

  try {
    const watermarkImage = await loadImage(await getWatermarkSvgDataUri());
    drawCanvasDiagonalWatermarks(context, canvas, watermarkImage, {
      opacity: BRAND_WATERMARK_OPACITY,
      rotation: BRAND_WATERMARK_ROTATION,
      layerCount: BRAND_WATERMARK_DIAGONAL_LAYER_COUNT,
    });
  } catch {
    return canvas;
  }

  return canvas;
};

export const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) {
      resolve(blob);
      return;
    }

    reject(new Error('Unable to create file'));
  }, type, quality);
});

const asciiBytes = (value) => Uint8Array.from(Array.from(value, (character) => character.charCodeAt(0)));

export const buildPdfBlobFromJpegBytes = (jpegBytes, imageWidth, imageHeight) => {
  const pageWidth = 842;
  const pageHeight = 595;
  const maxWidth = pageWidth - 72;
  const maxHeight = pageHeight - 72;
  const imageRatio = imageWidth / imageHeight;
  let drawWidth = maxWidth;
  let drawHeight = drawWidth / imageRatio;

  if (drawHeight > maxHeight) {
    drawHeight = maxHeight;
    drawWidth = drawHeight * imageRatio;
  }

  const offsetX = (pageWidth - drawWidth) / 2;
  const offsetY = (pageHeight - drawHeight) / 2;
  const contentStream = `q\n${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${offsetX.toFixed(2)} ${offsetY.toFixed(2)} cm\n/Im0 Do\nQ`;
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /ProcSet [/PDF /ImageC] /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
    '\nendstream\nendobj\n',
    `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];

  const chunks = [asciiBytes('%PDF-1.3\n')];
  const offsets = [0];
  let length = chunks[0].length;

  const pushAsciiChunk = (value) => {
    offsets.push(length);
    const chunk = asciiBytes(value);
    chunks.push(chunk);
    length += chunk.length;
  };

  pushAsciiChunk(objects[0]);
  pushAsciiChunk(objects[1]);
  pushAsciiChunk(objects[2]);
  offsets.push(length);
  chunks.push(asciiBytes(objects[3]));
  length += asciiBytes(objects[3]).length;
  chunks.push(jpegBytes);
  length += jpegBytes.length;
  chunks.push(asciiBytes(objects[4]));
  length += asciiBytes(objects[4]).length;
  pushAsciiChunk(objects[5]);

  const xrefOffset = length;
  const xrefEntries = ['0000000000 65535 f '].concat(offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `));
  const xref = `xref\n0 ${xrefEntries.length}\n${xrefEntries.join('\n')}\n`;
  const trailer = `trailer\n<< /Size ${xrefEntries.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(asciiBytes(xref));
  chunks.push(asciiBytes(trailer));

  return new Blob(chunks, { type: 'application/pdf' });
};
