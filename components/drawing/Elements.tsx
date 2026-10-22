import type { DonneesEscalier, ResultatEscalier } from '@/lib/calc/escalier';
import { profilEscalier } from '@/lib/calc/escalier';
import { creerRepere, points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';
import { Cote } from './Cote';
import { Etiquette } from './Figure';
import { hachure, Hachures } from './Hachures';
import { Niveau } from './Reperes';
import { TerrainNaturel } from './Terrain';

/**
 * Coupe d'une semelle isolée sous poteau (dimensions en m), avec béton de propreté,
 * remblai et terrain naturel. Dessin paramétrique centré sur l'axe du poteau.
 */
export function CoupeFondation({
  B,
  hs,
  a,
  D,
  ePropre = 0.05,
  hauteurPoteau = 0.6,
  largeur = 460,
  prefixe = 'fond',
}: {
  B: number;
  hs: number;
  a: number;
  D: number;
  ePropre?: number;
  hauteurPoteau?: number;
  largeur?: number;
  prefixe?: string;
}) {
  const demi = B / 2 + 0.6;
  const r = creerRepere({ xmin: -demi, xmax: demi, ymin: -D - 0.15, ymax: hauteurPoteau }, largeur, 40);
  const zFond = -D;
  const zSemelle = zFond + ePropre;
  const zDessus = zSemelle + hs;
  const rect = (x0: number, z0: number, x1: number, z1: number) => ({ x: r.x(x0), y: r.y(z1), width: r.x(x1) - r.x(x0), height: r.y(z0) - r.y(z1) });
  return (
    <g>
      <Hachures prefixe={prefixe} types={['ba', 'beton', 'terre', 'remblai']} />
      <rect {...rect(-demi + 0.1, zFond, demi - 0.1, 0)} fill={hachure(prefixe, 'remblai')} />
      <rect {...rect(-B / 2, zFond, B / 2, zSemelle)} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <rect {...rect(-B / 2, zSemelle, B / 2, zDessus)} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect {...rect(-a / 2, zDessus, a / 2, hauteurPoteau)} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <TerrainNaturel prefixe={prefixe} pts={[[r.x(-demi), r.y(0)], [r.x(-a / 2), r.y(0)]]} texte={null} />
      <TerrainNaturel prefixe={prefixe} pts={[[r.x(a / 2), r.y(0)], [r.x(demi), r.y(0)]]} texte="TN" />
      <line x1={r.x(-demi)} y1={r.y(zFond)} x2={r.x(demi)} y2={r.y(zFond)} className="t-fin" />
      <Cote x1={r.x(-B / 2)} y1={r.y(zFond)} x2={r.x(B / 2)} y2={r.y(zFond)} decalage={-22} texte={`${nombre(B, 2)} m`} />
      <Cote x1={r.x(B / 2)} y1={r.y(zSemelle)} x2={r.x(B / 2)} y2={r.y(zDessus)} decalage={-26} texte={`${nombre(hs, 2)}`} />
      <Niveau x={r.x(-demi) + 6} y={r.y(0)} texte="±0,00" />
      <Niveau x={r.x(-demi) + 6} y={r.y(zFond)} texte={`−${nombre(D, 2)}`} />
      <Etiquette x={r.x(0)} y={r.y(hauteurPoteau) - 6} ancre="middle" taille={11}>
        poteau {nombre(a * 100, 0)} × {nombre(a * 100, 0)}
      </Etiquette>
    </g>
  );
}

/** Hauteur SVG nécessaire à `CoupeFondation` pour une largeur donnée. */
export function hauteurCoupeFondation(B: number, D: number, hauteurPoteau = 0.6, largeur = 460): number {
  const demi = B / 2 + 0.6;
  return creerRepere({ xmin: -demi, xmax: demi, ymin: -D - 0.15, ymax: hauteurPoteau }, largeur, 40).hauteur;
}

/**
 * Profil en élévation d'un escalier droit à deux volées (paillasse hachurée en béton armé),
 * avec cotes d'une marche. Le pied de l'escalier est à droite.
 */
export function Escalier2D({ d, r, largeur = 620, prefixe = 'esc' }: { d: DonneesEscalier; r: ResultatEscalier; largeur?: number; prefixe?: string }) {
  const { dessus, dessous } = profilEscalier(d, r);
  const rep = creerRepere({ xmin: -0.5, xmax: r.reculement + 0.5, ymin: -0.3, ymax: d.H + 0.25 }, largeur, 36);
  const poly = [...dessus, ...dessous].map(([x, z]) => [rep.x(x), rep.y(z)] as const);
  // marche de référence : première marche de la volée 1 (en bas, à droite)
  const xr = r.reculement;
  return (
    <g>
      <Hachures prefixe={prefixe} types={['ba']} />
      <rect x={rep.x(r.reculement)} y={rep.y(0)} width={rep.lx(0.5)} height={rep.ly(0.2)} fill={hachure(prefixe, 'ba')} className="t-moyen" />
      <rect x={rep.x(-0.5)} y={rep.y(d.H)} width={rep.lx(0.5)} height={rep.ly(0.2)} fill={hachure(prefixe, 'ba')} className="t-moyen" />
      <polygon points={points(poly)} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <line x1={rep.x(-0.5)} y1={rep.y(0)} x2={rep.x(r.reculement + 0.5)} y2={rep.y(0)} className="t-fin" />
      <Cote x1={rep.x(xr)} y1={rep.y(0)} x2={rep.x(xr)} y2={rep.y(r.h)} decalage={-16} texte={`h = ${nombre(r.h * 100, 1)}`} />
      <Cote x1={rep.x(xr - r.g)} y1={rep.y(r.h)} x2={rep.x(xr)} y2={rep.y(r.h)} decalage={14} texte={`g = ${nombre(r.g * 100, 1)}`} />
      <Cote x1={rep.x(-0.5)} y1={rep.y(0)} x2={rep.x(-0.5)} y2={rep.y(d.H)} decalage={22} texte={`H = ${nombre(d.H, 2)} m`} />
      <Cote x1={rep.x(0)} y1={rep.y(-0.15)} x2={rep.x(r.reculement)} y2={rep.y(-0.15)} decalage={0} texte={`reculement ${nombre(r.reculement, 2)} m`} />
      <Etiquette x={rep.x((r.n2 - 1) * r.g + d.palier / 2)} y={rep.y(r.hauteurPalier) - 6} ancre="middle" taille={11}>
        palier
      </Etiquette>
    </g>
  );
}

export function hauteurEscalier2D(d: DonneesEscalier, r: ResultatEscalier, largeur = 620): number {
  return creerRepere({ xmin: -0.5, xmax: r.reculement + 0.5, ymin: -0.3, ymax: d.H + 0.25 }, largeur, 36).hauteur;
}
