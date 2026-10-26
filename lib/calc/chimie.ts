// Chimie des matériaux (module L1.5) : masses molaires, équilibrage et stœchiométrie, pH, ciment (Bogue, hydratation),
// chaux et plâtre, corrosion (loi de Faraday), carbonatation, alcalis, adjuvants, analyse d'une eau. Unités SI, sauf mention.
import { inverse, produit, produitVecteur, transposee } from './lineaire';

// ---------- L1.5.1 et L1.5.2 : masses molaires ----------

/** Masses atomiques (g/mol) : valeurs conventionnelles abrégées de l'IUPAC (masses atomiques standard). */
export const MASSES_ATOMIQUES: Readonly<Record<string, number>> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  Na: 22.99,
  Mg: 24.305,
  Al: 26.982,
  Si: 28.085,
  S: 32.06,
  Cl: 35.45,
  K: 39.098,
  Ca: 40.078,
  Fe: 55.845,
};

/** Lit un groupe d'atomes jusqu'à la parenthèse fermante (ou la fin) : « Ca(OH)2 », « Fe2O3 ». */
function lireGroupe(f: string, i0: number): [Record<string, number>, number] {
  const comp: Record<string, number> = {};
  let i = i0;
  while (i < f.length && f[i] !== ')') {
    let partie: Record<string, number>;
    if (f[i] === '(') {
      const [sous, j] = lireGroupe(f, i + 1);
      if (f[j] !== ')') throw new Error(`parenthèse non fermée : ${f}`);
      partie = sous;
      i = j + 1;
    } else {
      const m = /^[A-Z][a-z]?/.exec(f.slice(i));
      if (!m || MASSES_ATOMIQUES[m[0]] === undefined) throw new Error(`formule illisible : ${f}`);
      partie = { [m[0]]: 1 };
      i += m[0].length;
    }
    const n = /^\d+(\.\d+)?/.exec(f.slice(i));
    const k = n ? Number(n[0]) : 1;
    if (n) i += n[0].length;
    for (const [e, c] of Object.entries(partie)) comp[e] = (comp[e] ?? 0) + c * k;
  }
  return [comp, i];
}

/** Composition atomique d'une formule brute : « CaCO3 », « Ca(OH)2 », hydrate « CaSO4·2H2O » ou « CaSO4·0.5H2O ». */
export function composition(formule: string): Record<string, number> {
  const total: Record<string, number> = {};
  for (const morceau of formule.split('·')) {
    const n = /^\d+(\.\d+)?/.exec(morceau);
    const k = n ? Number(n[0]) : 1;
    const [comp, fin] = lireGroupe(morceau, n ? n[0].length : 0);
    if (fin !== morceau.length) throw new Error(`formule illisible : ${formule}`);
    for (const [e, c] of Object.entries(comp)) total[e] = (total[e] ?? 0) + c * k;
  }
  return total;
}

/** Masse molaire (g/mol) d'une formule brute. */
export function masseMolaire(formule: string): number {
  return Object.entries(composition(formule)).reduce((s, [e, c]) => s + c * MASSES_ATOMIQUES[e]!, 0);
}

/** Détail du calcul d'une masse molaire, élément par élément. */
export function detailMasseMolaire(formule: string) {
  const lignes = Object.entries(composition(formule)).map(([element, nombre]) => ({ element, nombre, masseAtomique: MASSES_ATOMIQUES[element]!, contribution: nombre * MASSES_ATOMIQUES[element]! }));
  return { lignes, M: lignes.reduce((s, l) => s + l.contribution, 0) };
}

// ---------- L1.5.2 : réactions et stœchiométrie ----------

export interface Espece {
  coef: number;
  formule: string;
  nom?: string;
}

export interface Reaction {
  id: string;
  nom: string;
  reactifs: readonly Espece[];
  produits: readonly Espece[];
}

const esp = (coef: number, formule: string, nom?: string): Espece => ({ coef, formule, nom });

/** Réactions du module. Les formules du C-S-H sont une simplification : sa composition réelle varie. */
export const REACTIONS: readonly Reaction[] = [
  { id: 'calcination', nom: 'calcination du calcaire (cuisson vers 900 °C)', reactifs: [esp(1, 'CaCO3', 'calcaire')], produits: [esp(1, 'CaO', 'chaux vive'), esp(1, 'CO2', 'dioxyde de carbone')] },
  { id: 'extinction', nom: 'extinction de la chaux vive', reactifs: [esp(1, 'CaO', 'chaux vive'), esp(1, 'H2O', 'eau')], produits: [esp(1, 'Ca(OH)2', 'chaux éteinte')] },
  { id: 'carbonatation', nom: 'carbonatation de la chaux (prise aérienne, carbonatation du béton)', reactifs: [esp(1, 'Ca(OH)2', 'portlandite'), esp(1, 'CO2', 'dioxyde de carbone')], produits: [esp(1, 'CaCO3', 'calcaire'), esp(1, 'H2O', 'eau')] },
  { id: 'cuissonPlatre', nom: 'cuisson du gypse (vers 150 °C)', reactifs: [esp(1, 'CaSO4·2H2O', 'gypse')], produits: [esp(1, 'CaSO4·0.5H2O', 'plâtre (semi-hydrate)'), esp(1.5, 'H2O', 'vapeur d’eau')] },
  { id: 'prisePlatre', nom: 'prise du plâtre', reactifs: [esp(1, 'CaSO4·0.5H2O', 'plâtre'), esp(1.5, 'H2O', 'eau')], produits: [esp(1, 'CaSO4·2H2O', 'gypse')] },
  { id: 'hydratationC3S', nom: 'hydratation du silicate tricalcique (C3S)', reactifs: [esp(2, 'Ca3SiO5', 'C3S'), esp(7, 'H2O', 'eau')], produits: [esp(1, 'Ca3Si2O7·4H2O', 'C-S-H'), esp(3, 'Ca(OH)2', 'portlandite')] },
  { id: 'hydratationC2S', nom: 'hydratation du silicate bicalcique (C2S)', reactifs: [esp(2, 'Ca2SiO4', 'C2S'), esp(5, 'H2O', 'eau')], produits: [esp(1, 'Ca3Si2O7·4H2O', 'C-S-H'), esp(1, 'Ca(OH)2', 'portlandite')] },
  { id: 'ettringite', nom: 'formation de l’ettringite (C3A et gypse)', reactifs: [esp(1, 'Ca3Al2O6', 'C3A'), esp(3, 'CaSO4·2H2O', 'gypse'), esp(26, 'H2O', 'eau')], produits: [esp(1, 'Ca6Al2(SO4)3(OH)12·26H2O', 'ettringite')] },
  { id: 'rouille', nom: 'formation de la rouille (simplifiée)', reactifs: [esp(4, 'Fe', 'fer'), esp(3, 'O2', 'dioxygène'), esp(6, 'H2O', 'eau')], produits: [esp(4, 'Fe(OH)3', 'rouille')] },
  { id: 'neutralisation', nom: 'neutralisation d’une eau sulfurique par la chaux', reactifs: [esp(1, 'Ca(OH)2', 'chaux éteinte'), esp(1, 'H2SO4', 'acide sulfurique')], produits: [esp(1, 'CaSO4', 'sulfate de calcium'), esp(2, 'H2O', 'eau')] },
];

export const reaction = (id: string): Reaction => REACTIONS.find((r) => r.id === id) ?? REACTIONS[0]!;

/** Bilan atome par atome : nombre d'atomes de chaque élément à gauche et à droite. */
export function bilanAtomes(r: Reaction) {
  const compter = (cote: readonly Espece[]) => {
    const t: Record<string, number> = {};
    for (const e of cote) for (const [el, c] of Object.entries(composition(e.formule))) t[el] = (t[el] ?? 0) + c * e.coef;
    return t;
  };
  const gauche = compter(r.reactifs);
  const droite = compter(r.produits);
  const elements = [...new Set([...Object.keys(gauche), ...Object.keys(droite)])];
  return { elements, gauche, droite, equilibree: elements.every((e) => Math.abs((gauche[e] ?? 0) - (droite[e] ?? 0)) < 1e-9) };
}

/**
 * Équilibrage automatique : les coefficients forment un vecteur du noyau de la matrice de composition (L1.4.4).
 * On fixe le dernier coefficient à 1, on résout par les équations normales, puis on cherche les plus petits entiers.
 * Renvoie null si la réaction n'a pas d'équilibrage unique à positifs.
 */
export function equilibrer(reactifs: readonly string[], produits: readonly string[]): number[] | null {
  const especes = [...reactifs, ...produits];
  const comps = especes.map(composition);
  const elements = [...new Set(comps.flatMap((c) => Object.keys(c)))];
  const n = especes.length;
  const A = elements.map((e) => comps.map((c, j) => (c[e] ?? 0) * (j < reactifs.length ? 1 : -1)));
  const Ap = A.map((l) => l.slice(0, n - 1));
  const b = A.map((l) => -l[n - 1]!);
  const At = transposee(Ap);
  const inv = inverse(produit(At, Ap));
  if (!inv) return null;
  const c = [...produitVecteur(inv, produitVecteur(At, b)), 1];
  if (c.some((v) => v < 1e-9)) return null;
  // contrôle : la solution doit annuler toutes les lignes (sinon la réaction est impossible)
  if (A.some((l) => Math.abs(l.reduce((s, a, j) => s + a * c[j]!, 0)) > 1e-6)) return null;
  for (let k = 1; k <= 200; k++) {
    const e = c.map((v) => v * k);
    if (e.every((v) => Math.abs(v - Math.round(v)) < 1e-6)) {
      const entiers = e.map((v) => Math.round(v));
      const pgcd = entiers.reduce((a, x) => {
        let [p, q] = [a, x];
        while (q) [p, q] = [q, p % q];
        return p;
      });
      return entiers.map((v) => v / pgcd);
    }
  }
  return null;
}

export interface LigneMasse {
  formule: string;
  nom?: string;
  coef: number;
  cote: 'réactif' | 'produit';
  M: number; // g/mol
  n: number; // quantité de matière (kmol si la masse de référence est en kg)
  m: number; // même unité que la masse de référence
}

/** Quantités de matière et masses de toutes les espèces, pour une masse donnée de l'une d'elles (index dans réactifs puis produits). */
export function massesReaction(r: Reaction, indexRef: number, masseRef: number) {
  const especes = [...r.reactifs.map((e) => ({ ...e, cote: 'réactif' as const })), ...r.produits.map((e) => ({ ...e, cote: 'produit' as const }))];
  const ref = especes[indexRef] ?? especes[0]!;
  const nRef = masseRef / masseMolaire(ref.formule);
  const lignes: LigneMasse[] = especes.map((e) => {
    const M = masseMolaire(e.formule);
    const n = (nRef * e.coef) / ref.coef;
    return { formule: e.formule, nom: e.nom, coef: e.coef, cote: e.cote, M, n, m: n * M };
  });
  const total = (cote: LigneMasse['cote']) => lignes.filter((l) => l.cote === cote).reduce((s, l) => s + l.m, 0);
  return { lignes, ref, nRef, masseReactifs: total('réactif'), masseProduits: total('produit') };
}

// ---------- L1.5.3 : pH ----------

/** Produit ionique de l'eau à 25 °C : [H₃O⁺][OH⁻] = 10⁻¹⁴. */
export const KE_25 = 1e-14;

export const pHdeConcentration = (h: number) => -Math.log10(h);
export const concentrationDepH = (pH: number) => 10 ** -pH;
export const pOH = (pH: number) => -Math.log10(KE_25) - pH;

/** Repères de pH (ordres de grandeur, à 25 °C) : chaque milieu réel se mesure. */
export const ECHELLE_PH: ReadonlyArray<{ nom: string; pH: number }> = [
  { nom: 'drainage minier acide', pH: 3 },
  { nom: 'eau de pluie', pH: 5.6 }, // acidifiée par le CO₂ dissous
  { nom: 'eau pure', pH: 7 },
  { nom: 'eau de mer', pH: 8.1 },
  { nom: 'béton carbonaté', pH: 9 },
  { nom: 'eau de chaux saturée', pH: 12.4 },
  { nom: 'eau des pores du béton', pH: 13 },
];

/** pH en dessous duquel l'acier n'est plus protégé par le béton (ordre de grandeur : la littérature cite 9 à 11). */
export const PH_DEPASSIVATION = 9;
/** pH au-dessus duquel l'acier est passivé, couvert d'une fine couche d'oxyde protectrice (ordre de grandeur). */
export const PH_PASSIVATION = 11;

export interface DonneesNeutralisation {
  V: number; // volume d'eau à traiter (m³)
  pH0: number; // pH initial
  pH1: number; // pH visé
  purete: number; // teneur de la chaux en Ca(OH)₂ (%)
}

/** Drainage minier de l'exemple de L1.5.3 : 500 m³ d'eau à pH 3, ramenée à pH 7 par une chaux éteinte à 90 %. */
export const EXEMPLE_NEUTRALISATION: DonneesNeutralisation = { V: 500, pH0: 3, pH1: 7, purete: 90 };

/**
 * Chaux éteinte nécessaire pour neutraliser l'acidité libre d'une eau (acide fort, sans effet tampon ni métaux dissous) :
 * n(H⁺) = V (10^−pH0 − 10^−pH1), Ca(OH)₂ + 2 H⁺ → Ca²⁺ + 2 H₂O.
 */
export function neutralisation(d: DonneesNeutralisation) {
  const h0 = concentrationDepH(d.pH0); // mol/L
  const h1 = concentrationDepH(d.pH1);
  const nH = d.V * 1000 * (h0 - h1); // mol
  const nChaux = nH / 2;
  const mPure = (nChaux * masseMolaire('Ca(OH)2')) / 1000; // kg
  return { h0, h1, nH, nChaux, mPure, mCommerciale: mPure / (d.purete / 100), rapport: h0 / h1 };
}

// ---------- L1.5.4 : clinker (Bogue) et hydratation ----------

export interface OxydesClinker {
  CaO: number; // % massiques
  SiO2: number;
  Al2O3: number;
  Fe2O3: number;
  SO3: number;
}

/** Analyse chimique d'un clinker de l'énoncé (%) ; le reste est surtout MgO, alcalis et chaux libre. */
export const EXEMPLE_CLINKER: OxydesClinker = { CaO: 65, SiO2: 21, Al2O3: 5.5, Fe2O3: 3, SO3: 1 };

export const PHASES_CLINKER = [
  { id: 'C3S', formule: 'Ca3SiO5', nom: 'silicate tricalcique (alite)' },
  { id: 'C2S', formule: 'Ca2SiO4', nom: 'silicate bicalcique (bélite)' },
  { id: 'C3A', formule: 'Ca3Al2O6', nom: 'aluminate tricalcique' },
  { id: 'C4AF', formule: 'Ca4Al2Fe2O10', nom: 'aluminoferrite tétracalcique' },
] as const;

/**
 * Composition potentielle du clinker (méthode de Bogue, 1929) : tout Fe₂O₃ dans C4AF, l'alumine restante dans C3A,
 * SO₃ en CaSO₄, puis CaO et SiO₂ restants partagés entre C3S et C2S (système 2 × 2). Valable pour Al₂O₃/Fe₂O₃ ≥ 0,64.
 */
export function bogue(o: OxydesClinker) {
  const M = (f: string) => masseMolaire(f);
  const C = M('CaO');
  const S = M('SiO2');
  const A = M('Al2O3');
  const F = M('Fe2O3');
  const C4AF = (o.Fe2O3 * M('Ca4Al2Fe2O10')) / F;
  const alumineC3A = o.Al2O3 - (o.Fe2O3 * A) / F;
  const C3A = (alumineC3A * M('Ca3Al2O6')) / A;
  const CaSO4 = (o.SO3 * M('CaSO4')) / M('SO3');
  const chauxRestante = o.CaO - (4 * C * o.Fe2O3) / F - (3 * C * alumineC3A) / A - (C * o.SO3) / M('SO3');
  // CaO et SiO₂ restants : x C3S + y C2S, avec les fractions massiques de CaO et de SiO₂ de chaque silicate
  const systeme = [
    [(3 * C) / M('Ca3SiO5'), (2 * C) / M('Ca2SiO4')],
    [S / M('Ca3SiO5'), S / M('Ca2SiO4')],
  ];
  const inv = inverse(systeme)!;
  const [C3S, C2S] = produitVecteur(inv, [chauxRestante, o.SiO2]) as [number, number];
  return { C3S, C2S, C3A, C4AF, CaSO4, chauxRestante, systeme, total: C3S + C2S + C3A + C4AF + CaSO4, AF: o.Al2O3 / o.Fe2O3, valide: o.Al2O3 / o.Fe2O3 >= 0.64 && C2S >= 0 && C3A >= 0 };
}

/** Coefficients de Bogue retrouvés par linéarité : chaque oxyde seul (1 %) donne une colonne. */
export function coefficientsBogue() {
  const unite = (k: keyof OxydesClinker): OxydesClinker => ({ CaO: 0, SiO2: 0, Al2O3: 0, Fe2O3: 0, SO3: 0, [k]: 1 });
  const oxydes: (keyof OxydesClinker)[] = ['CaO', 'SiO2', 'Al2O3', 'Fe2O3', 'SO3'];
  const colonnes = oxydes.map((k) => bogue(unite(k)));
  return { oxydes, C3S: colonnes.map((c) => c.C3S), C2S: colonnes.map((c) => c.C2S), C3A: colonnes.map((c) => c.C3A), C4AF: colonnes.map((c) => c.C4AF) };
}

/**
 * Eau liée et portlandite produite par l'hydratation complète des silicates (réactions simplifiées de REACTIONS) :
 * masses pour une masse de ciment donnée et des teneurs en C3S et C2S (%).
 */
export function hydratationSilicates(masseCiment: number, pctC3S: number, pctC2S: number) {
  const parKg = (id: string) => {
    const r = massesReaction(reaction(id), 0, 1);
    const eau = r.lignes.find((l) => l.formule === 'H2O' && l.cote === 'réactif')!.m;
    const portlandite = r.lignes.find((l) => l.formule === 'Ca(OH)2')!.m;
    return { eau, portlandite };
  };
  const c3s = parKg('hydratationC3S');
  const c2s = parKg('hydratationC2S');
  const mC3S = (masseCiment * pctC3S) / 100;
  const mC2S = (masseCiment * pctC2S) / 100;
  const eau = mC3S * c3s.eau + mC2S * c2s.eau;
  const portlandite = mC3S * c3s.portlandite + mC2S * c2s.portlandite;
  return { mC3S, mC2S, eauParKgC3S: c3s.eau, eauParKgC2S: c2s.eau, chParKgC3S: c3s.portlandite, chParKgC2S: c2s.portlandite, eau, portlandite, eauSurCiment: eau / masseCiment };
}

/** Températures de cuisson (°C), ordres de grandeur des procédés industriels. */
export const TEMPERATURES_CUISSON = { clinker: 1450, chaux: 900, platre: 150 } as const;

/** Cru et ciment, ordres de grandeur (% massiques) : calcaire et argile du cru, gypse ajouté au clinker (régulateur de prise). */
export const DOSAGES_CIMENTERIE = { calcaire: 80, argile: 20, gypse: 5 } as const;

// ---------- L1.5.5 : chaux et plâtre ----------

/** CO₂ libéré par la décarbonatation du calcaire, par tonne de clinker (t/t) : la cuisson du combustible s'y ajoute. */
export function co2Decarbonatation(pctCaO: number): number {
  return ((pctCaO / 100) * masseMolaire('CO2')) / masseMolaire('CaO');
}

export interface DonneesCycleChaux {
  calcaire: number; // masse de calcaire cuit (t)
  purete: number; // teneur en CaCO₃ (%)
}

export const EXEMPLE_CYCLE_CHAUX: DonneesCycleChaux = { calcaire: 10, purete: 95 };

/** Cycle de la chaux : cuisson, extinction, puis carbonatation à l'air (masses en t). */
export function cycleChaux(d: DonneesCycleChaux) {
  const caco3 = (d.calcaire * d.purete) / 100;
  const cuisson = massesReaction(reaction('calcination'), 0, caco3);
  const caO = cuisson.lignes[1]!.m;
  const co2 = cuisson.lignes[2]!.m;
  const extinction = massesReaction(reaction('extinction'), 0, caO);
  const eau = extinction.lignes[1]!.m;
  const chauxEteinte = extinction.lignes[2]!.m;
  const prise = massesReaction(reaction('carbonatation'), 0, chauxEteinte);
  return { caco3, caO, co2, eau, chauxEteinte, co2Repris: prise.lignes[1]!.m, calcaireReforme: prise.lignes[2]!.m, eauRendue: prise.lignes[3]!.m };
}

/** Cuisson du gypse puis prise du plâtre (masses en kg) : l'eau chassée à la cuisson est reprise à la prise. */
export function cyclePlatre(masseGypse: number) {
  const cuisson = massesReaction(reaction('cuissonPlatre'), 0, masseGypse);
  const platre = cuisson.lignes[1]!.m;
  const vapeur = cuisson.lignes[2]!.m;
  const prise = massesReaction(reaction('prisePlatre'), 0, platre);
  return { platre, vapeur, eauPrise: prise.lignes[1]!.m, gypseReforme: prise.lignes[2]!.m, eauSurPlatre: prise.lignes[1]!.m / platre };
}

// ---------- L1.5.6 : corrosion des aciers ----------

/** Constante de Faraday (C/mol), valeur exacte du SI depuis 2019. */
export const FARADAY = 96485.33212;
/** Nombre d'Avogadro (mol⁻¹), valeur exacte du SI depuis 2019. */
export const AVOGADRO = 6.02214076e23;
/** Numéros atomiques des éléments du module. */
export const NUMEROS_ATOMIQUES: Readonly<Record<string, number>> = { H: 1, C: 6, N: 7, O: 8, Na: 11, Mg: 12, Al: 13, Si: 14, S: 16, Cl: 17, K: 19, Ca: 20, Fe: 26, Cu: 29, Zn: 30 };

/** Masse volumique de l'acier : 7 850 kg/m³ (EN 1993-1-1 §3.2.6). */
export const MASSE_VOLUMIQUE_ACIER = 7850;
/** Durée d'une année julienne (s). */
export const SECONDES_PAR_AN = 365.25 * 24 * 3600;
/** Volume des produits de corrosion rapporté à celui du fer consommé (de l'oxyde Fe₃O₄ aux hydroxydes hydratés), ordre de grandeur. */
export const RAPPORT_VOLUME_ROUILLE = { min: 2, max: 6 } as const;

/** Vitesse de pénétration d'une corrosion uniforme (µm/an) pour une densité de courant i (µA/cm²) : loi de Faraday, Fe → Fe²⁺ + 2 e⁻. */
export function vitessePenetration(icorr: number): number {
  const i = icorr * 1e-6 * 1e4; // A/m²
  const masseParSurface = (masseMolaire('Fe') / 1000) * i / (2 * FARADAY); // kg/(m²·s)
  return (masseParSurface / MASSE_VOLUMIQUE_ACIER) * SECONDES_PAR_AN * 1e6;
}

export interface DonneesCorrosion {
  phi: number; // diamètre initial de la barre (mm)
  icorr: number; // densité de courant de corrosion (µA/cm²)
  duree: number; // années de corrosion active
}

/** Barre HA 12 corrodée à 1 µA/cm² pendant 20 ans (données de l'énoncé). */
export const EXEMPLE_CORROSION: DonneesCorrosion = { phi: 12, icorr: 1, duree: 20 };

/** Perte de diamètre et de section d'une barre corrodée sur tout son pourtour (corrosion uniforme). */
export function perteSection(d: DonneesCorrosion) {
  const vitesse = vitessePenetration(d.icorr); // µm/an
  const penetration = (vitesse * d.duree) / 1000; // mm
  const phiRestant = Math.max(0, d.phi - 2 * penetration);
  const A0 = (Math.PI * d.phi ** 2) / 4;
  const A1 = (Math.PI * phiRestant ** 2) / 4;
  const masseFerParMetre = ((A0 - A1) * 1e-6 * MASSE_VOLUMIQUE_ACIER); // kg par mètre de barre
  return { vitesse, penetration, phiRestant, A0, A1, perte: 1 - A1 / A0, masseFerParMetre };
}

// ---------- L1.5.7 : carbonatation et alcalis ----------

/** Profondeur carbonatée x = K √t (mm), loi simplifiée de diffusion. */
export const profondeurCarbonatation = (K: number, t: number) => K * Math.sqrt(t);
/** Durée pour que le front atteigne un enrobage c (mm) : t = (c / K)². */
export const dureeCarbonatation = (c: number, K: number) => (c / K) ** 2;

export interface DonneesCarbonatation {
  age: number; // âge de l'ouvrage au moment de la mesure (ans)
  x: number; // profondeur carbonatée mesurée à la phénolphtaléine (mm)
  c: number; // enrobage mesuré (mm)
}

/** Balcon d'un immeuble de 25 ans : 18 mm de carbonatation mesurée, 22 mm d'enrobage (données de l'énoncé). */
export const EXEMPLE_CARBONATATION: DonneesCarbonatation = { age: 25, x: 18, c: 22 };

/** Diagnostic : coefficient K déduit de la mesure, puis âge auquel le front atteint les armatures. */
export function diagnosticCarbonatation(d: DonneesCarbonatation) {
  const K = d.x / Math.sqrt(d.age);
  const tArmatures = dureeCarbonatation(d.c, K);
  return { K, tArmatures, reste: tArmatures - d.age, atteintes: d.x >= d.c, x50: profondeurCarbonatation(K, 50), x100: profondeurCarbonatation(K, 100) };
}

/** Coefficient de K₂O dans l'alcalin équivalent Na₂Oéq = Na₂O + k K₂O : rapport des masses molaires. */
export const COEF_K2O = masseMolaire('Na2O') / masseMolaire('K2O');
export const alcalinEquivalent = (na2o: number, k2o: number) => na2o + COEF_K2O * k2o;

// ---------- L1.5.8 : adjuvants ----------

export interface DonneesAdjuvant {
  C: number; // dosage en ciment (kg/m³)
  dosage: number; // dosage en adjuvant (% de la masse de ciment)
  extraitSec: number; // extrait sec de l'adjuvant (%)
  densite: number; // masse volumique de l'adjuvant (kg/L)
}

/** Superplastifiant de l'énoncé : 1,2 % d'un produit à 30 % d'extrait sec, densité 1,07, dans un béton à 350 kg/m³. */
export const EXEMPLE_ADJUVANT: DonneesAdjuvant = { C: 350, dosage: 1.2, extraitSec: 30, densite: 1.07 };

/** Quantités d'adjuvant par m³ : masse, volume, matière active et eau apportée (à retrancher de l'eau de gâchage). */
export function dosageAdjuvant(d: DonneesAdjuvant) {
  const masse = (d.C * d.dosage) / 100; // kg/m³
  const volume = masse / d.densite; // L/m³
  const actif = (masse * d.extraitSec) / 100; // kg/m³
  const eau = masse - actif; // kg/m³, soit environ des litres
  return { masse, volume, actif, eau };
}

// ---------- L1.5.9 : analyse d'une eau ----------

export interface AnalyseEau {
  pH: number;
  chlorures: number; // mg/L
  sulfates: number; // mg/L (SO₄²⁻)
  nitrates: number; // mg/L (NO₃⁻)
  turbidite: number; // NTU
}

/** Eau d'une rivière en aval d'un site minier (données de l'énoncé). */
export const EXEMPLE_EAU: AnalyseEau = { pH: 5.2, chlorures: 120, sulfates: 900, nitrates: 15, turbidite: 40 };

/** Eau de mer, ordre de grandeur (salinité voisine de 35 g/kg). */
export const EAU_DE_MER: AnalyseEau = { pH: 8.1, chlorures: 19000, sulfates: 2700, nitrates: 1, turbidite: 2 };

export type UsageBeton = 'precontraint' | 'arme' | 'nonArme';

/** Limites d'une eau de gâchage (EN 1008) : chlorures selon l'usage, sulfates, pH. À contrôler sur le texte (A_VERIFIER.md n° 35). */
export const LIMITES_GACHAGE = {
  chlorures: { precontraint: 500, arme: 1000, nonArme: 4500 } as Record<UsageBeton, number>,
  sulfates: 2000,
  pHmin: 4,
};

/** Repères de l'OMS pour l'eau de boisson : seul le nitrate a une valeur fondée sur la santé. À contrôler (A_VERIFIER.md n° 36). */
export const REPERES_OMS = { nitrates: 50, chlorures: 250, sulfates: 500, turbidite: 5, pHmin: 6.5, pHmax: 8.5 };

export interface Critere {
  id: string;
  nom: string;
  valeur: number;
  min?: number; // limite basse (critère respecté si valeur ≥ min)
  max?: number; // limite haute (critère respecté si valeur ≤ max)
  unite: string;
  ok: boolean;
  nature: string;
}

export function eauDeGachage(a: AnalyseEau, usage: UsageBeton): Critere[] {
  const L = LIMITES_GACHAGE;
  return [
    { id: 'pH', nom: 'pH', valeur: a.pH, min: L.pHmin, unite: '', ok: a.pH >= L.pHmin, nature: 'acidité' },
    { id: 'chlorures', nom: 'chlorures', valeur: a.chlorures, max: L.chlorures[usage], unite: 'mg/L', ok: a.chlorures <= L.chlorures[usage], nature: 'corrosion des armatures' },
    { id: 'sulfates', nom: 'sulfates', valeur: a.sulfates, max: L.sulfates, unite: 'mg/L', ok: a.sulfates <= L.sulfates, nature: 'gonflement (ettringite)' },
  ];
}

export function eauPotable(a: AnalyseEau): Critere[] {
  const R = REPERES_OMS;
  return [
    { id: 'pH', nom: 'pH', valeur: a.pH, min: R.pHmin, max: R.pHmax, unite: '', ok: a.pH >= R.pHmin && a.pH <= R.pHmax, nature: 'repère d’exploitation' },
    { id: 'nitrates', nom: 'nitrates', valeur: a.nitrates, max: R.nitrates, unite: 'mg/L', ok: a.nitrates <= R.nitrates, nature: 'valeur guide (santé)' },
    { id: 'chlorures', nom: 'chlorures', valeur: a.chlorures, max: R.chlorures, unite: 'mg/L', ok: a.chlorures <= R.chlorures, nature: 'seuil de goût' },
    { id: 'sulfates', nom: 'sulfates', valeur: a.sulfates, max: R.sulfates, unite: 'mg/L', ok: a.sulfates <= R.sulfates, nature: 'goût, effet laxatif' },
    { id: 'turbidite', nom: 'turbidité', valeur: a.turbidite, max: R.turbidite, unite: 'NTU', ok: a.turbidite <= R.turbidite, nature: 'acceptabilité (idéal < 1 NTU)' },
  ];
}

export type ClasseXA = 'aucune' | 'XA1' | 'XA2' | 'XA3' | 'au-delà de XA3';
const ORDRE_XA: readonly ClasseXA[] = ['aucune', 'XA1', 'XA2', 'XA3', 'au-delà de XA3'];

/**
 * Classe d'exposition chimique d'une eau souterraine au contact du béton (EN 206, tableau 2), sur les seuls sulfates et pH :
 * on retient la plus sévère. Seuils à contrôler sur le texte (A_VERIFIER.md n° 37).
 */
export function classeXA(sulfates: number, pH: number) {
  const s: ClasseXA = sulfates < 200 ? 'aucune' : sulfates <= 600 ? 'XA1' : sulfates <= 3000 ? 'XA2' : sulfates <= 6000 ? 'XA3' : 'au-delà de XA3';
  const p: ClasseXA = pH > 6.5 ? 'aucune' : pH >= 5.5 ? 'XA1' : pH >= 4.5 ? 'XA2' : pH >= 4 ? 'XA3' : 'au-delà de XA3';
  return { sulfates: s, pH: p, classe: ORDRE_XA[Math.max(ORDRE_XA.indexOf(s), ORDRE_XA.indexOf(p))]! };
}

/** Verdict global : une eau convient si tous les critères vérifiés sont respectés (les autres essais restent à faire). */
export function analyseEau(a: AnalyseEau, usage: UsageBeton) {
  const gachage = eauDeGachage(a, usage);
  const potable = eauPotable(a);
  return { gachage, potable, gachageOk: gachage.every((c) => c.ok), potableOk: potable.every((c) => c.ok), xa: classeXA(a.sulfates, a.pH) };
}
