// Escalier droit à deux volées et palier intermédiaire : tracé par la relation de Blondel.
// Règle de l'art (Blondel) : 2h + g compris entre 0,60 et 0,64 m (pas moyen d'un adulte).

export interface DonneesEscalier {
  H: number; // hauteur à franchir, de plancher fini à plancher fini (m)
  hVisee: number; // hauteur de marche visée (m)
  M: number; // module de Blondel retenu 2h + g (m), entre 0,60 et 0,64
  palier: number; // longueur du palier intermédiaire (m)
  emmarchement: number; // largeur utile de l'escalier (m)
  e: number; // épaisseur de la paillasse, mesurée perpendiculairement (m), donnée de l'énoncé
}

/** Exemple de la leçon L3.6.9 (données de l'énoncé). */
export const EXEMPLE_ESCALIER: DonneesEscalier = { H: 3.0, hVisee: 0.17, M: 0.63, palier: 1.2, emmarchement: 1.1, e: 0.15 };

export const BLONDEL_MIN = 0.6;
export const BLONDEL_MAX = 0.64;

export interface ResultatEscalier {
  n: number; // nombre total de contremarches
  h: number; // hauteur réelle d'une marche (m)
  g: number; // giron (m)
  n1: number; // contremarches de la volée 1 (bas)
  n2: number; // contremarches de la volée 2 (haut)
  hauteurPalier: number; // m au-dessus du plancher bas
  reculement: number; // longueur totale en plan (m)
  angle: number; // inclinaison des volées (degrés)
  rampant1: number; // longueur inclinée de la ligne des nez, volée 1 (m)
  rampant2: number;
  blondel: number; // 2h + g (m)
  valide: boolean;
  messages: string[];
}

export function escalierDroit(d: DonneesEscalier): ResultatEscalier {
  const messages: string[] = [];
  const n = Math.max(2, Math.round(d.H / d.hVisee));
  const h = d.H / n;
  const g = d.M - 2 * h;
  const n1 = Math.ceil(n / 2);
  const n2 = n - n1;
  const pas = Math.hypot(g, h);
  if (d.M < BLONDEL_MIN || d.M > BLONDEL_MAX) messages.push('Module hors de l’intervalle de Blondel (0,60 à 0,64 m).');
  if (g <= 0) messages.push('Giron nul ou négatif : marches trop hautes pour ce module.');
  if (d.palier < d.emmarchement) messages.push('Palier plus court que l’emmarchement : peu confortable (règle de l’art).');
  return {
    n, h, g, n1, n2,
    hauteurPalier: n1 * h,
    reculement: (n1 - 1) * g + d.palier + (n2 - 1) * g,
    angle: (Math.atan2(h, g) * 180) / Math.PI,
    rampant1: (n1 - 1) * pas,
    rampant2: (n2 - 1) * pas,
    blondel: 2 * h + g,
    valide: g > 0 && d.M >= BLONDEL_MIN && d.M <= BLONDEL_MAX,
    messages,
  };
}

/**
 * Profil de l'escalier dans le plan vertical (x horizontal, z vertical), en m.
 * Le haut de la volée 2 est en x = 0, z = H ; on descend vers les x croissants
 * jusqu'au pied de la volée 1 en x = reculement, z = 0.
 * Renvoie le dessus (nez et marches) puis le dessous de la paillasse.
 */
export function profilEscalier(d: DonneesEscalier, r: ResultatEscalier): { dessus: Array<[number, number]>; dessous: Array<[number, number]> } {
  const { h, g, n1, n2 } = r;
  const dessus: Array<[number, number]> = [[0, d.H]];
  let x = 0;
  let z = d.H;
  for (let i = 0; i < n2; i++) {
    z -= h;
    dessus.push([x, z]);
    if (i < n2 - 1) { x += g; dessus.push([x, z]); }
  }
  x += d.palier;
  dessus.push([x, z]);
  for (let i = 0; i < n1; i++) {
    z -= h;
    dessus.push([x, z]);
    if (i < n1 - 1) { x += g; dessus.push([x, z]); }
  }
  // Dessous : parallèle à la ligne des racines de marches, décalé de e perpendiculairement.
  const cosA = g / Math.hypot(g, h);
  const ev = d.e / cosA; // épaisseur mesurée verticalement
  const pente = h / g;
  const R = r.reculement;
  const xFinV2 = (n2 - 1) * g; // racine de la dernière contremarche de la volée 2 (sur le palier)
  const zPalierDessous = r.hauteurPalier - d.e;
  // volée 1 : racines sur z = (R − x)·pente ; dessous z = (R − x)·pente − ev
  const xI1 = R - (zPalierDessous + ev) / pente;
  // volée 2 : racines sur z = hauteurPalier + (xFinV2 − x)·pente ; dessous − ev
  const xI2 = xFinV2 - (ev - d.e) / pente;
  const dessous: Array<[number, number]> = [
    [R, -ev],
    [xI1, zPalierDessous],
    [xI2, zPalierDessous],
    [0, r.hauteurPalier + xFinV2 * pente - ev],
  ];
  return { dessus, dessous };
}
