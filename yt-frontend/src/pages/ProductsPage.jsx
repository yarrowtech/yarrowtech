import React, { useEffect } from 'react';
import Seo from '../components/Seo';
import Home2Products from './home2/Home2Products';

export default function ProductsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <main style={{ paddingTop: '90px' }}>
      <Seo
        title="Our Software Products"
        description="Explore YarrowTech software for education, retail, food and beverage, and sports management."
        path="/products"
      />
      <Home2Products standalone />
    </main>
  );
}
