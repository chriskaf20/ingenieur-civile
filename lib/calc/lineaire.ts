// Algèbre linéaire (module L1.4) : matrices, pivot de Gauss, déterminant, inverse, rang, rotations,
// valeurs propres et aperçu du calcul matriciel des structures (K u = F). Unités SI, sauf mention.
import { systemeTreillis, type DonneesTreillis } from './statique';

export type Matrice = number[][];
export type MatriceL = readonly (readonly number[])[];

const nettoyer = (x: number) => (Math.abs(x) < 1e-12 ? 0 : x);

// ---------- L1.4.1 : opérations ----------

export function dimensions(A: MatriceL): [number, number] {
  return [A.length, A[0]?.length ?? 0];
}

export function somme(A: MatriceL, B: MatriceL): Matrice {
  return A.map((l, i) => l.map((a, j) => a + B[i]![j]!));
}

export function foisScalaire(k: number, A: MatriceL): Matrice {
  return A.map((l) => l.map((a) => k * a));
}

/** Produit matriciel A (m × n) × B (n × p) : c_ij = Σ_k a_ik b_kj. */
export function produit(A: MatriceL, B: MatriceL): Matrice {
  const [m, n] = dimensions(A);
  const [n2, p] = dimensions(B);
  if (n !== n2) throw new Error('dimensions incompatibles');
  return Array.from({ length: m }, (_, i) => Array.from({ length: p }, (_, j) => nettoyer(Array.from({ length: n }, (_, k) => A[i]![k]! * B[k]![j]!).reduce((s, v) => s + v, 0))));
}

/** Produit d'une matrice par un vecteur colonne. */
export function produitVecteur(A: MatriceL, x: readonly number[]): number[] {
  return A.map((l) => nettoyer(l.reduce((s, a, j) => s + a * x[j]!, 0)));
}

export function transposee(A: MatriceL): Matrice {
  const [m, n] = dimensions(A);
  return Array.from({ length: n }, (_, j) => Array.from({ length: m }, (_, i) => A[i]![j]!));
}

export function identite(n: number): Matrice {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

export const ELEMENTS_METRE = ['semelle', 'poteau', 'poutre'] as const;
export const MATERIAUX_METRE = [
  { nom: 'béton', unite: 'm³' },
  { nom: 'acier', unite: 'kg' },
  { nom: 'coffrage', unite: 'm²' },
] as const;

/** Quantités par élément (données de l'énoncé) : semelle 1,0 × 1,0 × 0,5 m ; poteau 0,30 × 0,30 × 3,0 m ; poutre 0,25 × 0,50 × 4,0 m. */
export const QUANTITES_UNITAIRES: MatriceL = [
  [0.5, 25, 2],
  [0.27, 40, 3.6],
  [0.5, 60, 5],
];

/** Prix unitaires indicatifs de l'énoncé (USD par m³, kg, m²). */
export const PRIX_METRE: readonly number[] = [150, 1.6, 12];

export const EXEMPLE_METRE = { n: [8, 8, 6] as readonly number[] };

/** Métré matriciel : totaux par matériau = nᵀ Q (ligne × matrice), puis coût = totaux · prix. */
export function metre(n: readonly number[], Q: MatriceL = QUANTITES_UNITAIRES, prix: readonly number[] = PRIX_METRE): { totaux: number[]; couts: number[]; cout: number } {
  const totaux = produit([n as number[]], Q)[0]!;
  const couts = totaux.map((t, j) => t * prix[j]!);
  return { totaux, couts, cout: couts.reduce((s, c) => s + c, 0) };
}

// ---------- L1.4.2 : pivot de Gauss ----------

export interface EtapeGauss {
  type: 'depart' | 'echange' | 'elimination';
  ops: Array<{ ligne: number; source: number; k: number }>; // L_ligne ← L_ligne − k L_source (numéros à partir de 1)
  echange?: [number, number];
  M: Matrice; // matrice augmentée [A | b] après l'opération
  colonne: number | null;
}

/** Pivot de Gauss pas à pas : triangulation (échange de lignes si un pivot est nul), puis remontée. */
export function pivotGauss(A: MatriceL, b: readonly number[]): { etapes: EtapeGauss[]; x: number[] | null } {
  const n = b.length;
  const M: Matrice = A.map((l, i) => [...l, b[i]!]);
  const copie = () => M.map((l) => l.map(nettoyer));
  const etapes: EtapeGauss[] = [{ type: 'depart', ops: [], M: copie(), colonne: null }];
  for (let c = 0; c < n; c++) {
    if (Math.abs(M[c]![c]!) < 1e-12) {
      const r = M.findIndex((l, i) => i > c && Math.abs(l[c]!) > 1e-12);
      if (r < 0) return { etapes, x: null };
      [M[c], M[r]] = [M[r]!, M[c]!];
      etapes.push({ type: 'echange', ops: [], echange: [c + 1, r + 1], M: copie(), colonne: c });
    }
    const ops: EtapeGauss['ops'] = [];
    for (let i = c + 1; i < n; i++) {
      const k = M[i]![c]! / M[c]![c]!;
      if (Math.abs(k) < 1e-12) continue;
      for (let j = c; j <= n; j++) M[i]![j]! -= k * M[c]![j]!;
      ops.push({ ligne: i + 1, source: c + 1, k });
    }
    if (ops.length) etapes.push({ type: 'elimination', ops, M: copie(), colonne: c });
  }
  if (Math.abs(M[n - 1]![n - 1]!) < 1e-12) return { etapes, x: null };
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i]![n]!;
    for (let j = i + 1; j < n; j++) s -= M[i]![j]! * x[j]!;
    x[i] = nettoyer(s / M[i]![i]!);
  }
  return { etapes, x };
}

export interface Granulat {
  nom: string;
  p5: number; // passant au tamis de 5 mm (fraction)
  p15: number; // passant au tamis de 15 mm (fraction)
}

/** Granulats de l'énoncé : passants mesurés (fractions) aux tamis de 5 et 15 mm. */
export const GRANULATS: readonly Granulat[] = [
  { nom: 'sable 0/5', p5: 0.95, p15: 1 },
  { nom: 'gravillon 5/15', p5: 0.1, p15: 0.9 },
  { nom: 'gravier 15/25', p5: 0, p15: 0.15 },
];

export const EXEMPLE_MELANGE = { cible5: 0.4, cible15: 0.65 };

/** Mélange de trois granulats : proportions x, y, z telles que x + y + z = 1 et que les passants visés soient atteints. */
export function melangeGranulats(cible5: number, cible15: number, g: readonly Granulat[] = GRANULATS) {
  const A: Matrice = [
    [1, 1, 1],
    g.map((q) => q.p5),
    g.map((q) => q.p15),
  ];
  const b = [1, cible5, cible15];
  return { A, b, ...pivotGauss(A, b) };
}

// ---------- L1.4.3 : déterminant et inverse ----------

/** Déterminant par élimination de Gauss (produit des pivots, au signe des échanges près). */
export function determinant(A: MatriceL): number {
  const n = A.length;
  const M = A.map((l) => [...l]);
  let det = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(M[i]![c]!) > Math.abs(M[p]![c]!)) p = i;
    if (Math.abs(M[p]![c]!) < 1e-12) return 0;
    if (p !== c) {
      [M[c], M[p]] = [M[p]!, M[c]!];
      det = -det;
    }
    det *= M[c]![c]!;
    for (let i = c + 1; i < n; i++) {
      const k = M[i]![c]! / M[c]![c]!;
      for (let j = c; j < n; j++) M[i]![j]! -= k * M[c]![j]!;
    }
  }
  return nettoyer(det);
}

/** Règle de Sarrus pour une matrice 3 × 3 : trois produits « descendants » moins trois « montants ». */
export function sarrus(A: MatriceL): { plus: number[]; moins: number[]; det: number } {
  const a = A;
  const plus = [a[0]![0]! * a[1]![1]! * a[2]![2]!, a[0]![1]! * a[1]![2]! * a[2]![0]!, a[0]![2]! * a[1]![0]! * a[2]![1]!];
  const moins = [a[0]![2]! * a[1]![1]! * a[2]![0]!, a[0]![0]! * a[1]![2]! * a[2]![1]!, a[0]![1]! * a[1]![0]! * a[2]![2]!];
  return { plus, moins, det: nettoyer(plus.reduce((s, v) => s + v, 0) - moins.reduce((s, v) => s + v, 0)) };
}

/** Inverse par la méthode de Gauss-Jordan sur [A | I] ; null si A n'est pas inversible. */
export function inverse(A: MatriceL): Matrice | null {
  const n = A.length;
  const M = A.map((l, i) => [...l, ...identite(n)[i]!]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(M[i]![c]!) > Math.abs(M[p]![c]!)) p = i;
    if (Math.abs(M[p]![c]!) < 1e-12) return null;
    [M[c], M[p]] = [M[p]!, M[c]!];
    const piv = M[c]![c]!;
    for (let j = 0; j < 2 * n; j++) M[c]![j]! /= piv;
    for (let i = 0; i < n; i++) {
      if (i === c) continue;
      const k = M[i]![c]!;
      for (let j = 0; j < 2 * n; j++) M[i]![j]! -= k * M[c]![j]!;
    }
  }
  return M.map((l) => l.slice(n).map(nettoyer));
}

export interface PointAppui {
  nom: string;
  x: number;
  y: number;
}

export const EXEMPLE_APPUIS_TRIANGLE: readonly [PointAppui, PointAppui, PointAppui] = [
  { nom: 'A', x: 0, y: 0 },
  { nom: 'B', x: 4, y: 0 },
  { nom: 'C', x: 2, y: 3.5 },
];

/** Cuve pleine de L1.3.12 posée sur le plateau : 240 kN en (2 ; 1,5) m. */
export const EXEMPLE_CHARGE_PLATEAU = { F: 240, xF: 2, yF: 1.5 };

/**
 * Plateau sur trois appuis (L1.3.12) écrit M R = F, avec M = [[1, 1, 1], [x_A, x_B, x_C], [y_A, y_B, y_C]].
 * det M = 2 × aire du triangle des appuis : nul si les appuis sont alignés. R = M⁻¹ F.
 */
export function inverseTroisAppuis(appuis: readonly PointAppui[], F: number, xF: number, yF: number) {
  const M: Matrice = [appuis.map(() => 1), appuis.map((a) => a.x), appuis.map((a) => a.y)];
  const det = determinant(M);
  const inv = inverse(M);
  const second = [F, F * xF, F * yF];
  return { M, det, aire: Math.abs(det) / 2, inv, second, R: inv ? produitVecteur(inv, second) : null };
}

// ---------- L1.4.4 : rang ----------

/** Forme échelonnée (élimination avec pivot partiel) et rang : nombre de lignes non nulles. */
export function echelonne(A: MatriceL): { E: Matrice; rang: number } {
  const E = A.map((l) => [...l]);
  const m = E.length;
  const n = E[0]?.length ?? 0;
  let ligne = 0;
  for (let c = 0; c < n && ligne < m; c++) {
    let p = ligne;
    for (let i = ligne + 1; i < m; i++) if (Math.abs(E[i]![c]!) > Math.abs(E[p]![c]!)) p = i;
    if (Math.abs(E[p]![c]!) < 1e-10) continue;
    [E[ligne], E[p]] = [E[p]!, E[ligne]!];
    for (let i = ligne + 1; i < m; i++) {
      const k = E[i]![c]! / E[ligne]![c]!;
      for (let j = c; j < n; j++) E[i]![j]! -= k * E[ligne]![j]!;
    }
    ligne++;
  }
  return { E: E.map((l) => l.map((v) => (Math.abs(v) < 1e-10 ? 0 : v))), rang: ligne };
}

export type NatureSysteme = 'unique' | 'infinite' | 'aucune';

/** Théorème de Rouché-Fontené : comparaison des rangs de A et de la matrice augmentée [A | b]. */
export function natureSysteme(A: MatriceL, b: readonly number[]): { rangA: number; rangAb: number; inconnues: number; nature: NatureSysteme } {
  const rangA = echelonne(A).rang;
  const rangAb = echelonne(A.map((l, i) => [...l, b[i]!])).rang;
  const inconnues = A[0]?.length ?? 0;
  const nature: NatureSysteme = rangA < rangAb ? 'aucune' : rangA === inconnues ? 'unique' : 'infinite';
  return { rangA, rangAb, inconnues, nature };
}

export interface CasRang {
  id: string;
  nom: string;
  A: MatriceL;
  b: readonly number[];
}

/** Trois plateaux sur trois appuis (système M R = F de L1.4.3) : appuis en triangle, appuis alignés avec une charge sur leur ligne, puis hors de leur ligne. */
export const CAS_RANG: readonly CasRang[] = [
  { id: 'triangle', nom: 'appuis en triangle', A: [[1, 1, 1], [0, 4, 2], [0, 0, 3.5]], b: [100, 200, 100] },
  { id: 'alignesSur', nom: 'appuis alignés, charge sur la ligne', A: [[1, 1, 1], [0, 4, 2], [0, 0, 0]], b: [100, 150, 0] },
  { id: 'alignesHors', nom: 'appuis alignés, charge hors de la ligne', A: [[1, 1, 1], [0, 4, 2], [0, 0, 0]], b: [100, 150, 80] },
];

/** Deux équations à deux inconnues : droites sécantes (x + y = 3, x − y = 1), confondues, parallèles. */
export const CAS_DROITES: readonly CasRang[] = [
  { id: 'secantes', nom: 'droites sécantes', A: [[1, 1], [1, -1]], b: [3, 1] },
  { id: 'confondues', nom: 'droites confondues', A: [[1, 1], [2, 2]], b: [3, 6] },
  { id: 'paralleles', nom: 'droites parallèles', A: [[1, 1], [1, 1]], b: [3, 1] },
];

/** Plateau de L1.4.3 dont l'appui C est en (2 ; y_C) : M R = F avec F = (F ; F x_F ; F y_F). y_C = 0 aligne les trois appuis. */
export function plateauRang(yC: number, F: number, xF: number, yF: number) {
  const appuis: PointAppui[] = [
    { nom: 'A', x: 0, y: 0 },
    { nom: 'B', x: 4, y: 0 },
    { nom: 'C', x: 2, y: yC },
  ];
  const M: Matrice = [appuis.map(() => 1), appuis.map((a) => a.x), appuis.map((a) => a.y)];
  const b = [F, F * xF, F * yF];
  const nature = natureSysteme(M, b);
  const E = echelonne(M.map((l, i) => [...l, b[i]!])).E;
  const R = nature.nature === 'unique' ? pivotGauss(M, b).x : null;
  return { appuis, M, b, E, R, ...nature };
}

// ---------- L1.4.5 : rotations ----------

/** Matrice de rotation plane d'angle θ (degrés), sens trigonométrique. */
export function rotation2(thetaDeg: number): Matrice {
  const t = (thetaDeg * Math.PI) / 180;
  return [
    [nettoyer(Math.cos(t)), nettoyer(-Math.sin(t))],
    [nettoyer(Math.sin(t)), nettoyer(Math.cos(t))],
  ];
}

/** Composantes d'un vecteur dans un repère local tourné de α : v_local = R(α)ᵀ v_global. */
export function versLocal(v: readonly [number, number], alphaDeg: number): [number, number] {
  const r = produitVecteur(transposee(rotation2(alphaDeg)), v);
  return [r[0]!, r[1]!];
}

/** Retour au repère global : v_global = R(α) v_local. */
export function versGlobal(v: readonly [number, number], alphaDeg: number): [number, number] {
  const r = produitVecteur(rotation2(alphaDeg), v);
  return [r[0]!, r[1]!];
}

/** Rotation dans l'espace autour d'un axe du repère (degrés). */
export function rotation3(axe: 'x' | 'y' | 'z', thetaDeg: number): Matrice {
  const t = (thetaDeg * Math.PI) / 180;
  const c = nettoyer(Math.cos(t));
  const s = nettoyer(Math.sin(t));
  if (axe === 'x') return [[1, 0, 0], [0, c, -s], [0, s, c]];
  if (axe === 'y') return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
}

export const EXEMPLE_REPERE = { Fx: 0, Fy: -2, alpha: 30 };

/**
 * Charge verticale q (kN/m) d'une panne posée sur un versant de pente α : repère local x' le long de la pente (vers le haut),
 * y' perpendiculaire au versant. Composantes locales = R(α)ᵀ (0 ; −q) : q sin α le long de la pente, q cos α perpendiculaire.
 */
export function chargeVersant(q: number, alphaDeg: number) {
  const R = rotation2(alphaDeg);
  const Rt = transposee(R);
  const global: [number, number] = [0, -q];
  const local = versLocal(global, alphaDeg);
  return { R, Rt, global, local, retour: versGlobal(local, alphaDeg), qPente: Math.abs(local[0]), qNormale: Math.abs(local[1]), norme: Math.hypot(local[0], local[1]) };
}

// ---------- L1.4.6 : valeurs propres ----------

/** Valeurs propres d'une matrice 2 × 2 : racines de λ² − tr λ + det = 0 ; vecteurs propres unitaires. Null si elles sont complexes. */
export function valeursPropres2(A: MatriceL): { trace: number; det: number; lambda: [number, number]; vecteurs: [number[], number[]] } | null {
  const [[a, b], [c, d]] = [A[0]!, A[1]!] as [readonly number[], readonly number[]];
  const tr = a! + d!;
  const det = a! * d! - b! * c!;
  const disc = tr * tr - 4 * det;
  if (disc < -1e-12) return null;
  const r = Math.sqrt(Math.max(disc, 0));
  const l1 = (tr + r) / 2;
  const l2 = (tr - r) / 2;
  const vecteur = (l: number): number[] => {
    let v = Math.abs(b!) > 1e-12 ? [b!, l - a!] : Math.abs(c!) > 1e-12 ? [l - d!, c!] : l === a ? [1, 0] : [0, 1];
    const n = Math.hypot(v[0]!, v[1]!);
    v = v.map((x) => nettoyer(x / n));
    if (v[0]! < 0 || (v[0] === 0 && v[1]! < 0)) v = v.map((x) => nettoyer(-x));
    return v;
  };
  return { trace: tr, det, lambda: [l1, l2], vecteurs: [vecteur(l1), vecteur(l2)] };
}

export interface DonneesContraintes {
  sx: number; // MPa, traction positive
  sy: number;
  txy: number;
}

export const EXEMPLE_CONTRAINTES: DonneesContraintes = { sx: 2, sy: 0, txy: 1.5 };

/** Contraintes principales = valeurs propres du tenseur [[σx, τ], [τ, σy]] ; directions = vecteurs propres. */
export function contraintesPrincipales(d: DonneesContraintes) {
  const T: Matrice = [
    [d.sx, d.txy],
    [d.txy, d.sy],
  ];
  const vp = valeursPropres2(T)!;
  const v1 = vp.vecteurs[0];
  const theta1 = (Math.atan2(v1[1]!, v1[0]!) * 180) / Math.PI;
  return { T, trace: vp.trace, det: vp.det, s1: vp.lambda[0], s2: vp.lambda[1], v1, v2: vp.vecteurs[1], theta1, tauMax: (vp.lambda[0] - vp.lambda[1]) / 2 };
}

/** Méthode de Jacobi pour une matrice symétrique 3 × 3 : valeurs propres (décroissantes) et vecteurs propres en colonnes. */
export function jacobiSym3(A: MatriceL): { valeurs: number[]; vecteurs: Matrice } {
  const a = A.map((l) => [...l]);
  const v = identite(3);
  for (let iter = 0; iter < 60; iter++) {
    let p = 0;
    let q = 1;
    for (const [i, j] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ] as const)
      if (Math.abs(a[i]![j]!) > Math.abs(a[p]![q]!)) [p, q] = [i, j];
    if (Math.abs(a[p]![q]!) < 1e-12) break;
    const phi = 0.5 * Math.atan2(2 * a[p]![q]!, a[q]![q]! - a[p]![p]!);
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    for (let k = 0; k < 3; k++) {
      const akp = a[k]![p]!;
      const akq = a[k]![q]!;
      a[k]![p] = c * akp - s * akq;
      a[k]![q] = s * akp + c * akq;
    }
    for (let k = 0; k < 3; k++) {
      const apk = a[p]![k]!;
      const aqk = a[q]![k]!;
      a[p]![k] = c * apk - s * aqk;
      a[q]![k] = s * apk + c * aqk;
    }
    for (let k = 0; k < 3; k++) {
      const vkp = v[k]![p]!;
      const vkq = v[k]![q]!;
      v[k]![p] = c * vkp - s * vkq;
      v[k]![q] = s * vkp + c * vkq;
    }
  }
  const ordre = [0, 1, 2].sort((i, j) => a[j]![j]! - a[i]![i]!);
  return { valeurs: ordre.map((i) => nettoyer(a[i]![i]!)), vecteurs: v.map((l) => ordre.map((i) => nettoyer(l[i]!))) };
}

// ---------- L1.4.7 : aperçu K u = F ----------

export interface DonneesDeuxBarres {
  E: number; // module d'Young (GPa)
  A1: number; // sections (cm²)
  A2: number;
  xA: number; // appui de la barre 1, par rapport au nœud libre N (m)
  yA: number;
  xB: number; // appui de la barre 2 (m)
  yB: number;
  Fx: number; // charge au nœud N (kN)
  Fy: number;
}

/** Deux tirants en acier (E = 210 GPa, EN 1993-1-1 §3.2.6) qui suspendent une charge de 20 kN. */
export const EXEMPLE_DEUX_BARRES: DonneesDeuxBarres = { E: 210, A1: 3, A2: 3, xA: -3, yA: 2, xB: 3, yB: 2, Fx: 0, Fy: -20 };

export interface BarreRigidite {
  L: number; // m
  c: number; // cosinus directeur, de l'appui vers le nœud
  s: number;
  k: number; // E A / L (kN/m)
  Ke: Matrice; // k [[c², cs], [cs, s²]] (kN/m)
}

/** Raideur axiale d'une barre : k = E A / L, avec E en GPa, A en cm² et L en m ; résultat en kN/m. */
export function raideurBarre(E: number, A: number, L: number): number {
  return (E * 1e6 * A * 1e-4) / L;
}

export interface BarreNoeud {
  x: number; // appui de la barre, par rapport au nœud libre N (m)
  y: number;
  A: number; // section (cm²)
}

/**
 * Nœud libre N relié à des appuis fixes par des barres articulées : assemblage K = Σ k [[c², cs], [cs, s²]],
 * résolution K u = F, puis efforts N = k (u · e) (traction positive). Valable aussi quand le nœud est hyperstatique.
 */
export function noeudBarres(E: number, barres: readonly BarreNoeud[], Fx: number, Fy: number) {
  const rig = barres.map((b): BarreRigidite => {
    const L = Math.hypot(b.x, b.y);
    const c = -b.x / L; // de l'appui (x, y) vers le nœud (0, 0)
    const s = -b.y / L;
    const k = raideurBarre(E, b.A, L);
    return { L, c, s, k, Ke: [[k * c * c, k * c * s], [k * c * s, k * s * s]] };
  });
  const K = rig.reduce<Matrice>((S, b) => somme(S, b.Ke), [[0, 0], [0, 0]]);
  const Kinv = inverse(K);
  const u = Kinv ? produitVecteur(Kinv, [Fx, Fy]) : null;
  const N = u ? rig.map((b) => b.k * (u[0]! * b.c + u[1]! * b.s)) : null;
  return { barres: rig, K, Kinv, det: determinant(K), u, N };
}

/**
 * Deux barres : K u = F, puis contrôle. Le système à deux barres est isostatique, les efforts doivent aussi
 * satisfaire l'équilibre du nœud.
 */
export function deuxBarres(d: DonneesDeuxBarres) {
  const r = noeudBarres(d.E, [{ x: d.xA, y: d.yA, A: d.A1 }, { x: d.xB, y: d.yB, A: d.A2 }], d.Fx, d.Fy);
  const [b1, b2] = [r.barres[0]!, r.barres[1]!];
  // équilibre du nœud : N1 (−e1) + N2 (−e2) + F = 0 (la barre tendue tire le nœud vers son appui)
  const statique = (() => {
    const s = inverse([
      [-b1.c, -b2.c],
      [-b1.s, -b2.s],
    ]);
    return s ? produitVecteur(s, [-d.Fx, -d.Fy]) : null;
  })();
  return { ...r, barres: [b1, b2] as const, statique };
}

/** Troisième barre verticale de l'encadré hyperstatique de L1.4.7 : appui 2 m au-dessus du nœud, même section. */
export const TROISIEME_BARRE: BarreNoeud = { x: 0, y: 2, A: 3 };

// ---------- L1.4.P : treillis résolu par matrices ----------

export interface DonneesTriangle {
  L: number; // portée AB (m)
  h: number; // hauteur du sommet C (m)
  P: number; // charge verticale en C, vers le bas (kN)
  W: number; // charge horizontale en C, vers la droite (kN)
}

export const EXEMPLE_TRIANGLE: DonneesTriangle = { L: 6, h: 2, P: 10, W: 3 };

/** Ferme triangulaire A, B, C : articulation en A, appui simple en B, charges P et W au sommet C. */
export function geometrieTriangle(d: DonneesTriangle): DonneesTreillis {
  return {
    noeuds: [
      { id: 'A', x: 0, y: 0 },
      { id: 'B', x: d.L, y: 0 },
      { id: 'C', x: d.L / 2, y: d.h },
    ],
    barres: [
      { id: 'AB', de: 'A', a: 'B' },
      { id: 'AC', de: 'A', a: 'C' },
      { id: 'BC', de: 'B', a: 'C' },
    ],
    appuis: [
      { noeud: 'A', type: 'articulation' },
      { noeud: 'B', type: 'appuiSimple' },
    ],
    charges: [
      { noeud: 'C', Fx: d.W, Fy: 0 },
      { noeud: 'C', Fx: 0, Fy: -d.P },
    ],
  };
}

/**
 * Méthode des nœuds écrite A s = B (6 équations, 6 inconnues : N_AB, N_AC, N_BC, R_Ax, R_Ay, R_By), contrôle du
 * déterminant, résolution par le pivot de Gauss, puis superposition : s = P s₁ + W s₂ (s₁ pour P = 1 kN, s₂ pour W = 1 kN).
 */
export function treillisMatriciel(d: DonneesTriangle) {
  const sys = systemeTreillis(geometrieTriangle(d));
  const g = pivotGauss(sys.A, sys.B);
  const unitaire = (P: number, W: number) => pivotGauss(sys.A, systemeTreillis(geometrieTriangle({ ...d, P, W })).B).x;
  const s1 = unitaire(1, 0);
  const s2 = unitaire(0, 1);
  return { ...sys, det: determinant(sys.A), etapes: g.etapes, s: g.x, s1, s2, RByMoments: (d.P * (d.L / 2) + d.W * d.h) / d.L };
}
