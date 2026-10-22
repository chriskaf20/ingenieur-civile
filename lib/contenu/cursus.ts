// Types de content/cursus.json (généré par scripts/cursus.mjs à partir de CURRICULUM.md).

export interface NiveauCursus {
  id: string;
  titre: string;
  but: string;
  modules: string[];
}

export interface ModuleCursus {
  id: string;
  niveau: string;
  titre: string;
  prerequis: string[];
  lecons: string[];
}

export interface LeconCursus {
  id: string;
  module: string;
  chapitre: string | null;
  titre: string;
  objectif: string;
  prerequis: string[];
  toutLeModule: boolean;
  duree: number; // minutes
  gabarits: string[];
  type: 'lecon' | 'projet' | 'examen';
  marqueurs: string[];
  vitrine: boolean;
  aVerifier: boolean;
}

export interface Cursus {
  niveaux: NiveauCursus[];
  modules: ModuleCursus[];
  lecons: Record<string, LeconCursus>;
}
