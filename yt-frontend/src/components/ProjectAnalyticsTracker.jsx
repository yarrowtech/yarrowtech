import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isPublicPath, trackProjectEvent } from '../services/projectTracking';

export default function ProjectAnalyticsTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!isPublicPath(pathname)) return;
    // A deferred send is cancelled by React StrictMode's initial effect cleanup.
    const timer = setTimeout(() => {
      trackProjectEvent('page_view');
      if (pathname === '/products' || /^\/products\/[^/]+\/?$/.test(pathname)) trackProjectEvent('listing_view');
    }, 0);
    const onClick = event => {
      const element = event.target.closest?.('a, button, [role="button"], [data-analytics-event]');
      if (!element) return;
      trackProjectEvent('click');
      const anchor = element.closest('a[href]');
      if (anchor) {
        const url = new URL(anchor.href, location.origin);
        if (['http:', 'https:'].includes(url.protocol)) trackProjectEvent('link_visit', { target: `${url.origin}${url.pathname}` });
      }
      if (element.dataset.analyticsEvent === 'booking_attempt') trackProjectEvent('booking_attempt');
    };
    document.addEventListener('click', onClick, true);
    return () => { clearTimeout(timer); document.removeEventListener('click', onClick, true); };
  }, [pathname]);
  return null;
}
