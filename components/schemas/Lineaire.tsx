// Schémas du module L1.4 (algèbre linéaire). Les valeurs viennent de lib/calc/lineaire.ts.
// Code couleur : données et vecteurs en bleu, résultats en vert, charges et contradictions en rouge.
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Axes, Droite, PointGraphe, repere2D } from '@/components/drawing/Graphe';
import { CercleMohr } from '@/components/drawing/Graphes';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { cadreIsoDirect, Fleche3 } from '@/components/drawing/Iso3D';
import { AppuiDouble, AppuiSimple } from '@/components/drawing/Mecanique';
import { Calque } from '@/components/gabarits/Vue3D';
import {
  CAS_DROITES,
  determinant,
  ELEMENTS_METRE,
  GRANULATS,
  MATERIAUX_METRE,
  natureSysteme,
  pivotGauss,
  QUANTITES_UNITAIRES,
  type BarreNoeud,
  type DonneesContraintes,
  type DonneesTriangle,
  type Granulat,
  type MatriceL,
  type NatureSysteme,
  type PointAppui,
} from '@/lib/calc/lineaire';
import type { Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { nombre, nombreCourt } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
/** Nombre sans zéros inutiles : 3 ; 3,5. */
const nc = (x: number) => nombreCourt(x, 2);
/** Coefficient devant une inconnue : rien pour 1, « 2 » pour 2. */
const coef = (x: number) => (Math.abs(x - 1) < 1e-12 ? '' : `${nc(x)} `);
const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const rad = (deg: number) => (deg * Math.PI) / 180;

// ---------- L1.4.1 : le métré, un produit matriciel ----------

/** Tableau de métré : nombre d'éléments (n) × quantités par élément (Q) = totaux par matériau (nᵀ Q), colonne du béton détaillée. */
export function ProduitMetre({ n, totaux, Q = QUANTITES_UNITAIRES }: { n: readonly number[]; totaux: readonly number[]; Q?: MatriceL }) {
  const decs = [2, 0, 1];
  const xN = 44;
  const xNom = 92;
  const x0 = 178;
  const w = 76;
  const y0 = 78;
  const h = 32;
  const cx = (j: number) => x0 + w * j + w / 2;
  const cy = (i: number) => y0 + h * i + h / 2 + 5;
  const yT = y0 + 3 * h + 34;
  const xd = 440;
  return (
    <Figure alt={`Métré matriciel : ${n.map((v, i) => `${v} ${ELEMENTS_METRE[i]}s`).join(', ')} ; totaux ${totaux.map((t, j) => `${nombre(t, decs[j]!)} ${MATERIAUX_METRE[j]!.unite}`).join(', ')}`} largeur={620} hauteur={268}>
      <rect x={x0} y={y0 - 34} width={w} height={yT - y0 + 50} fill="var(--color-encre-clair)" opacity={0.7} />
      <rect x={xN - 24} y={y0 - 34} width={48} height={3 * h + 34} fill="var(--color-encre-clair)" opacity={0.7} />
      <Etiquette x={xN} y={y0 - 12} ancre="middle" taille={12} gras couleur={BLEU}>
        n
      </Etiquette>
      {MATERIAUX_METRE.map((m, j) => (
        <Etiquette key={m.nom} x={cx(j)} y={y0 - 12} ancre="middle" taille={12} gras>
          {m.nom} ({m.unite})
        </Etiquette>
      ))}
      <Etiquette x={x0 + 1.5 * w} y={y0 - 44} ancre="middle" taille={12} classe="etiquette">
        Q : quantités pour un élément
      </Etiquette>
      {ELEMENTS_METRE.map((el, i) => (
        <g key={el}>
          <Etiquette x={xN} y={cy(i)} ancre="middle" taille={14} gras couleur={BLEU}>
            {n[i]}
          </Etiquette>
          <Etiquette x={xNom} y={cy(i)} taille={12.5}>
            × {el}
          </Etiquette>
          {Q[i]!.map((q, j) => (
            <Etiquette key={j} x={cx(j)} y={cy(i)} ancre="middle" taille={13}>
              {nombre(q, decs[j]!)}
            </Etiquette>
          ))}
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`h${i}`} x1={x0} y1={y0 + h * i} x2={x0 + 3 * w} y2={y0 + h * i} className="t-fin" />
      ))}
      {[0, 1, 2, 3].map((j) => (
        <line key={`v${j}`} x1={x0 + w * j} y1={y0} x2={x0 + w * j} y2={y0 + 3 * h} className="t-fin" />
      ))}
      <line x1={xNom - 4} y1={yT - 24} x2={x0 + 3 * w} y2={yT - 24} className="t-fort" />
      <Etiquette x={xNom - 4} y={yT} taille={12.5} gras couleur={VERT}>
        totaux nᵀ Q
      </Etiquette>
      {totaux.map((t, j) => (
        <Etiquette key={j} x={cx(j)} y={yT} ancre="middle" taille={14} gras couleur={VERT}>
          {nombre(t, decs[j]!)}
        </Etiquette>
      ))}
      <Etiquette x={xd} y={70} taille={12.5} gras>
        Règle des dimensions
      </Etiquette>
      <Etiquette x={xd} y={96} taille={14}>
        (1 × <tspan fill={VERT} fontWeight={700}>3</tspan>) · (<tspan fill={VERT} fontWeight={700}>3</tspan> × 3) → (1 × 3)
      </Etiquette>
      <Etiquette x={xd} y={118} taille={11.5} classe="etiquette">
        les nombres du milieu doivent être égaux :
      </Etiquette>
      <Etiquette x={xd} y={134} taille={11.5} classe="etiquette">
        autant d’éléments dans n que de lignes dans Q
      </Etiquette>
      <Etiquette x={xd} y={166} taille={12.5} gras>
        Une case du résultat
      </Etiquette>
      <Etiquette x={xd} y={186} taille={11.5} classe="etiquette">
        = la ligne n × une colonne de Q,
      </Etiquette>
      <Etiquette x={xd} y={202} taille={11.5} classe="etiquette">
        terme à terme, puis la somme
      </Etiquette>
      <Etiquette x={20} y={256} taille={13} gras couleur={BLEU}>
        béton : {n[0]} × {n2(Q[0]![0]!)} + {n[1]} × {n2(Q[1]![0]!)} + {n[2]} × {n2(Q[2]![0]!)} = {n2(totaux[0]!)} m³
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.4.2 : le mélange de granulats « en colonnes » ----------

const COULEURS_GRANULATS = [
  { fond: 'var(--color-terre-clair)', trait: 'var(--color-terre)' },
  { fond: 'var(--color-brique-clair)', trait: 'var(--color-brique)' },
  { fond: 'var(--color-beton-clair)', trait: 'var(--color-beton)' },
] as const;

/** Chaque barre est une équation du système : la part de chaque granulat s'empile jusqu'à l'objectif (proportions x, y, z). */
export function MelangeColonnes({ x, cible5, cible15, g = GRANULATS }: { x: readonly number[] | null; cible5: number; cible15: number; g?: readonly Granulat[] }) {
  const ok = x !== null && x.every((v) => v >= -1e-9);
  const barres = [
    { titre: 'x + y + z', sous: 'somme des proportions', coef: g.map(() => 1), cible: 1 },
    { titre: 'passant à 5 mm', sous: 'tamis de 5 mm', coef: g.map((q) => q.p5), cible: cible5 },
    { titre: 'passant à 15 mm', sous: 'tamis de 15 mm', coef: g.map((q) => q.p15), cible: cible15 },
  ];
  const Y = (v: number) => 252 - v * 200;
  const cx = (i: number) => 138 + i * 100;
  return (
    <Figure
      alt={ok ? `Mélange de granulats : ${g.map((q, i) => `${q.nom} ${n1(x![i]! * 100)} %`).join(', ')} ; chaque barre empile la part de chaque granulat jusqu'à l'objectif` : 'Mélange impossible : une proportion serait négative'}
      largeur={620}
      hauteur={300}
    >
      <line x1={70} y1={Y(0)} x2={390} y2={Y(0)} className="t-moyen" />
      <line x1={70} y1={Y(0)} x2={70} y2={Y(1) - 14} className="t-moyen" />
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line x1={66} y1={Y(v)} x2={70} y2={Y(v)} className="t-fin" />
          <Etiquette x={62} y={Y(v) + 4} ancre="end" taille={10.5}>
            {nombre(v * 100, 0)} %
          </Etiquette>
        </g>
      ))}
      {ok
        ? barres.map((b, i) => {
            let cumul = 0;
            return (
              <g key={b.titre}>
                {g.map((q, k) => {
                  const part = x![k]! * b.coef[k]!;
                  const bas = cumul;
                  cumul += part;
                  const haut = Y(cumul);
                  const hauteur = Y(bas) - haut;
                  return (
                    <g key={q.nom}>
                      <rect x={cx(i) - 30} y={haut} width={60} height={Math.max(0, hauteur)} fill={COULEURS_GRANULATS[k]!.fond} stroke={COULEURS_GRANULATS[k]!.trait} strokeWidth={1.2} />
                      {hauteur > 15 ? (
                        <Etiquette x={cx(i)} y={haut + hauteur / 2 + 4} ancre="middle" taille={10.5}>
                          {n1(part * 100)}
                        </Etiquette>
                      ) : null}
                    </g>
                  );
                })}
                <line x1={cx(i) - 42} y1={Y(b.cible)} x2={cx(i) + 42} y2={Y(b.cible)} stroke={ROUGE} strokeWidth={1.6} strokeDasharray="5 3" />
                <Etiquette x={cx(i)} y={Y(b.cible) - 7} ancre="middle" taille={11.5} gras couleur={ROUGE}>
                  objectif {nombre(b.cible * 100, 0)} %
                </Etiquette>
                <Etiquette x={cx(i)} y={Y(0) + 16} ancre="middle" taille={11.5} gras>
                  {b.titre}
                </Etiquette>
                <Etiquette x={cx(i)} y={Y(0) + 30} ancre="middle" taille={10.5} classe="etiquette">
                  équation {i + 1}
                </Etiquette>
              </g>
            );
          })
        : (
            <Etiquette x={230} y={150} ancre="middle" taille={12.5} gras couleur={ROUGE}>
              une proportion serait négative : mélange impossible
            </Etiquette>
          )}
      <Etiquette x={420} y={70} taille={12.5} gras>
        Proportions du mélange
      </Etiquette>
      {g.map((q, k) => (
        <g key={q.nom}>
          <rect x={420} y={88 + k * 34} width={22} height={16} fill={COULEURS_GRANULATS[k]!.fond} stroke={COULEURS_GRANULATS[k]!.trait} strokeWidth={1.2} />
          <Etiquette x={450} y={101 + k * 34} taille={12}>
            {q.nom} : <tspan fontWeight={700}>{['x', 'y', 'z'][k]} = {ok ? `${n1(x![k]! * 100)} %` : '—'}</tspan>
          </Etiquette>
        </g>
      ))}
      <Etiquette x={420} y={210} taille={11} classe="etiquette">
        nombres dans les barres :
      </Etiquette>
      <Etiquette x={420} y={225} taille={11} classe="etiquette">
        part de chaque granulat, en %
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.4.3 : le déterminant, une aire ----------

/** Trois lectures du déterminant : aire du parallélogramme des colonnes, double de l'aire du triangle des appuis, zéro quand les appuis sont alignés. */
export function AireDeterminant({ M2, appuis, alignes }: { M2: MatriceL; appuis: readonly PointAppui[]; alignes: readonly PointAppui[] }) {
  const det2 = determinant(M2);
  const matrice3 = (a: readonly PointAppui[]) => [a.map(() => 1), a.map((p) => p.x), a.map((p) => p.y)];
  const det3 = determinant(matrice3(appuis));
  const det0 = determinant(matrice3(alignes));
  const u = [M2[0]![0]!, M2[1]![0]!] as const;
  const v = [M2[0]![1]!, M2[1]![1]!] as const;
  const k1 = 34;
  const o1 = [24, 200] as const;
  const P1 = (x: number, y: number) => [o1[0] + x * k1, o1[1] - y * k1] as const;
  const xs = appuis.map((a) => a.x);
  const ys = appuis.map((a) => a.y);
  const k2 = Math.min(150 / (Math.max(...xs) - Math.min(...xs) || 1), 130 / (Math.max(...ys) - Math.min(...ys) || 1));
  const P2 = (x: number, y: number) => [228 + (x - Math.min(...xs)) * k2, 200 - (y - Math.min(...ys)) * k2] as const;
  const xa = alignes.map((a) => a.x);
  const k3 = 150 / (Math.max(...xa) - Math.min(...xa) || 1);
  const P3 = (x: number) => [440 + (x - Math.min(...xa)) * k3, 150] as const;
  return (
    <Figure alt={`Le déterminant comme une aire : parallélogramme des colonnes d'aire ${nc(det2)}, triangle des appuis d'aire ${nc(Math.abs(det3) / 2)} m² (det = ${nc(det3)}), appuis alignés : det = ${nc(det0)}`} largeur={620} hauteur={270}>
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <line x1={P1(i, 0)[0]} y1={P1(i, 0)[1]} x2={P1(i, 4)[0]} y2={P1(i, 4)[1]} className="t-fin" opacity={0.5} />
          {i < 5 ? <line x1={P1(0, i)[0]} y1={P1(0, i)[1]} x2={P1(5, i)[0]} y2={P1(5, i)[1]} className="t-fin" opacity={0.5} /> : null}
        </g>
      ))}
      <polygon points={points([P1(0, 0), P1(u[0], u[1]), P1(u[0] + v[0], u[1] + v[1]), P1(v[0], v[1])])} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1} />
      <Fleche x1={P1(0, 0)[0]} y1={P1(0, 0)[1]} x2={P1(u[0], u[1])[0]} y2={P1(u[0], u[1])[1]} couleur={BLEU} epaisseur={2.4} tete={9} />
      <Fleche x1={P1(0, 0)[0]} y1={P1(0, 0)[1]} x2={P1(v[0], v[1])[0]} y2={P1(v[0], v[1])[1]} couleur={VERT} epaisseur={2.4} tete={9} />
      <Etiquette x={P1(u[0], u[1])[0] + 4} y={P1(u[0], u[1])[1] + 16} taille={12} gras couleur={BLEU}>
        u ({nc(u[0])} ; {nc(u[1])})
      </Etiquette>
      <Etiquette x={P1(v[0], v[1])[0] - 6} y={P1(v[0], v[1])[1] - 8} ancre="middle" taille={12} gras couleur={VERT}>
        v ({nc(v[0])} ; {nc(v[1])})
      </Etiquette>
      <Etiquette x={24} y={30} taille={12.5} gras>
        1. Colonnes de la matrice
      </Etiquette>
      <Etiquette x={24} y={228} taille={12}>
        det = {nc(u[0])} × {nc(v[1])} − {nc(v[0])} × {nc(u[1])} = <tspan fontWeight={700}>{nc(det2)}</tspan>
      </Etiquette>
      <Etiquette x={24} y={246} taille={11} classe="etiquette">
        = aire du parallélogramme (en carreaux)
      </Etiquette>

      <polygon points={points(appuis.map((a) => P2(a.x, a.y)))} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1.6} />
      {appuis.map((a) => (
        <g key={a.nom}>
          <circle cx={P2(a.x, a.y)[0]} cy={P2(a.x, a.y)[1]} r={4.5} fill="var(--trait)" />
          <Etiquette x={P2(a.x, a.y)[0] + (a.y > Math.min(...ys) ? 8 : 0)} y={P2(a.x, a.y)[1] + (a.y > Math.min(...ys) ? 0 : 17)} ancre={a.y > Math.min(...ys) ? 'start' : 'middle'} taille={12} gras>
            {a.nom} ({nc(a.x)} ; {nc(a.y)})
          </Etiquette>
        </g>
      ))}
      <Etiquette x={228} y={30} taille={12.5} gras>
        2. Appuis en triangle
      </Etiquette>
      <Etiquette x={228} y={234} taille={12}>
        det M = <tspan fontWeight={700}>{nc(det3)}</tspan> = 2 × aire
      </Etiquette>
      <Etiquette x={228} y={252} taille={11} classe="etiquette">
        aire du triangle : {nc(Math.abs(det3) / 2)} m²
      </Etiquette>

      <line x1={P3(Math.min(...xa))[0] - 10} y1={150} x2={P3(Math.max(...xa))[0] + 10} y2={150} stroke={ROUGE} strokeWidth={1.6} strokeDasharray="5 3" />
      {alignes.map((a) => (
        <g key={a.nom}>
          <circle cx={P3(a.x)[0]} cy={150} r={4.5} fill="var(--trait)" />
          <Etiquette x={P3(a.x)[0]} y={136} ancre="middle" taille={12} gras>
            {a.nom}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={440} y={30} taille={12.5} gras>
        3. Appuis alignés
      </Etiquette>
      <Etiquette x={440} y={234} taille={12} couleur={ROUGE}>
        aire nulle : det M = <tspan fontWeight={700}>{nc(det0)}</tspan>
      </Etiquette>
      <Etiquette x={440} y={252} taille={11} classe="etiquette">
        M n’a pas d’inverse
      </Etiquette>
    </Figure>
  );
}

/** Plateau sur trois appuis vu en plan : triangle (ou ligne) des appuis, charge, et nature du système M R = F. */
export function PlateauRang({ appuis, F, xF, yF, nature, R }: { appuis: readonly PointAppui[]; F: number; xF: number; yF: number; nature: NatureSysteme; R?: readonly number[] | null }) {
  const k = 56;
  const yHaut = Math.max(1.6, yF, ...appuis.map((a) => a.y)) + 0.5;
  const hauteur = Math.max(210, 40 + yHaut * k + 46);
  const X = (x: number) => 70 + x * k;
  const Y = (y: number) => hauteur - 46 - y * k;
  const triangle = Math.abs(determinant([appuis.map(() => 1), appuis.map((a) => a.x), appuis.map((a) => a.y)])) > 1e-9;
  const verdict = {
    unique: { titre: 'solution unique', lignes: ['une seule répartition :', 'la statique suffit'], couleur: VERT },
    infinite: { titre: 'infinité de solutions', lignes: ['une infinité de répartitions :', 'la statique ne suffit pas'], couleur: BLEU },
    aucune: { titre: 'aucune solution', lignes: ['aucune répartition :', 'le plateau bascule'], couleur: ROUGE },
  }[nature];
  return (
    <Figure alt={`Plateau en plan : appuis ${appuis.map((a) => `${a.nom} (${nc(a.x)} ; ${nc(a.y)})`).join(', ')}, charge de ${n1(F)} kN en (${nc(xF)} ; ${nc(yF)}) : ${verdict.titre}`} largeur={620} hauteur={hauteur}>
      <Fleche x1={X(-0.5)} y1={Y(0)} x2={X(4.8)} y2={Y(0)} couleur="var(--trait)" epaisseur={1} tete={7} />
      <Fleche x1={X(0)} y1={Y(-0.3)} x2={X(0)} y2={Y(yHaut - 0.1)} couleur="var(--trait)" epaisseur={1} tete={7} />
      <Etiquette x={X(4.8)} y={Y(0) + 16} ancre="end" taille={11} gras>
        x (m)
      </Etiquette>
      <Etiquette x={X(0) + 8} y={Y(yHaut - 0.1) + 4} taille={11} gras>
        y (m)
      </Etiquette>
      {triangle ? (
        <polygon points={points(appuis.map((a) => [X(a.x), Y(a.y)] as const))} fill="var(--color-beton-clair)" stroke="var(--trait)" strokeWidth={1.4} opacity={0.9} />
      ) : (
        <line x1={X(Math.min(...appuis.map((a) => a.x)))} y1={Y(appuis[0]!.y)} x2={X(Math.max(...appuis.map((a) => a.x)))} y2={Y(appuis[0]!.y)} stroke={ROUGE} strokeWidth={1.6} strokeDasharray="5 3" />
      )}
      {appuis.map((a, i) => (
        <g key={a.nom}>
          <polygon points={points([[X(a.x), Y(a.y) - 7], [X(a.x) - 7, Y(a.y) + 5], [X(a.x) + 7, Y(a.y) + 5]])} fill="var(--trait)" />
          <Etiquette x={X(a.x)} y={Y(a.y) + (a.y > 0.2 ? -12 : 22)} ancre="middle" taille={12} gras>
            {a.nom}
            {R ? ` : ${n2(R[i]!)} kN` : ''}
          </Etiquette>
        </g>
      ))}
      <circle cx={X(xF)} cy={Y(yF)} r={7} fill="none" stroke={ROUGE} strokeWidth={2} />
      <line x1={X(xF) - 5} y1={Y(yF) - 5} x2={X(xF) + 5} y2={Y(yF) + 5} stroke={ROUGE} strokeWidth={2} />
      <line x1={X(xF) - 5} y1={Y(yF) + 5} x2={X(xF) + 5} y2={Y(yF) - 5} stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={X(xF) + 11} y={Y(yF) - 8} taille={12} gras couleur={ROUGE}>
        F = {n1(F)} kN
      </Etiquette>
      <Etiquette x={400} y={40} taille={12.5} gras>
        Nature du système M R = F
      </Etiquette>
      <Etiquette x={400} y={64} taille={12} couleur={verdict.couleur} gras>
        {verdict.titre}
      </Etiquette>
      {verdict.lignes.map((t, i) => (
        <Etiquette key={i} x={400} y={88 + i * 17} taille={11.5} classe="etiquette">
          {t}
        </Etiquette>
      ))}
      {triangle ? (
        <>
          <Etiquette x={400} y={142} taille={11} classe="etiquette">
            triangle grisé : zone où la charge
          </Etiquette>
          <Etiquette x={400} y={157} taille={11} classe="etiquette">
            laisse les trois réactions positives
          </Etiquette>
        </>
      ) : (
        <Etiquette x={400} y={142} taille={11} classe="etiquette">
          appuis alignés : det M = 0
        </Etiquette>
      )}
    </Figure>
  );
}

// ---------- L1.4.4 : rang et position de deux droites ----------

/** Deux équations à deux inconnues : deux droites sécantes (une solution), confondues (une infinité), parallèles (aucune). */
export function TroisCasDroites() {
  const titres = { secantes: 'une solution', confondues: 'une infinité', paralleles: 'aucune solution' } as const;
  return (
    <Figure alt="Trois systèmes de deux équations : droites sécantes (une solution), confondues (une infinité de solutions), parallèles (aucune solution)" largeur={620} hauteur={270}>
      {CAS_DROITES.map((c, i) => {
        const R = repere2D({ x0: 28 + i * 204, y0: 44, l: 150, h: 150, xmin: -0.5, xmax: 4, ymin: -0.5, ymax: 4 });
        const nat = natureSysteme(c.A, c.b);
        const sol = nat.nature === 'unique' ? pivotGauss(c.A, c.b).x : null;
        const couleurs = [BLEU, ROUGE];
        return (
          <g key={c.id}>
            <Etiquette x={R.x0 + 75} y={26} ancre="middle" taille={12.5} gras>
              {i + 1}. {titres[c.id as keyof typeof titres]}
            </Etiquette>
            <Axes R={R} gradX={[1, 2, 3]} gradY={[1, 2, 3]} titreX="x" titreY="y" />
            {c.A.map((l, k) => (
              <Droite key={k} R={R} x1={0} y1={c.b[k]! / l[1]!} m={-l[0]! / l[1]!} de={-0.5} a={4} couleur={couleurs[k]} epaisseur={k === 1 && nat.nature === 'infinite' ? 2 : 2.2} pointilles={k === 1 && nat.nature === 'infinite'} />
            ))}
            {sol ? <PointGraphe R={R} x={sol[0]!} y={sol[1]!} couleur={VERT} texte={`(${nc(sol[0]!)} ; ${nc(sol[1]!)})`} dx={8} dy={4} /> : null}
            {c.A.map((l, k) => (
              <Etiquette key={`e${k}`} x={R.x0} y={222 + k * 15} taille={11} couleur={couleurs[k]} gras>
                {coef(l[0]!)}x {l[1]! < 0 ? '−' : '+'} {coef(Math.abs(l[1]!))}y = {nombre(c.b[k]!, 0)}
              </Etiquette>
            ))}
            <Etiquette x={R.x0} y={259} taille={11}>
              rang A = {nat.rangA} ; rang [A | b] = {nat.rangAb}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

// ---------- L1.4.5 : la panne sur un versant ----------

/** Panne posée sur un arbalétrier incliné : repère global, repère local tourné de α, charge verticale et ses deux composantes locales. */
export function PanneVersant({ q, alpha, local }: { q: number; alpha: number; local: readonly [number, number] }) {
  const a = rad(alpha);
  const t = [Math.cos(a), -Math.sin(a)] as const; // le long de la pente, vers le haut (coordonnées SVG)
  const nn = [-Math.sin(a), -Math.cos(a)] as const; // perpendiculaire au versant, vers l'extérieur
  const O = [40, 262] as const;
  const L = 300;
  const at = (s: number, d: number) => [O[0] + s * t[0] + d * nn[0], O[1] + s * t[1] + d * nn[1]] as const;
  const s0 = 175;
  const panne = [at(s0 - 16, 0), at(s0 + 16, 0), at(s0 + 16, 42), at(s0 - 16, 42)];
  const haut = at(s0, 42);
  const Q = [478, 96] as const;
  const Lq = 130;
  const fin = [Q[0], Q[1] + Lq] as const;
  const cPente = [Q[0] - t[0] * Lq * Math.sin(a), Q[1] - t[1] * Lq * Math.sin(a)] as const;
  const cNorm = [Q[0] - nn[0] * Lq * Math.cos(a), Q[1] - nn[1] * Lq * Math.cos(a)] as const;
  const axe = (u: readonly [number, number], l: number) => [Q[0] + u[0] * l, Q[1] + u[1] * l] as const;
  const xl = at(62, 34);
  return (
    <Figure alt={`Panne sur un versant de ${nombre(alpha, 0)}° : la charge verticale de ${n2(q)} kN/m se décompose en ${n2(Math.abs(local[0]))} kN/m le long de la pente et ${n2(Math.abs(local[1]))} kN/m perpendiculairement au versant`} largeur={620} hauteur={300}>
      <polygon points={points([O, at(L, 0), at(L, -14), at(0, -14)])} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
      <polygon points={points(panne)} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.6} />
      <line x1={O[0]} y1={O[1]} x2={O[0] + 130} y2={O[1]} className="t-fin" strokeDasharray="5 3" />
      <path d={`M ${O[0] + 70} ${O[1]} A 70 70 0 0 0 ${O[0] + 70 * Math.cos(a)} ${O[1] - 70 * Math.sin(a)}`} fill="none" stroke="var(--trait)" strokeWidth={1} />
      <Etiquette x={O[0] + 78} y={O[1] - 10} taille={12} gras>
        α = {nombre(alpha, 0)}°
      </Etiquette>
      <Etiquette x={at(L - 70, -14)[0] + 6} y={at(L - 70, -14)[1] + 18} taille={11.5}>
        arbalétrier
      </Etiquette>
      <Etiquette x={at(s0 + 20, 30)[0] + 4} y={at(s0 + 20, 30)[1]} taille={11.5}>
        panne
      </Etiquette>
      <Fleche x1={haut[0]} y1={haut[1] - 62} x2={haut[0]} y2={haut[1] - 2} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Etiquette x={haut[0] + 7} y={haut[1] - 48} taille={12} gras couleur={ROUGE}>
        q
      </Etiquette>
      <Fleche x1={xl[0]} y1={xl[1]} x2={xl[0] + t[0] * 46} y2={xl[1] + t[1] * 46} couleur={BLEU} epaisseur={1.6} tete={7} />
      <Fleche x1={xl[0]} y1={xl[1]} x2={xl[0] + nn[0] * 46} y2={xl[1] + nn[1] * 46} couleur={BLEU} epaisseur={1.6} tete={7} />
      <Etiquette x={xl[0] + t[0] * 50 + 2} y={xl[1] + t[1] * 50 + 14} taille={11.5} gras couleur={BLEU}>
        x′
      </Etiquette>
      <Etiquette x={xl[0] + nn[0] * 50 - 4} y={xl[1] + nn[1] * 50 - 2} ancre="end" taille={11.5} gras couleur={BLEU}>
        y′
      </Etiquette>
      <Fleche x1={30} y1={60} x2={78} y2={60} couleur="var(--trait)" epaisseur={1.4} tete={7} />
      <Fleche x1={30} y1={60} x2={30} y2={14} couleur="var(--trait)" epaisseur={1.4} tete={7} />
      <Etiquette x={82} y={64} taille={11.5} gras>
        x
      </Etiquette>
      <Etiquette x={36} y={20} taille={11.5} gras>
        y
      </Etiquette>
      <Etiquette x={92} y={36} taille={11} classe="etiquette">
        repère global ; en bleu, repère local
      </Etiquette>

      <line x1={axe(t, -70)[0]} y1={axe(t, -70)[1]} x2={axe(t, 105)[0]} y2={axe(t, 105)[1]} className="t-fin" strokeDasharray="6 4" stroke={BLEU} />
      <line x1={axe(nn, -150)[0]} y1={axe(nn, -150)[1]} x2={axe(nn, 50)[0]} y2={axe(nn, 50)[1]} className="t-fin" strokeDasharray="6 4" stroke={BLEU} />
      <Etiquette x={axe(t, 105)[0] + 4} y={axe(t, 105)[1] + 4} taille={11.5} gras couleur={BLEU}>
        x′
      </Etiquette>
      <Etiquette x={axe(nn, 50)[0] - 4} y={axe(nn, 50)[1]} ancre="end" taille={11.5} gras couleur={BLEU}>
        y′
      </Etiquette>
      <line x1={cPente[0]} y1={cPente[1]} x2={fin[0]} y2={fin[1]} className="t-fin" strokeDasharray="3 3" />
      <line x1={cNorm[0]} y1={cNorm[1]} x2={fin[0]} y2={fin[1]} className="t-fin" strokeDasharray="3 3" />
      <Fleche x1={Q[0]} y1={Q[1]} x2={fin[0]} y2={fin[1]} couleur={ROUGE} epaisseur={2.6} tete={10} />
      <Fleche x1={Q[0]} y1={Q[1]} x2={cPente[0]} y2={cPente[1]} couleur={BLEU} epaisseur={2.2} tete={9} />
      <Fleche x1={Q[0]} y1={Q[1]} x2={cNorm[0]} y2={cNorm[1]} couleur={BLEU} epaisseur={2.2} tete={9} />
      <Etiquette x={fin[0] + 8} y={fin[1] - 4} taille={12} gras couleur={ROUGE}>
        q = {n2(q)} kN/m
      </Etiquette>
      <Etiquette x={cPente[0] - 6} y={cPente[1] + 16} ancre="end" taille={12} gras couleur={BLEU}>
        q sin α = {n2(Math.abs(local[0]))}
      </Etiquette>
      <Etiquette x={cNorm[0] + 8} y={cNorm[1] + 14} taille={12} gras couleur={BLEU}>
        q cos α = {n2(Math.abs(local[1]))}
      </Etiquette>
      <path d={`M ${Q[0]} ${Q[1] + 36} A 36 36 0 0 0 ${Q[0] + 36 * Math.sin(a)} ${Q[1] + 36 * Math.cos(a)}`} fill="none" stroke="var(--trait)" strokeWidth={1} />
      <Etiquette x={Q[0] + 48 * Math.sin(a / 2)} y={Q[1] + 48 * Math.cos(a / 2) + 4} ancre="middle" taille={11.5} gras>
        α
      </Etiquette>
      <Etiquette x={384} y={292} taille={11} classe="etiquette">
        composantes en kN/m, dans le repère local
      </Etiquette>
    </Figure>
  );
}

/** Versant de toiture en perspective : arbalétriers, pannes, repère global, repère local de la panne étudiée, charge et composantes. */
export function VersantIso({ q, alpha, local }: { q: number; alpha: number; local: readonly [number, number] }) {
  const a = rad(alpha);
  const Lh = 3;
  const z = (y: number) => (Lh - y) * Math.tan(a); // faîtage en y = 0, égout en y = Lh
  const xs = [0, 4];
  const ys = [0.6, 1.5, 2.4];
  const M: Point3 = [2.9, 1.5, z(1.5) + 0.12]; // point d'application de la charge
  const Ml: Point3 = [1, 1.5, z(1.5) + 0.75]; // origine du repère local, à l'écart de la charge et au-dessus de la panne
  const yp: Point3 = [0, -Math.cos(a), Math.sin(a)]; // le long de la pente, vers le haut
  const zp: Point3 = [0, Math.sin(a), Math.cos(a)]; // normale au versant
  const plus = (p: Point3, u: Point3, l: number): Point3 => [p[0] + u[0] * l, p[1] + u[1] * l, p[2] + u[2] * l];
  const G0: Point3 = [6.4, 0.4, 0];
  const pts: Point3[] = [[-0.4, 0, z(0)], [4.4, 0, z(0)], [-0.4, Lh, 0], [4.4, Lh, 0], [0, 0, 0], [0, Lh, 0], plus(M, [0, 0, 1], 1.5), G0, plus(G0, [0, 0, 1], 1.1), plus(G0, [1, 0, 0], 1.3), [0, -0.6, z(0) + 0.6]];
  const { P, poly, hauteur } = cadreIsoDirect(pts, 620, 430, 30);
  const Lf = 1.3;
  const sa = Math.sin(a);
  const ca = Math.cos(a);
  return (
    <Figure alt={`Versant de toiture à ${nombre(alpha, 0)}° en perspective : la charge verticale de ${n2(q)} kN/m sur la panne se décompose en ${n2(Math.abs(local[1]))} kN/m perpendiculaire au versant et ${n2(Math.abs(local[0]))} kN/m le long de la pente`} largeur={620} hauteur={hauteur}>
      <Calque id="structure">
        <polygon points={poly([[-0.4, 0, z(0) + 0.2], [4.4, 0, z(0) + 0.2], [4.4, Lh, 0.2], [-0.4, Lh, 0.2]])} fill="var(--color-beton-clair)" opacity={0.55} className="t-fin" />
        {xs.map((x) => (
          <g key={x}>
            <line x1={P([x, 0, z(0)])[0]} y1={P([x, 0, z(0)])[1]} x2={P([x, Lh, 0])[0]} y2={P([x, Lh, 0])[1]} stroke={TERRE} strokeWidth={8} strokeLinecap="round" />
            <line x1={P([x, Lh, 0])[0]} y1={P([x, Lh, 0])[1]} x2={P([x, Lh, -0.9])[0]} y2={P([x, Lh, -0.9])[1]} stroke="var(--trait)" strokeWidth={3} />
          </g>
        ))}
        {ys.map((y) => (
          <line key={y} x1={P([-0.4, y, z(y) + 0.12])[0]} y1={P([-0.4, y, z(y) + 0.12])[1]} x2={P([4.4, y, z(y) + 0.12])[0]} y2={P([4.4, y, z(y) + 0.12])[1]} stroke={y === 1.5 ? 'var(--color-acier)' : 'var(--color-terre)'} strokeWidth={y === 1.5 ? 6 : 5} strokeLinecap="round" />
        ))}
        <Etiquette x={P([4.4, 1.5, z(1.5)])[0] - 10} y={P([4.4, 1.5, z(1.5)])[1] + 18} ancre="end" taille={12} gras couleur="var(--color-acier)">
          panne étudiée
        </Etiquette>
        <Etiquette x={P([4, Lh, 0])[0] + 8} y={P([4, Lh, 0])[1] + 20} taille={11.5}>
          arbalétrier
        </Etiquette>
        <Etiquette x={P([-0.4, 0, z(0)])[0] + 6} y={P([-0.4, 0, z(0)])[1] - 10} taille={11.5}>
          faîtage
        </Etiquette>
      </Calque>
      <Calque id="global">
        <Fleche3 P={P} de={G0} vers={plus(G0, [1, 0, 0], 1.1)} couleur="var(--trait)" epaisseur={1.6} tete={8} texte="X" tx={P(plus(G0, [1, 0, 0], 1.1))[0] - 14} ty={P(plus(G0, [1, 0, 0], 1.1))[1] + 4} />
        <Fleche3 P={P} de={G0} vers={plus(G0, [0, 1, 0], 1.1)} couleur="var(--trait)" epaisseur={1.6} tete={8} texte="Y" tx={P(plus(G0, [0, 1, 0], 1.1))[0] + 6} ty={P(plus(G0, [0, 1, 0], 1.1))[1] + 4} />
        <Fleche3 P={P} de={G0} vers={plus(G0, [0, 0, 1], 1.1)} couleur="var(--trait)" epaisseur={1.6} tete={8} texte="Z" tx={P(plus(G0, [0, 0, 1], 1.1))[0] + 6} ty={P(plus(G0, [0, 0, 1], 1.1))[1]} />
        <Etiquette x={P(G0)[0]} y={P(G0)[1] + 30} ancre="middle" taille={11} classe="etiquette">
          repère global
        </Etiquette>
      </Calque>
      <Calque id="local">
        <line x1={P(Ml)[0]} y1={P(Ml)[1]} x2={P([1, 1.5, z(1.5) + 0.12])[0]} y2={P([1, 1.5, z(1.5) + 0.12])[1]} stroke={BLEU} strokeWidth={1} strokeDasharray="3 3" />
        <Fleche3 P={P} de={Ml} vers={plus(Ml, [-1, 0, 0], 1)} couleur={BLEU} epaisseur={1.8} tete={8} texte="x′ (axe de la panne)" tx={P(plus(Ml, [-1, 0, 0], 1))[0] + 4} ty={P(plus(Ml, [-1, 0, 0], 1))[1] + 16} />
        <Fleche3 P={P} de={Ml} vers={plus(Ml, yp, 1)} couleur={BLEU} epaisseur={1.8} tete={8} texte="y′ (pente)" tx={P(plus(Ml, yp, 1))[0] - 8} ty={P(plus(Ml, yp, 1))[1] - 8} />
        <Fleche3 P={P} de={Ml} vers={plus(Ml, zp, 1)} couleur={BLEU} epaisseur={1.8} tete={8} texte="z′ (normale)" tx={P(plus(Ml, zp, 1))[0] + 6} ty={P(plus(Ml, zp, 1))[1] - 4} />
      </Calque>
      <Calque id="charges">
        <Fleche3 P={P} de={plus(M, [0, 0, 1], Lf)} vers={M} couleur={ROUGE} epaisseur={2.8} tete={10} texte={`q = ${n2(q)} kN/m`} tx={P(plus(M, [0, 0, 1], Lf))[0] + 8} ty={P(plus(M, [0, 0, 1], Lf))[1] + 4} />
        <Fleche3 P={P} de={plus(M, zp, Lf * ca)} vers={M} couleur={VERT} epaisseur={2.4} tete={9} texte={`q cos α = ${n2(Math.abs(local[1]))}`} tx={P(plus(M, zp, Lf * ca))[0] + 8} ty={P(plus(M, zp, Lf * ca))[1] + 12} />
        <Fleche3 P={P} de={plus(M, yp, Lf * sa)} vers={M} couleur={VERT} epaisseur={2.4} tete={9} texte={`q sin α = ${n2(Math.abs(local[0]))}`} ancre="end" tx={P(plus(M, yp, Lf * sa))[0] - 6} ty={P(plus(M, yp, Lf * sa))[1] - 4} />
      </Calque>
    </Figure>
  );
}

// ---------- L1.4.6 : contraintes principales ----------

/** Élément de matière : contraintes σx, σy, τ sur ses faces, puis le même point tourné de θ1, où seules restent σ1 et σ2. */
export function ContraintesElements({ d, s1, s2, theta1 }: { d: DonneesContraintes; s1: number; s2: number; theta1: number }) {
  const c1 = [118, 128] as const;
  const c2 = [482, 128] as const;
  const h = 44;
  const L = 38;
  // flèche normale à une face : sortante si σ > 0 (traction), rentrante sinon ; direction u (repère mathématique)
  const normale = (c: readonly [number, number], u: readonly [number, number], s: number, couleur: string, texte?: string, dt = 14) => {
    if (Math.abs(s) < 1e-9) return null;
    const pied = [c[0] + u[0] * h, c[1] - u[1] * h] as const;
    const bout = [c[0] + u[0] * (h + L), c[1] - u[1] * (h + L)] as const;
    const [de, vers] = s > 0 ? [pied, bout] : [bout, pied];
    return (
      <g>
        <Fleche x1={de[0]} y1={de[1]} x2={vers[0]} y2={vers[1]} couleur={couleur} epaisseur={2.4} tete={9} />
        {texte ? (
          <Etiquette
            x={Math.abs(u[0]) > 0.7 ? bout[0] : bout[0] + u[0] * dt}
            y={Math.abs(u[0]) > 0.7 ? bout[1] - 10 : bout[1] - u[1] * dt + 4}
            ancre={Math.abs(u[0]) > 0.7 ? 'middle' : u[0] > 0.3 ? 'start' : u[0] < -0.3 ? 'end' : 'middle'}
            taille={11.5}
            gras
            couleur={couleur}
          >
            {texte}
          </Etiquette>
        ) : null}
      </g>
    );
  };
  // cisaillement : flèche le long de la face de normale u, dans le sens de τ (τ > 0 : vers +y sur la face +x)
  const tangente = (u: readonly [number, number], v: readonly [number, number]) => {
    const m = [c1[0] + u[0] * (h + 7), c1[1] - u[1] * (h + 7)] as const;
    return <Fleche x1={m[0] - v[0] * 28} y1={m[1] + v[1] * 28} x2={m[0] + v[0] * 28} y2={m[1] - v[1] * 28} couleur={BLEU} epaisseur={2} tete={8} />;
  };
  const sg = Math.sign(d.txy) || 0;
  const t = rad(theta1);
  const e1 = [Math.cos(t), Math.sin(t)] as const;
  const e2 = [-Math.sin(t), Math.cos(t)] as const;
  const carre = (c: readonly [number, number], a: number) =>
    points(
      [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1],
      ].map(([i, j]) => [c[0] + h * (i! * Math.cos(a) - j! * Math.sin(a)), c[1] - h * (i! * Math.sin(a) + j! * Math.cos(a))] as const),
    );
  return (
    <Figure alt={`Point d'une poutre : σx = ${n2(d.sx)} MPa, σy = ${n2(d.sy)} MPa, τ = ${n2(d.txy)} MPa. Tourné de ${n1(theta1)}°, il ne subit plus que σ1 = ${n2(s1)} MPa et σ2 = ${n2(s2)} MPa, sans cisaillement`} largeur={620} hauteur={250}>
      <polygon points={carre(c1, 0)} fill="var(--color-beton-clair)" className="t-fort" />
      {normale(c1, [1, 0], d.sx, ROUGE, `σx = ${n2(d.sx)}`)}
      {normale(c1, [-1, 0], d.sx, ROUGE)}
      {normale(c1, [0, 1], d.sy, ROUGE, `σy = ${n2(d.sy)}`)}
      {normale(c1, [0, -1], d.sy, ROUGE)}
      {sg !== 0 ? (
        <>
          {tangente([1, 0], [0, sg])}
          {tangente([-1, 0], [0, -sg])}
          {tangente([0, 1], [sg, 0])}
          {tangente([0, -1], [-sg, 0])}
          <Etiquette x={c1[0] + h + 14} y={c1[1] - h - 8} taille={11.5} gras couleur={BLEU}>
            τ = {n2(d.txy)}
          </Etiquette>
        </>
      ) : null}
      <Etiquette x={c1[0]} y={238} ancre="middle" taille={12} gras>
        dans le repère de la poutre (x, y)
      </Etiquette>
      <Fleche x1={252} y1={c1[1]} x2={342} y2={c1[1]} couleur="var(--trait)" epaisseur={1.6} tete={9} />
      <Etiquette x={297} y={c1[1] - 12} ancre="middle" taille={11.5}>
        tourner de
      </Etiquette>
      <Etiquette x={297} y={c1[1] + 22} ancre="middle" taille={12} gras>
        θ1 = {n1(theta1)}°
      </Etiquette>
      <polygon points={carre(c2, t)} fill="var(--color-beton-clair)" className="t-fort" />
      <line x1={c2[0] - e2[0] * 92} y1={c2[1] + e2[1] * 92} x2={c2[0] + e2[0] * 92} y2={c2[1] - e2[1] * 92} stroke={ROUGE} strokeWidth={1.4} strokeDasharray="7 4" />
      <line x1={c2[0]} y1={c2[1]} x2={c2[0] + 96} y2={c2[1]} className="t-fin" strokeDasharray="4 3" />
      <path d={`M ${c2[0] + 72} ${c2[1]} A 72 72 0 0 ${theta1 >= 0 ? 0 : 1} ${c2[0] + 72 * Math.cos(t)} ${c2[1] - 72 * Math.sin(t)}`} fill="none" stroke="var(--trait)" strokeWidth={1} />
      <Etiquette x={c2[0] + 84 * Math.cos(t / 2)} y={c2[1] - 84 * Math.sin(t / 2) + 4} taille={11} gras>
        θ1
      </Etiquette>
      {normale(c2, e1, s1, ROUGE, `σ1 = ${n2(s1)}`)}
      {normale(c2, [-e1[0], -e1[1]], s1, ROUGE)}
      {normale(c2, e2, s2, ROUGE, `σ2 = ${n2(s2)}`)}
      {normale(c2, [-e2[0], -e2[1]], s2, ROUGE)}
      <Etiquette x={c2[0] - e2[0] * 92 + 6} y={c2[1] + e2[1] * 92 + 14} taille={11} couleur={ROUGE}>
        fissure possible
      </Etiquette>
      <Etiquette x={c2[0]} y={238} ancre="middle" taille={12} gras>
        dans les directions principales : τ = 0
      </Etiquette>
      <Etiquette x={612} y={16} ancre="end" taille={11} classe="etiquette">
        contraintes en MPa, traction positive
      </Etiquette>
    </Figure>
  );
}

/** Cercle de Mohr du même état de contraintes : les contraintes principales sont ses intersections avec l'axe σ. */
export function MohrPrincipales({ d }: { d: DonneesContraintes }) {
  return (
    <Figure alt={`Cercle de Mohr de l'état σx = ${n2(d.sx)} MPa, σy = ${n2(d.sy)} MPa, τ = ${n2(d.txy)} MPa : les contraintes principales sont sur l'axe σ`} largeur={420} hauteur={340} largeurMin={340}>
      <CercleMohr sx={d.sx} sy={d.sy} txy={d.txy} x={50} y={10} taille={320} dec={1} />
    </Figure>
  );
}

// ---------- L1.4.7 : nœud relié à des barres (K u = F) ----------

/** Nœud N suspendu à des appuis par des barres : géométrie cotée, charge, efforts, et déformée amplifiée. */
export function NoeudBarresSchema({ barres, u, N, Fx, Fy, ampli = 300, prefixe = 'nb' }: { barres: readonly BarreNoeud[]; u: readonly number[] | null; N: readonly number[] | null; Fx: number; Fy: number; ampli?: number; prefixe?: string }) {
  const xs = [0, ...barres.map((b) => b.x)];
  const ys = [0, ...barres.map((b) => b.y)];
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);
  const k = Math.min(440 / (xmax - xmin || 1), 190 / (ymax - ymin || 1));
  const X = (x: number) => 310 + (x - (xmin + xmax) / 2) * k;
  const Y = (y: number) => 72 + (ymax - y) * k;
  const noms = ['A', 'B', 'C', 'D'];
  const F = Math.hypot(Fx, Fy);
  const dep = u ? [u[0]! * ampli, u[1]! * ampli] : [0, 0];
  const Nd = [X(dep[0]!), Y(dep[1]!)] as const;
  return (
    <Figure alt={`Nœud N relié à ${barres.length} appuis par des barres, chargé de ${n2(F)} kN ; efforts ${N ? N.map((v, i) => `N${i + 1} = ${n2(v)} kN`).join(', ') : 'non calculables'} ; déformée amplifiée ${ampli} fois`} largeur={620} hauteur={Y(ymin) + 96}>
      <Hachures prefixe={prefixe} types={['ba']} />
      {barres.map((b, i) => (
        <g key={`a${i}`}>
          <rect x={X(b.x) - 22} y={Y(b.y) - 16} width={44} height={10} fill={hachure(prefixe, 'ba')} className="t-moyen" />
          <circle cx={X(b.x)} cy={Y(b.y)} r={4} fill="var(--color-papier)" className="t-fort" />
          <Etiquette x={X(b.x) + (b.x < 0 ? -12 : 12)} y={Y(b.y) + 4} ancre={b.x < 0 ? 'end' : 'start'} taille={12} gras>
            {noms[i]}
          </Etiquette>
        </g>
      ))}
      {barres.map((b, i) => {
        const v = N?.[i] ?? 0;
        const c = !N ? 'var(--trait)' : Math.abs(v) < 1e-9 ? 'var(--color-beton)' : v > 0 ? BLEU : ROUGE;
        const mx = (X(b.x) + X(0)) / 2;
        const my = (Y(b.y) + Y(0)) / 2;
        const droite = b.x > 1e-9 || (Math.abs(b.x) < 1e-9 && i > 0);
        return (
          <g key={`b${i}`}>
            <line x1={X(b.x)} y1={Y(b.y)} x2={X(0)} y2={Y(0)} stroke={c} strokeWidth={4} />
            <Etiquette x={mx + (droite ? 10 : -10)} y={my - 6} ancre={droite ? 'start' : 'end'} taille={12} gras couleur={c}>
              {N ? `N${i + 1} = ${n2(v)} kN` : `barre ${i + 1}`}
            </Etiquette>
          </g>
        );
      })}
      {u
        ? barres.map((b, i) => <line key={`d${i}`} x1={X(b.x)} y1={Y(b.y)} x2={Nd[0]} y2={Nd[1]} stroke={BLEU} strokeWidth={1.2} strokeDasharray="5 4" />)
        : null}
      <circle cx={X(0)} cy={Y(0)} r={5} fill="var(--color-papier)" className="t-fort" />
      <Etiquette x={X(0) + 10} y={Y(0) - 8} taille={12} gras>
        N
      </Etiquette>
      {F > 1e-9 ? <Fleche x1={X(0) + (Fx / F) * 8} y1={Y(0) - (Fy / F) * 8} x2={X(0) + (Fx / F) * 62} y2={Y(0) - (Fy / F) * 62} couleur={ROUGE} epaisseur={2.6} tete={10} texte={`F = ${n2(F)} kN`} tx={X(0) + (Fx / F) * 62 + 8} ty={Y(0) - (Fy / F) * 62 + 4} /> : null}
      {u ? (
        <Etiquette x={16} y={Y(ymin) + 86} taille={11} couleur={BLEU}>
          en pointillés : position déformée, déplacements amplifiés {ampli} fois
        </Etiquette>
      ) : null}
      {barres.length === 2 ? (
        <>
          <Cote x1={X(barres[0]!.x)} y1={Y(ymin) + 40} x2={X(0)} y2={Y(ymin) + 40} texte={`${n2(Math.abs(barres[0]!.x))} m`} />
          <Cote x1={X(0)} y1={Y(ymin) + 40} x2={X(barres[1]!.x)} y2={Y(ymin) + 40} texte={`${n2(Math.abs(barres[1]!.x))} m`} />
          <Cote x1={X(xmax) + 50} y1={Y(0)} x2={X(xmax) + 50} y2={Y(ymax)} texte={`${n2(ymax)} m`} />
        </>
      ) : null}
    </Figure>
  );
}

// ---------- L1.4.P : treillis triangulaire, inconnues et équations ----------

/** Ferme triangulaire : numérotation des six inconnues (efforts et réactions) et des six équations ; efforts colorés si la solution est donnée. */
export function TriangleInconnues({ d, s, prefixe = 'ti' }: { d: DonneesTriangle; s?: readonly number[] | null; prefixe?: string }) {
  const k = Math.min(420 / d.L, 150 / d.h);
  const X = (x: number) => 100 + x * k;
  const Y = (y: number) => 236 - y * k;
  const A = [X(0), Y(0)] as const;
  const B = [X(d.L), Y(0)] as const;
  const C = [X(d.L / 2), Y(d.h)] as const;
  const couleur = (v: number | undefined) => (v === undefined ? 'var(--trait)' : Math.abs(v) < 1e-9 ? 'var(--color-beton)' : v > 0 ? BLEU : ROUGE);
  const lib = (i: number, nom: string) => (s ? `${nom} = ${n2(s[i]!)}` : `s${i + 1} = ${nom}`);
  const barres = [
    { de: A, a: B, i: 0, nom: 'N(AB)' },
    { de: A, a: C, i: 1, nom: 'N(AC)' },
    { de: B, a: C, i: 2, nom: 'N(BC)' },
  ];
  return (
    <Figure alt={`Ferme triangulaire de ${n1(d.L)} m de portée et ${n1(d.h)} m de haut, chargée en C de P = ${n1(d.P)} kN et W = ${n1(d.W)} kN${s ? ` : N(AB) = ${n2(s[0]!)}, N(AC) = ${n2(s[1]!)}, N(BC) = ${n2(s[2]!)} kN ; RAx = ${n2(s[3]!)}, RAy = ${n2(s[4]!)}, RBy = ${n2(s[5]!)} kN` : ''}`} largeur={620} hauteur={330}>
      <Hachures prefixe={prefixe} types={['terre']} />
      {barres.map((b) => (
        <line key={b.nom} x1={b.de[0]} y1={b.de[1]} x2={b.a[0]} y2={b.a[1]} stroke={couleur(s?.[b.i])} strokeWidth={4} />
      ))}
      <Etiquette x={(A[0] + B[0]) / 2} y={A[1] - 10} ancre="middle" taille={12} gras couleur={couleur(s?.[0])}>
        {lib(0, 'N(AB)')}
      </Etiquette>
      <Etiquette x={(A[0] + C[0]) / 2 - 12} y={(A[1] + C[1]) / 2 - 6} ancre="end" taille={12} gras couleur={couleur(s?.[1])}>
        {lib(1, 'N(AC)')}
      </Etiquette>
      <Etiquette x={(B[0] + C[0]) / 2 + 12} y={(B[1] + C[1]) / 2 - 6} taille={12} gras couleur={couleur(s?.[2])}>
        {lib(2, 'N(BC)')}
      </Etiquette>
      {[
        { p: A, nom: 'A', dx: -14, dy: -10, ancre: 'end' as const },
        { p: B, nom: 'B', dx: 14, dy: -10, ancre: 'start' as const },
        { p: C, nom: 'C', dx: 12, dy: -14, ancre: 'start' as const },
      ].map((nd) => (
        <g key={nd.nom}>
          <circle cx={nd.p[0]} cy={nd.p[1]} r={5} fill="var(--color-papier)" className="t-fort" />
          <Etiquette x={nd.p[0] + nd.dx} y={nd.p[1] + nd.dy} ancre={nd.ancre} taille={13} gras>
            {nd.nom}
          </Etiquette>
        </g>
      ))}
      <AppuiDouble x={A[0]} y={A[1] + 5} t={10} prefixe={prefixe} />
      <AppuiSimple x={B[0]} y={B[1] + 5} t={10} />
      <Fleche x1={C[0]} y1={C[1] - 66} x2={C[0]} y2={C[1] - 7} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Etiquette x={C[0] + 8} y={C[1] - 54} taille={12} gras couleur={ROUGE}>
        P = {n1(d.P)} kN
      </Etiquette>
      <Fleche x1={C[0] - 72} y1={C[1]} x2={C[0] - 8} y2={C[1]} couleur={ROUGE} epaisseur={2.6} tete={9} />
      <Etiquette x={C[0] - 74} y={C[1] - 8} taille={12} gras couleur={ROUGE}>
        W = {n1(d.W)} kN
      </Etiquette>
      <Fleche x1={A[0] - 70} y1={A[1]} x2={A[0] - 14} y2={A[1]} couleur={VERT} epaisseur={2.2} tete={8} />
      <Etiquette x={A[0] - 72} y={A[1] - 8} taille={11.5} gras couleur={VERT}>
        {lib(3, 'RAx')}
      </Etiquette>
      <Fleche x1={A[0]} y1={A[1] + 84} x2={A[0]} y2={A[1] + 32} couleur={VERT} epaisseur={2.2} tete={8} />
      <Etiquette x={A[0] + 8} y={A[1] + 76} taille={11.5} gras couleur={VERT}>
        {lib(4, 'RAy')}
      </Etiquette>
      <Fleche x1={B[0]} y1={B[1] + 84} x2={B[0]} y2={B[1] + 32} couleur={VERT} epaisseur={2.2} tete={8} />
      <Etiquette x={B[0] + 8} y={B[1] + 76} taille={11.5} gras couleur={VERT}>
        {lib(5, 'RBy')}
      </Etiquette>
      {s ? null : (
        <>
          <Etiquette x={A[0] + 18} y={A[1] + 46} taille={12} classe="font-manuscrite" couleur={BLEU}>
            équations 1 et 2
          </Etiquette>
          <Etiquette x={B[0] - 18} y={B[1] + 46} ancre="end" taille={12} classe="font-manuscrite" couleur={BLEU}>
            équations 3 et 4
          </Etiquette>
          <Etiquette x={C[0] + 70} y={C[1] + 2} taille={12} classe="font-manuscrite" couleur={BLEU}>
            équations 5 et 6
          </Etiquette>
        </>
      )}
      <Etiquette x={604} y={20} ancre="end" taille={11} classe="etiquette">
        {s ? 'efforts en kN : traction en bleu, compression en rouge' : 'barres supposées tendues, réactions dans le sens des flèches'}
      </Etiquette>
    </Figure>
  );
}
