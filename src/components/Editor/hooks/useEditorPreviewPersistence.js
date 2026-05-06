"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildRasterImageSvgMarkup,
  buildPdfBlobFromJpegBytes,
  canvasToBlob,
  cropCanvasToLogicalArea,
  cropCanvasToVisibleContent,
  getDownloadBaseName,
  loadImage,
  renderDataUrlToCanvas,
  triggerBlobDownload,
} from '../../../lib/downloadAssets';
import { readAuthSession } from '../../../lib/authSession';
import { saveTemporaryEditorPayload } from '../../../lib/editorPayloadStorage';
import {
  getLogoLibraryUpgradeMessage,
  isAuthRequiredError,
  isLogoLibraryUpgradeRequiredError,
  saveDownloadedLogo,
  saveSavedLogo,
} from '../../../lib/favoriteLogosRepository';
import { saveEditorResumeDraft } from '../../../lib/logoResumeStorage';
import { createClient } from '../../../lib/supabaseClient';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CARD_HEIGHT,
  CARD_WIDTH,
  CARD_X,
  CARD_Y,
  EDITED_LOGO_STORAGE_PREFIX,
} from '../editorConstants';
import { waitForFrames } from '../editorUtils';

const EDITED_LOGO_SESSION_PREFIX = 'edited-logo-session:';
const EDITOR_DOWNLOAD_PIXEL_RATIO = 5;
const EDITOR_CARD_AREA = {
  x: CARD_X,
  y: CARD_Y,
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
};
const EDITOR_LOGICAL_CANVAS_SIZE = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
};

const buildScopedStorageKey = (editScopeKey, designId) => (
  editScopeKey
    ? `${EDITED_LOGO_STORAGE_PREFIX}${editScopeKey}:${designId}`
    : `${EDITED_LOGO_STORAGE_PREFIX}${designId}`
);

const buildScopedSessionKey = (editScopeKey, designId) => (
  editScopeKey
    ? `${EDITED_LOGO_SESSION_PREFIX}${editScopeKey}:${designId}`
    : `${EDITED_LOGO_SESSION_PREFIX}${designId}`
);

const isStorageQuotaError = (error) => {
  if (!error) {
    return false;
  }

  return error?.name === 'QuotaExceededError' || error?.name === 'NS_ERROR_DOM_QUOTA_REACHED';
};

const buildPreviewSvgMarkup = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" preserveAspectRatio="xMidYMid meet">`,
    `<image href="${imageUrl}" x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" preserveAspectRatio="none" />`,
    '</svg>',
  ].join('');
};

const applyDownloadWatermarkOverlay = async (sourceCanvas) => {
  if (!sourceCanvas) {
    return sourceCanvas;
  }

  const watermarkImage = await loadImage('/logos/logo3.svg');
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = sourceCanvas.width;
  outputCanvas.height = sourceCanvas.height;

  const context = outputCanvas.getContext('2d');
  if (!context) {
    return sourceCanvas;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(sourceCanvas, 0, 0);

  context.save();
  context.globalAlpha = 0.12;
  context.translate(outputCanvas.width / 2, outputCanvas.height / 2);
  context.rotate((-25 * Math.PI) / 180);
  context.translate(-outputCanvas.width / 2, -outputCanvas.height / 2);

  const tileSize = 130;
  const stepX = tileSize * 2;
  const stepY = tileSize * 2;

  for (let y = -tileSize; y < outputCanvas.height + tileSize; y += stepY) {
    for (let x = -tileSize; x < outputCanvas.width + tileSize; x += stepX) {
      context.drawImage(watermarkImage, x, y, tileSize, tileSize);
    }
  }

  context.restore();
  return outputCanvas;
};

const resolvePrimaryTextItem = (logoConfig) => {
  const textItems = Array.isArray(logoConfig?.textItems) ? logoConfig.textItems : [];
  return textItems.find((item) => item?.id === 'brand-name') || textItems[0] || null;
};

const resolveThemeColor = (logoConfig) => {
  const primaryTextItem = resolvePrimaryTextItem(logoConfig);
  return primaryTextItem?.style?.fillColor || primaryTextItem?.fill || logoConfig?.textColor || '#111827';
};

const resolveBackgroundColor = (logoConfig) => (
  logoConfig?.bgColor || logoConfig?.backgroundColor || '#ffffff'
);

const readPersistedDraftSnapshot = (editScopeKey, designId) => {
  if (!designId || typeof window === 'undefined') {
    return null;
  }

  const storageKeys = [
    buildScopedSessionKey(editScopeKey, designId),
    buildScopedStorageKey(editScopeKey, designId),
  ];

  for (const storageKey of storageKeys) {
    try {
      const isSessionKey = storageKey.startsWith(EDITED_LOGO_SESSION_PREFIX);
      const storage = isSessionKey ? window.sessionStorage : window.localStorage;
      const rawValue = storage.getItem(storageKey);

      if (rawValue) {
        const parsedValue = JSON.parse(rawValue);
        if (parsedValue && typeof parsedValue === 'object') {
          return parsedValue;
        }
      }
    } catch {
    }
  }

  return null;
};

const compressPreviewDataUrl = async (previewDataUrl, options = {}) => {
  if (!previewDataUrl) {
    return null;
  }

  const { canvas, width, height } = await renderDataUrlToCanvas(previewDataUrl);
  const targetWidth = Number(options.targetWidth || 0);
  const targetHeight = Number(options.targetHeight || 0);
  const maxDimension = 900;
  const sourceMaxDimension = Math.max(width, height);
  const scale = targetWidth > 0 && targetHeight > 0
    ? Math.min(targetWidth / width, targetHeight / height)
    : Math.min(1, maxDimension / sourceMaxDimension);
  const exportCompressedPreview = (sourceCanvas) => {
    const webpDataUrl = sourceCanvas.toDataURL('image/webp', 0.82);

    if (typeof webpDataUrl === 'string' && webpDataUrl.startsWith('data:image/webp')) {
      return webpDataUrl;
    }

    return sourceCanvas.toDataURL('image/png');
  };

  if (scale >= 1) {
    if (targetWidth > 0 && targetHeight > 0 && (canvas.width !== targetWidth || canvas.height !== targetHeight)) {
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = targetWidth;
      outputCanvas.height = targetHeight;
      const context = outputCanvas.getContext('2d');

      if (!context) {
        return exportCompressedPreview(canvas);
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(canvas, 0, 0, outputCanvas.width, outputCanvas.height);
      return exportCompressedPreview(outputCanvas);
    }

    return exportCompressedPreview(canvas);
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = Math.max(1, targetWidth > 0 ? targetWidth : Math.round(width * scale));
  outputCanvas.height = Math.max(1, targetHeight > 0 ? targetHeight : Math.round(height * scale));
  const context = outputCanvas.getContext('2d');

  if (!context) {
    return exportCompressedPreview(canvas);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(canvas, 0, 0, outputCanvas.width, outputCanvas.height);

  return exportCompressedPreview(outputCanvas);
};

const cropPreviewDataUrlToEditorCard = async (previewDataUrl) => {
  if (!previewDataUrl) {
    return null;
  }

  const { canvas } = await renderDataUrlToCanvas(previewDataUrl);
  const cardCanvas = cropCanvasToLogicalArea(canvas, EDITOR_CARD_AREA, EDITOR_LOGICAL_CANVAS_SIZE);
  return cardCanvas.toDataURL('image/png');
};

export function useEditorPreviewPersistence({
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
}) {
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFullscreenOpen, setPreviewFullscreenOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewElementsImageUrl, setPreviewElementsImageUrl] = useState('');
  const [previewWatermarkEnabled, setPreviewWatermarkEnabled] = useState(true);
  const [hideCanvasSelectionUi, setHideCanvasSelectionUi] = useState(false);
  const [clipCanvasToCard, setClipCanvasToCard] = useState(false);
  const [renderCanvasElementsOnly, setRenderCanvasElementsOnly] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const isMountedRef = useRef(false);
  const autoSaveTimerRef = useRef(null);
  const authRedirectTimerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const redirectToSignIn = useCallback((message = 'Please sign in to download and save edited logos.') => {
    setAuthNotice({
      type: 'info',
      title: 'Sign In Required',
      message,
      duration: 900,
    });

    if (typeof window === 'undefined') {
      router.push('/auth/signin');
      return;
    }

    if (authRedirectTimerRef.current) {
      window.clearTimeout(authRedirectTimerRef.current);
    }

    const next = `${window.location.pathname}${window.location.search}`;
    authRedirectTimerRef.current = window.setTimeout(() => {
      router.push(`/auth/signin?next=${encodeURIComponent(next)}&message=${encodeURIComponent(message)}`);
    }, 650);
  }, [router]);

  const handleLibrarySyncError = useCallback((error, {
    authMessage = 'Please sign in to download and save edited logos.',
    upgradePurpose = 'saved logos can sync',
  } = {}) => {
    if (isAuthRequiredError(error)) {
      if (isMountedRef.current) {
        redirectToSignIn(authMessage);
      }
      return;
    }

    if (isLogoLibraryUpgradeRequiredError(error)) {
      if (isMountedRef.current) {
        setAuthNotice({
          type: 'info',
          title: 'Database Upgrade Required',
          message: getLogoLibraryUpgradeMessage(upgradePurpose),
        });
      }
      return;
    }

    console.error('Unable to sync logo library record:', error);
  }, [redirectToSignIn]);

  useEffect(() => () => {
    if (authRedirectTimerRef.current) {
      window.clearTimeout(authRedirectTimerRef.current);
      authRedirectTimerRef.current = null;
    }
  }, []);

  const ensureSignedIn = useCallback(async () => {
    try {
      const payload = await readAuthSession();

      if (payload?.user) {
        return true;
      }
    } catch {
    }

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data?.session?.user) {
      redirectToSignIn();
      return false;
    }

    return true;
  }, [redirectToSignIn]);

  const captureEditorPreview = useCallback(async (pixelRatio = 2, options = {}) => {
    const stage = stageRef.current;
    if (!stage) {
      return null;
    }

    const shouldHideSelection = Boolean(options.hideSelection);
    const shouldClipToCard = options.clipToCard !== false;
    const shouldRenderElementsOnly = Boolean(options.elementsOnly);

    if (shouldHideSelection) {
      setHideCanvasSelectionUi(true);
    }
    if (shouldClipToCard) {
      setClipCanvasToCard(true);
    }
    if (shouldRenderElementsOnly) {
      setRenderCanvasElementsOnly(true);
    }

    await waitForFrames(2);
    stage.batchDraw();

    try {
      const exportOptions = { pixelRatio };
      if (options.mimeType) {
        exportOptions.mimeType = options.mimeType;
      }
      if (typeof options.quality === 'number') {
        exportOptions.quality = options.quality;
      }

      return stage.toDataURL(exportOptions);
    } finally {
      if (shouldHideSelection) {
        setHideCanvasSelectionUi(false);
      }
      if (shouldClipToCard) {
        setClipCanvasToCard(false);
      }
      if (shouldRenderElementsOnly) {
        setRenderCanvasElementsOnly(false);
      }
      await waitForFrames(1);
    }
  }, [stageRef]);

  const buildEditableSavePayload = useCallback(
    () => JSON.parse(JSON.stringify(logoConfig)),
    [logoConfig]
  );

  const syncLibraryRecord = useCallback(async ({
    editablePayload,
    previewDataUrl,
    markSaved = false,
    markDownloaded = false,
  } = {}) => {
    if ((!markSaved && !markDownloaded) || !designId) {
      return null;
    }

    const nextPreviewDataUrl = previewDataUrl || null;
    const nextEditablePayload = editablePayload && typeof editablePayload === 'object'
      ? editablePayload
      : buildEditableSavePayload();

    const designRecord = {
      favoriteId: favoriteId || undefined,
      favoriteRowKey: favoriteRowKey || undefined,
      id: designId,
      designId,
      name: initialLogoName || initialBusinessValue || 'Logo Design',
      businessName: initialBusinessValue || 'Brand',
      slogan: initialSloganValue || '',
      industryLabel: initialIndustryLabel || 'Brand identity',
      themeColor: resolveThemeColor(logoConfig),
      backgroundColor: resolveBackgroundColor(logoConfig),
      svgMarkup: buildPreviewSvgMarkup(nextPreviewDataUrl),
      editablePayload: nextEditablePayload,
      previewDataUrl: nextPreviewDataUrl,
      fallbackUrl: sourceImageUrl || null,
      isFavorite,
      isSaved,
      isDownloaded,
      downloadedAt: markDownloaded ? Date.now() : null,
    };

    if (markDownloaded) {
      return saveDownloadedLogo(designRecord, {
        isFavorite,
        isSaved: markSaved || isSaved,
      });
    }

    return saveSavedLogo(designRecord, {
      isFavorite,
      isDownloaded,
    });
  }, [buildEditableSavePayload, designId, favoriteId, favoriteRowKey, initialBusinessValue, initialIndustryLabel, initialLogoName, initialSloganValue, isDownloaded, isFavorite, isSaved, logoConfig, sourceImageUrl]);

  const persistDraftSnapshot = useCallback(({ editablePayload, previewDataUrl = null } = {}) => {
    if (!designId || typeof window === 'undefined') {
      return null;
    }

    const existingSnapshot = readPersistedDraftSnapshot(editScopeKey, designId);
    const nextEditablePayload = editablePayload && typeof editablePayload === 'object'
      ? editablePayload
      : buildEditableSavePayload();
    const resolvedPreviewDataUrl = previewDataUrl || existingSnapshot?.previewDataUrl || null;
    const snapshot = {
      designId,
      editScopeKey,
      previewVersion: 8,
      previewDataUrl: resolvedPreviewDataUrl,
      editablePayload: nextEditablePayload,
      updatedAt: Date.now(),
    };
    const scopedStorageKey = buildScopedStorageKey(editScopeKey, designId);
    const scopedSessionKey = buildScopedSessionKey(editScopeKey, designId);

    try {
      window.sessionStorage.setItem(scopedSessionKey, JSON.stringify(snapshot));
    } catch {
    }

    try {
      window.localStorage.setItem(scopedStorageKey, JSON.stringify(snapshot));
    } catch (error) {
      if (!isStorageQuotaError(error)) {
        throw error;
      }

      try {
        window.localStorage.setItem(
          scopedStorageKey,
          JSON.stringify({
            ...snapshot,
            previewDataUrl: null,
          })
        );
      } catch {
      }
    }

    if (payloadKey) {
      try {
        saveTemporaryEditorPayload(payloadKey, nextEditablePayload);
      } catch {
      }
    }

    saveEditorResumeDraft({
      designId,
      editScopeKey,
      payloadKey,
      favoriteId,
      initialIndustryLabel,
      initialLogoName,
      initialBusinessValue,
      initialSloganValue,
      returnMode,
      returnTo,
      sourceContext,
      sourceImageUrl: previewDataUrl || sourceImageUrl || '',
      isFavorite,
      isSaved,
      isDownloaded,
    });

    return snapshot;
  }, [buildEditableSavePayload, designId, editScopeKey, favoriteId, initialBusinessValue, initialIndustryLabel, initialLogoName, initialSloganValue, isDownloaded, isFavorite, isSaved, payloadKey, returnMode, returnTo, sourceContext, sourceImageUrl]);

  const persistEditorChanges = useCallback(async ({ previewDataUrl, editablePayloadOverride, navigate = false, skipFavoriteSync = false } = {}) => {
    if (!designId || typeof window === 'undefined') {
      return null;
    }

    const rawPreviewImageUrl = previewDataUrl || await captureEditorPreview(2, { hideSelection: true });
    const nextPreviewImageUrl = rawPreviewImageUrl
      ? await cropPreviewDataUrlToEditorCard(rawPreviewImageUrl)
      : null;
    if (!nextPreviewImageUrl) {
      return null;
    }

    setSavingChanges(true);

    try {
      const editablePayload = editablePayloadOverride || buildEditableSavePayload();
      const storageSourcePreviewDataUrl = await captureEditorPreview(1, {
        hideSelection: true,
        clipToCard: true,
      });
      const croppedStorageSourcePreviewDataUrl = storageSourcePreviewDataUrl
        ? await cropPreviewDataUrlToEditorCard(storageSourcePreviewDataUrl)
        : nextPreviewImageUrl;
      const storagePreviewDataUrl = await compressPreviewDataUrl(croppedStorageSourcePreviewDataUrl || nextPreviewImageUrl);
      const persistedPreviewDataUrl = storagePreviewDataUrl || nextPreviewImageUrl;
      persistDraftSnapshot({
        editablePayload,
        previewDataUrl: persistedPreviewDataUrl,
      });

      const saveSyncPromise = !skipFavoriteSync
        ? syncLibraryRecord({
            editablePayload,
            previewDataUrl: persistedPreviewDataUrl,
            markSaved: true,
          })
        : null;

      if (navigate) {
        if (saveSyncPromise) {
          void saveSyncPromise.catch((error) => {
            handleLibrarySyncError(error, {
              upgradePurpose: 'saved logos can sync',
            });
          });
        }
        router.replace('/my-designs');
        return nextPreviewImageUrl;
      }

      if (saveSyncPromise) {
        try {
          await saveSyncPromise;
        } catch (error) {
          handleLibrarySyncError(error, {
            upgradePurpose: 'saved logos can sync',
          });
          return nextPreviewImageUrl;
        }
      }

      return nextPreviewImageUrl;
    } finally {
      setSavingChanges(false);
    }
  }, [buildEditableSavePayload, captureEditorPreview, designId, handleLibrarySyncError, persistDraftSnapshot, returnTo, router, syncLibraryRecord]);

  useEffect(() => {
    if (!designId || typeof window === 'undefined') {
      return undefined;
    }

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      try {
        persistDraftSnapshot({
          editablePayload: buildEditableSavePayload(),
          previewDataUrl: null,
        });
      } catch (error) {
        console.error('Unable to autosave editor draft:', error);
      }
    }, 900);

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [buildEditableSavePayload, designId, persistDraftSnapshot]);

  const handlePreviewOpen = useCallback(async () => {
    const nextPreviewImageUrl = await captureEditorPreview(2, {
      hideSelection: true,
    });
    if (!nextPreviewImageUrl) {
      return;
    }

    const nextElementsPreviewImageUrl = await captureEditorPreview(2, {
      hideSelection: true,
      elementsOnly: true,
      clipToCard: false,
    });

    await persistEditorChanges({
      previewDataUrl: nextPreviewImageUrl,
      skipFavoriteSync: true,
    });
    const previewCardDataUrl = await cropPreviewDataUrlToEditorCard(nextPreviewImageUrl);
    setPreviewImageUrl(previewCardDataUrl || '');
    let previewElementsCardDataUrl = '';
    if (nextElementsPreviewImageUrl) {
      const { canvas: elementsCanvas } = await renderDataUrlToCanvas(nextElementsPreviewImageUrl);
      const trimmedCanvas = cropCanvasToVisibleContent(elementsCanvas, { padding: 18 });
      previewElementsCardDataUrl = trimmedCanvas.toDataURL('image/png');
    }
    setPreviewElementsImageUrl(previewElementsCardDataUrl || '');
    setPreviewDialogOpen(true);
  }, [captureEditorPreview, persistEditorChanges]);

  const handlePreviewWatermarkToggle = useCallback(async (checked) => {
    setPreviewWatermarkEnabled(checked);

    if (!previewDialogOpen && !previewFullscreenOpen) {
      return;
    }

    const nextPreviewImageUrl = await captureEditorPreview(2, {
      hideSelection: true,
    });

    if (!nextPreviewImageUrl) {
      return;
    }

    const previewCardDataUrl = await cropPreviewDataUrlToEditorCard(nextPreviewImageUrl);
    setPreviewImageUrl(previewCardDataUrl || '');
  }, [captureEditorPreview, previewDialogOpen, previewFullscreenOpen]);

  const handleSaveDesign = useCallback(async () => {
    const canSave = await ensureSignedIn();
    if (!canSave) {
      return;
    }

    await persistEditorChanges({ navigate: true });
  }, [ensureSignedIn, persistEditorChanges]);

  const handleOpenDownloadDialog = useCallback(async () => {
    const canDownload = await ensureSignedIn();
    if (!canDownload) {
      return;
    }

    setDownloadDialogOpen(true);
  }, [ensureSignedIn]);

  const handleEditorDownload = useCallback(async (format) => {
    const stage = stageRef.current;
    if (!stage || !format) {
      return;
    }

    const canDownload = await ensureSignedIn();
    if (!canDownload) {
      setDownloadDialogOpen(false);
      return;
    }

    const safeBaseName = getDownloadBaseName(initialBusinessValue || logoConfig?.textItems?.[0]?.text || 'logo');
    setDownloadingFormat(format);

    try {
      const pngDataUrl = await captureEditorPreview(EDITOR_DOWNLOAD_PIXEL_RATIO, { hideSelection: true });
      if (!pngDataUrl) {
        return;
      }

      const editablePayload = buildEditableSavePayload();
      const storedPreviewDataUrl = await compressPreviewDataUrl(pngDataUrl);
      const persistedPreviewDataUrl = storedPreviewDataUrl || pngDataUrl;
      persistDraftSnapshot({
        editablePayload,
        previewDataUrl: persistedPreviewDataUrl,
      });

      void syncLibraryRecord({
        editablePayload,
        previewDataUrl: persistedPreviewDataUrl,
        markDownloaded: true,
      }).catch((error) => {
        handleLibrarySyncError(error, {
          upgradePurpose: 'downloads can sync',
        });
      });

      const { canvas } = await renderDataUrlToCanvas(pngDataUrl);
      const cardCanvas = cropCanvasToLogicalArea(canvas, EDITOR_CARD_AREA, EDITOR_LOGICAL_CANVAS_SIZE);
      const exportCanvas = previewWatermarkEnabled
        ? await applyDownloadWatermarkOverlay(cardCanvas)
        : cardCanvas;

      if (format === 'svg') {
        const svgMarkup = buildRasterImageSvgMarkup(exportCanvas.toDataURL('image/png'), exportCanvas.width, exportCanvas.height);
        triggerBlobDownload(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }), `${safeBaseName}.svg`);
        setDownloadDialogOpen(false);
        return;
      }

      if (format === 'png') {
        const blob = await canvasToBlob(exportCanvas, 'image/png');
        triggerBlobDownload(blob, `${safeBaseName}.png`);
        setDownloadDialogOpen(false);
        return;
      }

      if (format === 'jpg') {
        const blob = await canvasToBlob(exportCanvas, 'image/jpeg', 0.96);
        triggerBlobDownload(blob, `${safeBaseName}.jpg`);
        setDownloadDialogOpen(false);
        return;
      }

      if (format === 'webp') {
        const blob = await canvasToBlob(exportCanvas, 'image/webp', 0.96);
        triggerBlobDownload(blob, `${safeBaseName}.webp`);
        setDownloadDialogOpen(false);
        return;
      }

      if (format === 'pdf') {
        const jpegBlob = await canvasToBlob(exportCanvas, 'image/jpeg', 0.98);
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const pdfBlob = buildPdfBlobFromJpegBytes(jpegBytes, exportCanvas.width, exportCanvas.height);
        triggerBlobDownload(pdfBlob, `${safeBaseName}.pdf`);
        setDownloadDialogOpen(false);
      }
    } finally {
      setDownloadingFormat(null);
    }
  }, [buildEditableSavePayload, captureEditorPreview, ensureSignedIn, handleLibrarySyncError, initialBusinessValue, logoConfig?.textItems, persistDraftSnapshot, previewWatermarkEnabled, stageRef, syncLibraryRecord]);

  return {
    captureEditorPreview,
    persistEditorChanges,
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
    setPreviewImageUrl,
    previewWatermarkEnabled,
    setPreviewWatermarkEnabled,
    handlePreviewWatermarkToggle,
    hideCanvasSelectionUi,
    clipCanvasToCard,
    renderCanvasElementsOnly,
    savingChanges,
  };
}
