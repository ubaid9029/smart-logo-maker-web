"use client";

import { useCallback } from 'react';
import { CARD_HEIGHT, CARD_X, CARD_Y } from '../editorConstants';
import { buildDefaultItemStyle, buildTextItemFromTemplate, extractTextTemplate } from '../editorUtils';

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
  setEditDialog,
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

      selectSingleCanvasItem(
        { type: 'logo', id: newId },
        { panel: 'controls', closeSidebar: true }
      );
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  }, [applyLogoConfigChange, selectSingleCanvasItem]);

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

      applyLogoConfigChange((prev) => ({
        ...prev,
        bgImageUrl: imageUrl,
        bgFill: null,
      }));
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  }, [applyLogoConfigChange]);

  const handleAddTextLayer = useCallback(() => {
    const newId = `text-${Date.now()}`;
    const sourceTextItem = (logoConfig.textItems || []).find((item) => item?.id === 'brand-name')
      || (logoConfig.textItems || [])[0]
      || null;
    const nextTextTemplate = sourceTextItem
      ? extractTextTemplate(sourceTextItem, logoConfig.textTemplate)
      : extractTextTemplate(logoConfig.textTemplate, {
          fill: logoConfig.textColor || '#1A1A1A',
          fontFamily: logoConfig.fontFamily || 'Arial',
        });
    const nextTextItem = buildTextItemFromTemplate({
      id: newId,
      text: '',
      transform: {
        x: CARD_X + 110,
        y: CARD_Y + CARD_HEIGHT - 150,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      template: nextTextTemplate,
    });

    applyLogoConfigChange((prev) => ({
      ...prev,
      textItems: [...(prev.textItems || []), nextTextItem],
    }));

    selectSingleCanvasItem(
      { type: 'text', id: newId },
      { panel: 'controls', closeSidebar: true }
    );

    setEditDialog({
      open: true,
      type: 'text',
      mode: 'plain-text',
      id: newId,
      businessValue: nextTextItem.text,
      sloganValue: '',
    });
  }, [applyLogoConfigChange, logoConfig.fontFamily, logoConfig.textColor, logoConfig.textItems, logoConfig.textTemplate, selectSingleCanvasItem, setEditDialog]);

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
    handleAddPresetArt,
    handleBackgroundImageUpload,
    handleAddTextLayer,
    handleEditorToolSelect,
    handleMobileToolSelect,
  };
}
