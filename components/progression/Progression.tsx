'use client';

import Link from 'next/link';
import { avancement, leconAReprendre, prerequisAValider, statutLecon, type StatutLecon } from '@/lib/progression';
import { useProgression } from '@/lib/progression/useProgression';

const STATUTS: Record<StatutLecon, { texte: string; classe: string }> = {
  'a-venir': { texte: 'À venir', classe: 'border-dashed border-beton/60 text-beton' },
  'a-faire': { texte: 'À faire', classe: 'border-encre/60 text-encre' },
  vue: { texte: 'Commencée', classe: 'border-encre bg-encre-clair text-encre' },
  validee: { texte: 'Validée', classe: 'border-validation bg-validation-clair text-validation' },
};

/** Pastille d'état d'une leçon. */
export function BadgeStatut({ id, redigee }: { id: string; redigee: boolean }) {
  const etats = useProgression();
  const s = STATUTS[statutLecon(etats[id], redigee)];
  const q = etats[id]?.quiz;
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0 font-technique text-[0.8rem] ${s.classe}`}>
      {s.texte}
      {q ? ` · quiz ${q.meilleur}/${q.total}` : ''}
    </span>
  );
}

/** Barre d'avancement d'un ensemble de séances (module, niveau, cursus). */
export function BarreAvancement({ ids, redigees, compacte = false }: { ids: string[]; redigees: string[]; compacte?: boolean }) {
  const etats = useProgression();
  const a = avancement(ids, etats, new Set(redigees));
  const pVues = a.total ? (100 * a.vues) / a.total : 0;
  return (
    <div className="font-technique text-[0.82rem] text-beton">
      <div
        className={`relative overflow-hidden rounded-full bg-beton-clair ${compacte ? 'h-1.5' : 'h-2.5'}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={a.pourcentage}
        aria-label={`${a.validees} séances validées sur ${a.total}`}
      >
        <div className="absolute inset-y-0 left-0 bg-encre/35" style={{ width: `${pVues}%` }} />
        <div className="absolute inset-y-0 left-0 bg-validation" style={{ width: `${a.pourcentage}%` }} />
      </div>
      {compacte ? null : (
        <p className="mt-1">
          {a.validees} validée{a.validees > 1 ? 's' : ''} · {a.vues} commencée{a.vues > 1 ? 's' : ''} · {a.redigees} disponible
          {a.redigees > 1 ? 's' : ''} sur {a.total}
        </p>
      )}
    </div>
  );
}

export interface LeconResumee {
  id: string;
  slug: string;
  titre: string;
  module: string;
}

/** Carte « Reprendre » : dernière leçon commencée, ou première à faire. */
export function Reprendre({ ordre, redigees }: { ordre: string[]; redigees: LeconResumee[] }) {
  const etats = useProgression();
  const id = leconAReprendre(ordre, etats, new Set(redigees.map((l) => l.id)));
  const l = redigees.find((x) => x.id === id);
  if (!l) return <p className="font-technique text-validation">Toutes les leçons disponibles sont validées. Bravo !</p>;
  const commencee = Boolean(etats[l.id]?.vue);
  return (
    <Link href={`/lecons/${l.slug}`} className="group flex items-center justify-between gap-3 rounded-lg bg-encre px-4 py-3 text-sur-couleur shadow-sm">
      <span>
        <span className="block font-technique text-[0.85rem] uppercase tracking-wider opacity-85">{commencee ? 'Reprendre' : 'Commencer'}</span>
        <span className="block font-technique text-xl font-bold">
          {l.id} · {l.titre}
        </span>
      </span>
      <span aria-hidden="true" className="text-2xl transition group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

/** Conseil affiché quand des prérequis rédigés ne sont pas encore validés (aucun blocage). */
export function ConseilPrerequis({
  prerequis,
  redigees,
  modules,
}: {
  prerequis: string[];
  redigees: string[];
  modules: Record<string, string[]>;
}) {
  const etats = useProgression();
  const manquants = prerequisAValider(prerequis, etats, new Set(redigees), (id) => modules[id]);
  if (manquants.length === 0) return null;
  return (
    <span className="font-technique text-[0.8rem] text-brique" title="Conseil : valide d'abord ces prérequis (quiz ≥ 70 %).">
      Conseil : valide d’abord {manquants.join(', ')}
    </span>
  );
}
