// Accès au contenu, côté serveur uniquement (lecture du disque au build).
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import type { Cursus, LeconCursus, ModuleCursus } from './cursus';
import { schemaFrontmatter, type Frontmatter } from './schema';

const RACINE = process.cwd();
const DOSSIER_LECONS = path.join(RACINE, 'content', 'lecons');

let cursusCache: Cursus | null = null;
export function cursus(): Cursus {
  cursusCache ??= JSON.parse(fs.readFileSync(path.join(RACINE, 'content', 'cursus.json'), 'utf8')) as Cursus;
  return cursusCache;
}

export interface Lecon {
  slug: string;
  meta: Frontmatter;
  cursus: LeconCursus;
  module: ModuleCursus;
}

function lireFrontmatter(fichier: string): Frontmatter {
  const source = fs.readFileSync(fichier, 'utf8');
  const bloc = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!bloc) throw new Error(`${path.basename(fichier)} : frontmatter absent`);
  const resultat = schemaFrontmatter.safeParse(parse(bloc[1]!));
  if (!resultat.success) {
    throw new Error(`${path.basename(fichier)} : frontmatter invalide\n${resultat.error.issues.map((i) => `- ${i.path.join('.')} : ${i.message}`).join('\n')}`);
  }
  return resultat.data;
}

let leconsCache: Lecon[] | null = null;

/** Toutes les leçons rédigées, dans l'ordre du cursus. Échoue au build si une leçon est incohérente. */
export function lecons(): Lecon[] {
  if (leconsCache) return leconsCache;
  const c = cursus();
  const ordre = Object.keys(c.lecons);
  const liste = fs
    .readdirSync(DOSSIER_LECONS)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, '');
      const meta = lireFrontmatter(path.join(DOSSIER_LECONS, f));
      const entree = c.lecons[meta.id];
      if (!entree) throw new Error(`${f} : l'identifiant ${meta.id} n'existe pas dans CURRICULUM.md`);
      const module = c.modules.find((m) => m.id === entree.module);
      if (!module) throw new Error(`${f} : module ${entree.module} introuvable`);
      return { slug, meta, cursus: entree, module };
    });
  const ids = new Set<string>();
  for (const l of liste) {
    if (ids.has(l.meta.id)) throw new Error(`leçon ${l.meta.id} rédigée deux fois`);
    ids.add(l.meta.id);
  }
  leconsCache = liste.sort((a, b) => ordre.indexOf(a.meta.id) - ordre.indexOf(b.meta.id));
  return leconsCache;
}

export function leconParSlug(slug: string): Lecon | undefined {
  return lecons().find((l) => l.slug === slug);
}

export function leconParId(id: string): Lecon | undefined {
  return lecons().find((l) => l.meta.id === id);
}

/** Durée lisible : 90 → « 1 h 30 ». */
export function dureeLisible(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}
