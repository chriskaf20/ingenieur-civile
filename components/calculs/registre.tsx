// Registre des fiches de calcul interactives (gabarit A). Chaque valeur affichée provient
// d'une fonction pure de lib/calc/ ; ce fichier ne fait que formater et mettre en page.

import { SectionFerraillee } from '@/components/drawing/Armatures';
import { Escalier2D, hauteurEscalier2D } from '@/components/drawing/Elements';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import type { DefinitionCalcul, Entrees } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { CALCULS_ALGEBRE } from './algebre';
import { CALCULS_METHODE } from './methode';
import { CALCULS_UNITES } from './unites';
import { MurSchema } from '@/components/schemas/MurCloture';
import { CoupePlateforme, PlanPlateforme } from '@/components/schemas/Remblai';
import { EXEMPLE_POTEAU, poteauCompressionCentree, type DonneesPoteau, type ResultatPoteau } from '@/lib/calc/ba/poteau';
import type { ClasseExposition } from '@/lib/calc/ba/enrobage';
import { CLASSES_BETON, fckDeClasse } from '@/lib/calc/ba/materiaux';
import { longueurPapier, longueurReelle } from '@/lib/calc/dessin';
import { escalierDroit, EXEMPLE_ESCALIER, type DonneesEscalier, type ResultatEscalier } from '@/lib/calc/escalier';
import { EXEMPLE_MUR, murCloture, type DonneesMurCloture, type ResultatMurCloture } from '@/lib/calc/murCloture';
import { EXEMPLE_PLATEFORME, remblaiPlateforme, type DonneesPlateforme, type ResultatPlateforme } from '@/lib/calc/terrassement';
import { grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);

// ---------- Lecture à l'échelle (L1.6.5) ----------
interface ResEchelle { reel: number; papier: number; mesure: number; E: number; longueur: number }
const echelle: DefinitionCalcul<ResEchelle> = {
  champs: [
    { cle: 'mesure', libelle: 'mesure lue sur le plan', symbole: 'm', unite: 'mm', min: 1, max: 400, pas: 1, decimales: 0 },
    { type: 'choix', cle: 'E', libelle: 'échelle du plan', symbole: '1/E', options: [20, 50, 100, 200].map((e) => ({ valeur: e, libelle: `1/${e}` })) },
    { cle: 'longueur', libelle: 'longueur réelle à dessiner', symbole: 'L', unite: 'm', min: 0.1, max: 40, pas: 0.05, decimales: 2 },
  ],
  defaut: { mesure: 54, E: 50, longueur: 3.6 },
  calculer: (e) => {
    const mesure = num(e, 'mesure');
    const E = num(e, 'E');
    const longueur = num(e, 'longueur');
    return { reel: longueurReelle(mesure, E), papier: longueurPapier(longueur, E), mesure, E, longueur };
  },
  valeurs: {
    reel: (r) => grandeur(r.reel, 2, 'm'),
    papier: (r) => grandeur(r.papier, 1, 'mm'),
    echelle: (r) => `1/${r.E}`,
  },
  lignes: {
    lecture: (r) => (
      <>
        L = m × E = {nombre(r.mesure, 0)} mm × {r.E} = {nombre(r.reel * 1000, 0)} mm = <strong>{n2(r.reel)} m</strong>
      </>
    ),
    dessin: (r) => (
      <>
        m = L ÷ E = {nombre(r.longueur * 1000, 0)} mm ÷ {r.E} = <strong>{nombre(r.papier, 1)} mm</strong>
      </>
    ),
  },
  schema: ({ r }) => {
    const k = Math.min(2.4, 560 / Math.max(r.mesure, 1));
    const L = r.mesure * k;
    const graduations = Array.from({ length: Math.floor(r.mesure / 10) + 1 }, (_, i) => i * 10);
    return (
      <Figure alt={`Segment de ${nombre(r.mesure, 0)} mm mesuré sur un plan au 1/${r.E}, soit ${n2(r.reel)} m en vraie grandeur`} largeur={620} hauteur={86}>
        <rect x={30} y={26} width={Math.max(L, 10) + 30} height={22} fill="var(--fond-note)" className="t-fin" />
        {graduations.map((g) => (
          <line key={g} x1={30 + g * k} y1={26} x2={30 + g * k} y2={g % 50 === 0 ? 40 : 34} className="t-fin" />
        ))}
        <line x1={30} y1={60} x2={30 + L} y2={60} className="t-fort" stroke="var(--color-encre)" strokeWidth={2.6} />
        <Etiquette x={30 + L / 2} y={78} ancre="middle" taille={12.5} gras classe="encre">
          {nombre(r.mesure, 0)} mm sur le plan ↔ {n2(r.reel)} m en vrai
        </Etiquette>
      </Figure>
    );
  },
};

// ---------- Remblai de plateforme (L3.8.7) ----------
const vers = (e: Entrees): DonneesPlateforme => ({
  L: num(e, 'L'), l: num(e, 'l'), Zp: num(e, 'Zp'),
  tn: [num(e, 'z1'), num(e, 'z2'), num(e, 'z3'), num(e, 'z4')], m: num(e, 'm'),
});
const cote = (cle: string, sym: React.ReactNode, libelle: string) =>
  ({ cle, libelle, symbole: sym, unite: 'm', min: 95, max: 105, pas: 0.01, decimales: 2 }) as const;
const remblai: DefinitionCalcul<ResultatPlateforme & { d: DonneesPlateforme }> = {
  champs: [
    { cle: 'L', libelle: 'longueur de la plateforme', symbole: 'L', unite: 'm', min: 5, max: 100, pas: 0.5, decimales: 2 },
    { cle: 'l', libelle: 'largeur de la plateforme', symbole: 'l', unite: 'm', min: 5, max: 100, pas: 0.5, decimales: 2 },
    cote('Zp', <>Z<sub>p</sub></>, 'cote projet de la plateforme'),
    cote('z1', <>TN<sub>1</sub></>, 'cote du terrain au coin 1'),
    cote('z2', <>TN<sub>2</sub></>, 'cote du terrain au coin 2'),
    cote('z3', <>TN<sub>3</sub></>, 'cote du terrain au coin 3'),
    cote('z4', <>TN<sub>4</sub></>, 'cote du terrain au coin 4'),
    { type: 'choix', cle: 'm', libelle: 'pente des talus (horizontal / vertical)', symbole: 'm', options: [{ valeur: 1, libelle: '1/1' }, { valeur: 1.5, libelle: '3/2' }, { valeur: 2, libelle: '2/1' }] },
  ],
  defaut: {
    L: EXEMPLE_PLATEFORME.L, l: EXEMPLE_PLATEFORME.l, Zp: EXEMPLE_PLATEFORME.Zp,
    z1: EXEMPLE_PLATEFORME.tn[0], z2: EXEMPLE_PLATEFORME.tn[1], z3: EXEMPLE_PLATEFORME.tn[2], z4: EXEMPLE_PLATEFORME.tn[3],
    m: EXEMPLE_PLATEFORME.m,
  },
  calculer: (e) => {
    const d = vers(e);
    return { ...remblaiPlateforme(d), d };
  },
  valeurs: {
    hm: (r) => grandeur(r.hMoyenne, 3, 'm'),
    S: (r) => grandeur(r.surface, 2, 'm²'),
    Vp: (r) => grandeur(r.volumePlateforme, 2, 'm³'),
    Vt: (r) => grandeur(r.volumeTalus, 2, 'm³'),
    V: (r) => grandeur(r.volumeTotal, 2, 'm³'),
    part: (r) => `${nombre(100 * r.partTalus, 1)} %`,
  },
  lignes: {
    hauteurs: (r) => (
      <span className="grid sm:grid-cols-2 sm:gap-x-6">
        {r.h.map((h, i) => (
          <span key={i} className="block">
            h<sub>{i + 1}</sub> = {n2(r.d.Zp)} − {n2(r.d.tn[i]!)} = <strong>{n2(h)} m</strong>
          </span>
        ))}
      </span>
    ),
    hm: (r) => (
      <>
        h<sub>m</sub> = (h<sub>1</sub> + h<sub>2</sub> + h<sub>3</sub> + h<sub>4</sub>) / 4 = ({r.h.map(n2).join(' + ')}) / 4 = <strong>{nombre(r.hMoyenne, 3)} m</strong>
      </>
    ),
    S: (r) => (
      <>
        S = L × l = {n2(r.d.L)} × {n2(r.d.l)} = <strong>{n2(r.surface)} m²</strong>
      </>
    ),
    Vp: (r) => (
      <>
        V<sub>p</sub> = S × h<sub>m</sub> = {n2(r.surface)} × {nombre(r.hMoyenne, 3)} = <strong>{n2(r.volumePlateforme)} m³</strong>
      </>
    ),
    cotes: (r) => {
      const noms = ['1-2', '2-3', '3-4', '4-1'];
      const L = [r.d.L, r.d.l, r.d.L, r.d.l];
      const paires = [[0, 1], [1, 2], [2, 3], [3, 0]] as const;
      return (
        <span className="grid">
          {r.volumesCotes.map((v, i) => {
            const [a, b] = paires[i]!;
            const ha = n2(r.h[a]!);
            const hb = n2(r.h[b]!);
            return (
              <span key={i} className="block">
                côté {noms[i]} : {nombre(r.d.m, 1)} × {n2(L[i]!)} × ({ha}² + {ha}·{hb} + {hb}²) / 6 = <strong>{nombre(v, 3)} m³</strong>
              </span>
            );
          })}
        </span>
      );
    },
    coins: (r) => (
      <>
        coins : {nombre(r.d.m, 1)}² / 3 × ({r.h.map((h) => `${n2(h)}³`).join(' + ')}) = <strong>{nombre(r.volumeCoinsTotal, 3)} m³</strong>
      </>
    ),
    Vt: (r) => (
      <>
        V<sub>talus</sub> = {r.volumesCotes.map((v) => nombre(v, 3)).join(' + ')} + {nombre(r.volumeCoinsTotal, 3)} = <strong>{n2(r.volumeTalus)} m³</strong>
      </>
    ),
    V: (r) => (
      <>
        V = V<sub>p</sub> + V<sub>talus</sub> = {n2(r.volumePlateforme)} + {n2(r.volumeTalus)} = <strong>{n2(r.volumeTotal)} m³</strong>
      </>
    ),
  },
  schemas: {
    plan: ({ r }) => <PlanPlateforme d={r.d} r={r} />,
    coupe: ({ r }) => <CoupePlateforme d={r.d} r={r} />,
  },
  alerte: (r) => r.message,
};

// ---------- Escalier (L3.6.9) ----------
const escalier: DefinitionCalcul<ResultatEscalier & { d: DonneesEscalier }> = {
  champs: [
    { cle: 'H', libelle: 'hauteur à franchir', symbole: 'H', unite: 'm', min: 2.2, max: 4.5, pas: 0.01, decimales: 2 },
    { cle: 'hVisee', libelle: 'hauteur de marche visée', symbole: <>h<sub>visée</sub></>, unite: 'm', min: 0.15, max: 0.19, pas: 0.005, decimales: 3 },
    { cle: 'M', libelle: 'module de Blondel 2h + g', symbole: 'M', unite: 'm', min: 0.6, max: 0.64, pas: 0.005, decimales: 3 },
    { cle: 'palier', libelle: 'longueur du palier', symbole: <>L<sub>p</sub></>, unite: 'm', min: 0.8, max: 2, pas: 0.05, decimales: 2 },
    { cle: 'emmarchement', libelle: 'emmarchement', symbole: 'E', unite: 'm', min: 0.8, max: 1.6, pas: 0.05, decimales: 2 },
    { cle: 'e', libelle: 'épaisseur de paillasse', symbole: 'e', unite: 'm', min: 0.1, max: 0.25, pas: 0.01, decimales: 2 },
  ],
  defaut: { ...EXEMPLE_ESCALIER },
  calculer: (e) => {
    const d: DonneesEscalier = { H: num(e, 'H'), hVisee: num(e, 'hVisee'), M: num(e, 'M'), palier: num(e, 'palier'), emmarchement: num(e, 'emmarchement'), e: num(e, 'e') };
    return { ...escalierDroit(d), d };
  },
  valeurs: {
    n: (r) => `${r.n} contremarches`,
    h: (r) => grandeur(r.h * 100, 1, 'cm'),
    g: (r) => grandeur(r.g * 100, 1, 'cm'),
    R: (r) => grandeur(r.reculement, 2, 'm'),
    angle: (r) => `${nombre(r.angle, 1)}°`,
    hp: (r) => grandeur(r.hauteurPalier, 2, 'm'),
    resume: (r) => `${r.n} × ${nombre(r.h * 100, 1)} cm, g = ${nombre(r.g * 100, 1)} cm`,
  },
  lignes: {
    n: (r) => (
      <>
        H / h<sub>visée</sub> = {n2(r.d.H)} / {nombre(r.d.hVisee, 3)} = {n2(r.nBrut)} → on arrondit : <strong>n = {r.n} contremarches</strong>
      </>
    ),
    h: (r) => (
      <>
        h = H / n = {n2(r.d.H)} / {r.n} = {nombre(r.h, 4)} m = <strong>{nombre(r.h * 100, 1)} cm</strong>
      </>
    ),
    g: (r) => (
      <>
        g = M − 2h = {nombre(r.d.M, 3)} − 2 × {nombre(r.h, 4)} = {nombre(r.g, 4)} m = <strong>{nombre(r.g * 100, 1)} cm</strong>
      </>
    ),
    volees: (r) => (
      <>
        volée 1 : {r.n1} contremarches et {r.n1 - 1} marches ; volée 2 : {r.n2} contremarches et {r.n2 - 1} marches ; palier à {r.n1} × {nombre(r.h, 4)} = <strong>{n2(r.hauteurPalier)} m</strong>
      </>
    ),
    R: (r) => (
      <>
        R = (n<sub>1</sub> − 1)·g + L<sub>p</sub> + (n<sub>2</sub> − 1)·g = {r.n1 - 1} × {nombre(r.g, 4)} + {n2(r.d.palier)} + {r.n2 - 1} × {nombre(r.g, 4)} = <strong>{n2(r.reculement)} m</strong>
      </>
    ),
    angle: (r) => (
      <>
        α = arctan(h / g) = arctan({nombre(r.h, 4)} / {nombre(r.g, 4)}) = <strong>{nombre(r.angle, 1)}°</strong>
      </>
    ),
  },
  schema: ({ r }) => (
    <Figure alt={`Profil de l'escalier : ${r.n} contremarches de ${nombre(r.h * 100, 1)} cm et giron de ${nombre(r.g * 100, 1)} cm`} largeur={620} hauteur={hauteurEscalier2D(r.d, r)}>
      <Escalier2D d={r.d} r={r} />
    </Figure>
  ),
  alerte: (r) => (r.valide ? undefined : r.messages.join(' ')),
};

// ---------- Poteau en compression centrée (L3.3.5) ----------
const versPoteau = (e: Entrees): DonneesPoteau => ({
  NG: num(e, 'NG'), NQ: num(e, 'NQ'), a: num(e, 'a'), b: num(e, 'b'), l: num(e, 'l'), k: num(e, 'k'),
  fck: num(e, 'fck'), fyk: 500, exposition: String(e.exposition) as ClasseExposition, phiT: num(e, 'phiT'),
});
const barres = (n: number, phi: number, s: number) => `${n} HA ${phi} (${nombre(s, 2)} cm²)`;
const poteau: DefinitionCalcul<ResultatPoteau & { d: DonneesPoteau }> = {
  champs: [
    { cle: 'NG', libelle: 'effort dû aux charges permanentes', symbole: <>N<sub>G</sub></>, unite: 'kN', min: 100, max: 3000, pas: 10, decimales: 0 },
    { cle: 'NQ', libelle: 'effort dû aux charges d’exploitation', symbole: <>N<sub>Q</sub></>, unite: 'kN', min: 0, max: 1500, pas: 10, decimales: 0 },
    { cle: 'a', libelle: 'petit côté', symbole: 'a', unite: 'm', min: 0.15, max: 0.6, pas: 0.05, decimales: 2 },
    { cle: 'b', libelle: 'grand côté', symbole: 'b', unite: 'm', min: 0.15, max: 0.8, pas: 0.05, decimales: 2 },
    { cle: 'l', libelle: 'hauteur libre', symbole: 'l', unite: 'm', min: 2, max: 6, pas: 0.05, decimales: 2 },
    { type: 'choix', cle: 'k', libelle: 'longueur de flambement', symbole: <>l<sub>0</sub></>, options: [{ valeur: 0.7, libelle: '0,7 l (extrémités tenues)' }, { valeur: 1, libelle: 'l (bi-articulé)' }] },
    { type: 'choix', cle: 'fck', libelle: 'classe de béton', symbole: <>f<sub>ck</sub></>, options: CLASSES_BETON.map((c) => ({ valeur: fckDeClasse(c), libelle: c })) },
    { type: 'choix', cle: 'exposition', libelle: 'classe d’exposition', symbole: 'X', options: ['XC1', 'XC2', 'XC3', 'XC4'].map((x) => ({ valeur: x, libelle: x })) },
    { type: 'choix', cle: 'phiT', libelle: 'diamètre des cadres', symbole: <>φ<sub>t</sub></>, options: [6, 8].map((p) => ({ valeur: p, libelle: `HA ${p}` })) },
  ],
  defaut: { ...EXEMPLE_POTEAU },
  calculer: (e) => {
    const d = versPoteau(e);
    return { ...poteauCompressionCentree(d), d };
  },
  valeurs: {
    NEd: (r) => grandeur(r.NEd, 1, 'kN'),
    lambda: (r) => nombre(r.ec2.lambda, 1),
    barresEC2: (r) => barres(r.ec2.barres.n, r.ec2.barres.phi, r.ec2.barres.section),
    barresBAEL: (r) => barres(r.bael.barres.n, r.bael.barres.phi, r.bael.barres.section),
    AsReq: (r) => grandeur(r.ec2.AsReq, 2, 'cm²'),
    Ath: (r) => grandeur(r.bael.Ath, 2, 'cm²'),
    NRd: (r) => grandeur(r.ec2.NRd, 1, 'kN'),
    taux: (r) => `${nombre(100 * r.ec2.taux, 0)} %`,
    cadres: (r) => `HA ${r.ec2.phiT}, s ≤ ${nombre(r.ec2.sMax * 100, 0)} cm (${nombre(r.ec2.sMaxExtremites * 100, 0)} cm aux extrémités)`,
  },
  lignes: {
    NEd: (r) => (
      <>
        N<sub>Ed</sub> = 1,35 N<sub>G</sub> + 1,5 N<sub>Q</sub> = 1,35 × {nombre(r.d.NG, 0)} + 1,5 × {nombre(r.d.NQ, 0)} = <strong>{nombre(r.NEd, 1)} kN</strong>
      </>
    ),
    materiaux: (r) => (
      <>
        f<sub>cd</sub> = {r.d.fck} / 1,5 = {nombre(r.fcd, 2)} MPa ; f<sub>yd</sub> = 500 / 1,15 = {nombre(r.fyd, 1)} MPa ; c<sub>nom</sub> = {r.ec2.enrobage.cmin} + 10 = <strong>{r.ec2.enrobage.cnom} mm</strong>
      </>
    ),
    lambda: (r) => (
      <>
        l<sub>0</sub> = {nombre(r.d.k, 1)} × {n2(r.d.l)} = {n2(r.l0)} m ; λ = l<sub>0</sub>·√12 / a = {n2(r.l0)} × 3,464 / {n2(Math.min(r.d.a, r.d.b))} = <strong>{nombre(r.ec2.lambda, 1)}</strong>
      </>
    ),
    alpha: (r) => (
      <>
        α = 0,86 / (1 + (λ/62)²) = 0,86 / (1 + ({nombre(r.ec2.lambda, 1)}/62)²) = <strong>{nombre(r.ec2.alpha, 3)}</strong> ; k<sub>h</sub> ≈ {nombre(r.ec2.khEffectif, 3)} ; k<sub>s</sub> = {nombre(r.ec2.ks, 2)}
      </>
    ),
    As: (r) => (
      <>
        N<sub>Ed</sub> = k<sub>h</sub>·k<sub>s</sub>·α·(A<sub>c</sub>·f<sub>cd</sub> + A<sub>s</sub>·f<sub>yd</sub>) → A<sub>s,req</sub> = <strong>{n2(r.ec2.AsReq)} cm²</strong> ; A<sub>s,min</sub> = {n2(r.ec2.AsMin)} cm² ; A<sub>s,max</sub> = {n2(r.ec2.AsMax)} cm²
      </>
    ),
    NRd: (r) => (
      <>
        avec {r.ec2.barres.n} HA {r.ec2.barres.phi} : N<sub>Rd</sub> = {nombre(r.ec2.NRd, 1)} kN ≥ N<sub>Ed</sub> = {nombre(r.NEd, 1)} kN → taux de travail <strong>{nombre(100 * r.ec2.taux, 0)} %</strong>
      </>
    ),
    bael: (r) => (
      <>
        BAEL : α = {nombre(r.bael.alpha, 3)} ; B<sub>r</sub> = {nombre(r.bael.Br, 0)} cm² ; A<sub>th</sub> = (N<sub>u</sub>/α − B<sub>r</sub>·f<sub>c28</sub>/1,35) × 1,15/500 = {n2(r.bael.Ath)} cm² ; A<sub>min</sub> = {n2(r.bael.Amin)} cm² → <strong>{r.bael.barres.n} HA {r.bael.barres.phi}</strong>
      </>
    ),
  },
  schema: ({ r }) => {
    const a = Math.min(r.d.a, r.d.b);
    const b = Math.max(r.d.a, r.d.b);
    const ech = Math.min(700, 360 / b);
    return (
      <Figure alt={`Section ${nombre(a * 100, 0)} × ${nombre(b * 100, 0)} cm ferraillée par ${r.ec2.barres.n} HA ${r.ec2.barres.phi} avec cadres HA ${r.ec2.phiT}`} largeur={b * ech + 120} hauteur={a * ech + 90} largeurMin={260}>
        <SectionFerraillee b={b} h={a} enrobage={r.ec2.enrobage.cnom} phiL={r.ec2.barres.phi} phiT={r.ec2.phiT} n={r.ec2.barres.n} echelle={ech} x={40} y={34} prefixe="fc-pot" />
      </Figure>
    );
  },
  alerte: (r) => (r.ec2.valide ? undefined : r.ec2.messages.join(' ')),
};

// ---------- Mur de clôture (L3.6.6) ----------
const versMur = (e: Entrees): DonneesMurCloture => ({ ...EXEMPLE_MUR, L: num(e, 'L'), H: num(e, 'H'), sMax: num(e, 'sMax'), pertes: num(e, 'pertes') });
const mur: DefinitionCalcul<ResultatMurCloture & { d: DonneesMurCloture }> = {
  champs: [
    { cle: 'L', libelle: 'longueur hors tout', symbole: 'L', unite: 'm', min: 3, max: 100, pas: 0.5, decimales: 2 },
    { cle: 'H', libelle: 'hauteur hors sol', symbole: 'H', unite: 'm', min: 1.4, max: 3, pas: 0.2, decimales: 2 },
    { cle: 'sMax', libelle: 'entraxe maximal des poteaux', symbole: <>s<sub>max</sub></>, unite: 'm', min: 2, max: 4, pas: 0.1, decimales: 2 },
    { cle: 'pertes', libelle: 'casse et pertes de blocs', symbole: 'p', unite: '', min: 0, max: 0.15, pas: 0.01, decimales: 2 },
  ],
  defaut: { L: EXEMPLE_MUR.L, H: EXEMPLE_MUR.H, sMax: EXEMPLE_MUR.sMax, pertes: EXEMPLE_MUR.pertes },
  calculer: (e) => {
    const d = versMur(e);
    return { ...murCloture(d), d };
  },
  valeurs: {
    travees: (r) => `${r.travees} travées, ${r.poteaux} poteaux`,
    espacement: (r) => grandeur(r.espacement, 3, 'm'),
    Vba: (r) => grandeur(r.volumeBetonArme, 2, 'm³'),
    blocs: (r) => `${r.blocsElevation} blocs creux et ${r.blocsSoubassement} blocs pleins`,
  },
  lignes: {
    travees: (r) => (
      <>
        (L − a) / s<sub>max</sub> = ({n2(r.d.L)} − {n2(r.d.a)}) / {n2(r.d.sMax)} = {n2(r.rapportTravees)} → <strong>{r.travees} travées</strong>, soit {r.poteaux} poteaux ; entraxe = {n2(r.entraxeExtremes)} / {r.travees} = <strong>{nombre(r.espacement, 3)} m</strong>
      </>
    ),
    nette: (r) => (
      <>
        longueur de maçonnerie = L − n<sub>p</sub> × a = {n2(r.d.L)} − {r.poteaux} × {n2(r.d.a)} = <strong>{n2(r.longueurNette)} m</strong>
      </>
    ),
    fondation: (r) => (
      <>
        fouille {n2(r.d.L)} × {n2(r.d.B)} × {n2(r.d.D)} = {n2(r.volumeFouille)} m³ ; propreté {n2(r.volumePropre)} m³ ; semelle {n2(r.d.L)} × {n2(r.d.B)} × {n2(r.d.hSemelle)} = <strong>{n2(r.volumeSemelle)} m³</strong>
      </>
    ),
    beton: (r) => (
      <>
        poteaux {r.poteaux} × {n2(r.d.a)} × {n2(r.d.a)} × {n2(r.hauteurPoteau)} = {nombre(r.volumePoteaux, 3)} m³ ; chaînages {nombre(r.volumeChainageBas, 3)} + {nombre(r.volumeChainageHaut, 3)} m³ → béton armé <strong>{n2(r.volumeBetonArme)} m³</strong>
      </>
    ),
    blocs: (r) => (
      <>
        élévation {n2(r.surfaceElevation)} m² × {nombre(r.blocsParM2, 1)} × {nombre(1 + r.d.pertes, 2)} → <strong>{r.blocsElevation} blocs</strong> ; soubassement {n2(r.surfaceSoubassement)} m² → <strong>{r.blocsSoubassement} blocs</strong>
      </>
    ),
  },
  schema: ({ r }) => <MurSchema d={r.d} r={r} />,
  alerte: (r) => (r.messages.length ? r.messages.join(' ') : undefined),
};

export const REGISTRE = { echelle, remblai, escalier, poteau, mur, ...CALCULS_METHODE, ...CALCULS_ALGEBRE, ...CALCULS_UNITES } as const;
export type NomCalcul = keyof typeof REGISTRE;
