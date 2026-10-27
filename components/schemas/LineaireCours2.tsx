// Schémas de compréhension du module L1.4 (algèbre linéaire), leçons 5 à 7 et examen : changements de repère,
// valeurs propres, matrice de rigidité. Les valeurs numériques arrivent par les props (lib/calc/lineaire.ts).
import { Cote } from '@/components/drawing/Cote';
import { ArcMoment, Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { valeursPropres2 } from '@/lib/calc/lineaire';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';
const TERRE = 'var(--color-terre)';
const TRAIT = 'var(--trait)';
const GRIS = 'var(--color-beton)';
const rad = (d: number) => (d * Math.PI) / 180;

// ---------- L1.4.5 : applications linéaires, changement de repère ----------

/** La même force décrite dans deux repères : global (horizontal, vertical) et local (le long du versant). */
export function DeuxReperes() {
  const O = [250, 120] as const;
  const a = rad(30);
  const ux = [Math.cos(a), -Math.sin(a)] as const;
  const n = [-Math.sin(a), -Math.cos(a)] as const;
  const L = 90;
  const F = [0, 80] as const; // vers le bas (écran)
  const fPente = 80 * Math.sin(a);
  const fNorm = 80 * Math.cos(a);
  return (
    <Figure alt="Une charge verticale F sur un versant incliné. Dans le repère global, elle n'a qu'une composante verticale. Dans le repère local du versant, en bleu, elle a une composante le long de la pente et une composante perpendiculaire au versant. La force est la même ; seules ses composantes changent." largeur={620} hauteur={236}>
      <line x1={O[0] - 200 * ux[0]} y1={O[1] - 200 * ux[1] + 9} x2={O[0] + 200 * ux[0]} y2={O[1] + 200 * ux[1] + 9} stroke={TERRE} strokeWidth={6} opacity={0.7} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + 80} y2={O[1]} couleur={TRAIT} epaisseur={1.4} tete={7} texte="x" tx={O[0] + 84} ty={O[1] + 4} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] - 80} couleur={TRAIT} epaisseur={1.4} tete={7} texte="y" tx={O[0] + 4} ty={O[1] - 84} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + L * ux[0]} y2={O[1] + L * ux[1]} couleur={BLEU} epaisseur={1.8} tete={7} texte="x′" tx={O[0] + L * ux[0] + 4} ty={O[1] + L * ux[1] - 4} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + L * n[0]} y2={O[1] + L * n[1]} couleur={BLEU} epaisseur={1.8} tete={7} texte="y′" tx={O[0] + L * n[0] - 18} ty={O[1] + L * n[1]} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + F[0]} y2={O[1] + F[1]} couleur={ROUGE} epaisseur={3.2} tete={11} />
      <Etiquette x={O[0] + 8} y={O[1] + F[1]} taille={13} gras couleur={ROUGE}>
        F
      </Etiquette>
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] - fPente * ux[0]} y2={O[1] - fPente * ux[1]} couleur={BRIQUE} epaisseur={2} tete={8} pointilles />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] - fNorm * n[0]} y2={O[1] - fNorm * n[1]} couleur={BRIQUE} epaisseur={2} tete={8} pointilles />
      <Etiquette x={O[0] - fPente * ux[0] - 8} y={O[1] - fPente * ux[1] + 14} ancre="end" taille={11.5} gras couleur={BRIQUE}>
        le long de la pente
      </Etiquette>
      <Etiquette x={O[0] - fNorm * n[0] + 6} y={O[1] - fNorm * n[1] + 16} taille={11.5} gras couleur={BRIQUE}>
        perpendiculaire au versant
      </Etiquette>
      <ArcMoment cx={O[0]} cy={O[1]} r={46} a0={0} a1={30} couleur={TRAIT} epaisseur={1.2} />
      <Etiquette x={O[0] + 52} y={O[1] - 10} taille={12} gras>
        α
      </Etiquette>
      <rect x={430} y={40} width={176} height={74} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={442} y={64} taille={11.5} gras>
        noir : repère global
      </Etiquette>
      <Etiquette x={442} y={84} taille={11.5} gras couleur={BLEU}>
        bleu : repère local
      </Etiquette>
      <Etiquette x={442} y={104} taille={11.5}>
        même F, autres composantes
      </Etiquette>
    </Figure>
  );
}

/** Les colonnes d'une matrice sont les images des vecteurs de base : homothétie, projection, rotation. */
export function ImagesBase() {
  const w = 206;
  const k = 46;
  const panneau = (i: number, titre: string, A: readonly [readonly [number, number], readonly [number, number]], legende: string) => {
    const O = [40 + i * w, 150] as const;
    const P = (x: number, y: number) => [O[0] + x * k, O[1] - y * k] as const;
    const e1 = [A[0][0], A[1][0]] as const;
    const e2 = [A[0][1], A[1][1]] as const;
    return (
      <g key={titre}>
        <Etiquette x={O[0] + 60} y={24} ancre="middle" taille={12} gras>
          {titre}
        </Etiquette>
        <polygon points={points([P(0, 0), P(1, 0), P(1, 1), P(0, 1)])} fill="none" stroke={GRIS} strokeWidth={1.2} strokeDasharray="4 3" />
        <polygon points={points([P(0, 0), P(...e1), P(e1[0] + e2[0], e1[1] + e2[1]), P(...e2)])} fill={BLEU} fillOpacity={0.15} stroke={BLEU} strokeWidth={1.6} />
        <Fleche x1={O[0]} y1={O[1]} x2={P(...e1)[0]} y2={P(...e1)[1]} couleur={ROUGE} epaisseur={2.4} tete={8} />
        <Fleche x1={O[0]} y1={O[1]} x2={P(...e2)[0]} y2={P(...e2)[1]} couleur={VERT} epaisseur={2.4} tete={8} />
        <Etiquette x={O[0] + 60} y={196} ancre="middle" taille={11}>
          {legende}
        </Etiquette>
      </g>
    );
  };
  const c = Math.cos(rad(30));
  const s = Math.sin(rad(30));
  return (
    <Figure alt="Trois applications linéaires et l'image du carré unité. Homothétie de rapport 1,5 : tout est agrandi. Projection sur l'axe x : le carré s'aplatit sur un segment, la composante y est perdue. Rotation de 30° : le carré tourne sans changer de taille. Dans chaque cas, les colonnes de la matrice sont les images des deux vecteurs de base, en rouge et en vert." largeur={620} hauteur={206}>
      {panneau(0, 'homothétie (k = 1,5)', [[1.5, 0], [0, 1.5]], 'A = k I : tout est agrandi')}
      {panneau(1, 'projection sur x', [[1, 0], [0, 0]], 'det = 0 : y est perdu')}
      {panneau(2, 'rotation de 30°', [[c, -s], [s, c]], 'longueurs conservées')}
    </Figure>
  );
}

/** La matrice de rotation se lit sur le cercle : ses colonnes sont les images de (1 ; 0) et de (0 ; 1). */
export function RotationColonnes() {
  const O = [170, 130] as const;
  const r = 90;
  const t = rad(35);
  const P = (x: number, y: number) => [O[0] + x * r, O[1] - y * r] as const;
  return (
    <Figure alt="Cercle de rayon 1 : la rotation d'angle θ envoie (1 ; 0) sur (cos θ ; sin θ) et (0 ; 1) sur (−sin θ ; cos θ). Ces deux images sont les deux colonnes de R(θ). Elles restent de longueur 1 et perpendiculaires." largeur={620} hauteur={244}>
      <circle cx={O[0]} cy={O[1]} r={r} fill="none" stroke={GRIS} strokeWidth={1} strokeDasharray="4 4" />
      <Fleche x1={O[0]} y1={O[1]} x2={P(1, 0)[0]} y2={P(1, 0)[1]} couleur={GRIS} epaisseur={1.8} tete={8} />
      <Fleche x1={O[0]} y1={O[1]} x2={P(0, 1)[0]} y2={P(0, 1)[1]} couleur={GRIS} epaisseur={1.8} tete={8} />
      <Fleche x1={O[0]} y1={O[1]} x2={P(Math.cos(t), Math.sin(t))[0]} y2={P(Math.cos(t), Math.sin(t))[1]} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Fleche x1={O[0]} y1={O[1]} x2={P(-Math.sin(t), Math.cos(t))[0]} y2={P(-Math.sin(t), Math.cos(t))[1]} couleur={VERT} epaisseur={2.6} tete={9} />
      <ArcMoment cx={O[0]} cy={O[1]} r={36} a0={0} a1={35} couleur={TRAIT} epaisseur={1.2} />
      <Etiquette x={O[0] + 42} y={O[1] - 10} taille={12} gras>
        θ
      </Etiquette>
      <Etiquette x={P(Math.cos(t), Math.sin(t))[0] + 6} y={P(Math.cos(t), Math.sin(t))[1] - 4} taille={12} gras couleur={ROUGE}>
        (cos θ ; sin θ)
      </Etiquette>
      <Etiquette x={P(-Math.sin(t), Math.cos(t))[0] - 6} y={P(-Math.sin(t), Math.cos(t))[1] - 6} ancre="end" taille={12} gras couleur={VERT}>
        (−sin θ ; cos θ)
      </Etiquette>
      <Etiquette x={P(1, 0)[0] + 6} y={P(1, 0)[1] + 16} taille={11} couleur={GRIS}>
        (1 ; 0)
      </Etiquette>
      <rect x={350} y={60} width={256} height={110} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={362} y={86} taille={13} gras>
        R(θ) = (<tspan fill={ROUGE}>cos θ</tspan>  <tspan fill={VERT}>−sin θ</tspan> ;
      </Etiquette>
      <Etiquette x={428} y={108} taille={13} gras>
        <tspan fill={ROUGE}>sin θ</tspan>   <tspan fill={VERT}>cos θ</tspan>)
      </Etiquette>
      <Etiquette x={362} y={138} taille={11.5}>
        colonnes : images de (1 ; 0) et (0 ; 1)
      </Etiquette>
      <Etiquette x={362} y={156} taille={11.5}>
        Rᵀ R = I · det R = 1
      </Etiquette>
    </Figure>
  );
}

/** L'angle de la pente se mesure depuis l'horizontale : sinon sinus et cosinus s'échangent. */
export function AngleHorizontal() {
  const panneau = (ox: number, bon: boolean) => {
    const O = [ox + 110, 110] as const;
    const a = rad(30);
    const u = [Math.cos(a), -Math.sin(a)] as const;
    return (
      <g>
        <line x1={O[0] - 110 * u[0]} y1={O[1] - 110 * u[1]} x2={O[0] + 110 * u[0]} y2={O[1] + 110 * u[1]} stroke={TERRE} strokeWidth={5} />
        <line x1={O[0] - 110 * u[0]} y1={O[1] - 110 * u[1]} x2={O[0] + 40} y2={O[1] - 110 * u[1]} className="t-fin" strokeDasharray="4 3" />
        <line x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] + 70} stroke={ROUGE} strokeWidth={2.4} />
        <polygon points={points([[O[0], O[1] + 74], [O[0] - 5, O[1] + 64], [O[0] + 5, O[1] + 64]])} fill={ROUGE} />
        {bon ? (
          <ArcMoment cx={O[0] - 110 * u[0]} cy={O[1] - 110 * u[1]} r={40} a0={0} a1={30} couleur={VERT} epaisseur={2} />
        ) : (
          <line x1={O[0] - 110 * u[0]} y1={O[1] - 110 * u[1]} x2={O[0] - 110 * u[0]} y2={O[1] - 110 * u[1] - 60} stroke={ROUGE} strokeDasharray="4 3" />
        )}
        <Etiquette x={O[0] - 110 * u[0] + (bon ? 46 : 8)} y={O[1] - 110 * u[1] - (bon ? 6 : 40)} taille={12.5} gras couleur={bon ? VERT : ROUGE}>
          {bon ? 'α' : 'β = 90° − α'}
        </Etiquette>
        <Etiquette x={ox + 110} y={206} ancre="middle" taille={12} gras couleur={bon ? VERT : ROUGE}>
          {bon ? '✓ depuis l’horizontale : q sin α, q cos α' : '✗ depuis la verticale : sin et cos s’échangent'}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="À gauche, l'angle α du versant mesuré depuis l'horizontale : la composante le long de la pente vaut q sin α, la composante normale q cos α. À droite, l'angle mesuré depuis la verticale vaut 90° − α : si on l'utilise dans les mêmes formules, sinus et cosinus s'échangent et le résultat est faux." largeur={620} hauteur={216}>
      {panneau(10, true)}
      {panneau(320, false)}
    </Figure>
  );
}

/** Implantation d'un bâtiment : repère cartographique (E, N) et repère local du bâtiment, tourné et décalé. */
export function ReperesChantier() {
  const O = [90, 190] as const;
  const B = [210, 168] as const;
  const t = rad(25);
  const ux = [Math.cos(t), -Math.sin(t)] as const;
  const uy = [-Math.sin(t), -Math.cos(t)] as const;
  const P = (x: number, y: number) => [B[0] + x * ux[0] + y * uy[0], B[1] + x * ux[1] + y * uy[1]] as const;
  const pt = P(95, 40);
  return (
    <Figure alt="Implantation : le repère cartographique (E, N) et le repère local du bâtiment, en bleu, tourné d'un angle et décalé de son origine. Un même poteau P a des coordonnées dans les deux repères ; on passe de l'un à l'autre par une rotation suivie d'une translation." largeur={620} hauteur={226}>
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + 420} y2={O[1]} couleur={TRAIT} epaisseur={1.4} tete={7} texte="E" tx={O[0] + 424} ty={O[1] + 4} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] - 170} couleur={TRAIT} epaisseur={1.4} tete={7} texte="N" tx={O[0] + 6} ty={O[1] - 170} />
      <polygon points={points([P(0, 0), P(150, 0), P(150, 70), P(0, 70)])} fill="var(--color-beton-clair)" stroke={BLEU} strokeWidth={1.6} />
      <Fleche x1={B[0]} y1={B[1]} x2={P(185, 0)[0]} y2={P(185, 0)[1]} couleur={BLEU} epaisseur={1.6} tete={7} texte="x′" tx={P(190, 0)[0]} ty={P(190, 0)[1]} />
      <Fleche x1={B[0]} y1={B[1]} x2={P(0, 100)[0]} y2={P(0, 100)[1]} couleur={BLEU} epaisseur={1.6} tete={7} texte="y′" tx={P(0, 104)[0] - 14} ty={P(0, 104)[1]} />
      <circle cx={pt[0]} cy={pt[1]} r={5} fill={ROUGE} />
      <Etiquette x={pt[0] + 8} y={pt[1] - 6} taille={12} gras couleur={ROUGE}>
        P
      </Etiquette>
      <line x1={pt[0]} y1={pt[1]} x2={pt[0]} y2={O[1]} stroke={GRIS} strokeDasharray="3 3" />
      <line x1={pt[0]} y1={pt[1]} x2={O[0]} y2={pt[1]} stroke={GRIS} strokeDasharray="3 3" />
      <line x1={pt[0]} y1={pt[1]} x2={P(95, 0)[0]} y2={P(95, 0)[1]} stroke={BLEU} strokeDasharray="3 3" />
      <line x1={pt[0]} y1={pt[1]} x2={P(0, 40)[0]} y2={P(0, 40)[1]} stroke={BLEU} strokeDasharray="3 3" />
      <line x1={B[0]} y1={B[1]} x2={B[0] + 70} y2={B[1]} stroke={GRIS} strokeDasharray="3 3" />
      <ArcMoment cx={B[0]} cy={B[1]} r={50} a0={0} a1={25} couleur={TRAIT} epaisseur={1.2} />
      <Etiquette x={B[0] + 58} y={B[1] + 2} taille={11.5} gras>
        angle
      </Etiquette>
      <rect x={430} y={30} width={176} height={80} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={442} y={54} taille={11.5} gras>
        (E, N) : la carte
      </Etiquette>
      <Etiquette x={442} y={74} taille={11.5} gras couleur={BLEU}>
        (x′, y′) : le bâtiment
      </Etiquette>
      <Etiquette x={442} y={94} taille={11.5}>
        rotation + translation
      </Etiquette>
    </Figure>
  );
}

/** Une force inclinée projetée dans le repère d'une barre inclinée (exercice 2). */
export function ForceDansBarre({ F, aF, aB, comp }: { F: number; aF: number; aB: number; comp: readonly number[] }) {
  const O = [180, 170] as const;
  const k = 12;
  const ub = [Math.cos(rad(aB)), -Math.sin(rad(aB))] as const;
  const nb = [-Math.sin(rad(aB)), -Math.cos(rad(aB))] as const;
  const fin = [O[0] + F * k * Math.cos(rad(aF)), O[1] - F * k * Math.sin(rad(aF))] as const;
  const pa = [O[0] + comp[0]! * k * ub[0], O[1] + comp[0]! * k * ub[1]] as const;
  return (
    <Figure alt={`Force de ${nombre(F, 0)} kN inclinée à ${nombre(aF, 0)}° sur l'horizontale, barre inclinée à ${nombre(aB, 0)}° : dans le repère de la barre, composante le long de la barre ${nombre(comp[0]!, 3)} kN et perpendiculaire ${nombre(comp[1]!, 3)} kN.`} largeur={620} hauteur={216}>
      <line x1={O[0] - 140 * ub[0]} y1={O[1] - 140 * ub[1]} x2={O[0] + 200 * ub[0]} y2={O[1] + 200 * ub[1]} stroke={GRIS} strokeWidth={8} opacity={0.5} />
      <line x1={O[0]} y1={O[1]} x2={O[0] + 200} y2={O[1]} className="t-fin" strokeDasharray="4 3" />
      <Fleche x1={O[0]} y1={O[1]} x2={fin[0]} y2={fin[1]} couleur={ROUGE} epaisseur={3} tete={11} />
      <Etiquette x={fin[0] + 6} y={fin[1] - 4} taille={12.5} gras couleur={ROUGE}>
        F = {nombre(F, 0)} kN
      </Etiquette>
      <Fleche x1={O[0]} y1={O[1]} x2={pa[0]} y2={pa[1]} couleur={BLEU} epaisseur={2.4} tete={9} pointilles />
      <line x1={pa[0]} y1={pa[1]} x2={fin[0]} y2={fin[1]} stroke={BLEU} strokeWidth={1.2} strokeDasharray="3 3" />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + comp[1]! * k * nb[0]} y2={O[1] + comp[1]! * k * nb[1]} couleur={BRIQUE} epaisseur={2.4} tete={9} pointilles />
      <ArcMoment cx={O[0]} cy={O[1]} r={60} a0={0} a1={aB} couleur={TRAIT} epaisseur={1.2} />
      <ArcMoment cx={O[0]} cy={O[1]} r={86} a0={aB} a1={aF} couleur={VERT} epaisseur={1.6} />
      <Etiquette x={O[0] + 66} y={O[1] - 6} taille={11.5} gras>
        {nombre(aB, 0)}°
      </Etiquette>
      <Etiquette x={O[0] + 74} y={O[1] - 64} taille={11.5} gras couleur={VERT}>
        {nombre(aF - aB, 0)}°
      </Etiquette>
      <rect x={400} y={50} width={206} height={84} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={412} y={74} taille={12} gras couleur={BLEU}>
        le long de la barre : {nombre(comp[0]!, 3)} kN
      </Etiquette>
      <Etiquette x={412} y={96} taille={12} gras couleur={BRIQUE}>
        perpendiculaire : {nombre(comp[1]!, 3)} kN
      </Etiquette>
      <Etiquette x={412} y={120} taille={11}>
        v′ = R({nombre(aB, 0)}°)ᵀ v
      </Etiquette>
    </Figure>
  );
}

/** Succion du vent perpendiculaire au versant : ses composantes horizontale et verticale (exercice 3). */
export function SuccionVent({ alpha, q, comp }: { alpha: number; q: number; comp: readonly number[] }) {
  const O = [250, 150] as const;
  const a = rad(alpha);
  const u = [Math.cos(a), -Math.sin(a)] as const;
  const n = [-Math.sin(a), -Math.cos(a)] as const;
  const k = 110;
  const fin = [O[0] + q * k * n[0], O[1] + q * k * n[1]] as const;
  return (
    <Figure alt={`Succion du vent de ${nombre(q, 1)} kN/m, perpendiculaire à un versant incliné à ${nombre(alpha, 0)}° et dirigée vers l'extérieur : composante horizontale ${nombre(comp[0]!, 3)} kN/m, composante verticale ${nombre(comp[1]!, 3)} kN/m vers le haut, qui soulève la toiture.`} largeur={620} hauteur={230}>
      <line x1={O[0] - 150 * u[0]} y1={O[1] - 150 * u[1]} x2={O[0] + 160 * u[0]} y2={O[1] + 160 * u[1]} stroke={TERRE} strokeWidth={6} />
      <Fleche x1={O[0]} y1={O[1]} x2={fin[0]} y2={fin[1]} couleur={BLEU} epaisseur={3} tete={11} />
      <Etiquette x={fin[0] + 8} y={fin[1]} taille={12.5} gras couleur={BLEU}>
        succion {nombre(q, 1)} kN/m
      </Etiquette>
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + comp[0]! * k} y2={O[1]} couleur={BRIQUE} epaisseur={2.2} tete={8} pointilles />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] - comp[1]! * k} couleur={ROUGE} epaisseur={2.2} tete={8} pointilles />
      <Etiquette x={O[0] + comp[0]! * k - 4} y={O[1] + 18} ancre="end" taille={11.5} gras couleur={BRIQUE}>
        {nombre(comp[0]!, 3)}
      </Etiquette>
      <Etiquette x={O[0] - 8} y={O[1] - comp[1]! * k + 10} ancre="end" taille={11.5} gras couleur={ROUGE}>
        {nombre(comp[1]!, 3)} vers le haut
      </Etiquette>
      <ArcMoment cx={O[0] - 150 * u[0]} cy={O[1] - 150 * u[1]} r={50} a0={0} a1={alpha} couleur={TRAIT} epaisseur={1.2} />
      <Etiquette x={O[0] - 150 * u[0] + 56} y={O[1] - 150 * u[1] - 2} taille={11.5} gras>
        {nombre(alpha, 0)}°
      </Etiquette>
      <Etiquette x={400} y={190} taille={11.5}>
        v = R({nombre(alpha, 0)}°) (0 ; {nombre(q, 1)}) : le vent soulève les tôles
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.4.6 : valeurs propres ----------

/** Une feuille étirée : presque toutes les flèches tournent, sauf deux directions perpendiculaires, les directions propres. */
export function CaoutchoucEtire() {
  const S = [[1.5, 0.35], [0.35, 0.85]] as const;
  const vp = valeursPropres2([[...S[0]], [...S[1]]]);
  const k = 62;
  const C1 = [140, 110] as const;
  const C2 = [450, 110] as const;
  const dirs = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 8);
  const image = (v: readonly [number, number]) => [S[0][0] * v[0] + S[0][1] * v[1], S[1][0] * v[0] + S[1][1] * v[1]] as const;
  const propres = (vp?.vecteurs ?? []).map((v) => {
    const L = Math.hypot(v[0]!, v[1]!) || 1;
    return [v[0]! / L, v[1]! / L] as const;
  });
  return (
    <Figure alt="À gauche, des flèches dans toutes les directions sur une feuille de caoutchouc. À droite, la feuille étirée : le cercle devient une ellipse, presque toutes les flèches tournent en s'allongeant, sauf deux directions perpendiculaires, en couleur, qui gardent leur direction : ce sont les directions propres." largeur={620} hauteur={226}>
      <circle cx={C1[0]} cy={C1[1]} r={k} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.2} />
      {dirs.map((t) => (
        <Fleche key={t} x1={C1[0]} y1={C1[1]} x2={C1[0] + k * Math.cos(t)} y2={C1[1] - k * Math.sin(t)} couleur={GRIS} epaisseur={1.4} tete={6} />
      ))}
      {propres.map((p, i) => (
        <Fleche key={`p${i}`} x1={C1[0]} y1={C1[1]} x2={C1[0] + k * p[0]} y2={C1[1] - k * p[1]} couleur={i === 0 ? ROUGE : VERT} epaisseur={2.6} tete={8} />
      ))}
      <Etiquette x={C1[0]} y={206} ancre="middle" taille={11.5}>
        avant
      </Etiquette>
      <Fleche x1={240} y1={110} x2={330} y2={110} couleur={TRAIT} epaisseur={1.8} tete={8} />
      <Etiquette x={285} y={100} ancre="middle" taille={11}>
        on étire
      </Etiquette>
      <polygon
        points={points(Array.from({ length: 72 }, (_, i) => {
          const t = (i / 72) * 2 * Math.PI;
          const im = image([Math.cos(t), Math.sin(t)]);
          return [C2[0] + k * im[0], C2[1] - k * im[1]] as const;
        }))}
        fill="var(--color-terre-clair)"
        stroke={TERRE}
        strokeWidth={1.2}
      />
      {dirs.map((t) => {
        const im = image([Math.cos(t), Math.sin(t)]);
        return <Fleche key={t} x1={C2[0]} y1={C2[1]} x2={C2[0] + k * im[0]} y2={C2[1] - k * im[1]} couleur={GRIS} epaisseur={1.4} tete={6} />;
      })}
      {propres.map((p, i) => {
        const im = image(p);
        return <Fleche key={`q${i}`} x1={C2[0]} y1={C2[1]} x2={C2[0] + k * im[0]} y2={C2[1] - k * im[1]} couleur={i === 0 ? ROUGE : VERT} epaisseur={2.8} tete={9} />;
      })}
      <Etiquette x={C2[0]} y={206} ancre="middle" taille={11.5}>
        après : en couleur, les directions qui ne tournent pas
      </Etiquette>
    </Figure>
  );
}

/** A v = λ v : les vecteurs propres gardent leur direction ; un vecteur quelconque tourne. */
export function VecteursPropres({ A, lambda, vecteurs }: { A: readonly (readonly number[])[]; lambda: readonly number[]; vecteurs: readonly (readonly number[])[] }) {
  const k = 30;
  const O = [150, 120] as const;
  const P = (x: number, y: number) => [O[0] + x * k, O[1] - y * k] as const;
  const unit = vecteurs.map((v) => {
    const L = Math.hypot(v[0]!, v[1]!) || 1;
    return [v[0]! / L, v[1]! / L] as const;
  });
  const Av = (v: readonly [number, number]) => [A[0]![0]! * v[0] + A[0]![1]! * v[1], A[1]![0]! * v[0] + A[1]![1]! * v[1]] as const;
  const g = [1, 0] as const;
  const couleurs = [ROUGE, VERT];
  return (
    <Figure alt={`Pour A = (${A.map((l) => l.map((v) => nombre(v, 0)).join(' ')).join(' ; ')}), le vecteur propre de valeur propre ${nombre(lambda[0]!, 0)} est multiplié par ${nombre(lambda[0]!, 0)} sans tourner, celui de valeur propre ${nombre(lambda[1]!, 0)} est multiplié par ${nombre(lambda[1]!, 0)} ; un vecteur quelconque, comme (1 ; 0), change de direction.`} largeur={620} hauteur={244}>
      <line x1={P(-4, 0)[0]} y1={O[1]} x2={P(5, 0)[0]} y2={O[1]} className="t-fin" />
      <line x1={O[0]} y1={P(0, -3.6)[1]} x2={O[0]} y2={P(0, 3.8)[1]} className="t-fin" />
      {unit.map((u, i) => {
        const im = Av(u);
        return (
          <g key={i}>
            <line x1={P(-u[0] * 5, -u[1] * 5)[0]} y1={P(-u[0] * 5, -u[1] * 5)[1]} x2={P(u[0] * 5.3, u[1] * 5.3)[0]} y2={P(u[0] * 5.3, u[1] * 5.3)[1]} stroke={couleurs[i]} strokeWidth={1} strokeDasharray="4 4" opacity={0.6} />
            <Fleche x1={O[0]} y1={O[1]} x2={P(...im)[0]} y2={P(...im)[1]} couleur={couleurs[i]} epaisseur={2} tete={8} pointilles />
            <Fleche x1={O[0]} y1={O[1]} x2={P(...u)[0]} y2={P(...u)[1]} couleur={couleurs[i]} epaisseur={3} tete={9} />
            <Etiquette x={P(...im)[0] + 6} y={P(...im)[1] + (i === 0 ? -4 : 14)} taille={12} gras couleur={couleurs[i]}>
              A v = {nombre(lambda[i]!, 0)} v
            </Etiquette>
          </g>
        );
      })}
      <Fleche x1={O[0]} y1={O[1]} x2={P(...g)[0]} y2={P(...g)[1]} couleur={GRIS} epaisseur={2.4} tete={8} />
      <Fleche x1={O[0]} y1={O[1]} x2={P(...Av(g))[0]} y2={P(...Av(g))[1]} couleur={GRIS} epaisseur={1.8} tete={8} pointilles />
      <Etiquette x={P(...Av(g))[0] + 6} y={P(...Av(g))[1] + 4} taille={11.5} couleur={GRIS}>
        A (1 ; 0) : il tourne
      </Etiquette>
      <rect x={420} y={150} width={186} height={64} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={432} y={174} taille={11.5} gras>
        trait plein : v
      </Etiquette>
      <Etiquette x={432} y={194} taille={11.5}>
        pointillés : son image A v
      </Etiquette>
    </Figure>
  );
}

/** Cisaillement pur : le petit carré tourné de 45° ne subit plus qu'une traction σ₁ = τ et une compression σ₂ = −τ. */
export function CisaillementPur({ tau, s1, s2 }: { tau: number; s1: number; s2: number }) {
  const carre = (cx: number, cy: number, angle: number, contenu: React.ReactNode) => (
    <g transform={`rotate(${-angle} ${cx} ${cy})`}>
      <rect x={cx - 40} y={cy - 40} width={80} height={80} fill="var(--color-beton-clair)" className="t-moyen" />
      {contenu}
    </g>
  );
  return (
    <Figure alt={`À gauche, un petit carré de matière en cisaillement pur : τ = ${nombre(tau, 1)} MPa sur ses quatre faces, aucune contrainte normale. À droite, le même point regardé dans un carré tourné de 45° : il ne reste qu'une traction σ1 = ${nombre(s1, 2)} MPa et une compression σ2 = ${nombre(s2, 2)} MPa.`} largeur={620} hauteur={226}>
      {carre(
        150,
        110,
        0,
        <g>
          <Fleche x1={120} y1={64} x2={180} y2={64} couleur={BRIQUE} epaisseur={2.4} tete={8} />
          <Fleche x1={180} y1={156} x2={120} y2={156} couleur={BRIQUE} epaisseur={2.4} tete={8} />
          <Fleche x1={196} y1={140} x2={196} y2={80} couleur={BRIQUE} epaisseur={2.4} tete={8} />
          <Fleche x1={104} y1={80} x2={104} y2={140} couleur={BRIQUE} epaisseur={2.4} tete={8} />
        </g>,
      )}
      <Etiquette x={150} y={34} ancre="middle" taille={12} gras couleur={BRIQUE}>
        τ = {nombre(tau, 1)} MPa seul
      </Etiquette>
      <Fleche x1={240} y1={110} x2={330} y2={110} couleur={TRAIT} epaisseur={1.8} tete={8} />
      <Etiquette x={285} y={100} ancre="middle" taille={11}>
        tourner de 45°
      </Etiquette>
      {carre(
        450,
        110,
        45,
        <g>
          <Fleche x1={490} y1={110} x2={526} y2={110} couleur={BLEU} epaisseur={2.6} tete={9} />
          <Fleche x1={410} y1={110} x2={374} y2={110} couleur={BLEU} epaisseur={2.6} tete={9} />
          <Fleche x1={450} y1={34} x2={450} y2={66} couleur={ROUGE} epaisseur={2.6} tete={9} />
          <Fleche x1={450} y1={186} x2={450} y2={154} couleur={ROUGE} epaisseur={2.6} tete={9} />
        </g>,
      )}
      <Etiquette x={540} y={52} taille={12} gras couleur={BLEU}>
        σ1 = {nombre(s1, 2)} MPa
      </Etiquette>
      <Etiquette x={540} y={196} taille={12} gras couleur={ROUGE}>
        σ2 = {nombre(s2, 2)} MPa
      </Etiquette>
      <Etiquette x={20} y={216} taille={11} classe="etiquette">
        bleu : traction · rouge : compression · plus de cisaillement sur les faces à 45°
      </Etiquette>
    </Figure>
  );
}

/** La fissure s'ouvre perpendiculairement à la traction principale σ1, pas dans sa direction. */
export function FissurePerpendiculaire() {
  const panneau = (cx: number, bon: boolean) => {
    const t = rad(35);
    const u = [Math.cos(t), -Math.sin(t)] as const;
    const n = [Math.sin(t), Math.cos(t)] as const;
    const fiss = bon ? n : u;
    return (
      <g>
        <rect x={cx - 70} y={40} width={140} height={120} fill="var(--color-beton-clair)" className="t-moyen" />
        <Fleche x1={cx + 50 * u[0]} y1={100 + 50 * u[1]} x2={cx + 90 * u[0]} y2={100 + 90 * u[1]} couleur={BLEU} epaisseur={2.6} tete={9} />
        <Fleche x1={cx - 50 * u[0]} y1={100 - 50 * u[1]} x2={cx - 90 * u[0]} y2={100 - 90 * u[1]} couleur={BLEU} epaisseur={2.6} tete={9} />
        <path d={`M${cx - 44 * fiss[0]} ${100 - 44 * fiss[1]} l ${8 * fiss[0] + 4} ${8 * fiss[1] - 3} l ${12 * fiss[0] - 3} ${12 * fiss[1] + 4} l ${14 * fiss[0] + 4} ${14 * fiss[1] - 3} l ${12 * fiss[0] - 3} ${12 * fiss[1] + 3} l ${12 * fiss[0]} ${12 * fiss[1]}`} fill="none" stroke={bon ? ROUGE : GRIS} strokeWidth={2.6} />
        <Etiquette x={cx + 96 * u[0]} y={100 + 96 * u[1] - 6} taille={12} gras couleur={BLEU}>
          σ1
        </Etiquette>
        <Etiquette x={cx} y={190} ancre="middle" taille={12} gras couleur={bon ? VERT : ROUGE}>
          {bon ? '✓ fissure perpendiculaire à σ1' : '✗ fissure dans la direction de σ1'}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="Un élément de béton tiré selon la direction principale σ1. À gauche, la fissure s'ouvre perpendiculairement à σ1, comme une feuille qu'on déchire en tirant de part et d'autre : c'est juste. À droite, une fissure dessinée dans la direction de σ1 : c'est faux." largeur={620} hauteur={206}>
      {panneau(160, true)}
      {panneau(460, false)}
    </Figure>
  );
}

/** Fissures d'une poutre en béton armé : verticales au milieu (flexion), inclinées près des appuis (effort tranchant), cousues par les cadres. */
export function FissuresPoutre() {
  const yb = 140;
  return (
    <Figure alt="Élévation d'une poutre en béton armé sur deux appuis, chargée. Au milieu de la portée, des fissures verticales partent de la face inférieure : c'est la flexion. Près des appuis, des fissures inclinées vers 45° : c'est l'effort tranchant ; les cadres verticaux les traversent et les cousent." largeur={620} hauteur={226}>
      <Hachures prefixe="fpo" types={['terre']} />
      <rect x={40} y={70} width={540} height={70} fill="var(--color-beton-clair)" className="t-moyen" />
      {Array.from({ length: 22 }, (_, i) => 60 + i * 24).map((x) => (
        <line key={x} x1={x} y1={76} x2={x} y2={134} stroke={BLEU} strokeWidth={1.2} opacity={0.6} />
      ))}
      <line x1={46} y1={130} x2={574} y2={130} stroke={BLEU} strokeWidth={2.6} />
      {[270, 300, 330, 360].map((x, i) => (
        <path key={x} d={`M${x} ${yb} l -3 -10 l 4 -9 l -3 -10 ${i % 2 ? 'l 3 -8' : ''}`} fill="none" stroke={ROUGE} strokeWidth={2} />
      ))}
      {(
        [
          [100, 1],
          [520, -1],
        ] as const
      ).map(([x, s]) => (
        <g key={x}>
          <path d={`M${x} ${yb - 8} l ${12 * s} -12 l ${8 * s} -2 l ${12 * s} -14 l ${10 * s} -4 l ${8 * s} -12`} fill="none" stroke={ROUGE} strokeWidth={2} />
          <path d={`M${x + 26 * s} ${yb - 4} l ${12 * s} -14 l ${10 * s} -2 l ${10 * s} -14`} fill="none" stroke={ROUGE} strokeWidth={2} />
        </g>
      ))}
      <polygon points={points([[52, 140], [42, 156], [62, 156]])} fill="var(--halo)" className="t-moyen" />
      <polygon points={points([[568, 140], [558, 156], [578, 156]])} fill="var(--halo)" className="t-moyen" />
      {Array.from({ length: 11 }, (_, i) => 70 + i * 48).map((x) => (
        <Fleche key={x} x1={x} y1={40} x2={x} y2={66} couleur={ROUGE} epaisseur={1.4} tete={6} />
      ))}
      <Etiquette x={310} y={180} ancre="middle" taille={12} gras couleur={ROUGE}>
        flexion : fissures verticales au milieu
      </Etiquette>
      <Etiquette x={40} y={200} taille={12} gras couleur={ROUGE}>
        effort tranchant : fissures inclinées près des appuis
      </Etiquette>
      <Etiquette x={40} y={218} taille={11.5} couleur={BLEU}>
        bleu : cadres et aciers longitudinaux, qui cousent les fissures
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.4.7 : K u = F ----------

/** La loi du ressort : double charge, double allongement ; un tirant d'acier est un ressort très raide. */
export function RessortPoids() {
  const ressort = (x: number, u: number, P: string) => {
    const L = 70 + u;
    const spires = 10;
    const pts = Array.from({ length: spires * 2 + 1 }, (_, i) => [x + (i === 0 || i === spires * 2 ? 0 : i % 2 ? -10 : 10), 40 + (i * L) / (spires * 2)] as const);
    return (
      <g>
        <polyline points={points(pts)} fill="none" stroke={TRAIT} strokeWidth={1.8} />
        {P ? <rect x={x - 16} y={40 + L} width={32} height={26} fill="var(--color-acier-clair)" stroke="var(--color-acier)" /> : null}
        <Etiquette x={x} y={40 + L + 18} ancre="middle" taille={12} gras>
          {P}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="Trois ressorts identiques : sans charge, avec un poids P, l'allongement vaut u ; avec 2P, il vaut 2u. C'est la loi du ressort F = k u, k étant la raideur. Une barre d'acier se comporte comme un ressort très raide." largeur={620} hauteur={226}>
      <rect x={60} y={28} width={420} height={12} fill="var(--color-beton-clair)" className="t-moyen" />
      {ressort(110, 0, '')}
      {ressort(250, 30, 'P')}
      {ressort(390, 60, '2P')}
      <line x1={100} y1={110} x2={440} y2={110} stroke={GRIS} strokeDasharray="4 4" />
      <Cote x1={290} y1={110} x2={290} y2={140} decalage={0} texte="u" />
      <Cote x1={430} y1={110} x2={430} y2={170} decalage={0} texte="2u" />
      <rect x={500} y={60} width={110} height={84} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={555} y={88} ancre="middle" taille={14} gras>
        F = k u
      </Etiquette>
      <Etiquette x={555} y={112} ancre="middle" taille={11}>
        k : la raideur
      </Etiquette>
      <Etiquette x={555} y={130} ancre="middle" taille={11}>
        (kN/m)
      </Etiquette>
    </Figure>
  );
}

/** Une barre inclinée ne s'allonge que de la projection du déplacement du nœud sur son axe : ΔL = u · e. */
export function ProjectionAllongement() {
  const A = [90, 50] as const;
  const N = [330, 170] as const;
  const L = Math.hypot(N[0] - A[0], N[1] - A[1]);
  const e = [(N[0] - A[0]) / L, (N[1] - A[1]) / L] as const;
  const u = [40, 62] as const;
  const fin = [N[0] + u[0], N[1] + u[1]] as const;
  const proj = u[0] * e[0] + u[1] * e[1];
  const H = [N[0] + proj * e[0], N[1] + proj * e[1]] as const;
  return (
    <Figure alt="Une barre va de l'appui A au nœud N, de vecteur unitaire e. Le nœud se déplace de u. La barre ne s'allonge que de la projection de u sur son axe : ΔL = u · e ; la partie de u perpendiculaire à la barre la fait seulement tourner." largeur={620} hauteur={226}>
      <Hachures prefixe="pal4" types={['maconnerie']} />
      <rect x={A[0] - 40} y={A[1] - 30} width={40} height={60} fill={hachure('pal4', 'maconnerie')} className="t-moyen" />
      <line x1={A[0]} y1={A[1]} x2={N[0]} y2={N[1]} stroke={TRAIT} strokeWidth={5} />
      <line x1={N[0]} y1={N[1]} x2={N[0] + 120 * e[0]} y2={N[1] + 120 * e[1]} stroke={GRIS} strokeDasharray="5 4" />
      <circle cx={A[0]} cy={A[1]} r={5} fill="var(--color-papier)" className="t-fort" />
      <circle cx={N[0]} cy={N[1]} r={6} fill="var(--color-papier)" className="t-fort" />
      <Etiquette x={A[0] + 4} y={A[1] - 12} taille={12.5} gras>
        A
      </Etiquette>
      <Etiquette x={N[0] - 16} y={N[1] + 18} taille={12.5} gras>
        N
      </Etiquette>
      <Fleche x1={N[0]} y1={N[1]} x2={fin[0]} y2={fin[1]} couleur={ROUGE} epaisseur={2.8} tete={10} />
      <Etiquette x={fin[0] + 6} y={fin[1] + 4} taille={12.5} gras couleur={ROUGE}>
        u
      </Etiquette>
      <line x1={fin[0]} y1={fin[1]} x2={H[0]} y2={H[1]} stroke={ROUGE} strokeWidth={1.2} strokeDasharray="3 3" />
      <line x1={N[0]} y1={N[1]} x2={H[0]} y2={H[1]} stroke={BLEU} strokeWidth={4} />
      <Etiquette x={H[0] + 8} y={H[1] - 8} taille={12.5} gras couleur={BLEU}>
        ΔL = u · e
      </Etiquette>
      <Fleche x1={A[0] + 40 * e[0]} y1={A[1] + 40 * e[1] - 16} x2={A[0] + 90 * e[0]} y2={A[1] + 90 * e[1] - 16} couleur={VERT} epaisseur={2} tete={8} />
      <Etiquette x={A[0] + 66 * e[0]} y={A[1] + 66 * e[1] - 22} ancre="middle" taille={12} gras couleur={VERT}>
        e
      </Etiquette>
      <rect x={430} y={40} width={176} height={84} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={442} y={64} taille={12} gras>
        N = k (u · e)
      </Etiquette>
      <Etiquette x={442} y={86} taille={11.5}>
        seule la projection
      </Etiquette>
      <Etiquette x={442} y={104} taille={11.5}>
        sur l’axe allonge la barre
      </Etiquette>
    </Figure>
  );
}

/** Un nœud tenu par trois tirants : la statique ne suffit plus, K u = F donne les efforts ; la barre la plus raide reprend le plus. */
export function TroisTirants({ ancrages, N, F }: { ancrages: ReadonlyArray<readonly [number, number]>; N: readonly number[]; F: number }) {
  const O = [310, 176] as const;
  const k = 50;
  const couleurs = [BLEU, BLEU, VERT];
  const yPlafond = O[1] - Math.max(...ancrages.map((a) => a[1])) * k;
  return (
    <Figure alt={`Un nœud chargé par ${nombre(F, 0)} kN et tenu par trois tirants : les deux tirants inclinés portent ${nombre(N[0]!, 2)} kN et ${nombre(N[1]!, 2)} kN, le tirant vertical, plus court donc plus raide, ${nombre(N[2]!, 2)} kN. La statique seule ne suffit pas ; K u = F donne ces efforts.`} largeur={620} hauteur={244}>
      <rect x={110} y={yPlafond - 14} width={400} height={14} fill="var(--color-beton-clair)" className="t-moyen" />
      {ancrages.map((a, i) => {
        const fin = [O[0] + a[0] * k, O[1] - a[1] * k] as const;
        return (
          <g key={i}>
            <line x1={O[0]} y1={O[1]} x2={fin[0]} y2={fin[1]} stroke={couleurs[i]} strokeWidth={2.5 + (N[i]! / Math.max(...N)) * 4} />
            <Etiquette x={(O[0] + fin[0]) / 2 + (a[0] < 0 ? -10 : a[0] > 0 ? 10 : 8)} y={(O[1] + fin[1]) / 2 + (a[0] === 0 ? 0 : 18)} ancre={a[0] < 0 ? 'end' : 'start'} taille={12.5} gras couleur={couleurs[i]}>
              N{['₁', '₂', '₃'][i]} = {nombre(N[i]!, 2)} kN
            </Etiquette>
          </g>
        );
      })}
      <circle cx={O[0]} cy={O[1]} r={7} fill="var(--color-papier)" className="t-fort" />
      <Fleche x1={O[0]} y1={O[1] + 8} x2={O[0]} y2={O[1] + 48} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={O[0] + 8} y={O[1] + 42} taille={12.5} gras couleur={ROUGE}>
        F = {nombre(F, 0)} kN
      </Etiquette>
      <Etiquette x={20} y={236} taille={11} classe="etiquette">
        épaisseur des traits proportionnelle à l’effort : la charge va vers la raideur
      </Etiquette>
    </Figure>
  );
}

/** Une seule barre ne tient pas un nœud dans le plan : il tourne autour de l'appui, det K = 0. */
export function UneSeuleBarre() {
  const A = [130, 50] as const;
  const N = [290, 170] as const;
  const R = Math.hypot(N[0] - A[0], N[1] - A[1]);
  const a0 = Math.atan2(-(N[1] - A[1]), N[0] - A[0]);
  return (
    <Figure alt="Un nœud tenu par une seule barre inclinée : il peut tourner autour de l'appui sans allonger la barre. La matrice de rigidité a un déterminant nul : c'est un mécanisme ; il faut une deuxième barre non alignée." largeur={620} hauteur={216}>
      <Hachures prefixe="usb" types={['maconnerie']} />
      <rect x={A[0] - 40} y={A[1] - 30} width={40} height={60} fill={hachure('usb', 'maconnerie')} className="t-moyen" />
      <line x1={A[0]} y1={A[1]} x2={N[0]} y2={N[1]} stroke={TRAIT} strokeWidth={5} />
      <circle cx={A[0]} cy={A[1]} r={5} fill="var(--color-papier)" className="t-fort" />
      <circle cx={N[0]} cy={N[1]} r={6} fill="var(--color-papier)" className="t-fort" />
      <ArcMoment cx={A[0]} cy={A[1]} r={R} a0={(a0 * 180) / Math.PI + 12} a1={(a0 * 180) / Math.PI - 14} couleur={ROUGE} epaisseur={2} />
      <Fleche x1={N[0]} y1={N[1] + 8} x2={N[0]} y2={N[1] + 40} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Etiquette x={N[0] + 22} y={N[1] - 4} taille={12} gras couleur={ROUGE}>
        il tourne autour de l’appui
      </Etiquette>
      <rect x={420} y={50} width={186} height={74} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={432} y={74} taille={12} gras>
        det K = 0
      </Etiquette>
      <Etiquette x={432} y={96} taille={11.5}>
        mécanisme : il faut une
      </Etiquette>
      <Etiquette x={432} y={114} taille={11.5}>
        2e barre non alignée
      </Etiquette>
    </Figure>
  );
}

/** Plan d'un bâtiment : la cage d'escalier en béton, très raide, attire le vent et le séisme ; excentrée, elle fait tourner le bâtiment. */
export function CageEscalierRaide() {
  const cols = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) if (!(i === 4 && j > 0)) cols.push([110 + i * 90, 50 + j * 60] as const);
  return (
    <Figure alt="Plan d'un bâtiment avec des poteaux et une cage d'escalier en béton armé dans un angle. Sous le vent ou le séisme, la cage, très raide, reprend l'essentiel de l'effort horizontal ; comme elle est excentrée, le bâtiment tourne autour d'elle." largeur={620} hauteur={226}>
      <Hachures prefixe="ces" types={['ba']} />
      <rect x={90} y={30} width={400} height={160} fill="none" className="t-moyen" />
      {cols.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 6} y={y - 6} width={12} height={12} fill={TRAIT} />
      ))}
      <rect x={400} y={110} width={80} height={70} fill={hachure('ces', 'ba')} stroke={TRAIT} strokeWidth={4} />
      <Etiquette x={440} y={150} ancre="middle" taille={11} gras>
        cage
      </Etiquette>
      {[60, 110, 160].map((y) => (
        <Fleche key={y} x1={20} y1={y} x2={84} y2={y} couleur={BLEU} epaisseur={1.8} tete={8} />
      ))}
      <Etiquette x={20} y={42} taille={11.5} gras couleur={BLEU}>
        vent, séisme
      </Etiquette>
      <ArcMoment cx={290} cy={110} r={56} a0={140} a1={40} couleur={ROUGE} epaisseur={2.2} />
      <Etiquette x={290} y={44} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        torsion si la cage est excentrée
      </Etiquette>
      <Etiquette x={500} y={130} taille={11.5} gras>
        très raide :
      </Etiquette>
      <Etiquette x={500} y={148} taille={11.5} gras>
        elle attire
      </Etiquette>
      <Etiquette x={500} y={166} taille={11.5} gras>
        les efforts
      </Etiquette>
    </Figure>
  );
}

/** Panne sur un versant : charge verticale et pente, sans résultat (énoncé d'examen). */
export function PanneDonnees({ q, alpha }: { q: number; alpha: number }) {
  const O = [300, 84] as const;
  const a = rad(alpha);
  const u = [Math.cos(a), -Math.sin(a)] as const;
  return (
    <Figure alt={`Panne sur un versant incliné à ${nombre(alpha, 0)}°, chargée verticalement par ${nombre(q, 0)} kN/m.`} largeur={620} hauteur={170}>
      <line x1={O[0] - 120 * u[0]} y1={O[1] - 120 * u[1]} x2={O[0] + 140 * u[0]} y2={O[1] + 140 * u[1]} stroke={TERRE} strokeWidth={6} />
      <rect x={O[0] - 10} y={O[1] - 18} width={20} height={14} fill="var(--color-acier-clair)" stroke="var(--color-acier)" transform={`rotate(${-alpha} ${O[0]} ${O[1]})`} />
      <Fleche x1={O[0]} y1={O[1] - 70} x2={O[0]} y2={O[1] - 20} couleur={ROUGE} epaisseur={3} tete={10} />
      <Etiquette x={O[0] + 8} y={O[1] - 56} taille={12.5} gras couleur={ROUGE}>
        {nombre(q, 0)} kN/m
      </Etiquette>
      <line x1={O[0] - 120 * u[0]} y1={O[1] - 120 * u[1]} x2={O[0] - 60 * u[0]} y2={O[1] - 120 * u[1]} className="t-fin" strokeDasharray="4 3" />
      <ArcMoment cx={O[0] - 120 * u[0]} cy={O[1] - 120 * u[1]} r={46} a0={0} a1={alpha} couleur={TRAIT} epaisseur={1.2} />
      <Etiquette x={O[0] - 120 * u[0] + 52} y={O[1] - 120 * u[1] - 4} taille={12} gras>
        {nombre(alpha, 0)}°
      </Etiquette>
    </Figure>
  );
}

/** En trois dimensions : trois directions principales perpendiculaires, trois contraintes principales, aucun cisaillement. */
export function CubePrincipal({ valeurs }: { valeurs: readonly number[] }) {
  const s = 70;
  const c = [170, 120] as const;
  const P = (x: number, y: number, z: number) => [c[0] + (x - y) * 0.866 * s, c[1] + (x + y) * 0.5 * s - z * s] as const;
  const face = (pts: Array<readonly [number, number]>, f: string) => <polygon points={points(pts)} fill={f} className="t-moyen" />;
  const tri = [...valeurs].sort((a, b) => b - a);
  const axes = [
    { de: P(0.5, 0, 0), a: P(1.15, 0, 0), nom: 'σ₁' },
    { de: P(0, 0.5, 0), a: P(0, 1.15, 0), nom: 'σ₂' },
    { de: P(0, 0, 0.5), a: P(0, 0, 1.15), nom: 'σ₃' },
  ];
  return (
    <Figure alt={`Petit cube orienté selon les trois directions principales : sur ses faces, il n'y a plus de cisaillement, seulement les trois contraintes principales ${tri.map((v) => nombre(v, 3)).join(', ')}, valeurs propres du tenseur 3 × 3 de l'exemple.`} largeur={620} hauteur={226}>
      {face([P(0.5, -0.5, 0.5), P(0.5, 0.5, 0.5), P(0.5, 0.5, -0.5), P(0.5, -0.5, -0.5)], 'var(--color-beton-clair)')}
      {face([P(-0.5, 0.5, 0.5), P(0.5, 0.5, 0.5), P(0.5, 0.5, -0.5), P(-0.5, 0.5, -0.5)], 'var(--fond-beton)')}
      {face([P(-0.5, -0.5, 0.5), P(0.5, -0.5, 0.5), P(0.5, 0.5, 0.5), P(-0.5, 0.5, 0.5)], 'var(--color-papier)')}
      {axes.map((a, i) => (
        <g key={a.nom}>
          <Fleche x1={a.de[0]} y1={a.de[1]} x2={a.a[0]} y2={a.a[1]} couleur={BLEU} epaisseur={2.6} tete={9} />
          <Etiquette x={a.a[0] + (i === 1 ? -8 : 8)} y={a.a[1] + (i === 2 ? -4 : 14)} ancre={i === 1 ? 'end' : 'start'} taille={12.5} gras couleur={BLEU}>
            {a.nom} = {nombre(tri[i] ?? 0, 3)}
          </Etiquette>
        </g>
      ))}
      <rect x={360} y={50} width={246} height={110} rx={8} fill="var(--fond-note)" className="t-fin" />
      <Etiquette x={372} y={74} taille={12} gras>
        3 directions principales
      </Etiquette>
      <Etiquette x={372} y={96} taille={11.5}>
        perpendiculaires entre elles ;
      </Etiquette>
      <Etiquette x={372} y={114} taille={11.5}>
        sur ces faces, pas de cisaillement
      </Etiquette>
      <Etiquette x={372} y={140} taille={11.5}>
        calcul : méthode de Jacobi (logiciel)
      </Etiquette>
    </Figure>
  );
}
