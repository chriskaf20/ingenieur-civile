import { nombre } from '@/lib/format';
import { Cote } from './Cote';
import { Etiquette } from './Figure';
import { hachure, Hachures } from './Hachures';

/** Barre d'armature vue en coupe (disque plein). Rayon en unités SVG. */
export function BarreCoupe({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return <circle cx={cx} cy={cy} r={Math.max(r, 1.6)} className="r-armature" stroke="var(--trait)" strokeWidth={0.5} />;
}

/** Cadre (armature transversale) vu en coupe : rectangle à angles arrondis, axe de la barre. */
export function Cadre({ x, y, l, h, epaisseur, rayon = 4 }: { x: number; y: number; l: number; h: number; epaisseur: number; rayon?: number }) {
  return <rect x={x} y={y} width={l} height={h} rx={rayon} className="t-armature" strokeWidth={Math.max(epaisseur, 1.2)} />;
}

/** Positions des barres longitudinales d'une section rectangulaire (4, 6 ou 8 barres, symétriques). */
export function positionsBarres(n: number, x0: number, y0: number, x1: number, y1: number): Array<[number, number]> {
  const coins: Array<[number, number]> = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  if (n === 6) return [...coins, [mx, y0], [mx, y1]];
  if (n === 8) return [...coins, [mx, y0], [mx, y1], [x0, my], [x1, my]];
  return coins;
}

/**
 * Section rectangulaire ferraillée, dessinée à l'échelle.
 * b, h en m ; enrobage (jusqu'au cadre), φl et φt en mm.
 */
export function SectionFerraillee({
  b,
  h,
  enrobage,
  phiL,
  phiT,
  n,
  echelle = 700,
  x = 40,
  y = 30,
  prefixe = 'sec',
  cotes = true,
}: {
  b: number;
  h: number;
  enrobage: number;
  phiL: number;
  phiT: number;
  n: number;
  echelle?: number;
  x?: number;
  y?: number;
  prefixe?: string;
  cotes?: boolean;
}) {
  const s = (m: number) => m * echelle;
  const mm = (v: number) => s(v / 1000);
  const W = s(b);
  const H = s(h);
  const c = mm(enrobage);
  const t = mm(phiT);
  const dPrime = mm(enrobage + phiT + phiL / 2);
  const barres = positionsBarres(n, x + dPrime, y + dPrime, x + W - dPrime, y + H - dPrime);
  return (
    <g>
      <Hachures prefixe={prefixe} types={['ba']} />
      <rect x={x} y={y} width={W} height={H} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <Cadre x={x + c + t / 2} y={y + c + t / 2} l={W - 2 * c - t} h={H - 2 * c - t} epaisseur={t} rayon={mm(phiL) * 0.9 + t} />
      {barres.map(([bx, by], i) => (
        <BarreCoupe key={i} cx={bx} cy={by} r={mm(phiL) / 2} />
      ))}
      {cotes ? (
        <>
          <Cote x1={x} y1={y + H} x2={x + W} y2={y + H} decalage={-18} texte={`${nombre(b * 100, 0)} cm`} />
          <Cote x1={x + W} y1={y + H} x2={x + W} y2={y} decalage={-18} texte={`${nombre(h * 100, 0)} cm`} />
          <Etiquette x={x + W / 2} y={y - 10} ancre="middle" taille={11.5}>
            {n} HA {phiL} · cadres HA {phiT} · enrobage {enrobage} mm
          </Etiquette>
        </>
      ) : null}
    </g>
  );
}
