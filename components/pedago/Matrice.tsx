// Matrice affichée entre crochets, pour les leçons et les fiches de calcul. Les coefficients viennent de lib/calc/.
// Écrite en éléments en ligne (tableau CSS) : elle peut figurer dans un paragraphe ou une ligne d'application numérique.
import { nombre } from '@/lib/format';

type Coef = number | React.ReactNode;

/** Zéro propre : évite l'affichage de « −0 » après une élimination. */
const propre = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v);

/** Vecteur colonne à partir d'une liste de coefficients. */
export const colonne = (v: readonly Coef[]): Coef[][] => v.map((x) => [x]);

/**
 * Matrice entre crochets : coefficients formatés (`dec` décimales, pour toute la matrice ou par colonne),
 * second membre séparé par un trait (`augmentee`), pivot et zéros créés surlignés, opérations sur les lignes à droite.
 */
export function Matrice({
  M,
  dec = 2,
  nom,
  augmentee = false,
  pivot,
  zeros = [],
  lignes,
  colonnes,
  ops,
  compacte = false,
  zeroSimple = false,
  alt,
}: {
  M: ReadonlyArray<ReadonlyArray<Coef>>;
  dec?: number | readonly number[];
  /** nom écrit devant la matrice, suivi de « = » */
  nom?: React.ReactNode;
  augmentee?: boolean;
  /** case du pivot (ligne, colonne), numérotées à partir de 0 */
  pivot?: readonly [number, number];
  /** cases annulées par l'élimination */
  zeros?: ReadonlyArray<readonly [number, number]>;
  /** en-têtes des lignes (à gauche) et des colonnes (au-dessus) */
  lignes?: readonly React.ReactNode[];
  colonnes?: readonly React.ReactNode[];
  /** opération appliquée à chaque ligne, écrite à droite : L2 ← L2 − 0,95 L1 */
  ops?: ReadonlyArray<React.ReactNode | undefined>;
  compacte?: boolean;
  /** écrire 0 sans décimales pour tous les zéros exacts (matrices creuses) */
  zeroSimple?: boolean;
  alt?: string;
}) {
  const m = M.length;
  const n = M[0]?.length ?? 0;
  const d = (j: number) => (typeof dec === 'number' ? dec : (dec[j] ?? 2));
  const estZero = (i: number, j: number) => zeros.some(([a, b]) => a === i && b === j);
  // un zéro créé par l'élimination s'écrit 0, sans décimales
  const fmt = (v: Coef, i: number, j: number) => (typeof v !== 'number' ? v : (zeroSimple || estZero(i, j)) && Math.abs(v) < 1e-12 ? '0' : nombre(propre(v), d(j)));
  const classe = (i: number, j: number) =>
    ['mx-c', augmentee && j === n - 1 ? 'mx-second' : '', pivot && pivot[0] === i && pivot[1] === j ? 'mx-pivot' : '', estZero(i, j) ? 'mx-zero' : ''].filter(Boolean).join(' ');
  const enteteVide = colonnes ? (
    <span className="mx-l">
      <span className="mx-c mx-entete" />
    </span>
  ) : null;
  return (
    <span className={`mx${compacte ? ' mx-compacte' : ''}`} role="group" aria-label={alt ?? `matrice de ${m} ligne${m > 1 ? 's' : ''} et ${n} colonne${n > 1 ? 's' : ''}`}>
      {nom ? <span className="mx-nom">{nom} =</span> : null}
      {lignes ? (
        <span className="mx-t" aria-hidden>
          {enteteVide}
          {lignes.map((l, i) => (
            <span key={i} className="mx-l">
              <span className="mx-c mx-entete-ligne">{l}</span>
            </span>
          ))}
        </span>
      ) : null}
      <span className={`mx-corps${colonnes ? ' mx-avec-entetes' : ''}`}>
        <span className="mx-t" role="table">
          {colonnes ? (
            <span className="mx-l" role="row">
              {colonnes.map((c, j) => (
                <span key={j} className="mx-c mx-entete" role="columnheader">
                  {c}
                </span>
              ))}
            </span>
          ) : null}
          {M.map((l, i) => (
            <span key={i} className="mx-l" role="row">
              {l.map((v, j) => (
                <span key={j} className={classe(i, j)} role="cell">
                  {fmt(v, i, j)}
                </span>
              ))}
            </span>
          ))}
        </span>
      </span>
      {ops ? (
        <span className="mx-t mx-ops">
          {enteteVide}
          {M.map((_, i) => (
            <span key={i} className="mx-l">
              <span className="mx-c mx-op">{ops[i] ?? ''}</span>
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
}
