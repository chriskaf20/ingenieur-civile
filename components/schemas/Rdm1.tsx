// Schémas du module L2.4 (résistance des matériaux I). Les valeurs viennent de lib/calc/rdm1.ts.

import { useId } from 'react';
import { Calque } from '@/components/gabarits/Vue3D';
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Axes, Courbe, repere2D } from '@/components/drawing/Graphe';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { cisaillementRect, diagrammes, sectionComposee, type DonneesPoutreIso, type Rectangle } from '@/lib/calc/rdm1';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const GRIS = 'var(--color-beton)';
const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const pid = (base: string, id: string) => `${base}${id.replace(/[^a-zA-Z0-9]/g, '')}`;

/** Hypothèse de Navier-Bernoulli : une section plane reste plane et perpendiculaire à la fibre moyenne. */
export function SectionsPlanes() {
  const tranches = [100, 170, 240, 310, 380, 450, 520];
  return (
    <Figure alt="Une poutre avant et après flexion. Avant : des traits verticaux régulièrement espacés représentent des sections droites. Après : la poutre se courbe, les traits restent droits mais tournent ; les fibres du haut se raccourcissent (compression), celles du bas s'allongent (traction), la fibre moyenne garde sa longueur. C'est l'hypothèse de Navier-Bernoulli." largeur={620} hauteur={230}>
      <rect x={90} y={20} width={440} height={40} fill="none" stroke={GRIS} strokeWidth={1.4} />
      {tranches.map((x) => (
        <line key={x} x1={x} x2={x} y1={20} y2={60} stroke={GRIS} />
      ))}
      <Etiquette x={540} y={44} taille={11}>
        avant
      </Etiquette>
      <path d={`M90 ${130} Q310 ${190} 530 ${130}`} fill="none" stroke={BLEU} strokeWidth={1.4} />
      <path d={`M90 ${170} Q310 ${230} 530 ${170}`} fill="none" stroke={BLEU} strokeWidth={1.4} />
      <path d={`M90 ${150} Q310 ${210} 530 ${150}`} fill="none" stroke={TERRE} strokeDasharray="6 4" />
      {tranches.map((x) => {
        const t = (x - 310) / 220;
        const ang = Math.atan(t * 0.27);
        const ym = 150 + 30 * (1 - t * t);
        return <line key={x} x1={x - 20 * Math.sin(ang)} y1={ym - 20 * Math.cos(ang)} x2={x + 20 * Math.sin(ang)} y2={ym + 20 * Math.cos(ang)} stroke={BLEU} strokeWidth={1.4} />;
      })}
      <Etiquette x={310} y={112} ancre="middle" taille={10.5} couleur={ROUGE}>
        haut : raccourci (compression)
      </Etiquette>
      <Etiquette x={310} y={225} ancre="middle" taille={10.5} couleur={BLEU}>
        bas : allongé (traction)
      </Etiquette>
      <Etiquette x={540} y={150} taille={10.5} couleur={TERRE}>
        fibre neutre
      </Etiquette>
      <Etiquette x={540} y={175} taille={11}>
        après
      </Etiquette>
    </Figure>
  );
}

/** Méthode des coupures : la partie gauche, ses charges et les efforts internes N, V, M sur la coupure. */
export function Coupure({ x, V, M, RA, q, P, aP }: { x: number; V: number; M: number; RA: number; q?: number; P?: number; aP?: number }) {
  const k = 280 / Math.max(x, 1);
  const x0 = 150;
  const y = 110;
  const xc = x0 + x * k;
  return (
    <Figure alt={`On coupe la poutre à x = ${n2(x)} m et l'on isole la partie gauche. Elle reçoit la réaction RA = ${n2(RA)} kN${q ? `, la charge répartie ${n1(q)} kN/m` : ''}${P && aP !== undefined && aP < x ? `, la force ${n1(P)} kN à ${n2(aP)} m` : ''}. Pour qu'elle reste en équilibre, la partie droite exerce sur la coupure un effort tranchant V = ${n2(V)} kN et un moment M = ${n2(M)} kN·m.`} largeur={620} hauteur={200}>
      <rect x={x0} y={y - 10} width={xc - x0} height={20} fill="var(--color-papier)" stroke={BLEU} strokeWidth={1.8} />
      <polygon points={points([[x0, y + 10], [x0 - 12, y + 30], [x0 + 12, y + 30]])} fill="none" stroke={BLEU} strokeWidth={1.4} />
      <Fleche x1={x0} y1={y + 75} x2={x0} y2={y + 32} couleur={VERT} epaisseur={2.4} />
      <Etiquette x={x0 - 6} y={y + 72} ancre="end" taille={11.5} gras couleur={VERT}>
        {`RA = ${n2(RA)} kN`}
      </Etiquette>
      {q
        ? Array.from({ length: Math.max(2, Math.round((xc - x0) / 25)) + 1 }, (_, i) => {
            const xi = x0 + (i * (xc - x0)) / Math.max(2, Math.round((xc - x0) / 25));
            return <Fleche key={i} x1={xi} y1={y - 40} x2={xi} y2={y - 12} couleur={TERRE} epaisseur={1.2} />;
          })
        : null}
      {q ? <line x1={x0} x2={xc} y1={y - 40} y2={y - 40} stroke={TERRE} strokeWidth={1.2} /> : null}
      {q ? (
        <Etiquette x={x0 + 4} y={y - 46} taille={11} couleur={TERRE}>
          {`q = ${n1(q)} kN/m`}
        </Etiquette>
      ) : null}
      {P && aP !== undefined && aP < x ? (
        <g>
          <Fleche x1={x0 + aP * k} y1={y - 70} x2={x0 + aP * k} y2={y - 12} couleur={ROUGE} epaisseur={2.4} />
          <Etiquette x={x0 + aP * k + 6} y={y - 62} taille={11.5} gras couleur={ROUGE}>
            {`P = ${n1(P)} kN`}
          </Etiquette>
        </g>
      ) : null}
      <line x1={xc} x2={xc} y1={y - 30} y2={y + 30} stroke={ROUGE} strokeDasharray="5 3" strokeWidth={1.4} />
      <Fleche x1={xc + 25} y1={y + (V >= 0 ? 35 : -35)} x2={xc + 25} y2={y + (V >= 0 ? -5 : 5)} couleur={BLEU} epaisseur={2.2} />
      <Etiquette x={xc + 34} y={y + 30} taille={11.5} gras couleur={BLEU}>
        {`V = ${n2(Math.abs(V))} kN`}
      </Etiquette>
      <path d={`M${xc + 10} ${y - 32} A 32 32 0 0 1 ${xc + 10} ${y + 32}`} fill="none" stroke={ROUGE} strokeWidth={2} markerEnd="" />
      <polygon points={points([[xc + 10, y + 32], [xc + 20, y + 26], [xc + 18, y + 38]])} fill={ROUGE} />
      <Etiquette x={xc + 50} y={y - 18} taille={11.5} gras couleur={ROUGE}>
        {`M = ${n2(M)} kN·m`}
      </Etiquette>
      <Cote x1={x0} y1={y + 50} x2={xc} y2={y + 50} texte={`x = ${n2(x)} m`} decalage={-14} />
    </Figure>
  );
}

/** Poutre avec ses diagrammes d'effort tranchant et de moment fléchissant, alignés. */
export function DiagrammesVM({ d, titre }: { d: DonneesPoutreIso; titre?: string }) {
  const r = diagrammes(d, 300);
  const Vm = Math.max(...r.pts.map((p) => Math.abs(p.V)), 1e-6);
  const Mm = Math.max(...r.pts.map((p) => Math.abs(p.M)), 1e-6);
  const x0 = 70;
  const l = 480;
  const X = (x: number) => x0 + (x / d.L) * l;
  const yb = 45;
  const yV = 140;
  const yM = 245;
  const aV = 45;
  const aM = 50;
  const fV = points([[X(0), yV], ...r.pts.map((p) => [X(p.x), yV - (p.V / Vm) * aV] as const), [X(d.L), yV]]);
  const fM = points([[X(0), yM], ...r.pts.map((p) => [X(p.x), yM + (p.M / Mm) * aM] as const), [X(d.L), yM]]);
  const iV0 = r.pts.findIndex((p, i) => i > 0 && Math.sign(p.V) !== Math.sign(r.pts[i - 1]!.V));
  return (
    <Figure alt={`${titre ?? 'Poutre'} de ${n2(d.L)} m : réactions RA = ${n2(r.RA)} kN et RB = ${n2(r.RB)} kN. Diagramme de l'effort tranchant, de +${n2(r.pts[0]!.V)} à ${n2(r.pts[r.pts.length - 1]!.V)} kN ; diagramme du moment fléchissant, maximal (${n2(r.Mmax)} kN·m) en x = ${n2(r.xMmax)} m, là où l'effort tranchant s'annule. Le moment positif est dessiné vers le bas, du côté des fibres tendues.`} largeur={620} hauteur={335}>
      <line x1={X(0)} x2={X(d.L)} y1={yb} y2={yb} stroke={BLEU} strokeWidth={4} />
      {[d.xA, d.xB].map((xa, i) => (
        <polygon key={i} points={points([[X(xa), yb + 3], [X(xa) - 9, yb + 18], [X(xa) + 9, yb + 18]])} fill="none" stroke={BLEU} strokeWidth={1.4} />
      ))}
      {d.charges.map((c, i) =>
        c.type === 'ponctuelle' ? (
          <g key={i}>
            <Fleche x1={X(c.a)} y1={yb - 38} x2={X(c.a)} y2={yb - 3} couleur={ROUGE} epaisseur={2.2} />
            <Etiquette x={X(c.a) + 5} y={yb - 30} taille={10.5} gras couleur={ROUGE}>
              {`${n1(c.F)} kN`}
            </Etiquette>
          </g>
        ) : (
          <g key={i}>
            <rect x={X(c.a)} y={yb - 16} width={X(c.b) - X(c.a)} height={12} fill={TERRE} opacity={0.25} />
            <Etiquette x={X(c.b) - 4} y={yb - 20} ancre="end" taille={10.5} couleur={TERRE}>
              {`${n1(c.q1)} kN/m`}
            </Etiquette>
          </g>
        ),
      )}
      <line x1={X(0)} x2={X(d.L)} y1={yV} y2={yV} stroke={GRIS} />
      <polygon points={fV} fill={BLEU} opacity={0.15} stroke={BLEU} strokeWidth={1.6} />
      <Etiquette x={20} y={yV + 4} taille={12} gras couleur={BLEU}>
        V
      </Etiquette>
      <Etiquette x={X(0) + 4} y={yV - aV - 4} taille={10.5} couleur={BLEU}>
        {`${n2(r.pts[0]!.V)} kN`}
      </Etiquette>
      <Etiquette x={X(d.L) - 4} y={yV + aV + 12} ancre="end" taille={10.5} couleur={BLEU}>
        {`${n2(r.pts[r.pts.length - 1]!.V)} kN`}
      </Etiquette>
      <line x1={X(0)} x2={X(d.L)} y1={yM} y2={yM} stroke={GRIS} />
      <polygon points={fM} fill={ROUGE} opacity={0.12} stroke={ROUGE} strokeWidth={1.6} />
      <Etiquette x={20} y={yM + 4} taille={12} gras couleur={ROUGE}>
        M
      </Etiquette>
      <line x1={X(r.xMmax)} x2={X(r.xMmax)} y1={yb} y2={yM + (r.Mmax / Mm) * aM} stroke={GRIS} strokeDasharray="3 3" />
      <Etiquette x={X(r.xMmax) + 6} y={yM + (r.Mmax / Mm) * aM + 14} taille={11} gras couleur={ROUGE}>
        {`Mmax = ${n2(r.Mmax)} kN·m (x = ${n2(r.xMmax)} m)`}
      </Etiquette>
      {iV0 > 0 ? <circle cx={X(r.pts[iV0]!.x)} cy={yV} r={4} fill={ROUGE} /> : null}
      <Etiquette x={X(0)} y={yb + 32} ancre="middle" taille={10.5}>
        {`RA ${n2(r.RA)}`}
      </Etiquette>
      <Etiquette x={X(d.L)} y={yb + 32} ancre="middle" taille={10.5}>
        {`RB ${n2(r.RB)}`}
      </Etiquette>
    </Figure>
  );
}

/** Barre en traction : longueur initiale, allongement, contrainte uniforme. */
export function BarreTraction({ N, L, dL, d, sigma }: { N: number; L: number; dL: number; d: number; sigma: number }) {
  const p = pid('bt', useId());
  return (
    <Figure alt={`Un tirant d'acier de ${n2(L)} m et de ${n1(d)} mm de diamètre, tiré par ${n1(N)} kN. La contrainte σ = N/A vaut ${n1(sigma)} MPa, la même dans toute la section ; la barre s'allonge de ${n2(dL)} mm (allongement exagéré sur le dessin).`} largeur={620} hauteur={170}>
      <Hachures prefixe={p} types={['ba']} />
      <rect x={20} y={40} width={30} height={60} fill={hachure(p, 'ba')} />
      <rect x={50} y={62} width={430} height={16} fill="none" stroke={GRIS} strokeDasharray="5 3" />
      <rect x={50} y={64} width={470} height={12} fill={BLEU} opacity={0.3} stroke={BLEU} />
      <Fleche x1={520} y1={70} x2={590} y2={70} couleur={ROUGE} epaisseur={2.6} />
      <Etiquette x={560} y={58} ancre="middle" taille={12} gras couleur={ROUGE}>
        {`N = ${n1(N)} kN`}
      </Etiquette>
      <Cote x1={50} y1={110} x2={480} y2={110} texte={`L = ${n2(L)} m`} decalage={-10} />
      <Cote x1={480} y1={110} x2={520} y2={110} texte={`ΔL = ${n2(dL)} mm`} decalage={-30} />
      <Etiquette x={250} y={50} ancre="middle" taille={11.5} couleur={BLEU}>
        {`σ = N/A = ${n1(sigma)} MPa`}
      </Etiquette>
    </Figure>
  );
}

/** Loi de Hooke : droite σ = E ε, puis palier plastique pour l'acier. */
export function DroiteHooke({ E = 210000, fy = 500, point }: { E?: number; fy?: number; point?: { eps: number; sigma: number } }) {
  const epsY = fy / E;
  const R = repere2D({ x0: 70, y0: 20, l: 470, h: 160, xmin: 0, xmax: epsY * 4, ymin: 0, ymax: fy * 1.2 });
  return (
    <Figure alt={`Courbe contrainte-déformation d'un acier : droite élastique de pente E = ${nombre(E, 0)} MPa jusqu'à la limite d'élasticité ${nombre(fy, 0)} MPa (ε = ${nombre(epsY * 1000, 2)} ‰), puis palier plastique. Tant qu'on reste sur la droite, la barre reprend sa longueur quand on la décharge.${point ? ` Le point de l'exemple (σ = ${n1(point.sigma)} MPa) est dans le domaine élastique.` : ''}`} largeur={620} hauteur={215}>
      <Axes R={R} gradX={[epsY, 2 * epsY, 3 * epsY]} gradY={[fy]} titreX="ε" titreY="σ (MPa)" decX={4} />
      <polyline points={points([[R.X(0), R.Y(0)], [R.X(epsY), R.Y(fy)], [R.X(epsY * 4), R.Y(fy)]])} fill="none" stroke={BLEU} strokeWidth={2.4} />
      <Etiquette x={R.X(epsY * 0.35)} y={R.Y(fy * 0.55)} ancre="end" taille={11.5} gras couleur={BLEU}>
        σ = E ε
      </Etiquette>
      <Etiquette x={R.X(epsY * 2.5)} y={R.Y(fy) - 8} ancre="middle" taille={11} couleur={TERRE}>
        palier plastique
      </Etiquette>
      {point ? <circle cx={R.X(point.eps)} cy={R.Y(point.sigma)} r={5} fill={ROUGE} /> : null}
    </Figure>
  );
}

/** Section composée : rectangles, centre de gravité, axe neutre, cotes. */
export function SectionComposee({ rects, titre = 'section' }: { rects: readonly Rectangle[]; titre?: string }) {
  const s = sectionComposee(rects);
  const largeur = Math.max(...rects.map((r) => (r.x ?? 0) + r.b));
  const k = Math.min(3.4, 180 / s.h, 300 / largeur);
  const x0 = 200 - (largeur * k) / 2;
  const yb = 200;
  const p = pid('sc', useId());
  return (
    <Figure alt={`${titre} composée de ${rects.length} rectangle(s) : aire ${nombre(s.A, 0)} cm², centre de gravité G à ${n2(s.yG)} cm du bas, moment d'inertie I = ${nombre(s.I, 0)} cm⁴ autour de l'axe horizontal passant par G. Fibre supérieure à v = ${n2(s.v)} cm, inférieure à v′ = ${n2(s.vp)} cm.`} largeur={620} hauteur={230}>
      <Hachures prefixe={p} types={['ba']} />
      {rects.map((r, i) => (
        <rect key={i} x={x0 + (r.x ?? (largeur - r.b) / 2) * k} y={yb - (r.y + r.h) * k} width={r.b * k} height={r.h * k} fill={hachure(p, 'ba')} stroke={BLEU} strokeWidth={1.4} />
      ))}
      <line x1={x0 - 20} x2={x0 + largeur * k + 20} y1={yb - s.yG * k} y2={yb - s.yG * k} stroke={ROUGE} strokeDasharray="10 4 2 4" strokeWidth={1.4} />
      <circle cx={x0 + (largeur * k) / 2} cy={yb - s.yG * k} r={4} fill={ROUGE} />
      <Etiquette x={x0 + (largeur * k) / 2 + 8} y={yb - s.yG * k - 6} taille={12} gras couleur={ROUGE}>
        G
      </Etiquette>
      <Cote x1={x0 + largeur * k + 30} y1={yb} x2={x0 + largeur * k + 30} y2={yb - s.yG * k} texte={`yG = ${n1(s.yG)}`} decalage={-14} />
      <Cote x1={x0 - 30} y1={yb} x2={x0 - 30} y2={yb - s.h * k} texte={`h = ${n1(s.h)}`} decalage={14} />
      <Etiquette x={420} y={60} taille={11.5}>
        {`A = ${nombre(s.A, 0)} cm²`}
      </Etiquette>
      <Etiquette x={420} y={80} taille={11.5}>
        {`I = ${nombre(s.I, 0)} cm⁴`}
      </Etiquette>
      <Etiquette x={420} y={100} taille={11.5}>
        {`v = ${n1(s.v)} cm ; v′ = ${n1(s.vp)} cm`}
      </Etiquette>
      <Etiquette x={420} y={130} taille={10.5} couleur={GRIS}>
        cotes en cm
      </Etiquette>
    </Figure>
  );
}

/** Répartition linéaire des contraintes normales de flexion dans la hauteur de la section. */
export function ContraintesFlexion({ rects, M }: { rects: readonly Rectangle[]; M: number }) {
  const s = sectionComposee(rects);
  const sigS = -(M * 1e6 * s.v * 10) / (s.I * 1e4);
  const sigI = (M * 1e6 * s.vp * 10) / (s.I * 1e4);
  const largeur = Math.max(...rects.map((r) => (r.x ?? 0) + r.b));
  const k = Math.min(3.4, 170 / s.h, 200 / largeur);
  const x0 = 140 - (largeur * k) / 2;
  const yb = 195;
  const yG = yb - s.yG * k;
  const xd = 420;
  const sm = Math.max(Math.abs(sigS), Math.abs(sigI));
  const kc = 110 / sm;
  return (
    <Figure alt={`Section sous un moment de ${n2(M)} kN·m : la contrainte varie linéairement avec la distance à l'axe neutre, nulle en G. Fibre supérieure ${n2(sigS)} MPa (compression), fibre inférieure ${n2(sigI)} MPa (traction). La fibre la plus éloignée de l'axe neutre est la plus sollicitée.`} largeur={620} hauteur={225}>
      {rects.map((r, i) => (
        <rect key={i} x={x0 + (r.x ?? (largeur - r.b) / 2) * k} y={yb - (r.y + r.h) * k} width={r.b * k} height={r.h * k} fill="var(--color-beton-clair)" stroke={BLEU} strokeWidth={1.4} />
      ))}
      <line x1={x0 - 20} x2={xd + 120} y1={yG} y2={yG} stroke={GRIS} strokeDasharray="10 4 2 4" />
      <Etiquette x={xd + 122} y={yG - 6} ancre="end" taille={11}>
        axe neutre
      </Etiquette>
      <line x1={xd} x2={xd} y1={yb - s.h * k} y2={yb} stroke={BLEU} />
      <polygon points={points([[xd, yb - s.h * k], [xd + sigS * kc, yb - s.h * k], [xd, yG]])} fill={ROUGE} opacity={0.3} stroke={ROUGE} />
      <polygon points={points([[xd, yG], [xd + sigI * kc, yb], [xd, yb]])} fill={BLEU} opacity={0.3} stroke={BLEU} />
      <Etiquette x={xd + sigS * kc - 4} y={yb - s.h * k - 6} ancre="end" taille={11.5} gras couleur={ROUGE}>
        {`${n2(sigS)} MPa`}
      </Etiquette>
      <Etiquette x={xd + sigI * kc + 4} y={yb + 4} taille={11.5} gras couleur={BLEU}>
        {`+${n2(sigI)} MPa`}
      </Etiquette>
      <Etiquette x={xd - 60} y={yb - s.h * k + 18} ancre="end" taille={10.5} couleur={ROUGE}>
        compression
      </Etiquette>
      <Etiquette x={xd - 10} y={yb - 6} ancre="end" taille={10.5} couleur={BLEU}>
        traction
      </Etiquette>
    </Figure>
  );
}

/** Répartition parabolique du cisaillement dans une section rectangulaire. */
export function CisaillementRect({ V, b, h }: { V: number; b: number; h: number }) {
  const c = cisaillementRect(V, b, h);
  const k = Math.min(3, 170 / h);
  const yb = 200;
  const xs = 120;
  const xd = 380;
  const kt = 140 / c.tauMax;
  const pts: Array<readonly [number, number]> = [];
  for (let i = 0; i <= 40; i++) {
    const y = -h / 2 + (i * h) / 40;
    pts.push([xd + c.tau(y) * kt, yb - (y + h / 2) * k]);
  }
  return (
    <Figure alt={`Section rectangulaire ${n1(b)} × ${n1(h)} cm sous un effort tranchant de ${n1(V)} kN : la contrainte de cisaillement est nulle en haut et en bas, maximale au centre (${n2(c.tauMax)} MPa), soit 1,5 fois la valeur moyenne V/A = ${n2(c.tauMoyen)} MPa. La répartition est parabolique.`} largeur={620} hauteur={225}>
      <rect x={xs - (b * k) / 2} y={yb - h * k} width={b * k} height={h * k} fill="var(--color-beton-clair)" stroke={BLEU} strokeWidth={1.4} />
      <line x1={xd} x2={xd} y1={yb - h * k} y2={yb} stroke={BLEU} />
      <polygon points={points([[xd, yb], ...pts, [xd, yb - h * k]])} fill={TERRE} opacity={0.3} stroke={TERRE} strokeWidth={1.6} />
      <line x1={xd + c.tauMoyen * kt} x2={xd + c.tauMoyen * kt} y1={yb - h * k} y2={yb} stroke={GRIS} strokeDasharray="4 3" />
      <Etiquette x={xd + c.tauMax * kt + 6} y={yb - (h / 2) * k + 4} taille={11.5} gras couleur={TERRE}>
        {`τmax = ${n2(c.tauMax)} MPa`}
      </Etiquette>
      <Etiquette x={xd + c.tauMoyen * kt + 4} y={yb - h * k + 12} taille={10.5} couleur={GRIS}>
        {`moyenne ${n2(c.tauMoyen)}`}
      </Etiquette>
      <Cote x1={xs - (b * k) / 2} y1={yb + 10} x2={xs + (b * k) / 2} y2={yb + 10} texte={`b = ${n1(b)} cm`} decalage={-10} />
      <Cote x1={xs + (b * k) / 2 + 20} y1={yb} x2={xs + (b * k) / 2 + 20} y2={yb - h * k} texte={`h = ${n1(h)} cm`} decalage={-12} />
    </Figure>
  );
}

/** Arbre circulaire en torsion : génératrice qui s'enroule, cisaillement linéaire en r. */
export function ArbreTorsion({ T, D, d = 0, tau, thetaDeg }: { T: number; D: number; d?: number; tau: number; thetaDeg: number }) {
  return (
    <Figure alt={`Arbre circulaire de diamètre ${n1(D)} mm${d > 0 ? ` (creux, intérieur ${n1(d)} mm)` : ''} soumis à un couple de ${n2(T)} kN·m. Une génératrice droite s'enroule en hélice : l'extrémité tourne de ${n2(thetaDeg)}°. Dans la section, le cisaillement croît linéairement du centre (nul) au bord (${n1(tau)} MPa).`} largeur={620} hauteur={200}>
      <rect x={60} y={60} width={300} height={70} rx={4} fill="var(--color-beton-clair)" stroke={BLEU} strokeWidth={1.4} />
      <ellipse cx={360} cy={95} rx={14} ry={35} fill="var(--color-papier)" stroke={BLEU} strokeWidth={1.4} />
      <line x1={60} x2={360} y1={70} y2={70} stroke={GRIS} strokeDasharray="4 3" />
      <path d="M60 70 C 160 72, 260 90, 360 118" fill="none" stroke={ROUGE} strokeWidth={2} />
      <path d="M385 60 A 40 40 0 0 1 385 130" fill="none" stroke={ROUGE} strokeWidth={2} />
      <polygon points={points([[385, 130], [394, 122], [378, 120]])} fill={ROUGE} />
      <Etiquette x={400} y={60} taille={11.5} gras couleur={ROUGE}>
        {`T = ${n2(T)} kN·m`}
      </Etiquette>
      <Etiquette x={210} y={150} ancre="middle" taille={11} couleur={ROUGE}>
        {`la génératrice s'enroule : θ = ${n2(thetaDeg)}°`}
      </Etiquette>
      <circle cx={520} cy={95} r={55} fill="var(--color-beton-clair)" stroke={BLEU} strokeWidth={1.4} />
      {d > 0 ? <circle cx={520} cy={95} r={(55 * d) / D} fill="var(--color-papier)" stroke={BLEU} /> : null}
      <polygon points={points([[520, 95], [575, 95], [575, 55]])} fill={TERRE} opacity={0.35} stroke={TERRE} />
      <Etiquette x={520} y={170} ancre="middle" taille={11} couleur={TERRE}>
        {`τ max au bord : ${n1(tau)} MPa`}
      </Etiquette>
    </Figure>
  );
}

/** Boulon en cisaillement simple et double. */
export function BoulonCisaillement({ plans }: { plans: 1 | 2 }) {
  const bloc = (x: number, n: 1 | 2, actif: boolean) => {
    const c = actif ? BLEU : GRIS;
    return (
      <g opacity={actif ? 1 : 0.45}>
        <rect x={x} y={70} width={170} height={14} fill="var(--color-beton-clair)" stroke={c} />
        <rect x={x + 60} y={84} width={170} height={14} fill="var(--color-papier)" stroke={c} />
        {n === 2 ? <rect x={x} y={98} width={170} height={14} fill="var(--color-beton-clair)" stroke={c} /> : null}
        <rect x={x + 108} y={60} width={14} height={n === 2 ? 62 : 48} fill={c} opacity={0.6} />
        <line x1={x + 100} x2={x + 130} y1={84} y2={84} stroke={ROUGE} strokeWidth={2.4} />
        {n === 2 ? <line x1={x + 100} x2={x + 130} y1={98} y2={98} stroke={ROUGE} strokeWidth={2.4} /> : null}
        <Fleche x1={x + 230} y1={91} x2={x + 270} y2={91} couleur={ROUGE} epaisseur={2} />
        <Fleche x1={x} y1={n === 2 ? 91 : 77} x2={x - 35} y2={n === 2 ? 91 : 77} couleur={ROUGE} epaisseur={2} />
        <Etiquette x={x + 115} y={150} ancre="middle" taille={12} gras couleur={c}>
          {n === 1 ? 'cisaillement simple : 1 plan' : 'cisaillement double : 2 plans'}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="Deux assemblages boulonnés. À gauche, deux plats superposés : le boulon est coupé selon un seul plan (cisaillement simple). À droite, un plat pris entre deux couvre-joints : le boulon est coupé selon deux plans (cisaillement double) ; chaque plan ne reprend que la moitié de l'effort." largeur={620} hauteur={170}>
      {bloc(40, 1, plans === 1)}
      {bloc(340, 2, plans === 2)}
      <Etiquette x={310} y={30} ancre="middle" taille={11} couleur={ROUGE}>
        plans de cisaillement en rouge
      </Etiquette>
    </Figure>
  );
}

/** Plancher bois : solives à l'entraxe e, plancher, portée L. */
export function PlancherSolives({ e, L, b, h }: { e: number; L: number; b: number; h: number }) {
  const p = pid('ps', useId());
  return (
    <Figure alt={`Plancher en bois : des solives de ${n1(b)} × ${n1(h)} cm posées tous les ${n2(e)} m entre deux murs distants de ${n2(L)} m portent un plancher en planches. Chaque solive reprend la charge d'une bande de plancher de largeur e.`} largeur={620} hauteur={210}>
      <Hachures prefixe={p} types={['maconnerie']} />
      <rect x={40} y={40} width={30} height={150} fill={hachure(p, 'maconnerie')} stroke={GRIS} />
      <rect x={550} y={40} width={30} height={150} fill={hachure(p, 'maconnerie')} stroke={GRIS} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={70} y={55 + i * 30} width={480} height={10} fill={TERRE} opacity={0.6} stroke={TERRE} />
      ))}
      <rect x={70} y={82} width={480} height={30} fill={TERRE} opacity={0.12} stroke={ROUGE} strokeDasharray="5 3" />
      <Etiquette x={310} y={102} ancre="middle" taille={11} gras couleur={ROUGE}>
        bande reprise par une solive : largeur e
      </Etiquette>
      <Cote x1={70} y1={200} x2={550} y2={200} texte={`L = ${n2(L)} m`} decalage={-6} />
      <Cote x1={30} y1={60} x2={30} y2={90} texte={`e = ${n2(e)} m`} decalage={14} />
      <Etiquette x={560} y={30} ancre="end" taille={11}>
        {`solives ${n1(b)} × ${n1(h)} cm (vue en plan)`}
      </Etiquette>
    </Figure>
  );
}

/** Poutre en T fléchie en isométrie : matière, zones comprimée et tendue, plan neutre (calques). */
export function PoutreTIso() {
  const iso = (x: number, y: number, z: number) => [310 + (x - y) * 0.866 * 38, 200 + (x + y) * 0.5 * 38 - z * 38] as const;
  const face = (pts: Array<readonly [number, number, number]>) => points(pts.map(([x, y, z]) => iso(x, y, z)));
  const L = 5;
  return (
    <Figure alt="Vue isométrique d'une poutre en T de 5 m sous moment positif. La table supérieure est comprimée (rouge), le bas de la nervure est tendu (bleu), et le plan neutre horizontal passe par le centre de gravité, près de la table. Les calques permettent d'afficher séparément la matière, les contraintes et le plan neutre." largeur={620} hauteur={300}>
      <Calque id="matiere">
        <polygon points={face([[0, -1.5, 3], [L, -1.5, 3], [L, 1.5, 3], [0, 1.5, 3]])} fill="var(--color-beton-clair)" stroke={BLEU} />
        <polygon points={face([[0, 1.5, 3], [L, 1.5, 3], [L, 1.5, 2.4], [0, 1.5, 2.4]])} fill="var(--color-beton-clair)" stroke={BLEU} />
        <polygon points={face([[0, 0.5, 2.4], [L, 0.5, 2.4], [L, 0.5, 0], [0, 0.5, 0]])} fill="var(--color-beton-clair)" stroke={BLEU} />
        <polygon points={face([[0, -1.5, 3], [0, 1.5, 3], [0, 1.5, 2.4], [0, 0.5, 2.4], [0, 0.5, 0], [0, -0.5, 0], [0, -0.5, 2.4], [0, -1.5, 2.4]])} fill="var(--color-papier)" stroke={BLEU} strokeWidth={1.4} />
      </Calque>
      <Calque id="contraintes">
        <polygon points={face([[0, -1.5, 3], [L, -1.5, 3], [L, 1.5, 3], [0, 1.5, 3]])} fill={ROUGE} opacity={0.3} />
        <polygon points={face([[0, -0.5, 0], [0, 0.5, 0], [0, 0.5, 0.6], [0, -0.5, 0.6]])} fill={BLEU} opacity={0.45} />
        <Etiquette x={iso(L, -1.5, 3)[0] + 8} y={iso(L, -1.5, 3)[1]} taille={11} gras couleur={ROUGE}>
          compression
        </Etiquette>
        <Etiquette x={iso(0, 0.5, 0)[0] + 8} y={iso(0, 0.5, 0)[1] + 4} taille={11} gras couleur={BLEU}>
          traction
        </Etiquette>
      </Calque>
      <Calque id="neutre">
        <polygon points={face([[0, -0.5, 1.9], [L, -0.5, 1.9], [L, 0.5, 1.9], [0, 0.5, 1.9]])} fill={TERRE} opacity={0.35} stroke={TERRE} strokeDasharray="6 3" />
        <Etiquette x={iso(L, 0.5, 1.9)[0] + 8} y={iso(L, 0.5, 1.9)[1] + 4} taille={11} gras couleur={TERRE}>
          plan neutre (par G)
        </Etiquette>
      </Calque>
    </Figure>
  );
}
