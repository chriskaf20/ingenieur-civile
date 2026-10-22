'use client';

import { createContext, useContext, useState } from 'react';
import { Feuille } from '@/components/page/Feuille';
import type { Etape } from '@/components/page/etapes';

const Calques = createContext<ReadonlySet<string> | null>(null);

export interface DefCalque {
  id: string;
  libelle: string;
  actif?: boolean;
}

/** Gabarit E : illustration isométrique annotée avec des calques activables. */
export function Vue3D({ titre, calques, etape = 'schemas', children }: { titre: string; calques: DefCalque[]; etape?: Etape; children: React.ReactNode }) {
  const [actifs, setActifs] = useState<ReadonlySet<string>>(() => new Set(calques.filter((c) => c.actif !== false).map((c) => c.id)));
  const basculer = (id: string) =>
    setActifs((prec) => {
      const s = new Set(prec);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  return (
    <Calques.Provider value={actifs}>
      <Feuille etape={etape} titre={titre}>
        <div role="group" aria-label="Calques du dessin" className="ne-pas-imprimer flex flex-wrap gap-1.5 font-technique text-[0.85rem]">
          <span className="self-center text-beton">Calques :</span>
          {calques.map((c) => {
            const on = actifs.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => basculer(c.id)}
                className={`rounded-full border px-2.5 py-0.5 ${on ? 'border-encre bg-encre text-sur-couleur' : 'border-beton/50 bg-surface text-beton'}`}
              >
                {on ? '● ' : '○ '}
                {c.libelle}
              </button>
            );
          })}
        </div>
        {children}
      </Feuille>
    </Calques.Provider>
  );
}

/** Groupe SVG affiché seulement si son calque est actif (toujours affiché hors d'une Vue3D). */
export function Calque({ id, children }: { id: string; children: React.ReactNode }) {
  const actifs = useContext(Calques);
  if (actifs && !actifs.has(id)) return null;
  return <g data-calque={id}>{children}</g>;
}
