// Schémas du module L2.6 (matériaux de construction). Les valeurs viennent de lib/calc/materiaux.ts.

import { useId } from 'react';
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Axes, repere2D } from '@/components/drawing/Graphe';
import { CourbeGranulo } from '@/components/drawing/Graphes';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { analyseGranulo, barreHA, CLASSES_AFFAISSEMENT, evaporation, formulation, proprietesPhysiques, TAMIS, type DonneesEchantillon, type DonneesFormulation } from '@/lib/calc/materiaux';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const GRIS = 'var(--color-beton)';
const BRIQUE = 'var(--color-brique)';
const ACIER = 'var(--color-acier)';
const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const pid = (base: string, id: string) => `${base}${id.replace(/[^a-zA-Z0-9]/g, '')}`;

/** Échantillon poreux : volumes de solide, de vides ouverts (eau absorbée) et fermés. */
export function VolumesEchantillon({ d }: { d: DonneesEchantillon }) {
  const p = proprietesPhysiques(d);
  const H = 160;
  const ouv = p.porositeOuverte;
  const fer = Math.max(0, p.porosite - ouv);
  const parts = [
    { t: 'solide', v: p.compacite, c: TERRE },
    { t: 'pores ouverts (eau absorbée)', v: ouv, c: BLEU },
    { t: 'pores fermés', v: fer, c: GRIS },
  ];
  let y = 25;
  return (
    <Figure alt={`Volume apparent d'un échantillon : ${nombre(p.compacite * 100, 0)} % de matière solide (compacité), ${nombre(ouv * 100, 0)} % de pores ouverts que l'eau remplit, ${nombre(fer * 100, 0)} % de pores fermés. Porosité totale ${nombre(p.porosite * 100, 1)} %, absorption ${nombre(p.absorption * 100, 1)} % de la masse sèche.`} largeur={620} hauteur={215}>
      {parts.map((q, i) => {
        const h = q.v * H;
        const g = (
          <g key={i}>
            <rect x={140} y={y} width={120} height={h} fill={q.c} opacity={0.45} stroke={q.c} />
            <Etiquette x={275} y={y + h / 2 + 4} taille={11.5} couleur={q.c} gras>
              {`${q.t} : ${nombre(q.v * 100, 1)} %`}
            </Etiquette>
          </g>
        );
        y += h;
        return g;
      })}
      <Cote x1={120} y1={25} x2={120} y2={25 + H} texte="volume apparent" decalage={14} />
      <Etiquette x={460} y={60} taille={11.5}>
        {`ρapp = ${nombre(p.rhoApp, 3)} g/cm³`}
      </Etiquette>
      <Etiquette x={460} y={82} taille={11.5}>
        {`porosité ${nombre(p.porosite * 100, 1)} %`}
      </Etiquette>
      <Etiquette x={460} y={104} taille={11.5}>
        {`absorption ${nombre(p.absorption * 100, 1)} %`}
      </Etiquette>
    </Figure>
  );
}

/** Courbes contrainte-déformation types : acier ductile, béton en compression, matériau fragile. */
export function CourbesMateriaux() {
  const R = repere2D({ x0: 70, y0: 20, l: 470, h: 165, xmin: 0, xmax: 20, ymin: 0, ymax: 650 });
  const acier = [[0, 0], [0.25, 500], [1.5, 500], [3, 540], [8, 600], [14, 620], [18, 570]] as const;
  return (
    <Figure alt="Courbes contrainte-déformation (déformation en pour mille, contrainte en MPa). L'acier d'armature est d'abord élastique jusqu'à environ 500 MPa, puis présente un palier, un écrouissage jusqu'à environ 600 MPa et un grand allongement avant rupture : il est ductile. Le béton en compression atteint environ 30 MPa vers 2 ‰ et s'écrase vers 3,5 ‰. Un matériau fragile (fonte, verre) casse sans prévenir à la fin de sa partie élastique." largeur={620} hauteur={225}>
      <Axes R={R} gradX={[2, 4, 8, 12, 16, 20]} gradY={[100, 300, 500]} titreX="ε (‰)" titreY="σ (MPa)" decX={0} grille />
      <polyline points={points(acier.map(([e, s]) => [R.X(e), R.Y(s)] as const))} fill="none" stroke={ACIER} strokeWidth={2.6} />
      <circle cx={R.X(18)} cy={R.Y(570)} r={5} fill={ROUGE} />
      <Etiquette x={R.X(9)} y={R.Y(610) - 8} taille={11.5} gras couleur={ACIER}>
        acier : ductile
      </Etiquette>
      <polyline points={points(Array.from({ length: 36 }, (_, i) => i / 10).map((e) => [R.X(e), R.Y(e <= 2 ? 30 * (2 * (e / 2) - (e / 2) ** 2) : 30 - (e - 2) * 4)] as const))} fill="none" stroke={GRIS} strokeWidth={3} />
      <Etiquette x={R.X(3.6)} y={R.Y(60)} taille={11} gras couleur={GRIS}>
        béton (compression)
      </Etiquette>
      <polyline points={points([[R.X(0), R.Y(0)], [R.X(1.2), R.Y(250)]])} fill="none" stroke={ROUGE} strokeWidth={2.2} />
      <Etiquette x={R.X(1.4)} y={R.Y(270)} taille={11} gras couleur={ROUGE}>
        fragile : rupture brutale
      </Etiquette>
    </Figure>
  );
}

/** Éprouvette de traction : longueur entre repères, striction et rupture. */
export function EprouvetteTraction({ d0, du, L0, Lu }: { d0: number; du: number; L0: number; Lu: number }) {
  const k = 4.5;
  const yc = 60;
  return (
    <Figure alt={`Éprouvette de traction de diamètre ${n1(d0)} mm et de longueur entre repères ${n1(L0)} mm. Après rupture, la longueur vaut ${n1(Lu)} mm (allongement ${nombre(((Lu - L0) / L0) * 100, 1)} %) et le diamètre au droit de la rupture ${n1(du)} mm : c'est la striction, signe d'un matériau ductile.`} largeur={620} hauteur={175}>
      <rect x={60} y={yc - 18} width={60} height={36} fill={GRIS} opacity={0.4} />
      <rect x={120} y={yc - (d0 * k) / 2} width={L0 * k} height={d0 * k} fill="var(--color-beton-clair)" stroke={BLEU} />
      <rect x={120 + L0 * k} y={yc - 18} width={60} height={36} fill={GRIS} opacity={0.4} />
      <Cote x1={120} y1={yc + 32} x2={120 + L0 * k} y2={yc + 32} texte={`L0 = ${n1(L0)} mm`} decalage={-6} />
      <Etiquette x={470} y={yc + 4} taille={11}>
        avant essai
      </Etiquette>
      <g transform="translate(0, 70)">
        <rect x={60} y={yc - 18} width={60} height={36} fill={GRIS} opacity={0.4} />
        <path d={`M120 ${yc - (d0 * k) / 2} H${120 + (L0 * k) / 2} Q ${120 + (Lu * k) / 2} ${yc - (du * k) / 2} ${120 + (Lu * k) / 2 - 2} ${yc} Q ${120 + (Lu * k) / 2} ${yc + (du * k) / 2} ${120 + (L0 * k) / 2} ${yc + (d0 * k) / 2} H120 Z`} fill="var(--color-beton-clair)" stroke={BLEU} />
        <path d={`M${120 + (Lu * k) / 2 + 4} ${yc} Q ${120 + (Lu * k) / 2 + 6} ${yc - (du * k) / 2} ${120 + (Lu * k) - (L0 * k) / 2 + 8} ${yc - (d0 * k) / 2} H${120 + Lu * k} V${yc + (d0 * k) / 2} H${120 + (Lu * k) - (L0 * k) / 2 + 8} Q ${120 + (Lu * k) / 2 + 6} ${yc + (du * k) / 2} ${120 + (Lu * k) / 2 + 4} ${yc} Z`} fill="var(--color-beton-clair)" stroke={BLEU} />
        <Etiquette x={120 + (Lu * k) / 2} y={yc + 34} ancre="middle" taille={11} gras couleur={ROUGE}>
          striction
        </Etiquette>
        <Etiquette x={470} y={yc + 4} taille={11}>
          {`après rupture : Lu = ${n1(Lu)} mm`}
        </Etiquette>
      </g>
    </Figure>
  );
}

/** Lecture de la désignation d'un ciment sur le sac. */
export function SacCiment({ type = 'CEM II/A-L', classe = '42,5', prise = 'R' }: { type?: string; classe?: string; prise?: string }) {
  const parts = [
    { x: 110, t: type, l: 'type et constituants', c: BLEU },
    { x: 290, t: classe, l: 'classe de résistance (MPa à 28 j)', c: ROUGE },
    { x: 420, t: prise, l: 'R : rapide ; N : normale', c: VERT },
  ];
  return (
    <Figure alt={`Désignation d'un ciment, par exemple « ${type} ${classe} ${prise} » : le type (CEM I à CEM V) et la nature des ajouts, la classe de résistance minimale à 28 jours en MPa (32,5, 42,5 ou 52,5), et la vitesse de durcissement initial (R rapide ou N normale).`} largeur={620} hauteur={170}>
      <rect x={60} y={20} width={460} height={60} rx={8} fill="var(--color-papier)" stroke={GRIS} strokeWidth={1.4} />
      {parts.map((p, i) => (
        <g key={i}>
          <Etiquette x={p.x} y={60} ancre="middle" taille={24} gras couleur={p.c}>
            {p.t}
          </Etiquette>
          <line x1={p.x} x2={p.x} y1={84} y2={110} stroke={p.c} />
          <Etiquette x={p.x} y={128} ancre="middle" taille={11} couleur={p.c}>
            {p.l}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={290} y={160} ancre="middle" taille={10.5} couleur={GRIS}>
        exemple de marquage selon l'EN 197-1
      </Etiquette>
    </Figure>
  );
}

/** Courbe granulométrique d'un sable, avec le module de finesse. */
export function GranuloSable({ retenus, fond }: { retenus: readonly number[]; fond: number }) {
  const g = analyseGranulo(retenus, fond);
  const mesures = TAMIS.map((t, i) => [t, g.passants[i]!] as const);
  return (
    <Figure alt={`Courbe granulométrique : pourcentage de passants cumulés en fonction de l'ouverture des tamis (échelle logarithmique). ${TAMIS.slice(0, 7).map((t, i) => `${nombre(t, 3)} mm : ${nombre(g.passants[i]!, 1)} %`).join(' ; ')}. Module de finesse ${n2(g.mf)}.`} largeur={620} hauteur={300}>
      <CourbeGranulo mesures={mesures} x={60} y={20} largeur={500} hauteur={230} dmin={0.063} dmax={31.5} />
      <Etiquette x={560} y={290} ancre="end" taille={12} gras couleur={ROUGE}>
        {`module de finesse MF = ${n2(g.mf)}`}
      </Etiquette>
    </Figure>
  );
}

/** Le cône d'Abrams : moule, démoulage, affaissement mesuré. */
export function ConeAbrams({ affaissement }: { affaissement: number }) {
  const k = 0.6;
  const H = 300 * k;
  const yb = 205;
  const a = affaissement * k;
  return (
    <Figure alt={`Essai d'affaissement au cône d'Abrams : le moule tronconique de 300 mm de haut est rempli en trois couches piquées, puis soulevé. Le béton s'affaisse ; on mesure la différence de hauteur : ${nombre(affaissement, 0)} mm ici, classe ${CLASSES_AFFAISSEMENT.find((c) => affaissement >= c.min && affaissement <= c.max)?.classe ?? 'hors classe'}.`} largeur={620} hauteur={230}>
      <polygon points={points([[100, yb], [100 + 200 * k, yb], [100 + 150 * k, yb - H], [100 + 50 * k, yb - H]])} fill="none" stroke={GRIS} strokeWidth={2} />
      <Etiquette x={100 + 100 * k} y={yb + 18} ancre="middle" taille={11}>
        moule (300 mm)
      </Etiquette>
      <polygon points={points([[330, yb], [330 + 200 * k, yb], [330 + 160 * k, yb - H + a], [330 + 40 * k, yb - H + a]])} fill={GRIS} opacity={0.5} stroke={GRIS} />
      <line x1={100 + 50 * k} x2={330 + 200 * k + 20} y1={yb - H} y2={yb - H} stroke={ROUGE} strokeDasharray="4 3" />
      <line x1={330 + 40 * k} x2={330 + 200 * k + 20} y1={yb - H + a} y2={yb - H + a} stroke={ROUGE} strokeDasharray="4 3" />
      <Cote x1={330 + 200 * k + 20} y1={yb - H} x2={330 + 200 * k + 20} y2={yb - H + a} texte={`${nombre(affaissement, 0)} mm`} decalage={0} />
      <Etiquette x={330 + 100 * k} y={yb + 18} ancre="middle" taille={11}>
        béton démoulé
      </Etiquette>
    </Figure>
  );
}

/** Composition volumique de 1 m³ de béton. */
export function VolumesBeton({ d }: { d: DonneesFormulation }) {
  const f = formulation(d);
  const parts = [
    { t: 'ciment', v: f.Vc, m: d.C, c: GRIS },
    { t: 'eau', v: f.E, m: f.E, c: BLEU },
    { t: 'air', v: d.air, m: 0, c: 'var(--color-papier)' },
    { t: 'sable', v: f.Vsable, m: f.sable, c: TERRE },
    { t: 'gravier', v: f.Vgravier, m: f.gravier, c: BRIQUE },
  ];
  let x = 40;
  const k = 540 / 1000;
  return (
    <Figure alt={`Un mètre cube de béton (1 000 L) : ${parts.map((p) => `${p.t} ${nombre(p.v, 0)} L${p.m ? ` (${nombre(p.m, 0)} kg)` : ''}`).join(', ')}. Les granulats occupent environ 70 % du volume ; la pâte de ciment les enrobe et les colle.`} largeur={620} hauteur={160}>
      {parts.map((p, i) => {
        const w = p.v * k;
        const g = (
          <g key={i}>
            <rect x={x} y={30} width={w} height={60} fill={p.c} opacity={0.55} stroke={GRIS} />
            <Etiquette x={x + w / 2} y={22} ancre="middle" taille={10.5} gras>
              {p.t}
            </Etiquette>
            <Etiquette x={x + w / 2} y={108} ancre="middle" taille={10.5}>
              {`${nombre(p.v, 0)} L`}
            </Etiquette>
            {p.m ? (
              <Etiquette x={x + w / 2} y={126} ancre="middle" taille={10.5} couleur={ROUGE}>
                {`${nombre(p.m, 0)} kg`}
              </Etiquette>
            ) : null}
          </g>
        );
        x += w;
        return g;
      })}
      <Etiquette x={310} y={150} ancre="middle" taille={11}>
        1 m³ = 1 000 L
      </Etiquette>
    </Figure>
  );
}

/** Classes d'exposition sur un bâtiment : intérieur, façade, fondation, zone agressive. */
export function ClassesExposition() {
  const p = pid('ce', useId());
  return (
    <Figure alt="Un bâtiment et ses classes d'exposition (EN 206) : poteaux et dalles intérieurs au sec en XC1 ; fondations enterrées humides en XC2 ; façades et balcons alternativement mouillés et secs en XC4 ; semelles dans un sol chargé de sulfates ou dans une eau acide de zone minière en XA1 à XA3 ; ouvrages proches de la mer en XS1." largeur={620} hauteur={240}>
      <Hachures prefixe={p} types={['terre']} />
      <rect x={0} y={170} width={620} height={70} fill={hachure(p, 'terre')} />
      <rect x={150} y={50} width={260} height={120} fill="var(--color-beton-clair)" stroke={GRIS} />
      <rect x={410} y={100} width={60} height={8} fill={GRIS} />
      <rect x={170} y={170} width={50} height={30} fill={GRIS} />
      <rect x={340} y={170} width={50} height={30} fill={GRIS} />
      <rect x={480} y={185} width={80} height={30} fill={ROUGE} opacity={0.25} stroke={ROUGE} />
      {[
        [280, 110, 'XC1 : intérieur sec', VERT],
        [430, 92, 'XC4 : façade, balcon', BLEU],
        [195, 228, 'XC2 : fondations', TERRE],
        [520, 232, 'XA : sol agressif', ROUGE],
        [60, 40, 'XS : air marin', ACIER],
      ].map(([x, y, t, c], i) => (
        <Etiquette key={i} x={x as number} y={y as number} ancre="middle" taille={11.5} gras couleur={c as string}>
          {t as string}
        </Etiquette>
      ))}
      <path d="M60 50 q 20 -10 40 0 t 40 0" fill="none" stroke={ACIER} />
    </Figure>
  );
}

/** Évaporation du béton frais selon la température, l'humidité et le vent, avec le seuil d'alerte. */
export function EvaporationClimat({ Tc, Ta, r, V }: { Tc: number; Ta: number; r: number; V: number }) {
  const R = repere2D({ x0: 70, y0: 20, l: 470, h: 160, xmin: 0, xmax: 40, ymin: 0, ymax: 2.5 });
  const courbe = (rh: number) => points(Array.from({ length: 41 }, (_, i) => [R.X(i), R.Y(Math.min(2.5, Math.max(0, evaporation(Tc, Ta, rh, i))))] as const));
  const e = evaporation(Tc, Ta, r, V);
  return (
    <Figure alt={`Évaporation d'un béton frais à ${Tc} °C sous un air à ${Ta} °C, en fonction du vent, pour trois humidités relatives. Au-delà d'environ 1 kg/m²/h, le risque de fissuration plastique est élevé. Ici (humidité ${nombre(r * 100, 0)} %, vent ${V} km/h) : ${n2(e)} kg/m²/h.`} largeur={620} hauteur={225}>
      <Axes R={R} gradX={[10, 20, 30, 40]} gradY={[0.5, 1, 1.5, 2, 2.5]} titreX="vent (km/h)" titreY="kg/m²/h" decY={1} grille />
      <line x1={R.X(0)} x2={R.X(40)} y1={R.Y(1)} y2={R.Y(1)} stroke={ROUGE} strokeDasharray="6 3" strokeWidth={1.6} />
      <Etiquette x={R.X(40) - 4} y={R.Y(1) - 6} ancre="end" taille={10.5} couleur={ROUGE}>
        seuil d'alerte ≈ 1 kg/m²/h
      </Etiquette>
      {[0.3, 0.5, 0.8].map((rh, i) => (
        <g key={rh}>
          <polyline points={courbe(rh)} fill="none" stroke={[TERRE, BLEU, VERT][i]} strokeWidth={2} />
          <Etiquette x={R.X(40) + 4} y={R.Y(Math.min(2.5, evaporation(Tc, Ta, rh, 40))) + 4} taille={10.5} couleur={[TERRE, BLEU, VERT][i]}>
            {`HR ${nombre(rh * 100, 0)} %`}
          </Etiquette>
        </g>
      ))}
      <circle cx={R.X(V)} cy={R.Y(Math.min(2.5, e))} r={5} fill={ROUGE} />
    </Figure>
  );
}

/** Coupes de barres HA à l'échelle, avec section et masse linéique. */
export function BarresHA({ diametres }: { diametres: readonly number[] }) {
  const xs = diametres.map((_, i) => 60 + i * (500 / Math.max(1, diametres.length - 1)));
  return (
    <Figure alt={`Barres d'acier à haute adhérence : ${diametres.map((d) => `HA ${d}, ${nombre(barreHA(d).A, 0)} mm², ${nombre(barreHA(d).masse, 3)} kg/m`).join(' ; ')}. La section croît comme le carré du diamètre.`} largeur={620} hauteur={170}>
      {diametres.map((d, i) => (
        <g key={d}>
          <circle cx={xs[i]} cy={60} r={d * 1.3} fill={ACIER} opacity={0.6} stroke={ACIER} />
          {Array.from({ length: 8 }, (_, j) => {
            const a = (j * Math.PI) / 4;
            return <line key={j} x1={xs[i]! + Math.cos(a) * d * 1.3} y1={60 + Math.sin(a) * d * 1.3} x2={xs[i]! + Math.cos(a) * (d * 1.3 + 3)} y2={60 + Math.sin(a) * (d * 1.3 + 3)} stroke={ACIER} />;
          })}
          <Etiquette x={xs[i]!} y={118} ancre="middle" taille={11.5} gras>
            {`HA ${d}`}
          </Etiquette>
          <Etiquette x={xs[i]!} y={136} ancre="middle" taille={10}>
            {`${nombre(barreHA(d).A, 0)} mm²`}
          </Etiquette>
          <Etiquette x={xs[i]!} y={152} ancre="middle" taille={10} couleur={ROUGE}>
            {`${nombre(barreHA(d).masse, 3)} kg/m`}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Formes des profilés laminés courants. */
export function Profiles() {
  const f = (x: number, d: string, t: string, l: string) => (
    <g>
      <path d={d} transform={`translate(${x},20)`} fill={ACIER} opacity={0.55} stroke={ACIER} strokeWidth={1.4} />
      <Etiquette x={x + 40} y={150} ancre="middle" taille={12} gras>
        {t}
      </Etiquette>
      <Etiquette x={x + 40} y={168} ancre="middle" taille={10}>
        {l}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="Profilés laminés courants : IPE (I à ailes étroites, poutres), HEA (H à ailes larges, poteaux), UPN (U, chevêtres et cadres), cornière (L, contreventements et treillis), tube creux (poteaux légers, treillis)." largeur={620} hauteur={180}>
      {f(20, 'M10 0 H70 V8 H44 V112 H70 V120 H10 V112 H36 V8 H10 Z', 'IPE', 'poutres')}
      {f(130, 'M0 10 H80 V20 H44 V100 H80 V110 H0 V100 H36 V20 H0 Z', 'HEA', 'poteaux')}
      {f(240, 'M10 0 H60 V8 H20 V112 H60 V120 H10 Z', 'UPN', 'chevêtres, cadres')}
      {f(350, 'M10 20 H20 V110 H80 V120 H10 Z', 'cornière', 'treillis')}
      {f(460, 'M10 20 H80 V110 H10 Z M18 28 V102 H72 V28 Z', 'tube', 'poteaux légers')}
    </Figure>
  );
}

/** Coupe d'un tronc : directions L, R, T, cernes, aubier et duramen. */
export function TroncBois() {
  return (
    <Figure alt="Coupe d'un tronc d'arbre : au centre le duramen (cœur, plus durable), autour l'aubier (plus clair, plus sensible aux insectes), puis l'écorce. Les cernes concentriques marquent la croissance. Le bois a trois directions : longitudinale (le fil, la plus résistante), radiale et tangentielle (retrait le plus fort)." largeur={620} hauteur={220}>
      {[90, 75, 60, 45, 30, 15].map((r, i) => (
        <circle key={r} cx={150} cy={110} r={r} fill={i === 0 ? '#7a5a3a' : i < 2 ? '#e8d4b0' : '#c9a473'} opacity={i === 0 ? 0.8 : 0.7} stroke={TERRE} strokeWidth={0.8} />
      ))}
      <Etiquette x={150} y={114} ancre="middle" taille={10.5} gras>
        duramen
      </Etiquette>
      <Etiquette x={150} y={40} ancre="middle" taille={10.5}>
        aubier
      </Etiquette>
      <Etiquette x={150} y={214} ancre="middle" taille={10.5}>
        écorce
      </Etiquette>
      <Fleche x1={150} y1={110} x2={235} y2={110} couleur={BLEU} epaisseur={2} />
      <Etiquette x={240} y={114} taille={11} gras couleur={BLEU}>
        R (radial)
      </Etiquette>
      <path d="M150 20 A 90 90 0 0 1 225 60" fill="none" stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={230} y={52} taille={11} gras couleur={ROUGE}>
        T (tangentiel)
      </Etiquette>
      <rect x={340} y={80} width={240} height={50} fill="#e8d4b0" stroke={TERRE} />
      {[90, 100, 110, 120].map((y) => (
        <line key={y} x1={345} x2={575} y1={y} y2={y} stroke={TERRE} strokeWidth={0.8} />
      ))}
      <Fleche x1={350} y1={150} x2={570} y2={150} couleur={VERT} epaisseur={2} />
      <Etiquette x={460} y={170} ancre="middle" taille={11} gras couleur={VERT}>
        L : le fil (résistance maximale)
      </Etiquette>
    </Figure>
  );
}

/** Trois éléments de maçonnerie à la même échelle. */
export function ElementsMaconnerie() {
  const k = 4.5;
  const el = [
    { nom: 'parpaing creux', L: 40, H: 20, c: GRIS, creux: true },
    { nom: 'brique cuite', L: 22, H: 6.5, c: BRIQUE, creux: false },
    { nom: 'BTC (terre comprimée)', L: 29.5, H: 9, c: TERRE, creux: false },
  ];
  let x = 30;
  return (
    <Figure alt="Trois éléments de maçonnerie vus de face, à la même échelle : le parpaing creux en béton (40 × 20 cm), la brique cuite pleine (22 × 6,5 cm) et le bloc de terre comprimée stabilisée, BTC (29,5 × 9 cm)." largeur={620} hauteur={150}>
      {el.map((e, i) => {
        const g = (
          <g key={i}>
            <rect x={x} y={110 - e.H * k} width={e.L * k} height={e.H * k} fill={e.c} opacity={0.55} stroke={e.c} />
            {e.creux ? (
              <g>
                <rect x={x + 12} y={110 - e.H * k + 14} width={e.L * k / 2 - 18} height={e.H * k - 28} fill="var(--color-papier)" stroke={e.c} />
                <rect x={x + e.L * k / 2 + 6} y={110 - e.H * k + 14} width={e.L * k / 2 - 18} height={e.H * k - 28} fill="var(--color-papier)" stroke={e.c} />
              </g>
            ) : null}
            <Etiquette x={x + (e.L * k) / 2} y={128} ancre="middle" taille={11} gras>
              {e.nom}
            </Etiquette>
            <Etiquette x={x + (e.L * k) / 2} y={144} ancre="middle" taille={10}>
              {`${nombre(e.L, 1)} × ${nombre(e.H, 1)} cm`}
            </Etiquette>
          </g>
        );
        x += e.L * k + 30;
        return g;
      })}
    </Figure>
  );
}

/** Coupe de chaussée avec géotextile de séparation. */
export function CoupeChaussee() {
  const p = pid('cc', useId());
  return (
    <Figure alt="Coupe d'une route : couche de roulement en enduit bitumineux, couche de base en grave latéritique ou concassée, couche de fondation, géotextile de séparation posé sur le sol support argileux pour empêcher les fines de remonter, et fossés latéraux pour drainer l'eau." largeur={620} hauteur={200}>
      <Hachures prefixe={p} types={['terre', 'gravier']} />
      <rect x={20} y={130} width={580} height={60} fill={hachure(p, 'terre')} />
      <polygon points={points([[90, 130], [530, 130], [510, 105], [110, 105]])} fill={hachure(p, 'gravier')} stroke={GRIS} />
      <polygon points={points([[110, 105], [510, 105], [495, 85], [125, 85]])} fill={TERRE} opacity={0.5} stroke={GRIS} />
      <polygon points={points([[125, 85], [495, 85], [490, 78], [130, 78]])} fill="#333" opacity={0.85} />
      <line x1={88} x2={532} y1={131} y2={131} stroke={VERT} strokeWidth={3} strokeDasharray="10 4" />
      <path d="M20 130 L50 150 L80 130" fill="none" stroke={BLEU} strokeWidth={2} />
      <path d="M540 130 L570 150 L600 130" fill="none" stroke={BLEU} strokeWidth={2} />
      {[
        [310, 72, 'enduit bitumineux', '#333'],
        [310, 98, 'couche de base (latérite)', TERRE],
        [310, 122, 'couche de fondation', GRIS],
        [310, 148, 'géotextile de séparation', VERT],
        [310, 182, 'sol support argileux', TERRE],
        [50, 168, 'fossé', BLEU],
      ].map(([x, y, t, c], i) => (
        <Etiquette key={i} x={x as number} y={y as number} ancre="middle" taille={11} gras couleur={c as string}>
          {t as string}
        </Etiquette>
      ))}
    </Figure>
  );
}

/** Sources de matériaux locaux et leurs usages. */
export function SourcesLocales() {
  const blocs = [
    { t: 'sable de rivière', u: 'béton, mortier ; laver si argileux', c: TERRE },
    { t: 'carrière (concassé)', u: 'gravier de béton, grave', c: GRIS },
    { t: 'latérite', u: 'couche de base, BTC, remblai', c: BRIQUE },
    { t: 'bois et bambou', u: 'charpente, coffrage, échafaudage', c: VERT },
    { t: 'argile', u: 'briques cuites, BTC', c: TERRE },
  ];
  return (
    <Figure alt={`Matériaux locaux et leurs usages : ${blocs.map((b) => `${b.t} pour ${b.u}`).join(' ; ')}.`} largeur={620} hauteur={170}>
      {blocs.map((b, i) => (
        <g key={i}>
          <rect x={15 + i * 120} y={20} width={110} height={130} rx={8} fill="var(--color-papier)" stroke={b.c} strokeWidth={1.6} />
          <rect x={15 + i * 120} y={20} width={110} height={34} rx={8} fill={b.c} opacity={0.35} />
          <Etiquette x={70 + i * 120} y={42} ancre="middle" taille={11} gras>
            {b.t}
          </Etiquette>
          {b.u.split(', ').map((l, j) => (
            <Etiquette key={j} x={70 + i * 120} y={76 + j * 18} ancre="middle" taille={10}>
              {l}
            </Etiquette>
          ))}
        </g>
      ))}
    </Figure>
  );
}
