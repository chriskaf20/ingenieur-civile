// Fiches de calcul du module L1.6 (dessin technique et lecture de plans).
// Les valeurs viennent de lib/calc/dessin.ts et lib/calc/plans.ts ; ce fichier ne fait que formater et mettre en page.

import { VuesProjetees } from '@/components/drawing/Projections';
import type { DefinitionCalcul, Entrees } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { EssaiFormats, ChoixEchelleBarres } from '@/components/schemas/DessinCours1';
import { MarchesDeuxPerspectives } from '@/components/schemas/DessinCours2';
import { FacadeCotee, NiveauxCoupe, PlancherCoupe } from '@/components/schemas/DessinCours3';
import { DossierFeuilles, FerraillagePoutre, MenuiseriesSchema } from '@/components/schemas/DessinCours4';
import { CoupeLogement, FacadeLogement, niv, PlanLogement } from '@/components/schemas/Logement';
import {
  caniveau,
  choisirFormat,
  controleFacade,
  coteManquante,
  ECHELLES_ISO,
  echelleMaximale,
  EXEMPLE_CANIVEAU,
  EXEMPLE_FACADE,
  EXEMPLE_FORMAT,
  EXEMPLE_MARCHES,
  longueurPapier,
  orientationUsuelle,
  perspectiveMarches,
  zoneUtile,
  type ChoixFormat,
  type DonneesCaniveau,
  type DonneesFormat,
  type DonneesMarches,
} from '@/lib/calc/dessin';
import {
  analyseLogement,
  echellesDossier,
  EXEMPLE_DOSSIER,
  EXEMPLE_MAISON,
  EXEMPLE_MENUISERIES,
  EXEMPLE_NIVEAUX,
  EXEMPLE_PLANCHER,
  EXEMPLE_POUTRE_FER,
  EXEMPLE_STUDIO,
  hauteurSousPlafond,
  maison,
  niveaux,
  nomenclatureMenuiseries,
  nomenclaturePoutre,
  studio,
  type DonneesDossier,
  type DonneesMaison,
  type DonneesNiveaux,
  type DonneesPlancher,
  type DonneesPoutreFer,
  type DonneesStudio,
  type LigneMenuiserie,
} from '@/lib/calc/plans';
import { grandeur, nombre } from '@/lib/format';

const n0 = (x: number) => nombre(x, 0);
const n2 = (x: number) => nombre(x, 2);
const n3 = (x: number) => nombre(x, 3);
const fmt = (n: number) => `A${n} ${orientationUsuelle(n)}`;

const champ = (cle: string, libelle: string, symbole: React.ReactNode, unite: string, min: number, max: number, pas: number, decimales: number) =>
  ({ cle, libelle, symbole, unite, min, max, pas, decimales }) as const;
const choixEchelle = (cle: string, libelle: string, liste: readonly number[]) =>
  ({ type: 'choix', cle, libelle, symbole: '1/E', options: liste.map((e) => ({ valeur: e, libelle: `1/${e}` })) }) as const;

// ---------- Format d'une planche (L1.6.1, L1.6.9) ----------
type ResFormat = { d: DonneesFormat; r?: ChoixFormat };
const formatDef: DefinitionCalcul<ResFormat> = {
  champs: [
    champ('L', 'longueur réelle de l’objet (énoncé)', 'L', 'm', 1, 60, 0.05, 2),
    champ('H', 'hauteur réelle de l’objet (énoncé)', 'H', 'm', 1, 40, 0.05, 2),
    choixEchelle('E', 'échelle du dessin', [20, 50, 100, 200, 500]),
    champ('reserve', 'réserve pour les cotes, de chaque côté', 'r', 'mm', 0, 40, 1, 0),
    champ('cartouche', 'bande réservée au cartouche', <>h<sub>c</sub></>, 'mm', 0, 80, 1, 0),
  ],
  defaut: { ...EXEMPLE_FORMAT },
  calculer: (e) => {
    const d: DonneesFormat = { L: num(e, 'L'), H: num(e, 'H'), E: num(e, 'E'), reserve: num(e, 'reserve'), cartouche: num(e, 'cartouche') };
    try {
      return { d, r: choisirFormat(d) };
    } catch {
      return { d };
    }
  },
  valeurs: {
    dessin: ({ d }) => `${n0(longueurPapier(d.L, d.E))} × ${n0(longueurPapier(d.H, d.E))} mm`,
    encombrement: ({ r }) => (r ? `${n0(r.encombrement.largeur)} × ${n0(r.encombrement.hauteur)} mm` : '—'),
    format: ({ r }) => (r ? fmt(r.n) : 'plus grand que l’A0'),
    marge: ({ r }) => (r ? `${n0(r.marge.largeur)} mm en largeur et ${n0(r.marge.hauteur)} mm en hauteur` : '—'),
  },
  lignes: {
    dessin: ({ d }) => (
      <>
        L / E = {n0(d.L * 1000)} / {d.E} = <strong>{n0(longueurPapier(d.L, d.E))} mm</strong> ; H / E = {n0(d.H * 1000)} / {d.E} = <strong>{n0(longueurPapier(d.H, d.E))} mm</strong>
      </>
    ),
    encombrement: ({ d }) => (
      <>
        avec les cotes : {n0(longueurPapier(d.L, d.E))} + 2 × {d.reserve} = <strong>{n0(longueurPapier(d.L, d.E) + 2 * d.reserve)} mm</strong> ; {n0(longueurPapier(d.H, d.E))} + 2 × {d.reserve} = <strong>{n0(longueurPapier(d.H, d.E) + 2 * d.reserve)} mm</strong>
      </>
    ),
    essais: ({ d, r }) => (
      <span className="grid">
        {(r?.essais ?? [4, 3, 2, 1, 0].map((n) => ({ n, tient: false }))).map(({ n, tient }) => {
          const z = zoneUtile(n);
          return (
            <span key={n} className="block">
              {fmt(n)} : zone utile {n0(z.largeur)} × {n0(z.hauteur)} − {d.cartouche} = {n0(z.hauteur - d.cartouche)} mm → <strong>{tient ? 'le dessin tient' : 'trop petit'}</strong>
            </span>
          );
        })}
      </span>
    ),
  },
  schema: ({ r: x, e }) => (x.r ? <EssaiFormats choix={x.r} cartouche={num(e, 'cartouche')} /> : null),
  alerte: ({ r }) => (r ? undefined : 'Le dessin ne tient pas sur un A0 : choisis une échelle plus petite.'),
};

// ---------- Choix d'une échelle (L1.6.2) ----------
type ResEchelle = { L: number; n: number; reserve: number; dispo: number; E: number; papier: number; plusGrande?: number };
const echelleChoixDef: DefinitionCalcul<ResEchelle> = {
  champs: [
    champ('L', 'longueur réelle à dessiner (énoncé)', 'L', 'm', 1, 200, 0.1, 2),
    { type: 'choix', cle: 'n', libelle: 'format de la feuille', symbole: 'A', options: [4, 3, 2, 1].map((n) => ({ valeur: n, libelle: fmt(n) })) },
    champ('reserve', 'réserve pour les cotes, de chaque côté', 'r', 'mm', 0, 40, 1, 0),
  ],
  defaut: { L: 18.6, n: 3, reserve: 20 },
  calculer: (e) => {
    const L = num(e, 'L');
    const n = num(e, 'n');
    const reserve = num(e, 'reserve');
    const dispo = zoneUtile(n).largeur - 2 * reserve;
    const E = echelleMaximale(L, dispo);
    const i = ECHELLES_ISO.indexOf(E as (typeof ECHELLES_ISO)[number]);
    return { L, n, reserve, dispo, E, papier: longueurPapier(L, E), plusGrande: i > 0 ? ECHELLES_ISO[i - 1] : undefined };
  },
  valeurs: {
    dispo: (r) => grandeur(r.dispo, 0, 'mm'),
    echelle: (r) => `1/${r.E}`,
    papier: (r) => grandeur(r.papier, 0, 'mm'),
  },
  lignes: {
    dispo: (r) => (
      <>
        place disponible : {n0(zoneUtile(r.n).largeur)} − 2 × {r.reserve} = <strong>{n0(r.dispo)} mm</strong>
      </>
    ),
    essai: (r) =>
      r.plusGrande ? (
        <>
          au 1/{r.plusGrande} : {n0(r.L * 1000)} / {r.plusGrande} = {n0(longueurPapier(r.L, r.plusGrande))} mm &gt; {n0(r.dispo)} mm → trop long
        </>
      ) : (
        <>le 1/1 tient déjà : vraie grandeur</>
      ),
    retenue: (r) => (
      <>
        au 1/{r.E} : {n0(r.L * 1000)} / {r.E} = <strong>{n0(r.papier)} mm</strong> ≤ {n0(r.dispo)} mm → échelle retenue <strong>1/{r.E}</strong>
      </>
    ),
  },
  schema: ({ r }) => {
    const i = ECHELLES_ISO.indexOf(r.E as (typeof ECHELLES_ISO)[number]);
    const liste = ECHELLES_ISO.slice(Math.max(0, i - 2), i + 2);
    return <ChoixEchelleBarres L={r.L} dispo={r.dispo} E={r.E} echelles={liste} />;
  },
};

// ---------- Vues d'un caniveau (L1.6.3) ----------
type ResCaniveau = ReturnType<typeof caniveau> & { d: DonneesCaniveau };
const caniveauDef: DefinitionCalcul<ResCaniveau> = {
  champs: [
    champ('W', 'largeur extérieure', 'W', 'm', 0.4, 1.2, 0.05, 2),
    champ('H', 'hauteur extérieure', 'H', 'm', 0.3, 1, 0.05, 2),
    champ('t', 'épaisseur des parois et du radier', 't', 'm', 0.05, 0.15, 0.01, 2),
    champ('L', 'longueur d’un élément', 'L', 'm', 0.5, 2, 0.1, 2),
  ],
  defaut: { ...EXEMPLE_CANIVEAU },
  calculer: (e) => {
    const d: DonneesCaniveau = { W: num(e, 'W'), H: num(e, 'H'), t: num(e, 't'), L: num(e, 'L') };
    return { ...caniveau(d), d };
  },
  valeurs: {
    interieur: (r) => `${n2(r.largeurInterieure)} × ${n2(r.profondeurInterieure)} m`,
    section: (r) => grandeur(r.section, 3, 'm²'),
    volume: (r) => grandeur(r.section * r.d.L, 3, 'm³'),
    cachee: (r) => (r.gauche.filter((l) => !l.visible).map((l) => `z = ${n2(l.position)} m`).join(', ') || 'aucune'),
  },
  lignes: {
    interieur: (r) => (
      <>
        largeur intérieure W − 2t = {n2(r.d.W)} − 2 × {n2(r.d.t)} = <strong>{n2(r.largeurInterieure)} m</strong> ; profondeur intérieure H − t = {n2(r.d.H)} − {n2(r.d.t)} = <strong>{n2(r.profondeurInterieure)} m</strong>
      </>
    ),
    section: (r) => (
      <>
        section de béton W × H − (W − 2t)(H − t) = {n2(r.d.W)} × {n2(r.d.H)} − {n2(r.largeurInterieure)} × {n2(r.profondeurInterieure)} = <strong>{n3(r.section)} m²</strong>
      </>
    ),
    volume: (r) => (
      <>
        béton d’un élément : {n3(r.section)} × {n2(r.d.L)} = <strong>{n3(r.section * r.d.L)} m³</strong>
      </>
    ),
  },
  schema: ({ r }) => (
    <VuesProjetees
      v={r}
      alt={`Les trois vues du caniveau de ${n2(r.d.W)} × ${n2(r.d.H)} m sur ${n2(r.d.L)} m, parois de ${n2(r.d.t)} m : la vue de face montre le U ; la vue de dessus, les deux parois ; la vue de gauche, le fond intérieur en trait interrompu.`}
      echelle={Math.min(220, 260 / Math.max(r.d.W + r.d.L, 1))}
      rappels
      cotes
    />
  ),
};

// ---------- Bloc de marches en perspective (L1.6.4) ----------
type ResMarches = ReturnType<typeof perspectiveMarches> & { d: DonneesMarches };
const marchesDef: DefinitionCalcul<ResMarches> = {
  champs: [
    champ('n', 'nombre de marches', 'n', '', 1, 4, 1, 0),
    champ('g', 'giron d’une marche', 'g', 'm', 0.24, 0.32, 0.01, 2),
    champ('h', 'hauteur d’une marche', 'h', 'm', 0.15, 0.19, 0.005, 3),
    champ('L', 'emmarchement (longueur des marches)', 'L', 'm', 0.6, 1.5, 0.05, 2),
    { type: 'choix', cle: 'alpha', libelle: 'angle des fuyantes', symbole: 'α', options: [30, 45, 60].map((a) => ({ valeur: a, libelle: `${a}°` })) },
    { type: 'choix', cle: 'k', libelle: 'coefficient de réduction', symbole: 'k', options: [0.5, 0.7, 1].map((k) => ({ valeur: k, libelle: nombre(k, 1) })) },
  ],
  defaut: { ...EXEMPLE_MARCHES },
  calculer: (e) => {
    const d: DonneesMarches = { n: num(e, 'n'), g: num(e, 'g'), h: num(e, 'h'), L: num(e, 'L'), alpha: num(e, 'alpha'), k: num(e, 'k') };
    return { ...perspectiveMarches(d), d };
  },
  valeurs: {
    fuyante: (r) => grandeur(r.fuyante, 2, 'm'),
    boite: (r) => `${n2(r.profondeur)} × ${n2(r.hauteur)} × ${n2(r.d.L)} m`,
  },
  lignes: {
    boite: (r) => (
      <>
        boîte englobante : n × g = {r.d.n} × {n2(r.d.g)} = <strong>{n2(r.profondeur)} m</strong> ; n × h = {r.d.n} × {n3(r.d.h)} = <strong>{n2(r.hauteur)} m</strong> ; emmarchement {n2(r.d.L)} m
      </>
    ),
    fuyante: (r) => (
      <>
        cavalière : fuyante dessinée = k × L = {nombre(r.d.k, 1)} × {n2(r.d.L)} = <strong>{n2(r.fuyante)} m</strong>, tracée à {r.d.alpha}°
      </>
    ),
    iso: (r) => (
      <>
        isométrie : on porte les vraies longueurs sur les trois axes : {n2(r.iso.largeur)}, {n2(r.iso.hauteur)} et <strong>{n2(r.iso.fuyante)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <MarchesDeuxPerspectives d={r.d} />,
};

// ---------- Chaîne de cotes d'une façade (L1.6.6) ----------
type ResFacade = ReturnType<typeof controleFacade> & { partielles: number[]; totale: number; manquante: number };
const facadeDef: DefinitionCalcul<ResFacade> = {
  champs: [
    champ('t1', 'trumeau 1', <>t<sub>1</sub></>, 'm', 0.3, 5, 0.05, 2),
    champ('f', 'fenêtre', 'f', 'm', 0.6, 3, 0.05, 2),
    champ('t2', 'trumeau 2', <>t<sub>2</sub></>, 'm', 0.3, 5, 0.05, 2),
    champ('p', 'porte', 'p', 'm', 0.7, 2, 0.05, 2),
    champ('T', 'cote totale hors tout (énoncé)', 'T', 'm', 3, 20, 0.05, 2),
  ],
  defaut: { t1: EXEMPLE_FACADE.partielles[0]!, f: EXEMPLE_FACADE.partielles[1]!, t2: EXEMPLE_FACADE.partielles[2]!, p: EXEMPLE_FACADE.partielles[3]!, T: EXEMPLE_FACADE.totale },
  calculer: (e) => {
    const connues = [num(e, 't1'), num(e, 'f'), num(e, 't2'), num(e, 'p')];
    const totale = num(e, 'T');
    const manquante = coteManquante(connues, totale);
    const partielles = [...connues, manquante];
    return { ...controleFacade({ partielles, noms: EXEMPLE_FACADE.noms, totale }), partielles, totale, manquante };
  },
  valeurs: {
    manquante: (r) => grandeur(r.manquante, 2, 'm'),
    cumulees: (r) => r.cumulees.map(n2).join(' ; '),
  },
  lignes: {
    connues: (r) => (
      <>
        cotes connues : {r.partielles.slice(0, 4).map(n2).join(' + ')} = {n2(r.cumulees[4]!)} m
      </>
    ),
    manquante: (r) => (
      <>
        dernier trumeau = {n2(r.totale)} − {n2(r.cumulees[4]!)} = <strong>{n2(r.manquante)} m</strong>
      </>
    ),
    controle: (r) => (
      <>
        contrôle : {r.partielles.map(n2).join(' + ')} = {n2(r.total)} m = cote totale <strong>{r.ferme ? '✓ la chaîne se ferme' : '✗ écart'}</strong>
      </>
    ),
    cumulees: (r) => (
      <>
        cotes cumulées depuis l’origine : <strong>{r.cumulees.map(n2).join(' ; ')}</strong>
      </>
    ),
  },
  schema: ({ r }) => <FacadeCotee partielles={r.partielles} noms={EXEMPLE_FACADE.noms} totale={r.totale} cumul prefixe="fc-fiche" />,
  alerte: (r) => (r.manquante <= 0 ? 'La somme des cotes connues dépasse déjà la cote totale : une cote est fausse.' : undefined),
};

// ---------- Hauteur sous plafond (L1.6.7) ----------
type ResPlancher = ReturnType<typeof hauteurSousPlafond> & { d: DonneesPlancher };
const plancherDef: DefinitionCalcul<ResPlancher> = {
  champs: [
    champ('hEtage', 'hauteur d’étage, de sol fini à sol fini', <>h<sub>é</sub></>, 'm', 2.5, 4, 0.01, 2),
    champ('dalle', 'épaisseur de la dalle', <>e<sub>d</sub></>, 'm', 0.12, 0.3, 0.01, 2),
    champ('revetement', 'chape et carrelage', <>e<sub>r</sub></>, 'm', 0.02, 0.1, 0.005, 3),
    champ('plafond', 'enduit sous la dalle', <>e<sub>p</sub></>, 'm', 0, 0.03, 0.005, 3),
  ],
  defaut: { ...EXEMPLE_PLANCHER },
  calculer: (e) => {
    const d: DonneesPlancher = { hEtage: num(e, 'hEtage'), dalle: num(e, 'dalle'), revetement: num(e, 'revetement'), plafond: num(e, 'plafond') };
    return { ...hauteurSousPlafond(d), d };
  },
  valeurs: {
    plancher: (r) => grandeur(r.plancher, 3, 'm'),
    hsp: (r) => grandeur(r.hsp, 3, 'm'),
  },
  lignes: {
    plancher: (r) => (
      <>
        épaisseur du plancher fini : {n2(r.d.dalle)} + {n3(r.d.revetement)} + {n3(r.d.plafond)} = <strong>{n3(r.plancher)} m</strong>
      </>
    ),
    hsp: (r) => (
      <>
        HSP = {n2(r.d.hEtage)} − {n3(r.plancher)} = <strong>{n3(r.hsp)} m</strong>
      </>
    ),
  },
  schema: ({ r }) => <PlancherCoupe d={r.d} />,
};

// ---------- Niveaux et altitudes (L1.6.8) ----------
type ResNiveaux = ReturnType<typeof niveaux> & { d: DonneesNiveaux };
const niveauxDef: DefinitionCalcul<ResNiveaux> = {
  champs: [
    champ('altitudeZero', 'altitude du ±0,00 (géomètre)', <>Z<sub>0</sub></>, 'm', 0, 2000, 0.01, 2),
    champ('tn', 'terrain naturel devant l’entrée, niveau relatif', 'TN', 'm', -1.5, 0, 0.01, 2),
    champ('etage', 'sol fini de l’étage', <>N<sub>é</sub></>, 'm', 2.5, 4, 0.01, 2),
    champ('revetement', 'épaisseur des revêtements de sol', <>e<sub>r</sub></>, 'm', 0.02, 0.1, 0.01, 2),
    champ('rampe', 'longueur horizontale de la rampe', <>L<sub>r</sub></>, 'm', 1, 15, 0.1, 2),
  ],
  defaut: { ...EXEMPLE_NIVEAUX },
  calculer: (e) => {
    const d: DonneesNiveaux = { altitudeZero: num(e, 'altitudeZero'), tn: num(e, 'tn'), etage: num(e, 'etage'), revetement: num(e, 'revetement'), rampe: num(e, 'rampe') };
    return { ...niveaux(d), d };
  },
  valeurs: {
    altTN: (r) => grandeur(r.altTN, 2, 'm'),
    altEtage: (r) => grandeur(r.altEtage, 2, 'm'),
    brutEtage: (r) => niv(r.brutEtage),
    pente: (r) => `${nombre(r.pente, 2)} %`,
  },
  lignes: {
    altitudes: (r) => (
      <>
        TN : {n2(r.d.altitudeZero)} + ({niv(r.d.tn)}) = <strong>{n2(r.altTN)} m</strong> ; étage : {n2(r.d.altitudeZero)} + {n2(r.d.etage)} = <strong>{n2(r.altEtage)} m</strong>
      </>
    ),
    brut: (r) => (
      <>
        dalle brute de l’étage : {n2(r.d.etage)} − {n2(r.d.revetement)} = <strong>{niv(r.brutEtage)}</strong> ; au rez-de-chaussée : <strong>{niv(r.brutRdc)}</strong>
      </>
    ),
    pente: (r) => (
      <>
        rampe : p = {n2(r.denivele)} / {n2(r.d.rampe)} × 100 = <strong>{nombre(r.pente, 2)} %</strong>, soit {nombre(r.angle, 2)}°
      </>
    ),
  },
  schema: ({ r }) => <NiveauxCoupe d={r.d} />,
};

// ---------- Échelles du dossier (L1.6.9) ----------
type ResDossier = ReturnType<typeof echellesDossier> & { d: DonneesDossier };
const dossierDef: DefinitionCalcul<ResDossier> = {
  champs: [
    champ('pL', 'longueur de la parcelle', <>P<sub>L</sub></>, 'm', 10, 100, 0.5, 2),
    champ('pl', 'largeur de la parcelle', <>P<sub>l</sub></>, 'm', 10, 80, 0.5, 2),
    champ('bL', 'longueur du bâtiment', <>B<sub>L</sub></>, 'm', 5, 40, 0.1, 2),
    champ('bl', 'largeur du bâtiment', <>B<sub>l</sub></>, 'm', 4, 30, 0.1, 2),
    { type: 'choix', cle: 'n', libelle: 'format des planches', symbole: 'A', options: [4, 3, 2, 1].map((n) => ({ valeur: n, libelle: fmt(n) })) },
  ],
  defaut: { pL: EXEMPLE_DOSSIER.parcelle.L, pl: EXEMPLE_DOSSIER.parcelle.l, bL: EXEMPLE_DOSSIER.batiment.L, bl: EXEMPLE_DOSSIER.batiment.l, n: EXEMPLE_DOSSIER.n },
  calculer: (e) => {
    const d: DonneesDossier = { parcelle: { L: num(e, 'pL'), l: num(e, 'pl') }, batiment: { L: num(e, 'bL'), l: num(e, 'bl') }, n: num(e, 'n'), reserve: EXEMPLE_DOSSIER.reserve, cartouche: EXEMPLE_DOSSIER.cartouche };
    return { ...echellesDossier(d), d };
  },
  valeurs: {
    masse: (r) => `1/${r.masse}`,
    niveau: (r) => `1/${r.niveau}`,
    dispo: (r) => `${n0(r.dispo.largeur)} × ${n0(r.dispo.hauteur)} mm`,
  },
  lignes: {
    dispo: (r) => (
      <>
        place utile : {n0(r.zone.largeur)} − 2 × {r.d.reserve} = {n0(r.dispo.largeur)} mm ; {n0(r.zone.hauteur)} − {r.d.cartouche} − 2 × {r.d.reserve} = <strong>{n0(r.dispo.hauteur)} mm</strong>
      </>
    ),
    masse: (r) => (
      <>
        plan de masse au 1/{r.masse} : {n0(longueurPapier(r.d.parcelle.L, r.masse))} × {n0(longueurPapier(r.d.parcelle.l, r.masse))} mm → <strong>1/{r.masse}</strong>
      </>
    ),
    niveau: (r) => (
      <>
        plans de niveaux au 1/{r.niveau} : {n0(longueurPapier(r.d.batiment.L, r.niveau))} × {n0(longueurPapier(r.d.batiment.l, r.niveau))} mm → <strong>1/{r.niveau}</strong>
      </>
    ),
  },
  schema: ({ r }) => <DossierFeuilles d={r.d} masse={r.masse} niveau={r.niveau} />,
};

// ---------- Surfaces d'une maison (L1.6.10) ----------
const versMaison = (e: Entrees): DonneesMaison => ({ ...EXEMPLE_MAISON, L: num(e, 'L'), l: num(e, 'l'), sejour: num(e, 'sejour'), chambre: num(e, 'chambre') });
type ResMaison = ReturnType<typeof analyseLogement> & { d: DonneesMaison };
const maisonDef: DefinitionCalcul<ResMaison> = {
  champs: [
    champ('L', 'longueur intérieure, entre murs extérieurs', 'L', 'm', 7.5, 10, 0.05, 2),
    champ('l', 'largeur intérieure', 'l', 'm', 5, 7, 0.05, 2),
    champ('sejour', 'largeur du séjour', <>L<sub>s</sub></>, 'm', 3.5, 5, 0.05, 2),
    champ('chambre', 'profondeur de la chambre', <>l<sub>c</sub></>, 'm', 2.8, 3.4, 0.05, 2),
  ],
  defaut: { L: EXEMPLE_MAISON.L, l: EXEMPLE_MAISON.l, sejour: EXEMPLE_MAISON.sejour, chambre: EXEMPLE_MAISON.chambre },
  calculer: (e) => {
    const d = versMaison(e);
    return { ...analyseLogement(maison(d)), d };
  },
  valeurs: {
    sejour: (r) => grandeur(r.pieces[0]!.surface, 2, 'm²'),
    chambre: (r) => grandeur(r.pieces[1]!.surface, 2, 'm²'),
    sdb: (r) => grandeur(r.pieces[2]!.surface, 2, 'm²'),
    total: (r) => grandeur(r.surfaceTotale, 2, 'm²'),
    emprise: (r) => grandeur(r.emprise, 2, 'm²'),
  },
  lignes: {
    sejour: (r) => (
      <>
        séjour : {n2(r.d.sejour)} × {n2(r.d.l)} = <strong>{n2(r.pieces[0]!.surface)} m²</strong>
      </>
    ),
    chambre: (r) => (
      <>
        chambre : ({n2(r.d.L)} − {n2(r.d.sejour)} − {n2(r.d.cloison)}) × {n2(r.d.chambre)} = {n2(r.d.L - r.d.sejour - r.d.cloison)} × {n2(r.d.chambre)} = <strong>{n2(r.pieces[1]!.surface)} m²</strong>
      </>
    ),
    sdb: (r) => (
      <>
        salle d’eau : {n2(r.d.L - r.d.sejour - r.d.cloison)} × ({n2(r.d.l)} − {n2(r.d.chambre)} − {n2(r.d.cloison)}) = {n2(r.d.L - r.d.sejour - r.d.cloison)} × {n2(r.d.l - r.d.chambre - r.d.cloison)} = <strong>{n2(r.pieces[2]!.surface)} m²</strong>
      </>
    ),
    total: (r) => (
      <>
        total : {r.pieces.map((p) => n2(p.surface)).join(' + ')} = <strong>{n2(r.surfaceTotale)} m²</strong> ; emprise hors tout {n2(r.exterieur.L)} × {n2(r.exterieur.l)} = {n2(r.emprise)} m²
      </>
    ),
  },
  schema: ({ r }) => <PlanLogement lg={maison(r.d)} prefixe="pl-fiche" />,
};

// ---------- Nomenclature d'une poutre (L1.6.11) ----------
const versPoutre = (e: Entrees): DonneesPoutreFer => ({
  ...EXEMPLE_POUTRE_FER,
  L: num(e, 'L'),
  b: num(e, 'b'),
  h: num(e, 'h'),
  nInf: num(e, 'nInf'),
  phiInf: num(e, 'phiInf'),
  nSup: num(e, 'nSup'),
  phiSup: num(e, 'phiSup'),
  phiT: num(e, 'phiT'),
  e: num(e, 'e'),
});
type ResPoutre = ReturnType<typeof nomenclaturePoutre> & { d: DonneesPoutreFer };
const ha = (cle: string, libelle: string, liste: number[]) => ({ type: 'choix', cle, libelle, symbole: 'φ', options: liste.map((p) => ({ valeur: p, libelle: `HA ${p}` })) }) as const;
const poutreDef: DefinitionCalcul<ResPoutre> = {
  champs: [
    champ('L', 'longueur de la poutre', 'L', 'm', 1, 8, 0.05, 2),
    champ('b', 'largeur', 'b', 'm', 0.15, 0.4, 0.01, 2),
    champ('h', 'hauteur', 'h', 'm', 0.2, 0.7, 0.01, 2),
    champ('nInf', 'nombre de barres inférieures', <>n<sub>1</sub></>, '', 2, 5, 1, 0),
    ha('phiInf', 'diamètre des barres inférieures', [10, 12, 14, 16, 20]),
    champ('nSup', 'nombre de barres supérieures', <>n<sub>2</sub></>, '', 2, 4, 1, 0),
    ha('phiSup', 'diamètre des barres supérieures', [8, 10, 12]),
    ha('phiT', 'diamètre des cadres', [6, 8]),
    champ('e', 'espacement des cadres', 'e', 'm', 0.1, 0.3, 0.01, 2),
  ],
  defaut: { L: EXEMPLE_POUTRE_FER.L, b: EXEMPLE_POUTRE_FER.b, h: EXEMPLE_POUTRE_FER.h, nInf: EXEMPLE_POUTRE_FER.nInf, phiInf: EXEMPLE_POUTRE_FER.phiInf, nSup: EXEMPLE_POUTRE_FER.nSup, phiSup: EXEMPLE_POUTRE_FER.phiSup, phiT: EXEMPLE_POUTRE_FER.phiT, e: EXEMPLE_POUTRE_FER.e },
  calculer: (e) => {
    const d = versPoutre(e);
    return { ...nomenclaturePoutre(d), d };
  },
  valeurs: {
    masse: (r) => grandeur(r.masse, 1, 'kg'),
    cadres: (r) => `${r.nCadres} cadres`,
    filante: (r) => grandeur(r.filante, 2, 'm'),
  },
  lignes: {
    filante: (r) => (
      <>
        barres filantes : L − 2c = {n2(r.d.L)} − 2 × {n2(r.d.c)} = <strong>{n2(r.filante)} m</strong>
      </>
    ),
    cadres: (r) => (
      <>
        cadres : ⌊({n2(r.d.L)} − 2 × {n2(r.d.premier)}) / {n2(r.d.e)}⌋ + 1 = <strong>{r.nCadres}</strong> ; longueur développée 2 × ({n2(r.d.b - 2 * r.d.c)} + {n2(r.d.h - 2 * r.d.c)}) + 2 × {n2(r.d.crochet)} = <strong>{n2(r.cadre)} m</strong>
      </>
    ),
    masses: (r) => (
      <span className="grid">
        {r.lignes.map((l) => (
          <span key={l.repere} className="block">
            repère {l.repere} : {l.nombre} HA {l.phi} × {n2(l.longueur)} m = {n2(l.longueurTotale)} m → <strong>{nombre(l.masse, 2)} kg</strong>
          </span>
        ))}
      </span>
    ),
    total: (r) => (
      <>
        masse totale : {r.lignes.map((l) => nombre(l.masse, 2)).join(' + ')} = <strong>{nombre(r.masse, 1)} kg</strong>
      </>
    ),
  },
  schema: ({ r }) => <FerraillagePoutre d={r.d} prefixe="fp-fiche" />,
};

// ---------- Nomenclature des menuiseries (L1.6.12) ----------
const versMenuiseries = (e: Entrees): LigneMenuiserie[] =>
  EXEMPLE_MENUISERIES.map((m) => ({ ...m, nombre: num(e, `n${m.repere}`), largeur: num(e, `l${m.repere}`), hauteur: num(e, `h${m.repere}`) }));
type ResMenuiseries = ReturnType<typeof nomenclatureMenuiseries>;
const menuiseriesDef: DefinitionCalcul<ResMenuiseries> = {
  champs: EXEMPLE_MENUISERIES.flatMap((m) => [
    champ(`n${m.repere}`, `${m.repere} : nombre`, <>n<sub>{m.repere}</sub></>, '', 0, 12, 1, 0),
    champ(`l${m.repere}`, `${m.repere} : largeur`, <>l<sub>{m.repere}</sub></>, 'm', 0.4, 3, 0.05, 2),
    champ(`h${m.repere}`, `${m.repere} : hauteur`, <>h<sub>{m.repere}</sub></>, 'm', 0.4, 2.5, 0.05, 2),
  ]),
  defaut: Object.fromEntries(EXEMPLE_MENUISERIES.flatMap((m) => [[`n${m.repere}`, m.nombre], [`l${m.repere}`, m.largeur], [`h${m.repere}`, m.hauteur]])),
  calculer: (e) => nomenclatureMenuiseries(versMenuiseries(e)),
  valeurs: {
    total: (r) => grandeur(r.total, 2, 'm²'),
    nombre: (r) => `${r.nombre} baies`,
  },
  lignes: {
    lignes: (r) => (
      <span className="grid">
        {r.lignes.map((m) => (
          <span key={m.repere} className="block">
            {m.repere} : {m.nombre} × {n2(m.largeur)} × {n2(m.hauteur)} = <strong>{n2(m.surface)} m²</strong>
          </span>
        ))}
      </span>
    ),
    total: (r) => (
      <>
        total : {r.lignes.map((m) => n2(m.surface)).join(' + ')} = <strong>{n2(r.total)} m²</strong> pour {r.nombre} baies
      </>
    ),
  },
  schema: ({ r }) => <MenuiseriesSchema lignes={r.lignes} />,
};

// ---------- Studio du mini-projet (L1.6.P) ----------
const versStudio = (e: Entrees): DonneesStudio => ({ ...EXEMPLE_STUDIO, L: num(e, 'L'), l: num(e, 'l'), a: num(e, 'a'), s: num(e, 's'), hsp: num(e, 'hsp'), dalle: num(e, 'dalle'), acrotere: num(e, 'acrotere'), tn: num(e, 'tn') });
type ResStudio = ReturnType<typeof analyseLogement> & { d: DonneesStudio; format?: ChoixFormat };
const studioDef: DefinitionCalcul<ResStudio> = {
  champs: [
    champ('L', 'longueur intérieure', 'L', 'm', 4.5, 7, 0.05, 2),
    champ('l', 'largeur intérieure', 'l', 'm', 3.5, 5, 0.05, 2),
    champ('a', 'largeur de la salle d’eau', 'a', 'm', 1.2, 2, 0.05, 2),
    champ('s', 'profondeur de la salle d’eau', 's', 'm', 1.5, 2, 0.05, 2),
    champ('hsp', 'hauteur sous plafond', 'HSP', 'm', 2.5, 3, 0.05, 2),
    champ('dalle', 'épaisseur de la dalle', <>e<sub>d</sub></>, 'm', 0.12, 0.2, 0.01, 2),
    champ('acrotere', 'hauteur de l’acrotère', <>h<sub>a</sub></>, 'm', 0.2, 0.8, 0.05, 2),
    champ('tn', 'terrain naturel, niveau relatif', 'TN', 'm', -0.6, -0.1, 0.05, 2),
  ],
  defaut: { L: EXEMPLE_STUDIO.L, l: EXEMPLE_STUDIO.l, a: EXEMPLE_STUDIO.a, s: EXEMPLE_STUDIO.s, hsp: EXEMPLE_STUDIO.hsp, dalle: EXEMPLE_STUDIO.dalle, acrotere: EXEMPLE_STUDIO.acrotere, tn: EXEMPLE_STUDIO.tn },
  calculer: (e) => {
    const d = versStudio(e);
    const a = analyseLogement(studio(d));
    let format: ChoixFormat | undefined;
    try {
      format = choisirFormat({ L: a.exterieur.L, H: a.exterieur.l, E: 50, reserve: 30, cartouche: 40 });
    } catch {
      format = undefined;
    }
    return { ...a, d, format };
  },
  valeurs: {
    exterieur: (r) => `${n2(r.exterieur.L)} × ${n2(r.exterieur.l)} m`,
    principale: (r) => grandeur(r.pieces[0]!.surface, 2, 'm²'),
    sdb: (r) => grandeur(r.pieces[1]!.surface, 2, 'm²'),
    total: (r) => grandeur(r.surfaceTotale, 2, 'm²'),
    acrotere: (r) => niv(r.niveaux.acrotere),
    format: (r) => (r.format ? fmt(r.format.n) : '—'),
  },
  lignes: {
    exterieur: (r) => (
      <>
        hors tout : {n2(r.d.L)} + 2 × {n2(r.d.mur)} = <strong>{n2(r.exterieur.L)} m</strong> ; {n2(r.d.l)} + 2 × {n2(r.d.mur)} = <strong>{n2(r.exterieur.l)} m</strong>
      </>
    ),
    surfaces: (r) => (
      <>
        salle d’eau : {n2(r.d.a)} × {n2(r.d.s)} = <strong>{n2(r.pieces[1]!.surface)} m²</strong> ; pièce principale : {n2(r.d.L)} × {n2(r.d.l)} − ({n2(r.d.a)} + {n2(r.d.cloison)}) × ({n2(r.d.s)} + {n2(r.d.cloison)}) = <strong>{n2(r.pieces[0]!.surface)} m²</strong>
      </>
    ),
    facade: (r) => (
      <>
        façade sud : {r.facades.sud.partielles.map(n2).join(' + ')} = <strong>{n2(r.facades.sud.total)} m</strong> = longueur hors tout
      </>
    ),
    niveaux: (r) => (
      <>
        dessus de dalle : {n2(r.d.hsp)} + {n2(r.d.dalle)} = <strong>{niv(r.niveaux.dessusDalle)}</strong> ; acrotère : {n2(r.niveaux.dessusDalle)} + {n2(r.d.acrotere)} = <strong>{niv(r.niveaux.acrotere)}</strong> ; hauteur hors sol {n2(r.hauteurHorsSol)} m
      </>
    ),
    format: (r) =>
      r.format ? (
        <>
          plan au 1/50 : {n0(longueurPapier(r.exterieur.L, 50))} × {n0(longueurPapier(r.exterieur.l, 50))} mm, avec 30 mm de cotes de chaque côté et le cartouche → <strong>{fmt(r.format.n)}</strong>
        </>
      ) : (
        <>le plan au 1/50 ne tient sur aucun format</>
      ),
  },
  schemas: {
    plan: ({ r }) => <PlanLogement lg={studio(r.d)} prefixe="st-plan" />,
    facade: ({ r }) => <FacadeLogement lg={studio(r.d)} prefixe="st-fac" />,
    coupe: ({ r }) => <CoupeLogement lg={studio(r.d)} prefixe="st-cou" />,
  },
};

export const CALCULS_DESSIN = {
  formatPlan: formatDef,
  echelleChoix: echelleChoixDef,
  vuesCaniveau: caniveauDef,
  perspectiveMarches: marchesDef,
  chaineFacade: facadeDef,
  plancherHSP: plancherDef,
  niveauxBatiment: niveauxDef,
  dossierEchelles: dossierDef,
  surfacesMaison: maisonDef,
  ferraillagePoutre: poutreDef,
  menuiseries: menuiseriesDef,
  studioProjet: studioDef,
} as const;
