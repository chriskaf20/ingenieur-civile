import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Recherche } from '@/components/site/Recherche';

export const metadata: Metadata = { title: 'Recherche' };

export default function PageRecherche() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-technique text-3xl font-bold text-encre">Recherche</h1>
      <p className="text-beton">Leçons (rédigées ou à venir), modules, termes du glossaire et formules. Fonctionne hors ligne.</p>
      <Suspense fallback={<p className="mt-4 text-beton">Chargement…</p>}>
        <Recherche />
      </Suspense>
    </div>
  );
}
