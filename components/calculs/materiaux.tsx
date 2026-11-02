// Fiches de calcul du module L2.6 (matériaux de construction). Les valeurs viennent de lib/calc/materiaux.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { BarresHA, ClassesExposition, ConeAbrams, CoupeChaussee, ElementsMaconnerie, EprouvetteTraction, EvaporationClimat, GranuloSable, Profiles, TroncBois, VolumesBeton, VolumesEchantillon } from '@/components/schemas/Materiaux2';
import {
  analyseGranulo,
  barreHA,
  classeAffaissement,
  controleExposition,
  effortNuance,
  ELEMENTS,
  elementsParM2,
  enduit,
  enduitSuperficiel,
  essaiTraction,
  evaporation,
  EXPOSITION,
  formulation,
  humiditeBois,
  lotBarres,
  NUANCES,
  proprietesPhysiques,
  retraitBois,
  TAMIS,
  type DonneesFormulation,
} from '@/lib/calc/materiaux';
import { grandeur, nombre } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const pc = (x: number, d = 1) => `${nombre(x * 100, d)} %`;
const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

// ---------- L2.6.1 : propriétés physiques ----------
type ResPhys = ReturnType<typeof proprietesPhysiques> & { ms: number; msat: number; Vapp: number; rhoAbs: number };
const physDef: DefinitionCalcul<ResPhys> = {
  champs: [champ('ms', 'masse sèche', <>m<sub>s</sub></>, 'g', 10, 20000, 1, 0), champ('msat', 'masse saturée', <>m<sub>sat</sub></>, 'g', 10, 25000, 1, 0), champ('Vapp', 'volume apparent', <>V<sub>app</sub></>, 'cm³', 10, 20000, 1, 0), champ('rhoAbs', 'masse volumique absolue', <>ρ<sub>abs</sub></>, 'g/cm³', 1, 8, 0.01, 2)],
  defaut: { ms: 2150, msat: 2430, Vapp: 1220, rhoAbs: 2.65 },
  calculer: (e) => {
    const d = { ms: num(e, 'ms'), msat: Math.max(num(e, 'msat'), num(e, 'ms')), Vapp: num(e, 'Vapp'), rhoAbs: num(e, 'rhoAbs') };
    return { ...proprietesPhysiques(d), ...d };
  },
  valeurs: { rho: (r) => grandeur(r.rhoApp, 3, 'g/cm³'), porosite: (r) => pc(r.porosite), absorption: (r) => pc(r.absorption) },
  lignes: {
    rho: (r) => (
      <>
        ρ<sub>app</sub> = m<sub>s</sub>/V<sub>app</sub> = {nombre(r.ms, 0)}/{nombre(r.Vapp, 0)} = <strong>{n3(r.rhoApp)} g/cm³</strong>
      </>
    ),
    porosite: (r) => (
      <>
        volume du solide V<sub>s</sub> = m<sub>s</sub>/ρ<sub>abs</sub> = {n1(r.Vs)} cm³ ; porosité n = 1 − V<sub>s</sub>/V<sub>app</sub> = <strong>{pc(r.porosite)}</strong>
      </>
    ),
    absorption: (r) => (
      <>
        absorption = (m<sub>sat</sub> − m<sub>s</sub>)/m<sub>s</sub> = {nombre(r.msat - r.ms, 0)}/{nombre(r.ms, 0)} = <strong>{pc(r.absorption)}</strong>
      </>
    ),
  },
  schema: ({ r }) => <VolumesEchantillon d={r} />,
};

// ---------- L2.6.2 : essai de traction ----------
type ResTrac = ReturnType<typeof essaiTraction> & { d0: number; L0: number; Lu: number; du: number; Fe: number; Fm: number };
const tracDef: DefinitionCalcul<ResTrac> = {
  champs: [champ('d0', 'diamètre initial', <>d<sub>0</sub></>, 'mm', 6, 40, 0.1, 1), champ('L0', 'longueur entre repères', <>L<sub>0</sub></>, 'mm', 20, 400, 1, 0), champ('Fe', 'force à la limite d’élasticité', <>F<sub>e</sub></>, 'kN', 1, 1000, 0.5, 1), champ('Fm', 'force maximale', <>F<sub>m</sub></>, 'kN', 1, 1000, 0.5, 1), champ('Lu', 'longueur après rupture', <>L<sub>u</sub></>, 'mm', 20, 500, 0.1, 1), champ('du', 'diamètre à la striction', <>d<sub>u</sub></>, 'mm', 1, 40, 0.1, 1)],
  defaut: { d0: 12, L0: 60, Fe: 58, Fm: 67, Lu: 70.8, du: 8.4 },
  calculer: (e) => {
    const d = { d0: num(e, 'd0'), L0: num(e, 'L0'), Fe: num(e, 'Fe'), Fm: Math.max(num(e, 'Fm'), num(e, 'Fe')), Lu: num(e, 'Lu'), du: num(e, 'du') };
    return { ...essaiTraction(d), ...d };
  },
  valeurs: { Re: (r) => grandeur(r.Re, 0, 'MPa'), Rm: (r) => grandeur(r.Rm, 0, 'MPa'), A: (r) => pc(r.A), rapport: (r) => n2(r.rapport) },
  lignes: {
    S0: (r) => (
      <>
        S<sub>0</sub> = π d<sub>0</sub>²/4 = <strong>{n1(r.S0)} mm²</strong>
      </>
    ),
    R: (r) => (
      <>
        R<sub>e</sub> = F<sub>e</sub>/S<sub>0</sub> = <strong>{nombre(r.Re, 0)} MPa</strong> ; R<sub>m</sub> = F<sub>m</sub>/S<sub>0</sub> = <strong>{nombre(r.Rm, 0)} MPa</strong> ; R<sub>m</sub>/R<sub>e</sub> = {n2(r.rapport)}
      </>
    ),
    A: (r) => (
      <>
        allongement après rupture A = (L<sub>u</sub> − L<sub>0</sub>)/L<sub>0</sub> = <strong>{pc(r.A)}</strong> ; striction Z = {pc(r.Z)}
      </>
    ),
  },
  schema: ({ r }) => <EprouvetteTraction d0={r.d0} du={r.du} L0={r.L0} Lu={r.Lu} />,
};

// ---------- L2.6.4 / L2.6.5 : granulométrie ----------
const CLES_T = ['t0', 't1', 't2', 't3', 't4', 't5', 't6'] as const;
type ResGran = ReturnType<typeof analyseGranulo> & { retenus: number[]; fond: number };
const granDef: DefinitionCalcul<ResGran> = {
  champs: [...CLES_T.map((c, i) => champ(c, `retenu sur ${nombre(TAMIS[i]!, 3)} mm`, <>m<sub>{nombre(TAMIS[i]!, 3)}</sub></>, 'g', 0, 2000, 1, 0)), champ('fond', 'passant au fond', 'fond', 'g', 0, 500, 1, 0)],
  defaut: { t0: 42, t1: 118, t2: 236, t3: 262, t4: 168, t5: 96, t6: 48, fond: 30 },
  calculer: (e) => {
    const retenus = [...CLES_T.map((c) => num(e, c)), 0, 0, 0];
    const fond = num(e, 'fond');
    return { ...analyseGranulo(retenus, fond), retenus, fond };
  },
  valeurs: { mf: (r) => n2(r.mf), fines: (r) => pc(r.fines / 100) },
  lignes: {
    total: (r) => (
      <>
        masse totale = {nombre(r.total, 0)} g ; fines (&lt; 0,063 mm) = {n1(r.fines)} %
      </>
    ),
    refus: (r) => (
      <>
        refus cumulés (%) : {TAMIS.slice(0, 7).map((t, i) => `${nombre(t, 3)} mm : ${n1(r.refusCumules[i]!)}`).join(' ; ')}
      </>
    ),
    mf: (r) => (
      <>
        MF = somme des refus cumulés sur 0,125 – 0,25 – 0,5 – 1 – 2 – 4 mm, divisée par 100 = <strong>{n2(r.mf)}</strong>
      </>
    ),
  },
  schema: ({ r }) => <GranuloSable retenus={r.retenus} fond={r.fond} />,
  alerte: (r) => (r.mf < 1.8 ? 'Sable très fin : il demande beaucoup d’eau ; le corriger avec un sable plus grossier.' : r.mf > 3.2 ? 'Sable grossier : béton peu maniable, risque de ségrégation.' : undefined),
};

// ---------- L2.6.7 : affaissement ----------
type ResAff = { a: number; classe: string };
const affDef: DefinitionCalcul<ResAff> = {
  champs: [champ('a', 'affaissement mesuré', 'a', 'mm', 0, 260, 5, 0)],
  defaut: { a: 80 },
  calculer: (e) => ({ a: num(e, 'a'), classe: classeAffaissement(num(e, 'a')) }),
  valeurs: { classe: (r) => r.classe },
  lignes: {
    mesure: (r) => (
      <>
        hauteur du moule 300 mm − hauteur du béton affaissé = <strong>{nombre(r.a, 0)} mm</strong>
      </>
    ),
    classe: (r) => (
      <>
        tableau des classes de l’EN 206 : <strong>{r.classe}</strong>
      </>
    ),
  },
  schema: ({ r }) => <ConeAbrams affaissement={r.a} />,
};

// ---------- L2.6.8 et L2.6.P : formulation ----------
type ResForm = ReturnType<typeof formulation> & { d: DonneesFormulation };
const formDef: DefinitionCalcul<ResForm> = {
  champs: [
    champ('fcm', 'résistance moyenne visée', <>f<sub>cm</sub></>, 'MPa', 15, 60, 0.5, 1),
    champ('sigmaC', 'classe vraie du ciment', <>σ<sub>c</sub></>, 'MPa', 30, 60, 0.5, 1),
    champ('G', 'coefficient granulaire', 'G', '', 0.35, 0.65, 0.01, 2),
    champ('C', 'dosage en ciment', 'C', 'kg/m³', 250, 500, 5, 0),
    champ('air', 'air occlus', 'air', 'L/m³', 0, 60, 1, 0),
    champ('pSable', 'part du sable (volume absolu des granulats)', 'S/G', '%', 25, 55, 1, 0),
    champ('rhoG', 'masse volumique absolue des granulats', <>ρ<sub>g</sub></>, 'kg/L', 2.3, 3, 0.01, 2),
  ],
  defaut: { fcm: 33, sigmaC: 45, G: 0.5, C: 350, air: 15, pSable: 40, rhoG: 2.65 },
  calculer: (e) => {
    const d: DonneesFormulation = { fcm: num(e, 'fcm'), sigmaC: num(e, 'sigmaC'), G: num(e, 'G'), C: num(e, 'C'), air: num(e, 'air'), pSable: num(e, 'pSable'), rhoC: 3.1, rhoG: num(e, 'rhoG') };
    return { ...formulation(d), d };
  },
  valeurs: { E: (r) => grandeur(r.E, 0, 'L'), EC: (r) => n2(r.EsurC), sable: (r) => grandeur(r.sable, 0, 'kg'), gravier: (r) => grandeur(r.gravier, 0, 'kg'), sacs: (r) => n1(r.sacs) },
  lignes: {
    CE: (r) => (
      <>
        Bolomey : C/E = f<sub>cm</sub>/(G σ<sub>c</sub>) + 0,5 = {n1(r.d.fcm)}/({n2(r.d.G)} × {n1(r.d.sigmaC)}) + 0,5 = <strong>{n3(r.CsurE)}</strong> (E/C = {n2(r.EsurC)})
      </>
    ),
    E: (r) => (
      <>
        E = C/(C/E) = {nombre(r.d.C, 0)}/{n3(r.CsurE)} = <strong>{nombre(r.E, 0)} L</strong>
      </>
    ),
    volumes: (r) => (
      <>
        volumes absolus : ciment {n1(r.Vc)} L + eau {nombre(r.E, 0)} L + air {nombre(r.d.air, 0)} L ; granulats 1 000 − … = <strong>{n1(r.Vg)} L</strong>
      </>
    ),
    masses: (r) => (
      <>
        sable {nombre(r.d.pSable, 0)} % : {n1(r.Vsable)} L × {n2(r.d.rhoG)} = <strong>{nombre(r.sable, 0)} kg</strong> ; gravier {n1(r.Vgravier)} L → <strong>{nombre(r.gravier, 0)} kg</strong> ; masse du m³ ≈ {nombre(r.masse, 0)} kg
      </>
    ),
  },
  schema: ({ r }) => <VolumesBeton d={r.d} />,
  alerte: (r) => (r.EsurC > 0.6 ? 'E/C supérieur à 0,60 : durabilité insuffisante pour la plupart des classes d’exposition (L2.6.10).' : undefined),
};

// ---------- L2.6.10 : exposition ----------
type ResExpo = ReturnType<typeof controleExposition> & { C: number; E: number };
const expoDef: DefinitionCalcul<ResExpo> = {
  champs: [{ type: 'choix', cle: 'classe', libelle: 'classe d’exposition', symbole: 'X', options: EXPOSITION.map((x, i) => ({ valeur: i, libelle: `${x.classe} : ${x.milieu}` })) }, champ('C', 'dosage en ciment', 'C', 'kg/m³', 200, 500, 5, 0), champ('E', 'eau efficace', 'E', 'L/m³', 120, 250, 1, 0)],
  defaut: { classe: 3, C: 350, E: 178 },
  calculer: (e) => ({ ...controleExposition(num(e, 'classe'), num(e, 'C'), num(e, 'E')), C: num(e, 'C'), E: num(e, 'E') }),
  valeurs: { EC: (r) => n2(r.EsurC), verdict: (r) => (r.okEC && r.okC ? 'conforme' : 'non conforme') },
  lignes: {
    exigences: (r) => (
      <>
        {r.classe} ({r.milieu}) : classe minimale {r.fck}, E/C ≤ {n2(r.EC)}, ciment ≥ {r.Cmin} kg/m³
      </>
    ),
    controle: (r) => (
      <>
        E/C = {nombre(r.E, 0)}/{nombre(r.C, 0)} = <strong>{n2(r.EsurC)}</strong> {r.okEC ? '≤' : '>'} {n2(r.EC)} ; C = {nombre(r.C, 0)} {r.okC ? '≥' : '<'} {r.Cmin} kg/m³ : <strong>{r.okEC && r.okC ? 'conforme' : 'non conforme'}</strong>
      </>
    ),
  },
  schema: () => <ClassesExposition />,
};

// ---------- L2.6.11 : évaporation ----------
type ResEvap = { Tc: number; Ta: number; r: number; V: number; E: number };
const evapDef: DefinitionCalcul<ResEvap> = {
  champs: [champ('Tc', 'température du béton', <>T<sub>c</sub></>, '°C', 10, 45, 1, 0), champ('Ta', 'température de l’air', <>T<sub>a</sub></>, '°C', 10, 45, 1, 0), champ('r', 'humidité relative', 'HR', '%', 10, 100, 1, 0), champ('V', 'vitesse du vent', 'V', 'km/h', 0, 40, 1, 0)],
  defaut: { Tc: 30, Ta: 32, r: 50, V: 16 },
  calculer: (e) => {
    const d = { Tc: num(e, 'Tc'), Ta: num(e, 'Ta'), r: num(e, 'r') / 100, V: num(e, 'V') };
    return { ...d, E: evaporation(d.Tc, d.Ta, d.r, d.V) };
  },
  valeurs: { E: (r) => grandeur(r.E, 2, 'kg/m²/h') },
  lignes: {
    formule: (r) => (
      <>
        E = 5 [(T<sub>c</sub> + 18)<sup>2,5</sup> − HR (T<sub>a</sub> + 18)<sup>2,5</sup>] (V + 4) × 10⁻⁶ = 5 [{nombre(r.Tc + 18, 0)}<sup>2,5</sup> − {n2(r.r)} × {nombre(r.Ta + 18, 0)}<sup>2,5</sup>] × {nombre(r.V + 4, 0)} × 10⁻⁶ = <strong>{n2(r.E)} kg/m²/h</strong>
      </>
    ),
    lecture: (r) => (
      <>
        {r.E >= 1 ? 'risque élevé de fissuration plastique : protéger immédiatement (bâches, pulvérisation, produit de cure)' : r.E >= 0.5 ? 'risque modéré : cure dès la fin du talochage' : 'risque faible : cure normale'}
      </>
    ),
  },
  schema: ({ r }) => <EvaporationClimat Tc={r.Tc} Ta={r.Ta} r={r.r} V={r.V} />,
  alerte: (r) => (r.E >= 1 ? 'Évaporation supérieure à 1 kg/m²/h : bétonner tôt le matin ou en fin de journée et protéger la surface.' : undefined),
};

// ---------- L2.6.12 : mortier ----------
type ResEnd = ReturnType<typeof enduit> & { S: number; e: number; dosage: number };
const endDef: DefinitionCalcul<ResEnd> = {
  champs: [champ('S', 'surface à enduire', 'S', 'm²', 1, 2000, 1, 0), champ('e', 'épaisseur', 'e', 'mm', 5, 30, 1, 0), champ('dosage', 'dosage en ciment', 'C', 'kg/m³', 200, 500, 10, 0)],
  defaut: { S: 50, e: 15, dosage: 350 },
  calculer: (e) => {
    const d = { S: num(e, 'S'), e: num(e, 'e'), dosage: num(e, 'dosage') };
    return { ...enduit(d.S, d.e, d.dosage), ...d };
  },
  valeurs: { V: (r) => grandeur(r.V, 3, 'm³'), sacs: (r) => `${r.sacs} sacs`, sable: (r) => grandeur(r.sable, 2, 'm³') },
  lignes: {
    V: (r) => (
      <>
        V = S × e × 1,10 (pertes) = {nombre(r.S, 0)} × {n3(r.e / 1000)} × 1,10 = <strong>{n3(r.V)} m³</strong>
      </>
    ),
    ciment: (r) => (
      <>
        ciment = {n3(r.V)} × {nombre(r.dosage, 0)} = {n1(r.ciment)} kg → <strong>{r.sacs} sacs de 50 kg</strong> ; sable ≈ {n2(r.sable)} m³
      </>
    ),
  },
  schema: () => <ElementsMaconnerie />,
};

// ---------- L2.6.13 : aciers ----------
type ResHA = ReturnType<typeof lotBarres> & { n: number; d: number; L: number };
const haDef: DefinitionCalcul<ResHA> = {
  champs: [champ('n', 'nombre de barres', 'n', '', 1, 50, 1, 0), { type: 'choix', cle: 'd', libelle: 'diamètre', symbole: 'Ø', options: [6, 8, 10, 12, 14, 16, 20, 25, 32].map((d) => ({ valeur: d, libelle: `HA ${d}` })) }, champ('L', 'longueur', 'L', 'm', 0.5, 12, 0.1, 1)],
  defaut: { n: 4, d: 12, L: 6 },
  calculer: (e) => {
    const d = { n: Math.round(num(e, 'n')), d: num(e, 'd'), L: num(e, 'L') };
    return { ...lotBarres(d.n, d.d, d.L), ...d };
  },
  valeurs: { A: (r) => grandeur(r.A, 0, 'mm²'), masse: (r) => grandeur(r.masse, 1, 'kg') },
  lignes: {
    unite: (r) => (
      <>
        une barre HA {r.d} : A = π {r.d}²/4 = {n1(barreHA(r.d).A)} mm² ; masse = A × 7 850 = {n3(barreHA(r.d).masse)} kg/m
      </>
    ),
    lot: (r) => (
      <>
        {r.n} HA {r.d} : A = <strong>{nombre(r.A, 0)} mm²</strong> ; masse sur {n1(r.L)} m = <strong>{n1(r.masse)} kg</strong>
      </>
    ),
  },
  schema: ({ r }) => <BarresHA diametres={[8, 10, r.d === 8 || r.d === 10 ? 12 : r.d, 16, 20]} />,
};

// ---------- L2.6.14 : nuances ----------
type ResNu = ReturnType<typeof effortNuance> & { A: number };
const nuDef: DefinitionCalcul<ResNu> = {
  champs: [champ('A', 'section du tirant', 'A', 'mm²', 50, 10000, 10, 0), { type: 'choix', cle: 'nuance', libelle: 'nuance', symbole: 'S', options: NUANCES.map((n, i) => ({ valeur: i, libelle: n.nuance })) }],
  defaut: { A: 1000, nuance: 0 },
  calculer: (e) => ({ ...effortNuance(num(e, 'A'), num(e, 'nuance')), A: num(e, 'A') }),
  valeurs: { N: (r) => grandeur(r.N, 0, 'kN') },
  lignes: {
    fy: (r) => (
      <>
        {r.nuance} : f<sub>y</sub> = {r.fy} MPa, f<sub>u</sub> = {r.fu} MPa (épaisseur ≤ 16 mm)
      </>
    ),
    N: (r) => (
      <>
        N = A f<sub>y</sub> = {nombre(r.A, 0)} × {r.fy} = <strong>{nombre(r.N, 0)} kN</strong> (sans coefficient partiel)
      </>
    ),
  },
  schema: () => <Profiles />,
};

// ---------- L2.6.15 : bois ----------
type ResBois = { mh: number; ms: number; H: number; retrait: number; largeur: number; Hfin: number };
const boisDef: DefinitionCalcul<ResBois> = {
  champs: [champ('mh', 'masse humide de l’éprouvette', <>m<sub>h</sub></>, 'g', 1, 2000, 1, 0), champ('ms', 'masse anhydre', <>m<sub>s</sub></>, 'g', 1, 2000, 1, 0), champ('largeur', 'largeur de la planche', 'b', 'mm', 20, 400, 1, 0), champ('Hfin', 'humidité en service', <>H<sub>f</sub></>, '%', 6, 25, 1, 0)],
  defaut: { mh: 560, ms: 480, largeur: 150, Hfin: 12 },
  calculer: (e) => {
    const mh = num(e, 'mh');
    const ms = Math.min(num(e, 'ms'), mh);
    const H = humiditeBois(mh, ms).H;
    return { mh, ms, H, largeur: num(e, 'largeur'), Hfin: num(e, 'Hfin'), retrait: retraitBois(num(e, 'largeur'), H * 100, num(e, 'Hfin'), 0.2) };
  },
  valeurs: { H: (r) => pc(r.H), retrait: (r) => grandeur(r.retrait, 1, 'mm') },
  lignes: {
    H: (r) => (
      <>
        H = (m<sub>h</sub> − m<sub>s</sub>)/m<sub>s</sub> = ({nombre(r.mh, 0)} − {nombre(r.ms, 0)})/{nombre(r.ms, 0)} = <strong>{pc(r.H)}</strong>
      </>
    ),
    retrait: (r) => (
      <>
        retrait tangentiel ≈ 0,2 % par point d’humidité sous 30 % : {n1(r.largeur)} mm × 0,2 % × ({nombre(Math.min(r.H * 100, 30), 1)} − {nombre(r.Hfin, 0)}) = <strong>{n1(r.retrait)} mm</strong>
      </>
    ),
  },
  schema: () => <TroncBois />,
};

// ---------- L2.6.16 : maçonnerie ----------
type ResMac = { S: number; i: number; n: number; total: number };
const macDef: DefinitionCalcul<ResMac> = {
  champs: [champ('S', 'surface de mur', 'S', 'm²', 1, 1000, 1, 0), { type: 'choix', cle: 'i', libelle: 'élément', symbole: 'él.', options: ELEMENTS.map((e, i) => ({ valeur: i, libelle: e.nom })) }],
  defaut: { S: 40, i: 0 },
  calculer: (e) => {
    const i = Math.round(num(e, 'i'));
    const n = elementsParM2(ELEMENTS[i] ?? ELEMENTS[0]!);
    return { S: num(e, 'S'), i, n, total: Math.ceil(num(e, 'S') * n * 1.05) };
  },
  valeurs: { n: (r) => n1(r.n), total: (r) => `${r.total} éléments` },
  lignes: {
    n: (r) => {
      const el = ELEMENTS[r.i] ?? ELEMENTS[0]!;
      return (
        <>
          {el.nom} : (L + j)(H + j) = ({n1(el.L)} + {n1(el.joint)}) × ({n1(el.H)} + {n1(el.joint)}) cm² → <strong>{n1(r.n)} éléments/m²</strong>
        </>
      );
    },
    total: (r) => (
      <>
        {nombre(r.S, 0)} m² × {n1(r.n)} × 1,05 (casse) = <strong>{r.total} éléments</strong>
      </>
    ),
  },
  schema: () => <ElementsMaconnerie />,
};

// ---------- L2.6.18 : enduit superficiel ----------
type ResES = ReturnType<typeof enduitSuperficiel> & { S: number; liant: number; grav: number };
const esDef: DefinitionCalcul<ResES> = {
  champs: [champ('S', 'surface de chaussée', 'S', 'm²', 100, 100000, 100, 0), champ('liant', 'dosage en liant', 'b', 'kg/m²', 0.5, 2.5, 0.1, 1), champ('grav', 'dosage en gravillons', 'g', 'L/m²', 4, 15, 0.5, 1)],
  defaut: { S: 7000, liant: 1.2, grav: 9 },
  calculer: (e) => {
    const d = { S: num(e, 'S'), liant: num(e, 'liant'), grav: num(e, 'grav') };
    return { ...enduitSuperficiel(d.S, d.liant, d.grav), ...d };
  },
  valeurs: { liant: (r) => grandeur(r.liantT, 1, 't'), grav: (r) => grandeur(r.gravM3, 0, 'm³') },
  lignes: {
    liant: (r) => (
      <>
        liant = {nombre(r.S, 0)} m² × {n1(r.liant)} kg/m² = <strong>{n1(r.liantT)} t</strong>
      </>
    ),
    grav: (r) => (
      <>
        gravillons = {nombre(r.S, 0)} × {n1(r.grav)} L = <strong>{nombre(r.gravM3, 0)} m³</strong>, soit {r.camions} camions de 10 m³
      </>
    ),
  },
  schema: () => <CoupeChaussee />,
};

export const CALCULS_MATERIAUX = {
  proprietesPhysiques: physDef,
  essaiTractionAcier: tracDef,
  granulometrieSable: granDef,
  affaissementBeton: affDef,
  formulationBeton: formDef,
  expositionBeton: expoDef,
  evaporationBeton: evapDef,
  enduitMortier: endDef,
  armaturesHA: haDef,
  nuanceAcier: nuDef,
  humiditeBois: boisDef,
  maconnerieMur: macDef,
  enduitSuperficiel: esDef,
} as const;
