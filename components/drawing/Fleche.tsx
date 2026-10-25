import { points } from '@/lib/drawing/repere';
import { Etiquette } from './Figure';

type Ancre = 'start' | 'middle' | 'end';

function pointe(x: number, y: number, a: number, t: number) {
  return points([
    [x, y],
    [x - t * Math.cos(a - 0.38), y - t * Math.sin(a - 0.38)],
    [x - t * Math.cos(a + 0.38), y - t * Math.sin(a + 0.38)],
  ]);
}

/**
 * Vecteur dessiné de (x1, y1) à (x2, y2), coordonnées SVG : segment et pointe.
 * `double` ajoute une seconde pointe en retrait : convention du vecteur moment (« flèche à deux pointes »).
 */
export function Fleche({
  x1,
  y1,
  x2,
  y2,
  couleur = 'var(--color-correction)',
  epaisseur = 2.2,
  tete = 10,
  texte,
  tx,
  ty,
  ancre = 'start',
  taille = 12.5,
  pointilles = false,
  double = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  couleur?: string;
  epaisseur?: number;
  tete?: number;
  texte?: React.ReactNode;
  tx?: number;
  ty?: number;
  ancre?: Ancre;
  taille?: number;
  pointilles?: boolean;
  double?: boolean;
}) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 1e-6) return null;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const t = Math.min(tete, L * 0.6);
  const bx = x2 - t * 0.8 * Math.cos(a);
  const by = y2 - t * 0.8 * Math.sin(a);
  const x3 = x2 - t * 0.9 * Math.cos(a);
  const y3 = y2 - t * 0.9 * Math.sin(a);
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={couleur} strokeWidth={epaisseur} strokeDasharray={pointilles ? '6 4' : undefined} />
      <polygon points={pointe(x2, y2, a, t)} fill={couleur} />
      {double ? <polygon points={pointe(x3, y3, a, t)} fill={couleur} /> : null}
      {texte ? (
        <Etiquette x={tx ?? (x1 + x2) / 2} y={ty ?? (y1 + y2) / 2} ancre={ancre} taille={taille} gras couleur={couleur}>
          {texte}
        </Etiquette>
      ) : null}
    </g>
  );
}

/**
 * Flèche courbe de moment autour de (cx, cy), de l'angle a0 à l'angle a1 (degrés, comptés comme en mathématiques,
 * axe vertical vers le haut à l'écran) ; la pointe est en a1. a1 > a0 : sens trigonométrique ; a1 < a0 : sens horaire.
 */
export function ArcMoment({
  cx,
  cy,
  r,
  a0,
  a1,
  couleur = 'var(--color-correction)',
  epaisseur = 2,
  texte,
  tx,
  ty,
  ancre = 'start',
}: {
  cx: number;
  cy: number;
  r: number;
  a0: number;
  a1: number;
  couleur?: string;
  epaisseur?: number;
  texte?: React.ReactNode;
  tx?: number;
  ty?: number;
  ancre?: Ancre;
}) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const P = (d: number) => [cx + r * Math.cos(rad(d)), cy - r * Math.sin(rad(d))] as const;
  const [x0, y0] = P(a0);
  const [x1, y1] = P(a1);
  const trig = a1 > a0;
  const grand = Math.abs(a1 - a0) > 180 ? 1 : 0;
  // tangente au point d'arrivée, dans le sens du parcours (coordonnées écran)
  const s = trig ? 1 : -1;
  const ang = Math.atan2(-Math.cos(rad(a1)) * s, -Math.sin(rad(a1)) * s);
  return (
    <g>
      <path d={`M${x0} ${y0} A${r} ${r} 0 ${grand} ${trig ? 0 : 1} ${x1} ${y1}`} fill="none" stroke={couleur} strokeWidth={epaisseur} />
      <polygon points={pointe(x1, y1, ang, 9)} fill={couleur} />
      {texte ? (
        <Etiquette x={tx ?? cx + r + 6} y={ty ?? cy - r} ancre={ancre} taille={12.5} gras couleur={couleur}>
          {texte}
        </Etiquette>
      ) : null}
    </g>
  );
}
