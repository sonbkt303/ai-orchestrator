import type { AppointmentSection as AppointmentSectionType } from '@clever-dent/shared-contracts';

interface AppointmentSectionProps {
  section: AppointmentSectionType;
  bookingEnabled: boolean;
}

export function AppointmentSection({ section, bookingEnabled }: AppointmentSectionProps) {
  return (
    <section className="section appointment">
      <h2>{section.title}</h2>
      <p>{section.description}</p>
      {bookingEnabled ? (
        <p className="badge">Online booking enabled (form coming in Phase 2)</p>
      ) : (
        <p className="badge muted">Booking currently unavailable</p>
      )}
    </section>
  );
}
