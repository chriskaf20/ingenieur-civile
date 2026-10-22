import type { MDXComponents } from 'mdx/types';
import { Figure } from '@/components/drawing/Figure';
import { LegendeHachures } from '@/components/drawing/Hachures';
import { AN, Cahier, Entrees, Etape, FicheCalcul, Note, Resultat, Schema, Val } from '@/components/gabarits/FicheCalcul';
import { FicheMemo } from '@/components/gabarits/FicheMemo';
import { Infographie, Panneau } from '@/components/gabarits/Infographie';
import { PlancheTechnique, Vue } from '@/components/gabarits/PlancheTechnique';
import { Calque, Vue3D } from '@/components/gabarits/Vue3D';
import { Page } from '@/components/page/Feuille';
import { Corrige, Exercice, Indice } from '@/components/pedago/Exercice';
import { QCM, Quiz, ScoreQuiz } from '@/components/pedago/Quiz';
import { AVerifier, Encadre, Piege, Regle } from '@/components/pedago/Regles';

// Composants disponibles dans toutes les leçons sans import.
const composants: MDXComponents = {
  Page,
  FicheCalcul, Cahier, Etape, Entrees, Val, AN, Schema, Resultat, Note,
  PlancheTechnique, Vue,
  Infographie, Panneau,
  FicheMemo,
  Vue3D, Calque,
  Figure, LegendeHachures,
  Regle, AVerifier, Encadre, Piege,
  Exercice, Indice, Corrige,
  Quiz, QCM, ScoreQuiz,
  table: (props) => (
    <div className="tableau">
      <table {...props} />
    </div>
  ),
};

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return { ...composants, ...components };
}
