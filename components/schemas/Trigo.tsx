// Schémas du module N0.4 (trigonométrie). Toutes les valeurs viennent de lib/calc/trigo.ts.
import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { Calque } from '@/components/gabarits/Vue3D';
import {
  composantes,
  convertirAngle,
  cosD,
  ecrituresPente,
  enRad,
  rectDeuxCotes,
  sinD,
  type DonneesProfil,
  type DonneesToiture,
  type ResultatFerme,
  type ResultatProfil,
  type ResultatToiture,
  type Triangle,
} from '@/lib/calc/trigo';
import { projeterIso, type Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
type P2 = readonly [number, number];

/** Arc de cercle (angles en degrés, sens trigonométrique, repère SVG à y vers le bas). */
function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (a: number) => [cx + r * Math.cos(enRad(a)), cy - r * Math.sin(enRad(a))] as const;
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 0 : 1;
  return `M${x0} ${y0} A${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
}

/** Position d'une étiquette au milieu d'un arc. */
function milieuArc(cx: number, cy: number, r: number, a0: number, a1: number): P2 {
  const a = (a0 + a1) / 2;
  return [cx + r * Math.cos(enRad(a)), cy - r * Math.sin(enRad(a))];
}

/** Marque d'angle droit au point P, entre les directions unitaires u et v (repère SVG). */
function AngleDroit({ P, u, v, s = 10 }: { P: P2; u: P2; v: P2; s?: number }) {
  const a: P2 = [P[0] + s * u[0], P[1] + s * u[1]];
  const b: P2 = [a[0] + s * v[0], a[1] + s * v[1]];
  const c: P2 = [P[0] + s * v[0], P[1] + s * v[1]];
  return <polyline points={points([a, b, c])} className="t-fin" fill="none" />;
}

const unitaire = (A: P2, B: P2): P2 => {
  const l = Math.hypot(B[0] - A[0], B[1] - A[1]);
  return [(B[0] - A[0]) / l, (B[1] - A[1]) / l];
};

// ---------- Le rapporteur (N0.4.1) ----------

export function Rapporteur({ deg = 60 }: { deg?: number }) {
  const cx = 190;
  const cy = 128;
  const r = 96;
  const t = ((deg % 360) + 360) % 360;
  const fin = milieuArc(cx, cy, r, t, t);
  return (
    <Figure
      alt={`Cadran gradué en degrés (extérieur) et en grades (intérieur) ; angle de ${nombre(deg, 2)}°, soit ${nombre(convertirAngle(deg, 'deg', 'rad'), 3)} rad et ${nombre(convertirAngle(deg, 'deg', 'gon'), 2)} gon`}
      largeur={620}
      hauteur={256}
    >
      <circle cx={cx} cy={cy} r={r} fill="var(--color-papier)" className="t-moyen" />
      {t > 0 ? <path d={`M${cx} ${cy} L${cx + r} ${cy} ${arc(cx, cy, r, 0, t).replace(/^M[^A]*/, '')} Z`} fill="var(--color-encre-clair)" stroke="none" /> : null}
      {Array.from({ length: 36 }, (_, i) => i * 10).map((a) => {
        const [x0, y0] = milieuArc(cx, cy, r, a, a);
        const [x1, y1] = milieuArc(cx, cy, r - (a % 30 === 0 ? 10 : 5), a, a);
        return <line key={a} x1={x0} y1={y0} x2={x1} y2={y1} className="t-fin" />;
      })}
      {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => {
        const [x, y] = milieuArc(cx, cy, r + 14, a, a);
        return (
          <Etiquette key={`d${a}`} x={x} y={y + 4} ancre="middle" taille={10.5}>
            {a}°
          </Etiquette>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => i * 50).map((g) => {
        const a = convertirAngle(g, 'gon', 'deg');
        const [x, y] = milieuArc(cx, cy, r - 24, a, a);
        return (
          <Etiquette key={`g${g}`} x={x} y={y + 4} ancre="middle" taille={9.5} classe="etiquette">
            {g}
          </Etiquette>
        );
      })}
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} className="t-moyen" />
      <line x1={cx} y1={cy} x2={fin[0]} y2={fin[1]} className="t-fort" stroke="var(--color-encre)" />
      {t > 0 ? <path d={arc(cx, cy, 34, 0, t)} className="t-moyen" stroke="var(--color-encre)" fill="none" /> : null}
      <circle cx={cx} cy={cy} r={3} fill="var(--trait)" />
      <Etiquette x={360} y={190} taille={10.5} classe="etiquette">
        graduations extérieures : degrés · intérieures : grades (gon)
      </Etiquette>
      <Etiquette x={360} y={78} taille={14} gras classe="encre">
        θ = {nombre(deg, 2)}°
      </Etiquette>
      <Etiquette x={360} y={102} taille={13}>
        = {nombre(convertirAngle(deg, 'deg', 'rad'), 4)} rad
      </Etiquette>
      <Etiquette x={360} y={124} taille={13}>
        = {nombre(convertirAngle(deg, 'deg', 'gon'), 4)} gon
      </Etiquette>
      <Etiquette x={360} y={160} taille={11.5} classe="etiquette">
        un tour : 360° = 2π rad = 400 gon
      </Etiquette>
    </Figure>
  );
}

/** Un radian : l'arc intercepté a la longueur du rayon. */
export function UnRadian() {
  const cx = 200;
  const cy = 122;
  const R = 100;
  const a = convertirAngle(1, 'rad', 'deg');
  const fin = milieuArc(cx, cy, R, a, a);
  return (
    <Figure alt={`Un radian : l'arc de cercle a la même longueur que le rayon ; 1 rad = ${nombre(a, 4)}°`} largeur={620} hauteur={236}>
      <circle cx={cx} cy={cy} r={R} fill="none" className="t-fin" strokeDasharray="4 3" />
      <line x1={cx} y1={cy} x2={cx + R} y2={cy} className="t-fort" />
      <line x1={cx} y1={cy} x2={fin[0]} y2={fin[1]} className="t-fort" />
      <path d={arc(cx, cy, R, 0, a)} fill="none" stroke="var(--color-correction)" strokeWidth={3.4} />
      <path d={arc(cx, cy, 26, 0, a)} className="t-moyen" fill="none" />
      <Etiquette x={cx + R / 2} y={cy + 18} ancre="middle" taille={13} gras>
        r
      </Etiquette>
      <Etiquette x={(cx + fin[0]) / 2 - 12} y={(cy + fin[1]) / 2} ancre="end" taille={13} gras>
        r
      </Etiquette>
      <Etiquette x={milieuArc(cx, cy, R + 14, 0, a)[0] + 4} y={milieuArc(cx, cy, R + 14, 0, a)[1]} taille={13} gras couleur="var(--color-correction)">
        arc = r
      </Etiquette>
      <Etiquette x={cx + 32} y={cy - 12} taille={12} gras classe="encre">
        1 rad
      </Etiquette>
      <Etiquette x={360} y={110} taille={13} gras>
        1 rad = {nombre(a, 4)}°
      </Etiquette>
      <Etiquette x={360} y={134} taille={12}>
        un tour = 2π rad ≈ {nombre(convertirAngle(360, 'deg', 'rad'), 4)} rad
      </Etiquette>
    </Figure>
  );
}

// ---------- Le mât et son hauban (N0.4.2) ----------

export function MatHauban({ h, d }: { h: number; d: number }) {
  const t = rectDeuxCotes(h, d);
  const hm = h * 1.15;
  const xmin = -1.4;
  const xmax = d + 1.2;
  const ymin = -0.7;
  const ymax = hm + 0.4;
  const k = Math.min(560 / (xmax - xmin), 250 / (ymax - ymin));
  const X = (x: number) => 30 + (x - xmin) * k;
  const Y = (y: number) => 20 + (ymax - y) * k;
  const att: P2 = [X(0), Y(h)];
  const anc: P2 = [X(d), Y(0)];
  const pied: P2 = [X(0), Y(0)];
  return (
    <Figure alt={`Mât haubané : hauban fixé à ${n2(h)} m de haut et ancré à ${n2(d)} m du pied ; longueur ${n2(t.c)} m, angle avec le sol ${nombre(t.alpha, 2)}°`} largeur={620} hauteur={(ymax - ymin) * k + 40}>
      <Hachures prefixe="mat" types={['terre', 'beton']} />
      <rect x={X(xmin)} y={Y(0)} width={(xmax - xmin) * k} height={Y(ymin) - Y(0)} fill={hachure('mat', 'terre')} />
      <line x1={X(xmin)} y1={Y(0)} x2={X(xmax)} y2={Y(0)} className="t-moyen" />
      <rect x={X(-0.12)} y={Y(hm)} width={0.24 * k} height={hm * k} fill="var(--fond-ba)" className="t-fort" />
      <rect x={anc[0] - 0.3 * k} y={Y(0)} width={0.6 * k} height={0.4 * k} fill={hachure('mat', 'beton')} className="t-moyen" />
      <line x1={att[0]} y1={att[1]} x2={anc[0]} y2={anc[1]} stroke="var(--color-encre)" strokeWidth={2.2} />
      <AngleDroit P={pied} u={[1, 0]} v={[0, -1]} />
      <path d={arc(anc[0], anc[1], 30, 180 - t.alpha, 180)} className="t-moyen" fill="none" />
      <Etiquette x={anc[0] - 42} y={anc[1] - 8} ancre="end" taille={12.5} gras classe="encre">
        α = {nombre(t.alpha, 2)}°
      </Etiquette>
      <path d={arc(att[0], att[1], 28, -90, -t.alpha)} className="t-moyen" fill="none" />
      <Etiquette x={att[0] + 10} y={att[1] + 46} taille={12}>
        β = {nombre(t.beta, 2)}°
      </Etiquette>
      <Cote x1={pied[0]} y1={pied[1]} x2={att[0]} y2={att[1]} decalage={24} texte={`h = ${n2(h)} m`} />
      <Cote x1={pied[0]} y1={pied[1]} x2={anc[0]} y2={anc[1]} decalage={-26} texte={`d = ${n2(d)} m`} />
      <Etiquette x={(att[0] + anc[0]) / 2 + 12} y={(att[1] + anc[1]) / 2 - 6} taille={13} gras classe="encre">
        L = {n2(t.c)} m
      </Etiquette>
      <Etiquette x={X(0) - 10} y={Y(hm) + 14} ancre="end" taille={11}>
        mât
      </Etiquette>
      <Etiquette x={anc[0]} y={Y(0) + 0.4 * k + 14} ancre="middle" taille={11}>
        ancrage
      </Etiquette>
    </Figure>
  );
}

// ---------- La pièce et ses diagonales (N0.4.2, vue 3D) ----------

export function PieceIso({ L, l, h }: { L: number; l: number; h: number }) {
  const dSol = rectDeuxCotes(L, l).c;
  const D = rectDeuxCotes(dSol, h).c;
  const coins: Point3[] = [
    [0, 0, 0], [L, 0, 0], [L, l, 0], [0, l, 0],
    [0, 0, h], [L, 0, h], [L, l, h], [0, l, h],
  ];
  const proj = coins.map(projeterIso);
  const xs = proj.map((p) => p[0]);
  const ys = proj.map((p) => p[1]);
  const marge = 40;
  const k = Math.min((620 - 2 * marge) / (Math.max(...xs) - Math.min(...xs)), 300 / (Math.max(...ys) - Math.min(...ys)));
  const x0 = (620 - (Math.max(...xs) - Math.min(...xs)) * k) / 2 - Math.min(...xs) * k;
  const y0 = 30 - Math.min(...ys) * k;
  const P = (p: Point3): P2 => {
    const [u, v] = projeterIso(p);
    return [x0 + u * k, y0 + v * k];
  };
  const seg = (a: Point3, b: Point3, props: React.SVGProps<SVGLineElement>) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} {...props} />;
  };
  const O: Point3 = [0, 0, 0];
  const sol4: Point3[] = [[0, 0, 0], [L, 0, 0], [L, l, 0], [0, l, 0]];
  // arêtes vues ; les trois arêtes qui partent du coin (0, 0, 0), le plus éloigné de l'observateur, sont cachées
  const vues: Array<[Point3, Point3]> = [
    [[L, 0, 0], [L, l, 0]], [[L, l, 0], [0, l, 0]], [[L, 0, 0], [L, 0, h]], [[L, l, 0], [L, l, h]], [[0, l, 0], [0, l, h]],
    [[0, 0, h], [L, 0, h]], [[L, 0, h], [L, l, h]], [[L, l, h], [0, l, h]], [[0, l, h], [0, 0, h]],
  ];
  const cachees: Array<[Point3, Point3]> = [[O, [L, 0, 0]], [O, [0, l, 0]], [O, [0, 0, h]]];
  const hauteur = (Math.max(...ys) - Math.min(...ys)) * k + 70;
  // diagonales tracées depuis (L, 0, 0) : elles se voient en vraie longueur en perspective isométrique
  const dep: Point3 = [L, 0, 0];
  const piedD: Point3 = [0, l, 0];
  const hautD: Point3 = [0, l, h];
  const coin = P([L, l, 0]);
  return (
    <Figure alt={`Pièce de ${n2(L)} × ${n2(l)} × ${n2(h)} m : diagonale du sol ${n2(dSol)} m, diagonale de l'espace ${n2(D)} m`} largeur={620} hauteur={hauteur}>
      <Calque id="piece">
        <polygon points={points(sol4.map(P))} fill="var(--fond-beton)" opacity={0.6} />
        {vues.map(([a, b], i) => (
          <g key={i}>{seg(a, b, { className: 't-moyen' })}</g>
        ))}
        {cachees.map(([a, b], i) => (
          <g key={`c${i}`}>{seg(a, b, { className: 't-cache' })}</g>
        ))}
      </Calque>
      <Calque id="sol">
        {seg(dep, piedD, { stroke: 'var(--color-encre)', strokeWidth: 2.4 })}
        <AngleDroit P={coin} u={unitaire(coin, P(dep))} v={unitaire(coin, P(piedD))} />
      </Calque>
      <Calque id="espace">
        {seg(dep, hautD, { stroke: 'var(--color-correction)', strokeWidth: 2.4 })}
        {seg(piedD, hautD, { stroke: 'var(--color-correction)', strokeWidth: 1.6 })}
        <AngleDroit P={P(piedD)} u={unitaire(P(piedD), P(dep))} v={unitaire(P(piedD), P(hautD))} />
      </Calque>
      <Calque id="cotes">
        <Etiquette x={(P([L, l, 0])[0] + P(piedD)[0]) / 2 - 10} y={(P([L, l, 0])[1] + P(piedD)[1]) / 2 + 20} ancre="end" taille={12} gras>
          L = {n2(L)} m
        </Etiquette>
        <Etiquette x={(P(dep)[0] + coin[0]) / 2 + 12} y={(P(dep)[1] + coin[1]) / 2 + 16} taille={12} gras>
          l = {n2(l)} m
        </Etiquette>
        <Etiquette x={P([0, l, h / 2])[0] - 8} y={P([0, l, h / 2])[1]} ancre="end" taille={12} gras>
          h = {n2(h)} m
        </Etiquette>
        <Etiquette x={(P(dep)[0] + P(piedD)[0]) / 2} y={(P(dep)[1] + P(piedD)[1]) / 2 + 18} ancre="middle" taille={12.5} gras classe="encre">
          d = {n2(dSol)} m
        </Etiquette>
        <Etiquette x={(P(dep)[0] + P(hautD)[0]) / 2} y={(P(dep)[1] + P(hautD)[1]) / 2 - 10} ancre="middle" taille={12.5} gras couleur="var(--color-correction)">
          D = {n2(D)} m
        </Etiquette>
      </Calque>
    </Figure>
  );
}

// ---------- Pente et talus (N0.4.3) ----------

export function TalusPente({ H, n, prefixe = 'tal' }: { H: number; n: number; prefixe?: string }) {
  const e = ecrituresPente(1 / n);
  const base = n * H;
  const k = Math.min(380 / (base + 1.5), 170 / H);
  const xPied = 120 + (1.5 + base) * k;
  const yBas = 210;
  const yHaut = yBas - H * k;
  const xCrete = 120 + 1.5 * k;
  return (
    <Figure alt={`Talus de ${n2(H)} m de haut réglé à ${nombre(n, 2)} pour 1 : base ${n2(base)} m, pente ${nombre(e.pourcent, 2)} %, angle ${nombre(e.deg, 2)}°`} largeur={620} hauteur={250}>
      <Hachures prefixe={prefixe} types={['remblai', 'terre']} />
      <rect x={40} y={yBas} width={540} height={14} fill={hachure(prefixe, 'terre')} />
      <polygon points={points([[40, yBas], [40, yHaut], [xCrete, yHaut], [xPied, yBas]])} fill={hachure(prefixe, 'remblai')} className="t-fort" />
      <line x1={40} y1={yBas} x2={580} y2={yBas} className="t-moyen" />
      <path d={arc(xPied, yBas, 40, 180 - e.deg, 180)} className="t-moyen" fill="none" />
      <Etiquette x={xPied - 48} y={yBas - 8} ancre="end" taille={12.5} gras classe="encre">
        α = {nombre(e.deg, 2)}°
      </Etiquette>
      <Cote x1={xCrete} y1={yBas} x2={xPied} y2={yBas} decalage={-26} texte={`base = ${n2(base)} m`} />
      <Cote x1={xCrete} y1={yBas} x2={xCrete} y2={yHaut} decalage={20} texte={`H = ${n2(H)} m`} />
      <Etiquette x={(xCrete + xPied) / 2 + 16} y={(yHaut + yBas) / 2 - 10} taille={12}>
        rampant {n2(Math.hypot(base, H))} m
      </Etiquette>
      <Etiquette x={440} y={40} taille={12.5} gras>
        talus à {nombre(n, 2)} pour 1
      </Etiquette>
      <Etiquette x={440} y={60} taille={12}>
        = {nombre(e.pourcent, 2)} % = {nombre(e.pourmille, 0)} ‰
      </Etiquette>
      <Etiquette x={440} y={80} taille={12}>
        = {nombre(e.deg, 2)}° = {nombre(e.gon, 2)} gon
      </Etiquette>
    </Figure>
  );
}

/** Profil en travers type d'une route en terre en remblai (planche N0.4.3). */
export function ProfilTravers({ d, r }: { d: DonneesProfil; r: ResultatProfil }) {
  const E = r.emprise;
  const k = 560 / (E + 1);
  const X = (x: number) => 310 + x * k; // x = 0 sur l'axe
  const Y = (z: number) => 150 - z * k;
  const w = d.largeur / 2;
  const pied = w + r.talus.emprise;
  const profil: P2[] = [
    [X(-pied), Y(0)],
    [X(-w), Y(d.H)],
    [X(0), Y(d.H + r.fleche)],
    [X(w), Y(d.H)],
    [X(pied), Y(0)],
  ];
  return (
    <Figure alt={`Profil en travers : plateforme de ${n2(d.largeur)} m bombée à ${nombre(d.bombement, 0)} %, remblai de ${n2(d.H)} m, talus à ${nombre(d.n, 2)} pour 1, emprise ${n2(E)} m`} largeur={620} hauteur={230}>
      <Hachures prefixe="pt" types={['remblai', 'terre']} />
      <rect x={X(-pied) - 14} y={Y(0)} width={(2 * pied) * k + 28} height={12} fill={hachure('pt', 'terre')} />
      <polygon points={points(profil)} fill={hachure('pt', 'remblai')} className="t-fort" />
      <line x1={X(-pied) - 14} y1={Y(0)} x2={X(pied) + 14} y2={Y(0)} className="t-moyen" />
      <line x1={X(0)} y1={Y(d.H + r.fleche) - 22} x2={X(0)} y2={Y(0) + 16} className="t-axe" />
      <Etiquette x={X(0)} y={Y(d.H + r.fleche) - 26} ancre="middle" taille={11}>
        axe
      </Etiquette>
      <Etiquette x={X(-w / 2)} y={Y(d.H + r.fleche / 2) - 10} ancre="middle" taille={12} gras classe="encre">
        ← {nombre(d.bombement, 0)} %
      </Etiquette>
      <Etiquette x={X(w / 2)} y={Y(d.H + r.fleche / 2) - 10} ancre="middle" taille={12} gras classe="encre">
        {nombre(d.bombement, 0)} % →
      </Etiquette>
      <Etiquette x={X(-w - r.talus.emprise / 2) - 8} y={Y(d.H / 2) - 6} ancre="end" taille={12} gras>
        {nombre(d.n, 1)} / 1
      </Etiquette>
      <Etiquette x={X(w + r.talus.emprise / 2) + 8} y={Y(d.H / 2) - 6} taille={12} gras>
        {nombre(d.n, 1)} / 1
      </Etiquette>
      <Cote x1={X(-w)} y1={Y(d.H)} x2={X(w)} y2={Y(d.H)} decalage={48} texte={`plateforme ${n2(d.largeur)} m`} />
      <Cote x1={X(-pied)} y1={Y(0)} x2={X(pied)} y2={Y(0)} decalage={-34} texte={`emprise ${n2(E)} m`} />
      <Cote x1={X(pied)} y1={Y(0)} x2={X(pied)} y2={Y(d.H)} decalage={-18} texte={`${n2(d.H)} m`} />
    </Figure>
  );
}

// ---------- Cercle trigonométrique et composantes (N0.4.4) ----------

export function CercleForce({ F, theta, unite = 'kN' }: { F: number; theta: number; unite?: string }) {
  const c = composantes(F, theta);
  const cx = 230;
  const cy = 140;
  const R = 105;
  const px = cx + R * cosD(theta);
  const py = cy - R * sinD(theta);
  const t = ((theta % 360) + 360) % 360;
  const pointe = (x: number, y: number, a: number) => {
    const g = 9;
    return points([
      [x, y],
      [x - g * Math.cos(enRad(a - 22)), y + g * Math.sin(enRad(a - 22))],
      [x - g * Math.cos(enRad(a + 22)), y + g * Math.sin(enRad(a + 22))],
    ]);
  };
  return (
    <Figure alt={`Force de ${nombre(F, 2)} ${unite} inclinée de ${nombre(theta, 2)}° : composantes Fx = ${nombre(c.Fx, 2)} ${unite} et Fy = ${nombre(c.Fy, 2)} ${unite}`} largeur={620} hauteur={290}>
      <circle cx={cx} cy={cy} r={R} fill="none" className="t-fin" strokeDasharray="4 3" />
      <line x1={cx - R - 25} y1={cy} x2={cx + R + 25} y2={cy} className="t-moyen" />
      <line x1={cx} y1={cy + R + 25} x2={cx} y2={cy - R - 25} className="t-moyen" />
      <Etiquette x={cx + R + 28} y={cy + 4} taille={12}>
        x
      </Etiquette>
      <Etiquette x={cx + 6} y={cy - R - 22} taille={12}>
        y
      </Etiquette>
      {['I', 'II', 'III', 'IV'].map((q, i) => (
        <Etiquette key={q} x={cx + (i === 0 || i === 3 ? 1 : -1) * 70} y={cy + (i < 2 ? -1 : 1) * 70 + 4} ancre="middle" taille={12} classe="etiquette">
          {q}
        </Etiquette>
      ))}
      <line x1={px} y1={py} x2={px} y2={cy} className="t-fin" strokeDasharray="4 3" />
      <line x1={px} y1={py} x2={cx} y2={py} className="t-fin" strokeDasharray="4 3" />
      <line x1={cx} y1={cy} x2={px} y2={cy} stroke="var(--color-encre)" strokeWidth={3.2} />
      <line x1={cx} y1={cy} x2={cx} y2={py} stroke="var(--color-validation)" strokeWidth={3.2} />
      <line x1={cx} y1={cy} x2={px} y2={py} stroke="var(--color-correction)" strokeWidth={2.4} />
      <polygon points={pointe(px, py, t)} fill="var(--color-correction)" />
      {t > 0 ? <path d={arc(cx, cy, 30, 0, t)} className="t-moyen" fill="none" /> : null}
      <Etiquette x={milieuArc(cx, cy, 44, 0, t)[0]} y={milieuArc(cx, cy, 44, 0, t)[1] + 4} ancre="middle" taille={12} gras>
        θ
      </Etiquette>
      <Etiquette x={(cx + px) / 2} y={cy + (py > cy ? -8 : 18)} ancre="middle" taille={12.5} gras classe="encre">
        Fx = {nombre(c.Fx, 2)}
      </Etiquette>
      <Etiquette x={cx + (px >= cx ? -8 : 8)} y={(cy + py) / 2 + 4} ancre={px >= cx ? 'end' : 'start'} taille={12.5} gras couleur="var(--color-validation)">
        Fy = {nombre(c.Fy, 2)}
      </Etiquette>
      <Etiquette x={420} y={70} taille={13} gras couleur="var(--color-correction)">
        F = {nombre(F, 2)} {unite}, θ = {nombre(theta, 2)}°
      </Etiquette>
      <Etiquette x={420} y={94} taille={12}>
        Fx = F cos θ = {nombre(c.Fx, 2)} {unite}
      </Etiquette>
      <Etiquette x={420} y={114} taille={12}>
        Fy = F sin θ = {nombre(c.Fy, 2)} {unite}
      </Etiquette>
      <Etiquette x={420} y={140} taille={11.5} classe="etiquette">
        {c.quadrant ? `quadrant ${['I', 'II', 'III', 'IV'][c.quadrant - 1]}` : 'force portée par un axe'}
      </Etiquette>
    </Figure>
  );
}

/** Cercle trigonométrique de rayon 1, avec les signes de cos et sin dans chaque quadrant. */
export function CercleTrigo({ theta = 30 }: { theta?: number }) {
  const cx = 230;
  const cy = 140;
  const R = 110;
  const px = cx + R * cosD(theta);
  const py = cy - R * sinD(theta);
  const remarquables = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  return (
    <Figure alt={`Cercle trigonométrique : pour θ = ${theta}°, cos θ = ${nombre(cosD(theta), 3)} et sin θ = ${nombre(sinD(theta), 3)} ; signes de cos et sin dans les quatre quadrants`} largeur={620} hauteur={290}>
      <circle cx={cx} cy={cy} r={R} fill="var(--color-papier)" className="t-moyen" />
      <line x1={cx - R - 25} y1={cy} x2={cx + R + 25} y2={cy} className="t-moyen" />
      <line x1={cx} y1={cy + R + 25} x2={cx} y2={cy - R - 25} className="t-moyen" />
      {remarquables.map((a) => (
        <circle key={a} cx={cx + R * cosD(a)} cy={cy - R * sinD(a)} r={2.6} fill="var(--trait)" />
      ))}
      {[30, 45, 60].map((a, i) => (
        <Etiquette key={a} x={cx + (R + 10) * cosD(a) + 2} y={cy - (R + 10) * sinD(a) + (i === 2 ? -2 : 4)} taille={10.5}>
          {a}°
        </Etiquette>
      ))}
      <Etiquette x={cx + R + 4} y={cy + 16} taille={10.5}>
        1
      </Etiquette>
      <Etiquette x={cx + 6} y={cy - R - 4} taille={10.5}>
        1
      </Etiquette>
      <line x1={cx} y1={cy} x2={px} y2={py} className="t-fort" stroke="var(--color-correction)" />
      <line x1={px} y1={py} x2={px} y2={cy} stroke="var(--color-validation)" strokeWidth={2.4} />
      <line x1={cx} y1={cy} x2={px} y2={cy} stroke="var(--color-encre)" strokeWidth={2.4} />
      <path d={arc(cx, cy, 26, 0, theta)} className="t-moyen" fill="none" />
      <Etiquette x={(cx + px) / 2} y={cy + 16} ancre="middle" taille={12} gras classe="encre">
        cos θ
      </Etiquette>
      <Etiquette x={px + 6} y={(cy + py) / 2 + 4} taille={12} gras couleur="var(--color-validation)">
        sin θ
      </Etiquette>
      {[
        ['cos + · sin +', 1, -1],
        ['cos − · sin +', -1, -1],
        ['cos − · sin −', -1, 1],
        ['cos + · sin −', 1, 1],
      ].map(([t, sx, sy], i) => (
        <Etiquette key={i} x={cx + (sx as number) * 64} y={cy + (sy as number) * 64 + 4} ancre="middle" taille={10.5} classe="etiquette">
          {t as string}
        </Etiquette>
      ))}
      <Etiquette x={420} y={80} taille={13} gras>
        θ = {theta}°
      </Etiquette>
      <Etiquette x={420} y={104} taille={12}>
        cos θ = {nombre(cosD(theta), 4)}
      </Etiquette>
      <Etiquette x={420} y={124} taille={12}>
        sin θ = {nombre(sinD(theta), 4)}
      </Etiquette>
      <Etiquette x={420} y={150} taille={11.5} classe="etiquette">
        cos² θ + sin² θ = {nombre(cosD(theta) ** 2 + sinD(theta) ** 2, 4)}
      </Etiquette>
    </Figure>
  );
}

// ---------- Triangle quelconque (N0.4.5) ----------

/** Station S, points A et B séparés par un obstacle : on mesure SA, SB et l'angle en S. */
export function TriangleStation({ SA, SB, angleS, t }: { SA: number; SB: number; angleS: number; t: Triangle }) {
  const A0: P2 = [SA * cosD(90 + angleS / 2), SA * sinD(90 + angleS / 2)];
  const B0: P2 = [SB * cosD(90 - angleS / 2), SB * sinD(90 - angleS / 2)];
  const xs = [0, A0[0], B0[0]];
  const ys = [0, A0[1], B0[1]];
  const k = Math.min(440 / (Math.max(...xs) - Math.min(...xs)), 200 / (Math.max(...ys) - Math.min(...ys)));
  const X = (x: number) => 310 + (x - (Math.max(...xs) + Math.min(...xs)) / 2) * k;
  const Y = (y: number) => 240 - (y - Math.min(...ys)) * k;
  const S: P2 = [X(0), Y(0)];
  const A: P2 = [X(A0[0]), Y(A0[1])];
  const B: P2 = [X(B0[0]), Y(B0[1])];
  const mid: P2 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  return (
    <Figure alt={`Station S : SA = ${n2(SA)} m, SB = ${n2(SB)} m, angle en S ${nombre(angleS, 3)}° ; distance AB calculée ${n2(t.a)} m malgré l'obstacle`} largeur={620} hauteur={270}>
      <rect x={mid[0] - 34} y={mid[1] - 22} width={68} height={44} fill="var(--fond-macon)" className="t-moyen" />
      <path d={`M${mid[0] - 40} ${mid[1] - 22} L${mid[0]} ${mid[1] - 44} L${mid[0] + 40} ${mid[1] - 22}`} fill="none" className="t-moyen" />
      <Etiquette x={mid[0]} y={mid[1] + 4} ancre="middle" taille={10.5} classe="etiquette">
        obstacle
      </Etiquette>
      <line x1={S[0]} y1={S[1]} x2={A[0]} y2={A[1]} className="t-fort" stroke="var(--color-encre)" />
      <line x1={S[0]} y1={S[1]} x2={B[0]} y2={B[1]} className="t-fort" stroke="var(--color-encre)" />
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} className="t-moyen" strokeDasharray="7 4" stroke="var(--color-correction)" />
      <path d={arc(S[0], S[1], 36, 90 - angleS / 2, 90 + angleS / 2)} className="t-moyen" fill="none" />
      <Etiquette x={S[0]} y={S[1] - 44} ancre="middle" taille={12.5} gras classe="encre">
        {nombre(angleS, 3)}°
      </Etiquette>
      {[
        [S, 'S (station)', 0, 22],
        [A, 'A', -12, -8],
        [B, 'B', 12, -8],
      ].map(([p, nom, dx, dy]) => (
        <g key={nom as string}>
          <circle cx={(p as P2)[0]} cy={(p as P2)[1]} r={4} fill="var(--trait)" />
          <Etiquette x={(p as P2)[0] + (dx as number)} y={(p as P2)[1] + (dy as number)} ancre={(dx as number) < 0 ? 'end' : (dx as number) > 0 ? 'start' : 'middle'} taille={13} gras>
            {nom as string}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={(S[0] + A[0]) / 2 - 10} y={(S[1] + A[1]) / 2} ancre="end" taille={12}>
        SA = {n2(SA)} m
      </Etiquette>
      <Etiquette x={(S[0] + B[0]) / 2 + 10} y={(S[1] + B[1]) / 2} taille={12}>
        SB = {n2(SB)} m
      </Etiquette>
      <Etiquette x={mid[0]} y={mid[1] + 42} ancre="middle" taille={13} gras couleur="var(--color-correction)">
        AB = {n2(t.a)} m
      </Etiquette>
    </Figure>
  );
}

/** Mesure d'une largeur de rivière par triangulation : base AB sur une rive, point C sur l'autre. */
export function TriangulationRiviere({ base, angleA, angleB, t }: { base: number; angleA: number; angleB: number; t: Triangle }) {
  // repère : A en (0, 0), B en (base, 0), C au-dessus ; t vient de triangleACA(angleA, angleB, base)
  const Cx = t.b * cosD(angleA);
  const Cy = t.b * sinD(angleA);
  const k = Math.min(420 / Math.max(base, Cx + 1), 170 / Cy);
  const X = (x: number) => 120 + x * k;
  const Y = (y: number) => 230 - y * k;
  const largeur = Cy;
  return (
    <Figure alt={`Triangulation : base AB = ${n2(base)} m, angles ${nombre(angleA, 1)}° et ${nombre(angleB, 1)}° ; le point C de l'autre rive est à ${n2(t.b)} m de A ; largeur de la rivière ${n2(largeur)} m`} largeur={620} hauteur={270}>
      <rect x={40} y={Y(Cy) + 14} width={540} height={(Cy * k) - 36} fill="var(--fond-eau)" />
      <Etiquette x={560} y={(Y(Cy) + Y(0)) / 2 + 4} ancre="end" taille={11} classe="etiquette">
        rivière
      </Etiquette>
      <polygon points={points([[X(0), Y(0)], [X(base), Y(0)], [X(Cx), Y(Cy)]])} fill="none" className="t-fort" stroke="var(--color-encre)" />
      <line x1={X(Cx)} y1={Y(Cy)} x2={X(Cx)} y2={Y(0)} className="t-fin" strokeDasharray="5 3" />
      <path d={arc(X(0), Y(0), 30, 0, angleA)} className="t-moyen" fill="none" />
      <path d={arc(X(base), Y(0), 30, 180 - angleB, 180)} className="t-moyen" fill="none" />
      <Etiquette x={X(0) + 34} y={Y(0) - 8} taille={12} gras classe="encre">
        {nombre(angleA, 1)}°
      </Etiquette>
      <Etiquette x={X(base) - 34} y={Y(0) - 8} ancre="end" taille={12} gras classe="encre">
        {nombre(angleB, 1)}°
      </Etiquette>
      {[
        [X(0), Y(0), 'A', -10, 16],
        [X(base), Y(0), 'B', 10, 16],
        [X(Cx), Y(Cy), 'C', 0, -10],
      ].map(([x, y, nom, dx, dy]) => (
        <g key={nom as string}>
          <circle cx={x as number} cy={y as number} r={4} fill="var(--trait)" />
          <Etiquette x={(x as number) + (dx as number)} y={(y as number) + (dy as number)} ancre="middle" taille={13} gras>
            {nom as string}
          </Etiquette>
        </g>
      ))}
      <Cote x1={X(0)} y1={Y(0)} x2={X(base)} y2={Y(0)} decalage={-26} texte={`base AB = ${n2(base)} m`} />
      <Etiquette x={X(Cx) + 8} y={(Y(Cy) + Y(0)) / 2 + 20} taille={12} gras couleur="var(--color-correction)">
        largeur ≈ {n2(largeur)} m
      </Etiquette>
    </Figure>
  );
}

// ---------- Toiture (N0.4.6) ----------

export function ToitureElevation({ d, r }: { d: DonneesToiture; r: ResultatToiture }) {
  const hm = 2.8; // hauteur de mur dessinée (illustration)
  const xmin = -d.debord - 0.8;
  const xmax = d.L + d.debord + 0.8;
  const zmax = hm + r.h + 0.6;
  const k = Math.min(560 / (xmax - xmin), 230 / zmax);
  const X = (x: number) => 30 + (x - xmin) * k;
  const Z = (z: number) => 250 - z * k;
  const zx = (x: number) => hm + r.p * (x <= d.L / 2 ? x : d.L - x);
  const ep = 0.2;
  return (
    <Figure alt={`Pignon d'une toiture à deux versants : portée ${n2(d.L)} m, pente ${nombre(d.pente, 0)} % (${nombre(r.alpha, 2)}°), faîtage à ${n2(r.h)} m au-dessus des murs, rampant ${n2(r.rampant)} m`} largeur={620} hauteur={290}>
      <Hachures prefixe="toi" types={['maconnerie']} />
      <line x1={X(xmin)} y1={Z(0)} x2={X(xmax)} y2={Z(0)} className="t-moyen" />
      <rect x={X(-ep / 2)} y={Z(hm)} width={ep * k} height={hm * k} fill={hachure('toi', 'maconnerie')} className="t-fort" />
      <rect x={X(d.L - ep / 2)} y={Z(hm)} width={ep * k} height={hm * k} fill={hachure('toi', 'maconnerie')} className="t-fort" />
      <line x1={X(0)} y1={Z(hm)} x2={X(d.L)} y2={Z(hm)} className="t-cache" />
      <polyline points={points([[X(-d.debord), Z(zx(-d.debord))], [X(d.L / 2), Z(hm + r.h)], [X(d.L + d.debord), Z(zx(d.L + d.debord))]])} fill="none" className="t-fort" strokeWidth={3} />
      <line x1={X(d.L / 2)} y1={Z(hm)} x2={X(d.L / 2)} y2={Z(hm + r.h)} className="t-axe" />
      <path d={arc(X(0), Z(hm), 46, 0, r.alpha)} className="t-moyen" fill="none" />
      <Etiquette x={X(0) + 52} y={Z(hm) - 4} taille={12.5} gras classe="encre">
        α = {nombre(r.alpha, 2)}°
      </Etiquette>
      <Cote x1={X(0)} y1={Z(0)} x2={X(d.L)} y2={Z(0)} decalage={-22} texte={`portée L = ${n2(d.L)} m`} />
      <Cote x1={X(d.L / 2)} y1={Z(hm)} x2={X(d.L / 2)} y2={Z(hm + r.h)} decalage={-30} texte={`h = ${n2(r.h)} m`} />
      <Cote x1={X(0)} y1={Z(hm)} x2={X(d.L / 2)} y2={Z(hm + r.h)} decalage={26} texte={`rampant ${n2(r.rampant)} m`} />
      <Cote x1={X(-d.debord)} y1={Z(hm) + 14} x2={X(0)} y2={Z(hm) + 14} decalage={0} texte={`${n2(d.debord)}`} taille={10.5} />
      <Etiquette x={X(d.L / 2)} y={Z(hm + r.h) - 10} ancre="middle" taille={11}>
        faîtage
      </Etiquette>
    </Figure>
  );
}

/** Toiture à deux versants en perspective, avec fermes en W, pannes et couverture (vue 3D). */
export function ToitureIso({ d, f }: { d: DonneesToiture; f?: ResultatFerme }) {
  const hm = 2.8;
  const p = d.pente / 100;
  const h = (d.L / 2) * p;
  const Lb = d.longueur;
  const zDebord = hm - d.debord * p;
  const coins: Point3[] = [
    [-d.debord, -0.3, zDebord], [d.L + d.debord, Lb + 0.3, zDebord], [d.L / 2, Lb + 0.3, hm + h], [0, 0, 0], [d.L, Lb, 0], [d.L, 0, 0],
  ];
  const proj = coins.map(projeterIso);
  const xs = proj.map((q) => q[0]);
  const ys = proj.map((q) => q[1]);
  const marge = 30;
  const k = Math.min((620 - 2 * marge) / (Math.max(...xs) - Math.min(...xs)), 330 / (Math.max(...ys) - Math.min(...ys)));
  const x0 = (620 - (Math.max(...xs) - Math.min(...xs)) * k) / 2 - Math.min(...xs) * k;
  const y0 = 24 - Math.min(...ys) * k;
  const P = (q: Point3): P2 => {
    const [u, v] = projeterIso(q);
    return [x0 + u * k, y0 + v * k];
  };
  const poly = (pts: Point3[]) => points(pts.map(P));
  const hauteur = (Math.max(...ys) - Math.min(...ys)) * k + 60;
  const nbFermes = f?.nbFermes ?? Math.floor(Lb / 3) + 1;
  const ys3 = Array.from({ length: nbFermes }, (_, i) => (nbFermes > 1 ? (i * Lb) / (nbFermes - 1) : 0));
  const noeuds = f?.noeuds;
  const barres: Array<[keyof NonNullable<typeof noeuds>, keyof NonNullable<typeof noeuds>]> = [
    ['A', 'S'], ['S', 'B'], ['A', 'B'], ['D1', 'M1'], ['D1', 'S'], ['D2', 'S'], ['D2', 'M2'],
  ];
  const ligne = (a: Point3, b: Point3, props: React.SVGProps<SVGLineElement>, key: string) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} {...props} />;
  };
  return (
    <Figure alt={`Toiture à deux versants de ${n2(d.L)} m × ${n2(Lb)} m, pente ${nombre(d.pente, 0)} %, avec ${nbFermes} fermes, pannes et couverture`} largeur={620} hauteur={hauteur}>
      <Hachures prefixe="tiso" types={['maconnerie']} />
      <Calque id="murs">
        <polygon points={poly([[d.L, 0, 0], [d.L, Lb, 0], [d.L, Lb, hm], [d.L, 0, hm]])} fill="var(--fond-macon)" className="t-moyen" />
        <polygon points={poly([[0, Lb, 0], [d.L, Lb, 0], [d.L, Lb, hm], [d.L / 2, Lb, hm + h], [0, Lb, hm]])} fill={hachure('tiso', 'maconnerie')} className="t-moyen" />
      </Calque>
      <Calque id="charpente">
        {ys3.map((y, i) => (
          <g key={`f${i}`}>
            {noeuds
              ? barres.map(([a, b]) => ligne([noeuds[a].x, y, hm + noeuds[a].y], [noeuds[b].x, y, hm + noeuds[b].y], { stroke: 'var(--color-terre)', strokeWidth: 2 }, `${a}${b}`))
              : [
                  ligne([0, y, hm], [d.L / 2, y, hm + h], { stroke: 'var(--color-terre)', strokeWidth: 2 }, 'g'),
                  ligne([d.L / 2, y, hm + h], [d.L, y, hm], { stroke: 'var(--color-terre)', strokeWidth: 2 }, 'd'),
                  ligne([0, y, hm], [d.L, y, hm], { stroke: 'var(--color-terre)', strokeWidth: 2 }, 'e'),
                ]}
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const x = t * d.L;
          const z = hm + p * (x <= d.L / 2 ? x : d.L - x);
          return ligne([x, -0.3, z], [x, Lb + 0.3, z], { stroke: 'var(--color-brique)', strokeWidth: 1.6 }, `panne${i}`);
        })}
      </Calque>
      <Calque id="couverture">
        <polygon points={poly([[-d.debord, -0.3, zDebord], [d.L / 2, -0.3, hm + h], [d.L / 2, Lb + 0.3, hm + h], [-d.debord, Lb + 0.3, zDebord]])} fill="var(--color-acier-clair)" opacity={0.85} className="t-moyen" />
        <polygon points={poly([[d.L / 2, -0.3, hm + h], [d.L + d.debord, -0.3, zDebord], [d.L + d.debord, Lb + 0.3, zDebord], [d.L / 2, Lb + 0.3, hm + h]])} fill="var(--color-acier-clair)" opacity={0.85} className="t-moyen" />
      </Calque>
      <Calque id="cotes">
        <Etiquette x={(P([0, Lb, 0])[0] + P([d.L, Lb, 0])[0]) / 2} y={(P([0, Lb, 0])[1] + P([d.L, Lb, 0])[1]) / 2 + 22} ancre="middle" taille={12} gras>
          L = {n2(d.L)} m
        </Etiquette>
        <Etiquette x={(P([d.L, 0, 0])[0] + P([d.L, Lb, 0])[0]) / 2 + 14} y={(P([d.L, 0, 0])[1] + P([d.L, Lb, 0])[1]) / 2 + 20} taille={12} gras>
          {n2(Lb)} m
        </Etiquette>
        <Etiquette x={P([d.L / 2, Lb + 0.3, hm + h])[0] + 10} y={P([d.L / 2, Lb + 0.3, hm + h])[1] - 6} taille={12} gras classe="encre">
          faîtage, pente {nombre(d.pente, 0)} %
        </Etiquette>
      </Calque>
    </Figure>
  );
}

// ---------- Ferme en W (mini-projet N0.4.P) ----------

export function FermeW({ r, debord }: { r: ResultatFerme; debord: number }) {
  const n = r.noeuds;
  const L = r.entrait;
  const xmin = -debord - 0.4;
  const xmax = L + debord + 0.4;
  const k = Math.min(560 / (xmax - xmin), 200 / (r.h + 0.6));
  const X = (x: number) => 30 + (x - xmin) * k;
  const Y = (y: number) => 40 + (r.h + 0.2 - y) * k;
  const Pt = (id: keyof typeof n): P2 => [X(n[id].x), Y(n[id].y)];
  const zDeb = -debord * Math.tan(enRad(r.angles[0]!.valeur));
  const barres: Array<[keyof typeof n, keyof typeof n, number, string]> = [
    ['A', 'S', 3.2, 'var(--trait)'],
    ['S', 'B', 3.2, 'var(--trait)'],
    ['A', 'B', 3.2, 'var(--trait)'],
    ['D1', 'M1', 2, 'var(--color-encre)'],
    ['D1', 'S', 2, 'var(--color-encre)'],
    ['D2', 'S', 2, 'var(--color-encre)'],
    ['D2', 'M2', 2, 'var(--color-encre)'],
  ];
  const lab = (a: keyof typeof n, b: keyof typeof n, texte: string, dx: number, dy: number) => (
    <Etiquette x={(X(n[a].x) + X(n[b].x)) / 2 + dx} y={(Y(n[a].y) + Y(n[b].y)) / 2 + dy} ancre="middle" taille={11.5} gras classe="encre">
      {texte}
    </Etiquette>
  );
  return (
    <Figure alt={`Ferme en W de ${n2(L)} m de portée et ${n2(r.h)} m de haut : arbalétriers ${n2(r.arbaletrier)} m, diagonales ${n2(r.diagCourte)} m et ${n2(r.diagLongue)} m`} largeur={620} hauteur={(r.h + 0.6) * k + 90}>
      <line x1={X(-debord)} y1={Y(zDeb)} x2={X(0)} y2={Y(0)} className="t-cache" />
      <line x1={X(L)} y1={Y(0)} x2={X(L + debord)} y2={Y(zDeb)} className="t-cache" />
      {barres.map(([a, b, w, c]) => (
        <line key={`${a}${b}`} x1={X(n[a].x)} y1={Y(n[a].y)} x2={X(n[b].x)} y2={Y(n[b].y)} stroke={c} strokeWidth={w} />
      ))}
      {(Object.keys(n) as Array<keyof typeof n>).map((id) => (
        <g key={id}>
          <circle cx={Pt(id)[0]} cy={Pt(id)[1]} r={4} fill="var(--color-papier)" stroke="var(--trait)" strokeWidth={1.4} />
          <Etiquette x={Pt(id)[0] + (id === 'S' ? 0 : id === 'M1' ? -10 : id === 'M2' ? 10 : 0)} y={Pt(id)[1] + (id === 'S' ? -10 : n[id].y === 0 ? 20 : -8)} ancre={id === 'M1' ? 'end' : id === 'M2' ? 'start' : 'middle'} taille={12} gras>
            {id}
          </Etiquette>
        </g>
      ))}
      {lab('A', 'M1', `${n2(r.arbaletrier)} m`, -24, -6)}
      {lab('D1', 'M1', `${n2(r.diagCourte)}`, 18, 6)}
      {lab('D1', 'S', `${n2(r.diagLongue)}`, 18, 10)}
      <path d={arc(X(0), Y(0), 34, 0, r.angles[0]!.valeur)} className="t-moyen" fill="none" />
      <Etiquette x={X(0) + 40} y={Y(0) - 6} taille={11.5}>
        α = {nombre(r.angles[0]!.valeur, 1)}°
      </Etiquette>
      <path d={arc(X(n.D1.x), Y(0), 22, 0, r.gamma)} className="t-moyen" fill="none" />
      <Etiquette x={X(n.D1.x) + 26} y={Y(0) - 22} taille={11}>
        γ = {nombre(r.gamma, 1)}°
      </Etiquette>
      <Cote x1={X(0)} y1={Y(0)} x2={X(L)} y2={Y(0)} decalage={-40} texte={`portée ${n2(L)} m (entrait)`} />
      <Cote x1={X(n.S.x)} y1={Y(0)} x2={X(n.S.x)} y2={Y(r.h)} decalage={0} texte={`h = ${n2(r.h)} m`} />
    </Figure>
  );
}

/** Ordres de grandeur des angles de pente, du caniveau au mur (N0.4.3). */
export function EchellePentes({ reperes }: { reperes: Array<{ nom: string; pourcent: number }> }) {
  const cx = 70;
  const cy = 210;
  const R = 190;
  return (
    <Figure alt={`Pentes courantes dessinées à leur vrai angle : ${reperes.map((r) => `${r.nom} ${nombre(r.pourcent, 1)} %`).join(', ')}`} largeur={620} hauteur={240}>
      <line x1={cx} y1={cy} x2={cx + R + 20} y2={cy} className="t-moyen" />
      {[...reperes]
        .map((rp) => ({ ...rp, a: ecrituresPente(rp.pourcent / 100).deg }))
        .sort((u, v) => u.a - v.a)
        .reduce<Array<{ nom: string; pourcent: number; a: number; yl: number }>>((acc, rp) => {
          const yNat = cy - R * sinD(rp.a) + 4;
          const prec = acc[acc.length - 1];
          return [...acc, { ...rp, yl: prec ? Math.min(yNat, prec.yl - 15) : Math.min(yNat, cy - 12) }];
        }, [])
        .map((rp, i) => {
          const [x, y] = [cx + R * cosD(rp.a), cy - R * sinD(rp.a)];
          return (
            <g key={rp.nom}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={i % 2 ? 'var(--color-encre)' : 'var(--color-brique)'} strokeWidth={2} />
              {Math.abs(rp.yl - (y + 4)) > 2 ? <line x1={x + 2} y1={y} x2={x + 10} y2={rp.yl - 4} className="t-fin" /> : null}
              <Etiquette x={x + 12} y={rp.yl} taille={11.5}>
                {rp.nom} : {nombre(rp.pourcent, rp.pourcent < 10 ? 1 : 0)} % ({nombre(rp.a, 1)}°)
              </Etiquette>
            </g>
          );
        })}
      <Etiquette x={cx + R + 24} y={cy + 16} taille={11} classe="etiquette">
        horizontale
      </Etiquette>
    </Figure>
  );
}
