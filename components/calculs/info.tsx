// Fiches de calcul du module L1.7 (informatique de l'ingénieur).
// Les valeurs viennent de lib/calc/tableur.ts et lib/calc/programmation.ts ; ce fichier ne fait que formater.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { FeuilleTableur, GrapheMomentTableur, SommeProdSchema } from '@/components/schemas/InfoCours1';
import { BandeTolerance, Console, FigureMatplotlib, ResultatsTests } from '@/components/schemas/InfoCours2';
import { afficherValeur, evaluerFeuille, FEUILLE_ACIERS, FEUILLE_BETON, feuilleCalculateur, feuilleMoment, momentMaxTheorique, type Feuille } from '@/lib/calc/tableur';
import {
  arrondiPython,
  calculateurReactions,
  CSV_EPROUVETTES,
  effortsPoutre,
  executerTests,
  formatF,
  isclose,
  lireEprouvettes,
  poidsPropre,
  reactionsPonctuelle,
  reprFlottant,
  statsEprouvettes,
  tableauReactions,
  verificationFlexion,
} from '@/lib/calc/programmation';
import { grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

// ---------- L1.7.1 : feuille de béton ----------
type ResBeton = { f: Feuille; v: ReturnType<typeof evaluerFeuille> };
const betonDef: DefinitionCalcul<ResBeton> = {
  champs: [
    champ('prix', 'prix du béton livré (B1)', 'p', '$/m³', 100, 300, 5, 0),
    champ('n', 'nombre de semelles (B4)', 'n', '', 1, 20, 1, 0),
    champ('cote', 'côté des semelles (C4 = D4)', 'a', 'm', 0.6, 2, 0.05, 2),
    champ('ep', 'épaisseur de la dalle (E7)', 'e', 'm', 0.12, 0.25, 0.01, 2),
  ],
  defaut: { prix: 180, n: 6, cote: 1.2, ep: 0.16 },
  calculer: (e) => {
    const f: Feuille = { ...FEUILLE_BETON, B1: num(e, 'prix'), B4: num(e, 'n'), C4: num(e, 'cote'), D4: num(e, 'cote'), E7: num(e, 'ep') };
    return { f, v: evaluerFeuille(f) };
  },
  valeurs: {
    V: (r) => grandeur(Number(r.v.F8), 3, 'm³'),
    cout: (r) => grandeur(Number(r.v.G8), 2, '$'),
  },
  lignes: {
    semelles: (r) => (
      <>
        F4 = B4*C4*D4*E4 = {r.f.B4} × {n2(Number(r.f.C4))} × {n2(Number(r.f.D4))} × {n2(Number(r.f.E4))} = <strong>{n3(Number(r.v.F4))} m³</strong>
      </>
    ),
    cout: (r) => (
      <>
        G4 = F4*$B$1 = {n3(Number(r.v.F4))} × {r.f.B1} = <strong>{n2(Number(r.v.G4))} $</strong>
      </>
    ),
    total: (r) => (
      <>
        F8 = SOMME(F4:F7) = <strong>{n3(Number(r.v.F8))} m³</strong> ; G8 = SOMME(G4:G7) = <strong>{n2(Number(r.v.G8))} $</strong>
      </>
    ),
  },
  schema: ({ r }) => (
    <FeuilleTableur
      feuille={r.f}
      plage="A3:G8"
      alt={`La feuille de calcul du béton : quatre éléments, leurs dimensions, leurs volumes et leurs coûts ; total ${n3(Number(r.v.F8))} m³ pour ${n2(Number(r.v.G8))} $.`}
      decimales={{ F: 3, G: 2 }}
      largeurs={{ A: 80, B: 60, C: 56, D: 56, E: 56, F: 70, G: 80 }}
      entrees={['B4', 'C4', 'D4', 'E4', 'B5', 'C5', 'D5', 'E5', 'B6', 'C6', 'D6', 'E6', 'B7', 'C7', 'D7', 'E7']}
      actif="G4"
    />
  ),
};

// ---------- L1.7.2 : masse d'acier ----------
type ResAciers = { f: Feuille; v: ReturnType<typeof evaluerFeuille> };
const aciersDef: DefinitionCalcul<ResAciers> = {
  champs: [
    { type: 'choix', cle: 'phi', libelle: 'diamètre des barres du repère 1 (E2)', symbole: 'φ', options: [10, 12, 14].map((p) => ({ valeur: p, libelle: `HA ${p}` })) },
    champ('n', 'nombre de barres du repère 1 (F2)', 'n', '', 2, 6, 1, 0),
    champ('nc', 'nombre de cadres (F4)', <>n<sub>c</sub></>, '', 10, 40, 1, 0),
  ],
  defaut: { phi: 12, n: 3, nc: 27 },
  calculer: (e) => {
    const f: Feuille = { ...FEUILLE_ACIERS, E2: num(e, 'phi'), F2: num(e, 'n'), F4: num(e, 'nc') };
    return { f, v: evaluerFeuille(f) };
  },
  valeurs: {
    kg: (r) => grandeur(Number(r.v.H2), 3, 'kg/m'),
    masse: (r) => grandeur(Number(r.v.H6), 2, 'kg'),
    verdict: (r) => afficherValeur(r.v.H7),
  },
  lignes: {
    recherche: (r) => (
      <>
        H2 = RECHERCHEV(E2;$A$2:$B$6;2;FAUX) : on cherche {r.f.E2} dans la colonne A, on lit la colonne B → <strong>{n3(Number(r.v.H2))} kg/m</strong>
      </>
    ),
    sommeprod: (r) => (
      <>
        H6 = SOMMEPROD(F2:F4;G2:G4;H2:H4) = {r.f.F2} × 3,94 × {n3(Number(r.v.H2))} + 2 × 3,94 × {n3(Number(r.v.H3))} + {r.f.F4} × 1,12 × {n3(Number(r.v.H4))} = <strong>{n2(Number(r.v.H6))} kg</strong>
      </>
    ),
    si: (r) => (
      <>
        H7 = SI(H6&lt;30;"OK";"à revoir") → <strong>{afficherValeur(r.v.H7)}</strong>
      </>
    ),
  },
  schema: ({ r }) => <SommeProdSchema feuille={r.f} colonnes={['F', 'G', 'H']} lignes={[2, 3, 4]} noms={['nombre', 'longueur (m)', 'kg/m']} />,
};

// ---------- L1.7.3 : moment tabulé ----------
type ResMoment = { f: Feuille; v: ReturnType<typeof evaluerFeuille>; L: number; q: number; n: number; theorie: number };
const momentDef: DefinitionCalcul<ResMoment> = {
  champs: [champ('L', 'portée (B1)', 'L', 'm', 2, 8, 0.5, 2), champ('q', 'charge uniforme (B2)', 'q', 'kN/m', 2, 30, 1, 0)],
  defaut: { L: 5, q: 12 },
  calculer: (e) => {
    const L = num(e, 'L');
    const q = num(e, 'q');
    const f = feuilleMoment(L, q, 0.5);
    return { f, v: evaluerFeuille(f), L, q, n: Math.round(L / 0.5), theorie: momentMaxTheorique(L, q) };
  },
  valeurs: {
    max: (r) => grandeur(Number(r.v[`B${6 + r.n}`]), 2, 'kN·m'),
    theorie: (r) => grandeur(r.theorie, 2, 'kN·m'),
  },
  lignes: {
    formule: () => <>B5 = $B$2*A5*($B$1-A5)/2, recopiée jusqu'en bas ; A6 = A5+0,5</>,
    max: (r) => (
      <>
        MAX de la colonne B = <strong>{n2(Number(r.v[`B${6 + r.n}`]))} kN·m</strong>
      </>
    ),
    controle: (r) => (
      <>
        contrôle à la main : q L² / 8 = {r.q} × {n2(r.L)}² / 8 = <strong>{n2(r.theorie)} kN·m</strong>
      </>
    ),
  },
  schema: ({ r }) => <GrapheMomentTableur feuille={r.f} n={r.n} />,
};

// ---------- L1.7.4 : premier programme ----------
type ResPoids = { b: number; h: number; L: number; gamma: number; G: number };
const poidsDef: DefinitionCalcul<ResPoids> = {
  champs: [
    champ('b', 'largeur b', 'b', 'm', 0.15, 0.5, 0.05, 2),
    champ('h', 'hauteur h', 'h', 'm', 0.2, 0.8, 0.05, 2),
    champ('L', 'longueur L', 'L', 'm', 1, 10, 0.5, 1),
    champ('gamma', 'poids volumique', 'γ', 'kN/m³', 20, 26, 1, 0),
  ],
  defaut: { b: 0.2, h: 0.4, L: 5, gamma: 25 },
  calculer: (e) => {
    const d = { b: num(e, 'b'), h: num(e, 'h'), L: num(e, 'L'), gamma: num(e, 'gamma') };
    return { ...d, G: poidsPropre(d) };
  },
  valeurs: { G: (r) => grandeur(r.G, 2, 'kN') },
  lignes: {
    calcul: (r) => (
      <>
        G = b * h * L * gamma = {n2(r.b)} × {n2(r.h)} × {nombre(r.L, 1)} × {r.gamma} = <strong>{n2(r.G)} kN</strong>
      </>
    ),
  },
  schema: ({ r }) => (
    <Console
      lignes={[`>>> G = b * h * L * gamma`, `>>> print(G)`, reprFlottant(r.G), `>>> print(round(G, 2))`, reprFlottant(arrondiPython(r.G, 2)), `>>> print(f"G = {G:.2f} kN")`, `G = ${formatF(r.G, 2)} kN`]}
      alt={`Ce qu'imprime Python : G vaut ${reprFlottant(r.G)} ; arrondi à deux décimales, ${reprFlottant(arrondiPython(r.G, 2))} ; formaté, G = ${formatF(r.G, 2)} kN.`}
    />
  ),
};

// ---------- L1.7.5 : fonction et boucle ----------
type ResBoucle = { L: number; P: number; lignes: string[]; taux: number; verdict: string };
const boucleDef: DefinitionCalcul<ResBoucle> = {
  champs: [champ('L', 'portée L', 'L', 'm', 2, 10, 0.5, 1), champ('P', 'charge P', 'P', 'kN', 5, 100, 5, 0), champ('MRd', 'moment résistant (énoncé)', <>M<sub>Rd</sub></>, 'kN·m', 10, 200, 5, 0)],
  defaut: { L: 5, P: 20, MRd: 30 },
  calculer: (e) => {
    const L = num(e, 'L');
    const P = num(e, 'P');
    const pos = Array.from({ length: Math.round(L) + 1 }, (_, i) => i).concat([L / 2]).sort((a, b) => a - b).filter((x, i, t) => i === 0 || x !== t[i - 1]);
    const v = verificationFlexion((P * L) / 4, num(e, 'MRd'));
    return { L, P, lignes: ['     a      RA      RB', ...tableauReactions(L, P, pos)], taux: v.taux, verdict: v.verdict };
  },
  valeurs: { taux: (r) => n2(r.taux), verdict: (r) => r.verdict },
  lignes: {
    milieu: (r) => {
      const [RA, RB] = reactionsPonctuelle(r.L, r.L / 2, r.P);
      return (
        <>
          a = L/2 : RA = P × (L − a) / L = <strong>{n2(RA)} kN</strong> ; RB = <strong>{n2(RB)} kN</strong>
        </>
      );
    },
    taux: (r) => (
      <>
        M_Ed = P L / 4 = {r.P} × {nombre(r.L, 1)} / 4 = {n2((r.P * r.L) / 4)} kN·m ; taux = <strong>{n2(r.taux)}</strong> → {r.verdict}
      </>
    ),
  },
  schema: ({ r }) => <Console lignes={[...r.lignes, `taux = ${formatF(r.taux, 2)} : ${r.verdict}`]} alt={`Le tableau imprimé par la boucle : la charge de ${r.P} kN placée à chaque abscisse, et les deux réactions. Puis le taux de travail ${formatF(r.taux, 2)} : ${r.verdict}.`} />,
};

// ---------- L1.7.6 : fichier CSV ----------
type ResCsv = ReturnType<typeof statsEprouvettes> & { seuil: number };
const csvDef: DefinitionCalcul<ResCsv> = {
  champs: [champ('seuil', 'résistance minimale exigée (énoncé)', <>f<sub>min</sub></>, 'MPa', 20, 32, 0.5, 1)],
  defaut: { seuil: 25 },
  calculer: (e) => ({ ...statsEprouvettes(lireEprouvettes(CSV_EPROUVETTES), num(e, 'seuil')), seuil: num(e, 'seuil') }),
  valeurs: { moyenne: (r) => grandeur(r.moyenne, 2, 'MPa'), sous: (r) => (r.sousSeuil.length ? r.sousSeuil.join(', ') : 'aucune') },
  lignes: {
    stats: (r) => (
      <>
        n = len(fc) = {r.n} ; moyenne = sum(fc) / n = <strong>{n2(r.moyenne)} MPa</strong> ; min = {nombre(r.min, 1)} ; max = {nombre(r.max, 1)} MPa
      </>
    ),
    gachees: (r) => (
      <>
        par gâchée : {Object.entries(r.moyennes).map(([g, m]) => `${g} ${nombre(m, 1)}`).join(' ; ')} MPa
      </>
    ),
  },
  schema: ({ r }) => (
    <Console
      lignes={[`n = ${r.n}`, `moyenne = ${formatF(r.moyenne, 2)} MPa`, `min = ${reprFlottant(r.min)}  max = ${reprFlottant(r.max)}`, `sous ${reprFlottant(r.seuil)} MPa : ${JSON.stringify(r.sousSeuil).replace(/"/g, "'")}`, ...Object.entries(r.moyennes).map(([g, m]) => `${g} : ${formatF(m, 1)} MPa`)]}
      alt={`Sortie du programme : ${r.n} éprouvettes, moyenne ${formatF(r.moyenne, 2)} MPa, ${r.sousSeuil.length} sous le seuil.`}
    />
  ),
};

// ---------- L1.7.7 : NumPy ----------
type ResNumpy = ReturnType<typeof effortsPoutre> & { L: number; q: number; theorie: number };
const numpyDef: DefinitionCalcul<ResNumpy> = {
  champs: [champ('L', 'portée L', 'L', 'm', 2, 10, 0.5, 1), champ('q', 'charge q', 'q', 'kN/m', 2, 30, 1, 0), champ('n', 'nombre de points de linspace', 'n', '', 5, 101, 2, 0)],
  defaut: { L: 5, q: 12, n: 11 },
  calculer: (e) => {
    const L = num(e, 'L');
    const q = num(e, 'q');
    return { ...effortsPoutre(L, q, num(e, 'n')), L, q, theorie: momentMaxTheorique(L, q) };
  },
  valeurs: { Mmax: (r) => grandeur(r.Mmax, 2, 'kN·m'), xMax: (r) => grandeur(r.xMax, 2, 'm') },
  lignes: {
    max: (r) => (
      <>
        M.max() = <strong>{n2(r.Mmax)} kN·m</strong> en x = {n2(r.xMax)} m ; théorie q L²/8 = {n2(r.theorie)} kN·m → {isclose(r.Mmax, r.theorie, 1e-6) ? 'identique' : 'un peu moins : le maximum tombe entre deux points'}
      </>
    ),
  },
  schema: ({ r }) => <FigureMatplotlib x={r.x} M={r.M} V={r.V} />,
};

// ---------- L1.7.8 : tests ----------
type ResTests = { res: ReturnType<typeof executerTests>; G: number };
const testsDef: DefinitionCalcul<ResTests> = {
  champs: [{ type: 'choix', cle: 'version', libelle: 'version de la fonction testée', symbole: 'f', options: [{ valeur: 'juste', libelle: 'RB = P*a/L (juste)' }, { valeur: 'bug', libelle: 'RB = P*(L-a)/L (boguée)' }] }],
  defaut: { version: 'juste' },
  calculer: (e) => ({
    res: executerTests(e.version === 'bug' ? (L, a, P) => [(P * (L - a)) / L, (P * (L - a)) / L] : reactionsPonctuelle),
    G: poidsPropre({ b: 0.2, h: 0.4, L: 5, gamma: 25 }),
  }),
  valeurs: { bilan: (r) => `${r.res.filter((c) => c.ok).length}/${r.res.length} réussis` },
  lignes: {
    cas: (r) => (
      <span className="grid">
        {r.res.map((c) => (
          <span key={c.nom} className="block">
            {c.nom} : attendu ({n2(c.RA)} ; {n2(c.RB)}), obtenu ({n2(c.obtenu[0])} ; {n2(c.obtenu[1])}) → <strong>{c.ok ? 'réussi' : 'échoué'}</strong>
          </span>
        ))}
      </span>
    ),
  },
  schema: ({ r }) => <ResultatsTests resultats={r.res} titre="pytest test_reactions.py" />,
  schemas: { tolerance: ({ r }) => <BandeTolerance attendu={10} obtenu={r.G} tol={1e-6} unite="kN" /> },
};

// ---------- L1.7.P : calculateur ----------
type ResProjet = ReturnType<typeof calculateurReactions> & { f: Feuille; v: ReturnType<typeof evaluerFeuille>; L: number; q: number; P: { F: number; a: number }[] };
const projetDef: DefinitionCalcul<ResProjet> = {
  champs: [
    champ('L', 'portée L', 'L', 'm', 2, 10, 0.5, 2),
    champ('q', 'charge uniforme q', 'q', 'kN/m', 0, 30, 1, 0),
    champ('P1', 'charge P1', <>P<sub>1</sub></>, 'kN', 0, 60, 1, 0),
    champ('a1', 'position de P1', <>a<sub>1</sub></>, 'm', 0, 10, 0.25, 2),
    champ('P2', 'charge P2', <>P<sub>2</sub></>, 'kN', 0, 60, 1, 0),
    champ('a2', 'position de P2', <>a<sub>2</sub></>, 'm', 0, 10, 0.25, 2),
  ],
  defaut: { L: 6, q: 8, P1: 20, a1: 2, P2: 15, a2: 4.5 },
  calculer: (e) => {
    const L = num(e, 'L');
    const q = num(e, 'q');
    const P = [{ F: num(e, 'P1'), a: Math.min(num(e, 'a1'), L) }, { F: num(e, 'P2'), a: Math.min(num(e, 'a2'), L) }];
    const f = feuilleCalculateur(L, q, P);
    return { ...calculateurReactions({ L, q, charges: P }), f, v: evaluerFeuille(f), L, q, P };
  },
  valeurs: { RA: (r) => grandeur(r.RA, 2, 'kN'), RB: (r) => grandeur(r.RB, 2, 'kN') },
  lignes: {
    somme: (r) => (
      <>
        ΣF = q L + P1 + P2 = {n2(r.q * r.L)} + {r.P[0]!.F} + {r.P[1]!.F} = <strong>{n2(r.somme)} kN</strong>
      </>
    ),
    moment: (r) => (
      <>
        ΣM/A = q L²/2 + P1 a1 + P2 a2 = {n2((r.q * r.L * r.L) / 2)} + {n2(r.P[0]!.F * r.P[0]!.a)} + {n2(r.P[1]!.F * r.P[1]!.a)} = <strong>{n2(r.moment)} kN·m</strong>
      </>
    ),
    reactions: (r) => (
      <>
        RB = {n2(r.moment)} / {n2(r.L)} = <strong>{n2(r.RB)} kN</strong> ; RA = {n2(r.somme)} − {n2(r.RB)} = <strong>{n2(r.RA)} kN</strong>
      </>
    ),
    controle: (r) => (
      <>
        tableur : RA = {afficherValeur(r.v.B11, 2)} ; Python : {formatF(r.RA, 2)} ; statique L1.3.6 : {n2(r.controle.RA)} kN → <strong>{isclose(r.RA, r.controle.RA, 1e-9) ? 'concordants' : 'écart'}</strong>
      </>
    ),
  },
  schemas: {
    tableur: ({ r }) => <FeuilleTableur feuille={r.f} plage="A1:D12" alt={`La feuille du calculateur : RB = ${afficherValeur(r.v.B10, 2)} kN, RA = ${afficherValeur(r.v.B11, 2)} kN, ${afficherValeur(r.v.B12)}.`} decimales={{ B: 2, D: 2 }} largeurs={{ A: 120, B: 110, C: 70, D: 110 }} />,
    python: ({ r }) => <Console lignes={[`somme = ${reprFlottant(r.somme)} kN`, `moment = ${reprFlottant(r.moment)} kN.m`, `RA = ${formatF(r.RA, 2)} kN`, `RB = ${formatF(r.RB, 2)} kN`, `équilibre : ${r.equilibre ? 'True' : 'False'}`]} alt={`Sortie du programme Python : RA = ${formatF(r.RA, 2)} kN, RB = ${formatF(r.RB, 2)} kN, équilibre vérifié.`} />,
  },
  alerte: (r) => (r.RA < 0 || r.RB < 0 ? 'Une réaction est négative : l’appui serait soulevé.' : undefined),
};

export const CALCULS_INFO = {
  feuilleBeton: betonDef,
  feuilleAciers: aciersDef,
  feuilleMoment: momentDef,
  pythonPoids: poidsDef,
  pythonBoucle: boucleDef,
  pythonCsv: csvDef,
  pythonNumpy: numpyDef,
  pythonTests: testsDef,
  calculateurReactions: projetDef,
} as const;
