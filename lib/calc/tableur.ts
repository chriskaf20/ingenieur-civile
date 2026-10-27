// Petit moteur de tableur (module L1.7) : formules à la française (virgule décimale, « ; » entre arguments),
// références relatives et absolues, recopie, et les fonctions du cours (SOMME, SI, RECHERCHEV, SOMMEPROD…).
import { arrondi, nombre } from '@/lib/format';

export type Erreur = { erreur: '#DIV/0!' | '#N/A' | '#VALEUR!' | '#REF!' | '#NOM?' | '#CYCLE!' };
export type Valeur = number | string | boolean | Erreur;
/** Contenu saisi : un nombre, un texte, ou une formule qui commence par « = ». */
export type Feuille = Record<string, number | string>;

export const estErreur = (v: unknown): v is Erreur => typeof v === 'object' && v !== null && 'erreur' in v;

// ---------- Références ----------

/** Numéro de colonne (A = 1, Z = 26, AA = 27) et lettres d'un numéro. */
export function colonneNumero(lettres: string): number {
  return [...lettres.toUpperCase()].reduce((n, c) => n * 26 + (c.charCodeAt(0) - 64), 0);
}
export function colonneLettres(n: number): string {
  let s = '';
  for (let k = n; k > 0; k = Math.floor((k - 1) / 26)) s = String.fromCharCode(65 + ((k - 1) % 26)) + s;
  return s;
}

const RE_REF = /(\$?)([A-Z]{1,2})(\$?)(\d+)/g;

/** Décale une référence A1 de dl lignes et dc colonnes, sauf les parties bloquées par un $. */
export function decalerReference(ref: string, dl: number, dc: number): string {
  return ref.replace(new RegExp(RE_REF.source), (_, dC: string, c: string, dL: string, l: string) => {
    const col = dC ? colonneNumero(c) : colonneNumero(c) + dc;
    const lig = dL ? Number(l) : Number(l) + dl;
    if (col < 1 || lig < 1) return '#REF!';
    return `${dC}${colonneLettres(col)}${dL}${lig}`;
  });
}

/** Recopie d'une formule de dl lignes vers le bas et dc colonnes vers la droite (les textes entre guillemets sont préservés). */
export function recopierFormule(formule: string, dl: number, dc: number): string {
  return formule
    .split(/("[^"]*")/)
    .map((morceau) => (morceau.startsWith('"') ? morceau : morceau.replace(RE_REF, (m) => decalerReference(m, dl, dc))))
    .join('');
}

/** Cellules d'une plage « A2:C4 », ligne par ligne. */
export function cellulesPlage(plage: string): string[][] {
  const [a, b] = plage.replace(/\$/g, '').split(':');
  const m1 = /([A-Z]+)(\d+)/.exec(a!)!;
  const m2 = /([A-Z]+)(\d+)/.exec(b ?? a!)!;
  const [c1, c2] = [colonneNumero(m1[1]!), colonneNumero(m2[1]!)].sort((x, y) => x - y);
  const [l1, l2] = [Number(m1[2]), Number(m2[2])].sort((x, y) => x - y);
  const lignes: string[][] = [];
  for (let l = l1!; l <= l2!; l++) {
    const ligne: string[] = [];
    for (let c = c1!; c <= c2!; c++) ligne.push(`${colonneLettres(c)}${l}`);
    lignes.push(ligne);
  }
  return lignes;
}

// ---------- Analyse des formules ----------

type Jeton =
  | { t: 'nombre'; v: number }
  | { t: 'texte'; v: string }
  | { t: 'ref'; v: string }
  | { t: 'plage'; v: string }
  | { t: 'nom'; v: string }
  | { t: 'op'; v: string }
  | { t: '('; v: '(' }
  | { t: ')'; v: ')' }
  | { t: ';'; v: ';' };

function jetons(f: string): Jeton[] {
  const r: Jeton[] = [];
  let i = 0;
  while (i < f.length) {
    const c = f[i]!;
    if (c === ' ') {
      i++;
    } else if (/[0-9]/.test(c) || (c === ',' && /[0-9]/.test(f[i + 1] ?? ''))) {
      const m = /^[0-9]*,?[0-9]+(?:[eE][+-]?[0-9]+)?|^[0-9]+/.exec(f.slice(i))!;
      r.push({ t: 'nombre', v: Number(m[0].replace(',', '.')) });
      i += m[0].length;
    } else if (c === '"') {
      const j = f.indexOf('"', i + 1);
      r.push({ t: 'texte', v: f.slice(i + 1, j) });
      i = j + 1;
    } else if (/[$A-Za-z]/.test(c)) {
      const plage = /^\$?[A-Z]{1,2}\$?\d+:\$?[A-Z]{1,2}\$?\d+/.exec(f.slice(i));
      const ref = /^\$?[A-Z]{1,2}\$?\d+(?![A-Za-z(.])/.exec(f.slice(i));
      const nom = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9.]*/.exec(f.slice(i));
      if (plage) {
        r.push({ t: 'plage', v: plage[0] });
        i += plage[0].length;
      } else if (ref) {
        r.push({ t: 'ref', v: ref[0] });
        i += ref[0].length;
      } else if (nom) {
        r.push({ t: 'nom', v: nom[0].toUpperCase() });
        i += nom[0].length;
      } else throw new Error(`Caractère inattendu : ${c}`);
    } else if (c === '(' || c === ')' || c === ';') {
      r.push({ t: c, v: c } as Jeton);
      i++;
    } else {
      const op = /^(<=|>=|<>|[-+*/^&=<>])/.exec(f.slice(i));
      if (!op) throw new Error(`Caractère inattendu : ${c}`);
      r.push({ t: 'op', v: op[0] });
      i += op[0].length;
    }
  }
  return r;
}

type Noeud =
  | { k: 'val'; v: Valeur }
  | { k: 'ref'; v: string }
  | { k: 'plage'; v: string }
  | { k: 'un'; op: string; a: Noeud }
  | { k: 'bin'; op: string; a: Noeud; b: Noeud }
  | { k: 'fn'; nom: string; args: Noeud[] };

function analyser(f: string): Noeud {
  const t = jetons(f);
  let i = 0;
  const voir = () => t[i];
  const prendre = () => t[i++]!;
  const niveaux: string[][] = [['=', '<>', '<', '>', '<=', '>='], ['&'], ['+', '-'], ['*', '/'], ['^']];
  const binaire = (n: number): Noeud => {
    if (n === niveaux.length) return unaire();
    let a = binaire(n + 1);
    while (voir()?.t === 'op' && niveaux[n]!.includes(voir()!.v as string)) {
      const op = prendre().v as string;
      a = { k: 'bin', op, a, b: binaire(n + 1) };
    }
    return a;
  };
  const unaire = (): Noeud => {
    const j = voir();
    if (j?.t === 'op' && (j.v === '-' || j.v === '+')) {
      prendre();
      return { k: 'un', op: j.v, a: unaire() };
    }
    return primaire();
  };
  const primaire = (): Noeud => {
    const j = prendre();
    if (!j) throw new Error('Formule incomplète');
    if (j.t === 'nombre') return { k: 'val', v: j.v };
    if (j.t === 'texte') return { k: 'val', v: j.v };
    if (j.t === 'ref') return { k: 'ref', v: j.v.replace(/\$/g, '') };
    if (j.t === 'plage') return { k: 'plage', v: j.v };
    if (j.t === '(') {
      const e = binaire(0);
      if (prendre()?.t !== ')') throw new Error('Parenthèse manquante');
      return e;
    }
    if (j.t === 'nom') {
      if (j.v === 'VRAI' || j.v === 'FAUX') return { k: 'val', v: j.v === 'VRAI' };
      if (voir()?.t !== '(') throw new Error(`Nom inconnu : ${j.v}`);
      prendre();
      const args: Noeud[] = [];
      if (voir()?.t !== ')') {
        args.push(binaire(0));
        while (voir()?.t === ';') {
          prendre();
          args.push(binaire(0));
        }
      }
      if (prendre()?.t !== ')') throw new Error('Parenthèse manquante');
      return { k: 'fn', nom: j.v, args };
    }
    throw new Error('Formule mal formée');
  };
  const e = binaire(0);
  if (i !== t.length) throw new Error('Formule mal formée');
  return e;
}

// ---------- Évaluation ----------

const ERR = (e: Erreur['erreur']): Erreur => ({ erreur: e });

function enNombre(v: Valeur): number | Erreur {
  if (estErreur(v)) return v;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === '') return 0;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : ERR('#VALEUR!');
}

/** Évalue toutes les cellules d'une feuille ; les formules peuvent se référer les unes aux autres. */
export function evaluerFeuille(feuille: Feuille): Record<string, Valeur> {
  const res: Record<string, Valeur> = {};
  const enCours = new Set<string>();
  const cellule = (ref: string): Valeur => {
    if (ref in res) return res[ref]!;
    const contenu = feuille[ref];
    if (contenu === undefined) return '';
    if (typeof contenu === 'number') return (res[ref] = contenu);
    if (!contenu.startsWith('=')) return (res[ref] = contenu);
    if (enCours.has(ref)) return ERR('#CYCLE!');
    enCours.add(ref);
    let v: Valeur;
    try {
      v = evaluer(analyser(contenu.slice(1)));
    } catch {
      v = ERR('#NOM?');
    }
    enCours.delete(ref);
    return (res[ref] = v);
  };
  const plage = (p: string): Valeur[][] => cellulesPlage(p).map((l) => l.map(cellule));
  const aplatir = (args: Noeud[]): Valeur[] => args.flatMap((a) => (a.k === 'plage' ? plage(a.v).flat() : [evaluer(a)]));
  const numeriques = (args: Noeud[]): number[] | Erreur => {
    const r: number[] = [];
    for (const v of aplatir(args)) {
      if (estErreur(v)) return v;
      if (typeof v === 'number') r.push(v);
    }
    return r;
  };
  const evaluer = (n: Noeud): Valeur => {
    switch (n.k) {
      case 'val':
        return n.v;
      case 'ref':
        return cellule(n.v);
      case 'plage':
        return ERR('#VALEUR!');
      case 'un': {
        const a = enNombre(evaluer(n.a));
        return estErreur(a) ? a : n.op === '-' ? -a : a;
      }
      case 'bin': {
        const va = evaluer(n.a);
        const vb = evaluer(n.b);
        if (estErreur(va)) return va;
        if (estErreur(vb)) return vb;
        if (n.op === '&') return `${afficherBrut(va)}${afficherBrut(vb)}`;
        if (['=', '<>', '<', '>', '<=', '>='].includes(n.op)) {
          const [x, y] = typeof va === 'string' || typeof vb === 'string' ? [String(va), String(vb)] : [Number(va), Number(vb)];
          return { '=': x === y, '<>': x !== y, '<': x < y, '>': x > y, '<=': x <= y, '>=': x >= y }[n.op]!;
        }
        const a = enNombre(va);
        const b = enNombre(vb);
        if (estErreur(a)) return a;
        if (estErreur(b)) return b;
        if (n.op === '/' && b === 0) return ERR('#DIV/0!');
        return { '+': a + b, '-': a - b, '*': a * b, '/': a / b, '^': a ** b }[n.op]!;
      }
      case 'fn':
        return fonction(n.nom, n.args);
    }
  };
  const fonction = (nom: string, args: Noeud[]): Valeur => {
    const nombre = (k: number): number | Erreur => enNombre(evaluer(args[k]!));
    switch (nom) {
      case 'SOMME':
      case 'MOYENNE':
      case 'MIN':
      case 'MAX':
      case 'NB': {
        const v = numeriques(args);
        if (estErreur(v)) return v;
        if (nom === 'NB') return v.length;
        if (nom === 'SOMME') return v.reduce((s, x) => s + x, 0);
        if (!v.length) return nom === 'MOYENNE' ? ERR('#DIV/0!') : 0;
        return nom === 'MOYENNE' ? v.reduce((s, x) => s + x, 0) / v.length : nom === 'MIN' ? Math.min(...v) : Math.max(...v);
      }
      case 'SI': {
        const c = evaluer(args[0]!);
        if (estErreur(c)) return c;
        const vrai = typeof c === 'boolean' ? c : enNombre(c) !== 0;
        return vrai ? (args[1] ? evaluer(args[1]) : true) : args[2] ? evaluer(args[2]) : false;
      }
      case 'ET':
      case 'OU': {
        const v = aplatir(args);
        const e = v.find(estErreur);
        if (e) return e;
        const b = v.map((x) => (typeof x === 'boolean' ? x : enNombre(x) !== 0));
        return nom === 'ET' ? b.every(Boolean) : b.some(Boolean);
      }
      case 'NON': {
        const c = evaluer(args[0]!);
        return estErreur(c) ? c : !(typeof c === 'boolean' ? c : enNombre(c) !== 0);
      }
      case 'ARRONDI':
      case 'ARRONDI.SUP':
      case 'ARRONDI.INF': {
        const x = nombre(0);
        const d = args[1] ? nombre(1) : 0;
        if (estErreur(x)) return x;
        if (estErreur(d)) return d;
        const f = 10 ** d;
        if (nom === 'ARRONDI') return arrondi(x, d);
        const r = Math.abs(x) * f;
        const k = nom === 'ARRONDI.SUP' ? Math.ceil(arrondi(r, 9)) : Math.floor(arrondi(r, 9));
        return (Math.sign(x) * k) / f;
      }
      case 'RACINE': {
        const x = nombre(0);
        if (estErreur(x)) return x;
        return x < 0 ? ERR('#VALEUR!') : Math.sqrt(x);
      }
      case 'ABS': {
        const x = nombre(0);
        return estErreur(x) ? x : Math.abs(x);
      }
      case 'PI':
        return Math.PI;
      case 'SOMMEPROD': {
        const plages = args.map((a) => (a.k === 'plage' ? plage(a.v).flat() : null));
        if (plages.some((p) => p === null)) return ERR('#VALEUR!');
        const n = plages[0]!.length;
        if (plages.some((p) => p!.length !== n)) return ERR('#VALEUR!');
        let s = 0;
        for (let k = 0; k < n; k++) {
          let p = 1;
          for (const pl of plages) {
            const v = pl![k]!;
            if (estErreur(v)) return v;
            p *= typeof v === 'number' ? v : 0;
          }
          s += p;
        }
        return s;
      }
      case 'RECHERCHEV': {
        const cherche = evaluer(args[0]!);
        if (estErreur(cherche)) return cherche;
        if (args[1]?.k !== 'plage') return ERR('#VALEUR!');
        const table = plage(args[1].v);
        const col = nombre(2);
        if (estErreur(col)) return col;
        if (col < 1 || col > (table[0]?.length ?? 0)) return ERR('#REF!');
        const approchee = args[3] ? evaluer(args[3]) !== false && enNombre(evaluer(args[3])) !== 0 : true;
        if (!approchee) {
          const l = table.find((ligne) => ligne[0] === cherche || (typeof cherche === 'number' && ligne[0] === cherche));
          return l ? l[col - 1]! : ERR('#N/A');
        }
        let trouve: Valeur[] | undefined;
        for (const ligne of table) {
          const v = ligne[0];
          if (typeof v === 'number' && typeof cherche === 'number' && v <= cherche) trouve = ligne;
        }
        return trouve ? trouve[col - 1]! : ERR('#N/A');
      }
      default:
        return ERR('#NOM?');
    }
  };
  for (const ref of Object.keys(feuille)) cellule(ref);
  return res;
}

/** Valeur brute en texte (concaténation). */
function afficherBrut(v: Valeur): string {
  if (estErreur(v)) return v.erreur;
  if (typeof v === 'boolean') return v ? 'VRAI' : 'FAUX';
  return typeof v === 'number' ? String(arrondi(v, 10)).replace('.', ',') : v;
}

/** Valeur telle que l'affiche une cellule, avec un nombre de décimales fixe si demandé. */
export function afficherValeur(v: Valeur | undefined, decimales?: number): string {
  if (v === undefined) return '';
  if (typeof v === 'number' && decimales !== undefined) return nombre(v, decimales);
  return afficherBrut(v);
}

// ---------- Exemples du module ----------

/** L1.7.1 : volume et coût du béton de quatre éléments ; prix unitaire en B1, référence absolue. */
export const FEUILLE_BETON: Feuille = {
  A1: 'prix du béton ($/m³)',
  B1: 180,
  A3: 'élément',
  B3: 'nombre',
  C3: 'L (m)',
  D3: 'l (m)',
  E3: 'h (m)',
  F3: 'V (m³)',
  G3: 'coût ($)',
  A4: 'semelles',
  B4: 6,
  C4: 1.2,
  D4: 1.2,
  E4: 0.4,
  F4: '=B4*C4*D4*E4',
  G4: '=F4*$B$1',
  A5: 'poteaux',
  B5: 6,
  C5: 0.25,
  D5: 0.25,
  E5: 3,
  F5: '=B5*C5*D5*E5',
  G5: '=F5*$B$1',
  A6: 'poutres',
  B6: 4,
  C6: 4.5,
  D6: 0.2,
  E6: 0.4,
  F6: '=B6*C6*D6*E6',
  G6: '=F6*$B$1',
  A7: 'dalle',
  B7: 1,
  C7: 9,
  D7: 6,
  E7: 0.16,
  F7: '=B7*C7*D7*E7',
  G7: '=F7*$B$1',
  A8: 'total',
  F8: '=SOMME(F4:F7)',
  G8: '=SOMME(G4:G7)',
};

/** L1.7.2 : masse d'acier d'un ferraillage, masses linéiques cherchées par RECHERCHEV, total par SOMMEPROD. */
export const FEUILLE_ACIERS: Feuille = {
  A1: 'φ (mm)',
  B1: 'kg/m',
  A2: 6,
  B2: '=ARRONDI(7850*PI()*(A2/1000)^2/4;3)',
  A3: 8,
  B3: '=ARRONDI(7850*PI()*(A3/1000)^2/4;3)',
  A4: 10,
  B4: '=ARRONDI(7850*PI()*(A4/1000)^2/4;3)',
  A5: 12,
  B5: '=ARRONDI(7850*PI()*(A5/1000)^2/4;3)',
  A6: 14,
  B6: '=ARRONDI(7850*PI()*(A6/1000)^2/4;3)',
  D1: 'repère',
  E1: 'φ (mm)',
  F1: 'nombre',
  G1: 'longueur (m)',
  H1: 'kg/m',
  D2: 1,
  E2: 12,
  F2: 3,
  G2: 3.94,
  H2: '=RECHERCHEV(E2;$A$2:$B$6;2;FAUX)',
  D3: 2,
  E3: 10,
  F3: 2,
  G3: 3.94,
  H3: '=RECHERCHEV(E3;$A$2:$B$6;2;FAUX)',
  D4: 3,
  E4: 6,
  F4: 27,
  G4: 1.12,
  H4: '=RECHERCHEV(E4;$A$2:$B$6;2;FAUX)',
  F6: 'masse (kg)',
  H6: '=SOMMEPROD(F2:F4;G2:G4;H2:H4)',
  F7: 'contrôle',
  H7: '=SI(H6<30;"OK";"à revoir")',
};

/** L1.7.3 : moment fléchissant d'une poutre sur deux appuis, M(x) = q x (L − x) / 2, tabulé tous les 0,5 m. */
export function feuilleMoment(L: number, q: number, pas: number): Feuille {
  const f: Feuille = { A1: 'L (m)', B1: L, A2: 'q (kN/m)', B2: q, A4: 'x (m)', B4: 'M (kN·m)' };
  const n = Math.round(L / pas);
  for (let i = 0; i <= n; i++) {
    const l = 5 + i;
    f[`A${l}`] = i === 0 ? 0 : `=A${l - 1}+${String(pas).replace('.', ',')}`;
    f[`B${l}`] = `=$B$2*A${l}*($B$1-A${l})/2`;
  }
  f[`A${6 + n}`] = 'max';
  f[`B${6 + n}`] = `=MAX(B5:B${5 + n})`;
  return f;
}

/** L1.7.P : réactions d'une poutre sur deux appuis, charge uniforme et charges ponctuelles (données de L1.7.P). */
export function feuilleCalculateur(L: number, q: number, charges: ReadonlyArray<{ F: number; a: number }>): Feuille {
  const f: Feuille = {
    A1: 'portée L (m)',
    B1: L,
    A2: 'charge q (kN/m)',
    B2: q,
    A4: 'charge',
    B4: 'F (kN)',
    C4: 'a (m)',
    D4: 'F × a (kN·m)',
    A5: 'q L',
    B5: '=B2*B1',
    C5: '=B1/2',
    D5: '=B5*C5',
  };
  charges.forEach((c, i) => {
    const l = 6 + i;
    f[`A${l}`] = `P${i + 1}`;
    f[`B${l}`] = c.F;
    f[`C${l}`] = c.a;
    f[`D${l}`] = `=B${l}*C${l}`;
  });
  const fin = 5 + charges.length;
  const t = fin + 1;
  f[`A${t}`] = 'total';
  f[`B${t}`] = `=SOMME(B5:B${fin})`;
  f[`D${t}`] = `=SOMME(D5:D${fin})`;
  f[`A${t + 2}`] = 'RB (kN)';
  f[`B${t + 2}`] = `=D${t}/B1`;
  f[`A${t + 3}`] = 'RA (kN)';
  f[`B${t + 3}`] = `=B${t}-B${t + 2}`;
  f[`A${t + 4}`] = 'contrôle';
  f[`B${t + 4}`] = `=SI(ABS(B${t + 2}+B${t + 3}-B${t})<0,001;"équilibre OK";"erreur")`;
  return f;
}

/** Moment maximal d'une poutre sur deux appuis sous charge uniforme, q L² / 8 : le contrôle de la feuille M(x). */
export function momentMaxTheorique(L: number, q: number): number {
  return (q * L * L) / 8;
}
