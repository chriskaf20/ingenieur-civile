// Accès au contenu, côté serveur uniquement (lecture du disque au build).
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import type { Cursus, LeconCursus, ModuleCursus } from './cursus';
import { schemaFrontmatter, type Frontmatter } from './schema';
import { agregerGlossaire, type TermeGlossaire } from './glossaire';
import type { EntreeRecherche } from '@/lib/recherche';

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

/** Leçons rédigées qui précèdent et suivent `id` dans l'ordre du cursus. */
export function voisines(id: string): { precedente?: Lecon; suivante?: Lecon } {
  const liste = lecons();
  const i = liste.findIndex((l) => l.meta.id === id);
  return { precedente: i > 0 ? liste[i - 1] : undefined, suivante: i >= 0 ? liste[i + 1] : undefined };
}

/** Titres des pages et intertitres d'une leçon (pour la recherche). */
function titresDePages(slug: string): string[] {
  const source = fs.readFileSync(path.join(DOSSIER_LECONS, `${slug}.mdx`), 'utf8');
  const attributs = [...source.matchAll(/\btitre="([^"]+)"/g)].map((m) => m[1]!);
  const intertitres = [...source.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1]!.trim());
  return [...attributs, ...intertitres];
}

export function moduleParId(id: string): ModuleCursus | undefined {
  return cursus().modules.find((m) => m.id === id);
}

/** Adresse d'une entrée du cursus : la leçon si elle est rédigée, sinon sa ligne dans la page du module. */
export function urlCursus(id: string): string {
  const l = leconParId(id);
  if (l) return `/lecons/${l.slug}`;
  const entree = cursus().lecons[id];
  return entree ? `/modules/${entree.module}#${id}` : `/modules/${id}`;
}

export function glossaireGeneral(): TermeGlossaire[] {
  return agregerGlossaire(
    lecons().flatMap((l) => l.meta.glossaire.map((g) => ({ ...g, leconId: l.meta.id, leconTitre: l.meta.titre, slug: l.slug }))),
  );
}

/** Index complet de la recherche hors ligne. */
export function indexRecherche(): EntreeRecherche[] {
  const c = cursus();
  const index: EntreeRecherche[] = [];
  for (const m of c.modules) {
    const niveau = c.niveaux.find((n) => n.id === m.niveau);
    index.push({ type: 'module', titre: m.titre, resume: `${m.lecons.length} séances`, contexte: `Module ${m.id} · ${niveau?.titre ?? m.niveau}`, url: `/modules/${m.id}` });
  }
  for (const e of Object.values(c.lecons)) {
    const l = leconParId(e.id);
    const m = c.modules.find((x) => x.id === e.module);
    index.push({
      type: 'lecon',
      titre: e.titre,
      resume: e.objectif,
      motsCles: l ? [...l.meta.objectifs, ...l.meta.normes, ...titresDePages(l.slug)].join(' · ') : undefined,
      contexte: `${e.id} · ${m?.titre ?? e.module}`,
      url: urlCursus(e.id),
      aVenir: !l,
    });
  }
  for (const t of glossaireGeneral()) {
    index.push({
      type: 'terme',
      titre: t.terme,
      resume: t.definitions.map((d) => d.texte).join(' '),
      contexte: `Glossaire · ${t.definitions.flatMap((d) => d.lecons.map((x) => x.id)).join(', ')}`,
      url: `/glossaire#${t.ancre}`,
    });
  }
  for (const l of lecons()) {
    for (const f of l.meta.formules) {
      index.push({ type: 'formule', titre: f.nom, resume: f.domaine, contexte: `${l.meta.id} · ${l.meta.titre}`, url: `/lecons/${l.slug}` });
    }
  }
  return index;
}
