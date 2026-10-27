// Schémas de compréhension du module L1.5 (chimie des matériaux), leçons 6 à 9, mini-projet et examen :
// corrosion, agressions du béton, polymères et adjuvants, chimie de l'eau. Valeurs par les props (lib/calc/chimie.ts).
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { profondeurCarbonatation } from '@/lib/calc/chimie';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const ROUGE = 'var(--color-correction)';
const BLEU = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const BRIQUE = 'var(--color-brique)';
const TERRE = 'var(--color-terre)';
const TRAIT = 'var(--trait)';
const GRIS = 'var(--color-beton)';
const ROUILLE = '#b5652b';

function alea(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// ---------- L1.5.6 : corrosion des aciers ----------

/** Un clou dehors rouille ; le même clou dans un béton sain reste brillant, protégé par une couche passive. */
export function ClouDehorsDedans() {
  return (
    <Figure alt="À gauche, un clou laissé dehors : il se couvre de rouille en quelques semaines. À droite, le même clou enfermé dans un béton sain : l'eau des pores, très basique, recouvre l'acier d'une couche d'oxyde très mince et étanche, la couche passive ; il reste brillant pendant des dizaines d'années." largeur={620} hauteur={190}>
      <rect x={60} y={80} width={190} height={14} rx={3} fill={ROUILLE} />
      <polygon points={points([[250, 80], [272, 87], [250, 94]])} fill={ROUILLE} />
      <rect x={50} y={72} width={14} height={30} fill={ROUILLE} />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={70 + i * 18} cy={76 + (i % 2) * 22} r={3} fill="#8a4a1d" />
      ))}
      <Etiquette x={160} y={60} ancre="middle" taille={12} gras couleur={ROUILLE}>
        dehors : rouillé en quelques semaines
      </Etiquette>
      <rect x={340} y={40} width={240} height={100} fill="var(--color-beton-clair)" stroke={GRIS} />
      <rect x={380} y={83} width={170} height={14} rx={3} fill="var(--color-acier-clair)" stroke="var(--color-acier)" />
      <rect x={377} y={80} width={176} height={20} rx={5} fill="none" stroke={BLEU} strokeWidth={1.6} strokeDasharray="3 2" />
      <Etiquette x={460} y={124} ancre="middle" taille={11.5} gras couleur={BLEU}>
        couche passive (pH ≈ 13)
      </Etiquette>
      <Etiquette x={460} y={30} ancre="middle" taille={12} gras couleur={VERT}>
        dans un béton sain : intact
      </Etiquette>
      <Etiquette x={20} y={180} taille={11} classe="etiquette">
        le béton protège l’acier… tant qu’il reste sain, basique et assez épais autour de lui
      </Etiquette>
    </Figure>
  );
}

/** Corrosion uniforme (carbonatation), piqûre (chlorures), et gonflement de la rouille qui fissure l'enrobage. */
export function CorrosionFormes() {
  const w = 206;
  return (
    <Figure alt="Trois aspects de la corrosion. Uniforme : la barre perd une couronne régulière, cas de la carbonatation. Par piqûre : une perte très locale et profonde, cas des chlorures, la barre peut être percée. Gonflement : la rouille occupe plusieurs fois le volume du fer, pousse sur le béton, le fissure et fait éclater l'enrobage." largeur={620} hauteur={206}>
      <Etiquette x={103} y={22} ancre="middle" taille={12} gras>
        uniforme
      </Etiquette>
      <circle cx={103} cy={96} r={44} fill={ROUILLE} opacity={0.75} />
      <circle cx={103} cy={96} r={34} fill="var(--color-acier-clair)" stroke="var(--color-acier)" />
      <Etiquette x={103} y={170} ancre="middle" taille={11}>
        carbonatation : une couronne
      </Etiquette>
      <Etiquette x={103 + w} y={22} ancre="middle" taille={12} gras>
        piqûre
      </Etiquette>
      <circle cx={309} cy={96} r={44} fill="var(--color-acier-clair)" stroke="var(--color-acier)" />
      <path d="M296 54 q 13 30 26 0 Z" fill={ROUILLE} />
      <path d="M300 54 q 9 22 18 0" fill="var(--color-papier)" />
      <Etiquette x={309} y={170} ancre="middle" taille={11}>
        chlorures : un trou local
      </Etiquette>
      <Etiquette x={103 + 2 * w} y={22} ancre="middle" taille={12} gras>
        gonflement
      </Etiquette>
      <rect x={440} y={40} width={150} height={110} fill="var(--color-beton-clair)" stroke={GRIS} />
      <circle cx={480} cy={70} r={16} fill={ROUILLE} />
      <circle cx={480} cy={70} r={9} fill="var(--color-acier-clair)" stroke="var(--color-acier)" />
      <polyline points={points([[480, 54], [474, 46], [482, 40]])} fill="none" stroke={ROUGE} strokeWidth={2} />
      <polyline points={points([[464, 72], [452, 66], [440, 72]])} fill="none" stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={515} y={170} ancre="middle" taille={11}>
        la rouille gonfle : l’enrobage éclate
      </Etiquette>
    </Figure>
  );
}

/** Cuivre et acier en contact dans l'eau : l'acier se corrode ; un raccord isolant coupe la pile. */
export function CuivreAcier() {
  const tuyau = (y: number, isolant: boolean) => (
    <g>
      <rect x={60} y={y} width={220} height={22} fill="#e2a46a" stroke="#a5642a" />
      <Etiquette x={170} y={y + 16} ancre="middle" taille={11.5} gras>
        cuivre
      </Etiquette>
      {isolant ? <rect x={280} y={y - 4} width={24} height={30} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.6} /> : null}
      <rect x={isolant ? 304 : 280} y={y} width={220} height={22} fill="var(--color-acier-clair)" stroke="var(--color-acier)" />
      <Etiquette x={isolant ? 414 : 390} y={y + 16} ancre="middle" taille={11.5} gras>
        acier
      </Etiquette>
      {!isolant ? Array.from({ length: 5 }, (_, i) => <circle key={i} cx={290 + i * 9} cy={y + (i % 2 ? 3 : 19)} r={3.5} fill={ROUILLE} />) : null}
    </g>
  );
  return (
    <Figure alt="En haut, un tuyau en cuivre raccordé directement à un tuyau en acier, dans un milieu humide : ils forment une pile, l'acier se corrode près du raccord. En bas, un raccord isolant sépare les deux métaux : la pile est coupée." largeur={620} hauteur={170}>
      {tuyau(40, false)}
      <Etiquette x={540} y={56} taille={12} gras couleur={ROUGE}>
        ✗ l’acier rouille
      </Etiquette>
      {tuyau(110, true)}
      <Etiquette x={292} y={150} ancre="middle" taille={11} couleur={BLEU}>
        raccord isolant
      </Etiquette>
      <Etiquette x={540} y={126} taille={12} gras couleur={VERT}>
        ✓ pile coupée
      </Etiquette>
    </Figure>
  );
}

/** Tôle galvanisée : le zinc protège l'acier, même à une rayure, en se corrodant à sa place. */
export function TolesGalvanisees() {
  return (
    <Figure alt="Coupe d'une tôle galvanisée : une âme d'acier entre deux couches de zinc. À une rayure qui met l'acier à nu, c'est le zinc voisin qui se corrode à la place du fer : il le protège tant qu'il en reste, puis l'acier rouille à son tour, d'abord aux découpes et aux fixations." largeur={620} hauteur={190}>
      <rect x={60} y={80} width={500} height={30} fill="var(--color-acier-clair)" stroke="var(--color-acier)" />
      <rect x={60} y={70} width={230} height={10} fill="#b9c4cc" stroke={GRIS} />
      <rect x={330} y={70} width={230} height={10} fill="#b9c4cc" stroke={GRIS} />
      <rect x={60} y={110} width={500} height={10} fill="#b9c4cc" stroke={GRIS} />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={270 + i * 4 + (i > 2 ? 50 : 0)} cy={66 - (i % 2) * 4} r={3} fill="#f4f4f4" stroke={GRIS} />
      ))}
      <Etiquette x={310} y={28} ancre="middle" taille={11.5} gras couleur={BLEU}>
        le zinc voisin se dissout à la place du fer : il protège l’acier à nu
      </Etiquette>
      <Fleche x1={300} y1={36} x2={277} y2={56} couleur={GRIS} epaisseur={1.6} tete={7} />
      <Fleche x1={320} y1={36} x2={336} y2={56} couleur={GRIS} epaisseur={1.6} tete={7} />
      <Etiquette x={310} y={66} ancre="middle" taille={11} gras couleur={ROUGE}>
        rayure
      </Etiquette>
      <Etiquette x={74} y={100} taille={11.5} gras>
        acier
      </Etiquette>
      <Etiquette x={74} y={140} taille={11}>
        zinc (galvanisation)
      </Etiquette>
      <Etiquette x={20} y={176} taille={11} classe="etiquette">
        le zinc s’use vite aux découpes, aux trous de fixation et là où l’eau stagne : on y surveille la rouille
      </Etiquette>
    </Figure>
  );
}

/** Enrobage minimal de durabilité selon l'exposition : intérieur sec (XC1) et extérieur soumis à la pluie (XC4). */
export function EnrobagesExposition({ xc1, xc4 }: { xc1: number; xc4: number }) {
  const k = 3;
  const panneau = (x0: number, c: number, titre: string, pluie: boolean) => (
    <g>
      <rect x={x0} y={40} width={200} height={120} fill="var(--color-beton-clair)" stroke={GRIS} />
      <circle cx={x0 + 100} cy={40 + c * k + 12} r={12} fill="var(--color-acier-clair)" stroke="var(--color-acier)" />
      <line x1={x0 + 40} y1={40} x2={x0 + 40} y2={40 + c * k} stroke={BLEU} strokeWidth={2} />
      <line x1={x0 + 32} y1={40 + c * k} x2={x0 + 120} y2={40 + c * k} stroke={BLEU} strokeDasharray="3 3" />
      <Etiquette x={x0 + 46} y={40 + (c * k) / 2 + 4} taille={12} gras couleur={BLEU}>
        {nombre(c, 0)} mm
      </Etiquette>
      {pluie ? [30, 70, 110, 150].map((dx) => <line key={dx} x1={x0 + dx} y1={10} x2={x0 + dx - 6} y2={26} stroke={BLEU} strokeWidth={1.4} />) : null}
      <Etiquette x={x0 + 100} y={182} ancre="middle" taille={12} gras>
        {titre}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt={`Enrobage minimal de durabilité selon l'EN 1992-1-1, tableau 4.4N (classe structurale S4) : ${nombre(xc1, 0)} mm à l'intérieur sec (XC1), ${nombre(xc4, 0)} mm à l'extérieur soumis à la pluie (XC4). Plus le milieu est agressif, plus l'acier doit être loin de la surface.`} largeur={620} hauteur={196}>
      {panneau(60, xc1, 'XC1 : intérieur sec', false)}
      {panneau(360, xc4, 'XC4 : extérieur, pluie', true)}
      <Etiquette x={60} y={26} taille={11} classe="etiquette">
        cmin,dur : EN 1992-1-1, tableau 4.4N, classe S4
      </Etiquette>
    </Figure>
  );
}

/** Série galvanique qualitative dans l'eau de mer : au contact, le métal le plus actif se corrode et protège l'autre. */
export function SerieGalvanique() {
  const metaux = ['magnésium', 'zinc', 'aluminium', 'acier', 'plomb', 'cuivre', 'inox passif'];
  const x = (i: number) => 70 + i * 80;
  return (
    <Figure alt="Série galvanique dans l'eau de mer, du plus actif au plus noble : magnésium, zinc, aluminium, acier, plomb, cuivre, acier inoxydable passif. Quand deux métaux se touchent dans l'eau, le plus actif se corrode et protège l'autre : le zinc se sacrifie pour l'acier galvanisé ; l'acier, lui, rouille plus vite au contact du cuivre." largeur={620} hauteur={166}>
      <Fleche x1={40} y1={30} x2={580} y2={30} couleur={TRAIT} />
      <Etiquette x={40} y={20} taille={11.5} gras couleur={ROUGE}>
        plus actif : se corrode
      </Etiquette>
      <Etiquette x={580} y={20} ancre="end" taille={11.5} gras couleur={VERT}>
        plus noble : protégé
      </Etiquette>
      {metaux.map((m, i) => (
        <g key={m}>
          <rect x={x(i) - 37} y={56} width={74} height={28} rx={5} fill={m === 'acier' ? 'var(--color-acier-clair)' : 'var(--color-papier)'} stroke={m === 'acier' ? BLEU : GRIS} strokeWidth={m === 'acier' ? 2 : 1.2} />
          <Etiquette x={x(i)} y={74} ancre="middle" taille={11} gras={m === 'acier'}>
            {m}
          </Etiquette>
        </g>
      ))}
      <path d={`M${x(1)} 86 Q${(x(1) + x(3)) / 2} 128 ${x(3)} 86`} fill="none" stroke={VERT} strokeWidth={1.8} />
      <path d={`M${x(3)} 86 Q${(x(3) + x(5)) / 2} 128 ${x(5)} 86`} fill="none" stroke={ROUGE} strokeWidth={1.8} strokeDasharray="5 3" />
      <Etiquette x={(x(1) + x(3)) / 2} y={128} ancre="middle" taille={11.5} gras couleur={VERT}>
        zinc + acier : le zinc se sacrifie
      </Etiquette>
      <Etiquette x={(x(3) + x(5)) / 2} y={152} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        acier + cuivre : l'acier rouille plus vite
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.7 : agressions chimiques du béton ----------

/** Les agressions avancent depuis la surface, par les pores : CO₂, chlorures, sulfates, acides. */
export function AttaquesDepuisSurface() {
  return (
    <Figure alt="Coupe d'un élément en béton armé. Les agresseurs entrent par la surface et les pores : le CO₂ de l'air, les chlorures de la mer et du sel, les sulfates du sol, les acides des eaux agressives. Le cœur reste longtemps sain ; tout se joue sur les premiers centimètres, entre la surface et les armatures." largeur={620} hauteur={216}>
      <rect x={160} y={40} width={300} height={140} fill="var(--color-beton-clair)" stroke={GRIS} strokeWidth={1.4} />
      <rect x={160} y={40} width={300} height={140} fill="none" stroke={ROUGE} strokeWidth={22} opacity={0.12} />
      {[[190, 70], [430, 70], [190, 150], [430, 150]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={8} fill="var(--color-acier-clair)" stroke="var(--color-acier)" />
      ))}
      <Fleche x1={60} y1={70} x2={156} y2={70} couleur={GRIS} epaisseur={2.2} tete={8} />
      <Etiquette x={20} y={64} taille={12} gras couleur={GRIS}>
        CO₂ (air)
      </Etiquette>
      <Fleche x1={560} y1={70} x2={464} y2={70} couleur={BLEU} epaisseur={2.2} tete={8} />
      <Etiquette x={600} y={64} ancre="end" taille={12} gras couleur={BLEU}>
        Cl⁻ (mer, sel)
      </Etiquette>
      <Fleche x1={310} y1={210} x2={310} y2={184} couleur={TERRE} epaisseur={2.2} tete={8} />
      <Etiquette x={320} y={208} taille={12} gras couleur={TERRE}>
        SO₄²⁻ (sol)
      </Etiquette>
      <Fleche x1={560} y1={150} x2={464} y2={150} couleur={ROUGE} epaisseur={2.2} tete={8} />
      <Etiquette x={600} y={144} ancre="end" taille={12} gras couleur={ROUGE}>
        acides (eaux)
      </Etiquette>
      <Etiquette x={310} y={116} ancre="middle" taille={12} gras couleur={VERT}>
        cœur sain
      </Etiquette>
      <Etiquette x={310} y={30} ancre="middle" taille={11} classe="etiquette">
        rouge pâle : la zone attaquée, depuis la surface
      </Etiquette>
    </Figure>
  );
}

/** Front de carbonatation x = K √t et enrobages : le front atteint les armatures quand x = c, soit t = (c/K)². */
export function CourbeFront({ K, enrobages, mesure, tMax = 100 }: { K: number; enrobages: ReadonlyArray<{ c: number; t: number; nom?: string }>; mesure?: { age: number; x: number }; tMax?: number }) {
  const x0 = 70;
  const lg = 400;
  const yb = 190;
  const xMax = Math.max(profondeurCarbonatation(K, tMax), ...enrobages.map((e) => e.c)) * 1.1;
  const X = (t: number) => x0 + (t / tMax) * lg;
  const Y = (x: number) => yb - (x / xMax) * 160;
  const pts = Array.from({ length: 51 }, (_, i) => {
    const t = (i / 50) * tMax;
    return [X(t), Y(profondeurCarbonatation(K, t))] as const;
  });
  const couleurs = [ROUGE, BRIQUE, BLEU];
  return (
    <Figure alt={`Profondeur carbonatée x = K √t avec K = ${nombre(K, 2)} mm/√an : ${enrobages.map((e) => `le front atteint un enrobage de ${nombre(e.c, 0)} mm vers ${nombre(e.t, 0)} ans${e.nom ? ` (${e.nom})` : ''}`).join(' ; ')}.`} largeur={620} hauteur={230}>
      <line x1={x0} y1={yb} x2={x0 + lg} y2={yb} className="t-fin" />
      <line x1={x0} y1={yb} x2={x0} y2={20} className="t-fin" />
      <Etiquette x={x0 + lg + 8} y={yb + 4} taille={11}>
        âge (ans)
      </Etiquette>
      {enrobages.every((e) => e.t > tMax || Math.abs(X(e.t) - X(tMax)) > 40) ? (
        <Etiquette x={X(tMax)} y={yb + 18} ancre="middle" taille={11}>
          {nombre(tMax, 0)}
        </Etiquette>
      ) : null}
      <Etiquette x={x0 - 6} y={24} ancre="end" taille={11}>
        x (mm)
      </Etiquette>
      <polyline points={points(pts)} fill="none" stroke={GRIS} strokeWidth={2.6} />
      {enrobages.map((e, i) => (
        <g key={e.c}>
          <line x1={x0} y1={Y(e.c)} x2={x0 + lg} y2={Y(e.c)} stroke={couleurs[i % 3]} strokeDasharray="6 4" />
          <Etiquette x={x0 + lg + 6} y={Y(e.c) + 4} taille={11.5} gras couleur={couleurs[i % 3]}>
            c = {nombre(e.c, 0)} mm{e.nom ? ` (${e.nom})` : null}
          </Etiquette>
          {e.t <= tMax ? (
            <g>
              <circle cx={X(e.t)} cy={Y(e.c)} r={5} fill={couleurs[i % 3]} />
              <line x1={X(e.t)} y1={Y(e.c)} x2={X(e.t)} y2={yb} stroke={couleurs[i % 3]} strokeDasharray="3 3" />
              <Etiquette x={X(e.t)} y={yb + 18} ancre="middle" taille={11} gras couleur={couleurs[i % 3]}>
                {nombre(e.t, 0)} ans
              </Etiquette>
            </g>
          ) : null}
        </g>
      ))}
      {mesure ? (
        <g>
          <circle cx={X(mesure.age)} cy={Y(mesure.x)} r={5} fill="var(--color-papier)" stroke={TRAIT} strokeWidth={2} />
          <Etiquette x={X(mesure.age) + 10} y={Y(mesure.x) + 18} taille={11} gras>
            mesure : {nombre(mesure.x, 0)} mm à {nombre(mesure.age, 0)} ans
          </Etiquette>
        </g>
      ) : null}
      <Etiquette x={x0 + 10} y={Y(profondeurCarbonatation(K, tMax)) - 10} taille={11.5} gras couleur={GRIS}>
        x = K √t
      </Etiquette>
    </Figure>
  );
}

/** Efflorescences (sels en surface, souvent sans gravité) ou alcali-réaction (fissures en réseau, gel). */
export function EfflorescenceOuRAG() {
  return (
    <Figure alt="À gauche, des efflorescences : des traces blanches de sels qui sèchent à la surface du béton, en général sans gravité. À droite, une alcali-réaction : des fissures ouvertes en réseau, bordées d'un gel blanchâtre, sur une partie humide de l'ouvrage." largeur={620} hauteur={200}>
      <rect x={40} y={30} width={230} height={130} fill="var(--color-beton-clair)" stroke={GRIS} />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${60 + i * 30} 60 q 4 ${30 + (i % 3) * 10} -2 ${60 + (i % 2) * 20}`} fill="none" stroke="#fdfdfd" strokeWidth={6} opacity={0.95} />
      ))}
      <Etiquette x={155} y={182} ancre="middle" taille={12} gras couleur={VERT}>
        efflorescences : sels en surface
      </Etiquette>
      <rect x={350} y={30} width={230} height={130} fill="var(--color-beton-clair)" stroke={GRIS} />
      {[
        [[360, 60], [410, 70], [450, 50], [500, 74], [570, 60]],
        [[360, 110], [420, 100], [470, 126], [530, 104], [570, 120]],
        [[410, 30], [410, 70], [420, 100], [400, 160]],
        [[500, 30], [500, 74], [470, 126], [480, 160]],
      ].map((l, i) => (
        <polyline key={i} points={points(l as Array<[number, number]>)} fill="none" stroke={TRAIT} strokeWidth={2} />
      ))}
      {[
        [[360, 60], [410, 70], [450, 50], [500, 74], [570, 60]],
        [[360, 110], [420, 100], [470, 126], [530, 104], [570, 120]],
      ].map((l, i) => (
        <polyline key={`g${i}`} points={points(l as Array<[number, number]>)} fill="none" stroke="#fdfdfd" strokeWidth={6} opacity={0.6} />
      ))}
      <Etiquette x={465} y={182} ancre="middle" taille={12} gras couleur={ROUGE}>
        alcali-réaction : réseau ouvert, gel
      </Etiquette>
    </Figure>
  );
}

/** Dans un égout, l'hydrogène sulfuré devient acide sulfurique sur la voûte humide, qui est rongée au-dessus de l'eau. */
export function EgoutH2S() {
  return (
    <Figure alt="Coupe d'un collecteur d'eaux usées. Des bactéries transforment le soufre des eaux usées en hydrogène sulfuré, un gaz qui monte ; sur la voûte humide, d'autres bactéries le transforment en acide sulfurique, qui ronge le béton au-dessus de la ligne d'eau. Le radier, sous l'eau, reste sain." largeur={620} hauteur={230}>
      <circle cx={220} cy={115} r={90} fill="var(--color-beton-clair)" stroke={GRIS} strokeWidth={2} />
      <circle cx={220} cy={115} r={70} fill="var(--color-papier)" />
      <path d="M152 140 A 70 70 0 0 0 288 140 Z" fill="var(--color-encre-clair)" stroke={BLEU} />
      <path d="M160 82 A 70 70 0 0 1 280 82" fill="none" stroke={ROUGE} strokeWidth={10} opacity={0.5} />
      {[190, 220, 250].map((x) => (
        <Fleche key={x} x1={x} y1={136} x2={x} y2={70} couleur={TERRE} epaisseur={1.6} tete={7} pointilles />
      ))}
      <Etiquette x={220} y={160} ancre="middle" taille={11} couleur={BLEU}>
        eaux usées
      </Etiquette>
      <Etiquette x={330} y={60} taille={12} gras couleur={ROUGE}>
        voûte rongée : acide sulfurique
      </Etiquette>
      <Etiquette x={330} y={100} taille={12} gras couleur={TERRE}>
        H₂S monte (odeur d’œuf pourri)
      </Etiquette>
      <Etiquette x={330} y={150} taille={12} gras couleur={VERT}>
        radier sous l’eau : sain
      </Etiquette>
      <Etiquette x={20} y={222} taille={11} classe="etiquette">
        parades : ventilation, béton compact, ciment adapté, revêtement protecteur
      </Etiquette>
    </Figure>
  );
}

/** Alcali-réaction : il faut trois conditions à la fois ; en supprimer une suffit à l'éviter. */
export function TroisConditionsRAG() {
  const cercles = [
    { cx: 250, cy: 90, t: 'granulat réactif', c: TERRE },
    { cx: 350, cy: 90, t: 'alcalis du ciment', c: BLEU },
    { cx: 300, cy: 160, t: 'eau, humidité', c: VERT },
  ];
  return (
    <Figure alt="L'alcali-réaction demande trois conditions à la fois : un granulat réactif, assez d'alcalis apportés par le ciment, et de l'eau. Là où les trois se rencontrent, un gel se forme, absorbe l'eau et gonfle : fissures en réseau. Supprimer une seule condition suffit à l'éviter." largeur={620} hauteur={236}>
      {cercles.map((k) => (
        <circle key={k.t} cx={k.cx} cy={k.cy} r={72} fill={k.c} fillOpacity={0.14} stroke={k.c} strokeWidth={1.6} />
      ))}
      <Etiquette x={200} y={60} ancre="middle" taille={12} gras couleur={TERRE}>
        granulat réactif
      </Etiquette>
      <Etiquette x={400} y={60} ancre="middle" taille={12} gras couleur={BLEU}>
        alcalis (ciment)
      </Etiquette>
      <Etiquette x={300} y={214} ancre="middle" taille={12} gras couleur={VERT}>
        eau, humidité
      </Etiquette>
      <Etiquette x={300} y={118} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        gel
      </Etiquette>
      <Etiquette x={300} y={132} ancre="middle" taille={11} couleur={ROUGE}>
        gonflant
      </Etiquette>
      <Etiquette x={470} y={150} taille={11.5}>
        supprimer une
      </Etiquette>
      <Etiquette x={470} y={168} taille={11.5}>
        condition suffit
      </Etiquette>
    </Figure>
  );
}


// ---------- L1.5.8 : polymères, bitumes, adjuvants ----------

/** Le bitume selon la température : cassant à froid, ferme, puis mou et collant à chaud. */
export function BitumeTemperature() {
  const zones = [
    { x: 60, w: 160, titre: 'froid : cassant', c: BLEU, f: 'var(--color-encre-clair)' },
    { x: 220, w: 180, titre: 'tempéré : ferme, souple', c: VERT, f: 'var(--color-validation-clair)' },
    { x: 400, w: 160, titre: 'chaud : mou, il colle', c: ROUGE, f: 'var(--color-correction-clair)' },
  ];
  return (
    <Figure alt="Le comportement du bitume dépend fortement de la température : cassant au froid, ferme et souple aux températures moyennes, mou et collant par forte chaleur, où il flue sous les roues. Les polymères thermoplastiques réagissent de la même façon à la chaleur." largeur={620} hauteur={184}>
      {zones.map((z) => (
        <g key={z.titre}>
          <rect x={z.x} y={60} width={z.w} height={40} fill={z.f} stroke={z.c} strokeWidth={1.2} />
          <Etiquette x={z.x + z.w / 2} y={86} ancre="middle" taille={12} gras couleur={z.c}>
            {z.titre}
          </Etiquette>
        </g>
      ))}
      <Fleche x1={60} y1={134} x2={566} y2={134} couleur={TRAIT} epaisseur={1.8} tete={9} />
      <Etiquette x={566} y={152} ancre="end" taille={11.5}>
        température
      </Etiquette>
      <polyline points={points([[72, 60], [80, 70], [74, 80], [82, 100]])} fill="none" stroke={BLEU} strokeWidth={2} />
      <path d="M480 100 q 4 14 0 22 q -4 -8 0 -22" fill={ROUGE} opacity={0.6} />
      <Etiquette x={20} y={176} taille={11} classe="etiquette">
        on choisit un bitume adapté au climat : trop mou en climat chaud, il ressue et forme des ornières
      </Etiquette>
    </Figure>
  );
}

/** Le superplastifiant disperse les grains de ciment : l'eau piégée dans les amas est libérée, le béton coule avec moins d'eau. */
export function Defloculation() {
  return (
    <Figure alt="À gauche, sans adjuvant, les grains de ciment s'agglomèrent en amas qui piègent de l'eau : il faut beaucoup d'eau pour que le béton coule. À droite, avec un superplastifiant, les grains se repoussent et se dispersent : l'eau piégée est libérée, le béton devient fluide avec moins d'eau." largeur={620} hauteur={172}>
      <rect x={30} y={30} width={250} height={108} rx={6} fill="var(--color-encre-clair)" fillOpacity={0.35} stroke={GRIS} />
      {[[90, 66], [200, 100], [120, 112]].map(([cx, cy], k) => (
        <g key={k}>
          <circle cx={cx} cy={cy} r={22} fill={BLEU} opacity={0.25} />
          {Array.from({ length: 6 }, (_, i) => (
            <circle key={i} cx={cx! + 14 * Math.cos(i)} cy={cy! + 14 * Math.sin(i)} r={7} fill={GRIS} />
          ))}
        </g>
      ))}
      <Etiquette x={155} y={162} ancre="middle" taille={12} gras>
        sans adjuvant : amas, eau piégée
      </Etiquette>
      <rect x={340} y={30} width={250} height={108} rx={6} fill="var(--color-encre-clair)" fillOpacity={0.35} stroke={GRIS} />
      {Array.from({ length: 18 }, (_, i) => {
        const cx = 360 + (i % 6) * 40;
        const cy = 52 + Math.floor(i / 6) * 34;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={7} fill={GRIS} />
            <text x={cx + 9} y={cy - 6} fontSize={10} fontWeight={700} fill={VERT}>
              −
            </text>
          </g>
        );
      })}
      <Etiquette x={465} y={162} ancre="middle" taille={12} gras couleur={VERT}>
        superplastifiant : grains dispersés
      </Etiquette>
    </Figure>
  );
}

/** Bilan de l'eau avec un adjuvant liquide : eau totale = eau apportée par l'adjuvant + eau ajoutée au malaxeur. */
export function BilanEauAdjuvant({ total, adjuvant, malaxeur }: { total: number; adjuvant: number; malaxeur: number }) {
  const x0 = 60;
  const lg = 500;
  const k = lg / total;
  return (
    <Figure alt={`Eau totale du béton : ${nombre(total, 1)} L/m³, dont ${nombre(adjuvant, 2)} L apportés par l'adjuvant liquide ; il reste ${nombre(malaxeur, 1)} L à ajouter au malaxeur.`} largeur={620} hauteur={150}>
      <rect x={x0} y={50} width={malaxeur * k} height={40} fill={BLEU} fillOpacity={0.3} stroke={BLEU} />
      <rect x={x0 + malaxeur * k} y={50} width={adjuvant * k} height={40} fill={BRIQUE} fillOpacity={0.6} stroke={BRIQUE} />
      <Etiquette x={x0 + (malaxeur * k) / 2} y={76} ancre="middle" taille={12.5} gras couleur={BLEU}>
        au malaxeur : {nombre(malaxeur, 1)} L
      </Etiquette>
      <Fleche x1={x0 + lg - 4} y1={118} x2={x0 + lg - 4} y2={94} couleur={BRIQUE} epaisseur={1.6} tete={7} />
      <Etiquette x={x0 + lg} y={134} ancre="end" taille={12} gras couleur={BRIQUE}>
        apportée par l’adjuvant : {nombre(adjuvant, 2)} L
      </Etiquette>
      <Etiquette x={x0} y={36} taille={12} gras>
        eau totale du béton : {nombre(total, 1)} L/m³
      </Etiquette>
    </Figure>
  );
}

/** Une chaussée revêtue : le bitume de surface vieillit au soleil (oxydation) et se fissure. */
export function CoucheRoulement() {
  return (
    <Figure alt="Coupe d'une chaussée : une couche de roulement en enrobé, mélange de bitume et de granulats, sur une couche de base et le sol. Le soleil et l'air oxydent le bitume en surface : il durcit, devient cassant et se fissure ; l'eau entre alors dans la chaussée." largeur={620} hauteur={196}>
      <Hachures prefixe="crl" types={['gravier', 'terre']} />
      <rect x={40} y={70} width={540} height={26} fill="#3b3b3b" />
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={50 + alea(i) * 520} cy={76 + alea(i + 7) * 16} r={2.6} fill="#9a9a9a" />
      ))}
      <rect x={40} y={96} width={540} height={36} fill={hachure('crl', 'gravier')} stroke={GRIS} />
      <rect x={40} y={132} width={540} height={40} fill={hachure('crl', 'terre')} stroke="none" />
      {[150, 300, 450].map((x) => (
        <polyline key={x} points={points([[x, 70], [x + 4, 78], [x - 2, 86]])} fill="none" stroke="#f4f4f4" strokeWidth={1.6} />
      ))}
      <circle cx={540} cy={28} r={14} fill="#f5c542" stroke={TERRE} />
      {[480, 510].map((x) => (
        <Fleche key={x} x1={x} y1={28} x2={x - 30} y2={62} couleur={TERRE} epaisseur={1.4} tete={6} />
      ))}
      <Etiquette x={44} y={60} taille={11.5} gras>
        enrobé (bitume + granulats) : oxydé et fissuré en surface
      </Etiquette>
      <Etiquette x={52} y={120} taille={11.5} gras>
        couche de base
      </Etiquette>
      <Etiquette x={52} y={158} taille={11.5} gras>
        sol
      </Etiquette>
      <Etiquette x={40} y={190} taille={11} classe="etiquette">
        l’eau qui entre par les fissures affaiblit la base : un enduit d’entretien la protège
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.9 : chimie de l'eau ----------

/** Une eau limpide peut contenir beaucoup de sels dissous, invisibles à l'œil. */
export function EauClaireSels() {
  const ions = ['Cl⁻', 'Na⁺', 'SO₄²⁻', 'NO₃⁻', 'Ca²⁺', 'Cl⁻', 'Na⁺', 'Cl⁻', 'SO₄²⁻', 'Mg²⁺'];
  // Positions sur quatre rangées, toutes dans la loupe et sans chevauchement.
  const places = [[372, 62], [432, 62], [352, 92], [402, 92], [452, 92], [352, 122], [402, 122], [452, 122], [380, 152], [432, 152]] as const;
  return (
    <Figure alt="Un verre d'eau parfaitement limpide. À la loupe, on y trouverait des ions dissous, invisibles : chlorures, sodium, sulfates, nitrates, calcium. Une eau claire n'est pas une eau pure : seule l'analyse dit ce qu'elle contient." largeur={620} hauteur={210}>
      <path d="M120 40 l 14 140 h 92 l 14 -140 z" fill="var(--color-encre-clair)" fillOpacity={0.35} stroke={TRAIT} strokeWidth={1.6} />
      <line x1={124} y1={70} x2={236} y2={70} stroke={BLEU} strokeWidth={1} />
      <circle cx={420} cy={105} r={80} fill="var(--color-encre-clair)" fillOpacity={0.25} stroke={TRAIT} strokeWidth={3} />
      <line x1={477} y1={162} x2={530} y2={200} stroke={TRAIT} strokeWidth={8} strokeLinecap="round" />
      {ions.map((t, i) => (
        <text key={i} x={places[i]![0] + (alea(i) - 0.5) * 6} y={places[i]![1] + (alea(i + 20) - 0.5) * 6} fontSize={12} fontWeight={700} fill={t.includes('⁻') ? ROUGE : BLEU}>
          {t}
        </text>
      ))}
      <line x1={240} y1={110} x2={340} y2={105} stroke={GRIS} strokeDasharray="4 4" />
      <Etiquette x={180} y={200} ancre="middle" taille={12} gras>
        limpide…
      </Etiquette>
      <Etiquette x={420} y={30} ancre="middle" taille={12} gras couleur={ROUGE}>
        … mais chargée d’ions invisibles
      </Etiquette>
    </Figure>
  );
}

/** Eaux potables et eaux bonnes pour le béton : l'ensemble des eaux potables est inclus dans celui des eaux de gâchage. */
export function DeuxEnsemblesEau() {
  return (
    <Figure alt="Deux ensembles emboîtés. Les eaux potables sont toutes bonnes pour le béton (EN 1008). Mais une eau bonne pour le béton n'est pas forcément potable, par exemple une eau de puits chargée en nitrates. L'eau de mer n'est ni potable ni bonne pour un béton armé." largeur={620} hauteur={226}>
      <ellipse cx={270} cy={112} rx={230} ry={96} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1.6} />
      <ellipse cx={210} cy={120} rx={110} ry={56} fill="var(--color-encre-clair)" stroke={BLEU} strokeWidth={1.6} />
      <Etiquette x={270} y={36} ancre="middle" taille={12} gras couleur={VERT}>
        eaux bonnes pour le béton (EN 1008)
      </Etiquette>
      <Etiquette x={210} y={104} ancre="middle" taille={12} gras couleur={BLEU}>
        eaux potables
      </Etiquette>
      <circle cx={200} cy={134} r={6} fill={BLEU} />
      <Etiquette x={210} y={138} taille={11}>
        eau du réseau
      </Etiquette>
      <circle cx={400} cy={130} r={6} fill={VERT} />
      <Etiquette x={410} y={134} taille={11}>
        puits à nitrates
      </Etiquette>
      <circle cx={560} cy={190} r={6} fill={ROUGE} />
      <Etiquette x={600} y={180} ancre="end" taille={11} gras couleur={ROUGE}>
        eau de mer (béton armé)
      </Etiquette>
      <Etiquette x={20} y={220} taille={11} classe="etiquette">
        potable ⇒ bonne pour le béton · bonne pour le béton ⇏ potable
      </Etiquette>
    </Figure>
  );
}

/** Faire bouillir tue les microbes, mais ne retire pas les nitrates : ils se concentrent un peu. */
export function EbullitionConcentre() {
  const casserole = (x: number, niveau: number, microbes: boolean) => (
    <g>
      <path d={`M${x} 60 v90 q 0 10 10 10 h140 q 10 0 10 -10 v-90`} fill="none" stroke={TRAIT} strokeWidth={2} />
      <rect x={x + 2} y={niveau} width={156} height={158 - niveau} fill="var(--color-encre-clair)" fillOpacity={0.5} />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={x + 14 + alea(i) * 130} cy={niveau + 8 + alea(i + 9) * (150 - niveau - 16)} r={3} fill={BRIQUE} />
      ))}
      {microbes
        ? Array.from({ length: 6 }, (_, i) => (
            <path key={`m${i}`} d={`M${x + 20 + alea(i + 30) * 110} ${niveau + 14 + alea(i + 40) * 40} q 4 -6 8 0 q 4 6 8 0`} fill="none" stroke={VERT} strokeWidth={1.8} />
          ))
        : null}
    </g>
  );
  return (
    <Figure alt="À gauche, une eau avec des microbes, en vert, et des nitrates, en brique. À droite, après ébullition : les microbes sont tués, mais les nitrates sont toujours là, et même plus concentrés car une partie de l'eau s'est évaporée." largeur={620} hauteur={206}>
      {casserole(60, 80, true)}
      <Etiquette x={140} y={186} ancre="middle" taille={12} gras>
        avant : microbes + nitrates
      </Etiquette>
      <Fleche x1={240} y1={110} x2={330} y2={110} couleur={ROUGE} epaisseur={2.2} tete={9} />
      <Etiquette x={285} y={100} ancre="middle" taille={11} couleur={ROUGE}>
        ébullition
      </Etiquette>
      {casserole(360, 104, false)}
      <Etiquette x={440} y={186} ancre="middle" taille={12} gras couleur={ROUGE}>
        après : microbes tués, nitrates concentrés
      </Etiquette>
    </Figure>
  );
}

// ---------- L1.5.EX : examen ----------

/** Une pile de pont en milieu humide, avec des fissures en réseau et des dépôts blanchâtres (énoncé, sans réponse). */
export function FissuresReseauPile() {
  return (
    <Figure alt="Pile de pont en béton, en milieu humide : des fissures ouvertes, disposées en réseau, avec des dépôts blanchâtres dans les fissures." largeur={620} hauteur={190}>
      <rect x={240} y={20} width={140} height={150} fill="var(--color-beton-clair)" stroke={GRIS} />
      <rect x={180} y={10} width={260} height={14} fill="var(--color-beton-clair)" stroke={GRIS} />
      <rect x={60} y={150} width={500} height={30} fill="var(--color-encre-clair)" fillOpacity={0.6} />
      {[
        [[240, 60], [280, 72], [320, 54], [380, 70]],
        [[240, 110], [290, 100], [330, 124], [380, 108]],
        [[280, 20], [280, 72], [290, 100], [270, 150]],
        [[340, 20], [320, 54], [330, 124], [345, 150]],
      ].map((l, i) => (
        <g key={i}>
          <polyline points={points(l as Array<[number, number]>)} fill="none" stroke="#fdfdfd" strokeWidth={5} opacity={0.7} />
          <polyline points={points(l as Array<[number, number]>)} fill="none" stroke={TRAIT} strokeWidth={1.8} />
        </g>
      ))}
    </Figure>
  );
}
