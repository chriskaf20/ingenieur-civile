import { describe, expect, it } from 'vitest';
import {
  angleHorizontal,
  carnetNivellement,
  correctionsRuban,
  degresEnGrades,
  doubleRetournement,
  EXEMPLE_CHEMINEMENT,
  EXEMPLE_GRILLE,
  EXEMPLE_LEVER,
  EXEMPLE_RUBAN,
  EXEMPLE_SERIE,
  EXEMPLE_VISEE,
  fuseauUTM,
  gisementReciproque,
  gradEnDegres,
  grilleNivellement,
  leverRayonnement,
  problemeDirect,
  problemeInverse,
  statistiquesMesures,
  surfacePolygone,
  viseeStation,
} from './topographie';

describe('angles et coordonnées', () => {
  it('convertit les grades', () => {
    // 100 gon = 90° ; 45° = 50 gon
    expect(gradEnDegres(100)).toBe(90);
    expect(degresEnGrades(45)).toBeCloseTo(50, 12);
    expect(angleHorizontal(350, 50)).toBeCloseTo(100, 9);
  });

  it('moyenne un double retournement', () => {
    // Hz CG 123,4560, CD 323,4580 : écart 0,0020 → Hz = 123,4570, collimation 0,0010
    // V CG 98,2150, CD 301,7870 : V = (98,2150 + 400 − 301,7870) / 2 = 98,2140 ; index (98,215 + 301,787 − 400)/2 = 0,001
    const r = doubleRetournement(123.456, 323.458, 98.215, 301.787);
    expect(r.Hz).toBeCloseTo(123.457, 9);
    expect(r.V).toBeCloseTo(98.214, 9);
    expect(r.index).toBeCloseTo(0.001, 9);
  });

  it('donne le fuseau UTM de Kinshasa', () => {
    // 15,3° E : ⌊(15,3 + 180) / 6⌋ + 1 = 33 ; méridien central 33 × 6 − 183 = 15°
    expect(fuseauUTM(15.3)).toEqual({ fuseau: 33, meridienCentral: 15 });
  });
});

describe('distances et visées', () => {
  it('corrige une mesure au ruban', () => {
    // étalonnage 46,385 × 0,008 / 50 = 0,00742 ; température 46,385 × 11,5e-6 × 14 = 0,00747
    // L = 46,39989 ; Dh = √(46,39989² − 1,42²) = 46,37816 m
    const r = correctionsRuban(EXEMPLE_RUBAN);
    expect(r.cEtalon).toBeCloseTo(0.007422, 5);
    expect(r.cTemp).toBeCloseTo(0.007468, 5);
    expect(r.Dh).toBeCloseTo(46.37816, 4);
  });

  it('réduit une visée de station totale', () => {
    // V = 97,385 gon : sin = 0,99916, cos = 0,04106 ; Dh = 86,339 m ; Δh = 3,548 + 1,55 − 1,80 = 3,298 m
    const v = viseeStation(EXEMPLE_VISEE);
    expect(v.Dh).toBeCloseTo(86.339, 3);
    expect(v.dh).toBeCloseTo(3.298, 3);
  });
});

describe('nivellement', () => {
  it('tient le carnet et compense la fermeture', () => {
    // ΣAR = 5,586 ; ΣAV = 5,580 ; fermeture 6 mm ≤ 10 √4 = 20 mm ; −1,5 mm par station
    const c = carnetNivellement(EXEMPLE_CHEMINEMENT);
    expect(c.controle).toBeCloseTo(0.006, 9);
    expect(c.fermeture).toBeCloseTo(0.006, 9);
    expect(c.tolerance).toBeCloseTo(0.02, 9);
    expect(c.admissible).toBe(true);
    expect(c.lignes[0]!.Z).toBeCloseTo(1244.2135, 9);
    expect(c.lignes[3]!.Z).toBeCloseTo(1243.567, 9);
  });

  it('calcule une grille de cotes', () => {
    // Zv = 412,35 + 1,426 = 413,776 ; premier nœud 413,776 − 1,212 = 412,564 ; h = 412,40 − 412,564 = −0,164 (déblai)
    const g = grilleNivellement(EXEMPLE_GRILLE);
    expect(g.Zv).toBeCloseTo(413.776, 9);
    expect(g.Z[0]![0]).toBeCloseTo(412.564, 9);
    expect(g.h[0]![0]).toBeCloseTo(-0.164, 9);
  });
});

describe('gisements, erreurs, lever', () => {
  it('résout les problèmes inverse et direct', () => {
    // ΔE = 100, ΔN = 100 : gisement 50 gon, distance 141,42 m ; ΔE = −100, ΔN = 0 : 300 gon
    const r = problemeInverse({ E: 0, N: 0 }, { E: 100, N: 100 });
    expect(r.G).toBeCloseTo(50, 9);
    expect(r.D).toBeCloseTo(141.421, 3);
    expect(problemeInverse({ E: 0, N: 0 }, { E: -100, N: 0 }).G).toBeCloseTo(300, 9);
    const B = problemeDirect({ E: 1000, N: 2000 }, 100, 50);
    expect(B.E).toBeCloseTo(1050, 9);
    expect(B.N).toBeCloseTo(2000, 9);
    expect(gisementReciproque(350)).toBeCloseTo(150, 9);
  });

  it('calcule l’écart-type d’une série', () => {
    // moyenne 48,23833 m ; écart-type (n − 1) 3,88 mm ; tolérance 2,7 σ = 10,5 mm
    const s = statistiquesMesures(EXEMPLE_SERIE);
    expect(s.moyenne).toBeCloseTo(48.23833, 5);
    expect(s.sigma * 1000).toBeCloseTo(3.88, 2);
    expect(s.horsTolerance).toEqual([]);
  });

  it('lève une parcelle et calcule sa surface', () => {
    // carré de 10 m : 100 m², périmètre 40 m
    expect(surfacePolygone([{ E: 0, N: 0 }, { E: 10, N: 0 }, { E: 10, N: 10 }, { E: 0, N: 10 }])).toEqual({ S: 100, perimetre: 40 });
    const l = leverRayonnement(EXEMPLE_LEVER.S, EXEMPLE_LEVER.Gref, EXEMPLE_LEVER.Hzref, EXEMPLE_LEVER.visees);
    expect(l.points[0]!.G).toBeCloseTo(339.7705, 4);
    expect(surfacePolygone(l.points).S).toBeCloseTo(691.19, 1);
  });
});
