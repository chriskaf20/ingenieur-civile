import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { Niveau, Nord, RepereCoupe } from '@/components/drawing/Reperes';
import { TerrainNaturel } from '@/components/drawing/Terrain';
import type { DonneesPlateforme, ResultatPlateforme } from '@/lib/calc/terrassement';
import { creerRepere, points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

/** Vue en plan de la plateforme : contour, pied de talus, cotes TN et hauteurs aux coins. */
export function PlanPlateforme({ d, r, largeur = 640 }: { d: DonneesPlateforme; r: ResultatPlateforme; largeur?: number }) {
  const o = Math.max(...r.h.map((h) => Math.max(h, 0) * d.m), 0.5);
  const marge = o + 3.2;
  const rep = creerRepere({ xmin: -marge, xmax: d.L + marge, ymin: -marge, ymax: d.l + marge }, largeur, 16);
  const P = (x: number, y: number) => [rep.x(x), rep.y(y)] as const;
  const coins: Array<[number, number, string]> = [
    [0, 0, 'start'],
    [d.L, 0, 'end'],
    [d.L, d.l, 'end'],
    [0, d.l, 'start'],
  ];
  const decalCoin = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ] as const;
  return (
    <Figure
      alt={`Vue en plan d'une plateforme de ${nombre(d.L, 2)} m sur ${nombre(d.l, 2)} m, avec le pied des talus et les hauteurs de remblai aux quatre coins`}
      legende="Vue en plan (le pied de talus est tracé en tirets)"
      largeur={rep.largeur}
      hauteur={rep.hauteur}
      className="mx-auto max-w-[500px]"
    >
      <Hachures prefixe="rp" types={['remblai']} />
      <polygon points={points(r.piedDeTalus.map(([x, y]) => P(x, y)))} fill={hachure('rp', 'remblai')} className="t-cache" />
      <rect x={rep.x(0)} y={rep.y(d.l)} width={rep.lx(d.L)} height={rep.lx(d.l)} fill="var(--color-encre-clair)" className="t-fort" />
      {coins.map(([x, y], i) => {
        const [sx, sy] = decalCoin[i]!;
        const [px, py] = P(x, y);
        const lx = px + sx * (rep.lx(o) + 6);
        const ly = py - sy * (rep.lx(o) + (sy > 0 ? 22 : -10));
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={3.5} fill="var(--color-correction)" />
            <Etiquette x={lx} y={ly} ancre={sx < 0 ? 'end' : 'start'} taille={11.5} gras>
              {i + 1} · TN {nombre(d.tn[i]!, 2)}
            </Etiquette>
            <Etiquette x={lx} y={ly + 13} ancre={sx < 0 ? 'end' : 'start'} taille={11.5} classe="encre">
              h{i + 1} = {nombre(r.h[i]!, 2)} m
            </Etiquette>
          </g>
        );
      })}
      <Etiquette x={rep.x(d.L / 2)} y={rep.y(d.l / 2) - 6} ancre="middle" taille={13} gras>
        Plateforme à {nombre(d.Zp, 2)}
      </Etiquette>
      <Etiquette x={rep.x(d.L / 2)} y={rep.y(d.l / 2) + 10} ancre="middle" taille={11.5}>
        S = {nombre(r.surface, 2)} m²
      </Etiquette>
      <Cote x1={rep.x(0)} y1={rep.y(0)} x2={rep.x(d.L)} y2={rep.y(0)} decalage={-(rep.lx(o) + 30)} texte={`L = ${nombre(d.L, 2)} m`} />
      <Cote x1={rep.x(0)} y1={rep.y(0)} x2={rep.x(0)} y2={rep.y(d.l)} decalage={rep.lx(o) + 26} texte={`l = ${nombre(d.l, 2)} m`} />
      <RepereCoupe x1={rep.x(-o - 1.2)} y1={rep.y(d.l / 2)} x2={rep.x(d.L + o + 1.2)} y2={rep.y(d.l / 2)} nom="A" sens={-1} />
      <Nord x={rep.x(d.L / 2)} y={rep.y(d.l + marge) + 30} taille={13} />
    </Figure>
  );
}

/** Décomposition du volume en plan : prisme sous la plateforme, quatre talus de côté, quatre coins. */
export function DecompositionPlateforme({ d, r, largeur = 640 }: { d: DonneesPlateforme; r: ResultatPlateforme; largeur?: number }) {
  const o = r.h.map((h) => Math.max(h, 0) * d.m) as [number, number, number, number];
  const om = Math.max(...o, 0.5);
  const rep = creerRepere({ xmin: -om - 1, xmax: d.L + om + 1, ymin: -om - 1, ymax: d.l + om + 1 }, largeur, 12);
  const P = (x: number, y: number) => [rep.x(x), rep.y(y)] as const;
  const [o1, o2, o3, o4] = o;
  const cotes = [
    [[0, 0], [d.L, 0], [d.L, -o2], [0, -o1]],
    [[d.L, 0], [d.L, d.l], [d.L + o3, d.l], [d.L + o2, 0]],
    [[d.L, d.l], [0, d.l], [0, d.l + o4], [d.L, d.l + o3]],
    [[0, d.l], [0, 0], [-o1, 0], [-o4, d.l]],
  ] as const;
  const coins = [
    [[0, 0], [-o1, 0], [-o1, -o1], [0, -o1]],
    [[d.L, 0], [d.L, -o2], [d.L + o2, -o2], [d.L + o2, 0]],
    [[d.L, d.l], [d.L + o3, d.l], [d.L + o3, d.l + o3], [d.L, d.l + o3]],
    [[0, d.l], [0, d.l + o4], [-o4, d.l + o4], [-o4, d.l]],
  ] as const;
  const centreCote = [P(d.L / 2, -om / 2 - 0.6), P(d.L + om / 2 + 0.6, d.l / 2), P(d.L / 2, d.l + om / 2 + 0.6), P(-om / 2 - 0.6, d.l / 2)];
  return (
    <Figure
      alt={`Décomposition du remblai : prisme central de ${nombre(r.volumePlateforme, 2)} m³, quatre talus de côté et quatre coins pour ${nombre(r.volumeTalus, 2)} m³`}
      legende="Les trois familles de volumes en vue en plan"
      largeur={rep.largeur}
      hauteur={rep.hauteur}
      className="mx-auto max-w-[500px]"
    >
      {cotes.map((c, i) => (
        <polygon key={i} points={points(c.map(([x, y]) => P(x, y)))} fill="var(--color-terre-clair)" className="t-moyen" />
      ))}
      {coins.map((c, i) => (
        <polygon key={i} points={points(c.map(([x, y]) => P(x, y)))} fill="var(--color-brique-clair)" className="t-moyen" />
      ))}
      <rect x={rep.x(0)} y={rep.y(d.l)} width={rep.lx(d.L)} height={rep.lx(d.l)} fill="var(--color-encre-clair)" className="t-fort" />
      <Etiquette x={rep.x(d.L / 2)} y={rep.y(d.l / 2) - 4} ancre="middle" taille={14} gras classe="encre">
        V<tspan dy={4} fontSize={10}>p</tspan>
        <tspan dy={-4}> = S × h</tspan>
        <tspan dy={4} fontSize={10}>m</tspan>
        <tspan dy={-4}> = {nombre(r.volumePlateforme, 2)} m³</tspan>
      </Etiquette>
      <Etiquette x={rep.x(d.L / 2)} y={rep.y(d.l / 2) + 14} ancre="middle" taille={11.5}>
        prisme sous la plateforme
      </Etiquette>
      {centreCote.map(([x, y], i) => (
        <Etiquette key={i} x={x} y={y + 4} ancre="middle" taille={11}>
          {nombre(r.volumesCotes[i]!, 2)} m³
        </Etiquette>
      ))}
      <Etiquette x={P(-om - 0.6, -om - 0.6)[0]} y={P(-om - 0.6, -om - 0.6)[1] + 14} taille={11}>
        coins : {nombre(r.volumeCoinsTotal, 2)} m³ au total
      </Etiquette>
    </Figure>
  );
}

/** Coupe A-A à mi-largeur : TN, plateforme, talus et remblai, hauteurs exagérées. */
export function CoupePlateforme({ d, r, largeur = 640, prefixe = 'rc' }: { d: DonneesPlateforme; r: ResultatPlateforme; largeur?: number; prefixe?: string }) {
  const zA = (d.tn[0] + d.tn[3]) / 2;
  const zB = (d.tn[1] + d.tn[2]) / 2;
  const hA = Math.max(d.Zp - zA, 0);
  const hB = Math.max(d.Zp - zB, 0);
  const xA = -d.m * hA;
  const xB = d.L + d.m * hB;
  const xmin = Math.min(xA, 0) - 2.5;
  const xmax = Math.max(xB, d.L) + 2.5;
  const zmin = Math.min(zA, zB, d.Zp) - 0.3;
  const zmax = Math.max(d.Zp, zA, zB) + 0.15;
  const base = creerRepere({ xmin, xmax, ymin: zmin, ymax: zmax }, largeur, 24);
  const exag = Math.min(20, Math.max(1, Math.round(150 / ((zmax - zmin) * base.echelle))));
  const rep = creerRepere({ xmin, xmax, ymin: zmin, ymax: zmax }, largeur, 24, exag);
  const P = (x: number, z: number) => [rep.x(x), rep.y(z)] as const;
  const tn: Array<readonly [number, number]> = [P(xmin, zA), P(0, zA), P(d.L, zB), P(xmax, zB)];
  const remblai = [P(xA, zA), P(0, d.Zp), P(d.L, d.Zp), P(xB, zB), P(d.L, zB), P(0, zA)];
  return (
    <Figure
      alt={`Coupe A-A à mi-largeur : le remblai a une hauteur de ${nombre(hA, 2)} m à gauche et ${nombre(hB, 2)} m à droite, talus à ${nombre(d.m, 1)} pour 1`}
      legende={`Coupe A-A · hauteurs exagérées ×${exag}`}
      largeur={rep.largeur}
      hauteur={rep.hauteur + 10}
    >
      <Hachures prefixe={prefixe} types={['remblai', 'terre']} />
      <polygon points={points(remblai)} fill={hachure(prefixe, 'remblai')} className="t-moyen" />
      <TerrainNaturel prefixe={prefixe} pts={tn} />
      <line x1={rep.x(0)} y1={rep.y(d.Zp)} x2={rep.x(d.L)} y2={rep.y(d.Zp)} className="t-fort" stroke="var(--color-encre)" strokeWidth={2.4} />
      <Niveau x={rep.x(d.L * 0.42)} y={rep.y(d.Zp)} texte={`Zp = ${nombre(d.Zp, 2)}`} />
      <Cote x1={rep.x(0)} y1={rep.y(zA)} x2={rep.x(0)} y2={rep.y(d.Zp)} decalage={-18} texte={nombre(hA, 2)} />
      <Cote x1={rep.x(d.L)} y1={rep.y(zB)} x2={rep.x(d.L)} y2={rep.y(d.Zp)} decalage={18} texte={nombre(hB, 2)} />
      <Etiquette x={rep.x(xA) - 4} y={rep.y(zA) + 16} ancre="middle" taille={11}>
        talus {nombre(d.m, 1)}/1
      </Etiquette>
      <Cote x1={rep.x(0)} y1={rep.y(zmin) + 2} x2={rep.x(d.L)} y2={rep.y(zmin) + 2} texte={`L = ${nombre(d.L, 2)} m`} />
    </Figure>
  );
}
