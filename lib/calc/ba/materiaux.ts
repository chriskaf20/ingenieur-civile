// Matériaux du béton armé selon l'EC2 (EN 1992-1-1:2004) et son annexe nationale française.

/** EC2 §2.4.2.4, tableau 2.1N : situations durables et transitoires. */
export const GAMMA_C = 1.5;
export const GAMMA_S = 1.15;
/** EC2 §3.1.6(1) : αcc = 1,0 dans l'annexe nationale française. */
export const ALPHA_CC = 1.0;

export const CLASSES_BETON = ['C20/25', 'C25/30', 'C30/37', 'C35/45', 'C40/50'] as const;
export type ClasseBeton = (typeof CLASSES_BETON)[number];

/** Résistance caractéristique fck (MPa) lue dans la désignation « Cfck/fck,cube ». */
export function fckDeClasse(classe: ClasseBeton): number {
  return Number(classe.slice(1, classe.indexOf('/')));
}

/** Résistance de calcul du béton en compression fcd = αcc·fck/γc (MPa), EC2 §3.1.6. */
export function fcd(fck: number): number {
  return (ALPHA_CC * fck) / GAMMA_C;
}

/** Limite d'élasticité de calcul de l'acier fyd = fyk/γs (MPa), EC2 §3.2.7. */
export function fyd(fyk: number): number {
  return fyk / GAMMA_S;
}

/** Désignation « Cfck/fck,cube » d'une classe courante à partir de fck (MPa), EC2 tableau 3.1. */
export function classeDeFck(fck: number): ClasseBeton | undefined {
  return CLASSES_BETON.find((c) => fckDeClasse(c) === fck);
}

/** Module d'élasticité de l'acier de béton armé Es = 200 000 MPa, EC2 §3.2.7(4). */
export const E_S = 200_000;

/** Écart entre résistance moyenne et caractéristique : fcm = fck + 8 MPa, EC2 tableau 3.1. */
export const DELTA_FCM = 8;

/**
 * Coefficient s de l'EC2 §3.1.2(6) selon la classe de ciment :
 * R (CEM 42,5 R, 52,5 N, 52,5 R) 0,20 ; N (CEM 32,5 R, 42,5 N) 0,25 ; S (CEM 32,5 N) 0,38.
 */
export const S_CIMENT = { R: 0.2, N: 0.25, S: 0.38 } as const;
export type ClasseCiment = keyof typeof S_CIMENT;

/** Limite d'élasticité caractéristique de l'acier B500 (EN 10080 ; EN 1992-1-1 annexe C) : fyk = 500 MPa. */
export const FYK_B500 = 500;
