// Schémas du module L1.8 (topographie I) : coordonnées, distances, station totale, nivellement, gisements,
// erreurs, lever et plan coté. Les valeurs viennent de lib/calc/topographie.ts, directement ou par les props.
import { useId } from 'react';
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure, Renvoi } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { Nord } from '@/components/drawing/Reperes';
import { gradEnRad, problemeInverse, surfacePolygone, type Point2D } from '@/lib/calc/topographie';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const n4 = (x: number) => nombre(x, 4);

/** Mire graduée verticale, pied en (x, y), lecture marquée. */
function Mire({ x, y, h = 140, lecture, k }: { x: number; y: number; h?: number; lecture?: number; k: number }) {
  return (
    <g>
      <rect x={x - 5} y={y - h} width={10} height={h} fill="var(--color-papier)" className="t-moyen" />
      {Array.from({ length: Math.floor(h / (0.1 * k)) }, (_, i) => (
        <rect key={i} x={x - 5} y={y - (i + 1) * 0.1 * k} width={5} height={0.05 * k} fill={i % 10 === 9 ? ROUGE : 'var(--trait)'} />
      ))}
      {lecture !== undefined ? <line x1={x - 10} y1={y - lecture * k} x2={x + 10} y2={y - lecture * k} stroke={BLEU} strokeWidth={1.6} /> : null}
    </g>
  );
}

/** Niveau optique sur trépied, lunette à la hauteur y0. */
function NiveauOptique({ x, ysol, yv }: { x: number; ysol: number; yv: number }) {
  return (
    <g>
      <path d={`M${x} ${yv + 8} L${x - 16} ${ysol} M${x} ${yv + 8} L${x + 16} ${ysol} M${x} ${yv + 8} L${x} ${ysol}`} className="t-moyen" />
      <rect x={x - 14} y={yv - 5} width={28} height={10} rx={3} fill="var(--color-beton)" />
    </g>
  );
}

// ---------- L1.8.1 ----------

/** Un point se repère par trois nombres : E, N (en plan) et Z (altitude). */
export function TroisCoordonnees({ E, N, Z }: { E: number; N: number; Z: number }) {
  const O: [number, number] = [120, 190];
  const P: [number, number] = [380, 120];
  return (
    <Figure alt={`Un point se repère par trois nombres : son abscisse E vers l'est (${n2(E)} m), son ordonnée N vers le nord (${n2(N)} m), et son altitude Z au-dessus du niveau de la mer (${n2(Z)} m).`} largeur={620} hauteur={230}>
      <Fleche x1={O[0]} y1={O[1]} x2={560} y2={O[1]} couleur="var(--trait)" epaisseur={1.4} tete={8} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + 120} y2={O[1] - 120} couleur="var(--trait)" epaisseur={1.4} tete={8} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0]} y2={30} couleur="var(--trait)" epaisseur={1.4} tete={8} />
      <Etiquette x={566} y={O[1] + 4} taille={12} gras>
        E
      </Etiquette>
      <Etiquette x={O[0] + 126} y={O[1] - 124} taille={12} gras>
        N
      </Etiquette>
      <Etiquette x={O[0] - 8} y={30} ancre="end" taille={12} gras>
        Z
      </Etiquette>
      <line x1={P[0]} y1={P[1]} x2={P[0]} y2={P[1] + 50} stroke={VERT} strokeWidth={1.6} strokeDasharray="4 3" />
      <line x1={P[0]} y1={P[1] + 50} x2={P[0] - 50} y2={O[1]} stroke={BLEU} strokeDasharray="4 3" />
      <line x1={P[0]} y1={P[1] + 50} x2={O[0] + 50} y2={P[1] + 50} stroke={BLEU} strokeDasharray="4 3" />
      <circle cx={P[0]} cy={P[1]} r={6} fill={ROUGE} />
      <Etiquette x={P[0] + 10} y={P[1] - 22} taille={12} gras couleur={ROUGE}>
        P
      </Etiquette>
      {[`E = ${n2(E)} m`, `N = ${n2(N)} m`, `Z = ${n2(Z)} m`].map((t, i) => (
        <Etiquette key={t} x={430} y={40 + i * 18} taille={11.5} gras couleur={ROUGE}>
          {t}
        </Etiquette>
      ))}
      <Etiquette x={P[0] + 6} y={P[1] + 30} taille={11} couleur={VERT}>
        Z : altitude
      </Etiquette>
    </Figure>
  );
}

/** Les fuseaux UTM : la Terre découpée en 60 tranches de 6°. La RDC est sur les fuseaux 33 à 35. */
export function FuseauxUTM() {
  const x0 = 40;
  const w = 540 / 12;
  const fuseaux = Array.from({ length: 12 }, (_, i) => 27 + i);
  return (
    <Figure alt="Les fuseaux UTM : la Terre est découpée en 60 tranches de 6° de longitude ; chacune est mise à plat séparément, avec son méridien central. Entre 24° ouest et 48° est figurent les fuseaux 27 à 38 ; la RDC, entre 12° et 31° est environ, s'étend sur les fuseaux 33, 34 et 35." largeur={620} hauteur={200}>
      {fuseaux.map((f, i) => {
        const rdc = f >= 33 && f <= 35;
        return (
          <g key={f}>
            <path d={`M${x0 + i * w + w / 2} 24 Q${x0 + i * w} 100 ${x0 + i * w + w / 2} 176 Q${x0 + (i + 1) * w} 100 ${x0 + i * w + w / 2} 24`} fill={rdc ? 'var(--color-encre-clair)' : 'var(--color-papier)'} stroke={rdc ? BLEU : 'var(--trait-doux)'} strokeWidth={rdc ? 1.4 : 0.8} />
            <line x1={x0 + i * w + w / 2} y1={24} x2={x0 + i * w + w / 2} y2={176} className="t-axe" />
            <Etiquette x={x0 + i * w + w / 2} y={194} ancre="middle" taille={10} gras={rdc} couleur={rdc ? BLEU : undefined}>
              {String(f)}
            </Etiquette>
          </g>
        );
      })}
      <line x1={x0} y1={100} x2={x0 + 540} y2={100} stroke={ROUGE} strokeWidth={0.8} />
      <Etiquette x={x0 + 4} y={96} taille={10} couleur={ROUGE}>
        équateur
      </Etiquette>
      <Etiquette x={x0 + 7 * w} y={16} ancre="middle" taille={11} gras couleur={BLEU}>
        RDC : fuseaux 33 à 35
      </Etiquette>
    </Figure>
  );
}

/** Coordonnées locales d'un chantier rattachées aux coordonnées UTM. */
export function RepereLocal() {
  return (
    <Figure alt="Sur un chantier, on travaille souvent dans un repère local : une origine proche, des coordonnées de quelques dizaines de mètres. Le géomètre rattache ce repère au système national (UTM) par deux bornes de coordonnées connues dans les deux systèmes." largeur={620} hauteur={200}>
      <rect x={40} y={20} width={540} height={160} fill="var(--color-terre-clair)" opacity={0.4} />
      <Fleche x1={140} y1={160} x2={300} y2={160} couleur={BLEU} epaisseur={1.6} tete={8} />
      <Fleche x1={140} y1={160} x2={140} y2={60} couleur={BLEU} epaisseur={1.6} tete={8} />
      <Etiquette x={306} y={164} taille={11} gras couleur={BLEU}>
        x local
      </Etiquette>
      <Etiquette x={146} y={58} taille={11} gras couleur={BLEU}>
        y local
      </Etiquette>
      <rect x={200} y={90} width={100} height={50} fill="none" className="t-fort" />
      {[
        [140, 160, 'B1'],
        [480, 60, 'B2'],
      ].map(([x, y, t]) => (
        <g key={t as string}>
          <polygon points={points([[(x as number) - 6, (y as number) + 6], [(x as number) + 6, (y as number) + 6], [x as number, (y as number) - 6]])} fill={ROUGE} />
          <Etiquette x={(x as number) + 8} y={(y as number) - 6} taille={11} gras couleur={ROUGE}>
            {t as string}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={360} y={130} taille={11}>
        bornes connues en UTM et en local
      </Etiquette>
      <Nord x={540} y={150} taille={12} />
    </Figure>
  );
}

// ---------- L1.8.2 ----------

/** Mesure en pente : la distance inclinée est plus longue que la distance horizontale. */
export function PenteRuban({ Lcorr, dh, Dh }: { Lcorr: number; dh: number; Dh: number }) {
  const k = 9;
  const ex = 30;
  const A: [number, number] = [70, 160];
  const B: [number, number] = [70 + Dh * k, 160 - dh * k * ex / 10];
  return (
    <Figure alt={`Un ruban tendu en pente entre A et B mesure ${n3(Lcorr)} m ; la dénivelée vaut ${n2(dh)} m ; la distance horizontale, celle qu'on reporte sur le plan, vaut ${n3(Dh)} m, un peu moins. Pente exagérée sur le dessin.`} largeur={620} hauteur={200}>
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={ROUGE} strokeWidth={2.4} />
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={A[1]} className="t-moyen" strokeDasharray="5 3" />
      <line x1={B[0]} y1={B[1]} x2={B[0]} y2={A[1]} className="t-moyen" strokeDasharray="5 3" />
      <Etiquette x={(A[0] + B[0]) / 2} y={(A[1] + B[1]) / 2 - 10} ancre="middle" taille={12} gras couleur={ROUGE}>
        {`mesuré : ${n3(Lcorr)} m`}
      </Etiquette>
      <Etiquette x={(A[0] + B[0]) / 2} y={A[1] + 20} ancre="middle" taille={12} gras couleur={BLEU}>
        {`horizontale : ${n3(Dh)} m`}
      </Etiquette>
      <Etiquette x={B[0] + 8} y={(A[1] + B[1]) / 2} taille={12} gras couleur={VERT}>
        {`Δh = ${n2(dh)} m`}
      </Etiquette>
      <Etiquette x={A[0] - 8} y={A[1] + 4} ancre="end" taille={12} gras>
        A
      </Etiquette>
      <Etiquette x={B[0] + 8} y={B[1]} taille={12} gras>
        B
      </Etiquette>
      <Etiquette x={60} y={190} taille={10.5} classe="etiquette">
        pente exagérée
      </Etiquette>
    </Figure>
  );
}

/** Trois façons de mesurer une distance : ruban, distancemètre, GNSS. */
export function TroisInstruments() {
  const item = (x: number, t: string, s: string, c: string) => (
    <g>
      <rect x={x} y={30} width={170} height={110} rx={8} fill="var(--color-papier)" stroke={c} strokeWidth={1.4} />
      <Etiquette x={x + 85} y={58} ancre="middle" taille={13} gras couleur={c}>
        {t}
      </Etiquette>
      {s.split('|').map((l, i) => (
        <Etiquette key={i} x={x + 85} y={84 + i * 18} ancre="middle" taille={11}>
          {l}
        </Etiquette>
      ))}
    </g>
  );
  return (
    <Figure alt="Trois outils de mesure des distances. Le ruban : simple, quelques centimètres sur 50 m si l'on corrige. Le distancemètre de la station totale : une onde lumineuse renvoyée par un prisme, quelques millimètres sur plusieurs centaines de mètres. Le GNSS : des satellites, centimétrique en mode différentiel." largeur={620} hauteur={170}>
      {item(20, 'ruban', 'acier, 20 à 50 m|corrections : étalon,|température, pente', TERRE)}
      {item(225, 'distancemètre', 'onde lumineuse + prisme|millimétrique|centaines de mètres', BLEU)}
      {item(430, 'GNSS', 'satellites|centimétrique en différentiel|ciel dégagé', VERT)}
    </Figure>
  );
}

/** Le ruban s'allonge à la chaleur : une mesure par 34 °C est trop courte sans correction. */
export function RubanChaleur({ cTemp, T }: { cTemp: number; T: number }) {
  return (
    <Figure alt={`Le ruban d'acier a été étalonné à 20 °C. Par ${T} °C, il s'allonge : ses graduations s'écartent, et la longueur lue est trop petite. On ajoute la correction de température, ici ${nombre(cTemp * 1000, 1)} mm.`} largeur={620} hauteur={140}>
      <rect x={40} y={40} width={500} height={14} fill="var(--color-terre-clair)" className="t-moyen" />
      <rect x={40} y={86} width={520} height={14} fill="var(--color-correction-clair)" stroke={ROUGE} />
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <line x1={40 + i * 50} y1={40} x2={40 + i * 50} y2={50} className="t-fin" />
          <line x1={40 + i * 52} y1={86} x2={40 + i * 52} y2={96} stroke={ROUGE} strokeWidth={0.8} />
        </g>
      ))}
      <Etiquette x={40} y={30} taille={11.5} gras>
        ruban à 20 °C (étalonnage)
      </Etiquette>
      <Etiquette x={40} y={120} taille={11.5} gras couleur={ROUGE}>
        {`ruban à ${T} °C : plus long, la mesure lue est trop courte (+${nombre(cTemp * 1000, 1)} mm à ajouter)`}
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.8.3 ----------

/** Le cercle en grades : 400 gon, l'angle droit vaut 100 gon. */
export function CercleGrades() {
  const c: [number, number] = [160, 110];
  const r = 80;
  const p = (g: number) => [c[0] + r * Math.sin(gradEnRad(g)), c[1] - r * Math.cos(gradEnRad(g))] as const;
  return (
    <Figure alt="Le cercle complet vaut 400 grades (gon). Le nord est à 0, l'est à 100, le sud à 200, l'ouest à 300 : on compte dans le sens des aiguilles d'une montre, comme les instruments. Un angle droit vaut 100 gon, soit 90°." largeur={620} hauteur={220}>
      <circle cx={c[0]} cy={c[1]} r={r} fill="none" className="t-moyen" />
      {[0, 100, 200, 300].map((g) => {
        const [x, y] = p(g);
        const [lx, ly] = [c[0] + (r + 18) * Math.sin(gradEnRad(g)), c[1] - (r + 18) * Math.cos(gradEnRad(g))];
        return (
          <g key={g}>
            <line x1={c[0]} y1={c[1]} x2={x} y2={y} className="t-fin" />
            <Etiquette x={lx} y={ly + 4} ancre="middle" taille={12} gras>
              {`${g}`}
            </Etiquette>
          </g>
        );
      })}
      <path d={`M${c[0]} ${c[1] - 40} A40 40 0 0 1 ${c[0] + 40} ${c[1]}`} fill="none" stroke={BLEU} strokeWidth={1.6} />
      <Etiquette x={c[0] + 26} y={c[1] - 26} taille={11} gras couleur={BLEU}>
        100 gon
      </Etiquette>
      {[
        ['400 gon', '360°', 'tour complet'],
        ['100 gon', '90°', 'angle droit'],
        ['1 gon', '0,9°', ''],
        ['0,0001 gon', '0,3″', 'lecture d’une station totale'],
      ].map(([a, b, t], i) => (
        <g key={a}>
          <Etiquette x={330} y={50 + i * 34} taille={12.5} gras couleur={BLEU}>
            {a}
          </Etiquette>
          <Etiquette x={440} y={50 + i * 34} taille={12.5}>
            {`= ${b}`}
          </Etiquette>
          <Etiquette x={330} y={66 + i * 34} taille={10} classe="etiquette">
            {t}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Station totale : angle horizontal Hz, angle zénithal V, distance inclinée Di vers un prisme. */
export function StationTotale({ Di, V, hi, hp, Dh, dh }: { Di: number; V: number; hi: number; hp: number; Dh: number; dh: number }) {
  // visée plongeante : on remonte la station pour que le point bas reste dans le cadre
  const ys = 190 + Math.min(0, dh) * 18;
  const xs = 80;
  const kx = 5;
  const ky = 18;
  const S: [number, number] = [xs, ys - hi * ky];
  const xp = xs + Dh * kx;
  const ypSol = ys - dh * ky;
  const P: [number, number] = [xp, ypSol - hp * ky];
  return (
    <Figure alt={`La station totale, à ${n2(hi)} m au-dessus de son point, vise un prisme porté à ${n2(hp)} m au-dessus du point B. Elle mesure la distance inclinée Di = ${n3(Di)} m et l'angle zénithal V = ${n4(V)} gon, compté depuis la verticale. On en tire la distance horizontale Dh = ${n3(Dh)} m et la dénivelée entre les points au sol, ${n3(dh)} m.`} largeur={620} hauteur={230}>
      <path d={`M${xs - 30} ${ys} L${xp + 40} ${ypSol}`} className="t-fort" />
      <path d={`M${xs} ${S[1]} L${xs - 14} ${ys} M${xs} ${S[1]} L${xs + 14} ${ys}`} className="t-moyen" />
      <rect x={xs - 9} y={S[1] - 14} width={18} height={14} rx={2} fill="var(--color-beton)" />
      <line x1={xp} y1={ypSol} x2={P[0]} y2={P[1]} stroke={ROUGE} strokeWidth={2} />
      <circle cx={P[0]} cy={P[1]} r={5} fill={ROUGE} />
      <line x1={S[0]} y1={S[1] - 7} x2={P[0]} y2={P[1]} stroke={BLEU} strokeWidth={1.6} />
      <line x1={S[0]} y1={S[1] - 7} x2={S[0]} y2={20} className="t-axe" />
      <line x1={S[0]} y1={S[1] - 7} x2={xp + 30} y2={S[1] - 7} className="t-fin" strokeDasharray="4 3" />
      <path d={`M${S[0]} ${S[1] - 57} A50 50 0 0 1 ${S[0] + 50 * Math.sin(gradEnRad(V))} ${S[1] - 7 - 50 * Math.cos(gradEnRad(V))}`} fill="none" stroke={VERT} strokeWidth={1.4} />
      <Etiquette x={S[0] + 16} y={S[1] - 62} taille={11.5} gras couleur={VERT}>
        {`V = ${n4(V)} gon`}
      </Etiquette>
      <Etiquette x={(S[0] + P[0]) / 2} y={(S[1] + P[1]) / 2 - 12} ancre="middle" taille={11.5} gras couleur={BLEU}>
        {`Di = ${n3(Di)} m`}
      </Etiquette>
      <Cote x1={xs} y1={Math.max(ys, ypSol) + 10} x2={xp} y2={Math.max(ys, ypSol) + 10} texte={`Dh = ${n3(Dh)}`} />
      <Etiquette x={xs - 18} y={S[1]} ancre="end" taille={11}>
        {`hi ${n2(hi)}`}
      </Etiquette>
      <Etiquette x={xp + 10} y={(ypSol + P[1]) / 2} taille={11}>
        {`hp ${n2(hp)}`}
      </Etiquette>
      <Etiquette x={xs - 4} y={ys + 4} ancre="end" taille={12} gras>
        A
      </Etiquette>
      <Etiquette x={xp + 6} y={ypSol + 16} taille={12} gras>
        B
      </Etiquette>
    </Figure>
  );
}

/** Lecture d'un angle horizontal : deux directions, une soustraction. */
export function AngleDeuxDirections({ gauche, droite }: { gauche: number; droite: number }) {
  const c: [number, number] = [310, 170];
  const r = 130;
  const p = (g: number) => [c[0] + r * Math.sin(gradEnRad(g)), c[1] - r * Math.cos(gradEnRad(g))] as const;
  const a = ((droite - gauche) % 400 + 400) % 400;
  const [x1, y1] = p(gauche);
  const [x2, y2] = p(droite);
  return (
    <Figure alt={`Depuis la station, on vise A puis B. Le cercle horizontal donne ${n4(gauche)} gon sur A et ${n4(droite)} gon sur B. L'angle AÔB vaut la lecture de droite moins la lecture de gauche : ${n4(a)} gon.`} largeur={620} hauteur={200}>
      <line x1={c[0]} y1={c[1]} x2={x1} y2={y1} stroke={BLEU} strokeWidth={1.6} />
      <line x1={c[0]} y1={c[1]} x2={x2} y2={y2} stroke={BLEU} strokeWidth={1.6} />
      <path d={`M${c[0] + 50 * Math.sin(gradEnRad(gauche))} ${c[1] - 50 * Math.cos(gradEnRad(gauche))} A50 50 0 0 1 ${c[0] + 50 * Math.sin(gradEnRad(droite))} ${c[1] - 50 * Math.cos(gradEnRad(droite))}`} fill="none" stroke={VERT} strokeWidth={1.6} />
      <circle cx={c[0]} cy={c[1]} r={5} fill="var(--trait)" />
      <Etiquette x={x1 - 6} y={y1} ancre="end" taille={12} gras>
        {`A : ${n4(gauche)}`}
      </Etiquette>
      <Etiquette x={x2 + 6} y={y2} taille={12} gras>
        {`B : ${n4(droite)}`}
      </Etiquette>
      <Etiquette x={c[0]} y={c[1] - 60} ancre="middle" taille={12} gras couleur={VERT}>
        {`${n4(a)} gon`}
      </Etiquette>
      <Etiquette x={c[0]} y={c[1] + 20} ancre="middle" taille={11}>
        station
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.8.4 ----------

/** Nivellement direct : une visée arrière, une visée avant, une dénivelée. */
export function NivellementDirect({ AR, AV, ZA }: { AR: number; AV: number; ZA: number }) {
  // identifiant propre à chaque figure : une page peut en contenir plusieurs
  const p = `nvd${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const k = 60;
  const ysolA = 200;
  const ysolB = ysolA - (AR - AV) * k;
  const yv = ysolA - AR * k;
  return (
    <Figure alt={`Nivellement direct : le niveau, placé entre A et B, donne une visée horizontale. Sur la mire posée en A, on lit ${n3(AR)} m (lecture arrière) ; sur la mire en B, ${n3(AV)} m (lecture avant). La dénivelée vaut AR − AV = ${n3(AR - AV)} m : B est ${AR > AV ? 'plus haut' : 'plus bas'} que A. Si A est à ${n3(ZA)} m, B est à ${n3(ZA + AR - AV)} m.`} largeur={620} hauteur={230}>
      <Hachures prefixe={p} types={['terre']} />
      <path d={`M40 ${ysolA} L160 ${ysolA} Q 310 ${ysolA} 460 ${ysolB} L580 ${ysolB} L580 225 L40 225 Z`} fill={hachure(p, 'terre')} />
      <path d={`M40 ${ysolA} L160 ${ysolA} Q 310 ${ysolA} 460 ${ysolB} L580 ${ysolB}`} className="t-fort" fill="none" />
      <Mire x={130} y={ysolA} h={AR * k + 30} lecture={AR} k={k} />
      <Mire x={490} y={ysolB} h={AV * k + 30} lecture={AV} k={k} />
      <NiveauOptique x={310} ysol={ysolA - 2} yv={yv} />
      <line x1={130} y1={yv} x2={490} y2={yv} stroke={BLEU} strokeWidth={1.2} strokeDasharray="6 3" />
      <Etiquette x={100} y={yv - 6} ancre="end" taille={12} gras couleur={BLEU}>
        {`AR = ${n3(AR)}`}
      </Etiquette>
      <Etiquette x={520} y={yv - 6} taille={12} gras couleur={BLEU}>
        {`AV = ${n3(AV)}`}
      </Etiquette>
      <Etiquette x={130} y={ysolA + 16} ancre="middle" taille={12} gras>
        A
      </Etiquette>
      <Etiquette x={490} y={ysolB + 16} ancre="middle" taille={12} gras>
        B
      </Etiquette>
      <Etiquette x={310} y={30} ancre="middle" taille={12.5} gras couleur={VERT}>
        {`Δh = AR − AV = ${n3(AR - AV)} m`}
      </Etiquette>
    </Figure>
  );
}

/** Une mire et sa lecture au millimètre : décimètres chiffrés, centimètres en damier, millimètres estimés. */
export function LectureMire({ lecture }: { lecture: number }) {
  const k = 1400;
  const base = Math.floor(lecture * 10) / 10 - 0.05;
  const y = (v: number) => 180 - (v - base) * k;
  return (
    <Figure alt={`Une mire vue dans la lunette : les décimètres sont chiffrés, les centimètres alternent noir et blanc, le millimètre s'estime à l'œil. Le fil horizontal du réticule coupe la mire à ${n3(lecture)} m.`} largeur={620} hauteur={200}>
      <rect x={260} y={10} width={80} height={180} fill="var(--color-papier)" className="t-moyen" />
      {Array.from({ length: 16 }, (_, i) => {
        const v = base + i * 0.01;
        return <rect key={i} x={260} y={y(v + 0.01)} width={30} height={0.01 * k} fill={Math.round(v * 100) % 2 === 0 ? 'var(--trait)' : 'var(--color-papier)'} />;
      })}
      {[0, 1].map((i) => {
        const d = Math.ceil(base * 10) / 10 + i * 0.1;
        return (
          <Etiquette key={i} x={300} y={y(d) - 4} taille={16} gras couleur={ROUGE}>
            {nombre(d * 10, 0)}
          </Etiquette>
        );
      })}
      <circle cx={300} cy={100} r={92} fill="none" stroke="var(--trait)" strokeWidth={3} opacity={0.5} />
      <line x1={190} y1={y(lecture)} x2={410} y2={y(lecture)} stroke={BLEU} strokeWidth={1.4} />
      <Etiquette x={420} y={y(lecture) + 4} taille={13} gras couleur={BLEU}>
        {`lecture : ${n3(lecture)} m`}
      </Etiquette>
      <Etiquette x={40} y={60} taille={11}>
        chiffres rouges : décimètres
      </Etiquette>
      <Etiquette x={40} y={80} taille={11}>
        damier : centimètres
      </Etiquette>
      <Etiquette x={40} y={100} taille={11}>
        millimètre : estimé
      </Etiquette>
    </Figure>
  );
}

/** Portées égales : le niveau au milieu annule l'erreur d'inclinaison de la visée. */
export function PorteesEgales() {
  return (
    <Figure alt="Si la ligne de visée du niveau est un peu inclinée, l'erreur sur chaque lecture est proportionnelle à la distance. En plaçant le niveau à égale distance des deux mires, l'erreur est la même en arrière et en avant : elle s'annule dans la différence AR − AV." largeur={620} hauteur={170}>
      <line x1={40} y1={140} x2={580} y2={140} className="t-fort" />
      <Mire x={100} y={140} h={110} k={60} />
      <Mire x={520} y={140} h={110} k={60} />
      <NiveauOptique x={310} ysol={138} yv={70} />
      <line x1={310} y1={70} x2={100} y2={58} stroke={ROUGE} strokeWidth={1.2} />
      <line x1={310} y1={70} x2={520} y2={58} stroke={ROUGE} strokeWidth={1.2} />
      <line x1={100} y1={70} x2={520} y2={70} stroke={BLEU} strokeWidth={1} strokeDasharray="5 3" />
      <Cote x1={100} y1={140} x2={310} y2={140} decalage={-14} texte="d" />
      <Cote x1={310} y1={140} x2={520} y2={140} decalage={-14} texte="d" />
      <Etiquette x={110} y={50} taille={11} couleur={ROUGE}>
        erreur e
      </Etiquette>
      <Etiquette x={460} y={50} taille={11} couleur={ROUGE}>
        erreur e
      </Etiquette>
      <Etiquette x={310} y={24} ancre="middle" taille={12} gras couleur={VERT}>
        (AR + e) − (AV + e) = AR − AV
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.8.5 ----------

/** Profil d'un cheminement de nivellement : points, dénivelées, altitudes. */
export function ProfilCheminement({ points: pts }: { points: ReadonlyArray<{ nom: string; Z: number }> }) {
  const Zs = pts.map((p) => p.Z);
  const zmin = Math.min(...Zs);
  const zmax = Math.max(...Zs);
  const k = 120 / Math.max(zmax - zmin, 0.5);
  const X = (i: number) => 60 + (i * 500) / (pts.length - 1);
  const Y = (z: number) => 170 - (z - zmin) * k;
  return (
    <Figure alt={`Le cheminement de nivellement, de point en point : ${pts.map((p) => `${p.nom} à ${n3(p.Z)} m`).join(', ')}. Il part d'un repère d'altitude connue et revient sur lui : c'est un cheminement fermé.`} largeur={620} hauteur={210}>
      <polyline points={points(pts.map((p, i) => [X(i), Y(p.Z)] as const))} fill="none" className="t-fort" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={X(i)} cy={Y(p.Z)} r={5} fill={i === 0 || i === pts.length - 1 ? ROUGE : BLEU} />
          <Etiquette x={X(i)} y={Y(p.Z) - 10} ancre="middle" taille={11.5} gras>
            {p.nom}
          </Etiquette>
          <Etiquette x={X(i)} y={196} ancre="middle" taille={10.5}>
            {n3(p.Z)}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Une fermeture comparée à sa tolérance. */
export function FermetureTolerance({ f, T }: { f: number; T: number }) {
  const X = (v: number) => 310 + (v / (1.6 * T)) * 240;
  const ok = Math.abs(f) <= T;
  return (
    <Figure alt={`La fermeture du cheminement vaut ${nombre(f * 1000, 1)} mm ; la tolérance est de ± ${nombre(T * 1000, 1)} mm. La fermeture ${ok ? 'reste dans la bande : on peut compenser' : 'sort de la bande : on recommence la mesure'}.`} largeur={620} hauteur={120}>
      <line x1={50} y1={60} x2={570} y2={60} className="t-moyen" />
      <rect x={X(-T)} y={46} width={X(T) - X(-T)} height={28} fill="var(--color-validation-clair)" stroke={VERT} />
      <line x1={X(0)} y1={40} x2={X(0)} y2={80} stroke={VERT} />
      <circle cx={X(f)} cy={60} r={6} fill={ok ? VERT : ROUGE} />
      <Etiquette x={X(-T)} y={96} ancre="middle" taille={11}>
        {`−${nombre(T * 1000, 0)} mm`}
      </Etiquette>
      <Etiquette x={X(T)} y={96} ancre="middle" taille={11}>
        {`+${nombre(T * 1000, 0)} mm`}
      </Etiquette>
      <Etiquette x={X(f)} y={34} ancre="middle" taille={12} gras couleur={ok ? VERT : ROUGE}>
        {`fermeture ${nombre(f * 1000, 1)} mm`}
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.8.6 ----------

/** Gisement : angle depuis le nord, dans le sens horaire, de 0 à 400 gon. */
export function GisementSchema({ A, B, nomA = 'A', nomB = 'B' }: { A: Point2D; B: Point2D; nomA?: string; nomB?: string }) {
  const r = problemeInverse(A, B);
  const k = 150 / Math.max(Math.abs(r.dE), Math.abs(r.dN), 1);
  const O: [number, number] = [310, 115];
  const P: [number, number] = [O[0] + r.dE * k, O[1] - r.dN * k];
  const ga = gradEnRad(r.G);
  const large = r.G > 200 ? 1 : 0;
  return (
    <Figure alt={`Le gisement de ${nomA} vers ${nomB} est l'angle compté depuis la direction du nord, dans le sens des aiguilles d'une montre : ${n4(r.G)} gon. ΔE = ${n3(r.dE)} m, ΔN = ${n3(r.dN)} m, distance ${n3(r.D)} m.`} largeur={620} hauteur={240}>
      <Fleche x1={O[0]} y1={O[1] + 100} x2={O[0]} y2={14} couleur="var(--trait)" epaisseur={1.2} tete={8} />
      <Etiquette x={O[0] + 6} y={20} taille={12} gras>
        N
      </Etiquette>
      <line x1={O[0] - 160} y1={O[1]} x2={O[0] + 170} y2={O[1]} className="t-fin" />
      <Etiquette x={O[0] + 172} y={O[1] + 4} taille={12} gras>
        E
      </Etiquette>
      <line x1={O[0]} y1={O[1]} x2={P[0]} y2={P[1]} stroke={BLEU} strokeWidth={2} />
      <path d={`M${O[0]} ${O[1] - 44} A44 44 0 ${large} 1 ${O[0] + 44 * Math.sin(ga)} ${O[1] - 44 * Math.cos(ga)}`} fill="none" stroke={VERT} strokeWidth={1.6} />
      <Etiquette x={O[0] + 52 * Math.sin(ga / 2 + (r.G > 200 ? Math.PI : 0) * 0)} y={O[1] - 52 * Math.cos(ga / 2)} taille={11.5} gras couleur={VERT}>
        {`G = ${n4(r.G)} gon`}
      </Etiquette>
      <line x1={P[0]} y1={P[1]} x2={P[0]} y2={O[1]} stroke={ROUGE} strokeDasharray="4 3" />
      <line x1={O[0]} y1={P[1]} x2={P[0]} y2={P[1]} stroke={ROUGE} strokeDasharray="4 3" />
      <circle cx={O[0]} cy={O[1]} r={4} fill="var(--trait)" />
      <circle cx={P[0]} cy={P[1]} r={4} fill={BLEU} />
      <Etiquette x={O[0] - 8} y={O[1] + 16} ancre="end" taille={12} gras>
        {nomA}
      </Etiquette>
      <Etiquette x={P[0] + 8} y={P[1] - 6} taille={12} gras couleur={BLEU}>
        {nomB}
      </Etiquette>
      <Etiquette x={(O[0] + P[0]) / 2} y={O[1] + 16} ancre="middle" taille={10.5} couleur={ROUGE}>
        {`ΔE ${n3(r.dE)}`}
      </Etiquette>
      <Etiquette x={P[0] + 6} y={(O[1] + P[1]) / 2} taille={10.5} couleur={ROUGE}>
        {`ΔN ${n3(r.dN)}`}
      </Etiquette>
    </Figure>
  );
}

/** Les quatre quadrants : le signe de ΔE et de ΔN dit dans quel quart se trouve le gisement. */
export function QuadrantsGisement() {
  const q: [string, string, string, number, number][] = [
    ['0 à 100', 'ΔE > 0', 'ΔN > 0', 1, -1],
    ['100 à 200', 'ΔE > 0', 'ΔN < 0', 1, 1],
    ['200 à 300', 'ΔE < 0', 'ΔN < 0', -1, 1],
    ['300 à 400', 'ΔE < 0', 'ΔN > 0', -1, -1],
  ];
  return (
    <Figure alt="Les quatre quadrants du gisement : de 0 à 100 gon, ΔE et ΔN positifs ; de 100 à 200, ΔE positif et ΔN négatif ; de 200 à 300, les deux négatifs ; de 300 à 400, ΔE négatif et ΔN positif. Les signes des écarts de coordonnées disent dans quel quart on se trouve." largeur={620} hauteur={220}>
      <line x1={310} y1={14} x2={310} y2={206} className="t-moyen" />
      <line x1={150} y1={110} x2={470} y2={110} className="t-moyen" />
      <Etiquette x={316} y={24} taille={12} gras>
        N (0)
      </Etiquette>
      <Etiquette x={474} y={114} taille={12} gras>
        E (100)
      </Etiquette>
      {q.map(([g, e, n, sx, sy]) => (
        <g key={g}>
          <Etiquette x={310 + sx * 80} y={110 + sy * 50} ancre="middle" taille={12} gras couleur={BLEU}>
            {`${g} gon`}
          </Etiquette>
          <Etiquette x={310 + sx * 80} y={110 + sy * 50 + 16} ancre="middle" taille={10.5}>
            {`${e}, ${n}`}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

// ---------- L1.8.7 ----------

/** Justesse et fidélité : quatre cibles. */
export function CiblesErreurs() {
  const cible = (x: number, pts: [number, number][], t: string) => (
    <g>
      {[44, 30, 16].map((r) => (
        <circle key={r} cx={x} cy={80} r={r} fill="none" className="t-fin" />
      ))}
      {pts.map(([dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={80 + dy} r={3.4} fill={ROUGE} />
      ))}
      {t.split('|').map((l, i) => (
        <Etiquette key={i} x={x} y={146 + i * 15} ancre="middle" taille={10.5}>
          {l}
        </Etiquette>
      ))}
    </g>
  );
  return (
    <Figure alt="Quatre cibles. Mesures groupées au centre : justes et fidèles. Groupées mais décalées : fidèles mais pas justes, une erreur systématique. Dispersées autour du centre : justes en moyenne mais peu fidèles, des erreurs accidentelles. Dispersées et décalées : ni l'un ni l'autre." largeur={620} hauteur={180}>
      {cible(80, [[-3, 2], [2, -3], [3, 3], [-2, -2], [1, 0]], 'juste et fidèle')}
      {cible(230, [[20, -18], [24, -15], [22, -21], [18, -16], [25, -19]], 'fidèle, pas juste|(systématique)')}
      {cible(380, [[-25, 10], [18, -22], [8, 26], [-14, -18], [26, 8]], 'juste en moyenne|(accidentelles)')}
      {cible(530, [[18, -28], [32, -6], [10, -12], [28, -30], [36, -18]], 'ni l’un ni l’autre')}
    </Figure>
  );
}

/** Une série de mesures autour de sa moyenne, avec la bande de tolérance. */
export function SerieMesures({ valeurs, moyenne, tol }: { valeurs: readonly number[]; moyenne: number; tol: number }) {
  const X = (v: number) => 310 + ((v - moyenne) / (1.5 * tol)) * 240;
  return (
    <Figure alt={`Les ${valeurs.length} mesures de la même distance se répartissent autour de leur moyenne, ${n3(moyenne)} m. La tolérance, ± ${nombre(tol * 1000, 1)} mm, définit une bande : une mesure hors de la bande serait une faute, à écarter et à refaire.`} largeur={620} hauteur={140}>
      <line x1={40} y1={70} x2={580} y2={70} className="t-moyen" />
      <rect x={X(moyenne - tol)} y={54} width={X(moyenne + tol) - X(moyenne - tol)} height={32} fill="var(--color-validation-clair)" stroke={VERT} />
      <line x1={X(moyenne)} y1={44} x2={X(moyenne)} y2={96} stroke={VERT} strokeWidth={1.6} />
      {valeurs.map((v, i) => (
        <circle key={i} cx={X(v)} cy={70 + (i % 2 ? 6 : -6)} r={5} fill={BLEU} />
      ))}
      <Etiquette x={X(moyenne)} y={38} ancre="middle" taille={11.5} gras couleur={VERT}>
        {`moyenne ${n3(moyenne)} m`}
      </Etiquette>
      <Etiquette x={X(moyenne + tol)} y={110} ancre="middle" taille={10.5}>
        {`+${nombre(tol * 1000, 1)} mm`}
      </Etiquette>
      <Etiquette x={X(moyenne - tol)} y={110} ancre="middle" taille={10.5}>
        {`−${nombre(tol * 1000, 1)} mm`}
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.8.8 et projet ----------

/** Lever par rayonnement : la station, les visées, les bornes, la parcelle. */
export function LeverRayonnementSchema({ S, pts, Gref }: { S: Point2D; pts: ReadonlyArray<Point2D & { nom: string; D: number }>; Gref: number }) {
  const tous = [S, ...pts];
  const Es = tous.map((p) => p.E);
  const Ns = tous.map((p) => p.N);
  const k = Math.min(400 / (Math.max(...Es) - Math.min(...Es)), 200 / (Math.max(...Ns) - Math.min(...Ns)));
  const X = (E: number) => 110 + (E - Math.min(...Es)) * k;
  const Y = (N: number) => 220 - (N - Math.min(...Ns)) * k;
  const s = surfacePolygone(pts);
  const gr = gradEnRad(Gref);
  return (
    <Figure alt={`Lever par rayonnement : depuis la station S, orientée sur une borne voisine (gisement ${n4(Gref)} gon), on vise chaque borne de la parcelle et l'on mesure angle et distance. Les coordonnées des bornes ${pts.map((p) => p.nom).join(', ')} en découlent ; la parcelle mesure ${n2(s.S)} m² pour un périmètre de ${n2(s.perimetre)} m.`} largeur={620} hauteur={250}>
      <polygon points={points(pts.map((p) => [X(p.E), Y(p.N)] as const))} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1.6} />
      {pts.map((p) => (
        <g key={p.nom}>
          <line x1={X(S.E)} y1={Y(S.N)} x2={X(p.E)} y2={Y(p.N)} stroke={BLEU} strokeDasharray="5 3" />
          <polygon points={points([[X(p.E) - 5, Y(p.N) + 5], [X(p.E) + 5, Y(p.N) + 5], [X(p.E), Y(p.N) - 5]])} fill={ROUGE} />
          <Etiquette x={X(p.E) + (p.E > S.E ? 8 : -8)} y={Y(p.N) + (p.N > S.N ? -6 : 16)} ancre={p.E > S.E ? 'start' : 'end'} taille={11.5} gras couleur={ROUGE}>
            {p.nom}
          </Etiquette>
        </g>
      ))}
      <Fleche x1={X(S.E)} y1={Y(S.N)} x2={X(S.E) + 70 * Math.sin(gr)} y2={Y(S.N) - 70 * Math.cos(gr)} couleur={VERT} epaisseur={1.4} tete={8} />
      <Etiquette x={X(S.E) + 74 * Math.sin(gr)} y={Y(S.N) - 74 * Math.cos(gr)} taille={10.5} couleur={VERT}>
        référence
      </Etiquette>
      <circle cx={X(S.E)} cy={Y(S.N)} r={5} fill="var(--trait)" />
      <Etiquette x={X(S.E) + 8} y={Y(S.N) + 14} taille={12} gras>
        S
      </Etiquette>
      <Nord x={570} y={40} taille={13} />
      <Etiquette x={460} y={236} taille={11.5} gras couleur={VERT}>
        {`surface : ${n2(s.S)} m²`}
      </Etiquette>
    </Figure>
  );
}

/** Plan coté d'un terrain : grille de cotes et courbes approchées par interpolation. */
export function PlanCote({ Z, pas, Zprojet }: { Z: number[][]; pas: number; Zprojet?: number }) {
  const nl = Z.length;
  const nc = Z[0]!.length;
  const k = Math.min(440 / ((nc - 1) * pas), 180 / ((nl - 1) * pas));
  const X = (j: number) => 80 + j * pas * k;
  const Y = (i: number) => 30 + i * pas * k;
  const tous = Z.flat();
  const zmin = Math.min(...tous);
  const zmax = Math.max(...tous);
  const courbes: number[] = [];
  for (let c = Math.ceil(zmin * 10) / 10; c <= zmax; c = Math.round((c + 0.1) * 10) / 10) courbes.push(c);
  const segs: { c: number; d: string }[] = [];
  for (const c of courbes) {
    let d = '';
    for (let i = 0; i < nl - 1; i++)
      for (let j = 0; j < nc - 1; j++) {
        const coins: [number, number, number][] = [
          [X(j), Y(i), Z[i]![j]!],
          [X(j + 1), Y(i), Z[i]![j + 1]!],
          [X(j + 1), Y(i + 1), Z[i + 1]![j + 1]!],
          [X(j), Y(i + 1), Z[i + 1]![j]!],
        ];
        const p: [number, number][] = [];
        coins.forEach((a, m) => {
          const b = coins[(m + 1) % 4]!;
          if ((a[2] - c) * (b[2] - c) < 0) {
            const t = (c - a[2]) / (b[2] - a[2]);
            p.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
          }
        });
        if (p.length === 2) d += `M${p[0]![0]} ${p[0]![1]}L${p[1]![0]} ${p[1]![1]}`;
      }
    segs.push({ c, d });
  }
  return (
    <Figure alt={`Plan coté du terrain : une grille de ${nl} × ${nc} points espacés de ${n2(pas)} m, chaque point avec son altitude, de ${n3(zmin)} à ${n3(zmax)} m. Les courbes de niveau tous les 10 cm sont tracées par interpolation entre les points ; le terrain descend vers l'est.${Zprojet !== undefined ? ` La cote projet est ${n3(Zprojet)} m.` : ''}`} largeur={620} hauteur={Y(nl - 1) + 50}>
      {segs.map((s) => (
        <path key={s.c} d={s.d} fill="none" stroke={TERRE} strokeWidth={Math.round(s.c * 10) % 5 === 0 ? 1.6 : 0.9} />
      ))}
      {Z.map((l, i) =>
        l.map((z, j) => (
          <g key={`${i}${j}`}>
            <path d={`M${X(j) - 4} ${Y(i)}h8M${X(j)} ${Y(i) - 4}v8`} className="t-moyen" />
            <Etiquette x={X(j) + 5} y={Y(i) - 4} taille={9.5}>
              {n3(z)}
            </Etiquette>
          </g>
        )),
      )}
      <Cote x1={X(0)} y1={Y(nl - 1)} x2={X(nc - 1)} y2={Y(nl - 1)} decalage={-18} texte={n2((nc - 1) * pas)} />
      <Cote x1={X(0)} y1={Y(nl - 1)} x2={X(0)} y2={Y(0)} decalage={18} texte={n2((nl - 1) * pas)} />
      <Nord x={590} y={40} taille={12} />
      <Renvoi de={[X(nc - 1) + 14, Y(0) + 30]} vers={[X(nc - 1) - 6, Y(0) + 10]} texte="courbes tous les 10 cm" />
    </Figure>
  );
}
