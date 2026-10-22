'use client';

import Link from 'next/link';
import { useState } from 'react';
import { depotProgression, statutLecon } from '@/lib/progression';
import { useProgression } from '@/lib/progression/useProgression';
import type { LeconResumee } from './Progression';
import { BadgeStatut } from './Progression';

const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

/** Détail des leçons rédigées : état, meilleur score au quiz, dernière visite. */
export function TableauLecons({ lecons }: { lecons: LeconResumee[] }) {
  const etats = useProgression();
  const validees = lecons.filter((l) => statutLecon(etats[l.id], true) === 'validee').length;
  return (
    <>
      <p className="font-technique text-beton">
        {validees} leçon{validees > 1 ? 's' : ''} validée{validees > 1 ? 's' : ''} sur {lecons.length} disponible{lecons.length > 1 ? 's' : ''}.
      </p>
      <div className="tableau mt-2">
        <table className="w-full border-collapse text-[0.95rem]">
          <thead>
            <tr className="border-b-2 border-trait/20 text-left font-technique">
              <th className="py-1.5 pr-3">Leçon</th>
              <th className="py-1.5 pr-3">État</th>
              <th className="py-1.5 pr-3">Dernière visite</th>
            </tr>
          </thead>
          <tbody>
            {lecons.map((l) => {
              const vue = etats[l.id]?.vue;
              return (
                <tr key={l.id} className="border-b border-trait/10 align-top">
                  <td className="py-1.5 pr-3">
                    <Link href={`/lecons/${l.slug}`} className="text-encre hover:underline">
                      <span className="font-technique text-beton">{l.id}</span> {l.titre}
                    </Link>
                  </td>
                  <td className="py-1.5 pr-3">
                    <BadgeStatut id={l.id} redigee />
                  </td>
                  <td className="whitespace-nowrap py-1.5 pr-3 font-technique text-beton">{vue ? dateCourte.format(new Date(vue)) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Effacement de la progression, avec confirmation en deux temps. */
export function EffacerProgression() {
  const [confirmer, setConfirmer] = useState(false);
  if (!confirmer)
    return (
      <button type="button" onClick={() => setConfirmer(true)} className="rounded border border-correction px-3 py-1 font-technique text-correction hover:bg-correction-clair">
        Effacer ma progression…
      </button>
    );
  return (
    <span className="flex flex-wrap items-center gap-2 font-technique">
      <span className="text-correction">Tout effacer sur cet appareil ? C’est définitif.</span>
      <button
        type="button"
        onClick={() => {
          depotProgression().effacer();
          setConfirmer(false);
        }}
        className="rounded bg-correction px-3 py-1 text-sur-couleur"
      >
        Oui, effacer
      </button>
      <button type="button" onClick={() => setConfirmer(false)} className="rounded border border-trait/30 px-3 py-1">
        Annuler
      </button>
    </span>
  );
}
