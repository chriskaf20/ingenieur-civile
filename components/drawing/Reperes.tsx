import { Etiquette } from './Figure';

/** Axe (trait mixte fin) avec repère de file facultatif dans une bulle. */
export function Axe({
  x1,
  y1,
  x2,
  y2,
  repere,
  cote = 'debut',
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  repere?: string;
  cote?: 'debut' | 'fin';
}) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const r = 9;
  const [bx, by] = cote === 'debut' ? [x1 - ux * r, y1 - uy * r] : [x2 + ux * r, y2 + uy * r];
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="t-axe" />
      {repere ? (
        <g>
          <circle cx={bx} cy={by} r={r} fill="var(--halo)" className="t-moyen" />
          <text x={bx} y={by + 4} textAnchor="middle" fontSize={11} fontWeight={700}>
            {repere}
          </text>
        </g>
      ) : null}
    </g>
  );
}

/** Symbole de niveau en coupe ou en élévation : triangle posé sur le trait de niveau, valeur au-dessus. */
export function Niveau({ x, y, texte, longueur = 46, vers = 'droite' }: { x: number; y: number; texte: string; longueur?: number; vers?: 'droite' | 'gauche' }) {
  const s = vers === 'droite' ? 1 : -1;
  return (
    <g>
      <line x1={x} y1={y} x2={x + s * longueur} y2={y} className="t-fin" />
      <polygon points={`${x},${y} ${x - 5},${y - 8} ${x + 5},${y - 8}`} fill="var(--trait)" />
      <Etiquette x={x + s * 8} y={y - 4} ancre={s > 0 ? 'start' : 'end'} taille={11}>
        {texte}
      </Etiquette>
    </g>
  );
}

/** Niveau en plan : valeur encadrée avec une croix de repérage. */
export function NiveauPlan({ x, y, texte }: { x: number; y: number; texte: string }) {
  return (
    <g>
      <path d={`M${x - 6} ${y}h12M${x} ${y - 6}v12`} className="t-moyen" />
      <rect x={x + 9} y={y - 9} width={texte.length * 6.4 + 8} height={16} className="t-fin" fill="var(--halo)" />
      <text x={x + 13} y={y + 3.5} fontSize={11}>
        {texte}
      </text>
    </g>
  );
}

/** Repère de coupe : trait mixte fort aux extrémités, flèches dans le sens de la vue et nom (1-1, A-A…). */
export function RepereCoupe({ x1, y1, x2, y2, nom, sens = 1 }: { x1: number; y1: number; x2: number; y2: number; nom: string; sens?: 1 | -1 }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const nx = -uy * sens;
  const ny = ux * sens;
  const fleche = (x: number, y: number) => {
    const bx = x + nx * 16;
    const by = y + ny * 16;
    return (
      <g>
        <line x1={x} y1={y} x2={bx} y2={by} className="t-fort" />
        <polygon points={`${bx + nx * 7},${by + ny * 7} ${bx - ux * 4},${by - uy * 4} ${bx + ux * 4},${by + uy * 4}`} fill="var(--trait)" />
        <text x={x - ux * 10} y={y - uy * 10 + 4} textAnchor="middle" fontSize={13} fontWeight={700}>
          {nom}
        </text>
      </g>
    );
  };
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="t-axe" strokeWidth={0.9} />
      {fleche(x1, y1)}
      {fleche(x2, y2)}
    </g>
  );
}

/** Flèche du nord. */
export function Nord({ x, y, taille = 18 }: { x: number; y: number; taille?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={taille} className="t-fin" />
      <polygon points={`${x},${y - taille + 2} ${x + 6},${y + 6} ${x},${y + 2} ${x - 6},${y + 6}`} fill="var(--trait)" />
      <text x={x} y={y - taille - 4} textAnchor="middle" fontSize={12} fontWeight={700}>
        N
      </text>
    </g>
  );
}
