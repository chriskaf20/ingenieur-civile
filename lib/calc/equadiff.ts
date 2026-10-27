// Équations différentielles (module L2.1) : premier ordre, vidange, second ordre, oscillateur amorti,
// déformée d'une poutre, consolidation. Solutions exactes, et méthode d'Euler pour comparer.

export const G = 9.81; // m/s²

// ---------- Méthode d'Euler (L2.1.1, L2.1.2) ----------

/** Méthode d'Euler pour y' = f(t, y) : n pas de h depuis (t0, y0). */
export function euler(f: (t: number, y: number) => number, t0: number, y0: number, h: number, n: number): [number, number][] {
  const pts: [number, number][] = [[t0, y0]];
  let t = t0;
  let y = y0;
  for (let i = 0; i < n; i++) {
    y += h * f(t, y);
    t += h;
    pts.push([t, y]);
  }
  return pts;
}

// ---------- Premier ordre (L2.1.2) ----------

/** y' = −k y : y(t) = y0 e^(−k t) ; demi-vie ln 2 / k ; constante de temps 1/k. */
export function decroissance(y0: number, k: number, t: number): number {
  return y0 * Math.exp(-k * t);
}

/** y' = a y + b : y(t) = −b/a + (y0 + b/a) e^(a t) (a ≠ 0). */
export function lineairePremier(a: number, b: number, y0: number, t: number): number {
  return -b / a + (y0 + b / a) * Math.exp(a * t);
}

export interface DonneesRefroidissement {
  /** température initiale du béton, de l'air (°C), constante k (1/h) */
  T0: number;
  Ta: number;
  k: number;
  /** température visée (°C) */
  Tcible: number;
}

/** Loi de Newton : T' = −k (T − Ta) ; T(t) = Ta + (T0 − Ta) e^(−k t) ; temps pour atteindre la cible. */
export function refroidissement(d: DonneesRefroidissement) {
  const tCible = Math.log((d.T0 - d.Ta) / (d.Tcible - d.Ta)) / d.k;
  return { tCible, tau: 1 / d.k, T: (t: number) => d.Ta + (d.T0 - d.Ta) * Math.exp(-d.k * t) };
}

/** Béton d'une grosse semelle à 60 °C, air à 30 °C, k = 0,05 /h ; viser 40 °C (données de l'énoncé, L2.1.2). */
export const EXEMPLE_REFROIDISSEMENT: DonneesRefroidissement = { T0: 60, Ta: 30, k: 0.05, Tcible: 40 };

// ---------- Vidange : loi de Torricelli (L2.1.3, L2.1.P) ----------

export interface DonneesVidange {
  /** section du réservoir (m²), diamètre de l'orifice (m), coefficient de débit, hauteurs d'eau initiale et finale (m) */
  A: number;
  d: number;
  Cd: number;
  h0: number;
  h1: number;
}

/**
 * A dh/dt = −Cd a √(2 g h) : séparable. √h(t) = √h0 − Cd a √(2g) t / (2A) ;
 * temps de vidange T = 2A (√h0 − √h1) / (Cd a √(2g)).
 */
export function vidange(dd: DonneesVidange) {
  const a = (Math.PI * dd.d * dd.d) / 4;
  const c = (dd.Cd * a * Math.sqrt(2 * G)) / (2 * dd.A);
  const T = (Math.sqrt(dd.h0) - Math.sqrt(dd.h1)) / c;
  const h = (t: number) => Math.max(0, Math.sqrt(dd.h0) - c * t) ** 2;
  const Q0 = dd.Cd * a * Math.sqrt(2 * G * dd.h0);
  return { a, c, T, h, Q0, volume: dd.A * (dd.h0 - dd.h1), Tconstant: (dd.A * (dd.h0 - dd.h1)) / Q0 };
}

/** Cuve cylindrique de château d'eau : 6 m de diamètre, orifice de 10 cm, Cd = 0,62, de 4 m à 0,5 m (données, L2.1.3). */
export const EXEMPLE_VIDANGE: DonneesVidange = { A: (Math.PI * 6 * 6) / 4, d: 0.1, Cd: 0.62, h0: 4, h1: 0.5 };

// ---------- Second ordre (L2.1.4) ----------

/** Racines de r² + p r + q = 0 : réelles distinctes, double, ou complexes α ± iβ. */
export function racinesCaracteristiques(p: number, q: number) {
  const D = p * p - 4 * q;
  if (D > 1e-12) return { type: 'reelles' as const, D, r1: (-p + Math.sqrt(D)) / 2, r2: (-p - Math.sqrt(D)) / 2 };
  if (D < -1e-12) return { type: 'complexes' as const, D, alpha: -p / 2, beta: Math.sqrt(-D) / 2 };
  return { type: 'double' as const, D, r: -p / 2 };
}

// ---------- Oscillateur amorti (L2.1.5) ----------

export interface DonneesOscillateur {
  /** masse (kg), raideur (N/m), amortissement visqueux c (N·s/m), déplacement initial (m) */
  m: number;
  k: number;
  c: number;
  x0: number;
}

/** m x'' + c x' + k x = 0, lâché en x0 sans vitesse. */
export function oscillateur(d: DonneesOscillateur) {
  const w0 = Math.sqrt(d.k / d.m);
  const zeta = d.c / (2 * Math.sqrt(d.k * d.m));
  const f0 = w0 / (2 * Math.PI);
  const T0 = 1 / f0;
  const sous = zeta < 1;
  const wd = sous ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const Td = sous ? (2 * Math.PI) / wd : Infinity;
  const x = (t: number) => {
    if (sous) return d.x0 * Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
    if (Math.abs(zeta - 1) < 1e-9) return d.x0 * (1 + w0 * t) * Math.exp(-w0 * t);
    const s = w0 * Math.sqrt(zeta * zeta - 1);
    const r1 = -zeta * w0 + s;
    const r2 = -zeta * w0 - s;
    return (d.x0 / (r2 - r1)) * (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t));
  };
  /** décrément logarithmique : ln du rapport de deux pics successifs */
  const delta = sous ? (2 * Math.PI * zeta) / Math.sqrt(1 - zeta * zeta) : Infinity;
  return { w0, zeta, f0, T0, wd, Td, delta, regime: sous ? 'pseudo-périodique' : Math.abs(zeta - 1) < 1e-9 ? 'critique' : 'apériodique', x };
}

/** Réservoir d'eau sur pylône modélisé en oscillateur : 20 t, k = 8 MN/m, ζ = 5 % (données de l'énoncé, L2.1.5). */
export const EXEMPLE_OSCILLATEUR: DonneesOscillateur = { m: 20000, k: 8e6, c: 2 * 0.05 * Math.sqrt(8e6 * 20000), x0: 0.02 };

// ---------- Déformée d'une poutre (L2.1.6) ----------

export interface DonneesDeformee {
  /** portée (m), charge uniforme (kN/m), module d'Young (MPa), inertie (cm⁴) */
  L: number;
  q: number;
  E: number;
  I: number;
}

/**
 * EI y'' = −M(x), M = q x (L − x) / 2, y(0) = y(L) = 0 : y(x) = q x (L³ − 2 L x² + x³) / (24 EI) (vers le bas) ;
 * flèche au milieu 5 q L⁴ / (384 EI).
 */
export function deformeePoutre(d: DonneesDeformee) {
  const EI = d.E * 1e3 * d.I * 1e-8; // kN·m²
  const y = (x: number) => (d.q * x * (d.L ** 3 - 2 * d.L * x * x + x ** 3)) / (24 * EI);
  const f = (5 * d.q * d.L ** 4) / (384 * EI);
  const rotation = (d.q * d.L ** 3) / (24 * EI);
  return { EI, y, f, fmm: f * 1000, rotation, rapport: d.L / f };
}

/** Poutre en bois de 4 m sous 2 kN/m, E = 11 000 MPa, section 7,5 × 22,5 cm (données de l'énoncé, L2.1.6). */
export const EXEMPLE_DEFORMEE: DonneesDeformee = { L: 4, q: 2, E: 11000, I: (7.5 * 22.5 ** 3) / 12 };

// ---------- Équations aux dérivées partielles : consolidation (L2.1.7) ----------

/** Degré de consolidation moyen de Terzaghi, approximations usuelles : Tv = (π/4) U² pour U ≤ 60 %. */
export function degreConsolidation(Tv: number): number {
  if (Tv <= 0.2827) return Math.sqrt((4 * Tv) / Math.PI);
  return 1 - (8 / (Math.PI * Math.PI)) * Math.exp(-((Math.PI * Math.PI) / 4) * Tv);
}

export interface DonneesConsolidation {
  /** coefficient de consolidation (m²/an), épaisseur de la couche (m), drainage par les deux faces ou une seule */
  cv: number;
  H: number;
  doubleDrainage: boolean;
  /** durée (années) */
  t: number;
}

/** Facteur temps Tv = cv t / Hd², Hd = demi-épaisseur si double drainage ; temps pour 90 % (Tv = 0,848). */
export function consolidation(d: DonneesConsolidation) {
  const Hd = d.doubleDrainage ? d.H / 2 : d.H;
  const Tv = (d.cv * d.t) / (Hd * Hd);
  return { Hd, Tv, U: degreConsolidation(Tv), t90: (0.848 * Hd * Hd) / d.cv, t50: (0.197 * Hd * Hd) / d.cv };
}

/** Couche d'argile de 4 m sous un remblai, cv = 2 m²/an, drainée des deux côtés, après 1 an (données, L2.1.7). */
export const EXEMPLE_CONSOLIDATION: DonneesConsolidation = { cv: 2, H: 4, doubleDrainage: true, t: 1 };
