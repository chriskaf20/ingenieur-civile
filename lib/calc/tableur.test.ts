import { describe, expect, it } from 'vitest';
import { afficherValeur, cellulesPlage, colonneLettres, colonneNumero, decalerReference, estErreur, evaluerFeuille, FEUILLE_ACIERS, FEUILLE_BETON, feuilleMoment, recopierFormule } from './tableur';

describe('références et recopie', () => {
  it('numérote les colonnes', () => {
    expect(colonneNumero('A')).toBe(1);
    expect(colonneNumero('AA')).toBe(27);
    expect(colonneLettres(28)).toBe('AB');
  });

  it('décale les références relatives et garde les absolues', () => {
    // B4 recopiée d'une ligne vers le bas → B5 ; $B$1 ne bouge pas ; $A2 → $A3 ; A$1 → B$1 vers la droite
    expect(decalerReference('B4', 1, 0)).toBe('B5');
    expect(decalerReference('$B$1', 3, 2)).toBe('$B$1');
    expect(decalerReference('$A2', 1, 1)).toBe('$A3');
    expect(decalerReference('A$1', 1, 1)).toBe('B$1');
    expect(recopierFormule('=F4*$B$1', 1, 0)).toBe('=F5*$B$1');
    expect(recopierFormule('=SOMME(F4:F7)', 0, 1)).toBe('=SOMME(G4:G7)');
    expect(recopierFormule('=SI(A1>2;"A1";B2)', 1, 0)).toBe('=SI(A2>2;"A1";B3)');
    expect(cellulesPlage('A1:B2')).toEqual([['A1', 'B1'], ['A2', 'B2']]);
  });
});

describe('évaluation', () => {
  it('respecte la priorité des opérations et la virgule décimale', () => {
    // 2 + 3 × 4² = 2 + 48 = 50 ; 2,5 × 4 = 10 ; (2 + 3) × 4 = 20
    const r = evaluerFeuille({ A1: '=2+3*4^2', A2: '=2,5*4', A3: '=(2+3)*4', A4: '=-2^2', A5: '=1/0' });
    expect(r.A1).toBe(50);
    expect(r.A2).toBe(10);
    expect(r.A3).toBe(20);
    expect(r.A4).toBe(4);
    expect(estErreur(r.A5) && r.A5.erreur).toBe('#DIV/0!');
  });

  it('calcule la feuille de béton du cours', () => {
    // semelles 6 × 1,2 × 1,2 × 0,4 = 3,456 ; poteaux 6 × 0,25 × 0,25 × 3 = 1,125 ;
    // poutres 4 × 4,5 × 0,2 × 0,4 = 1,44 ; dalle 9 × 6 × 0,16 = 8,64 ; total 14,661 m³ ; × 180 = 2 638,98 $
    const r = evaluerFeuille(FEUILLE_BETON);
    expect(r.F4).toBeCloseTo(3.456, 9);
    expect(r.F8).toBeCloseTo(14.661, 9);
    expect(r.G8).toBeCloseTo(2638.98, 6);
  });

  it('cherche les masses linéiques et somme les produits', () => {
    // HA 6 : 7 850 × π × 0,006² / 4 = 0,2220 kg/m ; masse = 3 × 3,94 × 0,888 + 2 × 3,94 × 0,617 + 27 × 1,12 × 0,222 = 22,07 kg
    const r = evaluerFeuille(FEUILLE_ACIERS);
    expect(r.B2).toBe(0.222);
    expect(r.H2).toBe(0.888);
    expect(r.H6).toBeCloseTo(22.07, 2);
    expect(r.H7).toBe('OK');
    const r2 = evaluerFeuille({ A1: 6, B1: 'a', A2: 10, B2: 'b', C1: '=RECHERCHEV(8;A1:B2;2)', C2: '=RECHERCHEV(8;A1:B2;2;FAUX)' });
    expect(r2.C1).toBe('a');
    expect(estErreur(r2.C2) && r2.C2.erreur).toBe('#N/A');
  });

  it('tabule le moment d’une poutre', () => {
    // M(x) = q x (L − x) / 2 ; L = 5, q = 12 : M(2,5) = 12 × 2,5 × 2,5 / 2 = 37,5 kN·m = q L² / 8
    const r = evaluerFeuille(feuilleMoment(5, 12, 0.5));
    expect(r.A10).toBeCloseTo(2.5, 9);
    expect(r.B10).toBeCloseTo(37.5, 9);
    expect(r.B16).toBeCloseTo(37.5, 9);
    expect(afficherValeur(r.B10, 2)).toBe('37,50');
  });

  it('signale une référence circulaire', () => {
    const r = evaluerFeuille({ A1: '=B1+1', B1: '=A1+1' });
    expect(estErreur(r.A1) || estErreur(r.B1)).toBe(true);
  });
});
