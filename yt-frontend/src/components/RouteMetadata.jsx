import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export default function RouteMetadata() {
  const { pathname } = useLocation();
  const privatePage = /^\/(admin|manager|techlead|client|product-user|efnbmms)(\/|$)/.test(pathname);
  useEffect(() => {
    // Remove only snapshot metadata. Helmet owns the live equivalents.
    document.querySelectorAll('[data-prerender-head]').forEach(node => node.remove());
  }, [pathname]);
  return privatePage ? <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet> : null;
}
