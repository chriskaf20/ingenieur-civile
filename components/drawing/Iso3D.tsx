// Outils de perspective isométrique directe (trièdre direct : la règle de la main droite s'y lit sans miroir).
import { Fleche } from '@/components/drawing/Fleche';
import { projeterIsoDirect, type Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';

export type P2 = readonly [number, number];

/** Cadre de dessin en isométrie directe : mise à l'échelle des points 3D dans une largeur et une hauteur données. */
export function cadreIsoDirect(pts: Point3[], largeur: number, hauteurMax: number, marge = 34) {
  const proj = pts.map(projeterIsoDirect);
  const xs = proj.map((p) => p[0]);
  const ys = proj.map((p) => p[1]);
  const k = Math.min((largeur - 2 * marge) / (Math.max(...xs) - Math.min(...xs)), (hauteurMax - 2 * marge) / (Math.max(...ys) - Math.min(...ys)));
  const x0 = (largeur - (Math.max(...xs) - Math.min(...xs)) * k) / 2 - Math.min(...xs) * k;
  const y0 = marge - Math.min(...ys) * k;
  const P = (q: Point3): P2 => {
    const [u, v] = projeterIsoDirect(q);
    return [x0 + u * k, y0 + v * k];
  };
  return { P, k, hauteur: (Math.max(...ys) - Math.min(...ys)) * k + 2 * marge, poly: (q: Point3[]) => points(q.map(P)) };
}

/** Vecteur 3D dessiné entre deux points de l'espace. */
export function Fleche3({ P, de, vers, ...rest }: { P: (q: Point3) => P2; de: Point3; vers: Point3 } & Omit<React.ComponentProps<typeof Fleche>, 'x1' | 'y1' | 'x2' | 'y2'>) {
  const [x1, y1] = P(de);
  const [x2, y2] = P(vers);
  return <Fleche x1={x1} y1={y1} x2={x2} y2={y2} {...rest} />;
}
