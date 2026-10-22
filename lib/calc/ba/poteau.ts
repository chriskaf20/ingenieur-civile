// Poteau rectangulaire en compression centrée : EC2 (méthode simplifiée des
// Recommandations professionnelles françaises) comparé au BAEL 91 (B.8.4).
// Unités internes : kN, cm², kN/cm² (1 kN/cm² = 10 MPa), longueurs en m sauf mention.

import { arrondiInf, arrondiSup } from '../../format';
import { combinaisonsBarres, masseLineique, type ChoixBarres } from '../acier';
import { combinaisonELU } from '../charges';
import { enrobageNominal, type ClasseExposition, type Enrobage } from './enrobage';
import { fcd, fyd, GAMMA_C, GAMMA_S } from './materiaux';

export interface DonneesPoteau {
  NG: number; // effort normal dû aux charges permanentes (kN)
  NQ: number; // effort normal dû aux charges d'exploitation (kN)
  a: number; // petit côté de la section (m)
  b: number; // grand côté de la section (m)
  l: number; // hauteur libre du poteau (m)
  k: number; // coefficient de longueur de flambement : l0 = k·l
  fck: number; // MPa
  fyk: number; // MPa
  exposition: ClasseExposition;
  phiT: number; // diamètre des cadres (mm)
}

/** Exemple de la leçon L3.3.5 : poteau du rez-de-chaussée d'un R+3. */
export const EXEMPLE_POTEAU: DonneesPoteau = {
  NG: 700, NQ: 200, a: 0.3, b: 0.3, l: 3.0, k: 0.7, fck: 25, fyk: 500, exposition: 'XC1', phiT: 6,
};

/** Barres longitudinales envisagées : nombres pairs (répartition symétrique), φ ≥ 8 mm (EC2 §9.5.2(1)). */
const NOMBRES_BARRES = [4, 6, 8] as const;
const DIAMETRES_LONG = [10, 12, 14, 16, 20, 25] as const;

/** Longueur supplémentaire forfaitaire par cadre pour les deux crochets (hypothèse de métré). */
export const CROCHETS_CADRE = 0.2; // m

const racine12 = Math.sqrt(12);

/** Élancement d'une section rectangulaire de petit côté a : λ = l0·√12 / a. */
export function elancementRectangle(l0: number, a: number): number {
  return (l0 * racine12) / a;
}

/** Coefficient α de la méthode simplifiée (Recommandations professionnelles), λ ≤ 120. */
export function alphaEC2(lambda: number): number {
  if (lambda <= 60) return 0.86 / (1 + (lambda / 62) ** 2);
  return (32 / lambda) ** 1.3;
}

/** Coefficient α du BAEL 91 (B.8.4,1), λ ≤ 70. */
export function alphaBAEL(lambda: number): number {
  if (lambda <= 50) return 0.85 / (1 + 0.2 * (lambda / 35) ** 2);
  return 0.6 * (50 / lambda) ** 2;
}

export interface ResultatEC2 {
  lambda: number;
  alpha: number;
  kh0: number; // facteur (0,75 + 0,5·a) ou 1
  ks: number;
  enrobage: Enrobage;
  barres: ChoixBarres;
  dPrime: number; // distance de l'axe des barres à la paroi (m)
  delta: number; // d'/a
  khEffectif: number;
  NRdBetonSeul: number; // résistance sans armatures, kh = kh0 (kN)
  AsReq: number; // section théorique nécessaire (cm²) pour le diamètre retenu
  AsMin: number;
  AsMax: number;
  NRd: number; // résistance avec les barres retenues (kN)
  taux: number; // NEd / NRd
  phiTMin: number; // mm
  phiT: number; // mm retenu
  sMax: number; // espacement maximal courant des cadres (m)
  sMaxExtremites: number; // près des poutres et des planchers (m)
  zoneExtremite: number; // longueur des zones à espacement réduit (m)
  valide: boolean;
  messages: string[];
}

export interface ResultatBAEL {
  lambda: number;
  alpha: number;
  Br: number; // section réduite (cm²)
  termeBeton: number; // Br·fc28/(0,9·γb) (kN)
  NuBetonSeul: number; // α·Br·fc28/(0,9·γb), sans armatures (kN)
  Ath: number; // section théorique (cm²), éventuellement négative
  Amin: number;
  Amax: number;
  A: number; // section à mettre en place = max(Ath, Amin)
  barres: ChoixBarres;
  phiTMin: number;
  stMax: number; // m
  valide: boolean;
  messages: string[];
}

export interface Quantites {
  volumeBeton: number; // m³
  coffrage: number; // m²
  longueurBarres: number; // m (sans attentes ni recouvrements)
  masseLongitudinale: number; // kg
  nombreCadres: number;
  longueurCadre: number; // m
  masseCadres: number; // kg
  masseTotale: number; // kg
  ratio: number; // kg/m³
}

export interface ResultatPoteau {
  NEd: number;
  l0: number;
  fcd: number; // MPa
  fyd: number; // MPa
  Ac: number; // cm²
  ec2: ResultatEC2;
  bael: ResultatBAEL;
  quantites: Quantites;
}

/** Résistance de la méthode simplifiée : NRd = kh·ks·α·(Ac·fcd + As·fyd). */
function nRdEC2(As: number, Ac: number, fcdKn: number, fydKn: number, alpha: number, kh0: number, ks: number, delta: number, aPetit: number): number {
  const rho = As / Ac;
  const kh = aPetit < 0.5 ? kh0 * (1 - 6 * rho * delta) : 1;
  return kh * ks * alpha * (Ac * fcdKn + As * fydKn);
}

/** Section As (cm²) qui égale NRd à NEd (racine de l'équation du second degré en As). */
function asNecessaireEC2(NEd: number, Ac: number, fcdKn: number, fydKn: number, alpha: number, kh0: number, ks: number, delta: number, aPetit: number): number {
  const K = kh0 * ks * alpha;
  const P = Ac * fcdKn;
  const q = fydKn;
  const reste = NEd / K - P;
  if (reste <= 0) return 0;
  const c = aPetit < 0.5 ? (6 * delta) / Ac : 0;
  if (c === 0) return reste / q;
  // K(1 − c·As)(P + q·As) = NEd  ⇔  c·q·As² − (q − c·P)·As + reste = 0
  const B = q - c * P;
  const disc = B * B - 4 * c * q * reste;
  if (disc < 0) return Infinity;
  return (B - Math.sqrt(disc)) / (2 * c * q);
}

/**
 * Cotes (m, depuis le pied) des cadres : chaque zone d'extrémité de longueur `zone` est découpée
 * en intervalles égaux ≤ sExt, la partie courante en intervalles égaux ≤ s (métré : intervalles + 1).
 */
export function positionsCadres(l: number, zone: number, sExt: number, s: number): number[] {
  const z: number[] = [];
  const n1 = zone > 0 ? arrondiSup(zone / sExt) : 0;
  const courant = Math.max(l - 2 * zone, 0);
  const n2 = courant > 0 ? arrondiSup(courant / s) : 0;
  for (let i = 0; i <= n1; i++) z.push(n1 ? (i * zone) / n1 : 0);
  for (let i = 1; i < n2; i++) z.push(zone + (i * courant) / n2);
  for (let i = 0; i <= n1; i++) z.push(n1 ? l - zone + (i * zone) / n1 : l);
  return [...new Set(z.map((v) => Math.round(v * 1e6) / 1e6))].sort((a, b) => a - b);
}

export function poteauCompressionCentree(d: DonneesPoteau): ResultatPoteau {
  const a = Math.min(d.a, d.b);
  const b = Math.max(d.a, d.b);
  const NEd = combinaisonELU(d.NG, d.NQ);
  const l0 = d.k * d.l;
  const fcdMPa = fcd(d.fck);
  const fydMPa = fyd(d.fyk);
  const fcdKn = fcdMPa / 10;
  const fydKn = fydMPa / 10;
  const Ac = a * b * 1e4;
  const lambda = elancementRectangle(l0, a);

  // ---------- EC2, méthode simplifiée ----------
  const messagesEC2: string[] = [];
  const alpha = alphaEC2(lambda);
  const kh0 = a < 0.5 ? 0.75 + 0.5 * a : 1;
  const ks = d.fyk > 500 && lambda > 40 ? 1.6 - (0.6 * d.fyk) / 500 : 1;
  const AsMin = Math.max((0.1 * NEd) / fydKn, 0.002 * Ac); // EC2 §9.5.2(2)
  const AsMax = 0.04 * Ac; // EC2 §9.5.2(3), hors zones de recouvrement
  const candidats = combinaisonsBarres(NOMBRES_BARRES, DIAMETRES_LONG);

  let choix: { barres: ChoixBarres; enrobage: Enrobage; dPrime: number; delta: number; AsReq: number; phiT: number } | undefined;
  for (const c of candidats) {
    const phiT = Math.max(d.phiT, 6, Math.ceil(c.phi / 4)); // EC2 §9.5.3(1)
    const enrobage = enrobageNominal(d.exposition, phiT);
    const dPrime = (enrobage.cnom + phiT + c.phi / 2) / 1000;
    const delta = dPrime / a;
    const AsReq = asNecessaireEC2(NEd, Ac, fcdKn, fydKn, alpha, kh0, ks, delta, a);
    if (c.section >= Math.max(AsReq, AsMin) && c.section <= AsMax) {
      choix = { barres: c, enrobage, dPrime, delta, AsReq, phiT };
      break;
    }
  }
  if (lambda > 120) messagesEC2.push('λ > 120 : hors du domaine de la méthode simplifiée.');
  if (a < 0.15) messagesEC2.push('a < 0,15 m : hors du domaine de la méthode simplifiée.');
  if (!choix) messagesEC2.push('Aucune combinaison de barres ne convient : agrandir la section.');
  const retenu = choix ?? {
    barres: candidats[candidats.length - 1]!,
    enrobage: enrobageNominal(d.exposition, d.phiT),
    dPrime: NaN, delta: NaN, AsReq: NaN, phiT: d.phiT,
  };
  const NRd = choix ? nRdEC2(retenu.barres.section, Ac, fcdKn, fydKn, alpha, kh0, ks, retenu.delta, a) : NaN;
  const khEffectif = a < 0.5 ? kh0 * (1 - (6 * retenu.barres.section * retenu.delta) / Ac) : 1;
  const sMax = arrondiInf(Math.min(20 * retenu.barres.phi, a * 1000, 400) / 1000, 0.01); // EC2 §9.5.3(3)
  const sMaxExtremites = arrondiInf((0.6 * Math.min(20 * retenu.barres.phi, a * 1000, 400)) / 1000, 0.01); // §9.5.3(4)
  const ec2: ResultatEC2 = {
    lambda, alpha, kh0, ks,
    enrobage: retenu.enrobage,
    barres: retenu.barres,
    dPrime: retenu.dPrime,
    delta: retenu.delta,
    khEffectif,
    NRdBetonSeul: kh0 * ks * alpha * Ac * fcdKn,
    AsReq: retenu.AsReq,
    AsMin, AsMax, NRd,
    taux: NEd / NRd,
    phiTMin: Math.max(6, Math.ceil(retenu.barres.phi / 4)),
    phiT: retenu.phiT,
    sMax, sMaxExtremites,
    zoneExtremite: b,
    valide: Boolean(choix) && lambda <= 120 && a >= 0.15,
    messages: messagesEC2,
  };

  // ---------- BAEL 91 ----------
  const messagesBAEL: string[] = [];
  const alphaB = alphaBAEL(lambda);
  const Br = (a - 0.02) * (b - 0.02) * 1e4; // section réduite : 1 cm retiré sur tout le pourtour
  const termeBeton = (Br * (d.fck / 10)) / (0.9 * GAMMA_C);
  const Ath = (NEd / alphaB - termeBeton) * (GAMMA_S / (d.fyk / 10));
  const Amin = Math.max(4 * 2 * (a + b), 0.002 * Ac); // 4 cm² par mètre de périmètre, 0,2 % (A.8.1,21)
  const Amax = 0.05 * Ac;
  const A = Math.max(Ath, Amin);
  const barresB = candidats.find((c) => c.section >= A && c.section <= Amax);
  if (lambda > 70) messagesBAEL.push('λ > 70 : hors du domaine du BAEL pour ce calcul.');
  if (!barresB) messagesBAEL.push('Aucune combinaison de barres ne convient.');
  const barresBAEL = barresB ?? candidats[candidats.length - 1]!;
  const bael: ResultatBAEL = {
    lambda,
    alpha: alphaB,
    Br, termeBeton, NuBetonSeul: alphaB * termeBeton, Ath, Amin, Amax, A,
    barres: barresBAEL,
    phiTMin: barresBAEL.phi / 3,
    stMax: Math.min(15 * barresBAEL.phi / 1000, 0.4, a + 0.1), // A.8.1,3
    valide: Boolean(barresB) && lambda <= 70,
    messages: messagesBAEL,
  };

  // ---------- Quantités (solution EC2) ----------
  const c = ec2.enrobage.cnom / 1000;
  const phiT = ec2.phiT / 1000;
  const longueurCadre = 2 * (a - 2 * c - phiT) + 2 * (b - 2 * c - phiT) + CROCHETS_CADRE;
  const zone = Math.min(ec2.zoneExtremite, d.l / 2);
  const nombreCadres = positionsCadres(d.l, zone, ec2.sMaxExtremites, ec2.sMax).length;
  const masseLongitudinale = ec2.barres.n * d.l * masseLineique(ec2.barres.phi);
  const masseCadres = nombreCadres * longueurCadre * masseLineique(ec2.phiT);
  const volumeBeton = a * b * d.l;
  const quantites: Quantites = {
    volumeBeton,
    coffrage: 2 * (a + b) * d.l,
    longueurBarres: ec2.barres.n * d.l,
    masseLongitudinale,
    nombreCadres,
    longueurCadre,
    masseCadres,
    masseTotale: masseLongitudinale + masseCadres,
    ratio: (masseLongitudinale + masseCadres) / volumeBeton,
  };

  return { NEd, l0, fcd: fcdMPa, fyd: fydMPa, Ac, ec2, bael, quantites };
}
