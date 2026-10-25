import { describe, expect, it } from 'vitest';
import {
  baseMinGlissement,
  caniveauU,
  centrePoids,
  chargeMaxSansSoulevement,
  chargePoutre,
  consoleEncastree,
  consoleTriangulee,
  couple,
  degreHyperstaticite,
  degreTreillis,
  EXEMPLE_CANIVEAU,
  EXEMPLE_CHARGE_POUTRE,
  EXEMPLE_CONSOLE,
  EXEMPLE_FERME_EFFORTS,
  EXEMPLE_MARQUISE,
  EXEMPLE_MOMENT_FORCE,
  EXEMPLE_MUR_POIDS,
  EXEMPLE_POUTRE_CONSOLE,
  EXEMPLE_PRATT,
  EXEMPLE_SEMELLE_TORSEUR,
  EXEMPLE_TROIS_APPUIS,
  fermeEfforts,
  forceLevier,
  geometriePratt,
  marquise,
  momentForceO,
  murPoids,
  poidsSurfacique,
  poutreConsole,
  reduction,
  resoudreLineaire,
  resultanteCharge,
  ritterPratt,
  semelleTorseur,
  STRUCTURES_TYPES,
  treillis,
  troisAppuis,
} from './statique';

describe('charge linéique sur une poutre', () => {
  it('poids surfacique', () => {
    // dalle de 16 cm en béton armé : 25 × 0,16 = 4 kN/m²
    expect(poidsSurfacique(25, 0.16)).toBeCloseTo(4, 12);
  });
  it('bande de plancher et poids propre', () => {
    // 5,5 × 4 = 22 kN/m ; 25 × 0,25 × 0,35 = 2,1875 kN/m ; G = 24,1875 ; Q = 2,5 × 4 = 10
    // ELU : 1,35 × 24,1875 + 1,5 × 10 = 47,653125 kN/m ; sur 5 m : 238,265625 kN
    const r = chargePoutre(EXEMPLE_CHARGE_POUTRE);
    expect(r.gDalle).toBeCloseTo(22, 12);
    expect(r.pp).toBeCloseTo(2.1875, 12);
    expect(r.G).toBeCloseTo(24.1875, 12);
    expect(r.Q).toBeCloseTo(10, 12);
    expect(r.pELU).toBeCloseTo(47.653125, 9);
    expect(r.RELU).toBeCloseTo(238.265625, 9);
  });
});

describe('moment d’une force', () => {
  it('par les composantes et par le bras de levier', () => {
    // Fx = 20 cos(−75°) = 5,176381 ; Fy = 20 sin(−75°) = −19,318517
    // M = 1,2 × (−19,318517) − 0,4 × 5,176381 = −25,252772 kN·m (sens horaire) ; bras = 25,252772 / 20 = 1,262639 m
    const r = momentForceO(EXEMPLE_MOMENT_FORCE);
    expect(r.Fx).toBeCloseTo(5.176381, 6);
    expect(r.Fy).toBeCloseTo(-19.318517, 6);
    expect(r.M).toBeCloseTo(-25.252772, 6);
    expect(r.bras).toBeCloseTo(1.262639, 6);
    expect(couple(10, 0.5)).toBeCloseTo(5, 12);
    // barre à mine : 3 kN à 0,15 m du pivot, effort à 1,35 m : F = 3 × 0,15 / 1,35 = 0,3333 kN
    expect(forceLevier(3, 0.15, 1.35)).toBeCloseTo(0.333333, 6);
  });
});

describe('réduction d’un système de forces', () => {
  it('semelle sous un poteau', () => {
    // N = 600 kN vers le bas, H = 40 kN à 1,2 m : M = −48 kN·m en O ; la résultante coupe la base en x = 48 / 600 = 0,08 m
    const r = reduction(
      [
        { nom: 'N', x: 0, y: 0, Fx: 0, Fy: -600 },
        { nom: 'H', x: 0, y: 1.2, Fx: 40, Fy: 0 },
      ],
      0,
      0,
    );
    expect(r.M).toBeCloseTo(-48, 12);
    expect(r.xCoupe).toBeCloseTo(0.08, 12);
    // e = 48 / 600 = 0,08 m ≤ B/6 = 0,30 m ; R = √(600² + 40²) = 601,331855 kN
    const s = semelleTorseur(EXEMPLE_SEMELLE_TORSEUR);
    expect(s.e).toBeCloseTo(0.08, 12);
    expect(s.dansTiersCentral).toBe(true);
    expect(s.R).toBeCloseTo(601.331855, 6);
    expect(s.xR).toBeCloseTo(0.98, 12);
    // mât léger : N = 60 kN, H = 12 kN à 4 m : e = 48 / 60 = 0,8 m, d'où B ≥ 6 × 0,8 = 4,8 m
    expect(semelleTorseur({ N: 60, H: 12, h: 4, B: 2 }).Bmin).toBeCloseTo(4.8, 12);
  });
});

describe('principe fondamental de la statique : marquise', () => {
  it('tirant et articulation', () => {
    // T = (2 × 3²/2 + 1,5 × 3) / (3 sin 35°) = 13,5 / 1,720730 = 7,845511 kN
    // HA = T cos 35° = 6,426666 kN ; VA = 2 × 3 + 1,5 − 4,5 = 3 kN
    const r = marquise(EXEMPLE_MARQUISE);
    expect(r.T).toBeCloseTo(7.845511, 6);
    expect(r.Ty).toBeCloseTo(4.5, 9);
    expect(r.HA).toBeCloseTo(6.426666, 6);
    expect(r.VA).toBeCloseTo(3, 9);
  });
  it('console triangulée', () => {
    // P = 10 kN, L = 1,5 m, h = 1 m : N(AB) = 10 × 1,5 / 1 = 15 kN ; bracon √(1,5² + 1) = 1,802776 m, N(CB) = −18,02776 kN
    const c = consoleTriangulee(10, 1.5, 1);
    expect(c.NAB).toBeCloseTo(15, 12);
    expect(c.NCB).toBeCloseTo(-18.027756, 6);
  });
});

describe('encastrement', () => {
  it('console de balcon', () => {
    // V = 6 × 1,5 + 2 = 11 kN ; M = 6 × 1,5² / 2 + 2 × 1,5 = 6,75 + 3 = 9,75 kN·m
    const r = consoleEncastree(EXEMPLE_CONSOLE);
    expect(r.V).toBeCloseTo(11, 12);
    expect(r.M).toBeCloseTo(9.75, 12);
  });
});

describe('réactions d’appui', () => {
  it('poutre avec porte-à-faux', () => {
    // 12 × 7 = 84 kN en x = 3,5 m ; 20 kN en x = 7 m ; moments en A : 84 × 3,5 + 20 × 7 = 434 kN·m
    // RB = 434 / 5,5 = 78,909091 kN ; RA = 104 − 78,909091 = 25,090909 kN
    const r = poutreConsole(EXEMPLE_POUTRE_CONSOLE);
    expect(r.Rtot).toBeCloseTo(104, 12);
    expect(r.MA).toBeCloseTo(434, 12);
    expect(r.RB).toBeCloseTo(78.909091, 6);
    expect(r.RA).toBeCloseTo(25.090909, 6);
    // soulèvement de A : P ≤ 84 × (5,5 − 3,5) / (7 − 5,5) = 112 kN
    const Pmax = chargeMaxSansSoulevement(EXEMPLE_POUTRE_CONSOLE);
    expect(Pmax).toBeCloseTo(112, 9);
    expect(poutreConsole({ ...EXEMPLE_POUTRE_CONSOLE, P: Pmax }).RA).toBeCloseTo(0, 9);
  });
  it('charge triangulaire', () => {
    // de 0 à 12 kN/m sur 6 m : R = 36 kN à x = 6 × 24 / 36 = 4 m
    const r = resultanteCharge({ type: 'repartie', nom: 'triangle', q1: 0, q2: 12, a: 0, b: 6 });
    expect(r.R).toBeCloseTo(36, 12);
    expect(r.x).toBeCloseTo(4, 12);
  });
});

describe('degré d’hyperstaticité', () => {
  it('structures types et treillis', () => {
    const h = (id: string) => {
      const s = STRUCTURES_TYPES.find((t) => t.id === id)!;
      return degreHyperstaticite(s.r, s.p, s.internes).h;
    };
    expect(h('deuxRouleaux')).toBe(-1); // 2 − 3 : mécanisme
    expect(h('deuxAppuis')).toBe(0);
    expect(h('continue')).toBe(1); // 4 − 3
    expect(h('gerber')).toBe(0); // 4 + 2 − 6
    expect(h('portiqueEncastre')).toBe(3);
    expect(h('troisRotules')).toBe(0);
    expect(degreTreillis(13, 3, 8).h).toBe(0); // Pratt à 4 panneaux
  });
});

describe('treillis : méthode des nœuds', () => {
  it('système linéaire', () => {
    // 2x + y = 5, x − y = 1 : x = 2, y = 1
    expect(resoudreLineaire([[2, 1], [1, -1]], [5, 1])).toEqual([2, 1]);
    expect(resoudreLineaire([[1, 2], [2, 4]], [1, 2])).toBeNull();
  });
  it('poutre Pratt à 4 panneaux', () => {
    // RA = RB = 3 × 20 / 2 = 30 kN. Nœud B0 : 30 + N sin 45° = 0, diagonale d'about −42,43 kN ; membrure 30 kN.
    // Nœud B1 : montant = 20 kN (traction). Nœud T2 : montant central nul.
    // Coupe du panneau 2 : Nsup = −(30 × 6 − 20 × 3) / 3 = −40 kN ; Ninf = 30 × 3 / 3 = 30 kN ; diagonale = 10 / sin 45° = 14,14 kN
    const t = treillis(geometriePratt(EXEMPLE_PRATT));
    expect(t.valide).toBe(true);
    expect(t.efforts.diag1).toBeCloseTo(-30 * Math.SQRT2, 9);
    expect(t.efforts.inf1).toBeCloseTo(30, 9);
    expect(t.efforts.mont1).toBeCloseTo(20, 9);
    expect(t.efforts.mont2).toBeCloseTo(0, 9);
    expect(t.efforts.sup2).toBeCloseTo(-40, 9);
    expect(t.efforts.inf2).toBeCloseTo(30, 9);
    expect(t.efforts.diag2).toBeCloseTo(10 * Math.SQRT2, 9);
    expect(t.reactions.find((r) => r.noeud === 'B0')!.Ry).toBeCloseTo(30, 9);
    expect(t.reactions.find((r) => r.noeud === 'B4')!.Ry).toBeCloseTo(30, 9);
  });
  it('Ritter retrouve la méthode des nœuds', () => {
    const t = treillis(geometriePratt(EXEMPLE_PRATT));
    const r2 = ritterPratt(EXEMPLE_PRATT, 2);
    expect(r2.Mdroite).toBeCloseTo(120, 9);
    expect(r2.Nsup).toBeCloseTo(t.efforts.sup2!, 9);
    expect(r2.Ninf).toBeCloseTo(t.efforts.inf2!, 9);
    expect(r2.Ndiag).toBeCloseTo(t.efforts.diag2!, 9);
    const r1 = ritterPratt(EXEMPLE_PRATT, 1);
    expect(r1.Nsup).toBeNull();
    expect(r1.Ndiag).toBeCloseTo(t.efforts.diag1!, 9);
    expect(r1.Ninf).toBeCloseTo(t.efforts.inf1!, 9);
    // Pratt à 6 panneaux : contrôle croisé sur tout un demi-treillis
    const d6 = { n: 6, a: 2.5, h: 2, P: 15 };
    const t6 = treillis(geometriePratt(d6));
    for (const k of [2, 3]) {
      const r = ritterPratt(d6, k);
      expect(r.Nsup).toBeCloseTo(t6.efforts[`sup${k}`]!, 9);
      expect(r.Ninf).toBeCloseTo(t6.efforts[`inf${k}`]!, 9);
      expect(r.Ndiag).toBeCloseTo(t6.efforts[`diag${k}`]!, 9);
    }
  });
  it('mécanisme détecté', () => {
    const d = geometriePratt(EXEMPLE_PRATT);
    const t = treillis({ ...d, barres: d.barres.filter((b) => b.id !== 'diag2') });
    expect(t.valide).toBe(false);
    expect(t.degre).toBe(-1);
  });
});

describe('mur poids : renversement et glissement', () => {
  it('exemple', () => {
    // W1 = 24 × 0,5 × 3 = 36 kN/m à 1,35 m ; W2 = 24 × 1,1 × 3 / 2 = 39,6 kN/m à 0,7333 m ; W = 75,6 kN/m
    // Ms = 36 × 1,35 + 39,6 × 0,7333 = 77,64 kN·m/m ; Mr = 30 × 1 = 30 ; FSr = 2,588
    // glissement : 0,55 × 75,6 / 30 = 1,386 ; e = 0,8 − (77,64 − 30) / 75,6 = 0,1698 m < 1,6 / 6
    const r = murPoids(EXEMPLE_MUR_POIDS);
    expect(r.W).toBeCloseTo(75.6, 9);
    expect(r.Ms).toBeCloseTo(77.64, 9);
    expect(r.FSr).toBeCloseTo(2.588, 9);
    expect(r.FSg).toBeCloseTo(1.386, 9);
    expect(r.e).toBeCloseTo(0.169841, 6);
    expect(r.tiers).toBeCloseTo(0.266667, 6);
    // glissement à 1,5 : W ≥ 1,5 × 30 / 0,55 = 81,818 kN/m, soit (0,5 + B) / 2 × 24 × 3 ≥ 81,818, B ≥ 1,7727 m
    const B = baseMinGlissement(EXEMPLE_MUR_POIDS, 1.5);
    expect(B).toBeCloseTo(1.772727, 6);
    expect(murPoids({ ...EXEMPLE_MUR_POIDS, B }).FSg).toBeCloseTo(1.5, 9);
  });
});

describe('centre de gravité d’un caniveau en U', () => {
  it('trois rectangles ou rectangle moins trou', () => {
    // radier 80 × 15 = 1 200 cm² à 7,5 cm ; parois 2 × 12 × 55 = 1 320 cm² à 42,5 cm
    // A = 2 520 cm² ; S = 9 000 + 56 100 = 65 100 cm³ ; yG = 25,8333 cm
    const r = caniveauU(EXEMPLE_CANIVEAU);
    expect(r.A).toBeCloseTo(2520, 9);
    expect(r.Sx).toBeCloseTo(65100, 9);
    expect(r.yG).toBeCloseTo(25.833333, 6);
    expect(r.trou.A).toBeCloseTo(2520, 9);
    expect(r.trou.yG).toBeCloseTo(r.yG, 9);
  });
  it('centre des poids de deux matériaux', () => {
    // semelle 24 × 1,2 × 0,4 = 11,52 kN/m à x = 0,6 m ; mur 18 × 0,2 × 2 = 7,2 kN/m à x = 0,3 m
    // xG = (11,52 × 0,6 + 7,2 × 0,3) / 18,72 = 9,072 / 18,72 = 0,484615 m
    const c = centrePoids([
      { nom: 'semelle', gamma: 24, x0: 0, y0: 0, b: 1.2, h: 0.4 },
      { nom: 'mur', gamma: 18, x0: 0.2, y0: 0.4, b: 0.2, h: 2 },
    ]);
    expect(c.W).toBeCloseTo(18.72, 9);
    expect(c.xG).toBeCloseTo(0.484615, 6);
  });
});

describe('équilibre dans l’espace : trois appuis', () => {
  it('cuve sur trois pieds', () => {
    // Σ F = 252 kN ; Σ F x = 240 × 2 + 12 × 3 = 516 ; Σ F y = 240 × 1,5 + 12 × 0,5 = 366
    // 3,5 RC = 366 → RC = 104,5714 ; 4 RB + 2 RC = 516 → RB = 76,7143 ; RA = 70,7143 kN
    const r = troisAppuis(EXEMPLE_TROIS_APPUIS)!;
    expect(r.Ftot).toBeCloseTo(252, 12);
    expect(r.R[2]).toBeCloseTo(104.571429, 6);
    expect(r.R[1]).toBeCloseTo(76.714286, 6);
    expect(r.R[0]).toBeCloseTo(70.714286, 6);
  });
});

describe('ferme de toiture en W', () => {
  it('efforts dans les barres', () => {
    // p = (1,35 × 0,4 + 1,5 × 0,5) × 3 = 3,87 kN/m ; P = 3,87 × 8 / 4 = 7,74 kN par nœud ; 3,87 kN aux appuis
    // RA = RB = 15,48 kN. Nœud A : 15,48 − 3,87 + N(A-M1) × 0,5 = 0 → −23,22 kN ; N(A-D1) = 23,22 × cos 30° = 20,10911 kN
    // Nœud M1 : N(D1-M1) = −7,74 / 1,1547 = −6,70304 kN ; N(M1-S) = −23,22 + 0,57735 × 6,70304 = −19,35 kN
    // Nœud D1 : N(D1-S) = 6,70304 kN ; N(D1-D2) = 20,10911 − 6,70304 = 13,40607 kN
    const r = fermeEfforts(EXEMPLE_FERME_EFFORTS);
    expect(r.Pnoeud).toBeCloseTo(7.74, 9);
    expect(r.resultat.valide).toBe(true);
    const N = r.resultat.efforts;
    expect(N['A-M1']).toBeCloseTo(-23.22, 6);
    expect(N['A-D1']).toBeCloseTo(20.10911, 5);
    expect(N['D1-M1']).toBeCloseTo(-6.703037, 5);
    expect(N['M1-S']).toBeCloseTo(-19.35, 5);
    expect(N['D1-S']).toBeCloseTo(6.703037, 5);
    expect(N['D1-D2']).toBeCloseTo(13.406073, 5);
    expect(N['M2-B']).toBeCloseTo(N['A-M1']!, 9); // symétrie
    expect(r.resultat.reactions.find((x) => x.noeud === 'A')!.Ry).toBeCloseTo(15.48, 9);
  });
});
