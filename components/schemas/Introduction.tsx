// Schémas du module L1.1 (introduction au génie civil). Les valeurs viennent de lib/calc/projet.ts.
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { cadreIsoDirect, Fleche3, type P2 } from '@/components/drawing/Iso3D';
import { Calque } from '@/components/gabarits/Vue3D';
import { GARANTIES, type DonneesDescente, type ResultatDescente, type ResultatPlanning } from '@/lib/calc/projet';
import type { Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';
const TERRE = 'var(--color-terre)';

/** Numéro cerclé qui renvoie à une légende ou à un panneau. */
function Numero({ x, y, n, couleur = BLEU }: { x: number; y: number; n: number | string; couleur?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill="var(--color-papier)" stroke={couleur} strokeWidth={1.6} />
      <Etiquette x={x} y={y + 4} ancre="middle" taille={11} gras couleur={couleur}>
        {String(n)}
      </Etiquette>
    </g>
  );
}

/** Boîte d'organigramme : titre en gras et ligne d'explication. */
function Boite({ x, y, l, h = 46, titre, sous, couleur = BLEU }: { x: number; y: number; l: number; h?: number; titre: string; sous?: string; couleur?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={l} height={h} rx={5} fill="var(--color-papier)" stroke={couleur} strokeWidth={1.8} />
      <Etiquette x={x + l / 2} y={y + (sous ? 19 : h / 2 + 4)} ancre="middle" taille={11.5} gras couleur={couleur}>
        {titre}
      </Etiquette>
      {sous ? (
        <Etiquette x={x + l / 2} y={y + 35} ancre="middle" taille={10}>
          {sous}
        </Etiquette>
      ) : null}
    </g>
  );
}

// ---------- L1.1.1 : domaines du génie civil ----------

export const DOMAINES = ['bâtiment', 'ouvrages d’art', 'routes et pistes', 'eau potable', 'géotechnique', 'assainissement et drainage'] as const;

/** Profil d'une vallée équipée : chaque ouvrage porte le numéro de son domaine. */
export function PaysageGenieCivil({ prefixe = 'pg' }: { prefixe?: string }) {
  const sol = (x: number) => (x < 230 ? 160 : x < 300 ? 160 + ((x - 230) / 70) * 75 : x < 380 ? 235 : x < 450 ? 235 - ((x - 380) / 70) * 85 : 150);
  const profil: P2[] = Array.from({ length: 61 }, (_, i) => [10 + i * 10, sol(10 + i * 10)]);
  return (
    <Figure
      alt="Profil d'une vallée : un château d'eau et sa conduite (eau potable), une route qui descend vers un pont sur la rivière (route, ouvrage d'art), un mur de soutènement et des fondations (géotechnique), un bâtiment, et une buse sous la route avec un caniveau (assainissement et drainage)"
      largeur={620}
      hauteur={318}
    >
      <Hachures prefixe={prefixe} types={['terre', 'eau', 'ba']} />
      <polygon points={points([...profil, [610, 268], [10, 268]])} fill={hachure(prefixe, 'terre')} stroke="none" />
      <polyline points={points(profil)} fill="none" className="t-fort" />
      <rect x={300} y={235} width={80} height={14} fill={hachure(prefixe, 'eau')} stroke="none" />
      {/* pont : tablier, piles, culées */}
      <rect x={226} y={148} width={228} height={8} fill={hachure(prefixe, 'ba')} className="t-fort" />
      {[300, 380].map((x) => (
        <rect key={x} x={x - 5} y={156} width={10} height={84} fill={hachure(prefixe, 'ba')} className="t-moyen" />
      ))}
      <Numero x={340} y={136} n={2} />
      {/* route et sa chaussée */}
      <rect x={60} y={154} width={168} height={6} fill="var(--color-beton)" stroke="none" />
      <Numero x={150} y={142} n={3} />
      {/* buse sous la route et caniveau */}
      <circle cx={196} cy={170} r={7} fill="var(--color-papier)" className="t-moyen" />
      <Numero x={196} y={196} n={6} couleur={TERRE} />
      {/* château d'eau et conduite */}
      <rect x={24} y={60} width={34} height={22} className="t-fort" fill="none" />
      <line x1={30} y1={82} x2={30} y2={160} className="t-moyen" />
      <line x1={52} y1={82} x2={52} y2={160} className="t-moyen" />
      <polyline points={points([[41, 82], [41, 176], [220, 176], [300, 252], [380, 252], [470, 166], [520, 166], [520, 150]])} fill="none" stroke={BLEU} strokeWidth={1.6} strokeDasharray="5 3" />
      <Numero x={41} y={46} n={4} />
      {/* mur de soutènement côté droit */}
      <polygon points={points([[452, 150], [460, 150], [470, 200], [452, 200]])} fill={hachure(prefixe, 'ba')} className="t-moyen" />
      <Numero x={436} y={196} n={5} couleur={TERRE} />
      {/* bâtiment et fondations */}
      <rect x={490} y={70} width={90} height={80} className="t-fort" fill="var(--color-beton-clair)" />
      <line x1={490} y1={110} x2={580} y2={110} className="t-moyen" />
      {[498, 530, 562].map((x) => (
        <rect key={x} x={x} y={84} width={12} height={16} className="t-fin" fill="none" />
      ))}
      {[492, 578].map((x) => (
        <rect key={x} x={x - 8} y={150} width={18} height={14} fill={hachure(prefixe, 'ba')} className="t-moyen" />
      ))}
      <Numero x={535} y={56} n={1} />
      <Numero x={600} y={160} n={5} couleur={TERRE} />
      {DOMAINES.map((d, i) => (
        <g key={d}>
          <Numero x={22 + (i % 3) * 205} y={i < 3 ? 286 : 306} n={i + 1} couleur={i === 4 || i === 5 ? TERRE : BLEU} />
          <Etiquette x={36 + (i % 3) * 205} y={i < 3 ? 290 : 310} taille={11}>
            {d}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

// ---------- L1.1.2 : les acteurs ----------

/** Les acteurs d'un projet : traits pleins pour les contrats, pointillés pour les missions. */
export function OrganigrammeActeurs() {
  return (
    <Figure
      alt="Organigramme : le maître d'ouvrage, financé par un bailleur et autorisé par l'administration, signe un contrat avec le maître d'œuvre, un marché avec l'entreprise et un contrat avec le bureau de contrôle ; le maître d'œuvre dirige les travaux de l'entreprise ; le bureau de contrôle donne des avis"
      largeur={620}
      hauteur={320}
    >
      <Boite x={220} y={14} l={180} titre="Maître d’ouvrage" sous="le client : commande et paie" />
      <Boite x={14} y={14} l={150} titre="Bailleur de fonds" sous="finance le projet" couleur={TERRE} />
      <Boite x={456} y={14} l={150} titre="Administration" sous="autorisation de bâtir" couleur={TERRE} />
      <Boite x={14} y={128} l={190} titre="Maître d’œuvre" sous="architecte, bureau d’études" />
      <Boite x={416} y={128} l={190} titre="Bureau de contrôle" sous="vérifie solidité et sécurité" couleur={VERT} />
      <Boite x={210} y={238} l={200} titre="Entreprise de travaux" sous="construit ; ses sous-traitants" couleur={BRIQUE} />
      <Fleche x1={164} y1={37} x2={218} y2={37} couleur={TERRE} epaisseur={1.6} tete={7} />
      <Fleche x1={456} y1={37} x2={402} y2={37} couleur={TERRE} epaisseur={1.6} tete={7} />
      <line x1={250} y1={60} x2={130} y2={128} stroke={BLEU} strokeWidth={1.8} />
      <line x1={370} y1={60} x2={490} y2={128} stroke={BLEU} strokeWidth={1.8} />
      <line x1={310} y1={60} x2={310} y2={238} stroke={BLEU} strokeWidth={1.8} />
      <Etiquette x={170} y={92} ancre="end" taille={10.5}>
        contrat de maîtrise d’œuvre
      </Etiquette>
      <Etiquette x={450} y={92} taille={10.5}>
        contrat de contrôle
      </Etiquette>
      <Etiquette x={316} y={150} taille={10.5}>
        marché de travaux
      </Etiquette>
      <Fleche x1={150} y1={174} x2={224} y2={238} couleur={BLEU} epaisseur={1.6} tete={8} pointilles texte="dirige, ordres de service" tx={150} ty={214} ancre="end" taille={10.5} />
      <Fleche x1={470} y1={174} x2={398} y2={238} couleur={VERT} epaisseur={1.6} tete={8} pointilles texte="avis" tx={448} ty={214} taille={10.5} />
      <line x1={420} y1={300} x2={450} y2={300} stroke={BLEU} strokeWidth={1.8} />
      <Etiquette x={456} y={304} taille={10.5}>
        contrat
      </Etiquette>
      <line x1={510} y1={300} x2={540} y2={300} stroke={BLEU} strokeWidth={1.6} strokeDasharray="5 3" />
      <Etiquette x={546} y={304} taille={10.5}>
        mission
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.1.3 : les métiers ----------

/** Organisation d'un bureau d'études et d'un chantier. */
export function OrganigrammeChantier() {
  const chantier = [
    { titre: 'Conducteur de travaux', sous: 'un ou plusieurs chantiers' },
    { titre: 'Chef de chantier', sous: 'organise le chantier au quotidien' },
    { titre: 'Chefs d’équipe', sous: 'maçons, coffreurs, ferrailleurs' },
    { titre: 'Compagnons et manœuvres', sous: 'exécutent, conduisent les engins' },
  ];
  return (
    <Figure
      alt="À gauche, le bureau d'études : ingénieur d'études, projeteurs, métreur. À droite, le chantier : conducteur de travaux, chef de chantier, chefs d'équipe, compagnons et manœuvres, avec le topographe, le laboratoire et le responsable sécurité à côté. Les plans vont du bureau d'études au chantier"
      largeur={620}
      hauteur={320}
    >
      <Etiquette x={110} y={18} ancre="middle" taille={12} gras>
        bureau d’études
      </Etiquette>
      <Boite x={14} y={30} l={192} titre="Ingénieur d’études" sous="conçoit, calcule, vérifie" />
      <Boite x={14} y={104} l={192} titre="Projeteurs, dessinateurs" sous="plans, maquette numérique" />
      <Boite x={14} y={178} l={192} titre="Métreur, économiste" sous="quantités, coûts" />
      <line x1={110} y1={76} x2={110} y2={104} stroke={BLEU} strokeWidth={1.6} />
      <line x1={110} y1={150} x2={110} y2={178} stroke={BLEU} strokeWidth={1.6} />
      <Fleche x1={206} y1={127} x2={300} y2={127} couleur={TERRE} epaisseur={2} tete={9} texte="plans" tx={253} ty={118} ancre="middle" taille={11} />
      <Etiquette x={410} y={18} ancre="middle" taille={12} gras>
        chantier
      </Etiquette>
      {chantier.map((c, i) => (
        <g key={c.titre}>
          <Boite x={304} y={30 + i * 72} l={212} titre={c.titre} sous={c.sous} couleur={BRIQUE} />
          {i > 0 ? <line x1={410} y1={30 + i * 72 - 26} x2={410} y2={30 + i * 72} stroke={BRIQUE} strokeWidth={1.6} /> : null}
        </g>
      ))}
      {['topographe', 'laboratoire', 'sécurité (HSE)'].map((t, i) => (
        <g key={t}>
          <rect x={530} y={44 + i * 72} width={80} height={30} rx={4} fill="var(--color-papier)" stroke={VERT} strokeWidth={1.4} />
          <Etiquette x={570} y={63 + i * 72} ancre="middle" taille={10.5} couleur={VERT}>
            {t}
          </Etiquette>
          <line x1={516} y1={59 + i * 72} x2={530} y2={59 + i * 72} stroke={VERT} strokeWidth={1.2} strokeDasharray="3 3" />
        </g>
      ))}
    </Figure>
  );
}

// ---------- L1.1.4 : phases et planning ----------

/** Frise des phases d'un projet, avec leurs livrables et les garanties après réception. */
export function FrisePhases() {
  const phases = [
    { nom: 'programme', livrable: 'besoins, budget', c: TERRE },
    { nom: 'conception', livrable: 'plans, notes de calcul', c: BLEU },
    { nom: 'autorisation', livrable: 'autorisation de bâtir', c: TERRE },
    { nom: 'consultation', livrable: 'marché signé', c: TERRE },
    { nom: 'travaux', livrable: 'ouvrage construit', c: BRIQUE },
    { nom: 'réception', livrable: 'procès-verbal', c: VERT },
  ];
  const w = 92;
  return (
    <Figure
      alt={`Frise : programme, conception, autorisation, consultation des entreprises, travaux, réception ; puis ${GARANTIES.map((g) => `${g.nom} (${g.ans} an${g.ans > 1 ? 's' : ''})`).join(', ')}`}
      largeur={620}
      hauteur={250}
    >
      {phases.map((p, i) => {
        const x = 14 + i * (w + 8);
        return (
          <g key={p.nom}>
            <polygon points={points([[x, 40], [x + w - 10, 40], [x + w, 62], [x + w - 10, 84], [x, 84], [x + 10, 62]])} fill={p.c} fillOpacity={0.16} stroke={p.c} strokeWidth={1.6} />
            <Etiquette x={x + w / 2 + 2} y={66} ancre="middle" taille={11.5} gras couleur={p.c}>
              {p.nom}
            </Etiquette>
            <line x1={x + w / 2} y1={84} x2={x + w / 2} y2={104} className="t-fin" />
            <Etiquette x={x + w / 2} y={118} ancre="middle" taille={10.5}>
              {p.livrable}
            </Etiquette>
            <Numero x={x + w / 2} y={24} n={i + 1} couleur={p.c} />
          </g>
        );
      })}
      <line x1={14} y1={150} x2={606} y2={150} className="t-fin" strokeDasharray="4 4" />
      <Etiquette x={14} y={172} taille={11.5} gras>
        après la réception :
      </Etiquette>
      {GARANTIES.map((g, i) => (
        <g key={g.nom}>
          <rect x={14} y={184 + i * 20} width={Math.max(18, g.ans * 30)} height={14} fill={VERT} opacity={0.35 + i * 0.2} />
          <Etiquette x={22 + Math.max(18, g.ans * 30)} y={195 + i * 20} taille={10.5}>
            {g.ans} an{g.ans > 1 ? 's' : ''} : {g.nom} ({g.article})
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Diagramme de Gantt d'un planning séquentiel, en semaines. */
export function GanttPlanning({ r }: { r: ResultatPlanning }) {
  const x0 = 214;
  const W = 380;
  const k = W / Math.max(r.total, 1);
  const h = 22;
  const y0 = 26;
  const couleur = (i: number) => (r.lignes[i]!.debut >= r.debutTravaux ? BRIQUE : BLEU);
  const pas = r.total > 80 ? 20 : 10;
  return (
    <Figure alt={`Planning : ${r.lignes.length} phases enchaînées, ${r.total} semaines au total, travaux à partir de la semaine ${r.debutTravaux}`} largeur={620} hauteur={y0 + r.lignes.length * h + 46}>
      {Array.from({ length: Math.floor(r.total / pas) + 1 }, (_, i) => i * pas).map((t) => (
        <g key={t}>
          <line x1={x0 + t * k} y1={y0 - 6} x2={x0 + t * k} y2={y0 + r.lignes.length * h} className="t-fin" strokeDasharray="2 4" />
          <Etiquette x={x0 + t * k} y={y0 - 10} ancre="middle" taille={10}>
            {nombre(t, 0)}
          </Etiquette>
        </g>
      ))}
      {r.lignes.map((l, i) => (
        <g key={l.nom}>
          <Etiquette x={x0 - 8} y={y0 + i * h + 15} ancre="end" taille={11}>
            {l.nom}
          </Etiquette>
          <rect x={x0 + l.debut * k} y={y0 + i * h + 4} width={Math.max(l.duree * k, 2)} height={h - 8} fill={couleur(i)} opacity={0.75} />
          <Etiquette x={x0 + l.fin * k + 4} y={y0 + i * h + 15} taille={10}>
            {nombre(l.duree, 0)} sem.
          </Etiquette>
        </g>
      ))}
      <line x1={x0 + r.debutTravaux * k} y1={y0 - 4} x2={x0 + r.debutTravaux * k} y2={y0 + r.lignes.length * h + 6} stroke={ROUGE} strokeWidth={1.6} />
      <Etiquette x={x0 + r.debutTravaux * k - 4} y={y0 + r.lignes.length * h + 20} ancre="end" taille={10.5} couleur={ROUGE}>
        ordre de service : semaine {nombre(r.debutTravaux, 0)}
      </Etiquette>
      <Etiquette x={x0 + W} y={y0 + r.lignes.length * h + 36} ancre="end" taille={11} gras>
        total : {nombre(r.total, 0)} semaines (semaines comptées depuis le lancement)
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.1.5 et L1.1.6 : le bâtiment en perspective ----------

const LX = 8;
const LY = 5;
const HN = 3;
const POTEAUX: Array<readonly [number, number]> = [
  [0, 0],
  [4, 0],
  [8, 0],
  [0, 5],
  [4, 5],
  [8, 5],
];

/**
 * Petit bâtiment R+1 en vue écorchée (trièdre direct) : fondations, ossature, planchers, enveloppe, équipements,
 * et le cheminement des charges de la toiture jusqu'au sol. Chaque partie est un calque ; les repères numérotés
 * et leur légende forment le calque « reperes ».
 */
export function BatimentIso({ avecReperes = true }: { avecReperes?: boolean }) {
  const { P, poly, hauteur } = cadreIsoDirect(
    [[-0.8, -0.8, -1.4], [LX + 0.8, -0.8, -1.4], [-0.8, LY + 0.8, -1.4], [LX + 0.8, LY + 0.8, -1.4], [0, 0, 2 * HN + 1.6], [LX, LY, 2 * HN + 0.6], [LX, LY, -2]],
    avecReperes ? 430 : 620,
    480,
    24,
  );
  const L = (a: Point3, b: Point3, props: React.SVGProps<SVGLineElement>) => <line x1={P(a)[0]} y1={P(a)[1]} x2={P(b)[0]} y2={P(b)[1]} {...props} />;
  const boite = (x: number, y: number, z: number, dx: number, dy: number, dz: number, fill: string) => (
    <g>
      <polygon points={poly([[x + dx, y, z], [x + dx, y + dy, z], [x + dx, y + dy, z + dz], [x + dx, y, z + dz]])} fill={fill} className="t-fin" />
      <polygon points={poly([[x, y + dy, z], [x + dx, y + dy, z], [x + dx, y + dy, z + dz], [x, y + dy, z + dz]])} fill={fill} className="t-fin" />
      <polygon points={poly([[x, y, z + dz], [x + dx, y, z + dz], [x + dx, y + dy, z + dz], [x, y + dy, z + dz]])} fill={fill} className="t-fin" />
    </g>
  );
  const dalle = (z: number, opacite: number) => <polygon points={poly([[0, 0, z], [LX, 0, z], [LX, LY, z], [0, LY, z]])} fill="var(--color-beton-clair)" opacity={opacite} className="t-moyen" />;
  const trait = { stroke: 'var(--trait)', strokeWidth: 4 };
  const poteau = { stroke: 'var(--trait)', strokeWidth: 5 };
  const poutres = (z: number) => (
    <g>
      {L([0, 0, z], [LX, 0, z], trait)}
      {L([0, LY, z], [LX, LY, z], trait)}
      {[0, 4, 8].map((x) => (
        <g key={x}>{L([x, 0, z], [x, LY, z], trait)}</g>
      ))}
    </g>
  );
  // repères des éléments : numéro posé sur l'élément, légende à droite ; chacun suit aussi le calque de son élément
  const reperes: Array<{ n: number; q: Point3; nom: string; calque: string; c: string }> = [
    { n: 1, q: [LX, LY + 0.6, -1.15], nom: 'semelle', calque: 'fondations', c: TERRE },
    { n: 2, q: [LX / 2, LY, -0.3], nom: 'longrine', calque: 'fondations', c: TERRE },
    { n: 3, q: [LX / 2 + 1, LY / 2, 0], nom: 'dallage', calque: 'planchers', c: 'var(--color-acier)' },
    { n: 4, q: [LX, LY, HN / 2], nom: 'poteau', calque: 'structure', c: BLEU },
    { n: 5, q: [LX / 2 + 1.2, LY, HN], nom: 'poutre', calque: 'structure', c: BLEU },
    { n: 6, q: [LX / 2 - 1, LY / 2, HN], nom: 'dalle d’étage', calque: 'planchers', c: 'var(--color-acier)' },
    { n: 7, q: [LX, LY / 2, 2 * HN + 0.3], nom: 'acrotère', calque: 'planchers', c: 'var(--color-acier)' },
    { n: 8, q: [1, 0, 4.9], nom: 'mur de remplissage', calque: 'enveloppe', c: BRIQUE },
    { n: 9, q: [6, 0, 1.5], nom: 'baie (fenêtre)', calque: 'enveloppe', c: BRIQUE },
    { n: 10, q: [1.9, 1.9, 2 * HN + 1.3], nom: 'réservoir d’eau', calque: 'equipements', c: VERT },
    { n: 11, q: [LX - 0.3, LY, 1.6], nom: 'descente d’eaux pluviales', calque: 'equipements', c: VERT },
  ];
  const chemin: Array<[Point3, string]> = [
    [[2, 3.6, 2 * HN], '1 dalle'],
    [[6.4, LY, 2 * HN], '2 poutre'],
    [[LX, LY, 4.6], '3 poteau'],
    [[LX, LY, -0.55], '4 semelle'],
    [[LX, LY, -1.9], '5 sol'],
  ];
  return (
    <Figure
      alt="Bâtiment R+1 en perspective écorchée : semelles et longrines sous le sol, dallage, poteaux et poutres en béton armé, dalle d'étage et toiture-terrasse avec acrotère, murs de remplissage avec baies sur les façades arrière, réservoir d'eau et descente en toiture ; les éléments sont numérotés, et des flèches suivent les charges de la toiture jusqu'au sol"
      largeur={620}
      hauteur={hauteur}
    >
      <Calque id="enveloppe">
        <polygon points={poly([[0, 0, 0], [0, LY, 0], [0, LY, 2 * HN], [0, 0, 2 * HN]])} fill="var(--color-brique-clair)" opacity={0.7} className="t-fin" />
        <polygon points={poly([[0, 0, 0], [LX, 0, 0], [LX, 0, 2 * HN], [0, 0, 2 * HN]])} fill="var(--color-brique-clair)" opacity={0.7} className="t-fin" />
        {[1.2, 5.2].map((x) => [0.9, 3.9].map((z) => <polygon key={`${x}-${z}`} points={poly([[x, 0, z], [x + 1.6, 0, z], [x + 1.6, 0, z + 1.2], [x, 0, z + 1.2]])} fill="var(--color-papier)" className="t-fin" />))}
      </Calque>
      <Calque id="fondations">
        {POTEAUX.map(([x, y]) => (
          <g key={`s${x}${y}`}>{boite(x - 0.6, y - 0.6, -1.4, 1.2, 1.2, 0.5, 'var(--color-beton)')}</g>
        ))}
        {L([0, 0, -0.3], [LX, 0, -0.3], trait)}
        {L([0, LY, -0.3], [LX, LY, -0.3], trait)}
        {[0, 4, 8].map((x) => (
          <g key={`l${x}`}>{L([x, 0, -0.3], [x, LY, -0.3], trait)}</g>
        ))}
        {POTEAUX.map(([x, y]) => (
          <g key={`f${x}${y}`}>{L([x, y, -0.9], [x, y, 0], poteau)}</g>
        ))}
      </Calque>
      <Calque id="planchers">{dalle(0, 0.55)}</Calque>
      <Calque id="structure">
        {POTEAUX.map(([x, y]) => (
          <g key={`p${x}${y}`}>{L([x, y, 0], [x, y, HN], poteau)}</g>
        ))}
        {poutres(HN)}
      </Calque>
      <Calque id="planchers">{dalle(HN, 0.5)}</Calque>
      <Calque id="structure">
        {POTEAUX.map(([x, y]) => (
          <g key={`q${x}${y}`}>{L([x, y, HN], [x, y, 2 * HN], poteau)}</g>
        ))}
        {poutres(2 * HN)}
      </Calque>
      <Calque id="planchers">
        {dalle(2 * HN, 0.55)}
        <polygon points={poly([[LX, 0, 2 * HN], [LX, LY, 2 * HN], [LX, LY, 2 * HN + 0.6], [LX, 0, 2 * HN + 0.6]])} fill="var(--color-beton-clair)" fillOpacity={0.35} className="t-fin" />
        <polygon points={poly([[0, LY, 2 * HN], [LX, LY, 2 * HN], [LX, LY, 2 * HN + 0.6], [0, LY, 2 * HN + 0.6]])} fill="var(--color-beton-clair)" fillOpacity={0.35} className="t-fin" />
      </Calque>
      <Calque id="equipements">
        {boite(1.2, 1.2, 2 * HN, 1.4, 1.4, 1.2, 'var(--color-acier-clair)')}
        {L([LX - 0.3, LY, 2 * HN], [LX - 0.3, LY, -0.1], { stroke: BLEU, strokeWidth: 2.2, strokeDasharray: '6 3' })}
      </Calque>
      <Calque id="charges">
        {[0.8, 2.4, 4, 5.6, 7.2].map((x) =>
          [1.2, 3.8].map((y) => <Fleche3 key={`${x}-${y}`} P={P} de={[x, y, 2 * HN + 1.6]} vers={[x, y, 2 * HN + 0.05]} couleur={ROUGE} epaisseur={1.6} tete={7} />),
        )}
      </Calque>
      <Calque id="cheminement">
        <Fleche3 P={P} de={[2, 2.5, 2 * HN]} vers={[2, 4.6, 2 * HN]} couleur={VERT} epaisseur={2.6} tete={9} />
        <Fleche3 P={P} de={[5.2, LY, 2 * HN]} vers={[7.6, LY, 2 * HN]} couleur={VERT} epaisseur={2.6} tete={9} />
        <Fleche3 P={P} de={[LX, LY, 2 * HN - 0.3]} vers={[LX, LY, HN + 0.4]} couleur={VERT} epaisseur={3} tete={10} />
        <Fleche3 P={P} de={[LX, LY, HN - 0.3]} vers={[LX, LY, 0.3]} couleur={VERT} epaisseur={3} tete={10} />
        <Fleche3 P={P} de={[LX, LY, -0.2]} vers={[LX, LY, -0.85]} couleur={VERT} epaisseur={3} tete={10} />
        {[-0.45, 0, 0.45].map((d) => (
          <Fleche3 key={d} P={P} de={[LX + d, LY, -1.42]} vers={[LX + d, LY, -1.95]} couleur={VERT} epaisseur={1.6} tete={6} />
        ))}
      </Calque>
      {/* textes en dernier, pour qu'aucune surface ne les recouvre */}
      <Calque id="charges">
        <Etiquette x={P([LX / 2, 0, 2 * HN + 1.6])[0] - 10} y={P([LX / 2, 0, 2 * HN + 1.6])[1] - 8} ancre="end" taille={11} gras couleur={ROUGE}>
          charges sur la toiture
        </Etiquette>
      </Calque>
      <Calque id="cheminement">
        {chemin.map(([q, t]) => (
          <g key={t}>
            <line x1={P(q)[0]} y1={P(q)[1]} x2={P(q)[0] + 26} y2={P(q)[1] - 10} stroke={VERT} strokeWidth={0.9} />
            <Etiquette x={P(q)[0] + 29} y={P(q)[1] - 6} taille={11} gras couleur={VERT}>
              {t}
            </Etiquette>
          </g>
        ))}
      </Calque>
      {avecReperes ? (
        <Calque id="reperes">
          {reperes.map((r) => (
            <Calque key={r.n} id={r.calque}>
              <Numero x={P(r.q)[0]} y={P(r.q)[1]} n={r.n} couleur={r.c} />
            </Calque>
          ))}
          {reperes.map((r, i) => (
            <g key={`l${r.n}`}>
              <Numero x={452} y={30 + i * 24} n={r.n} couleur={r.c} />
              <Etiquette x={468} y={34 + i * 24} taille={11.5}>
                {r.nom}
              </Etiquette>
            </g>
          ))}
        </Calque>
      ) : null}
    </Figure>
  );
}

/** Coupe d'une maison de plain-pied, éléments numérotés (exemple résolu de L1.1.5). */
export function CoupeMaison({ prefixe = 'cm' }: { prefixe?: string }) {
  const sol = 220;
  return (
    <Figure alt="Coupe d'une maison de plain-pied : semelle filante, mur de soubassement, hérisson et dallage, mur en blocs, baie et linteau, chaînage, ferme de charpente, pannes et tôles, débord de toit, trottoir et caniveau périphériques ; chaque élément porte un numéro" largeur={620} hauteur={300}>
      <Hachures prefixe={prefixe} types={['terre', 'ba', 'maconnerie', 'gravier']} />
      <rect x={10} y={sol} width={600} height={70} fill={hachure(prefixe, 'terre')} stroke="none" />
      <line x1={10} y1={sol} x2={610} y2={sol} className="t-fort" />
      {[120, 480].map((x) => (
        <g key={x}>
          <rect x={x - 30} y={sol + 44} width={60} height={18} fill={hachure(prefixe, 'ba')} className="t-moyen" />
          <rect x={x - 10} y={sol - 6} width={20} height={50} fill={hachure(prefixe, 'maconnerie')} className="t-moyen" />
          <rect x={x - 10} y={88} width={20} height={sol - 94} fill={hachure(prefixe, 'maconnerie')} className="t-moyen" />
          <rect x={x - 10} y={78} width={20} height={12} fill={hachure(prefixe, 'ba')} className="t-moyen" />
        </g>
      ))}
      <rect x={130} y={sol - 12} width={340} height={14} fill={hachure(prefixe, 'gravier')} className="t-fin" />
      <rect x={130} y={sol - 22} width={340} height={10} fill={hachure(prefixe, 'ba')} className="t-moyen" />
      <rect x={470} y={120} width={20} height={60} fill="var(--color-papier)" className="t-fin" />
      <rect x={468} y={110} width={24} height={10} fill={hachure(prefixe, 'ba')} className="t-moyen" />
      <polyline points={points([[60, 92], [300, 30], [540, 92]])} fill="none" className="t-fort" />
      <line x1={110} y1={80} x2={490} y2={80} className="t-moyen" />
      {[[200, 56], [300, 30], [400, 56]].map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={x} y2={80} className="t-fin" />
      ))}
      {[150, 225, 300, 375, 450].map((x, i) => (
        <rect key={i} x={x - 4} y={(x <= 300 ? 92 - ((x - 60) / 240) * 62 : 30 + ((x - 300) / 240) * 62) - 8} width={8} height={6} fill="var(--color-terre-clair)" className="t-fin" />
      ))}
      <rect x={30} y={sol - 4} width={70} height={6} fill="var(--color-beton)" stroke="none" />
      <path d={`M14 ${sol} v12 h12 v-12`} fill="var(--color-papier)" className="t-moyen" />
      {(
        [
          [120, sol + 53, 1],
          [120, sol + 20, 2],
          [300, sol - 6, 3],
          [120, 150, 4],
          [480, 150, 5],
          [120, 84, 6],
          [250, 70, 7],
          [190, 45, 8],
          [74, 100, 9],
          [40, sol - 16, 10],
        ] as Array<[number, number, number]>
      ).map(([x, y, n]) => (
        <Numero key={n} x={x} y={y} n={n} couleur={ROUGE} />
      ))}
    </Figure>
  );
}

/** Descente de charges d'un poteau intérieur : charges par niveau, effort cumulé, semelle et pression sur le sol. */
export function DescenteSchema({ d, r, prefixe = 'ds' }: { d: DonneesDescente; r: ResultatDescente; prefixe?: string }) {
  const n = Math.max(1, Math.min(d.niveaux, 6));
  const hNiv = Math.min(70, 210 / n);
  const sol = 30 + n * hNiv + 10;
  const xc = 220;
  return (
    <Figure
      alt={`Poteau intérieur de ${n} niveau${n > 1 ? 'x' : ''} : surface d'influence ${n2(r.A)} m², effort en pied ${n2(r.Nser)} kN (service), ${n2(r.Nelu)} kN à l'ELU, semelle de ${n2(d.B)} m, pression ${n2(r.sigma)} kPa`}
      largeur={620}
      hauteur={sol + 90}
    >
      <Hachures prefixe={prefixe} types={['terre', 'ba']} />
      <rect x={10} y={sol} width={600} height={80} fill={hachure(prefixe, 'terre')} stroke="none" />
      <line x1={10} y1={sol} x2={610} y2={sol} className="t-fort" />
      {r.niveauxDetail.slice(0, n).map((niv, i) => {
        const y = 30 + i * hNiv;
        return (
          <g key={niv.niveau}>
            <rect x={xc - 130} y={y} width={260} height={8} fill={hachure(prefixe, 'ba')} className="t-moyen" />
            {[-100, -50, 0, 50, 100].map((dx) => (
              <Fleche key={dx} x1={xc + dx} y1={y - 18} x2={xc + dx} y2={y - 1} couleur={ROUGE} epaisseur={1.4} tete={6} />
            ))}
            <rect x={xc - 6} y={y + 8} width={12} height={hNiv - 8} fill={hachure(prefixe, 'ba')} className="t-moyen" />
            <Etiquette x={xc + 140} y={y + 6} taille={11}>
              niveau {niv.niveau} : G = {n2(niv.G)} kN, Q = {n2(niv.Q)} kN
            </Etiquette>
            <Etiquette x={xc - 14} y={y + 8 + (hNiv - 8) / 2 + 4} ancre="end" taille={11} gras couleur={VERT}>
              N = {n2(niv.N)} kN
            </Etiquette>
          </g>
        );
      })}
      <rect x={xc - 6} y={sol - 10} width={12} height={20} fill={hachure(prefixe, 'ba')} className="t-moyen" />
      <rect x={xc - 50} y={sol + 10} width={100} height={18} fill={hachure(prefixe, 'ba')} className="t-fort" />
      {[-40, -20, 0, 20, 40].map((dx) => (
        <Fleche key={dx} x1={xc + dx} y1={sol + 52} x2={xc + dx} y2={sol + 30} couleur={VERT} epaisseur={1.4} tete={6} />
      ))}
      <Cote x1={xc - 50} y1={sol + 28} x2={xc + 50} y2={sol + 28} decalage={-34} texte={`B = ${n2(d.B)} m`} />
      <Etiquette x={xc + 70} y={sol + 46} taille={11.5} gras couleur={VERT}>
        σ = N / B² = {n2(r.sigma)} kPa
      </Etiquette>
      <Etiquette x={xc - 136} y={22} ancre="end" taille={10.5} classe="etiquette">
        surface d’influence
      </Etiquette>
      <Etiquette x={xc - 136} y={36} ancre="end" taille={10.5} classe="etiquette">
        {n2(d.lx)} × {n2(d.ly)} = {n2(r.A)} m²
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.1.7 : normes et règlements ----------

/** Hiérarchie des textes : du plus contraignant au plus technique, et le marché qui fixe ceux qui s'appliquent. */
export function PyramideTextes() {
  const niveaux = [
    { t: 'lois, décrets, règlements', s: 'obligatoires pour tous', c: ROUGE },
    { t: 'normes : Eurocodes, NF, ISO', s: 'obligatoires si un texte ou le marché les impose', c: BLEU },
    { t: 'DTU, fascicules, règles professionnelles', s: 'règles de l’art, contractuelles par le marché', c: TERRE },
    { t: 'guides, avis techniques, notices', s: 'aident à bien faire, sur un produit ou un procédé', c: VERT },
  ];
  return (
    <Figure alt="Pyramide des textes : en haut les lois et règlements, puis les normes (Eurocodes), puis les DTU et règles professionnelles, à la base les guides et notices ; à droite, le marché qui précise les textes applicables au projet" largeur={620} hauteur={270}>
      {niveaux.map((nv, i) => {
        const y = 24 + i * 56;
        const dx = 16 + (3 - i) * 40;
        return (
          <g key={nv.t}>
            <polygon points={points([[dx, y + 50], [420 - dx, y + 50], [420 - dx - 23, y], [dx + 23, y]])} fill={nv.c} opacity={0.18} stroke={nv.c} strokeWidth={1.4} />
            <Etiquette x={210} y={y + 22} ancre="middle" taille={11.5} gras couleur={nv.c}>
              {nv.t}
            </Etiquette>
            <Etiquette x={210} y={y + 38} ancre="middle" taille={10}>
              {nv.s}
            </Etiquette>
          </g>
        );
      })}
      <rect x={444} y={70} width={164} height={110} rx={6} fill="var(--color-papier)" stroke={BRIQUE} strokeWidth={1.8} />
      <Etiquette x={526} y={94} ancre="middle" taille={11.5} gras couleur={BRIQUE}>
        le marché
      </Etiquette>
      <Etiquette x={526} y={114} ancre="middle" taille={10.5}>
        cahier des clauses
      </Etiquette>
      <Etiquette x={526} y={130} ancre="middle" taille={10.5}>
        techniques (CCTP) :
      </Etiquette>
      <Etiquette x={526} y={146} ancre="middle" taille={10.5}>
        il liste les textes
      </Etiquette>
      <Etiquette x={526} y={162} ancre="middle" taille={10.5}>
        applicables au projet
      </Etiquette>
      <Fleche x1={444} y1={125} x2={392} y2={125} couleur={BRIQUE} epaisseur={1.6} tete={8} pointilles />
    </Figure>
  );
}

// ---------- L1.1.8 : sols tropicaux ----------

/** Profil d'altération typique d'un sol latéritique (épaisseurs très variables d'un site à l'autre). */
export function ProfilLateritique({ prefixe = 'pl' }: { prefixe?: string }) {
  const couches = [
    { nom: 'sol humifère', note: 'à décaper : jamais de fondation dessus', h: 26, c: 'var(--color-terre)', motif: 'terre' as const },
    { nom: 'horizon latéritique (gravillons, cuirasse)', note: 'bon matériau de chaussée, après essais', h: 56, c: 'var(--color-brique)', motif: 'gravier' as const },
    { nom: 'argile tachetée', note: 'sensible à l’eau : retrait et gonflement', h: 56, c: 'var(--color-terre-clair)', motif: 'remblai' as const },
    { nom: 'argile d’altération (saprolite)', note: 'garde la trace de la roche, peu résistante', h: 56, c: 'var(--color-beton-clair)', motif: 'remblai' as const },
    { nom: 'roche altérée, puis roche saine', note: 'portance croissante avec la profondeur', h: 46, c: 'var(--color-beton)', motif: 'beton' as const },
  ];
  let y = 20;
  return (
    <Figure alt="Profil d'un sol latéritique, de haut en bas : sol humifère, horizon latéritique à gravillons ou cuirasse, argile tachetée, argile d'altération, roche altérée puis roche saine ; épaisseurs très variables" largeur={620} hauteur={280}>
      <Hachures prefixe={prefixe} types={['terre', 'gravier', 'remblai', 'beton']} />
      {couches.map((c) => {
        const y0 = y;
        y += c.h;
        return (
          <g key={c.nom}>
            <rect x={60} y={y0} width={140} height={c.h} fill={c.c} opacity={0.45} stroke="none" />
            <rect x={60} y={y0} width={140} height={c.h} fill={hachure(prefixe, c.motif)} className="t-fin" />
            <line x1={200} y1={y0 + c.h / 2} x2={232} y2={y0 + c.h / 2} className="t-fin" />
            <Etiquette x={238} y={y0 + c.h / 2 - 2} taille={11.5} gras>
              {c.nom}
            </Etiquette>
            <Etiquette x={238} y={y0 + c.h / 2 + 13} taille={10.5}>
              {c.note}
            </Etiquette>
          </g>
        );
      })}
      <Fleche x1={40} y1={22} x2={40} y2={y - 4} couleur="var(--trait)" epaisseur={1.2} tete={7} />
      <Etiquette x={28} y={130} ancre="middle" taille={10.5} rotation={-90}>
        profondeur
      </Etiquette>
      <Etiquette x={610} y={y + 18} ancre="end" taille={10.5} classe="etiquette">
        épaisseurs très variables : seuls des sondages les donnent
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.1.P : chantier virtuel ----------

/** Chantier en élévation, avec des points d'observation numérotés pour le rapport de visite. */
export function ChantierVirtuel({ prefixe = 'cv' }: { prefixe?: string }) {
  const sol = 240;
  return (
    <Figure alt="Chantier d'un bâtiment R+1 en cours de gros œuvre : panneau de chantier, clôture, poteaux et poutres du rez-de-chaussée, dalle étayée, échafaudage, attentes d'armatures, bétonnière, sacs de ciment, fouille en tranchée ; chaque point d'observation porte un numéro" largeur={620} hauteur={300}>
      <Hachures prefixe={prefixe} types={['terre', 'ba']} />
      <rect x={10} y={sol} width={600} height={56} fill={hachure(prefixe, 'terre')} stroke="none" />
      <line x1={10} y1={sol} x2={610} y2={sol} className="t-fort" />
      <rect x={24} y={120} width={70} height={46} fill="var(--color-papier)" className="t-fort" />
      {[132, 142, 152].map((y) => (
        <line key={y} x1={32} y1={y} x2={86} y2={y} className="t-fin" />
      ))}
      <line x1={40} y1={166} x2={40} y2={sol} className="t-moyen" />
      <line x1={78} y1={166} x2={78} y2={sol} className="t-moyen" />
      {[110, 140, 170, 560, 590].map((x) => (
        <line key={x} x1={x} y1={sol} x2={x} y2={sol - 36} className="t-fin" />
      ))}
      <line x1={110} y1={sol - 30} x2={170} y2={sol - 30} className="t-fin" />
      <line x1={560} y1={sol - 30} x2={600} y2={sol - 30} className="t-fin" />
      {[230, 330, 430].map((x) => (
        <rect key={x} x={x - 7} y={150} width={14} height={sol - 150} fill={hachure(prefixe, 'ba')} className="t-moyen" />
      ))}
      <rect x={222} y={138} width={216} height={14} fill={hachure(prefixe, 'ba')} className="t-moyen" />
      {[260, 290, 360, 390].map((x) => (
        <line key={x} x1={x} y1={152} x2={x} y2={sol} className="t-fin" strokeDasharray="4 3" />
      ))}
      {[230, 330, 430].map((x) => (
        <line key={x} x1={x} y1={138} x2={x} y2={112} stroke={ROUGE} strokeWidth={1.4} />
      ))}
      <line x1={448} y1={sol} x2={448} y2={100} className="t-moyen" />
      <line x1={482} y1={sol} x2={482} y2={100} className="t-moyen" />
      {[200, 160, 120].map((y) => (
        <line key={y} x1={448} y1={y} x2={482} y2={y} className="t-moyen" />
      ))}
      <circle cx={520} cy={222} r={14} fill="none" className="t-fort" />
      <line x1={508} y1={236} x2={500} y2={sol} className="t-moyen" />
      <line x1={532} y1={236} x2={540} y2={sol} className="t-moyen" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={180 + i * 8 - (i === 2 ? 4 : 0)} y={sol - 10 - (i === 2 ? 10 : 0)} width={16} height={10} fill="var(--color-beton-clair)" className="t-fin" />
      ))}
      <rect x={300} y={sol} width={50} height={36} fill="var(--color-papier)" className="t-moyen" />
      {(
        [
          [59, 108, 1],
          [140, 196, 2],
          [330, 128, 3],
          [345, 196, 4],
          [230, 100, 5],
          [465, 90, 6],
          [520, 196, 7],
          [190, 214, 8],
          [325, 286, 9],
        ] as Array<[number, number, number]>
      ).map(([x, y, n]) => (
        <Numero key={n} x={x} y={y} n={n} couleur={ROUGE} />
      ))}
    </Figure>
  );
}
