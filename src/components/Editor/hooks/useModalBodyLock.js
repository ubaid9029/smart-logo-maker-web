"use client";

import { useEffect } from 'react';

export function useModalBodyLock(isLocked) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    if (isLocked) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, [isLocked]);
}
