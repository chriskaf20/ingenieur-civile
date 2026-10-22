'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type Mode = 'pages' | 'defilement';
const CLE_MODE = 'gca:lecteur:mode';

interface Voisine {
  href: string;
  titre: string;
}

interface Repere {
  etape: string;
  titre: string;
}

function lireMode(): Mode {
  try {
    return localStorage.getItem(CLE_MODE) === 'defilement' ? 'defilement' : 'pages';
  } catch {
    return 'pages';
  }
}

function pageDuHash(feuilles: HTMLElement[]): number | null {
  const h = decodeURIComponent(window.location.hash.slice(1));
  if (!h) return null;
  const m = h.match(/^page-(\d+)$/);
  if (m) return Math.min(Math.max(Number(m[1]) - 1, 0), feuilles.length - 1);
  // Ancre interne : on ouvre la page qui la contient.
  const cible = document.getElementById(h);
  const i = cible ? feuilles.findIndex((f) => f.contains(cible)) : -1;
  return i >= 0 ? i : null;
}

/**
 * Lecteur de leçon : une feuille A4 à la fois (flèches du clavier, sommaire)
 * ou toutes les feuilles à la suite. Les feuilles masquées restent montées :
 * réponses de quiz et saisies des fiches de calcul sont conservées.
 * L'impression sort toujours toutes les pages.
 */
export function Lecteur({ children, precedente, suivante }: { children: React.ReactNode; precedente?: Voisine; suivante?: Voisine }) {
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>('pages');
  const [page, setPage] = useState(0);
  const [reperes, setReperes] = useState<Repere[]>([]);

  const feuilles = useCallback(() => [...(ref.current?.querySelectorAll<HTMLElement>('.feuille') ?? [])], []);

  // Inventaire des feuilles, numérotation explicite et page de départ.
  useEffect(() => {
    const fs = feuilles();
    fs.forEach((f, i) => f.style.setProperty('counter-set', `page ${i + 1}`));
    setReperes(
      fs.map((f) => ({
        etape: f.dataset.etape ?? '',
        titre: f.dataset.titre ?? f.querySelector('h1, h2, h3')?.textContent?.trim() ?? '',
      })),
    );
    setMode(lireMode());
    setPage(pageDuHash(fs) ?? 0);
    const suivreHash = () => {
      const i = pageDuHash(feuilles());
      if (i !== null) setPage(i);
    };
    window.addEventListener('hashchange', suivreHash);
    return () => window.removeEventListener('hashchange', suivreHash);
  }, [feuilles]);

  // Affichage de la feuille active.
  useEffect(() => {
    feuilles().forEach((f, i) => f.classList.toggle('feuille--active', i === page));
  }, [page, feuilles, reperes]);

  const aller = useCallback(
    (i: number) => {
      const n = feuilles().length;
      if (n === 0) return;
      const cible = Math.min(Math.max(i, 0), n - 1);
      setPage(cible);
      window.history.replaceState(null, '', `#page-${cible + 1}`);
      ref.current?.scrollIntoView({ block: 'start' });
    },
    [feuilles],
  );

  // Clavier : flèches gauche/droite, sauf pendant une saisie.
  useEffect(() => {
    if (mode !== 'pages') return;
    const touche = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      if (e.key === 'ArrowRight') aller(page + 1);
      else if (e.key === 'ArrowLeft') aller(page - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, [mode, page, aller]);

  const changerMode = () => {
    const m: Mode = mode === 'pages' ? 'defilement' : 'pages';
    setMode(m);
    try {
      localStorage.setItem(CLE_MODE, m);
    } catch {
      // préférence non mémorisée
    }
    if (m === 'defilement') requestAnimationFrame(() => feuilles()[page]?.scrollIntoView({ block: 'start' }));
  };

  const n = reperes.length;
  const pagine = mode === 'pages' && n > 0;
  const derniere = page === n - 1;

  const navigation = (bas: boolean) => (
    <div className={`lecteur-barre ne-pas-imprimer ${bas ? 'lecteur-barre--bas' : ''}`}>
      {pagine ? (
        <>
          <button type="button" onClick={() => aller(page - 1)} disabled={page === 0} className="lecteur-bouton">
            ← <span className="max-sm:sr-only">Page précédente</span>
          </button>
          {bas ? (
            <span className="font-technique text-beton">
              Page {page + 1} / {n}
            </span>
          ) : (
            <label className="flex min-w-0 flex-1 items-center gap-2">
              <span className="sr-only">Aller à la page</span>
              <select value={page} onChange={(e) => aller(Number(e.target.value))} className="lecteur-sommaire">
                {reperes.map((r, i) => (
                  <option key={i} value={i}>
                    {i + 1} / {n} · {r.etape}
                    {r.titre && r.titre !== r.etape ? ` — ${r.titre}` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          {derniere && suivante ? (
            <Link href={suivante.href} className="lecteur-bouton lecteur-bouton--plein">
              <span className="max-sm:sr-only">Leçon suivante</span> →
            </Link>
          ) : (
            <button type="button" onClick={() => aller(page + 1)} disabled={derniere} className="lecteur-bouton lecteur-bouton--plein">
              <span className="max-sm:sr-only">Page suivante</span> →
            </button>
          )}
        </>
      ) : (
        <span className="flex-1" />
      )}
      {bas ? null : (
        <button type="button" onClick={changerMode} className="lecteur-bouton" title="Changer de mode de lecture">
          {mode === 'pages' ? 'Tout afficher' : 'Page par page'}
        </button>
      )}
    </div>
  );

  return (
    <>
      {navigation(false)}
      <article ref={ref} className={`lecon scroll-mt-14 ${pagine ? 'lecteur--pages' : ''}`}>
        {children}
      </article>
      {pagine ? navigation(true) : null}
      <nav className="ne-pas-imprimer mx-auto flex max-w-[210mm] flex-wrap justify-between gap-3 px-4 pb-10 font-technique" aria-label="Leçons voisines">
        {precedente ? (
          <Link href={precedente.href} className="text-encre hover:underline">
            ← {precedente.titre}
          </Link>
        ) : (
          <span />
        )}
        {suivante ? (
          <Link href={suivante.href} className="text-encre hover:underline">
            {suivante.titre} →
          </Link>
        ) : null}
      </nav>
    </>
  );
}
