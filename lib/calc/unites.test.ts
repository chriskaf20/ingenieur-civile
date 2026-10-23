import { describe, expect, it } from 'vitest';
import { analyser, DIM, ecrireDim, egales, formule, FORMULES, SANS_DIMENSION } from './dimensions';
import { MATERIAUX, poidsPrismeMateriau, proprietesMateriau, volumePourMasse } from './materiauxCourants';
import { bilanPoidsPropres, estimationBatiment, EXEMPLE_BATIMENT, EXEMPLE_POIDS_PROPRES, fourchetteDalle, fourchettePoutre, memeOrdre, poidsDalle, poidsLineaire } from './ordres';
import {
  changerPrefixe,
  citerne,
  combienDe,
  coteSemelleCarree,
  surfaceRectangle,
  convertir,
  decaler,
  equivalents,
  EXEMPLE_CITERNE,
  G_LUNE,
  masseDePoids,
  pesanteurLocale,
  poidsDeMasse,
  pressionMoyenne,
} from './unites';

describe('préfixes (N0.3.1)', () => {
  it('décale la virgule sans erreur binaire', () => {
    expect(decaler(0.15, 3)).toBe(150);
    expect(decaler(1e-7, 3)).toBe(1e-4);
    expect(decaler(-2.5, -3)).toBe(-0.0025);
  });

  it('change de préfixe, y compris pour les carrés et les cubes', () => {
    // 200 GPa → MPa : n = 9 − 6 = 3 → 200 × 10³ = 200 000 MPa
    expect(changerPrefixe(200, 'G', 'M')).toEqual({ valeur: 200000, n: 3 });
    // 1 km² = (10³ m)² = 10⁶ m² : n = (3 − 0) × 2 = 6
    expect(changerPrefixe(1, 'k', '', 2)).toEqual({ valeur: 1e6, n: 6 });
    // 1 m³ = (10² cm)³ = 10⁶ cm³ : n = (0 − (−2)) × 3 = 6
    expect(changerPrefixe(1, '', 'c', 3).valeur).toBe(1e6);
    // 2,5 mm = 2,5 × 10⁻⁶ km
    expect(changerPrefixe(2.5, 'm', 'k').valeur).toBe(2.5e-6);
  });
});

describe('conversions (N0.3.2, N0.3.6)', () => {
  it('surfaces et volumes', () => {
    expect(convertir(8, 'm³', 'L')!.valeur).toBe(8000);
    expect(convertir(1, 'ha', 'm²')!.valeur).toBe(10000);
    expect(convertir(2500, 'm²', 'ha')!.valeur).toBe(0.25);
    expect(convertir(1, 'm²', 'cm²')!.valeur).toBe(10000);
    expect(convertir(1, 'm²', 'L')).toBeNull(); // grandeurs différentes
  });

  it('unités anciennes et anglo-saxonnes (facteurs exacts par définition)', () => {
    // 1 kgf/cm² = 9,806 65 N / 10⁻⁴ m² = 98 066,5 Pa = 0,098 066 5 MPa
    expect(convertir(1, 'kgf/cm²', 'MPa')!.valeur).toBeCloseTo(0.0980665, 12);
    expect(convertir(1.5, 'bar', 'kPa')!.valeur).toBe(150);
    expect(convertir(1, 'tf', 'kN')!.valeur).toBeCloseTo(9.80665, 12);
    expect(convertir(1, 'in', 'mm')!.valeur).toBe(25.4);
    // 24 ft × 0,304 8 = 7,315 2 m
    expect(convertir(24, 'ft', 'm')!.valeur).toBeCloseTo(7.3152, 12);
    // 1 psi = 1 lbf/in² = (0,453 592 37 × 9,806 65) / 0,025 4² = 4,448 22 / 6,451 6 × 10⁻⁴ = 6 894,76 Pa
    expect(convertir(1, 'psi', 'kPa')!.valeur).toBeCloseTo(6.894757, 6);
    expect(convertir(150, 'daN/m²', 'kN/m²')!.valeur).toBeCloseTo(1.5, 12);
  });

  it('réécrit une unité ancienne dans les unités pratiques', () => {
    const e = equivalents(1.5, 'bar');
    expect(e.si).toEqual({ symbole: 'Pa', valeur: 150000 });
    expect(e.pratiques).toEqual([
      { symbole: 'kPa', valeur: 150 },
      { symbole: 'MPa', valeur: 0.15 },
    ]);
  });
});

describe('masse, poids, pression (N0.3.3)', () => {
  it('poids d’un sac de ciment et pesanteur', () => {
    // 50 kg × 9,81 m/s² = 490,5 N
    expect(poidsDeMasse(50)).toBeCloseTo(490.5, 10);
    expect(masseDePoids(490.5)).toBeCloseTo(50, 10);
    // Sur la Lune : 50 × 1,62 = 81 N, la masse ne change pas
    expect(poidsDeMasse(50, G_LUNE)).toBeCloseTo(81, 10);
    // Équateur : 9,780 327 ; pôles : 9,780 327 × (1 + 0,005 302 4) = 9,832 186
    expect(pesanteurLocale(0)).toBeCloseTo(9.780327, 9);
    expect(pesanteurLocale(90)).toBeCloseTo(9.832186, 5);
  });

  it('pression moyenne sous une semelle de 1,20 × 1,20 m chargée à 300 kN', () => {
    // A = 1,44 m² ; σ = 300 / 1,44 = 208,33 kN/m² = 208,33 kPa = 0,208 MPa = 2,08 bar
    const p = pressionMoyenne(300, 1.2, 1.2);
    expect(p.A).toBeCloseTo(1.44, 12);
    expect(p.kPa).toBeCloseTo(208.333, 3);
    expect(p.MPa).toBeCloseTo(0.208333, 6);
    expect(p.bar).toBeCloseTo(2.08333, 5);
  });

  it('côté minimal d’une semelle carrée', () => {
    // 500 kN, σ ≤ 200 kPa : B ≥ √(500/200) = √2,5 = 1,581 m → 1,60 m au pas de 5 cm ; contrôle 500 / 1,6² = 195,3 kPa ≤ 200 ✓
    const c = coteSemelleCarree(500, 200);
    expect(c.Bmin).toBeCloseTo(1.58114, 5);
    expect(c.B).toBeCloseTo(1.6, 12);
    expect(pressionMoyenne(500, c.B, c.B).kPa).toBeLessThanOrEqual(200);
  });

  it('citerne de 2,50 × 2,00 m et 1,60 m d’eau', () => {
    // S = 5 m² ; V = 8 m³ = 8 000 L ; 8 000 / 150 = 53,3 → 53 jours complets
    const c = citerne(EXEMPLE_CITERNE);
    expect(c.S).toBeCloseTo(5, 12);
    expect(c.V).toBeCloseTo(8, 12);
    expect(c.litres).toBe(8000);
    expect(c.jours).toBe(53);
  });

  it('compte les unités entières', () => {
    // 1,5 ha = 15 000 m² ; 15 000 / 400 = 37,5 → 37 lots entiers
    expect(combienDe(15000, 400)).toEqual({ exact: 37.5, entier: 37, necessaire: 38 });
    // dalle 12 × 10 × 0,16 = 19,2 m³ ; toupies de 8 m³ : 2,4 → 3 toupies à prévoir
    expect(combienDe(19.2, 8).necessaire).toBe(3);
    // parcelle 20 m × 25 m = 500 m²
    expect(surfaceRectangle(20, 25)).toBe(500);
  });
});

describe('matériaux courants (N0.3.4)', () => {
  it('déduit ρ de γ et γ de ρ', () => {
    // Béton armé : γ = 25 kN/m³ (EN 1991-1-1) → ρ = 25 000 / 9,81 = 2 548,4 kg/m³
    expect(proprietesMateriau('ba').rho).toBeCloseTo(2548.42, 2);
    // Acier : ρ = 7 850 kg/m³ → γ = 7 850 × 9,81 / 1 000 = 77,01 kN/m³, dans la fourchette 77,0–78,5 de l'EN 1991-1-1
    const g = proprietesMateriau('acier').gamma;
    expect(g).toBeCloseTo(77.0085, 4);
    expect(g).toBeGreaterThanOrEqual(MATERIAUX.acier.fourchette[0]);
    expect(g).toBeLessThanOrEqual(MATERIAUX.acier.fourchette[1]);
  });

  it('poutre 5,00 × 0,20 × 0,40 m', () => {
    // V = 0,4 m³ ; béton armé : P = 25 × 0,4 = 10 kN, m = 2 548,4 × 0,4 = 1 019,4 kg
    const ba = poidsPrismeMateriau('ba', 5, 0.2, 0.4);
    expect(ba.V).toBeCloseTo(0.4, 12);
    expect(ba.P).toBeCloseTo(10, 12);
    expect(ba.m).toBeCloseTo(1019.37, 2);
    // acier plein : m = 7 850 × 0,4 = 3 140 kg ; P = 77,0085 × 0,4 = 30,80 kN
    const ac = poidsPrismeMateriau('acier', 5, 0.2, 0.4);
    expect(ac.m).toBeCloseTo(3140, 9);
    expect(ac.P).toBeCloseTo(30.8034, 4);
    // 1 m³ d'eau : 1 000 kg, 9,81 kN
    expect(poidsPrismeMateriau('eau', 1, 1, 1).P).toBeCloseTo(9.81, 12);
    // camion de 15 t de terre (γ = 18 kN/m³ → ρ = 18 000 / 9,81 = 1 834,9 kg/m³) : 15 000 / 1 834,9 = 8,175 m³
    expect(volumePourMasse(15000, 'terre')).toBeCloseTo(8.175, 3);
  });
});

describe('analyse dimensionnelle (N0.3.5)', () => {
  it('écrit les dimensions', () => {
    expect(ecrireDim(DIM.pression)).toBe('M·L⁻¹·T⁻²');
    expect(ecrireDim(DIM.force)).toBe('M·L·T⁻²');
    expect(ecrireDim(SANS_DIMENSION)).toBe('1');
  });

  it('flèche 5qL⁴/(384EI) : homogène à une longueur', () => {
    // q : M·T⁻² ; L⁴ : L⁴ ; E⁻¹ : M⁻¹·L·T² ; I⁻¹ : L⁻⁴ → M⁰·L^(4 + 1 − 4)·T⁰ = L
    const a = analyser(formule('fleche'));
    expect(a.homogene).toBe(true);
    expect(egales(a.termes[0]!, DIM.longueur)).toBe(true);
  });

  it('détecte les formules fausses et vérifie les sommes', () => {
    // q L³ / (E I) : L^(3 + 1 − 4) = L⁰ → sans dimension ≠ L
    expect(analyser(formule('faux-fleche')).homogene).toBe(false);
    // γ L b : N/m³ × m² = N/m ≠ N
    expect(ecrireDim(analyser(formule('faux-poids')).termes[0]!)).toBe('M·T⁻²');
    // h = h₀ + (Q/S) t : deux termes, tous deux des longueurs
    expect(analyser(formule('reservoir')).homogene).toBe(true);
    // p = ρ g z : M·L⁻³ × L·T⁻² × L = M·L⁻¹·T⁻² = pression
    expect(analyser(formule('hydrostatique')).homogene).toBe(true);
    expect(FORMULES.filter((f) => !analyser(f).homogene).map((f) => f.id)).toEqual(['faux-fleche', 'faux-poids']);
  });
});

describe('ordres de grandeur (N0.3.7, N0.3.P)', () => {
  it('estime le poids d’une maison R+1', () => {
    // W = 120 m² × 2 niveaux × 10 kN/m² = 2 400 kN ; par poteau 2 400 / 9 = 266,7 kN ; masse 2 400 / 9,81 = 244,6 t
    const r = estimationBatiment(EXEMPLE_BATIMENT);
    expect(r.W).toBe(2400);
    expect(r.parPoteau).toBeCloseTo(266.667, 3);
    expect(r.masse).toBeCloseTo(244.65, 2);
    expect(r.parM2Sol).toBe(20);
  });

  it('fourchettes de prédimensionnement', () => {
    // poutre de 6 m : 6/15 = 0,40 m à 6/10 = 0,60 m ; dalle de 4,5 m : 0,15 m à 0,225 m
    expect(fourchettePoutre(6).min).toBeCloseTo(0.4, 12);
    expect(fourchettePoutre(6).max).toBeCloseTo(0.6, 12);
    expect(fourchetteDalle(4.5).min).toBeCloseTo(0.15, 12);
    expect(fourchetteDalle(4.5).max).toBeCloseTo(0.225, 12);
  });

  it('poids propres du mini-projet et contrôle par ordre de grandeur', () => {
    const { dalle, poutre, mur } = EXEMPLE_POIDS_PROPRES;
    // Dalle 5 × 4 × 0,15 : V = 3 m³, P = 75 kN, 0,15 × 25 = 3,75 kN/m² ; contrôle 5 × 4 × 0,2 × 25 = 100 kN (+33 %)
    const d = poidsDalle(dalle.Lx, dalle.Ly, dalle.e);
    expect(d.V).toBeCloseTo(3, 12);
    expect(d.P).toBeCloseTo(75, 12);
    expect(d.charge).toBeCloseTo(3.75, 12);
    expect(d.arrondies).toEqual([5, 4, 0.2]);
    expect(d.estimation).toBeCloseTo(100, 12);
    expect(d.ecart).toBeCloseTo(1 / 3, 12);
    // Poutre 5 × 0,2 × 0,4 : P = 10 kN, 2 kN/m ; contrôle identique (écart nul)
    const p = poidsLineaire(poutre.L, poutre.b, poutre.h, 25);
    expect(p.P).toBeCloseTo(10, 12);
    expect(p.charge).toBeCloseTo(2, 12);
    expect(p.ecart).toBeCloseTo(0, 12);
    // Mur 5 × 0,2 × 2,8 à 20 kN/m³ : V = 2,8 m³, P = 56 kN, 11,2 kN/m ; contrôle 5 × 0,2 × 3 × 20 = 60 kN (+7,1 %)
    const m = poidsLineaire(mur.L, mur.e, mur.H, mur.gamma);
    expect(m.P).toBeCloseTo(56, 12);
    expect(m.charge).toBeCloseTo(11.2, 12);
    expect(m.estimation).toBeCloseTo(60, 12);
    expect(m.ecart).toBeCloseTo(4 / 56, 12);
    // +33 % et +7 % : même ordre de grandeur ; un facteur 10 (+900 %) ne l'est pas
    expect([d.ecart, m.ecart, 9].map(memeOrdre)).toEqual([true, true, false]);
    // bilan : 75 + 10 + 56 = 141 kN ; règle 20 m² × 10 kN/m² = 200 kN ; écart (141 − 200) / 200 = −29,5 %
    const b = bilanPoidsPropres([d.P, p.P, m.P], 20);
    expect(b.total).toBeCloseTo(141, 12);
    expect(b.estimationRegle).toBe(200);
    expect(b.ecart).toBeCloseTo(-0.295, 12);
    expect(memeOrdre(b.ecart)).toBe(true);
  });
});
