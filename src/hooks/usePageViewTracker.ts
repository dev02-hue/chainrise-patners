// hooks/usePageViewTracker.ts
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    smartsupp?: any;
  }
}

export function usePageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Wait a bit to ensure Smartsupp is loaded
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.smartsupp) {
        // Track page view in Smartsupp
        window.smartsupp('track', 'pageview', {
          url: window.location.href,
          path: pathname,
          search: searchParams.toString(),
        });
        
        console.log('Smartsupp pageview tracked:', pathname);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);
}