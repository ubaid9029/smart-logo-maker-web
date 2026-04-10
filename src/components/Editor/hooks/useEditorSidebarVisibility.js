"use client";

import { useEffect } from 'react';

export function useEditorSidebarVisibility({ isMobileViewport = false, setSidebarOpen, shouldShowDesktopSidebar }) {
  useEffect(() => {
    if (!shouldShowDesktopSidebar) {
      setSidebarOpen(false);
      return;
    }

    if (!isMobileViewport) {
      setSidebarOpen(true);
    }
  }, [isMobileViewport, setSidebarOpen, shouldShowDesktopSidebar]);
}
