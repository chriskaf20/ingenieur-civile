import { describe, expect, it } from 'vitest';
import { creerDepotLocal, type Stockage } from './local';
import { avancement, leconAReprendre, prerequisAValider, statutLecon } from './statistiques';
import { quizValide } from './types';

function stockageMemoire(): Stockage & { donnees: Map<string, string> } {
  const donnees = new Map<string, string>();
  return { donnees, getItem: (c) => donnees.get(c) ?? null, setItem: (c, v) => void donnees.set(c, v) };
}

const date = () => new Date('2026-10-22T08:00:00Z');

describe('dépôt de progression local', () => {


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

  it('valide un quiz à partir de 65 %', () => {
    // 13/20 = 65 % → validé ; 12/20 = 60 % → non validé ; 7/10 = 70 % → validé.
    expect(quizValide({ score: 13, total: 20, meilleur: 13, date: '' })).toBe(true);
    expect(quizValide({ score: 12, total: 20, meilleur: 12, date: '' })).toBe(false);
    expect(quizValide({ score: 7, total: 10, meilleur: 7, date: '' })).toBe(true);
    expect(quizValide(undefined)).toBe(false);
  });
});

describe('statistiques de progression', () => {
  const q = (meilleur: number) => ({ score: meilleur, total: 10, meilleur, date: '' });
  const etats = {
    A: { vue: '2026-10-01T10:00:00Z', quiz: q(8) }, // validée
    B: { vue: '2026-10-03T10:00:00Z', quiz: q(5) }, // vue, quiz < 65 %
    C: { vue: '2026-10-02T10:00:00Z' }, // vue
  };
  const redigees = new Set(['A', 'B', 'C', 'D']);

  it('attribue un statut à chaque leçon', () => {
    expect([statutLecon(etats.A, true), statutLecon(etats.B, true), statutLecon(undefined, true), statutLecon(undefined, false)]).toEqual([
      'validee',
      'vue',
      'a-faire',
      'a-venir',
    ]);
  });

  it('calcule l’avancement sur tout le périmètre, leçons à venir comprises', () => {
    // 1 validée sur 5 → 20 % ; 3 vues ; 4 rédigées
    expect(avancement(['A', 'B', 'C', 'D', 'E'], etats, redigees)).toEqual({ total: 5, redigees: 4, vues: 3, validees: 1, pourcentage: 20 });
    expect(avancement([], etats, redigees).pourcentage).toBe(0);
  });

  it('propose la dernière leçon ouverte non validée, sinon la première à faire', () => {
    expect(leconAReprendre(['A', 'B', 'C', 'D'], etats, redigees)).toBe('B');
    expect(leconAReprendre(['A', 'D'], etats, redigees)).toBe('D');
    expect(leconAReprendre(['A'], etats, redigees)).toBeUndefined();
  });

  it('liste les prérequis rédigés non validés, modules compris', () => {
    const modules = (id: string) => (id === 'M' ? ['A', 'C', 'Z'] : undefined);
    expect(prerequisAValider(['A', 'B', 'Z', 'M'], etats, redigees, modules)).toEqual(['B', 'M']);
  });

  it('efface la progression', () => {
    const d = creerDepotLocal(stockageMemoire(), date);
    d.marquerVue('A');
    d.effacer();
    expect(d.lireTout()).toEqual({});
  });
});
