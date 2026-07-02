import { GenerateHomepageRequestSchema } from '@clever-dent/shared-contracts';
import registry from '../../fixtures/clinics-registry.json';
import type { CdAdapter, ClinicListItem } from './cd-adapter.interface';

type ClinicEntry = Omit<import('@clever-dent/shared-contracts').GenerateHomepageRequest, 'slug'>;

const clinics: ClinicEntry[] = registry.map((entry) =>
  GenerateHomepageRequestSchema.omit({ slug: true }).parse(entry),
);

export const mockCdAdapter: CdAdapter = {
  async listClinics(): Promise<ClinicListItem[]> {
    return clinics.map((c) => ({
      clinicId: c.clinicProfile.clinicId,
      name: c.clinicProfile.name,
      city: c.clinicProfile.address.city,
      district: c.clinicProfile.address.district,
    }));
  },

  async getClinic(clinicId: string) {
    return clinics.find((c) => c.clinicProfile.clinicId === clinicId) ?? null;
  },
};
