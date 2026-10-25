// Fiches de calcul du module L1.2 (analyse). Les valeurs viennent de lib/calc/analyse.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { CableParabolique, CourbesNiveau, CubatureSchema, InertieBandes, MomentMaxSchema, PolygoneCercle, PoutreDeformee, ProfilRaccordement, SectionTInertieSchema, SommeRectangles, VentMat } from '@/components/schemas/Analyse';
import {
  chargeVariable,
  cubature,
  EXEMPLE_BANDES,
  EXEMPLE_CABLE,
  EXEMPLE_CHARGE_VARIABLE,
  EXEMPLE_CUBATURE,
  EXEMPLE_FLECHE,
  EXEMPLE_MOMENT_MAX,
  EXEMPLE_RACCORDEMENT,
  EXEMPLE_SECTION_T,
  EXEMPLE_TERRAIN,
  EXEMPLE_VENT_PUISSANCE,
  flecheLimite,
  flechePoutre,
  inertieParBandes,
  longueurCable,
  momentMax,
  penteSecante,
  polygoneInscrit,
  raccordement,
  sectionTInertie,
  terrain,
  ventPuissance,
  type DonneesBandes,
  type DonneesCable,
  type DonneesChargeVariable,
  type DonneesCubature,
  type DonneesFleche,
  type DonneesMomentMax,
  type DonneesRaccordement,
  type DonneesTerrain,
  type DonneesVentPuissance,
  type ResultatBandes,
  type ResultatChargeVariable,
  type ResultatCubature,
  type ResultatMomentMax,
  type ResultatPolygone,
  type ResultatTerrain,
  type ResultatTInertie,
  type ResultatVentPuissance,
} from '@/lib/calc/analyse';
import type { DonneesSectionT } from '@/lib/calc/geometrie';
import { grandeur, nombre, scientifique } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
/** Pente ou rapport sans dimension écrit en pourcentage. */
const pc = (x: number, dec = 2) => `${nombre(x * 100, dec)} %`;
/** Nombre entre parenthèses s'il est négatif : (−0,020). */
const par = (x: number, dec = 2) => (x < 0 ? `(${nombre(x, dec)})` : nombre(x, dec));

const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

// ---------- Polygones et π (L1.2.1) ----------
const polygoneDef: DefinitionCalcul<ResultatPolygone> = {
  champs: [champ('n', 'nombre de côtés du polygone', 'n', 'côtés', 3, 400, 1, 0)],
  defaut: { n: 6 },
  calculer: (e) => polygoneInscrit(Math.max(3, Math.round(num(e, 'n')))),
  valeurs: {
    inscrit: (r) => grandeur(r.inscrit, 6, 'm'),
    circonscrit: (r) => grandeur(r.circonscrit, 6, 'm'),
    ecart: (r) => grandeur(r.ecart, 6, 'm'),
    encadrement: (r) => `${nombre(r.inscrit, 4)} m < π × 1 m < ${nombre(r.circonscrit, 4)} m`,
  },
  lignes: {
    inscrit: (r) => (
      <>
        polygone inscrit : p<sub>n</sub> = n × sin(π/n) × 1 m = {r.n} × sin(π/{r.n}) × 1 m = <strong>{nombre(r.inscrit, 6)} m</strong>
      </>
    ),
    circonscrit: (r) => (
      <>
        polygone circonscrit : P<sub>n</sub> = n × tan(π/n) × 1 m = {r.n} × tan(π/{r.n}) × 1 m = <strong>{nombre(r.circonscrit, 6)} m</strong>
      </>
    ),
    encadrement: (r) => (
      <>
        {nombre(r.inscrit, 6)} m &lt; π × 1 m = {nombre(Math.PI, 6)} m &lt; {nombre(r.circonscrit, 6)} m ; écart π − p<sub>n</sub> = <strong>{nombre(r.ecart, 6)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <PolygoneCercle n={r.n} />,
};

// ---------- Raccordement d'un profil en long (L1.2.2) ----------
type ResRaccordement = ReturnType<typeof raccordement> & { d: DonneesRaccordement };

const raccordementDef: DefinitionCalcul<ResRaccordement> = {
  champs: [
    champ('p1', 'pente d’entrée (positive en montée)', <>p<sub>1</sub></>, '%', -8, 8, 0.5, 1),
    champ('p2', 'pente de sortie', <>p<sub>2</sub></>, '%', -8, 8, 0.5, 1),
    champ('L', 'longueur du raccordement', 'L', 'm', 20, 400, 5, 0),
    champ('z0', 'altitude au début du raccordement', <>z<sub>0</sub></>, 'm', 0, 3000, 0.1, 2),
    champ('x', 'abscisse étudiée', 'x', 'm', 0, 400, 1, 0),
    champ('h', 'pas de la sécante', 'h', 'm', 0.1, 50, 0.1, 1),
  ],
  defaut: { ...EXEMPLE_RACCORDEMENT },
  calculer: (e) => {
    const d = { p1: num(e, 'p1'), p2: num(e, 'p2'), L: num(e, 'L'), z0: num(e, 'z0'), x: num(e, 'x'), h: num(e, 'h') };
    return { ...raccordement(d), d };
  },
  valeurs: {
    z: (r) => grandeur(r.z, 3, 'm'),
    pente: (r) => pc(r.pente),
    secante: (r) => pc(r.secante),
    ecart: (r) => pc(r.ecart),
    sommet: (r) => (r.xSommet !== null && r.zSommet !== null ? `x = ${n2(r.xSommet)} m, z = ${n3(r.zSommet)} m` : 'hors du raccordement'),
  },
  lignes: {
    modele: (r) => (
      <>
        z(x) = z<sub>0</sub> + p<sub>1</sub> x + (p<sub>2</sub> − p<sub>1</sub>) x² / (2L), avec p<sub>1</sub> = {par(r.d.p1 / 100, 3)} m/m et p<sub>2</sub> = {par(r.d.p2 / 100, 3)} m/m
      </>
    ),
    z: (r) => (
      <>
        z({n2(r.d.x)}) = {n2(r.d.z0)} + {par(r.d.p1 / 100, 3)} × {n2(r.d.x)} + ({par(r.d.p2 / 100, 3)} − {par(r.d.p1 / 100, 3)}) × {n2(r.d.x)}² / (2 × {n2(r.d.L)}) = <strong>{n3(r.z)} m</strong>
      </>
    ),
    secante: (r) => (
      <>
        sécante sur [x ; x + h] : (z(x + h) − z(x)) / h = ({nombre(r.f(r.d.x + r.d.h), 4)} − {nombre(r.z, 4)}) m / {n2(r.d.h)} m = <strong>{pc(r.secante)}</strong>
      </>
    ),
    derivee: (r) => (
      <>
        dérivée : z′(x) = p<sub>1</sub> + (p<sub>2</sub> − p<sub>1</sub>) x / L = {par(r.d.p1 / 100, 3)} + ({par(r.d.p2 / 100, 3)} − {par(r.d.p1 / 100, 3)}) × {n2(r.d.x)} / {n2(r.d.L)} = {nombre(r.pente, 4)} m/m = <strong>{pc(r.pente)}</strong>
      </>
    ),
    ecart: (r) => (
      <>
        écart sécante − tangente : <strong>{pc(r.ecart)}</strong> ; il vaut (p<sub>2</sub> − p<sub>1</sub>) h / (2L) et disparaît quand h tend vers 0
      </>
    ),
    sommet: (r) =>
      r.xSommet !== null && r.zSommet !== null ? (
        <>
          z′(x) = 0 pour x = −p<sub>1</sub> L / (p<sub>2</sub> − p<sub>1</sub>) = <strong>{n2(r.xSommet)} m</strong> : {r.d.p2 < r.d.p1 ? 'point haut' : 'point bas'} du profil, à z = <strong>{n3(r.zSommet)} m</strong>
        </>
      ) : (
        <>la pente z′(x) ne s’annule pas entre 0 et L : le raccordement n’a ni point haut ni point bas</>
      ),
  },
  schema: ({ r }) => <ProfilRaccordement d={r.d} r={r} />,
  alerte: (r) => (r.d.x + r.d.h > r.d.L ? 'x + h dépasse la longueur du raccordement : au-delà de L, le profil redevient une droite et la formule ne s’applique plus.' : undefined),
};

// ---------- Flèche et rotation d'une poutre (L1.2.3) ----------
type ResFleche = ReturnType<typeof flechePoutre> & { d: DonneesFleche };

const flecheDef: DefinitionCalcul<ResFleche> = {
  champs: [
    champ('q', 'charge uniforme (énoncé)', 'q', 'kN/m', 1, 60, 0.5, 1),
    champ('L', 'portée entre appuis', 'L', 'm', 2, 12, 0.1, 2),
    champ('b', 'largeur de la poutre', 'b', 'm', 0.15, 0.6, 0.01, 2),
    champ('h', 'hauteur de la poutre', 'h', 'm', 0.2, 1.2, 0.01, 2),
    champ('E', 'module d’élasticité (énoncé)', 'E', 'GPa', 5, 210, 0.5, 1),
    champ('x', 'abscisse étudiée', 'x', 'm', 0, 12, 0.05, 2),
  ],
  defaut: { ...EXEMPLE_FLECHE },
  calculer: (e) => {
    const d = { q: num(e, 'q'), L: num(e, 'L'), b: num(e, 'b'), h: num(e, 'h'), E: num(e, 'E'), x: num(e, 'x') };
    return { ...flechePoutre(d), d };
  },
  valeurs: {
    I: (r) => `${scientifique(r.I, 4)} m⁴`,
    EI: (r) => grandeur(r.EI, 0, 'kN·m²'),
    y: (r) => grandeur(r.y * 1000, 2, 'mm'),
    theta: (r) => `${scientifique(r.theta, 3)} rad`,
    theta0: (r) => `${scientifique(r.theta0, 3)} rad`,
    yMax: (r) => grandeur(r.yMax * 1000, 2, 'mm'),
    limite: (r) => grandeur(flecheLimite(r.d.L) * 1000, 1, 'mm'),
  },
  lignes: {
    I: (r) => (
      <>
        I = b h³ / 12 = {n2(r.d.b)} × {n2(r.d.h)}³ / 12 = <strong>{scientifique(r.I, 4)} m⁴</strong>
      </>
    ),
    EI: (r) => (
      <>
        E I = {n1(r.d.E)} × 10⁶ kN/m² × {scientifique(r.I, 4)} m⁴ = <strong>{nombre(r.EI, 0)} kN·m²</strong>
      </>
    ),
    derivation: () => (
      <>
        y(x) = q (L³ x − 2 L x³ + x⁴) / (24 E I) ; on dérive terme à terme avec (xⁿ)′ = n xⁿ⁻¹ : y′(x) = q (L³ − 6 L x² + 4 x³) / (24 E I)
      </>
    ),
    y: (r) => (
      <>
        y({n2(r.d.x)}) = {n1(r.d.q)} × ({n2(r.d.L)}³ × {n2(r.d.x)} − 2 × {n2(r.d.L)} × {n2(r.d.x)}³ + {n2(r.d.x)}⁴) / (24 × {nombre(r.EI, 0)}) = {scientifique(r.y, 4)} m = <strong>{n2(r.y * 1000)} mm</strong>
      </>
    ),
    theta: (r) => (
      <>
        θ = y′({n2(r.d.x)}) = {n1(r.d.q)} × ({n2(r.d.L)}³ − 6 × {n2(r.d.L)} × {n2(r.d.x)}² + 4 × {n2(r.d.x)}³) / (24 × {nombre(r.EI, 0)}) = <strong>{scientifique(r.theta, 3)} rad</strong>
      </>
    ),
    controle: (r) => (
      <>
        contrôle numérique : [y(x + 0,001) − y(x − 0,001)] / 0,002 = <strong>{scientifique(penteSecante(r.f, r.d.x, 1e-3).centree, 3)} rad</strong>
      </>
    ),
    appui: (r) => (
      <>
        sur appui (x = 0) : θ<sub>0</sub> = q L³ / (24 E I) = {n1(r.d.q)} × {n2(r.d.L)}³ / (24 × {nombre(r.EI, 0)}) = <strong>{scientifique(r.theta0, 3)} rad</strong>
      </>
    ),
    yMax: (r) => (
      <>
        à mi-portée, y′(L/2) = 0 : la flèche y est maximale, y<sub>max</sub> = 5 q L⁴ / (384 E I) = 5 × {n1(r.d.q)} × {n2(r.d.L)}⁴ / (384 × {nombre(r.EI, 0)}) = <strong>{n2(r.yMax * 1000)} mm</strong>
      </>
    ),
    limite: (r) => (
      <>
        repère : L / 250 = {n2(r.d.L)} m / 250 = {nombre(flecheLimite(r.d.L) * 1000, 1)} mm (EC2 §7.4.1(4)) ; la flèche ci-dessus est élastique, sans fissuration ni fluage
      </>
    ),
  },
  schema: ({ r }) => <PoutreDeformee d={r.d} r={r} prefixe="fc-pd" />,
  alerte: (r) => (r.d.x > r.d.L ? 'L’abscisse x dépasse la portée : choisis x entre 0 et L.' : undefined),
};

// ---------- Moment fléchissant maximal (L1.2.4) ----------
type ResMoment = ResultatMomentMax & { d: DonneesMomentMax };

const momentDef: DefinitionCalcul<ResMoment> = {
  champs: [
    champ('L', 'portée', 'L', 'm', 2, 12, 0.1, 2),
    champ('q', 'charge uniforme', 'q', 'kN/m', 0, 50, 0.5, 1),
    champ('P', 'charge ponctuelle', 'P', 'kN', 0, 200, 1, 0),
    champ('a', 'position de P depuis l’appui A', 'a', 'm', 0, 12, 0.05, 2),
  ],
  defaut: { ...EXEMPLE_MOMENT_MAX },
  calculer: (e) => {
    const d = { L: num(e, 'L'), q: num(e, 'q'), P: num(e, 'P'), a: num(e, 'a') };
    return { ...momentMax(d), d };
  },
  valeurs: {
    RA: (r) => grandeur(r.RA, 2, 'kN'),
    RB: (r) => grandeur(r.RB, 2, 'kN'),
    x0: (r) => grandeur(r.x0, 2, 'm'),
    Mmax: (r) => grandeur(r.Mmax, 2, 'kN·m'),
  },
  lignes: {
    reactions: (r) => (
      <>
        R<sub>A</sub> = q L / 2 + P (L − a) / L = {n1(r.d.q)} × {n2(r.d.L)} / 2 + {nombre(r.d.P, 0)} × ({n2(r.d.L)} − {n2(r.d.a)}) / {n2(r.d.L)} = <strong>{n2(r.RA)} kN</strong> ; R<sub>B</sub> = q L + P − R<sub>A</sub> = <strong>{n2(r.RB)} kN</strong>
      </>
    ),
    moment: () => (
      <>
        M(x) = R<sub>A</sub> x − q x² / 2, moins P (x − a) au-delà de la charge ; sa dérivée est l’effort tranchant : V(x) = dM/dx = R<sub>A</sub> − q x, moins P au-delà de a
      </>
    ),
    x0: (r) => {
      if (Math.abs(r.x0 - r.d.a) < 1e-9)
        return (
          <>
            V passe de {n2(r.V(r.d.a))} kN à {n2(r.V(r.d.a + 1e-9))} kN au droit de la charge : il change de signe sans s’annuler, et M est maximal en x<sub>0</sub> = a = <strong>{n2(r.x0)} m</strong>
          </>
        );
      if (r.x0 < r.d.a)
        return (
          <>
            avant la charge : V(x) = R<sub>A</sub> − q x = 0, donc x<sub>0</sub> = R<sub>A</sub> / q = {n2(r.RA)} / {n1(r.d.q)} = <strong>{n2(r.x0)} m</strong>
          </>
        );
      return (
        <>
          après la charge : V(x) = R<sub>A</sub> − q x − P = 0, donc x<sub>0</sub> = (R<sub>A</sub> − P) / q = ({n2(r.RA)} − {nombre(r.d.P, 0)}) / {n1(r.d.q)} = <strong>{n2(r.x0)} m</strong>
        </>
      );
    },
    Mmax: (r) => (
      <>
        M<sub>max</sub> = M(x<sub>0</sub>) = {n2(r.RA)} × {n2(r.x0)} − {n1(r.d.q)} × {n2(r.x0)}² / 2
        {r.x0 > r.d.a + 1e-9 ? (
          <>
            {' '}
            − {nombre(r.d.P, 0)} × ({n2(r.x0)} − {n2(r.d.a)})
          </>
        ) : null}{' '}
        = <strong>{n2(r.Mmax)} kN·m</strong>
      </>
    ),
  },
  schema: ({ r }) => <MomentMaxSchema d={r.d} r={r} prefixe="fc-mm" />,
  alerte: (r) => (r.d.a > r.d.L ? 'La charge ponctuelle doit être sur la poutre : choisis a ≤ L.' : undefined),
};

// ---------- Longueur d'un câble (L1.2.5) ----------
type ResCable = ReturnType<typeof longueurCable> & { d: DonneesCable };

const cableDef: DefinitionCalcul<ResCable> = {
  champs: [champ('l', 'portée entre les deux appuis', 'l', 'm', 10, 1000, 1, 0), champ('f', 'flèche à mi-portée', 'f', 'm', 0.1, 100, 0.1, 1)],
  defaut: { ...EXEMPLE_CABLE },
  calculer: (e) => {
    const d = { l: num(e, 'l'), f: num(e, 'f') };
    return { ...longueurCable(d), d };
  },
  valeurs: {
    k: (r) => n3(r.k),
    exacte: (r) => grandeur(r.exacte, 3, 'm'),
    approchee: (r) => grandeur(r.approchee, 3, 'm'),
    ecart: (r) => grandeur(r.ecart * 1000, 1, 'mm'),
    surlongueur: (r) => grandeur(r.exacte - r.d.l, 3, 'm'),
  },
  lignes: {
    k: (r) => (
      <>
        k = 4 f / l = 4 × {n1(r.d.f)} m / {nombre(r.d.l, 0)} m = <strong>{n3(r.k)}</strong> (sans unité)
      </>
    ),
    exacte: (r) => (
      <>
        longueur exacte : S = (l / 2) × (√(1 + k²) + argsh(k) / k) = <strong>{n3(r.exacte)} m</strong>
      </>
    ),
    approchee: (r) => (
      <>
        développement limité : S ≈ l (1 + 8 f² / (3 l²)) = {nombre(r.d.l, 0)} × (1 + 8 × {n1(r.d.f)}² / (3 × {nombre(r.d.l, 0)}²)) = <strong>{n3(r.approchee)} m</strong>
      </>
    ),
    ecart: (r) => (
      <>
        écart : {nombre(r.ecart * 1000, 1)} mm sur {n3(r.exacte)} m, soit <strong>{scientifique(r.ecartRelatif * 100, 2)} %</strong>
      </>
    ),
  },
  schema: ({ r }) => <CableParabolique d={r.d} r={r} />,
  alerte: (r) => (r.ecartRelatif > 0.01 ? 'L’écart dépasse 1 % : la flèche n’est plus petite devant la portée, l’approximation devient grossière.' : undefined),
};

// ---------- Charge répartie variable (L1.2.6) ----------
type ResCharge = ResultatChargeVariable & { d: DonneesChargeVariable };

const chargeDef: DefinitionCalcul<ResCharge> = {
  champs: [
    champ('c0', 'charge en x = 0', <>c<sub>0</sub></>, 'kN/m', 0, 40, 0.5, 1),
    champ('c1', 'coefficient de x', <>c<sub>1</sub></>, 'kN/m²', -5, 10, 0.1, 2),
    champ('c2', 'coefficient de x²', <>c<sub>2</sub></>, 'kN/m³', -2, 2, 0.05, 2),
    champ('L', 'longueur chargée', 'L', 'm', 1, 12, 0.1, 2),
    champ('n', 'nombre de rectangles', 'n', '', 1, 40, 1, 0),
  ],
  defaut: { ...EXEMPLE_CHARGE_VARIABLE },
  calculer: (e) => {
    const d = { c0: num(e, 'c0'), c1: num(e, 'c1'), c2: num(e, 'c2'), L: num(e, 'L'), n: num(e, 'n') };
    return { ...chargeVariable(d), d };
  },
  valeurs: {
    R: (r) => grandeur(r.R, 2, 'kN'),
    xBarre: (r) => grandeur(r.xBarre, 2, 'm'),
    Rn: (r) => grandeur(r.Rn, 2, 'kN'),
    ecart: (r) => grandeur(r.ecart, 3, 'kN'),
    q0: (r) => grandeur(r.q(0), 2, 'kN/m'),
    qL: (r) => grandeur(r.q(r.d.L), 2, 'kN/m'),
  },
  lignes: {
    modele: (r) => (
      <>
        q(x) = c<sub>0</sub> + c<sub>1</sub> x + c<sub>2</sub> x² = {n1(r.d.c0)} + {par(r.d.c1)} x + {par(r.d.c2)} x² (kN/m) : de {n2(r.q(0))} kN/m en x = 0 à {n2(r.q(r.d.L))} kN/m en x = L
      </>
    ),
    primitive: () => (
      <>
        une primitive de q est Q(x) = c<sub>0</sub> x + c<sub>1</sub> x² / 2 + c<sub>2</sub> x³ / 3 : on vérifie que Q′(x) = q(x)
      </>
    ),
    R: (r) => (
      <>
        R = ∫<sub>0</sub>
        <sup>L</sup> q(x) dx = Q(L) − Q(0) = {n1(r.d.c0)} × {n2(r.d.L)} + {par(r.d.c1)} × {n2(r.d.L)}² / 2 + {par(r.d.c2)} × {n2(r.d.L)}³ / 3 = <strong>{n2(r.R)} kN</strong>
      </>
    ),
    moment: (r) => (
      <>
        ∫<sub>0</sub>
        <sup>L</sup> x q(x) dx = c<sub>0</sub> L² / 2 + c<sub>1</sub> L³ / 3 + c<sub>2</sub> L⁴ / 4 = {n1(r.d.c0)} × {n2(r.d.L)}² / 2 + {par(r.d.c1)} × {n2(r.d.L)}³ / 3 + {par(r.d.c2)} × {n2(r.d.L)}⁴ / 4 = <strong>{n2(r.moment)} kN·m</strong>
      </>
    ),
    xBarre: (r) => (
      <>
        position de la résultante : x̄ = ∫ x q dx / R = {n2(r.moment)} / {n2(r.R)} = <strong>{n2(r.xBarre)} m</strong>
      </>
    ),
    Rn: (r) => (
      <>
        {Math.round(r.d.n)} rectangles de largeur Δx = L / n = {n3(r.dx)} m, hauteur prise au milieu : Σ q(x<sub>i</sub>) Δx = <strong>{n2(r.Rn)} kN</strong> (écart {nombre(r.ecart, 3)} kN)
      </>
    ),
  },
  schema: ({ r }) => <SommeRectangles d={r.d} r={r} />,
  alerte: (r) => (Array.from({ length: 41 }, (_, i) => r.q((i * r.d.L) / 40)).some((v) => v < 0) ? 'La charge devient négative sur une partie de la longueur : cette partie compte négativement dans l’intégrale.' : undefined),
};

// ---------- Vent sur un mât (L1.2.7) ----------
type ResVent = ResultatVentPuissance & { d: DonneesVentPuissance };

const ventDef: DefinitionCalcul<ResVent> = {
  champs: [
    champ('qr', 'charge de vent à la hauteur de référence (énoncé)', <>q<sub>r</sub></>, 'kN/m', 0.1, 5, 0.05, 2),
    champ('zr', 'hauteur de référence', <>z<sub>r</sub></>, 'm', 1, 20, 0.5, 1),
    champ('alpha', 'exposant du profil (énoncé)', 'α', '', 0.1, 0.4, 0.01, 2),
    champ('H', 'hauteur du mât', 'H', 'm', 5, 80, 0.5, 1),
  ],
  defaut: { ...EXEMPLE_VENT_PUISSANCE },
  calculer: (e) => {
    const d = { qr: num(e, 'qr'), zr: num(e, 'zr'), alpha: num(e, 'alpha'), H: num(e, 'H') };
    return { ...ventPuissance(d), d };
  },
  valeurs: {
    F: (r) => grandeur(r.F, 2, 'kN'),
    M: (r) => grandeur(r.M, 2, 'kN·m'),
    zBarre: (r) => grandeur(r.zBarre, 2, 'm'),
    Fsimpson: (r) => grandeur(r.Fsimpson, 2, 'kN'),
    qH: (r) => grandeur(r.q(r.d.H), 2, 'kN/m'),
  },
  lignes: {
    modele: (r) => (
      <>
        q(z) = q<sub>r</sub> (z / z<sub>r</sub>)<sup>α</sup> : {n2(r.d.qr)} kN/m à {n1(r.d.zr)} m de hauteur, {n2(r.q(r.d.H))} kN/m au sommet
      </>
    ),
    changement: () => (
      <>
        on pose u = z / z<sub>r</sub>, donc dz = z<sub>r</sub> du : ∫ q dz = q<sub>r</sub> z<sub>r</sub> ∫ u<sup>α</sup> du = q<sub>r</sub> z<sub>r</sub> u<sup>α+1</sup> / (α + 1)
      </>
    ),
    F: (r) => (
      <>
        F = ∫<sub>0</sub>
        <sup>H</sup> q dz = q<sub>r</sub> H<sup>α+1</sup> / ((α + 1) z<sub>r</sub>
        <sup>α</sup>) = {n2(r.d.qr)} × {n1(r.d.H)}
        <sup>{n2(r.d.alpha + 1)}</sup> / ({n2(r.d.alpha + 1)} × {n1(r.d.zr)}
        <sup>{n2(r.d.alpha)}</sup>) = <strong>{n2(r.F)} kN</strong>
      </>
    ),
    M: (r) => (
      <>
        M = ∫<sub>0</sub>
        <sup>H</sup> z q dz = q<sub>r</sub> H<sup>α+2</sup> / ((α + 2) z<sub>r</sub>
        <sup>α</sup>) = {n2(r.d.qr)} × {n1(r.d.H)}
        <sup>{n2(r.d.alpha + 2)}</sup> / ({n2(r.d.alpha + 2)} × {n1(r.d.zr)}
        <sup>{n2(r.d.alpha)}</sup>) = <strong>{n2(r.M)} kN·m</strong>
      </>
    ),
    zBarre: (r) => (
      <>
        hauteur de la résultante : z̄ = M / F = {n2(r.M)} / {n2(r.F)} = <strong>{n2(r.zBarre)} m</strong>
      </>
    ),
    simpson: (r) => (
      <>
        contrôle numérique (méthode de Simpson, 200 intervalles) : F ≈ <strong>{n2(r.Fsimpson)} kN</strong>
      </>
    ),
  },
  schema: ({ r }) => <VentMat d={r.d} r={r} prefixe="fc-vm" />,
};

// ---------- Inertie par bandes (L1.2.8) ----------
type ResBandes = ResultatBandes & { d: DonneesBandes };

const bandesDef: DefinitionCalcul<ResBandes> = {
  champs: [champ('b', 'largeur de la section', 'b', 'cm', 5, 100, 1, 0), champ('h', 'hauteur de la section', 'h', 'cm', 5, 150, 1, 0), champ('n', 'nombre de bandes', 'n', '', 1, 40, 1, 0)],
  defaut: { ...EXEMPLE_BANDES },
  calculer: (e) => {
    const d = { b: num(e, 'b'), h: num(e, 'h'), n: num(e, 'n') };
    return { ...inertieParBandes(d), d };
  },
  valeurs: {
    In: (r) => grandeur(r.In, 0, 'cm⁴'),
    Iexact: (r) => grandeur(r.Iexact, 0, 'cm⁴'),
    ecart: (r) => pc(r.ecartRelatif),
    Ibase: (r) => grandeur(r.Ibase, 0, 'cm⁴'),
  },
  lignes: {
    bandes: (r) => (
      <>
        on coupe la hauteur en {Math.round(r.d.n)} bandes d’épaisseur Δy = h / n = <strong>{n2(r.dy)} cm</strong> ; la bande i, à la distance y<sub>i</sub> de l’axe, apporte b Δy y<sub>i</sub>²
      </>
    ),
    somme: (r) => (
      <>
        I ≈ Σ b Δy y<sub>i</sub>² = <strong>{nombre(r.In, 0)} cm⁴</strong>
      </>
    ),
    limite: (r) => (
      <>
        quand n tend vers l’infini, la somme devient l’intégrale I = ∫ y² b dy (de −h/2 à h/2) = b h³ / 12 = {nombre(r.d.b, 0)} × {nombre(r.d.h, 0)}³ / 12 = <strong>{nombre(r.Iexact, 0)} cm⁴</strong>
      </>
    ),
    ecart: (r) => (
      <>
        écart relatif de la somme : <strong>{pc(r.ecartRelatif)}</strong>, soit exactement −1/n²
      </>
    ),
    huygens: (r) => (
      <>
        autour de la base : ∫<sub>0</sub>
        <sup>h</sup> y² b dy = b h³ / 3 = <strong>{nombre(r.Ibase, 0)} cm⁴</strong> ; Huygens : b h³ / 12 + A (h/2)² = {nombre(r.Iexact, 0)} + {nombre(r.A, 0)} × {n1(r.d.h / 2)}² = {nombre(r.IbaseHuygens, 0)} cm⁴
      </>
    ),
  },
  schema: ({ r }) => <InertieBandes d={r.d} r={r} />,
};

// ---------- Pentes d'un terrain (L1.2.9) ----------
type ResTerrain = ResultatTerrain & { d: DonneesTerrain };

const terrainDef: DefinitionCalcul<ResTerrain> = {
  champs: [
    champ('z0', 'altitude à l’origine', <>z<sub>0</sub></>, 'm', 0, 3000, 0.5, 1),
    champ('a', 'pente selon x', 'a', '%', 0.5, 8, 0.1, 1),
    champ('b', 'pente selon y à l’origine', 'b', '%', -8, 8, 0.1, 1),
    champ('c', 'courbure du vallon selon y', 'c', '1/m', -0.005, 0.005, 0.0005, 4),
    champ('x', 'abscisse du point étudié', 'x', 'm', 0, 100, 1, 0),
    champ('y', 'ordonnée du point étudié', 'y', 'm', 0, 100, 1, 0),
  ],
  defaut: { ...EXEMPLE_TERRAIN },
  calculer: (e) => {
    const d = { z0: num(e, 'z0'), a: num(e, 'a'), b: num(e, 'b'), c: num(e, 'c'), x: num(e, 'x'), y: num(e, 'y') };
    return { ...terrain(d), d };
  },
  valeurs: {
    z: (r) => grandeur(r.z, 2, 'm'),
    zx: (r) => pc(r.zx),
    zy: (r) => pc(r.zy),
    pente: (r) => pc(r.pente),
    direction: (r) => `${n1(r.direction)}°`,
  },
  lignes: {
    modele: (r) => (
      <>
        z(x, y) = z<sub>0</sub> + a x + b y + c y² = {n1(r.d.z0)} + {n3(r.d.a / 100)} x + {par(r.d.b / 100, 3)} y + {par(r.d.c, 4)} y² (en m)
      </>
    ),
    z: (r) => (
      <>
        z({nombre(r.d.x, 0)} ; {nombre(r.d.y, 0)}) = {n1(r.d.z0)} + {n3(r.d.a / 100)} × {nombre(r.d.x, 0)} + {par(r.d.b / 100, 3)} × {nombre(r.d.y, 0)} + {par(r.d.c, 4)} × {nombre(r.d.y, 0)}² = <strong>{n2(r.z)} m</strong>
      </>
    ),
    zx: (r) => (
      <>
        ∂z/∂x : on dérive par rapport à x, y étant fixé : ∂z/∂x = a = {n3(r.zx)} m/m = <strong>{pc(r.zx)}</strong>
      </>
    ),
    zy: (r) => (
      <>
        ∂z/∂y : x fixé : ∂z/∂y = b + 2 c y = {par(r.d.b / 100, 3)} + 2 × {par(r.d.c, 4)} × {nombre(r.d.y, 0)} = {n3(r.zy)} m/m = <strong>{pc(r.zy)}</strong>
      </>
    ),
    pente: (r) => (
      <>
        plus forte pente : |grad z| = √((∂z/∂x)² + (∂z/∂y)²) = √({par(r.zx, 3)}² + {par(r.zy, 3)}²) = {nombre(r.pente, 4)} m/m = <strong>{pc(r.pente)}</strong>
      </>
    ),
    direction: (r) => (
      <>
        l’eau descend selon −grad z = ({n3(-r.zx)} ; {n3(-r.zy)}) : direction <strong>{n1(r.direction)}°</strong> depuis l’axe x, dans le sens trigonométrique
      </>
    ),
  },
  schema: ({ r }) => <CourbesNiveau d={r.d} r={r} />,
};

// ---------- Cubature d'une plate-forme (L1.2.10) ----------
type ResCubature = ResultatCubature & { d: DonneesCubature };
const altitude = (cle: string, sym: React.ReactNode, libelle: string) => champ(cle, libelle, sym, 'm', 90, 110, 0.05, 2);

const cubatureDef: DefinitionCalcul<ResCubature> = {
  champs: [
    champ('L', 'longueur selon x', 'L', 'm', 5, 100, 0.5, 1),
    champ('l', 'largeur selon y', 'l', 'm', 5, 100, 0.5, 1),
    altitude('z00', <>z<sub>00</sub></>, 'terrain au coin (0 ; 0)'),
    altitude('z10', <>z<sub>10</sub></>, 'terrain au coin (L ; 0)'),
    altitude('z01', <>z<sub>01</sub></>, 'terrain au coin (0 ; l)'),
    altitude('z11', <>z<sub>11</sub></>, 'terrain au coin (L ; l)'),
    altitude('zp', <>z<sub>p</sub></>, 'niveau de la plate-forme'),
  ],
  defaut: { ...EXEMPLE_CUBATURE },
  calculer: (e) => {
    const d = { L: num(e, 'L'), l: num(e, 'l'), z00: num(e, 'z00'), z10: num(e, 'z10'), z01: num(e, 'z01'), z11: num(e, 'z11'), zp: num(e, 'zp') };
    return { ...cubature(d), d };
  },
  valeurs: {
    zMoyen: (r) => grandeur(r.zMoyen, 3, 'm'),
    Vnet: (r) => grandeur(r.Vnet, 2, 'm³'),
    Vdeblai: (r) => grandeur(r.Vdeblai, 2, 'm³'),
    Vremblai: (r) => grandeur(r.Vremblai, 2, 'm³'),
  },
  lignes: {
    modele: () => (
      <>
        entre les quatre coins, le terrain est pris bilinéaire : z(x, y) = z<sub>00</sub> (1 − u)(1 − v) + z<sub>10</sub> u (1 − v) + z<sub>01</sub> (1 − u) v + z<sub>11</sub> u v, avec u = x / L et v = y / l
      </>
    ),
    moyen: (r) => (
      <>
        altitude moyenne : ∬ z dA / (L l) = (z<sub>00</sub> + z<sub>10</sub> + z<sub>01</sub> + z<sub>11</sub>) / 4 = ({n2(r.d.z00)} + {n2(r.d.z10)} + {n2(r.d.z01)} + {n2(r.d.z11)}) / 4 = <strong>{n3(r.zMoyen)} m</strong>
      </>
    ),
    net: (r) => (
      <>
        V<sub>net</sub> = ∬ (z − z<sub>p</sub>) dA = L l (z<sub>moyen</sub> − z<sub>p</sub>) = {n1(r.d.L)} × {n1(r.d.l)} × ({n3(r.zMoyen)} − {n2(r.d.zp)}) = <strong>{n2(r.Vnet)} m³</strong>
      </>
    ),
    separe: (r) => (
      <>
        zones séparées (quadrillage de 120 × 120 mailles) : déblai = ∬ (z − z<sub>p</sub>) dA là où z &gt; z<sub>p</sub> = <strong>{n2(r.Vdeblai)} m³</strong> ; remblai = <strong>{n2(r.Vremblai)} m³</strong>
      </>
    ),
    controle: (r) => (
      <>
        contrôle : déblai − remblai = {n2(r.Vdeblai)} − {n2(r.Vremblai)} = {n2(r.Vdeblai - r.Vremblai)} m³, égal à V<sub>net</sub>
      </>
    ),
  },
  schema: ({ r }) => <CubatureSchema d={r.d} r={r} />,
};

// ---------- Section en T (L1.2.P) ----------
type ResSectionT = ResultatTInertie & { d: DonneesSectionT };

const sectionTDef: DefinitionCalcul<ResSectionT> = {
  champs: [
    champ('b', 'largeur de la table', 'b', 'cm', 30, 150, 1, 0),
    champ('hf', 'épaisseur de la table', <>h<sub>f</sub></>, 'cm', 6, 30, 1, 0),
    champ('bw', 'largeur de l’âme', <>b<sub>w</sub></>, 'cm', 10, 60, 1, 0),
    champ('h', 'hauteur totale', 'h', 'cm', 25, 120, 1, 0),
  ],
  defaut: { ...EXEMPLE_SECTION_T },
  calculer: (e) => {
    const d = { b: num(e, 'b'), hf: num(e, 'hf'), bw: num(e, 'bw'), h: num(e, 'h') };
    return { ...sectionTInertie(d), d };
  },
  valeurs: {
    A: (r) => grandeur(r.A, 0, 'cm²'),
    yG: (r) => grandeur(r.yG, 2, 'cm'),
    vSup: (r) => grandeur(r.vSup, 2, 'cm'),
    IG: (r) => grandeur(r.IG, 0, 'cm⁴'),
    Iintegre: (r) => grandeur(r.Iintegre, 0, 'cm⁴'),
    Winf: (r) => grandeur(r.Winf, 0, 'cm³'),
    Wsup: (r) => grandeur(r.Wsup, 0, 'cm³'),
  },
  lignes: {
    aires: (r) => {
      const [ame, table] = r.parties;
      return (
        <>
          âme : {nombre(r.d.bw, 0)} × {nombre(r.d.h - r.d.hf, 0)} = {nombre(ame!.A, 0)} cm², centre à y<sub>1</sub> = {n1(ame!.y)} cm ; table : {nombre(r.d.b, 0)} × {nombre(r.d.hf, 0)} = {nombre(table!.A, 0)} cm², centre à y<sub>2</sub> = {n1(table!.y)} cm ; A = <strong>{nombre(r.A, 0)} cm²</strong>
        </>
      );
    },
    yG: (r) => {
      const [ame, table] = r.parties;
      return (
        <>
          y<sub>G</sub> = (A<sub>1</sub> y<sub>1</sub> + A<sub>2</sub> y<sub>2</sub>) / A = ({nombre(ame!.A, 0)} × {n1(ame!.y)} + {nombre(table!.A, 0)} × {n1(table!.y)}) / {nombre(r.A, 0)} = <strong>{n2(r.yG)} cm</strong>
        </>
      );
    },
    ame: (r) => {
      const p = r.parties[0]!;
      return (
        <>
          âme : I<sub>1</sub> = b<sub>w</sub> (h − h<sub>f</sub>)³ / 12 + A<sub>1</sub> d<sub>1</sub>² = {nombre(p.Ipropre, 0)} + {nombre(p.A, 0)} × {n2(Math.abs(p.d))}² = <strong>{nombre(p.IHuygens, 0)} cm⁴</strong>
        </>
      );
    },
    table: (r) => {
      const p = r.parties[1]!;
      return (
        <>
          table : I<sub>2</sub> = b h<sub>f</sub>³ / 12 + A<sub>2</sub> d<sub>2</sub>² = {nombre(p.Ipropre, 0)} + {nombre(p.A, 0)} × {n2(Math.abs(p.d))}² = <strong>{nombre(p.IHuygens, 0)} cm⁴</strong>
        </>
      );
    },
    IG: (r) => (
      <>
        I<sub>G</sub> = I<sub>1</sub> + I<sub>2</sub> = {nombre(r.parties[0]!.IHuygens, 0)} + {nombre(r.parties[1]!.IHuygens, 0)} = <strong>{nombre(r.IG, 0)} cm⁴</strong>
      </>
    ),
    integre: (r) => (
      <>
        contrôle par intégration, ∫ b(y) (y − y<sub>G</sub>)² dy sur 2 000 bandes : <strong>{nombre(r.Iintegre, 0)} cm⁴</strong>
      </>
    ),
    W: (r) => (
      <>
        v′ = y<sub>G</sub> = {n2(r.vInf)} cm et v = h − y<sub>G</sub> = {n2(r.vSup)} cm ; W<sub>inf</sub> = I<sub>G</sub> / v′ = <strong>{nombre(r.Winf, 0)} cm³</strong> ; W<sub>sup</sub> = I<sub>G</sub> / v = <strong>{nombre(r.Wsup, 0)} cm³</strong>
      </>
    ),
  },
  schema: ({ r }) => <SectionTInertieSchema d={r.d} r={r} prefixe="fc-sti" />,
  alerte: (r) => (r.d.hf >= r.d.h || r.d.bw > r.d.b ? 'La table doit être plus mince que la section (hf < h) et l’âme pas plus large que la table (bw ≤ b).' : undefined),
};

export const CALCULS_ANALYSE = {
  polygonePi: polygoneDef,
  raccordementProfil: raccordementDef,
  flechePoutre: flecheDef,
  momentMaximal: momentDef,
  longueurCable: cableDef,
  chargeVariable: chargeDef,
  ventMat: ventDef,
  inertieBandes: bandesDef,
  pentesTerrain: terrainDef,
  cubature: cubatureDef,
  sectionTInertie: sectionTDef,
} as const;
