import Link from 'next/link';
import { Feuille } from './Feuille';
import { cursus, dureeLisible, leconParId, type Lecon } from '@/lib/contenu';

const GABARITS: Record<string, string> = { A: 'Fiche de calcul', B: 'Planche technique', C: 'Infographie', D: 'Fiche mémo', E: 'Vue 3D' };

/** Première page de chaque leçon (étape 1) : objectifs, prérequis, durée et gabarits. */
export function PageObjectifs({ lecon }: { lecon: Lecon }) {
  const { meta, cursus: c, module } = lecon;
  const toutes = cursus().lecons;
  const prerequis = c.prerequis.map((id) => {
    const l = toutes[id];
    const redigee = leconParId(id);
    const mod = cursus().modules.find((m) => m.id === id);
    return { id, titre: l?.titre ?? mod?.titre ?? id, slug: redigee?.slug };
  });
  return (
    <Feuille etape="objectifs">
      <p className="font-technique text-[0.95rem] uppercase tracking-wider text-beton">
        Module {module.id} · {module.titre}
        {c.chapitre ? ` · ${c.chapitre}` : ''}
      </p>
      <h1 className="mt-1 font-technique text-[2.1rem] font-bold leading-tight text-encre">
        <span className="text-beton">{meta.id}</span> {meta.titre}
      </h1>
      <div className="mt-2 flex flex-wrap gap-2 font-technique text-[0.85rem]">
        <span className="rounded border border-encre px-2 py-0.5 text-encre">Durée estimée : {dureeLisible(c.duree)}</span>
        {c.gabarits.map((g) => (
          <span key={g} className="rounded border border-beton/50 px-2 py-0.5 text-beton">
            {GABARITS[g] ?? g}
          </span>
        ))}
        {c.marqueurs.includes('FR') ? <span className="rounded border border-brique px-2 py-0.5 text-brique">Comparaison Eurocodes ↔ BAEL</span> : null}
        {c.marqueurs.includes('RDC') ? <span className="rounded border border-terre px-2 py-0.5 text-terre">Cas d’Afrique centrale</span> : null}
        {!meta.relecture ? <span className="rounded border border-correction px-2 py-0.5 text-correction">Non relu par un ingénieur</span> : null}
      </div>

      <h2 className="!mt-6">À la fin de cette leçon, tu sauras :</h2>
      <ol className="!mt-2 space-y-1.5 text-[1.05rem]">
        {meta.objectifs.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ol>

      <h2 className="!mt-6">Avant de commencer</h2>
      {prerequis.length ? (
        <ul className="!mt-2">
          {prerequis.map((p) => (
            <li key={p.id}>
              {p.slug ? (
                <Link href={`/lecons/${p.slug}`}>
                  {p.id} · {p.titre}
                </Link>
              ) : (
                <span>
                  {p.id} · {p.titre} <span className="text-beton">(leçon à venir)</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="!mt-2">Aucun prérequis : tu peux commencer directement.</p>
      )}

      {meta.normes.length ? (
        <>
          <h2 className="!mt-6">Textes de référence</h2>
          <ul className="!mt-2">
            {meta.normes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="mt-auto rounded-md border border-beton-clair bg-white/70 p-3 text-[0.92rem] text-beton">
        <p>
          <strong className="text-trait">Comment lire cette leçon.</strong> Les pages suivent toujours le même ordre : intuition, cours, schémas,
          exemple résolu, erreurs fréquentes, terrain, fiche mémo, exercices et quiz. Sur la fiche de calcul, modifie les données : tout se recalcule,
          schéma compris.
        </p>
      </div>
    </Feuille>
  );
}
