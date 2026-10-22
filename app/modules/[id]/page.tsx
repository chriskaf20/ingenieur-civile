import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeStatut, BarreAvancement, ConseilPrerequis } from '@/components/progression/Progression';
import { cursus, dureeLisible, leconParId, moduleParId, urlCursus } from '@/lib/contenu';

export const dynamicParams = false;

export function generateStaticParams() {
  return cursus().modules.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = moduleParId(id);
  return m ? { title: `Module ${m.id} · ${m.titre}` } : {};
}

const TYPES = { lecon: '', projet: 'Mini-projet', examen: 'Examen' } as const;

export default async function PageModule({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = cursus();
  const m = moduleParId(id);
  if (!m) notFound();
  const niveau = c.niveaux.find((n) => n.id === m.niveau);
  const rang = c.modules.indexOf(m);
  const avant = c.modules[rang - 1];
  const apres = c.modules[rang + 1];
  const entrees = m.lecons.map((x) => c.lecons[x]!);
  const redigees = entrees.filter((e) => leconParId(e.id)).map((e) => e.id);
  const duree = entrees.reduce((a, e) => a + e.duree, 0);

  // Données réduites pour les conseils de prérequis (calculés côté navigateur).
  const prerequisCites = [...new Set(entrees.flatMap((e) => e.prerequis))];
  const modulesCites: Record<string, string[]> = {};
  for (const p of prerequisCites) {
    const mod = moduleParId(p);
    if (mod) modulesCites[p] = mod.lecons;
  }
  const redigeesCitees = [...new Set([...prerequisCites, ...Object.values(modulesCites).flat()])].filter((x) => leconParId(x));

  // Regroupement par chapitre, dans l'ordre.
  const chapitres: { titre: string | null; entrees: typeof entrees }[] = [];
  for (const e of entrees) {
    const dernier = chapitres.at(-1);
    if (dernier && dernier.titre === e.chapitre) dernier.entrees.push(e);
    else chapitres.push({ titre: e.chapitre, entrees: [e] });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav aria-label="Fil d’Ariane" className="font-technique text-sm text-beton">
        <Link href="/" className="hover:underline">
          Parcours
        </Link>{' '}
        › {niveau?.titre ?? m.niveau}
      </nav>
      <header className="mt-2 rounded-lg bg-papier p-5 shadow-sm">
        <p className="font-technique text-sm uppercase tracking-widest text-beton">Module {m.id}</p>
        <h1 className="font-technique text-3xl font-bold text-encre">{m.titre}</h1>
        <p className="mt-1 text-beton">
          {entrees.length} séances · {dureeLisible(duree)}
          {m.prerequis.length ? (
            <>
              {' '}
              · Prérequis :{' '}
              {m.prerequis.map((p, i) => (
                <span key={p}>
                  {i ? ', ' : ''}
                  <Link href={urlCursus(p)} className="text-encre underline">
                    {p}
                  </Link>
                </span>
              ))}
            </>
          ) : null}
        </p>
        <div className="mt-3 max-w-lg">
          <BarreAvancement ids={m.lecons} redigees={redigees} />
        </div>
      </header>

      {chapitres.map((ch, i) => (
        <section key={`${ch.titre}-${i}`} className="mt-6">
          {ch.titre ? <h2 className="font-technique text-xl font-bold text-encre">{ch.titre}</h2> : null}
          <ol className="mt-2 grid gap-2">
            {ch.entrees.map((e) => {
              const l = leconParId(e.id);
              const titre = (
                <>
                  <span className="text-beton">{e.id}</span> {TYPES[e.type] ? `${TYPES[e.type]} : ` : ''}
                  {e.titre}
                </>
              );
              return (
                <li
                  key={e.id}
                  id={e.id}
                  className={`scroll-mt-4 rounded-lg border bg-papier p-3 target:ring-2 target:ring-encre ${l ? 'border-encre/30 shadow-sm' : 'border-trait/10'}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="font-technique text-[1.1rem] font-bold leading-snug">
                      {l ? (
                        <Link href={`/lecons/${l.slug}`} className="text-encre hover:underline">
                          {titre}
                        </Link>
                      ) : (
                        <span className="text-trait">{titre}</span>
                      )}
                    </h3>
                    <BadgeStatut id={e.id} redigee={Boolean(l)} />
                  </div>
                  <p className="mt-0.5 text-[0.95rem]">{e.objectif}</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 font-technique text-[0.82rem] text-beton">
                    <span>{dureeLisible(e.duree)}</span>
                    {e.prerequis.length ? <span>Prérequis : {e.prerequis.join(', ')}</span> : null}
                    {e.toutLeModule ? <span>Prérequis : tout le module</span> : null}
                    {e.marqueurs.includes('RDC') ? <span className="text-terre">Cas d’Afrique centrale</span> : null}
                    {e.marqueurs.includes('FR') ? <span className="text-brique">Eurocodes ↔ BAEL</span> : null}
                    {l ? <ConseilPrerequis prerequis={e.prerequis} redigees={redigeesCitees} modules={modulesCites} /> : null}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <nav className="mt-8 flex flex-wrap justify-between gap-3 font-technique" aria-label="Modules voisins">
        {avant ? (
          <Link href={`/modules/${avant.id}`} className="text-encre hover:underline">
            ← {avant.id} {avant.titre}
          </Link>
        ) : (
          <span />
        )}
        {apres ? (
          <Link href={`/modules/${apres.id}`} className="text-encre hover:underline">
            {apres.id} {apres.titre} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
