'use client';

import { useEffect } from 'react';

/** Enregistre le service worker en production pour la consultation hors ligne. */
export function EnregistrementSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);
  return null;
}
