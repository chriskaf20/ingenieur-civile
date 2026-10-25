// Module N0.6 — Vecteurs (fonctions pures). Composantes dans un repère orthonormé (x, y, z) ;
// angles en degrés, comptés depuis l'axe x dans le sens trigonométrique (vue de dessus pour le plan horizontal).
import { resoudre2x2 } from './algebre';
import { acosD, atanD, cosD, enDeg, sinD, tanD } from './trigo';

export type Vec = readonly number[];
export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];

const c = (v: Vec, i: number) => v[i] ?? 0;
const mod360 = (a: number) => ((a % 360) + 360) % 360;

// ---------- Opérations de base (N0.6.1 à N0.6.5) ----------

export function somme(...vs: Vec[]): number[] {
  const n = Math.max(0, ...vs.map((v) => v.length));
  return Array.from({ length: n }, (_, i) => vs.reduce((s, v) => s + c(v, i), 0));
}

/** u − v */
export function difference(u: Vec, v: Vec): number[] {
  return somme(u, fois(-1, v));
}

export function fois(k: number, v: Vec): number[] {
  return v.map((x) => k * x);
}

export function norme(v: Vec): number {
  return Math.hypot(...v);
}

export function unitaire(v: Vec): number[] {
  const n = norme(v);
  if (n === 0) throw new Error('le vecteur nul n’a pas de direction');
  return fois(1 / n, v);
}

/** Vecteur AB = B − A. */
export function vecteurAB(A: Vec, B: Vec): number[] {
  return difference(B, A);
}

/** Composantes d'un vecteur du plan de norme F et de direction θ (degrés). */
export function depuisPolaire(F: number, theta: number): Vec2 {
  return [F * cosD(theta), F * sinD(theta)];
}

/** Direction d'un vecteur du plan, dans [0 ; 360[ (degrés). */
export function direction(v: Vec): number {
  return mod360(enDeg(Math.atan2(c(v, 1), c(v, 0))));
}

/** Produit scalaire u · v = Σ uᵢ vᵢ. */
export function scalaire(u: Vec, v: Vec): number {
  let s = 0;
  for (let i = 0; i < Math.max(u.length, v.length); i++) s += c(u, i) * c(v, i);
  return s;
}

/** Angle (degrés, 0 à 180) entre deux vecteurs non nuls : cos θ = u · v / (|u| |v|). */
export function angleVecteurs(u: Vec, v: Vec): number {
  return acosD(scalaire(u, v) / (norme(u) * norme(v)));
}

/** Projection de v sur la direction de u : valeur algébrique (v · û) et vecteur projeté. */
export function projection(v: Vec, u: Vec): { valeur: number; vecteur: number[] } {
  const ut = unitaire(u);
  const valeur = scalaire(v, ut);
  return { valeur, vecteur: fois(valeur, ut) };
}

/** Produit vectoriel u × v (vecteurs de l'espace ; une composante absente vaut 0). */
export function vectoriel(u: Vec, v: Vec): Vec3 {
  const [ux, uy, uz] = [c(u, 0), c(u, 1), c(u, 2)];
  const [vx, vy, vz] = [c(v, 0), c(v, 1), c(v, 2)];
  return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
}

/** Composante z du produit vectoriel de deux vecteurs du plan : ux vy − uy vx. */
export function vectoriel2(u: Vec, v: Vec): number {
  return c(u, 0) * c(v, 1) - c(u, 1) * c(v, 0);
}

/**
 * Décompose F (plan) selon deux directions d1 et d2 : F = c1 û1 + c2 û2.
 * Null si les deux directions sont parallèles.
 */
export function decomposer(F: Vec, d1: Vec, d2: Vec): [number, number] | null {
  const u1 = unitaire(d1);
  const u2 = unitaire(d2);
  const s = resoudre2x2(c(u1, 0), c(u2, 0), c(F, 0), c(u1, 1), c(u2, 1), c(F, 1));
  return s ? [s.x, s.y] : null;
}

// ---------- N0.6.1 : la force d'un câble ----------

export interface DonneesForceCable {
  xA: number; // point d'attache sur la structure (m)
  yA: number;
  xB: number; // point d'ancrage (m)
  yB: number;
  T: number; // tension du câble (kN)
  echelle: number; // échelle des forces du dessin (kN par cm)
}

export const EXEMPLE_FORCE_CABLE: DonneesForceCable = { xA: 0, yA: 8, xB: 6, yB: 0, T: 12, echelle: 2 };

export interface ResultatForceCable {
  AB: number[]; // m
  L: number; // longueur du câble (m)
  u: number[]; // vecteur unitaire de A vers B
  F: number[]; // force exercée par le câble sur la structure en A (kN)
  theta: number; // direction de la force (°)
  fleche: number; // longueur de la flèche sur le dessin (cm)
}

/** Le câble tire la structure de A vers B : F = T × AB / |AB|. */
export function forceCable(d: DonneesForceCable): ResultatForceCable {
  const AB = vecteurAB([d.xA, d.yA], [d.xB, d.yB]);
  const u = unitaire(AB);
  const F = fois(d.T, u);
  return { AB, L: norme(AB), u, F, theta: direction(F), fleche: d.T / d.echelle };
}

// ---------- N0.6.2 : somme de forces ----------

export interface ForcePolaire {
  F: number; // kN
  theta: number; // °
}

export const EXEMPLE_ANNEAU: readonly ForcePolaire[] = [
  { F: 15, theta: 20 },
  { F: 10, theta: 110 },
];

export interface ResultatSomme {
  forces: Vec2[];
  R: number[];
  norme: number;
  theta: number;
  /** sommets du polygone des forces : O, F1, F1 + F2, … (la dernière pointe est R) */
  polygone: number[][];
}

/** Somme de forces concourantes données en norme et direction ; les forces nulles sont ignorées. */
export function sommeForces(fs: readonly ForcePolaire[]): ResultatSomme {
  const forces = fs.filter((f) => f.F !== 0).map((f) => depuisPolaire(f.F, f.theta));
  const polygone: number[][] = [[0, 0]];
  for (const f of forces) polygone.push(somme(polygone[polygone.length - 1]!, f));
  const R = polygone[polygone.length - 1]!;
  return { forces, R, norme: norme(R), theta: direction(R), polygone };
}

// ---------- N0.6.3 : élingage à deux brins ----------

export interface DonneesElingues {
  P: number; // poids de la charge (kN)
  alpha1: number; // angle du brin gauche avec l'horizontale (°)
  alpha2: number; // angle du brin droit avec l'horizontale (°)
}

export const EXEMPLE_ELINGUES: DonneesElingues = { P: 24, alpha1: 50, alpha2: 50 };

export interface ResultatElingues {
  valide: boolean;
  T1: number; // kN
  T2: number; // kN
  angleSommet: number; // angle entre les brins au crochet (°)
  rapport: number; // tension du brin le plus chargé / poids
}

/**
 * Équilibre du crochet : le câble de la grue tire vers le haut (P), les deux brins tirent vers le bas,
 * vers les points de levage. T1 = P cos α2 / sin(α1 + α2) et T2 = P cos α1 / sin(α1 + α2).
 */
export function elingues(d: DonneesElingues): ResultatElingues {
  const angleSommet = 180 - d.alpha1 - d.alpha2;
  const valide = d.alpha1 > 0 && d.alpha2 > 0 && angleSommet > 0;
  if (!valide) return { valide, T1: NaN, T2: NaN, angleSommet, rapport: NaN };
  // T1 d1 + T2 d2 = (0 ; −P), avec d1 et d2 dirigés du crochet vers les points de levage
  const s = decomposer([0, -d.P], [-cosD(d.alpha1), -sinD(d.alpha1)], [cosD(d.alpha2), -sinD(d.alpha2)])!;
  const [T1, T2] = s;
  return { valide, T1, T2, angleSommet, rapport: Math.max(T1, T2) / d.P };
}

/** Élingage symétrique : tension d'un brin rapportée au poids, en fonction de l'angle au sommet (°). */
export function facteurElingue(angleSommet: number): number {
  return 1 / (2 * cosD(angleSommet / 2));
}

// ---------- N0.6.4 : produit scalaire ----------

/** Travail d'une force constante F (kN) sur un déplacement d (m) : W = F · d (kJ). */
export function travail(F: Vec, d: Vec): number {
  return scalaire(F, d);
}

export interface DonneesEquerrage {
  xA: number; // sommet de l'angle (m)
  yA: number;
  xB: number; // point sur le premier côté (m)
  yB: number;
  xD: number; // point sur le second côté (m)
  yD: number;
}

export const EXEMPLE_EQUERRAGE: DonneesEquerrage = { xA: 100, yA: 200, xB: 112, yB: 200.1, xD: 99.9, yD: 208 };

export interface ResultatEquerrage {
  AB: number[];
  AD: number[];
  produit: number; // m²
  nAB: number;
  nAD: number;
  cos: number;
  theta: number; // angle BAD (°)
  ecart: number; // θ − 90° (°)
  decalage: number; // déplacement de D, perpendiculairement à AD, pour rendre l'angle droit (m)
}

export function equerrage(d: DonneesEquerrage): ResultatEquerrage {
  const AB = vecteurAB([d.xA, d.yA], [d.xB, d.yB]);
  const AD = vecteurAB([d.xA, d.yA], [d.xD, d.yD]);
  const produit = scalaire(AB, AD);
  const nAB = norme(AB);
  const nAD = norme(AD);
  const cos = produit / (nAB * nAD);
  const theta = acosD(cos);
  const ecart = theta - 90;
  return { AB, AD, produit, nAB, nAD, cos, theta, ecart, decalage: nAD * tanD(Math.abs(ecart)) };
}

// ---------- N0.6.5 : moment d'une force ----------

/** Moment en O d'une force F appliquée en A, dans le plan : M = OA × F (positif dans le sens trigonométrique). */
export function moment2D(O: Vec, A: Vec, F: Vec): number {
  return vectoriel2(vecteurAB(O, A), F);
}

/** Moment en O d'une force F appliquée en A, dans l'espace : M = OA × F. */
export function moment3D(O: Vec, A: Vec, F: Vec): Vec3 {
  return vectoriel(vecteurAB(O, A), F);
}

export interface DonneesMoment {
  xA: number; // point d'application (m), le point O étant l'origine
  yA: number;
  F: number; // kN
  theta: number; // direction de la force (°)
}

/** La force du hauban de N0.6.1, appliquée en tête du mât : 12 kN dirigés de A(0 ; 8) vers B(6 ; 0). */
export const EXEMPLE_MOMENT: DonneesMoment = { xA: 0, yA: 8, F: 12, theta: direction([6, -8]) };

export interface ResultatMoment {
  Fv: Vec2;
  M: number; // kN·m
  bras: number; // distance de O à la ligne d'action (m)
  sens: 'trigonométrique' | 'horaire' | 'nul';
}

export function momentForce(d: DonneesMoment): ResultatMoment {
  const Fv = depuisPolaire(d.F, d.theta);
  const M = moment2D([0, 0], [d.xA, d.yA], Fv);
  const nul = Math.abs(M) < 1e-9;
  return { Fv, M: nul ? 0 : M, bras: d.F === 0 ? 0 : Math.abs(M) / d.F, sens: nul ? 'nul' : M > 0 ? 'trigonométrique' : 'horaire' };
}

export interface DonneesPotence {
  bras: number; // longueur du bras horizontal, selon x (m)
  hauteur: number; // hauteur du bras au-dessus du pied, selon z (m)
  P: number; // charge verticale au bout du bras (kN)
  V: number; // effort horizontal du vent au bout du bras, selon y (kN)
}

export const EXEMPLE_POTENCE: DonneesPotence = { bras: 2, hauteur: 5, P: 1.2, V: 0.4 };

/** Moments au pied d'une potence : flexion selon x et y, torsion selon z. */
export function potence(d: DonneesPotence): { r: Vec3; F: Vec3; M: Vec3; flexion: number; torsion: number } {
  const r: Vec3 = [d.bras, 0, d.hauteur];
  const F: Vec3 = [0, d.V, -d.P];
  const M = moment3D([0, 0, 0], r, F);
  return { r, F, M, flexion: Math.hypot(M[0], M[1]), torsion: M[2] };
}

// ---------- N0.6.P : mât haubané ----------

export interface DonneesMat {
  h: number; // hauteur d'attache des haubans (m)
  r: number; // distance horizontale du pied du mât aux ancrages (m)
  H: number; // effort horizontal en tête (kN), donnée de l'énoncé
  psi: number; // direction de cet effort (°)
  phi0: number; // direction du premier ancrage (°) ; les trois ancrages sont à 120° l'un de l'autre
  marge: number; // longueur ajoutée par hauban pour les attaches et le réglage (m), donnée de l'énoncé
}

export const EXEMPLE_MAT: DonneesMat = { h: 12, r: 8, H: 2.5, psi: 270, phi0: 90, marge: 1 };

export interface Hauban {
  phi: number; // direction de l'ancrage vu depuis le pied du mât (°)
  c: number; // composante horizontale de la tension (kN)
  T: number; // tension (kN)
  V: number; // composante verticale (kN) : compression du mât, arrachement de l'ancrage
}

export interface ResultatMat {
  stable: boolean;
  L: number; // longueur d'un hauban entre attache et ancrage (m)
  alpha: number; // angle des haubans avec l'horizontale (°)
  haubans: Hauban[];
  N: number; // compression apportée au mât par les haubans (kN)
  residu: number; // norme du déséquilibre horizontal en tête (kN), nulle si le calcul est juste
  cable: number; // longueur totale de câble à couper (m)
}

/**
 * Répartit une force horizontale cible (norme H, direction τ) entre des câbles de directions φᵢ :
 * seuls les deux câbles qui encadrent τ travaillent (un câble ne pousse pas). Null si aucun couple ne convient.
 */
export function repartirSurCables(phis: readonly number[], tau: number, H: number): number[] | null {
  const ordre = phis.map((phi, i) => ({ phi: mod360(phi), i })).sort((a, b) => a.phi - b.phi);
  const t = mod360(tau);
  for (let k = 0; k < ordre.length; k++) {
    const A = ordre[k]!;
    const B = ordre[(k + 1) % ordre.length]!;
    const g = ordre.length === 1 ? 360 : mod360(B.phi - A.phi) || 360;
    const a = mod360(t - A.phi);
    if (a > g + 1e-9) continue;
    if (g >= 180 - 1e-9) return null; // secteur trop ouvert : aucun câble ne peut retenir la tête
    const cs = phis.map(() => 0);
    cs[A.i] = (H * sinD(g - a)) / sinD(g);
    cs[B.i] = (H * sinD(a)) / sinD(g);
    return cs;
  }
  return null;
}

export function matHaubane(d: DonneesMat): ResultatMat {
  const L = Math.hypot(d.h, d.r);
  const alpha = atanD(d.h / d.r);
  const phis = [0, 120, 240].map((k) => mod360(d.phi0 + k));
  // Les haubans doivent équilibrer l'effort en tête : leurs composantes horizontales valent −H, direction ψ + 180°.
  const cs = repartirSurCables(phis, d.psi + 180, d.H);
  const stable = cs !== null;
  const haubans = phis.map((phi, i) => {
    const ci = cs ? cs[i]! : NaN;
    return { phi, c: ci, T: (ci * L) / d.r, V: (ci * d.h) / d.r };
  });
  const tete = somme(depuisPolaire(d.H, d.psi), ...haubans.map((hb) => depuisPolaire(stable ? hb.c : 0, hb.phi)));
  return {
    stable,
    L,
    alpha,
    haubans,
    N: haubans.reduce((s, hb) => s + hb.V, 0),
    residu: norme(tete),
    cable: 3 * (L + d.marge),
  };
}

export interface EnveloppeMat {
  Tmax: number; // kN
  psiMax: number; // direction de l'effort qui le provoque (°)
  parHauban: Array<{ phi: number; Tmax: number; psi: number }>;
}

/** Balaye toutes les directions de l'effort (pas en degrés) et retient la tension maximale de chaque hauban. */
export function enveloppeMat(d: DonneesMat, pas = 1): EnveloppeMat {
  const base = matHaubane(d);
  const parHauban = base.haubans.map((hb) => ({ phi: hb.phi, Tmax: 0, psi: 0 }));
  for (let psi = 0; psi < 360; psi += pas) {
    const r = matHaubane({ ...d, psi });
    r.haubans.forEach((hb, i) => {
      if (hb.T > parHauban[i]!.Tmax + 1e-9) parHauban[i] = { phi: hb.phi, Tmax: hb.T, psi };
    });
  }
  const pire = parHauban.reduce((m, x) => (x.Tmax > m.Tmax ? x : m));
  return { Tmax: pire.Tmax, psiMax: pire.psi, parHauban };
}
