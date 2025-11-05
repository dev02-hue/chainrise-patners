// components/PageViewTracker.tsx
"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    trackSmartsuppPageView?: (url?: string, title?: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    smartsupp?: any;
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackPageView = () => {
      // Use the custom tracking function if available
      if (typeof window !== 'undefined' && window.trackSmartsuppPageView) {
        window.trackSmartsuppPageView();
      } 
      // Fallback to direct Smartsupp tracking
      else if (window.smartsupp) {
        window.smartsupp('track', 'pageview', {
          url: window.location.href,
          title: document.title,
          path: pathname,
          search: searchParams.toString(),
        });
      }
    };

    // Track page view with a slight delay to ensure Smartsupp is loaded
    const timer = setTimeout(trackPageView, 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}