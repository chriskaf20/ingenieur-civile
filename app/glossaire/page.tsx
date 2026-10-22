import type { Metadata } from 'next';
import Link from 'next/link';
import { glossaireGeneral } from '@/lib/contenu';

export const metadata: Metadata = { title: 'Glossaire', description: 'Tous les termes techniques définis dans les leçons.' };

export default function Glossaire() {
  const termes = glossaireGeneral();
  const lettres = [...new Set(termes.map((t) => t.lettre))];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-technique text-3xl font-bold text-encre">Glossaire</h1>
      <p className="text-beton">
        {termes.length} termes, repris des leçons rédigées. Il s’enrichit à chaque nouvelle leçon.
      </p>

      <nav aria-label="Lettres" className="sticky top-0 z-10 mt-3 flex flex-wrap gap-1 bg-bureau/95 py-2 font-technique">
        {lettres.map((l) => (
          <a key={l} href={`#lettre-${l}`} className="grid h-8 w-8 place-items-center rounded border border-encre/40 bg-papier font-bold text-encre hover:bg-encre-clair">
            {l}
          </a>
        ))}
      </nav>

      {lettres.map((lettre) => (
        <section key={lettre} id={`lettre-${lettre}`} className="mt-5 scroll-mt-14" aria-labelledby={`titre-${lettre}`}>
          <h2 id={`titre-${lettre}`} className="border-b-2 border-encre font-technique text-2xl font-bold text-encre">
            {lettre}
          </h2>
          <dl className="mt-2 grid gap-2">
            {termes
              .filter((t) => t.lettre === lettre)
              .map((t) => (
                <div key={t.ancre} id={t.ancre} className="scroll-mt-14 rounded-lg bg-papier p-3 shadow-sm target:ring-2 target:ring-encre">
                  <dt className="font-technique text-lg font-bold text-trait">{t.terme}</dt>
                  {t.definitions.map((d) => (
                    <dd key={d.texte} className="mt-0.5">
                      {d.texte}{' '}
                      <span className="font-technique text-[0.85rem] text-beton">
                        (
                        {d.lecons.map((l, i) => (
                          <span key={l.id}>
                            {i ? ', ' : ''}
                            <Link href={`/lecons/${l.slug}`} className="text-encre hover:underline" title={l.titre}>
                              {l.id}
                            </Link>
                          </span>
                        ))}
                        )
                      </span>
                    </dd>
                  ))}
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
