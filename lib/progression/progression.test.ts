import { describe, expect, it } from 'vitest';
import { creerDepotLocal, type Stockage } from './local';
import { quizValide } from './types';

function stockageMemoire(): Stockage & { donnees: Map<string, string> } {
  const donnees = new Map<string, string>();
  return { donnees, getItem: (c) => donnees.get(c) ?? null, setItem: (c, v) => void donnees.set(c, v) };
}

describe('dépôt de progression local', () => {
  const date = () => new Date('2026-10-22T08:00:00Z');

  it('enregistre la visite et le meilleur score', () => {
    const s = stockageMemoire();
    const d = creerDepotLocal(s, date);
    d.marquerVue('L3.8.7');
    d.enregistrerQuiz('L3.8.7', 6, 8);
    d.enregistrerQuiz('L3.8.7', 4, 8);
    expect(d.lire('L3.8.7')).toEqual({
      vue: '2026-10-22T08:00:00.000Z',
      quiz: { score: 4, total: 8, meilleur: 6, date: '2026-10-22T08:00:00.000Z' },
    });
    // relu depuis le stockage par un nouveau dépôt
    expect(creerDepotLocal(s, date).lire('L3.8.7')?.quiz?.meilleur).toBe(6);
  });

  it('prévient les abonnés et tolère un stockage absent ou corrompu', () => {
    const d = creerDepotLocal(null, date);
    let appels = 0;
    const fin = d.abonner(() => appels++);
    d.marquerVue('N0.1.1');
    fin();
    d.marquerVue('N0.1.2');
    expect(appels).toBe(1);
    const corrompu = stockageMemoire();
    corrompu.donnees.set('gca:progression:v1', '{pas du json');
    expect(creerDepotLocal(corrompu).lireTout()).toEqual({});
  });

  it('valide un quiz à partir de 70 %', () => {
    expect(quizValide({ score: 7, total: 10, meilleur: 7, date: '' })).toBe(true);
    expect(quizValide({ score: 6, total: 10, meilleur: 6, date: '' })).toBe(false);
    expect(quizValide(undefined)).toBe(false);
  });
});
