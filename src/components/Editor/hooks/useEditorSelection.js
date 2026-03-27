"use client";

import { useCallback, useRef, useState } from 'react';

export function useEditorSelection({ setActiveObjectPanel, setActiveTool, setSidebarOpen }) {
  const [selectedCanvasItem, setSelectedCanvasItem] = useState(null);
  const [selectedCanvasItems, setSelectedCanvasItems] = useState([]);
  const selectedCanvasItemRef = useRef(null);
  const [canvasSelectionOverride, setCanvasSelectionOverride] = useState(null);
  const [canvasClearSelectionToken, setCanvasClearSelectionToken] = useState(0);

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
  }, [setActiveObjectPanel, setActiveTool, setSidebarOpen]);

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
