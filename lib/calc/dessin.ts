// Échelles de dessin : passage d'une mesure sur le plan à la longueur réelle et inversement.

/** Échelles normalisées courantes en bâtiment (dénominateurs). */
export const ECHELLES = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000] as const;

/** Longueur réelle (m) d'une mesure de `mesure` mm sur un plan au 1/`echelle`. */
export function longueurReelle(mesure: number, echelle: number): number {
  return (mesure * echelle) / 1000;
}

/** Longueur à dessiner (mm) pour une longueur réelle de `longueur` m au 1/`echelle`. */
export function longueurPapier(longueur: number, echelle: number): number {
  return (longueur * 1000) / echelle;
}
