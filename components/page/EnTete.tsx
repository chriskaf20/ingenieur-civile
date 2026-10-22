'use client';

import { useLecon } from './LeconContexte';

/** En-tête de feuille : module à gauche, leçon à droite. */
export function EnTete() {
  const lecon = useLecon();
  if (!lecon) return <div className="feuille-entete" aria-hidden="true" />;
  return (
    <div className="feuille-entete">
      <span>
        {lecon.moduleId} · {lecon.moduleTitre}
      </span>
      <span className="text-right">
        {lecon.id} · {lecon.titre}
      </span>
    </div>
  );
}

/** Mention de relecture affichée en pied de page. */
export function MentionRelecture() {
  const lecon = useLecon();
  if (!lecon || lecon.relecture) return null;
  return <span title="Contenu pas encore validé par un ingénieur">non relu</span>;
}
