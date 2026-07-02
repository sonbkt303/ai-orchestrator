import type { ClinicProfile, LocationSection as LocationSectionType } from '@clever-dent/shared-contracts';

interface LocationSectionProps {
  section: LocationSectionType;
  clinicProfile: ClinicProfile;
}

export function LocationSection({ section, clinicProfile }: LocationSectionProps) {
  const { address } = clinicProfile;

  return (
    <section className="section location">
      <h2>Location</h2>
      <p>{section.displayAddressText}</p>
      <address>
        {address.line1}, {address.city}
        {address.district ? `, ${address.district}` : ''}
      </address>
      <p>{clinicProfile.phone}</p>
    </section>
  );
}
