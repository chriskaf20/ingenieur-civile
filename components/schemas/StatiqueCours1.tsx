// Schémas de compréhension du module L1.3, leçons 1 à 4 : intuitions, cours, erreurs, terrain et exercices.
// Code couleur du module : actions en rouge, réactions en vert, géométrie en noir, bras de levier et traction en bleu.
// Les valeurs numériques arrivent par les props, calculées dans lib/calc ; les autres figures sont sans valeur.
import { Cote } from '@/components/drawing/Cote';
import { ArcMoment, Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { AppuiDouble, AppuiSimple, ChargeRepartie, Encastrement } from '@/components/drawing/Mecanique';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';
const TERRE = 'var(--color-terre)';
const TRAIT = 'var(--trait)';
const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);

/** Petit personnage (charge d'exploitation), pieds en (x, y). */
function Personne({ x, y, couleur = BRIQUE }: { x: number; y: number; couleur?: string }) {
  return (
    <g stroke={couleur} strokeWidth={2} fill="none" strokeLinecap="round">
      <circle cx={x} cy={y - 42} r={6} fill="var(--color-brique-clair)" />
      <line x1={x} y1={y - 36} x2={x} y2={y - 16} />
      <line x1={x} y1={y - 16} x2={x - 7} y2={y} />
      <line x1={x} y1={y - 16} x2={x + 7} y2={y} />
      <line x1={x} y1={y - 30} x2={x - 9} y2={y - 20} />
      <line x1={x} y1={y - 30} x2={x + 9} y2={y - 20} />
    </g>
  );
}

/** Sac (ciment, sable), coin haut gauche en (x, y). */
function Sac({ x, y, l = 46, h = 34, texte }: { x: number; y: number; l?: number; h?: number; texte?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={l} height={h} rx={9} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
      {texte ? (
        <text x={x + l / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize={10} fill="var(--trait)">
          {texte}
        </text>
      ) : null}
    </g>
  );
}

/** Cercle numéroté (repère d'une légende). */
function Pastille({ x, y, n, couleur = BLEU }: { x: number; y: number; n: number; couleur?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill="var(--color-papier)" stroke={couleur} strokeWidth={1.6} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={couleur}>
        {n}
      </text>
    </g>
  );
}

// ---------- L1.3.1 : actions mécaniques ----------

/** Du chantier au dessin : un sac devient une force ponctuelle, un mur une charge linéique, une dalle une charge surfacique. */
export function DuReelAuModele() {
  const fl = (y: number, texte?: string) => (
    <g>
      <Fleche x1={286} y1={y} x2={352} y2={y} couleur={TRAIT} epaisseur={2} tete={9} />
      {texte ? (
        <Etiquette x={319} y={y - 9} ancre="middle" taille={11} gras>
          {texte}
        </Etiquette>
      ) : null}
    </g>
  );
  const poutreModele = (y: number) => (
    <g>
      <line x1={392} y1={y} x2={568} y2={y} stroke={TRAIT} strokeWidth={5} />
      <AppuiDouble x={400} y={y + 3} t={9} prefixe="drm" />
      <AppuiSimple x={560} y={y + 3} t={9} />
    </g>
  );
  return (
    <Figure alt="Du réel au modèle : un sac de ciment posé devient une force ponctuelle en kN ; un mur posé sur une poutre devient une charge linéique en kN/m ; une dalle et ce qu'elle porte deviennent une charge surfacique en kN/m²." largeur={620} hauteur={396}>
      <Hachures prefixe="drm" types={['maconnerie', 'terre']} />
      <Etiquette x={150} y={20} ancre="middle" taille={13} gras>
        le réel
      </Etiquette>
      <Etiquette x={480} y={20} ancre="middle" taille={13} gras>
        le modèle
      </Etiquette>
      {/* ligne 1 : sac sur une poutre */}
      <rect x={40} y={92} width={220} height={12} fill="var(--color-beton-clair)" className="t-moyen" />
      <rect x={48} y={104} width={16} height={26} fill={hachure('drm', 'maconnerie')} className="t-fin" />
      <rect x={236} y={104} width={16} height={26} fill={hachure('drm', 'maconnerie')} className="t-fin" />
      <Sac x={128} y={58} l={48} h={34} texte="ciment" />
      <Etiquette x={150} y={148} ancre="middle" taille={11.5}>
        un sac de ciment posé
      </Etiquette>
      {fl(80, 'modéliser')}
      {poutreModele(98)}
      <Fleche x1={480} y1={44} x2={480} y2={94} couleur={ROUGE} epaisseur={2.8} tete={10} />
      <Etiquette x={488} y={56} taille={12.5} gras couleur={ROUGE}>
        P (kN)
      </Etiquette>
      <Etiquette x={480} y={148} ancre="middle" taille={11.5}>
        force ponctuelle
      </Etiquette>
      {/* ligne 2 : mur sur une poutre */}
      <rect x={60} y={172} width={180} height={44} fill={hachure('drm', 'maconnerie')} className="t-moyen" />
      <rect x={40} y={216} width={220} height={12} fill="var(--color-beton-clair)" className="t-moyen" />
      <rect x={48} y={228} width={16} height={22} fill={hachure('drm', 'maconnerie')} className="t-fin" />
      <rect x={236} y={228} width={16} height={22} fill={hachure('drm', 'maconnerie')} className="t-fin" />
      <Etiquette x={150} y={268} ancre="middle" taille={11.5}>
        un mur posé sur une poutre
      </Etiquette>
      {fl(200)}
      {poutreModele(222)}
      <ChargeRepartie x1={410} x2={550} y={218} hauteur={26} />
      <Etiquette x={480} y={186} ancre="middle" taille={12.5} gras couleur={ROUGE}>
        q (kN/m)
      </Etiquette>
      <Etiquette x={480} y={268} ancre="middle" taille={11.5}>
        charge linéique
      </Etiquette>
      {/* ligne 3 : dalle et occupants */}
      <g transform="translate(0 30)">
      <polygon points={points([[40, 330], [220, 330], [260, 300], [80, 300]])} fill="var(--color-beton-clair)" className="t-moyen" />
      <polygon points={points([[40, 330], [220, 330], [220, 338], [40, 338]])} fill="var(--fond-beton)" className="t-fin" />
      <Personne x={112} y={318} />
      <Personne x={148} y={312} />
      <rect x={180} y={300} width={26} height={16} fill="var(--color-brique-clair)" stroke={BRIQUE} strokeWidth={1.4} />
      <Etiquette x={150} y={358} ancre="middle" taille={11.5}>
        une dalle et ce qu’elle porte
      </Etiquette>
      {fl(316)}
      <polygon points={points([[380, 330], [560, 330], [600, 300], [420, 300]])} fill="var(--color-beton-clair)" className="t-moyen" />
      {[0, 1].flatMap((j) =>
        [0, 1, 2, 3].map((i) => {
          const x = 408 + i * 44 + j * 22;
          const y = 324 - j * 16;
          return <Fleche key={`${i}-${j}`} x1={x} y1={y - 30} x2={x} y2={y - 2} couleur={ROUGE} epaisseur={1.4} tete={6} />;
        }),
      )}
      <Etiquette x={490} y={270} ancre="middle" taille={12.5} gras couleur={ROUGE}>
        g, q (kN/m²)
      </Etiquette>
      <Etiquette x={490} y={358} ancre="middle" taille={11.5}>
        charge surfacique
      </Etiquette>
      </g>
    </Figure>
  );
}

/** Les quatre caractéristiques d'une force, et les deux familles d'actions (à distance, de contact). */
export function AnatomieForce() {
  const A = [170, 142] as const;
  const a = (35 * Math.PI) / 180;
  const u = [Math.cos(a), -Math.sin(a)] as const;
  const P = (t: number) => [A[0] + t * u[0], A[1] + t * u[1]] as const;
  const bout = P(112);
  return (
    <Figure alt="À gauche, une force F tirée par un câble : 1 son point d'application A, 2 sa ligne d'action, 3 son sens, 4 son intensité en kN. À droite, un bloc posé au sol : son poids P est une action à distance ; la réaction R du sol et la traction T d'un câble sont des actions de contact." largeur={620} hauteur={276}>
      <Hachures prefixe="anf" types={['terre']} />
      <Etiquette x={20} y={22} taille={13} gras>
        une force : quatre caractéristiques
      </Etiquette>
      <rect x={50} y={118} width={120} height={70} rx={6} fill="var(--color-beton-clair)" className="t-moyen" />
      <line x1={P(-80)[0]} y1={P(-80)[1]} x2={P(185)[0]} y2={P(185)[1]} className="t-fin" strokeDasharray="10 4 2 4" />
      <Fleche x1={A[0]} y1={A[1]} x2={bout[0]} y2={bout[1]} couleur={ROUGE} epaisseur={3.2} tete={12} />
      <circle cx={A[0]} cy={A[1]} r={5} fill={ROUGE} />
      <Pastille x={150} y={164} n={1} />
      <Etiquette x={164} y={168} taille={11.5}>
        point d’application A
      </Etiquette>
      <Pastille x={238} y={36} n={2} />
      <Etiquette x={252} y={40} taille={11.5}>
        ligne d’action
      </Etiquette>
      <Pastille x={bout[0] + 18} y={bout[1] + 8} n={3} />
      <Etiquette x={bout[0] + 32} y={bout[1] + 12} taille={11.5}>
        sens
      </Etiquette>
      <Pastille x={P(56)[0] + 16} y={P(56)[1] + 18} n={4} />
      <Etiquette x={P(56)[0] + 30} y={P(56)[1] + 22} taille={11.5}>
        intensité F (kN)
      </Etiquette>
      <Etiquette x={20} y={226} taille={11} classe="etiquette">
        1 kN = 1 000 N
      </Etiquette>
      <line x1={340} y1={30} x2={340} y2={262} className="t-fin" strokeDasharray="3 4" />
      <Etiquette x={360} y={22} taille={13} gras>
        deux familles d’actions
      </Etiquette>
      <rect x={370} y={198} width={238} height={12} fill={hachure('anf', 'terre')} stroke="none" />
      <line x1={370} y1={198} x2={608} y2={198} className="t-moyen" />
      <rect x={430} y={122} width={90} height={76} fill="var(--color-beton-clair)" className="t-moyen" />
      <circle cx={475} cy={160} r={3.5} fill={TRAIT} />
      <Fleche x1={475} y1={160} x2={475} y2={238} couleur={ROUGE} epaisseur={3} tete={11} />
      <Etiquette x={466} y={232} ancre="end" taille={12} gras couleur={ROUGE}>
        P
      </Etiquette>
      <Fleche x1={492} y1={262} x2={492} y2={202} couleur={VERT} epaisseur={3} tete={11} />
      <Etiquette x={500} y={256} taille={12} gras couleur={VERT}>
        R
      </Etiquette>
      <line x1={520} y1={132} x2={600} y2={92} className="t-moyen" />
      <Fleche x1={522} y1={131} x2={578} y2={103} couleur={ROUGE} epaisseur={3} tete={11} />
      <Etiquette x={566} y={124} taille={12} gras couleur={ROUGE}>
        T
      </Etiquette>
      <Etiquette x={360} y={64} taille={11.5} gras couleur={ROUGE}>
        P : à distance (la pesanteur)
      </Etiquette>
      <Etiquette x={360} y={84} taille={11.5} gras couleur={VERT}>
        R, T : de contact (sol, câble)
      </Etiquette>
    </Figure>
  );
}

/** Chaîne des répartitions : volumique → surfacique → linéique → ponctuelle, en multipliant par une dimension. */
export function QuatreRepartitions() {
  const w = 110;
  const g = 44;
  const x0 = 24;
  const y0 = 28;
  const h = 152;
  const cases = [
    { titre: 'volumique', unite: 'kN/m³', ex: 'un matériau' },
    { titre: 'surfacique', unite: 'kN/m²', ex: 'une dalle' },
    { titre: 'linéique', unite: 'kN/m', ex: 'une poutre' },
    { titre: 'ponctuelle', unite: 'kN', ex: 'un poteau, un appui' },
  ];
  const facteurs = ['× épaisseur', '× largeur e', '× longueur'];
  const dessin = (i: number, bx: number) => {
    const c = bx + w / 2;
    if (i === 0)
      return (
        <g>
          <polygon points={points([[c - 22, 90], [c + 12, 90], [c + 12, 124], [c - 22, 124]])} fill="var(--color-beton-clair)" className="t-moyen" />
          <polygon points={points([[c - 22, 90], [c - 8, 76], [c + 26, 76], [c + 12, 90]])} fill="var(--color-papier)" className="t-moyen" />
          <polygon points={points([[c + 12, 90], [c + 26, 76], [c + 26, 110], [c + 12, 124]])} fill="var(--fond-beton)" className="t-moyen" />
          <text x={c - 5} y={112} textAnchor="middle" fontSize={15} fontWeight={700} fill={ROUGE}>
            γ
          </text>
        </g>
      );
    if (i === 1)
      return (
        <g>
          <polygon points={points([[bx + 12, 124], [bx + 84, 124], [bx + 100, 108], [bx + 28, 108]])} fill="var(--color-beton-clair)" className="t-moyen" />
          {[0, 1, 2, 3].map((k) => (
            <Fleche key={k} x1={bx + 30 + k * 18} y1={78} x2={bx + 30 + k * 18} y2={114} couleur={ROUGE} epaisseur={1.3} tete={6} />
          ))}
        </g>
      );
    if (i === 2)
      return (
        <g>
          <line x1={bx + 12} y1={120} x2={bx + w - 12} y2={120} stroke={TRAIT} strokeWidth={5} />
          <ChargeRepartie x1={bx + 16} x2={bx + w - 16} y={116} hauteur={30} n={5} />
        </g>
      );
    return (
      <g>
        <line x1={bx + 12} y1={120} x2={bx + w - 12} y2={120} stroke={TRAIT} strokeWidth={5} />
        <Fleche x1={c} y1={70} x2={c} y2={116} couleur={ROUGE} epaisseur={3} tete={11} />
      </g>
    );
  };
  return (
    <Figure alt="Quatre répartitions d'une charge : volumique en kN/m³ (un matériau), surfacique en kN/m² (une dalle), linéique en kN/m (une poutre), ponctuelle en kN ; on passe de l'une à la suivante en multipliant par l'épaisseur, par la largeur d'influence, puis par la longueur." largeur={620} hauteur={206}>
      {cases.map((k, i) => {
        const bx = x0 + i * (w + g);
        return (
          <g key={k.titre}>
            <rect x={bx} y={y0} width={w} height={h} rx={8} fill="var(--color-papier)" className="t-moyen" />
            <Etiquette x={bx + w / 2} y={y0 + 20} ancre="middle" taille={12.5} gras>
              {k.titre}
            </Etiquette>
            {dessin(i, bx)}
            <Etiquette x={bx + w / 2} y={y0 + 124} ancre="middle" taille={14} gras couleur={ROUGE}>
              {k.unite}
            </Etiquette>
            <Etiquette x={bx + w / 2} y={y0 + 142} ancre="middle" taille={10.5} classe="etiquette">
              {k.ex}
            </Etiquette>
          </g>
        );
      })}
      {facteurs.map((f, i) => {
        const xa = x0 + (i + 1) * w + i * g;
        return (
          <g key={f}>
            <Fleche x1={xa + 4} y1={104} x2={xa + g - 4} y2={104} couleur={BLEU} epaisseur={2} tete={8} />
            <Etiquette x={xa + g / 2} y={88} ancre="middle" taille={10.5} gras couleur={BLEU}>
              {f.split(' ')[0]}
            </Etiquette>
            <Etiquette x={xa + g / 2} y={128} ancre="middle" taille={10} couleur={BLEU}>
              {f.split(' ').slice(1).join(' ')}
            </Etiquette>
          </g>
        );
      })}
      <Etiquette x={24} y={200} taille={10.5} classe="etiquette">
        chaque flèche multiplie par une longueur en mètres : l’unité perd un « /m »
      </Etiquette>
    </Figure>
  );
}

/** Plan d'un plancher à poutres parallèles : chaque poutre reçoit la moitié des travées voisines (largeur d'influence). */
export function DemiTravees() {
  const xa = 80;
  const xb = 420;
  const ys = [36, 94, 152, 210];
  const mi = ys.slice(1).map((y, i) => (y + ys[i]!) / 2);
  return (
    <Figure alt="Plan d'un plancher à quatre poutres parallèles d'entraxe e : la dalle porte d'une poutre à l'autre ; chaque poutre intérieure reçoit la moitié de chaque travée voisine, soit une bande de largeur e ; une poutre de rive ne reçoit qu'une demi-travée, e/2." largeur={620} hauteur={246}>
      <rect x={xa} y={mi[0]!} width={xb - xa} height={mi[1]! - mi[0]!} fill={BLEU} fillOpacity={0.14} />
      <rect x={xa} y={ys[0]!} width={xb - xa} height={mi[0]! - ys[0]!} fill={VERT} fillOpacity={0.16} />
      {mi.map((y) => (
        <line key={y} x1={xa} y1={y} x2={xb} y2={y} className="t-fin" strokeDasharray="7 4" />
      ))}
      {ys.map((y, i) => (
        <g key={y}>
          <line x1={xa} y1={y} x2={xb} y2={y} stroke={TRAIT} strokeWidth={i === 1 ? 6 : 3.5} />
          {[xa, xb].map((x) => (
            <rect key={x} x={x - 6} y={y - 6} width={12} height={12} fill={TRAIT} />
          ))}
          <Etiquette x={xa - 12} y={y + 4} ancre="end" taille={11.5} gras={i === 1}>
            {i === 0 || i === 3 ? `poutre ${i + 1} (rive)` : `poutre ${i + 1}`}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={(xa + xb) / 2} y={ys[1]! - 8} ancre="middle" taille={12} gras couleur={BLEU}>
        bande reçue par la poutre 2
      </Etiquette>
      <Etiquette x={(xa + xb) / 2} y={ys[0]! + 17} ancre="middle" taille={11} couleur={VERT}>
        bande de la poutre de rive
      </Etiquette>
      <Cote x1={xb + 18} y1={ys[2]!} x2={xb + 18} y2={ys[1]!} decalage={0} texte="e" />
      <Cote x1={xb + 46} y1={ys[1]!} x2={xb + 46} y2={mi[0]!} decalage={0} texte="e/2" />
      <Cote x1={xb + 46} y1={mi[1]!} x2={xb + 46} y2={ys[1]!} decalage={0} texte="e/2" />
      <Etiquette x={492} y={88} taille={12} gras couleur={BLEU}>
        poutre 2 :
      </Etiquette>
      <Etiquette x={492} y={106} taille={12} gras couleur={BLEU}>
        e/2 + e/2 = e
      </Etiquette>
      <Etiquette x={492} y={40} taille={11.5} couleur={VERT}>
        rive : e/2
      </Etiquette>
      <Etiquette x={492} y={150} taille={11} classe="etiquette">
        e = entraxe
      </Etiquette>
      <Etiquette x={492} y={166} taille={11} classe="etiquette">
        des poutres
      </Etiquette>
      <Cote x1={xa} y1={ys[3]! + 22} x2={xb} y2={ys[3]! + 22} decalage={0} texte="portée L de chaque poutre" />
    </Figure>
  );
}

/** Coupe d'un plancher : charges permanentes G (dalle, chape, carrelage, cloison) et d'exploitation Q (personnes, mobilier). */
export function ChargesGQ() {
  const etiquette = (x: number, y: number, t: 'G' | 'Q') => (
    <g>
      <circle cx={x} cy={y} r={10} fill="var(--color-papier)" stroke={t === 'G' ? ROUGE : BRIQUE} strokeWidth={1.8} />
      <text x={x} y={y + 4.5} textAnchor="middle" fontSize={12} fontWeight={700} fill={t === 'G' ? ROUGE : BRIQUE}>
        {t}
      </text>
    </g>
  );
  return (
    <Figure alt="Coupe d'un plancher : les charges permanentes G sont la dalle, la chape, le carrelage et les cloisons ; les charges d'exploitation Q sont les personnes, le mobilier et le stockage. Pour la résistance (ELU), on combine 1,35 G + 1,5 Q ; en service, G + Q." largeur={620} hauteur={244}>
      <Hachures prefixe="cgq" types={['ba', 'maconnerie']} />
      <rect x={60} y={112} width={500} height={34} fill={hachure('cgq', 'ba')} className="t-fort" />
      <rect x={60} y={100} width={500} height={12} fill="var(--color-beton-clair)" className="t-fin" />
      <rect x={60} y={96} width={500} height={4} fill={TERRE} />
      <rect x={110} y={30} width={16} height={66} fill={hachure('cgq', 'maconnerie')} className="t-moyen" />
      <Personne x={300} y={96} />
      <Personne x={340} y={96} />
      <rect x={430} y={48} width={50} height={48} fill="var(--color-brique-clair)" stroke={BRIQUE} strokeWidth={1.6} />
      <line x1={455} y1={52} x2={455} y2={92} stroke={BRIQUE} strokeWidth={1} />
      {etiquette(92, 50, 'G')}
      {etiquette(40, 106, 'G')}
      {etiquette(40, 130, 'G')}
      {etiquette(372, 40, 'Q')}
      {etiquette(500, 40, 'Q')}
      <Etiquette x={140} y={60} taille={11} classe="etiquette">
        cloison
      </Etiquette>
      <Etiquette x={600} y={88} ancre="end" taille={11} classe="etiquette">
        chape et carrelage
      </Etiquette>
      <Etiquette x={310} y={135} ancre="middle" taille={11.5} gras>
        dalle en béton armé (poids propre)
      </Etiquette>
      <rect x={20} y={160} width={280} height={44} rx={6} fill="var(--color-correction-clair)" stroke={ROUGE} strokeWidth={1.2} />
      <Etiquette x={32} y={178} taille={12} gras couleur={ROUGE}>
        G : permanentes, toujours là
      </Etiquette>
      <Etiquette x={32} y={196} taille={11}>
        structure, revêtements, cloisons
      </Etiquette>
      <rect x={320} y={160} width={280} height={44} rx={6} fill="var(--color-brique-clair)" stroke={BRIQUE} strokeWidth={1.2} />
      <Etiquette x={332} y={178} taille={12} gras couleur={BRIQUE}>
        Q : d’exploitation, variables
      </Etiquette>
      <Etiquette x={332} y={196} taille={11}>
        personnes, mobilier, stockage
      </Etiquette>
      <Etiquette x={310} y={230} ancre="middle" taille={12} gras>
        résistance (ELU) : 1,35 G + 1,5 Q (EC0, 6.10) · service : G + Q
      </Etiquette>
    </Figure>
  );
}

/** Masse et poids d'un sac : la masse en kg, le poids (une force) en N ou en kN. */
export function MassePoids({ masse, poids }: { masse: number; poids: number }) {
  return (
    <Figure alt={`Un sac de ${nombre(masse, 0)} kg : sa masse est ${nombre(masse, 0)} kg ; son poids, une force, vaut P = m g = ${n1(poids)} N, soit environ ${n2(poids / 1000)} kN, et non ${nombre(masse, 0)} kN.`} largeur={620} hauteur={176}>
      <rect x={262} y={28} width={96} height={64} rx={14} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.6} />
      <text x={310} y={54} textAnchor="middle" fontSize={11} fill="var(--trait)">
        ciment
      </text>
      <text x={310} y={76} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--trait)">
        m = {nombre(masse, 0)} kg
      </text>
      <Etiquette x={248} y={52} ancre="end" taille={12} gras>
        masse, en kg :
      </Etiquette>
      <Etiquette x={248} y={70} ancre="end" taille={11.5}>
        la quantité de matière
      </Etiquette>
      <Fleche x1={310} y1={94} x2={310} y2={160} couleur={ROUGE} epaisseur={3.4} tete={12} />
      <Etiquette x={322} y={124} taille={12.5} gras couleur={ROUGE}>
        poids, une force : P = m g = {n1(poids)} N
      </Etiquette>
      <Etiquette x={322} y={144} taille={12.5} gras couleur={ROUGE}>
        soit ≈ {n2(poids / 1000)} kN
      </Etiquette>
      <text x={470} y={60} fontSize={14} fontWeight={700} fill={ROUGE} style={{ textDecoration: 'line-through' }}>
        {nombre(masse, 0)} kN
      </text>
      <Etiquette x={470} y={80} taille={11} couleur={ROUGE}>
        ✗ confusion masse-poids
      </Etiquette>
    </Figure>
  );
}

/** Largeur d'influence et portée : la première donne des kN/m, la seconde la charge totale en kN. */
export function LargeurOuPortee() {
  const xa = 90;
  const xb = 430;
  return (
    <Figure alt="Plan d'une poutre et de sa bande de plancher : la largeur d'influence e, perpendiculaire à la poutre, transforme des kN/m² en kN/m ; la portée L, le long de la poutre, transforme ensuite des kN/m en kN." largeur={620} hauteur={196}>
      <rect x={xa} y={50} width={xb - xa} height={84} fill={BLEU} fillOpacity={0.13} />
      <line x1={xa} y1={92} x2={xb} y2={92} stroke={TRAIT} strokeWidth={6} />
      {[xa, xb].map((x) => (
        <rect key={x} x={x - 7} y={85} width={14} height={14} fill={TRAIT} />
      ))}
      <Etiquette x={(xa + xb) / 2} y={84} ancre="middle" taille={12} gras>
        poutre
      </Etiquette>
      <Cote x1={xb + 20} y1={134} x2={xb + 20} y2={50} decalage={0} texte="e" />
      <Cote x1={xa} y1={160} x2={xb} y2={160} decalage={0} texte="L, la portée" />
      <Etiquette x={xb + 40} y={74} taille={11.5} gras couleur={BLEU}>
        g (kN/m²) × e (m)
      </Etiquette>
      <Etiquette x={xb + 40} y={92} taille={11.5} gras couleur={BLEU}>
        = G (kN/m)
      </Etiquette>
      <Etiquette x={xb + 40} y={126} taille={11.5} gras>
        G (kN/m) × L (m)
      </Etiquette>
      <Etiquette x={xb + 40} y={144} taille={11.5} gras>
        = charge totale (kN)
      </Etiquette>
      <Etiquette x={xa} y={188} taille={11} classe="etiquette">
        e se mesure perpendiculairement à la poutre, L le long de la poutre
      </Etiquette>
    </Figure>
  );
}

/** Chemin de la charge d'une citerne posée sur une toiture-terrasse : dalle, poutres, poteaux, semelles, sol. */
export function CheminCiterne({ poidsM3 }: { poidsM3: number }) {
  const cols = [145, 425];
  return (
    <Figure alt={`Coupe d'une maison avec une citerne sur la dalle de toiture : le poids de l'eau, environ ${n2(poidsM3)} kN par mètre cube, descend dans la dalle, puis dans les poteaux, puis dans les semelles, et enfin dans le sol.`} largeur={620} hauteur={292}>
      <Hachures prefixe="cci" types={['ba', 'terre', 'eau']} />
      <rect x={30} y={256} width={560} height={16} fill={hachure('cci', 'terre')} stroke="none" />
      <line x1={30} y1={256} x2={590} y2={256} className="t-moyen" />
      {cols.map((x) => (
        <g key={x}>
          <rect x={x - 28} y={236} width={56} height={20} fill={hachure('cci', 'ba')} className="t-moyen" />
          <rect x={x - 8} y={114} width={16} height={122} fill="var(--color-beton-clair)" className="t-moyen" />
          <Fleche x1={x - 20} y1={124} x2={x - 20} y2={226} couleur={ROUGE} epaisseur={2} tete={8} />
          {[-16, 0, 16].map((dx) => (
            <Fleche key={dx} x1={x + dx} y1={286} x2={x + dx} y2={260} couleur={VERT} epaisseur={1.6} tete={6} />
          ))}
        </g>
      ))}
      <rect x={110} y={100} width={350} height={14} fill={hachure('cci', 'ba')} className="t-moyen" />
      <rect x={230} y={40} width={100} height={60} rx={6} fill={hachure('cci', 'eau')} className="t-moyen" />
      <Fleche x1={280} y1={52} x2={280} y2={98} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Fleche x1={266} y1={107} x2={165} y2={107} couleur={ROUGE} epaisseur={2} tete={8} />
      <Fleche x1={294} y1={107} x2={405} y2={107} couleur={ROUGE} epaisseur={2} tete={8} />
      <Etiquette x={340} y={58} taille={12} gras couleur={BLEU}>
        citerne : 1 m³ d’eau ≈ {n2(poidsM3)} kN
      </Etiquette>
      <Etiquette x={470} y={112} taille={11.5}>
        dalle
      </Etiquette>
      <Etiquette x={cols[1]! + 14} y={180} taille={11.5}>
        poteau
      </Etiquette>
      <Etiquette x={cols[1]! + 34} y={250} taille={11.5}>
        semelle
      </Etiquette>
      <Etiquette x={530} y={282} taille={11.5}>
        sol
      </Etiquette>
      <Etiquette x={20} y={24} taille={11.5} gras couleur={ROUGE}>
        la charge descend jusqu’au sol : chaque élément doit la porter
      </Etiquette>
    </Figure>
  );
}

/** Une palette de sacs posée sur une dalle : une forte charge concentrée sur environ un mètre carré. */
export function PaletteSurDalle({ nSacs, poidsSac, poidsPalette }: { nSacs: number; poidsSac: number; poidsPalette: number }) {
  return (
    <Figure alt={`Une palette de ${nombre(nSacs, 0)} sacs de ciment posée sur une dalle : ${nombre(nSacs, 0)} × ${n2(poidsSac)} kN = ${n1(poidsPalette)} kN concentrés sur environ un mètre carré.`} largeur={620} hauteur={190}>
      <Hachures prefixe="pal" types={['ba']} />
      <rect x={40} y={136} width={540} height={26} fill={hachure('pal', 'ba')} className="t-fort" />
      <rect x={232} y={126} width={112} height={10} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.2} />
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 3 }, (_, c) => <Sac key={`${r}-${c}`} x={236 + c * 36} y={104 - r * 22} l={34} h={22} />),
      )}
      <Fleche x1={288} y1={10} x2={288} y2={34} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={300} y={24} taille={12.5} gras couleur={ROUGE}>
        {nombre(nSacs, 0)} sacs × {n2(poidsSac)} kN ≈ {n1(poidsPalette)} kN
      </Etiquette>
      <Cote x1={232} y1={176} x2={344} y2={176} decalage={0} texte="à peine plus d’un mètre" />
      <Etiquette x={44} y={128} taille={11.5}>
        dalle d’habitation
      </Etiquette>
      <Etiquette x={360} y={96} taille={11.5} gras>
        on vérifie la dalle, on répartit
      </Etiquette>
      <Etiquette x={360} y={114} taille={11.5} gras>
        le stock, ou l’on étaie
      </Etiquette>
    </Figure>
  );
}

/** Corrigé de l'exercice 3 : la colonne d'eau d'une citerne et un mur en blocs, en charge par mètre carré. */
export function CiterneEtMur({ hEau, gEau, qCiterne, eMur, gMur, qMur }: { hEau: number; gEau: number; qCiterne: number; eMur: number; gMur: number; qMur: number }) {
  return (
    <Figure alt={`À gauche, une colonne d'eau de ${n1(hEau)} m : ${nombre(gEau, 0)} × ${n1(hEau)} = ${n1(qCiterne)} kN/m² sur la dalle. À droite, un mur en blocs de ${n2(eMur)} m : ${nombre(gMur, 0)} × ${n2(eMur)} = ${n1(qMur)} kN par m² de mur.`} largeur={620} hauteur={214}>
      <Hachures prefixe="cem" types={['eau', 'maconnerie', 'ba']} />
      <rect x={60} y={46} width={150} height={120} fill={hachure('cem', 'eau')} className="t-moyen" />
      <rect x={40} y={166} width={190} height={16} fill={hachure('cem', 'ba')} className="t-moyen" />
      <Cote x1={40} y1={166} x2={40} y2={46} decalage={0} texte={`${n1(hEau)} m`} />
      {[90, 135, 180].map((x) => (
        <Fleche key={x} x1={x} y1={150} x2={x} y2={186} couleur={ROUGE} epaisseur={2} tete={7} />
      ))}
      <Etiquette x={135} y={204} ancre="middle" taille={12} gras couleur={ROUGE}>
        {nombre(gEau, 0)} × {n1(hEau)} = {n1(qCiterne)} kN/m²
      </Etiquette>
      <Etiquette x={135} y={32} ancre="middle" taille={12} gras>
        citerne : colonne d’eau
      </Etiquette>
      <rect x={410} y={40} width={44} height={126} fill={hachure('cem', 'maconnerie')} className="t-moyen" />
      <rect x={380} y={166} width={104} height={16} fill={hachure('cem', 'ba')} className="t-moyen" />
      <Cote x1={410} y1={36} x2={454} y2={36} decalage={0} texte={`${n2(eMur)} m`} />
      <Etiquette x={432} y={204} ancre="middle" taille={12} gras couleur={ROUGE}>
        {nombre(gMur, 0)} × {n2(eMur)} = {n1(qMur)} kN par m² de mur
      </Etiquette>
      <Etiquette x={468} y={100} taille={11.5}>
        × hauteur du mur
      </Etiquette>
      <Etiquette x={468} y={118} taille={11.5}>
        → kN/m sur la poutre
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.2 : moment et couple ----------

/** La clé et la porte : la même force fait plus d'effet loin du point de rotation. */
export function CleEtPorte() {
  const cle = (y: number, l: number) => (
    <g>
      <polygon points={points(Array.from({ length: 6 }, (_, i) => [60 + 15 * Math.cos((i * Math.PI) / 3), y + 15 * Math.sin((i * Math.PI) / 3)] as const))} fill="var(--color-beton-clair)" className="t-moyen" />
      <rect x={72} y={y - 6} width={l} height={12} rx={5} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.4} />
      <Fleche x1={72 + l - 8} y1={y - 44} x2={72 + l - 8} y2={y - 8} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Etiquette x={72 + l} y={y - 36} taille={12} gras couleur={ROUGE}>
        F
      </Etiquette>
      <Cote x1={60} y1={y + 18} x2={72 + l - 8} y2={y + 18} decalage={0} texte={l > 120 ? 'bras long' : 'bras court'} />
    </g>
  );
  return (
    <Figure alt="À gauche, deux clés sur un écrou avec la même force F : avec un bras long, l'effet de rotation est bien plus grand. À droite, une porte vue de dessus : poussée près des gonds, elle résiste ; poussée près de la poignée, loin des gonds, elle s'ouvre facilement." largeur={620} hauteur={212}>
      <Hachures prefixe="clp" types={['maconnerie']} />
      {cle(72, 90)}
      {cle(162, 200)}
      <ArcMoment cx={60} cy={72} r={24} a0={150} a1={60} couleur={BLEU} epaisseur={1.6} />
      <ArcMoment cx={60} cy={162} r={26} a0={170} a1={40} couleur={BLEU} epaisseur={3.4} />
      <Etiquette x={190} y={78} taille={11.5}>
        petit effet
      </Etiquette>
      <Etiquette x={210} y={200} taille={11.5} gras couleur={BLEU}>
        même F, bien plus d’effet
      </Etiquette>
      <line x1={330} y1={20} x2={330} y2={200} className="t-fin" strokeDasharray="3 4" />
      <rect x={350} y={110} width={30} height={16} fill={hachure('clp', 'maconnerie')} stroke="none" />
      <rect x={588} y={110} width={30} height={16} fill={hachure('clp', 'maconnerie')} stroke="none" />
      <circle cx={386} cy={118} r={5} fill="var(--color-papier)" className="t-fort" />
      <line x1={386} y1={118} x2={580} y2={118} stroke="var(--color-terre)" strokeWidth={7} />
      <Etiquette x={378} y={146} taille={11.5}>
        gonds
      </Etiquette>
      <Fleche x1={410} y1={70} x2={410} y2={112} couleur={ROUGE} epaisseur={2.4} tete={9} />
      <Etiquette x={392} y={60} taille={11.5} couleur={ROUGE}>
        ✗ près des gonds
      </Etiquette>
      <Fleche x1={562} y1={70} x2={562} y2={112} couleur={ROUGE} epaisseur={2.4} tete={9} />
      <Etiquette x={604} y={60} ancre="end" taille={11.5} couleur={VERT}>
        ✓ près de la poignée
      </Etiquette>
      <ArcMoment cx={386} cy={118} r={70} a0={-4} a1={-40} couleur={BLEU} epaisseur={2} />
      <Etiquette x={470} y={196} ancre="middle" taille={11.5} classe="etiquette">
        une porte vue de dessus
      </Etiquette>
    </Figure>
  );
}

/** Convention de signe et trois propriétés du moment : force passant par O, glissement sur la ligne d'action, autre point. */
export function ProprietesMoment() {
  const w = 152;
  const panneau = (i: number, titre: string, legende: string, contenu: React.ReactNode) => (
    <g key={titre}>
      <rect x={4 + i * (w + 2)} y={6} width={w - 4} height={196} rx={8} fill="var(--color-papier)" className="t-fin" />
      <Etiquette x={4 + i * (w + 2) + (w - 4) / 2} y={26} ancre="middle" taille={11.5} gras>
        {titre}
      </Etiquette>
      {contenu}
      <Etiquette x={4 + i * (w + 2) + (w - 4) / 2} y={190} ancre="middle" taille={10.5} classe="etiquette">
        {legende}
      </Etiquette>
    </g>
  );
  const O = (x: number, y: number, nom = 'O') => (
    <g>
      <circle cx={x} cy={y} r={4} fill={TRAIT} />
      <Etiquette x={x - 8} y={y + 4} ancre="end" taille={11.5} gras>
        {nom}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="Quatre vignettes. 1 : convention, positif dans le sens trigonométrique, négatif dans le sens horaire. 2 : une force dont la ligne d'action passe par O a un moment nul en O. 3 : on peut faire glisser une force le long de sa ligne d'action sans changer son moment, le bras de levier d reste le même. 4 : la même force a des bras de levier différents par rapport à deux points différents, donc des moments différents." largeur={620} hauteur={208}>
      {panneau(
        0,
        'le signe',
        'à écrire avant de calculer',
        <g>
          <ArcMoment cx={44} cy={100} r={24} a0={-50} a1={230} couleur={VERT} epaisseur={2.4} />
          <Etiquette x={44} y={106} ancre="middle" taille={16} gras couleur={VERT}>
            +
          </Etiquette>
          <Etiquette x={44} y={152} ancre="middle" taille={10.5} couleur={VERT}>
            trigonométrique
          </Etiquette>
          <ArcMoment cx={114} cy={100} r={24} a0={230} a1={-50} couleur={ROUGE} epaisseur={2.4} />
          <Etiquette x={114} y={106} ancre="middle" taille={16} gras couleur={ROUGE}>
            −
          </Etiquette>
          <Etiquette x={114} y={152} ancre="middle" taille={10.5} couleur={ROUGE}>
            horaire
          </Etiquette>
        </g>,
      )}
      {panneau(
        1,
        'passe par O',
        'bras nul : M = 0',
        <g>
          <line x1={176} y1={160} x2={290} y2={52} className="t-fin" strokeDasharray="8 4" />
          {O(212, 126)}
          <Fleche x1={244} y1={96} x2={278} y2={64} couleur={ROUGE} epaisseur={2.6} tete={9} />
          <Etiquette x={270} y={92} taille={11.5} gras couleur={ROUGE}>
            F
          </Etiquette>
        </g>,
      )}
      {panneau(
        2,
        'glisser sur sa ligne',
        'même bras d : même M',
        <g>
          <line x1={318} y1={70} x2={450} y2={70} className="t-fin" strokeDasharray="8 4" />
          <Fleche x1={334} y1={70} x2={374} y2={70} couleur={ROUGE} epaisseur={2.6} tete={9} />
          <Fleche x1={398} y1={70} x2={438} y2={70} couleur={ROUGE} epaisseur={2.6} tete={9} pointilles />
          {O(384, 146)}
          <line x1={384} y1={146} x2={384} y2={72} stroke={BLEU} strokeWidth={2} />
          <Etiquette x={390} y={116} taille={12} gras couleur={BLEU}>
            d
          </Etiquette>
        </g>,
      )}
      {panneau(
        3,
        'autre point',
        'd₁ ≠ d₂ : M différents',
        <g>
          <line x1={474} y1={64} x2={610} y2={64} className="t-fin" strokeDasharray="8 4" />
          <Fleche x1={520} y1={64} x2={566} y2={64} couleur={ROUGE} epaisseur={2.6} tete={9} />
          {O(500, 100, 'O₁')}
          <line x1={500} y1={100} x2={500} y2={66} stroke={BLEU} strokeWidth={2} />
          <Etiquette x={505} y={88} taille={11.5} gras couleur={BLEU}>
            d₁
          </Etiquette>
          {O(578, 160, 'O₂')}
          <line x1={578} y1={160} x2={578} y2={66} stroke={BLEU} strokeWidth={2} />
          <Etiquette x={584} y={120} taille={11.5} gras couleur={BLEU}>
            d₂
          </Etiquette>
        </g>,
      )}
    </Figure>
  );
}

/** Théorème de Varignon : chaque composante a son propre bras de levier, M_O = x_A F_y − y_A F_x. */
export function VarignonSchema() {
  const O = [120, 196] as const;
  const A = [280, 104] as const;
  const F = [328, 186] as const; // force vers le bas et vers l'extérieur
  return (
    <Figure alt="Force F appliquée en A, de coordonnées xA et yA depuis O, décomposée en Fx horizontale et Fy verticale. Fy a pour bras de levier xA, Fx a pour bras de levier yA ; le moment en O vaut xA Fy − yA Fx." largeur={620} hauteur={244}>
      <Fleche x1={O[0]} y1={O[1]} x2={350} y2={O[1]} couleur={TRAIT} epaisseur={1.4} tete={8} texte="x" tx={354} ty={O[1] + 4} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0]} y2={36} couleur={TRAIT} epaisseur={1.4} tete={8} texte="y" tx={O[0] + 6} ty={40} />
      <circle cx={O[0]} cy={O[1]} r={4.5} fill={TRAIT} />
      <Etiquette x={O[0] - 10} y={O[1] + 16} ancre="end" taille={12.5} gras>
        O
      </Etiquette>
      <line x1={A[0]} y1={A[1]} x2={A[0]} y2={O[1]} className="t-fin" strokeDasharray="4 4" />
      <line x1={O[0]} y1={A[1]} x2={A[0]} y2={A[1]} className="t-fin" strokeDasharray="4 4" />
      <Fleche x1={A[0]} y1={A[1]} x2={F[0]} y2={A[1]} couleur={BRIQUE} epaisseur={2.2} tete={8} pointilles />
      <Etiquette x={F[0] + 4} y={A[1] - 6} taille={12} gras couleur={BRIQUE}>
        Fx
      </Etiquette>
      <Fleche x1={A[0]} y1={A[1]} x2={A[0]} y2={F[1]} couleur={BRIQUE} epaisseur={2.2} tete={8} pointilles />
      <Etiquette x={A[0] - 8} y={F[1] - 8} ancre="end" taille={12} gras couleur={BRIQUE}>
        Fy
      </Etiquette>
      <Fleche x1={A[0]} y1={A[1]} x2={F[0]} y2={F[1]} couleur={ROUGE} epaisseur={3.2} tete={12} />
      <Etiquette x={F[0] + 6} y={F[1] + 4} taille={13} gras couleur={ROUGE}>
        F
      </Etiquette>
      <circle cx={A[0]} cy={A[1]} r={4.5} fill={ROUGE} />
      <Etiquette x={A[0] + 8} y={A[1] - 8} taille={12.5} gras>
        A
      </Etiquette>
      <Cote x1={O[0]} y1={O[1] + 26} x2={A[0]} y2={O[1] + 26} decalage={0} texte="xA : bras de Fy" />
      <Cote x1={O[0] - 34} y1={O[1]} x2={O[0] - 34} y2={A[1]} decalage={0} texte="yA : bras de Fx" />
      <rect x={384} y={70} width={222} height={102} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={396} y={96} taille={13.5} gras couleur={BLEU}>
        M<tspan dy={4} fontSize={10}>O</tspan>
        <tspan dy={-4}> = xA·Fy − yA·Fx</tspan>
      </Etiquette>
      <Etiquette x={396} y={120} taille={11.5}>
        Fy a pour bras de levier xA ;
      </Etiquette>
      <Etiquette x={396} y={138} taille={11.5}>
        Fx a pour bras de levier yA, avec
      </Etiquette>
      <Etiquette x={396} y={156} taille={11.5}>
        un signe − (au-dessus de O)
      </Etiquette>
    </Figure>
  );
}

/** Un couple (deux forces égales et opposées, distantes de d) et un levier en équilibre autour de son pivot. */
export function CoupleEtLevier() {
  return (
    <Figure alt="À gauche, un volant soumis à deux forces égales, parallèles et opposées, distantes de d : un couple C = F d, de résultante nulle, qui fait seulement tourner. À droite, un levier en équilibre sur son pivot : la petite force F, loin du pivot, équilibre la grande charge P, proche du pivot : F b_F = P b_P." largeur={620} hauteur={212}>
      <Hachures prefixe="cpl" types={['terre']} />
      <circle cx={150} cy={104} r={62} fill="none" stroke={TRAIT} strokeWidth={5} />
      <circle cx={150} cy={104} r={8} fill={TRAIT} />
      <line x1={88} y1={104} x2={212} y2={104} stroke={TRAIT} strokeWidth={3} />
      <Fleche x1={88} y1={150} x2={88} y2={108} couleur={ROUGE} epaisseur={3} tete={10} />
      <Fleche x1={212} y1={58} x2={212} y2={100} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={80} y={146} ancre="end" taille={12.5} gras couleur={ROUGE}>
        F
      </Etiquette>
      <Etiquette x={220} y={66} taille={12.5} gras couleur={ROUGE}>
        F
      </Etiquette>
      <Cote x1={88} y1={184} x2={212} y2={184} decalage={0} texte="d" />
      <ArcMoment cx={150} cy={104} r={36} a0={110} a1={-40} couleur={BLEU} epaisseur={2.4} />
      <Etiquette x={150} y={30} ancre="middle" taille={12} gras couleur={BLEU}>
        couple : C = F d, résultante nulle
      </Etiquette>
      <line x1={316} y1={20} x2={316} y2={200} className="t-fin" strokeDasharray="3 4" />
      <rect x={340} y={150} width={270} height={10} fill={hachure('cpl', 'terre')} stroke="none" />
      <line x1={340} y1={150} x2={610} y2={150} className="t-moyen" />
      <polygon points={points([[400, 118], [388, 150], [412, 150]])} fill="var(--halo)" className="t-moyen" />
      <line x1={356} y1={116} x2={600} y2={116} stroke={TRAIT} strokeWidth={5} />
      <Fleche x1={368} y1={56} x2={368} y2={112} couleur={ROUGE} epaisseur={3.4} tete={11} />
      <Etiquette x={360} y={50} taille={12.5} gras couleur={ROUGE}>
        P (grande)
      </Etiquette>
      <Fleche x1={590} y1={80} x2={590} y2={112} couleur={ROUGE} epaisseur={2} tete={8} />
      <Etiquette x={598} y={76} ancre="end" taille={12.5} gras couleur={ROUGE}>
        F (petite)
      </Etiquette>
      <Cote x1={368} y1={176} x2={400} y2={176} decalage={0} texte="bP" />
      <Cote x1={400} y1={176} x2={590} y2={176} decalage={0} texte="bF" />
      <Etiquette x={470} y={30} ancre="middle" taille={12} gras couleur={BLEU}>
        levier : F bF = P bP
      </Etiquette>
      <Etiquette x={402} y={142} taille={11} classe="etiquette">
        pivot
      </Etiquette>
    </Figure>
  );
}

/** Le bras de levier n'est pas la distance OA : c'est la distance de O à la ligne d'action, perpendiculairement. */
export function BrasOuDistance() {
  const O = [120, 176] as const;
  const A = [300, 92] as const;
  const a = (-75 * Math.PI) / 180;
  const u = [Math.cos(a), -Math.sin(a)] as const; // direction écran
  const L = (t: number) => [A[0] + t * u[0], A[1] + t * u[1]] as const;
  const t = (O[0] - A[0]) * u[0] + (O[1] - A[1]) * u[1];
  const H = L(t);
  return (
    <Figure alt="Point O et force F appliquée en A, inclinée : la distance OA, en rouge barré, n'est pas le bras de levier ; le bras de levier d, en vert, va de O à la ligne d'action de F et lui est perpendiculaire." largeur={620} hauteur={236}>
      <line x1={L(-90)[0]} y1={L(-90)[1]} x2={L(150)[0]} y2={L(150)[1]} className="t-fin" strokeDasharray="10 4 2 4" />
      <Fleche x1={A[0]} y1={A[1]} x2={L(84)[0]} y2={L(84)[1]} couleur={ROUGE} epaisseur={3.2} tete={12} />
      <Etiquette x={L(84)[0] + 10} y={L(84)[1]} taille={13} gras couleur={ROUGE}>
        F
      </Etiquette>
      <line x1={O[0]} y1={O[1]} x2={A[0]} y2={A[1]} stroke={ROUGE} strokeWidth={2} strokeDasharray="6 4" />
      <line x1={O[0]} y1={O[1]} x2={H[0]} y2={H[1]} stroke={VERT} strokeWidth={3} />
      <polyline points={points([[H[0] - 9 * u[0] , H[1] - 9 * u[1]], [H[0] - 9 * u[0] + 9 * ((O[0] - H[0]) / Math.hypot(O[0] - H[0], O[1] - H[1])), H[1] - 9 * u[1] + 9 * ((O[1] - H[1]) / Math.hypot(O[0] - H[0], O[1] - H[1]))], [H[0] + 9 * ((O[0] - H[0]) / Math.hypot(O[0] - H[0], O[1] - H[1])), H[1] + 9 * ((O[1] - H[1]) / Math.hypot(O[0] - H[0], O[1] - H[1]))]])} fill="none" stroke={VERT} strokeWidth={1.4} />
      <circle cx={O[0]} cy={O[1]} r={4.5} fill={TRAIT} />
      <Etiquette x={O[0] - 10} y={O[1] + 4} ancre="end" taille={13} gras>
        O
      </Etiquette>
      <circle cx={A[0]} cy={A[1]} r={4.5} fill={ROUGE} />
      <Etiquette x={A[0] + 8} y={A[1] - 6} taille={13} gras>
        A
      </Etiquette>
      <Etiquette x={(O[0] + A[0]) / 2 - 12} y={(O[1] + A[1]) / 2 - 10} ancre="end" taille={12} gras couleur={ROUGE}>
        ✗ OA
      </Etiquette>
      <Etiquette x={(O[0] + H[0]) / 2} y={(O[1] + H[1]) / 2 + 22} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ d
      </Etiquette>
      <rect x={400} y={70} width={206} height={84} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={412} y={94} taille={12} gras couleur={VERT}>
        d : de O à la ligne d’action,
      </Etiquette>
      <Etiquette x={412} y={112} taille={12} gras couleur={VERT}>
        perpendiculairement
      </Etiquette>
      <Etiquette x={412} y={138} taille={11.5} couleur={ROUGE}>
        OA va au point : faux bras
      </Etiquette>
    </Figure>
  );
}

/** Une console fixée au mur : la charge au bout crée un moment ; la cheville du haut est arrachée, le bas appuie sur le mur. */
export function FixationMurale() {
  return (
    <Figure alt="Une console fixée au mur par une platine et deux chevilles porte une charge P à la distance a du mur : le moment M = P a arrache la cheville du haut (traction) et appuie le bas de la platine contre le mur (compression)." largeur={620} hauteur={232}>
      <Hachures prefixe="fxm" types={['maconnerie']} />
      <rect x={40} y={20} width={50} height={200} fill={hachure('fxm', 'maconnerie')} className="t-moyen" />
      <rect x={90} y={50} width={12} height={110} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.4} />
      <line x1={102} y1={62} x2={380} y2={62} stroke="var(--color-acier)" strokeWidth={9} />
      <line x1={102} y1={150} x2={250} y2={66} stroke="var(--color-acier)" strokeWidth={6} />
      {[70, 140].map((y) => (
        <line key={y} x1={66} y1={y} x2={100} y2={y} stroke={TRAIT} strokeWidth={4} />
      ))}
      <Fleche x1={372} y1={14} x2={372} y2={56} couleur={ROUGE} epaisseur={3} tete={11} />
      <Etiquette x={380} y={24} taille={12.5} gras couleur={ROUGE}>
        P
      </Etiquette>
      <Cote x1={90} y1={196} x2={372} y2={196} decalage={0} texte="a : bras de levier" />
      <Fleche x1={110} y1={86} x2={160} y2={86} couleur={BLEU} epaisseur={2.6} tete={9} />
      <Etiquette x={166} y={90} taille={11.5} gras couleur={BLEU}>
        cheville du haut arrachée (traction)
      </Etiquette>
      <Fleche x1={160} y1={164} x2={106} y2={164} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Etiquette x={166} y={168} taille={11.5} gras couleur={ROUGE}>
        le bas appuie sur le mur (compression)
      </Etiquette>
      <Etiquette x={420} y={110} taille={13} gras>
        M = P × a
      </Etiquette>
      <Etiquette x={420} y={130} taille={11.5}>
        plus la charge est loin,
      </Etiquette>
      <Etiquette x={420} y={148} taille={11.5}>
        plus les chevilles travaillent
      </Etiquette>
    </Figure>
  );
}

/** Panneau de chantier poussé par le vent : force F à la hauteur h, moment au pied (si M est donné). */
export function PanneauVent({ F, h, M }: { F: number; h: number; M?: number }) {
  const yS = 206;
  const k = 128 / Math.max(h, 0.5);
  const yF = yS - h * k;
  return (
    <Figure alt={`Panneau de chantier sur un poteau : le vent pousse avec une force horizontale de ${nombre(F, 0)} kN appliquée à ${n1(h)} m du sol${M === undefined ? '' : ` ; moment au pied ${n1(Math.abs(M))} kN·m`}.`} largeur={620} hauteur={246}>
      <Hachures prefixe="pnv" types={['terre', 'ba']} />
      <rect x={40} y={yS} width={360} height={14} fill={hachure('pnv', 'terre')} stroke="none" />
      <line x1={40} y1={yS} x2={400} y2={yS} className="t-moyen" />
      <rect x={196} y={yS} width={48} height={30} fill={hachure('pnv', 'ba')} className="t-moyen" />
      <rect x={214} y={yF - 26} width={12} height={yS - yF + 26} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.2} />
      <rect x={150} y={yF - 34} width={140} height={68} fill="var(--color-papier)" className="t-fort" />
      <Etiquette x={220} y={yF + 4} ancre="middle" taille={11} classe="etiquette">
        panneau
      </Etiquette>
      {[-22, 0, 22].map((dy) => (
        <Fleche key={dy} x1={60} y1={yF + dy} x2={140} y2={yF + dy} couleur={BLEU} epaisseur={1.2} tete={6} pointilles />
      ))}
      <Etiquette x={60} y={yF - 34} taille={11} couleur={BLEU}>
        vent
      </Etiquette>
      <Fleche x1={300} y1={yF} x2={360} y2={yF} couleur={ROUGE} epaisseur={3.2} tete={11} />
      <Etiquette x={300} y={yF - 10} taille={12.5} gras couleur={ROUGE}>
        F = {nombre(F, 0)} kN
      </Etiquette>
      <Cote x1={378} y1={yS} x2={378} y2={yF} decalage={0} texte={`h = ${n1(h)} m`} />
      <circle cx={220} cy={yS} r={4} fill={TRAIT} />
      {M === undefined ? (
        <Etiquette x={252} y={yS - 10} taille={12} gras>
          M au pied ?
        </Etiquette>
      ) : (
        <ArcMoment cx={220} cy={yS} r={32} a0={150} a1={30} couleur={VERT} epaisseur={2.6} texte={`M = ${n1(Math.abs(M))} kN·m`} tx={262} ty={yS - 30} />
      )}
      <Etiquette x={430} y={120} taille={11.5}>
        bras de levier de F
      </Etiquette>
      <Etiquette x={430} y={138} taille={11.5}>
        par rapport au pied :
      </Etiquette>
      <Etiquette x={430} y={156} taille={11.5} gras>
        la hauteur h
      </Etiquette>
    </Figure>
  );
}

/** Barre à mine : la pierre près du pivot, la main loin du pivot (exercice 2). */
export function LevierBarre({ P, bP, bF, F }: { P: number; bP: number; bF: number; F?: number }) {
  const xp = 170;
  const k = 330 / (bP + bF);
  const xs = xp - bP * k;
  const xm = xp + bF * k;
  const y = 120;
  return (
    <Figure alt={`Barre à mine sur un pivot : la pierre de ${nombre(P, 0)} kN appuie à ${n2(bP)} m du pivot, l'ouvrier pousse à ${n2(bF)} m du pivot${F === undefined ? '' : ` avec une force de ${nombre(F, 3)} kN`}.`} largeur={620} hauteur={206}>
      <Hachures prefixe="lvb" types={['terre']} />
      <rect x={40} y={152} width={540} height={10} fill={hachure('lvb', 'terre')} stroke="none" />
      <line x1={40} y1={152} x2={580} y2={152} className="t-moyen" />
      <path d={`M${xs - 70} ${y - 4} Q${xs - 80} ${y - 60} ${xs - 20} ${y - 66} Q${xs + 20} ${y - 62} ${xs + 14} ${y - 4} Z`} fill="var(--color-beton-clair)" className="t-moyen" />
      <polygon points={points([[xp, y + 3], [xp - 13, 152], [xp + 13, 152]])} fill="var(--halo)" className="t-moyen" />
      <line x1={xs - 10} y1={y} x2={xm + 14} y2={y} stroke="var(--color-acier)" strokeWidth={6} />
      <Fleche x1={xs} y1={y - 48} x2={xs} y2={y - 4} couleur={ROUGE} epaisseur={3.2} tete={11} />
      <Etiquette x={xs + 8} y={y - 40} taille={12.5} gras couleur={ROUGE}>
        P = {nombre(P, 0)} kN
      </Etiquette>
      <Fleche x1={xm} y1={y - 60} x2={xm} y2={y - 4} couleur={ROUGE} epaisseur={2.4} tete={9} />
      <Etiquette x={xm - 8} y={y - 64} ancre="end" taille={12.5} gras couleur={ROUGE}>
        F = {F === undefined ? '?' : `${nombre(F, 3)} kN`}
      </Etiquette>
      <Cote x1={xs} y1={180} x2={xp} y2={180} decalage={0} texte={`${n2(bP)} m`} />
      <Cote x1={xp} y1={180} x2={xm} y2={180} decalage={0} texte={`${n2(bF)} m`} />
      <Etiquette x={xp + 16} y={146} taille={11} classe="etiquette">
        pivot
      </Etiquette>
    </Figure>
  );
}

/** La potence sous trois directions de câble : moment en O pour θ = −75°, −90° et −105° (exercice 3). */
export function PotenceTroisCables({ xA, yA, F, cas }: { xA: number; yA: number; F: number; cas: ReadonlyArray<{ theta: number; M: number }> }) {
  const O = [92, 168] as const;
  const k = 210 / Math.max(xA, 0.5);
  const A = [O[0] + xA * k, O[1] - yA * k] as const;
  const couleurs = [ROUGE, BRIQUE, BLEU];
  return (
    <Figure alt={`Potence fixée au mur en O, extrémité A à ${n2(xA)} m du mur et ${n2(yA)} m au-dessus de O ; force de ${nombre(F, 0)} kN selon trois directions : ${cas.map((c) => `θ = ${nombre(c.theta, 0)}° : M = ${n2(c.M)} kN·m`).join(' ; ')}.`} largeur={620} hauteur={300}>
      <Hachures prefixe="ptc" types={['maconnerie']} />
      <rect x={52} y={40} width={40} height={230} fill={hachure('ptc', 'maconnerie')} className="t-moyen" />
      <line x1={O[0]} y1={O[1]} x2={A[0]} y2={A[1]} stroke="var(--color-acier)" strokeWidth={7} />
      <circle cx={O[0]} cy={O[1]} r={5} fill={TRAIT} />
      <Etiquette x={O[0] + 10} y={O[1] + 18} taille={13} gras>
        O
      </Etiquette>
      <Etiquette x={A[0] + 6} y={A[1] - 10} taille={13} gras>
        A
      </Etiquette>
      {cas.map((c, i) => {
        const a = (c.theta * Math.PI) / 180;
        const x2 = A[0] + 120 * Math.cos(a);
        const y2 = A[1] - 120 * Math.sin(a);
        return (
          <g key={c.theta}>
            <Fleche x1={A[0]} y1={A[1]} x2={x2} y2={y2} couleur={couleurs[i % 3]} epaisseur={2.8} tete={10} />
            <Etiquette x={x2 + (Math.cos(a) > 0.1 ? 8 : Math.cos(a) < -0.1 ? -8 : 0)} y={y2 + 18} ancre={Math.cos(a) > 0.1 ? 'start' : Math.cos(a) < -0.1 ? 'end' : 'middle'} taille={11.5} gras couleur={couleurs[i % 3]}>
              {nombre(c.theta, 0)}°
            </Etiquette>
          </g>
        );
      })}
      <rect x={400} y={52} width={208} height={30 + cas.length * 24} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={412} y={74} taille={12} gras>
        moment en O (F = {nombre(F, 0)} kN)
      </Etiquette>
      {cas.map((c, i) => (
        <Etiquette key={c.theta} x={412} y={98 + i * 24} taille={12} gras couleur={couleurs[i % 3]}>
          θ = {nombre(c.theta, 0)}° : M = {n2(c.M)} kN·m
        </Etiquette>
      ))}
    </Figure>
  );
}

// ---------- L1.3.3 : torseur ----------

/** Un relevé de compte se résume par un solde ; des forces se résument par une résultante et un moment. */
export function ReleveEtTorseur() {
  const x0 = 320;
  const lg = 260;
  return (
    <Figure alt="À gauche, un relevé de compte : plusieurs opérations se résument par un solde. À droite, trois forces sur une poutre se résument, en A, par une résultante R et un moment M_A : même effet sur la poutre." largeur={620} hauteur={220}>
      <rect x={24} y={30} width={200} height={160} rx={8} fill="var(--color-papier)" className="t-moyen" />
      <Etiquette x={36} y={52} taille={12.5} gras>
        relevé du mois
      </Etiquette>
      {['+ salaire', '− loyer', '− transport', '+ vente'].map((t, i) => (
        <Etiquette key={t} x={40} y={78 + i * 20} taille={11.5} couleur={t.startsWith('+') ? VERT : ROUGE}>
          {t}
        </Etiquette>
      ))}
      <line x1={36} y1={160} x2={212} y2={160} className="t-fin" />
      <Etiquette x={40} y={180} taille={12.5} gras couleur={BLEU}>
        = un solde
      </Etiquette>
      <Etiquette x={262} y={112} ancre="middle" taille={12} gras>
        comme
      </Etiquette>
      <line x1={x0} y1={76} x2={x0 + lg} y2={76} stroke={TRAIT} strokeWidth={5} />
      {[50, 140, 220].map((dx, i) => (
        <g key={dx}>
          <Fleche x1={x0 + dx} y1={30} x2={x0 + dx} y2={72} couleur={ROUGE} epaisseur={2.4} tete={9} />
          <Etiquette x={x0 + dx + 6} y={38} taille={11.5} gras couleur={ROUGE}>
            F{i + 1}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={x0 - 6} y={82} ancre="end" taille={12.5} gras>
        A
      </Etiquette>
      <Etiquette x={x0 + lg / 2} y={118} ancre="middle" taille={12} gras>
        = même effet
      </Etiquette>
      <line x1={x0} y1={180} x2={x0 + lg} y2={180} stroke={TRAIT} strokeWidth={5} />
      <Fleche x1={x0} y1={132} x2={x0} y2={176} couleur={BLEU} epaisseur={3} tete={10} />
      <Etiquette x={x0 + 8} y={142} taille={12.5} gras couleur={BLEU}>
        R
      </Etiquette>
      <ArcMoment cx={x0} cy={180} r={26} a0={110} a1={-30} couleur={BLEU} epaisseur={2.4} texte="MA" tx={x0 + 30} ty={160} />
      <Etiquette x={x0 - 6} y={186} ancre="end" taille={12.5} gras>
        A
      </Etiquette>
      <Etiquette x={x0 + lg / 2} y={210} ancre="middle" taille={11} classe="etiquette">
        le torseur en A : résultante + moment
      </Etiquette>
    </Figure>
  );
}

/** Changer de point de réduction : la résultante est la même, le moment change de la quantité (x_A − x_B) R_y. */
export function ChangementPoint({ Ry, MA, MB, xB }: { Ry: number; MA: number; MB: number; xB: number }) {
  const x0 = 70;
  const lg = 400;
  const xb = x0 + lg;
  const ligne = (y: number, xp: number, M: number, nom: string) => (
    <g>
      <line x1={x0} y1={y} x2={xb} y2={y} stroke={TRAIT} strokeWidth={5} />
      <Etiquette x={x0 - 8} y={y + 5} ancre="end" taille={12.5} gras>
        A
      </Etiquette>
      <Etiquette x={xb + 8} y={y + 5} taille={12.5} gras>
        B
      </Etiquette>
      <Fleche x1={xp} y1={y - 50} x2={xp} y2={y - 4} couleur={BLEU} epaisseur={3} tete={10} />
      <Etiquette x={xp + (xp === x0 ? 8 : -8)} y={y - 40} ancre={xp === x0 ? 'start' : 'end'} taille={12} gras couleur={BLEU}>
        R = {nombre(Math.abs(Ry), 0)} kN
      </Etiquette>
      <ArcMoment cx={xp} cy={y} r={24} a0={M >= 0 ? -20 : 200} a1={M >= 0 ? 200 : -20} couleur={M >= 0 ? VERT : ROUGE} epaisseur={2.4} />
      <Etiquette x={xp + (xp === x0 ? 34 : -34)} y={y + 30} ancre={xp === x0 ? 'start' : 'end'} taille={12} gras couleur={M >= 0 ? VERT : ROUGE}>
        {nom} = {nombre(M, 0)} kN·m
      </Etiquette>
    </g>
  );
  return (
    <Figure alt={`Le même système réduit en A puis en B, à ${nombre(xB, 0)} m : la résultante reste ${nombre(Math.abs(Ry), 0)} kN vers le bas ; le moment passe de MA = ${nombre(MA, 0)} kN·m à MB = ${nombre(MB, 0)} kN·m.`} largeur={620} hauteur={262}>
      <Etiquette x={x0} y={20} taille={12} gras>
        torseur en A
      </Etiquette>
      {ligne(84, x0, MA, 'MA')}
      <Etiquette x={x0} y={144} taille={12} gras>
        torseur en B
      </Etiquette>
      {ligne(208, xb, MB, 'MB')}
      <Etiquette x={510} y={60} taille={11.5} gras>
        MB = MA
      </Etiquette>
      <Etiquette x={510} y={78} taille={11.5} gras>
        + (xA − xB) Ry
      </Etiquette>
      <Etiquette x={510} y={104} taille={11}>
        = {nombre(MA, 0)}
      </Etiquette>
      <Etiquette x={510} y={122} taille={11}>
        + (0 − {nombre(xB, 0)}) × ({nombre(Ry, 0)})
      </Etiquette>
      <Etiquette x={510} y={140} taille={11.5} gras couleur={VERT}>
        = {nombre(MB, 0)} kN·m
      </Etiquette>
      <Cote x1={x0} y1={248} x2={xb} y2={248} decalage={0} texte={`${nombre(xB, 0)} m`} />
    </Figure>
  );
}

/** Trois positions de la résultante sous une semelle : centrée, dans le tiers central, hors du tiers central. */
export function TroisCasSemelle() {
  const B = 140;
  const p0 = 16;
  const cas = [
    { e: 0, titre: 'e = 0', legende: 'pression uniforme' },
    { e: 15, titre: '|e| ≤ B/6', legende: 'comprimé partout' },
    { e: 40, titre: '|e| > B/6', legende: 'un bord se soulève' },
  ];
  return (
    <Figure alt="Trois semelles de largeur B. Résultante au centre : pression uniforme. Résultante dans le tiers central (|e| ≤ B/6) : pression trapézoïdale, le sol est comprimé sous toute la base. Résultante hors du tiers central : pression triangulaire sur une partie seulement, l'autre bord se soulève. Répartition linéaire des pressions supposée." largeur={620} hauteur={252}>
      <Hachures prefixe="tcs" types={['ba']} />
      {cas.map((c, i) => {
        const cx = 108 + i * 202;
        const xg = cx - B / 2;
        const xd = cx + B / 2;
        const yb = 120;
        // diagramme de pression (vers le bas), répartition linéaire
        let poly: Array<readonly [number, number]>;
        if (c.e <= B / 6) {
          const hg = p0 * (1 - (6 * c.e) / B);
          const hd = p0 * (1 + (6 * c.e) / B);
          poly = [[xg, yb + 4], [xd, yb + 4], [xd, yb + 4 + hd], [xg, yb + 4 + hg]];
        } else {
          const a = 3 * (B / 2 - c.e);
          const pm = (p0 * 2 * B) / (3 * (B / 2 - c.e)) / 2;
          poly = [[xd - a, yb + 4], [xd, yb + 4], [xd, yb + 4 + pm]];
        }
        return (
          <g key={c.titre}>
            <Etiquette x={cx} y={22} ancre="middle" taille={12.5} gras>
              {c.titre}
            </Etiquette>
            <rect x={cx - 12} y={48} width={24} height={52} fill={hachure('tcs', 'ba')} className="t-moyen" />
            <rect x={xg} y={100} width={B} height={20} fill={hachure('tcs', 'ba')} className="t-moyen" />
            <rect x={cx - B / 6} y={96} width={B / 3} height={4} fill={VERT} />
            <Fleche x1={cx + c.e} y1={34} x2={cx + c.e} y2={118} couleur={BLEU} epaisseur={2.8} tete={10} />
            <polygon points={points(poly)} fill={ROUGE} fillOpacity={0.18} stroke={ROUGE} strokeWidth={1.4} />
            {c.e > B / 6 ? (
              <Etiquette x={xg + 4} y={yb + 22} taille={10.5} couleur={ROUGE}>
                décollement
              </Etiquette>
            ) : null}
            <Etiquette x={cx} y={206} ancre="middle" taille={11.5}>
              {c.legende}
            </Etiquette>
          </g>
        );
      })}
      <Etiquette x={20} y={236} taille={11} classe="etiquette">
        vert : tiers central (largeur B/3) · rouge : pression du sol, supposée linéaire · bleu : résultante
      </Etiquette>
    </Figure>
  );
}

/** Déplacer une force parallèlement à elle-même : il faut ajouter le couple de transport F × d. */
export function TransportForce() {
  const panneau = (x: number, titre: string, contenu: React.ReactNode) => (
    <g>
      <Etiquette x={x + 90} y={22} ancre="middle" taille={11.5} gras>
        {titre}
      </Etiquette>
      <line x1={x + 10} y1={110} x2={x + 170} y2={110} stroke={TRAIT} strokeWidth={5} />
      <Etiquette x={x + 30} y={134} ancre="middle" taille={12} gras>
        A
      </Etiquette>
      <Etiquette x={x + 150} y={134} ancre="middle" taille={12} gras>
        B
      </Etiquette>
      {contenu}
    </g>
  );
  return (
    <Figure alt="Trois écritures du même effet. 1 : une force F en A. 2 : on ajoute en B deux forces F et −F, qui s'annulent. 3 : il reste la force F en B et un couple C = F d, d étant la distance AB : déplacer une force sans ajouter ce couple change son effet." largeur={620} hauteur={176}>
      {panneau(
        10,
        '1. F en A',
        <Fleche x1={40} y1={50} x2={40} y2={106} couleur={ROUGE} epaisseur={3} tete={10} />,
      )}
      <Etiquette x={206} y={100} ancre="middle" taille={16} gras>
        =
      </Etiquette>
      {panneau(
        220,
        '2. + F et − F en B',
        <g>
          <Fleche x1={250} y1={50} x2={250} y2={106} couleur={ROUGE} epaisseur={3} tete={10} />
          <Fleche x1={364} y1={50} x2={364} y2={106} couleur={ROUGE} epaisseur={2.2} tete={9} pointilles />
          <Fleche x1={376} y1={160} x2={376} y2={114} couleur={ROUGE} epaisseur={2.2} tete={9} pointilles />
        </g>,
      )}
      <Etiquette x={414} y={100} ancre="middle" taille={16} gras>
        =
      </Etiquette>
      {panneau(
        428,
        '3. F en B + couple',
        <g>
          <Fleche x1={578} y1={50} x2={578} y2={106} couleur={ROUGE} epaisseur={3} tete={10} />
          <ArcMoment cx={578} cy={110} r={26} a0={20} a1={150} couleur={BLEU} epaisseur={2.4} />
          <Etiquette x={500} y={70} taille={12} gras couleur={BLEU}>
            C = F d
          </Etiquette>
        </g>,
      )}
      <Etiquette x={20} y={168} taille={11} classe="etiquette">
        d = distance AB, mesurée perpendiculairement à F
      </Etiquette>
    </Figure>
  );
}

/** Charges excentrées sans force horizontale : poteau de rive au bord de sa semelle, semelle contre une limite de parcelle. */
export function ChargeExcentree() {
  const semelle = (cx: number, decal: number, titre: string, limite: boolean) => (
    <g>
      <Etiquette x={cx} y={22} ancre="middle" taille={12} gras>
        {titre}
      </Etiquette>
      <rect x={cx - 80} y={140} width={160} height={30} fill={hachure('cex', 'ba')} className="t-moyen" />
      <rect x={cx + decal - 14} y={50} width={28} height={90} fill={hachure('cex', 'ba')} className="t-moyen" />
      <line x1={cx} y1={40} x2={cx} y2={186} className="t-fin" strokeDasharray="6 3 2 3" />
      <Fleche x1={cx + decal} y1={34} x2={cx + decal} y2={60} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={cx + decal + (decal > 0 ? 8 : -8)} y={40} ancre={decal > 0 ? 'start' : 'end'} taille={12.5} gras couleur={ROUGE}>
        N
      </Etiquette>
      <Cote x1={cx} y1={196} x2={cx + decal} y2={196} decalage={0} texte="e" />
      {limite ? (
        <g>
          <line x1={cx + 82} y1={30} x2={cx + 82} y2={200} stroke={BRIQUE} strokeWidth={2} strokeDasharray="10 5" />
          <Etiquette x={cx + 88} y={110} taille={11} couleur={BRIQUE}>
            limite
          </Etiquette>
          <Etiquette x={cx + 88} y={126} taille={11} couleur={BRIQUE}>
            de parcelle
          </Etiquette>
        </g>
      ) : null}
    </g>
  );
  return (
    <Figure alt="Deux semelles chargées hors de leur centre : un poteau de rive posé au bord de sa semelle, et une semelle bloquée contre une limite de parcelle. La charge N est décalée de e par rapport au centre : elle crée un moment M = N e, même sans aucune force horizontale." largeur={620} hauteur={232}>
      <Hachures prefixe="cex" types={['ba']} />
      {semelle(150, 56, 'poteau de rive', false)}
      {semelle(410, 62, 'contre la limite', true)}
      <Etiquette x={310} y={224} ancre="middle" taille={12} gras couleur={BLEU}>
        charge décalée de e : moment M = N e sur la semelle
      </Etiquette>
    </Figure>
  );
}

/** Mât d'éclairage : effort de vent en tête, massif de fondation, excentricité et largeur nécessaire (exercice 3). */
export function MatEclairage({ N, H, h, e, Bmin }: { N: number; H: number; h: number; e: number; Bmin: number }) {
  const yb = 250;
  const k = 190 / h;
  const cx = 170;
  const kB = 60; // px par mètre pour la largeur
  return (
    <Figure alt={`Mât d'éclairage : N = ${nombre(N, 0)} kN, vent H = ${nombre(H, 0)} kN à ${nombre(h, 0)} m au-dessus de la base ; excentricité e = ${n2(e)} m ; pour rester dans le tiers central, il faudrait un massif de largeur B ≥ 6 e = ${n1(Bmin)} m.`} largeur={620} hauteur={300}>
      <Hachures prefixe="mat" types={['ba', 'terre']} />
      <rect x={cx - 150} y={yb} width={300} height={14} fill={hachure('mat', 'terre')} stroke="none" />
      <rect x={cx - 34} y={yb - 40} width={68} height={40} fill={hachure('mat', 'ba')} className="t-moyen" />
      <rect x={cx - 5} y={yb - h * k} width={10} height={h * k - 40} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.2} />
      <line x1={cx} y1={yb - h * k} x2={cx + 40} y2={yb - h * k - 10} stroke="var(--color-acier)" strokeWidth={3} />
      <Fleche x1={cx - 90} y1={yb - h * k + 6} x2={cx - 8} y2={yb - h * k + 6} couleur={ROUGE} epaisseur={3} tete={11} />
      <Etiquette x={cx - 90} y={yb - h * k - 4} taille={12.5} gras couleur={ROUGE}>
        H = {nombre(H, 0)} kN
      </Etiquette>
      <Fleche x1={cx + 16} y1={yb - 110} x2={cx + 16} y2={yb - 44} couleur={ROUGE} epaisseur={3} tete={11} />
      <Etiquette x={cx + 24} y={yb - 92} taille={12.5} gras couleur={ROUGE}>
        N = {nombre(N, 0)} kN
      </Etiquette>
      <Cote x1={cx - 60} y1={yb} x2={cx - 60} y2={yb - h * k + 6} decalage={0} texte={`${nombre(h, 0)} m`} />
      <rect x={cx - 34 / 3} y={yb + 2} width={68 / 3} height={6} fill={VERT} />
      <circle cx={cx + Math.min(e * kB, 140)} cy={yb} r={6} fill={BLEU} />
      <Etiquette x={cx + Math.min(e * kB, 140) + 8} y={yb - 8} taille={12} gras couleur={BLEU}>
        la résultante sort ici
      </Etiquette>
      <Cote x1={cx} y1={yb + 24} x2={cx + Math.min(e * kB, 140)} y2={yb + 24} decalage={0} texte={`e = ${n2(e)} m`} />
      <rect x={350} y={60} width={256} height={120} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={362} y={84} taille={12} gras>
        M = H h, e = M / N = {n2(e)} m
      </Etiquette>
      <Etiquette x={362} y={108} taille={12} gras couleur={ROUGE}>
        il faudrait B ≥ 6 e = {n1(Bmin)} m
      </Etiquette>
      <Etiquette x={362} y={134} taille={11.5}>
        autres solutions : alourdir le
      </Etiquette>
      <Etiquette x={362} y={152} taille={11.5}>
        massif, l’enterrer, calcul de sol
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.4 : principe fondamental de la statique ----------

/** Un livre posé sur une table, puis poussé de côté : les forces se compensent, rien ne bouge. */
export function LivreSurTable() {
  const table = (x: number) => (
    <g>
      <rect x={x} y={120} width={240} height={12} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
      <line x1={x + 20} y1={132} x2={x + 20} y2={190} stroke={TERRE} strokeWidth={5} />
      <line x1={x + 220} y1={132} x2={x + 220} y2={190} stroke={TERRE} strokeWidth={5} />
      <rect x={x + 80} y={92} width={80} height={28} rx={3} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.4} />
      <circle cx={x + 120} cy={106} r={3} fill={TRAIT} />
      <Fleche x1={x + 120} y1={106} x2={x + 120} y2={164} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={x + 128} y={160} taille={12} gras couleur={ROUGE}>
        P
      </Etiquette>
      <Fleche x1={x + 104} y1={168} x2={x + 104} y2={122} couleur={VERT} epaisseur={3} tete={10} />
      <Etiquette x={x + 96} y={160} ancre="end" taille={12} gras couleur={VERT}>
        R
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="À gauche, un livre posé sur une table : son poids P vers le bas et la réaction R de la table vers le haut se compensent. À droite, on pousse le livre avec une force F : le frottement f de la table le retient, il ne glisse pas tant que f peut équilibrer F." largeur={620} hauteur={214}>
      <Etiquette x={150} y={24} ancre="middle" taille={12.5} gras>
        posé : P et R se compensent
      </Etiquette>
      {table(30)}
      <Etiquette x={460} y={24} ancre="middle" taille={12.5} gras>
        poussé : le frottement retient
      </Etiquette>
      {table(340)}
      <Fleche x1={364} y1={104} x2={418} y2={104} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={364} y={96} taille={12} gras couleur={ROUGE}>
        F
      </Etiquette>
      <Fleche x1={540} y1={124} x2={500} y2={124} couleur={VERT} epaisseur={3} tete={10} />
      <Etiquette x={546} y={128} taille={12} gras couleur={VERT}>
        f
      </Etiquette>
      <Etiquette x={310} y={206} ancre="middle" taille={11.5} classe="etiquette">
        rien ne bouge : ΣFx = 0, ΣFy = 0, et rien ne tourne : ΣM = 0
      </Etiquette>
    </Figure>
  );
}

/** Isoler une poutre : on remplace chaque appui par ses forces inconnues, dessinées dans un sens supposé. */
export function IsolementPoutre() {
  const poutre = (x0: number, y: number) => <line x1={x0} y1={y} x2={x0 + 230} y2={y} stroke={TRAIT} strokeWidth={5} />;
  return (
    <Figure alt="À gauche, une poutre sur une articulation en A et un appui simple en B, chargée par P. À droite, la même poutre isolée : les appuis sont remplacés par les inconnues H_A, V_A et R_B, dessinées en pointillés dans un sens supposé ; les moments pris en A éliminent H_A et V_A." largeur={620} hauteur={226}>
      <Hachures prefixe="isp" types={['terre']} />
      <Etiquette x={30} y={22} taille={12.5} gras>
        la structure
      </Etiquette>
      {poutre(40, 110)}
      <AppuiDouble x={40} y={113} t={11} prefixe="isp" />
      <AppuiSimple x={270} y={113} t={11} />
      <Fleche x1={130} y1={58} x2={130} y2={106} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={138} y={66} taille={12} gras couleur={ROUGE}>
        P
      </Etiquette>
      <Etiquette x={34} y={150} ancre="end" taille={12.5} gras>
        A
      </Etiquette>
      <Etiquette x={286} y={150} taille={12.5} gras>
        B
      </Etiquette>
      <Fleche x1={292} y1={52} x2={344} y2={52} couleur={TRAIT} epaisseur={2} tete={9} />
      <Etiquette x={318} y={42} ancre="middle" taille={11}>
        isoler
      </Etiquette>
      <Etiquette x={360} y={22} taille={12.5} gras>
        la poutre isolée
      </Etiquette>
      {poutre(370, 110)}
      <Fleche x1={460} y1={58} x2={460} y2={106} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={468} y={66} taille={12} gras couleur={ROUGE}>
        P
      </Etiquette>
      <Fleche x1={324} y1={110} x2={366} y2={110} couleur={VERT} epaisseur={2.6} tete={9} pointilles />
      <Etiquette x={326} y={132} taille={12} gras couleur={VERT}>
        HA
      </Etiquette>
      <Fleche x1={370} y1={170} x2={370} y2={116} couleur={VERT} epaisseur={2.6} tete={9} pointilles />
      <Etiquette x={378} y={166} taille={12} gras couleur={VERT}>
        VA
      </Etiquette>
      <Fleche x1={600} y1={170} x2={600} y2={116} couleur={VERT} epaisseur={2.6} tete={9} pointilles />
      <Etiquette x={592} y={166} ancre="end" taille={12} gras couleur={VERT}>
        RB
      </Etiquette>
      <circle cx={370} cy={110} r={11} fill="none" stroke={BLEU} strokeWidth={2} />
      <Etiquette x={360} y={206} taille={11.5} couleur={BLEU}>
        moments en A : HA et VA y passent, il ne reste que RB
      </Etiquette>
    </Figure>
  );
}

/** Barres à deux forces : le tirant est tendu, le buton (ou bracon) est comprimé ; l'effort suit l'axe de la barre. */
export function TirantButon() {
  const barre = (y: number, tendue: boolean) => (
    <g>
      <line x1={150} y1={y} x2={470} y2={y} stroke={tendue ? BLEU : ROUGE} strokeWidth={7} />
      {[150, 470].map((x) => (
        <circle key={x} cx={x} cy={y} r={7} fill="var(--color-papier)" className="t-fort" />
      ))}
      {tendue ? (
        <>
          <Fleche x1={140} y1={y} x2={80} y2={y} couleur={BLEU} epaisseur={3} tete={11} />
          <Fleche x1={480} y1={y} x2={540} y2={y} couleur={BLEU} epaisseur={3} tete={11} />
        </>
      ) : (
        <>
          <Fleche x1={80} y1={y} x2={140} y2={y} couleur={ROUGE} epaisseur={3} tete={11} />
          <Fleche x1={540} y1={y} x2={480} y2={y} couleur={ROUGE} epaisseur={3} tete={11} />
        </>
      )}
      <Etiquette x={310} y={y - 14} ancre="middle" taille={12.5} gras couleur={tendue ? BLEU : ROUGE}>
        {tendue ? 'tirant : tendu (traction)' : 'buton, bracon, étai : comprimé'}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="Deux barres articulées à leurs extrémités et chargées seulement à leurs bouts : les deux forces sont égales, opposées et portées par l'axe de la barre. Le tirant est tiré (traction), le buton est poussé (compression)." largeur={620} hauteur={176}>
      {barre(56, true)}
      {barre(126, false)}
      <Etiquette x={310} y={168} ancre="middle" taille={11} classe="etiquette">
        deux forces égales, opposées, sur la même droite : l’axe de la barre
      </Etiquette>
    </Figure>
  );
}

/** La marquise isolée : bilan complet, dont la réaction horizontale H_A que l'on oublie souvent. */
export function MarquiseBilan({ T, HA, VA, alpha }: { T: number; HA: number; VA: number; alpha: number }) {
  const xA = 120;
  const xB = 430;
  const y = 150;
  const a = (alpha * Math.PI) / 180;
  return (
    <Figure alt={`Marquise isolée : charge répartie et charge en bout, effort du tirant T = ${n2(T)} kN incliné à ${nombre(alpha, 0)}°, réaction verticale V_A = ${n2(VA)} kN et réaction horizontale H_A = ${n2(HA)} kN, souvent oubliée : le tirant tire la marquise vers le mur, le mur la repousse.`} largeur={620} hauteur={252}>
      <Hachures prefixe="mqb" types={['maconnerie']} />
      <rect x={60} y={20} width={44} height={200} fill={hachure('mqb', 'maconnerie')} className="t-moyen" opacity={0.6} />
      <line x1={xA} y1={y} x2={xB} y2={y} stroke={TRAIT} strokeWidth={6} />
      <ChargeRepartie x1={xA + 6} x2={xB} y={y - 4} hauteur={24} />
      <Fleche x1={xB} y1={y + 6} x2={xB} y2={y + 56} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Etiquette x={xB + 8} y={y + 50} taille={12} gras couleur={ROUGE}>
        P
      </Etiquette>
      <Fleche x1={xB} y1={y} x2={xB - 110 * Math.cos(a)} y2={y - 110 * Math.sin(a)} couleur={BLEU} epaisseur={3} tete={11} />
      <Etiquette x={xB - 110 * Math.cos(a) - 8} y={y - 110 * Math.sin(a) - 6} ancre="end" taille={12.5} gras couleur={BLEU}>
        T = {n2(T)} kN
      </Etiquette>
      <Fleche x1={xA} y1={y + 78} x2={xA} y2={y + 6} couleur={VERT} epaisseur={3} tete={10} />
      <Etiquette x={xA + 8} y={y + 72} taille={12.5} gras couleur={VERT}>
        VA = {n2(VA)} kN
      </Etiquette>
      <Fleche x1={xA + 4} y1={y + 24} x2={xA + 64} y2={y + 24} couleur={VERT} epaisseur={3} tete={10} />
      <ellipse cx={xA + 34} cy={y + 24} rx={48} ry={18} fill="none" stroke={ROUGE} strokeWidth={1.8} strokeDasharray="5 4" />
      <Etiquette x={xA + 90} y={y + 30} taille={12.5} gras couleur={VERT}>
        HA = {n2(HA)} kN
      </Etiquette>
      <Etiquette x={xA + 90} y={y + 48} taille={11.5} couleur={ROUGE}>
        souvent oubliée
      </Etiquette>
      <circle cx={xA} cy={y} r={6} fill="var(--color-papier)" className="t-fort" />
      <Etiquette x={xA + 4} y={y - 34} taille={12.5} gras>
        A
      </Etiquette>
      <Etiquette x={xB + 8} y={y - 10} taille={12.5} gras>
        B
      </Etiquette>
    </Figure>
  );
}

/** Le même auvent avec un tirant plus ou moins couché : plus l'angle est petit, plus l'effort T est grand. */
export function AngleTirant({ L, cas }: { L: number; cas: ReadonlyArray<{ alpha: number; T: number }> }) {
  const xA = 100;
  const lg = 130;
  const xB = xA + lg;
  const y = 236;
  const couleurs = [VERT, BLEU, ROUGE];
  const tries = [...cas].sort((a, b) => b.alpha - a.alpha);
  return (
    <Figure alt={`Marquise de ${n1(L)} m avec trois inclinaisons de tirant : ${tries.map((c) => `${nombre(c.alpha, 0)}° : T = ${n2(c.T)} kN`).join(' ; ')}. Plus le tirant est couché, plus il est sollicité.`} largeur={620} hauteur={268}>
      <Hachures prefixe="agt" types={['maconnerie']} />
      <rect x={60} y={14} width={40} height={240} fill={hachure('agt', 'maconnerie')} className="t-moyen" />
      <line x1={xA} y1={y} x2={xB} y2={y} stroke={TRAIT} strokeWidth={6} />
      <circle cx={xA} cy={y} r={5} fill="var(--color-papier)" className="t-fort" />
      {tries.map((c, i) => {
        const hy = lg * Math.tan((c.alpha * Math.PI) / 180);
        return (
          <g key={c.alpha}>
            <line x1={xB} y1={y} x2={xA} y2={y - hy} stroke={couleurs[i % 3]} strokeWidth={2.6} />
            <circle cx={xA} cy={y - hy} r={4} fill={couleurs[i % 3]} />
          </g>
        );
      })}
      <Etiquette x={xB + 8} y={y + 4} taille={12} gras>
        B
      </Etiquette>
      <rect x={300} y={70} width={300} height={34 + tries.length * 26} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={314} y={94} taille={12.5} gras>
        effort dans le tirant
      </Etiquette>
      {tries.map((c, i) => (
        <Etiquette key={c.alpha} x={314} y={122 + i * 26} taille={12.5} gras couleur={couleurs[i % 3]}>
          α = {nombre(c.alpha, 0)}° : T = {n2(c.T)} kN
        </Etiquette>
      ))}
      <Etiquette x={300} y={226} taille={11.5}>
        tirant couché = effort fort : on remonte l’ancrage
      </Etiquette>
    </Figure>
  );
}

/** Étais et butons : barres à deux forces, comprimées, sensibles au flambement. */
export function EtaisButons() {
  return (
    <Figure alt="À gauche, une fouille blindée : les butons horizontaux, coincés entre les blindages, sont comprimés par la poussée des terres. À droite, un coffrage de dalle porté par des étais verticaux, comprimés par le poids du béton frais. Barres à deux forces, à vérifier au flambement." largeur={620} hauteur={226}>
      <Hachures prefixe="etb" types={['terre', 'ba']} />
      <rect x={20} y={40} width={70} height={170} fill={hachure('etb', 'terre')} stroke="none" />
      <rect x={210} y={40} width={70} height={170} fill={hachure('etb', 'terre')} stroke="none" />
      <rect x={90} y={40} width={8} height={170} fill="var(--color-terre-clair)" stroke={TERRE} />
      <rect x={202} y={40} width={8} height={170} fill="var(--color-terre-clair)" stroke={TERRE} />
      {[80, 150].map((y) => (
        <g key={y}>
          <line x1={98} y1={y} x2={202} y2={y} stroke={ROUGE} strokeWidth={7} />
          <Fleche x1={60} y1={y + 18} x2={88} y2={y + 18} couleur={TERRE} epaisseur={2} tete={8} />
          <Fleche x1={240} y1={y + 18} x2={212} y2={y + 18} couleur={TERRE} epaisseur={2} tete={8} />
        </g>
      ))}
      <Etiquette x={150} y={30} ancre="middle" taille={12} gras>
        fouille blindée
      </Etiquette>
      <Etiquette x={150} y={72} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        butons
      </Etiquette>
      <rect x={350} y={60} width={240} height={18} fill={hachure('etb', 'ba')} className="t-moyen" />
      <rect x={346} y={78} width={248} height={6} fill="var(--color-terre-clair)" stroke={TERRE} />
      {[380, 470, 560].map((x) => (
        <g key={x}>
          <line x1={x} y1={84} x2={x} y2={200} stroke={ROUGE} strokeWidth={6} />
          <rect x={x - 12} y={200} width={24} height={6} fill={TRAIT} />
        </g>
      ))}
      <line x1={330} y1={206} x2={610} y2={206} className="t-moyen" />
      <Etiquette x={470} y={30} ancre="middle" taille={12} gras>
        coffrage étayé
      </Etiquette>
      <Etiquette x={480} y={150} taille={11.5} gras couleur={ROUGE}>
        étais
      </Etiquette>
      <Etiquette x={310} y={222} ancre="middle" taille={11} classe="etiquette">
        barres à deux forces, comprimées : à vérifier au flambement (L2)
      </Etiquette>
    </Figure>
  );
}

/** Console triangulée : barre AB tendue, bracon CB comprimé, charge P en B (exercice 3). */
export function ConsoleTriangulee({ P, L, h, NAB, NCB }: { P: number; L: number; h: number; NAB: number; NCB: number }) {
  const k = 260 / L;
  const A = [110, 60] as const;
  const B = [A[0] + L * k, A[1]] as const;
  const C = [A[0], A[1] + h * k] as const;
  return (
    <Figure alt={`Console triangulée : barre horizontale AB de ${n2(L)} m articulée au mur en A, bracon CB articulé en C, ${n2(h)} m sous A ; charge de ${nombre(P, 0)} kN en B. effort dans AB : ${n2(NAB)} kN (traction) ; dans CB : ${n2(NCB)} kN (compression).`} largeur={620} hauteur={Math.max(C[1] + 40, 230)}>
      <Hachures prefixe="cst" types={['maconnerie']} />
      <rect x={60} y={20} width={44} height={C[1] + 10} fill={hachure('cst', 'maconnerie')} className="t-moyen" />
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={BLEU} strokeWidth={6} />
      <line x1={C[0]} y1={C[1]} x2={B[0]} y2={B[1]} stroke={ROUGE} strokeWidth={6} />
      {[A, B, C].map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={6} fill="var(--color-papier)" className="t-fort" />
      ))}
      <Fleche x1={B[0]} y1={B[1] + 8} x2={B[0]} y2={B[1] + 62} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={B[0] + 8} y={B[1] + 56} taille={12.5} gras couleur={ROUGE}>
        P = {nombre(P, 0)} kN
      </Etiquette>
      <Etiquette x={A[0] + 10} y={A[1] - 10} taille={12.5} gras>
        A
      </Etiquette>
      <Etiquette x={B[0] + 10} y={B[1] - 6} taille={12.5} gras>
        B
      </Etiquette>
      <Etiquette x={C[0] + 10} y={C[1] + 18} taille={12.5} gras>
        C
      </Etiquette>
      <Etiquette x={(A[0] + B[0]) / 2} y={A[1] - 12} ancre="middle" taille={12.5} gras couleur={BLEU}>
        N<tspan dy={4} fontSize={10}>AB</tspan>
        <tspan dy={-4}> = {n1(NAB)} kN (traction)</tspan>
      </Etiquette>
      <Etiquette x={(C[0] + B[0]) / 2 + 16} y={(C[1] + B[1]) / 2 + 26} taille={12.5} gras couleur={ROUGE}>
        N<tspan dy={4} fontSize={10}>CB</tspan>
        <tspan dy={-4}> = {n2(NCB)} kN (compression)</tspan>
      </Etiquette>
      <Cote x1={A[0]} y1={C[1] + 26} x2={B[0]} y2={C[1] + 26} decalage={0} texte={`${n2(L)} m`} />
      <Cote x1={B[0] + 70} y1={C[1]} x2={B[0] + 70} y2={A[1]} decalage={0} texte={`${n2(h)} m`} />
    </Figure>
  );
}
