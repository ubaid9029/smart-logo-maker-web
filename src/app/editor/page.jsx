"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import DownloadDialog from '../../components/DownloadDialog';
import {
  buildPdfBlobFromJpegBytes,
  canvasToBlob,
  getDownloadBaseName,
  renderDataUrlToCanvas,
  triggerBlobDownload,
} from '../../lib/downloadAssets';
import {
  ImagePlus,
  Shapes,
  Type,
  Sparkles,
  Palette,
  Images,
  Eye,
  Maximize2,
  Save,
  ShoppingCart,
  X,
  SlidersHorizontal,
  Minimize2,
  Diamond,
  Pentagon,
  Hexagon,
  Square,
  RectangleHorizontal,
  Triangle,
  Heart,
  Star,
  Trash2,
  Undo2,
  Redo2,
  RotateCcw,
  RotateCw,
  RefreshCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
} from 'lucide-react';
import { useSelector } from 'react-redux'; // Redux check ke liye

const LogoCanvas = dynamic(() => import('../../components/Editor/Canvas'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-white animate-pulse rounded-3xl" />
});

const gradients = {
  primary: "bg-gradient-to-r from-[#FF6B00] via-[#E02424] to-[#2563EB]",
  text: "bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] via-[#E02424] to-[#2563EB]",
};

const EDITOR_FONT_FAMILIES = {
  "1": "Arial",
  "2": "Georgia",
  "3": "Impact",
  "4": "Courier New",
  "5": "Helvetica",
  "6": "Times New Roman",
};

const AVAILABLE_EDITOR_FONTS = [
  'Arial',
  'Georgia',
  'Impact',
  'Courier New',
  'Helvetica',
  'Times New Roman',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Garamond',
  'Palatino Linotype',
];

const editorTools = [
  { id: 'background', label: 'Background', icon: ImagePlus },
  { id: 'art', label: 'Art', icon: Shapes },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'effect', label: 'Effect', icon: Sparkles },
  { id: 'palette', label: 'Palette', icon: Palette },
  { id: 'images', label: 'Images', icon: Images },
];

const mobileControlsTool = { id: 'controls', label: 'Controls', icon: SlidersHorizontal };

const backgroundOptions = [
  { id: 'color', label: 'Color', icon: Palette },
  { id: 'gradient', label: 'Gradient', icon: Sparkles },
  { id: 'background', label: 'Background', icon: ImagePlus },
  { id: 'texture', label: 'Texture', icon: Shapes },
  { id: 'image', label: 'Image', icon: Images },
];

const backgroundShapeOptions = [
  { id: 'none', label: 'Remove', icon: X },
  { id: 'full', label: 'Square', icon: Square },
  { id: 'diamond', label: 'Diamond', icon: Diamond },
  { id: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal },
  { id: 'triangle', label: 'Triangle', icon: Triangle },
  { id: 'pentagon', label: 'Pentagon', icon: Pentagon },
  { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'star', label: 'Star', icon: Star },
  { id: 'arrow', label: 'Arrow', icon: ArrowRight },
];

const gradientDirectionOptions = [
  { id: 'down', label: 'Down', icon: ArrowDown, cssDirection: 'to bottom' },
  { id: 'right', label: 'Right', icon: ArrowRight, cssDirection: 'to right' },
  { id: 'up', label: 'Up', icon: ArrowUp, cssDirection: 'to top' },
  { id: 'left', label: 'Left', icon: ArrowLeft, cssDirection: 'to left' },
];

const colorSwatches = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#111827',
  '#ffffff',
  '#94a3b8',
];
const backgroundColorSwatches = [...colorSwatches];
const designPalettes = [
  { id: '1', name: 'Vibrant Energy', colors: ['#FB923C', '#EC4899', '#FACC15', '#F87171'] },
  { id: '2', name: 'Warm Sunset', colors: ['#7C2D12', '#EA580C', '#FB923C', '#FED7AA'] },
  { id: '3', name: 'Natural Green', colors: ['#064E3B', '#059669', '#34D399', '#D1FAE5'] },
  { id: '4', name: 'Elegant Gold', colors: ['#111827', '#B45309', '#F59E0B', '#FEF3C7'] },
  { id: '5', name: 'Midnight Bloom', colors: ['#312E81', '#7C3AED', '#C084FC', '#EDE9FE'] },
  { id: '6', name: 'Coral Punch', colors: ['#9F1239', '#F43F5E', '#FB7185', '#FFE4E6'] },
  { id: '7', name: 'Forest Mist', colors: ['#14532D', '#22C55E', '#86EFAC', '#F0FDF4'] },
  { id: '8', name: 'Royal Ink', colors: ['#172554', '#1D4ED8', '#60A5FA', '#DBEAFE'] },
  { id: '9', name: 'Peach Studio', colors: ['#7C2D12', '#FB923C', '#FDBA74', '#FFEDD5'] },
  { id: '10', name: 'Berry Luxe', colors: ['#4A044E', '#C026D3', '#E879F9', '#FAE8FF'] },
  { id: '11', name: 'Earth Clay', colors: ['#78350F', '#A16207', '#EAB308', '#FEF9C3'] },
  { id: '12', name: 'Arctic Glow', colors: ['#164E63', '#06B6D4', '#67E8F9', '#ECFEFF'] },
  { id: '13', name: 'Rose Smoke', colors: ['#881337', '#E11D48', '#FDA4AF', '#FFF1F2'] },
  { id: '14', name: 'Stone Mono', colors: ['#1F2937', '#6B7280', '#D1D5DB', '#F9FAFB'] },
  { id: '15', name: 'Citrus Pop', colors: ['#365314', '#84CC16', '#FACC15', '#FEF9C3'] },
];
const backgroundLibraryImages = [
  '/assets/bg_images/bg_1.jpg',
  '/assets/bg_images/bg_2.jpg',
  '/assets/bg_images/bg_3.jpeg',
  '/assets/bg_images/bg_4.jpg',
  '/assets/bg_images/bg_5.jpg',
  '/assets/bg_images/bg_6.jpg',
  '/assets/bg_images/bg_7.jpg',
  '/assets/bg_images/bg_8.jpg',
  '/assets/bg_images/bg_9.jpg',
  '/assets/bg_images/bg_10.jpg',
];
const textureLibraryImages = [
  '/assets/texture_images/texture_1.jpg',
  '/assets/texture_images/texture_2.jpg',
  '/assets/texture_images/texture_3.jpg',
  '/assets/texture_images/texture_4.jpg',
  '/assets/texture_images/texture_5.png',
  '/assets/texture_images/texture_6.jpg',
  '/assets/texture_images/texture_7.jpg',
  '/assets/texture_images/texture_8.jpg',
  '/assets/texture_images/texture_9.jpg',
  '/assets/texture_images/texture_10.jpg',
];
const effectLibraryImages = [
  '/assets/effects_images/ef1.jpg',
  '/assets/effects_images/ef2.jpg',
  '/assets/effects_images/ef3.jpg',
  '/assets/effects_images/ef4.jpg',
  '/assets/effects_images/ef5.jpg',
  '/assets/effects_images/ef6.jpg',
  '/assets/effects_images/ef7.jpg',
  '/assets/effects_images/ef8.jpg',
  '/assets/effects_images/ef9.jpg',
  '/assets/effects_images/ef10.jpg',
];
const artLibraryImages = [
  '/assets/logo_images/art1.svg',
  '/assets/logo_images/art2.svg',
  '/assets/logo_images/art3.svg',
  '/assets/logo_images/logo_1.png',
  '/assets/logo_images/logo_2.png',
  '/assets/logo_images/logo_3.png',
  '/assets/logo_images/logo_4.png',
  '/assets/logo_images/logo_5.png',
  '/assets/logo_images/logo_6.png',
  '/assets/logo_images/logo_7.png',
  '/assets/logo_images/logo_8.png',
  '/assets/logo_images/logo_9.png',
  '/assets/logo_images/logo_10.png',
];
const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;
const CARD_WIDTH = 620;
const CARD_HEIGHT = 420;
const CARD_X = (CANVAS_WIDTH - CARD_WIDTH) / 2;
const CARD_Y = (CANVAS_HEIGHT - CARD_HEIGHT) / 2;
const EDITED_LOGO_STORAGE_PREFIX = 'edited-logo:';
const EMPTY_EDIT_DIALOG = {
  open: false,
  type: null,
  mode: null,
  id: null,
  businessValue: '',
  sloganValue: '',
};
const waitForNextFrame = () => new Promise((resolve) => {
  if (typeof window === 'undefined') {
    resolve();
    return;
  }

  window.requestAnimationFrame(() => resolve());
});

const waitForFrames = async (count = 1) => {
  for (let index = 0; index < count; index += 1) {
    await waitForNextFrame();
  }
};

const getCollectionNameByType = (type) => {
  if (type === 'logo') return 'logoItems';
  if (type === 'text') return 'textItems';
  return null;
};

const isValidHexColor = (value) => /^#([0-9A-F]{6})$/i.test(value || '');

const normalizeHexColor = (value, fallback = '#111827') => {
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

const hexToRgb = (hex) => {
  const normalized = normalizeHexColor(hex);
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
};

const rgbToHex = ({ r, g, b }) => {
  const toHex = (channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const buildShadeScale = (baseHex, total = 10) => {
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

const getLinearGradientCss = (direction, startColor, endColor) => {
  const selected = gradientDirectionOptions.find((option) => option.id === direction);
  const cssDirection = selected?.cssDirection || 'to bottom';
  return `linear-gradient(${cssDirection}, ${startColor} 0%, ${endColor} 100%)`;
};

const getRadialGradientCss = (angle, startColor, endColor) => {
  const safeAngle = Number(angle || 0);
  const radians = (safeAngle * Math.PI) / 180;
  const x = 50 + Math.cos(radians) * 38;
  const y = 50 + Math.sin(radians) * 38;
  return `radial-gradient(circle at ${x}% ${y}%, ${startColor} 0%, ${endColor} 70%)`;
};

const getCombinedTextValue = (businessValue, sloganValue) => {
  const safeBusiness = (businessValue || '').trim();
  const safeSlogan = (sloganValue || '').trim();

  if (!safeBusiness) {
    return safeSlogan || 'BRAND';
  }

  return safeSlogan ? `${safeBusiness} | ${safeSlogan}` : safeBusiness;
};

const getEditorTextValue = (item = {}) => {
  const directText = typeof item.text === 'string' ? item.text.trim() : '';
  if (directText) {
    return directText;
  }

  return getCombinedTextValue(item.businessValue, item.sloganValue);
};

const getFontWidthFactor = (fontFamily = '') => {
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

const getTextMetrics = (item = {}) => {
  const safeValue = getEditorTextValue(item) || 'BRAND';
  const explicitFontSize = Number(item.fontSize || 0);
  const fontSize = explicitFontSize > 0
    ? explicitFontSize
    : safeValue.length > 28 ? 24 : safeValue.length > 20 ? 30 : safeValue.length > 12 ? 38 : 46;
  const explicitWidth = Number(item.width || 0);
  const explicitHeight = Number(item.height || 0);
  const fontWidthFactor = getFontWidthFactor(item.fontFamily);
  const measuredWidth = Math.min(560, Math.max(160, safeValue.length * (fontSize * fontWidthFactor) + 24));
  const measuredHeight = fontSize + 18;
  const blockWidth = item.renderMode === 'svg'
    ? (explicitWidth > 0 ? explicitWidth : measuredWidth)
    : Math.max(explicitWidth, measuredWidth);
  const blockHeight = item.renderMode === 'svg'
    ? (explicitHeight > 0 ? explicitHeight : measuredHeight)
    : Math.max(explicitHeight, measuredHeight);

  return { width: blockWidth, height: blockHeight };
};

const preserveTextCenterTransform = (previousItem = {}, nextItem = {}) => {
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

const withMeasuredTextBox = (item = {}) => {
  const metrics = getTextMetrics(item);

  return {
    ...item,
    width: metrics.width,
    height: metrics.height,
  };
};

const clampTransformToCard = (type, item, transform) => {
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

const buildDefaultItemStyle = (fillColor = '#111827') => ({
  fillColor,
  outlineColor: '#111827',
  outlineWidth: 0,
  applyColorOverrides: false,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
});

function ColorPickerField({ value, onChange, disabled = false }) {
  const safeValue = isValidHexColor(value) ? value : normalizeHexColor(value, '#FFFFFF');

  return (
    <label
      className={`relative flex h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
    >
      <span
        className="block h-full w-full rounded-xl border border-slate-100 shadow-inner"
        style={{ backgroundColor: safeValue }}
      />
      <input
        type="color"
        value={safeValue}
        onChange={onChange}
        disabled={disabled}
        className={`absolute inset-0 h-full w-full opacity-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      />
    </label>
  );
}

function HexColorInput({ value, onValidColorChange, onSubmit, placeholder = '#111827', disabled = false }) {
  const normalizedValue = isValidHexColor(value) ? value.toUpperCase() : normalizeHexColor(value, placeholder).toUpperCase();
  const [draft, setDraft] = useState(normalizedValue);

  useEffect(() => {
    setDraft(normalizedValue);
  }, [normalizedValue]);

  const commitValue = useCallback(() => {
    const normalizedDraft = normalizeHexColor(draft, normalizedValue).toUpperCase();
    setDraft(normalizedDraft);
    if (isValidHexColor(normalizedDraft)) {
      onValidColorChange?.(normalizedDraft);
    }
  }, [draft, normalizedValue, onValidColorChange]);

  return (
    <input
      type="text"
      value={draft}
      disabled={disabled}
      onChange={(event) => {
        const nextValue = event.target.value.toUpperCase();
        setDraft(nextValue);
        if (isValidHexColor(nextValue)) {
          onValidColorChange?.(nextValue);
        }
      }}
      onBlur={commitValue}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commitValue();
          onSubmit?.();
        }
      }}
      className="h-12 w-[180px] max-w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-orange-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      placeholder={placeholder}
    />
  );
}

const normalizePayloadLogoItem = (item) => {
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

const normalizePayloadTextItem = (item) => {
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
      fontStyle: item.fontStyle || 'bold',
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
    fontStyle: item.fontStyle || 'bold',
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

const buildInitialPresent = ({
  urlBgColor,
  urlTextColor,
  urlImage,
  initialBusinessValue,
  initialSloganValue,
  formData,
  payload,
}) => {
  const fallbackPresent = {
    bgColor: urlBgColor || '#FFFFFF',
    bgOpacity: 1,
    bgFill: null,
    bgImageUrl: null,
    backgroundShape: null,
    fontFamily: EDITOR_FONT_FAMILIES[formData?.fontId] || 'Arial',
    textColor: urlTextColor || '#1A1A1A',
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
        id: 'text-1',
        businessValue: initialBusinessValue,
        sloganValue: initialSloganValue,
        transform: {
          x: CARD_X + 70,
          y: CARD_Y + CARD_HEIGHT - 74,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
        style: buildDefaultItemStyle(urlTextColor || '#1A1A1A'),
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

  return {
    ...fallbackPresent,
    bgColor: payload.backgroundColor || payload.bgColor || fallbackPresent.bgColor,
    bgOpacity: Number(payload.bgOpacity ?? payload.backgroundOpacity ?? fallbackPresent.bgOpacity),
    bgFill: payload.bgFill || fallbackPresent.bgFill,
    bgImageUrl: payload.bgImageUrl || fallbackPresent.bgImageUrl,
    backgroundShape: payload.backgroundShape || fallbackPresent.backgroundShape,
    fontFamily: payload.fontFamily || fallbackPresent.fontFamily,
    textColor: payload.textColor || fallbackPresent.textColor,
    logoItems: payloadLogoItems.length ? payloadLogoItems : fallbackPresent.logoItems,
    textItems: payloadTextItems.length ? payloadTextItems : fallbackPresent.textItems,
  };
};

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading Editor...</div>}>
      <EditorUI />
    </Suspense>
  );
}

function EditorUI() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STEP 5: URL Handover Logic ---
  // Results page se bheja gaya data yahan receive ho raha hai
  const urlImage = searchParams.get('img');
  const urlName = searchParams.get('text');
  const urlSlogan = searchParams.get('slogan');
  const urlBgColor = searchParams.get('bgColor');
  const urlTextColor = searchParams.get('textColor');
  const payloadKey = searchParams.get('payloadKey');
  const editScopeKey = searchParams.get('editScopeKey') || '';
  const designId = searchParams.get('designId') || payloadKey?.replace(/^logo-edit-/, '') || null;

  // Redux se fallback data (agar URL mein na ho)
  const { formData } = useSelector((state) => state.logo);
  const initialBusinessValue = (urlName || formData.name || 'BRAND').trim();
  const initialSloganValue = (urlSlogan || formData.slogan || '').trim();
  const sessionPayload = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      if (payloadKey) {
        const rawPayload = window.sessionStorage.getItem(payloadKey);
        if (rawPayload) {
          return JSON.parse(rawPayload);
        }
      }

      if (!designId) {
        return null;
      }

      const scopedStorageKey = editScopeKey
        ? `${EDITED_LOGO_STORAGE_PREFIX}${editScopeKey}:${designId}`
        : `${EDITED_LOGO_STORAGE_PREFIX}${designId}`;
      const rawSavedEdit = window.localStorage.getItem(scopedStorageKey);

      if (!rawSavedEdit) {
        return null;
      }

      const parsedSavedEdit = JSON.parse(rawSavedEdit);
      return parsedSavedEdit?.editablePayload || null;
    } catch {
      return null;
    }
  }, [designId, editScopeKey, payloadKey]);

  const [editorState, setEditorState] = useState(() => ({
    past: [],
    present: buildInitialPresent({
      urlBgColor,
      urlTextColor,
      urlImage,
      initialBusinessValue,
      initialSloganValue,
      formData,
      payload: sessionPayload,
    }),
    future: [],
  }));

  const logoConfig = editorState.present;

  const [activeTool, setActiveTool] = useState(null);
  const [activeBackgroundOption, setActiveBackgroundOption] = useState(null);
  const [customColorValue, setCustomColorValue] = useState(() => normalizeHexColor(urlBgColor || '#FFFFFF', '#FFFFFF'));
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [dialogBaseColor, setDialogBaseColor] = useState(() => normalizeHexColor(urlBgColor || '#FFFFFF', '#FFFFFF'));
  const [dialogSelectedColor, setDialogSelectedColor] = useState(() => normalizeHexColor(urlBgColor || '#FFFFFF', '#FFFFFF'));
  const [gradientType, setGradientType] = useState('linear');
  const [gradientDirection, setGradientDirection] = useState('down');
  const [gradientStartColor, setGradientStartColor] = useState('#000000');
  const [gradientEndColor, setGradientEndColor] = useState('#64748B');
  const [gradientRadialAngle, setGradientRadialAngle] = useState(225);
  const [gradientDialogOpen, setGradientDialogOpen] = useState(false);
  const [gradientColorDialogOpen, setGradientColorDialogOpen] = useState(false);
  const [gradientDialogBaseColor, setGradientDialogBaseColor] = useState('#000000');
  const [gradientDialogSelectedColor, setGradientDialogSelectedColor] = useState('#000000');
  const [gradientColorTarget, setGradientColorTarget] = useState('start');
  const [gradientCustomColorValue, setGradientCustomColorValue] = useState('#000000');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCanvasItem, setSelectedCanvasItem] = useState(null);
  const [selectedCanvasItems, setSelectedCanvasItems] = useState([]);
  const [activeObjectPanel, setActiveObjectPanel] = useState('controls');
  const selectedCanvasItemRef = useRef(null);
  const imageInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);
  const stageRef = useRef(null);
  const [canvasSelectionOverride, setCanvasSelectionOverride] = useState(null);
  const [canvasClearSelectionToken, setCanvasClearSelectionToken] = useState(0);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFullscreenOpen, setPreviewFullscreenOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [hideCanvasSelectionUi, setHideCanvasSelectionUi] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [assetPickerDialog, setAssetPickerDialog] = useState({
    open: false,
    type: null,
    title: '',
    items: [],
  });
  const clipboardRef = useRef([]);
  const [editDialog, setEditDialog] = useState({
    ...EMPTY_EDIT_DIALOG,
  });

  const areAllSelectedText = selectedCanvasItems.length > 0 && selectedCanvasItems.every((item) => item.type === 'text');
  const canEditText = selectedCanvasItems.length > 0 && areAllSelectedText;
  const canEditSingleText = selectedCanvasItems.length === 1 && selectedCanvasItem?.type === 'text';
  const objectPanels = canEditText
    ? ['controls', 'fonts', 'colors', 'outlines', '3D']
    : ['controls', 'colors', 'outlines', '3D'];
  const canDuplicate = selectedCanvasItems.length > 0;
  const selectedCollectionName = getCollectionNameByType(selectedCanvasItem?.type);
  const selectedCollection = selectedCollectionName ? logoConfig[selectedCollectionName] || [] : [];
  const activeBackgroundShape = logoConfig.backgroundShape || null;
  const activeBackgroundShapeType = activeBackgroundShape?.type || 'none';
  const activeBackgroundShapeColor = normalizeHexColor(activeBackgroundShape?.fillColor || '#FFFFFF', '#FFFFFF');
  const activeBackgroundOpacity = Math.max(0.05, Math.min(1, Number(logoConfig.bgOpacity ?? 1)));
  const selectedItemData = selectedCanvasItem
    ? selectedCollection.find((item) => item.id === selectedCanvasItem.id) || null
    : null;
  const isControlsContext = Boolean(selectedCanvasItem) && activeObjectPanel === 'controls';
  const selectedItemKeySet = useMemo(
    () => new Set(selectedCanvasItems.map((item) => `${item.type}:${item.id}`)),
    [selectedCanvasItems]
  );

  const closeBackgroundDialogs = useCallback(() => {
    setColorDialogOpen(false);
    setGradientDialogOpen(false);
    setGradientColorDialogOpen(false);
  }, []);

  const closeAssetPickerDialog = useCallback(() => {
    setAssetPickerDialog({
      open: false,
      type: null,
      title: '',
      items: [],
    });
  }, []);

  const closeEditDialog = useCallback(() => {
    setEditDialog(EMPTY_EDIT_DIALOG);
  }, []);

  const closeEditorOverlays = useCallback(() => {
    closeBackgroundDialogs();
    closeAssetPickerDialog();
  }, [closeAssetPickerDialog, closeBackgroundDialogs]);

  const applyLogoConfigChange = (configUpdate) => {
    setEditorState((prev) => {
      const nextPresent = typeof configUpdate === 'function'
        ? configUpdate(prev.present)
        : { ...prev.present, ...configUpdate };

      if (JSON.stringify(nextPresent) === JSON.stringify(prev.present)) {
        return prev;
      }

      return {
        past: [...prev.past, prev.present],
        present: nextPresent,
        future: [],
      };
    });
  };

  const handleUndo = () => {
    setEditorState((prev) => {
      if (prev.past.length === 0) {
        return prev;
      }

      const previousConfig = prev.past[prev.past.length - 1];

      return {
        past: prev.past.slice(0, -1),
        present: previousConfig,
        future: [prev.present, ...prev.future],
      };
    });
  };

  const handleRedo = () => {
    setEditorState((prev) => {
      if (prev.future.length === 0) {
        return prev;
      }

      const [nextConfig, ...remainingFuture] = prev.future;

      return {
        past: [...prev.past, prev.present],
        present: nextConfig,
        future: remainingFuture,
      };
    });
  };

  const updateSelectedElements = (updater) => {
    if (!selectedItemKeySet.size) {
      return;
    }

    applyLogoConfigChange((prev) => {
      return {
        ...prev,
        logoItems: (prev.logoItems || []).map((item) => {
          if (!selectedItemKeySet.has(`logo:${item.id}`)) {
            return item;
          }

          const nextItem = updater('logo', item);
          return nextItem
            ? {
                ...nextItem,
                transform: clampTransformToCard('logo', nextItem, nextItem.transform),
              }
            : null;
        }).filter(Boolean),
        textItems: (prev.textItems || []).map((item) => {
          if (!selectedItemKeySet.has(`text:${item.id}`)) {
            return item;
          }

          const nextItem = updater('text', item);
          return nextItem
            ? {
                ...nextItem,
                transform: clampTransformToCard('text', nextItem, nextItem.transform),
              }
            : null;
        }).filter(Boolean),
      };
    });
  };

  const updateSelectedItemStyle = (styleUpdate) => {
    updateSelectedElements((type, item) => {
      const currentStyle = item.style || {};
      const resolvedStyleUpdate = typeof styleUpdate === 'function'
        ? styleUpdate(currentStyle)
        : styleUpdate;
      const shouldEnableColorOverrides = Boolean(
        currentStyle.applyColorOverrides ||
        resolvedStyleUpdate?.fillColor !== undefined ||
        resolvedStyleUpdate?.outlineColor !== undefined
      );
      const styledItem = {
        ...item,
        ...(type === 'text'
          ? {
              renderMode: 'text',
              svgDataUri: null,
              width: 0,
              height: 0,
            }
          : {}),
        style: {
          ...currentStyle,
          ...resolvedStyleUpdate,
          applyColorOverrides: shouldEnableColorOverrides,
        },
      };
      const nextItem = type === 'text'
        ? withMeasuredTextBox(styledItem)
        : styledItem;

      return {
        ...nextItem,
        ...(type === 'text'
          ? { transform: preserveTextCenterTransform(item, nextItem) }
          : {}),
      };
    });
  };

  const handleSelectedTextFontChange = (fontFamily) => {
    if (!canEditText || !fontFamily) {
      return;
    }

    updateSelectedElements((type, item) => {
      if (type !== 'text') {
        return item;
      }

      const nextItem = withMeasuredTextBox({
        ...item,
        fontFamily,
        renderMode: 'text',
        svgDataUri: null,
        width: 0,
        height: 0,
      });

      return {
        ...nextItem,
        transform: preserveTextCenterTransform(item, nextItem),
      };
    });
  };

  const handleSelectedTextFontSizeChange = (fontSizeValue) => {
    if (!canEditText) {
      return;
    }

    const safeFontSize = Math.max(12, Math.min(120, Number(fontSizeValue || 46)));

    updateSelectedElements((type, item) => {
      if (type !== 'text') {
        return item;
      }

      const nextItem = withMeasuredTextBox({
        ...item,
        fontSize: safeFontSize,
        renderMode: 'text',
        svgDataUri: null,
        width: 0,
        height: 0,
      });

      return {
        ...nextItem,
        transform: preserveTextCenterTransform(item, nextItem),
      };
    });
  };

  const handleNudge = (dx, dy) => {
    updateSelectedElements((type, item) => ({
      ...item,
      transform: {
        ...item.transform,
        x: item.transform.x + dx,
        y: item.transform.y + dy,
      },
    }));
  };

  const handleSelectedOpacityChange = (opacityValue) => {
    const nextOpacity = Math.max(0.05, Math.min(1, Number(opacityValue || 1)));

    updateSelectedElements((type, item) => ({
      ...item,
      opacity: nextOpacity,
    }));
  };

  const handleScaleSelected = (scaleValue) => {
    const safeScale = Math.max(0.2, Math.min(3, Number(scaleValue || 1)));

    updateSelectedElements((type, item) => {
      const currentTransform = item.transform || {};
      const currentScaleX = Math.abs(currentTransform.scaleX ?? 1);
      const currentScaleY = Math.abs(currentTransform.scaleY ?? 1);
      const nextScaleX = safeScale * Math.sign(currentTransform.scaleX || 1 || 1);
      const nextScaleY = safeScale * Math.sign(currentTransform.scaleY || 1 || 1);
      const baseMetrics = type === 'logo'
        ? {
            width: Number(item.baseWidth || item.width || 280),
            height: Number(item.baseHeight || item.height || 200),
          }
        : getTextMetrics(item);
      const centerX = (currentTransform.x ?? 0) + (baseMetrics.width * currentScaleX) / 2;
      const centerY = (currentTransform.y ?? 0) + (baseMetrics.height * currentScaleY) / 2;

      return {
        ...item,
        transform: {
          ...currentTransform,
          scaleX: nextScaleX,
          scaleY: nextScaleY,
          x: centerX - (baseMetrics.width * Math.abs(nextScaleX)) / 2,
          y: centerY - (baseMetrics.height * Math.abs(nextScaleY)) / 2,
        },
      };
    });
  };

  const handleRotateSelected = (rotationValue) => {
    const safeRotation = Number(rotationValue || 0);

    updateSelectedElements((type, item) => ({
      ...item,
      transform: {
        ...item.transform,
        rotation: safeRotation,
      },
    }));
  };

  const handleResetSelectedTransform = () => {
    updateSelectedElements((type, item) => {
      const currentTransform = item.transform || {};
      const currentScaleX = Math.abs(currentTransform.scaleX ?? 1);
      const currentScaleY = Math.abs(currentTransform.scaleY ?? 1);
      const baseMetrics = type === 'logo'
        ? {
            width: Number(item.baseWidth || item.width || 280),
            height: Number(item.baseHeight || item.height || 200),
          }
        : getTextMetrics(item);
      const centerX = (currentTransform.x ?? 0) + (baseMetrics.width * currentScaleX) / 2;
      const centerY = (currentTransform.y ?? 0) + (baseMetrics.height * currentScaleY) / 2;

      return {
        ...item,
        transform: {
          ...currentTransform,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          x: centerX - baseMetrics.width / 2,
          y: centerY - baseMetrics.height / 2,
        },
      };
    });
  };

  const handleCenter = (axis) => {
    updateSelectedElements((type, item) => {
      if (type === 'logo') {
        const width = Number(item.baseWidth || item.width || 280) * Math.abs(item.transform.scaleX || 1);
        const height = Number(item.baseHeight || item.height || 200) * Math.abs(item.transform.scaleY || 1);

        return {
          ...item,
          transform: {
            ...item.transform,
            x: axis === 'x' ? CARD_X + (CARD_WIDTH - width) / 2 : item.transform.x,
            y: axis === 'y' ? CARD_Y + (CARD_HEIGHT - height) / 2 : item.transform.y,
          },
        };
      }

      const metrics = getTextMetrics(item);
      const width = metrics.width * Math.abs(item.transform.scaleX || 1);
      const height = metrics.height * Math.abs(item.transform.scaleY || 1);

      return {
        ...item,
        transform: {
          ...item.transform,
          x: axis === 'x' ? CARD_X + (CARD_WIDTH - width) / 2 : item.transform.x,
          y: axis === 'y' ? CARD_Y + (CARD_HEIGHT - height) / 2 : item.transform.y,
        },
      };
    });
  };

  const handleDuplicateSelected = () => {
    if (!selectedCanvasItems.length) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const duplicateOffset = { x: 24, y: 24 };
      const nextSelections = [];
      const duplicatedLogos = [];
      const duplicatedTexts = [];

      selectedCanvasItems.forEach((selection, index) => {
        if (selection.type === 'logo') {
          const sourceItem = (prev.logoItems || []).find((item) => item.id === selection.id);
          if (!sourceItem) {
            return;
          }

          const duplicateId = `logo-${Date.now()}-${index}`;
          duplicatedLogos.push({
            ...sourceItem,
            id: duplicateId,
            transform: {
              ...sourceItem.transform,
              x: sourceItem.transform.x + duplicateOffset.x,
              y: sourceItem.transform.y + duplicateOffset.y,
            },
          });
          nextSelections.push({ type: 'logo', id: duplicateId });
          return;
        }

        if (selection.type === 'text') {
          const sourceItem = (prev.textItems || []).find((item) => item.id === selection.id);
          if (!sourceItem) {
            return;
          }

          const duplicateId = `text-${Date.now()}-${index}`;
          duplicatedTexts.push({
            ...sourceItem,
            id: duplicateId,
            transform: {
              ...sourceItem.transform,
              x: sourceItem.transform.x + duplicateOffset.x,
              y: sourceItem.transform.y + duplicateOffset.y,
            },
          });
          nextSelections.push({ type: 'text', id: duplicateId });
        }
      });

      selectedCanvasItemRef.current = nextSelections[nextSelections.length - 1] || null;
      setSelectedCanvasItem(nextSelections[nextSelections.length - 1] || null);
      setSelectedCanvasItems(nextSelections);
      setCanvasSelectionOverride(nextSelections[nextSelections.length - 1] || null);

      return {
        ...prev,
        logoItems: [...(prev.logoItems || []), ...duplicatedLogos],
        textItems: [...(prev.textItems || []), ...duplicatedTexts],
      };
    });
  };

  const handleDeleteSelected = () => {
    if (!selectedItemKeySet.size) {
      return;
    }

    applyLogoConfigChange((prev) => ({
      ...prev,
      logoItems: (prev.logoItems || []).filter((item) => !selectedItemKeySet.has(`logo:${item.id}`)),
      textItems: (prev.textItems || []).filter((item) => !selectedItemKeySet.has(`text:${item.id}`)),
    }));
    clearCanvasSelection();
  };

  const handleCopySelected = useCallback(() => {
    if (!selectedCanvasItems.length) {
      return;
    }

    clipboardRef.current = selectedCanvasItems.map((selection) => {
      if (selection.type === 'logo') {
        const sourceItem = (logoConfig.logoItems || []).find((item) => item.id === selection.id);
        return sourceItem ? { type: 'logo', item: sourceItem } : null;
      }

      const sourceItem = (logoConfig.textItems || []).find((item) => item.id === selection.id);
      return sourceItem ? { type: 'text', item: sourceItem } : null;
    }).filter(Boolean);
  }, [logoConfig.logoItems, logoConfig.textItems, selectedCanvasItems]);

  const handlePasteClipboard = useCallback(() => {
    if (!clipboardRef.current.length) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const duplicateOffset = { x: 28, y: 28 };
      const nextLogoItems = [...(prev.logoItems || [])];
      const nextTextItems = [...(prev.textItems || [])];

      clipboardRef.current.forEach((entry, index) => {
        if (entry.type === 'logo') {
          const duplicateId = `logo-${Date.now()}-${index}`;
          nextLogoItems.push({
            ...entry.item,
            id: duplicateId,
            transform: {
              ...entry.item.transform,
              x: (entry.item.transform?.x || CARD_X + 170) + duplicateOffset.x,
              y: (entry.item.transform?.y || CARD_Y + 64) + duplicateOffset.y,
            },
          });
          return;
        }

        const duplicateId = `text-${Date.now()}-${index}`;
        nextTextItems.push({
          ...entry.item,
          id: duplicateId,
          transform: {
            ...entry.item.transform,
            x: (entry.item.transform?.x || CARD_X + 110) + duplicateOffset.x,
            y: (entry.item.transform?.y || CARD_Y + CARD_HEIGHT - 150) + duplicateOffset.y,
          },
        });
      });

      return {
        ...prev,
        logoItems: nextLogoItems,
        textItems: nextTextItems,
      };
    });
    selectedCanvasItemRef.current = null;
    setSelectedCanvasItem(null);
    setSelectedCanvasItems([]);
    setCanvasSelectionOverride(null);
    setCanvasClearSelectionToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    if (previewDialogOpen || previewFullscreenOpen) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, [previewDialogOpen, previewFullscreenOpen]);

  useEffect(() => {
    if (typeof window === 'undefined' || isMobileViewport) {
      return undefined;
    }

    const handleDialogEscape = (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (downloadDialogOpen && !downloadingFormat) {
        setDownloadDialogOpen(false);
        return;
      }

      if (previewFullscreenOpen) {
        setPreviewFullscreenOpen(false);
        return;
      }

      if (previewDialogOpen) {
        setPreviewDialogOpen(false);
        return;
      }

      if (assetPickerDialog.open) {
        closeAssetPickerDialog();
        return;
      }

      if (gradientColorDialogOpen) {
        setGradientColorDialogOpen(false);
        setGradientDialogOpen(true);
        return;
      }

      if (gradientDialogOpen) {
        setGradientDialogOpen(false);
        return;
      }

      if (colorDialogOpen) {
        setColorDialogOpen(false);
        return;
      }

      if (editDialog.open) {
        closeEditDialog();
      }
    };

    window.addEventListener('keydown', handleDialogEscape);
    return () => window.removeEventListener('keydown', handleDialogEscape);
  }, [
    assetPickerDialog.open,
    closeAssetPickerDialog,
    closeEditDialog,
    colorDialogOpen,
    downloadDialogOpen,
    downloadingFormat,
    editDialog.open,
    gradientColorDialogOpen,
    gradientDialogOpen,
    isMobileViewport,
    previewDialogOpen,
    previewFullscreenOpen,
  ]);

  useEffect(() => {
    const handleEditorKeyDown = (event) => {
      const target = event.target;
      const isTypingTarget = target instanceof HTMLElement && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      if (isTypingTarget) {
        return;
      }

      const modifierPressed = event.ctrlKey || event.metaKey;

      if (modifierPressed) {
        if (event.key === 'c' || event.key === 'C') {
          event.preventDefault();
          handleCopySelected();
          return;
        }

        if (event.key === 'x' || event.key === 'X') {
          event.preventDefault();
          handleCopySelected();
          handleDeleteSelected();
          return;
        }

        if (event.key === 'v' || event.key === 'V') {
          event.preventDefault();
          handlePasteClipboard();
          return;
        }

        if (event.key === 'd' || event.key === 'D') {
          event.preventDefault();
          handleDuplicateSelected();
          return;
        }

        if ((event.key === 'z' || event.key === 'Z') && event.shiftKey) {
          event.preventDefault();
          handleRedo();
          return;
        }

        if (event.key === 'y' || event.key === 'Y') {
          event.preventDefault();
          handleRedo();
          return;
        }

        if (event.key === 'z' || event.key === 'Z') {
          event.preventDefault();
          handleUndo();
          return;
        }

        if (event.key === '=' || event.key === '+') {
          event.preventDefault();
          setCanvasZoom((prev) => Math.min(2.5, Number((prev + 0.1).toFixed(2))));
          return;
        }

        if (event.key === '-' || event.key === '_') {
          event.preventDefault();
          setCanvasZoom((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(2))));
          return;
        }

        if (event.key === '0') {
          event.preventDefault();
          setCanvasZoom(1);
          return;
        }
      }

      if (!selectedCanvasItems.length) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        handleDeleteSelected();
        return;
      }

      const movement = event.shiftKey ? 24 : 12;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleNudge(0, -movement);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleNudge(0, movement);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleNudge(-movement, 0);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNudge(movement, 0);
      }
    };

    window.addEventListener('keydown', handleEditorKeyDown);
    return () => window.removeEventListener('keydown', handleEditorKeyDown);
  }, [
    handleCopySelected,
    handleDeleteSelected,
    handleDuplicateSelected,
    handlePasteClipboard,
    handleRedo,
    handleUndo,
    handleNudge,
    selectedCanvasItems.length,
  ]);

  const handleEditSelectedText = () => {
    if (!canEditSingleText || !selectedCanvasItem) {
      return;
    }

    const targetCollection = logoConfig.textItems || [];
    const targetItem = targetCollection.find((item) => item.id === selectedCanvasItem.id);

    if (!targetItem) {
      return;
    }

    setEditDialog({
      open: true,
      type: 'text',
      mode: targetItem.text ? 'plain-text' : 'brand-line',
      id: selectedCanvasItem.id,
      businessValue: targetItem.text || targetItem.businessValue || '',
      sloganValue: targetItem.text ? '' : targetItem.sloganValue || '',
    });
  };

  const handleSaveEditedText = () => {
    if (!editDialog.open || !editDialog.type || !editDialog.id) {
      return;
    }

    const nextBusinessValue = editDialog.businessValue.trim();
    if (!nextBusinessValue) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const targetCollection = prev.textItems || [];

      return {
        ...prev,
        textItems: targetCollection.map((item) =>
          item.id === editDialog.id
            ? (() => {
                const nextItem = {
                  ...item,
                  ...(editDialog.mode === 'plain-text'
                    ? {
                        text: nextBusinessValue,
                      }
                    : {
                        businessValue: nextBusinessValue,
                        sloganValue: editDialog.sloganValue.trim(),
                      }),
                  renderMode: 'text',
                  svgDataUri: null,
                  width: 0,
                  height: 0,
                };
                const measuredItem = withMeasuredTextBox(nextItem);

                return {
                  ...measuredItem,
                  transform: preserveTextCenterTransform(item, measuredItem),
                };
              })()
            : item
        ),
      };
    });

    setEditDialog({
      open: false,
      type: null,
      mode: null,
      id: null,
      businessValue: '',
      sloganValue: '',
    });
  };

  const handleCanvasSelectionChange = useCallback((selectionState) => {
    const nextPrimaryItem = selectionState?.primary || null;
    const nextItems = Array.isArray(selectionState?.items) ? selectionState.items : (nextPrimaryItem ? [nextPrimaryItem] : []);
    const previousItem = selectedCanvasItemRef.current;
    const previousKey = previousItem ? `${previousItem.type}:${previousItem.id}` : '';
    const nextKey = nextPrimaryItem ? `${nextPrimaryItem.type}:${nextPrimaryItem.id}` : '';

    if (nextKey && nextKey !== previousKey) {
      setActiveObjectPanel('controls');
    }

    selectedCanvasItemRef.current = nextPrimaryItem;
    setSelectedCanvasItem(nextPrimaryItem);
    setSelectedCanvasItems(nextItems);

    if (typeof window !== 'undefined' && window.innerWidth < 1024 && nextPrimaryItem) {
      setActiveTool(null);
      setSidebarOpen(true);
    }
  }, []);

  const clearCanvasSelection = useCallback(() => {
    selectedCanvasItemRef.current = null;
    setSelectedCanvasItem(null);
    setSelectedCanvasItems([]);
    setCanvasSelectionOverride(null);
    setCanvasClearSelectionToken((value) => value + 1);
  }, []);

  const sidebarHeading = selectedCanvasItem ? activeObjectPanel.charAt(0).toUpperCase() + activeObjectPanel.slice(1) : 'Variations';
  const movementStep = 12;
  const selectedStyle = selectedItemData?.style || {};
  const gradientPreviewStyle = {
    background: gradientType === 'linear'
      ? getLinearGradientCss(gradientDirection, gradientStartColor, gradientEndColor)
      : getRadialGradientCss(gradientRadialAngle, gradientStartColor, gradientEndColor),
  };
  const dialogShadeOptions = buildShadeScale(dialogBaseColor, 10);
  const gradientDialogShadeOptions = buildShadeScale(gradientDialogBaseColor, 10);
  const showFloatingToolbar = Boolean(
    selectedCanvasItem ||
    activeTool === 'background'
  );
  const shouldShowDesktopSidebar = Boolean(
    selectedCanvasItem ||
    activeTool === 'background' ||
    activeTool === 'art' ||
    activeTool === 'effect' ||
    activeTool === 'palette'
  );
  const mobileEditorTools = useMemo(
    () => (selectedCanvasItem ? [mobileControlsTool, ...editorTools] : editorTools),
    [selectedCanvasItem]
  );
  const floatingToolbarOffsetStyle = {
    top: 'max(0.75rem, calc(50% - 215px))',
  };
  const floatingActionDockOffsetStyle = {
    bottom: 'max(0.75rem, calc(50% - 230px))',
  };
  const mobileFloatingControlsStyle = isMobileViewport
    ? {
        bottom: sidebarOpen && shouldShowDesktopSidebar
          ? 'calc(4.15rem + 18.5svh + 0.3rem)'
          : '4.4rem',
      }
    : undefined;

  useEffect(() => {
    if (!shouldShowDesktopSidebar) {
      setSidebarOpen(false);
    }
  }, [shouldShowDesktopSidebar]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncViewport = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);

    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const applyBackgroundColor = useCallback((colorValue) => {
    const safeColor = normalizeHexColor(colorValue, '#FFFFFF');
    applyLogoConfigChange((prev) => ({
      ...prev,
      bgColor: safeColor,
      bgFill: null,
      bgImageUrl: null,
    }));
  }, []);

  const applyBackgroundShape = useCallback((shapeType) => {
    applyLogoConfigChange((prev) => {
      if (!shapeType || shapeType === 'none') {
        return {
          ...prev,
          bgColor: '#FFFFFF',
          bgFill: null,
          bgImageUrl: null,
          backgroundShape: null,
        };
      }

      return {
        ...prev,
        backgroundShape: {
          type: shapeType,
          fillColor: prev.backgroundShape?.fillColor || 'transparent',
          strokeColor: normalizeHexColor(prev.backgroundShape?.strokeColor || '#111111', '#111111'),
        },
      };
    });
  }, []);

  const applyBackgroundShapeColor = useCallback((colorValue) => {
    const safeColor = normalizeHexColor(colorValue, '#FFFFFF');
    applyLogoConfigChange((prev) => {
      if (!prev.backgroundShape) {
        return prev;
      }

      return {
        ...prev,
        backgroundShape: {
          ...prev.backgroundShape,
          fillColor: safeColor,
          strokeColor: safeColor,
        },
      };
    });
  }, []);

  const applyBackgroundOpacity = useCallback((opacityValue) => {
    const nextOpacity = Math.max(0.05, Math.min(1, Number(opacityValue || 1)));

    applyLogoConfigChange((prev) => {
      return {
        ...prev,
        bgOpacity: nextOpacity,
      };
    });
  }, []);

  const applyPresetBackgroundImage = useCallback((imageUrl) => {
    if (!imageUrl) {
      return;
    }

    applyLogoConfigChange((prev) => ({
      ...prev,
      bgImageUrl: imageUrl,
      bgFill: null,
    }));
  }, []);

  const openAssetPicker = useCallback((type) => {
    if (type === 'background') {
      setAssetPickerDialog({
        open: true,
        type,
        title: 'Background Library',
        items: backgroundLibraryImages,
      });
      return;
    }

    if (type === 'texture') {
      setAssetPickerDialog({
        open: true,
        type,
        title: 'Texture Library',
        items: textureLibraryImages,
      });
    }
  }, []);

  const handleDialogSelect = () => {
    const safeColor = normalizeHexColor(dialogSelectedColor, '#FFFFFF');
    applyBackgroundColor(safeColor);
    setDialogBaseColor(safeColor);
    setDialogSelectedColor(safeColor);
    setCustomColorValue(safeColor);
    setColorDialogOpen(false);
    if (isMobileViewport && activeTool === 'background') {
      setSidebarOpen(true);
    }
  };

  const closePickAnotherDialog = () => {
    setColorDialogOpen(false);
    if (isMobileViewport && activeTool === 'background') {
      setSidebarOpen(true);
    }
  };

  const applyGradientToBackground = () => {
    applyLogoConfigChange((prev) => ({
      ...prev,
      bgColor: gradientEndColor,
      bgImageUrl: null,
      bgFill: {
        type: gradientType,
        startColor: gradientStartColor,
        endColor: gradientEndColor,
        direction: gradientDirection,
        radialAngle: gradientRadialAngle,
      },
    }));
    setGradientDialogOpen(false);
    if (isMobileViewport && activeTool === 'background') {
      setSidebarOpen(true);
    }
  };

  const openGradientDialog = () => {
    const existingFill = logoConfig.bgFill;

    if (existingFill?.type === 'linear' || existingFill?.type === 'radial') {
      const nextStart = normalizeHexColor(existingFill.startColor || '#000000', '#000000');
      const nextEnd = normalizeHexColor(existingFill.endColor || '#64748B', '#64748B');

      setGradientType(existingFill.type);
      setGradientDirection(existingFill.direction || 'down');
      setGradientRadialAngle(Number(existingFill.radialAngle ?? 225));
      setGradientStartColor(nextStart);
      setGradientEndColor(nextEnd);
      setGradientDialogBaseColor(nextStart);
      setGradientDialogSelectedColor(nextStart);
      setGradientCustomColorValue(nextStart);
    } else {
      const nextStart = normalizeHexColor(gradientStartColor, '#000000');
      setGradientDialogBaseColor(nextStart);
      setGradientDialogSelectedColor(nextStart);
      setGradientCustomColorValue(nextStart);
    }

    setGradientColorTarget('start');
    setGradientDialogOpen(true);
  };

  const closeGradientDialog = () => {
    setGradientDialogOpen(false);
    if (isMobileViewport && activeTool === 'background') {
      setSidebarOpen(true);
    }
  };

  const openGradientColorDialog = (target) => {
    const nextTarget = target === 'end' ? 'end' : 'start';
    const baseColor = normalizeHexColor(
      nextTarget === 'start' ? gradientStartColor : gradientEndColor,
      '#000000'
    );

    setGradientColorTarget(nextTarget);
    setGradientDialogBaseColor(baseColor);
    setGradientDialogSelectedColor(baseColor);
    setGradientCustomColorValue(baseColor);
    setGradientDialogOpen(false);
    setGradientColorDialogOpen(true);
  };

  const closeGradientColorDialog = () => {
    setGradientColorDialogOpen(false);
    setGradientDialogOpen(true);
  };

  const applyGradientDialogColor = () => {
    const safeColor = normalizeHexColor(gradientDialogSelectedColor, '#000000');

    if (gradientColorTarget === 'start') {
      setGradientStartColor(safeColor);
    } else {
      setGradientEndColor(safeColor);
    }

    setGradientDialogBaseColor(safeColor);
    setGradientDialogSelectedColor(safeColor);
    setGradientCustomColorValue(safeColor);
    setGradientColorDialogOpen(false);
    setGradientDialogOpen(true);
  };

  const applyDesignPalette = (palette) => {
    applyLogoConfigChange((prev) => ({
      ...prev,
      textColor: palette.colors[1],
      bgFill: null,
      logoItems: (prev.logoItems || []).map((item, index) => ({
        ...item,
        style: {
          ...item.style,
          applyColorOverrides: true,
          fillColor: palette.colors[index % palette.colors.length],
          outlineColor: item.style?.outlineWidth > 0 ? palette.colors[(index + 2) % palette.colors.length] : item.style?.outlineColor,
        },
      })),
      textItems: (prev.textItems || []).map((item, index) => {
        const nextItem = withMeasuredTextBox({
          ...item,
          renderMode: 'text',
          svgDataUri: null,
          width: 0,
          height: 0,
          style: {
            ...item.style,
            applyColorOverrides: true,
            fillColor: palette.colors[(index + 1) % palette.colors.length],
            outlineColor: item.style?.outlineWidth > 0 ? palette.colors[(index + 2) % palette.colors.length] : item.style?.outlineColor,
          },
        });

        return {
          ...nextItem,
          transform: preserveTextCenterTransform(item, nextItem),
        };
      }),
    }));
  };

  const openImageBrowser = () => {
    imageInputRef.current?.click();
  };

  const openBackgroundImageBrowser = () => {
    backgroundImageInputRef.current?.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!imageUrl) {
        return;
      }

      const newId = `logo-${Date.now()}`;
      const nextLogoItem = {
        id: newId,
        imageUrl,
        baseWidth: 220,
        baseHeight: 160,
        transform: {
          x: CARD_X + 170,
          y: CARD_Y + 64,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
        style: {
          fillColor: '#111827',
          outlineColor: '#111827',
          outlineWidth: 0,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
        },
      };

      applyLogoConfigChange((prev) => ({
        ...prev,
        logoItems: [...(prev.logoItems || []), nextLogoItem],
      }));

      const nextSelection = { type: 'logo', id: newId };
      selectedCanvasItemRef.current = nextSelection;
      setSelectedCanvasItem(nextSelection);
      setSelectedCanvasItems([nextSelection]);
      setCanvasSelectionOverride(nextSelection);
      setActiveObjectPanel('controls');
      setSidebarOpen(false);
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleAddPresetArt = useCallback((imageUrl) => {
    if (!imageUrl) {
      return;
    }

    const newId = `logo-${Date.now()}`;
    const nextLogoItem = {
      id: newId,
      imageUrl,
      baseWidth: 220,
      baseHeight: 160,
      transform: {
        x: CARD_X + 170,
        y: CARD_Y + 64,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      style: buildDefaultItemStyle('#111827'),
    };

    applyLogoConfigChange((prev) => ({
      ...prev,
      logoItems: [...(prev.logoItems || []), nextLogoItem],
    }));

    const nextSelection = { type: 'logo', id: newId };
    selectedCanvasItemRef.current = nextSelection;
    setSelectedCanvasItem(nextSelection);
    setSelectedCanvasItems([nextSelection]);
    setCanvasSelectionOverride(nextSelection);
    setActiveObjectPanel('controls');
  }, []);

  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!imageUrl) {
        return;
      }

      applyLogoConfigChange((prev) => ({
        ...prev,
        bgImageUrl: imageUrl,
        bgFill: null,
      }));
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleAddTextLayer = () => {
    const newId = `text-${Date.now()}`;
    const nextTextItem = withMeasuredTextBox({
        id: newId,
        text: '',
        width: 0,
        height: 0,
        fontSize: 46,
        align: 'center',
        fill: logoConfig.textColor || '#1A1A1A',
        fontFamily: logoConfig.fontFamily || 'Arial',
        fontStyle: 'bold',
        letterSpacing: 0,
        transform: {
          x: CARD_X + 110,
          y: CARD_Y + CARD_HEIGHT - 150,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      style: {
        fillColor: logoConfig.textColor || '#1A1A1A',
        outlineColor: '#111827',
        outlineWidth: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
      },
    });

    applyLogoConfigChange((prev) => ({
      ...prev,
      textItems: [...(prev.textItems || []), nextTextItem],
    }));

    const nextSelection = { type: 'text', id: newId };
    selectedCanvasItemRef.current = nextSelection;
    setSelectedCanvasItem(nextSelection);
    setSelectedCanvasItems([nextSelection]);
    setCanvasSelectionOverride(nextSelection);
    setActiveObjectPanel('controls');
    setEditDialog({
      open: true,
      type: 'text',
      mode: 'plain-text',
      id: newId,
      businessValue: nextTextItem.text,
      sloganValue: '',
    });
    setSidebarOpen(false);
  };

  const handleBackgroundOptionSelect = (optionId) => {
    closeEditorOverlays();
    setActiveBackgroundOption(optionId);

    if (isMobileViewport && activeTool === 'background') {
      if (optionId === 'color') {
        const currentBackgroundColor = normalizeHexColor(logoConfig.bgColor || '#FFFFFF', '#FFFFFF');
        setDialogBaseColor(currentBackgroundColor);
        setDialogSelectedColor(currentBackgroundColor);
        setCustomColorValue(currentBackgroundColor);
        setSidebarOpen(false);
        setColorDialogOpen(true);
        return;
      }

      if (optionId === 'gradient') {
        const existingFill = logoConfig.bgFill;

        if (existingFill?.type === 'linear' || existingFill?.type === 'radial') {
          const nextStart = normalizeHexColor(existingFill.startColor || '#000000', '#000000');
          const nextEnd = normalizeHexColor(existingFill.endColor || '#64748B', '#64748B');

          setGradientType(existingFill.type);
          setGradientDirection(existingFill.direction || 'down');
          setGradientRadialAngle(Number(existingFill.radialAngle ?? 225));
          setGradientStartColor(nextStart);
          setGradientEndColor(nextEnd);
        }

        setSidebarOpen(false);
        setGradientDialogOpen(true);
        return;
      }

      if (optionId === 'background' || optionId === 'texture' || optionId === 'image') {
        return;
      }
    }

    if (optionId === 'color') {
      const currentBackgroundColor = normalizeHexColor(logoConfig.bgColor || '#FFFFFF', '#FFFFFF');
      setDialogBaseColor(currentBackgroundColor);
      setDialogSelectedColor(currentBackgroundColor);
      setCustomColorValue(currentBackgroundColor);
      setColorDialogOpen(true);
      return;
    }

    if (optionId === 'gradient') {
      openGradientDialog();
      return;
    }

    if (optionId === 'background' || optionId === 'texture') {
      openAssetPicker(optionId);
      return;
    }

    if (optionId === 'image') {
      openBackgroundImageBrowser();
    }
  };

  const handleEditorToolSelect = useCallback((toolId) => {
    closeEditorOverlays();
    clearCanvasSelection();
    setActiveBackgroundOption(null);

    if (toolId === 'text') {
      setActiveTool(null);
      setSidebarOpen(false);
      handleAddTextLayer();
      return;
    }

    if (toolId === 'images') {
      setActiveTool(null);
      setSidebarOpen(false);
      openImageBrowser();
      return;
    }

    setActiveTool(toolId);
    setSidebarOpen(['background', 'art', 'effect', 'palette'].includes(toolId));
  }, [clearCanvasSelection, closeEditorOverlays, handleAddTextLayer, openImageBrowser]);

  const handleMobileToolSelect = useCallback((toolId) => {
    if (toolId === 'controls') {
      if (selectedCanvasItem) {
        setActiveTool(null);
        setActiveObjectPanel('controls');
        setSidebarOpen(true);
      }
      return;
    }

    handleEditorToolSelect(toolId);
  }, [handleEditorToolSelect, selectedCanvasItem]);

  const captureEditorPreview = useCallback(async (pixelRatio = 2, options = {}) => {
    const stage = stageRef.current;
    if (!stage) {
      return null;
    }

    const shouldHideSelection = Boolean(options.hideSelection);
    const previousSelection = selectedCanvasItemRef.current;
    const previousSelections = [...selectedCanvasItems];
    const restoredPrimarySelection = previousSelection || previousSelections[previousSelections.length - 1] || null;

    if (shouldHideSelection && previousSelections.length) {
      clearCanvasSelection();
      await waitForFrames(3);
      stage.batchDraw();
    }

    setHideCanvasSelectionUi(true);
    await waitForFrames(2);
    stage.batchDraw();

    try {
      return stage.toDataURL({ pixelRatio });
    } finally {
      setHideCanvasSelectionUi(false);
      await waitForFrames(1);

      if (shouldHideSelection && previousSelections.length && restoredPrimarySelection) {
        selectedCanvasItemRef.current = restoredPrimarySelection;
        setSelectedCanvasItem(restoredPrimarySelection);
        setSelectedCanvasItems(previousSelections);
        setCanvasSelectionOverride({
          primary: restoredPrimarySelection,
          items: previousSelections,
        });
        await waitForFrames(2);
      }
    }
  }, [clearCanvasSelection, selectedCanvasItems]);

  const buildEditableSavePayload = useCallback(() => JSON.parse(JSON.stringify(logoConfig)), [logoConfig]);

  const persistEditorChanges = useCallback(async ({ previewDataUrl, navigate = false } = {}) => {
    if (!designId || typeof window === 'undefined') {
      return null;
    }

    const nextPreviewImageUrl = previewDataUrl || await captureEditorPreview(2, { hideSelection: true });
    if (!nextPreviewImageUrl) {
      return null;
    }

    setSavingChanges(true);

    try {
      const editablePayload = buildEditableSavePayload();
      const scopedStorageKey = editScopeKey
        ? `${EDITED_LOGO_STORAGE_PREFIX}${editScopeKey}:${designId}`
        : `${EDITED_LOGO_STORAGE_PREFIX}${designId}`;

      window.localStorage.setItem(
        scopedStorageKey,
        JSON.stringify({
          designId,
          editScopeKey,
          previewVersion: 2,
          previewDataUrl: nextPreviewImageUrl,
          editablePayload,
          updatedAt: Date.now(),
        })
      );

      if (payloadKey) {
        window.sessionStorage.setItem(payloadKey, JSON.stringify(editablePayload));
      }

      if (navigate) {
        router.push('/results');
      }

      return nextPreviewImageUrl;
    } finally {
      setSavingChanges(false);
    }
  }, [buildEditableSavePayload, captureEditorPreview, designId, editScopeKey, payloadKey, router]);

  const handlePreviewOpen = useCallback(async () => {
    clearCanvasSelection();
    await waitForFrames(3);

    const nextPreviewImageUrl = await captureEditorPreview(2, { hideSelection: true });
    if (!nextPreviewImageUrl) {
      return;
    }

    await persistEditorChanges({ previewDataUrl: nextPreviewImageUrl });
    setPreviewImageUrl(nextPreviewImageUrl);
    setPreviewDialogOpen(true);
  }, [captureEditorPreview, clearCanvasSelection, persistEditorChanges]);

  const handleSaveDesign = useCallback(async () => {
    clearCanvasSelection();
    await waitForFrames(3);
    await persistEditorChanges({ navigate: true });
  }, [clearCanvasSelection, persistEditorChanges]);

  const handleOpenDownloadDialog = useCallback(async () => {
    clearCanvasSelection();
    await waitForFrames(3);
    await persistEditorChanges();
    setDownloadDialogOpen(true);
  }, [clearCanvasSelection, persistEditorChanges]);

  const handleEditorDownload = async (format) => {
    const stage = stageRef.current;
    if (!stage || !format) {
      return;
    }

    const safeBaseName = getDownloadBaseName(initialBusinessValue || logoConfig?.textItems?.[0]?.text || 'logo');
    setDownloadingFormat(format);

    try {
      const pngDataUrl = await captureEditorPreview(4, { hideSelection: true });
      if (!pngDataUrl) {
        return;
      }

      await persistEditorChanges({ previewDataUrl: await captureEditorPreview(2, { hideSelection: true }) });

      if (format === 'svg') {
        const svgMarkup = [
          `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="500" viewBox="0 0 700 500" preserveAspectRatio="xMidYMid meet">`,
          `<image href="${pngDataUrl}" x="0" y="0" width="700" height="500" />`,
          '</svg>',
        ].join('');
        triggerBlobDownload(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }), `${safeBaseName}.svg`);
        setDownloadDialogOpen(false);
        return;
      }

      const { canvas } = await renderDataUrlToCanvas(pngDataUrl);

      if (format === 'png') {
        const blob = await canvasToBlob(canvas, 'image/png');
        triggerBlobDownload(blob, `${safeBaseName}.png`);
        setDownloadDialogOpen(false);
        return;
      }

      if (format === 'jpg') {
        const blob = await canvasToBlob(canvas, 'image/jpeg', 0.96);
        triggerBlobDownload(blob, `${safeBaseName}.jpg`);
        setDownloadDialogOpen(false);
        return;
      }

      if (format === 'webp') {
        const blob = await canvasToBlob(canvas, 'image/webp', 0.96);
        triggerBlobDownload(blob, `${safeBaseName}.webp`);
        setDownloadDialogOpen(false);
        return;
      }

      if (format === 'pdf') {
        const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.98);
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const pdfBlob = buildPdfBlobFromJpegBytes(jpegBytes, canvas.width, canvas.height);
        triggerBlobDownload(pdfBlob, `${safeBaseName}.pdf`);
        setDownloadDialogOpen(false);
      }
    } finally {
      setDownloadingFormat(null);
    }
  };

  const renderSidebarContent = () => {
    if (isControlsContext && selectedItemData) {
      if (isMobileViewport) {
        return (
          <div className="space-y-1">
            <div className="rounded-[0.95rem] border border-slate-100 bg-white p-2.5 shadow-sm">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <button
                  title="Move Up"
                  onClick={() => handleNudge(0, -movementStep)}
                  className="flex h-8 items-center justify-center rounded-[1rem] bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                >
                  <ArrowUp size={14} />
                </button>
                <div />
                <button
                  title="Move Left"
                  onClick={() => handleNudge(-movementStep, 0)}
                  className="flex h-8 items-center justify-center rounded-[1rem] bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  title="Center Horizontally"
                  onClick={() => handleCenter('x')}
                  className="flex h-8 items-center justify-center rounded-[1rem] bg-orange-50 text-orange-600 transition-all hover:bg-orange-100"
                >
                  <AlignHorizontalJustifyCenter size={14} />
                </button>
                <button
                  title="Move Right"
                  onClick={() => handleNudge(movementStep, 0)}
                  className="flex h-8 items-center justify-center rounded-[1rem] bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                >
                  <ArrowRight size={14} />
                </button>
                <div />
                <button
                  title="Move Down"
                  onClick={() => handleNudge(0, movementStep)}
                  className="flex h-8 items-center justify-center rounded-[1rem] bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  title="Center Vertically"
                  onClick={() => handleCenter('y')}
                  className="flex h-8 items-center justify-center rounded-[1rem] bg-orange-50 text-orange-600 transition-all hover:bg-orange-100"
                >
                  <AlignVerticalJustifyCenter size={14} />
                </button>
              </div>

              <div className="mt-2 rounded-[0.95rem] border border-slate-100 bg-slate-50 px-2.5 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Opacity
                  </p>
                  <span className="text-xs font-bold text-slate-600">
                    {Math.round((Number(selectedItemData.opacity ?? 1) || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={Math.max(0.05, Math.min(1, Number(selectedItemData.opacity ?? 1)))}
                  onChange={(event) => handleSelectedOpacityChange(event.target.value)}
                  className="mt-1.5 w-full accent-orange-500"
                />
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              Position
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div />
              {(() => {
                const Icon = ArrowUp;
                return (
                  <button
                    title="Move Up"
                    onClick={() => handleNudge(0, -movementStep)}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                  >
                    <Icon size={18} />
                  </button>
                );
              })()}
              <div />
              {(() => {
                const Icon = ArrowLeft;
                return (
                  <button
                    title="Move Left"
                    onClick={() => handleNudge(-movementStep, 0)}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                  >
                    <Icon size={18} />
                  </button>
                );
              })()}
              {(() => {
                const Icon = AlignHorizontalJustifyCenter;
                return (
                  <button
                    title="Center Horizontally"
                    onClick={() => handleCenter('x')}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-all hover:bg-orange-100"
                  >
                    <Icon size={18} />
                  </button>
                );
              })()}
              {(() => {
                const Icon = ArrowRight;
                return (
                  <button
                    title="Move Right"
                    onClick={() => handleNudge(movementStep, 0)}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                  >
                    <Icon size={18} />
                  </button>
                );
              })()}
              <div />
              {(() => {
                const Icon = ArrowDown;
                return (
                  <button
                    title="Move Down"
                    onClick={() => handleNudge(0, movementStep)}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                  >
                    <Icon size={18} />
                  </button>
                );
              })()}
              {(() => {
                const Icon = AlignVerticalJustifyCenter;
                return (
                  <button
                    title="Center Vertically"
                    onClick={() => handleCenter('y')}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-all hover:bg-orange-100"
                  >
                    <Icon size={18} />
                  </button>
                );
              })()}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Transform
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  {Math.round((Math.abs(selectedItemData.transform?.scaleX ?? 1) || 1) * 100)}%
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  {Math.round(Number(selectedItemData.transform?.rotation ?? 0))}°
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div />
              <button
                title="Scale Up"
                onClick={() => handleScaleSelected((Math.abs(selectedItemData.transform?.scaleX ?? 1) || 1) + 0.1)}
                className="flex h-14 w-full items-center justify-center rounded-[1.4rem] bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
              >
                <Maximize2 size={18} />
              </button>
              <div />

              <button
                title="Rotate Left"
                onClick={() => handleRotateSelected(Number(selectedItemData.transform?.rotation ?? 0) - 15)}
                className="flex h-14 w-full items-center justify-center rounded-[1.4rem] bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
              >
                <RotateCcw size={18} />
              </button>
              <button
                title="Reset Transform"
                onClick={handleResetSelectedTransform}
                className="flex h-14 w-full items-center justify-center rounded-[1.4rem] bg-orange-50 text-orange-600 transition-all hover:bg-orange-100"
              >
                <RefreshCcw size={18} />
              </button>
              <button
                title="Rotate Right"
                onClick={() => handleRotateSelected(Number(selectedItemData.transform?.rotation ?? 0) + 15)}
                className="flex h-14 w-full items-center justify-center rounded-[1.4rem] bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
              >
                <RotateCw size={18} />
              </button>

              <div />
              <button
                title="Scale Down"
                onClick={() => handleScaleSelected((Math.abs(selectedItemData.transform?.scaleX ?? 1) || 1) - 0.1)}
                className="flex h-14 w-full items-center justify-center rounded-[1.4rem] bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
              >
                <Minimize2 size={18} />
              </button>
              <div />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Opacity
              </p>
              <span className="text-sm font-bold text-slate-600">
                {Math.round((Number(selectedItemData.opacity ?? 1) || 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={Math.max(0.05, Math.min(1, Number(selectedItemData.opacity ?? 1)))}
              onChange={(event) => handleSelectedOpacityChange(event.target.value)}
              className="mt-4 w-full accent-orange-500"
            />
          </div>
        </div>
      );
    }

    if (selectedCanvasItem && activeObjectPanel === 'colors' && selectedItemData) {
      if (isMobileViewport) {
        return (
          <div className="space-y-2">
            <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Fill Color
              </p>
              <div className="mt-2 flex items-center gap-2">
                <ColorPickerField
                  value={isValidHexColor(selectedStyle.fillColor) ? selectedStyle.fillColor : normalizeHexColor(selectedStyle.fillColor, '#111827')}
                  onChange={(event) => updateSelectedItemStyle({ fillColor: normalizeHexColor(event.target.value, '#111827') })}
                />
                <HexColorInput
                  value={normalizeHexColor(selectedStyle.fillColor || '#111827', '#111827')}
                  onValidColorChange={(nextValue) => updateSelectedItemStyle({ fillColor: normalizeHexColor(nextValue, '#111827') })}
                  placeholder="#111827"
                />
              </div>
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                {colorSwatches.map((color) => (
                  <button
                    key={color}
                    title={color}
                    onClick={() => updateSelectedItemStyle({ fillColor: color })}
                    className={`h-7 w-7 shrink-0 rounded-full border-[3px] transition-all ${
                      selectedStyle.fillColor === color ? 'scale-105 ring-2 ring-orange-300 border-black' : 'border-black/80'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              Fill Color
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ColorPickerField
                value={isValidHexColor(selectedStyle.fillColor) ? selectedStyle.fillColor : normalizeHexColor(selectedStyle.fillColor, '#111827')}
                onChange={(event) => updateSelectedItemStyle({ fillColor: normalizeHexColor(event.target.value, '#111827') })}
              />
              <HexColorInput
                value={normalizeHexColor(selectedStyle.fillColor || '#111827', '#111827')}
                onValidColorChange={(nextValue) => updateSelectedItemStyle({ fillColor: normalizeHexColor(nextValue, '#111827') })}
                placeholder="#111827"
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {colorSwatches.map((color) => (
                <button
                  key={color}
                  title={color}
                  onClick={() => updateSelectedItemStyle({ fillColor: color })}
                  className={`mx-auto h-12 w-12 rounded-full border-[3px] transition-all ${
                    selectedStyle.fillColor === color ? 'scale-105 ring-2 ring-orange-300 border-black' : 'border-black/80'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (selectedCanvasItem && activeObjectPanel === 'fonts' && selectedItemData && canEditText) {
      if (isMobileViewport) {
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 overflow-x-auto rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
              {AVAILABLE_EDITOR_FONTS.map((fontName) => {
                const isActiveFont = (selectedItemData.fontFamily || logoConfig.fontFamily || 'Arial') === fontName;

                return (
                  <button
                    key={fontName}
                    onClick={() => handleSelectedTextFontChange(fontName)}
                    className={`w-[96px] shrink-0 rounded-[1rem] border px-3 py-3 text-left transition-all ${
                      isActiveFont
                        ? 'border-black bg-orange-50 shadow-sm ring-2 ring-orange-200'
                        : 'border-slate-100 bg-white hover:border-orange-300 hover:shadow-sm'
                    }`}
                  >
                    <p
                      className="text-lg text-slate-900"
                      style={{ fontFamily: fontName }}
                    >
                      Aa
                    </p>
                    <p className="mt-1 text-[10px] font-extrabold leading-snug text-slate-900">{fontName}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Font Size
              </p>
              <span className="text-sm font-bold text-slate-600">{Math.round(Number(selectedItemData.fontSize || 46))} px</span>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => handleSelectedTextFontSizeChange(Number(selectedItemData.fontSize || 46) - 2)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-black text-slate-700 transition-all hover:border-orange-300 hover:text-orange-600"
              >
                -
              </button>
              <input
                type="range"
                min="12"
                max="120"
                step="1"
                value={Number(selectedItemData.fontSize || 46)}
                onChange={(event) => handleSelectedTextFontSizeChange(event.target.value)}
                className="w-full accent-orange-500"
              />
              <button
                onClick={() => handleSelectedTextFontSizeChange(Number(selectedItemData.fontSize || 46) + 2)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-black text-slate-700 transition-all hover:border-orange-300 hover:text-orange-600"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {AVAILABLE_EDITOR_FONTS.map((fontName) => {
              const isActiveFont = (selectedItemData.fontFamily || logoConfig.fontFamily || 'Arial') === fontName;

              return (
                <button
                  key={fontName}
                  onClick={() => handleSelectedTextFontChange(fontName)}
                  className={`rounded-3xl border p-4 text-left transition-all ${
                    isActiveFont
                      ? 'border-black bg-orange-50 shadow-sm ring-2 ring-orange-200'
                      : 'border-slate-100 bg-white hover:border-orange-300 hover:shadow-sm'
                  }`}
                >
                  <p
                    className="text-2xl text-slate-900"
                    style={{ fontFamily: fontName }}
                  >
                    Aa
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-slate-900">{fontName}</p>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (selectedCanvasItem && activeObjectPanel === 'outlines' && selectedItemData) {
      if (isMobileViewport) {
        return (
          <div className="space-y-2">
            <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Outline Color
              </p>
              <div className="mt-2 flex items-center gap-2">
                <ColorPickerField
                  value={isValidHexColor(selectedStyle.outlineColor) ? selectedStyle.outlineColor : normalizeHexColor(selectedStyle.outlineColor, '#111827')}
                  onChange={(event) => updateSelectedItemStyle({ outlineColor: normalizeHexColor(event.target.value, '#111827') })}
                />
                <HexColorInput
                  value={normalizeHexColor(selectedStyle.outlineColor || '#111827', '#111827')}
                  onValidColorChange={(nextValue) => updateSelectedItemStyle({ outlineColor: normalizeHexColor(nextValue, '#111827') })}
                  placeholder="#111827"
                />
              </div>
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                {colorSwatches.map((color) => (
                  <button
                    key={color}
                    title={color}
                    onClick={() => updateSelectedItemStyle({ outlineColor: color })}
                    className={`h-7 w-7 shrink-0 rounded-full border-[3px] transition-all ${
                      selectedStyle.outlineColor === color ? 'scale-105 ring-2 ring-orange-300 border-black' : 'border-black/80'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Thickness
                </p>
                <span className="text-xs font-bold text-slate-600">{selectedStyle.outlineWidth ?? 0}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={selectedStyle.outlineWidth ?? 0}
                onChange={(event) => updateSelectedItemStyle({ outlineWidth: Number(event.target.value) })}
                className="mt-2 w-full accent-orange-500"
              />
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              Outline Color
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ColorPickerField
                value={isValidHexColor(selectedStyle.outlineColor) ? selectedStyle.outlineColor : normalizeHexColor(selectedStyle.outlineColor, '#111827')}
                onChange={(event) => updateSelectedItemStyle({ outlineColor: normalizeHexColor(event.target.value, '#111827') })}
              />
              <HexColorInput
                value={normalizeHexColor(selectedStyle.outlineColor || '#111827', '#111827')}
                onValidColorChange={(nextValue) => updateSelectedItemStyle({ outlineColor: normalizeHexColor(nextValue, '#111827') })}
                placeholder="#111827"
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {colorSwatches.map((color) => (
                <button
                  key={color}
                  title={color}
                  onClick={() => updateSelectedItemStyle({ outlineColor: color })}
                  className={`mx-auto h-12 w-12 rounded-full border-[3px] transition-all ${
                    selectedStyle.outlineColor === color ? 'scale-105 ring-2 ring-orange-300 border-black' : 'border-black/80'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Thickness
              </p>
              <span className="text-sm font-bold text-slate-600">{selectedStyle.outlineWidth ?? 0}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={selectedStyle.outlineWidth ?? 0}
              onChange={(event) => updateSelectedItemStyle({ outlineWidth: Number(event.target.value) })}
              className="mt-4 w-full accent-orange-500"
            />
          </div>
        </div>
      );
    }

    if (selectedCanvasItem && activeObjectPanel === '3D' && selectedItemData) {
      const rotateControls = [
        { key: 'rotateX', label: 'X Axis', value: selectedStyle.rotateX ?? 0 },
        { key: 'rotateY', label: 'Y Axis', value: selectedStyle.rotateY ?? 0 },
        { key: 'rotateZ', label: 'Z Axis', value: selectedStyle.rotateZ ?? 0 },
      ];

      if (isMobileViewport) {
        return (
          <div className="space-y-2">
            <div className="rounded-[0.95rem] border border-slate-100 bg-white p-1 shadow-sm">
              <div className="space-y-1">
                {rotateControls.map((control) => (
                  <div key={control.key} className="rounded-[0.85rem] border border-slate-100 bg-slate-50 px-2 py-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {control.label}
                      </p>
                      <span className="text-xs font-bold text-slate-600">{control.value}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={control.value}
                      onChange={(event) => updateSelectedItemStyle({ [control.key]: Number(event.target.value) })}
                      className="mt-0.5 h-4 w-full accent-orange-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {[
            { key: 'rotateX', label: 'X Axis', value: selectedStyle.rotateX ?? 0 },
            { key: 'rotateY', label: 'Y Axis', value: selectedStyle.rotateY ?? 0 },
            { key: 'rotateZ', label: 'Z Axis', value: selectedStyle.rotateZ ?? 0 },
          ].map((control) => (
            <div key={control.key} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  {control.label}
                </p>
                <span className="text-sm font-bold text-slate-600">{control.value}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={control.value}
                onChange={(event) => updateSelectedItemStyle({ [control.key]: Number(event.target.value) })}
                className="mt-4 w-full accent-orange-500"
              />
            </div>
          ))}
        </div>
      );
    }

    if (activeTool === 'background') {
      return (
        <div className="space-y-4">
          <div className="space-y-2 lg:hidden">
            {!isMobileViewport && (activeBackgroundOption === 'color' || !activeBackgroundOption) && (
              <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
                <div className="w-[220px] shrink-0 rounded-[0.95rem] border border-slate-100 bg-white px-2.5 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-slate-400">
                      <Palette size={15} />
                    </span>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={activeBackgroundOpacity}
                      onChange={(event) => applyBackgroundOpacity(event.target.value)}
                      className="w-full accent-orange-500"
                    />
                    <span className="min-w-[38px] text-right text-xs font-bold text-slate-600">
                      {Math.round(activeBackgroundOpacity * 100)}%
                    </span>
                  </div>
                </div>

                <div className="w-[420px] shrink-0 rounded-[0.95rem] border border-slate-100 bg-white px-2 py-2 shadow-sm">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {backgroundShapeOptions.map((shapeOption) => {
                      const Icon = shapeOption.icon;
                      const isActiveShape = activeBackgroundShapeType === shapeOption.id;

                      return (
                        <button
                          key={shapeOption.id}
                          onClick={() => applyBackgroundShape(shapeOption.id)}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                            isActiveShape
                              ? 'border-black bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                              : 'border-slate-200 bg-white text-slate-500'
                          }`}
                        >
                          <Icon size={15} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="w-[330px] shrink-0 rounded-[0.95rem] border border-slate-100 bg-white px-2.5 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ColorPickerField
                      value={customColorValue}
                      onChange={(event) => {
                        const safeColor = normalizeHexColor(event.target.value, '#FFFFFF');
                        setDialogBaseColor(safeColor);
                        setDialogSelectedColor(safeColor);
                        setCustomColorValue(safeColor);
                        applyBackgroundColor(safeColor);
                      }}
                    />
                    <HexColorInput
                      value={customColorValue}
                      onValidColorChange={(nextValue) => {
                        const safeColor = normalizeHexColor(nextValue, '#FFFFFF');
                        setDialogBaseColor(safeColor);
                        setDialogSelectedColor(safeColor);
                        setCustomColorValue(safeColor);
                        applyBackgroundColor(safeColor);
                      }}
                      placeholder="#FFFFFF"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto">
                    {backgroundColorSwatches.map((color) => (
                      <button
                        key={color}
                        title={color}
                        onClick={() => {
                          const safeColor = normalizeHexColor(color, '#FFFFFF');
                          setDialogBaseColor(safeColor);
                          setDialogSelectedColor(safeColor);
                          setCustomColorValue(safeColor);
                          applyBackgroundColor(safeColor);
                        }}
                        className={`h-7 w-7 shrink-0 rounded-full border-[3px] transition-all ${
                          dialogSelectedColor === normalizeHexColor(color, '#FFFFFF')
                            ? 'scale-105 ring-2 ring-orange-300 border-black'
                            : 'border-black/80'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isMobileViewport && activeBackgroundOption === 'gradient' && (
              <div className="space-y-2.5 rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                <div className="h-16 rounded-[0.85rem] border border-slate-100" style={gradientPreviewStyle} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Start</p>
                    <div className="mt-2 flex items-center gap-3">
                      <ColorPickerField
                        value={gradientStartColor}
                        onChange={(event) => setGradientStartColor(normalizeHexColor(event.target.value, '#000000'))}
                      />
                      <HexColorInput
                        value={gradientStartColor}
                        onValidColorChange={(nextValue) => setGradientStartColor(normalizeHexColor(nextValue, '#000000'))}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">End</p>
                    <div className="mt-2 flex items-center gap-3">
                      <ColorPickerField
                        value={gradientEndColor}
                        onChange={(event) => setGradientEndColor(normalizeHexColor(event.target.value, '#64748B'))}
                      />
                      <HexColorInput
                        value={gradientEndColor}
                        onValidColorChange={(nextValue) => setGradientEndColor(normalizeHexColor(nextValue, '#64748B'))}
                        placeholder="#64748B"
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setGradientType('linear')}
                      className={`brand-chip-button px-3 py-1.5 text-[11px] ${gradientType === 'linear' ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200' : ''}`}
                    >
                      Linear
                    </button>
                    <button
                      onClick={() => setGradientType('radial')}
                      className={`brand-chip-button px-3 py-1.5 text-[11px] ${gradientType === 'radial' ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200' : ''}`}
                    >
                      Radial
                    </button>
                  </div>
                  {gradientType === 'linear' ? (
                    <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1">
                      {gradientDirectionOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = gradientDirection === option.id;

                        return (
                          <button
                            key={option.id}
                            onClick={() => setGradientDirection(option.id)}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all ${
                              isActive
                                ? 'border-black bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          >
                            <Icon size={15} />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Angle</span>
                        <span className="text-sm font-bold text-slate-700">{gradientRadialAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={gradientRadialAngle}
                        onChange={(event) => setGradientRadialAngle(Number(event.target.value))}
                        className="mt-2 w-full accent-orange-500"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={applyGradientToBackground}
                  className="brand-button-outline w-full px-4 py-2.5 text-sm"
                >
                  Apply Gradient
                </button>
              </div>
            )}

            {activeBackgroundOption === 'background' && (
              <div className="flex items-center gap-1.5 overflow-x-auto rounded-[0.95rem] border border-slate-100 bg-white p-2 shadow-sm">
                {backgroundLibraryImages.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    onClick={() => applyPresetBackgroundImage(imageUrl)}
                    className="w-[62px] shrink-0 overflow-hidden rounded-[0.8rem] border border-slate-100 bg-white shadow-sm transition-all hover:border-orange-300"
                  >
                    <div className="aspect-[1/1] bg-slate-100">
                      <img src={imageUrl} alt={`Background ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeBackgroundOption === 'texture' && (
              <div className="flex items-center gap-1.5 overflow-x-auto rounded-[0.95rem] border border-slate-100 bg-white p-2 shadow-sm">
                {textureLibraryImages.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    onClick={() => applyPresetBackgroundImage(imageUrl)}
                    className="w-[62px] shrink-0 overflow-hidden rounded-[0.8rem] border border-slate-100 bg-white shadow-sm transition-all hover:border-orange-300"
                  >
                    <div className="aspect-[1/1] bg-slate-100">
                      <img src={imageUrl} alt={`Texture ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeBackgroundOption === 'image' && (
              <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                <button
                  onClick={openBackgroundImageBrowser}
                  className="brand-button-outline flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm"
                >
                  <Images size={16} />
                  <span>Choose Background Image</span>
                </button>
              </div>
            )}
          </div>

          <div className="hidden space-y-4 lg:block">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Shape Library
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {backgroundShapeOptions.map((shapeOption) => {
                  const Icon = shapeOption.icon;
                  const isActiveShape = activeBackgroundShapeType === shapeOption.id;

                  return (
                    <button
                      key={shapeOption.id}
                      onClick={() => applyBackgroundShape(shapeOption.id)}
                      className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                        isActiveShape
                          ? 'border-black bg-orange-50 text-orange-700 shadow-sm ring-2 ring-orange-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          isActiveShape ? 'border-2 border-black bg-white text-orange-600' : 'border-2 border-transparent bg-slate-100 text-slate-600'
                        }`}>
                          <Icon size={18} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  Background Opacity
                </p>
                <span className="text-sm font-bold text-slate-600">
                  {Math.round(activeBackgroundOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={activeBackgroundOpacity}
                onChange={(event) => applyBackgroundOpacity(event.target.value)}
                className="mt-4 w-full accent-orange-500"
              />
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                    Shape Fill
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {activeBackgroundShape ? 'Selected shape ka fill color change karo.' : 'Pehle koi shape choose karo.'}
                  </p>
                </div>
                <span
                  className="h-10 w-10 rounded-2xl border border-slate-200"
                  style={{ backgroundColor: activeBackgroundShape ? activeBackgroundShapeColor : '#F8FAFC' }}
                />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <ColorPickerField
                  disabled={!activeBackgroundShape}
                  value={activeBackgroundShape ? activeBackgroundShapeColor : '#FFFFFF'}
                  onChange={(event) => applyBackgroundShapeColor(event.target.value)}
                />
                <HexColorInput
                  disabled={!activeBackgroundShape}
                  value={activeBackgroundShape ? activeBackgroundShapeColor : '#FFFFFF'}
                  onValidColorChange={(nextValue) => applyBackgroundShapeColor(nextValue)}
                  placeholder="#FFFFFF"
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {backgroundColorSwatches.map((color) => (
                  <button
                    key={color}
                    title={color}
                    disabled={!activeBackgroundShape}
                    onClick={() => applyBackgroundShapeColor(color)}
                    className={`mx-auto h-12 w-12 rounded-full border-[3px] transition-all ${
                      activeBackgroundShapeColor === normalizeHexColor(color, '#FFFFFF')
                        ? 'scale-105 ring-2 ring-orange-300 border-black'
                        : 'border-black/80'
                    } ${activeBackgroundShape ? '' : 'cursor-not-allowed opacity-40'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTool === 'effect') {
      if (isMobileViewport) {
        return (
          <div className="flex items-center gap-2 overflow-x-auto rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
            {effectLibraryImages.map((imageUrl, index) => (
              <button
                key={imageUrl}
                onClick={() => applyPresetBackgroundImage(imageUrl)}
                className="w-[84px] shrink-0 overflow-hidden rounded-[0.95rem] border border-slate-100 bg-white shadow-sm transition-all hover:border-orange-300"
              >
                <div className="aspect-[1/1] bg-slate-100">
                  <img src={imageUrl} alt={`Effect ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              </button>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {effectLibraryImages.map((imageUrl, index) => (
              <button
                key={imageUrl}
                onClick={() => applyPresetBackgroundImage(imageUrl)}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white text-left shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  <img src={imageUrl} alt={`Effect ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTool === 'palette') {
      if (isMobileViewport) {
        return (
          <div className="flex items-stretch gap-1.5 overflow-x-auto rounded-[0.95rem] border border-slate-100 bg-white p-2 shadow-sm">
            {designPalettes.map((palette) => (
              <button
                key={palette.id}
                onClick={() => applyDesignPalette(palette)}
                className="group w-[88px] shrink-0 overflow-hidden rounded-[0.85rem] border border-slate-100 bg-white text-left shadow-sm transition-all hover:border-orange-300"
              >
                <div
                  className="h-7 w-full"
                  style={{ background: `linear-gradient(135deg, ${palette.colors.join(', ')})` }}
                />
                <div className="space-y-1.5 p-1.5">
                  <div className="flex items-center gap-1">
                    {palette.colors.map((color) => (
                      <span
                        key={`${palette.id}-${color}`}
                        className="h-3 flex-1 rounded-full shadow-inner"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="line-clamp-1 text-[9px] font-extrabold leading-snug text-slate-800">{palette.name}</p>
                </div>
              </button>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {designPalettes.map((palette) => (
            <button
              key={palette.id}
              onClick={() => applyDesignPalette(palette)}
              className="group relative flex min-h-[220px] w-full flex-col justify-between overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-xl"
            >
              <div
                className="absolute inset-x-0 top-0 h-16 opacity-90"
                style={{ background: `linear-gradient(135deg, ${palette.colors.join(', ')})` }}
              />
              <div className="relative">
                <div className="flex items-start justify-end gap-3">
                  <div className="rounded-2xl bg-white/95 px-3 py-2 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-2">
                      {palette.colors.map((color) => (
                        <span
                          key={color}
                          className="h-4 w-4 rounded-full border-2 border-white shadow-sm sm:h-5 sm:w-5"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-8 rounded-[1.35rem] border border-slate-100 bg-slate-50/80 p-3">
                  <div className="grid grid-cols-4 gap-2">
                    {palette.colors.map((color) => (
                      <span
                        key={`${palette.id}-${color}`}
                        className="h-10 rounded-2xl shadow-inner"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative mt-4">
                <p className="text-lg font-extrabold text-slate-900">{palette.name}</p>
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (activeTool === 'art') {
      if (isMobileViewport) {
        return (
          <div className="flex items-center gap-2 overflow-x-auto rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
            {artLibraryImages.map((imageUrl, index) => (
              <button
                key={imageUrl}
                onClick={() => handleAddPresetArt(imageUrl)}
                className="w-[84px] shrink-0 overflow-hidden rounded-[0.95rem] border border-slate-100 bg-white shadow-sm transition-all hover:border-orange-300"
              >
                <div className="aspect-[1/1] bg-slate-50 p-2.5">
                  <img src={imageUrl} alt={`Art ${index + 1}`} className="h-full w-full object-contain" />
                </div>
              </button>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {artLibraryImages.map((imageUrl, index) => (
              <button
                key={imageUrl}
                onClick={() => handleAddPresetArt(imageUrl)}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white text-left shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
              >
                <div className="aspect-[4/3] bg-slate-50 p-4">
                  <img src={imageUrl} alt={`Art ${index + 1}`} className="h-full w-full object-contain" />
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTool === 'images') {
      return null;
    }

    if (activeTool === 'text') {
      return null;
    }

    return null;
  };

  const renderMobileContextBar = () => {
    if (selectedCanvasItem) {
      const orderedPanels = [
        activeObjectPanel,
        ...objectPanels.filter((panel) => panel !== activeObjectPanel),
      ];
      const mobilePanelLabels = {
        controls: 'CONTROL',
        fonts: 'FONT',
        colors: 'COLOR',
        outlines: 'OUTLINE',
        '3D': '3D',
      };
      const actionButtons = [];

      if (canDuplicate) {
        actionButtons.push({
          key: 'duplicate',
          label: 'DUPLICATE',
          onClick: handleDuplicateSelected,
        });
      }

      actionButtons.push({
        key: 'delete',
        label: 'DELETE',
        onClick: handleDeleteSelected,
      });

      if (canEditSingleText) {
        actionButtons.push({
          key: 'edit',
          label: 'EDIT',
          onClick: handleEditSelectedText,
        });
      }

      const compactItems = [
        ...orderedPanels.map((panel, index) => ({
          key: panel,
          label: mobilePanelLabels[panel] || panel.toUpperCase(),
          onClick: () => setActiveObjectPanel(panel),
          active: index === 0,
        })),
        ...actionButtons.map((action) => ({
          ...action,
          active: false,
        })),
      ];

      return (
        <div className="mb-1.5 rounded-[0.9rem] border border-slate-100 bg-white p-1.5 shadow-sm">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${compactItems.length}, minmax(0, 1fr))` }}
          >
            {compactItems.map((item) => (
              <button
                key={item.key}
                onClick={item.onClick}
                className={`min-w-0 rounded-full border px-1 py-1 text-[7px] font-black uppercase leading-none transition-all ${
                  item.active
                    ? 'border-orange-300 bg-orange-50 text-orange-600 ring-1 ring-orange-200'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="block truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTool === 'background') {
      return (
        <div className="mb-2 flex min-w-max items-center gap-1.5 overflow-x-auto pb-1">
          {backgroundOptions.map((option) => {
            const Icon = option.icon;
            const isActiveOption = activeBackgroundOption === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleBackgroundOptionSelect(option.id)}
                className={`brand-chip-button flex shrink-0 items-center gap-1 px-2.5 py-1.5 text-[10px] transition-all ${
                  isActiveOption ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200' : ''
                }`}
              >
                <Icon size={12} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    return null;
  };
  const mobileContextBar = renderMobileContextBar();

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8fafc_48%,#eef2ff_100%)] font-sans lg:flex-row"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <aside className="hidden w-[92px] shrink-0 border-r border-gray-100 bg-white lg:flex lg:flex-col lg:items-start lg:px-3 lg:py-6">
        <div className="flex w-full flex-col items-stretch gap-5">
          {editorTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  closeEditorOverlays();
                  clearCanvasSelection();
                  setActiveBackgroundOption(null);

                  if (tool.id === 'text') {
                    setActiveTool(null);
                    handleAddTextLayer();
                    return;
                  }

                  if (tool.id === 'images') {
                    setActiveTool(null);
                    openImageBrowser();
                    return;
                  }

                  setActiveTool(tool.id);
                }}
                title={tool.label}
                className={`brand-icon-button flex h-[72px] w-full items-center justify-center rounded-[1.55rem] px-3 py-4 transition-all ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                    : ''
                }`}
              >
                <Icon size={19} />
              </button>
            );
          })}
        </div>
      </aside>

      {/* DESKTOP SIDEBAR */}
      {shouldShowDesktopSidebar && (
        <aside className="hidden w-[300px] shrink-0 flex-col border-r border-gray-100 bg-white xl:w-[320px] lg:flex">
          <div className="border-b border-gray-50 p-8">
            <h2 className={`text-xs font-black uppercase tracking-widest ${gradients.text}`}>{sidebarHeading}</h2>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 space-y-4">
            {renderSidebarContent()}
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative h-full min-w-0">

        {/* MOBILE HEADER */}
        <div className="z-[100] shrink-0 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={editorState.past.length === 0}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  editorState.past.length === 0
                    ? 'cursor-not-allowed bg-gray-50 text-slate-400'
                    : 'bg-gray-50 text-gray-600'
                }`}
                title="Undo"
              >
                <Undo2 size={18} />
              </button>
              <button
                onClick={handleRedo}
                disabled={editorState.future.length === 0}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  editorState.future.length === 0
                    ? 'cursor-not-allowed bg-gray-50 text-slate-400'
                    : 'bg-gray-50 text-gray-600'
                }`}
                title="Redo"
              >
                <Redo2 size={18} />
              </button>
            </div>
            <h1 className="min-w-0 flex-1 text-center text-lg font-black tracking-tight text-slate-900">
              Logo Maker
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviewOpen}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-all"
                title="Preview"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={handleSaveDesign}
                disabled={!designId || savingChanges}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  !designId || savingChanges
                    ? 'cursor-not-allowed bg-gray-50 text-slate-400'
                    : 'bg-gray-50 text-gray-600'
                }`}
                title={savingChanges ? 'Saving...' : 'Save Design'}
              >
                <Save size={18} />
              </button>
              <button
                onClick={handleOpenDownloadDialog}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-all"
                title="Download"
              >
                <ShoppingCart size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* CANVAS */}
        <div className="relative flex-1 overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-2.5 pb-[7.1rem] sm:p-4 sm:pb-[8rem] lg:p-8 lg:pb-8">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleImageUpload}
          />
          <input
            ref={backgroundImageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleBackgroundImageUpload}
          />

          <div
            className="absolute left-3 z-20 hidden items-center gap-2 sm:left-4 lg:flex lg:bottom-auto lg:left-6 lg:top-6 lg:gap-3"
            style={mobileFloatingControlsStyle}
          >
            <button
              onClick={handleUndo}
              disabled={editorState.past.length === 0}
              className={`brand-icon-button flex h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur transition-all lg:h-11 lg:w-11 ${
                editorState.past.length === 0
                  ? 'cursor-not-allowed text-slate-300'
                  : ''
              }`}
              title="Undo"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={handleRedo}
              disabled={editorState.future.length === 0}
              className={`brand-icon-button flex h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur transition-all lg:h-11 lg:w-11 ${
                editorState.future.length === 0
                  ? 'cursor-not-allowed text-slate-300'
                  : ''
              }`}
              title="Redo"
            >
              <Redo2 size={18} />
            </button>
          </div>

          {showFloatingToolbar && (
            <div
              className="absolute left-1/2 z-20 hidden w-[calc(100%-2rem)] max-w-max -translate-x-1/2 sm:w-auto lg:block"
              style={floatingToolbarOffsetStyle}
            >
              <div className="overflow-x-auto rounded-[1.7rem] border border-slate-200/80 bg-white/95 px-3 py-3 shadow-xl backdrop-blur">
                {selectedCanvasItem ? (
                  <div className="flex min-w-max items-center justify-center gap-2">
                    {objectPanels.map((panel) => (
                      <button
                        key={panel}
                        onClick={() => setActiveObjectPanel(panel)}
                        className={`brand-chip-button shrink-0 px-4 py-2 text-xs transition-all ${
                          activeObjectPanel === panel
                            ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                            : ''
                        }`}
                      >
                        {panel}
                      </button>
                    ))}
                    {canDuplicate && (
                      <button
                        onClick={handleDuplicateSelected}
                        className="brand-button-outline shrink-0 px-4 py-2 text-xs"
                      >
                        Duplicate
                      </button>
                    )}
                    <button
                      onClick={handleDeleteSelected}
                      className="brand-button-outline flex shrink-0 items-center gap-2 px-4 py-2 text-xs"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                    {canEditSingleText && (
                      <button
                        onClick={handleEditSelectedText}
                        className="brand-button-outline shrink-0 px-4 py-2 text-xs"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ) : activeTool === 'background' ? (
                  <div className="flex min-w-max items-center justify-center gap-2">
                    {backgroundOptions.map((option) => {
                      const Icon = option.icon;
                      const isActiveOption = activeBackgroundOption === option.id;

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleBackgroundOptionSelect(option.id)}
                          className={`brand-chip-button flex shrink-0 items-center gap-2 px-4 py-2 text-xs transition-all ${
                            isActiveOption
                              ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                              : ''
                          }`}
                        >
                          <Icon size={14} />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : activeTool === 'images' ? (
                  <div className="flex min-w-max items-center justify-center gap-2">
                    <button
                      onClick={openImageBrowser}
                      className="brand-button-outline flex items-center gap-2 px-4 py-2 text-xs"
                    >
                      <Images size={14} />
                      <span>Browse Image</span>
                    </button>
                  </div>
                ) : activeTool === 'text' ? (
                  <div className="flex min-w-max items-center justify-center gap-2">
                    <button
                      onClick={handleAddTextLayer}
                      className="brand-button-outline flex items-center gap-2 px-4 py-2 text-xs"
                    >
                      <Type size={14} />
                      <span>Add Text</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {editDialog.open && (
            <div className={`${isMobileViewport ? 'fixed' : 'absolute'} inset-0 z-[180] overflow-y-auto ${isMobileViewport ? 'bg-white p-0' : 'bg-slate-950/25 p-4 backdrop-blur-sm'}`}>
              <div className={`flex min-h-full ${isMobileViewport ? 'items-stretch justify-stretch' : 'items-center justify-center py-6'}`}>
                <div className={`w-full bg-white ${isMobileViewport ? 'flex min-h-screen max-w-none flex-col px-4 pb-6 pt-5 shadow-none' : 'max-w-sm rounded-[1.75rem] border border-slate-100 p-4 shadow-2xl sm:max-w-md sm:p-5'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                        {editDialog.mode === 'plain-text' ? 'Edit Text Layer' : 'Edit Brand Line'}
                      </p>
                      <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                        Update Text
                      </h3>
                    </div>
                    <button
                      onClick={closeEditDialog}
                      className={`${isMobileViewport ? 'flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600' : 'brand-icon-button h-10 w-10 p-0'}`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className={`${isMobileViewport ? 'flex flex-1 flex-col justify-center' : 'mt-6'}`}>
                    <div className={isMobileViewport ? 'space-y-4' : ''}>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-600">
                          {editDialog.mode === 'plain-text' ? 'Text' : 'Business Name'}
                        </label>
                        <input
                          value={editDialog.businessValue}
                          onChange={(event) =>
                            setEditDialog((prev) => ({
                              ...prev,
                              businessValue: event.target.value,
                            }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();
                              handleSaveEditedText();
                            }
                          }}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-orange-400 focus:bg-white"
                          placeholder={editDialog.mode === 'plain-text' ? 'Enter text' : 'Enter business name'}
                          autoFocus
                        />
                      </div>
                      {editDialog.mode !== 'plain-text' && (
                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-600">
                            Slogan
                          </label>
                          <input
                            value={editDialog.sloganValue}
                            onChange={(event) =>
                              setEditDialog((prev) => ({
                                ...prev,
                                sloganValue: event.target.value,
                              }))
                            }
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                handleSaveEditedText();
                              }
                            }}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-orange-400 focus:bg-white"
                            placeholder="Enter slogan"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`mt-6 flex flex-col-reverse gap-3 ${isMobileViewport ? '' : 'sm:flex-row sm:items-center sm:justify-end'}`}>
                    <button
                      onClick={closeEditDialog}
                      className="brand-button-outline px-5 py-2.5 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEditedText}
                      className="brand-button-outline px-5 py-2.5 text-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {colorDialogOpen && (
            <div className={`${isMobileViewport ? 'fixed' : 'absolute'} inset-0 z-30 overflow-hidden ${isMobileViewport ? 'bg-white p-0' : 'bg-slate-950/30 p-2 backdrop-blur-md sm:p-3'}`}>
              <div className={`flex h-full ${isMobileViewport ? 'items-stretch justify-stretch' : 'items-center justify-center'}`}>
              <div className={`flex w-full flex-col overflow-hidden bg-white ${isMobileViewport ? 'h-full max-w-none rounded-none border-0 p-4 shadow-none' : 'max-h-[calc(100vh-10rem)] max-w-[700px] rounded-[1.5rem] border border-slate-100 p-4 shadow-2xl sm:p-4'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Choose a Color
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Swatch ya color picker se background tone choose karo.
                    </p>
                  </div>
                  <button
                    onClick={closePickAnotherDialog}
                    className="brand-icon-button h-10 w-10 p-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 grid flex-1 gap-3 md:grid-cols-[1.2fr_0.9fr]">
                  <div className="rounded-[1.2rem] border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Starter Colors</p>
                    <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {backgroundColorSwatches.map((color, index) => {
                        const safeColor = normalizeHexColor(color, '#111827');
                        const isSelected = dialogSelectedColor === safeColor;

                        return (
                          <button
                            key={`${safeColor}-${index}`}
                            title={safeColor}
                            onClick={() => {
                              setDialogBaseColor(safeColor);
                              setDialogSelectedColor(safeColor);
                              setCustomColorValue(safeColor);
                            }}
                            className={`mx-auto h-8 w-8 rounded-full border-[3px] transition-all sm:h-9 sm:w-9 ${
                              isSelected ? 'scale-105 ring-2 ring-orange-300 border-black' : 'border-black/80'
                            }`}
                            style={{ backgroundColor: safeColor }}
                          />
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Shade Scale</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {dialogShadeOptions.map((shade, index) => {
                          const isSelected = dialogSelectedColor === shade;
                          return (
                            <button
                              key={`${shade}-${index}`}
                              title={shade}
                              onClick={() => {
                                setDialogSelectedColor(shade);
                                setCustomColorValue(shade);
                              }}
                              className={`h-8 w-8 rounded-full border-[3px] transition-all sm:h-9 sm:w-9 ${
                                isSelected ? 'ring-2 ring-orange-300 border-black scale-105' : 'border-black/70'
                              }`}
                              style={{ backgroundColor: shade }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.2rem] border border-slate-100 bg-white p-3 shadow-sm">
                    <div
                      className="h-20 rounded-[1rem] border border-slate-100 shadow-inner sm:h-24"
                      style={{ backgroundColor: isValidHexColor(customColorValue) ? customColorValue : normalizeHexColor(customColorValue, '#111827') }}
                    />
                    <div className="mt-3">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Color Picker</p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <ColorPickerField
                          value={isValidHexColor(customColorValue) ? customColorValue : normalizeHexColor(customColorValue, '#111827')}
                          onChange={(event) => {
                            const nextColor = normalizeHexColor(event.target.value, '#111827');
                            setCustomColorValue(nextColor);
                            setDialogBaseColor(nextColor);
                            setDialogSelectedColor(nextColor);
                          }}
                        />
                        <HexColorInput
                          value={customColorValue}
                          onValidColorChange={(nextValue) => {
                            const safeColor = normalizeHexColor(nextValue, '#111827');
                            setCustomColorValue(safeColor);
                            setDialogBaseColor(safeColor);
                            setDialogSelectedColor(safeColor);
                          }}
                          onSubmit={handleDialogSelect}
                          placeholder="#1A1A1A"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    onClick={closePickAnotherDialog}
                    className="brand-button-outline px-5 py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDialogSelect}
                    className="brand-button-outline px-5 py-2.5 text-sm"
                  >
                    Select
                  </button>
                </div>
              </div>
              </div>
            </div>
          )}

          {gradientDialogOpen && (
            <div className={`${isMobileViewport ? 'fixed' : 'absolute'} inset-0 z-30 overflow-hidden ${isMobileViewport ? 'bg-white p-0' : 'bg-slate-950/30 p-2 backdrop-blur-md sm:p-3'}`}>
              <div className={`flex h-full ${isMobileViewport ? 'items-stretch justify-stretch' : 'items-center justify-center'}`}>
              <div className={`flex w-full flex-col overflow-hidden bg-white ${isMobileViewport ? 'h-full max-w-none rounded-none border-0 p-4 shadow-none' : 'max-h-[calc(100vh-10rem)] max-w-[760px] rounded-[1.45rem] border border-slate-200 p-3 shadow-[0_28px_90px_rgba(15,23,42,0.24)] sm:p-4'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">Build Background Gradient</h3>
                  </div>
                  <button
                    onClick={closeGradientDialog}
                    className="brand-icon-button h-10 w-10 p-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-3 rounded-[1.4rem] border border-slate-200 bg-slate-50/60 p-3">
                  <div className="mx-auto h-16 w-[80%] rounded-[0.95rem] border border-slate-100 sm:h-20" style={gradientPreviewStyle} />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <button
                    onClick={() => openGradientColorDialog('start')}
                    className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-2.5 text-left transition-all hover:border-orange-300"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Start</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full border border-slate-200" style={{ backgroundColor: gradientStartColor }} />
                      <span className="text-sm font-bold text-slate-700">{gradientStartColor}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => openGradientColorDialog('end')}
                    className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-2.5 text-left transition-all hover:border-orange-300"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">End</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full border border-slate-200" style={{ backgroundColor: gradientEndColor }} />
                      <span className="text-sm font-bold text-slate-700">{gradientEndColor}</span>
                    </div>
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Gradient Type</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setGradientType('linear')}
                        className={`brand-chip-button px-4 py-2 text-sm transition-all ${
                          gradientType === 'linear'
                            ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                            : ''
                        }`}
                      >
                        Linear
                      </button>
                      <button
                        onClick={() => setGradientType('radial')}
                        className={`brand-chip-button px-4 py-2 text-sm transition-all ${
                          gradientType === 'radial'
                            ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                            : ''
                        }`}
                      >
                        Radial
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-3">
                    {gradientType === 'linear' ? (
                      <>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Direction</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {gradientDirectionOptions.map((option) => {
                            const Icon = option.icon;
                            const isActive = gradientDirection === option.id;

                            return (
                              <button
                                key={option.id}
                                onClick={() => setGradientDirection(option.id)}
                                className={`brand-icon-button flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                                  isActive
                                    ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                                    : ''
                                }`}
                                title={option.label}
                              >
                                <Icon size={17} />
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Gradient Angle</p>
                          <span className="text-sm font-bold text-slate-600">{gradientRadialAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={gradientRadialAngle}
                          onChange={(event) => setGradientRadialAngle(Number(event.target.value))}
                          className="mt-3 w-full accent-orange-500"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    onClick={closeGradientDialog}
                    className="brand-button-outline px-5 py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyGradientToBackground}
                    className="brand-button-outline px-5 py-2.5 text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
              </div>
            </div>
          )}

          {gradientColorDialogOpen && (
            <div className={`${isMobileViewport ? 'fixed' : 'absolute'} inset-0 z-40 overflow-hidden ${isMobileViewport ? 'bg-white p-0' : 'bg-slate-950/30 p-3 backdrop-blur-md sm:p-4'}`}>
              <div className={`flex h-full ${isMobileViewport ? 'items-stretch justify-stretch' : 'items-center justify-center'}`}>
              <div className={`w-full bg-white ${isMobileViewport ? 'h-full max-w-none rounded-none border-0 p-4 shadow-none' : 'max-w-[760px] rounded-[1.6rem] border border-slate-100 p-4 shadow-2xl sm:p-5'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Choose a Color</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {gradientColorTarget === 'start' ? 'Set the gradient start tone.' : 'Set the gradient end tone.'}
                    </p>
                  </div>
                  <button
                    onClick={closeGradientColorDialog}
                    className="brand-icon-button h-10 w-10 p-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[1.25fr_0.95fr]">
                  <div className="rounded-[1.35rem] border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Starter Colors</p>
                    <div className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                      {backgroundColorSwatches.map((color, index) => {
                        const safeColor = normalizeHexColor(color, '#111827');
                        const isSelected = gradientDialogSelectedColor === safeColor;

                        return (
                          <button
                            key={`${safeColor}-${index}`}
                            title={safeColor}
                            onClick={() => {
                              setGradientDialogBaseColor(safeColor);
                              setGradientDialogSelectedColor(safeColor);
                              setGradientCustomColorValue(safeColor);
                            }}
                            className={`mx-auto h-9 w-9 rounded-full border-[3px] transition-all sm:h-10 sm:w-10 ${
                              isSelected ? 'scale-105 ring-2 ring-orange-300 border-black' : 'border-black/80'
                            }`}
                            style={{ backgroundColor: safeColor }}
                          />
                        );
                      })}
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Shade Scale</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {gradientDialogShadeOptions.map((shade, index) => {
                          const isSelected = gradientDialogSelectedColor === shade;

                          return (
                            <button
                              key={`${shade}-${index}`}
                              title={shade}
                              onClick={() => {
                                setGradientDialogSelectedColor(shade);
                                setGradientCustomColorValue(shade);
                              }}
                              className={`h-9 w-9 rounded-full border-[3px] transition-all sm:h-10 sm:w-10 ${
                                isSelected ? 'ring-2 ring-orange-300 border-black scale-105' : 'border-black/70'
                              }`}
                              style={{ backgroundColor: shade }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-slate-100 bg-white p-4 shadow-sm">
                    <div
                      className="h-28 rounded-[1.25rem] border border-slate-100 shadow-inner"
                      style={{ backgroundColor: isValidHexColor(gradientCustomColorValue) ? gradientCustomColorValue : normalizeHexColor(gradientCustomColorValue, '#111827') }}
                    />
                    <div className="mt-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Color Picker</p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <ColorPickerField
                          value={isValidHexColor(gradientCustomColorValue) ? gradientCustomColorValue : normalizeHexColor(gradientCustomColorValue, '#111827')}
                          onChange={(event) => {
                            const nextColor = normalizeHexColor(event.target.value, '#111827');
                            setGradientDialogBaseColor(nextColor);
                            setGradientDialogSelectedColor(nextColor);
                            setGradientCustomColorValue(nextColor);
                          }}
                        />
                        <HexColorInput
                          value={gradientCustomColorValue}
                          onValidColorChange={(nextValue) => {
                            const safeColor = normalizeHexColor(nextValue, '#111827');
                            setGradientCustomColorValue(safeColor);
                            setGradientDialogBaseColor(safeColor);
                            setGradientDialogSelectedColor(safeColor);
                          }}
                          onSubmit={applyGradientDialogColor}
                          placeholder="#1A1A1A"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    onClick={closeGradientColorDialog}
                    className="brand-button-outline px-5 py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyGradientDialogColor}
                    className="brand-button-outline px-5 py-2.5 text-sm"
                  >
                    Select
                  </button>
                </div>
              </div>
              </div>
            </div>
          )}

          {assetPickerDialog.open && (
            <div className="absolute inset-0 z-[55] overflow-hidden bg-slate-950/30 p-3 backdrop-blur-md sm:p-4">
              <div className="flex h-full items-center justify-center">
                <div className="w-full max-w-5xl rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-2xl sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{assetPickerDialog.title}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Kisi bhi card par click karo aur woh current background par apply ho jayega.
                      </p>
                    </div>
                    <button
                      onClick={closeAssetPickerDialog}
                      className="brand-icon-button h-10 w-10 p-0"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {assetPickerDialog.items.map((imageUrl, index) => (
                      <button
                        key={imageUrl}
                        onClick={() => {
                          applyPresetBackgroundImage(imageUrl);
                          closeAssetPickerDialog();
                        }}
                        className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
                        >
                          <div className="aspect-[5/4] bg-slate-100">
                            <img
                              src={imageUrl}
                              alt={`${assetPickerDialog.title} ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewDialogOpen && (
            <div
              className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={() => setPreviewDialogOpen(false)}
            >
              <div
                className="relative w-full max-w-lg rounded-[2rem] border border-orange-100 bg-white p-5 shadow-[0_30px_90px_rgba(255,92,1,0.12)] sm:rounded-[3rem] sm:p-6 md:p-8"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  onClick={() => setPreviewDialogOpen(false)}
                  className="brand-icon-button absolute right-5 top-5 h-11 w-11 p-0"
                >
                  <X size={24} />
                </button>

                <div className="mb-5 aspect-[7/5] w-full overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50 sm:mb-6 sm:rounded-[2rem]">
                  {previewImageUrl ? (
                    <img src={previewImageUrl} alt="Edited logo preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                      Preview unavailable
                    </div>
                  )}
                </div>

                <div className="mb-6 text-center sm:mb-8">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Review Your Updated Logo</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">Current editor changes yahan same review style me dikh rahi hain.</p>
                </div>

                <div className="flex justify-center">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => setPreviewFullscreenOpen(true)}
                      className="brand-button-outline flex min-w-40 items-center justify-center gap-2 rounded-2xl px-6 py-3.5"
                    >
                      <Maximize2 size={18} />
                      Full View
                    </button>
                    <button
                      onClick={() => setPreviewDialogOpen(false)}
                      className="brand-button-outline flex min-w-40 items-center justify-center rounded-2xl px-6 py-3.5"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewFullscreenOpen && (
            <div
              className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
              onClick={() => setPreviewFullscreenOpen(false)}
            >
              <div
                className="relative flex h-full max-h-[96vh] w-full max-w-7xl items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 p-4 shadow-2xl sm:p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  onClick={() => setPreviewFullscreenOpen(false)}
                  className="brand-icon-button absolute right-5 top-5 h-11 w-11 p-0"
                >
                  <X size={22} />
                </button>

                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.5rem]">
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt="Full screen edited logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full min-h-[280px] w-full items-center justify-center text-sm font-semibold text-white/70">
                      Preview unavailable
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="fixed inset-x-0 bottom-0 z-[120] lg:hidden">
            <div className="overflow-hidden border-t border-slate-200 bg-[#0f172a] shadow-[0_-10px_30px_rgba(15,23,42,0.18)]">
              <div
                className={`overflow-hidden bg-white/98 transition-all duration-300 ${sidebarOpen && shouldShowDesktopSidebar ? 'max-h-[38svh] border-b border-slate-200 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="max-h-[38svh] overflow-hidden px-2.5 pb-2 pt-2">
                  {mobileContextBar && (
                    <div className="-mx-2.5 mb-1.5 border-b border-slate-100 bg-white/96 px-2.5 pb-1.5">
                      {mobileContextBar}
                    </div>
                  )}
                  <div className="space-y-1.5 pb-1">
                    {renderSidebarContent()}
                  </div>
                </div>
              </div>

              <div className="px-2 pb-[calc(0.3rem+env(safe-area-inset-bottom))] pt-1">
                <div className="flex items-stretch gap-1 overflow-x-auto pb-0.5">
                  {mobileEditorTools.map((tool) => {
                    const Icon = tool.icon;
                    const isControlsTool = tool.id === 'controls';
                    const isActive = isControlsTool
                      ? Boolean(selectedCanvasItem && !activeTool)
                      : activeTool === tool.id;

                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleMobileToolSelect(tool.id)}
                        title={tool.label}
                        aria-label={tool.label}
                        className={`flex min-h-[46px] min-w-[52px] flex-1 items-center justify-center rounded-2xl px-1.5 py-1.5 transition-all ${
                          isActive
                            ? 'bg-white text-[#0f172a] shadow-md'
                            : 'text-white/88'
                        }`}
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full w-full items-start justify-center pt-2 sm:pt-3 lg:items-center lg:pt-0">
            <div className="h-full w-full max-w-[880px] max-h-[44vh] sm:max-h-[52vh] lg:max-h-[380px]">
              <LogoCanvas
                config={logoConfig}
                onConfigChange={(partialConfig) =>
                  applyLogoConfigChange((prev) => ({
                    ...prev,
                    ...partialConfig,
                  }))
                }
                onSelectionChange={handleCanvasSelectionChange}
                selectionOverride={canvasSelectionOverride}
                clearSelectionToken={canvasClearSelectionToken}
                stageRef={stageRef}
                zoom={canvasZoom}
                hideSelectionUi={hideCanvasSelectionUi}
              />
            </div>
          </div>

          <div
            className="absolute left-1/2 z-20 hidden -translate-x-1/2 lg:block"
            style={floatingActionDockOffsetStyle}
          >
            <div className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
              <button
                onClick={handlePreviewOpen}
                className="brand-icon-button flex h-12 w-12 items-center justify-center rounded-full transition-all"
                title="Preview"
              >
                <Eye size={15} />
              </button>
              <button
                onClick={handleSaveDesign}
                disabled={!designId || savingChanges}
                className={`brand-icon-button flex h-12 w-12 items-center justify-center rounded-full transition-all ${!designId || savingChanges ? 'cursor-not-allowed opacity-60' : ''}`}
                title={savingChanges ? 'Saving...' : 'Save Design'}
              >
                <Save size={15} />
              </button>
              <button
                onClick={handleOpenDownloadDialog}
                className="brand-icon-button flex h-12 w-12 items-center justify-center rounded-full transition-all"
                title="Download"
              >
                <ShoppingCart size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <DownloadDialog
        open={downloadDialogOpen}
        title="Download Edited Logo"
        subtitle="Choose the file type you want to export from the editor."
        downloadingFormat={downloadingFormat}
        onClose={() => {
          if (!downloadingFormat) {
            setDownloadDialogOpen(false);
          }
        }}
        onDownload={handleEditorDownload}
      />
    </div>
  );
}
