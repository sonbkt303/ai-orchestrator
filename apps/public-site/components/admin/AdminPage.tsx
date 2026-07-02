'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ContentStyle,
  GenerateHomepageRequest,
  HomepageDraft,
} from '@clever-dent/shared-contracts';
import { draftToSnapshot } from '@clever-dent/shared-contracts';
import { SitePage } from '@/components/SitePage';
import {
  AdminApiError,
  ClinicWithStatus,
  fetchAllDrafts,
  fetchClinicSource,
  fetchClinics,
  fetchDraft,
  generateDraft,
  mergeClinicStatus,
  publishDraft,
  saveDraft,
  suggestSlugs,
} from '@/lib/admin-api-client';

function buildPreviewDraftFromCd(
  cd: Omit<GenerateHomepageRequest, 'slug'>,
  slug: string,
): HomepageDraft {
  const now = new Date().toISOString();
  return {
    clinicId: cd.clinicProfile.clinicId,
    status: 'draft',
    slug,
    publishedUrl: null,
    templateId: cd.templateId,
    contentStyle: cd.contentStyle,
    siteEnabled: cd.siteEnabled,
    bookingEnabled: cd.bookingEnabled,
    displayServiceIds: cd.services.map((s) => s.serviceId),
    displayDoctorIds: cd.doctors.map((d) => d.doctorId),
    sections: {
      hero: {
        title: cd.clinicProfile.name,
        description: 'Click Generate to create AI-powered homepage content.',
      },
      services: {
        sectionTitle: 'Our Services',
        cards: cd.services.map((s) => ({
          serviceId: s.serviceId,
          shortDescription: s.shortDescription ?? '',
          name: s.name,
          iconKey: s.iconKey,
        })),
      },
      doctors: {
        profiles: cd.doctors.map((d) => ({
          doctorId: d.doctorId,
          bio: d.bio ?? '',
          name: d.name,
          specialty: d.specialty,
          photoUrl: d.photoUrl ?? null,
        })),
      },
      appointment: {
        title: 'Schedule Your Visit',
        description: 'Book an appointment online.',
      },
      location: {
        displayAddressText: `${cd.clinicProfile.address.line1}, ${cd.clinicProfile.address.city}`,
      },
      footer: {},
      reviews: { sectionTitle: 'Patient Reviews', placeholder: true },
    },
    seo: { metaTitle: null, metaDescription: null, ogImageUrl: null },
    clinicProfile: cd.clinicProfile,
    draftUpdatedAt: now,
    publishedAt: null,
  };
}

function statusLabel(status: ClinicWithStatus['status']): string {
  switch (status) {
    case 'no_draft':
      return 'No draft';
    case 'draft':
      return 'Draft';
    case 'published':
      return 'Published';
  }
}

export function AdminPage() {
  const [clinics, setClinics] = useState<ClinicWithStatus[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [localDraft, setLocalDraft] = useState<HomepageDraft | null>(null);
  const [savedDraft, setSavedDraft] = useState<HomepageDraft | null>(null);
  const [cdSource, setCdSource] = useState<Omit<GenerateHomepageRequest, 'slug'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'info' | 'success'; text: string } | null>(null);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);

  const selectedClinic = clinics.find((c) => c.clinicId === selectedClinicId);

  const isDirty = useMemo(() => {
    if (!localDraft || !savedDraft) return Boolean(localDraft);
    return JSON.stringify(localDraft) !== JSON.stringify(savedDraft);
  }, [localDraft, savedDraft]);

  const loadClinics = useCallback(async () => {
    const [clinicList, drafts] = await Promise.all([fetchClinics(), fetchAllDrafts()]);
    const merged = mergeClinicStatus(clinicList, drafts);
    setClinics(merged);
    return merged;
  }, []);

  useEffect(() => {
    loadClinics()
      .then((merged) => {
        if (merged.length > 0) {
          setSelectedClinicId(merged[0].clinicId);
        }
      })
      .catch((err) => setMessage({ type: 'error', text: String(err) }))
      .finally(() => setLoading(false));
  }, [loadClinics]);

  const selectClinic = useCallback(async (clinicId: string) => {
    setSelectedClinicId(clinicId);
    setMessage(null);
    setSlugSuggestions([]);
    setBusy(true);

    try {
      const existing = await fetchDraft(clinicId);
      if (existing) {
        setLocalDraft(existing);
        setSavedDraft(existing);
        setCdSource(null);
        return;
      }

      const cd = await fetchClinicSource(clinicId);
      setCdSource(cd);
      const suggestions = await suggestSlugs(
        cd.clinicProfile.name,
        cd.clinicProfile.address.district,
        cd.clinicProfile.address.city,
      );
      const slug = suggestions[0] ?? '';
      const preview = buildPreviewDraftFromCd(cd, slug);
      setLocalDraft(preview);
      setSavedDraft(null);
    } catch (err) {
      setMessage({ type: 'error', text: String(err) });
      setLocalDraft(null);
      setSavedDraft(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClinicId && !loading) {
      selectClinic(selectedClinicId);
    }
  }, [selectedClinicId, loading, selectClinic]);

  const buildGenerateRequest = (): GenerateHomepageRequest | null => {
    if (!localDraft?.clinicProfile) return null;
    const services =
      localDraft.sections.services.cards.map((card) => ({
        serviceId: card.serviceId,
        name: card.name ?? 'Service',
        shortDescription: card.shortDescription,
        iconKey: card.iconKey,
      })) ?? cdSource?.services ?? [];

    const doctors =
      localDraft.sections.doctors.profiles.map((profile) => ({
        doctorId: profile.doctorId,
        name: profile.name ?? 'Doctor',
        specialty: profile.specialty,
        bio: profile.bio,
        photoUrl: profile.photoUrl ?? null,
      })) ?? cdSource?.doctors ?? [];

    return {
      clinicProfile: localDraft.clinicProfile,
      services,
      doctors,
      contentStyle: localDraft.contentStyle,
      templateId: localDraft.templateId,
      slug: localDraft.slug,
      siteEnabled: localDraft.siteEnabled,
      bookingEnabled: localDraft.bookingEnabled,
    };
  };

  const handleGenerate = async () => {
    const input = buildGenerateRequest();
    if (!input) return;

    if (selectedClinic?.status === 'published') {
      const ok = window.confirm(
        'Regenerate will overwrite AI-generated content. The slug will be kept. Continue?',
      );
      if (!ok) return;
    }

    setBusy(true);
    setMessage(null);
    setSlugSuggestions([]);

    try {
      const result = await generateDraft(input);
      setLocalDraft(result.draft);
      setSavedDraft(result.draft);
      if (result.suggestedSlugs?.length) {
        setMessage({ type: 'info', text: `Slug adjusted. Suggested: ${result.suggestedSlugs.join(', ')}` });
      } else {
        setMessage({ type: 'success', text: 'Homepage generated successfully.' });
      }
      await loadClinics();
    } catch (err) {
      if (err instanceof AdminApiError && err.code === 'SLUG_CONFLICT' && err.suggestedSlugs) {
        setSlugSuggestions(err.suggestedSlugs);
        setMessage({ type: 'error', text: 'Slug conflict. Choose a suggested slug below.' });
      } else {
        setMessage({ type: 'error', text: `AI generation failed: ${String(err)}` });
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!localDraft) return;
    setBusy(true);
    setMessage(null);
    setSlugSuggestions([]);

    try {
      const saved = await saveDraft(localDraft.clinicId, localDraft);
      setLocalDraft(saved);
      setSavedDraft(saved);
      setMessage({ type: 'success', text: 'Draft saved.' });
      await loadClinics();
    } catch (err) {
      if (err instanceof AdminApiError && err.code === 'SLUG_CONFLICT' && err.suggestedSlugs) {
        setSlugSuggestions(err.suggestedSlugs);
        setMessage({ type: 'error', text: 'Slug conflict. Choose a suggested slug below.' });
      } else {
        setMessage({ type: 'error', text: `Save failed: ${String(err)}` });
      }
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!localDraft || isDirty) return;

    setBusy(true);
    setMessage(null);
    setSlugSuggestions([]);

    try {
      const result = await publishDraft(localDraft.slug);
      const updated: HomepageDraft = {
        ...localDraft,
        status: 'published',
        publishedUrl: result.publishedUrl,
        publishedAt: result.publishedAt,
        draftUpdatedAt: result.publishedAt,
      };
      setLocalDraft(updated);
      setSavedDraft(updated);
      setMessage({ type: 'success', text: `Published at ${result.publishedUrl}` });
      await loadClinics();
    } catch (err) {
      if (err instanceof AdminApiError && err.code === 'SLUG_CONFLICT' && err.suggestedSlugs) {
        setSlugSuggestions(err.suggestedSlugs);
        setMessage({ type: 'error', text: 'Slug conflict on publish. Choose a suggested slug, save, then publish again.' });
      } else {
        setMessage({ type: 'error', text: `Publish failed: ${String(err)}` });
      }
    } finally {
      setBusy(false);
    }
  };

  const updateDraft = (patch: Partial<HomepageDraft>) => {
    setLocalDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const updateClinicProfile = (field: string, value: string) => {
    setLocalDraft((prev) => {
      if (!prev?.clinicProfile) return prev;
      return {
        ...prev,
        clinicProfile: { ...prev.clinicProfile, [field]: value },
      };
    });
  };

  const updateAddress = (field: string, value: string) => {
    setLocalDraft((prev) => {
      if (!prev?.clinicProfile) return prev;
      return {
        ...prev,
        clinicProfile: {
          ...prev.clinicProfile,
          address: { ...prev.clinicProfile.address, [field]: value },
        },
      };
    });
  };

  const updateHero = (field: 'title' | 'description', value: string) => {
    setLocalDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: {
          ...prev.sections,
          hero: { ...prev.sections.hero, [field]: value },
        },
      };
    });
  };

  const updateServiceDescription = (index: number, value: string) => {
    setLocalDraft((prev) => {
      if (!prev) return prev;
      const cards = [...prev.sections.services.cards];
      cards[index] = { ...cards[index], shortDescription: value };
      return {
        ...prev,
        sections: {
          ...prev.sections,
          services: { ...prev.sections.services, cards },
        },
      };
    });
  };

  const updateDoctorBio = (index: number, value: string) => {
    setLocalDraft((prev) => {
      if (!prev) return prev;
      const profiles = [...prev.sections.doctors.profiles];
      profiles[index] = { ...profiles[index], bio: value };
      return {
        ...prev,
        sections: {
          ...prev.sections,
          doctors: { ...prev.sections.doctors, profiles },
        },
      };
    });
  };

  const applySuggestedSlug = (slug: string) => {
    setLocalDraft((prev) => (prev ? { ...prev, slug } : prev));
    setSlugSuggestions([]);
    setMessage({ type: 'info', text: `Slug set to "${slug}". Save draft before publishing.` });
  };

  const previewSnapshot = localDraft?.clinicProfile ? draftToSnapshot(localDraft) : null;
  const publicPath = localDraft?.slug ? `http://localhost:3000/${localDraft.slug}` : null;

  if (loading) {
    return <div className="admin-loading">Loading clinics…</div>;
  }

  return (
    <div className="admin-page">
      <header className="admin-toolbar">
        <h1>Homepage CMS</h1>
        <select
          value={selectedClinicId}
          onChange={(e) => setSelectedClinicId(e.target.value)}
          disabled={busy}
        >
          {clinics.map((c) => (
            <option key={c.clinicId} value={c.clinicId}>
              {c.name}
            </option>
          ))}
        </select>
        {selectedClinic && (
          <span className={`status-badge ${selectedClinic.status}`}>
            {statusLabel(selectedClinic.status)}
          </span>
        )}
        <div className="actions">
          <button type="button" onClick={handleGenerate} disabled={busy || !localDraft}>
            {busy ? 'Working…' : 'Generate'}
          </button>
          <button type="button" onClick={handleSave} disabled={busy || !localDraft || !isDirty}>
            Save draft
          </button>
          <button
            type="button"
            className="primary"
            onClick={handlePublish}
            disabled={busy || !localDraft || isDirty}
          >
            Publish
          </button>
        </div>
      </header>

      {message && <div className={`admin-message ${message.type}`}>{message.text}</div>}

      <div className="admin-split">
        <div className="admin-form-panel">
          {!localDraft ? (
            <p className="admin-empty-preview">Select a clinic to begin.</p>
          ) : (
            <>
              <fieldset>
                <legend>Subdomain / Slug</legend>
                <label htmlFor="slug">Slug</label>
                <input
                  id="slug"
                  value={localDraft.slug}
                  onChange={(e) => updateDraft({ slug: e.target.value })}
                />
                {slugSuggestions.length > 0 && (
                  <div className="slug-suggestions">
                    {slugSuggestions.map((s) => (
                      <button key={s} type="button" onClick={() => applySuggestedSlug(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <label htmlFor="contentStyle">Content style</label>
                <select
                  id="contentStyle"
                  value={localDraft.contentStyle}
                  onChange={(e) => updateDraft({ contentStyle: e.target.value as ContentStyle })}
                >
                  <option value="warm">Warm</option>
                  <option value="professional">Professional</option>
                  <option value="modern">Modern</option>
                </select>
              </fieldset>

              <fieldset>
                <legend>Clinic info (override CD)</legend>
                <label htmlFor="clinicName">Name</label>
                <input
                  id="clinicName"
                  value={localDraft.clinicProfile?.name ?? ''}
                  onChange={(e) => updateClinicProfile('name', e.target.value)}
                />
                <label htmlFor="clinicPhone">Phone</label>
                <input
                  id="clinicPhone"
                  value={localDraft.clinicProfile?.phone ?? ''}
                  onChange={(e) => updateClinicProfile('phone', e.target.value)}
                />
                <label htmlFor="addressLine">Address</label>
                <input
                  id="addressLine"
                  value={localDraft.clinicProfile?.address.line1 ?? ''}
                  onChange={(e) => updateAddress('line1', e.target.value)}
                />
                <label htmlFor="addressCity">City</label>
                <input
                  id="addressCity"
                  value={localDraft.clinicProfile?.address.city ?? ''}
                  onChange={(e) => updateAddress('city', e.target.value)}
                />
              </fieldset>

              <fieldset>
                <legend>Hero</legend>
                <label htmlFor="heroTitle">Title</label>
                <input
                  id="heroTitle"
                  value={localDraft.sections.hero.title}
                  onChange={(e) => updateHero('title', e.target.value)}
                />
                <label htmlFor="heroDesc">Description</label>
                <textarea
                  id="heroDesc"
                  value={localDraft.sections.hero.description}
                  onChange={(e) => updateHero('description', e.target.value)}
                />
              </fieldset>

              <fieldset>
                <legend>Services</legend>
                {localDraft.sections.services.cards.map((card, i) => (
                  <div key={card.serviceId}>
                    <label>{card.name ?? `Service ${i + 1}`}</label>
                    <textarea
                      value={card.shortDescription}
                      onChange={(e) => updateServiceDescription(i, e.target.value)}
                    />
                  </div>
                ))}
              </fieldset>

              <fieldset>
                <legend>Doctors</legend>
                {localDraft.sections.doctors.profiles.map((doc, i) => (
                  <div key={doc.doctorId}>
                    <label>{doc.name ?? `Doctor ${i + 1}`}</label>
                    <textarea value={doc.bio} onChange={(e) => updateDoctorBio(i, e.target.value)} />
                  </div>
                ))}
              </fieldset>
            </>
          )}
        </div>

        <div className="admin-preview-panel">
          {previewSnapshot ? (
            <SitePage snapshot={previewSnapshot} />
          ) : (
            <p className="admin-empty-preview">Preview will appear here.</p>
          )}
        </div>
      </div>

      <footer className="admin-footer-bar">
        {localDraft?.publishedUrl && (
          <span>
            Published:{' '}
            <a href={localDraft.publishedUrl} target="_blank" rel="noreferrer">
              {localDraft.publishedUrl}
            </a>
            {' · '}
          </span>
        )}
        {publicPath && (
          <span>
            Local preview:{' '}
            <a href={publicPath} target="_blank" rel="noreferrer">
              {publicPath}
            </a>
          </span>
        )}
        {isDirty && <span> · Unsaved changes</span>}
      </footer>
    </div>
  );
}
