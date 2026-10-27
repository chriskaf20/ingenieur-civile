// Fiches de calcul du module L2.1 (équations différentielles). Les valeurs viennent de lib/calc/equadiff.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { CourbeConsolidation, CourbeRefroidissement, CourbeVidange, EulerExact, OscillationAmortie, PoutreDeformee, TroisRegimes } from '@/components/schemas/EquaDiff';
import {
  consolidation,
  decroissance,
  deformeePoutre,
  euler,
  EXEMPLE_CONSOLIDATION,
  EXEMPLE_DEFORMEE,
  EXEMPLE_REFROIDISSEMENT,
  EXEMPLE_VIDANGE,
  oscillateur,
  racinesCaracteristiques,
  refroidissement,
  vidange,
  type DonneesVidange,
} from '@/lib/calc/equadiff';
import { grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const n4 = (x: number) => nombre(x, 4);
const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

// ---------- L2.1.1 : Euler ----------
type ResEuler = { h: number; pts: [number, number][]; exact: number };
const eulerDef: DefinitionCalcul<ResEuler> = {
  champs: [champ('h', 'pas de calcul', 'h', '', 0.05, 1, 0.05, 2)],
  defaut: { h: 0.5 },
  calculer: (e) => {
    const h = num(e, 'h');
    return { h, pts: euler((_t, y) => -y, 0, 1, h, Math.round(1 / h)), exact: decroissance(1, 1, 1) };
  },
  valeurs: { y1: (r) => n4(r.pts[r.pts.length - 1]![1]), exact: (r) => n4(r.exact) },
  lignes: {
    pas: (r) => (
      <>
        y<sub>n+1</sub> = y<sub>n</sub> + h × (−y<sub>n</sub>) = (1 − {n2(r.h)}) y<sub>n</sub> : après {r.pts.length - 1} pas, y(1) ≈ <strong>{n4(r.pts[r.pts.length - 1]![1])}</strong>
      </>
    ),
    ecart: (r) => (
      <>
        exact : e<sup>−1</sup> = {n4(r.exact)} ; écart <strong>{nombre(Math.abs(r.pts[r.pts.length - 1]![1] - r.exact) * 100, 2)} %</strong> de la valeur initiale
      </>
    ),
  },
  schema: ({ r }) => <EulerExact h={r.h} />,
};

// ---------- L2.1.2 : refroidissement ----------
type ResRefr = ReturnType<typeof refroidissement> & typeof EXEMPLE_REFROIDISSEMENT;
const refrDef: DefinitionCalcul<ResRefr> = {
  champs: [
    champ('T0', 'température initiale du béton', <>T<sub>0</sub></>, '°C', 30, 80, 1, 0),
    champ('Ta', 'température de l’air', <>T<sub>a</sub></>, '°C', 15, 40, 1, 0),
    champ('k', 'constante de refroidissement', 'k', '1/h', 0.01, 0.3, 0.01, 2),
    champ('Tcible', 'température visée', <>T<sub>c</sub></>, '°C', 20, 70, 1, 0),
  ],
  defaut: { ...EXEMPLE_REFROIDISSEMENT },
  calculer: (e) => {
    const d = { T0: num(e, 'T0'), Ta: num(e, 'Ta'), k: num(e, 'k'), Tcible: num(e, 'Tcible') };
    return { ...refroidissement(d), ...d };
  },
  valeurs: { t: (r) => grandeur(r.tCible, 1, 'h'), tau: (r) => grandeur(r.tau, 1, 'h') },
  lignes: {
    solution: (r) => (
      <>
        T(t) = T<sub>a</sub> + (T<sub>0</sub> − T<sub>a</sub>) e<sup>−kt</sup> = {r.Ta} + {r.T0 - r.Ta} e<sup>−{n2(r.k)} t</sup>
      </>
    ),
    temps: (r) => (
      <>
        t = ln((T<sub>0</sub> − T<sub>a</sub>) / (T<sub>c</sub> − T<sub>a</sub>)) / k = ln({r.T0 - r.Ta} / {r.Tcible - r.Ta}) / {n2(r.k)} = <strong>{nombre(r.tCible, 1)} h</strong>
      </>
    ),
  },
  schema: ({ r }) => <CourbeRefroidissement T0={r.T0} Ta={r.Ta} k={r.k} Tcible={r.Tcible} tCible={r.tCible} />,
  alerte: (r) => (r.Tcible <= r.Ta || r.Tcible >= r.T0 ? 'La température visée doit être comprise entre celle de l’air et la température initiale.' : undefined),
};

// ---------- L2.1.3 et L2.1.P : vidange ----------
type ResVid = ReturnType<typeof vidange> & { dd: DonneesVidange; D: number };
const vidangeDef: DefinitionCalcul<ResVid> = {
  champs: [
    champ('D', 'diamètre intérieur de la cuve', 'D', 'm', 1, 15, 0.1, 2),
    champ('d', 'diamètre de l’orifice', 'd', 'm', 0.02, 0.3, 0.01, 2),
    champ('Cd', 'coefficient de débit', <>C<sub>d</sub></>, '', 0.5, 1, 0.01, 2),
    champ('h0', 'hauteur d’eau initiale', <>h<sub>0</sub></>, 'm', 0.5, 10, 0.1, 2),
    champ('h1', 'hauteur d’eau finale', <>h<sub>1</sub></>, 'm', 0, 5, 0.1, 2),
  ],
  defaut: { D: 6, d: EXEMPLE_VIDANGE.d, Cd: EXEMPLE_VIDANGE.Cd, h0: EXEMPLE_VIDANGE.h0, h1: EXEMPLE_VIDANGE.h1 },
  calculer: (e) => {
    const D = num(e, 'D');
    const dd: DonneesVidange = { A: (Math.PI * D * D) / 4, d: num(e, 'd'), Cd: num(e, 'Cd'), h0: num(e, 'h0'), h1: Math.min(num(e, 'h1'), num(e, 'h0')) };
    return { ...vidange(dd), dd, D };
  },
  valeurs: { T: (r) => `${nombre(r.T / 60, 1)} min`, V: (r) => grandeur(r.volume, 1, 'm³'), Q0: (r) => grandeur(r.Q0 * 1000, 1, 'L/s') },
  lignes: {
    sections: (r) => (
      <>
        A = π D²/4 = π × {n2(r.D)}² / 4 = {n3(r.dd.A)} m² ; a = π d²/4 = {nombre(r.a * 1e4, 2)} cm²
      </>
    ),
    equation: (r) => (
      <>
        A dh/dt = −C<sub>d</sub> a √(2 g h) → √h = √h<sub>0</sub> − c t avec c = C<sub>d</sub> a √(2g) / (2A) = {nombre(r.c * 1e4, 3)} × 10⁻⁴ √m/s
      </>
    ),
    temps: (r) => (
      <>
        T = (√{n2(r.dd.h0)} − √{n2(r.dd.h1)}) / c = <strong>{nombre(r.T, 0)} s = {nombre(r.T / 60, 1)} min</strong>
      </>
    ),
    controle: (r) => (
      <>
        débit initial Q<sub>0</sub> = C<sub>d</sub> a √(2 g h<sub>0</sub>) = {nombre(r.Q0 * 1000, 1)} L/s ; à débit constant, il faudrait {nombre(r.Tconstant / 60, 1)} min : la vidange réelle est plus lente
      </>
    ),
  },
  schema: ({ r }) => <CourbeVidange dd={r.dd} T={r.T} c={r.c} />,
};

// ---------- L2.1.4 : racines ----------
type ResRac = ReturnType<typeof racinesCaracteristiques> & { p: number; q: number };
const racinesDef: DefinitionCalcul<ResRac> = {
  champs: [champ('p', 'coefficient p de y’', 'p', '', -10, 10, 0.5, 1), champ('q', 'coefficient q de y', 'q', '', -10, 30, 0.5, 1)],
  defaut: { p: 2, q: 5 },
  calculer: (e) => ({ ...racinesCaracteristiques(num(e, 'p'), num(e, 'q')), p: num(e, 'p'), q: num(e, 'q') }),
  valeurs: { type: (r) => (r.type === 'reelles' ? 'deux racines réelles' : r.type === 'double' ? 'racine double' : 'racines complexes') },
  lignes: {
    D: (r) => (
      <>
        r² + {nombre(r.p, 1)} r + {nombre(r.q, 1)} = 0 ; Δ = p² − 4q = <strong>{nombre(r.D, 2)}</strong>
      </>
    ),
    sol: (r) =>
      r.type === 'reelles' ? (
        <>
          r<sub>1</sub> = {n3(r.r1)}, r<sub>2</sub> = {n3(r.r2)} → y = A e<sup>{n3(r.r1)} t</sup> + B e<sup>{n3(r.r2)} t</sup>
        </>
      ) : r.type === 'double' ? (
        <>
          r = {n3(r.r)} → y = (A + B t) e<sup>{n3(r.r)} t</sup>
        </>
      ) : (
        <>
          r = {n3(r.alpha)} ± {n3(r.beta)} i → y = e<sup>{n3(r.alpha)} t</sup> (A cos {n3(r.beta)} t + B sin {n3(r.beta)} t)
        </>
      ),
  },
  schema: () => <TroisRegimes />,
};

// ---------- L2.1.5 : oscillateur ----------
type ResOsc = ReturnType<typeof oscillateur> & { m: number; k: number; x0: number };
const oscDef: DefinitionCalcul<ResOsc> = {
  champs: [
    champ('m', 'masse', 'm', 't', 1, 200, 1, 0),
    champ('k', 'raideur', 'k', 'MN/m', 0.5, 50, 0.5, 1),
    champ('zeta', 'taux d’amortissement', 'ζ', '%', 1, 20, 1, 0),
    champ('x0', 'déplacement initial', <>x<sub>0</sub></>, 'cm', 0.5, 10, 0.5, 1),
  ],
  defaut: { m: 20, k: 8, zeta: 5, x0: 2 },
  calculer: (e) => {
    const m = num(e, 'm') * 1000;
    const k = num(e, 'k') * 1e6;
    const x0 = num(e, 'x0') / 100;
    return { ...oscillateur({ m, k, c: 2 * (num(e, 'zeta') / 100) * Math.sqrt(k * m), x0 }), m, k, x0 };
  },
  valeurs: { T0: (r) => grandeur(r.T0, 3, 's'), f0: (r) => grandeur(r.f0, 2, 'Hz') },
  lignes: {
    w0: (r) => (
      <>
        ω<sub>0</sub> = √(k/m) = √({nombre(r.k, 0)} / {nombre(r.m, 0)}) = <strong>{n3(r.w0)} rad/s</strong> ; f<sub>0</sub> = ω<sub>0</sub>/2π = {n2(r.f0)} Hz ; T<sub>0</sub> = {n3(r.T0)} s
      </>
    ),
    amort: (r) => (
      <>
        ζ = {nombre(r.zeta * 100, 0)} % → T<sub>d</sub> = 2π / (ω<sub>0</sub> √(1 − ζ²)) = <strong>{n3(r.Td)} s</strong> ; décrément δ = {n3(r.delta)} : chaque pic vaut e<sup>−δ</sup> = {n3(Math.exp(-r.delta))} fois le précédent
      </>
    ),
  },
  schema: ({ r }) => <OscillationAmortie x={r.x} x0={r.x0} zeta={r.zeta} w0={r.w0} Td={r.Td} tmax={Math.min(12 * r.Td, 20)} />,
};

// ---------- L2.1.6 : déformée ----------
type ResDef = ReturnType<typeof deformeePoutre> & typeof EXEMPLE_DEFORMEE & { b: number; h: number };
const defDef: DefinitionCalcul<ResDef> = {
  champs: [
    champ('L', 'portée', 'L', 'm', 1, 8, 0.1, 2),
    champ('q', 'charge uniforme', 'q', 'kN/m', 0.5, 20, 0.5, 1),
    champ('E', 'module d’Young', 'E', 'MPa', 7000, 210000, 1000, 0),
    champ('b', 'largeur de la section', 'b', 'cm', 5, 40, 0.5, 1),
    champ('h', 'hauteur de la section', 'h', 'cm', 10, 60, 0.5, 1),
  ],
  defaut: { L: EXEMPLE_DEFORMEE.L, q: EXEMPLE_DEFORMEE.q, E: EXEMPLE_DEFORMEE.E, b: 7.5, h: 22.5 },
  calculer: (e) => {
    const b = num(e, 'b');
    const h = num(e, 'h');
    const d = { L: num(e, 'L'), q: num(e, 'q'), E: num(e, 'E'), I: (b * h ** 3) / 12 };
    return { ...deformeePoutre(d), ...d, b, h };
  },
  valeurs: { f: (r) => grandeur(r.fmm, 2, 'mm'), rapport: (r) => `L / ${nombre(r.rapport, 0)}` },
  lignes: {
    EI: (r) => (
      <>
        I = b h³/12 = {nombre(r.b, 1)} × {nombre(r.h, 1)}³ / 12 = {nombre(r.I, 0)} cm⁴ ; EI = <strong>{nombre(r.EI, 1)} kN·m²</strong>
      </>
    ),
    integration: () => (
      <>
        EI y'' = −q x (L − x)/2 ; deux intégrations et y(0) = y(L) = 0 → y = q x (L³ − 2 L x² + x³) / (24 EI)
      </>
    ),
    fleche: (r) => (
      <>
        f = y(L/2) = 5 q L⁴ / (384 EI) = 5 × {nombre(r.q, 1)} × {n2(r.L)}⁴ / (384 × {nombre(r.EI, 1)}) = <strong>{n2(r.fmm)} mm</strong>, soit L / {nombre(r.rapport, 0)}
      </>
    ),
  },
  schema: ({ r }) => <PoutreDeformee L={r.L} y={r.y} f={r.f} />,
};

// ---------- L2.1.7 : consolidation ----------
type ResCons = ReturnType<typeof consolidation> & typeof EXEMPLE_CONSOLIDATION;
const consDef: DefinitionCalcul<ResCons> = {
  champs: [
    champ('cv', 'coefficient de consolidation', <>c<sub>v</sub></>, 'm²/an', 0.1, 20, 0.1, 1),
    champ('H', 'épaisseur de la couche', 'H', 'm', 1, 20, 0.5, 1),
    { type: 'choix', cle: 'double', libelle: 'drainage', symbole: 'D', options: [{ valeur: 1, libelle: 'par les deux faces' }, { valeur: 0, libelle: 'par une seule face' }] },
    champ('t', 'durée', 't', 'an', 0.1, 20, 0.1, 1),
  ],
  defaut: { cv: 2, H: 4, double: 1, t: 1 },
  calculer: (e) => {
    const d = { cv: num(e, 'cv'), H: num(e, 'H'), doubleDrainage: num(e, 'double') === 1, t: num(e, 't') };
    return { ...consolidation(d), ...d };
  },
  valeurs: { U: (r) => `${nombre(r.U * 100, 0)} %`, t90: (r) => grandeur(r.t90, 1, 'ans') },
  lignes: {
    Tv: (r) => (
      <>
        H<sub>d</sub> = {n2(r.Hd)} m ; T<sub>v</sub> = c<sub>v</sub> t / H<sub>d</sub>² = {nombre(r.cv, 1)} × {nombre(r.t, 1)} / {n2(r.Hd)}² = <strong>{n3(r.Tv)}</strong>
      </>
    ),
    U: (r) => (
      <>
        degré de consolidation moyen U = <strong>{nombre(r.U * 100, 0)} %</strong> ; 90 % atteints après t = 0,848 H<sub>d</sub>²/c<sub>v</sub> = {nombre(r.t90, 1)} ans
      </>
    ),
  },
  schema: ({ r }) => <CourbeConsolidation Tv={Math.min(r.Tv, 1.2)} />,
};

export const CALCULS_EQUADIFF = {
  eulerDecroissance: eulerDef,
  refroidissementBeton: refrDef,
  vidangeReservoir: vidangeDef,
  racinesSecondOrdre: racinesDef,
  oscillateurAmorti: oscDef,
  deformeePoutre: defDef,
  consolidationArgile: consDef,
} as const;
