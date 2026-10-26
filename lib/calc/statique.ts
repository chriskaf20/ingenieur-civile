// Statique (module L1.3) : actions, moments, torseurs, équilibre plan, réactions d'appui, hyperstaticité,
// treillis (nœuds et Ritter), glissement et renversement, centres de gravité, équilibre dans l'espace.
// Convention : x vers la droite, y vers le haut, moments positifs dans le sens trigonométrique. kN, m.
import { resoudre3x3 } from './algebre';
import { combinaisonELU } from './charges';
import { gravite, rectangle, type Morceau } from './geometrie';
import { ferme, type DonneesFerme, type IdNoeud } from './trigo';
import { cosD, sinD } from './trigo';

// ---------- L1.3.1 : actions, charge linéique sur une poutre ----------

/** Charge surfacique d'une couche homogène : γ (kN/m³) × épaisseur (m) = kN/m². */
export function poidsSurfacique(gamma: number, epaisseur: number): number {
  return gamma * epaisseur;
}

export interface DonneesChargePoutre {
  g: number; // charges permanentes du plancher, hors poids propre de la poutre (kN/m²)
  q: number; // charge d'exploitation du plancher (kN/m²)
  e: number; // largeur d'influence, entraxe des poutres (m)
  b: number; // largeur de la retombée de poutre (m)
  h: number; // hauteur de la retombée sous la dalle (m)
  gamma: number; // poids volumique du béton armé (kN/m³)
  L: number; // portée (m)
}

export const EXEMPLE_CHARGE_POUTRE: DonneesChargePoutre = { g: 5.5, q: 2.5, e: 4, b: 0.25, h: 0.35, gamma: 25, L: 5 };

export interface ResultatChargePoutre {
  gDalle: number; // g × e (kN/m)
  pp: number; // poids propre de la retombée γ b h (kN/m)
  G: number; // charge permanente linéique (kN/m)
  Q: number; // charge d'exploitation linéique (kN/m)
  pELU: number; // 1,35 G + 1,5 Q (kN/m)
  RG: number; // résultantes sur la portée (kN)
  RQ: number;
  RELU: number;
}

/** Surface chargée → charge linéique : la poutre reçoit la bande de plancher de largeur e, plus son propre poids. */
export function chargePoutre(d: DonneesChargePoutre): ResultatChargePoutre {
  const gDalle = d.g * d.e;
  const pp = d.gamma * d.b * d.h;
  const G = gDalle + pp;
  const Q = d.q * d.e;
  const pELU = combinaisonELU(G, Q);
  return { gDalle, pp, G, Q, pELU, RG: G * d.L, RQ: Q * d.L, RELU: pELU * d.L };
}

// ---------- L1.3.2 : moment d'une force ----------

export interface DonneesMomentForce {
  xA: number; // point d'application, par rapport au point O (m)
  yA: number;
  F: number; // intensité (kN)
  theta: number; // direction de la force depuis l'axe x (degrés)
}

export const EXEMPLE_MOMENT_FORCE: DonneesMomentForce = { xA: 1.2, yA: 0.4, F: 20, theta: -75 };

export interface ResultatMomentForce {
  Fx: number;
  Fy: number;
  M: number; // moment en O (kN·m), positif dans le sens trigonométrique
  bras: number; // distance de O à la ligne d'action (m)
  OA: number; // distance de O au point d'application, à ne pas confondre avec le bras de levier (m)
  MFx: number; // contribution de Fx : −yA Fx
  MFy: number; // contribution de Fy : xA Fy
}

/** Moment en O d'une force appliquée en A : par les composantes (Varignon) M = xA Fy − yA Fx, et bras de levier d = |M| / F. */
export function momentForceO(d: DonneesMomentForce): ResultatMomentForce {
  const Fx = d.F * cosD(d.theta);
  const Fy = d.F * sinD(d.theta);
  const MFx = -d.yA * Fx;
  const MFy = d.xA * Fy;
  const M = MFx + MFy;
  return { Fx, Fy, M, bras: d.F > 0 ? Math.abs(M) / d.F : 0, OA: Math.hypot(d.xA, d.yA), MFx, MFy };
}

/** Levier : équilibre des moments autour du pivot, F bF = P bP, donc F = P bP / bF (kN). */
export function forceLevier(P: number, bP: number, bF: number): number {
  return (P * bP) / bF;
}

/** Couple de deux forces égales et opposées, de lignes d'action distantes de d : moment F d, le même en tout point. */
export function couple(F: number, d: number): number {
  return F * d;
}

// ---------- L1.3.3 : torseur, réduction d'un système de forces ----------

export interface ForcePlan {
  nom: string;
  x: number; // point d'application (m)
  y: number;
  Fx: number; // composantes (kN)
  Fy: number;
}

export interface ResultatReduction {
  Rx: number;
  Ry: number;
  R: number;
  M: number; // moment résultant au point de réduction (kN·m)
  xCoupe: number | null; // abscisse où la ligne d'action de la résultante coupe l'horizontale du point de réduction
}

/** Réduction d'un système de forces planes au point (x0 ; y0) : résultante et moment résultant. */
export function reduction(forces: readonly ForcePlan[], x0 = 0, y0 = 0): ResultatReduction {
  const Rx = forces.reduce((s, f) => s + f.Fx, 0);
  const Ry = forces.reduce((s, f) => s + f.Fy, 0);
  const M = forces.reduce((s, f) => s + (f.x - x0) * f.Fy - (f.y - y0) * f.Fx, 0);
  // la résultante, placée en (x0 + u ; y0), donne le même moment : u Ry = M
  return { Rx, Ry, R: Math.hypot(Rx, Ry), M, xCoupe: Ry !== 0 ? x0 + M / Ry : null };
}

export interface DonneesSemelleTorseur {
  N: number; // effort vertical descendant du poteau (kN)
  H: number; // effort horizontal (kN), appliqué à la hauteur h au-dessus de la base
  h: number; // m
  B: number; // largeur de la semelle dans le plan du calcul (m)
}

export const EXEMPLE_SEMELLE_TORSEUR: DonneesSemelleTorseur = { N: 600, H: 40, h: 1.2, B: 1.8 };

export interface ResultatSemelleTorseur {
  R: number; // kN
  M: number; // moment au centre de la base (kN·m)
  e: number; // excentricité de l'effort vertical M / N (m)
  tiers: number; // B / 6 (m)
  dansTiersCentral: boolean;
  Bmin: number; // largeur minimale pour que e ≤ B/6 : 6 e (m)
  xR: number; // point de passage de la résultante sur la base, depuis le bord gauche (m)
  angle: number; // inclinaison de la résultante sur la verticale (degrés)
}

/** Torseur au centre de la base d'une semelle : N, H et M = H h ; excentricité e = M / N, comparée à B / 6. */
export function semelleTorseur(d: DonneesSemelleTorseur): ResultatSemelleTorseur {
  const M = d.H * d.h;
  const e = d.N !== 0 ? M / d.N : Infinity;
  const tiers = d.B / 6;
  return { R: Math.hypot(d.N, d.H), M, e, tiers, dansTiersCentral: Math.abs(e) <= tiers, Bmin: 6 * Math.abs(e), xR: d.B / 2 + e, angle: (Math.atan2(d.H, d.N) * 180) / Math.PI };
}

// ---------- L1.3.4 : principe fondamental de la statique ----------

export interface DonneesMarquise {
  L: number; // portée de la marquise, du mur au bout (m)
  alpha: number; // angle du tirant avec la marquise (degrés)
  q: number; // charge répartie (kN/m)
  P: number; // charge en bout (kN)
}

export const EXEMPLE_MARQUISE: DonneesMarquise = { L: 3, alpha: 35, q: 2, P: 1.5 };

export interface ResultatMarquise {
  T: number; // effort dans le tirant (kN), traction
  Tx: number; // composante horizontale (kN)
  Ty: number; // composante verticale (kN)
  HA: number; // réaction horizontale de l'articulation, dirigée vers l'extérieur du mur (kN)
  VA: number; // réaction verticale de l'articulation, vers le haut (kN)
  hauteur: number; // hauteur de l'ancrage du tirant au-dessus de l'articulation (m)
}

/**
 * Marquise articulée au mur en A, tenue en bout B par un tirant ancré dans le mur au-dessus de A.
 * Moments en A : T sin α L = q L²/2 + P L ; ΣFx : HA = T cos α ; ΣFy : VA = q L + P − T sin α.
 */
export function marquise(d: DonneesMarquise): ResultatMarquise {
  const s = sinD(d.alpha);
  const T = ((d.q * d.L * d.L) / 2 + d.P * d.L) / (s * d.L);
  const Tx = T * cosD(d.alpha);
  const Ty = T * s;
  return { T, Tx, Ty, HA: Tx, VA: d.q * d.L + d.P - Ty, hauteur: d.L * Math.tan((d.alpha * Math.PI) / 180) };
}

/**
 * Console triangulée : barre horizontale AB (longueur L) articulée au mur en A, bracon CB articulé au mur en C, à h sous A,
 * charge P en B. Deux barres à deux forces ; nœud B : N(AB) = P L / h (traction), N(CB) = −P √(L² + h²) / h (compression).
 */
export function consoleTriangulee(P: number, L: number, h: number): { NAB: number; NCB: number; longueurBracon: number } {
  const lb = Math.hypot(L, h);
  return { NAB: (P * L) / h, NCB: (-P * lb) / h, longueurBracon: lb };
}

// ---------- L1.3.5 : encastrement ----------

export interface DonneesConsole {
  L: number; // longueur du porte-à-faux (m)
  q: number; // charge répartie (kN/m)
  P: number; // charge ponctuelle (kN)
  a: number; // distance de P à l'encastrement (m)
}

export const EXEMPLE_CONSOLE: DonneesConsole = { L: 1.5, q: 6, P: 2, a: 1.5 };

/** Console encastrée : l'encastrement reprend une force verticale V = q L + P et un moment M = q L²/2 + P a. */
export function consoleEncastree(d: DonneesConsole): { V: number; M: number; Mq: number; MP: number } {
  const Mq = (d.q * d.L * d.L) / 2;
  const MP = d.P * d.a;
  return { V: d.q * d.L + d.P, M: Mq + MP, Mq, MP };
}

// ---------- L1.3.6 : réactions d'appui d'une poutre ----------

export type ChargePoutre =
  | { type: 'ponctuelle'; nom: string; F: number; a: number } // F vers le bas (kN), en x = a (m)
  | { type: 'repartie'; nom: string; q1: number; q2: number; a: number; b: number }; // de q1 en x = a à q2 en x = b (kN/m)

/** Résultante d'une charge (kN) et son abscisse (m) ; trapèze : x = a + (b − a)(q1 + 2 q2) / (3 (q1 + q2)). */
export function resultanteCharge(c: ChargePoutre): { R: number; x: number } {
  if (c.type === 'ponctuelle') return { R: c.F, x: c.a };
  const l = c.b - c.a;
  const R = ((c.q1 + c.q2) * l) / 2;
  const x = c.q1 + c.q2 !== 0 ? c.a + (l * (c.q1 + 2 * c.q2)) / (3 * (c.q1 + c.q2)) : c.a + l / 2;
  return { R, x };
}

export interface ResultatReactions {
  parties: Array<{ nom: string; R: number; x: number }>;
  Rtot: number;
  MA: number; // moment des charges par rapport à l'appui A (kN·m)
  RA: number; // réactions verticales, positives vers le haut (kN)
  RB: number;
}

/** Poutre sur deux appuis en xA et xB (porte-à-faux possibles) : moments en A pour RB, puis ΣFy = 0 pour RA. */
export function reactionsAppuis(xA: number, xB: number, charges: readonly ChargePoutre[]): ResultatReactions {
  const parties = charges.map((c) => ({ nom: c.nom, ...resultanteCharge(c) }));
  const Rtot = parties.reduce((s, p) => s + p.R, 0);
  const MA = parties.reduce((s, p) => s + p.R * (p.x - xA), 0);
  const RB = MA / (xB - xA);
  return { parties, Rtot, MA, RA: Rtot - RB, RB };
}

export interface DonneesPoutreConsole {
  L: number; // longueur totale (m)
  xB: number; // position de l'appui B ; A est en x = 0 (m)
  q: number; // charge uniforme sur toute la longueur (kN/m)
  P: number; // charge ponctuelle (kN)
  a: number; // position de P (m)
}

export const EXEMPLE_POUTRE_CONSOLE: DonneesPoutreConsole = { L: 7, xB: 5.5, q: 12, P: 20, a: 7 };

/** Poutre avec porte-à-faux : charge uniforme sur toute la longueur et charge ponctuelle. */
export function poutreConsole(d: DonneesPoutreConsole): ResultatReactions {
  return reactionsAppuis(0, d.xB, [
    { type: 'repartie', nom: 'charge uniforme', q1: d.q, q2: d.q, a: 0, b: d.L },
    { type: 'ponctuelle', nom: 'charge ponctuelle', F: d.P, a: d.a },
  ]);
}

/** Charge maximale en bout de porte-à-faux (a > xB) avant soulèvement de A : R_A ≥ 0 ⟺ P ≤ q L (xB − L/2) / (a − xB). */
export function chargeMaxSansSoulevement(d: DonneesPoutreConsole): number {
  return d.a > d.xB ? (d.q * d.L * (d.xB - d.L / 2)) / (d.a - d.xB) : Infinity;
}

// ---------- L1.3.7 : isostatique ou hyperstatique ----------

export type Nature = 'hypostatique' | 'isostatique' | 'hyperstatique';

const nature = (h: number): Nature => (h < 0 ? 'hypostatique' : h === 0 ? 'isostatique' : 'hyperstatique');

/** Structure plane de p solides : h = inconnues de liaison (extérieures + intérieures) − 3 p équations. */
export function degreHyperstaticite(r: number, p: number, internes: number): { inconnues: number; equations: number; h: number; nature: Nature } {
  const inconnues = r + internes;
  const equations = 3 * p;
  return { inconnues, equations, h: inconnues - equations, nature: nature(inconnues - equations) };
}

/** Treillis plan articulé : h = b + r − 2n (b barres, r réactions, n nœuds). */
export function degreTreillis(b: number, r: number, n: number): { h: number; nature: Nature } {
  const h = b + r - 2 * n;
  return { h, nature: nature(h) };
}

export interface StructureType {
  id: string;
  nom: string;
  r: number; // inconnues de liaison avec le sol
  p: number; // solides
  internes: number; // inconnues des liaisons entre solides (2 par rotule)
}

export const STRUCTURES_TYPES: readonly StructureType[] = [
  { id: 'deuxRouleaux', nom: 'poutre sur deux appuis simples', r: 2, p: 1, internes: 0 },
  { id: 'deuxAppuis', nom: 'poutre sur articulation et appui simple', r: 3, p: 1, internes: 0 },
  { id: 'console', nom: 'poutre console encastrée', r: 3, p: 1, internes: 0 },
  { id: 'encastreeAppuyee', nom: 'poutre encastrée et appuyée', r: 4, p: 1, internes: 0 },
  { id: 'continue', nom: 'poutre continue sur trois appuis', r: 4, p: 1, internes: 0 },
  { id: 'biEncastree', nom: 'poutre encastrée aux deux bouts', r: 6, p: 1, internes: 0 },
  { id: 'gerber', nom: 'poutre console avec rotule (Gerber)', r: 4, p: 2, internes: 2 },
  { id: 'portiqueArticule', nom: 'portique articulé en pied', r: 4, p: 1, internes: 0 },
  { id: 'portiqueEncastre', nom: 'portique encastré en pied', r: 6, p: 1, internes: 0 },
  { id: 'troisRotules', nom: 'portique à trois articulations', r: 4, p: 2, internes: 2 },
];

// ---------- L1.3.8 : treillis, méthode des nœuds ----------

export interface NoeudT {
  id: string;
  x: number;
  y: number;
}
export interface BarreT {
  id: string;
  de: string;
  a: string;
}
export interface AppuiT {
  noeud: string;
  type: 'articulation' | 'appuiSimple'; // appui simple : réaction verticale seule
}
export interface ChargeT {
  noeud: string;
  Fx: number; // kN
  Fy: number; // kN, négatif vers le bas
}
export interface DonneesTreillis {
  noeuds: readonly NoeudT[];
  barres: readonly BarreT[];
  appuis: readonly AppuiT[];
  charges: readonly ChargeT[];
}
export interface ResultatTreillis {
  efforts: Record<string, number>; // effort normal (kN), traction positive
  longueurs: Record<string, number>; // m
  reactions: Array<{ noeud: string; Rx: number; Ry: number }>;
  degre: number; // b + r − 2n
  valide: boolean; // false si le système est un mécanisme ou n'est pas isostatique
}

/** Résolution d'un système linéaire carré par la méthode de Gauss avec pivot partiel ; null si singulier. */
export function resoudreLineaire(A: readonly (readonly number[])[], b: readonly number[]): number[] | null {
  const n = b.length;
  const M = A.map((ligne, i) => [...ligne, b[i]!]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(M[i]![c]!) > Math.abs(M[p]![c]!)) p = i;
    if (Math.abs(M[p]![c]!) < 1e-12) return null;
    [M[c], M[p]] = [M[p]!, M[c]!];
    for (let i = 0; i < n; i++) {
      if (i === c) continue;
      const k = M[i]![c]! / M[c]![c]!;
      for (let j = c; j <= n; j++) M[i]![j]! -= k * M[c]![j]!;
    }
  }
  return M.map((ligne, i) => ligne[n]! / ligne[i]!);
}

/**
 * Méthode des nœuds : en chaque nœud, Σ N (vecteur unitaire vers l'autre extrémité) + réactions + charges = 0.
 * 2n équations, b efforts et r réactions inconnus : on résout le système complet (treillis isostatique).
 */
export type InconnueTreillis = { type: 'barre'; id: string } | { type: 'R'; noeud: string; dir: 'x' | 'y' };

/**
 * Assemblage du système A s = B de la méthode des nœuds : deux équations par nœud (ΣFx puis ΣFy, dans l'ordre des nœuds),
 * une inconnue par barre (effort normal, traction positive) puis par composante de réaction.
 */
export function systemeTreillis(d: DonneesTreillis) {
  const index = new Map(d.noeuds.map((n, i) => [n.id, i]));
  const n = d.noeuds.length;
  const inconnues: InconnueTreillis[] = [
    ...d.barres.map((b) => ({ type: 'barre' as const, id: b.id })),
    ...d.appuis.flatMap((a) => (a.type === 'articulation' ? [{ type: 'R' as const, noeud: a.noeud, dir: 'x' as const }, { type: 'R' as const, noeud: a.noeud, dir: 'y' as const }] : [{ type: 'R' as const, noeud: a.noeud, dir: 'y' as const }])),
  ];
  const degre = inconnues.length - 2 * n;
  const longueurs: Record<string, number> = {};
  const A = Array.from({ length: 2 * n }, () => new Array<number>(inconnues.length).fill(0));
  const B = new Array<number>(2 * n).fill(0);
  d.barres.forEach((b, j) => {
    const i1 = index.get(b.de)!;
    const i2 = index.get(b.a)!;
    const P1 = d.noeuds[i1]!;
    const P2 = d.noeuds[i2]!;
    const L = Math.hypot(P2.x - P1.x, P2.y - P1.y);
    longueurs[b.id] = L;
    const ux = (P2.x - P1.x) / L;
    const uy = (P2.y - P1.y) / L;
    A[2 * i1]![j] = ux; // la barre tendue tire le nœud 1 vers le nœud 2
    A[2 * i1 + 1]![j] = uy;
    A[2 * i2]![j] = -ux;
    A[2 * i2 + 1]![j] = -uy;
  });
  inconnues.forEach((u, j) => {
    if (u.type !== 'R') return;
    const i = index.get(u.noeud)!;
    A[2 * i + (u.dir === 'x' ? 0 : 1)]![j] = 1;
  });
  for (const c of d.charges) {
    const i = index.get(c.noeud)!;
    B[2 * i] = B[2 * i]! - c.Fx;
    B[2 * i + 1] = B[2 * i + 1]! - c.Fy;
  }
  return { A, B, inconnues, longueurs, degre };
}

export function treillis(d: DonneesTreillis): ResultatTreillis {
  const { A, B, inconnues, longueurs, degre } = systemeTreillis(d);
  const vide = { efforts: {}, longueurs, reactions: [], degre, valide: false };
  if (degre !== 0) return vide;
  const s = resoudreLineaire(A, B);
  if (!s) return vide;
  const efforts: Record<string, number> = {};
  const reactions = d.appuis.map((a) => ({ noeud: a.noeud, Rx: 0, Ry: 0 }));
  inconnues.forEach((u, j) => {
    const v = Math.abs(s[j]!) < 1e-9 ? 0 : s[j]!;
    if (u.type === 'barre') efforts[u.id] = v;
    else {
      const r = reactions.find((x) => x.noeud === u.noeud)!;
      if (u.dir === 'x') r.Rx = v;
      else r.Ry = v;
    }
  });
  return { efforts, longueurs, reactions, degre, valide: true };
}

export interface DonneesPratt {
  n: number; // nombre de panneaux (pair)
  a: number; // longueur d'un panneau (m)
  h: number; // hauteur du treillis (m)
  P: number; // charge à chaque nœud intérieur de la membrure inférieure (kN)
}

export const EXEMPLE_PRATT: DonneesPratt = { n: 4, a: 3, h: 3, P: 20 };

/** Poutre treillis de type Pratt (passerelle) : membrures, montants, diagonales descendant vers le milieu. */
export function geometriePratt(d: DonneesPratt): DonneesTreillis {
  const n = Math.max(2, 2 * Math.round(d.n / 2));
  const noeuds: NoeudT[] = [...Array.from({ length: n + 1 }, (_, i) => ({ id: `B${i}`, x: i * d.a, y: 0 })), ...Array.from({ length: n - 1 }, (_, i) => ({ id: `T${i + 1}`, x: (i + 1) * d.a, y: d.h }))];
  const barres: BarreT[] = [];
  for (let i = 1; i <= n; i++) barres.push({ id: `inf${i}`, de: `B${i - 1}`, a: `B${i}` });
  for (let i = 1; i <= n - 2; i++) barres.push({ id: `sup${i + 1}`, de: `T${i}`, a: `T${i + 1}` });
  for (let i = 1; i <= n - 1; i++) barres.push({ id: `mont${i}`, de: `B${i}`, a: `T${i}` });
  for (let k = 1; k <= n; k++) {
    if (k === 1) barres.push({ id: 'diag1', de: 'B0', a: 'T1' });
    else if (k === n) barres.push({ id: `diag${n}`, de: `B${n}`, a: `T${n - 1}` });
    else if (k <= n / 2) barres.push({ id: `diag${k}`, de: `T${k - 1}`, a: `B${k}` });
    else barres.push({ id: `diag${k}`, de: `T${k}`, a: `B${k - 1}` });
  }
  const charges: ChargeT[] = Array.from({ length: n - 1 }, (_, i) => ({ noeud: `B${i + 1}`, Fx: 0, Fy: -d.P }));
  return { noeuds, barres, appuis: [{ noeud: 'B0', type: 'articulation' }, { noeud: `B${n}`, type: 'appuiSimple' }], charges };
}

// ---------- L1.3.9 : méthode des sections (Ritter) ----------

export interface ResultatRitter {
  k: number; // panneau étudié (côté gauche ou milieu)
  RA: number; // kN
  Mgauche: number; // moment fléchissant au droit du nœud gauche du panneau (kN·m)
  Mdroite: number; // au droit du nœud droit (kN·m)
  V: number; // effort tranchant dans le panneau (kN)
  Nsup: number | null; // membrure supérieure (null dans le panneau d'about)
  Ninf: number; // membrure inférieure
  Ndiag: number; // diagonale
  sinDiag: number;
}

/**
 * Panneau k (de 1 à n/2) d'une poutre Pratt chargée en membrure inférieure : coupe à travers les trois barres du panneau.
 * Moment autour du nœud inférieur droit : Nsup = −M(k a) / h ; autour du nœud supérieur gauche : Ninf = M((k − 1) a) / h ;
 * projection verticale : Ndiag = V / sin θ (θ, inclinaison de la diagonale).
 */
export function ritterPratt(d: DonneesPratt, kDemande: number): ResultatRitter {
  const n = Math.max(2, 2 * Math.round(d.n / 2));
  const k = Math.max(1, Math.min(Math.round(kDemande), n / 2));
  const RA = ((n - 1) * d.P) / 2;
  const M = (x: number) => RA * x - Array.from({ length: n - 1 }, (_, i) => (i + 1) * d.a).reduce((s, xi) => s + (xi < x ? d.P * (x - xi) : 0), 0);
  const V = RA - (k - 1) * d.P;
  const sinDiag = d.h / Math.hypot(d.a, d.h);
  const Mgauche = M((k - 1) * d.a);
  const Mdroite = M(k * d.a);
  // panneau d'about : la « diagonale » B0–T1 monte vers l'intérieur et travaille en compression
  const Ndiag = k === 1 ? -V / sinDiag : V / sinDiag;
  return { k, RA, Mgauche, Mdroite, V, Nsup: k === 1 ? null : -Mdroite / d.h, Ninf: k === 1 ? Mdroite / d.h : Mgauche / d.h, Ndiag, sinDiag };
}

// ---------- L1.3.10 : glissement et renversement d'un mur poids ----------

export interface DonneesMurPoids {
  H: number; // hauteur (m)
  b: number; // largeur en tête (m)
  B: number; // largeur à la base (m) ; parement aval incliné, parement amont vertical
  gamma: number; // poids volumique du matériau du mur (kN/m³)
  Q: number; // poussée horizontale des terres, par mètre de mur (kN/m), donnée de l'énoncé
  zQ: number; // hauteur d'application de la poussée au-dessus de la base (m)
  mu: number; // coefficient de frottement entre la base et le sol, donnée de l'énoncé
}

export const EXEMPLE_MUR_POIDS: DonneesMurPoids = { H: 3, b: 0.5, B: 1.6, gamma: 24, Q: 30, zQ: 1, mu: 0.55 };

/** Coefficient de sécurité global de l'ancienne pratique, retenu ici comme repère (règle de l'art, à vérifier). */
export const FS_REPERE_MUR = 1.5;

export interface ResultatMurPoids {
  W1: number; // partie rectangulaire, sous la tête (kN/m)
  x1: number; // bras de levier par rapport à l'arête aval O (m)
  W2: number; // partie triangulaire (kN/m)
  x2: number;
  W: number;
  Ms: number; // moment stabilisant autour de O (kN·m/m)
  Mr: number; // moment renversant (kN·m/m)
  FSr: number; // Ms / Mr
  Fmax: number; // frottement mobilisable μ W (kN/m)
  FSg: number; // μ W / Q
  xN: number; // point de passage de la réaction du sol depuis O (m)
  e: number; // excentricité par rapport au milieu de la base (m)
  tiers: number; // B / 6
}

/** Mur poids trapézoïdal : moments autour de l'arête aval O (renversement) et frottement à la base (glissement). */
export function murPoids(d: DonneesMurPoids): ResultatMurPoids {
  const W1 = d.gamma * d.b * d.H;
  const x1 = d.B - d.b / 2;
  const W2 = (d.gamma * (d.B - d.b) * d.H) / 2;
  const x2 = (2 * (d.B - d.b)) / 3;
  const W = W1 + W2;
  const Ms = W1 * x1 + W2 * x2;
  const Mr = d.Q * d.zQ;
  const Fmax = d.mu * W;
  const xN = (Ms - Mr) / W;
  return { W1, x1, W2, x2, W, Ms, Mr, FSr: Ms / Mr, Fmax, FSg: Fmax / d.Q, xN, e: d.B / 2 - xN, tiers: d.B / 6 };
}

/** Largeur de base minimale pour atteindre un coefficient de glissement FS (b et H fixés) : μ γ H (b + B)/2 ≥ FS Q. */
export function baseMinGlissement(d: DonneesMurPoids, FS: number): number {
  return (2 * FS * d.Q) / (d.mu * d.gamma * d.H) - d.b;
}

// ---------- L1.3.11 : centre de gravité d'une section composée ----------

export interface DonneesCaniveau {
  B: number; // largeur extérieure (cm)
  H: number; // hauteur extérieure (cm)
  e: number; // épaisseur des parois (cm)
  ef: number; // épaisseur du radier (cm)
}

export const EXEMPLE_CANIVEAU: DonneesCaniveau = { B: 80, H: 70, e: 12, ef: 15 };

/** Caniveau en U : centre de gravité par trois rectangles pleins, puis par un rectangle plein moins un trou. */
export function caniveauU(d: DonneesCaniveau): { morceaux: Morceau[]; A: number; Sx: number; yG: number; trou: { morceaux: Morceau[]; A: number; Sx: number; yG: number } } {
  const hp = d.H - d.ef;
  const morceaux = [rectangle('radier', 0, 0, d.B, d.ef), rectangle('paroi gauche', 0, d.ef, d.e, hp), rectangle('paroi droite', d.B - d.e, d.ef, d.e, hp)];
  const g = gravite(morceaux);
  const mt = [rectangle('rectangle plein', 0, 0, d.B, d.H), rectangle('vide intérieur', d.e, d.ef, d.B - 2 * d.e, hp, true)];
  const gt = gravite(mt);
  return { morceaux, A: g.A, Sx: g.Sx, yG: g.yG, trou: { morceaux: mt, A: gt.A, Sx: gt.Sx, yG: gt.yG } };
}

export interface PartiePesante {
  nom: string;
  gamma: number; // poids volumique (kN/m³)
  x0: number; // coin inférieur gauche de la section (m)
  y0: number;
  b: number; // largeur (m)
  h: number; // hauteur (m)
}

/** Centre de gravité des poids d'éléments rectangulaires de matériaux différents, par mètre de longueur : on pondère par W = γ b h. */
export function centrePoids(parties: readonly PartiePesante[]): { poids: Array<{ nom: string; W: number; x: number; y: number }>; W: number; xG: number; yG: number } {
  const poids = parties.map((p) => ({ nom: p.nom, W: p.gamma * p.b * p.h, x: p.x0 + p.b / 2, y: p.y0 + p.h / 2 }));
  const g = gravite(poids.map((q) => ({ nom: q.nom, A: q.W, x: q.x, y: q.y })));
  return { poids, W: g.A, xG: g.xG, yG: g.yG };
}

// ---------- L1.3.12 : équilibre dans l'espace ----------

export interface PointCharge {
  nom: string;
  x: number; // m
  y: number;
  F: number; // kN, vers le bas
}

export interface DonneesTroisAppuis {
  appuis: readonly [PointCharge, PointCharge, PointCharge]; // F ignoré
  charges: readonly PointCharge[];
}

export const EXEMPLE_TROIS_APPUIS: DonneesTroisAppuis = {
  appuis: [
    { nom: 'A', x: 0, y: 0, F: 0 },
    { nom: 'B', x: 4, y: 0, F: 0 },
    { nom: 'C', x: 2, y: 3.5, F: 0 },
  ],
  charges: [
    { nom: 'cuve pleine', x: 2, y: 1.5, F: 240 },
    { nom: 'pompe', x: 3, y: 0.5, F: 12 },
  ],
};

/** Plateau posé sur trois appuis verticaux : ΣFz = 0, ΣMx = 0, ΣMy = 0, trois équations pour trois réactions. */
export function troisAppuis(d: DonneesTroisAppuis): { R: [number, number, number]; Ftot: number; Mx: number; My: number } | null {
  const Ftot = d.charges.reduce((s, c) => s + c.F, 0);
  const My = d.charges.reduce((s, c) => s + c.F * c.x, 0); // Σ F x
  const Mx = d.charges.reduce((s, c) => s + c.F * c.y, 0); // Σ F y
  const [a, b, c] = d.appuis;
  const s = resoudre3x3(
    [
      [1, 1, 1],
      [a.x, b.x, c.x],
      [a.y, b.y, c.y],
    ],
    [Ftot, My, Mx],
  );
  return s ? { R: [s[0]!, s[1]!, s[2]!], Ftot, Mx, My } : null;
}

// ---------- L1.3.P : ferme de toiture en bois ----------

export interface DonneesFermeEfforts {
  ferme: DonneesFerme;
  g: number; // charges permanentes de toiture en projection horizontale (kN/m²), donnée de l'énoncé
  q: number; // charge d'entretien en projection horizontale (kN/m²), donnée de l'énoncé
}

export const EXEMPLE_FERME_EFFORTS: DonneesFermeEfforts = { ferme: { L: 8, alpha: 30, debord: 0.5, longueurBatiment: 12, entraxe: 3 }, g: 0.4, q: 0.5 };

export const BARRES_FERME: ReadonlyArray<{ id: string; de: IdNoeud; a: IdNoeud; nom: string }> = [
  { id: 'A-M1', de: 'A', a: 'M1', nom: 'arbalétrier bas gauche' },
  { id: 'M1-S', de: 'M1', a: 'S', nom: 'arbalétrier haut gauche' },
  { id: 'S-M2', de: 'S', a: 'M2', nom: 'arbalétrier haut droit' },
  { id: 'M2-B', de: 'M2', a: 'B', nom: 'arbalétrier bas droit' },
  { id: 'A-D1', de: 'A', a: 'D1', nom: 'entrait gauche' },
  { id: 'D1-D2', de: 'D1', a: 'D2', nom: 'entrait central' },
  { id: 'D2-B', de: 'D2', a: 'B', nom: 'entrait droit' },
  { id: 'D1-M1', de: 'D1', a: 'M1', nom: 'diagonale courte gauche' },
  { id: 'D1-S', de: 'D1', a: 'S', nom: 'diagonale longue gauche' },
  { id: 'D2-S', de: 'D2', a: 'S', nom: 'diagonale longue droite' },
  { id: 'D2-M2', de: 'D2', a: 'M2', nom: 'diagonale courte droite' },
];

export interface ResultatFermeEfforts {
  p: number; // charge ELU par mètre de ferme, en plan (kN/m)
  Pnoeud: number; // charge ELU par nœud intérieur de l'arbalétrier (kN)
  Prive: number; // charge ELU aux nœuds d'appui (kN)
  Ptot: number; // charge ELU totale (kN)
  treillis: DonneesTreillis;
  resultat: ResultatTreillis;
}

/**
 * Ferme en W : charges réparties ramenées aux nœuds de l'arbalétrier (L/4 de toiture en plan par nœud intérieur,
 * L/8 aux appuis), combinaison 1,35 G + 1,5 Q, puis méthode des nœuds sur les 11 barres.
 */
export function fermeEfforts(d: DonneesFermeEfforts): ResultatFermeEfforts {
  const f = ferme(d.ferme);
  const pELU = combinaisonELU(d.g, d.q) * d.ferme.entraxe; // kN par m de ferme en plan
  const Pnoeud = (pELU * d.ferme.L) / 4;
  const Prive = Pnoeud / 2;
  const ids: IdNoeud[] = ['A', 'D1', 'D2', 'B', 'M1', 'S', 'M2'];
  const t: DonneesTreillis = {
    noeuds: ids.map((id) => ({ id, x: f.noeuds[id].x, y: f.noeuds[id].y })),
    barres: BARRES_FERME.map((b) => ({ id: b.id, de: b.de, a: b.a })),
    appuis: [
      { noeud: 'A', type: 'articulation' },
      { noeud: 'B', type: 'appuiSimple' },
    ],
    charges: [
      { noeud: 'A', Fx: 0, Fy: -Prive },
      { noeud: 'M1', Fx: 0, Fy: -Pnoeud },
      { noeud: 'S', Fx: 0, Fy: -Pnoeud },
      { noeud: 'M2', Fx: 0, Fy: -Pnoeud },
      { noeud: 'B', Fx: 0, Fy: -Prive },
    ],
  };
  return { p: pELU, Pnoeud, Prive, Ptot: 3 * Pnoeud + 2 * Prive, treillis: t, resultat: treillis(t) };
}
