// Calculs des exemples Python du module L1.7. Chaque sortie affichée est calculée ici, dans le même ordre
// d'opérations que le programme montré, pour reproduire exactement ce que Python imprime.
import { reactionsAppuis, type ChargePoutre } from './statique';

// ---------- Écritures à la manière de Python ----------

/** Un flottant tel que l'imprime Python : 12.0, 0.1, 10.000000000000002, 1e-05. */
export function reprFlottant(x: number): string {
  if (!Number.isFinite(x)) return Number.isNaN(x) ? 'nan' : x > 0 ? 'inf' : '-inf';
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-4 || a >= 1e16)) {
    const [m, e] = x.toExponential().split('e');
    const exp = Number(e);
    return `${m}e${exp < 0 ? '-' : '+'}${String(Math.abs(exp)).padStart(2, '0')}`;
  }
  return Number.isInteger(x) ? `${x}.0` : String(x);
}

/** round(x, n) de Python : arrondi de la valeur binaire exacte, au pair le plus proche en cas d'égalité parfaite. */
export function arrondiPython(x: number, n = 0): number {
  const f = 10 ** n;
  const s = x * f;
  if (Number.isInteger(s * 2) && !Number.isInteger(s) && s / f === x) {
    const b = Math.floor(s);
    return (b % 2 === 0 ? b : b + 1) / f;
  }
  return Number(x.toFixed(n));
}

/** f"{x:.nf}" et f"{x:L.nf}" : n décimales, aligné à droite sur L caractères. */
export function formatF(x: number, n: number, largeur = 0): string {
  return x.toFixed(n).padStart(largeur);
}

// ---------- L1.7.4 : variables, types, opérations ----------

export interface DonneesPoids {
  b: number;
  h: number;
  L: number;
  gamma: number;
}

/** G = b * h * L * gamma, calculé de gauche à droite comme en Python. */
export function poidsPropre(d: DonneesPoids): number {
  return d.b * d.h * d.L * d.gamma;
}

/** Poutre de 0,20 × 0,40 m sur 5,0 m, béton armé à 25 kN/m³ (données de l'énoncé). */
export const EXEMPLE_POIDS: DonneesPoids = { b: 0.2, h: 0.4, L: 5.0, gamma: 25 };

/** Sacs de ciment : masse = dosage * volume, puis /, //, % et math.ceil sur la masse d'un sac. */
export function sacsCiment(dosage: number, volume: number, sac: number) {
  const masse = dosage * volume;
  return { masse, quotient: masse / sac, entiers: Math.floor(masse / sac), reste: masse - sac * Math.floor(masse / sac), sacs: Math.ceil(masse / sac) };
}

// ---------- L1.7.5 : conditions, boucles, fonctions ----------

/** Réactions d'une poutre sur deux appuis portant une charge P en x = a : RA = P*(L-a)/L, RB = P*a/L. */
export function reactionsPonctuelle(L: number, a: number, P: number): [number, number] {
  return [(P * (L - a)) / L, (P * a) / L];
}

/** Le tableau imprimé par la boucle for du cours : f"{a:4.1f} {RA:7.2f} {RB:7.2f}". */
export function tableauReactions(L: number, P: number, positions: readonly number[]): string[] {
  return positions.map((a) => {
    const [RA, RB] = reactionsPonctuelle(L, a, P);
    return `${formatF(a, 1, 4)} ${formatF(RA, 2, 7)} ${formatF(RB, 2, 7)}`;
  });
}

/** Vérification : taux = M_Ed / M_Rd, verdict « OK » si le taux est au plus 1. */
export function verificationFlexion(MEd: number, MRd: number): { taux: number; verdict: 'OK' | 'NON' } {
  const taux = MEd / MRd;
  return { taux, verdict: taux <= 1 ? 'OK' : 'NON' };
}

// ---------- L1.7.6 : listes, dictionnaires, fichiers CSV ----------

/** Résistances d'éprouvettes de béton à 28 jours, telles que les donne le fichier du laboratoire (données de l'énoncé). */
export const CSV_EPROUVETTES = `eprouvette;gachee;fc_MPa
E01;G1;27,5
E02;G1;29,1
E03;G1;26,4
E04;G2;31,2
E05;G2;30,6
E06;G2;24,8
E07;G3;28,3
E08;G3;29,7
E09;G3;30,1`;

export interface Eprouvette {
  nom: string;
  gachee: string;
  fc: number;
}

/** Lecture du fichier : séparateur « ; », virgule décimale remplacée par un point avant float(). */
export function lireEprouvettes(texte: string): Eprouvette[] {
  const [, ...lignes] = texte.trim().split('\n');
  return lignes.map((l) => {
    const [nom, gachee, fc] = l.split(';');
    return { nom: nom!, gachee: gachee!, fc: Number(fc!.replace(',', '.')) };
  });
}

/** Statistiques comme le programme : somme de gauche à droite / len, min, max, liste des valeurs sous le seuil, moyenne par gâchée. */
export function statsEprouvettes(e: readonly Eprouvette[], seuil: number) {
  const fc = e.map((x) => x.fc);
  let somme = 0;
  for (const v of fc) somme += v;
  const parGachee: Record<string, number[]> = {};
  for (const x of e) (parGachee[x.gachee] ??= []).push(x.fc);
  const moyennes = Object.fromEntries(
    Object.entries(parGachee).map(([g, v]) => {
      let s = 0;
      for (const y of v) s += y;
      return [g, s / v.length];
    }),
  );
  return { n: fc.length, moyenne: somme / fc.length, min: Math.min(...fc), max: Math.max(...fc), sousSeuil: e.filter((x) => x.fc < seuil).map((x) => x.nom), moyennes };
}

// ---------- L1.7.7 : NumPy et Matplotlib ----------

/** np.linspace(a, b, n) : pas (b − a)/(n − 1), dernier point égal à b. */
export function linspace(a: number, b: number, n: number): number[] {
  const pas = (b - a) / (n - 1);
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? b : i * pas + a));
}

/** M = q * x * (L - x) / 2 et V = q * (L / 2 - x), élément par élément. */
export function effortsPoutre(L: number, q: number, n: number) {
  const x = linspace(0, L, n);
  const M = x.map((xi) => (q * xi * (L - xi)) / 2);
  const V = x.map((xi) => q * (L / 2 - xi));
  const iMax = M.indexOf(Math.max(...M));
  return { x, M, V, Mmax: M[iMax]!, xMax: x[iMax]! };
}

// ---------- L1.7.8 : tests ----------

/** math.isclose(a, b, rel_tol, abs_tol). */
export function isclose(a: number, b: number, relTol = 1e-9, absTol = 0): boolean {
  return Math.abs(a - b) <= Math.max(relTol * Math.max(Math.abs(a), Math.abs(b)), absTol);
}

export interface CasDeTest {
  nom: string;
  L: number;
  a: number;
  P: number;
  /** réactions attendues, vérifiées à la main */
  RA: number;
  RB: number;
}

/** Cas de test de la fonction reactions, vérifiés à la main. */
export const CAS_REACTIONS: CasDeTest[] = [
  { nom: 'test_charge_au_milieu', L: 6, a: 3, P: 20, RA: 10, RB: 10 },
  { nom: 'test_charge_sur_appui_A', L: 6, a: 0, P: 20, RA: 20, RB: 0 },
  { nom: 'test_tiers', L: 6, a: 2, P: 30, RA: 20, RB: 10 },
];

/** Exécute les cas sur une fonction de réactions ; une fonction fausse fait échouer certains cas. */
export function executerTests(f: (L: number, a: number, P: number) => [number, number], cas: readonly CasDeTest[] = CAS_REACTIONS) {
  return cas.map((c) => {
    const [RA, RB] = f(c.L, c.a, c.P);
    return { ...c, obtenu: [RA, RB] as const, ok: isclose(RA, c.RA, 1e-9, 1e-12) && isclose(RB, c.RB, 1e-9, 1e-12) && isclose(RA + RB, c.P, 1e-9, 1e-12) };
  });
}

/** La version boguée du cours : RB calculé avec (L - a) au lieu de a. */
export function reactionsBoguees(L: number, a: number, P: number): [number, number] {
  return [(P * (L - a)) / L, (P * (L - a)) / L];
}

// ---------- L1.7.P : calculateur de réactions ----------

export interface DonneesCalculateur {
  /** portée entre appuis (m), charge uniforme (kN/m), charges ponctuelles (kN) à leurs abscisses (m) */
  L: number;
  q: number;
  charges: ReadonlyArray<{ F: number; a: number }>;
}

/**
 * Réactions comme le programme Python du projet : moments en A sommés charge par charge, puis RA par ΣFy = 0.
 * Contrôle indépendant par la fonction de statique de L1.3.6.
 */
export function calculateurReactions(d: DonneesCalculateur) {
  let somme = d.q * d.L;
  let moment = (d.q * d.L * d.L) / 2;
  for (const c of d.charges) {
    somme += c.F;
    moment += c.F * c.a;
  }
  const RB = moment / d.L;
  const RA = somme - RB;
  const charges: ChargePoutre[] = [
    { type: 'repartie', nom: 'q', q1: d.q, q2: d.q, a: 0, b: d.L },
    ...d.charges.map((c, i) => ({ type: 'ponctuelle' as const, nom: `P${i + 1}`, F: c.F, a: c.a })),
  ];
  const controle = reactionsAppuis(0, d.L, charges);
  return { somme, moment, RA, RB, controle, equilibre: isclose(RA + RB, somme, 1e-9, 1e-12) };
}

/** Poutre de 6,00 m : 8 kN/m et deux charges de 20 et 15 kN à 2,00 et 4,50 m (données de l'énoncé, L1.7.P). */
export const EXEMPLE_CALCULATEUR: DonneesCalculateur = { L: 6, q: 8, charges: [{ F: 20, a: 2 }, { F: 15, a: 4.5 }] };
