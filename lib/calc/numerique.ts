// Méthodes numériques (module L2.3) : erreurs, racines, interpolation, intégration sur mesures,
// systèmes linéaires (Gauss, Cholesky, Jacobi, Gauss-Seidel, Thomas), Euler et Runge-Kutta, différences finies.

// ---------- Erreurs ----------

/** Somme naïve de n fois la valeur v (accumulation des erreurs d'arrondi en virgule flottante). */
export function sommeRepetee(v: number, n: number): { somme: number; exact: number; ecart: number } {
  let s = 0;
  for (let i = 0; i < n; i++) s += v;
  return { somme: s, exact: v * n, ecart: s - v * n };
}

/** Dérivée par différences finies avant et centrée, et leurs erreurs par rapport à la dérivée exacte. */
export function deriveeFinie(f: (x: number) => number, fp: number, x: number, h: number) {
  const avant = (f(x + h) - f(x)) / h;
  const centree = (f(x + h) - f(x - h)) / (2 * h);
  return { h, avant, centree, eAvant: Math.abs(avant - fp), eCentree: Math.abs(centree - fp) };
}

/** Chiffres significatifs exacts d'une approximation (−log10 de l'erreur relative). */
export function chiffresExacts(approche: number, exact: number): number {
  const er = Math.abs((approche - exact) / exact);
  return er === 0 ? 16 : Math.max(0, -Math.log10(er));
}

// ---------- Équations non linéaires ----------

export interface Iteration {
  k: number;
  x: number;
  fx: number;
  a?: number;
  b?: number;
}

/** Dichotomie sur [a, b] (f(a) et f(b) de signes opposés), jusqu'à une largeur d'intervalle tol. */
export function dichotomie(f: (x: number) => number, a0: number, b0: number, tol: number, max = 100): Iteration[] {
  let a = a0;
  let b = b0;
  const it: Iteration[] = [];
  for (let k = 1; k <= max; k++) {
    const m = (a + b) / 2;
    const fm = f(m);
    it.push({ k, x: m, fx: fm, a, b });
    if (f(a) * fm <= 0) b = m;
    else a = m;
    if (b - a < tol) break;
  }
  return it;
}

/** Méthode de Newton : x ← x − f(x)/f'(x), arrêt quand |Δx| < tol. */
export function newton(f: (x: number) => number, fp: (x: number) => number, x0: number, tol: number, max = 50): Iteration[] {
  let x = x0;
  const it: Iteration[] = [{ k: 0, x, fx: f(x) }];
  for (let k = 1; k <= max; k++) {
    const dx = f(x) / fp(x);
    x -= dx;
    it.push({ k, x, fx: f(x) });
    if (Math.abs(dx) < tol) break;
  }
  return it;
}

/** Débit de Manning-Strickler dans un canal rectangulaire : Q = K A R^(2/3) √i. */
export function debitCanal(d: { b: number; K: number; i: number }, h: number): number {
  const A = d.b * h;
  const R = A / (d.b + 2 * h);
  return d.K * A * R ** (2 / 3) * Math.sqrt(d.i);
}

export interface DonneesHauteurNormale {
  b: number; // largeur du canal (m)
  K: number; // coefficient de Strickler (m^(1/3)/s)
  i: number; // pente (m/m)
  Q: number; // débit (m³/s)
}

/** Hauteur normale d'un canal rectangulaire : résout debitCanal(h) = Q par dichotomie et par Newton (dérivée numérique). */
export function hauteurNormale(d: DonneesHauteurNormale, tol = 1e-4) {
  const f = (h: number) => debitCanal(d, h) - d.Q;
  const fp = (h: number) => (f(h + 1e-6) - f(h - 1e-6)) / 2e-6;
  const dich = dichotomie(f, 0.01, 10, tol);
  const newt = newton(f, fp, 1, tol);
  const h = newt[newt.length - 1]!.x;
  return { f, dich, newt, h, V: d.Q / (d.b * h) };
}

/** Canal en terre de l'exemple : 2 m de large, K = 40, pente 0,1 %, débit 3 m³/s. */
export const EXEMPLE_CANAL: DonneesHauteurNormale = { b: 2, K: 40, i: 0.001, Q: 3 };

// ---------- Interpolation ----------

/** Interpolation linéaire entre (x0, y0) et (x1, y1). */
export function interpLineaire(x0: number, y0: number, x1: number, y1: number, x: number): number {
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/** Interpolation linéaire dans un tableau trié par x croissant (sans extrapolation : renvoie null hors du tableau). */
export function interpTableau(xs: readonly number[], ys: readonly number[], x: number): { y: number; i: number } | null {
  for (let i = 0; i < xs.length - 1; i++) if (x >= xs[i]! && x <= xs[i + 1]!) return { y: interpLineaire(xs[i]!, ys[i]!, xs[i + 1]!, ys[i + 1]!, x), i };
  return null;
}

/** Polynôme d'interpolation de Lagrange passant par les points donnés, évalué en x. */
export function lagrange(xs: readonly number[], ys: readonly number[], x: number): number {
  let s = 0;
  for (let i = 0; i < xs.length; i++) {
    let L = 1;
    for (let j = 0; j < xs.length; j++) if (j !== i) L *= (x - xs[j]!) / (xs[i]! - xs[j]!);
    s += ys[i]! * L;
  }
  return s;
}

/** Interpolation bilinéaire dans une maille : z00 en (0,0), z10 en (1,0), z01 en (0,1), z11 en (1,1) ; u, v entre 0 et 1. */
export function bilineaire(z00: number, z10: number, z01: number, z11: number, u: number, v: number): number {
  return z00 * (1 - u) * (1 - v) + z10 * u * (1 - v) + z01 * (1 - u) * v + z11 * u * v;
}

/** Module sécant du béton, EN 1992-1-1 tableau 3.1 : Ecm = 22 (fcm/10)^0,3 GPa, fcm = fck + 8 MPa. */
export function ecm(fck: number): number {
  return 22 * ((fck + 8) / 10) ** 0.3;
}

// ---------- Intégration sur des mesures ----------

/** Trapèzes sur des valeurs équidistantes de pas h. */
export function trapezesMesures(ys: readonly number[], h: number): number {
  let s = 0;
  for (let i = 0; i < ys.length - 1; i++) s += ((ys[i]! + ys[i + 1]!) * h) / 2;
  return s;
}

/** Simpson sur des valeurs équidistantes de pas h (nombre d'intervalles pair). Renvoie null si impair. */
export function simpsonMesures(ys: readonly number[], h: number): number | null {
  const n = ys.length - 1;
  if (n % 2 !== 0 || n < 2) return null;
  let s = ys[0]! + ys[n]!;
  for (let i = 1; i < n; i++) s += (i % 2 === 1 ? 4 : 2) * ys[i]!;
  return (s * h) / 3;
}

/** Profils en travers d'un déblai routier : surfaces (m²) tous les 20 m (données d'exemple). */
export const EXEMPLE_PROFILS = { pas: 20, aires: [0, 8.4, 14.2, 18.6, 21.0, 19.3, 15.1, 9.8, 4.2] };

/** Cubature : volume par trapèzes (moyenne des aires) et par Simpson. */
export function cubatureProfils(aires: readonly number[], pas: number) {
  return { trapezes: trapezesMesures(aires, pas), simpson: simpsonMesures(aires, pas), longueur: pas * (aires.length - 1) };
}

// ---------- Systèmes linéaires ----------

type M = readonly (readonly number[])[];

/** Décomposition de Cholesky A = L Lᵀ (A symétrique définie positive) ; null si A n'est pas définie positive. */
export function cholesky(A: M): number[][] | null {
  const n = A.length;
  const L = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j <= i; j++) {
      let s = A[i]![j]!;
      for (let k = 0; k < j; k++) s -= L[i]![k]! * L[j]![k]!;
      if (i === j) {
        if (s <= 0) return null;
        L[i]![i] = Math.sqrt(s);
      } else L[i]![j] = s / L[j]![j]!;
    }
  return L;
}

/** Résout A x = b avec la décomposition de Cholesky (descente puis remontée). */
export function resoudreCholesky(A: M, b: readonly number[]): number[] | null {
  const L = cholesky(A);
  if (!L) return null;
  const n = A.length;
  const y = Array.from({ length: n }, () => 0);
  for (let i = 0; i < n; i++) {
    let s = b[i]!;
    for (let k = 0; k < i; k++) s -= L[i]![k]! * y[k]!;
    y[i] = s / L[i]![i]!;
  }
  const x = Array.from({ length: n }, () => 0);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i]!;
    for (let k = i + 1; k < n; k++) s -= L[k]![i]! * x[k]!;
    x[i] = s / L[i]![i]!;
  }
  return x;
}

/** Méthode itérative de Jacobi ou de Gauss-Seidel ; renvoie les itérés et le résidu max à chaque itération. */
export function iteratif(A: M, b: readonly number[], methode: 'jacobi' | 'seidel', tol = 1e-6, max = 200) {
  const n = A.length;
  let x = Array.from({ length: n }, () => 0);
  const historique: { k: number; x: number[]; residu: number }[] = [];
  for (let k = 1; k <= max; k++) {
    const nx = [...x];
    for (let i = 0; i < n; i++) {
      let s = b[i]!;
      for (let j = 0; j < n; j++) if (j !== i) s -= A[i]![j]! * (methode === 'seidel' ? nx[j]! : x[j]!);
      nx[i] = s / A[i]![i]!;
    }
    x = nx;
    const residu = Math.max(...A.map((ligne, i) => Math.abs(ligne.reduce((s, a, j) => s + a * x[j]!, 0) - b[i]!)));
    historique.push({ k, x: [...x], residu });
    if (residu < tol) break;
  }
  return historique;
}

/** Algorithme de Thomas pour un système tridiagonal (sous-diagonale a, diagonale d, sur-diagonale c, second membre r). */
export function thomas(a: readonly number[], d: readonly number[], c: readonly number[], r: readonly number[]): number[] {
  const n = d.length;
  const cp = Array.from({ length: n }, () => 0);
  const rp = Array.from({ length: n }, () => 0);
  cp[0] = c[0]! / d[0]!;
  rp[0] = r[0]! / d[0]!;
  for (let i = 1; i < n; i++) {
    const m = d[i]! - a[i]! * cp[i - 1]!;
    cp[i] = (c[i] ?? 0) / m;
    rp[i] = (r[i]! - a[i]! * rp[i - 1]!) / m;
  }
  const x = Array.from({ length: n }, () => 0);
  x[n - 1] = rp[n - 1]!;
  for (let i = n - 2; i >= 0; i--) x[i] = rp[i]! - cp[i]! * x[i + 1]!;
  return x;
}

/** Trois ressorts en série entre deux appuis fixes (raideurs kN/m) chargés aux nœuds : matrice de raideur symétrique. */
export function chaineRessorts(k: readonly [number, number, number, number], F: readonly [number, number, number]) {
  const K = [
    [k[0] + k[1], -k[1], 0],
    [-k[1], k[1] + k[2], -k[2]],
    [0, -k[2], k[2] + k[3]],
  ];
  return { K, F: [...F], u: resoudreCholesky(K, F) };
}

// ---------- Équations différentielles ----------

export type Systeme = (t: number, y: readonly number[]) => number[];

const ajoute = (y: readonly number[], k: readonly number[], h: number) => y.map((v, i) => v + h * k[i]!);

/** Intègre y' = f(t, y) de t0 à t0 + n h par Euler, Heun (RK2) ou Runge-Kutta d'ordre 4. */
export function integrer(f: Systeme, y0: readonly number[], t0: number, h: number, n: number, methode: 'euler' | 'rk2' | 'rk4') {
  const pts: { t: number; y: number[] }[] = [{ t: t0, y: [...y0] }];
  let y = [...y0];
  let t = t0;
  for (let i = 0; i < n; i++) {
    const k1 = f(t, y);
    if (methode === 'euler') y = ajoute(y, k1, h);
    else if (methode === 'rk2') {
      const k2 = f(t + h, ajoute(y, k1, h));
      y = y.map((v, j) => v + (h / 2) * (k1[j]! + k2[j]!));
    } else {
      const k2 = f(t + h / 2, ajoute(y, k1, h / 2));
      const k3 = f(t + h / 2, ajoute(y, k2, h / 2));
      const k4 = f(t + h, ajoute(y, k3, h));
      y = y.map((v, j) => v + (h / 6) * (k1[j]! + 2 * k2[j]! + 2 * k3[j]! + k4[j]!));
    }
    t += h;
    pts.push({ t, y: [...y] });
  }
  return pts;
}

/** Oscillateur libre non amorti x'' = −ω² x écrit en système (x, v) ; solution exacte x0 cos ωt. */
export function oscillateurNumerique(w: number, x0: number, h: number, tmax: number, methode: 'euler' | 'rk2' | 'rk4') {
  const n = Math.round(tmax / h);
  const pts = integrer((_t, y) => [y[1]!, -w * w * y[0]!], [x0, 0], 0, h, n, methode);
  const fin = pts[pts.length - 1]!;
  const exact = x0 * Math.cos(w * fin.t);
  return { pts, xFin: fin.y[0]!, exact, erreur: Math.abs(fin.y[0]! - exact), exacte: (t: number) => x0 * Math.cos(w * t) };
}

// ---------- Différences finies ----------

export interface DonneesDF {
  L: number; // portée (m)
  q: number; // charge uniforme (kN/m)
  EI: number; // rigidité (kN·m²)
  n: number; // nombre d'intervalles
}

/**
 * Déformée d'une poutre sur deux appuis sous charge uniforme par différences finies :
 * (y(i−1) − 2 y(i) + y(i+1)) / h² = −M(x_i)/EI, y(0) = y(n) = 0, résolu par Thomas.
 */
export function deformeeDF(d: DonneesDF) {
  const h = d.L / d.n;
  const m = d.n - 1;
  const x = Array.from({ length: d.n + 1 }, (_, i) => i * h);
  const M = (s: number) => (d.q * s * (d.L - s)) / 2;
  const a = Array.from({ length: m }, () => 1);
  const c = Array.from({ length: m }, () => 1);
  const dd = Array.from({ length: m }, () => -2);
  const r = Array.from({ length: m }, (_, i) => (-M(x[i + 1]!) / d.EI) * h * h);
  const int = thomas(a, dd, c, r);
  const y = [0, ...int, 0]; // y″ = −M/EI < 0 : y positive, flèche comptée vers le bas
  const exacte = (s: number) => (d.q * s * (d.L ** 3 - 2 * d.L * s * s + s ** 3)) / (24 * d.EI);
  const milieu = d.n % 2 === 0 ? y[d.n / 2]! : Math.max(...y);
  const fExact = (5 * d.q * d.L ** 4) / (384 * d.EI);
  return { h, x, y, exacte, fDF: milieu, fExact, erreur: Math.abs(milieu - fExact) / fExact };
}

/** Poutre d'exemple : 6 m, 10 kN/m, EI = 20 000 kN·m², 6 intervalles. */
export const EXEMPLE_DF: DonneesDF = { L: 6, q: 10, EI: 20000, n: 6 };
