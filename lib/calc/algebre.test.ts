import { describe, expect, it } from 'vitest';
import {
  additionner,
  ageResistance,
  allongementBarre,
  betaCC,
  denivele,
  EXEMPLE_BARRE,
  EXEMPLE_RESERVOIR,
  fcmT,
  hauteurEau,
  inertieRectangle,
  marchesEscalier,
  multiplier,
  parcelle,
  premierDegre,
  hauteurPourPoids,
  pente,
  quantitesBeton,
  volumePrisme,
  coteAval,
  EXEMPLE_SEMELLE,
  reactionsPoutre,
  regleDeTrois,
  reservoir,
  resoudre2x2,
  resoudre3x3,
  sectionTube,
  simplifier,
  surfaceCylindre,
  trinome,
  variation,
} from './algebre';

describe('fractions, puissances, racines (N0.2.1)', () => {
  it('simplifie et opère sur les fractions', () => {
    expect(simplifier([6, -8])).toEqual([-3, 4]);
    // 1/4 + 1/6 = 6/24 + 4/24 = 10/24 = 5/12
    expect(additionner([1, 4], [1, 6])).toEqual([5, 12]);
    // 2/3 × 9/4 = 18/12 = 3/2
    expect(multiplier([2, 3], [9, 4])).toEqual([3, 2]);
  });

  it('inertie d’une section 20 × 40 cm', () => {
    // Vérifié à la main : A = 20 × 40 = 800 cm² ; I = 20 × 40³ / 12 = 20 × 64 000 / 12 = 106 666,7 cm⁴ ;
    // i = √(106 666,7 / 800) = √133,33 = 11,547 cm (= 40/√12) ; I = 1,0667 × 10⁻³ m⁴.
    const r = inertieRectangle(20, 40);
    expect(r.A).toBe(800);
    expect(r.I).toBeCloseTo(106666.667, 2);
    expect(r.i).toBeCloseTo(40 / Math.sqrt(12), 10);
    expect(r.Im4).toBeCloseTo(1.0667e-3, 7);
    // doubler h multiplie I par 2³ = 8
    expect(inertieRectangle(20, 80).I / r.I).toBeCloseTo(8, 12);
  });
});

describe('notation scientifique : allongement d’une barre (N0.2.2)', () => {
  it('HA 12 de 3 m tirée à 20 kN', () => {
    // Vérifié à la main : A = π × 12² / 4 = 113,10 mm² ; σ = 20 000 / 113,10 = 176,84 MPa ;
    // ε = 176,84 / 200 000 = 8,842 × 10⁻⁴ ; ΔL = 8,842 × 10⁻⁴ × 3 = 2,653 × 10⁻³ m ≈ 2,65 mm.
    const r = allongementBarre(EXEMPLE_BARRE);
    expect(r.A).toBeCloseTo(113.097, 3);
    expect(r.sigma).toBeCloseTo(176.84, 2);
    expect(r.epsilon).toBeCloseTo(8.842e-4, 7);
    expect(r.dL).toBeCloseTo(2.6526e-3, 7);
  });
});

describe('proportionnalité et pentes (N0.2.3)', () => {
  it('règle de trois, variation, pente', () => {
    // 350 kg pour 1 m³ → 350 × 2,4 / 1 = 840 kg pour 2,4 m³
    expect(regleDeTrois(1, 350, 2.4)).toBeCloseTo(840, 10);
    expect(variation(100, 115)).toBeCloseTo(0.15, 12);
    // Caniveau : 0,15 m sur 25 m → 0,006 = 0,6 % = 6 ‰
    const p = pente(0.15, 25);
    expect(p.pourcent).toBeCloseTo(0.6, 12);
    expect(p.pourmille).toBeCloseTo(6, 12);
    expect(denivele(2, 30)).toBeCloseTo(0.6, 12);
  });
});

describe('identités remarquables : tube (N0.2.4)', () => {
  it('les deux écritures donnent la même aire', () => {
    // D = 100, t = 5 : d = 90 ; π/4 × (10 000 − 8 100) = π/4 × 1 900 = 1 492,3 mm² ; π × 5 × 95 = 1 492,3 mm².
    const r = sectionTube(100, 5);
    expect(r.d).toBe(90);
    expect(r.Adeveloppee).toBeCloseTo(1492.257, 3);
    expect(r.Afactorisee).toBeCloseTo(r.Adeveloppee, 9);
    // tube mince : π × 100 × 5 = 1 570,8 mm², soit 1 570,8 / 1 492,3 − 1 = t/(D − t) = 5/95 = 5,3 % de trop
    expect(r.Amince / r.Afactorisee - 1).toBeCloseTo(5 / 95, 12);
  });
});

describe('factorisation : cylindre (N0.2.4)', () => {
  it('r = 1 m, h = 2 m', () => {
    // 2π × 1 × 2 + 2π × 1² = 4π + 2π = 6π = 18,85 m² ; 2π × 1 × (2 + 1) = 6π ✓
    const c = surfaceCylindre(1, 2);
    expect(c.developpee).toBeCloseTo(6 * Math.PI, 12);
    expect(c.factorisee).toBeCloseTo(c.developpee, 12);
  });
});

describe('inéquations : escalier (N0.2.5)', () => {
  it('équation du premier degré et formule isolée', () => {
    // 3x − 5 = 10 → x = 15/3 = 5 ; h = 15 / (25 × 4 × 0,25) = 15/25 = 0,60 m
    expect(premierDegre(3, -5, 10)).toBe(5);
    expect(hauteurPourPoids(15, 25, 4, 0.25)).toBeCloseTo(0.6, 12);
  });

  it('2,80 m avec des marches d’au plus 18 cm', () => {
    // 2,80 / 0,18 = 15,56 → n ≥ 16 ; h = 2,80 / 16 = 0,175 m ;
    // 0,60 − 0,35 = 0,25 ≤ g ≤ 0,64 − 0,35 = 0,29 m.
    const r = marchesEscalier(2.8, 0.18);
    expect(r.nMin).toBe(16);
    expect(r.h).toBeCloseTo(0.175, 12);
    expect(r.gMin).toBeCloseTo(0.25, 12);
    expect(r.gMax).toBeCloseTo(0.29, 12);
    // hauteur exactement divisible : pas de contremarche en trop
    expect(marchesEscalier(2.7, 0.18).nMin).toBe(15);
  });
});

describe('systèmes linéaires (N0.2.6)', () => {
  it('réactions d’une poutre : L = 5 m, F = 10 kN à 2 m de A', () => {
    // 5·RB = 2 × 10 → RB = 4 kN ; RA = 10 − 4 = 6 kN.
    const r = reactionsPoutre(5, 10, 2);
    expect(r.RA).toBeCloseTo(6, 12);
    expect(r.RB).toBeCloseTo(4, 12);
    expect(resoudre2x2(1, 2, 3, 2, 4, 6)).toBeNull();
  });

  it('système 3 × 3 par Gauss', () => {
    // x + y + z = 6 ; 2x − y + z = 3 ; x + 2y − z = 2 → (1, 2, 3), vérifié en remplaçant.
    const x = resoudre3x3(
      [
        [1, 1, 1],
        [2, -1, 1],
        [1, 2, -1],
      ],
      [6, 3, 2],
    )!;
    expect(x[0]).toBeCloseTo(1, 12);
    expect(x[1]).toBeCloseTo(2, 12);
    expect(x[2]).toBeCloseTo(3, 12);
  });
});

describe('second degré (N0.2.7)', () => {
  it('discriminant et racines', () => {
    expect(trinome(1, -5, 6)).toEqual({ delta: 1, racines: [2, 3] });
    expect(trinome(1, 2, 1).racines).toEqual([-1]);
    expect(trinome(1, 0, 1).racines).toEqual([]);
  });

  it('parcelle de périmètre 50 m et d’aire 150 m²', () => {
    // x² − 25x + 150 = 0 ; Δ = 625 − 600 = 25 ; x = (25 ± 5)/2 → 10 m et 15 m.
    const r = parcelle(50, 150);
    expect(r.largeur).toBeCloseTo(10, 12);
    expect(r.longueur).toBeCloseTo(15, 12);
    expect(parcelle(20, 30).racines).toEqual([]); // un rectangle de périmètre 20 m a au plus 25 m²
  });
});

describe('fonction affine : réservoir (N0.2.8)', () => {
  it('S = 12 m², Q = 3 m³/h, de 0,50 m à 2,50 m', () => {
    // a = 3/12 = 0,25 m/h ; t = (2,50 − 0,50)/0,25 = 8 h ; V = 12 × 2 = 24 m³ ; h(4) = 0,5 + 1 = 1,5 m.
    const r = reservoir(EXEMPLE_RESERVOIR);
    expect(r.a).toBeCloseTo(0.25, 12);
    expect(r.tPlein).toBeCloseTo(8, 12);
    expect(r.volumeUtile).toBeCloseTo(24, 12);
    expect(hauteurEau(EXEMPLE_RESERVOIR, 4)).toBeCloseTo(1.5, 12);
  });
});

describe('exponentielle et logarithme : durcissement (N0.2.9)', () => {
  it('EC2 §3.1.2(6)', () => {
    expect(betaCC(28, 0.25)).toBeCloseTo(1, 12);
    // t = 7 j, s = 0,25 : √(28/7) = 2 ; β = e^(0,25 × (1 − 2)) = e^(−0,25) = 0,7788
    expect(betaCC(7, 0.25)).toBeCloseTo(Math.exp(-0.25), 12);
    // C25/30, ciment N : fcm = 25 + 8 = 33 MPa ; fcm(7) = 0,7788 × 33 = 25,70 MPa
    expect(fcmT(7, 25, 'N')).toBeCloseTo(25.7, 2);
    // inverse : β = e^(−0,25) → t = 28 / (1 + 1)² = 7 j
    expect(ageResistance(Math.exp(-0.25), 'N')).toBeCloseTo(7, 10);
  });
});

describe('quantités d’une gâchée (N0.2.P)', () => {
  it('semelle et caniveau du mini-projet', () => {
    // 12 × 0,5 × 0,3 = 1,8 m³ ; caniveau 0,8 % sur 32 m : ΔH = 0,256 m, 100,45 − 0,256 = 100,194 m
    expect(volumePrisme(EXEMPLE_SEMELLE.L, EXEMPLE_SEMELLE.B, EXEMPLE_SEMELLE.h)).toBeCloseTo(1.8, 12);
    expect(coteAval(100.45, 0.8, 32)).toBeCloseTo(100.194, 12);
  });

  it('2,4 m³ dosés à 350 kg/m³', () => {
    // ciment 350 × 2,4 = 840 kg → 840/50 = 16,8 → 17 sacs ; sable 400 × 2,4 = 960 L = 0,96 m³ ;
    // gravier 800 × 2,4 = 1 920 L = 1,92 m³ ; eau 175 × 2,4 = 420 L.
    const r = quantitesBeton({ V: 2.4, ciment: 350, sable: 400, gravier: 800, eau: 175, sac: 50 });
    expect(r.cimentKg).toBeCloseTo(840, 10);
    expect(r.sacs).toBe(17);
    expect(r.sableM3).toBeCloseTo(0.96, 12);
    expect(r.gravierM3).toBeCloseTo(1.92, 12);
    expect(r.eauL).toBeCloseTo(420, 10);
  });
});
