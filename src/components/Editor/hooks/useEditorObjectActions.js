"use client";

import { useCallback } from 'react';
import { getEditorFontOption } from '../../../lib/editorFonts';
import { CARD_HEIGHT, CARD_WIDTH, CARD_X, CARD_Y, EMPTY_EDIT_DIALOG } from '../editorConstants';
import {
  applyStyleToTextItem,
  bakeTextTransformIntoTypography,
  buildShapeItemFromBackgroundShape,
  clampTransformToCard,
  extractTextTemplate,
  getCanvasLayerKey,
  getEditableTextBaseFontSize,
  getEffectiveTextFontSize,
  isCanvasItemLocked,
  getPreferredTextTemplateSource,
  resolveTextFontSizeFromRenderedTarget,
  getTextMetrics,
  moveCanvasLayers,
  normalizeTextFontWeight,
  preserveTextAnchorTransform,
  preserveTextPositionTransform,
  syncCanvasLayerOrder,
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

  const hasLockedSelection = selectedCanvasItems.some((selection) => {
    const sourceItem = selection.type === 'logo'
      ? (logoConfig.logoItems || []).find((item) => item.id === selection.id)
      : (logoConfig.textItems || []).find((item) => item.id === selection.id);

    return isCanvasItemLocked(sourceItem);
  });

  const getResolvedTextProps = useCallback((item) => {
    const fallbackTemplate = extractTextTemplate(logoConfig.textTemplate || {}, {
      fill: logoConfig.textColor || '#1A1A1A',
      fontFamily: logoConfig.fontFamily || 'Arial',
    });
    const resolvedTemplate = extractTextTemplate(item, fallbackTemplate);

    return {
      ...item,
      fontSize: getEditableTextBaseFontSize(item),
      fill: resolvedTemplate.fill,
      fontFamily: resolvedTemplate.fontFamily,
      fontUrl: item.fontUrl || resolvedTemplate.fontUrl || null,
      fontStyle: resolvedTemplate.fontStyle,
      fontWeight: resolvedTemplate.fontWeight,
      lineHeight: resolvedTemplate.lineHeight,
      align: resolvedTemplate.align,
      letterSpacing: resolvedTemplate.letterSpacing,
      style: resolvedTemplate.style,
    };
  }, [logoConfig.fontFamily, logoConfig.textColor, logoConfig.textTemplate]);

  const normalizeFontStyleValue = useCallback((fontStyleValue) => {
    const tokens = new Set(
      String(fontStyleValue || 'normal')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
    );
    const orderedTokens = ['bold', 'italic'].filter((token) => tokens.has(token));

    return orderedTokens.length ? orderedTokens.join(' ') : 'normal';
  }, []);

  const syncFontWeightWithStyle = useCallback((item, nextFontStyle) => {
    const normalizedFontStyle = normalizeFontStyleValue(nextFontStyle);
    const currentFontWeight = normalizeTextFontWeight(item?.fontWeight, normalizedFontStyle.includes('bold') ? 700 : 400);

    if (normalizedFontStyle.includes('bold')) {
      return currentFontWeight && currentFontWeight >= 600 ? currentFontWeight : 700;
    }

    if (currentFontWeight && currentFontWeight < 600) {
      return currentFontWeight;
    }

    return 400;
  }, [normalizeFontStyleValue]);

  const getBaseItemMetrics = useCallback((type, item) => (
    type === 'logo'
      ? {
        width: Number(item.baseWidth || item.width || 280),
        height: Number(item.baseHeight || item.height || 200),
      }
      : getTextMetrics(item)
  ), []);

  const getScaledItemMetrics = useCallback((type, item, transformOverride = null) => {
    const baseMetrics = getBaseItemMetrics(type, item);
    const transform = transformOverride || item.transform || {};

    return {
      ...baseMetrics,
      width: baseMetrics.width * Math.abs(transform.scaleX || 1),
      height: baseMetrics.height * Math.abs(transform.scaleY || 1),
    };
  }, [getBaseItemMetrics]);

  const buildMeasuredTextUpdate = useCallback((item, overrides = {}, options = {}) => {
    const isTypographyResizeUpdate = Object.prototype.hasOwnProperty.call(overrides, 'fontSize');
    const resolvedMaxWidth = isTypographyResizeUpdate
      ? CARD_WIDTH
      : Math.max(48, Math.min(CARD_WIDTH, Number(item.width || CARD_WIDTH)));

    // Anchor fontFamily to prevent cross-contamination from logoConfig.textTemplate.
    // After every text edit, syncTextTemplate writes the selected item's fontFamily
    // into logoConfig.textTemplate. If another item doesn't have its own fontFamily
    // stored (e.g. AI-generated SVG items), getResolvedTextProps would incorrectly
    // inherit the last-edited item's font.
    // Priority: overrides.fontFamily (explicit font change) > item's own fontFamily
    // > global design fontFamily. We intentionally skip logoConfig.textTemplate.fontFamily.
    const safeFontFamily = overrides.fontFamily || item.fontFamily || logoConfig.fontFamily || 'Arial';
    const safeFontUrl = overrides.fontFamily
      ? (overrides.fontUrl || null)
      : (item.fontUrl || null);

    const resolvedItem = {
      ...getResolvedTextProps(item),
      autoFit: false,
      renderMode: 'text',
      svgDataUri: null,
      fontFamily: safeFontFamily,
      fontUrl: safeFontUrl,
    };
    const nextItem = bakeTextTransformIntoTypography(resolvedItem, {
      ...overrides,
      maxWidth: resolvedMaxWidth,
      width: 0,
      height: 0,
    });

    // bakeTextTransformIntoTypography already centers nextItem on the resolvedItem's
    // center point. Applying preserveTextCenterTransform on top would re-center using
    // the ORIGINAL item's scale (scaleX/scaleY from before the bake) against nextItem's
    // already-baked scale (±1), causing an asymmetric position drift: the box shifts
    // one way on bold-apply and the opposite on bold-remove, never returning exactly.
    //
    // For typography resize updates (bold/italic/size): trust the bake's centering.
    // For anchor-preserving updates (align changes, etc.): use the anchor logic.
    if (options.preserveAnchor) {
      return {
        ...nextItem,
        transform: preserveTextPositionTransform(item, {
          ...nextItem,
          transform: preserveTextAnchorTransform(item, nextItem),
        }),
      };
    }

    return nextItem;
  }, [getResolvedTextProps, logoConfig.fontFamily]);

  const commitTextValueChange = useCallback((itemId, nextValue) => {
    const safeItemId = typeof itemId === 'string' ? itemId : '';
    const safeTextValue = typeof nextValue === 'string'
      ? nextValue.replace(/\r?\n+/g, ' ').trim()
      : '';

    if (!safeItemId) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const targetCollection = prev.textItems || [];
      const targetItem = targetCollection.find((item) => item.id === safeItemId);

      if (!targetItem) {
        return prev;
      }

      if (isCanvasItemLocked(targetItem)) {
        return prev;
      }

      if (!safeTextValue) {
        const existingTextValue = typeof targetItem.text === 'string'
          ? targetItem.text.replace(/\r?\n+/g, ' ').trim()
          : '';

        if (existingTextValue) {
          return prev;
        }

        return {
          ...prev,
          textItems: targetCollection.filter((item) => item.id !== safeItemId),
          layerOrder: (prev.layerOrder || []).filter((key) => key !== getCanvasLayerKey('text', safeItemId)),
        };
      }

      const nextTextItems = targetCollection.map((item) =>
        item.id === safeItemId
          ? (() => {
            const availableWidth = Math.max(48, CARD_WIDTH);
            const nextItem = {
              ...getResolvedTextProps(item),
              autoFit: false,
              text: safeTextValue,
              renderMode: 'text',
              svgDataUri: null,
              width: 0,
              height: 0,
              maxWidth: availableWidth,
            };
            const measuredItem = withMeasuredTextBox(nextItem);
            const persistedItem = { ...measuredItem };
            delete persistedItem.maxWidth;
            const nextTransform = clampTransformToCard(
              'text',
              persistedItem,
              {
                ...(item.transform || {}),
              }
            );

            return {
              ...persistedItem,
              transform: nextTransform,
            };
          })()
          : item
      );
      return {
        ...prev,
        textItems: nextTextItems,
        textTemplate: prev.textTemplate,
      };
    });
  }, [applyLogoConfigChange, getResolvedTextProps]);

  const applySelectionUpdates = useCallback((updater, options = {}) => {
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
      const shouldSyncTextTemplate = Boolean(options.syncTextTemplate && selectedTextIds.length);
      const templateSource = shouldSyncTextTemplate
        ? getPreferredTextTemplateSource(nextTextItems, selectedTextIds)
        : null;

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

  const updateSelectedElements = useCallback((updater) => {
    if (hasLockedSelection) {
      return;
    }

    applySelectionUpdates(updater, { syncTextTemplate: false });
  }, [applySelectionUpdates, hasLockedSelection]);

  const updateSelectedTextElements = useCallback((updater) => {
    if (!canEditText) {
      return;
    }

    applySelectionUpdates((type, item) => {
      if (type !== 'text') {
        return item;
      }

      return updater(item);
    }, { syncTextTemplate: true });
  }, [applySelectionUpdates, canEditText]);

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

  const handleSelectedTextFontChange = useCallback((fontSelection) => {
    const fontOption = getEditorFontOption(fontSelection);
    const fontFamily = fontOption?.family || (typeof fontSelection === 'string' ? fontSelection : '');
    if (!fontFamily) {
      return;
    }

    updateSelectedTextElements((item) => buildMeasuredTextUpdate(item, {
      fontFamily,
      fontUrl: fontOption?.fontUrl || null,
      fontStyle: 'normal',
      fontWeight: fontOption?.weight || 400,
      // Pass the effective visual size so the bounding box gets properly recalculated
      // using the full CARD_WIDTH and the new font's intrinsic metrics doesn't clip characters.
      fontSize: getEffectiveTextFontSize(item),
    }, { preserveCenter: true }));
  }, [buildMeasuredTextUpdate, updateSelectedTextElements]);

  const handleSelectedTextFontSizeChange = useCallback((fontSizeValue) => {
    const safeTargetFontSize = Math.max(12, Math.min(240, Number(fontSizeValue || 46)));

    updateSelectedTextElements((item) => {
      // SVG-mode text items: resize by scaling the transform so the SVG (and any
      // custom font baked into it) stays completely intact. Converting to text mode
      // with buildMeasuredTextUpdate would destroy the SVG and render the text in
      // whatever fallback font the browser picks, changing the visual appearance.
      if (item.renderMode === 'svg' && item.svgDataUri) {
        const currentEffectiveSize = Math.max(1, getEffectiveTextFontSize(item));
        if (Math.round(currentEffectiveSize) === safeTargetFontSize) {
          return item; // already at target size, no-op
        }
        const scaleRatio = safeTargetFontSize / currentEffectiveSize;
        const currentTransform = item.transform || {};
        const oldAbsScaleX = Math.abs(currentTransform.scaleX ?? 1) || 1;
        const oldAbsScaleY = Math.abs(currentTransform.scaleY ?? 1) || 1;
        const signedScaleX = Math.sign(currentTransform.scaleX || 1) || 1;
        const signedScaleY = Math.sign(currentTransform.scaleY || 1) || 1;
        const newAbsScaleX = oldAbsScaleX * scaleRatio;
        const newAbsScaleY = oldAbsScaleY * scaleRatio;
        const baseW = item.width || 1;
        const baseH = item.height || 1;
        const centerX = (currentTransform.x ?? 0) + (baseW * oldAbsScaleX) / 2;
        const centerY = (currentTransform.y ?? 0) + (baseH * oldAbsScaleY) / 2;

        return {
          ...item,
          transform: clampTransformToCard('text', item, {
            ...currentTransform,
            scaleX: newAbsScaleX * signedScaleX,
            scaleY: newAbsScaleY * signedScaleY,
            x: centerX - (baseW * newAbsScaleX) / 2,
            y: centerY - (baseH * newAbsScaleY) / 2,
          }),
        };
      }

      // Text-mode items: update fontSize directly (scaleY is always ±1 after baking).
      return buildMeasuredTextUpdate(item, {
        fontSize: resolveTextFontSizeFromRenderedTarget(item, safeTargetFontSize),
      }, { preserveCenter: true });
    });
  }, [buildMeasuredTextUpdate, updateSelectedTextElements]);

  const handleSelectedTextFontStyleChange = useCallback((nextFontStyle) => {
    const normalizedFontStyle = normalizeFontStyleValue(nextFontStyle);

    updateSelectedTextElements((item) => buildMeasuredTextUpdate(item, {
      fontStyle: normalizedFontStyle,
      fontWeight: syncFontWeightWithStyle(getResolvedTextProps(item), normalizedFontStyle),
      // Including fontSize makes isTypographyResizeUpdate=true inside buildMeasuredTextUpdate,
      // which lets the text reflow within the full card width (not the item's current SVG
      // pixel width). It also keeps the displayed font size stable across style changes.
      fontSize: getEffectiveTextFontSize(item),
    }, { preserveCenter: true }));
  }, [buildMeasuredTextUpdate, getResolvedTextProps, normalizeFontStyleValue, syncFontWeightWithStyle, updateSelectedTextElements]);

  const handleToggleSelectedTextFontStyle = useCallback((styleToken) => {
    if (!styleToken) {
      return;
    }

    const safeToken = styleToken === 'italic' ? 'italic' : 'bold';

    updateSelectedTextElements((item) => {
      const currentStyleTokens = new Set(
        normalizeFontStyleValue(getResolvedTextProps(item).fontStyle).split(' ').filter(Boolean)
      );

      if (currentStyleTokens.has(safeToken)) {
        currentStyleTokens.delete(safeToken);
      } else {
        currentStyleTokens.add(safeToken);
      }

      const nextFontStyle = normalizeFontStyleValue(Array.from(currentStyleTokens).join(' '));
      return buildMeasuredTextUpdate(item, {
        fontStyle: nextFontStyle,
        fontWeight: syncFontWeightWithStyle(getResolvedTextProps(item), nextFontStyle),
        // Same reason as handleSelectedTextFontStyleChange: keeps displayed size stable
        // and prevents text from being squeezed into its current SVG pixel width.
        fontSize: getEffectiveTextFontSize(item),
      }, { preserveCenter: true });
    });
  }, [buildMeasuredTextUpdate, getResolvedTextProps, normalizeFontStyleValue, syncFontWeightWithStyle, updateSelectedTextElements]);

  const handleSelectedTextAlignChange = useCallback((nextAlign) => {
    if (!['left', 'center', 'right'].includes(nextAlign)) {
      return;
    }

    updateSelectedTextElements((item) => buildMeasuredTextUpdate(item, {
      align: nextAlign,
    }, { preserveAnchor: true }));
  }, [buildMeasuredTextUpdate, updateSelectedTextElements]);

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
      if (type === 'text') {
        const currentRenderedFontSize = getEffectiveTextFontSize(item);
        return buildMeasuredTextUpdate(item, {
          fontSize: resolveTextFontSizeFromRenderedTarget(
            item,
            Math.max(12, Math.min(240, currentRenderedFontSize * safeScale))
          ),
        }, { preserveCenter: true });
      }

      const currentTransform = item.transform || {};
      const currentScaleX = Math.abs(currentTransform.scaleX ?? 1);
      const currentScaleY = Math.abs(currentTransform.scaleY ?? 1);
      const nextScaleX = safeScale * Math.sign(currentTransform.scaleX || 1 || 1);
      const nextScaleY = safeScale * Math.sign(currentTransform.scaleY || 1 || 1);
      const baseMetrics = getBaseItemMetrics(type, item);
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
  }, [buildMeasuredTextUpdate, getBaseItemMetrics, updateSelectedElements]);

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
      if (type === 'text') {
        const normalizedItem = bakeTextTransformIntoTypography(item, {
          renderMode: 'text',
          svgDataUri: null,
        });

        return {
          ...normalizedItem,
          transform: {
            ...normalizedItem.transform,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
        };
      }

      const currentTransform = item.transform || {};
      const currentScaleX = Math.abs(currentTransform.scaleX ?? 1);
      const currentScaleY = Math.abs(currentTransform.scaleY ?? 1);
      const baseMetrics = getBaseItemMetrics(type, item);
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
  }, [getBaseItemMetrics, updateSelectedElements]);

  const handleCenter = useCallback((axis) => {
    updateSelectedElements((type, item) => {
      const { width, height } = getScaledItemMetrics(type, item);

      return {
        ...item,
        transform: {
          ...item.transform,
          x: axis === 'x' ? CARD_X + (CARD_WIDTH - width) / 2 : item.transform.x,
          y: axis === 'y' ? CARD_Y + (CARD_HEIGHT - height) / 2 : item.transform.y,
        },
      };
    });
  }, [getScaledItemMetrics, updateSelectedElements]);

  const handleAlignSelectedToCanvas = useCallback((position) => {
    updateSelectedElements((type, item) => {
      const currentTransform = item.transform || {};
      const { width, height } = getScaledItemMetrics(type, item, currentTransform);

      return {
        ...item,
        transform: {
          ...currentTransform,
          x: position === 'left'
            ? CARD_X
            : position === 'right'
              ? CARD_X + CARD_WIDTH - width
              : position === 'center'
                ? CARD_X + (CARD_WIDTH - width) / 2
                : currentTransform.x,
          y: position === 'top'
            ? CARD_Y
            : position === 'bottom'
              ? CARD_Y + CARD_HEIGHT - height
              : position === 'middle'
                ? CARD_Y + (CARD_HEIGHT - height) / 2
                : currentTransform.y,
        },
      };
    });
  }, [getScaledItemMetrics, updateSelectedElements]);

  const handleSingleSelectedNumericChange = useCallback((field, nextValue) => {
    if (!selectedCanvasItem || selectedCanvasItems.length !== 1) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const collectionName = selectedCanvasItem.type === 'logo' ? 'logoItems' : 'textItems';
      const nextCollection = (prev[collectionName] || []).map((item) => {
        if (item.id !== selectedCanvasItem.id) {
          return item;
        }

        if (isCanvasItemLocked(item)) {
          return item;
        }

        const currentTransform = item.transform || {};
        const baseMetrics = getBaseItemMetrics(selectedCanvasItem.type, item);
        const lockAspectRatio = Boolean(item.style?.lockAspectRatio);
        const isTextSelection = selectedCanvasItem.type === 'text';
        if (!isTextSelection && lockAspectRatio && (field === 'width' || field === 'height')) {
          return item;
        }
        const signedScaleX = Math.sign(currentTransform.scaleX || 1) || 1;
        const signedScaleY = Math.sign(currentTransform.scaleY || 1) || 1;
        let nextTransform = { ...currentTransform };

        if (isTextSelection && (field === 'width' || field === 'height')) {
          const normalizedItem = bakeTextTransformIntoTypography(item, {
            renderMode: 'text',
            svgDataUri: null,
          });
          const normalizedMetrics = getTextMetrics(normalizedItem);
          const currentFontSize = Number(normalizedItem.fontSize || item.fontSize || 46);
          const currentMeasure = field === 'width'
            ? Math.max(1, normalizedMetrics.width)
            : Math.max(1, normalizedMetrics.height);
          const requestedMeasure = field === 'width'
            ? Math.max(24, Number(nextValue || currentMeasure))
            : Math.max(24, Number(nextValue || currentMeasure));
          const resizeRatio = requestedMeasure / currentMeasure;
          const resizedItem = bakeTextTransformIntoTypography(normalizedItem, {
            fontSize: Math.max(12, Math.min(240, currentFontSize * resizeRatio)),
            renderMode: 'text',
            svgDataUri: null,
          });

          return {
            ...resizedItem,
            transform: clampTransformToCard('text', resizedItem, resizedItem.transform),
          };
        }

        if (field === 'x' || field === 'y' || field === 'rotation') {
          nextTransform = {
            ...nextTransform,
            [field]: Number(nextValue || 0),
          };
        }

        if (field === 'width') {
          const safeWidth = Math.max(24, Number(nextValue || baseMetrics.width));
          const nextScaleMagnitude = safeWidth / Math.max(1, baseMetrics.width);
          nextTransform = {
            ...nextTransform,
            scaleX: nextScaleMagnitude * signedScaleX,
            ...(lockAspectRatio
              ? {
                scaleY: nextScaleMagnitude * signedScaleY,
              }
              : {}),
          };
        }

        if (field === 'height') {
          const safeHeight = Math.max(24, Number(nextValue || baseMetrics.height));
          const nextScaleMagnitude = safeHeight / Math.max(1, baseMetrics.height);
          nextTransform = {
            ...nextTransform,
            scaleY: nextScaleMagnitude * signedScaleY,
            ...(lockAspectRatio
              ? {
                scaleX: nextScaleMagnitude * signedScaleX,
              }
              : {}),
          };
        }

        return {
          ...item,
          transform: clampTransformToCard(selectedCanvasItem.type, item, nextTransform),
        };
      });

      return {
        ...prev,
        [collectionName]: nextCollection,
      };
    });
  }, [applyLogoConfigChange, getBaseItemMetrics, selectedCanvasItem, selectedCanvasItems.length]);

  const handleMoveSelectedLayers = useCallback((direction) => {
    if (!selectedItemKeySet.size || hasLockedSelection) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const nextLayerOrder = moveCanvasLayers(
        syncCanvasLayerOrder(prev.layerOrder, prev.logoItems || [], prev.textItems || []),
        selectedItemKeySet,
        direction
      );

      return {
        ...prev,
        layerOrder: nextLayerOrder,
      };
    });
  }, [applyLogoConfigChange, hasLockedSelection, selectedItemKeySet]);

  const handleDuplicateSelected = useCallback(() => {
    if (!selectedCanvasItems.length || hasLockedSelection) {
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
        layerOrder: [
          ...syncCanvasLayerOrder(prev.layerOrder, prev.logoItems || [], prev.textItems || []),
          ...nextSelections.map((selection) => getCanvasLayerKey(selection.type, selection.id)).filter(Boolean),
        ],
      };
    });
  }, [
    applyLogoConfigChange,
    hasLockedSelection,
    selectedCanvasItems,
    selectedCanvasItemRef,
    setCanvasSelectionOverride,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
  ]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedItemKeySet.size || hasLockedSelection) {
      return;
    }

    applyLogoConfigChange((prev) => ({
      ...prev,
      logoItems: (prev.logoItems || []).filter((item) => !selectedItemKeySet.has(`logo:${item.id}`)),
      textItems: (prev.textItems || []).filter((item) => !selectedItemKeySet.has(`text:${item.id}`)),
      layerOrder: syncCanvasLayerOrder(prev.layerOrder, prev.logoItems || [], prev.textItems || [])
        .filter((key) => !selectedItemKeySet.has(key)),
    }));
    clearCanvasSelection();
  }, [applyLogoConfigChange, clearCanvasSelection, hasLockedSelection, selectedItemKeySet]);

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
      const nextLayerKeys = [];

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
          nextLayerKeys.push(getCanvasLayerKey('logo', duplicateId));
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
        nextLayerKeys.push(getCanvasLayerKey('text', duplicateId));
      });

      return {
        ...prev,
        logoItems: nextLogoItems,
        textItems: nextTextItems,
        layerOrder: [
          ...syncCanvasLayerOrder(prev.layerOrder, prev.logoItems || [], prev.textItems || []),
          ...nextLayerKeys.filter(Boolean),
        ],
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

    if (isCanvasItemLocked(targetItem)) {
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
    commitTextValueChange(editDialog.id, nextBusinessValue);

    setEditDialog(EMPTY_EDIT_DIALOG);
  }, [commitTextValueChange, editDialog, setEditDialog]);

  const handleInlineTextEdit = useCallback((itemId, nextValue) => {
    commitTextValueChange(itemId, nextValue);
  }, [commitTextValueChange]);

  const handleToggleSelectedLock = useCallback((forcedLockedState) => {
    if (!selectedItemKeySet.size) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const resolveNextLocked = (item) => (
        typeof forcedLockedState === 'boolean' ? forcedLockedState : !isCanvasItemLocked(item)
      );

      return {
        ...prev,
        logoItems: (prev.logoItems || []).map((item) => (
          selectedItemKeySet.has(`logo:${item.id}`)
            ? { ...item, locked: resolveNextLocked(item) }
            : item
        )),
        textItems: (prev.textItems || []).map((item) => (
          selectedItemKeySet.has(`text:${item.id}`)
            ? { ...item, locked: resolveNextLocked(item) }
            : item
        )),
      };
    });
  }, [applyLogoConfigChange, selectedItemKeySet]);

  const handleToggleLayerLock = useCallback((layerKey, forcedLockedState) => {
    const [type, id] = String(layerKey || '').split(':');
    if (!type || !id) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const collectionName = type === 'logo' ? 'logoItems' : type === 'text' ? 'textItems' : null;
      if (!collectionName) {
        return prev;
      }

      return {
        ...prev,
        [collectionName]: (prev[collectionName] || []).map((item) => (
          item.id === id
            ? {
              ...item,
              locked: typeof forcedLockedState === 'boolean' ? forcedLockedState : !isCanvasItemLocked(item),
            }
            : item
        )),
      };
    });
  }, [applyLogoConfigChange]);

  const handleToggleSelectedItemBackground = useCallback((shouldSetAsBackground) => {
    if (!selectedCanvasItem || selectedCanvasItem.type !== 'logo') {
      return;
    }

    const targetItem = (logoConfig.logoItems || []).find((item) => item.id === selectedCanvasItem.id);
    if (!targetItem) {
      return;
    }

    if (isCanvasItemLocked(targetItem)) {
      return;
    }

    applyLogoConfigChange((prev) => {
      const nextLogoItems = [...(prev.logoItems || [])];
      const targetIndex = nextLogoItems.findIndex((item) => item.id === selectedCanvasItem.id);
      if (targetIndex === -1) {
        return prev;
      }

      const migratedLegacyBackgroundItem = prev.backgroundShape?.type && prev.backgroundShape.type !== 'none'
        ? {
          ...buildShapeItemFromBackgroundShape(prev.backgroundShape, { id: `shape-${Date.now()}-legacy-bg` }),
          isBackground: true,
        }
        : null;

      if (migratedLegacyBackgroundItem) {
        nextLogoItems.push(migratedLegacyBackgroundItem);
      }

      nextLogoItems[targetIndex] = {
        ...nextLogoItems[targetIndex],
        isBackground: Boolean(shouldSetAsBackground),
      };

      const targetLayerKey = getCanvasLayerKey('logo', selectedCanvasItem.id);
      let nextLayerOrder = syncCanvasLayerOrder(prev.layerOrder, nextLogoItems, prev.textItems || []);

      if (targetLayerKey) {
        nextLayerOrder = [
          ...nextLayerOrder.filter((key) => key !== targetLayerKey),
          targetLayerKey,
        ];
      }

      if (!shouldSetAsBackground && selectedCanvasItem.id) {
        selectedCanvasItemRef.current = { type: 'logo', id: selectedCanvasItem.id };
      }

      return {
        ...prev,
        logoItems: nextLogoItems,
        layerOrder: nextLayerOrder,
        backgroundShape: null,
      };
    });
  }, [applyLogoConfigChange, logoConfig.logoItems, selectedCanvasItem, selectedCanvasItemRef]);

  const handleSetSelectedShapeAsBackground = useCallback(() => {
    handleToggleSelectedItemBackground(true);
  }, [handleToggleSelectedItemBackground]);

  const handleBringBackgroundShapeToCanvas = useCallback(() => {
    if (selectedCanvasItem?.type === 'logo') {
      const targetItem = (logoConfig.logoItems || []).find((item) => item.id === selectedCanvasItem.id);
      if (targetItem?.isBackground) {
        if (isCanvasItemLocked(targetItem)) {
          return;
        }
        handleToggleSelectedItemBackground(false);
        return;
      }
    }

    const targetBackgroundShape = logoConfig.backgroundShape;

    if (!targetBackgroundShape?.type || targetBackgroundShape.type === 'none') {
      return;
    }

    const nextShapeId = `shape-${Date.now()}`;
    const nextShapeItem = buildShapeItemFromBackgroundShape(targetBackgroundShape, { id: nextShapeId });
    const nextSelection = { type: 'logo', id: nextShapeId };

    applyLogoConfigChange((prev) => ({
      ...prev,
      backgroundShape: null,
      logoItems: [...(prev.logoItems || []), nextShapeItem],
      layerOrder: [
        ...syncCanvasLayerOrder(prev.layerOrder, prev.logoItems || [], prev.textItems || []),
        getCanvasLayerKey('logo', nextShapeId),
      ].filter(Boolean),
    }));

    selectedCanvasItemRef.current = nextSelection;
    setSelectedCanvasItem(nextSelection);
    setSelectedCanvasItems([nextSelection]);
    setCanvasSelectionOverride(nextSelection);
  }, [
    handleToggleSelectedItemBackground,
    applyLogoConfigChange,
    logoConfig.backgroundShape,
    logoConfig.logoItems,
    selectedCanvasItem,
    selectedCanvasItemRef,
    setCanvasSelectionOverride,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
  ]);

  return {
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
    hasLockedSelection,
  };
}
