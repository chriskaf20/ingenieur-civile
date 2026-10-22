import type { Metadata } from 'next';
import { BarreAvancement, Reprendre } from '@/components/progression/Progression';
import { EffacerProgression, TableauLecons } from '@/components/progression/TableauLecons';
import { cursus, lecons } from '@/lib/contenu';

export const metadata: Metadata = { title: 'Tableau de bord' };

export default function TableauDeBord() {
  const c = cursus();
  const redigees = lecons().map((l) => ({ id: l.meta.id, slug: l.slug, titre: l.meta.titre, module: l.module.id }));
  const ids = redigees.map((l) => l.id);
  const ordre = Object.keys(c.lecons);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-technique text-3xl font-bold text-encre">Tableau de bord</h1>
      <p className="text-beton">Ta progression est enregistrée sur cet appareil, même hors ligne.</p>

      <section className="mt-4 grid gap-4 rounded-lg bg-papier p-5 shadow-sm md:grid-cols-2">
        <div>
          <h2 className="font-technique text-lg font-bold text-trait">Prochaine étape</h2>
          <div className="mt-2">
            <Reprendre ordre={ordre} redigees={redigees} />
          </div>
        </div>
        <div>
          <h2 className="font-technique text-lg font-bold text-trait">Tout le parcours</h2>
          <div className="mt-2">
            <BarreAvancement ids={ordre} redigees={ids} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg bg-papier p-5 shadow-sm">
        <h2 className="font-technique text-lg font-bold text-trait">Par niveau</h2>
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          {c.niveaux.map((n) => {
            const idsNiveau = c.modules.filter((m) => m.niveau === n.id).flatMap((m) => m.lecons);
            return (
              <li key={n.id}>
                <p className="font-technique font-semibold text-encre">{n.titre}</p>
                <BarreAvancement ids={idsNiveau} redigees={ids.filter((x) => idsNiveau.includes(x))} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 rounded-lg bg-papier p-5 shadow-sm">
        <h2 className="font-technique text-lg font-bold text-trait">Leçons disponibles</h2>
        <TableauLecons lecons={redigees} />
      </section>

      <section className="mt-6">
        <EffacerProgression />
      </section>
    </div>
  );
}
