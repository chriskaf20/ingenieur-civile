// Schémas du module L2.1 (équations différentielles). Les courbes sont tracées à partir de lib/calc/equadiff.ts.
import { useId } from 'react';
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure, Renvoi } from '@/components/drawing/Figure';
import { Axes, Courbe, repere2D } from '@/components/drawing/Graphe';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { degreConsolidation, euler, type DonneesVidange } from '@/lib/calc/equadiff';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const n2 = (x: number) => nombre(x, 2);

const grad = (max: number, n = 5) => {
  const pas = Math.pow(10, Math.floor(Math.log10(max / n)));
  const k = [1, 2, 5, 10].find((m) => max / (m * pas) <= n) ?? 10;
  return Array.from({ length: Math.floor(max / (k * pas)) }, (_, i) => (i + 1) * k * pas);
};

/** Champ de pentes de y' = −k y et une solution : la pente en chaque point est donnée par l'équation. */
export function ChampPentes({ k = 0.5, y0 = 4 }: { k?: number; y0?: number }) {
  const R = repere2D({ x0: 60, y0: 20, l: 500, h: 170, xmin: 0, xmax: 8, ymin: 0, ymax: 5 });
  const tirets: React.ReactNode[] = [];
  for (let t = 0.5; t < 8; t += 1)
    for (let y = 0.5; y < 5; y += 0.75) {
      const p = -k * y;
      const dx = 0.3 / Math.sqrt(1 + p * p * 0.4);
      tirets.push(<line key={`${t}-${y}`} x1={R.X(t - dx)} y1={R.Y(y - p * dx)} x2={R.X(t + dx)} y2={R.Y(y + p * dx)} stroke="var(--trait-doux)" strokeWidth={1.2} />);
    }
  return (
    <Figure alt={`Champ de pentes de l'équation y' = −${nombre(k, 1)} y : en chaque point, un petit trait montre la pente imposée par l'équation, forte quand y est grand, nulle quand y = 0. La solution partant de y = ${y0} suit ces traits et décroît vers zéro.`} largeur={620} hauteur={230}>
      <Axes R={R} gradX={[2, 4, 6, 8]} gradY={[1, 2, 3, 4]} titreX="t" titreY="y" />
      {tirets}
      <Courbe R={R} f={(t) => y0 * Math.exp(-k * t)} de={0} a={8} couleur={BLEU} epaisseur={2.4} />
      <Etiquette x={R.X(1.2)} y={R.Y(y0 * Math.exp(-0.6)) - 10} taille={12} gras couleur={BLEU}>
        une solution
      </Etiquette>
    </Figure>
  );
}

/** Euler et la solution exacte : la méthode avance par petits segments tangents. */
export function EulerExact({ h = 0.5 }: { h?: number }) {
  const pts = euler((_t, y) => -y, 0, 1, h, Math.round(3 / h));
  const R = repere2D({ x0: 60, y0: 20, l: 500, h: 160, xmin: 0, xmax: 3, ymin: 0, ymax: 1.05 });
  return (
    <Figure alt={`La méthode d'Euler pour y' = −y, y(0) = 1, avec un pas de ${n2(h)} : chaque segment suit la pente au début du pas. Les points (en rouge) restent sous la solution exacte e^(−t) (en bleu) ; l'écart diminue quand le pas diminue.`} largeur={620} hauteur={220}>
      <Axes R={R} gradX={[1, 2, 3]} gradY={[0.5, 1]} titreX="t" titreY="y" decY={1} />
      <Courbe R={R} f={(t) => Math.exp(-t)} de={0} a={3} couleur={BLEU} epaisseur={2.2} />
      <polyline points={points(pts.map(([t, y]) => [R.X(t), R.Y(y)] as const))} fill="none" stroke={ROUGE} strokeWidth={1.6} />
      {pts.map(([t, y]) => (
        <circle key={t} cx={R.X(t)} cy={R.Y(y)} r={3.5} fill={ROUGE} />
      ))}
      <Etiquette x={R.X(0.9)} y={R.Y(Math.exp(-0.9)) - 10} taille={11.5} gras couleur={BLEU}>
        exacte e^(−t)
      </Etiquette>
      <Etiquette x={R.X(1.6)} y={R.Y(pts[Math.round(1.5 / h)]![1]) + 22} taille={11.5} gras couleur={ROUGE}>
        {`Euler, h = ${n2(h)}`}
      </Etiquette>
    </Figure>
  );
}

/** Décroissance exponentielle : la même fraction disparaît à chaque intervalle. */
export function Exponentielle({ y0, k, unite = '', titreX = 't', titreY = 'y' }: { y0: number; k: number; unite?: string; titreX?: string; titreY?: string }) {
  const tau = 1 / k;
  const demi = Math.log(2) / k;
  const tmax = 4 * tau;
  const R = repere2D({ x0: 70, y0: 20, l: 480, h: 160, xmin: 0, xmax: tmax, ymin: 0, ymax: y0 * 1.08 });
  return (
    <Figure alt={`Décroissance exponentielle depuis ${n2(y0)}${unite} : au bout d'une demi-vie, ${n2(demi)}, il reste la moitié ; au bout d'une constante de temps, ${n2(tau)}, il reste 37 %. La tangente à l'origine coupe l'axe du temps en τ.`} largeur={620} hauteur={225}>
      <Axes R={R} gradX={grad(tmax)} gradY={grad(y0)} titreX={titreX} titreY={titreY} />
      <Courbe R={R} f={(t) => y0 * Math.exp(-k * t)} de={0} a={tmax} couleur={BLEU} epaisseur={2.2} />
      <line x1={R.X(0)} y1={R.Y(y0)} x2={R.X(tau)} y2={R.Y(0)} stroke={VERT} strokeDasharray="5 3" />
      <line x1={R.X(demi)} y1={R.Y(0)} x2={R.X(demi)} y2={R.Y(y0 / 2)} stroke={ROUGE} strokeDasharray="3 3" />
      <line x1={R.X(0)} y1={R.Y(y0 / 2)} x2={R.X(demi)} y2={R.Y(y0 / 2)} stroke={ROUGE} strokeDasharray="3 3" />
      <Etiquette x={R.X(demi) + 6} y={R.Y(y0 / 2) - 6} taille={11} gras couleur={ROUGE}>
        {`demi-vie ${n2(demi)}`}
      </Etiquette>
      <Etiquette x={R.X(tau) + 6} y={R.Y(0) - 8} taille={11} gras couleur={VERT}>
        {`τ = ${n2(tau)}`}
      </Etiquette>
    </Figure>
  );
}

/** Refroidissement de Newton : la température tend vers celle de l'air. */
export function CourbeRefroidissement({ T0, Ta, k, Tcible, tCible }: { T0: number; Ta: number; k: number; Tcible: number; tCible: number }) {
  const tmax = Math.max(tCible * 1.8, 4 / k);
  const R = repere2D({ x0: 70, y0: 20, l: 480, h: 160, xmin: 0, xmax: tmax, ymin: Ta - 5, ymax: T0 + 5 });
  return (
    <Figure alt={`Le béton passe de ${T0} °C à la température de l'air, ${Ta} °C, sans jamais la dépasser : la courbe s'aplatit. Il atteint ${Tcible} °C au bout de ${n2(tCible)} h.`} largeur={620} hauteur={225}>
      <Axes R={R} gradX={grad(tmax)} gradY={[Ta, Tcible, T0]} titreX="t (h)" titreY="T (°C)" />
      <line x1={R.X(0)} y1={R.Y(Ta)} x2={R.X(tmax)} y2={R.Y(Ta)} stroke={TERRE} strokeDasharray="6 3" />
      <Etiquette x={R.X(tmax) - 4} y={R.Y(Ta) - 6} ancre="end" taille={11} couleur={TERRE}>
        air
      </Etiquette>
      <Courbe R={R} f={(t) => Ta + (T0 - Ta) * Math.exp(-k * t)} de={0} a={tmax} couleur={ROUGE} epaisseur={2.2} />
      <line x1={R.X(tCible)} y1={R.Y(Ta - 5)} x2={R.X(tCible)} y2={R.Y(Tcible)} stroke={BLEU} strokeDasharray="3 3" />
      <circle cx={R.X(tCible)} cy={R.Y(Tcible)} r={4} fill={BLEU} />
      <Etiquette x={R.X(tCible) + 6} y={R.Y(Tcible) - 6} taille={11.5} gras couleur={BLEU}>
        {`${Tcible} °C à ${n2(tCible)} h`}
      </Etiquette>
    </Figure>
  );
}

/** Un réservoir qui se vide par un orifice : la vitesse du jet dépend de la hauteur d'eau. */
export function ReservoirOrifice({ h0, h1 }: { h0: number; h1: number }) {
  const p = `ro${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const k = 32;
  const yb = 190;
  return (
    <Figure alt={`Un réservoir de section A se vide par un orifice au fond. L'eau sort à la vitesse √(2 g h) : plus la hauteur h est grande, plus le jet est rapide. Le niveau descend de ${n2(h0)} m à ${n2(h1)} m, de plus en plus lentement.`} largeur={620} hauteur={220}>
      <Hachures prefixe={p} types={['eau']} />
      <path d={`M150 ${yb - 5 * k} V${yb} H350 V${yb - 5 * k}`} fill="none" className="t-fort" strokeWidth={3} />
      <rect x={152} y={yb - h0 * k} width={196} height={h0 * k - 2} fill={hachure(p, 'eau')} />
      <line x1={150} y1={yb - h1 * k} x2={350} y2={yb - h1 * k} stroke={ROUGE} strokeDasharray="5 3" />
      <path d={`M350 ${yb - 8} Q 420 ${yb - 6} 470 ${yb + 22}`} fill="none" stroke={BLEU} strokeWidth={5} opacity={0.6} />
      <Cote x1={350} y1={yb} x2={350} y2={yb - h0 * k} decalage={-60} texte={`h0 = ${n2(h0)} m`} />
      <Etiquette x={360} y={yb - h1 * k + 4} taille={11} couleur={ROUGE}>
        {`h1 = ${n2(h1)} m`}
      </Etiquette>
      <Etiquette x={420} y={yb - 18} taille={11.5} gras couleur={BLEU}>
        v = √(2 g h)
      </Etiquette>
      <Etiquette x={250} y={yb - h0 * k - 10} ancre="middle" taille={11.5} gras>
        section A
      </Etiquette>
      <Renvoi de={[60, 180]} vers={[349, yb - 6]} texte="orifice a" />
    </Figure>
  );
}

/** Courbe h(t) de vidange, comparée à une vidange à débit constant. */
export function CourbeVidange({ dd, T, c }: { dd: DonneesVidange; T: number; c: number }) {
  const tmin = T / 60;
  const R = repere2D({ x0: 70, y0: 20, l: 480, h: 160, xmin: 0, xmax: tmin * 1.15, ymin: 0, ymax: dd.h0 * 1.1 });
  const Q0 = 2 * dd.A * c * Math.sqrt(dd.h0);
  return (
    <Figure alt={`Hauteur d'eau en fonction du temps : une parabole qui part de ${n2(dd.h0)} m et atteint ${n2(dd.h1)} m en ${nombre(tmin, 1)} min. En pointillé, la droite qu'on obtiendrait si le débit restait celui du début : la vidange réelle est plus lente, car le débit baisse avec la hauteur.`} largeur={620} hauteur={225}>
      <Axes R={R} gradX={grad(tmin * 1.15)} gradY={grad(dd.h0)} titreX="t (min)" titreY="h (m)" />
      <Courbe R={R} f={(t) => Math.max(0, Math.sqrt(dd.h0) - c * t * 60) ** 2} de={0} a={tmin * 1.04} couleur={BLEU} epaisseur={2.2} />
      <Courbe R={R} f={(t) => dd.h0 - (Q0 / dd.A) * t * 60} de={0} a={((dd.h0 - dd.h1) * dd.A) / Q0 / 60} couleur={ROUGE} pointilles />
      <line x1={R.X(0)} y1={R.Y(dd.h1)} x2={R.X(tmin)} y2={R.Y(dd.h1)} stroke={VERT} strokeDasharray="3 3" />
      <circle cx={R.X(tmin)} cy={R.Y(dd.h1)} r={4} fill={VERT} />
      <Etiquette x={R.X(tmin) + 6} y={R.Y(dd.h1) - 8} taille={11.5} gras couleur={VERT}>
        {`${nombre(tmin, 1)} min`}
      </Etiquette>
      <Etiquette x={R.X(tmin * 0.25)} y={R.Y(dd.h0 * 0.55)} taille={11} couleur={ROUGE}>
        débit constant
      </Etiquette>
    </Figure>
  );
}

/** Les trois formes de solution du second ordre, selon le discriminant. */
export function TroisRegimes() {
  const R = (x0: number) => repere2D({ x0, y0: 20, l: 170, h: 120, xmin: 0, xmax: 6, ymin: -1, ymax: 1.2 });
  const cas: [string, string, (t: number) => number, string][] = [
    ['Δ > 0 : deux racines réelles', 'somme d’exponentielles', (t) => 2 * Math.exp(-0.4 * t) - Math.exp(-1.5 * t), BLEU],
    ['Δ = 0 : racine double', '(A + B t) e^(rt)', (t) => (1 + t) * Math.exp(-t), VERT],
    ['Δ < 0 : racines complexes', 'oscillation amortie', (t) => Math.exp(-0.3 * t) * Math.cos(2.5 * t), ROUGE],
  ];
  return (
    <Figure alt="Les trois formes de solution de y'' + p y' + q y = 0 selon le discriminant de l'équation caractéristique : deux racines réelles, une décroissance sans oscillation ; une racine double, une décroissance la plus rapide sans oscillation ; deux racines complexes, une oscillation dont l'amplitude décroît." largeur={620} hauteur={200}>
      {cas.map(([t, s, f, c], i) => {
        const r = R(20 + i * 205);
        return (
          <g key={t}>
            <Axes R={r} titreX="t" />
            <Courbe R={r} f={f} de={0} a={6} couleur={c} epaisseur={2} />
            <Etiquette x={r.x0 + 85} y={162} ancre="middle" taille={11} gras couleur={c}>
              {t}
            </Etiquette>
            <Etiquette x={r.x0 + 85} y={178} ancre="middle" taille={10.5}>
              {s}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Masse, ressort, amortisseur : les trois forces. */
export function MasseRessort() {
  const p = `mr${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const ressort = points(Array.from({ length: 13 }, (_, i) => [i === 0 || i === 12 ? 120 : 110 + (i % 2) * 20, 30 + i * 8] as const));
  return (
    <Figure alt="Un oscillateur : une masse m suspendue à un ressort de raideur k et à un amortisseur c. Écartée de x, elle subit la force de rappel du ressort, −k x, et la force de freinage de l'amortisseur, −c x' ; son inertie vaut m x''. L'équation est m x'' + c x' + k x = 0." largeur={620} hauteur={220}>
      <rect x={60} y={14} width={220} height={14} fill={hachure(p, 'ba')} className="t-fort" />
      <Hachures prefixe={p} types={['ba']} />
      <polyline points={ressort} fill="none" stroke={BLEU} strokeWidth={2} />
      <path d="M210 28 V70 M196 70 H224 V100 H196 Z M210 86 V130" fill="none" className="t-moyen" />
      <rect x={95} y={130} width={140} height={50} rx={4} fill="var(--color-beton-clair)" className="t-fort" />
      <Etiquette x={165} y={160} ancre="middle" taille={14} gras>
        m
      </Etiquette>
      <Etiquette x={98} y={80} ancre="end" taille={12} gras couleur={BLEU}>
        k
      </Etiquette>
      <Etiquette x={232} y={88} taille={12} gras>
        c
      </Etiquette>
      <Fleche x1={260} y1={150} x2={260} y2={200} couleur={ROUGE} epaisseur={1.6} tete={8} />
      <Etiquette x={266} y={190} taille={11.5} gras couleur={ROUGE}>
        x
      </Etiquette>
      <Etiquette x={330} y={70} taille={13} gras>
        m x'' + c x' + k x = 0
      </Etiquette>
      <Etiquette x={330} y={100} taille={11.5}>
        ressort : rappel −k x
      </Etiquette>
      <Etiquette x={330} y={120} taille={11.5}>
        amortisseur : freinage −c x'
      </Etiquette>
      <Etiquette x={330} y={140} taille={11.5}>
        inertie : m x''
      </Etiquette>
    </Figure>
  );
}

/** Oscillation amortie : la courbe et son enveloppe exponentielle. */
export function OscillationAmortie({ x, x0, zeta, w0, Td, tmax }: { x: (t: number) => number; x0: number; zeta: number; w0: number; Td: number; tmax: number }) {
  const R = repere2D({ x0: 70, y0: 20, l: 480, h: 170, xmin: 0, xmax: tmax, ymin: -x0 * 1.1, ymax: x0 * 1.1 });
  const env = (t: number) => x0 * Math.exp(-zeta * w0 * t);
  return (
    <Figure alt={`Le déplacement oscille avec une pseudo-période de ${nombre(Td, 3)} s et son amplitude décroît sous l'enveloppe exponentielle x0 e^(−ζ ω0 t), avec un amortissement de ${nombre(zeta * 100, 0)} %.`} largeur={620} hauteur={230}>
      <Axes R={R} gradX={grad(tmax)} titreX="t (s)" titreY="x" />
      <Courbe R={R} f={env} de={0} a={tmax} couleur={ROUGE} pointilles />
      <Courbe R={R} f={(t) => -env(t)} de={0} a={tmax} couleur={ROUGE} pointilles />
      <Courbe R={R} f={x} de={0} a={tmax} couleur={BLEU} epaisseur={1.8} n={600} />
      <Cote x1={R.X(0)} y1={R.Y(-x0 * 1.05)} x2={R.X(Td)} y2={R.Y(-x0 * 1.05)} texte={`Td = ${nombre(Td, 3)} s`} taille={10.5} />
      <Etiquette x={R.X(tmax * 0.55)} y={R.Y(env(tmax * 0.55)) - 8} taille={11} couleur={ROUGE}>
        enveloppe x0 e^(−ζ ω0 t)
      </Etiquette>
    </Figure>
  );
}

/** Poutre sur deux appuis, sa déformée et sa flèche, exagérées. */
export function PoutreDeformee({ L, y, f }: { L: number; y: (x: number) => number; f: number }) {
  const k = 480 / L;
  const ex = 70 / f;
  const X = (x: number) => 70 + x * k;
  return (
    <Figure alt={`Poutre de ${n2(L)} m sur deux appuis, chargée uniformément. Sa déformée, très exagérée sur le dessin, est une courbe du quatrième degré, nulle aux appuis et maximale au milieu : la flèche vaut ${nombre(f * 1000, 2)} mm.`} largeur={620} hauteur={190}>
      {Array.from({ length: 13 }, (_, i) => (
        <Fleche key={i} x1={X((i * L) / 12)} y1={20} x2={X((i * L) / 12)} y2={44} couleur={ROUGE} epaisseur={1.2} tete={6} />
      ))}
      <line x1={X(0)} y1={20} x2={X(L)} y2={20} stroke={ROUGE} />
      <line x1={X(0)} y1={50} x2={X(L)} y2={50} className="t-fin" strokeDasharray="5 3" />
      <polyline points={points(Array.from({ length: 61 }, (_, i) => [X((i * L) / 60), 50 + y((i * L) / 60) * ex] as const))} fill="none" stroke={BLEU} strokeWidth={4} />
      <polygon points={points([[X(0), 50], [X(0) - 10, 66], [X(0) + 10, 66]])} fill="none" className="t-fort" />
      <polygon points={points([[X(L), 50], [X(L) - 10, 66], [X(L) + 10, 66]])} fill="none" className="t-fort" />
      <line x1={X(L / 2)} y1={50 + f * ex} x2={X(L) + 10} y2={50 + f * ex} className="t-fin" strokeDasharray="3 3" />
      <Cote x1={X(L) + 10} y1={50 + f * ex} x2={X(L) + 10} y2={50} decalage={-6} texte={`f = ${nombre(f * 1000, 2)} mm`} />
      <Cote x1={X(0)} y1={66} x2={X(L)} y2={66} decalage={-78} texte={`L = ${n2(L)} m`} />
      <Etiquette x={X(L) - 4} y={36} ancre="end" taille={11} couleur={ROUGE}>
        q
      </Etiquette>
      <Etiquette x={X(0.2 * L)} y={150} taille={10.5} classe="etiquette">
        déformée exagérée
      </Etiquette>
    </Figure>
  );
}

/** Couche d'argile qui se consolide : l'eau s'échappe vers les couches drainantes. */
export function CoucheConsolidation({ H, double }: { H: number; double: boolean }) {
  const p = `cc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Figure alt={`Une couche d'argile de ${n2(H)} m sous un remblai. Comprimée, elle ne se tasse qu'à mesure que l'eau de ses pores s'échappe ${double ? 'vers le sable au-dessus et en dessous' : 'vers le haut seulement'} ; c'est ce qui rend le tassement lent. Le chemin de drainage vaut ${double ? 'la moitié de l’épaisseur' : 'toute l’épaisseur'}.`} largeur={620} hauteur={220}>
      <Hachures prefixe={p} types={['remblai', 'gravier', 'terre']} />
      <polygon points={points([[100, 50], [180, 20], [440, 20], [520, 50]])} fill={hachure(p, 'remblai')} className="t-moyen" />
      <rect x={40} y={50} width={540} height={20} fill={hachure(p, 'gravier')} className="t-fin" />
      <rect x={40} y={70} width={540} height={100} fill="var(--color-terre-clair)" className="t-moyen" />
      <rect x={40} y={170} width={540} height={20} fill={double ? hachure(p, 'gravier') : hachure(p, 'terre')} className="t-fin" />
      {[160, 260, 360, 460].map((x) => (
        <g key={x}>
          <Fleche x1={x} y1={double ? 115 : 160} x2={x} y2={76} couleur={BLEU} epaisseur={1.6} tete={7} />
          {double ? <Fleche x1={x} y1={125} x2={x} y2={166} couleur={BLEU} epaisseur={1.6} tete={7} /> : null}
        </g>
      ))}
      <Cote x1={580} y1={170} x2={580} y2={70} decalage={-16} texte={`H = ${n2(H)} m`} />
      <Etiquette x={50} y={124} taille={12} gras couleur={TERRE}>
        argile saturée
      </Etiquette>
      <Etiquette x={50} y={64} taille={10.5}>
        sable drainant
      </Etiquette>
      <Etiquette x={50} y={184} taille={10.5}>
        {double ? 'sable drainant' : 'sol imperméable'}
      </Etiquette>
      <Etiquette x={300} y={14} ancre="middle" taille={11} gras>
        remblai
      </Etiquette>
    </Figure>
  );
}

/** Degré de consolidation moyen en fonction du facteur temps. */
export function CourbeConsolidation({ Tv }: { Tv?: number }) {
  const R = repere2D({ x0: 70, y0: 20, l: 480, h: 160, xmin: 0, xmax: 1.2, ymin: 0, ymax: 100 });
  return (
    <Figure alt={`Degré de consolidation moyen U en fonction du facteur temps Tv : 50 % pour Tv ≈ 0,2, 90 % pour Tv ≈ 0,85. La courbe monte vite puis s'aplatit : les derniers centimètres de tassement sont les plus longs.${Tv !== undefined ? ` Ici Tv = ${n2(Tv)}, U = ${nombre(degreConsolidation(Tv) * 100, 0)} %.` : ''}`} largeur={620} hauteur={225}>
      <Axes R={R} gradX={[0.2, 0.4, 0.6, 0.8, 1, 1.2]} gradY={[25, 50, 75, 100]} titreX="Tv" titreY="U (%)" decX={1} grille />
      <Courbe R={R} f={(t) => degreConsolidation(t) * 100} de={0} a={1.2} couleur={BLEU} epaisseur={2.2} n={200} />
      {Tv !== undefined ? (
        <g>
          <circle cx={R.X(Tv)} cy={R.Y(degreConsolidation(Tv) * 100)} r={5} fill={ROUGE} />
          <Etiquette x={R.X(Tv) + 8} y={R.Y(degreConsolidation(Tv) * 100) + 16} taille={11.5} gras couleur={ROUGE}>
            {`Tv = ${n2(Tv)} : U = ${nombre(degreConsolidation(Tv) * 100, 0)} %`}
          </Etiquette>
        </g>
      ) : null}
    </Figure>
  );
}

/** Trois équations aux dérivées partielles du génie civil. */
export function TroisEDP() {
  const bloc = (x: number, t: string, eq: string, ex: string, c: string) => (
    <g>
      <rect x={x} y={20} width={180} height={130} rx={8} fill="var(--color-papier)" stroke={c} strokeWidth={1.4} />
      <Etiquette x={x + 90} y={44} ancre="middle" taille={13} gras couleur={c}>
        {t}
      </Etiquette>
      <Etiquette x={x + 90} y={80} ancre="middle" taille={13}>
        {eq}
      </Etiquette>
      {ex.split('|').map((l, i) => (
        <Etiquette key={i} x={x + 90} y={112 + i * 16} ancre="middle" taille={10.5}>
          {l}
        </Etiquette>
      ))}
    </g>
  );
  return (
    <Figure alt="Trois équations aux dérivées partielles : l'équation de la chaleur, ∂T/∂t = a ∂²T/∂x², qui décrit la diffusion de la chaleur dans un béton massif ; l'équation des ondes, ∂²u/∂t² = c² ∂²u/∂x², qui décrit les vibrations d'un câble ou les ondes sismiques ; l'équation de la consolidation, de même forme que la chaleur, qui décrit l'eau qui quitte une argile." largeur={620} hauteur={170}>
      {bloc(15, 'chaleur', '∂T/∂t = a ∂²T/∂x²', 'béton massif qui|chauffe et refroidit', ROUGE)}
      {bloc(220, 'ondes', '∂²u/∂t² = c² ∂²u/∂x²', 'câbles, haubans,|ondes sismiques', BLEU)}
      {bloc(425, 'consolidation', '∂u/∂t = cv ∂²u/∂z²', 'argile qui se tasse|sous un remblai', TERRE)}
    </Figure>
  );
}

/** Château d'eau : cuve sur tour, conduite de sortie. */
export function ChateauEau({ D, h0 }: { D: number; h0: number }) {
  return (
    <Figure alt={`Un château d'eau : une cuve cylindrique de ${n2(D)} m de diamètre, remplie sur ${n2(h0)} m, posée sur une tour. On ouvre la vanne de vidange au fond de la cuve pour l'inspecter : combien de temps faut-il pour qu'elle se vide ?`} largeur={620} hauteur={240}>
      <Hachures prefixe="ce" types={['eau', 'ba']} />
      <rect x={200} y={20} width={220} height={100} fill="var(--color-beton-clair)" className="t-fort" />
      <rect x={206} y={46} width={208} height={70} fill={hachure('ce', 'eau')} />
      <rect x={270} y={120} width={20} height={110} fill={hachure('ce', 'ba')} className="t-moyen" />
      <rect x={330} y={120} width={20} height={110} fill={hachure('ce', 'ba')} className="t-moyen" />
      <path d="M310 120 V200 H470" fill="none" stroke={BLEU} strokeWidth={4} />
      <circle cx={440} cy={200} r={7} fill="var(--color-papier)" stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={452} y={192} taille={11} gras couleur={ROUGE}>
        vanne
      </Etiquette>
      <line x1={120} y1={230} x2={500} y2={230} className="t-fort" />
      <Cote x1={200} y1={20} x2={420} y2={20} decalage={14} texte={`D = ${n2(D)} m`} />
      <Cote x1={420} y1={116} x2={420} y2={46} decalage={-18} texte={`${n2(h0)} m`} />
    </Figure>
  );
}
