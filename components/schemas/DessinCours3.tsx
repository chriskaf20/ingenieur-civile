// Schémas de compréhension du module L1.6 (dessin technique), leçons 5 à 8 : symboles, cotation, coupes, niveaux et axes.
// Les valeurs affichées viennent de lib/calc/dessin.ts et lib/calc/plans.ts, directement ou par les props.
import { BarreCoupe } from '@/components/drawing/Armatures';
import { Cote } from '@/components/drawing/Cote';
import { Fleche } from '@/components/drawing/Fleche';
import { Etiquette, Figure, Renvoi } from '@/components/drawing/Figure';
import { hachure, Hachures, type TypeHachure } from '@/components/drawing/Hachures';
import { cadrePerspective, DessinPrisme, facesExtrusion, facesVues, projecteur } from '@/components/drawing/Projections';
import { Axe, Niveau, RepereCoupe } from '@/components/drawing/Reperes';
import { niv } from '@/components/schemas/Logement';
import { chaineCotes, ecartFermeture, longueurPapier, type Point2 } from '@/lib/calc/dessin';
import { altitude, angleDePente, deniveleDePente, hauteurSousPlafond, nombreBarresReparties, niveauBrut, pente, positionsFiles, type DonneesNiveaux, type DonneesPlancher } from '@/lib/calc/plans';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

const BLEU = 'var(--color-encre)';
const ROUGE = 'var(--color-correction)';
const VERT = 'var(--color-validation)';
const n2 = (x: number) => nombre(x, 2);

// ---------- L1.6.5 : symboles ----------

/** Un panneau routier et des symboles de plan : un dessin, un sens, sans un mot. */
export function PanneauEtSymboles() {
  return (
    <Figure alt="À gauche, un panneau de sens interdit : un disque rouge barré de blanc, compris partout sans un mot. À droite, trois symboles de plan : une porte avec son arc d'ouverture, une fenêtre dans un mur, un poteau en béton armé hachuré. Chacun a un sens précis, comme le panneau." largeur={620} hauteur={170}>
      <Hachures prefixe="pes" types={['maconnerie', 'ba']} />
      <circle cx={100} cy={74} r={46} fill={ROUGE} />
      <rect x={68} y={66} width={64} height={16} fill="#ffffff" />
      <Etiquette x={100} y={150} ancre="middle" taille={11.5} gras>
        « interdit », sans un mot
      </Etiquette>
      <line x1={190} y1={20} x2={190} y2={140} className="t-fin" />
      <rect x={220} y={92} width={30} height={10} fill={hachure('pes', 'maconnerie')} className="t-fort" />
      <rect x={290} y={92} width={30} height={10} fill={hachure('pes', 'maconnerie')} className="t-fort" />
      <line x1={290} y1={92} x2={290} y2={52} className="t-moyen" />
      <path d="M290 52 A40 40 0 0 0 250 92" className="t-fin" />
      <rect x={350} y={92} width={30} height={10} fill={hachure('pes', 'maconnerie')} className="t-fort" />
      <rect x={430} y={92} width={30} height={10} fill={hachure('pes', 'maconnerie')} className="t-fort" />
      <path d="M380 92h50M380 97h50M380 102h50" className="t-fin" />
      <rect x={500} y={70} width={36} height={36} fill={hachure('pes', 'ba')} className="t-fort" />
      {['porte', 'fenêtre', 'poteau'].map((t, i) => (
        <Etiquette key={t} x={[270, 405, 518][i]!} y={128} ancre="middle" taille={11}>
          {t}
        </Etiquette>
      ))}
      <Etiquette x={405} y={150} ancre="middle" taille={11.5} gras>
        un symbole, un sens précis
      </Etiquette>
    </Figure>
  );
}

/** « 4 HA 12 » en coupe de poutre, « HA 8 e = 15 » en vue d'une dalle. */
export function ArmaturesNotation({ L = 1.2, e = 0.15 }: { L?: number; e?: number }) {
  const n = nombreBarresReparties(L, e);
  const k = 300;
  return (
    <Figure alt={`À gauche, la coupe d'une poutre : quatre barres de 12 mm en bas, un cadre autour, notées « 4 HA 12 ». À droite, une dalle vue de dessus : des barres de 8 mm tous les ${nombre(e * 100, 0)} cm, notées « HA 8 e = 15 » ; sur ${n2(L)} m, cela fait ${n} barres.`} largeur={620} hauteur={214}>
      <Hachures prefixe="an" types={['ba']} />
      <rect x={40} y={30} width={110} height={140} fill={hachure('an', 'ba')} className="t-fort" />
      <rect x={52} y={42} width={86} height={116} rx={4} fill="none" className="t-armature" />
      {[0, 1, 2, 3].map((i) => (
        <BarreCoupe key={i} cx={60 + i * 23.3} cy={150} r={5.2} />
      ))}
      <Renvoi de={[170, 186]} vers={[128, 152]} texte="4 HA 12 : 4 barres de 12 mm" />
      <Renvoi de={[170, 46]} vers={[138, 60]} texte="cadre" />
      <rect x={350} y={44} width={L * k * 0.62} height={140} fill="var(--color-beton-clair)" className="t-moyen" />
      {Array.from({ length: n }, (_, i) => (
        <line key={i} x1={350 + i * e * k * 0.62} y1={50} x2={350 + i * e * k * 0.62} y2={178} className="t-armature" />
      ))}
      <Cote x1={350} y1={44} x2={350 + e * k * 0.62} y2={44} decalage={12} texte={nombre(e * 100, 0)} taille={10.5} />
      <Cote x1={350} y1={184} x2={350 + L * k * 0.62} y2={184} decalage={-14} texte={n2(L)} />
      <Etiquette x={350 + L * k * 0.31} y={16} ancre="middle" taille={11.5} gras couleur={BLEU}>
        {`HA 8 e = 15 : une barre tous les ${nombre(e * 100, 0)} cm`}
      </Etiquette>
    </Figure>
  );
}

/** Trait interrompu (caché) et trait mixte (axe) : deux tirets qui ne disent pas la même chose. */
export function CacheOuAxe() {
  return (
    <Figure alt="À gauche, un poteau vu en élévation sur sa semelle enterrée : la semelle, cachée sous le sol, est dessinée en traits interrompus, des tirets réguliers. À droite, le même poteau avec son axe : un trait mixte, alternant tiret long et point. Ne pas confondre caché et axe." largeur={620} hauteur={200}>
      <Hachures prefixe="coa" types={['terre']} />
      {[0, 320].map((dx) => (
        <g key={dx}>
          <rect x={dx + 40} y={110} width={240} height={60} fill={hachure('coa', 'terre')} />
          <line x1={dx + 40} y1={110} x2={dx + 280} y2={110} className="t-fort" />
          <rect x={dx + 145} y={20} width={30} height={90} fill="var(--color-papier)" className="t-fort" />
        </g>
      ))}
      <path d="M145 110V140H115V160H205V140H175V110" className="t-cache" strokeWidth={1.2} />
      <line x1={480} y1={10} x2={480} y2={176} className="t-axe" strokeWidth={0.9} />
      <Etiquette x={160} y={190} ancre="middle" taille={11.5} gras>
        tirets : ce qui est caché
      </Etiquette>
      <Etiquette x={480} y={190} ancre="middle" taille={11.5} gras>
        tiret-point : un axe
      </Etiquette>
    </Figure>
  );
}

/** Une façade dessinée sur une feuille : longueur au papier et place restante. */
export function FacadeSurFeuille({ L, E, feuille = 297 }: { L: number; E: number; feuille?: number }) {
  const m = longueurPapier(L, E);
  const k = 1.8;
  return (
    <Figure alt={`Une façade de ${n2(L)} m dessinée au 1/${E} mesure ${nombre(m, 0)} mm ; la feuille A4 mesure ${feuille} mm de long : il reste ${nombre(feuille - m, 0)} mm pour les cotes et le cartouche.`} largeur={620} hauteur={196}>
      <rect x={40} y={20} width={feuille * k} height={140} fill="var(--color-papier)" className="t-moyen" />
      <rect x={40 + ((feuille - m) / 2) * k} y={46} width={m * k} height={56} fill="var(--color-encre-clair)" className="t-fort" />
      <Cote x1={40 + ((feuille - m) / 2) * k} y1={102} x2={40 + ((feuille + m) / 2) * k} y2={102} decalage={-24} texte={`${nombre(m, 0)} mm`} />
      <Cote x1={40} y1={160} x2={40 + feuille * k} y2={160} decalage={-18} texte={`${feuille} mm`} />
      <Etiquette x={40 + (feuille * k) / 2} y={38} ancre="middle" taille={11.5} gras couleur={BLEU}>
        {`façade au 1/${E}`}
      </Etiquette>
    </Figure>
  );
}

/** Le même mur dessiné grand et petit : la cote, elle, ne change pas. */
export function CoteResiste({ L = 3.6 }: { L?: number }) {
  return (
    <Figure alt={`Le même mur dessiné à deux tailles. Sur les deux dessins, la cote indique ${n2(L)} : elle donne la vraie longueur, quelle que soit la taille du dessin ou de l'impression.`} largeur={620} hauteur={150}>
      <Hachures prefixe="cr" types={['maconnerie']} />
      <rect x={40} y={50} width={300} height={22} fill={hachure('cr', 'maconnerie')} className="t-fort" />
      <Cote x1={40} y1={72} x2={340} y2={72} decalage={-24} texte={n2(L)} />
      <rect x={420} y={58} width={150} height={11} fill={hachure('cr', 'maconnerie')} className="t-fort" />
      <Cote x1={420} y1={69} x2={570} y2={69} decalage={-24} texte={n2(L)} />
      <Etiquette x={190} y={36} ancre="middle" taille={11.5} classe="etiquette">
        dessin au 1/50
      </Etiquette>
      <Etiquette x={495} y={36} ancre="middle" taille={11.5} classe="etiquette">
        même plan réduit
      </Etiquette>
      <Etiquette x={310} y={140} ancre="middle" taille={12} gras couleur={VERT}>
        la cote écrite ne change pas
      </Etiquette>
    </Figure>
  );
}

/** Les éléments d'une cote de bâtiment. */
export function AnatomieCote({ L = 3.6 }: { L?: number }) {
  return (
    <Figure alt={`Une cote de bâtiment : deux lignes d'attache prolongent les extrémités du mur, sans le toucher, et dépassent un peu la ligne de cote ; la ligne de cote, en trait fin, est terminée par deux petits traits obliques ; le chiffre, ${n2(L)}, est écrit au-dessus, au milieu. En mécanique, les extrémités sont des flèches.`} largeur={620} hauteur={200}>
      <Hachures prefixe="anc" types={['maconnerie']} />
      <rect x={180} y={40} width={260} height={24} fill={hachure('anc', 'maconnerie')} className="t-fort" />
      <Cote x1={180} y1={64} x2={440} y2={64} decalage={-46} texte={n2(L)} taille={13} />
      <Renvoi de={[40, 150]} vers={[179, 100]} texte="ligne d’attache" />
      <Renvoi de={[230, 170]} vers={[260, 111]} texte="ligne de cote (trait fin)" />
      <Renvoi de={[470, 150]} vers={[441, 112]} texte="extrémité oblique" />
      <Renvoi de={[470, 70]} vers={[330, 100]} texte="chiffre au-dessus, au milieu" />
      <line x1={20} y1={22} x2={130} y2={22} className="t-moyen" />
      <Cote x1={20} y1={22} x2={130} y2={22} decalage={-16} texte="1,20" extremite="fleche" />
      <Etiquette x={75} y={64} ancre="middle" taille={10.5} classe="etiquette">
        en mécanique : flèches
      </Etiquette>
    </Figure>
  );
}

/** Sens de lecture des cotes : on les lit d'en bas ou de la droite. */
export function SensLecture() {
  return (
    <Figure alt="Les cotes horizontales s'écrivent pour être lues d'en bas ; les cotes verticales pour être lues de la droite, le chiffre tourné d'un quart de tour. Ainsi, on lit tout le plan sans le retourner plus d'une fois." largeur={620} hauteur={210}>
      <rect x={170} y={40} width={240} height={120} fill="var(--color-beton-clair)" className="t-fort" />
      <Cote x1={170} y1={160} x2={410} y2={160} decalage={-20} texte="4,80" />
      <Cote x1={410} y1={160} x2={410} y2={40} decalage={-20} texte="2,40" />
      <Fleche x1={290} y1={205} x2={290} y2={188} couleur={BLEU} epaisseur={2} tete={8} />
      <Etiquette x={300} y={204} taille={11} couleur={BLEU}>
        lue d’en bas
      </Etiquette>
      <Fleche x1={480} y1={100} x2={446} y2={100} couleur={BLEU} epaisseur={2} tete={8} />
      <Etiquette x={486} y={104} taille={11} couleur={BLEU}>
        lue de la droite
      </Etiquette>
    </Figure>
  );
}

/** Façade cotée : segments nommés, chaîne de cotes, cotes cumulées facultatives, cote totale ; une cote peut être inconnue. */
export function FacadeCotee({
  partielles,
  noms,
  totale,
  inconnue,
  cumul = false,
  prefixe,
  alt,
}: {
  partielles: readonly number[];
  noms: readonly string[];
  totale: number;
  inconnue?: number;
  cumul?: boolean;
  prefixe: string;
  alt?: string;
}) {
  const c = chaineCotes(partielles);
  const somme = c.total;
  const k = 540 / Math.max(somme, totale);
  const x0 = 40;
  const y = 40;
  const X = (x: number) => x0 + x * k;
  const ecart = ecartFermeture(partielles, totale);
  return (
    <Figure
      alt={
        alt ??
        `Façade de ${n2(totale)} m cotée en chaîne : ${partielles.map((p, i) => `${noms[i]} ${i === inconnue ? '?' : n2(p)}`).join(', ')}.${cumul ? ` Cotes cumulées depuis l'origine : ${c.cumulees.map(n2).join(' ; ')}.` : ''}`
      }
      largeur={620}
      hauteur={cumul ? 178 : 150}
    >
      <Hachures prefixe={prefixe} types={['maconnerie']} />
      {partielles.map((p, i) => {
        const baie = !noms[i]!.startsWith('trumeau');
        return (
          <g key={i}>
            <rect x={X(c.cumulees[i]!)} y={y} width={p * k} height={24} fill={baie ? 'var(--fond-eau)' : hachure(prefixe, 'maconnerie')} className={baie ? 't-fin' : 't-fort'} />
            <Etiquette x={X(c.cumulees[i]! + p / 2)} y={y - 6} ancre="middle" taille={10} classe="etiquette">
              {noms[i]!}
            </Etiquette>
            <Cote x1={X(c.cumulees[i]!)} y1={y + 24} x2={X(c.cumulees[i + 1]!)} y2={y + 24} decalage={-18} texte={i === inconnue ? '?' : n2(p)} taille={10.5} />
          </g>
        );
      })}
      <Cote x1={X(0)} y1={y + 24} x2={X(totale)} y2={y + 24} decalage={-48} texte={n2(totale)} />
      {cumul ? (
        <g>
          <line x1={X(0)} y1={y + 120} x2={X(somme)} y2={y + 120} className="t-fin" />
          {c.cumulees.map((v, i) => (
            <g key={i}>
              <line x1={X(v)} y1={y + 114} x2={X(v)} y2={y + 126} className="t-moyen" />
              <Etiquette x={X(v) + 3} y={y + 110} taille={10} rotation={-40}>
                {n2(v)}
              </Etiquette>
            </g>
          ))}
          <circle cx={X(0)} cy={y + 120} r={3.5} fill="none" className="t-moyen" />
        </g>
      ) : null}
      {inconnue === undefined && Math.abs(ecart) > 0.0005 ? (
        <Etiquette x={X(totale) - 4} y={y + 98} ancre="end" taille={11.5} gras couleur={ROUGE}>
          {`somme ${n2(somme)} ≠ ${n2(totale)} : écart ${n2(ecart)} m`}
        </Etiquette>
      ) : null}
    </Figure>
  );
}

/** Trois façons de coter la même façade : en chaîne, en parallèle, en cotes cumulées. */
export function TroisModes({ partielles }: { partielles: readonly number[] }) {
  const c = chaineCotes(partielles);
  const k = 500 / c.total;
  const X = (x: number) => 60 + x * k;
  const bande = (y: number) => <rect x={X(0)} y={y} width={c.total * k} height={10} fill="var(--color-beton-clair)" className="t-moyen" />;
  return (
    <Figure alt={`La même façade cotée de trois façons. En chaîne : chaque cote part de la fin de la précédente (${partielles.map(n2).join(' + ')}). En parallèle : toutes les cotes partent de l'origine, sur des lignes superposées. En cotes cumulées : une seule ligne, l'origine marquée d'un petit cercle, les distances depuis l'origine écrites à chaque repère (${c.cumulees.map(n2).join(' ; ')}).`} largeur={620} hauteur={330}>
      <Etiquette x={10} y={22} taille={12} gras couleur={BLEU}>
        en chaîne
      </Etiquette>
      {bande(30)}
      {partielles.map((p, i) => (
        <Cote key={i} x1={X(c.cumulees[i]!)} y1={40} x2={X(c.cumulees[i + 1]!)} y2={40} decalage={-16} texte={n2(p)} taille={10} />
      ))}
      <Etiquette x={10} y={96} taille={12} gras couleur={BLEU}>
        en parallèle
      </Etiquette>
      {bande(104)}
      {c.cumulees.slice(1).map((v, i) => (
        <Cote key={i} x1={X(0)} y1={114} x2={X(v)} y2={114} decalage={-14 - i * 17} texte={n2(v)} taille={10} />
      ))}
      <Etiquette x={10} y={252} taille={12} gras couleur={BLEU}>
        en cotes cumulées
      </Etiquette>
      {bande(260)}
      <line x1={X(0)} y1={290} x2={X(c.total)} y2={290} className="t-fin" />
      {c.cumulees.map((v, i) => (
        <g key={i}>
          <line x1={X(v)} y1={270} x2={X(v)} y2={296} className="t-fin" />
          <Etiquette x={X(v) + 3} y={312} taille={10} rotation={-35}>
            {n2(v)}
          </Etiquette>
        </g>
      ))}
      <circle cx={X(0)} cy={290} r={3.5} fill="none" className="t-moyen" />
    </Figure>
  );
}

/** Façade en plan : trois lignes de cotes, baies, axes, hors tout. */
export function TroisLignesCotes() {
  const mur = 0.2;
  const baies = [
    [1.0, 1.2],
    [3.6, 0.9],
    [5.7, 1.2],
  ] as const;
  const L = 8.2;
  const files = [0.1, 4.1, 8.1];
  const k = 520 / L;
  const X = (x: number) => 50 + x * k;
  const yM = 40;
  const pleins: [number, number][] = [];
  let x = 0;
  for (const [d, l] of baies) {
    pleins.push([x, d]);
    x = d + l;
  }
  pleins.push([x, L]);
  const chaine = [0, ...baies.flatMap(([d, l]) => [d, d + l]), L];
  return (
    <Figure alt={`Un mur de façade de ${n2(L)} m vu en plan, avec trois lignes de cotes. Première ligne, la plus proche : les baies et les trumeaux. Deuxième ligne : les distances entre les axes des files A, B, C. Troisième ligne, la plus éloignée : la longueur hors tout. On va du détail vers l'ensemble, en s'éloignant du dessin.`} largeur={620} hauteur={220}>
      <Hachures prefixe="tlc" types={['maconnerie']} />
      {pleins.map(([a, b], i) => (
        <rect key={i} x={X(a)} y={yM} width={(b - a) * k} height={mur * k} fill={hachure('tlc', 'maconnerie')} className="t-fort" />
      ))}
      {baies.map(([d, l]) => (
        <path key={d} d={`M${X(d)} ${yM}h${l * k}M${X(d)} ${yM + (mur * k) / 2}h${l * k}M${X(d)} ${yM + mur * k}h${l * k}`} className="t-fin" />
      ))}
      {files.map((f, i) => (
        <Axe key={f} x1={X(f)} y1={yM + mur * k + 4} x2={X(f)} y2={yM - 26} repere={'ABC'[i]!} cote="fin" />
      ))}
      {chaine.slice(0, -1).map((a, i) => (
        <Cote key={`b${i}`} x1={X(a)} y1={yM + mur * k} x2={X(chaine[i + 1]!)} y2={yM + mur * k} decalage={-26} texte={n2(chaine[i + 1]! - a)} taille={10} />
      ))}
      {files.slice(0, -1).map((f, i) => (
        <Cote key={`a${i}`} x1={X(f)} y1={yM + mur * k} x2={X(files[i + 1]!)} y2={yM + mur * k} decalage={-66} texte={n2(files[i + 1]! - f)} taille={10.5} />
      ))}
      <Cote x1={X(0)} y1={yM + mur * k} x2={X(L)} y2={yM + mur * k} decalage={-106} texte={n2(L)} />
      <Etiquette x={X(L) + 8} y={yM + mur * k + 30} taille={10.5} couleur={BLEU}>
        1 : baies
      </Etiquette>
      <Etiquette x={X(L) + 8} y={yM + mur * k + 70} taille={10.5} couleur={BLEU}>
        2 : axes
      </Etiquette>
      <Etiquette x={X(L) + 8} y={yM + mur * k + 110} taille={10.5} couleur={BLEU}>
        3 : total
      </Etiquette>
    </Figure>
  );
}

/** Erreur : une cote surabondante qui contredit la chaîne. */
export function CoteSurabondante({ partielles, totale, autre }: { partielles: readonly number[]; totale: number; autre: number }) {
  const c = chaineCotes(partielles);
  const k = 480 / totale;
  const X = (x: number) => 60 + x * k;
  return (
    <Figure alt={`Une chaîne de cotes de ${n2(c.total)} m, une cote totale de ${n2(totale)} m, et une troisième cote de ${n2(autre)} m qui couvre la même longueur : elles ne disent pas la même chose. Laquelle croire ? Une dimension ne se cote qu'une fois.`} largeur={620} hauteur={190}>
      <rect x={X(0)} y={30} width={totale * k} height={14} fill="var(--color-beton-clair)" className="t-moyen" />
      {partielles.map((p, i) => (
        <Cote key={i} x1={X(c.cumulees[i]!)} y1={44} x2={X(c.cumulees[i + 1]!)} y2={44} decalage={-16} texte={n2(p)} taille={10} />
      ))}
      <Cote x1={X(0)} y1={44} x2={X(totale)} y2={44} decalage={-46} texte={n2(totale)} />
      <Cote x1={X(0)} y1={44} x2={X(totale)} y2={44} decalage={-82} texte={n2(autre)} />
      <Etiquette x={X(totale) + 8} y={130} taille={12} gras couleur={ROUGE}>
        ?
      </Etiquette>
      <Etiquette x={310} y={180} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        ✗ deux cotes pour une même longueur : laquelle croire ?
      </Etiquette>
    </Figure>
  );
}

/** Erreur : cotes croisées dans le dessin, ou cotes rangées dehors. */
export function CotesCroisees() {
  const piece = (x0: number) => <rect x={x0} y={30} width={200} height={110} fill="var(--color-beton-clair)" className="t-fort" />;
  return (
    <Figure alt="À gauche, des cotes placées dans le dessin et qui se croisent : on ne sait plus quel chiffre va avec quelle ligne. À droite, les mêmes cotes rangées à l'extérieur, alignées sur des lignes parallèles : la lecture est immédiate." largeur={620} hauteur={190}>
      {piece(40)}
      <Cote x1={40} y1={70} x2={240} y2={110} texte="4,00" />
      <Cote x1={90} y1={30} x2={90} y2={140} texte="2,20" />
      <Cote x1={60} y1={120} x2={200} y2={50} texte="1,80" />
      <Etiquette x={140} y={176} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        ✗ dans le dessin, croisées
      </Etiquette>
      {piece(360)}
      <Cote x1={360} y1={140} x2={560} y2={140} decalage={-16} texte="4,00" />
      <Cote x1={560} y1={140} x2={560} y2={30} decalage={-16} texte="2,20" />
      <Etiquette x={460} y={176} ancre="middle" taille={11.5} gras couleur={VERT}>
        ✓ dehors, alignées
      </Etiquette>
    </Figure>
  );
}

/** Erreur : confondre la cote d'axe en axe et la cote de nu à nu. */
export function AxeOuNu({ entraxe = 4.2, mur = 0.2 }: { entraxe?: number; mur?: number }) {
  const k = 110;
  const X = (x: number) => 80 + x * k;
  return (
    <Figure alt={`Deux murs de ${n2(mur)} m d'épaisseur, axés à ${n2(entraxe)} m. D'axe en axe : ${n2(entraxe)} m. De nu à nu, entre les faces intérieures : ${n2(entraxe - mur)} m. Prendre l'une pour l'autre décale tout de ${nombre(mur * 100, 0)} cm.`} largeur={620} hauteur={190}>
      <Hachures prefixe="aon" types={['maconnerie']} />
      <rect x={X(-mur / 2)} y={40} width={mur * k} height={90} fill={hachure('aon', 'maconnerie')} className="t-fort" />
      <rect x={X(entraxe - mur / 2)} y={40} width={mur * k} height={90} fill={hachure('aon', 'maconnerie')} className="t-fort" />
      <Axe x1={X(0)} y1={150} x2={X(0)} y2={26} repere="A" cote="fin" />
      <Axe x1={X(entraxe)} y1={150} x2={X(entraxe)} y2={26} repere="B" cote="fin" />
      <Cote x1={X(0)} y1={130} x2={X(entraxe)} y2={130} decalage={-30} texte={`${n2(entraxe)} d’axe en axe`} />
      <Cote x1={X(mur / 2)} y1={85} x2={X(entraxe - mur / 2)} y2={85} texte={`${n2(entraxe - mur)} de nu à nu`} />
    </Figure>
  );
}

/** Implantation : mesures en chaîne qui accumulent les erreurs, ou cumulées depuis une origine. */
export function ImplantationCumulee({ partielles, erreur = 0.01 }: { partielles: readonly number[]; erreur?: number }) {
  const c = chaineCotes(partielles);
  const k = 500 / c.total;
  const X = (x: number) => 60 + x * k;
  const n = partielles.length;
  return (
    <Figure alt={`Implantation de ${n} points le long d'un mur. En chaîne, on reporte chaque mesure à partir du point précédent : une erreur de ${nombre(erreur * 100, 0)} cm par mesure peut s'accumuler jusqu'à ${nombre(n * erreur * 100, 0)} cm au dernier point. En cumulé, on tend le décamètre depuis l'origine et l'on marque chaque point à sa distance cumulée : l'erreur ne s'additionne pas.`} largeur={620} hauteur={200}>
      <Etiquette x={10} y={24} taille={12} gras couleur={ROUGE}>
        en chaîne : les erreurs s’additionnent
      </Etiquette>
      <line x1={X(0)} y1={56} x2={X(c.total)} y2={56} className="t-moyen" />
      {c.cumulees.map((v, i) => (
        <g key={i}>
          <line x1={X(v)} y1={48} x2={X(v)} y2={64} className="t-moyen" />
          {i > 0 ? (
            <g>
              <line x1={X(v + i * erreur * 4)} y1={44} x2={X(v + i * erreur * 4)} y2={68} stroke={ROUGE} strokeWidth={1.4} />
              <Etiquette x={X(v + i * erreur * 4)} y={84} ancre="middle" taille={10} couleur={ROUGE}>
                {`+${nombre(i * erreur * 100, 0)} cm`}
              </Etiquette>
            </g>
          ) : null}
        </g>
      ))}
      <Etiquette x={10} y={124} taille={12} gras couleur={VERT}>
        en cumulé depuis l’origine : chaque point garde sa petite erreur
      </Etiquette>
      <rect x={X(0)} y={146} width={c.total * k} height={12} rx={3} fill="var(--color-terre-clair)" className="t-fin" />
      {c.cumulees.map((v, i) => (
        <g key={i}>
          <line x1={X(v)} y1={140} x2={X(v)} y2={164} stroke={VERT} strokeWidth={1.4} />
          <Etiquette x={X(v)} y={182} ancre="middle" taille={10}>
            {n2(v)}
          </Etiquette>
        </g>
      ))}
      <circle cx={X(0)} cy={152} r={4} fill={VERT} />
    </Figure>
  );
}

// ---------- L1.6.7 : coupes, sections et hachures ----------

/** Profil d'un mur sur semelle, en m (pour la coupe en perspective). */
const MUR_SEMELLE: Point2[] = [[0, 0], [0.8, 0], [0.8, 0.25], [0.5, 0.25], [0.5, 1.2], [0.3, 1.2], [0.3, 0.25], [0, 0.25]];

/** On coupe l'objet par un plan, on enlève la partie avant : la face coupée apparaît, on la hachure. */
export function CoupeIntuition() {
  const { proj, vers } = projecteur({ mode: 'iso' });
  const toutes = facesVues(facesExtrusion(MUR_SEMELLE, 1.6), vers);
  const moitie = facesVues(facesExtrusion(MUR_SEMELLE, 0.8), vers);
  const { P } = cadrePerspective(toutes.flatMap((f) => f.pts.map(proj)), 260, 200, 16);
  const plan: [number, number, number][] = [[-0.15, 0.8, -0.1], [0.95, 0.8, -0.1], [0.95, 0.8, 1.35], [-0.15, 0.8, 1.35]];
  const decale = P(proj([0, 0.8, 0]));
  const origine = P(proj([0, 0, 0]));
  return (
    <Figure alt="À gauche, un mur sur sa semelle, et un plan vertical qui le tranche en son milieu. À droite, on a retiré la partie avant : la surface que le plan a tranchée apparaît, avec la forme exacte du mur et de la semelle. C'est cette face coupée que l'on hachure sur une coupe." largeur={620} hauteur={226}>
      <Hachures prefixe="ci" types={['ba']} />
      <g transform="translate(20 0)">
        <DessinPrisme faces={toutes} P={P} proj={proj} />
        <polygon points={points(plan.map((q) => P(proj(q))))} fill={ROUGE} fillOpacity={0.12} stroke={ROUGE} strokeWidth={1.2} />
      </g>
      <Fleche x1={286} y1={110} x2={330} y2={110} couleur={BLEU} epaisseur={2} tete={8} />
      <g transform={`translate(${340 + origine[0] - decale[0]} ${origine[1] - decale[1]})`}>
        <DessinPrisme faces={moitie} P={P} proj={proj} />
        <polygon points={points(MUR_SEMELLE.map(([x, z]) => P(proj([x, 0, z]))))} fill={hachure('ci', 'ba')} className="t-fort" />
      </g>
      <Etiquette x={150} y={218} ancre="middle" taille={11.5} gras>
        on tranche
      </Etiquette>
      <Etiquette x={470} y={218} ancre="middle" taille={11.5} gras couleur={BLEU}>
        on retire l’avant : la face coupée
      </Etiquette>
    </Figure>
  );
}

/** Coupe et section d'une poutre en T qui repose sur un poteau. */
export function CoupeOuSection() {
  const T = (x0: number) => points([[x0, 40], [x0 + 200, 40], [x0 + 200, 64], [x0 + 130, 64], [x0 + 130, 120], [x0 + 70, 120], [x0 + 70, 64], [x0, 64]]);
  return (
    <Figure alt="Une poutre en T, coulée avec la dalle, repose sur un poteau. En coupe, on dessine la partie tranchée, hachurée, et tout ce que l'on voit au-delà du plan de coupe : ici le poteau, en trait continu, sans hachures. En section, on ne dessine que la partie tranchée." largeur={620} hauteur={226}>
      <Hachures prefixe="cos" types={['ba']} />
      <polygon points={T(40)} fill={hachure('cos', 'ba')} className="t-fort" />
      <rect x={115} y={120} width={50} height={80} fill="var(--color-papier)" className="t-moyen" />
      <Etiquette x={140} y={218} ancre="middle" taille={11.5} gras>
        coupe : tranché + vu au-delà
      </Etiquette>
      <Renvoi de={[260, 160]} vers={[166, 160]} texte="poteau vu : non hachuré" />
      <polygon points={T(380)} fill={hachure('cos', 'ba')} className="t-fort" />
      <Etiquette x={480} y={218} ancre="middle" taille={11.5} gras>
        section : tranché seulement
      </Etiquette>
    </Figure>
  );
}

/** Plan avec repère de coupe A-A, et la coupe obtenue en regardant dans le sens des flèches. */
export function RepereEtCoupe() {
  const k = 55;
  const sol = 190;
  const Z = (z: number) => sol - z * k;
  const mur = (x: number, morceaux: [number, number][]) =>
    morceaux.map(([z0, z1], i) => <rect key={`${x}${i}`} x={x} y={Z(z1)} width={14} height={(z1 - z0) * k} fill={hachure('rec', 'maconnerie')} className="t-fort" />);
  return (
    <Figure alt="À gauche, le plan d'une pièce : le repère de coupe A-A la traverse du nord au sud, en passant par la porte et par la fenêtre ; ses flèches pointent vers l'est. À droite, la coupe A-A, vue vers l'est : le mur nord tranché au droit de la porte, le mur sud tranché au droit de la fenêtre, tous deux hachurés, la dalle tranchée, et, au fond, le mur est vu de face avec sa fenêtre, sans hachures." largeur={620} hauteur={232}>
      <Hachures prefixe="rec" types={['maconnerie', 'ba']} />
      <rect x={40} y={40} width={70} height={14} fill={hachure('rec', 'maconnerie')} className="t-fort" />
      <rect x={150} y={40} width={90} height={14} fill={hachure('rec', 'maconnerie')} className="t-fort" />
      <line x1={150} y1={54} x2={150} y2={94} className="t-moyen" />
      <path d="M150 94 A40 40 0 0 1 110 54" className="t-fin" />
      <rect x={40} y={166} width={60} height={14} fill={hachure('rec', 'maconnerie')} className="t-fort" />
      <rect x={160} y={166} width={80} height={14} fill={hachure('rec', 'maconnerie')} className="t-fort" />
      <path d="M100 166h60M100 173h60M100 180h60" className="t-fin" />
      <rect x={40} y={54} width={14} height={112} fill={hachure('rec', 'maconnerie')} className="t-fort" />
      <rect x={226} y={54} width={14} height={36} fill={hachure('rec', 'maconnerie')} className="t-fort" />
      <rect x={226} y={130} width={14} height={36} fill={hachure('rec', 'maconnerie')} className="t-fort" />
      <path d="M226 90v40M233 90v40M240 90v40" className="t-fin" />
      <RepereCoupe x1={130} y1={206} x2={130} y2={20} nom="A" sens={1} />
      <Etiquette x={60} y={228} ancre="middle" taille={11} classe="etiquette">
        plan
      </Etiquette>
      <rect x={316} y={Z(2.95)} width={272} height={0.25 * k} fill={hachure('rec', 'ba')} className="t-fort" />
      {mur(330, [[2.1, 2.7]])}
      <path d={`M330 ${Z(0)}V${Z(2.1)}M344 ${Z(0)}V${Z(2.1)}`} className="t-fin" />
      {mur(560, [[0, 0.9], [2.1, 2.7]])}
      <rect x={565} y={Z(2.1)} width={4} height={1.2 * k} fill="var(--fond-eau)" className="t-moyen" />
      <rect x={420} y={Z(2.1)} width={70} height={1.2 * k} fill="var(--fond-eau)" className="t-moyen" />
      <line x1={300} y1={Z(0)} x2={600} y2={Z(0)} className="t-fort" />
      <Etiquette x={455} y={Z(2.1) - 6} ancre="middle" taille={10} classe="etiquette">
        fenêtre du mur est, vue au fond
      </Etiquette>
      <Etiquette x={337} y={212} ancre="middle" taille={10.5}>
        nord
      </Etiquette>
      <Etiquette x={567} y={212} ancre="middle" taille={10.5}>
        sud
      </Etiquette>
      <Etiquette x={455} y={228} ancre="middle" taille={11.5} gras couleur={BLEU}>
        coupe A-A, vue vers l’est
      </Etiquette>
    </Figure>
  );
}

/** Demi-coupe, coupe partielle et coupe brisée d'un regard. */
export function TypesCoupes() {
  const B = 120;
  const H = 120;
  const e = 16;
  const x1 = 40;
  const x2 = 240;
  const y = 30;
  return (
    <Figure alt="Trois coupes particulières d'un regard en béton. Demi-coupe : un objet symétrique est dessiné moitié en vue extérieure, moitié en coupe, de part et d'autre de son axe. Coupe partielle : on ouvre seulement une zone, limitée par un trait ondulé, pour montrer un détail. Coupe brisée : le plan de coupe change de direction pour passer par plusieurs détails." largeur={620} hauteur={200}>
      <Hachures prefixe="tyc" types={['ba']} />
      <rect x={x1} y={y} width={B} height={H} fill="var(--color-beton-clair)" className="t-fort" />
      <rect x={x1 + B / 2} y={y} width={B / 2} height={H} fill={hachure('tyc', 'ba')} className="t-fort" />
      <rect x={x1 + B / 2} y={y + e} width={B / 2 - e} height={H - 2 * e} fill="var(--color-papier)" className="t-fort" />
      <line x1={x1 + B / 2} y1={y - 8} x2={x1 + B / 2} y2={y + H + 8} className="t-axe" />
      <Etiquette x={x1 + B / 2} y={y + H + 26} ancre="middle" taille={11.5} gras>
        demi-coupe
      </Etiquette>
      <rect x={x2} y={y} width={B} height={H} fill="var(--color-beton-clair)" className="t-fort" />
      <path d={`M${x2} ${y + 60} q 15 -10 30 0 t 30 0 V${y + H} H${x2} Z`} fill={hachure('tyc', 'ba')} />
      <rect x={x2 + e} y={y + 60} width={60 - e} height={H - 60 - e} fill="var(--color-papier)" />
      <path d={`M${x2} ${y + 60} q 15 -10 30 0 t 30 0 V${y + H}`} className="t-fin" fill="none" />
      <Etiquette x={x2 + B / 2} y={y + H + 26} ancre="middle" taille={11.5} gras>
        coupe partielle
      </Etiquette>
      <rect x={440} y={y} width={B} height={H} fill="var(--color-beton-clair)" className="t-fort" />
      <rect x={440 + e} y={y + e} width={B - 2 * e} height={H - 2 * e} fill="var(--color-papier)" className="t-moyen" />
      <circle cx={470} cy={y + e / 2} r={6} className="t-moyen" fill="none" />
      <circle cx={440 + B - e / 2} cy={y + 90} r={6} className="t-moyen" fill="none" />
      <path d={`M470 ${y - 14} V${y + 60} H${440 + B + 14}`} className="t-axe" strokeWidth={1.4} />
      <Etiquette x={440 + B / 2} y={y + H + 26} ancre="middle" taille={11.5} gras>
        coupe brisée (en plan)
      </Etiquette>
    </Figure>
  );
}

/** Règles des hachures : matériaux différents, pièces voisines, parties minces. */
export function ReglesHachures() {
  return (
    <Figure alt="Trois règles de hachures. Deux matériaux en contact ont deux motifs différents : béton armé et maçonnerie. Deux pièces voisines du même matériau ont des hachures de sens opposés. Une partie trop mince pour être hachurée, comme une tôle ou une platine, est noircie." largeur={620} hauteur={190}>
      <Hachures prefixe="rh" types={['ba', 'maconnerie']} />
      <rect x={40} y={40} width={140} height={40} fill={hachure('rh', 'ba')} className="t-fort" />
      <rect x={70} y={80} width={80} height={70} fill={hachure('rh', 'maconnerie')} className="t-fort" />
      <Etiquette x={110} y={174} ancre="middle" taille={11}>
        deux matériaux : deux motifs
      </Etiquette>
      <defs>
        <pattern id="rh-g" width={8} height={8} patternUnits="userSpaceOnUse">
          <path d="M0 8L8 0M-2 2L2 -2M6 10L10 6" stroke="var(--trait-doux)" strokeWidth={0.7} />
        </pattern>
        <pattern id="rh-d" width={8} height={8} patternUnits="userSpaceOnUse">
          <path d="M0 0L8 8M-2 6L2 10M6 -2L10 2" stroke="var(--trait-doux)" strokeWidth={0.7} />
        </pattern>
      </defs>
      <rect x={240} y={60} width={70} height={80} fill="url(#rh-g)" className="t-fort" />
      <rect x={310} y={60} width={70} height={80} fill="url(#rh-d)" className="t-fort" />
      <Etiquette x={310} y={174} ancre="middle" taille={11}>
        pièces voisines : sens opposés
      </Etiquette>
      <rect x={440} y={50} width={130} height={8} fill="var(--trait)" />
      <rect x={490} y={58} width={30} height={92} fill="var(--color-beton-clair)" className="t-fort" />
      <Etiquette x={505} y={174} ancre="middle" taille={11}>
        tôle mince : noircie
      </Etiquette>
    </Figure>
  );
}

/** Coupe d'un plancher : revêtement, dalle, enduit, niveaux et hauteur sous plafond. */
export function PlancherCoupe({ d, prefixe = 'plc' }: { d: DonneesPlancher; prefixe?: string }) {
  const r = hauteurSousPlafond(d);
  const s = 62;
  const zoomE = 3.2;
  const zEtage = d.hEtage;
  const ox = 120;
  const Z0 = 250;
  const Z = (z: number) => Z0 - z * s;
  const yFini = Z(zEtage);
  const couches = [
    { e: d.revetement, t: 'chape et carrelage' },
    { e: d.dalle, t: 'dalle' },
    { e: d.plafond, t: 'enduit' },
  ];
  let y = yFini;
  const dessinees = couches.map((c) => {
    const h = c.e * s * zoomE;
    const r0 = { ...c, y, h };
    y += h;
    return r0;
  });
  const sousFace = y;
  return (
    <Figure alt={`Coupe d'un plancher : sous le sol fini de l'étage, ${nombre(d.revetement * 100, 1)} cm de chape et carrelage, ${nombre(d.dalle * 100, 0)} cm de dalle et ${nombre(d.plafond * 100, 1)} cm d'enduit, soit ${n2(r.plancher)} m de plancher. Hauteur d'étage ${n2(d.hEtage)} m, hauteur sous plafond ${n2(r.hsp)} m. Épaisseurs agrandies pour la lecture.`} largeur={620} hauteur={276}>
      <Hachures prefixe={prefixe} types={['ba']} />
      {dessinees.map((c) => (
        <g key={c.t}>
          <rect x={ox} y={c.y} width={330} height={c.h} fill={c.t === 'dalle' ? hachure(prefixe, 'ba') : 'var(--fond-beton)'} className={c.t === 'dalle' ? 't-fort' : 't-moyen'} />
          <Etiquette x={ox + 340} y={c.y + c.h / 2 + 4} taille={10.5}>
            {`${c.t} : ${nombre(c.e * 100, 1)} cm`}
          </Etiquette>
        </g>
      ))}
      <rect x={ox} y={Z(0)} width={330} height={10} fill="var(--fond-beton)" className="t-moyen" />
      <Niveau x={ox - 10} y={yFini} texte={niv(zEtage)} longueur={50} vers="gauche" />
      <Niveau x={ox - 10} y={Z(0)} texte="±0,00" longueur={50} vers="gauche" />
      <Cote x1={ox + 260} y1={Z(0)} x2={ox + 260} y2={sousFace} texte={`HSP ${n2(r.hsp)}`} />
      <Cote x1={ox + 40} y1={Z(0)} x2={ox + 40} y2={yFini} texte={`étage ${n2(d.hEtage)}`} />
      <Etiquette x={ox + 120} y={Z(0) + 24} ancre="middle" taille={10} classe="etiquette">
        épaisseurs agrandies
      </Etiquette>
    </Figure>
  );
}

/** Erreur : flèches de coupe inversées, on regarde l'autre côté. */
export function FlechesInversees() {
  const vue = (x0: number, porte: boolean) => (
    <g>
      <rect x={x0} y={110} width={150} height={70} fill="var(--color-beton-clair)" className="t-moyen" />
      {porte ? <rect x={x0 + 55} y={124} width={36} height={56} fill="var(--color-terre-clair)" className="t-moyen" /> : <rect x={x0 + 45} y={128} width={60} height={30} fill="var(--fond-eau)" className="t-moyen" />}
    </g>
  );
  return (
    <Figure alt="Le même repère de coupe, une fois avec les flèches vers le nord, une fois vers le sud. Vers le nord, on voit au fond le mur nord et sa porte ; vers le sud, le mur sud et sa fenêtre. Inverser les flèches, c'est dessiner l'autre côté de la pièce." largeur={620} hauteur={196}>
      <rect x={60} y={20} width={150} height={70} fill="none" className="t-moyen" />
      <RepereCoupe x1={44} y1={55} x2={226} y2={55} nom="A" sens={-1} />
      {vue(60, true)}
      <Etiquette x={135} y={192} ancre="middle" taille={11} gras>
        flèches vers le nord : la porte
      </Etiquette>
      <rect x={380} y={20} width={150} height={70} fill="none" className="t-moyen" />
      <RepereCoupe x1={364} y1={55} x2={546} y2={55} nom="A" sens={1} />
      {vue(380, false)}
      <Etiquette x={455} y={192} ancre="middle" taille={11} gras>
        flèches vers le sud : la fenêtre
      </Etiquette>
    </Figure>
  );
}

/** Erreur : deux matériaux en contact hachurés de la même façon. */
export function HachuresContact() {
  return (
    <Figure alt="À gauche, une poutre posée sur un mur, hachurés tous les deux du même motif : on ne voit plus où finit la poutre. À droite, béton armé et maçonnerie ont chacun leur motif, et la limite saute aux yeux." largeur={620} hauteur={170}>
      <Hachures prefixe="hco" types={['ba', 'maconnerie']} />
      <rect x={50} y={30} width={200} height={36} fill={hachure('hco', 'ba')} className="t-fin" />
      <rect x={110} y={66} width={80} height={70} fill={hachure('hco', 'ba')} className="t-fin" />
      <Etiquette x={150} y={160} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        ✗ même motif : où est la limite ?
      </Etiquette>
      <rect x={370} y={30} width={200} height={36} fill={hachure('hco', 'ba')} className="t-fort" />
      <rect x={430} y={66} width={80} height={70} fill={hachure('hco', 'maconnerie')} className="t-fort" />
      <Etiquette x={470} y={160} ancre="middle" taille={11.5} gras couleur={VERT}>
        ✓ un motif par matériau
      </Etiquette>
    </Figure>
  );
}

/** Coupe d'un dallage sur terre-plein : du terrain au carrelage. */
export function DallageTerrePlein() {
  const x0 = 60;
  const L = 330;
  const couches: { t: string; h: number; m?: TypeHachure; f?: string }[] = [
    { t: 'carrelage collé', h: 10, f: 'var(--color-papier)' },
    { t: 'chape', h: 16, f: 'var(--fond-beton)' },
    { t: 'dallage en béton armé', h: 28, m: 'ba' },
    { t: 'film polyéthylène', h: 4, f: 'var(--trait)' },
    { t: 'hérisson de gravier', h: 34, m: 'gravier' },
    { t: 'remblai compacté', h: 38, m: 'remblai' },
    { t: 'terrain en place', h: 38, m: 'terre' },
  ];
  const ys = couches.reduce<number[]>((acc, c) => [...acc, acc[acc.length - 1]! + c.h], [20]);
  const iDallage = couches.findIndex((c) => c.m === 'ba');
  const yTreillis = ys[iDallage]! + couches[iDallage]!.h / 2;
  return (
    <Figure alt={`Coupe d'un dallage sur terre-plein, de haut en bas : ${couches.map((c) => c.t).join(', ')}. Le film limite les remontées d'humidité ; le hérisson coupe les remontées capillaires et répartit les charges ; le treillis soudé, en tirets, arme le dallage. Épaisseurs indicatives, à fixer par l'étude.`} largeur={620} hauteur={ys[ys.length - 1]! + 14}>
      <Hachures prefixe="dtp" types={['ba', 'gravier', 'remblai', 'terre']} />
      {couches.map((c, i) => (
        <g key={c.t}>
          <rect x={x0} y={ys[i]!} width={L} height={c.h} fill={c.m ? hachure('dtp', c.m) : c.f} className={c.m === 'ba' ? 't-fort' : 't-fin'} />
          <line x1={x0 + L} y1={ys[i]! + c.h / 2} x2={x0 + L + 30} y2={ys[i]! + c.h / 2} className="t-fin" />
          <Etiquette x={x0 + L + 36} y={ys[i]! + c.h / 2 + 4} taille={10.5}>
            {c.t}
          </Etiquette>
        </g>
      ))}
      <line x1={x0 + 10} y1={yTreillis} x2={x0 + L - 10} y2={yTreillis} stroke="var(--armature)" strokeWidth={1.2} strokeDasharray="8 3" />
    </Figure>
  );
}

/** Exercice : cinq motifs de hachures numérotés à identifier. */
export function CinqHachures() {
  const types: TypeHachure[] = ['maconnerie', 'terre', 'ba', 'gravier', 'beton'];
  return (
    <Figure alt="Cinq rectangles hachurés, numérotés de 1 à 5, chacun avec un motif de matériau différent, à identifier." largeur={620} hauteur={130}>
      <Hachures prefixe="cqh" types={types} />
      {types.map((t, i) => (
        <g key={t}>
          <rect x={30 + i * 116} y={20} width={90} height={60} fill={hachure('cqh', t)} className="t-fort" />
          <Etiquette x={75 + i * 116} y={104} ancre="middle" taille={14} gras couleur={BLEU}>
            {String(i + 1)}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

/** Exercice : la coupe d'un mur percé d'une fenêtre, zones numérotées ; lesquelles hachurer ? */
export function QuoiHachurer() {
  return (
    <Figure alt="Coupe verticale à travers un mur percé d'une fenêtre, dessinée sans hachures. Zones numérotées : 1, l'allège coupée ; 2, le linteau coupé ; 3, la dalle coupée ; 4, le mur du fond, vu au-delà de la coupe ; 5, la fenêtre dans l'épaisseur du mur." largeur={620} hauteur={230}>
      <rect x={200} y={140} width={30} height={70} fill="none" className="t-fort" />
      <rect x={200} y={40} width={30} height={34} fill="none" className="t-fort" />
      <rect x={130} y={20} width={340} height={20} fill="none" className="t-fort" />
      <rect x={300} y={40} width={150} height={170} fill="none" className="t-moyen" />
      <rect x={210} y={74} width={10} height={66} fill="var(--fond-eau)" className="t-moyen" />
      <line x1={100} y1={210} x2={500} y2={210} className="t-fort" />
      {[
        [215, 180, '1'],
        [215, 62, '2'],
        [300, 34, '3'],
        [375, 130, '4'],
        [250, 110, '5'],
      ].map(([x, y, t]) => (
        <g key={t as string}>
          <circle cx={x as number} cy={(y as number) - 4} r={10} fill="var(--color-papier)" stroke={BLEU} />
          <Etiquette x={x as number} y={y as number} ancre="middle" taille={11.5} gras couleur={BLEU}>
            {t as string}
          </Etiquette>
        </g>
      ))}
      <line x1={250} y1={106} x2={222} y2={106} stroke={BLEU} strokeWidth={0.8} />
    </Figure>
  );
}

// ---------- L1.6.8 : niveaux, axes et repères de files ----------

/** Le ±0,00 d'un bâtiment, rapporté à l'altitude au-dessus de la mer. */
export function ZeroDuBatiment({ d }: { d: DonneesNiveaux }) {
  const alt0 = altitude(0, d.altitudeZero);
  return (
    <Figure alt={`Une maison sur un terrain en pente. Son niveau de référence ±0,00 est le sol fini du rez-de-chaussée ; il se trouve à l'altitude ${n2(alt0)} m, mesurée au-dessus du niveau de la mer. Le terrain devant l'entrée est à ${niv(d.tn)}, soit l'altitude ${n2(altitude(d.tn, d.altitudeZero))} m ; l'étage à ${niv(d.etage)}, soit ${n2(altitude(d.etage, d.altitudeZero))} m.`} largeur={620} hauteur={230}>
      <Hachures prefixe="zdb" types={['terre']} />
      <path d="M20 170 L200 150 L600 120 V200 H20 Z" fill={hachure('zdb', 'terre')} />
      <path d="M20 170 L200 150 L600 120" className="t-fort" fill="none" />
      <rect x={240} y={60} width={200} height={84} fill="var(--color-papier)" className="t-fort" />
      <line x1={240} y1={100} x2={440} y2={100} className="t-fin" />
      <Niveau x={460} y={144} texte={`±0,00 (${n2(alt0)} m)`} longueur={110} />
      <Niveau x={460} y={100} texte={`${niv(d.etage)} (${n2(altitude(d.etage, d.altitudeZero))} m)`} longueur={110} />
      <Niveau x={150} y={155} texte={`${niv(d.tn)} TN (${n2(altitude(d.tn, d.altitudeZero))} m)`} longueur={46} vers="gauche" />
      <line x1={30} y1={222} x2={300} y2={222} stroke={BLEU} strokeDasharray="8 4" />
      <path d="M150 210 l8 6 l-8 6 l8 6" fill="none" className="t-fin" />
      <Etiquette x={310} y={226} taille={11} couleur={BLEU}>
        niveau de la mer (0 m), très loin dessous
      </Etiquette>
    </Figure>
  );
}

/** Niveau brut (dessus de dalle) et niveau fini (dessus de carrelage). */
export function BrutFini({ fini, revetement }: { fini: number; revetement: number }) {
  const brut = niveauBrut(fini, revetement);
  const s = 800;
  const yF = 50;
  const yB = yF + revetement * s;
  return (
    <Figure alt={`Zoom sur un plancher : le niveau fini ${niv(fini)} est le dessus du carrelage, là où l'on marche ; le niveau brut ${niv(brut)} est le dessus de la dalle, avant chape et carrelage. Entre les deux : ${nombre(revetement * 100, 0)} cm de revêtement. Le coffreur règle sa dalle au niveau brut.`} largeur={620} hauteur={196}>
      <Hachures prefixe="bf" types={['ba']} />
      <rect x={120} y={yF} width={300} height={revetement * s} fill="var(--fond-beton)" className="t-moyen" />
      <rect x={120} y={yB} width={300} height={196 - yB - 12} fill={hachure('bf', 'ba')} className="t-fort" />
      <Niveau x={440} y={yF} texte={`${niv(fini)} fini`} longueur={80} />
      <Niveau x={440} y={yB} texte={`${niv(brut)} brut`} longueur={80} />
      <Etiquette x={270} y={yF + (revetement * s) / 2 + 4} ancre="middle" taille={11}>
        chape et carrelage
      </Etiquette>
      <Etiquette x={270} y={yB + 40} ancre="middle" taille={11.5} gras>
        dalle en béton armé
      </Etiquette>
      <Cote x1={120} y1={yB} x2={120} y2={yF} decalage={16} texte={`${nombre(revetement * 100, 0)} cm`} taille={10.5} />
    </Figure>
  );
}

/** Pente : un dénivelé divisé par une longueur horizontale. */
export function PenteTriangle({ p, L }: { p: number; L: number }) {
  const dz = deniveleDePente(p, L);
  const a = angleDePente(p);
  const k = 90;
  const exag = 12;
  return (
    <Figure alt={`Une pente de ${nombre(p, 1)} % : sur ${n2(L)} m de longueur horizontale, on descend de ${n2(dz)} m. L'angle correspondant n'est que de ${nombre(a, 2)}°. Dessin exagéré en hauteur.`} largeur={620} hauteur={190}>
      <polygon points={points([[60, 150], [60 + L * k, 150], [60, 150 - dz * k * exag]])} fill="var(--color-encre-clair)" className="t-fort" />
      <Cote x1={60} y1={150} x2={60 + L * k} y2={150} decalage={-16} texte={`L = ${n2(L)} m`} />
      <Cote x1={60} y1={150} x2={60} y2={150 - dz * k * exag} decalage={16} texte={`${n2(dz)} m`} />
      <Etiquette x={60 + L * k * 0.42} y={150 - dz * k * exag * 0.58 - 8} ancre="middle" taille={12} gras couleur={BLEU}>
        {`${nombre(p, 1)} %`}
      </Etiquette>
      <Etiquette x={530} y={70} ancre="middle" taille={11.5}>
        {`p = ${n2(dz)} / ${n2(L)} = ${nombre(pente(dz, L), 1)} %`}
      </Etiquette>
      <Etiquette x={530} y={90} ancre="middle" taille={11.5}>
        {`soit ${nombre(a, 2)}°`}
      </Etiquette>
      <Etiquette x={530} y={120} ancre="middle" taille={10.5} classe="etiquette">
        hauteur exagérée
      </Etiquette>
    </Figure>
  );
}

/** Quadrillage des files : lettres dans un sens, chiffres dans l'autre ; un poteau se repère par sa file. */
export function QuadrillageFiles({ entraxesX, entraxesY, repere = ['C', '2'] }: { entraxesX: readonly number[]; entraxesY: readonly number[]; repere?: [string, string] }) {
  const px = positionsFiles(entraxesX);
  const py = positionsFiles(entraxesY);
  const Lx = px[px.length - 1]!;
  const Ly = py[py.length - 1]!;
  const k = Math.min(380 / Lx, 190 / Ly);
  const X = (x: number) => 110 + x * k;
  const Y = (y: number) => 40 + (Ly - y) * k;
  const lettres = 'ABCDEFG';
  const ix = lettres.indexOf(repere[0]);
  const iy = Number(repere[1]) - 1;
  return (
    <Figure alt={`Quadrillage des files d'un bâtiment : files ${lettres.slice(0, px.length).split('').join(', ')} dans un sens, avec des entraxes de ${entraxesX.map(n2).join(', ')} m ; files 1 à ${py.length} dans l'autre, avec ${entraxesY.map(n2).join(', ')} m. Un poteau à chaque croisement. Le poteau ${repere[0]}-${repere[1]} est à ${n2(px[ix]!)} m de la file A et à ${n2(py[iy]!)} m de la file 1.`} largeur={620} hauteur={Y(0) + 70}>
      <Hachures prefixe="qf" types={['ba']} />
      {px.map((x, i) => (
        <Axe key={`x${i}`} x1={X(x)} y1={Y(Ly) - 14} x2={X(x)} y2={Y(0) + 8} repere={lettres[i]!} />
      ))}
      {py.map((y, i) => (
        <Axe key={`y${i}`} x1={X(0) - 14} y1={Y(y)} x2={X(Lx) + 8} y2={Y(y)} repere={String(i + 1)} />
      ))}
      {px.flatMap((x, i) =>
        py.map((y, j) => (
          <rect key={`${i}${j}`} x={X(x) - 6} y={Y(y) - 6} width={12} height={12} fill={i === ix && j === iy ? ROUGE : hachure('qf', 'ba')} className="t-fort" />
        )),
      )}
      {entraxesX.map((e, i) => (
        <Cote key={`cx${i}`} x1={X(px[i]!)} y1={Y(0)} x2={X(px[i + 1]!)} y2={Y(0)} decalage={-30} texte={n2(e)} taille={10.5} />
      ))}
      {entraxesY.map((e, i) => (
        <Cote key={`cy${i}`} x1={X(Lx)} y1={Y(py[i]!)} x2={X(Lx)} y2={Y(py[i + 1]!)} decalage={-30} texte={n2(e)} taille={10.5} />
      ))}
      <Etiquette x={X(px[ix]!) + 10} y={Y(py[iy]!) - 10} taille={12} gras couleur={ROUGE}>
        {`poteau ${repere[0]}-${repere[1]}`}
      </Etiquette>
    </Figure>
  );
}

/** Les mêmes axes sur le plan d'architecture et sur le plan de structure. */
export function AxesDeuxPlans() {
  const plan = (x0: number, archi: boolean) => {
    const X = (x: number) => x0 + 30 + x * 50;
    const Y = (y: number) => 40 + (3 - y) * 40;
    return (
      <g>
        {archi ? (
          <g>
            <rect x={X(0) - 5} y={Y(3) - 5} width={210} height={130} fill="none" stroke="var(--trait)" strokeWidth={10} opacity={0.35} />
            <line x1={X(2)} y1={Y(3)} x2={X(2)} y2={Y(0)} stroke="var(--trait)" strokeWidth={5} opacity={0.35} />
          </g>
        ) : (
          <g>
            {[0, 4].flatMap((x) => [0, 3].map((y) => <rect key={`${x}${y}`} x={X(x) - 7} y={Y(y) - 7} width={14} height={14} fill="var(--trait)" />))}
            <path d={`M${X(0)} ${Y(0)}H${X(4)}M${X(0)} ${Y(3)}H${X(4)}`} className="t-cache" strokeWidth={5} />
          </g>
        )}
        <Axe x1={X(0)} y1={Y(3) - 22} x2={X(0)} y2={Y(0) + 10} repere="A" />
        <Axe x1={X(4)} y1={Y(3) - 22} x2={X(4)} y2={Y(0) + 10} repere="B" />
        <Axe x1={X(0) - 22} y1={Y(0)} x2={X(4) + 10} y2={Y(0)} repere="1" />
        <Axe x1={X(0) - 22} y1={Y(3)} x2={X(4) + 10} y2={Y(3)} repere="2" />
        <Etiquette x={X(2)} y={Y(0) + 34} ancre="middle" taille={11.5} gras couleur={BLEU}>
          {archi ? 'plan d’architecture' : 'plan de structure'}
        </Etiquette>
      </g>
    );
  };
  return (
    <Figure alt="Le même bâtiment sur deux plans : à gauche, le plan d'architecture avec ses murs ; à droite, le plan de structure avec ses poteaux et ses poutres. Les files A, B, 1 et 2 sont exactement les mêmes : ce sont elles qui permettent de superposer les plans." largeur={620} hauteur={226}>
      {plan(40, true)}
      {plan(340, false)}
    </Figure>
  );
}

/** Coupe de principe des niveaux : terrain, rampe, rez-de-chaussée et étage, brut et fini, altitudes. */
export function NiveauxCoupe({ d }: { d: DonneesNiveaux }) {
  const s = 46;
  const ox = 160;
  const Z = (z: number) => 200 - z * s;
  const brutE = niveauBrut(d.etage, d.revetement);
  const p = pente(-d.tn, d.rampe);
  const kR = 14;
  return (
    <Figure alt={`Coupe de principe : terrain à ${niv(d.tn)} (altitude ${n2(altitude(d.tn, d.altitudeZero))} m), sol fini du rez-de-chaussée à ±0,00 (${n2(d.altitudeZero)} m), sol fini de l'étage à ${niv(d.etage)} (${n2(altitude(d.etage, d.altitudeZero))} m), sur une dalle brute à ${niv(brutE)}. Une rampe de ${n2(d.rampe)} m monte du terrain à l'entrée : pente ${nombre(p, 2)} %.`} largeur={620} hauteur={250}>
      <Hachures prefixe="nvc" types={['ba', 'terre']} />
      <rect x={20} y={Z(d.tn)} width={580} height={40} fill={hachure('nvc', 'terre')} />
      <line x1={20} y1={Z(d.tn)} x2={ox - d.rampe * kR} y2={Z(d.tn)} className="t-fort" />
      <polygon points={points([[ox - d.rampe * kR, Z(d.tn)], [ox, Z(0)], [ox, Z(d.tn)]])} fill="var(--fond-beton)" className="t-moyen" />
      <rect x={ox} y={Z(0)} width={300} height={(0 - d.tn) * s} fill="var(--fond-beton)" className="t-moyen" />
      <rect x={ox} y={Z(d.etage)} width={300} height={d.revetement * s} fill="var(--fond-beton)" className="t-moyen" />
      <rect x={ox} y={Z(brutE)} width={300} height={0.16 * s} fill={hachure('nvc', 'ba')} className="t-fort" />
      <rect x={ox} y={Z(d.etage + 0.9)} width={14} height={(d.etage + 0.9) * s} fill="var(--color-beton-clair)" className="t-moyen" />
      <rect x={ox + 286} y={Z(d.etage + 0.9)} width={14} height={(d.etage + 0.9) * s} fill="var(--color-beton-clair)" className="t-moyen" />
      <line x1={460} y1={Z(d.tn)} x2={600} y2={Z(d.tn)} className="t-fort" />
      {[
        [d.tn, `${niv(d.tn)} TN`, altitude(d.tn, d.altitudeZero)],
        [0, '±0,00', d.altitudeZero],
        [d.etage, `${niv(d.etage)} fini`, altitude(d.etage, d.altitudeZero)],
      ].map(([z, t, a]) => (
        <Niveau key={String(t)} x={480} y={Z(z as number)} texte={`${t} (${n2(a as number)} m)`} longueur={110} />
      ))}
      <Niveau x={ox - 8} y={Z(brutE)} texte={`${niv(brutE)} brut`} longueur={60} vers="gauche" />
      <Etiquette x={ox - (d.rampe * kR) / 2 - 10} y={Z(-d.tn / 2) - 12} ancre="middle" taille={11.5} gras couleur={BLEU}>
        {`rampe ${nombre(p, 2)} %`}
      </Etiquette>
      <Cote x1={ox - d.rampe * kR} y1={Z(d.tn)} x2={ox} y2={Z(d.tn)} decalage={-18} texte={n2(d.rampe)} taille={10.5} />
    </Figure>
  );
}

/** Erreur : un signe oublié devant un niveau, c'est deux fois la valeur d'erreur. */
export function SigneNiveau({ z = 0.4 }: { z?: number }) {
  const s = 120;
  const Z = (v: number) => 110 - v * s;
  return (
    <Figure alt={`Le niveau ${niv(-z)} est sous le ±0,00 ; le niveau ${niv(z)} est au-dessus. Oublier le signe moins place l'ouvrage ${nombre(2 * z * 100, 0)} cm trop haut.`} largeur={620} hauteur={200}>
      <line x1={120} y1={Z(0)} x2={420} y2={Z(0)} className="t-fort" />
      <Niveau x={440} y={Z(0)} texte="±0,00" longueur={70} />
      <line x1={120} y1={Z(z)} x2={420} y2={Z(z)} stroke={ROUGE} strokeDasharray="6 4" />
      <Niveau x={440} y={Z(z)} texte={`${niv(z)} ✗ (signe oublié)`} longueur={70} />
      <line x1={120} y1={Z(-z)} x2={420} y2={Z(-z)} stroke={VERT} strokeWidth={1.6} />
      <Niveau x={440} y={Z(-z)} texte={`${niv(-z)} ✓`} longueur={70} />
      <Cote x1={200} y1={Z(-z)} x2={200} y2={Z(z)} decalage={16} texte={`${nombre(2 * z * 100, 0)} cm d’erreur`} />
    </Figure>
  );
}

/** Erreur : confondre pourcentage et degrés. */
export function PourcentDegres() {
  const pentes = [2, 10, 50, 100];
  const L = 400;
  return (
    <Figure alt={`Quatre pentes tracées depuis un même point : ${pentes.map((p) => `${p} % = ${nombre(angleDePente(p), 1)}°`).join(' ; ')}. Une pente de 100 % fait 45°, pas 90°.`} largeur={620} hauteur={260}>
      <line x1={60} y1={230} x2={60 + L} y2={230} className="t-fort" />
      {pentes.map((p) => {
        const a = (angleDePente(p) * Math.PI) / 180;
        const l = Math.min(L, 200 / Math.sin(a || 1e-3));
        const x = 60 + l * Math.cos(a);
        const y = 230 - l * Math.sin(a);
        return (
          <g key={p}>
            <line x1={60} y1={230} x2={x} y2={y} stroke={BLEU} strokeWidth={1.6} />
            <Etiquette x={x + 6} y={y + 4} taille={11.5} gras couleur={BLEU}>
              {`${p} % = ${nombre(angleDePente(p), 1)}°`}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Trait de niveau peint sur les murs à +1,00 : il sert de référence pour régler sols et ouvertures. */
export function TraitDeNiveau({ trait = 1 }: { trait?: number }) {
  const s = 110;
  const Z = (z: number) => 190 - z * s;
  return (
    <Figure alt={`Le trait de niveau est tracé sur les murs à ${niv(trait)} au-dessus du sol fini. Pour régler le sol, on mesure ${n2(trait)} m vers le bas depuis le trait ; pour une allège à +0,90, on mesure 0,10 m vers le bas.`} largeur={620} hauteur={210}>
      <rect x={100} y={20} width={420} height={170} fill="var(--color-beton-clair)" className="t-moyen" />
      <line x1={100} y1={Z(trait)} x2={520} y2={Z(trait)} stroke={ROUGE} strokeWidth={2} />
      <Etiquette x={110} y={Z(trait) - 6} taille={11.5} gras couleur={ROUGE}>
        {`trait de niveau ${niv(trait)}`}
      </Etiquette>
      <line x1={80} y1={Z(0)} x2={540} y2={Z(0)} className="t-fort" />
      <rect x={340} y={Z(trait)} width={12} height={trait * s} rx={2} fill="var(--color-terre-clair)" className="t-moyen" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={340} y1={Z(trait) + (i * trait * s) / 10} x2={346} y2={Z(trait) + (i * trait * s) / 10} className="t-fin" />
      ))}
      <Etiquette x={360} y={Z(trait / 2)} taille={11}>
        {`mètre : ${n2(trait)} m vers le bas`}
      </Etiquette>
      <Niveau x={540} y={Z(0)} texte="±0,00 sol fini" longueur={60} />
    </Figure>
  );
}

/** Chaises d'implantation : les axes matérialisés par des cordeaux tendus entre des planches. */
export function ChaisesImplantation() {
  const X0 = 170;
  const X1 = 450;
  const Y0 = 50;
  const Y1 = 190;
  const chaise = (x: number, y: number, h: boolean) => (
    <g>
      <rect x={h ? x - 30 : x - 4} y={h ? y - 4 : y - 30} width={h ? 60 : 8} height={h ? 8 : 60} fill="var(--color-terre-clair)" className="t-moyen" />
    </g>
  );
  return (
    <Figure alt="Vue de dessus d'une implantation : le contour du bâtiment est en tirets. Hors de la zone de fouille, des chaises, planches clouées sur des piquets, portent des clous ; des cordeaux tendus d'un clou à l'autre matérialisent les axes A, B, 1 et 2. On peut terrasser sans perdre les axes." largeur={620} hauteur={240}>
      <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="none" className="t-cache" strokeWidth={1.2} />
      {[X0, X1].map((x, i) => (
        <g key={x}>
          {chaise(x, 14, true)}
          {chaise(x, 226, true)}
          <line x1={x} y1={14} x2={x} y2={226} stroke={ROUGE} strokeWidth={1} />
          <Etiquette x={x} y={10} ancre="middle" taille={11} gras>
            {'AB'[i]!}
          </Etiquette>
        </g>
      ))}
      {[Y0, Y1].map((y, i) => (
        <g key={y}>
          {chaise(100, y, false)}
          {chaise(520, y, false)}
          <line x1={100} y1={y} x2={520} y2={y} stroke={ROUGE} strokeWidth={1} />
          <Etiquette x={88} y={y + 4} ancre="end" taille={11} gras>
            {String(2 - i)}
          </Etiquette>
        </g>
      ))}
      <Renvoi de={[540, 120]} vers={[521, 52]} texte="chaise" />
      <Renvoi de={[250, 130]} vers={[300, 191]} texte="cordeau sur l’axe" />
    </Figure>
  );
}
