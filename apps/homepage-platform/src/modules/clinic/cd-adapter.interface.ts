import type { GenerateHomepageRequest } from '@clever-dent/shared-contracts';

export interface ClinicListItem {
  clinicId: string;
  name: string;
  city?: string;
  district?: string;
}

export interface CdAdapter {
  listClinics(): Promise<ClinicListItem[]>;
  getClinic(clinicId: string): Promise<Omit<GenerateHomepageRequest, 'slug'> | null>;
}
