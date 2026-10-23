// Analyse dimensionnelle (N0.3.5) : une grandeur mécanique a pour dimension M^a · L^b · T^c.
import { exposantTexte } from '@/lib/format';

export interface Dim {
  M: number;
  L: number;
  T: number;
}

export const SANS_DIMENSION: Dim = { M: 0, L: 0, T: 0 };

export const DIM = {
  longueur: { M: 0, L: 1, T: 0 },
  surface: { M: 0, L: 2, T: 0 },
  volume: { M: 0, L: 3, T: 0 },
  inertie: { M: 0, L: 4, T: 0 },
  temps: { M: 0, L: 0, T: 1 },
  masse: { M: 1, L: 0, T: 0 },
  acceleration: { M: 0, L: 1, T: -2 },
  debit: { M: 0, L: 3, T: -1 },
  force: { M: 1, L: 1, T: -2 }, // N = kg·m/s²
  pression: { M: 1, L: -1, T: -2 }, // Pa = N/m²
  moment: { M: 1, L: 2, T: -2 }, // N·m
  chargeLineique: { M: 1, L: 0, T: -2 }, // N/m
  poidsVolumique: { M: 1, L: -2, T: -2 }, // N/m³
  masseVolumique: { M: 1, L: -3, T: 0 }, // kg/m³
  sans: SANS_DIMENSION,
} as const satisfies Record<string, Dim>;

export function produit(a: Dim, b: Dim): Dim {
  return { M: a.M + b.M, L: a.L + b.L, T: a.T + b.T };
}

export function puissance(a: Dim, n: number): Dim {
  return { M: a.M * n, L: a.L * n, T: a.T * n };
}

export function egales(a: Dim, b: Dim): boolean {
  return a.M === b.M && a.L === b.L && a.T === b.T;
}

/** Écriture « M·L⁻¹·T⁻² » ; « 1 » pour une grandeur sans dimension. */
export function ecrireDim(d: Dim): string {
  const parts = (['M', 'L', 'T'] as const).filter((k) => d[k] !== 0).map((k) => (d[k] === 1 ? k : `${k}${exposantTexte(d[k])}`));
  return parts.length ? parts.join('·') : '1';
}

export interface Facteur {
  symbole: string;
  nom: string;
  unite: string;
  dim: Dim;
  /** exposant dans la formule : 2 pour L², −1 pour une division */
  exposant: number;
}

export interface Formule {
  id: string;
  libelle: string; // formule écrite
  gauche: Facteur;
  /** membre de droite : somme de termes, chaque terme étant un produit de facteurs (coefficients numériques omis) */
  termes: Facteur[][];
}

export interface AnalyseFormule {
  gauche: Dim;
  termes: Dim[];
  homogene: boolean;
}

export function dimTerme(t: readonly Facteur[]): Dim {
  return t.reduce((acc, f) => produit(acc, puissance(f.dim, f.exposant)), SANS_DIMENSION);
}

export function analyser(f: Formule): AnalyseFormule {
  const gauche = puissance(f.gauche.dim, f.gauche.exposant);
  const termes = f.termes.map(dimTerme);
  return { gauche, termes, homogene: termes.every((t) => egales(t, gauche)) };
}

const fa = (symbole: string, nom: string, unite: string, dim: Dim, exposant = 1): Facteur => ({ symbole, nom, unite, dim, exposant });

const F = fa('F', 'force', 'N', DIM.force);
const A = (e = 1) => fa('A', 'aire', 'm²', DIM.surface, e);
const SIGMA = fa('σ', 'contrainte', 'Pa', DIM.pression);
const Q = fa('q', 'charge linéique', 'N/m', DIM.chargeLineique);
const LONG = (e = 1) => fa('L', 'portée', 'm', DIM.longueur, e);
const E = (e = 1) => fa('E', 'module d’élasticité', 'Pa', DIM.pression, e);
const I = (e = 1) => fa('I', 'inertie', 'm⁴', DIM.inertie, e);
const GAMMA = fa('γ', 'poids volumique', 'N/m³', DIM.poidsVolumique);
const b = fa('b', 'largeur', 'm', DIM.longueur);
const h = fa('h', 'hauteur', 'm', DIM.longueur);

/** Formules proposées dans la fiche de N0.3.5 ; les deux dernières contiennent une erreur volontaire. */
export const FORMULES: readonly Formule[] = [
  { id: 'contrainte', libelle: 'σ = F / A', gauche: SIGMA, termes: [[F, A(-1)]] },
  { id: 'moment', libelle: 'M = q L² / 8', gauche: fa('M', 'moment', 'N·m', DIM.moment), termes: [[Q, LONG(2)]] },
  { id: 'fleche', libelle: 'f = 5 q L⁴ / (384 E I)', gauche: fa('f', 'flèche', 'm', DIM.longueur), termes: [[Q, LONG(4), E(-1), I(-1)]] },
  { id: 'poids', libelle: 'P = γ L b h', gauche: fa('P', 'poids', 'N', DIM.force), termes: [[GAMMA, LONG(), b, h]] },
  { id: 'hooke', libelle: 'σ = E ε', gauche: SIGMA, termes: [[E(), fa('ε', 'déformation', '—', DIM.sans)]] },
  {
    id: 'hydrostatique',
    libelle: 'p = ρ g z',
    gauche: fa('p', 'pression', 'Pa', DIM.pression),
    termes: [[fa('ρ', 'masse volumique', 'kg/m³', DIM.masseVolumique), fa('g', 'pesanteur', 'm/s²', DIM.acceleration), fa('z', 'profondeur', 'm', DIM.longueur)]],
  },
  {
    id: 'reservoir',
    libelle: 'h = h₀ + (Q / S) t',
    gauche: fa('h', 'hauteur d’eau', 'm', DIM.longueur),
    termes: [[fa('h₀', 'hauteur initiale', 'm', DIM.longueur)], [fa('Q', 'débit', 'm³/s', DIM.debit), fa('S', 'surface', 'm²', DIM.surface, -1), fa('t', 'temps', 's', DIM.temps)]],
  },
  { id: 'faux-fleche', libelle: 'f = 5 q L³ / (384 E I)  (copie à vérifier)', gauche: fa('f', 'flèche', 'm', DIM.longueur), termes: [[Q, LONG(3), E(-1), I(-1)]] },
  { id: 'faux-poids', libelle: 'P = γ L b  (copie à vérifier)', gauche: fa('P', 'poids', 'N', DIM.force), termes: [[GAMMA, LONG(), b]] },
];

export function formule(id: string): Formule {
  const f = FORMULES.find((x) => x.id === id);
  if (!f) throw new Error(`formule inconnue « ${id} »`);
  return f;
}
