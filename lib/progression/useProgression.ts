'use client';

import { useSyncExternalStore } from 'react';
import { depotProgression } from './index';
import type { Etats } from './statistiques';

const VIDE: Etats = {};
const abonner = (rappel: () => void) => depotProgression().abonner(rappel);
const lire = () => depotProgression().lireTout();

/** État de progression, relu à chaque changement ; vide au rendu serveur. */
export function useProgression(): Etats {
  return useSyncExternalStore(abonner, lire, () => VIDE);
}
