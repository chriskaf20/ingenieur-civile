import { describe, expect, it } from 'vitest';
import { cercleMohr } from './rdm';
import { troisAppuis, EXEMPLE_TROIS_APPUIS } from './statique';
import {
  CAS_RANG,
  chargeVersant,
  contraintesPrincipales,
  determinant,
  deuxBarres,
  echelonne,
  EXEMPLE_APPUIS_TRIANGLE,
  EXEMPLE_CONTRAINTES,
  EXEMPLE_DEUX_BARRES,
  EXEMPLE_METRE,
  EXEMPLE_TRIANGLE,
  identite,
  inverse,
  inverseTroisAppuis,
  jacobiSym3,
  melangeGranulats,
  metre,
  natureSysteme,
  noeudBarres,
  pivotGauss,
  plateauRang,
  produit,
  produitVecteur,
  raideurBarre,
  rotation2,
  rotation3,
  sarrus,
  somme,
  transposee,
  treillisMatriciel,
  TROISIEME_BARRE,
  valeursPropres2,
  versGlobal,
  versLocal,
} from './lineaire';

describe('opérations sur les matrices', () => {
  it('somme, produit, transposée', () => {
    // [[1, 2], [3, 4]] × [[5, 6], [7, 8]] = [[1×5 + 2×7, 1×6 + 2×8], [3×5 + 4×7, 3×6 + 4×8]] = [[19, 22], [43, 50]]
    expect(produit([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[19, 22], [43, 50]]);
    expect(produit([[5, 6], [7, 8]], [[1, 2], [3, 4]])).toEqual([[23, 34], [31, 46]]); // AB ≠ BA
    expect(somme([[1, 2]], [[3, 4]])).toEqual([[4, 6]]);
    expect(transposee([[1, 2, 3]])).toEqual([[1], [2], [3]]);
    expect(produit([[2, 3], [1, 4]], identite(2))).toEqual([[2, 3], [1, 4]]);
    expect(() => produit([[1, 2]], [[1, 2]])).toThrow();
  });
  it('métré matriciel', () => {
    // béton : 8 × 0,5 + 8 × 0,27 + 6 × 0,5 = 9,16 m³ ; acier : 8 × 25 + 8 × 40 + 6 × 60 = 880 kg ; coffrage : 16 + 28,8 + 30 = 74,8 m²
    // coût : 9,16 × 150 + 880 × 1,6 + 74,8 × 12 = 1 374 + 1 408 + 897,6 = 3 679,6 USD
    const m = metre(EXEMPLE_METRE.n);
    expect(m.totaux[0]).toBeCloseTo(9.16, 9);
    expect(m.totaux[1]).toBeCloseTo(880, 9);
    expect(m.totaux[2]).toBeCloseTo(74.8, 9);
    expect(m.cout).toBeCloseTo(3679.6, 9);
  });
});

describe('pivot de Gauss', () => {
  it('système 2 × 2 avec échange de lignes', () => {
    // 0x + y = 2 et x + y = 3 : pivot nul, échange, puis x = 1, y = 2
    const g = pivotGauss([[0, 1], [1, 1]], [2, 3]);
    expect(g.x).toEqual([1, 2]);
    expect(g.etapes.some((e) => e.type === 'echange')).toBe(true);
  });
  it('mélange de granulats', () => {
    // x + y + z = 1 ; 0,95 x + 0,10 y = 0,40 ; x + 0,90 y + 0,15 z = 0,65
    // z = 1 − x − y donne 0,85 x + 0,75 y = 0,50 ; avec x = (0,40 − 0,10 y) / 0,95 : y = 0,215139, x = 0,398406, z = 0,386454
    const m = melangeGranulats(0.4, 0.65);
    expect(m.x![0]).toBeCloseTo(0.398406, 6);
    expect(m.x![1]).toBeCloseTo(0.215139, 6);
    expect(m.x![2]).toBeCloseTo(0.386454, 6);
    expect(m.etapes.length).toBe(3); // départ, colonne 1, colonne 2
    // la matrice finale est triangulaire supérieure
    const T = m.etapes[2]!.M;
    expect(T[1]![0]).toBe(0);
    expect(T[2]![0]).toBe(0);
    expect(T[2]![1]).toBe(0);
  });
  it('système sans solution unique', () => {
    expect(pivotGauss([[1, 2], [2, 4]], [3, 6]).x).toBeNull();
  });
});

describe('déterminant et inverse', () => {
  it('déterminant', () => {
    // Sarrus : 2×3×2 + 1×1×0 + 0×1×1 − (0×3×0 + 2×1×1 + 1×1×2) = 12 − 4 = 8
    const A = [[2, 1, 0], [1, 3, 1], [0, 1, 2]];
    expect(determinant(A)).toBeCloseTo(8, 12);
    expect(sarrus(A).det).toBeCloseTo(8, 12);
    expect(determinant([[1, 2], [2, 4]])).toBe(0);
  });
  it('inverse', () => {
    // [[4, 7], [2, 6]]⁻¹ = (1/10) [[6, −7], [−2, 4]]
    const inv = inverse([[4, 7], [2, 6]])!;
    expect(inv[0]![0]).toBeCloseTo(0.6, 12);
    expect(inv[0]![1]).toBeCloseTo(-0.7, 12);
    expect(inv[1]![0]).toBeCloseTo(-0.2, 12);
    const AI = produit([[4, 7], [2, 6]], inv);
    expect(AI.map((ligne) => ligne.map((v) => Math.round(v * 1e12) / 1e12))).toEqual(identite(2));
    expect(inverse([[1, 2], [2, 4]])).toBeNull();
  });
  it('plateau sur trois appuis par la matrice inverse', () => {
    // det M = 1 × (4 × 3,5 − 2 × 0) − 1 × (0 × 3,5 − 2 × 0) + 1 × 0 = 14 = 2 × aire (base 4, hauteur 3,5)
    // 240 kN en (2 ; 1,5) : R_C = 240 × 1,5 / 3,5 = 102,857 ; R_B = (480 − 2 R_C) / 4 = 68,571 ; R_A = 68,571 kN
    const t = inverseTroisAppuis(EXEMPLE_APPUIS_TRIANGLE, 240, 2, 1.5);
    expect(t.det).toBeCloseTo(14, 12);
    expect(t.aire).toBeCloseTo(7, 12);
    expect(t.R![2]).toBeCloseTo(102.857143, 6);
    expect(t.R![1]).toBeCloseTo(68.571429, 6);
    expect(t.R![0]).toBeCloseTo(68.571429, 6);
    // même résultat que la résolution directe de L1.3.12
    const s = troisAppuis({ appuis: EXEMPLE_TROIS_APPUIS.appuis, charges: [{ nom: 'cuve', x: 2, y: 1.5, F: 240 }] })!;
    expect(s.R[2]).toBeCloseTo(t.R![2]!, 9);
  });
});

describe('rang', () => {
  it('forme échelonnée et rang', () => {
    expect(echelonne([[1, 2, 3], [2, 4, 6], [1, 0, 1]]).rang).toBe(2);
    expect(echelonne(identite(3)).rang).toBe(3);
  });
  it('les trois cas de plateau', () => {
    const n = (id: string) => {
      const c = CAS_RANG.find((x) => x.id === id)!;
      return natureSysteme(c.A, c.b);
    };
    expect(n('triangle').nature).toBe('unique');
    expect(n('alignesSur')).toMatchObject({ rangA: 2, rangAb: 2, nature: 'infinite' });
    expect(n('alignesHors')).toMatchObject({ rangA: 2, rangAb: 3, nature: 'aucune' });
  });
  it('plateau dont on déplace l’appui C', () => {
    // C en (2 ; 3,5), 100 kN en (2 ; 1) : R_C = 100 × 1 / 3,5 = 28,571 kN ; 4 R_B + 2 R_C = 200, donc R_B = 35,714 kN ; R_A = 35,714 kN
    const p = plateauRang(3.5, 100, 2, 1);
    expect(p.nature).toBe('unique');
    expect(p.R![2]).toBeCloseTo(28.571429, 6);
    expect(p.R![1]).toBeCloseTo(35.714286, 6);
    expect(p.R![0]).toBeCloseTo(35.714286, 6);
    expect(plateauRang(0, 100, 1.5, 0).nature).toBe('infinite');
    const h = plateauRang(0, 100, 1.5, 0.8);
    expect(h.nature).toBe('aucune');
    expect(h.R).toBeNull();
  });
});

describe('rotations et changement de repère', () => {
  it('poids sur un versant à 30°', () => {
    // R(30°) = [[0,866, −0,5], [0,5, 0,866]] ; local = Rᵀ (0 ; −2) = (−2 sin 30° ; −2 cos 30°) = (−1 ; −1,732051)
    const r = rotation2(30);
    expect(r[0]![1]).toBeCloseTo(-0.5, 12);
    const l = versLocal([0, -2], 30);
    expect(l[0]).toBeCloseTo(-1, 12);
    expect(l[1]).toBeCloseTo(-1.732051, 6);
    const g = versGlobal(l, 30);
    expect(g[0]).toBeCloseTo(0, 12);
    expect(g[1]).toBeCloseTo(-2, 12);
    // une rotation conserve les longueurs : R Rᵀ = I
    expect(produit(r, transposee(r)).map((ligne) => ligne.map((v) => Math.round(v * 1e12) / 1e12))).toEqual(identite(2));
  });
  it('rotation autour de z dans l’espace', () => {
    // rotation de 90° autour de z : (1 ; 0 ; 0) devient (0 ; 1 ; 0)
    expect(produitVecteur(rotation3('z', 90), [1, 0, 0])).toEqual([0, 1, 0]);
  });
});

describe('valeurs propres', () => {
  it('contraintes principales = valeurs propres du tenseur', () => {
    // σx = 2, σy = 0, τ = 1,5 : λ = 1 ± √(1 + 2,25) = 2,802776 et −0,802776 ; direction de σ1 : atan(0,802776 / 1,5) = 28,155°
    const c = contraintesPrincipales(EXEMPLE_CONTRAINTES);
    expect(c.s1).toBeCloseTo(2.802776, 6);
    expect(c.s2).toBeCloseTo(-0.802776, 6);
    expect(c.theta1).toBeCloseTo(28.155, 3);
    const m = cercleMohr(2, 0, 1.5);
    expect(c.s1).toBeCloseTo(m.s1, 12);
    expect(c.theta1).toBeCloseTo(m.angleP, 9);
    // A v = λ v
    const Av = produitVecteur(c.T, c.v1);
    expect(Av[0]).toBeCloseTo(c.s1 * c.v1[0]!, 9);
    expect(Av[1]).toBeCloseTo(c.s1 * c.v1[1]!, 9);
  });
  it('valeurs propres complexes', () => {
    expect(valeursPropres2([[0, -1], [1, 0]])).toBeNull(); // rotation de 90° : aucune direction invariante
  });
  it('Jacobi 3 × 3', () => {
    // bloc [[4, 1], [1, 3]] : (7 ± √5) / 2 = 4,618034 et 2,381966 ; troisième valeur 2
    const j = jacobiSym3([[4, 1, 0], [1, 3, 0], [0, 0, 2]]);
    expect(j.valeurs[0]).toBeCloseTo(4.618034, 6);
    expect(j.valeurs[1]).toBeCloseTo(2.381966, 6);
    expect(j.valeurs[2]).toBeCloseTo(2, 9);
  });
});

describe('K u = F : deux tirants', () => {
  it('raideur d’une barre', () => {
    // k = 210 × 10⁶ kN/m² × 3 × 10⁻⁴ m² / 3 m = 21 000 kN/m ; sous 10 kN, ΔL = 10 / 21 000 = 0,476 mm
    expect(raideurBarre(210, 3, 3)).toBeCloseTo(21000, 9);
    expect((10 / raideurBarre(210, 3, 3)) * 1000).toBeCloseTo(0.476190, 6);
  });
  it('rigidité, déplacement et efforts', () => {
    // L = √13 = 3,605551 m ; k = 210 × 10⁶ × 3 × 10⁻⁴ / 3,605551 = 17 473,06 kN/m
    // K = [[2 k c², 0], [0, 2 k s²]] avec c² = 9/13, s² = 4/13 : K22 = 10 752,65 kN/m ; u_y = −20 / 10 752,65 = −1,86 mm
    // N = k (u · e) = 18,0278 kN, égal à l'équilibre du nœud : 20 / (2 × 2/√13)
    const r = deuxBarres(EXEMPLE_DEUX_BARRES);
    expect(r.barres[0].k).toBeCloseTo(17473.056181, 5);
    expect(r.K[1]![1]).toBeCloseTo(10752.649958, 5);
    expect(r.K[0]![1]).toBeCloseTo(0, 9);
    expect(r.u![1]).toBeCloseTo(-0.00186, 7);
    expect(r.N![0]).toBeCloseTo(18.027756, 5);
    expect(r.N![1]).toBeCloseTo(18.027756, 5);
    expect(r.statique![0]).toBeCloseTo(r.N![0]!, 9);
  });
});

describe('charge d’une panne sur un versant', () => {
  it('composantes le long de la pente et perpendiculaires', () => {
    // q = 2 kN/m vertical, α = 30° : q sin α = 1 kN/m le long de la pente, q cos α = 1,732 kN/m perpendiculaire ; la norme reste 2 kN/m
    const c = chargeVersant(2, 30);
    expect(c.qPente).toBeCloseTo(1, 12);
    expect(c.qNormale).toBeCloseTo(1.732051, 6);
    expect(c.norme).toBeCloseTo(2, 12);
    expect(c.retour[1]).toBeCloseTo(-2, 12);
  });
});

describe('nœud hyperstatique à trois barres', () => {
  it('la charge va vers la barre la plus raide', () => {
    // barre verticale : k3 = 210 × 10⁶ × 3 × 10⁻⁴ / 2 = 31 500 kN/m ; K22 = 10 752,65 + 31 500 = 42 252,65 kN/m
    // u_y = −20 / 42 252,65 = −0,473 mm ; N3 = 31 500 × 0,000473 = 14,91 kN ; N1 = N2 = 17 473,06 × 0,000473 × 2/√13 = 4,588 kN
    // contrôle : 2 × 4,588 × 2/√13 + 14,91 = 20 kN
    const d = EXEMPLE_DEUX_BARRES;
    const r = noeudBarres(d.E, [{ x: d.xA, y: d.yA, A: d.A1 }, { x: d.xB, y: d.yB, A: d.A2 }, TROISIEME_BARRE], d.Fx, d.Fy);
    expect(r.K[1]![1]).toBeCloseTo(42252.649958, 5);
    expect(r.N![2]).toBeCloseTo(14.910307, 5);
    expect(r.N![0]).toBeCloseTo(4.587787, 5);
    const s = 2 / Math.sqrt(13);
    expect(r.N![0]! * s + r.N![1]! * s + r.N![2]!).toBeCloseTo(20, 9);
  });
});

describe('treillis triangulaire résolu par matrices', () => {
  it('système 6 × 6, solution et superposition', () => {
    // moments en A : 6 R_By = 10 × 3 + 3 × 2, donc R_By = 6 kN ; R_Ay = 10 − 6 = 4 kN ; R_Ax = −3 kN
    // nœud C : N_AC + N_BC = −5 √13 et N_BC − N_AC = −√13, donc N_AC = −7,211 kN et N_BC = −10,817 kN
    // nœud A : N_AB = 3 − N_AC × 3/√13 = 9 kN
    const t = treillisMatriciel(EXEMPLE_TRIANGLE);
    expect(t.A.length).toBe(6);
    expect(t.det).toBeCloseTo(-12 / 13, 9);
    const attendu = [9, -7.211103, -10.816654, -3, 4, 6];
    attendu.forEach((v, i) => expect(t.s![i]).toBeCloseTo(v, 6));
    expect(t.RByMoments).toBeCloseTo(t.s![5]!, 9);
    // s = P s₁ + W s₂
    t.s!.forEach((v, i) => expect(10 * t.s1![i]! + 3 * t.s2![i]!).toBeCloseTo(v, 9));
  });
});
