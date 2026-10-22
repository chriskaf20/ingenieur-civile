const NIVEAUX = {
  facile: { libelle: 'Facile', classes: 'bg-validation-clair text-validation border-validation' },
  moyen: { libelle: 'Moyen', classes: 'bg-terre-clair text-terre border-terre' },
  difficile: { libelle: 'Difficile', classes: 'bg-correction-clair text-correction border-correction' },
} as const;

/** Exercice gradué ; indices et corrigé sont repliés par défaut. */
export function Exercice({ n, niveau, titre, children }: { n: number; niveau: keyof typeof NIVEAUX; titre: string; children: React.ReactNode }) {
  const v = NIVEAUX[niveau];
  return (
    <article className="my-3 rounded-md border border-beton-clair bg-surface/70 p-3">
      <h3 className="!mt-0 flex flex-wrap items-center gap-2">
        <span>Exercice {n}</span>
        <span className={`rounded border px-1.5 font-technique text-[0.75rem] font-semibold uppercase ${v.classes}`}>{v.libelle}</span>
        <span className="font-normal text-trait">{titre}</span>
      </h3>
      <div className="mt-1 [&>*+*]:mt-1.5">{children}</div>
    </article>
  );
}

function Repli({ libelle, classe, children }: { libelle: string; classe: string; children: React.ReactNode }) {
  return (
    <details className={`mt-2 rounded border px-2.5 py-1.5 ${classe}`}>
      <summary className="cursor-pointer select-none font-technique font-semibold">{libelle}</summary>
      <div className="mt-1.5 [&>*+*]:mt-1.5">{children}</div>
    </details>
  );
}

export function Indice({ children }: { children: React.ReactNode }) {
  return (
    <Repli libelle="Indice" classe="border-terre/40 bg-terre-clair/50">
      {children}
    </Repli>
  );
}

export function Corrige({ children }: { children: React.ReactNode }) {
  return (
    <Repli libelle="Corrigé détaillé" classe="border-validation/40 bg-validation-clair/50">
      {children}
    </Repli>
  );
}
