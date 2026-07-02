import type { HeroSection as HeroSectionType } from '@clever-dent/shared-contracts';

interface HeroSectionProps {
  section: HeroSectionType;
  clinicName: string;
}

export function HeroSection({ section, clinicName }: HeroSectionProps) {
  return (
    <section className="section hero">
      <p className="eyebrow">{clinicName}</p>
      <h1>{section.title}</h1>
      <p>{section.description}</p>
    </section>
  );
}
