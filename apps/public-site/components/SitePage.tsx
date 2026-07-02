import type { PublishedSnapshot } from '@clever-dent/shared-contracts';
import { HeroSection } from '@/lib/sections/HeroSection';
import { ServicesSection } from '@/lib/sections/ServicesSection';
import { DoctorsSection } from '@/lib/sections/DoctorsSection';
import { AppointmentSection } from '@/lib/sections/AppointmentSection';
import { LocationSection } from '@/lib/sections/LocationSection';
import { ReviewsSection } from '@/lib/sections/ReviewsSection';
import { FooterSection } from '@/lib/sections/FooterSection';

interface SitePageProps {
  snapshot: PublishedSnapshot;
}

export function SitePage({ snapshot }: SitePageProps) {
  const { sections, clinicProfile } = snapshot;

  return (
    <div className="site" data-template={snapshot.templateId} data-style={snapshot.contentStyle}>
      <HeroSection section={sections.hero} clinicName={clinicProfile.name} />
      <ServicesSection section={sections.services} />
      <DoctorsSection section={sections.doctors} />
      <AppointmentSection section={sections.appointment} bookingEnabled={snapshot.bookingEnabled} />
      <LocationSection section={sections.location} clinicProfile={clinicProfile} />
      <ReviewsSection section={sections.reviews} />
      <FooterSection section={sections.footer} clinicProfile={clinicProfile} />
    </div>
  );
}
