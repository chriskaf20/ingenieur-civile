// Schémas du module L2.5 (résistance des matériaux II). Les valeurs viennent de lib/calc/rdm2.ts.

import { useId } from 'react';
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Axes, Courbe, repere2D } from '@/components/drawing/Graphe';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { COEFF_LF, deuxTravees, etatPlan, flexionComposee, flexionDeviee, ligneElastique, pressionSemelle, type Liaisons } from '@/lib/calc/rdm2';
import type { DonneesPoutreIso } from '@/lib/calc/rdm1';
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

/** Poutre et sa déformée (exagérée), avec la flèche maximale et les rotations aux appuis. */
export function LigneElastique({ d, EI, titre = 'Poutre' }: { d: DonneesPoutreIso; EI: number; titre?: string }) {
  const r = ligneElastique(d, EI, 300);
  const fmax = Math.max(...r.y.map(Math.abs), 1e-9);
  const x0 = 70;
  const l = 480;
  const X = (x: number) => x0 + (x / d.L) * l;
  const y0 = 80;
  const k = 70 / fmax;
  return (
    <Figure alt={`${titre} de ${n2(d.L)} m, EI = ${nombre(EI, 0)} kN·m². Déformée exagérée : flèche maximale ${n2(r.f * 1000)} mm à x = ${n2(r.xf)} m ; rotations aux appuis ${nombre(r.rotA * 1000, 2)} et ${nombre(r.rotB * 1000, 2)} millièmes de radian.`} largeur={620} hauteur={190}>
      <line x1={X(0)} x2={X(d.L)} y1={y0} y2={y0} stroke={GRIS} strokeDasharray="6 4" />
      {[d.xA, d.xB].map((xa, i) => (
        <polygon key={i} points={points([[X(xa), y0 + 3], [X(xa) - 9, y0 + 18], [X(xa) + 9, y0 + 18]])} fill="none" stroke={BLEU} strokeWidth={1.4} />
      ))}
      <polyline points={points(r.x.map((x, i) => [X(x), y0 + r.y[i]! * k] as const))} fill="none" stroke={BLEU} strokeWidth={3} />
      <line x1={X(r.xf)} x2={X(r.xf)} y1={y0} y2={y0 + r.f * k} stroke={ROUGE} strokeWidth={1.4} />
      <Etiquette x={X(r.xf) + 6} y={y0 + r.f * k + 18} taille={11.5} gras couleur={ROUGE}>
        {`f = ${n2(r.f * 1000)} mm`}
      </Etiquette>
      <line x1={X(d.xA)} y1={y0} x2={X(d.xA) + 60} y2={y0 + r.rotA * k * 60 * (d.L / l)} stroke={TERRE} strokeDasharray="4 3" />
      <Etiquette x={X(d.xA) + 64} y={y0 - 6} taille={10.5} couleur={TERRE}>
        {`θA = ${nombre(r.rotA * 1000, 2)} mrad`}
      </Etiquette>
      <Etiquette x={560} y={30} ancre="end" taille={10.5} couleur={GRIS}>
        déformée exagérée
      </Etiquette>
    </Figure>
  );
}

/** Quatre cas du formulaire de flèches. */
export function FormulaireFleches() {
  const cas = [
    { t: 'deux appuis, q uniforme', f: '5 q L⁴ / (384 EI)', console: false, ponct: false },
    { t: 'deux appuis, P au milieu', f: 'P L³ / (48 EI)', console: false, ponct: true },
    { t: 'console, q uniforme', f: 'q L⁴ / (8 EI)', console: true, ponct: false },
    { t: 'console, P en bout', f: 'P L³ / (3 EI)', console: true, ponct: true },
  ];
  return (
    <Figure alt="Formulaire des flèches maximales : poutre sur deux appuis sous charge uniforme 5qL⁴/384EI ; sous force centrée PL³/48EI ; console sous charge uniforme qL⁴/8EI ; console avec force en bout PL³/3EI." largeur={620} hauteur={250}>
      {cas.map((c, i) => {
        const x = 20 + (i % 2) * 300;
        const y = 15 + Math.floor(i / 2) * 118;
        const xs = Array.from({ length: 21 }, (_, j) => j / 20);
        const def = (u: number) => (c.console ? (c.ponct ? (u * u * (3 - u)) / 2 : (u * u * (6 - 4 * u + u * u)) / 3) : c.ponct ? (u < 0.5 ? 3 * u - 4 * u ** 3 : 3 * (1 - u) - 4 * (1 - u) ** 3) : (16 / 5) * (u - 2 * u ** 3 + u ** 4));
        return (
          <g key={i}>
            <rect x={x} y={y} width={280} height={108} rx={8} fill="var(--color-papier)" stroke={GRIS} />
            <Etiquette x={x + 140} y={y + 18} ancre="middle" taille={11} gras>
              {c.t}
            </Etiquette>
            <line x1={x + 30} x2={x + 250} y1={y + 45} y2={y + 45} stroke={GRIS} strokeDasharray="4 3" />
            <polyline points={points(xs.map((u) => [x + 30 + u * 220, y + 45 + def(u) * 25] as const))} fill="none" stroke={BLEU} strokeWidth={2.4} />
            {c.console ? <rect x={x + 22} y={y + 30} width={8} height={30} fill={GRIS} /> : null}
            {!c.console
              ? [0, 1].map((j) => <polygon key={j} points={points([[x + 30 + j * 220, y + 47], [x + 23 + j * 220, y + 58], [x + 37 + j * 220, y + 58]])} fill="none" stroke={BLEU} />)
              : null}
            <Etiquette x={x + 140} y={y + 95} ancre="middle" taille={12.5} gras couleur={ROUGE}>
              {`f = ${c.f}`}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Superposition : la flèche totale est la somme des flèches de chaque cas. */
export function Superposition({ f1, f2, t1, t2 }: { f1: number; f2: number; t1: string; t2: string }) {
  const tot = f1 + f2;
  const k = 120 / tot;
  const bloc = (x: number, f: number, t: string, c: string) => (
    <g>
      <rect x={x} y={180 - f * k} width={90} height={f * k} fill={c} opacity={0.4} stroke={c} />
      <Etiquette x={x + 45} y={180 - f * k - 6} ancre="middle" taille={11.5} gras couleur={c}>
        {`${n2(f * 1000)} mm`}
      </Etiquette>
      <Etiquette x={x + 45} y={198} ancre="middle" taille={10.5}>
        {t}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt={`Principe de superposition : la flèche due à ${t1} (${n2(f1 * 1000)} mm) et celle due à ${t2} (${n2(f2 * 1000)} mm) s'additionnent : ${n2(tot * 1000)} mm au total. Valable en élasticité linéaire.`} largeur={620} hauteur={210}>
      {bloc(60, f1, t1, TERRE)}
      <Etiquette x={185} y={130} ancre="middle" taille={22} gras>
        +
      </Etiquette>
      {bloc(225, f2, t2, ROUGE)}
      <Etiquette x={350} y={130} ancre="middle" taille={22} gras>
        =
      </Etiquette>
      {bloc(400, tot, 'total', BLEU)}
    </Figure>
  );
}

/** Console sous P en bout : diagramme de moment triangulaire et énergie de déformation. */
export function EnergieConsole({ P, L, U }: { P: number; L: number; U: number }) {
  const x0 = 110;
  const l = 420;
  return (
    <Figure alt={`Console de ${n2(L)} m chargée par ${n1(P)} kN en bout. Le moment varie linéairement de 0 au bout à P L = ${n2(P * L)} kN·m à l'encastrement. L'énergie de déformation emmagasinée, U = ∫ M²/(2EI) dx, vaut ${nombre(U * 1000, 1)} J ; sa dérivée par rapport à P donne la flèche (Castigliano).`} largeur={620} hauteur={200}>
      <rect x={x0 - 14} y={30} width={14} height={60} fill={GRIS} />
      <line x1={x0} x2={x0 + l} y1={60} y2={60} stroke={BLEU} strokeWidth={4} />
      <Fleche x1={x0 + l} y1={10} x2={x0 + l} y2={56} couleur={ROUGE} epaisseur={2.4} />
      <Etiquette x={x0 + l - 8} y={22} ancre="end" taille={11.5} gras couleur={ROUGE}>
        {`P = ${n1(P)} kN`}
      </Etiquette>
      <polygon points={points([[x0, 110], [x0 + l, 110], [x0, 170]])} fill={ROUGE} opacity={0.15} stroke={ROUGE} />
      <Etiquette x={x0 + 6} y={186} taille={11} gras couleur={ROUGE}>
        {`M = −P L = −${n2(P * L)} kN·m`}
      </Etiquette>
      <Etiquette x={x0 + l / 2} y={140} ancre="middle" taille={11.5} couleur={BLEU}>
        {`U = ∫ M²/(2EI) dx = ${nombre(U * 1000, 1)} J`}
      </Etiquette>
      <Cote x1={x0} y1={90} x2={x0 + l} y2={90} texte={`L = ${n2(L)} m`} decalage={-8} />
    </Figure>
  );
}

/** Noyau central d'un rectangle : losange dans lequel N doit passer pour que toute la section reste comprimée. */
export function NoyauCentral({ b, h, e }: { b: number; h: number; e?: number }) {
  const k = Math.min(4, 180 / h, 260 / b);
  const cx = 200;
  const cy = 110;
  return (
    <Figure alt={`Section rectangulaire ${n1(b)} × ${n1(h)} cm et son noyau central, losange de demi-diagonales h/6 = ${n2(h / 6)} cm et b/6 = ${n2(b / 6)} cm. Si l'effort normal passe dans le noyau, toute la section est comprimée.${e !== undefined ? ` Ici l'excentricité vaut ${n2(e)} cm : ${Math.abs(e) <= h / 6 ? 'dans le noyau' : 'hors du noyau, une partie de la section est tendue'}.` : ''}`} largeur={620} hauteur={220}>
      <rect x={cx - (b * k) / 2} y={cy - (h * k) / 2} width={b * k} height={h * k} fill="var(--color-beton-clair)" stroke={BLEU} strokeWidth={1.4} />
      <polygon points={points([[cx, cy - (h / 6) * k], [cx + (b / 6) * k, cy], [cx, cy + (h / 6) * k], [cx - (b / 6) * k, cy]])} fill={VERT} opacity={0.35} stroke={VERT} strokeWidth={1.6} />
      <circle cx={cx} cy={cy} r={3} fill={BLEU} />
      {e !== undefined ? (
        <g>
          <circle cx={cx} cy={cy - e * k} r={6} fill={Math.abs(e) <= h / 6 ? VERT : ROUGE} />
          <Etiquette x={cx + 10} y={cy - e * k + 4} taille={11.5} gras couleur={Math.abs(e) <= h / 6 ? VERT : ROUGE}>
            {`N (e = ${n2(e)} cm)`}
          </Etiquette>
        </g>
      ) : null}
      <Etiquette x={400} y={70} taille={12} gras couleur={VERT}>
        noyau central
      </Etiquette>
      <Etiquette x={400} y={92} taille={11}>
        {`± h/6 = ${n2(h / 6)} cm`}
      </Etiquette>
      <Etiquette x={400} y={112} taille={11}>
        {`± b/6 = ${n2(b / 6)} cm`}
      </Etiquette>
      <Etiquette x={400} y={150} taille={10.5} couleur={GRIS}>
        N dans le noyau : section entièrement comprimée
      </Etiquette>
    </Figure>
  );
}

/** Flexion composée : diagramme de N, diagramme de M, somme. */
export function DiagrammeComposee({ N, M, b, h }: { N: number; M: number; b: number; h: number }) {
  const r = flexionComposee({ N, M, b, h });
  const sm = Math.max(Math.abs(r.s1), Math.abs(r.s2), Math.abs(r.sN) + Math.abs(r.sM)) || 1;
  const k = 60 / sm;
  const H = 140;
  const y0 = 30;
  const bloc = (x: number, sh: number, sb: number, t: string) => (
    <g>
      <line x1={x} x2={x} y1={y0} y2={y0 + H} stroke={BLEU} />
      <polygon points={points([[x, y0], [x + sh * k, y0], [x + sb * k, y0 + H], [x, y0 + H]])} fill={sh < 0 || sb < 0 ? ROUGE : BLEU} opacity={0.25} stroke={GRIS} />
      <Etiquette x={x + sh * k} y={y0 - 6} ancre="middle" taille={10.5}>
        {n2(sh)}
      </Etiquette>
      <Etiquette x={x + sb * k} y={y0 + H + 14} ancre="middle" taille={10.5}>
        {n2(sb)}
      </Etiquette>
      <Etiquette x={x} y={y0 + H + 34} ancre="middle" taille={11} gras>
        {t}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt={`Section ${n1(b)} × ${n1(h)} cm sous N = ${n1(N)} kN (compression) et M = ${n1(M)} kN·m. Effort normal seul : ${n2(r.sN)} MPa partout. Moment seul : ∓${n2(r.sM)} MPa. Somme : ${n2(r.s1)} MPa d'un côté, ${n2(r.s2)} MPa de l'autre (compression négative).`} largeur={620} hauteur={225}>
      {bloc(120, r.sN, r.sN, 'N seul')}
      <Etiquette x={210} y={y0 + H / 2} ancre="middle" taille={20} gras>
        +
      </Etiquette>
      {bloc(300, -r.sM, r.sM, 'M seul')}
      <Etiquette x={390} y={y0 + H / 2} ancre="middle" taille={20} gras>
        =
      </Etiquette>
      {bloc(500, r.s1, r.s2, 'N + M')}
    </Figure>
  );
}

/** Semelle sous N et M : diagramme des pressions sur le sol (trapèze ou triangle). */
export function SemellePression({ N, M, B, L }: { N: number; M: number; B: number; L: number }) {
  const r = pressionSemelle(N, M, B, L);
  const p = pid('sp', useId());
  const x0 = 150;
  const l = 320;
  const k = 70 / r.qmax;
  const ys = 120;
  return (
    <Figure alt={`Semelle de ${n2(B)} m sous N = ${n1(N)} kN et M = ${n1(M)} kN·m : excentricité ${n2(r.e)} m (tiers central ±${n2(B / 6)} m). ${r.decollement ? `Hors du tiers central : la semelle se soulève, seuls ${n2(r.largeurComprimee)} m appuient, pression maximale ${n1(r.qmax)} kPa.` : `Pressions de ${n1(r.qmin)} à ${n1(r.qmax)} kPa (trapèze).`}`} largeur={620} hauteur={230}>
      <Hachures prefixe={p} types={['ba', 'terre']} />
      <rect x={290} y={20} width={40} height={60} fill={hachure(p, 'ba')} stroke={GRIS} />
      <rect x={x0} y={80} width={l} height={40} fill={hachure(p, 'ba')} stroke={GRIS} />
      <Fleche x1={310} y1={0} x2={310} y2={18} couleur={ROUGE} epaisseur={2.4} />
      <Etiquette x={318} y={12} taille={11} gras couleur={ROUGE}>
        {`N = ${n1(N)} kN ; M = ${n1(M)} kN·m`}
      </Etiquette>
      <polygon points={points(r.decollement ? [[x0 + l, ys], [x0 + l, ys + r.qmax * k], [x0 + l - (r.largeurComprimee / B) * l, ys]] : [[x0, ys], [x0, ys + r.qmin * k], [x0 + l, ys + r.qmax * k], [x0 + l, ys]])} fill={TERRE} opacity={0.4} stroke={TERRE} />
      <Etiquette x={x0 + l + 6} y={ys + r.qmax * k} taille={11.5} gras couleur={TERRE}>
        {`${n1(r.qmax)} kPa`}
      </Etiquette>
      <Etiquette x={x0 - 6} y={ys + r.qmin * k + 4} ancre="end" taille={11.5} gras couleur={TERRE}>
        {`${n1(r.qmin)} kPa`}
      </Etiquette>
      <line x1={x0 + l / 3} x2={x0 + l / 3} y1={75} y2={200} stroke={GRIS} strokeDasharray="3 3" />
      <line x1={x0 + (2 * l) / 3} x2={x0 + (2 * l) / 3} y1={75} y2={200} stroke={GRIS} strokeDasharray="3 3" />
      <Etiquette x={x0 + l / 2} y={190} ancre="middle" taille={10.5} couleur={GRIS}>
        tiers central
      </Etiquette>
      <Cote x1={x0} y1={205} x2={x0 + l} y2={205} texte={`B = ${n2(B)} m`} decalage={0} />
    </Figure>
  );
}

/** Flexion déviée : contraintes aux quatre coins et axe neutre incliné. */
export function FlexionDevieeSection({ My, Mz, b, h, N = 0 }: { My: number; Mz: number; b: number; h: number; N?: number }) {
  const r = flexionDeviee(My, Mz, b, h, N);
  const k = Math.min(4, 170 / h, 200 / b);
  const cx = 220;
  const cy = 110;
  const pos = [
    [cx - (b * k) / 2, cy - (h * k) / 2],
    [cx + (b * k) / 2, cy - (h * k) / 2],
    [cx + (b * k) / 2, cy + (h * k) / 2],
    [cx - (b * k) / 2, cy + (h * k) / 2],
  ] as const;
  // axe neutre : s0 + sy (2y/h) − sz (2z/b) = 0 (y vers le bas, z vers la droite)
  const yNeutre = (z: number) => ((r.sz * (2 * z) / b - r.s0) * (h / 2)) / r.sy;
  return (
    <Figure alt={`Rectangle ${n1(b)} × ${n1(h)} cm sous My = ${n1(My)} kN·m et Mz = ${n1(Mz)} kN·m${N ? ` et N = ${n1(N)} kN` : ''}. Contraintes aux coins : ${r.coins.map((c) => `${c.nom} ${n2(c.s)} MPa`).join(', ')}. L'axe neutre est incliné ; le coin le plus tendu est opposé au plus comprimé.`} largeur={620} hauteur={225}>
      <rect x={pos[0][0]} y={pos[0][1]} width={b * k} height={h * k} fill="var(--color-beton-clair)" stroke={BLEU} strokeWidth={1.4} />
      {r.sy !== 0 ? <line x1={cx - (b * k) / 2 - 20} y1={cy + yNeutre(-b / 2 - 20 / k) * k} x2={cx + (b * k) / 2 + 20} y2={cy + yNeutre(b / 2 + 20 / k) * k} stroke={TERRE} strokeDasharray="8 4" strokeWidth={1.6} /> : null}
      {r.coins.map((c, i) => (
        <g key={i}>
          <circle cx={pos[i]![0]} cy={pos[i]![1]} r={5} fill={c.s < 0 ? ROUGE : BLEU} />
          <Etiquette x={pos[i]![0] + (i === 0 || i === 3 ? -8 : 8)} y={pos[i]![1] + (i < 2 ? -8 : 18)} ancre={i === 0 || i === 3 ? 'end' : 'start'} taille={11} gras couleur={c.s < 0 ? ROUGE : BLEU}>
            {`${n2(c.s)} MPa`}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={470} y={60} taille={11} couleur={TERRE}>
        axe neutre incliné
      </Etiquette>
      <Etiquette x={470} y={85} taille={11}>
        {`σ = N/A ± My/Wy ± Mz/Wz`}
      </Etiquette>
    </Figure>
  );
}

/** Élément carré avec σx, σy, τxy, et l'élément tourné sur les directions principales. */
export function ElementContraintes({ sx, sy, txy }: { sx: number; sy: number; txy: number }) {
  const e = etatPlan(sx, sy, txy);
  const c1 = [150, 110] as const;
  const c2 = [460, 110] as const;
  const a = 45;
  const rot = (cx: number, cy: number, deg: number) => {
    const t = (deg * Math.PI) / 180;
    return points(
      [
        [-a, -a],
        [a, -a],
        [a, a],
        [-a, a],
      ].map(([u, v]) => [cx + u! * Math.cos(t) + v! * Math.sin(t), cy - u! * Math.sin(t) + v! * Math.cos(t)] as const),
    );
  };
  return (
    <Figure alt={`Élément de matière sous σx = ${n1(sx)} MPa, σy = ${n1(sy)} MPa et τxy = ${n1(txy)} MPa. Tourné de ${n1(e.theta)}°, il ne subit plus que des contraintes normales : les contraintes principales σ1 = ${n1(e.s1)} MPa et σ2 = ${n1(e.s2)} MPa, sans cisaillement.`} largeur={620} hauteur={225}>
      <polygon points={rot(c1[0], c1[1], 0)} fill="var(--color-beton-clair)" stroke={BLEU} strokeWidth={1.4} />
      <Fleche x1={c1[0] + a} y1={c1[1]} x2={c1[0] + a + 40} y2={c1[1]} couleur={BLEU} epaisseur={2} />
      <Fleche x1={c1[0] - a} y1={c1[1]} x2={c1[0] - a - 40} y2={c1[1]} couleur={BLEU} epaisseur={2} />
      <Fleche x1={c1[0]} y1={c1[1] - a} x2={c1[0]} y2={c1[1] - a - 30} couleur={BLEU} epaisseur={2} />
      <Fleche x1={c1[0] - 25} y1={c1[1] - a - 5} x2={c1[0] + 25} y2={c1[1] - a - 5} couleur={TERRE} epaisseur={1.6} />
      <Fleche x1={c1[0] + a + 5} y1={c1[1] + 25} x2={c1[0] + a + 5} y2={c1[1] - 25} couleur={TERRE} epaisseur={1.6} />
      <Etiquette x={c1[0] + a + 44} y={c1[1] + 4} taille={11} couleur={BLEU}>
        {`σx = ${n1(sx)}`}
      </Etiquette>
      <Etiquette x={c1[0] + 6} y={c1[1] - a - 34} taille={11} couleur={BLEU}>
        {`σy = ${n1(sy)}`}
      </Etiquette>
      <Etiquette x={c1[0] + a + 10} y={c1[1] + 40} taille={11} couleur={TERRE}>
        {`τ = ${n1(txy)}`}
      </Etiquette>
      <Fleche x1={290} y1={110} x2={350} y2={110} couleur={GRIS} epaisseur={1.6} />
      <Etiquette x={320} y={100} ancre="middle" taille={10.5}>
        {`tourner de ${n1(e.theta)}°`}
      </Etiquette>
      <polygon points={rot(c2[0], c2[1], e.theta)} fill="var(--color-beton-clair)" stroke={VERT} strokeWidth={1.6} />
      <Etiquette x={c2[0]} y={200} ancre="middle" taille={11.5} gras couleur={VERT}>
        {`σ1 = ${n1(e.s1)} ; σ2 = ${n1(e.s2)} MPa ; τ = 0`}
      </Etiquette>
    </Figure>
  );
}

/** Les quatre cas d'Euler : modes de flambement et longueurs de flambement. */
export function CasEuler({ actif }: { actif?: Liaisons }) {
  const cas = Object.keys(COEFF_LF) as Liaisons[];
  return (
    <Figure alt={`Les quatre cas de flambement d'Euler selon les liaisons : ${cas.map((c) => `${c}, Lf = ${nombre(COEFF_LF[c], 1)} L`).join(' ; ')}. Plus les extrémités sont tenues, plus la longueur de flambement est courte et la charge critique élevée.`} largeur={620} hauteur={250}>
      {cas.map((c, i) => {
        const x = 80 + i * 150;
        const H = 160;
        const yb = 200;
        const mode = (u: number) => {
          if (c === 'articulé-articulé') return Math.sin(Math.PI * u);
          if (c === 'encastré-encastré') return (1 - Math.cos(2 * Math.PI * u)) / 2;
          if (c === 'encastré-libre') return 1 - Math.cos((Math.PI * u) / 2);
          return u * u * (1 - u);
        };
        const us = Array.from({ length: 31 }, (_, j) => j / 30);
        const am = Math.max(...us.map((u) => Math.abs(mode(u))));
        const on = actif === c;
        return (
          <g key={c} opacity={actif && !on ? 0.45 : 1}>
            <line x1={x} x2={x} y1={yb} y2={yb - H} stroke={GRIS} strokeDasharray="4 3" />
            <polyline points={points(us.map((u) => [x + (mode(u) / am) * 26, yb - u * H] as const))} fill="none" stroke={on ? ROUGE : BLEU} strokeWidth={2.4} />
            <rect x={x - 14} y={yb} width={28} height={6} fill={c.startsWith('encastré') ? GRIS : 'none'} stroke={GRIS} />
            {c.endsWith('libre') ? null : <rect x={x - 14} y={yb - H - 6} width={28} height={6} fill={c.endsWith('encastré') ? GRIS : 'none'} stroke={GRIS} />}
            <Fleche x1={x} y1={yb - H - 34} x2={x} y2={yb - H - 8} couleur={ROUGE} epaisseur={2} />
            <Etiquette x={x} y={yb + 22} ancre="middle" taille={10.5}>
              {c}
            </Etiquette>
            <Etiquette x={x} y={yb + 40} ancre="middle" taille={12} gras couleur={on ? ROUGE : BLEU}>
              {`Lf = ${nombre(COEFF_LF[c], 1)} L`}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Contrainte critique d'Euler en fonction de l'élancement, avec la limite du matériau. */
export function CourbeEuler({ E, fy, lambda }: { E: number; fy: number; lambda?: number }) {
  const R = repere2D({ x0: 70, y0: 20, l: 470, h: 160, xmin: 0, xmax: 250, ymin: 0, ymax: fy * 1.4 });
  const scr = (l: number) => (Math.PI ** 2 * E) / (l * l);
  const lLim = Math.PI * Math.sqrt(E / fy);
  return (
    <Figure alt={`Contrainte critique d'Euler σcr = π² E/λ² en fonction de l'élancement λ (E = ${nombre(E, 0)} MPa), limitée par la résistance du matériau (${nombre(fy, 0)} MPa). Les deux courbes se croisent pour λ = ${nombre(lLim, 0)} : au-dessous, la pièce s'écrase ; au-dessus, elle flambe.${lambda !== undefined ? ` Ici λ = ${nombre(lambda, 0)} : σcr = ${n1(scr(lambda))} MPa.` : ''}`} largeur={620} hauteur={215}>
      <Axes R={R} gradX={[50, 100, 150, 200, 250]} gradY={[fy]} titreX="λ" titreY="σ (MPa)" decX={0} />
      <Courbe R={R} f={(l) => Math.min(scr(Math.max(l, 1)), fy * 1.4)} de={5} a={250} couleur={BLEU} epaisseur={2} pointilles n={200} />
      <Courbe R={R} f={(l) => Math.min(fy, scr(Math.max(l, 1)))} de={0} a={250} couleur={ROUGE} epaisseur={2.6} n={200} />
      <Etiquette x={R.X(lLim) + 6} y={R.Y(fy) - 8} taille={11} couleur={ROUGE}>
        {`λ = ${nombre(lLim, 0)}`}
      </Etiquette>
      <Etiquette x={R.X(170)} y={R.Y(scr(170)) - 10} taille={11} gras couleur={BLEU}>
        Euler : π²E/λ²
      </Etiquette>
      {lambda !== undefined ? <circle cx={R.X(lambda)} cy={R.Y(Math.min(fy, scr(lambda)))} r={5} fill={VERT} /> : null}
    </Figure>
  );
}

/** Poutre continue à deux travées : moment négatif sur l'appui central. */
export function PoutreContinue({ L1, L2, q1, q2 }: { L1: number; L2: number; q1: number; q2: number }) {
  const r = deuxTravees(L1, L2, q1, q2);
  const L = L1 + L2;
  const x0 = 60;
  const l = 500;
  const X = (x: number) => x0 + (x / L) * l;
  const xs = Array.from({ length: 201 }, (_, i) => (i * L) / 200);
  const Mm = Math.max(...xs.map((x) => Math.abs(r.M(x))));
  const yM = 150;
  const k = 55 / Mm;
  return (
    <Figure alt={`Poutre continue sur trois appuis, travées de ${n2(L1)} et ${n2(L2)} m sous ${n1(q1)} et ${n1(q2)} kN/m. Moment sur l'appui central ${n2(r.MB)} kN·m (fibres hautes tendues) ; moment maximal en première travée ${n2(r.Mtravee1)} kN·m. Réactions ${n2(r.RA)}, ${n2(r.RB)} et ${n2(r.RC)} kN : l'appui central reprend la plus grande part.`} largeur={620} hauteur={230}>
      <line x1={X(0)} x2={X(L)} y1={55} y2={55} stroke={BLEU} strokeWidth={4} />
      <rect x={X(0)} y={35} width={X(L) - X(0)} height={14} fill={TERRE} opacity={0.25} />
      {[0, L1, L].map((x, i) => (
        <g key={i}>
          <polygon points={points([[X(x), 58], [X(x) - 9, 73], [X(x) + 9, 73]])} fill="none" stroke={BLEU} strokeWidth={1.4} />
          <Etiquette x={X(x)} y={90} ancre="middle" taille={10.5}>
            {`${['A', 'B', 'C'][i]} : ${n1([r.RA, r.RB, r.RC][i]!)} kN`}
          </Etiquette>
        </g>
      ))}
      <line x1={X(0)} x2={X(L)} y1={yM} y2={yM} stroke={GRIS} />
      <polygon points={points([[X(0), yM], ...xs.map((x) => [X(x), yM + r.M(x) * k] as const), [X(L), yM]])} fill={ROUGE} opacity={0.15} stroke={ROUGE} strokeWidth={1.6} />
      <Etiquette x={X(L1)} y={yM + r.MB * k - 8} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        {`MB = ${n2(r.MB)} kN·m`}
      </Etiquette>
      <Etiquette x={X(r.x1)} y={yM + r.Mtravee1 * k + 16} ancre="middle" taille={11} couleur={ROUGE}>
        {`+${n2(r.Mtravee1)}`}
      </Etiquette>
      <Etiquette x={20} y={yM + 4} taille={12} gras couleur={ROUGE}>
        M
      </Etiquette>
    </Figure>
  );
}

/** Balcon en console : dalle encastrée dans la poutre de rive, garde-corps en bout. */
export function BalconConsole({ L, h, P }: { L: number; h: number; P: number }) {
  const p = pid('bc', useId());
  const k = 280 / L;
  const x0 = 200;
  return (
    <Figure alt={`Balcon en béton armé de ${n2(L)} m de porte-à-faux et ${n1(h)} cm d'épaisseur, encastré dans la poutre de rive du bâtiment, avec un garde-corps de ${n1(P)} kN/m en bout. Le moment est maximal à l'encastrement, fibres supérieures tendues : les armatures principales sont en haut.`} largeur={620} hauteur={220}>
      <Hachures prefixe={p} types={['ba', 'maconnerie']} />
      <rect x={x0 - 60} y={40} width={60} height={160} fill={hachure(p, 'maconnerie')} stroke={GRIS} />
      <rect x={x0 - 60} y={100} width={60} height={50} fill={hachure(p, 'ba')} stroke={GRIS} />
      <rect x={x0} y={100} width={L * k} height={h * 1.2} fill={hachure(p, 'ba')} stroke={BLEU} strokeWidth={1.4} />
      <line x1={x0 - 50} x2={x0 + L * k - 8} y1={104} y2={104} stroke={ROUGE} strokeWidth={2.6} />
      <Etiquette x={x0 + 10} y={95} taille={10.5} couleur={ROUGE}>
        armatures principales en haut
      </Etiquette>
      <rect x={x0 + L * k - 8} y={50} width={6} height={50} fill={GRIS} />
      <Fleche x1={x0 + L * k - 5} y1={20} x2={x0 + L * k - 5} y2={48} couleur={ROUGE} epaisseur={2} />
      <Etiquette x={x0 + L * k - 10} y={24} ancre="end" taille={11} gras couleur={ROUGE}>
        {`garde-corps ${n1(P)} kN/m`}
      </Etiquette>
      <Cote x1={x0} y1={100 + h * 1.2} x2={x0 + L * k} y2={100 + h * 1.2} texte={`L = ${n2(L)} m`} decalage={-24} />
      <Etiquette x={x0 - 30} y={215} ancre="middle" taille={10.5}>
        poutre de rive
      </Etiquette>
    </Figure>
  );
}
