import React from 'react';
import { Section } from './schema';

// Dummy section components
const Hero = ({ title, subtitle }: { title?: string, subtitle?: string }) => (
  <section className="py-20 bg-blue-50 text-center">
    <h1 className="text-4xl font-bold mb-4">{title || 'Hero Title'}</h1>
    <p className="text-xl text-gray-600">{subtitle || 'Hero Subtitle'}</p>
  </section>
);

const FeatureGrid = ({ features }: { features?: string[] }) => (
  <section className="py-16">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
      {features?.map((f, i) => (
        <div key={i} className="p-6 bg-white shadow rounded-lg border">
          <h2 className="font-semibold text-lg">{f}</h2>
        </div>
      )) || <p>No features</p>}
    </div>
  </section>
);

const Testimonial = ({ author, quote }: { author?: string, quote?: string }) => (
  <section className="py-16 bg-gray-50 text-center px-4">
    <blockquote className="text-2xl italic max-w-3xl mx-auto">"{quote}"</blockquote>
    <p className="mt-4 font-semibold">- {author}</p>
  </section>
);

const CTA = ({ label, url }: { label?: string, url?: string }) => (
  <section className="py-20 bg-blue-600 text-white text-center px-4">
    <h2 className="text-3xl font-bold mb-6">Ready to dive in?</h2>
    <a href={url || '#'} className="inline-block bg-white text-blue-600 px-8 py-3 rounded font-semibold hover:bg-gray-100 transition">
      {label || 'Click Here'}
    </a>
  </section>
);

const UnsupportedSection = ({ type }: { type: string }) => (
  <div className="p-4 border border-red-500 bg-red-50 text-red-700 my-4 mx-4 rounded">
    <p><strong>Error:</strong> Unsupported section type: <code>{type}</code></p>
  </div>
);

const Registry: Record<string, React.FC<any>> = {
  hero: Hero,
  featureGrid: FeatureGrid,
  testimonial: Testimonial,
  cta: CTA,
};

export const renderSection = (section: Section) => {
  const Component = Registry[section.type];
  if (!Component) {
    return <UnsupportedSection key={section.id} type={section.type} />;
  }
  return <Component key={section.id} {...section.props} />;
};
