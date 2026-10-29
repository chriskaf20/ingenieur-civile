// Fiches de calcul du module L2.3 (méthodes numériques). Les valeurs viennent de lib/calc/numerique.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { CanalRectangulaire, ConvergenceIterative, DeformeeDF, ErreurPas, EulerRK, InterpolationTableau, TrapezesSimpson } from '@/components/schemas/Numerique';
import {
  chaineRessorts,
  cholesky,
  cubatureProfils,
  deformeeDF,
  deriveeFinie,
  ecm,
  hauteurNormale,
  interpTableau,
  iteratif,
  oscillateurNumerique,
} from '@/lib/calc/numerique';
import { grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const n4 = (x: number) => nombre(x, 4);
const sci = (x: number) => {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  return `${nombre(x / 10 ** e, 2)} × 10^${e}`;
};
const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

// ---------- L2.3.1 : erreur d'une dérivée numérique ----------
type ResDer = ReturnType<typeof deriveeFinie> & { k: number };
const derDef: DefinitionCalcul<ResDer> = {
  champs: [champ('k', 'exposant du pas h = 10^−k', 'k', '', 1, 14, 1, 0)],
  defaut: { k: 2 },
  calculer: (e) => {
    const k = num(e, 'k');
    return { ...deriveeFinie(Math.exp, 1, 0, 10 ** -k), k };
  },
  valeurs: { eAvant: (r) => sci(r.eAvant), eCentree: (r) => sci(r.eCentree) },
  lignes: {
    avant: (r) => (
      <>
        différence avant : (e<sup>h</sup> − 1) / h = <strong>{nombre(r.avant, 10)}</strong> ; erreur {sci(r.eAvant)}
      </>
    ),
    centree: (r) => (
      <>
        différence centrée : (e<sup>h</sup> − e<sup>−h</sup>) / (2h) = <strong>{nombre(r.centree, 10)}</strong> ; erreur {sci(r.eCentree)}
      </>
    ),
  },
  schema: () => <ErreurPas />,
};

// ---------- L2.3.2 : hauteur normale d'un canal ----------
type ResCanal = ReturnType<typeof hauteurNormale> & { b: number; K: number; i: number; Q: number };
const canalDef: DefinitionCalcul<ResCanal> = {
  champs: [
    champ('b', 'largeur du canal', 'b', 'm', 0.3, 10, 0.1, 1),
    champ('K', 'coefficient de Strickler', 'K', 'm^(1/3)/s', 20, 80, 1, 0),
    champ('i', 'pente du canal', 'i', '‰', 0.1, 20, 0.1, 1),
    champ('Q', 'débit', 'Q', 'm³/s', 0.1, 30, 0.1, 1),
  ],
  defaut: { b: 2, K: 40, i: 1, Q: 3 },
  calculer: (e) => {
    const d = { b: num(e, 'b'), K: num(e, 'K'), i: num(e, 'i') / 1000, Q: num(e, 'Q') };
    return { ...hauteurNormale(d), ...d };
  },
  valeurs: { h: (r) => grandeur(r.h, 3, 'm'), V: (r) => grandeur(r.V, 2, 'm/s'), nd: (r) => String(r.dich.length), nn: (r) => String(r.newt.length - 1) },
  lignes: {
    equation: (r) => (
      <>
        f(h) = K b h (b h / (b + 2h))<sup>2/3</sup> √i − Q = {nombre(r.K, 0)} × {n2(r.b)} h × (…)<sup>2/3</sup> × √{nombre(r.i, 4)} − {n2(r.Q)} = 0
      </>
    ),
    dichotomie: (r) => (
      <>
        dichotomie sur [0,01 ; 10] m : {r.dich.slice(0, 4).map((p) => n3(p.x)).join(' ; ')} … → h = {n3(r.dich[r.dich.length - 1]!.x)} m en <strong>{r.dich.length} itérations</strong>
      </>
    ),
    newton: (r) => (
      <>
        Newton depuis h₀ = 1 m : {r.newt.map((p) => n4(p.x)).join(' ; ')} → <strong>{r.newt.length - 1} itérations</strong>
      </>
    ),
    controle: (r) => (
      <>
        contrôle : vitesse V = Q / (b h) = {n2(r.Q)} / ({n2(r.b)} × {n3(r.h)}) = <strong>{n2(r.V)} m/s</strong>
      </>
    ),
  },
  schema: ({ r }) => <CanalRectangulaire b={r.b} h={r.h} Q={r.Q} />,
  alerte: (r) => (r.V > 1 ? 'Vitesse supérieure à 1 m/s : un canal en terre risque l’érosion ; prévoir un revêtement (L2.7).' : undefined),
};

// ---------- L2.3.3 : interpolation dans un tableau ----------
const FCK = [12, 16, 20, 25, 30, 35, 40, 45, 50];
const ECM_TAB = FCK.map((f) => Math.round(ecm(f)));
type ResInterp = { fck: number; i: number; y: number | null; exact: number };
const interpDef: DefinitionCalcul<ResInterp> = {
  champs: [champ('fck', 'résistance caractéristique', <>f<sub>ck</sub></>, 'MPa', 12, 50, 1, 0)],
  defaut: { fck: 28 },
  calculer: (e) => {
    const fck = num(e, 'fck');
    const t = interpTableau(FCK, ECM_TAB, fck);
    return { fck, i: t?.i ?? 0, y: t?.y ?? null, exact: ecm(fck) };
  },
  valeurs: { y: (r) => (r.y === null ? '—' : grandeur(r.y, 2, 'GPa')), exact: (r) => grandeur(r.exact, 2, 'GPa') },
  lignes: {
    encadrement: (r) => (
      <>
        {nombre(r.fck, 0)} MPa est entre {FCK[r.i]} et {FCK[r.i + 1]} MPa : E = {ECM_TAB[r.i]} et {ECM_TAB[r.i + 1]} GPa
      </>
    ),
    interp: (r) => (
      <>
        E ≈ {ECM_TAB[r.i]} + ({ECM_TAB[r.i + 1]} − {ECM_TAB[r.i]}) × ({nombre(r.fck, 0)} − {FCK[r.i]}) / ({FCK[r.i + 1]} − {FCK[r.i]}) = <strong>{r.y === null ? '—' : n2(r.y)} GPa</strong>
      </>
    ),
    exact: (r) => (
      <>
        formule de l’EC2 : 22 ((f<sub>ck</sub> + 8)/10)<sup>0,3</sup> = <strong>{n2(r.exact)} GPa</strong> ; écart {r.y === null ? '—' : nombre(Math.abs(r.y - r.exact), 2)} GPa
      </>
    ),
  },
  schema: ({ r }) => <InterpolationTableau xs={FCK} ys={ECM_TAB} x={r.fck} exacte={ecm} titreX="fck (MPa)" titreY="Ecm (GPa)" dec={0} />,
};

// ---------- L2.3.4 et L2.3.P : cubature ----------
const CLES_A = ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'] as const;
type ResCub = ReturnType<typeof cubatureProfils> & { aires: number[]; pas: number };
const cubDef: DefinitionCalcul<ResCub> = {
  champs: [champ('pas', 'distance entre profils', 'd', 'm', 5, 50, 1, 0), ...CLES_A.map((c, i) => champ(c, `aire du profil ${i}`, <>S<sub>{i}</sub></>, 'm²', 0, 100, 0.1, 1))],
  defaut: { pas: 20, a0: 0, a1: 8.4, a2: 14.2, a3: 18.6, a4: 21.0, a5: 19.3, a6: 15.1, a7: 9.8, a8: 4.2 },
  calculer: (e) => {
    const aires = CLES_A.map((c) => num(e, c));
    const pas = num(e, 'pas');
    return { ...cubatureProfils(aires, pas), aires, pas };
  },
  valeurs: { trapezes: (r) => grandeur(r.trapezes, 0, 'm³'), simpson: (r) => (r.simpson === null ? '—' : grandeur(r.simpson, 0, 'm³')) },
  lignes: {
    trapezes: (r) => (
      <>
        trapèzes : d × (S₀/2 + S₁ + … + S₇ + S₈/2) = {nombre(r.pas, 0)} × ({n2(r.aires[0]! / 2)} + {nombre(r.aires.slice(1, -1).reduce((s, a) => s + a, 0), 1)} + {n2(r.aires[8]! / 2)}) = <strong>{nombre(r.trapezes, 0)} m³</strong>
      </>
    ),
    simpson: (r) => (
      <>
        Simpson : d/3 × (S₀ + 4 (S₁ + S₃ + S₅ + S₇) + 2 (S₂ + S₄ + S₆) + S₈) = {nombre(r.pas, 0)}/3 × ({n2(r.aires[0]! + r.aires[8]!)} + 4 × {nombre(r.aires[1]! + r.aires[3]! + r.aires[5]! + r.aires[7]!, 1)} + 2 × {nombre(r.aires[2]! + r.aires[4]! + r.aires[6]!, 1)}) = <strong>{r.simpson === null ? '—' : nombre(r.simpson, 0)} m³</strong>
      </>
    ),
    ecart: (r) => (
      <>
        écart entre les deux méthodes : {r.simpson === null ? '—' : nombre((Math.abs(r.simpson - r.trapezes) / r.simpson) * 100, 1)} % sur {nombre(r.longueur, 0)} m de route
      </>
    ),
  },
  schema: ({ r }) => <TrapezesSimpson ys={r.aires} pas={r.pas} />,
};

// ---------- L2.3.5 : système de raideur ----------
type ResRes = ReturnType<typeof chaineRessorts> & { L: number[][] | null; j: number; s: number };
const resDef: DefinitionCalcul<ResRes> = {
  champs: [
    champ('k1', 'raideur du ressort 1', <>k<sub>1</sub></>, 'kN/m', 10, 1000, 10, 0),
    champ('k2', 'raideur du ressort 2', <>k<sub>2</sub></>, 'kN/m', 10, 1000, 10, 0),
    champ('k3', 'raideur du ressort 3', <>k<sub>3</sub></>, 'kN/m', 10, 1000, 10, 0),
    champ('k4', 'raideur du ressort 4', <>k<sub>4</sub></>, 'kN/m', 10, 1000, 10, 0),
    champ('F', 'force au nœud 2', 'F', 'kN', 1, 100, 1, 0),
  ],
  defaut: { k1: 100, k2: 100, k3: 100, k4: 100, F: 10 },
  calculer: (e) => {
    const c = chaineRessorts([num(e, 'k1'), num(e, 'k2'), num(e, 'k3'), num(e, 'k4')], [0, num(e, 'F'), 0]);
    return { ...c, L: cholesky(c.K), j: iteratif(c.K, c.F, 'jacobi').length, s: iteratif(c.K, c.F, 'seidel').length };
  },
  valeurs: { u2: (r) => (r.u ? grandeur(r.u[1]! * 1000, 1, 'mm') : '—'), u1: (r) => (r.u ? grandeur(r.u[0]! * 1000, 1, 'mm') : '—') },
  lignes: {
    K: (r) => (
      <>
        K = [{r.K.map((l) => l.map((v) => nombre(v, 0)).join(' ; ')).join(' | ')}] kN/m ; F = [{r.F.map((v) => nombre(v, 0)).join(' ; ')}] kN
      </>
    ),
    L: (r) => (
      <>
        Cholesky K = L Lᵀ : L = [{r.L ? r.L.map((l) => l.map((v) => n2(v)).join(' ; ')).join(' | ') : 'impossible'}]
      </>
    ),
    u: (r) => (
      <>
        descente puis remontée : u = [{r.u ? r.u.map((v) => nombre(v * 1000, 2)).join(' ; ') : '—'}] mm
      </>
    ),
    iter: (r) => (
      <>
        méthodes itératives (résidu 10⁻⁶) : Jacobi {r.j} itérations, Gauss-Seidel <strong>{r.s}</strong>
      </>
    ),
  },
  schema: ({ r }) => <ConvergenceIterative A={r.K} b={r.F} />,
};

// ---------- L2.3.6 : Euler et Runge-Kutta ----------
type ResRK = { f0: number; h: number; tmax: number; e: number; r2: number; r4: number; exact: number };
const rkDef: DefinitionCalcul<ResRK> = {
  champs: [
    champ('f0', 'fréquence propre', <>f<sub>0</sub></>, 'Hz', 0.2, 5, 0.1, 1),
    champ('h', 'pas de temps', 'h', 's', 0.001, 0.1, 0.001, 3),
    champ('tmax', 'durée simulée', <>t<sub>max</sub></>, 's', 1, 10, 0.5, 1),
  ],
  defaut: { f0: 1, h: 0.01, tmax: 3 },
  calculer: (e) => {
    const f0 = num(e, 'f0');
    const h = num(e, 'h');
    const tmax = num(e, 'tmax');
    const w = 2 * Math.PI * f0;
    const eu = oscillateurNumerique(w, 1, h, tmax, 'euler');
    return { f0, h, tmax, e: eu.erreur, r2: oscillateurNumerique(w, 1, h, tmax, 'rk2').erreur, r4: oscillateurNumerique(w, 1, h, tmax, 'rk4').erreur, exact: eu.exact };
  },
  valeurs: { e: (r) => sci(r.e), r4: (r) => sci(r.r4) },
  lignes: {
    systeme: (r) => (
      <>
        x″ = −ω² x avec ω = 2π f₀ = {n3(2 * Math.PI * r.f0)} rad/s, écrit x′ = v, v′ = −ω² x ; x(0) = 1, v(0) = 0 ; {nombre(Math.round(r.tmax / r.h), 0)} pas
      </>
    ),
    erreurs: (r) => (
      <>
        erreur sur x({nombre(r.tmax, 1)} s) : Euler {sci(r.e)} ; Heun (RK2) {sci(r.r2)} ; <strong>RK4 {sci(r.r4)}</strong>
      </>
    ),
  },
  schema: ({ r }) => <EulerRK w={2 * Math.PI * r.f0} h={r.h} tmax={r.tmax} />,
};

// ---------- L2.3.7 : différences finies ----------
type ResDF = ReturnType<typeof deformeeDF> & { L: number; q: number; EI: number; n: number };
const dfDef: DefinitionCalcul<ResDF> = {
  champs: [
    champ('L', 'portée', 'L', 'm', 2, 12, 0.5, 1),
    champ('q', 'charge uniforme', 'q', 'kN/m', 1, 50, 1, 0),
    champ('EI', 'rigidité en flexion', 'EI', 'kN·m²', 1000, 100000, 1000, 0),
    champ('n', 'nombre d’intervalles (pair)', 'n', '', 2, 40, 2, 0),
  ],
  defaut: { L: 6, q: 10, EI: 20000, n: 6 },
  calculer: (e) => {
    const d = { L: num(e, 'L'), q: num(e, 'q'), EI: num(e, 'EI'), n: Math.max(2, 2 * Math.round(num(e, 'n') / 2)) };
    return { ...deformeeDF(d), ...d };
  },
  valeurs: { fDF: (r) => grandeur(r.fDF * 1000, 2, 'mm'), fExact: (r) => grandeur(r.fExact * 1000, 2, 'mm'), erreur: (r) => `${nombre(r.erreur * 100, 2)} %` },
  lignes: {
    pas: (r) => (
      <>
        h = L / n = {n2(r.L)} / {r.n} = <strong>{n3(r.h)} m</strong> ; {r.n - 1} nœuds intérieurs, donc {r.n - 1} équations
      </>
    ),
    systeme: (r) => (
      <>
        nœud i : y<sub>i−1</sub> − 2 y<sub>i</sub> + y<sub>i+1</sub> = −h² M(x<sub>i</sub>) / EI, avec M(x) = q x (L − x)/2 ; système tridiagonal résolu par l’algorithme de Thomas
      </>
    ),
    fleche: (r) => (
      <>
        flèche au milieu : DF <strong>{n2(r.fDF * 1000)} mm</strong> ; exacte 5qL⁴/(384EI) = {n2(r.fExact * 1000)} mm ; écart {nombre(r.erreur * 100, 2)} %
      </>
    ),
  },
  schema: ({ r }) => <DeformeeDF d={r} />,
};

export const CALCULS_NUMERIQUE = {
  erreurDerivee: derDef,
  hauteurNormaleCanal: canalDef,
  interpolationEcm: interpDef,
  cubatureSimpson: cubDef,
  ressortsCholesky: resDef,
  oscillateurRK: rkDef,
  deformeeDiffFinies: dfDef,
} as const;
