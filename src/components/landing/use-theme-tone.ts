'use client';

import { useSyncExternalStore } from 'react';

/** 'dark' | 'light' from the `dark` class Fumadocs (next-themes) puts on <html>. Server: dark (the default). */
export function useThemeTone(): 'dark' | 'light' {
  return useSyncExternalStore(subscribe, read, () => 'dark');
}

function read(): 'dark' | 'light' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => mo.disconnect();
}
