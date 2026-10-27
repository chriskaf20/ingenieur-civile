// Topographie I (module L1.8) : angles en grades, coordonnées, distances et corrections, mesures à la station totale,
// nivellement direct et carnet, gisements, erreurs et tolérances, lever par rayonnement et surface.
import { arrondi } from '@/lib/format';

// ---------- Angles (L1.8.3) ----------

/** Conversions : 400 gon = 360° = 2π rad. */
export const gradEnDegres = (g: number) => (g * 360) / 400;
export const degresEnGrades = (d: number) => (d * 400) / 360;
export const gradEnRad = (g: number) => (g * Math.PI) / 200;
export const radEnGrades = (r: number) => (r * 200) / Math.PI;

/** Angle ramené dans [0 ; 400[ gon. */
export function normaliserGrades(g: number): number {
  return ((g % 400) + 400) % 400;
}

/**
 * Double retournement : lecture en cercle gauche (CG) et en cercle droit (CD) d'une même direction.
 * Horizontal : Hz = (Hz_CG + Hz_CD − 200) / 2 ; vertical : V = (V_CG + 400 − V_CD) / 2 ; collimation et index en sortent.
 */
export function doubleRetournement(HzCG: number, HzCD: number, VCG: number, VCD: number) {
  const ecartHz = normaliserGrades(HzCD - HzCG - 200);
  const corr = ecartHz > 200 ? ecartHz - 400 : ecartHz;
  const Hz = normaliserGrades(HzCG + corr / 2);
  const V = (VCG + 400 - VCD) / 2;
  return { Hz, V, collimation: corr / 2, index: (VCG + VCD - 400) / 2 };
}

/** Angle horizontal entre deux directions lues depuis une même station (de la gauche vers la droite). */
export function angleHorizontal(lectureGauche: number, lectureDroite: number): number {
  return normaliserGrades(lectureDroite - lectureGauche);
}

// ---------- Coordonnées et projection (L1.8.1) ----------

/** Fuseau UTM d'une longitude (°, positive à l'est) et son méridien central. */
export function fuseauUTM(longitude: number): { fuseau: number; meridienCentral: number } {
  const fuseau = Math.floor((longitude + 180) / 6) + 1;
  return { fuseau, meridienCentral: fuseau * 6 - 183 };
}

/** Coordonnées UTM de l'hémisphère sud : on ajoute 10 000 000 m aux ordonnées pour qu'elles restent positives. */
export const FAUX_NORD_SUD = 10_000_000;
export const FAUX_EST = 500_000;

/** Distance plane entre deux points (E, N). */
export function distancePlane(a: { E: number; N: number }, b: { E: number; N: number }): number {
  return Math.hypot(b.E - a.E, b.N - a.N);
}

// ---------- Distances (L1.8.2) ----------

/** Coefficient de dilatation de l'acier d'un ruban (par °C). */
export const DILATATION_ACIER = 11.5e-6;
/** Température d'étalonnage usuelle d'un ruban (°C). */
export const T_ETALONNAGE = 20;

export interface DonneesRuban {
  /** longueur mesurée (m) */
  Lm: number;
  /** longueur réelle du ruban lors de l'étalonnage pour sa longueur nominale (m) */
  nominal: number;
  reel: number;
  /** température pendant la mesure (°C) */
  T: number;
  /** dénivelée entre les deux extrémités (m) */
  dh: number;
}

/** Corrections d'étalonnage, de température et de pente ; renvoie la distance horizontale. */
export function correctionsRuban(d: DonneesRuban) {
  const cEtalon = d.Lm * (d.reel - d.nominal) / d.nominal;
  const cTemp = d.Lm * DILATATION_ACIER * (d.T - T_ETALONNAGE);
  const Lcorr = d.Lm + cEtalon + cTemp;
  const Dh = Math.sqrt(Lcorr * Lcorr - d.dh * d.dh);
  return { cEtalon, cTemp, Lcorr, cPente: Dh - Lcorr, Dh };
}

/** Mesure au ruban de 50 m sous le soleil de Kinshasa (données de l'énoncé, L1.8.2). */
export const EXEMPLE_RUBAN: DonneesRuban = { Lm: 46.385, nominal: 50, reel: 50.008, T: 34, dh: 1.42 };

// ---------- Station totale (L1.8.3) ----------

export interface DonneesVisee {
  /** distance inclinée (m), angle zénithal (gon), hauteur de l'instrument et du prisme (m) */
  Di: number;
  V: number;
  hi: number;
  hp: number;
}

/** Distance horizontale et dénivelée : Dh = Di sin V ; Δh = Di cos V + hi − hp. */
export function viseeStation(d: DonneesVisee) {
  const v = gradEnRad(d.V);
  const Dh = d.Di * Math.sin(v);
  const dhInstrument = d.Di * Math.cos(v);
  return { Dh, dhInstrument, dh: dhInstrument + d.hi - d.hp };
}

export const EXEMPLE_VISEE: DonneesVisee = { Di: 86.412, V: 97.385, hi: 1.55, hp: 1.8 };

// ---------- Nivellement (L1.8.4, L1.8.5) ----------

/** Dénivelée d'une station : lecture arrière moins lecture avant (m). */
export function denivelee(arriere: number, avant: number): number {
  return arrondi(arriere - avant, 4);
}

export interface Station {
  /** point visé en arrière, point visé en avant, lectures sur mire (m) */
  de: string;
  vers: string;
  AR: number;
  AV: number;
}

export interface DonneesCheminement {
  /** point de départ et son altitude connue (m) */
  depart: string;
  Zdepart: number;
  /** altitude connue du point d'arrivée (fermeture), égale au départ pour une boucle */
  Zarrivee: number;
  stations: Station[];
  /** coefficient de tolérance (mm par √station) */
  k: number;
}

/**
 * Carnet de nivellement par cheminement : dénivelées, altitudes provisoires, fermeture,
 * compensation répartie à parts égales entre les stations, altitudes compensées.
 */
export function carnetNivellement(d: DonneesCheminement) {
  const lignes: { de: string; vers: string; AR: number; AV: number; dh: number; Zprov: number; comp: number; Z: number }[] = [];
  let Z = d.Zdepart;
  for (const s of d.stations) {
    const dh = denivelee(s.AR, s.AV);
    Z = arrondi(Z + dh, 4);
    lignes.push({ ...s, dh, Zprov: Z, comp: 0, Z });
  }
  const sommeAR = arrondi(d.stations.reduce((t, s) => t + s.AR, 0), 4);
  const sommeAV = arrondi(d.stations.reduce((t, s) => t + s.AV, 0), 4);
  const fermeture = arrondi(Z - d.Zarrivee, 4);
  const n = d.stations.length;
  const tolerance = (d.k * Math.sqrt(n)) / 1000;
  const unitaire = -fermeture / n;
  lignes.forEach((l, i) => {
    l.comp = arrondi(unitaire * (i + 1), 4);
    l.Z = arrondi(l.Zprov + l.comp, 4);
  });
  return { lignes, sommeAR, sommeAV, controle: arrondi(sommeAR - sommeAV, 4), fermeture, tolerance, admissible: Math.abs(fermeture) <= tolerance + 1e-12, n };
}

/** Cheminement fermé sur un repère de Lubumbashi (données de l'énoncé, L1.8.5). */
export const EXEMPLE_CHEMINEMENT: DonneesCheminement = {
  depart: 'RN1',
  Zdepart: 1243.567,
  Zarrivee: 1243.567,
  k: 10,
  stations: [
    { de: 'RN1', vers: 'A', AR: 1.524, AV: 0.876 },
    { de: 'A', vers: 'B', AR: 2.103, AV: 1.215 },
    { de: 'B', vers: 'C', AR: 0.947, AV: 2.338 },
    { de: 'C', vers: 'RN1', AR: 1.012, AV: 1.151 },
  ],
};

// ---------- Gisements (L1.8.6) ----------

export interface Point2D {
  nom?: string;
  E: number;
  N: number;
}

/** Problème inverse : gisement (gon, depuis le nord, sens horaire) et distance de A vers B. */
export function problemeInverse(A: Point2D, B: Point2D): { G: number; D: number; dE: number; dN: number } {
  const dE = B.E - A.E;
  const dN = B.N - A.N;
  return { G: normaliserGrades(radEnGrades(Math.atan2(dE, dN))), D: Math.hypot(dE, dN), dE, dN };
}

/** Problème direct : coordonnées de B depuis A, un gisement (gon) et une distance horizontale (m). */
export function problemeDirect(A: Point2D, G: number, D: number): Point2D {
  const g = gradEnRad(G);
  return { E: A.E + D * Math.sin(g), N: A.N + D * Math.cos(g) };
}

/** Gisement réciproque : G(BA) = G(AB) ± 200 gon. */
export function gisementReciproque(G: number): number {
  return normaliserGrades(G + 200);
}

// ---------- Erreurs et tolérances (L1.8.7) ----------

/** Moyenne, écarts, écart-type expérimental (n − 1), erreur moyenne quadratique de la moyenne, tolérance à 2,7 σ. */
export function statistiquesMesures(valeurs: readonly number[]) {
  const n = valeurs.length;
  const moyenne = valeurs.reduce((s, v) => s + v, 0) / n;
  const ecarts = valeurs.map((v) => v - moyenne);
  const sigma = Math.sqrt(ecarts.reduce((s, e) => s + e * e, 0) / (n - 1));
  return { n, moyenne, ecarts, sigma, sigmaMoyenne: sigma / Math.sqrt(n), tolerance: 2.7 * sigma, horsTolerance: valeurs.filter((v) => Math.abs(v - moyenne) > 2.7 * sigma) };
}

/** Six mesures de la même distance au ruban (données de l'énoncé, L1.8.7). */
export const EXEMPLE_SERIE = [48.236, 48.241, 48.233, 48.239, 48.244, 48.237];

// ---------- Lever par rayonnement et surface (L1.8.8) ----------

export interface Rayonnement {
  nom: string;
  /** lecture horizontale (gon) et distance horizontale (m) */
  Hz: number;
  D: number;
}

/**
 * Lever par rayonnement depuis une station de coordonnées connues, orientée sur une référence :
 * G0 = gisement de la référence − lecture sur la référence ; G = G0 + Hz.
 */
export function leverRayonnement(S: Point2D, Gref: number, Hzref: number, visees: readonly Rayonnement[]) {
  const G0 = normaliserGrades(Gref - Hzref);
  return { G0, points: visees.map((v) => ({ nom: v.nom, G: normaliserGrades(G0 + v.Hz), D: v.D, ...problemeDirect(S, G0 + v.Hz, v.D) })) };
}

/** Surface (formule des trapèzes, dite de Gauss) et périmètre d'un polygone donné par ses sommets dans l'ordre. */
export function surfacePolygone(p: readonly Point2D[]): { S: number; perimetre: number } {
  // on travaille relativement au premier sommet : les grandes coordonnées UTM ne perdent pas leurs décimales
  const o = p[0]!;
  let s = 0;
  let per = 0;
  p.forEach((a, i) => {
    const b = p[(i + 1) % p.length]!;
    s += (a.E - o.E) * (b.N - o.N) - (b.E - o.E) * (a.N - o.N);
    per += Math.hypot(b.E - a.E, b.N - a.N);
  });
  return { S: Math.abs(s) / 2, perimetre: per };
}

/** Station S d'une parcelle, orientée sur une borne voisine, et les quatre bornes levées (données de l'énoncé, L1.8.8). */
export const EXEMPLE_LEVER = {
  S: { nom: 'S', E: 532_418.25, N: 9_524_672.4 },
  Gref: 52.3184,
  Hzref: 0,
  visees: [
    { nom: 'B1', Hz: 287.4521, D: 18.346 },
    { nom: 'B2', Hz: 362.1087, D: 21.902 },
    { nom: 'B3', Hz: 73.6652, D: 19.517 },
    { nom: 'B4', Hz: 152.9813, D: 17.288 },
  ] satisfies Rayonnement[],
};

// ---------- Mini-projet : nivellement d'un terrain en grille (L1.8.P) ----------

export interface DonneesGrille {
  /** altitude du repère et lecture arrière sur le repère (m) */
  Zrepere: number;
  AR: number;
  /** lectures avant sur chaque nœud de la grille, ligne par ligne (m) */
  lectures: number[][];
  /** pas de la grille (m) et cote projet de la plateforme (m) */
  pas: number;
  Zprojet: number;
}

/**
 * Nivellement par rayonnement depuis une station : altitude du plan de visée Zv = Z_repère + AR ;
 * altitude de chaque nœud Z = Zv − lecture. Hauteurs de remblai ou de déblai par rapport à la cote projet,
 * volume par la méthode des prismes (moyenne des quatre coins de chaque maille × surface de la maille).
 */
export function grilleNivellement(d: DonneesGrille) {
  const Zv = arrondi(d.Zrepere + d.AR, 4);
  const Z = d.lectures.map((l) => l.map((x) => arrondi(Zv - x, 4)));
  const h = Z.map((l) => l.map((z) => arrondi(d.Zprojet - z, 4)));
  let volume = 0;
  for (let i = 0; i < h.length - 1; i++) {
    for (let j = 0; j < h[0]!.length - 1; j++) {
      volume += ((h[i]![j]! + h[i]![j + 1]! + h[i + 1]![j]! + h[i + 1]![j + 1]!) / 4) * d.pas * d.pas;
    }
  }
  const tous = Z.flat();
  return { Zv, Z, h, Zmin: Math.min(...tous), Zmax: Math.max(...tous), Zmoy: tous.reduce((s, z) => s + z, 0) / tous.length, volume };
}

/** Terrain à bâtir de 20 × 15 m, grille de 5 m (données de l'énoncé, L1.8.P). */
export const EXEMPLE_GRILLE: DonneesGrille = {
  Zrepere: 412.35,
  AR: 1.426,
  pas: 5,
  Zprojet: 412.4,
  lectures: [
    [1.212, 1.305, 1.418, 1.537, 1.664],
    [1.284, 1.372, 1.476, 1.598, 1.721],
    [1.351, 1.447, 1.552, 1.668, 1.793],
    [1.433, 1.518, 1.624, 1.741, 1.862],
  ],
};
