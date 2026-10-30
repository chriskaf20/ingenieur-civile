// Résistance des matériaux I (module L2.4) : efforts internes, traction, sections, flexion,
// cisaillement, torsion, assemblages, dimensionnement. Unités : kN, m, MPa, mm, cm.

import { reactionsAppuis, resultanteCharge, type ChargePoutre } from './statique';

// ---------- Traction et compression ----------

export interface DonneesBarre {
  N: number; // effort normal (kN), positif en traction
  L: number; // longueur (m)
  d: number; // diamètre (mm)
  E: number; // module d'Young (MPa)
}

/** Barre circulaire : section, contrainte σ = N/A, déformation ε = σ/E, allongement ΔL = ε L. */
export function barre(d: DonneesBarre) {
  const A = (Math.PI * d.d * d.d) / 4; // mm²
  const sigma = (d.N * 1000) / A; // MPa
  const eps = sigma / d.E;
  return { A, sigma, eps, dL: eps * d.L * 1000 }; // ΔL en mm
}

/** Tirant d'acier de l'exemple : 120 kN, 4 m, Ø 20 mm, E = 210 000 MPa. */
export const EXEMPLE_BARRE: DonneesBarre = { N: 120, L: 4, d: 20, E: 210000 };

// ---------- Efforts internes et diagrammes ----------

export interface DonneesPoutreIso {
  L: number;
  xA: number;
  xB: number;
  charges: readonly ChargePoutre[];
}

/** Part de la charge c située à gauche de x : résultante et moment de cette part par rapport à x. */
function partGauche(c: ChargePoutre, x: number): { R: number; M: number } {
  if (c.type === 'ponctuelle') return c.a < x ? { R: c.F, M: c.F * (x - c.a) } : { R: 0, M: 0 };
  if (x <= c.a) return { R: 0, M: 0 };
  const b = Math.min(x, c.b);
  const qb = c.q1 + ((c.q2 - c.q1) * (b - c.a)) / (c.b - c.a);
  const r = resultanteCharge({ type: 'repartie', nom: '', q1: c.q1, q2: qb, a: c.a, b });
  return { R: r.R, M: r.R * (x - r.x) };
}

/** V(x) et M(x) par la méthode des coupures (forces à gauche de la coupure ; V positif vers le haut à gauche). */
export function effortsSection(d: DonneesPoutreIso, x: number) {
  const r = reactionsAppuis(d.xA, d.xB, d.charges);
  let V = 0;
  let M = 0;
  if (d.xA < x) {
    V += r.RA;
    M += r.RA * (x - d.xA);
  }
  if (d.xB < x) {
    V += r.RB;
    M += r.RB * (x - d.xB);
  }
  for (const c of d.charges) {
    const p = partGauche(c, x);
    V -= p.R;
    M -= p.M;
  }
  return { V, M, RA: r.RA, RB: r.RB };
}

/** Diagrammes V et M échantillonnés sur n intervalles, avec les extremums. */
export function diagrammes(d: DonneesPoutreIso, n = 200) {
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const x = (i * d.L) / n;
    const e = effortsSection(d, Math.min(d.L - 1e-9, Math.max(1e-9, x)));
    return { x, V: e.V, M: e.M };
  });
  const iMax = pts.reduce((k, p, i) => (Math.abs(p.M) > Math.abs(pts[k]!.M) ? i : k), 0);
  const r = reactionsAppuis(d.xA, d.xB, d.charges);
  return { pts, RA: r.RA, RB: r.RB, Mmax: pts[iMax]!.M, xMmax: pts[iMax]!.x, Vmax: Math.max(...pts.map((p) => Math.abs(p.V))) };
}

/** Poutre d'exemple : 6 m sur deux appuis, 10 kN/m sur toute la portée et 20 kN à 2 m. */
export const EXEMPLE_POUTRE: DonneesPoutreIso = {
  L: 6,
  xA: 0,
  xB: 6,
  charges: [
    { type: 'repartie', nom: 'q', q1: 10, q2: 10, a: 0, b: 6 },
    { type: 'ponctuelle', nom: 'P', F: 20, a: 2 },
  ],
};

// ---------- Caractéristiques des sections ----------

export interface Rectangle {
  b: number; // largeur (cm)
  h: number; // hauteur (cm)
  y: number; // ordonnée du bas du rectangle (cm)
  x?: number; // abscisse du bord gauche (cm), pour le dessin
}

/** Section composée de rectangles : aire, centre de gravité, inertie (Huygens), modules de flexion. */
export function sectionComposee(rects: readonly Rectangle[]) {
  const A = rects.reduce((s, r) => s + r.b * r.h, 0);
  const yG = rects.reduce((s, r) => s + r.b * r.h * (r.y + r.h / 2), 0) / A;
  const parts = rects.map((r) => {
    const Ai = r.b * r.h;
    const Ii = (r.b * r.h ** 3) / 12;
    const di = r.y + r.h / 2 - yG;
    return { A: Ai, Ipropre: Ii, d: di, Ad2: Ai * di * di };
  });
  const I = parts.reduce((s, p) => s + p.Ipropre + p.Ad2, 0);
  const haut = Math.max(...rects.map((r) => r.y + r.h));
  const bas = Math.min(...rects.map((r) => r.y));
  const v = haut - yG; // distance à la fibre supérieure
  const vp = yG - bas; // distance à la fibre inférieure
  return { A, yG, I, parts, v, vp, Wsup: I / v, Winf: I / vp, h: haut - bas };
}

/** Section en T de l'exemple : table 60 × 12 cm, nervure 20 × 38 cm (hauteur totale 50 cm). */
export const EXEMPLE_T: Rectangle[] = [
  { b: 20, h: 38, y: 0, x: 20 },
  { b: 60, h: 12, y: 38, x: 0 },
];

// ---------- Flexion ----------

/** Contrainte normale de flexion σ = M y / I (M en kN·m, y en cm, I en cm⁴) → MPa. */
export function sigmaFlexion(M: number, y: number, I: number): number {
  return (M * 1e6 * (y * 10)) / (I * 1e4);
}

/** Contraintes extrêmes d'une section sous un moment M (kN·m), positif = fibres basses tendues. */
export function flexionSection(M: number, rects: readonly Rectangle[]) {
  const s = sectionComposee(rects);
  return { ...s, M, sigmaSup: -sigmaFlexion(M, s.v, s.I), sigmaInf: sigmaFlexion(M, s.vp, s.I) };
}

// ---------- Cisaillement ----------

/** Cisaillement dans un rectangle b × h (cm) sous V (kN) : τ(y) = V S(y) / (I b), max 1,5 V/A (MPa). */
export function cisaillementRect(V: number, b: number, h: number) {
  const A = b * h;
  const I = (b * h ** 3) / 12;
  const tau = (y: number) => {
    const S = (b * (h * h / 4 - y * y)) / 2; // moment statique au-dessus de y (cm³), y depuis le centre
    return (V * 1000 * S * 1000) / (I * 1e4 * b * 10);
  };
  return { A, I, tauMax: tau(0), tauMoyen: (V * 10) / A, tau };
}

// ---------- Torsion ----------

export interface DonneesTorsion {
  T: number; // couple de torsion (kN·m)
  D: number; // diamètre extérieur (mm)
  d: number; // diamètre intérieur (mm), 0 pour un arbre plein
  L: number; // longueur (m)
  G: number; // module de cisaillement (MPa)
}

/** Arbre circulaire : J = π (D⁴ − d⁴)/32, τ = T r / J, θ = T L / (G J). */
export function torsion(t: DonneesTorsion) {
  const J = (Math.PI * (t.D ** 4 - t.d ** 4)) / 32; // mm⁴
  const tauMax = (t.T * 1e6 * (t.D / 2)) / J; // MPa
  const theta = (t.T * 1e6 * t.L * 1000) / (t.G * J); // rad
  return { J, tauMax, theta, thetaDeg: (theta * 180) / Math.PI };
}

/** Arbre plein d'acier de l'exemple : 2 kN·m, Ø 50 mm, 1,5 m, G = 81 000 MPa. */
export const EXEMPLE_TORSION: DonneesTorsion = { T: 2, D: 50, d: 0, L: 1.5, G: 81000 };

// ---------- Assemblages ----------

export interface DonneesBoulon {
  F: number; // effort transmis (kN)
  n: number; // nombre de boulons
  d: number; // diamètre de la tige (mm)
  plans: 1 | 2; // plans de cisaillement (simple ou double)
  t: number; // épaisseur de la pièce la plus mince (mm)
}

/** Boulons au cisaillement : τ = F / (n · plans · A) ; pression diamétrale σ = F / (n · d · t). */
export function boulons(b: DonneesBoulon) {
  const A = (Math.PI * b.d * b.d) / 4;
  const parBoulon = b.F / b.n;
  return { A, parBoulon, tau: (b.F * 1000) / (b.n * b.plans * A), pression: (b.F * 1000) / (b.n * b.d * b.t) };
}

/** Attache d'une diagonale : 60 kN, 2 boulons Ø 16, cisaillement double, gousset de 8 mm. */
export const EXEMPLE_BOULON: DonneesBoulon = { F: 60, n: 2, d: 16, plans: 2, t: 8 };

// ---------- Dimensionnement en flexion ----------

/** Module de flexion nécessaire W = M / σlim (cm³) et hauteur d'un rectangle de largeur b (cm). */
export function dimensionnerRect(M: number, sigmaLim: number, b: number) {
  const W = (M * 1e6) / sigmaLim / 1000; // cm³
  const h = Math.sqrt((6 * W) / b);
  return { W, h };
}

// ---------- Solive de plancher ----------

export interface DonneesSolive {
  g: number; // charge permanente du plancher (kN/m²)
  q: number; // charge d'exploitation (kN/m²)
  e: number; // entraxe des solives (m)
  L: number; // portée (m)
  b: number; // largeur (cm)
  h: number; // hauteur (cm)
  fm: number; // contrainte limite de flexion retenue (MPa)
  E: number; // module (MPa)
  rho: number; // poids volumique du bois (kN/m³)
}

/** Solive sur deux appuis : charge linéique, moment, contrainte, flèche 5pL⁴/(384EI), rapport L/f. */
export function solive(d: DonneesSolive) {
  const pp = d.rho * (d.b / 100) * (d.h / 100);
  const p = (d.g + d.q) * d.e + pp; // kN/m (combinaison non pondérée, pédagogique)
  const M = (p * d.L * d.L) / 8;
  const V = (p * d.L) / 2;
  const I = (d.b * d.h ** 3) / 12; // cm⁴
  const W = (d.b * d.h * d.h) / 6; // cm³
  const sigma = (M * 1e6) / (W * 1000);
  const tau = (1.5 * V * 1000) / (d.b * d.h * 100);
  const EI = d.E * 1000 * I * 1e-8; // kN·m²
  const f = (5 * p * d.L ** 4) / (384 * EI); // m
  return { pp, p, M, V, I, W, sigma, tau, taux: sigma / d.fm, f, fmm: f * 1000, rapport: d.L / f };
}

/** Solive de l'exemple : plancher g = 0,6, q = 1,5 kN/m², entraxe 0,5 m, 4 m, 7,5 × 22,5 cm. */
export const EXEMPLE_SOLIVE: DonneesSolive = { g: 0.6, q: 1.5, e: 0.5, L: 4, b: 7.5, h: 22.5, fm: 10, E: 11000, rho: 5 };
