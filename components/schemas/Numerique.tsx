// Schémas du module L2.3 (méthodes numériques). Les points et les courbes viennent de lib/calc/numerique.ts.

import { useId } from 'react';
import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Axes, Courbe, repere2D } from '@/components/drawing/Graphe';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { deformeeDF, deriveeFinie, dichotomie, interpLineaire, iteratif, lagrange, newton, oscillateurNumerique, type DonneesDF } from '@/lib/calc/numerique';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const GRIS = 'var(--color-beton)';
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const exposant = (e: number) => `10${e < 0 ? '⁻' : ''}${String(Math.abs(e)).split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]).join('')}`;

/** Erreur des dérivées numériques de eˣ en 0 selon le pas h (échelles logarithmiques) : troncature puis arrondi. */
export function ErreurPas() {
  const hs = Array.from({ length: 29 }, (_, i) => 10 ** (-i / 2));
  const d = hs.map((h) => deriveeFinie(Math.exp, 1, 0, h));
  const lg = (v: number) => Math.log10(Math.max(v, 1e-17));
  const R = repere2D({ x0: 70, y0: 15, l: 470, h: 170, xmin: -14, xmax: 0, ymin: -12, ymax: 0 });
  const trace = (k: 'eAvant' | 'eCentree') => points(d.filter((p) => p[k] > 0).map((p) => [R.X(lg(p.h)), R.Y(Math.max(-12, lg(p[k])))] as const));
  const best = d.reduce((m, p) => (p.eCentree > 0 && p.eCentree < m.eCentree ? p : m), d[0]!);
  return (
    <Figure alt={`Erreur des dérivées numériques de eˣ en 0 selon le pas h, en échelles logarithmiques. Quand h diminue, l'erreur de troncature baisse (proportionnelle à h pour la différence avant, à h² pour la centrée), puis l'erreur d'arrondi remonte car on soustrait deux nombres presque égaux. Le meilleur pas pour la différence centrée est vers h = ${exposant(Math.round(lg(best.h)))}.`} largeur={620} hauteur={230}>
      <Axes R={R} gradX={[]} gradY={[]} titreX="h" titreY="erreur" />
      {[-14, -12, -10, -8, -6, -4, -2, 0].map((e) => (
        <Etiquette key={`x${e}`} x={R.X(e)} y={R.Y(-12) + 16} ancre="middle" taille={10}>
          {exposant(e)}
        </Etiquette>
      ))}
      {[-12, -9, -6, -3, 0].map((e) => (
        <g key={`y${e}`}>
          <line x1={R.X(-14)} x2={R.X(0)} y1={R.Y(e)} y2={R.Y(e)} stroke={GRIS} strokeDasharray="2 4" />
          <Etiquette x={R.X(-14) - 6} y={R.Y(e) + 4} ancre="end" taille={10}>
            {exposant(e)}
          </Etiquette>
        </g>
      ))}
      <polyline points={trace('eAvant')} fill="none" stroke={ROUGE} strokeWidth={2} />
      <polyline points={trace('eCentree')} fill="none" stroke={BLEU} strokeWidth={2} />
      <Etiquette x={R.X(-1.5)} y={R.Y(-1.2)} taille={11} gras couleur={ROUGE}>
        avant (ordre 1)
      </Etiquette>
      <Etiquette x={R.X(-3)} y={R.Y(-6.5)} taille={11} gras couleur={BLEU}>
        centrée (ordre 2)
      </Etiquette>
      <Etiquette x={R.X(-13.5)} y={R.Y(-1.5)} taille={10.5} couleur={GRIS}>
        ← l'arrondi domine
      </Etiquette>
    </Figure>
  );
}

/** Dichotomie : intervalles emboîtés autour de la racine. */
export function Dichotomie({ f, a, b, etapes = 5, titreX = 'x' }: { f: (x: number) => number; a: number; b: number; etapes?: number; titreX?: string }) {
  const it = dichotomie(f, a, b, 1e-9, etapes);
  const ys = Array.from({ length: 51 }, (_, i) => f(a + ((b - a) * i) / 50));
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);
  const R = repere2D({ x0: 60, y0: 15, l: 480, h: 120, xmin: a, xmax: b, ymin: ymin - 0.1 * (ymax - ymin), ymax: ymax + 0.1 * (ymax - ymin) });
  return (
    <Figure alt={`Méthode de dichotomie sur [${n2(a)} ; ${n2(b)}] : à chaque étape on coupe l'intervalle en deux et l'on garde la moitié où f change de signe. Milieux successifs : ${it.map((p) => n3(p.x)).join(' ; ')}. L'intervalle est divisé par deux à chaque étape.`} largeur={620} hauteur={150 + etapes * 16}>
      <Axes R={R} gradX={[]} gradY={[]} titreX={titreX} />
      <Courbe R={R} f={f} de={a} a={b} couleur={BLEU} epaisseur={2} />
      {it.map((p, i) => {
        const y = 150 + i * 16;
        return (
          <g key={i}>
            <line x1={R.X(p.a!)} x2={R.X(p.b!)} y1={y} y2={y} stroke={i === it.length - 1 ? ROUGE : TERRE} strokeWidth={3} />
            <circle cx={R.X(p.x)} cy={y} r={3} fill={ROUGE} />
            <Etiquette x={R.X(p.b!) + 6} y={y + 4} taille={10}>
              {`${i + 1} : m = ${n3(p.x)}`}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Méthode de Newton : tangentes successives jusqu'à la racine. */
export function TangentesNewton({ f, fp, x0, a, b, n = 3, titreX = 'x' }: { f: (x: number) => number; fp: (x: number) => number; x0: number; a: number; b: number; n?: number; titreX?: string }) {
  const it = newton(f, fp, x0, 1e-12, n);
  const ys = Array.from({ length: 51 }, (_, i) => f(a + ((b - a) * i) / 50));
  const ymin = Math.min(0, ...ys);
  const ymax = Math.max(...ys);
  const R = repere2D({ x0: 60, y0: 15, l: 480, h: 170, xmin: a, xmax: b, ymin, ymax: ymax * 1.05 });
  return (
    <Figure alt={`Méthode de Newton : depuis x0 = ${n2(x0)}, on suit la tangente à la courbe jusqu'à l'axe, ce qui donne le point suivant. Itérés : ${it.map((p) => nombre(p.x, 5)).join(' ; ')}. Le nombre de chiffres exacts double à peu près à chaque pas.`} largeur={620} hauteur={215}>
      <Axes R={R} gradX={[]} gradY={[]} titreX={titreX} />
      <Courbe R={R} f={f} de={a} a={b} couleur={BLEU} epaisseur={2} />
      {it.slice(0, -1).map((p, i) => {
        const suiv = it[i + 1]!;
        return (
          <g key={i}>
            <line x1={R.X(p.x)} x2={R.X(p.x)} y1={R.Y(0)} y2={R.Y(p.fx)} stroke={GRIS} strokeDasharray="3 3" />
            <line x1={R.X(p.x)} y1={R.Y(p.fx)} x2={R.X(suiv.x)} y2={R.Y(0)} stroke={ROUGE} strokeWidth={1.6} />
            <circle cx={R.X(p.x)} cy={R.Y(p.fx)} r={3.5} fill={ROUGE} />
            <Etiquette x={R.X(p.x)} y={R.Y(0) + 16} ancre="middle" taille={10.5} couleur={ROUGE}>
              {`x${['₀', '₁', '₂', '₃', '₄'][i]}`}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Canal rectangulaire en terre : largeur b, hauteur d'eau h, pente i. */
export function CanalRectangulaire({ b, h, Q }: { b: number; h: number; Q?: number }) {
  const p = `cr${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const H = Math.max(1, 1.3 * h);
  const k = Math.min(90, 130 / H, 300 / b);
  const x0 = 310 - (b * k) / 2;
  const yf = 160;
  return (
    <Figure alt={`Coupe d'un canal rectangulaire de ${n2(b)} m de large ; l'eau y coule sur une hauteur h = ${n2(h)} m${Q !== undefined ? ` pour un débit de ${n2(Q)} m³/s` : ''}. La section mouillée vaut b h, le périmètre mouillé b + 2h.`} largeur={620} hauteur={210}>
      <Hachures prefixe={p} types={['terre', 'eau']} />
      <path d={`M${x0 - 60} ${yf - H * k} H${x0} V${yf} H${x0 + b * k} V${yf - H * k} H${x0 + b * k + 60} V${yf + 14} H${x0 - 60} Z`} fill={hachure(p, 'terre')} className="t-moyen" />
      <rect x={x0} y={yf - h * k} width={b * k} height={h * k} fill={hachure(p, 'eau')} />
      <line x1={x0} x2={x0 + b * k} y1={yf - h * k} y2={yf - h * k} stroke={BLEU} strokeWidth={2} />
      <path d={`M${x0} ${yf - h * k} V${yf} H${x0 + b * k} V${yf - h * k}`} fill="none" stroke={ROUGE} strokeWidth={3} />
      <Cote x1={x0} y1={yf + 14} x2={x0 + b * k} y2={yf + 14} texte={`b = ${n2(b)} m`} decalage={-16} />
      <Cote x1={x0 + b * k + 60} y1={yf} x2={x0 + b * k + 60} y2={yf - h * k} texte={`h = ${n2(h)} m`} decalage={-14} />
      <Etiquette x={x0 + 8} y={yf - h * k - 8} taille={11} gras couleur={BLEU}>
        ▽ surface libre
      </Etiquette>
      <Etiquette x={x0 + (b * k) / 2} y={yf - 10} ancre="middle" taille={11} gras couleur={ROUGE}>
        périmètre mouillé b + 2h
      </Etiquette>
    </Figure>
  );
}

/** Interpolation linéaire dans un tableau : points du tableau, segments et valeur cherchée, comparés à la loi exacte. */
export function InterpolationTableau({ xs, ys, x, exacte, titreX, titreY, dec = 1 }: { xs: readonly number[]; ys: readonly number[]; x: number; exacte?: (x: number) => number; titreX: string; titreY: string; dec?: number }) {
  const i = Math.max(0, xs.findIndex((v, j) => x >= v && x <= (xs[j + 1] ?? -Infinity)));
  const y = interpLineaire(xs[i]!, ys[i]!, xs[i + 1]!, ys[i + 1]!, x);
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);
  const dy = (ymax - ymin) * 0.15;
  const R = repere2D({ x0: 70, y0: 15, l: 470, h: 165, xmin: xs[0]! - (xs[1]! - xs[0]!) * 0.5, xmax: xs[xs.length - 1]! + (xs[1]! - xs[0]!) * 0.5, ymin: ymin - dy, ymax: ymax + dy });
  return (
    <Figure alt={`Tableau de ${xs.length} valeurs (${titreX}, ${titreY}) reliées par des segments. Pour ${titreX} = ${nombre(x, dec)}, on lit entre ${nombre(xs[i]!, dec)} et ${nombre(xs[i + 1]!, dec)} : ${titreY} ≈ ${n2(y)} par interpolation linéaire${exacte ? `, contre ${n2(exacte(x))} par la formule exacte` : ''}.`} largeur={620} hauteur={215}>
      <Axes R={R} gradX={xs} gradY={[]} titreX={titreX} titreY={titreY} decX={dec} />
      {exacte ? <Courbe R={R} f={exacte} de={R.xmin} a={R.xmax} couleur={VERT} epaisseur={1.6} pointilles /> : null}
      <polyline points={points(xs.map((v, j) => [R.X(v), R.Y(ys[j]!)] as const))} fill="none" stroke={BLEU} strokeWidth={1.8} />
      {xs.map((v, j) => (
        <g key={j}>
          <circle cx={R.X(v)} cy={R.Y(ys[j]!)} r={4} fill={BLEU} />
          <Etiquette x={R.X(v)} y={R.Y(ys[j]!) - 8} ancre="middle" taille={10}>
            {n2(ys[j]!)}
          </Etiquette>
        </g>
      ))}
      <line x1={R.X(x)} x2={R.X(x)} y1={R.Y(R.ymin)} y2={R.Y(y)} stroke={ROUGE} strokeDasharray="4 3" />
      <line x1={R.X(R.xmin)} x2={R.X(x)} y1={R.Y(y)} y2={R.Y(y)} stroke={ROUGE} strokeDasharray="4 3" />
      <circle cx={R.X(x)} cy={R.Y(y)} r={5} fill={ROUGE} />
      <Etiquette x={R.X(x) + 8} y={R.Y(y) + 16} taille={11.5} gras couleur={ROUGE}>
        {`${nombre(x, dec)} → ${n2(y)}`}
      </Etiquette>
    </Figure>
  );
}

/** Maille d'un quadrillage de nivellement : interpolation bilinéaire de l'altitude d'un point. */
export function MailleBilineaire({ z, u, v, zP }: { z: readonly [number, number, number, number]; u: number; v: number; zP: number }) {
  const [x0, y0, c] = [200, 30, 180];
  const X = (s: number) => x0 + s * c;
  const Y = (s: number) => y0 + (1 - s) * c;
  const coins: [number, number, number, string][] = [
    [0, 0, z[0], 'A'],
    [1, 0, z[1], 'B'],
    [0, 1, z[2], 'D'],
    [1, 1, z[3], 'C'],
  ];
  return (
    <Figure alt={`Une maille carrée d'un quadrillage de nivellement, aux coins d'altitudes ${z.map(n2).join(', ')} m. Le point P est à ${nombre(u * 100, 0)} % de la largeur et ${nombre(v * 100, 0)} % de la hauteur : on interpole d'abord le long de deux côtés, puis entre les deux résultats. Altitude de P : ${n2(zP)} m.`} largeur={620} hauteur={240}>
      <rect x={x0} y={y0} width={c} height={c} fill="none" stroke={BLEU} strokeWidth={1.6} />
      {coins.map(([s, t, zz, nom]) => (
        <g key={nom}>
          <circle cx={X(s)} cy={Y(t)} r={4} fill={BLEU} />
          <Etiquette x={X(s) + (s ? 8 : -8)} y={Y(t) + (t ? -8 : 18)} ancre={s ? 'start' : 'end'} taille={11.5} gras>
            {`${nom} ${n2(zz)}`}
          </Etiquette>
        </g>
      ))}
      <line x1={X(u)} x2={X(u)} y1={Y(0)} y2={Y(1)} stroke={TERRE} strokeDasharray="4 3" />
      <circle cx={X(u)} cy={Y(0)} r={3} fill={TERRE} />
      <circle cx={X(u)} cy={Y(1)} r={3} fill={TERRE} />
      <circle cx={X(u)} cy={Y(v)} r={6} fill={ROUGE} />
      <Etiquette x={X(u) + 10} y={Y(v) + 4} taille={12} gras couleur={ROUGE}>
        {`P : ${n2(zP)} m`}
      </Etiquette>
      <Etiquette x={X(1) + 40} y={Y(0.75)} taille={10.5}>
        1. interpoler sur AB et sur DC
      </Etiquette>
      <Etiquette x={X(1) + 40} y={Y(0.6)} taille={10.5}>
        2. interpoler entre les deux
      </Etiquette>
    </Figure>
  );
}

/** Trapèzes et paraboles de Simpson sous une courbe de mesures. */
export function TrapezesSimpson({ ys, pas, unite = 'm²', titreX = 'abscisse (m)', titreY = 'aire (m²)' }: { ys: readonly number[]; pas: number; unite?: string; titreX?: string; titreY?: string }) {
  const n = ys.length - 1;
  const ymax = Math.max(...ys) * 1.15;
  const R = repere2D({ x0: 60, y0: 15, l: 490, h: 165, xmin: 0, xmax: n * pas, ymin: 0, ymax });
  const paraboles: React.ReactNode[] = [];
  for (let i = 0; i + 2 <= n; i += 2) {
    const [y0, y1, y2] = [ys[i]!, ys[i + 1]!, ys[i + 2]!];
    const f = (x: number) => {
      const t = (x - i * pas) / pas;
      return (y0 * (t - 1) * (t - 2)) / 2 - y1 * t * (t - 2) + (y2 * t * (t - 1)) / 2;
    };
    paraboles.push(<Courbe key={i} R={R} f={f} de={i * pas} a={(i + 2) * pas} couleur={VERT} epaisseur={2} n={40} />);
  }
  return (
    <Figure alt={`${n + 1} mesures équidistantes de ${pas} ${titreX.includes('m') ? 'm' : ''} : la méthode des trapèzes relie les points par des segments (en bleu) ; Simpson les relie deux intervalles par deux par des arcs de parabole (en vert), plus proches d'une courbe régulière. L'aire sous la ligne donne l'intégrale, en ${unite}.`} largeur={620} hauteur={215}>
      <Axes R={R} gradX={ys.map((_, i) => i * pas)} gradY={[]} titreX={titreX} titreY={titreY} />
      <polygon points={points([[R.X(0), R.Y(0)], ...ys.map((y, i) => [R.X(i * pas), R.Y(y)] as const), [R.X(n * pas), R.Y(0)]])} fill={BLEU} opacity={0.12} />
      {ys.map((y, i) => (
        <line key={i} x1={R.X(i * pas)} x2={R.X(i * pas)} y1={R.Y(0)} y2={R.Y(y)} stroke={BLEU} strokeWidth={1} />
      ))}
      <polyline points={points(ys.map((y, i) => [R.X(i * pas), R.Y(y)] as const))} fill="none" stroke={BLEU} strokeWidth={1.6} />
      {paraboles}
      {ys.map((y, i) => (
        <circle key={i} cx={R.X(i * pas)} cy={R.Y(y)} r={3.5} fill={ROUGE} />
      ))}
      <Etiquette x={550} y={20} ancre="end" taille={11} gras couleur={BLEU}>
        trapèzes
      </Etiquette>
      <Etiquette x={550} y={36} ancre="end" taille={11} gras couleur={VERT}>
        paraboles de Simpson
      </Etiquette>
    </Figure>
  );
}

/** Profils en travers successifs d'un déblai et leurs aires, le long de l'axe de la route. */
export function ProfilsTravers({ aires, pas }: { aires: readonly number[]; pas: number }) {
  const amax = Math.max(...aires);
  return (
    <Figure alt={`Les ${aires.length} profils en travers d'un déblai, tous les ${pas} m le long de l'axe : leurs aires vont de ${n2(Math.min(...aires))} à ${n2(amax)} m². Le volume est l'intégrale de l'aire le long de l'axe.`} largeur={620} hauteur={200}>
      <line x1={40} x2={590} y1={160} y2={160} stroke={BLEU} strokeWidth={1.5} strokeDasharray="10 4 2 4" />
      <Etiquette x={590} y={178} ancre="end" taille={11}>
        axe de la route (m)
      </Etiquette>
      {aires.map((a, i) => {
        const x = 50 + (i * 520) / (aires.length - 1);
        const h = (a / amax) * 110;
        const l = 18 + (a / amax) * 22;
        return (
          <g key={i}>
            <polygon points={points([[x - l, 160 - h * 0.15], [x - l * 0.6, 160 - h], [x + l * 0.6, 160 - h], [x + l, 160 - h * 0.15], [x, 160]])} fill={TERRE} opacity={0.3} stroke={TERRE} />
            <Etiquette x={x} y={160 - h - 6} ancre="middle" taille={10}>
              {nombre(a, 1)}
            </Etiquette>
            <Etiquette x={x} y={176} ancre="middle" taille={9.5}>
              {String(i * pas)}
            </Etiquette>
          </g>
        );
      })}
      <Etiquette x={40} y={18} taille={11} gras couleur={TERRE}>
        aire de chaque profil (m²)
      </Etiquette>
    </Figure>
  );
}

/** Motif d'une matrice : cases non nulles d'une matrice tridiagonale (creuse). */
export function MatriceCreuse({ n = 12, bande = 1 }: { n?: number; bande?: number }) {
  const c = Math.min(14, 170 / n);
  const x0 = 60;
  const y0 = 15;
  const nz = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => Math.abs(i - j) <= bande)).flat().filter(Boolean).length;
  return (
    <Figure alt={`Motif d'une matrice ${n} × ${n} issue d'une poutre discrétisée : seules les cases proches de la diagonale (en bleu) sont non nulles, ${nz} sur ${n * n}. Une telle matrice creuse se stocke et se résout bien plus vite qu'une matrice pleine.`} largeur={620} hauteur={n * c + 35}>
      {Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (
          <rect key={`${i}-${j}`} x={x0 + j * c} y={y0 + i * c} width={c - 1} height={c - 1} fill={Math.abs(i - j) <= bande ? BLEU : 'var(--color-papier)'} stroke={GRIS} strokeWidth={0.4} opacity={Math.abs(i - j) <= bande ? 0.8 : 1} />
        )),
      )}
      <Etiquette x={x0 + n * c + 30} y={y0 + 30} taille={12} gras couleur={BLEU}>
        {`${nz} cases non nulles`}
      </Etiquette>
      <Etiquette x={x0 + n * c + 30} y={y0 + 50} taille={12}>
        {`sur ${n * n}`}
      </Etiquette>
      <Etiquette x={x0 + n * c + 30} y={y0 + 80} taille={10.5}>
        Gauss plein : ≈ n³/3 opérations
      </Etiquette>
      <Etiquette x={x0 + n * c + 30} y={y0 + 98} taille={10.5}>
        Thomas (tridiagonal) : ≈ 8 n
      </Etiquette>
    </Figure>
  );
}

/** Convergence de Jacobi et Gauss-Seidel : résidu à chaque itération (échelle logarithmique). */
export function ConvergenceIterative({ A, b }: { A: readonly (readonly number[])[]; b: readonly number[] }) {
  const j = iteratif(A, b, 'jacobi', 1e-10, 60);
  const s = iteratif(A, b, 'seidel', 1e-10, 60);
  const kmax = Math.max(j.length, s.length);
  const R = repere2D({ x0: 70, y0: 15, l: 470, h: 160, xmin: 0, xmax: kmax, ymin: -10, ymax: 1 });
  const trace = (h: typeof j) => points(h.map((p) => [R.X(p.k), R.Y(Math.max(-10, Math.log10(p.residu)))] as const));
  return (
    <Figure alt={`Résidu du système à chaque itération, en échelle logarithmique : Jacobi atteint 10⁻¹⁰ en ${j.length} itérations, Gauss-Seidel en ${s.length}. Gauss-Seidel utilise tout de suite les valeurs qu'il vient de calculer.`} largeur={620} hauteur={215}>
      <Axes R={R} gradX={Array.from({ length: Math.floor(kmax / 5) }, (_, i) => (i + 1) * 5)} gradY={[]} titreX="itération" titreY="résidu" />
      {[-10, -8, -6, -4, -2, 0].map((e) => (
        <g key={e}>
          <line x1={R.X(0)} x2={R.X(kmax)} y1={R.Y(e)} y2={R.Y(e)} stroke={GRIS} strokeDasharray="2 4" />
          <Etiquette x={R.X(0) - 6} y={R.Y(e) + 4} ancre="end" taille={10}>
            {exposant(e)}
          </Etiquette>
        </g>
      ))}
      <polyline points={trace(j)} fill="none" stroke={TERRE} strokeWidth={2} />
      <polyline points={trace(s)} fill="none" stroke={BLEU} strokeWidth={2} />
      <Etiquette x={R.X(j.length) - 4} y={R.Y(-9.4)} ancre="end" taille={11} gras couleur={TERRE}>
        {`Jacobi : ${j.length}`}
      </Etiquette>
      <Etiquette x={R.X(s.length) + 4} y={R.Y(-8)} taille={11} gras couleur={BLEU}>
        {`Gauss-Seidel : ${s.length}`}
      </Etiquette>
    </Figure>
  );
}

/** Oscillateur : solution exacte, Euler et Runge-Kutta 4 avec le même pas. */
export function EulerRK({ w = 2 * Math.PI, h = 0.01, tmax = 3 }: { w?: number; h?: number; tmax?: number }) {
  const e = oscillateurNumerique(w, 1, h, tmax, 'euler');
  const r = oscillateurNumerique(w, 1, h, tmax, 'rk4');
  const ymax = Math.max(1.2, ...e.pts.map((p) => Math.abs(p.y[0]!))) * 1.05;
  const R = repere2D({ x0: 60, y0: 15, l: 490, h: 170, xmin: 0, xmax: tmax, ymin: -ymax, ymax });
  return (
    <Figure alt={`Oscillation x'' = −ω² x calculée avec un pas de ${n2(h)} s : la solution exacte (vert pointillé) garde une amplitude constante ; Euler (rouge) l'amplifie à chaque pas jusqu'à ${n2(Math.max(...e.pts.map((p) => Math.abs(p.y[0]!))))} ; Runge-Kutta 4 (bleu) reste superposé à l'exacte (erreur finale ${nombre(r.erreur, 6)}).`} largeur={620} hauteur={235}>
      <Axes R={R} gradX={Array.from({ length: Math.floor(tmax) }, (_, i) => i + 1)} gradY={[-1, 1]} titreX="t (s)" titreY="x" />
      <Courbe R={R} f={e.exacte} de={0} a={tmax} couleur={VERT} epaisseur={2.5} pointilles n={300} />
      <polyline points={points(e.pts.map((p) => [R.X(p.t), R.Y(Math.max(-ymax, Math.min(ymax, p.y[0]!)))] as const))} fill="none" stroke={ROUGE} strokeWidth={1.6} />
      <polyline points={points(r.pts.map((p) => [R.X(p.t), R.Y(p.y[0]!)] as const))} fill="none" stroke={BLEU} strokeWidth={1.4} />
      <Etiquette x={150} y={228} ancre="middle" taille={11} gras couleur={ROUGE}>
        — Euler
      </Etiquette>
      <Etiquette x={310} y={228} ancre="middle" taille={11} gras couleur={BLEU}>
        — Runge-Kutta 4
      </Etiquette>
      <Etiquette x={470} y={228} ancre="middle" taille={11} gras couleur={VERT}>
        - - exacte
      </Etiquette>
    </Figure>
  );
}

/** Les quatre pentes de Runge-Kutta 4 sur un pas. */
export function PentesRK4() {
  const R = repere2D({ x0: 80, y0: 20, l: 440, h: 160, xmin: 0, xmax: 1, ymin: 0, ymax: 1.2 });
  const y = (t: number) => 0.3 + 0.6 * t + 0.3 * t * t;
  const pente = (t: number, yy: number, m: number, c: string, nom: string, dy: number) => (
    <g>
      <line x1={R.X(t - 0.08)} y1={R.Y(yy - 0.08 * m)} x2={R.X(t + 0.08)} y2={R.Y(yy + 0.08 * m)} stroke={c} strokeWidth={2.5} />
      <circle cx={R.X(t)} cy={R.Y(yy)} r={3.5} fill={c} />
      <Etiquette x={R.X(t)} y={R.Y(yy) + dy} ancre="middle" taille={11} gras couleur={c}>
        {nom}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="Les quatre pentes de Runge-Kutta 4 sur un pas h : k1 au début du pas, k2 et k3 au milieu (k2 avec la pente k1, k3 avec la pente k2), k4 à la fin. On avance avec la moyenne pondérée (k1 + 2 k2 + 2 k3 + k4)/6, bien plus fidèle que la seule pente du début (Euler)." largeur={620} hauteur={215}>
      <Axes R={R} gradX={[]} gradY={[]} titreX="t" titreY="y" />
      <Courbe R={R} f={y} de={0} a={1} couleur={VERT} epaisseur={2} pointilles />
      <line x1={R.X(0)} x2={R.X(0)} y1={R.Y(0)} y2={R.Y(1.2)} stroke={GRIS} strokeDasharray="3 3" />
      <line x1={R.X(1)} x2={R.X(1)} y1={R.Y(0)} y2={R.Y(1.2)} stroke={GRIS} strokeDasharray="3 3" />
      <line x1={R.X(0.5)} x2={R.X(0.5)} y1={R.Y(0)} y2={R.Y(1.2)} stroke={GRIS} strokeDasharray="1 4" />
      <Etiquette x={R.X(0)} y={R.Y(0) + 16} ancre="middle" taille={11}>
        t
      </Etiquette>
      <Etiquette x={R.X(0.5)} y={R.Y(0) + 16} ancre="middle" taille={11}>
        t + h/2
      </Etiquette>
      <Etiquette x={R.X(1)} y={R.Y(0) + 16} ancre="middle" taille={11}>
        t + h
      </Etiquette>
      {pente(0, 0.3, 0.6, ROUGE, 'k1', -10)}
      {pente(0.5, 0.6, 0.95, TERRE, 'k2', 24)}
      {pente(0.5, 0.675, 0.9, BLEU, 'k3', -12)}
      {pente(1, 1.2 - 0.02, 1.2, VERT, 'k4', 20)}
      <line x1={R.X(0)} y1={R.Y(0.3)} x2={R.X(1)} y2={R.Y(0.9)} stroke={ROUGE} strokeDasharray="5 3" />
      <Etiquette x={R.X(1) - 6} y={R.Y(0.9) + 16} ancre="end" taille={10.5} couleur={ROUGE}>
        Euler : pente k1 seule
      </Etiquette>
    </Figure>
  );
}

/** Poutre discrétisée en différences finies : nœuds, pas h et molécule de calcul. */
export function GrilleDF({ n = 6, L = 6 }: { n?: number; L?: number }) {
  const x0 = 60;
  const l = 500;
  const X = (i: number) => x0 + (i * l) / n;
  const yb = 90;
  return (
    <Figure alt={`Une poutre de ${n2(L)} m découpée en ${n} intervalles de h = ${n2(L / n)} m. En chaque nœud intérieur i, on remplace la dérivée seconde par (y(i−1) − 2 y(i) + y(i+1))/h², ce qui donne une équation par nœud ; les appuis imposent y = 0 aux extrémités. On obtient ${n - 1} équations à ${n - 1} inconnues, tridiagonales.`} largeur={620} hauteur={200}>
      <line x1={X(0)} x2={X(n)} y1={yb} y2={yb} stroke={BLEU} strokeWidth={4} />
      {[0, n].map((i) => (
        <polygon key={i} points={points([[X(i), yb + 3], [X(i) - 10, yb + 20], [X(i) + 10, yb + 20]])} fill="none" stroke={BLEU} strokeWidth={1.5} />
      ))}
      {Array.from({ length: n + 1 }, (_, i) => (
        <g key={i}>
          <circle cx={X(i)} cy={yb} r={5} fill={i === 0 || i === n ? GRIS : ROUGE} />
          <Etiquette x={X(i)} y={yb - 12} ancre="middle" taille={11}>
            {String(i)}
          </Etiquette>
        </g>
      ))}
      <Cote x1={X(2)} y1={yb + 30} x2={X(3)} y2={yb + 30} texte="h" decalage={10} />
      <rect x={X(2) - 16} y={yb - 32} width={X(4) - X(2) + 32} height={52} rx={10} fill="none" stroke={TERRE} strokeWidth={1.6} strokeDasharray="5 3" />
      <Etiquette x={X(3)} y={yb + 70} ancre="middle" taille={12} gras couleur={TERRE}>
        {'(y₂ − 2 y₃ + y₄) / h² = −M(x₃) / EI'}
      </Etiquette>
      <Etiquette x={X(0)} y={yb + 40} ancre="middle" taille={10.5} couleur={GRIS}>
        y₀ = 0
      </Etiquette>
      <Etiquette x={X(n)} y={yb + 40} ancre="middle" taille={10.5} couleur={GRIS}>
        {`y${'₀₁₂₃₄₅₆₇₈₉'[n] ?? ''} = 0`}
      </Etiquette>
    </Figure>
  );
}

/** Déformée par différences finies comparée à la déformée exacte. */
export function DeformeeDF({ d }: { d: DonneesDF }) {
  const r = deformeeDF(d);
  const fmax = r.fExact * 1.25;
  const R = repere2D({ x0: 60, y0: 20, l: 490, h: 150, xmin: 0, xmax: d.L, ymin: -fmax * 1000, ymax: 0.2 * fmax * 1000 });
  return (
    <Figure alt={`Flèche d'une poutre de ${n2(d.L)} m sous ${n2(d.q)} kN/m : déformée exacte (vert) et valeurs par différences finies avec ${d.n} intervalles (points rouges). Au milieu : ${n2(r.fDF * 1000)} mm par différences finies, ${n2(r.fExact * 1000)} mm exactement, soit ${nombre(r.erreur * 100, 1)} % d'écart.`} largeur={620} hauteur={200}>
      <Axes R={R} gradX={Array.from({ length: Math.floor(d.L) }, (_, i) => i + 1)} gradY={[]} titreX="x (m)" titreY="flèche (mm)" />
      <Courbe R={R} f={(x) => -r.exacte(x) * 1000} de={0} a={d.L} couleur={VERT} epaisseur={2.2} />
      {r.x.map((x, i) => (
        <circle key={i} cx={R.X(x)} cy={R.Y(-r.y[i]! * 1000)} r={4.5} fill={ROUGE} />
      ))}
      <Etiquette x={R.X(d.L / 2)} y={R.Y(-r.fDF * 1000) + 20} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        {`DF : ${n2(r.fDF * 1000)} mm ; exacte : ${n2(r.fExact * 1000)} mm`}
      </Etiquette>
    </Figure>
  );
}

/** Phénomène de Runge : polynôme de Lagrange par 5 points équidistants de 1/(1 + 25x²). */
export function PhenomeneRunge() {
  const xs = [-1, -0.5, 0, 0.5, 1];
  const f = (x: number) => 1 / (1 + 25 * x * x);
  const ys = xs.map(f);
  const P = (x: number) => lagrange(xs, ys, x);
  const R = repere2D({ x0: 60, y0: 15, l: 490, h: 165, xmin: -1.05, xmax: 1.05, ymin: -0.5, ymax: 1.1 });
  return (
    <Figure alt={`La fonction 1/(1 + 25 x²) (vert) et son polynôme de Lagrange par 5 points équidistants (rouge) : il passe exactement par les points mais oscille entre eux, jusqu'à ${n2(P(0.85))} en x = 0,85 au lieu de ${n2(f(0.85))}. Plus on ajoute de points équidistants, pire c'est aux bords.`} largeur={620} hauteur={215}>
      <Axes R={R} gradX={[-1, -0.5, 0.5, 1]} gradY={[0.5, 1]} titreX="x" titreY="y" decX={1} decY={1} />
      <Courbe R={R} f={f} de={-1.05} a={1.05} couleur={VERT} epaisseur={2.2} n={200} />
      <Courbe R={R} f={P} de={-1.05} a={1.05} couleur={ROUGE} epaisseur={2} n={200} />
      {xs.map((x, i) => (
        <circle key={i} cx={R.X(x)} cy={R.Y(ys[i]!)} r={4} fill={BLEU} />
      ))}
      <Etiquette x={R.X(0.85) + 6} y={R.Y(P(0.85)) - 6} taille={11} gras couleur={ROUGE}>
        Lagrange
      </Etiquette>
      <Etiquette x={R.X(0.15)} y={R.Y(0.95)} taille={11} gras couleur={VERT}>
        fonction
      </Etiquette>
    </Figure>
  );
}
