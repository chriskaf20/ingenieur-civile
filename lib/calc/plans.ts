// Lecture de plans (module L1.6) : coupes, niveaux, dossier, surfaces, nomenclatures, indices
// et modèle de logement (studio, maison) d'où sont tirés plans, façades et coupes.
import { arrondi } from '@/lib/format';
import { masseLineique } from './acier';
import { chaineCotes, echelleMaximale, zoneUtile } from './dessin';

// ---------- Coupes : hauteur sous plafond (L1.6.7) ----------

export interface DonneesPlancher {
  /** hauteur d'étage, de sol fini à sol fini (m) */
  hEtage: number;
  /** épaisseur de la dalle (m) */
  dalle: number;
  /** chape et carrelage sur la dalle (m) */
  revetement: number;
  /** enduit sous la dalle (m) */
  plafond: number;
}

/** Hauteur sous plafond : la hauteur d'étage moins l'épaisseur totale du plancher fini. */
export function hauteurSousPlafond(d: DonneesPlancher): { plancher: number; hsp: number } {
  const plancher = arrondi(d.dalle + d.revetement + d.plafond, 4);
  return { plancher, hsp: arrondi(d.hEtage - plancher, 4) };
}

/** Étage de 2,90 m, dalle de 16 cm, 5 cm de chape et carrelage, 1,5 cm d'enduit (données de l'énoncé, L1.6.7). */
export const EXEMPLE_PLANCHER: DonneesPlancher = { hEtage: 2.9, dalle: 0.16, revetement: 0.05, plafond: 0.015 };

// ---------- Niveaux et pentes (L1.6.8) ----------

/** Altitude d'un niveau relatif, connaissant l'altitude du ±0,00 (m). */
export function altitude(niveau: number, altitudeZero: number): number {
  return arrondi(altitudeZero + niveau, 4);
}

/** Niveau brut (dessus de la dalle) sous un sol fini : on retire l'épaisseur du revêtement. */
export function niveauBrut(niveauFini: number, revetement: number): number {
  return arrondi(niveauFini - revetement, 4);
}

/** Pente (%) : dénivelé divisé par la longueur horizontale. */
export function pente(denivele: number, longueur: number): number {
  if (longueur <= 0) throw new Error('Longueur nulle');
  return (denivele / longueur) * 100;
}

/** Angle (°) d'une pente donnée en %. */
export function angleDePente(p: number): number {
  return (Math.atan(p / 100) * 180) / Math.PI;
}

/** Dénivelé (m) d'une pente p (%) sur une longueur horizontale. */
export function deniveleDePente(p: number, longueur: number): number {
  return (p / 100) * longueur;
}

export interface DonneesNiveaux {
  /** altitude du ±0,00 (m) */
  altitudeZero: number;
  /** terrain naturel au droit de l'entrée, niveau relatif (m) */
  tn: number;
  /** sol fini de l'étage (m) */
  etage: number;
  /** épaisseur des revêtements de sol (m) */
  revetement: number;
  /** longueur horizontale de la rampe qui monte du terrain au ±0,00 (m) */
  rampe: number;
}

/** Altitudes, niveaux bruts et pente de la rampe d'accès. */
export function niveaux(d: DonneesNiveaux) {
  const denivele = arrondi(-d.tn, 4);
  const p = pente(denivele, d.rampe);
  return {
    altTN: altitude(d.tn, d.altitudeZero),
    altEtage: altitude(d.etage, d.altitudeZero),
    brutRdc: niveauBrut(0, d.revetement),
    brutEtage: niveauBrut(d.etage, d.revetement),
    denivele,
    pente: p,
    angle: angleDePente(p),
  };
}

/** ±0,00 à 312,45 m, terrain à −0,40, étage à +3,06, 6 cm de revêtement, rampe de 6,00 m (données de l'énoncé, L1.6.8). */
export const EXEMPLE_NIVEAUX: DonneesNiveaux = { altitudeZero: 312.45, tn: -0.4, etage: 3.06, revetement: 0.06, rampe: 6 };

/** Positions des files depuis la première, à partir des entraxes (m). */
export function positionsFiles(entraxes: readonly number[]): number[] {
  return chaineCotes(entraxes).cumulees;
}

// ---------- Dossier de plans : échelles (L1.6.9) ----------

export interface DonneesDossier {
  /** parcelle et bâtiment, longueur × largeur (m) */
  parcelle: { L: number; l: number };
  batiment: { L: number; l: number };
  /** format A n de toutes les planches */
  n: number;
  /** réserve pour les cotes autour du dessin, de chaque côté (mm) */
  reserve: number;
  /** bande du cartouche (mm) */
  cartouche: number;
}

/** Échelle la plus grande qui fait tenir un rectangle L × l dans la place disponible (mm). */
function echelleRectangle(L: number, l: number, largeur: number, hauteur: number): number {
  return Math.max(echelleMaximale(L, largeur), echelleMaximale(l, hauteur));
}

/** Échelles du plan de masse (parcelle entière) et des plans de niveaux (bâtiment) sur un même format. */
export function echellesDossier(d: DonneesDossier) {
  const zone = zoneUtile(d.n);
  const dispo = { largeur: zone.largeur - 2 * d.reserve, hauteur: zone.hauteur - d.cartouche - 2 * d.reserve };
  const masse = echelleRectangle(d.parcelle.L, d.parcelle.l, dispo.largeur, dispo.hauteur);
  const niveau = echelleRectangle(d.batiment.L, d.batiment.l, dispo.largeur, dispo.hauteur);
  return { zone, dispo, masse, niveau };
}

/** Parcelle de 30 × 20 m, maison de 12,6 × 9,2 m, planches A3 (données de l'énoncé, L1.6.9). */
export const EXEMPLE_DOSSIER: DonneesDossier = { parcelle: { L: 30, l: 20 }, batiment: { L: 12.6, l: 9.2 }, n: 3, reserve: 20, cartouche: 40 };

// ---------- Surfaces des pièces (L1.6.10) ----------

export interface PieceRectangle {
  nom: string;
  /** dimensions intérieures, de nu à nu (m) */
  longueur: number;
  largeur: number;
}

/** Surface de chaque pièce et surface totale (m²). */
export function surfacesPieces(pieces: readonly PieceRectangle[]) {
  const lignes = pieces.map((p) => ({ ...p, surface: arrondi(p.longueur * p.largeur, 4) }));
  return { lignes, total: arrondi(lignes.reduce((s, p) => s + p.surface, 0), 4) };
}

// ---------- Ferraillage : nomenclature d'une poutre (L1.6.11) ----------

/** Nombre de barres réparties sur une longueur, une barre à chaque extrémité : ⌊longueur / e⌋ + 1. */
export function nombreBarresReparties(longueur: number, espacement: number): number {
  if (espacement <= 0) throw new Error('Espacement nul');
  return Math.floor(arrondi(longueur / espacement, 9)) + 1;
}

export interface DonneesPoutreFer {
  /** longueur, largeur et hauteur de la poutre (m) */
  L: number;
  b: number;
  h: number;
  /** enrobage (m) */
  c: number;
  /** aciers inférieurs et supérieurs : nombre et diamètre (mm) */
  nInf: number;
  phiInf: number;
  nSup: number;
  phiSup: number;
  /** cadres : diamètre (mm), espacement (m), distance du premier cadre à l'about (m), longueur forfaitaire d'un crochet (m) */
  phiT: number;
  e: number;
  premier: number;
  crochet: number;
}

export interface LigneNomenclature {
  repere: number;
  designation: string;
  nombre: number;
  phi: number;
  /** longueur d'une barre (m) */
  longueur: number;
  /** longueur cumulée (m) et masse (kg) */
  longueurTotale: number;
  masse: number;
}

/**
 * Nomenclature simplifiée : barres droites filantes arrêtées à l'enrobage, cadres répartis entre deux abouts.
 * Simplification pédagogique : les ancrages et les formes exactes des crochets viennent du calcul de béton armé (L3.3).
 */
export function nomenclaturePoutre(d: DonneesPoutreFer) {
  const filante = arrondi(d.L - 2 * d.c, 4);
  const nCadres = nombreBarresReparties(d.L - 2 * d.premier, d.e);
  const cadre = arrondi(2 * (d.b - 2 * d.c + (d.h - 2 * d.c)) + 2 * d.crochet, 4);
  const ligne = (repere: number, designation: string, nombre: number, phi: number, longueur: number): LigneNomenclature => ({
    repere,
    designation,
    nombre,
    phi,
    longueur,
    longueurTotale: arrondi(nombre * longueur, 4),
    masse: nombre * longueur * masseLineique(phi),
  });
  const lignes = [
    ligne(1, 'barres inférieures', d.nInf, d.phiInf, filante),
    ligne(2, 'barres supérieures', d.nSup, d.phiSup, filante),
    ligne(3, 'cadres', nCadres, d.phiT, cadre),
  ];
  return { lignes, filante, nCadres, cadre, masse: lignes.reduce((s, l) => s + l.masse, 0) };
}

/** Poutre de 4,00 m, 20 × 40 cm : 3 HA 12 en bas, 2 HA 10 en haut, cadres HA 6 tous les 15 cm (données de l'énoncé, L1.6.11). */
export const EXEMPLE_POUTRE_FER: DonneesPoutreFer = { L: 4, b: 0.2, h: 0.4, c: 0.03, nInf: 3, phiInf: 12, nSup: 2, phiSup: 10, phiT: 6, e: 0.15, premier: 0.05, crochet: 0.08 };

// ---------- Indices de révision et nomenclature des menuiseries (L1.6.12) ----------

/** Rang d'un indice de révision : A → 1, B → 2… */
export function rangIndice(indice: string): number {
  if (!/^[A-Z]$/.test(indice)) throw new Error('Indice de A à Z');
  return indice.charCodeAt(0) - 64;
}

/** Nombre de révisions qui manquent au plan du chantier (0 : il est à jour). */
export function retardIndice(chantier: string, actuel: string): number {
  return rangIndice(actuel) - rangIndice(chantier);
}

export interface LigneMenuiserie {
  repere: string;
  designation: string;
  nombre: number;
  /** dimensions de la baie, largeur × hauteur (m) */
  largeur: number;
  hauteur: number;
}

/** Surfaces unitaires et totales d'une nomenclature de menuiseries (m²). */
export function nomenclatureMenuiseries(lignes: readonly LigneMenuiserie[]) {
  const l = lignes.map((m) => ({ ...m, unitaire: arrondi(m.largeur * m.hauteur, 4), surface: arrondi(m.nombre * m.largeur * m.hauteur, 4) }));
  return { lignes: l, nombre: l.reduce((s, m) => s + m.nombre, 0), total: arrondi(l.reduce((s, m) => s + m.surface, 0), 4) };
}

/** Menuiseries extérieures de la maison de L1.6.10 (données de l'énoncé, L1.6.12). */
export const EXEMPLE_MENUISERIES: LigneMenuiserie[] = [
  { repere: 'P1', designation: 'porte d’entrée', nombre: 1, largeur: 0.9, hauteur: 2.1 },
  { repere: 'F1', designation: 'fenêtre de séjour et de chambre', nombre: 3, largeur: 1.2, hauteur: 1.2 },
  { repere: 'F2', designation: 'fenêtre de salle d’eau', nombre: 1, largeur: 0.6, hauteur: 0.6 },
];

// ---------- Modèle de logement (L1.6.6, L1.6.8, L1.6.10, L1.6.12, mini-projet) ----------

/** Rectangle en coordonnées intérieures : origine au nu intérieur sud-ouest, x vers l'est, y vers le nord (m). */
export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export type Facade = 'sud' | 'nord' | 'est' | 'ouest';

export interface BaieExterieure {
  id: string;
  type: 'porte' | 'fenetre';
  facade: Facade;
  /** distance (m) du nu intérieur ouest (façades sud et nord) ou sud (façades est et ouest) au tableau de la baie */
  debut: number;
  largeur: number;
  hauteur: number;
  /** hauteur d'allège au-dessus du sol fini (0 pour une porte) */
  allege: number;
}

export interface PorteInterieure {
  id: string;
  /** cloison parallèle à x ou à y, et coordonnée de son nu inférieur (y0 ou x0) */
  axe: 'x' | 'y';
  nu: number;
  /** début de la baie le long de la cloison et largeur (m) */
  debut: number;
  largeur: number;
  /** côté où s'ouvre le vantail (+1 : vers les x ou les y croissants) et extrémité qui porte les paumelles */
  sens: 1 | -1;
  charniere: 'debut' | 'fin';
}

export interface PieceLogement {
  nom: string;
  /** rectangles disjoints qui composent la pièce (une pièce en L en a deux) */
  rects: Rect[];
  /** niveau fini du sol (m) */
  niveau: number;
}

export interface Logement {
  nom: string;
  /** dimensions intérieures hors cloisons, épaisseurs des murs et des cloisons (m) */
  L: number;
  l: number;
  mur: number;
  cloison: number;
  cloisons: Rect[];
  pieces: PieceLogement[];
  baies: BaieExterieure[];
  portes: PorteInterieure[];
  /** hauteur sous plafond, épaisseurs de dalle et de revêtement, hauteur d'acrotère (m) */
  hsp: number;
  dalle: number;
  revetement: number;
  acrotere: number;
  /** terrain naturel, niveau relatif (m) */
  tn: number;
  /** semelle filante : largeur, hauteur et niveau du fond de fouille (m) */
  semelle: { largeur: number; hauteur: number; fond: number };
  /** abscisse (m) du plan de coupe A-A, perpendiculaire à la façade sud */
  coupe: number;
}

const surfaceRect = (r: Rect) => (r.x1 - r.x0) * (r.y1 - r.y0);

/** Chaîne de cotes extérieure d'une façade : du coin extérieur au coin extérieur, en passant par chaque baie. */
export function cotesFacade(lg: Logement, f: Facade): { partielles: number[]; noms: string[]; total: number } {
  const long = f === 'sud' || f === 'nord' ? lg.L : lg.l;
  const baies = lg.baies.filter((b) => b.facade === f).sort((a, b) => a.debut - b.debut);
  const partielles: number[] = [];
  const noms: string[] = [];
  let fin = -lg.mur;
  for (const b of baies) {
    partielles.push(arrondi(b.debut - fin, 4), b.largeur);
    noms.push('trumeau', b.id);
    fin = b.debut + b.largeur;
  }
  partielles.push(arrondi(long + lg.mur - fin, 4));
  noms.push('trumeau');
  return { partielles, noms, total: chaineCotes(partielles).total };
}

/** Grandeurs tirées du modèle : dimensions hors tout, surfaces, niveaux et cotes des façades. */
export function analyseLogement(lg: Logement) {
  const exterieur = { L: arrondi(lg.L + 2 * lg.mur, 4), l: arrondi(lg.l + 2 * lg.mur, 4) };
  const pieces = lg.pieces.map((p) => ({ nom: p.nom, surface: arrondi(p.rects.reduce((s, r) => s + surfaceRect(r), 0), 4), niveau: p.niveau }));
  const dessusDalle = arrondi(lg.hsp + lg.dalle, 4);
  return {
    exterieur,
    emprise: arrondi(exterieur.L * exterieur.l, 4),
    pieces,
    surfaceTotale: arrondi(pieces.reduce((s, p) => s + p.surface, 0), 4),
    niveaux: {
      fond: lg.semelle.fond,
      dessusSemelle: arrondi(lg.semelle.fond + lg.semelle.hauteur, 4),
      tn: lg.tn,
      brut: niveauBrut(0, lg.revetement),
      sousDalle: lg.hsp,
      dessusDalle,
      acrotere: arrondi(dessusDalle + lg.acrotere, 4),
    },
    hauteurHorsSol: arrondi(dessusDalle + lg.acrotere - lg.tn, 4),
    facades: { sud: cotesFacade(lg, 'sud'), nord: cotesFacade(lg, 'nord'), est: cotesFacade(lg, 'est'), ouest: cotesFacade(lg, 'ouest') },
  };
}

export interface DonneesStudio {
  /** dimensions intérieures du studio (m) */
  L: number;
  l: number;
  mur: number;
  cloison: number;
  /** salle d'eau dans l'angle nord-est : largeur (selon x) et profondeur (selon y) intérieures (m) */
  a: number;
  s: number;
  hsp: number;
  dalle: number;
  revetement: number;
  acrotere: number;
  tn: number;
}

/** Studio : une pièce principale en L et une salle d'eau d'angle ; entrée et fenêtre au sud. */
export function studio(d: DonneesStudio): Logement {
  const { L, l, cloison: c } = d;
  const xs = arrondi(L - d.a, 4);
  const ys = arrondi(l - d.s, 4);
  const porte = { debut: arrondi(xs + 0.15, 4), largeur: 0.7 };
  if (xs - c < 2.4 || ys - c < 1.5) throw new Error('Salle d’eau trop grande pour le studio');
  return {
    nom: 'studio',
    L,
    l,
    mur: d.mur,
    cloison: c,
    cloisons: [
      { x0: xs - c, y0: ys - c, x1: xs, y1: l },
      { x0: xs - c, y0: ys - c, x1: porte.debut, y1: ys },
      { x0: arrondi(porte.debut + porte.largeur, 4), y0: ys - c, x1: L, y1: ys },
    ],
    pieces: [
      { nom: 'pièce principale', rects: [{ x0: 0, y0: 0, x1: L, y1: ys - c }, { x0: 0, y0: ys - c, x1: xs - c, y1: l }], niveau: 0 },
      { nom: 'salle d’eau', rects: [{ x0: xs, y0: ys, x1: L, y1: l }], niveau: -0.02 },
    ],
    baies: [
      { id: 'F1', type: 'fenetre', facade: 'sud', debut: 0.8, largeur: 1.2, hauteur: 1.2, allege: 0.9 },
      { id: 'P1', type: 'porte', facade: 'sud', debut: arrondi(L - 1.8, 4), largeur: 0.9, hauteur: 2.1, allege: 0 },
      { id: 'F2', type: 'fenetre', facade: 'ouest', debut: arrondi((l - 1) / 2, 4), largeur: 1, hauteur: 1.2, allege: 0.9 },
      { id: 'F3', type: 'fenetre', facade: 'nord', debut: arrondi(xs + (d.a - 0.6) / 2, 4), largeur: 0.6, hauteur: 0.6, allege: 1.6 },
    ],
    portes: [{ id: 'P2', axe: 'x', nu: arrondi(ys - c, 4), debut: porte.debut, largeur: porte.largeur, sens: 1, charniere: 'fin' }],
    hsp: d.hsp,
    dalle: d.dalle,
    revetement: d.revetement,
    acrotere: d.acrotere,
    tn: d.tn,
    semelle: { largeur: 0.5, hauteur: 0.25, fond: -0.8 },
    coupe: 1.4,
  };
}

/** Studio de 5,60 × 4,00 m intérieurs, salle d'eau de 1,60 × 1,80 m (données de l'énoncé, mini-projet L1.6.P). */
export const EXEMPLE_STUDIO: DonneesStudio = { L: 5.6, l: 4, mur: 0.2, cloison: 0.1, a: 1.6, s: 1.8, hsp: 2.7, dalle: 0.15, revetement: 0.05, acrotere: 0.4, tn: -0.3 };

export interface DonneesMaison {
  L: number;
  l: number;
  mur: number;
  cloison: number;
  /** largeur intérieure du séjour (selon x) et profondeur de la chambre (selon y) (m) */
  sejour: number;
  chambre: number;
  hsp: number;
  dalle: number;
  revetement: number;
  acrotere: number;
  tn: number;
}

/** Maison de deux pièces : séjour à l'ouest, chambre au sud-est, salle d'eau au nord-est. */
export function maison(d: DonneesMaison): Logement {
  const { L, l, cloison: c } = d;
  const xs = d.sejour;
  const yc = d.chambre;
  if (L - xs - c < 2.4 || l - yc - c < 1.5) throw new Error('Pièces trop petites');
  const porteCh = { y0: 0.4, y1: 1.2 };
  const porteSdb = { y0: arrondi(yc + c + 0.3, 4), y1: arrondi(yc + c + 1.0, 4) };
  return {
    nom: 'maison',
    L,
    l,
    mur: d.mur,
    cloison: c,
    cloisons: [
      { x0: xs, y0: 0, x1: xs + c, y1: porteCh.y0 },
      { x0: xs, y0: porteCh.y1, x1: xs + c, y1: porteSdb.y0 },
      { x0: xs, y0: porteSdb.y1, x1: xs + c, y1: l },
      { x0: xs + c, y0: yc, x1: L, y1: yc + c },
    ],
    pieces: [
      { nom: 'séjour', rects: [{ x0: 0, y0: 0, x1: xs, y1: l }], niveau: 0 },
      { nom: 'chambre', rects: [{ x0: arrondi(xs + c, 4), y0: 0, x1: L, y1: yc }], niveau: 0 },
      { nom: 'salle d’eau', rects: [{ x0: arrondi(xs + c, 4), y0: arrondi(yc + c, 4), x1: L, y1: l }], niveau: -0.02 },
    ],
    baies: [
      { id: 'F1', type: 'fenetre', facade: 'sud', debut: 0.8, largeur: 1.2, hauteur: 1.2, allege: 0.9 },
      { id: 'P1', type: 'porte', facade: 'sud', debut: arrondi(xs - 1.3, 4), largeur: 0.9, hauteur: 2.1, allege: 0 },
      { id: 'F1', type: 'fenetre', facade: 'sud', debut: arrondi(xs + c + (L - xs - c - 1.2) / 2, 4), largeur: 1.2, hauteur: 1.2, allege: 0.9 },
      { id: 'F1', type: 'fenetre', facade: 'nord', debut: 1.2, largeur: 1.2, hauteur: 1.2, allege: 0.9 },
      { id: 'F2', type: 'fenetre', facade: 'nord', debut: arrondi(xs + c + (L - xs - c - 0.6) / 2, 4), largeur: 0.6, hauteur: 0.6, allege: 1.6 },
    ],
    portes: [
      { id: 'P2', axe: 'y', nu: xs, debut: porteCh.y0, largeur: arrondi(porteCh.y1 - porteCh.y0, 4), sens: 1, charniere: 'debut' },
      { id: 'P3', axe: 'y', nu: xs, debut: porteSdb.y0, largeur: arrondi(porteSdb.y1 - porteSdb.y0, 4), sens: 1, charniere: 'fin' },
    ],
    hsp: d.hsp,
    dalle: d.dalle,
    revetement: d.revetement,
    acrotere: d.acrotere,
    tn: d.tn,
    semelle: { largeur: 0.5, hauteur: 0.25, fond: -0.8 },
    coupe: 1.6,
  };
}

/** Maison de 8,40 × 5,60 m intérieurs, séjour de 4,40 m, chambre de 3,40 m de profondeur (données de l'énoncé, L1.6.10). */
export const EXEMPLE_MAISON: DonneesMaison = { L: 8.4, l: 5.6, mur: 0.2, cloison: 0.1, sejour: 4.4, chambre: 3.4, hsp: 2.7, dalle: 0.16, revetement: 0.05, acrotere: 0.5, tn: -0.45 };
