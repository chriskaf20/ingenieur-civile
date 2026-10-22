import { describe, expect, it } from 'vitest';
import { agregerGlossaire } from '@/lib/contenu/glossaire';
import { ancre, chercher, normaliser, preparer, type EntreeRecherche } from './index';

const e = (type: EntreeRecherche['type'], titre: string, resume = '', aVenir = false): EntreeRecherche => ({
  type,
  titre,
  resume,
  contexte: '',
  url: `/${ancre(titre)}`,
  aVenir,
});

describe('normalisation', () => {
  it('retire accents, ligatures et ponctuation, garde les points des identifiants', () => {
    expect(normaliser('  Œuvre : BÉTON armé ! ')).toBe('oeuvre beton arme');
    expect(normaliser('L3.6.6')).toBe('l3.6.6');
    expect(ancre('Béton de propreté')).toBe('beton-de-proprete');
  });
});

describe('recherche', () => {
  const index = preparer([
    e('lecon', 'Poteau en compression centrée', 'Dimensionner un poteau en béton armé'),
    e('terme', 'Béton de propreté', 'Mince couche de béton maigre'),
    e('lecon', 'Béton : composition', 'Doser un béton', true),
    e('formule', 'Effort normal résistant', 'poteau'),
  ]);

  it('exige tous les mots, sans tenir compte des accents', () => {
    expect(chercher(index, 'beton proprete').map((r) => r.titre)).toEqual(['Béton de propreté']);
    expect(chercher(index, 'acier inox')).toEqual([]);
    expect(chercher(index, '   ')).toEqual([]);
  });

  it('classe le titre avant le texte, et les leçons à venir après', () => {
    // « poteau » : début de mot du titre (10 + 3) > résumé de la formule (2 + 1)
    expect(chercher(index, 'poteau').map((r) => r.type)).toEqual(['lecon', 'formule']);
    // « béton » : titre du terme (10 + 2 = 12) > titre de la leçon à venir (10 + 3 − 3 = 10) > résumé du poteau (2 + 3 = 5)
    expect(chercher(index, 'béton').map((r) => r.titre)).toEqual(['Béton de propreté', 'Béton : composition', 'Poteau en compression centrée']);
  });
});

describe('glossaire général', () => {
  it('fusionne les termes identiques, dédoublonne les définitions et trie en français', () => {
    const l = (id: string) => ({ leconId: id, leconTitre: `Leçon ${id}`, slug: id.toLowerCase() });
    const g = agregerGlossaire([
      { terme: 'Semelle filante', definition: 'Fondation continue sous un mur.', ...l('L3.6.6') },
      { terme: 'Échelle', definition: 'Rapport entre le dessin et la réalité.', ...l('L1.6.5') },
      { terme: 'semelle filante', definition: 'Fondation continue sous un mur.', ...l('L3.3.5') },
      { terme: 'Semelle filante', definition: 'Fondation linéaire.', ...l('L3.6.9') },
      { terme: 'Armature', definition: 'Barre d’acier.', ...l('L3.3.5') },
    ]);
    expect(g.map((t) => t.terme)).toEqual(['Armature', 'Échelle', 'Semelle filante']);
    expect(g[1]?.lettre).toBe('E');
    const semelle = g[2]!;
    expect(semelle.definitions).toHaveLength(2);
    expect(semelle.definitions[0]?.lecons.map((x) => x.id)).toEqual(['L3.6.6', 'L3.3.5']);
  });
});
