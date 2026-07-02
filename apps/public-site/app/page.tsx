import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="landing">
      <h1>Clever Dent Public Site</h1>
      <p>Dev landing — open a published clinic homepage:</p>
      <ul>
        <li>
          <Link href="/smile-dental">/smile-dental</Link> (path-based)
        </li>
        <li>
          <a href="http://smile-dental.local.cleverdent.ai:3000">
            smile-dental.local.cleverdent.ai:3000
          </a>{' '}
          (subdomain — requires hosts entry)
        </li>
      </ul>
    </main>
  );
}
