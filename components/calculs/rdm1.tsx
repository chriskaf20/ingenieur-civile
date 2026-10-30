// Fiches de calcul du module L2.4 (résistance des matériaux I). Les valeurs viennent de lib/calc/rdm1.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { ArbreTorsion, BarreTraction, BoulonCisaillement, CisaillementRect, ContraintesFlexion, Coupure, DiagrammesVM, PlancherSolives, SectionComposee } from '@/components/schemas/Rdm1';
import { barre, boulons, cisaillementRect, diagrammes, dimensionnerRect, effortsSection, flexionSection, sectionComposee, solive, torsion, type DonneesPoutreIso, type Rectangle } from '@/lib/calc/rdm1';
import { grandeur, nombre } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

const poutre = (L: number, q: number, P: number, a: number): DonneesPoutreIso => ({
  L,
  xA: 0,
  xB: L,
  charges: [
    { type: 'repartie', nom: 'q', q1: q, q2: q, a: 0, b: L },
    { type: 'ponctuelle', nom: 'P', F: P, a: Math.min(a, L) },
  ],
});
const champsPoutre = [
  champ('L', 'portée', 'L', 'm', 1, 15, 0.5, 1),
  champ('q', 'charge répartie', 'q', 'kN/m', 0, 50, 1, 0),
  champ('P', 'force ponctuelle', 'P', 'kN', 0, 200, 1, 0),
  champ('a', 'position de la force', 'a', 'm', 0, 15, 0.1, 1),
] as const;

// ---------- L2.4.2 : coupure ----------
type ResCoup = ReturnType<typeof effortsSection> & { L: number; q: number; P: number; a: number; x: number };
const coupDef: DefinitionCalcul<ResCoup> = {
  champs: [...champsPoutre, champ('x', 'abscisse de la coupure', 'x', 'm', 0.1, 15, 0.1, 1)],
  defaut: { L: 6, q: 10, P: 20, a: 2, x: 3 },
  calculer: (e) => {
    const d = { L: num(e, 'L'), q: num(e, 'q'), P: num(e, 'P'), a: num(e, 'a'), x: Math.min(num(e, 'x'), num(e, 'L') - 0.01) };
    return { ...effortsSection(poutre(d.L, d.q, d.P, d.a), d.x), ...d };
  },
  valeurs: { RA: (r) => grandeur(r.RA, 2, 'kN'), V: (r) => grandeur(r.V, 2, 'kN'), M: (r) => grandeur(r.M, 2, 'kN·m') },
  lignes: {
    RA: (r) => (
      <>
        ΣM/B = 0 : R<sub>A</sub> = (q L²/2 + P (L − a)) / L = ({n1(r.q)} × {n1(r.L)}²/2 + {n1(r.P)} × {n2(r.L - r.a)}) / {n1(r.L)} = <strong>{n2(r.RA)} kN</strong>
      </>
    ),
    V: (r) => (
      <>
        V = R<sub>A</sub> − q x{r.a < r.x ? ' − P' : ''} = {n2(r.RA)} − {n1(r.q)} × {n2(r.x)}{r.a < r.x ? ` − ${n1(r.P)}` : ''} = <strong>{n2(r.V)} kN</strong>
      </>
    ),
    M: (r) => (
      <>
        M = R<sub>A</sub> x − q x²/2{r.a < r.x ? ' − P (x − a)' : ''} = {n2(r.RA)} × {n2(r.x)} − {n1(r.q)} × {n2(r.x)}²/2{r.a < r.x ? ` − ${n1(r.P)} × ${n2(r.x - r.a)}` : ''} = <strong>{n2(r.M)} kN·m</strong>
      </>
    ),
  },
  schema: ({ r }) => <Coupure x={r.x} V={r.V} M={r.M} RA={r.RA} q={r.q} P={r.P} aP={r.a} />,
};

// ---------- L2.4.3 / L2.4.4 : diagrammes ----------
type ResDiag = ReturnType<typeof diagrammes> & { d: DonneesPoutreIso; q: number; P: number; a: number; L: number };
const diagDef: DefinitionCalcul<ResDiag> = {
  champs: [...champsPoutre],
  defaut: { L: 6, q: 10, P: 20, a: 2 },
  calculer: (e) => {
    const L = num(e, 'L');
    const q = num(e, 'q');
    const P = num(e, 'P');
    const a = num(e, 'a');
    const d = poutre(L, q, P, a);
    return { ...diagrammes(d, 600), d, q, P, a, L };
  },
  valeurs: { RA: (r) => grandeur(r.RA, 2, 'kN'), RB: (r) => grandeur(r.RB, 2, 'kN'), Mmax: (r) => grandeur(r.Mmax, 2, 'kN·m'), xM: (r) => grandeur(r.xMmax, 2, 'm') },
  lignes: {
    reactions: (r) => (
      <>
        R<sub>A</sub> = {n2(r.RA)} kN ; R<sub>B</sub> = {n2(r.RB)} kN ; contrôle R<sub>A</sub> + R<sub>B</sub> = {n2(r.RA + r.RB)} = q L + P = {n2(r.q * r.L + r.P)} kN
      </>
    ),
    saut: (r) => (
      <>
        V décroît de q = {n1(r.q)} kN par mètre et saute de −P = −{n1(r.P)} kN en x = {n2(r.a)} m
      </>
    ),
    Mmax: (r) => (
      <>
        M est maximal là où V change de signe : x = {n2(r.xMmax)} m, M<sub>max</sub> = <strong>{n2(r.Mmax)} kN·m</strong>
      </>
    ),
  },
  schema: ({ r }) => <DiagrammesVM d={r.d} />,
};

// ---------- L2.4.5 : traction ----------
type ResBarre = ReturnType<typeof barre> & { N: number; L: number; d: number; E: number };
const barreDef: DefinitionCalcul<ResBarre> = {
  champs: [
    champ('N', 'effort de traction', 'N', 'kN', 1, 500, 1, 0),
    champ('L', 'longueur', 'L', 'm', 0.5, 20, 0.1, 1),
    champ('d', 'diamètre', 'Ø', 'mm', 6, 50, 1, 0),
    champ('E', 'module d’Young', 'E', 'MPa', 5000, 210000, 1000, 0),
  ],
  defaut: { N: 120, L: 4, d: 20, E: 210000 },
  calculer: (e) => {
    const d = { N: num(e, 'N'), L: num(e, 'L'), d: num(e, 'd'), E: num(e, 'E') };
    return { ...barre(d), ...d };
  },
  valeurs: { sigma: (r) => grandeur(r.sigma, 1, 'MPa'), dL: (r) => grandeur(r.dL, 2, 'mm') },
  lignes: {
    A: (r) => (
      <>
        A = π Ø²/4 = π × {nombre(r.d, 0)}²/4 = <strong>{n1(r.A)} mm²</strong>
      </>
    ),
    sigma: (r) => (
      <>
        σ = N/A = {nombre(r.N * 1000, 0)} N / {n1(r.A)} mm² = <strong>{n1(r.sigma)} MPa</strong>
      </>
    ),
    dL: (r) => (
      <>
        ε = σ/E = {n1(r.sigma)}/{nombre(r.E, 0)} = {nombre(r.eps * 1000, 3)} ‰ ; ΔL = ε L = {nombre(r.eps, 6)} × {nombre(r.L * 1000, 0)} mm = <strong>{n2(r.dL)} mm</strong>
      </>
    ),
  },
  schema: ({ r }) => <BarreTraction N={r.N} L={r.L} dL={r.dL} d={r.d} sigma={r.sigma} />,
};

// ---------- L2.4.6 / L2.4.7 : section en T ----------
const champsT = [
  champ('bt', 'largeur de la table', <>b<sub>t</sub></>, 'cm', 10, 200, 1, 0),
  champ('ht', 'épaisseur de la table', <>h<sub>t</sub></>, 'cm', 4, 40, 1, 0),
  champ('bn', 'largeur de la nervure', <>b<sub>n</sub></>, 'cm', 10, 60, 1, 0),
  champ('hn', 'hauteur de la nervure', <>h<sub>n</sub></>, 'cm', 10, 120, 1, 0),
] as const;
const rectsT = (e: Record<string, number | string>): Rectangle[] => {
  const bt = num(e, 'bt');
  const bn = num(e, 'bn');
  const hn = num(e, 'hn');
  return [
    { b: bn, h: hn, y: 0, x: (Math.max(bt, bn) - bn) / 2 },
    { b: bt, h: num(e, 'ht'), y: hn, x: (Math.max(bt, bn) - bt) / 2 },
  ];
};
type ResT = ReturnType<typeof sectionComposee> & { rects: Rectangle[] };
const inertieDef: DefinitionCalcul<ResT> = {
  champs: [...champsT],
  defaut: { bt: 60, ht: 12, bn: 20, hn: 38 },
  calculer: (e) => {
    const rects = rectsT(e);
    return { ...sectionComposee(rects), rects };
  },
  valeurs: { A: (r) => grandeur(r.A, 0, 'cm²'), yG: (r) => grandeur(r.yG, 2, 'cm'), I: (r) => grandeur(r.I, 0, 'cm⁴') },
  lignes: {
    yG: (r) => (
      <>
        y<sub>G</sub> = Σ A<sub>i</sub> y<sub>i</sub> / Σ A<sub>i</sub> = ({nombre(r.parts[0]!.A, 0)} × {n1(r.rects[0]!.h / 2)} + {nombre(r.parts[1]!.A, 0)} × {n1(r.rects[1]!.y + r.rects[1]!.h / 2)}) / {nombre(r.A, 0)} = <strong>{n2(r.yG)} cm</strong>
      </>
    ),
    huygens: (r) => (
      <>
        {r.parts.map((p, i) => (
          <span key={i}>
            {i ? ' ; ' : ''}
            {i ? 'table' : 'nervure'} : {nombre(p.Ipropre, 0)} + {nombre(p.A, 0)} × {n2(p.d)}² = {nombre(p.Ipropre + p.Ad2, 0)} cm⁴
          </span>
        ))}
      </>
    ),
    I: (r) => (
      <>
        I = Σ (I<sub>propre</sub> + A d²) = <strong>{nombre(r.I, 0)} cm⁴</strong>
      </>
    ),
  },
  schema: ({ r }) => <SectionComposee rects={r.rects} titre="Section en T" />,
};

type ResFlex = ReturnType<typeof flexionSection> & { rects: Rectangle[] };
const flexDef: DefinitionCalcul<ResFlex> = {
  champs: [...champsT, champ('M', 'moment fléchissant', 'M', 'kN·m', 1, 1000, 1, 0)],
  defaut: { bt: 60, ht: 12, bn: 20, hn: 38, M: 120 },
  calculer: (e) => {
    const rects = rectsT(e);
    return { ...flexionSection(num(e, 'M'), rects), rects };
  },
  valeurs: { sup: (r) => grandeur(r.sigmaSup, 2, 'MPa'), inf: (r) => grandeur(r.sigmaInf, 2, 'MPa') },
  lignes: {
    section: (r) => (
      <>
        I = {nombre(r.I, 0)} cm⁴ ; v = {n2(r.v)} cm ; v′ = {n2(r.vp)} cm
      </>
    ),
    sup: (r) => (
      <>
        fibre supérieure : σ = −M v / I = −{nombre(r.M, 0)}·10⁶ × {n1(r.v * 10)} / {nombre(r.I * 1e4, 0)} = <strong>{n2(r.sigmaSup)} MPa</strong>
      </>
    ),
    inf: (r) => (
      <>
        fibre inférieure : σ = M v′ / I = <strong>+{n2(r.sigmaInf)} MPa</strong> (traction) ; la plus sollicitée est la plus éloignée de G
      </>
    ),
  },
  schema: ({ r }) => <ContraintesFlexion rects={r.rects} M={r.M} />,
};

// ---------- L2.4.8 : cisaillement ----------
type ResCis = ReturnType<typeof cisaillementRect> & { V: number; b: number; h: number };
const cisDef: DefinitionCalcul<ResCis> = {
  champs: [champ('V', 'effort tranchant', 'V', 'kN', 1, 500, 1, 0), champ('b', 'largeur', 'b', 'cm', 5, 100, 1, 0), champ('h', 'hauteur', 'h', 'cm', 10, 150, 1, 0)],
  defaut: { V: 30, b: 20, h: 50 },
  calculer: (e) => {
    const d = { V: num(e, 'V'), b: num(e, 'b'), h: num(e, 'h') };
    return { ...cisaillementRect(d.V, d.b, d.h), ...d };
  },
  valeurs: { tauMax: (r) => grandeur(r.tauMax, 2, 'MPa'), tauMoy: (r) => grandeur(r.tauMoyen, 2, 'MPa') },
  lignes: {
    moyen: (r) => (
      <>
        τ<sub>moy</sub> = V/A = {nombre(r.V * 1000, 0)} N / {nombre(r.A * 100, 0)} mm² = {n2(r.tauMoyen)} MPa
      </>
    ),
    max: (r) => (
      <>
        au centre : S = b h²/8 = {nombre((r.b * r.h * r.h) / 8, 0)} cm³ ; τ = V S/(I b) = 1,5 V/A = <strong>{n2(r.tauMax)} MPa</strong>
      </>
    ),
  },
  schema: ({ r }) => <CisaillementRect V={r.V} b={r.b} h={r.h} />,
};

// ---------- L2.4.9 : torsion ----------
type ResTors = ReturnType<typeof torsion> & { T: number; D: number; d: number; L: number; G: number };
const torsDef: DefinitionCalcul<ResTors> = {
  champs: [
    champ('T', 'couple de torsion', 'T', 'kN·m', 0.1, 50, 0.1, 1),
    champ('D', 'diamètre extérieur', 'D', 'mm', 10, 300, 1, 0),
    champ('d', 'diamètre intérieur', 'd', 'mm', 0, 290, 1, 0),
    champ('L', 'longueur', 'L', 'm', 0.1, 10, 0.1, 1),
    champ('G', 'module de cisaillement', 'G', 'MPa', 1000, 90000, 1000, 0),
  ],
  defaut: { T: 2, D: 50, d: 0, L: 1.5, G: 81000 },
  calculer: (e) => {
    const t = { T: num(e, 'T'), D: num(e, 'D'), d: Math.min(num(e, 'd'), num(e, 'D') - 1), L: num(e, 'L'), G: num(e, 'G') };
    return { ...torsion(t), ...t };
  },
  valeurs: { tau: (r) => grandeur(r.tauMax, 1, 'MPa'), theta: (r) => `${n2(r.thetaDeg)}°` },
  lignes: {
    J: (r) => (
      <>
        J = π (D⁴ − d⁴)/32 = π ({nombre(r.D, 0)}⁴ − {nombre(r.d, 0)}⁴)/32 = <strong>{nombre(r.J, 0)} mm⁴</strong>
      </>
    ),
    tau: (r) => (
      <>
        τ<sub>max</sub> = T (D/2)/J = {nombre(r.T * 1e6, 0)} × {n1(r.D / 2)} / {nombre(r.J, 0)} = <strong>{n1(r.tauMax)} MPa</strong>
      </>
    ),
    theta: (r) => (
      <>
        θ = T L/(G J) = {nombre(r.theta, 4)} rad = <strong>{n2(r.thetaDeg)}°</strong>
      </>
    ),
  },
  schema: ({ r }) => <ArbreTorsion T={r.T} D={r.D} d={r.d} tau={r.tauMax} thetaDeg={r.thetaDeg} />,
};

// ---------- L2.4.10 : boulons ----------
type ResBoul = ReturnType<typeof boulons> & { F: number; n: number; d: number; plans: 1 | 2; t: number };
const boulDef: DefinitionCalcul<ResBoul> = {
  champs: [
    champ('F', 'effort transmis', 'F', 'kN', 1, 500, 1, 0),
    champ('n', 'nombre de boulons', 'n', '', 1, 12, 1, 0),
    champ('d', 'diamètre de la tige', 'Ø', 'mm', 8, 36, 1, 0),
    { type: 'choix', cle: 'plans', libelle: 'cisaillement', symbole: 'm', options: [{ valeur: 2, libelle: 'double (2 plans)' }, { valeur: 1, libelle: 'simple (1 plan)' }] },
    champ('t', 'épaisseur la plus mince', 't', 'mm', 3, 40, 1, 0),
  ],
  defaut: { F: 60, n: 2, d: 16, plans: 2, t: 8 },
  calculer: (e) => {
    const b = { F: num(e, 'F'), n: Math.round(num(e, 'n')), d: num(e, 'd'), plans: (num(e, 'plans') === 1 ? 1 : 2) as 1 | 2, t: num(e, 't') };
    return { ...boulons(b), ...b };
  },
  valeurs: { tau: (r) => grandeur(r.tau, 1, 'MPa'), pression: (r) => grandeur(r.pression, 1, 'MPa') },
  lignes: {
    A: (r) => (
      <>
        A = π Ø²/4 = {n1(r.A)} mm² ; effort par boulon {n1(r.parBoulon)} kN ; {r.plans} plan(s) de cisaillement
      </>
    ),
    tau: (r) => (
      <>
        τ = F / (n m A) = {nombre(r.F * 1000, 0)} / ({r.n} × {r.plans} × {n1(r.A)}) = <strong>{n1(r.tau)} MPa</strong>
      </>
    ),
    pression: (r) => (
      <>
        pression diamétrale σ = F / (n Ø t) = {nombre(r.F * 1000, 0)} / ({r.n} × {nombre(r.d, 0)} × {nombre(r.t, 0)}) = <strong>{n1(r.pression)} MPa</strong>
      </>
    ),
  },
  schema: ({ r }) => <BoulonCisaillement plans={r.plans} />,
};

// ---------- L2.4.11 : dimensionner ----------
type ResDim = ReturnType<typeof dimensionnerRect> & { M: number; s: number; b: number; hc: number; sigma: number };
const dimDef: DefinitionCalcul<ResDim> = {
  champs: [
    champ('M', 'moment maximal', 'M', 'kN·m', 1, 500, 1, 0),
    champ('s', 'contrainte limite retenue', <>σ<sub>lim</sub></>, 'MPa', 5, 300, 1, 0),
    champ('b', 'largeur imposée', 'b', 'cm', 5, 60, 0.5, 1),
  ],
  defaut: { M: 12, s: 10, b: 10 },
  calculer: (e) => {
    const M = num(e, 'M');
    const s = num(e, 's');
    const b = num(e, 'b');
    const r = dimensionnerRect(M, s, b);
    const hc = Math.ceil(r.h / 2) * 2;
    return { ...r, M, s, b, hc, sigma: (M * 1e6) / (((b * hc * hc) / 6) * 1000) };
  },
  valeurs: { W: (r) => grandeur(r.W, 0, 'cm³'), h: (r) => grandeur(r.h, 1, 'cm'), hc: (r) => grandeur(r.hc, 0, 'cm') },
  lignes: {
    W: (r) => (
      <>
        W ≥ M/σ<sub>lim</sub> = {nombre(r.M * 1e6, 0)} / {nombre(r.s, 0)} = <strong>{nombre(r.W, 0)} cm³</strong>
      </>
    ),
    h: (r) => (
      <>
        rectangle : W = b h²/6 → h ≥ √(6 W/b) = √(6 × {nombre(r.W, 0)}/{n1(r.b)}) = {n1(r.h)} cm ; on retient <strong>h = {nombre(r.hc, 0)} cm</strong>
      </>
    ),
    verif: (r) => (
      <>
        vérification : σ = M/W = {n2(r.sigma)} MPa ≤ {nombre(r.s, 0)} MPa
      </>
    ),
  },
  schema: ({ r }) => <ContraintesFlexion rects={[{ b: r.b, h: r.hc, y: 0 }]} M={r.M} />,
};

// ---------- L2.4.P : solive ----------
type ResSol = ReturnType<typeof solive> & { g: number; q: number; e: number; L: number; b: number; h: number; fm: number };
const solDef: DefinitionCalcul<ResSol> = {
  champs: [
    champ('g', 'charge permanente du plancher', 'g', 'kN/m²', 0.2, 5, 0.1, 1),
    champ('q', 'charge d’exploitation', 'q', 'kN/m²', 0.5, 5, 0.1, 1),
    champ('e', 'entraxe des solives', 'e', 'm', 0.3, 1, 0.05, 2),
    champ('L', 'portée', 'L', 'm', 2, 7, 0.1, 1),
    champ('b', 'largeur de la solive', 'b', 'cm', 5, 20, 0.5, 1),
    champ('h', 'hauteur de la solive', 'h', 'cm', 10, 35, 0.5, 1),
    champ('fm', 'contrainte limite retenue', <>σ<sub>lim</sub></>, 'MPa', 5, 20, 0.5, 1),
    champ('E', 'module du bois', 'E', 'MPa', 7000, 15000, 500, 0),
  ],
  defaut: { g: 0.6, q: 1.5, e: 0.5, L: 4, b: 7.5, h: 22.5, fm: 10, E: 11000 },
  calculer: (e) => {
    const d = { g: num(e, 'g'), q: num(e, 'q'), e: num(e, 'e'), L: num(e, 'L'), b: num(e, 'b'), h: num(e, 'h'), fm: num(e, 'fm'), E: num(e, 'E'), rho: 5 };
    return { ...solive(d), ...d };
  },
  valeurs: { sigma: (r) => grandeur(r.sigma, 2, 'MPa'), f: (r) => grandeur(r.fmm, 1, 'mm'), rapport: (r) => `L/${nombre(r.rapport, 0)}`, taux: (r) => `${nombre(r.taux * 100, 0)} %` },
  lignes: {
    p: (r) => (
      <>
        p = (g + q) e + poids propre = ({n1(r.g)} + {n1(r.q)}) × {n2(r.e)} + {n3(r.pp)} = <strong>{n3(r.p)} kN/m</strong>
      </>
    ),
    M: (r) => (
      <>
        M = p L²/8 = {n3(r.p)} × {n1(r.L)}²/8 = <strong>{n2(r.M)} kN·m</strong> ; V = p L/2 = {n2(r.V)} kN
      </>
    ),
    sigma: (r) => (
      <>
        W = b h²/6 = {n1(r.W)} cm³ ; σ = M/W = <strong>{n2(r.sigma)} MPa</strong>, soit {nombre(r.taux * 100, 0)} % de {n1(r.fm)} MPa ; τ = 1,5 V/A = {n2(r.tau)} MPa
      </>
    ),
    f: (r) => (
      <>
        I = {nombre(r.I, 0)} cm⁴ ; f = 5 p L⁴/(384 E I) = <strong>{n1(r.fmm)} mm</strong>, soit L/{nombre(r.rapport, 0)}
      </>
    ),
  },
  schema: ({ r }) => <PlancherSolives e={r.e} L={r.L} b={r.b} h={r.h} />,
  alerte: (r) => (r.taux > 1 ? 'Contrainte dépassée : augmenter la hauteur ou réduire l’entraxe.' : r.rapport < 300 ? 'Flèche supérieure à L/300 : la solive est trop souple (vibrations, fissures du revêtement).' : undefined),
};

export const CALCULS_RDM1 = {
  effortsCoupure: coupDef,
  diagrammesPoutre: diagDef,
  tirantTraction: barreDef,
  inertieSectionT: inertieDef,
  flexionSectionT: flexDef,
  cisaillementPoutre: cisDef,
  torsionArbre: torsDef,
  boulonsAssemblage: boulDef,
  dimensionnerSection: dimDef,
  soliveBois: solDef,
} as const;
