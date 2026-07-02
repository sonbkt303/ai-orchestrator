import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clever Dent',
  description: 'Dental clinic homepage platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
