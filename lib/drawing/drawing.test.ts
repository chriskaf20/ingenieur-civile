import { describe, expect, it } from 'vitest';
import { faceVisible, profondeurIso, projeterIso, projeterIsoDirect } from './iso';
import { creerRepere, points } from './repere';

describe('projection isométrique', () => {
  it('projette les axes selon les angles de l’isométrie', () => {
    // x unitaire : vers la droite et vers le bas à 30° → (cos 30°, sin 30°) = (0,866 ; 0,5)
    const [u, v] = projeterIso([1, 0, 0]);
    expect(u).toBeCloseTo(0.8660254, 6);
    expect(v).toBeCloseTo(0.5, 12);
    // z unitaire : verticalement vers le haut de l'écran (y SVG négatif)
    expect(projeterIso([0, 0, 1])).toEqual([0, -1]);
  });
  it('écrase la direction de vue (1, 1, 1) en un point', () => {
    const [u, v] = projeterIso([2, 2, 2]);
    expect(u).toBeCloseTo(0, 12);
    expect(v).toBeCloseTo(0, 12);
  });
  it('voit les faces +x, +y, +z et cache les faces opposées', () => {
    expect(faceVisible([0, 0, 1])).toBe(true);
    expect(faceVisible([1, 0, 0])).toBe(true);
    expect(faceVisible([0, -1, 0])).toBe(false);
    expect(profondeurIso([1, 1, 1])).toBeGreaterThan(profondeurIso([0, 0, 0]));
  });
});

describe('orientation des projections', () => {
  // Produit vectoriel « écran » de deux directions dessinées (y de l'écran vers le bas) :
  // négatif = rotation de la première vers la seconde dans le sens trigonométrique, vue par le lecteur.
  const ecran = (a: readonly [number, number], b: readonly [number, number]) => a[0] * b[1] - a[1] * b[0];

  it('projeterIso dessine un trièdre indirect (x → y tourne dans le sens horaire vu d’en haut)', () => {
    expect(ecran(projeterIso([1, 0, 0]), projeterIso([0, 1, 0]))).toBeGreaterThan(0);
  });

  it('projeterIsoDirect dessine un trièdre direct (x → y dans le sens trigonométrique, z vers le haut)', () => {
    expect(ecran(projeterIsoDirect([1, 0, 0]), projeterIsoDirect([0, 1, 0]))).toBeLessThan(0);
    expect(projeterIsoDirect([0, 0, 1])).toEqual([0, -1]);
    expect(projeterIsoDirect([1, 0, 0])[0]).toBeLessThan(0); // x vers la gauche
  });
});

describe('repère monde → SVG', () => {
  it('place les points et inverse l’axe vertical', () => {
    // Monde 10 m × 5 m dans 220 unités avec marge 10 : échelle = 200 / 10 = 20 unités/m.
    const r = creerRepere({ xmin: 0, xmax: 10, ymin: 0, ymax: 5 }, 220, 10);
    expect(r.echelle).toBe(20);
    expect(r.hauteur).toBe(5 * 20 + 20);
    expect(r.x(0)).toBe(10);
    expect(r.y(0)).toBe(110); // bas du cadre
    expect(r.y(5)).toBe(10); // haut du cadre
  });
  it('applique l’exagération verticale', () => {
    const r = creerRepere({ xmin: 0, xmax: 10, ymin: 0, ymax: 1 }, 220, 10, 5);
    expect(r.ly(1)).toBe(100);
    expect(r.lx(1)).toBe(20);
  });
  it('formate une liste de points', () => {
    expect(points([[1.234, 5], [2, 3.456]])).toBe('1.23,5 2,3.46');
  });
});
