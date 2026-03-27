"use client";

import { useCallback, useState } from 'react';
import {
  buildPdfBlobFromJpegBytes,
  canvasToBlob,
  getDownloadBaseName,
  renderDataUrlToCanvas,
  triggerBlobDownload,
} from '../../../lib/downloadAssets';
import {
  EDITED_LOGO_STORAGE_PREFIX,
} from '../editorConstants';
import { waitForFrames } from '../editorUtils';

const EDITED_LOGO_SESSION_PREFIX = 'edited-logo-session:';

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

export function useEditorPreviewPersistence({
  designId,
  editScopeKey,
  initialBusinessValue,
  logoConfig,
  payloadKey,
  router,
  stageRef,
}) {
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFullscreenOpen, setPreviewFullscreenOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [hideCanvasSelectionUi, setHideCanvasSelectionUi] = useState(false);
  const [clipCanvasToCard, setClipCanvasToCard] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);

  const captureEditorPreview = useCallback(async (pixelRatio = 2, options = {}) => {
    const stage = stageRef.current;
    if (!stage) {
      return null;
    }

    const shouldHideSelection = Boolean(options.hideSelection);
    const shouldClipToCard = options.clipToCard !== false;

    if (shouldHideSelection) {
      setHideCanvasSelectionUi(true);
    }
    if (shouldClipToCard) {
      setClipCanvasToCard(true);
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
      await waitForFrames(1);
    }
  }, [stageRef]);

  const buildEditableSavePayload = useCallback(
    () => JSON.parse(JSON.stringify(logoConfig)),
    [logoConfig]
  );

  const persistEditorChanges = useCallback(async ({ previewDataUrl, navigate = false } = {}) => {
    if (!designId || typeof window === 'undefined') {
      return null;
    }

    const nextPreviewImageUrl = previewDataUrl || await captureEditorPreview(2, { hideSelection: true });
    if (!nextPreviewImageUrl) {
      return null;
    }

    setSavingChanges(true);

    try {
      const editablePayload = buildEditableSavePayload();
      const storageSourcePreviewDataUrl = await captureEditorPreview(1, {
        hideSelection: true,
        clipToCard: true,
      });
      const storagePreviewDataUrl = await compressPreviewDataUrl(storageSourcePreviewDataUrl || nextPreviewImageUrl);
      const snapshot = {
        designId,
        editScopeKey,
        previewVersion: 8,
        previewDataUrl: storagePreviewDataUrl || null,
        editablePayload,
        updatedAt: Date.now(),
      };
      const scopedStorageKey = buildScopedStorageKey(editScopeKey, designId);
      const scopedSessionKey = buildScopedSessionKey(editScopeKey, designId);

      try {
        window.sessionStorage.setItem(scopedSessionKey, JSON.stringify(snapshot));
      } catch {
        // Session storage is only a best-effort fallback for immediate results-page hydration.
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
          // Keep the current session working even if persistent storage is full.
        }
      }

      if (payloadKey) {
        window.sessionStorage.setItem(payloadKey, JSON.stringify(editablePayload));
      }

      if (navigate) {
        router.push('/results');
      }

      return nextPreviewImageUrl;
    } finally {
      setSavingChanges(false);
    }
  }, [buildEditableSavePayload, captureEditorPreview, designId, editScopeKey, payloadKey, router]);

  const handlePreviewOpen = useCallback(async () => {
    const nextPreviewImageUrl = await captureEditorPreview(2, { hideSelection: true });
    if (!nextPreviewImageUrl) {
      return;
    }

    await persistEditorChanges({ previewDataUrl: nextPreviewImageUrl });
    setPreviewImageUrl(nextPreviewImageUrl);
    setPreviewDialogOpen(true);
  }, [captureEditorPreview, persistEditorChanges]);

  const handleSaveDesign = useCallback(async () => {
    await persistEditorChanges({ navigate: true });
  }, [persistEditorChanges]);

  const handleOpenDownloadDialog = useCallback(async () => {
    await persistEditorChanges();
    setDownloadDialogOpen(true);
  }, [persistEditorChanges]);

  const handleEditorDownload = useCallback(async (format) => {
    const stage = stageRef.current;
    if (!stage || !format) {
      return;
    }

    const safeBaseName = getDownloadBaseName(initialBusinessValue || logoConfig?.textItems?.[0]?.text || 'logo');
    setDownloadingFormat(format);

    try {
      const pngDataUrl = await captureEditorPreview(4, { hideSelection: true });
      if (!pngDataUrl) {
        return;
      }

      await persistEditorChanges({ previewDataUrl: pngDataUrl });

      if (format === 'svg') {
        const svgMarkup = [
          `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="500" viewBox="0 0 700 500" preserveAspectRatio="xMidYMid meet">`,
          `<image href="${pngDataUrl}" x="0" y="0" width="700" height="500" />`,
          '</svg>',
        ].join('');
        triggerBlobDownload(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }), `${safeBaseName}.svg`);
        setDownloadDialogOpen(false);
        return;
      }

      const { canvas } = await renderDataUrlToCanvas(pngDataUrl);

      if (format === 'png') {
        const blob = await canvasToBlob(canvas, 'image/png');
        triggerBlobDownload(blob, `${safeBaseName}.png`);
        setDownloadDialogOpen(false);
        return;
      }

      if (format === 'jpg') {
        const blob = await canvasToBlob(canvas, 'image/jpeg', 0.96);
        triggerBlobDownload(blob, `${safeBaseName}.jpg`);
        setDownloadDialogOpen(false);
        return;
      }

      if (format === 'webp') {
        const blob = await canvasToBlob(canvas, 'image/webp', 0.96);
        triggerBlobDownload(blob, `${safeBaseName}.webp`);
        setDownloadDialogOpen(false);
        return;
      }

      if (format === 'pdf') {
        const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.98);
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const pdfBlob = buildPdfBlobFromJpegBytes(jpegBytes, canvas.width, canvas.height);
        triggerBlobDownload(pdfBlob, `${safeBaseName}.pdf`);
        setDownloadDialogOpen(false);
      }
    } finally {
      setDownloadingFormat(null);
    }
  }, [captureEditorPreview, initialBusinessValue, logoConfig?.textItems, persistEditorChanges, stageRef]);

  return {
    captureEditorPreview,
    persistEditorChanges,
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
    setPreviewImageUrl,
    hideCanvasSelectionUi,
    clipCanvasToCard,
    savingChanges,
  };
}
