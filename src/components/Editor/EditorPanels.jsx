"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import {
  AlignCenter,
  AlignHorizontalJustifyCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bold,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Copy,
  Grid3x3,
  GripVertical,
  Italic,
  Images,
  Maximize2,
  Menu,
  Minimize2,
  Palette,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  Sparkles,
  SquareRoundCorner,
  Trash2,
} from 'lucide-react';
import { ColorPickerField, HexColorInput } from './ColorInputs';

const MOBILE_PANEL_LABELS = {
  controls: 'CONTROL',
  fonts: 'FONT',
  colors: 'COLOR',
  outlines: 'OUTLINE',
  '3D': '3D',
};

const LAYER_MOVE_ACTION_DEFINITIONS = [
  {
    key: 'forward',
    label: 'Forward',
    mobileLabel: 'FORWARD',
    direction: 'forward',
    icon: ChevronUp,
    canMove: ({ canBringForward }) => canBringForward,
  },
  {
    key: 'backward',
    label: 'Backward',
    mobileLabel: 'BACKWARD',
    direction: 'backward',
    icon: ChevronDown,
    canMove: ({ canSendBackward }) => canSendBackward,
  },
  {
    key: 'front',
    label: 'To Front',
    mobileLabel: 'TO FRONT',
    direction: 'front',
    icon: ChevronsUp,
    canMove: ({ canBringToFront }) => canBringToFront,
  },
  {
    key: 'back',
    label: 'To Back',
    mobileLabel: 'TO BACK',
    direction: 'back',
    icon: ChevronsDown,
    canMove: ({ canSendToBack }) => canSendToBack,
  },
];

function buildLayerMoveActions({
  canBringForward,
  canBringToFront,
  canSendBackward,
  canSendToBack,
  handleMoveSelectedLayers,
}) {
  const permissions = {
    canBringForward,
    canBringToFront,
    canSendBackward,
    canSendToBack,
  };

  return LAYER_MOVE_ACTION_DEFINITIONS.map((action) => ({
    ...action,
    disabled: !action.canMove(permissions),
    onClick: () => handleMoveSelectedLayers(action.direction),
  }));
}

function CompactActionButton({ disabled, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-0 rounded-xl border px-2.5 py-2 text-xs font-bold transition-all ${
        disabled
          ? 'cursor-not-allowed border-slate-100 text-slate-300'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      <span className="flex items-center justify-center gap-1.5">
        {icon}
        <span>{label}</span>
      </span>
    </button>
  );
}

function AdvancedNumberField({ disabled = false, label, onChange, value }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`h-10 rounded-xl border px-3 text-sm font-semibold outline-none transition-all ${
          disabled
            ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
            : 'border-slate-200 bg-white text-slate-700 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
        }`}
      />
    </label>
  );
}

function SegmentedToggleButton({ active, children, onClick, withIcon = false }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[1.1rem] px-4 py-3 text-sm font-black transition-all ${
        active
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-500'
      } ${withIcon ? 'flex items-center justify-center gap-2' : ''}`}
    >
      {children}
    </button>
  );
}

function mobileContextButtonClass(isActive = false, extraClass = '') {
  return `flex h-8 shrink-0 items-center justify-center rounded-md border px-2 text-[10px] font-black transition-all ${
    isActive
      ? 'border-orange-200 bg-orange-50 text-orange-600 ring-1 ring-orange-200'
      : 'border-slate-200 bg-white text-slate-700'
  } ${extraClass}`.trim();
}

function LayerPanelRow({
  draggedLayerKey,
  handleReorderLayerFromPanel,
  handleSelectLayerFromPanel,
  layer,
  layerView,
  selectedLayerKey,
  setDraggedLayerKey,
  visibleLayerItems,
}) {
  return (
    <button
      key={layer.key}
      type="button"
      draggable={visibleLayerItems.length > 1}
      onClick={() => handleSelectLayerFromPanel(layer.key)}
      onDragStart={() => {
        if (visibleLayerItems.length > 1) {
          setDraggedLayerKey(layer.key);
        }
      }}
      onDragOver={(event) => {
        if (visibleLayerItems.length > 1) {
          event.preventDefault();
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (draggedLayerKey && visibleLayerItems.length > 1) {
          handleReorderLayerFromPanel(
            draggedLayerKey,
            layer.key,
            visibleLayerItems.map((entry) => entry.key)
          );
        }
        setDraggedLayerKey(null);
      }}
      onDragEnd={() => setDraggedLayerKey(null)}
      className={`flex w-full items-center gap-3 rounded-[1.45rem] border px-4 py-3 text-left transition-all ${
        layer.isSelected
          ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-100'
          : draggedLayerKey === layer.key
            ? 'border-slate-300 bg-slate-100'
            : 'border-slate-200 bg-slate-50 hover:bg-white'
      }`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white ${
        visibleLayerItems.length > 1 ? 'text-slate-500' : 'text-slate-300'
      }`}>
        <GripVertical size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-slate-800">{layer.label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500">{layer.type}</span>
          {layer.isBackground ? <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] text-sky-700">Background</span> : null}
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500">{layer.orderLabel}</span>
          {layer.key === selectedLayerKey ? <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-orange-600">Selected</span> : null}
        </div>
      </div>
    </button>
  );
}

export function EditorSidebarContent(props) {
  const {
    activeBackgroundOpacity,
    activeBackgroundOption,
    activeBackgroundShape,
    activeBackgroundShapeColor,
    activeObjectPanel,
    activeTool,
    applyBackgroundColor,
    applyBackgroundOpacity,
    applyBackgroundShape,
    applyBackgroundShapeColor,
    applyDesignPalette,
    applyGradientToBackground,
    applyPresetBackgroundImage,
    backgroundLayerCount,
    backgroundColorSwatches,
    backgroundLibraryImages,
    backgroundShapeOptions,
    canBringForward,
    canBringToFront,
    canEditText,
    canSendBackward,
    canSendToBack,
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
    handleAddShapeElement,
    handleBackgroundOptionSelect,
    handleDeleteSelected,
    handleDuplicateSelected,
    handleCenter,
    handleMoveSelectedLayers,
    handleNudge,
    handleResetSelectedTransform,
    handleRotateSelected,
    handleScaleSelected,
    handleSelectedOpacityChange,
    handleSelectedTextFontChange,
    handleSelectedTextFontStyleChange,
    isControlsContext,
    canDuplicate,
    canSetSelectedShapeAsBackground,
    isSelectedItemBackground,
    isMobileViewport,
    isValidHexColor,
    layerPanelItems,
    logoConfig,
    movementStep,
    normalizeHexColor,
    openBackgroundImageBrowser,
    selectedCanvasItem,
    selectedAdvancedMetrics,
    selectedItemData,
    selectedLayerKey,
    selectedStyle,
    handleReorderLayerFromPanel,
    handleSelectLayerFromPanel,
    handleSingleSelectedNumericChange,
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
  const [positionView, setPositionView] = useState('arrange');
  const [layerView, setLayerView] = useState('all');
  const [draggedLayerKey, setDraggedLayerKey] = useState(null);
  const visibleLayerItems = (layerPanelItems || []).filter((layer) => (
    layerView === 'overlapping' ? layer.overlapsSelected : true
  ));
  const selectedItemIsShape = selectedItemData?.kind === 'shape' || selectedItemData?.type === 'shape';
  const canRoundSelectedShape = Boolean(
    selectedItemIsShape &&
    ['rectangle', 'full'].includes(selectedItemData?.shapeType || 'rectangle')
  );
  const selectedCornerRadius = Math.round(Number(selectedStyle.cornerRadius ?? 28));
  const selectedFontFamily = selectedItemData?.fontFamily || logoConfig.fontFamily || 'Arial';
  const selectedFontStyle = String(selectedItemData?.fontStyle || 'normal').toLowerCase();
  const isGradientBackgroundTab = activeBackgroundOption === 'gradient';
  const fontStyleOptions = [
    { id: 'normal', label: 'Regular' },
    { id: 'bold', label: 'Bold' },
    { id: 'italic', label: 'Italic' },
    { id: 'bold italic', label: 'Bold Italic' },
  ];
  const layerMoveActions = buildLayerMoveActions({
    canBringForward,
    canBringToFront,
    canSendBackward,
    canSendToBack,
    handleMoveSelectedLayers,
  });
  const desktopArrangeActions = layerMoveActions.map((action) => {
    const Icon = action.icon;

    return {
      ...action,
      icon: <Icon size={16} />,
    };
  });
  const arrangePrimaryFields = [
    { key: 'width', label: 'Width', value: selectedAdvancedMetrics?.width ?? 0 },
    { key: 'height', label: 'Height', value: selectedAdvancedMetrics?.height ?? 0 },
  ];
  const arrangeSecondaryFields = [
    { key: 'x', label: 'X', value: selectedAdvancedMetrics?.x ?? 0 },
    { key: 'y', label: 'Y', value: selectedAdvancedMetrics?.y ?? 0 },
    { key: 'rotation', label: 'Rotate', value: selectedAdvancedMetrics?.rotation ?? 0 },
  ];
  const applySelectedFillColor = (nextColor) => {
    const safeColor = normalizeHexColor(nextColor, '#111827');
    updateSelectedItemStyle(
      selectedItemIsShape
        ? { fillColor: safeColor, outlineColor: safeColor }
        : { fillColor: safeColor }
    );
  };
  const renderIconClusterButton = (label, icon, onClick, tone = 'default') => (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-[62px] w-[86px] items-center justify-center rounded-[1.35rem] transition-all ${
        tone === 'accent'
          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
          : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80'
      }`}
    >
      {icon}
    </button>
  );

  const renderSidebarContent = () => {
    if (isControlsContext && selectedItemData) {
      if (isMobileViewport) {
        if (activeObjectPanel === 'positioning') {
          return (
            <div className="space-y-1">
              <div className="rounded-[0.95rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                  Layer
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <button
                    onClick={() => handleMoveSelectedLayers('back')}
                    disabled={!canSendToBack}
                    className={`rounded-[0.85rem] border px-2 py-2 text-[9px] font-black uppercase ${
                      !canSendToBack ? 'cursor-not-allowed border-slate-100 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    To Back
                  </button>
                  <button
                    onClick={() => handleMoveSelectedLayers('backward')}
                    disabled={!canSendBackward}
                    className={`rounded-[0.85rem] border px-2 py-2 text-[9px] font-black uppercase ${
                      !canSendBackward ? 'cursor-not-allowed border-slate-100 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Backward
                  </button>
                  <button
                    onClick={() => handleMoveSelectedLayers('forward')}
                    disabled={!canBringForward}
                    className={`rounded-[0.85rem] border px-2 py-2 text-[9px] font-black uppercase ${
                      !canBringForward ? 'cursor-not-allowed border-slate-100 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Forward
                  </button>
                  <button
                    onClick={() => handleMoveSelectedLayers('front')}
                    disabled={!canBringToFront}
                    className={`rounded-[0.85rem] border px-2 py-2 text-[9px] font-black uppercase ${
                      !canBringToFront ? 'cursor-not-allowed border-slate-100 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    To Front
                  </button>
                </div>
              </div>
            </div>
          );
        }

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
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {activeObjectPanel === 'controls' ? (
            <div className="mx-auto mt-1 max-w-[290px] space-y-3">
              <div className="rounded-[1.22rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Position</p>
                <div className="mt-2.5 space-y-2">
                  <div className="flex justify-center">
                    {renderIconClusterButton('Top', <ArrowUp size={22} />, () => handleNudge(0, -movementStep))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {renderIconClusterButton('Left', <ArrowLeft size={22} />, () => handleNudge(-movementStep, 0))}
                    {renderIconClusterButton('Center X', <AlignHorizontalJustifyCenter size={22} />, () => handleCenter('x'), 'accent')}
                    {renderIconClusterButton('Right', <ArrowRight size={22} />, () => handleNudge(movementStep, 0))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div />
                    {renderIconClusterButton('Bottom', <ArrowDown size={22} />, () => handleNudge(0, movementStep))}
                    {renderIconClusterButton('Center Y', <AlignVerticalJustifyCenter size={22} />, () => handleCenter('y'), 'accent')}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.22rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Transform</p>
                <div className="mt-2.5 space-y-2">
                  <div className="flex justify-center">
                    {renderIconClusterButton('Zoom In', <Maximize2 size={22} />, () => handleScaleSelected((Math.abs(selectedItemData.transform?.scaleX ?? 1) || 1) + 0.1))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {renderIconClusterButton('Rotate -', <RotateCcw size={22} />, () => handleRotateSelected(Number(selectedItemData.transform?.rotation ?? 0) - 15))}
                    {renderIconClusterButton('Reset', <RefreshCcw size={22} />, handleResetSelectedTransform, 'accent')}
                    {renderIconClusterButton('Rotate +', <RotateCw size={22} />, () => handleRotateSelected(Number(selectedItemData.transform?.rotation ?? 0) + 15))}
                  </div>
                  <div className="flex justify-center">
                    {renderIconClusterButton('Zoom Out', <Minimize2 size={22} />, () => handleScaleSelected((Math.abs(selectedItemData.transform?.scaleX ?? 1) || 1) - 0.1))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-1 space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 p-1">
                <SegmentedToggleButton active={positionView === 'arrange'} onClick={() => setPositionView('arrange')}>
                  Arrange
                </SegmentedToggleButton>
                <SegmentedToggleButton active={positionView === 'layers'} onClick={() => setPositionView('layers')}>
                  Layers
                </SegmentedToggleButton>
              </div>
              {positionView === 'arrange' ? (
                <div className="space-y-3">
                  <div className="rounded-[1.05rem] border border-slate-100 bg-white p-2 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Arrange</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {desktopArrangeActions.map((action) => (
                        <CompactActionButton
                          key={action.key}
                          disabled={action.disabled}
                          icon={action.icon}
                          label={action.label}
                          onClick={action.onClick}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.05rem] border border-slate-100 bg-slate-50/70 p-2 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Advanced</p>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {arrangePrimaryFields.map((field) => (
                          <AdvancedNumberField
                            key={field.key}
                            disabled={field.disabled}
                            label={field.label}
                            value={field.value}
                            onChange={(event) => handleSingleSelectedNumericChange(field.key, event.target.value)}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {arrangeSecondaryFields.slice(0, 2).map((field) => (
                          <AdvancedNumberField
                            key={field.key}
                            label={field.label}
                            value={field.value}
                            onChange={(event) => handleSingleSelectedNumericChange(field.key, event.target.value)}
                          />
                        ))}
                      </div>
                      <div className="mx-auto max-w-[148px]">
                        <AdvancedNumberField
                          key={arrangeSecondaryFields[2].key}
                          label={arrangeSecondaryFields[2].label}
                          value={arrangeSecondaryFields[2].value}
                          onChange={(event) => handleSingleSelectedNumericChange(arrangeSecondaryFields[2].key, event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-[1.05rem] border border-slate-100 bg-white p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 p-1">
                      <SegmentedToggleButton active={layerView === 'all'} onClick={() => setLayerView('all')}>
                        All
                      </SegmentedToggleButton>
                      <SegmentedToggleButton active={layerView === 'overlapping'} onClick={() => setLayerView('overlapping')}>
                        Overlapping
                      </SegmentedToggleButton>
                    </div>
                    <p className="px-1 text-[11px] font-semibold text-slate-500">
                      {layerView === 'overlapping'
                        ? 'Showing layers that overlap with the selected item.'
                        : 'Drag any row to reorder your full layer stack.'}
                    </p>
                    <div className="mt-2 space-y-2">
                      {visibleLayerItems.map((layer) => (
                        <LayerPanelRow
                          key={layer.key}
                          draggedLayerKey={draggedLayerKey}
                          handleReorderLayerFromPanel={handleReorderLayerFromPanel}
                          handleSelectLayerFromPanel={handleSelectLayerFromPanel}
                          layer={layer}
                          layerView={layerView}
                          selectedLayerKey={selectedLayerKey}
                          setDraggedLayerKey={setDraggedLayerKey}
                          visibleLayerItems={visibleLayerItems}
                        />
                      ))}
                      {!visibleLayerItems.length ? (
                        <div className="rounded-[1.45rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                          {layerView === 'overlapping'
                            ? 'No overlapping layers found for this selection.'
                            : 'No layers are available for this selection yet.'}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );

    }

    if (selectedCanvasItem && activeObjectPanel === 'colors' && selectedItemData) {
      if (isMobileViewport) {
        return (
          <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
            <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Fill Color
              </p>
              <div className="mt-2 flex items-center gap-2">
                <ColorPickerField
                  value={isValidHexColor(selectedStyle.fillColor) ? selectedStyle.fillColor : normalizeHexColor(selectedStyle.fillColor, '#111827')}
                  onChange={(event) => applySelectedFillColor(event.target.value)}
                />
                <HexColorInput
                  value={normalizeHexColor(selectedStyle.fillColor || '#111827', '#111827')}
                  onValidColorChange={applySelectedFillColor}
                  placeholder="#111827"
                />
              </div>
              <div className="mt-2 flex items-center gap-0.5 overflow-x-auto pb-1">
                {colorSwatches.map((color) => (
                  <button
                    key={color}
                    title={color}
                    onClick={() => applySelectedFillColor(color)}
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
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
              Fill Color
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ColorPickerField
                value={isValidHexColor(selectedStyle.fillColor) ? selectedStyle.fillColor : normalizeHexColor(selectedStyle.fillColor, '#111827')}
                onChange={(event) => applySelectedFillColor(event.target.value)}
              />
              <HexColorInput
                value={normalizeHexColor(selectedStyle.fillColor || '#111827', '#111827')}
                onValidColorChange={applySelectedFillColor}
                placeholder="#111827"
              />
            </div>
            <div className="mt-4 grid grid-cols-6 gap-1">
              {colorSwatches.map((color) => (
                <button
                  key={color}
                  title={color}
                  onClick={() => applySelectedFillColor(color)}
                  className={`h-10 w-10 rounded-full border-[3px] transition-all ${
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
              {fontStyleOptions.map((styleOption) => {
                const isActiveStyle = selectedFontStyle === styleOption.id;

                return (
                  <button
                    key={styleOption.id}
                    onClick={() => handleSelectedTextFontStyleChange(styleOption.id)}
                    className={`shrink-0 rounded-[1rem] border px-3 py-2 text-xs font-black transition-all ${
                      isActiveStyle
                        ? 'border-black bg-orange-50 text-orange-600 shadow-sm ring-2 ring-orange-200'
                        : 'border-slate-100 bg-white text-slate-700 hover:border-orange-300 hover:shadow-sm'
                    }`}
                  >
                    {styleOption.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
              {AVAILABLE_EDITOR_FONTS.map((fontName) => {
                const isActiveFont = selectedFontFamily === fontName;

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
        <div className="grid grid-cols-1 gap-3">
            {AVAILABLE_EDITOR_FONTS.map((fontName) => {
              const isActiveFont = selectedFontFamily === fontName;

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
      );
    }

    if (selectedCanvasItem && activeObjectPanel === 'opacity' && selectedItemData) {
      if (isMobileViewport) {
        return (
          <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}>
            <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
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
                className="mt-2 w-full accent-orange-500"
              />
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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

    if (selectedCanvasItem && activeObjectPanel === 'radius' && selectedItemData && canRoundSelectedShape) {
      if (isMobileViewport) {
        return (
          <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}>
            <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Corner Radius
                </p>
                <span className="text-xs font-bold text-slate-600">{selectedCornerRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="140"
                step="1"
                value={selectedCornerRadius}
                onChange={(event) => updateSelectedItemStyle({ cornerRadius: Number(event.target.value) })}
                className="mt-2 w-full accent-orange-500"
              />
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                Corner Radius
              </p>
              <span className="text-sm font-bold text-slate-600">{selectedCornerRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="140"
              step="1"
              value={selectedCornerRadius}
              onChange={(event) => updateSelectedItemStyle({ cornerRadius: Number(event.target.value) })}
              className="mt-4 w-full accent-orange-500"
            />
          </div>
        </div>
      );
    }

    if (selectedCanvasItem && activeObjectPanel === 'outlines' && selectedItemData) {
      if (isMobileViewport) {
        return (
          <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
            <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm"> 
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Outline Color
              </p>
              <div className="mt-2 flex items-start gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <ColorPickerField
                    value={isValidHexColor(selectedStyle.outlineColor) ? selectedStyle.outlineColor : normalizeHexColor(selectedStyle.outlineColor, '#111827')}
                    onChange={(event) => updateSelectedItemStyle({ outlineColor: normalizeHexColor(event.target.value, '#111827') })}
                    className="h-10 w-10 rounded-[0.85rem] p-1"
                  />
                  <HexColorInput
                    value={normalizeHexColor(selectedStyle.outlineColor || '#111827', '#111827')}
                    onValidColorChange={(nextValue) => updateSelectedItemStyle({ outlineColor: normalizeHexColor(nextValue, '#111827') })}
                    placeholder="#111827"
                    className="h-10 min-w-0 w-[124px] shrink-0 rounded-[1rem] px-3 text-xs"
                  />
                </div>
                <div className="w-[216px] shrink-0 rounded-[0.8rem] border border-slate-100 bg-slate-50/80 px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Thick
                    </p>
                    <span className="text-[10px] font-bold text-slate-600">{selectedStyle.outlineWidth ?? 0}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={selectedStyle.outlineWidth ?? 0}
                    onChange={(event) => updateSelectedItemStyle({ outlineWidth: Number(event.target.value) })}
                    className="mt-1 w-full accent-orange-500"
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-0.5 overflow-x-auto pb-1">
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
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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
            <div className="mt-4 grid grid-cols-6 gap-1">
              {colorSwatches.map((color) => (
                <button
                  key={color}
                  title={color}
                  onClick={() => updateSelectedItemStyle({ outlineColor: color })}
                  className={`h-10 w-10 rounded-full border-[3px] transition-all ${
                    selectedStyle.outlineColor === color ? 'scale-105 ring-2 ring-orange-300 border-black' : 'border-black/80'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
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
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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
            {activeBackgroundOption === 'color' && (
              isMobileViewport ? (
                <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
                  <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-slate-500">
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
                    <div className="mt-2 flex items-center gap-0.5 overflow-x-auto pb-1">
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
                <div className="space-y-3">
                  <div className="rounded-3xl border border-slate-100 bg-white p-2.5 shadow-sm">
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 p-1">
                      <SegmentedToggleButton active={!isGradientBackgroundTab} onClick={() => handleBackgroundOptionSelect('color')}>
                        Color
                      </SegmentedToggleButton>
                      <SegmentedToggleButton active={isGradientBackgroundTab} onClick={() => handleBackgroundOptionSelect('gradient')}>
                        Gradient
                      </SegmentedToggleButton>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Background Layers</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Select any element, then use `Set As Bg` to stack multiple background layers.
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-600">
                        {backgroundLayerCount}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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
                  <div className="mt-4 grid grid-cols-6 gap-1">
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
                        className={`h-10 w-10 rounded-full border-[3px] transition-all ${
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
              )
            )}

            {isMobileViewport && !activeBackgroundOption && (
              <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
                <div className="rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Shape Elements
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                    Shape add hogi as movable element. Select karke `Set As Bg` se multiple background layers bana sakte ho.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                    {backgroundShapeOptions.map((shapeOption) => {
                      const Icon = shapeOption.icon;
                      const isRemoveAction = shapeOption.id === 'none';
                      const isActiveShape = isRemoveAction && !activeBackgroundShape;

                      return (
                        <button
                          key={shapeOption.id}
                          onClick={() => (
                            isRemoveAction
                              ? applyBackgroundShape('none')
                              : handleAddShapeElement(shapeOption.id)
                          )}
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

              </div>
            )}

            {isMobileViewport && activeBackgroundOption === 'gradient' && (
              <div className={`space-y-2 ${!isMobileViewport && activeBackgroundOption ? 'block' : 'lg:hidden'}`}> 
                <div className="flex items-stretch gap-1">
                  <div className="min-w-0 flex-[1.35] rounded-[0.9rem] border border-slate-100 bg-white p-1.5 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="flex min-w-0 flex-[1.05] rounded-[0.75rem] border border-slate-200 bg-slate-50 p-1.5">
                        <div className="h-7 w-full rounded-[0.65rem] border border-slate-100" style={gradientPreviewStyle} />
                      </div>
                      <div className="min-w-0 flex-1 rounded-[0.6rem] border border-slate-200 bg-slate-50 px-1 py-1">
                        <div className="flex items-center justify-center rounded-[0.55rem] border border-slate-200 bg-white px-1 py-1">
                          <ColorPickerField
                            value={gradientStartColor}
                            onChange={(event) => setGradientStartColor(normalizeHexColor(event.target.value, '#000000'))}
                            className="h-5 w-5 rounded-[0.45rem] border-0 p-0.5"
                          />
                        </div>
                        <p className="mt-1 truncate px-0.5 text-center text-[9px] font-bold text-slate-600">{gradientStartColor}</p>
                      </div>
                      <div className="min-w-0 flex-1 rounded-[0.6rem] border border-slate-200 bg-slate-50 px-1 py-1">
                        <div className="flex items-center justify-center rounded-[0.55rem] border border-slate-200 bg-white px-1 py-1">
                          <ColorPickerField
                            value={gradientEndColor}
                            onChange={(event) => setGradientEndColor(normalizeHexColor(event.target.value, '#64748B'))}
                            className="h-5 w-5 rounded-[0.45rem] border-0 p-0.5"
                          />
                        </div>
                        <p className="mt-1 truncate px-0.5 text-center text-[9px] font-bold text-slate-600">{gradientEndColor}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[122px] shrink-0 flex-col justify-center rounded-[0.95rem] border border-slate-100 bg-white p-2 shadow-sm">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setGradientType('linear')}
                        className={`brand-chip-button rounded-lg px-2 py-1.5 text-[9px] ${gradientType === 'linear' ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200' : ''}`}
                      >
                        Linear
                      </button>
                      <button
                        onClick={() => setGradientType('radial')}
                        className={`brand-chip-button rounded-lg px-2 py-1.5 text-[9px] ${gradientType === 'radial' ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200' : ''}`}
                      >
                        Radial
                      </button>
                    </div>

                    {gradientType === 'linear' ? (
                      <div className="mt-2 flex items-center gap-1 overflow-x-auto">
                        {gradientDirectionOptions.map((option) => {
                          const Icon = option.icon;
                          const isActive = gradientDirection === option.id;

                          return (
                            <button
                              key={option.id}
                              onClick={() => setGradientDirection(option.id)}
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.45rem] border transition-all ${
                                isActive
                                  ? 'border-black bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              <Icon size={13} />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Angle</span>
                          <span className="text-[10px] font-bold text-slate-700">{gradientRadialAngle} deg</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={gradientRadialAngle}
                          onChange={(event) => setGradientRadialAngle(Number(event.target.value))}
                          className="mt-1 w-full accent-orange-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={applyGradientToBackground}
                  className="brand-button-outline w-full px-4 py-2 text-sm"
                >
                  Apply Gradient
                </button>
              </div>
            )}

            {!isMobileViewport && activeBackgroundOption === 'gradient' && (
              <div className="space-y-3">
                <div className="rounded-3xl border border-slate-100 bg-white p-2.5 shadow-sm">
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 p-1">
                    <SegmentedToggleButton active={!isGradientBackgroundTab} onClick={() => handleBackgroundOptionSelect('color')}>
                      Color
                    </SegmentedToggleButton>
                    <SegmentedToggleButton active={isGradientBackgroundTab} onClick={() => handleBackgroundOptionSelect('gradient')}>
                      Gradient
                    </SegmentedToggleButton>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                    Colors
                  </p>
                  <div className="mt-3 space-y-2.5">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Start</p>
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
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">End</p>
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
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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
            )}

            {isMobileViewport && activeBackgroundOption === 'background' && (
              <div className="flex items-center gap-2 overflow-x-auto rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                {backgroundLibraryImages.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    onClick={() => applyPresetBackgroundImage(imageUrl)}
                    className="w-[132px] shrink-0 overflow-hidden rounded-[0.95rem] border border-slate-100 bg-white shadow-sm transition-all hover:border-orange-300"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <Image src={imageUrl} alt={`Background ${index + 1}`} fill sizes="132px" className="object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isMobileViewport && activeBackgroundOption === 'background' && (
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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

            {isMobileViewport && activeBackgroundOption === 'texture' && (
              <div className="flex items-center gap-2 overflow-x-auto rounded-[1rem] border border-slate-100 bg-white p-2.5 shadow-sm">
                {textureLibraryImages.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    onClick={() => applyPresetBackgroundImage(imageUrl)}
                    className="w-[132px] shrink-0 overflow-hidden rounded-[0.95rem] border border-slate-100 bg-white shadow-sm transition-all hover:border-orange-300"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <Image src={imageUrl} alt={`Texture ${index + 1}`} fill sizes="132px" className="object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isMobileViewport && activeBackgroundOption === 'texture' && (
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                  Shape Elements
                </p>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Kisi bhi shape par click karo aur woh canvas par movable element ki tarah add ho jayegi.
                  Usay select karke `Set As Bg` se multiple background layers stack kar sakte ho.
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {backgroundShapeOptions.map((shapeOption) => {
                    const Icon = shapeOption.icon;
                    const isRemoveAction = shapeOption.id === 'none';
                    const isActiveShape = isRemoveAction && !activeBackgroundShape;

                    return (
                      <button
                        key={shapeOption.id}
                        onClick={() => (
                          isRemoveAction
                            ? applyBackgroundShape('none')
                            : handleAddShapeElement(shapeOption.id)
                        )}
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
    canEditText,
    canDuplicate,
    canBringForward,
    canBringToFront,
    canRoundSelectedShape,
    canSendBackward,
    canSendToBack,
    canSetSelectedShapeAsBackground,
    handleBackgroundOptionSelect,
    handleDeleteSelected,
    handleDuplicateSelected,
    handleMoveSelectedLayers,
    handleSelectedTextAlignChange,
    handleSelectedTextFontSizeChange,
    handleToggleSelectedTextFontStyle,
    handleToggleSelectedItemBackground,
    handleSetSelectedShapeAsBackground,
    isBoldActive,
    isItalicActive,
    isRasterImageSelection,
    isSelectedItemBackground,
    isStylableLogoSelection,
    objectPanels,
    selectedCanvasItem,
    selectedItemData,
    selectedStyle,
    selectedTextAlign,
    selectedTextColor,
    selectedTextFontFamily,
    selectedTextFontSize,
    setActiveObjectPanel,
    hasActiveBackgroundShape,
  } = props;

  const renderMobileContextBar = () => {
    if (selectedCanvasItem) {
      const nextTextAlign = selectedTextAlign === 'left'
        ? 'center'
        : selectedTextAlign === 'center'
          ? 'right'
          : 'left';
      const CurrentAlignIcon = selectedTextAlign === 'left'
        ? AlignLeft
        : selectedTextAlign === 'right'
          ? AlignRight
          : AlignCenter;
      const safeFillColor = selectedTextColor || selectedStyle?.fillColor || '#111827';

      return (
        <div className="mb-1.5 overflow-x-auto rounded-[0.9rem] border border-slate-100 bg-white p-1.5 shadow-sm">
          <div className="flex min-w-max items-center gap-1 text-slate-700">
            {canEditText && selectedItemData ? (
              <>
                <button
                  onClick={() => setActiveObjectPanel('fonts')}
                  className={mobileContextButtonClass(activeObjectPanel === 'fonts', 'gap-1 font-bold')}
                >
                  <span className="max-w-[84px] truncate" style={{ fontFamily: selectedTextFontFamily }}>
                    {selectedTextFontFamily}
                  </span>
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={() => handleSelectedTextFontSizeChange(selectedTextFontSize - 2)}
                  className={mobileContextButtonClass(false, 'w-8 px-0 text-[11px]')}
                >
                  -
                </button>
                <button
                  onClick={() => setActiveObjectPanel('fonts')}
                  className={mobileContextButtonClass(activeObjectPanel === 'fonts', 'w-8 px-0')}
                >
                  {selectedTextFontSize}
                </button>
                <button
                  onClick={() => handleSelectedTextFontSizeChange(selectedTextFontSize + 2)}
                  className={mobileContextButtonClass(false, 'w-8 px-0 text-[11px]')}
                >
                  +
                </button>
                <button
                  onClick={() => setActiveObjectPanel('colors')}
                  className={mobileContextButtonClass(activeObjectPanel === 'colors', 'w-8 px-0')}
                >
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300" style={{ backgroundColor: safeFillColor }} />
                </button>
                <button
                  onClick={() => handleToggleSelectedTextFontStyle('bold')}
                  className={mobileContextButtonClass(isBoldActive, 'w-8 px-0')}
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={() => handleToggleSelectedTextFontStyle('italic')}
                  className={mobileContextButtonClass(isItalicActive, 'w-8 px-0')}
                >
                  <Italic size={14} />
                </button>
                <button
                  onClick={() => handleSelectedTextAlignChange(nextTextAlign)}
                  className={mobileContextButtonClass(false, 'w-8 px-0')}
                >
                  <CurrentAlignIcon size={14} />
                </button>
                <button
                  onClick={() => setActiveObjectPanel('opacity')}
                  className={mobileContextButtonClass(activeObjectPanel === 'opacity', 'w-8 px-0')}
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => setActiveObjectPanel('3D')}
                  className={mobileContextButtonClass(activeObjectPanel === '3D', 'min-w-[72px] gap-1')}
                >
                  <Sparkles size={12} />
                  <span>3D</span>
                </button>
                <button
                  onClick={() => setActiveObjectPanel('controls')}
                  className={mobileContextButtonClass(activeObjectPanel === 'controls', 'min-w-[72px]')}
                >
                  Controls
                </button>
                <button
                  onClick={() => setActiveObjectPanel('positioning')}
                  className={mobileContextButtonClass(activeObjectPanel === 'positioning', 'min-w-[72px]')}
                >
                  Positioning
                </button>
                {canDuplicate ? (
                  <button onClick={handleDuplicateSelected} className={mobileContextButtonClass(false, 'w-8 gap-0 px-0')}>
                    <Copy size={13} />
                  </button>
                ) : null}
                <button onClick={handleDeleteSelected} className={mobileContextButtonClass(false, 'w-8 gap-0 px-0')}>
                  <Trash2 size={13} />
                </button>
              </>
            ) : isStylableLogoSelection ? (
              <>
                <button
                  onClick={() => setActiveObjectPanel('colors')}
                  className={mobileContextButtonClass(activeObjectPanel === 'colors', 'w-8 px-0')}
                >
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300" style={{ backgroundColor: safeFillColor }} />
                </button>
                <button
                  onClick={() => setActiveObjectPanel('outlines')}
                  className={mobileContextButtonClass(activeObjectPanel === 'outlines', 'w-8 px-0')}
                >
                  <Menu size={14} />
                </button>
                {canRoundSelectedShape ? (
                  <button
                    onClick={() => setActiveObjectPanel('radius')}
                    className={mobileContextButtonClass(activeObjectPanel === 'radius', 'w-8 px-0')}
                  >
                    <SquareRoundCorner size={14} />
                  </button>
                ) : null}
                <button
                  onClick={() => setActiveObjectPanel('opacity')}
                  className={mobileContextButtonClass(activeObjectPanel === 'opacity', 'w-8 px-0')}
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => setActiveObjectPanel('3D')}
                  className={mobileContextButtonClass(activeObjectPanel === '3D', 'min-w-[72px] gap-1')}
                >
                  <Sparkles size={12} />
                  <span>3D</span>
                </button>
                <button
                  onClick={() => setActiveObjectPanel('controls')}
                  className={mobileContextButtonClass(activeObjectPanel === 'controls', 'min-w-[72px]')}
                >
                  Controls
                </button>
                <button
                  onClick={() => setActiveObjectPanel('positioning')}
                  className={mobileContextButtonClass(activeObjectPanel === 'positioning', 'min-w-[72px]')}
                >
                  Positioning
                </button>
                {canSetSelectedShapeAsBackground ? (
                  <button
                    onClick={() => handleToggleSelectedItemBackground(!isSelectedItemBackground)}
                    className={mobileContextButtonClass(isSelectedItemBackground, 'min-w-[72px]')}
                  >
                    Bg
                  </button>
                ) : null}
                {canDuplicate ? (
                  <button onClick={handleDuplicateSelected} className={mobileContextButtonClass(false, 'w-8 gap-0 px-0')}>
                    <Copy size={13} />
                  </button>
                ) : null}
                <button onClick={handleDeleteSelected} className={mobileContextButtonClass(false, 'w-8 gap-0 px-0')}>
                  <Trash2 size={13} />
                </button>
              </>
            ) : isRasterImageSelection ? (
              <>
                <button
                  onClick={() => setActiveObjectPanel('opacity')}
                  className={mobileContextButtonClass(activeObjectPanel === 'opacity', 'w-8 px-0')}
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => setActiveObjectPanel('controls')}
                  className={mobileContextButtonClass(activeObjectPanel === 'controls', 'min-w-[72px]')}
                >
                  Controls
                </button>
                <button
                  onClick={() => setActiveObjectPanel('positioning')}
                  className={mobileContextButtonClass(activeObjectPanel === 'positioning', 'min-w-[72px]')}
                >
                  Positioning
                </button>
                {canSetSelectedShapeAsBackground ? (
                  <button
                    onClick={() => handleToggleSelectedItemBackground(!isSelectedItemBackground)}
                    className={mobileContextButtonClass(isSelectedItemBackground, 'min-w-[72px]')}
                  >
                    Bg
                  </button>
                ) : null}
                {canDuplicate ? (
                  <button onClick={handleDuplicateSelected} className={mobileContextButtonClass(false, 'w-8 gap-0 px-0')}>
                    <Copy size={13} />
                  </button>
                ) : null}
                <button onClick={handleDeleteSelected} className={mobileContextButtonClass(false, 'w-8 gap-0 px-0')}>
                  <Trash2 size={13} />
                </button>
              </>
            ) : (
              objectPanels.map((panel) => (
                <button
                  key={panel}
                  onClick={() => setActiveObjectPanel(panel)}
                  className={mobileContextButtonClass(activeObjectPanel === panel, 'min-w-[72px]')}
                >
                  {MOBILE_PANEL_LABELS[panel] || panel.toUpperCase()}
                </button>
              ))
            )}
          </div>
        </div>
      );
    }

    if (activeTool === 'background') {
      const mobileBackgroundOptions = [
        { id: 'color', label: 'Color', icon: Palette },
        { id: 'gradient', label: 'Gradient', icon: Sparkles },
        ...backgroundOptions.slice(1),
      ];

      return (
        <div className="mb-2 flex min-w-max items-center gap-1.5 overflow-x-auto pb-1">
          {mobileBackgroundOptions.map((option) => {
            const Icon = option.icon;
            const isActiveOption = activeBackgroundOption === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleBackgroundOptionSelect(option.id)}
                className={`brand-chip-button flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 text-[9px] transition-all ${
                  isActiveOption ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200' : ''
                }`}
              >
                <Icon size={11} />
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










