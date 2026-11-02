import { describe, expect, it } from 'vitest';
import {
  analyseGranulo,
  barreHA,
  classeAffaissement,
  elementsParM2,
  enduit,
  essaiTraction,
  evaporation,
  EXEMPLE_ECHANTILLON,
  EXEMPLE_FORMULATION,
  EXEMPLE_SABLE,
  EXEMPLE_TRACTION,
  formulation,
  humiditeBois,
  lotBarres,
  proprietesPhysiques,
  retraitBois,
} from './materiaux';

describe('propriétés physiques', () => {
  it('brique de l’exemple', () => {
    // ρapp = 2 150/1 220 = 1,762 ; Vs = 2 150/2,65 = 811,3 ; porosité = 1 − 811,3/1 220 = 0,335 ; absorption = 280/2 150 = 13,0 %
    const p = proprietesPhysiques(EXEMPLE_ECHANTILLON);
    expect(p.rhoApp).toBeCloseTo(1.7623, 4);
    expect(p.porosite).toBeCloseTo(0.335, 3);
    expect(p.absorption).toBeCloseTo(0.1302, 4);
  });
});

describe('traction', () => {
  it('HA 12', () => {
    // S0 = 113,1 mm² ; Re = 58 000/113,1 = 512,8 ; Rm = 592,4 ; A = 10,8/60 = 18 %
    const t = essaiTraction(EXEMPLE_TRACTION);
    expect(t.Re).toBeCloseTo(512.8, 1);
    expect(t.Rm).toBeCloseTo(592.4, 1);
    expect(t.A).toBeCloseTo(0.18, 10);
  });
});

describe('granulométrie', () => {
  it('sable : total, passants, MF', () => {
    const g = analyseGranulo(EXEMPLE_SABLE.retenus, EXEMPLE_SABLE.fond);
    expect(g.total).toBe(1000);
    // refus cumulé à 4 mm = 48/1 000 = 4,8 % ; à 2 mm = 14,4 % ; 1 mm = 31,2 ; 0,5 = 57,4 ; 0,25 = 81,0 ; 0,125 = 92,8
    expect(g.refusCumules[6]).toBeCloseTo(4.8, 10);
    // MF = (92,8 + 81,0 + 57,4 + 31,2 + 14,4 + 4,8)/100 = 2,816
    expect(g.mf).toBeCloseTo(2.816, 10);
    expect(g.fines).toBeCloseTo(3, 10);
  });
});

describe('béton', () => {
  it('classes d’affaissement', () => {
    expect(classeAffaissement(80)).toBe('S2');
    expect(classeAffaissement(120)).toBe('S3');
    expect(classeAffaissement(95)).toBe('hors classe');
  });
  it('formulation', () => {
    // C/E = 33/(0,5 × 45) + 0,5 = 1,9667 ; E = 350/1,9667 = 178,0 L
    const f = formulation(EXEMPLE_FORMULATION);
    expect(f.CsurE).toBeCloseTo(1.9667, 4);
    expect(f.E).toBeCloseTo(177.97, 2);
    // Vg = 1 000 − 112,9 − 178,0 − 15 = 694,1 L
    expect(f.Vg).toBeCloseTo(694.13, 1);
    expect(f.sable + f.gravier).toBeCloseTo(f.Vg * 2.65, 6);
  });
  it('évaporation', () => {
    // Tc = Ta = 30, r = 0,5, V = 16 : 5 × 0,5 × 48^2,5 × 20 × 10⁻⁶ = 0,798 kg/m²/h
    expect(evaporation(30, 30, 0.5, 16)).toBeCloseTo(0.798, 3);
  });
});

describe('aciers, mortier, bois, maçonnerie', () => {
  it('masse linéique', () => {
    // HA 12 : 113,1 mm² × 7 850 = 0,888 kg/m
    expect(barreHA(12).masse).toBeCloseTo(0.888, 3);
    expect(lotBarres(4, 12, 1).A).toBeCloseTo(452.4, 1);
  });
  it('enduit', () => {
    // 50 m², 15 mm, 350 kg/m³ : V = 0,825 m³ ; ciment 288,75 kg → 6 sacs
    const e = enduit(50, 15, 350);
    expect(e.V).toBeCloseTo(0.825, 10);
    expect(e.sacs).toBe(6);
  });
  it('bois et maçonnerie', () => {
    expect(humiditeBois(560, 480).H).toBeCloseTo(0.1667, 4);
    // 150 mm, de 40 % à 12 % : 30 − 12 = 18 points × 0,2 % = 3,6 % → 5,4 mm
    expect(retraitBois(150, 40, 12, 0.2)).toBeCloseTo(5.4, 10);
    // 41 × 21 = 861 cm² → 11,61 /m²
    expect(elementsParM2({ nom: 'p', L: 40, H: 20, joint: 1 })).toBeCloseTo(11.614, 3);
  });
});

import { controleExposition, effortNuance, enduitSuperficiel } from './materiaux';

describe('compléments', () => {
  it('enduit superficiel, exposition, nuance', () => {
    // 7 000 m² × 1,2 kg = 8,4 t ; 7 000 × 9 L = 63 m³ → 7 camions de 10 m³
    const e = enduitSuperficiel(7000, 1.2, 9);
    expect(e.liantT).toBeCloseTo(8.4, 10);
    expect(e.camions).toBe(7);
    // XC4 (indice 3) : E/C max 0,50 ; 350 kg, 178 L → 0,509 : non conforme
    const x = controleExposition(3, 350, 178);
    expect(x.okEC).toBe(false);
    // 1 000 mm² en S235 → 235 kN
    expect(effortNuance(1000, 0).N).toBeCloseTo(235, 10);
  });
});
