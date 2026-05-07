import { Page, Section } from './schema';

export function determineSemVerBump(oldPage: Page | null, newPage: Page): { bump: 'patch' | 'minor' | 'major' | 'none', summary: string } {
  if (!oldPage) return { bump: 'major', summary: 'Initial release' };

  // Major: section removed, section type changed
  if (oldPage.sections.length > newPage.sections.length) return { bump: 'major', summary: 'Removed one or more sections' };
  
  for (let i = 0; i < oldPage.sections.length; i++) {
    const oldSec = oldPage.sections[i];
    const newSec = newPage.sections.find(s => s.id === oldSec.id);
    if (!newSec || newSec.type !== oldSec.type) return { bump: 'major', summary: `Section type changed or removed (was ${oldSec.type})` };
  }

  // Minor: section added
  if (newPage.sections.length > oldPage.sections.length) return { bump: 'minor', summary: 'Added a new section' };

  // Patch: props changed
  let changedSections = [];
  for (const oldSec of oldPage.sections) {
    const newSec = newPage.sections.find(s => s.id === oldSec.id)!;
    if (JSON.stringify(oldSec.props) !== JSON.stringify(newSec.props)) {
      changedSections.push(newSec.type);
    }
  }

  if (changedSections.length > 0) {
    return { bump: 'patch', summary: `Updated properties in: ${changedSections.join(', ')}` };
  }

  return { bump: 'none', summary: 'No changes detected' };
}

export function bumpVersion(currentVersion: string, bump: 'patch' | 'minor' | 'major'): string {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  switch (bump) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    default: return currentVersion;
  }
}
