// Dessin technique (module L1.6) : échelles, formats, traits, écritures, projections, perspectives et cotation.
import { arrondi } from '@/lib/format';

// ---------- Échelles (L1.6.2, L1.6.5) ----------

/** Échelles normalisées courantes en bâtiment (dénominateurs). */
export const ECHELLES = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000] as const;

/** Échelles de réduction recommandées par l'ISO 5455 (dénominateurs) : 1, 2 et 5 fois une puissance de 10. */
export const ECHELLES_ISO = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000] as const;

/** Longueur réelle (m) d'une mesure de `mesure` mm sur un plan au 1/`echelle`. */
export function longueurReelle(mesure: number, echelle: number): number {
  return (mesure * echelle) / 1000;
}

/** Longueur à dessiner (mm) pour une longueur réelle de `longueur` m au 1/`echelle`. */
export function longueurPapier(longueur: number, echelle: number): number {
  return (longueur * 1000) / echelle;
}

/** Dénominateur d'échelle retrouvé à partir d'une cote connue : E = L / m (L en mm). */
export function echelleDepuisCote(mesureMm: number, coteM: number): number {
  if (mesureMm <= 0) throw new Error('Mesure nulle');
  return (coteM * 1000) / mesureMm;
}

/**
 * Plus grande échelle de la liste (plus petit dénominateur) pour laquelle la longueur réelle
 * tient dans la place disponible sur la feuille.
 */
export function echelleMaximale(longueurM: number, disponibleMm: number, liste: readonly number[] = ECHELLES_ISO): number {
  const E = liste.find((e) => longueurPapier(longueurM, e) <= disponibleMm + 1e-9);
  if (E === undefined) throw new Error('Aucune échelle de la liste ne convient');
  return E;
}

/** Surface réelle (m²) d'une aire mesurée sur le plan (mm²) : les longueurs sont multipliées par E, les surfaces par E². */
export function surfaceReelle(aireMm2: number, E: number): number {
  return (aireMm2 * E * E) / 1e6;
}

/** Graduations d'une échelle graphique : `n` pas de `pasM` mètres, avec leur longueur sur le papier (mm). */
export function echelleGraphique(E: number, pasM: number, n: number): { reel: number; papier: number }[] {
  return Array.from({ length: n + 1 }, (_, i) => ({ reel: arrondi(i * pasM, 6), papier: longueurPapier(i * pasM, E) }));
}

// ---------- Formats (ISO 216) et feuilles de dessin (ISO 5457) — L1.6.1 ----------

export type Orientation = 'portrait' | 'paysage';

/** Côtés du format A0 : 1 m² et rapport √2, soit 1000 × 2^(−1/4) et 1000 × 2^(1/4) mm, arrondis au mm. */
export const A0 = { court: Math.round(1000 * 2 ** -0.25), long: Math.round(1000 * 2 ** 0.25) } as const;

/** Dimensions (mm) du format A n : chaque format coupe le grand côté du précédent en deux, au mm inférieur. */
export function formatA(n: number): { court: number; long: number } {
  if (!Number.isInteger(n) || n < 0 || n > 10) throw new Error('Formats A0 à A10 seulement');
  let court: number = A0.court;
  let long: number = A0.long;
  for (let i = 0; i < n; i++) [court, long] = [Math.floor(long / 2), court];
  return { court, long };
}

/** Nombre de feuilles A m contenues dans une feuille A n (m ≥ n) : chaque cran divise la surface par deux. */
export function feuillesDans(n: number, m: number): number {
  if (m < n) throw new Error('Le second format doit être plus petit');
  return 2 ** (m - n);
}

/** Facteur appliqué aux longueurs quand on imprime un A n sur un A m : (1/√2) par cran, soit ½ pour deux crans. */
export function facteurImpression(n: number, m: number): number {
  return Math.SQRT1_2 ** (m - n);
}

/** Bords du cadre (ISO 5457) : 20 mm à gauche, côté reliure, 10 mm sur les trois autres bords. */
export const MARGES_CADRE = { gauche: 20, autres: 10 } as const;

/** Orientation usuelle : A4 en portrait, A3 à A0 en paysage. */
export function orientationUsuelle(n: number): Orientation {
  return n === 4 ? 'portrait' : 'paysage';
}

/** Zone utile (mm) à l'intérieur du cadre d'un format A n. */
export function zoneUtile(n: number, orientation: Orientation = orientationUsuelle(n)): { largeur: number; hauteur: number } {
  const { court, long } = formatA(n);
  const [L, H] = orientation === 'paysage' ? [long, court] : [court, long];
  return { largeur: L - MARGES_CADRE.gauche - MARGES_CADRE.autres, hauteur: H - 2 * MARGES_CADRE.autres };
}

export interface DonneesFormat {
  /** dimensions réelles de l'objet à dessiner (m) */
  L: number;
  H: number;
  /** dénominateur de l'échelle */
  E: number;
  /** réserve autour du dessin pour les cotes et les textes (mm, de chaque côté) */
  reserve: number;
  /** hauteur de la bande réservée au cartouche, en bas du cadre (mm) */
  cartouche: number;
}

export interface ChoixFormat {
  /** dessin seul (mm) */
  dessin: { largeur: number; hauteur: number };
  /** encombrement avec la réserve des cotes (mm) */
  encombrement: { largeur: number; hauteur: number };
  n: number;
  orientation: Orientation;
  zone: { largeur: number; hauteur: number };
  /** place restante (mm) en largeur et en hauteur au-dessus du cartouche */
  marge: { largeur: number; hauteur: number };
  /** formats essayés, du plus petit au plus grand */
  essais: { n: number; tient: boolean }[];
}

/** Plus petit format A (A4 à A0, orientation usuelle) dont la zone utile contient le dessin, ses cotes et le cartouche. */
export function choisirFormat(d: DonneesFormat): ChoixFormat {
  const dessin = { largeur: longueurPapier(d.L, d.E), hauteur: longueurPapier(d.H, d.E) };
  const encombrement = { largeur: dessin.largeur + 2 * d.reserve, hauteur: dessin.hauteur + 2 * d.reserve };
  const essais: { n: number; tient: boolean }[] = [];
  for (const n of [4, 3, 2, 1, 0]) {
    const zone = zoneUtile(n);
    const tient = encombrement.largeur <= zone.largeur + 1e-9 && encombrement.hauteur <= zone.hauteur - d.cartouche + 1e-9;
    essais.push({ n, tient });
    if (tient) {
      return {
        dessin,
        encombrement,
        n,
        orientation: orientationUsuelle(n),
        zone,
        marge: { largeur: zone.largeur - encombrement.largeur, hauteur: zone.hauteur - d.cartouche - encombrement.hauteur },
        essais,
      };
    }
  }
  throw new Error('Le dessin ne tient pas sur un A0 : choisir une échelle plus petite');
}

/** Façade de 12,40 m × 6,80 m au 1/50, 20 mm de réserve pour les cotes, 40 mm pour le cartouche (données de l'énoncé, L1.6.1). */
export const EXEMPLE_FORMAT: DonneesFormat = { L: 12.4, H: 6.8, E: 50, reserve: 20, cartouche: 40 };

// ---------- Traits (ISO 128-20) et écritures (ISO 3098) — L1.6.1 ----------

/** Série des épaisseurs de trait (mm), de raison √2 environ. */
export const EPAISSEURS_TRAITS = [0.13, 0.18, 0.25, 0.35, 0.5, 0.7, 1, 1.4, 2] as const;

/** Trait fin associé à un trait fort : épaisseur moitié, soit deux crans plus bas dans la série. */
export function traitFin(fort: number): number {
  const i = EPAISSEURS_TRAITS.findIndex((e) => Math.abs(e - fort) < 1e-9);
  if (i < 2) throw new Error('Épaisseur hors de la série ou trop fine');
  return EPAISSEURS_TRAITS[i - 2]!;
}

/** Hauteurs nominales d'écriture (mm), de raison √2 environ. */
export const HAUTEURS_ECRITURE = [1.8, 2.5, 3.5, 5, 7, 10, 14, 20] as const;

/** Épaisseur du trait d'écriture : h/10 pour l'écriture de type B, h/14 pour le type A. */
export function epaisseurEcriture(h: number, type: 'A' | 'B' = 'B'): number {
  return h / (type === 'B' ? 10 : 14);
}

// ---------- Projections orthogonales (L1.6.3) ----------

export type Point2 = readonly [number, number];
export type Point3 = readonly [number, number, number];

export interface LigneVue {
  /** abscisse x (vue de dessus) ou cote z (vue de gauche) de l'arête */
  position: number;
  /** arête vue (trait continu) ou cachée (trait interrompu) */
  visible: boolean;
}

export interface VuesExtrusion {
  /** profil (x, z) : c'est la vue de face */
  face: Point2[];
  /** arêtes de la vue de dessus, parallèles à la profondeur */
  dessus: LigneVue[];
  /** arêtes de la vue de gauche, horizontales */
  gauche: LigneVue[];
  xmin: number;
  zmin: number;
  largeur: number;
  hauteur: number;
  profondeur: number;
}

const EPS = 1e-9;

/** Valeurs extrêmes, le long d'une droite x = c (ou z = c), des points du contour d'un polygone. */
function coupeContour(profil: readonly Point2[], axe: 0 | 1, c: number): number[] {
  const autre = axe === 0 ? 1 : 0;
  const v: number[] = [];
  profil.forEach((p, i) => {
    const q = profil[(i + 1) % profil.length]!;
    const a = p[axe];
    const b = q[axe];
    if (Math.abs(a - b) < EPS) {
      if (Math.abs(a - c) < EPS) v.push(p[autre], q[autre]);
    } else if ((c - a) * (c - b) <= EPS) {
      v.push(p[autre] + ((c - a) / (b - a)) * (q[autre] - p[autre]));
    }
  });
  return v;
}

/**
 * Vues d'un objet prismatique : un profil (x, z) tiré sur une profondeur.
 * Une arête de la vue de dessus est vue si un sommet du profil est sur le contour supérieur à cette abscisse ;
 * une arête de la vue de gauche est vue si un sommet est sur le contour gauche à cette hauteur.
 */
export function vuesExtrusion(profil: readonly Point2[], profondeur: number): VuesExtrusion {
  if (profil.length < 3) throw new Error('Profil à trois sommets au moins');
  const xs = [...new Set(profil.map((p) => arrondi(p[0], 9)))].sort((a, b) => a - b);
  const zs = [...new Set(profil.map((p) => arrondi(p[1], 9)))].sort((a, b) => a - b);
  const dessus = xs.map((x) => {
    const haut = Math.max(...coupeContour(profil, 0, x));
    return { position: x, visible: profil.some((p) => Math.abs(p[0] - x) < EPS && Math.abs(p[1] - haut) < 1e-7) };
  });
  const gauche = zs.map((z) => {
    const g = Math.min(...coupeContour(profil, 1, z));
    return { position: z, visible: profil.some((p) => Math.abs(p[1] - z) < EPS && Math.abs(p[0] - g) < 1e-7) };
  });
  return {
    face: profil.map((p) => [p[0], p[1]] as const),
    dessus,
    gauche,
    xmin: xs[0]!,
    zmin: zs[0]!,
    largeur: xs[xs.length - 1]! - xs[0]!,
    hauteur: zs[zs.length - 1]! - zs[0]!,
    profondeur,
  };
}

export interface DonneesCaniveau {
  /** largeur extérieure, hauteur extérieure, épaisseur des parois et du radier, longueur d'un élément (m) */
  W: number;
  H: number;
  t: number;
  L: number;
}

/** Profil (sens trigonométrique) d'un caniveau en U, ouvert vers le haut. */
export function profilCaniveau(d: DonneesCaniveau): Point2[] {
  const { W, H, t } = d;
  if (2 * t >= W || t >= H) throw new Error('Parois trop épaisses');
  return [[0, 0], [W, 0], [W, H], [W - t, H], [W - t, t], [t, t], [t, H], [0, H]];
}

/** Vues et dimensions intérieures d'un caniveau en U. */
export function caniveau(d: DonneesCaniveau): VuesExtrusion & { largeurInterieure: number; profondeurInterieure: number; section: number } {
  return {
    ...vuesExtrusion(profilCaniveau(d), d.L),
    largeurInterieure: arrondi(d.W - 2 * d.t, 9),
    profondeurInterieure: arrondi(d.H - d.t, 9),
    section: arrondi(d.W * d.H - (d.W - 2 * d.t) * (d.H - d.t), 9),
  };
}

/** Élément de caniveau préfabriqué de 1,00 m : 0,60 × 0,50 m, parois de 0,10 m (données de l'énoncé, L1.6.3). */
export const EXEMPLE_CANIVEAU: DonneesCaniveau = { W: 0.6, H: 0.5, t: 0.1, L: 1 };

// ---------- Perspectives (L1.6.4) ----------

/** Perspective cavalière : face frontale (x, z) en vraie grandeur, fuyantes (y) à l'angle α et réduites par k. */
export function cavaliere([x, y, z]: Point3, alphaDeg: number, k: number): Point2 {
  const a = (alphaDeg * Math.PI) / 180;
  return [x + k * y * Math.cos(a), z + k * y * Math.sin(a)];
}

/**
 * Dessin isométrique : x descend vers la droite et y monte vers la droite, tous deux à 30° de l'horizontale ;
 * z est vertical. Les longueurs sont portées en vraie grandeur sur les trois axes.
 * On voit, comme en cavalière, la face avant, le dessus et le côté droit.
 */
export function isometrique([x, y, z]: Point3): Point2 {
  return [(x + y) * Math.cos(Math.PI / 6), z + (y - x) * Math.sin(Math.PI / 6)];
}

/** Rapport de réduction de la projection isométrique vraie : √(2/3) ≈ 0,816. Le dessin isométrique l'ignore. */
export const COEF_ISOMETRIQUE = Math.sqrt(2 / 3);

/** Longueur dessinée d'une fuyante de longueur réelle L. */
export function longueurFuyante(L: number, k: number): number {
  return k * L;
}

export interface DonneesMarches {
  /** nombre de marches, giron, hauteur de marche, emmarchement (m) */
  n: number;
  g: number;
  h: number;
  L: number;
  /** angle des fuyantes (°) et coefficient de réduction de la cavalière */
  alpha: number;
  k: number;
}

/** Profil (x, z) d'un bloc de marches posé au sol, montant vers la gauche. */
export function profilMarches(d: Pick<DonneesMarches, 'n' | 'g' | 'h'>): Point2[] {
  const { n, g, h } = d;
  const p: Point2[] = [[0, 0], [n * g, 0]];
  for (let i = 1; i <= n; i++) {
    p.push([(n - i + 1) * g, i * h]);
    p.push([(n - i) * g, i * h]);
  }
  // le dernier sommet (0, n·h) ferme le profil sur l'origine
  return p.filter((q, i) => i === 0 || !(Math.abs(q[0] - p[i - 1]![0]) < EPS && Math.abs(q[1] - p[i - 1]![1]) < EPS));
}

/** Longueurs portées sur le dessin d'un bloc de marches en cavalière et en isométrie. */
export function perspectiveMarches(d: DonneesMarches) {
  const profondeur = d.n * d.g;
  const hauteur = d.n * d.h;
  return {
    profil: profilMarches(d),
    profondeur,
    hauteur,
    fuyante: longueurFuyante(d.L, d.k),
    /** en isométrie, on reporte les vraies longueurs sur les trois axes */
    iso: { largeur: profondeur, hauteur, fuyante: d.L },
    /** largeur et hauteur hors tout du dessin en cavalière */
    encombrement: {
      largeur: profondeur + longueurFuyante(d.L, d.k) * Math.cos((d.alpha * Math.PI) / 180),
      hauteur: hauteur + longueurFuyante(d.L, d.k) * Math.sin((d.alpha * Math.PI) / 180),
    },
  };
}

/** Deux marches de 0,28 × 0,17 m sur 1,00 m d'emmarchement, cavalière à 45° et k = 0,5 (données de l'énoncé, L1.6.4). */
export const EXEMPLE_MARCHES: DonneesMarches = { n: 2, g: 0.28, h: 0.17, L: 1, alpha: 45, k: 0.5 };

// ---------- Cotation (L1.6.6) ----------

/** Total d'une chaîne de cotes et cotes cumulées depuis l'origine (arrondies au dixième de mm). */
export function chaineCotes(partielles: readonly number[]): { total: number; cumulees: number[] } {
  const cumulees = [0];
  for (const p of partielles) cumulees.push(arrondi(cumulees[cumulees.length - 1]! + p, 4));
  return { total: cumulees[cumulees.length - 1]!, cumulees };
}

/** Cote manquante d'une chaîne fermée : la cote totale moins la somme des cotes connues. */
export function coteManquante(connues: readonly number[], totale: number): number {
  return arrondi(totale - chaineCotes(connues).total, 4);
}

/** Écart de fermeture : somme des cotes partielles moins la cote totale (nul si la chaîne est juste). */
export function ecartFermeture(partielles: readonly number[], totale: number): number {
  return arrondi(chaineCotes(partielles).total - totale, 4);
}

export interface DonneesFacade {
  /** cotes partielles de la façade, de gauche à droite : trumeaux et baies (m) */
  partielles: readonly number[];
  /** noms des segments (« trumeau », « fenêtre »…) */
  noms: readonly string[];
  /** cote totale hors tout portée sur le plan (m) */
  totale: number;
}

/** Contrôle d'une ligne de cotes de façade : total, cumul, écart de fermeture. */
export function controleFacade(d: DonneesFacade) {
  const c = chaineCotes(d.partielles);
  return { ...c, ecart: ecartFermeture(d.partielles, d.totale), ferme: Math.abs(ecartFermeture(d.partielles, d.totale)) < 0.0005 };
}

/** Façade de 9,40 m : trumeau, fenêtre, trumeau, porte, trumeau (données de l'énoncé, L1.6.6). */
export const EXEMPLE_FACADE: DonneesFacade = {
  partielles: [1.2, 1.2, 2.4, 0.9, 3.7],
  noms: ['trumeau', 'fenêtre', 'trumeau', 'porte', 'trumeau'],
  totale: 9.4,
};

/** Longueur dessinée, en isométrie, d'un segment de l'espace (les segments parallèles aux axes gardent leur longueur). */
export function longueurIso(a: Point3, b: Point3): number {
  const [u1, v1] = isometrique(a);
  const [u2, v2] = isometrique(b);
  return Math.hypot(u2 - u1, v2 - v1);
}
