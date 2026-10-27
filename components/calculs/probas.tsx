// Fiches de calcul du module L2.2 (probabilités et statistiques). Les valeurs viennent de lib/calc/probas.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { ArbreProbas, BarresLoi, ChevauchementRS, Cloche, FractileBeton, Histogramme, NuageRegression, RisqueRetour } from '@/components/schemas/Probas';
import {
  bayes,
  binomiale,
  binomialeCumul,
  descriptive,
  fiabilite,
  fractileNormal,
  fractileStudent,
  normale,
  poisson,
  regression,
  risqueDepassement,
} from '@/lib/calc/probas';
import { grandeur, nombre } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const pc = (x: number, d = 1) => `${nombre(x * 100, d)} %`;
const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

// ---------- L2.2.1 : statistique d'une série de six essais ----------
const CLES6 = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6'] as const;
type ResStat = ReturnType<typeof descriptive> & { xs: number[] };
const statDef: DefinitionCalcul<ResStat> = {
  champs: CLES6.map((c, i) => champ(c, `essai ${i + 1}`, <>x<sub>{i + 1}</sub></>, 'MPa', 10, 60, 0.1, 1)),
  defaut: { x1: 31.2, x2: 28.5, x3: 33.0, x4: 29.8, x5: 34.1, x6: 30.6 },
  calculer: (e) => {
    const xs = CLES6.map((c) => num(e, c));
    return { ...descriptive(xs), xs };
  },
  valeurs: { moyenne: (r) => grandeur(r.moyenne, 2, 'MPa'), s: (r) => grandeur(r.ecartType, 2, 'MPa'), cv: (r) => pc(r.cv) },
  lignes: {
    moyenne: (r) => (
      <>
        x̄ = Σx / n = {n1(r.xs.reduce((s, x) => s + x, 0))} / {r.n} = <strong>{n2(r.moyenne)} MPa</strong>
      </>
    ),
    ecarts: (r) => (
      <>
        Σ(x − x̄)² = {r.xs.map((x) => `(${n2(x - r.moyenne)})²`).join(' + ')} = {n3(r.variance * (r.n - 1))} MPa²
      </>
    ),
    s: (r) => (
      <>
        s = √(Σ(x − x̄)² / (n − 1)) = √({n3(r.variance * (r.n - 1))} / {r.n - 1}) = <strong>{n2(r.ecartType)} MPa</strong> ; CV = s / x̄ = {pc(r.cv)}
      </>
    ),
  },
  schema: ({ r }) => <Histogramme xs={r.xs} debut={Math.floor(r.min) - 1} largeur={2} nb={Math.ceil((r.max - Math.floor(r.min) + 2) / 2)} />,
};

// ---------- L2.2.2 : test imparfait et Bayes ----------
type ResBayes = ReturnType<typeof bayes> & { p: number; se: number; sp: number };
const bayesDef: DefinitionCalcul<ResBayes> = {
  champs: [
    champ('p', 'proportion de pièces défectueuses', 'p', '%', 0.5, 50, 0.5, 1),
    champ('se', 'sensibilité du contrôle', <>S<sub>e</sub></>, '%', 50, 100, 1, 0),
    champ('sp', 'spécificité du contrôle', <>S<sub>p</sub></>, '%', 50, 100, 1, 0),
  ],
  defaut: { p: 10, se: 90, sp: 95 },
  calculer: (e) => {
    const d = { p: num(e, 'p') / 100, se: num(e, 'se') / 100, sp: num(e, 'sp') / 100 };
    return { ...bayes({ p: d.p, sensibilite: d.se, specificite: d.sp }), ...d };
  },
  valeurs: { pPositif: (r) => pc(r.pPositif), pD: (r) => pc(r.pSachantPositif) },
  lignes: {
    total: (r) => (
      <>
        P(+) = P(+|D) P(D) + P(+|non D) P(non D) = {n2(r.se)} × {n2(r.p)} + {n2(1 - r.sp)} × {n2(1 - r.p)} = <strong>{nombre(r.pPositif, 4)}</strong>
      </>
    ),
    bayes: (r) => (
      <>
        P(D|+) = P(+|D) P(D) / P(+) = {nombre(r.se * r.p, 4)} / {nombre(r.pPositif, 4)} = <strong>{pc(r.pSachantPositif)}</strong>
      </>
    ),
  },
  schema: ({ r }) => <ArbreProbas p={r.p} se={r.se} sp={r.sp} D="défaut" T="alarme +" />,
};

// ---------- L2.2.3 : binomiale et Poisson ----------
type ResBin = { n: number; p: number; k: number; Pk: number; Pcum: number; lambda: number; Ppois: number; probas: number[] };
const binDef: DefinitionCalcul<ResBin> = {
  champs: [
    champ('n', 'nombre d’éprouvettes', 'n', '', 2, 30, 1, 0),
    champ('p', 'probabilité qu’une éprouvette soit faible', 'p', '%', 1, 50, 1, 0),
    champ('k', 'nombre de faibles', 'k', '', 0, 10, 1, 0),
  ],
  defaut: { n: 10, p: 5, k: 1 },
  calculer: (e) => {
    const n = Math.round(num(e, 'n'));
    const p = num(e, 'p') / 100;
    const k = Math.min(n, Math.round(num(e, 'k')));
    return { n, p, k, Pk: binomiale(n, p, k), Pcum: binomialeCumul(n, p, k), lambda: n * p, Ppois: poisson(n * p, k), probas: Array.from({ length: Math.min(n, 10) + 1 }, (_, i) => binomiale(n, p, i)) };
  },
  valeurs: { Pk: (r) => nombre(r.Pk, 4), Pcum: (r) => nombre(r.Pcum, 4) },
  lignes: {
    Pk: (r) => (
      <>
        P(X = {r.k}) = C({r.n}, {r.k}) × {n2(r.p)}<sup>{r.k}</sup> × {n2(1 - r.p)}<sup>{r.n - r.k}</sup> = <strong>{nombre(r.Pk, 4)}</strong>
      </>
    ),
    cumul: (r) => (
      <>
        P(X ≤ {r.k}) = somme des P(X = i) pour i de 0 à {r.k} = <strong>{nombre(r.Pcum, 4)}</strong>
      </>
    ),
    poisson: (r) => (
      <>
        approximation de Poisson : λ = n p = {n2(r.lambda)} ; P(X = {r.k}) ≈ e<sup>−λ</sup> λ<sup>{r.k}</sup> / {r.k}! = {nombre(r.Ppois, 4)}
      </>
    ),
  },
  schema: ({ r }) => <BarresLoi probas={r.probas} titre={`B(${r.n} ; ${n2(r.p)})`} marque={r.k} />,
};

// ---------- L2.2.4 : loi normale ----------
type ResNorm = { mu: number; sigma: number; x: number; z: number; P: number; f5: number };
const normDef: DefinitionCalcul<ResNorm> = {
  champs: [
    champ('mu', 'moyenne', 'μ', 'MPa', 10, 60, 0.5, 1),
    champ('sigma', 'écart-type', 'σ', 'MPa', 0.5, 10, 0.1, 1),
    champ('x', 'valeur seuil', 'x', 'MPa', 5, 70, 0.5, 1),
  ],
  defaut: { mu: 33, sigma: 4, x: 28 },
  calculer: (e) => {
    const mu = num(e, 'mu');
    const sigma = num(e, 'sigma');
    const x = num(e, 'x');
    const N = normale(mu, sigma);
    return { mu, sigma, x, z: (x - mu) / sigma, P: N.P(x), f5: N.fractile(0.05) };
  },
  valeurs: { P: (r) => pc(r.P), f5: (r) => grandeur(r.f5, 1, 'MPa') },
  lignes: {
    z: (r) => (
      <>
        variable centrée réduite z = (x − μ) / σ = ({n1(r.x)} − {n1(r.mu)}) / {n1(r.sigma)} = <strong>{n3(r.z)}</strong>
      </>
    ),
    P: (r) => (
      <>
        P(X &lt; {n1(r.x)}) = Φ({n3(r.z)}) = <strong>{pc(r.P, 2)}</strong>
      </>
    ),
    f5: (r) => (
      <>
        fractile 5 % : x<sub>0,05</sub> = μ + u<sub>0,05</sub> σ = {n1(r.mu)} − 1,645 × {n1(r.sigma)} = <strong>{n1(r.f5)} MPa</strong>
      </>
    ),
  },
  schema: ({ r }) => <Cloche mu={r.mu} sigma={r.sigma} sous={r.x} unite="MPa" titreX="fc (MPa)" />,
};

// ---------- L2.2.5 et L2.2.P : résistance caractéristique et conformité ----------
type ResConf = { fck: number; fcm: number; s: number; fmin: number; n: number; continue_: boolean; seuilMoyenne: number; seuilIndividuel: number; c1: boolean; c2: boolean; fk5: number; pSous: number };
const confDef: DefinitionCalcul<ResConf> = {
  champs: [
    champ('fck', 'résistance caractéristique exigée', <>f<sub>ck</sub></>, 'MPa', 12, 50, 1, 0),
    champ('fcm', 'moyenne des résultats', <>f<sub>cm</sub></>, 'MPa', 10, 70, 0.1, 1),
    champ('s', 'écart-type des résultats', 's', 'MPa', 0.5, 10, 0.1, 1),
    champ('fmin', 'plus faible résultat', <>f<sub>ci,min</sub></>, 'MPa', 5, 70, 0.1, 1),
    { type: 'choix', cle: 'n', libelle: 'production', symbole: 'n', options: [{ valeur: 15, libelle: 'continue (n ≥ 15)' }, { valeur: 3, libelle: 'initiale (n = 3)' }] },
  ],
  defaut: { fck: 25, fcm: 31.1, s: 2.1, fmin: 27.9, n: 15 },
  calculer: (e) => {
    const fck = num(e, 'fck');
    const fcm = num(e, 'fcm');
    const s = num(e, 's');
    const fmin = num(e, 'fmin');
    const n = num(e, 'n');
    const continue_ = n >= 15;
    const seuilMoyenne = continue_ ? fck + 1.48 * s : fck + 4;
    const seuilIndividuel = fck - 4;
    return { fck, fcm, s, fmin, n, continue_, seuilMoyenne, seuilIndividuel, c1: fcm >= seuilMoyenne, c2: fmin >= seuilIndividuel, fk5: fcm + fractileNormal(0.05) * s, pSous: normale(fcm, s).P(fck) };
  },
  valeurs: {
    fk5: (r) => grandeur(r.fk5, 1, 'MPa'),
    conforme: (r) => (r.c1 && r.c2 ? 'conforme' : 'non conforme'),
    pSous: (r) => pc(r.pSous),
  },
  lignes: {
    fk5: (r) => (
      <>
        fractile 5 % estimé : f<sub>cm</sub> − 1,645 s = {n1(r.fcm)} − 1,645 × {n1(r.s)} = <strong>{n1(r.fk5)} MPa</strong> ; part des résultats sous f<sub>ck</sub> ≈ {pc(r.pSous)}
      </>
    ),
    critere1: (r) => (
      <>
        critère 1 : f<sub>cm</sub> ≥ {r.continue_ ? <>f<sub>ck</sub> + 1,48 σ = {n1(r.fck)} + 1,48 × {n1(r.s)}</> : <>f<sub>ck</sub> + 4 = {n1(r.fck)} + 4</>} = {n1(r.seuilMoyenne)} MPa ; {n1(r.fcm)} {r.c1 ? '≥' : '<'} {n1(r.seuilMoyenne)} : <strong>{r.c1 ? 'vérifié' : 'non vérifié'}</strong>
      </>
    ),
    critere2: (r) => (
      <>
        critère 2 : chaque f<sub>ci</sub> ≥ f<sub>ck</sub> − 4 = {n1(r.seuilIndividuel)} MPa ; {n1(r.fmin)} {r.c2 ? '≥' : '<'} {n1(r.seuilIndividuel)} : <strong>{r.c2 ? 'vérifié' : 'non vérifié'}</strong>
      </>
    ),
  },
  schema: ({ r }) => <FractileBeton fcm={r.fcm} s={r.s} fck={r.fck} />,
  alerte: (r) => (r.c1 && r.c2 ? undefined : 'Béton non conforme : prévenir le maître d’œuvre, carotter l’ouvrage et vérifier la structure avec la résistance réelle.'),
};

// ---------- L2.2.6 : intervalle de confiance ----------
type ResIC = { n: number; m: number; s: number; niveau: number; t: number; et: number; demi: number };
const icDef: DefinitionCalcul<ResIC> = {
  champs: [
    champ('n', 'nombre d’essais', 'n', '', 2, 60, 1, 0),
    champ('m', 'moyenne observée', 'x̄', 'MPa', 10, 70, 0.1, 1),
    champ('s', 'écart-type observé', 's', 'MPa', 0.5, 10, 0.1, 1),
    { type: 'choix', cle: 'niveau', libelle: 'niveau de confiance', symbole: '1 − α', options: [{ valeur: 95, libelle: '95 %' }, { valeur: 90, libelle: '90 %' }, { valeur: 99, libelle: '99 %' }] },
  ],
  defaut: { n: 6, m: 31.2, s: 2.2, niveau: 95 },
  calculer: (e) => {
    const n = Math.round(num(e, 'n'));
    const m = num(e, 'm');
    const s = num(e, 's');
    const niveau = num(e, 'niveau') / 100;
    const t = fractileStudent(1 - (1 - niveau) / 2, n - 1);
    const et = s / Math.sqrt(n);
    return { n, m, s, niveau, t, et, demi: t * et };
  },
  valeurs: { bas: (r) => grandeur(r.m - r.demi, 1, 'MPa'), haut: (r) => grandeur(r.m + r.demi, 1, 'MPa'), demi: (r) => grandeur(r.demi, 2, 'MPa') },
  lignes: {
    et: (r) => (
      <>
        erreur type s / √n = {n1(r.s)} / √{r.n} = <strong>{n3(r.et)} MPa</strong>
      </>
    ),
    t: (r) => (
      <>
        Student à n − 1 = {r.n - 1} degrés de liberté : t = <strong>{n3(r.t)}</strong> (au lieu de {n3(fractileNormal(1 - (1 - r.niveau) / 2))} pour la loi normale)
      </>
    ),
    ic: (r) => (
      <>
        x̄ ± t s/√n = {n1(r.m)} ± {n3(r.t)} × {n3(r.et)} = {n1(r.m)} ± {n2(r.demi)} : <strong>[{n1(r.m - r.demi)} ; {n1(r.m + r.demi)}] MPa</strong>
      </>
    ),
  },
  schema: ({ r }) => <Cloche mu={r.m} sigma={r.et} entre={[r.m - r.demi, r.m + r.demi]} unite="MPa" titreX="moyenne vraie possible (MPa)" />,
};

// ---------- L2.2.7 : régression (étalonnage d'un scléromètre) ----------
const XS = [28, 32, 36, 40, 44];
const CLES5 = ['y1', 'y2', 'y3', 'y4', 'y5'] as const;
type ResReg = ReturnType<typeof regression> & { ys: number[] };
const regDef: DefinitionCalcul<ResReg> = {
  champs: CLES5.map((c, i) => champ(c, `résistance pour un indice de ${XS[i]}`, <>f<sub>{i + 1}</sub></>, 'MPa', 5, 70, 0.1, 1)),
  defaut: { y1: 18.5, y2: 23.8, y3: 28.7, y4: 33.0, y5: 38.4 },
  calculer: (e) => {
    const ys = CLES5.map((c) => num(e, c));
    return { ...regression(XS, ys), ys };
  },
  valeurs: { a: (r) => nombre(r.a, 3), b: (r) => nombre(r.b, 2), r: (r) => nombre(r.r, 4), f38: (r) => grandeur(r.predire(38), 1, 'MPa') },
  lignes: {
    moyennes: (r) => (
      <>
        x̄ = {n1(r.mx)} ; ȳ = {n2(r.my)} MPa
      </>
    ),
    pente: (r) => (
      <>
        a = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² = <strong>{n3(r.a)} MPa par unité d’indice</strong> ; b = ȳ − a x̄ = {n2(r.my)} − {n3(r.a)} × {n1(r.mx)} = <strong>{n2(r.b)} MPa</strong>
      </>
    ),
    r: (r) => (
      <>
        r = Σ(x − x̄)(y − ȳ) / √(Σ(x − x̄)² Σ(y − ȳ)²) = <strong>{nombre(r.r, 4)}</strong> ; r² = {nombre(r.r2, 4)}
      </>
    ),
    prediction: (r) => (
      <>
        pour un indice de 38 : f = {n3(r.a)} × 38 {r.b >= 0 ? '+' : '−'} {n2(Math.abs(r.b))} = <strong>{n1(r.predire(38))} MPa</strong>
      </>
    ),
  },
  schema: ({ r }) => <NuageRegression xs={XS} ys={r.ys} titreX="indice de rebond" titreY="fc (MPa)" />,
};

// ---------- L2.2.8 : période de retour ----------
type ResRet = { T: number; n: number; m: number; s: number; risque: number; alpha: number; u: number; xT: number };
const retDef: DefinitionCalcul<ResRet> = {
  champs: [
    champ('T', 'période de retour', 'T', 'ans', 2, 1000, 1, 0),
    champ('n', 'durée de vie de l’ouvrage', 'n', 'ans', 1, 120, 1, 0),
    champ('m', 'moyenne des maximums annuels', 'x̄', 'mm', 20, 300, 1, 0),
    champ('s', 'écart-type des maximums annuels', 's', 'mm', 2, 100, 0.5, 1),
  ],
  defaut: { T: 100, n: 50, m: 90, s: 17.5 },
  calculer: (e) => {
    const T = num(e, 'T');
    const n = num(e, 'n');
    const m = num(e, 'm');
    const s = num(e, 's');
    const alpha = (s * Math.sqrt(6)) / Math.PI;
    const u = m - 0.5772 * alpha;
    return { T, n, m, s, risque: risqueDepassement(T, n), alpha, u, xT: u - alpha * Math.log(-Math.log(1 - 1 / T)) };
  },
  valeurs: { risque: (r) => pc(r.risque, 0), xT: (r) => grandeur(r.xT, 0, 'mm') },
  lignes: {
    p: (r) => (
      <>
        probabilité annuelle de dépassement p = 1 / T = 1 / {nombre(r.T, 0)} = {nombre(1 / r.T, 4)}
      </>
    ),
    risque: (r) => (
      <>
        risque sur n = {nombre(r.n, 0)} ans : 1 − (1 − p)<sup>n</sup> = 1 − {nombre(1 - 1 / r.T, 4)}<sup>{nombre(r.n, 0)}</sup> = <strong>{pc(r.risque, 0)}</strong>
      </>
    ),
    gumbel: (r) => (
      <>
        Gumbel : α = s √6 / π = {n2(r.alpha)} mm ; u = x̄ − 0,5772 α = {n1(r.u)} mm ; x<sub>T</sub> = u − α ln(−ln(1 − 1/T)) = <strong>{nombre(r.xT, 0)} mm</strong>
      </>
    ),
  },
  schema: ({ r }) => <RisqueRetour T={[r.T]} nmax={Math.max(20, Math.ceil(r.n / 20) * 20)} />,
};

// ---------- L2.2.9 : fiabilité ----------
type ResFiab = ReturnType<typeof fiabilite> & { muR: number; sR: number; muS: number; sS: number };
const fiabDef: DefinitionCalcul<ResFiab> = {
  champs: [
    champ('muR', 'résistance moyenne', <>μ<sub>R</sub></>, 'kN·m', 50, 600, 5, 0),
    champ('sR', 'écart-type de la résistance', <>σ<sub>R</sub></>, 'kN·m', 1, 100, 1, 0),
    champ('muS', 'sollicitation moyenne', <>μ<sub>S</sub></>, 'kN·m', 20, 500, 5, 0),
    champ('sS', 'écart-type de la sollicitation', <>σ<sub>S</sub></>, 'kN·m', 1, 100, 1, 0),
  ],
  defaut: { muR: 300, sR: 30, muS: 150, sS: 25 },
  calculer: (e) => {
    const d = { muR: num(e, 'muR'), sR: num(e, 'sR'), muS: num(e, 'muS'), sS: num(e, 'sS') };
    return { ...fiabilite(d), ...d };
  },
  valeurs: { beta: (r) => n2(r.beta), Pf: (r) => `${nombre(r.Pf * 1e6, 1)} × 10⁻⁶`, gR: (r) => n2(r.gammaR), gS: (r) => n2(r.gammaS) },
  lignes: {
    beta: (r) => (
      <>
        β = (μ<sub>R</sub> − μ<sub>S</sub>) / √(σ<sub>R</sub>² + σ<sub>S</sub>²) = ({nombre(r.muR, 0)} − {nombre(r.muS, 0)}) / √({nombre(r.sR, 0)}² + {nombre(r.sS, 0)}²) = <strong>{n2(r.beta)}</strong>
      </>
    ),
    Pf: (r) => (
      <>
        P<sub>f</sub> = Φ(−β) = <strong>{nombre(r.Pf * 1e6, 1)} × 10⁻⁶</strong>, soit une chance sur {nombre(1 / r.Pf, 0)}
      </>
    ),
    gammas: (r) => (
      <>
        R<sub>k</sub> = {n1(r.Rk)} ; R<sub>d</sub> = {n1(r.Rd)} → γ<sub>R</sub> = {n2(r.gammaR)} ; S<sub>k</sub> = {n1(r.Sk)} ; S<sub>d</sub> = {n1(r.Sd)} → γ<sub>S</sub> = {n2(r.gammaS)} (pour β = {nombre(r.betaCible, 1)})
      </>
    ),
  },
  schema: ({ r }) => <ChevauchementRS d={r} Rd={r.Rd} Sd={r.Sd} />,
};

export const CALCULS_PROBAS = {
  statistiqueEssais: statDef,
  bayesControle: bayesDef,
  loiBinomiale: binDef,
  loiNormale: normDef,
  conformiteBeton: confDef,
  intervalleMoyenne: icDef,
  regressionSclerometre: regDef,
  periodeRetour: retDef,
  fiabiliteBeta: fiabDef,
} as const;
