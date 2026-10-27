// Fiches de calcul du module L1.8 (topographie I). Les valeurs viennent de lib/calc/topographie.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { FermetureTolerance, GisementSchema, LeverRayonnementSchema, NivellementDirect, PenteRuban, PlanCote, SerieMesures, StationTotale, TroisCoordonnees } from '@/components/schemas/Topographie';
import {
  carnetNivellement,
  correctionsRuban,
  DILATATION_ACIER,
  distancePlane,
  EXEMPLE_CHEMINEMENT,
  EXEMPLE_GRILLE,
  EXEMPLE_LEVER,
  EXEMPLE_RUBAN,
  EXEMPLE_SERIE,
  EXEMPLE_VISEE,
  fuseauUTM,
  grilleNivellement,
  leverRayonnement,
  problemeDirect,
  problemeInverse,
  statistiquesMesures,
  surfacePolygone,
  T_ETALONNAGE,
  viseeStation,
  type DonneesCheminement,
} from '@/lib/calc/topographie';
import { grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const n4 = (x: number) => nombre(x, 4);
const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

// ---------- L1.8.1 ----------
type ResCoord = { A: { E: number; N: number }; B: { E: number; N: number }; D: number; lon: number; fuseau: number; mc: number; Z: number };
const coordDef: DefinitionCalcul<ResCoord> = {
  champs: [
    champ('EA', 'E de la borne A', <>E<sub>A</sub></>, 'm', 500000, 560000, 0.01, 2),
    champ('NA', 'N de la borne A', <>N<sub>A</sub></>, 'm', 9500000, 9550000, 0.01, 2),
    champ('EB', 'E de la borne B', <>E<sub>B</sub></>, 'm', 500000, 560000, 0.01, 2),
    champ('NB', 'N de la borne B', <>N<sub>B</sub></>, 'm', 9500000, 9550000, 0.01, 2),
    champ('lon', 'longitude du chantier', 'λ', '°', 12, 31, 0.1, 1),
  ],
  defaut: { EA: 532418.25, NA: 9524672.4, EB: 532436.16, NB: 9524664.65, lon: 15.3 },
  calculer: (e) => {
    const A = { E: num(e, 'EA'), N: num(e, 'NA') };
    const B = { E: num(e, 'EB'), N: num(e, 'NB') };
    const u = fuseauUTM(num(e, 'lon'));
    return { A, B, D: distancePlane(A, B), lon: num(e, 'lon'), fuseau: u.fuseau, mc: u.meridienCentral, Z: 312.45 };
  },
  valeurs: { D: (r) => grandeur(r.D, 3, 'm'), fuseau: (r) => `fuseau ${r.fuseau}` },
  lignes: {
    fuseau: (r) => (
      <>
        fuseau = ⌊({nombre(r.lon, 1)} + 180) / 6⌋ + 1 = <strong>{r.fuseau}</strong> ; méridien central {r.fuseau} × 6 − 183 = {r.mc}°
      </>
    ),
    ecarts: (r) => (
      <>
        ΔE = {n2(r.B.E)} − {n2(r.A.E)} = {n2(r.B.E - r.A.E)} m ; ΔN = {n2(r.B.N)} − {n2(r.A.N)} = {n2(r.B.N - r.A.N)} m
      </>
    ),
    D: (r) => (
      <>
        D = √(ΔE² + ΔN²) = √({n2(r.B.E - r.A.E)}² + {n2(r.B.N - r.A.N)}²) = <strong>{n3(r.D)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <TroisCoordonnees E={r.A.E} N={r.A.N} Z={r.Z} />,
};

// ---------- L1.8.2 ----------
type ResRuban = ReturnType<typeof correctionsRuban> & { d: typeof EXEMPLE_RUBAN };
const rubanDef: DefinitionCalcul<ResRuban> = {
  champs: [
    champ('Lm', 'longueur lue sur le ruban', <>L<sub>m</sub></>, 'm', 1, 50, 0.001, 3),
    champ('reel', 'longueur réelle du ruban de 50 m (étalonnage)', <>L<sub>e</sub></>, 'm', 49.98, 50.02, 0.001, 3),
    champ('T', 'température pendant la mesure', 'T', '°C', 10, 45, 1, 0),
    champ('dh', 'dénivelée entre les extrémités', 'Δh', 'm', 0, 5, 0.01, 2),
  ],
  defaut: { Lm: EXEMPLE_RUBAN.Lm, reel: EXEMPLE_RUBAN.reel, T: EXEMPLE_RUBAN.T, dh: EXEMPLE_RUBAN.dh },
  calculer: (e) => {
    const d = { ...EXEMPLE_RUBAN, Lm: num(e, 'Lm'), reel: num(e, 'reel'), T: num(e, 'T'), dh: num(e, 'dh') };
    return { ...correctionsRuban(d), d };
  },
  valeurs: { Dh: (r) => grandeur(r.Dh, 3, 'm') },
  lignes: {
    etalon: (r) => (
      <>
        étalonnage : {n3(r.d.Lm)} × ({n3(r.d.reel)} − {r.d.nominal}) / {r.d.nominal} = <strong>{nombre(r.cEtalon * 1000, 1)} mm</strong>
      </>
    ),
    temp: (r) => (
      <>
        température : {n3(r.d.Lm)} × {nombre(DILATATION_ACIER * 1e6, 1)}·10⁻⁶ × ({r.d.T} − {T_ETALONNAGE}) = <strong>{nombre(r.cTemp * 1000, 1)} mm</strong>
      </>
    ),
    pente: (r) => (
      <>
        L = {n3(r.Lcorr)} m ; Dh = √(L² − Δh²) = √({n3(r.Lcorr)}² − {n2(r.d.dh)}²) = <strong>{n3(r.Dh)} m</strong> (correction de pente {nombre(r.cPente * 1000, 1)} mm)
      </>
    ),
  },
  schema: ({ r }) => <PenteRuban Lcorr={r.Lcorr} dh={r.d.dh} Dh={r.Dh} />,
};

// ---------- L1.8.3 ----------
type ResVisee = ReturnType<typeof viseeStation> & { d: typeof EXEMPLE_VISEE };
const viseeDef: DefinitionCalcul<ResVisee> = {
  champs: [
    champ('Di', 'distance inclinée', <>D<sub>i</sub></>, 'm', 5, 500, 0.001, 3),
    champ('V', 'angle zénithal', 'V', 'gon', 80, 120, 0.0001, 4),
    champ('hi', 'hauteur de l’instrument', <>h<sub>i</sub></>, 'm', 1.2, 1.8, 0.01, 2),
    champ('hp', 'hauteur du prisme', <>h<sub>p</sub></>, 'm', 1, 2.5, 0.01, 2),
  ],
  defaut: { ...EXEMPLE_VISEE },
  calculer: (e) => {
    const d = { Di: num(e, 'Di'), V: num(e, 'V'), hi: num(e, 'hi'), hp: num(e, 'hp') };
    return { ...viseeStation(d), d };
  },
  valeurs: { Dh: (r) => grandeur(r.Dh, 3, 'm'), dh: (r) => grandeur(r.dh, 3, 'm') },
  lignes: {
    Dh: (r) => (
      <>
        Dh = Di × sin V = {n3(r.d.Di)} × sin({n4(r.d.V)} gon) = <strong>{n3(r.Dh)} m</strong>
      </>
    ),
    dh: (r) => (
      <>
        Δh = Di × cos V + hi − hp = {n3(r.dhInstrument)} + {n2(r.d.hi)} − {n2(r.d.hp)} = <strong>{n3(r.dh)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <StationTotale {...r.d} Dh={r.Dh} dh={r.dh} />,
};

// ---------- L1.8.4 ----------
type ResNiv = { AR: number; AV: number; ZA: number; dh: number; ZB: number };
const nivDef: DefinitionCalcul<ResNiv> = {
  champs: [
    champ('ZA', 'altitude du repère A', <>Z<sub>A</sub></>, 'm', 0, 3000, 0.001, 3),
    champ('AR', 'lecture arrière sur A', 'AR', 'm', 0.2, 3.8, 0.001, 3),
    champ('AV', 'lecture avant sur B', 'AV', 'm', 0.2, 3.8, 0.001, 3),
  ],
  defaut: { ZA: 1243.567, AR: 1.524, AV: 0.876 },
  calculer: (e) => {
    const AR = num(e, 'AR');
    const AV = num(e, 'AV');
    const ZA = num(e, 'ZA');
    return { AR, AV, ZA, dh: AR - AV, ZB: ZA + AR - AV };
  },
  valeurs: { dh: (r) => grandeur(r.dh, 3, 'm'), ZB: (r) => grandeur(r.ZB, 3, 'm') },
  lignes: {
    dh: (r) => (
      <>
        Δh = AR − AV = {n3(r.AR)} − {n3(r.AV)} = <strong>{n3(r.dh)} m</strong>
      </>
    ),
    ZB: (r) => (
      <>
        Z<sub>B</sub> = Z<sub>A</sub> + Δh = {n3(r.ZA)} + ({n3(r.dh)}) = <strong>{n3(r.ZB)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <NivellementDirect AR={r.AR} AV={r.AV} ZA={r.ZA} />,
};

// ---------- L1.8.5 ----------
type ResCarnet = ReturnType<typeof carnetNivellement> & { d: DonneesCheminement };
const carnetDef: DefinitionCalcul<ResCarnet> = {
  champs: [
    ...EXEMPLE_CHEMINEMENT.stations.flatMap((s, i) => [champ(`AR${i}`, `station ${i + 1} : arrière sur ${s.de}`, <>AR<sub>{i + 1}</sub></>, 'm', 0.2, 3.8, 0.001, 3), champ(`AV${i}`, `station ${i + 1} : avant sur ${s.vers}`, <>AV<sub>{i + 1}</sub></>, 'm', 0.2, 3.8, 0.001, 3)]),
    champ('k', 'coefficient de tolérance (énoncé)', 'k', 'mm', 2, 20, 1, 0),
  ],
  defaut: { ...Object.fromEntries(EXEMPLE_CHEMINEMENT.stations.flatMap((s, i) => [[`AR${i}`, s.AR], [`AV${i}`, s.AV]])), k: EXEMPLE_CHEMINEMENT.k },
  calculer: (e) => {
    const d: DonneesCheminement = { ...EXEMPLE_CHEMINEMENT, k: num(e, 'k'), stations: EXEMPLE_CHEMINEMENT.stations.map((s, i) => ({ ...s, AR: num(e, `AR${i}`), AV: num(e, `AV${i}`) })) };
    return { ...carnetNivellement(d), d };
  },
  valeurs: { f: (r) => `${nombre(r.fermeture * 1000, 1)} mm`, T: (r) => `± ${nombre(r.tolerance * 1000, 1)} mm`, verdict: (r) => (r.admissible ? 'admissible' : 'hors tolérance') },
  lignes: {
    carnet: (r) => (
      <span className="grid">
        {r.lignes.map((l) => (
          <span key={l.vers} className="block">
            {l.de} → {l.vers} : {n3(l.AR)} − {n3(l.AV)} = {n3(l.dh)} m ; Z provisoire {n3(l.Zprov)} m
          </span>
        ))}
      </span>
    ),
    controle: (r) => (
      <>
        contrôle : ΣAR − ΣAV = {n3(r.sommeAR)} − {n3(r.sommeAV)} = {n3(r.controle)} m = Z arrivée − Z départ calculé
      </>
    ),
    fermeture: (r) => (
      <>
        fermeture f = {n3(r.lignes[r.n - 1]!.Zprov)} − {n3(r.d.Zarrivee)} = <strong>{nombre(r.fermeture * 1000, 1)} mm</strong> ; tolérance {r.d.k} √{r.n} = <strong>{nombre(r.tolerance * 1000, 1)} mm</strong>
      </>
    ),
    compensation: (r) => (
      <span className="grid">
        {r.lignes.map((l) => (
          <span key={l.vers} className="block">
            {l.vers} : {n3(l.Zprov)} {l.comp < 0 ? '−' : '+'} {nombre(Math.abs(l.comp) * 1000, 1)} mm = <strong>{n4(l.Z)} m</strong>
          </span>
        ))}
      </span>
    ),
  },
  schema: ({ r }) => <FermetureTolerance f={r.fermeture} T={r.tolerance} />,
  alerte: (r) => (r.admissible ? undefined : 'Fermeture hors tolérance : on ne compense pas, on refait le cheminement.'),
};

// ---------- L1.8.6 ----------
type ResGis = ReturnType<typeof problemeInverse> & { A: { E: number; N: number }; B: { E: number; N: number }; C: { E: number; N: number }; Gc: number; Dc: number };
const gisDef: DefinitionCalcul<ResGis> = {
  champs: [
    champ('EA', 'E de A', <>E<sub>A</sub></>, 'm', 0, 2000, 0.001, 3),
    champ('NA', 'N de A', <>N<sub>A</sub></>, 'm', 0, 2000, 0.001, 3),
    champ('EB', 'E de B', <>E<sub>B</sub></>, 'm', 0, 2000, 0.001, 3),
    champ('NB', 'N de B', <>N<sub>B</sub></>, 'm', 0, 2000, 0.001, 3),
    champ('Gc', 'gisement de A vers C (implantation)', <>G<sub>AC</sub></>, 'gon', 0, 400, 0.0001, 4),
    champ('Dc', 'distance de A à C', <>D<sub>AC</sub></>, 'm', 1, 500, 0.001, 3),
  ],
  defaut: { EA: 1000, NA: 1000, EB: 1086.42, NB: 951.37, Gc: 25.5, Dc: 40 },
  calculer: (e) => {
    const A = { E: num(e, 'EA'), N: num(e, 'NA') };
    const B = { E: num(e, 'EB'), N: num(e, 'NB') };
    return { ...problemeInverse(A, B), A, B, C: problemeDirect(A, num(e, 'Gc'), num(e, 'Dc')), Gc: num(e, 'Gc'), Dc: num(e, 'Dc') };
  },
  valeurs: { G: (r) => `${n4(r.G)} gon`, D: (r) => grandeur(r.D, 3, 'm') },
  lignes: {
    ecarts: (r) => (
      <>
        ΔE = {n3(r.dE)} m ; ΔN = {n3(r.dN)} m → quadrant {r.dE >= 0 ? (r.dN >= 0 ? '0 à 100' : '100 à 200') : r.dN < 0 ? '200 à 300' : '300 à 400'} gon
      </>
    ),
    inverse: (r) => (
      <>
        G<sub>AB</sub> = <strong>{n4(r.G)} gon</strong> ; D<sub>AB</sub> = √(ΔE² + ΔN²) = <strong>{n3(r.D)} m</strong>
      </>
    ),
    direct: (r) => (
      <>
        C : E = {n3(r.A.E)} + {n3(r.Dc)} × sin({n4(r.Gc)}) = <strong>{n3(r.C.E)} m</strong> ; N = {n3(r.A.N)} + {n3(r.Dc)} × cos({n4(r.Gc)}) = <strong>{n3(r.C.N)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <GisementSchema A={r.A} B={r.B} />,
};

// ---------- L1.8.7 ----------
type ResSerie = ReturnType<typeof statistiquesMesures> & { v: number[] };
const serieDef: DefinitionCalcul<ResSerie> = {
  champs: EXEMPLE_SERIE.map((x, i) => champ(`m${i}`, `mesure ${i + 1}`, <>m<sub>{i + 1}</sub></>, 'm', 48, 48.5, 0.001, 3)),
  defaut: Object.fromEntries(EXEMPLE_SERIE.map((x, i) => [`m${i}`, x])),
  calculer: (e) => {
    const v = EXEMPLE_SERIE.map((_, i) => num(e, `m${i}`));
    return { ...statistiquesMesures(v), v };
  },
  valeurs: { moyenne: (r) => grandeur(r.moyenne, 4, 'm'), sigma: (r) => `${nombre(r.sigma * 1000, 1)} mm`, T: (r) => `± ${nombre(r.tolerance * 1000, 1)} mm` },
  lignes: {
    moyenne: (r) => (
      <>
        moyenne = Σm / n = {n3(r.v.reduce((s, x) => s + x, 0))} / {r.n} = <strong>{n4(r.moyenne)} m</strong>
      </>
    ),
    sigma: (r) => (
      <>
        écarts : {r.ecarts.map((e) => nombre(e * 1000, 1)).join(' ; ')} mm ; σ = √(Σe² / (n − 1)) = <strong>{nombre(r.sigma * 1000, 2)} mm</strong>
      </>
    ),
    tol: (r) => (
      <>
        tolérance 2,7 σ = <strong>{nombre(r.tolerance * 1000, 1)} mm</strong> ; écart-type de la moyenne σ/√n = {nombre(r.sigmaMoyenne * 1000, 2)} mm ; hors tolérance : {r.horsTolerance.length ? r.horsTolerance.map(n3).join(', ') : 'aucune'}
      </>
    ),
  },
  schema: ({ r }) => <SerieMesures valeurs={r.v} moyenne={r.moyenne} tol={r.tolerance} />,
};

// ---------- L1.8.8 ----------
type ResLever = ReturnType<typeof leverRayonnement> & ReturnType<typeof surfacePolygone>;
const leverDef: DefinitionCalcul<ResLever> = {
  champs: EXEMPLE_LEVER.visees.flatMap((v, i) => [champ(`Hz${i}`, `${v.nom} : lecture horizontale`, <>Hz<sub>{v.nom}</sub></>, 'gon', 0, 400, 0.0001, 4), champ(`D${i}`, `${v.nom} : distance horizontale`, <>D<sub>{v.nom}</sub></>, 'm', 1, 60, 0.001, 3)]),
  defaut: Object.fromEntries(EXEMPLE_LEVER.visees.flatMap((v, i) => [[`Hz${i}`, v.Hz], [`D${i}`, v.D]])),
  calculer: (e) => {
    const l = leverRayonnement(EXEMPLE_LEVER.S, EXEMPLE_LEVER.Gref, EXEMPLE_LEVER.Hzref, EXEMPLE_LEVER.visees.map((v, i) => ({ nom: v.nom, Hz: num(e, `Hz${i}`), D: num(e, `D${i}`) })));
    return { ...l, ...surfacePolygone(l.points) };
  },
  valeurs: { S: (r) => grandeur(r.S, 2, 'm²'), per: (r) => grandeur(r.perimetre, 2, 'm') },
  lignes: {
    G0: (r) => (
      <>
        orientation : G<sub>0</sub> = G<sub>réf</sub> − Hz<sub>réf</sub> = {n4(EXEMPLE_LEVER.Gref)} − {n4(EXEMPLE_LEVER.Hzref)} = <strong>{n4(r.G0)} gon</strong>
      </>
    ),
    points: (r) => (
      <span className="grid">
        {r.points.map((p) => (
          <span key={p.nom} className="block">
            {p.nom} : G = {n4(p.G)} gon ; E = <strong>{n3(p.E)}</strong> ; N = <strong>{n3(p.N)}</strong>
          </span>
        ))}
      </span>
    ),
    S: (r) => (
      <>
        surface (formule de Gauss) = ½ |Σ (E<sub>i</sub> N<sub>i+1</sub> − E<sub>i+1</sub> N<sub>i</sub>)| = <strong>{n2(r.S)} m²</strong> ; périmètre {n2(r.perimetre)} m
      </>
    ),
  },
  schema: ({ r }) => <LeverRayonnementSchema S={EXEMPLE_LEVER.S} pts={r.points} Gref={EXEMPLE_LEVER.Gref} />,
};

// ---------- L1.8.P ----------
type ResGrille = ReturnType<typeof grilleNivellement> & { Zprojet: number; pas: number };
const grilleDef: DefinitionCalcul<ResGrille> = {
  champs: [
    champ('Zrepere', 'altitude du repère', <>Z<sub>R</sub></>, 'm', 0, 3000, 0.001, 3),
    champ('AR', 'lecture arrière sur le repère', 'AR', 'm', 0.5, 3, 0.001, 3),
    champ('Zprojet', 'cote projet de la plateforme', <>Z<sub>p</sub></>, 'm', 0, 3000, 0.01, 2),
  ],
  defaut: { Zrepere: EXEMPLE_GRILLE.Zrepere, AR: EXEMPLE_GRILLE.AR, Zprojet: EXEMPLE_GRILLE.Zprojet },
  calculer: (e) => {
    const d = { ...EXEMPLE_GRILLE, Zrepere: num(e, 'Zrepere'), AR: num(e, 'AR'), Zprojet: num(e, 'Zprojet') };
    return { ...grilleNivellement(d), Zprojet: d.Zprojet, pas: d.pas };
  },
  valeurs: { Zv: (r) => grandeur(r.Zv, 3, 'm'), Zmoy: (r) => grandeur(r.Zmoy, 3, 'm'), V: (r) => grandeur(Math.abs(r.volume), 1, 'm³'), sens: (r) => (r.volume >= 0 ? 'remblai' : 'déblai') },
  lignes: {
    Zv: (r) => (
      <>
        plan de visée : Z<sub>v</sub> = Z<sub>R</sub> + AR = <strong>{n3(r.Zv)} m</strong>
      </>
    ),
    Z: (r) => (
      <>
        chaque nœud : Z = Z<sub>v</sub> − lecture ; ex. premier nœud {n3(r.Zv)} − {n3(EXEMPLE_GRILLE.lectures[0]![0]!)} = <strong>{n3(r.Z[0]![0]!)} m</strong> ; de {n3(r.Zmin)} à {n3(r.Zmax)} m, moyenne {n3(r.Zmoy)} m
      </>
    ),
    V: (r) => (
      <>
        hauteurs h = Z<sub>p</sub> − Z ; volume = Σ (moyenne des 4 coins × {r.pas}²) = <strong>{nombre(r.volume, 1)} m³</strong> ({r.volume >= 0 ? 'remblai net' : 'déblai net'})
      </>
    ),
  },
  schema: ({ r }) => <PlanCote Z={r.Z} pas={r.pas} Zprojet={r.Zprojet} />,
};

export const CALCULS_TOPO = {
  coordonneesUTM: coordDef,
  correctionsRuban: rubanDef,
  viseeStation: viseeDef,
  nivellementDirect: nivDef,
  carnetNivellement: carnetDef,
  gisements: gisDef,
  serieMesures: serieDef,
  leverParcelle: leverDef,
  grilleTerrain: grilleDef,
} as const;
