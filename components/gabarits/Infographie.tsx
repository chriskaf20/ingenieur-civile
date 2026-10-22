import { Icone, type NomIcone } from '@/components/pedago/Icone';
import { Feuille } from '@/components/page/Feuille';
import type { Etape } from '@/components/page/etapes';

const COULEURS = {
  encre: { bord: 'border-encre', fond: 'bg-encre', texte: 'text-encre' },
  brique: { bord: 'border-brique', fond: 'bg-brique', texte: 'text-brique' },
  terre: { bord: 'border-terre', fond: 'bg-terre', texte: 'text-terre' },
  validation: { bord: 'border-validation', fond: 'bg-validation', texte: 'text-validation' },
  acier: { bord: 'border-acier', fond: 'bg-acier', texte: 'text-acier' },
  correction: { bord: 'border-correction', fond: 'bg-correction', texte: 'text-correction' },
} as const;
export type CouleurPanneau = keyof typeof COULEURS;

/** Gabarit C : infographie en panneaux numérotés qui suivent un flux logique. */
export function Infographie({ titre, sousTitre, etape = 'cours', children }: { titre: string; sousTitre?: string; etape?: Etape; children: React.ReactNode }) {
  return (
    <Feuille etape={etape} variante="infographie">
      <div className="-mx-1 mb-2 rounded-md bg-encre px-3 py-2 text-sur-couleur">
        <p className="font-technique text-[1.45rem] font-bold uppercase leading-tight tracking-wide">{titre}</p>
        {sousTitre ? <p className="font-technique text-[0.95rem] opacity-90">{sousTitre}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">{children}</div>
    </Feuille>
  );
}

/** Panneau numéroté avec icône et titre coloré. */
export function Panneau({ n, titre, icone, couleur = 'encre', large = false, children }: { n: number; titre: string; icone: NomIcone; couleur?: CouleurPanneau; large?: boolean; children: React.ReactNode }) {
  const c = COULEURS[couleur];
  return (
    <section className={`rounded-md border-2 ${c.bord} bg-surface/80 ${large ? 'col-span-2 max-sm:col-span-1' : ''}`}>
      <h3 className={`!mt-0 flex items-center gap-2 rounded-t-[4px] ${c.fond} px-2 py-1 font-technique !text-[1rem] font-bold uppercase tracking-wide !text-sur-couleur`}>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface text-[0.9rem]" style={{ color: 'inherit' }}>
          <span className={c.texte}>{n}</span>
        </span>
        <Icone nom={icone} taille={18} />
        {titre}
      </h3>
      <div className="px-2 py-1.5 text-[0.9rem] leading-snug [&>*+*]:mt-1 [&_.katex]:text-[0.95em]">{children}</div>
    </section>
  );
}
