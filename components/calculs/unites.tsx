// Fiches de calcul du module N0.3 (unités, conversions, ordres de grandeur). Les valeurs viennent de lib/calc/.

import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { ChargePonctuelle } from '@/components/drawing/Mecanique';
import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { ChaineConversion, EchellePrefixes } from '@/components/schemas/Unites';
import { analyser, ecrireDim, egales, formule, FORMULES, type AnalyseFormule, type Formule } from '@/lib/calc/dimensions';
import { MATERIAUX, poidsPrismeMateriau, type IdMateriau, type ResultatPoidsMateriau } from '@/lib/calc/materiauxCourants';
import { PESANTEUR, POIDS_VOLUMIQUE_BA } from '@/lib/calc/methode';
import {
  estimationBatiment,
  EXEMPLE_BATIMENT,
  EXEMPLE_POIDS_PROPRES,
  memeOrdre,
  poidsDalle,
  poidsLineaire,
  type DonneesBatiment,
  type ResultatBatiment,
  type ResultatPoidsPropre,
} from '@/lib/calc/ordres';
import {
  changerPrefixe,
  citerne,
  convertir,
  equivalents,
  EXEMPLE_CITERNE,
  G_NORMALE,
  prefixe,
  PREFIXES,
  pressionMoyenne,
  unite,
  type DonneesCiterne,
  type Equivalent,
  type ResultatCiterne,
  type ResultatPression,
} from '@/lib/calc/unites';
import { points } from '@/lib/drawing/repere';
import { exposantTexte, grandeur, nombre, nombreCourt, notationScientifique, puissanceDix } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);

/** Écriture lisible : décimale courte, ou notation scientifique pour les très grands et très petits nombres. */
export function ecrire(x: number): string {
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e9 || a < 1e-4)) {
    const { m, e } = notationScientifique(x);
    return `${nombreCourt(m, 4)} × ${puissanceDix(e)}`;
  }
  return nombreCourt(x, 6);
}

const pourcent = (x: number) => `${x >= 0 ? '+' : '−'}${nombre(Math.abs(x) * 100, 0)} %`;

// ---------- Changer de préfixe (N0.3.1) ----------
interface ResPrefixes {
  valeur: number;
  unite: string;
  de: string;
  vers: string;
  eDe: number;
  eVers: number;
  n: number;
  resultat: number;
}

const optionsPrefixes = PREFIXES.map((p) => ({ valeur: p.symbole, libelle: p.symbole ? `${p.symbole} (${p.nom}, ${puissanceDix(p.exposant)})` : 'sans préfixe (10⁰)' }));
const signe = (e: number) => (e < 0 ? `(${e})` : String(e));

const prefixes: DefinitionCalcul<ResPrefixes> = {
  champs: [
    { cle: 'valeur', libelle: 'valeur de départ', symbole: 'x', unite: '', min: 0.01, max: 1000, pas: 0.01, decimales: 2 },
    { type: 'choix', cle: 'unite', libelle: 'unité', symbole: 'u', options: ['m', 'g', 'L', 'N', 'Pa'].map((s) => ({ valeur: s, libelle: s })) },
    { type: 'choix', cle: 'de', libelle: 'préfixe de départ', symbole: 'de', options: optionsPrefixes },
    { type: 'choix', cle: 'vers', libelle: 'préfixe d’arrivée', symbole: 'vers', options: optionsPrefixes },
  ],
  defaut: { valeur: 200, unite: 'Pa', de: 'G', vers: 'M' },
  calculer: (e) => {
    const valeur = num(e, 'valeur');
    const de = String(e.de);
    const vers = String(e.vers);
    const r = changerPrefixe(valeur, de, vers);
    return { valeur, unite: String(e.unite), de, vers, eDe: prefixe(de).exposant, eVers: prefixe(vers).exposant, n: r.n, resultat: r.valeur };
  },
  valeurs: {
    resultat: (r) => `${ecrire(r.resultat)} ${r.vers}${r.unite}`,
    depart: (r) => `${ecrire(r.valeur)} ${r.de}${r.unite}`,
    facteur: (r) => `× ${puissanceDix(r.n)}`,
  },
  lignes: {
    exposants: (r) => (
      <>
        1 {r.de}
        {r.unite} = {puissanceDix(r.eDe)} {r.unite} ; 1 {r.vers}
        {r.unite} = {puissanceDix(r.eVers)} {r.unite}
      </>
    ),
    n: (r) => (
      <>
        n = {signe(r.eDe)} − {signe(r.eVers)} = <strong>{r.n}</strong>
      </>
    ),
    calcul: (r) => (
      <>
        {ecrire(r.valeur)} {r.de}
        {r.unite} = {ecrire(r.valeur)} × {puissanceDix(r.n)} {r.vers}
        {r.unite} ={' '}
        <strong>
          {ecrire(r.resultat)} {r.vers}
          {r.unite}
        </strong>
      </>
    ),
  },
  schema: ({ r }) => <EchellePrefixes de={r.de} vers={r.vers} unite={r.unite} />,
};

// ---------- Volume d'une citerne (N0.3.2) ----------
type ResCiterne = ResultatCiterne & { d: DonneesCiterne };

function CiterneSchema({ d, r }: { d: DonneesCiterne; r: ResultatCiterne }) {
  const H = d.h * 1.2;
  const k = Math.min(320 / (d.L + 0.45 * d.l), 165 / (H + 0.3 * d.l));
  const x0 = 130;
  const yb = 215;
  const ox = 0.45 * d.l * k;
  const oy = -0.3 * d.l * k;
  const w = d.L * k;
  const yt = yb - H * k;
  const yw = yb - d.h * k;
  return (
    <Figure alt={`Citerne de ${n2(d.L)} m × ${n2(d.l)} m avec ${n2(d.h)} m d'eau : ${n2(r.V)} m³, soit ${nombre(r.litres, 0)} L`} largeur={620} hauteur={250}>
      <polygon points={points([[x0, yw], [x0 + w, yw], [x0 + w + ox, yw + oy], [x0 + ox, yw + oy]])} fill="var(--fond-eau)" className="t-fin" />
      <rect x={x0} y={yw} width={w} height={yb - yw} fill="var(--fond-eau)" />
      <polygon points={points([[x0 + w, yw], [x0 + w + ox, yw + oy], [x0 + w + ox, yb + oy], [x0 + w, yb]])} fill="var(--fond-eau)" />
      <polygon points={points([[x0, yt], [x0 + w, yt], [x0 + w + ox, yt + oy], [x0 + ox, yt + oy]])} fill="none" className="t-moyen" />
      <polygon points={points([[x0 + w, yt], [x0 + w + ox, yt + oy], [x0 + w + ox, yb + oy], [x0 + w, yb]])} fill="none" className="t-moyen" />
      <rect x={x0} y={yt} width={w} height={yb - yt} fill="none" className="t-fort" />
      <Etiquette x={x0 + w / 2} y={(yw + yb) / 2 + 5} ancre="middle" taille={13} gras classe="encre">
        V = {n2(r.V)} m³ = {nombre(r.litres, 0)} L
      </Etiquette>
      <Cote x1={x0} y1={yb} x2={x0 + w} y2={yb} decalage={-18} texte={`L = ${n2(d.L)} m`} />
      <Cote x1={x0} y1={yb} x2={x0} y2={yw} decalage={22} texte={`h = ${n2(d.h)} m`} />
      <Etiquette x={x0 + w + ox / 2 + 10} y={yb + oy / 2 + 14} taille={12}>
        l = {n2(d.l)} m
      </Etiquette>
    </Figure>
  );
}

const citerneDef: DefinitionCalcul<ResCiterne> = {
  champs: [
    { cle: 'L', libelle: 'longueur intérieure', symbole: 'L', unite: 'm', min: 0.5, max: 8, pas: 0.05, decimales: 2 },
    { cle: 'l', libelle: 'largeur intérieure', symbole: 'l', unite: 'm', min: 0.5, max: 8, pas: 0.05, decimales: 2 },
    { cle: 'h', libelle: 'hauteur d’eau utile', symbole: 'h', unite: 'm', min: 0.2, max: 4, pas: 0.05, decimales: 2 },
    { cle: 'conso', libelle: 'consommation (énoncé)', symbole: 'c', unite: 'L/jour', min: 20, max: 2000, pas: 10, decimales: 0 },
  ],
  defaut: { ...EXEMPLE_CITERNE },
  calculer: (e) => {
    const d = { L: num(e, 'L'), l: num(e, 'l'), h: num(e, 'h'), conso: num(e, 'conso') };
    return { ...citerne(d), d };
  },
  valeurs: {
    V: (r) => grandeur(r.V, 2, 'm³'),
    litres: (r) => grandeur(r.litres, 0, 'L'),
    jours: (r) => `${r.jours} jours`,
    S: (r) => grandeur(r.S, 2, 'm²'),
  },
  lignes: {
    S: (r) => (
      <>
        S = L × l = {n2(r.d.L)} m × {n2(r.d.l)} m = <strong>{n2(r.S)} m²</strong>
      </>
    ),
    V: (r) => (
      <>
        V = S × h = {n2(r.S)} m² × {n2(r.d.h)} m = <strong>{n2(r.V)} m³</strong>
      </>
    ),
    litres: (r) => (
      <>
        1 m³ = 1 000 dm³ = 1 000 L ⇒ V = {n2(r.V)} × 1 000 = <strong>{nombre(r.litres, 0)} L</strong>
      </>
    ),
    jours: (r) => (
      <>
        {nombre(r.litres, 0)} L ÷ {nombre(r.d.conso, 0)} L/jour = {n2(r.joursExacts)} → <strong>{r.jours} jours</strong> complets
      </>
    ),
  },
  schema: ({ r }) => <CiterneSchema d={r.d} r={r} />,
};

// ---------- Pression sous une semelle (N0.3.3) ----------
type ResSemelle = ResultatPression & { N: number; B: number; L: number };

function SemelleSchema({ r }: { r: ResSemelle }) {
  const k = Math.min(110, 300 / Math.max(r.B, r.L));
  const cx = 190;
  const ySol = 150;
  const w = r.B * k;
  const hs = 0.4 * k;
  const a = 0.3 * k;
  const nb = Math.max(4, Math.round(w / 18));
  const kp = Math.min(130 / r.B, 130 / r.L, 60);
  return (
    <Figure alt={`Semelle de ${n2(r.B)} m × ${n2(r.L)} m chargée par ${nombre(r.N, 0)} kN : pression moyenne ${nombre(r.kPa, 0)} kPa`} largeur={620} hauteur={250}>
      <Hachures prefixe="sem" types={['ba', 'terre']} />
      <rect x={20} y={ySol} width={350} height={14} fill={hachure('sem', 'terre')} />
      <line x1={20} y1={ySol} x2={370} y2={ySol} className="t-moyen" />
      <rect x={cx - w / 2} y={ySol - hs} width={w} height={hs} fill={hachure('sem', 'ba')} className="t-fort" />
      <rect x={cx - a / 2} y={40} width={a} height={ySol - hs - 40} fill={hachure('sem', 'ba')} className="t-fort" />
      <ChargePonctuelle x={cx} y={38} longueur={30} texte={`N = ${nombre(r.N, 0)} kN`} />
      {Array.from({ length: nb + 1 }, (_, i) => cx - w / 2 + (i * w) / nb).map((xi) => (
        <ChargePonctuelle key={xi} x={xi} y={ySol + 2} angle={-90} longueur={26} />
      ))}
      <Etiquette x={cx} y={ySol + 46} ancre="middle" taille={12.5} gras classe="encre">
        σ = {nombre(r.kPa, 0)} kPa
      </Etiquette>
      <Cote x1={cx - w / 2} y1={ySol} x2={cx + w / 2} y2={ySol} decalage={-72} texte={`B = ${n2(r.B)} m`} />
      <Etiquette x={500} y={30} ancre="middle" taille={12} gras>
        vue en plan
      </Etiquette>
      <rect x={500 - (r.B * kp) / 2} y={110 - (r.L * kp) / 2} width={r.B * kp} height={r.L * kp} fill={hachure('sem', 'ba')} className="t-fort" />
      <Etiquette x={500} y={114} ancre="middle" taille={12} gras>
        A = {n2(r.A)} m²
      </Etiquette>
      <Etiquette x={500} y={110 + (r.L * kp) / 2 + 18} ancre="middle" taille={11}>
        {n2(r.B)} m × {n2(r.L)} m
      </Etiquette>
    </Figure>
  );
}

const semelle: DefinitionCalcul<ResSemelle> = {
  champs: [
    { cle: 'N', libelle: 'charge transmise par le poteau', symbole: 'N', unite: 'kN', min: 10, max: 2000, pas: 5, decimales: 0 },
    { cle: 'B', libelle: 'largeur de la semelle', symbole: 'B', unite: 'm', min: 0.4, max: 4, pas: 0.05, decimales: 2 },
    { cle: 'L', libelle: 'longueur de la semelle', symbole: 'L', unite: 'm', min: 0.4, max: 4, pas: 0.05, decimales: 2 },
  ],
  defaut: { N: 300, B: 1.2, L: 1.2 },
  calculer: (e) => {
    const N = num(e, 'N');
    const B = num(e, 'B');
    const L = num(e, 'L');
    return { ...pressionMoyenne(N, B, L), N, B, L };
  },
  valeurs: {
    kPa: (r) => grandeur(r.kPa, 0, 'kPa'),
    MPa: (r) => grandeur(r.MPa, 3, 'MPa'),
    bar: (r) => grandeur(r.bar, 2, 'bar'),
    A: (r) => grandeur(r.A, 2, 'm²'),
  },
  lignes: {
    A: (r) => (
      <>
        A = B × L = {n2(r.B)} m × {n2(r.L)} m = <strong>{n2(r.A)} m²</strong>
      </>
    ),
    sigma: (r) => (
      <>
        σ = N / A = {nombre(r.N, 0)} kN / {n2(r.A)} m² = <strong>{nombre(r.kPa, 0)} kN/m²</strong> = {nombre(r.kPa, 0)} kPa
      </>
    ),
    MPa: (r) => (
      <>
        1 MPa = 1 000 kPa ⇒ σ = {nombre(r.kPa, 0)} / 1 000 = <strong>{nombre(r.MPa, 3)} MPa</strong>
      </>
    ),
    bar: (r) => (
      <>
        1 bar = 100 kPa ⇒ σ = {nombre(r.kPa, 0)} / 100 = <strong>{n2(r.bar)} bar</strong>
      </>
    ),
  },
  schema: ({ r }) => <SemelleSchema r={r} />,
};

// ---------- Poids d'un prisme selon le matériau (N0.3.4) ----------
type ResMateriau = ResultatPoidsMateriau & { id: IdMateriau; L: number; b: number; h: number };

function PrismeSchema({ r }: { r: ResMateriau }) {
  const mat = MATERIAUX[r.id];
  const k = Math.min(420 / r.L, 150 / r.h);
  const w = r.L * k;
  const hh = r.h * k;
  const x0 = 310 - w / 2;
  const y0 = 40;
  return (
    <Figure alt={`Élément en ${mat.nom} de ${n2(r.L)} m × ${n2(r.b)} m × ${n2(r.h)} m : ${nombre(r.P, 2)} kN`} largeur={620} hauteur={hh + 100}>
      <Hachures prefixe="pri" types={[mat.hachure]} />
      <Etiquette x={310} y={22} ancre="middle" taille={12.5} gras>
        {mat.nom} : γ = {nombre(r.gamma, 2)} kN/m³ · ρ = {nombre(r.rho, 0)} kg/m³
      </Etiquette>
      <rect x={x0} y={y0} width={w} height={hh} fill={hachure('pri', mat.hachure)} className="t-fort" />
      <Cote x1={x0} y1={y0 + hh} x2={x0 + w} y2={y0 + hh} decalage={-20} texte={`L = ${n2(r.L)} m`} />
      <Cote x1={x0} y1={y0 + hh} x2={x0} y2={y0} decalage={22} texte={`h = ${n2(r.h)} m`} />
      <Etiquette x={310} y={y0 + hh + 54} ancre="middle" taille={11.5}>
        épaisseur (vers l’arrière) b = {n2(r.b)} m · V = {nombre(r.V, 3)} m³
      </Etiquette>
    </Figure>
  );
}

const optionsMateriaux = (Object.keys(MATERIAUX) as IdMateriau[]).map((id) => ({
  valeur: id,
  libelle: id === 'terre' ? `${MATERIAUX[id].nom} (hypothèse : ${MATERIAUX[id].gamma} kN/m³, à mesurer)` : MATERIAUX[id].nom,
}));

const materiau: DefinitionCalcul<ResMateriau> = {
  champs: [
    { type: 'choix', cle: 'id', libelle: 'matériau', symbole: 'mat.', options: optionsMateriaux },
    { cle: 'L', libelle: 'longueur', symbole: 'L', unite: 'm', min: 0.1, max: 12, pas: 0.05, decimales: 2 },
    { cle: 'b', libelle: 'épaisseur', symbole: 'b', unite: 'm', min: 0.05, max: 3, pas: 0.01, decimales: 2 },
    { cle: 'h', libelle: 'hauteur', symbole: 'h', unite: 'm', min: 0.05, max: 3, pas: 0.01, decimales: 2 },
  ],
  defaut: { id: 'ba', L: 5, b: 0.2, h: 0.4 },
  calculer: (e) => {
    const id = String(e.id) as IdMateriau;
    const L = num(e, 'L');
    const b = num(e, 'b');
    const h = num(e, 'h');
    return { ...poidsPrismeMateriau(id, L, b, h), id, L, b, h };
  },
  valeurs: {
    P: (r) => grandeur(r.P, 2, 'kN'),
    m: (r) => grandeur(r.m, 0, 'kg'),
    gamma: (r) => grandeur(r.gamma, 2, 'kN/m³'),
    rho: (r) => grandeur(r.rho, 0, 'kg/m³'),
    source: (r) => MATERIAUX[r.id].source,
  },
  lignes: {
    V: (r) => (
      <>
        V = L × b × h = {n2(r.L)} × {n2(r.b)} × {n2(r.h)} = <strong>{nombre(r.V, 3)} m³</strong>
      </>
    ),
    gamma: (r) => {
      const m = MATERIAUX[r.id] as { gamma?: number };
      return m.gamma !== undefined ? (
        <>
          γ = {nombre(r.gamma, 0)} kN/m³ (source) ⇒ ρ = γ / g = {nombre(r.gamma * 1000, 0)} N/m³ / {n2(PESANTEUR)} m/s² = <strong>{nombre(r.rho, 0)} kg/m³</strong>
        </>
      ) : (
        <>
          ρ = {nombre(r.rho, 0)} kg/m³ (source) ⇒ γ = ρ × g = {nombre(r.rho, 0)} × {n2(PESANTEUR)} = {nombre(r.rho * PESANTEUR, 0)} N/m³ = <strong>{n2(r.gamma)} kN/m³</strong>
        </>
      );
    },
    P: (r) => (
      <>
        P = γ × V = {n2(r.gamma)} kN/m³ × {nombre(r.V, 3)} m³ = <strong>{n2(r.P)} kN</strong>
      </>
    ),
    m: (r) => (
      <>
        m = ρ × V = {nombre(r.rho, 0)} kg/m³ × {nombre(r.V, 3)} m³ = <strong>{nombre(r.m, 0)} kg</strong>
      </>
    ),
  },
  schema: ({ r }) => <PrismeSchema r={r} />,
};

// ---------- Analyse dimensionnelle (N0.3.5) ----------
type ResHomogeneite = AnalyseFormule & { f: Formule };

const ecrireFacteur = (s: string, e: number) => `${s}${e === 1 ? '' : exposantTexte(e)}`;

function TableDims({ r }: { r: ResHomogeneite }) {
  const lignes = [{ nom: `gauche : ${r.f.gauche.symbole}`, d: r.gauche, ok: true }, ...r.termes.map((d, i) => ({ nom: r.termes.length > 1 ? `droite, terme ${i + 1}` : 'droite', d, ok: egales(d, r.gauche) }))];
  const colX = [150, 300, 380, 460];
  return (
    <Figure alt={`Exposants de M, L et T des deux membres de ${r.f.libelle} : ${r.homogene ? 'identiques, la formule est homogène' : 'différents, la formule est fausse'}`} largeur={620} hauteur={50 + lignes.length * 32}>
      {['membre', 'M', 'L', 'T'].map((t, i) => (
        <Etiquette key={t} x={colX[i]!} y={26} ancre="middle" taille={12.5} gras>
          {t}
        </Etiquette>
      ))}
      <line x1={60} y1={34} x2={520} y2={34} className="t-moyen" />
      {lignes.map((l, j) => {
        const y = 60 + j * 32;
        return (
          <g key={l.nom}>
            <rect x={60} y={y - 20} width={460} height={28} rx={4} fill={j === 0 ? 'var(--color-encre-clair)' : l.ok ? 'var(--color-validation-clair)' : 'var(--color-correction-clair)'} />
            <Etiquette x={colX[0]!} y={y} ancre="middle" taille={12}>
              {l.nom}
            </Etiquette>
            {(['M', 'L', 'T'] as const).map((k, i) => (
              <Etiquette key={k} x={colX[i + 1]!} y={y} ancre="middle" taille={13} gras>
                {l.d[k]}
              </Etiquette>
            ))}
          </g>
        );
      })}
    </Figure>
  );
}

const homogeneite: DefinitionCalcul<ResHomogeneite> = {
  champs: [{ type: 'choix', cle: 'f', libelle: 'formule à vérifier', symbole: 'f', options: FORMULES.map((x) => ({ valeur: x.id, libelle: x.libelle })) }],
  defaut: { f: 'fleche' },
  calculer: (e) => {
    const f = formule(String(e.f));
    return { ...analyser(f), f };
  },
  valeurs: {
    verdict: (r) => (r.homogene ? `homogène (${ecrireDim(r.gauche)})` : 'non homogène'),
    gauche: (r) => ecrireDim(r.gauche),
  },
  lignes: {
    symboles: (r) => {
      const vus = new Map<string, Formule['gauche']>();
      [r.f.gauche, ...r.f.termes.flat()].forEach((x) => vus.set(x.symbole, x));
      return (
        <>
          {[...vus.values()].map((x, i) => (
            <span key={x.symbole}>
              {i ? ' ; ' : ''}
              {x.symbole} ({x.unite}) → {ecrireDim(x.dim)}
            </span>
          ))}
        </>
      );
    },
    droite: (r) => (
      <>
        {r.f.termes.map((t, i) => (
          <span key={i}>
            {i ? ' ; ' : ''}
            {r.f.termes.length > 1 ? `terme ${i + 1} : ` : 'droite : '}
            {t.map((x) => ecrireFacteur(x.symbole, x.exposant)).join(' × ')} → <strong>{ecrireDim(r.termes[i]!)}</strong>
          </span>
        ))}
      </>
    ),
    gauche: (r) => (
      <>
        gauche : {r.f.gauche.symbole} ({r.f.gauche.unite}) → <strong>{ecrireDim(r.gauche)}</strong>
      </>
    ),
    verdict: (r) =>
      r.homogene ? (
        <>Les deux membres ont la dimension {ecrireDim(r.gauche)} : la formule est homogène ✓</>
      ) : (
        <>
          {ecrireDim(r.gauche)} ≠ {r.termes.filter((t) => !egales(t, r.gauche)).map(ecrireDim).join(', ')} : la formule n’est pas homogène ✗
        </>
      ),
  },
  schema: ({ r }) => <TableDims r={r} />,
  alerte: (r) => (r.homogene ? undefined : 'Formule non homogène : ses deux membres n’ont pas la même dimension, elle est forcément fausse.'),
};

// ---------- Unités anciennes et anglo-saxonnes (N0.3.6) ----------
interface ResAnciennes {
  valeur: number;
  symbole: string;
  facteur: number;
  si: Equivalent;
  pratiques: Equivalent[];
}

const ANCIENNES = ['bar', 'kgf/cm²', 't/m²', 'daN/m²', 'psi', 'tf', 'kgf', 'daN', 'in', 'ft', 'lb'];

function definition(s: string) {
  switch (s) {
    case 'bar':
      return <>par définition, 1 bar = {ecrire(convertir(1, 'bar', 'Pa')!.valeur)} Pa</>;
    case 'kgf/cm²':
      return (
        <>
          1 kgf = {nombreCourt(convertir(1, 'kgf', 'N')!.valeur, 5)} N réparti sur 1 cm² = {puissanceDix(-4)} m²
        </>
      );
    case 't/m²':
      return <>1 tonne-force = 1 000 kgf = {nombreCourt(convertir(1, 'tf', 'N')!.valeur, 2)} N, répartie sur 1 m²</>;
    case 'daN/m²':
      return <>1 daN = {nombreCourt(convertir(1, 'daN', 'N')!.valeur)} N, réparti sur 1 m²</>;
    case 'psi':
      return (
        <>
          1 lbf = {nombreCourt(convertir(1, 'lbf', 'N')!.valeur, 4)} N réparti sur 1 in² = {nombreCourt(convertir(1, 'in', 'cm')!.valeur ** 2, 4)} cm²
        </>
      );
    case 'tf':
      return <>1 tf = 1 000 kgf, poids d’une masse d’une tonne</>;
    case 'kgf':
      return <>poids d’une masse de 1 kg avec g = {nombreCourt(G_NORMALE, 5)} m/s²</>;
    case 'daN':
      return <>préfixe déca : 1 daN = 10 N</>;
    case 'in':
    case 'lb':
      return <>valeur exacte fixée par l’accord international de 1959</>;
    case 'ft':
      return <>1 pied = 12 pouces</>;
    default:
      return null;
  }
}

const operation = (f: number) => (f >= 1 ? `× ${ecrire(f)}` : `÷ ${ecrire(1 / f)}`);

const anciennes: DefinitionCalcul<ResAnciennes> = {
  champs: [
    { cle: 'valeur', libelle: 'valeur lue', symbole: 'x', unite: '', min: 0.01, max: 10000, pas: 0.01, decimales: 2 },
    { type: 'choix', cle: 'unite', libelle: 'unité ancienne ou anglo-saxonne', symbole: 'u', options: ANCIENNES.map((s) => ({ valeur: s, libelle: `${s} (${unite(s).nom})` })) },
  ],
  defaut: { valeur: 1.5, unite: 'bar' },
  calculer: (e) => {
    const valeur = num(e, 'valeur');
    const symbole = String(e.unite);
    const eq = equivalents(valeur, symbole);
    return { valeur, symbole, facteur: convertir(1, symbole, eq.si.symbole)!.facteur, ...eq };
  },
  valeurs: {
    si: (r) => `${ecrire(r.si.valeur)} ${r.si.symbole}`,
    pratique: (r) => (r.pratiques[0] ? `${ecrire(r.pratiques[0].valeur)} ${r.pratiques[0].symbole}` : `${ecrire(r.si.valeur)} ${r.si.symbole}`),
    tout: (r) => r.pratiques.map((p) => `${ecrire(p.valeur)} ${p.symbole}`).join(' = '),
  },
  lignes: {
    definition: (r) => (
      <>
        1 {r.symbole} = {ecrire(r.facteur)} {r.si.symbole} ({definition(r.symbole)})
      </>
    ),
    si: (r) => (
      <>
        {nombreCourt(r.valeur)} {r.symbole} × {ecrire(r.facteur)} = <strong>{ecrire(r.si.valeur)} {r.si.symbole}</strong>
      </>
    ),
    pratiques: (r) => (
      <>
        soit{' '}
        {r.pratiques.map((p, i) => (
          <span key={p.symbole}>
            {i ? ' ou ' : ''}
            <strong>
              {ecrire(p.valeur)} {p.symbole}
            </strong>
          </span>
        ))}
      </>
    ),
  },
  schema: ({ r }) => {
    const etapes = [`${nombreCourt(r.valeur)} ${r.symbole}`, ...r.pratiques.map((p) => `${ecrire(p.valeur)} ${p.symbole}`)];
    const chaine = [r.symbole, ...r.pratiques.map((p) => p.symbole)];
    const ops = chaine.slice(1).map((s, i) => operation(convertir(1, chaine[i]!, s)!.facteur));
    return <ChaineConversion etapes={etapes} operations={ops} alt={`Conversion : ${etapes.join(' = ')}`} />;
  },
};

// ---------- Estimation du poids d'un bâtiment (N0.3.7) ----------
type ResBatiment = ResultatBatiment & { d: DonneesBatiment };

function BatimentSchema({ d, r }: { d: DonneesBatiment; r: ResultatBatiment }) {
  const hs = Math.min(42, 190 / d.niveaux);
  const ySol = 34 + d.niveaux * hs;
  const x0 = 170;
  const lg = 280;
  const cols = [x0, x0 + lg / 2, x0 + lg];
  return (
    <Figure alt={`Bâtiment de ${d.niveaux} niveaux de ${nombre(d.S, 0)} m² : environ ${nombre(r.W, 0)} kN, soit ${nombre(r.parPoteau, 0)} kN par poteau en moyenne`} largeur={620} hauteur={ySol + 70}>
      <line x1={60} y1={ySol} x2={560} y2={ySol} className="t-moyen" />
      {cols.map((x) => (
        <g key={x}>
          <line x1={x} y1={ySol} x2={x} y2={ySol - d.niveaux * hs} className="t-fort" strokeWidth={4} />
          <rect x={x - 14} y={ySol} width={28} height={10} fill="var(--fond-ba)" className="t-moyen" />
          <ChargePonctuelle x={x} y={ySol + 40} longueur={26} />
        </g>
      ))}
      {Array.from({ length: d.niveaux }, (_, i) => ySol - (i + 1) * hs).map((y) => (
        <line key={y} x1={x0 - 12} y1={y} x2={x0 + lg + 12} y2={y} className="t-fort" strokeWidth={5} />
      ))}
      <Etiquette x={x0 + lg / 2} y={ySol + 58} ancre="middle" taille={12} gras classe="encre">
        ≈ {nombre(r.parPoteau, 0)} kN par poteau ({d.poteaux} poteaux, répartition égale supposée)
      </Etiquette>
      <Etiquette x={x0 + lg + 24} y={ySol - (d.niveaux * hs) / 2} taille={13} gras>
        W ≈ {nombre(r.W, 0)} kN
      </Etiquette>
      <Etiquette x={x0 + lg + 24} y={ySol - (d.niveaux * hs) / 2 + 18} taille={11}>
        {d.niveaux} niveau{d.niveaux > 1 ? 'x' : ''} × {nombre(d.S, 0)} m²
      </Etiquette>
    </Figure>
  );
}

const batiment: DefinitionCalcul<ResBatiment> = {
  champs: [
    { cle: 'S', libelle: 'surface d’un niveau', symbole: 'S', unite: 'm²', min: 20, max: 1500, pas: 5, decimales: 0 },
    { cle: 'niveaux', libelle: 'nombre de niveaux (planchers)', symbole: 'n', unite: '', min: 1, max: 8, pas: 1, decimales: 0 },
    { cle: 'q', libelle: 'charge globale par niveau (hypothèse)', symbole: 'q', unite: 'kN/m²', min: 6, max: 15, pas: 0.5, decimales: 1 },
    { cle: 'poteaux', libelle: 'nombre de poteaux', symbole: 'nₚ', unite: '', min: 1, max: 60, pas: 1, decimales: 0 },
  ],
  defaut: { ...EXEMPLE_BATIMENT },
  calculer: (e) => {
    const d = { S: num(e, 'S'), niveaux: num(e, 'niveaux'), q: num(e, 'q'), poteaux: num(e, 'poteaux') };
    return { ...estimationBatiment(d), d };
  },
  valeurs: {
    W: (r) => grandeur(r.W, 0, 'kN'),
    MN: (r) => grandeur(r.W / 1000, 2, 'MN'),
    masse: (r) => grandeur(r.masse, 0, 't'),
    poteau: (r) => grandeur(r.parPoteau, 0, 'kN'),
  },
  lignes: {
    W: (r) => (
      <>
        W ≈ S × n × q = {nombre(r.d.S, 0)} m² × {r.d.niveaux} × {nombre(r.d.q, 1)} kN/m² = <strong>{nombre(r.W, 0)} kN</strong> = {n2(r.W / 1000)} MN
      </>
    ),
    masse: (r) => (
      <>
        masse : m = W / g = {nombre(r.W, 0)} kN / {n2(PESANTEUR)} m/s² ≈ <strong>{nombre(r.masse, 0)} t</strong>
      </>
    ),
    poteau: (r) => (
      <>
        par poteau : {nombre(r.W, 0)} / {r.d.poteaux} ≈ <strong>{nombre(r.parPoteau, 0)} kN</strong>
      </>
    ),
  },
  schema: ({ r }) => <BatimentSchema d={r.d} r={r} />,
};

// ---------- Mini-projet : poids propres (N0.3.P) ----------
type ResPP = ResultatPoidsPropre & { L: number; b: number; h: number; gamma: number };

const controle = (r: ResPP, unitesDonnees: [string, string, string]) => (
  <>
    de tête : {nombreCourt(r.arrondies[0])} × {nombreCourt(r.arrondies[1])} × {nombreCourt(r.arrondies[2])} × {nombreCourt(r.gamma)} ≈ {nombreCourt(r.estimation, 1)} kN (données arrondies en {unitesDonnees.join(', ')}) ; écart {pourcent(r.ecart)} →{' '}
    <strong>{memeOrdre(r.ecart) ? 'même ordre de grandeur ✓' : 'à revoir ✗'}</strong>
  </>
);

function PlanDalle({ r }: { r: ResPP }) {
  const k = Math.min(380 / r.L, 160 / r.b);
  const w = r.L * k;
  const h = r.b * k;
  const x0 = 310 - w / 2;
  return (
    <Figure alt={`Dalle de ${n2(r.L)} m × ${n2(r.b)} m et ${nombre(r.h * 100, 0)} cm d'épaisseur`} largeur={620} hauteur={h + 80}>
      <Hachures prefixe="ppd" types={['ba']} />
      <rect x={x0} y={20} width={w} height={h} fill={hachure('ppd', 'ba')} className="t-fort" />
      <Etiquette x={310} y={20 + h / 2 + 5} ancre="middle" taille={13} gras>
        e = {nombre(r.h * 100, 0)} cm
      </Etiquette>
      <Cote x1={x0} y1={20 + h} x2={x0 + w} y2={20 + h} decalage={-20} texte={`Lx = ${n2(r.L)} m`} />
      <Cote x1={x0} y1={20 + h} x2={x0} y2={20} decalage={22} texte={`Ly = ${n2(r.b)} m`} />
    </Figure>
  );
}

function ElevationLineaire({ r, type }: { r: ResPP; type: 'poutre' | 'mur' }) {
  const haut = r.h;
  const k = Math.min(400 / r.L, 140 / haut);
  const w = r.L * k;
  const h = haut * k;
  const x0 = 290 - w / 2;
  const hach = type === 'mur' ? 'maconnerie' : 'ba';
  return (
    <Figure
      alt={`${type === 'mur' ? 'Mur' : 'Poutre'} de ${n2(r.L)} m, ${type === 'mur' ? `hauteur ${n2(r.h)} m, épaisseur ${nombre(r.b * 100, 0)} cm` : `section ${nombre(r.b * 100, 0)} × ${nombre(r.h * 100, 0)} cm`}`}
      largeur={620}
      hauteur={h + 80}
    >
      <Hachures prefixe={`pp${type}`} types={[hach]} />
      <rect x={x0} y={20} width={w} height={h} fill={hachure(`pp${type}`, hach)} className="t-fort" />
      <Cote x1={x0} y1={20 + h} x2={x0 + w} y2={20 + h} decalage={-20} texte={`L = ${n2(r.L)} m`} />
      <Cote x1={x0} y1={20 + h} x2={x0} y2={20} decalage={22} texte={type === 'mur' ? `H = ${n2(r.h)} m` : `h = ${nombre(r.h * 100, 0)} cm`} />
      <Etiquette x={x0 + w + 16} y={20 + h / 2} taille={12}>
        {type === 'mur' ? `e = ${nombre(r.b * 100, 0)} cm` : `b = ${nombre(r.b * 100, 0)} cm`}
      </Etiquette>
    </Figure>
  );
}

const ppDalle: DefinitionCalcul<ResPP> = {
  champs: [
    { cle: 'Lx', libelle: 'longueur', symbole: 'Lx', unite: 'm', min: 1, max: 10, pas: 0.05, decimales: 2 },
    { cle: 'Ly', libelle: 'largeur', symbole: 'Ly', unite: 'm', min: 1, max: 10, pas: 0.05, decimales: 2 },
    { cle: 'e', libelle: 'épaisseur', symbole: 'e', unite: 'cm', min: 8, max: 40, pas: 1, decimales: 0 },
  ],
  defaut: { Lx: EXEMPLE_POIDS_PROPRES.dalle.Lx, Ly: EXEMPLE_POIDS_PROPRES.dalle.Ly, e: EXEMPLE_POIDS_PROPRES.dalle.e * 100 },
  calculer: (e) => {
    const L = num(e, 'Lx');
    const b = num(e, 'Ly');
    const h = num(e, 'e') / 100;
    return { ...poidsDalle(L, b, h), L, b, h, gamma: POIDS_VOLUMIQUE_BA };
  },
  valeurs: {
    P: (r) => grandeur(r.P, 1, 'kN'),
    charge: (r) => grandeur(r.charge, 2, 'kN/m²'),
    ecart: (r) => pourcent(r.ecart),
  },
  lignes: {
    V: (r) => (
      <>
        V = Lx × Ly × e = {n2(r.L)} m × {n2(r.b)} m × {n2(r.h)} m = <strong>{nombre(r.V, 3)} m³</strong>
      </>
    ),
    P: (r) => (
      <>
        P = γ × V = {nombre(r.gamma, 0)} kN/m³ × {nombre(r.V, 3)} m³ = <strong>{nombre(r.P, 1)} kN</strong>
      </>
    ),
    charge: (r) => (
      <>
        g = e × γ = {n2(r.h)} m × {nombre(r.gamma, 0)} kN/m³ = <strong>{n2(r.charge)} kN/m²</strong>
      </>
    ),
    controle: (r) => controle(r, ['m', 'm', 'm']),
  },
  schema: ({ r }) => <PlanDalle r={r} />,
};

const ppPoutre: DefinitionCalcul<ResPP> = {
  champs: [
    { cle: 'L', libelle: 'longueur', symbole: 'L', unite: 'm', min: 1, max: 12, pas: 0.05, decimales: 2 },
    { cle: 'b', libelle: 'largeur', symbole: 'b', unite: 'cm', min: 15, max: 60, pas: 1, decimales: 0 },
    { cle: 'h', libelle: 'hauteur', symbole: 'h', unite: 'cm', min: 20, max: 100, pas: 1, decimales: 0 },
  ],
  defaut: { L: EXEMPLE_POIDS_PROPRES.poutre.L, b: EXEMPLE_POIDS_PROPRES.poutre.b * 100, h: EXEMPLE_POIDS_PROPRES.poutre.h * 100 },
  calculer: (e) => {
    const L = num(e, 'L');
    const b = num(e, 'b') / 100;
    const h = num(e, 'h') / 100;
    return { ...poidsLineaire(L, b, h, POIDS_VOLUMIQUE_BA), L, b, h, gamma: POIDS_VOLUMIQUE_BA };
  },
  valeurs: {
    P: (r) => grandeur(r.P, 1, 'kN'),
    charge: (r) => grandeur(r.charge, 2, 'kN/m'),
    ecart: (r) => pourcent(r.ecart),
  },
  lignes: {
    V: (r) => (
      <>
        V = L × b × h = {n2(r.L)} m × {n2(r.b)} m × {n2(r.h)} m = <strong>{nombre(r.V, 3)} m³</strong>
      </>
    ),
    P: (r) => (
      <>
        P = γ × V = {nombre(r.gamma, 0)} kN/m³ × {nombre(r.V, 3)} m³ = <strong>{nombre(r.P, 1)} kN</strong>
      </>
    ),
    charge: (r) => (
      <>
        g = b × h × γ = {n2(r.b)} × {n2(r.h)} × {nombre(r.gamma, 0)} = <strong>{n2(r.charge)} kN/m</strong>
      </>
    ),
    controle: (r) => controle(r, ['m', 'm', 'm']),
  },
  schema: ({ r }) => <ElevationLineaire r={r} type="poutre" />,
};

const ppMur: DefinitionCalcul<ResPP> = {
  champs: [
    { cle: 'L', libelle: 'longueur', symbole: 'L', unite: 'm', min: 1, max: 15, pas: 0.05, decimales: 2 },
    { cle: 'H', libelle: 'hauteur', symbole: 'H', unite: 'm', min: 1, max: 4, pas: 0.05, decimales: 2 },
    { cle: 'e', libelle: 'épaisseur', symbole: 'e', unite: 'cm', min: 10, max: 30, pas: 1, decimales: 0 },
    { cle: 'gamma', libelle: 'poids volumique (énoncé, à vérifier)', symbole: 'γ', unite: 'kN/m³', min: 10, max: 25, pas: 0.5, decimales: 1 },
  ],
  defaut: { L: EXEMPLE_POIDS_PROPRES.mur.L, H: EXEMPLE_POIDS_PROPRES.mur.H, e: EXEMPLE_POIDS_PROPRES.mur.e * 100, gamma: EXEMPLE_POIDS_PROPRES.mur.gamma },
  calculer: (e) => {
    const L = num(e, 'L');
    const H = num(e, 'H');
    const ep = num(e, 'e') / 100;
    const gamma = num(e, 'gamma');
    return { ...poidsLineaire(L, ep, H, gamma), L, b: ep, h: H, gamma };
  },
  valeurs: {
    P: (r) => grandeur(r.P, 1, 'kN'),
    charge: (r) => grandeur(r.charge, 2, 'kN/m'),
    ecart: (r) => pourcent(r.ecart),
  },
  lignes: {
    V: (r) => (
      <>
        V = L × e × H = {n2(r.L)} m × {n2(r.b)} m × {n2(r.h)} m = <strong>{nombre(r.V, 3)} m³</strong>
      </>
    ),
    P: (r) => (
      <>
        P = γ × V = {nombre(r.gamma, 1)} kN/m³ × {nombre(r.V, 3)} m³ = <strong>{nombre(r.P, 1)} kN</strong>
      </>
    ),
    charge: (r) => (
      <>
        g = e × H × γ = {n2(r.b)} × {n2(r.h)} × {nombre(r.gamma, 1)} = <strong>{n2(r.charge)} kN/m</strong>
      </>
    ),
    controle: (r) => controle(r, ['m', 'm', 'm']),
  },
  schema: ({ r }) => <ElevationLineaire r={r} type="mur" />,
};

export const CALCULS_UNITES = {
  prefixes,
  citerne: citerneDef,
  semelle,
  materiau,
  homogeneite,
  anciennes,
  batiment,
  ppDalle,
  ppPoutre,
  ppMur,
} as const;
