import type { DepotProgression, EtatLecon } from './types';

const CLE = 'gca:progression:v1';

/** Stockage minimal compatible avec window.localStorage (injectable pour les tests). */
export interface Stockage {
  getItem(cle: string): string | null;
  setItem(cle: string, valeur: string): void;
}

function lireStockage(stockage: Stockage | null): Record<string, EtatLecon> {
  if (!stockage) return {};
  try {
    const brut = stockage.getItem(CLE);
    const donnees: unknown = brut ? JSON.parse(brut) : {};
    return donnees && typeof donnees === 'object' ? (donnees as Record<string, EtatLecon>) : {};
  } catch {
    return {};
  }
}

/** Implémentation locale : un objet en mémoire, recopié dans le stockage à chaque écriture. */
export function creerDepotLocal(stockage: Stockage | null, maintenant: () => Date = () => new Date()): DepotProgression {
  let etat = lireStockage(stockage);
  const abonnes = new Set<() => void>();

  const ecrire = (suivant: Record<string, EtatLecon>) => {
    etat = suivant;
    try {
      stockage?.setItem(CLE, JSON.stringify(etat));
    } catch {
      // stockage plein ou bloqué : la progression reste valable pour la session
    }
    abonnes.forEach((f) => f());
  };

  return {
    lireTout: () => etat,
    lire: (id) => etat[id],
    marquerVue(id) {
      ecrire({ ...etat, [id]: { ...etat[id], vue: maintenant().toISOString() } });
    },
    enregistrerQuiz(id, score, total) {
      const precedent = etat[id]?.quiz;
      const meilleur = Math.max(score, precedent?.meilleur ?? 0);
      ecrire({ ...etat, [id]: { ...etat[id], quiz: { score, total, meilleur, date: maintenant().toISOString() } } });
    },
    abonner(rappel) {
      abonnes.add(rappel);
      return () => {
        abonnes.delete(rappel);
      };
    },
  };
}
