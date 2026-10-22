/** Conteneur accessible d'un dessin SVG : texte alternatif obligatoire, légende facultative. */
export function Figure({
  alt,
  legende,
  largeur,
  hauteur,
  largeurMin,
  className = '',
  children,
}: {
  alt: string;
  legende?: React.ReactNode;
  largeur: number;
  hauteur: number;
  /** largeur minimale à l'écran (px) : en dessous, le dessin défile horizontalement */
  largeurMin?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={`schema ${className}`} tabIndex={0} aria-label={alt}>
      <svg
        viewBox={`0 0 ${Math.round(largeur * 100) / 100} ${Math.round(hauteur * 100) / 100}`}
        role="img"
        aria-label={alt}
        className="dessin"
        style={{ maxWidth: largeur, minWidth: Math.min(largeurMin ?? 520, largeur) }}
      >
        <title>{alt}</title>
        {children}
      </svg>
      {legende ? <figcaption className="mt-1 text-center font-technique text-[0.85rem] text-beton">{legende}</figcaption> : null}
    </figure>
  );
}

/** Texte SVG avec halo blanc pour rester lisible sur les hachures. */
export function Etiquette({
  x,
  y,
  children,
  ancre = 'start',
  taille = 12,
  gras = false,
  classe = '',
  rotation,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  ancre?: 'start' | 'middle' | 'end';
  taille?: number;
  gras?: boolean;
  classe?: string;
  rotation?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={ancre}
      fontSize={taille}
      fontWeight={gras ? 700 : undefined}
      className={classe}
      paintOrder="stroke"
      stroke="var(--halo, #fffdf7)"
      strokeWidth={3}
      strokeLinejoin="round"
      transform={rotation ? `rotate(${rotation} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

/** Ligne de rappel avec flèche vers un point (pour nommer un élément). */
export function Renvoi({
  de,
  vers,
  texte,
  ancre = 'start',
}: {
  de: readonly [number, number];
  vers: readonly [number, number];
  texte: React.ReactNode;
  ancre?: 'start' | 'middle' | 'end';
}) {
  const [x1, y1] = de;
  const [x2, y2] = vers;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const t = 6;
  const p1 = [x2 - t * Math.cos(a - 0.4), y2 - t * Math.sin(a - 0.4)];
  const p2 = [x2 - t * Math.cos(a + 0.4), y2 - t * Math.sin(a + 0.4)];
  const dx = ancre === 'end' ? -3 : ancre === 'start' ? 3 : 0;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="t-fin" />
      <polygon points={`${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill="var(--trait-doux)" />
      <Etiquette x={x1 + dx} y={y1 - 3} ancre={ancre} taille={11.5}>
        {texte}
      </Etiquette>
    </g>
  );
}
