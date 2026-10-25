import { describe, expect, it } from 'vitest';
import {
  accelerationMoyenne,
  allongementThermique,
  archimede,
  arrimage,
  bilanGroupe,
  chateauEau,
  chuteLibre,
  consommationGroupe,
  courantMono,
  courantTri,
  cuveEnterree,
  cycleCamion,
  decoupageJoints,
  dilatation,
  distanceArret,
  effortThermique,
  energieCinetique,
  energiePotentielle,
  EXEMPLE_ARRET,
  EXEMPLE_CHATEAU,
  EXEMPLE_CUVE,
  EXEMPLE_DILATATION,
  EXEMPLE_GROUPE,
  EXEMPLE_LEVAGE,
  EXEMPLE_PLAN,
  EXEMPLE_POMPE,
  forceNewton,
  kmhVersMs,
  KWH,
  lestCuve,
  levage,
  mrua,
  msVersKmh,
  planIncline,
  pompe,
  pousseeParoi,
  pressionEau,
  pressionFluide,
  puissance,
  treuil,
} from './physique';

describe('cinématique', () => {
  it('conversions et mouvement uniformément accéléré', () => {
    expect(kmhVersMs(36)).toBeCloseTo(10, 12); // 36 000 m / 3 600 s
    expect(msVersKmh(10)).toBeCloseTo(36, 12);
    expect(accelerationMoyenne(0, 10, 20)).toBe(0.5); // de 0 à 10 m/s en 20 s
    expect(accelerationMoyenne(13.5, 0, 4.5)).toBe(-3); // freinage : accélération négative
    // départ arrêté, a = 0,5 m/s² pendant 20 s : v = 10 m/s, x = 0,5 × 0,5 × 400 = 100 m
    expect(mrua(0, 0, 0.5, 20)).toEqual({ x: 100, v: 10 });
  });

  it('chute libre d’un outil depuis un échafaudage de 10 m', () => {
    // t = √(2 × 10 / 9,81) = √2,038 7 = 1,427 8 s ; v = 9,81 × 1,427 8 = 14,007 m/s = 50,43 km/h
    const c = chuteLibre(10);
    expect(c.t).toBeCloseTo(1.427843, 6);
    expect(c.v).toBeCloseTo(14.007141, 6);
    expect(c.vKmh).toBeCloseTo(50.425708, 5);
  });

  it('distance d’arrêt d’un camion à 50 km/h', () => {
    // v0 = 50 / 3,6 = 13,889 m/s ; réaction 1 s : 13,889 m ; freinage v0² / (2 × 4) = 192,90 / 8 = 24,113 m
    // arrêt : 38,002 m ; durée de freinage 13,889 / 4 = 3,472 s
    const r = distanceArret(EXEMPLE_ARRET);
    expect(r.v0).toBeCloseTo(13.888889, 6);
    expect(r.dReaction).toBeCloseTo(13.888889, 6);
    expect(r.dFreinage).toBeCloseTo(24.112654, 6);
    expect(r.dArret).toBeCloseTo(38.001543, 6);
    expect(r.tFreinage).toBeCloseTo(3.472222, 6);
    expect(r.tArret).toBeCloseTo(4.472222, 6);
  });

  it('cycle d’un camion de terrassement', () => {
    // 6 km à 30 km/h : 12 min ; retour à 40 km/h : 9 min ; + 15 min fixes = 36 min ; 480 / 36 = 13,3 → 13 rotations
    const c = cycleCamion({ distance: 6, vCharge: 30, vVide: 40, tFixe: 15, journee: 8 });
    expect(c.tAller).toBeCloseTo(12, 12);
    expect(c.tRetour).toBeCloseTo(9, 12);
    expect(c.tCycle).toBeCloseTo(36, 12);
    expect(c.rotations).toBe(13);
    // cas limite : 15 + 15 + 10 = 40 min, 480 / 40 = 12 rotations exactement (pas 11 à cause des arrondis binaires)
    expect(cycleCamion({ distance: 10, vCharge: 40, vVide: 40, tFixe: 10, journee: 8 }).rotations).toBe(12);
  });
});

describe('lois de Newton', () => {
  it('deuxième loi et levage', () => {
    expect(forceNewton(1000, 2)).toBe(2000);
    // 2 000 kg : P = 19,62 kN ; T = 2 000 × (9,81 + 0,5) = 20 620 N = 20,62 kN ; T / P = 10,31 / 9,81 = 1,051
    const r = levage(EXEMPLE_LEVAGE);
    expect(r.P).toBeCloseTo(19.62, 10);
    expect(r.T).toBeCloseTo(20.62, 10);
    expect(r.rapport).toBeCloseTo(1.050968, 6);
    expect(levage({ m: 2000, a: 0 }).T).toBeCloseTo(19.62, 10); // à vitesse constante, T = P
    expect(levage({ m: 2000, a: -12 }).mou).toBe(true); // descente accélérée plus vite que g : câble détendu
  });
});

describe('frottement et plan incliné', () => {
  it('palette de 800 kg sur une rampe à 15°, μ = 0,4', () => {
    // P = 7,848 kN ; N = 7,848 cos 15° = 7,580 6 kN ; P sin 15° = 2,031 2 kN ; μ N = 3,032 2 kN : pas de glissement
    // pour monter : 2,031 2 + 3,032 2 = 5,063 4 kN ; angle limite arctan 0,4 = 21,80°
    const r = planIncline(EXEMPLE_PLAN);
    expect(r.P).toBeCloseTo(7.848, 10);
    expect(r.N).toBeCloseTo(7.580586, 6);
    expect(r.Ppara).toBeCloseTo(2.031212, 6);
    expect(r.Fmax).toBeCloseTo(3.032234, 6);
    expect(r.glisse).toBe(false);
    expect(r.Fretenir).toBe(0);
    expect(r.Fmonter).toBeCloseTo(5.063446, 6);
    expect(r.angleLimite).toBeCloseTo(21.801409, 6);
    expect(planIncline({ m: 800, alpha: 30, mu: 0.4 }).glisse).toBe(true); // tan 30° = 0,577 > 0,4
  });

  it('arrimage d’une palette de ciment sur un camion qui freine', () => {
    // 1 500 kg, 5 m/s² : il faut 7,5 kN ; le frottement donne 0,3 × 1 500 × 9,81 = 4 414,5 N ; manque 3,085 5 kN
    const r = arrimage({ m: 1500, a: 5, mu: 0.3 });
    expect(r.Fnec).toBeCloseTo(7.5, 12);
    expect(r.Ffrot).toBeCloseTo(4.4145, 10);
    expect(r.manque).toBeCloseTo(3.0855, 10);
    expect(r.glisse).toBe(true);
  });
});

describe('travail, énergie, puissance', () => {
  it('énergies', () => {
    expect(KWH).toBe(3600000);
    expect(energiePotentielle(1000, 10)).toBeCloseTo(98100, 9); // 1 t élevée de 10 m
    expect(energieCinetique(2000, 10)).toBe(100000); // ½ × 2 000 × 10²
    // mouton de battage de 2 000 kg tombant de 1,5 m, 20 coups par minute : 20 × 29 430 J / 60 s = 9 810 W
    expect(puissance(20 * energiePotentielle(2000, 1.5), 60)).toBeCloseTo(9810, 9);
  });

  it('pompe de forage : 3 m³/h sous 25 m, rendement 0,55', () => {
    // Q = 3 / 3 600 = 8,333 × 10⁻⁴ m³/s ; Ph = 1 000 × 9,81 × 8,333 × 10⁻⁴ × 25 = 204,38 W ; Pabs = 204,38 / 0,55 = 371,59 W
    // 15 m³ en 5 h : 1,858 kWh consommés ; énergie utile ρ g V H = 3 678 750 J = 1,021 9 kWh
    const r = pompe(EXEMPLE_POMPE);
    expect(r.Ph).toBeCloseTo(204.375, 9);
    expect(r.Pabs).toBeCloseTo(371.590909, 5);
    expect(r.duree).toBe(5);
    expect(r.energieUtile).toBeCloseTo(1.021875, 9);
    expect(r.energie).toBeCloseTo(1.857955, 6);
  });

  it('treuil', () => {
    // 500 kg à 0,2 m/s : F = 4,905 kN ; Pu = 4 905 × 0,2 = 981 W ; Pabs = 981 / 0,8 = 1 226,25 W
    const r = treuil(500, 0.2, 0.8);
    expect(r.F).toBeCloseTo(4.905, 10);
    expect(r.Pu).toBeCloseTo(981, 9);
    expect(r.Pabs).toBeCloseTo(1226.25, 9);
  });
});

describe('hydrostatique', () => {
  it('pression, poussée sur une paroi, Archimède', () => {
    expect(pressionEau(10)).toBeCloseTo(98.1, 10); // 10 m d'eau ≈ 1 bar
    // paroi de 3 m : 9,81 × 3² / 2 = 44,145 kN/m, à 1 m du fond
    expect(pousseeParoi(3).F).toBeCloseTo(44.145, 10);
    expect(pousseeParoi(3).z).toBe(1);
    expect(archimede(2)).toBeCloseTo(19.62, 10);
    expect(pressionFluide(26, 3)).toBe(78); // béton frais (26 kN/m³) sur 3 m de coffrage
  });

  it('cuve enterrée vide dans la nappe', () => {
    // extérieur 3 × 2 × 2 = 12 m³ ; intérieur 2,7 × 1,7 × 1,7 = 7,803 m³ ; béton 4,197 m³ ; G = 25 × 4,197 = 104,925 kN
    // nappe à 1,5 m : Π = 9,81 × 3 × 2 × 1,5 = 88,29 kN < G : la cuve reste en place (G / Π = 1,188)
    // soulèvement dès hw = 104,925 / (9,81 × 6) = 1,783 m
    const r = cuveEnterree(EXEMPLE_CUVE);
    expect(r.Vint).toBeCloseTo(7.803, 10);
    expect(r.Vbeton).toBeCloseTo(4.197, 10);
    expect(r.G).toBeCloseTo(104.925, 9);
    expect(r.Pi).toBeCloseTo(88.29, 9);
    expect(r.pFond).toBeCloseTo(14.715, 10);
    expect(r.rapport).toBeCloseTo(1.188413, 6);
    expect(r.flotte).toBe(false);
    expect(r.hLimite).toBeCloseTo(1.78262, 5);
    // nappe au niveau du terrain : Π = 117,72 kN > G : la cuve vide flotte
    const pleine = cuveEnterree({ ...EXEMPLE_CUVE, hw: 2.5 });
    expect(pleine.hImm).toBe(2);
    expect(pleine.Pi).toBeCloseTo(117.72, 9);
    expect(pleine.flotte).toBe(true);
    // lest : manque 117,72 − 104,925 = 12,795 kN ; 12,795 / 25 = 0,511 8 m³ sur 2,7 × 1,7 = 4,59 m² : 0,111 5 m
    const lest = lestCuve({ ...EXEMPLE_CUVE, hw: 2 });
    expect(lest.manque).toBeCloseTo(12.795, 9);
    expect(lest.volume).toBeCloseTo(0.5118, 9);
    expect(lest.epaisseur).toBeCloseTo(0.111503, 6);
    expect(lestCuve(EXEMPLE_CUVE).manque).toBe(0);
  });
});

describe('dilatation thermique', () => {
  it('dalle de béton de 30 m, ΔT = 25 K', () => {
    // ΔL = 10 × 10⁻⁶ × 30 000 mm × 25 = 7,5 mm ; bloquée : σ = 31 000 × 10 × 10⁻⁶ × 25 = 7,75 MPa, soit 2,98 fctm
    expect(allongementThermique(30, 10e-6, 25)).toBeCloseTo(0.0075, 12);
    const r = dilatation(EXEMPLE_DILATATION);
    expect(r.dL).toBeCloseTo(7.5, 10);
    expect(r.sigma).toBeCloseTo(7.75, 10);
    expect(r.rapport).toBeCloseTo(2.980769, 6);
  });

  it('poutre en acier de 40 m, ΔT = 30 K', () => {
    // ΔL = 12 × 10⁻⁶ × 40 000 × 30 = 14,4 mm ; bloquée : σ = 210 000 × 12 × 10⁻⁶ × 30 = 75,6 MPa < fy = 235 MPa
    const r = dilatation({ L: 40, dT: 30, materiau: 'acier' });
    expect(r.dL).toBeCloseTo(14.4, 10);
    expect(r.sigma).toBeCloseTo(75.6, 9);
    expect(r.rapport).toBeLessThan(1);
    // section de 5 400 mm² : N = 75,6 × 5 400 = 408 240 N = 408,24 kN sur les appuis
    expect(effortThermique({ L: 40, dT: 30, materiau: 'acier' }, 5400)).toBeCloseTo(408.24, 9);
  });

  it('découpage en blocs par des joints', () => {
    expect(decoupageJoints(60, 30)).toEqual({ blocs: 2, joints: 1, Lbloc: 30 }); // 60 / 30 = 2 blocs tout juste
    expect(decoupageJoints(75, 30)).toEqual({ blocs: 3, joints: 2, Lbloc: 25 }); // 75 / 30 = 2,5 → 3 blocs de 25 m
    expect(decoupageJoints(20, 30).joints).toBe(0);
  });
});

describe('électricité de chantier', () => {
  it('courants', () => {
    expect(courantMono(2300, 1)).toBeCloseTo(10, 12); // 2 300 W / 230 V
    // 6 928 W en triphasé 400 V, cos φ = 1 : I = 6 928 / (1,732 × 400) = 10,0 A
    expect(courantTri(400 * Math.sqrt(3) * 10, 1)).toBeCloseTo(10, 12);
  });

  it('bilan de puissance et choix du groupe', () => {
    // P = 2,2 + 1,5 + 0,75 + 1 = 5,45 kW ; S = 5,45 / 0,8 = 6,81 kVA
    // démarrage de la bétonnière (k = 3) : (5,45 + 2 × 2,2) / 0,8 = 12,31 kVA → groupe de 15 kVA
    // I = 5 450 / (√3 × 400 × 0,8) = 9,83 A ; en monophasé 230 V : 5 450 / (230 × 0,8) = 29,62 A
    const r = bilanGroupe(EXEMPLE_GROUPE);
    expect(r.P).toBeCloseTo(5.45, 12);
    expect(r.S).toBeCloseTo(6.8125, 12);
    expect(r.Sdem).toBeCloseTo(12.3125, 12);
    expect(r.groupe).toBe(15);
    expect(r.I).toBeCloseTo(9.832997, 6);
    expect(bilanGroupe({ ...EXEMPLE_GROUPE, reseau: 'mono' }).I).toBeCloseTo(29.619565, 6);
    expect(bilanGroupe({ ...EXEMPLE_GROUPE, betonniere: 80 }).groupe).toBeNull(); // hors de la gamme
    // pompe de 3 kW : P = 7,7 kW, démarrage (7,7 + 2 × 3) / 0,8 = 17,125 kVA → 20 kVA
    expect(bilanGroupe({ ...EXEMPLE_GROUPE, pompe: 3 }).groupe).toBe(20);
    // 7,7 kW pendant 6 h : 46,2 kWh ; à 0,3 L/kWh : 13,86 L
    const c = consommationGroupe(7.7, 6, 0.3);
    expect(c.E).toBeCloseTo(46.2, 10);
    expect(c.litres).toBeCloseTo(13.86, 10);
  });
});

describe('château d’eau', () => {
  it('poids, pressions et pompage', () => {
    // cuve Ø 4 m, 3 m d'eau : S = 12,566 m², V = 37,699 m³, Geau = 369,83 kN ; N = 369,83 + 650 = 1 019,83 kN
    // radier 5 × 5 m : σ = 1 019,83 / 25 = 40,79 kPa ; fond de cuve : 9,81 × 3 = 29,43 kPa ; robinet au sol : 9,81 × 15 = 147,15 kPa
    // élévation 20 + 12 + 3 = 35 m : Eu = 37 699 × 9,81 × 35 / 3,6 × 10⁶ = 3,596 kWh ; Ea = 7,191 kWh
    // en 6 h : Q = 6,283 m³/h, Ph = 599,26 W, Pabs = 1 198,5 W
    const r = chateauEau(EXEMPLE_CHATEAU);
    expect(r.V).toBeCloseTo(37.699112, 6);
    expect(r.Geau).toBeCloseTo(369.828287, 6);
    expect(r.N).toBeCloseTo(1019.828287, 6);
    expect(r.sigma).toBeCloseTo(40.793131, 6);
    expect(r.pFond).toBeCloseTo(29.43, 10);
    expect(r.pSol).toBeCloseTo(147.15, 9);
    expect(r.dz).toBe(35);
    expect(r.Eu).toBeCloseTo(3.595553, 6);
    expect(r.Ea).toBeCloseTo(7.191106, 6);
    expect(r.Q).toBeCloseTo(6.283185, 6);
    expect(r.Ph).toBeCloseTo(599.258799, 5);
    expect(r.Pabs).toBeCloseTo(1198.517597, 5);
  });
});
