// Fiches de calcul du module N0.7 (physique de base). Les valeurs viennent de lib/calc/physique.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { BilanGroupeSchema, ChateauSchema, CuveCoupe, DilatationSchema, GrapheVitesse, LevageSchema, PlanInclineSchema, PompeSchema } from '@/components/schemas/Physique';
import { PESANTEUR, POIDS_VOLUMIQUE_BA } from '@/lib/calc/methode';
import {
  bilanGroupe,
  chateauEau,
  cuveEnterree,
  dilatation,
  distanceArret,
  EXEMPLE_ARRET,
  EXEMPLE_CHATEAU,
  EXEMPLE_CUVE,
  EXEMPLE_DILATATION,
  EXEMPLE_GROUPE,
  EXEMPLE_LEVAGE,
  EXEMPLE_PLAN,
  EXEMPLE_POMPE,
  levage,
  MATERIAUX_THERMIQUES,
  planIncline,
  pompe,
  TAILLES_GROUPES,
  type DonneesArret,
  type DonneesChateau,
  type DonneesCuve,
  type DonneesDilatation,
  type DonneesGroupe,
  type DonneesLevage,
  type DonneesPlan,
  type DonneesPompe,
  type ResultatArret,
  type ResultatChateau,
  type ResultatCuve,
  type ResultatDilatation,
  type ResultatGroupe,
  type ResultatLevage,
  type ResultatPlan,
  type ResultatPompe,
} from '@/lib/calc/physique';
import { cosD } from '@/lib/calc/trigo';
import { grandeur, nombre } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const g2 = n2(PESANTEUR);

const champ = (cle: string, libelle: string, symbole: string, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

// ---------- Distance d'arrêt (N0.7.1) ----------
type ResArret = ResultatArret & { d: DonneesArret };

const arretDef: DefinitionCalcul<ResArret> = {
  champs: [
    champ('v', 'vitesse du camion', 'v', 'km/h', 5, 120, 1, 0),
    champ('tr', 'temps de réaction (énoncé)', 'tr', 's', 0.5, 3, 0.1, 1),
    champ('a', 'décélération de freinage (énoncé)', 'a', 'm/s²', 1, 8, 0.1, 1),
  ],
  defaut: { ...EXEMPLE_ARRET },
  calculer: (e) => {
    const d = { v: num(e, 'v'), tr: num(e, 'tr'), a: num(e, 'a') };
    return { ...distanceArret(d), d };
  },
  valeurs: {
    v0: (r) => grandeur(r.v0, 2, 'm/s'),
    dReaction: (r) => grandeur(r.dReaction, 2, 'm'),
    dFreinage: (r) => grandeur(r.dFreinage, 2, 'm'),
    dArret: (r) => grandeur(r.dArret, 2, 'm'),
    tFreinage: (r) => grandeur(r.tFreinage, 2, 's'),
    tArret: (r) => grandeur(r.tArret, 2, 's'),
  },
  lignes: {
    conversion: (r) => (
      <>
        v0 = {nombre(r.d.v, 0)} km/h ÷ 3,6 = <strong>{n2(r.v0)} m/s</strong>
      </>
    ),
    reaction: (r) => (
      <>
        réaction, à vitesse constante : d1 = v0 × tr = {n2(r.v0)} × {n1(r.d.tr)} = <strong>{n2(r.dReaction)} m</strong>
      </>
    ),
    freinage: (r) => (
      <>
        freinage : d2 = v0² / (2 a) = {n2(r.v0)}² / (2 × {n1(r.d.a)}) = <strong>{n2(r.dFreinage)} m</strong>
      </>
    ),
    arret: (r) => (
      <>
        distance d’arrêt : d = d1 + d2 = {n2(r.dReaction)} + {n2(r.dFreinage)} = <strong>{n2(r.dArret)} m</strong>
      </>
    ),
    duree: (r) => (
      <>
        durée du freinage : v0 / a = {n2(r.v0)} / {n1(r.d.a)} = {n2(r.tFreinage)} s ; arrêt complet en <strong>{n2(r.tArret)} s</strong>
      </>
    ),
  },
  schema: ({ r }) => <GrapheVitesse d={r.d} r={r} />,
};

// ---------- Câble de levage (N0.7.2) ----------
type ResLevage = ResultatLevage & { d: DonneesLevage };

const levageDef: DefinitionCalcul<ResLevage> = {
  champs: [champ('m', 'masse levée', 'm', 'kg', 50, 20000, 10, 0), champ('a', 'accélération, positive vers le haut', 'a', 'm/s²', -9, 4, 0.05, 2)],
  defaut: { ...EXEMPLE_LEVAGE },
  calculer: (e) => {
    const d = { m: num(e, 'm'), a: num(e, 'a') };
    return { ...levage(d), d };
  },
  valeurs: {
    P: (r) => grandeur(r.P, 2, 'kN'),
    T: (r) => grandeur(r.T, 2, 'kN'),
    surplus: (r) => grandeur((r.rapport - 1) * 100, 1, '%'),
  },
  lignes: {
    poids: (r) => (
      <>
        poids : P = m g = {nombre(r.d.m, 0)} × {g2} = {nombre(r.P * 1000, 0)} N = <strong>{n2(r.P)} kN</strong>
      </>
    ),
    newton: () => <>deuxième loi de Newton, axe vertical vers le haut : T − P = m a, donc T = m (g + a)</>,
    tension: (r) => (
      <>
        T = {nombre(r.d.m, 0)} × ({g2} + {p2(r.d.a)}) = {nombre(r.T * 1000, 0)} N = <strong>{n2(r.T)} kN</strong>
      </>
    ),
    rapport: (r) => (
      <>
        T / P = {n3(r.rapport)} : le câble porte {r.rapport >= 1 ? `${n1((r.rapport - 1) * 100)} % de plus` : `${n1((1 - r.rapport) * 100)} % de moins`} que le poids
      </>
    ),
  },
  schema: ({ r }) => <LevageSchema d={r.d} r={r} />,
  alerte: (r) => (r.mou ? 'Accélération vers le bas supérieure à g : le câble se détend, la charge tombe en chute libre.' : undefined),
};

/** Nombre entre parenthèses s'il est négatif : (−0,50). */
function p2(x: number) {
  return x < 0 ? `(${n2(x)})` : n2(x);
}

// ---------- Plan incliné (N0.7.3) ----------
type ResPlan = ResultatPlan & { d: DonneesPlan };

const planDef: DefinitionCalcul<ResPlan> = {
  champs: [champ('m', 'masse de la charge', 'm', 'kg', 10, 5000, 10, 0), champ('alpha', 'pente de la rampe', 'α', '°', 0, 60, 0.5, 1), champ('mu', 'coefficient de frottement (énoncé)', 'μ', '—', 0, 1.2, 0.01, 2)],
  defaut: { ...EXEMPLE_PLAN },
  calculer: (e) => {
    const d = { m: num(e, 'm'), alpha: num(e, 'alpha'), mu: num(e, 'mu') };
    return { ...planIncline(d), d };
  },
  valeurs: {
    P: (r) => grandeur(r.P, 2, 'kN'),
    N: (r) => grandeur(r.N, 2, 'kN'),
    Ppara: (r) => grandeur(r.Ppara, 2, 'kN'),
    Fmax: (r) => grandeur(r.Fmax, 2, 'kN'),
    Fretenir: (r) => grandeur(r.Fretenir, 2, 'kN'),
    Fmonter: (r) => grandeur(r.Fmonter, 2, 'kN'),
    angleLimite: (r) => `${n2(r.angleLimite)}°`,
    verdict: (r) => (r.glisse ? 'la charge glisse' : 'la charge reste en place'),
  },
  lignes: {
    poids: (r) => (
      <>
        poids : P = m g = {nombre(r.d.m, 0)} × {g2} = <strong>{n2(r.P)} kN</strong>
      </>
    ),
    composantes: (r) => (
      <>
        le long de la rampe : P sin α = {n2(r.P)} × sin {n1(r.d.alpha)}° = <strong>{n2(r.Ppara)} kN</strong> ; perpendiculairement : N = P cos α = {n2(r.P)} × {n3(cosD(r.d.alpha))} ={' '}
        <strong>{n2(r.N)} kN</strong>
      </>
    ),
    frottement: (r) => (
      <>
        frottement maximal : μ N = {n2(r.d.mu)} × {n2(r.N)} = <strong>{n2(r.Fmax)} kN</strong>
      </>
    ),
    comparaison: (r) => (
      <>
        {n2(r.Ppara)} kN {r.glisse ? '>' : '≤'} {n2(r.Fmax)} kN : <strong>{r.glisse ? 'la charge glisse' : 'la charge reste en place'}</strong> (pente limite arctan μ = {n2(r.angleLimite)}°)
      </>
    ),
    forces: (r) => (
      <>
        pour la retenir : max(0 ; {n2(r.Ppara)} − {n2(r.Fmax)}) = <strong>{n2(r.Fretenir)} kN</strong> ; pour la monter : {n2(r.Ppara)} + {n2(r.Fmax)} = <strong>{n2(r.Fmonter)} kN</strong>
      </>
    ),
  },
  schema: ({ r }) => <PlanInclineSchema d={r.d} r={r} prefixe="pi-fiche" />,
};

// ---------- Pompe (N0.7.4) ----------
type ResPompe = ResultatPompe & { d: DonneesPompe };

const pompeDef: DefinitionCalcul<ResPompe> = {
  champs: [
    champ('Q', 'débit', 'Q', 'm³/h', 0.5, 50, 0.1, 1),
    champ('H', 'hauteur manométrique (énoncé)', 'H', 'm', 2, 150, 0.5, 1),
    champ('eta', 'rendement de la motopompe (énoncé)', 'η', '—', 0.2, 0.9, 0.01, 2),
    champ('V', 'volume à pomper', 'V', 'm³', 1, 200, 0.5, 1),
  ],
  defaut: { ...EXEMPLE_POMPE },
  calculer: (e) => {
    const d = { Q: num(e, 'Q'), H: num(e, 'H'), eta: num(e, 'eta'), V: num(e, 'V') };
    return { ...pompe(d), d };
  },
  valeurs: {
    Ph: (r) => grandeur(r.Ph, 1, 'W'),
    Pabs: (r) => grandeur(r.Pabs, 1, 'W'),
    duree: (r) => grandeur(r.duree, 2, 'h'),
    energie: (r) => grandeur(r.energie, 2, 'kWh'),
    energieUtile: (r) => grandeur(r.energieUtile, 2, 'kWh'),
  },
  lignes: {
    debit: (r) => (
      <>
        débit en m³/s : Q = {n1(r.d.Q)} / 3 600 = <strong>{nombre(r.Qs * 1e4, 3)} × 10⁻⁴ m³/s</strong>
      </>
    ),
    hydraulique: (r) => (
      <>
        puissance transmise à l’eau : Ph = ρ g Q H = 1 000 × {g2} × {nombre(r.Qs * 1e4, 3)} × 10⁻⁴ × {n1(r.d.H)} = <strong>{n1(r.Ph)} W</strong>
      </>
    ),
    absorbee: (r) => (
      <>
        puissance absorbée : Pabs = Ph / η = {n1(r.Ph)} / {n2(r.d.eta)} = <strong>{n1(r.Pabs)} W</strong>
      </>
    ),
    duree: (r) => (
      <>
        durée : V / Q = {n1(r.d.V)} / {n1(r.d.Q)} = <strong>{n2(r.duree)} h</strong>
      </>
    ),
    energie: (r) => (
      <>
        énergie consommée : Pabs × durée = {n1(r.Pabs)} W × {n2(r.duree)} h = <strong>{n2(r.energie)} kWh</strong> (dont {n2(r.energieUtile)} kWh transmis à l’eau)
      </>
    ),
  },
  schema: ({ r }) => <PompeSchema d={r.d} r={r} prefixe="pp-fiche" />,
};

// ---------- Cuve enterrée (N0.7.5) ----------
type ResCuve = ResultatCuve & { d: DonneesCuve };

const cuveDef: DefinitionCalcul<ResCuve> = {
  champs: [
    champ('L', 'longueur extérieure', 'L', 'm', 1, 10, 0.05, 2),
    champ('l', 'largeur extérieure', 'l', 'm', 1, 6, 0.05, 2),
    champ('H', 'hauteur extérieure', 'H', 'm', 1, 5, 0.05, 2),
    champ('e', 'épaisseur du béton', 'e', 'm', 0.1, 0.4, 0.01, 2),
    champ('hw', 'nappe au-dessus du fond', 'hw', 'm', 0, 6, 0.05, 2),
  ],
  defaut: { ...EXEMPLE_CUVE },
  calculer: (e) => {
    const d = { L: num(e, 'L'), l: num(e, 'l'), H: num(e, 'H'), e: num(e, 'e'), hw: num(e, 'hw') };
    return { ...cuveEnterree(d), d };
  },
  valeurs: {
    G: (r) => grandeur(r.G, 2, 'kN'),
    Pi: (r) => grandeur(r.Pi, 2, 'kN'),
    pFond: (r) => grandeur(r.pFond, 2, 'kPa'),
    rapport: (r) => n2(r.rapport),
    hLimite: (r) => grandeur(r.hLimite, 2, 'm'),
    verdict: (r) => (r.flotte ? 'la cuve vide se soulève' : 'la cuve reste en place'),
  },
  lignes: {
    volumes: (r) => (
      <>
        béton : {n2(r.d.L)} × {n2(r.d.l)} × {n2(r.d.H)} − {n2(r.d.L - 2 * r.d.e)} × {n2(r.d.l - 2 * r.d.e)} × {n2(r.d.H - 2 * r.d.e)} = {n3(r.Vext)} − {n3(r.Vint)} ={' '}
        <strong>{n3(r.Vbeton)} m³</strong>
      </>
    ),
    poids: (r) => (
      <>
        poids de la cuve vide : G = {nombre(POIDS_VOLUMIQUE_BA, 0)} × {n3(r.Vbeton)} = <strong>{n2(r.G)} kN</strong>
      </>
    ),
    pression: (r) => (
      <>
        pression de l’eau sous le fond : p = ρ g h = 1 000 × {g2} × {n2(r.hImm)} = {nombre(r.pFond * 1000, 0)} Pa = <strong>{n2(r.pFond)} kPa</strong>
      </>
    ),
    poussee: (r) => (
      <>
        poussée d’Archimède : Π = p × L × l = {n2(r.pFond)} × {n2(r.d.L)} × {n2(r.d.l)} = <strong>{n2(r.Pi)} kN</strong>
      </>
    ),
    comparaison: (r) => (
      <>
        G / Π = {n2(r.G)} / {n2(r.Pi)} = {Number.isFinite(r.rapport) ? n2(r.rapport) : '∞'} : <strong>{r.flotte ? 'Π > G, la cuve vide se soulève' : 'G > Π, la cuve reste en place'}</strong>
      </>
    ),
    limite: (r) => (
      <>
        hauteur de nappe qui équilibre le poids : hw = G / (ρ g L l) = {n2(r.G)} / ({nombre(PESANTEUR, 2)} × {n2(r.d.L)} × {n2(r.d.l)}) = <strong>{n2(r.hLimite)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <CuveCoupe d={r.d} r={r} prefixe="cu-fiche" />,
  alerte: (r) => (r.flotte ? 'Poussée d’Archimède supérieure au poids : la cuve vide se soulève. Lester, ancrer ou rabattre la nappe.' : undefined),
};

// ---------- Dilatation thermique (N0.7.6) ----------
type ResDilatation = ResultatDilatation & { d: DonneesDilatation };

const dilatationDef: DefinitionCalcul<ResDilatation> = {
  champs: [
    champ('L', 'longueur de l’élément', 'L', 'm', 1, 120, 0.5, 1),
    champ('dT', 'variation de température (énoncé)', 'ΔT', 'K', 1, 60, 1, 0),
    {
      type: 'choix',
      cle: 'materiau',
      libelle: 'matériau',
      symbole: 'α',
      options: (Object.keys(MATERIAUX_THERMIQUES) as Array<keyof typeof MATERIAUX_THERMIQUES>).map((k) => ({ valeur: k, libelle: `${MATERIAUX_THERMIQUES[k].nom} (α = ${nombre(MATERIAUX_THERMIQUES[k].alpha * 1e6, 0)} × 10⁻⁶ K⁻¹)` })),
    },
  ],
  defaut: { ...EXEMPLE_DILATATION },
  calculer: (e) => {
    const d = { L: num(e, 'L'), dT: num(e, 'dT'), materiau: e.materiau === 'acier' ? ('acier' as const) : ('beton' as const) };
    return { ...dilatation(d), d };
  },
  valeurs: {
    dL: (r) => grandeur(r.dL, 1, 'mm'),
    sigma: (r) => grandeur(r.sigma, 2, 'MPa'),
    limite: (r) => grandeur(r.limite, 1, 'MPa'),
    rapport: (r) => n2(r.rapport),
  },
  lignes: {
    allongement: (r) => (
      <>
        allongement libre : ΔL = α L ΔT = {nombre(r.alpha * 1e6, 0)} × 10⁻⁶ × {nombre(r.d.L * 1000, 0)} mm × {nombre(r.d.dT, 0)} = <strong>{n1(r.dL)} mm</strong>
      </>
    ),
    contrainte: (r) => (
      <>
        totalement bloqué : σ = E α ΔT = {nombre(r.E, 0)} × {nombre(r.alpha * 1e6, 0)} × 10⁻⁶ × {nombre(r.d.dT, 0)} = <strong>{n2(r.sigma)} MPa</strong>
      </>
    ),
    comparaison: (r) => (
      <>
        {MATERIAUX_THERMIQUES[r.d.materiau].nomLimite} : {n1(r.limite)} MPa ({MATERIAUX_THERMIQUES[r.d.materiau].source}) ; σ / limite = <strong>{n2(r.rapport)}</strong>
      </>
    ),
  },
  schema: ({ r }) => <DilatationSchema d={r.d} r={r} prefixe="di-fiche" />,
};

// ---------- Groupe électrogène (N0.7.7) ----------
type ResGroupe = ResultatGroupe & { d: DonneesGroupe };

const groupeDef: DefinitionCalcul<ResGroupe> = {
  champs: [
    champ('betonniere', 'bétonnière (énoncé)', 'P₁', 'kW', 0, 15, 0.05, 2),
    champ('vibreur', 'vibreur (énoncé)', 'P₂', 'kW', 0, 10, 0.05, 2),
    champ('pompe', 'pompe d’épuisement (énoncé)', 'P₃', 'kW', 0, 10, 0.05, 2),
    champ('eclairage', 'éclairage (énoncé)', 'P₄', 'kW', 0, 10, 0.05, 2),
    champ('cosPhi', 'facteur de puissance global', 'cos φ', '—', 0.5, 1, 0.01, 2),
    champ('k', 'appel au démarrage du plus gros moteur', 'k', '—', 1, 8, 0.5, 1),
    {
      type: 'choix',
      cle: 'reseau',
      libelle: 'réseau',
      symbole: 'U',
      options: [
        { valeur: 'tri', libelle: 'triphasé 400 V' },
        { valeur: 'mono', libelle: 'monophasé 230 V' },
      ],
    },
  ],
  defaut: { ...EXEMPLE_GROUPE },
  calculer: (e) => {
    const d = {
      betonniere: num(e, 'betonniere'),
      vibreur: num(e, 'vibreur'),
      pompe: num(e, 'pompe'),
      eclairage: num(e, 'eclairage'),
      cosPhi: num(e, 'cosPhi'),
      k: num(e, 'k'),
      reseau: e.reseau === 'mono' ? ('mono' as const) : ('tri' as const),
    };
    return { ...bilanGroupe(d), d };
  },
  valeurs: {
    P: (r) => grandeur(r.P, 2, 'kW'),
    S: (r) => grandeur(r.S, 2, 'kVA'),
    Sdem: (r) => grandeur(r.Sdem, 2, 'kVA'),
    groupe: (r) => (r.groupe ? `${r.groupe} kVA` : 'hors gamme'),
    I: (r) => grandeur(r.I, 1, 'A'),
  },
  lignes: {
    somme: (r) => (
      <>
        puissance active : P = {n2(r.d.betonniere)} + {n2(r.d.vibreur)} + {n2(r.d.pompe)} + {n2(r.d.eclairage)} = <strong>{n2(r.P)} kW</strong>
      </>
    ),
    apparente: (r) => (
      <>
        puissance apparente en marche : S = P / cos φ = {n2(r.P)} / {n2(r.d.cosPhi)} = <strong>{n2(r.S)} kVA</strong>
      </>
    ),
    demarrage: (r) => (
      <>
        démarrage du plus gros moteur ({n2(r.Pmax)} kW appelant {n1(r.d.k)} fois sa puissance) : ({n2(r.P)} + ({n1(r.d.k)} − 1) × {n2(r.Pmax)}) / {n2(r.d.cosPhi)} ={' '}
        <strong>{n2(r.Sdem)} kVA</strong>
      </>
    ),
    choix: (r) => (
      <>
        gamme ({TAILLES_GROUPES.join(', ')} kVA) : {r.groupe ? <strong>groupe de {r.groupe} kVA</strong> : <strong>aucune taille ne suffit</strong>}
      </>
    ),
    courant: (r) => (
      <>
        courant en marche : {r.d.reseau === 'mono' ? `I = P / (U cos φ) = ${nombre(r.P * 1000, 0)} / (${r.U} × ${n2(r.d.cosPhi)})` : `I = P / (√3 U cos φ) = ${nombre(r.P * 1000, 0)} / (1,732 × ${r.U} × ${n2(r.d.cosPhi)})`} ={' '}
        <strong>{n1(r.I)} A</strong>
      </>
    ),
  },
  schema: ({ r }) => <BilanGroupeSchema d={r.d} r={r} />,
  alerte: (r) => (r.groupe ? undefined : 'Puissance au démarrage au-delà de la gamme retenue : fractionner les démarrages ou prévoir un groupe plus puissant.'),
};

// ---------- Château d'eau (N0.7.P) ----------
type ResChateau = ResultatChateau & { d: DonneesChateau };

const chateauDef: DefinitionCalcul<ResChateau> = {
  champs: [
    champ('D', 'diamètre intérieur de la cuve', 'D', 'm', 1, 10, 0.1, 1),
    champ('h', 'hauteur d’eau, cuve pleine', 'h', 'm', 0.5, 6, 0.1, 1),
    champ('H', 'hauteur du fond de cuve', 'H', 'm', 2, 30, 0.5, 1),
    champ('Gs', 'poids de la structure vide (énoncé)', 'Gs', 'kN', 50, 3000, 10, 0),
    champ('B', 'côté du radier carré', 'B', 'm', 2, 12, 0.1, 1),
    champ('zf', 'profondeur de l’eau dans le forage', 'zf', 'm', 2, 80, 0.5, 1),
    champ('eta', 'rendement de la motopompe (énoncé)', 'η', '—', 0.2, 0.9, 0.01, 2),
    champ('t', 'durée de remplissage', 't', 'h', 1, 24, 0.5, 1),
  ],
  defaut: { ...EXEMPLE_CHATEAU },
  calculer: (e) => {
    const d = { D: num(e, 'D'), h: num(e, 'h'), H: num(e, 'H'), Gs: num(e, 'Gs'), B: num(e, 'B'), zf: num(e, 'zf'), eta: num(e, 'eta'), t: num(e, 't') };
    return { ...chateauEau(d), d };
  },
  valeurs: {
    V: (r) => grandeur(r.V, 2, 'm³'),
    Geau: (r) => grandeur(r.Geau, 2, 'kN'),
    N: (r) => grandeur(r.N, 2, 'kN'),
    sigma: (r) => grandeur(r.sigma, 2, 'kPa'),
    pFond: (r) => grandeur(r.pFond, 2, 'kPa'),
    pSol: (r) => grandeur(r.pSol, 2, 'kPa'),
    pSolBar: (r) => grandeur(r.pSol / 100, 2, 'bar'),
    dz: (r) => grandeur(r.dz, 2, 'm'),
    Eu: (r) => grandeur(r.Eu, 2, 'kWh'),
    Ea: (r) => grandeur(r.Ea, 2, 'kWh'),
    Q: (r) => grandeur(r.Q, 2, 'm³/h'),
    Pabs: (r) => grandeur(r.Pabs / 1000, 2, 'kW'),
  },
  lignes: {
    volume: (r) => (
      <>
        S = π D² / 4 = π × {n1(r.d.D)}² / 4 = {n3(r.S)} m² ; V = S × h = {n3(r.S)} × {n1(r.d.h)} = <strong>{n2(r.V)} m³</strong>
      </>
    ),
    poids: (r) => (
      <>
        masse d’eau : 1 000 × {n2(r.V)} = {nombre(r.masse, 0)} kg ; poids : × {g2} = <strong>{n2(r.Geau)} kN</strong>
      </>
    ),
    sol: (r) => (
      <>
        charge totale : N = {n2(r.Geau)} + {nombre(r.d.Gs, 0)} = <strong>{n2(r.N)} kN</strong> ; sous le radier : σ = N / B² = {n2(r.N)} / {n1(r.d.B)}² = <strong>{n2(r.sigma)} kPa</strong>
      </>
    ),
    pressions: (r) => (
      <>
        fond de cuve : ρ g h = {nombre(PESANTEUR, 2)} × {n1(r.d.h)} = <strong>{n2(r.pFond)} kPa</strong> ; robinet au sol : ρ g (H + h) = {nombre(PESANTEUR, 2)} × {n1(r.d.H + r.d.h)} ={' '}
        <strong>{n2(r.pSol)} kPa</strong> ({n2(r.pSol / 100)} bar)
      </>
    ),
    elevation: (r) => (
      <>
        élévation : Δz = zf + H + h = {n1(r.d.zf)} + {n1(r.d.H)} + {n1(r.d.h)} = <strong>{n2(r.dz)} m</strong>
      </>
    ),
    energie: (r) => (
      <>
        énergie transmise à l’eau : m g Δz = {nombre(r.masse, 0)} × {g2} × {n2(r.dz)} / 3,6 × 10⁶ = <strong>{n2(r.Eu)} kWh</strong> ; consommée : / {n2(r.d.eta)} ={' '}
        <strong>{n2(r.Ea)} kWh</strong>
      </>
    ),
    puissance: (r) => (
      <>
        en {n1(r.d.t)} h : Q = {n2(r.Q)} m³/h ; Ph = ρ g Q Δz = {n1(r.Ph)} W ; Pabs = Ph / η = <strong>{n2(r.Pabs / 1000)} kW</strong>
      </>
    ),
  },
  schema: ({ r }) => <ChateauSchema d={r.d} r={r} />,
};

export const CALCULS_PHYSIQUE = {
  distanceArret: arretDef,
  levage: levageDef,
  planIncline: planDef,
  pompe: pompeDef,
  cuveEnterree: cuveDef,
  dilatation: dilatationDef,
  groupeElectrogene: groupeDef,
  chateauEau: chateauDef,
} as const;
