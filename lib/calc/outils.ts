// Outils de comparaison utilisés par les corrigés d'exercices.

/** Écart absolu et relatif d'une valeur `b` par rapport à une référence `a`. */
export function comparer(a: number, b: number): { ecart: number; ecartRelatif: number } {
  return { ecart: b - a, ecartRelatif: a === 0 ? NaN : (b - a) / a };
}
