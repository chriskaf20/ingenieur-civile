import { describe, expect, it } from 'vitest';
import {
  angleVecteurs,
  decomposer,
  depuisPolaire,
  direction,
  elingues,
  enveloppeMat,
  equerrage,
  EXEMPLE_ANNEAU,
  EXEMPLE_ELINGUES,
  EXEMPLE_EQUERRAGE,
  EXEMPLE_FORCE_CABLE,
  EXEMPLE_MAT,
  EXEMPLE_MOMENT,
  EXEMPLE_POTENCE,
  facteurElingue,
  fois,
  forceCable,
  matHaubane,
  moment2D,
  momentForce,
  norme,
  potence,
  projection,
  repartirSurCables,
  scalaire,
  somme,
  sommeForces,
  travail,
  unitaire,
  vecteurAB,
  vectoriel,
  vectoriel2,
} from './vecteurs';

describe('opérations de base', () => {
  it('somme, produit par un nombre, norme, direction', () => {
    expect(somme([1, 2], [3, -5], [0, 1])).toEqual([4, -2]);
    expect(fois(1.35, [0, -80])).toEqual([0, -108]); // 1,35 × G : la norme change, pas la direction
    expect(norme([3, 4])).toBe(5);
    expect(norme([2, 3, 6])).toBe(7); // √(4 + 9 + 36) = 7
    const u = unitaire([3, 4]); // (3/5 ; 4/5)
    expect(u[0]).toBeCloseTo(0.6, 12);
    expect(u[1]).toBeCloseTo(0.8, 12);
    expect(vecteurAB([2, 1], [8, 9])).toEqual([6, 8]);
    expect(direction([-1, -1])).toBeCloseTo(225, 12);
    const v = depuisPolaire(10, 30); // (10 cos 30° ; 10 sin 30°) = (8,660 3 ; 5)
    expect(v[0]).toBeCloseTo(8.660254, 6);
    expect(v[1]).toBeCloseTo(5, 12);
    expect(() => unitaire([0, 0])).toThrow();
  });

  it('produit scalaire, angle, projection', () => {
    expect(scalaire([3, 4], [4, -3])).toBe(0); // perpendiculaires
    expect(angleVecteurs([1, 0], [0, 1])).toBeCloseTo(90, 12);
    expect(angleVecteurs([1, 1], [1, 0])).toBeCloseTo(45, 12);
    // projection de (3 ; 4) sur l'axe x : 3
    expect(projection([3, 4], [5, 0]).valeur).toBeCloseTo(3, 12);
    expect(projection([3, 4], [5, 0]).vecteur).toEqual([3, 0]);
  });

  it('produit vectoriel', () => {
    expect(vectoriel([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]); // x × y = z
    expect(vectoriel([0, 1, 0], [1, 0, 0])).toEqual([0, 0, -1]); // anticommutatif
    expect(vectoriel2([2, 0], [0, 3])).toBe(6);
  });

  it('décomposition selon deux directions', () => {
    expect(decomposer([0, 10], [1, 0], [0, 1])).toEqual([0, 10]);
    expect(decomposer([1, 1], [1, 0], [2, 0])).toBeNull(); // directions parallèles
    // (2 ; 2) selon x et selon la diagonale (1 ; 1) : 0 × x + 2√2 × diagonale unitaire
    const d = decomposer([2, 2], [1, 0], [1, 1])!;
    expect(d[0]).toBeCloseTo(0, 12);
    expect(d[1]).toBeCloseTo(2 * Math.SQRT2, 12);
  });
});

describe('la force d’un câble (N0.6.1)', () => {
  it('hauban de A(0 ; 8) vers B(6 ; 0), tension 12 kN', () => {
    // AB = (6 ; −8), |AB| = 10 m, û = (0,6 ; −0,8), F = 12 û = (7,2 ; −9,6) kN, θ = −53,13° = 306,87°
    // échelle 2 kN/cm : flèche de 6 cm
    const r = forceCable(EXEMPLE_FORCE_CABLE);
    expect(r.L).toBe(10);
    expect(r.u[0]).toBeCloseTo(0.6, 12);
    expect(r.F[0]).toBeCloseTo(7.2, 12);
    expect(r.F[1]).toBeCloseTo(-9.6, 12);
    expect(r.theta).toBeCloseTo(306.8699, 4);
    expect(r.fleche).toBe(6);
  });
});

describe('somme de forces (N0.6.2)', () => {
  it('deux tirants sur un anneau', () => {
    // F1 = 15 kN à 20° → (14,095 ; 5,130) ; F2 = 10 kN à 110° → (−3,420 ; 9,397)
    // R = (10,675 ; 14,527) ; F1 ⟂ F2 donc |R| = √(225 + 100) = √325 = 18,028 kN ; θ = 20° + atan(10/15) = 53,690°
    const s = sommeForces(EXEMPLE_ANNEAU);
    expect(s.R[0]).toBeCloseTo(10.675188, 6);
    expect(s.R[1]).toBeCloseTo(14.527228, 6);
    expect(s.norme).toBeCloseTo(Math.sqrt(325), 10);
    expect(s.theta).toBeCloseTo(53.690068, 6);
    expect(s.polygone).toHaveLength(3);
    // une force nulle est ignorée
    expect(sommeForces([...EXEMPLE_ANNEAU, { F: 0, theta: 45 }]).polygone).toHaveLength(3);
  });

  it('trois forces en équilibre : polygone fermé', () => {
    // 10 kN à 0°, 10 kN à 120°, 10 kN à 240° : somme nulle
    expect(sommeForces([{ F: 10, theta: 0 }, { F: 10, theta: 120 }, { F: 10, theta: 240 }]).norme).toBeCloseTo(0, 10);
  });
});

describe('élingage (N0.6.3)', () => {
  it('poutre de 24 kN, brins à 50°', () => {
    // T = P / (2 sin 50°) = 24 / 1,532 1 = 15,665 kN ; angle au sommet 80°
    const r = elingues(EXEMPLE_ELINGUES);
    expect(r.T1).toBeCloseTo(15.664887, 6);
    expect(r.T2).toBeCloseTo(r.T1, 10);
    expect(r.angleSommet).toBe(80);
    expect(r.rapport).toBeCloseTo(facteurElingue(80), 10);
  });

  it('brins dissymétriques et angle au sommet', () => {
    // α1 = 30°, α2 = 60° : T1 = 10 cos 60° / sin 90° = 5 kN ; T2 = 10 cos 30° = 8,660 kN (le brin le plus raide porte plus)
    const r = elingues({ P: 10, alpha1: 30, alpha2: 60 });
    expect(r.T1).toBeCloseTo(5, 10);
    expect(r.T2).toBeCloseTo(8.660254, 6);
    expect(facteurElingue(120)).toBeCloseTo(1, 12); // à 120° au sommet, chaque brin porte tout le poids
    expect(facteurElingue(60)).toBeCloseTo(1 / Math.sqrt(3), 12);
    expect(elingues({ P: 10, alpha1: 90, alpha2: 95 }).valide).toBe(false);
  });
});

describe('produit scalaire (N0.6.4)', () => {
  it('contrôle d’équerrage par coordonnées', () => {
    // AB = (12 ; 0,10), AD = (−0,10 ; 8) ; AB · AD = −1,2 + 0,8 = −0,40 m²
    // cos θ = −0,40 / (12,000 4 × 8,000 6) = −0,004 166 → θ = 90,238 7° ; D à déplacer de 8 × tan 0,238 7° = 3,33 cm
    const r = equerrage(EXEMPLE_EQUERRAGE);
    expect(r.produit).toBeCloseTo(-0.4, 10);
    expect(r.theta).toBeCloseTo(90.238706, 5);
    expect(r.ecart).toBeCloseTo(0.238706, 5);
    expect(r.decalage).toBeCloseTo(0.033332, 5);
  });

  it('travail d’une force', () => {
    // treuil : 2 kN incliné de 25° sur le déplacement de 15 m : W = 2 × 15 × cos 25° = 27,19 kJ
    expect(travail(depuisPolaire(2, 25), [15, 0])).toBeCloseTo(27.189234, 5);
    expect(travail([0, -10], [5, 0])).toBe(0); // une force perpendiculaire au déplacement ne travaille pas
  });
});

describe('moment d’une force (N0.6.5)', () => {
  it('le hauban en tête du mât', () => {
    // A(0 ; 8), F = (7,2 ; −9,6) : M = x Fy − y Fx = 0 − 8 × 7,2 = −57,6 kN·m (sens horaire)
    // bras de levier 57,6 / 12 = 4,80 m = distance du pied à la droite (AB) : 48 / √(8² + 6²)
    const r = momentForce(EXEMPLE_MOMENT);
    expect(r.M).toBeCloseTo(-57.6, 10);
    expect(r.bras).toBeCloseTo(4.8, 10);
    expect(r.sens).toBe('horaire');
    expect(moment2D([0, 0], [3, 0], [0, 2])).toBe(6); // force verticale vers le haut à droite : sens trigonométrique
    expect(momentForce({ xA: 0, yA: 5, F: 10, theta: 90 }).sens).toBe('nul'); // ligne d'action passant par O
  });

  it('la potence en 3D', () => {
    // r = (2 ; 0 ; 5), F = (0 ; 0,4 ; −1,2) : M = (0 × (−1,2) − 5 × 0,4 ; 5 × 0 − 2 × (−1,2) ; 2 × 0,4 − 0 × 0) = (−2 ; 2,4 ; 0,8) kN·m
    const p = potence(EXEMPLE_POTENCE);
    expect(p.M[0]).toBeCloseTo(-2, 12);
    expect(p.M[1]).toBeCloseTo(2.4, 12);
    expect(p.M[2]).toBeCloseTo(0.8, 12);
    expect(p.flexion).toBeCloseTo(Math.sqrt(9.76), 12);
    expect(p.torsion).toBeCloseTo(0.8, 12);
  });
});

describe('mât haubané (N0.6.P)', () => {
  it('effort dirigé à l’opposé d’un ancrage : un seul hauban travaille', () => {
    // L = √(12² + 8²) = √208 = 14,422 m ; tan α = 12/8 → α = 56,310°
    // H = 2,5 kN vers 270° : retenu par le hauban dirigé vers 90° ; T = 2,5 × 14,422 / 8 = 4,507 kN ; V = 2,5 × 12/8 = 3,75 kN
    const r = matHaubane(EXEMPLE_MAT);
    expect(r.L).toBeCloseTo(14.422205, 6);
    expect(r.alpha).toBeCloseTo(56.309932, 6);
    expect(r.haubans.map((h) => h.phi)).toEqual([90, 210, 330]);
    expect(r.haubans[0]!.T).toBeCloseTo(4.506939, 6);
    expect(r.haubans[0]!.V).toBeCloseTo(3.75, 10);
    expect(r.haubans[1]!.T).toBeCloseTo(0, 10);
    expect(r.N).toBeCloseTo(3.75, 10);
    expect(r.residu).toBeCloseTo(0, 10);
    expect(r.cable).toBeCloseTo(46.266615, 6); // 3 × (14,422 + 1)
  });

  it('effort oblique : deux haubans travaillent', () => {
    // ψ = 240° : les haubans doivent fournir 2,5 kN vers 60°, entre les ancrages à 330° et à 90° (120° d'écart)
    // c330 = 2,5 sin 30° / sin 120° = 1,443 kN ; c90 = 2,5 sin 90° / sin 120° = 2,887 kN
    // T90 = 2,887 × 14,422 / 8 = 5,204 kN ; N = (1,443 + 2,887) × 1,5 = 6,495 kN
    const r = matHaubane({ ...EXEMPLE_MAT, psi: 240 });
    expect(r.haubans[2]!.c).toBeCloseTo(1.443376, 6);
    expect(r.haubans[0]!.c).toBeCloseTo(2.886751, 6);
    expect(r.haubans[0]!.T).toBeCloseTo(5.204165, 6);
    expect(r.N).toBeCloseTo(6.495191, 6);
    expect(r.residu).toBeCloseTo(0, 10);
  });

  it('cas le plus défavorable et stabilité', () => {
    // maximum quand l'autre hauban actif est perpendiculaire à l'effort : T = H / (sin 120° cos α) = 5,204 kN, soit +15,5 %
    const e = enveloppeMat(EXEMPLE_MAT);
    expect(e.Tmax).toBeCloseTo(5.204165, 6);
    expect(e.psiMax).toBe(240);
    expect(e.parHauban.map((x) => x.psi)).toEqual([240, 0, 120]);
    // deux câbles seulement, à 120° : un effort dans le grand secteur vide ne peut pas être retenu
    expect(repartirSurCables([0, 120], 240, 1)).toBeNull();
    // effort sur la bissectrice de deux câbles à 120° : chacun reprend sin 60° / sin 120° = 1 fois l'effort (comme l'élingue à 120°)
    expect(repartirSurCables([0, 120], 60, 1)![0]).toBeCloseTo(1, 12);
  });
});
