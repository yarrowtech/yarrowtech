import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { services, industries, articles } from '../data/marketingContent';
import { products } from '../data/productData';
import planLaptop from '../assets/planlaptop.webp';
import mobileArt from '../assets/mobile.webp';
import cloudArt from '../assets/cloud.webp';
import backendArt from '../assets/backend.webp';
import aiArt from '../assets/aiagent.webp';
import softwareArt from '../assets/software.webp';
import erpArt from '../assets/result.webp';
import './MarketingPage.css';

const SERVICE_ART = {
  'web-development': planLaptop,
  'mobile-app-development': mobileArt,
  'cloud-solutions': cloudArt,
  'backend-engineering': backendArt,
  'ai-solutions': aiArt,
  'custom-software-development': softwareArt,
  'erp-development': erpArt,
};

export default function MarketingPage() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const [group, slug] = pathname.split('/').filter(Boolean);
  const service = group === 'services' && services.find(item => item.slug === slug);
  const article = group === 'blog' && articles.find(item => item.slug === slug);
  const industry = group === 'industries' && industries.find(item => item.slug === slug);
  const product = industry && products.find(item => item.slug === industry.productSlug);
  const headings = { services: 'Software Development Services', products: 'Our Software Products', industries: 'Industry Software Solutions', blog: 'Software Planning Guides', 'case-studies': 'Case Studies', contact: 'Contact YarrowTech' };
  const valid = headings[group] && (!slug || service || article || industry);
  const title = service?.title || article?.title || industry?.title || headings[group] || 'Page Not Found';
  const descriptions = { services: 'Explore web, mobile, cloud, backend, AI, custom software and ERP development services from YarrowTech.', products: 'Explore YarrowTech software for education, retail, food and beverage, and sports management.', industries: 'Find YarrowTech software platforms for your industry and explore their capabilities.', blog: 'Practical guides to planning ERP projects and choosing business software.', 'case-studies': 'Learn about the availability of YarrowTech customer case studies and explore our product capabilities.', contact: 'Contact YarrowTech in Kolkata to discuss software development, ERP requirements or a product demonstration.' };
  const description = service?.description || article?.description || (product ? `Explore ${product.shortName} for your industry. ${product.description}` : descriptions[group]);
  const parentNames = { services: 'Services', products: 'Products', industries: 'Industries', blog: 'Blog', 'case-studies': 'Case Studies', contact: 'Contact' };
  const crumbs = slug ? [{ name: parentNames[group], path: `/${group}` }, { name: title, path: pathname }] : [{ name: title, path: pathname }];
  const sections = service?.sections || article?.sections;
  const cards = group === 'services' ? services : group === 'products' ? products : group === 'industries' ? industries : articles;
  const schema = service ? { '@type': 'Service', name: title, description, provider: { '@id': 'https://yarrowtech.in/#organization' }, url: `https://yarrowtech.in${pathname}` } : article ? { '@type': 'Article', headline: title, description, author: { '@type': 'Organization', name: 'YarrowTech', url: 'https://yarrowtech.in/' }, mainEntityOfPage: `https://yarrowtech.in${pathname}` } : undefined;

  return <main className="marketing-page">
    <Seo title={valid ? title : 'Page Not Found'} description={description} path={pathname} noindex={!valid || group === 'case-studies'} breadcrumbs={valid ? crumbs : undefined} schema={schema} />
    {valid && <Breadcrumbs items={crumbs} />}
    <div className={`marketing-hero${service ? ' has-art' : ''}`}>
      <div className="marketing-hero-copy">
        <h1>{valid ? title : 'Page Not Found'}</h1>
        {valid && <p className="marketing-intro">{description}</p>}
      </div>
      {service && SERVICE_ART[service.slug] && <img className="marketing-hero-art" src={SERVICE_ART[service.slug]} alt="" width="720" height="480" />}
    </div>
    {!valid ? <p>This page does not exist. <Link to="/">Go home</Link> or <Link to="/services">explore services</Link>.</p> : <>
      {sections && <div className="marketing-sections">{sections.map(([heading, body], i) => <section key={heading}><span className="marketing-step" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><h2>{heading}</h2><p>{body}</p></section>)}</div>}
      {!slug && ['services', 'products', 'industries', 'blog'].includes(group) && <div className="marketing-grid">{cards.map(item => <article key={item.slug}><h2><Link to={`/${group}/${item.slug}`}>{item.title || item.name}</Link></h2><p>{item.description || products.find(p => p.slug === item.productSlug)?.description}</p></article>)}</div>}
      {product && <><section><h2>Software for your operations</h2><p>{product.writeup}</p></section><section><h2>Who it supports</h2><ul>{product.audience.map(text => <li key={text}>{text}</li>)}</ul></section><section><h2>Platform capabilities</h2><ul>{product.features.map(text => <li key={text}>{text}</li>)}</ul><Link to={`/products/${product.slug}`}>Explore {product.shortName}</Link></section></>}
      {group === 'case-studies' && <section><h2>Customer stories</h2><p>We have not published customer case studies here yet. To discuss a relevant workflow, explore our product capabilities or contact our team for a demonstration.</p><Link to="/products">Explore our products</Link></section>}
      {group === 'contact' && <section><h2>Talk to our team</h2><p>Email: <a href="mailto:yarrowtech@yarrowtech.in">yarrowtech@yarrowtech.in</a></p><p>Phone: <a href="tel:+916293764220">+91 6293764220</a></p><p>3A, Bertram St, Esplanade, Kolkata</p><p>Tell us about your current process, intended users and the problem you want to solve.</p></section>}
      {article && <p>Related service: <Link to={`/services/${article.serviceSlug}`}>{services.find(item => item.slug === article.serviceSlug).title}</Link></p>}
      <section className="marketing-cta"><h2>Discuss your requirements</h2><p>Explore our platforms or arrange a demonstration with the YarrowTech team.</p><Link to="/request-demo">Request a demo</Link><Link to="/products">Explore products</Link></section>
    </>}
  </main>;
}
