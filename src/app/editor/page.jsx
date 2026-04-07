"use client";
import React, { Fragment, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import DownloadDialog from '../../components/DownloadDialog';
import FloatingNotice from '../../components/MainComponents/FloatingNotice';
import {
  DesktopActionDock,
  DesktopToolRail,
  MobileBottomPanel,
  MobileHeader,
} from '../../components/Editor/EditorChrome';
import { EditorOverlays } from '../../components/Editor/EditorOverlays';
import { EditorMobileContextBar, EditorSidebarContent } from '../../components/Editor/EditorPanels';
import { useEditorBackgroundControls } from '../../components/Editor/hooks/useEditorBackgroundControls';
import { useEditorHistory } from '../../components/Editor/hooks/useEditorHistory';
import { useEditorInsertions } from '../../components/Editor/hooks/useEditorInsertions';
import { useEditorKeyboardShortcuts } from '../../components/Editor/hooks/useEditorKeyboardShortcuts';
import { useEditorObjectActions } from '../../components/Editor/hooks/useEditorObjectActions';
import { useEditorPreviewPersistence } from '../../components/Editor/hooks/useEditorPreviewPersistence';
import { useEditorSelection } from '../../components/Editor/hooks/useEditorSelection';
import { useEditorSidebarVisibility } from '../../components/Editor/hooks/useEditorSidebarVisibility';
import { useEditorViewport } from '../../components/Editor/hooks/useEditorViewport';
import { useModalBodyLock } from '../../components/Editor/hooks/useModalBodyLock';
import {
  AVAILABLE_EDITOR_FONTS,
  artLibraryImages,
  backgroundColorSwatches,
  backgroundLibraryImages,
  backgroundOptions,
  backgroundShapeOptions,
  colorSwatches,
  designPalettes,
  EDITED_LOGO_STORAGE_PREFIX,
  effectLibraryImages,
  EMPTY_EDIT_DIALOG,
  gradientDirectionOptions,
  mobileControlsTool,
  textureLibraryImages,
  editorTools,
} from '../../components/Editor/editorConstants';
import {
  buildInitialPresent,
  canMoveCanvasLayers,
  getCanvasLayerKey,
  getCanvasItemDisplayLabel,
  getCollectionNameByType,
  getOrderedCanvasItems,
  getTextMetrics,
  isBackgroundCanvasItem,
  isValidHexColor,
  normalizeHexColor,
  syncCanvasLayerOrder,
} from '../../components/Editor/editorUtils';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Copy,
  Grid3x3,
  Italic,
  Menu,
  SquareRoundCorner,
  Type,
  Images,
  Trash2,
  Undo2,
  Redo2,
  Sparkles,
} from 'lucide-react';
import { useSelector } from 'react-redux'; // Redux check ke liye
import { loadEditorResumeDraft } from '../../lib/logoResumeStorage';
import { loadTemporaryEditorPayload } from '../../lib/editorPayloadStorage';

const LogoCanvas = dynamic(() => import('../../components/Editor/Canvas'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-white animate-pulse rounded-3xl" />
});

const gradients = {
  primary: "bg-gradient-to-r from-[#FF6B00] via-[#E02424] to-[#2563EB]",
  text: "bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] via-[#E02424] to-[#2563EB]",
};

function ToolbarDivider() {
  return <span className="mx-1 h-4 w-px shrink-0 bg-slate-200" aria-hidden />;
}

function ToolbarIconButton({ active = false, children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all ${
        active
          ? 'border-orange-200 bg-orange-50 text-orange-600 ring-2 ring-orange-200'
          : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/70'
      } ${className}`}
    >
      {active ? (
        <span className="absolute left-1/2 top-0.5 h-0.5 w-3 -translate-x-1/2 rounded-full bg-[#F59E0B]" />
      ) : null}
      {children}
    </button>
  );
}

function ToolbarPillButton({ active = false, children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[11px] font-bold transition-all ${
        active
          ? 'border-orange-200 bg-orange-50 text-orange-600 ring-2 ring-orange-200'
          : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/70'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function ToolbarCheckboxToggle({ checked, label, onChange }) {
  return (
    <label className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-slate-200 px-2 text-[10px] font-bold text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 accent-orange-500"
      />
      <span>{label}</span>
    </label>
  );
}

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
  const shouldResumeDraft = searchParams.get('resume') === '1';
  const resumeDraft = useMemo(() => {
    if (!shouldResumeDraft) {
      return null;
    }

    return loadEditorResumeDraft();
  }, [shouldResumeDraft]);
  const urlImage = searchParams.get('img') || resumeDraft?.sourceImageUrl || '';
  const urlName = searchParams.get('text') || resumeDraft?.initialBusinessValue || '';
  const urlLogoName = searchParams.get('name') || resumeDraft?.initialLogoName || '';
  const urlSlogan = searchParams.get('slogan') || resumeDraft?.initialSloganValue || '';
  const urlBgColor = searchParams.get('bgColor');
  const urlTextColor = searchParams.get('textColor');
  const payloadKey = searchParams.get('payloadKey') || resumeDraft?.payloadKey || '';
  const favoriteId = searchParams.get('favoriteId') || resumeDraft?.favoriteId || '';
  const favoriteRowKey = searchParams.get('favoriteRowKey') || '';
  const initialIndustryLabel = searchParams.get('industryLabel') || resumeDraft?.initialIndustryLabel || 'Brand identity';
  const isFavorite = (searchParams.get('isFavorite') === '1') || Boolean(resumeDraft?.isFavorite);
  const isSaved = (searchParams.get('isSaved') === '1') || Boolean(resumeDraft?.isSaved);
  const isDownloaded = (searchParams.get('isDownloaded') === '1') || Boolean(resumeDraft?.isDownloaded);
  const sourceContext = searchParams.get('sourceContext') || resumeDraft?.sourceContext || (searchParams.get('returnTo') === '/favorites' ? 'favorites' : 'results');
  const returnTo = searchParams.get('returnTo') || resumeDraft?.returnTo || '/results';
  const returnMode = searchParams.get('returnMode') || resumeDraft?.returnMode || 'push';
  const editScopeKey = searchParams.get('editScopeKey') || resumeDraft?.editScopeKey || '';
  const designId = searchParams.get('designId') || resumeDraft?.designId || payloadKey?.replace(/^logo-edit-/, '') || null;
  const hasDirectEditorSource = Boolean(urlImage || urlName || urlLogoName || payloadKey || designId || favoriteId || favoriteRowKey);

  // Redux se fallback data (agar URL mein na ho)
  const { formData } = useSelector((state) => state.logo);
  const initialBusinessValue = (urlName || formData.name || 'BRAND').trim();
  const initialSloganValue = (urlSlogan || formData.slogan || '').trim();

  useEffect(() => {
    if (!shouldResumeDraft) {
      return;
    }

    if (resumeDraft || designId) {
      return;
    }

    router.replace(returnTo || '/results');
  }, [designId, resumeDraft, returnTo, router, shouldResumeDraft]);

  const sessionPayload = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      if (payloadKey) {
        const temporaryPayload = loadTemporaryEditorPayload(payloadKey);
        if (temporaryPayload) {
          return temporaryPayload;
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

  const { editorState, applyLogoConfigChange, handleUndo, handleRedo } = useEditorHistory(() =>
    buildInitialPresent({
      urlBgColor,
      urlTextColor,
      urlImage,
      initialBusinessValue,
      initialSloganValue,
      formData,
      payload: sessionPayload,
    })
  );

  const logoConfig = editorState.present;
  const shouldShowEmptyEditorState = !hasDirectEditorSource && !shouldResumeDraft;

  const [activeTool, setActiveTool] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeObjectPanel, setActiveObjectPanel] = useState(null);
  const [toolbarPopoverState, setToolbarPopoverState] = useState({ selectionKey: '', popover: null });
  const imageInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);
  const stageRef = useRef(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const isMobileViewport = useEditorViewport();
  const clipboardRef = useRef([]);
  const [editDialog, setEditDialog] = useState({
    ...EMPTY_EDIT_DIALOG,
  });
  const [inlineTextEditRequest, setInlineTextEditRequest] = useState(null);
  const openImageBrowser = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const openBackgroundImageBrowser = useCallback(() => {
    backgroundImageInputRef.current?.click();
  }, []);

  const {
    selectedCanvasItem,
    setSelectedCanvasItem,
    selectedCanvasItems,
    setSelectedCanvasItems,
    selectedCanvasItemRef,
    canvasSelectionOverride,
    setCanvasSelectionOverride,
    canvasClearSelectionToken,
    setCanvasClearSelectionToken,
    handleCanvasSelectionChange,
    clearCanvasSelection,
  } = useEditorSelection({
    setActiveObjectPanel,
    setActiveTool,
    setSidebarOpen,
  });

  const {
    activeBackgroundOption,
    setActiveBackgroundOption,
    customColorValue,
    setCustomColorValue,
    colorDialogOpen,
    setColorDialogOpen,
    setDialogBaseColor,
    dialogSelectedColor,
    setDialogSelectedColor,
    gradientType,
    setGradientType,
    gradientDirection,
    setGradientDirection,
    gradientStartColor,
    setGradientStartColor,
    gradientEndColor,
    setGradientEndColor,
    gradientRadialAngle,
    setGradientRadialAngle,
    gradientDialogOpen,
    setGradientDialogOpen,
    gradientColorDialogOpen,
    setGradientColorDialogOpen,
    setGradientDialogBaseColor,
    gradientDialogSelectedColor,
    setGradientDialogSelectedColor,
    gradientColorTarget,
    gradientCustomColorValue,
    setGradientCustomColorValue,
    assetPickerDialog,
    closeAssetPickerDialog,
    closeEditorOverlays,
    applyBackgroundColor,
    applyBackgroundShape,
    applyBackgroundShapeColor,
    applyBackgroundOpacity,
    applyPresetBackgroundImage,
    handleDialogSelect,
    closePickAnotherDialog,
    applyGradientToBackground,
    closeGradientDialog,
    openGradientColorDialog,
    closeGradientColorDialog,
    applyGradientDialogColor,
    applyDesignPalette,
    handleBackgroundOptionSelect,
    gradientPreviewStyle,
    dialogShadeOptions,
    gradientDialogShadeOptions,
  } = useEditorBackgroundControls({
    activeTool,
    applyLogoConfigChange,
    isMobileViewport,
    logoConfig,
    openBackgroundImageBrowser,
    selectedCanvasItemRef,
    setActiveObjectPanel,
    setCanvasSelectionOverride,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
    setSidebarOpen,
    urlBgColor,
  });

  const areAllSelectedText = selectedCanvasItems.length > 0 && selectedCanvasItems.every((item) => item.type === 'text');
  const canEditText = selectedCanvasItems.length > 0 && areAllSelectedText;
  const canEditSingleText = selectedCanvasItems.length === 1 && selectedCanvasItem?.type === 'text';
  const objectPanels = canEditText
    ? ['controls', 'positioning', 'fonts', 'colors', '3D']
    : ['controls', 'positioning', 'colors', '3D'];
  const canDuplicate = selectedCanvasItems.length > 0;
  const selectedCollectionName = getCollectionNameByType(selectedCanvasItem?.type);
  const selectedCollection = selectedCollectionName ? logoConfig[selectedCollectionName] || [] : [];
  const activeBackgroundShape = logoConfig.backgroundShape || null;
  const backgroundCanvasItems = useMemo(
    () => (logoConfig.logoItems || []).filter((item) => isBackgroundCanvasItem(item)),
    [logoConfig.logoItems]
  );
  const activeBackgroundShapeType = activeBackgroundShape?.type || 'none';
  const activeBackgroundShapeColor = normalizeHexColor(activeBackgroundShape?.fillColor || '#FFFFFF', '#FFFFFF');
  const activeBackgroundOpacity = Math.max(0.05, Math.min(1, Number(logoConfig.bgOpacity ?? 1)));
  const backgroundLayerCount = backgroundCanvasItems.length + (activeBackgroundShape?.type && activeBackgroundShape.type !== 'none' ? 1 : 0);
  const canvasLayerOrder = useMemo(
    () => syncCanvasLayerOrder(logoConfig.layerOrder, logoConfig.logoItems || [], logoConfig.textItems || []),
    [logoConfig.layerOrder, logoConfig.logoItems, logoConfig.textItems]
  );
  const selectedItemData = selectedCanvasItem
    ? selectedCollection.find((item) => item.id === selectedCanvasItem.id) || null
    : null;
  const selectedAdvancedMetrics = useMemo(() => {
    if (!selectedCanvasItem || !selectedItemData) {
      return null;
    }

    const transform = selectedItemData.transform || {};
    const baseMetrics = selectedCanvasItem.type === 'logo'
      ? {
          width: Number(selectedItemData.baseWidth || selectedItemData.width || 220),
          height: Number(selectedItemData.baseHeight || selectedItemData.height || 160),
        }
      : getTextMetrics(selectedItemData);

    return {
      width: Math.round(baseMetrics.width * Math.abs(Number(transform.scaleX ?? 1))),
      height: Math.round(baseMetrics.height * Math.abs(Number(transform.scaleY ?? 1))),
      x: Math.round(Number(transform.x ?? 0)),
      y: Math.round(Number(transform.y ?? 0)),
      rotation: Math.round(Number(transform.rotation ?? 0)),
    };
  }, [selectedCanvasItem, selectedItemData]);
  const canSetSelectedShapeAsBackground = (
    selectedCanvasItems.length === 1 &&
    selectedCanvasItem?.type === 'logo'
  );
  const isSelectedItemBackground = Boolean(selectedItemData?.isBackground);
  const hasActiveBackgroundShape = backgroundLayerCount > 0;
  const isControlsContext = Boolean(selectedCanvasItem) && (
    activeObjectPanel === 'controls' || activeObjectPanel === 'positioning'
  );
  const selectedItemKeySet = useMemo(
    () => new Set(selectedCanvasItems.map((item) => `${item.type}:${item.id}`)),
    [selectedCanvasItems]
  );
  const selectedCanvasLayerKeys = useMemo(
    () => selectedCanvasItems
      .map((item) => getCanvasLayerKey(item.type, item.id))
      .filter(Boolean),
    [selectedCanvasItems]
  );
  const orderedCanvasItems = useMemo(
    () => getOrderedCanvasItems(logoConfig.logoItems || [], logoConfig.textItems || [], canvasLayerOrder),
    [canvasLayerOrder, logoConfig.logoItems, logoConfig.textItems]
  );
  const canBringForward = canMoveCanvasLayers(canvasLayerOrder, selectedCanvasLayerKeys, 'forward');
  const canSendBackward = canMoveCanvasLayers(canvasLayerOrder, selectedCanvasLayerKeys, 'backward');
  const canBringToFront = canMoveCanvasLayers(canvasLayerOrder, selectedCanvasLayerKeys, 'front');
  const canSendToBack = canMoveCanvasLayers(canvasLayerOrder, selectedCanvasLayerKeys, 'back');

  const layerPanelItems = useMemo(() => {
    const getBounds = (type, item) => {
      const transform = item?.transform || {};
      const metrics = type === 'logo'
        ? {
            width: Number(item?.baseWidth || item?.width || 220),
            height: Number(item?.baseHeight || item?.height || 160),
          }
        : getTextMetrics(item);

      return {
        x: Number(transform.x ?? 0),
        y: Number(transform.y ?? 0),
        width: metrics.width * Math.abs(Number(transform.scaleX ?? 1)),
        height: metrics.height * Math.abs(Number(transform.scaleY ?? 1)),
      };
    };
    const selectedBounds = selectedCanvasItem
      ? getBounds(
          selectedCanvasItem.type,
          orderedCanvasItems.find(({ type, item }) => type === selectedCanvasItem.type && item.id === selectedCanvasItem.id)?.item
        )
      : null;
    const intersects = (first, second) => {
      if (!first || !second) {
        return false;
      }

      const tolerance = 8;

      return !(
        first.x + first.width <= second.x - tolerance ||
        second.x + second.width <= first.x - tolerance ||
        first.y + first.height <= second.y - tolerance ||
        second.y + second.height <= first.y - tolerance
      );
    };

    return [...orderedCanvasItems]
      .reverse()
      .map(({ type, item }, index) => {
        const key = getCanvasLayerKey(type, item.id);
        const bounds = getBounds(type, item);
        const rawText = getCanvasItemDisplayLabel(type, item);
        const label = String(rawText || 'Layer').trim().slice(0, 48) || 'Layer';

        return {
          key,
          type,
          id: item.id,
          label,
          isBackground: Boolean(item.isBackground),
          isSelected: key === getCanvasLayerKey(selectedCanvasItem?.type, selectedCanvasItem?.id),
          overlapsSelected: selectedBounds ? key === getCanvasLayerKey(selectedCanvasItem?.type, selectedCanvasItem?.id) || intersects(bounds, selectedBounds) : true,
          orderLabel: index === 0 ? 'Top' : index === orderedCanvasItems.length - 1 ? 'Bottom' : `Layer ${orderedCanvasItems.length - index}`,
        };
      });
  }, [orderedCanvasItems, selectedCanvasItem]);

  const {
    closeEditDialog,
    updateSelectedItemStyle,
    handleSelectedTextFontChange,
    handleSelectedTextFontSizeChange,
    handleSelectedTextFontStyleChange,
    handleToggleSelectedTextFontStyle,
    handleSelectedTextAlignChange,
    handleNudge,
    handleSelectedOpacityChange,
    handleScaleSelected,
    handleRotateSelected,
    handleResetSelectedTransform,
    handleCenter,
    handleAlignSelectedToCanvas,
    handleSingleSelectedNumericChange,
    handleMoveSelectedLayers,
    handleDuplicateSelected,
    handleDeleteSelected,
    handleCopySelected,
    handlePasteClipboard,
    handleEditSelectedText,
    handleSaveEditedText,
    handleInlineTextEdit,
    handleToggleSelectedItemBackground,
    handleSetSelectedShapeAsBackground,
    handleBringBackgroundShapeToCanvas,
  } = useEditorObjectActions({
    applyLogoConfigChange,
    canEditSingleText,
    canEditText,
    clearCanvasSelection,
    clipboardRef,
    editDialog,
    logoConfig,
    selectedCanvasItem,
    selectedCanvasItems,
    selectedCanvasItemRef,
    selectedItemKeySet,
    setCanvasClearSelectionToken,
    setCanvasSelectionOverride,
    setEditDialog,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
  });

  const {
    handlePreviewOpen,
    handleSaveDesign,
    handleOpenDownloadDialog,
    handleEditorDownload,
    authNotice,
    setAuthNotice,
    downloadDialogOpen,
    setDownloadDialogOpen,
    downloadingFormat,
    previewDialogOpen,
    setPreviewDialogOpen,
    previewFullscreenOpen,
    setPreviewFullscreenOpen,
    previewImageUrl,
    hideCanvasSelectionUi,
    clipCanvasToCard,
    savingChanges,
  } = useEditorPreviewPersistence({
    designId,
    editScopeKey,
    favoriteId,
    favoriteRowKey,
    initialBusinessValue,
    initialIndustryLabel,
    initialLogoName: urlLogoName || initialBusinessValue,
    initialSloganValue,
    isFavorite,
    isSaved,
    isDownloaded,
    sourceContext,
    logoConfig,
    payloadKey,
    returnMode,
    returnTo,
    router,
    sourceImageUrl: urlImage || '',
    stageRef,
  });

  const sidebarHeading = selectedCanvasItem
    ? activeObjectPanel
      ? activeObjectPanel.charAt(0).toUpperCase() + activeObjectPanel.slice(1)
      : 'Edit'
    : 'Variations';
  const movementStep = 12;
  const selectedStyle = selectedItemData?.style || {};
  const isShapeSelection = selectedCanvasItem?.type === 'logo' && (
    selectedItemData?.kind === 'shape' || selectedItemData?.type === 'shape'
  );
  const isLineSelection = selectedCanvasItem?.type === 'logo' && selectedItemData?.kind === 'line';
  const imageUrlValue = selectedItemData?.imageUrl || '';
  const isSvgSelection = selectedCanvasItem?.type === 'logo' && (
    imageUrlValue.includes('image/svg+xml') ||
    /\.svg($|\?)/i.test(imageUrlValue)
  );
  const isStylableLogoSelection = Boolean(isShapeSelection || isLineSelection || isSvgSelection);
  const isRasterImageSelection = selectedCanvasItem?.type === 'logo' && !isStylableLogoSelection;
  const canRoundSelectedShape = Boolean(
    isShapeSelection &&
    ['rectangle', 'full'].includes(selectedItemData?.shapeType || 'rectangle')
  );
  const selectedCornerRadius = Math.round(Number(selectedStyle.cornerRadius ?? 28));
  const selectedTextFontFamily = selectedItemData?.fontFamily || logoConfig.fontFamily || 'Arial';
  const selectedTextFontSize = Math.round(Number(selectedItemData?.fontSize || 46));
  const selectedTextColor = normalizeHexColor(
    selectedStyle.fillColor || selectedItemData?.fill || logoConfig.textColor || '#111827',
    '#111827'
  );
  const selectedTextFontStyle = String(selectedItemData?.fontStyle || 'normal').toLowerCase();
  const selectedTextAlign = selectedItemData?.align || 'center';
  const selectedOpacityValue = Math.max(0.05, Math.min(1, Number(selectedItemData?.opacity ?? 1)));
  const selectedOpacityPercent = Math.round(selectedOpacityValue * 100);
  const isBoldActive = selectedTextFontStyle.includes('bold');
  const isItalicActive = selectedTextFontStyle.includes('italic');
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
  const canUndo = editorState.past.length > 0;
  const canRedo = editorState.future.length > 0;
  const showFloatingToolbar = Boolean(
    selectedCanvasItem ||
    activeTool === 'background'
  );
  const shouldShowDesktopSidebar = Boolean(
    (selectedCanvasItem && activeObjectPanel) ||
    activeTool === 'background' ||
    activeTool === 'art' ||
    activeTool === 'effect' ||
    activeTool === 'palette'
  );
  const desktopSidebarWidthClass = selectedCanvasItem
    ? activeObjectPanel === 'controls'
      ? 'w-[320px] xl:w-[336px]'
      : activeObjectPanel === 'positioning'
        ? 'w-[308px] xl:w-[324px]'
      : activeObjectPanel === 'fonts'
        ? 'w-[340px] xl:w-[380px]'
        : activeObjectPanel === 'opacity' || activeObjectPanel === 'radius'
          ? 'w-[300px] xl:w-[332px]'
        : 'w-[320px] xl:w-[360px]'
    : activeTool === 'background'
      ? activeBackgroundOption === 'background' || activeBackgroundOption === 'texture'
        ? 'w-[356px] xl:w-[400px]'
        : 'w-[320px] xl:w-[360px]'
      : activeTool === 'art' || activeTool === 'effect'
        ? 'w-[356px] xl:w-[400px]'
        : activeTool === 'palette'
          ? 'w-[328px] xl:w-[368px]'
          : 'w-[340px] xl:w-[380px]';
  const mobileEditorTools = useMemo(
    () => (selectedCanvasItem ? [mobileControlsTool, ...editorTools] : editorTools),
    [selectedCanvasItem]
  );
  const selectedToolbarKey = selectedCanvasItem ? `${selectedCanvasItem.type}:${selectedCanvasItem.id}` : '';
  const activeToolbarPopover = toolbarPopoverState.selectionKey === selectedToolbarKey
    ? toolbarPopoverState.popover
    : null;
  const openSelectedPanel = useCallback((panelId) => {
    if (!panelId) {
      return;
    }

    setToolbarPopoverState({ selectionKey: '', popover: null });
    setActiveObjectPanel(panelId);

    if (isMobileViewport) {
      setActiveTool(null);
      setSidebarOpen(true);
    }
  }, [isMobileViewport, setActiveTool, setSidebarOpen]);
  const toggleToolbarPopover = useCallback((popoverId) => {
    setToolbarPopoverState((currentState) => {
      const isSameSelection = currentState.selectionKey === selectedToolbarKey;
      const isSamePopover = isSameSelection && currentState.popover === popoverId;

      setActiveObjectPanel(null);
      setSidebarOpen(false);

      return isSamePopover
        ? { selectionKey: '', popover: null }
        : { selectionKey: selectedToolbarKey, popover: popoverId };
    });
  }, [selectedToolbarKey, setSidebarOpen]);
  const floatingToolbarOffsetStyle = {
    top: '4.65rem',
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
  useEditorSidebarVisibility({ setSidebarOpen, shouldShowDesktopSidebar });

  const {
    handleImageUpload,
    handleAddPresetArt,
    handleAddShapeElement,
    handleBackgroundImageUpload,
    handleAddTextLayer,
    handleEditorToolSelect,
    handleMobileToolSelect,
  } = useEditorInsertions({
    applyLogoConfigChange,
    clearCanvasSelection,
    closeEditorOverlays,
    logoConfig,
    openImageBrowser,
    selectedCanvasItem,
    selectedCanvasItemRef,
    setActiveBackgroundOption,
    setActiveObjectPanel,
    setActiveTool,
    setCanvasSelectionOverride,
    setInlineTextEditRequest,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
    setSidebarOpen,
  });

  useEditorKeyboardShortcuts({
    assetPickerDialogOpen: assetPickerDialog.open,
    closeAssetPickerDialog,
    closeEditDialog,
    colorDialogOpen,
    downloadDialogOpen,
    downloadingFormat,
    editDialogOpen: editDialog.open,
    gradientColorDialogOpen,
    gradientDialogOpen,
    handleAddTextLayer,
    handleCopySelected,
    handleDeleteSelected,
    handleDuplicateSelected,
    handleNudge,
    handlePasteClipboard,
    handleRedo,
    handleSaveDesign,
    handleUndo,
    isMobileViewport,
    previewDialogOpen,
    previewFullscreenOpen,
    selectedCanvasItemsCount: selectedCanvasItems.length,
    setCanvasZoom,
    setColorDialogOpen,
    setDownloadDialogOpen,
    setGradientColorDialogOpen,
    setGradientDialogOpen,
    setPreviewDialogOpen,
    setPreviewFullscreenOpen,
  });
  useModalBodyLock(previewDialogOpen || previewFullscreenOpen);

  const editorSidebarProps = {
    activeBackgroundOpacity,
    activeBackgroundOption,
    activeBackgroundShape,
    activeBackgroundShapeColor,
    activeBackgroundShapeType,
    backgroundLayerCount,
    activeObjectPanel,
    activeTool,
    applyBackgroundColor,
    applyBackgroundOpacity,
    applyBackgroundShape,
    applyBackgroundShapeColor,
    applyDesignPalette,
    applyGradientToBackground,
    applyPresetBackgroundImage,
    AVAILABLE_EDITOR_FONTS,
    artLibraryImages,
    backgroundColorSwatches,
    backgroundLibraryImages,
    backgroundShapeOptions,
    hasActiveBackgroundShape,
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
    handleAddShapeElement,
    handleBringBackgroundShapeToCanvas,
    handleToggleSelectedItemBackground,
    handleAlignSelectedToCanvas,
    handleCenter,
    handleEditSelectedText,
    handleMoveSelectedLayers,
    handleSingleSelectedNumericChange,
    canBringForward,
    canSendBackward,
    canBringToFront,
    canSendToBack,
    layerPanelItems,
    handleNudge,
    handleResetSelectedTransform,
    handleRotateSelected,
    handleScaleSelected,
    handleSelectedOpacityChange,
    handleSelectedTextFontChange,
    handleSelectedTextFontSizeChange,
    handleSelectedTextFontStyleChange,
    isControlsContext,
    isSelectedItemBackground,
    isMobileViewport,
    isValidHexColor,
    logoConfig,
    movementStep,
    normalizeHexColor,
    openBackgroundImageBrowser,
    selectedCanvasItem,
    selectedAdvancedMetrics,
    selectedItemData,
    selectedStyle,
    selectedLayerKey: getCanvasLayerKey(selectedCanvasItem?.type, selectedCanvasItem?.id),
    setActiveObjectPanel,
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
  };

  const handleSelectLayerFromPanel = useCallback((layerKey) => {
    if (!layerKey) {
      return;
    }

    const [type, id] = layerKey.split(':');
    if (!type || !id) {
      return;
    }

    const nextSelection = { type, id };
    selectedCanvasItemRef.current = nextSelection;
    setSelectedCanvasItem(nextSelection);
    setSelectedCanvasItems([nextSelection]);
    setCanvasSelectionOverride(nextSelection);
    setActiveObjectPanel(null);

    if (isMobileViewport) {
      setActiveTool(null);
      setSidebarOpen(false);
    }
  }, [
    isMobileViewport,
    selectedCanvasItemRef,
    setActiveObjectPanel,
    setCanvasSelectionOverride,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
    setActiveTool,
    setSidebarOpen,
  ]);

  const handleReorderLayerFromPanel = useCallback((draggedKey, targetKey, displayOrderKeys = []) => {
    if (!draggedKey || !targetKey || draggedKey === targetKey || !displayOrderKeys.length) {
      return;
    }

    const nextDisplayOrder = [...displayOrderKeys];
    const draggedIndex = nextDisplayOrder.indexOf(draggedKey);
    const targetIndex = nextDisplayOrder.indexOf(targetKey);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    nextDisplayOrder.splice(draggedIndex, 1);
    nextDisplayOrder.splice(targetIndex, 0, draggedKey);

    applyLogoConfigChange((prev) => ({
      ...prev,
      layerOrder: [...nextDisplayOrder].reverse(),
    }));
  }, [applyLogoConfigChange]);

  editorSidebarProps.handleSelectLayerFromPanel = handleSelectLayerFromPanel;
  editorSidebarProps.handleReorderLayerFromPanel = handleReorderLayerFromPanel;

  const handleCanvasConfigChange = useCallback(
    (partialConfig) => {
      applyLogoConfigChange((prev) => ({
        ...prev,
        ...partialConfig,
      }));
    },
    [applyLogoConfigChange]
  );

  const mobileContextBar = (
    <EditorMobileContextBar
      activeBackgroundOption={activeBackgroundOption}
      activeObjectPanel={activeObjectPanel}
      activeTool={activeTool}
      backgroundOptions={backgroundOptions}
      canDuplicate={canDuplicate}
      canBringForward={canBringForward}
      canSendBackward={canSendBackward}
      canBringToFront={canBringToFront}
      canSendToBack={canSendToBack}
      canSetSelectedShapeAsBackground={canSetSelectedShapeAsBackground}
      isSelectedItemBackground={isSelectedItemBackground}
      hasActiveBackgroundShape={hasActiveBackgroundShape}
      handleMoveSelectedLayers={handleMoveSelectedLayers}
      handleBackgroundOptionSelect={handleBackgroundOptionSelect}
      handleDeleteSelected={handleDeleteSelected}
      handleDuplicateSelected={handleDuplicateSelected}
      handleBringBackgroundShapeToCanvas={handleBringBackgroundShapeToCanvas}
      handleToggleSelectedItemBackground={handleToggleSelectedItemBackground}
      handleSetSelectedShapeAsBackground={handleSetSelectedShapeAsBackground}
      objectPanels={objectPanels}
      selectedCanvasItem={selectedCanvasItem}
      setActiveObjectPanel={setActiveObjectPanel}
    />
  );

  if (shouldShowEmptyEditorState) {
    return (
      <div className="mt-20 min-h-screen bg-pink-50 px-6 py-14">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-500">
            <Sparkles size={28} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-pink-500">Editor</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Open a logo first to start editing</h1>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Go to Results or Favorites, choose a logo, then open it in the editor with its full design data.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => router.push('/results')}
              className="brand-button-outline w-full justify-center px-8 py-3 sm:w-auto"
            >
              Go To Results
            </button>
            <button
              onClick={() => router.push('/create?fresh=1')}
              className="brand-button-primary w-full justify-center px-8 py-3 sm:w-auto"
            >
              Go To Create
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8fafc_48%,#eef2ff_100%)] font-sans lg:flex-row"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <DesktopToolRail
        editorTools={editorTools}
        activeTool={activeTool}
        onToolSelect={handleEditorToolSelect}
      />

      {/* DESKTOP SIDEBAR */}
      {shouldShowDesktopSidebar && (
        <aside className={`hidden shrink-0 flex-col border-r border-gray-100 bg-white lg:flex ${desktopSidebarWidthClass}`}>
          {!selectedCanvasItem && (
            <div className="border-b border-gray-50 px-6 py-5">
              <h2 className={`text-xs font-black uppercase tracking-widest ${gradients.text}`}>{sidebarHeading}</h2>
            </div>
          )}
          <div className={`flex-1 overflow-y-auto bg-gray-50/30 ${selectedCanvasItem ? 'p-4' : 'p-4'} space-y-4`}>
            <EditorSidebarContent {...editorSidebarProps} />
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative h-full min-w-0">

        {/* MOBILE HEADER */}
        <MobileHeader
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onPreview={handlePreviewOpen}
          onSave={handleSaveDesign}
          onDownload={handleOpenDownloadDialog}
          canSave={Boolean(designId)}
          savingChanges={savingChanges}
        />

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
            className="absolute left-3 z-20 hidden items-center gap-1 sm:left-4 lg:flex lg:bottom-auto lg:left-4 lg:top-3 lg:gap-1.5"
            style={mobileFloatingControlsStyle}
          >
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`brand-icon-button flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur transition-all lg:h-9 lg:w-9 ${
                !canUndo
                  ? 'cursor-not-allowed text-slate-300'
                  : ''
              }`}
              title="Undo"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`brand-icon-button flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur transition-all lg:h-9 lg:w-9 ${
                !canRedo
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
              <div className="relative overflow-x-auto overflow-y-visible rounded-[1.05rem] border border-slate-200/80 bg-white/95 px-1.5 py-1.5 shadow-xl backdrop-blur">
                {selectedCanvasItem ? (
                  canEditText && selectedItemData ? (
                    <div className="flex min-w-max items-center gap-px text-slate-700">
                      <button
                        onClick={() => openSelectedPanel('fonts')}
                        className={`flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[11px] font-bold transition-all ${
                          activeObjectPanel === 'fonts'
                            ? 'border-orange-200 bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                            : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/70'
                        }`}
                      >
                        <span
                          className="max-w-[116px] truncate text-left"
                          style={{ fontFamily: selectedTextFontFamily }}
                        >
                          {selectedTextFontFamily}
                        </span>
                        <ChevronDown size={13} />
                      </button>

                      <div className="flex h-7 shrink-0 items-center rounded-md border border-slate-200 bg-white px-1">
                        <button
                          onClick={() => handleSelectedTextFontSizeChange(selectedTextFontSize - 2)}
                          className="flex h-4 w-4 items-center justify-center rounded text-[11px] font-black transition-all hover:bg-slate-100"
                          title="Decrease font size"
                        >
                          -
                        </button>
                        <button
                          onClick={() => openSelectedPanel('fonts')}
                          className="min-w-[32px] px-1 text-[11px] font-black text-slate-800"
                          title="Open font settings"
                        >
                          {selectedTextFontSize}
                        </button>
                        <button
                          onClick={() => handleSelectedTextFontSizeChange(selectedTextFontSize + 2)}
                          className="flex h-4 w-4 items-center justify-center rounded text-[11px] font-black transition-all hover:bg-slate-100"
                          title="Increase font size"
                        >
                          +
                        </button>
                      </div>

                      <ToolbarDivider />

                      <ToolbarIconButton
                        onClick={() => openSelectedPanel('colors')}
                        active={activeObjectPanel === 'colors'}
                        title="Text color"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border-2 border-slate-300"
                          style={{ backgroundColor: selectedTextColor }}
                        />
                      </ToolbarIconButton>
                      <ToolbarDivider />

                      <ToolbarIconButton
                        onClick={() => handleToggleSelectedTextFontStyle('bold')}
                        active={isBoldActive}
                        title="Bold"
                      >
                        <Bold size={16} />
                      </ToolbarIconButton>
                      <ToolbarDivider />

                      <ToolbarIconButton
                        onClick={() => handleToggleSelectedTextFontStyle('italic')}
                        active={isItalicActive}
                        title="Italic"
                      >
                        <Italic size={16} />
                      </ToolbarIconButton>
                      <ToolbarDivider />

                      <ToolbarIconButton
                        onClick={() => handleSelectedTextAlignChange(nextTextAlign)}
                        title={`Alignment: ${selectedTextAlign}. Click for ${nextTextAlign}.`}
                      >
                        <CurrentAlignIcon size={15} />
                      </ToolbarIconButton>
                      <ToolbarDivider />

                      <ToolbarIconButton
                        onClick={() => toggleToolbarPopover('opacity')}
                        active={activeToolbarPopover === 'opacity'}
                        title="Transparency"
                      >
                        <Grid3x3 size={15} />
                      </ToolbarIconButton>

                      <ToolbarDivider />

                      <ToolbarPillButton
                        onClick={() => openSelectedPanel('3D')}
                        active={activeObjectPanel === '3D'}
                      >
                        <Sparkles size={13} />
                        <span>3D</span>
                      </ToolbarPillButton>
                      <ToolbarDivider />

                      <ToolbarPillButton
                        onClick={() => openSelectedPanel('controls')}
                        active={activeObjectPanel === 'controls'}
                      >
                        <span>Controls</span>
                      </ToolbarPillButton>

                      <ToolbarDivider />

                      <ToolbarPillButton
                        onClick={() => openSelectedPanel('positioning')}
                        active={activeObjectPanel === 'positioning'}
                      >
                        <span>Positioning</span>
                      </ToolbarPillButton>

                      <ToolbarDivider />

                      <button
                        onClick={handleDuplicateSelected}
                        className="brand-button-outline flex h-7 shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px]"
                      >
                        <Copy size={14} />
                      </button>

                      <ToolbarDivider />

                      <button
                        onClick={handleDeleteSelected}
                        className="brand-button-outline flex h-7 shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : isStylableLogoSelection ? (
                    <div className="flex min-w-max items-center gap-px text-slate-700">
                      <ToolbarIconButton
                        onClick={() => openSelectedPanel('colors')}
                        active={activeObjectPanel === 'colors'}
                        title="Fill color"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border-2 border-slate-300"
                          style={{ backgroundColor: normalizeHexColor(selectedStyle.fillColor || '#111827', '#111827') }}
                        />
                      </ToolbarIconButton>
                      <ToolbarDivider />

                      <ToolbarIconButton
                        onClick={() => openSelectedPanel('outlines')}
                        active={activeObjectPanel === 'outlines'}
                        title="Outline"
                      >
                        <Menu size={15} />
                      </ToolbarIconButton>

                      {canRoundSelectedShape && (
                        <>
                          <ToolbarDivider />
                          <ToolbarIconButton
                            onClick={() => openSelectedPanel('radius')}
                            active={activeObjectPanel === 'radius'}
                            title={`Corner radius: ${selectedCornerRadius}`}
                          >
                            <SquareRoundCorner size={15} />
                          </ToolbarIconButton>
                        </>
                      )}

                      <ToolbarDivider />

                      <ToolbarIconButton
                        onClick={() => toggleToolbarPopover('opacity')}
                        active={activeToolbarPopover === 'opacity'}
                        title="Transparency"
                      >
                        <Grid3x3 size={15} />
                      </ToolbarIconButton>

                      <ToolbarDivider />

                      <ToolbarPillButton
                        onClick={() => openSelectedPanel('3D')}
                        active={activeObjectPanel === '3D'}
                      >
                        <Sparkles size={13} />
                        <span>3D</span>
                      </ToolbarPillButton>
                      <ToolbarDivider />

                      <ToolbarPillButton
                        onClick={() => openSelectedPanel('controls')}
                        active={activeObjectPanel === 'controls'}
                      >
                        <span>Controls</span>
                      </ToolbarPillButton>

                      <ToolbarDivider />

                      <ToolbarPillButton
                        onClick={() => openSelectedPanel('positioning')}
                        active={activeObjectPanel === 'positioning'}
                      >
                        <span>Positioning</span>
                      </ToolbarPillButton>

                      {canSetSelectedShapeAsBackground && (
                        <>
                          <ToolbarDivider />
                          <ToolbarCheckboxToggle
                            checked={isSelectedItemBackground}
                            label="Bg"
                            onChange={(event) => handleToggleSelectedItemBackground(event.target.checked)}
                          />
                        </>
                      )}

                      <ToolbarDivider />

                      <button
                        onClick={handleDuplicateSelected}
                        className="brand-button-outline flex h-7 shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px]"
                      >
                        <Copy size={14} />
                      </button>

                      <ToolbarDivider />

                      <button
                        onClick={handleDeleteSelected}
                        className="brand-button-outline flex h-7 shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : isRasterImageSelection ? (
                    <div className="flex min-w-max items-center gap-px text-slate-700">
                      <ToolbarIconButton
                        onClick={() => toggleToolbarPopover('opacity')}
                        active={activeToolbarPopover === 'opacity'}
                        title="Transparency"
                      >
                        <Grid3x3 size={15} />
                      </ToolbarIconButton>
                      <ToolbarDivider />
                      <ToolbarPillButton
                        onClick={() => openSelectedPanel('controls')}
                        active={activeObjectPanel === 'controls'}
                      >
                        <span>Controls</span>
                      </ToolbarPillButton>
                      <ToolbarDivider />
                      <ToolbarPillButton
                        onClick={() => openSelectedPanel('positioning')}
                        active={activeObjectPanel === 'positioning'}
                      >
                        <span>Positioning</span>
                      </ToolbarPillButton>
                      {canSetSelectedShapeAsBackground && (
                        <>
                          <ToolbarDivider />
                          <ToolbarCheckboxToggle
                            checked={isSelectedItemBackground}
                            label="Bg"
                            onChange={(event) => handleToggleSelectedItemBackground(event.target.checked)}
                          />
                        </>
                      )}
                      <ToolbarDivider />
                      <button
                        onClick={handleDuplicateSelected}
                        className="brand-button-outline flex h-7 shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px]"
                      >
                        <Copy size={14} />
                      </button>
                      <ToolbarDivider />
                      <button
                        onClick={handleDeleteSelected}
                        className="brand-button-outline flex h-7 shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex min-w-max items-center justify-center gap-0.5">
                      {objectPanels.map((panel, index) => (
                        <Fragment key={panel}>
                          <button
                            onClick={() => openSelectedPanel(panel)}
                            className={`brand-chip-button shrink-0 px-3 py-1.5 text-[11px] transition-all ${
                              activeObjectPanel === panel
                                ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                                : ''
                            }`}
                          >
                            {panel}
                          </button>
                          {index < objectPanels.length - 1 && (
                            <ToolbarDivider />
                          )}
                        </Fragment>
                      ))}
                      {(objectPanels.length > 0 || canSetSelectedShapeAsBackground) && (
                        <ToolbarDivider />
                      )}
                      {canSetSelectedShapeAsBackground && (
                        <ToolbarCheckboxToggle
                          checked={isSelectedItemBackground}
                          label="Set As Bg"
                          onChange={(event) => handleToggleSelectedItemBackground(event.target.checked)}
                        />
                      )}
                      {canSetSelectedShapeAsBackground && (
                        <ToolbarDivider />
                      )}
                      <button
                        onClick={handleDuplicateSelected}
                        className="brand-button-outline flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-[11px]"
                      >
                        <Copy size={14} />
                      </button>
                      <ToolbarDivider />
                      <button
                        onClick={handleDeleteSelected}
                        className="brand-button-outline flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-[11px]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                ) : activeTool === 'background' ? (
                  <div className="flex min-w-max items-center justify-center gap-1.5">
                    {hasActiveBackgroundShape ? (
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700">
                        <span>Background Layers</span>
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                          {backgroundLayerCount}
                        </span>
                      </span>
                    ) : null}
                    {hasActiveBackgroundShape ? (
                      <span className="mx-1 h-4 w-px shrink-0 bg-slate-200" aria-hidden />
                    ) : null}
                    {backgroundOptions.map((option, index) => {
                      const Icon = option.icon;
                      const isActiveOption = activeBackgroundOption === option.id;

                      return (
                        <Fragment key={option.id}>
                          <button
                            onClick={() => handleBackgroundOptionSelect(option.id)}
                            className={`brand-chip-button flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-[11px] transition-all ${
                              isActiveOption
                                ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                                : ''
                            }`}
                          >
                            <Icon size={14} />
                            <span>{option.label}</span>
                          </button>
                          {index < backgroundOptions.length - 1 && (
                            <span className="mx-1 h-4 w-px shrink-0 bg-slate-200" aria-hidden />
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                ) : activeTool === 'images' ? (
                  <div className="flex min-w-max items-center justify-center gap-1.5">
                    <button
                      onClick={openImageBrowser}
                      className="brand-button-outline flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
                    >
                      <Images size={14} />
                      <span>Browse Image</span>
                    </button>
                  </div>
                ) : activeTool === 'text' ? (
                  <div className="flex min-w-max items-center justify-center gap-1.5">
                    <button
                      onClick={handleAddTextLayer}
                      className="brand-button-outline flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
                    >
                      <Type size={14} />
                      <span>Add Text</span>
                    </button>
                  </div>
                ) : null}
              </div>
              {activeToolbarPopover === 'opacity' && selectedCanvasItem ? (
                <div className="absolute left-1/2 top-[calc(100%+0.35rem)] z-30 w-[192px] -translate-x-1/2 rounded-[0.95rem] border border-slate-200/80 bg-white/95 p-2.5 shadow-2xl backdrop-blur">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-bold text-slate-700">Transparency</p>
                    <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                      {selectedOpacityPercent}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={selectedOpacityValue}
                    onChange={(event) => handleSelectedOpacityChange(event.target.value)}
                    className="mt-2 w-full accent-violet-500"
                  />
                </div>
              ) : null}
            </div>
          )}

          <EditorOverlays
            editDialog={editDialog}
            isMobileViewport={isMobileViewport}
            closeEditDialog={closeEditDialog}
            setEditDialog={setEditDialog}
            handleSaveEditedText={handleSaveEditedText}
            colorDialogOpen={colorDialogOpen}
            closePickAnotherDialog={closePickAnotherDialog}
            backgroundColorSwatches={backgroundColorSwatches}
            normalizeHexColor={normalizeHexColor}
            dialogSelectedColor={dialogSelectedColor}
            setDialogBaseColor={setDialogBaseColor}
            setDialogSelectedColor={setDialogSelectedColor}
            setCustomColorValue={setCustomColorValue}
            dialogShadeOptions={dialogShadeOptions}
            customColorValue={customColorValue}
            handleDialogSelect={handleDialogSelect}
            isValidHexColor={isValidHexColor}
            gradientDialogOpen={gradientDialogOpen}
            closeGradientDialog={closeGradientDialog}
            gradientPreviewStyle={gradientPreviewStyle}
            openGradientColorDialog={openGradientColorDialog}
            gradientStartColor={gradientStartColor}
            gradientEndColor={gradientEndColor}
            gradientType={gradientType}
            setGradientType={setGradientType}
            gradientDirectionOptions={gradientDirectionOptions}
            gradientDirection={gradientDirection}
            setGradientDirection={setGradientDirection}
            gradientRadialAngle={gradientRadialAngle}
            setGradientRadialAngle={setGradientRadialAngle}
            applyGradientToBackground={applyGradientToBackground}
            gradientColorDialogOpen={gradientColorDialogOpen}
            closeGradientColorDialog={closeGradientColorDialog}
            gradientColorTarget={gradientColorTarget}
            gradientDialogShadeOptions={gradientDialogShadeOptions}
            gradientDialogSelectedColor={gradientDialogSelectedColor}
            setGradientDialogBaseColor={setGradientDialogBaseColor}
            setGradientDialogSelectedColor={setGradientDialogSelectedColor}
            setGradientCustomColorValue={setGradientCustomColorValue}
            gradientCustomColorValue={gradientCustomColorValue}
            applyGradientDialogColor={applyGradientDialogColor}
            assetPickerDialog={assetPickerDialog}
            closeAssetPickerDialog={closeAssetPickerDialog}
            applyPresetBackgroundImage={applyPresetBackgroundImage}
            previewDialogOpen={previewDialogOpen}
            setPreviewDialogOpen={setPreviewDialogOpen}
            previewImageUrl={previewImageUrl}
            setPreviewFullscreenOpen={setPreviewFullscreenOpen}
            previewFullscreenOpen={previewFullscreenOpen}
          />

          <MobileBottomPanel
            sidebarOpen={sidebarOpen}
            shouldShowDesktopSidebar={shouldShowDesktopSidebar}
            mobileContextBar={mobileContextBar}
            sidebarContent={<EditorSidebarContent {...editorSidebarProps} />}
            mobileEditorTools={mobileEditorTools}
            selectedCanvasItem={selectedCanvasItem}
            activeTool={activeTool}
            onToolSelect={handleMobileToolSelect}
          />

          <div className="flex h-full w-full items-start justify-center pt-2 sm:pt-3 lg:items-center lg:pt-0">
            <div className="h-full w-full max-w-[880px] max-h-[44vh] sm:max-h-[52vh] lg:max-h-[380px]">
              <LogoCanvas
                config={logoConfig}
                onConfigChange={handleCanvasConfigChange}
                onSelectionChange={handleCanvasSelectionChange}
                selectionOverride={canvasSelectionOverride}
                clearSelectionToken={canvasClearSelectionToken}
                stageRef={stageRef}
                zoom={canvasZoom}
                hideSelectionUi={hideCanvasSelectionUi}
                clipContentToCard={clipCanvasToCard}
                inlineTextEditRequest={inlineTextEditRequest}
                onTextEditCommit={handleInlineTextEdit}
              />
            </div>
          </div>

          <DesktopActionDock
            style={floatingActionDockOffsetStyle}
            onPreview={handlePreviewOpen}
            onSave={handleSaveDesign}
            onDownload={handleOpenDownloadDialog}
            canSave={Boolean(designId)}
            savingChanges={savingChanges}
          />
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

      <FloatingNotice notice={authNotice} onClose={() => setAuthNotice(null)} />
    </div>
  );
}
