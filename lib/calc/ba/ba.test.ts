import { describe, expect, it } from 'vitest';
import { masseLineique, sectionBarre, sectionBarres } from '../acier';
import { combinaisonELU } from '../charges';
import { enrobageNominal } from './enrobage';
import { classeDeFck, fcd, fckDeClasse, fyd } from './materiaux';
import { alphaBAEL, alphaEC2, EXEMPLE_POTEAU, poteauCompressionCentree, positionsCadres } from './poteau';

describe('aciers', () => {
  it('section et masse d’une barre HA 12', () => {
    // A = π·12²/4 = 113,10 mm² = 1,131 cm² ; m = 7 850 × 113,10·10⁻⁶ = 0,888 kg/m
    expect(sectionBarre(12)).toBeCloseTo(1.13097, 5);
    expect(sectionBarres(8, 12)).toBeCloseTo(9.04779, 5);
    expect(masseLineique(12)).toBeCloseTo(0.88781, 5);
    expect(masseLineique(6)).toBeCloseTo(0.22195, 5);
  });
});

describe('matériaux et enrobage', () => {
  it('résistances de calcul', () => {
    expect(fckDeClasse('C25/30')).toBe(25);
    expect(classeDeFck(30)).toBe('C30/37');
    expect(classeDeFck(27)).toBeUndefined();
    expect(fcd(25)).toBeCloseTo(16.6667, 4); // 1,0 × 25 / 1,5
    expect(fyd(500)).toBeCloseTo(434.783, 3); // 500 / 1,15
  });
  it('enrobage nominal XC1 avec cadres HA 6', () => {
    // cmin = max(6 ; 15 ; 10) = 15 mm ; cnom = 15 + 10 = 25 mm
    expect(enrobageNominal('XC1', 6)).toEqual({ cminB: 6, cminDur: 15, cmin: 15, cnom: 25 });
    // XC2 : cmin,dur = 25 mm → cnom = 35 mm
    expect(enrobageNominal('XC2', 8).cnom).toBe(35);
  });
  it('combinaison ELU', () => {
    expect(combinaisonELU(700, 200)).toBeCloseTo(1245, 9); // 1,35 × 700 + 1,5 × 200
  });
});

describe('coefficients α', () => {
  it('EC2 (méthode simplifiée) et BAEL', () => {
    expect(alphaEC2(0)).toBeCloseTo(0.86, 12);
    expect(alphaEC2(31)).toBeCloseTo(0.688, 12); // 0,86 / (1 + 0,5²) = 0,86 / 1,25
    expect(alphaEC2(80)).toBeCloseTo((32 / 80) ** 1.3, 12);
    // quasi-continuité en λ = 60 : 0,86 / (1 + (60/62)²) = 0,4441 et (32/60)^1,3 = 0,4417
    expect(Math.abs(alphaEC2(60) - alphaEC2(60.0001))).toBeLessThan(0.003);
    expect(alphaBAEL(35)).toBeCloseTo(0.85 / 1.2, 12);
    expect(alphaBAEL(60)).toBeCloseTo(0.6 * (50 / 60) ** 2, 12);
  });
});

/*
 * Cas vérifié à la main : exemple de la leçon L3.3.5.
 * Données : NG = 700 kN, NQ = 200 kN, poteau 30 × 30 cm, l = 3,00 m, l0 = 0,7 × 3,00 = 2,10 m,
 * C25/30, B500, XC1, cadres HA 6.
 *  NEd = 1,35 × 700 + 1,5 × 200 = 1 245 kN
 *  λ = 2,10 × √12 / 0,30 = 24,25
 * EC2 (méthode simplifiée) :
 *  α = 0,86 / (1 + (24,25/62)²) = 0,86 / 1,15297 = 0,7459
 *  kh0 = 0,75 + 0,5 × 0,30 = 0,90 ; ks = 1 (fyk = 500)
 *  Ac·fcd = 900 cm² × 1,6667 kN/cm² = 1 500 kN ; fyd = 43,478 kN/cm²
 *  cnom = 25 mm ; avec des HA 12 : d' = 25 + 6 + 6 = 37 mm, δ = 0,1233
 *  NEd/(kh0·α) = 1 245 / 0,67131 = 1 854,6 kN → c·q·As² − (q − c·P)·As + 354,6 = 0
 *  avec c = 6δ/Ac = 8,222·10⁻⁴ : As = 8,45 cm² → 4 HA 16 (8,04) ne suffit pas, 8 HA 12 (9,05) convient
 *  NRd(8 HA 12) : kh = 0,90 × (1 − 6 × 0,010053 × 0,1233) = 0,89330
 *                 NRd = 0,89330 × 0,7459 × (1 500 + 9,048 × 43,478) = 1 261,6 kN ≥ 1 245 kN
 *  As,min = max(0,10 × 1 245 / 43,478 ; 0,002 × 900) = 2,86 cm²
 *  Cadres : φt = max(6 ; 12/4) = 6 mm ; s ≤ min(20 × 12 ; 300 ; 400) = 240 mm ; près des planchers 0,6 × 240 = 144 → 0,14 m
 * BAEL 91 :
 *  α = 0,85 / (1 + 0,2 × (24,25/35)²) = 0,85 / 1,096 = 0,7755
 *  Br = 28 × 28 = 784 cm² ; Br·fc28/(0,9·γb) = 784 × 2,5 / 1,35 = 1 451,9 kN
 *  Ath = (1 245 / 0,7755 − 1 451,9) × 1,15 / 50 = 3,53 cm²
 *  Amin = max(4 × 1,20 ; 0,2 % × 900) = 4,80 cm² → 4 HA 14 (6,16 cm²)
 *  st ≤ min(15 × 1,4 ; 40 ; 30 + 10) = 21 cm
 * Quantités : béton 0,30 × 0,30 × 3,00 = 0,27 m³
 *  aciers longitudinaux 8 × 3,00 × 0,888 = 21,31 kg
 *  cadres : chaque zone de 0,30 m en 0,30 / 0,14 = 2,14 → 3 intervalles ; partie courante 2,40 / 0,24 → 10 intervalles
 *           intervalles 3 + 10 + 3 = 16 → 17 cadres
 *  longueur d'un cadre = 4 × (0,30 − 2 × 0,025 − 0,006) + 0,20 = 1,176 m → 17 × 1,176 × 0,2220 = 4,44 kg
 *  ratio = (21,31 + 4,44) / 0,27 = 95,35 kg/m³
 */
describe('poteau en compression centrée : exemple L3.3.5', () => {
  const r = poteauCompressionCentree(EXEMPLE_POTEAU);

  it('effort et élancement', () => {
    expect(r.NEd).toBeCloseTo(1245, 9);
    expect(r.l0).toBeCloseTo(2.1, 12);
    expect(r.ec2.lambda).toBeCloseTo(24.249, 3);
  });

  it('EC2 : α, section nécessaire et barres retenues', () => {
    expect(r.ec2.alpha).toBeCloseTo(0.7459, 4);
    expect(r.ec2.kh0).toBeCloseTo(0.9, 12);
    expect(r.ec2.enrobage.cnom).toBe(25);
    expect(r.ec2.barres).toMatchObject({ n: 8, phi: 12 });
    expect(r.ec2.AsReq).toBeCloseTo(8.454, 2);
    expect(r.ec2.NRd).toBeCloseTo(1261.6, 0);
    expect(r.ec2.AsMin).toBeCloseTo(2.8635, 3);
    expect(r.ec2.AsMax).toBeCloseTo(36, 9);
    expect(r.ec2.valide).toBe(true);
    // béton seul : 0,90 × 0,7459 × 1 500 = 1 007,0 kN
    expect(r.ec2.NRdBetonSeul).toBeCloseTo(1006.97, 1);
  });

  it('EC2 : armatures transversales', () => {
    expect(r.ec2.phiT).toBe(6);
    expect(r.ec2.sMax).toBeCloseTo(0.24, 12);
    expect(r.ec2.sMaxExtremites).toBeCloseTo(0.14, 12);
    expect(r.ec2.zoneExtremite).toBeCloseTo(0.3, 12);
  });

  it('BAEL : section théorique, minimale et barres', () => {
    expect(r.bael.alpha).toBeCloseTo(0.77555, 5);
    expect(r.bael.Br).toBeCloseTo(784, 9);
    expect(r.bael.termeBeton).toBeCloseTo(1451.85, 2);
    // béton seul : 0,7755 × 1 451,85 = 1 126,0 kN
    expect(r.bael.NuBetonSeul).toBeCloseTo(1125.98, 1);
    expect(r.bael.Ath).toBeCloseTo(3.530, 3);
    expect(r.bael.Amin).toBeCloseTo(4.8, 12);
    expect(r.bael.barres).toMatchObject({ n: 4, phi: 14 });
    expect(r.bael.stMax).toBeCloseTo(0.21, 12);
  });

  it('quantités', () => {
    const q = r.quantites;
    expect(q.volumeBeton).toBeCloseTo(0.27, 12);
    expect(q.coffrage).toBeCloseTo(3.6, 12);
    expect(q.masseLongitudinale).toBeCloseTo(21.308, 3);
    expect(q.nombreCadres).toBe(17);
    expect(q.longueurCadre).toBeCloseTo(1.176, 12);
    expect(q.masseCadres).toBeCloseTo(4.4373, 3);
    expect(q.masseTotale).toBeCloseTo(25.7449, 3);
    expect(q.ratio).toBeCloseTo(95.351, 2); // 25,745 / 0,27
  });

  it('positions des cadres : zones resserrées aux extrémités', () => {
    const z = positionsCadres(3, 0.3, 0.14, 0.24);
    expect(z).toHaveLength(17);
    expect(z[0]).toBe(0);
    expect(z[3]).toBeCloseTo(0.3, 9);
    expect(z[4]).toBeCloseTo(0.54, 9); // 0,30 + 2,40 / 10
    expect(z[16]).toBeCloseTo(3, 9);
  });

  it('signale une section trop faible', () => {
    const petit = poteauCompressionCentree({ ...EXEMPLE_POTEAU, a: 0.2, b: 0.2, NG: 1500 });
    expect(petit.ec2.valide).toBe(false);
    expect(petit.ec2.messages.length).toBeGreaterThan(0);
  });
});
