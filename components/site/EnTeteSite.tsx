import Link from 'next/link';
import { ChoixTheme } from './ChoixTheme';

const LIENS = [
  { href: '/', texte: 'Parcours' },
  { href: '/tableau-de-bord', texte: 'Tableau de bord' },
  { href: '/glossaire', texte: 'Glossaire' },
];

/** Barre de navigation du site (masquée à l'impression). */
export function EnTeteSite() {
  return (
    <header className="ne-pas-imprimer border-b border-trait/10 bg-papier/95">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 font-technique" aria-label="Navigation principale">
        <Link href="/" className="mr-auto text-lg font-bold tracking-wide text-encre">
          Génie Civil Académie
        </Link>
        <ul className="flex flex-wrap gap-x-4 text-[1rem]">
          {LIENS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-trait hover:text-encre hover:underline">
                {l.texte}
              </Link>
            </li>
          ))}
        </ul>
        <form action="/recherche" role="search" className="flex items-center">
          <label htmlFor="recherche-site" className="sr-only">
            Rechercher dans le cours
          </label>
          <input
            id="recherche-site"
            name="q"
            type="search"
            placeholder="Rechercher…"
            className="h-9 w-40 rounded-l-md border border-trait/20 bg-surface px-2 font-texte text-[0.95rem] text-trait placeholder:text-beton sm:w-52"
          />
          <button type="submit" aria-label="Lancer la recherche" className="grid h-9 w-9 place-items-center rounded-r-md bg-encre text-sur-couleur">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6" />
              <path d="m15 15 5.5 5.5" />
            </svg>
          </button>
        </form>
        <ChoixTheme />
      </nav>
    </header>
  );
}
