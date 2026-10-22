// Schémas du module N0.1 (méthode de travail) : page de notes, fiche de révision, démarche en 5 étapes.
import { Etiquette, Figure, Renvoi } from '@/components/drawing/Figure';

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
