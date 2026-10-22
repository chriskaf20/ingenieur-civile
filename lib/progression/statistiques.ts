// Calculs d'avancement à partir de l'état de progression (fonctions pures).
import { quizValide, type EtatLecon } from './types';

export type Etats = Readonly<Record<string, EtatLecon>>;

/** à-venir : pas encore rédigée · à-faire : jamais ouverte · vue : ouverte · validée : quiz ≥ 70 %. */
export type StatutLecon = 'a-venir' | 'a-faire' | 'vue' | 'validee';

export function statutLecon(etat: EtatLecon | undefined, redigee: boolean): StatutLecon {
  if (!redigee) return 'a-venir';
  if (quizValide(etat?.quiz)) return 'validee';
  return etat?.vue ? 'vue' : 'a-faire';
}

export interface Avancement {
  total: number; // leçons, projets et examens du périmètre
  redigees: number;
  vues: number; // ouvertes au moins une fois (validées comprises)
  validees: number;
  /** Part validée du périmètre complet, en % arrondi à l'unité. */
  pourcentage: number;
}

export function avancement(ids: readonly string[], etats: Etats, redigees: ReadonlySet<string>): Avancement {
  let r = 0;
  let v = 0;
  let ok = 0;
  for (const id of ids) {
    const s = statutLecon(etats[id], redigees.has(id));
    if (s !== 'a-venir') r++;
    if (s === 'vue' || s === 'validee') v++;
    if (s === 'validee') ok++;
  }
  return { total: ids.length, redigees: r, vues: v, validees: ok, pourcentage: ids.length ? Math.round((100 * ok) / ids.length) : 0 };
}

/**
 * Leçon à proposer : la dernière ouverte et non validée ;
 * sinon la première leçon rédigée non validée, dans l'ordre du cursus.
 */
export function leconAReprendre(ordre: readonly string[], etats: Etats, redigees: ReadonlySet<string>): string | undefined {
  let recente: { id: string; date: string } | undefined;
  for (const id of ordre) {
    const e = etats[id];
    if (!redigees.has(id) || !e?.vue || quizValide(e.quiz)) continue;
    if (!recente || e.vue > recente.date) recente = { id, date: e.vue };
  }
  return recente?.id ?? ordre.find((id) => redigees.has(id) && !quizValide(etats[id]?.quiz));
}

/**
 * Prérequis rédigés mais pas encore validés (conseil, pas de blocage).
 * Un prérequis de module est satisfait quand toutes ses leçons rédigées sont validées.
 */
export function prerequisAValider(
  prerequis: readonly string[],
  etats: Etats,
  redigees: ReadonlySet<string>,
  leconsDuModule: (id: string) => readonly string[] | undefined,
): string[] {
  return prerequis.filter((p) => {
    const ids = leconsDuModule(p) ?? [p];
    return ids.some((id) => redigees.has(id) && !quizValide(etats[id]?.quiz));
  });
}
