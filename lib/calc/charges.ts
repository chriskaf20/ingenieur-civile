// Combinaisons d'actions (EC0).

/** Coefficients partiels ELU, situation durable, équation (6.10) : EC0 Annexe A1, tableau A1.2(B). */
export const GAMMA_G = 1.35;
export const GAMMA_Q = 1.5;

/** Combinaison fondamentale à l'ELU (charges permanentes défavorables + une action variable). */
export function combinaisonELU(G: number, Q: number): number {
  return GAMMA_G * G + GAMMA_Q * Q;
}

/** Combinaison caractéristique à l'ELS. */
export function combinaisonELS(G: number, Q: number): number {
  return G + Q;
}
