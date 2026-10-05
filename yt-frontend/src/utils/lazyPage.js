import { createElement, lazy } from 'react';

// Preload the initial public route before replacing its static HTML snapshot.
// Later navigation still uses React Suspense and separate route chunks.
export function lazyPage(loader) {
  let Ready;
  const Lazy = lazy(async () => {
    const module = await loader();
    Ready = module.default;
    return module;
  });
  function Page(props) { return createElement(Ready || Lazy, props); }
  Page.preload = async () => { Ready = (await loader()).default; };
  return Page;
}
