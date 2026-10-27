// Schémas du module L1.3 (mécanique générale et statique). Les valeurs viennent de lib/calc/statique.ts.
// Code couleur : actions en rouge, réactions en vert, géométrie en noir ; traction en bleu, compression en rouge.
import { Cote } from '@/components/drawing/Cote';
import { ArcMoment, Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { cadreIsoDirect, Fleche3, type P2 } from '@/components/drawing/Iso3D';
import { AppuiDouble, AppuiSimple, ChargePonctuelle, ChargeRepartie, Encastrement } from '@/components/drawing/Mecanique';
import { Calque } from '@/components/gabarits/Vue3D';
import {
  reduction,
  STRUCTURES_TYPES,
  type ForcePlan,
  type DonneesCaniveau,
  type DonneesChargePoutre,
  type DonneesConsole,
  type DonneesMarquise,
  type DonneesMomentForce,
  type DonneesMurPoids,
  type DonneesPoutreConsole,
  type DonneesPratt,
  type DonneesSemelleTorseur,
  type DonneesTreillis,
  type DonneesTroisAppuis,
  type ResultatChargePoutre,
  type ResultatMomentForce,
  type ResultatMurPoids,
  type ResultatReactions,
  type ResultatRitter,
  type ResultatSemelleTorseur,
  type ResultatTreillis,
} from '@/lib/calc/statique';
import type { Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';
const TERRE = 'var(--color-terre)';

// ---------- L1.3.1 : de la surface chargée à la charge linéique ----------

/** Plan d'un plancher (bande d'influence de la poutre étudiée) et élévation de la poutre avec ses charges. */
export function BandeChargement({ d, r, prefixe = 'bc' }: { d: DonneesChargePoutre; r: ResultatChargePoutre; prefixe?: string }) {
  const x0 = 40;
  const x1 = 280;
  const yM = 132;
  const e = 62;
  const ex0 = 345;
  const ex1 = 585;
  const yb = 186;
  return (
    <Figure alt={`Plancher vu en plan : la poutre étudiée reçoit une bande de ${n2(d.e)} m de large. En élévation, elle porte G = ${n2(r.G)} kN/m et Q = ${n2(r.Q)} kN/m, soit ${n2(r.pELU)} kN/m à l'ELU`} largeur={620} hauteur={250}>
      <Hachures prefixe={prefixe} types={['terre']} />
      <Etiquette x={x0} y={24} taille={13} gras>
        vue en plan
      </Etiquette>
      <rect x={x0} y={yM - e / 2} width={x1 - x0} height={e} fill={BLEU} fillOpacity={0.13} stroke="none" />
      {[-0.5, 0.5].map((i) => (
        <line key={i} x1={x0} y1={yM + i * e} x2={x1} y2={yM + i * e} className="t-fin" strokeDasharray="6 4" />
      ))}
      {[-1, 0, 1].map((i) => (
        <line key={i} x1={x0} y1={yM + i * e} x2={x1} y2={yM + i * e} stroke="var(--trait)" strokeWidth={i === 0 ? 6 : 3} />
      ))}
      {[-1, 0, 1].flatMap((i) => [x0, x1].map((x) => <rect key={`${i}-${x}`} x={x - 6} y={yM + i * e - 6} width={12} height={12} fill="var(--trait)" />))}
      <Etiquette x={(x0 + x1) / 2} y={yM - 10} ancre="middle" taille={12.5} gras couleur={BLEU}>
        poutre étudiée
      </Etiquette>
      <Etiquette x={(x0 + x1) / 2} y={yM + 22} ancre="middle" taille={11.5} couleur={BLEU}>
        bande chargée
      </Etiquette>
      <Cote x1={x1 + 18} y1={yM + e / 2} x2={x1 + 18} y2={yM - e / 2} decalage={0} texte={`e = ${n2(d.e)} m`} />
      <Cote x1={x0} y1={yM + e + 24} x2={x1} y2={yM + e + 24} decalage={0} texte={`L = ${n2(d.L)} m`} />
      <Etiquette x={ex0} y={24} taille={13} gras>
        élévation de la poutre
      </Etiquette>
      <rect x={ex0} y={yb - 4 - 30} width={ex1 - ex0} height={30} fill={ROUGE} fillOpacity={0.12} stroke={ROUGE} strokeWidth={1.2} />
      <Etiquette x={(ex0 + ex1) / 2} y={yb - 14} ancre="middle" taille={12.5} gras couleur={ROUGE}>
        G = {n2(r.G)} kN/m
      </Etiquette>
      <rect x={ex0} y={yb - 4 - 30 - 26} width={ex1 - ex0} height={26} fill={BRIQUE} fillOpacity={0.12} stroke={BRIQUE} strokeWidth={1.2} />
      <Etiquette x={(ex0 + ex1) / 2} y={yb - 4 - 30 - 9} ancre="middle" taille={12.5} gras couleur={BRIQUE}>
        Q = {n2(r.Q)} kN/m
      </Etiquette>
      <line x1={ex0} y1={yb} x2={ex1} y2={yb} stroke="var(--trait)" strokeWidth={5} />
      <AppuiDouble x={ex0} y={yb} prefixe={prefixe} />
      <AppuiSimple x={ex1} y={yb} />
      <Etiquette x={(ex0 + ex1) / 2} y={yb + 44} ancre="middle" taille={13} gras>
        ELU : 1,35 G + 1,5 Q = {n2(r.pELU)} kN/m
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.2 : moment d'une force ----------

/** Force F appliquée en A : bras de levier d (perpendiculaire de O à la ligne d'action) et composantes. */
export function MomentForceSchema({ d, r }: { d: DonneesMomentForce; r: ResultatMomentForce }) {
  const k = 150 / Math.max(Math.abs(d.xA), Math.abs(d.yA), 0.5);
  const O: P2 = [150, 180];
  const S = (x: number, y: number): P2 => [O[0] + x * k, O[1] - y * k];
  const A = S(d.xA, d.yA);
  const ux = Math.cos((d.theta * Math.PI) / 180);
  const uy = Math.sin((d.theta * Math.PI) / 180);
  // pied de la perpendiculaire (en mètres)
  const t = -(d.xA * ux + d.yA * uy);
  const Hm: [number, number] = [d.xA + t * ux, d.yA + t * uy];
  const H = S(Hm[0], Hm[1]);
  const lF = 105;
  const queue: P2 = [A[0] - lF * ux, A[1] + lF * uy];
  const ext = 260;
  const horaire = r.M < 0;
  // petit carré d'angle droit en H
  const v1: P2 = [(O[0] - H[0]) / Math.hypot(O[0] - H[0], O[1] - H[1]) || 0, (O[1] - H[1]) / Math.hypot(O[0] - H[0], O[1] - H[1]) || 0];
  const v2: P2 = [ux, -uy];
  const c = 9;
  return (
    <Figure alt={`Force de ${n2(d.F)} kN appliquée au point A (${n2(d.xA)} ; ${n2(d.yA)}) m : bras de levier ${n2(r.bras)} m, moment en O ${n2(r.M)} kN·m, ${horaire ? 'sens horaire' : 'sens trigonométrique'}`} largeur={620} hauteur={350}>
      <line x1={A[0] - ext * ux} y1={A[1] + ext * uy} x2={A[0] + ext * ux} y2={A[1] - ext * uy} className="t-fin" strokeDasharray="8 5" />
      <line x1={O[0]} y1={O[1]} x2={A[0]} y2={A[1]} stroke="var(--trait)" strokeWidth={6} />
      <rect x={O[0] - 24} y={O[1] - 40} width={16} height={80} fill="var(--color-beton-clair)" className="t-moyen" />
      <line x1={O[0]} y1={O[1]} x2={H[0]} y2={H[1]} stroke={BLEU} strokeWidth={2.2} />
      <polyline points={points([[H[0] + c * v1[0], H[1] + c * v1[1]], [H[0] + c * v1[0] + c * v2[0], H[1] + c * v1[1] + c * v2[1]], [H[0] + c * v2[0], H[1] + c * v2[1]]])} fill="none" stroke={BLEU} strokeWidth={1.2} />
      <Etiquette x={(O[0] + H[0]) / 2 + 8} y={(O[1] + H[1]) / 2 - 6} taille={13} gras couleur={BLEU}>
        d = {n2(r.bras)} m
      </Etiquette>
      <Fleche x1={A[0] - lF * ux} y1={A[1]} x2={A[0]} y2={A[1]} couleur={BRIQUE} epaisseur={1.4} tete={7} pointilles />
      <Fleche x1={A[0]} y1={A[1] + lF * uy} x2={A[0]} y2={A[1]} couleur={BRIQUE} epaisseur={1.4} tete={7} pointilles />
      <Fleche x1={queue[0]} y1={queue[1]} x2={A[0]} y2={A[1]} couleur={ROUGE} epaisseur={3} tete={11} />
      <Etiquette x={queue[0] + 8} y={queue[1] - 4} taille={13} gras couleur={ROUGE}>
        F = {n2(d.F)} kN
      </Etiquette>
      <circle cx={O[0]} cy={O[1]} r={4.5} fill="var(--trait)" />
      <Etiquette x={O[0] - 6} y={O[1] + 22} ancre="end" taille={13} gras>
        O
      </Etiquette>
      <circle cx={A[0]} cy={A[1]} r={4} fill={ROUGE} />
      <Etiquette x={A[0] + 8} y={A[1] + 18} taille={13} gras>
        A
      </Etiquette>
      <ArcMoment cx={O[0]} cy={O[1]} r={34} a0={horaire ? 150 : 30} a1={horaire ? 30 : 150} couleur={VERT} />
      <Etiquette x={400} y={60} taille={13.5} gras couleur={VERT}>
        M<tspan dy={4} fontSize={10}>O</tspan>
        <tspan dy={-4}> = {n2(r.M)} kN·m</tspan>
      </Etiquette>
      <Etiquette x={400} y={84} taille={12.5}>
        ({horaire ? 'sens horaire' : 'sens trigonométrique'})
      </Etiquette>
      <Etiquette x={400} y={116} taille={12.5} couleur={BRIQUE}>
        composantes : F<tspan dy={4} fontSize={9}>x</tspan>
        <tspan dy={-4}> = {n2(r.Fx)} kN, F</tspan>
        <tspan dy={4} fontSize={9}>y</tspan>
        <tspan dy={-4}> = {n2(r.Fy)} kN</tspan>
      </Etiquette>
      <Etiquette x={400} y={140} taille={12} classe="etiquette">
        trait mixte : ligne d’action de F
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.3 : torseur au centre d'une semelle ----------

/** Semelle sous un poteau : N et H se réduisent en un effort excentré ; la résultante doit passer dans le tiers central. */
export function SemelleTorseurSchema({ d, r, prefixe = 'st' }: { d: DonneesSemelleTorseur; r: ResultatSemelleTorseur; prefixe?: string }) {
  const k = 300 / d.B;
  const cx = 230;
  const yHaut = 276; // dessus de la semelle
  const ep = 46; // épaisseur dessinée de la semelle
  const yBas = yHaut + ep;
  const hP = Math.min(d.h * k, 150);
  const bp = 46;
  const xR = cx + r.e * k;
  const u = [d.H, -d.N].map((v) => v / r.R) as [number, number]; // direction de la résultante (écran : y vers le bas)
  const lR = 120;
  return (
    <Figure alt={`Semelle de ${n2(d.B)} m sous un poteau : N = ${n2(d.N)} kN, H = ${n2(d.H)} kN à ${n2(d.h)} m ; moment ${n2(r.M)} kN·m, excentricité ${n2(r.e)} m, ${r.dansTiersCentral ? 'dans' : 'hors du'} tiers central (B/6 = ${n2(r.tiers)} m)`} largeur={620} hauteur={420}>
      <Hachures prefixe={prefixe} types={['ba', 'terre']} />
      <rect x={cx - 160} y={yBas} width={320} height={14} fill={hachure(prefixe, 'terre')} stroke="none" />
      <rect x={cx - (d.B / 2) * k} y={yHaut} width={d.B * k} height={ep} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect x={cx - bp / 2} y={yHaut - hP - 20} width={bp} height={hP + 20} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect x={cx - k * (d.B / 6)} y={yBas + 18} width={2 * k * (d.B / 6)} height={8} fill={VERT} fillOpacity={0.35} stroke={VERT} />
      <Etiquette x={cx} y={yBas + 42} ancre="middle" taille={12} gras couleur={VERT}>
        tiers central : ±B/6 = ±{n2(r.tiers)} m
      </Etiquette>
      <Fleche x1={cx} y1={yHaut - hP - 70} x2={cx} y2={yHaut - hP - 22} couleur={ROUGE} epaisseur={3} tete={11} />
      <Etiquette x={cx + 8} y={yHaut - hP - 52} taille={13} gras couleur={ROUGE}>
        N = {n1(d.N)} kN
      </Etiquette>
      <Fleche x1={cx - 120} y1={yHaut - hP} x2={cx - bp / 2 - 2} y2={yHaut - hP} couleur={ROUGE} epaisseur={3} tete={11} />
      <Etiquette x={cx - 120} y={yHaut - hP - 8} taille={13} gras couleur={ROUGE}>
        H = {n1(d.H)} kN
      </Etiquette>
      <Cote x1={cx + bp / 2 + 26} y1={yHaut} x2={cx + bp / 2 + 26} y2={yHaut - hP} decalage={0} texte={`h = ${n2(d.h)} m`} />
      <line x1={cx} y1={yHaut - 4} x2={cx} y2={yBas + 10} className="t-fin" strokeDasharray="6 3 2 3" />
      <Fleche x1={xR - lR * u[0]} y1={yBas - lR * -u[1]} x2={xR} y2={yBas} couleur={BLEU} epaisseur={3} tete={11} />
      <Etiquette x={xR + 10} y={yBas - 64} taille={13} gras couleur={BLEU}>
        R = {n1(r.R)} kN
      </Etiquette>
      <Cote x1={cx} y1={yBas + 4} x2={xR} y2={yBas + 4} decalage={-8} texte={`e = ${n2(r.e)} m`} />
      <Cote x1={cx - (d.B / 2) * k} y1={yBas + 76} x2={cx + (d.B / 2) * k} y2={yBas + 76} decalage={0} texte={`B = ${n2(d.B)} m`} />
      <Etiquette x={420} y={60} taille={13} gras>
        réduction au centre de la base :
      </Etiquette>
      <Etiquette x={420} y={84} taille={12.5}>
        N = {n1(d.N)} kN ; H = {n1(d.H)} kN
      </Etiquette>
      <Etiquette x={420} y={106} taille={12.5}>
        M = H h = {n2(r.M)} kN·m
      </Etiquette>
      <Etiquette x={420} y={128} taille={12.5} gras couleur={BLEU}>
        e = M / N = {n2(r.e)} m
      </Etiquette>
    </Figure>
  );
}

/** Trois forces verticales sur une barre, leur torseur en A (résultante et moment), puis la force unique équivalente. */
export function TorseurEquivalent({ forces, L }: { forces: readonly ForcePlan[]; L: number }) {
  const red = reduction(forces, 0, 0);
  const x0 = 70;
  const k = 440 / L;
  const X = (x: number) => x0 + x * k;
  const lignes = [56, 160, 264];
  const barre = (y: number) => <line x1={X(0)} y1={y} x2={X(L)} y2={y} stroke="var(--trait)" strokeWidth={5} />;
  const R = Math.abs(red.Ry);
  return (
    <Figure alt={`Trois forces verticales (${forces.map((f) => `${n1(-f.Fy)} kN en x = ${n2(f.x)} m`).join(', ')}) : torseur en A, résultante ${n1(R)} kN et moment ${n2(red.M)} kN·m ; force unique équivalente à x = ${n2(red.xCoupe ?? 0)} m`} largeur={620} hauteur={320}>
      {barre(lignes[0]!)}
      {forces.map((f) => (
        <g key={f.nom}>
          <ChargePonctuelle x={X(f.x)} y={lignes[0]! - 3} longueur={38} />
          <Etiquette x={X(f.x) + 6} y={lignes[0]! - 30} taille={12} gras couleur={ROUGE}>
            {n1(-f.Fy)} kN
          </Etiquette>
        </g>
      ))}
      <Etiquette x={X(L) + 12} y={lignes[0]! + 5} taille={12.5} gras>
        système réel
      </Etiquette>
      {barre(lignes[1]!)}
      <ChargePonctuelle x={X(0)} y={lignes[1]! - 3} longueur={52} />
      <Etiquette x={X(0) + 8} y={lignes[1]! - 40} taille={12.5} gras couleur={ROUGE}>
        R = {n1(R)} kN
      </Etiquette>
      <ArcMoment cx={X(0)} cy={lignes[1]!} r={26} a0={red.M < 0 ? 160 : 20} a1={red.M < 0 ? 20 : 160} couleur={VERT} texte={`M_A = ${n2(red.M)} kN·m`.replace('_A', 'A')} tx={X(0) + 34} ty={lignes[1]! + 30} />
      <Etiquette x={X(L) + 12} y={lignes[1]! + 5} taille={12.5} gras>
        torseur en A
      </Etiquette>
      {barre(lignes[2]!)}
      <ChargePonctuelle x={X(red.xCoupe ?? 0)} y={lignes[2]! - 3} longueur={52} />
      <Etiquette x={X(red.xCoupe ?? 0) + 8} y={lignes[2]! - 40} taille={12.5} gras couleur={ROUGE}>
        R = {n1(R)} kN
      </Etiquette>
      <Cote x1={X(0)} y1={lignes[2]! + 18} x2={X(red.xCoupe ?? 0)} y2={lignes[2]! + 18} decalage={0} texte={`x̄ = ${n2(red.xCoupe ?? 0)} m`} />
      <Etiquette x={X(L) + 12} y={lignes[2]! + 5} taille={12.5} gras>
        force unique
      </Etiquette>
      {lignes.map((y) => (
        <circle key={y} cx={X(0)} cy={y} r={4} fill="var(--trait)" />
      ))}
      <Etiquette x={X(0) - 10} y={lignes[0]! + 5} ancre="end" taille={13} gras>
        A
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.4 : marquise suspendue ----------

/** Marquise articulée au mur en A et tenue par un tirant BC : charges, effort dans le tirant et réactions en A. */
export function MarquiseSchema({ d, r, prefixe = 'mq' }: { d: DonneesMarquise; r: { T: number; HA: number; VA: number; hauteur: number }; prefixe?: string }) {
  const k = Math.min(380 / d.L, 170 / Math.max(r.hauteur, 0.1));
  const xA = 120;
  const yA = 220;
  const xB = xA + d.L * k;
  const yC = yA - r.hauteur * k;
  const ang = Math.atan2(yA - yC, xB - xA); // angle à l'écran entre le tirant et la marquise
  return (
    <Figure alt={`Marquise de ${n2(d.L)} m articulée au mur en A, tenue en bout par un tirant incliné à ${n1(d.alpha)}° : effort dans le tirant ${n2(r.T)} kN, réactions en A : ${n2(r.HA)} kN horizontalement et ${n2(r.VA)} kN verticalement`} largeur={620} hauteur={340}>
      <Hachures prefixe={prefixe} types={['maconnerie']} />
      <rect x={xA - 40} y={Math.min(yC, yA) - 30} width={40} height={yA - Math.min(yC, yA) + 70} fill={hachure(prefixe, 'maconnerie')} className="t-moyen" />
      <ChargeRepartie x1={xA} x2={xB} y={yA - 4} hauteur={24} texte={`q = ${n2(d.q)} kN/m`} />
      <line x1={xA} y1={yA} x2={xB} y2={yA} stroke="var(--trait)" strokeWidth={6} />
      <line x1={xB} y1={yA} x2={xA} y2={yC} stroke={BLEU} strokeWidth={2.4} />
      <circle cx={xA} cy={yA} r={6} fill="var(--color-papier)" className="t-fort" />
      <circle cx={xA} cy={yC} r={5} fill="var(--color-papier)" className="t-fort" />
      <circle cx={xB} cy={yA} r={5} fill="var(--color-papier)" className="t-fort" />
      <ChargePonctuelle x={xB} y={yA + 2} longueur={46} />
      <Etiquette x={xB + 8} y={yA - 34} taille={12.5} gras couleur={ROUGE}>
        P = {n2(d.P)} kN
      </Etiquette>
      <Fleche x1={xB} y1={yA} x2={xB - 70 * Math.cos(ang)} y2={yA - 70 * Math.sin(ang)} couleur={BLEU} epaisseur={3.2} tete={11} />
      <Etiquette x={(xA + xB) / 2 + 10} y={(yA + yC) / 2 - 10} taille={13} gras couleur={BLEU}>
        tirant : T = {n2(r.T)} kN
      </Etiquette>
      <path d={`M ${xB - 40} ${yA} A 40 40 0 0 1 ${xB - 40 * Math.cos(ang)} ${yA - 40 * Math.sin(ang)}`} fill="none" stroke="var(--trait)" strokeWidth={1.2} />
      <Etiquette x={xB - 62} y={yA - 6} ancre="end" taille={12.5}>
        α = {n1(d.alpha)}°
      </Etiquette>
      <Fleche x1={xA} y1={yA + 18} x2={xA + 70} y2={yA + 18} couleur={VERT} epaisseur={3} tete={11} />
      <Etiquette x={xA + 76} y={yA + 23} taille={13} gras couleur={VERT}>
        H<tspan dy={4} fontSize={10}>A</tspan>
        <tspan dy={-4}> = {n2(r.HA)} kN</tspan>
      </Etiquette>
      <Fleche x1={xA + 14} y1={yA + 80} x2={xA + 14} y2={yA + 10} couleur={VERT} epaisseur={3} tete={11} />
      <Etiquette x={xA + 22} y={yA + 72} taille={13} gras couleur={VERT}>
        V<tspan dy={4} fontSize={10}>A</tspan>
        <tspan dy={-4}> = {n2(r.VA)} kN</tspan>
      </Etiquette>
      <Etiquette x={xA - 8} y={yA - 10} ancre="end" taille={13} gras>
        A
      </Etiquette>
      <Etiquette x={xA - 8} y={yC - 8} ancre="end" taille={13} gras>
        C
      </Etiquette>
      <Etiquette x={xB + 8} y={yA + 20} taille={13} gras>
        B
      </Etiquette>
      <Cote x1={xA} y1={yA + 96} x2={xB} y2={yA + 96} decalage={0} texte={`L = ${n2(d.L)} m`} />
    </Figure>
  );
}

/** Solide soumis à trois forces : lignes d'action concourantes en I et triangle des forces fermé (contrôle graphique). */
export function TroisForcesMarquise({ d, r }: { d: DonneesMarquise; r: { T: number; HA: number; VA: number; Tx: number; Ty: number; hauteur: number } }) {
  const W = d.q * d.L + d.P;
  const xW = W > 0 ? ((d.q * d.L * d.L) / 2 + d.P * d.L) / W : d.L / 2; // ligne d'action de la charge totale
  const yI = (r.hauteur * (d.L - xW)) / d.L; // point de concours sur la ligne du tirant
  const k = Math.min(260 / d.L, 150 / Math.max(r.hauteur, 0.1));
  const xA = 50;
  const yA = 230;
  const S = (x: number, y: number): P2 => [xA + x * k, yA - y * k];
  const I = S(xW, yI);
  const RA = Math.hypot(r.HA, r.VA);
  // triangle des forces : échelle kF px/kN, départ en O2
  const kF = 150 / Math.max(W, r.T, RA, 1e-9);
  const O2: P2 = [470, 60];
  const p1: P2 = [O2[0], O2[1] + W * kF];
  const p2: P2 = [p1[0] - r.Tx * kF, p1[1] - r.Ty * kF];
  return (
    <Figure alt={`Marquise soumise à trois forces : charge totale ${n2(W)} kN, effort du tirant ${n2(r.T)} kN et réaction en A ${n2(RA)} kN ; leurs lignes d'action se coupent en un même point et le triangle des forces se ferme`} largeur={620} hauteur={290}>
      <line x1={S(0, 0)[0]} y1={S(0, 0)[1]} x2={S(d.L, 0)[0]} y2={S(d.L, 0)[1]} stroke="var(--trait)" strokeWidth={5} />
      <line x1={S(d.L, 0)[0]} y1={S(d.L, 0)[1]} x2={S(0, r.hauteur)[0]} y2={S(0, r.hauteur)[1]} stroke={BLEU} strokeWidth={2} />
      <line x1={S(0, -0.1)[0]} y1={S(0, -0.1)[1]} x2={S(0, r.hauteur + 0.3)[0]} y2={S(0, r.hauteur + 0.3)[1]} className="t-moyen" />
      <line x1={I[0]} y1={I[1] - 60} x2={I[0]} y2={S(xW, 0)[1] + 50} stroke={ROUGE} strokeWidth={1.6} strokeDasharray="8 4" />
      <line x1={S(0, 0)[0]} y1={S(0, 0)[1]} x2={I[0] + (I[0] - S(0, 0)[0]) * 0.4} y2={I[1] + (I[1] - S(0, 0)[1]) * 0.4} stroke={VERT} strokeWidth={1.6} strokeDasharray="8 4" />
      <Fleche x1={I[0]} y1={S(xW, 0)[1] - 50} x2={I[0]} y2={S(xW, 0)[1] - 4} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={I[0] + 8} y={S(xW, 0)[1] - 30} taille={12.5} gras couleur={ROUGE}>
        W = {n2(W)} kN
      </Etiquette>
      <circle cx={I[0]} cy={I[1]} r={5} fill="var(--trait)" />
      <Etiquette x={I[0] + 8} y={I[1] - 8} taille={13} gras>
        I
      </Etiquette>
      <Etiquette x={S(0, 0)[0] - 8} y={S(0, 0)[1] + 4} ancre="end" taille={13} gras>
        A
      </Etiquette>
      <Etiquette x={S(d.L, 0)[0] + 6} y={S(d.L, 0)[1] + 16} taille={13} gras>
        B
      </Etiquette>
      <Etiquette x={S(0, 0)[0]} y={yA + 46} taille={11.5} classe="etiquette">
        trois lignes d’action concourantes en I
      </Etiquette>
      <Fleche x1={O2[0]} y1={O2[1]} x2={p1[0]} y2={p1[1]} couleur={ROUGE} epaisseur={3} tete={10} />
      <Fleche x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} couleur={BLEU} epaisseur={3} tete={10} />
      <Fleche x1={p2[0]} y1={p2[1]} x2={O2[0]} y2={O2[1]} couleur={VERT} epaisseur={3} tete={10} />
      <Etiquette x={O2[0] + 8} y={(O2[1] + p1[1]) / 2} taille={12.5} gras couleur={ROUGE}>
        W
      </Etiquette>
      <Etiquette x={(p1[0] + p2[0]) / 2 - 8} y={(p1[1] + p2[1]) / 2 + 18} ancre="end" taille={12.5} gras couleur={BLEU}>
        T = {n2(r.T)}
      </Etiquette>
      <Etiquette x={(p2[0] + O2[0]) / 2 - 10} y={(p2[1] + O2[1]) / 2 - 8} ancre="end" taille={12.5} gras couleur={VERT}>
        R<tspan dy={4} fontSize={10}>A</tspan>
        <tspan dy={-4}> = {n2(RA)}</tspan>
      </Etiquette>
      <Etiquette x={O2[0] - 60} y={O2[1] + W * kF + 50} taille={11.5} classe="etiquette">
        triangle des forces fermé (kN)
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.5 : liaisons ----------

/** Console encastrée : charges, et ce que l'encastrement doit reprendre (force verticale et moment). */
export function ConsoleSchema({ d, r, prefixe = 'cs' }: { d: DonneesConsole; r: { V: number; M: number }; prefixe?: string }) {
  const x0 = 140;
  const y0 = 150;
  const k = 380 / Math.max(d.L, 0.5);
  const xP = x0 + Math.min(d.a, d.L) * k;
  return (
    <Figure alt={`Console de ${n2(d.L)} m encastrée à gauche : q = ${n2(d.q)} kN/m et P = ${n2(d.P)} kN ; l'encastrement reprend V = ${n2(r.V)} kN et M = ${n2(r.M)} kN·m`} largeur={620} hauteur={260}>
      <Hachures prefixe={prefixe} types={['ba']} />
      <Encastrement x={x0} y={y0} hauteur={90} cote="gauche" prefixe={prefixe} />
      <ChargeRepartie x1={x0} x2={x0 + d.L * k} y={y0 - 5} hauteur={26} texte={`q = ${n2(d.q)} kN/m`} />
      <line x1={x0} y1={y0} x2={x0 + d.L * k} y2={y0} stroke="var(--trait)" strokeWidth={7} />
      <ChargePonctuelle x={xP} y={y0 - 4} longueur={70} />
      <Etiquette x={xP - 8} y={y0 - 80} ancre="end" taille={12.5} gras couleur={ROUGE}>
        P = {n2(d.P)} kN
      </Etiquette>
      <Fleche x1={x0 + 20} y1={y0 + 86} x2={x0 + 20} y2={y0 + 8} couleur={VERT} epaisseur={3} tete={11} />
      <Etiquette x={x0 + 28} y={y0 + 80} taille={13} gras couleur={VERT}>
        V = {n2(r.V)} kN
      </Etiquette>
      <ArcMoment cx={x0} cy={y0} r={46} a0={-60} a1={60} couleur={VERT} epaisseur={2.6} texte={`M = ${n2(r.M)} kN·m`} tx={x0 + 52} ty={y0 - 52} />
      <Cote x1={x0} y1={y0 + 34} x2={x0 + d.L * k} y2={y0 + 34} decalage={0} texte={`L = ${n2(d.L)} m`} />
      <Etiquette x={x0 - 18} y={y0 + 66} ancre="end" taille={12} classe="etiquette">
        encastrement
      </Etiquette>
    </Figure>
  );
}

type Q3 = Point3;

/** Les trois liaisons courantes en perspective, en trois vignettes : appui simple, articulation, encastrement, et leurs réactions. */
export function LiaisonsIso() {
  const lv = 206; // largeur d'une vignette
  const { P: P0, hauteur } = cadreIsoDirect(
    [
      [-0.3, -0.7, -1.2],
      [1.3, 2.4, -1.2],
      [-0.3, -0.7, 1.9],
      [1.3, 2.4, 1.9],
    ],
    lv,
    300,
    16,
  );
  const H = hauteur + 44;
  const vignette = (i: number) => {
    const P = (q: Q3): P2 => [P0(q)[0] + i * lv, P0(q)[1]];
    const poly = (qs: Q3[]) => points(qs.map(P));
    const boite = (x: number, y: number, z: number, dx: number, dy: number, dz: number, fill: string, cls = 't-moyen') => (
      <g>
        <polygon points={poly([[x + dx, y, z], [x + dx, y + dy, z], [x + dx, y + dy, z + dz], [x + dx, y, z + dz]])} fill={fill} className={cls} />
        <polygon points={poly([[x, y + dy, z], [x + dx, y + dy, z], [x + dx, y + dy, z + dz], [x, y + dy, z + dz]])} fill={fill} className={cls} />
        <polygon points={poly([[x, y, z + dz], [x + dx, y, z + dz], [x + dx, y + dy, z + dz], [x, y + dy, z + dz]])} fill={fill} className={cls} />
      </g>
    );
    // cylindre d'axe x (rouleau ou axe d'articulation) : silhouette et disque visible en x = x1
    const cylindre = (x0: number, x1: number, y: number, z: number, rr: number, fill: string) => {
      const cercle = (x: number): Q3[] => Array.from({ length: 36 }, (_, k) => [x, y + rr * Math.cos((2 * Math.PI * k) / 36), z + rr * Math.sin((2 * Math.PI * k) / 36)] as Q3);
      const c0 = cercle(x0).map(P);
      const c1 = cercle(x1).map(P);
      const haut = (c: readonly P2[]) => c.reduce((a, b) => (b[1] < a[1] ? b : a));
      const bas = (c: readonly P2[]) => c.reduce((a, b) => (b[1] > a[1] ? b : a));
      return (
        <g>
          <polygon points={points([haut(c0), haut(c1), bas(c1), bas(c0)])} fill={fill} className="t-moyen" />
          <polygon points={points(c1)} fill={fill} className="t-moyen" />
        </g>
      );
    };
    const lab = (q: Q3, t: string, ancre: 'start' | 'middle' | 'end' = 'start') => (
      <Etiquette x={P(q)[0] + (ancre === 'end' ? -6 : 6)} y={P(q)[1] + 4} ancre={ancre} taille={13} gras couleur={VERT}>
        {t}
      </Etiquette>
    );
    return { P, boite, cylindre, lab };
  };
  const beton = 'var(--color-beton-clair)';
  const acier = 'var(--fond-beton)';
  const [v0, v1, v2] = [vignette(0), vignette(1), vignette(2)];
  const noms: Array<[string, string]> = [
    ['appui simple', '1 réaction'],
    ['articulation', '2 réactions'],
    ['encastrement', '2 réactions + 1 moment'],
  ];
  const arc = (P: (q: Q3) => P2) => {
    const a = P([0.5, 1.2, 1.35]);
    const b = P([0.5, 1.2, -0.05]);
    return (
      <g>
        <path d={`M ${a[0]} ${a[1]} A 34 34 0 0 0 ${b[0]} ${b[1]}`} fill="none" stroke={VERT} strokeWidth={3} />
        <polygon points={points([b, [b[0] + 11, b[1] - 3], [b[0] + 4, b[1] - 12]])} fill={VERT} />
      </g>
    );
  };
  return (
    <Figure alt="Trois liaisons en perspective. Appui simple sur rouleau : une réaction verticale. Articulation sur axe : une réaction verticale et une horizontale. Encastrement dans un mur : deux réactions et un moment" largeur={620} hauteur={H}>
      <Calque id="appuis">
        {v0.boite(0, 0.4, 0, 1, 1.2, 0.12, acier)}
        {v0.cylindre(0.1, 0.9, 1.0, 0.27, 0.15, acier)}
        {v0.boite(0.15, -0.5, 0.42, 0.7, 2.4, 0.45, beton)}
        {v1.boite(0, 0.4, 0, 1, 1.2, 0.12, acier)}
        {v1.boite(0, 0.8, 0.12, 0.12, 0.4, 0.6, acier)}
        {v1.boite(0.15, -0.5, 0.42, 0.7, 2.4, 0.45, beton)}
        {v1.boite(0.88, 0.8, 0.12, 0.12, 0.4, 0.6, acier)}
        {v1.cylindre(-0.05, 1.05, 1.0, 0.62, 0.09, acier)}
        {v2.boite(0.15, -0.7, 0.42, 0.7, 2.0, 0.45, beton)}
        {v2.boite(-0.25, 1.3, -0.7, 1.5, 0.9, 2.5, beton, 't-fort')}
      </Calque>
      <Calque id="reactions">
        <Fleche3 P={v0.P} de={[0.5, 1.0, -1.1]} vers={[0.5, 1.0, -0.02]} couleur={VERT} epaisseur={3} />
        <Fleche3 P={v1.P} de={[0.5, 1.0, -1.1]} vers={[0.5, 1.0, -0.02]} couleur={VERT} epaisseur={3} />
        <Fleche3 P={v1.P} de={[0.5, -0.6, 0.06]} vers={[0.5, 0.36, 0.06]} couleur={VERT} epaisseur={3} />
        <Fleche3 P={v2.P} de={[0.5, 1.15, -1.0]} vers={[0.5, 1.15, 0.38]} couleur={VERT} epaisseur={3} />
        <Fleche3 P={v2.P} de={[0.5, 0.0, 1.25]} vers={[0.5, 1.12, 1.25]} couleur={VERT} epaisseur={3} />
        {arc(v2.P)}
      </Calque>
      <Calque id="noms">
        {v0.lab([0.5, 1.0, -0.7], 'V')}
        {v1.lab([0.5, 1.0, -0.7], 'V')}
        {v1.lab([0.5, -0.4, 0.06], 'H', 'end')}
        {v2.lab([0.5, 1.15, -0.7], 'V', 'end')}
        {v2.lab([0.5, 0.2, 1.25], 'H', 'end')}
        {v2.lab([0.5, 1.2, 1.5], 'M')}
        {noms.map(([n, r], i) => (
          <g key={n}>
            <Etiquette x={i * lv + lv / 2} y={H - 26} ancre="middle" taille={13} gras>
              {n}
            </Etiquette>
            <Etiquette x={i * lv + lv / 2} y={H - 8} ancre="middle" taille={12} couleur={VERT}>
              {r}
            </Etiquette>
          </g>
        ))}
      </Calque>
    </Figure>
  );
}

// ---------- L1.3.6 : réactions d'une poutre avec porte-à-faux ----------

/** Poutre sur deux appuis avec porte-à-faux : charges, réactions calculées (soulèvement signalé). */
export function PoutreReactions({ d, r, prefixe = 'pr' }: { d: DonneesPoutreConsole; r: ResultatReactions; prefixe?: string }) {
  const x0 = 60;
  const k = 500 / Math.max(d.L, 1);
  const y0 = 130;
  const X = (x: number) => x0 + x * k;
  const reaction = (x: number, R: number, nom: string) => {
    const haut = R >= 0;
    return (
      <g>
        <Fleche x1={X(x)} y1={haut ? y0 + 100 : y0 + 30} x2={X(x)} y2={haut ? y0 + 34 : y0 + 96} couleur={VERT} epaisseur={3} tete={11} />
        <Etiquette x={X(x) + 8} y={y0 + 84} taille={13} gras couleur={VERT}>
          {nom} = {n2(haut ? R : -R)} kN{haut ? '' : ' vers le bas'}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt={`Poutre de ${n2(d.L)} m sur appuis en x = 0 et x = ${n2(d.xB)} m, charge ${n2(d.q)} kN/m et ${n2(d.P)} kN en x = ${n2(d.a)} m : RA = ${n2(r.RA)} kN, RB = ${n2(r.RB)} kN`} largeur={620} hauteur={270}>
      <Hachures prefixe={prefixe} types={['terre']} />
      <ChargeRepartie x1={X(0)} x2={X(d.L)} y={y0 - 4} hauteur={26} texte={`q = ${n2(d.q)} kN/m`} />
      <ChargePonctuelle x={X(Math.min(d.a, d.L))} y={y0 - 34} longueur={44} />
      <Etiquette x={X(Math.min(d.a, d.L)) - 8} y={y0 - 70} ancre="end" taille={12.5} gras couleur={ROUGE}>
        P = {n2(d.P)} kN
      </Etiquette>
      <line x1={X(0)} y1={y0} x2={X(d.L)} y2={y0} stroke="var(--trait)" strokeWidth={6} />
      <AppuiDouble x={X(0)} y={y0} prefixe={prefixe} />
      <AppuiSimple x={X(d.xB)} y={y0} />
      {reaction(0, r.RA, 'R_A'.replace('_', ''))}
      {reaction(d.xB, r.RB, 'R_B'.replace('_', ''))}
      <Cote x1={X(0)} y1={y0 + 120} x2={X(d.xB)} y2={y0 + 120} decalage={0} texte={`${n2(d.xB)} m`} />
      {d.L > d.xB ? <Cote x1={X(d.xB)} y1={y0 + 120} x2={X(d.L)} y2={y0 + 120} decalage={0} texte={`${n2(d.L - d.xB)} m`} /> : null}
      <Etiquette x={X(0) - 10} y={y0 + 6} ancre="end" taille={13} gras>
        A
      </Etiquette>
      <Etiquette x={X(d.xB) + 16} y={y0 + 24} taille={13} gras>
        B
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.7 : structures types ----------

/** Dessin schématique d'une structure type (cadre de largeur l et de hauteur h, origine en haut à gauche). */
function DessinStructure({ id, x, y, l, h, prefixe }: { id: string; x: number; y: number; l: number; h: number; prefixe: string }) {
  const yb = y + h * 0.45; // niveau de la poutre
  const xa = x + 18;
  const xb = x + l - 18;
  const trait = { stroke: 'var(--trait)', strokeWidth: 4 };
  const rotule = (cx: number, cy: number) => <circle cx={cx} cy={cy} r={5} fill="var(--color-papier)" className="t-fort" />;
  const solPied = (cx: number, cy: number) => (
    <g>
      <rect x={cx - 16} y={cy} width={32} height={8} fill={hachure(prefixe, 'ba')} />
      <line x1={cx - 16} y1={cy} x2={cx + 16} y2={cy} className="t-fort" />
    </g>
  );
  const poutre = <line x1={xa} y1={yb} x2={xb} y2={yb} {...trait} />;
  switch (id) {
    case 'deuxRouleaux':
      return (
        <g>
          {poutre}
          <AppuiSimple x={xa} y={yb} t={9} />
          <AppuiSimple x={xb} y={yb} t={9} />
        </g>
      );
    case 'deuxAppuis':
      return (
        <g>
          {poutre}
          <AppuiDouble x={xa} y={yb} t={9} prefixe={prefixe} />
          <AppuiSimple x={xb} y={yb} t={9} />
        </g>
      );
    case 'console':
      return (
        <g>
          {poutre}
          <Encastrement x={xa} y={yb} hauteur={34} prefixe={prefixe} />
        </g>
      );
    case 'encastreeAppuyee':
      return (
        <g>
          {poutre}
          <Encastrement x={xa} y={yb} hauteur={34} prefixe={prefixe} />
          <AppuiSimple x={xb} y={yb} t={9} />
        </g>
      );
    case 'continue':
      return (
        <g>
          {poutre}
          <AppuiDouble x={xa} y={yb} t={9} prefixe={prefixe} />
          <AppuiSimple x={(xa + xb) / 2} y={yb} t={9} />
          <AppuiSimple x={xb} y={yb} t={9} />
        </g>
      );
    case 'biEncastree':
      return (
        <g>
          {poutre}
          <Encastrement x={xa} y={yb} hauteur={34} prefixe={prefixe} />
          <Encastrement x={xb} y={yb} hauteur={34} cote="droite" prefixe={prefixe} />
        </g>
      );
    case 'gerber': {
      const xr = xa + (xb - xa) * 0.6;
      return (
        <g>
          {poutre}
          <Encastrement x={xa} y={yb} hauteur={34} prefixe={prefixe} />
          {rotule(xr, yb)}
          <AppuiSimple x={xb} y={yb} t={9} />
        </g>
      );
    }
    default: {
      // portiques : deux poteaux et une traverse
      const yt = y + 14;
      const yp = y + h - 22;
      const xg = xa + 6;
      const xd = xb - 6;
      return (
        <g>
          <polyline points={points([[xg, yp], [xg, yt], [xd, yt], [xd, yp]])} fill="none" {...trait} />
          {id === 'portiqueEncastre' ? (
            <>
              {solPied(xg, yp)}
              {solPied(xd, yp)}
            </>
          ) : (
            <>
              <AppuiDouble x={xg} y={yp} t={9} prefixe={prefixe} />
              <AppuiDouble x={xd} y={yp} t={9} prefixe={prefixe} />
            </>
          )}
          {id === 'troisRotules' ? rotule((xg + xd) / 2, yt) : null}
        </g>
      );
    }
  }
}

/** Une structure type, avec son nom et son degré d'hyperstaticité. */
export function StructureTypeSchema({ id, h, nature, prefixe = 'sty' }: { id: string; h: number; nature: string; prefixe?: string }) {
  const s = STRUCTURES_TYPES.find((t) => t.id === id) ?? STRUCTURES_TYPES[0]!;
  return (
    <Figure alt={`${s.nom} : h = ${h}, structure ${nature}`} largeur={620} hauteur={170}>
      <Hachures prefixe={prefixe} types={['terre', 'ba']} />
      <DessinStructure id={s.id} x={140} y={10} l={340} h={150} prefixe={prefixe} />
      <Etiquette x={310} y={160} ancre="middle" taille={13} gras>
        {s.nom} : h = {h} ({nature})
      </Etiquette>
    </Figure>
  );
}

/** Galerie de structures types avec leur degré d'hyperstaticité. */
export function GalerieStructures({ ids, degres, prefixe = 'gal' }: { ids: readonly string[]; degres: readonly number[]; prefixe?: string }) {
  const l = 200;
  const hh = 128;
  return (
    <Figure alt={`Structures types et leur degré d'hyperstaticité : ${ids.map((id, i) => `${STRUCTURES_TYPES.find((t) => t.id === id)?.nom} (h = ${degres[i]})`).join(', ')}`} largeur={620} hauteur={Math.ceil(ids.length / 3) * (hh + 26) + 6}>
      <Hachures prefixe={prefixe} types={['terre', 'ba']} />
      {ids.map((id, i) => {
        const x = 8 + (i % 3) * (l + 6);
        const y = 4 + Math.floor(i / 3) * (hh + 26);
        const h = degres[i] ?? 0;
        const c = h < 0 ? ROUGE : h === 0 ? VERT : BLEU;
        return (
          <g key={id}>
            <rect x={x} y={y} width={l} height={hh + 20} rx={6} fill="none" className="t-fin" />
            <DessinStructure id={id} x={x} y={y} l={l} h={hh - 22} prefixe={prefixe} />
            <Etiquette x={x + l / 2} y={y + hh - 4} ancre="middle" taille={11} couleur="var(--trait)">
              {STRUCTURES_TYPES.find((t) => t.id === id)?.nom}
            </Etiquette>
            <Etiquette x={x + l / 2} y={y + hh + 13} ancre="middle" taille={12.5} gras couleur={c}>
              h = {h} : {h < 0 ? 'mécanisme' : h === 0 ? 'isostatique' : 'hyperstatique'}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

// ---------- L1.3.8 et L1.3.P : treillis ----------

/** Treillis plan dessiné à l'échelle : barres colorées selon le signe de l'effort, valeurs, charges et réactions. */
export function TreillisDessin({ d, r, prefixe = 'tr', largeur = 620, valeurs = true, noms = true }: { d: DonneesTreillis; r: ResultatTreillis; prefixe?: string; largeur?: number; valeurs?: boolean; noms?: boolean }) {
  const xs = d.noeuds.map((n) => n.x);
  const ys = d.noeuds.map((n) => n.y);
  const dx = Math.max(...xs) - Math.min(...xs) || 1;
  const dy = Math.max(...ys) - Math.min(...ys) || 1;
  const marge = 70;
  const k = Math.min((largeur - 2 * marge) / dx, 220 / dy);
  const hauteur = dy * k + 150;
  const X = (x: number) => marge + (x - Math.min(...xs)) * k;
  const Y = (y: number) => 60 + (Math.max(...ys) - y) * k;
  const noeud = (id: string) => d.noeuds.find((n) => n.id === id)!;
  return (
    <Figure alt={`Treillis de ${d.barres.length} barres : ${d.barres.map((b) => `${b.id} ${n2(r.efforts[b.id] ?? 0)} kN`).join(', ')} (traction positive)`} largeur={largeur} hauteur={hauteur}>
      <Hachures prefixe={prefixe} types={['terre']} />
      {d.barres.map((b) => {
        const A = noeud(b.de);
        const B = noeud(b.a);
        const N = r.efforts[b.id] ?? 0;
        const nul = Math.abs(N) < 1e-6;
        const c = nul ? 'var(--color-beton)' : N > 0 ? BLEU : ROUGE;
        return <line key={b.id} x1={X(A.x)} y1={Y(A.y)} x2={X(B.x)} y2={Y(B.y)} stroke={c} strokeWidth={nul ? 2 : 4} strokeDasharray={nul ? '6 4' : undefined} />;
      })}
      {valeurs
        ? d.barres.map((b) => {
            const A = noeud(b.de);
            const B = noeud(b.a);
            const N = r.efforts[b.id] ?? 0;
            const mx = (X(A.x) + X(B.x)) / 2;
            const my = (Y(A.y) + Y(B.y)) / 2;
            const L = Math.hypot(X(B.x) - X(A.x), Y(B.y) - Y(A.y)) || 1;
            let px = -(Y(B.y) - Y(A.y)) / L;
            let py = (X(B.x) - X(A.x)) / L;
            if (py > 0 || (py === 0 && px < 0)) {
              px = -px;
              py = -py;
            }
            return (
              <Etiquette key={`v${b.id}`} x={mx + px * 13} y={my + py * 13 + 4} ancre="middle" taille={11.5} gras couleur={Math.abs(N) < 1e-6 ? 'var(--color-beton)' : N > 0 ? BLEU : ROUGE}>
                {n2(N)}
              </Etiquette>
            );
          })
        : null}
      {d.noeuds.map((n) => (
        <g key={n.id}>
          <circle cx={X(n.x)} cy={Y(n.y)} r={4.5} fill="var(--color-papier)" className="t-fort" />
          {noms ? (
            <Etiquette x={X(n.x) + 7} y={Y(n.y) - 8} taille={11} couleur="var(--trait)">
              {n.id}
            </Etiquette>
          ) : null}
        </g>
      ))}
      {d.appuis.map((a) => {
        const n = noeud(a.noeud);
        return a.type === 'articulation' ? <AppuiDouble key={a.noeud} x={X(n.x)} y={Y(n.y) + 5} t={10} prefixe={prefixe} /> : <AppuiSimple key={a.noeud} x={X(n.x)} y={Y(n.y) + 5} t={10} />;
      })}
      {d.charges
        .filter((c) => Math.hypot(c.Fx, c.Fy) > 1e-9)
        .map((c, i) => {
          const n = noeud(c.noeud);
          const F = Math.hypot(c.Fx, c.Fy);
          const ux = c.Fx / F;
          const uy = -c.Fy / F;
          // côté libre : si une barre part du nœud dans le sens de la force, la flèche arrive par l'autre côté
          const encombre = d.appuis.some((a) => a.noeud === n.id) || d.barres.some((b) => {
            if (b.de !== n.id && b.a !== n.id) return false;
            const o = noeud(b.de === n.id ? b.a : b.de);
            const L = Math.hypot(o.x - n.x, o.y - n.y) || 1;
            return ((o.x - n.x) / L) * ux - ((o.y - n.y) / L) * uy > 0.2;
          });
          const [xa, ya, xb, yb] = encombre ? [X(n.x) - 40 * ux, Y(n.y) - 40 * uy, X(n.x) - 7 * ux, Y(n.y) - 7 * uy] : [X(n.x) + 7 * ux, Y(n.y) + 7 * uy, X(n.x) + 40 * ux, Y(n.y) + 40 * uy];
          const [xt, yt] = encombre ? [xa, ya - 6] : [xb, yb + 14];
          return (
            <g key={`c${i}`}>
              <Fleche x1={xa} y1={ya} x2={xb} y2={yb} couleur={ROUGE} epaisseur={2.4} tete={8} />
              <Etiquette x={xt + 4} y={yt} taille={11} gras couleur={ROUGE}>
                {n2(F)}
              </Etiquette>
            </g>
          );
        })}
      {r.reactions.map((rr) => {
        const n = noeud(rr.noeud);
        return (
          <Etiquette key={`r${rr.noeud}`} x={X(n.x)} y={Y(n.y) + 46} ancre="middle" taille={12} gras couleur={VERT}>
            R = {n2(rr.Ry)} kN
          </Etiquette>
        );
      })}
      <line x1={largeur - 210} y1={hauteur - 18} x2={largeur - 182} y2={hauteur - 18} stroke={BLEU} strokeWidth={4} />
      <Etiquette x={largeur - 176} y={hauteur - 14} taille={11.5}>
        traction (+)
      </Etiquette>
      <line x1={largeur - 100} y1={hauteur - 18} x2={largeur - 72} y2={hauteur - 18} stroke={ROUGE} strokeWidth={4} />
      <Etiquette x={largeur - 66} y={hauteur - 14} taille={11.5}>
        compression (−)
      </Etiquette>
      <Etiquette x={12} y={hauteur - 14} taille={11} classe="etiquette">
        efforts en kN
      </Etiquette>
    </Figure>
  );
}

/** Un nœud isolé : les efforts des barres qui y arrivent, les charges et la réaction, en équilibre. */
export function NoeudIsole({ forces, titre, compact = false }: { forces: ReadonlyArray<{ nom: string; angle: number; valeur: number; type: 'barre' | 'charge' | 'reaction' }>; titre: string; compact?: boolean }) {
  const W = compact ? 420 : 620;
  const H = compact ? 340 : 300;
  const C: P2 = compact ? [205, 150] : [250, 150];
  const L = compact ? 76 : 95;
  const dl = compact ? 12 : 22;
  const t = compact ? 12 : 12.5;
  return (
    <Figure alt={`${titre} : ${forces.map((f) => `${f.nom} ${n2(f.valeur)} kN`).join(', ')}`} largeur={W} hauteur={H} largeurMin={compact ? 280 : undefined}>
      {forces.map((f) => {
        const a = (f.angle * Math.PI) / 180;
        const u: P2 = [Math.cos(a), -Math.sin(a)];
        if (f.type === 'barre') {
          // barre tendue : la flèche s'éloigne du nœud ; comprimée : elle pousse vers le nœud
          const tendue = f.valeur >= 0;
          const c = tendue ? BLEU : ROUGE;
          return (
            <g key={f.nom}>
              <line x1={C[0]} y1={C[1]} x2={C[0] + 1.6 * L * u[0]} y2={C[1] + 1.6 * L * u[1]} stroke="var(--color-beton)" strokeWidth={10} opacity={0.35} />
              {tendue ? <Fleche x1={C[0] + 12 * u[0]} y1={C[1] + 12 * u[1]} x2={C[0] + L * u[0]} y2={C[1] + L * u[1]} couleur={c} epaisseur={3} tete={11} /> : <Fleche x1={C[0] + L * u[0]} y1={C[1] + L * u[1]} x2={C[0] + 12 * u[0]} y2={C[1] + 12 * u[1]} couleur={c} epaisseur={3} tete={11} />}
              <Etiquette x={C[0] + (L + dl) * u[0]} y={C[1] + (L + dl) * u[1] + 4} ancre={u[0] < -0.3 ? 'end' : u[0] > 0.3 ? 'start' : 'middle'} taille={t} gras couleur={c}>
                {f.nom} = {n2(f.valeur)} kN
              </Etiquette>
            </g>
          );
        }
        const c = f.type === 'charge' ? ROUGE : VERT;
        // charge et réaction dessinées dans leur sens réel ; elles arrivent au nœud, sauf si une barre occupe ce côté
        const occupe = forces.some((g) => g.type === 'barre' && Math.cos(((g.angle - f.angle - 180) * Math.PI) / 180) > 0.9);
        const s0 = occupe ? -10 : 0.85 * L;
        const s1 = occupe ? -0.85 * L : 10;
        const xt = C[0] - (occupe ? s1 : s0) * u[0] + 8;
        const yt = C[1] - (occupe ? s1 : s0) * u[1] + (u[1] > 0 ? (occupe ? 16 : -6) : occupe ? -6 : 16);
        return (
          <g key={f.nom}>
            <Fleche x1={C[0] - s0 * u[0]} y1={C[1] - s0 * u[1]} x2={C[0] - s1 * u[0]} y2={C[1] - s1 * u[1]} couleur={c} epaisseur={3} tete={11} />
            <Etiquette x={xt} y={yt} taille={t} gras couleur={c}>
              {f.nom} = {n2(f.valeur)} kN
            </Etiquette>
          </g>
        );
      })}
      <circle cx={C[0]} cy={C[1]} r={8} fill="var(--color-papier)" className="t-fort" />
      <Etiquette x={compact ? 12 : 460} y={compact ? 22 : 60} taille={13} gras>
        {titre}
      </Etiquette>
      <Etiquette x={compact ? 12 : 460} y={compact ? H - 52 : 86} taille={compact ? 11.5 : 12} couleur={BLEU}>
        traction : la flèche quitte le nœud
      </Etiquette>
      <Etiquette x={compact ? 12 : 460} y={compact ? H - 34 : 108} taille={compact ? 11.5 : 12} couleur={ROUGE}>
        compression : elle pousse le nœud
      </Etiquette>
      <Etiquette x={compact ? 12 : 460} y={compact ? H - 14 : 136} taille={compact ? 11.5 : 12}>
        Σ F<tspan dy={4} fontSize={9}>x</tspan>
        <tspan dy={-4}> = 0 et Σ F</tspan>
        <tspan dy={4} fontSize={9}>y</tspan>
        <tspan dy={-4}> = 0</tspan>
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.9 : coupe de Ritter ----------

/** Poutre Pratt coupée dans le panneau k : partie gauche isolée, trois efforts inconnus et centres des moments. */
export function CoupeRitter({ d, r }: { d: DonneesPratt; r: ResultatRitter }) {
  const n = Math.max(2, 2 * Math.round(d.n / 2));
  const k = r.k;
  const marge = 60;
  const s = Math.min((620 - 2 * marge) / (n * d.a), 170 / d.h);
  const X = (x: number) => marge + x * s;
  const Y = (y: number) => 70 + (d.h - y) * s;
  const xc = (k - 0.5) * d.a;
  const gauche = (x: number) => x <= (k - 1) * d.a + 1e-9;
  const barres: Array<[number, number, number, number]> = [];
  for (let i = 1; i <= n; i++) barres.push([(i - 1) * d.a, 0, i * d.a, 0]);
  for (let i = 1; i <= n - 2; i++) barres.push([i * d.a, d.h, (i + 1) * d.a, d.h]);
  for (let i = 1; i <= n - 1; i++) barres.push([i * d.a, 0, i * d.a, d.h]);
  for (let j = 1; j <= n; j++) {
    if (j === 1) barres.push([0, 0, d.a, d.h]);
    else if (j === n) barres.push([n * d.a, 0, (n - 1) * d.a, d.h]);
    else if (j <= n / 2) barres.push([(j - 1) * d.a, d.h, j * d.a, 0]);
    else barres.push([j * d.a, d.h, (j - 1) * d.a, 0]);
  }
  const fleche = (x1: number, y1: number, x2: number, y2: number, N: number, texte: string, dyTexte: number) => {
    // effort de la partie droite sur la partie gauche, au point de coupe : traction = vers la droite le long de la barre
    const L = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / L;
    const uy = (y2 - y1) / L;
    const xm = X(xc);
    const t = (xc - x1) / (x2 - x1 || 1);
    const ym = Y(y1 + t * (y2 - y1));
    const sens = N >= 0 ? 1 : -1;
    const c = N >= 0 ? BLEU : ROUGE;
    return (
      <g>
        <Fleche x1={xm - (sens < 0 ? -30 : 0) * ux} y1={ym + (sens < 0 ? -30 : 0) * uy} x2={xm + (sens > 0 ? 30 : 0) * ux} y2={ym - (sens > 0 ? 30 : 0) * uy} couleur={c} epaisseur={3} tete={10} />
        <Etiquette x={xm + 36} y={ym + dyTexte} taille={12.5} gras couleur={c}>
          {texte}
        </Etiquette>
      </g>
    );
  };
  const centreSup: P2 = [X(k * d.a), Y(0)];
  const centreInf: P2 = k === 1 ? [X(d.a), Y(d.h)] : [X((k - 1) * d.a), Y(d.h)];
  return (
    <Figure alt={`Coupe de Ritter dans le panneau ${k} : membrure supérieure ${r.Nsup === null ? 'absente' : `${n2(r.Nsup)} kN`}, membrure inférieure ${n2(r.Ninf)} kN, diagonale ${n2(r.Ndiag)} kN`} largeur={620} hauteur={330}>
      {barres.map(([x1, y1, x2, y2], i) => {
        const g = gauche(Math.max(x1, x2)) || (Math.min(x1, x2) < xc && Math.max(x1, x2) > xc);
        return <line key={i} x1={X(x1)} y1={Y(y1)} x2={X(x2)} y2={Y(y2)} stroke={g ? 'var(--trait)' : 'var(--color-beton)'} strokeWidth={g ? 3 : 1.6} opacity={g ? 1 : 0.6} />;
      })}
      <line x1={X(xc) - 10} y1={Y(d.h) - 30} x2={X(xc) + 10} y2={Y(0) + 30} stroke={ROUGE} strokeWidth={2} strokeDasharray="10 5" />
      <Etiquette x={X(xc) + 12} y={Y(d.h) - 34} taille={12} gras couleur={ROUGE}>
        coupe
      </Etiquette>
      {k > 1 ? fleche((k - 1) * d.a, d.h, k * d.a, d.h, r.Nsup ?? 0, `Nsup = ${n2(r.Nsup ?? 0)}`, -10) : null}
      {fleche((k - 1) * d.a, 0, k * d.a, 0, r.Ninf, `Ninf = ${n2(r.Ninf)}`, 22)}
      {k === 1 ? fleche(0, 0, d.a, d.h, r.Ndiag, `Ndiag = ${n2(r.Ndiag)}`, 4) : fleche((k - 1) * d.a, d.h, k * d.a, 0, r.Ndiag, `Ndiag = ${n2(r.Ndiag)}`, 4)}
      {k > 1 ? <circle cx={centreSup[0]} cy={centreSup[1]} r={8} fill="none" stroke={VERT} strokeWidth={2.4} /> : null}
      <circle cx={centreInf[0]} cy={centreInf[1]} r={8} fill="none" stroke={BRIQUE} strokeWidth={2.4} />
      {Array.from({ length: n - 1 }, (_, i) => (i + 1) * d.a)
        .filter((x) => x < xc)
        .map((x) => (
          <ChargePonctuelle key={x} x={X(x)} y={Y(0) + 42} longueur={36} />
        ))}
      <Fleche x1={X(0)} y1={Y(0) + 70} x2={X(0)} y2={Y(0) + 8} couleur={VERT} epaisseur={3} tete={10} />
      <Etiquette x={X(0) + 8} y={Y(0) + 64} taille={12.5} gras couleur={VERT}>
        R<tspan dy={4} fontSize={10}>A</tspan>
        <tspan dy={-4}> = {n2(r.RA)} kN</tspan>
      </Etiquette>
      {k > 1 ? <circle cx={26} cy={308} r={6} fill="none" stroke={VERT} strokeWidth={2.2} /> : null}
      <Etiquette x={k > 1 ? 38 : 20} y={312} taille={12} couleur={VERT}>
        {k > 1 ? 'centre des moments pour Nsup (nœud inférieur droit du panneau)' : 'panneau d’about : pas de membrure supérieure'}
      </Etiquette>
      <circle cx={26} cy={290} r={6} fill="none" stroke={BRIQUE} strokeWidth={2.2} />
      <Etiquette x={38} y={294} taille={12} couleur={BRIQUE}>
        centre des moments pour Ninf (nœud supérieur du panneau)
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.10 : mur poids ----------

/** Coupe d'un mur poids : poids, poussée des terres, réaction du sol, bras de levier autour de l'arête aval O. */
export function MurPoidsSchema({ d, r, prefixe = 'mp' }: { d: DonneesMurPoids; r: ResultatMurPoids; prefixe?: string }) {
  const k = Math.min(200 / d.H, 230 / d.B);
  const xO = 120;
  const yb = 238;
  const X = (x: number) => xO + x * k;
  const Y = (y: number) => yb - y * k;
  const xN = Math.max(0, Math.min(d.B, r.xN));
  return (
    <Figure alt={`Mur poids de ${n2(d.H)} m : poids ${n2(r.W)} kN/m, poussée ${n2(d.Q)} kN/m à ${n2(d.zQ)} m ; renversement ${n2(r.FSr)}, glissement ${n2(r.FSg)}`} largeur={620} hauteur={346}>
      <Hachures prefixe={prefixe} types={['beton', 'terre']} />
      <polygon points={points([[X(d.B), Y(0)], [X(d.B) + 120, Y(0)], [X(d.B) + 120, Y(d.H)], [X(d.B), Y(d.H)]])} fill={hachure(prefixe, 'terre')} stroke="none" />
      <rect x={X(-0.4)} y={Y(0)} width={X(d.B) - X(-0.4) + 120} height={16} fill={hachure(prefixe, 'terre')} stroke="none" />
      <polygon points={points([[X(0), Y(0)], [X(d.B), Y(0)], [X(d.B), Y(d.H)], [X(d.B - d.b), Y(d.H)]])} fill={hachure(prefixe, 'beton')} className="t-fort" />
      <line x1={X(d.B - d.b)} y1={Y(d.H)} x2={X(d.B - d.b)} y2={Y(0)} className="t-fin" strokeDasharray="5 4" />
      <ChargePonctuelle x={X(r.x1)} y={Y(d.H * 0.35)} longueur={56} />
      <Etiquette x={X(r.x1) + 6} y={Y(d.H * 0.35) - 40} taille={12.5} gras couleur={ROUGE}>
        W1
      </Etiquette>
      <ChargePonctuelle x={X(r.x2)} y={Y(d.H * 0.2)} longueur={56} />
      <Etiquette x={X(r.x2) - 26} y={Y(d.H * 0.2) - 40} taille={12.5} gras couleur={ROUGE}>
        W2
      </Etiquette>
      <Fleche x1={X(d.B) + 90} y1={Y(d.zQ)} x2={X(d.B) + 2} y2={Y(d.zQ)} couleur={ROUGE} epaisseur={3.2} tete={11} />
      <Etiquette x={X(d.B) + 20} y={Y(d.zQ) - 10} taille={12.5} gras couleur={ROUGE}>
        Q = {n2(d.Q)} kN/m
      </Etiquette>
      <Fleche x1={X(xN)} y1={Y(0) + 64} x2={X(xN)} y2={Y(0) + 2} couleur={VERT} epaisseur={3.2} tete={11} />
      <Etiquette x={X(xN) - 8} y={Y(0) + 50} ancre="end" taille={12.5} gras couleur={VERT}>
        N = W
      </Etiquette>
      <Fleche x1={X(xN) + 60} y1={Y(0) + 6} x2={X(xN) + 6} y2={Y(0) + 6} couleur={VERT} epaisseur={2.6} tete={9} />
      <Etiquette x={X(xN) + 64} y={Y(0) + 26} taille={12} gras couleur={VERT}>
        frottement
      </Etiquette>
      <circle cx={X(0)} cy={Y(0)} r={5} fill={ROUGE} />
      <Etiquette x={X(0) - 8} y={Y(0) - 6} ancre="end" taille={13} gras>
        O
      </Etiquette>
      <Cote x1={X(0)} y1={Y(0) + 76} x2={X(r.x2)} y2={Y(0) + 76} decalage={0} texte={`x2 = ${n2(r.x2)}`} />
      <Cote x1={X(0)} y1={Y(0) + 94} x2={X(r.x1)} y2={Y(0) + 94} decalage={0} texte={`x1 = ${n2(r.x1)}`} />
      <Cote x1={X(d.B) + 104} y1={Y(0)} x2={X(d.B) + 104} y2={Y(d.zQ)} decalage={0} texte={`${n2(d.zQ)} m`} />
      <Cote x1={X(0) - 30} y1={Y(0)} x2={X(0) - 30} y2={Y(d.H)} decalage={0} texte={`H = ${n2(d.H)} m`} />
      <Etiquette x={420} y={40} taille={13} gras>
        autour de O :
      </Etiquette>
      <Etiquette x={420} y={62} taille={12.5}>
        M<tspan dy={4} fontSize={9}>s</tspan>
        <tspan dy={-4}> = {n2(r.Ms)} kN·m/m</tspan>
      </Etiquette>
      <Etiquette x={420} y={84} taille={12.5}>
        M<tspan dy={4} fontSize={9}>r</tspan>
        <tspan dy={-4}> = {n2(r.Mr)} kN·m/m</tspan>
      </Etiquette>
      <Etiquette x={420} y={108} taille={12.5} gras couleur={r.FSr >= 1.5 ? VERT : ROUGE}>
        renversement : {n2(r.FSr)}
      </Etiquette>
      <Etiquette x={420} y={130} taille={12.5} gras couleur={r.FSg >= 1.5 ? VERT : ROUGE}>
        glissement : {n2(r.FSg)}
      </Etiquette>
    </Figure>
  );
}

/** Mur poids en perspective : tronçon de mur, remblai, forces (calques). */
export function MurPoidsIso({ d, r }: { d: DonneesMurPoids; r: ResultatMurPoids }) {
  const Lx = 2.4;
  // repère : y = 0 au parement amont (côté terres), y = B à l'arête aval ; x le long du mur
  const yy = (yLib: number) => d.B - yLib;
  const { P, poly, hauteur } = cadreIsoDirect(
    [
      [0, -1.8, 0],
      [Lx, -1.8, 0],
      [0, d.B + 1.2, 0],
      [Lx, d.B + 1.2, 0],
      [0, -1.8, d.H + 0.4],
      [Lx, d.B + 1.2, d.H + 0.4],
      [Lx, d.B + 1.2, -0.6],
    ],
    620,
    380,
    20,
  );
  const sec: Point3[] = [
    [Lx, yy(0), 0],
    [Lx, yy(d.B), 0],
    [Lx, yy(d.B), d.H],
    [Lx, yy(d.B - d.b), d.H],
  ];
  const xm = Lx;
  return (
    <Figure alt={`Tronçon de mur poids de ${n2(d.H)} m de haut retenant un remblai : poids ${n2(r.W)} kN/m, poussée ${n2(d.Q)} kN/m, réaction du sol et frottement à la base`} largeur={620} hauteur={hauteur}>
      <Calque id="terre">
        <polygon points={poly([[0, -1.8, d.H], [Lx, -1.8, d.H], [Lx, 0, d.H], [0, 0, d.H]])} fill="var(--fond-terre)" className="t-moyen" />
        <polygon points={poly([[Lx, -1.8, 0], [Lx, 0, 0], [Lx, 0, d.H], [Lx, -1.8, d.H]])} fill="var(--fond-terre)" className="t-moyen" />
        <polygon points={poly([[0, d.B, 0], [Lx, d.B, 0], [Lx, d.B + 1.2, 0], [0, d.B + 1.2, 0]])} fill="var(--fond-terre)" opacity={0.6} className="t-fin" />
      </Calque>
      <Calque id="mur">
        <polygon points={poly([[0, yy(d.B - d.b), d.H], [Lx, yy(d.B - d.b), d.H], [Lx, yy(d.B), d.H], [0, yy(d.B), d.H]])} fill="var(--color-beton-clair)" className="t-moyen" />
        <polygon points={poly([[0, yy(0), 0], [Lx, yy(0), 0], [Lx, yy(d.B - d.b), d.H], [0, yy(d.B - d.b), d.H]])} fill="var(--fond-beton)" className="t-moyen" />
        <polygon points={poly(sec)} fill="var(--color-beton-clair)" className="t-fort" />
      </Calque>
      <Calque id="forces">
        <Fleche3 P={P} de={[xm, yy(r.x1), d.H + 0.3]} vers={[xm, yy(r.x1), d.H * 0.45]} couleur={ROUGE} epaisseur={3} texte="W" tx={P([xm, yy(r.x1), d.H + 0.3])[0] + 8} ty={P([xm, yy(r.x1), d.H + 0.3])[1] + 4} />
        <Fleche3 P={P} de={[xm, -1.5, d.zQ]} vers={[xm, yy(d.B) + 0.02, d.zQ]} couleur={ROUGE} epaisseur={3} texte="Q" tx={P([xm, -1.5, d.zQ])[0] - 6} ty={P([xm, -1.5, d.zQ])[1] - 8} />
        <Fleche3 P={P} de={[xm, yy(r.xN), -0.55]} vers={[xm, yy(r.xN), -0.02]} couleur={VERT} epaisseur={3} texte="N" tx={P([xm, yy(r.xN), -0.55])[0] + 8} ty={P([xm, yy(r.xN), -0.55])[1] + 4} />
        <Fleche3 P={P} de={[xm, yy(r.xN) - 0.9, -0.05]} vers={[xm, yy(r.xN) - 0.05, -0.05]} couleur={VERT} epaisseur={2.6} />
      </Calque>
      <Calque id="cotes">
        <Etiquette x={P([xm, yy(0), 0])[0] + 8} y={P([xm, yy(0), 0])[1] + 18} taille={12.5} gras>
          O (arête aval)
        </Etiquette>
        <Etiquette x={P([0, -1.2, d.H])[0]} y={P([0, -1.2, d.H])[1] - 8} ancre="middle" taille={12} gras couleur={TERRE}>
          remblai
        </Etiquette>
      </Calque>
    </Figure>
  );
}

// ---------- L1.3.11 : caniveau en U ----------

/** Section en U d'un caniveau : radier et parois, centre de gravité. */
export function CaniveauSchema({ d, r, prefixe = 'cu', trou = false }: { d: DonneesCaniveau; r: { yG: number }; prefixe?: string; trou?: boolean }) {
  const k = Math.min(300 / d.B, 230 / d.H);
  const x0 = 110;
  const yb = 270;
  const X = (x: number) => x0 + x * k;
  const Y = (y: number) => yb - y * k;
  return (
    <Figure alt={`Caniveau en U de ${n1(d.B)} × ${n1(d.H)} cm, parois de ${n1(d.e)} cm, radier de ${n1(d.ef)} cm : centre de gravité à ${n2(r.yG)} cm du fond`} largeur={620} hauteur={300}>
      <Hachures prefixe={prefixe} types={['beton']} />
      {trou ? (
        <>
          <rect x={X(0)} y={Y(d.H)} width={d.B * k} height={d.H * k} fill={BLEU} fillOpacity={0.12} className="t-fort" />
          <rect x={X(d.e)} y={Y(d.H)} width={(d.B - 2 * d.e) * k} height={(d.H - d.ef) * k} fill={ROUGE} fillOpacity={0.1} stroke={ROUGE} strokeWidth={1.4} strokeDasharray="6 4" />
          <Etiquette x={X(d.B / 2)} y={Y(d.ef / 2) + 5} ancre="middle" taille={12.5} gras couleur={BLEU}>
            + rectangle plein B × H
          </Etiquette>
          <Etiquette x={X(d.B / 2)} y={Y((d.H + d.ef) / 2) + 26} ancre="middle" taille={12.5} gras couleur={ROUGE}>
            − vide intérieur
          </Etiquette>
        </>
      ) : (
        <>
          <rect x={X(0)} y={Y(d.ef)} width={d.B * k} height={d.ef * k} fill={BLEU} fillOpacity={0.12} className="t-fort" />
          <rect x={X(0)} y={Y(d.H)} width={d.e * k} height={(d.H - d.ef) * k} fill={BRIQUE} fillOpacity={0.15} className="t-fort" />
          <rect x={X(d.B - d.e)} y={Y(d.H)} width={d.e * k} height={(d.H - d.ef) * k} fill={BRIQUE} fillOpacity={0.15} className="t-fort" />
          <Etiquette x={X(d.B / 2)} y={Y(d.ef / 2) + 5} ancre="middle" taille={12.5} gras couleur={BLEU}>
            radier
          </Etiquette>
          <Etiquette x={X(d.e / 2)} y={Y(d.H) - 8} ancre="middle" taille={12.5} gras couleur={BRIQUE}>
            paroi
          </Etiquette>
          <Etiquette x={X(d.B - d.e / 2)} y={Y(d.H) - 8} ancre="middle" taille={12.5} gras couleur={BRIQUE}>
            paroi
          </Etiquette>
        </>
      )}
      <line x1={X(0) - 24} y1={Y(r.yG)} x2={X(d.B) + 24} y2={Y(r.yG)} stroke={ROUGE} strokeWidth={1.6} strokeDasharray="10 4 2 4" />
      <circle cx={X(d.B / 2)} cy={Y(r.yG)} r={5} fill={ROUGE} />
      <Etiquette x={X(d.B / 2) + 10} y={Y(r.yG) - 8} taille={13} gras couleur={ROUGE}>
        G
      </Etiquette>
      <Cote x1={X(d.B) + 40} y1={Y(0)} x2={X(d.B) + 40} y2={Y(r.yG)} decalage={0} texte={`yG = ${n2(r.yG)}`} />
      <Cote x1={X(0)} y1={Y(0) + 18} x2={X(d.B)} y2={Y(0) + 18} decalage={0} texte={`B = ${n1(d.B)}`} />
      <Cote x1={X(0) - 36} y1={Y(0)} x2={X(0) - 36} y2={Y(d.H)} decalage={0} texte={`H = ${n1(d.H)}`} />
      <Etiquette x={460} y={60} taille={12.5} gras>
        cotes en cm
      </Etiquette>
      <Etiquette x={460} y={84} taille={12.5}>
        y<tspan dy={4} fontSize={9}>G</tspan>
        <tspan dy={-4}> = Σ A</tspan>
        <tspan dy={4} fontSize={9}>i</tspan>
        <tspan dy={-4}> y</tspan>
        <tspan dy={4} fontSize={9}>i</tspan>
        <tspan dy={-4}> / Σ A</tspan>
        <tspan dy={4} fontSize={9}>i</tspan>
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.12 : trois appuis ----------

/** Plateau triangulaire vu en plan : appuis, charges et réactions. */
export function TroisAppuisPlan({ d, R }: { d: DonneesTroisAppuis; R: readonly [number, number, number] }) {
  const xs = d.appuis.map((a) => a.x);
  const ys = d.appuis.map((a) => a.y);
  const k = Math.min(330 / (Math.max(...xs) - Math.min(...xs) || 1), 220 / (Math.max(...ys) - Math.min(...ys) || 1));
  const X = (x: number) => 80 + (x - Math.min(...xs)) * k;
  const Y = (y: number) => 260 - (y - Math.min(...ys)) * k;
  return (
    <Figure alt={`Plateau sur trois appuis vu en plan : réactions ${d.appuis.map((a, i) => `${a.nom} = ${n2(R[i]!)} kN`).join(', ')}`} largeur={620} hauteur={300}>
      <polygon points={points(d.appuis.map((a) => [X(a.x), Y(a.y)] as const))} fill="var(--color-beton-clair)" className="t-fort" />
      {d.appuis.map((a, i) => (
        <g key={a.nom}>
          <circle cx={X(a.x)} cy={Y(a.y)} r={9} fill={VERT} fillOpacity={0.3} stroke={VERT} strokeWidth={2} />
          <Etiquette x={X(a.x) + (a.x <= Math.min(...xs) ? -14 : 14)} y={Y(a.y) + (a.y <= Math.min(...ys) ? 22 : -12)} ancre={a.x <= Math.min(...xs) ? 'end' : 'start'} taille={12.5} gras couleur={VERT}>
            {a.nom} : {n2(R[i]!)} kN
          </Etiquette>
        </g>
      ))}
      {d.charges.map((c) => (
        <g key={c.nom}>
          <circle cx={X(c.x)} cy={Y(c.y)} r={6} fill={ROUGE} />
          <Etiquette x={X(c.x) + 10} y={Y(c.y) + 4} taille={12} gras couleur={ROUGE}>
            {c.nom} : {n1(c.F)} kN
          </Etiquette>
        </g>
      ))}
      <Fleche x1={24} y1={92} x2={78} y2={92} couleur="var(--trait)" epaisseur={1.4} tete={7} texte="x" tx={82} ty={96} />
      <Fleche x1={24} y1={92} x2={24} y2={38} couleur="var(--trait)" epaisseur={1.4} tete={7} texte="y" tx={28} ty={40} />
    </Figure>
  );
}

/** Le même plateau en perspective : pieds, charges et réactions (calques). */
export function TroisAppuisIso({ d, R }: { d: DonneesTroisAppuis; R: readonly [number, number, number] }) {
  const h = 2.2;
  const ep = 0.25;
  // repère tourné d'un quart de tour pour que les trois pieds restent visibles en perspective
  const Q = (x: number, y: number, z: number): Point3 => [-y, x, z];
  const pts: Point3[] = d.appuis.flatMap((a) => [Q(a.x, a.y, -1.3), Q(a.x, a.y, h + ep + 1.6)]);
  const { P, poly, hauteur } = cadreIsoDirect(pts, 620, 420, 26);
  const dessus = d.appuis.map((a) => Q(a.x, a.y, h + ep));
  const dessous = d.appuis.map((a) => Q(a.x, a.y, h));
  const gx = dessus.reduce((t, q) => t + q[0], 0) / 3;
  const gy = dessus.reduce((t, q) => t + q[1], 0) / 3;
  // faces latérales visibles : normale extérieure tournée vers l'observateur (nx + ny > 0)
  const faces = [0, 1, 2].filter((i) => {
    const j = (i + 1) % 3;
    const mx = (dessus[i]![0] + dessus[j]![0]) / 2 - gx;
    const my = (dessus[i]![1] + dessus[j]![1]) / 2 - gy;
    const ex = dessus[j]![0] - dessus[i]![0];
    const ey = dessus[j]![1] - dessus[i]![1];
    let nx = ey;
    let ny = -ex;
    if (nx * mx + ny * my < 0) {
      nx = -nx;
      ny = -ny;
    }
    return nx + ny > 0;
  });
  return (
    <Figure alt={`Plateau triangulaire sur trois pieds, en perspective : charges vers le bas, réactions des pieds ${R.map((x) => n2(x)).join(', ')} kN`} largeur={620} hauteur={hauteur}>
      <Calque id="structure">
        {d.appuis.map((a) => (
          <line key={a.nom} x1={P(Q(a.x, a.y, 0))[0]} y1={P(Q(a.x, a.y, 0))[1]} x2={P(Q(a.x, a.y, h))[0]} y2={P(Q(a.x, a.y, h))[1]} stroke="var(--trait)" strokeWidth={7} />
        ))}
        {faces.map((i) => {
          const j = (i + 1) % 3;
          return <polygon key={i} points={poly([dessous[i]!, dessous[j]!, dessus[j]!, dessus[i]!])} fill="var(--fond-beton)" className="t-moyen" />;
        })}
        <polygon points={poly(dessus)} fill="var(--color-beton-clair)" className="t-fort" />
        {d.appuis.map((a) => (
          <Etiquette key={`n${a.nom}`} x={P(Q(a.x, a.y, h + ep))[0]} y={P(Q(a.x, a.y, h + ep))[1] - 8} ancre="middle" taille={13} gras>
            {a.nom}
          </Etiquette>
        ))}
      </Calque>
      <Calque id="charges">
        {d.charges.map((c) => (
          <Fleche3 key={c.nom} P={P} de={Q(c.x, c.y, h + ep + 1.3)} vers={Q(c.x, c.y, h + ep + 0.02)} couleur={ROUGE} epaisseur={3} texte={`${c.nom} ${n1(c.F)} kN`} tx={P(Q(c.x, c.y, h + ep + 1.3))[0] + 6} ty={P(Q(c.x, c.y, h + ep + 1.3))[1] - 6} />
        ))}
      </Calque>
      <Calque id="reactions">
        {d.appuis.map((a, i) => (
          <Fleche3 key={a.nom} P={P} de={Q(a.x, a.y, -0.9)} vers={Q(a.x, a.y, -0.02)} couleur={VERT} epaisseur={3} texte={`R${a.nom} = ${n1(R[i]!)} kN`} tx={P(Q(a.x, a.y, -0.9))[0] + 8} ty={P(Q(a.x, a.y, -0.9))[1] + 14} />
        ))}
      </Calque>
    </Figure>
  );
}
