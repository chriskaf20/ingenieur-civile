import Link from 'next/link';
import { BarreAvancement, Reprendre } from '@/components/progression/Progression';
import { cursus, dureeLisible, lecons } from '@/lib/contenu';
import { SEUIL_TEXTE } from '@/lib/progression/types';

export default function Accueil() {
  const c = cursus();
  const redigees = lecons();
  const idsRedigees = redigees.map((l) => l.meta.id);
  const ordre = Object.keys(c.lecons);
  const nbLecons = Object.values(c.lecons).filter((l) => l.type === 'lecon').length;
  const dureeTotale = Object.values(c.lecons).reduce((a, l) => a + l.duree, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="rounded-lg bg-papier p-5 shadow-sm sm:p-6">
        <p className="font-technique text-sm uppercase tracking-widest text-beton">Du bac à l’ingénieur civil confirmé</p>
        <h1 className="mt-1 font-technique text-4xl font-bold text-encre">Génie Civil Académie</h1>
        <p className="mt-3 max-w-3xl text-lg">
          {c.modules.length} modules, {nbLecons} leçons, environ {Math.round(dureeTotale / 60)} heures de travail : fiches de calcul interactives,
          planches d’exécution, exercices corrigés et cas concrets d’Afrique centrale.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_18rem] md:items-center">
          <Reprendre ordre={ordre} redigees={redigees.map((l) => ({ id: l.meta.id, slug: l.slug, titre: l.meta.titre, module: l.module.id }))} />
          <div>
            <p className="mb-1 font-technique text-sm font-semibold text-trait">Ton avancement sur tout le parcours</p>
            <BarreAvancement ids={ordre} redigees={idsRedigees} />
          </div>
        </div>
        <p className="mt-3 text-[0.95rem] text-beton">
          {redigees.length} leçons sont déjà rédigées ; les autres apparaissent « à venir » sur la carte. Une leçon est validée quand son quiz atteint {SEUIL_TEXTE}.
        </p>
      </section>

      <h2 className="mt-10 font-technique text-2xl font-bold text-encre">La carte du parcours</h2>
      <p className="text-beton">Chaque niveau s’appuie sur le précédent. Clique sur un module pour voir ses leçons.</p>

      <ol className="mt-4">
        {c.niveaux.map((n, i) => {
          const mods = c.modules.filter((m) => m.niveau === n.id);
          const ids = mods.flatMap((m) => m.lecons);
          const duree = ids.reduce((a, id) => a + (c.lecons[id]?.duree ?? 0), 0);
          const dernier = i === c.niveaux.length - 1;
          return (
            <li key={n.id} className="relative pb-8 pl-12 sm:pl-16">
              {/* rail vertical et station du niveau */}
              {dernier ? null : <span aria-hidden="true" className="absolute bottom-0 left-[1.15rem] top-10 w-1 rounded bg-encre/25 sm:left-[1.4rem]" />}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border-4 border-encre bg-papier font-technique text-sm font-bold text-encre sm:h-12 sm:w-12"
              >
                {n.id}
              </span>
              <section aria-labelledby={`niveau-${n.id}`}>
                <h3 id={`niveau-${n.id}`} className="font-technique text-xl font-bold text-encre sm:text-2xl">
                  {n.titre}
                </h3>
                <p className="text-[0.95rem] text-beton">
                  Objectif : {n.but} · {mods.length} modules · {Math.round(duree / 60)} h
                </p>
                <div className="mt-2 max-w-md">
                  <BarreAvancement ids={ids} redigees={idsRedigees.filter((id) => ids.includes(id))} compacte />
                </div>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {mods.map((m) => {
                    const dispo = m.lecons.filter((id) => idsRedigees.includes(id));
                    const dureeModule = m.lecons.reduce((a, id) => a + (c.lecons[id]?.duree ?? 0), 0);
                    return (
                      <li key={m.id}>
                        <Link
                          href={`/modules/${m.id}`}
                          className="flex h-full flex-col rounded-lg border border-trait/10 bg-papier p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-encre/40 hover:shadow-md"
                        >
                          <span className="flex items-baseline justify-between gap-2 font-technique text-[0.85rem] text-beton">
                            <span className="font-semibold">{m.id}</span>
                            <span>
                              {m.lecons.length} séances · {dureeLisible(dureeModule)}
                            </span>
                          </span>
                          <span className="mt-0.5 flex-1 font-technique text-[1.12rem] font-bold leading-snug text-trait">{m.titre}</span>
                          {dispo.length ? (
                            <span className="mt-1 font-technique text-[0.8rem] text-validation">
                              {dispo.length} leçon{dispo.length > 1 ? 's' : ''} disponible{dispo.length > 1 ? 's' : ''}
                            </span>
                          ) : null}
                          <span className="mt-2">
                            <BarreAvancement ids={m.lecons} redigees={dispo} compacte />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </li>
          );
        })}
      </ol>

      <p className="mt-2 font-technique">
        <Link href="/design" className="text-encre underline">
          Voir le design system et la bibliothèque de schémas →
        </Link>
      </p>
    </div>
  );
}
