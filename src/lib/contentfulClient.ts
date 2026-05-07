'use server';

import { Page } from './schema';
import fs from 'fs/promises';
import path from 'path';

// Skeleton Contentful Adapter
export async function fetchPageData(slug: string, isPreview: boolean = false): Promise<Page | null> {
  // Real implementation would use: import { createClient } from 'contentful'
  console.log(`Fetching ${slug} (preview: ${isPreview}) from Contentful / Releases...`);
  
  try {
    const releasesDir = path.join(process.cwd(), 'releases', slug);
    const files = await fs.readdir(releasesDir);
    const versions = files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort((a, b) => b.localeCompare(a));

    if (versions.length > 0) {
      const latestVersion = versions[0];
      const dataRaw = await fs.readFile(path.join(releasesDir, `${latestVersion}.json`), 'utf-8');
      return JSON.parse(dataRaw) as Page;
    }
  } catch (e) {
    // No releases found, fallback to dummy draft content
  }

  // Dummy draft data returning a valid schema
  if (slug === 'home') {
    return {
      pageId: '1',
      slug: 'home',
      title: 'Home Page',
      sections: [
        {
          id: 's1',
          type: 'hero',
          props: { title: 'Welcome to Page Studio', subtitle: 'The easiest way to build pages.' }
        },
        {
          id: 's2',
          type: 'featureGrid',
          props: { features: ['Fast', 'Reliable', 'Accessible'] }
        },
        {
          id: 's3',
          type: 'testimonial',
          props: { author: 'Jane Doe', quote: 'This studio is amazing!' }
        },
        {
          id: 's4',
          type: 'cta',
          props: { label: 'Get Started', url: '/signup' }
        }
      ]
    };
  }
  return null;
}
