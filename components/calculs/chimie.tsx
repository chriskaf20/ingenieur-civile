// Fiches de calcul du module L1.5 (chimie des matériaux). Les valeurs viennent de lib/calc/chimie.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { colonne, Matrice } from '@/components/pedago/Matrice';
import { AnalyseEauSchema, BilanAdjuvant, BilanMasseReaction, CyclesLiants, EchellePH, equationTexte, formuleUnicode, FrontCarbonatation, PerteSectionBarre, PhasesClinker, texteLimite } from '@/components/schemas/Chimie';
import {
  analyseEau,
  bilanAtomes,
  bogue,
  cyclePlatre,
  cycleChaux,
  detailMasseMolaire,
  diagnosticCarbonatation,
  dosageAdjuvant,
  EXEMPLE_ADJUVANT,
  EXEMPLE_CARBONATATION,
  EXEMPLE_CLINKER,
  EXEMPLE_CORROSION,
  EXEMPLE_CYCLE_CHAUX,
  EXEMPLE_EAU,
  EXEMPLE_NEUTRALISATION,
  FARADAY,
  hydratationSilicates,
  MASSE_VOLUMIQUE_ACIER,
  masseMolaire,
  massesReaction,
  neutralisation,
  perteSection,
  RAPPORT_VOLUME_ROUILLE,
  reaction,
  REACTIONS,
  type Critere,
  type Reaction,
  type UsageBeton,
} from '@/lib/calc/chimie';
import { grandeur, nombre, nombreCourt, scientifique } from '@/lib/format';

const n1 = (x: number) => nombre(x, 1);
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const nc = (x: number) => nombreCourt(x, 3);

const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;

// ---------- Stœchiométrie (L1.5.2) ----------
type ResStoechio = ReturnType<typeof massesReaction> & { r: Reaction; bilan: ReturnType<typeof bilanAtomes>; masse: number };

const stoechioDef: DefinitionCalcul<ResStoechio> = {
  champs: [
    { type: 'choix', cle: 'reaction', libelle: 'réaction étudiée', symbole: 'R', options: REACTIONS.map((r) => ({ valeur: r.id, libelle: r.nom })) },
    champ('m', 'masse du premier réactif (énoncé)', 'm', 'kg', 1, 100000, 1, 0),
  ],
  defaut: { reaction: 'calcination', m: 1000 },
  calculer: (e) => {
    const r = reaction(String(e.reaction));
    const masse = num(e, 'm');
    return { ...massesReaction(r, 0, masse), r, bilan: bilanAtomes(r), masse };
  },
  valeurs: {
    produit: (x) => {
      const p = x.lignes.find((l) => l.cote === 'produit')!;
      return `${grandeur(p.m, 1, 'kg')} de ${formuleUnicode(p.formule)}`;
    },
    total: (x) => grandeur(x.masseProduits, 1, 'kg'),
  },
  lignes: {
    equation: (x) => (
      <>
        {x.r.nom} : <strong>{equationTexte(x.r)}</strong>
      </>
    ),
    atomes: (x) => (
      <>
        atomes à gauche et à droite : {x.bilan.elements.map((el) => `${el} : ${nc(x.bilan.gauche[el] ?? 0)} = ${nc(x.bilan.droite[el] ?? 0)}`).join(' ; ')}
        {x.bilan.equilibree ? ' : équation équilibrée' : ' : équation NON équilibrée'}
      </>
    ),
    masseMolaire: (x) => {
      const d = detailMasseMolaire(x.ref.formule);
      return (
        <>
          M({formuleUnicode(x.ref.formule)}) = {d.lignes.map((l) => `${l.nombre === 1 ? '' : `${nc(l.nombre)} × `}${nombre(l.masseAtomique, 3)}`).join(' + ')} = <strong>{n3(d.M)} g/mol</strong>
        </>
      );
    },
    moles: (x) => (
      <>
        n = m / M = {nombre(x.masse, 0)} kg / {n3(masseMolaire(x.ref.formule))} kg/kmol = <strong>{n3(x.nRef)} kmol</strong> de {formuleUnicode(x.ref.formule)}
      </>
    ),
    masses: (x) => (
      <span className="grid sm:grid-cols-2 sm:gap-x-6">
        {x.lignes.map((l, i) => (
          <span key={i} className="block">
            {formuleUnicode(l.formule)} : {n3(l.n)} kmol × {n3(l.M)} = <strong>{n1(l.m)} kg</strong>
          </span>
        ))}
      </span>
    ),
    conservation: (x) => (
      <>
        conservation : réactifs {n1(x.masseReactifs)} kg = produits {n1(x.masseProduits)} kg
      </>
    ),
  },
  schema: ({ r: x }) => <BilanMasseReaction lignes={x.lignes} />,
};

// ---------- Neutralisation d'une eau acide (L1.5.3) ----------
type ResNeutr = ReturnType<typeof neutralisation> & { V: number; pH0: number; pH1: number; purete: number };

const neutrDef: DefinitionCalcul<ResNeutr> = {
  champs: [
    champ('V', 'volume d’eau à traiter (énoncé)', 'V', 'm³', 1, 10000, 1, 0),
    champ('pH0', 'pH mesuré', <>pH<sub>0</sub></>, '', 1, 6.9, 0.1, 1),
    champ('pH1', 'pH visé', <>pH<sub>1</sub></>, '', 5, 9, 0.1, 1),
    champ('purete', 'teneur de la chaux en Ca(OH)₂ (fiche produit)', 'p', '%', 50, 100, 1, 0),
  ],
  defaut: { ...EXEMPLE_NEUTRALISATION },
  calculer: (e) => {
    const d = { V: num(e, 'V'), pH0: num(e, 'pH0'), pH1: num(e, 'pH1'), purete: num(e, 'purete') };
    return { ...neutralisation(d), ...d };
  },
  valeurs: {
    nH: (r) => grandeur(r.nH, 1, 'mol'),
    mPure: (r) => grandeur(r.mPure, 2, 'kg'),
    mCommerciale: (r) => grandeur(r.mCommerciale, 1, 'kg'),
  },
  lignes: {
    concentrations: (r) => (
      <>
        [H₃O⁺]<sub>0</sub> = 10<sup>−{n1(r.pH0)}</sup> = {scientifique(r.h0, 3)} mol/L ; [H₃O⁺]<sub>1</sub> = 10<sup>−{n1(r.pH1)}</sup> = {scientifique(r.h1, 3)} mol/L : l’eau est {nombre(r.rapport, 0)} fois plus acide que visé
      </>
    ),
    nH: (r) => (
      <>
        acidité à neutraliser : n(H⁺) = V × 1 000 L/m³ × ([H₃O⁺]<sub>0</sub> − [H₃O⁺]<sub>1</sub>) = {nombre(r.V, 0)} × 1 000 × {scientifique(r.h0 - r.h1, 3)} = <strong>{n1(r.nH)} mol</strong>
      </>
    ),
    chaux: (r) => (
      <>
        Ca(OH)₂ + 2 H⁺ → Ca²⁺ + 2 H₂O : n(Ca(OH)₂) = n(H⁺) / 2 = <strong>{n1(r.nChaux)} mol</strong>
      </>
    ),
    masse: (r) => (
      <>
        m = n × M = {n1(r.nChaux)} mol × {n3(masseMolaire('Ca(OH)2'))} g/mol = <strong>{n2(r.mPure)} kg</strong> de Ca(OH)₂ pur ; chaux à {nombre(r.purete, 0)} % : {n2(r.mPure)} / {n2(r.purete / 100)} = <strong>{n1(r.mCommerciale)} kg</strong>
      </>
    ),
  },
  schema: ({ r }) => <EchellePH marques={[{ pH: r.pH0, texte: `avant : ${n1(r.pH0)}` }, { pH: r.pH1, texte: `après : ${n1(r.pH1)}` }]} reperes={false} prefixe="fc-ph" />,
  alerte: (r) => (r.pH1 <= r.pH0 ? 'Le pH visé doit être supérieur au pH mesuré : il n’y a rien à neutraliser.' : undefined),
};

// ---------- Composition du clinker (L1.5.4) ----------
type ResBogue = ReturnType<typeof bogue> & { o: typeof EXEMPLE_CLINKER; h: ReturnType<typeof hydratationSilicates> };

const bogueDef: DefinitionCalcul<ResBogue> = {
  champs: [
    champ('CaO', 'chaux CaO (analyse du laboratoire)', 'CaO', '%', 55, 72, 0.1, 1),
    champ('SiO2', 'silice SiO₂', 'SiO₂', '%', 15, 28, 0.1, 1),
    champ('Al2O3', 'alumine Al₂O₃', 'Al₂O₃', '%', 2, 9, 0.1, 1),
    champ('Fe2O3', 'oxyde de fer Fe₂O₃', 'Fe₂O₃', '%', 0.5, 6, 0.1, 1),
    champ('SO3', 'trioxyde de soufre SO₃', 'SO₃', '%', 0, 4, 0.1, 1),
  ],
  defaut: { ...EXEMPLE_CLINKER },
  calculer: (e) => {
    const o = { CaO: num(e, 'CaO'), SiO2: num(e, 'SiO2'), Al2O3: num(e, 'Al2O3'), Fe2O3: num(e, 'Fe2O3'), SO3: num(e, 'SO3') };
    const b = bogue(o);
    return { ...b, o, h: hydratationSilicates(1, Math.max(0, b.C3S), Math.max(0, b.C2S)) };
  },
  valeurs: {
    C3S: (r) => grandeur(r.C3S, 1, '%'),
    C2S: (r) => grandeur(r.C2S, 1, '%'),
    C3A: (r) => grandeur(r.C3A, 1, '%'),
    C4AF: (r) => grandeur(r.C4AF, 1, '%'),
    portlandite: (r) => grandeur(r.h.portlandite, 3, 'kg'),
  },
  lignes: {
    fer: (r) => (
      <>
        tout le fer est dans C₄AF : C₄AF = Fe₂O₃ × M(C₄AF) / M(Fe₂O₃) = {n1(r.o.Fe2O3)} × {n2(masseMolaire('Ca4Al2Fe2O10'))} / {n2(masseMolaire('Fe2O3'))} = <strong>{n2(r.C4AF)} %</strong>
      </>
    ),
    alumine: (r) => (
      <>
        l’alumine restante forme C₃A : ({n1(r.o.Al2O3)} − {n1(r.o.Fe2O3)} × {n3(masseMolaire('Al2O3') / masseMolaire('Fe2O3'))}) × {n3(masseMolaire('Ca3Al2O6') / masseMolaire('Al2O3'))} = <strong>{n2(r.C3A)} %</strong> ; SO₃ en CaSO₄ : {n2(r.CaSO4)} %
      </>
    ),
    chaux: (r) => (
      <>
        CaO encore disponible pour les silicates : <strong>{n2(r.chauxRestante)} %</strong> (le reste est pris par C₄AF, C₃A et CaSO₄)
      </>
    ),
    systeme: (r) => (
      <>
        partage entre C₃S et C₂S (fractions de CaO et de SiO₂ de chaque silicate) : <Matrice M={r.systeme} dec={4} /> <Matrice M={colonne(['C₃S', 'C₂S'])} /> = <Matrice M={colonne([r.chauxRestante, r.o.SiO2])} dec={2} />
      </>
    ),
    silicates: (r) => (
      <>
        résolution du système 2 × 2 (L1.4) : C₃S = <strong>{n2(r.C3S)} %</strong> ; C₂S = <strong>{n2(r.C2S)} %</strong> ; total des phases {n1(r.total)} %
      </>
    ),
    hydratation: (r) => (
      <>
        pour 1 kg de clinker, les silicates fixent {n3(r.h.eau)} kg d’eau et forment <strong>{n3(r.h.portlandite)} kg de portlandite</strong>, la réserve basique du béton
      </>
    ),
  },
  schema: ({ r }) => <PhasesClinker C3S={r.C3S} C2S={r.C2S} C3A={r.C3A} C4AF={r.C4AF} CaSO4={r.CaSO4} />,
  alerte: (r) => (r.valide ? undefined : 'Analyse hors du domaine du calcul de Bogue (Al₂O₃/Fe₂O₃ inférieur à 0,64, ou phase négative) : vérifie les teneurs.'),
};

// ---------- Cycle de la chaux (L1.5.5) ----------
type ResChaux = ReturnType<typeof cycleChaux> & { calcaire: number; purete: number };

const PLATRE_REF = cyclePlatre(1000);

const chauxDef: DefinitionCalcul<ResChaux> = {
  champs: [
    champ('calcaire', 'masse de calcaire cuit', 'm', 't', 1, 1000, 1, 0),
    champ('purete', 'teneur du calcaire en CaCO₃ (analyse)', 'p', '%', 70, 100, 1, 0),
  ],
  defaut: { ...EXEMPLE_CYCLE_CHAUX },
  calculer: (e) => {
    const d = { calcaire: num(e, 'calcaire'), purete: num(e, 'purete') };
    return { ...cycleChaux(d), ...d };
  },
  valeurs: {
    caO: (r) => grandeur(r.caO, 2, 't'),
    co2: (r) => grandeur(r.co2, 2, 't'),
    chauxEteinte: (r) => grandeur(r.chauxEteinte, 2, 't'),
  },
  lignes: {
    pur: (r) => (
      <>
        CaCO₃ contenu : {nombre(r.calcaire, 0)} t × {nombre(r.purete, 0)} % = <strong>{n2(r.caco3)} t</strong>
      </>
    ),
    cuisson: (r) => (
      <>
        cuisson, CaCO₃ → CaO + CO₂ : CaO = {n2(r.caco3)} × {n3(masseMolaire('CaO'))} / {n3(masseMolaire('CaCO3'))} = <strong>{n2(r.caO)} t</strong> ; CO₂ rejeté = <strong>{n2(r.co2)} t</strong>
      </>
    ),
    extinction: (r) => (
      <>
        extinction, CaO + H₂O → Ca(OH)₂ : eau = {n2(r.caO)} × {n3(masseMolaire('H2O'))} / {n3(masseMolaire('CaO'))} = {n2(r.eau)} t ; chaux éteinte = <strong>{n2(r.chauxEteinte)} t</strong>
      </>
    ),
    prise: (r) => (
      <>
        prise à l’air, Ca(OH)₂ + CO₂ → CaCO₃ + H₂O : la chaux reprend {n2(r.co2Repris)} t de CO₂ et redevient {n2(r.calcaireReforme)} t de calcaire
      </>
    ),
    bilan: (r) => (
      <>
        CO₂ de décarbonatation : {n3(r.co2 / r.caO)} t par tonne de chaux vive, sans compter le combustible du four
      </>
    ),
  },
  schema: ({ r }) => <CyclesLiants chaux={r} platre={{ gypse: 1000, platre: PLATRE_REF.platre, vapeur: PLATRE_REF.vapeur }} prefixe="fc-cy" />,
};

// ---------- Corrosion d'une barre (L1.5.6) ----------
type ResCorrosion = ReturnType<typeof perteSection> & { d: typeof EXEMPLE_CORROSION };

const corrosionDef: DefinitionCalcul<ResCorrosion> = {
  champs: [
    champ('phi', 'diamètre de la barre', 'φ', 'mm', 6, 40, 1, 0),
    champ('icorr', 'densité de courant de corrosion (mesure)', <>i<sub>corr</sub></>, 'µA/cm²', 0.05, 10, 0.05, 2),
    champ('duree', 'durée de corrosion active', 't', 'ans', 1, 100, 1, 0),
  ],
  defaut: { ...EXEMPLE_CORROSION },
  calculer: (e) => {
    const d = { phi: num(e, 'phi'), icorr: num(e, 'icorr'), duree: num(e, 'duree') };
    return { ...perteSection(d), d };
  },
  valeurs: {
    vitesse: (r) => grandeur(r.vitesse, 2, 'µm/an'),
    phiRestant: (r) => grandeur(r.phiRestant, 2, 'mm'),
    perte: (r) => grandeur(r.perte * 100, 1, '%'),
  },
  lignes: {
    faraday: (r) => (
      <>
        loi de Faraday : v = M i / (n F ρ) = {n3(masseMolaire('Fe'))} g/mol × {n2(r.d.icorr)} µA/cm² / (2 × {nombre(FARADAY, 0)} C/mol × {nombre(MASSE_VOLUMIQUE_ACIER, 0)} kg/m³) = <strong>{n2(r.vitesse)} µm/an</strong>
      </>
    ),
    penetration: (r) => (
      <>
        pénétration en {nombre(r.d.duree, 0)} ans : p = {n2(r.vitesse)} × {nombre(r.d.duree, 0)} = <strong>{nombre(r.penetration * 1000, 0)} µm</strong> = {n3(r.penetration)} mm
      </>
    ),
    diametre: (r) => (
      <>
        diamètre restant : φ′ = φ − 2 p = {nombre(r.d.phi, 0)} − 2 × {n3(r.penetration)} = <strong>{n2(r.phiRestant)} mm</strong>
      </>
    ),
    section: (r) => (
      <>
        section : π φ² / 4 = {n1(r.A0)} mm² → {n1(r.A1)} mm² ; perte = 1 − {n1(r.A1)} / {n1(r.A0)} = <strong>{n1(r.perte * 100)} %</strong>
      </>
    ),
    rouille: (r) => (
      <>
        fer consommé : {n1(r.masseFerParMetre * 1000)} g par mètre de barre ; la rouille occupe {RAPPORT_VOLUME_ROUILLE.min} à {RAPPORT_VOLUME_ROUILLE.max} fois son volume
      </>
    ),
  },
  schema: ({ r }) => <PerteSectionBarre phi={r.d.phi} phiRestant={r.phiRestant} A0={r.A0} A1={r.A1} perte={r.perte} />,
  alerte: (r) => (r.phiRestant <= 0 ? 'La barre serait entièrement consommée : bien avant, l’enrobage aurait éclaté et la poutre perdu sa résistance.' : undefined),
};

// ---------- Carbonatation : diagnostic (L1.5.7 et mini-projet) ----------
type ResCarbo = ReturnType<typeof diagnosticCarbonatation> & { d: typeof EXEMPLE_CARBONATATION };

const carboDef: DefinitionCalcul<ResCarbo> = {
  champs: [
    champ('age', 'âge de l’ouvrage à la mesure', 't', 'ans', 1, 100, 1, 0),
    champ('x', 'profondeur carbonatée mesurée', 'x', 'mm', 1, 60, 0.5, 1),
    champ('c', 'enrobage mesuré (au détecteur d’armatures)', 'c', 'mm', 5, 80, 1, 0),
  ],
  defaut: { ...EXEMPLE_CARBONATATION },
  calculer: (e) => {
    const d = { age: num(e, 'age'), x: num(e, 'x'), c: num(e, 'c') };
    return { ...diagnosticCarbonatation(d), d };
  },
  valeurs: {
    K: (r) => `${n2(r.K)} mm/√an`,
    tArmatures: (r) => grandeur(r.tArmatures, 0, 'ans'),
    reste: (r) => grandeur(r.reste, 0, 'ans'),
  },
  lignes: {
    K: (r) => (
      <>
        x = K √t, donc K = x / √t = {n1(r.d.x)} / √{nombre(r.d.age, 0)} = <strong>{n2(r.K)} mm/√an</strong>
      </>
    ),
    armatures: (r) => (
      <>
        le front atteint l’enrobage quand K √t = c : t = (c / K)² = ({nombre(r.d.c, 0)} / {n2(r.K)})² = <strong>{n1(r.tArmatures)} ans</strong>
      </>
    ),
    reste: (r) => (
      <>
        {r.atteintes ? (
          <>le front a déjà dépassé les armatures : elles ne sont plus protégées depuis {n1(r.d.age - r.tArmatures)} ans environ</>
        ) : (
          <>
            délai avant que les armatures soient atteintes : {n1(r.tArmatures)} − {nombre(r.d.age, 0)} = <strong>{n1(r.reste)} ans</strong>
          </>
        )}
      </>
    ),
    avenir: (r) => (
      <>
        profondeur prévue : {n1(r.x50)} mm à 50 ans, {n1(r.x100)} mm à 100 ans
      </>
    ),
  },
  schema: ({ r }) => <FrontCarbonatation K={r.K} c={r.d.c} age={r.d.age} x={r.d.x} />,
  alerte: (r) => (r.atteintes ? 'Le front de carbonatation a atteint les armatures : l’acier n’est plus protégé par le pH du béton. Corrosion possible dès que l’humidité est suffisante.' : undefined),
};

// ---------- Dosage d'un adjuvant (L1.5.8) ----------
type ResAdjuvant = ReturnType<typeof dosageAdjuvant> & { d: typeof EXEMPLE_ADJUVANT };

const adjuvantDef: DefinitionCalcul<ResAdjuvant> = {
  champs: [
    champ('C', 'dosage en ciment', 'C', 'kg/m³', 250, 500, 5, 0),
    champ('dosage', 'dosage en adjuvant, en % de la masse de ciment (fiche technique)', 'd', '%', 0.2, 3, 0.1, 1),
    champ('extraitSec', 'extrait sec de l’adjuvant (fiche technique)', 'es', '%', 10, 50, 1, 0),
    champ('densite', 'masse volumique de l’adjuvant', 'ρ', 'kg/L', 1, 1.3, 0.01, 2),
  ],
  defaut: { ...EXEMPLE_ADJUVANT },
  calculer: (e) => {
    const d = { C: num(e, 'C'), dosage: num(e, 'dosage'), extraitSec: num(e, 'extraitSec'), densite: num(e, 'densite') };
    return { ...dosageAdjuvant(d), d };
  },
  valeurs: {
    masse: (r) => grandeur(r.masse, 2, 'kg/m³'),
    volume: (r) => grandeur(r.volume, 2, 'L/m³'),
    eau: (r) => grandeur(r.eau, 2, 'kg/m³'),
  },
  lignes: {
    masse: (r) => (
      <>
        masse d’adjuvant : {nombre(r.d.C, 0)} kg/m³ × {n1(r.d.dosage)} % = <strong>{n2(r.masse)} kg/m³</strong>
      </>
    ),
    volume: (r) => (
      <>
        volume à doser : {n2(r.masse)} / {n2(r.d.densite)} = <strong>{n2(r.volume)} L/m³</strong>
      </>
    ),
    eau: (r) => (
      <>
        matière active : {n2(r.masse)} × {nombre(r.d.extraitSec, 0)} % = {n2(r.actif)} kg ; eau apportée : {n2(r.masse)} − {n2(r.actif)} = <strong>{n2(r.eau)} kg</strong>, soit {n2(r.eau)} L à retrancher de l’eau de gâchage
      </>
    ),
  },
  schema: ({ r }) => <BilanAdjuvant masse={r.masse} actif={r.actif} eau={r.eau} volume={r.volume} />,
};

// ---------- Analyse d'une eau (L1.5.9) ----------
type ResEau = ReturnType<typeof analyseEau> & { usage: UsageBeton };

const USAGES: Record<UsageBeton, string> = { arme: 'béton armé', precontraint: 'béton précontraint', nonArme: 'béton non armé' };
const verdict = (c: Critere) => `${c.nom} ${nombreCourt(c.valeur, 2)}${c.unite ? ` ${c.unite}` : ''} ${c.ok ? '✓' : '✗'} (${texteLimite(c)})`;

const eauDef: DefinitionCalcul<ResEau> = {
  champs: [
    champ('pH', 'pH', 'pH', '', 2, 12, 0.1, 1),
    champ('chlorures', 'chlorures Cl⁻', 'Cl⁻', 'mg/L', 0, 25000, 10, 0),
    champ('sulfates', 'sulfates SO₄²⁻', 'SO₄²⁻', 'mg/L', 0, 5000, 10, 0),
    champ('nitrates', 'nitrates NO₃⁻', 'NO₃⁻', 'mg/L', 0, 200, 1, 0),
    champ('turbidite', 'turbidité', 'T', 'NTU', 0, 500, 1, 0),
    { type: 'choix', cle: 'usage', libelle: 'usage de l’eau de gâchage', symbole: 'U', options: (Object.keys(USAGES) as UsageBeton[]).map((u) => ({ valeur: u, libelle: USAGES[u] })) },
  ],
  defaut: { ...EXEMPLE_EAU, usage: 'arme' },
  calculer: (e) => {
    const usage = (String(e.usage) as UsageBeton) in USAGES ? (String(e.usage) as UsageBeton) : 'arme';
    return { ...analyseEau({ pH: num(e, 'pH'), chlorures: num(e, 'chlorures'), sulfates: num(e, 'sulfates'), nitrates: num(e, 'nitrates'), turbidite: num(e, 'turbidite') }, usage), usage };
  },
  valeurs: {
    gachage: (r) => (r.gachageOk ? `conforme pour un ${USAGES[r.usage]}` : `non conforme pour un ${USAGES[r.usage]}`),
    potable: (r) => (r.potableOk ? 'conforme aux repères vérifiés' : 'non potable sans traitement'),
  },
  lignes: {
    gachage: (r) => <>gâchage ({USAGES[r.usage]}) : {r.gachage.map(verdict).join(' ; ')}</>,
    potable: (r) => <>boisson : {r.potable.map(verdict).join(' ; ')}</>,
    xa: (r) => (
      <>
        au contact prolongé d’un béton enterré, cette eau serait de classe <strong>{r.xa.classe}</strong> (sulfates : {r.xa.sulfates} ; pH : {r.xa.pH}), EN 206 tableau 2
      </>
    ),
    conclusion: (r) => (
      <>
        {r.gachageOk ? 'utilisable pour le béton' : 'à refuser pour ce béton'} ; {r.potableOk ? 'buvable selon ces critères' : 'à traiter avant de la boire'}
        {r.gachageOk !== r.potableOk ? ' : les deux usages ne demandent pas la même qualité' : ''}
      </>
    ),
  },
  schema: ({ r }) => <AnalyseEauSchema gachage={r.gachage} potable={r.potable} titreGachage={`eau de gâchage d’un ${USAGES[r.usage]} (EN 1008)`} />,
};

export const CALCULS_CHIMIE = {
  stoechiometrie: stoechioDef,
  neutralisationChaux: neutrDef,
  bogueClinker: bogueDef,
  cycleChaux: chauxDef,
  corrosionBarre: corrosionDef,
  carbonatation: carboDef,
  dosageAdjuvant: adjuvantDef,
  analyseEau: eauDef,
} as const;
