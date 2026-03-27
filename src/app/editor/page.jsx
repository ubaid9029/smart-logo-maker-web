"use client";
import React, { useCallback, useMemo, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import DownloadDialog from '../../components/DownloadDialog';
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
  getCollectionNameByType,
  isValidHexColor,
  normalizeHexColor,
} from '../../components/Editor/editorUtils';
import {
  Type,
  Images,
  Trash2,
  Undo2,
  Redo2,
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

  const [activeTool, setActiveTool] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeObjectPanel, setActiveObjectPanel] = useState('controls');
  const imageInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);
  const stageRef = useRef(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const isMobileViewport = useEditorViewport();
  const clipboardRef = useRef([]);
  const [editDialog, setEditDialog] = useState({
    ...EMPTY_EDIT_DIALOG,
  });
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
    setSidebarOpen,
    urlBgColor,
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

  const {
    closeEditDialog,
    updateSelectedItemStyle,
    handleSelectedTextFontChange,
    handleSelectedTextFontSizeChange,
    handleNudge,
    handleSelectedOpacityChange,
    handleScaleSelected,
    handleRotateSelected,
    handleResetSelectedTransform,
    handleCenter,
    handleDuplicateSelected,
    handleDeleteSelected,
    handleCopySelected,
    handlePasteClipboard,
    handleEditSelectedText,
    handleSaveEditedText,
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
    initialBusinessValue,
    logoConfig,
    payloadKey,
    router,
    stageRef,
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

  const sidebarHeading = selectedCanvasItem ? activeObjectPanel.charAt(0).toUpperCase() + activeObjectPanel.slice(1) : 'Variations';
  const movementStep = 12;
  const selectedStyle = selectedItemData?.style || {};
  const canUndo = editorState.past.length > 0;
  const canRedo = editorState.future.length > 0;
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
  useEditorSidebarVisibility({ setSidebarOpen, shouldShowDesktopSidebar });

  const {
    handleImageUpload,
    handleAddPresetArt,
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
    setEditDialog,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
    setSidebarOpen,
  });

  const editorSidebarProps = {
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
    AVAILABLE_EDITOR_FONTS,
    artLibraryImages,
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
    handleEditSelectedText,
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
      canEditSingleText={canEditSingleText}
      handleBackgroundOptionSelect={handleBackgroundOptionSelect}
      handleDeleteSelected={handleDeleteSelected}
      handleDuplicateSelected={handleDuplicateSelected}
      handleEditSelectedText={handleEditSelectedText}
      objectPanels={objectPanels}
      selectedCanvasItem={selectedCanvasItem}
      setActiveObjectPanel={setActiveObjectPanel}
    />
  );

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
        <aside className="hidden w-[300px] shrink-0 flex-col border-r border-gray-100 bg-white xl:w-[320px] lg:flex">
          <div className="border-b border-gray-50 p-8">
            <h2 className={`text-xs font-black uppercase tracking-widest ${gradients.text}`}>{sidebarHeading}</h2>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 space-y-4">
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
            className="absolute left-3 z-20 hidden items-center gap-2 sm:left-4 lg:flex lg:bottom-auto lg:left-6 lg:top-6 lg:gap-3"
            style={mobileFloatingControlsStyle}
          >
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`brand-icon-button flex h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur transition-all lg:h-11 lg:w-11 ${
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
              className={`brand-icon-button flex h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur transition-all lg:h-11 lg:w-11 ${
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
    </div>
  );
}

