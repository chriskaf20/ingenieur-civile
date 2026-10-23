// Fiches de calcul du module N0.4 (trigonométrie). Les valeurs viennent de lib/calc/trigo.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { CercleForce, FermeW, MatHauban, Rapporteur, TalusPente, ToitureElevation, TriangleStation } from '@/components/schemas/Trigo';
import {
  appliquerPente,
  composantes,
  convertirAngle,
  cosD,
  ecrituresPente,
  EXEMPLE_FERME,
  EXEMPLE_TOITURE,
  ferme,
  penteDepuis,
  rectDeuxCotes,
  sinD,
  toiture,
  triangleCAC,
  versDMS,
  type Composantes,
  type DonneesFerme,
  type DonneesToiture,
  type EcrituresPente,
  type NotationPente,
  type ResultatFerme,
  type ResultatToiture,
  type Triangle,
  type TriangleRect,
  type UniteAngle,
} from '@/lib/calc/trigo';
import { arrondi, grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
const deg = (x: number, d = 2) => `${nombre(x, d)}°`;
const SYMBOLE: Record<UniteAngle, string> = { deg: '°', rad: 'rad', gon: 'gon' };

/** « 114° 41′ 29,4″ » */
export function ecrireDMS(x: number, dec = 1): string {
  const v = versDMS(x, dec);
  return `${v.signe < 0 ? '−' : ''}${v.d}° ${v.m}′ ${nombre(v.s, dec)}″`;
}

// ---------- Unités d'angle (N0.4.1) ----------
interface ResAngles {
  valeur: number;
  unite: UniteAngle;
  deg: number;
  rad: number;
  gon: number;
}

const ecrireAngle = (x: number, u: UniteAngle) => (u === 'deg' ? deg(x, 4) : `${nombre(x, 4)} ${SYMBOLE[u]}`);

const angles: DefinitionCalcul<ResAngles> = {
  champs: [
    { cle: 'valeur', libelle: 'angle lu', symbole: 'θ', unite: '', min: 0, max: 400, pas: 0.0001, decimales: 4 },
    {
      type: 'choix',
      cle: 'unite',
      libelle: 'unité de l’angle lu',
      symbole: 'u',
      options: [
        { valeur: 'deg', libelle: 'degrés (°)' },
        { valeur: 'rad', libelle: 'radians (rad)' },
        { valeur: 'gon', libelle: 'grades (gon)' },
      ],
    },
  ],
  defaut: { valeur: 127.435, unite: 'gon' },
  calculer: (e) => {
    const valeur = num(e, 'valeur');
    const unite = String(e.unite) as UniteAngle;
    return { valeur, unite, deg: convertirAngle(valeur, unite, 'deg'), rad: convertirAngle(valeur, unite, 'rad'), gon: convertirAngle(valeur, unite, 'gon') };
  },
  valeurs: {
    deg: (r) => deg(r.deg, 4),
    rad: (r) => `${nombre(r.rad, 4)} rad`,
    gon: (r) => `${nombre(r.gon, 4)} gon`,
    dms: (r) => ecrireDMS(r.deg),
    depart: (r) => ecrireAngle(r.valeur, r.unite),
  },
  lignes: {
    tour: () => <>un tour : 360° = 2π rad = 400 gon, donc θ_arrivée = θ_départ × (tour d’arrivée / tour de départ)</>,
    deg: (r) =>
      r.unite === 'deg' ? (
        <>angle déjà en degrés : {deg(r.deg, 4)}</>
      ) : (
        <>
          en degrés : {ecrireAngle(r.valeur, r.unite)} × 360 / {r.unite === 'rad' ? '2π' : '400'} = <strong>{deg(r.deg, 4)}</strong>
        </>
      ),
    rad: (r) => (
      <>
        en radians : {deg(r.deg, 4)} × π / 180 = <strong>{nombre(r.rad, 4)} rad</strong>
      </>
    ),
    gon: (r) => (
      <>
        en grades : {deg(r.deg, 4)} × 400 / 360 = <strong>{nombre(r.gon, 4)} gon</strong>
      </>
    ),
    dms: (r) => {
      const v = versDMS(r.deg, 1);
      const minutes = (r.deg - Math.floor(r.deg)) * 60;
      return (
        <>
          en degrés, minutes, secondes : {nombre(r.deg - Math.floor(r.deg), 4)} × 60 = {nombre(minutes, 2)}′ ; {nombre(minutes - Math.floor(minutes), 4)} × 60 = {nombre(v.s, 1)}″ →{' '}
          <strong>{ecrireDMS(r.deg)}</strong>
        </>
      );
    },
  },
  schema: ({ r }) => <Rapporteur deg={r.deg} />,
};

// ---------- Le hauban : triangle rectangle (N0.4.2) ----------
type ResHauban = TriangleRect & { h: number; d: number };

const hauban: DefinitionCalcul<ResHauban> = {
  champs: [
    { cle: 'h', libelle: 'hauteur d’attache sur le mât', symbole: 'h', unite: 'm', min: 1, max: 30, pas: 0.05, decimales: 2 },
    { cle: 'd', libelle: 'distance de l’ancrage au pied du mât', symbole: 'd', unite: 'm', min: 0.5, max: 30, pas: 0.05, decimales: 2 },
  ],
  defaut: { h: 8, d: 6 },
  calculer: (e) => {
    const h = num(e, 'h');
    const d = num(e, 'd');
    return { ...rectDeuxCotes(h, d), h, d };
  },
  valeurs: {
    L: (r) => grandeur(r.c, 2, 'm'),
    alpha: (r) => deg(r.alpha),
    beta: (r) => deg(r.beta),
  },
  lignes: {
    pythagore: (r) => (
      <>
        L² = h² + d² = {n2(r.h)}² + {n2(r.d)}² = {n2(r.c * r.c)} m² → L = √{n2(r.c * r.c)} = <strong>{n2(r.c)} m</strong>
      </>
    ),
    tan: (r) => (
      <>
        tan α = h / d = {n2(r.h)} / {n2(r.d)} = {nombre(r.h / r.d, 4)} → α = atan({nombre(r.h / r.d, 4)}) = <strong>{deg(r.alpha)}</strong>
      </>
    ),
    beta: (r) => (
      <>
        β = 90° − α = 90° − {deg(r.alpha)} = <strong>{deg(r.beta)}</strong>
      </>
    ),
    verif: (r) => (
      <>
        contrôle : sin α = h / L = {n2(r.h)} / {n2(r.c)} = {nombre(r.h / r.c, 4)} et sin {deg(r.alpha)} = {nombre(sinD(r.alpha), 4)} ✓
      </>
    ),
  },
  schema: ({ r }) => <MatHauban h={r.h} d={r.d} />,
};

// ---------- Écritures d'une pente (N0.4.3) ----------
type ResPente = EcrituresPente & { valeur: number; notation: NotationPente; H: number; L: number; rampant: number };

const NOTATIONS: Array<{ valeur: NotationPente; libelle: string }> = [
  { valeur: 'n', libelle: 'rapport n pour 1 (base pour 1 de hauteur)' },
  { valeur: 'pourcent', libelle: 'pourcentage (%)' },
  { valeur: 'pourmille', libelle: 'pour mille (‰)' },
  { valeur: 'deg', libelle: 'angle en degrés (°)' },
  { valeur: 'gon', libelle: 'angle en grades (gon)' },
];

const departPente = (r: ResPente) => {
  switch (r.notation) {
    case 'n':
      return <>talus à {nombre(r.valeur, 2)} pour 1 → p = 1 / {nombre(r.valeur, 2)}</>;
    case 'pourcent':
      return <>p = {nombre(r.valeur, 2)} / 100</>;
    case 'pourmille':
      return <>p = {nombre(r.valeur, 1)} / 1 000</>;
    case 'deg':
      return <>p = tan {deg(r.valeur)}</>;
    case 'gon':
      return <>p = tan({nombre(r.valeur, 2)} gon)</>;
  }
};

const penteDef: DefinitionCalcul<ResPente> = {
  champs: [
    { cle: 'valeur', libelle: 'valeur lue sur le plan', symbole: 'x', unite: '', min: 0.01, max: 1000, pas: 0.01, decimales: 2 },
    { type: 'choix', cle: 'notation', libelle: 'écriture de la pente', symbole: 'notation', options: NOTATIONS },
    { cle: 'H', libelle: 'dénivelé à franchir', symbole: 'H', unite: 'm', min: 0.1, max: 20, pas: 0.05, decimales: 2 },
  ],
  defaut: { valeur: 1.5, notation: 'n', H: 2.4 },
  calculer: (e) => {
    const valeur = num(e, 'valeur');
    const notation = String(e.notation) as NotationPente;
    const H = num(e, 'H');
    const p = penteDepuis(valeur, notation);
    const a = appliquerPente(p, H);
    return { ...ecrituresPente(p), valeur, notation, H, L: a.L, rampant: a.rampant };
  },
  valeurs: {
    pourcent: (r) => `${nombre(r.pourcent, 2)} %`,
    deg: (r) => deg(r.deg),
    gon: (r) => `${nombre(r.gon, 2)} gon`,
    n: (r) => `${nombre(r.n, 2)} pour 1`,
    L: (r) => grandeur(r.L, 2, 'm'),
    rampant: (r) => grandeur(r.rampant, 2, 'm'),
  },
  lignes: {
    p: (r) => (
      <>
        {departPente(r)} = <strong>{nombre(r.p, 4)} m/m</strong>
      </>
    ),
    ecritures: (r) => (
      <>
        {nombre(r.pourcent, 2)} % = {nombre(r.pourmille, 1)} ‰ ; α = atan {nombre(r.p, 4)} = {deg(r.deg)} = {nombre(r.gon, 2)} gon ; rapport : {nombre(r.n, 2)} pour 1
      </>
    ),
    application: (r) => (
      <>
        base = H / p = {n2(r.H)} / {nombre(r.p, 4)} = <strong>{n2(r.L)} m</strong> ; rampant = √({n2(r.L)}² + {n2(r.H)}²) = <strong>{n2(r.rampant)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <TalusPente H={r.H} n={r.n} />,
  alerte: (r) =>
    (r.notation === 'deg' && r.valeur >= 90) || (r.notation === 'gon' && r.valeur >= 100) ? 'Un angle de pente est inférieur à 90° (100 gon) : à la verticale, la pente n’existe plus.' : undefined,
};

// ---------- Composantes d'une force (N0.4.4) ----------
type ResComposantes = Composantes & { F: number; theta: number };

const QUADRANTS = ['portée par un axe', 'I : Fx > 0 et Fy > 0', 'II : Fx < 0 et Fy > 0', 'III : Fx < 0 et Fy < 0', 'IV : Fx > 0 et Fy < 0'];

const composantesDef: DefinitionCalcul<ResComposantes> = {
  champs: [
    { cle: 'F', libelle: 'intensité de la force', symbole: 'F', unite: 'kN', min: 0.1, max: 100, pas: 0.1, decimales: 2 },
    { cle: 'theta', libelle: 'angle avec l’horizontale (sens trigonométrique)', symbole: 'θ', unite: '°', min: 0, max: 360, pas: 0.01, decimales: 2 },
  ],
  defaut: { F: 12, theta: arrondi(rectDeuxCotes(8, 6).alpha, 2) },
  calculer: (e) => {
    const F = num(e, 'F');
    const theta = num(e, 'theta');
    return { ...composantes(F, theta), F, theta };
  },
  valeurs: {
    Fx: (r) => grandeur(r.Fx, 2, 'kN'),
    Fy: (r) => grandeur(r.Fy, 2, 'kN'),
    quadrant: (r) => QUADRANTS[r.quadrant]!,
  },
  lignes: {
    Fx: (r) => (
      <>
        Fx = F × cos θ = {n2(r.F)} × cos {deg(r.theta)} = {n2(r.F)} × {nombre(cosD(r.theta), 4)} = <strong>{grandeur(r.Fx, 2, 'kN')}</strong>
      </>
    ),
    Fy: (r) => (
      <>
        Fy = F × sin θ = {n2(r.F)} × sin {deg(r.theta)} = {n2(r.F)} × {nombre(sinD(r.theta), 4)} = <strong>{grandeur(r.Fy, 2, 'kN')}</strong>
      </>
    ),
    verif: (r) => (
      <>
        contrôle : √(Fx² + Fy²) = √({n2(r.Fx)}² + {n2(r.Fy)}²) = {grandeur(Math.hypot(r.Fx, r.Fy), 2, 'kN')} = F ✓, car cos² θ + sin² θ = 1
      </>
    ),
    signes: (r) => <>quadrant {QUADRANTS[r.quadrant]}</>,
  },
  schema: ({ r }) => <CercleForce F={r.F} theta={r.theta} />,
};

// ---------- Distance inaccessible : Al-Kashi (N0.4.5) ----------
type ResStation = Triangle & { SA: number; SB: number; angle: number; unite: UniteAngle; Sdeg: number };

const station: DefinitionCalcul<ResStation> = {
  champs: [
    { cle: 'SA', libelle: 'distance mesurée de S à A', symbole: 'SA', unite: 'm', min: 1, max: 500, pas: 0.01, decimales: 2 },
    { cle: 'SB', libelle: 'distance mesurée de S à B', symbole: 'SB', unite: 'm', min: 1, max: 500, pas: 0.01, decimales: 2 },
    { cle: 'angle', libelle: 'angle mesuré en S', symbole: 'Ŝ', unite: '', min: 1, max: 199, pas: 0.0001, decimales: 4 },
    {
      type: 'choix',
      cle: 'unite',
      libelle: 'unité de l’angle',
      symbole: 'u',
      options: [
        { valeur: 'gon', libelle: 'grades (gon)' },
        { valeur: 'deg', libelle: 'degrés (°)' },
      ],
    },
  ],
  defaut: { SA: 42.3, SB: 35.8, angle: 58.4, unite: 'gon' },
  calculer: (e) => {
    const SA = num(e, 'SA');
    const SB = num(e, 'SB');
    const angle = num(e, 'angle');
    const unite = String(e.unite) as UniteAngle;
    const Sdeg = convertirAngle(angle, unite, 'deg');
    return { ...triangleCAC(SA, SB, Sdeg), SA, SB, angle, unite, Sdeg };
  },
  valeurs: {
    AB: (r) => grandeur(r.a, 2, 'm'),
    angleA: (r) => deg(r.C),
    angleB: (r) => deg(r.B),
    aire: (r) => grandeur(r.aire, 1, 'm²'),
  },
  lignes: {
    conversion: (r) =>
      r.unite === 'gon' ? (
        <>
          angle en S : {nombre(r.angle, 4)} gon × 360 / 400 = <strong>{deg(r.Sdeg, 4)}</strong>
        </>
      ) : (
        <>angle en S : {deg(r.Sdeg, 4)}</>
      ),
    kashi: (r) => (
      <>
        AB² = SA² + SB² − 2 × SA × SB × cos Ŝ = {n2(r.SA)}² + {n2(r.SB)}² − 2 × {n2(r.SA)} × {n2(r.SB)} × {nombre(cosD(r.Sdeg), 4)} = {n2(r.a * r.a)} → AB ={' '}
        <strong>{n2(r.a)} m</strong>
      </>
    ),
    angles: (r) => (
      <>
        cos B̂ = (AB² + SB² − SA²) / (2 × AB × SB) → B̂ = <strong>{deg(r.B)}</strong> ; Â = 180° − Ŝ − B̂ = <strong>{deg(r.C)}</strong>
      </>
    ),
    sinus: (r) => (
      <>
        contrôle (loi des sinus) : AB / sin Ŝ = {n2(r.a / sinD(r.Sdeg))} ; SA / sin B̂ = {n2(r.SA / sinD(r.B))} ; SB / sin Â = {n2(r.SB / sinD(r.C))} ✓
      </>
    ),
    aire: (r) => (
      <>
        aire du triangle = ½ × SA × SB × sin Ŝ = <strong>{grandeur(r.aire, 1, 'm²')}</strong>
      </>
    ),
  },
  schema: ({ r }) => <TriangleStation SA={r.SA} SB={r.SB} angleS={r.Sdeg} t={r} />,
};

// ---------- Toiture à deux versants (N0.4.6) ----------
type ResToiture = ResultatToiture & { d: DonneesToiture };

const toitureDef: DefinitionCalcul<ResToiture> = {
  champs: [
    { cle: 'L', libelle: 'portée (d’un mur à l’autre)', symbole: 'L', unite: 'm', min: 3, max: 20, pas: 0.05, decimales: 2 },
    { cle: 'longueur', libelle: 'longueur du bâtiment', symbole: 'Lb', unite: 'm', min: 3, max: 40, pas: 0.05, decimales: 2 },
    { cle: 'pente', libelle: 'pente des versants (énoncé)', symbole: 'p', unite: '%', min: 5, max: 100, pas: 0.5, decimales: 1 },
    { cle: 'debord', libelle: 'débord horizontal', symbole: 'd', unite: 'm', min: 0, max: 1.5, pas: 0.05, decimales: 2 },
  ],
  defaut: { ...EXEMPLE_TOITURE },
  calculer: (e) => {
    const d = { L: num(e, 'L'), longueur: num(e, 'longueur'), pente: num(e, 'pente'), debord: num(e, 'debord') };
    return { ...toiture(d), d };
  },
  valeurs: {
    alpha: (r) => deg(r.alpha),
    h: (r) => grandeur(r.h, 2, 'm'),
    rampant: (r) => grandeur(r.rampant, 2, 'm'),
    rampantTotal: (r) => grandeur(r.rampantTotal, 2, 'm'),
    surface: (r) => grandeur(r.surface, 1, 'm²'),
  },
  lignes: {
    alpha: (r) => (
      <>
        α = atan(p) = atan {nombre(r.p, 3)} = <strong>{deg(r.alpha)}</strong>
      </>
    ),
    h: (r) => (
      <>
        h = (L / 2) × p = {n2(r.d.L / 2)} × {nombre(r.p, 3)} = <strong>{n2(r.h)} m</strong>
      </>
    ),
    rampant: (r) => (
      <>
        rampant = (L / 2) / cos α = {n2(r.d.L / 2)} / {nombre(cosD(r.alpha), 4)} = <strong>{n2(r.rampant)} m</strong> (contrôle : √({n2(r.d.L / 2)}² + {n2(r.h)}²) = {n2(Math.hypot(r.d.L / 2, r.h))} m ✓)
      </>
    ),
    total: (r) => (
      <>
        avec débord : (L / 2 + d) / cos α = {n2(r.d.L / 2 + r.d.debord)} / {nombre(cosD(r.alpha), 4)} = <strong>{n2(r.rampantTotal)} m</strong>
      </>
    ),
    surface: (r) => (
      <>
        couverture : 2 × {n2(r.rampantTotal)} × {n2(r.d.longueur)} = <strong>{grandeur(r.surface, 1, 'm²')}</strong>
      </>
    ),
  },
  schema: ({ r }) => <ToitureElevation d={r.d} r={r} />,
};

// ---------- Ferme en W (mini-projet N0.4.P) ----------
type ResFerme = ResultatFerme & { d: DonneesFerme };

const fermeDef: DefinitionCalcul<ResFerme> = {
  champs: [
    { cle: 'L', libelle: 'portée (entrait)', symbole: 'L', unite: 'm', min: 4, max: 16, pas: 0.05, decimales: 2 },
    { cle: 'alpha', libelle: 'pente des arbalétriers', symbole: 'α', unite: '°', min: 10, max: 45, pas: 0.5, decimales: 1 },
    { cle: 'debord', libelle: 'débord horizontal', symbole: 'd', unite: 'm', min: 0, max: 1.2, pas: 0.05, decimales: 2 },
    { cle: 'longueurBatiment', libelle: 'longueur du bâtiment', symbole: 'Lb', unite: 'm', min: 3, max: 40, pas: 0.05, decimales: 2 },
    { cle: 'entraxe', libelle: 'entraxe des fermes (énoncé)', symbole: 'e', unite: 'm', min: 0.6, max: 6, pas: 0.05, decimales: 2 },
  ],
  defaut: { ...EXEMPLE_FERME },
  calculer: (e) => {
    const d = { L: num(e, 'L'), alpha: num(e, 'alpha'), debord: num(e, 'debord'), longueurBatiment: num(e, 'longueurBatiment'), entraxe: num(e, 'entraxe') };
    return { ...ferme(d), d };
  },
  valeurs: {
    h: (r) => grandeur(r.h, 2, 'm'),
    arbaletrier: (r) => grandeur(r.arbaletrier, 2, 'm'),
    arbaletrierDebord: (r) => grandeur(r.arbaletrierDebord, 2, 'm'),
    diagCourte: (r) => grandeur(r.diagCourte, 2, 'm'),
    diagLongue: (r) => grandeur(r.diagLongue, 2, 'm'),
    gamma: (r) => deg(r.gamma, 1),
    nbFermes: (r) => `${r.nbFermes} fermes`,
    total: (r) => grandeur(r.longueurTotale, 1, 'm'),
  },
  lignes: {
    h: (r) => (
      <>
        h = (L / 2) × tan α = {n2(r.d.L / 2)} × tan {deg(r.d.alpha, 1)} = {n2(r.d.L / 2)} × {nombre(Math.tan((r.d.alpha * Math.PI) / 180), 4)} = <strong>{n2(r.h)} m</strong>
      </>
    ),
    arbaletrier: (r) => (
      <>
        arbalétrier A–S = (L / 2) / cos α = {n2(r.d.L / 2)} / {nombre(cosD(r.d.alpha), 4)} = <strong>{n2(r.arbaletrier)} m</strong> ; avec débord : {n2(r.d.L / 2 + r.d.debord)} / {nombre(cosD(r.d.alpha), 4)} ={' '}
        <strong>{n2(r.arbaletrierDebord)} m</strong>
      </>
    ),
    courte: (r) => (
      <>
        diagonale D1–M1 : Δx = L/12 = {nombre(r.d.L / 12, 3)} m, Δy = h/2 = {nombre(r.h / 2, 3)} m → √({nombre(r.d.L / 12, 3)}² + {nombre(r.h / 2, 3)}²) = <strong>{n2(r.diagCourte)} m</strong>
      </>
    ),
    longue: (r) => (
      <>
        diagonale D1–S : Δx = L/6 = {nombre(r.d.L / 6, 3)} m, Δy = h = {nombre(r.h, 3)} m → √({nombre(r.d.L / 6, 3)}² + {nombre(r.h, 3)}²) = <strong>{n2(r.diagLongue)} m</strong>
      </>
    ),
    gamma: (r) => (
      <>
        inclinaison des diagonales sur l’entrait : γ = atan(Δy / Δx) = atan({nombre(r.h, 3)} / {nombre(r.d.L / 6, 3)}) = <strong>{deg(r.gamma, 1)}</strong>
      </>
    ),
    angles: (r) => (
      <>
        {r.angles.map((a, i) => (
          <span key={i}>
            {i ? ' ; ' : ''}
            {a.noeud} ({a.entre}) : <strong>{deg(a.valeur, 1)}</strong>
          </span>
        ))}
      </>
    ),
    controle: (r) => {
      const d1 = r.angles.filter((a) => a.noeud === 'D1').reduce((s, a) => s + a.valeur, 0);
      const m1 = r.angles.filter((a) => a.noeud === 'M1').reduce((s, a) => s + a.valeur, 0);
      return (
        <>
          contrôles : en D1, {deg(d1, 1)} (les trois angles remplissent un demi-tour) ; en M1, {deg(m1, 1)} (l’arbalétrier est droit) ✓
        </>
      );
    },
    debit: (r) => (
      <>
        {n2(r.d.longueurBatiment)} / {n2(r.d.entraxe)} = {nombre(r.d.longueurBatiment / r.d.entraxe, 2)} travées → <strong>{r.nbFermes} fermes</strong> ; par ferme (axes) {n2(r.longueurParFerme)} m ; total avec débords{' '}
        <strong>{grandeur(r.longueurTotale, 1, 'm')}</strong>
      </>
    ),
  },
  schema: ({ r }) => <FermeW r={r} debord={r.d.debord} />,
};

export const CALCULS_TRIGO = {
  angles,
  hauban,
  pente: penteDef,
  composantes: composantesDef,
  station,
  toiture: toitureDef,
  ferme: fermeDef,
} as const;
