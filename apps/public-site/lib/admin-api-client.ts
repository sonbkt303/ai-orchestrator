import {
  GenerateHomepageAdminResponseSchema,
  GenerateHomepageRequest,
  HomepageDraft,
  HomepageDraftSchema,
} from '@clever-dent/shared-contracts';

const homepageApiUrl = process.env.NEXT_PUBLIC_HOMEPAGE_API_URL ?? process.env.HOMEPAGE_API_URL ?? 'http://localhost:3002';
const adminBase = `${homepageApiUrl}/v1/admin`;

export interface ClinicListItem {
  clinicId: string;
  name: string;
  city?: string;
  district?: string;
}

export type ClinicStatus = 'no_draft' | 'draft' | 'published';

export interface ClinicWithStatus extends ClinicListItem {
  status: ClinicStatus;
  slug?: string;
  publishedUrl?: string | null;
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public suggestedSlugs?: string[],
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${adminBase}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (body.error === 'SLUG_CONFLICT') {
      throw new AdminApiError(body.message ?? 'Slug conflict', response.status, 'SLUG_CONFLICT', body.suggestedSlugs);
    }
    throw new AdminApiError(body.error ?? body.message ?? response.statusText, response.status, body.code);
  }

  return response.json() as Promise<T>;
}

export async function fetchClinics(): Promise<ClinicListItem[]> {
  const data = await request<{ clinics: ClinicListItem[] }>('/clinics');
  return data.clinics;
}

export async function fetchClinicSource(clinicId: string): Promise<Omit<GenerateHomepageRequest, 'slug'>> {
  return request(`/clinics/${clinicId}`);
}

export async function fetchAllDrafts(): Promise<HomepageDraft[]> {
  const data = await request<{ drafts: HomepageDraft[] }>('/homepage');
  return data.drafts.map((d) => HomepageDraftSchema.parse(d));
}

export async function fetchDraft(clinicId: string): Promise<HomepageDraft | null> {
  try {
    const data = await request<{ draft: HomepageDraft }>(`/homepage/${clinicId}/draft`);
    return HomepageDraftSchema.parse(data.draft);
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function generateDraft(
  input: GenerateHomepageRequest,
): Promise<{ draft: HomepageDraft; suggestedSlugs?: string[] }> {
  const data = await request<unknown>('/homepage/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const parsed = GenerateHomepageAdminResponseSchema.parse(data);
  return parsed;
}

export async function saveDraft(clinicId: string, draft: HomepageDraft): Promise<HomepageDraft> {
  const data = await request<{ draft: HomepageDraft }>(`/homepage/${clinicId}/draft`, {
    method: 'PATCH',
    body: JSON.stringify(draft),
  });
  return HomepageDraftSchema.parse(data.draft);
}

export async function publishDraft(slug: string): Promise<{ publishedUrl: string; publishedAt: string }> {
  return request('/homepage/publish', {
    method: 'POST',
    body: JSON.stringify({ slug }),
  });
}

export async function suggestSlugs(name: string, district?: string, city?: string): Promise<string[]> {
  const params = new URLSearchParams({ name });
  if (district) params.set('district', district);
  if (city) params.set('city', city);
  const data = await request<{ suggestedSlugs: string[] }>(`/slugs/suggest?${params}`);
  return data.suggestedSlugs;
}

export function mergeClinicStatus(
  clinics: ClinicListItem[],
  drafts: HomepageDraft[],
): ClinicWithStatus[] {
  const draftByClinic = new Map(drafts.map((d) => [d.clinicId, d]));

  return clinics.map((clinic) => {
    const draft = draftByClinic.get(clinic.clinicId);
    if (!draft) {
      return { ...clinic, status: 'no_draft' as const };
    }
    return {
      ...clinic,
      status: draft.status === 'published' ? ('published' as const) : ('draft' as const),
      slug: draft.slug,
      publishedUrl: draft.publishedUrl,
    };
  });
}
