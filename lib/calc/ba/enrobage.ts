// Enrobage nominal selon l'EC2 §4.4.1.

export const CLASSES_EXPOSITION = ['X0', 'XC1', 'XC2', 'XC3', 'XC4', 'XD1', 'XS1', 'XD2', 'XS2', 'XD3', 'XS3'] as const;
export type ClasseExposition = (typeof CLASSES_EXPOSITION)[number];

/**
 * cmin,dur (mm) pour la classe structurale S4 (durée d'utilisation 50 ans), EC2 tableau 4.4N.
 * Simplification pédagogique : aucune modulation de classe structurale (tableau 4.3NF) n'est appliquée.
 */
export const CMIN_DUR_S4: Record<ClasseExposition, number> = {
  X0: 10, XC1: 15, XC2: 25, XC3: 25, XC4: 30, XD1: 35, XS1: 35, XD2: 40, XS2: 40, XD3: 45, XS3: 45,
};

/** Tolérance d'exécution Δcdev, valeur recommandée EC2 §4.4.1.3(1). */
export const DELTA_C_DEV = 10; // mm

export interface Enrobage {
  cminB: number; // exigence d'adhérence (mm)
  cminDur: number; // exigence de durabilité (mm)
  cmin: number;
  cnom: number;
}

/**
 * Enrobage nominal de la barre la plus proche de la paroi (souvent le cadre).
 * cmin = max(cmin,b ; cmin,dur ; 10 mm), EC2 (4.2) ; cnom = cmin + Δcdev, EC2 (4.1).
 * cmin,b = diamètre de la barre (barres isolées), EC2 tableau 4.2.
 */
export function enrobageNominal(exposition: ClasseExposition, diametreBarreExterieure: number): Enrobage {
  const cminB = diametreBarreExterieure;
  const cminDur = CMIN_DUR_S4[exposition];
  const cmin = Math.max(cminB, cminDur, 10);
  return { cminB, cminDur, cmin, cnom: cmin + DELTA_C_DEV };
}
