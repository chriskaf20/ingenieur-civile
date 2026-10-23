// Module N0.4 — Trigonométrie appliquée (fonctions pures). Angles en degrés sauf mention contraire.
// Conventions : triangle rectangle — a côté opposé à α, b côté adjacent, c hypoténuse ;
// triangle quelconque — le côté a fait face à l'angle A, b à B, c à C.
import { arrondi, arrondiInf } from '@/lib/format';

// ---------- Unités d'angle (N0.4.1) ----------

export type UniteAngle = 'deg' | 'rad' | 'gon';

/** Un tour complet dans chaque unité : 360°, 2π rad, 400 gon. */
export const TOUR: Readonly<Record<UniteAngle, number>> = { deg: 360, rad: 2 * Math.PI, gon: 400 };

export function convertirAngle(valeur: number, de: UniteAngle, vers: UniteAngle): number {
  return (valeur * TOUR[vers]) / TOUR[de];
}

export const enRad = (deg: number) => convertirAngle(deg, 'deg', 'rad');
export const enDeg = (rad: number) => convertirAngle(rad, 'rad', 'deg');
export const sinD = (deg: number) => Math.sin(enRad(deg));
export const cosD = (deg: number) => Math.cos(enRad(deg));
export const tanD = (deg: number) => Math.tan(enRad(deg));
export const atanD = (x: number) => enDeg(Math.atan(x));
const borne = (x: number) => Math.min(1, Math.max(-1, x)); // évite acos(1,000 000 000 1) = NaN
export const asinD = (x: number) => enDeg(Math.asin(borne(x)));
export const acosD = (x: number) => enDeg(Math.acos(borne(x)));

export interface DMS {
  signe: 1 | -1;
  d: number;
  m: number;
  s: number;
}

/** Degrés décimaux → degrés, minutes, secondes (secondes arrondies à `dec` décimales, avec report). */
export function versDMS(deg: number, dec = 2): DMS {
  const signe = deg < 0 ? -1 : 1;
  const x = Math.abs(deg);
  let d = Math.floor(x);
  const mTot = (x - d) * 60;
  let m = Math.floor(mTot);
  let s = arrondi((mTot - m) * 60, dec);
  if (s >= 60) {
    s -= 60;
    m += 1;
  }
  if (m >= 60) {
    m -= 60;
    d += 1;
  }
  return { signe, d, m, s };
}

/** Décalage latéral (m) d'un point visé à la distance D (m) quand l'angle est faux de `erreur` : D × tan(erreur). */
export function ecartLateral(D: number, erreur: number, unite: UniteAngle): number {
  return D * Math.tan(convertirAngle(erreur, unite, 'rad'));
}

/** Degrés, minutes, secondes → degrés décimaux. */
export function depuisDMS(d: number, m: number, s: number, signe: 1 | -1 = 1): number {
  return signe * (d + m / 60 + s / 3600);
}

// ---------- Triangle rectangle (N0.4.2) ----------

export interface TriangleRect {
  a: number; // côté opposé à α
  b: number; // côté adjacent à α
  c: number; // hypoténuse
  alpha: number; // degrés
  beta: number; // degrés, 90° − α
  aire: number;
  perimetre: number;
}

function rect(a: number, b: number, c: number, alpha: number): TriangleRect {
  return { a, b, c, alpha, beta: 90 - alpha, aire: (a * b) / 2, perimetre: a + b + c };
}

/** Les deux côtés de l'angle droit sont connus (Pythagore, puis tangente). */
export function rectDeuxCotes(a: number, b: number): TriangleRect {
  return rect(a, b, Math.hypot(a, b), atanD(a / b));
}

/** L'hypoténuse c et le côté a opposé à α sont connus. Null si a ≥ c. */
export function rectHypotenuseCote(c: number, a: number): TriangleRect | null {
  if (a >= c) return null;
  return rect(a, Math.sqrt(c * c - a * a), c, asinD(a / c));
}

/** L'hypoténuse c et l'angle α sont connus. */
export function rectHypotenuseAngle(c: number, alpha: number): TriangleRect {
  return rect(c * sinD(alpha), c * cosD(alpha), c, alpha);
}

/** Le côté b adjacent à α et l'angle α sont connus. */
export function rectAdjacentAngle(b: number, alpha: number): TriangleRect {
  return rect(b * tanD(alpha), b, b / cosD(alpha), alpha);
}

/** Le côté a opposé à α et l'angle α sont connus. */
export function rectOpposeAngle(a: number, alpha: number): TriangleRect {
  return rect(a, a / tanD(alpha), a / sinD(alpha), alpha);
}

// ---------- Pentes (N0.4.3) ----------

/** pourcent, pourmille, angle en degrés ou en grades, ou rapport 1/n (1 de hauteur pour n de base, le « m » des talus). */
export type NotationPente = 'pourcent' | 'pourmille' | 'deg' | 'gon' | 'n';

/** Pente p = V/H (m/m) à partir d'une écriture. */
export function penteDepuis(valeur: number, notation: NotationPente): number {
  switch (notation) {
    case 'pourcent':
      return valeur / 100;
    case 'pourmille':
      return valeur / 1000;
    case 'deg':
      return tanD(valeur);
    case 'gon':
      return Math.tan(convertirAngle(valeur, 'gon', 'rad'));
    case 'n':
      return 1 / valeur;
  }
}

export interface EcrituresPente {
  p: number; // m/m
  pourcent: number;
  pourmille: number;
  deg: number;
  gon: number;
  n: number; // base pour 1 de hauteur
  /** longueur rampante / longueur horizontale = √(1 + p²) = 1/cos α */
  k: number;
}

export function ecrituresPente(p: number): EcrituresPente {
  const deg = atanD(p);
  return { p, pourcent: p * 100, pourmille: p * 1000, deg, gon: convertirAngle(deg, 'deg', 'gon'), n: 1 / p, k: Math.sqrt(1 + p * p) };
}

/** Pour un dénivelé H (m) : longueur horizontale L = H/p et longueur rampante. */
export function appliquerPente(p: number, H: number): { L: number; rampant: number } {
  const L = H / p;
  return { L, rampant: Math.hypot(L, H) };
}

// ---------- Cercle trigonométrique : composantes d'une force (N0.4.4) ----------

export interface Composantes {
  Fx: number;
  Fy: number;
  /** 1 à 4, ou 0 si la force est portée par un axe */
  quadrant: 0 | 1 | 2 | 3 | 4;
}

export function composantes(F: number, theta: number): Composantes {
  const t = ((theta % 360) + 360) % 360;
  const quadrant = t % 90 === 0 ? 0 : ((Math.floor(t / 90) + 1) as 1 | 2 | 3 | 4);
  return { Fx: F * cosD(theta), Fy: F * sinD(theta), quadrant };
}

/** Résultante de forces planes (intensité F, angle θ en degrés depuis l'horizontale) : somme des composantes. */
export function resultante(forces: ReadonlyArray<{ F: number; theta: number }>): { Rx: number; Ry: number; R: number; theta: number } {
  const Rx = forces.reduce((s, f) => s + f.F * cosD(f.theta), 0);
  const Ry = forces.reduce((s, f) => s + f.F * sinD(f.theta), 0);
  return { Rx, Ry, R: Math.hypot(Rx, Ry), theta: (enDeg(Math.atan2(Ry, Rx)) + 360) % 360 };
}

/** Charge verticale q sur un versant incliné de α : part perpendiculaire (q cos α) et part parallèle (q sin α) au versant. */
export function decomposerSurVersant(q: number, alpha: number): { perp: number; para: number } {
  return { perp: q * cosD(alpha), para: q * sinD(alpha) };
}

export interface ValeurRemarquable {
  deg: number;
  sin: string;
  cos: string;
  tan: string;
}

/** Valeurs exactes des angles remarquables (les valeurs décimales se vérifient avec sinD, cosD, tanD). */
export const VALEURS_REMARQUABLES: readonly ValeurRemarquable[] = [
  { deg: 0, sin: '0', cos: '1', tan: '0' },
  { deg: 30, sin: '1/2', cos: '√3/2', tan: '√3/3' },
  { deg: 45, sin: '√2/2', cos: '√2/2', tan: '1' },
  { deg: 60, sin: '√3/2', cos: '1/2', tan: '√3' },
  { deg: 90, sin: '1', cos: '0', tan: '—' },
];

/** Valeur numérique d'une écriture exacte du tableau (« √3/2 », « 1/2 »…), pour les contrôles. */
export function valeurExacte(e: string): number {
  if (e === '—') return NaN;
  const [num, den = '1'] = e.split('/');
  const n = num!.startsWith('√') ? Math.sqrt(Number(num!.slice(1))) : Number(num);
  return n / Number(den);
}

// ---------- Triangle quelconque (N0.4.5) ----------

export interface Triangle {
  a: number;
  b: number;
  c: number;
  A: number; // degrés
  B: number;
  C: number;
  aire: number;
  perimetre: number;
}

function triangle(a: number, b: number, c: number, A: number, B: number, C: number): Triangle {
  return { a, b, c, A, B, C, aire: 0.5 * b * c * sinD(A), perimetre: a + b + c };
}

/** Deux côtés b, c et l'angle compris A : Al-Kashi donne a, puis l'angle B. */
export function triangleCAC(b: number, c: number, A: number): Triangle {
  const a = Math.sqrt(b * b + c * c - 2 * b * c * cosD(A));
  const B = acosD((a * a + c * c - b * b) / (2 * a * c));
  return triangle(a, b, c, A, B, 180 - A - B);
}

/** Trois côtés : Al-Kashi pour chaque angle. Null si l'inégalité triangulaire n'est pas respectée. */
export function triangleCCC(a: number, b: number, c: number): Triangle | null {
  if (a >= b + c || b >= a + c || c >= a + b) return null;
  const A = acosD((b * b + c * c - a * a) / (2 * b * c));
  const B = acosD((a * a + c * c - b * b) / (2 * a * c));
  return triangle(a, b, c, A, B, 180 - A - B);
}

/** Deux angles A, B et le côté c compris entre eux : loi des sinus. Null si A + B ≥ 180°. */
export function triangleACA(A: number, B: number, c: number): Triangle | null {
  const C = 180 - A - B;
  if (C <= 0) return null;
  const k = c / sinD(C); // = 2R, diamètre du cercle circonscrit
  return triangle(k * sinD(A), k * sinD(B), c, A, B, C);
}

/**
 * Deux côtés a, b et l'angle A opposé à a (angle non compris) : cas ambigu de la loi des sinus.
 * sin B = b sin A / a donne 0, 1 ou 2 triangles possibles.
 */
export function triangleCCA(a: number, b: number, A: number): Triangle[] {
  const sinB = (b * sinD(A)) / a;
  if (sinB > 1 + 1e-12) return [];
  const B1 = asinD(sinB);
  const candidats = Math.abs(B1 - 90) < 1e-9 ? [B1] : [B1, 180 - B1];
  return candidats
    .filter((B) => 180 - A - B > 1e-9)
    .map((B) => {
      const C = 180 - A - B;
      return triangle(a, b, (a * sinD(C)) / sinD(A), A, B, C);
    });
}

// ---------- Toiture, rampe, talus (N0.4.6) ----------

export interface DonneesToiture {
  L: number; // portée du bâtiment, d'un mur à l'autre (m)
  longueur: number; // longueur du bâtiment, parallèle au faîtage (m)
  pente: number; // % (donnée de l'énoncé ou du fabricant de couverture)
  debord: number; // débord horizontal au-delà des murs (m)
}

export const EXEMPLE_TOITURE: DonneesToiture = { L: 8, longueur: 12, pente: 30, debord: 0.5 };

export interface ResultatToiture {
  p: number;
  alpha: number; // degrés
  h: number; // hauteur du faîtage au-dessus des appuis (m)
  rampant: number; // longueur inclinée d'un versant entre appui et faîtage (m)
  rampantTotal: number; // avec le débord (m)
  surface: number; // couverture des deux versants, débords compris (m²)
  k: number; // 1/cos α
}

/** Toiture à deux versants symétriques. */
export function toiture(d: DonneesToiture): ResultatToiture {
  const p = d.pente / 100;
  const k = Math.sqrt(1 + p * p);
  const demi = d.L / 2;
  return { p, alpha: atanD(p), h: demi * p, rampant: demi * k, rampantTotal: (demi + d.debord) * k, surface: 2 * (demi + d.debord) * k * d.longueur, k };
}

/** Rampe de dénivelé H (m) et de pente donnée en % : longueurs horizontale et inclinée, angle. */
export function rampe(H: number, pourcent: number): { L: number; rampant: number; alpha: number } {
  const p = pourcent / 100;
  return { ...appliquerPente(p, H), alpha: atanD(p) };
}

/**
 * Talus de hauteur H (m) réglé à n/1 (n de base pour 1 de hauteur) ; section = triangle ½ × n H × H (m² par mètre de talus),
 * volume = section × longueur (m³).
 */
export function talus(H: number, n: number, longueur = 1): { emprise: number; rampant: number; alpha: number; pourcent: number; section: number; volume: number } {
  const section = 0.5 * n * H * H;
  return { emprise: n * H, rampant: H * Math.sqrt(1 + n * n), alpha: atanD(1 / n), pourcent: 100 / n, section, volume: section * longueur };
}

// ---------- Profil en travers d'une route en terre (N0.4.3, planche) ----------

export interface DonneesProfil {
  largeur: number; // plateforme (m)
  bombement: number; // pente transversale de chaque demi-chaussée (%), donnée de l'énoncé
  H: number; // hauteur du remblai en bord de plateforme (m)
  n: number; // talus n/1
}

export const EXEMPLE_PROFIL: DonneesProfil = { largeur: 7, bombement: 4, H: 1.5, n: 1.5 };

export interface ResultatProfil {
  fleche: number; // surélévation de l'axe par rapport aux bords (m)
  talus: ReturnType<typeof talus>;
  emprise: number; // largeur totale au pied des talus (m)
  bombement: EcrituresPente;
}

export function profilTravers(d: DonneesProfil): ResultatProfil {
  const t = talus(d.H, d.n);
  return { fleche: (d.largeur / 2) * (d.bombement / 100), talus: t, emprise: d.largeur + 2 * t.emprise, bombement: ecrituresPente(d.bombement / 100) };
}

// ---------- Ferme de toiture en W, type Fink (mini-projet N0.4.P) ----------

export interface Point2D {
  x: number;
  y: number;
}

export function distance(P: Point2D, Q: Point2D): number {
  return Math.hypot(Q.x - P.x, Q.y - P.y);
}

/** Inclinaison (degrés, 0 à 90) de la droite PQ sur l'horizontale. */
export function inclinaison(P: Point2D, Q: Point2D): number {
  const dx = Math.abs(Q.x - P.x);
  const dy = Math.abs(Q.y - P.y);
  return dx === 0 ? 90 : atanD(dy / dx);
}

/** Angle (degrés, 0 à 180) entre les directions O→P et O→Q. */
export function angleEntre(O: Point2D, P: Point2D, Q: Point2D): number {
  const ux = P.x - O.x;
  const uy = P.y - O.y;
  const vx = Q.x - O.x;
  const vy = Q.y - O.y;
  return acosD((ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy)));
}

export interface DonneesFerme {
  L: number; // portée entre appuis, sur les axes (m)
  alpha: number; // pente des arbalétriers (degrés)
  debord: number; // débord horizontal (m)
  longueurBatiment: number; // m
  entraxe: number; // espacement des fermes (m), donnée de l'énoncé
}

export const EXEMPLE_FERME: DonneesFerme = { L: 8, alpha: 30, debord: 0.5, longueurBatiment: 12, entraxe: 3 };

export type IdNoeud = 'A' | 'D1' | 'D2' | 'B' | 'M1' | 'S' | 'M2';

export interface AngleNoeud {
  noeud: IdNoeud;
  entre: string;
  valeur: number; // degrés
}

export interface ResultatFerme {
  h: number; // hauteur au faîtage (m)
  noeuds: Readonly<Record<IdNoeud, Point2D>>;
  arbaletrier: number; // A → S sur l'axe (m)
  arbaletrierDebord: number; // avec le débord (m)
  entrait: number; // A → B (m)
  diagCourte: number; // D1 → M1 (m)
  diagLongue: number; // D1 → S (m)
  gamma: number; // inclinaison des diagonales sur l'entrait (degrés)
  angles: AngleNoeud[];
  nbFermes: number;
  longueurParFerme: number; // somme des barres sur les axes, sans débord (m)
  longueurTotale: number; // toutes les fermes, débords compris (m)
}

/**
 * Ferme en W : arbalétriers A–S et S–B, entrait A–B, diagonales D1–M1, D1–S, D2–S, D2–M2,
 * avec D1 et D2 aux tiers de l'entrait et M1, M2 au milieu des arbalétriers. Géométrie sur les axes.
 */
export function ferme(d: DonneesFerme): ResultatFerme {
  const { L } = d;
  const h = (L / 2) * tanD(d.alpha);
  const n: Record<IdNoeud, Point2D> = {
    A: { x: 0, y: 0 },
    D1: { x: L / 3, y: 0 },
    D2: { x: (2 * L) / 3, y: 0 },
    B: { x: L, y: 0 },
    M1: { x: L / 4, y: h / 2 },
    S: { x: L / 2, y: h },
    M2: { x: (3 * L) / 4, y: h / 2 },
  };
  const arbaletrier = distance(n.A, n.S);
  const arbaletrierDebord = (L / 2 + d.debord) / cosD(d.alpha);
  const diagCourte = distance(n.D1, n.M1);
  const diagLongue = distance(n.D1, n.S);
  const nbFermes = arrondiInf(d.longueurBatiment / d.entraxe) + 1;
  const barresInternes = L + 2 * diagCourte + 2 * diagLongue;
  return {
    h,
    noeuds: n,
    arbaletrier,
    arbaletrierDebord,
    entrait: L,
    diagCourte,
    diagLongue,
    gamma: inclinaison(n.D1, n.S),
    angles: [
      { noeud: 'A', entre: 'entrait / arbalétrier', valeur: angleEntre(n.A, n.D1, n.M1) },
      { noeud: 'M1', entre: 'arbalétrier (côté A) / diagonale courte', valeur: angleEntre(n.M1, n.A, n.D1) },
      { noeud: 'M1', entre: 'diagonale courte / arbalétrier (côté S)', valeur: angleEntre(n.M1, n.D1, n.S) },
      { noeud: 'D1', entre: 'entrait (côté A) / diagonale courte', valeur: angleEntre(n.D1, n.A, n.M1) },
      { noeud: 'D1', entre: 'diagonale courte / diagonale longue', valeur: angleEntre(n.D1, n.M1, n.S) },
      { noeud: 'D1', entre: 'diagonale longue / entrait (côté D2)', valeur: angleEntre(n.D1, n.S, n.D2) },
      { noeud: 'S', entre: 'arbalétrier / diagonale longue', valeur: angleEntre(n.S, n.M1, n.D1) },
      { noeud: 'S', entre: 'diagonale longue / diagonale longue', valeur: angleEntre(n.S, n.D1, n.D2) },
      { noeud: 'S', entre: 'arbalétrier / arbalétrier', valeur: angleEntre(n.S, n.A, n.B) },
    ],
    nbFermes,
    longueurParFerme: 2 * arbaletrier + barresInternes,
    longueurTotale: nbFermes * (2 * arbaletrierDebord + barresInternes),
  };
}

export interface LigneDebit {
  barre: string;
  parFerme: number;
  longueur: number; // m, sur l'axe
  quantite: number; // toutes les fermes
  total: number; // m
}

/** Liste de débit des fermes : longueurs théoriques sur les axes, avant coupes et assemblages. */
export function nomenclature(r: ResultatFerme): { lignes: LigneDebit[]; total: number; pieces: number } {
  const lignes = [
    { barre: 'arbalétrier (débord compris)', parFerme: 2, longueur: r.arbaletrierDebord },
    { barre: 'entrait', parFerme: 1, longueur: r.entrait },
    { barre: 'diagonale courte', parFerme: 2, longueur: r.diagCourte },
    { barre: 'diagonale longue', parFerme: 2, longueur: r.diagLongue },
  ].map((l) => ({ ...l, quantite: l.parFerme * r.nbFermes, total: l.parFerme * r.nbFermes * l.longueur }));
  return { lignes, total: lignes.reduce((s, l) => s + l.total, 0), pieces: lignes.reduce((s, l) => s + l.quantite, 0) };
}
