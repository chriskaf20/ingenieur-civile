import type { ReactNode } from 'react';

export type Entrees = Record<string, number | string>;

export interface ChampNombre {
  type?: 'nombre';
  cle: string;
  libelle: string;
  symbole: ReactNode;
  unite: string;
  min: number;
  max: number;
  pas: number;
  decimales: number;
}

export interface ChampChoix {
  type: 'choix';
  cle: string;
  libelle: string;
  symbole: ReactNode;
  options: ReadonlyArray<{ valeur: number | string; libelle: string }>;
}

export type Champ = ChampNombre | ChampChoix;

/**
 * Définition d'une fiche de calcul interactive : les valeurs affichées proviennent
 * toujours de `calculer`, qui appelle une fonction pure de lib/calc/.
 */
export interface DefinitionCalcul<R> {
  champs: readonly Champ[];
  defaut: Entrees;
  calculer: (e: Entrees) => R;
  /** valeurs formatées, appelées depuis le MDX par <Val k="…" /> et <Resultat k="…" /> */
  valeurs: Record<string, (r: R, e: Entrees) => string>;
  /** lignes d'application numérique, appelées par <AN k="…" /> */
  lignes?: Record<string, (r: R, e: Entrees) => ReactNode>;
  schema?: (p: { r: R; e: Entrees }) => ReactNode;
  /** schémas nommés, appelés par <Schema k="…" /> pour répartir les dessins sur plusieurs pages */
  schemas?: Record<string, (p: { r: R; e: Entrees }) => ReactNode>;
  alerte?: (r: R) => string | undefined;
}

export function num(e: Entrees, cle: string): number {
  const v = e[cle];
  return typeof v === 'number' ? v : Number(v);
}
