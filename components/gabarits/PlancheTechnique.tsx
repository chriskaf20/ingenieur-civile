import { LegendeHachures, type TypeHachure } from '@/components/drawing/Hachures';
import { Feuille } from '@/components/page/Feuille';
import type { Etape } from '@/components/page/etapes';

interface Props {
  titre: string;
  projet: string;
  numero: string;
  echelle: string;
  date: string;
  indice?: string;
  theme?: 'papier' | 'bleu';
  etape?: Etape;
  hachures?: TypeHachure[];
  notes?: string[];
  children: React.ReactNode;
}

/** Gabarit B : planche façon plan d'exécution (cadre, vues repérées, légende, notes, cartouche). */
export function PlancheTechnique({ titre, projet, numero, echelle, date, indice = 'A', theme = 'papier', etape = 'schemas', hachures, notes, children }: Props) {
  const bleu = theme === 'bleu';
  return (
    <Feuille etape={etape} variante="planche" libelle={titre}>
      <div className={`flex flex-1 flex-col border-2 p-2 ${bleu ? 'plan-bleu border-plan-trait' : 'border-trait'}`}>
        <div className="grid flex-1 grid-cols-2 content-start gap-x-3 gap-y-2 max-sm:grid-cols-1">{children}</div>
        <div className={`mt-2 grid grid-cols-[1fr_auto] gap-2 border-t-2 pt-2 max-sm:grid-cols-1 ${bleu ? 'border-plan-trait' : 'border-trait'}`}>
          <div className="grid grid-cols-2 gap-3 font-technique text-[0.82rem] max-sm:grid-cols-1">
            {hachures?.length ? (
              <div>
                <p className="mb-1 font-bold uppercase tracking-wide">Légende</p>
                <div className={bleu ? 'plan-bleu' : ''}>
                  <LegendeHachures types={hachures} prefixe={`leg-${numero}`} />
                </div>
              </div>
            ) : null}
            {notes?.length ? (
              <div>
                <p className="mb-1 font-bold uppercase tracking-wide">Notes générales</p>
                <ol className="list-decimal space-y-0.5 pl-4 leading-snug">
                  {notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
          <Cartouche titre={titre} projet={projet} numero={numero} echelle={echelle} date={date} indice={indice} bleu={bleu} />
        </div>
      </div>
    </Feuille>
  );
}

function Cartouche({ titre, projet, numero, echelle, date, indice, bleu }: { titre: string; projet: string; numero: string; echelle: string; date: string; indice: string; bleu: boolean }) {
  const bord = bleu ? 'border-plan-trait' : 'border-trait';
  const cel = `border ${bord} px-1.5 py-0.5`;
  return (
    <table className={`w-[270px] border-collapse self-end font-technique text-[0.78rem] max-sm:w-full ${bleu ? 'text-plan-trait' : ''}`} aria-label="Cartouche">
      <tbody>
        <tr>
          <td colSpan={3} className={`${cel} text-[0.72rem] uppercase tracking-wide`}>
            Génie Civil Académie · exemple pédagogique
          </td>
        </tr>
        <tr>
          <td colSpan={3} className={`${cel} text-[0.8rem]`}>
            <span className="opacity-70">Projet : </span>
            {projet}
          </td>
        </tr>
        <tr>
          <td colSpan={3} className={`${cel} text-[1rem] font-bold leading-tight`}>{titre}</td>
        </tr>
        <tr>
          <td className={cel}>
            <span className="block text-[0.65rem] uppercase opacity-70">Échelle</span>
            {echelle}
          </td>
          <td className={cel}>
            <span className="block text-[0.65rem] uppercase opacity-70">Planche</span>
            {numero}
          </td>
          <td className={cel}>
            <span className="block text-[0.65rem] uppercase opacity-70">Indice</span>
            {indice}
          </td>
        </tr>
        <tr>
          <td className={cel}>
            <span className="block text-[0.65rem] uppercase opacity-70">Date</span>
            {date}
          </td>
          <td colSpan={2} className={cel}>
            <span className="block text-[0.65rem] uppercase opacity-70">Vérifié</span>
            non relu par un ingénieur
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Une vue de la planche (plan, élévation, coupe), avec son titre souligné et son échelle. */
export function Vue({ titre, echelle, pleineLargeur = false, children }: { titre: string; echelle?: string; pleineLargeur?: boolean; children: React.ReactNode }) {
  return (
    <div className={pleineLargeur ? 'col-span-2 max-sm:col-span-1' : ''}>
      <p className="font-technique text-[0.95rem] font-bold uppercase tracking-wider">
        <span className="underline decoration-2 underline-offset-4">{titre}</span>
        {echelle ? <span className="ml-2 text-[0.8rem] font-normal normal-case tracking-normal opacity-80">éch. {echelle}</span> : null}
      </p>
      {children}
    </div>
  );
}
