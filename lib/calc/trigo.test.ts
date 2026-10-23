import { describe, expect, it } from 'vitest';
import {
  angleEntre,
  appliquerPente,
  composantes,
  convertirAngle,
  cosD,
  depuisDMS,
  ecartLateral,
  decomposerSurVersant,
  ecrituresPente,
  EXEMPLE_FERME,
  EXEMPLE_PROFIL,
  EXEMPLE_TOITURE,
  ferme,
  nomenclature,
  penteDepuis,
  profilTravers,
  rampe,
  rectAdjacentAngle,
  rectDeuxCotes,
  rectHypotenuseAngle,
  rectHypotenuseCote,
  rectOpposeAngle,
  resultante,
  sinD,
  talus,
  tanD,
  toiture,
  triangleACA,
  triangleCAC,
  triangleCCC,
  triangleCCA,
  valeurExacte,
  VALEURS_REMARQUABLES,
  versDMS,
} from './trigo';

describe('unités d’angle (N0.4.1)', () => {
  it('convertit entre degrés, radians et grades', () => {
    // un quart de tour : 90° = π/2 rad = 100 gon
    expect(convertirAngle(90, 'deg', 'rad')).toBeCloseTo(Math.PI / 2, 12);
    expect(convertirAngle(90, 'deg', 'gon')).toBeCloseTo(100, 12);
    // 1 gon = 360/400 = 0,9° ; 1 rad = 180/π = 57,295 8°
    expect(convertirAngle(1, 'gon', 'deg')).toBeCloseTo(0.9, 12);
    expect(convertirAngle(1, 'rad', 'deg')).toBeCloseTo(57.29578, 5);
  });

  it('passe en degrés, minutes, secondes', () => {
    expect(versDMS(45.5)).toEqual({ signe: 1, d: 45, m: 30, s: 0 });
    // 12,345 6° : 0,345 6 × 60 = 20,736′ → 20′ ; 0,736 × 60 = 44,16″
    expect(versDMS(12.3456)).toEqual({ signe: 1, d: 12, m: 20, s: 44.16 });
    expect(depuisDMS(12, 20, 44.16)).toBeCloseTo(12.3456, 10);
    // report : 10,999 999° → 59′ 59,996 4″ arrondi à 60″ → 11° 0′ 0″
    expect(versDMS(10.999999)).toEqual({ signe: 1, d: 11, m: 0, s: 0 });
    // 1 mgon = 0,001 × π/200 rad = 1,570 8 × 10⁻⁵ rad ; à 100 m : 1,57 mm ; 1 gon à 100 m : 1,57 m
    expect(ecartLateral(100, 0.001, 'gon')).toBeCloseTo(0.0015708, 7);
    expect(ecartLateral(100, 1, 'gon')).toBeCloseTo(1.5709, 4);
  });
});

describe('triangle rectangle (N0.4.2)', () => {
  it('le triangle 3-4-5', () => {
    // c = √(9 + 16) = 5 ; α = atan(3/4) = 36,869 9° ; aire 6 ; périmètre 12
    const t = rectDeuxCotes(3, 4);
    expect(t.c).toBeCloseTo(5, 12);
    expect(t.alpha).toBeCloseTo(36.8699, 4);
    expect(t.beta).toBeCloseTo(53.1301, 4);
    expect(t.aire).toBe(6);
    expect(t.perimetre).toBeCloseTo(12, 12);
  });

  it('le hauban : 8 m de haut, ancré à 6 m du pied', () => {
    // L = √(64 + 36) = 10 m ; angle avec le sol atan(8/6) = 53,130 1°
    const t = rectDeuxCotes(8, 6);
    expect(t.c).toBeCloseTo(10, 12);
    expect(t.alpha).toBeCloseTo(53.1301, 4);
  });

  it('les autres cas de résolution', () => {
    expect(rectHypotenuseCote(10, 6)!.b).toBeCloseTo(8, 12);
    expect(rectHypotenuseCote(5, 6)).toBeNull();
    // c = 10, α = 30° : a = 10 sin 30° = 5 ; b = 10 cos 30° = 8,660 3
    expect(rectHypotenuseAngle(10, 30).a).toBeCloseTo(5, 12);
    expect(rectHypotenuseAngle(10, 30).b).toBeCloseTo(8.66025, 5);
    expect(rectAdjacentAngle(4, 45).c).toBeCloseTo(4 * Math.SQRT2, 12);
    // a = 1, α = 30° : c = 1 / sin 30° = 2 ; b = 1 / tan 30° = √3
    expect(rectOpposeAngle(1, 30).c).toBeCloseTo(2, 12);
    expect(rectOpposeAngle(1, 30).b).toBeCloseTo(Math.sqrt(3), 12);
  });
});

describe('pentes (N0.4.3)', () => {
  it('le talus à 3/2', () => {
    // n = 1,5 → p = 1/1,5 = 0,666 7 = 66,67 % ; α = atan(0,666 7) = 33,690 1° = 37,433 4 gon
    const p = penteDepuis(1.5, 'n');
    const e = ecrituresPente(p);
    expect(e.pourcent).toBeCloseTo(66.6667, 4);
    expect(e.deg).toBeCloseTo(33.6901, 4);
    expect(e.gon).toBeCloseTo(37.4334, 4);
    expect(e.n).toBeCloseTo(1.5, 12);
    // k = √(1 + 0,444 4) = 1,201 85
    expect(e.k).toBeCloseTo(1.20185, 5);
    // talus de 2,40 m : base 2,4 × 1,5 = 3,60 m ; rampant √(3,6² + 2,4²) = √18,72 = 4,326 7 m
    const a = appliquerPente(p, 2.4);
    expect(a.L).toBeCloseTo(3.6, 12);
    expect(a.rampant).toBeCloseTo(4.32666, 5);
  });

  it('toutes les écritures se rejoignent', () => {
    expect(penteDepuis(45, 'deg')).toBeCloseTo(1, 12);
    expect(penteDepuis(50, 'gon')).toBeCloseTo(1, 12);
    expect(penteDepuis(6, 'pourmille')).toBeCloseTo(penteDepuis(0.6, 'pourcent'), 12);
  });
});

describe('cercle trigonométrique (N0.4.4)', () => {
  it('composantes d’une force', () => {
    // F = 12 kN à atan(8/6) : cos = 6/10, sin = 8/10 → Fx = 7,2 kN, Fy = 9,6 kN
    const c = composantes(12, rectDeuxCotes(8, 6).alpha);
    expect(c.Fx).toBeCloseTo(7.2, 10);
    expect(c.Fy).toBeCloseTo(9.6, 10);
    expect(c.quadrant).toBe(1);
    // 150° : Fx = 10 cos 150° = −8,660 3 ; Fy = 10 sin 150° = 5 ; deuxième quadrant
    const d = composantes(10, 150);
    expect(d.Fx).toBeCloseTo(-8.66025, 5);
    expect(d.Fy).toBeCloseTo(5, 12);
    expect(d.quadrant).toBe(2);
    expect(composantes(5, 270).quadrant).toBe(0);
  });

  it('résultante de deux forces', () => {
    // F1 = 12 kN à atan(8/6) → (7,2 ; 9,6) ; F2 = 8 kN à 120° → (−4 ; 6,928 2)
    // somme (3,2 ; 16,528 2) → R = √(3,2² + 16,528 2²) = 16,835 1 kN ; θ = atan2(16,528 2 ; 3,2) = atan 5,165 1 = 79,042 6°
    const r = resultante([{ F: 12, theta: rectDeuxCotes(8, 6).alpha }, { F: 8, theta: 120 }]);
    expect(r.Rx).toBeCloseTo(3.2, 10);
    expect(r.Ry).toBeCloseTo(16.52820, 5);
    expect(r.R).toBeCloseTo(16.83513, 5);
    expect(r.theta).toBeCloseTo(79.0426, 4);
  });

  it('charge sur un versant', () => {
    // 0,8 kN/m sur un versant à 30° : 0,8 × cos 30° = 0,692 8 ; 0,8 × sin 30° = 0,4
    const v = decomposerSurVersant(0.8, 30);
    expect(v.perp).toBeCloseTo(0.69282, 5);
    expect(v.para).toBeCloseTo(0.4, 12);
  });

  it('les valeurs exactes du tableau sont justes', () => {
    for (const v of VALEURS_REMARQUABLES) {
      expect(valeurExacte(v.sin)).toBeCloseTo(sinD(v.deg), 12);
      expect(valeurExacte(v.cos)).toBeCloseTo(cosD(v.deg), 12);
      if (v.tan !== '—') expect(valeurExacte(v.tan)).toBeCloseTo(tanD(v.deg), 12);
    }
  });

  it('sin² + cos² = 1', () => {
    for (const x of [0, 17, 53.13, 123.4, 271]) expect(sinD(x) ** 2 + cosD(x) ** 2).toBeCloseTo(1, 12);
  });
});

describe('triangle quelconque (N0.4.5)', () => {
  it('Al-Kashi : b = 5, c = 8, A = 60°', () => {
    // a² = 25 + 64 − 2 × 5 × 8 × 0,5 = 49 → a = 7 ; cos B = (49 + 64 − 25) / 112 = 0,785 7 → B = 38,213 2°
    const t = triangleCAC(5, 8, 60);
    expect(t.a).toBeCloseTo(7, 12);
    expect(t.B).toBeCloseTo(38.2132, 4);
    expect(t.C).toBeCloseTo(81.7868, 4);
    // aire = ½ × 5 × 8 × sin 60° = 17,320 5
    expect(t.aire).toBeCloseTo(17.3205, 4);
  });

  it('trois côtés, et loi des sinus', () => {
    // 7, 5, 8 : cos A = (25 + 64 − 49) / 80 = 0,5 → A = 60°
    expect(triangleCCC(7, 5, 8)!.A).toBeCloseTo(60, 10);
    expect(triangleCCC(1, 2, 3)).toBeNull();
    // A = 60°, B = 38,213 2°, c = 8 → a = 7 et b = 5 (même triangle)
    const t = triangleACA(60, 38.21321, 8)!;
    expect(t.a).toBeCloseTo(7, 4);
    expect(t.b).toBeCloseTo(5, 4);
    expect(triangleACA(100, 90, 5)).toBeNull();
  });

  it('le cas ambigu : a = 20, b = 30, A = 30°', () => {
    // sin B = 30 × 0,5 / 20 = 0,75 → B = 48,590 4° ou 131,409 6° ; C = 101,409 6° ou 18,590 4°
    // cos B = ±√(1 − 0,562 5) = ±0,661 4 ; sin C = sin(A + B) = 0,5 × (±0,661 4) + 0,866 0 × 0,75 = 0,980 2 ou 0,318 8
    // c = 20 sin C / sin 30° = 40 sin C = 39,209 ou 12,752
    const t = triangleCCA(20, 30, 30);
    expect(t.length).toBe(2);
    expect(t[0]!.B).toBeCloseTo(48.5904, 4);
    expect(t[0]!.c).toBeCloseTo(39.2095, 3);
    expect(t[1]!.B).toBeCloseTo(131.4096, 4);
    expect(t[1]!.c).toBeCloseTo(12.7520, 3);
    // a trop court : aucun triangle ; a ≥ b : une seule solution
    expect(triangleCCA(10, 30, 30)).toEqual([]);
    expect(triangleCCA(40, 30, 30).length).toBe(1);
  });
});

describe('toiture, rampe, talus (N0.4.6)', () => {
  it('toiture de 8 m à 30 %', () => {
    // h = 4 × 0,30 = 1,20 m ; α = atan 0,30 = 16,699 2° ; k = √1,09 = 1,044 03 ;
    // rampant 4 × k = 4,176 1 m ; avec débord 4,5 × k = 4,698 1 m ; surface 2 × 4,698 1 × 12 = 112,76 m²
    const t = toiture(EXEMPLE_TOITURE);
    expect(t.h).toBeCloseTo(1.2, 12);
    expect(t.alpha).toBeCloseTo(16.6992, 4);
    expect(t.rampant).toBeCloseTo(4.17612, 5);
    expect(t.rampantTotal).toBeCloseTo(4.69814, 5);
    expect(t.surface).toBeCloseTo(112.755, 3);
  });

  it('rampe et talus', () => {
    // 0,60 m à 12 % : L = 0,6 / 0,12 = 5 m ; rampant √(25 + 0,36) = 5,035 9 m
    const r = rampe(0.6, 12);
    expect(r.L).toBeCloseTo(5, 12);
    expect(r.rampant).toBeCloseTo(5.03587, 5);
    // talus de 2,40 m à 3/2 : emprise 3,60 m ; rampant 2,4 × √3,25 = 4,326 7 m
    const t = talus(2.4, 1.5);
    expect(t.emprise).toBeCloseTo(3.6, 12);
    expect(t.rampant).toBeCloseTo(4.32666, 5);
    expect(t.pourcent).toBeCloseTo(66.6667, 4);
    // section ½ × 3,60 × 2,40 = 4,32 m² par mètre de talus
    expect(t.section).toBeCloseTo(4.32, 12);
    // talus de 3 m à 2 pour 1 sur 25 m : section ½ × 2 × 9 = 9 m² ; volume 225 m³
    expect(talus(3, 2, 25).volume).toBeCloseTo(225, 12);
  });

  it('profil en travers', () => {
    // flèche 3,5 × 0,04 = 0,14 m ; emprise 7 + 2 × 1,5 × 1,5 = 11,5 m
    const p = profilTravers(EXEMPLE_PROFIL);
    expect(p.fleche).toBeCloseTo(0.14, 12);
    expect(p.emprise).toBeCloseTo(11.5, 12);
  });
});

describe('ferme en W (N0.4.P)', () => {
  it('portée 8 m, pente 30°', () => {
    // h = 4 tan 30° = 2,309 4 m ; arbalétrier 4 / cos 30° = 4,618 8 m ; avec débord 4,5 / cos 30° = 5,196 2 m ;
    // diagonale courte √((8/12)² + (h/2)²) = √(0,444 4 + 1,333 3) = 4/3 m ; longue √((8/6)² + h²) = 8/3 m ;
    // inclinaison des diagonales atan(3 tan 30°) = atan √3 = 60°
    const f = ferme(EXEMPLE_FERME);
    expect(f.h).toBeCloseTo(2.30940, 5);
    expect(f.arbaletrier).toBeCloseTo(4.61880, 5);
    expect(f.arbaletrierDebord).toBeCloseTo(5.19615, 5);
    expect(f.diagCourte).toBeCloseTo(4 / 3, 10);
    expect(f.diagLongue).toBeCloseTo(8 / 3, 10);
    expect(f.gamma).toBeCloseTo(60, 10);
    // 12 / 3 = 4 travées → 5 fermes ; par ferme 2 × 4,618 8 + 8 + 2 × 4/3 + 2 × 8/3 = 25,237 6 m
    expect(f.nbFermes).toBe(5);
    expect(f.longueurParFerme).toBeCloseTo(25.2376, 4);
    // total 5 × (2 × 5,196 2 + 8 + 8) = 131,96 m
    expect(f.longueurTotale).toBeCloseTo(131.9615, 4);
    // liste de débit : 10 arbalétriers de 5,196 2 m = 51,96 m ; 5 entraits de 8 m = 40 m ;
    // 10 diagonales de 4/3 m = 13,33 m ; 10 de 8/3 m = 26,67 m ; total 131,96 m
    const n = nomenclature(f);
    expect(n.lignes.map((l) => l.quantite)).toEqual([10, 5, 10, 10]);
    expect(n.lignes[0]!.total).toBeCloseTo(51.9615, 4);
    expect(n.total).toBeCloseTo(f.longueurTotale, 10);
    expect(n.pieces).toBe(35);
  });

  it('les angles aux nœuds se complètent', () => {
    const f = ferme({ ...EXEMPLE_FERME, alpha: 25 });
    const somme = (noeud: string) => f.angles.filter((a) => a.noeud === noeud && a.entre !== 'arbalétrier / arbalétrier').reduce((s, a) => s + a.valeur, 0);
    // au nœud D1, les trois angles remplissent le demi-plan ; en M1, l'arbalétrier est droit
    expect(somme('D1')).toBeCloseTo(180, 9);
    expect(somme('M1')).toBeCloseTo(180, 9);
    // en S : 2 × (arbalétrier / diagonale) + angle entre diagonales = angle entre arbalétriers = 180 − 2α
    const S = f.angles.filter((a) => a.noeud === 'S');
    expect(2 * S[0]!.valeur + S[1]!.valeur).toBeCloseTo(S[2]!.valeur, 9);
    expect(S[2]!.valeur).toBeCloseTo(130, 9);
    expect(f.angles[0]!.valeur).toBeCloseTo(25, 9);
    // à 30°, la diagonale courte est perpendiculaire à l'arbalétrier
    expect(ferme(EXEMPLE_FERME).angles[1]!.valeur).toBeCloseTo(90, 9);
    expect(angleEntre({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 2 })).toBeCloseTo(90, 12);
  });
});
