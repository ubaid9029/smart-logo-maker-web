"use client";

const TEMP_EDITOR_PAYLOAD_PREFIXES = ['logo-edit-', 'library-logo-edit-'];
const EDITOR_WINDOW_TRANSFER_MARKER = 'editor-payload-transfer';

const isStorageQuotaError = (error) => {
  if (!error) {
    return false;
  }

  return error?.name === 'QuotaExceededError' || error?.name === 'NS_ERROR_DOM_QUOTA_REACHED';
};

const isTemporaryEditorPayloadKey = (key) => (
  typeof key === 'string' &&
  TEMP_EDITOR_PAYLOAD_PREFIXES.some((prefix) => key.startsWith(prefix))
);

const sanitizeEditablePayloadForTransfer = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload ?? null;
  }

  // Keep `svgDataUri` for text layers so the editor can render the exact same
  // casing/typography as the Results preview (many templates use SVG-path text blocks).
  // Stripping these caused visible case drift between Results and Editor.
  const nextPayload = {
    ...payload,
    logoItems: Array.isArray(payload.logoItems)
      ? payload.logoItems.map((item) => ({ ...item }))
      : payload.logoItems,
    textItems: Array.isArray(payload.textItems)
      ? payload.textItems.map((item) => {
          const nextItem = { ...item };
          return nextItem;
        })
      : payload.textItems,
  };

  return nextPayload;
};

const stripSvgDataUrisForTransfer = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload ?? null;
  }

  const nextPayload = {
    ...payload,
    logoItems: Array.isArray(payload.logoItems)
      ? payload.logoItems.map((item) => ({ ...item }))
      : payload.logoItems,
    textItems: Array.isArray(payload.textItems)
      ? payload.textItems.map((item) => {
          const nextItem = { ...item };
          delete nextItem.svgDataUri;
          return nextItem;
        })
      : payload.textItems,
  };

  delete nextPayload.svgDataUri;
  return nextPayload;
};

const pruneTemporaryEditorPayloads = (keepKey = null) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const keysToDelete = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key || key === keepKey || !isTemporaryEditorPayloadKey(key)) {
        continue;
      }

      keysToDelete.push(key);
    }

    keysToDelete.forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch {
  }
};

export const saveTemporaryEditorPayload = (payloadKey, payload) => {
  if (typeof window === 'undefined' || !payloadKey) {
    return false;
  }

  const primaryPayload = sanitizeEditablePayloadForTransfer(payload);
  const serializedPayload = JSON.stringify(primaryPayload);
  const serializedFallbackPayload = JSON.stringify(stripSvgDataUrisForTransfer(primaryPayload));

  try {
    window.sessionStorage.setItem(payloadKey, serializedPayload);
  } catch {
    try {
      window.sessionStorage.setItem(payloadKey, serializedFallbackPayload);
    } catch {
    }
  }

  try {
    pruneTemporaryEditorPayloads(payloadKey);
    window.localStorage.setItem(payloadKey, serializedPayload);
    return true;
  } catch (error) {
    if (!isStorageQuotaError(error)) {
      return false;
    }

    try {
      pruneTemporaryEditorPayloads(payloadKey);
      window.localStorage.removeItem(payloadKey);
      window.localStorage.setItem(payloadKey, serializedPayload);
      return true;
    } catch {
      try {
        pruneTemporaryEditorPayloads(payloadKey);
        window.localStorage.removeItem(payloadKey);
        window.localStorage.setItem(payloadKey, serializedFallbackPayload);
        return true;
      } catch {
        return false;
      }
    }
  }
};

export const openEditorWindowWithPayload = (editorUrl, payloadKey, payload) => {
  if (typeof window === 'undefined') {
    return false;
  }

  const sanitizedPayload = sanitizeEditablePayloadForTransfer(payload);
  saveTemporaryEditorPayload(payloadKey, sanitizedPayload);

  const nextWindow = window.open('', '_blank');
  if (!nextWindow) {
    return false;
  }

  try {
    nextWindow.name = JSON.stringify({
      marker: EDITOR_WINDOW_TRANSFER_MARKER,
      payloadKey,
      payload: sanitizedPayload,
    });
  } catch {
  }

  nextWindow.location.href = editorUrl;
  return true;
};

export const loadTemporaryEditorPayload = (payloadKey) => {
  if (typeof window === 'undefined' || !payloadKey) {
    return null;
  }

  const rawPayload = window.sessionStorage.getItem(payloadKey) || window.localStorage.getItem(payloadKey);
  if (!rawPayload) {
    try {
      const parsedWindowTransfer = JSON.parse(window.name || '{}');
      if (
        parsedWindowTransfer?.marker === EDITOR_WINDOW_TRANSFER_MARKER &&
        parsedWindowTransfer?.payloadKey === payloadKey &&
        parsedWindowTransfer?.payload &&
        typeof parsedWindowTransfer.payload === 'object'
      ) {
        return parsedWindowTransfer.payload;
      }
    } catch {
    }

    return null;
  }

  try {
    return JSON.parse(rawPayload);
  } catch {
    return null;
  }
};
