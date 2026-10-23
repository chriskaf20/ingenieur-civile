// Fiches de calcul du module N0.5 (géométrie). Les valeurs viennent de lib/calc/geometrie.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { CoupeSemelleFilante, DalleLSchema, FouilleCoupe, MaisonPlan, MassifVueFace, RepereSegment, SectionTSchema, ThalesOmbre } from '@/components/schemas/Geometrie';
import {
  dalleL,
  EXEMPLE_DALLE_L,
  EXEMPLE_FOUILLE,
  EXEMPLE_MAISON,
  EXEMPLE_MASSIF,
  EXEMPLE_SECTION_T,
  fouilleTalutee,
  hauteurParOmbre,
  maison,
  massifL,
  sectionT,
  segment,
  type DonneesDalleL,
  type DonneesFouille,
  type DonneesMaison,
  type DonneesMassif,
  type DonneesSectionT,
  type ResultatDalleL,
  type ResultatFouille,
  type ResultatMaison,
  type ResultatMassif,
  type ResultatSegment,
} from '@/lib/calc/geometrie';
import { grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const m = (cle: string, libelle: string, symbole: string, min: number, max: number, pas = 0.05, decimales = 2) =>
  ({ cle, libelle, symbole, unite: 'm', min, max, pas, decimales }) as const;

// ---------- Dalle en L (N0.5.1) ----------
type ResDalle = ResultatDalleL & { d: DonneesDalleL };

const dalle: DefinitionCalcul<ResDalle> = {
  champs: [
    m('L1', 'longueur de la grande aile', 'L1', 2, 15),
    m('l1', 'largeur de la grande aile', 'l1', 1, 8),
    m('L2', 'longueur de la petite aile', 'L2', 1, 15),
    m('l2', 'largeur de la petite aile', 'l2', 1, 8),
    m('a', 'longueur de la trémie', 'a', 0.5, 4),
    m('b', 'largeur de la trémie', 'b', 0.5, 3),
    { cle: 'e', libelle: 'épaisseur', symbole: 'e', unite: 'cm', min: 10, max: 30, pas: 1, decimales: 0 },
  ],
  defaut: { ...EXEMPLE_DALLE_L, e: EXEMPLE_DALLE_L.e * 100 },
  calculer: (e) => {
    const d = { L1: num(e, 'L1'), l1: num(e, 'l1'), L2: num(e, 'L2'), l2: num(e, 'l2'), a: num(e, 'a'), b: num(e, 'b'), e: num(e, 'e') / 100 };
    return { ...dalleL(d), d };
  },
  valeurs: {
    A: (r) => grandeur(r.A, 2, 'm²'),
    V: (r) => grandeur(r.V, 2, 'm³'),
    perimetre: (r) => grandeur(r.perimetre, 2, 'm'),
    tremie: (r) => grandeur(r.perimetreTremie, 2, 'm'),
  },
  lignes: {
    decoupe: (r) => (
      <>
        ① A₁ = {n2(r.d.L1)} × {n2(r.d.l1)} = {n2(r.A1)} m² ; ② A₂ = {n2(r.d.L2)} × {n2(r.d.l2)} = {n2(r.A2)} m² ; trémie Aₜ = {n2(r.d.a)} × {n2(r.d.b)} = {n2(r.At)} m²
      </>
    ),
    A: (r) => (
      <>
        A = A₁ + A₂ − Aₜ = {n2(r.A1)} + {n2(r.A2)} − {n2(r.At)} = <strong>{n2(r.A)} m²</strong>
      </>
    ),
    perimetre: (r) => (
      <>
        contour : 2 × (L1 + l1 + l2) = 2 × ({n2(r.d.L1)} + {n2(r.d.l1)} + {n2(r.d.l2)}) = <strong>{n2(r.perimetre)} m</strong> ; tour de trémie 2 × ({n2(r.d.a)} + {n2(r.d.b)}) = {n2(r.perimetreTremie)} m
      </>
    ),
    V: (r) => (
      <>
        béton : V = A × e = {n2(r.A)} m² × {n2(r.d.e)} m = <strong>{n3(r.V)} m³</strong>
      </>
    ),
  },
  schema: ({ r }) => <DalleLSchema d={r.d} r={r} />,
  alerte: (r) => (r.valide ? undefined : 'Données incohérentes : la petite aile doit être plus courte que la grande, et la trémie doit tenir dans la grande aile.'),
};

// ---------- Thalès : hauteur par l'ombre (N0.5.2) ----------
interface ResOmbre {
  hBaton: number;
  ombreBaton: number;
  ombreObjet: number;
  H: number;
  k: number;
}

const ombre: DefinitionCalcul<ResOmbre> = {
  champs: [m('hBaton', 'hauteur du bâton', 'h', 0.5, 3), m('ombreBaton', 'ombre du bâton', 's', 0.2, 6), m('ombreObjet', 'ombre du pylône', 'S', 1, 80, 0.1, 2)],
  defaut: { hBaton: 1.5, ombreBaton: 1.2, ombreObjet: 18 },
  calculer: (e) => {
    const hBaton = num(e, 'hBaton');
    const ombreBaton = num(e, 'ombreBaton');
    const ombreObjet = num(e, 'ombreObjet');
    return { hBaton, ombreBaton, ombreObjet, ...hauteurParOmbre(hBaton, ombreBaton, ombreObjet) };
  },
  valeurs: { H: (r) => grandeur(r.H, 2, 'm'), k: (r) => nombre(r.k, 2) },
  lignes: {
    thales: () => <>H / h = S / s (triangles semblables : mêmes angles, car les rayons du soleil sont parallèles)</>,
    k: (r) => (
      <>
        rapport k = S / s = {n2(r.ombreObjet)} / {n2(r.ombreBaton)} = <strong>{n2(r.k)}</strong>
      </>
    ),
    H: (r) => (
      <>
        H = h × k = {n2(r.hBaton)} m × {n2(r.k)} = <strong>{n2(r.H)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <ThalesOmbre hBaton={r.hBaton} ombreBaton={r.ombreBaton} ombreObjet={r.ombreObjet} H={r.H} />,
};

// ---------- Fouille talutée (N0.5.3) ----------
type ResFouille = ResultatFouille & { d: DonneesFouille };

const fouille: DefinitionCalcul<ResFouille> = {
  champs: [
    m('a', 'longueur du fond', 'a', 0.5, 5),
    m('b', 'largeur du fond', 'b', 0.5, 5),
    m('H', 'profondeur', 'H', 0.3, 3),
    { cle: 'n', libelle: 'talus (base pour 1 de hauteur)', symbole: 'n', unite: '', min: 0, max: 2, pas: 0.05, decimales: 2 },
  ],
  defaut: { ...EXEMPLE_FOUILLE },
  calculer: (e) => {
    const d = { a: num(e, 'a'), b: num(e, 'b'), H: num(e, 'H'), n: num(e, 'n') };
    return { ...fouilleTalutee(d), d };
  },
  valeurs: {
    V: (r) => grandeur(r.V, 3, 'm³'),
    Vmoyenne: (r) => grandeur(r.Vmoyenne, 3, 'm³'),
    ecart: (r) => `${nombre(r.ecart * 100, 1)} %`,
  },
  lignes: {
    haut: (r) => (
      <>
        haut : a + 2 n H = {n2(r.d.a)} + 2 × {n2(r.d.n)} × {n2(r.d.H)} = {n2(r.aSup)} m (de même {n2(r.bSup)} m)
      </>
    ),
    aires: (r) => (
      <>
        fond A₁ = {n3(r.Afond)} m² ; haut A₂ = {n3(r.Asup)} m² ; mi-hauteur Aₘ = {n2((r.d.a + r.aSup) / 2)} × {n2((r.d.b + r.bSup) / 2)} = {n3(r.Amilieu)} m²
      </>
    ),
    V: (r) => (
      <>
        V = H / 6 × (A₁ + A₂ + 4 Aₘ) = {n2(r.d.H)} / 6 × ({n3(r.Afond)} + {n3(r.Asup)} + 4 × {n3(r.Amilieu)}) = <strong>{n3(r.V)} m³</strong>
      </>
    ),
    moyenne: (r) => (
      <>
        approximation « moyenne des aires » : (A₁ + A₂) / 2 × H = {n3(r.Vmoyenne)} m³, soit {nombre(r.ecart * 100, 1)} % de trop
      </>
    ),
  },
  schema: ({ r }) => <FouilleCoupe d={r.d} r={r} />,
};

// ---------- Deux bornes en coordonnées (N0.5.4) ----------
type ResCoord = ResultatSegment & { A: { x: number; y: number }; B: { x: number; y: number } };

const coord = (cle: string, libelle: string, symbole: string) => ({ cle, libelle, symbole, unite: 'm', min: -50, max: 50, pas: 0.01, decimales: 2 }) as const;

const coordonnees: DefinitionCalcul<ResCoord> = {
  champs: [coord('xA', 'abscisse de A', 'xA'), coord('yA', 'ordonnée de A', 'yA'), coord('xB', 'abscisse de B', 'xB'), coord('yB', 'ordonnée de B', 'yB')],
  defaut: { xA: 2.4, yA: 1.5, xB: 14.1, yB: 9.3 },
  calculer: (e) => {
    const A = { x: num(e, 'xA'), y: num(e, 'yA') };
    const B = { x: num(e, 'xB'), y: num(e, 'yB') };
    return { ...segment(A, B), A, B };
  },
  valeurs: {
    d: (r) => grandeur(r.d, 2, 'm'),
    theta: (r) => `${nombre(r.theta, 2)}°`,
    milieu: (r) => `(${n2(r.milieu.x)} ; ${n2(r.milieu.y)})`,
  },
  lignes: {
    deltas: (r) => (
      <>
        Δx = xB − xA = {n2(r.B.x)} − {n2(r.A.x)} = {n2(r.dx)} m ; Δy = yB − yA = {n2(r.B.y)} − {n2(r.A.y)} = {n2(r.dy)} m
      </>
    ),
    d: (r) => (
      <>
        d = √(Δx² + Δy²) = √({n2(r.dx)}² + {n2(r.dy)}²) = <strong>{n2(r.d)} m</strong>
      </>
    ),
    theta: (r) => (
      <>
        direction : tan θ = Δy / Δx = {n3(r.dy / r.dx)}, quadrant fixé par les signes de Δx et Δy → <strong>θ = {nombre(r.theta, 2)}°</strong>
      </>
    ),
    milieu: (r) => (
      <>
        milieu M : ((xA + xB) / 2 ; (yA + yB) / 2) = <strong>({n2(r.milieu.x)} ; {n2(r.milieu.y)})</strong>
      </>
    ),
  },
  schema: ({ r }) => <RepereSegment A={r.A} B={r.B} s={r} />,
};

// ---------- Massif en L : des vues au volume (N0.5.5) ----------
type ResMassif = ResultatMassif & { d: DonneesMassif };

const massif: DefinitionCalcul<ResMassif> = {
  champs: [
    m('L', 'longueur (vue de face)', 'L', 0.5, 4),
    m('h1', 'hauteur de la partie basse', 'h₁', 0.1, 2),
    m('a', 'longueur de la partie haute', 'a', 0.2, 4),
    m('h2', 'surélévation de la partie haute', 'h₂', 0.1, 2),
    m('P', 'profondeur (vue de dessus)', 'P', 0.2, 4),
  ],
  defaut: { ...EXEMPLE_MASSIF },
  calculer: (e) => {
    const d = { L: num(e, 'L'), h1: num(e, 'h1'), a: num(e, 'a'), h2: num(e, 'h2'), P: num(e, 'P') };
    return { ...massifL(d), d };
  },
  valeurs: { V: (r) => grandeur(r.V, 3, 'm³'), section: (r) => grandeur(r.section, 3, 'm²'), coffrage: (r) => grandeur(r.coffrage, 2, 'm²') },
  lignes: {
    section: (r) => (
      <>
        vue de face : A = L × h₁ + a × h₂ = {n2(r.d.L)} × {n2(r.d.h1)} + {n2(r.d.a)} × {n2(r.d.h2)} = <strong>{n3(r.section)} m²</strong>
      </>
    ),
    V: (r) => (
      <>
        prisme : V = A × P = {n3(r.section)} m² × {n2(r.d.P)} m = <strong>{n3(r.V)} m³</strong>
      </>
    ),
    coffrage: (r) => (
      <>
        coffrage vertical : 2 × A + (h₁ + h₂ + H) × P = 2 × {n3(r.section)} + ({n2(r.d.h1)} + {n2(r.d.h2)} + {n2(r.H)}) × {n2(r.d.P)} = <strong>{n2(r.coffrage)} m²</strong>
      </>
    ),
  },
  schema: ({ r }) => <MassifVueFace d={r.d} k={Math.min(200 / r.d.L, 150 / r.H)} />,
  alerte: (r) => (r.d.a > r.d.L ? 'La partie haute ne peut pas être plus longue que le massif.' : undefined),
};

// ---------- Section en T (N0.5.6) ----------
type ResT = ReturnType<typeof sectionT> & { d: DonneesSectionT };

const cm = (cle: string, libelle: string, symbole: string, min: number, max: number) => ({ cle, libelle, symbole, unite: 'cm', min, max, pas: 1, decimales: 0 }) as const;

const gravite: DefinitionCalcul<ResT> = {
  champs: [cm('b', 'largeur de la table', 'b', 20, 200), cm('hf', 'épaisseur de la table', 'hf', 5, 40), cm('bw', 'largeur de l’âme', 'bw', 10, 60), cm('h', 'hauteur totale', 'h', 20, 120)],
  defaut: { ...EXEMPLE_SECTION_T },
  calculer: (e) => {
    const d = { b: num(e, 'b'), hf: num(e, 'hf'), bw: num(e, 'bw'), h: num(e, 'h') };
    return { ...sectionT(d), d };
  },
  valeurs: { yG: (r) => grandeur(r.yG, 2, 'cm'), vSup: (r) => grandeur(r.vSup, 2, 'cm'), A: (r) => grandeur(r.A, 0, 'cm²') },
  lignes: {
    morceaux: (r) => (
      <>
        {r.morceaux.map((x, i) => (
          <span key={x.nom}>
            {i ? ' ; ' : ''}
            {x.nom} : A = {nombre(x.A, 0)} cm², y = {n2(x.y)} cm, A × y = {nombre(x.A * x.y, 0)} cm³
          </span>
        ))}
      </>
    ),
    yG: (r) => (
      <>
        yG = Σ A y / Σ A = {nombre(r.Sx, 0)} / {nombre(r.A, 0)} = <strong>{n2(r.yG)} cm</strong> depuis la fibre inférieure
      </>
    ),
    sup: (r) => (
      <>
        distance à la fibre supérieure : h − yG = {r.d.h} − {n2(r.yG)} = <strong>{n2(r.vSup)} cm</strong> ; par symétrie, xG = 0 (sur l’axe de l’âme)
      </>
    ),
  },
  schema: ({ r }) => <SectionTSchema d={r.d} r={r} />,
  alerte: (r) => (r.d.bw > r.d.b || r.d.hf >= r.d.h ? 'Section impossible : l’âme doit être plus étroite que la table, et la table moins haute que la section.' : undefined),
};

// ---------- La petite maison (N0.5.P) ----------
type ResMaison = ResultatMaison & { d: DonneesMaison };

const maisonDef: DefinitionCalcul<ResMaison> = {
  champs: [
    m('Lext', 'longueur hors tout', 'L', 4, 20),
    m('lext', 'largeur hors tout', 'l', 3, 15),
    { cle: 'e', libelle: 'épaisseur des murs', symbole: 'e', unite: 'cm', min: 10, max: 40, pas: 1, decimales: 0 },
    m('Hmur', 'hauteur des murs', 'H', 2, 4),
    m('Bsem', 'largeur des semelles', 'B', 0.3, 1.2),
    m('hsem', 'épaisseur des semelles', 'hₛ', 0.15, 0.6),
    m('Bfouille', 'largeur des tranchées', 'Bₜ', 0.3, 1.5),
    m('Dfouille', 'profondeur des tranchées', 'D', 0.3, 1.5),
    { cle: 'edalle', libelle: 'épaisseur du dallage', symbole: 'e_d', unite: 'cm', min: 8, max: 25, pas: 1, decimales: 0 },
    { cle: 'ouvertures', libelle: 'surface des baies (énoncé)', symbole: 'S_b', unite: 'm²', min: 0, max: 40, pas: 0.01, decimales: 2 },
  ],
  defaut: { ...EXEMPLE_MAISON, e: EXEMPLE_MAISON.e * 100, edalle: EXEMPLE_MAISON.edalle * 100 },
  calculer: (e) => {
    const d = {
      Lext: num(e, 'Lext'),
      lext: num(e, 'lext'),
      e: num(e, 'e') / 100,
      Hmur: num(e, 'Hmur'),
      Bsem: num(e, 'Bsem'),
      hsem: num(e, 'hsem'),
      Bfouille: num(e, 'Bfouille'),
      Dfouille: num(e, 'Dfouille'),
      edalle: num(e, 'edalle') / 100,
      ouvertures: num(e, 'ouvertures'),
    };
    return { ...maison(d), d };
  },
  valeurs: {
    axe: (r) => grandeur(r.longueurAxe, 2, 'm'),
    Sint: (r) => grandeur(r.Sint, 2, 'm²'),
    Vfouille: (r) => grandeur(r.Vfouille, 2, 'm³'),
    Vsemelle: (r) => grandeur(r.Vsemelle, 2, 'm³'),
    Vdalle: (r) => grandeur(r.Vdalle, 2, 'm³'),
    Vbeton: (r) => grandeur(r.Vbeton, 2, 'm³'),
    SmurNet: (r) => grandeur(r.SmurNet, 2, 'm²'),
    Vmac: (r) => grandeur(r.Vmaconnerie, 2, 'm³'),
    toupies: (r) => `${r.toupies} toupies`,
  },
  lignes: {
    axe: (r) => (
      <>
        longueur à l’axe : 2 × (L − e) + 2 × (l − e) = 2 × {n2(r.d.Lext - r.d.e)} + 2 × {n2(r.d.lext - r.d.e)} = <strong>{n2(r.longueurAxe)} m</strong>
      </>
    ),
    surfaces: (r) => (
      <>
        emprise {n2(r.d.Lext)} × {n2(r.d.lext)} = {n2(r.emprise)} m² ; intérieur (L − 2e) × (l − 2e) = {n2(r.d.Lext - 2 * r.d.e)} × {n2(r.d.lext - 2 * r.d.e)} = <strong>{n2(r.Sint)} m²</strong>
      </>
    ),
    fouille: (r) => (
      <>
        fouille : {n2(r.longueurAxe)} × {n2(r.d.Bfouille)} × {n2(r.d.Dfouille)} = <strong>{n3(r.Vfouille)} m³</strong>
      </>
    ),
    semelle: (r) => (
      <>
        semelles : {n2(r.longueurAxe)} × {n2(r.d.Bsem)} × {n2(r.d.hsem)} = <strong>{n3(r.Vsemelle)} m³</strong>
      </>
    ),
    dalle: (r) => (
      <>
        dallage : {n2(r.Sint)} × {n2(r.d.edalle)} = <strong>{n3(r.Vdalle)} m³</strong>
      </>
    ),
    murs: (r) => (
      <>
        murs : {n2(r.longueurAxe)} × {n2(r.d.Hmur)} = {n2(r.SmurBrut)} m² − baies {n2(r.d.ouvertures)} m² = <strong>{n2(r.SmurNet)} m²</strong> ; maçonnerie × {n2(r.d.e)} m = {n3(r.Vmaconnerie)} m³
      </>
    ),
    beton: (r) => (
      <>
        béton coulé en place : {n3(r.Vsemelle)} + {n3(r.Vdalle)} = <strong>{n3(r.Vbeton)} m³</strong> → {r.toupies} toupies de 8 m³ (si livré en une fois)
      </>
    ),
  },
  schema: ({ r }) => <MaisonPlan d={r.d} r={r} prefixe="mp-fiche" />,
  schemas: { coupe: ({ r }) => <CoupeSemelleFilante d={r.d} prefixe="csf-fiche" /> },
};

export const CALCULS_GEOMETRIE = { dalleL: dalle, ombre, fouille, coordonnees, massif, gravite, maison: maisonDef } as const;
