// Schémas du module L1.5 (chimie des matériaux). Les valeurs viennent de lib/calc/chimie.ts.
// Code couleur : acides et dégradations en rouge, bases et protections en vert, ions et électrons en bleu, rouille en terre.
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Axes, Courbe, Droite, PointGraphe, repere2D } from '@/components/drawing/Graphe';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { cadreIsoDirect } from '@/components/drawing/Iso3D';
import { Calque } from '@/components/gabarits/Vue3D';
import {
  DOSAGES_CIMENTERIE,
  ECHELLE_PH,
  PH_DEPASSIVATION,
  PH_PASSIVATION,
  RAPPORT_VOLUME_ROUILLE,
  TEMPERATURES_CUISSON,
  type Critere,
  type Espece,
  type LigneMasse,
  type Reaction,
} from '@/lib/calc/chimie';
import type { Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { nombre, nombreCourt } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const nc = (x: number) => nombreCourt(x, 2);
const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const TERRE = 'var(--color-terre)';
const BRIQUE = 'var(--color-brique)';
const ACIER = 'var(--color-acier)';

/** Formule chimique avec ses indices en petits caractères (SVG) : « CaCO3 » → CaCO₃. */
export function formuleUnicode(f: string): string {
  const ind = '₀₁₂₃₄₅₆₇₈₉';
  return f.replace('·0.5', '·½').replace(/(?<=[A-Za-z)])(\d+)/g, (m) => m.replace(/\d/g, (c) => ind[Number(c)]!));
}

/** Membre d'équation : « 2 Ca₃SiO₅ + 7 H₂O » (coefficient 1 omis). */
const membre = (es: readonly Espece[]) => es.map((e) => `${e.coef === 1 ? '' : `${nombreCourt(e.coef, 3)} `}${formuleUnicode(e.formule)}`).join(' + ');

/** Équation d'une réaction, écrite avec ses coefficients et ses indices. */
export const equationTexte = (r: Reaction) => `${membre(r.reactifs)} → ${membre(r.produits)}`;

// ---------- L1.5.1 : les liaisons ----------

/** Quatre types de liaisons et les propriétés qu'elles donnent aux matériaux. */
export function TypesLiaisons() {
  const col = [0, 155, 310, 465];
  const titres = ['1. ionique', '2. covalente', '3. métallique', '4. liaisons faibles'];
  const exemples = [
    ['sel, chaux, oxydes', 'dur, fragile, isolant'],
    ['silice, quartz, polymères', 'très dur, réfractaire'],
    ['acier, aluminium', 'ductile, conducteur'],
    ['feuillets d’argile, eau', 'tendre, sensible à l’eau'],
  ];
  const ion = (x: number, y: number, plus: boolean, k: string) => (
    <g key={k}>
      <circle cx={x} cy={y} r={plus ? 7 : 11} fill={plus ? 'var(--color-brique-clair)' : 'var(--color-acier-clair)'} stroke={plus ? BRIQUE : ACIER} strokeWidth={1.2} />
      <Etiquette x={x} y={y + 4} ancre="middle" taille={10} gras>
        {plus ? '+' : '−'}
      </Etiquette>
    </g>
  );
  const cx = (i: number) => col[i]! + 77;
  const O = (x: number, y: number, k: string) => (
    <g key={k}>
      <circle cx={x} cy={y} r={9} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.2} />
      <Etiquette x={x} y={y + 4} ancre="middle" taille={9.5} gras>
        O
      </Etiquette>
    </g>
  );
  const si1 = [cx(1) - 32, 105] as const;
  const si2 = [cx(1) + 34, 105] as const;
  const oxy1 = [[si1[0], 64], [si1[0] - 38, 105], [si1[0], 146]] as const;
  const oxy2 = [[si2[0], 64], [si2[0] + 38, 105], [si2[0], 146]] as const;
  const pont = [(si1[0] + si2[0]) / 2, 105] as const;
  return (
    <Figure alt="Quatre familles de liaisons : ionique (sel, oxydes), covalente (silice), métallique (acier), faibles (entre feuillets d'argile) ; chacune donne des propriétés différentes" largeur={620} hauteur={250}>
      {titres.map((t, i) => (
        <Etiquette key={t} x={cx(i)} y={22} ancre="middle" taille={12.5} gras>
          {t}
        </Etiquette>
      ))}
      {[0, 1, 2, 3].flatMap((i) => [0, 1, 2, 3].map((j) => ion(cx(0) - 45 + 30 * i, 62 + 28 * j, (i + j) % 2 === 1, `i${i}${j}`)))}
      {[...oxy1.map((o) => [si1, o] as const), ...oxy2.map((o) => [si2, o] as const), [si1, pont] as const, [si2, pont] as const].map(([a, b], k) => (
        <line key={`l${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--trait)" strokeWidth={2} />
      ))}
      {[...oxy1, ...oxy2, pont].map((o, k) => O(o[0], o[1], `o${k}`))}
      {[si1, si2].map((s, k) => (
        <g key={`s${k}`}>
          <circle cx={s[0]} cy={s[1]} r={11} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
          <Etiquette x={s[0]} y={s[1] + 4} ancre="middle" taille={10} gras>
            Si
          </Etiquette>
        </g>
      ))}
      {[0, 1, 2, 3].flatMap((i) => [0, 1, 2].map((j) => ion(cx(2) - 45 + 30 * i, 70 + 34 * j, true, `m${i}${j}`)))}
      {Array.from({ length: 16 }, (_, k) => (
        <circle key={`e${k}`} cx={cx(2) - 55 + ((k * 37) % 110)} cy={58 + ((k * 23) % 90)} r={2.4} fill={BLEU} />
      ))}
      <Etiquette x={cx(2)} y={176} ancre="middle" taille={10.5} couleur={BLEU}>
        nuage d’électrons libres
      </Etiquette>
      {[60, 105, 150].map((y) => (
        <rect key={`f${y}`} x={cx(3) - 58} y={y} width={116} height={10} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.2} />
      ))}
      {[82, 127].flatMap((y) =>
        [-36, 0, 36].map((dx) => (
          <g key={`w${y}${dx}`}>
            <line x1={cx(3) + dx} y1={y - 12} x2={cx(3) + dx} y2={y - 6} stroke={BLEU} strokeWidth={1} strokeDasharray="2 2" />
            <circle cx={cx(3) + dx} cy={y} r={4.5} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1} />
            <circle cx={cx(3) + dx - 6} cy={y + 4} r={2.4} fill={BLEU} />
            <circle cx={cx(3) + dx + 6} cy={y + 4} r={2.4} fill={BLEU} />
            <line x1={cx(3) + dx} y1={y + 6} x2={cx(3) + dx} y2={y + 12} stroke={BLEU} strokeWidth={1} strokeDasharray="2 2" />
          </g>
        )),
      )}
      {exemples.map(([a, b], i) => (
        <g key={`x${i}`}>
          <Etiquette x={cx(i)} y={205} ancre="middle" taille={11}>
            {a}
          </Etiquette>
          <Etiquette x={cx(i)} y={224} ancre="middle" taille={11.5} gras couleur={i === 2 ? VERT : i === 3 ? BRIQUE : BLEU}>
            {b}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

// ---------- L1.5.2 : conservation de la masse ----------

/** Bilan matière d'une réaction : masses des réactifs et des produits empilées, de même hauteur totale. */
export function BilanMasseReaction({ lignes, unite = 'kg' }: { lignes: readonly LigneMasse[]; unite?: string }) {
  const reactifs = lignes.filter((l) => l.cote === 'réactif');
  const produits = lignes.filter((l) => l.cote === 'produit');
  const total = reactifs.reduce((s, l) => s + l.m, 0);
  const k = 160 / (total || 1);
  const fonds = ['var(--color-terre-clair)', 'var(--color-encre-clair)', 'var(--color-brique-clair)', 'var(--color-beton-clair)'];
  const pile = (ls: readonly LigneMasse[], x: number, droite: boolean) => {
    let y = 190;
    return ls.map((l, i) => {
      const h = l.m * k;
      y -= h;
      return (
        <g key={`${l.formule}${i}`}>
          <rect x={x} y={y} width={80} height={h} fill={fonds[(i + (droite ? 2 : 0)) % 4]} stroke="var(--trait)" strokeWidth={1.2} />
          <Etiquette x={droite ? x + 90 : x - 10} y={y + h / 2 + 4} ancre={droite ? 'start' : 'end'} taille={12}>
            {formuleUnicode(l.formule)} : <tspan fontWeight={700}>{nombre(l.m, 1)} {unite}</tspan>
          </Etiquette>
        </g>
      );
    });
  };
  return (
    <Figure alt={`Bilan matière : ${reactifs.map((l) => `${l.formule} ${n1(l.m)} ${unite}`).join(' + ')} donnent ${produits.map((l) => `${l.formule} ${n1(l.m)} ${unite}`).join(' + ')}`} largeur={620} hauteur={230}>
      <Etiquette x={210} y={20} ancre="middle" taille={12.5} gras>
        réactifs
      </Etiquette>
      <Etiquette x={410} y={20} ancre="middle" taille={12.5} gras>
        produits
      </Etiquette>
      {pile(reactifs, 170, false)}
      {pile(produits, 370, true)}
      <Fleche x1={262} y1={110} x2={358} y2={110} couleur="var(--trait)" epaisseur={2} tete={10} />
      <Etiquette x={310} y={215} ancre="middle" taille={12} gras couleur={VERT}>
        {nombre(total, 1)} {unite} = {nombre(produits.reduce((s, l) => s + l.m, 0), 1)} {unite} : rien ne se perd
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.3 : l'échelle de pH ----------

/**
 * Échelle de pH avec des repères de matériaux et la zone où l'acier est protégé.
 * `marques` place des points calculés (fiche) ; `reperes` affiche ou masque les matériaux de référence.
 */
export function EchellePH({ marques = [], reperes = true, prefixe = 'ph' }: { marques?: ReadonlyArray<{ pH: number; texte: string }>; reperes?: boolean; prefixe?: string }) {
  const X = (p: number) => 40 + (p / 14) * 540;
  const liste = reperes ? [...ECHELLE_PH].sort((a, b) => a.pH - b.pH) : [];
  const yb = reperes ? 112 : 64; // haut de la barre
  const hb = 22;
  // repères alternés au-dessus (deux rangées) et au-dessous (deux rangées) de la barre
  const place = (i: number) => {
    const dessus = i % 2 === 0;
    const rang = Math.floor(i / 2) % 2;
    return dessus ? { y: rang === 0 ? yb - 10 : yb - 30, dessus } : { y: rang === 0 ? yb + hb + 20 : yb + hb + 38, dessus };
  };
  const yZones = reperes ? 202 : yb + hb + 70;
  const hauteur = yZones + 78;
  return (
    <Figure alt={`Échelle de pH de 0 à 14${liste.length ? ` : ${liste.map((r) => `${r.nom} ${n1(r.pH)}`).join(', ')}` : ''}${marques.length ? ` ; ${marques.map((m) => m.texte).join(', ')}` : ''}. L'acier est passivé au-dessus de pH ${PH_PASSIVATION} environ et peut rouiller en dessous de ${PH_DEPASSIVATION}`} largeur={620} hauteur={hauteur}>
      <defs>
        <linearGradient id={`${prefixe}-degrade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--color-correction)" />
          <stop offset="0.5" stopColor="var(--color-validation)" />
          <stop offset="1" stopColor="var(--color-encre)" />
        </linearGradient>
      </defs>
      <Etiquette x={40} y={22} taille={12.5} gras>
        pH à 25 °C : 7 neutre ; une unité de moins = 10 fois plus acide
      </Etiquette>
      {liste.map((r, i) => {
        const p = place(i);
        const ancre = r.pH < 1.5 ? 'start' : r.pH > 12.6 ? 'end' : 'middle';
        return (
          <g key={r.nom}>
            <line x1={X(r.pH)} y1={p.dessus ? p.y + 4 : yb + hb} x2={X(r.pH)} y2={p.dessus ? yb : p.y - 11} className="t-fin" />
            <circle cx={X(r.pH)} cy={p.dessus ? yb : yb + hb} r={2.5} fill="var(--trait)" />
            <Etiquette x={X(r.pH)} y={p.y} ancre={ancre} taille={10.5}>
              {r.nom} ({n1(r.pH)})
            </Etiquette>
          </g>
        );
      })}
      <rect x={X(0)} y={yb} width={X(14) - X(0)} height={hb} fill={`url(#${prefixe}-degrade)`} />
      {Array.from({ length: 15 }, (_, p) => (
        <text key={p} x={p === 0 ? X(0) + 3 : p === 14 ? X(14) - 3 : X(p)} y={yb + 15.5} textAnchor={p === 0 ? 'start' : p === 14 ? 'end' : 'middle'} fontSize={10.5} fontWeight={700} fill="var(--color-sur-couleur)">
          {p}
        </text>
      ))}
      {marques.map((m, i) => {
        const proche = i > 0 && Math.abs(X(m.pH) - X(marques[i - 1]!.pH)) < 90;
        const y = yb + hb + 32 + (proche && i % 2 ? 16 : 0);
        return (
          <g key={`m${i}`}>
            <polygon points={points([[X(m.pH), yb + hb + 2], [X(m.pH) - 7, yb + hb + 14], [X(m.pH) + 7, yb + hb + 14]])} fill={BLEU} />
            <Etiquette x={X(m.pH)} y={y} ancre="middle" taille={11.5} gras couleur={BLEU}>
              {m.texte}
            </Etiquette>
          </g>
        );
      })}
      {marques.length === 2 && !reperes ? (
        <>
          <Fleche x1={X(marques[0]!.pH)} y1={yb - 12} x2={X(marques[1]!.pH)} y2={yb - 12} couleur={BLEU} epaisseur={2} tete={9} />
          <Etiquette x={(X(marques[0]!.pH) + X(marques[1]!.pH)) / 2} y={yb - 20} ancre="middle" taille={11} couleur={BLEU}>
            neutralisation à la chaux
          </Etiquette>
        </>
      ) : null}
      <Etiquette x={X(1.5)} y={yZones} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        acide
      </Etiquette>
      <Etiquette x={X(7)} y={yZones} ancre="middle" taille={11.5} gras couleur={VERT}>
        neutre
      </Etiquette>
      <Etiquette x={X(12.5)} y={yZones} ancre="middle" taille={11.5} gras couleur={BLEU}>
        basique
      </Etiquette>
      <rect x={X(0)} y={yZones + 12} width={X(PH_DEPASSIVATION) - X(0)} height={12} fill="var(--color-correction-clair)" stroke={ROUGE} strokeWidth={1} />
      <rect x={X(PH_DEPASSIVATION)} y={yZones + 12} width={X(PH_PASSIVATION) - X(PH_DEPASSIVATION)} height={12} fill="var(--color-beton-clair)" stroke="var(--color-beton)" strokeWidth={1} />
      <rect x={X(PH_PASSIVATION)} y={yZones + 12} width={X(14) - X(PH_PASSIVATION)} height={12} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1} />
      <Etiquette x={X(PH_DEPASSIVATION / 2)} y={yZones + 40} ancre="middle" taille={11} couleur={ROUGE}>
        acier dans le béton : il peut rouiller
      </Etiquette>
      <Etiquette x={X((PH_DEPASSIVATION + PH_PASSIVATION) / 2)} y={yZones + 40} ancre="middle" taille={10.5}>
        transition
      </Etiquette>
      <Etiquette x={X((PH_PASSIVATION + 14) / 2)} y={yZones + 40} ancre="middle" taille={11} couleur={VERT}>
        acier passivé
      </Etiquette>
      <Etiquette x={X(0)} y={yZones + 64} taille={10.5} classe="etiquette">
        repères en ordres de grandeur : chaque eau, chaque sol, chaque béton se mesure
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.4 : du cru au ciment ----------

/** Filière du ciment Portland : cru, cuisson, clinker, broyage avec le gypse ; puis hydratation. */
export function FiliereCiment() {
  const boites = [
    { x: 10, l: 110, titre: 'cru broyé', lignes: [`calcaire ≈ ${DOSAGES_CIMENTERIE.calcaire} %`, `argile ≈ ${DOSAGES_CIMENTERIE.argile} %`] },
    { x: 160, l: 120, titre: 'four rotatif', lignes: [`≈ ${nombre(TEMPERATURES_CUISSON.clinker, 0)} °C`, 'CaCO₃ → CaO + CO₂'] },
    { x: 320, l: 110, titre: 'clinker', lignes: ['C₃S, C₂S', 'C₃A, C₄AF'] },
    { x: 470, l: 140, titre: 'ciment', lignes: [`clinker + gypse ≈ ${DOSAGES_CIMENTERIE.gypse} %`, 'broyés finement'] },
  ];
  return (
    <Figure alt={`Fabrication du ciment : cru (calcaire et argile) cuit vers ${TEMPERATURES_CUISSON.clinker} °C en clinker, broyé avec du gypse ; au gâchage, le ciment forme des C-S-H, de la portlandite et de l'ettringite`} largeur={620} hauteur={250}>
      {boites.map((b, i) => (
        <g key={b.titre}>
          <rect x={b.x} y={30} width={b.l} height={74} rx={6} fill={i === 1 ? 'var(--color-brique-clair)' : 'var(--color-beton-clair)'} stroke="var(--trait)" strokeWidth={1.4} />
          <Etiquette x={b.x + b.l / 2} y={50} ancre="middle" taille={12.5} gras>
            {b.titre}
          </Etiquette>
          {b.lignes.map((t, k) => (
            <Etiquette key={t} x={b.x + b.l / 2} y={70 + k * 17} ancre="middle" taille={11}>
              {t}
            </Etiquette>
          ))}
          {i < boites.length - 1 ? <Fleche x1={b.x + b.l + 4} y1={67} x2={boites[i + 1]!.x - 4} y2={67} couleur="var(--trait)" epaisseur={1.8} tete={8} /> : null}
        </g>
      ))}
      <Fleche x1={540} y1={108} x2={540} y2={140} couleur={BLEU} epaisseur={1.8} tete={8} texte="+ eau (gâchage)" tx={532} ty={128} ancre="end" />
      <rect x={20} y={146} width={580} height={88} rx={6} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.2} />
      <Etiquette x={34} y={166} taille={12.5} gras couleur={BLEU}>
        hydratation : le ciment réagit avec l’eau, il ne « sèche » pas
      </Etiquette>
      {[
        ['C-S-H', 'silicates de calcium hydratés : la « colle » qui donne la résistance'],
        ['portlandite Ca(OH)₂', 'réserve basique (pH ≈ 12,5 à 13) qui protège les aciers'],
        ['ettringite', 'formée tôt par le C₃A et le gypse : elle règle la prise'],
      ].map(([a, b], k) => (
        <g key={a}>
          <Etiquette x={34} y={188 + k * 17} taille={11.5} gras>
            {a}
          </Etiquette>
          <Etiquette x={190} y={188 + k * 17} taille={11.5}>
            {b}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

const COULEURS_PHASES = ['var(--color-encre-clair)', 'var(--color-brique-clair)', 'var(--color-terre-clair)', 'var(--color-acier-clair)', 'var(--color-beton-clair)'];

/** Composition potentielle du clinker (Bogue) en barre empilée, avec le rôle de chaque phase. */
export function PhasesClinker({ C3S, C2S, C3A, C4AF, CaSO4 }: { C3S: number; C2S: number; C3A: number; C4AF: number; CaSO4: number }) {
  const phases = [
    { id: 'C₃S', v: C3S, role: 'résistance dès les premiers jours' },
    { id: 'C₂S', v: C2S, role: 'résistance à long terme' },
    { id: 'C₃A', v: C3A, role: 'prise rapide, chaleur ; sensible aux sulfates' },
    { id: 'C₄AF', v: C4AF, role: 'peu réactif ; couleur grise' },
    { id: 'CaSO₄', v: CaSO4, role: 'sulfate de calcium (SO₃ du clinker)' },
  ];
  const k = 5.4;
  let x = 40;
  return (
    <Figure alt={`Composition potentielle du clinker : ${phases.map((p) => `${p.id} ${n1(p.v)} %`).join(', ')}`} largeur={620} hauteur={230}>
      <Etiquette x={40} y={22} taille={12.5} gras>
        composition potentielle du clinker (Bogue), en % de la masse
      </Etiquette>
      {phases.map((p, i) => {
        const l = Math.max(0, p.v) * k;
        const g = (
          <g key={p.id}>
            <rect x={x} y={40} width={l} height={36} fill={COULEURS_PHASES[i]} stroke="var(--trait)" strokeWidth={1} />
            {l > 46 ? (
              <Etiquette x={x + l / 2} y={63} ancre="middle" taille={11.5} gras>
                {p.id} {n1(p.v)}
              </Etiquette>
            ) : null}
          </g>
        );
        x += l;
        return g;
      })}
      <rect x={x} y={40} width={Math.max(0, 580 - x)} height={36} fill="var(--color-papier)" stroke="var(--trait)" strokeWidth={1} strokeDasharray="4 3" />
      <Etiquette x={x + Math.max(0, 580 - x) / 2} y={63} ancre="middle" taille={10.5}>
        {580 - x > 40 ? 'autres' : ''}
      </Etiquette>
      {phases.map((p, i) => (
        <g key={`l${p.id}`}>
          <rect x={40 + (i % 2) * 280} y={96 + Math.floor(i / 2) * 26} width={16} height={14} fill={COULEURS_PHASES[i]} stroke="var(--trait)" strokeWidth={1} />
          <Etiquette x={62 + (i % 2) * 280} y={108 + Math.floor(i / 2) * 26} taille={11.5}>
            <tspan fontWeight={700}>
              {p.id} {n1(p.v)} %
            </tspan>{' '}
            : {p.role}
          </Etiquette>
        </g>
      ))}
      <Etiquette x={40} y={190} taille={10.5} classe="etiquette">
        « autres » : magnésie, alcalis, chaux libre ; la composition réelle s’écarte un peu du calcul de Bogue
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.5 : les cycles de la chaux et du plâtre ----------

/** Cycle de la chaux (cuisson, extinction, carbonatation) et cycle du plâtre (cuisson, gâchage), avec les masses du calcul. */
export function CyclesLiants({ chaux, platre, prefixe = 'cy' }: { chaux: { caco3: number; caO: number; co2: number; eau: number; chauxEteinte: number }; platre: { gypse: number; platre: number; vapeur: number }; prefixe?: string }) {
  const c = [190, 150] as const;
  const R = 92;
  const pt = (deg: number) => [c[0] + R * Math.cos((deg * Math.PI) / 180), c[1] - R * Math.sin((deg * Math.PI) / 180)] as const;
  const noeuds = [
    { a: 90, f: 'CaCO₃', nom: 'calcaire', m: chaux.caco3 },
    { a: -30, f: 'CaO', nom: 'chaux vive', m: chaux.caO },
    { a: 210, f: 'Ca(OH)₂', nom: 'chaux éteinte', m: chaux.chauxEteinte },
  ];
  const arc = (a1: number, a2: number) => {
    const [x1, y1] = pt(a1);
    const [x2, y2] = pt(a2);
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };
  return (
    <Figure alt={`Cycle de la chaux : ${n2(chaux.caco3)} t de calcaire donnent ${n2(chaux.caO)} t de chaux vive et ${n2(chaux.co2)} t de CO₂ ; l'extinction consomme ${n2(chaux.eau)} t d'eau. Cycle du plâtre : ${nombre(platre.gypse, 0)} kg de gypse donnent ${nombre(platre.platre, 0)} kg de plâtre et ${nombre(platre.vapeur, 0)} kg de vapeur`} largeur={620} hauteur={290}>
      <defs>
        <marker id={`${prefixe}-pointe`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--trait)" />
        </marker>
      </defs>
      <Etiquette x={c[0]} y={18} ancre="middle" taille={12.5} gras>
        cycle de la chaux (masses en t)
      </Etiquette>
      <path d={arc(75, -15)} fill="none" stroke="var(--trait)" strokeWidth={1.8} markerEnd={`url(#${prefixe}-pointe)`} />
      <path d={arc(-45, -135)} fill="none" stroke="var(--trait)" strokeWidth={1.8} markerEnd={`url(#${prefixe}-pointe)`} />
      <path d={arc(195, 105)} fill="none" stroke="var(--trait)" strokeWidth={1.8} markerEnd={`url(#${prefixe}-pointe)`} />
      {noeuds.map((nd) => {
        const [x, y] = pt(nd.a);
        return (
          <g key={nd.f}>
            <ellipse cx={x} cy={y} rx={50} ry={24} fill="var(--color-beton-clair)" stroke="var(--trait)" strokeWidth={1.4} />
            <Etiquette x={x} y={y - 3} ancre="middle" taille={12} gras>
              {nd.f}
            </Etiquette>
            <Etiquette x={x} y={y + 13} ancre="middle" taille={10.5}>
              {nd.nom} · {n2(nd.m)}
            </Etiquette>
          </g>
        );
      })}
      <Etiquette x={pt(30)[0] + 26} y={pt(30)[1] - 4} taille={11} gras couleur={ROUGE}>
        cuisson ≈ {nombre(TEMPERATURES_CUISSON.chaux, 0)} °C
      </Etiquette>
      <Etiquette x={pt(30)[0] + 26} y={pt(30)[1] + 11} taille={11} couleur={ROUGE}>
        − CO₂ : {n2(chaux.co2)}
      </Etiquette>
      <Etiquette x={c[0]} y={c[1] + R + 22} ancre="middle" taille={11} gras couleur={BLEU}>
        extinction : + eau {n2(chaux.eau)}, chaleur
      </Etiquette>
      <Etiquette x={pt(150)[0] - 24} y={pt(150)[1] - 4} ancre="end" taille={11} gras couleur={VERT}>
        prise à l’air
      </Etiquette>
      <Etiquette x={pt(150)[0] - 24} y={pt(150)[1] + 11} ancre="end" taille={11} couleur={VERT}>
        + CO₂ de l’air
      </Etiquette>
      <line x1={392} y1={30} x2={392} y2={270} className="t-fin" strokeDasharray="4 4" />
      <Etiquette x={505} y={18} ancre="middle" taille={12.5} gras>
        cycle du plâtre (kg)
      </Etiquette>
      {[
        { y: 70, f: 'CaSO₄·2H₂O', nom: 'gypse', m: platre.gypse },
        { y: 220, f: 'CaSO₄·½H₂O', nom: 'plâtre', m: platre.platre },
      ].map((nd) => (
        <g key={nd.f}>
          <ellipse cx={505} cy={nd.y} rx={62} ry={24} fill="var(--color-beton-clair)" stroke="var(--trait)" strokeWidth={1.4} />
          <Etiquette x={505} y={nd.y - 3} ancre="middle" taille={12} gras>
            {nd.f}
          </Etiquette>
          <Etiquette x={505} y={nd.y + 13} ancre="middle" taille={10.5}>
            {nd.nom} · {nombre(nd.m, 0)}
          </Etiquette>
        </g>
      ))}
      <Fleche x1={480} y1={98} x2={480} y2={192} couleur={ROUGE} epaisseur={1.8} tete={9} />
      <Fleche x1={530} y1={192} x2={530} y2={98} couleur={BLEU} epaisseur={1.8} tete={9} />
      <Etiquette x={472} y={140} ancre="end" taille={11} gras couleur={ROUGE}>
        cuisson ≈ {nombre(TEMPERATURES_CUISSON.platre, 0)} °C
      </Etiquette>
      <Etiquette x={472} y={155} ancre="end" taille={11} couleur={ROUGE}>
        − vapeur {nombre(platre.vapeur, 0)}
      </Etiquette>
      <Etiquette x={538} y={140} taille={11} gras couleur={BLEU}>
        gâchage
      </Etiquette>
      <Etiquette x={538} y={155} taille={11} couleur={BLEU}>
        + eau {nombre(platre.vapeur, 0)}
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.6 : corrosion des aciers ----------

/** La pile de corrosion dans un béton armé : anode où le béton a perdu sa protection, cathode où arrive l'oxygène. */
export function PileCorrosion({ prefixe = 'pc' }: { prefixe?: string }) {
  const yb = 150;
  return (
    <Figure alt="Pile de corrosion dans le béton armé : à l'anode, le fer se dissout (Fe → Fe²⁺ + 2 e⁻) ; les électrons traversent l'acier jusqu'à la cathode où l'oxygène est réduit ; les ions circulent dans l'eau des pores ; la rouille gonfle et fissure l'enrobage" largeur={620} hauteur={300}>
      <Hachures prefixe={prefixe} types={['beton']} />
      <Etiquette x={600} y={22} ancre="end" taille={11} classe="etiquette">
        parement : air, humidité, CO₂, chlorures
      </Etiquette>
      <rect x={20} y={32} width={580} height={218} fill="var(--color-beton-clair)" className="t-moyen" />
      <rect x={20} y={32} width={250} height={150} fill="var(--color-correction-clair)" />
      <Etiquette x={30} y={52} taille={11.5} gras couleur={ROUGE}>
        béton carbonaté ou chloré
      </Etiquette>
      <Etiquette x={30} y={68} taille={11} couleur={ROUGE}>
        pH &lt; {PH_DEPASSIVATION} : acier non protégé
      </Etiquette>
      <rect x={40} y={yb - 9} width={540} height={18} fill="var(--color-acier-clair)" stroke={ACIER} strokeWidth={1.4} />
      <path d={`M 90 ${yb - 9} q 20 -16 45 -6 q 25 -14 50 -2 q 20 -10 40 2 L 225 ${yb - 9} Z`} fill={TERRE} />
      <polyline points={points([[200, yb - 22], [193, 112], [206, 96], [196, 82], [206, 60], [200, 32]])} fill="none" stroke="var(--trait)" strokeWidth={1.8} />
      <Etiquette x={212} y={96} taille={11} gras>
        fissure
      </Etiquette>
      <Etiquette x={232} y={yb - 18} taille={11} couleur={TERRE} gras>
        rouille : volume × {RAPPORT_VOLUME_ROUILLE.min} à {RAPPORT_VOLUME_ROUILLE.max}
      </Etiquette>
      <Fleche x1={250} y1={yb} x2={400} y2={yb} couleur={BLEU} epaisseur={2} tete={9} />
      <Etiquette x={325} y={yb + 26} ancre="middle" taille={11} gras couleur={BLEU}>
        e⁻ dans l’acier
      </Etiquette>
      {[430, 480, 530].map((x) => (
        <Fleche key={x} x1={x} y1={40} x2={x} y2={yb - 14} couleur={VERT} epaisseur={1.4} tete={7} pointilles />
      ))}
      <Etiquette x={540} y={96} taille={11.5} gras couleur={VERT}>
        O₂
      </Etiquette>
      <Etiquette x={130} y={yb + 46} ancre="middle" taille={12} gras couleur={ROUGE}>
        anode : Fe → Fe²⁺ + 2 e⁻
      </Etiquette>
      <Etiquette x={470} y={yb + 46} ancre="middle" taille={12} gras couleur={VERT}>
        cathode : O₂ + 2 H₂O + 4 e⁻ → 4 OH⁻
      </Etiquette>
      <Fleche x1={420} y1={yb + 70} x2={230} y2={yb + 70} couleur={BLEU} epaisseur={1.6} tete={8} pointilles />
      <Etiquette x={325} y={yb + 90} ancre="middle" taille={11} couleur={BLEU}>
        OH⁻ dans l’eau des pores (électrolyte)
      </Etiquette>
      <Etiquette x={20} y={284} taille={11} classe="etiquette">
        il faut à la fois de l’eau, de l’oxygène et un acier dépassivé : supprimer l’un des trois arrête la pile
      </Etiquette>
    </Figure>
  );
}

/** Section d'une barre avant et après corrosion uniforme, à l'échelle, et bilan des sections. */
export function PerteSectionBarre({ phi, phiRestant, A0, A1, perte }: { phi: number; phiRestant: number; A0: number; A1: number; perte: number }) {
  const k = 130 / phi;
  const c = [120, 115] as const;
  return (
    <Figure alt={`Barre de ${n1(phi)} mm : après corrosion, ${n2(phiRestant)} mm ; section ${n1(A0)} mm² ramenée à ${n1(A1)} mm², perte de ${n1(perte * 100)} %`} largeur={620} hauteur={230}>
      <circle cx={c[0]} cy={c[1]} r={(phi / 2) * k} fill={TERRE} opacity={0.85} />
      <circle cx={c[0]} cy={c[1]} r={(phiRestant / 2) * k} fill="var(--color-acier-clair)" stroke={ACIER} strokeWidth={1.4} />
      <circle cx={c[0]} cy={c[1]} r={(phi / 2) * k} fill="none" stroke="var(--trait)" strokeWidth={1} strokeDasharray="4 3" />
      <Cote x1={c[0] - (phi / 2) * k} y1={c[1] + (phi / 2) * k + 16} x2={c[0] + (phi / 2) * k} y2={c[1] + (phi / 2) * k + 16} decalage={-4} texte={`φ initial ${n1(phi)} mm`} />
      <Etiquette x={c[0]} y={c[1] + 4} ancre="middle" taille={12} gras>
        φ {n2(phiRestant)} mm
      </Etiquette>
      <Etiquette x={c[0]} y={22} ancre="middle" taille={11} couleur={TERRE} gras>
        couronne corrodée (en terre), dessinée à l’échelle
      </Etiquette>
      {[
        { t: 'section initiale', v: A0, couleur: 'var(--color-beton-clair)' },
        { t: 'section restante', v: A1, couleur: 'var(--color-acier-clair)' },
      ].map((b, i) => (
        <g key={b.t}>
          <rect x={290} y={50 + i * 44} width={(b.v / A0) * 280} height={26} fill={b.couleur} stroke="var(--trait)" strokeWidth={1} />
          <Etiquette x={296} y={68 + i * 44} taille={11.5} gras>
            {b.t} : {n1(b.v)} mm²
          </Etiquette>
        </g>
      ))}
      <Etiquette x={290} y={160} taille={13} gras couleur={ROUGE}>
        perte de section : {n1(perte * 100)} %
      </Etiquette>
      <Etiquette x={290} y={182} taille={11} classe="etiquette">
        la rouille formée occupe {RAPPORT_VOLUME_ROUILLE.min} à {RAPPORT_VOLUME_ROUILLE.max} fois le volume
      </Etiquette>
      <Etiquette x={290} y={196} taille={11} classe="etiquette">
        d’acier perdu : elle fait éclater l’enrobage bien avant la rupture
      </Etiquette>
    </Figure>
  );
}

/** Angle de poteau en perspective, en calques : béton, armatures, front de carbonatation, corrosion de l'armature d'angle. */
export function PoteauCorrosionIso({ c = 0.045, front = 0.055 }: { c?: number; front?: number }) {
  const a = 0.3;
  const H = 0.8;
  const pts: Point3[] = [[0, 0, 0], [a, 0, 0], [0, a, 0], [a, a, 0], [0, 0, H], [a, a, H], [a, 0, H], [0, a, H], [a + 0.25, a + 0.1, H]];
  const { P, poly, hauteur } = cadreIsoDirect(pts, 620, 420, 40);
  const barres: Array<[number, number]> = [
    [c, c],
    [a - c, c],
    [c, a - c],
    [a - c, a - c],
  ];
  const r = 0.008;
  /** Contour fermé en chemin SVG (pour percer un trou avec la règle evenodd). */
  const chemin = (q: Point3[]) => `M ${q.map((p) => P(p).join(' ')).join(' L ')} Z`;
  const cercle =(x: number, y: number, rr: number, z = H) => poly(Array.from({ length: 24 }, (_, k) => [x + rr * Math.cos((k * Math.PI) / 12), y + rr * Math.sin((k * Math.PI) / 12), z] as Point3));
  const fissure = (fixe: 'x' | 'y', v: number) =>
    points(
      Array.from({ length: 9 }, (_, k) => {
        const z = H - k * 0.09;
        const d = (k % 2 ? 0.012 : -0.008) + v;
        return P(fixe === 'x' ? [a, d, z] : [d, a, z]);
      }),
    );
  return (
    <Figure alt={`Angle d'un poteau en béton armé, coupé en tête : enrobage ${nombre(c * 1000 - r * 1000, 0)} mm environ, front de carbonatation à ${nombre(front * 1000, 0)} mm des parements ; l'armature d'angle rouille et fissure l'enrobage`} largeur={620} hauteur={hauteur}>
      <Calque id="beton">
        <polygon points={poly([[a, 0, 0], [a, a, 0], [a, a, H], [a, 0, H]])} fill="var(--color-beton-clair)" className="t-moyen" />
        <polygon points={poly([[0, a, 0], [a, a, 0], [a, a, H], [0, a, H]])} fill="var(--fond-beton)" className="t-moyen" />
        <polygon points={poly([[0, 0, H], [a, 0, H], [a, a, H], [0, a, H]])} fill="var(--color-papier)" className="t-fort" />
        <Etiquette x={P([a, 0, H])[0] - 8} y={P([a, 0, H])[1] - 8} ancre="end" taille={11.5} gras>
          coupe en tête du poteau
        </Etiquette>
      </Calque>
      <Calque id="carbonatation">
        <path
          d={`${chemin([[0, 0, H], [a, 0, H], [a, a, H], [0, a, H]])} ${chemin([[front, front, H], [front, a - front, H], [a - front, a - front, H], [a - front, front, H]])}`}
          fill="var(--color-brique-clair)"
          fillRule="evenodd"
          opacity={0.9}
        />
        <polygon points={poly([[front, front, H], [a - front, front, H], [a - front, a - front, H], [front, a - front, H]])} fill="none" stroke={BRIQUE} strokeWidth={1.4} strokeDasharray="5 3" />
        <Etiquette x={P([a / 2, a, H])[0] + 30} y={P([a / 2, a, H])[1] + 22} taille={11.5} gras couleur={BRIQUE}>
          zone carbonatée (incolore à la phénolphtaléine)
        </Etiquette>
      </Calque>
      <Calque id="armatures">
        {barres.map(([x, y]) => (
          <g key={`${x}${y}`}>
            <polygon points={cercle(x, y, r)} fill={ACIER} />
            <line x1={P([x, y, H])[0]} y1={P([x, y, H])[1]} x2={P([x, y, 0])[0]} y2={P([x, y, 0])[1]} stroke={ACIER} strokeWidth={1} strokeDasharray="4 4" />
          </g>
        ))}
        <Etiquette x={P([c, c, H])[0]} y={P([c, c, H])[1] - 12} ancre="middle" taille={11} gras couleur={ACIER}>
          armatures
        </Etiquette>
      </Calque>
      <Calque id="corrosion">
        <polygon points={cercle(a - c, a - c, r * 2.2)} fill={TERRE} opacity={0.85} />
        <polygon points={cercle(a - c, a - c, r)} fill={ACIER} />
        <polyline points={fissure('x', a - c)} fill="none" stroke="var(--trait)" strokeWidth={1.6} />
        <polyline points={fissure('y', a - c)} fill="none" stroke="var(--trait)" strokeWidth={1.6} />
        <polygon points={poly([[a, a - c - 0.012, H - 0.12], [a, a - c + 0.012, H - 0.12], [a, a - c + 0.02, H - 0.55], [a, a - c - 0.004, H - 0.6]])} fill={TERRE} opacity={0.45} />
        <Etiquette x={P([a, a - c, H - 0.35])[0] + 18} y={P([a, a - c, H - 0.35])[1]} taille={11.5} gras couleur={TERRE}>
          fissure le long de l’armature, coulure de rouille
        </Etiquette>
      </Calque>
    </Figure>
  );
}

// ---------- L1.5.7 : carbonatation et autres agressions ----------

/** Progression du front de carbonatation x = K √t, comparée à l'enrobage : instant où les armatures sont atteintes. */
export function FrontCarbonatation({ K, c, age, x }: { K: number; c: number; age: number; x: number }) {
  const t1 = (c / K) ** 2;
  const tmax = Math.max(60, Math.ceil((Math.max(t1, age) * 1.3) / 10) * 10);
  const ymax = Math.max(c * 1.5, K * Math.sqrt(tmax) * 1.05);
  const R = repere2D({ x0: 70, y0: 30, l: 470, h: 170, xmin: 0, xmax: tmax, ymin: 0, ymax });
  const pas = tmax <= 60 ? 10 : tmax <= 120 ? 20 : 50;
  const gradX = Array.from({ length: Math.floor(tmax / pas) }, (_, i) => (i + 1) * pas);
  const pasY = ymax <= 30 ? 5 : ymax <= 60 ? 10 : 20;
  const gradY = Array.from({ length: Math.floor(ymax / pasY) }, (_, i) => (i + 1) * pasY);
  return (
    <Figure alt={`Front de carbonatation x = ${n2(K)} √t (mm, années) : mesure de ${n1(x)} mm à ${nombre(age, 0)} ans ; l'enrobage de ${n1(c)} mm est atteint vers ${nombre(t1, 0)} ans`} largeur={620} hauteur={250}>
      <Axes R={R} gradX={gradX} gradY={gradY} titreX="t (ans)" titreY="profondeur x (mm)" />
      <Courbe R={R} f={(t) => K * Math.sqrt(t)} de={0} a={tmax} couleur={BRIQUE} epaisseur={2.4} />
      <Droite R={R} x1={0} y1={c} m={0} de={0} a={tmax} couleur={ACIER} epaisseur={1.8} pointilles />
      <Etiquette x={R.X(0) + 8} y={R.Y(c) - 6} taille={11.5} gras couleur={ACIER}>
        enrobage c = {n1(c)} mm
      </Etiquette>
      <PointGraphe R={R} x={age} y={x} couleur={BLEU} texte={`mesure : ${n1(x)} mm à ${nombre(age, 0)} ans`} dx={8} dy={16} />
      {t1 <= tmax ? <PointGraphe R={R} x={t1} y={c} couleur={ROUGE} texte={`armatures atteintes vers ${nombre(t1, 0)} ans`} dx={-8} dy={-10} ancre="end" rappel /> : null}
      <Etiquette x={R.X(tmax * 0.55)} y={R.Y(K * Math.sqrt(tmax * 0.55)) + 18} taille={11.5} gras couleur={BRIQUE}>
        x = K √t, K = {n2(K)} mm/√an
      </Etiquette>
    </Figure>
  );
}

/** Trois agressions chimiques du béton et leur signature visible. */
export function TroisAgressions({ prefixe = 'ag' }: { prefixe?: string }) {
  const titres = ['1. carbonatation → corrosion', '2. attaque sulfatique', '3. alcali-réaction'];
  const x0 = [10, 215, 420];
  const reseau: Array<[number, number][]> = [
    [[440, 70], [470, 60], [500, 78], [530, 66], [585, 80]],
    [[452, 120], [480, 108], [515, 125], [548, 112], [590, 128]],
    [[436, 165], [470, 150], [505, 170], [540, 158], [588, 172]],
    [[470, 60], [480, 108], [470, 150]],
    [[530, 66], [515, 125], [505, 170]],
    [[500, 78], [515, 125]],
    [[548, 112], [540, 158]],
    [[452, 120], [436, 165]],
  ];
  return (
    <Figure alt="Trois agressions : la carbonatation fait rouiller les armatures et éclater l'enrobage ; les sulfates font gonfler et désagréger le béton ; l'alcali-réaction produit un gel qui fissure le béton en réseau" largeur={620} hauteur={250}>
      <Hachures prefixe={prefixe} types={['beton', 'terre']} />
      {titres.map((t, i) => (
        <Etiquette key={t} x={x0[i]! + 95} y={22} ancre="middle" taille={12} gras>
          {t}
        </Etiquette>
      ))}
      <rect x={20} y={40} width={170} height={150} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <rect x={20} y={40} width={170} height={36} fill="var(--color-brique-clair)" opacity={0.8} />
      <circle cx={70} cy={88} r={7} fill={ACIER} />
      <circle cx={140} cy={88} r={7} fill={ACIER} />
      <circle cx={70} cy={88} r={11} fill="none" stroke={TERRE} strokeWidth={3} />
      <polygon points={points([[50, 40], [95, 40], [84, 62], [58, 60]])} fill="var(--color-papier)" stroke="var(--trait)" strokeWidth={1.2} />
      <Etiquette x={100} y={56} taille={10.5}>
        éclat
      </Etiquette>
      <Etiquette x={105} y={210} ancre="middle" taille={11}>
        rouille, éclatement de l’enrobage
      </Etiquette>
      <rect x={225} y={110} width={170} height={80} fill={hachure(prefixe, 'terre')} className="t-fin" />
      <rect x={265} y={40} width={90} height={150} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <path d="M 265 130 q -10 10 -4 22 q -8 12 2 26 L 265 190 Z" fill="var(--color-papier)" stroke={ROUGE} strokeWidth={1.2} />
      <path d="M 355 128 q 10 12 4 24 q 8 12 -2 26 L 355 190 Z" fill="var(--color-papier)" stroke={ROUGE} strokeWidth={1.2} />
      {([[240, 160], [380, 160], [245, 185], [378, 186]] as Array<[number, number]>).map(([x, y], k) => (
        <Etiquette key={k} x={x} y={y} ancre="middle" taille={10} gras couleur={ROUGE}>
          SO₄²⁻
        </Etiquette>
      ))}
      <Etiquette x={310} y={210} ancre="middle" taille={11}>
        gonflement, désagrégation
      </Etiquette>
      <rect x={430} y={40} width={170} height={150} fill="var(--color-beton-clair)" className="t-moyen" />
      {reseau.map((l, k) => (
        <polyline key={k} points={points(l)} fill="none" stroke="var(--trait)" strokeWidth={1.3} />
      ))}
      {[[480, 108], [515, 125], [470, 150]].map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={4} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1} />
      ))}
      <Etiquette x={515} y={210} ancre="middle" taille={11}>
        fissures en réseau, gel aux lèvres
      </Etiquette>
      <Etiquette x={10} y={240} taille={10.5} classe="etiquette">
        en rouge clair : béton carbonaté ; en terre : sol chargé en sulfates ; en bleu : gel d’alcali-réaction
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.8 : polymères, bitumes, adjuvants ----------

/** Architecture des polymères et du bitume, et effet d'un superplastifiant sur les grains de ciment. */
export function StructuresOrganiques() {
  const titres = ['thermoplastique', 'thermodurcissable', 'bitume', 'superplastifiant'];
  const cx = (i: number) => 10 + i * 152 + 72;
  const vague = (x: number, y: number, l: number, k: string) => (
    <path key={k} d={`M ${x} ${y} q 10 -12 20 0${' t 20 0'.repeat(Math.max(0, Math.round(l / 20) - 1))}`} fill="none" stroke={BLEU} strokeWidth={2} />
  );
  const noeudsReseau: Array<[number, number]> = [
    [cx(1) - 50, 60], [cx(1) - 5, 52], [cx(1) + 45, 64], [cx(1) - 40, 105], [cx(1) + 5, 100], [cx(1) + 50, 110], [cx(1) - 50, 150], [cx(1), 148], [cx(1) + 42, 155],
  ];
  const liens: Array<[number, number]> = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 7], [5, 8], [6, 7], [7, 8], [0, 4], [4, 8]];
  return (
    <Figure alt="Polymères et bitume : chaînes séparées (thermoplastique), réseau réticulé (thermodurcissable), amas d'asphaltènes dans une huile (bitume), grains de ciment dispersés par un superplastifiant" largeur={620} hauteur={240}>
      {titres.map((t, i) => (
        <Etiquette key={t} x={cx(i)} y={22} ancre="middle" taille={12} gras>
          {i + 1}. {t}
        </Etiquette>
      ))}
      {[52, 78, 104, 130, 156].map((y, k) => vague(cx(0) - 62, y, 120, `v${k}`))}
      {liens.map(([a, b], k) => (
        <line key={`r${k}`} x1={noeudsReseau[a]![0]} y1={noeudsReseau[a]![1]} x2={noeudsReseau[b]![0]} y2={noeudsReseau[b]![1]} stroke={BRIQUE} strokeWidth={2} />
      ))}
      {noeudsReseau.map(([x, y], k) => (
        <circle key={`n${k}`} cx={x} cy={y} r={4} fill={BRIQUE} />
      ))}
      <rect x={cx(2) - 66} y={40} width={132} height={130} fill="var(--color-terre-clair)" opacity={0.7} />
      {[[cx(2) - 38, 70], [cx(2) + 24, 64], [cx(2) - 10, 112], [cx(2) + 38, 128], [cx(2) - 44, 150]].map(([x, y], k) => (
        <circle key={`a${k}`} cx={x} cy={y} r={11} fill="var(--trait)" opacity={0.85} />
      ))}
      {([[cx(3) - 36, 70], [cx(3) + 30, 72], [cx(3) - 30, 140], [cx(3) + 32, 138]] as Array<[number, number]>).map(([x, y], k) => (
        <g key={`g${k}`}>
          <circle cx={x} cy={y} r={14} fill="var(--color-beton-clair)" stroke="var(--trait)" strokeWidth={1.2} />
          {[0, 1, 2, 3, 4, 5].map((j) => {
            const t = (j * Math.PI) / 3;
            return <line key={j} x1={x + 14 * Math.cos(t)} y1={y + 14 * Math.sin(t)} x2={x + 22 * Math.cos(t)} y2={y + 22 * Math.sin(t)} stroke={VERT} strokeWidth={1.6} />;
          })}
        </g>
      ))}
      <Etiquette x={cx(3)} y={108} ancre="middle" taille={10.5} couleur={VERT}>
        les « peignes » écartent
      </Etiquette>
      {[
        ['chaînes libres : se ramollit', 'à la chaleur (PVC, PEHD)'],
        ['réseau réticulé : ne fond', 'plus (résines époxy)'],
        ['asphaltènes dans une huile :', 'visqueux à chaud, ferme à froid'],
        ['grains dispersés : moins', 'd’eau pour la même fluidité'],
      ].map(([a, b], i) => (
        <g key={`t${i}`}>
          <Etiquette x={cx(i)} y={198} ancre="middle" taille={11}>
            {a}
          </Etiquette>
          <Etiquette x={cx(i)} y={214} ancre="middle" taille={11}>
            {b}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Ce qu'apporte un adjuvant liquide : matière active et eau, à déduire de l'eau de gâchage. */
export function BilanAdjuvant({ masse, actif, eau, volume }: { masse: number; actif: number; eau: number; volume: number }) {
  const k = 420 / (masse || 1);
  return (
    <Figure alt={`Adjuvant : ${n2(masse)} kg par m³ (${n2(volume)} L), dont ${n2(actif)} kg de matière active et ${n2(eau)} kg d'eau`} largeur={620} hauteur={150}>
      <Etiquette x={40} y={28} taille={12.5} gras>
        adjuvant pour 1 m³ de béton : {n2(masse)} kg, soit {n2(volume)} L
      </Etiquette>
      <rect x={40} y={44} width={actif * k} height={40} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1.4} />
      <rect x={40 + actif * k} y={44} width={eau * k} height={40} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.4} />
      <Etiquette x={40 + (actif * k) / 2} y={69} ancre="middle" taille={11.5} gras couleur={VERT}>
        matière active {n2(actif)} kg
      </Etiquette>
      <Etiquette x={40 + actif * k + (eau * k) / 2} y={69} ancre="middle" taille={11.5} gras couleur={BLEU}>
        eau {n2(eau)} kg
      </Etiquette>
      <Etiquette x={40} y={116} taille={11.5}>
        l’eau de l’adjuvant compte dans l’eau de gâchage : on la retranche de l’eau ajoutée au malaxeur
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.9 : analyse d'une eau ----------

/** Limite d'un critère écrite en clair : « ≥ 4 », « ≤ 1 000 mg/L », « 6,5 à 8,5 ». */
export function texteLimite(c: Critere): string {
  const u = c.unite ? ` ${c.unite}` : '';
  if (c.min !== undefined && c.max !== undefined) return `${nc(c.min)} à ${nc(c.max)}${u}`;
  return c.min !== undefined ? `≥ ${nc(c.min)}${u}` : `≤ ${nc(c.max ?? 0)}${u}`;
}

/** Résultats d'une analyse d'eau face aux limites du gâchage et aux repères de l'eau de boisson. */
export function AnalyseEauSchema({ gachage, potable, titreGachage }: { gachage: readonly Critere[]; potable: readonly Critere[]; titreGachage: string }) {
  const ligne = (cr: Critere, y: number, k: string) => (
    <g key={k}>
      <circle cx={52} cy={y - 4} r={8} fill={cr.ok ? 'var(--color-validation-clair)' : 'var(--color-correction-clair)'} stroke={cr.ok ? VERT : ROUGE} strokeWidth={1.4} />
      <Etiquette x={52} y={y} ancre="middle" taille={11} gras couleur={cr.ok ? VERT : ROUGE}>
        {cr.ok ? '✓' : '✗'}
      </Etiquette>
      <Etiquette x={68} y={y} taille={11.5} gras>
        {cr.nom}
      </Etiquette>
      <Etiquette x={168} y={y} taille={11.5}>
        {nc(cr.valeur)}{cr.unite ? ` ${cr.unite}` : ''} (limite {texteLimite(cr)})
      </Etiquette>
      <Etiquette x={402} y={y} taille={10.5} classe="etiquette">
        {cr.nature.length > 34 ? `${cr.nature.slice(0, cr.nature.indexOf(' ', 28))}…` : cr.nature}
      </Etiquette>
    </g>
  );
  const h = 60 + (gachage.length + potable.length) * 22 + 40;
  return (
    <Figure alt={`Analyse d'eau : gâchage ${gachage.every((c) => c.ok) ? 'conforme' : 'non conforme'} (${gachage.map((c) => `${c.nom} ${c.ok ? 'conforme' : 'hors limite'}`).join(', ')}) ; eau de boisson ${potable.every((c) => c.ok) ? 'conforme' : 'non conforme'}`} largeur={620} hauteur={h}>
      <Etiquette x={40} y={24} taille={12.5} gras couleur={BLEU}>
        {titreGachage}
      </Etiquette>
      {gachage.map((c, i) => ligne(c, 48 + i * 22, `g${c.id}`))}
      <Etiquette x={40} y={58 + gachage.length * 22 + 6} taille={12.5} gras couleur={BLEU}>
        eau de boisson (repères de l’OMS)
      </Etiquette>
      {potable.map((c, i) => ligne(c, 82 + gachage.length * 22 + i * 22, `p${c.id}`))}
    </Figure>
  );
}

// ---------- L1.5.P : quatre dégradations à diagnostiquer ----------

/** Quatre dégradations observées sur des ouvrages, à relier à leur cause chimique. */
export function QuatreDegradations({ prefixe = 'dg' }: { prefixe?: string }) {
  const x0 = [8, 160, 312, 464];
  const titres = ['A. sous-face de balcon', 'B. pile de pont', 'C. pied de mur', 'D. regard d’égout'];
  return (
    <Figure alt="Quatre dégradations : A, éclats et coulures de rouille sous un balcon ; B, fissures en réseau sur une pile ; C, pied de mur gonflé et friable en terrain sulfaté ; D, béton rongé en voûte d'un regard d'égout" largeur={620} hauteur={230}>
      <Hachures prefixe={prefixe} types={['beton', 'terre']} />
      {titres.map((t, i) => (
        <Etiquette key={t} x={x0[i]! + 74} y={20} ancre="middle" taille={11.5} gras>
          {t}
        </Etiquette>
      ))}
      <rect x={14} y={60} width={136} height={34} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <polygon points={points([[40, 94], [72, 94], [66, 104], [44, 103]])} fill="var(--color-papier)" stroke="var(--trait)" strokeWidth={1} />
      <line x1={30} y1={88} x2={140} y2={88} stroke={ACIER} strokeWidth={3} />
      {[46, 96, 126].map((x) => (
        <path key={x} d={`M ${x} 94 q -3 18 2 34 q 2 12 -2 22`} fill="none" stroke={TERRE} strokeWidth={3} opacity={0.8} />
      ))}
      <rect x={196} y={36} width={80} height={140} fill="var(--color-beton-clair)" className="t-moyen" />
      {[[[198, 70], [218, 62], [238, 76], [258, 64], [274, 72]], [[200, 112], [222, 102], [244, 118], [262, 106], [276, 116]], [[198, 150], [220, 140], [242, 156], [264, 146], [276, 152]], [[218, 62], [222, 102], [220, 140]], [[258, 64], [262, 106], [264, 146]]].map((l, k) => (
        <polyline key={k} points={points(l as [number, number][])} fill="none" stroke="var(--trait)" strokeWidth={1.2} />
      ))}
      <rect x={318} y={120} width={140} height={56} fill={hachure(prefixe, 'terre')} className="t-fin" />
      <rect x={358} y={36} width={56} height={140} fill={hachure(prefixe, 'beton')} className="t-moyen" />
      <path d="M 358 112 q -10 12 -3 26 q -9 14 3 30 L 358 176 Z" fill="var(--color-papier)" stroke={ROUGE} strokeWidth={1.2} />
      {[[372, 104], [394, 98], [384, 92]].map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={2.5} fill="var(--color-papier)" stroke="var(--trait)" strokeWidth={0.8} />
      ))}
      <path d="M 478 176 L 478 90 A 66 66 0 0 1 610 90 L 610 176" fill="none" stroke="var(--trait)" strokeWidth={10} opacity={0.35} />
      <path d="M 488 176 L 488 92 A 56 56 0 0 1 600 92 L 600 176" fill="none" stroke="var(--trait)" strokeWidth={1.4} />
      <path d="M 500 70 q 20 -26 44 -30 q 26 4 44 30" fill="none" stroke={ROUGE} strokeWidth={4} opacity={0.6} />
      <rect x={488} y={150} width={112} height={26} fill="var(--color-encre-clair)" opacity={0.8} />
      <Etiquette x={544} y={168} ancre="middle" taille={10} couleur={BLEU}>
        effluent
      </Etiquette>
      {[
        ['éclats, armatures', 'visibles, coulures brunes'],
        ['fissures en réseau,', 'dépôts blanchâtres'],
        ['béton gonflé, friable', 'au contact du sol'],
        ['voûte rongée, béton', 'sableux au-dessus de l’eau'],
      ].map(([a, b], i) => (
        <g key={`d${i}`}>
          <Etiquette x={x0[i]! + 74} y={198} ancre="middle" taille={10.5}>
            {a}
          </Etiquette>
          <Etiquette x={x0[i]! + 74} y={213} ancre="middle" taille={10.5}>
            {b}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}
