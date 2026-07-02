import type { ServicesSection as ServicesSectionType } from '@clever-dent/shared-contracts';

interface ServicesSectionProps {
  section: ServicesSectionType;
}

export function ServicesSection({ section }: ServicesSectionProps) {
  return (
    <section className="section services">
      <h2>{section.sectionTitle}</h2>
      <div className="card-grid">
        {section.cards.map((card) => (
          <article key={card.serviceId} className="card">
            <h3>{card.name ?? card.iconKey ?? 'Service'}</h3>
            <p>{card.shortDescription}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
