// Schémas du module N0.3 (unités, conversions, ordres de grandeur). Toutes les valeurs viennent de lib/calc/.
import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { ChargePonctuelle } from '@/components/drawing/Mecanique';
import { DIM, ecrireDim } from '@/lib/calc/dimensions';
import { proprietesMateriau } from '@/lib/calc/materiauxCourants';
import { G_LUNE, poidsDeMasse, POUCE, prefixe, PREFIXES, pressionMoyenne } from '@/lib/calc/unites';
import { projeterIso, type Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { grandeur, nombre, puissanceDix } from '@/lib/format';

// ---------- Échelle des préfixes (N0.3.1) ----------

/** 10ⁿ dessiné avec un vrai exposant SVG : les chiffres suscrits Unicode manquent dans la police des schémas. */
function Puissance({ n }: { n: number }) {
  return (
    <>
      10
      <tspan dy={-4} fontSize="0.72em">
        {String(n).replace('-', '−')}
      </tspan>
    </>
  );
}

/** Préfixes placés selon leur exposant ; flèche de `de` vers `vers` avec le facteur × 10ⁿ. */
export function EchellePrefixes({ de, vers, unite = '' }: { de?: string; vers?: string; unite?: string }) {
  const x = (e: number) => 26 + (9 - e) * 30.8;
  const yAxe = 98;
  const conversion = de !== undefined && vers !== undefined && de !== vers;
  const yNoms = yAxe + 32;
  const n = conversion ? prefixe(de).exposant - prefixe(vers).exposant : 0;
  const x1 = conversion ? x(prefixe(de).exposant) : 0;
  const x2 = conversion ? x(prefixe(vers).exposant) : 0;
  const alt = conversion
    ? `Échelle des préfixes SI de giga à nano ; passage de ${de || 'l’unité'}${unite} à ${vers || 'l’unité'}${unite} : on multiplie par ${puissanceDix(n)}`
    : 'Échelle des préfixes SI placés selon leur puissance de dix, de giga (10⁹) à nano (10⁻⁹)';
  return (
    <Figure alt={alt} largeur={620} hauteur={150}>
      <line x1={x(9) - 8} y1={yAxe} x2={x(-9) + 8} y2={yAxe} className="t-moyen" />
      {Array.from({ length: 19 }, (_, i) => 9 - i).map((e) => (
        <line key={e} x1={x(e)} y1={yAxe - 4} x2={x(e)} y2={yAxe + 4} className="t-fin" />
      ))}
      {PREFIXES.map((p) => {
        const actif = p.symbole === de ? 'de' : p.symbole === vers ? 'vers' : null;
        const fond = actif === 'de' ? 'var(--color-encre-clair)' : actif === 'vers' ? 'var(--color-validation-clair)' : 'var(--color-papier)';
        return (
          <g key={p.nom}>
            <rect x={x(p.exposant) - 13} y={yAxe - 40} width={26} height={26} rx={4} fill={fond} className={actif ? 't-fort' : 't-moyen'} />
            <Etiquette x={x(p.exposant)} y={yAxe - 22} ancre="middle" taille={p.symbole.length > 1 ? 11.5 : 13} gras>
              {p.symbole || unite || '·'}
            </Etiquette>
            <Etiquette x={x(p.exposant)} y={yAxe + 18} ancre="middle" taille={10.5}>
              <Puissance n={p.exposant} />
            </Etiquette>
            <Etiquette x={x(p.exposant)} y={yNoms} ancre="middle" taille={8.5} classe="etiquette">
              {p.symbole ? p.nom : 'unité'}
            </Etiquette>
          </g>
        );
      })}
      {conversion ? (
        <g>
          <line x1={x1} y1={yAxe - 46} x2={x1} y2={yAxe - 60} className="t-moyen" stroke="var(--color-encre)" />
          <line x1={x1} y1={yAxe - 60} x2={x2} y2={yAxe - 60} className="t-moyen" stroke="var(--color-encre)" />
          <line x1={x2} y1={yAxe - 60} x2={x2} y2={yAxe - 47} className="t-moyen" stroke="var(--color-encre)" />
          <polygon points={`${x2},${yAxe - 42} ${x2 - 4},${yAxe - 50} ${x2 + 4},${yAxe - 50}`} fill="var(--color-encre)" />
          <Etiquette x={(x1 + x2) / 2} y={yAxe - 66} ancre="middle" taille={13} gras classe="encre">
            × <Puissance n={n} />
          </Etiquette>
        </g>
      ) : null}
    </Figure>
  );
}

// ---------- 1 m² = 100 dm² ; 1 m³ = 1 000 L (N0.3.2) ----------

export function CarreCube() {
  const c = 150;
  const x0 = 50;
  const y0 = 24;
  const k = 85;
  const ox = 455;
  const oy = 108;
  const P = (p: Point3) => {
    const [px, py] = projeterIso(p);
    return [ox + px * k, oy + py * k] as const;
  };
  const face = (pts: Point3[]) => points(pts.map(P));
  const div = Array.from({ length: 11 }, (_, i) => i / 10);
  return (
    <Figure
      alt="À gauche, un carré de 1 m de côté découpé en 10 × 10 carrés de 1 dm : 1 m² = 100 dm². À droite, un cube de 1 m d'arête découpé en 10 × 10 × 10 petits cubes de 1 dm : 1 m³ = 1 000 dm³ = 1 000 L."
      largeur={620}
      hauteur={240}
    >
      <rect x={x0} y={y0} width={c / 10} height={c / 10} fill="var(--color-encre)" opacity={0.55} />
      {div.map((t) => (
        <g key={t}>
          <line x1={x0 + t * c} y1={y0} x2={x0 + t * c} y2={y0 + c} className="t-fin" />
          <line x1={x0} y1={y0 + t * c} x2={x0 + c} y2={y0 + t * c} className="t-fin" />
        </g>
      ))}
      <rect x={x0} y={y0} width={c} height={c} fill="none" className="t-fort" />
      <Cote x1={x0} y1={y0 + c} x2={x0 + c} y2={y0 + c} decalage={-16} texte="1 m = 10 dm" />
      <Etiquette x={x0 + c / 20} y={y0 - 6} ancre="start" taille={10.5} classe="etiquette">
        1 dm²
      </Etiquette>
      <Etiquette x={x0 + c / 2} y={y0 + c + 44} ancre="middle" taille={13} gras>
        1 m² = 10 × 10 = 100 dm²
      </Etiquette>

      <polygon points={face([[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]])} fill="var(--fond-eau)" className="t-moyen" />
      <polygon points={face([[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]])} fill="var(--fond-eau)" className="t-moyen" />
      <polygon points={face([[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]])} fill="var(--fond-eau)" className="t-moyen" />
      {div.slice(1, -1).map((t) => {
        const l = (a: Point3, b: Point3) => {
          const [x1, y1] = P(a);
          const [x2, y2] = P(b);
          return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} className="t-fin" />;
        };
        return (
          <g key={t}>
            {l([t, 0, 1], [t, 1, 1])}
            {l([0, t, 1], [1, t, 1])}
            {l([1, t, 0], [1, t, 1])}
            {l([1, 0, t], [1, 1, t])}
            {l([t, 1, 0], [t, 1, 1])}
            {l([0, 1, t], [1, 1, t])}
          </g>
        );
      })}
      <polygon points={face([[0.9, 0.9, 1], [1, 0.9, 1], [1, 1, 1], [0.9, 1, 1]])} fill="var(--color-encre)" opacity={0.6} />
      <polygon points={face([[1, 0.9, 0.9], [1, 1, 0.9], [1, 1, 1], [1, 0.9, 1]])} fill="var(--color-encre)" opacity={0.75} />
      <polygon points={face([[0.9, 1, 0.9], [1, 1, 0.9], [1, 1, 1], [0.9, 1, 1]])} fill="var(--color-encre)" opacity={0.9} />
      <line x1={P([1, 1, 1])[0] + 4} y1={P([1, 1, 1])[1] + 8} x2={548} y2={186} className="t-fin" />
      <Etiquette x={552} y={190} taille={11} gras classe="encre">
        1 dm³ = 1 L
      </Etiquette>
      <Etiquette x={P([1, 0, 0])[0] + 8} y={P([1, 0, 0.5])[1]} taille={11}>
        1 m
      </Etiquette>
      <Etiquette x={ox} y={y0 + c + 44} ancre="middle" taille={13} gras>
        1 m³ = 10 × 10 × 10 = 1 000 dm³ = 1 000 L
      </Etiquette>
    </Figure>
  );
}

// ---------- Masse et poids (N0.3.3) ----------

export function MassePoids({ masse = 50 }: { masse?: number }) {
  const terre = poidsDeMasse(masse);
  const lune = poidsDeMasse(masse, G_LUNE);
  const lg = (P: number) => 20 + (P / terre) * 80;
  const sac = (cx: number, titre: string, P: number) => (
    <g>
      <Etiquette x={cx} y={20} ancre="middle" taille={13} gras>
        {titre}
      </Etiquette>
      <path d={`M${cx - 34} 40 h68 l6 84 h-80 z`} fill="var(--fond-beton)" className="t-moyen" />
      <path d={`M${cx - 34} 40 l8 -8 h52 l8 8`} fill="none" className="t-moyen" />
      <Etiquette x={cx} y={78} ancre="middle" taille={11} gras>
        CIMENT
      </Etiquette>
      <Etiquette x={cx} y={96} ancre="middle" taille={11}>
        {nombre(masse, 0)} kg
      </Etiquette>
      <ChargePonctuelle x={cx} y={130 + lg(P)} longueur={lg(P)} />
      <Etiquette x={cx + 10} y={140 + lg(P) / 2} taille={12} gras classe="encre">
        P = {grandeur(P, 1, 'N')}
      </Etiquette>
    </g>
  );
  return (
    <Figure
      alt={`Le même sac de ciment de ${nombre(masse, 0)} kg : sur Terre son poids vaut ${nombre(terre, 1)} N, sur la Lune ${nombre(lune, 1)} N ; la masse ne change pas.`}
      largeur={620}
      hauteur={250}
    >
      {sac(160, 'Sur Terre (g = 9,81 m/s²)', terre)}
      {sac(450, `Sur la Lune (g = ${nombre(G_LUNE, 2)} m/s²)`, lune)}
      <Etiquette x={310} y={244} ancre="middle" taille={12}>
        même masse m = {nombre(masse, 0)} kg · poids différent : P = m × g
      </Etiquette>
    </Figure>
  );
}

// ---------- Même force, deux surfaces (N0.3.3) ----------

export function PressionDeuxSurfaces({ N = 300, a = 0.2, B = 1.2 }: { N?: number; a?: number; B?: number }) {
  const petit = pressionMoyenne(N, a, a);
  const grand = pressionMoyenne(N, B, B);
  const k = 120; // px par m
  const ySol = 150;
  const appui = (cx: number, largeur: number, p: number, titre: string) => {
    const w = largeur * k;
    const nb = Math.max(3, Math.round(w / 16));
    return (
      <g>
        <Etiquette x={cx} y={18} ancre="middle" taille={12.5} gras>
          {titre}
        </Etiquette>
        <rect x={cx - (a * k) / 2} y={60} width={a * k} height={ySol - 60 - (largeur > a ? 22 : 0)} fill={hachure('pds', 'ba')} className="t-fort" />
        {largeur > a ? <rect x={cx - w / 2} y={ySol - 22} width={w} height={22} fill={hachure('pds', 'ba')} className="t-fort" /> : null}
        <ChargePonctuelle x={cx} y={58} longueur={30} texte={`N = ${nombre(N, 0)} kN`} />
        {Array.from({ length: nb + 1 }, (_, i) => cx - w / 2 + (i * w) / nb).map((xi) => (
          <ChargePonctuelle key={xi} x={xi} y={ySol + 2} angle={-90} longueur={largeur > a ? 18 : 40} />
        ))}
        <Etiquette x={cx} y={ySol + 60} ancre="middle" taille={12.5} gras classe="encre">
          σ = {nombre(p, 0)} kPa = {nombre(p / 1000, 3)} MPa
        </Etiquette>
        <Cote x1={cx - w / 2} y1={ySol} x2={cx + w / 2} y2={ySol} decalage={-86} texte={`${nombre(largeur, 2)} m`} />
      </g>
    );
  };
  return (
    <Figure
      alt={`La même charge de ${nombre(N, 0)} kN posée sur ${nombre(a, 2)} × ${nombre(a, 2)} m donne ${nombre(petit.kPa, 0)} kPa ; répartie sur une semelle de ${nombre(B, 2)} × ${nombre(B, 2)} m, ${nombre(grand.kPa, 0)} kPa, soit ${nombre(petit.kPa / grand.kPa, 0)} fois moins.`}
      largeur={620}
      hauteur={250}
    >
      <Hachures prefixe="pds" types={['ba', 'terre']} />
      <rect x={10} y={ySol} width={600} height={14} fill={hachure('pds', 'terre')} />
      <line x1={10} y1={ySol} x2={610} y2={ySol} className="t-moyen" />
      {appui(150, a, petit.kPa, 'Poteau posé directement')}
      {appui(450, B, grand.kPa, 'Poteau sur semelle')}
    </Figure>
  );
}

// ---------- Trois mètres cubes (N0.3.4) ----------

export function TroisCubes() {
  const items = [
    { id: 'eau' as const, titre: '1 m³ d’eau', h: 'eau' as const },
    { id: 'ba' as const, titre: '1 m³ de béton armé', h: 'ba' as const },
    { id: 'acier' as const, titre: '1 m³ d’acier', h: 'acier' as const },
  ].map((it) => ({ ...it, ...proprietesMateriau(it.id) }));
  const gMax = Math.max(...items.map((i) => i.gamma));
  return (
    <Figure
      alt={`Trois cubes de 1 m³ : eau ${nombre(items[0]!.gamma, 2)} kN, béton armé ${nombre(items[1]!.gamma, 0)} kN, acier ${nombre(items[2]!.gamma, 1)} kN ; les flèches de poids sont proportionnelles.`}
      largeur={620}
      hauteur={270}
    >
      <Hachures prefixe="cub" types={['eau', 'ba', 'acier']} />
      {items.map((it, i) => {
        const cx = 110 + i * 200;
        const lg = 10 + (it.gamma / gMax) * 110;
        return (
          <g key={it.id}>
            <Etiquette x={cx} y={18} ancre="middle" taille={12.5} gras>
              {it.titre}
            </Etiquette>
            <rect x={cx - 40} y={30} width={80} height={80} fill={hachure('cub', it.h)} className="t-fort" />
            <ChargePonctuelle x={cx} y={116 + lg} longueur={lg} />
            <Etiquette x={cx + 8} y={128 + lg / 2} taille={12.5} gras classe="encre">
              {nombre(it.gamma, it.gamma < 20 ? 2 : 1)} kN
            </Etiquette>
            <Etiquette x={cx} y={262} ancre="middle" taille={11.5}>
              m = {nombre(it.rho, 0)} kg
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

// ---------- Une formule annotée (N0.3.5) ----------

export function FormuleAnnotee() {
  const cols = [
    { s: 'σ', d: ecrireDim(DIM.pression), u: 'Pa = N/m²', x: 120 },
    { s: '=', x: 205 },
    { s: 'F', d: ecrireDim(DIM.force), u: 'N = kg·m/s²', x: 290 },
    { s: '/', x: 375 },
    { s: 'A', d: ecrireDim(DIM.surface), u: 'm²', x: 460 },
  ];
  return (
    <Figure alt="Formule σ = F / A annotée : σ a la dimension M·L⁻¹·T⁻², F a la dimension M·L·T⁻², A a la dimension L² ; F / A redonne M·L⁻¹·T⁻², la formule est homogène." largeur={620} hauteur={170}>
      {cols.map((c) => (
        <g key={c.x}>
          <Etiquette x={c.x} y={50} ancre="middle" taille={34} gras classe={c.d ? 'encre' : ''}>
            {c.s}
          </Etiquette>
          {c.d ? (
            <>
              <path d={`M${c.x - 32} 64 q0 8 8 8 h16 l8 8 l8 -8 h16 q8 0 8 -8`} fill="none" className="t-moyen" />
              <Etiquette x={c.x} y={100} ancre="middle" taille={13} gras>
                {c.d}
              </Etiquette>
              <Etiquette x={c.x} y={118} ancre="middle" taille={10.5} classe="etiquette">
                {c.u}
              </Etiquette>
            </>
          ) : null}
        </g>
      ))}
      <Etiquette x={310} y={156} ancre="middle" taille={13}>
        {ecrireDim(DIM.force)} ÷ {ecrireDim(DIM.surface)} = {ecrireDim(DIM.pression)} ✓ même dimension des deux côtés
      </Etiquette>
    </Figure>
  );
}

// ---------- Règle double pouces / centimètres (N0.3.6) ----------

export function RegleDouble() {
  const x0 = 40;
  const mmTotal = 6 * POUCE * 1000; // 152,4 mm
  const k = 540 / mmTotal;
  const X = (mm: number) => x0 + mm * k;
  const yh = 40;
  const yb = 92;
  const unPouce = POUCE * 1000;
  return (
    <Figure alt={`Règle double : en haut 6 pouces, en bas 15 cm ; un pouce mesure ${nombre(unPouce, 1)} mm.`} largeur={620} hauteur={140}>
      <rect x={x0 - 10} y={yh - 6} width={560} height={yb - yh + 12} fill="var(--fond-note)" className="t-moyen" />
      {Array.from({ length: 6 * 8 + 1 }, (_, i) => i).map((i) => {
        const long = i % 8 === 0 ? 16 : i % 4 === 0 ? 11 : i % 2 === 0 ? 8 : 5;
        const x = X((i / 8) * unPouce);
        return <line key={`p${i}`} x1={x} y1={yh - 6} x2={x} y2={yh - 6 + long} className="t-fin" />;
      })}
      {Array.from({ length: 7 }, (_, i) => i).map((i) => (
        <Etiquette key={`lp${i}`} x={X(i * unPouce) + 2} y={yh + 22} taille={11}>
          {i}
        </Etiquette>
      ))}
      {Array.from({ length: 153 }, (_, i) => i).map((i) => {
        const long = i % 10 === 0 ? 16 : i % 5 === 0 ? 11 : 6;
        const x = X(i);
        return <line key={`c${i}`} x1={x} y1={yb + 6 - long} x2={x} y2={yb + 6} className="t-fin" />;
      })}
      {Array.from({ length: 16 }, (_, i) => i).map((i) => (
        <Etiquette key={`lc${i}`} x={X(i * 10) + 2} y={yb - 12} taille={10}>
          {i}
        </Etiquette>
      ))}
      <line x1={X(unPouce)} y1={yh - 12} x2={X(unPouce)} y2={yb + 12} stroke="var(--color-correction)" strokeWidth={1.6} />
      <Etiquette x={X(unPouce) + 6} y={yh - 14} taille={11.5} gras classe="encre">
        1 pouce = {nombre(unPouce, 1)} mm
      </Etiquette>
      <Etiquette x={x0 - 14} y={yh + 4} ancre="end" taille={10.5}>
        in
      </Etiquette>
      <Etiquette x={x0 - 14} y={yb + 4} ancre="end" taille={10.5}>
        cm
      </Etiquette>
    </Figure>
  );
}

// ---------- Chaîne de conversion (N0.3.6) ----------

export function ChaineConversion({ etapes, operations, alt }: { etapes: string[]; operations: string[]; alt: string }) {
  const n = etapes.length;
  const w = 150;
  const gap = n > 1 ? (580 - n * w) / (n - 1) : 0;
  return (
    <Figure alt={alt} largeur={620} hauteur={96}>
      {etapes.map((e, i) => {
        const x = 20 + i * (w + gap);
        return (
          <g key={i}>
            <rect x={x} y={34} width={w} height={40} rx={8} fill={i === 0 ? 'var(--color-papier)' : 'var(--color-validation-clair)'} className="t-moyen" />
            <Etiquette x={x + w / 2} y={59} ancre="middle" taille={14} gras>
              {e}
            </Etiquette>
            {i < n - 1 ? (
              <g>
                <line x1={x + w + 4} y1={54} x2={x + w + gap - 6} y2={54} className="t-moyen" stroke="var(--color-encre)" />
                <polygon points={`${x + w + gap - 4},54 ${x + w + gap - 12},50 ${x + w + gap - 12},58`} fill="var(--color-encre)" />
                <Etiquette x={x + w + gap / 2} y={44} ancre="middle" taille={12} gras classe="encre">
                  {operations[i]}
                </Etiquette>
              </g>
            ) : null}
          </g>
        );
      })}
    </Figure>
  );
}

// ---------- Échelle logarithmique des forces (N0.3.7) ----------

export function EchelleForces({ reperes }: { reperes: Array<{ nom: string; kN: number }> }) {
  const x0 = 40;
  const lg = 540;
  const dMin = -1; // 0,1 kN
  const dMax = 4; // 10 000 kN
  const X = (kN: number) => x0 + ((Math.log10(kN) - dMin) / (dMax - dMin)) * lg;
  const y = 92;
  const tries = [...reperes].sort((a, b) => a.kN - b.kN);
  return (
    <Figure alt={`Échelle logarithmique des forces de 0,1 kN à 10 000 kN : ${tries.map((r) => `${r.nom} ${nombre(r.kN, r.kN < 10 ? 2 : 0)} kN`).join(', ')}.`} largeur={620} hauteur={190}>
      <line x1={x0} y1={y} x2={x0 + lg} y2={y} className="t-moyen" />
      {Array.from({ length: dMax - dMin + 1 }, (_, i) => dMin + i).map((d) => (
        <g key={d}>
          <line x1={X(10 ** d)} y1={y - 5} x2={X(10 ** d)} y2={y + 5} className="t-moyen" />
          <Etiquette x={X(10 ** d)} y={y + 20} ancre="middle" taille={10.5}>
            {nombre(10 ** d, d < 0 ? 1 : 0)} kN
          </Etiquette>
        </g>
      ))}
      {tries.map((r, i) => {
        const haut = i % 2 === 0;
        const yl = haut ? y - 26 - (i % 4 === 0 ? 0 : 20) : y + 42 + (i % 4 === 1 ? 0 : 22);
        return (
          <g key={r.nom}>
            <circle cx={X(r.kN)} cy={y} r={4.5} fill="var(--color-encre)" />
            <line x1={X(r.kN)} y1={y} x2={X(r.kN)} y2={yl + (haut ? 6 : -12)} className="t-fin" />
            <Etiquette x={X(r.kN)} y={yl} ancre="middle" taille={11}>
              {r.nom} : {nombre(r.kN, r.kN < 10 ? 2 : 0)} kN
            </Etiquette>
          </g>
        );
      })}
      <Etiquette x={x0 + lg} y={184} ancre="end" taille={10.5} classe="etiquette">
        échelle logarithmique : chaque graduation multiplie par 10
      </Etiquette>
    </Figure>
  );
}
