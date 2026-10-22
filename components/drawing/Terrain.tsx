import { points } from '@/lib/drawing/repere';
import { Etiquette } from './Figure';
import { hachure } from './Hachures';

/** Terrain naturel : trait fort, motif « terre » sur une bande sous la ligne, mention TN. */
export function TerrainNaturel({
  pts,
  prefixe,
  epaisseur = 14,
  texte = 'TN',
  motif = 'terre',
}: {
  pts: ReadonlyArray<readonly [number, number]>;
  prefixe: string;
  epaisseur?: number;
  texte?: string | null;
  motif?: 'terre' | 'remblai';
}) {
  if (pts.length < 2) return null;
  const bande = [...pts, ...[...pts].reverse().map(([x, y]) => [x, y + epaisseur] as const)];
  const [xf, yf] = pts[pts.length - 1]!;
  return (
    <g>
      <polygon points={points(bande)} fill={hachure(prefixe, motif)} />
      <polyline points={points(pts)} className="t-fort" />
      {texte ? (
        <Etiquette x={xf - 4} y={yf - 5} ancre="end" taille={11} classe="etiquette">
          {texte}
        </Etiquette>
      ) : null}
    </g>
  );
}
