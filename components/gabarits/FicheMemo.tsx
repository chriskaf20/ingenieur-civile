import { Feuille } from '@/components/page/Feuille';
import type { Etape } from '@/components/page/etapes';

/** Gabarit D : aide-mémoire sur page de cahier, pensé pour l'impression et la révision. */
export function FicheMemo({ titre, etape = 'memo', children }: { titre: string; etape?: Etape; children: React.ReactNode }) {
  return (
    <Feuille variante="cahier" etape={etape} titre={titre} className="fiche-memo">
      {children}
    </Feuille>
  );
}
