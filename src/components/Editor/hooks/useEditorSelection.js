"use client";

import { useCallback, useRef, useState } from 'react';

export function useEditorSelection({ activeTool, isMobileViewport, setActiveObjectPanel, setActiveTool, setSidebarOpen }) {
  const [selectedCanvasItem, setSelectedCanvasItem] = useState(null);
  const [selectedCanvasItems, setSelectedCanvasItems] = useState([]);
  const selectedCanvasItemRef = useRef(null);
  const [canvasSelectionOverride, setCanvasSelectionOverride] = useState(null);
  const [canvasClearSelectionToken, setCanvasClearSelectionToken] = useState(0);

  const handleCanvasSelectionChange = useCallback((selectionState) => {
    const nextPrimaryItem = selectionState?.primary || null;
    const nextItems = Array.isArray(selectionState?.items) ? selectionState.items : (nextPrimaryItem ? [nextPrimaryItem] : []);

    selectedCanvasItemRef.current = nextPrimaryItem;
    setSelectedCanvasItem(nextPrimaryItem);
    setSelectedCanvasItems(nextItems);

    if (nextPrimaryItem) {
      setActiveTool(null);
      setActiveObjectPanel('controls');
      setSidebarOpen(true);
    } else {
      setActiveObjectPanel(null);
      if (!isMobileViewport || !activeTool) {
        setSidebarOpen(false);
      }
    }
  }, [activeTool, isMobileViewport, setActiveObjectPanel, setActiveTool, setSidebarOpen]);

  const clearCanvasSelection = useCallback(() => {
    selectedCanvasItemRef.current = null;
    setSelectedCanvasItem(null);
    setSelectedCanvasItems([]);
    setCanvasSelectionOverride(null);
    setCanvasClearSelectionToken((value) => value + 1);
  }, []);

  return {
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
  };
}
