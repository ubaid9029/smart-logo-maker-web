"use client";

import { useCallback } from 'react';
import { CARD_HEIGHT, CARD_WIDTH, CARD_X, CARD_Y } from '../editorConstants';
import {
  buildDefaultItemStyle,
  buildShapeItemFromType,
  buildTextItemFromTemplate,
  extractTextTemplate,
  getAssetDisplayLabel,
  getCanvasLayerKey,
  syncCanvasLayerOrder,
} from '../editorUtils';

export function useEditorInsertions({
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
}) {
  const selectSingleCanvasItem = useCallback((nextSelection, options = {}) => {
    selectedCanvasItemRef.current = nextSelection;
    setSelectedCanvasItem(nextSelection);
    setSelectedCanvasItems(nextSelection ? [nextSelection] : []);
    setCanvasSelectionOverride(nextSelection);

    if (options.panel) {
      setActiveObjectPanel(options.panel);
    }

    if (options.closeSidebar) {
      setSidebarOpen(false);
    }
  }, [
    selectedCanvasItemRef,
    setActiveObjectPanel,
    setCanvasSelectionOverride,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
    setSidebarOpen,
  ]);
  const defaultInsertedBackgroundAssetWidth = Math.round(CARD_WIDTH * 0.72);
  const defaultInsertedBackgroundAssetHeight = Math.round(CARD_HEIGHT * 0.72);
  const defaultInsertedBackgroundAssetX = CARD_X + ((CARD_WIDTH - defaultInsertedBackgroundAssetWidth) / 2);
  const defaultInsertedBackgroundAssetY = CARD_Y + ((CARD_HEIGHT - defaultInsertedBackgroundAssetHeight) / 2);

  const addCanvasImageElement = useCallback((imageUrl, options = {}) => {
    if (!imageUrl) {
      return null;
    }

    const newId = `logo-${Date.now()}`;
    const baseWidth = Math.max(48, Number(options.baseWidth || 220));
    const baseHeight = Math.max(48, Number(options.baseHeight || 160));
    const nextLogoItem = {
      id: newId,
      imageUrl,
      isBackground: Boolean(options.isBackground),
      baseWidth,
      baseHeight,
      transform: {
        x: Number(options.x ?? (CARD_X + (CARD_WIDTH - baseWidth) / 2)),
        y: Number(options.y ?? (CARD_Y + (CARD_HEIGHT - baseHeight) / 2)),
        scaleX: Number(options.scaleX ?? 1),
        scaleY: Number(options.scaleY ?? 1),
        rotation: Number(options.rotation ?? 0),
      },
      style: buildDefaultItemStyle('#111827'),
      layerLabel: typeof options.layerLabel === 'string' && options.layerLabel.trim()
        ? options.layerLabel.trim()
        : getAssetDisplayLabel(imageUrl, imageUrl.startsWith('data:') ? 'Uploaded image' : 'Image'),
    };

    applyLogoConfigChange((prev) => ({
      ...prev,
      logoItems: [...(prev.logoItems || []), nextLogoItem],
      layerOrder: [
        ...syncCanvasLayerOrder(prev.layerOrder, prev.logoItems || [], prev.textItems || []),
        getCanvasLayerKey('logo', newId),
      ].filter(Boolean),
    }));

    selectSingleCanvasItem(
      { type: 'logo', id: newId },
      { panel: 'controls', closeSidebar: Boolean(options.closeSidebar) }
    );

    return newId;
  }, [applyLogoConfigChange, selectSingleCanvasItem]);

  const handleImageUpload = useCallback((event) => {
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
      addCanvasImageElement(imageUrl, {
        baseWidth: 220,
        baseHeight: 160,
        x: CARD_X + 170,
        y: CARD_Y + 64,
        closeSidebar: true,
        layerLabel: file.name ? getAssetDisplayLabel(file.name, 'Uploaded image') : 'Uploaded image',
      });
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  }, [addCanvasImageElement]);

  const handleAddPresetArt = useCallback((imageUrl) => {
    if (!imageUrl) {
      return;
    }
    addCanvasImageElement(imageUrl, {
      baseWidth: 220,
      baseHeight: 160,
      x: CARD_X + 170,
      y: CARD_Y + 64,
      layerLabel: getAssetDisplayLabel(imageUrl, 'Art'),
    });
  }, [addCanvasImageElement]);

  const handleAddShapeElement = useCallback((shapeType) => {
    if (!shapeType || shapeType === 'none') {
      return;
    }

    const newId = `shape-${Date.now()}`;
    const nextShapeItem = buildShapeItemFromType({
      id: newId,
      shapeType,
      transform: {
        x: CARD_X + 180,
        y: CARD_Y + 96,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    });

    applyLogoConfigChange((prev) => ({
      ...prev,
      logoItems: [...(prev.logoItems || []), nextShapeItem],
      layerOrder: [
        ...syncCanvasLayerOrder(prev.layerOrder, prev.logoItems || [], prev.textItems || []),
        getCanvasLayerKey('logo', newId),
      ].filter(Boolean),
    }));

    selectSingleCanvasItem(
      { type: 'logo', id: newId },
      { panel: 'controls' }
    );
  }, [applyLogoConfigChange, selectSingleCanvasItem]);

  const handleBackgroundImageUpload = useCallback((event) => {
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
      addCanvasImageElement(imageUrl, {
        baseWidth: defaultInsertedBackgroundAssetWidth,
        baseHeight: defaultInsertedBackgroundAssetHeight,
        x: defaultInsertedBackgroundAssetX,
        y: defaultInsertedBackgroundAssetY,
        isBackground: true,
        layerLabel: file.name ? getAssetDisplayLabel(file.name, 'Uploaded image') : 'Uploaded image',
      });
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  }, [
    addCanvasImageElement,
    defaultInsertedBackgroundAssetHeight,
    defaultInsertedBackgroundAssetWidth,
    defaultInsertedBackgroundAssetX,
    defaultInsertedBackgroundAssetY,
  ]);

  const handleAddTextLayer = useCallback((options = {}) => {
    const newId = `text-${Date.now()}`;
    const sourceTextItem = (logoConfig.textItems || []).find((item) => item?.id === 'brand-name')
      || (logoConfig.textItems || [])[0]
      || null;
    const defaultTextTemplate = {
      fill: logoConfig.textColor || '#1A1A1A',
      fontFamily: logoConfig.fontFamily || 'Arial',
      fontStyle: 'normal',
    };
    const sourceTextTemplate = sourceTextItem
      ? extractTextTemplate(sourceTextItem, defaultTextTemplate)
      : defaultTextTemplate;
    const nextTextTemplate = extractTextTemplate(logoConfig.textTemplate || {}, sourceTextTemplate);
    const nextTextColor = nextTextTemplate.fill || logoConfig.textColor || sourceTextTemplate.fill || '#1A1A1A';
    const nextFontFamily = nextTextTemplate.fontFamily || logoConfig.fontFamily || sourceTextTemplate.fontFamily || 'Arial';
    const nextTextItemDraft = buildTextItemFromTemplate({
      id: newId,
      text: '',
      transform: {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      template: {
        fill: nextTextColor,
        fontFamily: nextFontFamily,
        align: 'center',
        fontSize: 28,
        fontStyle: 'normal',
        fontWeight: null,
        lineHeight: null,
        letterSpacing: 0,
        style: {},
      },
    });
    const nextTextItem = {
      ...nextTextItemDraft,
      transform: {
        ...nextTextItemDraft.transform,
        x: CARD_X + ((CARD_WIDTH - Number(nextTextItemDraft.width || 160)) / 2),
        y: CARD_Y + ((CARD_HEIGHT - Number(nextTextItemDraft.height || 52)) / 2),
      },
    };

    applyLogoConfigChange((prev) => ({
      ...prev,
      textItems: [...(prev.textItems || []), nextTextItem],
      layerOrder: [
        ...syncCanvasLayerOrder(prev.layerOrder, prev.logoItems || [], prev.textItems || []),
        getCanvasLayerKey('text', newId),
      ].filter(Boolean),
    }));

    selectSingleCanvasItem(
      { type: 'text', id: newId },
      { panel: 'controls', closeSidebar: Boolean(options.closeSidebar ?? true) }
    );

    if (options.startInlineEdit !== false) {
      setInlineTextEditRequest({
        id: newId,
        nonce: Date.now(),
        clearSelectionOnCommit: true,
      });
    }

    return newId;
  }, [applyLogoConfigChange, logoConfig.fontFamily, logoConfig.textColor, logoConfig.textItems, logoConfig.textTemplate, selectSingleCanvasItem, setInlineTextEditRequest]);

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
  }, [
    clearCanvasSelection,
    closeEditorOverlays,
    handleAddTextLayer,
    openImageBrowser,
    setActiveBackgroundOption,
    setActiveTool,
    setSidebarOpen,
  ]);

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
  }, [handleEditorToolSelect, selectedCanvasItem, setActiveObjectPanel, setActiveTool, setSidebarOpen]);

  return {
    handleImageUpload,
    addCanvasImageElement,
    handleAddPresetArt,
    handleAddShapeElement,
    handleBackgroundImageUpload,
    handleAddTextLayer,
    handleEditorToolSelect,
    handleMobileToolSelect,
  };
}
