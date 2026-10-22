// Les dix étapes pédagogiques d'une leçon (ordre fixe, cf. CLAUDE.md).

export const ETAPES = {
  objectifs: '1 · Objectifs',
  intuition: '2 · Intuition',
  cours: '3 · Cours',
  schemas: '4 · Schémas',
  exemple: '5 · Exemple résolu',
  erreurs: '6 · Erreurs fréquentes',
  terrain: '7 · Sur le terrain',
  memo: '8 · Fiche mémo',
  exercices: '9 · Exercices',
  quiz: '10 · Quiz',
  // Mini-projet et examen de fin de module
  projet: 'Mini-projet',
  examen: 'Examen',
} as const;

export type Etape = keyof typeof ETAPES;
