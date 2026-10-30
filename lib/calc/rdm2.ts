// Résistance des matériaux II (module L2.5) : déformées, superposition, Castigliano, flexion composée et déviée,
// contraintes principales, Hooke généralisée, flambement, poutre continue à deux travées. Unités : kN, m, MPa.

import { diagrammes, type DonneesPoutreIso } from './rdm1';

// ---------- Ligne élastique par intégration numérique ----------

/**
 * Déformée d'une poutre isostatique sur deux appuis (xA, xB) : on intègre deux fois −M/EI
 * (trapèzes), puis on ajoute la droite qui annule la flèche sur les deux appuis. EI en kN·m² ; y en m, positif vers le bas.
 */
export function ligneElastique(d: DonneesPoutreIso, EI: number, n = 400) {
  const r = diagrammes(d, n);
  const h = d.L / n;
  const k = r.pts.map((p) => p.M / EI); // courbure w″ = M/EI (w vers le haut)
  const t = [0];
  for (let i = 1; i <= n; i++) t.push(t[i - 1]! + ((k[i - 1]! + k[i]!) * h) / 2);
  const w = [0];
  for (let i = 1; i <= n; i++) w.push(w[i - 1]! + ((t[i - 1]! + t[i]!) * h) / 2);
  const iA = Math.round(d.xA / h);
  const iB = Math.round(d.xB / h);
  const pente = (w[iB]! - w[iA]!) / (d.xB - d.xA);
  const y = w.map((v, i) => -(v - w[iA]! - pente * (i * h - d.xA))); // w monte (w″ = M/EI) : y = −w, compté vers le bas
  const rot = t.map((v) => -(v - pente));
  let iMax = 0;
  for (let i = 0; i <= n; i++) if (Math.abs(y[i]!) > Math.abs(y[iMax]!)) iMax = i;
  return { x: r.pts.map((p) => p.x), y, rot, f: y[iMax]!, xf: iMax * h, rotA: rot[iA]!, rotB: rot[iB]!, Mmax: r.Mmax };
}

// ---------- Formulaire et superposition ----------

export type CasFleche = 'uniforme' | 'centree' | 'consoleUniforme' | 'consoleBout';

/** Flèche maximale (m) des cas usuels du formulaire ; q en kN/m, P en kN, L en m, EI en kN·m². */
export function flecheFormulaire(cas: CasFleche, charge: number, L: number, EI: number): number {
  switch (cas) {
    case 'uniforme':
      return (5 * charge * L ** 4) / (384 * EI);
    case 'centree':
      return (charge * L ** 3) / (48 * EI);
    case 'consoleUniforme':
      return (charge * L ** 4) / (8 * EI);
    case 'consoleBout':
      return (charge * L ** 3) / (3 * EI);
  }
}

/** EI (kN·m²) d'un rectangle b × h (cm) de module E (MPa). */
export function EIrect(E: number, b: number, h: number): number {
  return E * 1000 * ((b * h ** 3) / 12) * 1e-8;
}

// ---------- Énergie et Castigliano ----------

/** Console de longueur L chargée par P en bout : U = P² L³/(6 EI), δ = ∂U/∂P = P L³/(3 EI). */
export function castiglianoConsole(P: number, L: number, EI: number) {
  const U = (P * P * L ** 3) / (6 * EI); // kN·m = kJ
  const dP = 1e-6 * Math.max(1, P);
  const Up = ((P + dP) ** 2 * L ** 3) / (6 * EI);
  return { U, delta: (P * L ** 3) / (3 * EI), deltaNum: (Up - U) / dP };
}

/** Énergie de déformation d'une barre tendue : U = N² L/(2 E A) (N en kN, L en m, E en MPa, A en mm²) → J. */
export function energieBarre(N: number, L: number, E: number, A: number): number {
  return ((N * 1000) ** 2 * (L * 1000)) / (2 * E * A) / 1000;
}

// ---------- Flexion composée ----------

export interface DonneesComposee {
  N: number; // effort normal (kN), positif en compression
  M: number; // moment (kN·m)
  b: number; // largeur (cm)
  h: number; // hauteur dans le plan du moment (cm)
}

/** Contraintes extrêmes d'un rectangle sous N (compression) et M : σ = −N/A ± M/W (MPa, compression négative). */
export function flexionComposee(d: DonneesComposee) {
  const A = d.b * d.h * 100; // mm²
  const W = ((d.b * d.h * d.h) / 6) * 1000; // mm³
  const sN = -(d.N * 1000) / A;
  const sM = (d.M * 1e6) / W;
  const e = d.N !== 0 ? (d.M / d.N) * 100 : Infinity; // excentricité (cm)
  return { A, W, sN, sM, s1: sN - sM, s2: sN + sM, e, noyau: d.h / 6, dansNoyau: Math.abs(e) <= d.h / 6 };
}

/** Semelle B × L (m) sous N (kN) et M (kN·m) : pressions trapézoïdales, ou triangulaires si e > B/6. */
export function pressionSemelle(N: number, M: number, B: number, L: number) {
  const e = M / N;
  if (Math.abs(e) <= B / 6) {
    const qm = N / (B * L);
    return { e, qmax: qm * (1 + (6 * e) / B), qmin: qm * (1 - (6 * e) / B), decollement: false, largeurComprimee: B };
  }
  const c = 3 * (B / 2 - Math.abs(e));
  return { e, qmax: (2 * N) / (c * L), qmin: 0, decollement: true, largeurComprimee: c };
}

// ---------- Flexion déviée ----------

/** Rectangle b × h (cm) sous My (autour de l'axe fort) et Mz (axe faible), plus N : contraintes aux 4 coins (MPa). */
export function flexionDeviee(My: number, Mz: number, b: number, h: number, N = 0) {
  const A = b * h * 100;
  const Wy = ((b * h * h) / 6) * 1000;
  const Wz = ((h * b * b) / 6) * 1000;
  const s0 = -(N * 1000) / A;
  const sy = (My * 1e6) / Wy;
  const sz = (Mz * 1e6) / Wz;
  const coins = [
    { nom: 'A (haut gauche)', s: s0 - sy + sz },
    { nom: 'B (haut droit)', s: s0 - sy - sz },
    { nom: 'C (bas droit)', s: s0 + sy - sz },
    { nom: 'D (bas gauche)', s: s0 + sy + sz },
  ];
  return { Wy, Wz, s0, sy, sz, coins, max: Math.max(...coins.map((c) => c.s)), min: Math.min(...coins.map((c) => c.s)) };
}

// ---------- Contraintes principales ----------

/** État plan (σx, σy, τxy en MPa) : contraintes principales, cisaillement maximal, angle (°), contrainte sur une facette θ. */
export function etatPlan(sx: number, sy: number, txy: number) {
  const c = (sx + sy) / 2;
  const R = Math.hypot((sx - sy) / 2, txy);
  const theta = (Math.atan2(2 * txy, sx - sy) * 90) / Math.PI;
  const facette = (deg: number) => {
    const a = (2 * deg * Math.PI) / 180;
    return { s: c + ((sx - sy) / 2) * Math.cos(a) + txy * Math.sin(a), t: -((sx - sy) / 2) * Math.sin(a) + txy * Math.cos(a) };
  };
  return { c, R, s1: c + R, s2: c - R, tauMax: R, theta, facette };
}

// ---------- Hooke généralisée ----------

/** Déformations d'un élément sous σx, σy, σz (MPa) : ε = (σ − ν (somme des deux autres))/E, et déformation volumique. */
export function hookeGeneralisee(sx: number, sy: number, sz: number, E: number, nu: number) {
  const ex = (sx - nu * (sy + sz)) / E;
  const ey = (sy - nu * (sx + sz)) / E;
  const ez = (sz - nu * (sx + sy)) / E;
  return { ex, ey, ez, ev: ex + ey + ez, G: E / (2 * (1 + nu)), K: E / (3 * (1 - 2 * nu)) };
}

// ---------- Flambement ----------

export const COEFF_LF = { 'articulé-articulé': 1, 'encastré-articulé': 0.7, 'encastré-encastré': 0.5, 'encastré-libre': 2 } as const;
export type Liaisons = keyof typeof COEFF_LF;

export interface DonneesFlambement {
  L: number; // longueur (m)
  liaisons: Liaisons;
  E: number; // MPa
  b: number; // section rectangulaire b × h (cm), flambement autour de l'axe faible
  h: number;
}

/** Charge critique d'Euler Ncr = π² E I / Lf², élancement λ = Lf / i, contrainte critique. */
export function flambement(d: DonneesFlambement) {
  const Lf = COEFF_LF[d.liaisons] * d.L;
  const bmin = Math.min(d.b, d.h);
  const bmax = Math.max(d.b, d.h);
  const I = (bmax * bmin ** 3) / 12; // cm⁴, axe faible
  const A = d.b * d.h; // cm²
  const i = Math.sqrt(I / A); // cm
  const Ncr = (Math.PI ** 2 * d.E * 1000 * I * 1e-8) / (Lf * Lf); // kN
  return { Lf, I, A, i, lambda: (Lf * 100) / i, Ncr, scr: (Ncr * 10) / A };
}

/** Poteau bois de l'exemple : 3 m, articulé aux deux bouts, 10 × 10 cm, E = 11 000 MPa. */
export const EXEMPLE_FLAMBEMENT: DonneesFlambement = { L: 3, liaisons: 'articulé-articulé', E: 11000, b: 10, h: 10 };

// ---------- Poutre continue à deux travées (trois moments) ----------

/** Deux travées L1, L2 sous q1, q2 uniformes, appuis simples : moment sur l'appui central et réactions. */
export function deuxTravees(L1: number, L2: number, q1: number, q2: number) {
  const MB = -(q1 * L1 ** 3 + q2 * L2 ** 3) / (8 * (L1 + L2));
  const RA = (q1 * L1) / 2 + MB / L1;
  const RC = (q2 * L2) / 2 + MB / L2;
  const RB = q1 * L1 + q2 * L2 - RA - RC;
  const M = (x: number) => (x <= L1 ? RA * x - (q1 * x * x) / 2 : RC * (L1 + L2 - x) - (q2 * (L1 + L2 - x) ** 2) / 2);
  const x1 = RA / q1;
  return { MB, RA, RB, RC, M, Mtravee1: RA * x1 - (q1 * x1 * x1) / 2, x1 };
}

// ---------- Console de balcon ----------

export interface DonneesBalcon {
  L: number; // porte-à-faux (m)
  g: number; // charge permanente répartie (kN/m) hors poids propre
  q: number; // exploitation répartie (kN/m)
  P: number; // garde-corps en bout (kN)
  b: number; // largeur de la console (cm)
  h: number; // hauteur à l'encastrement (cm)
  E: number; // MPa
  sigmaLim: number; // MPa
}

/** Console : moment et tranchant d'encastrement, contrainte, flèche en bout (formulaire, superposition). */
export function balcon(d: DonneesBalcon) {
  const pp = 25 * (d.b / 100) * (d.h / 100);
  const p = d.g + d.q + pp;
  const M = (p * d.L * d.L) / 2 + d.P * d.L;
  const V = p * d.L + d.P;
  const W = (d.b * d.h * d.h) / 6;
  const sigma = (M * 1e6) / (W * 1000);
  const EI = EIrect(d.E, d.b, d.h);
  const f = flecheFormulaire('consoleUniforme', p, d.L, EI) + flecheFormulaire('consoleBout', d.P, d.L, EI);
  return { pp, p, M, V, W, sigma, EI, f, fmm: f * 1000, rapport: d.L / f, taux: sigma / d.sigmaLim };
}

/** Balcon de l'exemple : 1,5 m, b = 100 cm (bande de 1 m), h = 15 cm, E = 11 000 MPa (béton fissuré, valeur d'étude). */
export const EXEMPLE_BALCON: DonneesBalcon = { L: 1.5, g: 1.5, q: 3.5, P: 1, b: 100, h: 15, E: 11000, sigmaLim: 12 };
