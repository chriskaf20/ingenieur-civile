// Fiches de calcul du module N0.2 (algèbre et fonctions). Les valeurs viennent de lib/calc/algebre.ts.

import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Hachures, hachure } from '@/components/drawing/Hachures';
import { AppuiDouble, AppuiSimple, ChargePonctuelle } from '@/components/drawing/Mecanique';
import type { DefinitionCalcul, Entrees } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import {
  ageResistance,
  allongementBarre,
  betaCC,
  EXEMPLE_BARRE,
  EXEMPLE_RESERVOIR,
  EXEMPLE_SEMELLE,
  volumePrisme,
  fcmT,
  hauteurEau,
  inertieRectangle,
  marchesEscalier,
  parcelle,
  pente,
  quantitesBeton,
  reactionsPoutre,
  reservoir,
  sectionTube,
  type DonneesBarre,
  type DonneesGachee,
  type DonneesReservoir,
  type ResultatBarre,
  type ResultatGachee,
  type ResultatInertie,
  type ResultatMarches,
  type ResultatParcelle,
  type ResultatPente,
  type ResultatReactions,
  type ResultatReservoir,
  type ResultatTube,
} from '@/lib/calc/algebre';
import { BLONDEL_MAX, BLONDEL_MIN } from '@/lib/calc/escalier';
import { DELTA_FCM, E_S, S_CIMENT, type ClasseCiment } from '@/lib/calc/ba/materiaux';
import { points } from '@/lib/drawing/repere';
import { grandeur, nombre, scientifique } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);

// ---------- Inertie d'un rectangle (N0.2.1) ----------
type ResInertie = ResultatInertie & { b: number; h: number };

function SectionRect({ b, h }: { b: number; h: number }) {
  const k = Math.min(4, 190 / h, 260 / b);
  const w = b * k;
  const H = h * k;
  const x0 = 310 - w / 2;
  const y0 = 24;
  return (
    <Figure alt={`Section rectangulaire de ${nombre(b, 0)} cm de large et ${nombre(h, 0)} cm de haut, avec son axe horizontal passant par le centre`} largeur={620} hauteur={H + 70}>
      <Hachures prefixe="ine" types={['ba']} />
      <rect x={x0} y={y0} width={w} height={H} fill={hachure('ine', 'ba')} className="t-fort" />
      <line x1={x0 - 30} y1={y0 + H / 2} x2={x0 + w + 30} y2={y0 + H / 2} className="t-axe" />
      <Etiquette x={x0 + w + 34} y={y0 + H / 2 + 4} taille={12} gras classe="encre">
        axe x (flexion)
      </Etiquette>
      <Cote x1={x0} y1={y0 + H} x2={x0 + w} y2={y0 + H} decalage={-22} texte={`b = ${nombre(b, 0)} cm`} />
      <Cote x1={x0} y1={y0} x2={x0} y2={y0 + H} decalage={-22} texte={`h = ${nombre(h, 0)} cm`} />
    </Figure>
  );
}

const inertie: DefinitionCalcul<ResInertie> = {
  champs: [
    { cle: 'b', libelle: 'largeur', symbole: 'b', unite: 'cm', min: 10, max: 60, pas: 1, decimales: 0 },
    { cle: 'h', libelle: 'hauteur', symbole: 'h', unite: 'cm', min: 10, max: 100, pas: 1, decimales: 0 },
  ],
  defaut: { b: 20, h: 40 },
  calculer: (e) => {
    const b = num(e, 'b');
    const h = num(e, 'h');
    return { ...inertieRectangle(b, h), b, h };
  },
  valeurs: {
    I: (r) => grandeur(r.I, 0, 'cm⁴'),
    Im4: (r) => `${scientifique(r.Im4, 3)} m⁴`,
    i: (r) => grandeur(r.i, 2, 'cm'),
    A: (r) => grandeur(r.A, 0, 'cm²'),
  },
  lignes: {
    puissance: (r) => (
      <>
        h³ = {nombre(r.h, 0)}³ = {nombre(r.h, 0)} × {nombre(r.h, 0)} × {nombre(r.h, 0)} = <strong>{nombre(r.h ** 3, 0)} cm³</strong>
      </>
    ),
    I: (r) => (
      <>
        I = b × h³ / 12 = {nombre(r.b, 0)} cm × {nombre(r.h ** 3, 0)} cm³ / 12 = <strong>{nombre(r.I, 0)} cm⁴</strong>
      </>
    ),
    m4: (r) => (
      <>
        1 cm = 10⁻² m donc 1 cm⁴ = (10⁻²)⁴ m⁴ = 10⁻⁸ m⁴ : I = {nombre(r.I, 0)} × 10⁻⁸ = <strong>{scientifique(r.Im4, 3)} m⁴</strong>
      </>
    ),
    racine: (r) => (
      <>
        i = √(I / A) = √({nombre(r.I, 0)} / {nombre(r.A, 0)}) = √{n2(r.I / r.A)} = <strong>{n2(r.i)} cm</strong>
      </>
    ),
  },
  schema: ({ r }) => <SectionRect b={r.b} h={r.h} />,
};

// ---------- Allongement d'une barre (N0.2.2) ----------
type ResBarre = ResultatBarre & { d: DonneesBarre };

function BarreTendue({ d, r }: { d: DonneesBarre; r: ResultatBarre }) {
  const x0 = 110;
  const L = 380;
  const y = 50;
  const ex = 30; // allongement dessiné, très exagéré
  return (
    <Figure alt={`Barre HA ${d.phi} de ${n2(d.L)} m tirée par ${nombre(d.F, 0)} kN à chaque extrémité ; allongement ${nombre(r.dL * 1000, 2)} mm, exagéré sur le dessin`} largeur={620} hauteur={130}>
      <rect x={x0} y={y - 4} width={L} height={8} fill="var(--fond-beton)" className="t-moyen" />
      <rect x={x0 + L} y={y - 4} width={ex} height={8} fill="none" className="t-cache" />
      <ChargePonctuelle x={x0 - 64} y={y} angle={180} longueur={60} />
      <ChargePonctuelle x={x0 + L + ex + 64} y={y} angle={0} longueur={60} />
      <Etiquette x={x0 - 34} y={y - 10} ancre="middle" taille={12} gras>
        F = {nombre(d.F, 0)} kN
      </Etiquette>
      <Etiquette x={x0 + L + ex + 34} y={y - 10} ancre="middle" taille={12} gras>
        F
      </Etiquette>
      <Cote x1={x0} y1={y + 4} x2={x0 + L} y2={y + 4} decalage={-26} texte={`L = ${n2(d.L)} m`} />
      <Cote x1={x0 + L} y1={y - 4} x2={x0 + L + ex} y2={y - 4} decalage={18} texte={`ΔL = ${nombre(r.dL * 1000, 2)} mm`} />
      <Etiquette x={x0 + L / 2} y={118} ancre="middle" taille={10.5} classe="etiquette">
        allongement dessiné très exagéré
      </Etiquette>
    </Figure>
  );
}

const barre: DefinitionCalcul<ResBarre> = {
  champs: [
    { cle: 'F', libelle: 'effort de traction', symbole: 'F', unite: 'kN', min: 1, max: 60, pas: 1, decimales: 0 },
    { cle: 'L', libelle: 'longueur de la barre', symbole: 'L', unite: 'm', min: 0.5, max: 12, pas: 0.1, decimales: 1 },
    { type: 'choix', cle: 'phi', libelle: 'diamètre', symbole: 'φ', options: [8, 10, 12, 14, 16, 20].map((p) => ({ valeur: p, libelle: `HA ${p}` })) },
  ],
  defaut: { F: EXEMPLE_BARRE.F, L: EXEMPLE_BARRE.L, phi: EXEMPLE_BARRE.phi },
  calculer: (e) => {
    const d = { F: num(e, 'F'), L: num(e, 'L'), phi: num(e, 'phi'), E: E_S };
    return { ...allongementBarre(d), d };
  },
  valeurs: {
    dL: (r) => grandeur(r.dL * 1000, 2, 'mm'),
    dLsci: (r) => `${scientifique(r.dL, 3)} m`,
    epsilon: (r) => scientifique(r.epsilon, 3),
    sigma: (r) => grandeur(r.sigma, 1, 'MPa'),
  },
  lignes: {
    A: (r) => (
      <>
        A = π × φ² / 4 = π × {r.d.phi}² / 4 = <strong>{nombre(r.A, 1)} mm²</strong>
      </>
    ),
    sigma: (r) => (
      <>
        σ = F / A = {nombre(r.d.F * 1000, 0)} N / {nombre(r.A, 1)} mm² = <strong>{nombre(r.sigma, 1)} MPa</strong>
      </>
    ),
    epsilon: (r) => (
      <>
        ε = σ / E = {nombre(r.sigma, 1)} / {nombre(E_S, 0)} = {scientifique(r.sigma, 4)} / {scientifique(E_S, 1)} = <strong>{scientifique(r.epsilon, 3)}</strong>
      </>
    ),
    dL: (r) => (
      <>
        ΔL = ε × L = {scientifique(r.epsilon, 3)} × {n2(r.d.L)} m = <strong>{scientifique(r.dL, 3)} m</strong> = {nombre(r.dL * 1000, 2)} mm
      </>
    ),
  },
  schema: ({ r }) => <BarreTendue d={r.d} r={r} />,
};

// ---------- Pente d'un caniveau (N0.2.3) ----------
type ResPente = ResultatPente & { dH: number; L: number };

function ProfilPente({ dH, L, r }: { dH: number; L: number; r: ResultatPente }) {
  const x0 = 60;
  const lg = 480;
  const hy = 90; // pente toujours faible : hauteur dessinée fixe, échelle verticale exagérée
  const y0 = 30;
  return (
    <Figure alt={`Profil en long d'un caniveau : ${n2(L)} m de long, ${n2(dH)} m de dénivelé, pente ${nombre(r.pourcent, 2)} %`} largeur={620} hauteur={y0 + hy + 60}>
      <polyline points={points([[x0, y0], [x0 + lg, y0 + hy]])} className="t-fort" stroke="var(--color-encre)" />
      <line x1={x0} y1={y0 + hy} x2={x0 + lg} y2={y0 + hy} className="t-fin" strokeDasharray="4 3" />
      <line x1={x0} y1={y0} x2={x0} y2={y0 + hy} className="t-fin" strokeDasharray="4 3" />
      <Cote x1={x0} y1={y0 + hy} x2={x0 + lg} y2={y0 + hy} decalage={-24} texte={`L = ${n2(L)} m`} />
      <Cote x1={x0} y1={y0} x2={x0} y2={y0 + hy} decalage={22} texte={`ΔH = ${n2(dH)} m`} />
      <Etiquette x={x0 + lg / 2 + 10} y={y0 + hy / 2 - 8} taille={13} gras classe="encre">
        p = {nombre(r.pourcent, 2)} %
      </Etiquette>
      <Etiquette x={x0 + lg} y={y0 + hy + 54} ancre="end" taille={10.5} classe="etiquette">
        échelle verticale exagérée
      </Etiquette>
    </Figure>
  );
}

const penteCaniveau: DefinitionCalcul<ResPente> = {
  champs: [
    { cle: 'dH', libelle: 'dénivelé', symbole: 'ΔH', unite: 'm', min: 0.01, max: 3, pas: 0.01, decimales: 2 },
    { cle: 'L', libelle: 'longueur horizontale', symbole: 'L', unite: 'm', min: 1, max: 200, pas: 0.5, decimales: 1 },
  ],
  defaut: { dH: 0.15, L: 25 },
  calculer: (e) => {
    const dH = num(e, 'dH');
    const L = num(e, 'L');
    return { ...pente(dH, L), dH, L };
  },
  valeurs: {
    pourcent: (r) => `${nombre(r.pourcent, 2)} %`,
    pourmille: (r) => `${nombre(r.pourmille, 1)} ‰`,
    p: (r) => `${nombre(r.p, 4)} m/m`,
    cm: (r) => grandeur(r.p * 100, 2, 'cm par mètre'),
  },
  lignes: {
    p: (r) => (
      <>
        p = ΔH / L = {n2(r.dH)} m / {nombre(r.L, 1)} m = <strong>{nombre(r.p, 4)}</strong> (m par m)
      </>
    ),
    pourcent: (r) => (
      <>
        en % : {nombre(r.p, 4)} × 100 = <strong>{nombre(r.pourcent, 2)} %</strong> ; en ‰ : {nombre(r.p, 4)} × 1 000 = <strong>{nombre(r.pourmille, 1)} ‰</strong>
      </>
    ),
  },
  schema: ({ r }) => <ProfilPente dH={r.dH} L={r.L} r={r} />,
};

// ---------- Section d'un tube (N0.2.4) ----------
type ResTube = ResultatTube & { D: number; t: number };

function CoupeTube({ D, t }: { D: number; t: number }) {
  const R = 85;
  const k = R / (D / 2);
  const cx = 230;
  const cy = 105;
  const ri = Math.max(R - t * k, 2);
  return (
    <Figure alt={`Coupe d'un tube de diamètre extérieur ${nombre(D, 0)} mm et d'épaisseur ${nombre(t, 1)} mm`} largeur={620} hauteur={215}>
      <Hachures prefixe="tub" types={['acier']} />
      <path d={`M${cx - R},${cy} a${R},${R} 0 1,0 ${2 * R},0 a${R},${R} 0 1,0 ${-2 * R},0 M${cx - ri},${cy} a${ri},${ri} 0 1,1 ${2 * ri},0 a${ri},${ri} 0 1,1 ${-2 * ri},0`} fill={hachure('tub', 'acier')} fillRule="evenodd" className="t-fort" />
      <line x1={cx - R - 15} y1={cy} x2={cx + R + 15} y2={cy} className="t-axe" />
      <line x1={cx} y1={cy - R - 15} x2={cx} y2={cy + R + 15} className="t-axe" />
      <Cote x1={cx - R} y1={cy + R} x2={cx + R} y2={cy + R} decalage={-12} texte={`D = ${nombre(D, 0)} mm`} />
      <Cote x1={cx - ri} y1={cy} x2={cx + ri} y2={cy} decalage={14} texte={`d = ${nombre(D - 2 * t, 0)}`} />
      <Etiquette x={cx + R + 30} y={cy - 40} taille={12}>
        épaisseur t = {nombre(t, 1)} mm
      </Etiquette>
      <Etiquette x={cx + R + 30} y={cy - 20} taille={12}>
        d = D − 2t
      </Etiquette>
    </Figure>
  );
}

const tube: DefinitionCalcul<ResTube> = {
  champs: [
    { cle: 'D', libelle: 'diamètre extérieur', symbole: 'D', unite: 'mm', min: 20, max: 400, pas: 1, decimales: 0 },
    { cle: 't', libelle: 'épaisseur', symbole: 't', unite: 'mm', min: 1, max: 20, pas: 0.5, decimales: 1 },
  ],
  defaut: { D: 100, t: 5 },
  calculer: (e) => {
    const D = num(e, 'D');
    const t = num(e, 't');
    return { ...sectionTube(D, t), D, t };
  },
  valeurs: {
    A: (r) => grandeur(r.Afactorisee, 1, 'mm²'),
    Acm: (r) => grandeur(r.Afactorisee / 100, 2, 'cm²'),
  },
  lignes: {
    d: (r) => (
      <>
        d = D − 2t = {nombre(r.D, 0)} − 2 × {nombre(r.t, 1)} = <strong>{nombre(r.d, 1)} mm</strong>
      </>
    ),
    developpee: (r) => (
      <>
        A = π/4 × (D² − d²) = π/4 × ({nombre(r.D ** 2, 0)} − {nombre(r.d ** 2, 2)}) = <strong>{nombre(r.Adeveloppee, 1)} mm²</strong>
      </>
    ),
    factorisee: (r) => (
      <>
        A = π × t × (D − t) = π × {nombre(r.t, 1)} × {nombre(r.D - r.t, 1)} = <strong>{nombre(r.Afactorisee, 1)} mm²</strong> ✓ même valeur
      </>
    ),
  },
  schema: ({ r }) => <CoupeTube D={r.D} t={r.t} />,
  alerte: (r) => (r.d <= 0 ? 'L’épaisseur dépasse le rayon : ce n’est plus un tube.' : undefined),
};

// ---------- Inéquations : escalier (N0.2.5) ----------
type ResMarches = ResultatMarches & { H: number; hMax: number };

function ProfilMarches({ r }: { r: ResMarches }) {
  const g = (r.gMin + r.gMax) / 2;
  const n = r.nMin;
  const k = Math.min(480 / ((n - 1) * g), 200 / r.H);
  const x0 = 70;
  const yb = 220;
  const pts: Array<[number, number]> = [[x0, yb]];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * g * k;
    const yh = yb - (i + 1) * r.h * k;
    pts.push([x, yh]);
    if (i < n - 1) pts.push([x + g * k, yh]);
  }
  return (
    <Figure alt={`Profil d'un escalier de ${n} contremarches de ${nombre(r.h * 100, 1)} cm pour franchir ${n2(r.H)} m`} largeur={620} hauteur={250}>
      <polyline points={points(pts)} className="t-fort" fill="none" />
      <line x1={x0 - 20} y1={yb} x2={x0 + 40} y2={yb} className="t-moyen" />
      <Cote x1={x0 - 10} y1={yb} x2={x0 - 10} y2={yb - r.H * k} decalage={-18} texte={`H = ${n2(r.H)} m`} />
      <Cote x1={x0} y1={yb - r.h * k} x2={x0 + g * k} y2={yb - r.h * k} decalage={14} texte="g" />
      <Etiquette x={x0 + g * k + 8} y={yb - r.h * k * 0.4} taille={12}>
        h = {nombre(r.h * 100, 1)} cm
      </Etiquette>
      <Etiquette x={600} y={244} ancre="end" taille={10.5} classe="etiquette">
        {n} contremarches · giron dessiné au milieu de la plage
      </Etiquette>
    </Figure>
  );
}

const marches: DefinitionCalcul<ResMarches> = {
  champs: [
    { cle: 'H', libelle: 'hauteur à franchir', symbole: 'H', unite: 'm', min: 1, max: 4.5, pas: 0.01, decimales: 2 },
    { cle: 'hMax', libelle: 'hauteur de marche maximale', symbole: 'hₘₐₓ', unite: 'm', min: 0.14, max: 0.2, pas: 0.005, decimales: 3 },
  ],
  defaut: { H: 2.8, hMax: 0.18 },
  calculer: (e) => {
    const H = num(e, 'H');
    const hMax = num(e, 'hMax');
    return { ...marchesEscalier(H, hMax), H, hMax };
  },
  valeurs: {
    n: (r) => `${r.nMin} contremarches`,
    h: (r) => grandeur(r.h * 100, 1, 'cm'),
    plage: (r) => `${nombre(r.gMin * 100, 1)} cm ≤ g ≤ ${nombre(r.gMax * 100, 1)} cm`,
  },
  lignes: {
    n: (r) => (
      <>
        h = H / n ≤ hₘₐₓ ⇔ n ≥ H / hₘₐₓ = {n2(r.H)} / {nombre(r.hMax, 3)} = {n2(r.H / r.hMax)} → n entier : <strong>n = {r.nMin}</strong>
      </>
    ),
    h: (r) => (
      <>
        h = H / n = {n2(r.H)} / {r.nMin} = <strong>{nombre(r.h, 4)} m</strong>
      </>
    ),
    g: (r) => (
      <>
        {nombre(BLONDEL_MIN, 2)} ≤ 2h + g ≤ {nombre(BLONDEL_MAX, 2)} ⇔ {nombre(BLONDEL_MIN, 2)} − {nombre(2 * r.h, 3)} ≤ g ≤ {nombre(BLONDEL_MAX, 2)} − {nombre(2 * r.h, 3)} ⇔{' '}
        <strong>
          {nombre(r.gMin, 3)} m ≤ g ≤ {nombre(r.gMax, 3)} m
        </strong>
      </>
    ),
  },
  schema: ({ r }) => <ProfilMarches r={r} />,
};

// ---------- Système : réactions d'une poutre (N0.2.6) ----------
type ResReactions = ResultatReactions & { L: number; F: number; a: number };

function PoutreReactions({ r }: { r: ResReactions }) {
  const x0 = 80;
  const lg = 460;
  const y = 90;
  const xa = x0 + (r.a / r.L) * lg;
  return (
    <Figure alt={`Poutre de ${n2(r.L)} m sur deux appuis, charge ${nombre(r.F, 1)} kN à ${n2(r.a)} m de A ; réactions RA = ${nombre(r.RA, 2)} kN et RB = ${nombre(r.RB, 2)} kN`} largeur={620} hauteur={200}>
      <line x1={x0} y1={y} x2={x0 + lg} y2={y} className="t-fort" strokeWidth={4} />
      <AppuiDouble x={x0} y={y} prefixe="rea" />
      <AppuiSimple x={x0 + lg} y={y} />
      <ChargePonctuelle x={xa} y={y - 3} longueur={50} texte={`F = ${nombre(r.F, 1)} kN`} />
      <ChargePonctuelle x={x0} y={y + 30} angle={-90} longueur={40} />
      <ChargePonctuelle x={x0 + lg} y={y + 30} angle={-90} longueur={40} />
      <Etiquette x={x0 + 8} y={y + 62} taille={12.5} gras classe="encre">
        RA = {nombre(r.RA, 2)} kN
      </Etiquette>
      <Etiquette x={x0 + lg - 8} y={y + 62} ancre="end" taille={12.5} gras classe="encre">
        RB = {nombre(r.RB, 2)} kN
      </Etiquette>
      <Etiquette x={x0 - 14} y={y - 8} ancre="end" taille={13} gras>
        A
      </Etiquette>
      <Etiquette x={x0 + lg + 14} y={y - 8} taille={13} gras>
        B
      </Etiquette>
      <Cote x1={x0} y1={y} x2={xa} y2={y} decalage={62} texte={`a = ${n2(r.a)} m`} />
      <Cote x1={x0} y1={y + 70} x2={x0 + lg} y2={y + 70} decalage={-16} texte={`L = ${n2(r.L)} m`} />
    </Figure>
  );
}

const reactions: DefinitionCalcul<ResReactions> = {
  champs: [
    { cle: 'L', libelle: 'portée', symbole: 'L', unite: 'm', min: 1, max: 12, pas: 0.1, decimales: 1 },
    { cle: 'F', libelle: 'charge', symbole: 'F', unite: 'kN', min: 1, max: 100, pas: 0.5, decimales: 1 },
    { cle: 'a', libelle: 'distance de la charge à A', symbole: 'a', unite: 'm', min: 0, max: 12, pas: 0.1, decimales: 1 },
  ],
  defaut: { L: 5, F: 10, a: 2 },
  calculer: (e) => {
    const L = num(e, 'L');
    const F = num(e, 'F');
    const a = Math.min(num(e, 'a'), L);
    return { ...reactionsPoutre(L, F, a), L, F, a };
  },
  valeurs: {
    RA: (r) => grandeur(r.RA, 2, 'kN'),
    RB: (r) => grandeur(r.RB, 2, 'kN'),
  },
  lignes: {
    systeme: (r) => (
      <>
        (1) RA + RB = {nombre(r.F, 1)} ; (2) {nombre(r.L, 1)} × RB = {nombre(r.a, 1)} × {nombre(r.F, 1)} = {nombre(r.a * r.F, 2)}
      </>
    ),
    RB: (r) => (
      <>
        (2) ⇒ RB = {nombre(r.a * r.F, 2)} / {nombre(r.L, 1)} = <strong>{nombre(r.RB, 2)} kN</strong>
      </>
    ),
    RA: (r) => (
      <>
        (1) ⇒ RA = {nombre(r.F, 1)} − {nombre(r.RB, 2)} = <strong>{nombre(r.RA, 2)} kN</strong>
      </>
    ),
    verif: (r) => (
      <>
        vérification : RA + RB = {nombre(r.RA, 2)} + {nombre(r.RB, 2)} = {nombre(r.RA + r.RB, 2)} kN = F ✓
      </>
    ),
  },
  schema: ({ r }) => <PoutreReactions r={r} />,
  alerte: (r) => (r.a > r.L ? 'La charge doit se trouver entre les appuis (a ≤ L).' : undefined),
};

// ---------- Second degré : parcelle (N0.2.7) ----------
type ResParcelle = ResultatParcelle & { P: number; S: number };

function PlanParcelle({ r }: { r: ResParcelle }) {
  if (r.longueur === undefined || r.largeur === undefined) {
    return (
      <Figure alt="Aucun rectangle ne correspond à ces données" largeur={620} hauteur={60}>
        <Etiquette x={310} y={35} ancre="middle" taille={14} gras>
          Δ &lt; 0 : aucun rectangle n’a ce périmètre et cette aire
        </Etiquette>
      </Figure>
    );
  }
  const k = Math.min(420 / r.longueur, 150 / r.largeur);
  const w = r.longueur * k;
  const h = r.largeur * k;
  const x0 = 310 - w / 2;
  const y0 = 20;
  return (
    <Figure alt={`Parcelle rectangulaire de ${n2(r.longueur)} m sur ${n2(r.largeur)} m`} largeur={620} hauteur={h + 70}>
      <rect x={x0} y={y0} width={w} height={h} fill="var(--fond-terre)" className="t-fort" />
      <Cote x1={x0} y1={y0 + h} x2={x0 + w} y2={y0 + h} decalage={-22} texte={`${n2(r.longueur)} m`} />
      <Cote x1={x0} y1={y0} x2={x0} y2={y0 + h} decalage={-22} texte={`${n2(r.largeur)} m`} />
      <Etiquette x={x0 + w / 2} y={y0 + h / 2 + 5} ancre="middle" taille={13} gras>
        S = {nombre(r.S, 0)} m²
      </Etiquette>
    </Figure>
  );
}

const parcelleDef: DefinitionCalcul<ResParcelle> = {
  champs: [
    { cle: 'P', libelle: 'périmètre (longueur de clôture)', symbole: 'P', unite: 'm', min: 10, max: 400, pas: 1, decimales: 0 },
    { cle: 'S', libelle: 'aire voulue', symbole: 'S', unite: 'm²', min: 10, max: 8000, pas: 5, decimales: 0 },
  ],
  defaut: { P: 50, S: 150 },
  calculer: (e) => {
    const P = num(e, 'P');
    const S = num(e, 'S');
    return { ...parcelle(P, S), P, S };
  },
  valeurs: {
    dims: (r) => (r.longueur !== undefined ? `${n2(r.longueur)} m × ${n2(r.largeur ?? 0)} m` : 'impossible'),
    delta: (r) => nombre(r.delta, 2),
  },
  lignes: {
    equation: (r) => (
      <>
        x² − (P/2)·x + S = 0 ⇔ x² − {nombre(r.P / 2, 1)}x + {nombre(r.S, 0)} = 0
      </>
    ),
    delta: (r) => (
      <>
        Δ = b² − 4ac = {nombre(r.P / 2, 1)}² − 4 × {nombre(r.S, 0)} = <strong>{nombre(r.delta, 2)}</strong>
      </>
    ),
    racines: (r) =>
      r.racines.length === 2 ? (
        <>
          x = ({nombre(r.P / 2, 1)} ± √{nombre(r.delta, 2)}) / 2 → <strong>{n2(r.racines[0]!)} m</strong> et <strong>{n2(r.racines[1]!)} m</strong>
        </>
      ) : r.racines.length === 1 ? (
        <>Δ = 0 : une seule racine, x = {n2(r.racines[0]!)} m (le rectangle est un carré)</>
      ) : (
        <>Δ &lt; 0 : pas de racine réelle</>
      ),
  },
  schema: ({ r }) => <PlanParcelle r={r} />,
  alerte: (r) => (r.racines.length === 0 ? `Impossible : avec ${nombre(r.P, 0)} m de clôture, l'aire maximale est celle du carré, ${nombre((r.P / 4) ** 2, 1)} m².` : undefined),
};

// ---------- Fonction affine : réservoir (N0.2.8) ----------
type ResReservoir = ResultatReservoir & { d: DonneesReservoir };

function GrapheReservoir({ d, r }: { d: DonneesReservoir; r: ResultatReservoir }) {
  const x0 = 60;
  const y0 = 190;
  const lg = 500;
  const ht = 160;
  const tMax = Math.max(r.tPlein * 1.15, 1);
  const hTop = d.hMax * 1.1;
  const sx = (t: number) => x0 + (t / tMax) * lg;
  const sy = (h: number) => y0 - (h / hTop) * ht;
  const pasT = tMax > 20 ? 5 : tMax > 8 ? 2 : 1;
  const graduations = Array.from({ length: Math.floor(tMax / pasT) + 1 }, (_, i) => i * pasT);
  return (
    <Figure alt={`Graphique de la hauteur d'eau en fonction du temps : droite partant de ${n2(d.h0)} m, pente ${nombre(r.a, 3)} m/h, atteint ${n2(d.hMax)} m au bout de ${nombre(r.tPlein, 2)} h`} largeur={620} hauteur={225}>
      <line x1={x0} y1={y0} x2={x0 + lg + 10} y2={y0} className="t-moyen" />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - ht - 10} className="t-moyen" />
      {graduations.map((t) => (
        <g key={t}>
          <line x1={sx(t)} y1={y0} x2={sx(t)} y2={y0 + 4} className="t-fin" />
          <Etiquette x={sx(t)} y={y0 + 16} ancre="middle" taille={10.5}>
            {nombre(t, 0)}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={x0 + lg + 12} y={y0 + 16} ancre="end" taille={11}>
        t (h)
      </Etiquette>
      <Etiquette x={x0 + 6} y={y0 - ht - 2} taille={11}>
        h (m)
      </Etiquette>
      <line x1={x0} y1={sy(d.hMax)} x2={x0 + lg} y2={sy(d.hMax)} className="t-fin" stroke="var(--color-correction)" strokeDasharray="6 3" />
      <Etiquette x={x0 + lg} y={sy(d.hMax) - 5} ancre="end" taille={11} gras>
        hₘₐₓ = {n2(d.hMax)} m
      </Etiquette>
      <polyline points={points([[sx(0), sy(d.h0)], [sx(r.tPlein), sy(d.hMax)]])} stroke="var(--color-encre)" strokeWidth={2.4} fill="none" />
      <circle cx={sx(0)} cy={sy(d.h0)} r={3.5} fill="var(--color-encre)" />
      <Etiquette x={sx(0) + 6} y={sy(d.h0) + 14} taille={11}>
        h₀ = {n2(d.h0)} m
      </Etiquette>
      <line x1={sx(r.tPlein)} y1={sy(d.hMax)} x2={sx(r.tPlein)} y2={y0} className="t-fin" strokeDasharray="3 3" />
      <Etiquette x={sx(r.tPlein) + 4} y={y0 - 6} taille={11.5} gras classe="encre">
        t = {nombre(r.tPlein, 2)} h
      </Etiquette>
    </Figure>
  );
}

const reservoirDef: DefinitionCalcul<ResReservoir> = {
  champs: [
    { cle: 'S', libelle: 'surface intérieure en plan', symbole: 'S', unite: 'm²', min: 1, max: 100, pas: 0.5, decimales: 1 },
    { cle: 'Q', libelle: 'débit de la pompe', symbole: 'Q', unite: 'm³/h', min: 0.5, max: 30, pas: 0.5, decimales: 1 },
    { cle: 'h0', libelle: 'hauteur d’eau au départ', symbole: 'h₀', unite: 'm', min: 0, max: 3, pas: 0.05, decimales: 2 },
    { cle: 'hMax', libelle: 'hauteur utile', symbole: 'hₘₐₓ', unite: 'm', min: 0.5, max: 6, pas: 0.05, decimales: 2 },
  ],
  defaut: { ...EXEMPLE_RESERVOIR },
  calculer: (e) => {
    const d = { S: num(e, 'S'), Q: num(e, 'Q'), h0: num(e, 'h0'), hMax: num(e, 'hMax') };
    return { ...reservoir(d), d };
  },
  valeurs: {
    a: (r) => grandeur(r.a, 3, 'm/h'),
    t: (r) => grandeur(r.tPlein, 2, 'h'),
    V: (r) => grandeur(r.volumeUtile, 1, 'm³'),
    hMi: (r) => grandeur(hauteurEau(r.d, r.tPlein / 2), 2, 'm'),
  },
  lignes: {
    a: (r) => (
      <>
        a = Q / S = {nombre(r.d.Q, 1)} m³/h / {nombre(r.d.S, 1)} m² = <strong>{nombre(r.a, 3)} m/h</strong>
      </>
    ),
    fonction: (r) => (
      <>
        h(t) = {n2(r.d.h0)} + {nombre(r.a, 3)} × t (h en m, t en h)
      </>
    ),
    t: (r) => (
      <>
        h(t) = {n2(r.d.hMax)} ⇔ t = ({n2(r.d.hMax)} − {n2(r.d.h0)}) / {nombre(r.a, 3)} = <strong>{nombre(r.tPlein, 2)} h</strong>
      </>
    ),
  },
  schema: ({ r }) => <GrapheReservoir d={r.d} r={r} />,
  alerte: (r) => (r.d.h0 >= r.d.hMax ? 'Le réservoir est déjà plein : h₀ doit être inférieure à hₘₐₓ.' : undefined),
};

// ---------- Exponentielle : durcissement du béton (N0.2.9) ----------
interface ResDurcissement {
  t: number;
  fck: number;
  ciment: ClasseCiment;
  s: number;
  beta: number;
  fcm: number;
  fcmt: number;
  t70: number;
}

function CourbeDurcissement({ r }: { r: ResDurcissement }) {
  const x0 = 60;
  const y0 = 190;
  const lg = 500;
  const ht = 160;
  const tMax = 90;
  const fMax = (r.fck + DELTA_FCM) * 1.25;
  const sx = (t: number) => x0 + (t / tMax) * lg;
  const sy = (f: number) => y0 - (f / fMax) * ht;
  const courbe = (c: ClasseCiment) => Array.from({ length: 90 }, (_, i) => i + 1).map((t) => [sx(t), sy(fcmT(t, r.fck, c))] as [number, number]);
  const couleurs: Record<ClasseCiment, string> = { R: 'var(--color-validation)', N: 'var(--color-encre)', S: 'var(--color-brique)' };
  return (
    <Figure alt={`Courbes de la résistance moyenne du béton en fonction de l'âge pour les trois classes de ciment ; à ${r.t} jours, ciment ${r.ciment} : ${nombre(r.fcmt, 1)} MPa`} largeur={620} hauteur={225}>
      <line x1={x0} y1={y0} x2={x0 + lg + 10} y2={y0} className="t-moyen" />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - ht - 10} className="t-moyen" />
      {[0, 7, 14, 28, 56, 90].map((t) => (
        <Etiquette key={t} x={sx(t)} y={y0 + 16} ancre="middle" taille={10.5}>
          {t}
        </Etiquette>
      ))}
      <Etiquette x={x0 + lg + 10} y={y0 + 30} ancre="end" taille={11}>
        âge t (jours)
      </Etiquette>
      <Etiquette x={x0 + 6} y={y0 - ht - 2} taille={11}>
        fcm(t) (MPa)
      </Etiquette>
      <line x1={x0} y1={sy(r.fcm)} x2={x0 + lg} y2={sy(r.fcm)} className="t-fin" strokeDasharray="5 3" />
      <Etiquette x={x0 + lg} y={sy(r.fcm) - 4} ancre="end" taille={10.5}>
        fcm = {nombre(r.fcm, 0)} MPa (28 j)
      </Etiquette>
      {(['R', 'N', 'S'] as const).map((c) => (
        <polyline key={c} points={points(courbe(c))} fill="none" stroke={couleurs[c]} strokeWidth={c === r.ciment ? 2.6 : 1.2} strokeDasharray={c === r.ciment ? undefined : '4 3'} />
      ))}
      {(['R', 'N', 'S'] as const).map((c, i) => (
        <Etiquette key={c} x={x0 + lg - 120} y={y0 - 60 + i * 15} taille={11} gras={c === r.ciment}>
          — ciment classe {c} (s = {nombre(S_CIMENT[c], 2)})
        </Etiquette>
      ))}
      <circle cx={sx(Math.min(r.t, tMax))} cy={sy(r.fcmt)} r={4.5} fill={couleurs[r.ciment]} />
      <Etiquette x={sx(Math.min(r.t, tMax)) + 7} y={sy(r.fcmt) + 15} taille={11.5} gras>
        {nombre(r.fcmt, 1)} MPa à {r.t} j
      </Etiquette>
    </Figure>
  );
}

const durcissement: DefinitionCalcul<ResDurcissement> = {
  champs: [
    { cle: 't', libelle: 'âge du béton', symbole: 't', unite: 'jours', min: 1, max: 90, pas: 1, decimales: 0 },
    { type: 'choix', cle: 'fck', libelle: 'classe du béton', symbole: 'fck', options: [20, 25, 30, 35].map((f) => ({ valeur: f, libelle: `C${f}/${{ 20: 25, 25: 30, 30: 37, 35: 45 }[f]} (fck = ${f} MPa)` })) },
    {
      type: 'choix',
      cle: 'ciment',
      libelle: 'classe de ciment (EC2 §3.1.2(6))',
      symbole: 's',
      options: [
        { valeur: 'R', libelle: `R : CEM 42,5 R, 52,5 N, 52,5 R (s = ${nombre(S_CIMENT.R, 2)})` },
        { valeur: 'N', libelle: `N : CEM 32,5 R, 42,5 N (s = ${nombre(S_CIMENT.N, 2)})` },
        { valeur: 'S', libelle: `S : CEM 32,5 N (s = ${nombre(S_CIMENT.S, 2)})` },
      ],
    },
  ],
  defaut: { t: 7, fck: 25, ciment: 'N' },
  calculer: (e) => {
    const t = num(e, 't');
    const fck = num(e, 'fck');
    const ciment = String(e.ciment) as ClasseCiment;
    const s = S_CIMENT[ciment];
    const beta = betaCC(t, s);
    return { t, fck, ciment, s, beta, fcm: fck + DELTA_FCM, fcmt: fcmT(t, fck, ciment), t70: ageResistance(0.7, ciment) };
  },
  valeurs: {
    fcmt: (r) => grandeur(r.fcmt, 1, 'MPa'),
    beta: (r) => nombre(r.beta, 3),
    pourcent: (r) => `${nombre(r.beta * 100, 0)} %`,
    t70: (r) => grandeur(r.t70, 1, 'jours'),
  },
  lignes: {
    racine: (r) => (
      <>
        √(28 / t) = √(28 / {r.t}) = <strong>{nombre(Math.sqrt(28 / r.t), 3)}</strong>
      </>
    ),
    beta: (r) => (
      <>
        βcc = exp[{nombre(r.s, 2)} × (1 − {nombre(Math.sqrt(28 / r.t), 3)})] = exp({nombre(r.s * (1 - Math.sqrt(28 / r.t)), 3)}) = <strong>{nombre(r.beta, 3)}</strong>
      </>
    ),
    fcm: (r) => (
      <>
        fcm = fck + {DELTA_FCM} = {r.fck} + {DELTA_FCM} = {nombre(r.fcm, 0)} MPa ; fcm(t) = {nombre(r.beta, 3)} × {nombre(r.fcm, 0)} = <strong>{nombre(r.fcmt, 1)} MPa</strong>
      </>
    ),
    ln: (r) => (
      <>
        βcc = 0,70 ⇔ t = 28 / (1 − ln 0,70 / {nombre(r.s, 2)})² = 28 / (1 − ({nombre(Math.log(0.7), 3)}) / {nombre(r.s, 2)})² = <strong>{nombre(r.t70, 1)} jours</strong>
      </>
    ),
  },
  schema: ({ r }) => <CourbeDurcissement r={r} />,
};

// ---------- Mini-projet : quantités d'un béton (N0.2.P) ----------
type ResGachee = ResultatGachee & { d: DonneesGachee };

const gachee: DefinitionCalcul<ResGachee> = {
  champs: [
    { cle: 'V', libelle: 'volume de béton', symbole: 'V', unite: 'm³', min: 0.1, max: 30, pas: 0.05, decimales: 2 },
    { cle: 'ciment', libelle: 'dosage en ciment (énoncé)', symbole: 'C', unite: 'kg/m³', min: 150, max: 450, pas: 5, decimales: 0 },
    { cle: 'sable', libelle: 'sable (énoncé)', symbole: 'Sa', unite: 'L/m³', min: 200, max: 700, pas: 10, decimales: 0 },
    { cle: 'gravier', libelle: 'gravier (énoncé)', symbole: 'G', unite: 'L/m³', min: 400, max: 1000, pas: 10, decimales: 0 },
    { cle: 'eau', libelle: 'eau (énoncé)', symbole: 'E', unite: 'L/m³', min: 100, max: 250, pas: 5, decimales: 0 },
    { type: 'choix', cle: 'sac', libelle: 'sac de ciment', symbole: 'm', options: [25, 50].map((s) => ({ valeur: s, libelle: `${s} kg` })) },
  ],
  defaut: { V: 2.4, ciment: 350, sable: 400, gravier: 800, eau: 175, sac: 50 },
  calculer: (e) => {
    const d = { V: num(e, 'V'), ciment: num(e, 'ciment'), sable: num(e, 'sable'), gravier: num(e, 'gravier'), eau: num(e, 'eau'), sac: num(e, 'sac') };
    return { ...quantitesBeton(d), d };
  },
  valeurs: {
    sacs: (r) => `${r.sacs} sacs de ${r.d.sac} kg`,
    ciment: (r) => grandeur(r.cimentKg, 0, 'kg'),
    sable: (r) => grandeur(r.sableM3, 2, 'm³'),
    gravier: (r) => grandeur(r.gravierM3, 2, 'm³'),
    eau: (r) => grandeur(r.eauL, 0, 'L'),
  },
  lignes: {
    ciment: (r) => (
      <>
        ciment = {nombre(r.d.ciment, 0)} kg/m³ × {n2(r.d.V)} m³ = {nombre(r.cimentKg, 0)} kg ; {nombre(r.cimentKg, 0)} / {r.d.sac} = {n2(r.cimentKg / r.d.sac)} → <strong>{r.sacs} sacs</strong>
      </>
    ),
    granulats: (r) => (
      <>
        sable = {nombre(r.d.sable, 0)} × {n2(r.d.V)} = {nombre(r.sableM3 * 1000, 0)} L = <strong>{n2(r.sableM3)} m³</strong> ; gravier = {nombre(r.d.gravier, 0)} × {n2(r.d.V)} ={' '}
        {nombre(r.gravierM3 * 1000, 0)} L = <strong>{n2(r.gravierM3)} m³</strong>
      </>
    ),
    eau: (r) => (
      <>
        eau = {nombre(r.d.eau, 0)} × {n2(r.d.V)} = <strong>{nombre(r.eauL, 0)} L</strong>
      </>
    ),
  },
};

/** Même fiche, initialisée sur la semelle du mini-projet. */
const gacheeSemelle: DefinitionCalcul<ResGachee> = { ...gachee, defaut: { ...gachee.defaut, V: volumePrisme(EXEMPLE_SEMELLE.L, EXEMPLE_SEMELLE.B, EXEMPLE_SEMELLE.h) } };

export const CALCULS_ALGEBRE = {
  gacheeSemelle,
  inertie,
  barre,
  penteCaniveau,
  tube,
  marches,
  reactions,
  parcelle: parcelleDef,
  reservoir: reservoirDef,
  durcissement,
  gachee,
} as const;
