'use client';

import { createContext, useContext, useEffect } from 'react';
import { depotProgression } from '@/lib/progression';

export interface InfoLecon {
  id: string;
  titre: string;
  moduleId: string;
  moduleTitre: string;
  relecture: boolean;
}

const Contexte = createContext<InfoLecon | null>(null);

/** Fournit l'identité de la leçon aux en-têtes de page et marque la leçon comme vue. */
export function LeconContexte({ valeur, children }: { valeur: InfoLecon; children: React.ReactNode }) {
  useEffect(() => {
    depotProgression().marquerVue(valeur.id);
  }, [valeur.id]);
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useLecon(): InfoLecon | null {
  return useContext(Contexte);
}
