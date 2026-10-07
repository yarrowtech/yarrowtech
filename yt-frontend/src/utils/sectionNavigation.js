export function scrollToSection(id, behavior = 'smooth') {
  const section = document.getElementById(id);
  if (!section) return false;
  const headerHeight = document.querySelector('.header')?.getBoundingClientRect().height || 0;
  window.scrollTo({
    top: Math.max(0, window.scrollY + section.getBoundingClientRect().top - headerHeight - 16),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : behavior,
  });
  return true;
}
