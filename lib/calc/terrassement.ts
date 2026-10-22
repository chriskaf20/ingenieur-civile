// Volume de remblai d'une plateforme rectangulaire posée sur un terrain naturel (TN)
// connu par ses cotes aux quatre coins, avec talus de pente m/1 (m horizontal pour 1 vertical).

export interface DonneesPlateforme {
  L: number; // longueur selon x (m)
  l: number; // largeur selon y (m)
  Zp: number; // cote projet de la plateforme (m)
  /** cotes du TN aux coins 1 (0,0), 2 (L,0), 3 (L,l), 4 (0,l), en m */
  tn: readonly [number, number, number, number];
  m: number; // pente des talus : m mètres horizontaux pour 1 mètre vertical
}

/** Exemple de la leçon L3.8.7 (données de l'énoncé). */
export const EXEMPLE_PLATEFORME: DonneesPlateforme = {
  L: 30, l: 20, Zp: 101.2, tn: [100.2, 100.5, 100.8, 100.4], m: 1.5,
};

export interface ResultatPlateforme {
  valide: boolean;
  message?: string;
  h: [number, number, number, number]; // hauteurs de remblai aux coins (m)
  hMoyenne: number;
  surface: number; // m²
  volumePlateforme: number; // m³ (prisme sous la plateforme)
  volumesCotes: [number, number, number, number]; // talus des côtés 1-2, 2-3, 3-4, 4-1
  volumesCoins: [number, number, number, number];
  volumeTalus: number;
  volumeTotal: number;
  /** contour du pied de talus en plan, dans le repère de la plateforme (m) */
  piedDeTalus: Array<[number, number]>;
}

/**
 * Hypothèses (simplification pédagogique) :
 * - le TN varie linéairement entre les coins (surface bilinéaire) : le volume sous la plateforme
 *   vaut alors exactement S × moyenne des quatre hauteurs ;
 * - sous les talus, on néglige la pente du TN ;
 * - côté de longueur Lc à hauteurs ha, hb : V = m·Lc·(ha² + ha·hb + hb²)/6 (section triangulaire m·h²/2) ;
 * - coin de hauteur h : pyramide de base (m·h)² et de hauteur h, V = m²·h³/3.
 */
export function remblaiPlateforme(d: DonneesPlateforme): ResultatPlateforme {
  const h = d.tn.map((z) => d.Zp - z) as [number, number, number, number];
  const surface = d.L * d.l;
  const hMoyenne = (h[0] + h[1] + h[2] + h[3]) / 4;
  const [h1, h2, h3, h4] = h;
  const cote = (Lc: number, ha: number, hb: number) => (d.m * Lc * (ha * ha + ha * hb + hb * hb)) / 6;
  const coin = (hc: number) => (d.m * d.m * hc ** 3) / 3;
  const volumesCotes: [number, number, number, number] = [cote(d.L, h1, h2), cote(d.l, h2, h3), cote(d.L, h3, h4), cote(d.l, h4, h1)];
  const volumesCoins: [number, number, number, number] = [coin(h1), coin(h2), coin(h3), coin(h4)];
  const volumeTalus = volumesCotes.reduce((a, b) => a + b, 0) + volumesCoins.reduce((a, b) => a + b, 0);
  const volumePlateforme = surface * hMoyenne;
  const o = h.map((x) => d.m * x);
  const [o1, o2, o3, o4] = o as [number, number, number, number];
  const piedDeTalus: Array<[number, number]> = [
    [0, -o1], [d.L, -o2], [d.L + o2, -o2], [d.L + o2, 0],
    [d.L + o3, d.l], [d.L + o3, d.l + o3], [d.L, d.l + o3], [0, d.l + o4],
    [-o4, d.l + o4], [-o4, d.l], [-o1, 0], [-o1, -o1],
  ];
  const valide = h.every((x) => x >= 0);
  return {
    valide,
    message: valide ? undefined : 'Un coin est en déblai (cote projet sous le TN) : la méthode du remblai seul ne s’applique pas.',
    h, hMoyenne, surface, volumePlateforme, volumesCotes, volumesCoins, volumeTalus,
    volumeTotal: volumePlateforme + volumeTalus,
    piedDeTalus,
  };
}
