// Schémas de compréhension du module L1.7 (informatique de l'ingénieur), chapitre Python (L1.7.4 à L1.7.8) et mini-projet.
// Toutes les sorties affichées sont calculées par lib/calc/programmation.ts, comme Python les imprimerait.
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Axes, repere2D } from '@/components/drawing/Graphe';
import { formatF, reprFlottant, sacsCiment, type Eprouvette } from '@/lib/calc/programmation';
import { points } from '@/lib/drawing/repere';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** Fenêtre de console : les lignes imprimées par le programme. */
export function Console({ lignes, alt, titre = 'sortie du programme' }: { lignes: readonly string[]; alt: string; titre?: string }) {
  const h = 18;
  return (
    <Figure alt={alt} largeur={620} hauteur={40 + lignes.length * h + 12}>
      <rect x={10} y={8} width={600} height={30 + lignes.length * h + 12} rx={6} fill="var(--color-papier)" stroke="var(--trait)" strokeWidth={1.2} />
      <rect x={10} y={8} width={600} height={24} rx={6} fill="var(--color-beton-clair)" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={26 + i * 14} cy={20} r={4.5} fill={[ROUGE, 'var(--color-terre)', VERT][i]} />
      ))}
      <Etiquette x={74} y={24} taille={11} classe="etiquette">
        {titre}
      </Etiquette>
      {lignes.map((l, i) => (
        <text key={i} x={22} y={50 + i * h} fontSize={12.5} fontFamily={MONO} xmlSpace="preserve">
          {l}
        </text>
      ))}
    </Figure>
  );
}

/** Une variable est une étiquette posée sur une valeur ; chaque valeur a un type. */
export function VariablesBoites() {
  const v: [string, string, string, string][] = [
    ['b', '0.2', 'float', BLEU],
    ['n', '6', 'int', VERT],
    ['nom', "'poutre P1'", 'str', TERRE],
    ['ok', 'True', 'bool', ROUGE],
  ];
  return (
    <Figure alt="Quatre variables : b désigne le nombre décimal 0.2, de type float ; n désigne l'entier 6, de type int ; nom désigne le texte 'poutre P1', de type str ; ok désigne la valeur logique True, de type bool. Le nom est une étiquette, la valeur est rangée dans une boîte." largeur={620} hauteur={170}>
      {v.map(([nom, val, type, c], i) => (
        <g key={nom}>
          <rect x={30 + i * 148} y={24} width={60} height={26} rx={13} fill="var(--color-papier)" stroke={c} strokeWidth={1.4} />
          <text x={60 + i * 148} y={42} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700} fill={c}>
            {nom}
          </text>
          <Fleche x1={60 + i * 148} y1={52} x2={60 + i * 148} y2={84} couleur={c} epaisseur={1.4} tete={7} />
          <rect x={20 + i * 148} y={86} width={120} height={36} rx={4} fill="var(--color-beton-clair)" className="t-moyen" />
          <text x={80 + i * 148} y={109} textAnchor="middle" fontSize={13} fontFamily={MONO}>
            {val}
          </text>
          <Etiquette x={80 + i * 148} y={144} ancre="middle" taille={11.5} gras couleur={c}>
            {type}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Les quatre types de base et leurs opérations. */
export function TypesPython() {
  const t: [string, string, string][] = [
    ['int', '6, -3, 2026', '+  -  *  //  %  **'],
    ['float', '0.2, 3.5e-3', '+  -  *  /  **'],
    ['str', "'HA 12', \"P1\"", '+ (coller)  * (répéter)'],
    ['bool', 'True, False', 'and  or  not'],
  ];
  return (
    <Figure alt={`Les quatre types de base de Python : ${t.map(([a, b, c]) => `${a} (exemples ${b} ; opérations ${c})`).join(' ; ')}.`} largeur={620} hauteur={180}>
      {['type', 'exemples', 'opérations courantes'].map((h, i) => (
        <Etiquette key={h} x={[30, 140, 340][i]!} y={24} taille={11.5} gras>
          {h}
        </Etiquette>
      ))}
      {t.map(([a, b, c], i) => (
        <g key={a}>
          <line x1={20} y1={34 + i * 34} x2={600} y2={34 + i * 34} className="t-fin" />
          <text x={30} y={56 + i * 34} fontSize={13} fontFamily={MONO} fontWeight={700} fill={BLEU}>
            {a}
          </text>
          <text x={140} y={56 + i * 34} fontSize={12} fontFamily={MONO}>
            {b}
          </text>
          <text x={340} y={56 + i * 34} fontSize={12} fontFamily={MONO}>
            {c}
          </text>
        </g>
      ))}
    </Figure>
  );
}

/** Division, division entière, reste, arrondi vers le haut : les sacs de ciment d'une gâchée. */
export function SacsCiment({ dosage, volume, sac }: { dosage: number; volume: number; sac: number }) {
  const s = sacsCiment(dosage, volume, sac);
  const plein = s.entiers;
  return (
    <Figure alt={`Ciment nécessaire : ${dosage} × ${reprFlottant(volume)} = ${reprFlottant(s.masse)} kg. Divisé par ${sac} kg : ${reprFlottant(s.quotient)} sacs. La division entière donne ${reprFlottant(s.entiers)} sacs pleins, le reste ${reprFlottant(s.reste)} kg ; on commande donc ${s.sacs} sacs, arrondi vers le haut.`} largeur={620} hauteur={190}>
      {Array.from({ length: s.sacs }, (_, i) => {
        const x = 24 + i * 34;
        const part = i < plein ? 1 : s.reste / sac;
        return (
          <g key={i}>
            <rect x={x} y={30} width={28} height={40} rx={5} fill="var(--color-papier)" className="t-moyen" />
            <rect x={x} y={30 + 40 * (1 - part)} width={28} height={40 * part} rx={5} fill="var(--color-beton)" opacity={0.75} />
          </g>
        );
      })}
      {[
        [`${reprFlottant(s.masse)} / ${sac}`, reprFlottant(s.quotient), 'division'],
        [`${reprFlottant(s.masse)} // ${sac}`, reprFlottant(s.entiers), 'sacs pleins'],
        [`${reprFlottant(s.masse)} % ${sac}`, reprFlottant(s.reste), 'reste (kg)'],
        [`math.ceil(${reprFlottant(s.masse)} / ${sac})`, String(s.sacs), 'sacs à commander'],
      ].map(([e, r, t], i) => (
        <g key={e}>
          <text x={24} y={100 + i * 22} fontSize={12} fontFamily={MONO}>
            {`${e}  →  ${r}`}
          </text>
          <Etiquette x={360} y={100 + i * 22} taille={11.5} couleur={i === 3 ? VERT : undefined} gras={i === 3}>
            {t}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Les flottants sont des approximations binaires : 0.1 + 0.2 ne vaut pas exactement 0.3. */
export function FlottantBinaire() {
  return (
    <Figure alt={`Un nombre comme 0,1 ne s'écrit pas exactement en binaire : l'ordinateur en garde une approximation. Les petites erreurs s'ajoutent : 0.1 + 0.2 donne ${reprFlottant(0.1 + 0.2)}, et 0.1 + 0.2 == 0.3 vaut False. On compare donc deux flottants avec une tolérance.`} largeur={620} hauteur={150}>
      <text x={30} y={34} fontSize={13} fontFamily={MONO}>
        0.1 en binaire : 0.000110011001100110011…
      </text>
      <text x={30} y={66} fontSize={13} fontFamily={MONO}>
        {`0.1 + 0.2  →  ${reprFlottant(0.1 + 0.2)}`}
      </text>
      <text x={30} y={98} fontSize={13} fontFamily={MONO} fill={ROUGE}>
        0.1 + 0.2 == 0.3  →  False
      </text>
      <text x={30} y={130} fontSize={13} fontFamily={MONO} fill={VERT}>
        math.isclose(0.1 + 0.2, 0.3)  →  True
      </text>
    </Figure>
  );
}

/** Une condition : if / else. */
export function IfOrganigramme({ taux, verdict }: { taux: number; verdict: string }) {
  return (
    <Figure alt={`Le programme calcule le taux de travail, ${formatF(taux, 2)}. Si taux <= 1, il exécute le bloc indenté sous if et imprime OK ; sinon, le bloc sous else, et imprime NON. Ici : ${verdict}.`} largeur={620} hauteur={200}>
      <rect x={230} y={10} width={160} height={30} rx={5} fill="var(--color-papier)" className="t-moyen" />
      <text x={310} y={30} textAnchor="middle" fontSize={12} fontFamily={MONO}>
        taux = M_Ed / M_Rd
      </text>
      <Fleche x1={310} y1={40} x2={310} y2={62} couleur="var(--trait)" epaisseur={1.4} tete={7} />
      <polygon points={points([[310, 62], [400, 100], [310, 138], [220, 100]])} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.4} />
      <text x={310} y={105} textAnchor="middle" fontSize={12.5} fontFamily={MONO}>
        taux &lt;= 1 ?
      </text>
      <Fleche x1={400} y1={100} x2={480} y2={100} couleur={VERT} epaisseur={1.6} tete={8} />
      <Etiquette x={440} y={92} ancre="middle" taille={11} gras couleur={VERT}>
        oui
      </Etiquette>
      <rect x={480} y={84} width={120} height={32} rx={5} fill="var(--color-validation-clair)" stroke={VERT} />
      <text x={540} y={105} textAnchor="middle" fontSize={12} fontFamily={MONO}>
        print("OK")
      </text>
      <Fleche x1={220} y1={100} x2={140} y2={100} couleur={ROUGE} epaisseur={1.6} tete={8} />
      <Etiquette x={180} y={92} ancre="middle" taille={11} gras couleur={ROUGE}>
        non
      </Etiquette>
      <rect x={20} y={84} width={120} height={32} rx={5} fill="var(--color-correction-clair)" stroke={ROUGE} />
      <text x={80} y={105} textAnchor="middle" fontSize={12} fontFamily={MONO}>
        print("NON")
      </text>
      <Etiquette x={310} y={172} ancre="middle" taille={12} gras>
        {`taux = ${formatF(taux, 2)} → ${verdict}`}
      </Etiquette>
    </Figure>
  );
}

/** Une boucle for : le même bloc répété pour chaque valeur de la liste. */
export function BoucleFor({ positions }: { positions: readonly number[] }) {
  return (
    <Figure alt={`La boucle for prend tour à tour chaque valeur de la liste des positions, ${positions.map((p) => reprFlottant(p)).join(', ')} : pour chacune, elle calcule les réactions et imprime une ligne. Quand la liste est épuisée, le programme continue après la boucle.`} largeur={620} hauteur={220}>
      <rect x={200} y={10} width={220} height={32} rx={5} fill="var(--color-encre-clair)" stroke={BLEU} />
      <text x={310} y={31} textAnchor="middle" fontSize={12} fontFamily={MONO}>
        for a in positions:
      </text>
      <Fleche x1={310} y1={42} x2={310} y2={64} couleur="var(--trait)" epaisseur={1.4} tete={7} />
      <rect x={200} y={64} width={220} height={32} rx={5} fill="var(--color-papier)" className="t-moyen" />
      <text x={310} y={85} textAnchor="middle" fontSize={12} fontFamily={MONO}>
        RA, RB = reactions(L, a, P)
      </text>
      <Fleche x1={310} y1={96} x2={310} y2={118} couleur="var(--trait)" epaisseur={1.4} tete={7} />
      <rect x={200} y={118} width={220} height={32} rx={5} fill="var(--color-papier)" className="t-moyen" />
      <text x={310} y={139} textAnchor="middle" fontSize={12} fontFamily={MONO}>
        print(a, RA, RB)
      </text>
      <path d="M200 134 H160 V26 H198" fill="none" stroke={BLEU} strokeWidth={1.4} />
      <polygon points={points([[198, 26], [190, 22], [190, 30]])} fill={BLEU} />
      <Etiquette x={154} y={84} ancre="end" taille={11} couleur={BLEU}>
        valeur suivante
      </Etiquette>
      <Fleche x1={420} y1={26} x2={480} y2={26} couleur={VERT} epaisseur={1.4} tete={7} />
      <Etiquette x={486} y={30} taille={11} couleur={VERT}>
        liste finie : on sort
      </Etiquette>
      <Etiquette x={310} y={180} ancre="middle" taille={11.5}>
        {`positions = [${positions.map((p) => reprFlottant(p)).join(', ')}]`}
      </Etiquette>
      <Etiquette x={310} y={200} ancre="middle" taille={11} classe="etiquette">
        le bloc indenté est répété une fois par valeur
      </Etiquette>
    </Figure>
  );
}

/** Une fonction est une machine : des paramètres entrent, un résultat sort. */
export function FonctionMachine() {
  return (
    <Figure alt="Une fonction est une petite machine à calculer. Elle reçoit des paramètres, ici L, a et P ; son corps calcule ; return renvoie le résultat, ici le couple RA, RB. On l'écrit une fois, on l'appelle autant de fois qu'il faut." largeur={620} hauteur={170}>
      {['L', 'a', 'P'].map((p, i) => (
        <g key={p}>
          <text x={60} y={46 + i * 34} fontSize={14} fontFamily={MONO} fontWeight={700} fill={BLEU}>
            {p}
          </text>
          <Fleche x1={80} y1={42 + i * 34} x2={190} y2={78} couleur={BLEU} epaisseur={1.4} tete={7} />
        </g>
      ))}
      <rect x={190} y={44} width={240} height={70} rx={8} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.6} />
      <text x={310} y={72} textAnchor="middle" fontSize={12.5} fontFamily={MONO}>
        def reactions(L, a, P):
      </text>
      <text x={310} y={96} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill="var(--trait-doux)">
        … return RA, RB
      </text>
      <Fleche x1={430} y1={79} x2={520} y2={79} couleur={VERT} epaisseur={1.6} tete={8} />
      <text x={530} y={84} fontSize={14} fontFamily={MONO} fontWeight={700} fill={VERT}>
        RA, RB
      </text>
      <Etiquette x={60} y={152} taille={11} classe="etiquette">
        paramètres
      </Etiquette>
      <Etiquette x={530} y={152} taille={11} classe="etiquette">
        valeurs renvoyées
      </Etiquette>
    </Figure>
  );
}

/** Une liste : des valeurs rangées, repérées par leur indice, de 0 à n − 1 ou depuis la fin, de −1 à −n. */
export function ListeIndices({ valeurs }: { valeurs: readonly number[] }) {
  const n = valeurs.length;
  const w = Math.min(64, 560 / n);
  return (
    <Figure alt={`La liste fc contient ${n} valeurs. fc[0] vaut ${reprFlottant(valeurs[0]!)}, la première ; fc[-1] vaut ${reprFlottant(valeurs[n - 1]!)}, la dernière ; len(fc) vaut ${n}. Les indices commencent à 0.`} largeur={620} hauteur={130}>
      {valeurs.map((v, i) => (
        <g key={i}>
          <rect x={30 + i * w} y={46} width={w} height={32} fill={i === 0 || i === n - 1 ? 'var(--color-encre-clair)' : 'var(--color-papier)'} className="t-moyen" />
          <text x={30 + i * w + w / 2} y={67} textAnchor="middle" fontSize={11.5} fontFamily={MONO}>
            {reprFlottant(v)}
          </text>
          <Etiquette x={30 + i * w + w / 2} y={98} ancre="middle" taille={11} couleur={BLEU}>
            {String(i)}
          </Etiquette>
          <Etiquette x={30 + i * w + w / 2} y={36} ancre="middle" taille={10.5} couleur={ROUGE}>
            {String(i - n)}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={30} y={120} taille={11}>
        indices depuis le début (bleu) ; depuis la fin (rouge)
      </Etiquette>
    </Figure>
  );
}

/** Un dictionnaire : des clés, chacune associée à une valeur. */
export function DictionnaireSchema({ moyennes }: { moyennes: Record<string, number> }) {
  const e = Object.entries(moyennes);
  return (
    <Figure alt={`Le dictionnaire moyennes associe à chaque gâchée sa résistance moyenne : ${e.map(([k, v]) => `'${k}' → ${formatF(v, 1)}`).join(' ; ')}. On y accède par la clé : moyennes['G2'].`} largeur={620} hauteur={50 + e.length * 36}>
      {e.map(([k, v], i) => (
        <g key={k}>
          <rect x={150} y={20 + i * 36} width={90} height={28} rx={14} fill="var(--color-papier)" stroke={BLEU} />
          <text x={195} y={39 + i * 36} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={BLEU}>
            {`'${k}'`}
          </text>
          <Fleche x1={242} y1={34 + i * 36} x2={320} y2={34 + i * 36} couleur="var(--trait)" epaisseur={1.4} tete={7} />
          <rect x={322} y={20 + i * 36} width={110} height={28} rx={4} fill="var(--color-beton-clair)" className="t-moyen" />
          <text x={377} y={39 + i * 36} textAnchor="middle" fontSize={13} fontFamily={MONO}>
            {formatF(v, 1)}
          </text>
        </g>
      ))}
      <Etiquette x={60} y={40} taille={11.5} gras>
        clés
      </Etiquette>
      <Etiquette x={450} y={40} taille={11.5} gras>
        valeurs (MPa)
      </Etiquette>
    </Figure>
  );
}

/** D'une ligne du fichier CSV à des valeurs utilisables. */
export function CsvVersValeurs({ ligne, e }: { ligne: string; e: Eprouvette }) {
  const morceaux = ligne.split(';');
  return (
    <Figure alt={`Une ligne du fichier, « ${ligne} », est découpée au point-virgule par split : on obtient la liste ${morceaux.map((m) => `'${m}'`).join(', ')}. La résistance est un texte avec une virgule : on la remplace par un point avant float(), qui donne le nombre ${reprFlottant(e.fc)}.`} largeur={620} hauteur={186}>
      <rect x={30} y={20} width={180} height={28} rx={4} fill="var(--color-papier)" className="t-moyen" />
      <text x={40} y={39} fontSize={13} fontFamily={MONO}>
        {ligne}
      </text>
      <Fleche x1={120} y1={50} x2={120} y2={80} couleur={BLEU} epaisseur={1.4} tete={7} />
      <Etiquette x={130} y={70} taille={11} couleur={BLEU}>
        ligne.split(";")
      </Etiquette>
      {morceaux.map((m, i) => (
        <g key={i}>
          <rect x={30 + i * 92} y={82} width={86} height={28} rx={4} fill={i === 2 ? 'var(--color-encre-clair)' : 'var(--color-beton-clair)'} className="t-moyen" />
          <text x={73 + i * 92} y={101} textAnchor="middle" fontSize={12.5} fontFamily={MONO}>
            {`'${m}'`}
          </text>
        </g>
      ))}
      <Fleche x1={257} y1={112} x2={257} y2={144} couleur={VERT} epaisseur={1.4} tete={7} />
      <Etiquette x={268} y={132} taille={11} couleur={VERT}>
        {`float(texte.replace(",", "."))`}
      </Etiquette>
      <rect x={214} y={146} width={86} height={28} rx={4} fill="var(--color-validation-clair)" stroke={VERT} />
      <text x={257} y={165} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700}>
        {reprFlottant(e.fc)}
      </text>
    </Figure>
  );
}

/** NumPy calcule sur tout un tableau d'un coup : la même formule pour chaque élément. */
export function NumpyVectorise({ x, M }: { x: readonly number[]; M: readonly number[] }) {
  const k = Math.min(x.length, 6);
  return (
    <Figure alt={`Avec NumPy, x est un tableau de ${x.length} abscisses ; l'expression q * x * (L - x) / 2 s'applique à chaque élément d'un coup et donne le tableau M : ${x.slice(0, k).map((xi, i) => `${reprFlottant(xi)} → ${reprFlottant(M[i]!)}`).join(' ; ')}…`} largeur={620} hauteur={170}>
      <text x={20} y={46} fontSize={13} fontFamily={MONO} fontWeight={700} fill={BLEU}>
        x
      </text>
      <text x={20} y={136} fontSize={13} fontFamily={MONO} fontWeight={700} fill={VERT}>
        M
      </text>
      {x.slice(0, k).map((xi, i) => (
        <g key={i}>
          <rect x={44 + i * 92} y={26} width={86} height={28} fill="var(--color-encre-clair)" className="t-moyen" />
          <text x={87 + i * 92} y={45} textAnchor="middle" fontSize={12} fontFamily={MONO}>
            {reprFlottant(xi)}
          </text>
          <Fleche x1={87 + i * 92} y1={56} x2={87 + i * 92} y2={112} couleur="var(--trait-doux)" epaisseur={1.2} tete={6} />
          <rect x={44 + i * 92} y={116} width={86} height={28} fill="var(--color-validation-clair)" className="t-moyen" />
          <text x={87 + i * 92} y={135} textAnchor="middle" fontSize={12} fontFamily={MONO}>
            {reprFlottant(M[i]!)}
          </text>
        </g>
      ))}
      <rect x={180} y={72} width={260} height={24} rx={12} fill="var(--color-papier)" stroke={BLEU} />
      <text x={310} y={89} textAnchor="middle" fontSize={12} fontFamily={MONO}>
        M = q * x * (L - x) / 2
      </text>
      <Etiquette x={610} y={164} ancre="end" taille={10.5} classe="etiquette">
        {`… ${x.length} valeurs au total`}
      </Etiquette>
    </Figure>
  );
}

/** La figure que trace Matplotlib : moment et effort tranchant le long de la poutre. */
export function FigureMatplotlib({ x, M, V }: { x: readonly number[]; M: readonly number[]; V: readonly number[] }) {
  const L = x[x.length - 1]!;
  const Mmax = Math.max(...M);
  const Vmax = Math.max(...V.map(Math.abs));
  const R1 = repere2D({ x0: 60, y0: 48, l: 220, h: 140, xmin: 0, xmax: L, ymin: 0, ymax: Mmax * 1.1 });
  const R2 = repere2D({ x0: 370, y0: 48, l: 220, h: 140, xmin: 0, xmax: L, ymin: -Vmax * 1.1, ymax: Vmax * 1.1 });
  const pasM = Mmax > 30 ? 10 : 5;
  const pasV = Vmax > 20 ? 10 : 5;
  return (
    <Figure alt={`Deux graphiques tracés par Matplotlib. À gauche, le moment fléchissant M(x), une parabole nulle aux appuis et maximale au milieu, ${reprFlottant(Mmax)} kN·m. À droite, l'effort tranchant V(x), une droite qui passe de +${reprFlottant(Vmax)} à −${reprFlottant(Vmax)} kN. Chaque graphique a un titre, des axes nommés avec leurs unités et une grille.`} largeur={620} hauteur={244}>
      <Etiquette x={190} y={16} ancre="middle" taille={12} gras>
        Moment fléchissant
      </Etiquette>
      <Axes R={R1} gradX={[0, L / 2, L]} gradY={Array.from({ length: Math.floor((Mmax * 1.1) / pasM) }, (_, i) => (i + 1) * pasM)} titreX="x (m)" titreY="M (kN·m)" decX={1} grille />
      <polyline points={points(x.map((xi, i) => [R1.X(xi), R1.Y(M[i]!)] as const))} fill="none" stroke={BLEU} strokeWidth={2} />
      <Etiquette x={500} y={16} ancre="middle" taille={12} gras>
        Effort tranchant
      </Etiquette>
      <Axes R={R2} gradX={[0, L / 2, L]} gradY={[-pasV * Math.floor(Vmax / pasV), 0, pasV * Math.floor(Vmax / pasV)]} titreX="x (m)" titreY="V (kN)" decX={1} grille />
      <polyline points={points(x.map((xi, i) => [R2.X(xi), R2.Y(V[i]!)] as const))} fill="none" stroke={TERRE} strokeWidth={2} />
    </Figure>
  );
}

/** Le compte rendu d'une série de tests. */
export function ResultatsTests({ resultats, titre }: { resultats: ReadonlyArray<{ nom: string; ok: boolean }>; titre: string }) {
  const n = resultats.filter((r) => r.ok).length;
  return (
    <Figure alt={`${titre} : ${resultats.map((r) => `${r.nom} ${r.ok ? 'réussi' : 'échoué'}`).join(' ; ')}. ${n} sur ${resultats.length} réussis.`} largeur={620} hauteur={60 + resultats.length * 24}>
      <Etiquette x={20} y={22} taille={12} gras>
        {titre}
      </Etiquette>
      {resultats.map((r, i) => (
        <g key={r.nom}>
          <text x={30} y={48 + i * 24} fontSize={12.5} fontFamily={MONO}>
            {r.nom}
          </text>
          <rect x={360} y={34 + i * 24} width={90} height={20} rx={4} fill={r.ok ? 'var(--color-validation-clair)' : 'var(--color-correction-clair)'} stroke={r.ok ? VERT : ROUGE} />
          <text x={405} y={48 + i * 24} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fontWeight={700} fill={r.ok ? VERT : ROUGE}>
            {r.ok ? 'PASSED' : 'FAILED'}
          </text>
        </g>
      ))}
      <Etiquette x={480} y={48} taille={12} gras couleur={n === resultats.length ? VERT : ROUGE}>
        {`${n}/${resultats.length} réussis`}
      </Etiquette>
    </Figure>
  );
}

/** Une tolérance : la valeur calculée doit tomber dans une bande autour de la valeur attendue. */
export function BandeTolerance({ attendu, obtenu, tol, unite }: { attendu: number; obtenu: number; tol: number; unite: string }) {
  const ok = Math.abs(obtenu - attendu) <= tol;
  const X = (v: number) => 310 + ((v - attendu) / (4 * tol)) * 240;
  return (
    <Figure alt={`Valeur attendue ${reprFlottant(attendu)} ${unite}, tolérance ± ${reprFlottant(tol)} : la bande va de ${reprFlottant(attendu - tol)} à ${reprFlottant(attendu + tol)}. La valeur calculée, ${reprFlottant(obtenu)}, ${ok ? 'tombe dans la bande : le test passe' : 'sort de la bande : le test échoue'}.`} largeur={620} hauteur={130}>
      <line x1={60} y1={70} x2={560} y2={70} className="t-moyen" />
      <rect x={X(attendu - tol)} y={56} width={X(attendu + tol) - X(attendu - tol)} height={28} fill="var(--color-validation-clair)" stroke={VERT} />
      <line x1={X(attendu)} y1={50} x2={X(attendu)} y2={90} stroke={VERT} strokeWidth={1.6} />
      <circle cx={X(obtenu)} cy={70} r={6} fill={ok ? VERT : ROUGE} />
      <Etiquette x={X(attendu)} y={44} ancre="middle" taille={11.5} gras couleur={VERT}>
        {`attendu ${reprFlottant(attendu)}`}
      </Etiquette>
      <Etiquette x={X(obtenu)} y={108} ancre="middle" taille={11.5} gras couleur={ok ? VERT : ROUGE}>
        {`calculé ${reprFlottant(obtenu)}`}
      </Etiquette>
    </Figure>
  );
}
