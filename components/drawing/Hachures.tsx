// Hachures de coupe (conventions usuelles des plans de bâtiment ; la légende du plan fait foi).
// Les motifs sont définis dans chaque SVG (préfixe unique) pour suivre le thème du dessin.

export const TYPES_HACHURES = ['beton', 'ba', 'maconnerie', 'terre', 'remblai', 'gravier', 'eau', 'acier'] as const;
export type TypeHachure = (typeof TYPES_HACHURES)[number];

export const LIBELLES_HACHURES: Record<TypeHachure, string> = {
  beton: 'Béton non armé (propreté)',
  ba: 'Béton armé',
  maconnerie: 'Maçonnerie de blocs',
  terre: 'Terrain en place',
  remblai: 'Remblai compacté',
  gravier: 'Gravier, hérisson',
  eau: 'Eau',
  acier: 'Acier',
};

export function hachure(prefixe: string, type: TypeHachure): string {
  return `url(#${prefixe}-${type})`;
}

const trait = { stroke: 'var(--trait-doux)', strokeWidth: 0.7, fill: 'none' } as const;

export function Hachures({ prefixe, types = TYPES_HACHURES }: { prefixe: string; types?: readonly TypeHachure[] }) {
  const motif: Record<TypeHachure, React.ReactNode> = {
    beton: (
      <pattern id={`${prefixe}-beton`} width={14} height={14} patternUnits="userSpaceOnUse">
        <rect width={14} height={14} fill="var(--fond-beton)" />
        <path d="M2 4l2.5-2 1 3zM9 9l2.6-1.2.4 2.8z" {...trait} />
        <circle cx={10} cy={3} r={0.8} fill="var(--trait-doux)" />
        <circle cx={4} cy={11} r={0.8} fill="var(--trait-doux)" />
      </pattern>
    ),
    ba: (
      <pattern id={`${prefixe}-ba`} width={8} height={8} patternUnits="userSpaceOnUse">
        <rect width={8} height={8} fill="var(--fond-ba)" />
        <path d="M0 8L8 0M-2 2L2 -2M6 10L10 6" {...trait} />
      </pattern>
    ),
    maconnerie: (
      <pattern id={`${prefixe}-maconnerie`} width={7} height={7} patternUnits="userSpaceOnUse">
        <rect width={7} height={7} fill="var(--fond-macon)" />
        <path d="M0 0L7 7M-2 5L2 9M5 -2L9 2" {...trait} />
      </pattern>
    ),
    terre: (
      <pattern id={`${prefixe}-terre`} width={18} height={12} patternUnits="userSpaceOnUse">
        <rect width={18} height={12} fill="var(--fond-terre)" />
        <path d="M2 9l4-5M5 9l4-5M8 9l4-5" {...trait} />
      </pattern>
    ),
    remblai: (
      <pattern id={`${prefixe}-remblai`} width={14} height={14} patternUnits="userSpaceOnUse">
        <rect width={14} height={14} fill="var(--fond-terre)" />
        <circle cx={3.5} cy={4} r={1.4} {...trait} />
        <circle cx={10} cy={10} r={1.1} {...trait} />
        <circle cx={10} cy={3} r={0.7} fill="var(--trait-doux)" />
        <circle cx={4} cy={11} r={0.7} fill="var(--trait-doux)" />
      </pattern>
    ),
    gravier: (
      <pattern id={`${prefixe}-gravier`} width={12} height={12} patternUnits="userSpaceOnUse">
        <rect width={12} height={12} fill="var(--fond-beton)" />
        <circle cx={3} cy={3} r={2} {...trait} />
        <circle cx={9} cy={6} r={1.7} {...trait} />
        <circle cx={4} cy={9.5} r={1.5} {...trait} />
      </pattern>
    ),
    eau: (
      <pattern id={`${prefixe}-eau`} width={16} height={8} patternUnits="userSpaceOnUse">
        <rect width={16} height={8} fill="var(--fond-eau)" />
        <path d="M1 3h6M9 6.5h6" {...trait} />
      </pattern>
    ),
    acier: (
      <pattern id={`${prefixe}-acier`} width={4} height={4} patternUnits="userSpaceOnUse">
        <rect width={4} height={4} fill="var(--fond-ba)" />
        <path d="M0 4L4 0M0 0L4 4" stroke="var(--trait)" strokeWidth={0.6} />
      </pattern>
    ),
  };
  return <defs>{types.map((t) => <g key={t}>{motif[t]}</g>)}</defs>;
}

/** Légende des hachures (HTML), chaque échantillon portant son propre motif. */
export function LegendeHachures({ types, prefixe = 'leg' }: { types: readonly TypeHachure[]; prefixe?: string }) {
  return (
    <ul className="dessin grid gap-1 font-technique text-[0.85rem]">
      {types.map((t) => (
        <li key={t} className="flex items-center gap-2">
          <svg width={30} height={16} aria-hidden="true">
            <Hachures prefixe={`${prefixe}-${t}`} types={[t]} />
            <rect x={0.5} y={0.5} width={29} height={15} fill={hachure(`${prefixe}-${t}`, t)} stroke="var(--trait)" strokeWidth={0.8} />
          </svg>
          {LIBELLES_HACHURES[t]}
        </li>
      ))}
    </ul>
  );
}
