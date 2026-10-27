// Probabilités et statistiques (module L2.2) : statistique descriptive, lois discrètes, loi normale,
// loi de Student, conformité du béton, régression, valeurs extrêmes (Gumbel), fiabilité.

// ---------- Statistique descriptive ----------

/** Moyenne, écart-type (estimateur à n − 1), médiane, étendue et coefficient de variation d'une série. */
export function descriptive(xs: readonly number[]) {
  const n = xs.length;
  const moyenne = xs.reduce((s, x) => s + x, 0) / n;
  const variance = n > 1 ? xs.reduce((s, x) => s + (x - moyenne) ** 2, 0) / (n - 1) : 0;
  const ecartType = Math.sqrt(variance);
  const tries = [...xs].sort((a, b) => a - b);
  const mediane = n % 2 === 1 ? tries[(n - 1) / 2]! : (tries[n / 2 - 1]! + tries[n / 2]!) / 2;
  const min = tries[0]!;
  const max = tries[n - 1]!;
  return { n, moyenne, variance, ecartType, mediane, min, max, etendue: max - min, cv: ecartType / moyenne, tries };
}

/** Effectifs par classes [debut + i·largeur ; debut + (i+1)·largeur[ ; la dernière classe inclut sa borne haute. */
export function histogramme(xs: readonly number[], debut: number, largeur: number, nb: number) {
  const effectifs = Array.from({ length: nb }, () => 0);
  for (const x of xs) {
    const i = Math.min(nb - 1, Math.floor((x - debut) / largeur));
    if (i >= 0 && x <= debut + nb * largeur) effectifs[i]! += 1;
  }
  return effectifs.map((e, i) => ({ de: debut + i * largeur, a: debut + (i + 1) * largeur, effectif: e, frequence: e / xs.length }));
}

// ---------- Probabilités ----------

/** Probabilité conditionnelle et formule de Bayes pour un test imparfait (sensibilité, spécificité, taux a priori). */
export function bayes(d: { p: number; sensibilite: number; specificite: number }) {
  const pPositif = d.sensibilite * d.p + (1 - d.specificite) * (1 - d.p);
  return { pPositif, pSachantPositif: (d.sensibilite * d.p) / pPositif };
}

/** Coefficient binomial C(n, k). */
export function combinaisons(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let c = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++) c = (c * (n - Math.min(k, n - k) + i)) / i;
  return c;
}

/** P(X = k) pour X ~ B(n, p). */
export function binomiale(n: number, p: number, k: number): number {
  return combinaisons(n, k) * p ** k * (1 - p) ** (n - k);
}

/** P(X ≤ k) pour X ~ B(n, p). */
export function binomialeCumul(n: number, p: number, k: number): number {
  let s = 0;
  for (let i = 0; i <= k; i++) s += binomiale(n, p, i);
  return s;
}

/** P(X = k) pour X ~ P(λ). */
export function poisson(lambda: number, k: number): number {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.exp(-lambda) * lambda ** k) / f;
}

/** P(X ≤ k) pour X ~ P(λ). */
export function poissonCumul(lambda: number, k: number): number {
  let s = 0;
  for (let i = 0; i <= k; i++) s += poisson(lambda, i);
  return s;
}

// ---------- Loi normale ----------

/** Densité de la loi normale centrée réduite. */
export function densiteNormale(z: number): number {
  return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
}

/** Fonction de répartition Φ(z) (erfc de Numerical Recipes, erreur relative < 1,2·10⁻⁷). */
export function phi(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.5 * x);
  const erfc =
    t *
    Math.exp(
      -x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return z >= 0 ? 1 - erfc / 2 : erfc / 2;
}

/** Fractile u_p de la loi normale centrée réduite : Φ(u_p) = p (algorithme d'Acklam, erreur relative < 1,2·10⁻⁹). */
export function fractileNormal(p: number): number {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pb = 0.02425;
  if (p < pb) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) / ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1);
  }
  if (p > 1 - pb) return -fractileNormal(1 - p);
  const q = p - 0.5;
  const r = q * q;
  return ((((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r + a[5]!) * q) / (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1);
}

/** Loi normale N(μ, σ) : probabilité d'être sous x, et fractile p. */
export function normale(mu: number, sigma: number) {
  return { P: (x: number) => phi((x - mu) / sigma), fractile: (p: number) => mu + fractileNormal(p) * sigma, densite: (x: number) => densiteNormale((x - mu) / sigma) / sigma };
}

// ---------- Loi de Student ----------

function lnGamma(x: number): number {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5);
  let ser = 1.000000000190015;
  for (const gi of g) ser += gi / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betaFraction(a: number, b: number, x: number): number {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-12) break;
  }
  return h;
}

/** Fonction bêta incomplète régularisée I_x(a, b). */
function betaIncomplete(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betaFraction(a, b, x)) / a : 1 - (bt * betaFraction(b, a, 1 - x)) / b;
}

/** Fonction de répartition de la loi de Student à ν degrés de liberté. */
export function studentCDF(t: number, nu: number): number {
  const p = betaIncomplete(nu / 2, 0.5, nu / (nu + t * t)) / 2;
  return t >= 0 ? 1 - p : p;
}

/** Fractile t_p de la loi de Student (dichotomie). */
export function fractileStudent(p: number, nu: number): number {
  let lo = -50;
  let hi = 50;
  for (let i = 0; i < 100; i++) {
    const m = (lo + hi) / 2;
    if (studentCDF(m, nu) < p) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

/** Intervalle de confiance de la moyenne (σ inconnu, loi de Student). niveau = 0,95 pour 95 %. */
export function intervalleConfiance(xs: readonly number[], niveau: number) {
  const s = descriptive(xs);
  const t = fractileStudent(1 - (1 - niveau) / 2, s.n - 1);
  const erreurType = s.ecartType / Math.sqrt(s.n);
  const demi = t * erreurType;
  return { ...s, t, erreurType, demiLargeur: demi, bas: s.moyenne - demi, haut: s.moyenne + demi };
}

// ---------- Béton : résistance caractéristique et conformité ----------

/** Résultats d'écrasement (MPa) d'un béton commandé en C25/30 : 15 éprouvettes cylindriques (données d'exemple). */
export const EXEMPLE_ESSAIS = [31.2, 28.5, 33.0, 29.8, 34.1, 30.6, 27.9, 32.4, 31.8, 29.1, 35.0, 30.2, 28.8, 32.9, 31.5];

/**
 * Résistance caractéristique estimée et critères de conformité de l'EN 206 (§8.2.1, tableau 14) :
 * production initiale (n = 3) : fcm ≥ fck + 4 ; production continue (n ≥ 15) : fcm ≥ fck + 1,48 σ ; chaque fci ≥ fck − 4.
 */
export function conformiteBeton(xs: readonly number[], fck: number) {
  const s = descriptive(xs);
  const continue_ = s.n >= 15;
  const seuilMoyenne = continue_ ? fck + 1.48 * s.ecartType : fck + 4;
  const seuilIndividuel = fck - 4;
  const critere1 = s.moyenne >= seuilMoyenne;
  const critere2 = s.min >= seuilIndividuel;
  const fk5 = s.moyenne - fractileNormal(0.95) * s.ecartType;
  const pSous = phi((fck - s.moyenne) / s.ecartType);
  return { ...s, fck, continue_, seuilMoyenne, seuilIndividuel, critere1, critere2, conforme: critere1 && critere2, fk5, pSous };
}

// ---------- Régression linéaire ----------

/** Droite des moindres carrés y = a x + b, coefficient de corrélation r et résidus. */
export function regression(xs: readonly number[], ys: readonly number[]) {
  const n = xs.length;
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = ys.reduce((s, y) => s + y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i]! - mx) * (ys[i]! - my);
    sxx += (xs[i]! - mx) ** 2;
    syy += (ys[i]! - my) ** 2;
  }
  const a = sxy / sxx;
  const b = my - a * mx;
  const r = sxy / Math.sqrt(sxx * syy);
  const residus = xs.map((x, i) => ys[i]! - (a * x + b));
  return { n, mx, my, a, b, r, r2: r * r, residus, predire: (x: number) => a * x + b };
}

/** Étalonnage d'un scléromètre : indice de rebond et résistance mesurée sur carottes (données d'exemple). */
export const EXEMPLE_SCLEROMETRE = { indice: [28, 30, 32, 34, 36, 38, 40, 42], fc: [18.5, 21.0, 23.8, 25.9, 28.7, 31.2, 33.0, 36.1] };

// ---------- Valeurs extrêmes ----------

/** Probabilité qu'un événement de période de retour T (ans) soit atteint au moins une fois en n années. */
export function risqueDepassement(T: number, n: number): number {
  return 1 - (1 - 1 / T) ** n;
}

/** Ajustement de Gumbel par la méthode des moments ; valeur de période de retour T. */
export function gumbel(xs: readonly number[]) {
  const s = descriptive(xs);
  const alpha = (s.ecartType * Math.sqrt(6)) / Math.PI;
  const u = s.moyenne - 0.5772 * alpha;
  return {
    ...s,
    alpha,
    u,
    valeur: (T: number) => u - alpha * Math.log(-Math.log(1 - 1 / T)),
    periode: (x: number) => 1 / (1 - Math.exp(-Math.exp(-(x - u) / alpha))),
  };
}

/** Pluies journalières maximales annuelles (mm) sur 20 ans, station fictive du Katanga (données d'exemple). */
export const EXEMPLE_PLUIES = [78, 92, 65, 110, 85, 70, 98, 120, 74, 88, 95, 69, 102, 81, 135, 77, 90, 84, 106, 72];

// ---------- Fiabilité ----------

export interface DonneesFiabilite {
  muR: number; // résistance moyenne
  sR: number; // écart-type de la résistance
  muS: number; // sollicitation moyenne
  sS: number; // écart-type de la sollicitation
}

/**
 * Indice de fiabilité β = (μR − μS) / √(σR² + σS²) et probabilité de ruine Pf = Φ(−β) (R et S normales indépendantes).
 * Coefficients partiels illustratifs : valeurs caractéristiques R_k = μR − 1,645 σR et S_k = μS + 1,645 σS ;
 * valeurs de calcul pour βcible au point de conception (méthode FORM : αR = σR/σ, αS = σS/σ, σ = √(σR² + σS²)) ;
 * l'EN 1990 (annexe C) fixe forfaitairement αR = 0,8 et αS = −0,7.
 */
export function fiabilite(d: DonneesFiabilite, betaCible = 3.8) {
  const beta = (d.muR - d.muS) / Math.sqrt(d.sR ** 2 + d.sS ** 2);
  const Pf = phi(-beta);
  const Rk = d.muR - fractileNormal(0.95) * d.sR;
  const Sk = d.muS + fractileNormal(0.95) * d.sS;
  const sigma = Math.sqrt(d.sR ** 2 + d.sS ** 2);
  const Rd = d.muR - (d.sR / sigma) * betaCible * d.sR;
  const Sd = d.muS + (d.sS / sigma) * betaCible * d.sS;
  return { beta, Pf, Rk, Sk, Rd, Sd, gammaR: Rk / Rd, gammaS: Sd / Sk, coefGlobal: d.muR / d.muS, betaCible, PfCible: phi(-betaCible) };
}

/** Poutre d'exemple : résistance en flexion et moment sollicitant (kN·m), moyennes et écarts-types. */
export const EXEMPLE_FIABILITE: DonneesFiabilite = { muR: 300, sR: 30, muS: 150, sS: 25 };
