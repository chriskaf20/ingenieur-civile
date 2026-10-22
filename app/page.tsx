import Link from 'next/link';
import { cursus, dureeLisible, lecons } from '@/lib/contenu';

export default function Accueil() {
  const c = cursus();
  const redigees = lecons();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="rounded-lg bg-papier p-6 shadow-sm">
        <p className="font-technique text-sm uppercase tracking-widest text-beton">Du bac à l’ingénieur civil confirmé</p>
        <h1 className="mt-1 font-technique text-4xl font-bold text-encre">Génie Civil Académie</h1>
        <p className="mt-3 max-w-3xl text-lg">
          Un parcours complet et progressif : {c.modules.length} modules, {Object.values(c.lecons).filter((l) => l.type === 'lecon').length} leçons,
          des fiches de calcul interactives, des planches d’exécution et des cas concrets d’Afrique centrale.
        </p>
        <p className="mt-2 text-beton">
          Aperçu de la phase 2 : les cinq leçons vitrines ci-dessous montrent les cinq gabarits de page. La carte complète du parcours arrive en phase 3.
        </p>
      </section>

      <h2 className="mt-8 font-technique text-2xl font-bold text-encre">Leçons vitrines</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {redigees.map((l) => (
          <li key={l.slug}>
            <Link href={`/lecons/${l.slug}`} className="block h-full rounded-lg border border-black/10 bg-papier p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="font-technique text-sm text-beton">
                {l.meta.id} · {l.module.titre}
              </p>
              <p className="mt-1 font-technique text-xl font-bold text-encre">{l.meta.titre}</p>
              <p className="mt-1 text-[0.95rem]">{l.cursus.objectif}</p>
              <p className="mt-2 font-technique text-sm text-beton">{dureeLisible(l.cursus.duree)}</p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-technique text-2xl font-bold text-encre">Le parcours</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {c.niveaux.map((n) => {
          const mods = c.modules.filter((m) => m.niveau === n.id);
          const duree = mods.flatMap((m) => m.lecons).reduce((a, id) => a + (c.lecons[id]?.duree ?? 0), 0);
          return (
            <section key={n.id} className="rounded-lg border border-black/10 bg-papier p-4">
              <h3 className="font-technique text-lg font-bold text-encre">{n.titre}</h3>
              <p className="text-[0.95rem] text-beton">
                {n.but} · {mods.length} modules · {Math.round(duree / 60)} h
              </p>
              <ul className="mt-2 grid gap-0.5 text-[0.92rem]">
                {mods.map((m) => (
                  <li key={m.id}>
                    <span className="font-technique text-beton">{m.id}</span> {m.titre}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mt-8 font-technique">
        <Link href="/design" className="text-encre underline">
          Voir le design system et la bibliothèque de schémas →
        </Link>
      </p>
    </div>
  );
}
