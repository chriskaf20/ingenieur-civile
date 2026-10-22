// Regroupement des glossaires de leçons en un glossaire général (fonction pure).
import { ancre, normaliser } from '@/lib/recherche';

export interface TermeSource {
  terme: string;
  definition: string;
  leconId: string;
  leconTitre: string;
  slug: string;
}

export interface TermeGlossaire {
  terme: string;
  ancre: string;
  lettre: string;
  /** Définitions distinctes, chacune avec les leçons qui l'emploient (ordre du cursus conservé). */
  definitions: { texte: string; lecons: { id: string; titre: string; slug: string }[] }[];
}

/** Fusionne les termes identiques (casse et accents ignorés) et trie par ordre alphabétique français. */
export function agregerGlossaire(sources: readonly TermeSource[]): TermeGlossaire[] {
  const parCle = new Map<string, TermeGlossaire>();
  for (const s of sources) {
    const cle = normaliser(s.terme);
    let t = parCle.get(cle);
    if (!t) {
      t = { terme: s.terme, ancre: ancre(s.terme), lettre: (cle[0] ?? '#').toUpperCase(), definitions: [] };
      parCle.set(cle, t);
    }
    const lecon = { id: s.leconId, titre: s.leconTitre, slug: s.slug };
    const def = t.definitions.find((d) => normaliser(d.texte) === normaliser(s.definition));
    if (def) {
      if (!def.lecons.some((l) => l.id === lecon.id)) def.lecons.push(lecon);
    } else t.definitions.push({ texte: s.definition, lecons: [lecon] });
  }
  return [...parCle.values()].sort((a, b) => a.terme.localeCompare(b.terme, 'fr', { sensitivity: 'base' }));
}
