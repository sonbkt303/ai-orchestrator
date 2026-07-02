import type { ReviewsSection as ReviewsSectionType } from '@clever-dent/shared-contracts';

interface ReviewsSectionProps {
  section?: ReviewsSectionType;
}

export function ReviewsSection({ section }: ReviewsSectionProps) {
  return (
    <section className="section reviews">
      <h2>{section?.sectionTitle ?? 'Patient Reviews'}</h2>
      <p className="muted">Reviews integration coming in a later phase.</p>
    </section>
  );
}
