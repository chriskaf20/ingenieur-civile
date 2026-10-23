// Masses volumiques et poids volumiques des matériaux courants (N0.3.4).
// Chaque valeur porte sa source et sa nature : norme, valeur physique ou hypothèse de projet.
import { MASSE_VOLUMIQUE_ACIER } from './acier';
import { PESANTEUR, POIDS_VOLUMIQUE_BA, POIDS_VOLUMIQUE_BETON } from './methode';

export type NatureValeur = 'norme' | 'physique' | 'hypothese';

export interface Materiau {
  nom: string;
  /** poids volumique donné par la source (kN/m³) */
  gamma?: number;
  /** masse volumique donnée par la source (kg/m³) */
  rho?: number;
  /** fourchette de la source ou d'ordre de grandeur (kN/m³) */
  fourchette?: readonly [number, number];
  hachure: 'ba' | 'beton' | 'acier' | 'eau' | 'terre';
  source: string;
  nature: NatureValeur;
}

/** Hypothèse de l'énoncé pour une terre compactée (kN/m³) : un sol se mesure au laboratoire (L3.4). */
export const POIDS_VOLUMIQUE_TERRE_HYPOTHESE = 18;

export const MATERIAUX = {
  ba: {
    nom: 'béton armé',
    gamma: POIDS_VOLUMIQUE_BA,
    hachure: 'ba',
    source: 'EN 1991-1-1, annexe A, tableau A.1 : béton normal 24 kN/m³, + 1 kN/m³ pour les armatures',
    nature: 'norme',
  },
  baFrais: {
    nom: 'béton armé frais',
    gamma: POIDS_VOLUMIQUE_BA + 1,
    hachure: 'ba',
    source: 'EN 1991-1-1, tableau A.1 : + 1 kN/m³ pour un béton non durci (coffrages)',
    nature: 'norme',
  },
  beton: {
    nom: 'béton non armé',
    gamma: POIDS_VOLUMIQUE_BETON,
    hachure: 'beton',
    source: 'EN 1991-1-1, annexe A, tableau A.1 : béton normal',
    nature: 'norme',
  },
  acier: {
    nom: 'acier',
    rho: MASSE_VOLUMIQUE_ACIER,
    fourchette: [77, 78.5],
    hachure: 'acier',
    source: 'EN 1992-1-1 §3.2.7(3) : ρ = 7 850 kg/m³ ; EN 1991-1-1 tableau A.4 : 77,0 à 78,5 kN/m³',
    nature: 'norme',
  },
  eau: {
    nom: 'eau douce',
    rho: 1000,
    hachure: 'eau',
    source: 'valeur physique arrondie (999,97 kg/m³ à 4 °C)',
    nature: 'physique',
  },
  terre: {
    nom: 'terre compactée',
    gamma: POIDS_VOLUMIQUE_TERRE_HYPOTHESE,
    fourchette: [16, 22],
    hachure: 'terre',
    source: 'hypothèse de l’énoncé ; ordre de grandeur courant 16 à 22 kN/m³, à mesurer (L3.4)',
    nature: 'hypothese',
  },
} as const satisfies Record<string, Materiau>;

export type IdMateriau = keyof typeof MATERIAUX;

/** ρ (kg/m³) et γ (kN/m³) d'un matériau ; la grandeur absente se déduit de γ = ρ·g. */
export function proprietesMateriau(id: IdMateriau, g: number = PESANTEUR): { rho: number; gamma: number } {
  const m: Materiau = MATERIAUX[id];
  if (m.gamma !== undefined) return { gamma: m.gamma, rho: (m.gamma * 1000) / g };
  return { rho: m.rho!, gamma: (m.rho! * g) / 1000 };
}

export interface ResultatPoidsMateriau {
  V: number; // m³
  rho: number; // kg/m³
  gamma: number; // kN/m³
  m: number; // kg
  P: number; // kN
}

/** Masse et poids d'un prisme L × b × h (m) du matériau choisi. */
export function poidsPrismeMateriau(id: IdMateriau, L: number, b: number, h: number): ResultatPoidsMateriau {
  const { rho, gamma } = proprietesMateriau(id);
  const V = L * b * h;
  return { V, rho, gamma, m: rho * V, P: gamma * V };
}

/** Volume (m³) correspondant à une masse m (kg) du matériau : V = m / ρ (ex. charge utile d'un camion). */
export function volumePourMasse(m: number, id: IdMateriau): number {
  return m / proprietesMateriau(id).rho;
}
