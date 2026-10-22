// Mur de clôture en maçonnerie de blocs, raidi par des poteaux en béton armé :
// découpage en travées et quantités principales (sans aciers, traités en L3.7.P).

export interface DonneesMurCloture {
  L: number; // longueur totale, poteaux d'extrémité compris (m)
  H: number; // hauteur hors sol, chaînage haut compris (m)
  sMax: number; // espacement maximal des poteaux raidisseurs (m), donnée de conception
  a: number; // côté des poteaux carrés (m)
  // Fondation (cotes par rapport au TN = ±0,00)
  D: number; // profondeur du fond de fouille (m)
  B: number; // largeur de la semelle filante et de la fouille (m)
  ePropre: number; // épaisseur du béton de propreté (m)
  hSemelle: number; // épaisseur de la semelle (m)
  rangsSoubassement: number; // nombre de rangs de blocs pleins sous le chaînage bas
  // Chaînages
  bChainageBas: number; hChainageBas: number; // m
  bChainageHaut: number; hChainageHaut: number; // m
  // Blocs : module (joint compris)
  moduleLongueur: number; moduleHauteur: number; // m
  epaisseurBlocElevation: number; epaisseurBlocSoubassement: number; // m
  pertes: number; // proportion de casse (0,05 = 5 %), donnée de l'énoncé
}

/**
 * Ferraillage de principe de l'exemple : prescriptions de l'énoncé, à justifier par le calcul
 * (vent, poussée éventuelle des terres) ; ce ne sont pas des résultats.
 */
export const FERRAILLAGE_PRINCIPE_MUR = {
  poteau: '4 HA 10',
  cadresPoteau: 'cadres HA 6, e = 15 cm',
  chainageBas: '4 HA 10, cadres HA 6, e = 20 cm',
  chainageHaut: '4 HA 8, cadres HA 6, e = 20 cm',
  semelle: '3 HA 10 filants, HA 8 transversaux e = 25 cm',
  beton: 'C25/30',
} as const;

/** Exemple de la leçon L3.6.6 (données de l'énoncé). */
export const EXEMPLE_MUR: DonneesMurCloture = {
  L: 24, H: 2, sMax: 3, a: 0.2,
  D: 0.6, B: 0.5, ePropre: 0.05, hSemelle: 0.2, rangsSoubassement: 2,
  bChainageBas: 0.2, hChainageBas: 0.2, bChainageHaut: 0.15, hChainageHaut: 0.15,
  moduleLongueur: 0.4, moduleHauteur: 0.2, epaisseurBlocElevation: 0.15, epaisseurBlocSoubassement: 0.2,
  pertes: 0.05,
};

export interface ResultatMurCloture {
  entraxeExtremes: number; // L − a (m)
  rapportTravees: number; // (L − a) / sMax, avant arrondi
  travees: number;
  espacement: number; // entraxe réel des poteaux (m)
  panneau: number; // longueur libre de maçonnerie entre deux poteaux (m)
  poteaux: number;
  longueurNette: number; // longueur de maçonnerie et de chaînage entre poteaux (m)
  // niveaux (m, par rapport au TN)
  zFondFouille: number; zDessusSemelle: number; zDessusSoubassement: number; zDessusChainageBas: number; zDessousChainageHaut: number; zSommet: number;
  hauteurElevation: number; // maçonnerie en élévation (m)
  rangsElevation: number; // peut être non entier : à signaler
  hauteurPoteau: number; // du dessus de semelle au sommet (m)
  // quantités
  volumeFouille: number; volumePropre: number; volumeSemelle: number;
  volumeChainageBas: number; volumeChainageHaut: number; volumePoteaux: number; volumeBetonArme: number; // m³
  surfaceSoubassement: number; surfaceElevation: number; // m²
  blocsParM2: number;
  blocsSoubassement: number; blocsElevation: number; // à commander, pertes comprises, arrondis au bloc supérieur
  messages: string[];
}

export function murCloture(d: DonneesMurCloture): ResultatMurCloture {
  const messages: string[] = [];
  // Entraxe des poteaux d'extrémité = L − a ; on le découpe en travées d'entraxe ≤ sMax.
  const travees = Math.max(1, Math.ceil((d.L - d.a) / d.sMax - 1e-9));
  const espacement = (d.L - d.a) / travees;
  const poteaux = travees + 1;
  const longueurNette = d.L - poteaux * d.a;
  const zFondFouille = -d.D;
  const zDessusSemelle = zFondFouille + d.ePropre + d.hSemelle;
  const zDessusSoubassement = zDessusSemelle + d.rangsSoubassement * d.moduleHauteur;
  const zDessusChainageBas = zDessusSoubassement + d.hChainageBas;
  const zSommet = d.H;
  const zDessousChainageHaut = zSommet - d.hChainageHaut;
  const hauteurElevation = zDessousChainageHaut - zDessusChainageBas;
  const rangsElevation = hauteurElevation / d.moduleHauteur;
  if (Math.abs(rangsElevation - Math.round(rangsElevation)) > 1e-6) messages.push('La hauteur d’élévation ne correspond pas à un nombre entier de rangs.');
  if (hauteurElevation <= 0) messages.push('Hauteur d’élévation nulle ou négative.');
  const blocsParM2 = 1 / (d.moduleLongueur * d.moduleHauteur);
  const surfaceSoubassement = longueurNette * d.rangsSoubassement * d.moduleHauteur;
  const surfaceElevation = longueurNette * Math.max(hauteurElevation, 0);
  const commande = (s: number) => Math.ceil(s * blocsParM2 * (1 + d.pertes) - 1e-9);
  const volumeSemelle = d.L * d.B * d.hSemelle;
  const volumeChainageBas = longueurNette * d.bChainageBas * d.hChainageBas;
  const volumeChainageHaut = longueurNette * d.bChainageHaut * d.hChainageHaut;
  const hauteurPoteau = zSommet - zDessusSemelle;
  const volumePoteaux = poteaux * d.a * d.a * hauteurPoteau;
  return {
    entraxeExtremes: d.L - d.a, rapportTravees: (d.L - d.a) / d.sMax,
    travees, espacement, panneau: espacement - d.a, poteaux, longueurNette,
    zFondFouille, zDessusSemelle, zDessusSoubassement, zDessusChainageBas, zDessousChainageHaut, zSommet,
    hauteurElevation, rangsElevation, hauteurPoteau,
    volumeFouille: d.L * d.B * d.D,
    volumePropre: d.L * d.B * d.ePropre,
    volumeSemelle, volumeChainageBas, volumeChainageHaut, volumePoteaux,
    volumeBetonArme: volumeSemelle + volumeChainageBas + volumeChainageHaut + volumePoteaux,
    surfaceSoubassement, surfaceElevation, blocsParM2,
    blocsSoubassement: commande(surfaceSoubassement),
    blocsElevation: commande(surfaceElevation),
    messages,
  };
}
