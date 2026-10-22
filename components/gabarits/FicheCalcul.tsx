'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { REGISTRE, type NomCalcul } from '@/components/calculs/registre';
import { Feuille } from '@/components/page/Feuille';
import type { Etape as EtapePedago } from '@/components/page/etapes';
import type { Champ, DefinitionCalcul, Entrees } from './typesCalcul';

interface Ctx {
  def: DefinitionCalcul<unknown>;
  e: Entrees;
  r: unknown;
  majEntree: (cle: string, v: number | string) => void;
  reinitialiser: () => void;
}
const Contexte = createContext<Ctx | null>(null);

function useCalcul(): Ctx {
  const c = useContext(Contexte);
  if (!c) throw new Error('Composant de calcul utilisé hors de <FicheCalcul>');
  return c;
}

/**
 * Gabarit A : fiche de calcul façon cahier, entrées modifiables et recalcul en direct.
 * Elle fournit l'état du calcul à une ou plusieurs pages <Cahier> : les données saisies
 * sur la première page pilotent les applications numériques des pages suivantes.
 */
export function FicheCalcul({ calcul, children }: { calcul: NomCalcul; children: React.ReactNode }) {
  const def = REGISTRE[calcul] as DefinitionCalcul<unknown>;
  const [e, setE] = useState<Entrees>(def.defaut);
  const r = useMemo(() => def.calculer(e), [def, e]);
  const valeur = useMemo<Ctx>(
    () => ({
      def,
      e,
      r,
      majEntree: (cle, v) => setE((prec) => ({ ...prec, [cle]: v })),
      reinitialiser: () => setE(def.defaut),
    }),
    [def, e, r],
  );
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

/** Page de cahier (quadrillage, marge rouge) : support des fiches de calcul. */
export function Cahier({ titre, etape = 'exemple', children }: { titre?: string; etape?: EtapePedago; children: React.ReactNode }) {
  return (
    <Feuille variante="cahier" etape={etape} titre={titre}>
      {children}
    </Feuille>
  );
}

/** Étape numérotée de la fiche (données → schéma → formules → application numérique → résultat). */
export function Etape({ n, titre, children }: { n: number; titre: string; children: React.ReactNode }) {
  return (
    <div className="etape-calcul mt-3 first:mt-0">
      <h3 className="!mt-0 flex items-baseline gap-2 font-manuscrite !text-[1.2rem] !font-bold !text-correction">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-correction text-[1rem]">{n}</span>
        <span className="underline decoration-2 underline-offset-4">{titre}</span>
      </h3>
      <div className="mt-1 pl-9 [&>*+*]:mt-1.5 max-sm:pl-0">{children}</div>
    </div>
  );
}

/** Annotation manuscrite (stylo rouge, vert ou bleu). */
export function Note({ couleur = 'rouge', children }: { couleur?: 'rouge' | 'vert' | 'bleu'; children: React.ReactNode }) {
  const c = couleur === 'rouge' ? 'text-correction' : couleur === 'vert' ? 'text-validation' : 'text-encre';
  return <p className={`font-manuscrite text-[1.02rem] leading-snug ${c}`}>{children}</p>;
}

function ChampSaisie({ champ }: { champ: Champ }) {
  const { e, majEntree } = useCalcul();
  const id = `champ-${champ.cle}`;
  if (champ.type === 'choix') {
    return (
      <div className="grid gap-0.5">
        <label htmlFor={id} className="text-[0.92rem] leading-tight">
          <span className="font-semibold">{champ.symbole}</span> <span className="text-beton">{champ.libelle}</span>
        </label>
        <select
          id={id}
          value={String(e[champ.cle])}
          onChange={(ev) => {
            const opt = champ.options.find((o) => String(o.valeur) === ev.target.value);
            if (opt) majEntree(champ.cle, opt.valeur);
          }}
          className="justify-self-start rounded border border-encre/40 bg-white/80 px-1.5 py-0 font-manuscrite text-encre"
        >
          {champ.options.map((o) => (
            <option key={String(o.valeur)} value={String(o.valeur)}>
              {o.libelle}
            </option>
          ))}
        </select>
      </div>
    );
  }
  const v = Number(e[champ.cle]);
  return (
    <div className="grid gap-0.5">
      <label htmlFor={id} className="text-[0.92rem] leading-tight">
        <span className="font-semibold">{champ.symbole}</span> <span className="text-beton">{champ.libelle}</span>
      </label>
      <div className="flex items-center gap-2">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={champ.min}
        max={champ.max}
        step={champ.pas}
        value={v}
        onChange={(ev) => {
          const x = ev.target.valueAsNumber;
          if (Number.isFinite(x)) majEntree(champ.cle, x);
        }}
        className="w-20 rounded border border-encre/40 bg-white/80 px-1.5 py-0 text-right font-manuscrite text-[1.05rem] text-encre"
      />
      <span className="w-8 text-beton">{champ.unite}</span>
      <input
        type="range"
        aria-label={`${champ.libelle} (curseur)`}
        min={champ.min}
        max={champ.max}
        step={champ.pas}
        value={v}
        onChange={(ev) => majEntree(champ.cle, ev.target.valueAsNumber)}
        className="ne-pas-imprimer min-w-0 flex-1 accent-[var(--color-encre)]"
      />
      </div>
    </div>
  );
}

/** Formulaire des données d'entrée de la fiche. */
export function Entrees() {
  const { def, reinitialiser } = useCalcul();
  return (
    <div className="grid gap-x-5 gap-y-1.5 rounded border border-dashed border-encre/40 bg-white/40 p-2 sm:grid-cols-2">
      {def.champs.map((c) => (
        <ChampSaisie key={c.cle} champ={c} />
      ))}
      <button type="button" onClick={reinitialiser} className="ne-pas-imprimer justify-self-start font-technique text-[0.85rem] text-encre underline sm:col-span-2">
        Revenir aux valeurs de l’énoncé
      </button>
    </div>
  );
}

/** Valeur calculée, écrite à l'encre bleue. */
export function Val({ k }: { k: string }) {
  const { def, r, e } = useCalcul();
  const f = def.valeurs[k];
  return <span className="whitespace-nowrap font-manuscrite font-bold text-encre">{f ? f(r, e) : `⟨${k}⟩`}</span>;
}

/** Ligne d'application numérique, entièrement générée par le calcul. */
export function AN({ k }: { k: string }) {
  const { def, r, e } = useCalcul();
  const f = def.lignes?.[k];
  return <p className="font-manuscrite text-[1.08rem] leading-relaxed text-encre">{f ? f(r, e) : `⟨${k}⟩`}</p>;
}

/** Schéma paramétrique, redessiné à chaque modification des données. */
export function Schema({ k }: { k?: string }) {
  const { def, r, e } = useCalcul();
  const f = k ? def.schemas?.[k] : def.schema;
  return f ? <>{f({ r, e })}</> : null;
}

/** Résultat encadré dans une bulle. */
export function Resultat({ k, libelle }: { k: string; libelle: string }) {
  const { def, r, e } = useCalcul();
  const alerte = def.alerte?.(r);
  const f = def.valeurs[k];
  return (
    <div className="my-2 flex justify-center">
      <div className={`bulle ${alerte ? 'bulle--alerte' : ''}`} role="status" aria-live="polite">
        {alerte ? (
          <p className="font-manuscrite text-[1.1rem] text-correction">{alerte}</p>
        ) : (
          <p className="font-manuscrite text-[1.25rem] text-validation">
            {libelle} : <strong className="text-[1.45rem]">{f ? f(r, e) : '—'}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
