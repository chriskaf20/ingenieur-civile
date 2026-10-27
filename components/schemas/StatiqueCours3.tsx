// Schémas de compréhension du module L1.3, leçons 9 à 12, mini-projet et examen : Ritter, murs poids,
// centres de gravité, statique dans l'espace. Code couleur : actions en rouge, réactions en vert, traction en bleu.
import { Cote } from '@/components/drawing/Cote';
import { ArcMoment, Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { AppuiDouble, AppuiSimple } from '@/components/drawing/Mecanique';
import { ritterPratt, troisAppuis, type DonneesPratt, type PointCharge } from '@/lib/calc/statique';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';
const TERRE = 'var(--color-terre)';
const TRAIT = 'var(--trait)';
const GRIS = 'var(--color-beton)';
const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);

type Segment = [number, number, number, number];

/** Barres d'une poutre Pratt de n panneaux (a × h en pixels), origine en bas à gauche (x0, yb). */
function barresPratt(n: number, a: number, h: number, x0: number, yb: number): Array<{ id: string; s: Segment }> {
  const X = (k: number) => x0 + k * a;
  const yh = yb - h;
  const b: Array<{ id: string; s: Segment }> = [];
  for (let k = 1; k <= n; k++) b.push({ id: `inf${k}`, s: [X(k - 1), yb, X(k), yb] });
  for (let k = 2; k <= n - 1; k++) b.push({ id: `sup${k}`, s: [X(k - 1), yh, X(k), yh] });
  for (let k = 1; k <= n - 1; k++) b.push({ id: `mont${k}`, s: [X(k), yb, X(k), yh] });
  for (let k = 1; k <= n; k++) {
    if (k === 1) b.push({ id: 'diag1', s: [X(0), yb, X(1), yh] });
    else if (k === n) b.push({ id: `diag${n}`, s: [X(n), yb, X(n - 1), yh] });
    else if (k <= n / 2) b.push({ id: `diag${k}`, s: [X(k - 1), yh, X(k), yb] });
    else b.push({ id: `diag${k}`, s: [X(k), yh, X(k - 1), yb] });
  }
  return b;
}

// ---------- L1.3.9 : méthode de Ritter ----------

/** Un long pont en treillis coupé d'un trait à travers trois barres : on garde la partie gauche. */
export function CoupeLongPont() {
  const n = 8;
  const a = 64;
  const h = 64;
  const x0 = 50;
  const yb = 130;
  const xc = x0 + 3.5 * a;
  const barres = barresPratt(n, a, h, x0, yb);
  return (
    <Figure alt="Un pont en treillis de huit panneaux, coupé d'un trait vertical à travers trois barres du quatrième panneau : la membrure supérieure, la diagonale et la membrure inférieure. La partie gauche, isolée, est en équilibre sous sa réaction, ses charges et les trois efforts coupés." largeur={620} hauteur={200}>
      <Hachures prefixe="clp9" types={['terre']} />
      {barres.map(({ id, s: [x1, y1, x2, y2] }) => {
        const gauche = Math.max(x1, x2) <= xc + 1;
        const coupe = Math.min(x1, x2) < xc && Math.max(x1, x2) > xc;
        return <line key={id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={coupe ? ROUGE : gauche ? TRAIT : GRIS} strokeWidth={coupe ? 3.4 : gauche ? 2.6 : 1.6} opacity={gauche || coupe ? 1 : 0.55} />;
      })}
      <AppuiDouble x={x0} y={yb + 3} t={9} prefixe="clp9" />
      <AppuiSimple x={x0 + n * a} y={yb + 3} t={9} />
      <line x1={xc} y1={yb - h - 26} x2={xc} y2={yb + 22} stroke={ROUGE} strokeWidth={2} strokeDasharray="9 5" />
      <Etiquette x={xc + 8} y={yb - h - 14} taille={12} gras couleur={ROUGE}>
        la coupe : 3 barres
      </Etiquette>
      <Etiquette x={x0} y={190} taille={11.5}>
        partie gauche isolée : 3 efforts inconnus, 3 équations d’équilibre
      </Etiquette>
      <Etiquette x={x0 + 6 * a} y={yb + 24} ancre="middle" taille={11} classe="etiquette">
        partie droite, ignorée
      </Etiquette>
    </Figure>
  );
}

/** Coupe de Ritter dans le panneau 2 d'une poutre Pratt : les trois efforts coupés et leurs centres de moments. */
export function CentresRitter() {
  const a = 96;
  const h = 96;
  const x0 = 50;
  const yb = 210;
  const yh = yb - h;
  const X = (k: number) => x0 + k * a;
  const xc = X(1.5);
  const barres = barresPratt(4, a, h, x0, yb);
  return (
    <Figure alt="Poutre Pratt coupée dans le panneau 2. Sur la partie gauche isolée agissent la réaction R_A, la charge P et les trois efforts coupés, dessinés en traction. Pour N_sup, moments autour du nœud inférieur droit B2, où se coupent les deux autres barres ; pour N_inf, moments autour du nœud supérieur T1 ; pour la diagonale, les membrures étant parallèles, projection verticale." largeur={620} hauteur={282}>
      <Hachures prefixe="ctr" types={['terre']} />
      {barres.map(({ id, s: [x1, y1, x2, y2] }) => {
        const gauche = Math.max(x1, x2) <= xc + 1;
        const coupe = Math.min(x1, x2) < xc && Math.max(x1, x2) > xc;
        return <line key={id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={gauche || coupe ? TRAIT : GRIS} strokeWidth={gauche || coupe ? 2.8 : 1.4} opacity={gauche || coupe ? 1 : 0.45} strokeDasharray={!gauche && !coupe ? '5 4' : undefined} />;
      })}
      <line x1={xc} y1={yh - 24} x2={xc} y2={yb + 20} stroke={ROUGE} strokeWidth={2} strokeDasharray="9 5" />
      <Fleche x1={xc} y1={yh} x2={xc + 46} y2={yh} couleur={BLEU} epaisseur={3} tete={10} />
      <Etiquette x={xc + 50} y={yh - 8} taille={12.5} gras couleur={BLEU}>
        Nsup
      </Etiquette>
      <Fleche x1={xc} y1={yb} x2={xc + 46} y2={yb} couleur={BLEU} epaisseur={3} tete={10} />
      <Etiquette x={xc + 50} y={yb + 18} taille={12.5} gras couleur={BLEU}>
        Ninf
      </Etiquette>
      <Fleche x1={xc} y1={(yh + yb) / 2} x2={xc + 32} y2={(yh + yb) / 2 + 32} couleur={BLEU} epaisseur={3} tete={10} />
      <Etiquette x={xc + 36} y={(yh + yb) / 2 + 26} taille={12.5} gras couleur={BLEU}>
        Ndiag
      </Etiquette>
      <Fleche x1={X(1)} y1={yb + 4} x2={X(1)} y2={yb + 44} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Etiquette x={X(1) - 8} y={yb + 40} ancre="end" taille={12} gras couleur={ROUGE}>
        P
      </Etiquette>
      <Fleche x1={X(0)} y1={yb + 48} x2={X(0)} y2={yb + 6} couleur={VERT} epaisseur={2.8} tete={9} />
      <Etiquette x={X(0) + 6} y={yb + 46} taille={12} gras couleur={VERT}>
        RA
      </Etiquette>
      <circle cx={X(2)} cy={yb} r={9} fill="none" stroke={VERT} strokeWidth={2.4} />
      <Etiquette x={X(2) + 12} y={yb - 10} taille={11.5} gras couleur={VERT}>
        B2
      </Etiquette>
      <circle cx={X(1)} cy={yh} r={9} fill="none" stroke={BRIQUE} strokeWidth={2.4} />
      <Etiquette x={X(1) - 12} y={yh - 12} ancre="end" taille={11.5} gras couleur={BRIQUE}>
        T1
      </Etiquette>
      <rect x={410} y={26} width={198} height={130} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={420} y={48} taille={11.5} gras couleur={VERT}>
        Nsup : moments autour de B2
      </Etiquette>
      <Etiquette x={420} y={68} taille={11.5} gras couleur={BRIQUE}>
        Ninf : moments autour de T1
      </Etiquette>
      <Etiquette x={420} y={88} taille={11.5} gras couleur={BLEU}>
        Ndiag : projection verticale
      </Etiquette>
      <Etiquette x={420} y={106} taille={11}>
        (membrures parallèles :
      </Etiquette>
      <Etiquette x={420} y={122} taille={11}>
        leur intersection est à l’infini)
      </Etiquette>
      <Etiquette x={420} y={146} taille={11} classe="etiquette">
        inconnues dessinées en traction
      </Etiquette>
    </Figure>
  );
}

/** Le treillis lu comme une poutre : moment fléchissant (membrures) et effort tranchant (diagonales), panneau par panneau. */
export function TreillisPoutreEquivalente({ d }: { d: DonneesPratt }) {
  const n = Math.max(2, 2 * Math.round(d.n / 2));
  const res = Array.from({ length: n / 2 }, (_, i) => ritterPratt(d, i + 1));
  const M = [0, ...res.map((r) => r.Mdroite)];
  const Mtous = [...M, ...M.slice(0, -1).reverse()];
  const V = res.map((r) => r.V);
  const Vtous = [...V, ...V.map((v) => -v).reverse()];
  const x0 = 80;
  const lg = 440;
  const a = lg / n;
  const X = (k: number) => x0 + k * a;
  const Mmax = Math.max(...Mtous, 1e-9);
  const Vmax = Math.max(...Vtous.map(Math.abs), 1e-9);
  const yM = 140;
  const yV = 250;
  const barres = barresPratt(n, a, 40, x0, 70);
  return (
    <Figure alt={`Treillis Pratt de ${n} panneaux sous ${nombre(d.P, 0)} kN par nœud, lu comme une poutre. Moment fléchissant aux nœuds : ${Mtous.map((m) => nombre(m, 0)).join(', ')} kN·m, maximal au milieu : il charge les membrures (N ≈ M / h). Effort tranchant par panneau : ${Vtous.map((v) => nombre(v, 0)).join(', ')} kN, maximal aux appuis : il charge les diagonales.`} largeur={620} hauteur={314}>
      <Hachures prefixe="tpe" types={['terre']} />
      {barres.map(({ id, s: [x1, y1, x2, y2] }) => (
        <line key={id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={TRAIT} strokeWidth={1.8} />
      ))}
      <AppuiDouble x={X(0)} y={73} t={8} prefixe="tpe" />
      <AppuiSimple x={X(n)} y={73} t={8} />
      {Array.from({ length: n - 1 }, (_, i) => (
        <Fleche key={i} x1={X(i + 1)} y1={72} x2={X(i + 1)} y2={96} couleur={ROUGE} epaisseur={1.8} tete={6} />
      ))}
      <Etiquette x={x0 - 10} y={50} ancre="end" taille={11} gras>
        treillis
      </Etiquette>
      <line x1={X(0)} y1={yM} x2={X(n)} y2={yM} className="t-fin" />
      <polygon points={points([[X(0), yM], ...Mtous.map((m, k) => [X(k), yM + (m / Mmax) * 54] as const), [X(n), yM]])} fill={BLEU} fillOpacity={0.15} stroke={BLEU} strokeWidth={2} />
      {Mtous.map((m, k) =>
        k > 0 && k < n ? (
          <Etiquette key={k} x={X(k)} y={yM + (m / Mmax) * 54 + 16} ancre="middle" taille={11} gras couleur={BLEU}>
            {nombre(m, 0)}
          </Etiquette>
        ) : null,
      )}
      <Etiquette x={x0 - 10} y={yM + 4} ancre="end" taille={11} gras couleur={BLEU}>
        M (kN·m)
      </Etiquette>
      <Etiquette x={X(n) + 10} y={yM + 30} taille={11} couleur={BLEU}>
        membrures
      </Etiquette>
      <Etiquette x={X(n) + 10} y={yM + 46} taille={11} couleur={BLEU}>
        max au milieu
      </Etiquette>
      <line x1={X(0)} y1={yV} x2={X(n)} y2={yV} className="t-fin" />
      {Vtous.map((v, k) => (
        <g key={k}>
          <rect x={X(k)} y={v >= 0 ? yV - (v / Vmax) * 36 : yV} width={a} height={(Math.abs(v) / Vmax) * 36} fill={BRIQUE} fillOpacity={0.18} stroke={BRIQUE} strokeWidth={1.4} />
          <Etiquette x={X(k) + a / 2} y={v >= 0 ? yV - (v / Vmax) * 36 - 6 : yV + (Math.abs(v) / Vmax) * 36 + 15} ancre="middle" taille={11} gras couleur={BRIQUE}>
            {nombre(v, 0)}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={x0 - 10} y={yV + 4} ancre="end" taille={11} gras couleur={BRIQUE}>
        V (kN)
      </Etiquette>
      <Etiquette x={X(n) + 10} y={yV - 12} taille={11} couleur={BRIQUE}>
        diagonales
      </Etiquette>
      <Etiquette x={X(n) + 10} y={yV + 4} taille={11} couleur={BRIQUE}>
        max aux appuis
      </Etiquette>
    </Figure>
  );
}

/** Une coupe à travers quatre barres inconnues ne se résout pas ; une coupe à travers trois barres, si. */
export function QuatreBarresCoupees() {
  const a = 56;
  const h = 56;
  const dessin = (x0: number, oblique: boolean) => {
    const yb = 130;
    const barres = barresPratt(4, a, h, x0, yb);
    const [cx1, cy1, cx2, cy2] = oblique ? [x0 + 1.5 * a, yb - h - 14, x0 + 2.5 * a + 14 * (a / h), yb + 14] : [x0 + 1.5 * a, yb - h - 18, x0 + 1.5 * a, yb + 18];
    return (
      <g>
        {barres.map(({ id, s: [x1, y1, x2, y2] }) => (
          <line key={id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={TRAIT} strokeWidth={2.2} />
        ))}
        <line x1={cx1} y1={cy1} x2={cx2} y2={cy2} stroke={oblique ? ROUGE : VERT} strokeWidth={2.4} strokeDasharray="8 4" />
      </g>
    );
  };
  return (
    <Figure alt="À gauche, une coupe oblique qui traverse quatre barres inconnues : quatre inconnues pour trois équations, on ne peut pas conclure. À droite, une coupe verticale dans un panneau qui traverse trois barres : trois inconnues, trois équations." largeur={620} hauteur={190}>
      {dessin(40, true)}
      {dessin(350, false)}
      <Etiquette x={152} y={172} ancre="middle" taille={12} gras couleur={ROUGE}>
        ✗ 4 barres coupées, 3 équations
      </Etiquette>
      <Etiquette x={462} y={172} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ 3 barres coupées
      </Etiquette>
    </Figure>
  );
}

/** Inspection d'un pont en treillis : une barre corrodée, une coupe de Ritter à travers elle donne son effort. */
export function BarreCorrodee() {
  const n = 6;
  const a = 76;
  const h = 70;
  const x0 = 82;
  const yb = 150;
  const barres = barresPratt(n, a, h, x0, yb);
  const cible = 'diag2';
  const xc = x0 + 1.5 * a;
  return (
    <Figure alt="Élévation d'un pont en treillis : une diagonale corrodée est repérée lors de l'inspection. Une coupe de Ritter traversant cette barre et deux autres donne directement son effort, pour juger si la section restante suffit." largeur={620} hauteur={206}>
      <Hachures prefixe="bco" types={['terre']} />
      {barres.map(({ id, s: [x1, y1, x2, y2] }) => (
        <line key={id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={id === cible ? TERRE : TRAIT} strokeWidth={id === cible ? 5 : 2.2} />
      ))}
      <AppuiDouble x={x0} y={yb + 3} t={9} prefixe="bco" />
      <AppuiSimple x={x0 + n * a} y={yb + 3} t={9} />
      <circle cx={x0 + 1.5 * a} cy={yb - h / 2} r={26} fill="none" stroke={TERRE} strokeWidth={2} />
      <line x1={xc} y1={yb - h - 22} x2={xc} y2={yb + 22} stroke={ROUGE} strokeWidth={2} strokeDasharray="9 5" />
      <Etiquette x={x0 + 1.5 * a + 30} y={yb - h - 8} taille={12} gras couleur={TERRE}>
        diagonale corrodée
      </Etiquette>
      <Etiquette x={x0} y={196} taille={11.5}>
        une coupe à travers elle : son effort en quelques lignes, sans tout recalculer
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.10 : glissement et renversement ----------

/** Pousser une caisse basse (elle glisse) ou une armoire haute (elle bascule autour de son arête). */
export function CaisseArmoire() {
  return (
    <Figure alt="À gauche, une caisse basse et lourde poussée à mi-hauteur : le frottement la retient, puis elle glisse. À droite, une armoire haute et étroite poussée en haut : avant de glisser, elle bascule autour de son arête du bas, côté opposé à la poussée." largeur={620} hauteur={226}>
      <Hachures prefixe="caa" types={['terre']} />
      <rect x={20} y={190} width={580} height={12} fill={hachure('caa', 'terre')} stroke="none" />
      <line x1={20} y1={190} x2={600} y2={190} className="t-moyen" />
      <rect x={90} y={130} width={140} height={60} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.6} />
      <Fleche x1={30} y1={160} x2={86} y2={160} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={30} y={150} taille={12} gras couleur={ROUGE}>
        F
      </Etiquette>
      <Fleche x1={200} y1={198} x2={140} y2={198} couleur={VERT} epaisseur={2.6} tete={9} />
      <Etiquette x={206} y={214} taille={11.5} gras couleur={VERT}>
        frottement
      </Etiquette>
      <Fleche x1={160} y1={120} x2={240} y2={120} couleur={BRIQUE} epaisseur={1.8} tete={8} pointilles />
      <Etiquette x={160} y={30} ancre="middle" taille={12.5} gras>
        caisse basse : elle glisse
      </Etiquette>
      <rect x={410} y={50} width={60} height={140} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.6} />
      <rect x={410} y={50} width={60} height={140} fill="none" stroke={BRIQUE} strokeWidth={1.4} strokeDasharray="6 4" transform="rotate(14 470 190)" />
      <Fleche x1={346} y1={60} x2={404} y2={60} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={346} y={50} taille={12} gras couleur={ROUGE}>
        F
      </Etiquette>
      <circle cx={470} cy={190} r={5} fill={ROUGE} />
      <Etiquette x={478} y={184} taille={12.5} gras>
        O
      </Etiquette>
      <ArcMoment cx={470} cy={190} r={110} a0={112} a1={88} couleur={BRIQUE} epaisseur={2} />
      <Etiquette x={460} y={30} ancre="middle" taille={12.5} gras>
        armoire haute : elle bascule
      </Etiquette>
    </Figure>
  );
}

/** Les deux modes de ruine d'un mur poids : glissement sur sa base, renversement autour de l'arête aval O. */
export function DeuxModesRuine() {
  const mur = (x: number) => (
    <g>
      <rect x={x + 104} y={50} width={100} height={150} fill={hachure('dmr', 'terre')} stroke="none" />
      <polygon points={points([[x, 200], [x + 104, 200], [x + 104, 50], [x + 64, 50]])} fill={hachure('dmr', 'beton')} className="t-fort" />
      <rect x={x - 30} y={200} width={234} height={10} fill={hachure('dmr', 'terre')} stroke="none" />
      <Fleche x1={x + 196} y1={150} x2={x + 108} y2={150} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={x + 150} y={142} taille={12} gras couleur={ROUGE}>
        Q
      </Etiquette>
      <circle cx={x + 66} cy={140} r={3} fill={TRAIT} />
      <Fleche x1={x + 66} y1={140} x2={x + 66} y2={186} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={x + 72} y={180} taille={12} gras couleur={ROUGE}>
        W
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="Deux coupes d'un mur poids poussé par les terres. Glissement : la poussée Q tend à faire glisser le mur sur sa base ; le frottement T, au plus μ N avec N = W, s'y oppose. Renversement : la poussée tend à faire basculer le mur autour de l'arête aval O ; le moment stabilisant du poids, W x, s'oppose au moment renversant Q z." largeur={620} hauteur={256}>
      <Hachures prefixe="dmr" types={['terre', 'beton']} />
      <Etiquette x={110} y={24} ancre="middle" taille={12.5} gras>
        glissement
      </Etiquette>
      {mur(40)}
      <Fleche x1={150} y1={214} x2={60} y2={214} couleur={VERT} epaisseur={2.6} tete={9} />
      <Etiquette x={60} y={236} taille={11.5} gras couleur={VERT}>
        T ≤ μ N
      </Etiquette>
      <Fleche x1={60} y1={40} x2={20} y2={40} couleur={BRIQUE} epaisseur={1.8} tete={7} pointilles />
      <Etiquette x={420} y={24} ancre="middle" taille={12.5} gras>
        renversement
      </Etiquette>
      {mur(350)}
      <circle cx={350} cy={200} r={5} fill={ROUGE} />
      <Etiquette x={342} y={196} ancre="end" taille={12.5} gras>
        O
      </Etiquette>
      <ArcMoment cx={350} cy={200} r={70} a0={60} a1={100} couleur={BRIQUE} epaisseur={2} />
      <Cote x1={350} y1={226} x2={416} y2={226} decalage={0} texte="x (bras de W)" />
      <Cote x1={566} y1={200} x2={566} y2={150} decalage={0} texte="z" />
      <Etiquette x={430} y={252} taille={11.5} gras>
        Ms = W x · Mr = Q z
      </Etiquette>
    </Figure>
  );
}

/** Quatre remèdes pour un mur poids : élargir la base, une bêche, drainer, un mur en T renversé. */
export function RemedesMur() {
  const w = 154;
  const yb = 170;
  const titre = (i: number, t: string) => (
    <Etiquette x={4 + i * w + w / 2} y={22} ancre="middle" taille={11.5} gras>
      {t}
    </Etiquette>
  );
  return (
    <Figure alt="Quatre remèdes. Élargir la base : plus de poids et plus de bras de levier. Ajouter une bêche, un ergot sous la base qui s'oppose au glissement. Drainer : barbacanes, couche drainante et fossé en tête évacuent l'eau. Mur en béton armé en T renversé : le talon porte des terres qui le stabilisent." largeur={620} hauteur={214}>
      <Hachures prefixe="rem" types={['terre', 'beton', 'ba', 'gravier']} />
      {titre(0, 'base élargie')}
      <polygon points={points([[20, yb], [130, yb], [130, 60], [96, 60]])} fill={hachure('rem', 'beton')} className="t-moyen" />
      <polygon points={points([[56, yb], [96, 60], [70, 60]])} fill="none" stroke={GRIS} strokeDasharray="4 3" />
      <Fleche x1={56} y1={yb + 12} x2={22} y2={yb + 12} couleur={VERT} epaisseur={2} tete={7} />
      {titre(1, 'bêche')}
      <polygon points={points([[190, yb], [284, yb], [284, 60], [252, 60]])} fill={hachure('rem', 'beton')} className="t-moyen" />
      <rect x={240} y={yb} width={22} height={24} fill={hachure('rem', 'beton')} className="t-moyen" />
      <Fleche x1={206} y1={yb + 14} x2={236} y2={yb + 14} couleur={VERT} epaisseur={2} tete={7} />
      {titre(2, 'drainage')}
      <polygon points={points([[330, yb], [410, yb], [410, 60], [382, 60]])} fill={hachure('rem', 'beton')} className="t-moyen" />
      <rect x={410} y={60} width={16} height={110} fill={hachure('rem', 'gravier')} className="t-fin" />
      {[90, 140].map((y) => (
        <g key={y}>
          <line x1={370} y1={y + 6} x2={414} y2={y} stroke={BLEU} strokeWidth={4} />
          <Fleche x1={372} y1={y + 8} x2={346} y2={y + 14} couleur={BLEU} epaisseur={1.6} tete={6} />
        </g>
      ))}
      <path d="M430 58 q 12 12 24 0" fill="none" stroke={BLEU} strokeWidth={2} />
      <Etiquette x={444} y={50} ancre="middle" taille={10} couleur={BLEU}>
        fossé
      </Etiquette>
      {titre(3, 'mur en T renversé')}
      <rect x={484} y={yb - 16} width={120} height={16} fill={hachure('rem', 'ba')} className="t-moyen" />
      <rect x={512} y={56} width={14} height={98} fill={hachure('rem', 'ba')} className="t-moyen" />
      <rect x={526} y={56} width={78} height={98} fill={hachure('rem', 'terre')} stroke="none" />
      <Fleche x1={566} y1={80} x2={566} y2={140} couleur={ROUGE} epaisseur={2.2} tete={8} />
      <Etiquette x={566} y={194} ancre="middle" taille={10.5}>
        le talon porte les terres
      </Etiquette>
      <Etiquette x={76} y={194} ancre="middle" taille={10.5}>
        + poids, + bras de levier
      </Etiquette>
      <Etiquette x={236} y={208} ancre="middle" taille={10.5}>
        s’oppose au glissement
      </Etiquette>
      <Etiquette x={390} y={194} ancre="middle" taille={10.5}>
        barbacanes, couche drainante
      </Etiquette>
    </Figure>
  );
}

/** Barbacanes bouchées : l'eau monte derrière le mur et ajoute sa poussée triangulaire. */
export function EauDerriereMur({ H, Feau, FSr, FSg }: { H: number; Feau: number; FSr: number; FSg: number }) {
  const yb = 220;
  const k = 170 / H;
  const xm = 230; // parement côté terres
  return (
    <Figure alt={`Mur poids de ${nombre(H, 0)} m dont les barbacanes sont bouchées : l'eau monte jusqu'en haut du remblai et pousse le mur avec une pression triangulaire, de résultante ${n1(Feau)} kN/m appliquée au tiers de la hauteur. Le renversement tombe à ${n2(FSr)} et le glissement à ${n2(FSg)}.`} largeur={620} hauteur={256}>
      <Hachures prefixe="edm" types={['terre', 'beton', 'eau']} />
      <polygon points={points([[100, yb], [xm, yb], [xm, yb - H * k], [xm - 40, yb - H * k]])} fill={hachure('edm', 'beton')} className="t-fort" />
      <rect x={xm} y={yb - H * k} width={150} height={H * k} fill={hachure('edm', 'terre')} stroke="none" />
      <rect x={xm} y={yb - H * k} width={150} height={H * k} fill={hachure('edm', 'eau')} stroke="none" opacity={0.7} />
      <rect x={60} y={yb} width={340} height={12} fill={hachure('edm', 'terre')} stroke="none" />
      {[0.35, 0.7].map((t) => (
        <g key={t}>
          <line x1={xm - 40 * (1 - t) - 60 * t} y1={yb - H * k * t + 4} x2={xm} y2={yb - H * k * t} stroke={TRAIT} strokeWidth={4} />
          <Etiquette x={xm - 76} y={yb - H * k * t + 2} ancre="end" taille={14} gras couleur={ROUGE}>
            ✗
          </Etiquette>
        </g>
      ))}
      <polygon points={points([[xm + 160, yb - H * k], [xm + 160, yb], [xm + 160 + 70, yb]])} fill={BLEU} fillOpacity={0.18} stroke={BLEU} strokeWidth={1.6} />
      <Fleche x1={xm + 156} y1={yb - (H * k) / 3} x2={xm + 4} y2={yb - (H * k) / 3} couleur={BLEU} epaisseur={3.2} tete={11} />
      <Etiquette x={xm + 20} y={yb - (H * k) / 3 - 10} taille={12.5} gras couleur={BLEU}>
        eau : {n1(Feau)} kN/m
      </Etiquette>
      <Cote x1={xm + 250} y1={yb} x2={xm + 250} y2={yb - (H * k) / 3} decalage={0} texte="H/3" />
      <Etiquette x={60} y={30} taille={11.5} gras couleur={ROUGE}>
        barbacanes bouchées : l’eau ne s’évacue plus
      </Etiquette>
      <Etiquette x={420} y={60} taille={12} gras>
        renversement : {n2(FSr)}
      </Etiquette>
      <Etiquette x={420} y={80} taille={12} gras couleur={ROUGE}>
        glissement : {n2(FSg)}
      </Etiquette>
    </Figure>
  );
}

/** Réaction du sol sous la base d'un mur poids : passage à xN de l'arête aval O, excentricité e, tiers central. */
export function ReactionSolMur({ B, xN, e, tiers }: { B: number; xN: number; e: number; tiers: number }) {
  const k = 300 / B;
  const xO = 150;
  const yb = 120;
  const X = (x: number) => xO + x * k;
  const dansTiers = Math.abs(e) <= tiers + 1e-9;
  const p0 = 18; // pression moyenne dessinée (px), répartition linéaire supposée
  const poly: Array<readonly [number, number]> = dansTiers
    ? [[X(0), yb + 4], [X(B), yb + 4], [X(B), yb + 4 + p0 * (1 - (6 * e) / B)], [X(0), yb + 4 + p0 * (1 + (6 * e) / B)]]
    : [[X(0), yb + 4], [X(Math.min(3 * xN, B)), yb + 4], [X(0), yb + 4 + Math.min((2 * p0 * B) / (3 * Math.max(xN, 1e-6)), 70)]];
  return (
    <Figure alt={`Base de ${n2(B)} m d'un mur poids : la réaction du sol N = W passe à ${n2(xN)} m de l'arête aval O, soit une excentricité e = ${n2(e)} m par rapport au milieu ; le tiers central s'étend à ${n2(tiers)} m de part et d'autre du milieu ; ${dansTiers ? 'la réaction y reste, le sol est comprimé sous toute la base, davantage côté O' : 'elle en sort, une partie de la base se décolle'}.`} largeur={620} hauteur={244}>
      <Hachures prefixe="rsm" types={['beton']} />
      <rect x={X(0)} y={yb - 40} width={B * k} height={40} fill={hachure('rsm', 'beton')} className="t-moyen" />
      <Etiquette x={X(B / 2)} y={yb - 80} ancre="middle" taille={11.5} classe="etiquette">
        base du mur (coupe)
      </Etiquette>
      <rect x={X(B / 2 - tiers)} y={yb - 4} width={2 * tiers * k} height={6} fill={VERT} />
      <line x1={X(B / 2)} y1={yb - 60} x2={X(B / 2)} y2={yb + 70} className="t-fin" strokeDasharray="8 4 2 4" />
      <polygon points={points(poly)} fill={ROUGE} fillOpacity={0.18} stroke={ROUGE} strokeWidth={1.4} />
      <Fleche x1={X(xN)} y1={yb + 96} x2={X(xN)} y2={yb + 8} couleur={VERT} epaisseur={3} tete={10} />
      <Etiquette x={X(xN) - 8} y={yb + 86} ancre="end" taille={12.5} gras couleur={VERT}>
        N = W
      </Etiquette>
      <circle cx={X(0)} cy={yb} r={5} fill={ROUGE} />
      <Etiquette x={X(0) - 8} y={yb + 4} ancre="end" taille={12.5} gras>
        O
      </Etiquette>
      <Cote x1={X(0)} y1={yb + 112} x2={X(xN)} y2={yb + 112} decalage={0} texte={`xN = ${n2(xN)} m`} />
      <Cote x1={X(xN)} y1={yb - 58} x2={X(B / 2)} y2={yb - 58} decalage={0} texte={`e = ${n2(e)} m`} />
      <Etiquette x={X(B) + 12} y={yb + 4} taille={11.5} gras couleur={VERT}>
        tiers central
      </Etiquette>
      <Etiquette x={X(B) + 12} y={yb + 22} taille={11.5} couleur={ROUGE}>
        pression du sol
      </Etiquette>
      <Etiquette x={X(B) + 12} y={yb + 38} taille={11} couleur={ROUGE}>
        (linéaire supposée)
      </Etiquette>
    </Figure>
  );
}

/** Mur en gabions : cages grillagées remplies de pierres, posées en gradins ; lourd et drainant. */
export function MurGabions() {
  const cages: Array<[number, number, number]> = [
    [80, 160, 150],
    [100, 110, 120],
    [120, 60, 90],
  ];
  return (
    <Figure alt="Coupe d'un mur en gabions le long d'une route de montagne : trois rangées de cages grillagées remplies de pierres, posées en gradins. Le mur est lourd, c'est un mur poids, et l'eau du remblai le traverse entre les pierres : il draine." largeur={620} hauteur={232}>
      <Hachures prefixe="gab" types={['terre']} />
      <polygon points={points([[230, 210], [600, 210], [600, 40], [210, 40], [210, 110], [220, 110], [220, 160], [230, 160]])} fill={hachure('gab', 'terre')} stroke="none" />
      <rect x={20} y={210} width={580} height={12} fill={hachure('gab', 'terre')} stroke="none" />
      {cages.map(([x, y, l]) => (
        <g key={y}>
          <rect x={x} y={y} width={l} height={50} fill="var(--color-beton-clair)" stroke={TRAIT} strokeWidth={1.6} />
          {Array.from({ length: Math.floor(l / 14) }, (_, i) =>
            [0, 1, 2].map((j) => <circle key={`${i}-${j}`} cx={x + 8 + i * 14 + (j % 2) * 6} cy={y + 10 + j * 15} r={5.5} fill="var(--color-papier)" stroke={GRIS} strokeWidth={1} />),
          )}
        </g>
      ))}
      <line x1={210} y1={40} x2={600} y2={40} stroke={TRAIT} strokeWidth={4} />
      <Etiquette x={430} y={30} ancre="middle" taille={11.5} gras>
        route
      </Etiquette>
      {[90, 140, 190].map((y) => (
        <Fleche key={y} x1={300} y1={y} x2={200} y2={y + 6} couleur={BLEU} epaisseur={1.6} tete={7} pointilles />
      ))}
      <Etiquette x={320} y={110} taille={11.5} gras couleur={BLEU}>
        l’eau traverse les pierres
      </Etiquette>
      <Etiquette x={20} y={24} taille={11.5} gras>
        gabions : cages grillagées remplies de pierres
      </Etiquette>
      <Etiquette x={20} y={42} taille={11.5}>
        lourds (mur poids) et drainants
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.11 : centres de gravité ----------

/** Une règle en équilibre sur le doigt ; avec une pièce collée à un bout, le point d'équilibre se déplace vers la pièce. */
export function RegleSurDoigt() {
  const ligne = (y: number, piece: boolean) => {
    const x0 = 120;
    const lg = 380;
    const t = piece ? (0.5 * 1 + 1 * 0.5) / 1.5 : 0.5; // règle (poids 1 au milieu) + pièce (poids 0,5 au bout)
    const xG = x0 + t * lg;
    return (
      <g>
        <rect x={x0} y={y - 6} width={lg} height={12} rx={2} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
        {piece ? <ellipse cx={x0 + lg - 14} cy={y - 10} rx={12} ry={4} fill="var(--color-brique)" /> : null}
        <polygon points={points([[xG, y + 6], [xG - 12, y + 34], [xG + 12, y + 34]])} fill="var(--color-brique-clair)" stroke={BRIQUE} strokeWidth={1.4} />
        <Fleche x1={xG} y1={y - 46} x2={xG} y2={y - 10} couleur={ROUGE} epaisseur={2.6} tete={9} />
        <Etiquette x={xG + 8} y={y - 36} taille={12} gras couleur={ROUGE}>
          poids total, en G
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="En haut, une règle seule tient en équilibre sur le doigt en son milieu, son centre de gravité. En bas, avec une pièce collée à un bout, le point d'équilibre se déplace vers la pièce : le centre de gravité est là où passe la résultante de tous les petits poids." largeur={620} hauteur={226}>
      <Etiquette x={20} y={60} taille={12} gras>
        règle seule
      </Etiquette>
      {ligne(76, false)}
      <Etiquette x={20} y={168} taille={12} gras>
        avec une pièce
      </Etiquette>
      {ligne(184, true)}
    </Figure>
  );
}

/** La cornière découpée en deux rectangles : centres des morceaux et centre de gravité G, hors de la matière. */
export function CorniereG({ aile, ep, xG, yG }: { aile: number; ep: number; xG: number; yG: number }) {
  const k = 17;
  const O = [110, 220] as const;
  const P = (x: number, y: number) => [O[0] + x * k, O[1] - y * k] as const;
  const contour = [P(0, 0), P(aile, 0), P(aile, ep), P(ep, ep), P(ep, aile), P(0, aile)];
  const c1 = P(aile / 2, ep / 2);
  const c2 = P(ep / 2, ep + (aile - ep) / 2);
  const G = P(xG, yG);
  return (
    <Figure alt={`Cornière à ailes égales de ${nombre(aile, 0)} cm et d'épaisseur ${nombre(ep, 0)} cm, découpée en un rectangle ${nombre(aile, 0)} × ${nombre(ep, 0)} et un rectangle ${nombre(ep, 0)} × ${nombre(aile - ep, 0)}. Le centre de gravité G est en x_G = y_G = ${n2(yG)} cm depuis l'angle extérieur : hors de la matière, dans l'angle.`} largeur={620} hauteur={256}>
      <polygon points={points(contour)} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={2} />
      <line x1={P(ep, 0)[0]} y1={P(ep, 0)[1]} x2={P(ep, ep)[0]} y2={P(ep, ep)[1]} stroke={GRIS} strokeDasharray="4 3" />
      {[c1, c2].map((c, i) => (
        <g key={i}>
          <circle cx={c[0]} cy={c[1]} r={3.5} fill={TRAIT} />
          <Etiquette x={c[0] + 6} y={c[1] - 6} taille={11} couleur={TRAIT}>
            c{i + 1}
          </Etiquette>
        </g>
      ))}
      <line x1={G[0]} y1={G[1]} x2={G[0]} y2={O[1]} stroke={BLEU} strokeWidth={1.2} strokeDasharray="4 3" />
      <line x1={G[0]} y1={G[1]} x2={O[0]} y2={G[1]} stroke={BLEU} strokeWidth={1.2} strokeDasharray="4 3" />
      <circle cx={G[0]} cy={G[1]} r={6} fill="none" stroke={BLEU} strokeWidth={2.4} />
      <line x1={G[0] - 9} y1={G[1]} x2={G[0] + 9} y2={G[1]} stroke={BLEU} strokeWidth={1.6} />
      <line x1={G[0]} y1={G[1] - 9} x2={G[0]} y2={G[1] + 9} stroke={BLEU} strokeWidth={1.6} />
      <Etiquette x={G[0] + 12} y={G[1] - 10} taille={13} gras couleur={BLEU}>
        G
      </Etiquette>
      <Cote x1={O[0]} y1={O[1] + 22} x2={G[0]} y2={O[1] + 22} decalage={0} texte={`xG = ${n2(xG)}`} />
      <Cote x1={O[0] - 24} y1={O[1]} x2={O[0] - 24} y2={G[1]} decalage={0} texte={`yG = ${n2(yG)}`} />
      <Etiquette x={O[0] - 8} y={O[1] + 16} ancre="end" taille={11.5} gras>
        O
      </Etiquette>
      <rect x={340} y={60} width={266} height={110} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={352} y={84} taille={12} gras>
        c1 : rectangle {nombre(aile, 0)} × {nombre(ep, 0)} (aile)
      </Etiquette>
      <Etiquette x={352} y={104} taille={12} gras>
        c2 : rectangle {nombre(ep, 0)} × {nombre(aile - ep, 0)} (âme)
      </Etiquette>
      <Etiquette x={352} y={130} taille={12} gras couleur={BLEU}>
        G = moyenne pondérée par les aires
      </Etiquette>
      <Etiquette x={352} y={152} taille={11.5} couleur={BLEU}>
        ici dans le vide, dans l’angle (cm)
      </Etiquette>
    </Figure>
  );
}

/** Trois raccourcis : l'axe de symétrie porte G, un trou compte en négatif, G est du côté où la matière abonde. */
export function RaccourcisG() {
  const w = 206;
  return (
    <Figure alt="Trois raccourcis. Une section en T a un axe de symétrie vertical : G est dessus, une seule coordonnée à calculer. Une plaque percée : la plaque pleine moins le trou, compté avec une aire négative. Contrôle : G se trouve du côté où la matière est la plus abondante, à l'intérieur du contour général." largeur={620} hauteur={206}>
      <Etiquette x={103} y={22} ancre="middle" taille={12} gras>
        1. symétrie
      </Etiquette>
      <polygon points={points([[43, 50], [163, 50], [163, 74], [113, 74], [113, 160], [93, 160], [93, 74], [43, 74]])} fill="var(--color-beton-clair)" className="t-moyen" />
      <line x1={103} y1={36} x2={103} y2={172} stroke={BLEU} strokeWidth={1.4} strokeDasharray="10 4 2 4" />
      <circle cx={103} cy={84} r={5} fill={BLEU} />
      <Etiquette x={110} y={92} taille={11.5} gras couleur={BLEU}>
        G sur l’axe
      </Etiquette>
      <Etiquette x={103 + w} y={22} ancre="middle" taille={12} gras>
        2. trou = aire négative
      </Etiquette>
      <rect x={240} y={60} width={60} height={60} fill="var(--color-beton-clair)" className="t-moyen" />
      <Etiquette x={312} y={96} ancre="middle" taille={16} gras>
        −
      </Etiquette>
      <rect x={328} y={78} width={22} height={22} fill="var(--color-correction-clair)" stroke={ROUGE} strokeWidth={1.4} />
      <Etiquette x={362} y={96} ancre="middle" taille={16} gras>
        =
      </Etiquette>
      <rect x={374} y={60} width={60} height={60} fill="var(--color-beton-clair)" className="t-moyen" />
      <rect x={392} y={78} width={22} height={22} fill="var(--color-papier)" className="t-moyen" />
      <Etiquette x={309} y={150} ancre="middle" taille={11}>
        plein − vide : on retranche
      </Etiquette>
      <Etiquette x={103 + 2 * w} y={22} ancre="middle" taille={12} gras>
        3. contrôle
      </Etiquette>
      <polygon points={points([[456, 60], [476, 60], [476, 136], [556, 136], [556, 60], [576, 60], [576, 156], [456, 156]])} fill="var(--color-beton-clair)" className="t-moyen" />
      <circle cx={516} cy={128} r={5} fill={BLEU} />
      <Etiquette x={524} y={124} taille={11.5} gras couleur={BLEU}>
        G
      </Etiquette>
      <Etiquette x={516} y={180} ancre="middle" taille={11}>
        du côté où la matière abonde
      </Etiquette>
    </Figure>
  );
}

/** Un mur en blocs sur sa semelle en béton : poids de chaque partie et centre des poids (pondéré par les poids). */
export function MurSemelleG({ bS, hS, bM, hM, xM, W1, W2, xG }: { bS: number; hS: number; bM: number; hM: number; xM: number; W1: number; W2: number; xG: number }) {
  const kx = 160; // px par mètre, horizontalement
  const ky = 80; // px par mètre, verticalement (hauteur réduite pour la mise en page)
  const O = [120, 236] as const; // coin bas gauche de la semelle
  const P = (x: number, y: number) => [O[0] + x * kx, O[1] - y * ky] as const;
  const s0 = P(0, hS);
  const s1 = P(bS, 0);
  const m0 = P(xM, hS + hM);
  const m1 = P(xM + bM, hS);
  const c1 = P(bS / 2, hS / 2);
  const c2 = P(xM + bM / 2, hS + hM / 2);
  const g = P(xG, 0);
  return (
    <Figure alt={`Mur en blocs de ${n2(bM)} × ${n2(hM)} m posé entre x = ${n2(xM)} et ${n2(xM + bM)} m sur une semelle en béton de ${n2(bS)} × ${n2(hS)} m : poids ${n2(W1)} kN/m pour la semelle, ${n2(W2)} kN/m pour le mur ; centre des poids en x_G = ${nombre(xG, 3)} m depuis le bord de la semelle.`} largeur={620} hauteur={300}>
      <Hachures prefixe="msg" types={['ba', 'maconnerie']} />
      <rect x={s0[0]} y={s0[1]} width={s1[0] - s0[0]} height={s1[1] - s0[1]} fill={hachure('msg', 'ba')} className="t-fort" />
      <rect x={m0[0]} y={m0[1]} width={m1[0] - m0[0]} height={m1[1] - m0[1]} fill={hachure('msg', 'maconnerie')} className="t-fort" />
      <Fleche x1={c1[0]} y1={c1[1] - 30} x2={c1[0]} y2={c1[1] + 12} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Etiquette x={s1[0] + 10} y={c1[1] + 4} taille={12} gras couleur={ROUGE}>
        W1 = {n2(W1)} kN/m (semelle)
      </Etiquette>
      <Fleche x1={c2[0]} y1={c2[1] - 26} x2={c2[0]} y2={c2[1] + 26} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Etiquette x={m1[0] + 26} y={c2[1] + 4} taille={12} gras couleur={ROUGE}>
        W2 = {n2(W2)} kN/m (mur)
      </Etiquette>
      <line x1={g[0]} y1={m0[1] - 4} x2={g[0]} y2={O[1] + 8} stroke={BLEU} strokeWidth={1.6} strokeDasharray="6 4" />
      <Etiquette x={g[0] + 6} y={m0[1] + 6} taille={12} gras couleur={BLEU}>
        centre des poids
      </Etiquette>
      <Cote x1={O[0]} y1={O[1] + 22} x2={g[0]} y2={O[1] + 22} decalage={0} texte={`xG = ${nombre(xG, 3)} m`} />
      <Cote x1={O[0]} y1={O[1] + 50} x2={s1[0]} y2={O[1] + 50} decalage={0} texte={`${n2(bS)} m`} />
      <rect x={436} y={40} width={170} height={96} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={448} y={64} taille={12} gras>
        on pondère par les poids
      </Etiquette>
      <Etiquette x={448} y={86} taille={11.5}>
        xG = Σ Wi xi / Σ Wi
      </Etiquette>
      <Etiquette x={448} y={108} taille={11}>
        semelle en béton, mur en blocs :
      </Etiquette>
      <Etiquette x={448} y={124} taille={11}>
        pas le même γ
      </Etiquette>
    </Figure>
  );
}

/** À quoi sert le centre de gravité : stabilité (bras du poids), flexion (axe neutre), levage (crochet au-dessus de G). */
export function UsagesG() {
  const w = 206;
  const G = (x: number, y: number) => (
    <g>
      <circle cx={x} cy={y} r={5} fill="none" stroke={BLEU} strokeWidth={2.2} />
      <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke={BLEU} strokeWidth={1.4} />
      <line x1={x} y1={y - 8} x2={x} y2={y + 8} stroke={BLEU} strokeWidth={1.4} />
    </g>
  );
  return (
    <Figure alt="Trois usages du centre de gravité. Stabilité : le poids W agit en G, et son bras de levier x par rapport à l'arête de basculement O donne le moment stabilisant W x. Flexion : une poutre fléchit autour de l'axe neutre, qui passe par le centre de gravité de sa section. Levage : une charge élinguée au-dessus de son centre de gravité reste horizontale." largeur={620} hauteur={206}>
      <Hachures prefixe="usg" types={['beton', 'terre']} />
      <Etiquette x={103} y={22} ancre="middle" taille={12} gras>
        stabilité
      </Etiquette>
      <polygon points={points([[50, 160], [140, 160], [140, 50], [110, 50]])} fill={hachure('usg', 'beton')} className="t-moyen" />
      <rect x={30} y={160} width={140} height={8} fill={hachure('usg', 'terre')} stroke="none" />
      {G(112, 116)}
      <Fleche x1={112} y1={120} x2={112} y2={156} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <circle cx={50} cy={160} r={4.5} fill={ROUGE} />
      <Etiquette x={44} y={156} ancre="end" taille={12} gras>
        O
      </Etiquette>
      <Cote x1={50} y1={180} x2={112} y2={180} decalage={0} texte="x" />
      <Etiquette x={103} y={200} ancre="middle" taille={11}>
        Ms = W x
      </Etiquette>
      <Etiquette x={103 + w} y={22} ancre="middle" taille={12} gras>
        flexion
      </Etiquette>
      <polygon points={points([[250, 56], [370, 56], [370, 76], [322, 76], [322, 156], [298, 156], [298, 76], [250, 76]])} fill="var(--color-beton-clair)" className="t-moyen" />
      <line x1={232} y1={92} x2={388} y2={92} stroke={BLEU} strokeWidth={1.6} strokeDasharray="10 4 2 4" />
      {G(310, 92)}
      <Etiquette x={309} y={186} ancre="middle" taille={11}>
        axe neutre par G (L2)
      </Etiquette>
      <Etiquette x={103 + 2 * w} y={22} ancre="middle" taille={12} gras>
        levage
      </Etiquette>
      <line x1={515} y1={34} x2={515} y2={70} stroke={TRAIT} strokeWidth={2} />
      <line x1={515} y1={74} x2={463} y2={124} stroke={TRAIT} strokeWidth={1.4} />
      <line x1={515} y1={74} x2={567} y2={124} stroke={TRAIT} strokeWidth={1.4} />
      <path d="M509 70 q 6 10 12 0" fill="none" stroke={TRAIT} strokeWidth={2.4} />
      <rect x={445} y={124} width={140} height={26} fill="var(--color-beton-clair)" className="t-moyen" />
      {G(515, 137)}
      <Etiquette x={515} y={186} ancre="middle" taille={11}>
        crochet au-dessus de G
      </Etiquette>
    </Figure>
  );
}

/** Le caniveau en U : la moyenne simple des centres (fausse) et le centre de gravité pondéré par les aires (juste). */
export function MoyenneFausse({ B, H, e, ef, yJuste, yFaux }: { B: number; H: number; e: number; ef: number; yJuste: number; yFaux: number }) {
  const k = 2.4;
  const O = [170, 214] as const;
  const P = (x: number, y: number) => [O[0] + x * k, O[1] - y * k] as const;
  const contour = [P(0, 0), P(B, 0), P(B, H), P(B - e, H), P(B - e, ef), P(e, ef), P(e, H), P(0, H)];
  const fauxEnBas = yFaux < yJuste;
  const ligne = (y: number, c: string, texte: string, dy: number) => (
    <g>
      <line x1={P(-10, y)[0]} y1={P(0, y)[1]} x2={P(B + 10, y)[0]} y2={P(0, y)[1]} stroke={c} strokeWidth={2} strokeDasharray="7 4" />
      <Etiquette x={P(B + 14, y)[0]} y={P(0, y)[1] + dy} taille={12} gras couleur={c}>
        {texte}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt={`Caniveau en U de ${nombre(B, 0)} × ${nombre(H, 0)} cm. La moyenne simple des centres du radier et des parois donne ${n1(yFaux)} cm, ce qui est faux ; le centre de gravité pondéré par les aires est à ${n2(yJuste)} cm du fond.`} largeur={620} hauteur={254}>
      <polygon points={points(contour)} fill="var(--color-beton-clair)" className="t-fort" />
      {ligne(yFaux, ROUGE, `✗ moyenne simple : ${n1(yFaux)} cm`, fauxEnBas ? 18 : -8)}
      {ligne(yJuste, VERT, `✓ pondérée par les aires : ${n2(yJuste)} cm`, fauxEnBas ? -8 : 18)}
      <Etiquette x={P(B / 2, 0)[0]} y={O[1] + 18} ancre="middle" taille={11} classe="etiquette">
        origine : le fond du caniveau
      </Etiquette>
      <Etiquette x={20} y={30} taille={11.5}>
        le radier, large, pèse plus dans la moyenne que les parois minces
      </Etiquette>
      <Etiquette x={20} y={246} taille={11} classe="etiquette">
        ici l’écart est faible ; il grandit quand les aires des morceaux sont très différentes
      </Etiquette>
    </Figure>
  );
}

/** Levage d'un élément préfabriqué : crochet à la verticale de G (horizontal) ou décalé (l'élément bascule). */
export function LevageElingue() {
  const element = (cx: number, decal: number, angle: number) => (
    <g>
      <line x1={cx + decal} y1={20} x2={cx + decal} y2={56} stroke={TRAIT} strokeWidth={2} />
      <path d={`M${cx + decal - 6} 56 q 6 10 12 0`} fill="none" stroke={TRAIT} strokeWidth={2.4} />
      <g transform={`rotate(${angle} ${cx + decal} 60)`}>
        <line x1={cx + decal} y1={60} x2={cx + decal - 50 - decal} y2={130} stroke={TRAIT} strokeWidth={1.4} />
        <line x1={cx + decal} y1={60} x2={cx + decal + 50 - decal} y2={130} stroke={TRAIT} strokeWidth={1.4} />
        <rect x={cx - 80} y={130} width={160} height={30} fill="var(--color-beton-clair)" className="t-moyen" />
        <circle cx={cx} cy={145} r={4.5} fill={BLEU} />
        <Etiquette x={cx + 8} y={142} taille={11.5} gras couleur={BLEU}>
          G
        </Etiquette>
      </g>
    </g>
  );
  return (
    <Figure alt="À gauche, le crochet est à la verticale du centre de gravité G : l'élément levé reste horizontal. À droite, les élingues sont accrochées trop loin de G : l'élément bascule pendant le levage, peut se briser ou blesser quelqu'un." largeur={620} hauteur={226}>
      {element(150, 0, 0)}
      <Etiquette x={150} y={210} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ crochet au-dessus de G : horizontal
      </Etiquette>
      {element(450, 40, 18)}
      <Etiquette x={460} y={216} ancre="middle" taille={12} gras couleur={ROUGE}>
        ✗ crochet décalé : l’élément bascule
      </Etiquette>
    </Figure>
  );
}

/** Le caniveau couvert d'une dallette : le centre de gravité de l'ensemble remonte (exercice 3). */
export function CaniveauCouvert({ B, H, e, ef, d, yAvant, yApres }: { B: number; H: number; e: number; ef: number; d: number; yAvant: number; yApres: number }) {
  const k = 2.2;
  const O = [150, 220] as const;
  const P = (x: number, y: number) => [O[0] + x * k, O[1] - y * k] as const;
  const contour = [P(0, 0), P(B, 0), P(B, H), P(B - e, H), P(B - e, ef), P(e, ef), P(e, H), P(0, H)];
  const marque = (y: number, c: string, texte: string) => (
    <g>
      <line x1={P(-8, y)[0]} y1={P(0, y)[1]} x2={P(B + 8, y)[0]} y2={P(0, y)[1]} stroke={c} strokeWidth={2} strokeDasharray="7 4" />
      <Etiquette x={P(B + 12, y)[0]} y={P(0, y)[1] + 4} taille={12} gras couleur={c}>
        {texte}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt={`Caniveau en U de ${nombre(B, 0)} × ${nombre(H, 0)} cm couvert d'une dallette de ${nombre(d, 0)} cm : son centre de gravité passe de ${n2(yAvant)} cm à ${n2(yApres)} cm au-dessus du fond.`} largeur={620} hauteur={244}>
      <polygon points={points(contour)} fill="var(--color-beton-clair)" className="t-fort" />
      <rect x={P(0, H + d)[0]} y={P(0, H + d)[1]} width={B * k} height={d * k} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.6} />
      {marque(yAvant, GRIS, `sans dallette : ${n2(yAvant)} cm`)}
      {marque(yApres, BLEU, `avec dallette : ${n2(yApres)} cm`)}
      <Etiquette x={P(B / 2, H + d)[0]} y={P(0, H + d)[1] - 8} ancre="middle" taille={11.5} gras>
        dallette
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.12 : statique dans l'espace ----------

/** Tabouret à trois pieds vu de dessus : un sac près d'un pied le charge ; hors du triangle, le tabouret bascule. */
export function TabouretSac({ appuis }: { appuis: readonly [PointCharge, PointCharge, PointCharge] }) {
  const cas = [
    { x: 0.6, y: 0.4, titre: 'sac près de A' },
    { x: 3.9, y: 2.4, titre: 'sac hors du triangle' },
  ];
  return (
    <Figure alt="Deux tabourets à trois pieds A, B, C vus de dessus. Un sac posé près du pied A : A porte presque tout, B et C presque rien (cercles proportionnels à la charge de chaque pied). Un sac posé hors du triangle des pieds : la réaction d'un pied devient négative, le tabouret bascule." largeur={620} hauteur={266}>
      {cas.map((c, i) => {
        const x0 = 70 + i * 300;
        const k = 46;
        const X = (x: number) => x0 + x * k;
        const Y = (y: number) => 214 - y * k;
        const r = troisAppuis({ appuis, charges: [{ nom: 'sac', x: c.x, y: c.y, F: 1 }] });
        return (
          <g key={c.titre}>
            <polygon points={points(appuis.map((a) => [X(a.x), Y(a.y)] as const))} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.6} />
            {appuis.map((a, j) => {
              const R = r?.R[j] ?? 0;
              return (
                <g key={a.nom}>
                  <circle cx={X(a.x)} cy={Y(a.y)} r={4 + Math.abs(R) * 20} fill={R >= 0 ? VERT : ROUGE} fillOpacity={0.3} stroke={R >= 0 ? VERT : ROUGE} strokeWidth={1.6} />
                  <Etiquette x={X(a.x) + (a.x < 1 ? -12 : a.x > 3 ? 12 : 0)} y={Y(a.y) + (a.y < 1 ? 20 : -12)} ancre={a.x < 1 ? 'end' : a.x > 3 ? 'start' : 'middle'} taille={12} gras>
                    {a.nom}
                  </Etiquette>
                </g>
              );
            })}
            <rect x={X(c.x) - 9} y={Y(c.y) - 7} width={18} height={14} rx={4} fill="var(--color-terre)" />
            <Etiquette x={X(2)} y={256} ancre="middle" taille={11.5} gras couleur={i === 0 ? VERT : ROUGE}>
              {c.titre} : {i === 0 ? 'A porte presque tout' : 'un pied décolle, il bascule'}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Les six degrés de liberté d'un solide dans l'espace : trois translations et trois rotations. */
export function SixDegres() {
  const O = [200, 120] as const;
  const axes = [
    { nom: 'x', u: [-0.75, 0.5] as const },
    { nom: 'y', u: [1, 0] as const },
    { nom: 'z', u: [0, -1] as const },
  ];
  return (
    <Figure alt="Un solide libre dans l'espace peut glisser le long des trois axes x, y, z et tourner autour de chacun d'eux : six degrés de liberté, donc six équations d'équilibre." largeur={620} hauteur={226}>
      <rect x={O[0] - 26} y={O[1] - 22} width={52} height={44} fill="var(--color-beton-clair)" className="t-moyen" />
      {axes.map((a) => {
        const fin = [O[0] + a.u[0] * 130, O[1] + a.u[1] * 130] as const;
        const rot = [O[0] + a.u[0] * 92, O[1] + a.u[1] * 92] as const;
        return (
          <g key={a.nom}>
            <Fleche x1={O[0]} y1={O[1]} x2={fin[0]} y2={fin[1]} couleur={BLEU} epaisseur={2.2} tete={9} />
            <Etiquette x={fin[0] + (a.u[0] < 0 ? -10 : 8)} y={fin[1] + (a.u[1] < -0.5 ? -6 : 16)} ancre={a.u[0] < 0 ? 'end' : 'start'} taille={13} gras couleur={BLEU}>
              {a.nom}
            </Etiquette>
            <ellipse cx={rot[0]} cy={rot[1]} rx={a.nom === 'z' ? 22 : 9} ry={a.nom === 'z' ? 8 : 20} fill="none" stroke={BRIQUE} strokeWidth={1.8} transform={a.nom === 'x' ? `rotate(-34 ${rot[0]} ${rot[1]})` : undefined} />
          </g>
        );
      })}
      <rect x={380} y={60} width={226} height={110} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={392} y={84} taille={12} gras couleur={BLEU}>
        3 translations (x, y, z)
      </Etiquette>
      <Etiquette x={392} y={106} taille={12} gras couleur={BRIQUE}>
        3 rotations autour des axes
      </Etiquette>
      <Etiquette x={392} y={136} taille={12.5} gras>
        6 degrés de liberté
      </Etiquette>
      <Etiquette x={392} y={156} taille={11.5}>
        → 6 équations d’équilibre
      </Etiquette>
    </Figure>
  );
}

/** Potence de levage dans l'espace : charge au bout du bras ; le moment au pied est un vecteur, ici autour de l'axe x. */
export function PotenceEspace({ bras, hauteur, F, Mx }: { bras: number; hauteur: number; F: number; Mx: number }) {
  const O = [190, 206] as const;
  const kz = 32;
  const ky = 60;
  const P = (x: number, y: number, z: number) => [O[0] + y * ky - x * 30, O[1] - z * kz + x * 18] as const;
  const pied = P(0, 0, 0);
  const tete = P(0, 0, hauteur);
  const bout = P(0, bras, hauteur);
  return (
    <Figure alt={`Potence de levage : mât vertical de ${nombre(hauteur, 0)} m, bras de ${nombre(bras, 0)} m dans la direction y, charge de ${n1(F)} kN au bout. Le moment au pied, produit vectoriel OA ∧ F, n'a qu'une composante : ${n1(Mx)} kN·m autour de l'axe x.`} largeur={620} hauteur={272}>
      <Fleche x1={pied[0]} y1={pied[1]} x2={P(2.2, 0, 0)[0]} y2={P(2.2, 0, 0)[1]} couleur={TRAIT} epaisseur={1.4} tete={7} texte="x" tx={P(2.2, 0, 0)[0] - 14} ty={P(2.2, 0, 0)[1] + 4} />
      <Fleche x1={pied[0]} y1={pied[1]} x2={P(0, 3.6, 0)[0]} y2={P(0, 3.6, 0)[1]} couleur={TRAIT} epaisseur={1.4} tete={7} texte="y" tx={P(0, 3.6, 0)[0] + 4} ty={P(0, 3.6, 0)[1] + 4} />
      <line x1={pied[0]} y1={pied[1]} x2={tete[0]} y2={tete[1]} stroke="var(--color-acier)" strokeWidth={7} />
      <line x1={tete[0]} y1={tete[1]} x2={bout[0]} y2={bout[1]} stroke="var(--color-acier)" strokeWidth={6} />
      <line x1={bout[0]} y1={bout[1]} x2={bout[0]} y2={bout[1] + 40} className="t-fin" />
      <rect x={bout[0] - 14} y={bout[1] + 40} width={28} height={22} fill="var(--color-beton-clair)" className="t-moyen" />
      <Fleche x1={bout[0]} y1={bout[1] + 66} x2={bout[0]} y2={bout[1] + 104} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={bout[0] + 8} y={bout[1] + 96} taille={12.5} gras couleur={ROUGE}>
        F = {n1(F)} kN
      </Etiquette>
      <Cote x1={tete[0]} y1={tete[1] - 16} x2={bout[0]} y2={bout[1] - 16} decalage={0} texte={`${nombre(bras, 0)} m`} />
      <Cote x1={pied[0] - 40} y1={pied[1]} x2={tete[0] - 40} y2={tete[1]} decalage={0} texte={`${nombre(hauteur, 0)} m`} />
      <ellipse cx={P(1.1, 0, 0)[0]} cy={P(1.1, 0, 0)[1]} rx={12} ry={24} fill="none" stroke={VERT} strokeWidth={2.4} transform={`rotate(-30 ${P(1.1, 0, 0)[0]} ${P(1.1, 0, 0)[1]})`} />
      <Etiquette x={P(1.1, 0, 0)[0] + 24} y={P(1.1, 0, 0)[1] + 34} taille={12.5} gras couleur={VERT}>
        Mx = {n1(Mx)} kN·m
      </Etiquette>
      <rect x={400} y={40} width={206} height={96} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={412} y={64} taille={12} gras>
        M = OA ∧ F au pied O
      </Etiquette>
      <Etiquette x={412} y={88} taille={11.5}>
        force verticale au point (0 ; {nombre(bras, 0)}) :
      </Etiquette>
      <Etiquette x={412} y={108} taille={11.5}>
        bras {nombre(bras, 0)} m autour de l’axe x,
      </Etiquette>
      <Etiquette x={412} y={126} taille={11.5}>
        rien autour de y et de z
      </Etiquette>
    </Figure>
  );
}

/** Condition de stabilité d'un plateau sur trois appuis : la résultante doit tomber dans le triangle des appuis. */
export function ZoneStabilite({ appuis, charge, RA }: { appuis: readonly [PointCharge, PointCharge, PointCharge]; charge: PointCharge; RA: number }) {
  const k = 52;
  const X = (x: number) => 110 + x * k;
  const Y = (y: number) => 212 - y * k;
  const [A, B, C] = appuis;
  return (
    <Figure alt={`Plateau sur trois appuis A, B, C vu en plan : tant que la résultante des charges tombe dans le triangle ABC, toutes les réactions sont positives. Une charge de ${nombre(charge.F, 0)} kN posée en (${n1(charge.x)} ; ${n1(charge.y)}), hors du triangle au-delà de BC, rend R_A négative (${n2(RA)} kN) : le plateau bascule autour de BC.`} largeur={620} hauteur={236}>
      <polygon points={points(appuis.map((a) => [X(a.x), Y(a.y)] as const))} fill={VERT} fillOpacity={0.15} stroke={VERT} strokeWidth={2} />
      <line x1={X(B.x)} y1={Y(B.y)} x2={X(C.x)} y2={Y(C.y)} stroke={ROUGE} strokeWidth={3} />
      {appuis.map((a) => (
        <g key={a.nom}>
          <circle cx={X(a.x)} cy={Y(a.y)} r={7} fill={TRAIT} />
          <Etiquette x={X(a.x) + (a.x < 1 ? -12 : 12)} y={Y(a.y) + (a.y < 1 ? 20 : -10)} ancre={a.x < 1 ? 'end' : 'start'} taille={13} gras>
            {a.nom}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={X((A.x + B.x + C.x) / 3)} y={Y((A.y + B.y + C.y) / 3) + 4} ancre="middle" taille={11.5} gras couleur={VERT}>
        résultante ici : stable
      </Etiquette>
      <circle cx={X(charge.x)} cy={Y(charge.y)} r={7} fill={ROUGE} />
      <Etiquette x={X(charge.x) + 12} y={Y(charge.y) + 4} taille={12} gras couleur={ROUGE}>
        {nombre(charge.F, 0)} kN hors du triangle
      </Etiquette>
      <Etiquette x={X(charge.x) + 12} y={Y(charge.y) + 22} taille={12} gras couleur={ROUGE}>
        RA = {n2(RA)} kN : bascule autour de BC
      </Etiquette>
    </Figure>
  );
}

/** Bras de levier d'une force verticale : sa distance à l'axe x est y, sa distance à l'axe y est x. */
export function BrasDeuxAxes() {
  const O = [120, 186] as const;
  const F = [330, 86] as const;
  return (
    <Figure alt="Plan avec les axes x et y : une force verticale appliquée au point de coordonnées (x ; y). Autour de l'axe x, son bras de levier est sa distance à cet axe, la coordonnée y. Autour de l'axe y, son bras de levier est la coordonnée x." largeur={620} hauteur={220}>
      <Fleche x1={O[0]} y1={O[1]} x2={440} y2={O[1]} couleur={TRAIT} epaisseur={1.6} tete={8} texte="axe x" tx={444} ty={O[1] + 4} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0]} y2={20} couleur={TRAIT} epaisseur={1.6} tete={8} texte="axe y" tx={O[0] + 6} ty={26} />
      <circle cx={F[0]} cy={F[1]} r={11} fill="var(--color-papier)" stroke={ROUGE} strokeWidth={2} />
      <line x1={F[0] - 7} y1={F[1] - 7} x2={F[0] + 7} y2={F[1] + 7} stroke={ROUGE} strokeWidth={2} />
      <line x1={F[0] + 7} y1={F[1] - 7} x2={F[0] - 7} y2={F[1] + 7} stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={F[0] + 16} y={F[1] - 10} taille={12} gras couleur={ROUGE}>
        F verticale (vue de dessus)
      </Etiquette>
      <line x1={F[0]} y1={F[1]} x2={F[0]} y2={O[1]} stroke={BLEU} strokeWidth={2.4} />
      <Etiquette x={F[0] + 8} y={(F[1] + O[1]) / 2} taille={12} gras couleur={BLEU}>
        y : bras autour de l’axe x
      </Etiquette>
      <line x1={F[0]} y1={F[1]} x2={O[0]} y2={F[1]} stroke={BRIQUE} strokeWidth={2.4} />
      <Etiquette x={(F[0] + O[0]) / 2} y={F[1] - 10} ancre="middle" taille={12} gras couleur={BRIQUE}>
        x : bras autour de l’axe y
      </Etiquette>
    </Figure>
  );
}

/** Chèvre à trois pieds au-dessus d'un puits : charge à la verticale du centre, ou tirage oblique qui surcharge un pied. */
export function ChevreTrepied() {
  const chevre = (cx: number, oblique: boolean) => (
    <g>
      <line x1={cx} y1={40} x2={cx - 80} y2={190} stroke={TERRE} strokeWidth={5} />
      <line x1={cx} y1={40} x2={cx + 80} y2={190} stroke={TERRE} strokeWidth={5} />
      <line x1={cx} y1={40} x2={cx + 14} y2={196} stroke={TERRE} strokeWidth={3} opacity={0.6} />
      <rect x={cx - 26} y={186} width={52} height={10} fill="var(--color-beton-clair)" className="t-fin" />
      {oblique ? (
        <>
          <line x1={cx} y1={44} x2={cx + 150} y2={150} className="t-fin" />
          <Fleche x1={cx + 10} y1={52} x2={cx + 90} y2={108} couleur={ROUGE} epaisseur={3} tete={10} />
          <Fleche x1={cx + 80} y1={204} x2={cx + 80} y2={192} couleur={VERT} epaisseur={4} tete={10} />
          <Etiquette x={cx + 96} y={104} taille={11.5} gras couleur={ROUGE}>
            tirage oblique
          </Etiquette>
        </>
      ) : (
        <>
          <line x1={cx} y1={44} x2={cx} y2={150} className="t-fin" />
          <rect x={cx - 10} y={150} width={20} height={28} fill="var(--color-acier-clair)" stroke="var(--color-acier)" />
          <Fleche x1={cx} y1={100} x2={cx} y2={146} couleur={ROUGE} epaisseur={3} tete={10} />
        </>
      )}
    </g>
  );
  return (
    <Figure alt="Deux chèvres à trois pieds au-dessus d'un puits. À gauche, la charge pend à la verticale du centre du triangle des pieds : les trois pieds se partagent la charge. À droite, un tirage oblique décale la résultante vers un pied, qui se surcharge, et l'ensemble peut basculer." largeur={620} hauteur={232}>
      {chevre(160, false)}
      <Etiquette x={160} y={224} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ charge à la verticale du centre
      </Etiquette>
      {chevre(440, true)}
      <Etiquette x={440} y={224} ancre="middle" taille={12} gras couleur={ROUGE}>
        ✗ un pied surchargé : risque de bascule
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.P : mini-projet ferme de toiture ----------

/** Plan de toiture de l'atelier : fermes espacées de l'entraxe, pannes au droit des nœuds, bande portée par une ferme. */
export function ToitureFermesPlan({ L, longueur, entraxe }: { L: number; longueur: number; entraxe: number }) {
  const k = Math.min(440 / longueur, 150 / L);
  const x0 = 70;
  const y0 = 30;
  const X = (x: number) => x0 + x * k;
  const Y = (y: number) => y0 + y * k;
  const fermes = Array.from({ length: Math.floor(longueur / entraxe + 1e-9) + 1 }, (_, i) => i * entraxe);
  const pannes = [0, 0.25, 0.5, 0.75, 1].map((t) => t * L);
  const iF = Math.min(1, fermes.length - 1);
  return (
    <Figure alt={`Plan de la toiture de l'atelier de ${nombre(longueur, 0)} m sur ${nombre(L, 0)} m : fermes espacées de ${n1(entraxe)} m, pannes posées au droit des nœuds des arbalétriers ; chaque ferme intérieure porte une bande de toiture de ${n1(entraxe)} m de large.`} largeur={620} hauteur={Y(L) + 60}>
      <rect x={X(fermes[iF]! - entraxe / 2)} y={Y(0)} width={entraxe * k} height={L * k} fill={BLEU} fillOpacity={0.13} />
      <rect x={X(0)} y={Y(0)} width={longueur * k} height={L * k} fill="none" className="t-fort" />
      {pannes.map((y) => (
        <line key={y} x1={X(0)} y1={Y(y)} x2={X(longueur)} y2={Y(y)} stroke={TERRE} strokeWidth={2} />
      ))}
      {fermes.map((x) => (
        <line key={x} x1={X(x)} y1={Y(0)} x2={X(x)} y2={Y(L)} stroke={TRAIT} strokeWidth={x === fermes[iF] ? 5 : 3} />
      ))}
      <Etiquette x={X(fermes[iF]!) + 6} y={Y(L / 2) - 6} taille={11.5} gras couleur={BLEU}>
        ferme étudiée
      </Etiquette>
      <Etiquette x={X(longueur) + 8} y={Y(L / 4) + 4} taille={11} couleur={TERRE}>
        pannes
      </Etiquette>
      <Cote x1={X(0)} y1={Y(L) + 24} x2={X(longueur)} y2={Y(L) + 24} decalage={0} texte={`${nombre(longueur, 0)} m`} />
      <Cote x1={X(0) - 24} y1={Y(L)} x2={X(0) - 24} y2={Y(0)} decalage={0} texte={`L = ${nombre(L, 0)} m`} />
      <Cote x1={X(fermes[iF]! - entraxe / 2)} y1={Y(0) - 12} x2={X(fermes[iF]! + entraxe / 2)} y2={Y(0) - 12} decalage={0} texte={`entraxe ${n1(entraxe)} m`} />
    </Figure>
  );
}

/** Une ferme fonctionne comme un arc à tirant : sans entrait, les arbalétriers écartent les murs. */
export function ArcEtTirant() {
  const ferme = (x0: number, entrait: boolean) => (
    <g>
      <rect x={x0} y={120} width={20} height={70} fill={hachure('aet', 'maconnerie')} className="t-moyen" />
      <rect x={x0 + 200} y={120} width={20} height={70} fill={hachure('aet', 'maconnerie')} className="t-moyen" />
      <line x1={x0 + 10} y1={120} x2={x0 + 110} y2={50} stroke={ROUGE} strokeWidth={6} />
      <line x1={x0 + 210} y1={120} x2={x0 + 110} y2={50} stroke={ROUGE} strokeWidth={6} />
      {entrait ? <line x1={x0 + 10} y1={120} x2={x0 + 210} y2={120} stroke={BLEU} strokeWidth={5} /> : null}
      {!entrait ? (
        <>
          <Fleche x1={x0 + 4} y1={110} x2={x0 - 40} y2={110} couleur={ROUGE} epaisseur={3} tete={10} />
          <Fleche x1={x0 + 216} y1={110} x2={x0 + 260} y2={110} couleur={ROUGE} epaisseur={3} tete={10} />
        </>
      ) : null}
      <Fleche x1={x0 + 110} y1={14} x2={x0 + 110} y2={44} couleur={ROUGE} epaisseur={2.6} tete={9} />
    </g>
  );
  return (
    <Figure alt="À gauche, deux arbalétriers posés sur les murs sans entrait : sous la charge, ils poussent les têtes de murs vers l'extérieur et écartent les murs. À droite, la ferme complète : l'entrait, tendu, retient cette poussée ; les arbalétriers sont comprimés." largeur={620} hauteur={232}>
      <Hachures prefixe="aet" types={['maconnerie']} />
      {ferme(50, false)}
      <Etiquette x={160} y={214} ancre="middle" taille={12} gras couleur={ROUGE}>
        sans entrait : les murs s’écartent
      </Etiquette>
      {ferme(360, true)}
      <Etiquette x={470} y={142} ancre="middle" taille={11.5} gras couleur={BLEU}>
        entrait tendu
      </Etiquette>
      <Etiquette x={470} y={214} ancre="middle" taille={12} gras couleur={VERT}>
        avec entrait : la poussée est retenue
      </Etiquette>
      <Etiquette x={420} y={70} ancre="end" taille={11.5} gras couleur={ROUGE}>
        arbalétriers comprimés
      </Etiquette>
    </Figure>
  );
}

/** Le vent soulève une toiture légère : les efforts changent de signe, l'entrait devient comprimé. */
export function VentSoulevement() {
  return (
    <Figure alt="Sous un orage, le vent aspire la toiture légère en tôles vers le haut. Les efforts de la ferme changent de signe : l'entrait devient comprimé et doit être tenu contre le flambement ; les assemblages et les ancrages doivent résister à l'arrachement." largeur={620} hauteur={206}>
      <line x1={120} y1={150} x2={310} y2={60} stroke={TRAIT} strokeWidth={5} />
      <line x1={500} y1={150} x2={310} y2={60} stroke={TRAIT} strokeWidth={5} />
      <line x1={120} y1={150} x2={500} y2={150} stroke={ROUGE} strokeWidth={5} />
      {[170, 230, 290, 330, 390, 450].map((x) => {
        const y = x < 310 ? 150 - ((x - 120) / 190) * 90 : 150 - ((500 - x) / 190) * 90;
        return <Fleche key={x} x1={x} y1={y - 6} x2={x} y2={y - 46} couleur={BLEU} epaisseur={2} tete={8} />;
      })}
      <Etiquette x={310} y={22} ancre="middle" taille={12} gras couleur={BLEU}>
        aspiration du vent
      </Etiquette>
      <Etiquette x={310} y={172} ancre="middle" taille={12} gras couleur={ROUGE}>
        entrait comprimé : à tenir contre le flambement
      </Etiquette>
      <Fleche x1={120} y1={160} x2={120} y2={196} couleur={VERT} epaisseur={2.6} tete={9} />
      <Fleche x1={500} y1={160} x2={500} y2={196} couleur={VERT} epaisseur={2.6} tete={9} />
      <Etiquette x={510} y={192} taille={11.5} gras couleur={VERT}>
        ancrages à l’arrachement
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.EX : examen (énoncés, sans résultat) ----------

/** Poteau avec une force horizontale en tête (question 2). */
export function PoteauForceH({ F, h }: { F: number; h: number }) {
  return (
    <Figure alt={`Poteau de ${nombre(h, 0)} m de haut, force horizontale de ${nombre(F, 0)} kN appliquée en tête.`} largeur={620} hauteur={190}>
      <Hachures prefixe="pfh" types={['terre']} />
      <rect x={200} y={170} width={220} height={10} fill={hachure('pfh', 'terre')} stroke="none" />
      <line x1={200} y1={170} x2={420} y2={170} className="t-moyen" />
      <rect x={302} y={30} width={16} height={140} fill="var(--color-beton-clair)" className="t-moyen" />
      <Fleche x1={230} y1={34} x2={298} y2={34} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={230} y={26} taille={12.5} gras couleur={ROUGE}>
        {nombre(F, 0)} kN
      </Etiquette>
      <Cote x1={350} y1={170} x2={350} y2={34} decalage={0} texte={`${nombre(h, 0)} m`} />
      <circle cx={310} cy={170} r={4} fill={TRAIT} />
      <Etiquette x={300} y={164} ancre="end" taille={12} gras>
        pied
      </Etiquette>
    </Figure>
  );
}

/** Semelle sous un poteau : efforts N et H et dimensions, sans résultat (question 3). */
export function SemelleDonnees({ N, H, h, B }: { N: number; H: number; h: number; B: number }) {
  const cx = 300;
  const k = 120 / B;
  return (
    <Figure alt={`Semelle de ${n1(B)} m de large sous un poteau : effort vertical N = ${nombre(N, 0)} kN, effort horizontal H = ${nombre(H, 0)} kN à ${nombre(h, 0)} m au-dessus de la base.`} largeur={620} hauteur={214}>
      <Hachures prefixe="sdo" types={['ba']} />
      <rect x={cx - (B / 2) * k} y={160} width={B * k} height={26} fill={hachure('sdo', 'ba')} className="t-moyen" />
      <rect x={cx - 14} y={40} width={28} height={120} fill={hachure('sdo', 'ba')} className="t-moyen" />
      <Fleche x1={cx} y1={8} x2={cx} y2={38} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={cx + 8} y={22} taille={12.5} gras couleur={ROUGE}>
        N = {nombre(N, 0)} kN
      </Etiquette>
      <Fleche x1={cx - 90} y1={60} x2={cx - 16} y2={60} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={cx - 90} y={52} taille={12.5} gras couleur={ROUGE}>
        H = {nombre(H, 0)} kN
      </Etiquette>
      <Cote x1={cx + 60} y1={186} x2={cx + 60} y2={60} decalage={0} texte={`${nombre(h, 0)} m`} />
      <Cote x1={cx - (B / 2) * k} y1={204} x2={cx + (B / 2) * k} y2={204} decalage={0} texte={`B = ${n1(B)} m`} />
    </Figure>
  );
}

/** Section en T : âme et table, avec leurs dimensions (question 11). */
export function SectionTDonnees({ bw, hw, b, hf }: { bw: number; hw: number; b: number; hf: number }) {
  const k = 2.6;
  const cx = 300;
  const yb = 180;
  return (
    <Figure alt={`Section en T : âme de ${nombre(bw, 0)} × ${nombre(hw, 0)} cm, de y = 0 à ${nombre(hw, 0)} cm, surmontée d'une table de ${nombre(b, 0)} × ${nombre(hf, 0)} cm.`} largeur={620} hauteur={214}>
      <rect x={cx - (bw / 2) * k} y={yb - hw * k} width={bw * k} height={hw * k} fill="var(--color-beton-clair)" className="t-moyen" />
      <rect x={cx - (b / 2) * k} y={yb - (hw + hf) * k} width={b * k} height={hf * k} fill="var(--color-beton-clair)" className="t-moyen" />
      <Cote x1={cx - (b / 2) * k} y1={yb - (hw + hf) * k - 14} x2={cx + (b / 2) * k} y2={yb - (hw + hf) * k - 14} decalage={0} texte={`${nombre(b, 0)} cm`} />
      <Cote x1={cx + (b / 2) * k + 18} y1={yb - hw * k} x2={cx + (b / 2) * k + 18} y2={yb - (hw + hf) * k} decalage={0} texte={`${nombre(hf, 0)}`} />
      <Cote x1={cx + (bw / 2) * k + 18} y1={yb} x2={cx + (bw / 2) * k + 18} y2={yb - hw * k} decalage={0} texte={`${nombre(hw, 0)} cm`} />
      <Cote x1={cx - (bw / 2) * k} y1={yb + 18} x2={cx + (bw / 2) * k} y2={yb + 18} decalage={0} texte={`${nombre(bw, 0)}`} />
      <line x1={cx - 120} y1={yb} x2={cx - 40} y2={yb} stroke={BLEU} strokeWidth={1.4} />
      <Etiquette x={cx - 124} y={yb + 4} ancre="end" taille={11.5} couleur={BLEU}>
        y = 0
      </Etiquette>
    </Figure>
  );
}
