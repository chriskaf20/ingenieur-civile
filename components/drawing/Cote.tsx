import { Etiquette } from './Figure';

/**
 * Ligne de cote entre deux points SVG, décalée perpendiculairement de `decalage`
 * (positif = à gauche du sens 1 → 2 à l'écran). Extrémités en traits obliques (bâtiment) ou en flèches.
 */
export function Cote({
  x1,
  y1,
  x2,
  y2,
  decalage = 0,
  texte,
  extremite = 'oblique',
  taille = 11.5,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  decalage?: number;
  texte: React.ReactNode;
  extremite?: 'oblique' | 'fleche';
  taille?: number;
}) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 1e-6) return null;
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const nx = uy;
  const ny = -ux;
  const sens = decalage >= 0 ? 1 : -1;
  const a1 = [x1 + nx * decalage, y1 + ny * decalage] as const;
  const a2 = [x2 + nx * decalage, y2 + ny * decalage] as const;
  const depart = (x: number, y: number) => [x + nx * sens * 3, y + ny * sens * 3] as const;
  const fin = (p: readonly [number, number]) => [p[0] + nx * sens * 4, p[1] + ny * sens * 4] as const;

  // Texte lisible de gauche à droite, ou de bas en haut pour une cote verticale.
  let angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  if (angle > 90.001) angle -= 180;
  if (angle < -90.001) angle += 180;
  if (Math.abs(angle - 90) < 0.001) angle = -90;
  const rad = (angle * Math.PI) / 180;
  const haut = [Math.sin(rad), -Math.cos(rad)] as const; // « au-dessus » du texte lu normalement
  const mx = (a1[0] + a2[0]) / 2 + haut[0] * 3.5;
  const my = (a1[1] + a2[1]) / 2 + haut[1] * 3.5;

  const extremites =
    extremite === 'oblique'
      ? [a1, a2].map(([x, y], i) => (
          <line key={i} x1={x - (ux + nx) * 3.5} y1={y - (uy + ny) * 3.5} x2={x + (ux + nx) * 3.5} y2={y + (uy + ny) * 3.5} className="t-moyen" />
        ))
      : [
          [a1, 1],
          [a2, -1],
        ].map(([p, s], i) => {
          const [x, y] = p as readonly [number, number];
          const k = s as number;
          return (
            <polygon
              key={i}
              points={`${x},${y} ${x + k * ux * 7 + nx * 2.2},${y + k * uy * 7 + ny * 2.2} ${x + k * ux * 7 - nx * 2.2},${y + k * uy * 7 - ny * 2.2}`}
              fill="var(--cote)"
            />
          );
        });

  return (
    <g>
      {decalage !== 0 ? (
        <>
          <line x1={depart(x1, y1)[0]} y1={depart(x1, y1)[1]} x2={fin(a1)[0]} y2={fin(a1)[1]} className="t-fin" />
          <line x1={depart(x2, y2)[0]} y1={depart(x2, y2)[1]} x2={fin(a2)[0]} y2={fin(a2)[1]} className="t-fin" />
        </>
      ) : null}
      <line x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} className="t-fin" stroke="var(--cote)" />
      {extremites}
      <Etiquette x={mx} y={my} ancre="middle" taille={taille} rotation={angle}>
        {texte}
      </Etiquette>
    </g>
  );
}
