// Lit CURRICULUM.md (source unique du cursus), vérifie sa cohérence,
// met à jour la vue d'ensemble et écrit content/cursus.json.
// Usage : node scripts/cursus.mjs        (échoue si une erreur est trouvée)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const fichierCursus = join(racine, 'CURRICULUM.md');
const fichierJson = join(racine, 'content', 'cursus.json');

const NIVEAUX = {
  N0: 'Niveau 0 — Mise à niveau',
  L1: 'L1 — Fondamentaux',
  L2: "L2 — Bases de l'ingénieur",
  L3: 'L3 — Cœur du métier',
  M1: 'M1 — Approfondissement',
  M2: 'M2 — Spécialisation et projet',
  PP: 'Pratique professionnelle',
};
const ID_RE = /^(N0|L1|L2|L3|M1|M2|PP)\.(\d+)\.(\d+|P|EX)$/;
const MOD_RE = /^(N0|L1|L2|L3|M1|M2|PP)\.(\d+)$/;

const minutes = (d) => {
  const h = d.trim().match(/^(\d+) h(?: (\d+))?$/);
  if (h) return Number(h[1]) * 60 + Number(h[2] ?? 0);
  const m = d.trim().match(/^(\d+) min$/);
  return m ? Number(m[1]) : NaN;
};
const liste = (s) => (s === '—' ? [] : s.split(/,\s*/));

let src = readFileSync(fichierCursus, 'utf8');
const ordre = new Map();
const modules = [];
const lecons = {};
const buts = {};
const erreurs = [];
const avertissements = [];
let mod = null;
let chapitre = null;
let niveauCourant = null;
let rang = 0;

for (const ligne of src.split(/\r?\n/)) {
  const niv = ligne.match(/^## (?:Niveau 0|L1|L2|L3|M1|M2|PP)\b/);
  if (niv) niveauCourant = ligne.match(/^## (Niveau 0|L1|L2|L3|M1|M2|PP)/)[1].replace('Niveau 0', 'N0');
  const but = ligne.match(/^\*But : (.+)\*$/);
  if (but && niveauCourant) buts[niveauCourant] = but[1];

  const h = ligne.match(/^### ((?:N0|L1|L2|L3|M1|M2|PP)\.\d+) — (.+)$/);
  if (h) {
    mod = { id: h[1], niveau: h[1].split('.')[0], titre: h[2], prerequis: [], lecons: [] };
    chapitre = null;
    if (ordre.has(mod.id)) erreurs.push(`module dupliqué ${mod.id}`);
    ordre.set(mod.id, rang++);
    modules.push(mod);
    continue;
  }
  const p = ligne.match(/^Prérequis module : (.+)$/);
  if (p && mod) { mod.prerequis = liste(p[1]); continue; }
  if (!ligne.startsWith('| ')) continue;
  const cel = ligne.split('|').slice(1, -1).map((c) => c.trim());
  const ch = cel[1]?.match(/^\*\*(Ch\. \d+ — .+)\*\*$/);
  if (!cel[0] && ch) { chapitre = ch[1]; continue; }
  if (!ID_RE.test(cel[0])) continue;
  if (cel.length !== 6) { erreurs.push(`${cel[0]} : ${cel.length} colonnes`); continue; }
  const [id, titreBrut, objectif, pre, duree, gab] = cel;
  if (ordre.has(id)) erreurs.push(`ID dupliqué ${id}`);
  if (!mod || !id.startsWith(mod.id + '.')) erreurs.push(`${id} hors de son module`);
  ordre.set(id, rang++);
  const min = minutes(duree);
  if (Number.isNaN(min)) erreurs.push(`${id} : durée illisible « ${duree} »`);
  if (!/^[A-E]( [A-E])*$/.test(gab)) erreurs.push(`${id} : gabarits « ${gab} »`);
  if (!objectif) erreurs.push(`${id} : objectif vide`);
  const suffixe = id.split('.')[2];
  const marqueurs = [...titreBrut.matchAll(/`(RDC|FR)`/g)].map((m) => m[1]);
  const titre = titreBrut.replace(/`(RDC|FR)`/g, '').replace('★', '').replace('⚠', '').replace(/\s+/g, ' ').trim();
  lecons[id] = {
    id,
    module: mod?.id ?? '',
    chapitre,
    titre,
    objectif,
    prerequis: liste(pre).filter((x) => x !== '∗'),
    toutLeModule: pre.includes('∗'),
    duree: min,
    gabarits: gab.split(' '),
    type: suffixe === 'P' ? 'projet' : suffixe === 'EX' ? 'examen' : 'lecon',
    marqueurs,
    vitrine: titreBrut.includes('★'),
    aVerifier: titreBrut.includes('⚠'),
  };
  mod?.lecons.push(id);
}

for (const m of modules) {
  const nums = m.lecons.map((id) => id.split('.')[2]).filter((s) => /^\d+$/.test(s)).map(Number);
  nums.forEach((n, i) => { if (n !== i + 1) erreurs.push(`${m.id} : numérotation (${n} au rang ${i + 1})`); });
  if (!m.lecons.some((id) => id.endsWith('.P'))) erreurs.push(`${m.id} : pas de mini-projet`);
  if (!m.lecons.some((id) => id.endsWith('.EX'))) erreurs.push(`${m.id} : pas d'examen`);
}

const verifier = (de, ref) => {
  if (!ID_RE.test(ref) && !MOD_RE.test(ref)) { erreurs.push(`${de} : référence mal formée « ${ref} »`); return; }
  if (!ordre.has(ref)) { erreurs.push(`${de} : référence inconnue ${ref}`); return; }
  if (ref === de) erreurs.push(`${de} : se cite lui-même`);
  if (ordre.get(ref) > ordre.get(de)) {
    const tolere = ref.split('.')[0] === de.split('.')[0] || de.startsWith('PP') || ref.startsWith('PP');
    (tolere ? avertissements : erreurs).push(`${de} → ${ref} (référence vers l'avant)`);
  }
};
for (const m of modules) m.prerequis.forEach((r) => verifier(m.id, r));
for (const l of Object.values(lecons)) l.prerequis.forEach((r) => verifier(l.id, r));

const vitrines = Object.values(lecons).filter((l) => l.vitrine).length;
if (vitrines !== 5) erreurs.push(`${vitrines} leçons vitrines au lieu de 5`);

// Vue d'ensemble
const heures = (min) => `${Math.round(min / 60)} h`;
const parNiveau = {};
for (const m of modules) {
  const n = (parNiveau[m.niveau] ??= { modules: 0, lecons: 0, projets: 0, min: 0 });
  n.modules++;
  for (const id of m.lecons) {
    const l = lecons[id];
    if (l.type === 'lecon') n.lecons++; else n.projets++;
    n.min += l.duree;
  }
}
const total = Object.values(parNiveau).reduce(
  (a, b) => ({ modules: a.modules + b.modules, lecons: a.lecons + b.lecons, projets: a.projets + b.projets, min: a.min + b.min }),
  { modules: 0, lecons: 0, projets: 0, min: 0 },
);
let table = '| Niveau | Modules | Leçons | Mini-projets + examens | Durée estimée |\n|---|---|---|---|---|\n';
for (const [niv, n] of Object.entries(parNiveau)) table += `| ${NIVEAUX[niv]} | ${n.modules} | ${n.lecons} | ${n.projets} | ${heures(n.min)} |\n`;
table += `| **Total** | **${total.modules}** | **${total.lecons}** | **${total.projets}** | **${heures(total.min)}** |\n\n`;
table += '| Module | Titre | Leçons | Durée |\n|---|---|---|---|\n';
for (const m of modules) {
  const n = m.lecons.filter((id) => lecons[id].type === 'lecon').length;
  const min = m.lecons.reduce((a, id) => a + lecons[id].duree, 0);
  table += `| ${m.id} | ${m.titre} | ${n} | ${heures(min)} |\n`;
}
table += "\n*Tableaux générés par `scripts/cursus.mjs` à partir des lignes du cursus (durées arrondies à l'heure).*";

console.log(`cursus : ${total.modules} modules, ${total.lecons} leçons, ${total.projets} projets/examens, ${heures(total.min)}`);
avertissements.forEach((w) => console.log('  avertissement : ' + w));
if (erreurs.length) {
  erreurs.forEach((e) => console.error('  erreur : ' + e));
  process.exit(1);
}

const nouveau = src.replace(/<!-- RESUME:DEBUT -->[\s\S]*<!-- RESUME:FIN -->/, `<!-- RESUME:DEBUT -->\n${table}\n<!-- RESUME:FIN -->`);
if (nouveau !== src) writeFileSync(fichierCursus, nouveau);

const niveaux = Object.keys(NIVEAUX).map((id) => ({
  id,
  titre: NIVEAUX[id],
  but: buts[id] ?? '',
  modules: modules.filter((m) => m.niveau === id).map((m) => m.id),
}));
mkdirSync(dirname(fichierJson), { recursive: true });
writeFileSync(fichierJson, JSON.stringify({ niveaux, modules, lecons }, null, 1) + '\n');
