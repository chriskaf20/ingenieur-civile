// Fiches de calcul du module N0.6 (vecteurs). Les valeurs viennent de lib/calc/vecteurs.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { ElinguesSchema, EquerrageSchema, HaubanForce, MatPlan, MomentSchema, PolygoneForces } from '@/components/schemas/Vecteurs';
import { cosD, sinD } from '@/lib/calc/trigo';
import {
  elingues,
  enveloppeMat,
  equerrage,
  EXEMPLE_ANNEAU,
  EXEMPLE_ELINGUES,
  EXEMPLE_EQUERRAGE,
  EXEMPLE_FORCE_CABLE,
  EXEMPLE_MAT,
  EXEMPLE_MOMENT,
  forceCable,
  matHaubane,
  momentForce,
  sommeForces,
  type DonneesElingues,
  type DonneesEquerrage,
  type DonneesForceCable,
  type DonneesMat,
  type DonneesMoment,
  type EnveloppeMat,
  type ResultatElingues,
  type ResultatEquerrage,
  type ResultatForceCable,
  type ResultatMat,
  type ResultatMoment,
  type ResultatSomme,
} from '@/lib/calc/vecteurs';
import { arrondi, grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
/** Nombre entre parenthèses s'il est négatif : (−8,00)². */
const p2 = (x: number) => (x < 0 ? `(${n2(x)})` : n2(x));
const vec2 = (v: readonly number[], dec = 2) => `(${nombre(v[0] ?? 0, dec)} ; ${nombre(v[1] ?? 0, dec)})`;
const deg = (x: number, d = 2) => `${nombre(x, d)}°`;

const longueur = (cle: string, libelle: string, symbole: string, min: number, max: number) =>
  ({ cle, libelle, symbole, unite: 'm', min, max, pas: 0.01, decimales: 2 }) as const;
const force = (cle: string, libelle: string, symbole: string, max = 100) => ({ cle, libelle, symbole, unite: 'kN', min: 0, max, pas: 0.1, decimales: 2 }) as const;
const angle = (cle: string, libelle: string, symbole: string, min = 0, max = 360) => ({ cle, libelle, symbole, unite: '°', min, max, pas: 0.01, decimales: 2 }) as const;

// ---------- La force d'un câble (N0.6.1) ----------
type ResCable = ResultatForceCable & { d: DonneesForceCable };

const vecteurForce: DefinitionCalcul<ResCable> = {
  champs: [
    longueur('xA', 'abscisse du point d’attache A', 'xA', -20, 20),
    longueur('yA', 'ordonnée du point d’attache A', 'yA', -5, 30),
    longueur('xB', 'abscisse de l’ancrage B', 'xB', -20, 20),
    longueur('yB', 'ordonnée de l’ancrage B', 'yB', -5, 30),
    force('T', 'tension du câble', 'T'),
    { cle: 'echelle', libelle: 'échelle des forces', symbole: 'e', unite: 'kN/cm', min: 0.5, max: 20, pas: 0.5, decimales: 1 },
  ],
  defaut: { ...EXEMPLE_FORCE_CABLE },
  calculer: (e) => {
    const d = { xA: num(e, 'xA'), yA: num(e, 'yA'), xB: num(e, 'xB'), yB: num(e, 'yB'), T: num(e, 'T'), echelle: num(e, 'echelle') };
    if (d.xA === d.xB && d.yA === d.yB) {
      return { AB: [0, 0], L: 0, u: [0, 0], F: [0, 0], theta: 0, fleche: 0, d };
    }
    return { ...forceCable(d), d };
  },
  valeurs: {
    F: (r) => `${vec2(r.F)} kN`,
    theta: (r) => deg(r.theta),
    L: (r) => grandeur(r.L, 2, 'm'),
    fleche: (r) => grandeur(r.fleche, 1, 'cm'),
    T: (r) => grandeur(r.d.T, 2, 'kN'),
  },
  lignes: {
    AB: (r) => (
      <>
        AB = (xB − xA ; yB − yA) = ({n2(r.d.xB)} − {p2(r.d.xA)} ; {n2(r.d.yB)} − {p2(r.d.yA)}) = <strong>{vec2(r.AB)} m</strong>
      </>
    ),
    L: (r) => (
      <>
        ‖AB‖ = √({p2(r.AB[0] ?? 0)}² + {p2(r.AB[1] ?? 0)}²) = <strong>{n2(r.L)} m</strong>
      </>
    ),
    u: (r) => (
      <>
        û = AB / ‖AB‖ = <strong>{vec2(r.u, 3)}</strong> (norme 1, il ne donne que la direction et le sens)
      </>
    ),
    F: (r) => (
      <>
        F = T × û = {n2(r.d.T)} × {vec2(r.u, 3)} = <strong>{vec2(r.F)} kN</strong>
      </>
    ),
    theta: (r) => (
      <>
        direction : θ = {deg(r.theta)} depuis l’axe x (sens trigonométrique)
      </>
    ),
    fleche: (r) => (
      <>
        dessin : {n2(r.d.T)} kN ÷ {nombre(r.d.echelle, 1)} kN/cm = <strong>{nombre(r.fleche, 1)} cm</strong> de flèche
      </>
    ),
  },
  schema: ({ r }) => <HaubanForce d={r.d} r={r} />,
  alerte: (r) => (r.L === 0 ? 'A et B sont confondus : le câble n’a pas de direction.' : undefined),
};

// ---------- Somme de forces (N0.6.2) ----------
type ResSomme = ResultatSomme & { liste: Array<{ F: number; theta: number }> };

const sommeDef: DefinitionCalcul<ResSomme> = {
  champs: [
    force('F1', 'première force', 'F₁'),
    angle('t1', 'direction de F₁', 'θ₁'),
    force('F2', 'deuxième force', 'F₂'),
    angle('t2', 'direction de F₂', 'θ₂'),
    force('F3', 'troisième force (0 si absente)', 'F₃'),
    angle('t3', 'direction de F₃', 'θ₃'),
  ],
  defaut: { F1: EXEMPLE_ANNEAU[0]!.F, t1: EXEMPLE_ANNEAU[0]!.theta, F2: EXEMPLE_ANNEAU[1]!.F, t2: EXEMPLE_ANNEAU[1]!.theta, F3: 0, t3: 0 },
  calculer: (e) => {
    const liste = [
      { F: num(e, 'F1'), theta: num(e, 't1') },
      { F: num(e, 'F2'), theta: num(e, 't2') },
      { F: num(e, 'F3'), theta: num(e, 't3') },
    ].filter((f) => f.F !== 0);
    return { ...sommeForces(liste), liste };
  },
  valeurs: {
    R: (r) => grandeur(r.norme, 2, 'kN'),
    theta: (r) => deg(r.theta),
    Rv: (r) => `${vec2(r.R)} kN`,
  },
  lignes: {
    composantes: (r) => (
      <>
        {r.liste.map((f, i) => (
          <span key={i}>
            {i ? ' ; ' : ''}F{i + 1} = ({n2(f.F)} cos {deg(f.theta, 0)} ; {n2(f.F)} sin {deg(f.theta, 0)}) = {vec2(r.forces[i]!)}
          </span>
        ))}{' '}
        kN
      </>
    ),
    somme: (r) => (
      <>
        R = (Σ Fx ; Σ Fy) = ({r.forces.map((f) => p2(f[0])).join(' + ')} ; {r.forces.map((f) => p2(f[1])).join(' + ')}) = <strong>{vec2(r.R)} kN</strong>
      </>
    ),
    norme: (r) => (
      <>
        ‖R‖ = √({p2(r.R[0] ?? 0)}² + {p2(r.R[1] ?? 0)}²) = <strong>{n2(r.norme)} kN</strong>
      </>
    ),
    direction: (r) => (
      <>
        direction : θR = <strong>{deg(r.theta)}</strong> (quadrant donné par les signes de Rx et Ry)
      </>
    ),
  },
  schema: ({ r }) => <PolygoneForces s={r} />,
  alerte: (r) => (r.forces.length === 0 ? 'Aucune force : entre au moins une force non nulle.' : undefined),
};

// ---------- Élingage (N0.6.3) ----------
type ResElingues = ResultatElingues & { d: DonneesElingues };

const elinguesDef: DefinitionCalcul<ResElingues> = {
  champs: [force('P', 'poids de la charge', 'P', 500), angle('alpha1', 'angle du brin gauche avec l’horizontale', 'α₁', 5, 90), angle('alpha2', 'angle du brin droit avec l’horizontale', 'α₂', 5, 90)],
  defaut: { ...EXEMPLE_ELINGUES },
  calculer: (e) => {
    const d = { P: num(e, 'P'), alpha1: num(e, 'alpha1'), alpha2: num(e, 'alpha2') };
    return { ...elingues(d), d };
  },
  valeurs: {
    T1: (r) => grandeur(r.T1, 2, 'kN'),
    T2: (r) => grandeur(r.T2, 2, 'kN'),
    Tmax: (r) => grandeur(Math.max(r.T1, r.T2), 2, 'kN'),
    sommet: (r) => deg(r.angleSommet, 0),
    rapport: (r) => nombre(r.rapport, 2),
  },
  lignes: {
    equilibre: () => (
      <>
        équilibre du crochet : horizontalement T1 cos α1 = T2 cos α2 ; verticalement T1 sin α1 + T2 sin α2 = P
      </>
    ),
    T1: (r) => (
      <>
        T1 = P cos α2 / sin(α1 + α2) = {n2(r.d.P)} × cos {deg(r.d.alpha2, 0)} / sin {deg(r.d.alpha1 + r.d.alpha2, 0)} = <strong>{n2(r.T1)} kN</strong>
      </>
    ),
    T2: (r) => (
      <>
        T2 = P cos α1 / sin(α1 + α2) = {n2(r.d.P)} × cos {deg(r.d.alpha1, 0)} / sin {deg(r.d.alpha1 + r.d.alpha2, 0)} = <strong>{n2(r.T2)} kN</strong>
      </>
    ),
    verif: (r) => (
      <>
        contrôle : T1 sin α1 + T2 sin α2 = {n2(r.T1 * sinD(r.d.alpha1))} + {n2(r.T2 * sinD(r.d.alpha2))} = {n2(r.T1 * sinD(r.d.alpha1) + r.T2 * sinD(r.d.alpha2))} kN = P ✓ ; écart horizontal{' '}
        {n2(r.T1 * cosD(r.d.alpha1) - r.T2 * cosD(r.d.alpha2))} kN ✓
      </>
    ),
    sommet: (r) => (
      <>
        angle entre les brins : 180° − {deg(r.d.alpha1, 0)} − {deg(r.d.alpha2, 0)} = <strong>{deg(r.angleSommet, 0)}</strong> ; le brin le plus chargé porte {nombre(r.rapport, 2)} fois le poids
      </>
    ),
  },
  schema: ({ r }) => <ElinguesSchema d={r.d} r={r} prefixe="el-fiche" />,
  alerte: (r) =>
    !r.valide
      ? 'Angles impossibles : la somme α1 + α2 doit rester inférieure à 180°.'
      : r.angleSommet > 120
        ? `Angle au sommet de ${nombre(r.angleSommet, 0)}° : chaque brin porte plus que le poids (${nombre(r.rapport, 2)} fois). Règle de l’art : ne pas dépasser 120°.`
        : undefined,
};

// ---------- Angle entre deux directions (N0.6.4) ----------
type ResEquerrage = ResultatEquerrage & { d: DonneesEquerrage };

const coord = (cle: string, libelle: string, symbole: string) => ({ cle, libelle, symbole, unite: 'm', min: 0, max: 1000, pas: 0.01, decimales: 2 }) as const;

const angleDirections: DefinitionCalcul<ResEquerrage> = {
  champs: [coord('xA', 'sommet A, abscisse', 'xA'), coord('yA', 'sommet A, ordonnée', 'yA'), coord('xB', 'point B, abscisse', 'xB'), coord('yB', 'point B, ordonnée', 'yB'), coord('xD', 'point D, abscisse', 'xD'), coord('yD', 'point D, ordonnée', 'yD')],
  defaut: { ...EXEMPLE_EQUERRAGE },
  calculer: (e) => {
    const d = { xA: num(e, 'xA'), yA: num(e, 'yA'), xB: num(e, 'xB'), yB: num(e, 'yB'), xD: num(e, 'xD'), yD: num(e, 'yD') };
    return { ...equerrage(d), d };
  },
  valeurs: {
    theta: (r) => deg(r.theta, 3),
    ecart: (r) => deg(r.ecart, 3),
    decalage: (r) => grandeur(r.decalage * 100, 1, 'cm'),
    produit: (r) => grandeur(r.produit, 2, 'm²'),
  },
  lignes: {
    vecteurs: (r) => (
      <>
        AB = {vec2(r.AB)} m ; AD = {vec2(r.AD)} m
      </>
    ),
    produit: (r) => (
      <>
        AB · AD = {n2(r.AB[0] ?? 0)} × {p2(r.AD[0] ?? 0)} + {n2(r.AB[1] ?? 0)} × {p2(r.AD[1] ?? 0)} = <strong>{n2(r.produit)} m²</strong>
      </>
    ),
    normes: (r) => (
      <>
        ‖AB‖ = {n3(r.nAB)} m ; ‖AD‖ = {n3(r.nAD)} m
      </>
    ),
    cos: (r) => (
      <>
        cos θ = AB · AD / (‖AB‖ ‖AD‖) = {n2(r.produit)} / ({n3(r.nAB)} × {n3(r.nAD)}) = {nombre(r.cos, 5)} → <strong>θ = {deg(r.theta, 3)}</strong>
      </>
    ),
    decalage: (r) => (
      <>
        écart avec l’angle droit : {deg(r.ecart, 3)} ; correction de D : {n2(r.nAD)} × tan {deg(Math.abs(r.ecart), 3)} = <strong>{nombre(r.decalage * 100, 1)} cm</strong>
      </>
    ),
  },
  schema: ({ r }) => <EquerrageSchema d={r.d} r={r} />,
  alerte: (r) => (!Number.isFinite(r.theta) ? 'Deux points sont confondus avec A : l’angle n’existe pas.' : undefined),
};

// ---------- Moment d'une force (N0.6.5) ----------
type ResMoment = ResultatMoment & { d: DonneesMoment };

const momentDef: DefinitionCalcul<ResMoment> = {
  champs: [longueur('xA', 'point d’application, abscisse', 'xA', -20, 20), longueur('yA', 'point d’application, ordonnée', 'yA', -20, 30), force('F', 'intensité de la force', 'F'), angle('theta', 'direction de la force', 'θ')],
  defaut: { ...EXEMPLE_MOMENT, theta: arrondi(EXEMPLE_MOMENT.theta, 2) },
  calculer: (e) => {
    const d = { xA: num(e, 'xA'), yA: num(e, 'yA'), F: num(e, 'F'), theta: num(e, 'theta') };
    return { ...momentForce(d), d };
  },
  valeurs: {
    M: (r) => grandeur(r.M, 2, 'kN·m'),
    bras: (r) => grandeur(r.bras, 2, 'm'),
    sens: (r) => (r.sens === 'nul' ? 'moment nul' : `sens ${r.sens}`),
  },
  lignes: {
    composantes: (r) => (
      <>
        F = (F cos θ ; F sin θ) = ({n2(r.d.F)} cos {deg(r.d.theta)} ; {n2(r.d.F)} sin {deg(r.d.theta)}) = <strong>{vec2(r.Fv)} kN</strong>
      </>
    ),
    M: (r) => (
      <>
        M_O = xA × Fy − yA × Fx = {n2(r.d.xA)} × {p2(r.Fv[1])} − {n2(r.d.yA)} × {p2(r.Fv[0])} = <strong>{n2(r.M)} kN·m</strong>
      </>
    ),
    bras: (r) => (
      <>
        bras de levier : d = |M_O| / F = {n2(Math.abs(r.M))} / {n2(r.d.F)} = <strong>{n2(r.bras)} m</strong>
      </>
    ),
    sens: (r) => <>{r.sens === 'nul' ? 'M = 0 : la ligne d’action passe par O' : r.sens === 'horaire' ? 'M négatif : rotation dans le sens horaire' : 'M positif : rotation dans le sens trigonométrique'}</>,
  },
  schema: ({ r }) => <MomentSchema d={r.d} r={r} prefixe="mom-fiche" />,
};

// ---------- Mât haubané (N0.6.P) ----------
type ResMat = ResultatMat & { d: DonneesMat; env: EnveloppeMat };

const matDef: DefinitionCalcul<ResMat> = {
  champs: [
    longueur('h', 'hauteur d’attache des haubans', 'h', 2, 40),
    longueur('r', 'distance des ancrages au pied du mât', 'r', 1, 40),
    force('H', 'effort horizontal en tête (énoncé)', 'H', 50),
    angle('psi', 'direction de l’effort', 'ψ'),
    angle('phi0', 'direction du premier ancrage', 'φ₀'),
    { cle: 'marge', libelle: 'longueur ajoutée par hauban (énoncé)', symbole: 'm', unite: 'm', min: 0, max: 3, pas: 0.1, decimales: 1 },
  ],
  defaut: { ...EXEMPLE_MAT },
  calculer: (e) => {
    const d = { h: num(e, 'h'), r: num(e, 'r'), H: num(e, 'H'), psi: num(e, 'psi'), phi0: num(e, 'phi0'), marge: num(e, 'marge') };
    return { ...matHaubane(d), d, env: enveloppeMat(d) };
  },
  valeurs: {
    L: (r) => grandeur(r.L, 2, 'm'),
    alpha: (r) => deg(r.alpha),
    Tmax: (r) => grandeur(Math.max(...r.haubans.map((h) => h.T)), 2, 'kN'),
    N: (r) => grandeur(r.N, 2, 'kN'),
    cable: (r) => grandeur(r.cable, 2, 'm'),
    Tenv: (r) => grandeur(r.env.Tmax, 2, 'kN'),
    psiEnv: (r) => deg(r.env.psiMax, 0),
  },
  lignes: {
    geometrie: (r) => (
      <>
        L = √(h² + r²) = √({n2(r.d.h)}² + {n2(r.d.r)}²) = <strong>{n2(r.L)} m</strong> ; tan α = h / r = {n3(r.d.h / r.d.r)} → α = {deg(r.alpha)}
      </>
    ),
    cible: (r) => (
      <>
        les haubans doivent fournir, à l’horizontale, {n2(r.d.H)} kN dans la direction ψ + 180° = <strong>{deg((r.d.psi + 180) % 360, 0)}</strong>
      </>
    ),
    repartition: (r) => (
      <>
        {r.haubans.map((h, i) => (
          <span key={h.phi}>
            {i ? ' ; ' : ''}hauban {deg(h.phi, 0)} : c = {n3(h.c)} kN
          </span>
        ))}{' '}
        (décomposition selon les deux haubans qui encadrent cette direction ; les autres sont détendus)
      </>
    ),
    tensions: (r) => (
      <>
        T = c × L / r :{' '}
        {r.haubans.map((h, i) => (
          <span key={h.phi}>
            {i ? ' ; ' : ''}
            {deg(h.phi, 0)} → <strong>{n2(h.T)} kN</strong>
          </span>
        ))}
      </>
    ),
    mat: (r) => (
      <>
        compression ajoutée au mât : N = Σ c × h / r = <strong>{n2(r.N)} kN</strong> ; arrachement de chaque ancrage : V = c × h / r
      </>
    ),
    controle: (r) => <>contrôle : somme des forces horizontales en tête = {n3(r.residu)} kN ✓</>,
    enveloppe: (r) => (
      <>
        en faisant tourner l’effort de 0 à 360° : T max = <strong>{n2(r.env.Tmax)} kN</strong> pour ψ = {deg(r.env.psiMax, 0)}
      </>
    ),
    cable: (r) => (
      <>
        câble : 3 × (L + m) = 3 × ({n2(r.L)} + {nombre(r.d.marge, 1)}) = <strong>{n2(r.cable)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <MatPlan d={r.d} r={r} />,
  alerte: (r) => (r.stable ? undefined : 'Mât instable : aucun couple de haubans ne peut retenir l’effort dans cette direction.'),
};

export const CALCULS_VECTEURS = {
  vecteurForce,
  sommeForces: sommeDef,
  elingues: elinguesDef,
  angleDirections,
  momentForce: momentDef,
  matHaubane: matDef,
} as const;
