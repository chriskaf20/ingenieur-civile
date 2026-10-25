// Schémas du module N0.6 (vecteurs). Les valeurs viennent de lib/calc/vecteurs.ts.
// Les vues 3D utilisent projeterIsoDirect : le trièdre dessiné est direct, la règle de la main droite s'y lit.
import { Cote } from '@/components/drawing/Cote';
import { ArcMoment, Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { Nord } from '@/components/drawing/Reperes';
import { Calque } from '@/components/gabarits/Vue3D';
import { GAMMA_G } from '@/lib/calc/charges';
import { cosD, sinD } from '@/lib/calc/trigo';
import {
  depuisPolaire,
  fois,
  norme,
  unitaire,
  vectoriel2,
  type DonneesElingues,
  type DonneesEquerrage,
  type DonneesForceCable,
  type DonneesMat,
  type DonneesMoment,
  type DonneesPotence,
  type ResultatElingues,
  type ResultatEquerrage,
  type ResultatForceCable,
  type ResultatMat,
  type ResultatMoment,
  type ResultatSomme,
  type Vec3,
} from '@/lib/calc/vecteurs';
import { projeterIsoDirect, type Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
type P2 = readonly [number, number];
const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const GRIS = 'var(--trait-doux)';

/** Cadre de dessin en isométrie directe : mise à l'échelle des points 3D dans une largeur donnée. */
function cadreIsoDirect(pts: Point3[], largeur: number, hauteurMax: number, marge = 34) {
  const proj = pts.map(projeterIsoDirect);
  const xs = proj.map((p) => p[0]);
  const ys = proj.map((p) => p[1]);
  const k = Math.min((largeur - 2 * marge) / (Math.max(...xs) - Math.min(...xs)), (hauteurMax - 2 * marge) / (Math.max(...ys) - Math.min(...ys)));
  const x0 = (largeur - (Math.max(...xs) - Math.min(...xs)) * k) / 2 - Math.min(...xs) * k;
  const y0 = marge - Math.min(...ys) * k;
  const P = (q: Point3): P2 => {
    const [u, v] = projeterIsoDirect(q);
    return [x0 + u * k, y0 + v * k];
  };
  return { P, hauteur: (Math.max(...ys) - Math.min(...ys)) * k + 2 * marge, poly: (q: Point3[]) => points(q.map(P)) };
}

/** Vecteur 3D dessiné entre deux points de l'espace. */
function Fleche3({ P, de, vers, ...rest }: { P: (q: Point3) => P2; de: Point3; vers: Point3 } & Omit<React.ComponentProps<typeof Fleche>, 'x1' | 'y1' | 'x2' | 'y2'>) {
  const [x1, y1] = P(de);
  const [x2, y2] = P(vers);
  return <Fleche x1={x1} y1={y1} x2={x2} y2={y2} {...rest} />;
}

// ---------- Anatomie d'un vecteur (N0.6.1) ----------

export function VecteurAnatomie() {
  const A: P2 = [70, 190];
  const B: P2 = [250, 80];
  const ux = (B[0] - A[0]) / Math.hypot(B[0] - A[0], B[1] - A[1]);
  const uy = (B[1] - A[1]) / Math.hypot(B[0] - A[0], B[1] - A[1]);
  const v: P2 = [B[0] - A[0], B[1] - A[1]];
  const copie = (x: number, y: number, inverse = false, couleur = ROUGE, nom = '') =>
    inverse ? (
      <Fleche x1={x + v[0] * 0.55} y1={y + v[1] * 0.55} x2={x} y2={y} couleur={couleur} texte={nom} tx={x + v[0] * 0.3 + 10} ty={y + v[1] * 0.3 + 14} />
    ) : (
      <Fleche x1={x} y1={y} x2={x + v[0] * 0.55} y2={y + v[1] * 0.55} couleur={couleur} texte={nom} tx={x + v[0] * 0.3 + 10} ty={y + v[1] * 0.3 + 14} />
    );
  return (
    <Figure
      alt="Un vecteur AB : direction (la droite qui le porte), sens (de A vers B), norme (sa longueur). À droite, deux vecteurs égaux placés à des endroits différents, et le vecteur opposé, de sens contraire."
      largeur={620}
      hauteur={240}
    >
      <line x1={A[0] - ux * 50} y1={A[1] - uy * 50} x2={B[0] + ux * 60} y2={B[1] + uy * 60} className="t-axe" />
      <Fleche x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} couleur={ROUGE} epaisseur={3} />
      <circle cx={A[0]} cy={A[1]} r={4} fill="var(--trait)" />
      <Etiquette x={A[0] - 8} y={A[1] + 16} ancre="end" taille={14} gras>
        A
      </Etiquette>
      <Etiquette x={B[0] + 4} y={B[1] - 8} taille={14} gras>
        B
      </Etiquette>
      <Cote x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} decalage={-26} texte="norme ‖AB‖" />
      <Etiquette x={B[0] + ux * 60 - 4} y={B[1] + uy * 60 - 8} ancre="end" taille={11} classe="etiquette">
        direction (droite support)
      </Etiquette>
      <Etiquette x={(A[0] + B[0]) / 2 - 12} y={(A[1] + B[1]) / 2 - 10} ancre="end" taille={11.5} classe="etiquette">
        sens : de A vers B
      </Etiquette>
      <line x1={330} y1={20} x2={330} y2={220} className="t-fin" strokeDasharray="3 4" />
      {copie(370, 200, false, ROUGE, 'AB')}
      {copie(470, 150, false, ROUGE, 'CD = AB')}
      {copie(420, 110, true, BLEU, '−AB')}
      <Etiquette x={470} y={232} ancre="middle" taille={11} classe="etiquette">
        même direction, même sens, même norme : vecteurs égaux
      </Etiquette>
    </Figure>
  );
}

// ---------- La force d'un câble (N0.6.1) ----------

export function HaubanForce({ d, r, prefixe = 'hf' }: { d: DonneesForceCable; r: ResultatForceCable; prefixe?: string }) {
  const xmin = Math.min(d.xA, d.xB, 0) - 1;
  const xmax = Math.max(d.xA, d.xB, 0) + 1;
  const ymin = Math.min(d.yA, d.yB, 0) - 0.6;
  const ymax = Math.max(d.yA, d.yB) + 1;
  const k = Math.min(300 / (xmax - xmin), 220 / (ymax - ymin));
  const X = (x: number) => 20 + (x - xmin) * k;
  const Y = (y: number) => 240 - (y - ymin) * k;
  const yS = Math.min(d.yA, d.yB, 0);
  // panneau de droite : la force à l'échelle des forces
  const pxCm = Math.min(30, 170 / Math.max(r.fleche, 1e-9)); // px par « cm » de dessin
  const kf = pxCm / d.echelle; // px par kN
  const [Fx, Fy] = [r.F[0] ?? 0, r.F[1] ?? 0];
  const ox = Fx < 0 ? 590 : 380;
  const oy = Fy < 0 ? 58 : 200; // sous le titre du panneau
  const fx = ox + Fx * kf;
  const fy = oy - Fy * kf;
  const nbCm = Math.ceil(r.fleche);
  return (
    <Figure alt={`Hauban de A(${n2(d.xA)} ; ${n2(d.yA)}) vers B(${n2(d.xB)} ; ${n2(d.yB)}), longueur ${n2(r.L)} m ; force de ${n2(d.T)} kN dirigée de A vers B, composantes (${n2(Fx)} ; ${n2(Fy)}) kN`} largeur={620} hauteur={290}>
      <Hachures prefixe={prefixe} types={['terre', 'beton']} />
      <rect x={X(xmin)} y={Y(yS)} width={(xmax - xmin) * k} height={12} fill={hachure(prefixe, 'terre')} />
      <line x1={X(xmin)} y1={Y(yS)} x2={X(xmax)} y2={Y(yS)} className="t-moyen" />
      <line x1={X(0)} y1={Y(yS)} x2={X(0)} y2={Y(ymax - 0.2)} className="t-fort" strokeWidth={4} />
      <rect x={X(d.xB) - 9} y={Y(d.yB)} width={18} height={10} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <line x1={X(d.xA)} y1={Y(d.yA)} x2={X(d.xB)} y2={Y(d.yB)} stroke={GRIS} strokeWidth={1.4} />
      <line x1={X(d.xA)} y1={Y(d.yA)} x2={X(d.xB)} y2={Y(d.yA)} stroke={BLEU} strokeWidth={1.2} strokeDasharray="5 3" />
      <line x1={X(d.xB)} y1={Y(d.yA)} x2={X(d.xB)} y2={Y(d.yB)} stroke={VERT} strokeWidth={1.2} strokeDasharray="5 3" />
      <Etiquette x={(X(d.xA) + X(d.xB)) / 2} y={Y(d.yA) - 6} ancre="middle" taille={11.5} couleur={BLEU}>
        Δx = {n2(r.AB[0] ?? 0)}
      </Etiquette>
      <Etiquette x={X(d.xB) + 6} y={(Y(d.yA) + Y(d.yB)) / 2} taille={11.5} couleur={VERT}>
        Δy = {n2(r.AB[1] ?? 0)}
      </Etiquette>
      <Fleche x1={X(d.xA)} y1={Y(d.yA)} x2={X(d.xA) + (r.u[0] ?? 0) * 70} y2={Y(d.yA) - (r.u[1] ?? 0) * 70} couleur={ROUGE} epaisseur={3} texte="F" tx={X(d.xA) + (r.u[0] ?? 0) * 40 + 8} ty={Y(d.yA) - (r.u[1] ?? 0) * 40 - 6} />
      {[
        [d.xA, d.yA, 'A'],
        [d.xB, d.yB, 'B'],
      ].map(([x, y, nom]) => (
        <g key={nom as string}>
          <circle cx={X(x as number)} cy={Y(y as number)} r={4} fill="var(--trait)" />
          <Etiquette x={X(x as number) - 8} y={Y(y as number) - 6} ancre="end" taille={13} gras>
            {nom as string}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={(X(d.xA) + X(d.xB)) / 2 + 10} y={(Y(d.yA) + Y(d.yB)) / 2 + 22} taille={11.5}>
        L = {n2(r.L)} m
      </Etiquette>

      <line x1={340} y1={14} x2={340} y2={276} className="t-fin" strokeDasharray="3 4" />
      <Etiquette x={480} y={24} ancre="middle" taille={11.5} classe="etiquette">
        la force à l’échelle : 1 cm ↔ {nombre(d.echelle, 1)} kN
      </Etiquette>
      <line x1={ox} y1={oy} x2={fx} y2={oy} stroke={BLEU} strokeWidth={1.4} strokeDasharray="5 3" />
      <line x1={fx} y1={oy} x2={fx} y2={fy} stroke={VERT} strokeWidth={1.4} strokeDasharray="5 3" />
      <Fleche x1={ox} y1={oy} x2={fx} y2={fy} couleur={ROUGE} epaisseur={3} texte={`F = ${n2(d.T)} kN`} tx={(ox + fx) / 2 + (Fx < 0 ? 10 : -10)} ty={(oy + fy) / 2} ancre={Fx < 0 ? 'start' : 'end'} />
      <Etiquette x={(ox + fx) / 2} y={oy + (Fy < 0 ? -6 : 16)} ancre="middle" taille={11.5} couleur={BLEU}>
        Fx = {n2(Fx)}
      </Etiquette>
      <Etiquette x={fx + (Fx < 0 ? -6 : 6)} y={(oy + fy) / 2 + 4} ancre={Fx < 0 ? 'end' : 'start'} taille={11.5} couleur={VERT}>
        Fy = {n2(Fy)}
      </Etiquette>
      {Array.from({ length: nbCm + 1 }, (_, i) => i).map((i) => (
        <g key={i}>
          <line x1={360 + i * pxCm} y1={262} x2={360 + i * pxCm} y2={i % 5 === 0 ? 252 : 256} className="t-fin" />
          {i === 0 || i === nbCm ? (
            <Etiquette x={360 + i * pxCm} y={250} ancre="middle" taille={10}>
              {i} cm
            </Etiquette>
          ) : null}
        </g>
      ))}
      <line x1={360} y1={262} x2={360 + nbCm * pxCm} y2={262} className="t-fin" />
      <Etiquette x={360 + nbCm * pxCm + 8} y={266} taille={10.5} classe="etiquette">
        flèche : {nombre(r.fleche, 1)} cm
      </Etiquette>
    </Figure>
  );
}

// ---------- Somme de forces (N0.6.2) ----------

export function PolygoneForces({ s }: { s: ResultatSomme }) {
  const vs = [...s.forces.map((f) => [f[0], f[1]]), s.R];
  const kf = 105 / Math.max(...vs.map((v) => norme(v)), 1e-9);
  const O: P2 = [160, 135];
  const fin = (v: readonly number[], o: P2 = O): P2 => [o[0] + (v[0] ?? 0) * kf, o[1] - (v[1] ?? 0) * kf];
  const couleurs = [BLEU, 'var(--color-brique)', 'var(--color-terre)'];
  // polygone : on le recadre dans le panneau de droite
  const pts = s.polygone.map((p) => [(p[0] ?? 0) * kf, -(p[1] ?? 0) * kf]);
  const xs = pts.map((p) => p[0]!);
  const ys = pts.map((p) => p[1]!);
  const dx = 470 - (Math.min(...xs) + Math.max(...xs)) / 2;
  const dy = 135 - (Math.min(...ys) + Math.max(...ys)) / 2;
  const Q = (i: number): P2 => [pts[i]![0]! + dx, pts[i]![1]! + dy];
  // résultante nulle aux arrondis près : le polygone se ferme (équilibre)
  const ferme = s.norme < 1e-9 * Math.max(...s.forces.map((f) => norme(f)), 1);
  const alt = ferme
    ? `Équilibre de ${s.forces.length} forces appliquées au même point : mises bout à bout, elles reviennent au point de départ ; le polygone est fermé, la résultante est nulle`
    : `Somme de ${s.forces.length} forces : résultante de ${n2(s.norme)} kN à ${nombre(s.theta, 2)}° ; à gauche les forces appliquées au même point et le parallélogramme, à droite le polygone des forces`;
  return (
    <Figure alt={alt} largeur={620} hauteur={270}>
      <Etiquette x={160} y={18} ancre="middle" taille={11.5} classe="etiquette">
        forces au même point
      </Etiquette>
      {s.forces.length === 2 ? (
        <>
          <line x1={fin(s.forces[0]!)[0]} y1={fin(s.forces[0]!)[1]} x2={fin(s.R)[0]} y2={fin(s.R)[1]} className="t-fin" strokeDasharray="5 3" />
          <line x1={fin(s.forces[1]!)[0]} y1={fin(s.forces[1]!)[1]} x2={fin(s.R)[0]} y2={fin(s.R)[1]} className="t-fin" strokeDasharray="5 3" />
        </>
      ) : null}
      {s.forces.map((f, i) => (
        <Fleche key={i} x1={O[0]} y1={O[1]} x2={fin(f)[0]} y2={fin(f)[1]} couleur={couleurs[i % 3]} texte={`F${i + 1}`} tx={fin(f)[0] + 6} ty={fin(f)[1] - 4} />
      ))}
      <Fleche x1={O[0]} y1={O[1]} x2={fin(s.R)[0]} y2={fin(s.R)[1]} couleur={VERT} epaisseur={3.2} texte="R" tx={fin(s.R)[0] + 8} ty={fin(s.R)[1] + 4} />
      <circle cx={O[0]} cy={O[1]} r={3.5} fill="var(--trait)" />
      <Etiquette x={O[0] - 8} y={O[1] + 16} ancre="end" taille={12} gras>
        O
      </Etiquette>

      <line x1={320} y1={20} x2={320} y2={250} className="t-fin" strokeDasharray="3 4" />
      <Etiquette x={470} y={18} ancre="middle" taille={11.5} classe="etiquette">
        polygone des forces (bout à bout)
      </Etiquette>
      {s.forces.map((_, i) => (
        <Fleche
          key={i}
          x1={Q(i)[0]}
          y1={Q(i)[1]}
          x2={Q(i + 1)[0]}
          y2={Q(i + 1)[1]}
          couleur={couleurs[i % 3]}
          texte={`F${i + 1}`}
          tx={(Q(i)[0] + Q(i + 1)[0]) / 2 + 8}
          ty={(Q(i)[1] + Q(i + 1)[1]) / 2 - 6}
        />
      ))}
      {ferme ? (
        <Etiquette x={470} y={258} ancre="middle" taille={12.5} gras couleur={VERT}>
          polygone fermé : R = 0
        </Etiquette>
      ) : null}
      <Fleche x1={Q(0)[0]} y1={Q(0)[1]} x2={Q(pts.length - 1)[0]} y2={Q(pts.length - 1)[1]} couleur={VERT} epaisseur={3.2} texte={`R = ${n2(s.norme)} kN`} tx={(Q(0)[0] + Q(pts.length - 1)[0]) / 2 - 10} ty={(Q(0)[1] + Q(pts.length - 1)[1]) / 2 + 16} ancre="end" />
    </Figure>
  );
}

/** Produit d'un vecteur par un nombre : 1,35 G (coefficient de l'EC0), 0,5 G et −G. */
export function ProduitParNombre({ G = 80 }: { G?: number }) {
  const g = [0, -G];
  const cas: Array<{ k: number; nom: string; couleur: string }> = [
    { k: 1, nom: 'G', couleur: BLEU },
    { k: GAMMA_G, nom: `${nombre(GAMMA_G, 2)} G`, couleur: ROUGE },
    { k: 0.5, nom: '0,5 G', couleur: 'var(--color-terre)' },
    { k: -1, nom: '−G', couleur: VERT },
  ];
  const kf = 120 / (GAMMA_G * G);
  const y0 = 110;
  return (
    <Figure alt={`Vecteur G de ${nombre(G, 0)} kN vers le bas, puis ${nombre(GAMMA_G, 2)} G, 0,5 G et −G : même direction, normes et sens différents`} largeur={620} hauteur={290}>
      <line x1={40} y1={y0} x2={590} y2={y0} className="t-fin" strokeDasharray="3 4" />
      {cas.map((c, i) => {
        const v = fois(c.k, g);
        const x = 100 + i * 140;
        const y2 = y0 - (v[1] ?? 0) * kf;
        return (
          <g key={c.nom}>
            <Fleche x1={x} y1={y0} x2={x} y2={y2} couleur={c.couleur} epaisseur={3} />
            <Etiquette x={x + 10} y={(y0 + y2) / 2} taille={13} gras couleur={c.couleur}>
              {c.nom}
            </Etiquette>
            <Etiquette x={x} y={c.k > 0 ? y2 + 22 : y2 - 10} ancre="middle" taille={11.5}>
              {nombre(norme(v), 0)} kN {c.k > 0 ? 'vers le bas' : 'vers le haut'}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

// ---------- Composantes et projections (N0.6.3) ----------

/**
 * À gauche, une force F (direction θ) décomposée sur les axes x et y ; à droite, le poids P d'un bloc
 * décomposé selon un versant de pente α : P sin α le long du versant, P cos α perpendiculairement.
 */
export function DecompositionSchema({ F, theta, P, alpha, prefixe = 'dec' }: { F: number; theta: number; P: number; alpha: number; prefixe?: string }) {
  const k = 92;
  const O: P2 = [150, 168];
  const [fx, fy] = [k * cosD(theta), -k * sinD(theta)];
  const ca = cosD(alpha);
  const sa = sinD(alpha);
  // versant : pied à gauche, montée vers la droite
  const pied: P2 = [352, 250];
  const long = 252;
  const haut: P2 = [pied[0] + long * ca, pied[1] - long * sa];
  const B: P2 = [pied[0] + 0.5 * long * ca, pied[1] - 0.5 * long * sa];
  const C: P2 = [B[0] - 19 * sa, B[1] - 19 * ca];
  const kp = 88;
  const para: P2 = [C[0] - kp * sa * ca, C[1] + kp * sa * sa];
  const perp: P2 = [C[0] + kp * ca * sa, C[1] + kp * ca * ca];
  const bas: P2 = [C[0], C[1] + kp];
  const arcP = (r: number) => {
    const a0: P2 = [C[0], C[1] + r];
    const a1: P2 = [C[0] + r * sa, C[1] + r * ca];
    return `M${a0[0]} ${a0[1]} A${r} ${r} 0 0 0 ${a1[0]} ${a1[1]}`;
  };
  return (
    <Figure
      alt={`À gauche, force de ${n2(F)} kN à ${nombre(theta, 2)}° décomposée en Fx = ${n2(F * cosD(theta))} kN et Fy = ${n2(F * sinD(theta))} kN. À droite, bloc de ${n2(P)} kN sur un versant de ${nombre(alpha, 0)}° : ${n2(P * sa)} kN le long du versant et ${n2(P * ca)} kN perpendiculairement`}
      largeur={620}
      hauteur={290}
    >
      <Hachures prefixe={prefixe} types={['terre']} />
      <Etiquette x={150} y={18} ancre="middle" taille={11.5} classe="etiquette">
        axes x et y
      </Etiquette>
      <line x1={O[0] - 110} y1={O[1]} x2={O[0] + 125} y2={O[1]} className="t-fin" />
      <line x1={O[0]} y1={O[1] + 100} x2={O[0]} y2={O[1] - 128} className="t-fin" />
      <Etiquette x={O[0] + 128} y={O[1] + 16} taille={12} gras>
        x
      </Etiquette>
      <Etiquette x={O[0] + 8} y={O[1] - 124} taille={12} gras>
        y
      </Etiquette>
      <line x1={O[0] + fx} y1={O[1] + fy} x2={O[0] + fx} y2={O[1]} className="t-fin" strokeDasharray="5 3" />
      <line x1={O[0] + fx} y1={O[1] + fy} x2={O[0]} y2={O[1] + fy} className="t-fin" strokeDasharray="5 3" />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + fx} y2={O[1]} couleur={BLEU} epaisseur={3} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] + fy} couleur={VERT} epaisseur={3} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + fx} y2={O[1] + fy} couleur={ROUGE} epaisseur={3.2} texte={`F = ${n2(F)} kN`} tx={O[0] + fx + 8} ty={O[1] + fy - 4} />
      <path d={`M${O[0] + 34} ${O[1]} A34 34 0 0 ${theta > 180 ? 1 : 0} ${O[0] + 34 * cosD(theta)} ${O[1] - 34 * sinD(theta)}`} fill="none" className="t-moyen" />
      <Etiquette x={O[0] + 40} y={O[1] - 10} taille={12} gras>
        θ
      </Etiquette>
      <Etiquette x={O[0] + fx / 2} y={O[1] + (fy < 0 ? 20 : -10)} ancre="middle" taille={12} gras couleur={BLEU}>
        Fx = F cos θ = {n2(F * cosD(theta))} kN
      </Etiquette>
      <Etiquette x={O[0] - 8} y={O[1] + fy / 2} ancre="end" taille={12} gras couleur={VERT}>
        Fy = F sin θ = {n2(F * sinD(theta))} kN
      </Etiquette>

      <line x1={322} y1={14} x2={322} y2={276} className="t-fin" strokeDasharray="3 4" />
      <Etiquette x={470} y={18} ancre="middle" taille={11.5} classe="etiquette">
        axes du versant (α = {nombre(alpha, 0)}°)
      </Etiquette>
      <polygon points={points([pied, haut, [haut[0], haut[1] + 14], [pied[0], pied[1] + 14]])} fill={hachure(prefixe, 'terre')} stroke="none" />
      <line x1={pied[0]} y1={pied[1]} x2={haut[0]} y2={haut[1]} className="t-fort" />
      <line x1={pied[0]} y1={pied[1]} x2={pied[0] + 92} y2={pied[1]} className="t-fin" strokeDasharray="5 3" />
      <path d={`M${pied[0] + 60} ${pied[1]} A60 60 0 0 0 ${pied[0] + 60 * ca} ${pied[1] - 60 * sa}`} fill="none" className="t-moyen" />
      <Etiquette x={pied[0] + 74} y={pied[1] - 6} taille={12} gras>
        α
      </Etiquette>
      <rect x={C[0] - 26} y={C[1] - 19} width={52} height={38} transform={`rotate(${-alpha} ${C[0]} ${C[1]})`} className="t-fort" fill="var(--color-beton-clair)" />
      <line x1={bas[0]} y1={bas[1]} x2={para[0]} y2={para[1]} className="t-fin" strokeDasharray="5 3" />
      <line x1={bas[0]} y1={bas[1]} x2={perp[0]} y2={perp[1]} className="t-fin" strokeDasharray="5 3" />
      <Fleche x1={C[0]} y1={C[1]} x2={para[0]} y2={para[1]} couleur={BLEU} epaisseur={3} />
      <Fleche x1={C[0]} y1={C[1]} x2={perp[0]} y2={perp[1]} couleur={VERT} epaisseur={3} />
      <Fleche x1={C[0]} y1={C[1]} x2={bas[0]} y2={bas[1]} couleur={ROUGE} epaisseur={3.2} texte={`P = ${n2(P)} kN`} tx={bas[0] - 8} ty={bas[1] + 16} ancre="end" />
      <path d={arcP(30)} fill="none" className="t-moyen" />
      <Etiquette x={C[0] + 38 * sinD(alpha / 2)} y={C[1] + 38 * cosD(alpha / 2) + 4} taille={12} gras>
        α
      </Etiquette>
      <Etiquette x={para[0] - 6} y={para[1] - 10} ancre="end" taille={12} gras couleur={BLEU}>
        P sin α
      </Etiquette>
      <Etiquette x={para[0] - 6} y={para[1] + 6} ancre="end" taille={12} gras couleur={BLEU}>
        = {n2(P * sa)} kN
      </Etiquette>
      <Etiquette x={perp[0] + 8} y={perp[1] - 4} taille={12} gras couleur={VERT}>
        P cos α
      </Etiquette>
      <Etiquette x={perp[0] + 8} y={perp[1] + 12} taille={12} gras couleur={VERT}>
        = {n2(P * ca)} kN
      </Etiquette>
    </Figure>
  );
}

// ---------- Élingage (N0.6.3) ----------

export function ElinguesSchema({ d, r, prefixe = 'el' }: { d: DonneesElingues; r: ResultatElingues; prefixe?: string }) {
  if (!r.valide) {
    return (
      <Figure alt="Angles impossibles : les deux brins ne peuvent pas porter la charge" largeur={620} hauteur={60}>
        <Etiquette x={310} y={34} ancre="middle" taille={13} couleur={ROUGE}>
          Angles impossibles : chaque brin doit monter vers le crochet.
        </Etiquette>
      </Figure>
    );
  }
  const cot = (a: number) => cosD(a) / sinD(a);
  const h = Math.min(150, 280 / (cot(d.alpha1) + cot(d.alpha2)));
  const H: P2 = [180, 46];
  const L1: P2 = [H[0] - h * cot(d.alpha1), H[1] + h];
  const L2: P2 = [H[0] + h * cot(d.alpha2), H[1] + h];
  const yb = H[1] + h;
  // triangle des forces au crochet : P (câble de la grue, vers le haut), puis T1 et T2 le long des brins
  const kf = 170 / Math.max(d.P, r.T1, r.T2);
  const S0: P2 = [500, 230];
  const S1: P2 = [S0[0], S0[1] - d.P * kf];
  const S2: P2 = [S1[0] - r.T1 * kf * cosD(d.alpha1), S1[1] + r.T1 * kf * sinD(d.alpha1)];
  const arc = (x: number, y: number, a: number, gauche: boolean) => {
    const R = 26;
    const [ex, ey] = [x + (gauche ? 1 : -1) * R * cosD(a), y - R * sinD(a)];
    return <path d={`M${x + (gauche ? R : -R)} ${y} A${R} ${R} 0 0 ${gauche ? 0 : 1} ${ex} ${ey}`} fill="none" className="t-moyen" />;
  };
  return (
    <Figure
      alt={`Poutre de ${n2(d.P)} kN levée par deux brins inclinés de ${nombre(d.alpha1, 0)}° et ${nombre(d.alpha2, 0)}° sur l'horizontale : tensions ${n2(r.T1)} kN et ${n2(r.T2)} kN ; à droite, le triangle des forces au crochet`}
      largeur={620}
      hauteur={290}
    >
      <Hachures prefixe={prefixe} types={['ba']} />
      <line x1={H[0]} y1={6} x2={H[0]} y2={H[1] - 8} className="t-moyen" />
      <circle cx={H[0]} cy={H[1]} r={7} fill="none" className="t-fort" />
      <rect x={Math.min(L1[0], H[0]) - 26} y={yb} width={Math.max(L2[0], H[0]) - Math.min(L1[0], H[0]) + 52} height={20} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <line x1={H[0]} y1={H[1]} x2={L1[0]} y2={L1[1]} stroke={BLEU} strokeWidth={2.4} />
      <line x1={H[0]} y1={H[1]} x2={L2[0]} y2={L2[1]} stroke="var(--color-brique)" strokeWidth={2.4} />
      {arc(L1[0], L1[1], d.alpha1, true)}
      {arc(L2[0], L2[1], d.alpha2, false)}
      <Etiquette x={L1[0] + 30} y={L1[1] - 6} taille={12} gras>
        {nombre(d.alpha1, 0)}°
      </Etiquette>
      <Etiquette x={L2[0] - 30} y={L2[1] - 6} ancre="end" taille={12} gras>
        {nombre(d.alpha2, 0)}°
      </Etiquette>
      <Etiquette x={(H[0] + L1[0]) / 2 - 8} y={(H[1] + L1[1]) / 2} ancre="end" taille={12.5} gras couleur={BLEU}>
        T1 = {n2(r.T1)} kN
      </Etiquette>
      <Etiquette x={(H[0] + L2[0]) / 2 + 8} y={(H[1] + L2[1]) / 2} taille={12.5} gras couleur="var(--color-brique)">
        T2 = {n2(r.T2)} kN
      </Etiquette>
      <Etiquette x={H[0] + 12} y={H[1] + 4} taille={11} classe="etiquette">
        crochet ({nombre(r.angleSommet, 0)}° entre brins)
      </Etiquette>
      <Fleche x1={H[0]} y1={yb + 22} x2={H[0]} y2={yb + 62} couleur={ROUGE} texte={`P = ${n2(d.P)} kN`} tx={H[0] + 8} ty={yb + 50} />

      <line x1={370} y1={14} x2={370} y2={276} className="t-fin" strokeDasharray="3 4" />
      <Etiquette x={495} y={20} ancre="middle" taille={11.5} classe="etiquette">
        équilibre du crochet : triangle fermé
      </Etiquette>
      <Fleche x1={S0[0]} y1={S0[1]} x2={S1[0]} y2={S1[1]} couleur={ROUGE} texte="P" tx={S0[0] + 8} ty={(S0[1] + S1[1]) / 2} />
      <Fleche x1={S1[0]} y1={S1[1]} x2={S2[0]} y2={S2[1]} couleur={BLEU} texte="T1" tx={(S1[0] + S2[0]) / 2 - 8} ty={(S1[1] + S2[1]) / 2 - 4} ancre="end" />
      <Fleche x1={S2[0]} y1={S2[1]} x2={S0[0]} y2={S0[1]} couleur="var(--color-brique)" texte="T2" tx={(S2[0] + S0[0]) / 2 - 8} ty={(S2[1] + S0[1]) / 2 + 16} ancre="end" />
    </Figure>
  );
}

// ---------- Produit scalaire (N0.6.4) ----------

export function ProjectionScalaire({ theta = 50 }: { theta?: number }) {
  const O: P2 = [90, 200];
  const lu = 330;
  const lv = 190;
  const V: P2 = [O[0] + lv * cosD(theta), O[1] - lv * sinD(theta)];
  const Hp: P2 = [V[0], O[1]];
  return (
    <Figure alt={`Vecteurs u et v faisant un angle de ${theta}° : la projection de v sur u mesure ‖v‖ cos θ, et u · v = ‖u‖ × ‖v‖ cos θ`} largeur={620} hauteur={250}>
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + lu} y2={O[1]} couleur={BLEU} epaisseur={3} texte="u" tx={O[0] + lu + 6} ty={O[1] + 4} />
      <Fleche x1={O[0]} y1={O[1]} x2={V[0]} y2={V[1]} couleur={ROUGE} epaisseur={3} texte="v" tx={V[0] + 8} ty={V[1]} />
      <line x1={V[0]} y1={V[1]} x2={Hp[0]} y2={Hp[1]} className="t-fin" strokeDasharray="5 3" />
      <polyline points={points([[Hp[0] - 10, Hp[1]], [Hp[0] - 10, Hp[1] - 10], [Hp[0], Hp[1] - 10]])} fill="none" className="t-fin" />
      <line x1={O[0]} y1={O[1] + 22} x2={Hp[0]} y2={O[1] + 22} stroke={VERT} strokeWidth={3} />
      <Etiquette x={(O[0] + Hp[0]) / 2} y={O[1] + 40} ancre="middle" taille={12.5} gras couleur={VERT}>
        projection de v sur u : ‖v‖ cos θ
      </Etiquette>
      <path d={`M${O[0] + 46} ${O[1]} A46 46 0 0 0 ${O[0] + 46 * cosD(theta)} ${O[1] - 46 * sinD(theta)}`} fill="none" className="t-moyen" />
      <Etiquette x={O[0] + 54} y={O[1] - 14} taille={13} gras>
        θ
      </Etiquette>
      <Etiquette x={440} y={70} taille={13} gras>
        u · v = ‖u‖ × ‖v‖ × cos θ
      </Etiquette>
      <Etiquette x={440} y={92} taille={12}>
        θ &lt; 90° : produit positif
      </Etiquette>
      <Etiquette x={440} y={110} taille={12}>
        θ = 90° : produit nul
      </Etiquette>
      <Etiquette x={440} y={128} taille={12}>
        θ &gt; 90° : produit négatif
      </Etiquette>
    </Figure>
  );
}

/** Contrôle d'équerrage : l'écart angulaire est exagéré pour être visible, et la légende le dit. */
export function EquerrageSchema({ d, r, exageration = 20 }: { d: DonneesEquerrage; r: ResultatEquerrage; exageration?: number }) {
  // dessin dans le repère de AB (AB vers la droite) ; D du côté où il est réellement (signe de AB × AD)
  const sens = vectoriel2(r.AB, r.AD) < 0 ? -1 : 1;
  const dirAD = sens * (90 + r.ecart * exageration); // direction dessinée de AD
  const k = Math.min(380 / r.nAB, 190 / r.nAD);
  const A: P2 = [130, sens > 0 ? 230 : 40];
  const B: P2 = [A[0] + r.nAB * k, A[1]];
  const D: P2 = [A[0] + r.nAD * k * cosD(dirAD), A[1] - r.nAD * k * sinD(dirAD)];
  const Dp: P2 = [A[0], A[1] - sens * r.nAD * k];
  return (
    <Figure alt={`Angle BAD mesuré par le produit scalaire : ${nombre(r.theta, 3)}°, soit un écart de ${nombre(r.ecart, 3)}° avec l'angle droit ; D est à déplacer de ${nombre(r.decalage * 100, 1)} cm`} largeur={620} hauteur={270}>
      <Fleche x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} couleur={BLEU} epaisseur={2.6} texte={`AB (${n2(r.nAB)} m)`} tx={(A[0] + B[0]) / 2} ty={A[1] + 20} ancre="middle" />
      <Fleche x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} couleur={ROUGE} epaisseur={2.6} texte={`AD (${n2(r.nAD)} m)`} tx={D[0] - 10} ty={(A[1] + D[1]) / 2} ancre="end" />
      <line x1={A[0]} y1={A[1]} x2={Dp[0]} y2={Dp[1]} stroke={VERT} strokeWidth={1.6} strokeDasharray="6 4" />
      <polyline points={points([[A[0] + 14, A[1]], [A[0] + 14, A[1] - sens * 14], [A[0], A[1] - sens * 14]])} fill="none" stroke={VERT} strokeWidth={1.2} />
      <line x1={D[0]} y1={D[1]} x2={Dp[0]} y2={Dp[1]} stroke={VERT} strokeWidth={2} />
      {[
        [A, 'A'],
        [B, 'B'],
        [D, 'D'],
        [Dp, 'D′'],
      ].map(([p, nom]) => (
        <g key={nom as string}>
          <circle cx={(p as P2)[0]} cy={(p as P2)[1]} r={3.5} fill={nom === 'D′' ? VERT : 'var(--trait)'} />
          <Etiquette x={(p as P2)[0] + (nom === 'D' && D[0] < Dp[0] ? -8 : 8)} y={(p as P2)[1] - 6} ancre={nom === 'D' && D[0] < Dp[0] ? 'end' : 'start'} taille={13} gras couleur={nom === 'D′' ? VERT : undefined}>
            {nom as string}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={420} y={60} taille={13} gras>
        θ = {nombre(r.theta, 3)}°
      </Etiquette>
      <Etiquette x={420} y={82} taille={12}>
        écart : {nombre(r.ecart, 3)}°
      </Etiquette>
      <Etiquette x={420} y={104} taille={12} couleur={VERT}>
        D → D′ : {nombre(r.decalage * 100, 1)} cm
      </Etiquette>
      <Etiquette x={420} y={140} taille={10.5} classe="etiquette">
        écart angulaire exagéré ×{exageration}
      </Etiquette>
      <Etiquette x={420} y={156} taille={10.5} classe="etiquette">
        sur le dessin, pour être visible
      </Etiquette>
    </Figure>
  );
}

// ---------- Moment d'une force (N0.6.5) ----------

export function MomentSchema({ d, r, prefixe = 'mom' }: { d: DonneesMoment; r: ResultatMoment; prefixe?: string }) {
  const A = [d.xA, d.yA];
  const u = d.F === 0 ? [1, 0] : unitaire(r.Fv);
  const proj = -((A[0] ?? 0) * (u[0] ?? 0) + (A[1] ?? 0) * (u[1] ?? 0)); // (O − A) · û
  const Hf = [(A[0] ?? 0) + proj * (u[0] ?? 0), (A[1] ?? 0) + proj * (u[1] ?? 0)];
  const lf = Math.max(Math.hypot(d.xA, d.yA), r.bras, 1) * 0.45; // longueur dessinée de la force (m de dessin)
  const Ft = [(A[0] ?? 0) + lf * (u[0] ?? 0), (A[1] ?? 0) + lf * (u[1] ?? 0)];
  const pts = [[0, 0], A, Hf, Ft];
  const xs = pts.map((p) => p[0] ?? 0);
  const ys = pts.map((p) => p[1] ?? 0);
  const [xmin, xmax, ymin, ymax] = [Math.min(...xs) - 1, Math.max(...xs) + 1, Math.min(...ys) - 1, Math.max(...ys) + 1];
  const k = Math.min(420 / (xmax - xmin), 240 / (ymax - ymin));
  const X = (x: number) => 40 + (x - xmin) * k;
  const Y = (y: number) => 270 - (y - ymin) * k;
  const ext = 3 * Math.max(xmax - xmin, ymax - ymin);
  const l1 = [(A[0] ?? 0) - ext * (u[0] ?? 0), (A[1] ?? 0) - ext * (u[1] ?? 0)];
  const l2 = [(A[0] ?? 0) + ext * (u[0] ?? 0), (A[1] ?? 0) + ext * (u[1] ?? 0)];
  const trig = r.sens === 'trigonométrique';
  return (
    <Figure alt={`Force de ${n2(d.F)} kN appliquée en A(${n2(d.xA)} ; ${n2(d.yA)}) : moment en O de ${n2(r.M)} kN·m, bras de levier ${n2(r.bras)} m`} largeur={620} hauteur={300}>
      <defs>
        <clipPath id={`${prefixe}-cadre`}>
          <rect x={10} y={10} width={480} height={280} />
        </clipPath>
      </defs>
      <line x1={X(l1[0] ?? 0)} y1={Y(l1[1] ?? 0)} x2={X(l2[0] ?? 0)} y2={Y(l2[1] ?? 0)} className="t-axe" clipPath={`url(#${prefixe}-cadre)`} />
      <line x1={X(0)} y1={Y(0)} x2={X(d.xA)} y2={Y(d.yA)} className="t-fort" strokeWidth={4} />
      {r.bras > 1e-6 ? (
        <>
          <line x1={X(0)} y1={Y(0)} x2={X(Hf[0] ?? 0)} y2={Y(Hf[1] ?? 0)} stroke={VERT} strokeWidth={2} strokeDasharray="6 3" />
          <Etiquette x={(X(0) + X(Hf[0] ?? 0)) / 2 + 8} y={(Y(0) + Y(Hf[1] ?? 0)) / 2 + 14} taille={12.5} gras couleur={VERT}>
            d = {n2(r.bras)} m
          </Etiquette>
          <circle cx={X(Hf[0] ?? 0)} cy={Y(Hf[1] ?? 0)} r={3} fill={VERT} />
        </>
      ) : null}
      <Fleche x1={X(d.xA)} y1={Y(d.yA)} x2={X(Ft[0] ?? 0)} y2={Y(Ft[1] ?? 0)} couleur={ROUGE} epaisseur={3.2} texte={`F = ${n2(d.F)} kN`} tx={X(Ft[0] ?? 0) + 8} ty={Y(Ft[1] ?? 0)} />
      {r.sens !== 'nul' ? <ArcMoment cx={X(0)} cy={Y(0)} r={30} a0={trig ? 200 : 340} a1={trig ? 340 : 200} couleur={BLEU} texte={`M = ${n2(r.M)} kN·m`} tx={X(0) + 40} ty={Y(0) + 30} /> : null}
      <circle cx={X(0)} cy={Y(0)} r={4} fill="var(--trait)" />
      <Etiquette x={X(0) - 8} y={Y(0) - 8} ancre="end" taille={13} gras>
        O
      </Etiquette>
      <circle cx={X(d.xA)} cy={Y(d.yA)} r={4} fill="var(--trait)" />
      <Etiquette x={X(d.xA) - 8} y={Y(d.yA) - 6} ancre="end" taille={13} gras>
        A
      </Etiquette>
      <Etiquette x={500} y={60} taille={12} classe="etiquette">
        ligne d’action
      </Etiquette>
      <Etiquette x={500} y={78} taille={12} classe="etiquette">
        (trait mixte)
      </Etiquette>
      <Etiquette x={500} y={120} taille={12.5} gras couleur={BLEU}>
        sens {r.sens === 'nul' ? '—' : r.sens}
      </Etiquette>
    </Figure>
  );
}

/** Trièdre direct et produit vectoriel : u × v est perpendiculaire à u et à v (règle de la main droite). */
export function TriedreVectoriel() {
  const { P } = cadreIsoDirect([[0, 0, 0], [1.6, 0, 0], [0, 1.6, 0], [0, 0, 1.6], [0, 0, -0.4]], 620, 270);
  const O: Point3 = [0, 0, 0];
  const [cx, cy] = P(O);
  const arcPts: Point3[] = Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * (Math.PI / 2);
    return [0.55 * Math.cos(a), 0.55 * Math.sin(a), 0];
  });
  const arcEcran = arcPts.map(P);
  const fin = arcEcran[arcEcran.length - 1]!;
  const avant = arcEcran[arcEcran.length - 2]!;
  return (
    <Figure alt="Trièdre direct : u selon x, v selon y ; u × v est dirigé selon z, perpendiculaire aux deux, dans le sens donné par la règle de la main droite" largeur={620} hauteur={270}>
      {(
        [
          [[1.6, 0, 0], 'x'],
          [[0, 1.6, 0], 'y'],
          [[0, 0, 1.6], 'z'],
        ] as Array<[Point3, string]>
      ).map(([q, nom]) => (
        <g key={nom}>
          <line x1={cx} y1={cy} x2={P(q)[0]} y2={P(q)[1]} className="t-fin" />
          <Etiquette x={P(q)[0] + 6} y={P(q)[1] + 4} taille={12} classe="etiquette">
            {nom}
          </Etiquette>
        </g>
      ))}
      <Fleche3 P={P} de={O} vers={[1.2, 0, 0]} couleur={BLEU} epaisseur={3} texte="u" tx={P([1.2, 0, 0])[0] - 6} ty={P([1.2, 0, 0])[1] + 18} ancre="end" />
      <Fleche3 P={P} de={O} vers={[0, 1.0, 0]} couleur="var(--color-brique)" epaisseur={3} texte="v" tx={P([0, 1.0, 0])[0] + 8} ty={P([0, 1.0, 0])[1] + 16} />
      <Fleche3 P={P} de={O} vers={[0, 0, 1.2]} couleur={ROUGE} epaisseur={3} texte="u × v" tx={P([0, 0, 1.2])[0] + 10} ty={P([0, 0, 1.2])[1] + 6} />
      <polyline points={points(arcEcran)} fill="none" stroke="var(--trait-doux)" strokeWidth={1.4} />
      <Fleche x1={avant[0]} y1={avant[1]} x2={fin[0]} y2={fin[1]} couleur="var(--trait-doux)" epaisseur={1.4} tete={8} />
      <Etiquette x={430} y={70} taille={12.5} gras>
        u × v ⟂ u et u × v ⟂ v
      </Etiquette>
      <Etiquette x={430} y={92} taille={12}>
        ‖u × v‖ = ‖u‖ ‖v‖ sin θ
      </Etiquette>
      <Etiquette x={430} y={114} taille={12}>
        sens : on tourne de u vers v,
      </Etiquette>
      <Etiquette x={430} y={130} taille={12}>
        le pouce droit indique u × v
      </Etiquette>
      <Etiquette x={430} y={156} taille={12}>
        v × u = −(u × v)
      </Etiquette>
    </Figure>
  );
}

/** Potence (lampadaire, panneau) : forces en bout de bras et moments au pied, en vecteurs à deux pointes. */
export function PotenceIso({ d, M }: { d: DonneesPotence; M: Vec3 }) {
  const top: Point3 = [0, 0, d.hauteur];
  const E: Point3 = [d.bras, 0, d.hauteur];
  const lF = 1.6 / Math.max(d.P, d.V, 1e-9); // m de dessin par kN
  const { P, poly, hauteur } = cadreIsoDirect(
    [[-1, -1, 0], [d.bras + 1, 1.5, 0], [0, 0, d.hauteur + 0.6], [d.bras, 0, d.hauteur - d.P * lF - 0.3], [d.bras, d.V * lF + 0.4, d.hauteur]],
    380,
    380,
  );
  const O: Point3 = [0, 0, 0];
  // Encart des moments : mêmes axes et même projection, dessiné à droite pour ne pas se confondre avec le mât.
  const S: P2 = [492, hauteur * 0.6];
  const ecran = (v: readonly number[]): P2 => {
    const a = P([v[0] ?? 0, v[1] ?? 0, v[2] ?? 0]);
    const b = P(O);
    return [S[0] + a[0] - b[0], S[1] + a[1] - b[1]];
  };
  const lM = 1.9 / Math.max(...M.map(Math.abs), 1e-9); // m de dessin par kN·m
  const noms = ['Mx', 'My', 'Mz'];
  const axes: Point3[] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  return (
    <Figure alt={`Potence : bras de ${n2(d.bras)} m à ${n2(d.hauteur)} m de haut ; charge ${n2(d.P)} kN et vent ${n2(d.V)} kN en bout de bras ; moments au pied Mx = ${n2(M[0])}, My = ${n2(M[1])}, Mz = ${n2(M[2])} kN·m, dessinés dans l'encart de droite`} largeur={620} hauteur={hauteur}>
      <Calque id="structure">
        <polygon points={poly([[-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0]])} fill="var(--fond-beton)" className="t-moyen" />
        <line x1={P(O)[0]} y1={P(O)[1]} x2={P(top)[0]} y2={P(top)[1]} className="t-fort" strokeWidth={5} />
        <line x1={P(top)[0]} y1={P(top)[1]} x2={P(E)[0]} y2={P(E)[1]} className="t-fort" strokeWidth={4} />
        <circle cx={P(E)[0]} cy={P(E)[1]} r={5} fill="var(--color-papier)" className="t-moyen" />
        <circle cx={P(O)[0]} cy={P(O)[1]} r={3.5} fill="var(--trait)" />
        <Etiquette x={P(O)[0] - 10} y={P(O)[1] + 4} ancre="end" taille={13} gras>
          O
        </Etiquette>
      </Calque>
      <Calque id="forces">
        <Fleche3 P={P} de={E} vers={[d.bras, 0, d.hauteur - d.P * lF]} couleur={ROUGE} epaisseur={3} texte={`P = ${n2(d.P)} kN`} tx={P([d.bras, 0, d.hauteur - d.P * lF * 0.6])[0] + 10} ty={P([d.bras, 0, d.hauteur - d.P * lF * 0.6])[1]} />
        <Fleche3 P={P} de={E} vers={[d.bras, d.V * lF, d.hauteur]} couleur="var(--color-brique)" epaisseur={3} texte={`V = ${n2(d.V)} kN (vent, selon y)`} tx={P([d.bras, d.V * lF, d.hauteur])[0] + 8} ty={P([d.bras, d.V * lF, d.hauteur])[1] - 6} />
      </Calque>
      <Calque id="moments">
        <line x1={404} y1={16} x2={404} y2={hauteur - 16} className="t-fin" strokeDasharray="3 4" />
        <Etiquette x={512} y={24} ancre="middle" taille={11.5} classe="etiquette">
          moments en O (vecteurs à double pointe)
        </Etiquette>
        {(['x', 'y', 'z'] as const).map((nom, i) => {
          // l'axe dépasse la pointe du moment qu'il porte, pour que son nom reste lisible
          const q = ecran(fois(Math.max(1.15, (M[i] ?? 0) * lM + 0.35), axes[i]!));
          return (
            <g key={nom}>
              <line x1={S[0]} y1={S[1]} x2={q[0]} y2={q[1]} className="t-fin" strokeDasharray="3 3" />
              <Etiquette x={q[0] + (i === 0 ? -10 : 6)} y={q[1] + (i === 0 ? 12 : -4)} ancre={i === 0 ? 'end' : 'start'} taille={11} classe="etiquette">
                {nom}
              </Etiquette>
            </g>
          );
        })}
        {axes.map((ax, i) => {
          const m = M[i] ?? 0;
          if (Math.abs(m) < 1e-9) return null;
          const q = ecran(fois(m * lM, ax));
          const haut = q[1] < S[1];
          return (
            <Fleche
              key={noms[i]}
              x1={S[0]}
              y1={S[1]}
              x2={q[0]}
              y2={q[1]}
              couleur={BLEU}
              epaisseur={2.6}
              double
              texte={`${noms[i]} = ${n2(m)} kN·m`}
              tx={i === 2 ? q[0] - 10 : q[0]}
              ty={i === 2 ? q[1] + 4 : haut ? q[1] - 12 : q[1] + 22}
              ancre={i === 2 ? 'end' : 'middle'}
            />
          );
        })}
        <circle cx={S[0]} cy={S[1]} r={3.5} fill="var(--trait)" />
      </Calque>
      <Calque id="cotes">
        <Etiquette x={(P(top)[0] + P(E)[0]) / 2} y={(P(top)[1] + P(E)[1]) / 2 - 10} ancre="middle" taille={12} gras>
          bras {n2(d.bras)} m
        </Etiquette>
        <Etiquette x={P([0, 0, d.hauteur / 2])[0] + 10} y={P([0, 0, d.hauteur / 2])[1]} taille={12} gras>
          {n2(d.hauteur)} m
        </Etiquette>
      </Calque>
    </Figure>
  );
}

// ---------- Mât haubané (N0.6.P) ----------

/** Mât haubané en perspective (trièdre direct ; y vers le nord). */
export function MatIso({ d, r }: { d: DonneesMat; r: ResultatMat }) {
  const top: Point3 = [0, 0, d.h];
  const ancr = r.haubans.map((hb) => [d.r * cosD(hb.phi), d.r * sinD(hb.phi), 0] as Point3);
  const R = d.r * 1.25;
  const sol: Point3[] = [[-R, -R, 0], [R, -R, 0], [R, R, 0], [-R, R, 0]];
  const w = depuisPolaire(1, d.psi);
  const lH = d.r * 0.45;
  const queue: Point3 = [-(w[0] ?? 0) * lH, -(w[1] ?? 0) * lH, d.h];
  const { P, poly, hauteur } = cadreIsoDirect([...sol, [0, 0, d.h + 1.5], queue], 620, 380);
  return (
    <Figure alt={`Mât de ${n2(d.h)} m tenu par trois haubans à 120°, ancrés à ${n2(d.r)} m ; effort horizontal de ${n2(d.H)} kN en tête vers ${nombre(d.psi, 0)}° ; tensions ${r.haubans.map((h) => nombre(h.T, 2)).join(', ')} kN`} largeur={620} hauteur={hauteur}>
      <Calque id="mat">
        <polygon points={poly(sol)} fill="var(--fond-terre)" className="t-fin" />
        <line x1={P([0, 0, 0])[0]} y1={P([0, 0, 0])[1]} x2={P([0, 0, d.h + 1.5])[0]} y2={P([0, 0, d.h + 1.5])[1]} className="t-fort" strokeWidth={4} />
      </Calque>
      <Calque id="haubans">
        {r.haubans.map((hb, i) => {
          const actif = hb.T > 1e-6;
          const [x1, y1] = P(top);
          const [x2, y2] = P(ancr[i]!);
          return (
            <g key={hb.phi}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={actif ? ROUGE : GRIS} strokeWidth={actif ? 2.4 : 1.4} strokeDasharray={actif ? undefined : '6 4'} />
              <rect x={x2 - 7} y={y2 - 4} width={14} height={8} fill="var(--fond-beton)" className="t-moyen" />
            </g>
          );
        })}
      </Calque>
      <Calque id="effort">
        <Fleche3 P={P} de={queue} vers={top} couleur={BLEU} epaisseur={3} texte={`H = ${n2(d.H)} kN`} tx={P(queue)[0] + 6} ty={P(queue)[1] - 8} />
      </Calque>
      <Calque id="tensions">
        {r.haubans.map((hb, i) => {
          const m = P([(ancr[i]![0]) * 0.55, (ancr[i]![1]) * 0.55, d.h * 0.45]);
          return (
            <Etiquette key={hb.phi} x={m[0] + 8} y={m[1]} taille={12} gras couleur={hb.T > 1e-6 ? ROUGE : GRIS}>
              {hb.T > 1e-6 ? `T = ${n2(hb.T)} kN` : 'détendu'}
            </Etiquette>
          );
        })}
      </Calque>
      <Calque id="cotes">
        <Etiquette x={P([0, 0, d.h / 2])[0] - 10} y={P([0, 0, d.h / 2])[1]} ancre="end" taille={12} gras>
          h = {n2(d.h)} m
        </Etiquette>
        <Etiquette x={P([0, 0, d.h])[0] + 10} y={P([0, 0, d.h])[1] - 6} taille={11} classe="etiquette">
          attache
        </Etiquette>
        <Etiquette x={P([0, R * 0.95, 0])[0]} y={P([0, R * 0.95, 0])[1] + 14} ancre="middle" taille={11} classe="etiquette">
          nord (y)
        </Etiquette>
      </Calque>
    </Figure>
  );
}

/** Vue en plan : directions des ancrages, effort en tête et sa décomposition sur les haubans tendus. */
export function MatPlan({ d, r }: { d: DonneesMat; r: ResultatMat }) {
  const C: P2 = [230, 150];
  const Rp = 115;
  const kf = 100 / Math.max(d.H, ...r.haubans.map((h) => (Number.isFinite(h.c) ? h.c : 0)), 1e-9);
  const pt = (phi: number, l: number): P2 => [C[0] + l * cosD(phi), C[1] - l * sinD(phi)];
  const tau = d.psi + 180;
  const actifs = r.haubans.filter((h) => h.c > 1e-6);
  const cible = pt(tau, d.H * kf);
  return (
    <Figure alt={`Vue en plan : ancrages à ${r.haubans.map((h) => nombre(h.phi, 0)).join('°, ')}° ; effort ${n2(d.H)} kN vers ${nombre(d.psi, 0)}° ; les haubans doivent fournir ${n2(d.H)} kN vers ${nombre(tau % 360, 0)}°`} largeur={620} hauteur={300}>
      <circle cx={C[0]} cy={C[1]} r={Rp} fill="none" className="t-fin" strokeDasharray="4 4" />
      {r.haubans.map((hb) => {
        const [x, y] = pt(hb.phi, Rp);
        const actif = hb.c > 1e-6;
        return (
          <g key={hb.phi}>
            <line x1={C[0]} y1={C[1]} x2={x} y2={y} stroke={actif ? ROUGE : GRIS} strokeWidth={actif ? 2 : 1.2} strokeDasharray={actif ? undefined : '6 4'} />
            <rect x={x - 6} y={y - 6} width={12} height={12} fill="var(--fond-beton)" className="t-moyen" />
            <Etiquette x={x + (x >= C[0] ? 10 : -10)} y={y + (y > C[1] ? 18 : -8)} ancre={x >= C[0] ? 'start' : 'end'} taille={11.5}>
              {nombre(hb.phi, 0)}° : {actif ? `T = ${n2(hb.T)} kN` : 'détendu'}
            </Etiquette>
          </g>
        );
      })}
      {/* l'effort du vent part de la tête du mât, vers ψ : il ne se superpose pas aux composantes des haubans */}
      <Fleche x1={C[0]} y1={C[1]} x2={pt(d.psi, d.H * kf)[0]} y2={pt(d.psi, d.H * kf)[1]} couleur={BLEU} epaisseur={2.6} pointilles texte={`H = ${n2(d.H)} kN (vers ${nombre(d.psi, 0)}°)`} tx={pt(d.psi, d.H * kf)[0] + 8} ty={pt(d.psi, d.H * kf)[1] + (sinD(d.psi) < 0 ? 16 : -8)} />
      {r.stable && actifs.length === 2 ? (
        <>
          <line x1={pt(actifs[0]!.phi, actifs[0]!.c * kf)[0]} y1={pt(actifs[0]!.phi, actifs[0]!.c * kf)[1]} x2={cible[0]} y2={cible[1]} className="t-fin" strokeDasharray="4 3" />
          <line x1={pt(actifs[1]!.phi, actifs[1]!.c * kf)[0]} y1={pt(actifs[1]!.phi, actifs[1]!.c * kf)[1]} x2={cible[0]} y2={cible[1]} className="t-fin" strokeDasharray="4 3" />
        </>
      ) : null}
      {actifs.map((hb) => {
        const [x, y] = pt(hb.phi, hb.c * kf);
        return <Fleche key={hb.phi} x1={C[0]} y1={C[1]} x2={x} y2={y} couleur="var(--color-brique)" epaisseur={2.6} texte={`c = ${n2(hb.c)}`} tx={(C[0] + x) / 2 + 8} ty={(C[1] + y) / 2 + 14} />;
      })}
      <Fleche x1={C[0]} y1={C[1]} x2={cible[0]} y2={cible[1]} couleur={VERT} epaisseur={3} texte="−H" tx={cible[0] - 8} ty={cible[1] + 16} ancre="end" />
      <circle cx={C[0]} cy={C[1]} r={5} fill="var(--trait)" />
      <Nord x={590} y={40} />
      <Etiquette x={430} y={70} taille={11} classe="etiquette">
        bleu : effort du vent sur la tête
      </Etiquette>
      <Etiquette x={430} y={86} taille={11} classe="etiquette">
        vert : force que les haubans doivent fournir
      </Etiquette>
      <Etiquette x={430} y={102} taille={11} classe="etiquette">
        brique : composantes horizontales c
      </Etiquette>
      <Etiquette x={430} y={118} taille={11} classe="etiquette">
        T = c × L / r (hauban incliné)
      </Etiquette>
    </Figure>
  );
}
