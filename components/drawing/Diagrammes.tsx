// Diagrammes génériques (flux, cycle, comparaison, barres) pour les schémas de méthode, d'organisation et de démarche.
// Chaque composant rend une figure complète, avec son texte alternatif ; le texte est coupé automatiquement.
import { Etiquette, Figure } from './Figure';
import { Fleche } from './Fleche';

export type Teinte = 'encre' | 'validation' | 'correction' | 'terre' | 'brique' | 'acier' | 'beton';

export const TEINTES: Record<Teinte, { fond: string; trait: string }> = {
  encre: { fond: 'var(--color-encre-clair)', trait: 'var(--color-encre)' },
  validation: { fond: 'var(--color-validation-clair)', trait: 'var(--color-validation)' },
  correction: { fond: 'var(--color-correction-clair)', trait: 'var(--color-correction)' },
  terre: { fond: 'var(--color-terre-clair)', trait: 'var(--color-terre)' },
  brique: { fond: 'var(--color-brique-clair)', trait: 'var(--color-brique)' },
  acier: { fond: 'var(--color-acier-clair)', trait: 'var(--color-acier)' },
  beton: { fond: 'var(--color-beton-clair)', trait: 'var(--color-beton)' },
};

/** Largeur moyenne d'un caractère de la police technique (Barlow Condensed), en fraction de la taille. */
const CHASSE = 0.47;

/** Découpe un texte en lignes qui tiennent dans `largeur` pixels pour une taille de police donnée. */
export function couper(texte: string, largeur: number, taille: number): string[] {
  const max = Math.max(4, Math.floor(largeur / (taille * CHASSE)));
  const lignes: string[] = [];
  let l = '';
  // espaces ordinaires seulement : une espace insécable garde « ? » ou « 25 kN » sur une même ligne
  for (const mot of texte.split(/[ \t\r\n]+/).filter(Boolean)) {
    const essai = l ? `${l} ${mot}` : mot;
    if (essai.length > max && l) {
      lignes.push(l);
      l = mot;
    } else l = essai;
  }
  if (l) lignes.push(l);
  return lignes;
}

export interface Bloc {
  titre: string;
  texte?: string;
  teinte?: Teinte;
}

const H_TITRE = 18;
const H_LIGNE = 14.5;

/** Hauteur d'une boîte de largeur `l` contenant un titre et un texte coupé. */
function hauteurBloc(b: Bloc, l: number): number {
  const titre = couper(b.titre, l - 14, 12.5).length;
  const texte = b.texte ? couper(b.texte, l - 14, 11).length : 0;
  return 12 + titre * H_TITRE + texte * H_LIGNE + 6;
}

/** Boîte arrondie : titre en gras puis texte, centrés. */
function BoiteBloc({ b, x, y, l, h, n }: { b: Bloc; x: number; y: number; l: number; h: number; n?: number }) {
  const t = TEINTES[b.teinte ?? 'beton'];
  const titre = couper(b.titre, l - 14, 12.5);
  const texte = b.texte ? couper(b.texte, l - 14, 11) : [];
  return (
    <g>
      <rect x={x} y={y} width={l} height={h} rx={7} fill={t.fond} stroke={t.trait} strokeWidth={1.4} />
      {n !== undefined ? (
        <g>
          <circle cx={x + 2} cy={y + 2} r={10} fill="var(--color-papier)" stroke={t.trait} strokeWidth={1.4} />
          <Etiquette x={x + 2} y={y + 6} ancre="middle" taille={11} gras couleur={t.trait}>
            {n}
          </Etiquette>
        </g>
      ) : null}
      {titre.map((ligne, i) => (
        <Etiquette key={`t${i}`} x={x + l / 2} y={y + 22 + i * H_TITRE} ancre="middle" taille={12.5} gras>
          {ligne}
        </Etiquette>
      ))}
      {texte.map((ligne, i) => (
        <Etiquette key={`x${i}`} x={x + l / 2} y={y + 22 + titre.length * H_TITRE + i * H_LIGNE} ancre="middle" taille={11}>
          {ligne}
        </Etiquette>
      ))}
    </g>
  );
}

/**
 * Suite d'étapes en ligne, reliées par des flèches ; `boucle` ajoute une flèche de retour de la dernière à la première étape.
 * `fleches={false}` aligne des cases sans ordre (classement, familles).
 */
export function DiagrammeFlux({ alt, etapes, boucle, fleches = true, numeros = true, titre, largeur = 620 }: { alt: string; etapes: readonly Bloc[]; boucle?: string; fleches?: boolean; numeros?: boolean; titre?: string; largeur?: number }) {
  const n = etapes.length;
  const marge = 14;
  const gap = fleches ? 30 : 14;
  const l = (largeur - 2 * marge - (n - 1) * gap) / n;
  const y0 = titre ? 40 : 16;
  const h = Math.max(...etapes.map((b) => hauteurBloc(b, l)));
  const x = (i: number) => marge + i * (l + gap);
  const hauteur = y0 + h + (boucle ? 62 : 16);
  return (
    <Figure alt={alt} largeur={largeur} hauteur={hauteur}>
      {titre ? (
        <Etiquette x={marge} y={22} taille={12.5} gras>
          {titre}
        </Etiquette>
      ) : null}
      {etapes.map((b, i) => (
        <BoiteBloc key={b.titre} b={b} x={x(i)} y={y0} l={l} h={h} n={numeros ? i + 1 : undefined} />
      ))}
      {fleches ? etapes.slice(1).map((_, i) => <Fleche key={i} x1={x(i) + l + 3} y1={y0 + h / 2} x2={x(i + 1) - 3} y2={y0 + h / 2} couleur="var(--trait)" epaisseur={1.8} tete={8} />) : null}
      {boucle ? (
        <g>
          <path d={`M ${x(n - 1) + l / 2} ${y0 + h + 2} L ${x(n - 1) + l / 2} ${y0 + h + 30} L ${x(0) + l / 2} ${y0 + h + 30} L ${x(0) + l / 2} ${y0 + h + 10}`} fill="none" stroke="var(--color-encre)" strokeWidth={1.6} strokeDasharray="6 4" />
          <Fleche x1={x(0) + l / 2} y1={y0 + h + 14} x2={x(0) + l / 2} y2={y0 + h + 3} couleur="var(--color-encre)" epaisseur={1.6} tete={8} />
          <Etiquette x={largeur / 2} y={y0 + h + 48} ancre="middle" taille={11.5} gras couleur="var(--color-encre)">
            {boucle}
          </Etiquette>
        </g>
      ) : null}
    </Figure>
  );
}

/** Étapes disposées en cercle, reliées par des flèches : une démarche qui recommence. */
export function DiagrammeCycle({ alt, etapes, centre, largeur = 620 }: { alt: string; etapes: readonly Bloc[]; centre?: string; largeur?: number }) {
  const n = etapes.length;
  const l = 150;
  const rx = 215;
  const ry = n > 4 ? 105 : 88;
  const cx = largeur / 2;
  const h = Math.max(...etapes.map((b) => hauteurBloc(b, l)));
  const cy = 22 + h / 2 + ry;
  const pos = (i: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as const;
  };
  const hauteur = cy + ry + h / 2 + 18;
  return (
    <Figure alt={alt} largeur={largeur} hauteur={hauteur}>
      {etapes.map((_, i) => {
        // flèche le long de l'ellipse, du bord d'une boîte au bord de la suivante
        const a1 = -Math.PI / 2 + (2 * Math.PI * (i + 0.32)) / n;
        const a2 = -Math.PI / 2 + (2 * Math.PI * (i + 0.68)) / n;
        const p1 = [cx + rx * Math.cos(a1), cy + ry * Math.sin(a1)] as const;
        const p2 = [cx + rx * Math.cos(a2), cy + ry * Math.sin(a2)] as const;
        // tangente à l'ellipse au point d'arrivée, dans le sens de parcours
        const tx = -rx * Math.sin(a2);
        const ty = ry * Math.cos(a2);
        const nt = Math.hypot(tx, ty) || 1;
        return (
          <g key={`f${i}`}>
            <path d={`M ${p1[0]} ${p1[1]} A ${rx} ${ry} 0 0 1 ${p2[0]} ${p2[1]}`} fill="none" stroke="var(--trait)" strokeWidth={1.8} />
            <Fleche x1={p2[0] - (tx / nt) * 10} y1={p2[1] - (ty / nt) * 10} x2={p2[0]} y2={p2[1]} couleur="var(--trait)" epaisseur={1.8} tete={9} />
          </g>
        );
      })}
      {etapes.map((b, i) => {
        const [x, y] = pos(i);
        return <BoiteBloc key={b.titre} b={b} x={x - l / 2} y={y - h / 2} l={l} h={h} n={i + 1} />;
      })}
      {centre
        ? couper(centre, 170, 12.5).map((ligne, i, tout) => (
            <Etiquette key={`c${i}`} x={cx} y={cy + 5 + (i - (tout.length - 1) / 2) * 16} ancre="middle" taille={12.5} gras couleur="var(--color-encre)">
              {ligne}
            </Etiquette>
          ))
        : null}
    </Figure>
  );
}

export interface Colonne {
  titre: string;
  items: readonly string[];
}

/** Deux colonnes côte à côte : à gauche ce qu'il faut éviter (rouge, ✗), à droite ce qu'il faut faire (vert, ✓). */
export function DiagrammeComparaison({ alt, gauche, droite, largeur = 620 }: { alt: string; gauche: Colonne; droite: Colonne; largeur?: number }) {
  const l = (largeur - 3 * 12) / 2;
  const lignes = (c: Colonne) => c.items.map((it) => couper(it, l - 44, 11.5));
  const lg = lignes(gauche);
  const ld = lignes(droite);
  const hCol = (ls: string[][]) => ls.reduce((s, x) => s + x.length * 15 + 8, 0);
  const hauteur = 54 + Math.max(hCol(lg), hCol(ld)) + 14;
  const colonne = (c: Colonne, ls: string[][], x: number, bon: boolean) => {
    const t = TEINTES[bon ? 'validation' : 'correction'];
    let y = 62;
    return (
      <g>
        <rect x={x} y={12} width={l} height={hauteur - 22} rx={8} fill={t.fond} stroke={t.trait} strokeWidth={1.4} />
        <Etiquette x={x + 14} y={36} taille={13} gras couleur={t.trait}>
          {bon ? '✓' : '✗'} {c.titre}
        </Etiquette>
        {ls.map((morceaux, i) => {
          const y0 = y;
          y += morceaux.length * 15 + 8;
          return (
            <g key={i}>
              <circle cx={x + 20} cy={y0 - 4} r={3.2} fill={t.trait} />
              {morceaux.map((m, k) => (
                <Etiquette key={k} x={x + 32} y={y0 + k * 15} taille={11.5}>
                  {m}
                </Etiquette>
              ))}
            </g>
          );
        })}
      </g>
    );
  };
  return (
    <Figure alt={alt} largeur={largeur} hauteur={hauteur}>
      {colonne(gauche, lg, 12, false)}
      {colonne(droite, ld, 24 + l, true)}
    </Figure>
  );
}

export interface Barre {
  libelle: string;
  valeur: number;
  texte: string;
  teinte?: Teinte;
}

/** Barres horizontales proportionnelles à leur valeur, avec un repère vertical facultatif (limite, objectif). */
export function DiagrammeBarres({ alt, barres, titre, repere, largeur = 620 }: { alt: string; barres: readonly Barre[]; titre?: string; repere?: { valeur: number; texte: string }; largeur?: number }) {
  const xl = 200;
  const lmax = largeur - xl - 120;
  const max = Math.max(...barres.map((b) => b.valeur), repere?.valeur ?? 0) || 1;
  const y0 = titre ? 42 : 18;
  const pas = 34;
  const hauteur = y0 + barres.length * pas + (repere ? 30 : 10);
  return (
    <Figure alt={alt} largeur={largeur} hauteur={hauteur}>
      {titre ? (
        <Etiquette x={14} y={24} taille={12.5} gras>
          {titre}
        </Etiquette>
      ) : null}
      {barres.map((b, i) => {
        const t = TEINTES[b.teinte ?? 'encre'];
        const y = y0 + i * pas;
        const lg = (Math.max(0, b.valeur) / max) * lmax;
        return (
          <g key={b.libelle}>
            <Etiquette x={xl - 10} y={y + 16} ancre="end" taille={11.5}>
              {b.libelle}
            </Etiquette>
            <rect x={xl} y={y + 3} width={lg} height={20} fill={t.fond} stroke={t.trait} strokeWidth={1.3} />
            <Etiquette x={xl + lg + 8} y={y + 17} taille={11.5} gras couleur={t.trait}>
              {b.texte}
            </Etiquette>
          </g>
        );
      })}
      {repere ? (
        <g>
          <line x1={xl + (repere.valeur / max) * lmax} y1={y0 - 4} x2={xl + (repere.valeur / max) * lmax} y2={y0 + barres.length * pas + 4} stroke="var(--color-correction)" strokeWidth={1.6} strokeDasharray="5 3" />
          <Etiquette x={xl + (repere.valeur / max) * lmax} y={y0 + barres.length * pas + 20} ancre="middle" taille={11} gras couleur="var(--color-correction)">
            {repere.texte}
          </Etiquette>
        </g>
      ) : null}
    </Figure>
  );
}
