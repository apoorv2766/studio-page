import { describe, it, expect } from 'vitest';
import { PageSchema, SectionSchema } from '../src/lib/schema';
import { determineSemVerBump, bumpVersion } from '../src/lib/semver';

describe('Schema Validation', () => {
  it('should validate a correct section', () => {
    const validSection = { id: '1', type: 'hero', props: { title: 'Test' } };
    expect(() => SectionSchema.parse(validSection)).not.toThrow();
  });

  it('should reject an invalid section type', () => {
    const invalidSection = { id: '2', type: 'invalidType', props: {} };
    expect(() => SectionSchema.parse(invalidSection)).toThrow();
  });

  it('should validate a full page schema', () => {
    const validPage = {
      pageId: 'p1',
      slug: 'test',
      title: 'Test Page',
      sections: [{ id: '1', type: 'hero', props: {} }]
    };
    expect(() => PageSchema.parse(validPage)).not.toThrow();
  });
});

describe('SemVer Diff Logic', () => {
  const basePage = {
    pageId: '1', slug: 'home', title: 'Home',
    sections: [{ id: 's1', type: 'hero' as const, props: { title: 'A' } }]
  };

  it('should return major for initial release', () => {
    const diff = determineSemVerBump(null, basePage);
    expect(diff.bump).toBe('major');
  });

  it('should return major when section removed', () => {
    const diff = determineSemVerBump(basePage, { ...basePage, sections: [] });
    expect(diff.bump).toBe('major');
  });

  it('should return minor when section added', () => {
    const newPage = {
      ...basePage,
      sections: [...basePage.sections, { id: 's2', type: 'cta' as const, props: {} }]
    };
    const diff = determineSemVerBump(basePage, newPage);
    expect(diff.bump).toBe('minor');
  });

  it('should return patch when props change', () => {
    const newPage = {
      ...basePage,
      sections: [{ id: 's1', type: 'hero' as const, props: { title: 'B' } }]
    };
    const diff = determineSemVerBump(basePage, newPage);
    expect(diff.bump).toBe('patch');
  });

  it('should return none when identical', () => {
    const diff = determineSemVerBump(basePage, basePage);
    expect(diff.bump).toBe('none');
  });
});

describe('bumpVersion Utility', () => {
  it('bumps major correctly', () => expect(bumpVersion('1.2.3', 'major')).toBe('2.0.0'));
  it('bumps minor correctly', () => expect(bumpVersion('1.2.3', 'minor')).toBe('1.3.0'));
  it('bumps patch correctly', () => expect(bumpVersion('1.2.3', 'patch')).toBe('1.2.4'));
});
