import type { ClinicProfile, FooterSection as FooterSectionType } from '@clever-dent/shared-contracts';

interface FooterSectionProps {
  section: FooterSectionType;
  clinicProfile: ClinicProfile;
}

export function FooterSection({ section, clinicProfile }: FooterSectionProps) {
  const contact = section.contactOverride ?? clinicProfile.phone;

  return (
    <footer className="section footer">
      <h2>{clinicProfile.name}</h2>
      <p>{contact}</p>
      {section.socialLinks?.length ? (
        <ul className="social-links">
          {section.socialLinks.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.platform}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </footer>
  );
}
