// Fiches de calcul du module L1.4 (algèbre linéaire). Les valeurs viennent de lib/calc/lineaire.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { colonne, Matrice } from '@/components/pedago/Matrice';
import { ContraintesElements, MelangeColonnes, MohrPrincipales, NoeudBarresSchema, PanneVersant, PlateauRang, ProduitMetre, TriangleInconnues } from '@/components/schemas/Lineaire';
import {
  chargeVersant,
  contraintesPrincipales,
  deuxBarres,
  EXEMPLE_APPUIS_TRIANGLE,
  EXEMPLE_CHARGE_PLATEAU,
  EXEMPLE_CONTRAINTES,
  EXEMPLE_DEUX_BARRES,
  EXEMPLE_MELANGE,
  EXEMPLE_METRE,
  EXEMPLE_REPERE,
  EXEMPLE_TRIANGLE,
  GRANULATS,
  inverseTroisAppuis,
  melangeGranulats,
  metre,
  natureSysteme,
  plateauRang,
  PRIX_METRE,
  produitVecteur,
  QUANTITES_UNITAIRES,
  sarrus,
  treillisMatriciel,
  type DonneesContraintes,
  type DonneesDeuxBarres,
  type DonneesTriangle,
  type EtapeGauss,
  type NatureSysteme,
  type PointAppui,
} from '@/lib/calc/lineaire';
import { MATERIAUX_THERMIQUES } from '@/lib/calc/physique';
import { grandeur, nombre, nombreCourt, scientifique } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const n4 = (x: number) => nombre(x, 4);
/** Nombre entre parenthèses s'il est négatif : (−0,85). */
const par = (x: number, dec = 2) => (x < 0 ? `(${nombre(x, dec)})` : nombre(x, dec));
const effort = (N: number) => (Math.abs(N) < 1e-6 ? 'barre nulle' : N > 0 ? `${n2(N)} kN (traction)` : `${n2(N)} kN (compression)`);

const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

/** Opération de Gauss écrite comme au tableau : L2 ← L2 − 0,95 L1. */
const operation = (o: EtapeGauss['ops'][number]) => `L${o.ligne} ← L${o.ligne} ${o.k < 0 ? '+' : '−'} ${Math.abs(Math.abs(o.k) - 1) < 1e-12 ? '' : `${nombreCourt(Math.abs(o.k), 4)} `}L${o.source}`;

/** Opérations d'une étape, rangées par ligne pour la colonne de droite de la matrice. */
const opsParLigne = (e: EtapeGauss, m: number) => Array.from({ length: m }, (_, i) => {
  const o = e.ops.find((x) => x.ligne === i + 1);
  return o ? operation(o) : undefined;
});

const NATURES: Record<NatureSysteme, string> = {
  unique: 'une solution unique',
  infinite: 'une infinité de solutions',
  aucune: 'aucune solution',
};

// ---------- Métré matriciel (L1.4.1) ----------
type ResMetre = ReturnType<typeof metre> & { n: number[] };

const metreDef: DefinitionCalcul<ResMetre> = {
  champs: [
    champ('n1', 'nombre de semelles', <>n<sub>1</sub></>, 'u', 0, 60, 1, 0),
    champ('n2', 'nombre de poteaux', <>n<sub>2</sub></>, 'u', 0, 60, 1, 0),
    champ('n3', 'nombre de poutres', <>n<sub>3</sub></>, 'u', 0, 60, 1, 0),
  ],
  defaut: { n1: EXEMPLE_METRE.n[0]!, n2: EXEMPLE_METRE.n[1]!, n3: EXEMPLE_METRE.n[2]! },
  calculer: (e) => {
    const n = [num(e, 'n1'), num(e, 'n2'), num(e, 'n3')];
    return { ...metre(n), n };
  },
  valeurs: {
    beton: (r) => grandeur(r.totaux[0]!, 2, 'm³'),
    acier: (r) => grandeur(r.totaux[1]!, 0, 'kg'),
    coffrage: (r) => grandeur(r.totaux[2]!, 1, 'm²'),
    cout: (r) => grandeur(r.cout, 0, 'USD'),
  },
  lignes: {
    dimensions: () => (
      <>
        n<sup>T</sup> est une ligne (1 × 3) et Q une matrice (3 × 3) : le produit n<sup>T</sup> Q existe et donne une ligne (1 × 3), un total par matériau
      </>
    ),
    produit: (r) => (
      <>
        <Matrice M={[r.n]} dec={0} /> × <Matrice M={QUANTITES_UNITAIRES} dec={[2, 0, 1]} /> = <Matrice M={[r.totaux]} dec={[2, 0, 1]} />
      </>
    ),
    beton: (r) => (
      <>
        béton : {r.n[0]} × {n2(QUANTITES_UNITAIRES[0]![0]!)} + {r.n[1]} × {n2(QUANTITES_UNITAIRES[1]![0]!)} + {r.n[2]} × {n2(QUANTITES_UNITAIRES[2]![0]!)} = <strong>{n2(r.totaux[0]!)} m³</strong>
      </>
    ),
    acier: (r) => (
      <>
        acier : {r.n[0]} × {nombre(QUANTITES_UNITAIRES[0]![1]!, 0)} + {r.n[1]} × {nombre(QUANTITES_UNITAIRES[1]![1]!, 0)} + {r.n[2]} × {nombre(QUANTITES_UNITAIRES[2]![1]!, 0)} = <strong>{nombre(r.totaux[1]!, 0)} kg</strong>
      </>
    ),
    coffrage: (r) => (
      <>
        coffrage : {r.n[0]} × {n1(QUANTITES_UNITAIRES[0]![2]!)} + {r.n[1]} × {n1(QUANTITES_UNITAIRES[1]![2]!)} + {r.n[2]} × {n1(QUANTITES_UNITAIRES[2]![2]!)} = <strong>{n1(r.totaux[2]!)} m²</strong>
      </>
    ),
    cout: (r) => (
      <>
        coût = totaux · prix = {n2(r.totaux[0]!)} × {nombre(PRIX_METRE[0]!, 0)} + {nombre(r.totaux[1]!, 0)} × {n2(PRIX_METRE[1]!)} + {n1(r.totaux[2]!)} × {nombre(PRIX_METRE[2]!, 0)} = {r.couts.map((c) => n1(c)).join(' + ')} = <strong>{n1(r.cout)} USD</strong>, soit environ {nombre(r.cout, 0)} USD
      </>
    ),
  },
  schema: ({ r }) => <ProduitMetre n={r.n} totaux={r.totaux} />,
};

// ---------- Mélange de granulats par le pivot de Gauss (L1.4.2) ----------
type ResMelange = ReturnType<typeof melangeGranulats> & { c5: number; c15: number };

const melangeDef: DefinitionCalcul<ResMelange> = {
  champs: [
    champ('c5', 'passant visé au tamis de 5 mm (énoncé)', <>p<sub>5</sub></>, '%', 10, 90, 1, 0),
    champ('c15', 'passant visé au tamis de 15 mm (énoncé)', <>p<sub>15</sub></>, '%', 20, 95, 1, 0),
  ],
  defaut: { c5: EXEMPLE_MELANGE.cible5 * 100, c15: EXEMPLE_MELANGE.cible15 * 100 },
  calculer: (e) => {
    const c5 = num(e, 'c5');
    const c15 = num(e, 'c15');
    return { ...melangeGranulats(c5 / 100, c15 / 100), c5, c15 };
  },
  valeurs: {
    x: (r) => (r.x ? grandeur(r.x[0]! * 100, 1, '%') : '—'),
    y: (r) => (r.x ? grandeur(r.x[1]! * 100, 1, '%') : '—'),
    z: (r) => (r.x ? grandeur(r.x[2]! * 100, 1, '%') : '—'),
    melange: (r) => (r.x ? GRANULATS.map((g, i) => `${n1(r.x![i]! * 100)} % de ${g.nom}`).join(', ') : '—'),
  },
  lignes: {
    systeme: (r) => (
      <>
        x + y + z = 1 ; {n2(GRANULATS[0]!.p5)} x + {n2(GRANULATS[1]!.p5)} y + {n2(GRANULATS[2]!.p5)} z = {n2(r.c5 / 100)} ; {n2(GRANULATS[0]!.p15)} x + {n2(GRANULATS[1]!.p15)} y + {n2(GRANULATS[2]!.p15)} z = {n2(r.c15 / 100)}, soit [A | b] = <Matrice M={r.etapes[0]!.M} augmentee dec={2} />
      </>
    ),
    etape1: (r) => {
      const e = r.etapes.find((x) => x.type === 'elimination' && x.colonne === 0);
      return e ? (
        <>
          pivot a<sub>11</sub> = {n2(r.etapes[0]!.M[0]![0]!)} : <Matrice M={e.M} augmentee dec={4} pivot={[0, 0]} zeros={[[1, 0], [2, 0]]} ops={opsParLigne(e, 3)} />
        </>
      ) : (
        <>la première colonne est déjà éliminée</>
      );
    },
    etape2: (r) => {
      const e = r.etapes.find((x) => x.type === 'elimination' && x.colonne === 1);
      return e ? (
        <>
          pivot a<sub>22</sub> = {n4(r.etapes[r.etapes.indexOf(e) - 1]!.M[1]![1]!)} : <Matrice M={e.M} augmentee dec={4} pivot={[1, 1]} zeros={[[1, 0], [2, 0], [2, 1]]} ops={opsParLigne(e, 3)} />
        </>
      ) : (
        <>la deuxième colonne est déjà éliminée</>
      );
    },
    remontee: (r) => {
      const T = r.etapes[r.etapes.length - 1]!.M;
      if (!r.x) return <>un pivot nul : pas de solution unique</>;
      return (
        <>
          z = {par(T[2]![3]!, 4)} / {par(T[2]![2]!, 4)} = <strong>{n4(r.x[2]!)}</strong> ; y = ({par(T[1]![3]!, 4)} − {par(T[1]![2]!, 4)} × {n4(r.x[2]!)}) / {par(T[1]![1]!, 4)} = <strong>{n4(r.x[1]!)}</strong> ; x = 1 − y − z = <strong>{n4(r.x[0]!)}</strong>
        </>
      );
    },
    verification: (r) => {
      if (!r.x) return <>—</>;
      const v = produitVecteur(r.A, r.x);
      return (
        <>
          report dans les équations : x + y + z = {n4(v[0]!)} ; passant à 5 mm : {n4(v[1]!)} ; passant à 15 mm : {n4(v[2]!)}
        </>
      );
    },
  },
  schema: ({ r }) => <MelangeColonnes x={r.x} cible5={r.c5 / 100} cible15={r.c15 / 100} />,
  alerte: (r) => (!r.x ? 'Le système n’a pas de solution unique.' : r.x.some((v) => v < -1e-9) ? 'Une proportion est négative : ces trois granulats ne permettent pas d’atteindre ces passants. Change les objectifs ou l’un des granulats.' : undefined),
};

// ---------- Plateau sur trois appuis par la matrice inverse (L1.4.3) ----------
type ResInverse = ReturnType<typeof inverseTroisAppuis> & { appuis: PointAppui[]; F: number; xF: number; yF: number; sar: ReturnType<typeof sarrus>; nature: NatureSysteme };

const inverseDef: DefinitionCalcul<ResInverse> = {
  champs: [
    champ('xB', 'abscisse de l’appui B (A à l’origine)', <>x<sub>B</sub></>, 'm', 1, 8, 0.1, 2),
    champ('xC', 'abscisse de l’appui C', <>x<sub>C</sub></>, 'm', 0, 8, 0.1, 2),
    champ('yC', 'ordonnée de l’appui C', <>y<sub>C</sub></>, 'm', 0, 6, 0.1, 2),
    champ('F', 'charge verticale (énoncé)', 'F', 'kN', 1, 1000, 1, 0),
    champ('xF', 'abscisse de la charge', <>x<sub>F</sub></>, 'm', 0, 8, 0.1, 2),
    champ('yF', 'ordonnée de la charge', <>y<sub>F</sub></>, 'm', 0, 6, 0.1, 2),
  ],
  defaut: { xB: EXEMPLE_APPUIS_TRIANGLE[1].x, xC: EXEMPLE_APPUIS_TRIANGLE[2].x, yC: EXEMPLE_APPUIS_TRIANGLE[2].y, ...EXEMPLE_CHARGE_PLATEAU },
  calculer: (e) => {
    const appuis: PointAppui[] = [
      { nom: 'A', x: 0, y: 0 },
      { nom: 'B', x: num(e, 'xB'), y: 0 },
      { nom: 'C', x: num(e, 'xC'), y: num(e, 'yC') },
    ];
    const F = num(e, 'F');
    const xF = num(e, 'xF');
    const yF = num(e, 'yF');
    const r = inverseTroisAppuis(appuis, F, xF, yF);
    return { ...r, appuis, F, xF, yF, sar: sarrus(r.M), nature: natureSysteme(r.M, r.second).nature };
  },
  valeurs: {
    det: (r) => n2(r.det),
    aire: (r) => grandeur(r.aire, 2, 'm²'),
    RA: (r) => (r.R ? grandeur(r.R[0]!, 2, 'kN') : '—'),
    RB: (r) => (r.R ? grandeur(r.R[1]!, 2, 'kN') : '—'),
    RC: (r) => (r.R ? grandeur(r.R[2]!, 2, 'kN') : '—'),
  },
  lignes: {
    systeme: (r) => (
      <>
        M R = F : <Matrice nom="M" M={r.M} dec={2} zeroSimple /> <Matrice M={colonne(['R_A', 'R_B', 'R_C'].map((t) => <>R<sub>{t.slice(2)}</sub></>))} /> = <Matrice M={colonne(r.second)} dec={1} />
      </>
    ),
    det: (r) => (
      <>
        Sarrus : det M = {r.sar.plus.map((v) => par(v, 2)).join(' + ')} − ({r.sar.moins.map((v) => par(v, 2)).join(' + ')}) = <strong>{n2(r.det)}</strong>, soit 2 × aire du triangle ABC ({n2(r.aire)} m²)
      </>
    ),
    inverse: (r) =>
      r.inv ? (
        <>
          det M ≠ 0, M est inversible : <Matrice nom={<>M<sup>−1</sup></>} M={r.inv} dec={4} zeroSimple />
        </>
      ) : (
        <>det M = 0 : M n’a pas d’inverse</>
      ),
    R: (r) =>
      r.R ? (
        <>
          R = M<sup>−1</sup> F = <Matrice M={colonne(r.R)} dec={2} /> kN
        </>
      ) : (
        <>pas de solution par l’inverse</>
      ),
    controle: (r) =>
      r.R ? (
        <>
          contrôle : R<sub>A</sub> + R<sub>B</sub> + R<sub>C</sub> = {n2(r.R[0]!)} + {n2(r.R[1]!)} + {n2(r.R[2]!)} = <strong>{n2(r.R.reduce((s, v) => s + v, 0))} kN</strong> = F
        </>
      ) : (
        <>—</>
      ),
  },
  schema: ({ r }) => <PlateauRang appuis={r.appuis} F={r.F} xF={r.xF} yF={r.yF} nature={r.nature} R={r.R} />,
  alerte: (r) =>
    !r.inv ? 'Les trois appuis sont alignés : det M = 0 et M n’a pas d’inverse.' : r.R && r.R.some((v) => v < -1e-9) ? 'Une réaction est négative : la charge est hors du triangle des appuis et le plateau bascule autour d’un côté.' : undefined,
};

// ---------- Rang : le plateau dont on aligne les appuis (L1.4.4) ----------
type ResRang = ReturnType<typeof plateauRang> & { F: number; xF: number; yF: number };

const rangDef: DefinitionCalcul<ResRang> = {
  champs: [
    champ('yC', 'ordonnée de l’appui C (0 : appuis alignés)', <>y<sub>C</sub></>, 'm', 0, 4, 0.1, 2),
    champ('F', 'charge verticale (énoncé)', 'F', 'kN', 10, 500, 10, 0),
    champ('xF', 'abscisse de la charge', <>x<sub>F</sub></>, 'm', 0, 4, 0.1, 2),
    champ('yF', 'ordonnée de la charge', <>y<sub>F</sub></>, 'm', 0, 4, 0.1, 2),
  ],
  defaut: { yC: 0, F: 100, xF: 1.5, yF: 0.8 },
  calculer: (e) => {
    const F = num(e, 'F');
    const xF = num(e, 'xF');
    const yF = num(e, 'yF');
    return { ...plateauRang(num(e, 'yC'), F, xF, yF), F, xF, yF };
  },
  valeurs: {
    rangA: (r) => `${r.rangA}`,
    rangAb: (r) => `${r.rangAb}`,
    nature: (r) => NATURES[r.nature],
  },
  lignes: {
    augmentee: (r) => (
      <>
        matrice augmentée : <Matrice nom="[M | F]" M={r.M.map((l, i) => [...l, r.b[i]!])} augmentee dec={[2, 2, 2, 1]} zeroSimple />
      </>
    ),
    echelon: (r) => (
      <>
        après élimination : <Matrice M={r.E} augmentee zeroSimple dec={[2, 2, 2, 1]} zeros={r.E.flatMap((l, i) => l.map((v, j) => [i, j] as const).filter(([, j]) => j < i && Math.abs(l[j]!) < 1e-9))} />
      </>
    ),
    rangs: (r) => (
      <>
        lignes non nulles : rang M = <strong>{r.rangA}</strong> ; rang [M | F] = <strong>{r.rangAb}</strong> ; inconnues : {r.inconnues}
      </>
    ),
    conclusion: (r) => (
      <>
        {r.nature === 'unique'
          ? `rang M = rang [M | F] = ${r.inconnues} : une solution unique, les trois réactions sont déterminées`
          : r.nature === 'infinite'
            ? `rang M = rang [M | F] = ${r.rangA} < ${r.inconnues} : une infinité de solutions, la statique ne suffit pas à répartir la charge`
            : `rang M = ${r.rangA} < rang [M | F] = ${r.rangAb} : la dernière ligne dit 0 = ${n1(r.E[2]![3]!)}, c’est impossible ; aucune solution, le plateau bascule`}
      </>
    ),
  },
  schema: ({ r }) => <PlateauRang appuis={r.appuis} F={r.F} xF={r.xF} yF={r.yF} nature={r.nature} R={r.R} />,
};

// ---------- Changement de repère : la panne sur un versant (L1.4.5) ----------
type ResRepere = ReturnType<typeof chargeVersant> & { q: number; alpha: number };

const repereDef: DefinitionCalcul<ResRepere> = {
  champs: [
    champ('q', 'charge verticale sur la panne (énoncé)', 'q', 'kN/m', 0.1, 10, 0.1, 2),
    champ('alpha', 'pente du versant', 'α', '°', 0, 60, 1, 0),
  ],
  defaut: { q: -EXEMPLE_REPERE.Fy, alpha: EXEMPLE_REPERE.alpha },
  calculer: (e) => {
    const q = num(e, 'q');
    const alpha = num(e, 'alpha');
    return { ...chargeVersant(q, alpha), q, alpha };
  },
  valeurs: {
    qPente: (r) => grandeur(r.qPente, 2, 'kN/m'),
    qNormale: (r) => grandeur(r.qNormale, 2, 'kN/m'),
    norme: (r) => grandeur(r.norme, 2, 'kN/m'),
  },
  lignes: {
    rotation: (r) => (
      <>
        repère local tourné de α = {nombre(r.alpha, 0)}° : <Matrice nom="R(α)" M={r.R} dec={4} /> et <Matrice nom={<>R<sup>T</sup></>} M={r.Rt} dec={4} />
      </>
    ),
    local: (r) => (
      <>
        q′ = R<sup>T</sup> q = <Matrice M={r.Rt} dec={4} /> × <Matrice M={colonne(r.global)} dec={2} /> = <Matrice M={colonne(r.local)} dec={3} /> kN/m
      </>
    ),
    sens: (r) => (
      <>
        x′ : {n3(r.local[0])} kN/m, {r.local[0] < 0 ? 'vers le bas de la pente' : 'vers le haut de la pente'} ; y′ : {n3(r.local[1])} kN/m, {r.local[1] < 0 ? 'qui plaque la panne contre le versant' : 'qui soulève la panne'}
      </>
    ),
    controle: (r) => (
      <>
        contrôle : √({n3(r.local[0])}² + {n3(r.local[1])}²) = <strong>{n2(r.norme)} kN/m</strong> = q ; et R q′ redonne ({n2(r.retour[0])} ; {n2(r.retour[1])})
      </>
    ),
  },
  schema: ({ r }) => <PanneVersant q={r.q} alpha={r.alpha} local={r.local} />,
};

// ---------- Contraintes principales (L1.4.6) ----------
type ResPrincipales = ReturnType<typeof contraintesPrincipales> & { d: DonneesContraintes };

const FCTM = MATERIAUX_THERMIQUES.beton.limite;

const principalesDef: DefinitionCalcul<ResPrincipales> = {
  champs: [
    champ('sx', 'contrainte normale selon x (énoncé)', <>σ<sub>x</sub></>, 'MPa', -10, 10, 0.1, 2),
    champ('sy', 'contrainte normale selon y (énoncé)', <>σ<sub>y</sub></>, 'MPa', -10, 10, 0.1, 2),
    champ('txy', 'contrainte de cisaillement (énoncé)', 'τ', 'MPa', -10, 10, 0.1, 2),
  ],
  defaut: { ...EXEMPLE_CONTRAINTES },
  calculer: (e) => {
    const d = { sx: num(e, 'sx'), sy: num(e, 'sy'), txy: num(e, 'txy') };
    return { ...contraintesPrincipales(d), d };
  },
  valeurs: {
    s1: (r) => grandeur(r.s1, 2, 'MPa'),
    s2: (r) => grandeur(r.s2, 2, 'MPa'),
    theta1: (r) => `${n1(r.theta1)}°`,
    tauMax: (r) => grandeur(r.tauMax, 2, 'MPa'),
  },
  lignes: {
    tenseur: (r) => (
      <>
        tenseur des contraintes, symétrique : <Matrice nom="T" M={r.T} dec={2} /> MPa
      </>
    ),
    caracteristique: (r) => (
      <>
        det(T − λ I) = 0 : λ² − (tr T) λ + det T = 0, avec tr T = {n2(r.trace)} et det T = {n2(r.d.sx)} × {par(r.d.sy)} − {par(r.d.txy)}² = {n2(r.det)} : λ² − {par(r.trace)} λ + {par(r.det)} = 0
      </>
    ),
    lambdas: (r) => (
      <>
        λ = ({n2(r.trace)} ± √({par(r.trace)}² − 4 × {par(r.det)})) / 2 : σ<sub>1</sub> = <strong>{n3(r.s1)} MPa</strong> ; σ<sub>2</sub> = <strong>{n3(r.s2)} MPa</strong>
      </>
    ),
    vecteur: (r) => (
      <>
        (T − σ<sub>1</sub> I) v = 0 : v<sub>1</sub> = ({n4(r.v1[0]!)} ; {n4(r.v1[1]!)}), direction θ<sub>1</sub> = <strong>{n1(r.theta1)}°</strong> depuis l’axe x ; v<sub>2</sub> = ({n4(r.v2[0]!)} ; {n4(r.v2[1]!)})
      </>
    ),
    controle: (r) => (
      <>
        contrôles : σ<sub>1</sub> + σ<sub>2</sub> = {n3(r.s1 + r.s2)} = tr T ; σ<sub>1</sub> × σ<sub>2</sub> = {n3(r.s1 * r.s2)} = det T ; v<sub>1</sub> · v<sub>2</sub> = {n3(r.v1[0]! * r.v2[0]! + r.v1[1]! * r.v2[1]!)} : directions perpendiculaires
      </>
    ),
    beton: (r) => (
      <>
        béton C25/30 : f<sub>ctm</sub> = {n1(FCTM)} MPa (EN 1992-1-1, tableau 3.1) ; σ<sub>1</sub> = {n2(r.s1)} MPa {r.s1 > FCTM ? '> fctm : une fissure peut s’ouvrir, perpendiculaire à v1' : '≤ fctm : pas de fissure attendue à ce point'}
      </>
    ),
    tau: (r) => (
      <>
        cisaillement maximal : τ<sub>max</sub> = (σ<sub>1</sub> − σ<sub>2</sub>) / 2 = <strong>{n3(r.tauMax)} MPa</strong>, à 45° des directions principales
      </>
    ),
  },
  schema: ({ r }) => <ContraintesElements d={r.d} s1={r.s1} s2={r.s2} theta1={r.theta1} />,
  schemas: {
    elements: ({ r }) => <ContraintesElements d={r.d} s1={r.s1} s2={r.s2} theta1={r.theta1} />,
    mohr: ({ r }) => <MohrPrincipales d={r.d} />,
  },
};

// ---------- K u = F : deux barres (L1.4.7) ----------
type ResBarres = ReturnType<typeof deuxBarres> & { d: DonneesDeuxBarres };

const barresDef: DefinitionCalcul<ResBarres> = {
  champs: [
    champ('E', 'module d’Young de l’acier', 'E', 'GPa', 50, 250, 1, 0),
    champ('A1', 'section de la barre 1', <>A<sub>1</sub></>, 'cm²', 0.5, 20, 0.1, 2),
    champ('A2', 'section de la barre 2', <>A<sub>2</sub></>, 'cm²', 0.5, 20, 0.1, 2),
    champ('xA', 'position horizontale de l’appui A (à gauche du nœud)', <>x<sub>A</sub></>, 'm', -6, -0.5, 0.1, 2),
    champ('xB', 'position horizontale de l’appui B (à droite du nœud)', <>x<sub>B</sub></>, 'm', 0.5, 6, 0.1, 2),
    champ('h', 'hauteur des appuis au-dessus du nœud', 'h', 'm', 0, 5, 0.1, 2),
    champ('Fx', 'charge horizontale au nœud (énoncé)', <>F<sub>x</sub></>, 'kN', -50, 50, 1, 0),
    champ('Fy', 'charge verticale au nœud, négative vers le bas (énoncé)', <>F<sub>y</sub></>, 'kN', -100, 100, 1, 0),
  ],
  defaut: { E: EXEMPLE_DEUX_BARRES.E, A1: EXEMPLE_DEUX_BARRES.A1, A2: EXEMPLE_DEUX_BARRES.A2, xA: EXEMPLE_DEUX_BARRES.xA, xB: EXEMPLE_DEUX_BARRES.xB, h: EXEMPLE_DEUX_BARRES.yA, Fx: EXEMPLE_DEUX_BARRES.Fx, Fy: EXEMPLE_DEUX_BARRES.Fy },
  calculer: (e) => {
    const h = num(e, 'h');
    const d = { E: num(e, 'E'), A1: num(e, 'A1'), A2: num(e, 'A2'), xA: num(e, 'xA'), yA: h, xB: num(e, 'xB'), yB: h, Fx: num(e, 'Fx'), Fy: num(e, 'Fy') };
    return { ...deuxBarres(d), d };
  },
  valeurs: {
    k1: (r) => grandeur(r.barres[0].k, 0, 'kN/m'),
    k2: (r) => grandeur(r.barres[1].k, 0, 'kN/m'),
    ux: (r) => (r.u ? grandeur(r.u[0]! * 1000, 3, 'mm') : '—'),
    uy: (r) => (r.u ? grandeur(r.u[1]! * 1000, 3, 'mm') : '—'),
    N1: (r) => (r.N ? effort(r.N[0]!) : '—'),
    N2: (r) => (r.N ? effort(r.N[1]!) : '—'),
  },
  lignes: {
    geometrie: (r) => (
      <>
        {r.barres.map((b, i) => (
          <span key={i} className="block">
            barre {i + 1} : L<sub>{i + 1}</sub> = {n3(b.L)} m ; direction (de l’appui vers le nœud) e<sub>{i + 1}</sub> = ({n4(b.c)} ; {n4(b.s)})
          </span>
        ))}
      </>
    ),
    raideurs: (r) => (
      <>
        {r.barres.map((b, i) => (
          <span key={i} className="block">
            k<sub>{i + 1}</sub> = E A<sub>{i + 1}</sub> / L<sub>{i + 1}</sub> = {nombre(r.d.E, 0)} × 10⁶ kN/m² × {n2(i === 0 ? r.d.A1 : r.d.A2)} × 10⁻⁴ m² / {n3(b.L)} m = <strong>{nombre(b.k, 0)} kN/m</strong>
          </span>
        ))}
      </>
    ),
    elementaires: (r) => (
      <>
        K<sub>i</sub> = k<sub>i</sub> e<sub>i</sub> e<sub>i</sub><sup>T</sup> : <Matrice nom={<>K<sub>1</sub></>} M={r.barres[0].Ke} dec={0} /> <Matrice nom={<>K<sub>2</sub></>} M={r.barres[1].Ke} dec={0} /> kN/m
      </>
    ),
    assemblage: (r) => (
      <>
        assemblage : <Matrice nom="K = K₁ + K₂" M={r.K} dec={0} zeroSimple /> kN/m ; det K = {scientifique(r.det, 3)} (kN/m)²
      </>
    ),
    resolution: (r) =>
      r.u ? (
        <>
          u = K<sup>−1</sup> F : <Matrice M={colonne([r.d.Fx, r.d.Fy])} dec={0} /> kN donne <Matrice M={colonne(r.u.map((v) => v * 1000))} dec={3} /> mm
        </>
      ) : (
        <>K n’est pas inversible</>
      ),
    efforts: (r) =>
      r.N && r.u ? (
        <>
          {r.barres.map((b, i) => (
            <span key={i} className="block">
              N<sub>{i + 1}</sub> = k<sub>{i + 1}</sub> (u · e<sub>{i + 1}</sub>) = {nombre(b.k, 0)} × ({n4(r.u![0]! * 1000)} × {par(b.c, 4)} + {n4(r.u![1]! * 1000)} × {par(b.s, 4)}) × 10⁻³ = <strong>{effort(r.N![i]!)}</strong>
            </span>
          ))}
        </>
      ) : (
        <>—</>
      ),
    controle: (r) =>
      r.statique ? (
        <>
          contrôle par l’équilibre du nœud (deux équations, deux inconnues) : N<sub>1</sub> = {n2(r.statique[0]!)} kN et N<sub>2</sub> = {n2(r.statique[1]!)} kN : mêmes valeurs
        </>
      ) : (
        <>—</>
      ),
  },
  schema: ({ r }) => <NoeudBarresSchema barres={[{ x: r.d.xA, y: r.d.yA, A: r.d.A1 }, { x: r.d.xB, y: r.d.yB, A: r.d.A2 }]} u={r.u} N={r.N} Fx={r.d.Fx} Fy={r.d.Fy} prefixe="fc-nb" />,
  alerte: (r) => (!r.u ? 'Les barres sont alignées avec le nœud : K est singulière (det K = 0). Le nœud ne peut pas reprendre une charge perpendiculaire aux barres sans grand déplacement.' : undefined),
};

// ---------- Mini-projet : treillis triangulaire résolu par matrices (L1.4.P) ----------
type ResTreillisM = ReturnType<typeof treillisMatriciel> & { d: DonneesTriangle };

const INCONNUES_TRIANGLE = ['N(AB)', 'N(AC)', 'N(BC)', 'RAx', 'RAy', 'RBy'];
const EQUATIONS_TRIANGLE = ['A : ΣFx', 'A : ΣFy', 'B : ΣFx', 'B : ΣFy', 'C : ΣFx', 'C : ΣFy'];

const treillisDef: DefinitionCalcul<ResTreillisM> = {
  champs: [
    champ('L', 'portée de la ferme', 'L', 'm', 2, 12, 0.1, 2),
    champ('h', 'hauteur du sommet C', 'h', 'm', 0.5, 5, 0.1, 2),
    champ('P', 'charge verticale en C (énoncé)', 'P', 'kN', 0, 100, 0.5, 1),
    champ('W', 'charge horizontale en C, vent (énoncé)', 'W', 'kN', -30, 30, 0.5, 1),
  ],
  defaut: { ...EXEMPLE_TRIANGLE },
  calculer: (e) => {
    const d = { L: num(e, 'L'), h: num(e, 'h'), P: num(e, 'P'), W: num(e, 'W') };
    return { ...treillisMatriciel(d), d };
  },
  valeurs: {
    NAB: (r) => (r.s ? effort(r.s[0]!) : '—'),
    NAC: (r) => (r.s ? effort(r.s[1]!) : '—'),
    NBC: (r) => (r.s ? effort(r.s[2]!) : '—'),
    RAx: (r) => (r.s ? grandeur(r.s[3]!, 2, 'kN') : '—'),
    RAy: (r) => (r.s ? grandeur(r.s[4]!, 2, 'kN') : '—'),
    RBy: (r) => (r.s ? grandeur(r.s[5]!, 2, 'kN') : '—'),
    det: (r) => n4(r.det),
    inconnues: (r) => `${r.inconnues.length}`,
  },
  lignes: {
    comptage: (r) => (
      <>
        3 barres + 3 composantes de réaction = <strong>{r.inconnues.length} inconnues</strong> ; 3 nœuds × 2 équations = <strong>{r.A.length} équations</strong> : le système est carré
      </>
    ),
    matrice: (r) => <Matrice M={r.A.map((l, i) => [...l, r.B[i]!])} augmentee compacte zeroSimple dec={3} lignes={EQUATIONS_TRIANGLE} colonnes={[...INCONNUES_TRIANGLE, 'B']} alt="matrice augmentée [A | B] du treillis, 6 équations et 6 inconnues" />,
    det: (r) => (
      <>
        det A = <strong>{n4(r.det)}</strong> {Math.abs(r.det) > 1e-9 ? '≠ 0 : une solution unique, le treillis est isostatique et stable' : '= 0 : le treillis est un mécanisme'}
      </>
    ),
    solution: (r) =>
      r.s ? (
        <>
          pivot de Gauss ({r.etapes.length - 1} étapes d’élimination), puis remontée : <Matrice M={colonne(r.s)} lignes={INCONNUES_TRIANGLE} dec={3} /> kN
        </>
      ) : (
        <>pas de solution unique</>
      ),
    controle: (r) =>
      r.s ? (
        <>
          contrôle par les moments en A : R<sub>By</sub> × L = P × L/2 + W × h, donc R<sub>By</sub> = ({n1(r.d.P)} × {n2(r.d.L / 2)} + {par(r.d.W, 1)} × {n2(r.d.h)}) / {n2(r.d.L)} = <strong>{n3(r.RByMoments)} kN</strong> : même valeur que s<sub>6</sub>
        </>
      ) : (
        <>—</>
      ),
    superposition: (r) =>
      r.s && r.s1 && r.s2 ? (
        <>
          linéarité : s = P s<sub>1</sub> + W s<sub>2</sub>, avec s<sub>1</sub> (P = 1 kN) et s<sub>2</sub> (W = 1 kN) : <Matrice M={INCONNUES_TRIANGLE.map((_, i) => [r.s1![i]!, r.s2![i]!, r.s![i]!])} colonnes={['s₁', 's₂', 's']} lignes={INCONNUES_TRIANGLE} dec={3} compacte zeroSimple />
        </>
      ) : (
        <>—</>
      ),
  },
  schema: ({ r }) => <TriangleInconnues d={r.d} s={r.s} prefixe="fc-ti" />,
  schemas: {
    inconnues: ({ r }) => <TriangleInconnues d={r.d} prefixe="fc-ti0" />,
    resultats: ({ r }) => <TriangleInconnues d={r.d} s={r.s} prefixe="fc-ti1" />,
  },
  alerte: (r) => (!r.s ? 'Le système est singulier : vérifie que la hauteur h est positive.' : undefined),
};

export const CALCULS_LINEAIRE = {
  metreMatriciel: metreDef,
  melangeGranulats: melangeDef,
  inverseAppuis: inverseDef,
  rangPlateau: rangDef,
  changementRepere: repereDef,
  contraintesPrincipales: principalesDef,
  rigiditeBarres: barresDef,
  treillisMatriciel: treillisDef,
} as const;

