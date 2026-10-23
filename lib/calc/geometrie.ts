// Module N0.5 — Géométrie plane et dans l'espace (fonctions pures). Longueurs en m, angles en degrés.
import { arrondiSup } from '@/lib/format';
import { atanD, cosD, enDeg, sinD, type Point2D } from './trigo';

// ---------- Figures planes (N0.5.1) ----------

export const aireRectangle = (L: number, l: number) => L * l;
export const aireTriangle = (b: number, h: number) => (b * h) / 2;
export const aireTrapeze = (B: number, b: number, h: number) => ((B + b) * h) / 2;
export const aireDisque = (r: number) => Math.PI * r * r;
export const perimetreCercle = (r: number) => 2 * Math.PI * r;
/** Secteur de rayon r et d'angle θ (degrés) : aire et longueur d'arc. */
export function secteur(r: number, theta: number): { aire: number; arc: number } {
  return { aire: (Math.PI * r * r * theta) / 360, arc: (2 * Math.PI * r * theta) / 360 };
}

/** Aire d'un triangle par ses trois côtés (formule de Héron). Null si le triangle n'existe pas. */
export function aireHeron(a: number, b: number, c: number): number | null {
  const p = (a + b + c) / 2;
  const q = p * (p - a) * (p - b) * (p - c);
  return q > 0 ? Math.sqrt(q) : null;
}

/** Aire signée d'un polygone (formule du lacet) : positive si les sommets tournent dans le sens trigonométrique. */
export function aireSignee(pts: readonly Point2D[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const P = pts[i]!;
    const Q = pts[(i + 1) % pts.length]!;
    s += P.x * Q.y - Q.x * P.y;
  }
  return s / 2;
}

/** Termes x_i y_{i+1} − x_{i+1} y_i de la formule du lacet, dans l'ordre des sommets. */
export function termesLacet(pts: readonly Point2D[]): number[] {
  return pts.map((P, i) => {
    const Q = pts[(i + 1) % pts.length]!;
    return P.x * Q.y - Q.x * P.y;
  });
}

export function airePolygone(pts: readonly Point2D[]): number {
  return Math.abs(aireSignee(pts));
}

export function perimetrePolygone(pts: readonly Point2D[]): number {
  return pts.reduce((s, P, i) => {
    const Q = pts[(i + 1) % pts.length]!;
    return s + Math.hypot(Q.x - P.x, Q.y - P.y);
  }, 0);
}

// ---------- Dalle en L avec trémie (exemple de N0.5.1) ----------

export interface DonneesDalleL {
  L1: number; // longueur de la grande aile (m)
  l1: number; // largeur de la grande aile (m)
  L2: number; // longueur de la petite aile (m), L2 ≤ L1
  l2: number; // largeur de la petite aile (m)
  a: number; // trémie (m)
  b: number; // trémie (m)
  e: number; // épaisseur (m)
}

export const EXEMPLE_DALLE_L: DonneesDalleL = { L1: 9, l1: 4, L2: 4, l2: 3.5, a: 2.6, b: 1.1, e: 0.15 };

export interface ResultatDalleL {
  A1: number;
  A2: number;
  At: number;
  A: number; // aire nette (m²)
  perimetre: number; // contour extérieur (m)
  perimetreTremie: number; // m
  V: number; // béton (m³)
  valide: boolean;
}

/** Dalle en L : grande aile L1 × l1, petite aile L2 × l2 accolée sur la longueur, moins une trémie a × b. */
export function dalleL(d: DonneesDalleL): ResultatDalleL {
  const A1 = aireRectangle(d.L1, d.l1);
  const A2 = aireRectangle(d.L2, d.l2);
  const At = aireRectangle(d.a, d.b);
  const A = A1 + A2 - At;
  return {
    A1,
    A2,
    At,
    A,
    perimetre: 2 * (d.L1 + d.l1 + d.l2),
    perimetreTremie: 2 * (d.a + d.b),
    V: A * d.e,
    valide: d.L2 <= d.L1 && d.a < d.L1 && d.b < d.l1,
  };
}

// ---------- Thalès et similitude (N0.5.2) ----------

/** Hauteur d'un objet par son ombre : les rayons du soleil sont parallèles, les triangles sont semblables. */
export function hauteurParOmbre(hBaton: number, ombreBaton: number, ombreObjet: number): { H: number; k: number } {
  const k = ombreObjet / ombreBaton;
  return { H: hBaton * k, k };
}

/** Similitude de rapport k : longueurs × k, aires × k², volumes × k³. */
export function similitude(k: number): { longueurs: number; aires: number; volumes: number } {
  return { longueurs: k, aires: k * k, volumes: k ** 3 };
}

// ---------- Solides (N0.5.3) ----------

export interface Solide {
  V: number; // m³
  Slat: number; // surface latérale (m²)
  Stot: number; // surface totale (m²)
}

export function pave(L: number, l: number, h: number): Solide {
  const Slat = 2 * (L + l) * h;
  return { V: L * l * h, Slat, Stot: Slat + 2 * L * l };
}

export function cylindre(r: number, h: number): Solide {
  const Slat = 2 * Math.PI * r * h;
  return { V: Math.PI * r * r * h, Slat, Stot: Slat + 2 * Math.PI * r * r };
}

/** Cône de révolution : génératrice g = √(r² + h²). */
export function cone(r: number, h: number): Solide & { g: number } {
  const g = Math.hypot(r, h);
  const Slat = Math.PI * r * g;
  return { V: (Math.PI * r * r * h) / 3, Slat, Stot: Slat + Math.PI * r * r, g };
}

/** Tronc de cône de rayons R (bas) et r (haut). */
export function troncCone(R: number, r: number, h: number): Solide & { g: number } {
  const g = Math.hypot(R - r, h);
  const Slat = Math.PI * (R + r) * g;
  return { V: ((Math.PI * h) / 3) * (R * R + R * r + r * r), Slat, Stot: Slat + Math.PI * (R * R + r * r), g };
}

export const pyramide = (Abase: number, h: number) => (Abase * h) / 3;
export const sphere = (r: number) => ({ V: (4 / 3) * Math.PI * r ** 3, S: 4 * Math.PI * r * r });

/**
 * Tronc de pyramide à bases rectangulaires a1 × b1 (bas) et a2 × b2 (haut), hauteur h :
 * formule des prismatoïdes V = h/6 × (A1 + A2 + 4 Am), Am étant la section à mi-hauteur. Exacte.
 */
export function troncPyramideRect(a1: number, b1: number, a2: number, b2: number, h: number): number {
  const Am = ((a1 + a2) / 2) * ((b1 + b2) / 2);
  return (h / 6) * (a1 * b1 + a2 * b2 + 4 * Am);
}

export interface DonneesFouille {
  a: number; // fond (m)
  b: number; // fond (m)
  H: number; // profondeur (m)
  n: number; // talus n pour 1 (base pour hauteur)
}

export const EXEMPLE_FOUILLE: DonneesFouille = { a: 1.6, b: 1.6, H: 1.2, n: 0.5 };

export interface ResultatFouille {
  aSup: number;
  bSup: number;
  Afond: number;
  Asup: number;
  Amilieu: number;
  V: number; // exact (prismatoïde)
  Vmoyenne: number; // approximation « moyenne des aires extrêmes » (par excès)
  ecart: number; // relatif
}

/** Fouille à parois talutées : le haut s'élargit de n H de chaque côté. */
export function fouilleTalutee(d: DonneesFouille): ResultatFouille {
  const aSup = d.a + 2 * d.n * d.H;
  const bSup = d.b + 2 * d.n * d.H;
  const V = troncPyramideRect(d.a, d.b, aSup, bSup, d.H);
  const Afond = d.a * d.b;
  const Asup = aSup * bSup;
  const Vmoyenne = ((Afond + Asup) / 2) * d.H;
  return { aSup, bSup, Afond, Asup, Amilieu: ((d.a + aSup) / 2) * ((d.b + bSup) / 2), V, Vmoyenne, ecart: (Vmoyenne - V) / V };
}

// ---------- Repérage (N0.5.4) ----------

export function polaireVersCart(r: number, theta: number): Point2D {
  return { x: r * cosD(theta), y: r * sinD(theta) };
}

/** Coordonnées polaires : r ≥ 0 et θ dans [0 ; 360[ (degrés, depuis l'axe x, sens trigonométrique). */
export function cartVersPolaire(x: number, y: number): { r: number; theta: number } {
  return { r: Math.hypot(x, y), theta: (enDeg(Math.atan2(y, x)) + 360) % 360 };
}

export interface ResultatSegment {
  dx: number;
  dy: number;
  d: number;
  theta: number; // direction de A vers B (degrés, sens trigonométrique depuis x)
  pente: number; // dy/dx (Infinity si vertical)
  milieu: Point2D;
}

export function segment(A: Point2D, B: Point2D): ResultatSegment {
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  return { dx, dy, d: Math.hypot(dx, dy), theta: cartVersPolaire(dx, dy).theta, pente: dy / dx, milieu: { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 } };
}

/** Rayonnement : point visé depuis une station S à la distance d et dans la direction θ. */
export function rayonnement(S: Point2D, d: number, theta: number): Point2D {
  const v = polaireVersCart(d, theta);
  return { x: S.x + v.x, y: S.y + v.y };
}

// ---------- Projections : massif à section en L (N0.5.5) ----------

export interface DonneesMassif {
  L: number; // longueur totale (vue de face)
  h1: number; // hauteur de la partie basse
  a: number; // longueur de la partie haute
  h2: number; // surélévation de la partie haute
  P: number; // profondeur (vue de dessus)
}

export const EXEMPLE_MASSIF: DonneesMassif = { L: 1.8, h1: 0.4, a: 0.8, h2: 0.6, P: 1.0 };

export interface ResultatMassif {
  section: number; // aire de la vue de face (m²)
  V: number; // m³
  H: number; // hauteur totale
  coffrage: number; // surfaces verticales à coffrer (m²) : deux faces avant/arrière + pourtour vertical
}

/** Prisme dont la section (vue de face) est en L : V = aire de la section × profondeur. */
export function massifL(d: DonneesMassif): ResultatMassif {
  const section = d.L * d.h1 + d.a * d.h2;
  const H = d.h1 + d.h2;
  // pourtour vertical : bout bas (h1), marche (h2), bout haut (H)
  const coffrage = 2 * section + (d.h1 + d.h2 + H) * d.P;
  return { section, V: section * d.P, H, coffrage };
}

// ---------- Centre de gravité (N0.5.6) ----------

export interface Morceau {
  nom: string;
  A: number; // aire (m² ou cm²), négative pour un trou
  x: number; // centre du morceau
  y: number;
}

export interface ResultatGravite {
  A: number;
  Sx: number; // Σ A y (moment statique par rapport à l'axe x)
  Sy: number; // Σ A x
  xG: number;
  yG: number;
}

/** Centre de gravité d'une surface composée (trous comptés en aires négatives). */
export function gravite(morceaux: readonly Morceau[]): ResultatGravite {
  const A = morceaux.reduce((s, m) => s + m.A, 0);
  const Sy = morceaux.reduce((s, m) => s + m.A * m.x, 0);
  const Sx = morceaux.reduce((s, m) => s + m.A * m.y, 0);
  return { A, Sx, Sy, xG: Sy / A, yG: Sx / A };
}

/** Rectangle de coin bas-gauche (x0, y0) et de dimensions L × h, comme morceau. */
export function rectangle(nom: string, x0: number, y0: number, L: number, h: number, trou = false): Morceau {
  return { nom, A: (trou ? -1 : 1) * L * h, x: x0 + L / 2, y: y0 + h / 2 };
}

/** Triangle de sommets donnés : centre de gravité à l'intersection des médianes (moyenne des sommets). */
export function triangleMorceau(nom: string, P: Point2D, Q: Point2D, R: Point2D): Morceau {
  return { nom, A: airePolygone([P, Q, R]), x: (P.x + Q.x + R.x) / 3, y: (P.y + Q.y + R.y) / 3 };
}

export interface DonneesSectionT {
  b: number; // largeur de la table (cm)
  hf: number; // épaisseur de la table (cm)
  bw: number; // largeur de l'âme (cm)
  h: number; // hauteur totale (cm)
}

export const EXEMPLE_SECTION_T: DonneesSectionT = { b: 60, hf: 12, bw: 20, h: 50 };

/** Section en T symétrique, origine en bas au milieu de l'âme ; yG mesuré depuis la fibre inférieure. */
export function sectionT(d: DonneesSectionT): ResultatGravite & { morceaux: Morceau[]; vInf: number; vSup: number } {
  const morceaux = [rectangle('âme', -d.bw / 2, 0, d.bw, d.h - d.hf), rectangle('table', -d.b / 2, d.h - d.hf, d.b, d.hf)];
  const g = gravite(morceaux);
  return { ...g, morceaux, vInf: g.yG, vSup: d.h - g.yG };
}

// ---------- Mini-projet : la petite maison (N0.5.P) ----------

export interface DonneesMaison {
  Lext: number; // longueur hors tout (m)
  lext: number; // largeur hors tout (m)
  e: number; // épaisseur des murs (m)
  Hmur: number; // hauteur des murs (m)
  Bsem: number; // largeur des semelles filantes (m)
  hsem: number; // épaisseur des semelles (m)
  Bfouille: number; // largeur des tranchées (m)
  Dfouille: number; // profondeur des tranchées (m)
  edalle: number; // épaisseur du dallage (m)
  ouvertures: number; // surface des baies (m²), donnée de l'énoncé
}

export const EXEMPLE_MAISON: DonneesMaison = {
  Lext: 9,
  lext: 7,
  e: 0.2,
  Hmur: 2.8,
  Bsem: 0.5,
  hsem: 0.25,
  Bfouille: 0.6,
  Dfouille: 0.6,
  edalle: 0.12,
  ouvertures: 2 * 0.9 * 2.1 + 5 * 1.2 * 1.2,
};

export interface ResultatMaison {
  emprise: number; // m²
  perimetreExt: number; // m
  longueurAxe: number; // périmètre à l'axe des murs (m)
  Sint: number; // surface intérieure (m²)
  Vfouille: number; // m³
  Vsemelle: number; // m³
  Vdalle: number; // m³
  SmurBrut: number; // m² (à l'axe)
  SmurNet: number; // m²
  Vmaconnerie: number; // m³
  Vbeton: number; // semelles + dalle (m³)
  toupies: number; // toupies de 8 m³ nécessaires (donnée de l'énoncé)
}

/**
 * Maison rectangulaire sans refend. Pour une bande de largeur w centrée sur l'axe d'un contour rectangulaire,
 * l'aire vaut exactement (périmètre à l'axe) × w : les angles rentrants et sortants se compensent.
 */
export function maison(d: DonneesMaison, toupie = 8): ResultatMaison {
  const longueurAxe = 2 * (d.Lext - d.e) + 2 * (d.lext - d.e);
  const Sint = (d.Lext - 2 * d.e) * (d.lext - 2 * d.e);
  const Vsemelle = longueurAxe * d.Bsem * d.hsem;
  const Vdalle = Sint * d.edalle;
  const SmurBrut = longueurAxe * d.Hmur;
  const SmurNet = SmurBrut - d.ouvertures;
  return {
    emprise: d.Lext * d.lext,
    perimetreExt: 2 * (d.Lext + d.lext),
    longueurAxe,
    Sint,
    Vfouille: longueurAxe * d.Bfouille * d.Dfouille,
    Vsemelle,
    Vdalle,
    SmurBrut,
    SmurNet,
    Vmaconnerie: SmurNet * d.e,
    Vbeton: Vsemelle + Vdalle,
    toupies: arrondiSup((Vsemelle + Vdalle) / toupie),
  };
}

/** Angle (degrés) d'inclinaison du talus d'une fouille réglée à n pour 1, pour la légende des coupes. */
export const angleTalus = (n: number) => atanD(1 / n);

/**
 * Largeur x d'une rivière (N0.5.2). C : arbre sur l'autre rive ; A : rive, face à C ; D : recul de AD sur (CA) ;
 * E : à DE de D, parallèlement à la rive ; F : intersection de (CE) avec la rive, AF mesuré.
 * (AF) ∥ (DE) ⇒ AF / DE = x / (x + AD), d'où x = AD × AF / (DE − AF).
 */
export function largeurRiviere(AD: number, DE: number, AF: number): number | null {
  return DE > AF ? (AD * AF) / (DE - AF) : null;
}
