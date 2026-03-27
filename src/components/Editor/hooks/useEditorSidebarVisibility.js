"use client";

import { useEffect } from 'react';

export function useEditorSidebarVisibility({ setSidebarOpen, shouldShowDesktopSidebar }) {
  useEffect(() => {
    if (!shouldShowDesktopSidebar) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen, shouldShowDesktopSidebar]);
}
