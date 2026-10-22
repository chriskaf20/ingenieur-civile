import { indexRecherche } from '@/lib/contenu';

export const dynamic = 'force-static';

/** Index de la recherche, généré au build et mis en cache par le service worker. */
export function GET() {
  return Response.json(indexRecherche());
}
