// Schémas de compréhension du module L1.6 (dessin technique), leçons 3 et 4 : projections orthogonales et perspectives.
// Géométrie et longueurs tirées de lib/calc/dessin.ts.
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { cadrePerspective, DessinPrisme, dispositionVues, facesExtrusion, facesVues, projecteur, VuesProjetees } from '@/components/drawing/Projections';
import { Calque } from '@/components/gabarits/Vue3D';
import {
  cavaliere,
  isometrique,
  longueurFuyante,
  longueurIso,
  perspectiveMarches,
  profilMarches,
  vuesExtrusion,
  type DonneesMarches,
  type Point2,
  type Point3,
  type VuesExtrusion,
} from '@/lib/calc/dessin';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const n2 = (x: number) => nombre(x, 2);

/** Profil en L (bloc de deux marches montant vers la gauche), en m. */
const MARCHES: Point2[] = profilMarches({ n: 2, g: 0.3, h: 0.2 });

/** Maison simple : profil du pignon tiré sur la longueur (m). */
export const PROFIL_MAISON: Point2[] = [[0, 0], [5, 0], [5, 3], [2.5, 4.2], [0, 3]];

/** Flèche de dimension à deux pointes. */
function FlecheDouble({ x1, y1, x2, y2, couleur }: { x1: number; y1: number; x2: number; y2: number; couleur: string }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <Fleche x1={mx} y1={my} x2={x1} y2={y1} couleur={couleur} epaisseur={1.4} tete={7} />
      <Fleche x1={mx} y1={my} x2={x2} y2={y2} couleur={couleur} epaisseur={1.4} tete={7} />
    </g>
  );
}

/** Un prisme en perspective, posé dans un groupe à l'emplacement voulu. */
function Prisme({ profil, profondeur, vue, x, y, largeur, hauteur, couleur }: { profil: readonly Point2[]; profondeur: number; vue: Parameters<typeof projecteur>[0]; x: number; y: number; largeur: number; hauteur: number; couleur?: string }) {
  const { proj, vers } = projecteur(vue);
  const faces = facesVues(facesExtrusion(profil, profondeur), vers);
  const { P } = cadrePerspective(faces.flatMap((f) => f.pts.map(proj)), largeur, hauteur, 10);
  return (
    <g transform={`translate(${x} ${y})`}>
      <DessinPrisme faces={faces} P={P} proj={proj} couleur={couleur} />
    </g>
  );
}

// ---------- L1.6.3 : projections orthogonales ----------

/** Un objet, trois regards : de face, de dessus, de gauche. */
export function TroisRegards() {
  const { proj, vers } = projecteur({ mode: 'iso' });
  const faces = facesVues(facesExtrusion(MARCHES, 0.8), vers);
  const { P } = cadrePerspective(faces.flatMap((f) => f.pts.map(proj)), 300, 200, 24);
  const c = P(proj([0.3, 0.4, 0.2]));
  const ox = 160;
  const oy = 10;
  return (
    <Figure alt="Un bloc de deux marches regardé de trois côtés. De face, on voit son profil en escalier. De dessus, on voit deux rectangles côte à côte. De gauche, on voit un rectangle plein. Chaque regard donne une vue ; il en faut souvent trois pour décrire l'objet sans ambiguïté." largeur={620} hauteur={226}>
      <g transform={`translate(${ox} ${oy})`}>
        <DessinPrisme faces={faces} P={P} proj={proj} />
      </g>
      <Fleche x1={ox + c[0] - 150} y1={oy + c[1] + 86} x2={ox + c[0] - 40} y2={oy + c[1] + 22} couleur={BLEU} epaisseur={2.2} tete={9} />
      <Etiquette x={ox + c[0] - 160} y={oy + c[1] + 104} taille={12} gras couleur={BLEU}>
        de face
      </Etiquette>
      <Fleche x1={ox + c[0] + 10} y1={oy + 2} x2={ox + c[0] + 10} y2={oy + c[1] - 40} couleur={VERT} epaisseur={2.2} tete={9} />
      <Etiquette x={ox + c[0] + 20} y={oy + 14} taille={12} gras couleur={VERT}>
        de dessus
      </Etiquette>
      <Fleche x1={ox + c[0] - 190} y1={oy + c[1] - 70} x2={ox + c[0] - 96} y2={oy + c[1] - 16} couleur={ROUGE} epaisseur={2.2} tete={9} />
      <Etiquette x={ox + c[0] - 200} y={oy + c[1] - 80} taille={12} gras couleur={ROUGE}>
        de gauche
      </Etiquette>
    </Figure>
  );
}

/** Boîte de projection (méthode européenne) en perspective : l'objet, les trois plans, les rayons et les vues. */
export function BoiteProjectionIso() {
  // bloc de marches retourné (montée vers la droite) pour que l'observateur, à gauche, voie les contremarches
  const W = 0.6;
  const prof: Point2[] = MARCHES.map(([x, z]) => [W - x, z] as const).reverse();
  const D = 0.8;
  const z0 = 0.4;
  const yF = 1.25;
  const xP = 1.05;
  const v = vuesExtrusion(prof, D);
  // observateur en avant, à gauche et au-dessus : on voit les faces −x, −y et +z
  const pr = ([x, y, z]: Point3): Point2 => [(x - y) * Math.cos(Math.PI / 6), z + (x + y) * Math.sin(Math.PI / 6)];
  const tous: Point3[] = [[-0.1, -0.3, 0], [xP, -0.3, 0], [xP, yF, 0], [-0.1, yF, 0], [-0.1, yF, 1.1], [xP, yF, 1.1], [xP, -0.3, 1.1]];
  const { P } = cadrePerspective(tous.map(pr), 620, 360, 18);
  const Q = (q: Point3) => P(pr(q));
  const poly = (qs: Point3[]) => points(qs.map(Q));
  const plan = (qs: Point3[], nom: string, at: Point3) => (
    <g>
      <polygon points={poly(qs)} fill="var(--color-encre-clair)" fillOpacity={0.35} stroke={BLEU} strokeWidth={1} />
      <Etiquette x={Q(at)[0]} y={Q(at)[1]} ancre="middle" taille={11} gras couleur={BLEU}>
        {nom}
      </Etiquette>
    </g>
  );
  const faces = facesVues(
    facesExtrusion(prof, D).map((f) => ({ ...f, pts: f.pts.map(([x, y, z]) => [x, y, z + z0] as const) })),
    [-1, -1, 1],
  );
  const zHaut = (x: number) => Math.max(...prof.filter((p) => Math.abs(p[0] - x) < 1e-9).map((p) => p[1]));
  const cache = (vis: boolean) => (vis ? undefined : '4 3');
  return (
    <Figure alt="L'objet est placé dans un coin formé de trois plans : un plan frontal derrière lui, un plan horizontal en dessous, un plan de profil à sa droite. On le projette par des rayons parallèles : sur le plan frontal, la vue de face ; sur le plan horizontal, la vue de dessus ; sur le plan de profil, la vue de gauche, car on regarde l'objet depuis la gauche. C'est la méthode européenne." largeur={620} hauteur={360}>
      <Calque id="plans">
        {plan([[-0.1, -0.3, 0], [xP, -0.3, 0], [xP, yF, 0], [-0.1, yF, 0]], 'plan horizontal', [0.85, -0.22, 0])}
        {plan([[-0.1, yF, 0], [xP, yF, 0], [xP, yF, 1.1], [-0.1, yF, 1.1]], 'plan frontal', [0.45, yF, 1.0])}
        {plan([[xP, -0.3, 0], [xP, yF, 0], [xP, yF, 1.1], [xP, -0.3, 1.1]], 'plan de profil', [xP, 0.1, 1.0])}
      </Calque>
      <Calque id="vues">
        <polygon points={poly(prof.map(([x, z]) => [x, yF, z + z0] as const))} fill="var(--color-beton-clair)" stroke={ROUGE} strokeWidth={1.6} />
        <polygon points={poly([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]])} fill="var(--color-beton-clair)" stroke={ROUGE} strokeWidth={1.6} />
        {v.dessus.map((l) => (
          <line key={`d${l.position}`} x1={Q([l.position, 0, 0])[0]} y1={Q([l.position, 0, 0])[1]} x2={Q([l.position, D, 0])[0]} y2={Q([l.position, D, 0])[1]} stroke={ROUGE} strokeWidth={1.4} strokeDasharray={cache(l.visible)} />
        ))}
        <polygon points={poly([[xP, 0, z0], [xP, D, z0], [xP, D, z0 + 0.4], [xP, 0, z0 + 0.4]])} fill="var(--color-beton-clair)" stroke={ROUGE} strokeWidth={1.6} />
        {v.gauche.map((l) => (
          <line key={`g${l.position}`} x1={Q([xP, 0, l.position + z0])[0]} y1={Q([xP, 0, l.position + z0])[1]} x2={Q([xP, D, l.position + z0])[0]} y2={Q([xP, D, l.position + z0])[1]} stroke={ROUGE} strokeWidth={1.4} strokeDasharray={cache(l.visible)} />
        ))}
      </Calque>
      <Calque id="rayons">
        {prof.map(([x, z], i) => (
          <line key={`rf${i}`} x1={Q([x!, 0, z! + z0])[0]} y1={Q([x!, 0, z! + z0])[1]} x2={Q([x!, yF, z! + z0])[0]} y2={Q([x!, yF, z! + z0])[1]} stroke={VERT} strokeWidth={0.8} strokeDasharray="3 3" />
        ))}
        {[[0, 0], [W, D], [0, D]].map(([x, y], i) => (
          <line key={`rd${i}`} x1={Q([x!, y!, z0 + zHaut(x!)])[0]} y1={Q([x!, y!, z0 + zHaut(x!)])[1]} x2={Q([x!, y!, 0])[0]} y2={Q([x!, y!, 0])[1]} stroke={VERT} strokeWidth={0.8} strokeDasharray="3 3" />
        ))}
        {[[0, 0, 0], [0, D, 0.2], [W / 2, 0, 0.4]].map(([x, y, z], i) => (
          <line key={`rg${i}`} x1={Q([x!, y!, z! + z0])[0]} y1={Q([x!, y!, z! + z0])[1]} x2={Q([xP, y!, z! + z0])[0]} y2={Q([xP, y!, z! + z0])[1]} stroke={VERT} strokeWidth={0.8} strokeDasharray="3 3" />
        ))}
      </Calque>
      <Calque id="objet">
        {faces.map((f, i) => {
          const pts = poly(f.pts);
          const [nx, , nz] = f.normale;
          return (
            <g key={i}>
              <polygon points={pts} fill="var(--color-beton-clair)" />
              {!f.avant ? <polygon points={pts} fill={nz > Math.abs(nx) ? 'var(--halo)' : 'var(--trait)'} fillOpacity={nz > Math.abs(nx) ? 0.25 : 0.14} /> : null}
              <polygon points={pts} fill="none" className="t-fort" strokeLinejoin="round" />
            </g>
          );
        })}
      </Calque>
    </Figure>
  );
}

/** On rabat les plans horizontal et de profil dans le plan frontal : c'est la disposition des vues. */
export function DepliageVues() {
  const k = 70;
  const W = 0.6;
  const H = 0.4;
  const D = 0.8;
  const v = vuesExtrusion(MARCHES, D);
  const ox = 70;
  const oy = 20;
  const F = { x: ox, y: oy, w: 200, h: 120 };
  const Hp = { x: ox, y: oy + 120, w: 200, h: 100 };
  const Pp = { x: ox + 200, y: oy, w: 100, h: 120 };
  const cadre = (r: typeof F, nom: string) => (
    <g>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="var(--color-encre-clair)" fillOpacity={0.3} stroke={BLEU} />
      <Etiquette x={r.x + 6} y={r.y + 14} taille={10} couleur={BLEU}>
        {nom}
      </Etiquette>
    </g>
  );
  const fx = F.x + 50;
  const fz = F.y + 100;
  return (
    <Figure alt="Les trois plans de projection dépliés à plat. Le plan horizontal tourne d'un quart de tour vers le bas autour de son arête commune avec le plan frontal ; le plan de profil tourne vers la droite. La vue de dessus se retrouve sous la vue de face, la vue de gauche à droite de la vue de face : c'est la disposition européenne." largeur={620} hauteur={268}>
      {cadre(F, 'plan frontal')}
      {cadre(Hp, 'plan horizontal')}
      {cadre(Pp, 'plan de profil')}
      <polygon points={points(MARCHES.map(([x, z]) => [fx + x * k, fz - z * k] as const))} fill="var(--color-beton-clair)" className="t-fort" />
      <rect x={fx} y={Hp.y + 20} width={W * k} height={D * k * 0.85} fill="var(--color-beton-clair)" className="t-fort" />
      {v.dessus.map((l) => (
        <line key={l.position} x1={fx + l.position * k} y1={Hp.y + 20} x2={fx + l.position * k} y2={Hp.y + 20 + D * k * 0.85} className={l.visible ? 't-fort' : 't-cache'} />
      ))}
      <rect x={Pp.x + 15} y={fz - H * k} width={D * k * 0.85} height={H * k} fill="var(--color-beton-clair)" className="t-fort" />
      {v.gauche.map((l) => (
        <line key={l.position} x1={Pp.x + 15} y1={fz - l.position * k} x2={Pp.x + 15 + D * k * 0.85} y2={fz - l.position * k} className={l.visible ? 't-fort' : 't-cache'} />
      ))}
      <line x1={F.x} y1={F.y + F.h} x2={F.x + F.w} y2={F.y + F.h} stroke={ROUGE} strokeWidth={2} strokeDasharray="6 3" />
      <line x1={F.x + F.w} y1={F.y} x2={F.x + F.w} y2={F.y + F.h} stroke={ROUGE} strokeWidth={2} strokeDasharray="6 3" />
      <path d={`M${F.x - 16} ${F.y + F.h - 30} q -30 40 0 80`} fill="none" stroke={ROUGE} strokeWidth={1.6} />
      <polygon points={points([[F.x - 16, F.y + F.h + 50], [F.x - 22, F.y + F.h + 40], [F.x - 10, F.y + F.h + 41]])} fill={ROUGE} />
      <path d={`M${Pp.x + 30} ${F.y - 4} q 40 -16 80 0`} fill="none" stroke={ROUGE} strokeWidth={1.6} />
      <polygon points={points([[Pp.x + 110, F.y - 4], [Pp.x + 100, F.y - 10], [Pp.x + 101, F.y + 2]])} fill={ROUGE} />
      <Etiquette x={400} y={60} taille={11.5}>
        le plan de profil tourne
      </Etiquette>
      <Etiquette x={400} y={76} taille={11.5}>
        vers la droite
      </Etiquette>
      <Etiquette x={300} y={200} taille={11.5}>
        le plan horizontal tourne
      </Etiquette>
      <Etiquette x={300} y={216} taille={11.5}>
        vers le bas
      </Etiquette>
      <Etiquette x={300} y={252} taille={11} classe="etiquette">
        arêtes de rotation en tirets rouges
      </Etiquette>
    </Figure>
  );
}

/** Symboles de la méthode européenne (premier dièdre) et de la méthode américaine (troisième dièdre). */
export function SymboleDiedre() {
  const symbole = (x: number, europe: boolean) => {
    const tronc = (x0: number) => (
      <g>
        <polygon points={points([[x0, 52], [x0 + 70, 34], [x0 + 70, 106], [x0, 88]])} fill="none" className="t-fort" />
        <line x1={x0 - 8} y1={70} x2={x0 + 78} y2={70} className="t-axe" />
      </g>
    );
    const cercles = (cx: number) => (
      <g>
        <circle cx={cx} cy={70} r={36} fill="none" className="t-fort" />
        <circle cx={cx} cy={70} r={18} fill="none" className="t-fort" />
        <line x1={cx - 44} y1={70} x2={cx + 44} y2={70} className="t-axe" />
      </g>
    );
    return (
      <g>
        {europe ? (
          <>
            {tronc(x)}
            {cercles(x + 140)}
          </>
        ) : (
          <>
            {cercles(x + 36)}
            {tronc(x + 106)}
          </>
        )}
      </g>
    );
  };
  return (
    <Figure alt="Les deux symboles de projection, dessinés dans le cartouche. Méthode européenne (premier dièdre) : la vue de gauche du tronc de cône, deux cercles, est placée à droite de sa vue de face. Méthode américaine (troisième dièdre) : les cercles sont à gauche. Le symbole dit dans quel ordre lire les vues." largeur={620} hauteur={160}>
      {symbole(40, true)}
      <Etiquette x={125} y={140} ancre="middle" taille={11.5} gras couleur={VERT}>
        méthode européenne (1er dièdre)
      </Etiquette>
      {symbole(350, false)}
      <Etiquette x={440} y={140} ancre="middle" taille={11.5} gras>
        méthode américaine (3e dièdre)
      </Etiquette>
    </Figure>
  );
}

/** Les trois vues ont deux à deux une dimension commune : largeur, hauteur, profondeur. */
export function CorrespondancesVues({ v }: { v: VuesExtrusion }) {
  return (
    <VuesProjetees
      v={v}
      alt={`Les trois vues partagent leurs dimensions deux à deux. La vue de face et la vue de dessus ont la même largeur (${n2(v.largeur)} m) et sont alignées verticalement. La vue de face et la vue de gauche ont la même hauteur (${n2(v.hauteur)} m) et sont alignées horizontalement. La vue de dessus et la vue de gauche ont la même profondeur (${n2(v.profondeur)} m), reportée par la ligne à 45°.`}
      echelle={200}
      rappels
      annotations={(d) => (
        <g>
          <FlecheDouble x1={d.x0} y1={d.yTop + d.D + 26} x2={d.x0 + d.W} y2={d.yTop + d.D + 26} couleur={BLEU} />
          <Etiquette x={d.x0 + d.W / 2} y={d.yTop + d.D + 42} ancre="middle" taille={11} gras couleur={BLEU}>
            largeur commune
          </Etiquette>
          <FlecheDouble x1={d.x0 - 16} y1={d.y0 + d.H} x2={d.x0 - 16} y2={d.y0} couleur={VERT} />
          <Etiquette x={d.x0 - 22} y={d.y0 + d.H / 2} ancre="middle" taille={11} gras couleur={VERT} rotation={-90}>
            hauteur
          </Etiquette>
          <FlecheDouble x1={d.xl} y1={d.y0 - 12} x2={d.xl + d.D} y2={d.y0 - 12} couleur={ROUGE} />
          <Etiquette x={d.xl + d.D / 2} y={d.y0 - 18} ancre="middle" taille={11} gras couleur={ROUGE}>
            profondeur
          </Etiquette>
          <FlecheDouble x1={d.x0 + d.W + 12} y1={d.yTop} x2={d.x0 + d.W + 12} y2={d.yTop + d.D} couleur={ROUGE} />
        </g>
      )}
      noms
      marge={34}
    />
  );
}

/** Disposition européenne et disposition américaine des mêmes vues. */
export function DeuxDispositions() {
  const bloc = (x: number, y: number, t: string, c = BLEU) => (
    <g>
      <rect x={x} y={y} width={84} height={44} rx={4} fill="var(--color-encre-clair)" fillOpacity={0.4} stroke={c} />
      <Etiquette x={x + 42} y={y + 27} ancre="middle" taille={11} gras couleur={c}>
        {t}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="À gauche, la disposition européenne : la vue de dessus sous la vue de face, la vue de gauche à droite. À droite, la disposition américaine : la vue de dessus au-dessus de la vue de face, la vue de droite à droite. Confondre les deux inverse la lecture du plan." largeur={620} hauteur={200}>
      {bloc(40, 30, 'face')}
      {bloc(140, 30, 'gauche')}
      {bloc(40, 90, 'dessus')}
      <Etiquette x={130} y={170} ancre="middle" taille={12} gras couleur={VERT}>
        européenne (en France, en RDC)
      </Etiquette>
      {bloc(370, 90, 'face', 'var(--trait)')}
      {bloc(470, 90, 'droite', 'var(--trait)')}
      {bloc(370, 30, 'dessus', 'var(--trait)')}
      <Etiquette x={460} y={170} ancre="middle" taille={12} gras>
        américaine
      </Etiquette>
      <line x1={310} y1={20} x2={310} y2={150} className="t-fin" />
    </Figure>
  );
}

/** Deux objets aux mêmes contours : seules les arêtes cachées les distinguent. */
export function DeuxObjetsMemesVues() {
  const L = 1.2;
  const P = 0.6;
  const H = 0.6;
  const box: Point2[] = [[0, 0], [L, 0], [L, H], [0, H]];
  const { proj, vers } = projecteur({ mode: 'iso' });
  const faces = facesVues(facesExtrusion(box, P), vers);
  const { P: Pc } = cadrePerspective(faces.flatMap((f) => f.pts.map(proj)), 190, 130, 12);
  const trou: Point3[] = [[L, 0.2, 0.2], [L, 0.4, 0.2], [L, 0.4, 0.4], [L, 0.2, 0.4]];
  const s = 110;
  const face = (x: number, y: number, perce: boolean) => (
    <g>
      <rect x={x} y={y} width={L * s} height={H * s} fill="var(--color-beton-clair)" className="t-fort" />
      {perce ? <path d={`M${x} ${y + (H - 0.4) * s}h${L * s}M${x} ${y + (H - 0.2) * s}h${L * s}`} className="t-cache" strokeWidth={1.1} /> : null}
    </g>
  );
  return (
    <Figure alt="Deux blocs de même encombrement : l'un est plein, l'autre est traversé de part en part par un fourreau. Leurs vues de face ont le même contour ; seuls les deux traits interrompus du fourreau caché les distinguent. Sans arêtes cachées, le dessin ne permet pas de savoir quel bloc construire." largeur={620} hauteur={300}>
      <g transform="translate(40 4)">
        <DessinPrisme faces={faces} P={Pc} proj={proj} />
      </g>
      <g transform="translate(360 4)">
        <DessinPrisme faces={faces} P={Pc} proj={proj} />
        <polygon points={points(trou.map((q) => Pc(proj(q))))} fill="var(--trait)" fillOpacity={0.55} />
      </g>
      <Etiquette x={135} y={150} ancre="middle" taille={11.5} gras>
        bloc plein
      </Etiquette>
      <Etiquette x={455} y={150} ancre="middle" taille={11.5} gras>
        bloc percé d’un fourreau
      </Etiquette>
      {face(70, 170, false)}
      {face(390, 170, true)}
      <Etiquette x={136} y={258} ancre="middle" taille={11}>
        vue de face
      </Etiquette>
      <Etiquette x={456} y={258} ancre="middle" taille={11}>
        vue de face : le fourreau en tirets
      </Etiquette>
      <Etiquette x={310} y={290} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        sans les tirets, les deux vues seraient identiques
      </Etiquette>
    </Figure>
  );
}

/** Les trois vues d'un regard de visite en béton : cavité, ouverture du tampon et canalisation d'arrivée. */
export function RegardTroisVues() {
  const s = 92;
  const B = 1;
  const H = 1.2;
  const e = 0.15;
  const o = 0.6;
  const r = 0.15;
  const ox = 70;
  const oy = 24;
  const g = 44;
  const X = (x: number) => ox + x * s;
  const Z = (z: number) => oy + (H - z) * s;
  const yTop = oy + H * s + g;
  const xl = ox + B * s + g;
  return (
    <Figure alt="Les trois vues d'un regard de visite en béton, carré, de 1,00 m de côté et 1,20 m de haut, parois de 0,15 m. Vue de face : le contour, la canalisation d'arrivée vue en bout (un cercle), la cavité intérieure et l'ouverture du tampon en traits interrompus. Vue de dessus : l'ouverture carrée du tampon vue, la cavité et la canalisation cachées. Vue de gauche : la cavité et la canalisation cachées." largeur={620} hauteur={yTop + B * s + 34}>
      <rect x={X(0)} y={Z(H)} width={B * s} height={H * s} fill="var(--color-beton-clair)" className="t-fort" />
      <rect x={X(e)} y={Z(H - e)} width={(B - 2 * e) * s} height={(H - 2 * e) * s} fill="none" className="t-cache" />
      <path d={`M${X((B - o) / 2)} ${Z(H)}V${Z(H - e)}M${X((B + o) / 2)} ${Z(H)}V${Z(H - e)}`} className="t-cache" />
      <circle cx={X(B / 2)} cy={Z(0.45)} r={r * s} fill="var(--color-papier)" className="t-fort" />
      <rect x={X(0)} y={yTop} width={B * s} height={B * s} fill="var(--color-beton-clair)" className="t-fort" />
      <rect x={X(e)} y={yTop + e * s} width={(B - 2 * e) * s} height={(B - 2 * e) * s} fill="none" className="t-cache" />
      <rect x={X((B - o) / 2)} y={yTop + ((B - o) / 2) * s} width={o * s} height={o * s} fill="var(--color-papier)" className="t-fort" />
      <path d={`M${X(B / 2 - r)} ${yTop + B * s}v${-e * s}M${X(B / 2 + r)} ${yTop + B * s}v${-e * s}`} className="t-cache" />
      <rect x={xl} y={Z(H)} width={B * s} height={H * s} fill="var(--color-beton-clair)" className="t-fort" />
      <rect x={xl + e * s} y={Z(H - e)} width={(B - 2 * e) * s} height={(H - 2 * e) * s} fill="none" className="t-cache" />
      <path d={`M${xl + (B - e) * s} ${Z(0.45 + r)}h${e * s}M${xl + (B - e) * s} ${Z(0.45 - r)}h${e * s}`} className="t-cache" />
      <path d={`M${xl + ((B - o) / 2) * s} ${Z(H)}v${e * s}M${xl + ((B + o) / 2) * s} ${Z(H)}v${e * s}`} className="t-cache" />
      <Cote x1={X(0)} y1={Z(H)} x2={X(B)} y2={Z(H)} decalage={12} texte={n2(B)} taille={10.5} />
      <Cote x1={X(0)} y1={Z(0)} x2={X(0)} y2={Z(H)} decalage={14} texte={n2(H)} taille={10.5} />
      <Etiquette x={X(B / 2)} y={Z(0) + 16} ancre="middle" taille={11} gras couleur={BLEU}>
        vue de face
      </Etiquette>
      <Etiquette x={X(B / 2)} y={yTop + B * s + 18} ancre="middle" taille={11} gras couleur={BLEU}>
        vue de dessus
      </Etiquette>
      <Etiquette x={xl + (B * s) / 2} y={Z(0) + 16} ancre="middle" taille={11} gras couleur={BLEU}>
        vue de gauche
      </Etiquette>
      <Etiquette x={xl + B * s + 16} y={yTop + 30} taille={11}>
        traits interrompus :
      </Etiquette>
      <Etiquette x={xl + B * s + 16} y={yTop + 46} taille={11}>
        parois et canalisation
      </Etiquette>
      <Etiquette x={xl + B * s + 16} y={yTop + 62} taille={11}>
        cachées
      </Etiquette>
    </Figure>
  );
}

/** Exercice : un bloc en perspective et trois vues de dessus proposées. */
export function QuelleVueDessus() {
  const v = vuesExtrusion(MARCHES, 0.8);
  const s = 120;
  const cand = (x: number, nom: string, lignes: { x: number; vis: boolean }[]) => (
    <g>
      <rect x={x} y={150} width={0.6 * s} height={0.8 * s} fill="var(--color-beton-clair)" className="t-fort" />
      {lignes.map((l) => (
        <line key={l.x} x1={x + l.x * s} y1={150} x2={x + l.x * s} y2={150 + 0.8 * s} className={l.vis ? 't-fort' : 't-cache'} />
      ))}
      <Etiquette x={x + 0.3 * s} y={270} ancre="middle" taille={13} gras couleur={BLEU}>
        {nom}
      </Etiquette>
    </g>
  );
  const milieu = v.dessus.find((l) => l.position > 0 && l.position < v.largeur)!;
  return (
    <Figure alt="Un bloc de deux marches en perspective, et trois vues de dessus proposées : A, un rectangle partagé par un trait continu ; B, le même rectangle partagé par un trait interrompu ; C, un rectangle partagé par deux traits continus." largeur={620} hauteur={282}>
      <Prisme profil={MARCHES} profondeur={0.8} vue={{ mode: 'iso' }} x={180} y={0} largeur={260} hauteur={140} />
      {cand(150, 'A', [{ x: milieu.position, vis: true }])}
      {cand(270, 'B', [{ x: milieu.position, vis: false }])}
      {cand(390, 'C', [{ x: 0.2, vis: true }, { x: 0.4, vis: true }])}
    </Figure>
  );
}

// ---------- L1.6.4 : perspectives ----------

/** Une perspective montre trois faces à la fois : l'avant, le dessus et le côté. */
export function TroisFacesIso() {
  const prof: Point2[] = [[0, 0], [1.2, 0], [1.2, 0.7], [0, 0.7]];
  const { proj, vers } = projecteur({ mode: 'iso' });
  const faces = facesVues(facesExtrusion(prof, 0.9), vers);
  const { P } = cadrePerspective(faces.flatMap((f) => f.pts.map(proj)), 360, 230, 20);
  const Q = (q: Point3) => P(proj(q));
  const av = Q([0.6, 0, 0.35]);
  const de = Q([0.6, 0.45, 0.7]);
  const co = Q([1.2, 0.45, 0.35]);
  return (
    <Figure alt="Un pavé dessiné en perspective isométrique : on voit à la fois sa face avant, son dessus et son côté droit. Une seule image donne une idée immédiate de la forme, mais aucune face n'y est dessinée en vraie grandeur." largeur={620} hauteur={230}>
      <g transform="translate(40 0)">
        <DessinPrisme faces={faces} P={P} proj={proj} />
        <Etiquette x={av[0]} y={av[1] + 4} ancre="middle" taille={12} gras couleur={BLEU}>
          avant
        </Etiquette>
        <Etiquette x={de[0]} y={de[1] + 4} ancre="middle" taille={12} gras couleur={VERT}>
          dessus
        </Etiquette>
        <Etiquette x={co[0]} y={co[1] + 4} ancre="middle" taille={12} gras couleur={ROUGE}>
          côté
        </Etiquette>
      </g>
      <Etiquette x={420} y={90} taille={12}>
        trois faces sur une image :
      </Etiquette>
      <Etiquette x={420} y={108} taille={12}>
        on comprend la forme
      </Etiquette>
      <Etiquette x={420} y={126} taille={12}>
        d’un coup d’œil
      </Etiquette>
    </Figure>
  );
}

/** Les axes de l'isométrie : trois directions à 120°, les horizontales à 30° de l'horizontale. */
export function AxesIsometriques() {
  const O: Point2 = [250, 130];
  const l = 110;
  const dir = (deg: number): Point2 => [O[0] + l * Math.cos((deg * Math.PI) / 180), O[1] - l * Math.sin((deg * Math.PI) / 180)];
  const a = dir(210);
  const b = dir(330);
  const c = dir(90);
  const arc = (d0: number, d1: number, r: number) => {
    const p = (d: number) => [O[0] + r * Math.cos((d * Math.PI) / 180), O[1] - r * Math.sin((d * Math.PI) / 180)];
    const [x0, y0] = p(d0);
    const [x1, y1] = p(d1);
    return `M${x0} ${y0} A${r} ${r} 0 0 0 ${x1} ${y1}`;
  };
  return (
    <Figure alt="Les trois axes de la perspective isométrique partent d'un même point et font entre eux des angles de 120° : un axe vertical et deux axes inclinés à 30° au-dessus de l'horizontale, l'un vers la gauche, l'autre vers la droite. Toutes les arêtes de l'objet parallèles à ces axes sont tracées en vraie grandeur." largeur={620} hauteur={270}>
      <line x1={O[0] - 160} y1={O[1]} x2={O[0] + 160} y2={O[1]} className="t-fin" strokeDasharray="4 4" />
      <Fleche x1={O[0]} y1={O[1]} x2={a[0]} y2={a[1]} couleur={BLEU} epaisseur={2.2} tete={9} />
      <Fleche x1={O[0]} y1={O[1]} x2={b[0]} y2={b[1]} couleur={ROUGE} epaisseur={2.2} tete={9} />
      <Fleche x1={O[0]} y1={O[1]} x2={c[0]} y2={c[1]} couleur={VERT} epaisseur={2.2} tete={9} />
      <path d={arc(330, 360, 52)} fill="none" stroke={ROUGE} strokeWidth={1} />
      <Etiquette x={O[0] + 60} y={O[1] + 20} taille={11} couleur={ROUGE}>
        30°
      </Etiquette>
      <path d={arc(180, 210, 52)} fill="none" stroke={BLEU} strokeWidth={1} />
      <Etiquette x={O[0] - 84} y={O[1] + 20} taille={11} couleur={BLEU}>
        30°
      </Etiquette>
      <path d={arc(210, 330, 30)} fill="none" className="t-fin" />
      <Etiquette x={O[0]} y={O[1] + 46} ancre="middle" taille={11}>
        120°
      </Etiquette>
      <path d={arc(90, 210, 24)} fill="none" className="t-fin" />
      <Etiquette x={O[0] - 40} y={O[1] - 22} ancre="end" taille={11}>
        120°
      </Etiquette>
      <Etiquette x={a[0] - 6} y={a[1] + 16} ancre="end" taille={12} gras couleur={BLEU}>
        longueur
      </Etiquette>
      <Etiquette x={b[0] + 6} y={b[1] + 16} taille={12} gras couleur={ROUGE}>
        profondeur
      </Etiquette>
      <Etiquette x={c[0] + 8} y={c[1] + 6} taille={12} gras couleur={VERT}>
        hauteur
      </Etiquette>
      <Etiquette x={440} y={200} taille={11.5}>
        on reporte les longueurs
      </Etiquette>
      <Etiquette x={440} y={216} taille={11.5}>
        sur ces trois axes,
      </Etiquette>
      <Etiquette x={440} y={232} taille={11.5}>
        en vraie grandeur
      </Etiquette>
    </Figure>
  );
}

/** Méthode de la boîte : la boîte englobante, l'entaille, puis l'objet. */
export function MethodeBoite() {
  const n = 2;
  const g = 0.3;
  const h = 0.2;
  const D = 0.8;
  const W = n * g;
  const Hh = n * h;
  const proj = isometrique;
  const tous: Point3[] = [[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0], [0, 0, Hh], [W, 0, Hh], [W, D, Hh], [0, D, Hh]];
  const { P } = cadrePerspective(tous.map(proj), 190, 190, 16);
  const Q = (q: Point3) => P(proj(q));
  const seg = (a: Point3, b: Point3, cls: string, c?: string) => <line x1={Q(a)[0]} y1={Q(a)[1]} x2={Q(b)[0]} y2={Q(b)[1]} className={cls} stroke={c} />;
  const boite = (cls: string, c?: string) => (
    <g>
      {seg([0, 0, 0], [W, 0, 0], cls, c)}
      {seg([W, 0, 0], [W, D, 0], cls, c)}
      {seg([0, 0, 0], [0, 0, Hh], cls, c)}
      {seg([W, 0, 0], [W, 0, Hh], cls, c)}
      {seg([W, D, 0], [W, D, Hh], cls, c)}
      {seg([0, 0, Hh], [W, 0, Hh], cls, c)}
      {seg([W, 0, Hh], [W, D, Hh], cls, c)}
      {seg([0, 0, Hh], [0, D, Hh], cls, c)}
      {seg([0, D, Hh], [W, D, Hh], cls, c)}
    </g>
  );
  const { proj: pj, vers } = projecteur({ mode: 'iso' });
  const faces = facesVues(facesExtrusion(profilMarches({ n, g, h }), D), vers);
  return (
    <Figure alt="Méthode de la boîte en trois temps. 1 : on trace en trait fin la boîte qui enveloppe l'objet, avec ses vraies longueurs sur les trois axes. 2 : on y reporte l'entaille des marches. 3 : on efface les traits de construction et l'on repasse l'objet en trait fort." largeur={620} hauteur={230}>
      <g transform="translate(10 0)">{boite('t-moyen')}</g>
      <g transform="translate(215 0)">
        {boite('t-fin')}
        {seg([g, 0, Hh], [g, 0, h], 't-moyen', ROUGE)}
        {seg([g, 0, h], [W, 0, h], 't-moyen', ROUGE)}
        {seg([g, 0, Hh], [g, D, Hh], 't-moyen', ROUGE)}
        {seg([W, 0, h], [W, D, h], 't-moyen', ROUGE)}
        {seg([g, 0, h], [g, D, h], 't-moyen', ROUGE)}
      </g>
      <g transform="translate(420 0)">
        <DessinPrisme faces={faces} P={P} proj={pj} />
      </g>
      {['1. la boîte', '2. l’entaille', '3. l’objet'].map((t, i) => (
        <Etiquette key={t} x={105 + i * 205} y={218} ancre="middle" taille={12} gras couleur={BLEU}>
          {t}
        </Etiquette>
      ))}
    </Figure>
  );
}

/** Un cube d'un mètre en cavalière à 45°, avec trois coefficients de réduction. */
export function CavaliereCoefficients() {
  const cube: Point2[] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const ks = [0.5, 0.7, 1];
  return (
    <Figure alt={`Le même cube d'un mètre dessiné en perspective cavalière à 45° avec trois coefficients de réduction : ${ks.map((k) => `k = ${nombre(k, 1)}, fuyante dessinée ${n2(longueurFuyante(1, k))} m`).join(' ; ')}. Avec k = 1, le cube paraît trop profond ; k = 0,5 donne l'aspect le plus juste.`} largeur={620} hauteur={220}>
      {ks.map((k, i) => (
        <g key={k}>
          <Prisme profil={cube} profondeur={1} vue={{ mode: 'cavaliere', alpha: 45, k }} x={10 + i * 205} y={0} largeur={190} hauteur={170} />
          <Etiquette x={105 + i * 205} y={186} ancre="middle" taille={12} gras couleur={k === 0.5 ? VERT : undefined}>
            {`k = ${nombre(k, 1)}`}
          </Etiquette>
          <Etiquette x={105 + i * 205} y={204} ancre="middle" taille={11}>
            {`fuyante : ${n2(longueurFuyante(1, k))} m pour 1 m`}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Cercles en perspective : un tuyau en cavalière (cercles vrais), un cube en isométrie (ellipses). */
export function CerclesPerspective() {
  const alpha = 45;
  const k = 0.5;
  const r = 0.5;
  const L = 1.6;
  const s = 80;
  const cav = (q: Point3) => cavaliere(q, alpha, k);
  const ox = 90;
  const oy = 140;
  const C = (q: Point3): Point2 => [ox + cav(q)[0] * s, oy - cav(q)[1] * s];
  const [dx, dy] = [C([0, L, 0])[0] - C([0, 0, 0])[0], C([0, L, 0])[1] - C([0, 0, 0])[1]];
  const nrm = Math.hypot(dx, dy);
  const [tx, ty] = [(-dy / nrm) * r * s, (dx / nrm) * r * s];
  const c0 = C([0, 0, 0]);
  const c1 = C([0, L, 0]);
  const cercleIso = (centre: Point3, plan: 'avant' | 'dessus') =>
    points(
      Array.from({ length: 61 }, (_, i) => {
        const t = (i / 60) * 2 * Math.PI;
        const q: Point3 = plan === 'avant' ? [centre[0] + 0.4 * Math.cos(t), centre[1], centre[2] + 0.4 * Math.sin(t)] : [centre[0] + 0.4 * Math.cos(t), centre[1] + 0.4 * Math.sin(t), centre[2]];
        const [u, v] = isometrique(q);
        return [380 + u * 110, 152 - v * 110] as const;
      }),
    );
  const cube: Point2[] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const { proj, vers } = projecteur({ mode: 'iso' });
  const faces = facesVues(facesExtrusion(cube, 1), vers);
  const Pi = (q: Point2): Point2 => [380 + q[0] * 110, 152 - q[1] * 110];
  return (
    <Figure alt="À gauche, un tuyau en perspective cavalière : la face avant, parallèle au tableau, reste un vrai cercle ; le cercle du fond est le même, décalé le long de la fuyante. À droite, un cube en perspective isométrique : un cercle dessiné sur une face devient une ellipse, sur toutes les faces." largeur={620} hauteur={226}>
      <path d={`M${c0[0] + tx} ${c0[1] + ty}L${c1[0] + tx} ${c1[1] + ty}M${c0[0] - tx} ${c0[1] - ty}L${c1[0] - tx} ${c1[1] - ty}`} className="t-fort" />
      <circle cx={c1[0]} cy={c1[1]} r={r * s} fill="var(--color-beton-clair)" className="t-moyen" />
      <path d={`M${c0[0] + tx} ${c0[1] + ty}L${c1[0] + tx} ${c1[1] + ty}L${c1[0] - tx} ${c1[1] - ty}L${c0[0] - tx} ${c0[1] - ty}Z`} fill="var(--color-beton-clair)" />
      <path d={`M${c0[0] + tx} ${c0[1] + ty}L${c1[0] + tx} ${c1[1] + ty}M${c0[0] - tx} ${c0[1] - ty}L${c1[0] - tx} ${c1[1] - ty}`} className="t-fort" />
      <circle cx={c0[0]} cy={c0[1]} r={r * s} fill="var(--color-beton-clair)" className="t-fort" />
      <circle cx={c0[0]} cy={c0[1]} r={(r - 0.08) * s} fill="var(--color-papier)" className="t-fort" />
      <Etiquette x={c0[0] + 40} y={218} ancre="middle" taille={11.5} gras>
        cavalière : vrai cercle à l’avant
      </Etiquette>
      <DessinPrisme faces={faces} P={Pi} proj={proj} />
      <polygon points={cercleIso([0.5, 0, 0.5], 'avant')} fill="none" stroke={ROUGE} strokeWidth={1.6} />
      <polygon points={cercleIso([0.5, 0.5, 1], 'dessus')} fill="none" stroke={ROUGE} strokeWidth={1.6} />
      <Etiquette x={470} y={218} ancre="middle" taille={11.5} gras>
        isométrie : des ellipses
      </Etiquette>
    </Figure>
  );
}

/** Erreur : des fuyantes qui convergent ne sont plus une cavalière. */
export function ErreurFuyantes() {
  const ox = 60;
  const oy = 166;
  const face = (x: number) => <rect x={x} y={oy - 90} width={110} height={90} fill="var(--color-beton-clair)" className="t-fort" />;
  const fx = 60;
  const fy = -60;
  return (
    <Figure alt="À gauche, des fuyantes tracées vers un point de fuite : elles se rapprochent, le dessin devient une perspective conique, que l'on ne cote pas. À droite, en cavalière, les fuyantes restent parallèles et de même longueur." largeur={620} hauteur={196}>
      {(() => {
        const V: Point2 = [ox + 250, oy - 150];
        const t = 0.32;
        const vers = (p: Point2): Point2 => [p[0] + (V[0] - p[0]) * t, p[1] + (V[1] - p[1]) * t];
        const coins: Point2[] = [[ox, oy - 90], [ox + 110, oy - 90], [ox + 110, oy]];
        const fond = coins.map(vers);
        return (
          <g>
            {coins.map((p, i) => (
              <line key={i} x1={p[0]} y1={p[1]} x2={fond[i]![0]} y2={fond[i]![1]} className="t-moyen" stroke={ROUGE} />
            ))}
            <polyline points={points(fond)} fill="none" className="t-moyen" stroke={ROUGE} />
            {coins.map((p, i) => (
              <line key={`v${i}`} x1={fond[i]![0]} y1={fond[i]![1]} x2={V[0]} y2={V[1]} stroke={ROUGE} strokeWidth={0.6} strokeDasharray="3 3" />
            ))}
            <circle cx={V[0]} cy={V[1]} r={3} fill={ROUGE} />
          </g>
        );
      })()}
      {face(ox)}
      <Etiquette x={ox + 70} y={182} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        ✗ fuyantes qui se rejoignent
      </Etiquette>
      <path d={`M${370 + 110} ${oy - 90}l${fx} ${fy}M${370 + 110} ${oy}l${fx} ${fy}M${370} ${oy - 90}l${fx} ${fy}M${370 + fx} ${oy - 90 + fy}h110v90`} className="t-moyen" />
      {face(370)}
      <Etiquette x={430} y={182} ancre="middle" taille={11.5} gras couleur={VERT}>
        ✓ fuyantes parallèles
      </Etiquette>
    </Figure>
  );
}

/** Erreur : en isométrie, seules les arêtes parallèles aux axes gardent leur longueur ; les diagonales non. */
export function DiagonaleIso() {
  const proj = isometrique;
  const s = 105;
  const ox = 150;
  const oy = 110;
  const Q = (q: Point3): Point2 => [ox + proj(q)[0] * s, oy - proj(q)[1] * s];
  const d1 = longueurIso([0, 0, 0], [1, 1, 0]);
  const d2 = longueurIso([1, 0, 0], [0, 1, 0]);
  const vraie = Math.SQRT2;
  const carre: Point3[] = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]];
  return (
    <Figure alt={`Le dessus carré d'un cube d'un mètre, vu en isométrie. Ses côtés, parallèles aux axes, mesurent bien 1,00 m sur le dessin. Ses deux diagonales mesurent ${n2(vraie)} m en vrai, mais ${n2(d1)} m et ${n2(d2)} m sur le dessin : on ne mesure jamais une oblique en isométrie.`} largeur={620} hauteur={200}>
      <polygon points={points(carre.map(Q))} fill="var(--color-beton-clair)" className="t-fort" />
      <line x1={Q([0, 0, 0])[0]} y1={Q([0, 0, 0])[1]} x2={Q([1, 1, 0])[0]} y2={Q([1, 1, 0])[1]} stroke={ROUGE} strokeWidth={1.6} />
      <line x1={Q([1, 0, 0])[0]} y1={Q([1, 0, 0])[1]} x2={Q([0, 1, 0])[0]} y2={Q([0, 1, 0])[1]} stroke={BLEU} strokeWidth={1.6} />
      <Etiquette x={Q([0, 0, 0])[0] - 8} y={Q([0, 0, 0])[1] + 4} ancre="end" taille={11.5} gras couleur={ROUGE}>
        {`dessinée ${n2(d1)} m`}
      </Etiquette>
      <Etiquette x={Q([1, 0, 0])[0]} y={Q([1, 0, 0])[1] + 18} ancre="middle" taille={11.5} gras couleur={BLEU}>
        {`dessinée ${n2(d2)} m`}
      </Etiquette>
      <Etiquette x={450} y={80} taille={12} gras>
        {`diagonale réelle : ${n2(vraie)} m`}
      </Etiquette>
      <Etiquette x={450} y={100} taille={11.5}>
        côtés : 1,00 m, justes
      </Etiquette>
      <Etiquette x={450} y={120} taille={11.5} couleur={ROUGE}>
        diagonales : fausses
      </Etiquette>
    </Figure>
  );
}

/** Cage d'armatures d'un poteau en isométrie : quatre barres et des cadres réguliers. */
export function CageArmaturesIso({ a = 0.19, H = 0.75, e = 0.15 }: { a?: number; H?: number; e?: number }) {
  const s = 260;
  const ox = 230;
  const oy = 238;
  const Q = (q: Point3): Point2 => [ox + cavaliere(q, 45, 0.5)[0] * s, oy - cavaliere(q, 45, 0.5)[1] * s];
  const coins: Point3[] = [[0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0]];
  const nCadres = Math.floor(H / e + 1e-9) + 1;
  const arriere = (i: number) => i === 3;
  const seg = (p: Point3, q: Point3, z: number, k: string, attenue: boolean) => (
    <line key={k} x1={Q([p[0], p[1], z])[0]} y1={Q([p[0], p[1], z])[1]} x2={Q([q[0], q[1], z])[0]} y2={Q([q[0], q[1], z])[1]} stroke="var(--armature)" strokeWidth={1.3} opacity={attenue ? 0.4 : 1} />
  );
  return (
    <Figure alt={`Cage d'armatures d'un poteau dessinée en perspective cavalière : quatre barres verticales aux angles, tenues par ${nCadres} cadres espacés de ${n2(e)} m. Les arêtes du fond sont atténuées. Ce genre de croquis aide le ferrailleur à voir l'assemblage que le plan donne en vues séparées.`} largeur={620} hauteur={256}>
      {Array.from({ length: nCadres }, (_, i) => (
        <g key={i}>
          {seg(coins[0]!, coins[1]!, i * e, 'a', false)}
          {seg(coins[1]!, coins[2]!, i * e, 'b', false)}
          {seg(coins[2]!, coins[3]!, i * e, 'c', true)}
          {seg(coins[3]!, coins[0]!, i * e, 'd', true)}
        </g>
      ))}
      {coins.map(([x, y], i) => (
        <line key={i} x1={Q([x, y, -0.05])[0]} y1={Q([x, y, -0.05])[1]} x2={Q([x, y, H + 0.05])[0]} y2={Q([x, y, H + 0.05])[1]} stroke="var(--armature)" strokeWidth={3} strokeLinecap="round" opacity={arriere(i) ? 0.4 : 1} />
      ))}
      <Etiquette x={Q([a, 0, H * 0.7])[0] + 24} y={Q([a, 0, H * 0.7])[1]} taille={12} gras>
        4 barres verticales
      </Etiquette>
      <Etiquette x={Q([a, 0, H * 0.3])[0] + 24} y={Q([a, 0, H * 0.3])[1]} taille={12} gras>
        {`cadres tous les ${nombre(e * 100, 0)} cm`}
      </Etiquette>
    </Figure>
  );
}

/** Papier isométrique : un réseau de points à 30° ; on y dessine sans règle d'angle. */
export function GrilleIso({ bloc }: { bloc?: { l: number; p: number; h: number } }) {
  const u = 26;
  const ox = 60;
  const oy = 214;
  const Q = (q: Point3): Point2 => [ox + isometrique(q)[0] * u, oy - isometrique(q)[1] * u];
  const dx = u * Math.cos(Math.PI / 6);
  const reseau: Point2[] = [];
  for (let i = -2; i <= 24; i++)
    for (let j = -2; j <= 24; j++) {
      if ((i + j) % 2 !== 0) continue;
      const p: Point2 = [ox + i * dx, oy - (j * u) / 2];
      if (p[0] > 20 && p[0] < 600 && p[1] > 10 && p[1] < 230) reseau.push(p);
    }
  const base = Q([2, 5, 0]);
  const { proj, vers } = projecteur({ mode: 'iso' });
  const faces = bloc ? facesVues(facesExtrusion([[0, 0], [bloc.l, 0], [bloc.l, bloc.h], [0, bloc.h]], bloc.p), vers) : [];
  return (
    <Figure alt={bloc ? `Papier isométrique : sur le réseau de points, un pavé de ${bloc.l} × ${bloc.p} × ${bloc.h} carreaux est tracé en suivant les points, sans mesurer d'angle.` : "Papier isométrique : un réseau de points placés sur des lignes à 30° et sur des verticales. On y trace une perspective isométrique en suivant les points, sans rapporteur."} largeur={620} hauteur={240}>
      {reseau.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.4} fill="var(--trait-doux)" />
      ))}
      {bloc ? <DessinPrisme faces={faces} P={(q) => [base[0] + q[0] * u, base[1] - q[1] * u]} proj={proj} /> : null}
    </Figure>
  );
}

/** Le bloc de marches de la fiche, en cavalière et en isométrie, avec les longueurs portées. */
export function MarchesDeuxPerspectives({ d }: { d: DonneesMarches }) {
  const m = perspectiveMarches(d);
  return (
    <Figure alt={`Bloc de ${d.n} marches de ${n2(d.g)} × ${n2(d.h)} m sur ${n2(d.L)} m. En cavalière à ${d.alpha}°, k = ${nombre(d.k, 1)} : la face avant en vraie grandeur, la fuyante dessinée ${n2(m.fuyante)} m. En isométrie : toutes les arêtes en vraie grandeur, la fuyante dessinée ${n2(m.iso.fuyante)} m.`} largeur={620} hauteur={226}>
      <Prisme profil={m.profil} profondeur={d.L} vue={{ mode: 'cavaliere', alpha: d.alpha, k: d.k }} x={10} y={0} largeur={290} hauteur={180} />
      <Prisme profil={m.profil} profondeur={d.L} vue={{ mode: 'iso' }} x={320} y={0} largeur={290} hauteur={180} />
      <Etiquette x={155} y={196} ancre="middle" taille={12} gras>
        {`cavalière ${d.alpha}°, k = ${nombre(d.k, 1)}`}
      </Etiquette>
      <Etiquette x={155} y={213} ancre="middle" taille={11} couleur={BLEU}>
        {`fuyante dessinée : ${n2(m.fuyante)} m`}
      </Etiquette>
      <Etiquette x={465} y={196} ancre="middle" taille={12} gras>
        isométrie
      </Etiquette>
      <Etiquette x={465} y={213} ancre="middle" taille={11} couleur={BLEU}>
        {`fuyante dessinée : ${n2(m.iso.fuyante)} m`}
      </Etiquette>
    </Figure>
  );
}

/** Vues en perspective d'un objet en L (bloc de soutènement) pour les exercices. */
export const PROFIL_L: Point2[] = [[0, 0], [0.8, 0], [0.8, 0.2], [0.2, 0.2], [0.2, 0.7], [0, 0.7]];

export function BlocEnLIso() {
  return (
    <Figure alt="Un bloc en L en perspective isométrique : une semelle de 0,80 × 0,20 m et un voile de 0,20 m d'épaisseur et 0,70 m de haut au total, sur 1,00 m de longueur." largeur={620} hauteur={210}>
      <Prisme profil={PROFIL_L} profondeur={1} vue={{ mode: 'iso' }} x={150} y={0} largeur={320} hauteur={200} />
    </Figure>
  );
}

/** Pignon de maison et ses trois vues : façade pignon, toiture et long pan. */
export function MaisonIso() {
  return (
    <Figure alt="Une maison simple à deux pentes, en perspective isométrique : le pignon triangulaire à l'avant, le long pan à droite, la toiture au-dessus." largeur={620} hauteur={220}>
      <Prisme profil={PROFIL_MAISON} profondeur={6} vue={{ mode: 'iso' }} x={150} y={0} largeur={320} hauteur={215} couleur="var(--color-terre-clair)" />
    </Figure>
  );
}

export const MAISON_VUES = vuesExtrusion(PROFIL_MAISON, 6);
