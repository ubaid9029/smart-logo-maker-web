"use client";
import React, { Fragment, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import DownloadDialog from '../../components/DownloadDialog';
import FloatingNotice from '../../components/MainComponents/FloatingNotice';
import PremiumLoader from '../../components/Shared/PremiumLoader';
import { PremiumLoaderOverlay } from '../../components/Shared/PremiumLoader';
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
  getCanvasItemByLayerKey,
  getCanvasItemDisplayLabel,
  getCollectionNameByType,
  getEditableTextBaseFontSize,
  getEffectiveTextFontSize,
  getLinearGradientCss,
  getOrderedCanvasItems,
  getPayloadBackgroundColor,
  getPayloadBusinessValue,
  getPayloadFontFamily,
  getPayloadPrimaryImageUrl,
  getPayloadSloganValue,
  getPayloadTextColor,
  getRadialGradientCss,
  getTextBlockMetrics,
  getTextMetrics,
  isBackgroundCanvasItem,
  isCanvasItemLocked,
  isValidHexColor,
  normalizeFillGradient,
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
import { getEditorFontFaceCss } from '../../lib/editorFonts';

const LogoCanvas = dynamic(() => import('../../components/Editor/Canvas'), {
  ssr: false,
  loading: () => (
    <PremiumLoaderOverlay
      size="full"
      text="Loading editor workspace..."
      className="z-[330] bg-white"
    />
  )
});

const EDITOR_FONT_FACE_CSS = getEditorFontFaceCss();

function ToolbarDivider() {
  return <span className="mx-1 h-4 w-px shrink-0 bg-slate-200" aria-hidden />;
}

function ToolbarIconButton({ active = false, children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${active
        ? 'border-slate-300 bg-slate-50 text-slate-700 ring-2 ring-slate-200 scale-[1.04]'
        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
        } ${className}`}
    >
      {active ? (
        <span className="absolute left-1/2 top-0.5 h-0.5 w-3 -translate-x-1/2 rounded-full bg-slate-500" />
      ) : null}
      {children}
    </button>
  );
}

function ToolbarPillButton({ active = false, children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition-all ${active
        ? 'border-slate-300 bg-slate-50 text-slate-700 ring-2 ring-slate-200 scale-[1.02]'
        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
        } ${className}`}
    >
      {children}
    </button>
  );
}

function ToolbarCheckboxToggle({ checked, label, onChange }) {
  return (
    <label className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[12px] font-semibold text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 accent-slate-600"
      />
      <span>{label}</span>
    </label>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<PremiumLoader size="full" text="Loading editor workspace..." />}>
      <EditorUI />
    </Suspense>
  );
}

function EditorUI() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData } = useSelector((state) => state.logo);

  // --- STEP 5: URL Handover Logic ---
  // Results page se bheja gaya data yahan receive ho raha hai
  const shouldResumeDraft = searchParams.get('resume') === '1';
  const resumeDraft = useMemo(() => {
    if (!shouldResumeDraft) {
      return null;
    }

    return loadEditorResumeDraft();
  }, [shouldResumeDraft]);
  const queryImage = searchParams.get('img') || '';
  const queryName = searchParams.get('text') || '';
  const queryLogoName = searchParams.get('name') || '';
  const querySlogan = searchParams.get('slogan') || '';
  const queryBgColor = searchParams.get('bgColor') || '';
  const queryTextColor = searchParams.get('textColor') || '';
  const payloadKey = searchParams.get('payloadKey') || resumeDraft?.payloadKey || '';
  const favoriteId = searchParams.get('favoriteId') || resumeDraft?.favoriteId || '';
  const favoriteRowKey = searchParams.get('favoriteRowKey') || '';
  const isFavorite = (searchParams.get('isFavorite') === '1') || Boolean(resumeDraft?.isFavorite);
  const isSaved = (searchParams.get('isSaved') === '1') || Boolean(resumeDraft?.isSaved);
  const isDownloaded = (searchParams.get('isDownloaded') === '1') || Boolean(resumeDraft?.isDownloaded);
  const sourceContext = searchParams.get('sourceContext') || resumeDraft?.sourceContext || (searchParams.get('returnTo') === '/favorites' ? 'favorites' : 'results');
  const returnTo = searchParams.get('returnTo') || resumeDraft?.returnTo || '/results';
  const returnMode = searchParams.get('returnMode') || resumeDraft?.returnMode || 'push';
  const editScopeKey = searchParams.get('editScopeKey') || resumeDraft?.editScopeKey || '';
  const designId = searchParams.get('designId') || resumeDraft?.designId || payloadKey?.replace(/^logo-edit-/, '') || null;

  useEffect(() => {
    if (!shouldResumeDraft) {
      return;
    }

    if (resumeDraft || designId) {
      return;
    }

    router.replace(returnTo || '/results');
  }, [designId, resumeDraft, returnTo, router, shouldResumeDraft]);

  useEffect(() => {
    router.prefetch('/my-designs');
  }, [router]);

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

  const payloadBusinessValue = getPayloadBusinessValue(sessionPayload);
  const payloadSloganValue = getPayloadSloganValue(sessionPayload);
  const payloadBackgroundColor = getPayloadBackgroundColor(sessionPayload);
  const payloadTextColor = getPayloadTextColor(sessionPayload);
  const payloadPrimaryImageUrl = getPayloadPrimaryImageUrl(sessionPayload);
  const payloadFontFamily = getPayloadFontFamily(sessionPayload);
  const sourceImageUrl = payloadPrimaryImageUrl || queryImage || resumeDraft?.sourceImageUrl || '';
  const initialBusinessValue = (
    payloadBusinessValue
    || queryName
    || resumeDraft?.initialBusinessValue
    || formData.name
    || 'BRAND'
  ).trim();
  const initialSloganValue = (
    payloadSloganValue
    || querySlogan
    || resumeDraft?.initialSloganValue
    || formData.slogan
    || ''
  ).trim();
  const initialLogoName = (
    payloadBusinessValue
    || queryLogoName
    || resumeDraft?.initialLogoName
    || initialBusinessValue
  ).trim();
  const initialIndustryLabel = (
    searchParams.get('industryLabel')
    || resumeDraft?.initialIndustryLabel
    || 'Brand identity'
  ).trim();
  const resolvedBgColor = payloadBackgroundColor || queryBgColor || '';
  const resolvedTextColor = payloadTextColor || queryTextColor || '';
  const hasDirectEditorSource = Boolean(
    sourceImageUrl
    || payloadBusinessValue
    || payloadSloganValue
    || payloadFontFamily
    || queryName
    || queryLogoName
    || payloadKey
    || designId
    || favoriteId
    || favoriteRowKey
  );

  const { editorState, applyLogoConfigChange, handleUndo, handleRedo } = useEditorHistory(() =>
    buildInitialPresent({
      urlBgColor: resolvedBgColor,
      urlTextColor: resolvedTextColor,
      urlImage: sourceImageUrl,
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
    activeTool,
    isMobileViewport,
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
    urlBgColor: resolvedBgColor,
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
  const hasLockedSelection = useMemo(
    () => selectedCanvasLayerKeys.some((layerKey) => isCanvasItemLocked(
      getCanvasItemByLayerKey(logoConfig.logoItems || [], logoConfig.textItems || [], layerKey)
    )),
    [logoConfig.logoItems, logoConfig.textItems, selectedCanvasLayerKeys]
  );
  const selectedLayerKey = getCanvasLayerKey(selectedCanvasItem?.type, selectedCanvasItem?.id);
  const selectedItemLocked = Boolean(selectedItemData && isCanvasItemLocked(selectedItemData));
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
          locked: isCanvasItemLocked(item),
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
    handleToggleSelectedLock,
    handleToggleLayerLock,
    handleToggleSelectedItemBackground,
    handleSetSelectedShapeAsBackground,
    handleBringBackgroundShapeToCanvas,
    hasLockedSelection: hasLockedSelectionFromActions,
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
    previewElementsImageUrl,
    hideCanvasSelectionUi,
    clipCanvasToCard,
    renderCanvasElementsOnly,
    savingChanges,
  } = useEditorPreviewPersistence({
    designId,
    editScopeKey,
    favoriteId,
    favoriteRowKey,
    initialBusinessValue,
    initialIndustryLabel,
    initialLogoName,
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
    sourceImageUrl,
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
  // Text items visually scale when resized by mouse (changing transform.scaleY).
  // Use getEffectiveTextFontSize so the displayed numeric size reflects
  // the visual size the user created via mouse scaling, not just the baked fontSize.
  const selectedTextFontSize = selectedCanvasItem?.type === 'text' && selectedItemData
    ? Math.round(Number(getEffectiveTextFontSize(selectedItemData) || selectedItemData?.fontSize || 46))
    : Math.round(Number(selectedItemData?.fontSize || 46));
  const selectedTextColor = normalizeHexColor(
    selectedStyle.fillColor || selectedItemData?.fill || logoConfig.textColor || '#111827',
    '#111827'
  );
  const selectedFillGradient = normalizeFillGradient(selectedStyle.fillGradient);
  const selectedFillPreviewStyle = selectedFillGradient
    ? {
      background: selectedFillGradient.type === 'linear'
        ? getLinearGradientCss(
          selectedFillGradient.direction,
          selectedFillGradient.startColor,
          selectedFillGradient.endColor
        )
        : getRadialGradientCss(
          selectedFillGradient.radialAngle,
          selectedFillGradient.startColor,
          selectedFillGradient.endColor
        ),
    }
    : {
      backgroundColor: selectedTextColor,
    };
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
    top: '6rem',
  };
  const mobileFloatingControlsStyle = isMobileViewport
    ? {
      bottom: sidebarOpen && shouldShowDesktopSidebar
        ? 'calc(4.15rem + 18.5svh + 0.3rem)'
        : '4.4rem',
    }
    : undefined;
  useEditorSidebarVisibility({ isMobileViewport, setSidebarOpen, shouldShowDesktopSidebar });

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
    hasLockedSelection: hasLockedSelection || hasLockedSelectionFromActions,
    isMobileViewport,
    previewDialogOpen,
    previewFullscreenOpen,
    selectedCanvasItemsCount: selectedCanvasItems.length,
    setColorDialogOpen,
    setDownloadDialogOpen,
    setGradientColorDialogOpen,
    setGradientDialogOpen,
    setPreviewDialogOpen,
    setPreviewFullscreenOpen,
  });
  useModalBodyLock(previewDialogOpen || previewFullscreenOpen);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const shouldHideNavbar = previewDialogOpen || previewFullscreenOpen;
    document.body.classList.toggle('editor-preview-open', shouldHideNavbar);

    return () => {
      document.body.classList.remove('editor-preview-open');
    };
  }, [previewDialogOpen, previewFullscreenOpen]);

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
    handleBackgroundOptionSelect,
    handleBringBackgroundShapeToCanvas,
    handleDeleteSelected,
    handleDuplicateSelected,
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
    hasLockedSelection,
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
    canDuplicate,
    canSetSelectedShapeAsBackground,
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
    selectedItemLocked,
    selectedLayerKey,
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
    handleToggleSelectedLock,
    handleToggleLayerLock,
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

    const draggedItem = getCanvasItemByLayerKey(logoConfig.logoItems || [], logoConfig.textItems || [], draggedKey);
    const targetItem = getCanvasItemByLayerKey(logoConfig.logoItems || [], logoConfig.textItems || [], targetKey);
    if (isCanvasItemLocked(draggedItem) || isCanvasItemLocked(targetItem)) {
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

    applyLogoConfigChange((prev) => {
      const fullLayerOrder = syncCanvasLayerOrder(prev.layerOrder, prev.logoItems || [], prev.textItems || []);
      const fullDisplayOrder = [...fullLayerOrder].reverse();
      const visibleKeySet = new Set(displayOrderKeys);
      const reorderedVisibleKeys = [...nextDisplayOrder];
      const nextFullDisplayOrder = fullDisplayOrder.map((key) => (
        visibleKeySet.has(key) ? reorderedVisibleKeys.shift() : key
      ));

      return {
        ...prev,
        layerOrder: [...nextFullDisplayOrder].reverse(),
      };
    });
  }, [applyLogoConfigChange, logoConfig.logoItems, logoConfig.textItems]);

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
      canEditText={canEditText}
      canDuplicate={canDuplicate}
      canBringForward={canBringForward}
      canSendBackward={canSendBackward}
      canBringToFront={canBringToFront}
      canSendToBack={canSendToBack}
      canSetSelectedShapeAsBackground={canSetSelectedShapeAsBackground}
      canRoundSelectedShape={canRoundSelectedShape}
      isSelectedItemBackground={isSelectedItemBackground}
      isStylableLogoSelection={isStylableLogoSelection}
      isRasterImageSelection={isRasterImageSelection}
      hasActiveBackgroundShape={hasActiveBackgroundShape}
      selectedItemData={selectedItemData}
      selectedStyle={selectedStyle}
      selectedTextFontFamily={selectedTextFontFamily}
      selectedTextFontSize={selectedTextFontSize}
      selectedTextColor={selectedTextColor}
      selectedItemLocked={selectedItemLocked}
      hasLockedSelection={hasLockedSelection}
      isBoldActive={isBoldActive}
      isItalicActive={isItalicActive}
      selectedTextAlign={selectedTextAlign}
      handleMoveSelectedLayers={handleMoveSelectedLayers}
      handleBackgroundOptionSelect={handleBackgroundOptionSelect}
      handleDeleteSelected={handleDeleteSelected}
      handleDuplicateSelected={handleDuplicateSelected}
      handleSelectedTextFontSizeChange={handleSelectedTextFontSizeChange}
      handleToggleSelectedTextFontStyle={handleToggleSelectedTextFontStyle}
      handleSelectedTextAlignChange={handleSelectedTextAlignChange}
      handleToggleSelectedLock={handleToggleSelectedLock}
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
      <div className="mt-20 min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#f8fafc_52%,#e0f2fe_100%)] px-5 py-14">
        <div className="mx-auto max-w-3xl rounded-[2.4rem] border border-white/80 bg-white/85 p-8 text-center shadow-[0_30px_90px_-45px_rgba(15,23,42,0.35)] backdrop-blur md:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-orange-100 via-rose-50 to-sky-100 text-pink-500 shadow-inner">
            <Sparkles size={28} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-pink-500">Editor</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Open a logo first to start editing</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 md:text-base">
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
    <>
      <style jsx global>{EDITOR_FONT_FACE_CSS}</style>
      <div
        className="fixed inset-x-0 bottom-0 top-20 flex flex-col overflow-y-auto bg-pink-50 font-sans lg:flex-row"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="flex h-full w-full">
          <div className="mx-auto flex h-full w-full max-w-[1800px] flex-col overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 lg:flex-row lg:rounded-[2rem] lg:border lg:border-slate-200/70 lg:bg-white lg:shadow-[0_24px_70px_-44px_rgba(15,23,42,0.28)]">
            <DesktopToolRail
              editorTools={editorTools}
              activeTool={activeTool}
              onToolSelect={handleEditorToolSelect}
            />

            {/* DESKTOP SIDEBAR */}
            {shouldShowDesktopSidebar && (
              <aside className={`hidden shrink-0 flex-col overflow-y-auto border-r border-slate-200/70 bg-white lg:flex ${desktopSidebarWidthClass}`}>
                {!selectedCanvasItem && (
                  <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className={`text-[15px] font-extrabold uppercase tracking-[0.08em] text-slate-800`}>{sidebarHeading}</h2>
                  </div>
                )}
                <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4">
                  <EditorSidebarContent {...editorSidebarProps} />
                </div>
              </aside>
            )}

            {/* MAIN CONTENT AREA */}
            <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-pink-50 lg:bg-white/70">

              {/* MOBILE HEADER */}
              <MobileHeader
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                watermarkEnabled={logoConfig.watermarkEnabled !== false}
                onToggleWatermark={(checked) => applyLogoConfigChange({ watermarkEnabled: checked })}
                onPreview={handlePreviewOpen}
                onSave={handleSaveDesign}
                onDownload={handleOpenDownloadDialog}
                canSave={Boolean(designId)}
                savingChanges={savingChanges}
              />

              {/* CANVAS */}
              <div className="relative flex-1 overflow-y-auto bg-pink-50 p-3 pb-[7.1rem] sm:p-4 sm:pb-[8rem] lg:flex lg:flex-col lg:items-center lg:overflow-y-auto lg:p-4 lg:pb-0 lg:pt-28">
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

                {/* TOP COMPONENT: ACTIONS CONTAINER */}
                <div className="absolute inset-x-0 top-0 z-30 flex justify-start px-6 py-6 lg:px-8">
                  <div className="flex items-center gap-3 rounded-full border border-slate-200/60 bg-white/90 p-1.5 shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-1.5 px-1.5">
                      <button
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${!canUndo
                          ? 'cursor-not-allowed text-slate-300'
                          : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        title="Undo"
                      >
                        <Undo2 size={16} />
                      </button>
                      <button
                        onClick={handleRedo}
                        disabled={!canRedo}
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${!canRedo
                          ? 'cursor-not-allowed text-slate-300'
                          : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        title="Redo"
                      >
                        <Redo2 size={16} />
                      </button>
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <label className="flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 text-[12px] font-bold text-slate-700 transition-colors hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={logoConfig.watermarkEnabled !== false}
                        onChange={(event) => applyLogoConfigChange({ watermarkEnabled: event.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                      />
                      <span>Watermark</span>
                    </label>
                  </div>
                </div>

                {showFloatingToolbar && (
                  <div
                    className="absolute left-1/2 z-20 hidden w-[calc(100%-2rem)] max-w-max -translate-x-1/2 sm:w-auto lg:block"
                    style={floatingToolbarOffsetStyle}
                  >
                    <div className="relative overflow-x-auto overflow-y-visible rounded-[1.25rem] border border-slate-200/80 bg-white/95 px-2.5 py-2.5 shadow-xl backdrop-blur">
                      {selectedCanvasItem ? (
                        canEditText && selectedItemData ? (
                          <div className="flex min-w-max items-center gap-px text-slate-700">
                            <button
                              onClick={() => openSelectedPanel('fonts')}
                              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition-all ${activeObjectPanel === 'fonts'
                                ? 'border-slate-300 bg-slate-50 text-slate-700 ring-2 ring-slate-200'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                              <span
                                className="max-w-[116px] truncate text-left"
                                style={{ fontFamily: selectedTextFontFamily }}
                              >
                                {selectedTextFontFamily}
                              </span>
                              <ChevronDown size={14} />
                            </button>

                            <ToolbarDivider />

                            <div className="flex h-10 shrink-0 items-center rounded-xl border border-slate-200 bg-white px-1.5">
                              <button
                                onClick={() => handleSelectedTextFontSizeChange(selectedTextFontSize - 2)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-bold transition-all hover:bg-slate-100"
                                title="Decrease font size"
                              >
                                -
                              </button>
                              <button
                                onClick={() => openSelectedPanel('fonts')}
                                className="min-w-[34px] px-1.5 text-[13px] font-bold text-slate-800"
                                title="Open font settings"
                              >
                                {selectedTextFontSize}
                              </button>
                              <button
                                onClick={() => handleSelectedTextFontSizeChange(selectedTextFontSize + 2)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-bold transition-all hover:bg-slate-100"
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
                                className="h-3.5 w-3.5 rounded-full shadow-sm"
                                style={selectedFillPreviewStyle}
                              />
                            </ToolbarIconButton>
                            <ToolbarDivider />

                            <ToolbarIconButton
                              onClick={() => handleToggleSelectedTextFontStyle('bold')}
                              active={isBoldActive}
                              title="Bold"
                            >
                              <Bold size={18} />
                            </ToolbarIconButton>
                            <ToolbarDivider />

                            <ToolbarIconButton
                              onClick={() => handleToggleSelectedTextFontStyle('italic')}
                              active={isItalicActive}
                              title="Italic"
                            >
                              <Italic size={18} />
                            </ToolbarIconButton>
                            <ToolbarDivider />

                            <ToolbarIconButton
                              onClick={() => handleSelectedTextAlignChange(nextTextAlign)}
                              title={`Alignment: ${selectedTextAlign}. Click for ${nextTextAlign}.`}
                            >
                              <CurrentAlignIcon size={17} />
                            </ToolbarIconButton>
                            <ToolbarDivider />

                            <ToolbarIconButton
                              onClick={() => toggleToolbarPopover('opacity')}
                              active={activeToolbarPopover === 'opacity'}
                              title="Transparency"
                            >
                              <Grid3x3 size={17} />
                            </ToolbarIconButton>

                            <ToolbarDivider />

                            <ToolbarPillButton
                              onClick={() => openSelectedPanel('3D')}
                              active={activeObjectPanel === '3D'}
                            >
                              <Sparkles size={14} />
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
                              className="brand-button-outline flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px]"
                            >
                              <Copy size={16} />
                            </button>

                            <ToolbarDivider />

                            <button
                              onClick={handleDeleteSelected}
                              className="brand-button-outline flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px]"
                            >
                              <Trash2 size={16} />
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
                                className="h-3.5 w-3.5 rounded-full shadow-sm"
                                style={selectedFillPreviewStyle}
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
                              className="brand-button-outline flex h-8 shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-[11px]"
                            >
                              <Copy size={15} />
                            </button>

                            <ToolbarDivider />

                            <button
                              onClick={handleDeleteSelected}
                              className="brand-button-outline flex h-8 shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-[11px]"
                            >
                              <Trash2 size={15} />
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
                                  className={`brand-chip-button shrink-0 px-3 py-1.5 text-[12px] font-semibold transition-all ${activeObjectPanel === panel
                                    ? 'bg-slate-100 text-slate-700 ring-2 ring-slate-200'
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
                            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700">
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
                            const isActiveOption = option.id === 'color'
                              ? activeBackgroundOption === 'color' || activeBackgroundOption === 'gradient'
                              : activeBackgroundOption === option.id;

                            return (
                              <Fragment key={option.id}>
                                <button
                                  onClick={() => handleBackgroundOptionSelect(option.id)}
                                  className={`brand-chip-button flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold transition-all ${isActiveOption
                                    ? 'bg-slate-100 text-slate-700 ring-2 ring-slate-200'
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
                      <div className="absolute left-1/2 top-[calc(100%+0.5rem)] z-30 w-[220px] -translate-x-1/2 rounded-3xl border border-slate-200/80 bg-white/98 p-4 shadow-2xl backdrop-blur-md">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-[13px] font-bold tracking-tight text-slate-800">Transparency</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-900 shadow-sm">
                            {selectedOpacityPercent}
                          </span>
                        </div>

                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.01"
                          value={selectedOpacityValue}
                          onChange={(event) => handleSelectedOpacityChange(event.target.value)}
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 transition-all hover:bg-slate-300"
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
                  previewElementsImageUrl={previewElementsImageUrl}
                  setPreviewFullscreenOpen={setPreviewFullscreenOpen}
                  previewFullscreenOpen={previewFullscreenOpen}
                  watermarkEnabled={logoConfig.watermarkEnabled !== false}
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

                <div className="flex w-full flex-col items-center pt-1 sm:pt-2 lg:mt-12 lg:justify-center lg:pt-0">
                  <div className="relative h-[36vh] w-full max-w-[620px] sm:h-[44vh] sm:max-w-[700px] lg:h-[50vh] lg:max-w-[720px]">
                    <LogoCanvas
                      config={logoConfig}
                      onConfigChange={handleCanvasConfigChange}
                      onSelectionChange={handleCanvasSelectionChange}
                      selectionOverride={canvasSelectionOverride}
                      clearSelectionToken={canvasClearSelectionToken}
                      stageRef={stageRef}
                      zoom={1}
                      hasLockedSelection={hasLockedSelection}
                      hideSelectionUi={hideCanvasSelectionUi}
                      clipContentToCard={clipCanvasToCard}
                      renderElementsOnly={renderCanvasElementsOnly}
                      inlineTextEditRequest={inlineTextEditRequest}
                      onTextEditCommit={handleInlineTextEdit}
                    />
                  </div>

                  <DesktopActionDock
                    className="mt-0"
                    onPreview={handlePreviewOpen}
                    onSave={handleSaveDesign}
                    onDownload={handleOpenDownloadDialog}
                    canSave={Boolean(designId)}
                    savingChanges={savingChanges}
                  />
                </div>
              </div>
            </main>
          </div>
        </div>

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

        {savingChanges ? (
          <PremiumLoaderOverlay
            size="full"
            text="Loading editor workspace..."
            className="z-[340] bg-white"
          />
        ) : null}

        <FloatingNotice notice={authNotice} onClose={() => setAuthNotice(null)} />
      </div>
    </>
  );
}
