import { describe, expect, it } from 'vitest';
import {
  aireHeron,
  airePolygone,
  aireRectangle,
  aireSignee,
  aireTrapeze,
  cartVersPolaire,
  cone,
  cylindre,
  dalleL,
  EXEMPLE_DALLE_L,
  EXEMPLE_FOUILLE,
  EXEMPLE_MAISON,
  EXEMPLE_MASSIF,
  EXEMPLE_SECTION_T,
  fouilleTalutee,
  gravite,
  hauteurParOmbre,
  largeurRiviere,
  maison,
  massifL,
  perimetrePolygone,
  rayonnement,
  rectangle,
  secteur,
  sectionT,
  segment,
  similitude,
  sphere,
  termesLacet,
  triangleMorceau,
  troncCone,
  troncPyramideRect,
} from './geometrie';

describe('figures planes (N0.5.1)', () => {
  it('aires usuelles', () => {
    expect(aireTrapeze(10, 6, 4)).toBe(32); // (10 + 6) × 4 / 2
    const s = secteur(2, 90); // quart de disque : π × 4 / 4 = π ; arc 2π × 2 / 4 = π
    expect(s.aire).toBeCloseTo(Math.PI, 12);
    expect(s.arc).toBeCloseTo(Math.PI, 12);
    expect(aireHeron(3, 4, 5)).toBeCloseTo(6, 12); // p = 6 ; √(6 × 3 × 2 × 1) = 6
    expect(aireHeron(1, 2, 3)).toBeNull();
  });

  it('parcelle par coordonnées (formule du lacet)', () => {
    // (0,0) (20,0) (16,15) (0,12) : Σ = 0 + 300 + 192 + 0 = 492 → 246 m²
    const p = [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 16, y: 15 }, { x: 0, y: 12 }];
    expect(airePolygone(p)).toBeCloseTo(246, 12);
    expect(termesLacet(p)).toEqual([0, 300, 192, 0]);
    expect(aireSignee([...p].reverse())).toBeCloseTo(-246, 12);
    // périmètre 20 + √241 + √265 + 12 = 20 + 15,524 2 + 16,278 8 + 12 = 63,803 0 m
    expect(perimetrePolygone(p)).toBeCloseTo(63.8030, 4);
  });

  it('dalle en L avec trémie', () => {
    // 9 × 4 + 4 × 3,5 − 2,6 × 1,1 = 36 + 14 − 2,86 = 47,14 m² ; contour 2 × (9 + 4 + 3,5) = 33 m ; béton 7,071 m³
    const r = dalleL(EXEMPLE_DALLE_L);
    expect(r.A).toBeCloseTo(47.14, 12);
    expect(r.perimetre).toBeCloseTo(33, 12);
    expect(r.perimetreTremie).toBeCloseTo(7.4, 12);
    expect(r.V).toBeCloseTo(7.071, 12);
    expect(r.valide).toBe(true);
  });
});

describe('Thalès (N0.5.2)', () => {
  it('hauteur par l’ombre et similitude', () => {
    // bâton 1,50 m, ombre 1,20 m ; ombre du pylône 18 m → k = 15, H = 22,5 m
    const r = hauteurParOmbre(1.5, 1.2, 18);
    expect(r.k).toBeCloseTo(15, 12);
    expect(r.H).toBeCloseTo(22.5, 12);
    // rivière : AD = 6, DE = 2,4, AF = 2 → x = 6 × 2 / 0,4 = 30 m ; contrôle 2 / 2,4 = 30 / 36
    expect(largeurRiviere(6, 2.4, 2)).toBeCloseTo(30, 10);
    expect(largeurRiviere(6, 2, 2)).toBeNull();
    expect(similitude(2)).toEqual({ longueurs: 2, aires: 4, volumes: 8 });
  });
});

describe('solides (N0.5.3)', () => {
  it('cylindre, cône, tronc de cône, sphère', () => {
    expect(cylindre(1, 2).V).toBeCloseTo(2 * Math.PI, 12);
    expect(cylindre(1, 2).Stot).toBeCloseTo(6 * Math.PI, 12);
    // cône r = 3, h = 4 : g = 5 ; V = π × 9 × 4 / 3 = 12π ; S lat = 15π
    const c = cone(3, 4);
    expect(c.g).toBeCloseTo(5, 12);
    expect(c.V).toBeCloseTo(12 * Math.PI, 12);
    expect(c.Slat).toBeCloseTo(15 * Math.PI, 12);
    // tronc R = 2, r = 1, h = 3 : V = π × 3 / 3 × (4 + 2 + 1) = 7π ; g = √10
    const t = troncCone(2, 1, 3);
    expect(t.V).toBeCloseTo(7 * Math.PI, 12);
    expect(t.g).toBeCloseTo(Math.sqrt(10), 12);
    expect(sphere(3).V).toBeCloseTo(36 * Math.PI, 12);
  });

  it('tronc de pyramide : la formule des prismatoïdes redonne h/3 (A1 + A2 + √A1A2)', () => {
    // 2 × 2 et 4 × 4, h = 3 : 3/6 × (4 + 16 + 4 × 9) = 28 = 1 × (4 + 16 + 8)
    expect(troncPyramideRect(2, 2, 4, 4, 3)).toBeCloseTo(28, 12);
  });

  it('fouille talutée', () => {
    // fond 1,60 × 1,60, H = 1,20, talus 0,5/1 : haut 2,80 × 2,80 ; mi-hauteur 2,20 × 2,20
    // V = 1,2/6 × (2,56 + 7,84 + 4 × 4,84) = 0,2 × 29,76 = 5,952 m³
    // moyenne des aires : (2,56 + 7,84)/2 × 1,2 = 6,24 m³, soit +4,84 %
    const f = fouilleTalutee(EXEMPLE_FOUILLE);
    expect(f.aSup).toBeCloseTo(2.8, 12);
    expect(f.V).toBeCloseTo(5.952, 12);
    expect(f.Vmoyenne).toBeCloseTo(6.24, 12);
    expect(f.ecart).toBeCloseTo(0.048387, 6);
  });
});

describe('repérage (N0.5.4)', () => {
  it('segment entre deux bornes', () => {
    // A(2 ; 1), B(8 ; 9) : Δx = 6, Δy = 8, d = 10, θ = atan(8/6) = 53,130 1°, milieu (5 ; 5)
    const s = segment({ x: 2, y: 1 }, { x: 8, y: 9 });
    expect(s.d).toBeCloseTo(10, 12);
    expect(s.theta).toBeCloseTo(53.1301, 4);
    expect(s.milieu).toEqual({ x: 5, y: 5 });
  });

  it('polaire et cartésien', () => {
    const p = cartVersPolaire(-1, -1);
    expect(p.r).toBeCloseTo(Math.SQRT2, 12);
    expect(p.theta).toBeCloseTo(225, 12);
    // station (100 ; 200), 50 m à 30° : (100 + 43,301 ; 200 + 25)
    const R = rayonnement({ x: 100, y: 200 }, 50, 30);
    expect(R.x).toBeCloseTo(143.30127, 5);
    expect(R.y).toBeCloseTo(225, 10);
  });
});

describe('projections : massif en L (N0.5.5)', () => {
  it('volume = aire de la vue de face × profondeur', () => {
    // section 1,8 × 0,4 + 0,8 × 0,6 = 0,72 + 0,48 = 1,20 m² ; V = 1,20 m³ ; coffrage 2 × 1,2 + (0,4 + 0,6 + 1,0) × 1 = 4,4 m²
    const m = massifL(EXEMPLE_MASSIF);
    expect(m.section).toBeCloseTo(1.2, 12);
    expect(m.V).toBeCloseTo(1.2, 12);
    expect(m.coffrage).toBeCloseTo(4.4, 12);
  });
});

describe('centre de gravité (N0.5.6)', () => {
  it('section en T 60 × 12 / 20 × 50 cm', () => {
    // âme 20 × 38 = 760 cm² à y = 19 ; table 60 × 12 = 720 cm² à y = 44
    // yG = (760 × 19 + 720 × 44) / 1 480 = 46 120 / 1 480 = 31,162 cm
    const t = sectionT(EXEMPLE_SECTION_T);
    expect(t.A).toBe(1480);
    expect(t.yG).toBeCloseTo(31.1622, 4);
    expect(t.xG).toBeCloseTo(0, 12);
    expect(t.vSup).toBeCloseTo(18.8378, 4);
  });

  it('plaque percée et triangle', () => {
    // plaque 4 × 2 (G en 2 ; 1) moins un trou 1 × 1 centré en (3 ; 1) : xG = (8 × 2 − 1 × 3) / 7 = 13/7
    const g = gravite([rectangle('plaque', 0, 0, 4, 2), rectangle('trou', 2.5, 0.5, 1, 1, true)]);
    expect(g.A).toBe(7);
    expect(g.xG).toBeCloseTo(13 / 7, 12);
    expect(g.yG).toBeCloseTo(1, 12);
    const t = triangleMorceau('t', { x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 3 });
    expect(t.A).toBeCloseTo(4.5, 12);
    expect([t.x, t.y]).toEqual([1, 1]);
  });
});

describe('la petite maison (N0.5.P)', () => {
  it('quantités', () => {
    // axe : 2 × 8,8 + 2 × 6,8 = 31,2 m ; intérieur 8,6 × 6,6 = 56,76 m²
    // fouille 31,2 × 0,6 × 0,6 = 11,232 m³ ; semelles 31,2 × 0,5 × 0,25 = 3,9 m³ ; dallage 56,76 × 0,12 = 6,811 2 m³
    // murs 31,2 × 2,8 = 87,36 m² − baies 10,98 m² = 76,38 m² ; maçonnerie × 0,2 = 15,276 m³ ; béton 10,711 2 m³ → 2 toupies de 8 m³
    const r = maison(EXEMPLE_MAISON);
    expect(r.emprise).toBe(63);
    expect(r.longueurAxe).toBeCloseTo(31.2, 12);
    expect(r.Sint).toBeCloseTo(56.76, 12);
    expect(r.Vfouille).toBeCloseTo(11.232, 12);
    expect(r.Vsemelle).toBeCloseTo(3.9, 12);
    expect(r.Vdalle).toBeCloseTo(6.8112, 12);
    expect(EXEMPLE_MAISON.ouvertures).toBeCloseTo(10.98, 12);
    expect(r.SmurNet).toBeCloseTo(76.38, 12);
    expect(r.Vmaconnerie).toBeCloseTo(15.276, 12);
    expect(r.toupies).toBe(2);
  });

  it('une bande centrée sur l’axe a pour aire périmètre à l’axe × largeur', () => {
    // axe 8,8 × 6,8, bande de 0,6 : (9,4 × 7,4) − (8,2 × 6,2) = 69,56 − 50,84 = 18,72 = 31,2 × 0,6
    expect(aireRectangle(9.4, 7.4) - aireRectangle(8.2, 6.2)).toBeCloseTo(31.2 * 0.6, 10);
  });
});
