import type { DoctorsSection as DoctorsSectionType } from '@clever-dent/shared-contracts';

interface DoctorsSectionProps {
  section: DoctorsSectionType;
}

export function DoctorsSection({ section }: DoctorsSectionProps) {
  return (
    <section className="section doctors">
      <h2>Our Doctors</h2>
      <div className="card-grid">
        {section.profiles.map((doctor) => (
          <article key={doctor.doctorId} className="card">
            <h3>{doctor.name ?? 'Doctor'}</h3>
            {doctor.specialty ? <p className="muted">{doctor.specialty}</p> : null}
            <p>{doctor.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
