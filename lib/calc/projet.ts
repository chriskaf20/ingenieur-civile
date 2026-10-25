// Projet de construction (module L1.1) : planning des phases, garanties, descente de charges simplifiée.
import { GAMMA_G, GAMMA_Q } from './charges';
import { POIDS_VOLUMIQUE_BA } from './methode';

// ---------- L1.1.4 : phases et planning ----------

export interface Phase {
  nom: string;
  duree: number; // semaines
}

/** Petite école de trois classes : durées de l'énoncé, en semaines, phases enchaînées sans chevauchement. */
export const EXEMPLE_PLANNING: readonly Phase[] = [
  { nom: 'Programme et faisabilité', duree: 4 },
  { nom: 'Études de conception', duree: 10 },
  { nom: 'Autorisation de bâtir', duree: 8 },
  { nom: 'Consultation des entreprises', duree: 6 },
  { nom: 'Préparation du chantier', duree: 3 },
  { nom: 'Gros œuvre', duree: 18 },
  { nom: 'Second œuvre et équipements', duree: 10 },
  { nom: 'Réception', duree: 1 },
];

/** Indice de la première phase de travaux dans EXEMPLE_PLANNING (préparation du chantier). */
export const DEBUT_TRAVAUX = 4;

export interface LignePlanning extends Phase {
  debut: number; // semaine de début (0 = lancement du projet)
  fin: number; // semaine de fin
}

export interface ResultatPlanning {
  lignes: LignePlanning[];
  total: number; // semaines
  travaux: number; // durée de la préparation à la réception (semaines)
  debutTravaux: number; // semaine de l'ordre de service de démarrer les travaux
}

/** Planning séquentiel : chaque phase commence à la fin de la précédente (simplification, sans chevauchement). */
export function planning(phases: readonly Phase[], debutTravaux: number = DEBUT_TRAVAUX): ResultatPlanning {
  let t = 0;
  const lignes = phases.map((p) => {
    const l = { ...p, debut: t, fin: t + p.duree };
    t += p.duree;
    return l;
  });
  const debut = lignes[debutTravaux]?.debut ?? t;
  return { lignes, total: t, travaux: t - debut, debutTravaux: debut };
}

/**
 * Garanties qui courent après la réception, en droit français (Code civil). Le droit congolais prévoit aussi
 * une responsabilité des constructeurs : ses durées et articles sont à vérifier (A_VERIFIER.md).
 */
export const GARANTIES = [
  { nom: 'garantie de parfait achèvement', ans: 1, objet: 'tous les désordres signalés à la réception ou dans l’année', article: 'Code civil, art. 1792-6' },
  { nom: 'garantie de bon fonctionnement (biennale)', ans: 2, objet: 'équipements dissociables du bâtiment', article: 'Code civil, art. 1792-3' },
  { nom: 'garantie décennale', ans: 10, objet: 'solidité de l’ouvrage, ou impropriété à sa destination', article: 'Code civil, art. 1792 et 1792-4-1' },
] as const;

// ---------- L1.1.6 : descente de charges simplifiée ----------

export interface DonneesDescente {
  lx: number; // portée dans une direction (m), poteau intérieur d'une trame régulière
  ly: number; // portée dans l'autre direction (m)
  niveaux: number; // planchers portés par le poteau, toiture comprise
  g: number; // charge permanente par plancher (kN/m²), donnée de l'énoncé
  q: number; // charge d'exploitation par plancher (kN/m²), donnée de l'énoncé
  a: number; // côté du poteau carré (m)
  h: number; // hauteur d'un niveau (m)
  B: number; // côté de la semelle carrée (m)
}

export const EXEMPLE_DESCENTE: DonneesDescente = { lx: 4, ly: 5, niveaux: 2, g: 6, q: 2.5, a: 0.25, h: 3, B: 1.2 };

export interface NiveauDescente {
  niveau: number; // 1 = dernier plancher (toiture)
  G: number; // charge permanente apportée par ce niveau, poteau compris (kN)
  Q: number; // kN
  N: number; // effort cumulé en pied du poteau de ce niveau, G + Q (kN)
}

export interface ResultatDescente {
  A: number; // surface d'influence (m²)
  Gp: number; // charge permanente d'un plancher sur le poteau (kN)
  Qp: number; // charge d'exploitation d'un plancher (kN)
  PPniveau: number; // poids propre du poteau sur un niveau (kN)
  G: number; // total permanent en pied (kN)
  Q: number; // total d'exploitation (kN)
  Nser: number; // G + Q (kN)
  Nelu: number; // 1,35 G + 1,5 Q (kN)
  sigma: number; // pression moyenne sous la semelle, poids de la semelle négligé (kPa)
  niveauxDetail: NiveauDescente[];
}

/**
 * Poteau intérieur d'une trame régulière : il porte la moitié des portées de chaque côté, soit lx × ly par plancher.
 * Mêmes charges à chaque niveau (simplification) ; combinaison ELU de l'EC0 (6.10).
 */
export function descenteSimple(d: DonneesDescente, gamma: number = POIDS_VOLUMIQUE_BA): ResultatDescente {
  const A = d.lx * d.ly;
  const Gp = d.g * A;
  const Qp = d.q * A;
  const PPniveau = gamma * d.a * d.a * d.h;
  const niveauxDetail: NiveauDescente[] = [];
  let N = 0;
  for (let i = 1; i <= d.niveaux; i++) {
    N += Gp + PPniveau + Qp;
    niveauxDetail.push({ niveau: i, G: Gp + PPniveau, Q: Qp, N });
  }
  const G = d.niveaux * (Gp + PPniveau);
  const Q = d.niveaux * Qp;
  return { A, Gp, Qp, PPniveau, G, Q, Nser: G + Q, Nelu: GAMMA_G * G + GAMMA_Q * Q, sigma: (G + Q) / (d.B * d.B), niveauxDetail };
}
