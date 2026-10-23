// Ordres de grandeur et contrôles rapides (N0.3.7, N0.3.P).
// Les règles de prédimensionnement ci-dessous sont des règles de l'art, non normatives :
// elles servent à estimer et à contrôler, jamais à justifier (A_VERIFIER.md).
import { PESANTEUR, POIDS_VOLUMIQUE_BA, poidsElement, unChiffre } from './methode';

/**
 * Règle de l'art de prédimensionnement : un bâtiment courant en béton armé pèse de l'ordre de
 * 10 kN/m² par niveau (« 1 t/m² par niveau »), charges comprises. Hypothèse à remplacer par une
 * descente de charges (L3.2).
 */
export const CHARGE_GLOBALE_NIVEAU = 10;

/**
 * EN 1991-1-1, tableau 6.2, catégorie A (logements), planchers : fourchette de qk (kN/m²) ;
 * la valeur retenue dépend de l'annexe nationale (L3.2). À confirmer sur le texte (A_VERIFIER.md).
 */
export const EXPLOITATION_LOGEMENT = [1.5, 2] as const;

/** Prédimensionnement (règle de l'art) : hauteur de poutre entre L/15 et L/10, épaisseur de dalle entre L/30 et L/20. */
export const PREDIM = { poutre: [15, 10], dalle: [30, 20] } as const;

export function fourchettePoutre(L: number): { min: number; max: number } {
  return { min: L / PREDIM.poutre[0], max: L / PREDIM.poutre[1] };
}

export function fourchetteDalle(L: number): { min: number; max: number } {
  return { min: L / PREDIM.dalle[0], max: L / PREDIM.dalle[1] };
}

// ---------- Estimation du poids d'un bâtiment (N0.3.7) ----------

export interface DonneesBatiment {
  S: number; // surface d'un niveau (m²)
  niveaux: number; // nombre de planchers portés
  q: number; // charge globale par niveau (kN/m²), hypothèse
  poteaux: number;
}

export const EXEMPLE_BATIMENT: DonneesBatiment = { S: 120, niveaux: 2, q: CHARGE_GLOBALE_NIVEAU, poteaux: 9 };

export interface ResultatBatiment {
  W: number; // kN
  masse: number; // t
  parPoteau: number; // kN, répartition égale supposée
  parM2Sol: number; // kN/m² d'emprise
}

export function estimationBatiment(d: DonneesBatiment): ResultatBatiment {
  const W = d.S * d.niveaux * d.q;
  return { W, masse: W / PESANTEUR, parPoteau: W / d.poteaux, parM2Sol: W / d.S };
}

// ---------- Poids propres du mini-projet (N0.3.P) ----------

export interface ResultatPoidsPropre {
  V: number; // m³
  P: number; // kN
  /** charge surfacique (kN/m², dalle) ou linéique (kN/m, poutre et mur) */
  charge: number;
  /** données arrondies à un chiffre significatif, pour le contrôle de tête */
  arrondies: [number, number, number];
  estimation: number; // kN
  ecart: number; // relatif
}

/** Hypothèse de l'énoncé du mini-projet : mur en blocs pleins de béton (kN/m³), à vérifier sur la fiche du fabricant. */
export const POIDS_VOLUMIQUE_MACONNERIE_ENONCE = 20;

export const EXEMPLE_POIDS_PROPRES = {
  dalle: { Lx: 5, Ly: 4, e: 0.15 },
  poutre: { L: 5, b: 0.2, h: 0.4 },
  mur: { L: 5, H: 2.8, e: 0.2, gamma: POIDS_VOLUMIQUE_MACONNERIE_ENONCE },
} as const;

function resultat(L: number, b: number, h: number, gamma: number, charge: number): ResultatPoidsPropre {
  const r = poidsElement({ L, b, h, gamma });
  return { V: r.volume, P: r.poids, charge, arrondies: [unChiffre(L), unChiffre(b), unChiffre(h)], estimation: r.estimation, ecart: r.ecartEstimation };
}

/** Dalle Lx × Ly d'épaisseur e (m) : poids total (kN) et charge surfacique e·γ (kN/m²). */
export function poidsDalle(Lx: number, Ly: number, e: number, gamma: number = POIDS_VOLUMIQUE_BA): ResultatPoidsPropre {
  return resultat(Lx, Ly, e, gamma, e * gamma);
}

/** Élément linéaire de longueur L et de section b × h (m) : poids (kN) et charge linéique b·h·γ (kN/m). */
export function poidsLineaire(L: number, b: number, h: number, gamma: number): ResultatPoidsPropre {
  return resultat(L, b, h, gamma, b * h * gamma);
}

/** Seuil pédagogique (N0.1.3) : deux valeurs sont du même ordre de grandeur si leur écart relatif reste sous 50 %. */
export const SEUIL_ORDRE_GRANDEUR = 0.5;

export function memeOrdre(ecart: number): boolean {
  return Math.abs(ecart) < SEUIL_ORDRE_GRANDEUR;
}

export interface BilanPoidsPropres {
  total: number; // kN
  estimationRegle: number; // kN, surface × q
  ecart: number; // relatif, (total − estimation) / estimation
}

/**
 * Somme de poids propres (kN) comparée à la règle de l'art « q kN/m² de plancher » (CHARGE_GLOBALE_NIVEAU).
 * La règle inclut aussi l'exploitation et les finitions : un total un peu inférieur est normal.
 */
export function bilanPoidsPropres(poids: readonly number[], surfacePlancher: number, q: number = CHARGE_GLOBALE_NIVEAU): BilanPoidsPropres {
  const total = poids.reduce((a, b) => a + b, 0);
  const estimationRegle = surfacePlancher * q;
  return { total, estimationRegle, ecart: (total - estimationRegle) / estimationRegle };
}
