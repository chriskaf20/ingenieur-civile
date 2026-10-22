'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { chercher, preparer, type EntreeRecherche, type TypeEntree } from '@/lib/recherche';

const TYPES: Record<TypeEntree, string> = { lecon: 'Leçon', module: 'Module', terme: 'Glossaire', formule: 'Formule' };

/** Champ de recherche et résultats (index chargé une fois, filtrage instantané). */
export function Recherche() {
  const params = useSearchParams();
  const [requete, setRequete] = useState(params.get('q') ?? '');
  const [index, setIndex] = useState<EntreeRecherche[] | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let actif = true;
    fetch('/recherche.json')
      .then((r) => r.json() as Promise<EntreeRecherche[]>)
      .then((d) => actif && setIndex(d))
      .catch(() => actif && setErreur(true));
    return () => {
      actif = false;
    };
  }, []);

  // L'adresse suit la requête : on peut partager ou recharger la recherche.
  useEffect(() => {
    const url = requete ? `/recherche?q=${encodeURIComponent(requete)}` : '/recherche';
    window.history.replaceState(null, '', url);
  }, [requete]);

  const preparees = useMemo(() => (index ? preparer(index) : []), [index]);
  const resultats = useMemo(() => chercher(preparees, requete), [preparees, requete]);

  return (
    <div className="mt-4">
      <label htmlFor="recherche-page" className="font-technique font-semibold">
        Que cherches-tu ?
      </label>
      <input
        id="recherche-page"
        type="search"
        value={requete}
        onChange={(e) => setRequete(e.target.value)}
        placeholder="ex. poteau, enrobage, remblai, latérite…"
        autoFocus
        className="mt-1 block h-11 w-full rounded-md border border-trait/25 bg-surface px-3 text-lg text-trait placeholder:text-beton"
      />
      <div aria-live="polite" className="mt-4">
        {erreur ? (
          <p className="text-correction">L’index de recherche n’a pas pu être chargé. Reconnecte-toi une fois pour l’enregistrer sur l’appareil.</p>
        ) : !index ? (
          <p className="text-beton">Chargement de l’index…</p>
        ) : requete.trim() === '' ? (
          <p className="text-beton">{index.length} entrées indexées. Tape un ou plusieurs mots : les accents ne comptent pas.</p>
        ) : resultats.length === 0 ? (
          <p className="text-beton">Aucun résultat pour « {requete} ». Essaie un mot plus court ou plus général.</p>
        ) : (
          <>
            <p className="font-technique text-beton">
              {resultats.length} résultat{resultats.length > 1 ? 's' : ''}
              {resultats.length === 40 ? ' (les 40 meilleurs)' : ''}
            </p>
            <ul className="mt-2 grid gap-2">
              {resultats.map((r) => (
                <li key={`${r.type}-${r.url}-${r.titre}`}>
                  <Link href={r.url} className={`block rounded-lg bg-papier p-3 shadow-sm hover:ring-2 hover:ring-encre/40 ${r.aVenir ? 'opacity-80' : ''}`}>
                    <span className="flex flex-wrap items-baseline gap-x-2 font-technique text-[0.82rem] text-beton">
                      <span className="rounded bg-encre-clair px-1.5 font-semibold uppercase tracking-wide text-encre">{TYPES[r.type]}</span>
                      <span>{r.contexte}</span>
                      {r.aVenir ? <span className="italic">à venir</span> : null}
                    </span>
                    <span className="mt-0.5 block font-technique text-lg font-bold text-trait">{r.titre}</span>
                    {r.resume ? <span className="block text-[0.95rem]">{r.resume}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
