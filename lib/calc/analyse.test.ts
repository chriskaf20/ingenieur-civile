import { describe, expect, it } from 'vitest';
import {
  betaCCInfini,
  binome,
  canalOptimal,
  chargeExponentielle,
  contrainteFlexion,
  chargeVariable,
  coutMoyen,
  cubature,
  cuveConique,
  cylindreDerivees,
  deriveePolynome,
  differentielleVolume,
  disque,
  evaluerPolynome,
  integraleDoubleRectangle,
  integraleExp,
  moduleTronc,
  monteeCone,
  penteDirectionnelle,
  poutreTronc,
  rationnelle,
  rayonHydraulique,
  EXEMPLE_BANDES,
  EXEMPLE_CABLE,
  EXEMPLE_CHARGE_VARIABLE,
  EXEMPLE_CUBATURE,
  EXEMPLE_CUVE_CONIQUE,
  EXEMPLE_FLECHE,
  EXEMPLE_MOMENT_MAX,
  EXEMPLE_RACCORDEMENT,
  EXEMPLE_SECTION_T,
  EXEMPLE_TERRAIN,
  EXEMPLE_VENT_PUISSANCE,
  flecheLimite,
  flechePoutre,
  huygens,
  inertieParBandes,
  inertieTriangleDouble,
  integralePolynome,
  integraleXExp,
  longueurCable,
  momentMax,
  penteSecante,
  perimetreCanal,
  petitAngle,
  polygoneInscrit,
  raccordement,
  rectanglesMilieu,
  sectionTInertie,
  sensibiliteFleche,
  simpson,
  sinusSurX,
  tableLimite,
  terrain,
  trapezes,
  triangleIntegre,
  ventPuissance,
} from './analyse';

describe('limites', () => {
  it('sin x / x tend vers 1 en 0', () => {
    const t = tableLimite((x) => Math.sin(x) / x, 0, [1, 2, 3]);
    expect(t[0]!.droite).toBeCloseTo(0.998334, 6); // sin(0,1) / 0,1
    expect(t[2]!.droite).toBeCloseTo(1, 6);
    expect(t[2]!.gauche).toBeCloseTo(1, 6);
  });

  it('polygones inscrit et circonscrit encadrent π', () => {
    // hexagone : périmètre / diamètre = 6 sin 30° = 3 ; circonscrit : 6 tan 30° = 2√3 = 3,464
    const p6 = polygoneInscrit(6);
    expect(p6.inscrit).toBeCloseTo(3, 12);
    expect(p6.circonscrit).toBeCloseTo(3.464102, 6);
    // 96 côtés (Archimède) : 3,141 03 ; écart 5,6 × 10⁻⁴
    const p96 = polygoneInscrit(96);
    expect(p96.inscrit).toBeCloseTo(3.141032, 6);
    expect(p96.ecart).toBeCloseTo(0.000561, 6);
    expect(p96.inscrit < Math.PI && Math.PI < p96.circonscrit).toBe(true);
  });
});

describe('dérivées', () => {
  it('raccordement parabolique d’un profil en long', () => {
    // p1 = 4 %, p2 = −2 %, L = 120 m : z(30) = 300 + 1,2 − 0,06 × 900 / 240 = 300,975 m
    // pente : 0,04 − 0,06 × 30 / 120 = 0,025 ; sécante sur 10 m : (z(40) − z(30)) / 10 = 0,0225
    // sommet : x = 0,04 × 120 / 0,06 = 80 m, z = 301,6 m
    const r = raccordement(EXEMPLE_RACCORDEMENT);
    expect(r.z).toBeCloseTo(300.975, 9);
    expect(r.pente).toBeCloseTo(0.025, 12);
    expect(r.secante).toBeCloseTo(0.0225, 9);
    expect(r.ecart).toBeCloseTo(-0.0025, 9);
    expect(r.xSommet).toBeCloseTo(80, 9);
    expect(r.zSommet).toBeCloseTo(301.6, 9);
    expect(raccordement({ ...EXEMPLE_RACCORDEMENT, p1: 2, p2: 4 }).xSommet).toBeNull(); // pente toujours positive
  });

  it('sécantes et polynômes', () => {
    // (x²)' en 3 : sécante centrée exacte pour un polynôme de degré 2
    expect(penteSecante((x) => x * x, 3, 0.5).centree).toBeCloseTo(6, 12);
    expect(evaluerPolynome([1, -3, 0, 2], 2)).toBe(11); // 1 − 6 + 16
    expect(deriveePolynome([1, -3, 0, 2])).toEqual([-3, 0, 6]); // (1 − 3x + 2x³)' = −3 + 6x²
  });

  it('flèche et rotation d’une poutre sur deux appuis', () => {
    // I = 0,25 × 0,5³ / 12 = 2,604 × 10⁻³ m⁴ ; EI = 31 × 10⁶ × I = 80 729 kN·m²
    // θ(0) = qL³ / (24 EI) = 15 × 216 / 1 937 500 = 1,672 × 10⁻³ rad ; y(L/2) = 5qL⁴ / (384 EI) = 3,135 mm
    const r = flechePoutre(EXEMPLE_FLECHE);
    expect(r.EI).toBeCloseTo(80729.166667, 4);
    expect(r.theta0).toBeCloseTo(0.00167226, 8);
    expect(r.yMax).toBeCloseTo(0.00313548, 8);
    expect(r.y).toBeCloseTo(0.00223403, 8);
    expect(r.theta).toBeCloseTo(0.00114968, 8);
    expect(r.fp(EXEMPLE_FLECHE.L / 2)).toBeCloseTo(0, 12); // tangente horizontale à mi-portée
  });
});

describe('extremums', () => {
  it('moment maximal : là où l’effort tranchant s’annule', () => {
    // RA = 10 × 8 / 2 + 30 × 6 / 8 = 62,5 kN ; V juste avant 2 m : 42,5 ; juste après : 12,5 > 0
    // V = 0 en x = (62,5 − 30) / 10 = 3,25 m ; M = 62,5 × 3,25 − 5 × 3,25² − 30 × 1,25 = 112,8125 kN·m
    const r = momentMax(EXEMPLE_MOMENT_MAX);
    expect(r.RA).toBeCloseTo(62.5, 12);
    expect(r.RB).toBeCloseTo(47.5, 12);
    expect(r.x0).toBeCloseTo(3.25, 12);
    expect(r.Mmax).toBeCloseTo(112.8125, 9);
    // charge ponctuelle seule au milieu : M = PL/4 au droit de la charge
    expect(momentMax({ L: 6, q: 0, P: 20, a: 3 }).Mmax).toBeCloseTo(30, 12);
    // charge uniforme seule : qL²/8 à mi-portée
    expect(momentMax({ L: 6, q: 10, P: 0, a: 2 }).Mmax).toBeCloseTo(45, 12);
  });

  it('canal de périmètre mouillé minimal', () => {
    // A = 2 m² : h = 1 m, b = 2 m, P = 4 m
    expect(canalOptimal(2)).toEqual({ h: 1, b: 2, P: 4 });
  });
});

describe('approximations', () => {
  it('petits angles', () => {
    // 10° = 0,174 53 rad ; sin = 0,173 65 : erreur de sin α ≈ α de 0,51 %
    const r = petitAngle(10);
    expect(r.rad).toBeCloseTo(0.174533, 6);
    expect(r.erreurSin).toBeCloseTo(0.005095, 6);
    expect(r.erreurTan).toBeCloseTo(0.010175, 6);
    expect(Math.abs(r.erreurCos)).toBeLessThan(1e-4);
  });

  it('longueur d’un câble parabolique', () => {
    // l = 200 m, f = 6 m : approchée 200 (1 + 8 × 36 / 120 000) = 200,48 m ; exacte 200,478 97 m
    const r = longueurCable(EXEMPLE_CABLE);
    expect(r.approchee).toBeCloseTo(200.48, 10);
    expect(r.exacte).toBeCloseTo(200.478968, 6);
    expect(r.ecart).toBeCloseTo(0.0010315, 6);
  });

  it('binôme', () => {
    // 1,02³ = 1,061 208 ; approché 1 + 3 × 0,02 = 1,06
    const r = binome(0.02, 3);
    expect(r.exact).toBeCloseTo(1.061208, 9);
    expect(r.approche).toBeCloseTo(1.06, 12);
  });
});

describe('intégrales', () => {
  it('polynômes et méthodes numériques', () => {
    expect(integralePolynome([0, 0, 3], 0, 2)).toBeCloseTo(8, 12); // ∫ 3x² = 8
    expect(rectanglesMilieu((x) => x * x, 0, 1, 2)).toBeCloseTo(0.3125, 12); // (0,25² + 0,75²) / 2
    expect(trapezes((x) => x * x, 0, 1, 2)).toBeCloseTo(0.375, 12); // (0 + 2 × 0,25 + 1) / 4
    expect(simpson((x) => x ** 3, 0, 2, 2)).toBeCloseTo(4, 12); // Simpson exact au degré 3
  });

  it('charge répartie variable', () => {
    // q = 4 + 1,5 x sur 6 m : R = 24 + 27 = 51 kN ; ∫ x q = 72 + 108 = 180 ; x̄ = 180 / 51 = 3,529 m
    const r = chargeVariable(EXEMPLE_CHARGE_VARIABLE);
    expect(r.R).toBeCloseTo(51, 12);
    expect(r.xBarre).toBeCloseTo(3.529412, 6);
    expect(r.ecart).toBeCloseTo(0, 10); // rectangles au milieu exacts pour une charge linéaire
    const p = chargeVariable({ ...EXEMPLE_CHARGE_VARIABLE, c1: 0, c2: 0.5, n: 3 }); // q = 4 + 0,5 x²
    expect(p.R).toBeCloseTo(60, 12); // 24 + 0,5 × 216 / 3
    // rectangles au milieu (x = 1, 3, 5 ; largeur 2) : 2 × [3 × 4 + 0,5 × (1 + 9 + 25)] = 59 kN, soit −1 kN ;
    // c'est l'erreur théorique −(b − a) h² q'' / 24 = −6 × 4 × 1 / 24 = −1 kN
    expect(p.ecart).toBeCloseTo(-1, 10);
  });

  it('par parties et changement de variable', () => {
    // ∫₀⁴ x e^(−x/2) dx = [−2x e^(−x/2) − 4 e^(−x/2)]₀⁴ = −8e⁻² − 4e⁻² + 4 = 4 − 12 e⁻² = 2,375 98
    expect(integraleXExp(0, 4, 2)).toBeCloseTo(2.375977, 6);
    // vent : F = 0,8 × 30^1,2 / (1,2 × 10^0,2) = 24,915 kN ; z̄ = 1,2 × 30 / 2,2 = 16,36 m
    const v = ventPuissance(EXEMPLE_VENT_PUISSANCE);
    expect(v.F).toBeCloseTo(24.914619, 5);
    expect(v.M).toBeCloseTo(407.693762, 5);
    expect(v.zBarre).toBeCloseTo(16.363636, 6);
    expect(Math.abs(v.Fsimpson - v.F) / v.F).toBeLessThan(1e-3);
  });
});

describe('aires, inerties, volumes', () => {
  it('inertie par bandes et Huygens', () => {
    // b = 20, h = 50 : I = 20 × 50³ / 12 = 208 333 cm⁴ ; 5 bandes : 200 000 cm⁴ (−4 %)
    const r = inertieParBandes(EXEMPLE_BANDES);
    expect(r.Iexact).toBeCloseTo(208333.333333, 5);
    expect(r.In).toBeCloseTo(200000, 6);
    expect(r.ecartRelatif).toBeCloseTo(-0.04, 10);
    expect(r.IbaseHuygens).toBeCloseTo(r.Ibase, 6); // b h³/12 + b h (h/2)² = b h³/3
    expect(huygens(10, 2, 3)).toBe(28);
  });

  it('triangle et intégrale double', () => {
    // b = 30, h = 45 : A = 675 cm², yG = 15 cm, Ibase = b h³ / 12 = 227 812,5 cm⁴, IG = b h³ / 36 = 75 937,5 cm⁴
    const t = triangleIntegre(30, 45);
    expect(t.A).toBe(675);
    expect(t.yG).toBe(15);
    expect(t.Ibase).toBeCloseTo(227812.5, 9);
    expect(t.IG).toBeCloseTo(75937.5, 9);
    expect(inertieTriangleDouble(30, 45)).toBeCloseTo(227812.5, -1); // quadrillage fin : écart < 1 cm⁴
  });

  it('volume d’une cuve par révolution', () => {
    // tronc de cône (h 1,5 ; R 2,5 ; r 0,5) : π × 1,5 × (6,25 + 1,25 + 0,25) / 3 = 12,174 ; cylindre π × 6,25 × 3 = 58,905 ; total 71,079 m³
    const c = cuveConique(EXEMPLE_CUVE_CONIQUE);
    expect(c.Vformules).toBeCloseTo(71.078534, 6);
    expect(c.Vintegre).toBeCloseTo(c.Vformules, 8);
  });
});

describe('fonctions de plusieurs variables', () => {
  it('gradient d’un terrain', () => {
    // z = 320 + 0,03 x − 0,02 y + 0,002 y² en (40 ; 25) : 321,95 m ; ∂z/∂x = 0,03 ; ∂z/∂y = −0,02 + 0,1 = 0,08
    // plus forte pente √(0,03² + 0,08²) = 0,0854 ; l'eau descend vers −grad z : 249,44°
    const r = terrain(EXEMPLE_TERRAIN);
    expect(r.z).toBeCloseTo(321.95, 9);
    expect(r.zx).toBeCloseTo(0.03, 12);
    expect(r.zy).toBeCloseTo(0.08, 12);
    expect(r.pente).toBeCloseTo(0.08544, 5);
    expect(r.direction).toBeCloseTo(249.443955, 5);
  });

  it('cubature d’une plate-forme', () => {
    // altitude moyenne des coins : (101,2 + 100,4 + 100,8 + 99,6) / 4 = 100,5 m = niveau de la plate-forme : volume net nul
    // quadrillage 120 × 120 : 84,22 m³ de déblai et autant de remblai
    const r = cubature(EXEMPLE_CUBATURE);
    expect(r.zMoyen).toBeCloseTo(100.5, 12);
    expect(r.Vnet).toBeCloseTo(0, 9);
    expect(r.Vdeblai).toBeCloseTo(84.219884, 5);
    expect(r.Vremblai).toBeCloseTo(84.219884, 5);
    const bas = cubature({ ...EXEMPLE_CUBATURE, zp: 100 }); // plate-forme 0,5 m plus bas : déblai net 600 × 0,5 = 300 m³
    expect(bas.Vnet).toBeCloseTo(300, 9);
    expect(bas.Vdeblai - bas.Vremblai).toBeCloseTo(300, 6);
  });
});

describe('section en T', () => {
  it('aire, centre de gravité et inertie', () => {
    // âme 20 × 38 = 760 cm² à 19 cm ; table 60 × 12 = 720 cm² à 44 cm ; A = 1 480 cm²
    // yG = (760 × 19 + 720 × 44) / 1 480 = 31,162 cm
    // IG = 20 × 38³/12 + 760 × 12,162² + 60 × 12³/12 + 720 × 12,838² = 331 174 cm⁴
    const r = sectionTInertie(EXEMPLE_SECTION_T);
    expect(r.A).toBeCloseTo(1480, 9);
    expect(r.yG).toBeCloseTo(31.162162, 6);
    expect(r.IG).toBeCloseTo(331174.414414, 4);
    expect(r.Iintegre).toBeCloseTo(r.IG, -1); // bandes fines : écart de quelques dixièmes de cm⁴
    expect(r.Winf).toBeCloseTo(10627.453, 3);
    expect(r.Wsup).toBeCloseTo(17580.277, 3);
  });
});

describe('limites : fonctions rationnelles et coût moyen', () => {
  it('forme indéterminée 0/0 et terme dominant', () => {
    // (x² − 4)/(x − 2) = x + 2 pour x ≠ 2 : en 2,1 on lit 4,1, et la limite en 2 vaut 4
    expect(rationnelle([-4, 0, 1], [-2, 1], 2.1)).toBeCloseTo(4.1, 9);
    expect(rationnelle([-4, 0, 1], [-2, 1], 2 + 1e-6)).toBeCloseTo(4, 5);
    // (3x² + 5x)/(x² + 1) en x = 1 000 : 3 005 000 / 1 000 001 = 3,004997
    expect(rationnelle([0, 5, 3], [1, 0, 1], 1000)).toBeCloseTo(3.004997, 6);
  });
  it('coût moyen : les frais fixes se diluent', () => {
    // 6 000 / 50 + 120 = 240 ; 6 000 / 5 000 + 120 = 121,2
    expect(coutMoyen(6000, 120, 50)).toBeCloseTo(240, 9);
    expect(coutMoyen(6000, 120, 5000)).toBeCloseTo(121.2, 9);
  });
});

describe('règles de dérivation : quotient et composée', () => {
  it('rayon hydraulique et sa dérivée', () => {
    // b = 2 m, h = 0,5 m : A = 1 m², P = 3 m, R = 1/3 m ; dR/dh = b²/(b + 2h)² = 4/9
    const r = rayonHydraulique(2, 0.5);
    expect(r.R).toBeCloseTo(1 / 3, 12);
    expect(r.dR).toBeCloseTo(4 / 9, 12);
    expect(penteSecante((h) => rayonHydraulique(2, h).R, 0.5, 1e-4).centree).toBeCloseTo(r.dR, 6);
  });
  it('vitesse de montée de l’eau dans un réservoir conique', () => {
    // k = 3/4 ; à h = 2 m : S = π × 0,5625 × 4 = 7,068583 m², V = S h / 3 = 4,712389 m³, dh/dt = 6 / 7,068583 = 0,848826 m/h
    const c = monteeCone(3, 4, 6, 2);
    expect(c.k).toBeCloseTo(0.75, 12);
    expect(c.S).toBeCloseTo(7.068583, 6);
    expect(c.V).toBeCloseTo(4.712389, 6);
    expect(c.dhdt).toBeCloseTo(0.848826, 6);
  });
});

describe('optimisation : poutre taillée dans un tronc', () => {
  it('b = D/√3 et h = D√(2/3) maximisent b h²/6', () => {
    // D = 30 cm : b = 17,3205 cm, h = 24,4949 cm, W = 17,3205 × 600 / 6 = 1 732,05 cm³
    // carré inscrit : a = 21,2132 cm, W = a³/6 = 1 590,99 cm³ ; gain 1,0887
    const t = poutreTronc(30);
    expect(t.b).toBeCloseTo(17.320508, 6);
    expect(t.h).toBeCloseTo(24.494897, 6);
    expect(t.W).toBeCloseTo(1732.050808, 6);
    expect(t.WCarre).toBeCloseTo(1590.990258, 6);
    expect(t.gain).toBeCloseTo(1.088662, 6);
    expect(moduleTronc(30, 16)).toBeLessThan(t.W);
    expect(moduleTronc(30, 18.5)).toBeLessThan(t.W);
  });
});

describe('dérivées partielles : pente directionnelle et différentielle', () => {
  it('pente dans une direction', () => {
    // à 45° : (0,03 + 0,08)/√2 = 0,077782
    expect(penteDirectionnelle(0.03, 0.08, 45)).toBeCloseTo(0.077782, 6);
    expect(penteDirectionnelle(0.03, 0.08, 90)).toBeCloseTo(0.08, 12);
  });
  it('incertitude sur un volume de dalle', () => {
    // 10 × 4 × 0,2 = 8 m³ ; dV = 0,8 × 0,02 + 2 × 0,02 + 40 × 0,01 = 0,456 m³ (5,7 %)
    // exact : 10,02 × 4,02 × 0,21 − 8 = 0,458884 m³
    const d = differentielleVolume(10, 4, 0.2, 0.02, 0.02, 0.01);
    expect(d.V).toBeCloseTo(8, 12);
    expect(d.dV).toBeCloseTo(0.456, 12);
    expect(d.relatif).toBeCloseTo(0.057, 12);
    expect(d.exact).toBeCloseTo(0.458884, 6);
  });
});

describe('intégrales doubles : rectangle et disque', () => {
  it('point milieu sur un rectangle', () => {
    // ∬ x y sur [0, 2] × [0, 3] = (2²/2)(3²/2) = 9, exact pour une fonction bilinéaire
    expect(integraleDoubleRectangle((x, y) => x * y, 0, 2, 0, 3, 10)).toBeCloseTo(9, 9);
    // ∬ (x² + y²) sur [0, 1]² = 2/3, à 1/(6 n²) près
    expect(integraleDoubleRectangle((x, y) => x * x + y * y, 0, 1, 0, 1, 200)).toBeCloseTo(2 / 3, 5);
  });
  it('disque', () => {
    // R = 0,2 m : A = 0,125664 m², I = π R⁴/4 = 1,256637 × 10⁻³ m⁴, J = 2 I
    const d = disque(0.2);
    expect(d.A).toBeCloseTo(0.125664, 6);
    expect(d.I).toBeCloseTo(0.001256637, 9);
    expect(d.J).toBeCloseTo(2 * d.I, 12);
    // contrôle en coordonnées polaires : ∬ (r sin θ)² r dr dθ
    expect(integraleDoubleRectangle((r, t) => (r * Math.sin(t)) ** 2 * r, 0, 0.2, 0, 2 * Math.PI, 200)).toBeCloseTo(d.I, 7); // écart du point milieu ≈ 1,6 × 10⁻⁸ m⁴
  });
});

describe('limites remarquables', () => {
  it('sin x / x tend vers 1 en 0', () => {
    // sin(0,1)/0,1 = 0,998334 ; non définie en 0
    expect(sinusSurX(0.1)).toBeCloseTo(0.998334, 6);
    expect(sinusSurX(1e-6)).toBeCloseTo(1, 10);
    expect(Number.isNaN(sinusSurX(0))).toBe(true);
  });
  it('βcc tend vers e^s', () => {
    // s = 0,25 : e^0,25 = 1,284025
    expect(betaCCInfini(0.25)).toBeCloseTo(1.284025, 6);
  });
});

describe('flèche limite', () => {
  it('portée / 250 et portée / 500', () => {
    // 6 m / 250 = 0,024 m = 24 mm ; 6 m / 500 = 12 mm
    expect(flecheLimite(6)).toBeCloseTo(0.024, 12);
    expect(flecheLimite(6, 500)).toBeCloseTo(0.012, 12);
  });
  it('la rotation est la dérivée de la flèche', () => {
    // contrôle numérique de y′(1,5) = 1,149677 × 10⁻³ rad (calcul à la main : 15 × 148,5 / 1 937 500)
    const f = flechePoutre(EXEMPLE_FLECHE);
    expect(f.theta).toBeCloseTo(2227.5 / 1937500, 12);
    expect(penteSecante(f.f, 1.5, 1e-4).centree).toBeCloseTo(f.theta, 9);
  });
});

describe('canal : périmètre mouillé', () => {
  it('minimum en h = √(A/2)', () => {
    // A = 2 m² : P(0,5) = 4 + 1 = 5 m ; P(1) = 2 + 2 = 4 m (minimum) ; P(1,5) = 1,333 + 3 = 4,333 m
    expect(perimetreCanal(2, 0.5)).toBeCloseTo(5, 12);
    expect(perimetreCanal(2, 1)).toBeCloseTo(canalOptimal(2).P, 12);
    expect(perimetreCanal(2, 1.5)).toBeCloseTo(4.333333, 6);
  });
});

describe('câble : sensibilité de la flèche', () => {
  it('10 cm de câble en plus font 62,5 cm de flèche en plus', () => {
    // df = 3 × 200 × 0,1 / (16 × 6) = 60 / 96 = 0,625 m
    const df = sensibiliteFleche(200, 6, 0.1);
    expect(df).toBeCloseTo(0.625, 12);
    // contrôle sur la formule approchée : S(6,625) − S(6) = 8 (6,625² − 6²) / 600 = 0,105 m, proche de 0,1 m
    const S = (f: number) => longueurCable({ l: 200, f }).approchee;
    expect(S(6 + df) - S(6)).toBeCloseTo(0.105208, 6);
  });
});

describe('intégration par parties : charge exponentielle', () => {
  it('résultante et position', () => {
    // q = 20 e^(−x/2) sur [0 ; 6] : R = 20 × 2 × (1 − e^(−3)) = 38,008517 kN
    // ∫ x q dx = 20 × [−2x e^(−x/2) − 4 e^(−x/2)]₀⁶ = 20 × (4 − 16 e^(−3)) = 64,068138 kN·m ; x̄ = 1,685626 m
    const R = 20 * integraleExp(0, 6, 2);
    const M = 20 * integraleXExp(0, 6, 2);
    expect(R).toBeCloseTo(38.008517, 6);
    expect(M).toBeCloseTo(64.068138, 6);
    expect(M / R).toBeCloseTo(1.685626, 6);
    expect(simpson((x) => 20 * x * Math.exp(-x / 2), 0, 6, 200)).toBeCloseTo(M, 6);
    const c = chargeExponentielle(20, 2, 6);
    expect(c.R).toBeCloseTo(R, 12);
    expect(c.xBarre).toBeCloseTo(1.685626, 6);
  });
  it('∫₀³ x e^(−x) dx = 1 − 4 e^(−3)', () => {
    expect(integraleXExp(0, 3, 1)).toBeCloseTo(1 - 4 * Math.exp(-3), 12);
  });
});

describe('dérivées partielles d’un volume de cylindre', () => {
  it('∂V/∂r et ∂V/∂h', () => {
    // r = 2 m, h = 3 m : V = 12π = 37,699112 m³ ; ∂V/∂r = 12π = 37,699112 m² ; ∂V/∂h = 4π = 12,566371 m²
    const c = cylindreDerivees(2, 3);
    expect(c.V).toBeCloseTo(37.699112, 6);
    expect(c.dVdr).toBeCloseTo(37.699112, 6);
    expect(c.dVdh).toBeCloseTo(12.566371, 6);
    expect((cylindreDerivees(2.001, 3).V - cylindreDerivees(1.999, 3).V) / 0.002).toBeCloseTo(c.dVdr, 6);
  });
});

describe('contrainte de flexion', () => {
  it('σ = M / W', () => {
    // 50 kN·m sur W = 10 627,45 cm³ : 50 × 10⁶ / (10 627,45 × 10³) = 4,704796 MPa ; sur W = 17 580,28 cm³ : 2,844096 MPa
    const r = sectionTInertie(EXEMPLE_SECTION_T);
    expect(contrainteFlexion(50, r.Winf)).toBeCloseTo(4.704796, 5);
    expect(contrainteFlexion(50, r.Wsup)).toBeCloseTo(2.844096, 5);
  });
});
