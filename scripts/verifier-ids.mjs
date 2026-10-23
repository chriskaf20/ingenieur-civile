// Après le build : vérifie qu'aucune page ne définit deux fois le même motif SVG (pattern, marker…).
// Le lecteur paginé masque les feuilles inactives (display: none) ; un url(#id) dupliqué peut alors
// pointer vers la copie d'une feuille masquée, que le navigateur ne peint pas (hachures disparues).
// Usage : node scripts/verifier-ids.mjs   (échoue si un doublon est trouvé)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const dossier = join(racine, '.next', 'server', 'app');

function pagesHtml(dir) {
  return readdirSync(dir).flatMap((nom) => {
    const chemin = join(dir, nom);
    if (statSync(chemin).isDirectory()) return pagesHtml(chemin);
    return nom.endsWith('.html') ? [chemin] : [];
  });
}

const erreurs = [];
for (const fichier of pagesHtml(dossier)) {
  const html = readFileSync(fichier, 'utf8');
  const ids = [...html.matchAll(/<(?:pattern|marker|linearGradient|radialGradient|clipPath|mask)\b[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
  const vus = new Map();
  for (const id of ids) vus.set(id, (vus.get(id) ?? 0) + 1);
  const doublons = [...vus].filter(([, n]) => n > 1).map(([id, n]) => `${id} ×${n}`);
  if (doublons.length) erreurs.push(`${relative(racine, fichier)} : ${doublons.join(', ')}`);
}

if (erreurs.length) {
  console.error('Identifiants SVG dupliqués (donner un préfixe distinct à chaque schéma de la page) :');
  for (const e of erreurs) console.error(`  ${e}`);
  process.exit(1);
}
console.log('Identifiants SVG : aucun doublon.');
