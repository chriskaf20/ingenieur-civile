// Projections orthogonales (méthode européenne) et perspectives (isométrie, cavalière) d'un objet prismatique :
// un profil (x, z) tiré sur une profondeur y. Les arêtes vues et cachées viennent de lib/calc/dessin.ts.
import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { cavaliere, isometrique, type Point2, type Point3, type VuesExtrusion } from '@/lib/calc/dessin';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';

export interface OptionsVues {
  /** pixels par mètre */
  echelle: number;
  /** écart entre les vues (px) */
  ecart?: number;
  /** lignes de rappel et ligne à 45° */
  rappels?: boolean;
  /** cotes hors tout (m) */
  cotes?: boolean;
  /** noms des vues */
  noms?: boolean;
  /** vues à masquer (exercice de vue manquante) */
  masquer?: ReadonlyArray<'face' | 'dessus' | 'gauche'>;
  /** marge extérieure (px) */
  marge?: number;
  /** annotations ajoutées dans le repère des vues */
  annotations?: (d: ReturnType<typeof dispositionVues>) => React.ReactNode;
}

/** Disposition et géométrie des trois vues : face en haut à gauche, dessus en dessous, gauche à droite. */
export function dispositionVues(v: VuesExtrusion, o: OptionsVues) {
  const s = o.echelle;
  const g = o.ecart ?? 40;
  const m = o.marge ?? 30;
  const W = v.largeur * s;
  const H = v.hauteur * s;
  const D = v.profondeur * s;
  const x0 = m + 24;
  const y0 = m;
  const X = (x: number) => x0 + (x - v.xmin) * s;
  const Zf = (z: number) => y0 + H - (z - v.zmin) * s;
  const yTop = y0 + H + g; // bord arrière de la vue de dessus (côté vue de face)
  const xl = x0 + W + g; // bord arrière de la vue de gauche (côté vue de face)
  return { s, g, m, W, H, D, x0, y0, X, Zf, yTop, xl, largeur: xl + D + m, hauteur: yTop + D + m + (o.noms === false ? 0 : 10) };
}

/** Les trois vues d'un objet prismatique, disposées selon la méthode européenne (premier dièdre). */
export function VuesProjetees({ v, alt, ...o }: OptionsVues & { v: VuesExtrusion; alt: string }) {
  const d = dispositionVues(v, o);
  const { X, Zf, yTop, xl, D, W, H, x0, y0 } = d;
  const cache = new Set(o.masquer ?? []);
  const rappel = { stroke: 'var(--trait-doux)', strokeWidth: 0.5, strokeDasharray: '2 3', opacity: 0.8 } as const;
  const ligne = (visible: boolean) => (visible ? 't-fort' : 't-cache');
  return (
    <Figure alt={alt} largeur={d.largeur} hauteur={d.hauteur}>
      {o.rappels ? (
        <g>
          {v.dessus.map((l) => (
            <line key={`rv${l.position}`} x1={X(l.position)} y1={y0 + H + 4} x2={X(l.position)} y2={yTop - 4} {...rappel} />
          ))}
          {v.gauche.map((l) => (
            <line key={`rh${l.position}`} x1={x0 + W + 4} y1={Zf(l.position)} x2={xl - 4} y2={Zf(l.position)} {...rappel} />
          ))}
          {[0, D].map((t) => (
            <g key={`m${t}`}>
              <line x1={X(v.xmin + v.largeur) + 4} y1={yTop + t} x2={xl + t} y2={yTop + t} {...rappel} />
              <line x1={xl + t} y1={yTop + t} x2={xl + t} y2={y0 + H + 4} {...rappel} />
            </g>
          ))}
          <line x1={xl - 6} y1={yTop - 6} x2={xl + D + 8} y2={yTop + D + 8} stroke={ROUGE} strokeWidth={0.8} />
          <Etiquette x={xl + D + 4} y={yTop + D + 22} ancre="middle" taille={10} couleur={ROUGE}>
            45°
          </Etiquette>
        </g>
      ) : null}
      {cache.has('face') ? (
        <rect x={x0} y={y0} width={W} height={H} fill="none" stroke={ROUGE} strokeDasharray="4 4" />
      ) : (
        <polygon points={points(v.face.map(([x, z]) => [X(x), Zf(z)] as const))} fill="var(--color-beton-clair)" fillOpacity={0.55} className="t-fort" />
      )}
      {cache.has('dessus') ? (
        <rect x={x0} y={yTop} width={W} height={D} fill="none" stroke={ROUGE} strokeDasharray="4 4" />
      ) : (
        <g>
          <rect x={x0} y={yTop} width={W} height={D} fill="var(--color-beton-clair)" fillOpacity={0.55} className="t-fort" />
          {v.dessus.map((l) => (
            <line key={l.position} x1={X(l.position)} y1={yTop} x2={X(l.position)} y2={yTop + D} className={ligne(l.visible)} />
          ))}
        </g>
      )}
      {cache.has('gauche') ? (
        <rect x={xl} y={y0} width={D} height={H} fill="none" stroke={ROUGE} strokeDasharray="4 4" />
      ) : (
        <g>
          <rect x={xl} y={y0} width={D} height={H} fill="var(--color-beton-clair)" fillOpacity={0.55} className="t-fort" />
          {v.gauche.map((l) => (
            <line key={l.position} x1={xl} y1={Zf(l.position)} x2={xl + D} y2={Zf(l.position)} className={ligne(l.visible)} />
          ))}
        </g>
      )}
      {o.cotes ? (
        <g>
          <Cote x1={x0} y1={y0} x2={x0 + W} y2={y0} decalage={14} texte={nombre(v.largeur, 2)} />
          <Cote x1={x0} y1={y0 + H} x2={x0} y2={y0} decalage={14} texte={nombre(v.hauteur, 2)} />
          <Cote x1={xl} y1={y0} x2={xl + D} y2={y0} decalage={14} texte={nombre(v.profondeur, 2)} />
        </g>
      ) : null}
      {o.noms === false ? null : (
        <g>
          <Etiquette x={x0 + W / 2} y={y0 + H + 16} ancre="middle" taille={11} gras couleur={BLEU}>
            vue de face
          </Etiquette>
          <Etiquette x={x0 + W / 2} y={yTop + D + 16} ancre="middle" taille={11} gras couleur={BLEU}>
            vue de dessus
          </Etiquette>
          <Etiquette x={xl + D / 2} y={y0 + H + 16} ancre="middle" taille={11} gras couleur={BLEU}>
            vue de gauche
          </Etiquette>
        </g>
      )}
      {o.annotations?.(d)}
    </Figure>
  );
}

// ---------- Perspectives ----------

export type ModePerspective = { mode: 'iso' } | { mode: 'cavaliere'; alpha: number; k: number };

interface Face3 {
  pts: Point3[];
  normale: Point3;
  /** face avant (profil à y = 0) */
  avant: boolean;
}

/** Faces d'un prisme : la face avant (y = 0) et une face latérale par côté du profil (sens trigonométrique). */
export function facesExtrusion(profil: readonly Point2[], profondeur: number): Face3[] {
  const faces: Face3[] = [{ pts: profil.map(([x, z]) => [x, 0, z] as const), normale: [0, -1, 0], avant: true }];
  profil.forEach(([x1, z1], i) => {
    const [x2, z2] = profil[(i + 1) % profil.length]!;
    faces.push({
      pts: [[x1, 0, z1], [x2, 0, z2], [x2, profondeur, z2], [x1, profondeur, z1]],
      normale: [z2 - z1, 0, -(x2 - x1)],
      avant: false,
    });
  });
  return faces;
}

/** Projection 2D (y vers le haut) et direction de l'observateur pour une perspective donnée. */
export function projecteur(p: ModePerspective): { proj: (q: Point3) => Point2; vers: Point3 } {
  if (p.mode === 'iso') return { proj: isometrique, vers: [1, -1, 1] };
  const a = (p.alpha * Math.PI) / 180;
  return { proj: (q) => cavaliere(q, p.alpha, p.k), vers: [p.k * Math.cos(a), -1, p.k * Math.sin(a)] };
}

const dot = (a: Point3, b: Point3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Faces vues, triées de la plus éloignée à la plus proche (algorithme du peintre), face avant en dernier. */
export function facesVues(faces: Face3[], vers: Point3): Face3[] {
  const centre = (f: Face3): Point3 => {
    const n = f.pts.length;
    return [f.pts.reduce((s, q) => s + q[0], 0) / n, f.pts.reduce((s, q) => s + q[1], 0) / n, f.pts.reduce((s, q) => s + q[2], 0) / n];
  };
  return faces
    .filter((f) => dot(f.normale, vers) > 1e-9)
    .sort((a, b) => (a.avant === b.avant ? dot(centre(a), vers) - dot(centre(b), vers) : a.avant ? 1 : -1));
}

/** Cadre de dessin : échelle et décalage pour faire tenir des points projetés dans une largeur donnée. */
export function cadrePerspective(pts2: Point2[], largeur: number, hauteurMax: number, marge = 30) {
  const xs = pts2.map((p) => p[0]);
  const ys = pts2.map((p) => p[1]);
  const lx = Math.max(...xs) - Math.min(...xs);
  const ly = Math.max(...ys) - Math.min(...ys);
  const k = Math.min((largeur - 2 * marge) / lx, (hauteurMax - 2 * marge) / ly);
  const hauteur = ly * k + 2 * marge;
  const x0 = (largeur - lx * k) / 2 - Math.min(...xs) * k;
  const P = ([u, v]: Point2): Point2 => [x0 + u * k, hauteur - marge - (v - Math.min(...ys)) * k];
  return { P, k, hauteur };
}

/** Teinte d'une face selon son orientation : dessus clair, côté plus sombre. */
function ombre(f: Face3): number {
  if (f.avant) return 0;
  const [nx, , nz] = f.normale;
  return nz > Math.abs(nx) ? -0.25 : 0.16;
}

/** Dessin en perspective d'un objet prismatique (faces cachées retirées), en coordonnées déjà projetées. */
export function DessinPrisme({ faces, P, proj, couleur = 'var(--color-beton-clair)' }: { faces: Face3[]; P: (p: Point2) => Point2; proj: (q: Point3) => Point2; couleur?: string }) {
  return (
    <g>
      {faces.map((f, i) => {
        const pts = points(f.pts.map((q) => P(proj(q))));
        const o = ombre(f);
        return (
          <g key={i}>
            <polygon points={pts} fill={couleur} />
            {o !== 0 ? <polygon points={pts} fill={o > 0 ? 'var(--trait)' : 'var(--halo)'} fillOpacity={Math.abs(o)} /> : null}
            <polygon points={pts} fill="none" className="t-fort" strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
}

/** Perspective (isométrique ou cavalière) d'un objet prismatique. */
export function PerspectivePrisme({
  profil,
  profondeur,
  vue,
  alt,
  largeur = 620,
  hauteurMax = 260,
  marge = 30,
  enfants,
}: {
  profil: readonly Point2[];
  profondeur: number;
  vue: ModePerspective;
  alt: string;
  largeur?: number;
  hauteurMax?: number;
  marge?: number;
  /** annotations ajoutées par-dessus, dans le même repère */
  enfants?: (c: { P: (p: Point2) => Point2; proj: (q: Point3) => Point2; k: number }) => React.ReactNode;
}) {
  const { proj, vers } = projecteur(vue);
  const faces = facesVues(facesExtrusion(profil, profondeur), vers);
  const tous = faces.flatMap((f) => f.pts.map(proj));
  const { P, k, hauteur } = cadrePerspective(tous, largeur, hauteurMax, marge);
  return (
    <Figure alt={alt} largeur={largeur} hauteur={hauteur}>
      <DessinPrisme faces={faces} P={P} proj={proj} />
      {enfants?.({ P, proj, k })}
    </Figure>
  );
}
