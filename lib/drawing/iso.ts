// Perspective isométrique : projection parallèle selon la direction (1, 1, 1).
// L'observateur est du côté des x, y et z positifs : les faces visibles sont
// celles dont la normale a une somme de composantes positive (+x, +y, +z).

export type Point3 = readonly [number, number, number];
export type Point2 = readonly [number, number];

const COS30 = Math.sqrt(3) / 2;

/** Projette un point 3D (z vers le haut) en coordonnées SVG (y vers le bas), unité = 1 m. */
export function projeterIso([x, y, z]: Point3): Point2 {
  return [(x - y) * COS30, (x + y) * 0.5 - z];
}

/** Profondeur vers l'observateur : plus grand = plus proche (ordre du peintre). */
export function profondeurIso([x, y, z]: Point3): number {
  return x + y + z;
}

/** Une face est visible si sa normale sortante pointe vers l'observateur. */
export function faceVisible(normale: Point3): boolean {
  return normale[0] + normale[1] + normale[2] > 1e-9;
}

/** Centre de gravité (moyenne des sommets) d'un polygone 3D. */
export function centre(pts: ReadonlyArray<Point3>): Point3 {
  const n = pts.length;
  const s = pts.reduce<[number, number, number]>((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]);
  return [s[0] / n, s[1] / n, s[2] / n];
}

/** Boîte englobante 2D d'un ensemble de points projetés. */
export function boite2D(pts: ReadonlyArray<Point2>): { xmin: number; xmax: number; ymin: number; ymax: number } {
  let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
  for (const [x, y] of pts) {
    xmin = Math.min(xmin, x); xmax = Math.max(xmax, x);
    ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
  }
  return { xmin, xmax, ymin, ymax };
}
