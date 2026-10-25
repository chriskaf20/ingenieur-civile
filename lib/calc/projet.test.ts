import { describe, expect, it } from 'vitest';
import { descenteSimple, EXEMPLE_DESCENTE, EXEMPLE_PLANNING, GARANTIES, planning } from './projet';

describe('planning des phases', () => {
  it('enchaîne les phases sans chevauchement', () => {
    // 4 + 10 + 8 + 6 = 28 semaines avant le chantier ; 3 + 18 + 10 + 1 = 32 semaines de travaux ; total 60
    const r = planning(EXEMPLE_PLANNING);
    expect(r.total).toBe(60);
    expect(r.debutTravaux).toBe(28);
    expect(r.travaux).toBe(32);
    expect(r.lignes[0]).toMatchObject({ debut: 0, fin: 4 });
    expect(r.lignes[5]).toMatchObject({ nom: 'Gros œuvre', debut: 31, fin: 49 });
    expect(r.lignes[7]!.fin).toBe(60);
  });

  it('cas limites', () => {
    expect(planning([]).total).toBe(0);
    expect(planning([{ nom: 'seule', duree: 5 }], 0)).toMatchObject({ total: 5, debutTravaux: 0, travaux: 5 });
  });

  it('garanties après réception (droit français)', () => {
    expect(GARANTIES.map((g) => g.ans)).toEqual([1, 2, 10]);
  });
});

describe('descente de charges simplifiée', () => {
  it('poteau intérieur d’une école R+1', () => {
    // A = 4 × 5 = 20 m² ; par plancher : G = 6 × 20 = 120 kN, Q = 2,5 × 20 = 50 kN
    // poteau 25 × 25 cm sur 3 m : 25 × 0,0625 × 3 = 4,687 5 kN par niveau
    // deux niveaux : G = 2 × 124,687 5 = 249,375 kN ; Q = 100 kN ; Nser = 349,375 kN
    // ELU : 1,35 × 249,375 + 1,5 × 100 = 336,656 + 150 = 486,656 kN ; semelle 1,20 m : 349,375 / 1,44 = 242,622 kPa
    const r = descenteSimple(EXEMPLE_DESCENTE);
    expect(r.A).toBe(20);
    expect(r.Gp).toBe(120);
    expect(r.Qp).toBe(50);
    expect(r.PPniveau).toBeCloseTo(4.6875, 12);
    expect(r.G).toBeCloseTo(249.375, 10);
    expect(r.Q).toBe(100);
    expect(r.Nser).toBeCloseTo(349.375, 10);
    expect(r.Nelu).toBeCloseTo(486.65625, 9);
    expect(r.sigma).toBeCloseTo(242.621528, 6);
    // cumul niveau par niveau : 174,687 5 kN sous la toiture, 349,375 kN en pied
    expect(r.niveauxDetail.map((n) => n.N)).toEqual([174.6875, 349.375]);
  });
});
