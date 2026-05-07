import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <section className="section">
        <h2>Page not found</h2>
        <p>The requested content could not be located.</p>
        <p>
          <Link href="/">Return to homepage</Link>
        </p>
      </section>
    </main>
  );
}
