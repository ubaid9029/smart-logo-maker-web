"use client";

import Image from 'next/image';
import React from 'react';
import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Images,
  Maximize2,
  Minimize2,
  Palette,
  RefreshCcw,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { ColorPickerField, HexColorInput } from './ColorInputs';

export function EditorSidebarContent(props) {
  const {
    activeBackgroundOpacity,
    activeBackgroundOption,
    activeBackgroundShape,
    activeBackgroundShapeColor,
    activeBackgroundShapeType,
    activeObjectPanel,
    activeTool,
    applyBackgroundColor,
    applyBackgroundOpacity,
    applyBackgroundShape,
    applyBackgroundShapeColor,
    applyDesignPalette,
    applyGradientToBackground,
    applyPresetBackgroundImage,
    backgroundColorSwatches,
    backgroundLibraryImages,
    backgroundShapeOptions,
    canEditText,
    colorSwatches,
    customColorValue,
    designPalettes,
    dialogSelectedColor,
    effectLibraryImages,
    gradientDirection,
    gradientDirectionOptions,
    gradientEndColor,
    gradientPreviewStyle,
    gradientRadialAngle,
    gradientStartColor,
    gradientType,
    handleAddPresetArt,
    handleCenter,
    handleNudge,
    handleResetSelectedTransform,
    handleRotateSelected,
    handleScaleSelected,
    handleSelectedOpacityChange,
    handleSelectedTextFontChange,
    handleSelectedTextFontSizeChange,
    isControlsContext,
    isMobileViewport,
    isValidHexColor,
    logoConfig,
    movementStep,
    normalizeHexColor,
    openBackgroundImageBrowser,
    selectedCanvasItem,
    selectedItemData,
    selectedStyle,
    setCustomColorValue,
    setDialogBaseColor,
    setDialogSelectedColor,
    setGradientDirection,
    setGradientEndColor,
    setGradientRadialAngle,
    setGradientStartColor,
    setGradientType,
    textureLibraryImages,
    updateSelectedItemStyle,
    AVAILABLE_EDITOR_FONTS,
    artLibraryImages,
  } = props;

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
          <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
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
          <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
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
          <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
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
          <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
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
          <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
            {(activeBackgroundOption === 'color' || (!isMobileViewport && !activeBackgroundOption)) && (
              isMobileViewport ? (
                <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
                  <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Background Opacity
                      </p>
                      <span className="text-xs font-bold text-slate-600">
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
                      className="mt-2 w-full accent-orange-500"
                    />
                  </div>

                  <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-slate-400">
                        <Palette size={15} />
                      </span>
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
                    <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
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
              ) : (
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                    Background Color
                  </p>
                  <div className="mt-4 flex items-center gap-3">
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
                      className="min-w-0 flex-1"
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-3">
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
                        className={`mx-auto h-10 w-10 rounded-full border-[3px] transition-all ${
                          dialogSelectedColor === normalizeHexColor(color, '#FFFFFF')
                            ? 'scale-105 ring-2 ring-orange-300 border-black'
                            : 'border-black/80'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )
            )}

            {isMobileViewport && !activeBackgroundOption && (
              <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
                <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Card Shape
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
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

                <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                  <div className="flex items-center gap-2 rounded-[1rem] border border-slate-200 bg-slate-50 p-2">
                    <ColorPickerField
                      disabled={!activeBackgroundShape}
                      value={activeBackgroundShape ? activeBackgroundShapeColor : '#FFFFFF'}
                      onChange={(event) => applyBackgroundShapeColor(event.target.value)}
                      className="h-10 w-10 rounded-[0.9rem]"
                    />
                    <HexColorInput
                      disabled={!activeBackgroundShape}
                      value={activeBackgroundShape ? activeBackgroundShapeColor : '#FFFFFF'}
                      onValidColorChange={(nextValue) => applyBackgroundShapeColor(nextValue)}
                      placeholder="#FFFFFF"
                      className="h-10 flex-1 min-w-0 border-0 bg-transparent px-2 text-base shadow-none focus:border-0 focus:bg-transparent"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                    {backgroundColorSwatches.map((color) => (
                      <button
                        key={color}
                        title={color}
                        disabled={!activeBackgroundShape}
                        onClick={() => applyBackgroundShapeColor(color)}
                        className={`h-7 w-7 shrink-0 rounded-full border-[3px] transition-all ${
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
            )}

            {isMobileViewport && activeBackgroundOption === 'gradient' && (
              <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
                <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-[0.9rem] border border-slate-200 bg-slate-50 p-2">
                      <div className="h-8 rounded-[0.7rem] border border-slate-100" style={gradientPreviewStyle} />
                    </div>
                    <div className="rounded-[0.9rem] border border-slate-200 bg-slate-50 px-2 py-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Start</p>
                      <div className="mt-1.5 flex items-center gap-1 rounded-[0.9rem] border border-slate-200 bg-white p-1">
                        <ColorPickerField
                          value={gradientStartColor}
                          onChange={(event) => setGradientStartColor(normalizeHexColor(event.target.value, '#000000'))}
                          className="h-8 w-8 rounded-[0.8rem] border-0 p-0.5"
                        />
                        <HexColorInput
                          value={gradientStartColor}
                          onValidColorChange={(nextValue) => setGradientStartColor(normalizeHexColor(nextValue, '#000000'))}
                          placeholder="#000000"
                          className="h-8 w-full min-w-0 border-0 bg-transparent px-1 text-xs shadow-none focus:border-0 focus:bg-transparent"
                        />
                      </div>
                    </div>
                    <div className="rounded-[0.9rem] border border-slate-200 bg-slate-50 px-2 py-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">End</p>
                      <div className="mt-1.5 flex items-center gap-1 rounded-[0.9rem] border border-slate-200 bg-white p-1">
                        <ColorPickerField
                          value={gradientEndColor}
                          onChange={(event) => setGradientEndColor(normalizeHexColor(event.target.value, '#64748B'))}
                          className="h-8 w-8 rounded-[0.8rem] border-0 p-0.5"
                        />
                        <HexColorInput
                          value={gradientEndColor}
                          onValidColorChange={(nextValue) => setGradientEndColor(normalizeHexColor(nextValue, '#64748B'))}
                          placeholder="#64748B"
                          className="h-8 w-full min-w-0 border-0 bg-transparent px-1 text-xs shadow-none focus:border-0 focus:bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
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
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Angle</span>
                        <span className="text-xs font-bold text-slate-700">{gradientRadialAngle} deg</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={gradientRadialAngle}
                        onChange={(event) => setGradientRadialAngle(Number(event.target.value))}
                        className="mt-1.5 w-full accent-orange-500"
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

            {!isMobileViewport && activeBackgroundOption === 'gradient' && (
              <div className="space-y-3">
                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                      Gradient
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setGradientType('linear')}
                        className={`brand-chip-button px-2.5 py-1.5 text-[10px] ${gradientType === 'linear' ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200' : ''}`}
                      >
                        Linear
                      </button>
                      <button
                        onClick={() => setGradientType('radial')}
                        className={`brand-chip-button px-2.5 py-1.5 text-[10px] ${gradientType === 'radial' ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200' : ''}`}
                      >
                        Radial
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 h-16 rounded-[1rem] border border-slate-100" style={gradientPreviewStyle} />
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                    Colors
                  </p>
                  <div className="mt-3 space-y-2.5">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Start</p>
                      <div className="mt-2 flex min-w-0 items-center gap-2">
                        <ColorPickerField
                          value={gradientStartColor}
                          onChange={(event) => setGradientStartColor(normalizeHexColor(event.target.value, '#000000'))}
                          className="h-10 w-10"
                        />
                        <HexColorInput
                          value={gradientStartColor}
                          onValidColorChange={(nextValue) => setGradientStartColor(normalizeHexColor(nextValue, '#000000'))}
                          placeholder="#000000"
                          className="h-10 min-w-0 flex-1 px-3 text-xs"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">End</p>
                      <div className="mt-2 flex min-w-0 items-center gap-2">
                        <ColorPickerField
                          value={gradientEndColor}
                          onChange={(event) => setGradientEndColor(normalizeHexColor(event.target.value, '#64748B'))}
                          className="h-10 w-10"
                        />
                        <HexColorInput
                          value={gradientEndColor}
                          onValidColorChange={(nextValue) => setGradientEndColor(normalizeHexColor(nextValue, '#64748B'))}
                          placeholder="#64748B"
                          className="h-10 min-w-0 flex-1 px-3 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                    Direction
                  </p>
                  {gradientType === 'linear' ? (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {gradientDirectionOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = gradientDirection === option.id;

                        return (
                          <button
                            key={option.id}
                            onClick={() => setGradientDirection(option.id)}
                            title={option.label}
                            className={`flex h-10 w-full items-center justify-center rounded-xl border transition-all ${isActive ? 'border-black bg-orange-50 text-orange-600 ring-2 ring-orange-200' : 'border-slate-200 bg-white text-slate-600'}`}
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-500">Angle</span>
                        <span className="text-sm font-bold text-slate-700">{gradientRadialAngle} deg</span>
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
                  className="brand-button-outline w-full px-4 py-2 text-sm"
                >
                  Apply Gradient
                </button>
              </div>
            )}            {activeBackgroundOption === 'background' && (
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  Background Library
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {backgroundLibraryImages.map((imageUrl, index) => (
                    <button
                      key={imageUrl}
                      onClick={() => applyPresetBackgroundImage(imageUrl)}
                      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100">
                        <Image src={imageUrl} alt={`Background ${index + 1}`} fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeBackgroundOption === 'texture' && (
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  Texture Library
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {textureLibraryImages.map((imageUrl, index) => (
                    <button
                      key={imageUrl}
                      onClick={() => applyPresetBackgroundImage(imageUrl)}
                      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100">
                        <Image src={imageUrl} alt={`Texture ${index + 1}`} fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
                      </div>
                    </button>
                  ))}
                </div>
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

          <div className={`space-y-3 ${!isMobileViewport && !activeBackgroundOption ? 'hidden lg:block' : 'hidden'}`}> 
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Shape Library
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {backgroundShapeOptions.map((shapeOption) => {
                  const Icon = shapeOption.icon;
                  const isActiveShape = activeBackgroundShapeType === shapeOption.id;

                  return (
                    <button
                      key={shapeOption.id}
                      onClick={() => applyBackgroundShape(shapeOption.id)}
                      className={`rounded-xl border px-2 py-2 text-left transition-all ${
                        isActiveShape
                          ? 'border-black bg-orange-50 text-orange-700 shadow-sm ring-2 ring-orange-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${
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
              <div className="mt-3 grid grid-cols-5 gap-2">
                {backgroundColorSwatches.map((color) => (
                  <button
                    key={color}
                    title={color}
                    disabled={!activeBackgroundShape}
                    onClick={() => applyBackgroundShapeColor(color)}
                    className={`mx-auto h-9 w-9 rounded-full border-[3px] transition-all ${
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
                  <div className="relative aspect-[1/1] bg-slate-100">
                    <Image src={imageUrl} alt={`Effect ${index + 1}`} fill sizes="84px" className="object-cover" />
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
                <div className="relative aspect-[4/3] bg-slate-100">
                  <Image src={imageUrl} alt={`Effect ${index + 1}`} fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
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
                <div className="relative aspect-[1/1] bg-slate-50 p-2.5">
                  <Image src={imageUrl} alt={`Art ${index + 1}`} fill sizes="84px" className="object-contain p-2.5" />
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
                <div className="relative aspect-[4/3] bg-slate-50 p-4">
                  <Image src={imageUrl} alt={`Art ${index + 1}`} fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-contain p-4" />
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

  return renderSidebarContent();
}

export function EditorMobileContextBar(props) {
  const {
    activeBackgroundOption,
    activeObjectPanel,
    activeTool,
    backgroundOptions,
    canDuplicate,
    canEditSingleText,
    handleBackgroundOptionSelect,
    handleDeleteSelected,
    handleDuplicateSelected,
    handleEditSelectedText,
    objectPanels,
    selectedCanvasItem,
    setActiveObjectPanel,
  } = props;

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

  return renderMobileContextBar();
}










