// Module N0.2 — Algèbre et fonctions, appliquées à des cas de génie civil.
// Chaque fonction est pure ; les références normatives sont citées là où une valeur en dépend.
import { arrondiSup } from '@/lib/format';
import { BLONDEL_MAX, BLONDEL_MIN } from './escalier';
import { DELTA_FCM, E_S, S_CIMENT, type ClasseCiment } from './ba/materiaux';

// ---------- Fractions (N0.2.1) ----------

export function pgcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
}

export type Fraction = readonly [number, number];

/** Fraction irréductible, dénominateur positif. */
export function simplifier([n, d]: Fraction): Fraction {
  if (d === 0) throw new Error('dénominateur nul');
  const g = pgcd(n, d) || 1;
  const s = d < 0 ? -1 : 1;
  return [(s * n) / g, (s * d) / g];
}

export function additionner(a: Fraction, b: Fraction): Fraction {
  return simplifier([a[0] * b[1] + b[0] * a[1], a[1] * b[1]]);
}

export function multiplier(a: Fraction, b: Fraction): Fraction {
  return simplifier([a[0] * b[0], a[1] * b[1]]);
}

// ---------- Puissances et racines : inertie d'un rectangle (N0.2.1) ----------

export interface ResultatInertie {
  A: number; // aire (cm²)
  I: number; // moment d'inertie b·h³/12 (cm⁴)
  i: number; // rayon de giration √(I/A) (cm)
  Im4: number; // inertie en m⁴ (1 cm⁴ = 10⁻⁸ m⁴)
}

/** Section rectangulaire b × h (cm), inertie autour de l'axe horizontal passant par le centre. */
export function inertieRectangle(b: number, h: number): ResultatInertie {
  const A = b * h;
  const I = (b * h ** 3) / 12;
  return { A, I, i: Math.sqrt(I / A), Im4: I * 1e-8 };
}

// ---------- Notation scientifique : allongement d'une barre (N0.2.2) ----------

export interface DonneesBarre {
  F: number; // effort de traction (kN)
  L: number; // longueur (m)
  phi: number; // diamètre (mm)
  E: number; // module d'élasticité (MPa)
}

export interface ResultatBarre {
  A: number; // section (mm²)
  sigma: number; // contrainte (MPa = N/mm²)
  epsilon: number; // déformation (sans unité)
  dL: number; // allongement (m)
}

export const EXEMPLE_BARRE: DonneesBarre = { F: 20, L: 3, phi: 12, E: E_S };

/** Loi de Hooke : σ = F/A, ε = σ/E, ΔL = ε·L (domaine élastique). */
export function allongementBarre(d: DonneesBarre): ResultatBarre {
  const A = (Math.PI * d.phi ** 2) / 4;
  const sigma = (d.F * 1000) / A;
  const epsilon = sigma / d.E;
  return { A, sigma, epsilon, dL: epsilon * d.L };
}

// ---------- Proportionnalité et pourcentages (N0.2.3) ----------

/** Règle de trois : si a correspond à b, alors c correspond à b·c/a. */
export function regleDeTrois(a: number, b: number, c: number): number {
  if (a === 0) throw new Error('a ne peut pas être nul');
  return (b * c) / a;
}

/** Variation relative de `avant` à `apres` (0,1 = +10 %). */
export function variation(avant: number, apres: number): number {
  return (apres - avant) / avant;
}

export interface ResultatPente {
  p: number; // pente (m/m)
  pourcent: number;
  pourmille: number;
}

/** Pente d'un ouvrage : dénivelé ΔH (m) sur une longueur horizontale L (m). */
export function pente(dH: number, L: number): ResultatPente {
  const p = dH / L;
  return { p, pourcent: p * 100, pourmille: p * 1000 };
}

/** Dénivelé obtenu avec une pente donnée en % sur une longueur L (m). */
export function denivele(pourcent: number, L: number): number {
  return (pourcent / 100) * L;
}

// ---------- Identités remarquables : section d'un tube (N0.2.4) ----------

export interface ResultatTube {
  d: number; // diamètre intérieur (mm)
  Adeveloppee: number; // π/4·(D² − d²) (mm²)
  Afactorisee: number; // π·t·(D − t) (mm²)
  Amince: number; // approximation des tubes minces π·D·t (mm²), par excès
}

/** Tube de diamètre extérieur D et d'épaisseur t (mm) : deux écritures de la même aire. */
export function sectionTube(D: number, t: number): ResultatTube {
  const d = D - 2 * t;
  return { d, Adeveloppee: (Math.PI / 4) * (D ** 2 - d ** 2), Afactorisee: Math.PI * t * (D - t), Amince: Math.PI * D * t };
}

// ---------- Équations et inéquations : escalier (N0.2.5) ----------

export interface ResultatMarches {
  nMin: number; // nombre minimal de contremarches pour h ≤ hMax
  h: number; // hauteur réelle d'une marche (m)
  gMin: number; // giron minimal (m) tel que 2h + g ≥ BLONDEL_MIN
  gMax: number; // giron maximal (m) tel que 2h + g ≤ BLONDEL_MAX
}

/**
 * h = H/n ≤ hMax ⇔ n ≥ H/hMax ; puis BLONDEL_MIN ≤ 2h + g ≤ BLONDEL_MAX ⇔ BLONDEL_MIN − 2h ≤ g ≤ BLONDEL_MAX − 2h.
 * La plage de Blondel est une règle de l'art (voir L3.6.9).
 */
export function marchesEscalier(H: number, hMax: number): ResultatMarches {
  const nMin = Math.ceil(H / hMax - 1e-9);
  const h = H / nMin;
  return { nMin, h, gMin: BLONDEL_MIN - 2 * h, gMax: BLONDEL_MAX - 2 * h };
}

// ---------- Systèmes linéaires (N0.2.6) ----------

/** Résout a·x + b·y = e ; c·x + d·y = f par la méthode des déterminants. Renvoie null si le système n'a pas une solution unique. */
export function resoudre2x2(a: number, b: number, e: number, c: number, d: number, f: number): { x: number; y: number } | null {
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-12) return null;
  return { x: (e * d - b * f) / det, y: (a * f - e * c) / det };
}

/** Résout A·x = b (3 × 3) par l'élimination de Gauss avec choix du pivot. */
export function resoudre3x3(A: readonly (readonly number[])[], b: readonly number[]): number[] | null {
  const M = A.map((ligne, i) => [...ligne, b[i]!]);
  const n = 3;
  for (let k = 0; k < n; k++) {
    let piv = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i]![k]!) > Math.abs(M[piv]![k]!)) piv = i;
    if (Math.abs(M[piv]![k]!) < 1e-12) return null;
    [M[k], M[piv]] = [M[piv]!, M[k]!];
    for (let i = k + 1; i < n; i++) {
      const q = M[i]![k]! / M[k]![k]!;
      for (let j = k; j <= n; j++) M[i]![j]! -= q * M[k]![j]!;
    }
  }
  const x = [0, 0, 0];
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i]![n]!;
    for (let j = i + 1; j < n; j++) s -= M[i]![j]! * x[j]!;
    x[i] = s / M[i]![i]!;
  }
  return x;
}

export interface ResultatReactions {
  RA: number; // kN
  RB: number; // kN
}

/**
 * Poutre sur deux appuis A et B (portée L, m), charge F (kN) à la distance a (m) de A.
 * Équilibre vertical : RA + RB = F ; moments en A : L·RB = a·F.
 */
export function reactionsPoutre(L: number, F: number, a: number): ResultatReactions {
  const s = resoudre2x2(1, 1, F, 0, L, a * F);
  if (!s) throw new Error('portée nulle');
  return { RA: s.x, RB: s.y };
}

// ---------- Second degré (N0.2.7) ----------

export interface ResultatTrinome {
  delta: number;
  racines: number[]; // triées, 0, 1 ou 2 valeurs
}

export function trinome(a: number, b: number, c: number): ResultatTrinome {
  if (a === 0) throw new Error('a ne peut pas être nul');
  const delta = b * b - 4 * a * c;
  if (delta < -1e-12) return { delta, racines: [] };
  if (Math.abs(delta) <= 1e-12) return { delta: 0, racines: [-b / (2 * a)] };
  const r = Math.sqrt(delta);
  // Forme stable : évite de soustraire deux nombres voisins.
  const q = -(b + Math.sign(b || 1) * r) / 2;
  const x1 = q / a;
  const x2 = q !== 0 ? c / q : -x1;
  return { delta, racines: [x1, x2].sort((u, v) => u - v) };
}

export interface ResultatParcelle extends ResultatTrinome {
  longueur?: number;
  largeur?: number;
}

/** Rectangle de périmètre P (m) et d'aire S (m²) : x² − (P/2)·x + S = 0. */
export function parcelle(P: number, S: number): ResultatParcelle {
  const t = trinome(1, -P / 2, S);
  const [x1, x2] = t.racines;
  if (x1 === undefined) return t;
  return { ...t, largeur: x1, longueur: x2 ?? x1 };
}

// ---------- Fonction affine : remplissage d'un réservoir (N0.2.8) ----------

export interface DonneesReservoir {
  S: number; // surface intérieure en plan (m²)
  Q: number; // débit d'alimentation (m³/h)
  h0: number; // hauteur d'eau au départ (m)
  hMax: number; // hauteur utile (m)
}

export interface ResultatReservoir {
  a: number; // pente de h(t) = Q/S (m/h)
  tPlein: number; // durée pour atteindre hMax (h)
  volumeUtile: number; // S·(hMax − h0) (m³)
}

export const EXEMPLE_RESERVOIR: DonneesReservoir = { S: 12, Q: 3, h0: 0.5, hMax: 2.5 };

/** h(t) = h0 + (Q/S)·t : fonction affine du temps. */
export function hauteurEau(d: DonneesReservoir, t: number): number {
  return d.h0 + (d.Q / d.S) * t;
}

export function reservoir(d: DonneesReservoir): ResultatReservoir {
  const a = d.Q / d.S;
  return { a, tPlein: (d.hMax - d.h0) / a, volumeUtile: d.S * (d.hMax - d.h0) };
}

// ---------- Exponentielle et logarithme : durcissement du béton (N0.2.9) ----------

/** βcc(t) = exp{s·[1 − (28/t)^½]}, EC2 §3.1.2(6), expression (3.2) ; t en jours, béton conservé à 20 °C. */
export function betaCC(t: number, s: number): number {
  return Math.exp(s * (1 - Math.sqrt(28 / t)));
}

/** Résistance moyenne à t jours : fcm(t) = βcc(t)·fcm, avec fcm = fck + 8 MPa (EC2 (3.1) et tableau 3.1). */
export function fcmT(t: number, fck: number, ciment: ClasseCiment): number {
  return betaCC(t, S_CIMENT[ciment]) * (fck + DELTA_FCM);
}

/** Âge (jours) où βcc atteint `beta` (< 1) : on inverse (3.2) avec le logarithme : t = 28 / (1 − ln β / s)². */
export function ageResistance(beta: number, ciment: ClasseCiment): number {
  return 28 / (1 - Math.log(beta) / S_CIMENT[ciment]) ** 2;
}

// ---------- Mini-projet : quantités d'un béton (N0.2.P) ----------

export interface DonneesGachee {
  V: number; // volume de béton à fabriquer (m³)
  ciment: number; // dosage en ciment (kg/m³), donnée de l'énoncé ou du CCTP
  sable: number; // L/m³
  gravier: number; // L/m³
  eau: number; // L/m³
  sac: number; // masse d'un sac de ciment (kg)
}

export interface ResultatGachee {
  cimentKg: number;
  sacs: number; // arrondi au sac supérieur
  sableM3: number;
  gravierM3: number;
  eauL: number;
}

/** Quantités proportionnelles au volume (règle de trois), sacs arrondis par excès. */
export function quantitesBeton(d: DonneesGachee): ResultatGachee {
  const cimentKg = d.ciment * d.V;
  return {
    cimentKg,
    sacs: arrondiSup(cimentKg / d.sac),
    sableM3: (d.sable * d.V) / 1000,
    gravierM3: (d.gravier * d.V) / 1000,
    eauL: d.eau * d.V,
  };
}

/** Surface totale d'un cylindre fermé (paroi + fond + couvercle), r et h en m : 2πrh + 2πr² = 2πr(h + r). */
export function surfaceCylindre(r: number, h: number): { developpee: number; factorisee: number } {
  return { developpee: 2 * Math.PI * r * h + 2 * Math.PI * r ** 2, factorisee: 2 * Math.PI * r * (h + r) };
}

/** Solution de a·x + b = c (a non nul) : x = (c − b) / a. */
export function premierDegre(a: number, b: number, c: number): number {
  if (a === 0) throw new Error('a ne peut pas être nul');
  return (c - b) / a;
}

/** Hauteur h (m) telle que P = γ·L·b·h, soit h = P / (γ·L·b). */
export function hauteurPourPoids(P: number, gamma: number, L: number, b: number): number {
  return P / (gamma * L * b);
}

/** Semelle filante du mini-projet N0.2.P (données de l'énoncé, m). */
export const EXEMPLE_SEMELLE = { L: 12, B: 0.5, h: 0.3 } as const;

/** Volume d'un prisme rectangulaire L × B × h (m³). */
export function volumePrisme(L: number, B: number, h: number): number {
  return L * B * h;
}

/** Cote d'arrivée d'un ouvrage en pente descendante : z_aval = z_amont − p·L (p en %). */
export function coteAval(zAmont: number, pourcent: number, L: number): number {
  return zAmont - denivele(pourcent, L);
}
