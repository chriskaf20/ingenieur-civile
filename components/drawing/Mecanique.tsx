import { Etiquette } from './Figure';
import { hachure } from './Hachures';

function tete(x: number, y: number, angle: number, t = 8) {
  const a1 = angle + Math.PI - 0.38;
  const a2 = angle + Math.PI + 0.38;
  return `${x},${y} ${x + t * Math.cos(a1)},${y + t * Math.sin(a1)} ${x + t * Math.cos(a2)},${y + t * Math.sin(a2)}`;
}

/** Charge ponctuelle : flèche qui aboutit au point (x, y). Angle en degrés (90 = vers le bas). */
export function ChargePonctuelle({ x, y, longueur = 40, angle = 90, texte }: { x: number; y: number; longueur?: number; angle?: number; texte?: React.ReactNode }) {
  const a = (angle * Math.PI) / 180;
  const x0 = x - longueur * Math.cos(a);
  const y0 = y - longueur * Math.sin(a);
  return (
    <g>
      <line x1={x0} y1={y0} x2={x} y2={y} className="t-fort" stroke="var(--color-correction)" />
      <polygon points={tete(x, y, a)} fill="var(--color-correction)" />
      {texte ? (
        <Etiquette x={x0 + 5} y={y0 + 4} taille={12} gras>
          {texte}
        </Etiquette>
      ) : null}
    </g>
  );
}

/** Charge répartie uniforme entre x1 et x2, appliquée sur la ligne y. */
export function ChargeRepartie({ x1, x2, y, hauteur = 22, n, texte }: { x1: number; x2: number; y: number; hauteur?: number; n?: number; texte?: React.ReactNode }) {
  const nb = n ?? Math.max(3, Math.round((x2 - x1) / 22));
  const xs = Array.from({ length: nb + 1 }, (_, i) => x1 + ((x2 - x1) * i) / nb);
  return (
    <g stroke="var(--color-correction)">
      <line x1={x1} y1={y - hauteur} x2={x2} y2={y - hauteur} className="t-moyen" stroke="var(--color-correction)" />
      {xs.map((xi) => (
        <g key={xi}>
          <line x1={xi} y1={y - hauteur} x2={xi} y2={y - 2} strokeWidth={1} />
          <polygon points={tete(xi, y, Math.PI / 2, 6)} fill="var(--color-correction)" stroke="none" />
        </g>
      ))}
      {texte ? (
        <Etiquette x={(x1 + x2) / 2} y={y - hauteur - 5} ancre="middle" taille={12} gras>
          {texte}
        </Etiquette>
      ) : null}
    </g>
  );
}

/** Appui simple (rouleau) : une réaction perpendiculaire au support. */
export function AppuiSimple({ x, y, t = 12 }: { x: number; y: number; t?: number }) {
  return (
    <g>
      <polygon points={`${x},${y} ${x - t},${y + t * 1.3} ${x + t},${y + t * 1.3}`} fill="var(--halo)" className="t-moyen" />
      <circle cx={x - t * 0.55} cy={y + t * 1.3 + 3} r={2.6} className="t-moyen" />
      <circle cx={x + t * 0.55} cy={y + t * 1.3 + 3} r={2.6} className="t-moyen" />
      <line x1={x - t * 1.4} y1={y + t * 1.3 + 6} x2={x + t * 1.4} y2={y + t * 1.3 + 6} className="t-moyen" />
    </g>
  );
}

/** Appui double (articulation) : deux réactions, pas de moment. */
export function AppuiDouble({ x, y, t = 12, prefixe = 'app' }: { x: number; y: number; t?: number; prefixe?: string }) {
  const b = y + t * 1.3;
  return (
    <g>
      <polygon points={`${x},${y} ${x - t},${b} ${x + t},${b}`} fill="var(--halo)" className="t-moyen" />
      <circle cx={x} cy={y} r={2.6} fill="var(--halo)" className="t-moyen" />
      <rect x={x - t * 1.4} y={b} width={t * 2.8} height={6} fill={hachure(prefixe, 'terre')} />
      <line x1={x - t * 1.4} y1={b} x2={x + t * 1.4} y2={b} className="t-moyen" />
    </g>
  );
}

/** Encastrement : deux réactions et un moment. `cote` indique de quel côté se trouve le massif. */
export function Encastrement({ x, y, hauteur = 40, cote = 'gauche', prefixe = 'app' }: { x: number; y: number; hauteur?: number; cote?: 'gauche' | 'droite'; prefixe?: string }) {
  const s = cote === 'gauche' ? -1 : 1;
  return (
    <g>
      <rect x={s < 0 ? x - 10 : x} y={y - hauteur / 2} width={10} height={hauteur} fill={hachure(prefixe, 'ba')} />
      <line x1={x} y1={y - hauteur / 2} x2={x} y2={y + hauteur / 2} className="t-fort" />
    </g>
  );
}
