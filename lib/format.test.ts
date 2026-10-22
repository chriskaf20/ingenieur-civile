import { describe, expect, it } from 'vitest';
import { arrondi, arrondiInf, arrondiSup, grandeur, nombre } from './format';

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
