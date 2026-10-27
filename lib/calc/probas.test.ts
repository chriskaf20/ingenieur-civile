import { describe, expect, it } from 'vitest';
import {
  bayes,
  binomiale,
  binomialeCumul,
  combinaisons,
  conformiteBeton,
  descriptive,
  EXEMPLE_ESSAIS,
  EXEMPLE_FIABILITE,
  fiabilite,
  fractileNormal,
  fractileStudent,
  gumbel,
  histogramme,
  intervalleConfiance,
  phi,
  poisson,
  regression,
  risqueDepassement,
} from './probas';

describe('statistique descriptive', () => {
  it('série 1 à 5 vérifiée à la main', () => {
    // moyenne = 15/5 = 3 ; écarts² : 4 + 1 + 0 + 1 + 4 = 10 ; variance = 10/4 = 2,5 ; s = 1,5811
    const d = descriptive([5, 1, 4, 2, 3]);
    expect(d.moyenne).toBe(3);
    expect(d.ecartType).toBeCloseTo(1.5811, 4);
    expect(d.mediane).toBe(3);
    expect(d.etendue).toBe(4);
  });
  it('essais de béton : moyenne 31,12 MPa', () => {
    // somme = 466,8 MPa ; 466,8 / 15 = 31,12
    expect(descriptive(EXEMPLE_ESSAIS).moyenne).toBeCloseTo(31.12, 10);
  });
  it('histogramme : chaque valeur dans une seule classe', () => {
    const h = histogramme(EXEMPLE_ESSAIS, 27, 2, 5);
    expect(h.reduce((s, c) => s + c.effectif, 0)).toBe(15);
    // classe [27 ; 29[ : 28,5 ; 27,9 ; 28,8 → 3
    expect(h[0]!.effectif).toBe(3);
  });
});

describe('probabilités', () => {
  it('Bayes : test à 90 %/95 %, taux 10 %', () => {
    // P(+) = 0,9 × 0,1 + 0,05 × 0,9 = 0,135 ; P(D|+) = 0,09 / 0,135 = 0,667
    const b = bayes({ p: 0.1, sensibilite: 0.9, specificite: 0.95 });
    expect(b.pPositif).toBeCloseTo(0.135, 10);
    expect(b.pSachantPositif).toBeCloseTo(2 / 3, 10);
  });
  it('binomiale et Poisson vérifiées à la main', () => {
    expect(combinaisons(10, 3)).toBe(120);
    // B(10 ; 0,1) : P(0) = 0,9¹⁰ = 0,3487
    expect(binomiale(10, 0.1, 0)).toBeCloseTo(0.3487, 4);
    expect(binomialeCumul(10, 0.1, 10)).toBeCloseTo(1, 10);
    // P(2) : P(0) = e⁻² = 0,1353
    expect(poisson(2, 0)).toBeCloseTo(0.1353, 4);
    expect(poisson(2, 2)).toBeCloseTo(0.2707, 4);
  });
});

describe('lois continues', () => {
  it('Φ et fractiles usuels', () => {
    expect(phi(0)).toBeCloseTo(0.5, 7);
    expect(phi(1.645)).toBeCloseTo(0.95, 3);
    expect(phi(-1.96)).toBeCloseTo(0.025, 3);
    expect(fractileNormal(0.95)).toBeCloseTo(1.6449, 4);
    expect(fractileNormal(0.05)).toBeCloseTo(-1.6449, 4);
    expect(fractileNormal(0.999)).toBeCloseTo(3.0902, 3);
  });
  it('Student : t(0,975 ; 14) = 2,145 (table)', () => {
    expect(fractileStudent(0.975, 14)).toBeCloseTo(2.145, 3);
    expect(fractileStudent(0.975, 1000)).toBeCloseTo(1.962, 2);
  });
  it('intervalle de confiance', () => {
    const ic = intervalleConfiance(EXEMPLE_ESSAIS, 0.95);
    expect(ic.bas).toBeLessThan(ic.moyenne);
    expect(ic.haut - ic.bas).toBeCloseTo(2 * ic.t * (ic.ecartType / Math.sqrt(15)), 10);
  });
});

describe('béton, régression, extrêmes, fiabilité', () => {
  it('conformité C25/30 en production continue', () => {
    const c = conformiteBeton(EXEMPLE_ESSAIS, 25);
    expect(c.continue_).toBe(true);
    expect(c.seuilMoyenne).toBeCloseTo(25 + 1.48 * c.ecartType, 10);
    expect(c.conforme).toBe(true);
  });
  it('régression exacte sur une droite', () => {
    // y = 2x + 1 exactement : a = 2, b = 1, r = 1
    const r = regression([0, 1, 2, 3], [1, 3, 5, 7]);
    expect(r.a).toBeCloseTo(2, 10);
    expect(r.b).toBeCloseTo(1, 10);
    expect(r.r).toBeCloseTo(1, 10);
  });
  it('période de retour', () => {
    // T = 100 ans sur 50 ans : 1 − 0,99⁵⁰ = 0,395
    expect(risqueDepassement(100, 50)).toBeCloseTo(0.395, 3);
    const g = gumbel([10, 20, 30]);
    expect(g.periode(g.valeur(50))).toBeCloseTo(50, 6);
  });
  it('fiabilité : β = 150 / 39,05 = 3,84', () => {
    // √(30² + 25²) = √1525 = 39,05 ; β = (300 − 150) / 39,05 = 3,841
    const f = fiabilite(EXEMPLE_FIABILITE);
    expect(f.beta).toBeCloseTo(3.841, 3);
    expect(f.Pf).toBeCloseTo(6.1e-5, 5);
    expect(f.gammaR).toBeGreaterThan(1);
  });
});
