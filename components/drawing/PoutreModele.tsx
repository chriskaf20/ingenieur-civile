// Poutre modélisée : appuis, charges (ponctuelles, réparties, triangulaires), résultantes, réactions et cotes.
// Convention : x vers la droite, charges vers le bas ; réactions positives vers le haut. Les valeurs viennent de lib/calc.
import { resultanteCharge, type ChargePoutre } from '@/lib/calc/statique';
import { nombre } from '@/lib/format';
import { Cote } from './Cote';
import { Etiquette, Figure } from './Figure';
import { ArcMoment, Fleche } from './Fleche';
import { Hachures } from './Hachures';
import { AppuiDouble, AppuiSimple, Encastrement } from './Mecanique';

const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const BLEU = 'var(--color-encre)';

export interface AppuiPoutre {
  x: number;
  type: 'simple' | 'double' | 'encastrement';
  nom?: string;
}

export interface ReactionPoutre {
  x: number;
  /** positive vers le haut (verticale) ou vers la droite (horizontale), en kN */
  R: number;
  nom: string;
  horizontale?: boolean;
}

export interface DonneesDessinPoutre {
  L: number;
  appuis: readonly AppuiPoutre[];
  charges: readonly ChargePoutre[];
  reactions?: readonly ReactionPoutre[];
  /** moments d'encastrement, positifs dans le sens trigonométrique (kN·m) */
  moments?: ReadonlyArray<{ x: number; M: number; nom: string }>;
  /** dessine la résultante de chaque charge répartie, en pointillés */
  resultantes?: boolean;
  /** abscisses de la chaîne de cotes (m) */
  cotes?: readonly number[];
  dec?: number;
  prefixe: string;
}

/** Hauteur dessinée au-dessus de l'axe par les charges, pour placer la poutre dans la figure. */
export function hauteurCharges(d: DonneesDessinPoutre): number {
  const rep = d.charges.some((c) => c.type === 'repartie');
  const ponc = d.charges.some((c) => c.type === 'ponctuelle');
  const hRep = rep ? 40 : 0;
  return Math.max(rep ? hRep + 22 : 0, ponc ? Math.max(58, hRep + 28) + 18 : 0, d.resultantes && rep ? hRep + 70 : 0, 20);
}

/** Groupe SVG d'une poutre entre x0 et x0 + lg, d'axe y. Renvoie le groupe et l'ordonnée la plus basse utilisée. */
export function dessinPoutre(d: DonneesDessinPoutre, x0: number, lg: number, y: number): { g: React.ReactNode; bas: number } {
  const { L, appuis, charges, reactions = [], moments = [], resultantes = false, cotes, dec = 2, prefixe } = d;
  const X = (x: number) => x0 + (x / L) * lg;
  const n = (v: number) => nombre(v, dec);
  const qmax = Math.max(1e-9, ...charges.flatMap((c) => (c.type === 'repartie' ? [Math.abs(c.q1), Math.abs(c.q2)] : [])));
  const hq = (q: number) => (Math.abs(q) < 1e-9 ? 0 : 10 + (Math.abs(q) / qmax) * 30);
  const hRep = charges.some((c) => c.type === 'repartie') ? 40 : 0;
  const lPonc = Math.max(58, hRep + 28);
  const ancre = (x: number): 'start' | 'middle' | 'end' => (X(x) < x0 + 50 ? 'start' : X(x) > x0 + lg - 50 ? 'end' : 'middle');
  const dxAncre = (x: number) => (ancre(x) === 'start' ? -6 : ancre(x) === 'end' ? 6 : 0);
  const verticales = reactions.filter((r) => !r.horizontale);
  let bas = y + 30;
  const elements: React.ReactNode[] = [];

  charges.forEach((c, i) => {
    if (c.type === 'repartie') {
      const h1 = hq(c.q1);
      const h2 = hq(c.q2);
      const xa = X(c.a);
      const xb = X(c.b);
      const nb = Math.max(3, Math.round((xb - xa) / 24));
      const uniforme = Math.abs(c.q1 - c.q2) < 1e-9;
      elements.push(
        <g key={`r${i}`}>
          <polygon points={`${xa},${y - 4} ${xa},${y - 4 - h1} ${xb},${y - 4 - h2} ${xb},${y - 4}`} fill={ROUGE} fillOpacity={0.1} stroke={ROUGE} strokeWidth={1.2} />
          {Array.from({ length: nb + 1 }, (_, k) => {
            const t = k / nb;
            const h = h1 + (h2 - h1) * t;
            const xi = xa + (xb - xa) * t;
            return h > 7 ? <Fleche key={k} x1={xi} y1={y - 4 - h} x2={xi} y2={y - 4} couleur={ROUGE} epaisseur={1.1} tete={5} /> : null;
          })}
          <Etiquette x={resultantes ? xa + 4 : (xa + xb) / 2} y={y - 10 - Math.max(h1, h2)} ancre={resultantes ? 'start' : 'middle'} taille={12} gras couleur={ROUGE}>
            {uniforme ? `${c.nom} = ${n(c.q1)} kN/m` : `${c.nom} : ${n(c.q1)} → ${n(c.q2)} kN/m`}
          </Etiquette>
        </g>,
      );
      if (resultantes) {
        const r = resultanteCharge(c);
        elements.push(
          <g key={`R${i}`}>
            <Fleche x1={X(r.x)} y1={y - hRep - 64} x2={X(r.x)} y2={y - 4} couleur={BLEU} epaisseur={2.4} tete={9} pointilles />
            <Etiquette x={X(r.x) + 6} y={y - hRep - 52} taille={12} gras couleur={BLEU}>
              R = {n(r.R)} kN
            </Etiquette>
          </g>,
        );
      }
    } else {
      elements.push(
        <g key={`p${i}`}>
          <Fleche x1={X(c.a)} y1={y - lPonc} x2={X(c.a)} y2={y - 4} couleur={ROUGE} epaisseur={2.6} tete={9} />
          <Etiquette x={X(c.a) + dxAncre(c.a)} y={y - lPonc - 6} ancre={ancre(c.a)} taille={12.5} gras couleur={ROUGE}>
            {c.nom} = {n(c.F)} kN
          </Etiquette>
        </g>,
      );
    }
  });

  elements.push(<line key="poutre" x1={X(0)} y1={y} x2={X(L)} y2={y} stroke="var(--trait)" strokeWidth={6} />);

  appuis.forEach((a, i) => {
    const gauche = a.x < L / 2;
    if (a.type === 'encastrement') elements.push(<Encastrement key={`a${i}`} x={X(a.x)} y={y} hauteur={46} cote={gauche ? 'gauche' : 'droite'} prefixe={prefixe} />);
    else if (a.type === 'double') elements.push(<AppuiDouble key={`a${i}`} x={X(a.x)} y={y + 3} t={11} prefixe={prefixe} />);
    else elements.push(<AppuiSimple key={`a${i}`} x={X(a.x)} y={y + 3} t={11} />);
    if (a.nom) {
      const enc = a.type === 'encastrement';
      elements.push(
        <Etiquette key={`n${i}`} x={X(a.x) + (enc ? (gauche ? -16 : 16) : gauche ? -16 : 16)} y={enc ? y - 28 : y + 26} ancre={gauche ? 'end' : 'start'} taille={13} gras>
          {a.nom}
        </Etiquette>,
      );
    }
  });

  verticales.forEach((r, i) => {
    const haut = r.R >= 0;
    const droite = X(r.x) > x0 + lg - 80;
    elements.push(
      <g key={`v${i}`}>
        <Fleche x1={X(r.x)} y1={haut ? y + 92 : y + 32} x2={X(r.x)} y2={haut ? y + 34 : y + 90} couleur={VERT} epaisseur={3} tete={10} />
        <Etiquette x={X(r.x) + (droite ? -8 : 8)} y={y + 80} ancre={droite ? 'end' : 'start'} taille={12.5} gras couleur={VERT}>
          {r.nom} = {n(Math.abs(r.R))} kN{haut ? '' : ' vers le bas'}
        </Etiquette>
      </g>,
    );
    bas = Math.max(bas, y + 94);
  });

  reactions
    .filter((r) => r.horizontale)
    .forEach((r, i) => {
      const gauche = r.x < L / 2;
      const s = r.R >= 0 ? 1 : -1;
      const xa = gauche ? X(r.x) - 66 : X(r.x) + 66;
      const xb = gauche ? X(r.x) - 16 : X(r.x) + 16;
      const [x1, x2] = s > 0 ? [Math.min(xa, xb), Math.max(xa, xb)] : [Math.max(xa, xb), Math.min(xa, xb)];
      elements.push(
        <g key={`h${i}`}>
          <Fleche x1={x1} y1={y + 12} x2={x2} y2={y + 12} couleur={VERT} epaisseur={2.6} tete={9} />
          <Etiquette x={gauche ? X(r.x) - 66 : X(r.x) + 66} y={y + 4} ancre={gauche ? 'start' : 'end'} taille={12} gras couleur={VERT}>
            {r.nom} = {n(Math.abs(r.R))} kN
          </Etiquette>
        </g>,
      );
    });

  moments.forEach((m, i) => {
    const gauche = m.x < L / 2;
    // arc du côté de l'encastrement, parcouru dans le sens du moment (trigonométrique si M > 0)
    const [a0, a1] = gauche ? (m.M >= 0 ? [140, 220] : [220, 140]) : m.M >= 0 ? [-40, 40] : [40, -40];
    elements.push(
      <ArcMoment key={`m${i}`} cx={X(m.x)} cy={y} r={30} a0={a0} a1={a1} couleur={VERT} epaisseur={2.4} texte={`${m.nom} = ${n(Math.abs(m.M))} kN·m`} tx={gauche ? X(m.x) - 40 : X(m.x) + 40} ty={y - 38} ancre={gauche ? 'end' : 'start'} />,
    );
  });

  if (cotes && cotes.length > 1) {
    const ps = [...new Set(cotes)].sort((a, b) => a - b);
    const yc = verticales.length ? y + 116 : y + 52;
    ps.slice(1).forEach((p, i) => {
      const q = ps[i]!;
      elements.push(<Cote key={`c${i}`} x1={X(q)} y1={yc} x2={X(p)} y2={yc} decalage={0} texte={`${nombre(p - q, 2)} m`} />);
    });
    bas = Math.max(bas, yc + 10);
  }

  return { g: <g>{elements}</g>, bas };
}

/** Figure d'une poutre modélisée (largeur 620). */
export function PoutreModele({ alt, legende, ...d }: DonneesDessinPoutre & { alt: string; legende?: React.ReactNode }) {
  const y = hauteurCharges(d) + 12;
  // un moment d'encastrement à gauche a son étiquette à gauche de l'appui : on décale la poutre
  const gaucheM = (d.moments ?? []).some((m) => m.x < d.L / 2);
  const { g, bas } = dessinPoutre(d, gaucheM ? 150 : 80, gaucheM ? 390 : 460, y);
  return (
    <Figure alt={alt} legende={legende} largeur={620} hauteur={bas + 14}>
      <Hachures prefixe={d.prefixe} types={['terre', 'ba']} />
      {g}
    </Figure>
  );
}
