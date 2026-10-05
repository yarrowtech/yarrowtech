import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return <nav aria-label="Breadcrumb" className="seo-breadcrumbs">
    <Link to="/">Home</Link>
    {items.map((item, index) => <React.Fragment key={item.path}>
      <span aria-hidden="true"> / </span>
      {index === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link to={item.path}>{item.name}</Link>}
    </React.Fragment>)}
  </nav>;
}
