// Plan, façade et coupe d'un logement (studio, maison), tirés du modèle de lib/calc/plans.ts :
// si une donnée change, les trois vues et leurs cotes changent ensemble.
import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure, Renvoi } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { Niveau, NiveauPlan, Nord, RepereCoupe } from '@/components/drawing/Reperes';
import { analyseLogement, type BaieExterieure, type Facade, type Logement, type PorteInterieure, type Rect } from '@/lib/calc/plans';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const n2 = (x: number) => nombre(x, 2);
/** Niveau écrit à la française : +2,70 ; −0,30 ; ±0,00. */
export const niv = (z: number) => (Math.abs(z) < 5e-4 ? '±0,00' : `${z > 0 ? '+' : '−'}${n2(Math.abs(z))}`);

type Seg = readonly [number, number];

/** Intervalles d'un segment [a, b] privé des ouvertures. */
function soustraire(a: number, b: number, trous: Seg[]): Seg[] {
  const res: Seg[] = [];
  let x = a;
  for (const [t0, t1] of [...trous].sort((p, q) => p[0] - q[0])) {
    if (t0 > x) res.push([x, t0]);
    x = Math.max(x, t1);
  }
  if (b > x) res.push([x, b]);
  return res;
}

const ouvertures = (lg: Logement, f: Facade): Seg[] => lg.baies.filter((b) => b.facade === f).map((b) => [b.debut, b.debut + b.largeur] as const);

/** Arc de porte : du bout du vantail ouvert au tableau opposé, centré sur les paumelles (coordonnées écran). */
function arcPorte(c: Seg, s: Seg, e: Seg): string {
  const r = Math.hypot(s[0] - c[0], s[1] - c[1]);
  const sens = (s[0] - c[0]) * (e[1] - c[1]) - (s[1] - c[1]) * (e[0] - c[0]) > 0 ? 1 : 0;
  return `M${s[0]} ${s[1]} A${r} ${r} 0 0 ${sens} ${e[0]} ${e[1]}`;
}

export interface OptionsPlan {
  lg: Logement;
  prefixe: string;
  largeur?: number;
  /** cotes : aucune, totales seulement, ou complètes (baies, hors tout, intérieures) */
  cotes?: 'aucune' | 'totales' | 'completes';
  surfaces?: boolean;
  coupe?: boolean;
  reperes?: boolean;
  niveaux?: boolean;
  alt?: string;
}

/** Plan de niveau : murs et cloisons coupés, baies, portes, pièces, cotes, repère de coupe et nord. */
export function PlanLogement({ lg, prefixe, largeur = 620, cotes = 'completes', surfaces = true, coupe = true, reperes = true, niveaux = false, alt }: OptionsPlan) {
  const a = analyseLogement(lg);
  const m = lg.mur;
  const gauche = cotes === 'completes' ? 74 : cotes === 'totales' ? 52 : 30;
  const bas = cotes === 'completes' ? 70 : cotes === 'totales' ? 50 : 34;
  const haut = 34;
  const s = (largeur - gauche - 54) / (lg.L + 2 * m);
  const hauteur = haut + (lg.l + 2 * m) * s + bas;
  const X = (x: number) => gauche + (x + m) * s;
  const Y = (y: number) => haut + (lg.l + m - y) * s;
  const R = (r: Rect) => ({ x: X(r.x0), y: Y(r.y1), width: (r.x1 - r.x0) * s, height: (r.y1 - r.y0) * s });

  // murs extérieurs : remplissages sans contour, puis faces et tableaux en trait fort
  const murs: Rect[] = [];
  const traits: string[] = [];
  const horiz = (f: 'sud' | 'nord') => {
    const [yi, ye] = f === 'sud' ? [0, -m] : [lg.l, lg.l + m];
    const tr = ouvertures(lg, f);
    soustraire(-m, lg.L + m, tr).forEach(([x0, x1]) => murs.push({ x0, x1, y0: Math.min(yi, ye), y1: Math.max(yi, ye) }));
    soustraire(-m, lg.L + m, tr).forEach(([x0, x1]) => traits.push(`M${X(x0)} ${Y(ye)}H${X(x1)}`));
    soustraire(0, lg.L, tr).forEach(([x0, x1]) => traits.push(`M${X(x0)} ${Y(yi)}H${X(x1)}`));
    tr.flat().forEach((x) => traits.push(`M${X(x)} ${Y(yi)}V${Y(ye)}`));
  };
  const vert = (f: 'ouest' | 'est') => {
    const [xi, xe] = f === 'ouest' ? [0, -m] : [lg.L, lg.L + m];
    const tr = ouvertures(lg, f);
    soustraire(0, lg.l, tr).forEach(([y0, y1]) => murs.push({ x0: Math.min(xi, xe), x1: Math.max(xi, xe), y0, y1 }));
    soustraire(-m, lg.l + m, tr).forEach(([y0, y1]) => traits.push(`M${X(xe)} ${Y(y0)}V${Y(y1)}`));
    soustraire(0, lg.l, tr).forEach(([y0, y1]) => traits.push(`M${X(xi)} ${Y(y0)}V${Y(y1)}`));
    tr.flat().forEach((y) => traits.push(`M${X(xi)} ${Y(y)}H${X(xe)}`));
  };
  horiz('sud');
  horiz('nord');
  vert('ouest');
  vert('est');

  // fenêtres (trois traits fins) et portes extérieures (vantail ouvert vers l'intérieur et arc)
  const baie = (b: BaieExterieure) => {
    const h = b.facade === 'sud' || b.facade === 'nord';
    const [yi, ye] = b.facade === 'sud' ? [0, -m] : b.facade === 'nord' ? [lg.l, lg.l + m] : b.facade === 'ouest' ? [0, -m] : [lg.L, lg.L + m];
    const d0 = b.debut;
    const d1 = b.debut + b.largeur;
    if (b.type === 'fenetre') {
      const lignes = [yi, (yi + ye) / 2, ye].map((t) => (h ? `M${X(d0)} ${Y(t)}H${X(d1)}` : `M${X(t)} ${Y(d0)}V${Y(d1)}`));
      return <path key={`${b.facade}${d0}`} d={lignes.join('')} className="t-fin" strokeWidth={0.9} />;
    }
    const dedans = b.facade === 'sud' || b.facade === 'ouest' ? 1 : -1;
    const c: Seg = h ? [X(d1), Y(yi)] : [X(yi), Y(d1)];
    const tip: Seg = h ? [X(d1), Y(yi + dedans * b.largeur)] : [X(yi + dedans * b.largeur), Y(d1)];
    const e: Seg = h ? [X(d0), Y(yi)] : [X(yi), Y(d0)];
    return (
      <g key={`${b.facade}${d0}`}>
        <line x1={c[0]} y1={c[1]} x2={tip[0]} y2={tip[1]} className="t-moyen" />
        <path d={arcPorte(c, tip, e)} className="t-fin" />
      </g>
    );
  };
  const porteInt = (p: PorteInterieure) => {
    const f = p.sens > 0 ? p.nu + lg.cloison : p.nu;
    const [dh, dautre] = p.charniere === 'debut' ? [p.debut, p.debut + p.largeur] : [p.debut + p.largeur, p.debut];
    const c: Seg = p.axe === 'x' ? [X(dh), Y(f)] : [X(f), Y(dh)];
    const tip: Seg = p.axe === 'x' ? [X(dh), Y(f + p.sens * p.largeur)] : [X(f + p.sens * p.largeur), Y(dh)];
    const e: Seg = p.axe === 'x' ? [X(dautre), Y(f)] : [X(f), Y(dautre)];
    return (
      <g key={p.id}>
        <line x1={c[0]} y1={c[1]} x2={tip[0]} y2={tip[1]} className="t-moyen" />
        <path d={arcPorte(c, tip, e)} className="t-fin" />
      </g>
    );
  };

  const fac = a.facades;
  const ligneCotes = (f: 'sud' | 'ouest', dec: number) => {
    const { partielles } = fac[f];
    if (partielles.length < 2) return null;
    let cum = -m;
    return partielles.map((p, i) => {
      const x0 = cum;
      cum += p;
      return f === 'sud' ? (
        <Cote key={`${f}${i}`} x1={X(x0)} y1={Y(-m)} x2={X(cum)} y2={Y(-m)} decalage={-dec} texte={n2(p)} taille={10} />
      ) : (
        <Cote key={`${f}${i}`} x1={X(-m)} y1={Y(x0)} x2={X(-m)} y2={Y(cum)} decalage={dec} texte={n2(p)} taille={10} />
      );
    });
  };
  /** Chaîne intérieure, de nu à nu, des pièces traversées par la droite y = c (axe x) ou x = c (axe y). */
  const chaineInterieure = (axe: 'x' | 'y', c: number) =>
    lg.pieces
      .flatMap((p) => p.rects)
      .filter((r) => (axe === 'x' ? r.y0 < c && c < r.y1 : r.x0 < c && c < r.x1))
      .map((r, i) =>
        axe === 'x' ? (
          <Cote key={`ix${i}`} x1={X(r.x0)} y1={Y(c)} x2={X(r.x1)} y2={Y(c)} texte={n2(r.x1 - r.x0)} taille={10} />
        ) : (
          <Cote key={`iy${i}`} x1={X(c)} y1={Y(r.y0)} x2={X(c)} y2={Y(r.y1)} texte={n2(r.y1 - r.y0)} taille={10} />
        ),
      );
  const principale = lg.pieces.map((p) => [...p.rects].sort((r1, r2) => (r2.x1 - r2.x0) * (r2.y1 - r2.y0) - (r1.x1 - r1.x0) * (r1.y1 - r1.y0))[0]!);

  return (
    <Figure
      alt={
        alt ??
        `Plan du ${lg.nom} : ${n2(a.exterieur.L)} × ${n2(a.exterieur.l)} m hors tout, ${a.pieces.map((p) => `${p.nom} ${n2(p.surface)} m²`).join(', ')} ; murs coupés hachurés, baies repérées, cotes et repère de coupe A-A.`
      }
      largeur={largeur}
      hauteur={hauteur}
    >
      <Hachures prefixe={prefixe} types={['maconnerie']} />
      {murs.map((r, i) => (
        <rect key={i} {...R(r)} fill={hachure(prefixe, 'maconnerie')} />
      ))}
      <path d={traits.join('')} className="t-fort" />
      {lg.cloisons.map((r, i) => (
        <rect key={`c${i}`} {...R(r)} fill={hachure(prefixe, 'maconnerie')} className="t-moyen" />
      ))}
      {lg.baies.map(baie)}
      {lg.portes.map(porteInt)}
      {reperes
        ? lg.baies.map((b) => {
            const mil = b.debut + b.largeur / 2;
            const [x, y] =
              b.facade === 'sud' ? [X(mil), Y(0) - 5] : b.facade === 'nord' ? [X(mil), Y(lg.l) + 13] : b.facade === 'ouest' ? [X(0) + 5, Y(mil) + 4] : [X(lg.L) - 5, Y(mil) + 4];
            return (
              <Etiquette key={`r${b.facade}${b.debut}`} x={x} y={y} ancre={b.facade === 'ouest' ? 'start' : b.facade === 'est' ? 'end' : 'middle'} taille={9.5} couleur={BLEU}>
                {b.id}
              </Etiquette>
            );
          })
        : null}
      {lg.pieces.map((p, i) => {
        const r = principale[i]!;
        const cx = X((r.x0 + r.x1) / 2);
        const cy = Y((r.y0 + r.y1) / 2);
        return (
          <g key={p.nom}>
            <Etiquette x={cx} y={cy - (surfaces ? 2 : -4)} ancre="middle" taille={11} gras>
              {p.nom}
            </Etiquette>
            {surfaces ? (
              <Etiquette x={cx} y={cy + 12} ancre="middle" taille={10.5}>
                {`${n2(a.pieces[i]!.surface)} m²`}
              </Etiquette>
            ) : null}
            {niveaux ? <NiveauPlan x={cx - 20} y={cy + 30} texte={niv(p.niveau)} /> : null}
          </g>
        );
      })}
      {cotes === 'completes' ? (
        <g>
          {ligneCotes('sud', 18)}
          <Cote x1={X(-m)} y1={Y(-m)} x2={X(lg.L + m)} y2={Y(-m)} decalage={-40} texte={n2(a.exterieur.L)} />
          {ligneCotes('ouest', 22)}
          <Cote x1={X(-m)} y1={Y(-m)} x2={X(-m)} y2={Y(lg.l + m)} decalage={46} texte={n2(a.exterieur.l)} />
          {chaineInterieure('x', lg.l * 0.12)}
          {chaineInterieure('y', lg.L - 0.2)}
        </g>
      ) : cotes === 'totales' ? (
        <g>
          <Cote x1={X(-m)} y1={Y(-m)} x2={X(lg.L + m)} y2={Y(-m)} decalage={-22} texte={n2(a.exterieur.L)} />
          <Cote x1={X(-m)} y1={Y(-m)} x2={X(-m)} y2={Y(lg.l + m)} decalage={22} texte={n2(a.exterieur.l)} />
        </g>
      ) : null}
      {coupe ? <RepereCoupe x1={X(lg.coupe)} y1={Y(-m) + 22} x2={X(lg.coupe)} y2={Y(lg.l + m) - 18} nom="A" sens={-1} /> : null}
      <Nord x={largeur - 26} y={haut + 18} taille={12} />
    </Figure>
  );
}

/** Façade (élévation) sud : baies, soubassement, bandeau de dalle, acrotère, marches d'entrée, niveaux. */
export function FacadeLogement({ lg, prefixe, largeur = 620, cotes = true, alt }: { lg: Logement; prefixe: string; largeur?: number; cotes?: boolean; alt?: string }) {
  const a = analyseLogement(lg);
  const n = a.niveaux;
  const m = lg.mur;
  const gauche = 40;
  const droite = 92;
  const s = (largeur - gauche - droite) / (lg.L + 2 * m);
  const zBas = lg.tn - 0.22;
  const haut = 24;
  const hauteur = haut + (n.acrotere - zBas) * s + (cotes ? 46 : 14);
  const X = (x: number) => gauche + (x + m) * s;
  const Z = (z: number) => haut + (n.acrotere - z) * s;
  const baies = lg.baies.filter((b) => b.facade === 'sud');
  const cadre = 0.05 * s;
  return (
    <Figure
      alt={
        alt ??
        `Façade sud du ${lg.nom} : ${n2(a.exterieur.L)} m de long, ${n2(a.hauteurHorsSol)} m de haut au-dessus du terrain ; ${baies.map((b) => `${b.id} ${n2(b.largeur)} × ${n2(b.hauteur)} m`).join(', ')} ; niveaux du terrain, du sol fini et de l'acrotère.`
      }
      largeur={largeur}
      hauteur={hauteur}
    >
      <Hachures prefixe={prefixe} types={['terre']} />
      <rect x={X(-m) - 30} y={Z(lg.tn)} width={(lg.L + 2 * m) * s + 60} height={(lg.tn - zBas) * s} fill={hachure(prefixe, 'terre')} />
      <rect x={X(-m)} y={Z(n.acrotere)} width={(lg.L + 2 * m) * s} height={(n.acrotere - lg.tn) * s} fill="var(--color-papier)" className="t-fort" />
      <rect x={X(-m)} y={Z(0)} width={(lg.L + 2 * m) * s} height={(0 - lg.tn) * s} fill="var(--fond-beton)" className="t-moyen" />
      <rect x={X(-m)} y={Z(n.dessusDalle)} width={(lg.L + 2 * m) * s} height={lg.dalle * s} fill="var(--fond-beton)" className="t-moyen" />
      {baies.map((b) => {
        const x0 = X(b.debut);
        const w = b.largeur * s;
        const zt = b.allege + b.hauteur;
        return (
          <g key={b.debut}>
            <rect x={x0} y={Z(zt)} width={w} height={b.hauteur * s} fill="var(--fond-eau)" className="t-moyen" />
            <rect x={x0 + cadre} y={Z(zt) + cadre} width={w - 2 * cadre} height={b.hauteur * s - (b.type === 'porte' ? cadre : 2 * cadre)} fill="none" className="t-fin" />
            {b.type === 'fenetre' ? (
              <g>
                <line x1={x0 + w / 2} y1={Z(zt) + cadre} x2={x0 + w / 2} y2={Z(b.allege) - cadre} className="t-fin" />
                <rect x={x0 - 3} y={Z(b.allege)} width={w + 6} height={3} fill="var(--trait)" />
              </g>
            ) : (
              <g>
                <circle cx={x0 + w - 3 * cadre} cy={Z(1.0)} r={2} fill="var(--trait)" />
                {lg.tn < 0
                  ? [0, 1].map((i) => (
                      <rect key={i} x={x0 - 0.2 * s + i * 0.1 * s} y={Z(lg.tn * (1 - (i + 1) / 2))} width={w + 0.4 * s - i * 0.2 * s} height={(-lg.tn / 2) * s} fill="var(--fond-beton)" className="t-moyen" />
                    ))
                  : null}
              </g>
            )}
            <Etiquette x={x0 + w / 2} y={Z(zt) - 4} ancre="middle" taille={9.5} couleur={BLEU}>
              {b.id}
            </Etiquette>
          </g>
        );
      })}
      <line x1={X(-m) - 30} y1={Z(lg.tn)} x2={X(lg.L + m) + 30} y2={Z(lg.tn)} className="t-fort" />
      {[
        [lg.tn, `${niv(lg.tn)} TN`],
        [0, '±0,00'],
        [n.dessusDalle, niv(n.dessusDalle)],
        [n.acrotere, niv(n.acrotere)],
      ].map(([z, t]) => (
        <Niveau key={String(t)} x={X(lg.L + m) + 18} y={Z(z as number)} texte={t as string} longueur={58} />
      ))}
      {cotes ? <Cote x1={X(-m)} y1={Z(lg.tn)} x2={X(lg.L + m)} y2={Z(lg.tn)} decalage={-36} texte={n2(a.exterieur.L)} /> : null}
    </Figure>
  );
}

/** Coupe A-A perpendiculaire à la façade sud : fondations, dallage, murs et baies coupés, dalle, acrotères, niveaux. */
export function CoupeLogement({ lg, prefixe, largeur = 620, cotes = true, noms = true, alt }: { lg: Logement; prefixe: string; largeur?: number; cotes?: boolean; noms?: boolean; alt?: string }) {
  const a = analyseLogement(lg);
  const n = a.niveaux;
  const m = lg.mur;
  const gauche = 96;
  const droite = 64;
  const s = (largeur - gauche - droite) / (lg.l + 2 * m + 0.8);
  const haut = cotes ? 40 : 22;
  const zBas = lg.semelle.fond - 0.15;
  const hauteur = haut + (n.acrotere - zBas) * s + 16;
  const Y = (y: number) => gauche + (y + m + 0.4) * s;
  const Z = (z: number) => haut + (n.acrotere - z) * s;
  const box = (y0: number, y1: number, z0: number, z1: number) => ({ x: Y(y0), y: Z(z1), width: (y1 - y0) * s, height: (z1 - z0) * s });
  const dallage = 0.1;
  const herisson = 0.15;
  const acro = m / 2;
  const sem = lg.semelle;
  const coupees = (f: 'sud' | 'nord') => lg.baies.find((b) => b.facade === f && b.debut < lg.coupe && lg.coupe < b.debut + b.largeur);
  const mur = (f: 'sud' | 'nord') => {
    const [y0, y1] = f === 'sud' ? [-m, 0] : [lg.l, lg.l + m];
    const b = coupees(f);
    const parts: React.ReactNode[] = [];
    const bloc = (z0: number, z1: number, t: 'maconnerie' | 'ba', k: string) => <rect key={k} {...box(y0, y1, z0, z1)} fill={hachure(prefixe, t)} className="t-fort" />;
    if (!b) parts.push(bloc(0, lg.hsp, 'maconnerie', 'plein'));
    else {
      const zt = b.allege + b.hauteur;
      if (b.allege > 0) parts.push(bloc(0, b.allege, 'maconnerie', 'allege'));
      parts.push(bloc(zt, zt + 0.2, 'ba', 'linteau'));
      if (zt + 0.2 < lg.hsp) parts.push(bloc(zt + 0.2, lg.hsp, 'maconnerie', 'dessus'));
      const ym = (y0 + y1) / 2;
      parts.push(<rect key="cadre" {...box(ym - 0.03, ym + 0.03, b.allege, zt)} fill="var(--fond-eau)" className="t-moyen" />);
      if (b.allege > 0) {
        const dehors = f === 'sud' ? y0 - 0.05 : y1 + 0.05;
        parts.push(<rect key="appui" {...box(Math.min(dehors, ym), Math.max(dehors, ym), b.allege - 0.04, b.allege)} fill="var(--fond-beton)" className="t-moyen" />);
      }
    }
    return <g key={f}>{parts}</g>;
  };
  const fondation = (yc: number) => (
    <g key={yc}>
      <rect {...box(yc - sem.largeur / 2, yc + sem.largeur / 2, sem.fond, sem.fond + sem.hauteur)} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect {...box(yc - m / 2, yc + m / 2, sem.fond + sem.hauteur, -0.2)} fill={hachure(prefixe, 'maconnerie')} className="t-fort" />
      <rect {...box(yc - m / 2, yc + m / 2, -0.2, 0)} fill={hachure(prefixe, 'ba')} className="t-fort" />
    </g>
  );
  const etiquettes: [number, string][] = [
    [sem.fond, niv(sem.fond)],
    [lg.tn, `${niv(lg.tn)} TN`],
    [0, '±0,00'],
    [lg.hsp, niv(lg.hsp)],
    [n.dessusDalle, niv(n.dessusDalle)],
    [n.acrotere, niv(n.acrotere)],
  ];
  return (
    <Figure
      alt={
        alt ??
        `Coupe A-A du ${lg.nom} : semelles filantes, soubassement et chaînage, dallage sur hérisson, murs coupés${coupees('sud') ? ' avec la fenêtre sud' : ''}, dalle de ${n2(lg.dalle)} m et acrotères ; hauteur sous plafond ${n2(lg.hsp)} m, acrotère à ${niv(n.acrotere)}.`
      }
      largeur={largeur}
      hauteur={hauteur}
    >
      <Hachures prefixe={prefixe} types={['ba', 'maconnerie', 'terre', 'gravier']} />
      <rect x={Y(-m - 0.4)} y={Z(lg.tn)} width={(lg.l + 2 * m + 0.8) * s} height={(lg.tn - zBas) * s} fill={hachure(prefixe, 'terre')} />
      <rect {...box(0, lg.l, -lg.revetement - dallage - herisson, -lg.revetement - dallage)} fill={hachure(prefixe, 'gravier')} />
      <rect {...box(0, lg.l, -lg.revetement - dallage, -lg.revetement)} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect {...box(0, lg.l, -lg.revetement, 0)} fill="var(--fond-beton)" className="t-moyen" />
      {fondation(-m / 2)}
      {fondation(lg.l + m / 2)}
      {mur('sud')}
      {mur('nord')}
      <rect {...box(-m, lg.l + m, lg.hsp, n.dessusDalle)} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect {...box(-m, -m + acro, n.dessusDalle, n.acrotere)} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect {...box(lg.l + m - acro, lg.l + m, n.dessusDalle, n.acrotere)} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <line x1={Y(-m - 0.4)} y1={Z(lg.tn)} x2={Y(-m)} y2={Z(lg.tn)} className="t-fort" />
      <line x1={Y(lg.l + m)} y1={Z(lg.tn)} x2={Y(lg.l + m + 0.4)} y2={Z(lg.tn)} className="t-fort" />
      {etiquettes.map(([z, t]) => (
        <Niveau key={t} x={Y(-m - 0.4) - 8} y={Z(z)} texte={t} longueur={52} vers="gauche" />
      ))}
      {cotes ? (
        <g>
          <Cote x1={Y(lg.l * 0.7)} y1={Z(0)} x2={Y(lg.l * 0.7)} y2={Z(lg.hsp)} texte={n2(lg.hsp)} taille={10.5} />
          <Cote x1={Y(-m)} y1={Z(n.acrotere)} x2={Y(lg.l + m)} y2={Z(n.acrotere)} decalage={18} texte={n2(a.exterieur.l)} />
          <Cote x1={Y(lg.l + m + 0.4)} y1={Z(lg.tn)} x2={Y(lg.l + m + 0.4)} y2={Z(n.acrotere)} decalage={-14} texte={n2(a.hauteurHorsSol)} />
        </g>
      ) : null}
      {noms ? (
        <g>
          <Etiquette x={Y(lg.l / 2)} y={Z(n.dessusDalle) + 11} ancre="middle" taille={10}>
            dalle
          </Etiquette>
          <Renvoi de={[Y(lg.l * 0.18), Z(0.42)]} vers={[Y(lg.l * 0.12), Z(-lg.revetement - dallage / 2)]} texte="dallage" />
          <Renvoi de={[Y(lg.l * 0.42), Z(0.42)]} vers={[Y(lg.l * 0.36), Z(-lg.revetement - dallage - herisson / 2)]} texte="hérisson" />
          <Etiquette x={Y(lg.l + m / 2)} y={Z(sem.fond) + 13} ancre="middle" taille={9.5}>
            semelle
          </Etiquette>
          <Etiquette x={Y(lg.l / 2)} y={Z(lg.hsp / 2)} ancre="middle" taille={11} gras couleur={BLEU}>
            {lg.pieces[0]!.nom}
          </Etiquette>
        </g>
      ) : null}
    </Figure>
  );
}
