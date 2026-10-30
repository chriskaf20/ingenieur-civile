import { describe, expect, it } from 'vitest';
import {
  barre,
  boulons,
  cisaillementRect,
  diagrammes,
  dimensionnerRect,
  effortsSection,
  EXEMPLE_BARRE,
  EXEMPLE_BOULON,
  EXEMPLE_POUTRE,
  EXEMPLE_SOLIVE,
  EXEMPLE_T,
  EXEMPLE_TORSION,
  flexionSection,
  sectionComposee,
  sigmaFlexion,
  solive,
  torsion,
} from './rdm1';

describe('traction', () => {
  it('tirant Ø 20', () => {
    // A = π × 400/4 = 314,16 mm² ; σ = 120 000/314,16 = 382,0 MPa ; ΔL = 382/210 000 × 4 000 = 7,28 mm
    const r = barre(EXEMPLE_BARRE);
    expect(r.A).toBeCloseTo(314.16, 2);
    expect(r.sigma).toBeCloseTo(381.97, 2);
    expect(r.dL).toBeCloseTo(7.276, 3);
  });
});

describe('efforts internes', () => {
  it('poutre de l’exemple vérifiée à la main', () => {
    // RA = 30 + 20 × 4/6 = 43,33 kN ; RB = 30 + 20 × 2/6 = 36,67 kN
    const d = diagrammes(EXEMPLE_POUTRE, 600);
    expect(d.RA).toBeCloseTo(43.333, 3);
    expect(d.RB).toBeCloseTo(36.667, 3);
    // en x = 2 : M = 43,33 × 2 − 10 × 2²/2 = 66,67 kN·m
    expect(effortsSection(EXEMPLE_POUTRE, 2).M).toBeCloseTo(66.667, 3);
    // V juste avant 2 : 43,33 − 20 = 23,33 ; juste après : 3,33 ; V nul en x = 2,333 → Mmax = 67,22 kN·m
    expect(effortsSection(EXEMPLE_POUTRE, 2.0001).V).toBeCloseTo(3.332, 2);
    expect(d.Mmax).toBeCloseTo(67.222, 2);
  });
  it('uniforme seule : qL²/8', () => {
    const d = diagrammes({ L: 4, xA: 0, xB: 4, charges: [{ type: 'repartie', nom: 'q', q1: 5, q2: 5, a: 0, b: 4 }] });
    expect(d.Mmax).toBeCloseTo(10, 6);
  });
});

describe('sections et flexion', () => {
  it('section en T', () => {
    // nervure 760 cm², y = 19 ; table 720 cm², y = 44 ; yG = (14 440 + 31 680)/1 480 = 31,16 cm
    const s = sectionComposee(EXEMPLE_T);
    expect(s.A).toBe(1480);
    expect(s.yG).toBeCloseTo(31.162, 3);
    // I = 20×38³/12 + 760×12,162² + 60×12³/12 + 720×12,838² = 91 453 + 112 412 + 8 640 + 118 664 = 331 170 cm⁴
    expect(s.I).toBeCloseTo(331170, -1);
  });
  it('σ = M y / I', () => {
    // M = 10 kN·m, y = 10 cm, I = 10 000 cm⁴ → 10⁷ × 100 / 10⁸ = 10 MPa
    expect(sigmaFlexion(10, 10, 10000)).toBeCloseTo(10, 10);
    const f = flexionSection(50, [{ b: 20, h: 50, y: 0 }]);
    // W = 20 × 50²/6 = 8 333 cm³ ; σ = 50 × 10⁶ / 8,333 × 10⁶ = 6,0 MPa
    expect(f.sigmaInf).toBeCloseTo(6, 6);
    expect(f.sigmaSup).toBeCloseTo(-6, 6);
  });
  it('cisaillement rectangle 1,5 V/A', () => {
    // V = 30 kN, 20 × 50 cm : τmoy = 30 000/100 000 = 0,3 MPa ; τmax = 0,45 MPa
    const c = cisaillementRect(30, 20, 50);
    expect(c.tauMoyen).toBeCloseTo(0.3, 10);
    expect(c.tauMax).toBeCloseTo(0.45, 10);
    expect(c.tau(25)).toBeCloseTo(0, 10);
  });
});

describe('torsion, boulons, dimensionnement, solive', () => {
  it('arbre plein Ø 50', () => {
    // J = π × 50⁴/32 = 613 592 mm⁴ ; τ = 2·10⁶ × 25 / 613 592 = 81,5 MPa
    const t = torsion(EXEMPLE_TORSION);
    expect(t.J).toBeCloseTo(613592, 0);
    expect(t.tauMax).toBeCloseTo(81.49, 2);
  });
  it('boulons en cisaillement double', () => {
    // A = 201,06 mm² ; τ = 60 000 / (2 × 2 × 201,06) = 74,6 MPa ; pression = 60 000/(2 × 16 × 8) = 234,4 MPa
    const b = boulons(EXEMPLE_BOULON);
    expect(b.tau).toBeCloseTo(74.6, 1);
    expect(b.pression).toBeCloseTo(234.375, 3);
  });
  it('dimensionnement', () => {
    // M = 12 kN·m, σ = 10 MPa : W = 1 200 cm³ ; b = 10 → h = √720 = 26,83 cm
    const r = dimensionnerRect(12, 10, 10);
    expect(r.W).toBeCloseTo(1200, 8);
    expect(r.h).toBeCloseTo(26.833, 3);
  });
  it('solive', () => {
    // pp = 5 × 0,075 × 0,225 = 0,0844 ; p = 2,1 × 0,5 + 0,0844 = 1,1344 kN/m ; M = 1,1344 × 16/8 = 2,269 kN·m
    const s = solive(EXEMPLE_SOLIVE);
    expect(s.p).toBeCloseTo(1.1344, 4);
    expect(s.M).toBeCloseTo(2.2688, 4);
    // W = 7,5 × 22,5²/6 = 632,8 cm³ ; σ = 2,2688·10⁶/632 812 = 3,585 MPa
    expect(s.sigma).toBeCloseTo(3.585, 3);
  });
});
