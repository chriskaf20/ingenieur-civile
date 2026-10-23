// Module N0.3 — Unités, conversions et ordres de grandeur (fonctions pures).
// Facteurs exacts par définition : préfixes et unités SI (BIPM, brochure du SI, 9e édition, 2019) ;
// pouce, pied et livre (accord international de 1959) ; kilogramme-force (g_n = 9,806 65 m/s², 3e CGPM, 1901) ;
// bar = 10⁵ Pa.
import { arrondiInf, arrondiSup } from '@/lib/format';
import { PESANTEUR } from './methode';

/** Accélération normale de la pesanteur g_n (m/s²), valeur conventionnelle exacte (3e CGPM, 1901). */
export const G_NORMALE = 9.80665;

/** Pesanteur à la surface de la Lune (m/s²), valeur physique arrondie : sert à distinguer masse et poids. */
export const G_LUNE = 1.62;

// ---------- Préfixes (N0.3.1) ----------

export interface Prefixe {
  symbole: string;
  nom: string;
  exposant: number;
}

export const PREFIXES: readonly Prefixe[] = [
  { symbole: 'G', nom: 'giga', exposant: 9 },
  { symbole: 'M', nom: 'méga', exposant: 6 },
  { symbole: 'k', nom: 'kilo', exposant: 3 },
  { symbole: 'h', nom: 'hecto', exposant: 2 },
  { symbole: 'da', nom: 'déca', exposant: 1 },
  { symbole: '', nom: '(sans préfixe)', exposant: 0 },
  { symbole: 'd', nom: 'déci', exposant: -1 },
  { symbole: 'c', nom: 'centi', exposant: -2 },
  { symbole: 'm', nom: 'milli', exposant: -3 },
  { symbole: 'µ', nom: 'micro', exposant: -6 },
  { symbole: 'n', nom: 'nano', exposant: -9 },
];

export function prefixe(symbole: string): Prefixe {
  const p = PREFIXES.find((x) => x.symbole === symbole);
  if (!p) throw new Error(`préfixe inconnu « ${symbole} »`);
  return p;
}

/** Multiplie x par 10ⁿ en décalant la virgule, sans erreur binaire : decaler(0.15, 3) → 150. */
export function decaler(x: number, n: number): number {
  if (!Number.isFinite(x)) return x * 10 ** n;
  const [m, e = '0'] = String(x).split('e');
  return Number(`${m}e${Number(e) + n}`);
}

/**
 * Change de préfixe pour une unité élevée à la puissance `puissance`
 * (1 : m → km ; 2 : m² → km² ; 3 : m³ → km³). On multiplie par 10ⁿ avec n = (e_départ − e_arrivée) × puissance.
 */
export function changerPrefixe(valeur: number, de: string, vers: string, puissance = 1): { valeur: number; n: number } {
  const n = (prefixe(de).exposant - prefixe(vers).exposant) * puissance;
  return { valeur: decaler(valeur, n), n };
}

// ---------- Catalogue d'unités (N0.3.2, N0.3.3, N0.3.6) ----------

export type Grandeur = 'longueur' | 'surface' | 'volume' | 'masse' | 'force' | 'pression';

export const UNITE_SI: Readonly<Record<Grandeur, string>> = {
  longueur: 'm',
  surface: 'm²',
  volume: 'm³',
  masse: 'kg',
  force: 'N',
  pression: 'Pa',
};

/** si : unité SI ; admise : hors SI mais admise avec le SI ; ancienne : hors SI encore rencontrée ; anglo : unité anglo-saxonne. */
export type Statut = 'si' | 'admise' | 'ancienne' | 'anglo';

export interface Unite {
  symbole: string;
  nom: string;
  grandeur: Grandeur;
  /** valeur de 1 unité, exprimée dans l'unité SI de la grandeur */
  facteur: number;
  statut: Statut;
}

export const POUCE = 0.0254; // m (accord de 1959)
export const PIED = 0.3048; // m, 12 pouces
export const LIVRE = 0.45359237; // kg
const KGF = G_NORMALE; // N
const LBF = LIVRE * G_NORMALE; // N

const u = (symbole: string, nom: string, grandeur: Grandeur, facteur: number, statut: Statut = 'si'): Unite => ({ symbole, nom, grandeur, facteur, statut });

export const UNITES: readonly Unite[] = [
  u('km', 'kilomètre', 'longueur', 1e3),
  u('m', 'mètre', 'longueur', 1),
  u('dm', 'décimètre', 'longueur', 0.1),
  u('cm', 'centimètre', 'longueur', 0.01),
  u('mm', 'millimètre', 'longueur', 1e-3),
  u('µm', 'micromètre', 'longueur', 1e-6),
  u('in', 'pouce', 'longueur', POUCE, 'anglo'),
  u('ft', 'pied', 'longueur', PIED, 'anglo'),

  u('km²', 'kilomètre carré', 'surface', 1e6),
  u('ha', 'hectare', 'surface', 1e4, 'admise'),
  u('a', 'are', 'surface', 100, 'ancienne'),
  u('m²', 'mètre carré', 'surface', 1),
  u('dm²', 'décimètre carré', 'surface', 1e-2),
  u('cm²', 'centimètre carré', 'surface', 1e-4),
  u('mm²', 'millimètre carré', 'surface', 1e-6),
  u('ft²', 'pied carré', 'surface', PIED * PIED, 'anglo'),

  u('m³', 'mètre cube', 'volume', 1),
  u('dm³', 'décimètre cube', 'volume', 1e-3),
  u('L', 'litre', 'volume', 1e-3, 'admise'),
  u('cL', 'centilitre', 'volume', 1e-5, 'admise'),
  u('mL', 'millilitre', 'volume', 1e-6, 'admise'),
  u('cm³', 'centimètre cube', 'volume', 1e-6),
  u('mm³', 'millimètre cube', 'volume', 1e-9),

  u('t', 'tonne', 'masse', 1e3, 'admise'),
  u('kg', 'kilogramme', 'masse', 1),
  u('g', 'gramme', 'masse', 1e-3),
  u('lb', 'livre', 'masse', LIVRE, 'anglo'),

  u('MN', 'méganewton', 'force', 1e6),
  u('kN', 'kilonewton', 'force', 1e3),
  u('daN', 'décanewton', 'force', 10),
  u('N', 'newton', 'force', 1),
  u('tf', 'tonne-force', 'force', 1000 * KGF, 'ancienne'),
  u('kgf', 'kilogramme-force', 'force', KGF, 'ancienne'),
  u('lbf', 'livre-force', 'force', LBF, 'anglo'),
  u('kip', 'kip (1 000 lbf)', 'force', 1000 * LBF, 'anglo'),

  u('GPa', 'gigapascal', 'pression', 1e9),
  u('MPa', 'mégapascal', 'pression', 1e6),
  u('N/mm²', 'newton par mm²', 'pression', 1e6),
  u('kPa', 'kilopascal', 'pression', 1e3),
  u('kN/m²', 'kilonewton par m²', 'pression', 1e3),
  u('daN/m²', 'décanewton par m²', 'pression', 10),
  u('Pa', 'pascal', 'pression', 1),
  u('bar', 'bar', 'pression', 1e5, 'ancienne'),
  u('kgf/cm²', 'kilogramme-force par cm²', 'pression', KGF * 1e4, 'ancienne'),
  u('t/m²', 'tonne-force par m²', 'pression', 1000 * KGF, 'ancienne'),
  u('psi', 'livre-force par pouce carré', 'pression', LBF / (POUCE * POUCE), 'anglo'),
  u('ksi', 'kilo-psi (1 000 psi)', 'pression', (1000 * LBF) / (POUCE * POUCE), 'anglo'),
];

export function unite(symbole: string): Unite {
  const x = UNITES.find((v) => v.symbole === symbole);
  if (!x) throw new Error(`unité inconnue « ${symbole} »`);
  return x;
}

/** Supprime le bruit binaire (12 chiffres significatifs suffisent largement). */
function nettoyer(x: number): number {
  return Number.isFinite(x) && x !== 0 ? Number(x.toPrecision(12)) : x;
}

/** Convertit `valeur` de l'unité `de` vers l'unité `vers` ; null si les grandeurs diffèrent (m² → L…). */
export function convertir(valeur: number, de: string, vers: string): { valeur: number; facteur: number } | null {
  const a = unite(de);
  const b = unite(vers);
  if (a.grandeur !== b.grandeur) return null;
  const facteur = nettoyer(a.facteur / b.facteur);
  return { valeur: nettoyer(valeur * facteur), facteur };
}

/** Unités pratiques dans lesquelles on réécrit une unité ancienne ou anglo-saxonne. */
export const EQUIVALENTS_PRATIQUES: Readonly<Record<string, readonly string[]>> = {
  bar: ['kPa', 'MPa'],
  'kgf/cm²': ['kPa', 'MPa'],
  't/m²': ['kN/m²', 'MPa'],
  'daN/m²': ['kN/m²'],
  psi: ['kPa', 'MPa'],
  ksi: ['MPa'],
  tf: ['kN'],
  kgf: ['N', 'daN'],
  daN: ['N', 'kN'],
  lbf: ['N'],
  kip: ['kN'],
  in: ['mm', 'cm'],
  ft: ['m', 'cm'],
  lb: ['kg'],
  a: ['m²'],
};

export interface Equivalent {
  symbole: string;
  valeur: number;
}

/** Valeur en unité SI de base, puis dans les unités pratiques usuelles. */
export function equivalents(valeur: number, symbole: string): { si: Equivalent; pratiques: Equivalent[] } {
  const g = unite(symbole).grandeur;
  const versSI = (s: string): Equivalent => ({ symbole: s, valeur: convertir(valeur, symbole, s)!.valeur });
  return { si: versSI(UNITE_SI[g]), pratiques: (EQUIVALENTS_PRATIQUES[symbole] ?? []).map(versSI) };
}

// ---------- Masse et poids (N0.3.3) ----------

/** Poids P = m·g (N) d'une masse m (kg) ; g = 9,81 m/s² par défaut. */
export function poidsDeMasse(m: number, g: number = PESANTEUR): number {
  return m * g;
}

/** Masse m = P/g (kg) correspondant à un poids P (N). */
export function masseDePoids(P: number, g: number = PESANTEUR): number {
  return P / g;
}

/**
 * Pesanteur normale (m/s²) à la latitude φ (degrés) et à l'altitude z (m) :
 * formule internationale de la pesanteur (1980) et correction à l'air libre de −3,086 × 10⁻⁶ s⁻² par mètre.
 */
export function pesanteurLocale(phi: number, z = 0): number {
  const s = Math.sin((phi * Math.PI) / 180);
  const s2 = Math.sin((2 * phi * Math.PI) / 180);
  return 9.780327 * (1 + 0.0053024 * s * s - 0.0000058 * s2 * s2) - 3.086e-6 * z;
}

// ---------- Pression moyenne sous une semelle (N0.3.3) ----------

export interface ResultatPression {
  A: number; // m²
  kPa: number; // = kN/m²
  MPa: number;
  bar: number;
}

/** Pression moyenne N/A (répartition uniforme supposée) sous une surface B × L (m) chargée par N (kN). */
export function pressionMoyenne(N: number, B: number, L: number): ResultatPression {
  const A = B * L;
  const kPa = N / A;
  return { A, kPa, MPa: kPa / 1000, bar: kPa / 100 };
}

// ---------- Volumes : la citerne (N0.3.2) ----------

export interface DonneesCiterne {
  L: number; // longueur intérieure (m)
  l: number; // largeur intérieure (m)
  h: number; // hauteur d'eau utile (m)
  conso: number; // consommation (L/jour), donnée de l'énoncé
}

export const EXEMPLE_CITERNE: DonneesCiterne = { L: 2.5, l: 2, h: 1.6, conso: 150 };

export interface ResultatCiterne {
  S: number; // surface du fond (m²)
  V: number; // m³
  litres: number; // L
  joursExacts: number;
  jours: number; // jours complets d'autonomie
}

export function citerne(d: DonneesCiterne): ResultatCiterne {
  const S = d.L * d.l;
  const V = S * d.h;
  const litres = convertir(V, 'm³', 'L')!.valeur;
  const joursExacts = litres / d.conso;
  return { S, V, litres, joursExacts, jours: arrondiInf(joursExacts) };
}

/**
 * Combien d'unités dans un total : « entier » = unités complètes contenues (arrondi inférieur : lots, bidons pleins),
 * « necessaire » = unités à prévoir pour tout couvrir (arrondi supérieur : camions, sacs à commander).
 */
export function combienDe(total: number, unitaire: number): { exact: number; entier: number; necessaire: number } {
  const exact = total / unitaire;
  return { exact, entier: arrondiInf(exact), necessaire: arrondiSup(exact) };
}

/** Surface d'un rectangle L × l (le résultat a l'unité des longueurs, au carré). */
export function surfaceRectangle(L: number, l: number): number {
  return L * l;
}

/**
 * Côté minimal (m) d'une semelle carrée pour que la pression moyenne N/B² ne dépasse pas σ :
 * B ≥ √(N/σ), N en kN et σ en kPa ; arrondi au pas supérieur (5 cm par défaut). Poids propre de la semelle négligé.
 */
export function coteSemelleCarree(N: number, sigma: number, pas = 0.05): { Bmin: number; B: number } {
  const Bmin = Math.sqrt(N / sigma);
  return { Bmin, B: arrondiSup(Bmin, pas) };
}
