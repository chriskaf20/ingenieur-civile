// Schémas du module N0.1 (méthode de travail) : page de notes, fiches, démarche, calendriers, sources.
import { SectionFerraillee } from '@/components/drawing/Armatures';
import { Cote } from '@/components/drawing/Cote';
import { couper, TEINTES } from '@/components/drawing/Diagrammes';
import { Etiquette, Figure, Renvoi } from '@/components/drawing/Figure';
import { Fleche } from '@/components/drawing/Fleche';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { INTERVALLES_REVISION, joursRevision, planRevisions, revisionsParJour } from '@/lib/calc/methode';
import { arrondiSup, nombre } from '@/lib/format';

/** Page de notes en trois zones (méthode Cornell) : questions, notes, résumé. */
export function PageCornell() {
  const x = 150;
  const y = 14;
  const L = 320;
  const H = 300;
  const col = 95;
  const bas = 70;
  const lignes = Array.from({ length: 10 }, (_, i) => y + 30 + i * 18);
  return (
    <Figure
      alt="Page de cahier découpée en trois zones : à gauche une colonne de questions et mots-clés, à droite la grande zone de notes prises en cours, en bas un résumé de quelques lignes."
      largeur={620}
      hauteur={H + 30}
    >
      <rect x={x} y={y} width={L} height={H} fill="var(--color-papier)" className="t-fort" />
      <line x1={x + col} y1={y} x2={x + col} y2={y + H - bas} className="t-moyen" stroke="var(--color-marge)" />
      <line x1={x} y1={y + H - bas} x2={x + L} y2={y + H - bas} className="t-moyen" stroke="var(--color-marge)" />
      {lignes.map((ly, i) => (
        <line key={ly} x1={x + col + 12} y1={ly} x2={x + L - 14 - (i % 3) * 30} y2={ly} className="t-fin" />
      ))}
      {[0, 3, 6].map((i) => (
        <text key={i} x={x + 10} y={lignes[i]! + 4} fontSize={13} className="encre">
          ? ……
        </text>
      ))}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={x + 14} y1={y + H - bas + 22 + i * 16} x2={x + L - 30 - i * 40} y2={y + H - bas + 22 + i * 16} className="t-fin" />
      ))}
      <Renvoi de={[20, 70]} vers={[x + 30, y + 60]} texte="① questions, mots-clés" />
      <Renvoi de={[490, 50]} vers={[x + L - 60, y + 90]} texte="② notes du cours" />
      <Renvoi de={[490, 270]} vers={[x + L - 80, y + H - 40]} texte="③ résumé" />
      <Etiquette x={20} y={180} taille={11} classe="etiquette">
        ① après le cours
      </Etiquette>
      <Etiquette x={490} y={150} taille={11} classe="etiquette">
        ② pendant le cours
      </Etiquette>
      <Etiquette x={490} y={290} taille={11} classe="etiquette">
        ③ le soir même
      </Etiquette>
    </Figure>
  );
}

/** Fiche de révision recto / verso : question d'un côté, réponse complète de l'autre. */
export function FicheRectoVerso({ question, reponse, details }: { question: string; reponse: string; details: string[] }) {
  const w = 270;
  const h = 160;
  return (
    <Figure alt={`Fiche de révision. Recto : ${question} Verso : ${reponse} ; ${details.join(' ; ')}.`} largeur={620} hauteur={h + 40}>
      <Etiquette x={20} y={16} taille={12} gras classe="titre-vue">
        RECTO
      </Etiquette>
      <rect x={20} y={24} width={w} height={h} rx={6} fill="var(--fond-note)" className="t-moyen" />
      <foreignObject x={34} y={50} width={w - 28} height={h - 40}>
        <p style={{ fontFamily: 'var(--font-manuscrite)', fontSize: 17, color: 'var(--color-encre)', lineHeight: 1.3 }}>{question}</p>
      </foreignObject>
      <Etiquette x={330} y={16} taille={12} gras classe="titre-vue">
        VERSO
      </Etiquette>
      <rect x={330} y={24} width={w} height={h} rx={6} fill="var(--fond-note)" className="t-moyen" />
      <foreignObject x={344} y={34} width={w - 28} height={h - 16}>
        <div style={{ fontFamily: 'var(--font-manuscrite)', fontSize: 14.5, color: 'var(--color-trait)', lineHeight: 1.3 }}>
          <p style={{ color: 'var(--color-validation)', fontWeight: 700 }}>{reponse}</p>
          {details.map((d) => (
            <p key={d}>• {d}</p>
          ))}
        </div>
      </foreignObject>
    </Figure>
  );
}

/** Les cinq étapes de résolution d'un problème d'ingénieur, en flux. */
export function CinqEtapes() {
  const etapes = ['Données', 'Schéma', 'Hypothèses', 'Calcul', 'Vérification'];
  const w = 104;
  const g = 18;
  const y = 30;
  return (
    <Figure
      alt="Démarche en cinq étapes : données, schéma, hypothèses, calcul, vérification ; si la vérification échoue, on revient aux données ou aux hypothèses."
      largeur={620}
      hauteur={130}
    >
      {etapes.map((e, i) => {
        const x = 10 + i * (w + g);
        return (
          <g key={e}>
            <rect x={x} y={y} width={w} height={42} rx={8} fill={i === 4 ? 'var(--color-validation-clair)' : 'var(--color-encre-clair)'} className="t-moyen" />
            <Etiquette x={x + w / 2} y={y + 17} ancre="middle" taille={11} classe="etiquette">
              {i + 1}
            </Etiquette>
            <Etiquette x={x + w / 2} y={y + 33} ancre="middle" taille={13} gras>
              {e}
            </Etiquette>
            {i < 4 ? <path d={`M${x + w + 2} ${y + 21}h${g - 6}l-4 -4m4 4l-4 4`} className="t-moyen" /> : null}
          </g>
        );
      })}
      <path d={`M${10 + 4 * (w + g) + w / 2} ${y + 44}v30H${10 + w / 2}v-28`} className="t-moyen" stroke="var(--color-correction)" strokeDasharray="5 3" />
      <path d={`M${10 + w / 2 - 4} ${y + 50}l4 -4 4 4`} className="t-moyen" stroke="var(--color-correction)" />
      <Etiquette x={310} y={y + 88} ancre="middle" taille={11.5} classe="etiquette">
        résultat absurde ou unités fausses → on revient en arrière
      </Etiquette>
    </Figure>
  );
}

/** Anatomie d'une application numérique bien présentée (valeurs issues de volumeDalle). */
export function AnatomieCalcul({ L, l, e, V }: { L: string; l: string; e: string; V: string }) {
  const y = 70;
  return (
    <Figure
      alt={`Ligne de calcul annotée : formule littérale V = L × l × e, puis application numérique ${L} × ${l} × ${e}, puis résultat ${V} encadré, chaque nombre suivi de son unité.`}
      largeur={620}
      hauteur={170}
    >
      <text x={20} y={y} fontSize={21} className="encre" style={{ fontFamily: 'var(--font-manuscrite)' }}>
        V = L × l × e
      </text>
      <text x={175} y={y} fontSize={21} className="encre" style={{ fontFamily: 'var(--font-manuscrite)' }}>
        = {L} × {l} × {e}
      </text>
      <rect x={445} y={y - 26} width={150} height={38} rx={16} fill="none" stroke="var(--color-validation)" strokeWidth={2.5} />
      <text x={520} y={y} fontSize={21} textAnchor="middle" fill="var(--color-validation)" style={{ fontFamily: 'var(--font-manuscrite)', fontWeight: 700 }}>
        = {V}
      </text>
      <Renvoi de={[20, 130]} vers={[70, y + 8]} texte="① formule littérale" />
      <Renvoi de={[200, 150]} vers={[260, y + 8]} texte="② nombres avec unités" />
      <Renvoi de={[430, 140]} vers={[500, y + 14]} texte="③ résultat arrondi + unité, encadré" />
      <Etiquette x={20} y={22} taille={11} classe="etiquette">
        une ligne = une idée ; on lit de gauche à droite, du littéral au numérique
      </Etiquette>
    </Figure>
  );
}

export interface PhaseSemestre {
  libelle: string;
  debut: number; // semaine de début (incluse)
  fin: number; // semaine de fin (incluse)
  couleur: 'encre' | 'validation' | 'correction' | 'brique' | 'terre' | 'acier';
}

/** Frise d'un semestre en semaines, une ligne par activité (diagramme de Gantt simplifié). */
export function FriseSemestre({ semaines, phases }: { semaines: number; phases: PhaseSemestre[] }) {
  const x0 = 150;
  const lg = 450;
  const w = lg / semaines;
  const h = 22;
  const y0 = 30;
  return (
    <Figure
      alt={`Planning d'un semestre de ${semaines} semaines : ${phases.map((p) => `${p.libelle} de la semaine ${p.debut} à ${p.fin}`).join(' ; ')}.`}
      largeur={620}
      hauteur={y0 + phases.length * (h + 6) + 20}
    >
      {Array.from({ length: semaines }, (_, i) => (
        <g key={i}>
          <line x1={x0 + i * w} y1={y0 - 6} x2={x0 + i * w} y2={y0 + phases.length * (h + 6)} className="t-fin" strokeDasharray="1 3" />
          <Etiquette x={x0 + (i + 0.5) * w} y={y0 - 10} ancre="middle" taille={9.5} classe="etiquette">
            S{i + 1}
          </Etiquette>
        </g>
      ))}
      {phases.map((p, i) => {
        const y = y0 + i * (h + 6);
        return (
          <g key={p.libelle}>
            <Etiquette x={x0 - 8} y={y + 15} ancre="end" taille={11.5}>
              {p.libelle}
            </Etiquette>
            <rect x={x0 + (p.debut - 1) * w + 1} y={y} width={(p.fin - p.debut + 1) * w - 2} height={h} rx={4} fill={`var(--color-${p.couleur})`} opacity={0.85} />
          </g>
        );
      })}
    </Figure>
  );
}

/** Pyramide de fiabilité des sources techniques, de la plus sûre (bas) à la plus douteuse (haut). */
export function PyramideSources() {
  const niveaux = [
    { texte: 'Réseaux sociaux, vidéos, forums', note: 'à vérifier toujours', couleur: 'var(--color-correction-clair)' },
    { texte: 'Sites web, articles non signés', note: 'source primaire ?', couleur: 'var(--color-brique-clair)' },
    { texte: 'Cours, ouvrages de référence', note: 'auteur, édition, date', couleur: 'var(--color-terre-clair)' },
    { texte: 'Guides officiels, fiches et avis techniques', note: 'organisme, version', couleur: 'var(--color-acier-clair)' },
    { texte: 'Normes en vigueur et annexe nationale, textes réglementaires', note: 'référence de base', couleur: 'var(--color-validation-clair)' },
  ];
  const h = 40;
  const base = 520;
  const x0 = 50;
  const y0 = 16;
  return (
    <Figure
      alt="Pyramide de fiabilité des sources : en bas, les normes en vigueur et les textes réglementaires ; puis les guides officiels et fiches techniques ; puis les cours et ouvrages de référence ; puis les sites web ; en haut, les réseaux sociaux, vidéos et forums, à vérifier toujours."
      largeur={620}
      hauteur={y0 + niveaux.length * h + 30}
    >
      {niveaux.map((n, i) => {
        const k = niveaux.length;
        const wHaut = (base * (i + 0.6)) / k;
        const wBas = (base * (i + 1.6)) / k;
        const y = y0 + i * h;
        const cx = x0 + base / 2;
        const pts = `${cx - wHaut / 2},${y} ${cx + wHaut / 2},${y} ${cx + Math.min(wBas, base) / 2},${y + h} ${cx - Math.min(wBas, base) / 2},${y + h}`;
        return (
          <g key={n.texte}>
            <polygon points={pts} fill={n.couleur} className="t-moyen" />
            <Etiquette x={cx} y={y + 18} ancre="middle" taille={12} gras>
              {n.texte}
            </Etiquette>
            <Etiquette x={cx} y={y + 33} ancre="middle" taille={10.5} classe="etiquette">
              {n.note}
            </Etiquette>
          </g>
        );
      })}
      <path d={`M${x0 + base + 30} ${y0 + niveaux.length * h}V${y0 + 4}`} className="t-moyen" />
      <path d={`M${x0 + base + 26} ${y0 + 12}l4 -8 4 8`} className="t-moyen" />
      <Etiquette x={x0 + base + 30} y={y0 + niveaux.length * h + 20} ancre="middle" taille={10.5} classe="etiquette">
        vérification nécessaire ↑
      </Etiquette>
    </Figure>
  );
}

// ---------- Schémas ajoutés : N0.1.1 (rappel actif, répétition espacée) ----------

const ENCRE = 'var(--color-encre)';
const VERT = 'var(--color-validation)';
const ROUGE = 'var(--color-correction)';
const TERRE = 'var(--color-terre)';

/** Les intervalles de révision grandissent : l'écart entre deux révisions double à peu près chaque fois. */
export function IntervallesCroissants() {
  const jours = [0, ...INTERVALLES_REVISION];
  const fin = INTERVALLES_REVISION[INTERVALLES_REVISION.length - 1]! + 1;
  const x0 = 66;
  const lg = 520;
  const X = (j: number) => x0 + (j / fin) * lg;
  const y = 70;
  return (
    <Figure alt={`Révisions aux jours J+${INTERVALLES_REVISION.join(', J+')} après le cours : les écarts entre révisions grandissent (${jours.slice(1).map((j, i) => j - jours[i]!).join(', ')} jours).`} largeur={620} hauteur={170}>
      <line x1={x0} y1={y} x2={x0 + lg} y2={y} className="t-moyen" />
      {Array.from({ length: fin + 1 }, (_, j) => (
        <line key={j} x1={X(j)} y1={y - 3} x2={X(j)} y2={y + 3} className="t-fin" />
      ))}
      <circle cx={X(0)} cy={y} r={7} fill={ENCRE} />
      <Etiquette x={X(0) - 11} y={y + 4} ancre="end" taille={11.5} gras couleur={ENCRE}>
        cours
      </Etiquette>
      {INTERVALLES_REVISION.map((n) => (
        <g key={n}>
          <circle cx={X(n)} cy={y} r={5.5} fill={VERT} />
          <Etiquette x={X(n)} y={y - 12} ancre="middle" taille={11} gras>
            J+{n}
          </Etiquette>
        </g>
      ))}
      {jours.slice(1).map((j, i) => {
        const a = jours[i]!;
        const ecart = j - a;
        const yb = y + 22 + i * 13;
        return (
          <g key={`e${j}`}>
            <line x1={X(a)} y1={yb} x2={X(j)} y2={yb} stroke={VERT} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
            <Etiquette x={X(j) + 8} y={yb + 4} taille={10.5}>
              {ecart} j
            </Etiquette>
          </g>
        );
      })}
      <Etiquette x={x0} y={22} taille={12} gras>
        jours après le cours ; en vert, l’écart avec la révision précédente
      </Etiquette>
    </Figure>
  );
}

/** Une feuille de rappel actif : en bleu ce qu'on a écrit de mémoire, en rouge ce qu'on a ajouté en corrigeant. */
export function FeuilleRappel({ gamma }: { gamma: number }) {
  const x = 130;
  const m = { fontFamily: 'var(--font-manuscrite)' };
  return (
    <Figure alt={`Feuille de rappel actif. Écrit de mémoire, en bleu : P = γ × V ; γ du béton armé = ${nombre(gamma, 0)} ; V = L × b × h. Ajouté en rouge en corrigeant, cahier ouvert : l'unité kN/m³ oubliée, la charge linéique g = b × h × γ en kN/m, et la source EN 1991-1-1.`} largeur={620} hauteur={226}>
      <rect x={x} y={8} width={360} height={190} rx={4} fill="var(--color-papier)" className="t-fort" />
      <line x1={x + 34} y1={8} x2={x + 34} y2={198} stroke={ROUGE} strokeWidth={1} opacity={0.6} />
      <text x={x + 46} y={34} fontSize={14} fill={ENCRE} style={m}>
        Feuille blanche : les charges
      </text>
      <text x={x + 46} y={66} fontSize={16} fill={ENCRE} style={m}>
        P = γ × V
      </text>
      <text x={x + 46} y={94} fontSize={16} fill={ENCRE} style={m}>
        γ béton armé = {nombre(gamma, 0)} <tspan fill={ROUGE}>kN/m³</tspan>
      </text>
      <text x={x + 46} y={122} fontSize={16} fill={ENCRE} style={m}>
        V = L × b × h
      </text>
      <text x={x + 46} y={154} fontSize={15} fill={ROUGE} style={m}>
        + oublié : g = b × h × γ (kN/m)
      </text>
      <text x={x + 46} y={180} fontSize={15} fill={ROUGE} style={m}>
        + source : EN 1991-1-1, tab. A.1
      </text>
      {[66, 122].map((y) => (
        <text key={y} x={x + 326} y={y} fontSize={17} fontWeight={700} fill={VERT}>
          ✓
        </text>
      ))}
      {[94, 154, 180].map((y) => (
        <text key={y} x={x + 14} y={y} fontSize={16} fontWeight={700} fill={ROUGE}>
          !
        </text>
      ))}
      <Etiquette x={x} y={218} taille={10.5} classe="etiquette">
        en bleu : écrit de mémoire, cahier fermé · en rouge : ajouté en corrigeant, à revoir en priorité
      </Etiquette>
    </Figure>
  );
}

/** Même temps de travail, deux répartitions : tout la veille de l'examen, ou des séances courtes espacées. */
export function BachotageOuEspacement() {
  const examen = 32;
  const plan = planRevisions(1, examen);
  const cases = (x0: number, marques: (j: number) => 'cours' | 'revision' | 'bachotage' | 'examen' | null, titre: string, couleur: string) => (
    <g>
      <Etiquette x={x0} y={22} taille={12.5} gras couleur={couleur}>
        {titre}
      </Etiquette>
      {Array.from({ length: 35 }, (_, i) => {
        const j = i + 1;
        const x = x0 + (i % 7) * 38;
        const y = 34 + Math.floor(i / 7) * 30;
        const m = marques(j);
        const fond = m === 'cours' ? 'var(--color-encre-clair)' : m === 'revision' ? 'var(--color-validation-clair)' : m === 'bachotage' ? 'var(--color-correction-clair)' : m === 'examen' ? 'var(--color-beton-clair)' : 'var(--color-papier)';
        return (
          <g key={j}>
            <rect x={x} y={y} width={34} height={26} rx={3} fill={fond} className="t-fin" />
            <Etiquette x={x + 4} y={y + 11} taille={8.5} classe="etiquette">
              {j}
            </Etiquette>
            {m ? (
              <Etiquette x={x + 17} y={y + 22} ancre="middle" taille={9.5} gras>
                {m === 'cours' ? 'cours' : m === 'revision' ? 'révision' : m === 'bachotage' ? 'tout' : 'exam.'}
              </Etiquette>
            ) : null}
          </g>
        );
      })}
    </g>
  );
  return (
    <Figure alt={`Deux calendriers de cinq semaines. À gauche, rien après le cours puis tout la veille de l'examen. À droite, des révisions courtes aux jours ${plan.avant.join(', ')} avant l'examen du jour ${examen}.`} largeur={620} hauteur={214}>
      {cases(14, (j) => (j === 1 ? 'cours' : j === examen - 1 ? 'bachotage' : j === examen ? 'examen' : null), '✗ tout la veille', ROUGE)}
      {cases(326, (j) => (j === 1 ? 'cours' : plan.avant.includes(j) ? 'revision' : j === examen ? 'examen' : null), '✓ révisions espacées', VERT)}
      <Etiquette x={14} y={204} taille={11} classe="etiquette">
        la veille, il faut tout réapprendre ; espacées, les séances sont courtes car on se souvient encore
      </Etiquette>
    </Figure>
  );
}

/** Calendrier des révisions de plusieurs cours : une ligne par cours, et la charge de chaque jour en bas. */
export function ChargeRevisions({ cours, noms }: { cours: readonly number[]; noms?: readonly string[] }) {
  const lignes = cours.map((c) => joursRevision(c));
  const fin = Math.max(...lignes.flat()) + 1;
  const charge = new Map(revisionsParJour(cours));
  const x0 = 130;
  const lg = 470;
  const X = (j: number) => x0 + ((j - 0.5) / fin) * lg;
  const pas = 26;
  const y0 = 30;
  const yT = y0 + cours.length * pas + 18;
  return (
    <Figure alt={`Révisions de ${cours.length} cours : ${cours.map((c, i) => `${noms?.[i] ?? `cours du jour ${c}`} révisé les jours ${lignes[i]!.join(', ')}`).join(' ; ')}. Jours chargés : ${[...charge].filter(([, n]) => n > 1).map(([j, n]) => `jour ${j} (${n})`).join(', ') || 'aucun'}.`} largeur={620} hauteur={yT + 40}>
      <Etiquette x={x0 - 8} y={y0 - 12} ancre="end" taille={11} gras>
        jour du semestre →
      </Etiquette>
      {Array.from({ length: Math.ceil(fin / 7) + 1 }, (_, s) => (
        <g key={s}>
          <line x1={x0 + ((s * 7) / fin) * lg} y1={y0 - 10} x2={x0 + ((s * 7) / fin) * lg} y2={yT + 6} className="t-fin" strokeDasharray="2 3" />
          {s * 7 + 1 <= fin ? (
            <Etiquette x={X(s * 7 + 1)} y={y0 - 14} ancre="middle" taille={9.5} classe="etiquette">
              {s * 7 + 1}
            </Etiquette>
          ) : null}
        </g>
      ))}
      {cours.map((c, i) => {
        const y = y0 + i * pas;
        return (
          <g key={c}>
            <Etiquette x={x0 - 8} y={y + 4} ancre="end" taille={11}>
              {noms?.[i] ?? `cours du jour ${c}`}
            </Etiquette>
            <line x1={x0} y1={y} x2={x0 + lg} y2={y} className="t-fin" />
            <rect x={X(c) - 5} y={y - 5} width={10} height={10} fill={ENCRE} />
            {lignes[i]!.map((j) => (
              <circle key={j} cx={X(j)} cy={y} r={5} fill={(charge.get(j) ?? 0) > 1 ? ROUGE : VERT} />
            ))}
          </g>
        );
      })}
      <line x1={x0} y1={yT - 12} x2={x0 + lg} y2={yT - 12} className="t-moyen" />
      <Etiquette x={x0 - 8} y={yT + 4} ancre="end" taille={11} gras>
        révisions du jour
      </Etiquette>
      {[...charge].map(([j, n]) => (
        <Etiquette key={j} x={X(j)} y={yT + 4} ancre="middle" taille={11} gras couleur={n > 1 ? ROUGE : VERT}>
          {n}
        </Etiquette>
      ))}
      <Etiquette x={x0} y={yT + 30} taille={10.5} classe="etiquette">
        ■ cours   ● révision   en rouge : jour où plusieurs révisions tombent ensemble
      </Etiquette>
    </Figure>
  );
}

// ---------- N0.1.2 : notes et fiches ----------

/** La boîte à fiches : un compartiment par intervalle ; une fiche réussie avance, une fiche ratée revient au début. */
export function BoiteFiches() {
  const noms = INTERVALLES_REVISION.map((n) => (n === 1 ? 'demain' : n < 7 ? `dans ${n} jours` : n === 7 ? 'dans 1 semaine' : n === 14 ? 'dans 2 semaines' : n === 30 ? 'dans 1 mois' : `dans ${n} jours`));
  const w = 104;
  const g = 10;
  const x0 = 26;
  const y = 70;
  const X = (i: number) => x0 + i * (w + g);
  return (
    <Figure alt={`Boîte à fiches à ${noms.length} compartiments : ${noms.join(', ')}. Une fiche retrouvée sans hésiter avance d'un compartiment ; une fiche ratée revient au premier.`} largeur={620} hauteur={220}>
      {noms.map((nom, i) => (
        <g key={nom}>
          <rect x={X(i)} y={y} width={w} height={70} rx={4} fill="var(--color-terre-clair)" stroke={TERRE} strokeWidth={1.4} />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={X(i) + 12 + k * 8} y={y - 12 + k * 4} width={w - 40} height={40} rx={2} fill="var(--color-papier)" stroke="var(--color-beton)" strokeWidth={0.8} />
          ))}
          <Etiquette x={X(i) + w / 2} y={y + 58} ancre="middle" taille={11.5} gras>
            {i + 1}. {nom}
          </Etiquette>
          {i < noms.length - 1 ? <Fleche x1={X(i) + w / 2 + 10} y1={y - 22} x2={X(i + 1) + w / 2 - 10} y2={y - 22} couleur={VERT} epaisseur={1.6} tete={7} /> : null}
        </g>
      ))}
      <Etiquette x={310} y={30} ancre="middle" taille={11.5} gras couleur={VERT}>
        réponse juste : la fiche avance d’un compartiment
      </Etiquette>
      <path d={`M ${X(noms.length - 1) + w / 2} ${y + 72} L ${X(noms.length - 1) + w / 2} ${y + 100} L ${X(0) + w / 2} ${y + 100} L ${X(0) + w / 2} ${y + 80}`} fill="none" stroke={ROUGE} strokeWidth={1.6} strokeDasharray="6 4" />
      <Fleche x1={X(0) + w / 2} y1={y + 86} x2={X(0) + w / 2} y2={y + 73} couleur={ROUGE} epaisseur={1.6} tete={7} />
      <Etiquette x={310} y={y + 120} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        réponse fausse ou incomplète : retour au premier compartiment
      </Etiquette>
    </Figure>
  );
}

/** Rectos de fiches : une question par carte. */
export function CartesQuestions({ questions }: { questions: readonly string[] }) {
  const parLigne = questions.length > 4 ? 3 : questions.length;
  const w = (620 - 20 - (parLigne - 1) * 12) / parLigne;
  const lignesTexte = questions.map((q) => couper(q, w - 24, 12));
  const hCarte = Math.max(...lignesTexte.map((l) => l.length)) * 16 + 40;
  const rangs = Math.ceil(questions.length / parLigne);
  return (
    <Figure alt={`${questions.length} fiches, recto : ${questions.join(' ; ')}`} largeur={620} hauteur={rangs * (hCarte + 14) + 10}>
      {questions.map((q, i) => {
        const x = 10 + (i % parLigne) * (w + 12);
        const y = 10 + Math.floor(i / parLigne) * (hCarte + 14);
        return (
          <g key={q}>
            <rect x={x} y={y} width={w} height={hCarte} rx={6} fill="var(--fond-note)" className="t-moyen" />
            <Etiquette x={x + 10} y={y + 18} taille={10.5} classe="etiquette">
              fiche {i + 1} · recto
            </Etiquette>
            {lignesTexte[i]!.map((l, k) => (
              <text key={k} x={x + 12} y={y + 38 + k * 16} fontSize={13.5} fill={ENCRE} style={{ fontFamily: 'var(--font-manuscrite)' }}>
                {l}
              </text>
            ))}
          </g>
        );
      })}
    </Figure>
  );
}

/** Une fiche incomplète et la même fiche corrigée : ce qui manque est signalé en rouge. */
export function FicheAvantApres({ gamma }: { gamma: number }) {
  const w = 280;
  const manques = ['nom et unité de chaque symbole ?', 'quel matériau ?', 'quand l’utiliser ?', 'quelle source ?'];
  const complet = ['P = γ × V', 'P : poids (kN) · V : volume (m³)', `γ béton armé : ${gamma} kN/m³`, 'domaine : poids propre d’un élément', 'source : EN 1991-1-1, tab. A.1'];
  return (
    <Figure alt={`À gauche, une fiche qui dit seulement « P = γV, γ = ${gamma} » : il manque les unités, le matériau, le domaine et la source. À droite, la fiche complète.`} largeur={620} hauteur={200}>
      <Etiquette x={20} y={18} taille={12} gras couleur={ROUGE}>
        ✗ verso incomplet
      </Etiquette>
      <rect x={20} y={28} width={w} height={160} rx={6} fill="var(--fond-note)" className="t-moyen" />
      <text x={36} y={60} fontSize={18} fill={ENCRE} style={{ fontFamily: 'var(--font-manuscrite)' }}>
        P = γV, γ = {gamma}
      </text>
      {manques.map((m, i) => (
        <text key={m} x={36} y={92 + i * 22} fontSize={14} fill={ROUGE} style={{ fontFamily: 'var(--font-manuscrite)' }}>
          → {m}
        </text>
      ))}
      <Etiquette x={320} y={18} taille={12} gras couleur={VERT}>
        ✓ verso complet
      </Etiquette>
      <rect x={320} y={28} width={w} height={160} rx={6} fill="var(--fond-note)" className="t-moyen" />
      {complet.map((m, i) => (
        <text key={m} x={334} y={56 + i * 27} fontSize={i === 0 ? 18 : 14} fill={i === 0 ? VERT : 'var(--color-trait)'} fontWeight={i === 0 ? 700 : undefined} style={{ fontFamily: 'var(--font-manuscrite)' }}>
          {m}
        </text>
      ))}
    </Figure>
  );
}

/** Une page de carnet de chantier : en-tête daté, décisions, mesures, croquis, actions. */
export function PageCarnetChantier() {
  const x = 150;
  const w = 320;
  return (
    <Figure alt="Page de carnet de chantier : en tête la date, le lieu et le sujet ; puis les décisions prises, les mesures relevées avec leur unité, un croquis coté, et les actions à faire avec un responsable." largeur={620} hauteur={330}>
      <rect x={x} y={12} width={w} height={278} rx={4} fill="var(--color-papier)" className="t-fort" />
      <rect x={x} y={12} width={w} height={34} fill="var(--color-encre-clair)" />
      <text x={x + 12} y={34} fontSize={15} fill={ENCRE} style={{ fontFamily: 'var(--font-manuscrite)' }}>
        jj/mm · lieu · réunion de chantier
      </text>
      {[
        { y: 70, t: 'Décisions : coulage dalle reporté (pluie)' },
        { y: 96, t: 'Mesures : hauteur sous dalle … m' },
        { y: 122, t: 'Problème : nid de cailloux poteau P4' },
      ].map((l) => (
        <text key={l.y} x={x + 12} y={l.y} fontSize={14} fill="var(--color-trait)" style={{ fontFamily: 'var(--font-manuscrite)' }}>
          {l.t}
        </text>
      ))}
      <rect x={x + 20} y={140} width={120} height={80} fill="none" className="t-moyen" />
      <rect x={x + 60} y={170} width={20} height={20} fill="var(--color-beton-clair)" className="t-fin" />
      <text x={x + 150} y={176} fontSize={13} fill="var(--color-trait)" style={{ fontFamily: 'var(--font-manuscrite)' }}>
        croquis coté
      </text>
      <text x={x + 150} y={194} fontSize={13} fill="var(--color-trait)" style={{ fontFamily: 'var(--font-manuscrite)' }}>
        du défaut
      </text>
      <text x={x + 12} y={248} fontSize={14} fill={ROUGE} style={{ fontFamily: 'var(--font-manuscrite)' }}>
        À faire : réparer P4
      </text>
      <text x={x + 12} y={268} fontSize={14} fill={ROUGE} style={{ fontFamily: 'var(--font-manuscrite)' }}>
        qui : chef d’équipe · avant le jj/mm
      </text>
      <Renvoi de={[20, 30]} vers={[x + 8, 30]} texte="date, lieu, sujet" />
      <Renvoi de={[20, 96]} vers={[x + 8, 92]} texte="faits datés" />
      <Renvoi de={[20, 180]} vers={[x + 18, 180]} texte="croquis" />
      <Renvoi de={[500, 262]} vers={[x + 250, 262]} texte="action, qui, quand" />
      <Etiquette x={x} y={318} taille={10.5} classe="etiquette">
        modèle de page : chaque note porte une date et une unité
      </Etiquette>
    </Figure>
  );
}

// ---------- N0.1.3 : résoudre un problème ----------

/** Les données d'un énoncé rangées en deux listes, avec la conversion des longueurs en mètres. */
export function DonneesCherchees({ L, b, h, gamma }: { L: number; b: number; h: number; gamma: number }) {
  const connues = [
    { t: `L = ${nombre(L, 2)} m`, conv: '' },
    { t: `b = ${nombre(b * 100, 0)} cm`, conv: `= ${nombre(b, 2)} m` },
    { t: `h = ${nombre(h * 100, 0)} cm`, conv: `= ${nombre(h, 2)} m` },
    { t: `γ = ${nombre(gamma, 0)} kN/m³`, conv: '(EN 1991-1-1)' },
  ];
  return (
    <Figure alt={`Données classées : connues L = ${nombre(L, 2)} m, b = ${nombre(b * 100, 0)} cm soit ${nombre(b, 2)} m, h = ${nombre(h * 100, 0)} cm soit ${nombre(h, 2)} m, γ = ${gamma} kN/m³ ; cherchées : le poids P en kN et la charge par mètre en kN/m.`} largeur={620} hauteur={190}>
      <rect x={20} y={14} width={360} height={164} rx={8} fill="var(--color-encre-clair)" stroke={ENCRE} strokeWidth={1.4} />
      <Etiquette x={36} y={38} taille={13} gras couleur={ENCRE}>
        connues
      </Etiquette>
      {connues.map((c, i) => (
        <g key={c.t}>
          <text x={40} y={70 + i * 28} fontSize={17} fill={ENCRE} style={{ fontFamily: 'var(--font-manuscrite)' }}>
            {c.t}
          </text>
          {c.conv ? (
            <text x={190} y={70 + i * 28} fontSize={16} fill={i < 3 ? ROUGE : 'var(--color-beton)'} style={{ fontFamily: 'var(--font-manuscrite)' }}>
              {i < 3 ? '→ ' : ''}
              {c.conv}
            </text>
          ) : null}
        </g>
      ))}
      <rect x={400} y={14} width={200} height={164} rx={8} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1.4} />
      <Etiquette x={416} y={38} taille={13} gras couleur={VERT}>
        cherchées
      </Etiquette>
      {['P = ? (kN)', 'p = ? (kN/m)'].map((t, i) => (
        <text key={t} x={420} y={78 + i * 34} fontSize={17} fill={VERT} style={{ fontFamily: 'var(--font-manuscrite)' }}>
          {t}
        </text>
      ))}
      <Etiquette x={416} y={160} taille={10.5} classe="etiquette">
        en rouge : conversion en mètres
      </Etiquette>
    </Figure>
  );
}

/** Contrôle par ordre de grandeur sur une échelle logarithmique : le calcul juste, l'estimation de tête, et l'erreur d'unités. */
export function OrdreGrandeur({ exact, estime, faux, unite }: { exact: number; estime: number; faux: number; unite: string }) {
  const dmin = Math.floor(Math.log10(Math.min(exact, estime))) - 1;
  const dmax = Math.ceil(Math.log10(faux)) + 1;
  const x0 = 40;
  const lg = 540;
  const X = (v: number) => x0 + ((Math.log10(v) - dmin) / (dmax - dmin)) * lg;
  const y = 92;
  return (
    <Figure alt={`Échelle logarithmique : calcul ${nombre(exact, 2)} ${unite}, estimation de tête ${nombre(estime, 1)} ${unite} au même endroit ; le calcul fait en centimètres donne ${nombre(faux, 0)} ${unite}, des millions de fois plus loin.`} largeur={620} hauteur={180}>
      <line x1={x0} y1={y} x2={x0 + lg} y2={y} className="t-moyen" />
      {Array.from({ length: dmax - dmin + 1 }, (_, i) => {
        const d = dmin + i;
        return (
          <g key={d}>
            <line x1={X(10 ** d)} y1={y - 5} x2={X(10 ** d)} y2={y + 5} className="t-fin" />
            <Etiquette x={X(10 ** d)} y={y + 20} ancre="middle" taille={10.5}>
              {nombre(10 ** d, Math.max(0, -d))}
            </Etiquette>
          </g>
        );
      })}
      <rect x={X(estime / 1.5)} y={y - 12} width={X(estime * 1.5) - X(estime / 1.5)} height={24} fill="var(--color-validation-clair)" opacity={0.8} />
      <circle cx={X(exact)} cy={y} r={6} fill={VERT} />
      <Etiquette x={X(exact)} y={y - 38} ancre="middle" taille={11.5} gras couleur={VERT}>
        calcul : {nombre(exact, 2)} {unite}
      </Etiquette>
      <polygon points={`${X(estime)},${y - 6} ${X(estime) - 6},${y - 16} ${X(estime) + 6},${y - 16}`} fill={ENCRE} />
      <Etiquette x={X(estime)} y={y - 22} ancre="middle" taille={11} couleur={ENCRE}>
        de tête : {nombre(estime, 1)}
      </Etiquette>
      <circle cx={X(faux)} cy={y} r={6} fill={ROUGE} />
      <Etiquette x={X(faux)} y={y - 22} ancre="end" taille={11.5} gras couleur={ROUGE}>
        calcul en cm : {nombre(faux, 0)} {unite}
      </Etiquette>
      <Etiquette x={x0} y={22} taille={12} gras>
        échelle logarithmique : chaque graduation vaut 10 fois la précédente ({unite})
      </Etiquette>
      <Etiquette x={x0} y={160} taille={10.5} classe="etiquette">
        bande verte : même ordre de grandeur que l’estimation ; un facteur 10 ou plus signale une erreur
      </Etiquette>
    </Figure>
  );
}

/** Un mètre cube découpé en centimètres : 100 × 100 × 100 = 1 000 000 cm³. */
export function CubeMetre() {
  const a = 120;
  const P = (x: number, y: number, z: number) => [310 + (y - x) * 0.866 * a, 24 + (x + y) * 0.5 * a - z * a + a] as const;
  const pt = (q: readonly [number, number]) => `${q[0]},${q[1]}`;
  const face = (q: Array<readonly [number, number]>) => q.map(pt).join(' ');
  const n = 100;
  return (
    <Figure alt={`Un cube d'un mètre de côté : chaque arête mesure 100 cm, donc le cube contient 100 × 100 × 100 = ${nombre(n ** 3, 0)} petits cubes d'un centimètre cube.`} largeur={620} hauteur={306}>
      <polygon points={face([P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)])} fill="var(--color-beton-clair)" className="t-fort" />
      <polygon points={face([P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)])} fill="var(--fond-beton)" className="t-fort" />
      <polygon points={face([P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)])} fill="var(--color-papier)" className="t-fort" />
      {Array.from({ length: 9 }, (_, i) => (i + 1) / 10).map((t) => (
        <g key={t}>
          <line x1={P(t, 0, 1)[0]} y1={P(t, 0, 1)[1]} x2={P(t, 1, 1)[0]} y2={P(t, 1, 1)[1]} className="t-fin" opacity={0.5} />
          <line x1={P(0, t, 1)[0]} y1={P(0, t, 1)[1]} x2={P(1, t, 1)[0]} y2={P(1, t, 1)[1]} className="t-fin" opacity={0.5} />
        </g>
      ))}
      <polygon points={face([P(1, 0.9, 1), P(1, 1, 1), P(0.9, 1, 1), P(0.9, 0.9, 1)])} fill={ROUGE} />
      <Etiquette x={P(1, 1, 1)[0] + 14} y={P(1, 1, 1)[1] + 4} taille={11.5} gras couleur={ROUGE}>
        1 cm³ (dessin agrandi)
      </Etiquette>
      <Etiquette x={(P(1, 0, 0)[0] + P(1, 1, 0)[0]) / 2 - 6} y={(P(1, 0, 0)[1] + P(1, 1, 0)[1]) / 2 + 18} ancre="end" taille={12} gras>
        1 m = {n} cm
      </Etiquette>
      <Etiquette x={(P(0, 1, 0)[0] + P(1, 1, 0)[0]) / 2 + 6} y={(P(0, 1, 0)[1] + P(1, 1, 0)[1]) / 2 + 18} taille={12} gras>
        1 m = {n} cm
      </Etiquette>
      <Etiquette x={P(1, 0, 0.5)[0] - 12} y={P(1, 0, 0.5)[1]} ancre="end" taille={12} gras>
        1 m = {n} cm
      </Etiquette>
      <Etiquette x={310} y={P(1, 1, 0)[1] + 30} ancre="middle" taille={13} gras couleur={ENCRE}>
        1 m³ = {n} × {n} × {n} cm³ = {nombre(n ** 3, 0)} cm³
      </Etiquette>
    </Figure>
  );
}

/** Poteau en élévation et en coupe, coté. */
export function PoteauCote({ L, b, h }: { L: number; b: number; h: number }) {
  const k = 150 / L;
  const hb = Math.max(b * k, 14);
  const x = 150;
  const y = 30;
  const ks = 260;
  return (
    <Figure alt={`Poteau de ${nombre(L, 2)} m de haut, section ${nombre(b * 100, 0)} × ${nombre(h * 100, 0)} cm.`} largeur={620} hauteur={210}>
      <Etiquette x={x + hb / 2} y={20} ancre="middle" taille={12} gras>
        élévation
      </Etiquette>
      <rect x={x} y={y} width={hb} height={L * k} fill="var(--color-beton-clair)" className="t-fort" />
      <line x1={x - 30} y1={y + L * k} x2={x + hb + 30} y2={y + L * k} className="t-moyen" />
      <Cote x1={x + hb} y1={y + L * k} x2={x + hb} y2={y} decalage={-36} texte={`${nombre(L, 2)} m`} />
      <Etiquette x={420} y={20} ancre="middle" taille={12} gras>
        coupe
      </Etiquette>
      <rect x={420 - (b * ks) / 2} y={60} width={b * ks} height={h * ks} fill="var(--color-beton-clair)" className="t-fort" />
      <Cote x1={420 - (b * ks) / 2} y1={60 + h * ks} x2={420 + (b * ks) / 2} y2={60 + h * ks} decalage={-22} texte={`${nombre(b * 100, 0)} cm`} />
      <Cote x1={420 + (b * ks) / 2} y1={60 + h * ks} x2={420 + (b * ks) / 2} y2={60} decalage={-22} texte={`${nombre(h * 100, 0)} cm`} />
    </Figure>
  );
}

/** Poutre posée sur deux murs : poids propre réparti et réaction de chaque mur. */
export function PoutreDeuxMurs({ L, g, R }: { L: number; g: number; R: number }) {
  const x0 = 110;
  const lg = 400;
  const y = 66;
  return (
    <Figure alt={`Poutre de ${nombre(L, 2)} m sur deux murs, chargée par son poids propre g = ${nombre(g, 2)} kN/m ; chaque mur reçoit ${nombre(R, 2)} kN.`} largeur={620} hauteur={268}>
      <Hachures prefixe="pdm" types={['maconnerie']} />
      <rect x={x0 - 30} y={y + 20} width={40} height={90} fill={hachure('pdm', 'maconnerie')} className="t-moyen" />
      <rect x={x0 + lg - 10} y={y + 20} width={40} height={90} fill={hachure('pdm', 'maconnerie')} className="t-moyen" />
      <rect x={x0 - 30} y={y} width={lg + 60} height={20} fill="var(--color-beton-clair)" className="t-fort" />
      {Array.from({ length: 11 }, (_, i) => x0 - 20 + (i * (lg + 40)) / 10).map((x) => (
        <Fleche key={x} x1={x} y1={y - 34} x2={x} y2={y - 2} couleur={ROUGE} epaisseur={1.4} tete={6} />
      ))}
      <line x1={x0 - 20} y1={y - 34} x2={x0 + lg + 20} y2={y - 34} stroke={ROUGE} strokeWidth={1.4} />
      <Etiquette x={x0 + lg / 2} y={y - 42} ancre="middle" taille={12} gras couleur={ROUGE}>
        g = {nombre(g, 2)} kN/m (poids propre)
      </Etiquette>
      {[x0 - 10, x0 + lg + 10].map((x) => (
        <g key={x}>
          <Fleche x1={x} y1={y + 158} x2={x} y2={y + 114} couleur={VERT} epaisseur={2.2} tete={8} />
          <Etiquette x={x + 8} y={y + 148} taille={11.5} gras couleur={VERT}>
            R = {nombre(R, 2)} kN
          </Etiquette>
        </g>
      ))}
      <Cote x1={x0 - 30} y1={y + 164} x2={x0 + lg + 30} y2={y + 164} decalage={-20} texte={`L = ${nombre(L, 2)} m (longueur de la poutre)`} />
    </Figure>
  );
}

// ---------- N0.1.4 : présenter un calcul ----------

/** Un chèque et une ligne de calcul : chiffres, lettres, devise d'un côté ; formule, application numérique, unités de l'autre. */
export function ChequeEtCalcul({ ligne }: { ligne: string }) {
  return (
    <Figure alt={`Comparaison : un chèque donne le montant en lettres, en chiffres et la devise ; une ligne de calcul donne la formule littérale, l'application numérique et les unités : ${ligne}.`} largeur={620} hauteur={240}>
      <rect x={20} y={14} width={290} height={130} rx={6} fill="var(--color-papier)" className="t-fort" />
      <text x={34} y={40} fontSize={13} fill="var(--color-beton)">Payez contre ce chèque</text>
      <line x1={34} y1={66} x2={296} y2={66} className="t-fin" strokeDasharray="2 3" />
      <text x={40} y={62} fontSize={15} fill={ENCRE} style={{ fontFamily: 'var(--font-manuscrite)' }}>montant en lettres</text>
      <rect x={196} y={80} width={100} height={28} rx={3} fill="none" className="t-moyen" />
      <text x={206} y={99} fontSize={15} fill={ENCRE} style={{ fontFamily: 'var(--font-manuscrite)' }}>en chiffres</text>
      <text x={34} y={99} fontSize={14} fill={ENCRE} style={{ fontFamily: 'var(--font-manuscrite)' }}>devise</text>
      <text x={34} y={132} fontSize={12} fill="var(--color-beton)">signature</text>
      <rect x={330} y={14} width={270} height={130} rx={6} fill="var(--fond-note)" className="t-moyen" />
      {couper(ligne, 250, 14).map((l, i) => (
        <text key={i} x={344} y={46 + i * 22} fontSize={15} fill={ENCRE} style={{ fontFamily: 'var(--font-manuscrite)' }}>
          {l}
        </text>
      ))}
      {[
        ['en lettres', 'formule littérale'],
        ['en chiffres', 'application numérique'],
        ['devise', 'unités sur chaque ligne'],
      ].map(([a, b], i) => (
        <g key={a}>
          <Etiquette x={150} y={172 + i * 22} ancre="end" taille={12} gras>
            {a}
          </Etiquette>
          <Fleche x1={160} y1={168 + i * 22} x2={330} y2={168 + i * 22} couleur={ENCRE} epaisseur={1.4} tete={7} />
          <Etiquette x={340} y={172 + i * 22} taille={12} gras couleur={ENCRE}>
            {b}
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

export interface CasArrondi {
  valeur: number;
  pas: number;
  mode: 'proche' | 'exces';
  titre: string;
  unite?: string;
}

/** Arrondir sur une droite graduée : la valeur entre deux graduations, et la graduation retenue. */
export function DroitesArrondis({ cas }: { cas: readonly CasArrondi[] }) {
  const h = 76;
  const dec = (p: number) => Math.max(0, -Math.floor(Math.log10(p) + 1e-9));
  return (
    <Figure alt={cas.map((c) => `${c.titre} : ${nombre(c.valeur, 3)} donne ${nombre(c.mode === 'exces' ? arrondiSup(c.valeur, c.pas) : Math.round(c.valeur / c.pas) * c.pas, dec(c.pas))}`).join(' ; ')} largeur={620} hauteur={cas.length * h + 12}>
      {cas.map((c, i) => {
        const bas = Math.floor(c.valeur / c.pas + 1e-9) * c.pas;
        const haut = bas + c.pas;
        const retenu = c.mode === 'exces' ? arrondiSup(c.valeur, c.pas) : Math.round(c.valeur / c.pas) * c.pas;
        const x0 = 150;
        const lg = 380;
        const X = (v: number) => x0 + ((v - bas) / c.pas) * lg;
        const y = 34 + i * h;
        const u = c.unite ? ` ${c.unite}` : '';
        const d = dec(c.pas);
        return (
          <g key={c.titre}>
            <Etiquette x={14} y={y + 4} taille={11.5} gras>
              {c.titre}
            </Etiquette>
            <line x1={x0} y1={y} x2={x0 + lg} y2={y} className="t-moyen" />
            {[bas, (bas + haut) / 2, haut].map((v, k) => (
              <g key={k}>
                <line x1={X(v)} y1={y - (k === 1 ? 4 : 8)} x2={X(v)} y2={y + (k === 1 ? 4 : 8)} className="t-fin" />
                {k !== 1 ? (
                  <Etiquette x={X(v)} y={y + 24} ancre="middle" taille={11.5} gras={Math.abs(v - retenu) < 1e-9} couleur={Math.abs(v - retenu) < 1e-9 ? VERT : undefined}>
                    {nombre(v, d)}
                    {u}
                  </Etiquette>
                ) : null}
              </g>
            ))}
            <circle cx={X(c.valeur)} cy={y} r={5} fill={ENCRE} />
            <Etiquette x={X(c.valeur)} y={y - 12} ancre="middle" taille={11.5} gras couleur={ENCRE}>
              {nombre(c.valeur, 3)}
            </Etiquette>
            <path d={`M ${X(c.valeur)} ${y + 6} Q ${(X(c.valeur) + X(retenu)) / 2} ${y + 34} ${X(retenu)} ${y + 8}`} fill="none" stroke={VERT} strokeWidth={1.6} />
            <Etiquette x={x0 + lg + 14} y={y + 4} taille={11} couleur={VERT} gras>
              {c.mode === 'exces' ? 'par excès' : 'au plus proche'}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Bon de commande de béton : chaque ligne porte une valeur et son unité. */
export function BonCommandeBeton({ volume, commande, ouvrage }: { volume: number; commande: number; ouvrage: string }) {
  const lignes = [
    ['Chantier', 'adresse, accès du camion'],
    ['Ouvrage', ouvrage],
    ['Volume commandé', `${nombre(commande, 1)} m³ (besoin : ${nombre(volume, 2)} m³)`],
    ['Classe de résistance', 'C25/30 (selon le projet)'],
    ['Livraison', 'date et heure, débit souhaité'],
    ['Contact', 'nom, téléphone'],
  ];
  return (
    <Figure alt={`Bon de commande de béton : ouvrage ${ouvrage}, volume commandé ${nombre(commande, 1)} m³ pour un besoin de ${nombre(volume, 2)} m³, classe, livraison, contact.`} largeur={620} hauteur={250}>
      <rect x={90} y={12} width={440} height={226} rx={4} fill="var(--color-papier)" className="t-fort" />
      <rect x={90} y={12} width={440} height={34} fill="var(--color-beton-clair)" />
      <Etiquette x={110} y={34} taille={13.5} gras>
        Bon de commande — béton prêt à l’emploi
      </Etiquette>
      {lignes.map(([a, b], i) => (
        <g key={a}>
          <Etiquette x={110} y={72 + i * 28} taille={12} gras>
            {a}
          </Etiquette>
          <line x1={250} y1={76 + i * 28} x2={510} y2={76 + i * 28} className="t-fin" strokeDasharray="2 3" />
          <text x={256} y={72 + i * 28} fontSize={14} fill={i === 2 ? ROUGE : ENCRE} style={{ fontFamily: 'var(--font-manuscrite)' }}>
            {b}
          </text>
        </g>
      ))}
    </Figure>
  );
}

// ---------- N0.1.5 : organiser son année ----------

/** Rétroplanning d'un chantier : on part de la livraison et on remonte les tâches. */
export function RetroplanningChantier() {
  const taches = ['Fondations', 'Poteaux et poutres', 'Dalle', 'Toiture', 'Finitions'];
  const x0 = 150;
  const w = 72;
  return (
    <Figure alt="Rétroplanning d'un chantier : fondations, puis poteaux et poutres, puis dalle, puis toiture, puis finitions jusqu'à la livraison ; on le construit en partant de la date de livraison et en remontant le temps." largeur={620} hauteur={240}>
      {taches.map((t, i) => (
        <g key={t}>
          <Etiquette x={x0 - 10} y={58 + i * 30} ancre="end" taille={12}>
            {t}
          </Etiquette>
          <rect x={x0 + i * w} y={44 + i * 30} width={w} height={20} rx={3} fill="var(--color-encre-clair)" stroke={ENCRE} strokeWidth={1.2} />
          {i > 0 ? <Fleche x1={x0 + i * w} y1={44 + (i - 1) * 30 + 20} x2={x0 + i * w} y2={44 + i * 30 - 1} couleur="var(--trait)" epaisseur={1.2} tete={6} /> : null}
        </g>
      ))}
      <polygon points={`${x0 + 5 * w + 14},${44 + 4 * 30 + 10} ${x0 + 5 * w + 24},${44 + 4 * 30} ${x0 + 5 * w + 34},${44 + 4 * 30 + 10} ${x0 + 5 * w + 24},${44 + 4 * 30 + 20}`} fill={ROUGE} />
      <Etiquette x={x0 + 5 * w + 40} y={44 + 4 * 30 + 15} taille={12} gras couleur={ROUGE}>
        livraison
      </Etiquette>
      <Fleche x1={x0 + 5 * w + 20} y1={26} x2={x0 + 10} y2={26} couleur={ROUGE} epaisseur={1.8} tete={9} />
      <Etiquette x={x0 + 2.5 * w} y={18} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        on construit le planning à rebours, depuis la date de livraison
      </Etiquette>
      <Etiquette x={x0} y={226} taille={10.5} classe="etiquette">
        chaque tâche commence quand la précédente est finie ; durées relatives, sans échelle
      </Etiquette>
    </Figure>
  );
}

/** Les 168 heures d'une semaine en anneau : chaque poste du budget-temps et le temps libre qui reste. */
export function Semaine168({ parts, total }: { parts: ReadonlyArray<{ cle: string; libelle: string; heures: number }>; total: number }) {
  const couleurs: Record<string, string> = {
    cours: 'var(--color-encre)',
    perso: 'var(--color-acier)',
    sommeil: 'var(--color-beton)',
    vie: 'var(--color-terre)',
    transport: 'var(--color-brique)',
    libre: 'var(--color-validation)',
  };
  const c = [160, 128] as const;
  const R = 100;
  const r = 56;
  let a = -Math.PI / 2;
  const somme = parts.reduce((s, p) => s + p.heures, 0) || 1;
  return (
    <Figure alt={`Une semaine de ${total} heures : ${parts.map((p) => `${p.libelle.toLowerCase()} ${nombre(p.heures, 0)} h`).join(', ')}.`} largeur={620} hauteur={256}>
      {parts.map((p) => {
        const da = (p.heures / somme) * 2 * Math.PI;
        const a1 = a;
        const a2 = a + da;
        a = a2;
        const grand = da > Math.PI ? 1 : 0;
        const pt = (rr: number, ang: number) => `${c[0] + rr * Math.cos(ang)} ${c[1] + rr * Math.sin(ang)}`;
        return p.heures > 0 ? <path key={p.cle} d={`M ${pt(R, a1)} A ${R} ${R} 0 ${grand} 1 ${pt(R, a2)} L ${pt(r, a2)} A ${r} ${r} 0 ${grand} 0 ${pt(r, a1)} Z`} fill={couleurs[p.cle] ?? 'var(--color-beton)'} opacity={0.85} stroke="var(--color-papier)" strokeWidth={1.5} /> : null;
      })}
      <Etiquette x={c[0]} y={c[1] - 2} ancre="middle" taille={20} gras>
        {nombre(total, 0)} h
      </Etiquette>
      <Etiquette x={c[0]} y={c[1] + 18} ancre="middle" taille={11} classe="etiquette">
        par semaine
      </Etiquette>
      {parts.map((p, i) => (
        <g key={`l${p.cle}`}>
          <rect x={330} y={40 + i * 30} width={18} height={18} fill={couleurs[p.cle] ?? 'var(--color-beton)'} opacity={0.85} />
          <Etiquette x={356} y={54 + i * 30} taille={12.5}>
            {p.libelle} : <tspan fontWeight={700}>{nombre(p.heures, 0)} h</tspan>
          </Etiquette>
        </g>
      ))}
    </Figure>
  );
}

// ---------- N0.1.6 : chercher et vérifier ----------

/** La famille des Eurocodes : bases, actions, matériaux, géotechnique et séisme ; chaque pays ajoute son annexe nationale. */
export function FamilleEurocodes() {
  const materiaux = [
    ['EN 1992', 'béton'],
    ['EN 1993', 'acier'],
    ['EN 1994', 'mixte'],
    ['EN 1995', 'bois'],
    ['EN 1996', 'maçonnerie'],
    ['EN 1999', 'aluminium'],
  ];
  const boite = (x: number, y: number, w: number, code: string, nom: string, fond: string) => (
    <g key={code}>
      <rect x={x} y={y} width={w} height={44} rx={6} fill={fond} className="t-moyen" />
      <Etiquette x={x + w / 2} y={y + 19} ancre="middle" taille={12.5} gras>
        {code}
      </Etiquette>
      <Etiquette x={x + w / 2} y={y + 35} ancre="middle" taille={11}>
        {nom}
      </Etiquette>
    </g>
  );
  return (
    <Figure alt="Famille des Eurocodes : EN 1990 pour les bases de calcul, EN 1991 pour les actions, EN 1992 à EN 1996 et EN 1999 par matériau, EN 1997 pour la géotechnique et EN 1998 pour le séisme ; chaque pays les complète par une annexe nationale." largeur={620} hauteur={300}>
      {boite(230, 12, 160, 'EN 1990', 'bases de calcul', 'var(--color-encre-clair)')}
      {boite(230, 78, 160, 'EN 1991', 'actions (charges)', 'var(--color-brique-clair)')}
      <line x1={310} y1={56} x2={310} y2={78} className="t-moyen" />
      <line x1={310} y1={122} x2={310} y2={140} className="t-moyen" />
      <line x1={57} y1={140} x2={563} y2={140} className="t-moyen" />
      {materiaux.map(([code, nom], i) => (
        <g key={code}>
          <line x1={57 + i * 101} y1={140} x2={57 + i * 101} y2={152} className="t-moyen" />
          {boite(14 + i * 101, 152, 88, code!, nom!, 'var(--color-acier-clair)')}
        </g>
      ))}
      <line x1={310} y1={196} x2={310} y2={214} className="t-moyen" />
      <line x1={190} y1={214} x2={430} y2={214} className="t-moyen" />
      {boite(110, 226, 160, 'EN 1997', 'géotechnique', 'var(--color-terre-clair)')}
      {boite(350, 226, 160, 'EN 1998', 'séisme', 'var(--color-correction-clair)')}
      <line x1={190} y1={214} x2={190} y2={226} className="t-moyen" />
      <line x1={430} y1={214} x2={430} y2={226} className="t-moyen" />
      <Etiquette x={600} y={36} ancre="end" taille={11} classe="etiquette">
        + annexe nationale
      </Etiquette>
      <Etiquette x={600} y={52} ancre="end" taille={11} classe="etiquette">
        de chaque pays
      </Etiquette>
      <Etiquette x={14} y={292} taille={10.5} classe="etiquette">
        on calcule toujours avec EN 1990 + EN 1991 + l’Eurocode du matériau (+ EN 1997 pour le sol, EN 1998 si séisme)
      </Etiquette>
    </Figure>
  );
}

/** Cinq filtres successifs : une valeur n'est utilisable que si elle les franchit tous. */
export function FiltreCinqQuestions() {
  const q = [
    ['Qui ?', 'auteur identifié, compétent'],
    ['Quand ?', 'date, norme en vigueur'],
    ['D’où ?', 'source primaire citée'],
    ['Cohérent ?', 'unités, ordre de grandeur, recalcul'],
    ['Confirmé ?', 'deuxième source indépendante'],
  ];
  const y0 = 46;
  const pas = 50;
  return (
    <Figure alt="Une information technique passe cinq filtres : qui, quand, d'où, cohérent, confirmé. À chaque filtre, une réponse négative l'arrête ; si elle passe les cinq, la valeur est utilisable avec sa référence." largeur={620} hauteur={y0 + q.length * pas + 66}>
      <rect x={170} y={8} width={220} height={28} rx={14} fill="var(--color-beton-clair)" className="t-moyen" />
      <Etiquette x={280} y={27} ancre="middle" taille={12.5} gras>
        une information technique
      </Etiquette>
      {q.map(([t, d], i) => {
        const y = y0 + i * pas;
        return (
          <g key={t}>
            <Fleche x1={280} y1={y - 10} x2={280} y2={y + 2} couleur="var(--trait)" epaisseur={1.6} tete={7} />
            <rect x={130} y={y + 4} width={300} height={34} rx={6} fill="var(--color-encre-clair)" stroke={ENCRE} strokeWidth={1.3} />
            <Etiquette x={144} y={y + 26} taille={13} gras couleur={ENCRE}>
              {t}
            </Etiquette>
            <Etiquette x={228} y={y + 26} taille={11}>
              {d}
            </Etiquette>
            <Fleche x1={430} y1={y + 21} x2={470} y2={y + 21} couleur={ROUGE} epaisseur={1.4} tete={7} />
            <Etiquette x={476} y={y + 25} taille={11} couleur={ROUGE}>
              non : on ne l’utilise pas
            </Etiquette>
          </g>
        );
      })}
      <Fleche x1={280} y1={y0 + q.length * pas - 10} x2={280} y2={y0 + q.length * pas + 4} couleur={VERT} epaisseur={1.8} tete={8} />
      <rect x={140} y={y0 + q.length * pas + 6} width={280} height={34} rx={17} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1.4} />
      <Etiquette x={280} y={y0 + q.length * pas + 28} ancre="middle" taille={12.5} gras couleur={VERT}>
        valeur utilisable, avec sa référence
      </Etiquette>
    </Figure>
  );
}

/** Diagramme des causes : la résistance d'un béton dépend de bien plus que son dosage en ciment. */
export function CausesResistanceBeton() {
  const causes = [
    { t: 'dosage en ciment', haut: true },
    { t: 'rapport eau / ciment', haut: true },
    { t: 'granulats', haut: true },
    { t: 'type de ciment', haut: false },
    { t: 'malaxage, mise en place', haut: false },
    { t: 'cure (humidité)', haut: false },
  ];
  const y = 132;
  return (
    <Figure alt="Diagramme des causes : la résistance mesurée d'un béton dépend du dosage en ciment, du rapport eau sur ciment, des granulats, du type de ciment, du malaxage et de la mise en place, et de la cure." largeur={620} hauteur={282}>
      <Fleche x1={30} y1={y} x2={470} y2={y} couleur="var(--trait)" epaisseur={2.6} tete={12} />
      <rect x={476} y={y - 34} width={134} height={68} rx={8} fill="var(--color-validation-clair)" stroke={VERT} strokeWidth={1.4} />
      <Etiquette x={543} y={y - 8} ancre="middle" taille={12.5} gras couleur={VERT}>
        résistance
      </Etiquette>
      <Etiquette x={543} y={y + 10} ancre="middle" taille={11}>
        mesurée par essais
      </Etiquette>
      {causes.map((c, i) => {
        const k = i % 3;
        const xb = 92 + k * 140;
        const yb = c.haut ? y - 84 : y + 84;
        return (
          <g key={c.t}>
            <line x1={xb} y1={yb} x2={xb + 56} y2={y} className="t-moyen" />
            <rect x={xb - 64} y={c.haut ? yb - 30 : yb} width={128} height={30} rx={6} fill={i === 0 ? 'var(--color-correction-clair)' : 'var(--color-encre-clair)'} className="t-fin" />
            <Etiquette x={xb} y={(c.haut ? yb - 30 : yb) + 20} ancre="middle" taille={11} gras>
              {c.t}
            </Etiquette>
          </g>
        );
      })}
      <Etiquette x={30} y={272} taille={10.5} classe="etiquette">
        en rouge : la seule cause citée par le message ; les cinq autres changent aussi la résistance
      </Etiquette>
    </Figure>
  );
}

/** Les trois natures de règles côte à côte : d'où elles viennent, si elles s'imposent, un exemple, comment les écrire. */
export function TroisNatures() {
  const colonnes = [
    { titre: 'Règle normative', teinte: TEINTES.encre, cases: ['norme ou texte réglementaire', 'oui, si le contrat ou la réglementation l’impose', 'poids volumique du béton armé (EN 1991-1-1)', 'citer la norme, l’article, le tableau'] },
    { titre: 'Règle de l’art', teinte: TEINTES.terre, cases: ['pratique reconnue par la profession', 'pas imposée par un texte, mais attendue d’un professionnel', 'humidifier le béton jeune en climat chaud', 'écrire « règle de l’art »'] },
    { titre: 'Simplification pédagogique', teinte: TEINTES.beton, cases: ['cours, manuel, exercice', 'non : jamais seule dans un projet', 'un mur pris comme appui simple', 'écrire « simplification »'] },
  ];
  const lignes = ['d’où vient-elle ?', 'obligatoire ?', 'exemple', 'on l’écrit'];
  const w = 192;
  const g = 12;
  const x0 = 11;
  const yT = 8;
  const hT = 32;
  const textes = colonnes.map((c) => c.cases.map((t) => couper(t, w - 20, 11.5)));
  const hauteurs = lignes.map((_, r) => 22 + Math.max(...textes.map((col) => col[r]!.length)) * 14);
  const ys = hauteurs.map((_, r) => yT + hT + 6 + hauteurs.slice(0, r).reduce((s, h) => s + h, 0));
  const bas = ys[ys.length - 1]! + hauteurs[hauteurs.length - 1]!;
  return (
    <Figure alt={`Trois natures de règles. ${colonnes.map((c) => `${c.titre} : ${c.cases.map((t, r) => `${lignes[r]} ${t}`).join(' ; ')}`).join('. ')}.`} largeur={620} hauteur={bas + 10}>
      {colonnes.map((c, i) => {
        const x = x0 + i * (w + g);
        return (
          <g key={c.titre}>
            <rect x={x} y={yT} width={w} height={bas - yT} rx={8} fill="var(--color-papier)" />
            <rect x={x} y={yT} width={w} height={hT} rx={8} fill={c.teinte.fond} />
            <rect x={x} y={yT + hT - 8} width={w} height={8} fill={c.teinte.fond} />
            <line x1={x} y1={yT + hT} x2={x + w} y2={yT + hT} stroke={c.teinte.trait} strokeWidth={1.3} />
            <rect x={x} y={yT} width={w} height={bas - yT} rx={8} fill="none" stroke={c.teinte.trait} strokeWidth={1.3} />
            <Etiquette x={x + w / 2} y={yT + 21} ancre="middle" taille={13} gras couleur={c.teinte.trait}>
              {c.titre}
            </Etiquette>
            {textes[i]!.map((ls, r) => (
              <g key={lignes[r]}>
                <Etiquette x={x + 10} y={ys[r]! + 12} taille={9.5} classe="etiquette">
                  {lignes[r]}
                </Etiquette>
                {ls.map((l, k) => (
                  <Etiquette key={l} x={x + 10} y={ys[r]! + 27 + k * 14} taille={11.5}>
                    {l}
                  </Etiquette>
                ))}
              </g>
            ))}
          </g>
        );
      })}
    </Figure>
  );
}

/** Deux références distinctes : on en choisit une pour tout le calcul ; on ne les mélange pas. */
export function NePasMelanger() {
  return (
    <Figure alt="Deux références séparées : les règles BAEL 91 et les Eurocodes, chacune avec ses coefficients et ses méthodes. On ne prend pas un coefficient dans l'une et une méthode dans l'autre ; on peut comparer les deux résultats, à part." largeur={620} hauteur={200}>
      {[
        { x: 20, t: 'BAEL 91', l: ['ses coefficients', 'ses méthodes', 'ses combinaisons'], f: 'var(--color-terre-clair)' },
        { x: 380, t: 'Eurocodes', l: ['EN 1990, EN 1991, EN 1992-1-1', '+ annexe nationale', 'leurs coefficients'], f: 'var(--color-encre-clair)' },
      ].map((b) => (
        <g key={b.t}>
          <rect x={b.x} y={20} width={220} height={110} rx={8} fill={b.f} className="t-moyen" />
          <Etiquette x={b.x + 110} y={46} ancre="middle" taille={14} gras>
            {b.t}
          </Etiquette>
          {b.l.map((t, i) => (
            <Etiquette key={t} x={b.x + 110} y={72 + i * 18} ancre="middle" taille={11.5}>
              {t}
            </Etiquette>
          ))}
        </g>
      ))}
      <Fleche x1={244} y1={60} x2={376} y2={60} couleur={ROUGE} epaisseur={1.8} tete={8} />
      <Fleche x1={376} y1={92} x2={244} y2={92} couleur={ROUGE} epaisseur={1.8} tete={8} />
      <line x1={290} y1={50} x2={330} y2={102} stroke={ROUGE} strokeWidth={3} />
      <line x1={330} y1={50} x2={290} y2={102} stroke={ROUGE} strokeWidth={3} />
      <Etiquette x={310} y={124} ancre="middle" taille={11.5} gras couleur={ROUGE}>
        mélanger
      </Etiquette>
      <Etiquette x={310} y={168} ancre="middle" taille={12} gras couleur={VERT}>
        ✓ une référence pour tout le calcul ; comparer les résultats à part
      </Etiquette>
    </Figure>
  );
}

/** Première page d'une note de calcul : la liste des références, avec leurs dates. */
export function NoteReferences() {
  const refs = ['EN 1990:2002 — bases de calcul des structures', 'EN 1991-1-1:2002 — poids propres, charges d’exploitation', 'EN 1992-1-1:2004 et son annexe nationale — béton', 'plans du projet, indice et date', 'rapport géotechnique, date'];
  return (
    <Figure alt={`Première page d'une note de calcul : 1. Références : ${refs.join(' ; ')}.`} largeur={620} hauteur={250}>
      <rect x={100} y={12} width={420} height={228} rx={4} fill="var(--color-papier)" className="t-fort" />
      <Etiquette x={120} y={40} taille={14} gras>
        Note de calcul — projet, indice, date
      </Etiquette>
      <line x1={120} y1={50} x2={500} y2={50} className="t-moyen" />
      <Etiquette x={120} y={76} taille={13} gras couleur={ENCRE}>
        1. Références
      </Etiquette>
      {refs.map((r, i) => (
        <Etiquette key={r} x={136} y={102 + i * 24} taille={12}>
          • {r}
        </Etiquette>
      ))}
      <Etiquette x={120} y={228} taille={11} classe="etiquette">
        2. Hypothèses · 3. Schémas · 4. Calculs · 5. Conclusions
      </Etiquette>
    </Figure>
  );
}

/** Sources classées de la plus fiable (1) à la moins fiable. */
export function ClassementSources({ sources }: { sources: readonly string[] }) {
  return (
    <Figure alt={`Sources classées de la plus fiable à la moins fiable : ${sources.map((s, i) => `${i + 1}. ${s}`).join(' ; ')}.`} largeur={620} hauteur={sources.length * 44 + 30}>
      {sources.map((s, i) => {
        const w = 520 - i * 50;
        return (
          <g key={s}>
            <rect x={310 - w / 2} y={14 + i * 44} width={w} height={36} rx={6} fill={i === 0 ? 'var(--color-validation-clair)' : i === sources.length - 1 ? 'var(--color-correction-clair)' : 'var(--color-beton-clair)'} className="t-moyen" />
            <Etiquette x={310} y={37 + i * 44} ancre="middle" taille={12.5} gras>
              {i + 1}. {s}
            </Etiquette>
          </g>
        );
      })}
    </Figure>
  );
}

/** Section de poteau citée par une « règle de chantier » : dimensions et barres, sans prétendre la justifier. */
export function SectionPoteauCitee({ b, n, phi }: { b: number; n: number; phi: number }) {
  const ech = 900;
  return (
    <Figure alt={`Section de poteau de ${nombre(b * 100, 0)} × ${nombre(b * 100, 0)} cm avec ${n} barres de ${phi} mm, telle que citée ; cadres et enrobage non précisés.`} largeur={620} hauteur={b * ech + 80}>
      <SectionFerraillee b={b} h={b} enrobage={25} phiL={phi} phiT={6} n={n} echelle={ech} x={220} y={30} prefixe="spc" cotes={false} />
      <Cote x1={220} y1={30 + b * ech} x2={220 + b * ech} y2={30 + b * ech} decalage={-18} texte={`${nombre(b * 100, 0)} cm`} />
      <Cote x1={220 + b * ech} y1={30 + b * ech} x2={220 + b * ech} y2={30} decalage={-18} texte={`${nombre(b * 100, 0)} cm`} />
      <Etiquette x={310} y={20} ancre="middle" taille={12} gras>
        {n} HA {phi} « qui passent toujours »
      </Etiquette>
      <Etiquette x={20} y={b * ech + 70} taille={10.5} classe="etiquette">
        cadres et enrobage dessinés à titre d’illustration : la règle citée ne les précise pas
      </Etiquette>
    </Figure>
  );
}
