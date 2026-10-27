// Schémas de compréhension du module L1.4 (algèbre linéaire), leçons 1 à 4 : matrices, pivot de Gauss,
// déterminant et inverse, rang. Les valeurs numériques arrivent par les props (lib/calc/lineaire.ts) ou sont des données d'énoncé.
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { AppuiDouble } from '@/components/drawing/Mecanique';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';
const TERRE = 'var(--color-terre)';
const TRAIT = 'var(--trait)';
const GRIS = 'var(--color-beton)';
type Mat = readonly (readonly number[])[];

/** Une grille de matrice : cellules carrées, valeurs centrées, bandes de surlignage facultatives. */
function GrilleMatrice({ x, y, M, c = 34, dec = 0, ligne, colonne, cellule, couleurLigne = BLEU, couleurColonne = VERT, nom }: { x: number; y: number; M: Mat; c?: number; dec?: number; ligne?: number; colonne?: number; cellule?: readonly [number, number]; couleurLigne?: string; couleurColonne?: string; nom?: string }) {
  const n = M.length;
  const p = M[0]?.length ?? 0;
  return (
    <g>
      {ligne !== undefined ? <rect x={x} y={y + ligne * c} width={p * c} height={c} fill={couleurLigne} fillOpacity={0.18} /> : null}
      {colonne !== undefined ? <rect x={x + colonne * c} y={y} width={c} height={n * c} fill={couleurColonne} fillOpacity={0.18} /> : null}
      {cellule ? <rect x={x + cellule[1] * c} y={y + cellule[0] * c} width={c} height={c} fill={BRIQUE} fillOpacity={0.3} /> : null}
      {M.map((l, i) =>
        l.map((v, j) => (
          <g key={`${i}-${j}`}>
            <rect x={x + j * c} y={y + i * c} width={c} height={c} fill="none" stroke={GRIS} strokeWidth={0.8} />
            <text x={x + j * c + c / 2} y={y + i * c + c / 2 + 4.5} textAnchor="middle" fontSize={13} fill="var(--trait)">
              {nombre(v, dec)}
            </text>
          </g>
        )),
      )}
      <path d={`M${x + 5} ${y - 3} h-6 v${n * c + 6} h6`} fill="none" stroke={TRAIT} strokeWidth={1.6} />
      <path d={`M${x + p * c - 5} ${y - 3} h6 v${n * c + 6} h-6`} fill="none" stroke={TRAIT} strokeWidth={1.6} />
      {nom ? (
        <Etiquette x={x + (p * c) / 2} y={y - 10} ancre="middle" taille={12.5} gras>
          {nom}
        </Etiquette>
      ) : null}
    </g>
  );
}

/** Motif de matrice sans valeurs : 'x' coefficient quelconque, '0' zéro, 'p' pivot ; augmentée si sep > 0. */
function Motif({ x, y, motif, c = 22, sep = 0 }: { x: number; y: number; motif: readonly string[]; c?: number; sep?: number }) {
  const p = motif[0]!.length;
  return (
    <g>
      {motif.map((l, i) =>
        [...l].map((t, j) => {
          const xx = x + j * c + (sep && j >= p - sep ? 6 : 0);
          return (
            <g key={`${i}-${j}`}>
              <rect x={xx + 1} y={y + i * c + 1} width={c - 2} height={c - 2} rx={3} fill={t === '0' ? 'var(--color-papier)' : t === 'p' ? 'var(--color-encre-clair)' : 'var(--color-beton-clair)'} stroke={t === 'p' ? BLEU : GRIS} strokeWidth={t === 'p' ? 1.8 : 0.8} />
              {t === '0' ? (
                <text x={xx + c / 2} y={y + i * c + c / 2 + 4} textAnchor="middle" fontSize={11} fill={GRIS}>
                  0
                </text>
              ) : null}
            </g>
          );
        }),
      )}
      {sep ? <line x1={x + (p - sep) * c + 3} y1={y - 2} x2={x + (p - sep) * c + 3} y2={y + motif.length * c + 2} stroke={TRAIT} strokeWidth={1.4} /> : null}
    </g>
  );
}

// ---------- L1.4.1 : matrices ----------

/** Le tableau du métreur : une ligne par élément, une colonne par matériau. */
export function TableauMetreur() {
  const x0 = 250;
  const yh = 30;
  const h = 40;
  const cols = ['béton (m³)', 'acier (kg)', 'coffrage (m²)'];
  const lignes = ['semelle', 'poteau', 'poutre'];
  return (
    <Figure alt="Les éléments du bâtiment, semelle, poteau et poutre, deviennent les lignes d'un tableau ; les matériaux, béton, acier et coffrage, en sont les colonnes. Ce tableau est une matrice : une ligne par élément, une colonne par matériau, une unité par colonne." largeur={620} hauteur={214}>
      <Hachures prefixe="tme" types={['ba']} />
      <polygon points={points([[60, 92], [130, 92], [120, 70], [70, 70]])} fill={hachure('tme', 'ba')} className="t-moyen" />
      <rect x={88} y={100} width={14} height={40} fill={hachure('tme', 'ba')} className="t-moyen" />
      <rect x={50} y={152} width={90} height={14} fill={hachure('tme', 'ba')} className="t-moyen" />
      {[80, 120, 160].map((y) => (
        <Fleche key={y} x1={150} y1={y} x2={x0 - 6} y2={y} couleur={TRAIT} epaisseur={1.6} tete={8} />
      ))}
      {cols.map((t, j) => (
        <g key={t}>
          <rect x={x0 + 90 + j * 88} y={yh} width={88} height={30} fill={j === 0 ? 'var(--color-encre-clair)' : 'var(--color-papier)'} stroke={GRIS} strokeWidth={1} />
          <Etiquette x={x0 + 90 + j * 88 + 44} y={yh + 20} ancre="middle" taille={11.5} gras>
            {t}
          </Etiquette>
        </g>
      ))}
      {lignes.map((t, i) => (
        <g key={t}>
          <rect x={x0} y={yh + 30 + i * h} width={90} height={h} fill="var(--color-papier)" stroke={GRIS} strokeWidth={1} />
          <Etiquette x={x0 + 10} y={yh + 30 + i * h + 25} taille={12} gras>
            {t}
          </Etiquette>
          {cols.map((c, j) => (
            <rect key={c} x={x0 + 90 + j * 88} y={yh + 30 + i * h} width={88} height={h} fill={j === 0 ? 'var(--color-encre-clair)' : 'none'} fillOpacity={0.5} stroke={GRIS} strokeWidth={1} />
          ))}
        </g>
      ))}
      <Etiquette x={x0 + 90 + 44} y={yh + 30 + 3 * h + 22} ancre="middle" taille={11} gras couleur={BLEU}>
        une colonne = une unité
      </Etiquette>
      <Etiquette x={20} y={206} taille={11.5}>
        une ligne par élément, une colonne par matériau : c’est une matrice 3 × 3
      </Etiquette>
    </Figure>
  );
}

/** Produit matriciel : la ligne i de A rencontre la colonne j de B pour donner la case (i, j) du produit. */
export function ProduitLigneColonne({ A, B, C, i, j, resultat = true }: { A: Mat; B: Mat; C?: Mat; i: number; j: number; resultat?: boolean }) {
  const c = 36;
  const termes = A[i]!.map((a, k) => `${nombre(a, 0)} × ${nombre(B[k]![j]!, 0)}`).join(' + ');
  const vide = A.map((l) => l.map(() => Number.NaN));
  return (
    <Figure alt={`Produit de A par B : la ligne ${i + 1} de A rencontre la colonne ${j + 1} de B ; on multiplie terme à terme puis on additionne${resultat ? ` : c${i + 1}${j + 1} = ${termes}${C ? ` = ${nombre(C[i]![j]!, 0)}` : ''}` : ''}.`} largeur={620} hauteur={196}>
      <GrilleMatrice x={50} y={40} M={A} c={c} ligne={i} nom="A" />
      <Etiquette x={50 + A[0]!.length * c + 24} y={40 + c + 6} ancre="middle" taille={16} gras>
        ×
      </Etiquette>
      <GrilleMatrice x={50 + A[0]!.length * c + 48} y={40} M={B} c={c} colonne={j} nom="B" />
      <Etiquette x={50 + (A[0]!.length + B[0]!.length) * c + 72} y={40 + c + 6} ancre="middle" taille={16} gras>
        =
      </Etiquette>
      {resultat && C ? (
        <GrilleMatrice x={50 + (A[0]!.length + B[0]!.length) * c + 96} y={40} M={C} c={c} cellule={[i, j]} nom="AB" />
      ) : (
        <g>
          {vide.map((l, a) =>
            l.map((_, b) => <rect key={`${a}-${b}`} x={50 + (A[0]!.length + B[0]!.length) * c + 96 + b * c} y={40 + a * c} width={c} height={c} fill={a === i && b === j ? BRIQUE : 'none'} fillOpacity={0.3} stroke={GRIS} strokeWidth={0.8} />),
          )}
          <Etiquette x={50 + (A[0]!.length + B[0]!.length) * c + 96 + (j + 0.5) * c} y={40 + (i + 0.5) * c + 5} ancre="middle" taille={13} gras>
            ?
          </Etiquette>
        </g>
      )}
      <Etiquette x={50} y={150} taille={12.5} gras couleur={BRIQUE}>
        c{i + 1}{j + 1} = {resultat ? termes : '?'}{resultat && C ? ` = ${nombre(C[i]![j]!, 0)}` : ''}
      </Etiquette>
      <Etiquette x={50} y={176} taille={11.5}>
        <tspan fill={BLEU}>ligne {i + 1} de A</tspan> × <tspan fill={VERT}>colonne {j + 1} de B</tspan> : terme à terme, puis on additionne
      </Etiquette>
    </Figure>
  );
}

/** Le devis comme produit : la ligne des quantités totales (nᵀ Q) × la colonne des prix du bordereau = le montant. */
export function DevisMatriciel() {
  const bloc = (x: number, y: number, n: number, p: number, couleur: string) => (
    <g>
      {Array.from({ length: n }, (_, i) =>
        Array.from({ length: p }, (_, j) => <rect key={`${i}-${j}`} x={x + j * 30} y={y + i * 30} width={28} height={28} rx={3} fill={couleur} fillOpacity={0.35} stroke={GRIS} strokeWidth={0.8} />),
      )}
    </g>
  );
  return (
    <Figure alt="Le devis est un produit matriciel : la ligne des quantités totales du métré (béton, acier, coffrage), multipliée par la colonne des prix unitaires du bordereau, donne une seule case, le montant. D'une ville à l'autre, on garde les quantités et l'on change seulement la colonne des prix." largeur={620} hauteur={200}>
      {bloc(30, 82, 1, 3, BLEU)}
      <Etiquette x={74} y={66} ancre="middle" taille={12} gras>
        quantités totales
      </Etiquette>
      <Etiquette x={74} y={136} ancre="middle" taille={11}>
        nᵀ Q (1 × 3)
      </Etiquette>
      <Etiquette x={148} y={102} ancre="middle" taille={16} gras>
        ×
      </Etiquette>
      {bloc(168, 52, 3, 1, TERRE)}
      <Etiquette x={182} y={38} ancre="middle" taille={12} gras>
        prix
      </Etiquette>
      <Etiquette x={182} y={162} ancre="middle" taille={11}>
        bordereau (3 × 1)
      </Etiquette>
      <Etiquette x={226} y={102} ancre="middle" taille={16} gras>
        =
      </Etiquette>
      {bloc(246, 82, 1, 1, VERT)}
      <Etiquette x={260} y={66} ancre="middle" taille={12} gras>
        montant
      </Etiquette>
      <Etiquette x={260} y={136} ancre="middle" taille={11}>
        (1 × 1)
      </Etiquette>
      <rect x={400} y={40} width={206} height={110} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={412} y={64} taille={12} gras>
        une autre ville ?
      </Etiquette>
      <Etiquette x={412} y={86} taille={11.5}>
        mêmes quantités, autre
      </Etiquette>
      <Etiquette x={412} y={104} taille={11.5}>
        colonne de prix (transport,
      </Etiquette>
      <Etiquette x={412} y={122} taille={11.5}>
        date du bordereau)
      </Etiquette>
      <Etiquette x={30} y={190} taille={11} classe="etiquette">
        le tableur fait ce calcul avec une seule fonction (PRODUITMAT, SOMMEPROD)
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.4.2 : pivot de Gauss ----------

/** Deux tickets de caisse sans le détail des prix : en les comparant, on retrouve le prix de chaque article. */
export function DeuxTickets({ t1, t2, ciment, chaux }: { t1: readonly [number, number, number]; t2: readonly [number, number, number]; ciment: number; chaux: number }) {
  const ticket = (x: number, t: readonly [number, number, number], titre: string) => (
    <g>
      <path d={`M${x} 30 h150 v118 l-12 8 l-13 -8 l-12 8 l-13 -8 l-12 8 l-13 -8 l-12 8 l-13 -8 l-12 8 l-13 -8 l-12 8 l-13 -8 v-118 z`} fill="var(--color-papier)" stroke={GRIS} strokeWidth={1.2} />
      <Etiquette x={x + 75} y={52} ancre="middle" taille={12} gras>
        {titre}
      </Etiquette>
      <text x={x + 14} y={80} fontSize={14} fill={BLEU} style={{ fontFamily: 'var(--font-manuscrite)' }}>
        {nombre(t[0], 0)} sac{t[0] > 1 ? 's' : ''} de ciment
      </text>
      <text x={x + 14} y={102} fontSize={14} fill={BLEU} style={{ fontFamily: 'var(--font-manuscrite)' }}>
        {nombre(t[1], 0)} sac{t[1] > 1 ? 's' : ''} de chaux
      </text>
      <line x1={x + 12} y1={114} x2={x + 138} y2={114} className="t-fin" strokeDasharray="3 3" />
      <text x={x + 14} y={136} fontSize={14} fontWeight={700} fill="var(--trait)">
        total : {nombre(t[2], 0)} USD
      </text>
    </g>
  );
  return (
    <Figure alt={`Deux tickets : ${nombre(t1[0], 0)} sacs de ciment et ${nombre(t1[1], 0)} sac de chaux pour ${nombre(t1[2], 0)} USD ; ${nombre(t2[0], 0)} sac de ciment et ${nombre(t2[1], 0)} sac de chaux pour ${nombre(t2[2], 0)} USD. En retranchant le second du premier, il reste un sac de ciment : le ciment coûte ${nombre(ciment, 0)} USD, la chaux ${nombre(chaux, 0)} USD.`} largeur={620} hauteur={196}>
      {ticket(20, t1, 'ticket 1')}
      {ticket(190, t2, 'ticket 2')}
      <rect x={370} y={40} width={236} height={110} rx={8} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1.2} />
      <Etiquette x={382} y={64} taille={12} gras couleur={VERT}>
        ticket 1 − ticket 2 :
      </Etiquette>
      <Etiquette x={382} y={84} taille={11.5}>
        il reste un sac de ciment
      </Etiquette>
      <Etiquette x={382} y={110} taille={12.5} gras>
        ciment : {nombre(ciment, 0)} USD
      </Etiquette>
      <Etiquette x={382} y={132} taille={12.5} gras>
        puis chaux : {nombre(chaux, 0)} USD
      </Etiquette>
      <Etiquette x={20} y={186} taille={11} classe="etiquette">
        retrancher une équation à une autre, puis remonter : c’est le pivot de Gauss
      </Etiquette>
    </Figure>
  );
}

/** Les étapes du pivot de Gauss sur une matrice augmentée : zéros sous les pivots, système triangulaire, remontée. */
export function EtapesGauss() {
  const etapes = [
    { motif: ['xxxx', 'xxxx', 'xxxx'], titre: 'départ [A | b]' },
    { motif: ['pxxx', '0xxx', '0xxx'], titre: 'zéros sous le pivot 1' },
    { motif: ['pxxx', '0pxx', '00px'], titre: 'système triangulaire' },
    { motif: ['pxxx', '0pxx', '00px'], titre: 'remontée : x₃, x₂, x₁' },
  ];
  return (
    <Figure alt="Quatre états de la matrice augmentée [A | b] d'un système 3 × 3 : au départ tous les coefficients ; après élimination sous le premier pivot, des zéros dans la première colonne ; puis un système triangulaire ; enfin la remontée, de la dernière inconnue à la première." largeur={620} hauteur={176}>
      {etapes.map((e, k) => {
        const x = 20 + k * 152;
        return (
          <g key={e.titre}>
            <Motif x={x} y={36} motif={e.motif} c={24} sep={1} />
            {k < 3 ? <Fleche x1={x + 108} y1={72} x2={x + 140} y2={72} couleur={TRAIT} epaisseur={1.6} tete={7} /> : null}
            {k === 3 ? (
              <path d={`M${x + 112} 100 q 18 -30 0 -60`} fill="none" stroke={ROUGE} strokeWidth={2} markerEnd="" />
            ) : null}
            {k === 3 ? <polygon points={points([[x + 112, 40], [x + 106, 50], [x + 117, 50]])} fill={ROUGE} /> : null}
            <Etiquette x={x + 50} y={130} ancre="middle" taille={11.5} gras>
              {e.titre}
            </Etiquette>
          </g>
        );
      })}
      <Etiquette x={20} y={164} taille={11} classe="etiquette">
        gris : coefficient quelconque · bleu : pivot · blanc : zéro · trait vertical : second membre b
      </Etiquette>
    </Figure>
  );
}

/** Un pivot nul : on échange la ligne avec une ligne du dessous ; le pivot partiel prend le plus grand en valeur absolue. */
export function PivotNulEchange({ M1, M2 }: { M1: Mat; M2: Mat }) {
  const c = 32;
  return (
    <Figure alt="Matrice augmentée dont le premier pivot est nul : on ne peut pas diviser par zéro. On échange les deux lignes ; le système obtenu est déjà triangulaire. Les logiciels choisissent toujours, dans la colonne, le coefficient le plus grand en valeur absolue : c'est le pivot partiel." largeur={620} hauteur={170}>
      <GrilleMatrice x={70} y={40} M={M1} c={c} />
      <line x1={70 + 2 * c} y1={36} x2={70 + 2 * c} y2={40 + 2 * c + 4} stroke={TRAIT} strokeWidth={1.4} />
      <circle cx={70 + c / 2} cy={40 + c / 2} r={15} fill="none" stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={40} y={34} ancre="middle" taille={11} gras couleur={ROUGE}>
        pivot nul
      </Etiquette>
      <path d={`M54 ${40 + c / 2} q -26 ${c / 2} 0 ${c}`} fill="none" stroke={BLEU} strokeWidth={2} />
      <Etiquette x={22} y={40 + c + 8} ancre="middle" taille={11} gras couleur={BLEU}>
        L₁ ↔ L₂
      </Etiquette>
      <Fleche x1={190} y1={72} x2={250} y2={72} couleur={TRAIT} epaisseur={1.8} tete={8} />
      <GrilleMatrice x={270} y={40} M={M2} c={c} />
      <line x1={270 + 2 * c} y1={36} x2={270 + 2 * c} y2={40 + 2 * c + 4} stroke={TRAIT} strokeWidth={1.4} />
      <Etiquette x={270 + 1.5 * c} y={40 + 2 * c + 26} ancre="middle" taille={11.5} gras couleur={VERT}>
        déjà triangulaire
      </Etiquette>
      <rect x={420} y={34} width={186} height={96} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={432} y={58} taille={12} gras>
        pivot partiel
      </Etiquette>
      <Etiquette x={432} y={80} taille={11.5}>
        dans la colonne, on prend
      </Etiquette>
      <Etiquette x={432} y={98} taille={11.5}>
        le plus grand |aᵢⱼ| : moins
      </Etiquette>
      <Etiquette x={432} y={116} taille={11.5}>
        d’erreurs d’arrondi
      </Etiquette>
    </Figure>
  );
}

/** L'opération sur une ligne s'applique à toute la ligne, second membre compris. */
export function SecondMembre() {
  const cell = (x: number, y: number, t: string, rouge = false) => (
    <g>
      <rect x={x} y={y} width={56} height={30} rx={3} fill={rouge ? 'var(--color-correction-clair)' : 'var(--color-beton-clair)'} stroke={rouge ? ROUGE : GRIS} strokeWidth={rouge ? 1.8 : 0.8} />
      <text x={x + 28} y={y + 20} textAnchor="middle" fontSize={13} fill="var(--trait)">
        {t}
      </text>
    </g>
  );
  return (
    <Figure alt="L'opération L2 ← L2 − k L1 s'applique à chaque coefficient de la ligne 2, y compris le second membre b2, qui devient b2 − k b1. L'oublier fausse toute la solution." largeur={620} hauteur={160}>
      {['a₁₁', 'a₁₂', 'a₁₃'].map((t, j) => cell(60 + j * 60, 30, t))}
      {cell(250, 30, 'b₁')}
      {['a₂₁', 'a₂₂', 'a₂₃'].map((t, j) => cell(60 + j * 60, 72, t))}
      {cell(250, 72, 'b₂', true)}
      <line x1={244} y1={24} x2={244} y2={108} stroke={TRAIT} strokeWidth={1.4} />
      <Etiquette x={20} y={52} taille={12} gras>
        L₁
      </Etiquette>
      <Etiquette x={20} y={94} taille={12} gras>
        L₂
      </Etiquette>
      <Fleche x1={330} y1={92} x2={380} y2={92} couleur={TRAIT} epaisseur={1.6} tete={8} />
      <Etiquette x={392} y={82} taille={12.5} gras couleur={BLEU}>
        L₂ ← L₂ − k L₁
      </Etiquette>
      <Etiquette x={392} y={104} taille={12} gras couleur={ROUGE}>
        b₂ devient b₂ − k b₁ : aussi !
      </Etiquette>
      <Etiquette x={60} y={144} taille={11} classe="etiquette">
        la ligne entière, quatre cases sur quatre : le second membre fait partie de l’équation
      </Etiquette>
    </Figure>
  );
}

/** Le cru d'une cimenterie : trouver les proportions de trois matières pour atteindre une composition, un système linéaire. */
export function CruCimenterie() {
  const matieres = ['calcaire', 'argile', 'correctif'];
  const oxydes = ['CaO', 'SiO₂', 'Al₂O₃', 'Fe₂O₃'];
  return (
    <Figure alt="Trois matières, calcaire, argile et correctif, mélangées en proportions x1, x2, x3, donnent le cru. Chaque matière apporte sa part de chaux, de silice, d'alumine et d'oxyde de fer : trouver les proportions qui donnent la composition visée est un système linéaire A x = b, une ligne par oxyde, une colonne par matière." largeur={620} hauteur={210}>
      {matieres.map((m, i) => (
        <g key={m}>
          <polygon points={points([[30 + i * 92, 40], [100 + i * 92, 40], [86 + i * 92, 92], [44 + i * 92, 92]])} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
          <Etiquette x={65 + i * 92} y={64} ancre="middle" taille={11.5} gras>
            {m}
          </Etiquette>
          <Etiquette x={65 + i * 92} y={84} ancre="middle" taille={12} gras couleur={BLEU}>
            x{['₁', '₂', '₃'][i]}
          </Etiquette>
          <Fleche x1={65 + i * 92} y1={96} x2={150} y2={136} couleur={TRAIT} epaisseur={1.4} tete={7} />
        </g>
      ))}
      <rect x={110} y={138} width={80} height={34} rx={6} fill="var(--color-beton-clair)" className="t-moyen" />
      <Etiquette x={150} y={160} ancre="middle" taille={12} gras>
        le cru
      </Etiquette>
      <Fleche x1={196} y1={155} x2={330} y2={155} couleur={TRAIT} epaisseur={1.6} tete={8} />
      <Etiquette x={262} y={146} ancre="middle" taille={11}>
        composition
      </Etiquette>
      {oxydes.map((o, k) => (
        <g key={o}>
          <rect x={344 + k * 64} y={170 - [70, 34, 16, 10][k]!} width={40} height={[70, 34, 16, 10][k]!} fill={BLEU} fillOpacity={0.25} stroke={BLEU} strokeWidth={1.2} />
          <line x1={340 + k * 64} y1={170 - [70, 34, 16, 10][k]!} x2={388 + k * 64} y2={170 - [70, 34, 16, 10][k]!} stroke={ROUGE} strokeWidth={2} strokeDasharray="4 3" />
          <Etiquette x={364 + k * 64} y={190} ancre="middle" taille={11.5} gras>
            {o}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={340} y={40} taille={11.5} gras couleur={ROUGE}>
        trait rouge : composition visée
      </Etiquette>
      <Etiquette x={340} y={60} taille={11.5}>
        A x = b : une ligne par oxyde,
      </Etiquette>
      <Etiquette x={340} y={78} taille={11.5}>
        une colonne par matière
      </Etiquette>
    </Figure>
  );
}

/** Deux droites sécantes : la solution d'un système 2 × 2 est leur point commun (exercice 1). */
export function DroitesSecantes({ e1, e2, sol, xmax = 12, ymin = -2, ymax = 10 }: { e1: readonly [number, number, number]; e2: readonly [number, number, number]; sol: readonly number[]; xmax?: number; ymin?: number; ymax?: number }) {
  const x0 = 60;
  const lg = 300;
  const yb = 190;
  const kx = lg / xmax;
  const ky = 170 / (ymax - ymin);
  const X = (x: number) => x0 + x * kx;
  const Y = (y: number) => yb - (y - ymin) * ky;
  const droite = (e: readonly [number, number, number]) => {
    const [a, b, c] = e;
    const pts = [0, xmax].map((x) => [x, (c - a * x) / b] as const);
    return pts.map(([x, y]) => [X(x), Y(y)] as const);
  };
  const eq = (e: readonly [number, number, number]) => `${nombre(e[0], 0)} x ${e[1] < 0 ? '−' : '+'} ${nombre(Math.abs(e[1]), 0)} y = ${nombre(e[2], 0)}`.replace(/^1 x/, 'x').replace(/ 1 y/, ' y');
  const [d1, d2] = [droite(e1), droite(e2)];
  return (
    <Figure alt={`Les deux équations ${eq(e1)} et ${eq(e2)} sont deux droites qui se coupent au point (${nombre(sol[0]!, 0)} ; ${nombre(sol[1]!, 0)}) : c'est la solution du système.`} largeur={620} hauteur={214}>
      <line x1={X(0)} y1={Y(0)} x2={X(xmax)} y2={Y(0)} className="t-fin" />
      <line x1={X(0)} y1={Y(ymin)} x2={X(0)} y2={Y(ymax)} className="t-fin" />
      {Array.from({ length: xmax + 1 }, (_, i) => (
        <line key={i} x1={X(i)} y1={Y(0) - 3} x2={X(i)} y2={Y(0) + 3} className="t-fin" />
      ))}
      <line x1={d1[0]![0]} y1={d1[0]![1]} x2={d1[1]![0]} y2={d1[1]![1]} stroke={BLEU} strokeWidth={2.4} />
      <line x1={d2[0]![0]} y1={d2[0]![1]} x2={d2[1]![0]} y2={d2[1]![1]} stroke={BRIQUE} strokeWidth={2.4} />
      <circle cx={X(sol[0]!)} cy={Y(sol[1]!)} r={6} fill={VERT} />
      <Etiquette x={X(sol[0]!) + 10} y={Y(sol[1]!) - 8} taille={12.5} gras couleur={VERT}>
        ({nombre(sol[0]!, 0)} ; {nombre(sol[1]!, 0)})
      </Etiquette>
      <Etiquette x={X(xmax) + 8} y={Y(0) + 4} taille={11}>
        x
      </Etiquette>
      <Etiquette x={X(0) - 8} y={Y(ymax) + 4} ancre="end" taille={11}>
        y
      </Etiquette>
      <Etiquette x={400} y={70} taille={12.5} gras couleur={BLEU}>
        {eq(e1)}
      </Etiquette>
      <Etiquette x={400} y={94} taille={12.5} gras couleur={BRIQUE}>
        {eq(e2)}
      </Etiquette>
      <Etiquette x={400} y={124} taille={11.5}>
        une équation = une droite ;
      </Etiquette>
      <Etiquette x={400} y={142} taille={11.5}>
        la solution = leur point commun
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.4.3 : déterminant et inverse ----------

/** À midi, l'ombre d'un poteau se réduit à un point : l'information de hauteur est écrasée, comme quand det = 0. */
export function OmbreEcrasee() {
  const poteau = (x: number) => <rect x={x - 5} y={70} width={10} height={100} fill="var(--color-beton-clair)" className="t-moyen" />;
  return (
    <Figure alt="À gauche, le soleil du matin est bas : l'ombre du poteau est longue, elle garde la trace de sa hauteur. À droite, le soleil de midi est au-dessus : l'ombre se réduit à un point, la hauteur est écrasée et on ne peut plus la retrouver. Une matrice de déterminant nul écrase de même, et n'a pas d'inverse." largeur={620} hauteur={216}>
      <line x1={20} y1={170} x2={600} y2={170} className="t-moyen" />
      <circle cx={50} cy={50} r={18} fill="#f5c542" stroke={TERRE} strokeWidth={1.2} />
      {poteau(170)}
      <line x1={64} y1={58} x2={175} y2={70} stroke={TERRE} strokeWidth={1} strokeDasharray="4 3" />
      <line x1={175} y1={70} x2={290} y2={170} stroke={TERRE} strokeWidth={1} strokeDasharray="4 3" />
      <rect x={170} y={166} width={120} height={6} fill={TRAIT} opacity={0.6} />
      <Etiquette x={160} y={200} ancre="middle" taille={11.5}>
        le matin : l’ombre garde la hauteur
      </Etiquette>
      <circle cx={460} cy={30} r={18} fill="#f5c542" stroke={TERRE} strokeWidth={1.2} />
      {poteau(460)}
      <line x1={460} y1={50} x2={460} y2={68} stroke={TERRE} strokeWidth={1} strokeDasharray="4 3" />
      <ellipse cx={460} cy={170} rx={9} ry={3} fill={TRAIT} opacity={0.6} />
      <Etiquette x={470} y={200} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        à midi : tout est écrasé (det = 0)
      </Etiquette>
    </Figure>
  );
}

/** Règle de Sarrus : trois produits descendants moins trois produits montants (matrices 3 × 3 seulement). */
export function SarrusSchema({ M, plus, moins, det }: { M: Mat; plus: readonly number[]; moins: readonly number[]; det: number }) {
  const c = 36;
  const x0 = 40;
  const y0 = 40;
  const etendue = M.map((l) => [...l, l[0]!, l[1]!]);
  const P = (i: number, j: number) => [x0 + j * c + c / 2, y0 + i * c + c / 2] as const;
  return (
    <Figure alt={`Règle de Sarrus pour une matrice 3 × 3 : on recopie les deux premières colonnes à droite ; produits descendants ${plus.map((v) => nombre(v, 0)).join(', ')} comptés en plus, produits montants ${moins.map((v) => nombre(v, 0)).join(', ')} comptés en moins ; déterminant ${nombre(det, 0)}.`} largeur={620} hauteur={216}>
      <line x1={x0 + 3 * c - 2} y1={y0 - 4} x2={x0 + 3 * c - 2} y2={y0 + 3 * c + 4} stroke={GRIS} strokeDasharray="4 3" />
      {[0, 1, 2].map((k) => (
        <line key={`d${k}`} x1={P(0, k)[0] - 8} y1={P(0, k)[1] - 8} x2={P(2, k + 2)[0] + 8} y2={P(2, k + 2)[1] + 8} stroke={VERT} strokeWidth={2} opacity={0.8} />
      ))}
      {[0, 1, 2].map((k) => (
        <line key={`m${k}`} x1={P(2, k)[0] - 8} y1={P(2, k)[1] + 8} x2={P(0, k + 2)[0] + 8} y2={P(0, k + 2)[1] - 8} stroke={ROUGE} strokeWidth={2} opacity={0.8} strokeDasharray="6 3" />
      ))}
      {etendue.map((l, i) =>
        l.map((v, j) => (
          <Etiquette key={`${i}-${j}`} x={P(i, j)[0]} y={P(i, j)[1] + 5} ancre="middle" taille={14} gras={j < 3} couleur={j >= 3 ? GRIS : undefined}>
            {nombre(v, 0)}
          </Etiquette>
        )),
      )}
      <Etiquette x={x0 + 4 * c} y={y0 - 12} ancre="middle" taille={11} classe="etiquette">
        2 colonnes recopiées
      </Etiquette>
      <Etiquette x={260} y={70} taille={13} gras couleur={VERT}>
        + ({plus.map((v) => nombre(v, 0)).join(' + ')})
      </Etiquette>
      <Etiquette x={260} y={100} taille={13} gras couleur={ROUGE}>
        − ({moins.map((v) => nombre(v, 0)).join(' + ')})
      </Etiquette>
      <Etiquette x={260} y={134} taille={14} gras>
        = det = {nombre(det, 0)}
      </Etiquette>
      <Etiquette x={40} y={200} taille={11} classe="etiquette">
        vert : produits descendants, comptés en plus · rouge : montants, en moins · 3 × 3 seulement
      </Etiquette>
    </Figure>
  );
}

/** Inverse d'une 2 × 2 : échanger a et d, changer le signe de b et c, diviser par det ; en général, [A | I] → [I | A⁻¹]. */
export function InverseRecette() {
  const m = (x: number, y: number, t: readonly string[], couleurs: readonly string[]) => (
    <g>
      {t.map((v, k) => (
        <text key={k} x={x + (k % 2) * 46 + 20} y={y + Math.floor(k / 2) * 34 + 22} textAnchor="middle" fontSize={15} fontWeight={700} fill={couleurs[k]}>
          {v}
        </text>
      ))}
      <path d={`M${x + 4} ${y - 4} h-6 v${76} h6`} fill="none" stroke={TRAIT} strokeWidth={1.6} />
      <path d={`M${x + 86} ${y - 4} h6 v${76} h-6`} fill="none" stroke={TRAIT} strokeWidth={1.6} />
    </g>
  );
  return (
    <Figure alt="Inverse d'une matrice 2 × 2 (a b ; c d) : on échange a et d, on change le signe de b et de c, puis on divise par le déterminant ad − bc. En général, on écrit [A | I] et l'on applique le pivot de Gauss jusqu'à obtenir [I | A⁻¹]." largeur={620} hauteur={196}>
      {m(30, 50, ['a', 'b', 'c', 'd'], [BLEU, ROUGE, ROUGE, BLEU])}
      <Fleche x1={130} y1={84} x2={176} y2={84} couleur={TRAIT} epaisseur={1.6} tete={8} />
      <Etiquette x={196} y={88} taille={13} gras>
        1 / (ad − bc) ×
      </Etiquette>
      {m(300, 50, ['d', '−b', '−c', 'a'], [BLEU, ROUGE, ROUGE, BLEU])}
      <path d="M54 46 q 23 -26 46 0" fill="none" stroke={BLEU} strokeWidth={1.6} />
      <Etiquette x={77} y={28} ancre="middle" taille={11} couleur={BLEU}>
        a ↔ d
      </Etiquette>
      <Etiquette x={77} y={146} ancre="middle" taille={11} couleur={ROUGE}>
        b, c : signe changé
      </Etiquette>
      <rect x={420} y={40} width={186} height={110} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={432} y={64} taille={12} gras>
        en général
      </Etiquette>
      <Etiquette x={432} y={90} taille={13} gras couleur={BLEU}>
        [A | I] → [I | A⁻¹]
      </Etiquette>
      <Etiquette x={432} y={114} taille={11.5}>
        Gauss au-dessus et
      </Etiquette>
      <Etiquette x={432} y={132} taille={11.5}>
        au-dessous de la diagonale
      </Etiquette>
      <Etiquette x={30} y={184} taille={11} classe="etiquette">
        contrôle obligatoire : A × A⁻¹ = I · si ad − bc = 0, pas d’inverse
      </Etiquette>
    </Figure>
  );
}

/** Trois appuis presque alignés : le déterminant devient petit et les réactions très sensibles à la position de la charge. */
export function AppuisPresqueAlignes({ yC, F, cas, det, detRef }: { yC: number; F: number; cas: ReadonlyArray<{ y: number; RC: number }>; det: number; detRef: number }) {
  const kx = 90;
  const ky = 300;
  const X = (x: number) => 70 + x * kx;
  const Y = (y: number) => 180 - y * ky;
  return (
    <Figure alt={`Plateau sur trois appuis A (0 ; 0), B (4 ; 0) et C presque alignés, C à ${nombre(yC * 100, 0)} cm de la droite AB : det M = ${nombre(det, 1)} au lieu de ${nombre(detRef, 0)}. Une cuve de ${nombre(F, 0)} kN donne ${cas.map((c) => `R_C = ${nombre(c.RC, 0)} kN si elle est à ${nombre(c.y * 100, 0)} cm de AB`).join(', ')} : quelques centimètres changent tout.`} largeur={620} hauteur={226}>
      <polygon points={points([[X(0), Y(0)], [X(4), Y(0)], [X(2), Y(yC)]])} fill="var(--color-beton-clair)" stroke={TRAIT} strokeWidth={1.4} />
      {(
        [
          [0, 0, 'A'],
          [4, 0, 'B'],
          [2, yC, 'C'],
        ] as const
      ).map(([x, y, n]) => (
        <g key={n}>
          <circle cx={X(x)} cy={Y(y)} r={6} fill={TRAIT} />
          <Etiquette x={X(x) + (x === 2 ? 0 : x < 2 ? -10 : 10)} y={Y(y) + (y > 0 ? -12 : 20)} ancre={x === 2 ? 'middle' : x < 2 ? 'end' : 'start'} taille={12.5} gras>
            {n}
          </Etiquette>
        </g>
      ))}
      {cas.map((c, i) => (
        <g key={c.y}>
          <circle cx={X(2)} cy={Y(c.y)} r={5} fill={i === 0 ? ROUGE : BRIQUE} />
          <line x1={X(2)} y1={Y(c.y)} x2={X(2) + (i === 0 ? -60 : 60)} y2={Y(c.y) + (i === 0 ? -34 : 30)} stroke={i === 0 ? ROUGE : BRIQUE} strokeWidth={1} />
          <Etiquette x={X(2) + (i === 0 ? -64 : 64)} y={Y(c.y) + (i === 0 ? -38 : 42)} ancre={i === 0 ? 'end' : 'start'} taille={12} gras couleur={i === 0 ? ROUGE : BRIQUE}>
            charge à {nombre(c.y * 100, 0)} cm : RC = {nombre(c.RC, 0)} kN
          </Etiquette>
        </g>
      ))}
      <Cote x1={X(4) + 34} y1={Y(0)} x2={X(4) + 34} y2={Y(yC)} decalage={0} texte={`${nombre(yC * 100, 0)} cm`} />
      <rect x={440} y={30} width={166} height={58} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={452} y={54} taille={12} gras>
        det M = {nombre(det, 1)}
      </Etiquette>
      <Etiquette x={452} y={74} taille={11.5}>
        au lieu de {nombre(detRef, 0)} (triangle normal)
      </Etiquette>
      <Etiquette x={20} y={216} taille={11} classe="etiquette">
        échelle verticale exagérée
      </Etiquette>
    </Figure>
  );
}

/** Le déterminant 2 × 2 comme aire : M construit un parallélogramme d'aire det M ; P l'aplatit sur une droite (exercice 1). */
export function DeuxParallelogrammes({ M, P, dM, dP }: { M: Mat; P: Mat; dM: number; dP: number }) {
  const k = 28;
  const panneau = (ox: number, A: Mat, d: number, titre: string) => {
    const u = [A[0]![0]!, A[1]![0]!];
    const v = [A[0]![1]!, A[1]![1]!];
    const Pt = (x: number, y: number) => [ox + x * k, 180 - y * k] as const;
    return (
      <g>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`v${i}`} x1={Pt(i, 0)[0]} y1={Pt(0, 0)[1]} x2={Pt(i, 0)[0]} y2={Pt(0, 5)[1]} stroke={GRIS} strokeWidth={0.5} opacity={0.5} />
        ))}
        {Array.from({ length: 6 }, (_, j) => (
          <line key={`h${j}`} x1={Pt(0, 0)[0]} y1={Pt(0, j)[1]} x2={Pt(6, 0)[0]} y2={Pt(0, j)[1]} stroke={GRIS} strokeWidth={0.5} opacity={0.5} />
        ))}
        <polygon points={points([Pt(0, 0), Pt(u[0]!, u[1]!), Pt(u[0]! + v[0]!, u[1]! + v[1]!), Pt(v[0]!, v[1]!)])} fill={Math.abs(d) > 1e-9 ? BLEU : ROUGE} fillOpacity={0.2} stroke={Math.abs(d) > 1e-9 ? BLEU : ROUGE} strokeWidth={2} />
        <Fleche x1={Pt(0, 0)[0]} y1={Pt(0, 0)[1]} x2={Pt(u[0]!, u[1]!)[0]} y2={Pt(u[0]!, u[1]!)[1]} couleur={TRAIT} epaisseur={2} tete={8} />
        <Fleche x1={Pt(0, 0)[0]} y1={Pt(0, 0)[1]} x2={Pt(v[0]!, v[1]!)[0]} y2={Pt(v[0]!, v[1]!)[1]} couleur={TRAIT} epaisseur={2} tete={8} />
        <Etiquette x={ox + 3 * k} y={24} ancre="middle" taille={12.5} gras>
          {titre}
        </Etiquette>
        <Etiquette x={ox + 3 * k} y={206} ancre="middle" taille={12.5} gras couleur={Math.abs(d) > 1e-9 ? BLEU : ROUGE}>
          det = {nombre(d, 0)}{Math.abs(d) > 1e-9 ? ` : aire de ${nombre(Math.abs(d), 0)} carreaux` : ' : aplati, pas d’inverse'}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt={`Les colonnes de M construisent un parallélogramme d'aire ${nombre(dM, 0)} carreaux : M est inversible. Les colonnes de P sont alignées, la deuxième vaut deux fois la première : le parallélogramme est aplati, det P = ${nombre(dP, 0)}.`} largeur={620} hauteur={216}>
      {panneau(50, M, dM, 'M')}
      {panneau(360, P, dP, 'P')}
    </Figure>
  );
}

// ---------- L1.4.4 : espaces vectoriels, bases, rang ----------

/** Deux directions non parallèles permettent d'atteindre tout point du plan ; deux directions parallèles, non. */
export function DeuxDirections() {
  const reseau = (ox: number, u: readonly [number, number], v: readonly [number, number]) =>
    Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 5 }, (_, j) => {
        const x = ox + i * u[0] + j * v[0];
        const y = 170 - i * u[1] - j * v[1];
        return x < ox + 250 && y > 30 ? <circle key={`${i}-${j}`} cx={x} cy={y} r={2.5} fill={GRIS} /> : null;
      }),
    );
  return (
    <Figure alt="À gauche, deux directions non parallèles : en combinant des pas dans chacune, on atteint n'importe quel point du plan, la cible en vert. À droite, deux directions parallèles : on reste prisonnier d'une seule droite, la cible en rouge est inaccessible." largeur={620} hauteur={216}>
      {reseau(40, [46, 0], [22, 34])}
      <Fleche x1={40} y1={170} x2={86} y2={170} couleur={BLEU} epaisseur={2.6} tete={9} />
      <Fleche x1={40} y1={170} x2={62} y2={136} couleur={BRIQUE} epaisseur={2.6} tete={9} />
      <polyline points={points([[40, 170], [178, 170], [222, 102]])} fill="none" stroke={VERT} strokeWidth={2} strokeDasharray="5 4" />
      <circle cx={222} cy={102} r={7} fill={VERT} />
      <Etiquette x={150} y={206} ancre="middle" taille={11.5} gras couleur={VERT}>
        deux directions libres : tout le plan
      </Etiquette>
      <line x1={340} y1={190} x2={600} y2={60} stroke={GRIS} strokeWidth={1.4} strokeDasharray="6 4" />
      <Fleche x1={360} y1={180} x2={400} y2={160} couleur={BLEU} epaisseur={2.6} tete={9} />
      <Fleche x1={360} y1={180} x2={440} y2={140} couleur={BRIQUE} epaisseur={2.6} tete={9} pointilles />
      <circle cx={520} cy={170} r={7} fill={ROUGE} />
      <Etiquette x={530} y={174} taille={11.5} gras couleur={ROUGE}>
        ✗
      </Etiquette>
      <Etiquette x={470} y={206} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        deux directions parallèles : une seule droite
      </Etiquette>
    </Figure>
  );
}

/** Coordonnées d'un vecteur F dans la base (u, w) : F = λ u + μ w, lues sur le parallélogramme. */
export function CoordonneesBase({ u, w, F, l, m }: { u: readonly [number, number]; w: readonly [number, number]; F: readonly [number, number]; l: number; m: number }) {
  const k = 30;
  const O = [70, 200] as const;
  const P = (x: number, y: number) => [O[0] + x * k, O[1] - y * k] as const;
  const lu = [l * u[0], l * u[1]] as const;
  return (
    <Figure alt={`Dans la base (u, w), avec u = (${nombre(u[0], 0)} ; ${nombre(u[1], 0)}) et w = (${nombre(w[0], 0)} ; ${nombre(w[1], 0)}), le vecteur F = (${nombre(F[0], 0)} ; ${nombre(F[1], 0)}) s'écrit F = ${nombre(l, 0)} u + ${nombre(m, 0)} w : ce sont ses coordonnées dans cette base.`} largeur={620} hauteur={226}>
      <line x1={O[0]} y1={O[1]} x2={P(7, 0)[0]} y2={O[1]} className="t-fin" />
      <line x1={O[0]} y1={O[1]} x2={O[0]} y2={P(0, 6)[1]} className="t-fin" />
      <Fleche x1={O[0]} y1={O[1]} x2={P(...u)[0]} y2={P(...u)[1]} couleur={BLEU} epaisseur={2.6} tete={9} />
      <Etiquette x={P(...u)[0] - 10} y={P(...u)[1]} ancre="end" taille={12.5} gras couleur={BLEU}>
        u
      </Etiquette>
      <Fleche x1={O[0]} y1={O[1]} x2={P(...w)[0]} y2={P(...w)[1]} couleur={BRIQUE} epaisseur={2.6} tete={9} />
      <Etiquette x={P(...w)[0] + 6} y={P(...w)[1] + 16} taille={12.5} gras couleur={BRIQUE}>
        w
      </Etiquette>
      <line x1={O[0]} y1={O[1]} x2={P(...lu)[0]} y2={P(...lu)[1]} stroke={BLEU} strokeWidth={1.4} strokeDasharray="5 4" />
      <line x1={P(...lu)[0]} y1={P(...lu)[1]} x2={P(...F)[0]} y2={P(...F)[1]} stroke={BRIQUE} strokeWidth={1.4} strokeDasharray="5 4" />
      <Fleche x1={O[0]} y1={O[1]} x2={P(...F)[0]} y2={P(...F)[1]} couleur={ROUGE} epaisseur={3} tete={11} />
      <Etiquette x={P(...F)[0] + 8} y={P(...F)[1] - 6} taille={13} gras couleur={ROUGE}>
        F
      </Etiquette>
      <Etiquette x={P(...lu)[0] - 10} y={P(...lu)[1] + 4} ancre="end" taille={11.5} couleur={BLEU}>
        {nombre(l, 0)} u
      </Etiquette>
      <rect x={380} y={60} width={226} height={96} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={392} y={86} taille={13} gras>
        F = {nombre(l, 0)} u + {nombre(m, 0)} w
      </Etiquette>
      <Etiquette x={392} y={112} taille={11.5}>
        ({nombre(l, 0)} ; {nombre(m, 0)}) : coordonnées de F
      </Etiquette>
      <Etiquette x={392} y={132} taille={11.5}>
        dans la base (u, w), uniques
      </Etiquette>
    </Figure>
  );
}

/** Trois plateaux sur trois appuis : en triangle (une solution), alignés avec charge sur la ligne (une infinité), hors de la ligne (aucune). */
export function TroisPlateaux({ cas }: { cas: ReadonlyArray<{ A: Mat; b: readonly number[]; nature: string }> }) {
  const w = 206;
  const libelles: Record<string, [string, string]> = {
    unique: ['une solution', 'isostatique'],
    infinite: ['une infinité', 'hyperstatique'],
    aucune: ['aucune solution', 'mécanisme : il bascule'],
  };
  const couleur: Record<string, string> = { unique: VERT, infinite: BLEU, aucune: ROUGE };
  return (
    <Figure alt={`Trois plateaux vus en plan. ${cas.map((c) => `${libelles[c.nature]?.[0] ?? ''} (${libelles[c.nature]?.[1] ?? ''})`).join(' ; ')} : appuis en triangle, appuis alignés avec la charge sur leur ligne, appuis alignés avec la charge hors de leur ligne.`} largeur={620} hauteur={206}>
      {cas.map((c, i) => {
        const ox = 22 + i * w;
        const X = (x: number) => ox + 20 + x * 36;
        const Y = (y: number) => 140 - y * 26;
        const ap = [0, 1, 2].map((j) => [c.A[1]![j]!, c.A[2]![j]!] as const);
        const ch = [c.b[1]! / c.b[0]!, c.b[2]! / c.b[0]!] as const;
        const col = couleur[c.nature] ?? TRAIT;
        return (
          <g key={i}>
            <polygon points={points(ap.map(([x, y]) => [X(x), Y(y)] as const))} fill="var(--color-beton-clair)" stroke={TRAIT} strokeWidth={1.2} />
            {ap.map(([x, y], j) => (
              <circle key={j} cx={X(x)} cy={Y(y)} r={6} fill={TRAIT} />
            ))}
            <circle cx={X(ch[0])} cy={Y(ch[1])} r={6} fill={ROUGE} />
            <Etiquette x={X(ch[0]) + 8} y={Y(ch[1]) - 6} taille={11} gras couleur={ROUGE}>
              charge
            </Etiquette>
            <Etiquette x={ox + 92} y={178} ancre="middle" taille={12} gras couleur={col}>
              {libelles[c.nature]?.[0]}
            </Etiquette>
            <Etiquette x={ox + 92} y={196} ancre="middle" taille={11} couleur={col}>
              {libelles[c.nature]?.[1]}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Le rang se compte après échelonnement : une matrice sans ligne nulle peut n'avoir que deux lignes indépendantes. */
export function EscalierRang({ M, E, rang }: { M: Mat; E: Mat; rang: number }) {
  const c = 34;
  return (
    <Figure alt={`La matrice de départ n'a aucune ligne nulle ; après échelonnement par le pivot de Gauss, une ligne devient nulle : il reste ${rang} lignes non nulles, le rang vaut ${rang}.`} largeur={620} hauteur={186}>
      <GrilleMatrice x={60} y={46} M={M} c={c} />
      <Etiquette x={60 + 1.5 * c} y={30} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        ✗ aucune ligne nulle…
      </Etiquette>
      <Fleche x1={200} y1={96} x2={270} y2={96} couleur={TRAIT} epaisseur={1.8} tete={8} />
      <Etiquette x={235} y={86} ancre="middle" taille={11}>
        échelonner
      </Etiquette>
      <GrilleMatrice x={290} y={46} M={E} c={c} dec={0} />
      {E.map((l, i) => (l.every((v) => Math.abs(v) < 1e-9) ? <rect key={i} x={290} y={46 + i * c} width={3 * c} height={c} fill={ROUGE} fillOpacity={0.12} /> : null))}
      <polyline points={points([[290, 46 + c], [290 + c, 46 + c], [290 + c, 46 + 2 * c], [290 + 3 * c, 46 + 2 * c]])} fill="none" stroke={BLEU} strokeWidth={2.2} />
      <Etiquette x={420} y={80} taille={12.5} gras couleur={VERT}>
        ✓ {rang} lignes non nulles
      </Etiquette>
      <Etiquette x={420} y={102} taille={12.5} gras couleur={VERT}>
        rang = {rang}
      </Etiquette>
      <Etiquette x={420} y={128} taille={11}>
        bleu : l’escalier des pivots
      </Etiquette>
      <Etiquette x={60} y={176} taille={11} classe="etiquette">
        on élimine d’abord, on compte ensuite
      </Etiquette>
    </Figure>
  );
}

/** Un cadre articulé se couche comme un parallélogramme ; une croix de contreventement le rend rigide. */
export function HangarContreventement() {
  const cadre = (x: number, croix: boolean) => (
    <g>
      <line x1={x} y1={180} x2={x} y2={70} stroke={TRAIT} strokeWidth={4} />
      <line x1={x + 160} y1={180} x2={x + 160} y2={70} stroke={TRAIT} strokeWidth={4} />
      <polyline points={points([[x - 10, 70], [x + 80, 30], [x + 170, 70]])} fill="none" stroke={TRAIT} strokeWidth={4} />
      <line x1={x} y1={70} x2={x + 160} y2={70} stroke={TRAIT} strokeWidth={3} />
      {[x, x + 160].map((xx) => (
        <AppuiDouble key={xx} x={xx} y={183} t={9} prefixe="hct" />
      ))}
      {croix ? (
        <>
          <line x1={x} y1={180} x2={x + 160} y2={70} stroke={BLEU} strokeWidth={2.4} />
          <line x1={x} y1={70} x2={x + 160} y2={180} stroke={BLEU} strokeWidth={2.4} />
        </>
      ) : (
        <polygon points={points([[x, 180], [x + 160, 180], [x + 210, 70], [x + 50, 70]])} fill="none" stroke={ROUGE} strokeWidth={2} strokeDasharray="7 4" />
      )}
      {[50, 90, 130].map((y) => (
        <Fleche key={y} x1={x - 50} y1={y + 20} x2={x - 6} y2={y + 20} couleur={BLEU} epaisseur={1.4} tete={7} pointilles />
      ))}
    </g>
  );
  return (
    <Figure alt="À gauche, un portique de hangar aux pieds articulés, sans contreventement : sous les rafales, il se couche en parallélogramme, ses équations d'équilibre n'ont pas de solution. À droite, le même portique avec une croix de contreventement : deux triangles, la structure est stable." largeur={620} hauteur={226}>
      <Hachures prefixe="hct" types={['terre']} />
      {cadre(70, false)}
      <Etiquette x={150} y={218} ancre="middle" taille={12} gras couleur={ROUGE}>
        ✗ sans diagonale : il se couche
      </Etiquette>
      {cadre(390, true)}
      <Etiquette x={470} y={218} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ croix de contreventement
      </Etiquette>
    </Figure>
  );
}

/** Un nœud tenu par deux barres alignées et chargé perpendiculairement (exercice 3) ; la déformée est facultative. */
export function FilTendu({ F, deformee = false }: { F: number; deformee?: boolean }) {
  return (
    <Figure alt={`Un nœud N tenu par deux barres horizontales alignées, ancrées à gauche et à droite, reçoit une charge verticale de ${nombre(F, 0)} kN.${deformee ? ' Le nœud descend jusqu’à ce que les barres s’inclinent : alignées, elles ne peuvent pas porter cette charge.' : ''}`} largeur={620} hauteur={170}>
      <Hachures prefixe="flt" types={['maconnerie']} />
      <rect x={40} y={40} width={30} height={90} fill={hachure('flt', 'maconnerie')} className="t-moyen" />
      <rect x={550} y={40} width={30} height={90} fill={hachure('flt', 'maconnerie')} className="t-moyen" />
      <line x1={70} y1={84} x2={550} y2={84} stroke={TRAIT} strokeWidth={4} />
      <circle cx={310} cy={84} r={7} fill="var(--color-papier)" className="t-fort" />
      <Etiquette x={318} y={74} taille={12.5} gras>
        N
      </Etiquette>
      <Fleche x1={310} y1={92} x2={310} y2={146} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={318} y={140} taille={12.5} gras couleur={ROUGE}>
        {nombre(F, 0)} kN
      </Etiquette>
      {deformee ? <polyline points={points([[70, 84], [310, 122], [550, 84]])} fill="none" stroke={ROUGE} strokeWidth={1.8} strokeDasharray="7 4" /> : null}
    </Figure>
  );
}

/** Trois vecteurs du plan : u et v sont liés (v = 2 u), u et w forment une base (exercice 1). */
export function TroisVecteurs({ u, v, w }: { u: readonly [number, number]; v: readonly [number, number]; w: readonly [number, number] }) {
  const k = 34;
  const O = [80, 180] as const;
  const P = (x: number, y: number) => [O[0] + x * k, O[1] - y * k] as const;
  return (
    <Figure alt={`Les vecteurs u (${nombre(u[0], 0)} ; ${nombre(u[1], 0)}) et v (${nombre(v[0], 0)} ; ${nombre(v[1], 0)}) sont sur la même droite : ils sont liés, pas de base. Les vecteurs u et w (${nombre(w[0], 0)} ; ${nombre(w[1], 0)}) ne sont pas parallèles : ils forment une base du plan.`} largeur={620} hauteur={200}>
      <line x1={O[0]} y1={O[1]} x2={P(5, 0)[0]} y2={O[1]} className="t-fin" />
      <line x1={O[0]} y1={O[1]} x2={O[0]} y2={P(0, 5)[1]} className="t-fin" />
      <line x1={O[0]} y1={O[1]} x2={P(2.4, 4.8)[0]} y2={P(2.4, 4.8)[1]} stroke={GRIS} strokeDasharray="4 4" />
      <Fleche x1={O[0]} y1={O[1]} x2={P(...v)[0]} y2={P(...v)[1]} couleur={BRIQUE} epaisseur={2.4} tete={9} />
      <Fleche x1={O[0]} y1={O[1]} x2={P(...u)[0]} y2={P(...u)[1]} couleur={BLEU} epaisseur={3} tete={10} />
      <Fleche x1={O[0]} y1={O[1]} x2={P(...w)[0]} y2={P(...w)[1]} couleur={VERT} epaisseur={2.4} tete={9} />
      <Etiquette x={P(...u)[0] - 10} y={P(...u)[1] + 4} ancre="end" taille={12.5} gras couleur={BLEU}>
        u
      </Etiquette>
      <Etiquette x={P(...v)[0] + 8} y={P(...v)[1]} taille={12.5} gras couleur={BRIQUE}>
        v = 2 u
      </Etiquette>
      <Etiquette x={P(...w)[0] + 8} y={P(...w)[1] + 4} taille={12.5} gras couleur={VERT}>
        w
      </Etiquette>
      <Etiquette x={340} y={80} taille={12} gras couleur={ROUGE}>
        u, v : même droite, liés
      </Etiquette>
      <Etiquette x={340} y={104} taille={12} gras couleur={VERT}>
        u, w : base du plan
      </Etiquette>
    </Figure>
  );
}

/** Plateau à appuis alignés, vu en plan (énoncé d'examen, sans résultat). */
export function AppuisAlignesPlan() {
  return (
    <Figure alt="Plateau vu en plan, porté par trois appuis A, C et B alignés sur une même droite." largeur={620} hauteur={130}>
      <rect x={160} y={30} width={300} height={70} fill="var(--color-beton-clair)" className="t-moyen" />
      <line x1={190} y1={86} x2={430} y2={86} stroke={GRIS} strokeDasharray="6 4" />
      {[
        [190, 'A'],
        [310, 'C'],
        [430, 'B'],
      ].map(([x, n]) => (
        <g key={n as string}>
          <circle cx={x as number} cy={86} r={7} fill={TRAIT} />
          <Etiquette x={x as number} y={118} ancre="middle" taille={12.5} gras>
            {n as string}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Une même matrice pour plusieurs cas de charge : A⁻¹ (ou sa factorisation) se calcule une fois et sert à chaque second membre. */
export function UnInverseCasMultiples() {
  return (
    <Figure alt="Trois cas de charge b1, b2, b3 sur la même structure : la matrice A ne change pas. On calcule A⁻¹, ou sa factorisation, une seule fois, puis chaque solution x = A⁻¹ b s'obtient très vite." largeur={620} hauteur={196}>
      <rect x={250} y={56} width={120} height={70} rx={10} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.6} />
      <Etiquette x={310} y={86} ancre="middle" taille={15} gras couleur={BLEU}>
        A⁻¹
      </Etiquette>
      <Etiquette x={310} y={108} ancre="middle" taille={11}>
        calculée une fois
      </Etiquette>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={40} y={40 + i * 44} width={120} height={30} rx={6} fill="var(--color-correction-clair)" stroke={ROUGE} strokeWidth={1.2} />
          <Etiquette x={100} y={60 + i * 44} ancre="middle" taille={12} gras couleur={ROUGE}>
            b{['₁', '₂', '₃'][i]} : cas {i + 1}
          </Etiquette>
          <Fleche x1={162} y1={55 + i * 44} x2={246} y2={91} couleur={TRAIT} epaisseur={1.4} tete={7} />
          <Fleche x1={374} y1={91} x2={458} y2={55 + i * 44} couleur={TRAIT} epaisseur={1.4} tete={7} />
          <rect x={462} y={40 + i * 44} width={120} height={30} rx={6} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1.2} />
          <Etiquette x={522} y={60 + i * 44} ancre="middle" taille={12} gras couleur={VERT}>
            x{['₁', '₂', '₃'][i]} = A⁻¹ b{['₁', '₂', '₃'][i]}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={40} y={186} taille={11} classe="etiquette">
        un seul système : le pivot de Gauss suffit · beaucoup de cas : l’inverse (ou la factorisation) devient rentable
      </Etiquette>
    </Figure>
  );
}
