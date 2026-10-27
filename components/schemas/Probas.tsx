// Schémas du module L2.2 (probabilités et statistiques). Les courbes et les barres viennent de lib/calc/probas.ts.

import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Aire, Axes, Courbe, Droite, repere2D } from '@/components/drawing/Graphe';
import { descriptive, fractileNormal, histogramme, normale, phi, regression, risqueDepassement, type DonneesFiabilite } from '@/lib/calc/probas';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const GRIS = 'var(--color-beton)';
const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);

const pas = (de: number, a: number, p: number) => Array.from({ length: Math.floor((a - de) / p + 1e-9) + 1 }, (_, i) => de + i * p);

/** Histogramme d'une série, avec la moyenne, ± un écart-type et, au besoin, une limite (fck). */
export function Histogramme({ xs, debut, largeur, nb, unite = 'MPa', limite, titre = 'résistance' }: { xs: readonly number[]; debut: number; largeur: number; nb: number; unite?: string; limite?: number; titre?: string }) {
  const h = histogramme(xs, debut, largeur, nb);
  const d = descriptive(xs);
  const emax = Math.max(...h.map((c) => c.effectif));
  const R = repere2D({ x0: 60, y0: 20, l: 500, h: 160, xmin: debut, xmax: debut + nb * largeur, ymin: 0, ymax: emax + 1 });
  return (
    <Figure alt={`Histogramme de ${d.n} valeurs en classes de ${n1(largeur)} ${unite}, de ${n1(debut)} à ${n1(debut + nb * largeur)} ${unite} ; effectifs ${h.map((c) => c.effectif).join(', ')}. Moyenne ${n2(d.moyenne)} ${unite}, écart-type ${n2(d.ecartType)} ${unite}.${limite !== undefined ? ` Limite ${n1(limite)} ${unite} en rouge.` : ''}`} largeur={620} hauteur={225}>
      <Axes R={R} gradX={pas(debut, debut + nb * largeur, largeur)} gradY={pas(1, emax + 1, 1)} titreX={`${titre} (${unite})`} titreY="effectif" decX={0} />
      {h.map((c, i) => (
        <rect key={i} x={R.X(c.de) + 1} y={R.Y(c.effectif)} width={R.X(c.a) - R.X(c.de) - 2} height={R.Y(0) - R.Y(c.effectif)} fill={BLEU} opacity={0.25} stroke={BLEU} />
      ))}
      <line x1={R.X(d.moyenne)} x2={R.X(d.moyenne)} y1={R.Y(0)} y2={R.Y(emax + 1)} stroke={VERT} strokeWidth={2} />
      <Etiquette x={R.X(d.moyenne) + 4} y={R.Y(emax + 1) + 10} taille={11} gras couleur={VERT}>
        {`moyenne ${n2(d.moyenne)}`}
      </Etiquette>
      {[-1, 1].map((k) => (
        <line key={k} x1={R.X(d.moyenne + k * d.ecartType)} x2={R.X(d.moyenne + k * d.ecartType)} y1={R.Y(0)} y2={R.Y(emax + 0.5)} stroke={VERT} strokeDasharray="5 4" />
      ))}
      <Etiquette x={R.X(d.moyenne + d.ecartType) + 4} y={R.Y(emax + 0.5) + 22} taille={10.5} couleur={VERT}>
        {`+ s (${n2(d.ecartType)})`}
      </Etiquette>
      {limite !== undefined ? (
        <g>
          <line x1={R.X(limite)} x2={R.X(limite)} y1={R.Y(0)} y2={R.Y(emax + 1)} stroke={ROUGE} strokeWidth={2} />
          <Etiquette x={R.X(limite) - 4} y={R.Y(emax + 1) + 10} ancre="end" taille={11} gras couleur={ROUGE}>
            {`${n1(limite)} ${unite}`}
          </Etiquette>
        </g>
      ) : null}
    </Figure>
  );
}

/** Boîte à moustaches : minimum, quartiles, médiane, maximum. */
export function BoiteMoustaches({ xs, unite = 'MPa' }: { xs: readonly number[]; unite?: string }) {
  const d = descriptive(xs);
  const q = (p: number) => {
    const i = p * (d.n - 1);
    const b = Math.floor(i);
    return d.tries[b]! + (i - b) * ((d.tries[Math.min(b + 1, d.n - 1)] ?? d.tries[b]!) - d.tries[b]!);
  };
  const [q1, q3] = [q(0.25), q(0.75)];
  const R = repere2D({ x0: 60, y0: 30, l: 500, h: 60, xmin: Math.floor(d.min) - 1, xmax: Math.ceil(d.max) + 1, ymin: 0, ymax: 1 });
  const y = R.Y(0.5);
  return (
    <Figure alt={`Boîte à moustaches : minimum ${n1(d.min)}, premier quartile ${n1(q1)}, médiane ${n1(d.mediane)}, troisième quartile ${n1(q3)}, maximum ${n1(d.max)} ${unite}. La boîte contient la moitié centrale des valeurs.`} largeur={620} hauteur={130}>
      <line x1={R.X(d.min)} x2={R.X(d.max)} y1={y} y2={y} stroke={BLEU} strokeWidth={1.5} />
      {[d.min, d.max].map((v, i) => (
        <line key={i} x1={R.X(v)} x2={R.X(v)} y1={y - 12} y2={y + 12} stroke={BLEU} strokeWidth={2} />
      ))}
      <rect x={R.X(q1)} y={y - 22} width={R.X(q3) - R.X(q1)} height={44} fill="var(--color-papier)" stroke={BLEU} strokeWidth={2} />
      <line x1={R.X(d.mediane)} x2={R.X(d.mediane)} y1={y - 22} y2={y + 22} stroke={ROUGE} strokeWidth={2.5} />
      {[
        [d.min, 'min'],
        [q1, 'Q1'],
        [d.mediane, 'médiane'],
        [q3, 'Q3'],
        [d.max, 'max'],
      ].map(([v, t], i) => (
        <Etiquette key={i} x={R.X(v as number)} y={i % 2 === 0 ? y + 40 : y - 30} ancre="middle" taille={10.5} couleur={t === 'médiane' ? ROUGE : undefined}>
          {`${t} ${n1(v as number)}`}
        </Etiquette>
      ))}
    </Figure>
  );
}

/** Deux événements A et B : union, intersection. */
export function Venn({ pA, pB, pAB, A = 'A', B = 'B' }: { pA: number; pB: number; pAB: number; A?: string; B?: string }) {
  return (
    <Figure alt={`Diagramme de Venn : ${A} (probabilité ${n2(pA)}) et ${B} (${n2(pB)}) se recouvrent ; leur intersection vaut ${n2(pAB)}. P(${A} ou ${B}) = P(${A}) + P(${B}) − P(${A} et ${B}) = ${n2(pA + pB - pAB)}.`} largeur={620} hauteur={200}>
      <rect x={60} y={10} width={500} height={180} rx={8} fill="none" stroke={GRIS} />
      <circle cx={250} cy={100} r={70} fill={BLEU} opacity={0.18} stroke={BLEU} strokeWidth={1.6} />
      <circle cx={360} cy={100} r={70} fill={TERRE} opacity={0.18} stroke={TERRE} strokeWidth={1.6} />
      <Etiquette x={210} y={104} ancre="middle" taille={13} gras couleur={BLEU}>
        {A}
      </Etiquette>
      <Etiquette x={400} y={104} ancre="middle" taille={13} gras couleur={TERRE}>
        {B}
      </Etiquette>
      <Etiquette x={305} y={96} ancre="middle" taille={10.5} gras>
        {`${A} et ${B}`}
      </Etiquette>
      <Etiquette x={305} y={112} ancre="middle" taille={10.5}>
        {n2(pAB)}
      </Etiquette>
      <Etiquette x={70} y={28} taille={11}>
        univers Ω
      </Etiquette>
      <Etiquette x={550} y={182} ancre="end" taille={11}>
        {`P(${A} ou ${B}) = ${n2(pA)} + ${n2(pB)} − ${n2(pAB)} = ${n2(pA + pB - pAB)}`}
      </Etiquette>
    </Figure>
  );
}

/** Arbre de probabilités d'un test imparfait (défaut / pas de défaut, positif / négatif). */
export function ArbreProbas({ p, se, sp, D = 'défaut', T = 'test +' }: { p: number; se: number; sp: number; D?: string; T?: string }) {
  const f = [
    { y: 40, t: `${T}`, pr: se, tot: p * se, c: ROUGE },
    { y: 90, t: `${T.replace('+', '−')}`, pr: 1 - se, tot: p * (1 - se), c: GRIS },
    { y: 150, t: `${T}`, pr: 1 - sp, tot: (1 - p) * (1 - sp), c: ROUGE },
    { y: 200, t: `${T.replace('+', '−')}`, pr: sp, tot: (1 - p) * sp, c: GRIS },
  ];
  return (
    <Figure alt={`Arbre de probabilités : ${D} avec la probabilité ${n2(p)}, sinon ${n2(1 - p)}. Sachant le ${D}, le test est positif avec la probabilité ${n2(se)} ; sans ${D}, il est faussement positif avec ${n2(1 - sp)}. Chaque chemin se multiplie ; P(${T}) = ${nombre(p * se + (1 - p) * (1 - sp), 3)}.`} largeur={620} hauteur={230}>
      <circle cx={50} cy={120} r={5} fill={BLEU} />
      {[
        [65, `${D}`, p],
        [175, `pas de ${D}`, 1 - p],
      ].map(([y, t, pr], i) => (
        <g key={i}>
          <line x1={50} y1={120} x2={200} y2={y as number} stroke={BLEU} strokeWidth={1.6} />
          <Etiquette x={110} y={(120 + (y as number)) / 2 - 6} ancre="middle" taille={11} couleur={BLEU}>
            {n2(pr as number)}
          </Etiquette>
          <Etiquette x={206} y={(y as number) + 4} taille={12} gras>
            {t as string}
          </Etiquette>
        </g>
      ))}
      {f.map((b, i) => (
        <g key={i}>
          <line x1={300} y1={i < 2 ? 65 : 175} x2={420} y2={b.y} stroke={b.c} strokeWidth={1.4} />
          <Etiquette x={360} y={((i < 2 ? 65 : 175) + b.y) / 2 - 5} ancre="middle" taille={10.5} couleur={b.c}>
            {n2(b.pr)}
          </Etiquette>
          <Etiquette x={426} y={b.y + 4} taille={11.5} gras couleur={b.c}>
            {b.t}
          </Etiquette>
          <Etiquette x={600} y={b.y + 4} ancre="end" taille={11}>
            {`→ ${nombre(b.tot, 4)}`}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Diagramme en bâtons d'une loi discrète P(X = k). */
export function BarresLoi({ probas, titre, couleur = BLEU, marque }: { probas: readonly number[]; titre: string; couleur?: string; marque?: number }) {
  const pmax = Math.max(...probas);
  const ymax = Math.ceil(pmax * 10 + 0.5) / 10;
  const R = repere2D({ x0: 60, y0: 25, l: 500, h: 150, xmin: 0.3, xmax: probas.length + 0.7, ymin: 0, ymax });
  const K = (k: number) => R.X(k + 1);
  return (
    <Figure alt={`${titre} : ${probas.map((p, k) => `P(${k}) = ${nombre(p, 3)}`).join(' ; ')}.`} largeur={620} hauteur={220}>
      <Axes R={R} gradY={pas(0.1, ymax, ymax > 0.5 ? 0.2 : 0.1)} titreX="k" titreY="P(X = k)" decX={0} decY={1} />
      {probas.map((p, k) => (
        <g key={k}>
          <Etiquette x={K(k)} y={R.Y(0) + 16} ancre="middle" taille={10.5}>
            {String(k)}
          </Etiquette>
          <rect x={K(k) - 9} y={R.Y(p)} width={18} height={R.Y(0) - R.Y(p)} fill={marque !== undefined && k <= marque ? ROUGE : couleur} opacity={0.75} />
          {p > 0.02 ? (
            <Etiquette x={K(k)} y={R.Y(p) - 4} ancre="middle" taille={9.5}>
              {nombre(p, 3)}
            </Etiquette>
          ) : null}
        </g>
      ))}
      <Etiquette x={560} y={18} ancre="end" taille={11.5} gras couleur={couleur}>
        {titre}
      </Etiquette>
    </Figure>
  );
}

/** Courbe en cloche N(μ, σ), avec la surface sous un fractile ou entre deux bornes. */
export function Cloche({ mu = 0, sigma = 1, sous, entre, unite = '', titreX = 'z' }: { mu?: number; sigma?: number; sous?: number; entre?: [number, number]; unite?: string; titreX?: string }) {
  const N = normale(mu, sigma);
  const R = repere2D({ x0: 50, y0: 20, l: 520, h: 150, xmin: mu - 4 * sigma, xmax: mu + 4 * sigma, ymin: 0, ymax: N.densite(mu) * 1.15 });
  const u = unite ? ` ${unite}` : '';
  const texte =
    sous !== undefined
      ? ` La surface sous ${n2(sous)}${u} vaut ${nombre(N.P(sous) * 100, 1)} %.`
      : entre
        ? ` La surface entre ${n2(entre[0])} et ${n2(entre[1])}${u} vaut ${nombre((N.P(entre[1]) - N.P(entre[0])) * 100, 1)} %.`
        : '';
  return (
    <Figure alt={`Courbe en cloche de la loi normale de moyenne ${n2(mu)}${u} et d'écart-type ${n2(sigma)}${u} : symétrique autour de la moyenne, 68 % des valeurs à ± 1 écart-type, 95 % à ± 2.${texte}`} largeur={620} hauteur={215}>
      <Axes R={R} gradX={[-3, -2, -1, 0, 1, 2, 3].map((k) => mu + k * sigma)} gradY={[]} titreX={titreX} decX={sigma < 1 ? 2 : sigma < 10 ? 1 : 0} />
      {sous !== undefined ? <Aire R={R} f={N.densite} de={R.xmin} a={sous} couleur={ROUGE} opacite={0.3} /> : null}
      {entre ? <Aire R={R} f={N.densite} de={entre[0]} a={entre[1]} couleur={VERT} opacite={0.25} /> : null}
      <Courbe R={R} f={N.densite} de={R.xmin} a={R.xmax} couleur={BLEU} epaisseur={2.2} n={200} />
      {sous !== undefined ? (
        <g>
          <line x1={R.X(sous)} x2={R.X(sous)} y1={R.Y(0)} y2={R.Y(N.densite(mu))} stroke={ROUGE} strokeWidth={1.6} />
          <Etiquette x={R.X(sous) - 6} y={R.Y(N.densite(mu)) + 8} ancre="end" taille={11.5} gras couleur={ROUGE}>
            {`${nombre(N.P(sous) * 100, 1)} % sous ${n2(sous)}${u}`}
          </Etiquette>
        </g>
      ) : null}
      {entre ? (
        <Etiquette x={R.X(mu)} y={R.Y(N.densite(mu) * 0.45)} ancre="middle" taille={12} gras couleur={VERT}>
          {`${nombre((N.P(entre[1]) - N.P(entre[0])) * 100, 1)} %`}
        </Etiquette>
      ) : null}
    </Figure>
  );
}

/** Les résistances d'un béton : moyenne fcm et résistance caractéristique fck, fractile 5 %. */
export function FractileBeton({ fcm, s, fck }: { fcm: number; s: number; fck?: number }) {
  const N = normale(fcm, s);
  const f5 = N.fractile(0.05);
  const R = repere2D({ x0: 50, y0: 25, l: 520, h: 150, xmin: fcm - 4 * s, xmax: fcm + 4 * s, ymin: 0, ymax: N.densite(fcm) * 1.2 });
  return (
    <Figure alt={`Répartition des résistances d'un béton : moyenne ${n1(fcm)} MPa, écart-type ${n1(s)} MPa. Le fractile 5 %, ${n1(f5)} MPa, est la valeur sous laquelle tombent 5 % des éprouvettes : c'est la résistance caractéristique, à 1,645 écart-type sous la moyenne.${fck !== undefined ? ` Valeur exigée fck = ${n1(fck)} MPa : ${nombre(N.P(fck) * 100, 1)} % des résultats sont dessous.` : ''}`} largeur={620} hauteur={230}>
      <Axes R={R} gradX={pas(Math.ceil(fcm - 4 * s), fcm + 4 * s, s > 3 ? 5 : 2)} gradY={[]} titreX="fc (MPa)" decX={0} />
      <Aire R={R} f={N.densite} de={R.xmin} a={f5} couleur={ROUGE} opacite={0.35} />
      <Courbe R={R} f={N.densite} de={R.xmin} a={R.xmax} couleur={BLEU} epaisseur={2.2} n={200} />
      <line x1={R.X(fcm)} x2={R.X(fcm)} y1={R.Y(0)} y2={R.Y(N.densite(fcm))} stroke={VERT} strokeWidth={2} />
      <Etiquette x={R.X(fcm) + 5} y={R.Y(N.densite(fcm)) - 4} taille={11.5} gras couleur={VERT}>
        {`fcm = ${n1(fcm)}`}
      </Etiquette>
      <line x1={R.X(f5)} x2={R.X(f5)} y1={R.Y(0)} y2={R.Y(N.densite(fcm) * 0.7)} stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={R.X(f5) - 5} y={R.Y(N.densite(fcm) * 0.7) - 4} ancre="end" taille={11.5} gras couleur={ROUGE}>
        {`fractile 5 % = ${n1(f5)}`}
      </Etiquette>
      <path d={`M${R.X(f5)} ${R.Y(N.densite(fcm) * 0.35)} H${R.X(fcm)}`} stroke={GRIS} markerEnd="" strokeDasharray="4 3" />
      <Etiquette x={(R.X(f5) + R.X(fcm)) / 2} y={R.Y(N.densite(fcm) * 0.35) - 5} ancre="middle" taille={10.5}>
        1,645 s
      </Etiquette>
      {fck !== undefined ? (
        <g>
          <line x1={R.X(fck)} x2={R.X(fck)} y1={R.Y(0)} y2={R.Y(N.densite(fcm) * 1.1)} stroke={TERRE} strokeWidth={1.6} strokeDasharray="6 3" />
          <Etiquette x={R.X(fck) - 5} y={R.Y(N.densite(fcm) * 1.1) + 10} ancre="end" taille={11} gras couleur={TERRE}>
            {`fck = ${n1(fck)}`}
          </Etiquette>
        </g>
      ) : null}
    </Figure>
  );
}

/** Vingt échantillons, vingt intervalles de confiance : la plupart contiennent la vraie moyenne. */
export function IntervallesEchantillons({ mu = 30, sigma = 2, n = 6 }: { mu?: number; sigma?: number; n?: number }) {
  let graine = 12345;
  const alea = () => ((graine = (graine * 16807) % 2147483647) - 1) / 2147483646;
  const gauss = () => Math.sqrt(-2 * Math.log(alea() + 1e-12)) * Math.cos(2 * Math.PI * alea());
  const demi = (2.571 * sigma) / Math.sqrt(n);
  const ics = Array.from({ length: 20 }, () => {
    const m = mu + (gauss() * sigma) / Math.sqrt(n);
    return { m, bas: m - demi, haut: m + demi };
  });
  const rates = ics.filter((c) => c.bas > mu || c.haut < mu).length;
  const R = repere2D({ x0: 60, y0: 15, l: 500, h: 200, xmin: mu - 4 * demi, xmax: mu + 4 * demi, ymin: 0, ymax: 21 });
  return (
    <Figure alt={`Vingt échantillons de ${n} éprouvettes d'un même béton ; pour chacun, l'intervalle de confiance à 95 % de la moyenne. ${20 - rates} intervalles sur 20 contiennent la vraie moyenne ${n1(mu)} MPa (en vert), ${rates} la manquent (en rouge) : c'est le sens de « 95 % ».`} largeur={620} hauteur={245}>
      <Axes R={R} gradX={pas(Math.ceil(mu - 3 * demi), mu + 3 * demi, demi > 2 ? 2 : 1)} gradY={[]} titreX="moyenne estimée (MPa)" decX={0} />
      <line x1={R.X(mu)} x2={R.X(mu)} y1={R.Y(0)} y2={R.Y(21)} stroke={BLEU} strokeWidth={1.6} strokeDasharray="6 3" />
      {ics.map((c, i) => {
        const ok = c.bas <= mu && c.haut >= mu;
        const col = ok ? VERT : ROUGE;
        return (
          <g key={i}>
            <line x1={R.X(c.bas)} x2={R.X(c.haut)} y1={R.Y(i + 1)} y2={R.Y(i + 1)} stroke={col} strokeWidth={2} />
            <circle cx={R.X(c.m)} cy={R.Y(i + 1)} r={3} fill={col} />
          </g>
        );
      })}
      <Etiquette x={R.X(mu) + 5} y={R.Y(21) + 10} taille={11} gras couleur={BLEU}>
        {`vraie moyenne ${n1(mu)}`}
      </Etiquette>
    </Figure>
  );
}

/** Nuage de points et droite des moindres carrés, avec les résidus. */
export function NuageRegression({ xs, ys, titreX, titreY, residus = true }: { xs: readonly number[]; ys: readonly number[]; titreX: string; titreY: string; residus?: boolean }) {
  const r = regression(xs, ys);
  const [x1, x2] = [Math.min(...xs), Math.max(...xs)];
  const [y1, y2] = [Math.min(...ys), Math.max(...ys)];
  const dx = (x2 - x1) * 0.1;
  const dy = (y2 - y1) * 0.15;
  const R = repere2D({ x0: 60, y0: 20, l: 500, h: 170, xmin: x1 - dx, xmax: x2 + dx, ymin: Math.max(0, y1 - dy), ymax: y2 + dy });
  const gx = pas(Math.ceil(x1 - dx), x2 + dx, Math.max(1, Math.round((x2 - x1) / 6)));
  const gy = pas(Math.ceil(Math.max(0, y1 - dy)), y2 + dy, Math.max(1, Math.round((y2 - y1) / 5)));
  return (
    <Figure alt={`Nuage de ${r.n} points (${titreX}, ${titreY}) et droite des moindres carrés y = ${nombre(r.a, 3)} x ${r.b >= 0 ? '+' : '−'} ${nombre(Math.abs(r.b), 2)}. Coefficient de corrélation r = ${nombre(r.r, 3)} : les points sont ${Math.abs(r.r) > 0.95 ? 'très proches' : Math.abs(r.r) > 0.8 ? 'assez proches' : 'loin'} de la droite.${residus ? ' Les traits verticaux sont les résidus, que la droite rend les plus petits possible au carré.' : ''}`} largeur={620} hauteur={235}>
      <Axes R={R} gradX={gx} gradY={gy} titreX={titreX} titreY={titreY} decX={0} decY={0} grille />
      <Droite R={R} x1={0} y1={r.b} m={r.a} de={x1 - dx} a={x2 + dx} couleur={ROUGE} epaisseur={2} />
      {xs.map((x, i) => (
        <g key={i}>
          {residus ? <line x1={R.X(x)} x2={R.X(x)} y1={R.Y(ys[i]!)} y2={R.Y(r.predire(x))} stroke={TERRE} strokeWidth={1.4} /> : null}
          <circle cx={R.X(x)} cy={R.Y(ys[i]!)} r={4} fill={BLEU} />
        </g>
      ))}
      <Etiquette x={R.X(x1 - dx) + 10} y={R.Y(y2 + dy) + 16} taille={12} gras couleur={ROUGE}>
        {`y = ${nombre(r.a, 3)} x ${r.b >= 0 ? '+' : '−'} ${nombre(Math.abs(r.b), 2)}   r = ${nombre(r.r, 3)}`}
      </Etiquette>
    </Figure>
  );
}

/** Trois nuages : corrélation forte positive, nulle, négative. */
export function TroisCorrelations() {
  let graine = 777;
  const alea = () => ((graine = (graine * 16807) % 2147483647) - 1) / 2147483646 - 0.5;
  const nuage = (pente: number, bruit: number) => Array.from({ length: 14 }, (_, i) => [i / 13, 0.5 + pente * (i / 13 - 0.5) + bruit * alea()] as const);
  const jeux = [
    { t: 'forte, positive', pts: nuage(0.8, 0.12), c: VERT },
    { t: 'nulle', pts: nuage(0, 0.8), c: GRIS },
    { t: 'forte, négative', pts: nuage(-0.8, 0.12), c: ROUGE },
  ];
  return (
    <Figure alt={`Trois nuages de points : ${jeux.map((j) => `corrélation ${j.t}, r = ${nombre(regression(j.pts.map((p) => p[0]), j.pts.map((p) => p[1])).r, 2)}`).join(' ; ')}. r mesure l'alignement des points, pas la pente.`} largeur={620} hauteur={190}>
      {jeux.map((j, k) => {
        const x0 = 20 + k * 200;
        const r = regression(j.pts.map((p) => p[0]), j.pts.map((p) => p[1])).r;
        return (
          <g key={k}>
            <rect x={x0} y={15} width={180} height={130} fill="none" stroke={GRIS} />
            {j.pts.map(([x, y], i) => (
              <circle key={i} cx={x0 + 10 + x * 160} cy={140 - Math.min(1, Math.max(0, y)) * 120} r={3.5} fill={j.c} />
            ))}
            <Etiquette x={x0 + 90} y={165} ancre="middle" taille={11.5} gras couleur={j.c}>
              {j.t}
            </Etiquette>
            <Etiquette x={x0 + 90} y={182} ancre="middle" taille={11}>
              {`r = ${nombre(r, 2)}`}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Risque qu'un événement de période de retour T survienne au moins une fois pendant la durée de vie de l'ouvrage. */
export function RisqueRetour({ T = [10, 50, 100], nmax = 100 }: { T?: readonly number[]; nmax?: number }) {
  const R = repere2D({ x0: 60, y0: 20, l: 480, h: 160, xmin: 0, xmax: nmax, ymin: 0, ymax: 100 });
  const cols = [ROUGE, TERRE, BLEU, VERT];
  return (
    <Figure alt={`Probabilité qu'un événement de période de retour T arrive au moins une fois en n années, 1 − (1 − 1/T)ⁿ : ${T.map((t) => `T = ${t} ans, ${nombre(risqueDepassement(t, 50) * 100, 0)} % en 50 ans`).join(' ; ')}. Une crue « centennale » a donc plus d'une chance sur trois d'arriver pendant la vie d'un pont.`} largeur={620} hauteur={225}>
      <Axes R={R} gradX={pas(20, nmax, 20)} gradY={[25, 50, 75, 100]} titreX="durée n (années)" titreY="risque (%)" decX={0} grille />
      {T.map((t, i) => (
        <g key={t}>
          <Courbe R={R} f={(n) => risqueDepassement(t, n) * 100} de={0} a={nmax} couleur={cols[i % 4]} epaisseur={2} />
          <Etiquette x={R.X(nmax) + 4} y={R.Y(risqueDepassement(t, nmax) * 100) + 4} taille={11} gras couleur={cols[i % 4]}>
            {`T = ${t}`}
          </Etiquette>
        </g>
      ))}
      <line x1={R.X(50)} x2={R.X(50)} y1={R.Y(0)} y2={R.Y(100)} stroke={GRIS} strokeDasharray="5 4" />
    </Figure>
  );
}

/** Ajustement de Gumbel : valeur en fonction de la période de retour (échelle logarithmique en T). */
export function DroiteGumbel({ xs, u, alpha, unite = 'mm', T }: { xs: readonly number[]; u: number; alpha: number; unite?: string; T?: number }) {
  const tries = [...xs].sort((a, b) => a - b);
  const n = tries.length;
  const yv = (t: number) => 2 - Math.log(-Math.log(1 - 1 / t));
  const val = (t: number) => u + alpha * (yv(t) - 2);
  const Ts = [2, 5, 10, 20, 50, 100];
  const R = repere2D({ x0: 60, y0: 20, l: 480, h: 165, xmin: yv(1.05), xmax: yv(120), ymin: Math.floor(tries[0]! / 10) * 10 - 10, ymax: Math.ceil(val(120) / 10) * 10 });
  return (
    <Figure alt={`Ajustement de Gumbel des ${n} maximums annuels : les points expérimentaux (période empirique (n + 1)/rang) s'alignent sur la droite x = u + α y, avec u = ${n1(u)} ${unite} et α = ${n1(alpha)} ${unite}. ${Ts.map((t) => `T = ${t} ans : ${nombre(val(t), 0)} ${unite}`).join(' ; ')}.`} largeur={620} hauteur={235}>
      <Axes R={R} gradX={[]} gradY={pas(R.ymin + 20, R.ymax, 20)} titreY={`valeur (${unite})`} decY={0} grille />
      {Ts.map((t) => (
        <g key={t}>
          <line x1={R.X(yv(t))} x2={R.X(yv(t))} y1={R.Y(R.ymin)} y2={R.Y(R.ymax)} stroke={GRIS} strokeDasharray="2 4" />
          <Etiquette x={R.X(yv(t))} y={R.Y(R.ymin) + 16} ancre="middle" taille={10.5}>
            {String(t)}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={540} y={R.Y(R.ymin) + 30} ancre="end" taille={11}>
        période de retour T (ans)
      </Etiquette>
      <Courbe R={R} f={(y) => u + alpha * (y - 2)} de={R.xmin} a={R.xmax} couleur={ROUGE} epaisseur={2} />
      {tries.map((x, i) => {
        const Temp = (n + 1) / (n - i);
        return <circle key={i} cx={R.X(yv(Temp))} cy={R.Y(x)} r={3.5} fill={BLEU} />;
      })}
      {T !== undefined ? (
        <g>
          <circle cx={R.X(yv(T))} cy={R.Y(val(T))} r={5.5} fill="none" stroke={ROUGE} strokeWidth={2} />
          <Etiquette x={R.X(yv(T)) - 8} y={R.Y(val(T)) - 8} ancre="end" taille={11.5} gras couleur={ROUGE}>
            {`T = ${T} ans : ${nombre(val(T), 0)} ${unite}`}
          </Etiquette>
        </g>
      ) : null}
    </Figure>
  );
}

/** Résistance R et sollicitation S aléatoires : la ruine, c'est S > R, dans la zone de chevauchement. */
export function ChevauchementRS({ d, Rd, Sd }: { d: DonneesFiabilite; Rd?: number; Sd?: number }) {
  const NR = normale(d.muR, d.sR);
  const NS = normale(d.muS, d.sS);
  const xmin = d.muS - 4 * d.sS;
  const xmax = d.muR + 4 * d.sR;
  const ymax = Math.max(NR.densite(d.muR), NS.densite(d.muS)) * 1.2;
  const R = repere2D({ x0: 50, y0: 20, l: 520, h: 160, xmin, xmax, ymin: 0, ymax });
  const beta = (d.muR - d.muS) / Math.sqrt(d.sR ** 2 + d.sS ** 2);
  return (
    <Figure alt={`Deux courbes en cloche : la sollicitation S (moyenne ${n1(d.muS)}, écart-type ${n1(d.sS)}) et la résistance R (moyenne ${n1(d.muR)}, écart-type ${n1(d.sR)}). La ruine se produit si S dépasse R : c'est possible là où les deux courbes se recouvrent. Indice de fiabilité β = ${n2(beta)}, probabilité de ruine ${nombre(phi(-beta), 6)}.${Rd !== undefined && Sd !== undefined ? ` Valeurs de calcul Sd = ${n1(Sd)} et Rd = ${n1(Rd)} : on majore S et on minore R.` : ''}`} largeur={620} hauteur={230}>
      <Axes R={R} gradX={pas(Math.ceil(xmin / 50) * 50, xmax, 50)} gradY={[]} titreX="effet (kN·m)" decX={0} />
      <Aire R={R} f={(x) => Math.min(NR.densite(x), NS.densite(x))} de={xmin} a={xmax} couleur={ROUGE} opacite={0.45} />
      <Courbe R={R} f={NS.densite} de={xmin} a={xmax} couleur={TERRE} epaisseur={2.2} n={200} />
      <Courbe R={R} f={NR.densite} de={xmin} a={xmax} couleur={BLEU} epaisseur={2.2} n={200} />
      <Etiquette x={R.X(d.muS)} y={R.Y(NS.densite(d.muS)) - 6} ancre="middle" taille={12} gras couleur={TERRE}>
        sollicitation S
      </Etiquette>
      <Etiquette x={R.X(d.muR)} y={R.Y(NR.densite(d.muR)) - 6} ancre="middle" taille={12} gras couleur={BLEU}>
        résistance R
      </Etiquette>
      <Etiquette x={(R.X(d.muS) + R.X(d.muR)) / 2} y={R.Y(0) + 34} ancre="middle" taille={10.5} gras couleur={ROUGE}>
        zone de ruine possible
      </Etiquette>
      {Rd !== undefined && Sd !== undefined ? (
        <g>
          {[
            [Sd, `Sd = ${n1(Sd)}`, TERRE],
            [Rd, `Rd = ${n1(Rd)}`, BLEU],
          ].map(([x, t, c], i) => (
            <g key={i}>
              <line x1={R.X(x as number)} x2={R.X(x as number)} y1={R.Y(0)} y2={R.Y(ymax * (i === 0 ? 0.6 : 0.85))} stroke={c as string} strokeWidth={1.6} strokeDasharray="6 3" />
              <Etiquette x={R.X(x as number) + (i === 0 ? -4 : 4)} y={R.Y(ymax * (i === 0 ? 0.6 : 0.85)) - 4} ancre={i === 0 ? 'end' : 'start'} taille={11} gras couleur={c as string}>
                {t as string}
              </Etiquette>
            </g>
          ))}
        </g>
      ) : null}
    </Figure>
  );
}

/** Indice de fiabilité β et probabilité de ruine : chaque unité de β divise Pf par 10 à 100. */
export function BetaPf({ beta }: { beta?: number }) {
  const R = repere2D({ x0: 70, y0: 20, l: 470, h: 160, xmin: 0, xmax: 5, ymin: 0, ymax: 7 });
  return (
    <Figure alt={`Probabilité de ruine Pf = Φ(−β) en échelle logarithmique : β = 1 donne ${nombre(phi(-1), 2)}, β = 2 : ${nombre(phi(-2), 3)}, β = 3 : ${nombre(phi(-3), 4)}, β = 3,8 : ${nombre(phi(-3.8), 6)}.${beta !== undefined ? ` Ici β = ${n2(beta)} : Pf = ${nombre(phi(-beta), 6)}.` : ''}`} largeur={620} hauteur={225}>
      <Axes R={R} gradX={[1, 2, 3, 4, 5]} gradY={[]} titreX="β" decX={0} grille />
      {[-1, -2, -3, -4, -5, -6].map((e) => (
        <g key={e}>
          <line x1={R.X(0)} x2={R.X(5)} y1={R.Y(e + 7)} y2={R.Y(e + 7)} stroke={GRIS} strokeDasharray="2 4" />
          <Etiquette x={R.X(0) - 6} y={R.Y(e + 7) + 4} ancre="end" taille={10.5}>
            {`10⁻${['', '¹', '²', '³', '⁴', '⁵', '⁶'][-e]}`}
          </Etiquette>
        </g>
      ))}
      <Courbe R={R} f={(b) => Math.log10(phi(-b)) + 7} de={0} a={5} couleur={BLEU} epaisseur={2.2} n={200} />
      <line x1={R.X(3.8)} x2={R.X(3.8)} y1={R.Y(0)} y2={R.Y(7)} stroke={VERT} strokeDasharray="6 3" strokeWidth={1.6} />
      <Etiquette x={R.X(3.8) + 4} y={R.Y(6.6)} taille={11} gras couleur={VERT}>
        β cible 3,8 (EN 1990)
      </Etiquette>
      {beta !== undefined ? <circle cx={R.X(beta)} cy={R.Y(Math.log10(phi(-beta)) + 7)} r={5} fill={ROUGE} /> : null}
    </Figure>
  );
}

/** Le fractile normal : u_p pour quelques probabilités usuelles. */
export function TableFractiles() {
  const ps = [0.5, 0.8, 0.9, 0.95, 0.975, 0.99, 0.999];
  return (
    <Figure alt={`Fractiles usuels de la loi normale centrée réduite : ${ps.map((p) => `Φ(u) = ${nombre(p * 100, 1)} % pour u = ${nombre(fractileNormal(p), 3)}`).join(' ; ')}.`} largeur={620} hauteur={110}>
      {ps.map((p, i) => (
        <g key={p}>
          <rect x={20 + i * 83} y={15} width={78} height={80} rx={6} fill="var(--color-papier)" stroke={p === 0.95 ? ROUGE : BLEU} strokeWidth={p === 0.95 ? 2 : 1.2} />
          <Etiquette x={59 + i * 83} y={42} ancre="middle" taille={11}>
            {`p = ${nombre(p * 100, 1)} %`}
          </Etiquette>
          <Etiquette x={59 + i * 83} y={72} ancre="middle" taille={14} gras couleur={p === 0.95 ? ROUGE : BLEU}>
            {nombre(fractileNormal(p), 3)}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}
