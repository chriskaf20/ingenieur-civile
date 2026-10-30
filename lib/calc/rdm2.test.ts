import { describe, expect, it } from 'vitest';
import {
  balcon,
  castiglianoConsole,
  deuxTravees,
  EIrect,
  etatPlan,
  EXEMPLE_BALCON,
  EXEMPLE_FLAMBEMENT,
  flambement,
  flecheFormulaire,
  flexionComposee,
  flexionDeviee,
  hookeGeneralisee,
  ligneElastique,
  pressionSemelle,
} from './rdm2';

describe('déformées', () => {
  it('ligne élastique = formulaire 5qL⁴/384EI', () => {
    // q = 10, L = 6, EI = 20 000 : 5 × 10 × 1 296 / 7 680 000 = 8,4375 mm
    const r = ligneElastique({ L: 6, xA: 0, xB: 6, charges: [{ type: 'repartie', nom: 'q', q1: 10, q2: 10, a: 0, b: 6 }] }, 20000, 600);
    expect(r.f).toBeCloseTo(0.0084375, 6);
    expect(r.xf).toBeCloseTo(3, 2);
    // rotation sur appui qL³/24EI = 2 160/480 000 = 0,0045 rad
    expect(Math.abs(r.rotA)).toBeCloseTo(0.0045, 5);
  });
  it('force centrée PL³/48EI', () => {
    const r = ligneElastique({ L: 4, xA: 0, xB: 4, charges: [{ type: 'ponctuelle', nom: 'P', F: 30, a: 2 }] }, 10000, 800);
    expect(r.f).toBeCloseTo(flecheFormulaire('centree', 30, 4, 10000), 6);
  });
  it('EI rectangle', () => {
    // 11 000 MPa, 7,5 × 22,5 cm : I = 7 119,1 cm⁴ → EI = 11·10⁶ × 7,1191·10⁻⁵ = 783,1 kN·m²
    expect(EIrect(11000, 7.5, 22.5)).toBeCloseTo(783.1, 1);
  });
});

describe('Castigliano', () => {
  it('console : δ = PL³/3EI = dU/dP', () => {
    const c = castiglianoConsole(10, 2, 5000);
    // 10 × 8 / 15 000 = 5,333 mm
    expect(c.delta).toBeCloseTo(0.0053333, 7);
    expect(c.deltaNum).toBeCloseTo(c.delta, 6);
  });
});

describe('flexion composée et déviée', () => {
  it('poteau 30 × 30 sous 500 kN et 20 kN·m', () => {
    // σN = −500 000/90 000 = −5,556 ; W = 30 × 30²/6 × 1 000 = 4,5·10⁶ mm³ ; σM = 20·10⁶/4,5·10⁶ = 4,444
    const r = flexionComposee({ N: 500, M: 20, b: 30, h: 30 });
    expect(r.sN).toBeCloseTo(-5.556, 3);
    expect(r.s1).toBeCloseTo(-10, 3);
    expect(r.s2).toBeCloseTo(-1.111, 3);
    // e = 4 cm < h/6 = 5 cm : dans le noyau
    expect(r.dansNoyau).toBe(true);
  });
  it('semelle : trapèze puis triangle', () => {
    // N = 600, M = 60, B = 2 : e = 0,1 < 0,333 ; qm = 150 ; qmax = 150 × 1,3 = 195
    const t = pressionSemelle(600, 60, 2, 2);
    expect(t.qmax).toBeCloseTo(195, 8);
    expect(t.qmin).toBeCloseTo(105, 8);
    // e = 0,5 > 0,333 : c = 3 × 0,5 = 1,5 ; qmax = 1 200/(1,5 × 2) = 400
    const g = pressionSemelle(600, 300, 2, 2);
    expect(g.decollement).toBe(true);
    expect(g.qmax).toBeCloseTo(400, 8);
  });
  it('flexion déviée', () => {
    const r = flexionDeviee(10, 5, 20, 40);
    // Wy = 20 × 1 600/6 × 1 000 = 5,333·10⁶ ; σy = 1,875 ; Wz = 40 × 400/6 × 1 000 = 2,667·10⁶ ; σz = 1,875
    expect(r.sy).toBeCloseTo(1.875, 6);
    expect(r.max).toBeCloseTo(3.75, 6);
  });
});

describe('Mohr, Hooke, flambement, continuité, balcon', () => {
  it('état plan', () => {
    // σx = 80, σy = 20, τ = 40 : c = 50, R = √(30² + 40²) = 50 ; σ1 = 100, σ2 = 0
    const e = etatPlan(80, 20, 40);
    expect(e.s1).toBeCloseTo(100, 10);
    expect(e.s2).toBeCloseTo(0, 10);
    expect(e.facette(e.theta).t).toBeCloseTo(0, 8);
  });
  it('Hooke généralisée', () => {
    // σx = 100, ν = 0,3, E = 200 000 : εx = 5·10⁻⁴, εy = −1,5·10⁻⁴
    const h = hookeGeneralisee(100, 0, 0, 200000, 0.3);
    expect(h.ex).toBeCloseTo(5e-4, 12);
    expect(h.ey).toBeCloseTo(-1.5e-4, 12);
  });
  it('Euler', () => {
    // I = 10⁴/12 = 833,3 cm⁴ ; Ncr = π² × 11·10⁶ × 8,333·10⁻⁶ / 9 = 100,5 kN ; i = 2,887 cm ; λ = 300/2,887 = 103,9
    const f = flambement(EXEMPLE_FLAMBEMENT);
    expect(f.Ncr).toBeCloseTo(100.52, 2);
    expect(f.lambda).toBeCloseTo(103.92, 2);
  });
  it('deux travées égales : −qL²/8', () => {
    // q = 10, L = 5 : MB = −31,25 ; RA = 25 − 6,25 = 18,75 ; RB = 62,5
    const r = deuxTravees(5, 5, 10, 10);
    expect(r.MB).toBeCloseTo(-31.25, 10);
    expect(r.RA).toBeCloseTo(18.75, 10);
    expect(r.RB).toBeCloseTo(62.5, 10);
    expect(r.M(5)).toBeCloseTo(-31.25, 10);
  });
  it('balcon', () => {
    // pp = 25 × 1 × 0,15 = 3,75 ; p = 8,75 ; M = 8,75 × 2,25/2 + 1,5 = 11,34 kN·m
    const b = balcon(EXEMPLE_BALCON);
    expect(b.M).toBeCloseTo(11.34375, 6);
  });
});
