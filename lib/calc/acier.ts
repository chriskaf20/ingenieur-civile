// Armatures pour béton armé : sections et masses linéiques.

/** Masse volumique de l'acier servant au calcul des masses nominales (EN 10080). */
export const MASSE_VOLUMIQUE_ACIER = 7850; // kg/m³

/** Diamètres nominaux courants des barres HA (mm). */
export const DIAMETRES_HA = [6, 8, 10, 12, 14, 16, 20, 25, 32] as const;

/** Section d'une barre de diamètre φ (mm), en cm². */
export function sectionBarre(phi: number): number {
  return (Math.PI * phi * phi) / 4 / 100;
}

/** Section de n barres de diamètre φ (mm), en cm². */
export function sectionBarres(n: number, phi: number): number {
  return n * sectionBarre(phi);
}

/** Masse linéique d'une barre de diamètre φ (mm), en kg/m. */
export function masseLineique(phi: number): number {
  return MASSE_VOLUMIQUE_ACIER * (Math.PI * (phi / 1000) ** 2) / 4;
}

export interface ChoixBarres {
  n: number;
  phi: number;
  section: number; // cm²
}

/** Combinaisons (n barres × φ) triées par section croissante, puis par nombre de barres. */
export function combinaisonsBarres(nombres: readonly number[], diametres: readonly number[]): ChoixBarres[] {
  const liste: ChoixBarres[] = [];
  for (const n of nombres) for (const phi of diametres) liste.push({ n, phi, section: sectionBarres(n, phi) });
  return liste.sort((a, b) => a.section - b.section || a.n - b.n);
}
