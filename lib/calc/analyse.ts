// Analyse (module L1.2) : limites, dérivées, extremums, approximations, intégrales, inerties,
// dérivées partielles et intégrales doubles. Unités SI, sauf mention (sections en cm).
import { gravite, rectangle, sectionT, type DonneesSectionT } from './geometrie';

// ---------- L1.2.1 : limites et continuité ----------

/** Valeurs de f(a + h) et f(a − h) pour h = 10⁻¹, 10⁻², … : approche numérique d'une limite en a. */
export function tableLimite(f: (x: number) => number, a: number, puissances: readonly number[]): Array<{ h: number; droite: number; gauche: number }> {
  return puissances.map((k) => {
    const h = 10 ** -k;
    return { h, droite: f(a + h), gauche: f(a - h) };
  });
}

export interface ResultatPolygone {
  n: number;
  inscrit: number; // périmètre du polygone inscrit / diamètre : n sin(π/n)
  circonscrit: number; // périmètre du polygone circonscrit / diamètre : n tan(π/n)
  ecart: number; // π − inscrit
}

/** Polygones réguliers à n côtés inscrit et circonscrit à un cercle : leurs périmètres encadrent π × diamètre. */
export function polygoneInscrit(n: number): ResultatPolygone {
  const inscrit = n * Math.sin(Math.PI / n);
  return { n, inscrit, circonscrit: n * Math.tan(Math.PI / n), ecart: Math.PI - inscrit };
}

/** Fonction rationnelle P(x) / Q(x), coefficients par puissances croissantes. */
export function rationnelle(num: readonly number[], den: readonly number[], x: number): number {
  return evaluerPolynome(num, x) / evaluerPolynome(den, x);
}

/** sin x / x (x en radians) : non définie en 0, mais de limite 1 en 0. */
export function sinusSurX(x: number): number {
  return Math.sin(x) / x;
}

/** Limite de βcc(t) = exp{s [1 − (28/t)^½]} quand t tend vers l'infini : (28/t)^½ tend vers 0, donc βcc tend vers e^s. */
export function betaCCInfini(s: number): number {
  return Math.exp(s);
}

/** Coût moyen d'un mètre cube quand on en produit n : frais fixes F répartis sur n, plus le coût variable c ; tend vers c. */
export function coutMoyen(F: number, c: number, n: number): number {
  return F / n + c;
}

// ---------- L1.2.2 : dérivée, pente ----------

/** Pente de la sécante entre x et x + h, et pente centrée entre x − h et x + h. */
export function penteSecante(f: (x: number) => number, x: number, h: number): { avant: number; centree: number } {
  return { avant: (f(x + h) - f(x)) / h, centree: (f(x + h) - f(x - h)) / (2 * h) };
}

export interface DonneesRaccordement {
  p1: number; // pente d'entrée (%)
  p2: number; // pente de sortie (%)
  L: number; // longueur du raccordement (m)
  z0: number; // altitude du début (m)
  x: number; // abscisse étudiée (m)
  h: number; // pas de la sécante (m)
}

export const EXEMPLE_RACCORDEMENT: DonneesRaccordement = { p1: 4, p2: -2, L: 120, z0: 300, x: 30, h: 10 };

export interface ResultatRaccordement {
  z: number; // altitude en x (m)
  pente: number; // dérivée exacte z'(x) (m/m)
  secante: number; // pente de la sécante sur [x, x + h] (m/m)
  ecart: number; // sécante − dérivée (m/m)
  xSommet: number | null; // abscisse où la pente s'annule, si elle est dans le raccordement (m)
  zSommet: number | null;
}

/** Raccordement parabolique d'un profil en long : z = z0 + p1 x + (p2 − p1) x² / (2L), pente z' = p1 + (p2 − p1) x / L. */
export function raccordement(d: DonneesRaccordement): ResultatRaccordement & { f: (x: number) => number } {
  const p1 = d.p1 / 100;
  const p2 = d.p2 / 100;
  const f = (x: number) => d.z0 + p1 * x + ((p2 - p1) * x * x) / (2 * d.L);
  const pente = p1 + ((p2 - p1) * d.x) / d.L;
  const secante = penteSecante(f, d.x, d.h).avant;
  const xs = p2 !== p1 ? (-p1 * d.L) / (p2 - p1) : NaN;
  const dansLeRaccordement = Number.isFinite(xs) && xs >= 0 && xs <= d.L;
  return {
    f,
    z: f(d.x),
    pente,
    secante,
    ecart: secante - pente,
    xSommet: dansLeRaccordement ? xs : null,
    zSommet: dansLeRaccordement ? f(xs) : null,
  };
}

// ---------- L1.2.3 : règles de dérivation ----------

/** Coefficients [a0, a1, a2, …] d'un polynôme a0 + a1 x + a2 x² + … : valeur par la méthode de Horner. */
export function evaluerPolynome(c: readonly number[], x: number): number {
  let y = 0;
  for (let i = c.length - 1; i >= 0; i--) y = y * x + (c[i] ?? 0);
  return y;
}

/** Dérivée d'un polynôme : (a0 + a1 x + a2 x² + …)' = a1 + 2 a2 x + … */
export function deriveePolynome(c: readonly number[]): number[] {
  return c.slice(1).map((a, i) => (i + 1) * a);
}

export interface DonneesFleche {
  q: number; // charge uniforme (kN/m)
  L: number; // portée (m)
  b: number; // largeur de la section (m)
  h: number; // hauteur de la section (m)
  E: number; // module d'élasticité (GPa), donnée de l'énoncé
  x: number; // abscisse étudiée (m)
}

export const EXEMPLE_FLECHE: DonneesFleche = { q: 15, L: 6, b: 0.25, h: 0.5, E: 31, x: 1.5 };

export interface ResultatFleche {
  I: number; // m⁴
  EI: number; // kN·m²
  y: number; // flèche en x (m), positive vers le bas
  theta: number; // rotation en x (rad)
  theta0: number; // rotation sur appui qL³ / (24 EI) (rad)
  yMax: number; // flèche à mi-portée 5qL⁴ / (384 EI) (m)
}

/** Poutre sur deux appuis, charge uniforme : y = q x (L³ − 2 L x² + x³) / (24 EI), y' = q (L³ − 6 L x² + 4 x³) / (24 EI). */
export function flechePoutre(d: DonneesFleche): ResultatFleche & { f: (x: number) => number; fp: (x: number) => number } {
  const I = (d.b * d.h ** 3) / 12;
  const EI = d.E * 1e6 * I; // GPa → kN/m²
  const f = (x: number) => (d.q * x * (d.L ** 3 - 2 * d.L * x * x + x ** 3)) / (24 * EI);
  const fp = (x: number) => (d.q * (d.L ** 3 - 6 * d.L * x * x + 4 * x ** 3)) / (24 * EI);
  return { f, fp, I, EI, y: f(d.x), theta: fp(d.x), theta0: fp(0), yMax: f(d.L / 2) };
}

/** Rapports portée / flèche de l'EC2 §7.4.1 : (4) aspect et utilisation, charges quasi permanentes ; (5) flèche après construction, protection des cloisons. */
export const RAPPORT_FLECHE_ASPECT = 250;
export const RAPPORT_FLECHE_CLOISONS = 500;

/** Flèche limite L / rapport (m). */
export function flecheLimite(L: number, rapport = RAPPORT_FLECHE_ASPECT): number {
  return L / rapport;
}

/** Canal rectangulaire de largeur b, eau à la hauteur h : rayon hydraulique R = b h / (b + 2h) et sa dérivée (règle du quotient) dR/dh = b² / (b + 2h)². */
export function rayonHydraulique(b: number, h: number): { A: number; P: number; R: number; dR: number } {
  const A = b * h;
  const P = b + 2 * h;
  return { A, P, R: A / P, dR: (b * b) / (P * P) };
}

/**
 * Réservoir conique pointe en bas, de rayon R au niveau H, rempli au débit Q (m³/h) : à la hauteur d'eau h,
 * V = π k² h³ / 3 avec k = R / H ; dérivée d'une composée : dV/dt = π k² h² dh/dt, donc dh/dt = Q / (π k² h²) (m/h).
 */
export function monteeCone(R: number, H: number, Q: number, h: number): { k: number; S: number; V: number; dhdt: number } {
  const k = R / H;
  const S = Math.PI * k * k * h * h; // surface libre à la hauteur h (m²)
  return { k, S, V: (S * h) / 3, dhdt: Q / S };
}

// ---------- L1.2.4 : extremums et optimisation ----------

export interface DonneesMomentMax {
  L: number; // portée (m)
  q: number; // charge uniforme (kN/m)
  P: number; // charge ponctuelle (kN)
  a: number; // position de la charge ponctuelle depuis l'appui gauche (m)
}

export const EXEMPLE_MOMENT_MAX: DonneesMomentMax = { L: 8, q: 10, P: 30, a: 2 };

export interface ResultatMomentMax {
  RA: number; // kN
  RB: number; // kN
  x0: number; // abscisse du moment maximal, là où l'effort tranchant change de signe (m)
  Mmax: number; // kN·m
  V: (x: number) => number;
  M: (x: number) => number;
}

/**
 * Poutre sur deux appuis, charge uniforme q et charge ponctuelle P en a. Le moment est maximal là où sa dérivée,
 * l'effort tranchant V = dM/dx, s'annule ou change de signe (au droit de la charge ponctuelle).
 */
export function momentMax(d: DonneesMomentMax): ResultatMomentMax {
  const RA = (d.q * d.L) / 2 + (d.P * (d.L - d.a)) / d.L;
  const RB = d.q * d.L + d.P - RA;
  const V = (x: number) => RA - d.q * x - (x > d.a ? d.P : 0);
  const M = (x: number) => RA * x - (d.q * x * x) / 2 - (x > d.a ? d.P * (x - d.a) : 0);
  let x0: number;
  const avant = RA - d.q * d.a; // effort tranchant juste à gauche de la charge
  if (d.q > 0 && RA / d.q < d.a) x0 = RA / d.q;
  else if (avant >= 0 && avant - d.P <= 0) x0 = d.a;
  else x0 = d.q > 0 ? Math.min((RA - d.P) / d.q, d.L) : d.L / 2;
  return { RA, RB, x0, Mmax: M(x0), V, M };
}

/** Périmètre mouillé d'un canal rectangulaire de section A (m²) rempli sur h (m) : P(h) = A/h + 2h. */
export function perimetreCanal(A: number, h: number): number {
  return A / h + 2 * h;
}

/** Canal rectangulaire de section A (m²) : le périmètre mouillé b + 2h est minimal pour h = √(A/2), b = 2h. */
export function canalOptimal(A: number): { h: number; b: number; P: number } {
  const h = Math.sqrt(A / 2);
  return { h, b: 2 * h, P: 4 * h };
}

/** Module de résistance W = b h² / 6 d'une poutre de largeur b taillée dans un tronc de diamètre D (h² = D² − b²). */
export function moduleTronc(D: number, b: number): number {
  return (b * (D * D - b * b)) / 6;
}

/** Poutre la plus résistante taillée dans un tronc : W'(b) = (D² − 3b²) / 6 = 0, soit b = D/√3 et h = D √(2/3) ; comparaison avec le carré inscrit. */
export function poutreTronc(D: number): { b: number; h: number; W: number; aCarre: number; WCarre: number; gain: number } {
  const b = D / Math.sqrt(3);
  const h = D * Math.sqrt(2 / 3);
  const W = moduleTronc(D, b);
  const aCarre = D / Math.SQRT2;
  const WCarre = aCarre ** 3 / 6;
  return { b, h, W, aCarre, WCarre, gain: W / WCarre };
}

// ---------- L1.2.5 : approximations ----------

export interface ResultatPetitAngle {
  rad: number;
  sin: number;
  tan: number;
  cos: number;
  erreurSin: number; // (α − sin α) / sin α
  erreurTan: number; // (tan α − α) / tan α
  erreurCos: number; // (1 − α²/2 − cos α) / cos α
}

/** Petits angles : sin α ≈ α, tan α ≈ α, cos α ≈ 1 − α²/2 (α en radians), et erreurs relatives. */
export function petitAngle(deg: number): ResultatPetitAngle {
  const a = (deg * Math.PI) / 180;
  const s = Math.sin(a);
  const t = Math.tan(a);
  const c = Math.cos(a);
  return { rad: a, sin: s, tan: t, cos: c, erreurSin: (a - s) / s, erreurTan: (t - a) / t, erreurCos: (1 - (a * a) / 2 - c) / c };
}

export interface DonneesCable {
  l: number; // portée entre appuis (m)
  f: number; // flèche à mi-portée (m)
}

export const EXEMPLE_CABLE: DonneesCable = { l: 200, f: 6 };

/** Longueur d'un câble parabolique : exacte (l/2)(√(1+k²) + asinh(k)/k), k = 4f/l, et approchée l (1 + 8f²/(3l²)). */
export function longueurCable(d: DonneesCable): { k: number; exacte: number; approchee: number; ecart: number; ecartRelatif: number } {
  const k = (4 * d.f) / d.l;
  const exacte = k === 0 ? d.l : (d.l / 2) * (Math.sqrt(1 + k * k) + Math.asinh(k) / k);
  const approchee = d.l * (1 + (8 * d.f * d.f) / (3 * d.l * d.l));
  return { k, exacte, approchee, ecart: approchee - exacte, ecartRelatif: (approchee - exacte) / exacte };
}

/** Sensibilité de la flèche d'un câble : en dérivant S ≈ l + 8f²/(3l), dS = 16 f df / (3l), donc df = 3 l dS / (16 f). */
export function sensibiliteFleche(l: number, f: number, dS: number): number {
  return (3 * l * dS) / (16 * f);
}

/** Binôme : (1 + x)^n ≈ 1 + n x pour x petit. */
export function binome(x: number, n: number): { exact: number; approche: number; ecart: number } {
  const exact = (1 + x) ** n;
  return { exact, approche: 1 + n * x, ecart: 1 + n * x - exact };
}

// ---------- L1.2.6 : intégrale définie ----------

/** Intégrale exacte d'un polynôme sur [a, b] (primitive Σ cᵢ xⁱ⁺¹ / (i + 1)). */
export function integralePolynome(c: readonly number[], a: number, b: number): number {
  const F = (x: number) => c.reduce((s, ci, i) => s + (ci * x ** (i + 1)) / (i + 1), 0);
  return F(b) - F(a);
}

/** Méthode des rectangles au milieu, n intervalles. */
export function rectanglesMilieu(f: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h);
  return s * h;
}

/** Méthode des trapèzes, n intervalles. */
export function trapezes(f: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n;
  let s = (f(a) + f(b)) / 2;
  for (let i = 1; i < n; i++) s += f(a + i * h);
  return s * h;
}

/** Méthode de Simpson, n pair. */
export function simpson(f: (x: number) => number, a: number, b: number, n: number): number {
  const m = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / m;
  let s = f(a) + f(b);
  for (let i = 1; i < m; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

export interface DonneesChargeVariable {
  c0: number; // kN/m
  c1: number; // kN/m²
  c2: number; // kN/m³
  L: number; // m
  n: number; // nombre de rectangles de l'approximation
}

export const EXEMPLE_CHARGE_VARIABLE: DonneesChargeVariable = { c0: 4, c1: 1.5, c2: 0, L: 6, n: 6 };

export interface ResultatChargeVariable {
  R: number; // résultante exacte ∫ q dx (kN)
  moment: number; // ∫ x q dx, moment par rapport à x = 0 (kN·m)
  xBarre: number; // position de la résultante ∫ x q dx / R (m)
  dx: number; // largeur d'un rectangle L / n (m)
  Rn: number; // approximation par n rectangles au milieu (kN)
  ecart: number; // Rn − R (kN)
  q: (x: number) => number;
}

/** Charge répartie q(x) = c0 + c1 x + c2 x² sur [0, L] : résultante, position, et somme de rectangles. */
export function chargeVariable(d: DonneesChargeVariable): ResultatChargeVariable {
  const c = [d.c0, d.c1, d.c2];
  const q = (x: number) => evaluerPolynome(c, x);
  const R = integralePolynome(c, 0, d.L);
  const moment = integralePolynome([0, d.c0, d.c1, d.c2], 0, d.L);
  const n = Math.max(1, Math.round(d.n));
  const Rn = rectanglesMilieu(q, 0, d.L, n);
  return { R, moment, xBarre: R !== 0 ? moment / R : NaN, dx: d.L / n, Rn, ecart: Rn - R, q };
}

// ---------- L1.2.7 : techniques d'intégration ----------

/** ∫ₐᵇ e^(−x/λ) dx = λ [e^(−a/λ) − e^(−b/λ)] (primitive −λ e^(−x/λ)). */
export function integraleExp(a: number, b: number, lambda: number): number {
  return lambda * (Math.exp(-a / lambda) - Math.exp(-b / lambda));
}

/** ∫ₐᵇ x e^(−x/λ) dx par parties : [−λ x e^(−x/λ) − λ² e^(−x/λ)]ₐᵇ. */
export function integraleXExp(a: number, b: number, lambda: number): number {
  const F = (x: number) => -lambda * x * Math.exp(-x / lambda) - lambda * lambda * Math.exp(-x / lambda);
  return F(b) - F(a);
}

/** Charge q(x) = q0 e^(−x/λ) sur [0 ; L] : résultante (intégrale directe) et moment ∫ x q dx (par parties). */
export function chargeExponentielle(q0: number, lambda: number, L: number): { R: number; M: number; xBarre: number } {
  const R = q0 * integraleExp(0, L, lambda);
  const M = q0 * integraleXExp(0, L, lambda);
  return { R, M, xBarre: M / R };
}

export interface DonneesVentPuissance {
  qr: number; // charge linéique de référence à la hauteur zr (kN/m)
  zr: number; // hauteur de référence (m)
  alpha: number; // exposant du profil, donnée de l'énoncé
  H: number; // hauteur du mât (m)
}

export const EXEMPLE_VENT_PUISSANCE: DonneesVentPuissance = { qr: 0.8, zr: 10, alpha: 0.2, H: 30 };

export interface ResultatVentPuissance {
  F: number; // résultante ∫ q dz (kN)
  M: number; // moment à la base ∫ z q dz (kN·m)
  zBarre: number; // hauteur de la résultante (m)
  Fsimpson: number; // contrôle numérique (kN)
  q: (z: number) => number;
}

/** Charge de vent en loi de puissance q(z) = qr (z/zr)^α : intégrales par changement de variable u = z/zr. */
export function ventPuissance(d: DonneesVentPuissance): ResultatVentPuissance {
  const q = (z: number) => d.qr * (Math.max(z, 0) / d.zr) ** d.alpha;
  const F = (d.qr * d.H ** (d.alpha + 1)) / ((d.alpha + 1) * d.zr ** d.alpha);
  const M = (d.qr * d.H ** (d.alpha + 2)) / ((d.alpha + 2) * d.zr ** d.alpha);
  return { F, M, zBarre: M / F, Fsimpson: simpson(q, 0, d.H, 200), q };
}

// ---------- L1.2.8 : aires, centres de gravité, inerties ----------

export interface DonneesBandes {
  b: number; // largeur (cm)
  h: number; // hauteur (cm)
  n: number; // nombre de bandes horizontales
}

export const EXEMPLE_BANDES: DonneesBandes = { b: 20, h: 50, n: 5 };

export interface ResultatBandes {
  A: number; // aire b h (cm²)
  dy: number; // épaisseur d'une bande h / n (cm)
  Iexact: number; // b h³ / 12 (cm⁴)
  In: number; // Σ b Δy yᵢ², bandes au milieu (cm⁴)
  ecartRelatif: number;
  Ibase: number; // autour de la base : b h³ / 3 (cm⁴)
  IbaseHuygens: number; // b h³/12 + A (h/2)² (cm⁴)
}

/** Inertie d'un rectangle autour de son axe central : somme de n bandes, puis limite b h³ / 12 ; théorème de Huygens. */
export function inertieParBandes(d: DonneesBandes): ResultatBandes {
  const n = Math.max(1, Math.round(d.n));
  const dy = d.h / n;
  let In = 0;
  for (let i = 0; i < n; i++) {
    const y = -d.h / 2 + (i + 0.5) * dy;
    In += d.b * dy * y * y;
  }
  const Iexact = (d.b * d.h ** 3) / 12;
  const A = d.b * d.h;
  return { A, dy, Iexact, In, ecartRelatif: (In - Iexact) / Iexact, Ibase: (d.b * d.h ** 3) / 3, IbaseHuygens: huygens(Iexact, A, d.h / 2) };
}

/** Théorème de Huygens : inertie autour d'un axe parallèle à l'axe central, distant de d. */
export function huygens(IG: number, A: number, d: number): number {
  return IG + A * d * d;
}

/** Triangle de base b et hauteur h (base en bas) : aire, centre de gravité à h/3 de la base, inerties. */
export function triangleIntegre(b: number, h: number): { A: number; yG: number; Ibase: number; IG: number } {
  // largeur à la hauteur y : b (1 − y/h) ; A = ∫ b(y) dy ; yG = ∫ y b(y) dy / A ; Ibase = ∫ y² b(y) dy
  const A = (b * h) / 2;
  const Ibase = (b * h ** 3) / 12;
  return { A, yG: h / 3, Ibase, IG: Ibase - A * (h / 3) ** 2 };
}

/** Volume d'un solide de révolution autour de l'axe z, de rayon r(z) : V = ∫ π r(z)² dz (Simpson). */
export function volumeRevolution(r: (z: number) => number, a: number, b: number, n = 200): number {
  return simpson((z) => Math.PI * r(z) ** 2, a, b, n);
}

export interface DonneesCuveConique {
  R: number; // rayon de la partie cylindrique (m)
  Hc: number; // hauteur de la partie cylindrique (m)
  Hk: number; // hauteur du fond conique (m)
  r0: number; // rayon à la pointe du cône (m)
}

export const EXEMPLE_CUVE_CONIQUE: DonneesCuveConique = { R: 2.5, Hc: 3, Hk: 1.5, r0: 0.5 };

/** Cuve de château d'eau : fond tronconique puis cylindre ; volume par intégration et par les formules des solides. */
export function cuveConique(d: DonneesCuveConique): { r: (z: number) => number; Vintegre: number; Vformules: number } {
  const r = (z: number) => (z <= d.Hk ? d.r0 + ((d.R - d.r0) * z) / d.Hk : d.R);
  const Vintegre = volumeRevolution(r, 0, d.Hk, 200) + volumeRevolution(r, d.Hk, d.Hk + d.Hc, 2);
  const Vformules = (Math.PI * d.Hk * (d.R * d.R + d.R * d.r0 + d.r0 * d.r0)) / 3 + Math.PI * d.R * d.R * d.Hc;
  return { r, Vintegre, Vformules };
}

// ---------- L1.2.9 : dérivées partielles ----------

export interface DonneesTerrain {
  z0: number; // altitude à l'origine (m)
  a: number; // pente selon x (%)
  b: number; // pente selon y à l'origine (%)
  c: number; // courbure du vallon selon y (1/m)
  x: number; // point étudié (m)
  y: number;
}

export const EXEMPLE_TERRAIN: DonneesTerrain = { z0: 320, a: 3, b: -2, c: 0.002, x: 40, y: 25 };

export interface ResultatTerrain {
  z: number; // m
  zx: number; // ∂z/∂x (m/m)
  zy: number; // ∂z/∂y (m/m)
  pente: number; // |grad z| (m/m)
  direction: number; // direction de la plus forte descente, depuis l'axe x (°)
  f: (x: number, y: number) => number;
}

/** Terrain z = z0 + a x + b y + c y² : gradient, plus forte pente et direction d'écoulement de l'eau (−grad z). */
export function terrain(d: DonneesTerrain): ResultatTerrain {
  const a = d.a / 100;
  const b = d.b / 100;
  const f = (x: number, y: number) => d.z0 + a * x + b * y + d.c * y * y;
  const zx = a;
  const zy = b + 2 * d.c * d.y;
  const direction = ((Math.atan2(-zy, -zx) * 180) / Math.PI + 360) % 360;
  return { f, z: f(d.x, d.y), zx, zy, pente: Math.hypot(zx, zy), direction };
}

/** Réservoir cylindrique V = π r² h et ses dérivées partielles ∂V/∂r = 2π r h et ∂V/∂h = π r² (m²). */
export function cylindreDerivees(r: number, h: number): { V: number; dVdr: number; dVdh: number } {
  return { V: Math.PI * r * r * h, dVdr: 2 * Math.PI * r * h, dVdh: Math.PI * r * r };
}

/** Pente dans la direction θ (degrés depuis l'axe x, sens trigonométrique) : dérivée directionnelle zx cos θ + zy sin θ. */
export function penteDirectionnelle(zx: number, zy: number, thetaDeg: number): number {
  const t = (thetaDeg * Math.PI) / 180;
  return zx * Math.cos(t) + zy * Math.sin(t);
}

export interface ResultatDifferentielle {
  V: number; // m³
  dVdL: number; // ∂V/∂L = l h (m²)
  dVdl: number; // ∂V/∂l = L h (m²)
  dVdh: number; // ∂V/∂h = L l (m²)
  dV: number; // incertitude par la différentielle (m³)
  relatif: number; // dV / V
  exact: number; // (L + dL)(l + dl)(h + dh) − L l h (m³)
}

/** Volume V = L l h d'une dalle et propagation des écarts de mesure par la différentielle totale. */
export function differentielleVolume(L: number, l: number, h: number, dL: number, dl: number, dh: number): ResultatDifferentielle {
  const V = L * l * h;
  const dV = l * h * dL + L * h * dl + L * l * dh;
  return { V, dVdL: l * h, dVdl: L * h, dVdh: L * l, dV, relatif: dV / V, exact: (L + dL) * (l + dl) * (h + dh) - V };
}

// ---------- L1.2.10 : intégrales doubles ----------

export interface DonneesCubature {
  L: number; // longueur de la plate-forme selon x (m)
  l: number; // largeur selon y (m)
  z00: number; // altitudes du terrain aux quatre coins (m)
  z10: number;
  z01: number;
  z11: number;
  zp: number; // niveau de la plate-forme (m)
}

export const EXEMPLE_CUBATURE: DonneesCubature = { L: 30, l: 20, z00: 101.2, z10: 100.4, z01: 100.8, z11: 99.6, zp: 100.5 };

export interface ResultatCubature {
  zMoyen: number; // altitude moyenne du terrain (m)
  Vnet: number; // ∬ (z − zp) dA, exact (m³) : positif = déblai net
  Vdeblai: number; // ∬ max(z − zp, 0) dA (m³)
  Vremblai: number; // ∬ max(zp − z, 0) dA (m³)
  f: (x: number, y: number) => number;
}

/** Plate-forme sur un terrain bilinéaire : volumes de déblai et de remblai par intégrale double (quadrillage fin). */
export function cubature(d: DonneesCubature, n = 120): ResultatCubature {
  const f = (x: number, y: number) => {
    const u = x / d.L;
    const v = y / d.l;
    return d.z00 * (1 - u) * (1 - v) + d.z10 * u * (1 - v) + d.z01 * (1 - u) * v + d.z11 * u * v;
  };
  const zMoyen = (d.z00 + d.z10 + d.z01 + d.z11) / 4;
  let deblai = 0;
  let remblai = 0;
  const dA = (d.L / n) * (d.l / n);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const e = f(((i + 0.5) * d.L) / n, ((j + 0.5) * d.l) / n) - d.zp;
      if (e > 0) deblai += e * dA;
      else remblai -= e * dA;
    }
  return { f, zMoyen, Vnet: d.L * d.l * (zMoyen - d.zp), Vdeblai: deblai, Vremblai: remblai };
}

/** Intégrale double de f sur le rectangle [a, b] × [c, d] : point milieu de n × n mailles. */
export function integraleDoubleRectangle(f: (x: number, y: number) => number, a: number, b: number, c: number, d: number, n = 100): number {
  const hx = (b - a) / n;
  const hy = (d - c) / n;
  let s = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += f(a + (i + 0.5) * hx, c + (j + 0.5) * hy);
  return s * hx * hy;
}

/** Disque de rayon R : aire, inertie autour d'un diamètre π R⁴ / 4 et moment polaire π R⁴ / 2 (coordonnées polaires, dA = r dr dθ). */
export function disque(R: number): { A: number; I: number; J: number } {
  return { A: Math.PI * R * R, I: (Math.PI * R ** 4) / 4, J: (Math.PI * R ** 4) / 2 };
}

/** Inertie d'un triangle autour de sa base par intégrale double ∬ y² dA, calculée sur un quadrillage (contrôle de b h³ / 12). */
export function inertieTriangleDouble(b: number, h: number, n = 400): number {
  let I = 0;
  const dy = h / n;
  for (let j = 0; j < n; j++) {
    const y = (j + 0.5) * dy;
    I += b * (1 - y / h) * dy * y * y; // ∫ dx sur la largeur, puis ∫ dy
  }
  return I;
}

// ---------- L1.2.P : section en T ----------

export const EXEMPLE_SECTION_T: DonneesSectionT = { b: 60, hf: 12, bw: 20, h: 50 };

export interface ResultatTInertie {
  A: number; // cm²
  yG: number; // depuis la fibre inférieure (cm)
  IG: number; // inertie autour de l'axe horizontal passant par G (cm⁴)
  Iintegre: number; // ∫ b(y) (y − yG)² dy, par bandes fines (cm⁴)
  vInf: number; // cm
  vSup: number; // cm
  Winf: number; // module de résistance I / vInf (cm³)
  Wsup: number; // I / vSup (cm³)
  parties: Array<{ nom: string; A: number; y: number; Ipropre: number; d: number; IHuygens: number }>;
}

/** Section en T : aire, centre de gravité, inertie par Huygens (âme + table) et par intégration de b(y). */
export function sectionTInertie(d: DonneesSectionT): ResultatTInertie {
  const t = sectionT(d);
  const yG = t.yG;
  const ha = d.h - d.hf;
  const parts = [
    { nom: 'âme', b: d.bw, h: ha, y: ha / 2 },
    { nom: 'table', b: d.b, h: d.hf, y: ha + d.hf / 2 },
  ].map((p) => {
    const A = p.b * p.h;
    const Ipropre = (p.b * p.h ** 3) / 12;
    const dist = p.y - yG;
    return { nom: p.nom, A, y: p.y, Ipropre, d: dist, IHuygens: huygens(Ipropre, A, dist) };
  });
  const IG = parts.reduce((s, p) => s + p.IHuygens, 0);
  const n = 2000;
  const dy = d.h / n;
  let Iintegre = 0;
  for (let i = 0; i < n; i++) {
    const y = (i + 0.5) * dy;
    const b = y < ha ? d.bw : d.b;
    Iintegre += b * dy * (y - yG) ** 2;
  }
  return { A: t.A, yG, IG, Iintegre, vInf: yG, vSup: d.h - yG, Winf: IG / yG, Wsup: IG / (d.h - yG), parties: parts };
}

/** Contrainte de flexion σ = M / W (MPa) pour M en kN·m et W en cm³ : 1 kN·m = 10⁶ N·mm et 1 cm³ = 10³ mm³. */
export function contrainteFlexion(M: number, W: number): number {
  return (M * 1e6) / (W * 1e3);
}

/** Centre de gravité de morceaux rectangulaires (réexport pratique pour les exercices). */
export const graviteRectangles = (m: Array<[string, number, number, number, number]>) => gravite(m.map(([nom, x, y, L, h]) => rectangle(nom, x, y, L, h)));
