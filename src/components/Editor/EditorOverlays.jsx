"use client";


import Image from 'next/image';
import React from 'react';
import { Maximize2, X } from 'lucide-react';
import { ColorPickerField, HexColorInput } from './ColorInputs';
import AnimatedCardMockup from './AnimatedCardMockup.jsx';
import { extractPaletteFromImage, generateSmartMockupPalette } from './colorUtils';

const PREVIEW_SURFACE_OPTIONS = [
  {
    id: 'simple',
    label: 'Simple View',
    frameClassName: 'aspect-square w-full max-w-[min(80vw,360px)]',
    fullscreenFrameClassName: 'aspect-square w-full max-w-[min(80vh,80vw,560px)]',
    type: 'simple',
  },
  {
    id: 'business-card',
    label: 'Business Card',
    frameClassName: 'aspect-[1.7/1] w-full max-w-[min(86vw,520px)]',
    fullscreenFrameClassName: 'aspect-[1.7/1] w-full max-w-[min(82vw,760px)]',
    type: 'business-card',
  },
];

function PreviewSurfaceFrame({
  surface,
  previewImageUrl,
  previewElementsImageUrl,
  previewElementsTone = 'dark',
  previewNeedsContrastBoost = false,
  fullscreen = false,
}) {
  const frameClassName = fullscreen
    ? surface.fullscreenFrameClassName
    : surface.frameClassName;
  const previewAssetUrl = previewElementsImageUrl || '';
  const useDarkSurface = previewElementsTone === 'light';

  // Extract a palette of dominant colors from the logo image for the card backgrounds
  // We call these hooks at the top level to follow React's Rules of Hooks
  const [palette, setPalette] = React.useState(['#f5f9ed', '#23272f', '#ffb385']);
  const [logoAccents, setLogoAccents] = React.useState(['#a4d65e', '#ff6b35']);

  React.useEffect(() => {
    if (!previewAssetUrl || surface.type !== 'business-card') return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const logoColors = extractPaletteFromImage(img, 3);
      if (logoColors && logoColors.length > 0) {
        const smartPalette = generateSmartMockupPalette(logoColors);
        setPalette(smartPalette);
        setLogoAccents(logoColors.map(c => `rgb(${c.r}, ${c.g}, ${c.b})`));
      }
    };
    img.src = previewAssetUrl;
  }, [previewAssetUrl, surface.type]);

  if (surface.type === 'simple') {
    return (
      <div className={`${frameClassName} flex items-center justify-center`}>
        {previewImageUrl ? (
          <div className="relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImageUrl}
              alt={fullscreen ? 'Full screen edited logo preview' : 'Edited logo preview'}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-sm font-semibold ${fullscreen ? 'text-white/70' : 'text-slate-500'}`.trim()}>
            Preview unavailable
          </div>
        )}
      </div>
    );
  }

  if (surface.type === 'business-card') {
    // Cycle through palette for each card
    return (
      <div className={`${frameClassName} flex items-center justify-center`}>
        <div className="relative flex w-full max-w-[84%] items-center justify-center overflow-visible drop-shadow-2xl">
          {previewAssetUrl ? (
            <AnimatedCardMockup backgroundColor={palette} accentColors={logoAccents}>
              <img
                src={previewAssetUrl}
                alt="Business card logo preview"
                className="relative max-h-[120px] max-w-[220px] object-contain drop-shadow-md"
                style={{ zIndex: 2 }}
              />
            </AnimatedCardMockup>
          ) : (
            <AnimatedCardMockup backgroundColor={palette} accentColors={logoAccents}>
              <div className="text-sm font-semibold text-slate-500">Preview unavailable</div>
            </AnimatedCardMockup>
          )}
        </div>
      </div>
    );
  }

  return (
    null
  );
}

export function EditorOverlays({
  editDialog,
  isMobileViewport,
  closeEditDialog,
  setEditDialog,
  handleSaveEditedText,
  colorDialogOpen,
  closePickAnotherDialog,
  backgroundColorSwatches,
  normalizeHexColor,
  dialogSelectedColor,
  setDialogBaseColor,
  setDialogSelectedColor,
  setCustomColorValue,
  dialogShadeOptions,
  customColorValue,
  handleDialogSelect,
  isValidHexColor,
  gradientDialogOpen,
  closeGradientDialog,
  gradientPreviewStyle,
  openGradientColorDialog,
  gradientStartColor,
  gradientEndColor,
  gradientType,
  setGradientType,
  gradientDirectionOptions,
  gradientDirection,
  setGradientDirection,
  gradientRadialAngle,
  setGradientRadialAngle,
  applyGradientToBackground,
  gradientColorDialogOpen,
  closeGradientColorDialog,
  gradientColorTarget,
  gradientDialogShadeOptions,
  gradientDialogSelectedColor,
  setGradientDialogBaseColor,
  setGradientDialogSelectedColor,
  setGradientCustomColorValue,
  gradientCustomColorValue,
  applyGradientDialogColor,
  assetPickerDialog,
  closeAssetPickerDialog,
  applyPresetBackgroundImage,
  previewDialogOpen,
  setPreviewDialogOpen,
  previewImageUrl,
  previewElementsImageUrl,
  setPreviewFullscreenOpen,
  previewFullscreenOpen,
}) {
  const [activePreviewSurfaceId, setActivePreviewSurfaceId] = React.useState('simple');
  const [previewElementsTone, setPreviewElementsTone] = React.useState('dark');
  const [previewNeedsContrastBoost, setPreviewNeedsContrastBoost] = React.useState(false);

  React.useEffect(() => {
    if (!previewDialogOpen && !previewFullscreenOpen) {
      setActivePreviewSurfaceId('simple');
    }
  }, [previewDialogOpen, previewFullscreenOpen]);

  React.useEffect(() => {
    const source = previewElementsImageUrl || previewImageUrl;
    if (!source || typeof window === 'undefined') {
      setPreviewElementsTone('dark');
      setPreviewNeedsContrastBoost(false);
      return undefined;
    }

    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) {
        return;
      }

      const canvas = document.createElement('canvas');
      const sampleWidth = 48;
      const sampleHeight = Math.max(1, Math.round((img.height / Math.max(1, img.width)) * sampleWidth));
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;
      const context = canvas.getContext('2d');

      if (!context) {
        setPreviewElementsTone('dark');
        setPreviewNeedsContrastBoost(false);
        return;
      }

      context.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);
      let alphaPixels = 0;
      let luminanceTotal = 0;
      let contrastAgainstLightTotal = 0;
      let contrastAgainstDarkTotal = 0;
      let brightPixelWeight = 0;

      const lightSurfaceLuminance = 0.96;
      const darkSurfaceLuminance = 0.12;

      for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3] / 255;
        if (alpha < 0.08) {
          continue;
        }

        alphaPixels += 1;
        const red = data[index] / 255;
        const green = data[index + 1] / 255;
        const blue = data[index + 2] / 255;
        const luminance = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
        luminanceTotal += luminance * alpha;

        const contrastOnLight = (Math.max(luminance, lightSurfaceLuminance) + 0.05)
          / (Math.min(luminance, lightSurfaceLuminance) + 0.05);
        const contrastOnDark = (Math.max(luminance, darkSurfaceLuminance) + 0.05)
          / (Math.min(luminance, darkSurfaceLuminance) + 0.05);
        contrastAgainstLightTotal += contrastOnLight * alpha;
        contrastAgainstDarkTotal += contrastOnDark * alpha;

        if (luminance >= 0.78) {
          brightPixelWeight += alpha;
        }
      }

      if (!alphaPixels) {
        setPreviewElementsTone('dark');
        setPreviewNeedsContrastBoost(false);
        return;
      }

      const averageLuminance = luminanceTotal / alphaPixels;
      const averageContrastOnLight = contrastAgainstLightTotal / alphaPixels;
      const averageContrastOnDark = contrastAgainstDarkTotal / alphaPixels;
      const brightCoverageRatio = brightPixelWeight / alphaPixels;
      const shouldUseDarkSurface = averageContrastOnDark > (averageContrastOnLight + 0.24)
        || brightCoverageRatio >= 0.34
        || averageLuminance > 0.72;
      const selectedContrast = shouldUseDarkSurface ? averageContrastOnDark : averageContrastOnLight;
      const needsBoost = selectedContrast < 2.35 || brightCoverageRatio > 0.5;

      setPreviewElementsTone(shouldUseDarkSurface ? 'light' : 'dark');
      setPreviewNeedsContrastBoost(needsBoost);
    };
    img.onerror = () => {
      if (!cancelled) {
        setPreviewElementsTone('dark');
        setPreviewNeedsContrastBoost(false);
      }
    };
    img.src = source;

    return () => {
      cancelled = true;
    };
  }, [previewElementsImageUrl, previewImageUrl]);

  const activePreviewSurface = React.useMemo(
    () => PREVIEW_SURFACE_OPTIONS.find((option) => option.id === activePreviewSurfaceId) || PREVIEW_SURFACE_OPTIONS[0],
    [activePreviewSurfaceId]
  );

  return (
    <>
      <style>{`
        @keyframes premiumFrameSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes premiumFrameFloat {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.004); }
          100% { transform: translateY(0px) scale(1); }
        }

        .premium-frame-spin {
          animation: premiumFrameSpin 9s linear infinite;
        }

        .premium-frame-float {
          animation: premiumFrameFloat 4.6s ease-in-out infinite;
        }
      `}</style>
      {editDialog.open && (
        <div className={`${isMobileViewport ? 'fixed' : 'absolute'} inset-0 z-[180] overflow-y-auto ${isMobileViewport ? 'bg-white p-0' : 'bg-slate-950/25 p-4 backdrop-blur-sm'}`}>
          <div className={`flex min-h-full ${isMobileViewport ? 'items-stretch justify-stretch' : 'items-center justify-center py-6'}`}>
            <div className={`w-full bg-white ${isMobileViewport ? 'flex min-h-screen max-w-none flex-col px-4 pb-6 pt-5 shadow-none' : 'max-w-sm rounded-[1.75rem] border border-slate-100 p-4 shadow-2xl sm:max-w-md sm:p-5'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Starter Colors</p>
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
                          className={`mx-auto h-8 w-8 rounded-full shadow-sm transition-all sm:h-9 sm:w-9 ${isSelected ? 'scale-105 ring-2 ring-orange-300' : ''
                            }`}
                          style={{ backgroundColor: safeColor }}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Shade Scale</p>
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
                            className={`h-8 w-8 rounded-full shadow-sm transition-all sm:h-9 sm:w-9 ${isSelected ? 'ring-2 ring-orange-300 scale-105' : ''
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
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Color Picker</p>
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
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Start</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full shadow-sm" style={{ backgroundColor: gradientStartColor }} />
                    <span className="text-sm font-bold text-slate-700">{gradientStartColor}</span>
                  </div>
                </button>
                <button
                  onClick={() => openGradientColorDialog('end')}
                  className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-2.5 text-left transition-all hover:border-orange-300"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">End</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full shadow-sm" style={{ backgroundColor: gradientEndColor }} />
                    <span className="text-sm font-bold text-slate-700">{gradientEndColor}</span>
                  </div>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Gradient Type</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setGradientType('linear')}
                      className={`brand-chip-button px-4 py-2 text-sm transition-all ${gradientType === 'linear'
                        ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                        : ''
                        }`}
                    >
                      Linear
                    </button>
                    <button
                      onClick={() => setGradientType('radial')}
                      className={`brand-chip-button px-4 py-2 text-sm transition-all ${gradientType === 'radial'
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
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Direction</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {gradientDirectionOptions.map((option) => {
                          const Icon = option.icon;
                          const isActive = gradientDirection === option.id;

                          return (
                            <button
                              key={option.id}
                              onClick={() => setGradientDirection(option.id)}
                              className={`brand-icon-button flex h-10 w-10 items-center justify-center rounded-xl transition-all ${isActive
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
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Gradient Angle</p>
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
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Starter Colors</p>
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
                          className={`mx-auto h-9 w-9 rounded-full shadow-sm transition-all sm:h-10 sm:w-10 ${isSelected ? 'scale-105 ring-2 ring-orange-300' : ''
                            }`}
                          style={{ backgroundColor: safeColor }}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Shade Scale</p>
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
                            className={`h-9 w-9 rounded-full shadow-sm transition-all sm:h-10 sm:w-10 ${isSelected ? 'ring-2 ring-orange-300 scale-105' : ''
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
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Color Picker</p>
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
                    <div className="relative aspect-[5/4] bg-slate-100">
                      <Image
                        src={imageUrl}
                        alt={`${assetPickerDialog.title} ${index + 1}`}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
                        className="object-cover"
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
            className="relative mt-8 flex w-full max-w-[min(92vw,580px)] flex-col items-center justify-center gap-2.5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-[1.1rem] bg-white/95 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.2)] backdrop-blur">
              {PREVIEW_SURFACE_OPTIONS.map((option) => {
                const isActive = option.id === activePreviewSurface.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setActivePreviewSurfaceId(option.id)}
                    className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all sm:text-xs ${isActive
                      ? 'bg-[#ff6b00] text-white shadow-[0_10px_24px_rgba(255,107,0,0.28)]'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-[#ff6b00]'
                      }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <PreviewSurfaceFrame
              surface={activePreviewSurface}
              previewImageUrl={previewImageUrl}
              previewElementsImageUrl={previewElementsImageUrl}
              previewElementsTone={previewElementsTone}
              previewNeedsContrastBoost={previewNeedsContrastBoost}
            />

            <div className="flex flex-col gap-2 rounded-full bg-white/95 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.2)] backdrop-blur sm:flex-row">
              <button
                onClick={() => setPreviewFullscreenOpen(true)}
                className="brand-button-outline flex min-w-28 items-center justify-center gap-2 rounded-2xl px-4 py-2.5"
              >
                <Maximize2 size={18} />
                Full View
              </button>
              <button
                onClick={() => setPreviewDialogOpen(false)}
                className="brand-button-outline flex min-w-28 items-center justify-center rounded-2xl px-4 py-2.5"
              >
                Close
              </button>
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
            className="relative flex h-full max-h-[96vh] w-full max-w-7xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setPreviewFullscreenOpen(false)}
              className="brand-icon-button absolute right-0 top-0 z-10 h-11 w-11 p-0"
            >
              <X size={22} />
            </button>

            <div className="flex h-full w-full items-center justify-center overflow-hidden">
              <div className="mt-8 flex h-full w-full flex-col items-center justify-center gap-2.5">
                <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-[1.1rem] bg-white/95 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.2)] backdrop-blur">
                  {PREVIEW_SURFACE_OPTIONS.map((option) => {
                    const isActive = option.id === activePreviewSurface.id;
                    return (
                      <button
                        key={`fullscreen-${option.id}`}
                        onClick={() => setActivePreviewSurfaceId(option.id)}
                        className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all sm:text-xs ${isActive
                          ? 'bg-[#ff6b00] text-white shadow-[0_10px_24px_rgba(255,107,0,0.28)]'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-[#ff6b00]'
                          }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <PreviewSurfaceFrame
                  surface={activePreviewSurface}
                  previewImageUrl={previewImageUrl}
                  previewElementsImageUrl={previewElementsImageUrl}
                  previewElementsTone={previewElementsTone}
                  previewNeedsContrastBoost={previewNeedsContrastBoost}
                  fullscreen
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
