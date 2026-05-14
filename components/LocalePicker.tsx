'use client';

import { useRouter, usePathname } from 'next/navigation';

const LOCALES = ['en-us', 'es'] as const;
type Locale = (typeof LOCALES)[number];

const LABELS: Record<Locale, string> = { 'en-us': 'English', es: 'Español' };

export default function LocalePicker({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    let targetPath: string;
    if (next === 'es') {
      // Add /es prefix: /news/slug → /es/news/slug, / → /es
      targetPath = pathname === '/' ? '/es' : `/es${pathname}`;
    } else {
      // Strip /es prefix: /es/news/slug → /news/slug, /es → /
      targetPath = pathname.startsWith('/es/') ? pathname.slice(3) : '/';
    }
    router.push(targetPath);
  }

  return (
    <select
      className="locale-picker"
      value={currentLocale}
      onChange={handleChange}
      aria-label="Language"
    >
      {LOCALES.map((locale) => (
        <option key={locale} value={locale}>
          {LABELS[locale]}
        </option>
      ))}
    </select>
  );
}
