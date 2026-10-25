// Schémas du module N0.7 (physique de base). Les valeurs viennent de lib/calc/physique.ts.
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { cadreIsoDirect, Fleche3, type P2 } from '@/components/drawing/Iso3D';
import { Calque } from '@/components/gabarits/Vue3D';
import {
  MATERIAUX_THERMIQUES,
  mrua,
  pressionEau,
  type DonneesArret,
  type DonneesChateau,
  type DonneesCuve,
  type DonneesDilatation,
  type DonneesGroupe,
  type DonneesLevage,
  type DonneesPlan,
  type DonneesPompe,
  type ResultatArret,
  type ResultatChateau,
  type ResultatCuve,
  type ResultatDilatation,
  type ResultatGroupe,
  type ResultatLevage,
  type ResultatPlan,
  type ResultatPompe,
} from '@/lib/calc/physique';
import { cosD, sinD } from '@/lib/calc/trigo';
import type { Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';
const EAU = 'var(--fond-eau)';

/** Petit symbole de niveau d'eau (triangle pointe en bas) posé sur la ligne y. */
function Niveau({ x, y, texte }: { x: number; y: number; texte: string }) {
  return (
    <g>
      <polygon points={points([[x - 6, y - 9], [x + 6, y - 9], [x, y - 1]])} fill="none" stroke={BLEU} strokeWidth={1.2} />
      <Etiquette x={x + 10} y={y - 3} taille={11} couleur={BLEU}>
        {texte}
      </Etiquette>
    </g>
  );
}

// ---------- N0.7.1 : cinématique ----------

/** x(t), v(t) et a(t) d'un mouvement uniformément accéléré : la vitesse est la pente de x(t), l'accélération celle de v(t). */
export function TroisGraphes({ v0 = 2, a = 0.5, tmax = 10 }: { v0?: number; a?: number; tmax?: number }) {
  const W = 145;
  const H = 135;
  const yb = 185;
  const panneaux = [
    { titre: 'position x (m)', f: (t: number) => mrua(0, v0, a, t).x, couleur: BLEU, note: 'pente de x(t) = vitesse', aire: false },
    { titre: 'vitesse v (m/s)', f: (t: number) => mrua(0, v0, a, t).v, couleur: ROUGE, note: 'aire sous v(t) = distance', aire: true },
    { titre: 'accélération a (m/s²)', f: () => a, couleur: VERT, note: 'pente de v(t) = accélération', aire: false },
  ];
  return (
    <Figure
      alt={`Mouvement uniformément accéléré, v0 = ${n2(v0)} m/s, a = ${n2(a)} m/s² : après ${n2(tmax)} s, x = ${n2(mrua(0, v0, a, tmax).x)} m et v = ${n2(mrua(0, v0, a, tmax).v)} m/s ; la position est une parabole, la vitesse une droite, l'accélération une constante`}
      largeur={620}
      hauteur={240}
    >
      {panneaux.map((p, i) => {
        const x0 = 34 + i * 195;
        const fmax = Math.max(p.f(tmax), p.f(0), 1e-9) * 1.18;
        const X = (t: number) => x0 + (t / tmax) * W;
        const Y = (v: number) => yb - (v / fmax) * H;
        const pts = Array.from({ length: 21 }, (_, k) => (k / 20) * tmax).map((t) => [X(t), Y(p.f(t))] as const);
        return (
          <g key={p.titre}>
            {p.aire ? <polygon points={points([[X(0), yb], ...pts, [X(tmax), yb]])} fill={p.couleur} opacity={0.12} /> : null}
            <Fleche x1={x0} y1={yb} x2={x0 + W + 14} y2={yb} couleur="var(--trait)" epaisseur={1.2} tete={7} />
            <Fleche x1={x0} y1={yb} x2={x0} y2={yb - H - 22} couleur="var(--trait)" epaisseur={1.2} tete={7} />
            <polyline points={points(pts)} fill="none" stroke={p.couleur} strokeWidth={2.4} />
            <Etiquette x={x0 + 4} y={yb - H - 26} taille={11.5} gras couleur={p.couleur}>
              {p.titre}
            </Etiquette>
            <Etiquette x={x0 + W + 18} y={yb - 6} taille={10.5}>
              t (s)
            </Etiquette>
            <Etiquette x={X(tmax) - 4} y={Y(p.f(tmax)) - 8} ancre="end" taille={11}>
              {n2(p.f(tmax))}
            </Etiquette>
            <line x1={X(tmax)} y1={yb} x2={X(tmax)} y2={yb + 4} className="t-fin" />
            <Etiquette x={X(tmax)} y={yb + 14} ancre="middle" taille={10.5}>
              {nombre(tmax, 0)}
            </Etiquette>
            <Etiquette x={x0 + W / 2} y={yb + 36} ancre="middle" taille={11} classe="etiquette">
              {p.note}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Diagramme v(t) d'un arrêt : réaction à vitesse constante, puis freinage ; les aires sont les distances. */
export function GrapheVitesse({ d, r }: { d: DonneesArret; r: ResultatArret }) {
  const O: P2 = [70, 180];
  const W = 470;
  const H = 130;
  const tMax = Math.max(r.tArret, 1e-9) * 1.08;
  const X = (t: number) => O[0] + (t / tMax) * W;
  const Y = (v: number) => O[1] - (v / (Math.max(r.v0, 1e-9) * 1.2)) * H;
  const yR = 236;
  const kd = W / Math.max(r.dArret, 1e-9);
  const xR = O[0] + r.dReaction * kd;
  return (
    <Figure
      alt={`Arrêt depuis ${n2(d.v)} km/h : ${n2(r.dReaction)} m parcourus pendant la réaction de ${n2(d.tr)} s, puis ${n2(r.dFreinage)} m de freinage ; arrêt en ${n2(r.dArret)} m et ${n2(r.tArret)} s`}
      largeur={620}
      hauteur={300}
    >
      <rect x={X(0)} y={Y(r.v0)} width={X(d.tr) - X(0)} height={O[1] - Y(r.v0)} fill={BLEU} opacity={0.14} />
      <polygon points={points([[X(d.tr), Y(r.v0)], [X(r.tArret), O[1]], [X(d.tr), O[1]]])} fill={ROUGE} opacity={0.14} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0] + W + 20} y2={O[1]} couleur="var(--trait)" epaisseur={1.2} tete={7} />
      <Fleche x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] - H - 26} couleur="var(--trait)" epaisseur={1.2} tete={7} />
      <polyline points={points([[X(0), Y(r.v0)], [X(d.tr), Y(r.v0)], [X(r.tArret), O[1]]])} fill="none" stroke={ROUGE} strokeWidth={2.6} />
      <Etiquette x={O[0] + 6} y={O[1] - H - 22} taille={11.5} gras>
        v (m/s)
      </Etiquette>
      <Etiquette x={O[0] + W + 18} y={O[1] + 16} ancre="middle" taille={11}>
        t (s)
      </Etiquette>
      <Etiquette x={O[0] - 6} y={Y(r.v0) + 4} ancre="end" taille={11}>
        {n2(r.v0)}
      </Etiquette>
      {[
        [d.tr, n2(d.tr)],
        [r.tArret, n2(r.tArret)],
      ].map(([t, txt]) => (
        <g key={txt as string}>
          <line x1={X(t as number)} y1={O[1]} x2={X(t as number)} y2={O[1] + 5} className="t-fin" />
          <Etiquette x={X(t as number)} y={O[1] + 16} ancre="middle" taille={10.5}>
            {txt as string}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={(X(0) + X(d.tr)) / 2} y={Y(r.v0) + 28} ancre="middle" taille={11.5} gras couleur={BLEU}>
        réaction
      </Etiquette>
      <Etiquette x={(X(0) + X(d.tr)) / 2} y={Y(r.v0) + 44} ancre="middle" taille={11.5} couleur={BLEU}>
        {n2(r.dReaction)} m
      </Etiquette>
      <Etiquette x={X(d.tr) + (X(r.tArret) - X(d.tr)) / 3} y={O[1] - (O[1] - Y(r.v0)) / 3 + 4} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        freinage {n2(r.dFreinage)} m
      </Etiquette>
      <rect x={O[0]} y={yR} width={xR - O[0]} height={12} fill={BLEU} opacity={0.35} />
      <rect x={xR} y={yR} width={O[0] + W - xR} height={12} fill={ROUGE} opacity={0.35} />
      <rect x={O[0]} y={yR} width={W} height={12} fill="none" className="t-moyen" />
      <Cote x1={O[0]} y1={yR} x2={xR} y2={yR} decalage={8} texte={`${n2(r.dReaction)} m`} />
      <Cote x1={xR} y1={yR} x2={O[0] + W} y2={yR} decalage={8} texte={`${n2(r.dFreinage)} m`} />
      <Cote x1={O[0]} y1={yR + 12} x2={O[0] + W} y2={yR + 12} decalage={-14} texte={`distance d'arrêt : ${n2(r.dArret)} m`} />
    </Figure>
  );
}

// ---------- N0.7.2 : lois de Newton ----------

/** Les trois lois de Newton sur des cas de chantier : inertie, F = m a, actions réciproques. */
export function LoisNewton({ prefixe = 'ln' }: { prefixe?: string }) {
  return (
    <Figure
      alt="Trois panneaux : un camion freine et sa charge non arrimée continue vers l'avant (inertie) ; une force F donne à une masse m une accélération a = F / m dans son sens ; un poteau appuie sur sa semelle et la semelle repousse le poteau avec une force égale et opposée"
      largeur={620}
      hauteur={230}
    >
      <Hachures prefixe={prefixe} types={['ba']} />
      {['1 · inertie', '2 · ΣF = m a', '3 · actions réciproques'].map((t, i) => (
        <Etiquette key={t} x={105 + i * 205} y={20} ancre="middle" taille={12.5} gras>
          {t}
        </Etiquette>
      ))}
      <line x1={207} y1={12} x2={207} y2={218} className="t-fin" strokeDasharray="3 4" />
      <line x1={412} y1={12} x2={412} y2={218} className="t-fin" strokeDasharray="3 4" />

      <rect x={22} y={140} width={150} height={12} className="t-fort" fill="var(--fond-beton)" />
      <circle cx={48} cy={160} r={9} className="t-moyen" fill="none" />
      <circle cx={148} cy={160} r={9} className="t-moyen" fill="none" />
      <rect x={70} y={108} width={42} height={32} className="t-moyen" fill="var(--color-beton-clair)" />
      <Fleche x1={92} y1={96} x2={160} y2={96} couleur={ROUGE} pointilles texte="la charge continue" tx={84} ty={84} ancre="start" taille={11} />
      <Fleche x1={150} y1={190} x2={60} y2={190} couleur={VERT} texte="le camion freine" tx={105} ty={208} ancre="middle" taille={11} />

      <rect x={262} y={105} width={56} height={44} className="t-fort" fill="var(--color-beton-clair)" />
      <Etiquette x={290} y={132} ancre="middle" taille={13} gras>
        m
      </Etiquette>
      <Fleche x1={318} y1={127} x2={388} y2={127} couleur={ROUGE} epaisseur={3} texte="F" tx={362} ty={118} ancre="middle" />
      <Fleche x1={270} y1={84} x2={330} y2={84} couleur={VERT} texte="a" tx={300} ty={74} ancre="middle" />
      <Etiquette x={310} y={180} ancre="middle" taille={12}>
        a = F / m, dans le sens de F
      </Etiquette>

      <rect x={502} y={42} width={26} height={70} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect x={462} y={150} width={106} height={30} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <Fleche x1={515} y1={118} x2={515} y2={148} couleur={ROUGE} epaisseur={2.6} texte="N" tx={524} ty={140} />
      <Fleche x1={490} y1={142} x2={490} y2={114} couleur={VERT} epaisseur={2.6} texte="−N" tx={482} ty={124} ancre="end" />
      <Etiquette x={515} y={200} ancre="middle" taille={11}>
        le poteau pousse la semelle (N),
      </Etiquette>
      <Etiquette x={515} y={214} ancre="middle" taille={11}>
        la semelle repousse le poteau (−N)
      </Etiquette>
    </Figure>
  );
}

/** Charge suspendue au câble : tension T vers le haut, poids P vers le bas, accélération a ; trois cas comparés. */
export function LevageSchema({ d, r }: { d: DonneesLevage; r: ResultatLevage }) {
  const kf = 95 / Math.max(r.T, r.P, 1e-9);
  const C: P2 = [170, 160];
  const haut = C[1] - 30;
  const cas = d.a > 1e-9 ? 0 : d.a < -1e-9 ? 2 : 1;
  const lignes = [
    { a: 'a > 0', t: 'T > P', aide: 'démarrage vers le haut, freinage en descente' },
    { a: 'a = 0', t: 'T = P', aide: 'arrêt ou vitesse constante' },
    { a: 'a < 0', t: 'T < P', aide: 'freinage en montée, départ en descente' },
  ];
  return (
    <Figure
      alt={`Charge de ${nombre(d.m, 0)} kg au câble, accélération ${n2(d.a)} m/s² vers le haut : poids ${n2(r.P)} kN, tension ${n2(r.T)} kN`}
      largeur={620}
      hauteur={290}
    >
      <line x1={C[0]} y1={8} x2={C[0]} y2={haut - 18} className="t-fort" />
      <circle cx={C[0]} cy={haut - 12} r={6} fill="none" className="t-fort" />
      <line x1={C[0]} y1={haut - 6} x2={C[0] - 40} y2={haut} className="t-moyen" />
      <line x1={C[0]} y1={haut - 6} x2={C[0] + 40} y2={haut} className="t-moyen" />
      <rect x={C[0] - 55} y={haut} width={110} height={60} className="t-fort" fill="var(--color-beton-clair)" />
      <Etiquette x={C[0] - 28} y={C[1] + 6} ancre="middle" taille={12} gras>
        {nombre(d.m, 0)} kg
      </Etiquette>
      {r.T > 1e-9 ? <Fleche x1={C[0] + 24} y1={haut} x2={C[0] + 24} y2={haut - r.T * kf} couleur={BLEU} epaisseur={3} texte={`T = ${n2(r.T)} kN`} tx={C[0] + 32} ty={haut - r.T * kf + 12} /> : null}
      <Fleche x1={C[0]} y1={C[1]} x2={C[0]} y2={C[1] + r.P * kf} couleur={ROUGE} epaisseur={3} texte={`P = ${n2(r.P)} kN`} tx={C[0] + 10} ty={C[1] + r.P * kf - 4} />
      {Math.abs(d.a) > 1e-9 ? (
        <Fleche x1={C[0] - 90} y1={C[1] + (d.a > 0 ? 25 : -25)} x2={C[0] - 90} y2={C[1] + (d.a > 0 ? -25 : 25)} couleur={VERT} texte={`a = ${n2(d.a)} m/s²`} tx={C[0] - 98} ty={C[1] + 4} ancre="end" />
      ) : (
        <Etiquette x={C[0] - 70} y={C[1] + 4} ancre="end" taille={12} couleur={VERT}>
          a = 0
        </Etiquette>
      )}
      <line x1={330} y1={14} x2={330} y2={276} className="t-fin" strokeDasharray="3 4" />
      <Etiquette x={470} y={40} ancre="middle" taille={12.5} gras>
        T − P = m a
      </Etiquette>
      {lignes.map((l, i) => (
        <g key={l.a}>
          <rect x={350} y={66 + i * 66} width={250} height={54} rx={4} fill={i === cas ? 'var(--color-validation-clair)' : 'none'} stroke={i === cas ? VERT : 'var(--trait-doux)'} strokeWidth={i === cas ? 1.6 : 1} />
          <Etiquette x={362} y={88 + i * 66} taille={12.5} gras>
            {l.a} : {l.t}
          </Etiquette>
          <Etiquette x={362} y={106 + i * 66} taille={11}>
            {l.aide}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

// ---------- N0.7.3 : frottement et plan incliné ----------

/** Charge sur un plan incliné : poids, réaction normale, frottement mobilisé, et la comparaison qui décide du glissement. */
export function PlanInclineSchema({ d, r, prefixe = 'pi' }: { d: DonneesPlan; r: ResultatPlan; prefixe?: string }) {
  const ca = cosD(d.alpha);
  const sa = sinD(d.alpha);
  const pied: P2 = [30, 262];
  const long = Math.min(340, 225 / Math.max(sa, 1e-9));
  const haut: P2 = [pied[0] + long * ca, pied[1] - long * sa];
  const B: P2 = [pied[0] + 0.55 * long * ca, pied[1] - 0.55 * long * sa];
  const C: P2 = [B[0] - 22 * sa, B[1] - 22 * ca];
  const kf = 92 / Math.max(r.P, 1e-9);
  const F = r.glisse ? r.Fmax : r.Ppara; // frottement réellement mobilisé
  const fin = (vx: number, vy: number, l: number): P2 => [C[0] + vx * l, C[1] + vy * l];
  const Pt = fin(0, 1, r.P * kf);
  const Nt = fin(-sa, -ca, r.N * kf);
  const Ft = fin(ca, -sa, F * kf);
  const para = fin(-ca, sa, r.Ppara * kf);
  const perp = fin(sa, ca, r.N * kf);
  return (
    <Figure
      alt={`Charge de ${nombre(d.m, 0)} kg sur un plan à ${nombre(d.alpha, 1)}°, μ = ${n2(d.mu)} : P sin α = ${n2(r.Ppara)} kN, frottement maximal μ N = ${n2(r.Fmax)} kN ; ${r.glisse ? 'la charge glisse' : 'la charge reste en place'}`}
      largeur={620}
      hauteur={300}
    >
      <Hachures prefixe={prefixe} types={['beton']} />
      <polygon points={points([pied, haut, [haut[0], pied[1]]])} fill={hachure(prefixe, 'beton')} className="t-fort" />
      <path d={`M${pied[0] + 54} ${pied[1]} A54 54 0 0 0 ${pied[0] + 54 * ca} ${pied[1] - 54 * sa}`} fill="none" className="t-moyen" />
      <Etiquette x={pied[0] + 60} y={pied[1] - 8} taille={12} gras>
        α
      </Etiquette>
      <rect x={C[0] - 34} y={C[1] - 22} width={68} height={44} transform={`rotate(${-d.alpha} ${C[0]} ${C[1]})`} className="t-fort" fill="var(--color-beton-clair)" />
      <line x1={Pt[0]} y1={Pt[1]} x2={para[0]} y2={para[1]} className="t-fin" strokeDasharray="5 3" />
      <line x1={Pt[0]} y1={Pt[1]} x2={perp[0]} y2={perp[1]} className="t-fin" strokeDasharray="5 3" />
      <Fleche x1={C[0]} y1={C[1]} x2={para[0]} y2={para[1]} couleur={BRIQUE} epaisseur={2} pointilles />
      <Fleche x1={C[0]} y1={C[1]} x2={Pt[0]} y2={Pt[1]} couleur={ROUGE} epaisseur={3} texte={`P = ${n2(r.P)} kN`} tx={Pt[0] + 8} ty={Pt[1] + 4} />
      <Fleche x1={C[0]} y1={C[1]} x2={Nt[0]} y2={Nt[1]} couleur={VERT} epaisseur={3} texte={`N = ${n2(r.N)} kN`} tx={Nt[0] - 8} ty={Nt[1] - 4} ancre="end" />
      {F > 1e-9 ? <Fleche x1={C[0]} y1={C[1]} x2={Ft[0]} y2={Ft[1]} couleur={BLEU} epaisseur={3} texte={`F = ${n2(F)} kN`} tx={Ft[0] + 6} ty={Ft[1] - 6} /> : null}
      <Etiquette x={C[0] - 44} y={C[1] + 10} ancre="end" taille={11} couleur={BRIQUE}>
        P sin α
      </Etiquette>

      <line x1={410} y1={14} x2={410} y2={286} className="t-fin" strokeDasharray="3 4" />
      <Etiquette x={428} y={50} taille={12}>
        P sin α = {n2(r.Ppara)} kN
      </Etiquette>
      <Etiquette x={428} y={72} taille={12}>
        μ N = {n2(d.mu)} × {n2(r.N)} = {n2(r.Fmax)} kN
      </Etiquette>
      <Etiquette x={428} y={104} taille={12.5} gras couleur={r.glisse ? ROUGE : VERT}>
        {r.glisse ? `${n2(r.Ppara)} > ${n2(r.Fmax)} : elle glisse` : `${n2(r.Ppara)} ≤ ${n2(r.Fmax)} : elle tient`}
      </Etiquette>
      <Etiquette x={428} y={136} taille={11.5} classe="etiquette">
        pente limite : arctan μ = {n2(r.angleLimite)}°
      </Etiquette>
      <Etiquette x={428} y={156} taille={11.5} classe="etiquette">
        F : frottement mobilisé (≤ μ N)
      </Etiquette>
    </Figure>
  );
}

/** Rampe et caisse en perspective (trièdre direct) : forces, décomposition du poids, angle de la pente. */
export function PlanIncline3D({ d, r }: { d: DonneesPlan; r: ResultatPlan }) {
  const ca = cosD(d.alpha);
  const sa = sinD(d.alpha);
  const Lr = 4.2;
  const W = 2.2;
  const h = Lr * Math.tan((d.alpha * Math.PI) / 180);
  const u: Point3 = [-ca, 0, sa]; // vers le haut de la pente
  const n: Point3 = [sa, 0, ca]; // normale sortante
  const add = (p: Point3, v: Point3, k = 1): Point3 => [p[0] + v[0] * k, p[1] + v[1] * k, p[2] + v[2] * k];
  const s = 0.55 * (Lr / ca);
  const c0: Point3 = add([0, W / 2, 0], u, s);
  const [a2, b2, hc] = [0.5, 0.45, 0.75];
  const coin = (i: number, j: number, k: number): Point3 => add(add(add(c0, u, i * a2), [0, 1, 0], j * b2), n, k * hc);
  const G = add(c0, n, hc / 2);
  const lF = 1.6 / Math.max(r.P, 1e-9);
  const F = r.glisse ? r.Fmax : r.Ppara;
  const { P, poly, hauteur } = cadreIsoDirect(
    [[0.6, -0.4, 0], [0.6, W + 0.4, 0], [-Lr - 0.4, -0.4, 0], [-Lr - 0.4, W + 0.4, 0], [-Lr, 0, h], add(G, [0, 0, -1.7]), add(G, n, 1.9)],
    620,
    380,
  );
  const arc = Array.from({ length: 13 }, (_, k) => (k / 12) * d.alpha).map((t) => P([-0.8 * cosD(t), W, 0.8 * sinD(t)]));
  return (
    <Figure
      alt={`Caisse de ${nombre(d.m, 0)} kg sur une rampe à ${nombre(d.alpha, 1)}° en perspective : poids ${n2(r.P)} kN, réaction normale ${n2(r.N)} kN, frottement ${n2(F)} kN ; ${r.glisse ? 'elle glisse' : 'elle reste en place'}`}
      largeur={620}
      hauteur={hauteur}
    >
      <Calque id="rampe">
        <polygon points={poly([[0.6, -0.4, 0], [0.6, W + 0.4, 0], [-Lr - 0.4, W + 0.4, 0], [-Lr - 0.4, -0.4, 0]])} fill="var(--fond-terre)" className="t-fin" />
        <polygon points={poly([[0, 0, 0], [0, W, 0], [-Lr, W, h], [-Lr, 0, h]])} fill="var(--fond-beton)" className="t-moyen" />
        <polygon points={poly([[0, W, 0], [-Lr, W, 0], [-Lr, W, h]])} fill="var(--color-beton-clair)" className="t-moyen" />
      </Calque>
      <Calque id="charge">
        <polygon points={poly([coin(-1, -1, 0), coin(-1, 1, 0), coin(-1, 1, 1), coin(-1, -1, 1)])} fill="var(--color-brique-clair)" className="t-moyen" />
        <polygon points={poly([coin(-1, 1, 0), coin(1, 1, 0), coin(1, 1, 1), coin(-1, 1, 1)])} fill="var(--color-brique-clair)" className="t-moyen" />
        <polygon points={poly([coin(-1, -1, 1), coin(1, -1, 1), coin(1, 1, 1), coin(-1, 1, 1)])} fill="var(--color-brique-clair)" className="t-moyen" />
      </Calque>
      <Calque id="forces">
        <Fleche3 P={P} de={G} vers={add(G, [0, 0, -1], r.P * lF)} couleur={ROUGE} epaisseur={3} texte={`P = ${n2(r.P)} kN`} tx={P(add(G, [0, 0, -1], r.P * lF))[0] + 8} ty={P(add(G, [0, 0, -1], r.P * lF))[1] + 4} />
        <Fleche3 P={P} de={G} vers={add(G, n, r.N * lF)} couleur={VERT} epaisseur={3} texte={`N = ${n2(r.N)} kN`} tx={P(add(G, n, r.N * lF))[0] + 8} ty={P(add(G, n, r.N * lF))[1]} />
        {F > 1e-9 ? <Fleche3 P={P} de={G} vers={add(G, u, F * lF)} couleur={BLEU} epaisseur={3} texte={`F = ${n2(F)} kN`} tx={P(add(G, u, F * lF))[0] + 6} ty={P(add(G, u, F * lF))[1] - 8} /> : null}
      </Calque>
      <Calque id="decomposition">
        <Fleche3 P={P} de={G} vers={add(G, u, -r.Ppara * lF)} couleur={BRIQUE} epaisseur={2} pointilles texte="P sin α" tx={P(add(G, u, -r.Ppara * lF))[0] - 6} ty={P(add(G, u, -r.Ppara * lF))[1] + 16} ancre="end" />
        <Fleche3 P={P} de={G} vers={add(G, n, -r.N * lF)} couleur={BRIQUE} epaisseur={2} pointilles texte="P cos α" tx={P(add(G, n, -r.N * lF))[0] + 8} ty={P(add(G, n, -r.N * lF))[1] + 12} />
      </Calque>
      <Calque id="cotes">
        <polyline points={points(arc)} fill="none" className="t-moyen" />
        <Etiquette x={arc[6]![0] + 8} y={arc[6]![1] + 4} taille={12} gras>
          α = {nombre(d.alpha, 1)}°
        </Etiquette>
      </Calque>
    </Figure>
  );
}

// ---------- N0.7.4 : travail, énergie, puissance ----------

/** Chaîne d'énergie d'une motopompe : puissance absorbée, pertes, puissance transmise à l'eau. */
export function ChaineEnergie({ d, r }: { d: DonneesPompe; r: ResultatPompe }) {
  const ep = (p: number) => 4 + (14 * p) / Math.max(r.Pabs, 1e-9);
  const boite = (x: number, titre: string, valeur: string, couleur: string) => (
    <g>
      <rect x={x} y={52} width={150} height={62} rx={6} fill="none" stroke={couleur} strokeWidth={1.8} />
      <Etiquette x={x + 75} y={78} ancre="middle" taille={12} gras couleur={couleur}>
        {titre}
      </Etiquette>
      <Etiquette x={x + 75} y={98} ancre="middle" taille={12}>
        {valeur}
      </Etiquette>
    </g>
  );
  return (
    <Figure
      alt={`Chaîne d'énergie de la pompe : ${n1(r.Pabs)} W absorbés, ${n1(r.Ph)} W transmis à l'eau, ${n1(r.Pabs - r.Ph)} W perdus ; rendement ${n2(d.eta)}`}
      largeur={620}
      hauteur={210}
    >
      {boite(16, 'électricité', `Pabs = ${n1(r.Pabs)} W`, BLEU)}
      {boite(235, 'motopompe', `η = ${n2(d.eta)}`, 'var(--trait)')}
      {boite(454, 'eau élevée', `Ph = ${n1(r.Ph)} W`, VERT)}
      <Fleche x1={166} y1={83} x2={233} y2={83} couleur={BLEU} epaisseur={ep(r.Pabs)} tete={ep(r.Pabs) + 10} />
      <Fleche x1={385} y1={83} x2={452} y2={83} couleur={VERT} epaisseur={ep(r.Ph)} tete={ep(r.Ph) + 10} />
      <Fleche x1={310} y1={114} x2={310} y2={170} couleur={ROUGE} epaisseur={ep(r.Pabs - r.Ph)} tete={ep(r.Pabs - r.Ph) + 10} />
      <Etiquette x={322} y={160} taille={12} couleur={ROUGE}>
        pertes : {n1(r.Pabs - r.Ph)} W (chaleur, frottements)
      </Etiquette>
      <Etiquette x={310} y={200} ancre="middle" taille={11.5} classe="etiquette">
        épaisseur des flèches proportionnelle à la puissance
      </Etiquette>
    </Figure>
  );
}

/** Forage, pompe et réservoir : la hauteur manométrique H et le débit Q fixent la puissance (dessin sans échelle). */
export function PompeSchema({ d, r, prefixe = 'pp' }: { d: DonneesPompe; r: ResultatPompe; prefixe?: string }) {
  const sol = 150;
  return (
    <Figure
      alt={`Pompe immergée dans un forage, refoulement vers un réservoir surélevé : Q = ${n2(d.Q)} m³/h, H = ${n2(d.H)} m, puissance absorbée ${n1(r.Pabs)} W ; dessin sans échelle`}
      largeur={620}
      hauteur={310}
    >
      <Hachures prefixe={prefixe} types={['terre', 'eau']} />
      <rect x={20} y={sol} width={580} height={150} fill={hachure(prefixe, 'terre')} stroke="none" />
      <line x1={20} y1={sol} x2={600} y2={sol} className="t-fort" />
      <rect x={110} y={sol} width={36} height={150} fill="var(--color-papier)" stroke="none" />
      <line x1={110} y1={sol} x2={110} y2={300} className="t-moyen" />
      <line x1={146} y1={sol} x2={146} y2={300} className="t-moyen" />
      <rect x={111} y={228} width={34} height={72} fill={hachure(prefixe, 'eau')} stroke="none" />
      <rect x={148} y={212} width={96} height={14} fill="var(--color-papier)" />
      <Niveau x={128} y={228} texte="niveau en pompage" />
      <rect x={120} y={268} width={16} height={26} fill="var(--color-acier-clair)" className="t-moyen" />
      <Etiquette x={154} y={290} taille={11}>
        pompe
      </Etiquette>
      <polyline points={points([[128, 268], [128, 120], [430, 120], [430, 52]])} fill="none" stroke={BLEU} strokeWidth={2.4} />
      <line x1={400} y1={sol} x2={400} y2={92} className="t-moyen" />
      <line x1={500} y1={sol} x2={500} y2={92} className="t-moyen" />
      <line x1={400} y1={sol} x2={500} y2={92} className="t-fin" />
      <line x1={500} y1={sol} x2={400} y2={92} className="t-fin" />
      <rect x={390} y={46} width={120} height={46} className="t-fort" fill="none" />
      <rect x={391} y={64} width={118} height={27} fill={hachure(prefixe, 'eau')} stroke="none" />
      <Etiquette x={450} y={40} ancre="middle" taille={11.5}>
        réservoir
      </Etiquette>
      <Cote x1={560} y1={228} x2={560} y2={52} decalage={-6} texte={`H = ${n2(d.H)} m`} />
      <line x1={146} y1={228} x2={566} y2={228} className="t-fin" strokeDasharray="2 4" />
      <line x1={430} y1={52} x2={566} y2={52} className="t-fin" strokeDasharray="2 4" />
      <Fleche x1={220} y1={108} x2={300} y2={108} couleur={BLEU} texte={`Q = ${n2(d.Q)} m³/h`} tx={260} ty={100} ancre="middle" />
      <Etiquette x={300} y={142} taille={12} gras couleur={ROUGE}>
        Pabs = {n1(r.Pabs)} W
      </Etiquette>
      <Etiquette x={600} y={300} ancre="end" taille={10.5} classe="etiquette">
        dessin sans échelle
      </Etiquette>
    </Figure>
  );
}

// ---------- N0.7.5 : hydrostatique ----------

/** Pression de l'eau qui croît avec la profondeur, et vases communicants entre un château d'eau et un robinet. */
export function PressionProfondeur({ h = 3, dz = 15, prefixe = 'pr' }: { h?: number; dz?: number; prefixe?: string }) {
  const top = 60;
  const fond = 240;
  const k = (fond - top) / h;
  const pMax = pressionEau(h);
  const kp = 90 / pMax;
  const xP = 236; // paroi droite
  return (
    <Figure
      alt={`À gauche, réservoir de ${n2(h)} m d'eau : la pression vaut 0 à la surface, ${n2(pressionEau(h / 2))} kPa à mi-hauteur et ${n2(pMax)} kPa au fond, perpendiculairement aux parois. À droite, un robinet ${n2(dz)} m sous le niveau du château d'eau reçoit ${n2(pressionEau(dz))} kPa`}
      largeur={620}
      hauteur={290}
    >
      <Hachures prefixe={prefixe} types={['eau']} />
      <rect x={60} y={top} width={xP - 60} height={fond - top} fill={hachure(prefixe, 'eau')} stroke="none" />
      <polyline points={points([[56, top - 20], [56, fond + 4], [xP + 4, fond + 4], [xP + 4, top - 20]])} fill="none" className="t-fort" strokeWidth={4} />
      <Niveau x={90} y={top} texte="surface libre" />
      <polygon points={points([[xP + 8, top], [xP + 8 + pMax * kp, fond], [xP + 8, fond]])} fill={BLEU} opacity={0.12} stroke={BLEU} strokeWidth={1.2} />
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <Fleche key={f} x1={xP + 8 + pressionEau(h * f) * kp} y1={top + f * h * k} x2={xP + 10} y2={top + f * h * k} couleur={BLEU} epaisseur={1.6} tete={7} />
      ))}
      <Etiquette x={xP + 14 + pressionEau(h / 2) * kp} y={top + (h / 2) * k + 4} taille={11.5}>
        {n2(pressionEau(h / 2))} kPa
      </Etiquette>
      <Etiquette x={xP + 14 + pMax * kp} y={fond + 4} taille={11.5} gras>
        {n2(pMax)} kPa
      </Etiquette>
      <Cote x1={40} y1={fond} x2={40} y2={top} decalage={0} texte={`h = ${n2(h)} m`} />
      <Etiquette x={150} y={fond + 30} ancre="middle" taille={11} classe="etiquette">
        p = ρ g h, perpendiculaire à la paroi
      </Etiquette>

      <line x1={392} y1={14} x2={392} y2={276} className="t-fin" strokeDasharray="3 4" />
      <rect x={440} y={30} width={80} height={40} className="t-fort" fill="none" />
      <rect x={441} y={44} width={78} height={25} fill={hachure(prefixe, 'eau')} stroke="none" />
      <line x1={460} y1={70} x2={460} y2={250} className="t-moyen" />
      <line x1={500} y1={70} x2={500} y2={250} className="t-moyen" />
      <polyline points={points([[480, 70], [480, 236], [580, 236], [580, 222]])} fill="none" stroke={BLEU} strokeWidth={2.4} />
      <circle cx={580} cy={218} r={4} fill={BLEU} />
      <Etiquette x={586} y={214} taille={11}>
        robinet
      </Etiquette>
      <line x1={520} y1={44} x2={606} y2={44} className="t-fin" strokeDasharray="5 3" stroke={BLEU} />
      <Cote x1={598} y1={218} x2={598} y2={44} decalage={-4} texte={`Δz = ${n2(dz)} m`} />
      <line x1={400} y1={250} x2={612} y2={250} className="t-moyen" />
      <Etiquette x={500} y={270} ancre="middle" taille={12} gras couleur={BLEU}>
        p = {n2(pressionEau(dz))} kPa ≈ {n2(pressionEau(dz) / 100)} bar
      </Etiquette>
    </Figure>
  );
}

/** Cuve enterrée vide dans la nappe, coupe 1-1 : pression de l'eau sur la paroi et sous le fond, poids et poussée. */
export function CuveCoupe({ d, r, prefixe = 'cu' }: { d: DonneesCuve; r: ResultatCuve; prefixe?: string }) {
  const k = Math.min(300 / d.L, 190 / d.H);
  const X0 = 150;
  const X1 = X0 + d.L * k;
  const sol = 70;
  const base = sol + d.H * k;
  const e = Math.max(d.e * k, 4);
  const yN = base - r.hImm * k;
  const kp = 70 / Math.max(r.pFond, 1e-9);
  const Xm = (X0 + X1) / 2;
  return (
    <Figure
      alt={`Coupe d'une cuve enterrée vide de ${n2(d.L)} × ${n2(d.l)} × ${n2(d.H)} m, nappe à ${n2(d.hw)} m au-dessus du fond : pression ${n2(r.pFond)} kPa sous le fond, poussée ${n2(r.Pi)} kN contre un poids de ${n2(r.G)} kN`}
      largeur={620}
      hauteur={base + 110}
    >
      <Hachures prefixe={prefixe} types={['terre', 'ba']} />
      <rect x={20} y={sol} width={580} height={base + 30 - sol} fill={hachure(prefixe, 'terre')} stroke="none" />
      {r.hImm > 0 ? <rect x={20} y={yN} width={580} height={base + 30 - yN} fill={EAU} opacity={0.45} stroke="none" /> : null}
      <line x1={20} y1={sol} x2={600} y2={sol} className="t-fort" />
      <rect x={X0} y={sol} width={X1 - X0} height={base - sol} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect x={X0 + e} y={sol + e} width={X1 - X0 - 2 * e} height={base - sol - 2 * e} fill="var(--color-papier)" className="t-moyen" />
      <Etiquette x={Xm} y={(sol + base) / 2 - 4} ancre="middle" taille={11.5} classe="etiquette">
        cuve vide
      </Etiquette>
      {r.hImm > 0 ? (
        <>
          <line x1={20} y1={yN} x2={600} y2={yN} stroke={BLEU} strokeWidth={1.4} strokeDasharray="8 4" />
          <Niveau x={40} y={yN} texte="nappe" />
          <polygon points={points([[X1 + 4, yN], [X1 + 4 + r.pFond * kp, base], [X1 + 4, base]])} fill={BLEU} opacity={0.15} stroke={BLEU} strokeWidth={1.2} />
          <Etiquette x={X1 + 8 + r.pFond * kp} y={base + 4} taille={11.5}>
            {n2(r.pFond)} kPa
          </Etiquette>
          <rect x={X0} y={base + 2} width={X1 - X0} height={22} fill={BLEU} opacity={0.15} stroke={BLEU} strokeWidth={1.2} />
          {[0.15, 0.38, 0.62, 0.85].map((f) => (
            <Fleche key={f} x1={X0 + f * (X1 - X0)} y1={base + 24} x2={X0 + f * (X1 - X0)} y2={base + 4} couleur={BLEU} epaisseur={1.4} tete={6} />
          ))}
          <Fleche x1={Xm} y1={base + 92} x2={Xm} y2={base + 30} couleur={VERT} epaisseur={3} texte={`Π = ${n2(r.Pi)} kN`} tx={Xm + 10} ty={base + 80} />
          <Cote x1={X0 - 34} y1={base} x2={X0 - 34} y2={yN} decalage={0} texte={`${n2(r.hImm)} m`} />
        </>
      ) : null}
      <Fleche x1={Xm - 60} y1={(sol + base) / 2 - 28} x2={Xm - 60} y2={(sol + base) / 2 + 30} couleur={ROUGE} epaisseur={3} texte={`G = ${n2(r.G)} kN`} tx={Xm - 68} ty={(sol + base) / 2 + 24} ancre="end" />
      <Cote x1={X0} y1={sol} x2={X1} y2={sol} decalage={14} texte={`L = ${n2(d.L)} m`} />
      <Cote x1={X0 - 70} y1={base} x2={X0 - 70} y2={sol} decalage={0} texte={`H = ${n2(d.H)} m`} />
    </Figure>
  );
}

/** Vue en plan de la cuve : contour extérieur, vide intérieur, trappe d'accès, trait de coupe 1-1. */
export function CuvePlan({ d, prefixe = 'cp' }: { d: DonneesCuve; prefixe?: string }) {
  const k = Math.min(300 / d.L, 120 / d.l);
  const X0 = 160;
  const Y0 = 40;
  const X1 = X0 + d.L * k;
  const Y1 = Y0 + d.l * k;
  const e = Math.max(d.e * k, 4);
  const ym = (Y0 + Y1) / 2;
  const t = 0.6 * k;
  return (
    <Figure alt={`Vue en plan de la cuve : ${n2(d.L)} × ${n2(d.l)} m hors tout, parois de ${n2(d.e * 100)} cm, trappe d'accès, coupe 1-1 dans la longueur`} largeur={620} hauteur={Y1 + 50}>
      <Hachures prefixe={prefixe} types={['ba']} />
      <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect x={X0 + e} y={Y0 + e} width={X1 - X0 - 2 * e} height={Y1 - Y0 - 2 * e} fill="var(--color-papier)" className="t-moyen" />
      <rect x={X0 + e + 10} y={Y0 + e + 6} width={t} height={t} fill="none" className="t-moyen" strokeDasharray="5 3" />
      <Etiquette x={X0 + e + 14 + t} y={Y0 + e + 6 + t / 2 + 4} taille={11} classe="etiquette">
        trappe d'accès
      </Etiquette>
      <line x1={X0 - 26} y1={ym} x2={X1 + 26} y2={ym} className="t-fin" strokeDasharray="14 4 2 4" />
      {[X0 - 26, X1 + 26].map((x) => (
        <g key={x}>
          <Fleche x1={x} y1={ym} x2={x} y2={ym + 18} couleur="var(--trait)" epaisseur={1.6} tete={7} />
          <Etiquette x={x + (x < X0 ? -8 : 8)} y={ym - 6} ancre={x < X0 ? 'end' : 'start'} taille={13} gras>
            1
          </Etiquette>
        </g>
      ))}
      <Cote x1={X0} y1={Y1} x2={X1} y2={Y1} decalage={-16} texte={`${n2(d.L)} m`} />
      <Cote x1={X1} y1={Y1} x2={X1} y2={Y0} decalage={-70} texte={`${n2(d.l)} m`} />
    </Figure>
  );
}

// ---------- N0.7.6 : dilatation thermique ----------

/** Élément libre qui s'allonge (allongement exagéré et signalé), puis le même élément bloqué entre deux appuis. */
export function DilatationSchema({ d, r, prefixe = 'di' }: { d: DonneesDilatation; r: ResultatDilatation; prefixe?: string }) {
  const m = MATERIAUX_THERMIQUES[d.materiau];
  const motif = d.materiau === 'acier' ? 'acier' : 'ba';
  const x0 = 70;
  const x1 = 470;
  const dl = 36; // allongement dessiné, exagéré
  const fissure = r.rapport > 1;
  return (
    <Figure
      alt={`Élément en ${m.nom} de ${n2(d.L)} m, ΔT = ${n2(d.dT)} K : allongement libre ${n2(r.dL)} mm ; bloqué, contrainte ${n2(r.sigma)} MPa pour une ${m.nomLimite} de ${n2(r.limite)} MPa`}
      largeur={620}
      hauteur={270}
    >
      <Hachures prefixe={prefixe} types={[motif, 'beton']} />
      <Etiquette x={20} y={24} taille={12} gras>
        libre
      </Etiquette>
      <rect x={x0 - 26} y={44} width={26} height={56} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <rect x={x0} y={60} width={x1 - x0} height={24} fill={hachure(prefixe, motif)} className="t-fort" />
      <rect x={x1} y={60} width={dl} height={24} fill="none" className="t-moyen" strokeDasharray="5 3" />
      <Fleche x1={x1} y1={52} x2={x1 + dl} y2={52} couleur={ROUGE} epaisseur={2} tete={7} />
      <Etiquette x={x1 + dl + 8} y={56} taille={12} gras couleur={ROUGE}>
        ΔL = {n2(r.dL)} mm
      </Etiquette>
      <Etiquette x={x1 + dl + 8} y={74} taille={10.5} classe="etiquette">
        (exagéré sur le dessin)
      </Etiquette>
      <Cote x1={x0} y1={84} x2={x1} y2={84} decalage={-14} texte={`L = ${n2(d.L)} m`} />

      <Etiquette x={20} y={150} taille={12} gras>
        bloqué, au refroidissement : les appuis le retiennent, il est tendu
      </Etiquette>
      <rect x={x0 - 26} y={164} width={26} height={60} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <rect x={x1} y={164} width={26} height={60} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <rect x={x0} y={182} width={x1 - x0} height={24} fill={hachure(prefixe, motif)} className="t-fort" />
      {fissure ? <polyline points={points([[270, 182], [262, 190], [274, 198], [266, 206]])} fill="none" stroke={ROUGE} strokeWidth={2} /> : null}
      <Fleche x1={x0 + 50} y1={194} x2={x0 + 4} y2={194} couleur={ROUGE} epaisseur={2.6} tete={8} />
      <Fleche x1={x1 - 50} y1={194} x2={x1 - 4} y2={194} couleur={ROUGE} epaisseur={2.6} tete={8} />
      <Etiquette x={x0 + 160} y={174} ancre="middle" taille={12} gras couleur={ROUGE}>
        traction σ = E α ΔT = {n2(r.sigma)} MPa
      </Etiquette>
      <Etiquette x={(x0 + x1) / 2} y={246} ancre="middle" taille={12} gras couleur={fissure ? ROUGE : BLEU}>
        {fissure ? `${n2(r.sigma)} MPa > ${n2(r.limite)} MPa : l'élément fissure` : `${n2(r.sigma)} MPa ≤ ${n2(r.limite)} MPa : il tient, mais tire fort sur ses appuis`}
      </Etiquette>
    </Figure>
  );
}

/** Joint de dilatation : coupe sur le joint, et bâtiment découpé en blocs séparés par des joints. */
export function JointDilatation({ prefixe = 'jd' }: { prefixe?: string }) {
  return (
    <Figure
      alt="À gauche, coupe sur un joint de dilatation : deux dalles séparées par un vide rempli d'un fond de joint compressible et fermé par un mastic. À droite, un long bâtiment découpé en trois blocs indépendants par deux joints"
      largeur={620}
      hauteur={230}
    >
      <Hachures prefixe={prefixe} types={['ba']} />
      <Etiquette x={150} y={22} ancre="middle" taille={12} gras>
        coupe sur le joint
      </Etiquette>
      <rect x={30} y={80} width={110} height={44} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect x={162} y={80} width={110} height={44} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect x={140} y={88} width={22} height={36} fill="var(--color-terre-clair)" className="t-fin" />
      <rect x={140} y={80} width={22} height={8} fill="var(--trait)" />
      <Fleche x1={120} y1={60} x2={146} y2={80} couleur={BLEU} epaisseur={1.4} tete={7} />
      <Etiquette x={118} y={56} ancre="end" taille={11}>
        mastic d'étanchéité
      </Etiquette>
      <Fleche x1={200} y1={160} x2={156} y2={118} couleur={BLEU} epaisseur={1.4} tete={7} />
      <Etiquette x={204} y={170} taille={11}>
        fond de joint compressible
      </Etiquette>
      <Cote x1={140} y1={124} x2={162} y2={124} decalage={-22} texte="joint" />
      <Fleche x1={110} y1={140} x2={80} y2={140} couleur={ROUGE} epaisseur={1.8} tete={7} />
      <Fleche x1={192} y1={140} x2={222} y2={140} couleur={ROUGE} epaisseur={1.8} tete={7} />
      <Etiquette x={151} y={212} ancre="middle" taille={11} classe="etiquette">
        chaque bloc se dilate librement
      </Etiquette>

      <line x1={310} y1={14} x2={310} y2={216} className="t-fin" strokeDasharray="3 4" />
      <Etiquette x={465} y={22} ancre="middle" taille={12} gras>
        plan : blocs indépendants
      </Etiquette>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={330 + i * 94} y={70} width={88} height={80} fill="var(--color-beton-clair)" className="t-fort" />
      ))}
      {[418, 512].map((x) => (
        <g key={x}>
          <line x1={x + 3} y1={60} x2={x + 3} y2={160} stroke={ROUGE} strokeWidth={1.4} strokeDasharray="4 3" />
          <Etiquette x={x + 3} y={176} ancre="middle" taille={11} couleur={ROUGE}>
            joint
          </Etiquette>
        </g>
      ))}
      <Cote x1={330} y1={70} x2={418} y2={70} decalage={10} texte="bloc" />
    </Figure>
  );
}

// ---------- N0.7.7 : électricité de chantier ----------

/** Schéma de principe : groupe électrogène, coffret de chantier (protections, terre), récepteurs. */
export function CircuitChantier({ d }: { d: DonneesGroupe }) {
  const recepteurs = [
    { nom: 'bétonnière', p: d.betonniere, moteur: true },
    { nom: 'vibreur', p: d.vibreur, moteur: true },
    { nom: 'pompe', p: d.pompe, moteur: true },
    { nom: 'éclairage', p: d.eclairage, moteur: false },
  ];
  return (
    <Figure
      alt={`Groupe électrogène relié à un coffret de chantier équipé d'un disjoncteur différentiel 30 mA et d'une prise de terre, qui alimente une bétonnière de ${n2(d.betonniere)} kW, un vibreur de ${n2(d.vibreur)} kW, une pompe de ${n2(d.pompe)} kW et ${n2(d.eclairage)} kW d'éclairage`}
      largeur={620}
      hauteur={260}
    >
      <circle cx={70} cy={120} r={34} fill="none" className="t-fort" />
      <Etiquette x={70} y={116} ancre="middle" taille={16} gras>
        G
      </Etiquette>
      <path d="M56 132 q7 -8 14 0 t14 0" fill="none" className="t-moyen" />
      <Etiquette x={70} y={176} ancre="middle" taille={11}>
        groupe électrogène
      </Etiquette>
      <line x1={104} y1={120} x2={190} y2={120} className="t-fort" />
      <rect x={190} y={70} width={120} height={100} rx={4} fill="none" className="t-fort" />
      <Etiquette x={250} y={92} ancre="middle" taille={11.5} gras>
        coffret de chantier
      </Etiquette>
      <Etiquette x={250} y={114} ancre="middle" taille={11}>
        disjoncteurs
      </Etiquette>
      <Etiquette x={250} y={132} ancre="middle" taille={11}>
        différentiel 30 mA
      </Etiquette>
      <line x1={250} y1={170} x2={250} y2={200} className="t-moyen" />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={250 - 16 + i * 5} y1={200 + i * 6} x2={250 + 16 - i * 5} y2={200 + i * 6} className="t-moyen" />
      ))}
      <Etiquette x={262} y={224} taille={11}>
        prise de terre
      </Etiquette>
      {recepteurs.map((rc, i) => {
        const y = 40 + i * 58;
        return (
          <g key={rc.nom}>
            <polyline points={points([[310, 120], [350, 120], [350, y], [440, y]])} fill="none" className="t-moyen" />
            <circle cx={460} cy={y} r={18} fill="none" className="t-fort" />
            {rc.moteur ? (
              <Etiquette x={460} y={y + 5} ancre="middle" taille={13} gras>
                M
              </Etiquette>
            ) : (
              <>
                <line x1={447} y1={y - 13} x2={473} y2={y + 13} className="t-moyen" />
                <line x1={473} y1={y - 13} x2={447} y2={y + 13} className="t-moyen" />
              </>
            )}
            <Etiquette x={486} y={y - 2} taille={11.5} gras>
              {rc.nom}
            </Etiquette>
            <Etiquette x={486} y={y + 13} taille={11}>
              {n2(rc.p)} kW
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Bilan de puissance : récepteurs (kW), puissances apparentes en marche et au démarrage (kVA), groupe retenu. */
export function BilanGroupeSchema({ d, r }: { d: DonneesGroupe; r: ResultatGroupe }) {
  const lignes = [
    { nom: 'bétonnière', v: d.betonniere, u: 'kW', c: BLEU },
    { nom: 'vibreur', v: d.vibreur, u: 'kW', c: BLEU },
    { nom: 'pompe', v: d.pompe, u: 'kW', c: BLEU },
    { nom: 'éclairage', v: d.eclairage, u: 'kW', c: BLEU },
    { nom: 'total P', v: r.P, u: 'kW', c: 'var(--trait)' },
    { nom: 'en marche S', v: r.S, u: 'kVA', c: BRIQUE },
    { nom: 'au démarrage', v: r.Sdem, u: 'kVA', c: ROUGE },
  ];
  const ref = r.groupe ?? r.Sdem;
  const k = 330 / Math.max(ref, r.Sdem, 1e-9);
  const x0 = 140;
  return (
    <Figure
      alt={`Bilan : ${n2(r.P)} kW au total, ${n2(r.S)} kVA en marche, ${n2(r.Sdem)} kVA au démarrage du plus gros moteur ; ${r.groupe ? `groupe de ${r.groupe} kVA` : 'aucun groupe de la gamme ne suffit'}`}
      largeur={620}
      hauteur={262}
    >
      {lignes.map((l, i) => {
        const y = 22 + i * 30 + (i >= 4 ? 8 : 0) + (i >= 5 ? 8 : 0);
        return (
          <g key={l.nom}>
            <Etiquette x={x0 - 8} y={y + 13} ancre="end" taille={11.5} gras={i >= 4}>
              {l.nom}
            </Etiquette>
            <rect x={x0} y={y} width={Math.max(l.v * k, 1)} height={18} fill={l.c} opacity={i >= 4 ? 0.75 : 0.5} />
            <Etiquette x={x0 + l.v * k + 6} y={y + 13} taille={11.5}>
              {n2(l.v)} {l.u}
            </Etiquette>
          </g>
        );
      })}
      {r.groupe ? (
        <>
          <line x1={x0 + r.groupe * k} y1={12} x2={x0 + r.groupe * k} y2={250} stroke={VERT} strokeWidth={2} strokeDasharray="6 4" />
          <Etiquette x={x0 + r.groupe * k - 6} y={250} ancre="end" taille={12} gras couleur={VERT}>
            groupe : {r.groupe} kVA
          </Etiquette>
        </>
      ) : null}
    </Figure>
  );
}

// ---------- N0.7.P : château d'eau ----------

/** Château d'eau en élévation, avec son forage : hauteurs, pressions, élévation de l'eau et radier (dessin sans échelle). */
export function ChateauSchema({ d, r, prefixe = 'ch' }: { d: DonneesChateau; r: ResultatChateau; prefixe?: string }) {
  const sol = 250;
  const k = 150 / (d.H + d.h);
  const fondCuve = sol - d.H * k;
  const eauHaut = fondCuve - d.h * k;
  const toit = eauHaut - 10;
  const xc0 = 330;
  const xc1 = 460;
  const xm = (xc0 + xc1) / 2;
  const nivForage = 330;
  return (
    <Figure
      alt={`Château d'eau : cuve de ${n2(r.V)} m³ dont le fond est à ${n2(d.H)} m ; pression ${n2(r.pFond)} kPa sur le fond de cuve et ${n2(r.pSol)} kPa à un robinet au sol ; eau pompée depuis ${n2(d.zf)} m sous le sol, élévation ${n2(r.dz)} m ; ${n2(r.N)} kN sur un radier de ${n2(d.B)} m de côté ; dessin sans échelle`}
      largeur={620}
      hauteur={360}
    >
      <Hachures prefixe={prefixe} types={['terre', 'eau', 'ba']} />
      <rect x={20} y={sol} width={580} height={110} fill={hachure(prefixe, 'terre')} stroke="none" />
      <line x1={20} y1={sol} x2={600} y2={sol} className="t-fort" />
      <rect x={xm - 70} y={sol + 2} width={140} height={20} fill={hachure(prefixe, 'ba')} className="t-fort" />
      {[xc0 + 18, xc1 - 18].map((x) => (
        <line key={x} x1={x} y1={sol} x2={x} y2={fondCuve} className="t-fort" strokeWidth={3} />
      ))}
      <line x1={xc0 + 18} y1={sol} x2={xc1 - 18} y2={fondCuve + 40} className="t-fin" />
      <line x1={xc1 - 18} y1={sol} x2={xc0 + 18} y2={fondCuve + 40} className="t-fin" />
      <rect x={xc0} y={toit} width={xc1 - xc0} height={fondCuve - toit} className="t-fort" fill="none" />
      <rect x={xc0 + 1} y={eauHaut} width={xc1 - xc0 - 2} height={fondCuve - eauHaut - 1} fill={hachure(prefixe, 'eau')} stroke="none" />
      <Niveau x={xc0 + 14} y={eauHaut} texte="cuve pleine" />

      <rect x={96} y={sol} width={28} height={110} fill="var(--color-papier)" stroke="none" />
      <line x1={96} y1={sol} x2={96} y2={358} className="t-moyen" />
      <line x1={124} y1={sol} x2={124} y2={358} className="t-moyen" />
      <polyline points={points([[90, 292], [130, 286], [90, 300], [130, 294]])} fill="none" className="t-fin" />
      <rect x={97} y={nivForage} width={26} height={28} fill={hachure(prefixe, 'eau')} stroke="none" />
      <Niveau x={110} y={nivForage} texte={`−${n2(d.zf)} m`} />
      <polyline points={points([[110, 345], [110, 234], [300, 234], [300, toit - 14], [xc0 + 30, toit - 14], [xc0 + 30, toit]])} fill="none" stroke={BLEU} strokeWidth={2.2} />
      <Etiquette x={140} y={228} taille={11} couleur={BLEU}>
        refoulement
      </Etiquette>

      <Cote x1={xc1 + 30} y1={sol} x2={xc1 + 30} y2={fondCuve} decalage={-4} texte={`H = ${n2(d.H)} m`} />
      <Cote x1={xc1 + 30} y1={fondCuve} x2={xc1 + 30} y2={eauHaut} decalage={-4} texte={`h = ${n2(d.h)} m`} />
      <Cote x1={60} y1={nivForage} x2={60} y2={eauHaut} decalage={0} texte={`Δz = ${n2(r.dz)} m (forage → haut de cuve)`} />
      <line x1={64} y1={eauHaut} x2={xc0} y2={eauHaut} className="t-fin" strokeDasharray="2 4" />

      <Etiquette x={xm} y={fondCuve + 16} ancre="middle" taille={11.5} gras couleur={BLEU}>
        fond : {n2(r.pFond)} kPa
      </Etiquette>
      <circle cx={560} cy={sol - 8} r={4} fill={BLEU} />
      <polyline points={points([[xm, sol - 4], [560, sol - 4]])} fill="none" stroke={BLEU} strokeWidth={1.4} strokeDasharray="4 3" />
      <Etiquette x={600} y={sol - 18} ancre="end" taille={11.5} gras couleur={BLEU}>
        robinet au sol : {n2(r.pSol)} kPa
      </Etiquette>
      <Etiquette x={xm} y={sol + 40} ancre="middle" taille={11.5}>
        radier {n2(d.B)} × {n2(d.B)} m : σ = {n2(r.sigma)} kPa
      </Etiquette>
      <Etiquette x={600} y={352} ancre="end" taille={10.5} classe="etiquette">
        dessin sans échelle
      </Etiquette>
    </Figure>
  );
}
