import { Page, Section } from './schema';

export function determineSemVerBump(oldPage: Page | null, newPage: Page): 'patch' | 'minor' | 'major' | 'none' {
  if (!oldPage) return 'major';

  // Major: section removed, section type changed
  if (oldPage.sections.length > newPage.sections.length) return 'major';
  
  for (let i = 0; i < oldPage.sections.length; i++) {
    const oldSec = oldPage.sections[i];
    const newSec = newPage.sections.find(s => s.id === oldSec.id);
    if (!newSec || newSec.type !== oldSec.type) return 'major';
  }

  // Minor: section added
  if (newPage.sections.length > oldPage.sections.length) return 'minor';

  // Patch: props changed
  let propsChanged = false;
  for (const oldSec of oldPage.sections) {
    const newSec = newPage.sections.find(s => s.id === oldSec.id)!;
    if (JSON.stringify(oldSec.props) !== JSON.stringify(newSec.props)) {
      propsChanged = true;
      break;
    }
  }

  return propsChanged ? 'patch' : 'none';
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
