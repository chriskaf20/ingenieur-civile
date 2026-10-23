import { describe, expect, it } from 'vitest';
import { arrondi, arrondiInf, arrondiSignificatif, arrondiSup, exposantTexte, grandeur, nombre, nombreCourt, notationScientifique, puissanceDix, scientifique } from './format';

describe('arrondi', () => {
  it('arrondit le demi à l’écart de zéro', () => {
    expect(arrondi(2.5)).toBe(3);
    expect(arrondi(-2.5)).toBe(-3);
    // 1,005 n'est pas représentable exactement en binaire : l'arrondi décimal doit donner 1,01.
    expect(arrondi(1.005, 2)).toBe(1.01);
  });
  it('ne renvoie jamais −0', () => {
    expect(Object.is(arrondi(-0.0001, 2), 0)).toBe(true);
  });
  it('arrondit au pas supérieur ou inférieur', () => {
    expect(arrondiSup(116.55)).toBe(117);
    expect(arrondiSup(3, 1)).toBe(3);
    expect(arrondiInf(0.144, 0.01)).toBeCloseTo(0.14, 12);
    expect(arrondiInf(0.24, 0.01)).toBeCloseTo(0.24, 12);
  });
});

describe('nombre', () => {
  it('écrit à la française', () => {
    expect(nombre(1234.5, 2)).toBe('1 234,50');
    expect(nombre(0.725, 3)).toBe('0,725');
    expect(nombre(-0.004, 2)).toBe('0,00');
  });
  it('ajoute l’unité avec une espace insécable', () => {
    expect(grandeur(478.114, 2, 'm³')).toBe('478,11 m³');
  });
});

describe('notation scientifique et chiffres significatifs', () => {
  it('décompose en mantisse et exposant', () => {
    expect(notationScientifique(210000)).toEqual({ m: 2.1, e: 5 });
    expect(notationScientifique(0.00375)).toEqual({ m: 3.75, e: -3 });
    expect(notationScientifique(1000)).toEqual({ m: 1, e: 3 });
  });
  it('arrondit à n chiffres significatifs', () => {
    expect(arrondiSignificatif(0.0012345, 3)).toBe(0.00123);
    expect(arrondiSignificatif(305.81, 2)).toBe(310);
    expect(arrondiSignificatif(9.996, 3)).toBe(10);
  });
  it('écrit à la française avec exposant', () => {
    expect(scientifique(0.00123456, 3)).toBe('1,23 × 10⁻³');
    expect(scientifique(210000, 2)).toBe('2,1 × 10⁵');
    expect(scientifique(9.996, 3)).toBe('1,00 × 10¹');
    expect(scientifique(4.2, 2)).toBe('4,2');
  });
});

describe('exposants et nombres courts', () => {
  it('écrit les exposants et les puissances de dix', () => {
    expect(exposantTexte(-2)).toBe('⁻²');
    expect(puissanceDix(9)).toBe('10⁹');
    expect(puissanceDix(-3)).toBe('10⁻³');
  });
  it('supprime les zéros inutiles', () => {
    expect(nombreCourt(2.5)).toBe('2,5');
    expect(nombreCourt(150)).toBe('150');
    expect(nombreCourt(200000).replace(/\s/g, ' ')).toBe('200 000');
    expect(nombreCourt(0.0980665, 4)).toBe('0,0981');
  });
});
