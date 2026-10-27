import { describe, expect, it } from 'vitest';
import {
  A0,
  caniveau,
  cavaliere,
  chaineCotes,
  choisirFormat,
  controleFacade,
  coteManquante,
  echelleDepuisCote,
  echelleGraphique,
  echelleMaximale,
  ecartFermeture,
  epaisseurEcriture,
  EXEMPLE_CANIVEAU,
  EXEMPLE_FACADE,
  EXEMPLE_FORMAT,
  EXEMPLE_MARCHES,
  facteurImpression,
  feuillesDans,
  formatA,
  isometrique,
  longueurIso,
  longueurPapier,
  longueurReelle,
  perspectiveMarches,
  profilMarches,
  surfaceReelle,
  traitFin,
  vuesExtrusion,
  zoneUtile,
} from './dessin';

describe('échelles', () => {
  it('lit et dessine à l’échelle', () => {
    // 54 mm au 1/50 : 54 × 50 = 2 700 mm = 2,70 m ; 3,60 m au 1/50 : 3 600 / 50 = 72 mm
    expect(longueurReelle(54, 50)).toBeCloseTo(2.7, 9);
    expect(longueurPapier(3.6, 50)).toBeCloseTo(72, 9);
  });

  it('retrouve l’échelle et choisit la plus grande qui tient', () => {
    // une porte de 0,90 m mesurée 18 mm : E = 900 / 18 = 50
    expect(echelleDepuisCote(18, 0.9)).toBeCloseTo(50, 9);
    // 18,60 m dans 350 mm : au 1/50, 372 mm (trop long) ; au 1/100, 186 mm → 1/100
    expect(echelleMaximale(18.6, 350)).toBe(100);
  });

  it('multiplie les surfaces par E²', () => {
    // 1 cm² = 100 mm² au 1/100 : 100 × 100² / 10⁶ = 1 m²
    expect(surfaceReelle(100, 100)).toBeCloseTo(1, 9);
    const g = echelleGraphique(50, 1, 3);
    expect(g.map((x) => x.papier)).toEqual([0, 20, 40, 60]);
  });
});

describe('formats et feuilles', () => {
  it('construit la série A par moitiés', () => {
    // A0 : 1000 × 2^(−1/4) = 840,9 → 841 ; 1000 × 2^(1/4) = 1 189,2 → 1 189
    expect(A0).toEqual({ court: 841, long: 1189 });
    // 1189/2 = 594,5 → 594 ; 841/2 = 420,5 → 420 ; 594/2 = 297 ; 420/2 = 210
    expect(formatA(1)).toEqual({ court: 594, long: 841 });
    expect(formatA(3)).toEqual({ court: 297, long: 420 });
    expect(formatA(4)).toEqual({ court: 210, long: 297 });
    expect(feuillesDans(0, 4)).toBe(16);
    expect(facteurImpression(1, 3)).toBeCloseTo(0.5, 12);
  });

  it('calcule la zone utile et choisit le format', () => {
    // A3 paysage : 420 − 20 − 10 = 390 ; 297 − 2 × 10 = 277
    expect(zoneUtile(3)).toEqual({ largeur: 390, hauteur: 277 });
    expect(zoneUtile(4)).toEqual({ largeur: 180, hauteur: 277 });
    // 12,40 × 6,80 m au 1/50 : 248 × 136 mm, avec 20 mm de réserve : 288 × 176 mm.
    // A4 : 288 > 180 ; A3 : 288 ≤ 390 et 176 ≤ 277 − 40 = 237 → A3, il reste 102 et 61 mm.
    const r = choisirFormat(EXEMPLE_FORMAT);
    expect(r.dessin).toEqual({ largeur: 248, hauteur: 136 });
    expect(r.n).toBe(3);
    expect(r.orientation).toBe('paysage');
    expect(r.marge.largeur).toBeCloseTo(102, 9);
    expect(r.marge.hauteur).toBeCloseTo(61, 9);
  });

  it('associe traits et écritures', () => {
    expect(traitFin(0.5)).toBe(0.25);
    expect(traitFin(0.35)).toBe(0.18);
    expect(epaisseurEcriture(3.5)).toBeCloseTo(0.35, 12);
    expect(epaisseurEcriture(3.5, 'A')).toBeCloseTo(0.25, 12);
    expect(() => traitFin(0.18)).toThrow();
  });
});

describe('projections et perspectives', () => {
  it('trouve les arêtes cachées d’un caniveau en U', () => {
    // Vue de dessus : x = 0 ; 0,10 ; 0,50 ; 0,60, toutes vues (le U est ouvert vers le haut).
    // Vue de gauche : z = 0,10 (fond intérieur) cachée derrière la paroi gauche ; z = 0 et 0,50 vues.
    const v = caniveau(EXEMPLE_CANIVEAU);
    expect(v.dessus.map((l) => [l.position, l.visible])).toEqual([[0, true], [0.1, true], [0.5, true], [0.6, true]]);
    expect(v.gauche.map((l) => [l.position, l.visible])).toEqual([[0, true], [0.1, false], [0.5, true]]);
    expect(v.largeurInterieure).toBeCloseTo(0.4, 9);
    expect(v.profondeurInterieure).toBeCloseTo(0.4, 9);
    // section : 0,60 × 0,50 − 0,40 × 0,40 = 0,30 − 0,16 = 0,14 m²
    expect(v.section).toBeCloseTo(0.14, 9);
  });

  it('cache le palier d’un bloc de marches vu de gauche', () => {
    const p = profilMarches({ n: 2, g: 0.28, h: 0.17 });
    expect(p).toEqual([[0, 0], [0.56, 0], [0.56, 0.17], [0.28, 0.17], [0.28, 0.34], [0, 0.34]]);
    const v = vuesExtrusion(p, 1);
    expect(v.gauche.find((l) => l.position === 0.17)?.visible).toBe(false);
    expect(v.dessus.every((l) => l.visible)).toBe(true);
  });

  it('projette en cavalière et en isométrie', () => {
    // fuyante de 1 m à 45°, k = 0,5 : 0,5 × cos 45° = 0,3536 dans chaque direction
    const [u, v] = cavaliere([0, 1, 0], 45, 0.5);
    expect(u).toBeCloseTo(0.35355, 4);
    expect(v).toBeCloseTo(0.35355, 4);
    const [a, b] = isometrique([1, 0, 0]);
    expect(a).toBeCloseTo(0.86603, 4);
    expect(b).toBeCloseTo(-0.5, 9);
    // côté de 1 m parallèle à x : dessiné 1 m ; diagonales du carré (√2 = 1,414 m en vrai) : √3 = 1,732 m et 1,000 m
    expect(longueurIso([0, 0, 0], [1, 0, 0])).toBeCloseTo(1, 9);
    expect(longueurIso([0, 0, 0], [1, 1, 0])).toBeCloseTo(1.73205, 4);
    expect(longueurIso([1, 0, 0], [0, 1, 0])).toBeCloseTo(1, 9);
    const m = perspectiveMarches(EXEMPLE_MARCHES);
    expect(m.fuyante).toBeCloseTo(0.5, 9);
    expect(m.profondeur).toBeCloseTo(0.56, 9);
    expect(m.hauteur).toBeCloseTo(0.34, 9);
  });
});

describe('cotation', () => {
  it('ferme une chaîne de cotes', () => {
    // 1,20 + 1,20 + 2,40 + 0,90 + 3,70 = 9,40 m
    const c = chaineCotes(EXEMPLE_FACADE.partielles);
    expect(c.total).toBeCloseTo(9.4, 9);
    expect(c.cumulees).toEqual([0, 1.2, 2.4, 4.8, 5.7, 9.4]);
    expect(coteManquante([1.2, 1.2, 2.4, 0.9], 9.4)).toBeCloseTo(3.7, 9);
    expect(ecartFermeture([1.2, 1.2, 2.4, 0.9, 3.6], 9.4)).toBeCloseTo(-0.1, 9);
    expect(controleFacade(EXEMPLE_FACADE).ferme).toBe(true);
  });
});
