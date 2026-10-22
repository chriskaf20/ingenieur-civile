// Résistance des matériaux : cas de base utilisés par les schémas.

/** Poutre sur deux appuis simples, charge uniforme q (kN/m), portée L (m). */
export function poutreUniforme(q: number, L: number) {
  return {
    reaction: (q * L) / 2, // kN, sur chaque appui
    momentMax: (q * L * L) / 8, // kN·m, à mi-portée
    moment: (x: number) => (q * x * (L - x)) / 2,
    effortTranchant: (x: number) => q * (L / 2 - x),
  };
}

/** Cercle de Mohr d'un état plan de contraintes (MPa) ; angle en degrés depuis l'axe x. */
export function cercleMohr(sx: number, sy: number, txy: number) {
  const centre = (sx + sy) / 2;
  const rayon = Math.hypot((sx - sy) / 2, txy);
  return {
    centre,
    rayon,
    s1: centre + rayon,
    s2: centre - rayon,
    tauMax: rayon,
    angleP: (Math.atan2(2 * txy, sx - sy) * 90) / Math.PI,
  };
}
