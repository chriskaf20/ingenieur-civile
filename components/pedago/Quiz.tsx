'use client';

import { createContext, Fragment, useCallback, useContext, useEffect, useId, useMemo, useState } from 'react';
import { depotProgression, SEUIL_VALIDATION } from '@/lib/progression';

interface ContexteQuiz {
  inscrire: (n: number) => () => void;
  repondre: (n: number, juste: boolean) => void;
  recommencer: () => void;
  total: number;
  repondues: number;
  score: number;
  termine: boolean;
  meilleur: number | null;
}
const Ctx = createContext<ContexteQuiz | null>(null);

/**
 * Quiz de fin de leçon. Il peut s'étendre sur plusieurs pages ; <ScoreQuiz /> affiche le score,
 * enregistré dans la progression (validation à 65 %, voir SEUIL_VALIDATION).
 */
export function Quiz({ id, children }: { id: string; children: React.ReactNode }) {
  const [questions, setQuestions] = useState<ReadonlySet<number>>(new Set());
  const [reponses, setReponses] = useState<ReadonlyMap<number, boolean>>(new Map());
  const [tentative, setTentative] = useState(0);
  const [meilleur, setMeilleur] = useState<number | null>(null);

  useEffect(() => {
    const depot = depotProgression();
    const maj = () => setMeilleur(depot.lire(id)?.quiz?.meilleur ?? null);
    maj();
    return depot.abonner(maj);
  }, [id]);

  const inscrire = useCallback((n: number) => {
    setQuestions((q) => new Set(q).add(n));
    return () =>
      setQuestions((q) => {
        const s = new Set(q);
        s.delete(n);
        return s;
      });
  }, []);
  const repondre = useCallback((n: number, juste: boolean) => setReponses((r) => new Map(r).set(n, juste)), []);
  const recommencer = useCallback(() => {
    setReponses(new Map());
    setTentative((t) => t + 1);
  }, []);

  const total = questions.size;
  const score = [...reponses.values()].filter(Boolean).length;
  const termine = total > 0 && reponses.size === total;

  useEffect(() => {
    if (termine) depotProgression().enregistrerQuiz(id, score, total);
  }, [termine, id, score, total]);

  const valeur = useMemo(
    () => ({ inscrire, repondre, recommencer, total, repondues: reponses.size, score, termine, meilleur }),
    [inscrire, repondre, recommencer, total, reponses.size, score, termine, meilleur],
  );
  return (
    <Ctx.Provider value={valeur}>
      <Fragment key={tentative}>{children}</Fragment>
    </Ctx.Provider>
  );
}

/** Bandeau de score du quiz (à placer sur la dernière page). */
export function ScoreQuiz() {
  const q = useContext(Ctx);
  if (!q) return null;
  const valide = q.termine && q.score / q.total >= SEUIL_VALIDATION;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md border-2 border-encre bg-encre-clair px-3 py-2 font-technique" aria-live="polite">
      {q.termine ? (
        <span className={valide ? 'font-bold text-validation' : 'font-bold text-correction'}>
          Score : {q.score} / {q.total}
          {valide ? ' · quiz validé' : ` · il faut ${Math.ceil(SEUIL_VALIDATION * q.total - 1e-9)} bonnes réponses pour valider`}
        </span>
      ) : (
        <span className="text-encre">
          {q.repondues} / {q.total} questions répondues
        </span>
      )}
      {q.meilleur !== null ? (
        <span className="text-beton">
          Meilleur score : {q.meilleur} / {q.total}
        </span>
      ) : null}
      <button
        type="button"
        className="ne-pas-imprimer ml-auto rounded border border-encre bg-surface px-2.5 py-0.5 text-encre hover:bg-encre hover:text-sur-couleur"
        onClick={q.recommencer}
      >
        Recommencer
      </button>
    </div>
  );
}

/** Question à choix multiples ; l'explication (enfants) s'affiche après validation. */
export function QCM({
  n,
  question,
  choix,
  bonne,
  colonnes = 1,
  children,
}: {
  n: number;
  question: React.ReactNode;
  choix: React.ReactNode[];
  bonne: number;
  /** Choix courts : 2 ou 4 colonnes à partir de la largeur sm ; une seule sur mobile. */
  colonnes?: 1 | 2 | 4;
  children: React.ReactNode;
}) {
  const ctx = useContext(Ctx);
  const nom = useId();
  const [choisi, setChoisi] = useState<number | null>(null);
  const [valide, setValide] = useState(false);
  const inscrire = ctx?.inscrire;
  useEffect(() => inscrire?.(n), [inscrire, n]);

  const juste = choisi === bonne;
  return (
    <fieldset className="my-1.5 rounded-md border border-beton-clair bg-surface/80 px-3 pb-1.5 pt-0.5">
      <legend className="px-1 font-technique text-[0.92rem] font-semibold text-encre">Question {n}</legend>
      <div className="mb-0.5 leading-snug">{question}</div>
      <div className={`grid gap-x-3 ${colonnes === 4 ? 'sm:grid-cols-4' : colonnes === 2 ? 'sm:grid-cols-2' : ''}`}>
        {choix.map((c, i) => {
          const etat = valide ? (i === bonne ? 'border-validation bg-validation-clair' : i === choisi ? 'border-correction bg-correction-clair' : 'border-transparent') : 'border-transparent';
          return (
            <label key={i} className={`flex cursor-pointer items-start gap-2 rounded border px-1.5 text-[0.95rem] leading-snug ${etat}`}>
              <input type="radio" name={nom} className="mt-1" disabled={valide} checked={choisi === i} onChange={() => setChoisi(i)} />
              <span>
                <strong className="font-technique">{String.fromCharCode(65 + i)}.</strong> {c}
              </span>
            </label>
          );
        })}
      </div>
      {!valide ? (
        <button
          type="button"
          disabled={choisi === null}
          className="ne-pas-imprimer mt-1 rounded border border-encre px-2 py-0 font-technique text-[0.88rem] text-encre enabled:hover:bg-encre enabled:hover:text-sur-couleur disabled:opacity-40"
          onClick={() => {
            setValide(true);
            ctx?.repondre(n, juste);
          }}
        >
          Valider
        </button>
      ) : (
        <div className={`mt-1 rounded px-2 py-1 ${juste ? 'bg-validation-clair' : 'bg-correction-clair'}`} role="status">
          <p className={`font-semibold ${juste ? 'text-validation' : 'text-correction'}`}>
            {juste ? 'Bonne réponse.' : `Pas tout à fait : la bonne réponse est ${String.fromCharCode(65 + bonne)}.`}
          </p>
          <div className="[&>*+*]:mt-1">{children}</div>
        </div>
      )}
    </fieldset>
  );
}
