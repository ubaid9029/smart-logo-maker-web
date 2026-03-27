"use client";

import { useEffect, useState } from 'react';

export function useEditorViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncViewport = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);

    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  return isMobileViewport;
}
