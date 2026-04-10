"use client";

import { useCallback, useMemo, useState } from 'react';
import { CARD_HEIGHT, CARD_WIDTH, CARD_X, CARD_Y } from '../editorConstants';
import {
  applyStyleToTextItem,
  buildDefaultItemStyle,
  getCanvasLayerKey,
  getAssetDisplayLabel,
  buildShadeScale,
  getLinearGradientCss,
  getRadialGradientCss,
  normalizeHexColor,
  syncCanvasLayerOrder,
} from '../editorUtils';

const isPaletteStylableLogoItem = (item) => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  if (item.kind === 'line' || item.type === 'line') {
    return true;
  }

  if (item.kind === 'shape' || item.type === 'shape') {
    return true;
  }

  return typeof item.imageUrl === 'string' && item.imageUrl.startsWith('data:image/svg+xml');
};

export function useEditorBackgroundControls({
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
}) {
  const [activeBackgroundOption, setActiveBackgroundOption] = useState(null);
  const [customColorValue, setCustomColorValue] = useState(() => normalizeHexColor(urlBgColor || '#FFFFFF', '#FFFFFF'));
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [dialogBaseColor, setDialogBaseColor] = useState(() => normalizeHexColor(urlBgColor || '#FFFFFF', '#FFFFFF'));
  const [dialogSelectedColor, setDialogSelectedColor] = useState(() => normalizeHexColor(urlBgColor || '#FFFFFF', '#FFFFFF'));
  const [gradientType, setGradientType] = useState('linear');
  const [gradientDirection, setGradientDirection] = useState('down');
  const [gradientStartColor, setGradientStartColor] = useState('#000000');
  const [gradientEndColor, setGradientEndColor] = useState('#64748B');
  const [gradientRadialAngle, setGradientRadialAngle] = useState(225);
  const [gradientDialogOpen, setGradientDialogOpen] = useState(false);
  const [gradientColorDialogOpen, setGradientColorDialogOpen] = useState(false);
  const [gradientDialogBaseColor, setGradientDialogBaseColor] = useState('#000000');
  const [gradientDialogSelectedColor, setGradientDialogSelectedColor] = useState('#000000');
  const [gradientColorTarget, setGradientColorTarget] = useState('start');
  const [gradientCustomColorValue, setGradientCustomColorValue] = useState('#000000');
  const [assetPickerDialog, setAssetPickerDialog] = useState({
    open: false,
    type: null,
    title: '',
    items: [],
  });
  const defaultInsertedAssetWidth = Math.round(CARD_WIDTH * 0.72);
  const defaultInsertedAssetHeight = Math.round(CARD_HEIGHT * 0.72);
  const defaultInsertedAssetX = CARD_X + ((CARD_WIDTH - defaultInsertedAssetWidth) / 2);
  const defaultInsertedAssetY = CARD_Y + ((CARD_HEIGHT - defaultInsertedAssetHeight) / 2);

  const closeBackgroundDialogs = useCallback(() => {
    setColorDialogOpen(false);
    setGradientDialogOpen(false);
    setGradientColorDialogOpen(false);
  }, []);

  const closeAssetPickerDialog = useCallback(() => {
    setAssetPickerDialog({
      open: false,
      type: null,
      title: '',
      items: [],
    });
  }, []);

  const closeEditorOverlays = useCallback(() => {
    closeBackgroundDialogs();
    closeAssetPickerDialog();
  }, [closeAssetPickerDialog, closeBackgroundDialogs]);

  const applyBackgroundColor = useCallback((colorValue) => {
    const safeColor = normalizeHexColor(colorValue, '#FFFFFF');
    applyLogoConfigChange((prev) => ({
      ...prev,
      bgColor: safeColor,
      bgFill: null,
      bgImageUrl: null,
    }));
  }, [applyLogoConfigChange]);

  const applyBackgroundShape = useCallback((shapeType) => {
    applyLogoConfigChange((prev) => {
      if (!shapeType || shapeType === 'none') {
        return {
          ...prev,
          backgroundShape: null,
        };
      }

      return {
        ...prev,
        backgroundShape: {
          type: shapeType,
          fillColor: prev.backgroundShape?.fillColor || 'transparent',
          strokeColor: normalizeHexColor(prev.backgroundShape?.strokeColor || '#111111', '#111111'),
        },
      };
    });
  }, [applyLogoConfigChange]);

  const applyBackgroundShapeColor = useCallback((colorValue) => {
    const safeColor = normalizeHexColor(colorValue, '#FFFFFF');
    applyLogoConfigChange((prev) => {
      if (!prev.backgroundShape) {
        return prev;
      }

      return {
        ...prev,
        backgroundShape: {
          ...prev.backgroundShape,
          fillColor: safeColor,
          strokeColor: safeColor,
        },
      };
    });
  }, [applyLogoConfigChange]);

  const applyBackgroundOpacity = useCallback((opacityValue) => {
    const nextOpacity = Math.max(0.05, Math.min(1, Number(opacityValue || 1)));

    applyLogoConfigChange((prev) => ({
      ...prev,
      bgOpacity: nextOpacity,
    }));
  }, [applyLogoConfigChange]);

  const applyPresetBackgroundImage = useCallback((imageUrl) => {
    if (!imageUrl) {
      return;
    }

    const newId = `logo-${Date.now()}`;
    const nextSelection = { type: 'logo', id: newId };

    applyLogoConfigChange((prev) => ({
      ...prev,
      logoItems: [
        ...(prev.logoItems || []),
        {
          id: newId,
          imageUrl,
          isBackground: true,
          layerLabel: getAssetDisplayLabel(imageUrl, 'Background'),
          baseWidth: defaultInsertedAssetWidth,
          baseHeight: defaultInsertedAssetHeight,
          transform: {
            x: defaultInsertedAssetX,
            y: defaultInsertedAssetY,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
          },
          style: buildDefaultItemStyle('#111827'),
        },
      ],
      layerOrder: [
        ...syncCanvasLayerOrder(prev.layerOrder, prev.logoItems || [], prev.textItems || []),
        getCanvasLayerKey('logo', newId),
      ].filter(Boolean),
    }));

    selectedCanvasItemRef.current = nextSelection;
    setSelectedCanvasItem(nextSelection);
    setSelectedCanvasItems([nextSelection]);
    setCanvasSelectionOverride(nextSelection);
    setActiveObjectPanel('controls');
  }, [
    applyLogoConfigChange,
    selectedCanvasItemRef,
    setActiveObjectPanel,
    setCanvasSelectionOverride,
    setSelectedCanvasItem,
    setSelectedCanvasItems,
    defaultInsertedAssetHeight,
    defaultInsertedAssetWidth,
    defaultInsertedAssetX,
    defaultInsertedAssetY,
  ]);

  const handleDialogSelect = useCallback(() => {
    const safeColor = normalizeHexColor(dialogSelectedColor, '#FFFFFF');
    applyBackgroundColor(safeColor);
    setDialogBaseColor(safeColor);
    setDialogSelectedColor(safeColor);
    setCustomColorValue(safeColor);
    setColorDialogOpen(false);
    if (isMobileViewport && activeTool === 'background') {
      setSidebarOpen(true);
    }
  }, [activeTool, applyBackgroundColor, dialogSelectedColor, isMobileViewport, setSidebarOpen]);

  const closePickAnotherDialog = useCallback(() => {
    setColorDialogOpen(false);
    if (isMobileViewport && activeTool === 'background') {
      setSidebarOpen(true);
    }
  }, [activeTool, isMobileViewport, setSidebarOpen]);

  const applyGradientToBackground = useCallback(() => {
    applyLogoConfigChange((prev) => ({
      ...prev,
      bgColor: gradientEndColor,
      bgImageUrl: null,
      bgFill: {
        type: gradientType,
        startColor: gradientStartColor,
        endColor: gradientEndColor,
        direction: gradientDirection,
        radialAngle: gradientRadialAngle,
      },
    }));
    setGradientDialogOpen(false);
    if (isMobileViewport && activeTool === 'background') {
      setSidebarOpen(true);
    }
  }, [
    activeTool,
    applyLogoConfigChange,
    gradientDirection,
    gradientEndColor,
    gradientRadialAngle,
    gradientStartColor,
    gradientType,
    isMobileViewport,
    setSidebarOpen,
  ]);

  const syncGradientControlsFromConfig = useCallback(() => {
    const existingFill = logoConfig.bgFill;

    if (existingFill?.type === 'linear' || existingFill?.type === 'radial') {
      const nextStart = normalizeHexColor(existingFill.startColor || '#000000', '#000000');
      const nextEnd = normalizeHexColor(existingFill.endColor || '#64748B', '#64748B');

      setGradientType(existingFill.type);
      setGradientDirection(existingFill.direction || 'down');
      setGradientRadialAngle(Number(existingFill.radialAngle ?? 225));
      setGradientStartColor(nextStart);
      setGradientEndColor(nextEnd);
      setGradientDialogBaseColor(nextStart);
      setGradientDialogSelectedColor(nextStart);
      setGradientCustomColorValue(nextStart);
    } else {
      const nextStart = normalizeHexColor(gradientStartColor, '#000000');
      setGradientDialogBaseColor(nextStart);
      setGradientDialogSelectedColor(nextStart);
      setGradientCustomColorValue(nextStart);
    }
  }, [gradientStartColor, logoConfig.bgFill]);

  const openGradientDialog = useCallback(() => {
    syncGradientControlsFromConfig();
    setGradientColorTarget('start');
    setGradientDialogOpen(true);
  }, [syncGradientControlsFromConfig]);

  const closeGradientDialog = useCallback(() => {
    setGradientDialogOpen(false);
    if (isMobileViewport && activeTool === 'background') {
      setSidebarOpen(true);
    }
  }, [activeTool, isMobileViewport, setSidebarOpen]);

  const openGradientColorDialog = useCallback((target) => {
    const nextTarget = target === 'end' ? 'end' : 'start';
    const baseColor = normalizeHexColor(
      nextTarget === 'start' ? gradientStartColor : gradientEndColor,
      '#000000'
    );

    setGradientColorTarget(nextTarget);
    setGradientDialogBaseColor(baseColor);
    setGradientDialogSelectedColor(baseColor);
    setGradientCustomColorValue(baseColor);
    setGradientDialogOpen(false);
    setGradientColorDialogOpen(true);
  }, [gradientEndColor, gradientStartColor]);

  const closeGradientColorDialog = useCallback(() => {
    setGradientColorDialogOpen(false);
    setGradientDialogOpen(true);
  }, []);

  const applyGradientDialogColor = useCallback(() => {
    const safeColor = normalizeHexColor(gradientDialogSelectedColor, '#000000');

    if (gradientColorTarget === 'start') {
      setGradientStartColor(safeColor);
    } else {
      setGradientEndColor(safeColor);
    }

    setGradientDialogBaseColor(safeColor);
    setGradientDialogSelectedColor(safeColor);
    setGradientCustomColorValue(safeColor);
    setGradientColorDialogOpen(false);
    setGradientDialogOpen(true);
  }, [gradientColorTarget, gradientDialogSelectedColor]);

  const applyDesignPalette = useCallback((palette) => {
    applyLogoConfigChange((prev) => ({
      ...prev,
      textColor: palette.colors[1],
      bgFill: null,
      logoItems: (prev.logoItems || []).map((item, index) => {
        if (!isPaletteStylableLogoItem(item)) {
          return item;
        }

        return {
          ...item,
          style: {
            ...item.style,
            applyColorOverrides: true,
            fillColor: palette.colors[index % palette.colors.length],
            outlineColor: item.style?.outlineWidth > 0 ? palette.colors[(index + 2) % palette.colors.length] : item.style?.outlineColor,
          },
        };
      }),
      textItems: (prev.textItems || []).map((item, index) => applyStyleToTextItem(item, {
        ...item.style,
        applyColorOverrides: true,
        fillColor: palette.colors[(index + 1) % palette.colors.length],
        outlineColor: item.style?.outlineWidth > 0 ? palette.colors[(index + 2) % palette.colors.length] : item.style?.outlineColor,
      })),
    }));
  }, [applyLogoConfigChange]);

  const handleBackgroundOptionSelect = useCallback((optionId) => {
    closeEditorOverlays();
    setActiveBackgroundOption(optionId);

    if (activeTool === 'background') {
      setSidebarOpen(true);
    }

    if (isMobileViewport && activeTool === 'background') {
      if (optionId === 'color') {
        const currentBackgroundColor = normalizeHexColor(logoConfig.bgColor || '#FFFFFF', '#FFFFFF');
        setDialogBaseColor(currentBackgroundColor);
        setDialogSelectedColor(currentBackgroundColor);
        setCustomColorValue(currentBackgroundColor);
        setSidebarOpen(true);
        return;
      }

      if (optionId === 'gradient') {
        syncGradientControlsFromConfig();
        setSidebarOpen(true);
        return;
      }

      if (optionId === 'background' || optionId === 'texture' || optionId === 'image') {
        return;
      }
    }

    if (optionId === 'color') {
      const currentBackgroundColor = normalizeHexColor(logoConfig.bgColor || '#FFFFFF', '#FFFFFF');
      setDialogBaseColor(currentBackgroundColor);
      setDialogSelectedColor(currentBackgroundColor);
      setCustomColorValue(currentBackgroundColor);
      return;
    }

    if (optionId === 'gradient') {
      syncGradientControlsFromConfig();
      return;
    }

    if (optionId === 'image') {
      openBackgroundImageBrowser();
    }
  }, [
    activeTool,
    closeEditorOverlays,
    isMobileViewport,
    logoConfig.bgColor,
    openBackgroundImageBrowser,
    syncGradientControlsFromConfig,
    setSidebarOpen,
  ]);

  const gradientPreviewStyle = useMemo(() => ({
    background: gradientType === 'linear'
      ? getLinearGradientCss(gradientDirection, gradientStartColor, gradientEndColor)
      : getRadialGradientCss(gradientRadialAngle, gradientStartColor, gradientEndColor),
  }), [gradientDirection, gradientEndColor, gradientRadialAngle, gradientStartColor, gradientType]);

  const dialogShadeOptions = useMemo(
    () => buildShadeScale(dialogBaseColor, 10),
    [dialogBaseColor]
  );

  const gradientDialogShadeOptions = useMemo(
    () => buildShadeScale(gradientDialogBaseColor, 10),
    [gradientDialogBaseColor]
  );

  return {
    activeBackgroundOption,
    setActiveBackgroundOption,
    customColorValue,
    setCustomColorValue,
    colorDialogOpen,
    setColorDialogOpen,
    dialogBaseColor,
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
    gradientDialogBaseColor,
    setGradientDialogBaseColor,
    gradientDialogSelectedColor,
    setGradientDialogSelectedColor,
    gradientColorTarget,
    setGradientColorTarget,
    gradientCustomColorValue,
    setGradientCustomColorValue,
    assetPickerDialog,
    closeBackgroundDialogs,
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
    openGradientDialog,
    closeGradientDialog,
    openGradientColorDialog,
    closeGradientColorDialog,
    applyGradientDialogColor,
    applyDesignPalette,
    handleBackgroundOptionSelect,
    gradientPreviewStyle,
    dialogShadeOptions,
    gradientDialogShadeOptions,
  };
}

