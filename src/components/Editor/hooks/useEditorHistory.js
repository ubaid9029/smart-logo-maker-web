"use client";

import { useCallback, useState } from 'react';

export function useEditorHistory(createInitialPresent) {
  const [editorState, setEditorState] = useState(() => ({
    past: [],
    present: typeof createInitialPresent === 'function' ? createInitialPresent() : createInitialPresent,
    future: [],
  }));

  const applyLogoConfigChange = useCallback((configUpdate) => {
    setEditorState((prev) => {
      const nextPresent = typeof configUpdate === 'function'
        ? configUpdate(prev.present)
        : { ...prev.present, ...configUpdate };

      if (JSON.stringify(nextPresent) === JSON.stringify(prev.present)) {
        return prev;
      }

      return {
        past: [...prev.past, prev.present],
        present: nextPresent,
        future: [],
      };
    });
  }, []);

  const handleUndo = useCallback(() => {
    setEditorState((prev) => {
      if (prev.past.length === 0) {
        return prev;
      }

      const previousConfig = prev.past[prev.past.length - 1];

      return {
        past: prev.past.slice(0, -1),
        present: previousConfig,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setEditorState((prev) => {
      if (prev.future.length === 0) {
        return prev;
      }

      const [nextConfig, ...remainingFuture] = prev.future;

      return {
        past: [...prev.past, prev.present],
        present: nextConfig,
        future: remainingFuture,
      };
    });
  }, []);

  return {
    editorState,
    applyLogoConfigChange,
    handleUndo,
    handleRedo,
  };
}
