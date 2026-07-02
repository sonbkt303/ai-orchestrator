import * as draftRepo from '../../db/repositories/draft.repository';
import { cdAdapter } from '../clinic/cd-adapter';
import { AppError } from '../../utils/app-error';

export async function listClinics() {
  return cdAdapter.listClinics();
}

export async function getClinic(clinicId: string) {
  const clinic = await cdAdapter.getClinic(clinicId);
  if (!clinic) {
    throw new AppError('Clinic not found', 404);
  }
  return clinic;
}

export async function listAllDrafts() {
  return draftRepo.listAllDrafts();
}
