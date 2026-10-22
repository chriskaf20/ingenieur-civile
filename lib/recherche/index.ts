// Recherche plein texte hors ligne : index statique (généré au build) et classement simple.

export type TypeEntree = 'lecon' | 'module' | 'terme' | 'formule';

export interface EntreeRecherche {
  type: TypeEntree;
  titre: string;
  /** Texte secondaire affiché sous le titre (objectif, définition…). */
  resume: string;
  /** Mots-clés supplémentaires, cherchés mais non affichés. */
  motsCles?: string;
  /** Repère affiché (ex. « L3.6.6 · Mur de clôture »). */
  contexte: string;
  url: string;
  /** Leçon pas encore rédigée : classée après les autres. */
  aVenir?: boolean;
}

/** Minuscules, sans accents ni ligatures, ponctuation remplacée par des espaces. */
export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim();
}

interface EntreePreparee {
  entree: EntreeRecherche;
  titre: string;
  mots: string[];
  reste: string;
}

export function preparer(index: readonly EntreeRecherche[]): EntreePreparee[] {
  return index.map((entree) => {
    const titre = normaliser(entree.titre);
    return {
      entree,
      titre,
      mots: titre.split(' '),
      reste: normaliser(`${entree.contexte} ${entree.resume} ${entree.motsCles ?? ''}`),
    };
  });
}

const POIDS_TYPE: Record<TypeEntree, number> = { lecon: 3, terme: 2, module: 2, formule: 1 };

/**
 * Chaque mot de la requête doit figurer dans l'entrée (début de mot du titre,
 * ou n'importe où ailleurs). Score : titre exact 40, début de mot du titre 10,
 * ailleurs dans le titre 6, dans le reste 2 ; plus un petit bonus de type.
 */
export function chercher(preparees: readonly EntreePreparee[], requete: string, limite = 40): EntreeRecherche[] {
  const q = normaliser(requete);
  const termes = q.split(' ').filter((t) => t.length > 0);
  if (termes.length === 0) return [];
  const resultats: { e: EntreeRecherche; score: number }[] = [];
  for (const p of preparees) {
    let score = 0;
    let complet = true;
    for (const t of termes) {
      if (p.mots.some((m) => m.startsWith(t))) score += 10;
      else if (p.titre.includes(t)) score += 6;
      else if (p.reste.includes(t)) score += 2;
      else {
        complet = false;
        break;
      }
    }
    if (!complet) continue;
    if (p.titre === q) score += 40;
    score += POIDS_TYPE[p.entree.type];
    if (p.entree.aVenir) score -= 3;
    resultats.push({ e: p.entree, score });
  }
  resultats.sort((a, b) => b.score - a.score || a.e.titre.localeCompare(b.e.titre, 'fr'));
  return resultats.slice(0, limite).map((r) => r.e);
}

/** Identifiant d'ancre stable : « Béton de propreté » → « beton-de-proprete ». */
export function ancre(texte: string): string {
  return normaliser(texte).replace(/\./g, '').replace(/ +/g, '-');
}
