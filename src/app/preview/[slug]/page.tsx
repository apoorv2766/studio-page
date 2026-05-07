import { fetchPageData } from '@/lib/contentfulClient';
import { renderSection } from '@/lib/sectionRegistry';
import { notFound } from 'next/navigation';

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pageData = await fetchPageData(slug, true);

  if (!pageData) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      {pageData.sections.map(section => renderSection(section))}
    </main>
  );
}
