import { describe, expect, it } from 'vitest';
import {
  arrondiPython,
  calculateurReactions,
  CSV_EPROUVETTES,
  effortsPoutre,
  executerTests,
  EXEMPLE_CALCULATEUR,
  EXEMPLE_POIDS,
  formatF,
  isclose,
  linspace,
  lireEprouvettes,
  poidsPropre,
  reactionsBoguees,
  reactionsPonctuelle,
  reprFlottant,
  sacsCiment,
  statsEprouvettes,
  tableauReactions,
} from './programmation';

describe('écritures à la manière de Python', () => {
  it('imprime les flottants comme Python', () => {
    // 0,2 × 0,4 = 0,08000000000000002 en binaire ; × 5,0 × 25 → 10.000000000000002, comme dans Python
    expect(reprFlottant(poidsPropre(EXEMPLE_POIDS))).toBe('10.000000000000002');
    expect(reprFlottant(12)).toBe('12.0');
    expect(reprFlottant(0.1 + 0.2)).toBe('0.30000000000000004');
    expect(reprFlottant(0.00001)).toBe('1e-05');
    expect(arrondiPython(poidsPropre(EXEMPLE_POIDS), 2)).toBe(10);
    expect(arrondiPython(0.125, 2)).toBe(0.12);
    expect(arrondiPython(2.5)).toBe(2);
    expect(formatF(3.14159, 2, 7)).toBe('   3.14');
  });

  it('calcule les sacs de ciment', () => {
    // 350 × 2,4 = 840 kg ; 840 / 50 = 16,8 ; 840 // 50 = 16 ; 840 % 50 = 40 ; ceil → 17 sacs
    const s = sacsCiment(350, 2.4, 50);
    expect(s.masse).toBeCloseTo(840, 9);
    expect(s.quotient).toBeCloseTo(16.8, 9);
    expect(s.entiers).toBe(16);
    expect(s.reste).toBeCloseTo(40, 9);
    expect(s.sacs).toBe(17);
  });
});

describe('fonctions et boucles', () => {
  it('calcule les réactions d’une charge ponctuelle', () => {
    // L = 5, a = 2, P = 20 : RA = 20 × 3 / 5 = 12 ; RB = 20 × 2 / 5 = 8
    expect(reactionsPonctuelle(5, 2, 20)).toEqual([12, 8]);
    expect(tableauReactions(5, 20, [0, 2.5])).toEqual([' 0.0   20.00    0.00', ' 2.5   10.00   10.00']);
  });

  it('lit le fichier CSV et calcule les statistiques', () => {
    // somme = 257,7 MPa sur 9 éprouvettes → moyenne 28,63 ; min 24,8 (E06) ; max 31,2
    const e = lireEprouvettes(CSV_EPROUVETTES);
    expect(e).toHaveLength(9);
    const s = statsEprouvettes(e, 25);
    expect(s.moyenne).toBeCloseTo(28.6333, 3);
    expect(s.min).toBe(24.8);
    expect(s.max).toBe(31.2);
    expect(s.sousSeuil).toEqual(['E06']);
    // gâchée G2 : (31,2 + 30,6 + 24,8) / 3 = 28,87
    expect(s.moyennes.G2).toBeCloseTo(28.8667, 3);
  });

  it('reproduit linspace et le moment maximal', () => {
    // linspace(0, 5, 11) : pas 0,5 ; M max = q L² / 8 = 12 × 25 / 8 = 37,5 en x = 2,5
    expect(linspace(0, 5, 11)[3]).toBeCloseTo(1.5, 12);
    const e = effortsPoutre(5, 12, 11);
    expect(e.Mmax).toBeCloseTo(37.5, 9);
    expect(e.xMax).toBeCloseTo(2.5, 9);
    expect(e.V[0]).toBeCloseTo(30, 9);
  });
});

describe('tests et projet', () => {
  it('fait passer la bonne fonction et échouer la fonction boguée', () => {
    expect(isclose(0.1 + 0.2, 0.3)).toBe(true);
    expect(0.1 + 0.2 === 0.3).toBe(false);
    expect(executerTests(reactionsPonctuelle).every((c) => c.ok)).toBe(true);
    expect(executerTests(reactionsBoguees).map((c) => c.ok)).toEqual([true, false, false]);
  });

  it('calcule les réactions du projet et les contrôle par la statique', () => {
    // q L = 48 ; ΣF = 48 + 20 + 15 = 83 kN ; moments en A : 8 × 36 / 2 + 20 × 2 + 15 × 4,5 = 144 + 40 + 67,5 = 251,5
    // RB = 251,5 / 6 = 41,92 kN ; RA = 83 − 41,92 = 41,08 kN
    const r = calculateurReactions(EXEMPLE_CALCULATEUR);
    expect(r.somme).toBe(83);
    expect(r.RB).toBeCloseTo(41.9167, 3);
    expect(r.RA).toBeCloseTo(41.0833, 3);
    expect(r.controle.RA).toBeCloseTo(r.RA, 9);
    expect(r.equilibre).toBe(true);
  });
});
