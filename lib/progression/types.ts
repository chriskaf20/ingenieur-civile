// Contrat d'accès à la progression de l'étudiant. L'implémentation locale
// (localStorage) pourra être remplacée par une implémentation Supabase sans
// toucher aux composants, qui ne dépendent que de cette interface.

export interface ResultatQuiz {
  score: number;
  total: number;
  meilleur: number; // meilleur score obtenu
  date: string; // ISO 8601
}

export interface EtatLecon {
  vue?: string; // date ISO de la dernière visite
  quiz?: ResultatQuiz;
}

export interface DepotProgression {
  lireTout(): Readonly<Record<string, EtatLecon>>;
  lire(id: string): EtatLecon | undefined;
  marquerVue(id: string): void;
  enregistrerQuiz(id: string, score: number, total: number): void;
  /** Efface toute la progression (choix explicite de l'étudiant). */
  effacer(): void;
  /** Prévient l'abonné à chaque changement ; renvoie la fonction de désabonnement. */
  abonner(rappel: () => void): () => void;
}

/** Seuil de validation d'un quiz ou d'un examen : 65 % (choix du projet, CURRICULUM.md). */
export const SEUIL_VALIDATION = 0.65;

/** Seuil lisible : « 65 % ». */
export const SEUIL_TEXTE = `${Math.round(SEUIL_VALIDATION * 100)} %`;

export function quizValide(q: ResultatQuiz | undefined): boolean {
  return Boolean(q && q.total > 0 && q.meilleur / q.total >= SEUIL_VALIDATION);
}
