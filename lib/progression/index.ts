import { creerDepotLocal, type Stockage } from './local';
import type { DepotProgression } from './types';

export type { DepotProgression, EtatLecon, ResultatQuiz } from './types';
export { quizValide, SEUIL_VALIDATION } from './types';
export * from './statistiques';

let depot: DepotProgression | null = null;

function stockageNavigateur(): Stockage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null; // navigation privée ou stockage bloqué
  }
}

/** Point d'accès unique à la progression (côté navigateur). */
export function depotProgression(): DepotProgression {
  depot ??= creerDepotLocal(stockageNavigateur());
  return depot;
}
