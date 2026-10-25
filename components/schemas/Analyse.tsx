// Schémas du module L1.2 (analyse). Les valeurs viennent de lib/calc/analyse.ts.
import { Cote } from '@/components/drawing/Cote';
import { ArcMoment, Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Aire, Axes, Courbe, Droite, PointGraphe, repere2D } from '@/components/drawing/Graphe';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { cadreIsoDirect, type P2 } from '@/components/drawing/Iso3D';
import { AppuiDouble, AppuiSimple, ChargePonctuelle, ChargeRepartie } from '@/components/drawing/Mecanique';
import { Calque } from '@/components/gabarits/Vue3D';
import {
  cuveConique,
  deriveePolynome,
  evaluerPolynome,
  integralePolynome,
  monteeCone,
  penteSecante,
  rayonHydraulique,
  triangleIntegre,
  type DonneesBandes,
  type DonneesCable,
  type DonneesChargeVariable,
  type DonneesCubature,
  type DonneesCuveConique,
  type DonneesFleche,
  type DonneesMomentMax,
  type DonneesRaccordement,
  type DonneesTerrain,
  type DonneesVentPuissance,
  type ResultatBandes,
  type ResultatChargeVariable,
  type ResultatCubature,
  type ResultatFleche,
  type ResultatMomentMax,
  type ResultatRaccordement,
  type ResultatTerrain,
  type ResultatTInertie,
  type ResultatVentPuissance,
} from '@/lib/calc/analyse';
import type { DonneesSectionT } from '@/lib/calc/geometrie';
import type { Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
const pcF = (x: number) => `${nombre(x * 100, 2)} %`;
const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';

/** Graduations régulières de a à b par pas. */
const grad = (a: number, b: number, pas: number) => Array.from({ length: Math.floor((b - a) / pas + 1e-9) + 1 }, (_, i) => a + i * pas);

// ---------- L1.2.1 : limites ----------

/** f(x) = sin x / x : la fonction n'est pas définie en 0, mais ses valeurs s'approchent de 1. */
export function LimiteSinc() {
  const R = repere2D({ x0: 40, y0: 20, l: 540, h: 200, xmin: -12, xmax: 12, ymin: -0.4, ymax: 1.2 });
  const f = (x: number) => Math.sin(x) / x;
  return (
    <Figure alt="Courbe de sin x / x entre −12 et 12 : elle oscille en s'amortissant, et ses valeurs s'approchent de 1 quand x s'approche de 0, où la fonction n'est pas définie (point creux)" largeur={620} hauteur={250}>
      <Axes R={R} gradX={grad(-12, 12, 4)} gradY={[0.5]} decY={1} titreX="x" titreY="sin x / x" />
      <Courbe R={R} f={f} de={-12} a={-0.02} />
      <Courbe R={R} f={f} de={0.02} a={12} />
      <circle cx={R.X(0)} cy={R.Y(1)} r={4.5} fill="var(--color-papier)" stroke={ROUGE} strokeWidth={1.8} />
      <Fleche x1={R.X(-3)} y1={R.Y(1.08)} x2={R.X(-0.4)} y2={R.Y(1.02)} couleur={ROUGE} epaisseur={1.4} tete={7} />
      <Fleche x1={R.X(3)} y1={R.Y(1.08)} x2={R.X(0.4)} y2={R.Y(1.02)} couleur={ROUGE} epaisseur={1.4} tete={7} />
      <Etiquette x={R.X(0) + 70} y={R.Y(1.12)} taille={11.5} gras couleur={ROUGE}>
        limite 1 en 0 (point creux : valeur non définie)
      </Etiquette>
    </Figure>
  );
}

/** Polygones réguliers inscrit et circonscrit : leurs périmètres encadrent celui du cercle. */
export function PolygoneCercle({ n }: { n: number }) {
  const nn = Math.max(3, Math.min(Math.round(n), 60));
  const C: P2 = [170, 135];
  const r = 105;
  const sommet = (k: number, rr: number): P2 => [C[0] + rr * Math.cos((2 * Math.PI * k) / nn - Math.PI / 2), C[1] + rr * Math.sin((2 * Math.PI * k) / nn - Math.PI / 2)];
  const rc = r / Math.cos(Math.PI / nn);
  const ins = Array.from({ length: nn }, (_, k) => sommet(k, r));
  const cir = Array.from({ length: nn }, (_, k) => sommet(k + 0.5, rc));
  return (
    <Figure alt={`Cercle de diamètre 1 avec un polygone régulier inscrit et un polygone circonscrit à ${nn} côtés : leurs périmètres encadrent π`} largeur={620} hauteur={270}>
      <polygon points={points(cir)} fill="none" stroke={BRIQUE} strokeWidth={1.4} />
      <circle cx={C[0]} cy={C[1]} r={r} fill="none" className="t-moyen" />
      <polygon points={points(ins)} fill={BLEU} fillOpacity={0.08} stroke={BLEU} strokeWidth={1.8} />
      <line x1={C[0] - r} y1={C[1]} x2={C[0] + r} y2={C[1]} className="t-fin" strokeDasharray="4 3" />
      <Etiquette x={C[0]} y={C[1] - 6} ancre="middle" taille={12}>
        diamètre 1 m
      </Etiquette>
      <Etiquette x={330} y={84} taille={14} gras couleur={BLEU}>
        polygone inscrit : n sin(π/n)
      </Etiquette>
      <Etiquette x={330} y={112} taille={14} gras couleur={BRIQUE}>
        polygone circonscrit : n tan(π/n)
      </Etiquette>
      <Etiquette x={330} y={140} taille={14}>
        cercle : π
      </Etiquette>
      <Etiquette x={330} y={182} taille={13} classe="etiquette">
        n = {nn} côtés : quand n grandit,
      </Etiquette>
      <Etiquette x={330} y={202} taille={13} classe="etiquette">
        les deux périmètres tendent vers π
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.2.2 : dérivée ----------

/** Sécantes de plus en plus courtes issues de A sur f(x) = x² : leurs pentes tendent vers celle de la tangente, la dérivée. */
export function SecantesTangente({ a = 1, pas = [2, 1, 0.5] }: { a?: number; pas?: readonly number[] }) {
  const c = [0, 0, 1];
  const f = (x: number) => evaluerPolynome(c, x);
  const fp = evaluerPolynome(deriveePolynome(c), a);
  const R = repere2D({ x0: 50, y0: 20, l: 380, h: 220, xmin: 0, xmax: 3.4, ymin: 0, ymax: 10 });
  const couleurs = [BRIQUE, VERT, BLEU];
  return (
    <Figure alt={`Parabole y = x² : sécantes issues du point A d'abscisse ${n2(a)}, de pentes ${pas.map((h) => n2(penteSecante(f, a, h).avant)).join(', ')}, qui se rapprochent de la tangente de pente ${n2(fp)}`} largeur={620} hauteur={270}>
      <Axes R={R} gradX={[1, 2, 3]} gradY={[2, 4, 6, 8]} titreX="x" titreY="f(x) = x²" />
      <Courbe R={R} f={f} de={0} a={3.15} couleur="var(--trait)" epaisseur={2.6} />
      {pas.map((h, i) => (
        <Droite key={h} R={R} x1={a} y1={f(a)} m={penteSecante(f, a, h).avant} de={a - 0.5} a={a + h + 0.15} couleur={couleurs[i % 3]} epaisseur={1.4} />
      ))}
      <Droite R={R} x1={a} y1={f(a)} m={fp} de={0.1} a={3} couleur={ROUGE} epaisseur={2.6} />
      {pas.map((h, i) => (
        <PointGraphe key={`p${h}`} R={R} x={a + h} y={f(a + h)} couleur={couleurs[i % 3]} />
      ))}
      <PointGraphe R={R} x={a} y={f(a)} couleur={ROUGE} texte="A" dx={-16} dy={-6} />
      {pas.map((h, i) => (
        <Etiquette key={`l${h}`} x={450} y={64 + 28 * i} taille={13.5} gras couleur={couleurs[i % 3]}>
          h = {n2(h)} : pente {n2(penteSecante(f, a, h).avant)}
        </Etiquette>
      ))}
      <Etiquette x={450} y={64 + 28 * pas.length + 10} taille={13.5} gras couleur={ROUGE}>
        tangente : f′({n2(a)}) = {n2(fp)}
      </Etiquette>
      <Etiquette x={450} y={64 + 28 * pas.length + 40} taille={12} classe="etiquette">
        pente = [f(a + h) − f(a)] / h
      </Etiquette>
    </Figure>
  );
}

/** Profil en long : raccordement parabolique, tangente en x (la dérivée) et sécante sur [x, x + h]. */
export function ProfilRaccordement({ d, r }: { d: DonneesRaccordement; r: ResultatRaccordement & { f: (x: number) => number } }) {
  const zs = grad(0, d.L, d.L / 60).map(r.f);
  const zmin = Math.min(...zs);
  const zmax = Math.max(...zs);
  const marge = Math.max((zmax - zmin) * 0.25, 0.5);
  const R = repere2D({ x0: 60, y0: 20, l: 520, h: 190, xmin: 0, xmax: d.L, ymin: zmin - marge, ymax: zmax + marge });
  const pas = d.L > 200 ? 50 : d.L > 80 ? 20 : 10;
  const etendue = zmax - zmin + 2 * marge;
  const pasZ = etendue > 8 ? 2 : etendue > 4 ? 1 : 0.5;
  const xh = Math.min(d.x + d.h, d.L);
  return (
    <Figure alt={`Profil en long : raccordement de ${n2(d.p1)} % à ${n2(d.p2)} % sur ${n2(d.L)} m ; en x = ${n2(d.x)} m, pente ${n2(r.pente * 100)} % (tangente) et ${n2(r.secante * 100)} % sur la sécante de ${n2(d.h)} m`} largeur={620} hauteur={250}>
      <Axes R={R} gradX={grad(0, d.L, pas)} gradY={grad(Math.ceil((zmin - marge) / pasZ) * pasZ, zmax + marge, pasZ)} decY={pasZ < 1 ? 1 : 0} titreX="x (m)" titreY="z (m)" />
      <Courbe R={R} f={r.f} de={0} a={d.L} couleur="var(--trait)" epaisseur={2.6} />
      <Droite R={R} x1={d.x} y1={r.z} m={r.pente} de={Math.max(0, d.x - d.L / 4)} a={Math.min(d.L, d.x + d.L / 4)} couleur={ROUGE} />
      <Droite R={R} x1={d.x} y1={r.z} m={r.secante} de={d.x} a={xh} couleur={BLEU} epaisseur={2} />
      <PointGraphe R={R} x={d.x} y={r.z} couleur={ROUGE} texte={`tangente : ${n2(r.pente * 100)} %`} dx={-8} dy={-10} ancre="end" />
      <PointGraphe R={R} x={xh} y={r.f(xh)} couleur={BLEU} texte={`sécante : ${n2(r.secante * 100)} %`} dx={8} dy={16} />
      {r.xSommet !== null && r.zSommet !== null ? <PointGraphe R={R} x={r.xSommet} y={r.zSommet} couleur={VERT} texte={`sommet (pente nulle) : x = ${n2(r.xSommet)} m`} dy={-10} ancre="middle" dx={0} /> : null}
      <Etiquette x={R.X(0) + 4} y={R.Y(zmin - marge) - 6} taille={10.5} classe="etiquette">
        échelle des altitudes dilatée
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.2.3 : poutre déformée ----------

/** Déformée d'une poutre sur deux appuis (exagérée) et tangente en x : la rotation est la dérivée de la flèche. */
export function PoutreDeformee({ d, r, prefixe = 'pd' }: { d: DonneesFleche; r: ResultatFleche & { f: (x: number) => number; fp: (x: number) => number }; prefixe?: string }) {
  const x0 = 70;
  const l = 480;
  const yb = 70;
  const ky = 60 / Math.max(r.yMax, 1e-12);
  const X = (x: number) => x0 + (x / d.L) * l;
  const pts = grad(0, d.L, d.L / 60).map((x) => [X(x), yb + r.f(x) * ky] as const);
  const xP = X(d.x);
  const yP = yb + r.y * ky;
  const mEcran = (r.theta * ky * d.L) / l; // pente à l'écran, exagérée comme la flèche
  return (
    <Figure alt={`Poutre de ${n2(d.L)} m sous ${n2(d.q)} kN/m : flèche maximale ${n2(r.yMax * 1000)} mm à mi-portée, rotation ${nombre(r.theta0 * 1000, 3)} × 10⁻³ rad sur appui ; dessin exagéré`} largeur={620} hauteur={200}>
      <Hachures prefixe={prefixe} types={['terre']} />
      <ChargeRepartie x1={X(0)} x2={X(d.L)} y={yb - 4} texte={`q = ${n2(d.q)} kN/m`} />
      <line x1={X(0)} y1={yb} x2={X(d.L)} y2={yb} className="t-fin" strokeDasharray="5 4" />
      <polyline points={points(pts)} fill="none" stroke={BLEU} strokeWidth={3} />
      <AppuiDouble x={X(0)} y={yb} prefixe={prefixe} />
      <AppuiSimple x={X(d.L)} y={yb} />
      <line x1={xP - 70} y1={yP - mEcran * 70} x2={xP + 70} y2={yP + mEcran * 70} stroke={ROUGE} strokeWidth={1.6} />
      <circle cx={xP} cy={yP} r={3.6} fill={ROUGE} />
      <Etiquette x={xP + 10} y={yP + 30} taille={11.5} gras couleur={ROUGE}>
        tangente en x = {n2(d.x)} m : θ = y′(x) = {nombre(r.theta * 1000, 3)} × 10⁻³ rad
      </Etiquette>
      <Cote x1={X(d.L / 2)} y1={yb} x2={X(d.L / 2)} y2={yb + r.yMax * ky} decalage={-8} texte={`${n2(r.yMax * 1000)} mm`} />
      <Etiquette x={600} y={192} ancre="end" taille={10.5} classe="etiquette">
        déformée exagérée (flèches et rotations)
      </Etiquette>
    </Figure>
  );
}

/** Deux applications des règles de dérivation : rayon hydraulique d'un canal (quotient) et montée de l'eau dans un réservoir conique (composée). */
export function ReglesDerivationSchema({ b = 2, h = 0.5, R = 3, H = 4, hc = 2, Q = 6, prefixe = 'rd' }: { b?: number; h?: number; R?: number; H?: number; hc?: number; Q?: number; prefixe?: string }) {
  const rh = rayonHydraulique(b, h);
  const c = monteeCone(R, H, Q, hc);
  // canal : 90 px par mètre, profondeur dessinée 1,2 h + 0,3 m
  const k1 = Math.min(200 / b, 90 / (h + 0.3));
  const x0 = 40;
  const yf = 170;
  const B = b * k1;
  const Hc = (h + 0.3) * k1;
  const he = h * k1;
  // réservoir conique, pointe en bas
  const k2 = Math.min(125 / H, 100 / R);
  const cx = 470;
  const yp = 205;
  const rEcran = c.k * hc * k2;
  return (
    <Figure alt={`À gauche, canal rectangulaire de ${n2(b)} m de large, eau sur ${n2(h)} m : rayon hydraulique ${nombre(rh.R, 3)} m. À droite, réservoir conique rempli à ${n2(Q)} m³/h : à ${n2(hc)} m d'eau, le niveau monte de ${nombre(c.dhdt, 3)} m/h`} largeur={620} hauteur={250}>
      <Hachures prefixe={prefixe} types={['beton', 'eau']} />
      <path d={`M ${x0 - 14} ${yf - Hc} V ${yf + 14} H ${x0 + B + 14} V ${yf - Hc} H ${x0 + B} V ${yf} H ${x0} V ${yf - Hc} Z`} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <rect x={x0} y={yf - he} width={B} height={he} fill={hachure(prefixe, 'eau')} stroke="none" />
      <polyline points={points([[x0, yf - he], [x0, yf], [x0 + B, yf], [x0 + B, yf - he]])} fill="none" stroke={BLEU} strokeWidth={3.2} />
      <line x1={x0} y1={yf - he} x2={x0 + B} y2={yf - he} stroke={BLEU} strokeWidth={1.2} />
      <Cote x1={x0} y1={yf + 14} x2={x0 + B} y2={yf + 14} decalage={-18} texte={`b = ${n2(b)} m`} />
      <Cote x1={x0 + B + 14} y1={yf} x2={x0 + B + 14} y2={yf - he} decalage={-18} texte={`h = ${n2(h)} m`} />
      <Etiquette x={x0} y={30} taille={12} gras>
        Quotient : R(h) = b h / (b + 2h)
      </Etiquette>
      <Etiquette x={x0} y={50} taille={11} couleur={BLEU}>
        en bleu : périmètre mouillé P = b + 2h
      </Etiquette>
      <Etiquette x={x0} y={68} taille={11}>
        R = {nombre(rh.R, 3)} m ; dR/dh = {nombre(rh.dR, 3)}
      </Etiquette>
      <line x1={330} y1={20} x2={330} y2={235} className="t-fin" strokeDasharray="4 4" />
      <polygon points={points([[cx, yp], [cx - rEcran, yp - hc * k2], [cx + rEcran, yp - hc * k2]])} fill={hachure(prefixe, 'eau')} stroke="none" />
      <polyline points={points([[cx - R * k2, yp - H * k2], [cx, yp], [cx + R * k2, yp - H * k2]])} fill="none" className="t-fort" />
      <line x1={cx - rEcran} y1={yp - hc * k2} x2={cx + rEcran} y2={yp - hc * k2} stroke={BLEU} strokeWidth={1.6} />
      <line x1={cx} y1={yp - hc * k2} x2={cx + rEcran} y2={yp - hc * k2} stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={cx + rEcran / 2} y={yp - hc * k2 - 5} ancre="middle" taille={11} gras couleur={ROUGE}>
        r = k h
      </Etiquette>
      <Cote x1={cx + R * k2 + 10} y1={yp} x2={cx + R * k2 + 10} y2={yp - hc * k2} decalage={-14} texte={`h = ${n2(hc)} m`} />
      <Fleche x1={cx + 18} y1={yp - H * k2 - 4} x2={cx + 18} y2={yp - hc * k2 - 18} couleur={BLEU} epaisseur={1.8} tete={8} />
      <Etiquette x={cx + 26} y={yp - H * k2 + 10} taille={11.5} gras couleur={BLEU}>
        Q = {n2(Q)} m³/h
      </Etiquette>
      <Etiquette x={350} y={30} taille={12} gras>
        Composée : V = π k² h³ / 3
      </Etiquette>
      <Etiquette x={350} y={238} taille={11}>
        dh/dt = Q / (π k² h²) = {nombre(c.dhdt, 3)} m/h
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.2.4 : moment maximal ----------

/** f(x) = x³ − 3x et sa dérivée : le signe de f′ donne le sens de variation, ses zéros les extremums locaux. */
export function VariationsSchema() {
  const c = [0, -3, 0, 1];
  const f = (x: number) => evaluerPolynome(c, x);
  const dc = deriveePolynome(c);
  const fp = (x: number) => evaluerPolynome(dc, x);
  const R = repere2D({ x0: 60, y0: 18, l: 480, h: 170, xmin: -2.2, xmax: 2.2, ymin: -3, ymax: 3 });
  const Rp = repere2D({ x0: 60, y0: 222, l: 480, h: 86, xmin: -2.2, xmax: 2.2, ymin: -4, ymax: 12 });
  return (
    <Figure alt="Courbe de f(x) = x³ − 3x : maximum local 2 en x = −1, minimum local −2 en x = 1, tangentes horizontales ; en dessous, la dérivée 3x² − 3, positive avant −1, négative entre −1 et 1, positive après 1" largeur={620} hauteur={330}>
      <Axes R={R} gradX={[-2, -1, 1, 2]} gradY={[-2, 2]} titreX="x" titreY="f(x) = x³ − 3x" />
      <Courbe R={R} f={f} de={-2.15} a={2.15} couleur={BLEU} epaisseur={2.6} />
      {[-1, 1].map((x) => (
        <g key={x}>
          <line x1={R.X(x - 0.45)} y1={R.Y(f(x))} x2={R.X(x + 0.45)} y2={R.Y(f(x))} stroke={ROUGE} strokeWidth={1.8} />
          <line x1={R.X(x)} y1={R.Y(f(x))} x2={Rp.X(x)} y2={Rp.Y(0)} className="t-fin" strokeDasharray="3 3" />
        </g>
      ))}
      <PointGraphe R={R} x={-1} y={f(-1)} couleur={ROUGE} texte={`maximum local : f(−1) = ${nombre(f(-1), 0)}`} dx={8} dy={-10} />
      <PointGraphe R={R} x={1} y={f(1)} couleur={ROUGE} texte={`minimum local : f(1) = ${nombre(f(1), 0)}`} dx={-8} dy={20} ancre="end" />
      <Axes R={Rp} titreY="f′(x) = 3x² − 3" titreX="x" />
      <Aire R={Rp} f={(x) => Math.max(fp(x), 0)} de={-2.2} a={2.2} couleur={VERT} opacite={0.18} />
      <Aire R={Rp} f={(x) => Math.min(fp(x), 0)} de={-2.2} a={2.2} couleur={BRIQUE} opacite={0.25} />
      <Courbe R={Rp} f={fp} de={-2.2} a={2.2} couleur={VERT} />
      <Etiquette x={Rp.X(-1.75)} y={Rp.Y(2) - 2} ancre="middle" taille={11} gras couleur={VERT}>
        f′ &gt; 0 : f croît
      </Etiquette>
      <Etiquette x={Rp.X(0)} y={Rp.Y(-3.4)} ancre="middle" taille={11} gras couleur={BRIQUE}>
        f′ &lt; 0 : f décroît
      </Etiquette>
      <Etiquette x={Rp.X(1.75)} y={Rp.Y(2) - 2} ancre="middle" taille={11} gras couleur={VERT}>
        f′ &gt; 0 : f croît
      </Etiquette>
    </Figure>
  );
}

/** Poutre chargée, effort tranchant V(x) et moment M(x) : le maximum de M est là où V s'annule. */
export function MomentMaxSchema({ d, r, prefixe = 'mm' }: { d: DonneesMomentMax; r: ResultatMomentMax; prefixe?: string }) {
  const x0 = 70;
  const l = 480;
  const X = (x: number) => x0 + (x / d.L) * l;
  const Vmax = Math.max(Math.abs(r.RA), Math.abs(r.RB), 1e-9);
  const RV = repere2D({ x0, y0: 120, l, h: 90, xmin: 0, xmax: d.L, ymin: -Vmax * 1.15, ymax: Vmax * 1.15 });
  const RM = repere2D({ x0, y0: 240, l, h: 100, xmin: 0, xmax: d.L, ymin: -r.Mmax * 0.05, ymax: r.Mmax * 1.25 });
  return (
    <Figure alt={`Poutre de ${n2(d.L)} m, charge ${n2(d.q)} kN/m et ${n2(d.P)} kN à ${n2(d.a)} m : l'effort tranchant s'annule en x = ${n2(r.x0)} m, où le moment est maximal, ${n2(r.Mmax)} kN·m`} largeur={620} hauteur={360}>
      <Hachures prefixe={prefixe} types={['terre']} />
      {d.q > 0 ? <ChargeRepartie x1={X(0)} x2={X(d.L)} y={60} texte={`q = ${n2(d.q)} kN/m`} /> : null}
      {d.P > 0 ? <ChargePonctuelle x={X(d.a)} y={60} longueur={46} texte={`P = ${n2(d.P)} kN`} /> : null}
      <line x1={X(0)} y1={60} x2={X(d.L)} y2={60} className="t-fort" />
      <AppuiDouble x={X(0)} y={60} prefixe={prefixe} />
      <AppuiSimple x={X(d.L)} y={60} />
      <Axes R={RV} titreY="V (kN)" />
      <Courbe R={RV} f={r.V} de={0} a={d.L} n={400} couleur={BLEU} />
      <PointGraphe R={RV} x={r.x0} y={0} couleur={VERT} texte={`V = 0 en x = ${n2(r.x0)} m`} dy={-8} />
      <Axes R={RM} titreY="M (kN·m)" titreX="x (m)" />
      <Aire R={RM} f={r.M} de={0} a={d.L} n={300} couleur={ROUGE} opacite={0.12} />
      <Courbe R={RM} f={r.M} de={0} a={d.L} n={400} couleur={ROUGE} />
      <PointGraphe R={RM} x={r.x0} y={r.Mmax} couleur={VERT} texte={`Mmax = ${n2(r.Mmax)} kN·m`} dy={-8} rappel />
    </Figure>
  );
}

// ---------- L1.2.5 : approximations ----------

/** sin α, tan α et α (radians) entre 0 et 60° : les trois se confondent pour les petits angles. */
export function PetitsAngles({ marque = 10 }: { marque?: number }) {
  const R = repere2D({ x0: 60, y0: 20, l: 500, h: 200, xmin: 0, xmax: 60, ymin: 0, ymax: 1.25 });
  const rad = (deg: number) => (deg * Math.PI) / 180;
  return (
    <Figure alt={`Courbes de α (en radians), sin α et tan α pour α de 0 à 60° : elles se confondent au voisinage de 0, et s'écartent nettement au-delà de 20°`} largeur={620} hauteur={260}>
      <Axes R={R} gradX={grad(0, 60, 10)} gradY={[0.5, 1]} decY={1} titreX="α (°)" />
      <Courbe R={R} f={(x) => Math.tan(rad(x))} de={0} a={50} couleur={BRIQUE} />
      <Courbe R={R} f={(x) => rad(x)} de={0} a={60} couleur={BLEU} pointilles />
      <Courbe R={R} f={(x) => Math.sin(rad(x))} de={0} a={60} couleur={VERT} />
      <line x1={R.X(marque)} y1={R.Y(0)} x2={R.X(marque)} y2={R.Y(1.2)} className="t-fin" strokeDasharray="3 3" />
      <Etiquette x={R.X(marque) + 4} y={R.Y(1.15)} taille={10.5}>
        {nombre(marque, 0)}°
      </Etiquette>
      <Etiquette x={R.X(48) - 6} y={R.Y(1.12)} ancre="end" taille={11.5} gras couleur={BRIQUE}>
        tan α
      </Etiquette>
      <Etiquette x={R.X(60) - 4} y={R.Y(1.05) - 2} ancre="end" taille={11.5} gras couleur={BLEU}>
        α (rad)
      </Etiquette>
      <Etiquette x={R.X(60) - 4} y={R.Y(0.866) + 16} ancre="end" taille={11.5} gras couleur={VERT}>
        sin α
      </Etiquette>
    </Figure>
  );
}

/** Câble parabolique entre deux appuis de même niveau : portée l, flèche f, longueur S. */
export function CableParabolique({ d, r }: { d: DonneesCable; r: { exacte: number; approchee: number } }) {
  const x0 = 70;
  const l = 480;
  const y0 = 60;
  const kf = Math.min(120, (l * d.f) / d.l * 3) / Math.max(d.f, 1e-9); // flèche dessinée amplifiée et bornée
  const pts = grad(0, 1, 1 / 60).map((u) => [x0 + u * l, y0 + 4 * d.f * u * (1 - u) * kf] as const);
  return (
    <Figure alt={`Câble de ${n2(d.l)} m de portée avec une flèche de ${n2(d.f)} m : longueur ${nombre(r.exacte, 3)} m (exacte) et ${nombre(r.approchee, 3)} m (approchée)`} largeur={620} hauteur={230}>
      {[x0, x0 + l].map((x) => (
        <g key={x}>
          <line x1={x} y1={y0 - 20} x2={x} y2={200} className="t-fort" strokeWidth={4} />
        </g>
      ))}
      <line x1={x0} y1={y0} x2={x0 + l} y2={y0} className="t-fin" strokeDasharray="5 4" />
      <polyline points={points(pts)} fill="none" stroke={BLEU} strokeWidth={2.4} />
      <Cote x1={x0} y1={y0} x2={x0 + l} y2={y0} decalage={24} texte={`l = ${n2(d.l)} m`} />
      <Cote x1={x0 + l / 2} y1={y0 + d.f * kf} x2={x0 + l / 2} y2={y0} decalage={-10} texte={`f = ${n2(d.f)} m`} />
      <Etiquette x={x0 + l / 2} y={y0 + d.f * kf + 24} ancre="middle" taille={11.5} gras couleur={BLEU}>
        S = {nombre(r.exacte, 3)} m (exacte) ≈ {nombre(r.approchee, 3)} m (approchée)
      </Etiquette>
      <Etiquette x={600} y={222} ancre="end" taille={10.5} classe="etiquette">
        flèche exagérée sur le dessin
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.2.6 : intégrale, somme de rectangles ----------

/** Intégrale et aire signée : f(x) = 3x − x² est positive sur [0 ; 3], négative sur [3 ; 4]. */
export function AireSigneeSchema() {
  const c = [0, 3, -1];
  const f = (x: number) => evaluerPolynome(c, x);
  const R = repere2D({ x0: 50, y0: 20, l: 400, h: 210, xmin: 0, xmax: 4.3, ymin: -4.5, ymax: 3 });
  const plus = integralePolynome(c, 0, 3);
  const moins = integralePolynome(c, 3, 4);
  const total = integralePolynome(c, 0, 4);
  return (
    <Figure alt={`Courbe de f(x) = 3x − x² : aire positive ${n2(plus)} entre 0 et 3, aire négative ${n2(moins)} entre 3 et 4 ; l'intégrale de 0 à 4 vaut ${n2(total)}`} largeur={620} hauteur={260}>
      <Aire R={R} f={f} de={0} a={3} couleur={BLEU} opacite={0.2} />
      <Aire R={R} f={f} de={3} a={4} couleur={BRIQUE} opacite={0.35} />
      <Axes R={R} gradX={[1, 2, 3, 4]} gradY={[-4, -2, 2]} titreX="x" titreY="f(x) = 3x − x²" />
      <Courbe R={R} f={f} de={0} a={4.2} couleur="var(--trait)" epaisseur={2.4} />
      <Etiquette x={R.X(1.5)} y={R.Y(1)} ancre="middle" taille={13} gras couleur={BLEU}>
        +
      </Etiquette>
      <Etiquette x={R.X(3.62)} y={R.Y(-1.2)} ancre="middle" taille={13} gras couleur={BRIQUE}>
        −
      </Etiquette>
      <Etiquette x={470} y={70} taille={11.5} couleur={BLEU}>
        de 0 à 3 : {n2(plus)}
      </Etiquette>
      <Etiquette x={470} y={94} taille={11.5} couleur={BRIQUE}>
        de 3 à 4 : {n2(moins)}
      </Etiquette>
      <Etiquette x={470} y={122} taille={11.5} gras>
        de 0 à 4 : {n2(total)}
      </Etiquette>
      <Etiquette x={470} y={150} taille={10.5} classe="etiquette">
        sous l’axe, l’aire
      </Etiquette>
      <Etiquette x={470} y={166} taille={10.5} classe="etiquette">
        compte négativement
      </Etiquette>
    </Figure>
  );
}

/** Charge q(x) : l'aire sous la courbe est la résultante ; n rectangles au milieu l'approchent. */
export function SommeRectangles({ d, r }: { d: DonneesChargeVariable; r: ResultatChargeVariable }) {
  const n = Math.max(1, Math.min(Math.round(d.n), 60));
  const qs = grad(0, d.L, d.L / 60).map(r.q);
  const qmax = Math.max(...qs, 1e-9);
  const R = repere2D({ x0: 60, y0: 20, l: 500, h: 180, xmin: 0, xmax: d.L, ymin: 0, ymax: qmax * 1.2 });
  const dx = d.L / n;
  const pasQ = qmax > 40 ? 10 : qmax > 16 ? 5 : qmax > 6 ? 2 : 1;
  return (
    <Figure alt={`Charge q(x) sur ${n2(d.L)} m : résultante exacte ${n2(r.R)} kN (aire sous la courbe), approchée par ${n} rectangles : ${n2(r.Rn)} kN`} largeur={620} hauteur={240}>
      <Axes R={R} gradX={grad(0, d.L, d.L > 12 ? 4 : d.L > 6 ? 2 : 1)} gradY={grad(pasQ, qmax * 1.1, pasQ)} titreX="x (m)" titreY="q (kN/m)" />
      <Aire R={R} f={r.q} de={0} a={d.L} couleur={BLEU} opacite={0.12} />
      {Array.from({ length: n }, (_, i) => {
        const xm = (i + 0.5) * dx;
        const q = r.q(xm);
        return <rect key={i} x={R.X(i * dx)} y={R.Y(Math.max(q, 0))} width={R.X(dx) - R.X(0)} height={Math.abs(R.Y(0) - R.Y(q))} fill={BRIQUE} fillOpacity={0.2} stroke={BRIQUE} strokeWidth={1} />;
      })}
      <Courbe R={R} f={r.q} de={0} a={d.L} couleur={BLEU} />
      <Etiquette x={R.X(d.L / 2)} y={R.Y(qmax * 1.12)} ancre="middle" taille={11.5} gras>
        exacte : {n2(r.R)} kN · {n} rectangles : {n2(r.Rn)} kN
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.2.7 : vent sur un mât ----------

/** Mât soumis à une charge de vent croissante avec la hauteur : résultante et moment à la base par intégration. */
export function VentMat({ d, r, prefixe = 'vm' }: { d: DonneesVentPuissance; r: ResultatVentPuissance; prefixe?: string }) {
  const xm = 150;
  const yb = 250;
  const kz = 220 / d.H;
  const qmax = r.q(d.H);
  const kq = 140 / Math.max(qmax, 1e-9);
  const Z = (z: number) => yb - z * kz;
  const profil = grad(0, d.H, d.H / 40).map((z) => [xm - r.q(z) * kq, Z(z)] as const);
  return (
    <Figure alt={`Mât de ${n2(d.H)} m : charge de vent qui croît avec la hauteur, résultante ${n2(r.F)} kN à ${n2(r.zBarre)} m, moment ${n2(r.M)} kN·m à la base`} largeur={620} hauteur={280}>
      <Hachures prefixe={prefixe} types={['terre']} />
      <rect x={60} y={yb} width={200} height={14} fill={hachure(prefixe, 'terre')} stroke="none" />
      <line x1={60} y1={yb} x2={260} y2={yb} className="t-fort" />
      <line x1={xm} y1={yb} x2={xm} y2={Z(d.H)} className="t-fort" strokeWidth={5} />
      <polyline points={points([[xm, yb], ...profil, [xm, Z(d.H)]])} fill={BLEU} fillOpacity={0.12} stroke={BLEU} strokeWidth={1.6} />
      {grad(d.H / 6, d.H, d.H / 6).map((z) => (
        <Fleche key={z} x1={xm - r.q(z) * kq} y1={Z(z)} x2={xm - 2} y2={Z(z)} couleur={BLEU} epaisseur={1.4} tete={6} />
      ))}
      <Fleche x1={xm + 4} y1={Z(r.zBarre)} x2={xm + 100} y2={Z(r.zBarre)} couleur={ROUGE} epaisseur={3} />
      <Etiquette x={xm + 10} y={Z(r.zBarre) - 8} taille={12.5} gras couleur={ROUGE}>
        F = {n2(r.F)} kN
      </Etiquette>
      <Cote x1={xm + 130} y1={yb} x2={xm + 130} y2={Z(r.zBarre)} decalage={-8} texte={`z̄ = ${n2(r.zBarre)} m`} />
      <ArcMoment cx={xm} cy={yb} r={26} a0={150} a1={30} couleur={ROUGE} texte={`M = ${n2(r.M)} kN·m`} tx={xm + 34} ty={yb + 28} />
      <Etiquette x={xm - 8} y={Z(d.H) - 8} ancre="end" taille={12} couleur={BLEU}>
        q(z) = q<tspan dy={4} fontSize={9}>r</tspan>
        <tspan dy={-4}> (z / z</tspan>
        <tspan dy={4} fontSize={9}>r</tspan>
        <tspan dy={-4}>)^α</tspan>
      </Etiquette>
      <Etiquette x={380} y={70} taille={13.5}>
        F = ∫ q(z) dz
      </Etiquette>
      <Etiquette x={380} y={98} taille={13.5}>
        M = ∫ z q(z) dz
      </Etiquette>
      <Etiquette x={380} y={126} taille={13.5}>
        z̄ = M / F
      </Etiquette>
      <Etiquette x={380} y={160} taille={11.5} classe="etiquette">
        le vent pousse vers la droite ;
      </Etiquette>
      <Etiquette x={380} y={176} taille={11.5} classe="etiquette">
        la fondation reprend F et M
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.2.8 : inertie par bandes, volume de révolution ----------

/** Rectangle découpé en n bandes : chaque bande contribue b dy × y² à l'inertie. */
export function InertieBandes({ d, r }: { d: DonneesBandes; r: ResultatBandes }) {
  const n = Math.max(1, Math.min(Math.round(d.n), 40));
  const k = Math.min(160 / d.b, 230 / d.h);
  const xg = 150;
  const yg = 140;
  const B = d.b * k;
  const H = d.h * k;
  const dy = H / n;
  const iMis = Math.max(0, Math.min(n - 1, Math.floor(n * 0.82)));
  return (
    <Figure alt={`Rectangle de ${n2(d.b)} × ${n2(d.h)} cm découpé en ${n} bandes : somme ${nombre(r.In, 0)} cm⁴, inertie exacte ${nombre(r.Iexact, 0)} cm⁴`} largeur={620} hauteur={280}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={xg - B / 2} y={yg - H / 2 + i * dy} width={B} height={dy} fill={i === iMis ? BRIQUE : BLEU} fillOpacity={i === iMis ? 0.35 : 0.08} className="t-fin" />
      ))}
      <rect x={xg - B / 2} y={yg - H / 2} width={B} height={H} fill="none" className="t-fort" />
      <line x1={xg - B / 2 - 30} y1={yg} x2={xg + B / 2 + 30} y2={yg} stroke={ROUGE} strokeWidth={1.4} strokeDasharray="10 4 2 4" />
      <Etiquette x={xg + B / 2 + 34} y={yg - 6} taille={12} gras couleur={ROUGE}>
        axe passant par G
      </Etiquette>
      <Fleche x1={xg + B / 2 + 18} y1={yg} x2={xg + B / 2 + 18} y2={yg - H / 2 + (iMis + 0.5) * dy} couleur="var(--trait)" epaisseur={1.2} tete={7} />
      <Etiquette x={xg + B / 2 + 24} y={(yg + yg - H / 2 + (iMis + 0.5) * dy) / 2 + 5} taille={13} gras>
        y
      </Etiquette>
      <Etiquette x={xg - B / 2 - 6} y={yg - H / 2 + (iMis + 0.5) * dy + 4} ancre="end" taille={12.5} gras couleur={BRIQUE}>
        b dy
      </Etiquette>
      <Etiquette x={360} y={70} taille={14} gras>
        I ≈ Σ b dy × y²
      </Etiquette>
      <Etiquette x={360} y={98} taille={13.5}>
        {n} bandes : {nombre(r.In, 0)} cm⁴
      </Etiquette>
      <Etiquette x={360} y={126} taille={13.5} gras couleur={VERT}>
        limite : b h³ / 12 = {nombre(r.Iexact, 0)} cm⁴
      </Etiquette>
      <Etiquette x={360} y={154} taille={12.5} classe="etiquette">
        écart : {nombre(r.ecartRelatif * 100, 2)} %
      </Etiquette>
    </Figure>
  );
}

/** Triangle (base en bas) découpé en bandes horizontales : largeur b(y) = b (1 − y/h), centre de gravité à h/3. */
export function TriangleBandes({ b = 30, h = 45, prefixe = 'tb' }: { b?: number; h?: number; prefixe?: string }) {
  const t = triangleIntegre(b, h);
  const k = Math.min(260 / b, 220 / h);
  const xg = 170;
  const yb = 245;
  const X = (x: number) => xg + x * k;
  const Y = (y: number) => yb - y * k;
  const yBande = 0.55 * h;
  const dy = h / 12;
  const lb = b * (1 - yBande / h);
  return (
    <Figure alt={`Triangle de base ${n2(b)} cm et de hauteur ${n2(h)} cm : une bande horizontale à la hauteur y a pour largeur b(1 − y/h) ; aire ${nombre(t.A, 0)} cm², centre de gravité à ${n2(t.yG)} cm de la base`} largeur={620} hauteur={280}>
      <Hachures prefixe={prefixe} types={['beton']} />
      <polygon points={points([[X(-b / 2), Y(0)], [X(b / 2), Y(0)], [X(0), Y(h)]])} fill={hachure(prefixe, 'beton')} className="t-fort" />
      <rect x={X(-lb / 2)} y={Y(yBande + dy / 2)} width={lb * k} height={dy * k} fill={BRIQUE} fillOpacity={0.45} stroke={BRIQUE} strokeWidth={1.2} />
      <line x1={X(-b / 2) - 26} y1={Y(t.yG)} x2={X(b / 2) + 26} y2={Y(t.yG)} stroke={ROUGE} strokeWidth={1.4} strokeDasharray="10 4 2 4" />
      <circle cx={X(0)} cy={Y(t.yG)} r={4} fill={ROUGE} />
      <Etiquette x={X(b / 2) + 30} y={Y(t.yG) + 4} taille={12.5} gras couleur={ROUGE}>
        G, à h/3 = {n2(t.yG)} cm
      </Etiquette>
      <line x1={X(lb / 2) + 2} y1={Y(yBande)} x2={X(lb / 2) + 40} y2={Y(yBande) - 30} className="t-fin" />
      <Etiquette x={X(lb / 2) + 44} y={Y(yBande) - 34} taille={12.5} gras couleur={BRIQUE}>
        bande : largeur b(y) = b (1 − y/h)
      </Etiquette>
      <Etiquette x={X(lb / 2) + 44} y={Y(yBande) - 18} taille={12} couleur={BRIQUE}>
        épaisseur dy
      </Etiquette>
      <Cote x1={X(-b / 2) - 40} y1={Y(0)} x2={X(-b / 2) - 40} y2={Y(yBande)} decalage={0} texte="y" />
      <Cote x1={X(-b / 2)} y1={Y(0)} x2={X(b / 2)} y2={Y(0)} decalage={-18} texte={`b = ${n2(b)} cm`} />
      <Etiquette x={420} y={170} taille={13} gras>
        A = ∫ b(y) dy = b h / 2
      </Etiquette>
      <Etiquette x={420} y={194} taille={13}>
        y<tspan dy={4} fontSize={10}>G</tspan>
        <tspan dy={-4}> = ∫ y b(y) dy / A = h / 3</tspan>
      </Etiquette>
      <Etiquette x={420} y={218} taille={13}>
        I<tspan dy={4} fontSize={10}>base</tspan>
        <tspan dy={-4}> = ∫ y² b(y) dy = b h³ / 12</tspan>
      </Etiquette>
      <Etiquette x={420} y={246} taille={12.5} gras couleur={VERT}>
        A = {nombre(t.A, 0)} cm² ; I<tspan dy={4} fontSize={10}>G</tspan>
        <tspan dy={-4}> = {nombre(t.IG, 0)} cm⁴</tspan>
      </Etiquette>
    </Figure>
  );
}

/** Cuve de château d'eau, solide de révolution : profil générateur, tranches circulaires, solide. */
export function CuveRevolution({ d }: { d: DonneesCuveConique }) {
  const c = cuveConique(d);
  const H = d.Hk + d.Hc;
  const cercle = (rr: number, z: number, n = 48): Point3[] => Array.from({ length: n }, (_, i) => [rr * Math.cos((2 * Math.PI * i) / n), rr * Math.sin((2 * Math.PI * i) / n), z] as Point3);
  const { P, poly, hauteur } = cadreIsoDirect([[-d.R, -d.R, 0], [d.R, d.R, 0], [-d.R, -d.R, H], [d.R, d.R, H], [0, 0, H + 0.6]], 620, 420, 16);
  const tranches = grad(0.2, H - 0.2, H / 8);
  // silhouette : points extrêmes gauche et droite de chaque cercle à l'écran
  const extremes = (rr: number, z: number) => {
    const pts = cercle(rr, z, 96).map(P);
    return [pts.reduce((a, b) => (b[0] < a[0] ? b : a)), pts.reduce((a, b) => (b[0] > a[0] ? b : a))] as const;
  };
  const [g0, d0] = extremes(d.r0, 0);
  const [g1, d1] = extremes(d.R, d.Hk);
  const [g2, d2] = extremes(d.R, H);
  return (
    <Figure alt={`Cuve de révolution : fond tronconique de ${n2(d.Hk)} m, du rayon ${n2(d.r0)} m au rayon ${n2(d.R)} m, puis cylindre de ${n2(d.Hc)} m ; volume ${n2(c.Vintegre)} m³`} largeur={620} hauteur={hauteur}>
      <Calque id="solide">
        <polygon points={poly(cercle(d.r0, 0))} fill="var(--color-beton-clair)" className="t-fin" />
        <polyline points={points([g0, g1, g2])} fill="none" className="t-moyen" />
        <polyline points={points([d0, d1, d2])} fill="none" className="t-moyen" />
        <polygon points={poly(cercle(d.R, d.Hk))} fill="none" className="t-fin" strokeDasharray="4 3" />
        <polygon points={poly(cercle(d.R, H))} fill="var(--color-beton-clair)" fillOpacity={0.5} className="t-moyen" />
      </Calque>
      <Calque id="tranches">
        {tranches.map((z) => (
          <polygon key={z} points={poly(cercle(c.r(z), z))} fill={BLEU} fillOpacity={0.1} stroke={BLEU} strokeWidth={1} />
        ))}
      </Calque>
      <Calque id="profil">
        <line x1={P([0, 0, -0.3])[0]} y1={P([0, 0, -0.3])[1]} x2={P([0, 0, H + 0.6])[0]} y2={P([0, 0, H + 0.6])[1]} stroke={ROUGE} strokeWidth={1.2} strokeDasharray="10 4 2 4" />
        <polyline points={points([P([0, 0, 0]), P([d.r0, 0, 0]), P([d.R, 0, d.Hk]), P([d.R, 0, H]), P([0, 0, H])])} fill="none" stroke={ROUGE} strokeWidth={2.4} />
        <Etiquette x={P([0, 0, H + 0.6])[0] + 6} y={P([0, 0, H + 0.6])[1]} taille={11.5} gras couleur={ROUGE}>
          axe z
        </Etiquette>
        <Etiquette x={P([d.R, 0, H / 2 + d.Hk / 2])[0] - 8} y={P([d.R, 0, H / 2 + d.Hk / 2])[1]} ancre="end" taille={11.5} gras couleur={ROUGE}>
          r(z)
        </Etiquette>
      </Calque>
      <Calque id="cotes">
        <Etiquette x={18} y={hauteur - 16} taille={11.5}>
          V = ∫ π r(z)² dz = {n2(c.Vintegre)} m³
        </Etiquette>
      </Calque>
    </Figure>
  );
}

// ---------- L1.2.9 : courbes de niveau et gradient ----------

/** Courbes de niveau d'un terrain z(x, y) : gradient (montée la plus raide) et direction d'écoulement de l'eau. */
export function CourbesNiveau({ d, r }: { d: DonneesTerrain; r: ResultatTerrain }) {
  const LX = Math.max(80, d.x * 1.6);
  const LY = Math.max(50, d.y * 1.6);
  const R = repere2D({ x0: 50, y0: 20, l: 380, h: 240, xmin: 0, xmax: LX, ymin: 0, ymax: LY });
  const a = d.a / 100;
  const b = d.b / 100;
  const coins = [r.f(0, 0), r.f(LX, 0), r.f(0, LY), r.f(LX, LY), r.f(0, -b / (2 * d.c || 1e9))].filter(Number.isFinite);
  const zmin = Math.min(...coins);
  const zmax = Math.max(...coins);
  const pas = (zmax - zmin) / 8 > 1 ? 1 : 0.5;
  const niveaux = grad(Math.ceil(zmin / pas) * pas, zmax, pas);
  const ligne = (zk: number) =>
    a !== 0
      ? grad(0, LY, LY / 50)
          .map((y) => [(zk - d.z0 - b * y - d.c * y * y) / a, y] as const)
          .filter(([x]) => x >= 0 && x <= LX)
          .map(([x, y]) => [R.X(x), R.Y(y)] as const)
      : [];
  const g = Math.hypot(r.zx, r.zy) || 1;
  const L = 60;
  return (
    <Figure alt={`Courbes de niveau du terrain : au point (${n2(d.x)} ; ${n2(d.y)}), altitude ${n2(r.z)} m, plus forte pente ${n2(r.pente * 100)} %, l'eau s'écoule dans la direction ${nombre(r.direction, 0)}°`} largeur={620} hauteur={290}>
      <rect x={R.X(0)} y={R.Y(LY)} width={R.l} height={R.h} fill="none" className="t-fin" />
      {niveaux.map((zk) => {
        const pts = ligne(zk);
        if (pts.length < 2) return null;
        const m = pts[Math.floor(pts.length / 2)]!;
        return (
          <g key={zk}>
            <polyline points={points(pts)} fill="none" stroke={BRIQUE} strokeWidth={1.1} />
            <Etiquette x={m[0] + 3} y={m[1] - 3} taille={9.5} couleur={BRIQUE}>
              {nombre(zk, 1)}
            </Etiquette>
          </g>
        );
      })}
      <circle cx={R.X(d.x)} cy={R.Y(d.y)} r={4} fill="var(--trait)" />
      <Fleche x1={R.X(d.x)} y1={R.Y(d.y)} x2={R.X(d.x) + (r.zx / g) * L} y2={R.Y(d.y) - (r.zy / g) * L} couleur={BLEU} epaisseur={2.4} texte="grad z (montée)" tx={R.X(d.x) + (r.zx / g) * L + 6} ty={R.Y(d.y) - (r.zy / g) * L} />
      <Fleche x1={R.X(d.x)} y1={R.Y(d.y)} x2={R.X(d.x) - (r.zx / g) * L} y2={R.Y(d.y) + (r.zy / g) * L} couleur={VERT} epaisseur={2.4} texte="écoulement de l’eau" tx={R.X(d.x) - (r.zx / g) * L - 6} ty={R.Y(d.y) + (r.zy / g) * L + 12} ancre="end" />
      <Etiquette x={R.X(LX) + 6} y={R.Y(0) + 4} taille={11}>
        x (m)
      </Etiquette>
      <Etiquette x={R.X(0) - 4} y={R.Y(LY) - 6} taille={11}>
        y (m)
      </Etiquette>
      <Etiquette x={450} y={60} taille={11.5}>
        ∂z/∂x = {nombre(r.zx * 100, 2)} %
      </Etiquette>
      <Etiquette x={450} y={82} taille={11.5}>
        ∂z/∂y = {nombre(r.zy * 100, 2)} %
      </Etiquette>
      <Etiquette x={450} y={104} taille={11.5} gras>
        pente : {nombre(r.pente * 100, 2)} %
      </Etiquette>
      <Etiquette x={450} y={130} taille={10.5} classe="etiquette">
        courbes tous les {nombre(pas, 1)} m
      </Etiquette>
    </Figure>
  );
}

/** Deux coupes du terrain par le point étudié : à y fixé (pente ∂z/∂x) et à x fixé (pente ∂z/∂y). */
export function CoupesTerrain({ d, r }: { d: DonneesTerrain; r: ResultatTerrain }) {
  const LX = Math.max(80, d.x * 1.6);
  const LY = Math.max(50, d.y * 1.6);
  const fx = (x: number) => r.f(x, d.y);
  const fy = (y: number) => r.f(d.x, y);
  const borne = (f: (t: number) => number, L: number) => {
    const v = grad(0, L, L / 40).map(f);
    const m = Math.max((Math.max(...v) - Math.min(...v)) * 0.2, 0.3);
    return [Math.min(...v) - m, Math.max(...v) + m] as const;
  };
  const [a1, b1] = borne(fx, LX);
  const [a2, b2] = borne(fy, LY);
  const R1 = repere2D({ x0: 50, y0: 40, l: 220, h: 170, xmin: 0, xmax: LX, ymin: a1, ymax: b1 });
  const R2 = repere2D({ x0: 370, y0: 40, l: 220, h: 170, xmin: 0, xmax: LY, ymin: a2, ymax: b2 });
  return (
    <Figure alt={`Deux coupes du terrain par le point (${n2(d.x)} ; ${n2(d.y)}) : à y fixé, une droite de pente ${pcF(r.zx)} ; à x fixé, une parabole dont la tangente au point a la pente ${pcF(r.zy)}`} largeur={620} hauteur={260}>
      <Etiquette x={R1.x0} y={22} taille={12} gras>
        coupe à y = {nombre(d.y, 0)} m (y fixé)
      </Etiquette>
      <Axes R={R1} gradX={grad(0, LX, LX > 100 ? 40 : 20)} titreX="x (m)" titreY="z (m)" />
      <Courbe R={R1} f={fx} de={0} a={LX} couleur={BRIQUE} epaisseur={2.6} />
      <PointGraphe R={R1} x={d.x} y={r.z} couleur={ROUGE} texte={`∂z/∂x = ${pcF(r.zx)}`} dx={-8} dy={-12} ancre="end" />
      <Etiquette x={R2.x0} y={22} taille={12} gras>
        coupe à x = {nombre(d.x, 0)} m (x fixé)
      </Etiquette>
      <Axes R={R2} gradX={grad(0, LY, LY > 60 ? 20 : 10)} titreX="y (m)" titreY="z (m)" />
      <Courbe R={R2} f={fy} de={0} a={LY} couleur={BRIQUE} epaisseur={2.6} />
      <Droite R={R2} x1={d.y} y1={r.z} m={r.zy} de={Math.max(0, d.y - LY / 4)} a={Math.min(LY, d.y + LY / 4)} couleur={ROUGE} />
      <PointGraphe R={R2} x={d.y} y={r.z} couleur={ROUGE} texte={`∂z/∂y = ${pcF(r.zy)}`} dx={-8} dy={-12} ancre="end" />
      <Etiquette x={310} y={252} ancre="middle" taille={10.5} classe="etiquette">
        échelle des altitudes dilatée ; chaque dérivée partielle est la pente d’une coupe
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.2.10 : cubature ----------

/** Intégrale double : maillage cartésien (dA = dx dy, intégration par bandes) et maillage polaire d'un disque (dA = r dr dθ). */
export function DomainesDoubles() {
  const x0 = 40;
  const y0 = 40;
  const L = 240;
  const H = 160;
  const n = 8;
  const m = 6;
  const dx = L / n;
  const dy = H / m;
  const jBande = 3;
  const iMaille = 5;
  const cx = 470;
  const cy = 125;
  const R = 95;
  const anneaux = 5;
  const secteurs = 16;
  const k = 3; // anneau de la maille mise en évidence
  const s = 2; // secteur de la maille mise en évidence
  const t1 = (2 * Math.PI * s) / secteurs;
  const t2 = (2 * Math.PI * (s + 1)) / secteurs;
  const r1 = (R * k) / anneaux;
  const r2 = (R * (k + 1)) / anneaux;
  const P = (r: number, t: number) => `${cx + r * Math.cos(t)} ${cy - r * Math.sin(t)}`;
  return (
    <Figure alt="À gauche, un rectangle quadrillé : une bande horizontale d'épaisseur dy et une maille dx dy ; on intègre d'abord en x le long de la bande, puis on additionne les bandes en y. À droite, un disque découpé en anneaux et en secteurs : une maille d'aire r dr dθ" largeur={620} hauteur={250}>
      <rect x={x0} y={y0 + (m - 1 - jBande) * dy} width={L} height={dy} fill={BLEU} fillOpacity={0.12} stroke="none" />
      <rect x={x0 + iMaille * dx} y={y0 + (m - 1 - jBande) * dy} width={dx} height={dy} fill={BRIQUE} fillOpacity={0.5} stroke={BRIQUE} strokeWidth={1.2} />
      {Array.from({ length: n + 1 }, (_, i) => (
        <line key={`v${i}`} x1={x0 + i * dx} y1={y0} x2={x0 + i * dx} y2={y0 + H} className="t-fin" />
      ))}
      {Array.from({ length: m + 1 }, (_, j) => (
        <line key={`h${j}`} x1={x0} y1={y0 + j * dy} x2={x0 + L} y2={y0 + j * dy} className="t-fin" />
      ))}
      <rect x={x0} y={y0} width={L} height={H} fill="none" className="t-fort" />
      <Fleche x1={x0 + 6} y1={y0 + (m - 0.5 - jBande) * dy} x2={x0 + L - 6} y2={y0 + (m - 0.5 - jBande) * dy} couleur={BLEU} epaisseur={1.8} tete={8} />
      <Fleche x1={x0 + L + 18} y1={y0 + H} x2={x0 + L + 18} y2={y0 + 4} couleur={VERT} epaisseur={1.8} tete={8} />
      <Etiquette x={x0 + L + 26} y={y0 + H / 2} taille={11} couleur={VERT}>
        puis en y
      </Etiquette>
      <Etiquette x={x0} y={y0 - 10} taille={11} couleur={BLEU}>
        d’abord en x, le long de la bande
      </Etiquette>
      <Etiquette x={x0 + (iMaille + 0.5) * dx} y={y0 + H + 18} ancre="middle" taille={11.5} gras couleur={BRIQUE}>
        dA = dx dy
      </Etiquette>
      {Array.from({ length: anneaux }, (_, i) => (
        <circle key={`a${i}`} cx={cx} cy={cy} r={(R * (i + 1)) / anneaux} fill="none" className="t-fin" />
      ))}
      {Array.from({ length: secteurs }, (_, j) => {
        const t = (2 * Math.PI * j) / secteurs;
        return <line key={`s${j}`} x1={cx} y1={cy} x2={cx + R * Math.cos(t)} y2={cy - R * Math.sin(t)} className="t-fin" />;
      })}
      <path d={`M ${P(r1, t1)} A ${r1} ${r1} 0 0 0 ${P(r1, t2)} L ${P(r2, t2)} A ${r2} ${r2} 0 0 1 ${P(r2, t1)} Z`} fill={BRIQUE} fillOpacity={0.5} stroke={BRIQUE} strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={R} fill="none" className="t-fort" />
      <Etiquette x={cx} y={cy + R + 20} ancre="middle" taille={11.5} gras couleur={BRIQUE}>
        dA = r dr dθ
      </Etiquette>
      <Etiquette x={cx} y={y0 - 12} ancre="middle" taille={11}>
        coordonnées polaires (r ; θ)
      </Etiquette>
    </Figure>
  );
}

/** Plate-forme vue en plan : zones de déblai et de remblai, ligne où le terrain est au niveau de la plate-forme. */
export function CubatureSchema({ d, r }: { d: DonneesCubature; r: ResultatCubature }) {
  const k = Math.min(400 / d.L, 220 / d.l);
  const X = (x: number) => 40 + x * k;
  const Y = (y: number) => 30 + (d.l - y) * k;
  const n = 24;
  const em = Math.max(...[d.z00, d.z10, d.z01, d.z11].map((z) => Math.abs(z - d.zp)), 1e-9);
  return (
    <Figure alt={`Plate-forme de ${n2(d.L)} × ${n2(d.l)} m au niveau ${n2(d.zp)} m : déblai ${n2(r.Vdeblai)} m³, remblai ${n2(r.Vremblai)} m³`} largeur={620} hauteur={300}>
      {Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => {
          const x = ((i + 0.5) * d.L) / n;
          const y = ((j + 0.5) * d.l) / n;
          const e = r.f(x, y) - d.zp;
          return <rect key={`${i}-${j}`} x={X((i * d.L) / n)} y={Y(((j + 1) * d.l) / n)} width={(d.L / n) * k} height={(d.l / n) * k} fill={e > 0 ? BRIQUE : VERT} fillOpacity={0.12 + (0.5 * Math.abs(e)) / em} stroke="none" />;
        }),
      )}
      <rect x={X(0)} y={Y(d.l)} width={d.L * k} height={d.l * k} fill="none" className="t-fort" />
      {(
        [
          [0, 0, d.z00],
          [d.L, 0, d.z10],
          [0, d.l, d.z01],
          [d.L, d.l, d.z11],
        ] as Array<[number, number, number]>
      ).map(([x, y, z]) => (
        <Etiquette key={`${x}-${y}`} x={X(x) + (x === 0 ? -6 : 6)} y={Y(y) + (y === 0 ? 16 : -6)} ancre={x === 0 ? 'end' : 'start'} taille={11} gras>
          {n2(z)}
        </Etiquette>
      ))}
      <rect x={470} y={60} width={16} height={12} fill={BRIQUE} fillOpacity={0.5} />
      <Etiquette x={492} y={70} taille={11.5}>
        déblai : {n2(r.Vdeblai)} m³
      </Etiquette>
      <rect x={470} y={84} width={16} height={12} fill={VERT} fillOpacity={0.5} />
      <Etiquette x={492} y={94} taille={11.5}>
        remblai : {n2(r.Vremblai)} m³
      </Etiquette>
      <Etiquette x={470} y={124} taille={11.5} gras>
        net : {n2(r.Vnet)} m³
      </Etiquette>
      <Etiquette x={470} y={150} taille={10.5} classe="etiquette">
        plate-forme à {n2(d.zp)} m
      </Etiquette>
      <Etiquette x={470} y={166} taille={10.5} classe="etiquette">
        couleur plus foncée :
      </Etiquette>
      <Etiquette x={470} y={182} taille={10.5} classe="etiquette">
        plus d’épaisseur
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.2.P : section en T ----------

/** Section en T : âme et table, axe passant par G, distances au centre de gravité, fibres extrêmes. */
export function SectionTInertieSchema({ d, r, prefixe = 'sti' }: { d: DonneesSectionT; r: ResultatTInertie; prefixe?: string }) {
  const k = Math.min(300 / d.b, 230 / d.h);
  const cx = 200;
  const yb = 30 + d.h * k;
  const X = (x: number) => cx + x * k;
  const Y = (y: number) => yb - y * k;
  const ha = d.h - d.hf;
  return (
    <Figure alt={`Section en T : aire ${n2(r.A)} cm², centre de gravité à ${n2(r.yG)} cm de la fibre inférieure, inertie ${nombre(r.IG, 0)} cm⁴`} largeur={620} hauteur={yb + 30}>
      <Hachures prefixe={prefixe} types={['ba']} />
      <rect x={X(-d.bw / 2)} y={Y(ha)} width={d.bw * k} height={ha * k} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <rect x={X(-d.b / 2)} y={Y(d.h)} width={d.b * k} height={d.hf * k} fill={hachure(prefixe, 'ba')} className="t-fort" />
      <line x1={X(-d.b / 2) - 20} y1={Y(r.yG)} x2={X(d.b / 2) + 20} y2={Y(r.yG)} stroke={ROUGE} strokeWidth={1.6} strokeDasharray="10 4 2 4" />
      <circle cx={X(0)} cy={Y(r.yG)} r={4} fill={ROUGE} />
      <Etiquette x={X(d.b / 2) + 24} y={Y(r.yG) + 4} taille={12} gras couleur={ROUGE}>
        G
      </Etiquette>
      {r.parties.map((p, i) => (
        <g key={p.nom}>
          <circle cx={X(0)} cy={Y(p.y)} r={3.4} fill={BLEU} />
          <line x1={X(0) + 6} y1={Y(p.y)} x2={X(0) + 6} y2={Y(r.yG)} stroke={BLEU} strokeWidth={1.6} />
          <Etiquette x={X(0) + 11} y={(Y(p.y) + Y(r.yG)) / 2 + 5} taille={13} gras couleur={BLEU}>
            d{i === 0 ? '₁' : '₂'}
          </Etiquette>
        </g>
      ))}
      <Cote x1={X(-d.b / 2) - 34} y1={Y(0)} x2={X(-d.b / 2) - 34} y2={Y(r.yG)} decalage={0} texte={`v′ = ${n2(r.vInf)}`} />
      <Cote x1={X(-d.b / 2) - 34} y1={Y(r.yG)} x2={X(-d.b / 2) - 34} y2={Y(d.h)} decalage={0} texte={`v = ${n2(r.vSup)}`} />
      <Etiquette x={420} y={60} taille={13.5} gras>
        I = Σ (I propre + A d²)
      </Etiquette>
      {r.parties.map((p, i) => (
        <Etiquette key={`l${p.nom}`} x={420} y={88 + 24 * i} taille={13} couleur={BLEU}>
          {p.nom} : d{i === 0 ? '₁' : '₂'} = {n2(Math.abs(p.d))} cm
        </Etiquette>
      ))}
      <Etiquette x={420} y={88 + 24 * r.parties.length + 6} taille={13} gras>
        I<tspan dy={4} fontSize={10}>G</tspan>
        <tspan dy={-4}> = {nombre(r.IG, 0)} cm⁴</tspan>
      </Etiquette>
      <Etiquette x={420} y={88 + 24 * r.parties.length + 32} taille={12} classe="etiquette">
        cotes en cm
      </Etiquette>
    </Figure>
  );
}
