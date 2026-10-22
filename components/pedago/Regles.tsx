import { Icone, type NomIcone } from './Icone';

/** Badge « À vérifier » : la valeur n'a pas de source normative confirmée (voir A_VERIFIER.md). */
export function AVerifier({ note }: { note?: string }) {
  return (
    <span
      className="mx-1 inline-block rounded border border-correction px-1.5 align-middle font-technique text-[0.72rem] font-semibold uppercase tracking-wide text-correction"
      title={note ?? 'Point listé dans A_VERIFIER.md'}
    >
      À vérifier
    </span>
  );
}

const TYPES_REGLE = {
  norme: { libelle: 'Règle normative', couleur: 'border-encre text-encre', icone: 'regle' },
  art: { libelle: 'Règle de l’art', couleur: 'border-terre text-terre', icone: 'terrain' },
  simplification: { libelle: 'Simplification pédagogique', couleur: 'border-beton text-beton', icone: 'idee' },
  hypothese: { libelle: 'Hypothèse de projet', couleur: 'border-correction text-correction', icone: 'attention' },
} as const satisfies Record<string, { libelle: string; couleur: string; icone: NomIcone }>;

/** Encadre une règle en précisant sa nature : normative, de l'art, simplification ou hypothèse. */
export function Regle({ type, source, children }: { type: keyof typeof TYPES_REGLE; source?: string; children: React.ReactNode }) {
  const t = TYPES_REGLE[type];
  return (
    <aside className={`my-2 border-l-4 bg-white/60 py-1.5 pl-3 pr-2 ${t.couleur.split(' ')[0]}`}>
      <div className={`flex items-center gap-1.5 font-technique text-[0.8rem] font-semibold uppercase tracking-wide ${t.couleur.split(' ')[1]}`}>
        <Icone nom={t.icone} taille={16} />
        {t.libelle}
        {source ? <span className="font-normal normal-case tracking-normal text-beton">· {source}</span> : null}
        {type === 'hypothese' ? <AVerifier /> : null}
      </div>
      <div className="text-[0.95rem] [&>p]:mt-1">{children}</div>
    </aside>
  );
}

const TYPES_ENCADRE = {
  exemple: { libelle: 'Exemple', classes: 'border-encre bg-encre-clair text-encre', icone: 'exemple' },
  attention: { libelle: 'Attention', classes: 'border-correction bg-correction-clair text-correction', icone: 'attention' },
  retenir: { libelle: 'À retenir', classes: 'border-validation bg-validation-clair text-validation', icone: 'retenir' },
  terrain: { libelle: 'Sur le chantier', classes: 'border-terre bg-terre-clair text-terre', icone: 'terrain' },
  idee: { libelle: 'Pour comprendre', classes: 'border-brique bg-brique-clair text-brique', icone: 'idee' },
} as const satisfies Record<string, { libelle: string; classes: string; icone: NomIcone }>;

export function Encadre({ type, titre, children }: { type: keyof typeof TYPES_ENCADRE; titre?: string; children: React.ReactNode }) {
  const t = TYPES_ENCADRE[type];
  const [bord, fond, texte] = t.classes.split(' ');
  return (
    <aside className={`my-2 rounded-md border-2 ${bord} ${fond} px-3 py-2`}>
      <div className={`mb-1 flex items-center gap-1.5 font-technique text-[0.85rem] font-bold uppercase tracking-wide ${texte}`}>
        <Icone nom={t.icone} taille={18} />
        {titre ?? t.libelle}
      </div>
      <div className="text-[0.95rem] text-trait [&>*+*]:mt-1.5">{children}</div>
    </aside>
  );
}

/** Erreur fréquente : ce qu'on voit souvent, puis la bonne pratique. */
export function Piege({ erreur, children }: { erreur: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="my-2 grid gap-1 rounded-md border border-beton-clair bg-white/70 p-2.5">
      <p className="flex gap-2 text-correction">
        <Icone nom="erreur" taille={20} className="mt-0.5 shrink-0" />
        <span>
          <strong>Erreur : </strong>
          {erreur}
        </span>
      </p>
      <div className="flex gap-2 text-trait">
        <Icone nom="verification" taille={20} className="mt-0.5 shrink-0 text-validation" />
        <div className="[&>*+*]:mt-1">{children}</div>
      </div>
    </div>
  );
}
