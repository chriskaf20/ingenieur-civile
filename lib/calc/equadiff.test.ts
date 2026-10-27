import { describe, expect, it } from 'vitest';
import {
  consolidation,
  decroissance,
  deformeePoutre,
  degreConsolidation,
  euler,
  EXEMPLE_CONSOLIDATION,
  EXEMPLE_DEFORMEE,
  EXEMPLE_OSCILLATEUR,
  EXEMPLE_REFROIDISSEMENT,
  EXEMPLE_VIDANGE,
  lineairePremier,
  oscillateur,
  racinesCaracteristiques,
  refroidissement,
  vidange,
} from './equadiff';

describe('premier ordre', () => {
  it('décroît exponentiellement et Euler s’en approche', () => {
    // y' = −y, y(0) = 1 : y(1) = e⁻¹ = 0,3679 ; Euler h = 0,1 : 0,9¹⁰ = 0,3487
    expect(decroissance(1, 1, 1)).toBeCloseTo(0.36788, 5);
    const e = euler((_t, y) => -y, 0, 1, 0.1, 10);
    expect(e[10]![1]).toBeCloseTo(0.9 ** 10, 12);
    // y' = −2y + 4, y(0) = 0 : y = 2 (1 − e^(−2t)) ; y(1) = 1,7293
    expect(lineairePremier(-2, 4, 0, 1)).toBeCloseTo(1.72933, 4);
  });

  it('refroidit le béton selon Newton', () => {
    // t = ln(30/10)/0,05 = 21,97 h
    const r = refroidissement(EXEMPLE_REFROIDISSEMENT);
    expect(r.tCible).toBeCloseTo(21.972, 3);
    expect(r.T(r.tCible)).toBeCloseTo(40, 9);
  });
});

describe('vidange', () => {
  it('applique Torricelli', () => {
    // A = 28,274 m² ; a = 7,854e-3 m² ; c = 0,62 × 7,854e-3 × 4,429 / (2 × 28,274) = 3,814e-4 /s·√m
    // T = (2 − 0,7071) / 3,814e-4 = 3 390 s ≈ 56,5 min
    const v = vidange(EXEMPLE_VIDANGE);
    expect(v.c).toBeCloseTo(3.814e-4, 6);
    expect(v.T).toBeCloseTo(3390, -1);
    expect(v.h(v.T)).toBeCloseTo(0.5, 6);
    expect(v.T).toBeGreaterThan(v.Tconstant);
  });
});

describe('second ordre', () => {
  it('classe les racines', () => {
    expect(racinesCaracteristiques(-3, 2)).toMatchObject({ type: 'reelles', r1: 2, r2: 1 });
    expect(racinesCaracteristiques(2, 1)).toMatchObject({ type: 'double', r: -1 });
    expect(racinesCaracteristiques(2, 5)).toMatchObject({ type: 'complexes', alpha: -1, beta: 2 });
  });

  it('calcule l’oscillateur amorti', () => {
    // ω0 = √(8e6 / 2e4) = 20 rad/s ; f0 = 3,183 Hz ; T0 = 0,3142 s ; ζ = 0,05
    const o = oscillateur(EXEMPLE_OSCILLATEUR);
    expect(o.w0).toBeCloseTo(20, 9);
    expect(o.T0).toBeCloseTo(0.31416, 5);
    expect(o.zeta).toBeCloseTo(0.05, 9);
    expect(o.x(0)).toBeCloseTo(0.02, 9);
    // δ = 2π × 0,05 / √(1 − 0,0025) = 0,3146
    expect(o.delta).toBeCloseTo(0.3146, 4);
  });
});

describe('poutre et consolidation', () => {
  it('donne la flèche d’une poutre', () => {
    // I = 7,5 × 22,5³ / 12 = 7 119,1 cm⁴ ; EI = 11e6 × 7,119e-5 = 783,1 kN·m² ; f = 5 × 2 × 256 / (384 × 783,1) = 8,51 mm
    const d = deformeePoutre(EXEMPLE_DEFORMEE);
    expect(d.EI).toBeCloseTo(783.11, 1);
    expect(d.fmm).toBeCloseTo(8.51, 2);
    expect(d.y(2)).toBeCloseTo(d.f, 12);
  });

  it('calcule le degré de consolidation', () => {
    // Hd = 2 m ; Tv = 2 × 1 / 4 = 0,5 ; U = 1 − 8/π² e^(−π²/4 × 0,5) = 0,764 ; t90 = 0,848 × 4 / 2 = 1,696 an
    const c = consolidation(EXEMPLE_CONSOLIDATION);
    expect(c.Tv).toBeCloseTo(0.5, 12);
    expect(c.U).toBeCloseTo(0.7639, 3);
    expect(c.t90).toBeCloseTo(1.696, 9);
    expect(degreConsolidation(0.197)).toBeCloseTo(0.5, 2);
  });
});
