import { cercleMohr } from '@/lib/calc/rdm';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';
import { Etiquette } from './Figure';
import { AppuiDouble, AppuiSimple } from './Mecanique';

/**
 * Diagramme d'effort (M, V ou N) le long d'une poutre de portée L.
 * `valeurs` : couples (x en m, valeur). Convention : valeurs positives dessinées sous l'axe
 * (côté de la fibre tendue pour M), sauf `positifEnHaut`.
 */
export function Diagramme({
  L,
  valeurs,
  unite,
  nom,
  x = 50,
  y = 40,
  longueur = 480,
  amplitude = 60,
  positifEnHaut = false,
  appuis = true,
  prefixe = 'diag',
}: {
  L: number;
  valeurs: ReadonlyArray<readonly [number, number]>;
  unite: string;
  nom: string;
  x?: number;
  y?: number;
  longueur?: number;
  amplitude?: number;
  positifEnHaut?: boolean;
  appuis?: boolean;
  prefixe?: string;
}) {
  const max = Math.max(...valeurs.map(([, v]) => Math.abs(v)), 1e-9);
  const sx = (xm: number) => x + (xm / L) * longueur;
  const sv = (v: number) => y + ((positifEnHaut ? -1 : 1) * v * amplitude) / max;
  const courbe = valeurs.map(([xm, v]) => [sx(xm), sv(v)] as const);
  const surface = [[sx(0), y] as const, ...courbe, [sx(L), y] as const];
  const [xMax, vMax] = valeurs.reduce((a, b) => (Math.abs(b[1]) > Math.abs(a[1]) ? b : a));
  return (
    <g>
      <polygon points={points(surface)} fill="var(--color-encre-clair)" stroke="none" />
      <polyline points={points(courbe)} className="t-moyen" stroke="var(--color-encre)" />
      <line x1={sx(0)} y1={y} x2={sx(L)} y2={y} className="t-fort" />
      {appuis ? (
        <>
          <AppuiDouble x={sx(0)} y={y} prefixe={prefixe} />
          <AppuiSimple x={sx(L)} y={y} />
        </>
      ) : null}
      <line x1={sx(xMax)} y1={y} x2={sx(xMax)} y2={sv(vMax)} className="t-fin" strokeDasharray="3 2" />
      <Etiquette x={sx(xMax) + 5} y={sv(vMax) + (sv(vMax) > y ? 14 : -5)} taille={12} gras>
        {nom}max = {nombre(vMax, 2)} {unite}
      </Etiquette>
      <Etiquette x={sx(0) - 10} y={y + 4} ancre="end" taille={13} gras classe="encre">
        {nom}
      </Etiquette>
    </g>
  );
}

/** Cercle de Mohr d'un état plan de contraintes (MPa). Convention : τ positif vers le bas. */
export function CercleMohr({ sx: sxx, sy: syy, txy, x = 40, y = 30, taille = 420, dec = 0 }: { sx: number; sy: number; txy: number; x?: number; y?: number; taille?: number; dec?: number }) {
  const m = cercleMohr(sxx, syy, txy);
  const etendue = Math.max(Math.abs(m.s1), Math.abs(m.s2), m.rayon) * 1.25;
  const k = taille / 2 / etendue;
  const o = [x + taille / 2, y + taille / 2] as const;
  const P = (s: number, t: number) => [o[0] + s * k, o[1] + t * k] as const;
  const c = P(m.centre, 0);
  const X = P(sxx, txy);
  const Y = P(syy, -txy);
  return (
    <g>
      <line x1={x} y1={o[1]} x2={x + taille} y2={o[1]} className="t-moyen" />
      <line x1={o[0]} y1={y} x2={o[0]} y2={y + taille} className="t-moyen" />
      <Etiquette x={x + taille - 2} y={o[1] - 6} ancre="end" taille={13} gras>σ</Etiquette>
      <Etiquette x={o[0] + 6} y={y + taille - 4} taille={13} gras>τ</Etiquette>
      <circle cx={c[0]} cy={c[1]} r={m.rayon * k} className="t-fort" stroke="var(--color-encre)" />
      <line x1={X[0]} y1={X[1]} x2={Y[0]} y2={Y[1]} className="t-fin" />
      <circle cx={X[0]} cy={X[1]} r={3} fill="var(--color-correction)" />
      <circle cx={Y[0]} cy={Y[1]} r={3} fill="var(--color-correction)" />
      <Etiquette x={X[0] + 6} y={X[1] + 4} taille={11.5}>X ({nombre(sxx, dec)} ; {nombre(txy, dec)})</Etiquette>
      <Etiquette x={Y[0] + 6} y={Y[1] - 4} taille={11.5}>Y ({nombre(syy, dec)} ; {nombre(-txy, dec)})</Etiquette>
      {[m.s1, m.s2].map((s, i) => (
        <g key={i}>
          <circle cx={P(s, 0)[0]} cy={o[1]} r={3} fill="var(--color-validation)" />
          <Etiquette x={P(s, 0)[0]} y={o[1] + 16} ancre="middle" taille={11.5} gras>
            σ{i + 1} = {nombre(s, Math.max(1, dec))}
          </Etiquette>
        </g>
      ))}
    </g>
  );
}

const TAMIS = [0.063, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 31.5, 63];

/** Courbe granulométrique : passants cumulés (%) en fonction de l'ouverture des tamis (mm, échelle log). */
export function CourbeGranulo({
  mesures,
  x = 50,
  y = 20,
  largeur = 520,
  hauteur = 260,
  dmin = 0.063,
  dmax = 63,
}: {
  mesures: ReadonlyArray<readonly [number, number]>;
  x?: number;
  y?: number;
  largeur?: number;
  hauteur?: number;
  dmin?: number;
  dmax?: number;
}) {
  const lx = (d: number) => x + ((Math.log10(d) - Math.log10(dmin)) / (Math.log10(dmax) - Math.log10(dmin))) * largeur;
  const ly = (p: number) => y + hauteur - (p / 100) * hauteur;
  return (
    <g>
      {[0, 20, 40, 60, 80, 100].map((p) => (
        <g key={p}>
          <line x1={x} y1={ly(p)} x2={x + largeur} y2={ly(p)} className="t-fin" strokeOpacity={0.5} />
          <Etiquette x={x - 6} y={ly(p) + 4} ancre="end" taille={10.5}>{p}</Etiquette>
        </g>
      ))}
      {TAMIS.filter((d) => d >= dmin && d <= dmax).map((d) => (
        <g key={d}>
          <line x1={lx(d)} y1={y} x2={lx(d)} y2={y + hauteur} className="t-fin" strokeOpacity={0.5} />
          <Etiquette x={lx(d)} y={y + hauteur + 14} ancre="middle" taille={10.5}>{nombre(d, d < 1 ? 3 : d % 1 ? 1 : 0)}</Etiquette>
        </g>
      ))}
      <rect x={x} y={y} width={largeur} height={hauteur} className="t-moyen" />
      <polyline points={points(mesures.map(([d, p]) => [lx(d), ly(p)] as const))} className="t-fort" stroke="var(--color-encre)" />
      {mesures.map(([d, p]) => (
        <circle key={d} cx={lx(d)} cy={ly(p)} r={2.6} fill="var(--color-encre)" />
      ))}
      <Etiquette x={x + largeur / 2} y={y + hauteur + 30} ancre="middle" taille={11.5}>ouverture des tamis (mm), échelle logarithmique</Etiquette>
      <Etiquette x={x - 34} y={y + hauteur / 2} ancre="middle" taille={11.5} rotation={-90}>passants cumulés (%)</Etiquette>
    </g>
  );
}
