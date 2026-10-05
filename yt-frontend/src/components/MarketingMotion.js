import { createElement, forwardRef } from 'react';
import { motion as animatedMotion, isValidMotionProp } from 'framer-motion';

// Decorative marketing reveals are optional on small screens and for users
// requesting reduced motion. Native elements avoid animation setup there.
const cache = new Map();
export const motion = new Proxy({}, {
  get(_target, tag) {
    if (!cache.has(tag)) {
      const Component = forwardRef((props, ref) => {
        const simplified = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches;
        if (!simplified) return createElement(animatedMotion[tag], { ...props, ref });
        const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !isValidMotionProp(key)));
        return createElement(tag, { ...domProps, ref });
      });
      Component.displayName = `MarketingMotion.${tag}`;
      cache.set(tag, Component);
    }
    return cache.get(tag);
  },
});
