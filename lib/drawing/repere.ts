// Passage des coordonnées « monde » (mètres, z vers le haut) aux coordonnées
// SVG (y vers le bas), avec exagération verticale facultative (profils en long).

export interface Boite {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export interface Repere {
  /** abscisse SVG d'une abscisse monde */
  x: (xm: number) => number;
  /** ordonnée SVG d'une ordonnée monde (axe vers le haut) */
  y: (ym: number) => number;
  /** longueur SVG d'une longueur horizontale monde */
  lx: (l: number) => number;
  /** longueur SVG d'une longueur verticale monde */
  ly: (l: number) => number;
  /** échelle horizontale (unités SVG par mètre) */
  echelle: number;
  largeur: number;
  hauteur: number;
}

/**
 * Construit un repère qui fait tenir `monde` dans un cadre de `largeur` unités SVG,
 * avec une marge. La hauteur du cadre découle des proportions (× exagération).
 */
export function creerRepere(monde: Boite, largeur: number, marge = 20, exagerationY = 1): Repere {
  const dx = monde.xmax - monde.xmin;
  const dy = monde.ymax - monde.ymin;
  if (dx <= 0 || dy < 0) throw new Error('Boîte monde invalide');
  const echelle = (largeur - 2 * marge) / dx;
  const hauteur = dy * echelle * exagerationY + 2 * marge;
  return {
    x: (xm) => marge + (xm - monde.xmin) * echelle,
    y: (ym) => hauteur - marge - (ym - monde.ymin) * echelle * exagerationY,
    lx: (l) => l * echelle,
    ly: (l) => l * echelle * exagerationY,
    echelle,
    largeur,
    hauteur,
  };
}

/** Chaîne de points SVG « x,y x,y … » arrondis au centième. */
export function points(pts: ReadonlyArray<readonly [number, number]>): string {
  return pts.map(([x, y]) => `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`).join(' ');
}
