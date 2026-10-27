// Schémas de compréhension du module L1.5 (chimie des matériaux), leçons 1 à 5 : liaisons, réactions, pH, ciment, chaux et plâtre.
// Les valeurs numériques arrivent par les props (lib/calc/chimie.ts) ; les autres figures sont qualitatives.
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';
const TERRE = 'var(--color-terre)';
const TRAIT = 'var(--trait)';
const GRIS = 'var(--color-beton)';

/** Suite pseudo-aléatoire déterministe (même dessin à chaque rendu). */
function alea(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Atome en boule (cercle coloré et symbole). */
function Boule({ x, y, r, t, f }: { x: number; y: number; r: number; t: string; f: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={f} stroke={TRAIT} strokeWidth={1} />
      <text x={x} y={y + r * 0.35} textAnchor="middle" fontSize={Math.max(8, r * 0.95)} fontWeight={700} fill={f === '#2b2b2b' ? '#fff' : 'var(--trait)'}>
        {t}
      </text>
    </g>
  );
}
const COUL = { Ca: '#9fc3e6', C: '#2b2b2b', O: '#e37a6c', H: '#f4f4f4', Fe: '#c98b5a', S: '#e9d36a' } as const;

// ---------- L1.5.1 : atomes, liaisons, structure ----------

/** L'acier plie, le verre casse, l'argile gonfle et se fissure : trois comportements, trois façons de tenir les atomes. */
export function AcierVerreArgile() {
  return (
    <Figure alt="Trois matériaux. Une barre d'acier se plie sans se rompre. Une plaque de verre casse net. Une argile mouillée gonfle, puis se fissure en séchant. La différence vient de la façon dont leurs atomes sont liés." largeur={620} hauteur={200}>
      <Etiquette x={103} y={22} ancre="middle" taille={12.5} gras>
        acier
      </Etiquette>
      <path d="M40 140 Q 103 40 166 140" fill="none" stroke="var(--color-acier)" strokeWidth={9} strokeLinecap="round" />
      <Etiquette x={103} y={180} ancre="middle" taille={11.5} gras couleur={VERT}>
        il plie sans casser
      </Etiquette>
      <Etiquette x={310} y={22} ancre="middle" taille={12.5} gras>
        verre
      </Etiquette>
      <polygon points={points([[250, 60], [370, 60], [370, 150], [250, 150]])} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.4} />
      <polyline points={points([[300, 60], [312, 92], [296, 112], [318, 150]])} fill="none" stroke={TRAIT} strokeWidth={1.6} />
      <polyline points={points([[312, 92], [370, 100]])} fill="none" stroke={TRAIT} strokeWidth={1.4} />
      <Etiquette x={310} y={180} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        il casse net
      </Etiquette>
      <Etiquette x={517} y={22} ancre="middle" taille={12.5} gras>
        argile
      </Etiquette>
      <rect x={440} y={100} width={64} height={46} rx={4} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
      <polyline points={points([[460, 100], [466, 120], [458, 146]])} fill="none" stroke={TERRE} strokeWidth={1.4} />
      <polyline points={points([[486, 100], [480, 124], [490, 146]])} fill="none" stroke={TERRE} strokeWidth={1.4} />
      <rect x={522} y={80} width={82} height={66} rx={14} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={540 + i * 22} cy={112} r={4} fill={BLEU} opacity={0.6} />
      ))}
      <Etiquette x={472} y={166} ancre="middle" taille={10.5}>
        sèche : fissurée
      </Etiquette>
      <Etiquette x={563} y={166} ancre="middle" taille={10.5}>
        mouillée : gonflée
      </Etiquette>
      <Etiquette x={517} y={188} ancre="middle" taille={11.5} gras couleur={BRIQUE}>
        elle gonfle et se fissure
      </Etiquette>
    </Figure>
  );
}

/** Cristal ordonné, solide amorphe, et plans d'atomes qui glissent (ductilité des métaux). */
export function CristalAmorphe() {
  const w = 206;
  return (
    <Figure alt="Trois arrangements d'atomes. Dans un cristal, les atomes sont rangés selon un motif régulier. Dans un solide amorphe, comme le verre, ils sont en désordre. Dans un métal, des plans d'atomes peuvent glisser les uns sur les autres sans se séparer : c'est la ductilité." largeur={620} hauteur={206}>
      <Etiquette x={103} y={22} ancre="middle" taille={12} gras>
        cristal : ordonné
      </Etiquette>
      {Array.from({ length: 5 }, (_, i) => Array.from({ length: 4 }, (_, j) => <circle key={`${i}-${j}`} cx={43 + i * 30} cy={55 + j * 30} r={10} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.2} />))}
      <Etiquette x={103 + w} y={22} ancre="middle" taille={12} gras>
        amorphe : désordonné
      </Etiquette>
      {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={250 + alea(i) * 120} cy={50 + alea(i + 40) * 100} r={10} fill="var(--color-beton-clair)" stroke={GRIS} strokeWidth={1.2} />)}
      <Etiquette x={103 + 2 * w} y={22} ancre="middle" taille={12} gras>
        métal : les plans glissent
      </Etiquette>
      {[0, 1].map((r) =>
        Array.from({ length: 5 }, (_, i) => <circle key={`${r}-${i}`} cx={455 + i * 26 + (r === 0 ? 13 : 0)} cy={80 + r * 26} r={11} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.2} />),
      )}
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={`b${i}`} cx={455 + i * 26} cy={132} r={11} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.2} />
      ))}
      <line x1={440} y1={93} x2={590} y2={93} stroke={ROUGE} strokeDasharray="5 4" />
      <Fleche x1={470} y1={56} x2={530} y2={56} couleur={ROUGE} epaisseur={2.2} tete={8} />
      <Etiquette x={517} y={180} ancre="middle" taille={11}>
        ductile : il s’allonge sans rompre
      </Etiquette>
    </Figure>
  );
}

/** Atome neutre, ion (charge électrique), molécule (atomes liés). */
export function AtomeIonMolecule() {
  const atome = (cx: number, cy: number, n: number, signe: string) => (
    <g>
      <circle cx={cx} cy={cy} r={34} fill="none" stroke={GRIS} strokeDasharray="3 3" />
      <circle cx={cx} cy={cy} r={12} fill={ROUGE} fillOpacity={0.3} stroke={ROUGE} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={ROUGE}>
        {signe}
      </text>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / Math.max(n, 1)) * 2 * Math.PI;
        return <circle key={i} cx={cx + 34 * Math.cos(a)} cy={cy + 34 * Math.sin(a)} r={4} fill={BLEU} />;
      })}
    </g>
  );
  return (
    <Figure alt="Un atome est neutre : autant d'électrons, en bleu, que de charges positives dans le noyau. Un ion a gagné ou perdu des électrons : l'ion calcium Ca²⁺ en a perdu deux. Une molécule est un groupe d'atomes liés, comme l'eau H₂O." largeur={620} hauteur={196}>
      {atome(103, 90, 8, '+')}
      <Etiquette x={103} y={160} ancre="middle" taille={12} gras>
        atome : neutre
      </Etiquette>
      {atome(310, 90, 6, '+')}
      <Etiquette x={350} y={56} taille={14} gras couleur={ROUGE}>
        2+
      </Etiquette>
      <Etiquette x={310} y={160} ancre="middle" taille={12} gras>
        ion : 2 électrons perdus
      </Etiquette>
      <line x1={517} y1={88} x2={487} y2={112} stroke={TRAIT} strokeWidth={4} />
      <line x1={517} y1={88} x2={547} y2={112} stroke={TRAIT} strokeWidth={4} />
      <Boule x={517} y={88} r={20} t="O" f={COUL.O} />
      <Boule x={487} y={114} r={12} t="H" f={COUL.H} />
      <Boule x={547} y={114} r={12} t="H" f={COUL.H} />
      <Etiquette x={517} y={160} ancre="middle" taille={12} gras>
        molécule : H₂O
      </Etiquette>
      <Etiquette x={20} y={188} taille={11} classe="etiquette">
        la chaux vive n’est pas faite de molécules CaO : c’est un empilement d’ions Ca²⁺ et O²⁻
      </Etiquette>
    </Figure>
  );
}

/** Une argile gonflante sous un dallage : elle gonfle à la saison des pluies, se rétracte à la saison sèche. */
export function ArgileGonflante() {
  const panneau = (x0: number, pluie: boolean) => (
    <g>
      <rect x={x0} y={120} width={270} height={70} fill={hachure('agf', 'terre')} stroke="none" />
      {pluie ? (
        <path d={`M${x0 + 20} 116 Q ${x0 + 135} 92 ${x0 + 250} 116`} fill="none" stroke={TRAIT} strokeWidth={8} />
      ) : (
        <path d={`M${x0 + 20} 116 Q ${x0 + 135} 124 ${x0 + 250} 116`} fill="none" stroke={TRAIT} strokeWidth={8} />
      )}
      <rect x={x0 + 10} y={40} width={14} height={78} fill="var(--color-brique-clair)" stroke={BRIQUE} />
      <rect x={x0 + 246} y={40} width={14} height={78} fill="var(--color-brique-clair)" stroke={BRIQUE} />
      {pluie ? (
        <>
          {[60, 110, 160, 210].map((dx) => (
            <Fleche key={dx} x1={x0 + dx} y1={176} x2={x0 + dx} y2={140 - (dx > 80 && dx < 190 ? 10 : 0)} couleur={BLEU} epaisseur={1.8} tete={7} />
          ))}
          {[40, 90, 150, 200].map((dx) => (
            <line key={dx} x1={x0 + dx} y1={20} x2={x0 + dx - 6} y2={34} stroke={BLEU} strokeWidth={1.4} />
          ))}
          <polyline points={points([[x0 + 252, 60], [x0 + 256, 74], [x0 + 250, 88]])} fill="none" stroke={ROUGE} strokeWidth={1.8} />
        </>
      ) : (
        <>
          {[70, 140, 200].map((dx) => (
            <polyline key={dx} points={points([[x0 + dx, 124], [x0 + dx + 4, 144], [x0 + dx - 3, 162], [x0 + dx + 2, 182]])} fill="none" stroke={TERRE} strokeWidth={2} />
          ))}
          <circle cx={x0 + 230} cy={30} r={12} fill="#f5c542" stroke={TERRE} />
        </>
      )}
    </g>
  );
  return (
    <Figure alt="Une maison légère sur un sol argileux gonflant. À la saison des pluies, l'eau entre entre les feuillets de l'argile : le sol gonfle et soulève le dallage au milieu, un mur se fissure. À la saison sèche, l'argile se rétracte et se fend : le dallage redescend." largeur={620} hauteur={226}>
      <Hachures prefixe="agf" types={['terre']} />
      {panneau(20, true)}
      {panneau(330, false)}
      <Etiquette x={155} y={214} ancre="middle" taille={12} gras couleur={BLEU}>
        saison des pluies : le sol gonfle
      </Etiquette>
      <Etiquette x={465} y={214} ancre="middle" taille={12} gras couleur={TERRE}>
        saison sèche : il se rétracte
      </Etiquette>
    </Figure>
  );
}

/** Feuillets d'argile secs (serrés) puis humides (écartés par l'eau) : le gonflement vient de l'eau entre les feuillets. */
export function FeuilletsEau() {
  const pile = (x: number, ecart: number, eau: boolean) => (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={x} y={40 + i * (12 + ecart)} width={180} height={12} rx={2} fill="var(--color-terre-clair)" stroke={TERRE} />
          {eau && i < 3 ? Array.from({ length: 9 }, (_, k) => <circle key={k} cx={x + 12 + k * 20} cy={40 + i * (12 + ecart) + 12 + ecart / 2} r={4} fill={BLEU} opacity={0.6} />) : null}
        </g>
      ))}
    </g>
  );
  return (
    <Figure alt="À gauche, des feuillets d'argile secs, serrés les uns contre les autres. À droite, les mêmes feuillets mouillés : des molécules d'eau, en bleu, se glissent entre eux et les écartent ; le sol gonfle. Au séchage, l'eau repart et le sol se rétracte." largeur={620} hauteur={190}>
      {pile(40, 2, false)}
      <Etiquette x={130} y={176} ancre="middle" taille={12} gras>
        sec : feuillets serrés
      </Etiquette>
      <Fleche x1={240} y1={90} x2={310} y2={90} couleur={BLEU} epaisseur={2} tete={8} />
      <Fleche x1={310} y1={110} x2={240} y2={110} couleur={TERRE} epaisseur={2} tete={8} />
      <Etiquette x={275} y={80} ancre="middle" taille={11} couleur={BLEU}>
        pluie
      </Etiquette>
      <Etiquette x={275} y={130} ancre="middle" taille={11} couleur={TERRE}>
        séchage
      </Etiquette>
      {pile(340, 14, true)}
      <Etiquette x={430} y={176} ancre="middle" taille={12} gras couleur={BLEU}>
        humide : l’eau écarte les feuillets
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.2 : réactions et stœchiométrie ----------

/** La cuisson du calcaire en pièces : une pièce CaCO₃ donne une pièce CaO et une pièce CO₂ ; en masse, une tonne donne x + y kg. */
export function CalcairePieces({ m }: { m: readonly [number, number, number] }) {
  return (
    <Figure alt={`Une « pièce » de calcaire CaCO₃ donne une pièce de chaux vive CaO et une pièce de dioxyde de carbone CO₂. En masse, ${nombre(m[0], 0)} kg de calcaire donnent ${nombre(m[1], 0)} kg de chaux vive et ${nombre(m[2], 0)} kg de CO₂, qui part dans l'air.`} largeur={620} hauteur={196}>
      <Boule x={70} y={80} r={20} t="Ca" f={COUL.Ca} />
      <Boule x={104} y={80} r={11} t="C" f={COUL.C} />
      {[[-1, -1], [1, -1], [0, 1]].map(([a, b], i) => (
        <Boule key={i} x={104 + a! * 20 + 14} y={80 + b! * 18} r={10} t="O" f={COUL.O} />
      ))}
      <Etiquette x={95} y={130} ancre="middle" taille={13} gras>
        CaCO₃
      </Etiquette>
      <Fleche x1={170} y1={80} x2={240} y2={80} couleur={ROUGE} epaisseur={2.4} tete={9} />
      <Etiquette x={205} y={70} ancre="middle" taille={11} couleur={ROUGE}>
        cuisson
      </Etiquette>
      <Boule x={290} y={80} r={20} t="Ca" f={COUL.Ca} />
      <Boule x={322} y={80} r={10} t="O" f={COUL.O} />
      <Etiquette x={305} y={130} ancre="middle" taille={13} gras>
        CaO
      </Etiquette>
      <Etiquette x={370} y={86} ancre="middle" taille={16} gras>
        +
      </Etiquette>
      <Boule x={420} y={80} r={10} t="O" f={COUL.O} />
      <Boule x={441} y={80} r={11} t="C" f={COUL.C} />
      <Boule x={462} y={80} r={10} t="O" f={COUL.O} />
      <Etiquette x={441} y={130} ancre="middle" taille={13} gras>
        CO₂
      </Etiquette>
      <Etiquette x={95} y={164} ancre="middle" taille={12.5} gras couleur={BLEU}>
        {nombre(m[0], 0)} kg
      </Etiquette>
      <Etiquette x={305} y={164} ancre="middle" taille={12.5} gras couleur={BLEU}>
        {nombre(m[1], 0)} kg
      </Etiquette>
      <Etiquette x={441} y={164} ancre="middle" taille={12.5} gras couleur={BLEU}>
        {nombre(m[2], 0)} kg (dans l’air)
      </Etiquette>
      <Etiquette x={20} y={188} taille={11} classe="etiquette">
        une pièce pour une pièce, mais pas un kilogramme pour un kilogramme
      </Etiquette>
    </Figure>
  );
}

/** Combustion du propane équilibrée, dessinée en boules : chaque atome se retrouve des deux côtés. */
export function MoleculesPropane({ coef }: { coef: readonly number[] }) {
  const propane = (x: number, y: number) => (
    <g>
      {[0, 1, 2].map((i) => (
        <Boule key={i} x={x + i * 20} y={y} r={9} t="C" f={COUL.C} />
      ))}
      {[[-10, -14], [10, -16], [30, -16], [50, -14], [-10, 14], [10, 16], [30, 16], [50, 14]].map(([dx, dy], i) => (
        <Boule key={`h${i}`} x={x + dx!} y={y + dy!} r={5} t="" f={COUL.H} />
      ))}
    </g>
  );
  const o2 = (x: number, y: number) => (
    <g>
      <Boule x={x} y={y} r={8} t="O" f={COUL.O} />
      <Boule x={x + 15} y={y} r={8} t="O" f={COUL.O} />
    </g>
  );
  const co2 = (x: number, y: number) => (
    <g>
      <Boule x={x} y={y} r={7} t="" f={COUL.O} />
      <Boule x={x + 13} y={y} r={8} t="C" f={COUL.C} />
      <Boule x={x + 26} y={y} r={7} t="" f={COUL.O} />
    </g>
  );
  const h2o = (x: number, y: number) => (
    <g>
      <Boule x={x} y={y} r={8} t="O" f={COUL.O} />
      <Boule x={x - 10} y={y + 9} r={5} t="" f={COUL.H} />
      <Boule x={x + 10} y={y + 9} r={5} t="" f={COUL.H} />
    </g>
  );
  return (
    <Figure alt={`Combustion du propane équilibrée : ${coef[0]} C₃H₈ + ${coef[1]} O₂ → ${coef[2]} CO₂ + ${coef[3]} H₂O, dessinée en boules : noires pour le carbone, blanches pour l'hydrogène, rouges pour l'oxygène. On compte autant de boules de chaque couleur à gauche et à droite.`} largeur={620} hauteur={196}>
      {propane(40, 90)}
      <Etiquette x={60} y={140} ancre="middle" taille={12} gras>
        {nombre(coef[0] ?? 1, 0)} C₃H₈
      </Etiquette>
      <Etiquette x={124} y={96} ancre="middle" taille={16} gras>
        +
      </Etiquette>
      {Array.from({ length: coef[1] ?? 0 }, (_, i) => o2(146 + (i % 3) * 34, 72 + Math.floor(i / 3) * 34))}
      <Etiquette x={180} y={140} ancre="middle" taille={12} gras>
        {nombre(coef[1] ?? 0, 0)} O₂
      </Etiquette>
      <Fleche x1={256} y1={90} x2={306} y2={90} couleur={TRAIT} epaisseur={2} tete={9} />
      {Array.from({ length: coef[2] ?? 0 }, (_, i) => co2(320, 60 + i * 30))}
      <Etiquette x={333} y={150} ancre="middle" taille={12} gras>
        {nombre(coef[2] ?? 0, 0)} CO₂
      </Etiquette>
      <Etiquette x={378} y={96} ancre="middle" taille={16} gras>
        +
      </Etiquette>
      {Array.from({ length: coef[3] ?? 0 }, (_, i) => h2o(410 + (i % 2) * 34, 66 + Math.floor(i / 2) * 36))}
      <Etiquette x={427} y={150} ancre="middle" taille={12} gras>
        {nombre(coef[3] ?? 0, 0)} H₂O
      </Etiquette>
      <rect x={480} y={50} width={128} height={80} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={490} y={74} taille={11.5} gras>
        compte les boules
      </Etiquette>
      <Etiquette x={490} y={94} taille={11}>
        de chaque couleur :
      </Etiquette>
      <Etiquette x={490} y={114} taille={11}>
        autant des deux côtés
      </Etiquette>
      <Etiquette x={20} y={186} taille={11} classe="etiquette">
        noir : carbone · blanc : hydrogène · rouge : oxygène · on change les coefficients, jamais les formules
      </Etiquette>
    </Figure>
  );
}

/** Un four à chaux : le calcaire entre en haut, la chaux vive sort en bas, le CO₂ part par la cheminée. */
export function FourAChaux({ calcaire, chaux, co2 }: { calcaire: number; chaux: number; co2: number }) {
  return (
    <Figure alt={`Four à chaux : on enfourne ${nombre(calcaire, 0)} kg de calcaire en haut ; on retire ${nombre(chaux, 0)} kg de chaux vive en bas ; ${nombre(co2, 0)} kg de CO₂ partent par la cheminée. La masse qui « disparaît » est ce gaz.`} largeur={620} hauteur={236}>
      <polygon points={points([[240, 60], [340, 60], [370, 200], [210, 200]])} fill="var(--color-brique-clair)" stroke={BRIQUE} strokeWidth={2} />
      <rect x={272} y={30} width={36} height={30} fill="var(--color-brique-clair)" stroke={BRIQUE} strokeWidth={2} />
      {[230, 260, 290, 320, 350].map((x, i) => (
        <path key={x} d={`M${x} 196 q 6 -${14 + (i % 2) * 8} 12 0`} fill="#f59a3a" stroke={ROUGE} strokeWidth={1} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={258 + (i % 5) * 16} cy={96 + Math.floor(i / 5) * 30} r={7} fill="var(--color-beton-clair)" stroke={GRIS} />
      ))}
      <Fleche x1={150} y1={70} x2={234} y2={84} couleur={TRAIT} epaisseur={2.2} tete={9} />
      <Etiquette x={40} y={66} taille={12} gras>
        calcaire : {nombre(calcaire, 0)} kg
      </Etiquette>
      <Fleche x1={290} y1={26} x2={290} y2={2} couleur={GRIS} epaisseur={2.4} tete={8} pointilles />
      <Etiquette x={320} y={20} taille={12} gras couleur={GRIS}>
        CO₂ : {nombre(co2, 0)} kg, par la cheminée
      </Etiquette>
      <Fleche x1={370} y1={186} x2={450} y2={186} couleur={TRAIT} epaisseur={2.2} tete={9} />
      <Etiquette x={456} y={190} taille={12} gras>
        chaux vive : {nombre(chaux, 0)} kg
      </Etiquette>
      <Etiquette x={290} y={226} ancre="middle" taille={11} classe="etiquette">
        près de la moitié de la masse enfournée part en gaz : ce n’est pas une perte de pesée
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.3 : acides, bases, pH ----------

/** Trois béchers : acide (beaucoup d'ions H₃O⁺), neutre, basique (beaucoup d'ions OH⁻). */
export function TroisBechers() {
  const becher = (x: number, nH: number, nOH: number, titre: string, c: string) => (
    <g>
      <path d={`M${x} 40 v110 q 0 12 12 12 h96 q 12 0 12 -12 v-110`} fill="var(--color-encre-clair)" fillOpacity={0.4} stroke={TRAIT} strokeWidth={1.6} />
      {Array.from({ length: 12 }, (_, k) => k)
        .sort((a, b) => alea(a + x) - alea(b + x))
        .slice(0, nH + nOH)
        .map((k, i) => (
          <text key={k} x={x + 12 + (k % 3) * 34 + (alea(k + 7) - 0.5) * 6} y={64 + Math.floor(k / 3) * 24 + (alea(k + 11) - 0.5) * 6} fontSize={10} fontWeight={700} fill={i < nH ? ROUGE : BLEU}>
            {i < nH ? 'H₃O⁺' : 'OH⁻'}
          </text>
        ))}
      <Etiquette x={x + 60} y={186} ancre="middle" taille={12} gras couleur={c}>
        {titre}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="Trois béchers. Acide : beaucoup d'ions H₃O⁺, peu d'ions OH⁻, comme le jus de citron. Neutre : autant des deux, comme l'eau pure. Basique : beaucoup d'ions OH⁻, comme le savon ou l'eau des pores du béton." largeur={620} hauteur={200}>
      {becher(40, 9, 1, 'acide : citron', ROUGE)}
      {becher(250, 2, 2, 'neutre : eau pure', TRAIT)}
      {becher(460, 1, 9, 'basique : savon, béton', BLEU)}
    </Figure>
  );
}

/** Une unité de pH = un facteur 10 : à pH 6, dix fois plus d'ions H₃O⁺ qu'à pH 7 ; à pH 5, cent fois plus. */
export function FacteurDix({ cas }: { cas: ReadonlyArray<{ pH: number; facteur: number }> }) {
  return (
    <Figure alt={`Échelle logarithmique du pH : ${cas.map((c) => `à pH ${nombre(c.pH, 0)}, ${nombre(c.facteur, 0)} fois les ions H₃O⁺ du pH 7`).join(' ; ')}. Chaque unité en moins multiplie l'acidité par dix.`} largeur={620} hauteur={210}>
      {cas.map((c, k) => {
        const x0 = 40 + k * 200;
        const n = Math.round(c.facteur);
        const cote = Math.ceil(Math.sqrt(n));
        const pas = Math.min(14, 130 / Math.max(cote, 1));
        return (
          <g key={c.pH}>
            <rect x={x0} y={30} width={150} height={140} rx={6} fill="var(--color-papier)" stroke={GRIS} />
            {Array.from({ length: n }, (_, i) => (
              <circle key={i} cx={x0 + 12 + (i % cote) * pas} cy={42 + Math.floor(i / cote) * pas} r={Math.max(2, pas / 3)} fill={ROUGE} />
            ))}
            <Etiquette x={x0 + 75} y={190} ancre="middle" taille={12.5} gras>
              pH {nombre(c.pH, 0)} : × {nombre(c.facteur, 0)}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Trois façons de mesurer : pH-mètre étalonné, papier indicateur, phénolphtaléine sur une cassure de béton. */
export function TroisMesures() {
  return (
    <Figure alt="Trois mesures. Le pH-mètre : une électrode plongée dans l'eau, étalonnée avant chaque série. Le papier indicateur : une couleur à comparer à une échelle, à une unité près. La phénolphtaléine pulvérisée sur une cassure fraîche de béton : le cœur sain devient rose, la zone carbonatée reste incolore." largeur={620} hauteur={216}>
      <path d="M40 80 v80 q 0 10 10 10 h70 q 10 0 10 -10 v-80" fill="var(--color-encre-clair)" fillOpacity={0.4} stroke={TRAIT} strokeWidth={1.4} />
      <rect x={82} y={30} width={8} height={110} fill={GRIS} />
      <rect x={140} y={40} width={50} height={34} rx={4} fill="var(--color-papier)" stroke={TRAIT} />
      <text x={165} y={62} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--trait)">
        pH
      </text>
      <line x1={90} y1={40} x2={140} y2={50} stroke={TRAIT} />
      <Etiquette x={100} y={196} ancre="middle" taille={12} gras>
        pH-mètre étalonné
      </Etiquette>
      {['#d9534f', '#f0ad4e', '#f7e463', '#9fd36b', '#5bc0a8', '#5b8fd6', '#6c4fb3'].map((c, i) => (
        <rect key={c} x={240 + i * 18} y={90} width={16} height={22} fill={c} />
      ))}
      <rect x={290} y={40} width={16} height={36} fill="#9fd36b" stroke={TRAIT} />
      <Fleche x1={298} y1={78} x2={298} y2={88} couleur={TRAIT} epaisseur={1.2} tete={5} />
      <Etiquette x={300} y={140} ancre="middle" taille={11}>
        acide · · · neutre · · · basique
      </Etiquette>
      <Etiquette x={300} y={196} ancre="middle" taille={12} gras>
        papier indicateur
      </Etiquette>
      <circle cx={510} cy={100} r={60} fill="var(--color-beton-clair)" stroke={GRIS} strokeWidth={1.4} />
      <circle cx={510} cy={100} r={44} fill="#e86fb3" fillOpacity={0.55} />
      <Etiquette x={510} y={104} ancre="middle" taille={11} gras>
        sain : rose
      </Etiquette>
      <Etiquette x={510} y={174} ancre="middle" taille={11}>
        anneau gris : carbonaté
      </Etiquette>
      <Etiquette x={510} y={196} ancre="middle" taille={12} gras>
        phénolphtaléine
      </Etiquette>
    </Figure>
  );
}

/** Une mole de chaux éteinte neutralise deux moles d'ions H⁺. */
export function ChauxDeuxH() {
  return (
    <Figure alt="Ca(OH)₂ + 2 H⁺ → Ca²⁺ + 2 H₂O : une mole de chaux éteinte apporte deux ions OH⁻ et neutralise donc deux moles d'ions H⁺. Oublier ce 2 double la dose de chaux." largeur={620} hauteur={170}>
      <Boule x={70} y={80} r={20} t="Ca" f={COUL.Ca} />
      <g>
        <Boule x={110} y={62} r={9} t="O" f={COUL.O} />
        <Boule x={124} y={52} r={5} t="" f={COUL.H} />
        <Boule x={110} y={100} r={9} t="O" f={COUL.O} />
        <Boule x={124} y={110} r={5} t="" f={COUL.H} />
      </g>
      <Etiquette x={92} y={140} ancre="middle" taille={12.5} gras>
        Ca(OH)₂
      </Etiquette>
      <Etiquette x={160} y={86} ancre="middle" taille={16} gras>
        +
      </Etiquette>
      <Boule x={195} y={66} r={8} t="H" f="var(--color-correction-clair)" />
      <Boule x={195} y={98} r={8} t="H" f="var(--color-correction-clair)" />
      <Etiquette x={195} y={140} ancre="middle" taille={12.5} gras couleur={ROUGE}>
        2 H⁺
      </Etiquette>
      <Fleche x1={230} y1={82} x2={290} y2={82} couleur={TRAIT} epaisseur={2} tete={9} />
      <Boule x={330} y={80} r={20} t="Ca" f={COUL.Ca} />
      <Etiquette x={360} y={66} taille={12} gras>
        2+
      </Etiquette>
      <Etiquette x={385} y={86} ancre="middle" taille={16} gras>
        +
      </Etiquette>
      {[0, 1].map((i) => (
        <g key={i}>
          <Boule x={420 + i * 46} y={80} r={9} t="O" f={COUL.O} />
          <Boule x={410 + i * 46} y={92} r={5} t="" f={COUL.H} />
          <Boule x={430 + i * 46} y={92} r={5} t="" f={COUL.H} />
        </g>
      ))}
      <Etiquette x={443} y={140} ancre="middle" taille={12.5} gras>
        2 H₂O
      </Etiquette>
      <Etiquette x={20} y={162} taille={11.5} gras couleur={BLEU}>
        1 mole de chaux pour 2 moles de H⁺ : oublier ce 2 double la dose
      </Etiquette>
    </Figure>
  );
}

/** Eaux de mine acides : les sulfures des stériles, l'air et la pluie forment de l'acide qui attaque béton et acier. */
export function EauxDeMine() {
  return (
    <Figure alt="Autour d'une mine, la pluie et l'air oxydent les sulfures des stériles : il se forme de l'acide sulfurique. L'eau acide ruisselle vers un dalot en béton armé, qu'elle attaque, avant d'arriver dans un bassin où on la neutralise à la chaux avant rejet." largeur={620} hauteur={236}>
      <Hachures prefixe="edm5" types={['ba']} />
      <polygon points={points([[20, 170], [80, 70], [150, 60], [210, 170]])} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={60 + alea(i) * 120} cy={100 + alea(i + 9) * 60} r={4} fill={COUL.S} stroke={TERRE} strokeWidth={0.6} />
      ))}
      <Etiquette x={115} y={52} ancre="middle" taille={11.5} gras>
        stériles (sulfures)
      </Etiquette>
      {[40, 90, 140, 190].map((x) => (
        <line key={x} x1={x} y1={10} x2={x - 6} y2={26} stroke={BLEU} strokeWidth={1.4} />
      ))}
      <Etiquette x={220} y={22} taille={11} couleur={BLEU}>
        pluie + air
      </Etiquette>
      <path d="M200 170 Q 260 185 320 180" fill="none" stroke="#d98a2b" strokeWidth={6} opacity={0.8} />
      <Etiquette x={250} y={170} ancre="middle" taille={11} gras couleur={ROUGE}>
        eau acide
      </Etiquette>
      <rect x={320} y={150} width={80} height={44} fill={hachure('edm5', 'ba')} className="t-moyen" />
      <rect x={334} y={162} width={52} height={22} fill="#d98a2b" opacity={0.7} />
      <polyline points={points([[324, 150], [330, 158], [326, 166]])} fill="none" stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={360} y={140} ancre="middle" taille={11} gras couleur={ROUGE}>
        béton attaqué
      </Etiquette>
      <Fleche x1={402} y1={174} x2={452} y2={174} couleur="#d98a2b" epaisseur={3} tete={9} />
      <path d="M460 150 v40 h120 v-40" fill="var(--color-encre-clair)" fillOpacity={0.5} stroke={TRAIT} strokeWidth={1.4} />
      <Etiquette x={520} y={208} ancre="middle" taille={11} gras couleur={VERT}>
        bassin : chaux, pH remonté
      </Etiquette>
      <Fleche x1={520} y1={116} x2={520} y2={156} couleur={TRAIT} epaisseur={1.6} tete={7} />
      <Etiquette x={520} y={108} ancre="middle" taille={11}>
        Ca(OH)₂
      </Etiquette>
      <Etiquette x={20} y={230} taille={11} classe="etiquette">
        on mesure le pH et les sulfates avant de couler un ouvrage au contact de ces eaux (L1.5.7)
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.4 : chimie du ciment ----------

/** La pâte de ciment de l'eau au solide : grains dans l'eau, hydrates qui se touchent (prise), pâte durcie avec quelques pores. */
export function HydratationPate() {
  const w = 206;
  const panneau = (k: number, titre: string, legende: string) => {
    const x0 = 22 + k * w;
    return (
      <g key={titre}>
        <rect x={x0} y={30} width={180} height={130} rx={6} fill={k === 2 ? 'var(--color-beton-clair)' : 'var(--color-encre-clair)'} fillOpacity={k === 2 ? 1 : 0.4} stroke={GRIS} />
        {Array.from({ length: 9 }, (_, i) => {
          const cx = x0 + 30 + (i % 3) * 60;
          const cy = 58 + Math.floor(i / 3) * 40;
          const r = k === 0 ? 14 : k === 1 ? 11 : 8;
          return (
            <g key={i}>
              {k > 0
                ? Array.from({ length: 8 }, (_, j) => {
                    const a = (j / 8) * 2 * Math.PI + i;
                    const L = k === 1 ? 16 : 24;
                    return <line key={j} x1={cx + r * Math.cos(a)} y1={cy + r * Math.sin(a)} x2={cx + (r + L) * Math.cos(a)} y2={cy + (r + L) * Math.sin(a)} stroke={TERRE} strokeWidth={1.2} />;
                  })
                : null}
              <circle cx={cx} cy={cy} r={r} fill={GRIS} />
            </g>
          );
        })}
        {k === 2 ? (
          <>
            <polygon points={points([[x0 + 60, 68], [x0 + 72, 62], [x0 + 84, 68], [x0 + 84, 80], [x0 + 72, 86], [x0 + 60, 80]])} fill="#f3f3f3" stroke={TRAIT} />
            <circle cx={x0 + 150} cy={140} r={5} fill="var(--color-papier)" stroke={TRAIT} />
          </>
        ) : null}
        <Etiquette x={x0 + 90} y={20} ancre="middle" taille={12} gras>
          {titre}
        </Etiquette>
        <Etiquette x={x0 + 90} y={180} ancre="middle" taille={11}>
          {legende}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="Trois états de la pâte de ciment. Au gâchage, les grains de ciment, en gris, baignent dans l'eau. À la prise, des hydrates, les C-S-H, poussent autour des grains et se touchent : la pâte se fige. Durcie, la pâte est un enchevêtrement de C-S-H, avec des cristaux de portlandite (hexagone) et quelques pores." largeur={620} hauteur={196}>
      {panneau(0, 'au gâchage', 'des grains dans l’eau')}
      {panneau(1, 'à la prise', 'les hydrates se touchent')}
      {panneau(2, 'durcie', 'C-S-H, portlandite, pores')}
    </Figure>
  );
}

/** L'eau ajoutée à un béton qui raidit ne réagit plus : elle laisse des pores. */
export function EauRajoutee() {
  // Grains et pores sur une grille légèrement décalée : rien ne se chevauche, les grains sont les mêmes des deux côtés.
  const cases = Array.from({ length: 32 }, (_, k) => k).sort((a, b) => alea(a + 5) - alea(b + 5));
  const pate = (x0: number, pores: number) => (
    <g>
      <rect x={x0} y={30} width={240} height={120} rx={6} fill="var(--color-beton-clair)" stroke={GRIS} />
      {cases.slice(0, 12 + pores).map((k, i) => {
        const cx = x0 + 15 + (k % 8) * 30 + (alea(k + 40) - 0.5) * 8;
        const cy = 45 + Math.floor(k / 8) * 30 + (alea(k + 60) - 0.5) * 8;
        return i < 12 ? <circle key={k} cx={cx} cy={cy} r={9} fill={GRIS} opacity={0.7} /> : <circle key={k} cx={cx} cy={cy} r={6} fill="var(--color-papier)" stroke={TRAIT} strokeWidth={0.8} />;
      })}
    </g>
  );
  return (
    <Figure alt="À gauche, une pâte faite avec la juste quantité d'eau : compacte, peu de pores. À droite, la même pâte avec de l'eau rajoutée pendant la prise : l'eau ne réagit plus, elle s'évapore et laisse de nombreux pores ; le béton est moins résistant et moins durable." largeur={620} hauteur={190}>
      {pate(30, 3)}
      <Etiquette x={150} y={176} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ juste l’eau prévue : compacte
      </Etiquette>
      {pate(350, 18)}
      <Etiquette x={470} y={176} ancre="middle" taille={12} gras couleur={ROUGE}>
        ✗ eau rajoutée : pleine de pores
      </Etiquette>
    </Figure>
  );
}

/** Stocker le ciment en climat humide : sur palettes, à l'abri, loin des murs. */
export function StockageSacs() {
  const pile = (x: number, y: number, n: number, grumeaux: boolean) => (
    <g>
      {Array.from({ length: n }, (_, r) =>
        [0, 1, 2].map((c) => (
          <g key={`${r}-${c}`}>
            <rect x={x + c * 42} y={y - (r + 1) * 22} width={40} height={20} rx={7} fill="var(--color-beton-clair)" stroke={GRIS} />
            {grumeaux && r === 0 ? <circle cx={x + c * 42 + 20} cy={y - 12} r={3} fill={TRAIT} /> : null}
          </g>
        )),
      )}
    </g>
  );
  return (
    <Figure alt="À gauche, des sacs de ciment posés sur une palette, sous un abri, loin du mur et du sol humide : ils restent secs. À droite, des sacs posés à même le sol contre un mur humide : l'humidité les fait durcir en grumeaux." largeur={620} hauteur={210}>
      <Hachures prefixe="sts" types={['maconnerie']} />
      <polyline points={points([[20, 60], [160, 30], [300, 60]])} fill="none" stroke={TRAIT} strokeWidth={4} />
      <line x1={40} y1={56} x2={40} y2={170} stroke={TRAIT} strokeWidth={3} />
      <line x1={280} y1={56} x2={280} y2={170} stroke={TRAIT} strokeWidth={3} />
      <rect x={90} y={156} width={130} height={10} fill="var(--color-terre-clair)" stroke={TERRE} />
      {pile(92, 156, 3, false)}
      <line x1={20} y1={170} x2={300} y2={170} className="t-moyen" />
      <Etiquette x={160} y={196} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ palette, abri, loin du mur
      </Etiquette>
      <rect x={560} y={50} width={40} height={120} fill={hachure('sts', 'maconnerie')} className="t-moyen" />
      {[80, 120, 150].map((y) => (
        <path key={y} d={`M556 ${y} q -6 6 0 12`} fill="none" stroke={BLEU} strokeWidth={1.6} />
      ))}
      {pile(430, 170, 2, true)}
      <line x1={340} y1={170} x2={600} y2={170} className="t-moyen" />
      <Etiquette x={470} y={196} ancre="middle" taille={12} gras couleur={ROUGE}>
        ✗ au sol, contre un mur humide
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.5 : chaux et plâtre ----------

/** Chaux aérienne : elle durcit depuis la surface en reprenant le CO₂ de l'air ; chaux hydraulique : elle durcit aussi avec l'eau. */
export function AerienneHydraulique() {
  return (
    <Figure alt="À gauche, un mortier de chaux aérienne : le CO₂ de l'air entre par la surface et le fait durcir couche après couche ; le cœur reste longtemps mou, et sans air il ne durcit pas. À droite, une chaux hydraulique : ses silicates réagissent avec l'eau, elle durcit dans toute sa masse, même enterrée ou sous l'eau." largeur={620} hauteur={210}>
      <rect x={40} y={40} width={220} height={120} fill="var(--color-beton-clair)" stroke={GRIS} />
      <rect x={40} y={40} width={50} height={120} fill={GRIS} opacity={0.5} />
      <line x1={90} y1={40} x2={90} y2={160} stroke={ROUGE} strokeDasharray="5 4" />
      {[60, 100, 140].map((y) => (
        <Fleche key={y} x1={10} y1={y} x2={46} y2={y} couleur={GRIS} epaisseur={1.6} tete={7} pointilles />
      ))}
      <Etiquette x={14} y={32} taille={11} gras couleur={GRIS}>
        CO₂
      </Etiquette>
      <Etiquette x={65} y={176} ancre="middle" taille={11}>
        dur
      </Etiquette>
      <Etiquette x={175} y={104} ancre="middle" taille={11}>
        encore mou
      </Etiquette>
      <Etiquette x={150} y={200} ancre="middle" taille={12} gras>
        chaux aérienne : besoin d’air
      </Etiquette>
      <rect x={350} y={110} width={260} height={60} fill="var(--color-encre-clair)" fillOpacity={0.5} />
      <rect x={380} y={40} width={200} height={120} fill={GRIS} opacity={0.55} stroke={GRIS} />
      <Etiquette x={480} y={100} ancre="middle" taille={11.5} gras>
        dur dans toute la masse
      </Etiquette>
      <Etiquette x={600} y={160} ancre="end" taille={10.5} couleur={BLEU}>
        même sous l’eau
      </Etiquette>
      <Etiquette x={480} y={200} ancre="middle" taille={12} gras>
        chaux hydraulique (NHL)
      </Etiquette>
    </Figure>
  );
}

/** Plâtre et ciment au contact : le sulfate et l'aluminate forment de l'ettringite qui gonfle et fait éclater. */
export function PlatreCiment() {
  return (
    <Figure alt="Un enduit de plâtre posé sur un mortier de ciment : à leur contact, le sulfate du plâtre réagit avec l'aluminate du ciment ; il se forme de l'ettringite, en aiguilles, qui gonfle, fissure l'enduit et le décolle." largeur={620} hauteur={190}>
      <rect x={60} y={100} width={500} height={50} fill="var(--color-beton-clair)" stroke={GRIS} />
      <Etiquette x={74} y={130} taille={12} gras>
        mortier de ciment (aluminates)
      </Etiquette>
      <path d="M60 100 L 560 100 L 560 56 Q 420 36 300 60 Q 180 38 60 56 Z" fill="#f7f1e3" stroke={TERRE} />
      <Etiquette x={74} y={72} taille={12} gras>
        enduit de plâtre (sulfate)
      </Etiquette>
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1={80 + i * 22} y1={100} x2={86 + i * 22} y2={88 - (i % 3) * 3} stroke={ROUGE} strokeWidth={1.6} />
      ))}
      <polyline points={points([[300, 60], [306, 48], [298, 38]])} fill="none" stroke={ROUGE} strokeWidth={2} />
      <polyline points={points([[440, 52], [446, 42], [440, 34]])} fill="none" stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={310} y={22} ancre="middle" taille={12} gras couleur={ROUGE}>
        ettringite expansive au contact : fissures, décollement
      </Etiquette>
      <Etiquette x={310} y={178} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        ✗ plâtre et ciment ne se mélangent pas, ni ne se superposent
      </Etiquette>
    </Figure>
  );
}

/** Mur en terre : un enduit de ciment emprisonne l'humidité et se décolle ; un enduit à la chaux laisse le mur respirer. */
export function EnduitMurTerre() {
  const mur = (x0: number, chaux: boolean) => (
    <g>
      <rect x={x0} y={30} width={120} height={140} fill={hachure('emt', 'terre')} className="t-moyen" />
      <rect x={x0 + 120} y={30} width={12} height={140} fill={chaux ? '#f7f1e3' : 'var(--color-beton-clair)'} stroke={chaux ? TERRE : GRIS} />
      {[60, 100, 140].map((y) =>
        chaux ? (
          <Fleche key={y} x1={x0 + 80} y1={y} x2={x0 + 170} y2={y} couleur={BLEU} epaisseur={1.6} tete={7} pointilles />
        ) : (
          <g key={y}>
            <Fleche x1={x0 + 60} y1={y} x2={x0 + 116} y2={y} couleur={BLEU} epaisseur={1.6} tete={7} pointilles />
            <line x1={x0 + 118} y1={y - 8} x2={x0 + 118} y2={y + 8} stroke={ROUGE} strokeWidth={2} />
          </g>
        ),
      )}
      {!chaux ? <path d={`M${x0 + 132} 120 q 10 10 2 30`} fill="none" stroke={ROUGE} strokeWidth={2} /> : null}
    </g>
  );
  return (
    <Figure alt="Deux murs en briques de terre. À gauche, un enduit de ciment, rigide et peu perméable : l'humidité du mur ne peut pas sortir, elle s'accumule et l'enduit finit par se décoller. À droite, un enduit à la chaux, souple et respirant : la vapeur d'eau traverse, le mur sèche." largeur={620} hauteur={206}>
      <Hachures prefixe="emt" types={['terre']} />
      {mur(40, false)}
      <Etiquette x={110} y={194} ancre="middle" taille={12} gras couleur={ROUGE}>
        ✗ enduit ciment : l’eau reste piégée
      </Etiquette>
      {mur(360, true)}
      <Etiquette x={440} y={194} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ enduit chaux : le mur respire
      </Etiquette>
    </Figure>
  );
}
