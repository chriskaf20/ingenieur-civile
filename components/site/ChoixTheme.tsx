'use client';

import { useEffect, useState } from 'react';

type Choix = 'systeme' | 'clair' | 'sombre';
const CLE = 'gca:theme';
const LIBELLES: Record<Choix, string> = { systeme: 'Thème : système', clair: 'Thème : clair', sombre: 'Thème : sombre' };
const SUIVANT: Record<Choix, Choix> = { systeme: 'clair', clair: 'sombre', sombre: 'systeme' };

/** Script exécuté avant l'affichage (dans <head>) pour éviter un flash du mauvais thème. */
export const SCRIPT_THEME = `(function(){try{var t=localStorage.getItem('${CLE}');var s=t==='sombre'||(t!=='clair'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=s?'sombre':'clair'}catch(e){}})()`;

function appliquer(choix: Choix) {
  const sombre = choix === 'sombre' || (choix === 'systeme' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = sombre ? 'sombre' : 'clair';
}

function lireChoix(): Choix {
  try {
    const t = localStorage.getItem(CLE);
    return t === 'clair' || t === 'sombre' ? t : 'systeme';
  } catch {
    return 'systeme';
  }
}

/** Bouton à trois positions : système → clair → sombre. */
export function ChoixTheme() {
  const [choix, setChoix] = useState<Choix | null>(null);

  useEffect(() => {
    setChoix(lireChoix());
  }, []);

  useEffect(() => {
    if (choix !== 'systeme') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const suivre = () => appliquer('systeme');
    mq.addEventListener('change', suivre);
    return () => mq.removeEventListener('change', suivre);
  }, [choix]);

  const changer = () => {
    const nouveau = SUIVANT[choix ?? 'systeme'];
    setChoix(nouveau);
    appliquer(nouveau);
    try {
      if (nouveau === 'systeme') localStorage.removeItem(CLE);
      else localStorage.setItem(CLE, nouveau);
    } catch {
      // stockage bloqué : le choix vaut pour la session
    }
  };

  const c = choix ?? 'systeme';
  return (
    <button
      type="button"
      onClick={changer}
      title={`${LIBELLES[c]} (cliquer pour changer)`}
      aria-label={LIBELLES[c]}
      className="grid h-9 w-9 place-items-center rounded-md border border-trait/15 text-encre hover:bg-encre-clair"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        {c === 'clair' ? (
          <>
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
          </>
        ) : c === 'sombre' ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 3.5v17A8.5 8.5 0 0 0 12 3.5Z" fill="currentColor" />
          </>
        )}
      </svg>
    </button>
  );
}
