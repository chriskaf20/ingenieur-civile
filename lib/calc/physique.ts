// Physique de base (module N0.7). Unités SI : m, s, kg ; les forces sont rendues en kN et les pressions en kPa,
// sauf mention contraire. Chaque valeur normative porte sa référence ; les autres sont des données d'énoncé.
import { MATERIAUX } from './materiauxCourants';
import { PESANTEUR, POIDS_VOLUMIQUE_BA } from './methode';
import { atanD, cosD, sinD } from './trigo';

const RHO_EAU = MATERIAUX.eau.rho; // kg/m³

// ---------- N0.7.1 : cinématique ----------

/** km/h → m/s : 1 km/h = 1 000 m / 3 600 s. */
export function kmhVersMs(v: number): number {
  return v / 3.6;
}

/** m/s → km/h. */
export function msVersKmh(v: number): number {
  return v * 3.6;
}

/** Accélération moyenne (m/s²) entre deux vitesses v0 et v1 (m/s) séparées de dt (s). */
export function accelerationMoyenne(v0: number, v1: number, dt: number): number {
  return (v1 - v0) / dt;
}

/** Mouvement rectiligne uniformément accéléré : position (m) et vitesse (m/s) à l'instant t (s). */
export function mrua(x0: number, v0: number, a: number, t: number): { x: number; v: number } {
  return { x: x0 + v0 * t + 0.5 * a * t * t, v: v0 + a * t };
}

/** Chute libre sans vitesse initiale, résistance de l'air négligée : durée (s) et vitesse d'arrivée après une hauteur h (m). */
export function chuteLibre(h: number, g: number = PESANTEUR): { t: number; v: number; vKmh: number } {
  const t = Math.sqrt((2 * h) / g);
  const v = g * t;
  return { t, v, vKmh: msVersKmh(v) };
}

export interface DonneesArret {
  v: number; // vitesse initiale (km/h)
  tr: number; // temps de réaction du conducteur (s), donnée de l'énoncé
  a: number; // décélération de freinage (m/s², positive), donnée de l'énoncé
}

export const EXEMPLE_ARRET: DonneesArret = { v: 50, tr: 1, a: 4 };

export interface ResultatArret {
  v0: number; // m/s
  dReaction: number; // m, parcourus à vitesse constante pendant la réaction
  dFreinage: number; // m
  dArret: number; // m
  tFreinage: number; // s
  tArret: number; // s
}

/** Distance d'arrêt : réaction à vitesse constante, puis freinage uniformément décéléré (v² = 2 a d). */
export function distanceArret(d: DonneesArret): ResultatArret {
  const v0 = kmhVersMs(d.v);
  const dReaction = v0 * d.tr;
  const dFreinage = (v0 * v0) / (2 * d.a);
  const tFreinage = v0 / d.a;
  return { v0, dReaction, dFreinage, dArret: dReaction + dFreinage, tFreinage, tArret: d.tr + tFreinage };
}

export interface DonneesCycle {
  distance: number; // km, aller simple
  vCharge: number; // km/h, vitesse moyenne chargé
  vVide: number; // km/h, vitesse moyenne à vide
  tFixe: number; // min, chargement + déchargement + manœuvres
  journee: number; // h de travail
}

/** Cycle d'un camion de terrassement : durée d'une rotation (min) et nombre de rotations complètes par jour. */
export function cycleCamion(d: DonneesCycle): { tAller: number; tRetour: number; tCycle: number; rotations: number } {
  const tAller = (d.distance / d.vCharge) * 60;
  const tRetour = (d.distance / d.vVide) * 60;
  const tCycle = tAller + tRetour + d.tFixe;
  return { tAller, tRetour, tCycle, rotations: Math.floor((d.journee * 60) / tCycle + 1e-9) };
}

// ---------- N0.7.2 : lois de Newton ----------

/** Deuxième loi de Newton : force résultante (N) qui donne l'accélération a (m/s²) à la masse m (kg). */
export function forceNewton(m: number, a: number): number {
  return m * a;
}

export interface DonneesLevage {
  m: number; // masse levée (kg)
  a: number; // accélération verticale (m/s²), positive vers le haut
}

export const EXEMPLE_LEVAGE: DonneesLevage = { m: 2000, a: 0.5 };

export interface ResultatLevage {
  P: number; // poids (kN)
  T: number; // tension du câble (kN)
  rapport: number; // T / P
  mou: boolean; // câble détendu : l'accélération vers le bas dépasse g
}

/** Charge suspendue au câble : T − P = m a sur un axe vertical vers le haut, donc T = m (g + a). Un câble ne pousse pas. */
export function levage(d: DonneesLevage, g: number = PESANTEUR): ResultatLevage {
  const P = (d.m * g) / 1000;
  const T = (d.m * (g + d.a)) / 1000;
  return { P, T: Math.max(T, 0), rapport: P > 0 ? Math.max(T, 0) / P : NaN, mou: T < 0 };
}

// ---------- N0.7.3 : poids, frottement, plan incliné ----------

export interface DonneesPlan {
  m: number; // kg
  alpha: number; // pente du plan (°)
  mu: number; // coefficient de frottement, donnée de l'énoncé
}

export const EXEMPLE_PLAN: DonneesPlan = { m: 800, alpha: 15, mu: 0.4 };

export interface ResultatPlan {
  P: number; // kN
  N: number; // réaction normale (kN)
  Ppara: number; // composante du poids le long du plan (kN)
  Fmax: number; // frottement maximal μ N (kN)
  glisse: boolean;
  Fretenir: number; // force à exercer vers le haut du plan pour empêcher la descente (kN)
  Fmonter: number; // force pour faire monter la charge à vitesse constante (kN)
  angleLimite: number; // pente à partir de laquelle la charge glisse seule : arctan μ (°)
}

/** Charge posée sur un plan incliné, frottement de Coulomb (F ≤ μ N), un seul coefficient μ. */
export function planIncline(d: DonneesPlan, g: number = PESANTEUR): ResultatPlan {
  const P = (d.m * g) / 1000;
  const N = P * cosD(d.alpha);
  const Ppara = P * sinD(d.alpha);
  const Fmax = d.mu * N;
  return { P, N, Ppara, Fmax, glisse: Ppara > Fmax + 1e-12, Fretenir: Math.max(0, Ppara - Fmax), Fmonter: Ppara + Fmax, angleLimite: atanD(d.mu) };
}

export interface DonneesArrimage {
  m: number; // masse de la charge (kg)
  a: number; // décélération du camion (m/s²), donnée de l'énoncé
  mu: number; // frottement charge / plateau, donnée de l'énoncé
}

/** Charge non arrimée sur un plateau qui freine : force nécessaire m a, frottement disponible μ m g, manque à reprendre par les sangles. */
export function arrimage(d: DonneesArrimage, g: number = PESANTEUR): { Fnec: number; Ffrot: number; manque: number; glisse: boolean } {
  const Fnec = (d.m * d.a) / 1000;
  const Ffrot = (d.mu * d.m * g) / 1000;
  return { Fnec, Ffrot, manque: Math.max(0, Fnec - Ffrot), glisse: Fnec > Ffrot + 1e-12 };
}

// ---------- N0.7.4 : travail, énergie, puissance ----------

/** 1 kWh = 1 000 W × 3 600 s. */
export const KWH = 3.6e6; // J

/** Énergie potentielle de pesanteur (J) d'une masse m (kg) élevée de h (m). */
export function energiePotentielle(m: number, h: number, g: number = PESANTEUR): number {
  return m * g * h;
}

/** Énergie cinétique (J) d'une masse m (kg) à la vitesse v (m/s). */
export function energieCinetique(m: number, v: number): number {
  return 0.5 * m * v * v;
}

/** Puissance moyenne (W) : travail ou énergie W (J) fourni pendant t (s). */
export function puissance(W: number, t: number): number {
  return W / t;
}

export interface DonneesPompe {
  Q: number; // débit (m³/h)
  H: number; // hauteur manométrique totale (m), donnée de l'énoncé
  eta: number; // rendement du groupe motopompe, donnée de l'énoncé
  V: number; // volume à pomper (m³)
}

export const EXEMPLE_POMPE: DonneesPompe = { Q: 3, H: 25, eta: 0.55, V: 15 };

export interface ResultatPompe {
  Qs: number; // m³/s
  Ph: number; // puissance hydraulique, transmise à l'eau (W)
  Pabs: number; // puissance absorbée (W)
  duree: number; // h
  energieUtile: number; // kWh
  energie: number; // kWh consommés
}

/** Pompe : puissance hydraulique P = ρ g Q H, puissance absorbée P / η, énergie pour pomper V. */
export function pompe(d: DonneesPompe, g: number = PESANTEUR, rho: number = RHO_EAU): ResultatPompe {
  const Qs = d.Q / 3600;
  const Ph = rho * g * Qs * d.H;
  const Pabs = Ph / d.eta;
  const duree = d.V / d.Q;
  return { Qs, Ph, Pabs, duree, energieUtile: (Ph * duree) / 1000, energie: (Pabs * duree) / 1000 };
}

/** Treuil qui lève une masse m (kg) à vitesse constante v (m/s) : effort (kN), puissance utile et absorbée (W). */
export function treuil(m: number, v: number, eta: number, g: number = PESANTEUR): { F: number; Pu: number; Pabs: number } {
  const Pu = m * g * v;
  return { F: (m * g) / 1000, Pu, Pabs: Pu / eta };
}

// ---------- N0.7.5 : pression, hydrostatique, poussée d'Archimède ----------

/** Atmosphère normale : 101 325 Pa (définition). */
export const P_ATM = 101325;

/** Pression relative de l'eau (kPa) à la profondeur h (m) : p = ρ g h. */
export function pressionEau(h: number, rho: number = RHO_EAU, g: number = PESANTEUR): number {
  return (rho * g * h) / 1000;
}

/** Pression (kPa) à la profondeur h (m) dans un fluide de poids volumique gamma (kN/m³) : p = γ h. */
export function pressionFluide(gamma: number, h: number): number {
  return gamma * h;
}

/** Poussée de l'eau sur une paroi verticale, par mètre de largeur : F = ρ g h² / 2 (kN/m), appliquée à h / 3 du fond. */
export function pousseeParoi(h: number, rho: number = RHO_EAU, g: number = PESANTEUR): { F: number; z: number } {
  return { F: (rho * g * h * h) / 2 / 1000, z: h / 3 };
}

/** Poussée d'Archimède (kN) sur un volume immergé V (m³) : poids du fluide déplacé. */
export function archimede(V: number, rho: number = RHO_EAU, g: number = PESANTEUR): number {
  return (rho * g * V) / 1000;
}

export interface DonneesCuve {
  L: number; // longueur extérieure (m)
  l: number; // largeur extérieure (m)
  H: number; // hauteur extérieure (m)
  e: number; // épaisseur des parois, du fond et de la dalle (m)
  hw: number; // hauteur de la nappe au-dessus de la sous-face du fond (m)
}

export const EXEMPLE_CUVE: DonneesCuve = { L: 3, l: 2, H: 2, e: 0.15, hw: 1.5 };

export interface ResultatCuve {
  Vext: number; // m³
  Vint: number; // m³
  Vbeton: number; // m³
  G: number; // poids de la cuve vide (kN)
  hImm: number; // hauteur immergée (m)
  Pi: number; // poussée d'Archimède (kN)
  pFond: number; // pression de l'eau sous le fond (kPa)
  rapport: number; // G / Π
  flotte: boolean;
  hLimite: number; // hauteur de nappe à partir de laquelle la cuve vide se soulève (m)
}

/** Cuve enterrée vide en béton armé dans une nappe : poids propre face à la poussée d'Archimède (terre et frottements négligés). */
export function cuveEnterree(d: DonneesCuve, gamma: number = POIDS_VOLUMIQUE_BA, rho: number = RHO_EAU, g: number = PESANTEUR): ResultatCuve {
  const Vext = d.L * d.l * d.H;
  const Vint = Math.max(0, d.L - 2 * d.e) * Math.max(0, d.l - 2 * d.e) * Math.max(0, d.H - 2 * d.e);
  const Vbeton = Vext - Vint;
  const G = gamma * Vbeton;
  const hImm = Math.min(Math.max(d.hw, 0), d.H);
  const Pi = archimede(d.L * d.l * hImm, rho, g);
  const gammaW = (rho * g) / 1000; // kN/m³
  return {
    Vext,
    Vint,
    Vbeton,
    G,
    hImm,
    Pi,
    pFond: pressionEau(hImm, rho, g),
    rapport: Pi > 0 ? G / Pi : Infinity,
    flotte: Pi > G,
    hLimite: G / (gammaW * d.L * d.l),
  };
}

/** Lest à ajouter au fond d'une cuve vide pour équilibrer la poussée (sans coefficient de sécurité) : poids manquant, volume et épaisseur de béton. */
export function lestCuve(d: DonneesCuve, gamma: number = POIDS_VOLUMIQUE_BA): { manque: number; volume: number; epaisseur: number } {
  const r = cuveEnterree(d, gamma);
  const manque = Math.max(0, r.Pi - r.G);
  const volume = manque / gamma;
  const fond = Math.max(0, d.L - 2 * d.e) * Math.max(0, d.l - 2 * d.e);
  return { manque, volume, epaisseur: fond > 0 ? volume / fond : NaN };
}

// ---------- N0.7.6 : dilatation thermique ----------

/** Béton : α = 10 × 10⁻⁶ K⁻¹ (EN 1992-1-1 §3.1.3(5)). */
export const ALPHA_BETON = 10e-6;
/** Acier de construction : α = 12 × 10⁻⁶ K⁻¹ (EN 1993-1-1 §3.2.6, T ≤ 100 °C). */
export const ALPHA_ACIER = 12e-6;

export const MATERIAUX_THERMIQUES = {
  beton: {
    nom: 'béton C25/30',
    alpha: ALPHA_BETON,
    E: 31000, // MPa : Ecm, EN 1992-1-1 tableau 3.1
    limite: 2.6, // MPa : fctm, EN 1992-1-1 tableau 3.1
    nomLimite: 'résistance moyenne à la traction fctm',
    source: 'EN 1992-1-1 §3.1.3(5) et tableau 3.1',
  },
  acier: {
    nom: 'acier S235',
    alpha: ALPHA_ACIER,
    E: 210000, // MPa : EN 1993-1-1 §3.2.6
    limite: 235, // MPa : fy, EN 1993-1-1 tableau 3.1 (t ≤ 40 mm)
    nomLimite: 'limite d’élasticité fy',
    source: 'EN 1993-1-1 §3.2.6 et tableau 3.1',
  },
} as const;

export type MateriauThermique = keyof typeof MATERIAUX_THERMIQUES;

/** Allongement libre ΔL = α L ΔT (même unité que L). */
export function allongementThermique(L: number, alpha: number, dT: number): number {
  return alpha * L * dT;
}

export interface DonneesDilatation {
  L: number; // longueur de l'élément (m)
  dT: number; // variation de température (K, ou °C)
  materiau: MateriauThermique;
}

export const EXEMPLE_DILATATION: DonneesDilatation = { L: 30, dT: 25, materiau: 'beton' };

export interface ResultatDilatation {
  alpha: number; // K⁻¹
  dL: number; // allongement libre (mm)
  sigma: number; // contrainte si l'allongement est totalement empêché : E α ΔT (MPa)
  E: number; // MPa
  limite: number; // MPa
  rapport: number; // σ / limite
}

/** Élément libre (allongement) puis totalement bloqué (contrainte) ; fluage et retrait négligés. */
export function dilatation(d: DonneesDilatation): ResultatDilatation {
  const m = MATERIAUX_THERMIQUES[d.materiau];
  const sigma = m.E * m.alpha * Math.abs(d.dT);
  return { alpha: m.alpha, dL: allongementThermique(d.L, m.alpha, d.dT) * 1000, sigma, E: m.E, limite: m.limite, rapport: sigma / m.limite };
}

/** Distance entre joints de dilatation : valeur recommandée 30 m (EN 1992-1-1 §2.3.3(3)), modifiable par l'annexe nationale. */
export const D_JOINT_RECOMMANDE = 30;

/** Effort (kN) qu'exerce sur ses appuis un élément de section A (mm²) dont la dilatation est totalement empêchée. */
export function effortThermique(d: DonneesDilatation, A: number): number {
  return (dilatation(d).sigma * A) / 1000;
}

/** Découpage d'une longueur L (m) en blocs d'au plus dJoint (m) : nombre de blocs, de joints et longueur d'un bloc. */
export function decoupageJoints(L: number, dJoint: number): { blocs: number; joints: number; Lbloc: number } {
  const blocs = Math.max(1, Math.ceil(L / dJoint - 1e-9));
  return { blocs, joints: blocs - 1, Lbloc: L / blocs };
}

// ---------- N0.7.7 : électricité de chantier ----------

/** Tensions normalisées (CEI 60038) : 230 V entre phase et neutre, 400 V entre phases. */
export const TENSION_MONO = 230;
export const TENSION_TRI = 400;

/** Courant (A) absorbé par une puissance active P (W) en monophasé : P = U I cos φ. */
export function courantMono(P: number, cosPhi: number, U: number = TENSION_MONO): number {
  return P / (U * cosPhi);
}

/** Courant (A) par phase en triphasé équilibré : P = √3 U I cos φ, U entre phases. */
export function courantTri(P: number, cosPhi: number, U: number = TENSION_TRI): number {
  return P / (Math.sqrt(3) * U * cosPhi);
}

/** Gamme de puissances de groupes électrogènes (kVA) prise comme hypothèse : à remplacer par le catalogue du loueur. */
export const TAILLES_GROUPES = [5, 10, 15, 20, 30, 40, 60, 80, 100] as const;

export interface DonneesGroupe {
  betonniere: number; // kW
  vibreur: number; // kW
  pompe: number; // kW
  eclairage: number; // kW
  cosPhi: number; // facteur de puissance global, simplification
  k: number; // appel au démarrage du plus gros moteur, en multiple de sa puissance (règle de l'art, à vérifier)
  reseau: 'mono' | 'tri';
}

export const EXEMPLE_GROUPE: DonneesGroupe = { betonniere: 2.2, vibreur: 1.5, pompe: 0.75, eclairage: 1, cosPhi: 0.8, k: 3, reseau: 'tri' };

export interface ResultatGroupe {
  P: number; // puissance active totale (kW)
  Pmax: number; // plus gros moteur (kW)
  S: number; // puissance apparente en marche (kVA)
  Sdem: number; // puissance apparente au démarrage du plus gros moteur (kVA)
  groupe: number | null; // plus petite taille de la gamme qui couvre Sdem (kVA)
  U: number; // V
  I: number; // courant en marche (A)
}

/** Bilan de puissance d'un chantier : tout fonctionne en même temps, puis le plus gros moteur démarre. */
export function bilanGroupe(d: DonneesGroupe): ResultatGroupe {
  const moteurs = [d.betonniere, d.vibreur, d.pompe];
  const P = moteurs.reduce((s, p) => s + p, 0) + d.eclairage;
  const Pmax = Math.max(...moteurs);
  const S = P / d.cosPhi;
  const Sdem = (P + (d.k - 1) * Pmax) / d.cosPhi;
  const groupe = TAILLES_GROUPES.find((t) => t >= Sdem - 1e-9) ?? null;
  const U = d.reseau === 'mono' ? TENSION_MONO : TENSION_TRI;
  const I = d.reseau === 'mono' ? courantMono(P * 1000, d.cosPhi, U) : courantTri(P * 1000, d.cosPhi, U);
  return { P, Pmax, S, Sdem, groupe, U, I };
}

/** Énergie produite par un groupe (kWh) pour une puissance P (kW) pendant t (h), et carburant pour une consommation spécifique c (L/kWh, donnée). */
export function consommationGroupe(P: number, t: number, c: number): { E: number; litres: number } {
  const E = P * t;
  return { E, litres: E * c };
}

// ---------- N0.7.P : château d'eau ----------

export interface DonneesChateau {
  D: number; // diamètre intérieur de la cuve (m)
  h: number; // hauteur d'eau, cuve pleine (m)
  H: number; // hauteur du fond de cuve au-dessus du sol (m)
  Gs: number; // poids de la structure vide, radier compris (kN), donnée de l'énoncé
  B: number; // côté du radier carré (m)
  zf: number; // profondeur du niveau de l'eau dans le forage, en pompage (m)
  eta: number; // rendement du groupe motopompe, donnée de l'énoncé
  t: number; // durée de remplissage (h)
}

export const EXEMPLE_CHATEAU: DonneesChateau = { D: 4, h: 3, H: 12, Gs: 650, B: 5, zf: 20, eta: 0.5, t: 6 };

export interface ResultatChateau {
  S: number; // section de la cuve (m²)
  V: number; // m³
  masse: number; // kg
  Geau: number; // kN
  N: number; // charge totale sur le sol (kN)
  sigma: number; // pression moyenne sous le radier (kPa)
  pFond: number; // pression de l'eau sur le fond de cuve (kPa)
  pSol: number; // pression statique à un robinet au niveau du sol (kPa)
  dz: number; // hauteur d'élévation de l'eau, du forage à l'arrivée en haut de cuve (m)
  Eu: number; // énergie transmise à l'eau (kWh)
  Ea: number; // énergie consommée (kWh)
  Q: number; // débit (m³/h)
  Ph: number; // W
  Pabs: number; // W
}

/** Château d'eau : poids, pressions, énergie et puissance de pompage (pertes de charge négligées). */
export function chateauEau(d: DonneesChateau, g: number = PESANTEUR, rho: number = RHO_EAU): ResultatChateau {
  const S = (Math.PI * d.D * d.D) / 4;
  const V = S * d.h;
  const masse = rho * V;
  const Geau = (masse * g) / 1000;
  const N = Geau + d.Gs;
  const dz = d.zf + d.H + d.h;
  const Eu = energiePotentielle(masse, dz, g) / KWH;
  const Q = V / d.t;
  const Ph = rho * g * (Q / 3600) * dz;
  return {
    S,
    V,
    masse,
    Geau,
    N,
    sigma: N / (d.B * d.B),
    pFond: pressionEau(d.h, rho, g),
    pSol: pressionEau(d.H + d.h, rho, g),
    dz,
    Eu,
    Ea: Eu / d.eta,
    Q,
    Ph,
    Pabs: Ph / d.eta,
  };
}
