import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HomepageDraft } from '../dist/homepage.schema.js';
import { draftToSnapshot } from '../dist/draft-to-snapshot.js';

const baseDraft: HomepageDraft = {
  clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  status: 'draft',
  slug: 'smile-dental',
  publishedUrl: null,
  templateId: 'template-1',
  contentStyle: 'warm',
  siteEnabled: true,
  bookingEnabled: true,
  sections: {
    hero: { title: 'Hello', description: 'World' },
    services: { sectionTitle: 'Services', cards: [] },
    doctors: { profiles: [] },
    appointment: { title: 'Book', description: 'Now' },
    location: { displayAddressText: '123 Main St' },
    footer: {},
  },
  seo: { metaTitle: 'Title', metaDescription: 'Desc', ogImageUrl: null },
  clinicProfile: {
    clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Smile Dental',
    phone: '+82-2-1234-5678',
    address: { line1: '123 Main', city: 'Seoul', country: 'KR' },
  },
  draftUpdatedAt: '2026-07-01T10:00:00.000Z',
  publishedAt: null,
};

describe('draftToSnapshot', () => {
  it('maps draft fields to PublishedSnapshot', () => {
    const snapshot = draftToSnapshot(baseDraft);

    assert.equal(snapshot.clinicId, baseDraft.clinicId);
    assert.equal(snapshot.slug, baseDraft.slug);
    assert.equal(snapshot.publishedAt, baseDraft.draftUpdatedAt);
    assert.equal(snapshot.contentStyle, 'warm');
    assert.equal(snapshot.clinicProfile.name, 'Smile Dental');
  });

  it('uses publishedAt when present', () => {
    const snapshot = draftToSnapshot({
      ...baseDraft,
      publishedAt: '2026-07-02T12:00:00.000Z',
    });

    assert.equal(snapshot.publishedAt, '2026-07-02T12:00:00.000Z');
  });

  it('throws when clinicProfile is missing', () => {
    const { clinicProfile: _, ...withoutProfile } = baseDraft;
    assert.throws(
      () => draftToSnapshot(withoutProfile as HomepageDraft),
      /missing clinicProfile/,
    );
  });
});
