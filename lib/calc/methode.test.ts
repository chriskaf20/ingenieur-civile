import { describe, expect, it } from 'vitest';
import {
  budgetSemaine,
  courbeOubli,
  EXEMPLE_BUDGET,
  EXEMPLE_DALLE,
  EXEMPLE_LINTEAU,
  joursRevision,
  planRevisions,
  poidsElement,
  repartirHeures,
  revisionsParJour,
  semaineDuJour,
  unChiffre,
  volumeDalle,
} from './methode';

describe('révisions espacées (N0.1.1)', () => {
  it('place les révisions à J+1, J+3, J+7, J+14, J+30', () => {
    // Cours le jour 10 : 10 + 1 = 11, 10 + 3 = 13, 10 + 7 = 17, 10 + 14 = 24, 10 + 30 = 40.
    expect(joursRevision(10)).toEqual([11, 13, 17, 24, 40]);
    expect(semaineDuJour(7)).toBe(1);
    expect(semaineDuJour(8)).toBe(2);
  });

  it('compte les révisions par jour pour plusieurs cours', () => {
    // Cours les jours 1, 3, 5 → 2, 4, 8, 15, 31 ; 4, 6, 10, 17, 33 ; 6, 8, 12, 19, 35.
    // Jours doublés : 4 (cours 1 et 3), 6 (cours 3 et 5), 8 (cours 1 et 5).
    const c = revisionsParJour([1, 3, 5]);
    expect(c.filter(([, n]) => n > 1)).toEqual([[4, 2], [6, 2], [8, 2]]);
    expect(c.reduce((a, [, n]) => a + n, 0)).toBe(15);
  });

  it('sépare les révisions faites avant et après l’examen', () => {
    // Examen le jour 35 : 11, 13, 17, 24 < 35 ; 40 ≥ 35 ; délai 35 − 10 = 25 jours.
    expect(planRevisions(10, 35)).toEqual({ jours: [11, 13, 17, 24, 40], avant: [11, 13, 17, 24], apres: [40], delai: 25 });
  });

  it('dessine une courbe qui remonte à 1 à chaque révision et décroît moins vite ensuite', () => {
    const c = courbeOubli([1, 3], 6, 2, 2, 0.5);
    const a = (t: number) => c.find(([x]) => x === t)![1];
    expect(a(0)).toBe(1);
    expect(a(1)).toBe(1);
    // Avant la 1re révision, S = 2 : R(0,5) = e^(−0,25). Après, S = 4 : R(1,5) = e^(−0,125).
    expect(a(0.5)).toBeCloseTo(Math.exp(-0.25), 12);
    expect(a(1.5)).toBeCloseTo(Math.exp(-0.125), 12);
  });
});

describe('poids propre (N0.1.3)', () => {
  it('arrondit à un chiffre significatif', () => {
    expect([unChiffre(2.4), unChiffre(0.25), unChiffre(0.2), unChiffre(240), unChiffre(0.034)]).toEqual([2, 0.3, 0.2, 200, 0.03]);
  });

  it('linteau 2,40 × 0,20 × 0,25 m en béton armé', () => {
    // Vérifié à la main :
    // V = 2,40 × 0,20 × 0,25 = 0,120 m³ ; P = 0,120 × 25 = 3,00 kN ;
    // g = 0,20 × 0,25 × 25 = 1,25 kN/m ; m = 3 000 N / 9,81 = 305,8 kg ;
    // estimation : 2 × 0,2 × 0,3 × 25 = 3,0 kN, écart nul.
    const r = poidsElement(EXEMPLE_LINTEAU);
    expect(r.volume).toBeCloseTo(0.12, 12);
    expect(r.poids).toBeCloseTo(3, 12);
    expect(r.chargeLineique).toBeCloseTo(1.25, 12);
    expect(r.masse).toBeCloseTo(305.81, 2);
    expect(r.estimation).toBeCloseTo(3, 12);
    expect(Math.abs(r.ecartEstimation)).toBeLessThan(1e-9);
  });
});

describe('présentation d’un calcul : dalle (N0.1.4)', () => {
  it('dalle 4,25 × 3,60 m, 15 cm', () => {
    // Vérifié à la main :
    // S = 4,25 × 3,60 = 15,30 m² ; e = 15 cm = 0,15 m ; V = 15,30 × 0,15 = 2,295 m³ → 2,30 m³ ;
    // commande par 0,5 m³ : 2,295 / 0,5 = 4,59 → 5 × 0,5 = 2,5 m³ ;
    // si l'on arrondit S à 15 m² trop tôt : 15 × 0,15 = 2,25 m³ (il manque 0,045 m³).
    const r = volumeDalle(EXEMPLE_DALLE);
    expect(r.surface).toBeCloseTo(15.3, 12);
    expect(r.volume).toBeCloseTo(2.295, 12);
    expect(r.volumeAffiche).toBe(2.3);
    expect(r.volumeCommande).toBe(2.5);
    expect(r.volumeArrondiTrop).toBeCloseTo(2.25, 12);
  });
});

describe('budget-temps (N0.1.5)', () => {
  it('semaine type d’un étudiant de L1', () => {
    // Vérifié à la main : cours 28 h ; perso 28 × 1 = 28 h ; sommeil 7 × 8 = 56 h ;
    // vie 7 × 2 = 14 h ; transport 2 × 6 = 12 h ; total 138 h ; libre 168 − 138 = 30 h.
    const r = budgetSemaine(EXEMPLE_BUDGET);
    expect([r.perso, r.sommeil, r.vie, r.transport, r.engage, r.libre]).toEqual([28, 56, 14, 12, 138, 30]);
    expect(r.parts.reduce((a, p) => a + p.heures, 0)).toBe(168);
  });

  it('ne dessine pas de part libre négative', () => {
    const r = budgetSemaine({ ...EXEMPLE_BUDGET, ratio: 2.5 });
    expect(r.libre).toBe(-12);
    expect(r.parts.at(-1)?.heures).toBe(0);
  });

  it('répartit les heures au plus fort reste, sans perte', () => {
    // 28 h = 56 demi-heures ; poids 6, 5, 4, 3 (somme 18) → 18,67 ; 15,56 ; 12,44 ; 9,33 demi-heures.
    // Parties entières 18 + 15 + 12 + 9 = 54 ; 2 restantes aux plus forts restes (0,67 et 0,56).
    // → 19, 16, 12, 9 demi-heures = 9,5 h ; 8 h ; 6 h ; 4,5 h (total 28 h).
    expect(repartirHeures(28, [6, 5, 4, 3])).toEqual([9.5, 8, 6, 4.5]);
    expect(repartirHeures(10, [0, 0])).toEqual([0, 0]);
  });
});
