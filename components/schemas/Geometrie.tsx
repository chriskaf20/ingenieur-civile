// Schémas du module N0.5 (géométrie plane et dans l'espace). Les valeurs viennent de lib/calc/geometrie.ts.
import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { Axe, Niveau } from '@/components/drawing/Reperes';
import { TerrainNaturel } from '@/components/drawing/Terrain';
import { Calque } from '@/components/gabarits/Vue3D';
import type {
  DonneesDalleL,
  DonneesFouille,
  DonneesMaison,
  DonneesMassif,
  DonneesSectionT,
  ResultatDalleL,
  ResultatFouille,
  ResultatGravite,
  ResultatMaison,
  ResultatSegment,
} from '@/lib/calc/geometrie';
import type { Point2D } from '@/lib/calc/trigo';
import { projeterIso, type Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
type P2 = readonly [number, number];

/** Mise à l'échelle d'un ensemble de points 3D projetés en isométrie dans un cadre de largeur donnée. */
function cadreIso(pts: Point3[], largeur: number, hauteurMax: number, marge = 30) {
  const proj = pts.map(projeterIso);
  const xs = proj.map((p) => p[0]);
  const ys = proj.map((p) => p[1]);
  const k = Math.min((largeur - 2 * marge) / (Math.max(...xs) - Math.min(...xs)), (hauteurMax - 2 * marge) / (Math.max(...ys) - Math.min(...ys)));
  const x0 = (largeur - (Math.max(...xs) - Math.min(...xs)) * k) / 2 - Math.min(...xs) * k;
  const y0 = marge - Math.min(...ys) * k;
  const P = (q: Point3): P2 => {
    const [u, v] = projeterIso(q);
    return [x0 + u * k, y0 + v * k];
  };
  return { P, hauteur: (Math.max(...ys) - Math.min(...ys)) * k + 2 * marge, poly: (q: Point3[]) => points(q.map(P)) };
}

// ---------- Figures planes usuelles (N0.5.1) ----------

export function FiguresUsuelles() {
  const y0 = 30;
  const h = 80;
  const t = (x: number, l1: string, l2: string) => (
    <>
      <Etiquette x={x} y={y0 + h + 28} ancre="middle" taille={12.5} gras>
        {l1}
      </Etiquette>
      <Etiquette x={x} y={y0 + h + 46} ancre="middle" taille={12} classe="encre">
        {l2}
      </Etiquette>
    </>
  );
  return (
    <Figure alt="Cinq figures usuelles avec leur formule d'aire : rectangle L × l, triangle b × h / 2, trapèze (B + b) × h / 2, disque π r², secteur π r² θ / 360" largeur={620} hauteur={190}>
      <rect x={14} y={y0} width={100} height={h} fill="var(--color-encre-clair)" className="t-moyen" />
      <Etiquette x={64} y={y0 - 6} ancre="middle" taille={11}>
        L
      </Etiquette>
      <Etiquette x={8} y={y0 + h / 2 + 4} ancre="end" taille={11}>
        l
      </Etiquette>
      {t(64, 'rectangle', 'A = L × l')}

      <polygon points={points([[134, y0 + h], [234, y0 + h], [200, y0]])} fill="var(--color-encre-clair)" className="t-moyen" />
      <line x1={200} y1={y0} x2={200} y2={y0 + h} className="t-fin" strokeDasharray="4 3" />
      <Etiquette x={204} y={y0 + h / 2} taille={11}>
        h
      </Etiquette>
      <Etiquette x={184} y={y0 + h + 14} ancre="middle" taille={11}>
        b
      </Etiquette>
      {t(184, 'triangle', 'A = b × h / 2')}

      <polygon points={points([[254, y0 + h], [364, y0 + h], [340, y0], [278, y0]])} fill="var(--color-encre-clair)" className="t-moyen" />
      <line x1={300} y1={y0} x2={300} y2={y0 + h} className="t-fin" strokeDasharray="4 3" />
      <Etiquette x={309} y={y0 - 6} ancre="middle" taille={11}>
        b
      </Etiquette>
      <Etiquette x={309} y={y0 + h + 14} ancre="middle" taille={11}>
        B
      </Etiquette>
      {t(309, 'trapèze', 'A = (B + b) × h / 2')}

      <circle cx={430} cy={y0 + h / 2} r={42} fill="var(--color-encre-clair)" className="t-moyen" />
      <line x1={430} y1={y0 + h / 2} x2={472} y2={y0 + h / 2} className="t-moyen" />
      <Etiquette x={451} y={y0 + h / 2 - 5} ancre="middle" taille={11}>
        r
      </Etiquette>
      {t(430, 'disque', 'A = π r²')}

      <path d={`M540 ${y0 + h} L610 ${y0 + h} A70 70 0 0 0 ${540 + 70 * Math.cos(Math.PI / 3)} ${y0 + h - 70 * Math.sin(Math.PI / 3)} Z`} fill="var(--color-encre-clair)" className="t-moyen" />
      <Etiquette x={556} y={y0 + h - 8} taille={11}>
        θ
      </Etiquette>
      {t(560, 'secteur', 'A = π r² θ / 360')}
    </Figure>
  );
}

// ---------- Dalle en L avec trémie (N0.5.1) ----------

export function DalleLSchema({ d, r }: { d: DonneesDalleL; r: ResultatDalleL }) {
  const k = Math.min(440 / d.L1, 200 / (d.l1 + d.l2));
  const x0 = 90;
  const y0 = 28;
  const X = (x: number) => x0 + x * k;
  const Y = (y: number) => y0 + y * k; // y vers le bas : grande aile en haut
  const contour: P2[] = [
    [X(0), Y(0)],
    [X(d.L1), Y(0)],
    [X(d.L1), Y(d.l1)],
    [X(d.L2), Y(d.l1)],
    [X(d.L2), Y(d.l1 + d.l2)],
    [X(0), Y(d.l1 + d.l2)],
  ];
  const tx = d.L1 - d.a - 0.6;
  const ty = (d.l1 - d.b) / 2;
  return (
    <Figure alt={`Dalle en L : grande aile ${n2(d.L1)} × ${n2(d.l1)} m, petite aile ${n2(d.L2)} × ${n2(d.l2)} m, trémie ${n2(d.a)} × ${n2(d.b)} m ; aire nette ${n2(r.A)} m²`} largeur={620} hauteur={(d.l1 + d.l2) * k + 70}>
      <Hachures prefixe="dl" types={['ba']} />
      <polygon points={points(contour)} fill={hachure('dl', 'ba')} className="t-fort" />
      <line x1={X(0)} y1={Y(d.l1)} x2={X(d.L2)} y2={Y(d.l1)} className="t-fin" strokeDasharray="6 4" />
      <rect x={X(tx)} y={Y(ty)} width={d.a * k} height={d.b * k} fill="var(--color-papier)" className="t-fort" />
      <line x1={X(tx)} y1={Y(ty)} x2={X(tx + d.a)} y2={Y(ty + d.b)} className="t-fin" />
      <line x1={X(tx + d.a)} y1={Y(ty)} x2={X(tx)} y2={Y(ty + d.b)} className="t-fin" />
      <Etiquette x={X(tx + d.a / 2)} y={Y(ty) - 6} ancre="middle" taille={11}>
        trémie {n2(d.a)} × {n2(d.b)}
      </Etiquette>
      <Etiquette x={X(d.L1 / 4)} y={Y(d.l1 / 2) + 4} ancre="middle" taille={13} gras classe="encre">
        ① {n2(r.A1)} m²
      </Etiquette>
      <Etiquette x={X(d.L2 / 2)} y={Y(d.l1 + d.l2 / 2) + 4} ancre="middle" taille={13} gras classe="encre">
        ② {n2(r.A2)} m²
      </Etiquette>
      <Cote x1={X(0)} y1={Y(0)} x2={X(d.L1)} y2={Y(0)} decalage={14} texte={`L1 = ${n2(d.L1)} m`} />
      <Cote x1={X(0)} y1={Y(d.l1 + d.l2)} x2={X(d.L2)} y2={Y(d.l1 + d.l2)} decalage={-18} texte={`L2 = ${n2(d.L2)} m`} />
      <Cote x1={X(0)} y1={Y(d.l1)} x2={X(0)} y2={Y(0)} decalage={22} texte={`l1 = ${n2(d.l1)}`} />
      <Cote x1={X(0)} y1={Y(d.l1 + d.l2)} x2={X(0)} y2={Y(d.l1)} decalage={22} texte={`l2 = ${n2(d.l2)}`} />
    </Figure>
  );
}

// ---------- Thalès : la hauteur par l'ombre (N0.5.2) ----------

export function ThalesOmbre({ hBaton, ombreBaton, ombreObjet, H, prefixe = 'th' }: { hBaton: number; ombreBaton: number; ombreObjet: number; H: number; prefixe?: string }) {
  const k = Math.min(480 / (ombreObjet + 2), 190 / H);
  const ySol = 225;
  const xPyl = 60;
  const X = (x: number) => xPyl + x * k;
  const xBat = ombreObjet - ombreBaton; // le bâton est planté de façon que les deux ombres finissent au même point
  return (
    <Figure alt={`Pylône et bâton éclairés par le soleil : bâton de ${n2(hBaton)} m, ombre ${n2(ombreBaton)} m ; ombre du pylône ${n2(ombreObjet)} m ; hauteur ${n2(H)} m`} largeur={620} hauteur={290}>
      <Hachures prefixe={prefixe} types={['terre']} />
      <rect x={30} y={ySol} width={570} height={12} fill={hachure(prefixe, 'terre')} />
      <line x1={30} y1={ySol} x2={600} y2={ySol} className="t-moyen" />
      <line x1={X(0)} y1={ySol} x2={X(0)} y2={ySol - H * k} className="t-fort" strokeWidth={4} />
      <line x1={X(xBat)} y1={ySol} x2={X(xBat)} y2={ySol - hBaton * k} className="t-fort" strokeWidth={3} stroke="var(--color-brique)" />
      <line x1={X(0)} y1={ySol - H * k} x2={X(ombreObjet)} y2={ySol} stroke="var(--color-terre)" strokeWidth={1.6} strokeDasharray="7 4" />
      <line x1={X(0)} y1={ySol} x2={X(ombreObjet)} y2={ySol} stroke="var(--trait)" strokeWidth={5} opacity={0.35} />
      <Etiquette x={X(0) + 8} y={ySol - H * k + 14} taille={12} gras>
        pylône
      </Etiquette>
      <Etiquette x={X(xBat) - 6} y={ySol - hBaton * k - 6} ancre="end" taille={11.5}>
        bâton
      </Etiquette>
      <Etiquette x={X(ombreObjet * 0.55)} y={ySol - H * k * 0.45 - 8} taille={11} classe="etiquette">
        rayon de soleil (parallèles)
      </Etiquette>
      <Cote x1={X(0)} y1={ySol} x2={X(0)} y2={ySol - H * k} decalage={26} texte={`H = ${n2(H)} m`} />
      <Cote x1={X(0)} y1={ySol} x2={X(ombreObjet)} y2={ySol} decalage={-40} texte={`ombre du pylône S = ${n2(ombreObjet)} m`} />
      {/* détail agrandi du petit triangle */}
      <g>
        <rect x={430} y={24} width={170} height={150} rx={6} fill="var(--color-papier)" className="t-fin" />
        <Etiquette x={515} y={42} ancre="middle" taille={11} classe="etiquette">
          détail du bâton (agrandi)
        </Etiquette>
        {(() => {
          const kd = Math.min(90 / hBaton, 110 / ombreBaton);
          const xb = 470;
          const yb = 150;
          return (
            <>
              <line x1={xb - 20} y1={yb} x2={xb + ombreBaton * kd + 20} y2={yb} className="t-moyen" />
              <line x1={xb} y1={yb} x2={xb} y2={yb - hBaton * kd} className="t-fort" strokeWidth={3} stroke="var(--color-brique)" />
              <line x1={xb} y1={yb - hBaton * kd} x2={xb + ombreBaton * kd} y2={yb} stroke="var(--color-terre)" strokeWidth={1.6} strokeDasharray="6 3" />
              <Cote x1={xb} y1={yb} x2={xb} y2={yb - hBaton * kd} decalage={14} texte={`h = ${n2(hBaton)}`} />
              <Cote x1={xb} y1={yb} x2={xb + ombreBaton * kd} y2={yb} decalage={-12} texte={`s = ${n2(ombreBaton)}`} />
            </>
          );
        })()}
      </g>
    </Figure>
  );
}

// ---------- Solides usuels (N0.5.3) ----------

export function SolidesUsuels() {
  const yB = 140;
  const ell = (cx: number, cy: number, rx: number, ry: number, cache = false) => (
    <>
      <path d={`M${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`} fill="none" className="t-moyen" />
      <path d={`M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`} fill="none" className={cache ? 't-cache' : 't-moyen'} />
    </>
  );
  const legende = (x: number, l1: string, l2: string) => (
    <>
      <Etiquette x={x} y={yB + 36} ancre="middle" taille={12.5} gras>
        {l1}
      </Etiquette>
      <Etiquette x={x} y={yB + 54} ancre="middle" taille={11.5} classe="encre">
        {l2}
      </Etiquette>
    </>
  );
  return (
    <Figure
      alt="Quatre solides et leur volume : cylindre π r² h, cône π r² h / 3, tronc de cône π h (R² + R r + r²) / 3, pyramide aire de base × h / 3"
      largeur={620}
      hauteur={210}
    >
      <rect x={30} y={40} width={90} height={yB - 40} fill="var(--color-encre-clair)" stroke="none" />
      {ell(75, 40, 45, 12)}
      {ell(75, yB, 45, 12, true)}
      <line x1={30} y1={40} x2={30} y2={yB} className="t-moyen" />
      <line x1={120} y1={40} x2={120} y2={yB} className="t-moyen" />
      {legende(75, 'cylindre', 'V = π r² h')}

      <polygon points={points([[180, yB], [270, yB], [225, 30]])} fill="var(--color-encre-clair)" stroke="none" />
      {ell(225, yB, 45, 12, true)}
      <line x1={180} y1={yB} x2={225} y2={30} className="t-moyen" />
      <line x1={270} y1={yB} x2={225} y2={30} className="t-moyen" />
      <line x1={225} y1={30} x2={225} y2={yB} className="t-fin" strokeDasharray="4 3" />
      {legende(225, 'cône', 'V = π r² h / 3')}

      <polygon points={points([[330, yB], [420, yB], [400, 50], [350, 50]])} fill="var(--color-encre-clair)" stroke="none" />
      {ell(375, 50, 25, 7)}
      {ell(375, yB, 45, 12, true)}
      <line x1={330} y1={yB} x2={350} y2={50} className="t-moyen" />
      <line x1={420} y1={yB} x2={400} y2={50} className="t-moyen" />
      {legende(375, 'tronc de cône', 'V = π h (R² + Rr + r²) / 3')}

      <polygon points={points([[480, yB], [560, yB], [520, 30]])} fill="var(--color-encre-clair)" stroke="none" />
      <polygon points={points([[560, yB], [590, yB - 22], [520, 30]])} fill="var(--color-acier-clair)" stroke="none" />
      <polyline points={points([[480, yB], [560, yB], [590, yB - 22]])} fill="none" className="t-moyen" />
      <polyline points={points([[480, yB], [510, yB - 22], [590, yB - 22]])} fill="none" className="t-cache" />
      <line x1={510} y1={yB - 22} x2={520} y2={30} className="t-cache" />
      {[480, 560, 590].map((x, i) => (
        <line key={x} x1={x} y1={i === 2 ? yB - 22 : yB} x2={520} y2={30} className="t-moyen" />
      ))}
      {legende(535, 'pyramide', 'V = A base × h / 3')}
    </Figure>
  );
}

// ---------- Fouille talutée : vue 3D et coupe (N0.5.3) ----------

export function FouilleIso({ d, r }: { d: DonneesFouille; r: ResultatFouille }) {
  const m = d.n * d.H;
  const bord = 0.9;
  const z0 = 0;
  // fond : x ∈ [m, m + a], y ∈ [m, m + b], z = −H ; ouverture : x ∈ [0, aSup], y ∈ [0, bSup], z = 0
  const F: Point3[] = [[m, m, -d.H], [m + d.a, m, -d.H], [m + d.a, m + d.b, -d.H], [m, m + d.b, -d.H]];
  const O: Point3[] = [[0, 0, z0], [r.aSup, 0, z0], [r.aSup, r.bSup, z0], [0, r.bSup, z0]];
  const sol: Point3[] = [[-bord, -bord, 0], [r.aSup + bord, -bord, 0], [r.aSup + bord, r.bSup + bord, 0], [-bord, r.bSup + bord, 0]];
  const M: Point3[] = F.map((p, i) => [(p[0] + O[i]![0]) / 2, (p[1] + O[i]![1]) / 2, -d.H / 2]);
  const { P, poly, hauteur } = cadreIso([...sol, ...F], 620, 330);
  const seg = (a: Point3, b: Point3, props: React.SVGProps<SVGLineElement>, key: string) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} {...props} />;
  };
  return (
    <Figure alt={`Fouille talutée : fond ${n2(d.a)} × ${n2(d.b)} m, ouverture ${n2(r.aSup)} × ${n2(r.bSup)} m, profondeur ${n2(d.H)} m ; volume ${n2(r.V)} m³`} largeur={620} hauteur={hauteur}>
      <Hachures prefixe="fiso" types={['terre']} />
      {/* ordre du peintre : fond et parois éloignées, puis terrain troué qui masque le fond derrière le bord proche */}
      <Calque id="fouille">
        <polygon points={poly([O[0]!, O[1]!, F[1]!, F[0]!])} fill="var(--fond-terre)" className="t-moyen" />
        <polygon points={poly([O[0]!, O[3]!, F[3]!, F[0]!])} fill="var(--color-terre-clair)" className="t-moyen" />
        <polygon points={poly(F)} fill="var(--fond-beton)" className="t-moyen" />
      </Calque>
      <Calque id="terrain">
        <path d={`M${poly(sol).split(' ').join(' L')} Z M${poly([...O].reverse()).split(' ').join(' L')} Z`} fill={hachure('fiso', 'terre')} fillRule="evenodd" className="t-fin" />
      </Calque>
      <Calque id="fouille">
        {seg(F[1]!, F[2]!, { className: 't-cache' }, 'c12')}
        {seg(F[3]!, F[2]!, { className: 't-cache' }, 'c32')}
        {seg(F[2]!, O[2]!, { className: 't-cache' }, 'a2')}
        <polygon points={poly(O)} fill="none" className="t-fort" />
      </Calque>
      <Calque id="milieu">
        <polygon points={poly(M)} fill="none" stroke="var(--color-correction)" strokeWidth={1.6} strokeDasharray="6 3" />
        <Etiquette x={P(M[1]!)[0] + 8} y={P(M[1]!)[1] + 4} taille={11.5} gras couleur="var(--color-correction)">
          section à mi-hauteur {n2((d.a + r.aSup) / 2)} × {n2((d.b + r.bSup) / 2)}
        </Etiquette>
      </Calque>
      <Calque id="cotes">
        <Etiquette x={(P(O[0]!)[0] + P(O[1]!)[0]) / 2 + 10} y={(P(O[0]!)[1] + P(O[1]!)[1]) / 2 - 8} taille={12} gras>
          haut {n2(r.aSup)} m
        </Etiquette>
        <Etiquette x={(P(F[0]!)[0] + P(F[1]!)[0]) / 2} y={(P(F[0]!)[1] + P(F[1]!)[1]) / 2 + 18} ancre="middle" taille={12} gras>
          fond {n2(d.a)} m
        </Etiquette>
        <Etiquette x={P(O[3]!)[0] - 8} y={(P(O[3]!)[1] + P(F[3]!)[1]) / 2} ancre="end" taille={12} gras>
          H = {n2(d.H)} m
        </Etiquette>
      </Calque>
    </Figure>
  );
}

export function FouilleCoupe({ d, r }: { d: DonneesFouille; r: ResultatFouille }) {
  const bord = 0.8;
  const k = Math.min(440 / (r.aSup + 2 * bord), 170 / (d.H + 0.5));
  const x0 = 310 - (r.aSup / 2) * k;
  const yS = 40;
  const X = (x: number) => x0 + x * k;
  const Y = (z: number) => yS - z * k;
  const m = d.n * d.H;
  return (
    <Figure alt={`Coupe de la fouille : fond ${n2(d.a)} m, haut ${n2(r.aSup)} m, profondeur ${n2(d.H)} m, talus à ${nombre(d.n, 2)} pour 1`} largeur={620} hauteur={d.H * k + 110}>
      <Hachures prefixe="fcp" types={['terre']} />
      <polygon
        points={points([
          [X(-bord), Y(0)],
          [X(0), Y(0)],
          [X(m), Y(-d.H)],
          [X(m + d.a), Y(-d.H)],
          [X(r.aSup), Y(0)],
          [X(r.aSup + bord), Y(0)],
          [X(r.aSup + bord), Y(-d.H - 0.3)],
          [X(-bord), Y(-d.H - 0.3)],
        ])}
        fill={hachure('fcp', 'terre')}
        stroke="none"
      />
      <polyline points={points([[X(-bord), Y(0)], [X(0), Y(0)], [X(m), Y(-d.H)], [X(m + d.a), Y(-d.H)], [X(r.aSup), Y(0)], [X(r.aSup + bord), Y(0)]])} fill="none" className="t-fort" />
      <line x1={X(m / 2)} y1={Y(-d.H / 2)} x2={X(r.aSup - m / 2)} y2={Y(-d.H / 2)} stroke="var(--color-correction)" strokeWidth={1.4} strokeDasharray="6 3" />
      <Cote x1={X(0)} y1={Y(0)} x2={X(r.aSup)} y2={Y(0)} decalage={16} texte={`haut ${n2(r.aSup)} m`} />
      <Cote x1={X(m)} y1={Y(-d.H)} x2={X(m + d.a)} y2={Y(-d.H)} decalage={-18} texte={`fond ${n2(d.a)} m`} />
      <Cote x1={X(r.aSup)} y1={Y(-d.H)} x2={X(r.aSup)} y2={Y(0)} decalage={-30} texte={`H = ${n2(d.H)}`} />
      <Cote x1={X(m + d.a)} y1={Y(-d.H)} x2={X(r.aSup)} y2={Y(-d.H)} decalage={-18} texte={`${n2(m)}`} />
      <Etiquette x={X(m / 2) - 8} y={Y(-d.H / 2) + 4} ancre="end" taille={12} gras>
        {nombre(d.n, 2)} / 1
      </Etiquette>
      <Etiquette x={X(r.aSup / 2)} y={Y(-d.H / 2) - 6} ancre="middle" taille={11} couleur="var(--color-correction)">
        mi-hauteur
      </Etiquette>
    </Figure>
  );
}

// ---------- Repérage (N0.5.4) ----------

export function RepereSegment({ A, B, s }: { A: Point2D; B: Point2D; s: ResultatSegment }) {
  const xs = [0, A.x, B.x];
  const ys = [0, A.y, B.y];
  const xmin = Math.min(...xs) - 1;
  const xmax = Math.max(...xs) + 1;
  const ymin = Math.min(...ys) - 1;
  const ymax = Math.max(...ys) + 1;
  const k = Math.min(400 / (xmax - xmin), 220 / (ymax - ymin));
  const X = (x: number) => 50 + (x - xmin) * k;
  const Y = (y: number) => 250 - (y - ymin) * k;
  const pas = Math.max(1, Math.round((xmax - xmin) / 10));
  const grille = Array.from({ length: Math.floor((xmax - xmin) / pas) + 1 }, (_, i) => Math.ceil(xmin) + i * pas);
  const grilleY = Array.from({ length: Math.floor((ymax - ymin) / pas) + 1 }, (_, i) => Math.ceil(ymin) + i * pas);
  return (
    <Figure alt={`Repère cartésien : A(${n2(A.x)} ; ${n2(A.y)}), B(${n2(B.x)} ; ${n2(B.y)}) ; Δx = ${n2(s.dx)}, Δy = ${n2(s.dy)}, distance ${n2(s.d)}, direction ${nombre(s.theta, 2)}°`} largeur={620} hauteur={280}>
      {grille.map((g) => (
        <line key={`gx${g}`} x1={X(g)} y1={Y(ymin)} x2={X(g)} y2={Y(ymax)} stroke="var(--color-quadrillage)" strokeWidth={0.7} />
      ))}
      {grilleY.map((g) => (
        <line key={`gy${g}`} x1={X(xmin)} y1={Y(g)} x2={X(xmax)} y2={Y(g)} stroke="var(--color-quadrillage)" strokeWidth={0.7} />
      ))}
      {xmin <= 0 && xmax >= 0 ? <line x1={X(0)} y1={Y(ymin)} x2={X(0)} y2={Y(ymax)} className="t-moyen" /> : null}
      {ymin <= 0 && ymax >= 0 ? <line x1={X(xmin)} y1={Y(0)} x2={X(xmax)} y2={Y(0)} className="t-moyen" /> : null}
      <Etiquette x={X(xmax) - 4} y={Y(0) - 6} ancre="end" taille={11}>
        x (m)
      </Etiquette>
      <Etiquette x={X(0) + 6} y={Y(ymax) + 12} taille={11}>
        y (m)
      </Etiquette>
      <line x1={X(A.x)} y1={Y(A.y)} x2={X(B.x)} y2={Y(A.y)} stroke="var(--color-encre)" strokeWidth={2} strokeDasharray="6 3" />
      <line x1={X(B.x)} y1={Y(A.y)} x2={X(B.x)} y2={Y(B.y)} stroke="var(--color-validation)" strokeWidth={2} strokeDasharray="6 3" />
      <line x1={X(A.x)} y1={Y(A.y)} x2={X(B.x)} y2={Y(B.y)} stroke="var(--color-correction)" strokeWidth={2.6} />
      {[
        [A, 'A'],
        [B, 'B'],
        [s.milieu, 'M'],
      ].map(([p, nom]) => (
        <g key={nom as string}>
          <circle cx={X((p as Point2D).x)} cy={Y((p as Point2D).y)} r={4} fill="var(--trait)" />
          <Etiquette x={X((p as Point2D).x) - 8} y={Y((p as Point2D).y) - 8} ancre="end" taille={13} gras>
            {nom as string}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={(X(A.x) + X(B.x)) / 2} y={Y(A.y) + 16} ancre="middle" taille={12} gras classe="encre">
        Δx = {n2(s.dx)}
      </Etiquette>
      <Etiquette x={X(B.x) + 8} y={(Y(A.y) + Y(B.y)) / 2} taille={12} gras couleur="var(--color-validation)">
        Δy = {n2(s.dy)}
      </Etiquette>
      <Etiquette x={470} y={60} taille={13} gras couleur="var(--color-correction)">
        d = {n2(s.d)} m
      </Etiquette>
      <Etiquette x={470} y={82} taille={12}>
        θ = {nombre(s.theta, 2)}°
      </Etiquette>
      <Etiquette x={470} y={104} taille={12}>
        M ({n2(s.milieu.x)} ; {n2(s.milieu.y)})
      </Etiquette>
    </Figure>
  );
}

// ---------- Massif en L : vue 3D et vues 2D (N0.5.5) ----------

function facesMassif(d: DonneesMassif) {
  const H = d.h1 + d.h2;
  const { L, a, P, h1 } = d;
  return {
    hautTop: [[0, 0, H], [a, 0, H], [a, P, H], [0, P, H]] as Point3[],
    contremarche: [[a, 0, h1], [a, P, h1], [a, P, H], [a, 0, H]] as Point3[],
    basTop: [[a, 0, h1], [L, 0, h1], [L, P, h1], [a, P, h1]] as Point3[],
    bout: [[L, 0, 0], [L, P, 0], [L, P, h1], [L, 0, h1]] as Point3[],
    face: [[0, P, 0], [L, P, 0], [L, P, h1], [a, P, h1], [a, P, H], [0, P, H]] as Point3[],
  };
}

export function MassifIso({ d }: { d: DonneesMassif }) {
  const f = facesMassif(d);
  const H = d.h1 + d.h2;
  const enveloppe: Point3[] = [[0, 0, 0], [d.L, 0, 0], [d.L, d.P, 0], [0, d.P, 0], [0, 0, H], [d.L, d.P, H], [d.L + 0.7, d.P + 0.7, 0], [-0.7, d.P + 0.9, H + 0.3]];
  const { P, poly, hauteur } = cadreIso(enveloppe, 620, 320);
  const fleche = (de: Point3, vers: Point3, nom: string) => {
    const [x1, y1] = P(de);
    const [x2, y2] = P(vers);
    const a = Math.atan2(y2 - y1, x2 - x1);
    const t = 9;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-correction)" strokeWidth={2} />
        <polygon points={points([[x2, y2], [x2 - t * Math.cos(a - 0.4), y2 - t * Math.sin(a - 0.4)], [x2 - t * Math.cos(a + 0.4), y2 - t * Math.sin(a + 0.4)]])} fill="var(--color-correction)" />
        <Etiquette x={x1} y={y1 - 6} ancre="middle" taille={12.5} gras couleur="var(--color-correction)">
          {nom}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt={`Massif en béton à section en L : ${n2(d.L)} m de long, ${n2(d.P)} m de profondeur, ${n2(d.h1)} m puis ${n2(H)} m de haut`} largeur={620} hauteur={hauteur}>
      <Hachures prefixe="miso" types={['beton']} />
      <Calque id="massif">
        <polygon points={poly(f.hautTop)} fill="var(--color-papier)" className="t-moyen" />
        <polygon points={poly(f.contremarche)} fill="var(--fond-beton)" className="t-moyen" />
        <polygon points={poly(f.basTop)} fill="var(--color-papier)" className="t-moyen" />
        <polygon points={poly(f.bout)} fill="var(--fond-beton)" className="t-moyen" />
        <polygon points={poly(f.face)} fill={hachure('miso', 'beton')} className="t-fort" />
      </Calque>
      <Calque id="caches">
        <polyline points={poly([[0, 0, H], [0, 0, 0], [d.L, 0, 0]])} fill="none" className="t-cache" />
        <polyline points={poly([[0, 0, 0], [0, d.P, 0]])} fill="none" className="t-cache" />
      </Calque>
      <Calque id="directions">
        {fleche([d.L / 2, d.P + 1.4, d.h1 / 2], [d.L / 2, d.P + 0.1, d.h1 / 2], 'F')}
        {fleche([d.a / 2, d.P / 2, H + 1.1], [d.a / 2, d.P / 2, H + 0.1], 'D')}
        {fleche([-1.2, d.P / 2, H / 2], [-0.1, d.P / 2, H / 2], 'G')}
      </Calque>
      <Calque id="cotes">
        <Etiquette x={(P([0, d.P, 0])[0] + P([d.L, d.P, 0])[0]) / 2 - 10} y={(P([0, d.P, 0])[1] + P([d.L, d.P, 0])[1]) / 2 + 20} ancre="end" taille={12} gras>
          L = {n2(d.L)} m
        </Etiquette>
        <Etiquette x={(P([d.L, 0, 0])[0] + P([d.L, d.P, 0])[0]) / 2 + 12} y={(P([d.L, 0, 0])[1] + P([d.L, d.P, 0])[1]) / 2 + 16} taille={12} gras>
          P = {n2(d.P)} m
        </Etiquette>
        <Etiquette x={P([0, d.P, H / 2])[0] - 10} y={P([0, d.P, H / 2])[1]} ancre="end" taille={12} gras>
          H = {n2(H)} m
        </Etiquette>
      </Calque>
    </Figure>
  );
}

const vueCadre = (largeur: number, hauteur: number, alt: string, children: React.ReactNode) => (
  <Figure alt={alt} largeur={largeur} hauteur={hauteur} largeurMin={220}>
    {children}
  </Figure>
);

/** Vue de face (selon la flèche F) : la section en L, en vraie grandeur. */
export function MassifVueFace({ d, k = 120 }: { d: DonneesMassif; k?: number }) {
  const H = d.h1 + d.h2;
  const x0 = 40;
  const yb = 34 + H * k;
  const X = (x: number) => x0 + x * k;
  const Z = (z: number) => yb - z * k;
  return vueCadre(
    d.L * k + 80,
    H * k + 74,
    `Vue de face : contour en L, longueur ${n2(d.L)} m, hauteurs ${n2(d.h1)} et ${n2(H)} m`,
    <>
      <polygon points={points([[X(0), Z(0)], [X(d.L), Z(0)], [X(d.L), Z(d.h1)], [X(d.a), Z(d.h1)], [X(d.a), Z(H)], [X(0), Z(H)]])} fill="none" className="t-fort" />
      <Cote x1={X(0)} y1={Z(0)} x2={X(d.L)} y2={Z(0)} decalage={-18} texte={`${n2(d.L)}`} />
      <Cote x1={X(0)} y1={Z(H)} x2={X(d.a)} y2={Z(H)} decalage={12} texte={`${n2(d.a)}`} />
      <Cote x1={X(d.L)} y1={Z(0)} x2={X(d.L)} y2={Z(d.h1)} decalage={-16} texte={`${n2(d.h1)}`} />
      <Cote x1={X(0)} y1={Z(0)} x2={X(0)} y2={Z(H)} decalage={18} texte={`${n2(H)}`} />
    </>,
  );
}

/** Vue de dessus (selon D) : rectangle L × P, arête de la marche visible. */
export function MassifVueDessus({ d, k = 120 }: { d: DonneesMassif; k?: number }) {
  const x0 = 40;
  const y0 = 16;
  const X = (x: number) => x0 + x * k;
  const Y = (y: number) => y0 + y * k;
  return vueCadre(
    d.L * k + 80,
    d.P * k + 50,
    `Vue de dessus : rectangle ${n2(d.L)} × ${n2(d.P)} m avec l'arête de la marche`,
    <>
      <rect x={X(0)} y={Y(0)} width={d.L * k} height={d.P * k} fill="none" className="t-fort" />
      <line x1={X(d.a)} y1={Y(0)} x2={X(d.a)} y2={Y(d.P)} className="t-fort" />
      <Cote x1={X(0)} y1={Y(d.P)} x2={X(d.L)} y2={Y(d.P)} decalage={-16} texte={`${n2(d.L)}`} />
      <Cote x1={X(0)} y1={Y(d.P)} x2={X(0)} y2={Y(0)} decalage={18} texte={`${n2(d.P)}`} />
    </>,
  );
}

/** Vue de gauche (selon G) : rectangle P × H ; l'arête de la marche, cachée, en trait interrompu. */
export function MassifVueGauche({ d, k = 120 }: { d: DonneesMassif; k?: number }) {
  const H = d.h1 + d.h2;
  const x0 = 30;
  const yb = 20 + H * k;
  const X = (y: number) => x0 + y * k;
  const Z = (z: number) => yb - z * k;
  return vueCadre(
    d.P * k + 70,
    H * k + 60,
    `Vue de gauche : rectangle ${n2(d.P)} × ${n2(H)} m ; la marche, cachée, en trait interrompu`,
    <>
      <rect x={X(0)} y={Z(H)} width={d.P * k} height={H * k} fill="none" className="t-fort" />
      <line x1={X(0)} y1={Z(d.h1)} x2={X(d.P)} y2={Z(d.h1)} className="t-cache" />
      <Cote x1={X(0)} y1={Z(0)} x2={X(d.P)} y2={Z(0)} decalage={-18} texte={`${n2(d.P)}`} />
    </>,
  );
}

// ---------- Centre de gravité d'une section en T (N0.5.6) ----------

export function SectionTSchema({ d, r }: { d: DonneesSectionT; r: ResultatGravite }) {
  const k = Math.min(300 / d.b, 220 / d.h);
  const cx = 230;
  const yb = 30 + d.h * k;
  const X = (x: number) => cx + x * k;
  const Y = (y: number) => yb - y * k;
  const ha = d.h - d.hf;
  return (
    <Figure alt={`Section en T : table ${d.b} × ${d.hf} cm, âme ${d.bw} × ${ha} cm ; centre de gravité à ${nombre(r.yG, 2)} cm de la fibre inférieure`} largeur={620} hauteur={d.h * k + 70}>
      <rect x={X(-d.bw / 2)} y={Y(ha)} width={d.bw * k} height={ha * k} fill="var(--color-encre-clair)" className="t-moyen" />
      <rect x={X(-d.b / 2)} y={Y(d.h)} width={d.b * k} height={d.hf * k} fill="var(--color-terre-clair)" className="t-moyen" />
      <polygon points={points([[X(-d.bw / 2), Y(0)], [X(d.bw / 2), Y(0)], [X(d.bw / 2), Y(ha)], [X(d.b / 2), Y(ha)], [X(d.b / 2), Y(d.h)], [X(-d.b / 2), Y(d.h)], [X(-d.b / 2), Y(ha)], [X(-d.bw / 2), Y(ha)]])} fill="none" className="t-fort" />
      <circle cx={X(0)} cy={Y(ha / 2)} r={3} fill="var(--color-encre)" />
      <circle cx={X(0)} cy={Y(d.h - d.hf / 2)} r={3} fill="var(--color-terre)" />
      <Etiquette x={X(0) + 8} y={Y(ha / 2) + 4} taille={11}>
        G₁ (âme)
      </Etiquette>
      <Etiquette x={X(d.b / 4)} y={Y(d.h - d.hf / 2) + 4} taille={11}>
        G₂ (table)
      </Etiquette>
      <line x1={X(-d.b / 2) - 20} y1={Y(r.yG)} x2={X(d.b / 2) + 20} y2={Y(r.yG)} className="t-axe" stroke="var(--color-correction)" />
      <circle cx={X(0)} cy={Y(r.yG)} r={5} fill="var(--color-correction)" />
      <Etiquette x={X(d.b / 2) + 24} y={Y(r.yG) + 4} taille={13} gras couleur="var(--color-correction)">
        G
      </Etiquette>
      <Cote x1={X(-d.bw / 2)} y1={Y(0)} x2={X(-d.bw / 2)} y2={Y(r.yG)} decalage={34} texte={`yG = ${nombre(r.yG, 2)} cm`} />
      <Cote x1={X(d.b / 2)} y1={Y(0)} x2={X(d.b / 2)} y2={Y(d.h)} decalage={-30} texte={`h = ${d.h}`} />
      <Cote x1={X(-d.b / 2)} y1={Y(d.h)} x2={X(d.b / 2)} y2={Y(d.h)} decalage={14} texte={`b = ${d.b} cm`} />
      <Cote x1={X(-d.bw / 2)} y1={Y(0)} x2={X(d.bw / 2)} y2={Y(0)} decalage={-16} texte={`${d.bw}`} />
    </Figure>
  );
}

// ---------- La petite maison : plan et coupe (N0.5.P) ----------

export function MaisonPlan({ d, r, prefixe = 'mp' }: { d: DonneesMaison; r: ResultatMaison; prefixe?: string }) {
  const k = Math.min(430 / d.Lext, 260 / d.lext);
  const x0 = 80;
  const y0 = 46;
  const X = (x: number) => x0 + x * k;
  const Y = (y: number) => y0 + y * k;
  const e = d.e;
  return (
    <Figure alt={`Plan de la maison : ${n2(d.Lext)} × ${n2(d.lext)} m hors tout, murs de ${nombre(e * 100, 0)} cm ; longueur des murs à l'axe ${n2(r.longueurAxe)} m`} largeur={620} hauteur={d.lext * k + 100}>
      <Hachures prefixe={prefixe} types={['maconnerie']} />
      <path
        d={`M${X(0)} ${Y(0)} H${X(d.Lext)} V${Y(d.lext)} H${X(0)} Z M${X(e)} ${Y(e)} V${Y(d.lext - e)} H${X(d.Lext - e)} V${Y(e)} Z`}
        fill={hachure(prefixe, 'maconnerie')}
        fillRule="evenodd"
        className="t-fort"
      />
      <Axe x1={X(e / 2)} y1={Y(-0.5)} x2={X(e / 2)} y2={Y(d.lext + 0.4)} repere="A" />
      <Axe x1={X(d.Lext - e / 2)} y1={Y(-0.5)} x2={X(d.Lext - e / 2)} y2={Y(d.lext + 0.4)} repere="B" />
      <Axe x1={X(-0.5)} y1={Y(e / 2)} x2={X(d.Lext + 0.4)} y2={Y(e / 2)} repere="1" />
      <Axe x1={X(-0.5)} y1={Y(d.lext - e / 2)} x2={X(d.Lext + 0.4)} y2={Y(d.lext - e / 2)} repere="2" />
      <Etiquette x={X(d.Lext / 2)} y={Y(d.lext / 2)} ancre="middle" taille={13} gras classe="encre">
        surface intérieure {n2(r.Sint)} m²
      </Etiquette>
      <Etiquette x={X(d.Lext / 2)} y={Y(d.lext / 2) + 18} ancre="middle" taille={11}>
        ({n2(d.Lext - 2 * e)} × {n2(d.lext - 2 * e)} m)
      </Etiquette>
      <Cote x1={X(0)} y1={Y(d.lext)} x2={X(d.Lext)} y2={Y(d.lext)} decalage={-30} texte={`${n2(d.Lext)} hors tout`} />
      <Cote x1={X(e / 2)} y1={Y(d.lext)} x2={X(d.Lext - e / 2)} y2={Y(d.lext)} decalage={-12} texte={`${n2(d.Lext - e)} à l'axe`} taille={10.5} />
      <Cote x1={X(d.Lext)} y1={Y(d.lext)} x2={X(d.Lext)} y2={Y(0)} decalage={-28} texte={`${n2(d.lext)}`} />
      <Cote x1={X(d.Lext)} y1={Y(d.lext - e / 2)} x2={X(d.Lext)} y2={Y(e / 2)} decalage={-12} texte={`${n2(d.lext - e)}`} taille={10.5} />
    </Figure>
  );
}

export function CoupeSemelleFilante({ d, prefixe = 'csf' }: { d: DonneesMaison; prefixe?: string }) {
  const k = 260;
  const cx = 230;
  const yTN = 90;
  const X = (x: number) => cx + x * k;
  const Y = (z: number) => yTN - z * k;
  const hmur = 0.3; // hauteur de mur dessinée au-dessus du dallage (illustration)
  return (
    <Figure alt={`Coupe sur une semelle filante : tranchée de ${n2(d.Bfouille)} × ${n2(d.Dfouille)} m, semelle ${n2(d.Bsem)} × ${n2(d.hsem)} m, mur de ${nombre(d.e * 100, 0)} cm, dallage de ${nombre(d.edalle * 100, 0)} cm`} largeur={620} hauteur={290}>
      <Hachures prefixe={prefixe} types={['ba', 'beton', 'maconnerie', 'terre', 'remblai']} />
      <rect x={X(-0.75)} y={Y(0)} width={1.5 * k} height={(d.Dfouille + 0.15) * k} fill={hachure(prefixe, 'terre')} />
      <rect x={X(-d.Bfouille / 2)} y={Y(0)} width={d.Bfouille * k} height={d.Dfouille * k} fill={hachure(prefixe, 'remblai')} className="t-fin" />
      <rect x={X(-d.Bsem / 2)} y={Y(-d.Dfouille + d.hsem)} width={d.Bsem * k} height={d.hsem * k} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect x={X(-d.e / 2)} y={Y(d.edalle + hmur)} width={d.e * k} height={(d.edalle + hmur + d.Dfouille - d.hsem) * k} fill={hachure(prefixe, 'maconnerie')} className="t-fort" />
      <rect x={X(d.e / 2)} y={Y(d.edalle)} width={(0.75 - d.e / 2) * k} height={d.edalle * k} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <TerrainNaturel prefixe={prefixe} pts={[[X(-0.75), Y(0)], [X(-d.e / 2), Y(0)]]} texte={null} />
      <line x1={X(0)} y1={Y(d.edalle + hmur) - 8} x2={X(0)} y2={Y(-d.Dfouille) + 10} className="t-axe" />
      <Niveau x={X(-0.72)} y={Y(0)} texte="±0,00 TN" />
      <Etiquette x={X(0.5)} y={Y(d.edalle) - 6} ancre="middle" taille={11}>
        dallage {nombre(d.edalle * 100, 0)} cm
      </Etiquette>
      <Etiquette x={X(0)} y={Y(-d.Dfouille + d.hsem / 2) + 4} ancre="middle" taille={11} gras>
        semelle
      </Etiquette>
      <Cote x1={X(-d.Bfouille / 2)} y1={Y(-d.Dfouille)} x2={X(d.Bfouille / 2)} y2={Y(-d.Dfouille)} decalage={-34} texte={`tranchée ${n2(d.Bfouille)}`} />
      <Cote x1={X(-d.Bsem / 2)} y1={Y(-d.Dfouille)} x2={X(d.Bsem / 2)} y2={Y(-d.Dfouille)} decalage={-14} texte={`B = ${n2(d.Bsem)}`} />
      <Cote x1={X(d.Bfouille / 2)} y1={Y(-d.Dfouille)} x2={X(d.Bfouille / 2)} y2={Y(0)} decalage={-58} texte={`${n2(d.Dfouille)}`} />
      <Cote x1={X(-d.Bsem / 2)} y1={Y(-d.Dfouille)} x2={X(-d.Bsem / 2)} y2={Y(-d.Dfouille + d.hsem)} decalage={28} texte={`${n2(d.hsem)}`} />
    </Figure>
  );
}
