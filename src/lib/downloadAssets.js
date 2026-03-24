export const DOWNLOAD_FORMATS = [
  { id: 'svg', label: 'SVG', description: 'Best for editing and print' },
  { id: 'png', label: 'PNG', description: 'Recommended for transparent-style sharing' },
  { id: 'pdf', label: 'PDF', description: 'Best for documents and print handoff' },
  { id: 'jpg', label: 'JPG', description: 'Good for previews and uploads' },
  { id: 'webp', label: 'WebP', description: 'Modern lightweight web format' },
];

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
