// Module N0.1 — Méthode de travail : calculs simples utilisés par les leçons
// (révisions espacées, poids propre, présentation d'un calcul, budget-temps).
import { arrondi, arrondiSup } from '@/lib/format';

// ---------- Révisions espacées (N0.1.1) ----------

/**
 * Intervalles de révision en jours après le cours : J+1, J+3, J+7, J+14, J+30.
 * Simplification pédagogique : un calendrier usuel, pas une valeur scientifique fixe.
 */
export const INTERVALLES_REVISION = [1, 3, 7, 14, 30] as const;

/** Jours de révision (numéros de jour du semestre) d'un cours vu le jour `jourCours`. */
export function joursRevision(jourCours: number, intervalles: readonly number[] = INTERVALLES_REVISION): number[] {
  return intervalles.map((i) => jourCours + i);
}

/** Nombre de révisions tombant chaque jour pour plusieurs cours : [jour, nombre], par jour croissant. */
export function revisionsParJour(joursCours: readonly number[], intervalles: readonly number[] = INTERVALLES_REVISION): Array<[number, number]> {
  const compte = new Map<number, number>();
  for (const j of joursCours.flatMap((c) => joursRevision(c, intervalles))) compte.set(j, (compte.get(j) ?? 0) + 1);
  return [...compte.entries()].sort((x, y) => x[0] - y[0]);
}

/** Numéro de semaine d'un jour du semestre (jour 1 à 7 → semaine 1). */
export function semaineDuJour(jour: number): number {
  return Math.ceil(jour / 7);
}

export interface PlanRevisions {
  jours: number[];
  avant: number[]; // révisions faites avant l'examen
  apres: number[]; // révisions qui tomberaient après l'examen (inutiles pour lui)
  delai: number; // jours entre le cours et l'examen
}

export function planRevisions(jourCours: number, jourExamen: number, intervalles: readonly number[] = INTERVALLES_REVISION): PlanRevisions {
  const jours = joursRevision(jourCours, intervalles);
  return { jours, avant: jours.filter((j) => j < jourExamen), apres: jours.filter((j) => j >= jourExamen), delai: jourExamen - jourCours };
}

/**
 * Courbe de l'oubli, modèle-jouet : R(t) = exp(−(t − t_dernière révision) / S),
 * la stabilité S étant multipliée par `facteur` à chaque révision.
 * Simplification pédagogique : sert à dessiner l'allure des courbes, pas à prédire une mémoire réelle.
 */
export function courbeOubli(revisions: readonly number[], tMax: number, S0 = 2, facteur = 2, pas = 0.25): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let t = 0; t <= tMax + 1e-9; t += pas) {
    const faites = revisions.filter((r) => r <= t);
    const derniere = faites.length ? faites[faites.length - 1]! : 0;
    const S = S0 * facteur ** faites.length;
    pts.push([arrondi(t, 2), Math.exp(-(t - derniere) / S)]);
  }
  return pts;
}

// ---------- Poids propre d'un élément prismatique (N0.1.3) ----------

/** Accélération de la pesanteur normale (m/s²), arrondie au centième. */
export const PESANTEUR = 9.81;

/** Poids volumique du béton armé : 25 kN/m³ (EN 1991-1-1, annexe A, tableau A.1 : béton normal 24 kN/m³, + 1 kN/m³ pour les armatures). */
export const POIDS_VOLUMIQUE_BA = 25;

/** Poids volumique du béton normal non armé : 24 kN/m³ (EN 1991-1-1, annexe A, tableau A.1). */
export const POIDS_VOLUMIQUE_BETON = 24;

export interface DonneesPoids {
  L: number; // longueur (m)
  b: number; // largeur (m)
  h: number; // hauteur (m)
  gamma: number; // poids volumique (kN/m³)
}

export interface ResultatPoids {
  volume: number; // m³
  poids: number; // kN
  chargeLineique: number; // kN/m
  masse: number; // kg
  /** Contrôle par ordre de grandeur : dimensions arrondies à 1 chiffre significatif. */
  estimation: number; // kN
  ecartEstimation: number; // relatif
}

export const EXEMPLE_LINTEAU: DonneesPoids = { L: 2.4, b: 0.2, h: 0.25, gamma: POIDS_VOLUMIQUE_BA };

/** Arrondi à un chiffre significatif : 2,4 → 2 ; 0,25 → 0,3 ; 0,034 → 0,03. */
export function unChiffre(x: number): number {
  if (x === 0 || !Number.isFinite(x)) return x;
  const p = Math.floor(Math.log10(Math.abs(x)));
  // Multiplier par 10^−p plutôt que diviser par 10^p : 0,25 / 0,1 vaut 2,4999… en flottant, 0,25 × 10 vaut 2,5.
  return p >= 0 ? arrondi(x / 10 ** p, 0) * 10 ** p : arrondi(x * 10 ** -p, 0) / 10 ** -p;
}

export function poidsElement(d: DonneesPoids): ResultatPoids {
  const volume = d.L * d.b * d.h;
  const poids = volume * d.gamma;
  const estimation = unChiffre(d.L) * unChiffre(d.b) * unChiffre(d.h) * d.gamma;
  return {
    volume,
    poids,
    chargeLineique: d.b * d.h * d.gamma,
    masse: (poids * 1000) / PESANTEUR,
    estimation,
    ecartEstimation: poids === 0 ? 0 : (estimation - poids) / poids,
  };
}

// ---------- Présenter un calcul : volume d'une dalle (N0.1.4) ----------

export interface DonneesDalle {
  L: number; // longueur (m)
  l: number; // largeur (m)
  e: number; // épaisseur (cm)
  pas: number; // le fournisseur livre par multiples de `pas` (m³)
}

export interface ResultatDalle {
  surface: number; // m²
  epaisseur: number; // m
  volume: number; // m³, sans arrondi intermédiaire
  volumeAffiche: number; // m³, arrondi au centième pour la rédaction
  volumeCommande: number; // m³, arrondi au multiple supérieur de `pas`
  /** Contre-exemple : surface arrondie à l'unité AVANT de multiplier. */
  volumeArrondiTrop: number; // m³
}

export const EXEMPLE_DALLE: DonneesDalle = { L: 4.25, l: 3.6, e: 15, pas: 0.5 };

export function volumeDalle(d: DonneesDalle): ResultatDalle {
  const surface = d.L * d.l;
  const epaisseur = d.e / 100;
  const volume = surface * epaisseur;
  return {
    surface,
    epaisseur,
    volume,
    volumeAffiche: arrondi(volume, 2),
    volumeCommande: arrondiSup(volume, d.pas),
    volumeArrondiTrop: arrondi(surface, 0) * epaisseur,
  };
}

// ---------- Budget-temps d'une semaine (N0.1.5) ----------

export const HEURES_SEMAINE = 7 * 24;

export interface DonneesBudget {
  cours: number; // heures de cours par semaine
  ratio: number; // heures de travail personnel par heure de cours
  sommeil: number; // heures par nuit
  vie: number; // repas, hygiène, tâches : heures par jour
  transport: number; // heures par jour de déplacement
  joursTransport: number; // jours de déplacement par semaine
}

export interface ResultatBudget {
  perso: number;
  sommeil: number;
  vie: number;
  transport: number;
  engage: number; // total des heures déjà prises
  libre: number; // reste de la semaine (peut être négatif)
  /** Parts de la semaine, dans l'ordre : cours, perso, sommeil, vie, transport, libre. */
  parts: Array<{ cle: string; libelle: string; heures: number }>;
}

export const EXEMPLE_BUDGET: DonneesBudget = { cours: 28, ratio: 1, sommeil: 8, vie: 2, transport: 2, joursTransport: 6 };

export function budgetSemaine(d: DonneesBudget): ResultatBudget {
  const perso = d.cours * d.ratio;
  const sommeil = 7 * d.sommeil;
  const vie = 7 * d.vie;
  const transport = d.transport * d.joursTransport;
  const engage = d.cours + perso + sommeil + vie + transport;
  const libre = HEURES_SEMAINE - engage;
  return {
    perso,
    sommeil,
    vie,
    transport,
    engage,
    libre,
    parts: [
      { cle: 'cours', libelle: 'Cours', heures: d.cours },
      { cle: 'perso', libelle: 'Travail perso', heures: perso },
      { cle: 'sommeil', libelle: 'Sommeil', heures: sommeil },
      { cle: 'vie', libelle: 'Repas, hygiène', heures: vie },
      { cle: 'transport', libelle: 'Transport', heures: transport },
      { cle: 'libre', libelle: 'Libre', heures: Math.max(libre, 0) },
    ],
  };
}

/**
 * Répartit `total` heures entre matières proportionnellement à leurs `poids`
 * (crédits, coefficients), par tranches de `pas` heures, sans perdre ni créer d'heure :
 * méthode du plus fort reste.
 */
export function repartirHeures(total: number, poids: readonly number[], pas = 0.5): number[] {
  const somme = poids.reduce((a, b) => a + b, 0);
  if (somme <= 0 || total <= 0) return poids.map(() => 0);
  const unites = Math.round(total / pas);
  const exactes = poids.map((p) => (unites * p) / somme);
  const base = exactes.map(Math.floor);
  let reste = unites - base.reduce((a, b) => a + b, 0);
  const ordre = exactes.map((x, i) => ({ i, r: x - Math.floor(x) })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (const { i } of ordre) {
    if (reste <= 0) break;
    base[i]!++;
    reste--;
  }
  return base.map((u) => arrondi(u * pas, 2));
}
