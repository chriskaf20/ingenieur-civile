// Matériaux de construction (module L2.6) : propriétés physiques, essai de traction, granulométrie,
// formulation simplifiée du béton, classes normatives (à vérifier), aciers, bois, maçonnerie, mortiers, cure.

// ---------- Propriétés physiques ----------

export interface DonneesEchantillon {
  ms: number; // masse sèche (g)
  msat: number; // masse saturée surface sèche (g)
  Vapp: number; // volume apparent (cm³)
  rhoAbs: number; // masse volumique absolue du solide (g/cm³)
}

/** Masse volumique apparente, porosité, compacité et coefficient d'absorption d'eau. */
export function proprietesPhysiques(d: DonneesEchantillon) {
  const rhoApp = d.ms / d.Vapp; // g/cm³
  const Vs = d.ms / d.rhoAbs;
  const porosite = 1 - Vs / d.Vapp;
  const absorption = (d.msat - d.ms) / d.ms;
  const porositeOuverte = (d.msat - d.ms) / d.Vapp; // eau 1 g/cm³
  return { rhoApp, Vs, porosite, compacite: 1 - porosite, absorption, porositeOuverte };
}

/** Brique de terre cuite de l'exemple : 2 150 g sec, 2 430 g saturée, 1 220 cm³, ρabs 2,65 g/cm³. */
export const EXEMPLE_ECHANTILLON: DonneesEchantillon = { ms: 2150, msat: 2430, Vapp: 1220, rhoAbs: 2.65 };

// ---------- Essai de traction ----------

export interface DonneesTraction {
  d0: number; // diamètre initial (mm)
  L0: number; // longueur entre repères (mm)
  Fe: number; // force à la limite d'élasticité (kN)
  Fm: number; // force maximale (kN)
  Lu: number; // longueur après rupture (mm)
  du: number; // diamètre minimal après rupture (mm)
}

/** Limite d'élasticité Re, résistance Rm, allongement après rupture A, striction Z, rapport Rm/Re. */
export function essaiTraction(d: DonneesTraction) {
  const S0 = (Math.PI * d.d0 * d.d0) / 4;
  const Su = (Math.PI * d.du * d.du) / 4;
  const Re = (d.Fe * 1000) / S0;
  const Rm = (d.Fm * 1000) / S0;
  return { S0, Re, Rm, A: (d.Lu - d.L0) / d.L0, Z: (S0 - Su) / S0, rapport: Rm / Re };
}

/** Barre HA 12 de l'exemple : L0 = 5 d = 60 mm, Fe = 58 kN, Fm = 67 kN, Lu = 70,8 mm, du = 8,4 mm. */
export const EXEMPLE_TRACTION: DonneesTraction = { d0: 12, L0: 60, Fe: 58, Fm: 67, Lu: 70.8, du: 8.4 };

// ---------- Granulométrie ----------

/** Tamis de la série de base EN 933-2 utilisés ici (mm). */
export const TAMIS = [0.063, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 31.5] as const;
/** Tamis du module de finesse (EN 12620, annexe B) : 0,125 à 4 mm. */
export const TAMIS_MF = [0.125, 0.25, 0.5, 1, 2, 4] as const;

/** Refus cumulés et passants (%) à partir des masses retenues sur chaque tamis (du plus fin au plus gros) et du fond. */
export function analyseGranulo(retenus: readonly number[], fond: number) {
  const total = retenus.reduce((s, m) => s + m, 0) + fond;
  const n = retenus.length;
  const refusCumules = retenus.map((_, i) => (retenus.slice(i).reduce((s, m) => s + m, 0) / total) * 100);
  const passants = refusCumules.map((r) => 100 - r);
  const mf = TAMIS_MF.reduce((s, t) => {
    const i = TAMIS.indexOf(t);
    return s + (i >= 0 && i < n ? refusCumules[i]! : 100);
  }, 0) / 100;
  return { total, refusCumules, passants, mf, fines: (fond / total) * 100 };
}

/** Sable de rivière de l'exemple : masses (g) retenues sur 0,063 … 31,5 mm, et fond. */
export const EXEMPLE_SABLE = { retenus: [42, 118, 236, 262, 168, 96, 48, 0, 0, 0], fond: 30 };

// ---------- Béton frais ----------

/** Classes d'affaissement de l'EN 206 (tableau 3) : bornes en mm. */
export const CLASSES_AFFAISSEMENT = [
  { classe: 'S1', min: 10, max: 40 },
  { classe: 'S2', min: 50, max: 90 },
  { classe: 'S3', min: 100, max: 150 },
  { classe: 'S4', min: 160, max: 210 },
  { classe: 'S5', min: 220, max: Infinity },
] as const;

/** Classe d'affaissement d'une mesure (mm), ou « hors classe » entre deux plages. */
export function classeAffaissement(a: number): string {
  return CLASSES_AFFAISSEMENT.find((c) => a >= c.min && a <= c.max)?.classe ?? 'hors classe';
}

// ---------- Formulation (Bolomey / Dreux simplifiée) ----------

export interface DonneesFormulation {
  fcm: number; // résistance moyenne visée à 28 j (MPa)
  sigmaC: number; // classe vraie du ciment (MPa)
  G: number; // coefficient granulaire (qualité des granulats)
  C: number; // dosage en ciment retenu (kg/m³)
  air: number; // air occlus (L/m³)
  pSable: number; // part du sable dans le volume absolu des granulats (%)
  rhoC: number; // masse volumique absolue du ciment (kg/L)
  rhoG: number; // masse volumique absolue des granulats (kg/L)
}

/**
 * Formulation de 1 m³ par la loi de Bolomey (fcm = G σc (C/E − 0,5), base de la méthode Dreux-Gorisse),
 * puis volumes absolus : 1 000 L = ciment + eau + air + granulats. Simplification pédagogique : dosage en ciment
 * et partage sable/gravier fixés par l'utilisateur au lieu des abaques et de la courbe de référence de Dreux.
 */
export function formulation(d: DonneesFormulation) {
  const CsurE = d.fcm / (d.G * d.sigmaC) + 0.5;
  const E = d.C / CsurE;
  const Vc = d.C / d.rhoC;
  const Vg = 1000 - Vc - E - d.air;
  const Vsable = (Vg * d.pSable) / 100;
  const Vgravier = Vg - Vsable;
  const sable = Vsable * d.rhoG;
  const gravier = Vgravier * d.rhoG;
  return { CsurE, EsurC: 1 / CsurE, E, Vc, Vg, Vsable, Vgravier, sable, gravier, masse: d.C + E + sable + gravier, sacs: d.C / 50 };
}

/** Béton de l'exemple : fcm visé 33 MPa, ciment de classe vraie 45 MPa, G = 0,5, 350 kg, 15 L d'air, 40 % de sable. */
export const EXEMPLE_FORMULATION: DonneesFormulation = { fcm: 33, sigmaC: 45, G: 0.5, C: 350, air: 15, pSable: 40, rhoC: 3.1, rhoG: 2.65 };

// ---------- Durabilité (EN 206 annexe F, valeurs recommandées) ----------

export const EXPOSITION = [
  { classe: 'XC1', milieu: 'intérieur sec ou toujours immergé', fck: 'C20/25', EC: 0.65, Cmin: 260 },
  { classe: 'XC2', milieu: 'humide, rarement sec (fondations)', fck: 'C25/30', EC: 0.6, Cmin: 280 },
  { classe: 'XC3', milieu: 'humidité modérée, abrité de la pluie', fck: 'C30/37', EC: 0.55, Cmin: 280 },
  { classe: 'XC4', milieu: 'alternance humide et sec (façades)', fck: 'C30/37', EC: 0.5, Cmin: 300 },
  { classe: 'XS1', milieu: 'air marin, sans contact avec l’eau de mer', fck: 'C30/37', EC: 0.5, Cmin: 300 },
  { classe: 'XA1', milieu: 'sol ou eau faiblement agressifs', fck: 'C30/37', EC: 0.55, Cmin: 300 },
  { classe: 'XA2', milieu: 'moyennement agressifs', fck: 'C30/37', EC: 0.5, Cmin: 320 },
  { classe: 'XA3', milieu: 'fortement agressifs', fck: 'C35/45', EC: 0.45, Cmin: 360 },
] as const;

// ---------- Mise en œuvre en climat chaud ----------

/**
 * Taux d'évaporation d'une surface de béton frais (kg/m²/h), formule d'Uno reprenant l'abaque de l'ACI 305R :
 * E = 5 [(Tc + 18)^2,5 − r (Ta + 18)^2,5] (V + 4) × 10⁻⁶ (Tc béton, Ta air en °C, r humidité relative 0–1, V vent en km/h).
 */
export function evaporation(Tc: number, Ta: number, r: number, V: number): number {
  return 5 * ((Tc + 18) ** 2.5 - r * (Ta + 18) ** 2.5) * (V + 4) * 1e-6;
}

// ---------- Mortiers ----------

/** Enduit : volume de mortier (+ pertes), ciment en sacs de 50 kg et sable, pour une surface S (m²) d'épaisseur e (mm). */
export function enduit(S: number, e: number, dosage: number, pertes = 0.1) {
  const V = S * (e / 1000) * (1 + pertes); // m³ de mortier
  const ciment = V * dosage;
  return { V, ciment, sacs: Math.ceil(ciment / 50), sable: V * 1.1 }; // ≈ 1,1 m³ de sable sec par m³ de mortier (hypothèse)
}

// ---------- Aciers ----------

export const DIAMETRES_HA = [6, 8, 10, 12, 14, 16, 20, 25, 32] as const;

/** Section (mm²) et masse linéique (kg/m) d'une barre de diamètre d (mm), ρ = 7 850 kg/m³. */
export function barreHA(d: number) {
  const A = (Math.PI * d * d) / 4;
  return { A, masse: (A * 1e-6) * 7850 };
}

/** Section totale de n barres de diamètre d et masse pour une longueur L (m). */
export function lotBarres(n: number, d: number, L: number) {
  const b = barreHA(d);
  return { A: n * b.A, masse: n * b.masse * L };
}

/** Limites d'élasticité des nuances d'acier de construction (EN 10025-2, épaisseurs ≤ 16 mm). */
export const NUANCES = [
  { nuance: 'S235', fy: 235, fu: 360 },
  { nuance: 'S275', fy: 275, fu: 430 },
  { nuance: 'S355', fy: 355, fu: 490 },
] as const;

// ---------- Bois ----------

/** Teneur en eau du bois H = (mh − ms)/ms et retrait linéaire estimé entre deux humidités (coefficient par % d'humidité). */
export function humiditeBois(mh: number, ms: number) {
  return { H: (mh - ms) / ms };
}

export function retraitBois(largeur: number, H1: number, H2: number, coef: number, Hsat = 30) {
  const dH = Math.min(H1, Hsat) - Math.min(H2, Hsat);
  return (largeur * coef * dH) / 100;
}

// ---------- Maçonnerie ----------

export interface ElementMaconnerie {
  nom: string;
  L: number; // longueur (cm)
  H: number; // hauteur (cm)
  joint: number; // épaisseur de joint (cm)
}

/** Nombre d'éléments par m² de mur (joints compris). */
export function elementsParM2(e: ElementMaconnerie): number {
  return 10000 / ((e.L + e.joint) * (e.H + e.joint));
}

export const ELEMENTS: readonly ElementMaconnerie[] = [
  { nom: 'parpaing creux 40 × 20 × 15', L: 40, H: 20, joint: 1 },
  { nom: 'brique cuite pleine 22 × 6,5 × 10,5', L: 22, H: 6.5, joint: 1.2 },
  { nom: 'BTC 29,5 × 9 × 14', L: 29.5, H: 9, joint: 1 },
];

// ---------- Enduit superficiel routier ----------

/** Enduit monocouche : liant (kg/m²) et gravillons (L/m²) pour une surface S (m²) ; citernes et camions. */
export function enduitSuperficiel(S: number, liant: number, gravillons: number) {
  const liantT = (S * liant) / 1000; // t
  const gravM3 = (S * gravillons) / 1000; // m³
  return { liantT, gravM3, camions: Math.ceil(gravM3 / 10) };
}

// ---------- Vérification d'un béton vis-à-vis d'une classe d'exposition ----------

/** Contrôle E/C maximal et ciment minimal d'une classe d'exposition (valeurs recommandées EN 206 annexe F). */
export function controleExposition(classe: number, C: number, E: number) {
  const x = EXPOSITION[Math.max(0, Math.min(EXPOSITION.length - 1, Math.round(classe)))]!;
  const EC = E / C;
  return { ...x, EsurC: EC, okEC: EC <= x.EC + 1e-9, okC: C >= x.Cmin };
}

// ---------- Tirant en acier de construction ----------

/** Effort plastique d'un tirant : N = A fy (sans coefficient partiel, pédagogique). */
export function effortNuance(A: number, nuance: number) {
  const n = NUANCES[Math.max(0, Math.min(NUANCES.length - 1, Math.round(nuance)))]!;
  return { ...n, N: (A * n.fy) / 1000 };
}
