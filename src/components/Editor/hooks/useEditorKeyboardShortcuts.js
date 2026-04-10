"use client";

import { useEffect, useEffectEvent } from 'react';

function isTextEntryTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return true;
  }

  if (target.tagName !== 'INPUT') {
    return false;
  }

  const inputType = (target.getAttribute('type') || 'text').toLowerCase();
  return [
    'text',
    'search',
    'email',
    'password',
    'url',
    'tel',
    'number',
  ].includes(inputType);
}

export function useEditorKeyboardShortcuts({
  assetPickerDialogOpen,
  closeAssetPickerDialog,
  closeEditDialog,
  colorDialogOpen,
  downloadDialogOpen,
  downloadingFormat,
  editDialogOpen,
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
  selectedCanvasItemsCount,
  setCanvasZoom,
  setColorDialogOpen,
  setDownloadDialogOpen,
  setGradientColorDialogOpen,
  setGradientDialogOpen,
  setPreviewDialogOpen,
  setPreviewFullscreenOpen,
}) {
  const handleSaveShortcut = useEffectEvent(() => {
    handleSaveDesign();
  });

  useEffect(() => {
    if (typeof window === 'undefined' || isMobileViewport) {
      return undefined;
    }

    const handleDialogEscape = (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (downloadDialogOpen && !downloadingFormat) {
        setDownloadDialogOpen(false);
        return;
      }

      if (previewFullscreenOpen) {
        setPreviewFullscreenOpen(false);
        return;
      }

      if (previewDialogOpen) {
        setPreviewDialogOpen(false);
        return;
      }

      if (assetPickerDialogOpen) {
        closeAssetPickerDialog();
        return;
      }

      if (gradientColorDialogOpen) {
        setGradientColorDialogOpen(false);
        setGradientDialogOpen(true);
        return;
      }

      if (gradientDialogOpen) {
        setGradientDialogOpen(false);
        return;
      }

      if (colorDialogOpen) {
        setColorDialogOpen(false);
        return;
      }

      if (editDialogOpen) {
        closeEditDialog();
      }
    };

    window.addEventListener('keydown', handleDialogEscape);
    return () => window.removeEventListener('keydown', handleDialogEscape);
  }, [
    assetPickerDialogOpen,
    closeAssetPickerDialog,
    closeEditDialog,
    colorDialogOpen,
    downloadDialogOpen,
    downloadingFormat,
    editDialogOpen,
    gradientColorDialogOpen,
    gradientDialogOpen,
    isMobileViewport,
    previewDialogOpen,
    previewFullscreenOpen,
    setColorDialogOpen,
    setDownloadDialogOpen,
    setGradientColorDialogOpen,
    setGradientDialogOpen,
    setPreviewDialogOpen,
    setPreviewFullscreenOpen,
  ]);

  useEffect(() => {
    const handleEditorKeyDown = (event) => {
      const modifierPressed = event.ctrlKey || event.metaKey;

      if (modifierPressed && (event.key === 's' || event.key === 'S')) {
        event.preventDefault();
        handleSaveShortcut();
        return;
      }

      const target = event.target;
      const isTypingTarget = isTextEntryTarget(target);

      if (isTypingTarget) {
        return;
      }

      if (!modifierPressed && (event.key === 't' || event.key === 'T')) {
        event.preventDefault();
        handleAddTextLayer({
          startInlineEdit: true,
          closeSidebar: true,
        });
        return;
      }

      // Quick duplicate shortcut (requested): press "D" when something is selected.
      // Keep this disabled while typing in inputs/textareas/contenteditable.
      if (!modifierPressed && selectedCanvasItemsCount && (event.key === 'd' || event.key === 'D')) {
        event.preventDefault();
        handleDuplicateSelected();
        return;
      }

      if (modifierPressed) {
        if (event.key === 'c' || event.key === 'C') {
          event.preventDefault();
          handleCopySelected();
          return;
        }

        if (event.key === 'x' || event.key === 'X') {
          event.preventDefault();
          handleCopySelected();
          handleDeleteSelected();
          return;
        }

        if (event.key === 'v' || event.key === 'V') {
          event.preventDefault();
          handlePasteClipboard();
          return;
        }

        if (event.key === 'd' || event.key === 'D') {
          event.preventDefault();
          handleDuplicateSelected();
          return;
        }

        if ((event.key === 'z' || event.key === 'Z') && event.shiftKey) {
          event.preventDefault();
          handleRedo();
          return;
        }

        if (event.key === 'y' || event.key === 'Y') {
          event.preventDefault();
          handleRedo();
          return;
        }

        if (event.key === 'z' || event.key === 'Z') {
          event.preventDefault();
          handleUndo();
          return;
        }

        if (event.key === '=' || event.key === '+') {
          event.preventDefault();
          setCanvasZoom((prev) => Math.min(2.5, Number((prev + 0.1).toFixed(2))));
          return;
        }

        if (event.key === '-' || event.key === '_') {
          event.preventDefault();
          setCanvasZoom((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(2))));
          return;
        }

        if (event.key === '0') {
          event.preventDefault();
          setCanvasZoom(1);
          return;
        }
      }

      if (!selectedCanvasItemsCount) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        handleDeleteSelected();
        return;
      }

      const movement = event.shiftKey ? 24 : 12;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleNudge(0, -movement);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleNudge(0, movement);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleNudge(-movement, 0);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNudge(movement, 0);
      }
    };

    window.addEventListener('keydown', handleEditorKeyDown);
    return () => window.removeEventListener('keydown', handleEditorKeyDown);
  }, [
    handleCopySelected,
    handleAddTextLayer,
    handleDeleteSelected,
    handleDuplicateSelected,
    handleNudge,
    handlePasteClipboard,
    handleRedo,
    handleUndo,
    selectedCanvasItemsCount,
    setCanvasZoom,
  ]);
}
