// Fiches de calcul du module L2.5 (résistance des matériaux II). Les valeurs viennent de lib/calc/rdm2.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { BalconConsole, CasEuler, DiagrammeComposee, ElementContraintes, EnergieConsole, FlexionDevieeSection, LigneElastique, PoutreContinue, SemellePression, Superposition } from '@/components/schemas/Rdm2';
import type { DonneesPoutreIso } from '@/lib/calc/rdm1';
import {
  balcon,
  castiglianoConsole,
  COEFF_LF,
  deuxTravees,
  EIrect,
  etatPlan,
  flambement,
  flecheFormulaire,
  flexionComposee,
  flexionDeviee,
  hookeGeneralisee,
  ligneElastique,
  pressionSemelle,
  type Liaisons,
} from '@/lib/calc/rdm2';
import { grandeur, nombre } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;
const champsSection = [champ('E', 'module d’Young', 'E', 'MPa', 5000, 210000, 500, 0), champ('b', 'largeur', 'b', 'cm', 5, 100, 0.5, 1), champ('h', 'hauteur', 'h', 'cm', 5, 100, 0.5, 1)] as const;

// ---------- L2.5.1 : ligne élastique ----------
type ResLigne = ReturnType<typeof ligneElastique> & { d: DonneesPoutreIso; EI: number; L: number };
const ligneDef: DefinitionCalcul<ResLigne> = {
  champs: [champ('L', 'portée', 'L', 'm', 1, 12, 0.5, 1), champ('q', 'charge répartie', 'q', 'kN/m', 0, 50, 0.5, 1), champ('P', 'force ponctuelle', 'P', 'kN', 0, 100, 1, 0), champ('a', 'position de P', 'a', 'm', 0, 12, 0.1, 1), ...champsSection],
  defaut: { L: 4, q: 2, P: 0, a: 2, E: 11000, b: 7.5, h: 22.5 },
  calculer: (e) => {
    const L = num(e, 'L');
    const d: DonneesPoutreIso = { L, xA: 0, xB: L, charges: [{ type: 'repartie', nom: 'q', q1: num(e, 'q'), q2: num(e, 'q'), a: 0, b: L }, { type: 'ponctuelle', nom: 'P', F: num(e, 'P'), a: Math.min(num(e, 'a'), L) }] };
    const EI = EIrect(num(e, 'E'), num(e, 'b'), num(e, 'h'));
    return { ...ligneElastique(d, EI, 600), d, EI, L };
  },
  valeurs: { f: (r) => grandeur(r.f * 1000, 2, 'mm'), xf: (r) => grandeur(r.xf, 2, 'm'), rot: (r) => `${nombre(r.rotA * 1000, 2)} mrad`, rapport: (r) => `L/${nombre(r.L / r.f, 0)}` },
  lignes: {
    EI: (r) => (
      <>
        EI = E b h³/12 = <strong>{nombre(r.EI, 1)} kN·m²</strong>
      </>
    ),
    integration: () => (
      <>
        EI y″ = −M(x) ; on intègre deux fois, puis on impose y(0) = y(L) = 0 pour fixer les deux constantes
      </>
    ),
    fleche: (r) => (
      <>
        flèche maximale <strong>{n2(r.f * 1000)} mm</strong> en x = {n2(r.xf)} m, soit L/{nombre(r.L / r.f, 0)} ; rotation sur appui {nombre(r.rotA * 1000, 2)} mrad
      </>
    ),
  },
  schema: ({ r }) => <LigneElastique d={r.d} EI={r.EI} />,
};

// ---------- L2.5.2 : superposition ----------
type ResSup = { L: number; q: number; P: number; EI: number; fq: number; fP: number };
const supDef: DefinitionCalcul<ResSup> = {
  champs: [champ('L', 'portée', 'L', 'm', 1, 12, 0.5, 1), champ('q', 'charge répartie', 'q', 'kN/m', 0, 50, 0.5, 1), champ('P', 'force au milieu', 'P', 'kN', 0, 100, 1, 0), champ('EI', 'rigidité', 'EI', 'kN·m²', 100, 100000, 100, 0)],
  defaut: { L: 6, q: 10, P: 20, EI: 20000 },
  calculer: (e) => {
    const d = { L: num(e, 'L'), q: num(e, 'q'), P: num(e, 'P'), EI: num(e, 'EI') };
    return { ...d, fq: flecheFormulaire('uniforme', d.q, d.L, d.EI), fP: flecheFormulaire('centree', d.P, d.L, d.EI) };
  },
  valeurs: { f: (r) => grandeur((r.fq + r.fP) * 1000, 2, 'mm') },
  lignes: {
    q: (r) => (
      <>
        charge répartie : 5 q L⁴/(384 EI) = 5 × {n1(r.q)} × {n1(r.L)}⁴ / (384 × {nombre(r.EI, 0)}) = {n2(r.fq * 1000)} mm
      </>
    ),
    P: (r) => (
      <>
        force centrée : P L³/(48 EI) = {n1(r.P)} × {n1(r.L)}³ / (48 × {nombre(r.EI, 0)}) = {n2(r.fP * 1000)} mm
      </>
    ),
    total: (r) => (
      <>
        les deux maximums sont au milieu : f = {n2(r.fq * 1000)} + {n2(r.fP * 1000)} = <strong>{n2((r.fq + r.fP) * 1000)} mm</strong>
      </>
    ),
  },
  schema: ({ r }) => <Superposition f1={r.fq} f2={r.fP} t1="charge q" t2="force P" />,
};

// ---------- L2.5.3 : Castigliano ----------
type ResCast = ReturnType<typeof castiglianoConsole> & { P: number; L: number; EI: number };
const castDef: DefinitionCalcul<ResCast> = {
  champs: [champ('P', 'force en bout', 'P', 'kN', 0.5, 100, 0.5, 1), champ('L', 'longueur', 'L', 'm', 0.5, 6, 0.1, 1), champ('EI', 'rigidité', 'EI', 'kN·m²', 100, 50000, 100, 0)],
  defaut: { P: 10, L: 2, EI: 5000 },
  calculer: (e) => {
    const d = { P: num(e, 'P'), L: num(e, 'L'), EI: num(e, 'EI') };
    return { ...castiglianoConsole(d.P, d.L, d.EI), ...d };
  },
  valeurs: { U: (r) => grandeur(r.U * 1000, 1, 'J'), delta: (r) => grandeur(r.delta * 1000, 2, 'mm') },
  lignes: {
    M: (r) => (
      <>
        M(x) = −P x (x depuis le bout) ; M² = P² x²
      </>
    ),
    U: (r) => (
      <>
        U = ∫₀ᴸ P² x²/(2 EI) dx = P² L³/(6 EI) = {n1(r.P)}² × {n1(r.L)}³ / (6 × {nombre(r.EI, 0)}) = <strong>{nombre(r.U * 1000, 1)} J</strong>
      </>
    ),
    delta: (r) => (
      <>
        Castigliano : δ = ∂U/∂P = P L³/(3 EI) = <strong>{n2(r.delta * 1000)} mm</strong> (dérivée numérique : {n2(r.deltaNum * 1000)} mm)
      </>
    ),
  },
  schema: ({ r }) => <EnergieConsole P={r.P} L={r.L} U={r.U} />,
};

// ---------- L2.5.4 : flexion composée ----------
type ResComp = ReturnType<typeof flexionComposee> & { N: number; M: number; b: number; h: number };
const compDef: DefinitionCalcul<ResComp> = {
  champs: [champ('N', 'effort normal de compression', 'N', 'kN', 0, 3000, 10, 0), champ('M', 'moment', 'M', 'kN·m', 0, 500, 1, 0), champ('b', 'largeur', 'b', 'cm', 10, 100, 1, 0), champ('h', 'hauteur', 'h', 'cm', 10, 100, 1, 0)],
  defaut: { N: 500, M: 20, b: 30, h: 30 },
  calculer: (e) => {
    const d = { N: num(e, 'N'), M: num(e, 'M'), b: num(e, 'b'), h: num(e, 'h') };
    return { ...flexionComposee(d), ...d };
  },
  valeurs: { s1: (r) => grandeur(r.s1, 2, 'MPa'), s2: (r) => grandeur(r.s2, 2, 'MPa'), e: (r) => grandeur(r.e, 2, 'cm') },
  lignes: {
    N: (r) => (
      <>
        σ<sub>N</sub> = −N/A = −{nombre(r.N * 1000, 0)} / {nombre(r.A, 0)} = {n2(r.sN)} MPa
      </>
    ),
    M: (r) => (
      <>
        σ<sub>M</sub> = ± M/W = ± {nombre(r.M * 1e6, 0)} / {nombre(r.W, 0)} = ± {n2(r.sM)} MPa
      </>
    ),
    somme: (r) => (
      <>
        σ = {n2(r.sN)} ∓ {n2(r.sM)} : <strong>{n2(r.s1)}</strong> et <strong>{n2(r.s2)} MPa</strong> ; e = M/N = {n2(r.e)} cm {r.dansNoyau ? '≤' : '>'} h/6 = {n2(r.noyau)} cm : {r.dansNoyau ? 'section entièrement comprimée' : 'une partie de la section est tendue'}
      </>
    ),
  },
  schema: ({ r }) => <DiagrammeComposee N={r.N} M={r.M} b={r.b} h={r.h} />,
};

type ResSem = ReturnType<typeof pressionSemelle> & { N: number; M: number; B: number; L: number };
const semDef: DefinitionCalcul<ResSem> = {
  champs: [champ('N', 'effort vertical', 'N', 'kN', 10, 3000, 10, 0), champ('M', 'moment', 'M', 'kN·m', 0, 1000, 5, 0), champ('B', 'largeur dans le plan du moment', 'B', 'm', 0.5, 5, 0.1, 1), champ('L', 'longueur', 'L', 'm', 0.5, 5, 0.1, 1)],
  defaut: { N: 600, M: 60, B: 2, L: 2 },
  calculer: (e) => {
    const d = { N: num(e, 'N'), M: num(e, 'M'), B: num(e, 'B'), L: num(e, 'L') };
    return { ...pressionSemelle(d.N, d.M, d.B, d.L), ...d };
  },
  valeurs: { qmax: (r) => grandeur(r.qmax, 1, 'kPa'), qmin: (r) => grandeur(r.qmin, 1, 'kPa') },
  lignes: {
    e: (r) => (
      <>
        e = M/N = {nombre(r.M, 0)}/{nombre(r.N, 0)} = {n3(r.e)} m ; tiers central B/6 = {n3(r.B / 6)} m
      </>
    ),
    q: (r) =>
      r.decollement ? (
        <>
          e &gt; B/6 : diagramme triangulaire sur 3 (B/2 − e) = {n2(r.largeurComprimee)} m ; q<sub>max</sub> = 2N/(3 (B/2 − e) L) = <strong>{n1(r.qmax)} kPa</strong>
        </>
      ) : (
        <>
          q = N/(B L) (1 ± 6e/B) = {n1(r.N / (r.B * r.L))} × (1 ± {n3((6 * r.e) / r.B)}) : <strong>{n1(r.qmax)}</strong> et <strong>{n1(r.qmin)} kPa</strong>
        </>
      ),
  },
  schema: ({ r }) => <SemellePression N={r.N} M={r.M} B={r.B} L={r.L} />,
  alerte: (r) => (r.decollement ? 'Résultante hors du tiers central : la semelle se soulève d’un côté. Agrandir B ou réduire le moment.' : undefined),
};

// ---------- L2.5.5 : flexion déviée ----------
type ResDev = ReturnType<typeof flexionDeviee> & { My: number; Mz: number; b: number; h: number; N: number };
const devDef: DefinitionCalcul<ResDev> = {
  champs: [champ('My', 'moment autour de l’axe fort', <>M<sub>y</sub></>, 'kN·m', 0, 200, 0.5, 1), champ('Mz', 'moment autour de l’axe faible', <>M<sub>z</sub></>, 'kN·m', 0, 200, 0.5, 1), champ('N', 'compression', 'N', 'kN', 0, 2000, 10, 0), champ('b', 'largeur', 'b', 'cm', 5, 100, 1, 0), champ('h', 'hauteur', 'h', 'cm', 5, 100, 1, 0)],
  defaut: { My: 10, Mz: 5, N: 0, b: 20, h: 40 },
  calculer: (e) => {
    const d = { My: num(e, 'My'), Mz: num(e, 'Mz'), N: num(e, 'N'), b: num(e, 'b'), h: num(e, 'h') };
    return { ...flexionDeviee(d.My, d.Mz, d.b, d.h, d.N), ...d };
  },
  valeurs: { max: (r) => grandeur(r.max, 2, 'MPa'), min: (r) => grandeur(r.min, 2, 'MPa') },
  lignes: {
    W: (r) => (
      <>
        W<sub>y</sub> = b h²/6 = {nombre(r.Wy / 1000, 0)} cm³ ; W<sub>z</sub> = h b²/6 = {nombre(r.Wz / 1000, 0)} cm³
      </>
    ),
    termes: (r) => (
      <>
        σ<sub>N</sub> = {n2(r.s0)} ; M<sub>y</sub>/W<sub>y</sub> = {n2(r.sy)} ; M<sub>z</sub>/W<sub>z</sub> = {n2(r.sz)} MPa
      </>
    ),
    coins: (r) => (
      <>
        coins : {r.coins.map((c) => `${c.nom} ${n2(c.s)}`).join(' ; ')} MPa → maximum <strong>{n2(r.max)}</strong>, minimum <strong>{n2(r.min)} MPa</strong>
      </>
    ),
  },
  schema: ({ r }) => <FlexionDevieeSection My={r.My} Mz={r.Mz} b={r.b} h={r.h} N={r.N} />,
};

// ---------- L2.5.6 : contraintes principales ----------
type ResMohr = ReturnType<typeof etatPlan> & { sx: number; sy: number; txy: number };
const mohrDef: DefinitionCalcul<ResMohr> = {
  champs: [champ('sx', 'contrainte σx', <>σ<sub>x</sub></>, 'MPa', -200, 200, 1, 0), champ('sy', 'contrainte σy', <>σ<sub>y</sub></>, 'MPa', -200, 200, 1, 0), champ('txy', 'cisaillement τxy', <>τ<sub>xy</sub></>, 'MPa', -200, 200, 1, 0)],
  defaut: { sx: 80, sy: 20, txy: 40 },
  calculer: (e) => {
    const d = { sx: num(e, 'sx'), sy: num(e, 'sy'), txy: num(e, 'txy') };
    return { ...etatPlan(d.sx, d.sy, d.txy), ...d };
  },
  valeurs: { s1: (r) => grandeur(r.s1, 1, 'MPa'), s2: (r) => grandeur(r.s2, 1, 'MPa'), tau: (r) => grandeur(r.tauMax, 1, 'MPa'), theta: (r) => `${n1(r.theta)}°` },
  lignes: {
    cercle: (r) => (
      <>
        centre c = (σx + σy)/2 = {n1(r.c)} MPa ; rayon R = √(((σx − σy)/2)² + τ²) = <strong>{n1(r.R)} MPa</strong>
      </>
    ),
    principales: (r) => (
      <>
        σ1 = c + R = <strong>{n1(r.s1)}</strong> ; σ2 = c − R = <strong>{n1(r.s2)} MPa</strong> ; τmax = R = {n1(r.tauMax)} MPa
      </>
    ),
    angle: (r) => (
      <>
        direction principale : tan 2θ = 2τ/(σx − σy) → θ = <strong>{n1(r.theta)}°</strong>
      </>
    ),
  },
  schema: ({ r }) => <ElementContraintes sx={r.sx} sy={r.sy} txy={r.txy} />,
};

// ---------- L2.5.7 : Hooke généralisée ----------
type ResHooke = ReturnType<typeof hookeGeneralisee> & { sx: number; sy: number; sz: number; E: number; nu: number };
const hookeDef: DefinitionCalcul<ResHooke> = {
  champs: [champ('sx', 'σx', <>σ<sub>x</sub></>, 'MPa', -300, 300, 1, 0), champ('sy', 'σy', <>σ<sub>y</sub></>, 'MPa', -300, 300, 1, 0), champ('sz', 'σz', <>σ<sub>z</sub></>, 'MPa', -300, 300, 1, 0), champ('E', 'module d’Young', 'E', 'MPa', 5000, 210000, 1000, 0), champ('nu', 'coefficient de Poisson', 'ν', '', 0, 0.5, 0.01, 2)],
  defaut: { sx: 100, sy: 0, sz: 0, E: 210000, nu: 0.3 },
  calculer: (e) => {
    const d = { sx: num(e, 'sx'), sy: num(e, 'sy'), sz: num(e, 'sz'), E: num(e, 'E'), nu: num(e, 'nu') };
    return { ...hookeGeneralisee(d.sx, d.sy, d.sz, d.E, d.nu), ...d };
  },
  valeurs: { ex: (r) => `${nombre(r.ex * 1000, 4)} ‰`, ev: (r) => `${nombre(r.ev * 1000, 4)} ‰` },
  lignes: {
    ex: (r) => (
      <>
        ε<sub>x</sub> = (σx − ν(σy + σz))/E = ({n1(r.sx)} − {n2(r.nu)} × {n1(r.sy + r.sz)})/{nombre(r.E, 0)} = <strong>{nombre(r.ex * 1000, 4)} ‰</strong>
      </>
    ),
    eyez: (r) => (
      <>
        ε<sub>y</sub> = {nombre(r.ey * 1000, 4)} ‰ ; ε<sub>z</sub> = {nombre(r.ez * 1000, 4)} ‰ ; volume : ε<sub>v</sub> = <strong>{nombre(r.ev * 1000, 4)} ‰</strong>
      </>
    ),
    G: (r) => (
      <>
        G = E/(2(1 + ν)) = {nombre(r.G, 0)} MPa ; K = E/(3(1 − 2ν)) = {nombre(r.K, 0)} MPa
      </>
    ),
  },
  schema: ({ r }) => <ElementContraintes sx={r.sx} sy={r.sy} txy={0} />,
};

// ---------- L2.5.8 : flambement ----------
type ResFlamb = ReturnType<typeof flambement> & { liaisons: Liaisons; L: number };
const LIAISONS = Object.keys(COEFF_LF) as Liaisons[];
const flambDef: DefinitionCalcul<ResFlamb> = {
  champs: [champ('L', 'longueur', 'L', 'm', 0.5, 12, 0.1, 1), { type: 'choix', cle: 'liaisons', libelle: 'liaisons aux extrémités', symbole: 'Lf', options: LIAISONS.map((l, i) => ({ valeur: i, libelle: l })) }, ...champsSection],
  defaut: { L: 3, liaisons: 0, E: 11000, b: 10, h: 10 },
  calculer: (e) => {
    const liaisons = LIAISONS[Math.round(num(e, 'liaisons'))] ?? 'articulé-articulé';
    const d = { L: num(e, 'L'), liaisons, E: num(e, 'E'), b: num(e, 'b'), h: num(e, 'h') };
    return { ...flambement(d), liaisons, L: d.L };
  },
  valeurs: { Ncr: (r) => grandeur(r.Ncr, 1, 'kN'), lambda: (r) => nombre(r.lambda, 0), Lf: (r) => grandeur(r.Lf, 2, 'm') },
  lignes: {
    Lf: (r) => (
      <>
        {r.liaisons} : L<sub>f</sub> = {nombre(COEFF_LF[r.liaisons], 1)} × {n1(r.L)} = <strong>{n2(r.Lf)} m</strong>
      </>
    ),
    I: (r) => (
      <>
        axe faible : I = {nombre(r.I, 1)} cm⁴ ; A = {nombre(r.A, 0)} cm² ; i = √(I/A) = {n2(r.i)} cm ; λ = L<sub>f</sub>/i = <strong>{nombre(r.lambda, 0)}</strong>
      </>
    ),
    Ncr: (r) => (
      <>
        N<sub>cr</sub> = π² E I/L<sub>f</sub>² = <strong>{n1(r.Ncr)} kN</strong> ; σ<sub>cr</sub> = N<sub>cr</sub>/A = {n2(r.scr)} MPa
      </>
    ),
  },
  schema: ({ r }) => <CasEuler actif={r.liaisons} />,
};

// ---------- L2.5.9 : deux travées ----------
type ResTrav = ReturnType<typeof deuxTravees> & { L1: number; L2: number; q1: number; q2: number };
const travDef: DefinitionCalcul<ResTrav> = {
  champs: [champ('L1', 'travée 1', <>L<sub>1</sub></>, 'm', 1, 12, 0.5, 1), champ('L2', 'travée 2', <>L<sub>2</sub></>, 'm', 1, 12, 0.5, 1), champ('q1', 'charge travée 1', <>q<sub>1</sub></>, 'kN/m', 0, 80, 1, 0), champ('q2', 'charge travée 2', <>q<sub>2</sub></>, 'kN/m', 0, 80, 1, 0)],
  defaut: { L1: 5, L2: 5, q1: 10, q2: 10 },
  calculer: (e) => {
    const d = { L1: num(e, 'L1'), L2: num(e, 'L2'), q1: num(e, 'q1'), q2: num(e, 'q2') };
    return { ...deuxTravees(d.L1, d.L2, d.q1, d.q2), ...d };
  },
  valeurs: { MB: (r) => grandeur(r.MB, 2, 'kN·m'), RB: (r) => grandeur(r.RB, 2, 'kN'), M1: (r) => grandeur(r.Mtravee1, 2, 'kN·m') },
  lignes: {
    MB: (r) => (
      <>
        trois moments (M<sub>A</sub> = M<sub>C</sub> = 0) : 2 M<sub>B</sub> (L1 + L2) = −(q1 L1³ + q2 L2³)/4 → M<sub>B</sub> = <strong>{n2(r.MB)} kN·m</strong>
      </>
    ),
    R: (r) => (
      <>
        R<sub>A</sub> = q1 L1/2 + M<sub>B</sub>/L1 = {n2(r.RA)} kN ; R<sub>C</sub> = {n2(r.RC)} kN ; R<sub>B</sub> = <strong>{n2(r.RB)} kN</strong>
      </>
    ),
    travee: (r) => (
      <>
        travée 1 : V = 0 en x = R<sub>A</sub>/q1 = {n2(r.x1)} m ; M = <strong>{n2(r.Mtravee1)} kN·m</strong>
      </>
    ),
  },
  schema: ({ r }) => <PoutreContinue L1={r.L1} L2={r.L2} q1={r.q1} q2={r.q2} />,
};

// ---------- L2.5.P : balcon ----------
type ResBal = ReturnType<typeof balcon> & { L: number; P: number; h: number; sigmaLim: number; g: number; q: number };
const balDef: DefinitionCalcul<ResBal> = {
  champs: [
    champ('L', 'porte-à-faux', 'L', 'm', 0.5, 3, 0.05, 2),
    champ('g', 'revêtement (par m de largeur)', 'g', 'kN/m', 0, 5, 0.1, 1),
    champ('q', 'exploitation (par m de largeur)', 'q', 'kN/m', 0, 10, 0.1, 1),
    champ('P', 'garde-corps en bout', 'P', 'kN/m', 0, 5, 0.1, 1),
    champ('h', 'épaisseur de la dalle', 'h', 'cm', 10, 30, 1, 0),
    champ('E', 'module retenu', 'E', 'MPa', 5000, 35000, 500, 0),
    champ('sigmaLim', 'contrainte limite retenue', <>σ<sub>lim</sub></>, 'MPa', 5, 30, 0.5, 1),
  ],
  defaut: { L: 1.5, g: 1.5, q: 3.5, P: 1, h: 15, E: 11000, sigmaLim: 12 },
  calculer: (e) => {
    const d = { L: num(e, 'L'), g: num(e, 'g'), q: num(e, 'q'), P: num(e, 'P'), b: 100, h: num(e, 'h'), E: num(e, 'E'), sigmaLim: num(e, 'sigmaLim') };
    return { ...balcon(d), ...d };
  },
  valeurs: { M: (r) => grandeur(r.M, 2, 'kN·m'), sigma: (r) => grandeur(r.sigma, 2, 'MPa'), f: (r) => grandeur(r.fmm, 1, 'mm'), rapport: (r) => `L/${nombre(r.rapport, 0)}` },
  lignes: {
    p: (r) => (
      <>
        poids propre 25 × 1 × {n2(r.h / 100)} = {n2(r.pp)} kN/m ; p = g + q + pp = <strong>{n2(r.p)} kN/m</strong>
      </>
    ),
    M: (r) => (
      <>
        encastrement : M = p L²/2 + P L = {n2(r.p)} × {n2(r.L)}²/2 + {n1(r.P)} × {n2(r.L)} = <strong>{n2(r.M)} kN·m</strong> ; V = {n2(r.V)} kN
      </>
    ),
    sigma: (r) => (
      <>
        W = 100 × {nombre(r.h, 0)}²/6 = {nombre(r.W, 0)} cm³ ; σ = M/W = <strong>{n2(r.sigma)} MPa</strong> ({nombre(r.taux * 100, 0)} % de la limite)
      </>
    ),
    f: (r) => (
      <>
        superposition : f = p L⁴/(8EI) + P L³/(3EI) = <strong>{n1(r.fmm)} mm</strong>, soit L/{nombre(r.rapport, 0)}
      </>
    ),
  },
  schema: ({ r }) => <BalconConsole L={r.L} h={r.h} P={r.P} />,
};

export const CALCULS_RDM2 = {
  ligneElastique: ligneDef,
  superpositionFleches: supDef,
  castiglianoConsole: castDef,
  flexionComposee: compDef,
  semelleExcentree: semDef,
  flexionDeviee: devDef,
  etatPlanMohr: mohrDef,
  hookeGeneralisee: hookeDef,
  flambementEuler: flambDef,
  deuxTravees: travDef,
  balconConsole: balDef,
} as const;
