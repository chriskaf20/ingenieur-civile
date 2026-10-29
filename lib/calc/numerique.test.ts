import { describe, expect, it } from 'vitest';
import {
  bilineaire,
  chaineRessorts,
  cholesky,
  cubatureProfils,
  debitCanal,
  deformeeDF,
  deriveeFinie,
  dichotomie,
  ecm,
  EXEMPLE_CANAL,
  EXEMPLE_DF,
  EXEMPLE_PROFILS,
  hauteurNormale,
  interpLineaire,
  interpTableau,
  iteratif,
  lagrange,
  newton,
  oscillateurNumerique,
  resoudreCholesky,
  simpsonMesures,
  sommeRepetee,
  thomas,
  trapezesMesures,
} from './numerique';

describe('erreurs', () => {
  it('0,1 additionné dix fois ne fait pas exactement 1', () => {
    const s = sommeRepetee(0.1, 10);
    expect(s.somme).not.toBe(1);
    expect(Math.abs(s.ecart)).toBeLessThan(1e-15);
  });
  it('différence centrée plus précise que la différence avant', () => {
    // f = eˣ en 0, f′ = 1 ; h = 0,1 : avant = (e^0,1 − 1)/0,1 = 1,0517 ; centrée = sinh(0,1)/0,1 = 1,0017
    const d = deriveeFinie(Math.exp, 1, 0, 0.1);
    expect(d.avant).toBeCloseTo(1.0517, 4);
    expect(d.centree).toBeCloseTo(1.0017, 4);
  });
});

describe('racines', () => {
  it('√2 par dichotomie et Newton', () => {
    const f = (x: number) => x * x - 2;
    const d = dichotomie(f, 1, 2, 1e-6);
    expect(d[d.length - 1]!.x).toBeCloseTo(Math.SQRT2, 5);
    // Newton depuis 1 : 1,5 ; 1,41667 ; 1,414216 (vérifié à la main)
    const n = newton(f, (x) => 2 * x, 1, 1e-10);
    expect(n[1]!.x).toBeCloseTo(1.5, 10);
    expect(n[2]!.x).toBeCloseTo(1.416667, 6);
    expect(n[n.length - 1]!.x).toBeCloseTo(Math.SQRT2, 10);
    expect(n.length).toBeLessThan(d.length);
  });
  it('hauteur normale du canal', () => {
    const r = hauteurNormale(EXEMPLE_CANAL);
    expect(debitCanal(EXEMPLE_CANAL, r.h)).toBeCloseTo(3, 3);
    expect(r.dich[r.dich.length - 1]!.x).toBeCloseTo(r.h, 3);
  });
});

describe('interpolation', () => {
  it('linéaire, tableau, Lagrange, bilinéaire', () => {
    expect(interpLineaire(20, 30, 30, 33, 25)).toBe(31.5);
    expect(interpTableau([0, 10, 20], [0, 5, 20], 15)!.y).toBe(12.5);
    expect(interpTableau([0, 10], [0, 5], 12)).toBeNull();
    // parabole y = x² par 3 points : exacte
    expect(lagrange([0, 1, 2], [0, 1, 4], 1.5)).toBeCloseTo(2.25, 12);
    expect(bilineaire(10, 12, 14, 16, 0.5, 0.5)).toBe(13);
  });
  it('Ecm EC2 : C25/30 → 31,5 GPa', () => {
    // 22 × (33/10)^0,3 = 22 × 1,43072 = 31,476 GPa
    expect(ecm(25)).toBeCloseTo(31.476, 3);
  });
});

describe('intégration', () => {
  it('trapèzes et Simpson sur mesures', () => {
    // y = x² sur [0 ; 2], h = 0,5 : Simpson exact 8/3
    const ys = [0, 0.25, 1, 2.25, 4];
    expect(simpsonMesures(ys, 0.5)).toBeCloseTo(8 / 3, 12);
    expect(trapezesMesures(ys, 0.5)).toBeCloseTo(2.75, 12);
    expect(simpsonMesures([0, 1, 2], 1)).toBe(2);
    expect(simpsonMesures([0, 1, 2, 3], 1)).toBeNull();
  });
  it('cubature des profils', () => {
    const c = cubatureProfils(EXEMPLE_PROFILS.aires, EXEMPLE_PROFILS.pas);
    // trapèzes : 20 × ((0 + 4,2)/2 + somme intérieure 106,4) = 20 × 108,5 = 2 170 m³
    expect(c.trapezes).toBeCloseTo(2170, 6);
    expect(c.longueur).toBe(160);
  });
});

describe('systèmes', () => {
  it('Cholesky', () => {
    const A = [
      [4, 2],
      [2, 3],
    ];
    // L = [[2, 0], [1, √2]]
    const L = cholesky(A)!;
    expect(L[1]![1]).toBeCloseTo(Math.SQRT2, 12);
    const x = resoudreCholesky(A, [2, 1])!;
    // 4x + 2y = 2 ; 2x + 3y = 1 → x = 0,5, y = 0
    expect(x[0]).toBeCloseTo(0.5, 12);
    expect(x[1]).toBeCloseTo(0, 12);
    expect(cholesky([[1, 2], [2, 1]])).toBeNull();
  });
  it('Jacobi et Gauss-Seidel convergent, Seidel plus vite', () => {
    const A = [
      [4, -1, 0],
      [-1, 4, -1],
      [0, -1, 4],
    ];
    const b = [3, 2, 3];
    const j = iteratif(A, b, 'jacobi');
    const s = iteratif(A, b, 'seidel');
    // solution exacte (1, 1, 1)
    expect(s[s.length - 1]!.x[1]).toBeCloseTo(1, 5);
    expect(s.length).toBeLessThan(j.length);
  });
  it('Thomas = solution d’un tridiagonal', () => {
    const x = thomas([0, -1, -1], [4, 4, 4], [-1, -1, 0], [3, 2, 3]);
    expect(x[0]).toBeCloseTo(1, 12);
    expect(x[2]).toBeCloseTo(1, 12);
  });
  it('chaîne de ressorts symétrique', () => {
    const r = chaineRessorts([100, 100, 100, 100], [0, 10, 0]);
    // nœud 1 : 200 u1 − 100 u2 = 0 → u1 = u2/2 = u3 ; nœud 2 : 200 u2 − 100 (u1 + u3) = 100 u2 = 10 → u2 = 0,1 m, u1 = 0,05 m
    expect(r.u![1]).toBeCloseTo(0.1, 10);
    expect(r.u![0]).toBeCloseTo(0.05, 10);
  });
});

describe('équations différentielles et différences finies', () => {
  it('RK4 bien plus précis qu’Euler', () => {
    const e = oscillateurNumerique(2 * Math.PI, 1, 0.01, 1, 'euler');
    const r = oscillateurNumerique(2 * Math.PI, 1, 0.01, 1, 'rk4');
    expect(r.erreur).toBeLessThan(1e-6);
    expect(e.erreur).toBeGreaterThan(0.1);
  });
  it('différences finies : flèche proche de 5qL⁴/384EI', () => {
    const r = deformeeDF(EXEMPLE_DF);
    // 5 × 10 × 6⁴ / (384 × 20 000) = 64 800 / 7 680 000 = 8,4375 mm
    expect(r.fExact).toBeCloseTo(0.0084375, 10);
    expect(r.erreur).toBeLessThan(0.05);
    const fin = deformeeDF({ ...EXEMPLE_DF, n: 24 });
    expect(fin.erreur).toBeLessThan(r.erreur);
  });
});
