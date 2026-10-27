// Schémas de compréhension du module L1.6 (dessin technique), leçons 9 à 12 et mini-projet :
// dossier de plans, lecture d'architecture, coffrage et ferraillage, cartouche et nomenclatures.
// Les valeurs affichées viennent de lib/calc/dessin.ts et lib/calc/plans.ts, directement ou par les props.
import { BarreCoupe } from '@/components/drawing/Armatures';
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure, Renvoi } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { Axe, Nord } from '@/components/drawing/Reperes';
import { Calque } from '@/components/gabarits/Vue3D';
import { cavaliere, echelleGraphique, isometrique, longueurPapier, zoneUtile, type Point2, type Point3 } from '@/lib/calc/dessin';
import { nomenclatureMenuiseries, nomenclaturePoutre, retardIndice, type DonneesDossier, type DonneesPoutreFer, type LigneMenuiserie, type Logement } from '@/lib/calc/plans';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const ARMATURE = 'var(--armature)';
const n2 = (x: number) => nombre(x, 2);

/** Petite boîte à texte arrondie. */
function Boite({ x, y, l, h = 26, t, c = BLEU, taille = 11 }: { x: number; y: number; l: number; h?: number; t: string; c?: string; taille?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={l} height={h} rx={5} fill="var(--color-papier)" stroke={c} strokeWidth={1.2} />
      <Etiquette x={x + l / 2} y={y + h / 2 + 4} ancre="middle" taille={taille} gras couleur={c}>
        {t}
      </Etiquette>
    </g>
  );
}

// ---------- L1.6.9 : le dossier de plans ----------

/** Chaque métier lit d'abord les plans qui le concernent. */
export function QuiLitQuoi() {
  const metiers = ['géomètre', 'maçon', 'coffreur, ferrailleur', 'plombier', 'électricien', 'client'];
  const plans = ['plan de masse', 'plans de niveaux, coupes', 'coffrage, ferraillage', 'plans de plomberie', 'plan électrique', 'façades, perspectives'];
  return (
    <Figure alt="Qui lit quoi : le géomètre lit le plan de masse pour implanter ; le maçon, les plans de niveaux et les coupes ; le coffreur et le ferrailleur, les plans de coffrage et de ferraillage ; le plombier, les plans de plomberie ; l'électricien, le plan électrique ; le client, les façades et les perspectives. Tous partagent les mêmes axes et les mêmes niveaux." largeur={620} hauteur={226}>
      {metiers.map((m, i) => (
        <g key={m}>
          <Boite x={30} y={14 + i * 34} l={170} t={m} c={TERRE} />
          <line x1={200} y1={27 + i * 34} x2={390} y2={27 + i * 34} className="t-fin" />
          <Boite x={390} y={14 + i * 34} l={200} t={plans[i]!} />
        </g>
      ))}
    </Figure>
  );
}

/** Plan de situation : le quartier, la parcelle repérée, le nord et une échelle graphique. */
export function PlanSituation({ E = 2000 }: { E?: number }) {
  const g = echelleGraphique(E, 25, 4);
  const k = 2.2;
  const routes = (
    <g>
      <rect x={20} y={96} width={580} height={22} fill="var(--fond-beton)" className="t-fin" />
      <rect x={250} y={10} width={18} height={200} fill="var(--fond-beton)" className="t-fin" />
      <rect x={430} y={118} width={14} height={92} fill="var(--fond-beton)" className="t-fin" />
      <path d="M20 188 Q 160 168 240 196 T 420 205" fill="none" stroke={BLEU} strokeWidth={6} opacity={0.45} />
    </g>
  );
  const parcelles: [number, number, number, number][] = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) parcelles.push([34 + i * 52, 22 + j * 36, 46, 30]);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) parcelles.push([282 + i * 48, 128 + j * 36, 42, 30]);
  for (let i = 0; i < 3; i++) parcelles.push([282 + i * 48, 22, 42, 30]);
  return (
    <Figure alt={`Plan de situation au 1/${E} : les rues du quartier, un cours d'eau, les parcelles voisines ; la parcelle du projet est hachurée en rouge, au bord de l'avenue. Une flèche donne le nord, une échelle graphique donne les distances (0 à ${nombre(g[g.length - 1]!.reel, 0)} m).`} largeur={620} hauteur={250}>
      {routes}
      {parcelles.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="var(--color-papier)" className="t-fin" />
      ))}
      <rect x={330} y={128} width={42} height={30} fill={ROUGE} fillOpacity={0.35} stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={351} y={147} ancre="middle" taille={10} gras couleur={ROUGE}>
        projet
      </Etiquette>
      <Etiquette x={120} y={111} taille={10.5} classe="etiquette">
        avenue
      </Etiquette>
      <Etiquette x={259} y={70} ancre="middle" taille={10} classe="etiquette" rotation={-90}>
        rue 1
      </Etiquette>
      <Etiquette x={110} y={174} taille={10.5} couleur={BLEU}>
        cours d’eau
      </Etiquette>
      <Nord x={570} y={44} taille={14} />
      {g.slice(0, -1).map((p, i) => (
        <rect key={i} x={470 + p.papier * k} y={226} width={(g[i + 1]!.papier - p.papier) * k} height={7} fill={i % 2 === 0 ? 'var(--trait)' : 'var(--color-papier)'} stroke="var(--trait)" strokeWidth={0.7} />
      ))}
      <Etiquette x={470} y={222} taille={9.5}>
        0
      </Etiquette>
      <Etiquette x={470 + g[g.length - 1]!.papier * k} y={222} ancre="end" taille={9.5}>
        {`${nombre(g[g.length - 1]!.reel, 0)} m`}
      </Etiquette>
    </Figure>
  );
}

/** Plan de masse : la parcelle, le bâtiment, les reculs, l'accès, les réseaux et les altitudes du terrain. */
export function PlanMasse({ d, reculs = { avant: 4, gauche: 3 } }: { d: DonneesDossier; reculs?: { avant: number; gauche: number } }) {
  const k = Math.min(420 / d.parcelle.L, 200 / d.parcelle.l);
  const X = (x: number) => 60 + x * k;
  const Y = (y: number) => 36 + (d.parcelle.l - y) * k;
  const b = d.batiment;
  return (
    <Figure alt={`Plan de masse : une parcelle de ${n2(d.parcelle.L)} × ${n2(d.parcelle.l)} m le long de la rue ; la maison de ${n2(b.L)} × ${n2(b.l)} m est implantée à ${n2(reculs.avant)} m de la limite avant et ${n2(reculs.gauche)} m de la limite gauche. Portail et allée d'accès, raccordement à l'eau, fosse septique et puisard à l'arrière, altitudes du terrain aux angles.`} largeur={620} hauteur={Y(0) + 54}>
      <rect x={X(0)} y={Y(d.parcelle.l)} width={d.parcelle.L * k} height={d.parcelle.l * k} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1.6} strokeDasharray="10 4" />
      <rect x={X(reculs.gauche)} y={Y(reculs.avant + b.l)} width={b.L * k} height={b.l * k} fill={hachure('pm', 'ba')} className="t-fort" />
      <Hachures prefixe="pm" types={['ba']} />
      <rect x={20} y={Y(0)} width={580} height={20} fill="var(--fond-beton)" className="t-fin" />
      <Etiquette x={30} y={Y(0) + 14} taille={10.5} classe="etiquette">
        rue
      </Etiquette>
      <rect x={X(reculs.gauche + b.L + 2)} y={Y(reculs.avant)} width={3 * k} height={reculs.avant * k} fill="var(--fond-beton)" className="t-fin" />
      <Etiquette x={X(reculs.gauche + b.L + 3.5)} y={Y(0) - 4} ancre="middle" taille={10}>
        portail
      </Etiquette>
      <circle cx={X(d.parcelle.L - 4)} cy={Y(d.parcelle.l - 4)} r={10} fill="none" className="t-moyen" />
      <rect x={X(d.parcelle.L - 9)} y={Y(d.parcelle.l - 2)} width={3 * k} height={1.6 * k} fill="none" className="t-moyen" />
      <path d={`M${X(reculs.gauche + b.L)} ${Y(reculs.avant + b.l / 2)} H${X(d.parcelle.L - 7.5)} V${Y(d.parcelle.l - 3.6)}`} fill="none" stroke={TERRE} strokeWidth={1.4} strokeDasharray="6 3" />
      <path d={`M${X(reculs.gauche + 2.5)} ${Y(reculs.avant)} V${Y(0)}`} fill="none" stroke={BLEU} strokeWidth={1.4} strokeDasharray="6 3" />
      <Etiquette x={X(d.parcelle.L - 9) - 4} y={Y(d.parcelle.l - 2) - 4} ancre="end" taille={9.5}>
        fosse septique
      </Etiquette>
      <Etiquette x={X(d.parcelle.L - 4)} y={Y(d.parcelle.l - 4) + 22} ancre="middle" taille={9.5}>
        puisard
      </Etiquette>
      <Etiquette x={X(reculs.gauche + 2.5) + 4} y={Y(1.5)} taille={9.5} couleur={BLEU}>
        eau
      </Etiquette>
      <Cote x1={X(reculs.gauche + b.L / 2)} y1={Y(0)} x2={X(reculs.gauche + b.L / 2)} y2={Y(reculs.avant)} decalage={-12} texte={n2(reculs.avant)} taille={10} />
      <Cote x1={X(0)} y1={Y(reculs.avant + b.l + 1.5)} x2={X(reculs.gauche)} y2={Y(reculs.avant + b.l + 1.5)} texte={n2(reculs.gauche)} taille={10} />
      <Cote x1={X(0)} y1={Y(d.parcelle.l)} x2={X(d.parcelle.L)} y2={Y(d.parcelle.l)} decalage={12} texte={n2(d.parcelle.L)} />
      <Etiquette x={X(reculs.gauche + b.L / 2)} y={Y(reculs.avant + b.l / 2) + 4} ancre="middle" taille={11} gras>
        maison
      </Etiquette>
      {[
        [0, 0, '312,10'],
        [d.parcelle.L, 0, '312,35'],
        [0, d.parcelle.l, '312,60'],
        [d.parcelle.L, d.parcelle.l, '312,90'],
      ].map(([x, y, t]) => (
        <Etiquette key={t as string} x={X(x as number) + ((x as number) > 0 ? -4 : 4)} y={Y(y as number) + ((y as number) > 0 ? 14 : -6)} ancre={(x as number) > 0 ? 'end' : 'start'} taille={9.5} couleur={TERRE}>
          {`TN ${t as string}`}
        </Etiquette>
      ))}
      <Nord x={575} y={60} taille={13} />
    </Figure>
  );
}

/** Les phases d'un projet : le dessin se précise, l'échelle grandit. */
export function PhasesProjet() {
  const phases = [
    { c: 'ESQ', t: 'esquisse', e: '1/200' },
    { c: 'APS', t: 'avant-projet sommaire', e: '1/100' },
    { c: 'APD', t: 'avant-projet définitif', e: '1/100' },
    { c: 'PRO', t: 'projet', e: '1/50' },
    { c: 'DCE', t: 'consultation des entreprises', e: '1/50' },
    { c: 'EXE', t: 'exécution', e: '1/50 à 1/5' },
    { c: 'DOE', t: 'ouvrage exécuté', e: '1/50' },
  ];
  const dx = 82;
  return (
    <Figure alt={`Les phases d'un projet, de l'idée au bâtiment livré : ${phases.map((p) => `${p.c} (${p.t})`).join(', ')}. À chaque phase, les plans se précisent et passent à une échelle plus grande ; seuls les plans d'exécution servent à construire, et le dossier des ouvrages exécutés montre ce qui a réellement été construit.`} largeur={620} hauteur={196}>
      <Fleche x1={24} y1={60} x2={600} y2={60} couleur="var(--trait)" epaisseur={1.6} tete={9} />
      {phases.map((p, i) => (
        <g key={p.c}>
          <circle cx={46 + i * dx} cy={60} r={17} fill={p.c === 'EXE' ? VERT : 'var(--color-papier)'} fillOpacity={p.c === 'EXE' ? 0.3 : 1} stroke={p.c === 'EXE' ? VERT : BLEU} strokeWidth={1.4} />
          <Etiquette x={46 + i * dx} y={64} ancre="middle" taille={10.5} gras couleur={p.c === 'EXE' ? VERT : BLEU}>
            {p.c}
          </Etiquette>
          <rect x={36 + i * dx} y={150 - (i + 1) * 9} width={20} height={(i + 1) * 9} fill={BLEU} fillOpacity={0.25} stroke={BLEU} />
          <Etiquette x={46 + i * dx} y={168} ancre="middle" taille={9.5}>
            {p.e}
          </Etiquette>
          {p.t.split(' ').length > 1 ? (
            <g>
              <Etiquette x={46 + i * dx} y={30} ancre="middle" taille={9}>
                {p.t.split(' ')[0]!}
              </Etiquette>
              <Etiquette x={46 + i * dx} y={40} ancre="middle" taille={9}>
                {p.t.split(' ').slice(1).join(' ')}
              </Etiquette>
            </g>
          ) : (
            <Etiquette x={46 + i * dx} y={36} ancre="middle" taille={9}>
              {p.t}
            </Etiquette>
          )}
        </g>
      ))}
      <Etiquette x={24} y={188} taille={10.5} classe="etiquette">
        barres : niveau de détail ; en bas : échelles usuelles des plans
      </Etiquette>
    </Figure>
  );
}

/** Superposer les plans d'architecture, de structure et de réseaux pour trouver les conflits. */
export function SuperpositionPlans() {
  return (
    <Figure alt="Trois calques superposés sur les mêmes axes : les murs de l'architecte, la poutre de l'ingénieur structure et la canalisation du plombier. À l'endroit entouré en rouge, le tuyau traverse la poutre : il faut prévoir une réservation dans la poutre avant de couler, ou dévier le tuyau." largeur={620} hauteur={220}>
      <rect x={60} y={40} width={420} height={140} fill="none" stroke="var(--trait)" strokeWidth={12} opacity={0.3} />
      <path d="M270 40V180" stroke="var(--trait)" strokeWidth={8} opacity={0.3} />
      <path d="M60 110H480" stroke="var(--trait)" strokeWidth={14} opacity={0.18} />
      <path d="M60 103H480M60 117H480" className="t-cache" />
      <path d="M380 30V200" stroke={BLEU} strokeWidth={3} />
      <circle cx={380} cy={110} r={20} fill="none" stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={496} y={70} taille={11} gras>
        murs (architecture)
      </Etiquette>
      <Etiquette x={496} y={114} taille={11} gras>
        poutre (structure)
      </Etiquette>
      <Etiquette x={386} y={214} taille={11} gras couleur={BLEU}>
        tuyau (plomberie)
      </Etiquette>
      <Etiquette x={404} y={146} taille={11} gras couleur={ROUGE}>
        conflit
      </Etiquette>
      <Axe x1={60} y1={22} x2={60} y2={196} repere="A" />
      <Axe x1={480} y1={22} x2={480} y2={196} repere="B" />
    </Figure>
  );
}

/** L'arborescence d'un dossier de plans de bâtiment. */
export function ArborescenceDossier() {
  const branches = [
    { t: 'architecture', c: BLEU, f: ['situation, masse', 'plans de niveaux', 'façades, coupes', 'détails'] },
    { t: 'structure', c: ROUGE, f: ['fondations', 'coffrage', 'ferraillage', 'nomenclatures'] },
    { t: 'réseaux', c: VERT, f: ['eau, assainissement', 'électricité', 'voirie, réseaux divers'] },
  ];
  return (
    <Figure alt={`Le dossier de plans d'un bâtiment se range en trois familles : ${branches.map((b) => `${b.t} (${b.f.join(', ')})`).join(' ; ')}. Toutes utilisent les mêmes axes, les mêmes niveaux et le même cartouche.`} largeur={620} hauteur={226}>
      <Boite x={230} y={10} l={160} t="dossier de plans" c="var(--trait)" taille={12} />
      {branches.map((b, i) => {
        const x = 20 + i * 205;
        return (
          <g key={b.t}>
            <path d={`M310 36 V52 H${x + 85} V64`} fill="none" className="t-moyen" />
            <Boite x={x} y={64} l={170} t={b.t} c={b.c} taille={12} />
            {b.f.map((t, j) => (
              <g key={t}>
                <path d={`M${x + 12} 90 V${112 + j * 30} H${x + 22}`} fill="none" className="t-fin" />
                <Etiquette x={x + 26} y={116 + j * 30} taille={11}>
                  {t}
                </Etiquette>
              </g>
            ))}
          </g>
        );
      })}
    </Figure>
  );
}

/** Deux planches du dossier sur le même format : le plan de masse et un plan de niveau, chacun à son échelle. */
export function DossierFeuilles({ d, masse, niveau }: { d: DonneesDossier; masse: number; niveau: number }) {
  const z = zoneUtile(d.n);
  const k = 270 / (z.largeur + 30);
  const feuille = (x0: number, L: number, l: number, E: number, titre: string) => {
    const w = longueurPapier(L, E) * k;
    const h = longueurPapier(l, E) * k;
    const fx = x0 + 20 * k;
    const fy = 20 + 10 * k;
    return (
      <g>
        <rect x={x0} y={20} width={(z.largeur + 30) * k} height={(z.hauteur + 20) * k} fill="var(--color-papier)" className="t-fin" strokeWidth={0.8} />
        <rect x={fx} y={fy} width={z.largeur * k} height={z.hauteur * k} fill="none" className="t-moyen" />
        <rect x={fx} y={fy + (z.hauteur - d.cartouche) * k} width={z.largeur * k} height={d.cartouche * k} fill="var(--color-encre-clair)" />
        <rect x={fx + (z.largeur * k - w) / 2} y={fy + ((z.hauteur - d.cartouche) * k - h) / 2} width={w} height={h} fill={VERT} fillOpacity={0.18} stroke={VERT} strokeWidth={1.4} />
        <Etiquette x={x0 + ((z.largeur + 30) * k) / 2} y={20 + (z.hauteur + 20) * k + 18} ancre="middle" taille={11.5} gras>
          {`${titre} au 1/${E}`}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt={`Deux planches A${d.n} : le plan de masse, parcelle de ${n2(d.parcelle.L)} × ${n2(d.parcelle.l)} m, tient au 1/${masse} ; le plan de niveau, maison de ${n2(d.batiment.L)} × ${n2(d.batiment.l)} m, tient au 1/${niveau}. Chaque dessin est centré au-dessus de la bande du cartouche.`} largeur={620} hauteur={20 + (z.hauteur + 20) * k + 30}>
      {feuille(30, d.parcelle.L, d.parcelle.l, masse, 'plan de masse')}
      {feuille(320, d.batiment.L, d.batiment.l, niveau, 'plan de niveau')}
    </Figure>
  );
}

/** Tampons : un plan provisoire ne sert pas à construire. */
export function Tampons() {
  const tampon = (x: number, l1: string, l2: string, c: string) => (
    <g transform={`rotate(-8 ${x + 110} 90)`}>
      <rect x={x} y={50} width={220} height={80} rx={8} fill="none" stroke={c} strokeWidth={3} />
      <Etiquette x={x + 110} y={84} ancre="middle" taille={16} gras couleur={c}>
        {l1}
      </Etiquette>
      <Etiquette x={x + 110} y={108} ancre="middle" taille={11} couleur={c}>
        {l2}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="Deux tampons sur des plans : « PROVISOIRE, ne pas construire » sur un plan d'avant-projet ; « BON POUR EXÉCUTION », daté et visé, sur le plan d'exécution. On ne construit qu'avec le second." largeur={620} hauteur={180}>
      {tampon(40, 'PROVISOIRE', 'ne pas construire', ROUGE)}
      {tampon(350, 'BON POUR EXÉCUTION', 'visé le 15/10/2026', VERT)}
    </Figure>
  );
}

// ---------- L1.6.10 : lire un plan d'architecture ----------

/** Boîtes (x0, y0, z0, x1, y1, z1) des murs d'un logement coupés à une hauteur donnée. */
function boitesLogement(lg: Logement, hCoupe: number): [number, number, number, number, number, number][] {
  const m = lg.mur;
  const b: [number, number, number, number, number, number][] = [];
  const segs = (a: number, c: number, trous: [number, number][]) => {
    const r: [number, number][] = [];
    let x = a;
    for (const [t0, t1] of [...trous].sort((p, q) => p[0] - q[0])) {
      if (t0 > x) r.push([x, t0]);
      x = Math.max(x, t1);
    }
    if (c > x) r.push([x, c]);
    return r;
  };
  const faces: ['sud' | 'nord' | 'ouest' | 'est', number, number, number, number][] = [
    ['sud', -m, lg.L + m, -m, 0],
    ['nord', -m, lg.L + m, lg.l, lg.l + m],
    ['ouest', 0, lg.l, -m, 0],
    ['est', 0, lg.l, lg.L, lg.L + m],
  ];
  for (const [f, a, c, t0, t1] of faces) {
    const baies = lg.baies.filter((x) => x.facade === f);
    const pleins = segs(a, c, baies.map((x) => [x.debut, x.debut + x.largeur]));
    const h = f === 'sud' || f === 'nord';
    for (const [p, q] of pleins) b.push(h ? [p, t0, 0, q, t1, hCoupe] : [t0, p, 0, t1, q, hCoupe]);
    for (const x of baies.filter((x) => x.type === 'fenetre')) {
      const z = Math.min(x.allege, hCoupe);
      b.push(h ? [x.debut, t0, 0, x.debut + x.largeur, t1, z] : [t0, x.debut, 0, t1, x.debut + x.largeur, z]);
    }
  }
  for (const r of lg.cloisons) b.push([r.x0, r.y0, 0, r.x1, r.y1, hCoupe]);
  return b;
}

/** Une maison coupée à un mètre du sol, vue de dessus en perspective : c'est ce que montre le plan de niveau. */
export function MaisonCoupeeIso({ lg, hCoupe = 1 }: { lg: Logement; hCoupe?: number }) {
  const boites = boitesLogement(lg, hCoupe).sort((p, q) => (p[0] + p[3]) / 2 - (p[1] + p[4]) / 2 - ((q[0] + q[3]) / 2 - (q[1] + q[4]) / 2));
  const tous: Point3[] = [[-lg.mur, -lg.mur, 0], [lg.L + lg.mur, -lg.mur, 0], [lg.L + lg.mur, lg.l + lg.mur, 0], [-lg.mur, lg.l + lg.mur, 0], [-lg.mur, -lg.mur, hCoupe], [lg.L + lg.mur, lg.l + lg.mur, hCoupe]];
  const pr = tous.map(isometrique);
  const xs = pr.map((p) => p[0]);
  const ys = pr.map((p) => p[1]);
  const k = Math.min(560 / (Math.max(...xs) - Math.min(...xs)), 230 / (Math.max(...ys) - Math.min(...ys)));
  const dx = (620 - (Math.max(...xs) - Math.min(...xs)) * k) / 2;
  const Q = (q: Point3): Point2 => {
    const [u, v] = isometrique(q);
    return [dx + (u - Math.min(...xs)) * k, 250 - (v - Math.min(...ys)) * k];
  };
  const face = (pts: Point3[], f: string, o = 0) => (
    <g>
      <polygon points={points(pts.map(Q))} fill={f} />
      {o ? <polygon points={points(pts.map(Q))} fill="var(--trait)" fillOpacity={o} /> : null}
      <polygon points={points(pts.map(Q))} fill="none" className="t-moyen" />
    </g>
  );
  return (
    <Figure alt={`La maison coupée par un plan horizontal à ${n2(hCoupe)} m du sol et vue d'en haut, en perspective : on voit l'épaisseur des murs tranchés, les cloisons, les ouvertures des portes jusqu'au sol, et sous les fenêtres les allèges. Le plan de niveau dessine exactement cette coupe, vue de dessus.`} largeur={620} hauteur={262}>
      {face([[-lg.mur, -lg.mur, 0], [lg.L + lg.mur, -lg.mur, 0], [lg.L + lg.mur, lg.l + lg.mur, 0], [-lg.mur, lg.l + lg.mur, 0]], 'var(--color-terre-clair)')}
      {boites.map(([x0, y0, z0, x1, y1, z1], i) => (
        <g key={i}>
          {face([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], 'var(--color-beton-clair)')}
          {face([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], 'var(--color-beton-clair)', 0.16)}
          {face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], z1 >= hCoupe - 1e-9 ? hachure('mci', 'maconnerie') : 'var(--color-beton-clair)')}
        </g>
      ))}
      <Hachures prefixe="mci" types={['maconnerie']} />
    </Figure>
  );
}

/** Appareils sanitaires et de cuisine en plan. */
export function SymbolesSanitaires() {
  return (
    <Figure alt="Symboles d'appareils en plan : la cuvette de WC, ovale, avec son réservoir contre le mur ; le lavabo, une vasque dans un plan rectangulaire ; le bac à douche, carré, avec sa bonde ; l'évier, rectangle à un ou deux bacs. Leur position renseigne le plombier sur les arrivées d'eau et les évacuations." largeur={620} hauteur={160}>
      <line x1={20} y1={20} x2={600} y2={20} className="t-fort" strokeWidth={3} />
      <rect x={50} y={22} width={50} height={18} rx={3} fill="var(--color-papier)" className="t-moyen" />
      <ellipse cx={75} cy={66} rx={20} ry={27} fill="var(--color-papier)" className="t-moyen" />
      <rect x={170} y={22} width={70} height={46} rx={6} fill="var(--color-papier)" className="t-moyen" />
      <ellipse cx={205} cy={46} rx={24} ry={15} fill="none" className="t-fin" />
      <rect x={310} y={22} width={84} height={84} fill="var(--color-papier)" className="t-moyen" />
      <path d="M310 22l84 84M394 22l-84 84" className="t-fin" />
      <circle cx={352} cy={64} r={5} fill="none" className="t-moyen" />
      <rect x={460} y={22} width={110} height={50} fill="var(--color-papier)" className="t-moyen" />
      <rect x={468} y={30} width={42} height={34} rx={4} fill="none" className="t-fin" />
      <rect x={520} y={30} width={42} height={34} rx={4} fill="none" className="t-fin" />
      {[
        [75, 'WC'],
        [205, 'lavabo'],
        [352, 'douche'],
        [515, 'évier'],
      ].map(([x, t]) => (
        <Etiquette key={t as string} x={x as number} y={140} ancre="middle" taille={11.5} gras>
          {t as string}
        </Etiquette>
      ))}
    </Figure>
  );
}

/** Un escalier en plan : la flèche de montée et la ligne de coupe du plan. */
export function EscalierPlan({ n = 14 }: { n?: number }) {
  const g = 20;
  const x0 = 120;
  const coupe = 6;
  return (
    <Figure alt={`Un escalier droit de ${n} marches vu en plan. Une flèche part de la première marche, avec un point de départ, et indique le sens de la montée. Le plan de niveau coupe l'escalier à environ un mètre de hauteur : une ligne en zigzag marque la coupe ; au-delà, les marches sont en tirets, car elles passent au-dessus du plan de coupe.`} largeur={620} hauteur={150}>
      <rect x={x0} y={30} width={n * g} height={70} fill="var(--color-papier)" className="t-moyen" />
      {Array.from({ length: n - 1 }, (_, i) => (
        <line key={i} x1={x0 + (i + 1) * g} y1={30} x2={x0 + (i + 1) * g} y2={100} className={i + 1 < coupe ? 't-fin' : 't-cache'} />
      ))}
      <path d={`M${x0 + coupe * g - 6} 100 l12 -28 l-12 -14 l12 -28`} fill="none" className="t-moyen" />
      <circle cx={x0 + g / 2} cy={65} r={3.5} fill="var(--trait)" />
      <Fleche x1={x0 + g / 2} y1={65} x2={x0 + n * g - 8} y2={65} couleur={BLEU} epaisseur={1.6} tete={9} />
      <Etiquette x={x0 + 2 * g} y={58} taille={11} gras couleur={BLEU}>
        montée
      </Etiquette>
      <Etiquette x={x0 + coupe * g + 10} y={122} taille={10.5}>
        ligne de coupe du plan ; au-delà, marches en tirets
      </Etiquette>
    </Figure>
  );
}

/** Une fenêtre lue sur trois vues : plan, façade et coupe. */
export function BaieTroisVues({ l = 1.2, h = 1.2, allege = 0.9, hsp = 2.7 }: { l?: number; h?: number; allege?: number; hsp?: number }) {
  const k = 60;
  const sol = 196;
  const Z = (z: number) => sol - z * k;
  return (
    <Figure alt={`Une fenêtre de ${n2(l)} × ${n2(h)} m sur trois vues. En plan : l'ouverture dans le mur, sa largeur ${n2(l)}. En façade : la fenêtre, son allège de ${n2(allege)} m au-dessus du sol fini, sa hauteur ${n2(h)} m. En coupe : le mur tranché sous la fenêtre (l'allège), l'appui, la fenêtre, et au-dessus le linteau.`} largeur={620} hauteur={230}>
      <Hachures prefixe="btv" types={['maconnerie', 'ba']} />
      <rect x={20} y={40} width={50} height={14} fill={hachure('btv', 'maconnerie')} className="t-fort" />
      <rect x={70 + l * k} y={40} width={50} height={14} fill={hachure('btv', 'maconnerie')} className="t-fort" />
      <path d={`M70 40h${l * k}M70 47h${l * k}M70 54h${l * k}`} className="t-fin" />
      <Cote x1={70} y1={54} x2={70 + l * k} y2={54} decalage={-14} texte={n2(l)} taille={10.5} />
      <Etiquette x={95} y={26} ancre="middle" taille={11} gras couleur={BLEU}>
        plan
      </Etiquette>
      <rect x={250} y={Z(hsp)} width={200} height={hsp * k} fill="var(--color-papier)" className="t-moyen" />
      <rect x={290} y={Z(allege + h)} width={l * k} height={h * k} fill="var(--fond-eau)" className="t-moyen" />
      <line x1={290 + (l * k) / 2} y1={Z(allege + h)} x2={290 + (l * k) / 2} y2={Z(allege)} className="t-fin" />
      <Cote x1={290 + l * k} y1={Z(0)} x2={290 + l * k} y2={Z(allege)} decalage={-16} texte={n2(allege)} taille={10.5} />
      <Cote x1={290 + l * k} y1={Z(allege)} x2={290 + l * k} y2={Z(allege + h)} decalage={-16} texte={n2(h)} taille={10.5} />
      <line x1={240} y1={Z(0)} x2={460} y2={Z(0)} className="t-fort" />
      <Etiquette x={350} y={Z(hsp) - 8} ancre="middle" taille={11} gras couleur={BLEU}>
        façade
      </Etiquette>
      <rect x={540} y={Z(allege)} width={14} height={allege * k} fill={hachure('btv', 'maconnerie')} className="t-fort" />
      <rect x={540} y={Z(allege + h + 0.2)} width={14} height={0.2 * k} fill={hachure('btv', 'ba')} className="t-fort" />
      <rect x={540} y={Z(hsp)} width={14} height={(hsp - allege - h - 0.2) * k} fill={hachure('btv', 'maconnerie')} className="t-fort" />
      <rect x={545} y={Z(allege + h)} width={4} height={h * k} fill="var(--fond-eau)" className="t-moyen" />
      <rect x={530} y={Z(allege) - 3} width={24} height={3} fill="var(--trait)" />
      <line x1={500} y1={Z(0)} x2={600} y2={Z(0)} className="t-fort" />
      <Etiquette x={547} y={Z(hsp) - 8} ancre="middle" taille={11} gras couleur={BLEU}>
        coupe
      </Etiquette>
      <Renvoi de={[575, Z(allege / 2)]} vers={[555, Z(allege / 2)]} texte="allège" />
      <Renvoi de={[575, Z(allege + h + 0.1)]} vers={[555, Z(allege + h + 0.1)]} texte="linteau" />
      <Renvoi de={[470, Z(allege) + 20]} vers={[531, Z(allege) - 2]} texte="appui" ancre="end" />
    </Figure>
  );
}

/** Mur et cloison en plan : l'épaisseur trahit le rôle. */
export function MurOuCloison() {
  return (
    <Figure alt="En plan, un mur extérieur de 20 cm, en trait fort et hachuré, et une cloison intérieure de 10 cm, plus mince. Une cloison sépare deux pièces ; un mur extérieur ou un mur épais peut porter la dalle. On vérifie le rôle de chaque mur sur le plan de structure avant de le percer ou de le démolir." largeur={620} hauteur={150}>
      <Hachures prefixe="moc" types={['maconnerie']} />
      <rect x={40} y={40} width={540} height={22} fill={hachure('moc', 'maconnerie')} className="t-fort" />
      <rect x={290} y={62} width={11} height={70} fill={hachure('moc', 'maconnerie')} className="t-moyen" />
      <Etiquette x={60} y={32} taille={11.5} gras>
        mur extérieur : 20 cm
      </Etiquette>
      <Etiquette x={310} y={110} taille={11.5} gras>
        cloison : 10 cm
      </Etiquette>
      <Etiquette x={310} y={126} taille={10.5} classe="etiquette">
        porteur ou non ? le plan de structure le dit
      </Etiquette>
    </Figure>
  );
}

/** Les quatre façons dont une porte peut s'ouvrir, lues en plan. */
export function SensOuverture() {
  const porte = (x: number, droite: boolean, dedans: boolean, t: string) => {
    const y = 80;
    const w = 60;
    const xh = droite ? x + w : x;
    const s = dedans ? -1 : 1;
    const tip = [xh, y + s * w] as const;
    const autre = [droite ? x : x + w, y] as const;
    const cross = (tip[0] - xh) * (autre[1] - y) - (tip[1] - y) * (autre[0] - xh);
    return (
      <g>
        <rect x={x - 26} y={y} width={26} height={10} fill={hachure('so', 'maconnerie')} className="t-fort" />
        <rect x={x + w} y={y} width={26} height={10} fill={hachure('so', 'maconnerie')} className="t-fort" />
        <line x1={xh} y1={dedans ? y : y + 10} x2={tip[0]} y2={dedans ? tip[1] : tip[1] + 10} className="t-moyen" />
        <path d={`M${tip[0]} ${dedans ? tip[1] : tip[1] + 10} A${w} ${w} 0 0 ${cross > 0 ? 1 : 0} ${autre[0]} ${dedans ? y : y + 10}`} className="t-fin" />
        <Etiquette x={x + w / 2} y={170} ancre="middle" taille={10.5}>
          {t}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="Quatre portes dans un même mur : paumelles à gauche ou à droite, vantail ouvert vers la pièce du haut ou vers celle du bas. L'arc et le vantail dessinés en plan montrent de quel côté se trouvent les charnières et où il faut laisser la place pour ouvrir." largeur={620} hauteur={186}>
      <Hachures prefixe="so" types={['maconnerie']} />
      {porte(50, false, true, 'gauche, vers le haut')}
      {porte(200, true, true, 'droite, vers le haut')}
      {porte(350, false, false, 'gauche, vers le bas')}
      {porte(500, true, false, 'droite, vers le bas')}
    </Figure>
  );
}

/** Une baie dans un mur : tableau, appui, linteau, feuillure. */
export function TableauBaie() {
  return (
    <Figure alt="Une baie de fenêtre dans un mur, vue en coupe horizontale et en coupe verticale. Les tableaux sont les faces latérales de l'ouverture ; l'appui, en bas, rejette l'eau vers l'extérieur ; le linteau, en haut, porte le mur au-dessus de l'ouverture ; la feuillure est le ressaut où vient se loger le cadre de la menuiserie." largeur={620} hauteur={230}>
      <Hachures prefixe="tb" types={['maconnerie', 'ba']} />
      <path d="M40 60 H150 V80 H160 V100 H40 Z" fill={hachure('tb', 'maconnerie')} className="t-fort" />
      <path d="M330 60 H220 V80 H210 V100 H330 Z" fill={hachure('tb', 'maconnerie')} className="t-fort" />
      <rect x={160} y={80} width={50} height={8} fill="var(--fond-eau)" className="t-moyen" />
      <Renvoi de={[60, 140]} vers={[150, 70]} texte="tableau" />
      <Renvoi de={[180, 150]} vers={[159, 92]} texte="feuillure" />
      <Etiquette x={40} y={40} taille={11} gras couleur={BLEU}>
        coupe horizontale
      </Etiquette>
      <rect x={440} y={20} width={40} height={40} fill={hachure('tb', 'ba')} className="t-fort" />
      <rect x={440} y={60} width={6} height={90} fill="none" />
      <rect x={452} y={60} width={8} height={90} fill="var(--fond-eau)" className="t-moyen" />
      <path d="M430 150 H486 V162 H440 Z" fill="var(--fond-beton)" className="t-fort" />
      <rect x={440} y={162} width={40} height={50} fill={hachure('tb', 'maconnerie')} className="t-fort" />
      <Renvoi de={[530, 40]} vers={[481, 40]} texte="linteau" />
      <Renvoi de={[530, 158]} vers={[487, 156]} texte="appui" />
      <Etiquette x={420} y={226} taille={11} gras couleur={BLEU}>
        coupe verticale
      </Etiquette>
      <Etiquette x={386} y={150} ancre="end" taille={10} classe="etiquette">
        dehors
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.6.11 : coffrage et ferraillage ----------

/** Le coffrage est le moule, le ferraillage le squelette. */
export function MouleEtCage({ b = 0.2, h = 0.4, L = 1.6 }: { b?: number; h?: number; L?: number }) {
  const e = 0.03;
  const s = 190;
  const Q = (q: Point3): Point2 => [60 + cavaliere(q, 30, 0.6)[0] * s, 200 - cavaliere(q, 30, 0.6)[1] * s];
  const poly = (pts: Point3[]) => points(pts.map(Q));
  const c = 0.03;
  const barres: [number, number][] = [[c, c], [b - c, c], [c, h - c], [b - c, h - c]];
  return (
    <Figure alt="Une poutre en construction, en perspective. Le coffrage, en planches, forme le moule : un fond et deux joues. À l'intérieur, la cage d'armatures : des barres longitudinales tenues par des cadres. Le plan de coffrage décrit le moule ; le plan de ferraillage décrit la cage." largeur={620} hauteur={230}>
      <polygon points={poly([[-e, 0, -e], [b + e, 0, -e], [b + e, L, -e], [-e, L, -e]])} fill="var(--color-terre-clair)" className="t-moyen" />
      <polygon points={poly([[b, 0, -e], [b + e, 0, -e], [b + e, 0, h], [b, 0, h]])} fill="var(--color-terre-clair)" className="t-moyen" />
      <polygon points={poly([[b + e, 0, -e], [b + e, L, -e], [b + e, L, h], [b + e, 0, h]])} fill="var(--color-terre-clair)" className="t-moyen" />
      {Array.from({ length: 9 }, (_, i) => {
        const y = 0.1 + i * 0.18;
        return <polygon key={i} points={poly([[c, y, c], [b - c, y, c], [b - c, y, h - c], [c, y, h - c]])} fill="none" stroke={ARMATURE} strokeWidth={1.3} />;
      })}
      {barres.map(([x, z], i) => (
        <line key={i} x1={Q([x, 0.02, z])[0]} y1={Q([x, 0.02, z])[1]} x2={Q([x, L - 0.02, z])[0]} y2={Q([x, L - 0.02, z])[1]} stroke={ARMATURE} strokeWidth={2.6} strokeLinecap="round" />
      ))}
      <polygon points={poly([[-e, 0, -e], [0, 0, -e], [0, 0, h], [-e, 0, h]])} fill="var(--color-terre-clair)" className="t-moyen" />
      <polygon points={poly([[-e, 0, h], [0, 0, h], [0, L, h], [-e, L, h]])} fill="var(--color-terre-clair)" className="t-moyen" />
      <Renvoi de={[430, 210]} vers={[Q([b + e, L * 0.7, 0])[0], Q([b + e, L * 0.7, 0])[1]]} texte="coffrage : le moule" />
      <Renvoi de={[440, 40]} vers={[Q([b - c, L * 0.8, h - c])[0], Q([b - c, L * 0.8, h - c])[1]]} texte="armatures : le squelette" />
    </Figure>
  );
}

/** Extrait de plan de coffrage d'un plancher : poteaux, poutres sous dalle, épaisseur, sens de portée, trémie. */
export function PlanCoffrage() {
  const X = (x: number) => 60 + x * 60;
  const Y = (y: number) => 30 + (3.4 - y) * 50;
  return (
    <Figure alt="Extrait d'un plan de coffrage de plancher, vu de dessus. Les poteaux, sous la dalle, sont coupés et noircis aux angles. Les poutres P1 de 20 × 40 cm, sous la dalle, sont dessinées en traits interrompus. La dalle porte entre les poutres : une double flèche donne son sens de portée, un cercle son épaisseur, 16 cm. Une trémie, ouverture barrée d'une croix, laisse passer une gaine. Le niveau du dessus de la dalle est indiqué." largeur={620} hauteur={240}>
      <rect x={X(0) - 6} y={Y(3.4) - 6} width={(6.6 * 60) + 12} height={(3.4 * 50) + 12} fill="var(--color-beton-clair)" className="t-moyen" />
      {[0, 6.6].flatMap((x) => [0, 3.4].map((y) => <rect key={`${x}${y}`} x={X(x) - 8} y={Y(y) - 8} width={16} height={16} fill="var(--trait)" />))}
      <path d={`M${X(0)} ${Y(0) - 6}H${X(6.6)}M${X(0)} ${Y(0) + 6}H${X(6.6)}M${X(0)} ${Y(3.4) - 6}H${X(6.6)}M${X(0)} ${Y(3.4) + 6}H${X(6.6)}`} className="t-cache" strokeWidth={1.1} />
      <Etiquette x={X(3.3)} y={Y(0) - 10} ancre="middle" taille={11} gras couleur={BLEU}>
        P1 (20 × 40)
      </Etiquette>
      <Etiquette x={X(3.3)} y={Y(3.4) + 20} ancre="middle" taille={11} gras couleur={BLEU}>
        P1 (20 × 40)
      </Etiquette>
      <Fleche x1={X(1.6)} y1={Y(1.7)} x2={X(1.6)} y2={Y(0.3)} couleur={ROUGE} epaisseur={1.6} tete={8} />
      <Fleche x1={X(1.6)} y1={Y(1.7)} x2={X(1.6)} y2={Y(3.1)} couleur={ROUGE} epaisseur={1.6} tete={8} />
      <Etiquette x={X(1.6) + 8} y={Y(1.7) + 4} taille={10.5} couleur={ROUGE}>
        sens de portée
      </Etiquette>
      <circle cx={X(3.6)} cy={Y(1.7)} r={14} fill="var(--color-papier)" stroke={BLEU} strokeWidth={1.2} />
      <Etiquette x={X(3.6)} y={Y(1.7) + 4} ancre="middle" taille={11} gras couleur={BLEU}>
        16
      </Etiquette>
      <rect x={X(5)} y={Y(2.6)} width={50} height={40} fill="var(--color-papier)" className="t-moyen" />
      <path d={`M${X(5)} ${Y(2.6)}l50 40M${X(5) + 50} ${Y(2.6)}l-50 40`} className="t-fin" />
      <Etiquette x={X(5) + 25} y={Y(2.6) + 56} ancre="middle" taille={10.5}>
        trémie
      </Etiquette>
      <rect x={X(3.6) - 34} y={Y(0.7) - 12} width={70} height={18} fill="var(--color-papier)" className="t-fin" />
      <Etiquette x={X(3.6)} y={Y(0.7) + 2} ancre="middle" taille={10.5}>
        arase +2,86
      </Etiquette>
    </Figure>
  );
}

/** Ferraillage d'une poutre : élévation repérée et coupe transversale, tirés de la nomenclature. */
export function FerraillagePoutre({ d, prefixe }: { d: DonneesPoutreFer; prefixe: string }) {
  const n = nomenclaturePoutre(d);
  const k = 430 / d.L;
  const kv = Math.min(k * 1.6, 220);
  const x0 = 40;
  const y0 = 40;
  const X = (x: number) => x0 + x * k;
  const Z = (z: number) => y0 + (d.h - z) * kv;
  const nC = n.nCadres;
  const pas = (d.L - 2 * d.premier) / Math.max(nC - 1, 1);
  const sx = 524;
  const ks = Math.min(260, 110 / d.h);
  const S = (x: number, z: number): Point2 => [sx + x * ks, y0 + (d.h - z) * ks];
  const bulle = (x: number, y: number, t: number) => (
    <g>
      <circle cx={x} cy={y} r={8} fill="var(--color-papier)" stroke={BLEU} />
      <Etiquette x={x} y={y + 4} ancre="middle" taille={10} gras couleur={BLEU}>
        {String(t)}
      </Etiquette>
    </g>
  );
  const rx = (i: number, nb: number) => d.c + (nb === 1 ? (d.b - 2 * d.c) / 2 : (i * (d.b - 2 * d.c)) / (nb - 1));
  return (
    <Figure alt={`Ferraillage d'une poutre de ${n2(d.L)} m, ${nombre(d.b * 100, 0)} × ${nombre(d.h * 100, 0)} cm. Élévation : repère 1, ${d.nInf} HA ${d.phiInf} en bas ; repère 2, ${d.nSup} HA ${d.phiSup} en haut ; repère 3, ${nC} cadres HA ${d.phiT} espacés de ${nombre(d.e * 100, 0)} cm. Coupe A-A : la section, les barres et le cadre, l'enrobage de ${nombre(d.c * 100, 0)} cm.`} largeur={620} hauteur={Math.max(y0 + d.h * kv + 64, y0 + 110 + 30)}>
      <Hachures prefixe={prefixe} types={['ba']} />
      <rect x={X(0)} y={Z(d.h)} width={d.L * k} height={d.h * kv} fill="var(--color-beton-clair)" className="t-fort" />
      {Array.from({ length: nC }, (_, i) => (
        <line key={i} x1={X(d.premier + i * pas)} y1={Z(d.h - d.c)} x2={X(d.premier + i * pas)} y2={Z(d.c)} stroke={ARMATURE} strokeWidth={1} />
      ))}
      <line x1={X(d.c)} y1={Z(d.c)} x2={X(d.L - d.c)} y2={Z(d.c)} stroke={ARMATURE} strokeWidth={3} />
      <line x1={X(d.c)} y1={Z(d.h - d.c)} x2={X(d.L - d.c)} y2={Z(d.h - d.c)} stroke={ARMATURE} strokeWidth={2.4} />
      {bulle(X(d.L * 0.3), Z(d.c) + 22, 1)}
      <Etiquette x={X(d.L * 0.3) + 14} y={Z(d.c) + 26} taille={10.5}>
        {`${d.nInf} HA ${d.phiInf}`}
      </Etiquette>
      {bulle(X(d.L * 0.3), Z(d.h - d.c) - 20, 2)}
      <Etiquette x={X(d.L * 0.3) + 14} y={Z(d.h - d.c) - 16} taille={10.5}>
        {`${d.nSup} HA ${d.phiSup}`}
      </Etiquette>
      {bulle(X(d.L * 0.72), Z(d.h - d.c) - 20, 3)}
      <Etiquette x={X(d.L * 0.72) + 14} y={Z(d.h - d.c) - 16} taille={10.5}>
        {`${nC} cadres HA ${d.phiT}, e = ${nombre(d.e * 100, 0)}`}
      </Etiquette>
      <Cote x1={X(0)} y1={Z(0)} x2={X(d.L)} y2={Z(0)} decalage={-34} texte={n2(d.L)} />
      <line x1={X(d.L * 0.5)} y1={Z(d.h) - 8} x2={X(d.L * 0.5)} y2={Z(0) + 8} className="t-axe" />
      <Etiquette x={X(d.L * 0.5) + 4} y={Z(0) + 18} taille={10.5} gras>
        A
      </Etiquette>
      <polygon points={points([S(0, 0), S(d.b, 0), S(d.b, d.h), S(0, d.h)])} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <polygon points={points([S(d.c, d.c), S(d.b - d.c, d.c), S(d.b - d.c, d.h - d.c), S(d.c, d.h - d.c)])} fill="none" stroke={ARMATURE} strokeWidth={1.4} />
      {Array.from({ length: d.nInf }, (_, i) => {
        const [x, y] = S(rx(i, d.nInf), d.c + 0.012);
        return <BarreCoupe key={`i${i}`} cx={x} cy={y} r={Math.max(3, (d.phiInf / 1000) * ks)} />;
      })}
      {Array.from({ length: d.nSup }, (_, i) => {
        const [x, y] = S(rx(i, d.nSup), d.h - d.c - 0.012);
        return <BarreCoupe key={`s${i}`} cx={x} cy={y} r={Math.max(3, (d.phiSup / 1000) * ks)} />;
      })}
      <Etiquette x={sx + (d.b * ks) / 2} y={y0 + d.h * ks + 20} ancre="middle" taille={11} gras>
        coupe A-A
      </Etiquette>
    </Figure>
  );
}

/** Formes usuelles des armatures façonnées. */
export function FormesBarres() {
  const s = ARMATURE;
  return (
    <Figure alt="Formes usuelles des armatures : la barre droite ; la barre terminée par des crochets ; la barre coudée en L ; le cadre fermé, qui entoure les barres d'une poutre ou d'un poteau ; l'étrier en U ; l'épingle, qui relie deux barres opposées." largeur={620} hauteur={170}>
      <g fill="none" stroke={s} strokeWidth={2.4} strokeLinecap="round">
        <path d="M30 60 H150" />
        <path d="M200 70 H320 M200 70 a10 10 0 0 1 0 -20 h8 M320 70 a10 10 0 0 0 0 -20 h-8" />
        <path d="M370 40 V80 H460" />
        <path d="M30 100 h70 v50 h-70 z M36 100 l14 14" />
        <path d="M200 100 v50 h70 v-50" />
        <path d="M370 110 h80 a12 12 0 0 1 0 24 h-80" />
      </g>
      {[
        [90, 90, 'barre droite'],
        [260, 90, 'à crochets'],
        [415, 100, 'coudée en L'],
        [65, 166, 'cadre'],
        [235, 166, 'étrier'],
        [415, 160, 'épingle'],
      ].map(([x, y, t]) => (
        <Etiquette key={t as string} x={x as number} y={y as number} ancre="middle" taille={11}>
          {t as string}
        </Etiquette>
      ))}
    </Figure>
  );
}

/** La poutre et sa cage d'armatures en perspective cavalière, calques activables. */
export function PoutreCageIso({ d }: { d: DonneesPoutreFer }) {
  const n = nomenclaturePoutre(d);
  const L = d.L;
  const proj = (q: Point3) => cavaliere(q, 30, 0.6);
  const coins: Point3[] = [[0, 0, 0], [L, 0, 0], [L, d.b, 0], [0, d.b, 0], [0, 0, d.h], [L, 0, d.h], [L, d.b, d.h], [0, d.b, d.h]];
  const pr = coins.map(proj);
  const xs = pr.map((p) => p[0]);
  const ys = pr.map((p) => p[1]);
  const k = Math.min(540 / (Math.max(...xs) - Math.min(...xs)), 120 / (Math.max(...ys) - Math.min(...ys)));
  const Q = (q: Point3): Point2 => [40 + (proj(q)[0] - Math.min(...xs)) * k, 40 + (Math.max(...ys) - proj(q)[1]) * k];
  const hauteur = 40 + (Math.max(...ys) - Math.min(...ys)) * k + 60;
  const poly = (pts: Point3[]) => points(pts.map(Q));
  const pas = (L - 2 * d.premier) / Math.max(n.nCadres - 1, 1);
  const bars = (nb: number, z: number) => Array.from({ length: nb }, (_, i) => d.c + (nb === 1 ? (d.b - 2 * d.c) / 2 : (i * (d.b - 2 * d.c)) / (nb - 1))).map((y) => [y, z] as const);
  return (
    <Figure alt={`La poutre de ${n2(L)} m en perspective cavalière : le coffrage, transparent, et la cage d'armatures : ${d.nInf} barres HA ${d.phiInf} en bas, ${d.nSup} HA ${d.phiSup} en haut, ${n.nCadres} cadres HA ${d.phiT}.`} largeur={620} hauteur={hauteur}>
      <Calque id="coffrage">
        <polygon points={poly([[0, d.b, 0], [L, d.b, 0], [L, d.b, d.h], [0, d.b, d.h]])} fill="var(--color-beton-clair)" fillOpacity={0.25} className="t-fin" />
        <polygon points={poly([[0, 0, d.h], [L, 0, d.h], [L, d.b, d.h], [0, d.b, d.h]])} fill="var(--color-beton-clair)" fillOpacity={0.3} className="t-moyen" />
        <polygon points={poly([[L, 0, 0], [L, d.b, 0], [L, d.b, d.h], [L, 0, d.h]])} fill="var(--color-beton-clair)" fillOpacity={0.45} className="t-moyen" />
      </Calque>
      <Calque id="cadres">
        {Array.from({ length: n.nCadres }, (_, i) => {
          const x = d.premier + i * pas;
          return <polygon key={i} points={poly([[x, d.c, d.c], [x, d.b - d.c, d.c], [x, d.b - d.c, d.h - d.c], [x, d.c, d.h - d.c]])} fill="none" stroke={ARMATURE} strokeWidth={1} />;
        })}
      </Calque>
      <Calque id="barres">
        {[...bars(d.nInf, d.c), ...bars(d.nSup, d.h - d.c)].map(([y, z], i) => (
          <line key={i} x1={Q([d.c, y, z])[0]} y1={Q([d.c, y, z])[1]} x2={Q([L - d.c, y, z])[0]} y2={Q([L - d.c, y, z])[1]} stroke={ARMATURE} strokeWidth={2.2} strokeLinecap="round" />
        ))}
      </Calque>
      <Calque id="coffrage">
        <polygon points={poly([[0, 0, 0], [L, 0, 0], [L, 0, d.h], [0, 0, d.h]])} fill="var(--color-beton-clair)" fillOpacity={0.12} className="t-moyen" />
      </Calque>
      <Calque id="reperes">
        <Etiquette x={Q([L * 0.3, 0, 0])[0]} y={Q([L * 0.3, 0, 0])[1] + 20} ancre="middle" taille={11} gras couleur={BLEU}>
          {`① ${d.nInf} HA ${d.phiInf} en bas`}
        </Etiquette>
        <Etiquette x={Q([L * 0.3, d.b, d.h])[0]} y={Q([L * 0.3, d.b, d.h])[1] - 10} ancre="middle" taille={11} gras couleur={BLEU}>
          {`② ${d.nSup} HA ${d.phiSup} en haut`}
        </Etiquette>
        <Etiquette x={Q([L * 0.75, 0, 0])[0]} y={Q([L * 0.75, 0, 0])[1] + 20} ancre="middle" taille={11} gras couleur={BLEU}>
          {`③ ${n.nCadres} cadres HA ${d.phiT}`}
        </Etiquette>
      </Calque>
    </Figure>
  );
}

/** Erreur : une poutre de 20 × 40 cm posée à plat ne porte presque plus rien. */
export function BxH({ b = 0.2, h = 0.4 }: { b?: number; h?: number }) {
  const k = 260;
  const rapport = h / b;
  return (
    <Figure alt={`Deux sections de la même poutre : ${nombre(b * 100, 0)} cm de large pour ${nombre(h * 100, 0)} cm de haut, posée sur chant, et la même tournée à plat. La résistance à la flexion dépend du carré de la hauteur : à plat, elle est divisée par ${nombre(rapport, 0)}. « 20 × 40 » se lit largeur × hauteur.`} largeur={620} hauteur={190}>
      <Hachures prefixe="bxh" types={['ba']} />
      <rect x={120} y={30} width={b * k} height={h * k} fill={hachure('bxh', 'ba')} className="t-fort" />
      <Etiquette x={120 + (b * k) / 2} y={30 + h * k + 20} ancre="middle" taille={11.5} gras couleur={VERT}>
        {`✓ ${nombre(b * 100, 0)} × ${nombre(h * 100, 0)} : sur chant`}
      </Etiquette>
      <rect x={360} y={30 + (h - b) * k} width={h * k} height={b * k} fill={hachure('bxh', 'ba')} className="t-fort" />
      <Etiquette x={360 + (h * k) / 2} y={30 + h * k + 20} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        {`✗ à plat : ${nombre(rapport, 0)} fois moins résistante`}
      </Etiquette>
    </Figure>
  );
}

/** Erreur : dans une console, les aciers principaux vont en haut, là où le béton est tendu. */
export function ConsoleAciers() {
  const console_ = (x0: number, haut: boolean) => (
    <g>
      <rect x={x0} y={30} width={30} height={130} fill={hachure('ca', 'ba')} className="t-fort" />
      <rect x={x0 + 30} y={40} width={180} height={40} fill="var(--color-beton-clair)" className="t-fort" />
      <line x1={x0 + 10} y1={haut ? 47 : 73} x2={x0 + 204} y2={haut ? 47 : 73} stroke={ARMATURE} strokeWidth={3} />
      {!haut ? <path d={`M${x0 + 60} 40 l4 10 l-4 8 l5 8`} fill="none" stroke={ROUGE} strokeWidth={1.6} /> : null}
      <Fleche x1={x0 + 200} y1={2} x2={x0 + 200} y2={36} couleur={ROUGE} epaisseur={2} tete={8} />
    </g>
  );
  return (
    <Figure alt="Deux balcons en console, encastrés dans un mur et chargés au bout. La console fléchit vers le bas : sa face supérieure est tendue. À gauche, les aciers sont en haut, là où le béton est tendu : juste. À droite, ils sont en bas : le béton se fissure en haut, près du mur, et la console peut tomber." largeur={620} hauteur={196}>
      <Hachures prefixe="ca" types={['ba']} />
      {console_(40, true)}
      {console_(350, false)}
      <Etiquette x={150} y={186} ancre="middle" taille={11.5} gras couleur={VERT}>
        ✓ aciers en haut, côté tendu
      </Etiquette>
      <Etiquette x={460} y={186} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        ✗ aciers en bas : fissure en haut
      </Etiquette>
    </Figure>
  );
}

/** Cales d'enrobage : elles tiennent les aciers à la bonne distance du coffrage. */
export function CalesEnrobage({ c = 0.03 }: { c?: number }) {
  const k = 900;
  return (
    <Figure alt={`Coupe d'un fond de coffrage de poutre : les barres reposent sur des cales en béton ou en plastique, qui les tiennent à ${nombre(c * 100, 0)} cm du coffrage. Sans cales, les aciers touchent le fond, le béton ne les enrobe plus et ils rouillent (L1.5.6).`} largeur={620} hauteur={170}>
      <rect x={60} y={120} width={500} height={18} fill="var(--color-terre-clair)" className="t-moyen" />
      {[150, 310, 470].map((x) => (
        <g key={x}>
          <polygon points={points([[x - 14, 120], [x + 14, 120], [x + 8, 120 - c * k + 6], [x - 8, 120 - c * k + 6]])} fill="var(--fond-beton)" className="t-moyen" />
          <circle cx={x} cy={120 - c * k} r={7} fill={ARMATURE} />
        </g>
      ))}
      <line x1={80} y1={120 - c * k} x2={540} y2={120 - c * k} stroke={ARMATURE} strokeWidth={1} strokeDasharray="4 3" />
      <Cote x1={560} y1={120} x2={560} y2={120 - c * k} decalage={-16} texte={`${nombre(c * 100, 0)} cm`} />
      <Renvoi de={[200, 40]} vers={[312, 98]} texte="cale d’enrobage" />
      <Etiquette x={70} y={156} taille={11}>
        fond de coffrage
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.6.12 : cartouche, indices et nomenclatures ----------

/** Le cartouche est la carte d'identité du plan. */
export function CarteIdentite() {
  const lignes: [string, string][] = [
    ['nom', 'titre du plan'],
    ['numéro', 'numéro du plan'],
    ['date de délivrance', 'date'],
    ['autorité', 'auteur, vérificateur'],
  ];
  return (
    <Figure alt={`Une carte d'identité et un cartouche côte à côte : ${lignes.map(([a, b]) => `${a} ↔ ${b}`).join(' ; ')}. Le cartouche ajoute l'échelle et l'indice, qui dit de quelle version du plan il s'agit.`} largeur={620} hauteur={190}>
      <rect x={30} y={30} width={220} height={130} rx={10} fill="var(--color-encre-clair)" className="t-moyen" />
      <rect x={44} y={48} width={50} height={64} rx={4} fill="var(--color-papier)" className="t-fin" />
      <circle cx={69} cy={72} r={12} fill="var(--trait-doux)" opacity={0.5} />
      {lignes.map(([a], i) => (
        <Etiquette key={a} x={104} y={60 + i * 24} taille={10.5}>
          {a}
        </Etiquette>
      ))}
      <rect x={370} y={30} width={220} height={130} fill="var(--color-papier)" className="t-fort" />
      {lignes.map(([, b], i) => (
        <g key={b}>
          <line x1={370} y1={30 + (i + 1) * 26} x2={590} y2={30 + (i + 1) * 26} className="t-fin" />
          <Etiquette x={378} y={48 + i * 26} taille={10.5}>
            {b}
          </Etiquette>
          <line x1={226} y1={56 + i * 24} x2={366} y2={44 + i * 26} stroke={BLEU} strokeWidth={0.8} strokeDasharray="3 3" />
        </g>
      ))}
      <Etiquette x={378} y={152} taille={10.5} gras couleur={ROUGE}>
        + échelle, indice
      </Etiquette>
    </Figure>
  );
}

/** Un cartouche complet, champs numérotés. */
export function CartoucheAnnote() {
  const champs: [number, number, number, number, string, string][] = [
    [0, 0, 6, 1, 'Maître d’ouvrage : M. et Mme Kabongo', '1'],
    [0, 1, 6, 1, 'Projet : maison de deux pièces, parcelle 1245, Kinshasa', '2'],
    [0, 2, 6, 1, 'PLAN DU REZ-DE-CHAUSSÉE', '3'],
    [0, 3, 2, 1, 'N° MAI-EXE-ARC-101', '4'],
    [2, 3, 1, 1, 'Éch. 1/50', '5'],
    [3, 3, 1, 1, 'A3', '6'],
    [4, 3, 1, 1, 'Ind. C', '7'],
    [5, 3, 1, 1, '10/2026', '8'],
    [0, 4, 3, 1, 'Dessiné : J. M.', '9'],
    [3, 4, 3, 1, 'Vérifié : A. L.', '10'],
  ];
  const cw = 92;
  const ch = 30;
  const x0 = 34;
  const y0 = 20;
  return (
    <Figure alt="Un cartouche complet, champs numérotés : 1 maître d'ouvrage ; 2 projet et adresse ; 3 titre du plan ; 4 numéro du plan ; 5 échelle ; 6 format ; 7 indice de révision ; 8 date ; 9 dessinateur ; 10 vérificateur. Chaque champ répond à une question : de quel bâtiment, quel dessin, quelle version, qui en répond ?" largeur={620} hauteur={y0 + 5 * ch + 16}>
      {champs.map(([c, r, w, h, t, num]) => (
        <g key={num}>
          <rect x={x0 + c * cw} y={y0 + r * ch} width={w * cw} height={h * ch} fill="var(--color-papier)" className={r === 2 ? 't-fort' : 't-fin'} strokeWidth={r === 2 ? undefined : 0.9} />
          <Etiquette x={x0 + c * cw + 22} y={y0 + r * ch + 20} taille={r === 2 ? 13 : 10.5} gras={r === 2}>
            {t}
          </Etiquette>
          <circle cx={x0 + c * cw + 10} cy={y0 + r * ch + 15} r={7.5} fill={BLEU} />
          <text x={x0 + c * cw + 10} y={y0 + r * ch + 18.5} textAnchor="middle" fontSize={9} fontWeight={700} fill="#ffffff">
            {num}
          </text>
        </g>
      ))}
    </Figure>
  );
}

/** Lecture d'un numéro de plan codifié. */
export function CodePlan() {
  const parts: [string, string][] = [
    ['MAI', 'projet'],
    ['EXE', 'phase'],
    ['ARC', 'lot'],
    ['PL', 'type'],
    ['101', 'numéro'],
    ['C', 'indice'],
  ];
  const l = 78;
  return (
    <Figure alt={`Un numéro de plan se lit morceau par morceau : ${parts.map(([a, b]) => `${a} = ${b}`).join(', ')}. Ici : projet « maison », phase exécution, lot architecture, type plan, numéro 101, indice C.`} largeur={620} hauteur={130}>
      {parts.map(([a, b], i) => (
        <g key={a}>
          <rect x={40 + i * (l + 10)} y={30} width={l} height={34} rx={5} fill="var(--color-encre-clair)" stroke={BLEU} />
          <Etiquette x={40 + i * (l + 10) + l / 2} y={53} ancre="middle" taille={15} gras couleur={BLEU}>
            {a}
          </Etiquette>
          {i < parts.length - 1 ? (
            <Etiquette x={40 + i * (l + 10) + l + 5} y={53} ancre="middle" taille={15} gras>
              -
            </Etiquette>
          ) : null}
          <Etiquette x={40 + i * (l + 10) + l / 2} y={88} ancre="middle" taille={11}>
            {b}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Un plan révisé : nuage autour de la modification, triangle d'indice, tableau des révisions. */
export function NuageRevision() {
  const nuage = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * 2 * Math.PI;
    return [380 + 92 * Math.cos(a), 84 + 44 * Math.sin(a)] as const;
  });
  const d = nuage.map(([x, y], i) => {
    const [x2, y2] = nuage[(i + 1) % nuage.length]!;
    return `${i === 0 ? `M${x} ${y}` : ''} Q ${(x + x2) / 2 + (x2 - x) * 0.1 + (y2 - y) * 0.35} ${(y + y2) / 2 - (x2 - x) * 0.35} ${x2} ${y2}`;
  });
  const revs: [string, string, string][] = [
    ['A', '06/2026', 'première diffusion'],
    ['B', '08/2026', 'cotes des cloisons'],
    ['C', '10/2026', 'fenêtre F1 élargie à 1,40'],
  ];
  return (
    <Figure alt="Un extrait de plan révisé : la fenêtre modifiée est entourée d'un nuage, avec un petit triangle portant l'indice C. Au-dessus du cartouche, le tableau des révisions liste chaque indice, sa date et ce qui a changé : A, première diffusion ; B, cotes des cloisons ; C, fenêtre F1 élargie." largeur={620} hauteur={250}>
      <Hachures prefixe="nr" types={['maconnerie']} />
      <rect x={60} y={70} width={250} height={16} fill={hachure('nr', 'maconnerie')} className="t-fort" />
      <rect x={430} y={70} width={150} height={16} fill={hachure('nr', 'maconnerie')} className="t-fort" />
      <path d="M310 70h120M310 78h120M310 86h120" className="t-fin" />
      <Cote x1={310} y1={86} x2={430} y2={86} decalage={-16} texte="1,40" />
      <path d={d.join(' ')} fill="none" stroke={ROUGE} strokeWidth={1.6} />
      <polygon points={points([[478, 30], [494, 30], [486, 16]])} fill="none" stroke={ROUGE} strokeWidth={1.4} />
      <Etiquette x={486} y={28} ancre="middle" taille={9} gras couleur={ROUGE}>
        C
      </Etiquette>
      {revs.map(([i, date, objet], k) => (
        <g key={i}>
          <rect x={160} y={150 + k * 26} width={40} height={26} fill="var(--color-papier)" className="t-fin" />
          <rect x={200} y={150 + k * 26} width={80} height={26} fill="var(--color-papier)" className="t-fin" />
          <rect x={280} y={150 + k * 26} width={260} height={26} fill="var(--color-papier)" className="t-fin" />
          <Etiquette x={180} y={167 + k * 26} ancre="middle" taille={11} gras couleur={k === 2 ? ROUGE : undefined}>
            {i}
          </Etiquette>
          <Etiquette x={208} y={167 + k * 26} taille={10.5}>
            {date}
          </Etiquette>
          <Etiquette x={288} y={167 + k * 26} taille={10.5}>
            {objet}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={160} y={142} taille={11} gras>
        tableau des révisions
      </Etiquette>
    </Figure>
  );
}

/** Nomenclature des menuiseries : chaque type dessiné avec ses dimensions et son nombre. */
export function MenuiseriesSchema({ lignes }: { lignes: readonly LigneMenuiserie[] }) {
  const r = nomenclatureMenuiseries(lignes);
  const k = 56;
  let x = 40;
  return (
    <Figure alt={`Nomenclature des menuiseries : ${r.lignes.map((m) => `${m.repere} ${m.designation}, ${m.nombre} × ${n2(m.largeur)} × ${n2(m.hauteur)} m, soit ${n2(m.surface)} m²`).join(' ; ')}. Total : ${r.nombre} baies, ${n2(r.total)} m².`} largeur={620} hauteur={196}>
      {r.lignes.map((m) => {
        const x0 = x;
        x += m.largeur * k + 110;
        return (
          <g key={m.repere}>
            <rect x={x0} y={150 - m.hauteur * k} width={m.largeur * k} height={m.hauteur * k} fill="var(--fond-eau)" className="t-moyen" />
            <Etiquette x={x0 + (m.largeur * k) / 2} y={150 - m.hauteur * k - 8} ancre="middle" taille={12} gras couleur={BLEU}>
              {`${m.repere} × ${m.nombre}`}
            </Etiquette>
            <Etiquette x={x0 + (m.largeur * k) / 2} y={168} ancre="middle" taille={10.5}>
              {`${n2(m.largeur)} × ${n2(m.hauteur)}`}
            </Etiquette>
            <Etiquette x={x0 + (m.largeur * k) / 2} y={184} ancre="middle" taille={10.5} couleur={BLEU}>
              {`${n2(m.surface)} m²`}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Erreur : construire avec un indice périmé. */
export function IndicePerime({ chantier, actuel }: { chantier: string; actuel: string }) {
  const r = retardIndice(chantier, actuel);
  const plan = (x: number, i: string, c: string, t: string) => (
    <g>
      <rect x={x} y={30} width={170} height={110} fill="var(--color-papier)" className="t-moyen" />
      <rect x={x + 100} y={112} width={64} height={22} fill="var(--color-papier)" className="t-fin" />
      <Etiquette x={x + 132} y={128} ancre="middle" taille={12} gras couleur={c}>
        {`ind. ${i}`}
      </Etiquette>
      <Etiquette x={x + 85} y={160} ancre="middle" taille={11.5} gras couleur={c}>
        {t}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt={`Le chef de chantier construit avec le plan à l'indice ${chantier} ; le bureau d'études a diffusé l'indice ${actuel} : le plan du chantier a ${r} révision${r > 1 ? 's' : ''} de retard. Tout ce qui a changé entre-temps sera construit faux.`} largeur={620} hauteur={180}>
      {plan(60, chantier, ROUGE, 'sur le chantier')}
      {plan(390, actuel, VERT, 'au bureau d’études')}
      <Fleche x1={240} y1={85} x2={380} y2={85} couleur={ROUGE} epaisseur={2} tete={9} />
      <Etiquette x={310} y={74} ancre="middle" taille={12} gras couleur={ROUGE}>
        {`${r} révision${r > 1 ? 's' : ''} de retard`}
      </Etiquette>
    </Figure>
  );
}

/** Liste des plans affichée au bureau de chantier, indices à jour. */
export function ListePlans({ lignes }: { lignes: readonly { code: string; titre: string; indice: string; date: string; perime?: boolean }[] }) {
  return (
    <Figure alt={`Liste des plans affichée au bureau du chantier : ${lignes.map((l) => `${l.code}, ${l.titre}, indice ${l.indice}${l.perime ? ', périmé et barré' : ''}`).join(' ; ')}. On la met à jour à chaque diffusion et l'on retire du chantier les plans périmés.`} largeur={620} hauteur={50 + lignes.length * 26}>
      {['N°', 'titre', 'ind.', 'date'].map((t, i) => (
        <Etiquette key={t} x={[40, 210, 470, 520][i]!} y={30} taille={11} gras>
          {t}
        </Etiquette>
      ))}
      {lignes.map((l, i) => (
        <g key={l.code + l.indice} opacity={l.perime ? 0.55 : 1}>
          <line x1={30} y1={38 + i * 26} x2={590} y2={38 + i * 26} className="t-fin" />
          <Etiquette x={40} y={56 + i * 26} taille={10.5}>
            {l.code}
          </Etiquette>
          <Etiquette x={210} y={56 + i * 26} taille={10.5}>
            {l.titre}
          </Etiquette>
          <Etiquette x={470} y={56 + i * 26} taille={10.5} gras>
            {l.indice}
          </Etiquette>
          <Etiquette x={520} y={56 + i * 26} taille={10.5}>
            {l.date}
          </Etiquette>
          {l.perime ? <line x1={36} y1={52 + i * 26} x2={580} y2={52 + i * 26} stroke={ROUGE} strokeWidth={1.4} /> : null}
        </g>
      ))}
    </Figure>
  );
}
