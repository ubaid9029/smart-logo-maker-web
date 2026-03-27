"use client";

import { useCallback } from 'react';
import { CARD_HEIGHT, CARD_WIDTH, CARD_X, CARD_Y, EMPTY_EDIT_DIALOG } from '../editorConstants';
import {
  applyStyleToTextItem,
  extractTextTemplate,
  clampTransformToCard,
  getPreferredTextTemplateSource,
  getTextMetrics,
  preserveTextCenterTransform,
  withMeasuredTextBox,
} from '../editorUtils';

export function useEditorObjectActions({
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
}) {
  const closeEditDialog = useCallback(() => {
    setEditDialog(EMPTY_EDIT_DIALOG);
  }, [setEditDialog]);

  const getResolvedTextProps = useCallback((item) => {
    const fallbackTemplate = extractTextTemplate(logoConfig.textTemplate || {}, {
      fill: logoConfig.textColor || '#1A1A1A',
      fontFamily: logoConfig.fontFamily || 'Arial',
    });
    const resolvedTemplate = extractTextTemplate(item, fallbackTemplate);

    return {
      ...item,
      fill: resolvedTemplate.fill,
      fontFamily: resolvedTemplate.fontFamily,
      fontUrl: item.fontUrl || resolvedTemplate.fontUrl || null,
      fontStyle: resolvedTemplate.fontStyle,
      align: resolvedTemplate.align,
      letterSpacing: resolvedTemplate.letterSpacing,
      style: resolvedTemplate.style,
    };
  }, [logoConfig.fontFamily, logoConfig.textColor, logoConfig.textTemplate]);

  const updateSelectedElements = useCallback((updater) => {
    if (!selectedItemKeySet.size) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const nextLogoItems = (prev.logoItems || []).map((item) => {
        if (!selectedItemKeySet.has(`logo:${item.id}`)) {
          return item;
        }

        const nextItem = updater('logo', item);
        return nextItem
          ? {
              ...nextItem,
              transform: clampTransformToCard('logo', nextItem, nextItem.transform),
            }
          : null;
      }).filter(Boolean);
      const nextTextItems = (prev.textItems || []).map((item) => {
        if (!selectedItemKeySet.has(`text:${item.id}`)) {
          return item;
        }

        const nextItem = updater('text', item);
        return nextItem
          ? {
              ...nextItem,
              transform: clampTransformToCard('text', nextItem, nextItem.transform),
            }
          : null;
      }).filter(Boolean);
      const selectedTextIds = Array.from(selectedItemKeySet)
        .filter((key) => key.startsWith('text:'))
        .map((key) => key.slice(5));
      const templateSource = getPreferredTextTemplateSource(nextTextItems, selectedTextIds);

      return {
        ...prev,
        logoItems: nextLogoItems,
        textItems: nextTextItems,
        textTemplate: templateSource
          ? extractTextTemplate(templateSource, prev.textTemplate)
          : prev.textTemplate,
      };
    });
  }, [applyLogoConfigChange, selectedItemKeySet]);

  const updateSelectedItemStyle = useCallback((styleUpdate) => {
    updateSelectedElements((type, item) => {
      const currentStyle = item.style || {};
      const resolvedStyleUpdate = typeof styleUpdate === 'function'
        ? styleUpdate(currentStyle)
        : styleUpdate;
      const shouldEnableColorOverrides = Boolean(
        currentStyle.applyColorOverrides ||
        resolvedStyleUpdate?.fillColor !== undefined ||
        resolvedStyleUpdate?.outlineColor !== undefined
      );
      const nextStyle = {
        ...currentStyle,
        ...resolvedStyleUpdate,
        applyColorOverrides: shouldEnableColorOverrides,
      };

      if (type === 'text') {
        return applyStyleToTextItem(getResolvedTextProps(item), nextStyle);
      }

      return {
        ...item,
        style: nextStyle,
      };
    });
  }, [getResolvedTextProps, updateSelectedElements]);

  const handleSelectedTextFontChange = useCallback((fontFamily) => {
    if (!canEditText || !fontFamily) {
      return;
    }

    updateSelectedElements((type, item) => {
      if (type !== 'text') {
        return item;
      }

      const nextItem = withMeasuredTextBox({
        ...getResolvedTextProps(item),
        fontFamily,
        fontUrl: null,
        renderMode: 'text',
        svgDataUri: null,
        width: 0,
        height: 0,
      });

      return {
        ...nextItem,
        transform: preserveTextCenterTransform(item, nextItem),
      };
    });
  }, [canEditText, getResolvedTextProps, updateSelectedElements]);

  const handleSelectedTextFontSizeChange = useCallback((fontSizeValue) => {
    if (!canEditText) {
      return;
    }

    const safeFontSize = Math.max(12, Math.min(120, Number(fontSizeValue || 46)));

    updateSelectedElements((type, item) => {
      if (type !== 'text') {
        return item;
      }

      const nextItem = withMeasuredTextBox({
        ...getResolvedTextProps(item),
        fontSize: safeFontSize,
        renderMode: 'text',
        svgDataUri: null,
        width: 0,
        height: 0,
      });

      return {
        ...nextItem,
        transform: preserveTextCenterTransform(item, nextItem),
      };
    });
  }, [canEditText, getResolvedTextProps, updateSelectedElements]);

  const handleNudge = useCallback((dx, dy) => {
    updateSelectedElements((type, item) => ({
      ...item,
      transform: {
        ...item.transform,
        x: item.transform.x + dx,
        y: item.transform.y + dy,
      },
    }));
  }, [updateSelectedElements]);

  const handleSelectedOpacityChange = useCallback((opacityValue) => {
    const nextOpacity = Math.max(0.05, Math.min(1, Number(opacityValue || 1)));

    updateSelectedElements((type, item) => ({
      ...item,
      opacity: nextOpacity,
    }));
  }, [updateSelectedElements]);

  const handleScaleSelected = useCallback((scaleValue) => {
    const safeScale = Math.max(0.2, Math.min(3, Number(scaleValue || 1)));

    updateSelectedElements((type, item) => {
      const currentTransform = item.transform || {};
      const currentScaleX = Math.abs(currentTransform.scaleX ?? 1);
      const currentScaleY = Math.abs(currentTransform.scaleY ?? 1);
      const nextScaleX = safeScale * Math.sign(currentTransform.scaleX || 1 || 1);
      const nextScaleY = safeScale * Math.sign(currentTransform.scaleY || 1 || 1);
      const baseMetrics = type === 'logo'
        ? {
            width: Number(item.baseWidth || item.width || 280),
            height: Number(item.baseHeight || item.height || 200),
          }
        : getTextMetrics(item);
      const centerX = (currentTransform.x ?? 0) + (baseMetrics.width * currentScaleX) / 2;
      const centerY = (currentTransform.y ?? 0) + (baseMetrics.height * currentScaleY) / 2;

      return {
        ...item,
        transform: {
          ...currentTransform,
          scaleX: nextScaleX,
          scaleY: nextScaleY,
          x: centerX - (baseMetrics.width * Math.abs(nextScaleX)) / 2,
          y: centerY - (baseMetrics.height * Math.abs(nextScaleY)) / 2,
        },
      };
    });
  }, [updateSelectedElements]);

  const handleRotateSelected = useCallback((rotationValue) => {
    const safeRotation = Number(rotationValue || 0);

    updateSelectedElements((type, item) => ({
      ...item,
      transform: {
        ...item.transform,
        rotation: safeRotation,
      },
    }));
  }, [updateSelectedElements]);

  const handleResetSelectedTransform = useCallback(() => {
    updateSelectedElements((type, item) => {
      const currentTransform = item.transform || {};
      const currentScaleX = Math.abs(currentTransform.scaleX ?? 1);
      const currentScaleY = Math.abs(currentTransform.scaleY ?? 1);
      const baseMetrics = type === 'logo'
        ? {
            width: Number(item.baseWidth || item.width || 280),
            height: Number(item.baseHeight || item.height || 200),
          }
        : getTextMetrics(item);
      const centerX = (currentTransform.x ?? 0) + (baseMetrics.width * currentScaleX) / 2;
      const centerY = (currentTransform.y ?? 0) + (baseMetrics.height * currentScaleY) / 2;

      return {
        ...item,
        transform: {
          ...currentTransform,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          x: centerX - baseMetrics.width / 2,
          y: centerY - baseMetrics.height / 2,
        },
      };
    });
  }, [updateSelectedElements]);

  const handleCenter = useCallback((axis) => {
    updateSelectedElements((type, item) => {
      if (type === 'logo') {
        const width = Number(item.baseWidth || item.width || 280) * Math.abs(item.transform.scaleX || 1);
        const height = Number(item.baseHeight || item.height || 200) * Math.abs(item.transform.scaleY || 1);

        return {
          ...item,
          transform: {
            ...item.transform,
            x: axis === 'x' ? CARD_X + (CARD_WIDTH - width) / 2 : item.transform.x,
            y: axis === 'y' ? CARD_Y + (CARD_HEIGHT - height) / 2 : item.transform.y,
          },
        };
      }

      const metrics = getTextMetrics(item);
      const width = metrics.width * Math.abs(item.transform.scaleX || 1);
      const height = metrics.height * Math.abs(item.transform.scaleY || 1);

      return {
        ...item,
        transform: {
          ...item.transform,
          x: axis === 'x' ? CARD_X + (CARD_WIDTH - width) / 2 : item.transform.x,
          y: axis === 'y' ? CARD_Y + (CARD_HEIGHT - height) / 2 : item.transform.y,
        },
      };
    });
  }, [updateSelectedElements]);

  const handleDuplicateSelected = useCallback(() => {
    if (!selectedCanvasItems.length) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const duplicateOffset = { x: 24, y: 24 };
      const nextSelections = [];
      const duplicatedLogos = [];
      const duplicatedTexts = [];

      selectedCanvasItems.forEach((selection, index) => {
        if (selection.type === 'logo') {
          const sourceItem = (prev.logoItems || []).find((item) => item.id === selection.id);
          if (!sourceItem) {
            return;
          }

          const duplicateId = `logo-${Date.now()}-${index}`;
          duplicatedLogos.push({
            ...sourceItem,
            id: duplicateId,
            transform: {
              ...sourceItem.transform,
              x: sourceItem.transform.x + duplicateOffset.x,
              y: sourceItem.transform.y + duplicateOffset.y,
            },
          });
          nextSelections.push({ type: 'logo', id: duplicateId });
          return;
        }

        if (selection.type === 'text') {
          const sourceItem = (prev.textItems || []).find((item) => item.id === selection.id);
          if (!sourceItem) {
            return;
          }

          const duplicateId = `text-${Date.now()}-${index}`;
          duplicatedTexts.push({
            ...sourceItem,
            id: duplicateId,
            transform: {
              ...sourceItem.transform,
              x: sourceItem.transform.x + duplicateOffset.x,
              y: sourceItem.transform.y + duplicateOffset.y,
            },
          });
          nextSelections.push({ type: 'text', id: duplicateId });
        }
      });

      const nextPrimarySelection = nextSelections[nextSelections.length - 1] || null;
      selectedCanvasItemRef.current = nextPrimarySelection;
      setSelectedCanvasItem(nextPrimarySelection);
      setSelectedCanvasItems(nextSelections);
      setCanvasSelectionOverride(
        nextPrimarySelection
          ? { primary: nextPrimarySelection, items: nextSelections }
          : null
      );

      return {
        ...prev,
        logoItems: [...(prev.logoItems || []), ...duplicatedLogos],
        textItems: [...(prev.textItems || []), ...duplicatedTexts],
      };
    });
  }, [
    applyLogoConfigChange,
    selectedCanvasItems,
    selectedCanvasItemRef,
    setCanvasSelectionOverride,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
  ]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedItemKeySet.size) {
      return;
    }

    applyLogoConfigChange((prev) => ({
      ...prev,
      logoItems: (prev.logoItems || []).filter((item) => !selectedItemKeySet.has(`logo:${item.id}`)),
      textItems: (prev.textItems || []).filter((item) => !selectedItemKeySet.has(`text:${item.id}`)),
    }));
    clearCanvasSelection();
  }, [applyLogoConfigChange, clearCanvasSelection, selectedItemKeySet]);

  const handleCopySelected = useCallback(() => {
    if (!selectedCanvasItems.length) {
      return;
    }

    clipboardRef.current = selectedCanvasItems.map((selection) => {
      if (selection.type === 'logo') {
        const sourceItem = (logoConfig.logoItems || []).find((item) => item.id === selection.id);
        return sourceItem ? { type: 'logo', item: sourceItem } : null;
      }

      const sourceItem = (logoConfig.textItems || []).find((item) => item.id === selection.id);
      return sourceItem ? { type: 'text', item: sourceItem } : null;
    }).filter(Boolean);
  }, [clipboardRef, logoConfig.logoItems, logoConfig.textItems, selectedCanvasItems]);

  const handlePasteClipboard = useCallback(() => {
    if (!clipboardRef.current.length) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const duplicateOffset = { x: 28, y: 28 };
      const nextLogoItems = [...(prev.logoItems || [])];
      const nextTextItems = [...(prev.textItems || [])];

      clipboardRef.current.forEach((entry, index) => {
        if (entry.type === 'logo') {
          const duplicateId = `logo-${Date.now()}-${index}`;
          nextLogoItems.push({
            ...entry.item,
            id: duplicateId,
            transform: {
              ...entry.item.transform,
              x: (entry.item.transform?.x || CARD_X + 170) + duplicateOffset.x,
              y: (entry.item.transform?.y || CARD_Y + 64) + duplicateOffset.y,
            },
          });
          return;
        }

        const duplicateId = `text-${Date.now()}-${index}`;
        nextTextItems.push({
          ...entry.item,
          id: duplicateId,
          transform: {
            ...entry.item.transform,
            x: (entry.item.transform?.x || CARD_X + 110) + duplicateOffset.x,
            y: (entry.item.transform?.y || CARD_Y + CARD_HEIGHT - 150) + duplicateOffset.y,
          },
        });
      });

      return {
        ...prev,
        logoItems: nextLogoItems,
        textItems: nextTextItems,
      };
    });

    selectedCanvasItemRef.current = null;
    setSelectedCanvasItem(null);
    setSelectedCanvasItems([]);
    setCanvasSelectionOverride(null);
    setCanvasClearSelectionToken((value) => value + 1);
  }, [
    applyLogoConfigChange,
    clipboardRef,
    selectedCanvasItemRef,
    setCanvasClearSelectionToken,
    setCanvasSelectionOverride,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
  ]);

  const handleEditSelectedText = useCallback(() => {
    if (!canEditSingleText || !selectedCanvasItem) {
      return;
    }

    const targetCollection = logoConfig.textItems || [];
    const targetItem = targetCollection.find((item) => item.id === selectedCanvasItem.id);

    if (!targetItem) {
      return;
    }

    setEditDialog({
      open: true,
      type: 'text',
      mode: targetItem.text ? 'plain-text' : 'brand-line',
      id: selectedCanvasItem.id,
      businessValue: targetItem.text || targetItem.businessValue || '',
      sloganValue: targetItem.text ? '' : targetItem.sloganValue || '',
    });
  }, [canEditSingleText, logoConfig.textItems, selectedCanvasItem, setEditDialog]);

  const handleSaveEditedText = useCallback(() => {
    if (!editDialog.open || !editDialog.type || !editDialog.id) {
      return;
    }

    const nextBusinessValue = editDialog.businessValue.trim();
    if (!nextBusinessValue) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const targetCollection = prev.textItems || [];
      const nextTextItems = targetCollection.map((item) =>
        item.id === editDialog.id
          ? (() => {
              const nextItem = {
                ...getResolvedTextProps(item),
                ...(editDialog.mode === 'plain-text'
                  ? {
                      text: nextBusinessValue,
                    }
                  : {
                      businessValue: nextBusinessValue,
                      sloganValue: editDialog.sloganValue.trim(),
                    }),
                renderMode: 'text',
                svgDataUri: null,
                width: 0,
                height: 0,
              };
              const measuredItem = withMeasuredTextBox(nextItem);

              return {
                ...measuredItem,
                transform: preserveTextCenterTransform(item, measuredItem),
              };
            })()
          : item
      );
      const templateSource = getPreferredTextTemplateSource(nextTextItems, [editDialog.id]);

      return {
        ...prev,
        textItems: nextTextItems,
        textTemplate: templateSource
          ? extractTextTemplate(templateSource, prev.textTemplate)
          : prev.textTemplate,
      };
    });

    setEditDialog(EMPTY_EDIT_DIALOG);
  }, [applyLogoConfigChange, editDialog, getResolvedTextProps, setEditDialog]);

  return {
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
  };
}
