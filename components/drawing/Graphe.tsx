// Tracé de fonctions dans un repère cartésien : axes gradués, courbes, aires, points.
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';
import { Etiquette } from './Figure';
import { Fleche } from './Fleche';

export interface Repere2D {
  x0: number; // bord gauche de la zone de tracé (px)
  y0: number; // bord haut (px)
  l: number; // largeur (px)
  h: number; // hauteur (px)
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  X: (x: number) => number;
  Y: (y: number) => number;
}

/** Repère : intervalle [xmin, xmax] × [ymin, ymax] dessiné dans le rectangle (x0, y0, l, h). */
export function repere2D(o: Omit<Repere2D, 'X' | 'Y'>): Repere2D {
  const X = (x: number) => o.x0 + ((x - o.xmin) / (o.xmax - o.xmin)) * o.l;
  const Y = (y: number) => o.y0 + o.h - ((y - o.ymin) / (o.ymax - o.ymin)) * o.h;
  return { ...o, X, Y };
}

/** Axes passant par l'origine quand elle est dans le repère (sinon au bord), avec graduations et titres. */
export function Axes({
  R,
  gradX = [],
  gradY = [],
  titreX,
  titreY,
  decX = 0,
  decY = 0,
  grille = false,
}: {
  R: Repere2D;
  gradX?: readonly number[];
  gradY?: readonly number[];
  titreX?: string;
  titreY?: string;
  decX?: number;
  decY?: number;
  grille?: boolean;
}) {
  const yAxeX = R.ymin <= 0 && R.ymax >= 0 ? R.Y(0) : R.Y(R.ymin);
  const xAxeY = R.xmin <= 0 && R.xmax >= 0 ? R.X(0) : R.X(R.xmin);
  return (
    <g>
      {grille
        ? [
            ...gradX.map((x) => <line key={`gx${x}`} x1={R.X(x)} y1={R.Y(R.ymin)} x2={R.X(x)} y2={R.Y(R.ymax)} className="t-fin" strokeDasharray="2 4" opacity={0.6} />),
            ...gradY.map((y) => <line key={`gy${y}`} x1={R.X(R.xmin)} y1={R.Y(y)} x2={R.X(R.xmax)} y2={R.Y(y)} className="t-fin" strokeDasharray="2 4" opacity={0.6} />),
          ]
        : null}
      <Fleche x1={R.X(R.xmin)} y1={yAxeX} x2={R.X(R.xmax) + 12} y2={yAxeX} couleur="var(--trait)" epaisseur={1.2} tete={7} />
      <Fleche x1={xAxeY} y1={R.Y(R.ymin)} x2={xAxeY} y2={R.Y(R.ymax) - 12} couleur="var(--trait)" epaisseur={1.2} tete={7} />
      {gradX.map((x) => (
        <g key={`tx${x}`}>
          <line x1={R.X(x)} y1={yAxeX} x2={R.X(x)} y2={yAxeX + 4} className="t-fin" />
          <Etiquette x={R.X(x)} y={yAxeX + 15} ancre="middle" taille={10}>
            {nombre(x, decX)}
          </Etiquette>
        </g>
      ))}
      {gradY.map((y) => (
        <g key={`ty${y}`}>
          <line x1={xAxeY - 4} y1={R.Y(y)} x2={xAxeY} y2={R.Y(y)} className="t-fin" />
          <Etiquette x={xAxeY - 7} y={R.Y(y) + 3.5} ancre="end" taille={10}>
            {nombre(y, decY)}
          </Etiquette>
        </g>
      ))}
      {titreX ? (
        <Etiquette x={R.X(R.xmax) + 12} y={yAxeX - 8} ancre="end" taille={11} gras>
          {titreX}
        </Etiquette>
      ) : null}
      {titreY ? (
        <Etiquette x={xAxeY + 8} y={R.Y(R.ymax) - 4} taille={11} gras>
          {titreY}
        </Etiquette>
      ) : null}
    </g>
  );
}

/** Courbe y = f(x) échantillonnée sur [de, a] ; coupée là où elle sort du repère (asymptotes). */
export function Courbe({
  R,
  f,
  de,
  a,
  n = 160,
  couleur = 'var(--color-encre)',
  epaisseur = 2.2,
  pointilles = false,
}: {
  R: Repere2D;
  f: (x: number) => number;
  de: number;
  a: number;
  n?: number;
  couleur?: string;
  epaisseur?: number;
  pointilles?: boolean;
}) {
  const marge = (R.ymax - R.ymin) * 0.02;
  const morceaux: Array<Array<readonly [number, number]>> = [[]];
  for (let i = 0; i <= n; i++) {
    const x = de + ((a - de) * i) / n;
    const y = f(x);
    const dedans = Number.isFinite(y) && y >= R.ymin - marge && y <= R.ymax + marge;
    if (dedans) morceaux[morceaux.length - 1]!.push([R.X(x), R.Y(y)]);
    else if (morceaux[morceaux.length - 1]!.length) morceaux.push([]);
  }
  return (
    <g>
      {morceaux
        .filter((m) => m.length > 1)
        .map((m, i) => (
          <polyline key={i} points={points(m)} fill="none" stroke={couleur} strokeWidth={epaisseur} strokeDasharray={pointilles ? '6 4' : undefined} />
        ))}
    </g>
  );
}

/** Aire entre la courbe y = f(x) et l'axe des x, sur [de, a]. */
export function Aire({ R, f, de, a, n = 100, couleur = 'var(--color-encre)', opacite = 0.15 }: { R: Repere2D; f: (x: number) => number; de: number; a: number; n?: number; couleur?: string; opacite?: number }) {
  const pts: Array<readonly [number, number]> = [[R.X(de), R.Y(0)]];
  for (let i = 0; i <= n; i++) {
    const x = de + ((a - de) * i) / n;
    pts.push([R.X(x), R.Y(Math.min(Math.max(f(x), R.ymin), R.ymax))]);
  }
  pts.push([R.X(a), R.Y(0)]);
  return <polygon points={points(pts)} fill={couleur} opacity={opacite} stroke="none" />;
}

/** Point marqué, avec son étiquette éventuelle. */
export function PointGraphe({
  R,
  x,
  y,
  couleur = 'var(--color-correction)',
  texte,
  dx = 6,
  dy = -6,
  ancre = 'start',
  rappel = false,
}: {
  R: Repere2D;
  x: number;
  y: number;
  couleur?: string;
  texte?: React.ReactNode;
  dx?: number;
  dy?: number;
  ancre?: 'start' | 'middle' | 'end';
  rappel?: boolean;
}) {
  const yAxeX = R.ymin <= 0 && R.ymax >= 0 ? R.Y(0) : R.Y(R.ymin);
  const xAxeY = R.xmin <= 0 && R.xmax >= 0 ? R.X(0) : R.X(R.xmin);
  return (
    <g>
      {rappel ? (
        <>
          <line x1={R.X(x)} y1={R.Y(y)} x2={R.X(x)} y2={yAxeX} className="t-fin" strokeDasharray="3 3" />
          <line x1={R.X(x)} y1={R.Y(y)} x2={xAxeY} y2={R.Y(y)} className="t-fin" strokeDasharray="3 3" />
        </>
      ) : null}
      <circle cx={R.X(x)} cy={R.Y(y)} r={3.6} fill={couleur} />
      {texte ? (
        <Etiquette x={R.X(x) + dx} y={R.Y(y) + dy} ancre={ancre} taille={11} gras couleur={couleur}>
          {texte}
        </Etiquette>
      ) : null}
    </g>
  );
}

/** Droite passant par (x1, y1) de pente m, tracée sur [de, a] et coupée aux bords haut et bas du repère (tangente, sécante). */
export function Droite({ R, x1, y1, m, de, a, couleur = 'var(--color-correction)', epaisseur = 1.6, pointilles = false }: { R: Repere2D; x1: number; y1: number; m: number; de: number; a: number; couleur?: string; epaisseur?: number; pointilles?: boolean }) {
  let g = de;
  let d = a;
  if (m !== 0) {
    const xa = x1 + (R.ymin - y1) / m;
    const xb = x1 + (R.ymax - y1) / m;
    g = Math.max(g, Math.min(xa, xb));
    d = Math.min(d, Math.max(xa, xb));
  } else if (y1 < R.ymin || y1 > R.ymax) return null;
  if (d <= g) return null;
  const y = (x: number) => y1 + m * (x - x1);
  return <line x1={R.X(g)} y1={R.Y(y(g))} x2={R.X(d)} y2={R.Y(y(d))} stroke={couleur} strokeWidth={epaisseur} strokeDasharray={pointilles ? '6 4' : undefined} />;
}
