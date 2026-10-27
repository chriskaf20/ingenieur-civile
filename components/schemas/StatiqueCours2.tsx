// Schémas de compréhension du module L1.3, leçons 5 à 8 : liaisons, réactions, hyperstaticité, treillis (nœuds).
// Code couleur du module : actions en rouge, réactions en vert, géométrie en noir, traction et repères en bleu.
import { Cote } from '@/components/drawing/Cote';
import { ArcMoment, Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { AppuiDouble, AppuiSimple, ChargeRepartie, Encastrement } from '@/components/drawing/Mecanique';
import { reactionsAppuis } from '@/lib/calc/statique';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';
const TERRE = 'var(--color-terre)';
const TRAIT = 'var(--trait)';
const GRIS = 'var(--color-beton)';
const n2 = (x: number) => nombre(x, 2);

/** Petite rotule (cercle creux). */
function Rotule({ x, y, r = 5.5 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill="var(--color-papier)" className="t-fort" />;
}

// ---------- L1.3.5 : liaisons et appuis ----------

/** Une planche posée, clouée ou scellée : chaque manière de la tenir empêche certains mouvements. */
export function PlancheTenue() {
  const w = 200;
  return (
    <Figure alt="Trois planches. Posée sur deux briques : elle peut glisser et basculer. Clouée d'un côté : elle ne glisse plus mais peut tourner autour du clou. Scellée dans un mur : elle ne peut ni glisser ni tourner. Chaque mouvement empêché correspond à une réaction." largeur={620} hauteur={214}>
      <Hachures prefixe="plt" types={['maconnerie']} />
      {['posée', 'clouée', 'scellée'].map((t, i) => (
        <Etiquette key={t} x={10 + i * (w + 5) + w / 2} y={22} ancre="middle" taille={12.5} gras>
          {t}
        </Etiquette>
      ))}
      {/* posée */}
      <rect x={30} y={120} width={150} height={10} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
      <rect x={42} y={130} width={22} height={22} fill={hachure('plt', 'maconnerie')} className="t-fin" />
      <rect x={146} y={130} width={22} height={22} fill={hachure('plt', 'maconnerie')} className="t-fin" />
      <Fleche x1={70} y1={102} x2={140} y2={102} couleur={VERT} epaisseur={1.8} tete={8} double pointilles />
      <ArcMoment cx={157} cy={120} r={40} a0={150} a1={100} couleur={VERT} epaisseur={1.8} />
      <Etiquette x={110} y={182} ancre="middle" taille={11.5} couleur={VERT}>
        glisse et bascule
      </Etiquette>
      {/* clouée */}
      <rect x={235} y={120} width={150} height={10} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
      <rect x={247} y={130} width={22} height={22} fill={hachure('plt', 'maconnerie')} className="t-fin" />
      <circle cx={258} cy={125} r={4} fill={TRAIT} />
      <ArcMoment cx={258} cy={125} r={44} a0={40} a1={-10} couleur={VERT} epaisseur={1.8} />
      <Etiquette x={315} y={182} ancre="middle" taille={11.5} couleur={VERT}>
        tourne autour du clou
      </Etiquette>
      {/* scellée */}
      <rect x={438} y={70} width={34} height={110} fill={hachure('plt', 'maconnerie')} className="t-moyen" />
      <rect x={452} y={120} width={140} height={10} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
      <Etiquette x={520} y={182} ancre="middle" taille={11.5} couleur={ROUGE}>
        ni glisse, ni tourne
      </Etiquette>
      <Etiquette x={310} y={206} ancre="middle" taille={11.5} gras>
        à chaque mouvement empêché correspond une réaction
      </Etiquette>
    </Figure>
  );
}

/** Les degrés de liberté d'un solide plan et les réactions des liaisons de base (et de la rotule intérieure si demandé). */
export function SymbolesLiaisons({ rotule = false, prefixe = 'sli' }: { rotule?: boolean; prefixe?: string }) {
  const n = rotule ? 5 : 4;
  const w = 616 / n;
  const yb = 104;
  const panneau = (i: number, titre: string, compte: string, contenu: React.ReactNode) => (
    <g key={titre}>
      <rect x={2 + i * w} y={6} width={w - 6} height={182} rx={8} fill="var(--color-papier)" className="t-fin" />
      <Etiquette x={2 + i * w + (w - 6) / 2} y={26} ancre="middle" taille={11.5} gras>
        {titre}
      </Etiquette>
      {contenu}
      <Etiquette x={2 + i * w + (w - 6) / 2} y={178} ancre="middle" taille={12} gras couleur={i === 0 ? BLEU : VERT}>
        {compte}
      </Etiquette>
    </g>
  );
  const c = (i: number) => 2 + i * w + (w - 6) / 2;
  const poutre = (i: number, dx = 0) => <line x1={c(i) - 50 + dx} y1={yb} x2={c(i) + 34 + dx} y2={yb} stroke={TRAIT} strokeWidth={5} />;
  return (
    <Figure alt={`Un solide libre dans le plan a 3 degrés de liberté (deux translations, une rotation). Un appui simple empêche une translation : 1 réaction. Une articulation empêche deux translations : 2 réactions, H et V. Un encastrement empêche tout : 3 réactions, H, V et un moment M.${rotule ? ' Une rotule entre deux parties transmet H et V : 2 inconnues.' : ''}`} largeur={620} hauteur={194}>
      <Hachures prefixe={prefixe} types={['terre', 'ba']} />
      {panneau(
        0,
        'solide libre',
        '3 degrés de liberté',
        <g>
          <rect x={c(0) - 26} y={yb - 18} width={44} height={30} fill="var(--color-beton-clair)" className="t-moyen" />
          <Fleche x1={c(0) + 22} y1={yb - 3} x2={c(0) + 58} y2={yb - 3} couleur={BLEU} epaisseur={2} tete={8} />
          <Fleche x1={c(0) - 4} y1={yb - 22} x2={c(0) - 4} y2={yb - 58} couleur={BLEU} epaisseur={2} tete={8} />
          <ArcMoment cx={c(0) - 4} cy={yb - 3} r={36} a0={200} a1={150} couleur={BLEU} epaisseur={2} />
          <Etiquette x={c(0) + 40} y={yb - 10} taille={11} gras couleur={BLEU}>
            x
          </Etiquette>
          <Etiquette x={c(0) + 2} y={yb - 50} taille={11} gras couleur={BLEU}>
            y
          </Etiquette>
          <Etiquette x={c(0) - 50} y={yb - 26} taille={11} gras couleur={BLEU}>
            θ
          </Etiquette>
        </g>,
      )}
      {panneau(
        1,
        'appui simple',
        '1 réaction',
        <g>
          {poutre(1)}
          <AppuiSimple x={c(1)} y={yb + 3} t={11} />
          <Fleche x1={c(1) + 22} y1={yb + 54} x2={c(1) + 22} y2={yb + 6} couleur={VERT} epaisseur={2.6} tete={9} />
          <Etiquette x={c(1) + 28} y={yb + 48} taille={11.5} gras couleur={VERT}>
            R
          </Etiquette>
        </g>,
      )}
      {panneau(
        2,
        'articulation',
        '2 réactions',
        <g>
          {poutre(2)}
          <AppuiDouble x={c(2)} y={yb + 3} t={11} prefixe={prefixe} />
          <Fleche x1={c(2) + 22} y1={yb + 54} x2={c(2) + 22} y2={yb + 6} couleur={VERT} epaisseur={2.6} tete={9} />
          <Etiquette x={c(2) + 28} y={yb + 48} taille={11.5} gras couleur={VERT}>
            V
          </Etiquette>
          <Fleche x1={c(2) - 52} y1={yb - 14} x2={c(2) - 8} y2={yb - 14} couleur={VERT} epaisseur={2.6} tete={9} />
          <Etiquette x={c(2) - 48} y={yb - 22} taille={11.5} gras couleur={VERT}>
            H
          </Etiquette>
        </g>,
      )}
      {panneau(
        3,
        'encastrement',
        '3 réactions',
        <g>
          <line x1={c(3) - 34} y1={yb} x2={c(3) + 50} y2={yb} stroke={TRAIT} strokeWidth={5} />
          <Encastrement x={c(3) - 34} y={yb} hauteur={44} cote="gauche" prefixe={prefixe} />
          <Fleche x1={c(3) - 14} y1={yb + 56} x2={c(3) - 14} y2={yb + 6} couleur={VERT} epaisseur={2.6} tete={9} />
          <Etiquette x={c(3) - 8} y={yb + 50} taille={11.5} gras couleur={VERT}>
            V
          </Etiquette>
          <Fleche x1={c(3) + 24} y1={yb - 14} x2={c(3) - 22} y2={yb - 14} couleur={VERT} epaisseur={2.6} tete={9} />
          <Etiquette x={c(3) + 26} y={yb - 10} taille={11.5} gras couleur={VERT}>
            H
          </Etiquette>
          <ArcMoment cx={c(3) - 34} cy={yb} r={30} a0={60} a1={-30} couleur={VERT} epaisseur={2.2} />
          <Etiquette x={c(3) + 4} y={yb - 40} taille={11.5} gras couleur={VERT}>
            M
          </Etiquette>
        </g>,
      )}
      {rotule
        ? panneau(
            4,
            'rotule intérieure',
            '2 inconnues',
            <g>
              <line x1={c(4) - 50} y1={yb} x2={c(4) - 6} y2={yb} stroke={TRAIT} strokeWidth={5} />
              <line x1={c(4) + 6} y1={yb} x2={c(4) + 50} y2={yb} stroke={TRAIT} strokeWidth={5} />
              <Rotule x={c(4)} y={yb} r={6} />
              <Fleche x1={c(4) - 8} y1={yb + 50} x2={c(4) - 8} y2={yb + 10} couleur={BLEU} epaisseur={2.2} tete={8} />
              <Fleche x1={c(4) + 8} y1={yb - 50} x2={c(4) + 8} y2={yb - 10} couleur={BLEU} epaisseur={2.2} tete={8} />
              <Etiquette x={c(4)} y={yb - 62} ancre="middle" taille={11} couleur={BLEU}>
                H et V transmis
              </Etiquette>
            </g>,
          )
        : null}
    </Figure>
  );
}

/** Du détail construit au modèle : poutre posée sur un mur, pied de poteau à deux tiges, poteau coulé avec sa semelle. */
export function DetailVersModele() {
  const w = 206;
  const ym = 196;
  return (
    <Figure alt="Trois détails réels et leur modèle. Une poutre posée sur un mur en maçonnerie peut tourner : appui simple ou articulation. Un pied de poteau métallique fixé par deux tiges proches de son axe : articulation. Un poteau en béton armé coulé avec sa semelle sur un bon sol : encastrement." largeur={620} hauteur={252}>
      <Hachures prefixe="dvm" types={['maconnerie', 'ba', 'terre']} />
      {['poutre posée sur un mur', 'pied de poteau à 2 tiges', 'poteau coulé avec semelle'].map((t, i) => (
        <Etiquette key={t} x={4 + i * w + w / 2} y={20} ancre="middle" taille={11.5} gras>
          {t}
        </Etiquette>
      ))}
      {/* 1 : poutre sur mur */}
      <rect x={40} y={86} width={36} height={70} fill={hachure('dvm', 'maconnerie')} className="t-moyen" />
      <rect x={40} y={70} width={150} height={16} fill="var(--color-beton-clair)" className="t-moyen" />
      <ArcMoment cx={76} cy={78} r={30} a0={40} a1={-15} couleur={BLEU} epaisseur={1.8} />
      {/* 2 : pied de poteau */}
      <rect x={248} y={130} width={120} height={26} fill={hachure('dvm', 'ba')} className="t-moyen" />
      <rect x={278} y={124} width={60} height={6} fill="var(--color-acier)" />
      <rect x={300} y={44} width={16} height={80} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.4} />
      {[300, 316].map((x) => (
        <line key={x} x1={x} y1={116} x2={x} y2={150} stroke={TRAIT} strokeWidth={2.4} />
      ))}
      <ArcMoment cx={308} cy={124} r={36} a0={120} a1={70} couleur={BLEU} epaisseur={1.8} />
      {/* 3 : poteau et semelle */}
      <rect x={430} y={150} width={166} height={10} fill={hachure('dvm', 'terre')} stroke="none" />
      <rect x={456} y={126} width={114} height={30} fill={hachure('dvm', 'ba')} className="t-moyen" />
      <rect x={498} y={40} width={30} height={86} fill={hachure('dvm', 'ba')} className="t-moyen" />
      {[504, 522].map((x) => (
        <line key={x} x1={x} y1={44} x2={x} y2={150} stroke={BLEU} strokeWidth={1.6} />
      ))}
      {[0, 1, 2].map((i) => (
        <Fleche key={i} x1={4 + i * w + w / 2} y1={166} x2={4 + i * w + w / 2} y2={184} couleur={TRAIT} epaisseur={1.6} tete={7} />
      ))}
      <line x1={50} y1={ym} x2={170} y2={ym} stroke={TRAIT} strokeWidth={5} />
      <AppuiDouble x={70} y={ym + 3} t={10} prefixe="dvm" />
      <Etiquette x={110} y={244} ancre="middle" taille={11.5} gras couleur={VERT}>
        appui simple ou articulation
      </Etiquette>
      <line x1={308} y1={ym - 4} x2={308} y2={ym - 40} stroke={TRAIT} strokeWidth={5} />
      <AppuiDouble x={308} y={ym} t={10} prefixe="dvm" />
      <Etiquette x={308} y={244} ancre="middle" taille={11.5} gras couleur={VERT}>
        articulation
      </Etiquette>
      <line x1={513} y1={ym + 12} x2={513} y2={ym - 40} stroke={TRAIT} strokeWidth={5} />
      <rect x={489} y={ym + 12} width={48} height={8} fill={hachure('dvm', 'ba')} />
      <line x1={489} y1={ym + 12} x2={537} y2={ym + 12} className="t-fort" />
      <Etiquette x={513} y={244} ancre="middle" taille={11.5} gras couleur={VERT}>
        encastrement
      </Etiquette>
    </Figure>
  );
}

/** La même poutre sous charge uniforme, articulée ou encastrée : les moments ne sont pas répartis pareil. */
export function ArticuleOuEncastre() {
  const lg = 230;
  const yb = 70;
  const Mmax = 46; // moment maximal de la poutre articulée, en pixels
  const courbe = (x0: number, decal: number) =>
    Array.from({ length: 41 }, (_, i) => {
      const t = i / 40;
      return [x0 + t * lg, yb + 44 + (4 * t * (1 - t) - decal) * Mmax] as const;
    });
  const dessin = (x0: number, encastre: boolean) => {
    const decal = encastre ? 2 / 3 : 0;
    const pts = courbe(x0, decal);
    const y0 = yb + 44;
    return (
      <g>
        <line x1={x0} y1={yb} x2={x0 + lg} y2={yb} stroke={TRAIT} strokeWidth={5} />
        <ChargeRepartie x1={x0} x2={x0 + lg} y={yb - 4} hauteur={22} />
        {encastre ? (
          <>
            <Encastrement x={x0} y={yb} hauteur={40} cote="gauche" prefixe="aoe" />
            <Encastrement x={x0 + lg} y={yb} hauteur={40} cote="droite" prefixe="aoe" />
          </>
        ) : (
          <>
            <AppuiDouble x={x0} y={yb + 3} t={10} prefixe="aoe" />
            <AppuiSimple x={x0 + lg} y={yb + 3} t={10} />
          </>
        )}
        <line x1={x0} y1={y0} x2={x0 + lg} y2={y0} className="t-fin" />
        <polygon points={points([[x0, y0], ...pts, [x0 + lg, y0]])} fill={BLEU} fillOpacity={0.15} stroke={BLEU} strokeWidth={1.8} />
      </g>
    );
  };
  return (
    <Figure alt="Deux poutres identiques sous charge uniforme et leurs moments fléchissants. Articulée à ses extrémités : moment nul aux appuis, maximal au milieu. Encastrée aux deux bouts : de forts moments de sens contraire aux appuis, et un moment plus faible au milieu. Le modèle choisi change les efforts." largeur={620} hauteur={218}>
      <Hachures prefixe="aoe" types={['terre', 'ba']} />
      {dessin(50, false)}
      {dessin(340, true)}
      <Etiquette x={165} y={192} ancre="middle" taille={11.5} gras>
        articulée : moment maximal au milieu
      </Etiquette>
      <Etiquette x={455} y={192} ancre="middle" taille={11.5} gras>
        encastrée : moments aux appuis, plus faible au milieu
      </Etiquette>
      <Etiquette x={310} y={212} ancre="middle" taille={10.5} classe="etiquette">
        en bleu : allure du moment fléchissant, côté de la fibre tendue (L2)
      </Etiquette>
    </Figure>
  );
}

/** Deux articulations bloquent la dilatation : des efforts horizontaux apparaissent ; une articulation et un appui simple la laissent libre. */
export function DeuxArticulations() {
  const ligne = (y: number, bloque: boolean) => (
    <g>
      <line x1={110} y1={y} x2={430} y2={y} stroke={TRAIT} strokeWidth={5} />
      <AppuiDouble x={110} y={y + 3} t={10} prefixe="dar" />
      {bloque ? <AppuiDouble x={430} y={y + 3} t={10} prefixe="dar" /> : <AppuiSimple x={430} y={y + 3} t={10} />}
      <Fleche x1={270} y1={y - 14} x2={330} y2={y - 14} couleur={BRIQUE} epaisseur={1.8} tete={7} />
      <Fleche x1={270} y1={y - 14} x2={210} y2={y - 14} couleur={BRIQUE} epaisseur={1.8} tete={7} />
      <Etiquette x={270} y={y - 22} ancre="middle" taille={11} couleur={BRIQUE}>
        dilatation (chaleur)
      </Etiquette>
      {bloque ? (
        <>
          <Fleche x1={60} y1={y - 4} x2={100} y2={y - 4} couleur={ROUGE} epaisseur={2.6} tete={9} />
          <Fleche x1={480} y1={y - 4} x2={440} y2={y - 4} couleur={ROUGE} epaisseur={2.6} tete={9} />
          <Etiquette x={500} y={y} taille={12} gras couleur={ROUGE}>
            ✗ efforts H parasites
          </Etiquette>
        </>
      ) : (
        <>
          <Fleche x1={440} y1={y + 32} x2={474} y2={y + 32} couleur={VERT} epaisseur={2.2} tete={8} />
          <Etiquette x={480} y={y + 36} taille={12} gras couleur={VERT}>
            ✓ s’allonge librement
          </Etiquette>
        </>
      )}
    </g>
  );
  return (
    <Figure alt="En haut, une poutre sur deux articulations : quand elle se dilate, les appuis l'en empêchent et des efforts horizontaux parasites apparaissent. En bas, une articulation et un appui simple : la poutre s'allonge librement." largeur={620} hauteur={190}>
      <Hachures prefixe="dar" types={['terre']} />
      {ligne(60, true)}
      {ligne(140, false)}
    </Figure>
  );
}

/** Balcon en porte-à-faux : la face supérieure est tendue près de l'encastrement, les aciers principaux sont en haut. */
export function BalconAciers() {
  const y = 96;
  return (
    <Figure alt="Coupe d'un balcon en porte-à-faux prolongeant la dalle : sous la charge, il plie vers le bas et sa face supérieure est tendue près de la façade. Les armatures principales sont en partie haute, ancrées dans la dalle ; des armatures posées en bas, ou écrasées pendant le bétonnage, ne servent à rien." largeur={620} hauteur={236}>
      <Hachures prefixe="bal" types={['ba', 'maconnerie']} />
      <rect x={300} y={y + 22} width={40} height={110} fill={hachure('bal', 'maconnerie')} className="t-moyen" />
      <rect x={60} y={y} width={500} height={22} fill="var(--color-beton-clair)" className="t-moyen" />
      <path d={`M340 ${y + 22} Q 460 ${y + 30} 560 ${y + 52}`} fill="none" stroke={GRIS} strokeWidth={1.6} strokeDasharray="6 4" />
      <line x1={120} y1={y + 5} x2={548} y2={y + 5} stroke={BLEU} strokeWidth={3} />
      <line x1={360} y1={y + 18} x2={548} y2={y + 18} stroke={ROUGE} strokeWidth={2} strokeDasharray="6 4" />
      <ChargeRepartie x1={344} x2={556} y={y - 4} hauteur={24} />
      <Etiquette x={60} y={y - 12} taille={11.5} classe="etiquette">
        dalle intérieure
      </Etiquette>
      <Etiquette x={320} y={y + 150} ancre="middle" taille={11.5}>
        façade
      </Etiquette>
      <Etiquette x={120} y={y + 46} taille={12} gras couleur={BLEU}>
        ✓ aciers en haut, ancrés dans la dalle
      </Etiquette>
      <Etiquette x={360} y={y + 112} taille={12} gras couleur={ROUGE}>
        ✗ aciers en bas : inutiles ici
      </Etiquette>
      <Etiquette x={330} y={y - 50} taille={11.5} gras couleur={BLEU}>
        balcon : face tendue en haut, près de la façade
      </Etiquette>
      <Etiquette x={560} y={y + 70} ancre="end" taille={11} classe="etiquette">
        déformée (exagérée)
      </Etiquette>
    </Figure>
  );
}

/** Pieds de poteaux métalliques : deux tiges proches de l'axe (articulation) ou platine large et tiges écartées (encastrement). */
export function PiedsDePoteau() {
  const pied = (cx: number, large: boolean) => (
    <g>
      <rect x={cx - 100} y={150} width={200} height={50} fill={hachure('pdp', 'ba')} className="t-moyen" />
      <rect x={cx - (large ? 70 : 30)} y={142} width={large ? 140 : 60} height={8} fill="var(--color-acier)" />
      <rect x={cx - 9} y={40} width={18} height={102} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.4} />
      {large ? (
        <>
          <polygon points={points([[cx - 9, 100], [cx - 60, 142], [cx - 9, 142]])} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.2} />
          <polygon points={points([[cx + 9, 100], [cx + 60, 142], [cx + 9, 142]])} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.2} />
        </>
      ) : null}
      {(large ? [-56, 56] : [-16, 16]).map((dx) => (
        <line key={dx} x1={cx + dx} y1={132} x2={cx + dx} y2={192} stroke={TRAIT} strokeWidth={3} />
      ))}
      {large ? (
        <ArcMoment cx={cx} cy={142} r={50} a0={60} a1={120} couleur={VERT} epaisseur={2.4} />
      ) : (
        <ArcMoment cx={cx} cy={142} r={50} a0={110} a1={70} couleur={BLEU} epaisseur={2} />
      )}
    </g>
  );
  return (
    <Figure alt="Deux pieds de poteaux métalliques. À gauche, une petite platine et deux tiges d'ancrage proches de l'axe : le poteau peut tourner, c'est une articulation. À droite, une platine large, des tiges écartées, des raidisseurs et un massif : la rotation est retenue, c'est un encastrement qui reprend un moment." largeur={620} hauteur={236}>
      <Hachures prefixe="pdp" types={['ba']} />
      {pied(150, false)}
      {pied(460, true)}
      <Etiquette x={150} y={24} ancre="middle" taille={12} gras>
        tiges proches de l’axe
      </Etiquette>
      <Etiquette x={460} y={24} ancre="middle" taille={12} gras>
        platine large, tiges écartées
      </Etiquette>
      <Etiquette x={150} y={224} ancre="middle" taille={12} gras couleur={BLEU}>
        il tourne : articulation
      </Etiquette>
      <Etiquette x={460} y={224} ancre="middle" taille={12} gras couleur={VERT}>
        rotation retenue : encastrement
      </Etiquette>
    </Figure>
  );
}

/** La même console avec la charge P au bout ou au milieu : le moment d'encastrement change (exercice 3). */
export function ConsoleDeuxCas({ L, q, P, cas }: { L: number; q: number; P: number; cas: ReadonlyArray<{ a: number; M: number; titre: string }> }) {
  const x0 = 120;
  const lg = 300;
  return (
    <Figure alt={`Console de ${n2(L)} m chargée par ${n2(q)} kN/m et une charge de ${n2(P)} kN : ${cas.map((c) => `${c.titre}, a = ${n2(c.a)} m, M = ${n2(c.M)} kN·m`).join(' ; ')}.`} largeur={620} hauteur={60 + cas.length * 100}>
      <Hachures prefixe="cdc" types={['ba']} />
      {cas.map((c, i) => {
        const y = 80 + i * 100;
        const xP = x0 + (c.a / L) * lg;
        return (
          <g key={c.titre}>
            <Encastrement x={x0} y={y} hauteur={44} cote="gauche" prefixe="cdc" />
            <line x1={x0} y1={y} x2={x0 + lg} y2={y} stroke={TRAIT} strokeWidth={6} />
            <ChargeRepartie x1={x0} x2={x0 + lg} y={y - 4} hauteur={18} />
            <Fleche x1={xP} y1={y - 58} x2={xP} y2={y - 4} couleur={ROUGE} epaisseur={3} tete={10} />
            <Etiquette x={xP + 8} y={y - 48} taille={12} gras couleur={ROUGE}>
              P
            </Etiquette>
            <Etiquette x={20} y={y + 4} taille={12} gras>
              {c.titre}
            </Etiquette>
            <Etiquette x={x0 + lg + 24} y={y + 4} taille={13} gras couleur={VERT}>
              M = {n2(c.M)} kN·m
            </Etiquette>
          </g>
        );
      })}
      <Etiquette x={x0} y={46 + cas.length * 100} taille={11} classe="etiquette">
        la charge la plus éloignée de l’encastrement donne le plus grand moment
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.6 : réactions d'appui ----------

/** Deux ouvriers portent un madrier chargé d'un seau : ce que chacun porte dépend de la position du seau. */
export function DeuxOuvriers() {
  const w = 206;
  const cas = [
    { a: 0.5, xB: 1, titre: 'seau au milieu' },
    { a: 0.82, xB: 1, titre: 'seau près de B' },
    { a: 1.25, xB: 1, titre: 'seau au-delà de B' },
  ];
  return (
    <Figure alt="Trois madriers portés par deux ouvriers A et B. Seau au milieu : chacun porte la moitié. Seau près de B : B porte davantage, A est soulagé. Seau au-delà de B : A doit retenir son bout vers le bas pour que le madrier ne bascule pas." largeur={620} hauteur={214}>
      {cas.map((c, i) => {
        const x0 = 22 + i * w;
        const k = 120;
        const X = (x: number) => x0 + 24 + x * k;
        const r = reactionsAppuis(0, c.xB, [{ type: 'ponctuelle', nom: 'seau', F: 1, a: c.a }]);
        const fin = Math.max(c.xB, c.a) + 0.12;
        const kR = 44;
        const fl = (x: number, R: number, nom: string) => (
          <g>
            <Fleche x1={X(x)} y1={R >= 0 ? 104 + R * kR : 104} x2={X(x)} y2={R >= 0 ? 104 : 104 - R * kR} couleur={R >= 0 ? VERT : ROUGE} epaisseur={2.8} tete={9} />
            <Etiquette x={X(x)} y={170} ancre="middle" taille={12} gras>
              {nom}
            </Etiquette>
          </g>
        );
        return (
          <g key={c.titre}>
            <Etiquette x={x0 + w / 2 - 10} y={22} ancre="middle" taille={12} gras>
              {c.titre}
            </Etiquette>
            <line x1={X(-0.1)} y1={100} x2={X(fin)} y2={100} stroke="var(--color-terre)" strokeWidth={6} />
            <polygon points={points([[X(c.a) - 10, 96], [X(c.a) + 10, 96], [X(c.a) + 13, 74], [X(c.a) - 13, 74]])} fill="var(--color-acier-clair)" stroke="var(--color-acier)" strokeWidth={1.2} />
            <Fleche x1={X(c.a)} y1={46} x2={X(c.a)} y2={70} couleur={ROUGE} epaisseur={2.4} tete={8} />
            {fl(0, r.RA, 'A')}
            {fl(c.xB, r.RB, 'B')}
          </g>
        );
      })}
      <Etiquette x={310} y={200} ancre="middle" taille={11.5}>
        flèches proportionnelles à ce que porte chaque ouvrier ; rouge : A retient vers le bas
      </Etiquette>
    </Figure>
  );
}

/** Résultantes des charges réparties usuelles : uniforme au milieu, triangle aux deux tiers depuis la pointe, trapèze en deux morceaux. */
export function ResultantesTypes() {
  const w = 200;
  const yb = 120;
  const lg = 150;
  const panneau = (i: number, titre: string, h1: number, h2: number, res: ReadonlyArray<{ t: number; texte: string }>, legende: string) => {
    const x0 = 22 + i * w;
    const X = (t: number) => x0 + t * lg;
    const nb = 6;
    return (
      <g key={titre}>
        <Etiquette x={x0 + lg / 2} y={20} ancre="middle" taille={12} gras>
          {titre}
        </Etiquette>
        <polygon points={points([[X(0), yb - 4], [X(0), yb - 4 - h1], [X(1), yb - 4 - h2], [X(1), yb - 4]])} fill={ROUGE} fillOpacity={0.1} stroke={ROUGE} strokeWidth={1.2} />
        {Array.from({ length: nb + 1 }, (_, k) => {
          const t = k / nb;
          const h = h1 + (h2 - h1) * t;
          return h > 7 ? <Fleche key={k} x1={X(t)} y1={yb - 4 - h} x2={X(t)} y2={yb - 4} couleur={ROUGE} epaisseur={1} tete={5} /> : null;
        })}
        {i === 2 ? <line x1={X(0)} y1={yb - 4 - h1} x2={X(1)} y2={yb - 4 - h1} stroke={ROUGE} strokeWidth={1} strokeDasharray="4 3" /> : null}
        <line x1={X(0)} y1={yb} x2={X(1)} y2={yb} stroke={TRAIT} strokeWidth={5} />
        {res.map((r) => (
          <g key={r.texte}>
            <Fleche x1={X(r.t)} y1={yb - 84} x2={X(r.t)} y2={yb - 6} couleur={BLEU} epaisseur={2.2} tete={8} pointilles />
            <Etiquette x={X(r.t) + 4} y={yb - 88} ancre="middle" taille={11} gras couleur={BLEU}>
              {r.texte}
            </Etiquette>
          </g>
        ))}
        <Cote x1={X(0)} y1={yb + 22} x2={X(1)} y2={yb + 22} decalage={0} texte="ℓ" />
        <Etiquette x={x0 + lg / 2} y={yb + 56} ancre="middle" taille={11}>
          {legende}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="Trois charges réparties et leurs résultantes. Uniforme q sur ℓ : R = q ℓ, au milieu. Triangulaire de 0 à q_max : R = q_max ℓ / 2, aux deux tiers depuis la pointe. Trapézoïdale : un rectangle plus un triangle, chacun avec sa résultante." largeur={620} hauteur={196}>
      {panneau(0, 'uniforme', 34, 34, [{ t: 0.5, texte: 'R = q ℓ' }], 'au milieu')}
      {panneau(1, 'triangulaire', 0, 46, [{ t: 2 / 3, texte: 'R = qmax ℓ / 2' }], 'aux 2/3 depuis la pointe')}
      {panneau(2, 'trapézoïdale', 18, 48, [{ t: 0.5, texte: 'R₁' }, { t: 2 / 3 + 0.12, texte: 'R₂' }], 'rectangle + triangle')}
    </Figure>
  );
}

/** Deux cas à connaître par cœur : charge ponctuelle P en a, charge uniforme q, sur une poutre à appuis d'extrémité. */
export function CasUsuelsReactions() {
  const w = 300;
  const panneau = (i: number, ponctuelle: boolean) => {
    const x0 = 30 + i * w;
    const lg = 220;
    const yb = 90;
    const xa = x0 + 0.3 * lg;
    return (
      <g key={i}>
        <line x1={x0} y1={yb} x2={x0 + lg} y2={yb} stroke={TRAIT} strokeWidth={5} />
        <AppuiDouble x={x0} y={yb + 3} t={9} prefixe="cur" />
        <AppuiSimple x={x0 + lg} y={yb + 3} t={9} />
        {ponctuelle ? (
          <>
            <Fleche x1={xa} y1={yb - 52} x2={xa} y2={yb - 4} couleur={ROUGE} epaisseur={2.8} tete={9} />
            <Etiquette x={xa + 8} y={yb - 40} taille={12} gras couleur={ROUGE}>
              P
            </Etiquette>
            <Cote x1={x0} y1={yb + 40} x2={xa} y2={yb + 40} decalage={0} texte="a" />
          </>
        ) : (
          <>
            <ChargeRepartie x1={x0} x2={x0 + lg} y={yb - 4} hauteur={22} n={8} />
            <Etiquette x={x0 + lg / 2} y={yb - 32} ancre="middle" taille={12} gras couleur={ROUGE}>
              q
            </Etiquette>
          </>
        )}
        <Cote x1={x0} y1={yb + 62} x2={x0 + lg} y2={yb + 62} decalage={0} texte="L" />
        <Etiquette x={x0 + lg / 2} y={yb + 98} ancre="middle" taille={12.5} gras couleur={VERT}>
          {ponctuelle ? 'RA = P (L − a) / L · RB = P a / L' : 'RA = RB = q L / 2'}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="Deux cas usuels pour une poutre de portée L sur deux appuis d'extrémité. Charge ponctuelle P à la distance a de A : R_A = P (L − a) / L et R_B = P a / L. Charge uniforme q : R_A = R_B = q L / 2." largeur={620} hauteur={200}>
      <Hachures prefixe="cur" types={['terre']} />
      {panneau(0, true)}
      {panneau(1, false)}
    </Figure>
  );
}

/** Superposition : les réactions sous q et P réunies sont la somme des réactions sous q seule et sous P seule. */
export function SuperpositionReactions() {
  const w = 200;
  const yb = 96;
  const cas = [
    { titre: 'q et P', q: true, P: true, nom: '' },
    { titre: 'q seule', q: true, P: false, nom: '₁' },
    { titre: 'P seule', q: false, P: true, nom: '₂' },
  ];
  const kR = 30;
  return (
    <Figure alt="Superposition : une poutre chargée par q et P a des réactions égales à la somme des réactions de la même poutre sous q seule et sous P seule. R_A = R_A1 + R_A2 et R_B = R_B1 + R_B2." largeur={620} hauteur={214}>
      <Hachures prefixe="spr" types={['terre']} />
      {cas.map((c, i) => {
        const x0 = 26 + i * w;
        const lg = 150;
        const X = (t: number) => x0 + t * lg;
        const charges = [
          ...(c.q ? [{ type: 'repartie' as const, nom: 'q', q1: 1, q2: 1, a: 0, b: 1 }] : []),
          ...(c.P ? [{ type: 'ponctuelle' as const, nom: 'P', F: 0.9, a: 0.72 }] : []),
        ];
        const r = reactionsAppuis(0, 1, charges);
        return (
          <g key={c.titre}>
            <Etiquette x={X(0.5)} y={20} ancre="middle" taille={12} gras>
              {c.titre}
            </Etiquette>
            {c.q ? <ChargeRepartie x1={X(0)} x2={X(1)} y={yb - 4} hauteur={20} n={6} /> : null}
            {c.P ? <Fleche x1={X(0.72)} y1={yb - 52} x2={X(0.72)} y2={yb - 4} couleur={ROUGE} epaisseur={2.6} tete={9} /> : null}
            {c.P ? (
              <Etiquette x={X(0.72) + 6} y={yb - 42} taille={11.5} gras couleur={ROUGE}>
                P
              </Etiquette>
            ) : null}
            {c.q ? (
              <Etiquette x={X(0.2)} y={yb - 30} ancre="middle" taille={11.5} gras couleur={ROUGE}>
                q
              </Etiquette>
            ) : null}
            <line x1={X(0)} y1={yb} x2={X(1)} y2={yb} stroke={TRAIT} strokeWidth={5} />
            <AppuiDouble x={X(0)} y={yb + 3} t={9} prefixe="spr" />
            <AppuiSimple x={X(1)} y={yb + 3} t={9} />
            {[
              { x: 0, R: r.RA, nom: `RA${c.nom}` },
              { x: 1, R: r.RB, nom: `RB${c.nom}` },
            ].map((ra) => (
              <g key={ra.nom}>
                <Fleche x1={X(ra.x)} y1={yb + 30 + ra.R * kR} x2={X(ra.x)} y2={yb + 26} couleur={VERT} epaisseur={2.6} tete={9} />
                <Etiquette x={X(ra.x) + (ra.x === 0 ? 8 : -8)} y={yb + 30 + ra.R * kR} ancre={ra.x === 0 ? 'start' : 'end'} taille={11.5} gras couleur={VERT}>
                  {ra.nom}
                </Etiquette>
              </g>
            ))}
            {i < 2 ? (
              <Etiquette x={X(1) + 26} y={yb + 6} ancre="middle" taille={18} gras>
                {i === 0 ? '=' : '+'}
              </Etiquette>
            ) : null}
          </g>
        );
      })}
      <Etiquette x={310} y={204} ancre="middle" taille={12.5} gras couleur={VERT}>
        RA = RA₁ + RA₂ · RB = RB₁ + RB₂
      </Etiquette>
    </Figure>
  );
}

/** La résultante d'une charge triangulaire est aux deux tiers depuis la pointe, pas au milieu. */
export function TriangleDeuxTiers({ L, qmax, R, x }: { L: number; qmax: number; R: number; x: number }) {
  const x0 = 80;
  const lg = 420;
  const yb = 130;
  const X = (v: number) => x0 + (v / L) * lg;
  return (
    <Figure alt={`Charge triangulaire de 0 à ${nombre(qmax, 0)} kN/m sur ${nombre(L, 0)} m : la résultante R = ${nombre(R, 0)} kN est à ${nombre(x, 0)} m de la pointe, aux deux tiers, et non au milieu.`} largeur={620} hauteur={206}>
      <polygon points={points([[X(0), yb - 4], [X(L), yb - 54], [X(L), yb - 4]])} fill={ROUGE} fillOpacity={0.1} stroke={ROUGE} strokeWidth={1.2} />
      {Array.from({ length: 9 }, (_, k) => {
        const t = (k + 1) / 9;
        return <Fleche key={k} x1={X(t * L)} y1={yb - 4 - 50 * t} x2={X(t * L)} y2={yb - 4} couleur={ROUGE} epaisseur={1} tete={5} />;
      })}
      <Etiquette x={X(L) + 8} y={yb - 50} taille={12} gras couleur={ROUGE}>
        {nombre(qmax, 0)} kN/m
      </Etiquette>
      <line x1={X(0)} y1={yb} x2={X(L)} y2={yb} stroke={TRAIT} strokeWidth={5} />
      <Fleche x1={X(x)} y1={yb - 104} x2={X(x)} y2={yb - 6} couleur={VERT} epaisseur={3} tete={10} />
      <Etiquette x={X(x) + 8} y={yb - 92} taille={12.5} gras couleur={VERT}>
        ✓ R = {nombre(R, 0)} kN
      </Etiquette>
      <Fleche x1={X(L / 2)} y1={yb - 104} x2={X(L / 2)} y2={yb - 6} couleur={ROUGE} epaisseur={2} tete={8} pointilles />
      <Etiquette x={X(L / 2) - 8} y={yb - 92} ancre="end" taille={12} gras couleur={ROUGE}>
        ✗ au milieu
      </Etiquette>
      <Cote x1={X(0)} y1={yb + 26} x2={X(x)} y2={yb + 26} decalage={0} texte={`${nombre(x, 0)} m = 2/3 de ${nombre(L, 0)} m`} />
      <Etiquette x={X(0)} y={yb + 18} ancre="middle" taille={11} classe="etiquette">
        pointe
      </Etiquette>
      <Etiquette x={x0} y={196} taille={11} classe="etiquette">
        la résultante se place du côté où la charge est la plus forte
      </Etiquette>
    </Figure>
  );
}

/** Grue mobile sur stabilisateurs : une charge levée loin de l'axe soulage les stabilisateurs opposés. */
export function GrueStabilisateurs() {
  const yS = 196;
  return (
    <Figure alt="Grue mobile sur ses stabilisateurs A et B : quand elle lève une charge loin de son axe, du côté de B, la réaction de B augmente et celle de A diminue. Si la réaction de A devient nulle, la grue bascule autour de B ; les tableaux de charge du constructeur reposent sur ce calcul." largeur={620} hauteur={236}>
      <Hachures prefixe="gru" types={['terre']} />
      <rect x={30} y={yS} width={560} height={12} fill={hachure('gru', 'terre')} stroke="none" />
      <line x1={30} y1={yS} x2={590} y2={yS} className="t-moyen" />
      <rect x={120} y={140} width={150} height={34} rx={4} fill="var(--color-brique-clair)" stroke={BRIQUE} strokeWidth={1.4} />
      <rect x={130} y={118} width={46} height={22} rx={3} fill="var(--color-brique-clair)" stroke={BRIQUE} strokeWidth={1.4} />
      {[146, 244].map((x) => (
        <circle key={x} cx={x} cy={180} r={12} fill={TRAIT} />
      ))}
      <line x1={110} y1={170} x2={90} y2={yS - 4} stroke={TRAIT} strokeWidth={4} />
      <line x1={280} y1={170} x2={300} y2={yS - 4} stroke={TRAIT} strokeWidth={4} />
      <rect x={78} y={yS - 6} width={24} height={6} fill={TRAIT} />
      <rect x={288} y={yS - 6} width={24} height={6} fill={TRAIT} />
      <line x1={220} y1={140} x2={500} y2={36} stroke="var(--color-acier)" strokeWidth={7} />
      <line x1={500} y1={36} x2={500} y2={118} className="t-fin" />
      <rect x={484} y={118} width={32} height={26} fill="var(--color-beton-clair)" className="t-moyen" />
      <Fleche x1={500} y1={148} x2={500} y2={186} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={508} y={176} taille={12} gras couleur={ROUGE}>
        charge
      </Etiquette>
      <Fleche x1={90} y1={232} x2={90} y2={214} couleur={VERT} epaisseur={2} tete={7} />
      <Fleche x1={300} y1={236} x2={300} y2={200} couleur={VERT} epaisseur={4} tete={11} />
      <Etiquette x={80} y={226} ancre="end" taille={12} gras couleur={VERT}>
        A : diminue
      </Etiquette>
      <Etiquette x={310} y={226} taille={12} gras couleur={VERT}>
        B : augmente
      </Etiquette>
      <Etiquette x={30} y={40} taille={11.5}>
        si A tombe à zéro,
      </Etiquette>
      <Etiquette x={30} y={58} taille={11.5}>
        la grue bascule autour de B
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.3.7 : isostatique ou hyperstatique ----------

/** Tabourets à deux, trois et quatre pieds, vus de dessus : mécanisme, isostatique, hyperstatique. */
export function Tabourets() {
  const w = 206;
  return (
    <Figure alt="Trois tabourets vus de dessus. Deux pieds : il tombe, c'est un mécanisme. Trois pieds : il tient sur n'importe quel sol, la charge se partage d'une seule façon, c'est isostatique. Quatre pieds sur un sol inégal : un pied flotte, la répartition dépend du sol et de la rigidité, c'est hyperstatique." largeur={620} hauteur={206}>
      {[
        { titre: '2 pieds', pieds: [[-50, 0], [50, 0]] as const, nature: 'il tombe : mécanisme', c: ROUGE },
        { titre: '3 pieds', pieds: [[-50, 30], [50, 30], [0, -52]] as const, nature: 'il tient : isostatique', c: VERT },
        { titre: '4 pieds', pieds: [[-46, 40], [46, 40], [46, -40], [-46, -40]] as const, nature: 'il boite : hyperstatique', c: BLEU },
      ].map((t, i) => {
        const cx = 103 + i * w;
        const cy = 100;
        return (
          <g key={t.titre}>
            <Etiquette x={cx} y={22} ancre="middle" taille={12.5} gras>
              {t.titre}
            </Etiquette>
            <circle cx={cx} cy={cy} r={68} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
            {t.pieds.length > 2 ? <polygon points={points(t.pieds.map(([x, y]) => [cx + x, cy + y] as const))} fill="none" stroke={t.c} strokeWidth={1.4} strokeDasharray="5 4" /> : <line x1={cx - 50} y1={cy} x2={cx + 50} y2={cy} stroke={t.c} strokeWidth={1.4} strokeDasharray="5 4" />}
            {t.pieds.map(([x, y], k) => (
              <circle key={k} cx={cx + x} cy={cy + y} r={8} fill={i === 2 && k === 3 ? 'var(--color-papier)' : TRAIT} stroke={i === 2 && k === 3 ? ROUGE : 'none'} strokeWidth={2} strokeDasharray={i === 2 && k === 3 ? '3 2' : undefined} />
            ))}
            {i === 2 ? (
              <Etiquette x={cx - 58} y={cy - 48} ancre="end" taille={11} couleur={ROUGE}>
                flotte
              </Etiquette>
            ) : null}
            {i === 0 ? <ArcMoment cx={cx} cy={cy} r={30} a0={120} a1={60} couleur={ROUGE} epaisseur={2} /> : null}
            <Etiquette x={cx} y={192} ancre="middle" taille={12} gras couleur={t.c}>
              {t.nature}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Liaisons mal disposées : trois appuis simples parallèles (glissement libre) ou trois réactions concourantes (rotation libre). */
export function LiaisonsMalDisposees() {
  return (
    <Figure alt="Deux structures avec trois réactions, donc h = 0 au comptage, mais instables. À gauche, une poutre sur trois appuis simples verticaux : rien n'empêche le glissement horizontal. À droite, une plaque tenue par trois biellettes dont les axes se coupent en un même point I : la plaque peut tourner autour de I." largeur={620} hauteur={214}>
      <Hachures prefixe="lmd" types={['terre']} />
      <Etiquette x={150} y={22} ancre="middle" taille={12} gras>
        3 réactions parallèles
      </Etiquette>
      <line x1={30} y1={100} x2={270} y2={100} stroke={TRAIT} strokeWidth={5} />
      {[40, 150, 260].map((x) => (
        <AppuiSimple key={x} x={x} y={103} t={10} />
      ))}
      <Fleche x1={100} y1={78} x2={200} y2={78} couleur={ROUGE} epaisseur={2.2} tete={9} double pointilles />
      <Etiquette x={150} y={68} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        glisse
      </Etiquette>
      <Etiquette x={150} y={168} ancre="middle" taille={11.5}>
        r = 3, h = 0… mais mécanisme
      </Etiquette>
      <line x1={312} y1={20} x2={312} y2={200} className="t-fin" strokeDasharray="3 4" />
      <Etiquette x={470} y={22} ancre="middle" taille={12} gras>
        3 réactions concourantes
      </Etiquette>
      <rect x={410} y={70} width={120} height={60} fill="var(--color-beton-clair)" className="t-moyen" />
      {[
        [410, 130, 360, 180],
        [530, 130, 580, 180],
        [470, 130, 470, 190],
      ].map(([x1, y1, x2, y2], k) => (
        <g key={k}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={TRAIT} strokeWidth={3} />
          <circle cx={x1} cy={y1} r={4} fill="var(--color-papier)" className="t-fort" />
          <circle cx={x2} cy={y2} r={4} fill="var(--color-papier)" className="t-fort" />
        </g>
      ))}
      {[
        [410, 130, 470, 70],
        [530, 130, 470, 70],
        [470, 130, 470, 70],
      ].map(([x1, y1, x2, y2], k) => (
        <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={BLEU} strokeWidth={1.2} strokeDasharray="5 4" />
      ))}
      <circle cx={470} cy={70} r={5} fill={BLEU} />
      <Etiquette x={480} y={62} taille={12} gras couleur={BLEU}>
        I
      </Etiquette>
      <ArcMoment cx={470} cy={70} r={40} a0={150} a1={30} couleur={ROUGE} epaisseur={2.2} />
      <Etiquette x={470} y={208} ancre="middle" taille={11.5}>
        rotation libre autour de I : mécanisme
      </Etiquette>
    </Figure>
  );
}

/** Poutre Gerber découpée à la rotule : deux parties, deux inconnues intérieures (H et V), h = r + i − 3p. */
export function DecoupeRotule() {
  const y1 = 76;
  const y2 = 186;
  return (
    <Figure alt="Poutre Gerber : une console encastrée à gauche, une rotule, puis une poutre posée sur un appui simple à droite. Découpée à la rotule, chaque partie reçoit les efforts H et V de l'autre, égaux et opposés : 2 inconnues intérieures. r = 4, i = 2, p = 2 : h = 4 + 2 − 6 = 0, isostatique." largeur={620} hauteur={258}>
      <Hachures prefixe="dro" types={['terre', 'ba']} />
      <Etiquette x={40} y={24} taille={12} gras>
        la poutre Gerber
      </Etiquette>
      <line x1={70} y1={y1} x2={350} y2={y1} stroke={TRAIT} strokeWidth={5} />
      <line x1={350} y1={y1} x2={560} y2={y1} stroke={TRAIT} strokeWidth={5} />
      <Encastrement x={70} y={y1} hauteur={44} cote="gauche" prefixe="dro" />
      <Rotule x={350} y={y1} r={6.5} />
      <AppuiSimple x={560} y={y1 + 3} t={11} />
      <Etiquette x={350} y={y1 - 14} ancre="middle" taille={11.5} couleur={BLEU}>
        rotule
      </Etiquette>
      <Etiquette x={40} y={134} taille={12} gras>
        découpée à la rotule
      </Etiquette>
      <line x1={70} y1={y2} x2={330} y2={y2} stroke={TRAIT} strokeWidth={5} />
      <Encastrement x={70} y={y2} hauteur={44} cote="gauche" prefixe="dro" />
      <line x1={390} y1={y2} x2={560} y2={y2} stroke={TRAIT} strokeWidth={5} />
      <AppuiSimple x={560} y={y2 + 3} t={11} />
      <Fleche x1={330} y1={y2 + 44} x2={330} y2={y2 + 6} couleur={BLEU} epaisseur={2.4} tete={8} />
      <Fleche x1={290} y1={y2 - 12} x2={326} y2={y2 - 12} couleur={BLEU} epaisseur={2.4} tete={8} />
      <Fleche x1={390} y1={y2 - 44} x2={390} y2={y2 - 6} couleur={BLEU} epaisseur={2.4} tete={8} />
      <Fleche x1={430} y1={y2 + 12} x2={394} y2={y2 + 12} couleur={BLEU} epaisseur={2.4} tete={8} />
      <Etiquette x={322} y={y2 + 40} ancre="end" taille={11.5} gras couleur={BLEU}>
        V
      </Etiquette>
      <Etiquette x={288} y={y2 - 18} taille={11.5} gras couleur={BLEU}>
        H
      </Etiquette>
      <Etiquette x={398} y={y2 - 36} taille={11.5} gras couleur={BLEU}>
        V
      </Etiquette>
      <Etiquette x={434} y={y2 + 16} taille={11.5} gras couleur={BLEU}>
        H
      </Etiquette>
      <Etiquette x={360} y={248} ancre="middle" taille={12} gras>
        r = 3 + 1 = 4 · i = 2 · p = 2 → h = 4 + 2 − 3 × 2 = 0
      </Etiquette>
    </Figure>
  );
}

/** Tassement d'appui : une poutre continue (hyperstatique) se fissure, deux travées indépendantes (isostatiques) suivent. */
export function TassementIsoHyper() {
  const ligne = (y: number, continue_: boolean) => {
    const xs = [70, 290, 510] as const;
    return (
      <g>
        {continue_ ? (
          <path d={`M${xs[0]} ${y} Q ${xs[1]! - 60} ${y + 26} ${xs[1]} ${y + 22} Q ${xs[1]! + 60} ${y + 26} ${xs[2]} ${y}`} fill="none" stroke={TRAIT} strokeWidth={5} />
        ) : (
          <>
            <line x1={xs[0]} y1={y} x2={xs[1]! - 4} y2={y + 22} stroke={TRAIT} strokeWidth={5} />
            <line x1={xs[1]! + 4} y1={y + 22} x2={xs[2]} y2={y} stroke={TRAIT} strokeWidth={5} />
          </>
        )}
        <line x1={xs[0]} y1={y} x2={xs[2]} y2={y} className="t-fin" strokeDasharray="5 4" />
        <AppuiDouble x={xs[0]} y={y + 3} t={10} prefixe="tih" />
        <AppuiSimple x={xs[1]} y={y + 25} t={10} />
        <AppuiSimple x={xs[2]} y={y + 3} t={10} />
        <Cote x1={xs[1]! + 34} y1={y + 3} x2={xs[1]! + 34} y2={y + 25} decalage={0} texte="Δ" />
        {continue_ ? (
          <>
            <path d={`M${xs[1]! - 6} ${y + 10} l 4 6 l -6 4 l 5 6`} fill="none" stroke={ROUGE} strokeWidth={2} />
            <path d={`M${xs[1]! - 120} ${y + 28} l 4 6 l -6 4 l 5 6`} fill="none" stroke={ROUGE} strokeWidth={2} />
          </>
        ) : null}
      </g>
    );
  };
  return (
    <Figure alt="L'appui central tasse de Δ. En haut, une poutre continue sur trois appuis, hyperstatique : elle est forcée de suivre, des efforts parasites apparaissent et elle se fissure. En bas, deux travées indépendantes, isostatiques : chacune bascule légèrement et suit le tassement sans effort supplémentaire." largeur={620} hauteur={232}>
      <Hachures prefixe="tih" types={['terre']} />
      <Etiquette x={40} y={24} taille={12} gras>
        poutre continue (hyperstatique)
      </Etiquette>
      {ligne(56, true)}
      <Etiquette x={600} y={92} ancre="end" taille={11.5} gras couleur={ROUGE}>
        efforts parasites, fissures
      </Etiquette>
      <Etiquette x={40} y={140} taille={12} gras>
        deux travées indépendantes (isostatique)
      </Etiquette>
      {ligne(170, false)}
      <Etiquette x={600} y={210} ancre="end" taille={11.5} gras couleur={VERT}>
        suit le tassement sans effort
      </Etiquette>
    </Figure>
  );
}

/** Un long bâtiment coupé par des joints de dilatation : chaque bloc se dilate librement. */
export function JointsDilatation() {
  const blocs = [40, 220, 400];
  return (
    <Figure alt="Plan d'un long bâtiment coupé en trois blocs par deux joints de dilatation : chaque bloc peut se dilater librement, sans efforts dus à la température." largeur={620} hauteur={150}>
      {blocs.map((x) => (
        <g key={x}>
          <rect x={x} y={40} width={170} height={70} fill="var(--color-beton-clair)" className="t-moyen" />
          <Fleche x1={x + 85} y1={75} x2={x + 140} y2={75} couleur={BRIQUE} epaisseur={1.6} tete={7} />
          <Fleche x1={x + 85} y1={75} x2={x + 30} y2={75} couleur={BRIQUE} epaisseur={1.6} tete={7} />
        </g>
      ))}
      {[215, 395].map((x) => (
        <g key={x}>
          <line x1={x} y1={30} x2={x} y2={120} stroke={BLEU} strokeWidth={2} strokeDasharray="6 4" />
          <Etiquette x={x} y={136} ancre="middle" taille={11.5} gras couleur={BLEU}>
            joint
          </Etiquette>
        </g>
      ))}
      <Etiquette x={40} y={24} taille={11.5}>
        chaque bloc se dilate librement : moins d’hyperstaticité, pas d’effort thermique
      </Etiquette>
    </Figure>
  );
}

/** Le treillis Pratt de la passerelle : tel quel, avec une diagonale de plus, avec une diagonale de moins (exercice 3). */
export function PrattVariantes({ degres }: { degres: readonly [number, number, number] }) {
  const w = 206;
  const a = 40;
  const h = 40;
  const panneau = (i: number, titre: string) => {
    const x0 = 22 + i * w;
    const y0 = 110;
    const X = (k: number) => x0 + k * a;
    const barres: Array<[number, number, number, number]> = [];
    for (let k = 0; k < 4; k++) barres.push([X(k), y0, X(k + 1), y0]);
    for (let k = 1; k < 3; k++) barres.push([X(k), y0 - h, X(k + 1), y0 - h]);
    for (let k = 1; k < 4; k++) barres.push([X(k), y0, X(k), y0 - h]);
    barres.push([X(0), y0, X(1), y0 - h], [X(4), y0, X(3), y0 - h], [X(1), y0 - h, X(2), y0], [X(3), y0 - h, X(2), y0]);
    const moins = i === 2;
    return (
      <g key={titre}>
        <Etiquette x={x0 + 2 * a} y={24} ancre="middle" taille={12} gras>
          {titre}
        </Etiquette>
        {barres.map(([x1, y1, x2, y2], k) => (moins && k === barres.length - 1 ? null : <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={TRAIT} strokeWidth={2.6} />))}
        {i === 1 ? <line x1={X(1)} y1={y0} x2={X(2)} y2={y0 - h} stroke={BLEU} strokeWidth={3} /> : null}
        {moins ? <polygon points={points([[X(2), y0], [X(3), y0], [X(3) + 12, y0 - h], [X(2) + 12, y0 - h]])} fill="none" stroke={ROUGE} strokeWidth={1.6} strokeDasharray="5 4" /> : null}
        <AppuiDouble x={X(0)} y={y0 + 3} t={8} prefixe="prv" />
        <AppuiSimple x={X(4)} y={y0 + 3} t={8} />
        <Etiquette x={x0 + 2 * a} y={156} ancre="middle" taille={12.5} gras couleur={degres[i]! === 0 ? VERT : degres[i]! > 0 ? BLEU : ROUGE}>
          h = {nombre(degres[i]!, 0)}
        </Etiquette>
        <Etiquette x={x0 + 2 * a} y={174} ancre="middle" taille={11}>
          {degres[i]! === 0 ? 'isostatique' : degres[i]! > 0 ? 'hyperstatique' : 'mécanisme : le panneau se déforme'}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt={`Treillis Pratt à 4 panneaux : tel quel, h = ${nombre(degres[0], 0)} (isostatique) ; avec une seconde diagonale dans un panneau, h = ${nombre(degres[1], 0)} (hyperstatique) ; avec une diagonale en moins, h = ${nombre(degres[2], 0)} : le panneau sans diagonale se déforme en parallélogramme, c'est un mécanisme.`} largeur={620} hauteur={186}>
      <Hachures prefixe="prv" types={['terre']} />
      {panneau(0, 'tel quel')}
      {panneau(1, '+ 1 diagonale')}
      {panneau(2, '− 1 diagonale')}
    </Figure>
  );
}

// ---------- L1.3.8 : treillis, méthode des nœuds ----------

/** Un carré articulé s'écrase en losange ; un triangle articulé ne se déforme pas. */
export function CarreTriangle() {
  return (
    <Figure alt="À gauche, quatre baguettes articulées en carré : poussé sur un coin, le carré s'écrase en losange sans qu'aucune baguette ne plie. À droite, trois baguettes en triangle : impossible de le déformer sans allonger ou casser une baguette. Un treillis est un assemblage de triangles." largeur={620} hauteur={206}>
      <polygon points={points([[70, 160], [190, 160], [190, 50], [70, 50]])} fill="none" stroke={TRAIT} strokeWidth={4} />
      <polygon points={points([[70, 160], [190, 160], [240, 60], [120, 60]])} fill="none" stroke={ROUGE} strokeWidth={2.4} strokeDasharray="7 4" />
      {[[70, 160], [190, 160], [190, 50], [70, 50]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill="var(--color-papier)" className="t-fort" />
      ))}
      <Fleche x1={20} y1={50} x2={64} y2={50} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={130} y={190} ancre="middle" taille={12} gras couleur={ROUGE}>
        ✗ le carré s’écrase en losange
      </Etiquette>
      <polygon points={points([[380, 160], [540, 160], [460, 50]])} fill={VERT} fillOpacity={0.08} stroke={TRAIT} strokeWidth={4} />
      {[[380, 160], [540, 160], [460, 50]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill="var(--color-papier)" className="t-fort" />
      ))}
      <Fleche x1={404} y1={50} x2={452} y2={50} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={460} y={190} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ le triangle reste un triangle
      </Etiquette>
      <Etiquette x={310} y={28} ancre="middle" taille={11.5} classe="etiquette">
        même poussée, mêmes articulations
      </Etiquette>
    </Figure>
  );
}

/** Lire le sens d'un effort à un nœud : une barre tendue tire le nœud (la flèche quitte le nœud), une barre comprimée le pousse. */
export function SensEffortNoeud() {
  const ligne = (y: number, tendue: boolean) => {
    const c = tendue ? BLEU : ROUGE;
    return (
      <g>
        <line x1={150} y1={y} x2={470} y2={y} stroke={GRIS} strokeWidth={10} opacity={0.35} />
        {[150, 470].map((x) => (
          <circle key={x} cx={x} cy={y} r={9} fill="var(--color-papier)" className="t-fort" />
        ))}
        {tendue ? (
          <>
            <Fleche x1={162} y1={y} x2={226} y2={y} couleur={c} epaisseur={3} tete={11} />
            <Fleche x1={458} y1={y} x2={394} y2={y} couleur={c} epaisseur={3} tete={11} />
          </>
        ) : (
          <>
            <Fleche x1={226} y1={y} x2={164} y2={y} couleur={c} epaisseur={3} tete={11} />
            <Fleche x1={394} y1={y} x2={456} y2={y} couleur={c} epaisseur={3} tete={11} />
          </>
        )}
        <Etiquette x={310} y={y - 16} ancre="middle" taille={12.5} gras couleur={c}>
          {tendue ? 'barre tendue (N > 0) : la flèche quitte le nœud' : 'barre comprimée (N < 0) : la flèche arrive sur le nœud'}
        </Etiquette>
        <Etiquette x={128} y={y + 4} ancre="end" taille={11.5}>
          nœud
        </Etiquette>
        <Etiquette x={492} y={y + 4} taille={11.5}>
          nœud
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="Effort d'une barre sur les nœuds qu'elle relie. Barre tendue : elle tire chaque nœud vers elle, la flèche dessinée au nœud part du nœud vers la barre, N positif. Barre comprimée : elle pousse les nœuds, la flèche arrive sur le nœud, N négatif." largeur={620} hauteur={176}>
      {ligne(60, true)}
      {ligne(136, false)}
    </Figure>
  );
}

/** Repérer les barres nulles à un nœud non chargé, et le montant central de la passerelle. */
export function BarresNulles() {
  const w = 206;
  const noeud = (x: number, y: number) => <circle cx={x} cy={y} r={7} fill="var(--color-papier)" className="t-fort" />;
  return (
    <Figure alt="Barres nulles à un nœud non chargé. Trois barres dont deux alignées : la troisième est nulle. Deux barres non alignées seulement : les deux sont nulles. Dans la passerelle Pratt, au nœud supérieur du milieu, les deux membrures sont alignées : le montant central est nul." largeur={620} hauteur={206}>
      <Etiquette x={103} y={22} ancre="middle" taille={11.5} gras>
        3 barres, 2 alignées
      </Etiquette>
      <line x1={26} y1={110} x2={180} y2={110} stroke={TRAIT} strokeWidth={4} />
      <line x1={103} y1={110} x2={150} y2={44} stroke={GRIS} strokeWidth={3} strokeDasharray="6 4" />
      {noeud(103, 110)}
      <Etiquette x={152} y={70} taille={12} gras couleur={GRIS}>
        N = 0
      </Etiquette>
      <Etiquette x={103} y={186} ancre="middle" taille={11}>
        la 3e barre est nulle
      </Etiquette>
      <Etiquette x={103 + w} y={22} ancre="middle" taille={11.5} gras>
        2 barres non alignées
      </Etiquette>
      <line x1={103 + w} y1={110} x2={40 + w} y2={110} stroke={GRIS} strokeWidth={3} strokeDasharray="6 4" />
      <line x1={103 + w} y1={110} x2={150 + w} y2={50} stroke={GRIS} strokeWidth={3} strokeDasharray="6 4" />
      {noeud(103 + w, 110)}
      <Etiquette x={103 + w} y={186} ancre="middle" taille={11}>
        les deux sont nulles
      </Etiquette>
      <Etiquette x={103 + 2 * w} y={22} ancre="middle" taille={11.5} gras>
        passerelle Pratt
      </Etiquette>
      {(() => {
        const x0 = 22 + 2 * w;
        const a = 40;
        const yb = 130;
        const yh = 80;
        const X = (k: number) => x0 + k * a;
        const lignes: Array<[number, number, number, number, boolean]> = [
          [X(0), yb, X(4), yb, false],
          [X(1), yh, X(3), yh, false],
          [X(1), yb, X(1), yh, false],
          [X(3), yb, X(3), yh, false],
          [X(2), yb, X(2), yh, true],
          [X(0), yb, X(1), yh, false],
          [X(4), yb, X(3), yh, false],
          [X(1), yh, X(2), yb, false],
          [X(3), yh, X(2), yb, false],
        ];
        return (
          <g>
            {lignes.map(([x1, y1, x2, y2, nul], k) => (
              <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={nul ? GRIS : TRAIT} strokeWidth={nul ? 3 : 2.4} strokeDasharray={nul ? '5 4' : undefined} />
            ))}
            <circle cx={X(2)} cy={yh} r={10} fill="none" stroke={BLEU} strokeWidth={2} />
            <Etiquette x={X(2)} y={yh - 16} ancre="middle" taille={11} gras couleur={BLEU}>
              nœud non chargé
            </Etiquette>
          </g>
        );
      })()}
      <Etiquette x={103 + 2 * w} y={186} ancre="middle" taille={11}>
        le montant central est nul
      </Etiquette>
    </Figure>
  );
}

/** Une charge entre deux nœuds fait fléchir la barre ; on la ramène aux nœuds par une pièce de pont ou une panne. */
export function ChargeEntreNoeuds() {
  return (
    <Figure alt="À gauche, une charge appliquée au milieu d'une barre de treillis : la barre fléchit, le modèle articulé ne s'applique plus tel quel. À droite, la charge est posée sur une pièce de pont, appuyée sur deux nœuds : elle arrive aux nœuds, la barre reste tendue ou comprimée sans fléchir." largeur={620} hauteur={196}>
      <line x1={40} y1={110} x2={260} y2={110} stroke={GRIS} strokeWidth={2} strokeDasharray="5 4" />
      <path d="M40 110 Q 150 150 260 110" fill="none" stroke={TRAIT} strokeWidth={4} />
      {[40, 260].map((x) => (
        <circle key={x} cx={x} cy={110} r={6} fill="var(--color-papier)" className="t-fort" />
      ))}
      <Fleche x1={150} y1={50} x2={150} y2={126} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={150} y={176} ancre="middle" taille={12} gras couleur={ROUGE}>
        ✗ la barre fléchit
      </Etiquette>
      <line x1={360} y1={130} x2={580} y2={130} stroke={TRAIT} strokeWidth={4} />
      {[360, 580].map((x) => (
        <circle key={x} cx={x} cy={130} r={6} fill="var(--color-papier)" className="t-fort" />
      ))}
      <rect x={352} y={94} width={236} height={14} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.2} />
      {[366, 574].map((x) => (
        <line key={x} x1={x} y1={108} x2={x} y2={124} stroke={TERRE} strokeWidth={3} />
      ))}
      <Fleche x1={470} y1={40} x2={470} y2={92} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={478} y={52} taille={11.5} gras>
        pièce de pont
      </Etiquette>
      <Etiquette x={470} y={176} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ la charge arrive aux nœuds
      </Etiquette>
    </Figure>
  );
}

/** Un échafaudage sans diagonales se déforme comme le carré articulé ; contreventé, il reste rigide. */
export function EchafaudageContreventement() {
  const cadre = (x0: number, diag: boolean) => (
    <g>
      {[0, 1, 2].map((e) => (
        <g key={e}>
          {[0, 80].map((dx) => (
            <line key={dx} x1={x0 + dx} y1={196 - e * 56} x2={x0 + dx} y2={140 - e * 56} stroke={TRAIT} strokeWidth={3} />
          ))}
          <line x1={x0} y1={140 - e * 56} x2={x0 + 80} y2={140 - e * 56} stroke={TRAIT} strokeWidth={3} />
          {diag ? <line x1={x0} y1={196 - e * 56} x2={x0 + 80} y2={140 - e * 56} stroke={BLEU} strokeWidth={2.6} /> : null}
        </g>
      ))}
    </g>
  );
  return (
    <Figure alt="À gauche, un échafaudage tubulaire sans diagonales : sous une poussée latérale, ses cadres se déforment en parallélogrammes et il s'écroule. À droite, le même échafaudage contreventé par des diagonales : il forme des triangles et reste rigide." largeur={620} hauteur={226}>
      {cadre(90, false)}
      <polygon points={points([[90, 196], [170, 196], [230, 28], [150, 28]])} fill="none" stroke={ROUGE} strokeWidth={2} strokeDasharray="7 4" />
      <Fleche x1={36} y1={40} x2={84} y2={40} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={130} y={218} ancre="middle" taille={12} gras couleur={ROUGE}>
        ✗ sans diagonales : il se couche
      </Etiquette>
      {cadre(400, true)}
      <Fleche x1={346} y1={40} x2={394} y2={40} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={440} y={218} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ contreventé : des triangles
      </Etiquette>
      <line x1={20} y1={196} x2={600} y2={196} className="t-moyen" />
    </Figure>
  );
}
