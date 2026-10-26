import { describe, expect, it } from 'vitest';
import {
  alcalinEquivalent,
  analyseEau,
  bilanAtomes,
  bogue,
  classeXA,
  COEF_K2O,
  coefficientsBogue,
  composition,
  co2Decarbonatation,
  cyclePlatre,
  cycleChaux,
  diagnosticCarbonatation,
  dosageAdjuvant,
  dureeCarbonatation,
  EAU_DE_MER,
  equilibrer,
  EXEMPLE_ADJUVANT,
  EXEMPLE_CARBONATATION,
  EXEMPLE_CLINKER,
  EXEMPLE_CORROSION,
  EXEMPLE_CYCLE_CHAUX,
  EXEMPLE_EAU,
  EXEMPLE_NEUTRALISATION,
  hydratationSilicates,
  masseMolaire,
  massesReaction,
  neutralisation,
  perteSection,
  pHdeConcentration,
  pOH,
  reaction,
  REACTIONS,
  vitessePenetration,
} from './chimie';

describe('masses molaires', () => {
  it('formules simples, parenthèses et hydrates', () => {
    // CaCO3 : 40,078 + 12,011 + 3 × 15,999 = 100,086 g/mol
    expect(masseMolaire('CaCO3')).toBeCloseTo(100.086, 9);
    // Ca(OH)2 : 40,078 + 2 × (15,999 + 1,008) = 74,092 g/mol
    expect(masseMolaire('Ca(OH)2')).toBeCloseTo(74.092, 9);
    // CaSO4·2H2O : 40,078 + 32,06 + 4 × 15,999 + 2 × 18,015 = 172,164 g/mol
    expect(masseMolaire('CaSO4·2H2O')).toBeCloseTo(172.164, 9);
    expect(composition('CaSO4·0.5H2O')).toEqual({ Ca: 1, S: 1, O: 4.5, H: 1 });
    expect(composition('Ca6Al2(SO4)3(OH)12·26H2O')).toEqual({ Ca: 6, Al: 2, S: 3, O: 50, H: 64 });
    expect(() => masseMolaire('Xy2')).toThrow();
  });
});

describe('réactions', () => {
  it('toutes les réactions du module sont équilibrées', () => {
    for (const r of REACTIONS) expect(bilanAtomes(r).equilibree).toBe(true);
  });
  it('équilibrage automatique', () => {
    // rouille : Fe, puis H (2 c3 = 3), puis O (2 c2 + c3 = 3) avec Fe(OH)3 = 1 : (1 ; 0,75 ; 1,5 ; 1) × 4 = (4 ; 3 ; 6 ; 4)
    expect(equilibrer(['Fe', 'O2', 'H2O'], ['Fe(OH)3'])).toEqual([4, 3, 6, 4]);
    expect(equilibrer(['CH4', 'O2'], ['CO2', 'H2O'])).toEqual([1, 2, 1, 2]);
    expect(equilibrer(['Ca3SiO5', 'H2O'], ['Ca3Si2O7·4H2O', 'Ca(OH)2'])).toEqual([2, 7, 1, 3]);
    expect(equilibrer(['CaCO3'], ['CaO', 'H2O'])).toBeNull(); // impossible : le carbone disparaîtrait
  });
  it('calcination d’une tonne de calcaire', () => {
    // 1 000 kg / 100,086 = 9,9914 kmol ; CaO : 9,9914 × 56,077 = 560,29 kg ; CO2 : 9,9914 × 44,009 = 439,71 kg
    const m = massesReaction(reaction('calcination'), 0, 1000);
    expect(m.lignes[1]!.m).toBeCloseTo(560.288, 2);
    expect(m.lignes[2]!.m).toBeCloseTo(439.712, 2);
    expect(m.masseProduits).toBeCloseTo(m.masseReactifs, 9); // conservation de la masse
  });
});

describe('pH', () => {
  it('définitions', () => {
    expect(pHdeConcentration(1e-3)).toBeCloseTo(3, 12);
    expect(pOH(12.5)).toBeCloseTo(1.5, 12);
  });
  it('neutralisation d’un drainage minier', () => {
    // n(H+) = 500 m³ × 1 000 L/m³ × (10⁻³ − 10⁻⁷) mol/L = 499,95 mol ; Ca(OH)2 : 249,975 mol × 74,092 g/mol = 18,521 kg
    // chaux commerciale à 90 % : 18,521 / 0,9 = 20,579 kg
    const n = neutralisation(EXEMPLE_NEUTRALISATION);
    expect(n.nH).toBeCloseTo(499.95, 9);
    expect(n.mPure).toBeCloseTo(18.521148, 6);
    expect(n.mCommerciale).toBeCloseTo(20.579053, 6);
    expect(n.rapport).toBeCloseTo(1e4, 6);
  });
});

describe('ciment', () => {
  it('composition de Bogue', () => {
    // C3S = 4,071 × 65 − 7,600 × 21 − 6,718 × 5,5 − 1,430 × 3 − 2,852 × 1 = 264,63 − 159,60 − 36,95 − 4,29 − 2,85 = 60,96 %
    // C3A = 2,650 × 5,5 − 1,692 × 3 = 9,50 % ; C4AF = 3,043 × 3 = 9,13 % ; C2S = 2,867 × 21 − 0,7544 × 60,96 = 14,22 %
    const b = bogue(EXEMPLE_CLINKER);
    expect(b.C3S).toBeCloseTo(60.95597, 4);
    expect(b.C2S).toBeCloseTo(14.215313, 4);
    expect(b.C3A).toBeCloseTo(9.498719, 4);
    expect(b.C4AF).toBeCloseTo(9.129535, 4);
    expect(b.valide).toBe(true);
  });
  it('les coefficients classiques se retrouvent par les masses molaires', () => {
    const k = coefficientsBogue();
    expect(k.C3S[0]).toBeCloseTo(4.071, 3);
    expect(k.C3S[1]).toBeCloseTo(-7.6, 3);
    expect(k.C3S[2]).toBeCloseTo(-6.718, 3);
    expect(k.C3S[3]).toBeCloseTo(-1.43, 3);
    expect(k.C3S[4]).toBeCloseTo(-2.852, 3);
    expect(k.C3A[2]).toBeCloseTo(2.65, 3);
    expect(k.C3A[3]).toBeCloseTo(-1.692, 3);
    expect(k.C4AF[3]).toBeCloseTo(3.043, 3);
  });
  it('hydratation des silicates', () => {
    // 2 C3S + 7 H2O → C3S2H4 + 3 CH : eau = 7 × 18,015 / (2 × 228,314) = 0,2762 kg par kg de C3S
    // portlandite = 3 × 74,092 / (2 × 228,314) = 0,4868 kg par kg de C3S
    const h = hydratationSilicates(1, 100, 0);
    expect(h.eauParKgC3S).toBeCloseTo(0.276166, 6);
    expect(h.chParKgC3S).toBeCloseTo(0.486777, 6);
    expect(h.eau).toBeCloseTo(0.276166, 6);
  });
});

describe('chaux et plâtre', () => {
  it('cycle de la chaux', () => {
    // 10 t à 95 % : 9,5 t de CaCO3 ; CaO = 9,5 × 56,077 / 100,086 = 5,3227 t ; CO2 = 4,1773 t, repris intégralement à la carbonatation
    const c = cycleChaux(EXEMPLE_CYCLE_CHAUX);
    expect(c.caO).toBeCloseTo(5.322737, 6);
    expect(c.co2).toBeCloseTo(4.177263, 6);
    expect(c.co2Repris).toBeCloseTo(c.co2, 9);
    expect(c.calcaireReforme).toBeCloseTo(c.caco3, 9);
  });
  it('CO2 de décarbonatation du clinker', () => {
    // 0,65 × 44,009 / 56,077 = 0,5101 t de CO2 par tonne de clinker
    expect(co2Decarbonatation(65)).toBeCloseTo(0.510117, 6);
  });
  it('cycle du plâtre', () => {
    // 1 000 kg de gypse : plâtre = 1 000 × 145,1415 / 172,164 = 843,04 kg ; vapeur = 1,5 × 18,015 / 172,164 × 1 000 = 156,96 kg
    const p = cyclePlatre(1000);
    expect(p.platre).toBeCloseTo(843.042099, 5);
    expect(p.vapeur).toBeCloseTo(156.957901, 5);
    expect(p.gypseReforme).toBeCloseTo(1000, 9);
  });
});

describe('corrosion', () => {
  it('loi de Faraday', () => {
    // 1 µA/cm² = 0,01 A/m² ; 55,845 × 10⁻³ × 0,01 / (2 × 96 485,33) = 2,894 × 10⁻⁹ kg/(m²·s)
    // ÷ 7 850 kg/m³ × 31 557 600 s = 1,1634 × 10⁻⁵ m/an = 11,63 µm/an
    expect(vitessePenetration(1)).toBeCloseTo(11.633953, 5);
    // 20 ans : 0,2327 mm de chaque côté ; φ = 12 − 2 × 0,2327 = 11,535 mm ; perte = 1 − (11,535 / 12)² = 7,6 %
    const p = perteSection(EXEMPLE_CORROSION);
    expect(p.phiRestant).toBeCloseTo(11.534642, 5);
    expect(p.perte).toBeCloseTo(0.076056, 5);
  });
});

describe('carbonatation et alcalis', () => {
  it('diagnostic d’un balcon', () => {
    // K = 18 / √25 = 3,6 mm/√an ; front aux armatures à (22 / 3,6)² = 37,35 ans, soit encore 12,35 ans
    const d = diagnosticCarbonatation(EXEMPLE_CARBONATATION);
    expect(d.K).toBeCloseTo(3.6, 12);
    expect(d.tArmatures).toBeCloseTo(37.345679, 5);
    expect(d.reste).toBeCloseTo(12.345679, 5);
    expect(dureeCarbonatation(35, 5)).toBeCloseTo(49, 12);
  });
  it('alcalin équivalent', () => {
    // 61,979 / 94,195 = 0,658 ; Na2O = 0,2 % et K2O = 0,8 % : 0,2 + 0,658 × 0,8 = 0,726 %
    expect(COEF_K2O).toBeCloseTo(0.657986, 6);
    expect(alcalinEquivalent(0.2, 0.8)).toBeCloseTo(0.726389, 6);
  });
});

describe('adjuvant et eau', () => {
  it('dosage d’un superplastifiant', () => {
    // 1,2 % de 350 kg = 4,2 kg/m³ ; volume 4,2 / 1,07 = 3,925 L ; extrait sec 30 % : 1,26 kg ; eau apportée 2,94 kg
    const a = dosageAdjuvant(EXEMPLE_ADJUVANT);
    expect(a.masse).toBeCloseTo(4.2, 12);
    expect(a.volume).toBeCloseTo(3.925234, 6);
    expect(a.eau).toBeCloseTo(2.94, 12);
  });
  it('une eau peut convenir au béton sans être potable', () => {
    const e = analyseEau(EXEMPLE_EAU, 'arme');
    expect(e.gachageOk).toBe(true);
    expect(e.potableOk).toBe(false);
    expect(e.potable.filter((c) => !c.ok).map((c) => c.id)).toEqual(['pH', 'sulfates', 'turbidite']);
    expect(analyseEau(EAU_DE_MER, 'arme').gachageOk).toBe(false);
    expect(analyseEau(EAU_DE_MER, 'nonArme').gachage.find((c) => c.id === 'chlorures')!.ok).toBe(false);
  });
  it('classe d’exposition chimique XA', () => {
    // 900 mg/L de sulfates : entre 600 et 3 000, XA2 ; pH 5,2 : entre 4,5 et 5,5, XA2
    expect(classeXA(900, 5.2)).toEqual({ sulfates: 'XA2', pH: 'XA2', classe: 'XA2' });
    expect(classeXA(150, 7).classe).toBe('aucune');
    expect(classeXA(2500, 6).classe).toBe('XA2');
    expect(classeXA(400, 4.2).classe).toBe('XA3');
    expect(analyseEau(EXEMPLE_EAU, 'arme').xa.classe).toBe('XA2');
  });
});
