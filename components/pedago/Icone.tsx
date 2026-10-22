// Icônes techniques dessinées à la main (24 × 24, trait = couleur courante).

const CHEMINS = {
  charges: 'M3 6h18M7 2v4M12 2v4M17 2v4M5 6l2-2M10 6l2-2M15 6l2-2M2 18h20M5 18l-2 3h4zM19 18l-2 3h4zM2 14h20v4H2z',
  materiaux: 'M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8',
  calcul: 'M6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM8 5h8v4H8zM8 13h2M11 13h2M14 13h2M8 17h2M11 17h2M14 17h2',
  verification: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM8 12l3 3 5-6',
  flambement: 'M8 2h8M8 22h8M12 2c-4 6-4 14 0 20M15 12h5M18 10l2 2-2 2',
  ferraillage: 'M5 3v18M10 3v18M14 3v18M19 3v18M3 7h18M3 17h18',
  cadre: 'M5 5h14v14H5zM7 7h10v10H7zM5 5l2 2',
  quantites: 'M4 3h16v18H4zM4 8h16M4 13h16M4 18h16M10 3v18',
  attention: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  retenir: 'M6 2h12v20l-6-4-6 4z',
  exemple: 'M4 20l1-5L16 4l4 4L9 19zM14 6l4 4',
  terrain: 'M3 16a9 9 0 0 1 18 0zM2 16h20v2H2zM12 7V4M9 7.5V5M15 7.5V5',
  erreur: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8 8l8 8M16 8l-8 8',
  idee: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z',
  regle: 'M2 16L16 2l6 6L8 22zM6 12l2 2M9 9l2 2M12 6l2 2',
  plan: 'M3 3h18v18H3zM3 14h7v7M14 3v7h7M10 10h4v4h-4z',
} as const;

export type NomIcone = keyof typeof CHEMINS;

export function Icone({ nom, taille = 22, className = '' }: { nom: NomIcone; taille?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={taille}
      height={taille}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={CHEMINS[nom]} />
    </svg>
  );
}
