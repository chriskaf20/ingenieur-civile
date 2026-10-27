// Schémas de compréhension du module L1.7 (informatique de l'ingénieur), chapitre tableur (L1.7.1 à L1.7.3).
// Les valeurs des cellules sont calculées par le moteur de lib/calc/tableur.ts.
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Axes, repere2D } from '@/components/drawing/Graphe';
import { afficherValeur, cellulesPlage, decalerReference, evaluerFeuille, recopierFormule, type Feuille } from '@/lib/calc/tableur';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** Lettres de colonne d'une référence. */
const col = (ref: string) => /[A-Z]+/.exec(ref)![0];

/** Une plage de feuille de calcul : en-têtes de lignes et de colonnes, barre de formule, valeurs calculées ou formules. */
export function FeuilleTableur({
  feuille,
  plage,
  alt,
  afficher = 'valeurs',
  decimales = {},
  largeurs = {},
  surligner = [],
  entrees = [],
  actif,
}: {
  feuille: Feuille;
  plage: string;
  alt: string;
  afficher?: 'valeurs' | 'formules';
  /** décimales affichées par colonne */
  decimales?: Record<string, number>;
  /** largeur (px) par colonne */
  largeurs?: Record<string, number>;
  surligner?: readonly string[];
  /** cellules de données, écrites en bleu */
  entrees?: readonly string[];
  /** cellule sélectionnée, dont la barre de formule montre le contenu */
  actif?: string;
}) {
  const v = evaluerFeuille(feuille);
  const lignes = cellulesPlage(plage);
  const colonnes = lignes[0]!.map(col);
  const lc = (c: string) => largeurs[c] ?? 74;
  const xs: number[] = [];
  let x = 34;
  for (const c of colonnes) {
    xs.push(x);
    x += lc(c);
  }
  const largeur = x + 6;
  const h = 21;
  const y0 = actif ? 40 : 6;
  const contenu = (ref: string) => {
    const brut = feuille[ref];
    if (afficher === 'formules' && typeof brut === 'string' && brut.startsWith('=')) return brut;
    return afficherValeur(v[ref], decimales[col(ref)]);
  };
  return (
    <Figure alt={alt} largeur={Math.max(largeur, 300)} hauteur={y0 + (lignes.length + 1) * h + 8} largeurMin={300}>
      {actif ? (
        <g>
          <rect x={6} y={6} width={largeur - 12} height={24} rx={3} fill="var(--color-papier)" className="t-fin" />
          <Etiquette x={14} y={22} taille={11} gras>
            {actif}
          </Etiquette>
          <line x1={52} y1={9} x2={52} y2={27} className="t-fin" />
          <Etiquette x={60} y={22} taille={11} gras couleur={BLEU}>
            fx
          </Etiquette>
          <text x={82} y={22} fontSize={11.5} fontFamily={MONO}>
            {String(feuille[actif] ?? '')}
          </text>
        </g>
      ) : null}
      <rect x={6} y={y0} width={28} height={h} fill="var(--color-beton-clair)" className="t-fin" />
      {colonnes.map((c, i) => (
        <g key={c}>
          <rect x={xs[i]} y={y0} width={lc(c)} height={h} fill="var(--color-beton-clair)" className="t-fin" />
          <Etiquette x={xs[i]! + lc(c) / 2} y={y0 + 15} ancre="middle" taille={10.5} gras>
            {c}
          </Etiquette>
        </g>
      ))}
      {lignes.map((ligne, j) => {
        const y = y0 + (j + 1) * h;
        const numero = /\d+/.exec(ligne[0]!)![0];
        return (
          <g key={numero}>
            <rect x={6} y={y} width={28} height={h} fill="var(--color-beton-clair)" className="t-fin" />
            <Etiquette x={20} y={y + 15} ancre="middle" taille={10.5} gras>
              {numero}
            </Etiquette>
            {ligne.map((ref, i) => {
              const t = contenu(ref);
              const nombreAligne = afficher === 'valeurs' && typeof v[ref] === 'number';
              const formule = afficher === 'formules' && t.startsWith('=');
              return (
                <g key={ref}>
                  <rect
                    x={xs[i]}
                    y={y}
                    width={lc(col(ref))}
                    height={h}
                    fill={surligner.includes(ref) ? 'var(--color-encre-clair)' : 'var(--color-papier)'}
                    className={ref === actif ? 't-fort' : 't-fin'}
                    stroke={ref === actif ? VERT : undefined}
                  />
                  {t ? (
                    <text
                      x={nombreAligne ? xs[i]! + lc(col(ref)) - 5 : xs[i]! + 5}
                      y={y + 15}
                      textAnchor={nombreAligne ? 'end' : 'start'}
                      fontSize={formule ? 10 : 11}
                      fontFamily={formule ? MONO : undefined}
                      fill={entrees.includes(ref) ? BLEU : undefined}
                      fontWeight={entrees.includes(ref) ? 700 : undefined}
                    >
                      {t}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}
    </Figure>
  );
}

/** Une cellule, son adresse, sa formule et sa valeur. */
export function AnatomieCellule({ feuille, cellule }: { feuille: Feuille; cellule: string }) {
  const v = evaluerFeuille(feuille);
  return (
    <Figure alt={`La cellule ${cellule} : son adresse est la lettre de la colonne suivie du numéro de la ligne. La barre de formule montre ce que l'on a tapé, ${String(feuille[cellule])} ; la cellule affiche le résultat, ${afficherValeur(v[cellule], 3)}.`} largeur={620} hauteur={170}>
      <rect x={40} y={20} width={540} height={28} rx={3} fill="var(--color-papier)" className="t-fin" />
      <Etiquette x={50} y={39} taille={12} gras>
        {cellule}
      </Etiquette>
      <Etiquette x={96} y={39} taille={12} gras couleur={BLEU}>
        fx
      </Etiquette>
      <text x={124} y={39} fontSize={13} fontFamily={MONO}>
        {String(feuille[cellule])}
      </text>
      <rect x={220} y={92} width={140} height={30} fill="var(--color-encre-clair)" stroke={VERT} strokeWidth={2} />
      <text x={352} y={112} textAnchor="end" fontSize={13}>
        {afficherValeur(v[cellule], 3)}
      </text>
      <Fleche x1={150} y1={146} x2={218} y2={112} couleur={BLEU} epaisseur={1.4} tete={7} />
      <Etiquette x={40} y={160} taille={11}>
        adresse : colonne + ligne
      </Etiquette>
      <Fleche x1={420} y1={70} x2={300} y2={90} couleur={BLEU} epaisseur={1.4} tete={7} />
      <Etiquette x={424} y={74} taille={11}>
        la cellule affiche le résultat
      </Etiquette>
      <Fleche x1={420} y1={56} x2={300} y2={48} couleur={BLEU} epaisseur={1.4} tete={7} />
      <Etiquette x={424} y={60} taille={11}>
        la barre montre la formule
      </Etiquette>
    </Figure>
  );
}

/** Recopie vers le bas : référence relative (le prix glisse et donne 0) et référence absolue (le prix reste en B1). */
export function RecopieRelativeAbsolue({ feuille }: { feuille: Feuille }) {
  const colonne = (base: string) => {
    const f: Feuille = { ...feuille };
    [0, 1, 2, 3].forEach((i) => (f[`G${4 + i}`] = recopierFormule(base, i, 0)));
    const v = evaluerFeuille(f);
    return [0, 1, 2, 3].map((i) => ({ ref: `G${4 + i}`, formule: String(f[`G${4 + i}`]), valeur: afficherValeur(v[`G${4 + i}`], 2) }));
  };
  const panneau = (x0: number, base: string, juste: boolean) => (
    <g>
      <Etiquette x={x0} y={20} taille={12} gras couleur={juste ? VERT : ROUGE}>
        {juste ? `✓ ${base} : $B$1 reste fixe` : `✗ ${base} : B1 glisse vers B2, B3…`}
      </Etiquette>
      {colonne(base).map((c, i) => (
        <g key={c.ref}>
          <rect x={x0} y={34 + i * 26} width={110} height={22} fill="var(--color-papier)" className="t-fin" />
          <text x={x0 + 5} y={50 + i * 26} fontSize={10.5} fontFamily={MONO}>
            {c.formule}
          </text>
          <rect x={x0 + 114} y={34 + i * 26} width={80} height={22} fill={juste ? 'var(--color-validation-clair)' : 'var(--color-correction-clair)'} className="t-fin" />
          <text x={x0 + 189} y={50 + i * 26} fontSize={11} textAnchor="end">
            {c.valeur}
          </text>
        </g>
      ))}
      <Fleche x1={x0 - 10} y1={44} x2={x0 - 10} y2={34 + 3 * 26 + 12} couleur={BLEU} epaisseur={1.4} tete={7} />
    </g>
  );
  return (
    <Figure alt="La formule de coût, écrite en G4 puis recopiée vers le bas. Avec la référence relative B1, la recopie la transforme en B2, B3, B4 : on obtient zéro (cellule vide), une erreur (cellule de texte), puis un nombre faux mais vraisemblable. Avec la référence absolue $B$1, le prix reste fixé en B1 : les coûts sont justes." largeur={620} hauteur={150}>
      {panneau(30, '=F4*B1', false)}
      {panneau(340, '=F4*$B$1', true)}
    </Figure>
  );
}

/** Les quatre formes d'une référence et ce qu'elles deviennent recopiées d'une ligne vers le bas et d'une colonne vers la droite. */
export function QuatreReferences() {
  const refs = ['A1', '$A$1', '$A1', 'A$1'];
  const sens = ['relative', 'absolue', 'colonne bloquée', 'ligne bloquée'];
  return (
    <Figure alt={`Quatre formes de référence recopiées d'une ligne vers le bas et d'une colonne vers la droite : ${refs.map((r) => `${r} devient ${decalerReference(r, 1, 0)} puis ${decalerReference(r, 0, 1)}`).join(' ; ')}. Le $ bloque la partie qu'il précède.`} largeur={620} hauteur={170}>
      {['référence', 'nature', '1 ligne vers le bas', '1 colonne à droite'].map((t, i) => (
        <Etiquette key={t} x={[40, 150, 330, 480][i]!} y={24} taille={11.5} gras>
          {t}
        </Etiquette>
      ))}
      {refs.map((r, i) => (
        <g key={r}>
          <line x1={30} y1={34 + i * 32} x2={600} y2={34 + i * 32} className="t-fin" />
          <text x={40} y={56 + i * 32} fontSize={14} fontFamily={MONO} fontWeight={700} fill={BLEU}>
            {r}
          </text>
          <Etiquette x={150} y={55 + i * 32} taille={11.5}>
            {sens[i]!}
          </Etiquette>
          <text x={330} y={56 + i * 32} fontSize={14} fontFamily={MONO}>
            {decalerReference(r, 1, 0)}
          </text>
          <text x={480} y={56 + i * 32} fontSize={14} fontFamily={MONO}>
            {decalerReference(r, 0, 1)}
          </text>
        </g>
      ))}
    </Figure>
  );
}

/** Priorité des opérations : l'arbre de =2+3*4^2. */
export function PrioriteArbre() {
  const v = evaluerFeuille({ A1: '=4^2', A2: '=3*4^2', A3: '=2+3*4^2', A4: '=(2+3)*4^2' });
  const noeud = (x: number, y: number, t: string, r: string) => (
    <g>
      <circle cx={x} cy={y} r={17} fill="var(--color-encre-clair)" stroke={BLEU} />
      <Etiquette x={x} y={y + 5} ancre="middle" taille={14} gras couleur={BLEU}>
        {t}
      </Etiquette>
      <Etiquette x={x + 22} y={y - 10} taille={11} couleur={VERT} gras>
        {r}
      </Etiquette>
    </g>
  );
  const feuille = (x: number, y: number, t: string) => (
    <g>
      <rect x={x - 14} y={y - 12} width={28} height={24} rx={4} fill="var(--color-papier)" className="t-fin" />
      <Etiquette x={x} y={y + 5} ancre="middle" taille={13}>
        {t}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt={`La formule =2+3*4^2 se calcule dans l'ordre : d'abord la puissance, 4^2 = ${afficherValeur(v.A1)} ; puis la multiplication, 3 × ${afficherValeur(v.A1)} = ${afficherValeur(v.A2)} ; enfin l'addition, 2 + ${afficherValeur(v.A2)} = ${afficherValeur(v.A3)}. Avec des parenthèses, =(2+3)*4^2 donne ${afficherValeur(v.A4)}.`} largeur={620} hauteur={230}>
      <line x1={160} y1={40} x2={100} y2={100} className="t-moyen" />
      <line x1={160} y1={40} x2={220} y2={100} className="t-moyen" />
      <line x1={220} y1={100} x2={170} y2={160} className="t-moyen" />
      <line x1={220} y1={100} x2={270} y2={160} className="t-moyen" />
      <line x1={270} y1={160} x2={230} y2={210} className="t-moyen" />
      <line x1={270} y1={160} x2={310} y2={210} className="t-moyen" />
      {noeud(160, 40, '+', `= ${afficherValeur(v.A3)}`)}
      {feuille(100, 100, '2')}
      {noeud(220, 100, '×', `= ${afficherValeur(v.A2)}`)}
      {feuille(170, 160, '3')}
      {noeud(270, 160, '^', `= ${afficherValeur(v.A1)}`)}
      {feuille(230, 210, '4')}
      {feuille(310, 210, '2')}
      <text x={380} y={60} fontSize={15} fontFamily={MONO} fontWeight={700}>
        =2+3*4^2
      </text>
      <Etiquette x={380} y={86} taille={11.5}>
        1. puissance, 2. × et /, 3. + et −
      </Etiquette>
      <text x={380} y={140} fontSize={15} fontFamily={MONO}>
        =(2+3)*4^2
      </text>
      <Etiquette x={380} y={164} taille={11.5}>
        {`les parenthèses d'abord : ${afficherValeur(v.A4)}`}
      </Etiquette>
    </Figure>
  );
}

/** Les messages d'erreur les plus courants d'un tableur et leur cause. */
export function ErreursTableur() {
  const v = evaluerFeuille({ A1: 6, B1: 0.222, A2: 8, B2: 0.395, C1: '=A1/0', C2: '=RECHERCHEV(7;A1:B2;2;FAUX)', C3: '=SOMM(A1:A2)' });
  const lignes: [string, string, string][] = [
    ['=A1/0', afficherValeur(v.C1), 'division par zéro (cellule vide ou nulle)'],
    ['=RECHERCHEV(7;A1:B2;2;FAUX)', afficherValeur(v.C2), 'valeur cherchée absente de la table'],
    ['=SOMM(A1:A2)', afficherValeur(v.C3), 'nom de fonction mal écrit'],
    ['=A1, recopiée vers le haut', decalerReference('A1', -1, 0), 'la référence sort de la feuille'],
  ];
  return (
    <Figure alt={`Messages d'erreur d'un tableur : ${lignes.map(([f, e, c]) => `${f} donne ${e}, ${c}`).join(' ; ')}.`} largeur={620} hauteur={164}>
      {lignes.map(([f, e, c], i) => (
        <g key={f}>
          <rect x={20} y={14 + i * 36} width={230} height={26} fill="var(--color-papier)" className="t-fin" />
          <text x={26} y={32 + i * 36} fontSize={10.5} fontFamily={MONO}>
            {f}
          </text>
          <rect x={256} y={14 + i * 36} width={80} height={26} fill="var(--color-correction-clair)" stroke={ROUGE} />
          <Etiquette x={296} y={32 + i * 36} ancre="middle" taille={11.5} gras couleur={ROUGE}>
            {e}
          </Etiquette>
          <Etiquette x={348} y={32 + i * 36} taille={11}>
            {c}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** La fonction SI : une condition, deux réponses. */
export function SiOrganigramme({ condition, vrai, faux, resultat }: { condition: string; vrai: string; faux: string; resultat: string }) {
  return (
    <Figure alt={`La fonction SI teste une condition, ${condition}. Si elle est vraie, la cellule affiche ${vrai} ; sinon, ${faux}. Ici : ${resultat}.`} largeur={620} hauteur={190}>
      <polygon points={points([[310, 20], [430, 70], [310, 120], [190, 70]])} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.4} />
      <text x={310} y={75} textAnchor="middle" fontSize={12} fontFamily={MONO}>
        {condition}
      </text>
      <Fleche x1={430} y1={70} x2={500} y2={70} couleur={VERT} epaisseur={1.6} tete={8} />
      <Etiquette x={460} y={62} ancre="middle" taille={11} gras couleur={VERT}>
        VRAI
      </Etiquette>
      <rect x={500} y={54} width={100} height={32} rx={5} fill="var(--color-validation-clair)" stroke={VERT} />
      <Etiquette x={550} y={75} ancre="middle" taille={12} gras couleur={VERT}>
        {vrai}
      </Etiquette>
      <Fleche x1={190} y1={70} x2={120} y2={70} couleur={ROUGE} epaisseur={1.6} tete={8} />
      <Etiquette x={160} y={62} ancre="middle" taille={11} gras couleur={ROUGE}>
        FAUX
      </Etiquette>
      <rect x={20} y={54} width={100} height={32} rx={5} fill="var(--color-correction-clair)" stroke={ROUGE} />
      <Etiquette x={70} y={75} ancre="middle" taille={12} gras couleur={ROUGE}>
        {faux}
      </Etiquette>
      <text x={310} y={160} textAnchor="middle" fontSize={12.5} fontFamily={MONO}>
        {`=SI(${condition};"${vrai}";"${faux}")`}
      </text>
      <Etiquette x={310} y={182} ancre="middle" taille={11.5} gras>
        {`résultat : ${resultat}`}
      </Etiquette>
    </Figure>
  );
}

/** RECHERCHEV : chercher une valeur dans la première colonne d'une table, lire la colonne voulue sur la même ligne. */
export function RechercheVSchema({ feuille, table, cherche, colonne, resultat }: { feuille: Feuille; table: string; cherche: number; colonne: number; resultat: string }) {
  const v = evaluerFeuille(feuille);
  const lignes = cellulesPlage(table);
  const iTrouve = lignes.findIndex((l) => v[l[0]!] === cherche);
  return (
    <Figure alt={`RECHERCHEV cherche ${cherche} dans la première colonne de la table ${table}, s'arrête sur la ligne où il le trouve, puis lit la colonne ${colonne} de cette ligne : ${resultat}. Avec FAUX, la recherche est exacte.`} largeur={620} hauteur={50 + lignes.length * 26}>
      <rect x={40} y={20} width={90} height={26} rx={4} fill="var(--color-encre-clair)" stroke={BLEU} />
      <Etiquette x={85} y={38} ancre="middle" taille={12} gras couleur={BLEU}>
        {`cherche ${cherche}`}
      </Etiquette>
      {lignes.map((l, j) => (
        <g key={l[0]}>
          {l.map((ref, i) => (
            <g key={ref}>
              <rect x={220 + i * 90} y={20 + j * 26} width={90} height={26} fill={j === iTrouve ? (i === colonne - 1 ? 'var(--color-validation-clair)' : 'var(--color-encre-clair)') : 'var(--color-papier)'} className="t-fin" />
              <Etiquette x={220 + i * 90 + 84} y={38 + j * 26} ancre="end" taille={11.5} gras={j === iTrouve}>
                {afficherValeur(v[ref])}
              </Etiquette>
            </g>
          ))}
        </g>
      ))}
      <Fleche x1={132} y1={33} x2={216} y2={33 + iTrouve * 26} couleur={BLEU} epaisseur={1.6} tete={8} />
      <Fleche x1={316} y1={33 + iTrouve * 26} x2={220 + (colonne - 1) * 90 + 20} y2={33 + iTrouve * 26} couleur={VERT} epaisseur={1.6} tete={8} />
      <Etiquette x={420} y={38 + iTrouve * 26} taille={12} gras couleur={VERT}>
        {`→ ${resultat}`}
      </Etiquette>
    </Figure>
  );
}

/** SOMMEPROD : les produits ligne à ligne, puis leur somme. */
export function SommeProdSchema({ feuille, colonnes, lignes, noms }: { feuille: Feuille; colonnes: readonly string[]; lignes: readonly number[]; noms: readonly string[] }) {
  const v = evaluerFeuille(feuille);
  const produits = lignes.map((l) => colonnes.reduce((p, c) => p * Number(v[`${c}${l}`] ?? 0), 1));
  const somme = produits.reduce((s, p) => s + p, 0);
  const plages = colonnes.map((c) => `${c}${lignes[0]}:${c}${lignes[lignes.length - 1]}`).join(';');
  return (
    <Figure alt={`SOMMEPROD(${plages}) multiplie les valeurs ligne par ligne, ${produits.map((p) => nombre(p, 3)).join(' ; ')}, puis additionne ces produits : ${nombre(somme, 2)}.`} largeur={620} hauteur={60 + lignes.length * 28}>
      {noms.map((n, i) => (
        <Etiquette key={n} x={70 + i * 92} y={20} ancre="middle" taille={11} gras>
          {n}
        </Etiquette>
      ))}
      {lignes.map((l, j) => (
        <g key={l}>
          {colonnes.map((c, i) => (
            <g key={c}>
              <rect x={28 + i * 92} y={28 + j * 28} width={84} height={24} fill="var(--color-papier)" className="t-fin" />
              <Etiquette x={106 + i * 92} y={45 + j * 28} ancre="end" taille={11.5}>
                {afficherValeur(v[`${c}${l}`])}
              </Etiquette>
              {i < colonnes.length - 1 ? (
                <Etiquette x={116 + i * 92} y={45 + j * 28} ancre="middle" taille={12} gras couleur={BLEU}>
                  ×
                </Etiquette>
              ) : null}
            </g>
          ))}
          <Etiquette x={28 + colonnes.length * 92 + 10} y={45 + j * 28} taille={12} gras couleur={BLEU}>
            {`= ${nombre(produits[j]!, 3)}`}
          </Etiquette>
        </g>
      ))}
      <line x1={28 + colonnes.length * 92 + 8} y1={30 + lignes.length * 28} x2={28 + colonnes.length * 92 + 110} y2={30 + lignes.length * 28} className="t-moyen" />
      <Etiquette x={28 + colonnes.length * 92 + 10} y={50 + lignes.length * 28} taille={12.5} gras couleur={VERT}>
        {`Σ = ${nombre(somme, 2)}`}
      </Etiquette>
    </Figure>
  );
}

/** Les zones d'une note de calcul tabulée. */
export function NoteDeCalculSchema() {
  const zones: [string, string, string][] = [
    ['titre', 'objet, ouvrage, auteur, date, version', 'var(--trait)'],
    ['hypothèses', 'données en bleu, avec unités et sources', BLEU],
    ['calculs', 'une ligne par étape, formule visible', 'var(--color-terre)'],
    ['résultats', 'encadrés, arrondis, avec unités', VERT],
    ['vérifications', 'contrôles, ordres de grandeur, verdict', ROUGE],
  ];
  return (
    <Figure alt={`Une note de calcul tabulée se lit de haut en bas : ${zones.map(([t, d]) => `${t} (${d})`).join(', ')}. Un lecteur qui ne l'a pas écrite doit pouvoir la refaire à la main.`} largeur={620} hauteur={zones.length * 40 + 24}>
      {zones.map(([t, d, c], i) => (
        <g key={t}>
          <rect x={120} y={12 + i * 40} width={380} height={34} rx={4} fill="var(--color-papier)" stroke={c} strokeWidth={1.4} />
          <Etiquette x={110} y={34 + i * 40} ancre="end" taille={12} gras couleur={c}>
            {t}
          </Etiquette>
          <Etiquette x={132} y={34 + i * 40} taille={11.5}>
            {d}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Courbe du moment tirée de la feuille M(x) : un nuage de points reliés. */
export function GrapheMomentTableur({ feuille, n }: { feuille: Feuille; n: number }) {
  const v = evaluerFeuille(feuille);
  const pts = Array.from({ length: n + 1 }, (_, i) => [Number(v[`A${5 + i}`]), Number(v[`B${5 + i}`])] as const);
  const L = pts[pts.length - 1]![0];
  const Mmax = Math.max(...pts.map((p) => p[1]));
  const R = repere2D({ x0: 70, y0: 20, l: 480, h: 160, xmin: 0, xmax: L, ymin: 0, ymax: Mmax * 1.15 });
  const pas = Mmax > 30 ? 10 : 5;
  return (
    <Figure alt={`Graphique en nuage de points reliés, tiré de la colonne M(x) : le moment est nul aux appuis, maximal au milieu de la poutre, ${nombre(Mmax, 2)} kN·m. Axes titrés avec leurs unités.`} largeur={620} hauteur={230}>
      <Axes R={R} gradX={pts.filter((_, i) => i % 2 === 0).map((p) => p[0])} gradY={Array.from({ length: Math.floor((Mmax * 1.15) / pas) }, (_, i) => (i + 1) * pas)} titreX="x (m)" titreY="M (kN·m)" decX={1} grille />
      <polyline points={points(pts.map(([x, y]) => [R.X(x), R.Y(y)] as const))} fill="none" stroke={BLEU} strokeWidth={2} />
      {pts.map(([x, y]) => (
        <circle key={x} cx={R.X(x)} cy={R.Y(y)} r={3.2} fill={BLEU} />
      ))}
      <Etiquette x={R.X(L / 2)} y={R.Y(Mmax) - 10} ancre="middle" taille={11.5} gras couleur={BLEU}>
        {`M max = ${nombre(Mmax, 2)} kN·m`}
      </Etiquette>
    </Figure>
  );
}

/** La poignée de recopie : on tire le petit carré pour recopier une formule. */
export function PoigneeRecopie() {
  return (
    <Figure alt="Pour recopier une formule, on sélectionne la cellule et l'on tire vers le bas le petit carré de son coin inférieur droit, la poignée de recopie. Chaque copie adapte ses références relatives à sa nouvelle ligne." largeur={620} hauteur={160}>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={240} y={20 + i * 28} width={120} height={26} fill={i === 0 ? 'var(--color-encre-clair)' : 'var(--color-papier)'} stroke={i === 0 ? VERT : undefined} className={i === 0 ? 't-fort' : 't-fin'} />
      ))}
      <rect x={355} y={41} width={8} height={8} fill={VERT} />
      <Fleche x1={359} y1={52} x2={359} y2={128} couleur={VERT} epaisseur={1.6} tete={8} />
      <text x={246} y={38} fontSize={10.5} fontFamily={MONO}>
        =B4*C4
      </text>
      {[1, 2, 3].map((i) => (
        <text key={i} x={246} y={38 + i * 28} fontSize={10.5} fontFamily={MONO} fill="var(--trait-doux)">
          {recopierFormule('=B4*C4', i, 0)}
        </text>
      ))}
      <Etiquette x={380} y={48} taille={11.5} gras couleur={VERT}>
        poignée de recopie
      </Etiquette>
      <Etiquette x={60} y={78} taille={11.5}>
        on tire vers le bas :
      </Etiquette>
      <Etiquette x={60} y={94} taille={11.5}>
        les références suivent
      </Etiquette>
    </Figure>
  );
}
