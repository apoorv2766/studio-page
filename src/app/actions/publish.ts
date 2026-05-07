'use server';

import { Page, PageSchema } from '@/lib/schema';
import { determineSemVerBump, bumpVersion } from '@/lib/semver';
import fs from 'fs/promises';
import path from 'path';

export async function publishDraft(draft: Page, role: string) {
  // 1. RBAC Check
  if (role !== 'publisher') {
    return { success: false, error: 'Unauthorized: Only publishers can publish releases.' };
  }

  // 2. Schema Validation
  const validatedPage = PageSchema.parse(draft);

  // 3. Diff Logic and Snapshot
  const releasesDir = path.join(process.cwd(), 'releases', validatedPage.slug);
  await fs.mkdir(releasesDir, { recursive: true });

  let latestVersion = '1.0.0';
  let bumpType: 'patch' | 'minor' | 'major' | 'none' = 'major';
  let changelogSummary = 'Initial release';
  let isFirstPublish = true;
  
  try {
    const files = await fs.readdir(releasesDir);
    const versions = files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort((a, b) => b.localeCompare(a));
    
    if (versions.length > 0) {
      isFirstPublish = false;
      latestVersion = versions[0];
      const oldDataRaw = await fs.readFile(path.join(releasesDir, `${latestVersion}.json`), 'utf-8');
      const oldData = JSON.parse(oldDataRaw) as Page;
      
      const diffResult = determineSemVerBump(oldData, validatedPage);
      bumpType = diffResult.bump;
      changelogSummary = diffResult.summary;
    }
  } catch (e) {
    // No releases yet, defaults apply
  }

  if (bumpType === 'none') {
    return { success: false, error: 'No changes detected. Idempotent publish.' };
  }

  const newVersion = isFirstPublish ? '1.0.0' : bumpVersion(latestVersion, bumpType);
  
  await fs.writeFile(
    path.join(releasesDir, `${newVersion}.json`),
    JSON.stringify(validatedPage, null, 2)
  );

  return { success: true, version: newVersion, bumpType, summary: changelogSummary };
}
