import { cursus, lecons } from '@/lib/contenu';

export const dynamic = 'force-static';

/** Pages à mettre en cache dès l'installation du service worker. */
export function GET() {
  return Response.json([
    '/',
    '/tableau-de-bord',
    '/glossaire',
    '/recherche',
    '/recherche.json',
    '/design',
    ...lecons().map((l) => `/lecons/${l.slug}`),
    ...cursus().modules.map((m) => `/modules/${m.id}`),
  ]);
}
