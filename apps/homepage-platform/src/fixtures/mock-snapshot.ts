import { PublishedSnapshot } from '@clever-dent/shared-contracts';

export const mockPublishedSnapshot: PublishedSnapshot = {
  clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  slug: 'smile-dental',
  publishedAt: '2026-07-01T10:30:00Z',
  siteEnabled: true,
  bookingEnabled: true,
  templateId: 'template-1',
  contentStyle: 'warm',
  seo: {
    metaTitle: 'Smile Dental Clinic — Your Smile, Our Priority',
    metaDescription: 'Professional dental care in Gangnam, Seoul.',
    ogImageUrl: null,
  },
  sections: {
    hero: {
      title: 'Your Smile, Our Priority',
      description:
        'Welcome to Smile Dental Clinic. We provide comprehensive dental care with a warm, patient-first approach.',
      aiGenerated: true,
    },
    services: {
      sectionTitle: 'Our Services',
      cards: [
        {
          serviceId: '11111111-1111-1111-1111-111111111111',
          name: 'Dental Cleaning',
          shortDescription: 'Professional cleaning for a brighter, healthier smile.',
          iconKey: 'cleaning',
        },
        {
          serviceId: '22222222-2222-2222-2222-222222222222',
          name: 'Teeth Whitening',
          shortDescription: 'Safe and effective whitening treatments.',
          iconKey: 'whitening',
        },
      ],
    },
    doctors: {
      profiles: [
        {
          doctorId: '33333333-3333-3333-3333-333333333333',
          name: 'Dr. Kim Minsoo',
          specialty: 'Implantology',
          bio: '15 years of experience in implant and restorative dentistry.',
          photoUrl: null,
        },
      ],
    },
    appointment: {
      title: 'Schedule Your Visit',
      description: 'Book an appointment online. Our team will confirm your preferred time.',
    },
    location: {
      displayAddressText: 'Conveniently located in Gangnam, Seoul — 123 Gangnam-daero',
    },
    footer: {
      contactOverride: null,
      hoursOverride: null,
      socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/smile-dental' }],
    },
    reviews: {
      sectionTitle: 'Patient Reviews',
      placeholder: true,
    },
  },
  clinicProfile: {
    clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Smile Dental Clinic',
    phone: '+82-2-1234-5678',
    address: {
      line1: '123 Gangnam-daero',
      city: 'Seoul',
      district: 'Gangnam',
      country: 'KR',
      postalCode: '06000',
      latitude: 37.4979,
      longitude: 127.0276,
    },
    operatingHours: [
      { dayOfWeek: 'MON', open: '09:00', close: '19:00', closed: false },
      { dayOfWeek: 'SAT', open: null, close: null, closed: true },
    ],
    locale: 'ko-KR',
    timezone: 'Asia/Seoul',
  },
};
