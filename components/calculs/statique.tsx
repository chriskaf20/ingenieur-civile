// Fiches de calcul du module L1.3 (mécanique générale et statique). Les valeurs viennent de lib/calc/statique.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { BandeChargement, CaniveauSchema, ConsoleSchema, CoupeRitter, MarquiseSchema, MomentForceSchema, MurPoidsSchema, NoeudIsole, PoutreReactions, SemelleTorseurSchema, StructureTypeSchema, TreillisDessin, TroisAppuisPlan } from '@/components/schemas/Statique';
import {
  BARRES_FERME,
  caniveauU,
  chargePoutre,
  consoleEncastree,
  degreHyperstaticite,
  EXEMPLE_CANIVEAU,
  EXEMPLE_CHARGE_POUTRE,
  EXEMPLE_CONSOLE,
  EXEMPLE_FERME_EFFORTS,
  EXEMPLE_MARQUISE,
  EXEMPLE_MOMENT_FORCE,
  EXEMPLE_MUR_POIDS,
  EXEMPLE_POUTRE_CONSOLE,
  EXEMPLE_PRATT,
  EXEMPLE_SEMELLE_TORSEUR,
  EXEMPLE_TROIS_APPUIS,
  fermeEfforts,
  FS_REPERE_MUR,
  geometriePratt,
  marquise,
  momentForceO,
  murPoids,
  poutreConsole,
  ritterPratt,
  semelleTorseur,
  STRUCTURES_TYPES,
  treillis,
  troisAppuis,
  type DonneesCaniveau,
  type DonneesChargePoutre,
  type DonneesConsole,
  type DonneesFermeEfforts,
  type DonneesMarquise,
  type DonneesMomentForce,
  type DonneesMurPoids,
  type DonneesPoutreConsole,
  type DonneesPratt,
  type DonneesSemelleTorseur,
  type DonneesTroisAppuis,
  type ResultatChargePoutre,
  type ResultatFermeEfforts,
  type ResultatMarquise,
  type ResultatMomentForce,
  type ResultatMurPoids,
  type ResultatReactions,
  type ResultatRitter,
  type ResultatSemelleTorseur,
  type ResultatTreillis,
  type StructureType,
} from '@/lib/calc/statique';
import { grandeur, nombre } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
/** Nombre entre parenthèses s'il est négatif : (−19,32). */
const par = (x: number, dec = 2) => (x < 0 ? `(${nombre(x, dec)})` : nombre(x, dec));
/** Effort normal avec sa nature. */
const effort = (N: number) => (Math.abs(N) < 1e-6 ? 'barre nulle' : N > 0 ? `${n2(N)} kN (traction)` : `${n2(N)} kN (compression)`);

const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

// ---------- Charge linéique d'une poutre (L1.3.1) ----------
type ResCharge = ResultatChargePoutre & { d: DonneesChargePoutre };

const chargeDef: DefinitionCalcul<ResCharge> = {
  champs: [
    champ('g', 'charges permanentes du plancher (énoncé)', 'g', 'kN/m²', 0, 12, 0.1, 2),
    champ('q', 'charge d’exploitation (énoncé)', 'q', 'kN/m²', 0, 10, 0.1, 2),
    champ('e', 'largeur de la bande chargée', 'e', 'm', 1, 8, 0.05, 2),
    champ('b', 'largeur de la retombée', 'b', 'm', 0.15, 0.6, 0.01, 2),
    champ('h', 'hauteur de la retombée', 'h', 'm', 0.1, 1, 0.01, 2),
    champ('gamma', 'poids volumique du béton armé', 'γ', 'kN/m³', 20, 26, 0.5, 1),
    champ('L', 'portée de la poutre', 'L', 'm', 1, 12, 0.1, 2),
  ],
  defaut: { ...EXEMPLE_CHARGE_POUTRE },
  calculer: (e) => {
    const d = { g: num(e, 'g'), q: num(e, 'q'), e: num(e, 'e'), b: num(e, 'b'), h: num(e, 'h'), gamma: num(e, 'gamma'), L: num(e, 'L') };
    return { ...chargePoutre(d), d };
  },
  valeurs: {
    G: (r) => grandeur(r.G, 2, 'kN/m'),
    Q: (r) => grandeur(r.Q, 2, 'kN/m'),
    pp: (r) => grandeur(r.pp, 2, 'kN/m'),
    pELU: (r) => grandeur(r.pELU, 2, 'kN/m'),
    RELU: (r) => grandeur(r.RELU, 2, 'kN'),
  },
  lignes: {
    dalle: (r) => (
      <>
        plancher : g × e = {n2(r.d.g)} kN/m² × {n2(r.d.e)} m = <strong>{n2(r.gDalle)} kN/m</strong>
      </>
    ),
    pp: (r) => (
      <>
        poids propre de la retombée : γ b h = {n1(r.d.gamma)} kN/m³ × {n2(r.d.b)} m × {n2(r.d.h)} m = <strong>{n2(r.pp)} kN/m</strong>
      </>
    ),
    G: (r) => (
      <>
        charge permanente : G = {n2(r.gDalle)} + {n2(r.pp)} = <strong>{n2(r.G)} kN/m</strong>
      </>
    ),
    Q: (r) => (
      <>
        charge d’exploitation : Q = q × e = {n2(r.d.q)} kN/m² × {n2(r.d.e)} m = <strong>{n2(r.Q)} kN/m</strong>
      </>
    ),
    elu: (r) => (
      <>
        combinaison ELU : 1,35 G + 1,5 Q = 1,35 × {n2(r.G)} + 1,5 × {n2(r.Q)} = <strong>{n2(r.pELU)} kN/m</strong>
      </>
    ),
    R: (r) => (
      <>
        sur la portée : {n2(r.pELU)} kN/m × {n2(r.d.L)} m = <strong>{n2(r.RELU)} kN</strong>, partagés entre les deux appuis
      </>
    ),
  },
  schema: ({ r }) => <BandeChargement d={r.d} r={r} prefixe="fc-bc" />,
};

// ---------- Moment d'une force (L1.3.2) ----------
type ResMoment = ResultatMomentForce & { d: DonneesMomentForce };

const momentDef: DefinitionCalcul<ResMoment> = {
  champs: [
    champ('xA', 'abscisse du point d’application, depuis O', <>x<sub>A</sub></>, 'm', -3, 3, 0.05, 2),
    champ('yA', 'ordonnée du point d’application', <>y<sub>A</sub></>, 'm', -3, 3, 0.05, 2),
    champ('F', 'intensité de la force', 'F', 'kN', 0.5, 100, 0.5, 1),
    champ('theta', 'direction de la force (depuis l’axe x)', 'θ', '°', -180, 180, 1, 0),
  ],
  defaut: { ...EXEMPLE_MOMENT_FORCE },
  calculer: (e) => {
    const d = { xA: num(e, 'xA'), yA: num(e, 'yA'), F: num(e, 'F'), theta: num(e, 'theta') };
    return { ...momentForceO(d), d };
  },
  valeurs: {
    M: (r) => grandeur(r.M, 2, 'kN·m'),
    bras: (r) => grandeur(r.bras, 3, 'm'),
    Fx: (r) => grandeur(r.Fx, 2, 'kN'),
    Fy: (r) => grandeur(r.Fy, 2, 'kN'),
    sens: (r) => (r.M < 0 ? 'horaire' : 'trigonométrique'),
  },
  lignes: {
    composantes: (r) => (
      <>
        F<sub>x</sub> = F cos θ = {n1(r.d.F)} × cos({nombre(r.d.theta, 0)}°) = <strong>{n2(r.Fx)} kN</strong> ; F<sub>y</sub> = F sin θ = {n1(r.d.F)} × sin({nombre(r.d.theta, 0)}°) = <strong>{n2(r.Fy)} kN</strong>
      </>
    ),
    varignon: (r) => (
      <>
        M<sub>O</sub> = x<sub>A</sub> F<sub>y</sub> − y<sub>A</sub> F<sub>x</sub> = {par(r.d.xA)} × {par(r.Fy)} − {par(r.d.yA)} × {par(r.Fx)} = {n2(r.MFy)} + {par(r.MFx)} = <strong>{n2(r.M)} kN·m</strong>
      </>
    ),
    sens: (r) => (
      <>
        signe {r.M < 0 ? 'négatif : rotation dans le sens horaire' : 'positif : rotation dans le sens trigonométrique'} autour de O
      </>
    ),
    bras: (r) => (
      <>
        bras de levier : d = |M<sub>O</sub>| / F = {n2(Math.abs(r.M))} / {n1(r.d.F)} = <strong>{n3(r.bras)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <MomentForceSchema d={r.d} r={r} />,
};

// ---------- Torseur au centre d'une semelle (L1.3.3) ----------
type ResSemelle = ResultatSemelleTorseur & { d: DonneesSemelleTorseur };

const semelleDef: DefinitionCalcul<ResSemelle> = {
  champs: [
    champ('N', 'effort vertical du poteau', 'N', 'kN', 10, 3000, 10, 0),
    champ('H', 'effort horizontal (vent)', 'H', 'kN', 0, 300, 1, 0),
    champ('h', 'hauteur de H au-dessus de la base', 'h', 'm', 0, 5, 0.05, 2),
    champ('B', 'largeur de la semelle', 'B', 'm', 0.6, 4, 0.05, 2),
  ],
  defaut: { ...EXEMPLE_SEMELLE_TORSEUR },
  calculer: (e) => {
    const d = { N: num(e, 'N'), H: num(e, 'H'), h: num(e, 'h'), B: num(e, 'B') };
    return { ...semelleTorseur(d), d };
  },
  valeurs: {
    M: (r) => grandeur(r.M, 2, 'kN·m'),
    e: (r) => grandeur(r.e, 3, 'm'),
    R: (r) => grandeur(r.R, 2, 'kN'),
    tiers: (r) => grandeur(r.tiers, 3, 'm'),
  },
  lignes: {
    M: (r) => (
      <>
        moment de H au centre de la base : M = H × h = {n1(r.d.H)} kN × {n2(r.d.h)} m = <strong>{n2(r.M)} kN·m</strong>
      </>
    ),
    R: (r) => (
      <>
        résultante : R = √(N² + H²) = √({n1(r.d.N)}² + {n1(r.d.H)}²) = <strong>{n2(r.R)} kN</strong>, inclinée de {n2(r.angle)}° sur la verticale
      </>
    ),
    e: (r) => (
      <>
        excentricité : e = M / N = {n2(r.M)} / {n1(r.d.N)} = <strong>{n3(r.e)} m</strong> ; la résultante coupe la base à {n2(r.xR)} m du bord gauche
      </>
    ),
    tiers: (r) => (
      <>
        tiers central : B / 6 = {n2(r.d.B)} / 6 = {n3(r.tiers)} m ; e {r.dansTiersCentral ? '≤' : '>'} B / 6 : <strong>{r.dansTiersCentral ? 'la base reste entièrement comprimée' : 'une partie de la base se soulève'}</strong>
      </>
    ),
  },
  schema: ({ r }) => <SemelleTorseurSchema d={r.d} r={r} prefixe="fc-st" />,
  alerte: (r) => (r.dansTiersCentral ? undefined : 'La résultante sort du tiers central : le sol n’est plus comprimé sous toute la semelle. Élargir la semelle ou réduire l’excentricité.'),
};

// ---------- Marquise suspendue (L1.3.4) ----------
type ResMarquise = ResultatMarquise & { d: DonneesMarquise };

const marquiseDef: DefinitionCalcul<ResMarquise> = {
  champs: [
    champ('L', 'portée de la marquise', 'L', 'm', 0.5, 6, 0.05, 2),
    champ('alpha', 'angle du tirant avec la marquise', 'α', '°', 10, 75, 1, 0),
    champ('q', 'charge répartie (énoncé)', 'q', 'kN/m', 0, 10, 0.1, 2),
    champ('P', 'charge en bout (énoncé)', 'P', 'kN', 0, 10, 0.1, 2),
  ],
  defaut: { ...EXEMPLE_MARQUISE },
  calculer: (e) => {
    const d = { L: num(e, 'L'), alpha: num(e, 'alpha'), q: num(e, 'q'), P: num(e, 'P') };
    return { ...marquise(d), d };
  },
  valeurs: {
    T: (r) => grandeur(r.T, 2, 'kN'),
    HA: (r) => grandeur(r.HA, 2, 'kN'),
    VA: (r) => grandeur(r.VA, 2, 'kN'),
  },
  lignes: {
    inconnues: () => (
      <>
        trois inconnues : T (tirant), H<sub>A</sub> et V<sub>A</sub> (articulation) ; trois équations : ΣF<sub>x</sub> = 0, ΣF<sub>y</sub> = 0, ΣM = 0
      </>
    ),
    T: (r) => (
      <>
        moments en A (H<sub>A</sub> et V<sub>A</sub> n’y interviennent pas) : T sin α × L = q L² / 2 + P L, donc T = ({n2(r.d.q)} × {n2(r.d.L)}² / 2 + {n2(r.d.P)} × {n2(r.d.L)}) / ({n2(r.d.L)} × sin {nombre(r.d.alpha, 0)}°) = <strong>{n2(r.T)} kN</strong>
      </>
    ),
    HA: (r) => (
      <>
        ΣF<sub>x</sub> = 0 : H<sub>A</sub> = T cos α = {n2(r.T)} × cos {nombre(r.d.alpha, 0)}° = <strong>{n2(r.HA)} kN</strong>
      </>
    ),
    VA: (r) => (
      <>
        ΣF<sub>y</sub> = 0 : V<sub>A</sub> = q L + P − T sin α = {n2(r.d.q * r.d.L)} + {n2(r.d.P)} − {n2(r.Ty)} = <strong>{n2(r.VA)} kN</strong>
      </>
    ),
    controle: (r) => (
      <>
        contrôle par les moments en B : V<sub>A</sub> × L − q L² / 2 = {n2(r.VA)} × {n2(r.d.L)} − {n2((r.d.q * r.d.L * r.d.L) / 2)} = <strong>{n2(r.VA * r.d.L - (r.d.q * r.d.L * r.d.L) / 2)} kN·m</strong>
      </>
    ),
  },
  schema: ({ r }) => <MarquiseSchema d={r.d} r={r} prefixe="fc-mq" />,
};

// ---------- Console encastrée (L1.3.5) ----------
type ResConsole = ReturnType<typeof consoleEncastree> & { d: DonneesConsole };

const consoleDef: DefinitionCalcul<ResConsole> = {
  champs: [
    champ('L', 'longueur du porte-à-faux', 'L', 'm', 0.3, 4, 0.05, 2),
    champ('q', 'charge répartie (énoncé)', 'q', 'kN/m', 0, 30, 0.1, 2),
    champ('P', 'charge ponctuelle (énoncé)', 'P', 'kN', 0, 30, 0.1, 2),
    champ('a', 'distance de P à l’encastrement', 'a', 'm', 0, 4, 0.05, 2),
  ],
  defaut: { ...EXEMPLE_CONSOLE },
  calculer: (e) => {
    const d = { L: num(e, 'L'), q: num(e, 'q'), P: num(e, 'P'), a: num(e, 'a') };
    return { ...consoleEncastree(d), d };
  },
  valeurs: {
    V: (r) => grandeur(r.V, 2, 'kN'),
    M: (r) => grandeur(r.M, 2, 'kN·m'),
  },
  lignes: {
    V: (r) => (
      <>
        ΣF<sub>y</sub> = 0 : V = q L + P = {n2(r.d.q)} × {n2(r.d.L)} + {n2(r.d.P)} = <strong>{n2(r.V)} kN</strong>
      </>
    ),
    M: (r) => (
      <>
        ΣM = 0 à l’encastrement : M = q L² / 2 + P a = {n2(r.d.q)} × {n2(r.d.L)}² / 2 + {n2(r.d.P)} × {n2(r.d.a)} = {n2(r.Mq)} + {n2(r.MP)} = <strong>{n2(r.M)} kN·m</strong>
      </>
    ),
    H: () => <>ΣF<sub>x</sub> = 0 : aucune charge horizontale, la réaction horizontale est nulle</>,
  },
  schema: ({ r }) => <ConsoleSchema d={r.d} r={r} prefixe="fc-cs" />,
  alerte: (r) => (r.d.a > r.d.L ? 'La charge P doit être sur la console : a ≤ L.' : undefined),
};

// ---------- Réactions d'une poutre avec porte-à-faux (L1.3.6) ----------
type ResReactions = ResultatReactions & { d: DonneesPoutreConsole };

const reactionsDef: DefinitionCalcul<ResReactions> = {
  champs: [
    champ('L', 'longueur totale de la poutre', 'L', 'm', 1, 15, 0.1, 2),
    champ('xB', 'position de l’appui B (A en x = 0)', <>x<sub>B</sub></>, 'm', 0.5, 15, 0.1, 2),
    champ('q', 'charge uniforme sur toute la longueur', 'q', 'kN/m', 0, 50, 0.5, 1),
    champ('P', 'charge ponctuelle', 'P', 'kN', 0, 200, 1, 0),
    champ('a', 'position de P', 'a', 'm', 0, 15, 0.1, 2),
  ],
  defaut: { ...EXEMPLE_POUTRE_CONSOLE },
  calculer: (e) => {
    const d = { L: num(e, 'L'), xB: num(e, 'xB'), q: num(e, 'q'), P: num(e, 'P'), a: num(e, 'a') };
    return { ...poutreConsole(d), d };
  },
  valeurs: {
    RA: (r) => grandeur(r.RA, 2, 'kN'),
    RB: (r) => grandeur(r.RB, 2, 'kN'),
    Rtot: (r) => grandeur(r.Rtot, 2, 'kN'),
  },
  lignes: {
    resultantes: (r) => (
      <>
        charge uniforme : q L = {n1(r.d.q)} × {n2(r.d.L)} = {n2(r.parties[0]!.R)} kN, appliquée au milieu, x = {n2(r.parties[0]!.x)} m ; charge ponctuelle : {n2(r.d.P)} kN en x = {n2(r.d.a)} m
      </>
    ),
    RB: (r) => (
      <>
        moments en A : R<sub>B</sub> × {n2(r.d.xB)} = {n2(r.parties[0]!.R)} × {n2(r.parties[0]!.x)} + {n2(r.d.P)} × {n2(r.d.a)} = {n2(r.MA)} kN·m, donc R<sub>B</sub> = <strong>{n2(r.RB)} kN</strong>
      </>
    ),
    RA: (r) => (
      <>
        ΣF<sub>y</sub> = 0 : R<sub>A</sub> = {n2(r.Rtot)} − {n2(r.RB)} = <strong>{n2(r.RA)} kN</strong>
      </>
    ),
    controle: (r) => (
      <>
        contrôle, moments en B : R<sub>A</sub> × {n2(r.d.xB)} − Σ R<sub>i</sub> (x<sub>B</sub> − x<sub>i</sub>) = <strong>{n2(r.RA * r.d.xB - r.parties.reduce((s, p) => s + p.R * (r.d.xB - p.x), 0))} kN·m</strong>
      </>
    ),
  },
  schema: ({ r }) => <PoutreReactions d={r.d} r={r} prefixe="fc-pr" />,
  alerte: (r) =>
    r.d.xB > r.d.L || r.d.a > r.d.L
      ? 'L’appui B et la charge P doivent être sur la poutre : xB ≤ L et a ≤ L.'
      : r.RA < 0 || r.RB < 0
        ? 'Une réaction est négative : l’appui doit retenir la poutre vers le bas (ancrage), sinon elle se soulève et bascule.'
        : undefined,
};

// ---------- Degré d'hyperstaticité (L1.3.7) ----------
type ResHyper = ReturnType<typeof degreHyperstaticite> & { s: StructureType };

const hyperDef: DefinitionCalcul<ResHyper> = {
  champs: [{ type: 'choix', cle: 'structure', libelle: 'structure étudiée', symbole: 'S', options: STRUCTURES_TYPES.map((s) => ({ valeur: s.id, libelle: s.nom })) }],
  defaut: { structure: 'gerber' },
  calculer: (e) => {
    const s = STRUCTURES_TYPES.find((t) => t.id === String(e.structure)) ?? STRUCTURES_TYPES[0]!;
    return { ...degreHyperstaticite(s.r, s.p, s.internes), s };
  },
  valeurs: {
    h: (r) => `${r.h}`,
    nature: (r) => r.nature,
  },
  lignes: {
    inconnues: (r) => (
      <>
        inconnues de liaison : {r.s.r} avec le sol{r.s.internes ? ` + ${r.s.internes} dans la rotule intermédiaire` : ''} = <strong>{r.inconnues}</strong>
      </>
    ),
    equations: (r) => (
      <>
        équations de la statique : 3 par solide × {r.s.p} solide{r.s.p > 1 ? 's' : ''} = <strong>{r.equations}</strong>
      </>
    ),
    h: (r) => (
      <>
        h = {r.inconnues} − {r.equations} = <strong>{r.h}</strong> : structure <strong>{r.nature}</strong>
        {r.h < 0 ? ' (mécanisme : elle peut bouger sans se déformer)' : r.h > 0 ? ` (${r.h} inconnue${r.h > 1 ? 's' : ''} de trop pour la seule statique)` : ' (la statique suffit)'}
      </>
    ),
  },
  schema: ({ r }) => <StructureTypeSchema id={r.s.id} h={r.h} nature={r.nature} prefixe="fc-sty" />,
};

// ---------- Treillis Pratt : méthode des nœuds (L1.3.8) ----------
type ResPratt = { d: DonneesPratt; r: ResultatTreillis; sin: number; cos: number };

const pratt = (e: Record<string, number | string>): DonneesPratt => ({ n: num(e, 'n'), a: num(e, 'a'), h: num(e, 'h'), P: num(e, 'P') });

const noeudsDef: DefinitionCalcul<ResPratt> = {
  champs: [
    { type: 'choix', cle: 'n', libelle: 'nombre de panneaux', symbole: 'n', options: [4, 6].map((v) => ({ valeur: v, libelle: `${v} panneaux` })) },
    champ('a', 'longueur d’un panneau', 'a', 'm', 1, 6, 0.1, 2),
    champ('h', 'hauteur du treillis', 'h', 'm', 1, 6, 0.1, 2),
    champ('P', 'charge par nœud de la membrure inférieure', 'P', 'kN', 1, 100, 1, 0),
  ],
  defaut: { ...EXEMPLE_PRATT },
  calculer: (e) => {
    const d = pratt(e);
    const L = Math.hypot(d.a, d.h);
    return { d, r: treillis(geometriePratt(d)), sin: d.h / L, cos: d.a / L };
  },
  valeurs: {
    RA: (x) => grandeur(x.r.reactions[0]?.Ry ?? 0, 2, 'kN'),
    diag1: (x) => effort(x.r.efforts.diag1 ?? 0),
    inf1: (x) => effort(x.r.efforts.inf1 ?? 0),
  },
  lignes: {
    reactions: (x) => (
      <>
        symétrie : R<sub>A</sub> = R<sub>B</sub> = (n − 1) P / 2 = {Math.round(x.d.n) - 1} × {nombre(x.d.P, 0)} / 2 = <strong>{n2(x.r.reactions[0]?.Ry ?? 0)} kN</strong>
      </>
    ),
    angle: (x) => (
      <>
        inclinaison des diagonales : sin θ = h / √(a² + h²) = {n2(x.d.h)} / √({n2(x.d.a)}² + {n2(x.d.h)}²) = {n3(x.sin)} ; cos θ = {n3(x.cos)}
      </>
    ),
    noeudA: (x) => (
      <>
        nœud B0 : ΣF<sub>y</sub> = R<sub>A</sub> + N<sub>diag1</sub> sin θ = 0, donc N<sub>diag1</sub> = −{n2(x.r.reactions[0]?.Ry ?? 0)} / {n3(x.sin)} = <strong>{effort(x.r.efforts.diag1 ?? 0)}</strong> ; ΣF<sub>x</sub> = N<sub>inf1</sub> + N<sub>diag1</sub> cos θ = 0, donc N<sub>inf1</sub> = <strong>{effort(x.r.efforts.inf1 ?? 0)}</strong>
      </>
    ),
    noeudB1: (x) => (
      <>
        nœud B1 : ΣF<sub>y</sub> = N<sub>mont1</sub> − P = 0, donc N<sub>mont1</sub> = <strong>{effort(x.r.efforts.mont1 ?? 0)}</strong> ; ΣF<sub>x</sub> : N<sub>inf2</sub> = N<sub>inf1</sub> = {n2(x.r.efforts.inf2 ?? 0)} kN
      </>
    ),
    tableau: (x) => (
      <span className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
        {Object.entries(x.r.efforts).map(([id, N]) => (
          <span key={id} className="block">
            {id} : <strong>{n2(N)}</strong>
          </span>
        ))}
      </span>
    ),
  },
  schema: ({ r: x }) => <TreillisDessin d={geometriePratt(x.d)} r={x.r} prefixe="fc-tr" />,
};

// ---------- Méthode de Ritter (L1.3.9) ----------
type ResRitterF = ResultatRitter & { d: DonneesPratt; t: ResultatTreillis; kDemande: number };

const ritterDef: DefinitionCalcul<ResRitterF> = {
  champs: [
    { type: 'choix', cle: 'n', libelle: 'nombre de panneaux', symbole: 'n', options: [4, 6].map((v) => ({ valeur: v, libelle: `${v} panneaux` })) },
    champ('a', 'longueur d’un panneau', 'a', 'm', 1, 6, 0.1, 2),
    champ('h', 'hauteur du treillis', 'h', 'm', 1, 6, 0.1, 2),
    champ('P', 'charge par nœud inférieur', 'P', 'kN', 1, 100, 1, 0),
    { type: 'choix', cle: 'k', libelle: 'panneau coupé (moitié gauche)', symbole: 'k', options: [1, 2, 3].map((v) => ({ valeur: v, libelle: `panneau ${v}` })) },
  ],
  defaut: { ...EXEMPLE_PRATT, k: 2 },
  calculer: (e) => {
    const d = pratt(e);
    return { ...ritterPratt(d, num(e, 'k')), d, t: treillis(geometriePratt(d)), kDemande: num(e, 'k') };
  },
  valeurs: {
    Nsup: (r) => (r.Nsup === null ? 'pas de membrure supérieure' : effort(r.Nsup)),
    Ninf: (r) => effort(r.Ninf),
    Ndiag: (r) => effort(r.Ndiag),
    M: (r) => grandeur(r.Mdroite, 2, 'kN·m'),
  },
  lignes: {
    coupe: (r) => (
      <>
        on coupe le panneau {r.k} et l’on isole la partie gauche : R<sub>A</sub> = {n2(r.RA)} kN et {r.k - 1} charge{r.k - 1 > 1 ? 's' : ''} P, plus les efforts des barres coupées
      </>
    ),
    moments: (r) => (
      <>
        moment fléchissant au droit des nœuds du panneau : M(gauche) = <strong>{n2(r.Mgauche)} kN·m</strong> ; M(droite) = <strong>{n2(r.Mdroite)} kN·m</strong>
      </>
    ),
    sup: (r) =>
      r.Nsup === null ? (
        <>panneau d’about : la barre supérieure coupée est la diagonale d’about, il n’y a pas de membrure supérieure</>
      ) : (
        <>
          moments autour du nœud inférieur droit : N<sub>sup</sub> × h + M(droite) = 0, donc N<sub>sup</sub> = −{n2(r.Mdroite)} / {n2(r.d.h)} = <strong>{effort(r.Nsup)}</strong>
        </>
      ),
    inf: (r) => (
      <>
        moments autour du nœud supérieur du panneau : N<sub>inf</sub> × h = M = {n2(r.k === 1 ? r.Mdroite : r.Mgauche)} kN·m, donc N<sub>inf</sub> = <strong>{effort(r.Ninf)}</strong>
      </>
    ),
    diag: (r) => (
      <>
        projection verticale : V = R<sub>A</sub> − {r.k - 1} P = <strong>{n2(r.V)} kN</strong>, donc |N<sub>diag</sub>| = V / sin θ = {n2(r.V)} / {n3(r.sinDiag)} : <strong>{effort(r.Ndiag)}</strong>
      </>
    ),
    controle: (r) => {
      const id = (s: string) => r.t.efforts[`${s}${r.k}`] ?? 0;
      return (
        <>
          contrôle par la méthode des nœuds : {r.Nsup === null ? '' : `sup ${n2(id('sup'))}, `}inf {n2(id('inf'))}, diag {n2(id('diag'))} kN
        </>
      );
    },
  },
  schema: ({ r }) => <CoupeRitter d={r.d} r={r} />,
  alerte: (r) => (r.kDemande > r.k ? `Avec ${Math.round(r.d.n)} panneaux, la moitié gauche ne compte que les panneaux 1 à ${r.k} : le calcul porte sur le panneau ${r.k}.` : undefined),
};

// ---------- Mur poids (L1.3.10) ----------
type ResMur = ResultatMurPoids & { d: DonneesMurPoids };

const murDef: DefinitionCalcul<ResMur> = {
  champs: [
    champ('H', 'hauteur du mur', 'H', 'm', 1, 6, 0.1, 2),
    champ('b', 'largeur en tête', 'b', 'm', 0.3, 1.5, 0.05, 2),
    champ('B', 'largeur à la base', 'B', 'm', 0.5, 4, 0.05, 2),
    champ('gamma', 'poids volumique du béton non armé', 'γ', 'kN/m³', 18, 26, 0.5, 1),
    champ('Q', 'poussée des terres (énoncé)', 'Q', 'kN/m', 1, 150, 1, 0),
    champ('zQ', 'hauteur de la poussée', <>z<sub>Q</sub></>, 'm', 0.2, 3, 0.05, 2),
    champ('mu', 'coefficient de frottement base-sol (énoncé)', 'μ', '', 0.2, 0.8, 0.01, 2),
  ],
  defaut: { ...EXEMPLE_MUR_POIDS },
  calculer: (e) => {
    const d = { H: num(e, 'H'), b: num(e, 'b'), B: num(e, 'B'), gamma: num(e, 'gamma'), Q: num(e, 'Q'), zQ: num(e, 'zQ'), mu: num(e, 'mu') };
    return { ...murPoids(d), d };
  },
  valeurs: {
    W: (r) => grandeur(r.W, 2, 'kN/m'),
    FSr: (r) => n2(r.FSr),
    FSg: (r) => n2(r.FSg),
    e: (r) => grandeur(r.e, 3, 'm'),
  },
  lignes: {
    poids: (r) => (
      <>
        W<sub>1</sub> = γ b H = {n1(r.d.gamma)} × {n2(r.d.b)} × {n2(r.d.H)} = {n2(r.W1)} kN/m, à x<sub>1</sub> = B − b/2 = {n2(r.x1)} m ; W<sub>2</sub> = γ (B − b) H / 2 = {n2(r.W2)} kN/m, à x<sub>2</sub> = 2 (B − b) / 3 = {n2(r.x2)} m ; W = <strong>{n2(r.W)} kN/m</strong>
      </>
    ),
    moments: (r) => (
      <>
        autour de l’arête aval O : M<sub>s</sub> = {n2(r.W1)} × {n2(r.x1)} + {n2(r.W2)} × {n2(r.x2)} = <strong>{n2(r.Ms)} kN·m/m</strong> ; M<sub>r</sub> = Q z<sub>Q</sub> = {n1(r.d.Q)} × {n2(r.d.zQ)} = <strong>{n2(r.Mr)} kN·m/m</strong>
      </>
    ),
    renversement: (r) => (
      <>
        renversement : M<sub>s</sub> / M<sub>r</sub> = {n2(r.Ms)} / {n2(r.Mr)} = <strong>{n2(r.FSr)}</strong> {r.FSr >= FS_REPERE_MUR ? '≥' : '<'} {n1(FS_REPERE_MUR)} (repère de l’ancienne pratique)
      </>
    ),
    glissement: (r) => (
      <>
        glissement : μ W / Q = {n2(r.d.mu)} × {n2(r.W)} / {n1(r.d.Q)} = <strong>{n2(r.FSg)}</strong> {r.FSg >= FS_REPERE_MUR ? '≥' : '<'} {n1(FS_REPERE_MUR)}
      </>
    ),
    excentricite: (r) => (
      <>
        réaction du sol : x<sub>N</sub> = (M<sub>s</sub> − M<sub>r</sub>) / W = {n2(r.xN)} m ; e = B/2 − x<sub>N</sub> = <strong>{n3(r.e)} m</strong> {Math.abs(r.e) <= r.tiers ? '≤' : '>'} B/6 = {n3(r.tiers)} m
      </>
    ),
  },
  schema: ({ r }) => <MurPoidsSchema d={r.d} r={r} prefixe="fc-mp" />,
  alerte: (r) =>
    r.d.b > r.d.B
      ? 'La largeur en tête ne peut pas dépasser la largeur à la base.'
      : r.FSg < FS_REPERE_MUR || r.FSr < FS_REPERE_MUR
        ? `Coefficient inférieur au repère de ${n1(FS_REPERE_MUR)} : élargir la base, ajouter une bêche sous le mur ou drainer le remblai pour réduire la poussée.`
        : undefined,
};

// ---------- Caniveau en U (L1.3.11) ----------
type ResCaniveau = ReturnType<typeof caniveauU> & { d: DonneesCaniveau };

const caniveauDef: DefinitionCalcul<ResCaniveau> = {
  champs: [
    champ('B', 'largeur extérieure', 'B', 'cm', 30, 200, 1, 0),
    champ('H', 'hauteur extérieure', 'H', 'cm', 20, 200, 1, 0),
    champ('e', 'épaisseur des parois', 'e', 'cm', 5, 30, 1, 0),
    champ('ef', 'épaisseur du radier', <>e<sub>f</sub></>, 'cm', 5, 40, 1, 0),
  ],
  defaut: { ...EXEMPLE_CANIVEAU },
  calculer: (e) => {
    const d = { B: num(e, 'B'), H: num(e, 'H'), e: num(e, 'e'), ef: num(e, 'ef') };
    return { ...caniveauU(d), d };
  },
  valeurs: {
    A: (r) => grandeur(r.A, 0, 'cm²'),
    yG: (r) => grandeur(r.yG, 2, 'cm'),
    S: (r) => grandeur(r.Sx, 0, 'cm³'),
  },
  lignes: {
    morceaux: (r) => (
      <span className="grid">
        {r.morceaux.map((m) => (
          <span key={m.nom} className="block">
            {m.nom} : A = {nombre(m.A, 0)} cm², centre à y = {n2(m.y)} cm, A y = {nombre(m.A * m.y, 0)} cm³
          </span>
        ))}
      </span>
    ),
    somme: (r) => (
      <>
        A = Σ A<sub>i</sub> = <strong>{nombre(r.A, 0)} cm²</strong> ; moment statique S = Σ A<sub>i</sub> y<sub>i</sub> = <strong>{nombre(r.Sx, 0)} cm³</strong>
      </>
    ),
    yG: (r) => (
      <>
        y<sub>G</sub> = S / A = {nombre(r.Sx, 0)} / {nombre(r.A, 0)} = <strong>{n2(r.yG)} cm</strong> au-dessus du fond ; x<sub>G</sub> = B / 2 par symétrie
      </>
    ),
    trou: (r) => (
      <>
        contrôle par le vide : rectangle plein {nombre(r.trou.morceaux[0]!.A, 0)} cm² moins vide {nombre(-r.trou.morceaux[1]!.A, 0)} cm² : A = {nombre(r.trou.A, 0)} cm², S = {nombre(r.trou.Sx, 0)} cm³, y<sub>G</sub> = <strong>{n2(r.trou.yG)} cm</strong>
      </>
    ),
  },
  schema: ({ r }) => <CaniveauSchema d={r.d} r={r} prefixe="fc-cu" />,
  alerte: (r) => (2 * r.d.e >= r.d.B || r.d.ef >= r.d.H ? 'Les parois et le radier doivent laisser un vide intérieur : 2e < B et ef < H.' : undefined),
};

// ---------- Plateau sur trois appuis (L1.3.12) ----------
type ResTrois = { d: DonneesTroisAppuis; R: [number, number, number]; Ftot: number; Mx: number; My: number };

const troisDef: DefinitionCalcul<ResTrois> = {
  champs: [
    champ('Fc', 'poids de la cuve pleine', <>F<sub>c</sub></>, 'kN', 0, 600, 5, 0),
    champ('xc', 'position de la cuve, x', <>x<sub>c</sub></>, 'm', 0, 4, 0.05, 2),
    champ('yc', 'position de la cuve, y', <>y<sub>c</sub></>, 'm', 0, 3.5, 0.05, 2),
    champ('Fp', 'poids de la pompe', <>F<sub>p</sub></>, 'kN', 0, 50, 1, 0),
    champ('xp', 'position de la pompe, x', <>x<sub>p</sub></>, 'm', 0, 4, 0.05, 2),
    champ('yp', 'position de la pompe, y', <>y<sub>p</sub></>, 'm', 0, 3.5, 0.05, 2),
  ],
  defaut: { Fc: 240, xc: 2, yc: 1.5, Fp: 12, xp: 3, yp: 0.5 },
  calculer: (e) => {
    const d: DonneesTroisAppuis = {
      appuis: EXEMPLE_TROIS_APPUIS.appuis,
      charges: [
        { nom: 'cuve', x: num(e, 'xc'), y: num(e, 'yc'), F: num(e, 'Fc') },
        { nom: 'pompe', x: num(e, 'xp'), y: num(e, 'yp'), F: num(e, 'Fp') },
      ],
    };
    const r = troisAppuis(d) ?? { R: [0, 0, 0] as [number, number, number], Ftot: 0, Mx: 0, My: 0 };
    return { d, ...r };
  },
  valeurs: {
    RA: (r) => grandeur(r.R[0], 2, 'kN'),
    RB: (r) => grandeur(r.R[1], 2, 'kN'),
    RC: (r) => grandeur(r.R[2], 2, 'kN'),
  },
  lignes: {
    sommes: (r) => (
      <>
        Σ F = {n1(r.Ftot)} kN ; Σ F x = {n2(r.My)} kN·m ; Σ F y = {n2(r.Mx)} kN·m
      </>
    ),
    equations: (r) => {
      const [A, B, C] = r.d.appuis;
      return (
        <span className="grid">
          <span className="block">ΣF<sub>z</sub> = 0 : R<sub>A</sub> + R<sub>B</sub> + R<sub>C</sub> = {n1(r.Ftot)}</span>
          <span className="block">
            moments autour de l’axe y : {n2(A.x)} R<sub>A</sub> + {n2(B.x)} R<sub>B</sub> + {n2(C.x)} R<sub>C</sub> = {n2(r.My)}
          </span>
          <span className="block">
            moments autour de l’axe x : {n2(A.y)} R<sub>A</sub> + {n2(B.y)} R<sub>B</sub> + {n2(C.y)} R<sub>C</sub> = {n2(r.Mx)}
          </span>
        </span>
      );
    },
    solution: (r) => (
      <>
        résolution : R<sub>C</sub> = <strong>{n2(r.R[2])} kN</strong> ; R<sub>B</sub> = <strong>{n2(r.R[1])} kN</strong> ; R<sub>A</sub> = <strong>{n2(r.R[0])} kN</strong>
      </>
    ),
  },
  schemas: { plan: ({ r }) => <TroisAppuisPlan d={r.d} R={r.R} /> },
  schema: ({ r }) => <TroisAppuisPlan d={r.d} R={r.R} />,
  alerte: (r) => (r.R.some((x) => x < 0) ? 'Une réaction est négative : la charge sort du triangle des appuis et le plateau bascule autour d’un côté.' : undefined),
};

// ---------- Ferme de toiture (L1.3.P) ----------
type ResFerme = ResultatFermeEfforts & { d: DonneesFermeEfforts };

const fermeDef: DefinitionCalcul<ResFerme> = {
  champs: [
    champ('L', 'portée de la ferme', 'L', 'm', 4, 14, 0.1, 2),
    champ('alpha', 'pente des arbalétriers', 'α', '°', 15, 45, 1, 0),
    champ('entraxe', 'entraxe des fermes', 'e', 'm', 1, 5, 0.1, 2),
    champ('g', 'charges permanentes en plan (énoncé)', 'g', 'kN/m²', 0.1, 1.5, 0.05, 2),
    champ('q', 'charge d’entretien en plan (énoncé)', 'q', 'kN/m²', 0, 1.5, 0.05, 2),
  ],
  defaut: { L: EXEMPLE_FERME_EFFORTS.ferme.L, alpha: EXEMPLE_FERME_EFFORTS.ferme.alpha, entraxe: EXEMPLE_FERME_EFFORTS.ferme.entraxe, g: EXEMPLE_FERME_EFFORTS.g, q: EXEMPLE_FERME_EFFORTS.q },
  calculer: (e) => {
    const d = { ferme: { ...EXEMPLE_FERME_EFFORTS.ferme, L: num(e, 'L'), alpha: num(e, 'alpha'), entraxe: num(e, 'entraxe') }, g: num(e, 'g'), q: num(e, 'q') };
    return { ...fermeEfforts(d), d };
  },
  valeurs: {
    P: (r) => grandeur(r.Pnoeud, 2, 'kN'),
    RA: (r) => grandeur(r.resultat.reactions[0]?.Ry ?? 0, 2, 'kN'),
    AM1: (r) => effort(r.resultat.efforts['A-M1'] ?? 0),
    AD1: (r) => effort(r.resultat.efforts['A-D1'] ?? 0),
    max: (r) => {
      const v = Object.values(r.resultat.efforts);
      return `${n2(Math.min(...v))} kN en compression, ${n2(Math.max(...v))} kN en traction`;
    },
  },
  lignes: {
    charges: (r) => (
      <>
        p = (1,35 g + 1,5 q) × e = (1,35 × {n2(r.d.g)} + 1,5 × {n2(r.d.q)}) × {n2(r.d.ferme.entraxe)} = {n2(r.p)} kN/m ; P = p L / 4 = <strong>{n2(r.Pnoeud)} kN</strong> par nœud de l’arbalétrier, {n2(r.Prive)} kN aux appuis
      </>
    ),
    reactions: (r) => (
      <>
        symétrie : R<sub>A</sub> = R<sub>B</sub> = {n2(r.Ptot)} / 2 = <strong>{n2(r.resultat.reactions[0]?.Ry ?? 0)} kN</strong>
      </>
    ),
    noeudA: (r) => (
      <>
        nœud A : ΣF<sub>y</sub> : {n2(r.resultat.reactions[0]?.Ry ?? 0)} − {n2(r.Prive)} + N<sub>A-M1</sub> sin {nombre(r.d.ferme.alpha, 0)}° = 0, donc N<sub>A-M1</sub> = <strong>{effort(r.resultat.efforts['A-M1'] ?? 0)}</strong> ; ΣF<sub>x</sub> : N<sub>A-D1</sub> = −N<sub>A-M1</sub> cos {nombre(r.d.ferme.alpha, 0)}° = <strong>{effort(r.resultat.efforts['A-D1'] ?? 0)}</strong>
      </>
    ),
    noeudM1: (r) => (
      <>
        nœud M1 (charge P, arbalétrier, diagonale courte) : N<sub>D1-M1</sub> = <strong>{effort(r.resultat.efforts['D1-M1'] ?? 0)}</strong> ; N<sub>M1-S</sub> = <strong>{effort(r.resultat.efforts['M1-S'] ?? 0)}</strong>
      </>
    ),
    noeudD1: (r) => (
      <>
        nœud D1 : ΣF<sub>y</sub> : N<sub>D1-S</sub> = −N<sub>D1-M1</sub> = <strong>{effort(r.resultat.efforts['D1-S'] ?? 0)}</strong> ; ΣF<sub>x</sub> : N<sub>D1-D2</sub> = <strong>{effort(r.resultat.efforts['D1-D2'] ?? 0)}</strong>
      </>
    ),
    tableau: (r) => (
      <span className="grid sm:grid-cols-2 sm:gap-x-6">
        {BARRES_FERME.map((b) => (
          <span key={b.id} className="block">
            {b.nom} ({b.id}) : <strong>{effort(r.resultat.efforts[b.id] ?? 0)}</strong>
          </span>
        ))}
      </span>
    ),
  },
  schemas: {
    elevation: ({ r }) => <TreillisDessin d={r.treillis} r={r.resultat} prefixe="fc-fe" />,
    noeudA: ({ r }) => (
      <NoeudIsole
        titre="Nœud A isolé"
        forces={[
          { nom: 'R_A'.replace('_', ''), angle: 90, valeur: r.resultat.reactions[0]?.Ry ?? 0, type: 'reaction' },
          { nom: 'P/2', angle: -90, valeur: r.Prive, type: 'charge' },
          { nom: 'N(A-M1)', angle: r.d.ferme.alpha, valeur: r.resultat.efforts['A-M1'] ?? 0, type: 'barre' },
          { nom: 'N(A-D1)', angle: 0, valeur: r.resultat.efforts['A-D1'] ?? 0, type: 'barre' },
        ]}
      />
    ),
  },
  schema: ({ r }) => <TreillisDessin d={r.treillis} r={r.resultat} prefixe="fc-fe" />,
  alerte: (r) => (r.resultat.valide ? undefined : 'Le treillis n’a pas pu être résolu : vérifie la géométrie.'),
};

export const CALCULS_STATIQUE = {
  chargePoutre: chargeDef,
  momentPoint: momentDef,
  torseurSemelle: semelleDef,
  marquise: marquiseDef,
  consoleEncastree: consoleDef,
  reactionsAppuis: reactionsDef,
  hyperstatique: hyperDef,
  treillisNoeuds: noeudsDef,
  ritter: ritterDef,
  murPoids: murDef,
  caniveauU: caniveauDef,
  troisAppuis: troisDef,
  fermeEfforts: fermeDef,
} as const;

