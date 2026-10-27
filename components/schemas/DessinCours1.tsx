// Schémas de compréhension du module L1.6 (dessin technique), leçons 1 et 2 : formats, traits, écritures, échelles.
// Les valeurs affichées viennent de lib/calc/dessin.ts, directement ou par les props.
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure, Renvoi } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import {
  EPAISSEURS_TRAITS,
  HAUTEURS_ECRITURE,
  MARGES_CADRE,
  echelleGraphique,
  epaisseurEcriture,
  facteurImpression,
  formatA,
  longueurPapier,
  longueurReelle,
  surfaceReelle,
  traitFin,
  zoneUtile,
  type ChoixFormat,
} from '@/lib/calc/dessin';
import { points } from '@/lib/drawing/repere';
import { nombre, nombreCourt } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const GRIS = 'var(--color-beton)';
const TRAIT = 'var(--trait)';
/** pixels par millimètre à l'écran (96 points par pouce) */
const PX_MM = 96 / 25.4;
const n2 = (x: number) => nombre(x, 2);

/** Silhouette d'une personne debout, pieds en (x, y), hauteur h (px). */
function Silhouette({ x, y, h, couleur = TRAIT }: { x: number; y: number; h: number; couleur?: string }) {
  const r = h * 0.07;
  return (
    <g stroke={couleur} strokeWidth={Math.max(1.4, h * 0.035)} strokeLinecap="round" fill="none">
      <circle cx={x} cy={y - h + r} r={r} fill={couleur} />
      <path d={`M${x} ${y - h + 2 * r} V${y - h * 0.45} M${x} ${y - h * 0.45} L${x - h * 0.1} ${y} M${x} ${y - h * 0.45} L${x + h * 0.1} ${y} M${x - h * 0.16} ${y - h * 0.6} L${x} ${y - h * 0.75} L${x + h * 0.16} ${y - h * 0.6}`} />
    </g>
  );
}

// ---------- L1.6.1 : formats, traits et écritures ----------

/** Le même angle de murs dessiné avec un seul trait, puis avec des traits hiérarchisés. */
export function DeuxTraits() {
  const cote = 4.2;
  const panneau = (x0: number, bon: boolean) => (
    <g>
      <polygon points={points([[x0 + 30, 22], [x0 + 50, 22], [x0 + 50, 112], [x0 + 262, 112], [x0 + 262, 132], [x0 + 30, 132]])} fill={hachure('dt', 'maconnerie')} className={bon ? 't-fort' : 't-fin'} strokeWidth={bon ? 2.4 : 0.7} />
      <line x1={x0 + 40} y1={8} x2={x0 + 40} y2={150} className={bon ? 't-axe' : 't-fin'} strokeWidth={0.7} />
      <line x1={x0 + 14} y1={122} x2={x0 + 284} y2={122} className={bon ? 't-axe' : 't-fin'} strokeWidth={0.7} />
      <Cote x1={x0 + 40} y1={132} x2={x0 + 262} y2={132} decalage={-20} texte={n2(cote)} />
      <Etiquette x={x0 + 150} y={182} ancre="middle" taille={11.5} gras couleur={bon ? VERT : ROUGE}>
        {bon ? '✓ fort pour le coupé, fin pour le reste' : '✗ un seul trait : rien ne ressort'}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="Le même angle de deux murs dessiné deux fois. À gauche, contours, axes, hachures et cote ont tous le même trait fin : on ne distingue plus le mur coupé de ce qui aide à lire. À droite, le mur coupé est en trait fort, les axes en trait mixte, la cote et les hachures en trait fin : le dessin se lit d'un coup d'œil." largeur={620} hauteur={194}>
      <Hachures prefixe="dt" types={['maconnerie']} />
      {panneau(10, false)}
      {panneau(320, true)}
    </Figure>
  );
}

/** Découpage du format A0 en formats plus petits, et dimensions de la série A. */
export function FormatsA() {
  const k = 372 / 1189;
  const ox = 14;
  const oy = 16;
  type R = { x: number; y: number; w: number; h: number };
  const morceaux: { n: number; r: R }[] = [];
  let reste: R = { x: 0, y: 0, w: 1189, h: 841 };
  for (let n = 1; n <= 5; n++) {
    if (reste.w >= reste.h) {
      morceaux.push({ n, r: { ...reste, w: reste.w / 2 } });
      reste = { ...reste, x: reste.x + reste.w / 2, w: reste.w / 2 };
    } else {
      morceaux.push({ n, r: { ...reste, h: reste.h / 2 } });
      reste = { ...reste, y: reste.y + reste.h / 2, h: reste.h / 2 };
    }
  }
  morceaux.push({ n: 5, r: reste });
  const tailles = [0, 26, 20, 15, 11, 8.5];
  const formats = [0, 1, 2, 3, 4, 5].map((n) => ({ n, ...formatA(n) }));
  return (
    <Figure alt={`Un format A0 (${formats[0]!.court} × ${formats[0]!.long} mm, 1 m²) coupé en deux donne deux A1 ; un A1 coupé en deux donne deux A2, et ainsi de suite jusqu'à l'A5. ${formats.map((f) => `A${f.n} : ${f.court} × ${f.long} mm`).join(' ; ')}.`} largeur={620} hauteur={300}>
      {morceaux.map(({ n, r }, i) => (
        <g key={i}>
          <rect x={ox + r.x * k} y={oy + r.y * k} width={r.w * k} height={r.h * k} fill={n === 4 ? 'var(--color-encre-clair)' : 'var(--color-papier)'} className="t-moyen" />
          <Etiquette x={ox + (r.x + r.w / 2) * k} y={oy + (r.y + r.h / 2) * k + tailles[n]! / 3} ancre="middle" taille={tailles[n]!} gras couleur={n === 4 ? BLEU : undefined}>
            {`A${n}`}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={ox + 186} y={oy + 841 * k + 20} ancre="middle" taille={11} classe="etiquette">
        une feuille A0 posée à plat, découpée en deux à chaque fois
      </Etiquette>
      <Etiquette x={418} y={34} taille={12} gras>
        série A (ISO 216), en mm
      </Etiquette>
      {formats.map((f, i) => (
        <g key={f.n}>
          <Etiquette x={418} y={62 + i * 26} taille={12} gras couleur={f.n === 4 ? BLEU : undefined}>
            {`A${f.n}`}
          </Etiquette>
          <Etiquette x={452} y={62 + i * 26} taille={12} couleur={f.n === 4 ? BLEU : undefined}>
            {`${f.court} × ${nombre(f.long, 0)}${f.n === 0 ? '  (1 m²)' : ''}`}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={418} y={232} taille={11} classe="etiquette">
        surface divisée par 2 à chaque cran ;
      </Etiquette>
      <Etiquette x={418} y={248} taille={11} classe="etiquette">
        côtés toujours dans le rapport √2 ≈ 1,414
      </Etiquette>
    </Figure>
  );
}

/** Série des épaisseurs de trait, à peu près en vraie grandeur, avec un couple fort / fin. */
export function SerieTraits() {
  const fort = 0.5;
  const fin = traitFin(fort);
  const y = (i: number) => 26 + i * 22;
  const iFort = EPAISSEURS_TRAITS.findIndex((e) => e === fort);
  const iFin = EPAISSEURS_TRAITS.findIndex((e) => e === fin);
  return (
    <Figure alt={`Série des épaisseurs de trait : ${EPAISSEURS_TRAITS.map((e) => nombreCourt(e, 2)).join(' ; ')} mm. Chaque cran multiplie l'épaisseur par √2 environ. Un dessin courant associe un trait fort de ${nombreCourt(fort, 2)} mm et un trait fin deux crans plus bas, de ${nombreCourt(fin, 2)} mm : la moitié.`} largeur={620} hauteur={y(EPAISSEURS_TRAITS.length) + 14}>
      {EPAISSEURS_TRAITS.map((e, i) => {
        const choisi = i === iFort || i === iFin;
        return (
          <g key={e}>
            <Etiquette x={100} y={y(i) + 4} ancre="end" taille={11.5} gras={choisi} couleur={choisi ? BLEU : undefined}>
              {`${nombreCourt(e, 2)} mm`}
            </Etiquette>
            <line x1={114} y1={y(i)} x2={420} y2={y(i)} stroke={choisi ? BLEU : TRAIT} strokeWidth={e * PX_MM} />
          </g>
        );
      })}
      <Etiquette x={434} y={y(iFort) + 4} taille={11.5} gras couleur={BLEU}>
        ← trait fort
      </Etiquette>
      <Etiquette x={434} y={y(iFin) + 4} taille={11.5} gras couleur={BLEU}>
        ← trait fin : la moitié
      </Etiquette>
      <Etiquette x={450} y={y(iFin) + 18} taille={10.5} couleur={BLEU}>
        deux crans plus bas
      </Etiquette>
      <Etiquette x={114} y={y(EPAISSEURS_TRAITS.length) + 2} taille={10.5} classe="etiquette">
        épaisseurs à peu près réelles à l'écran ; chaque cran multiplie par √2 ≈ 1,4
      </Etiquette>
    </Figure>
  );
}

/** Les types de traits en situation : élévation d'un mur et de sa semelle enterrée. */
export function TypesTraits() {
  const yTN = 120;
  return (
    <Figure alt="Élévation d'un mur posé sur une semelle enterrée. Le contour vu du mur est en trait continu fort. La semelle, cachée sous le terrain, est en trait interrompu. L'axe du mur est en trait mixte fin. La cote de hauteur et les hachures du terrain sont en trait continu fin." largeur={620} hauteur={214}>
      <Hachures prefixe="tt" types={['terre']} />
      <rect x={60} y={yTN} width={430} height={84} fill={hachure('tt', 'terre')} />
      <line x1={60} y1={yTN} x2={490} y2={yTN} className="t-fort" />
      <rect x={250} y={34} width={40} height={yTN - 34} fill="var(--color-papier)" className="t-fort" />
      <path d={`M250 ${yTN}V160H214V188H326V160H290V${yTN}`} className="t-cache" strokeWidth={1.1} />
      <line x1={270} y1={16} x2={270} y2={204} className="t-axe" strokeWidth={0.8} />
      <Cote x1={290} y1={yTN} x2={290} y2={34} decalage={-46} texte={n2(1.8)} />
      <Renvoi de={[70, 44]} vers={[249, 56]} texte="continu fort : contour vu" />
      <Renvoi de={[70, 150]} vers={[213, 172]} texte="interrompu : arête cachée" />
      <Renvoi de={[350, 22]} vers={[272, 24]} texte="mixte fin : axe" />
      <Renvoi de={[400, 90]} vers={[338, 90]} texte="continu fin : cote, hachures" />
    </Figure>
  );
}

/** Hauteurs d'écriture normalisées, à peu près en vraie grandeur, et épaisseur du trait associé. */
export function HauteursEcriture() {
  const lignes = HAUTEURS_ECRITURE.slice(1, 5).map((h, i) => ({ h, usage: ['cotes, notes', 'textes courants', 'titres des vues', 'titre du plan'][i]! }));
  let y = 22;
  const rangs = lignes.map((l) => {
    const t = (l.h * PX_MM) / 0.72;
    y += t + 12;
    return { ...l, t, y };
  });
  return (
    <Figure alt={`Hauteurs d'écriture normalisées : ${lignes.map((l) => `${nombreCourt(l.h, 1)} mm avec un trait de ${nombreCourt(epaisseurEcriture(l.h), 2)} mm`).join(' ; ')}. Le trait d'écriture vaut le dixième de la hauteur.`} largeur={620} hauteur={y + 34}>
      {rangs.map((r) => (
        <g key={r.h}>
          <Etiquette x={16} y={r.y - r.t / 4} taille={11} gras>
            {`h = ${nombreCourt(r.h, 1)} mm`}
          </Etiquette>
          <Etiquette x={16} y={r.y - r.t / 4 + 13} taille={10} classe="etiquette">
            {`trait ${nombreCourt(epaisseurEcriture(r.h), 2)} mm`}
          </Etiquette>
          <text x={128} y={r.y} fontSize={r.t} fontWeight={r.h >= 5 ? 700 : 400} className="encre">
            COUPE A-A · 3,60
          </text>
          <Etiquette x={604} y={r.y - r.t / 4} ancre="end" taille={10.5} classe="etiquette">
            {r.usage}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={128} y={y + 26} taille={10.5} classe="etiquette">
        à peu près en vraie grandeur à l'écran ; on n'écrit pas plus petit que 2,5 mm
      </Etiquette>
    </Figure>
  );
}

/** Une feuille A3 prête à dessiner : bords, cadre, repères de centrage, zone de dessin et cartouche. */
export function FeuilleCadre() {
  const f = formatA(3);
  const k = 1.06;
  const ox = 70;
  const oy = 34;
  const g = MARGES_CADRE.gauche;
  const a = MARGES_CADRE.autres;
  const X = (x: number) => ox + x * k;
  const Y = (y: number) => oy + y * k;
  return (
    <Figure alt={`Feuille A3 de ${f.long} × ${f.court} mm posée en paysage. Le cadre, en trait fort, laisse ${g} mm à gauche pour la reliure et ${a} mm sur les autres bords. Des repères de centrage marquent le milieu de chaque côté. Le cartouche se place en bas à droite, dans le cadre ; le reste est la zone de dessin.`} largeur={620} hauteur={Y(f.court) + 50}>
      <rect x={X(0)} y={Y(0)} width={f.long * k} height={f.court * k} fill="var(--color-papier)" className="t-fin" strokeWidth={0.8} />
      <rect x={X(g)} y={Y(a)} width={(f.long - g - a) * k} height={(f.court - 2 * a) * k} fill="none" className="t-fort" />
      {[
        [f.long / 2, 0, f.long / 2, a + 5],
        [f.long / 2, f.court, f.long / 2, f.court - a - 5],
        [0, f.court / 2, g + 5, f.court / 2],
        [f.long, f.court / 2, f.long - a - 5, f.court / 2],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={X(x1!)} y1={Y(y1!)} x2={X(x2!)} y2={Y(y2!)} className="t-fort" />
      ))}
      <rect x={X(f.long - a - 180)} y={Y(f.court - a - 40)} width={180 * k} height={40 * k} fill="var(--color-encre-clair)" className="t-moyen" />
      <path d={`M${X(f.long - a - 180)} ${Y(f.court - a - 20)}h${180 * k}M${X(f.long - a - 90)} ${Y(f.court - a - 40)}v${40 * k}`} className="t-fin" />
      <Etiquette x={X(f.long - a - 90)} y={Y(f.court - a - 24)} ancre="middle" taille={11} gras couleur={BLEU}>
        cartouche
      </Etiquette>
      <Etiquette x={X(f.long / 2 - 30)} y={Y(f.court / 2 - 10)} ancre="middle" taille={14} gras classe="etiquette">
        zone de dessin
      </Etiquette>
      <Cote x1={X(0)} y1={Y(0)} x2={X(g)} y2={Y(0)} decalage={12} texte={String(g)} taille={10.5} />
      <Cote x1={X(f.long - a)} y1={Y(0)} x2={X(f.long)} y2={Y(0)} decalage={12} texte={String(a)} taille={10.5} />
      <Cote x1={X(0)} y1={Y(f.court)} x2={X(f.long)} y2={Y(f.court)} decalage={-16} texte={`${f.long} mm`} />
      <Cote x1={X(0)} y1={Y(f.court)} x2={X(0)} y2={Y(0)} decalage={20} texte={`${f.court} mm`} />
      <Renvoi de={[X(70), Y(60)]} vers={[X(g), Y(48)]} texte="cadre : trait fort" />
      <Renvoi de={[X(250), Y(60)]} vers={[X(f.long / 2) + 1, Y(a + 3)]} texte="repère de centrage" />
    </Figure>
  );
}

/** Une feuille A n à l'échelle k : cadre, bande du cartouche et encombrement du dessin. */
function FeuilleEssai({ x0, y0, k, n, enc, cartouche, tient }: { x0: number; y0: number; k: number; n: number; enc: { largeur: number; hauteur: number }; cartouche: number; tient: boolean }) {
  const f = formatA(n);
  const paysage = n !== 4;
  const [L, H] = paysage ? [f.long, f.court] : [f.court, f.long];
  const z = zoneUtile(n);
  const c = tient ? VERT : ROUGE;
  return (
    <g>
      <rect x={x0} y={y0} width={L * k} height={H * k} fill="var(--color-papier)" className="t-fin" strokeWidth={0.8} />
      <rect x={x0 + MARGES_CADRE.gauche * k} y={y0 + MARGES_CADRE.autres * k} width={z.largeur * k} height={z.hauteur * k} fill="none" className="t-moyen" />
      <rect x={x0 + MARGES_CADRE.gauche * k} y={y0 + (H - MARGES_CADRE.autres - cartouche) * k} width={z.largeur * k} height={cartouche * k} fill="var(--color-encre-clair)" />
      <rect x={x0 + MARGES_CADRE.gauche * k + 3} y={y0 + MARGES_CADRE.autres * k + 3} width={enc.largeur * k} height={enc.hauteur * k} fill={c} fillOpacity={0.16} stroke={c} strokeWidth={1.4} />
      <Etiquette x={x0 + (L * k) / 2} y={y0 + H * k + 16} ancre="middle" taille={11.5} gras couleur={c}>
        {`A${n} ${paysage ? 'paysage' : 'portrait'} : ${tient ? 'tient' : 'trop petit'}`}
      </Etiquette>
    </g>
  );
}

/** Essai des formats : le plus petit qui ne convient pas, puis celui retenu. */
export function EssaiFormats({ choix, cartouche }: { choix: ChoixFormat; cartouche: number }) {
  const precedent = choix.n < 4 ? choix.n + 1 : undefined;
  const f = formatA(choix.n);
  const k = 250 / (choix.n === 4 ? f.court : f.long);
  const hFeuille = (n: number) => (n === 4 ? formatA(n).long : formatA(n).court) * k;
  const hauteur = Math.max(hFeuille(choix.n), precedent !== undefined ? hFeuille(precedent) : 0) + 64;
  return (
    <Figure alt={`Dessin et cotes : ${nombre(choix.encombrement.largeur, 0)} × ${nombre(choix.encombrement.hauteur, 0)} mm, plus ${nombre(cartouche, 0)} mm pour le cartouche.${precedent !== undefined ? ` Sur un A${precedent}, il déborde.` : ''} Sur un A${choix.n} ${choix.orientation}, il tient avec ${nombre(choix.marge.largeur, 0)} mm de marge en largeur et ${nombre(choix.marge.hauteur, 0)} mm en hauteur.`} largeur={620} hauteur={hauteur}>
      {precedent !== undefined ? <FeuilleEssai x0={30} y0={20} k={k} n={precedent} enc={choix.encombrement} cartouche={cartouche} tient={false} /> : null}
      <FeuilleEssai x0={precedent !== undefined ? 330 : 185} y0={20} k={k} n={choix.n} enc={choix.encombrement} cartouche={cartouche} tient />
      <Etiquette x={310} y={hauteur - 10} ancre="middle" taille={11} classe="etiquette">
        {`dessin et cotes : ${nombre(choix.encombrement.largeur, 0)} × ${nombre(choix.encombrement.hauteur, 0)} mm ; bande bleue : cartouche`}
      </Etiquette>
    </Figure>
  );
}

/** Plier un grand plan au format A4, cartouche visible sur le dessus. */
export function PliageA4() {
  const k = 0.4;
  const a3 = formatA(3);
  const a4 = formatA(4);
  const feuille = (x: number, y: number, L: number, H: number) => (
    <g>
      <rect x={x} y={y} width={L * k} height={H * k} fill="var(--color-papier)" className="t-moyen" />
      <rect x={x + L * k - 74 * k - 8} y={y + H * k - 16 * k - 8} width={74 * k + 4} height={16 * k + 4} fill={BLEU} />
    </g>
  );
  return (
    <Figure alt={`Pliage d'un plan A3 (${a3.long} × ${a3.court} mm) au format A4 (${a4.court} × ${a4.long} mm) : on le plie en deux, en accordéon s'il est plus grand, de façon que le cartouche, en bas à droite, reste visible sur le dessus. On range ainsi le plan dans un classeur sans le déplier pour le reconnaître.`} largeur={620} hauteur={190}>
      {feuille(20, 30, a3.long, a3.court)}
      <line x1={20 + (a3.long * k) / 2} y1={24} x2={20 + (a3.long * k) / 2} y2={36 + a3.court * k} stroke={ROUGE} strokeDasharray="5 4" />
      <Fleche x1={210} y1={90} x2={262} y2={90} couleur={ROUGE} epaisseur={2} tete={8} />
      <g>
        <rect x={286} y={30} width={a4.court * k} height={a4.long * k} fill="var(--color-papier)" className="t-moyen" />
        <rect x={292} y={36} width={a4.court * k} height={a4.long * k} fill="var(--color-papier)" className="t-moyen" opacity={0.9} />
        <rect x={292 + a4.court * k - 74 * k - 8} y={36 + a4.long * k - 16 * k - 8} width={74 * k + 4} height={16 * k + 4} fill={BLEU} />
      </g>
      <Fleche x1={392} y1={90} x2={444} y2={90} couleur={ROUGE} epaisseur={2} tete={8} />
      {feuille(470, 30, a4.court, a4.long)}
      <Etiquette x={104} y={172} ancre="middle" taille={11}>
        1. plan A3, cartouche en bas à droite
      </Etiquette>
      <Etiquette x={330} y={172} ancre="middle" taille={11}>
        2. plié en deux
      </Etiquette>
      <Etiquette x={512} y={172} ancre="middle" taille={11}>
        3. format A4, cartouche dessus
      </Etiquette>
    </Figure>
  );
}

/** Un plan A1 imprimé sur une feuille A3 : toutes les longueurs, et les textes, sont divisés par deux. */
export function ReductionImpression({ h = 3.5, E = 50 }: { h?: number; E?: number }) {
  const f = facteurImpression(1, 3);
  const a1 = formatA(1);
  const a3 = formatA(3);
  const k = 0.3;
  const plan = (x: number, y: number, s: number) => (
    <g>
      <rect x={x + 30 * s} y={y + 30 * s} width={140 * s} height={90 * s} fill="none" className="t-fort" strokeWidth={Math.max(1, 3 * s)} />
      <line x1={x + 100 * s} y1={y + 30 * s} x2={x + 100 * s} y2={y + 120 * s} className="t-moyen" />
    </g>
  );
  return (
    <Figure alt={`Un plan A1 au 1/${E}, écrit en ${nombreCourt(h, 1)} mm, imprimé sur une feuille A3 : les longueurs sont multipliées par ${nombreCourt(f, 2)}. Les textes ne font plus que ${nombreCourt(h * f, 2)} mm, à peine lisibles, et le plan n'est plus au 1/${E} mais au 1/${nombre(E / f, 0)}, alors que le cartouche indique toujours 1/${E}.`} largeur={620} hauteur={236}>
      <rect x={20} y={20} width={a1.long * k} height={a1.court * k} fill="var(--color-papier)" className="t-moyen" />
      {plan(20, 20, 1.2)}
      <Etiquette x={20 + (a1.long * k) / 2} y={20 + a1.court * k + 18} ancre="middle" taille={11.5} gras>
        {`A1 au 1/${E} : textes de ${nombreCourt(h, 1)} mm`}
      </Etiquette>
      <Fleche x1={284} y1={110} x2={346} y2={110} couleur={ROUGE} epaisseur={2} tete={8} />
      <Etiquette x={315} y={100} ancre="middle" taille={11} couleur={ROUGE}>
        {`× ${nombreCourt(f, 2)}`}
      </Etiquette>
      <rect x={370} y={20 + (a1.court - a3.court) * k / 2} width={a3.long * k} height={a3.court * k} fill="var(--color-papier)" className="t-moyen" />
      {plan(370, 20 + ((a1.court - a3.court) * k) / 2, 0.6)}
      <Etiquette x={370 + (a3.long * k) / 2} y={20 + a1.court * k + 18} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        {`A3 : textes de ${nombreCourt(h * f, 2)} mm, plan au 1/${nombre(E / f, 0)}`}
      </Etiquette>
      <Etiquette x={370 + (a3.long * k) / 2} y={20 + a1.court * k + 34} ancre="middle" taille={11} couleur={ROUGE}>
        {`le cartouche dit encore « 1/${E} »`}
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.6.2 : échelles ----------

/** Une porte et une personne en vrai, puis sur un plan au 1/50 : toutes les longueurs sont divisées par 50. */
export function PersonneEchelle({ E = 50 }: { E?: number }) {
  const porte = { l: 0.9, h: 2.1 };
  const personne = 1.8;
  const scene = (x0: number, s: number) => (
    <g>
      <line x1={x0 - 10} y1={180} x2={x0 + 2.4 * s} y2={180} className="t-fort" />
      <rect x={x0} y={180 - porte.h * s} width={porte.l * s} height={porte.h * s} fill="var(--color-terre-clair)" className="t-moyen" />
      <Silhouette x={x0 + 1.7 * s} y={180} h={personne * s} />
    </g>
  );
  return (
    <Figure alt={`À gauche, une porte de ${n2(porte.l)} × ${n2(porte.h)} m et une personne de ${n2(personne)} m. À droite, le même dessin sur un plan au 1/${E} : la porte mesure ${nombre(longueurPapier(porte.l, E), 0)} × ${nombre(longueurPapier(porte.h, E), 0)} mm et la personne ${nombre(longueurPapier(personne, E), 0)} mm. Tout est divisé par ${E}, les proportions restent les mêmes.`} largeur={620} hauteur={214}>
      {scene(40, 70)}
      <Etiquette x={124} y={202} ancre="middle" taille={11.5} gras>
        {`en vrai : ${n2(porte.l)} × ${n2(porte.h)} m ; ${n2(personne)} m`}
      </Etiquette>
      <Fleche x1={262} y1={120} x2={350} y2={120} couleur={BLEU} epaisseur={2.2} tete={9} />
      <Etiquette x={306} y={110} ancre="middle" taille={12} gras couleur={BLEU}>
        {`÷ ${E}`}
      </Etiquette>
      {scene(400, 30)}
      <Etiquette x={480} y={202} ancre="middle" taille={11.5} gras couleur={BLEU}>
        {`au 1/${E} : ${nombre(longueurPapier(porte.l, E), 0)} × ${nombre(longueurPapier(porte.h, E), 0)} mm ; ${nombre(longueurPapier(personne, E), 0)} mm`}
      </Etiquette>
    </Figure>
  );
}

/** Une même porte de 0,90 m dessinée au 1/100, au 1/50 et au 1/20. */
export function TroisEchelles({ largeur = 0.9 }: { largeur?: number }) {
  const echelles = [100, 50, 20];
  const k = 2;
  let x = 30;
  const porte = (E: number) => {
    const w = longueurPapier(largeur, E) * k;
    const e = longueurPapier(0.2, E) * k;
    const x0 = x;
    x += w + 2 * 40 + 60;
    const y = 150;
    return (
      <g key={E}>
        <rect x={x0} y={y - e} width={40} height={e} fill={hachure('te', 'maconnerie')} className="t-fort" />
        <rect x={x0 + 40 + w} y={y - e} width={40} height={e} fill={hachure('te', 'maconnerie')} className="t-fort" />
        <line x1={x0 + 40 + w} y1={y - e} x2={x0 + 40 + w} y2={y - e - w} className="t-moyen" />
        <path d={`M${x0 + 40 + w} ${y - e - w} A${w} ${w} 0 0 0 ${x0 + 40} ${y - e}`} className="t-fin" />
        <Etiquette x={x0 + 40 + w / 2} y={y + 20} ancre="middle" taille={12} gras>
          {`1/${E}`}
        </Etiquette>
        <Etiquette x={x0 + 40 + w / 2} y={y + 36} ancre="middle" taille={11} couleur={BLEU}>
          {`${nombre(longueurPapier(largeur, E), 0)} mm`}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt={`Une porte de ${n2(largeur)} m dessinée à trois échelles : ${echelles.map((E) => `${nombre(longueurPapier(largeur, E), 0)} mm au 1/${E}`).join(', ')}. Plus le dénominateur est petit, plus le dessin est grand et peut montrer de détails.`} largeur={620} hauteur={200}>
      <Hachures prefixe="te" types={['maconnerie']} />
      {echelles.map(porte)}
    </Figure>
  );
}

/** Échelles usuelles des pièces d'un dossier de bâtiment, sur une échelle logarithmique. */
export function UsagesEchelles() {
  const X = (E: number) => 50 + (Math.log10(E) / Math.log10(5000)) * 520;
  const graduations = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  const bandes = [
    { de: 1, a: 20, t: 'détails', c: 'var(--color-brique)' },
    { de: 20, a: 50, t: 'coupes, plans d’exécution', c: BLEU },
    { de: 50, a: 100, t: 'plans de niveaux, façades', c: VERT },
    { de: 200, a: 500, t: 'plan de masse', c: TERRE },
    { de: 1000, a: 5000, t: 'plan de situation', c: GRIS },
  ];
  return (
    <Figure alt="Échelles usuelles d'un dossier de bâtiment : détails du 1/1 au 1/20 ; coupes et plans d'exécution du 1/20 au 1/50 ; plans de niveaux et façades du 1/50 au 1/100 ; plan de masse du 1/200 au 1/500 ; plan de situation du 1/1000 au 1/5000. Vers la gauche, on voit plus de détails ; vers la droite, plus de territoire." largeur={620} hauteur={214}>
      {bandes.map((b, i) => (
        <g key={b.t}>
          <rect x={X(b.de)} y={22 + i * 24} width={Math.max(X(b.a) - X(b.de), 8)} height={16} rx={4} fill={b.c} fillOpacity={0.22} stroke={b.c} />
          <Etiquette x={i < 2 ? X(b.a) + 8 : X(b.de) - 8} y={34 + i * 24} ancre={i < 2 ? 'start' : 'end'} taille={11.5} gras couleur={b.c}>
            {b.t}
          </Etiquette>
        </g>
      ))}
      <line x1={X(1)} y1={152} x2={X(5000)} y2={152} className="t-moyen" />
      {graduations.map((E) => (
        <g key={E}>
          <line x1={X(E)} y1={148} x2={X(E)} y2={156} className="t-moyen" />
          <Etiquette x={X(E)} y={172} ancre="middle" taille={9.5}>
            {`1/${E}`}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={X(1)} y={200} taille={11} couleur={BLEU}>
        ← plus de détails
      </Etiquette>
      <Etiquette x={X(5000)} y={200} ancre="end" taille={11} couleur={BLEU}>
        plus de territoire →
      </Etiquette>
    </Figure>
  );
}

/** Échelle graphique au 1/50 : elle rétrécit avec le dessin quand on le photocopie, donc elle reste juste. */
export function EchelleGraphiqueSchema({ E = 50 }: { E?: number }) {
  const g = echelleGraphique(E, 1, 5);
  const f = facteurImpression(3, 4);
  const k = 3.6;
  const barre = (x0: number, y: number, s: number, titre: string, c?: string) => (
    <g>
      {g.slice(0, -1).map((p, i) => (
        <rect key={i} x={x0 + p.papier * k * s} y={y} width={(g[i + 1]!.papier - p.papier) * k * s} height={9} fill={i % 2 === 0 ? TRAIT : 'var(--color-papier)'} stroke={TRAIT} strokeWidth={0.8} />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <line key={t} x1={x0 + longueurPapier(t, E) * k * s} y1={y} x2={x0 + longueurPapier(t, E) * k * s} y2={y - 5} className="t-fin" />
      ))}
      {g.map((p) => (
        <Etiquette key={p.reel} x={x0 + p.papier * k * s} y={y + 22} ancre="middle" taille={10.5}>
          {nombre(p.reel, 0)}
        </Etiquette>
      ))}
      <Etiquette x={x0 + g[g.length - 1]!.papier * k * s + 10} y={y + 9} taille={11}>
        m
      </Etiquette>
      <Etiquette x={x0} y={y - 12} taille={11.5} gras couleur={c}>
        {titre}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt={`Échelle graphique d'un plan au 1/${E} : chaque mètre mesure ${nombre(g[1]!.papier, 0)} mm sur le papier, le premier mètre est divisé en cinq. Sur une copie réduite à ${nombre(f * 100, 0)} %, la barre rétrécit avec le dessin : un mètre de la barre correspond toujours à un mètre du dessin.`} largeur={620} hauteur={150}>
      {barre(40, 34, 1, `plan original au 1/${E} : 1 m = ${nombre(g[1]!.papier, 0)} mm`)}
      {barre(40, 104, f, `copie réduite à ${nombre(f * 100, 0)} % : la barre rétrécit avec le dessin`, BLEU)}
    </Figure>
  );
}

/** 1 cm² au 1/100 représente 1 m² : les surfaces sont multipliées par E². */
export function CarreSurface({ E = 100 }: { E?: number }) {
  const s = surfaceReelle(100, E);
  const k = 18;
  return (
    <Figure alt={`Un carré de 1 cm de côté sur un plan au 1/${E} représente un carré de ${nombre(E / 100, 0)} m de côté : chaque côté est multiplié par ${E}, la surface par ${E} × ${E} = ${nombre(E * E, 0)}. 1 cm² sur le plan vaut ${nombreCourt(s, 2)} m² en vrai.`} largeur={620} hauteur={226}>
      <rect x={60} y={90} width={40} height={40} fill="var(--color-encre-clair)" className="t-fort" />
      <Etiquette x={80} y={150} ancre="middle" taille={11.5} gras>
        1 cm × 1 cm
      </Etiquette>
      <Etiquette x={80} y={166} ancre="middle" taille={11}>
        {`sur le plan au 1/${E}`}
      </Etiquette>
      <Fleche x1={130} y1={110} x2={250} y2={110} couleur={BLEU} epaisseur={2.2} tete={9} />
      <Etiquette x={190} y={100} ancre="middle" taille={11.5} couleur={BLEU}>
        {`× ${E} sur chaque côté`}
      </Etiquette>
      <rect x={280} y={20} width={10 * k} height={10 * k} fill="var(--color-encre-clair)" className="t-fort" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${280 + (i + 1) * k} 20v${10 * k}M280 ${20 + (i + 1) * k}h${10 * k}`} className="t-fin" />
      ))}
      <Etiquette x={370} y={218} ancre="middle" taille={11.5} gras>
        {`${nombre(E / 100, 0)} m × ${nombre(E / 100, 0)} m = ${nombreCourt(s, 2)} m² en vrai`}
      </Etiquette>
      <Etiquette x={480} y={90} taille={12} gras couleur={ROUGE}>
        {`surfaces × ${nombre(E * E, 0)}`}
      </Etiquette>
      <Etiquette x={480} y={108} taille={11.5} couleur={ROUGE}>
        {`soit E² = ${E}²`}
      </Etiquette>
    </Figure>
  );
}

/** Longueur dessinée à chaque échelle normalisée, comparée à la place disponible sur la feuille. */
export function ChoixEchelleBarres({ L, dispo, E, echelles }: { L: number; dispo: number; E: number; echelles: readonly number[] }) {
  const k = 300 / dispo;
  const x0 = 100;
  const max = 470;
  return (
    <Figure alt={`Longueur à dessiner pour ${n2(L)} m : ${echelles.map((e) => `${nombre(longueurPapier(L, e), 0)} mm au 1/${e}`).join(', ')}. La place disponible est de ${nombre(dispo, 0)} mm : l'échelle retenue est le 1/${E}, la plus grande qui tient.`} largeur={620} hauteur={echelles.length * 30 + 52}>
      {echelles.map((e, i) => {
        const l = longueurPapier(L, e);
        const w = Math.min(l * k, max);
        const tient = l <= dispo + 1e-9;
        const c = e === E ? VERT : tient ? GRIS : ROUGE;
        const y = 22 + i * 30;
        return (
          <g key={e}>
            <Etiquette x={x0 - 10} y={y + 12} ancre="end" taille={12} gras={e === E}>
              {`1/${e}`}
            </Etiquette>
            <rect x={x0} y={y} width={w} height={16} fill={c} fillOpacity={0.25} stroke={c} />
            {l * k > max ? <path d={`M${x0 + max - 6} ${y - 2}l6 10l-6 10`} fill="none" stroke={ROUGE} strokeWidth={1.4} /> : null}
            <Etiquette x={x0 + w + 8} y={y + 12} taille={11} gras={e === E} couleur={c}>
              {`${nombre(l, 0)} mm${e === E ? ' ← retenue' : tient ? '' : ' : trop long'}`}
            </Etiquette>
          </g>
        );
      })}
      <line x1={x0 + dispo * k} y1={12} x2={x0 + dispo * k} y2={echelles.length * 30 + 22} stroke={BLEU} strokeDasharray="5 4" strokeWidth={1.4} />
      <Etiquette x={x0 + dispo * k} y={echelles.length * 30 + 40} ancre="middle" taille={11} gras couleur={BLEU}>
        {`place disponible : ${nombre(dispo, 0)} mm`}
      </Etiquette>
    </Figure>
  );
}

/** Erreur fréquente : multiplier une surface par E au lieu de E². */
export function SurfaceErreur({ a = 50, b = 40, E = 100 }: { a?: number; b?: number; E?: number }) {
  const aire = a * b;
  const faux = (aire * E) / 1e6;
  const juste = surfaceReelle(aire, E);
  return (
    <Figure alt={`Une pièce mesure ${a} × ${b} mm sur un plan au 1/${E}, soit ${nombre(aire, 0)} mm². Multiplier par ${E} donne ${nombreCourt(faux, 2)} m², absurde pour une pièce. Il faut multiplier par ${E}² : ${nombreCourt(juste, 2)} m², soit ${nombreCourt(longueurReelle(a, E), 2)} × ${nombreCourt(longueurReelle(b, E), 2)} m.`} largeur={620} hauteur={170}>
      <rect x={40} y={30} width={a * 2.6} height={b * 2.6} fill="var(--color-encre-clair)" className="t-fort" />
      <Cote x1={40} y1={30 + b * 2.6} x2={40 + a * 2.6} y2={30 + b * 2.6} decalage={-14} texte={`${a} mm`} />
      <Cote x1={40} y1={30 + b * 2.6} x2={40} y2={30} decalage={14} texte={`${b} mm`} />
      <rect x={250} y={30} width={340} height={44} rx={6} fill="var(--color-correction-clair)" stroke={ROUGE} />
      <Etiquette x={266} y={57} taille={12.5} gras couleur={ROUGE}>
        {`✗ ${nombre(aire, 0)} mm² × ${E} = ${nombreCourt(faux, 2)} m²`}
      </Etiquette>
      <rect x={250} y={92} width={340} height={44} rx={6} fill="var(--color-validation-clair)" stroke={VERT} />
      <Etiquette x={266} y={119} taille={12.5} gras couleur={VERT}>
        {`✓ ${nombre(aire, 0)} mm² × ${E}² = ${nombreCourt(juste, 2)} m²`}
      </Etiquette>
    </Figure>
  );
}

/** Un plan photocopié en réduction : la mesure à la règle trompe, l'échelle graphique et la cote écrite non. */
export function PhotocopieEchelle({ L = 3.6, E = 50, f = facteurImpression(3, 4) }: { L?: number; E?: number; f?: number }) {
  const m = longueurPapier(L, E);
  const mCopie = m * f;
  const lu = longueurReelle(mCopie, E);
  const k = 3.2;
  const segment = (y: number, l: number, titre: string, c: string) => (
    <g>
      <line x1={40} y1={y} x2={40 + l * k} y2={y} stroke={c} strokeWidth={5} />
      <line x1={40} y1={y - 8} x2={40} y2={y + 8} className="t-moyen" />
      <line x1={40 + l * k} y1={y - 8} x2={40 + l * k} y2={y + 8} className="t-moyen" />
      <Etiquette x={40} y={y - 14} taille={11.5} gras couleur={c}>
        {titre}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt={`Un mur de ${n2(L)} m mesure ${nombre(m, 0)} mm sur un plan au 1/${E}. Sur une copie réduite à ${nombre(f * 100, 0)} %, il ne mesure plus que ${nombre(mCopie, 0)} mm ; lu au 1/${E}, on trouverait ${n2(lu)} m, une erreur de ${nombre((L - lu) * 100, 0)} cm. La cote écrite, elle, dit toujours ${n2(L)} m.`} largeur={620} hauteur={164}>
      {segment(44, m, `original au 1/${E} : ${nombre(m, 0)} mm → ${n2(L)} m`, BLEU)}
      {segment(112, mCopie, `copie à ${nombre(f * 100, 0)} % : ${nombre(mCopie, 0)} mm → lu ${n2(lu)} m ✗`, ROUGE)}
      <Etiquette x={300} y={150} taille={11.5} gras couleur={VERT}>
        {`✓ la cote écrite « ${n2(L)} » ne change pas`}
      </Etiquette>
    </Figure>
  );
}

/** Le réglet triangulaire d'architecte (scalimètre) : chaque arête est graduée pour une échelle. */
export function Scalimetre() {
  const k = 3.6;
  const graduations = (y: number, E: number, haut: boolean) => {
    const nM = Math.floor(100 / longueurPapier(1, E));
    return Array.from({ length: nM + 1 }, (_, i) => {
      const x = 170 + longueurPapier(i, E) * k;
      return (
        <g key={i}>
          <line x1={x} y1={y} x2={x} y2={y + (haut ? 9 : -9)} className="t-moyen" />
          <Etiquette x={x} y={y + (haut ? 22 : -14)} ancre="middle" taille={9.5}>
            {String(i)}
          </Etiquette>
        </g>
      );
    });
  };
  return (
    <Figure alt="Le scalimètre, réglet triangulaire d'architecte : chacune de ses six arêtes est graduée pour une échelle. Sur l'arête du 1/50, on lit directement des mètres tous les 20 mm ; sur celle du 1/100, tous les 10 mm. On choisit l'arête qui correspond à l'échelle du plan." largeur={620} hauteur={150}>
      <polygon points={points([[40, 112], [110, 112], [75, 52]])} fill="var(--color-beton-clair)" className="t-fort" />
      <path d="M58 101 Q75 92 92 101 M66 70 Q74 82 69 92 M84 70 Q76 82 81 92" className="t-fin" />
      <Etiquette x={75} y={134} ancre="middle" taille={10.5}>
        coupe du réglet
      </Etiquette>
      <rect x={160} y={44} width={100 * k + 20} height={62} rx={3} fill="var(--color-beton-clair)" className="t-moyen" />
      {graduations(44, 50, true)}
      {graduations(106, 100, false)}
      <Etiquette x={152} y={58} ancre="end" taille={11} gras couleur={BLEU}>
        1/50
      </Etiquette>
      <Etiquette x={152} y={104} ancre="end" taille={11} gras couleur={BLEU}>
        1/100
      </Etiquette>
      <Etiquette x={170 + 100 * k + 26} y={78} taille={10.5} classe="etiquette">
        m
      </Etiquette>
    </Figure>
  );
}

/** Une règle graduée posée le long d'un mur dessiné ; la longueur réelle reste à trouver. */
export function RegleSurPlan({ mesure, E }: { mesure: number; E: number }) {
  const k = 3.4;
  const n = Math.ceil(mesure / 10) * 10 + 10;
  return (
    <Figure alt={`Un mur dessiné sur un plan au 1/${E}. Une règle graduée posée dessus indique ${nombre(mesure, 0)} mm.`} largeur={620} hauteur={130}>
      <Hachures prefixe="rsp" types={['maconnerie']} />
      <rect x={60} y={24} width={mesure * k} height={14} fill={hachure('rsp', 'maconnerie')} className="t-fort" />
      <rect x={60} y={44} width={n * k} height={34} fill="var(--color-terre-clair)" className="t-moyen" />
      {Array.from({ length: n + 1 }, (_, i) => (
        <line key={i} x1={60 + i * k} y1={44} x2={60 + i * k} y2={44 + (i % 10 === 0 ? 14 : i % 5 === 0 ? 10 : 6)} className="t-fin" strokeWidth={0.8} />
      ))}
      {Array.from({ length: n / 10 + 1 }, (_, i) => (
        <Etiquette key={i} x={60 + i * 10 * k} y={72} ancre="middle" taille={9.5}>
          {String(i * 10)}
        </Etiquette>
      ))}
      <line x1={60 + mesure * k} y1={18} x2={60 + mesure * k} y2={86} stroke={ROUGE} strokeWidth={1.4} />
      <Etiquette x={60 + mesure * k} y={104} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        {`${nombre(mesure, 0)} mm`}
      </Etiquette>
      <Etiquette x={60} y={120} taille={11} classe="etiquette">
        {`plan au 1/${E} ; règle graduée en mm`}
      </Etiquette>
    </Figure>
  );
}

/** Une porte dont la cote écrite est connue, mesurée à la règle sur une copie d'échelle inconnue. */
export function CoteConnue({ mesure, cote }: { mesure: number; cote: number }) {
  const k = 6;
  return (
    <Figure alt={`Sur une copie d'échelle inconnue, une porte cotée ${n2(cote)} m mesure ${nombre(mesure, 0)} mm à la règle.`} largeur={620} hauteur={196}>
      <g transform="translate(0 44)">
      <Hachures prefixe="cc" types={['maconnerie']} />
      <rect x={120} y={60} width={60} height={14} fill={hachure('cc', 'maconnerie')} className="t-fort" />
      <rect x={180 + mesure * k} y={60} width={60} height={14} fill={hachure('cc', 'maconnerie')} className="t-fort" />
      <line x1={180 + mesure * k} y1={60} x2={180 + mesure * k} y2={60 - mesure * k} className="t-moyen" />
      <path d={`M${180 + mesure * k} ${60 - mesure * k} A${mesure * k} ${mesure * k} 0 0 0 180 60`} className="t-fin" />
      <Cote x1={180} y1={74} x2={180 + mesure * k} y2={74} decalage={-16} texte={n2(cote)} />
      <Etiquette x={180 + (mesure * k) / 2} y={130} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        {`mesuré à la règle : ${nombre(mesure, 0)} mm`}
      </Etiquette>
      <Etiquette x={420} y={50} taille={11.5} classe="etiquette">
        échelle de la copie : ?
      </Etiquette>
      </g>
    </Figure>
  );
}
