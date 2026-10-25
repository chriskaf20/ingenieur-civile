// Fiches de calcul du module L1.1 (introduction au génie civil). Les valeurs viennent de lib/calc/projet.ts.

import type { DefinitionCalcul } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import { DescenteSchema, GanttPlanning } from '@/components/schemas/Introduction';
import { GAMMA_G, GAMMA_Q } from '@/lib/calc/charges';
import { POIDS_VOLUMIQUE_BA } from '@/lib/calc/methode';
import { DEBUT_TRAVAUX, descenteSimple, EXEMPLE_DESCENTE, EXEMPLE_PLANNING, planning, type DonneesDescente, type ResultatDescente, type ResultatPlanning } from '@/lib/calc/projet';
import { grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);

// ---------- Planning des phases (L1.1.4) ----------

const cle = (i: number) => `d${i}`;

const planningDef: DefinitionCalcul<ResultatPlanning> = {
  champs: EXEMPLE_PLANNING.map((p, i) => ({ cle: cle(i), libelle: `${p.nom.toLowerCase()} (énoncé)`, symbole: `${i + 1}`, unite: 'sem.', min: 0, max: 60, pas: 1, decimales: 0 })),
  defaut: Object.fromEntries(EXEMPLE_PLANNING.map((p, i) => [cle(i), p.duree])),
  calculer: (e) => planning(EXEMPLE_PLANNING.map((p, i) => ({ nom: p.nom, duree: num(e, cle(i)) }))),
  valeurs: {
    total: (r) => grandeur(r.total, 0, 'semaines'),
    debutTravaux: (r) => `semaine ${nombre(r.debutTravaux, 0)}`,
    travaux: (r) => grandeur(r.travaux, 0, 'semaines'),
  },
  lignes: {
    avant: (r) => (
      <>
        avant le chantier : {r.lignes.slice(0, DEBUT_TRAVAUX).map((l) => nombre(l.duree, 0)).join(' + ')} = <strong>{nombre(r.debutTravaux, 0)} semaines</strong>
      </>
    ),
    travaux: (r) => (
      <>
        chantier, de la préparation à la réception : {r.lignes.slice(DEBUT_TRAVAUX).map((l) => nombre(l.duree, 0)).join(' + ')} = <strong>{nombre(r.travaux, 0)} semaines</strong>
      </>
    ),
    total: (r) => (
      <>
        durée totale : {nombre(r.debutTravaux, 0)} + {nombre(r.travaux, 0)} = <strong>{nombre(r.total, 0)} semaines</strong>
      </>
    ),
  },
  schema: ({ r }) => <GanttPlanning r={r} />,
};

// ---------- Descente de charges simplifiée (L1.1.6) ----------
type ResDescente = ResultatDescente & { d: DonneesDescente };

const champ = (c: string, libelle: string, symbole: string, unite: string, min: number, max: number, pas: number, decimales: number) => ({ cle: c, libelle, symbole, unite, min, max, pas, decimales }) as const;

const descenteDef: DefinitionCalcul<ResDescente> = {
  champs: [
    champ('lx', 'portée dans un sens', 'lx', 'm', 2, 10, 0.1, 2),
    champ('ly', 'portée dans l’autre sens', 'ly', 'm', 2, 10, 0.1, 2),
    champ('niveaux', 'planchers portés, toiture comprise', 'n', '—', 1, 6, 1, 0),
    champ('g', 'charge permanente par plancher (énoncé)', 'g', 'kN/m²', 1, 12, 0.1, 1),
    champ('q', 'charge d’exploitation par plancher (énoncé)', 'q', 'kN/m²', 0, 10, 0.1, 1),
    champ('a', 'côté du poteau', 'a', 'm', 0.15, 0.6, 0.01, 2),
    champ('h', 'hauteur d’un niveau', 'h', 'm', 2.5, 5, 0.05, 2),
    champ('B', 'côté de la semelle', 'B', 'm', 0.5, 3, 0.05, 2),
  ],
  defaut: { ...EXEMPLE_DESCENTE },
  calculer: (e) => {
    const d = { lx: num(e, 'lx'), ly: num(e, 'ly'), niveaux: Math.round(num(e, 'niveaux')), g: num(e, 'g'), q: num(e, 'q'), a: num(e, 'a'), h: num(e, 'h'), B: num(e, 'B') };
    return { ...descenteSimple(d), d };
  },
  valeurs: {
    A: (r) => grandeur(r.A, 2, 'm²'),
    G: (r) => grandeur(r.G, 2, 'kN'),
    Q: (r) => grandeur(r.Q, 2, 'kN'),
    Nser: (r) => grandeur(r.Nser, 2, 'kN'),
    Nelu: (r) => grandeur(r.Nelu, 2, 'kN'),
    sigma: (r) => grandeur(r.sigma, 2, 'kPa'),
  },
  lignes: {
    aire: (r) => (
      <>
        surface d’influence du poteau : A = lx × ly = {n2(r.d.lx)} × {n2(r.d.ly)} = <strong>{n2(r.A)} m²</strong>
      </>
    ),
    plancher: (r) => (
      <>
        par plancher : G = g × A = {nombre(r.d.g, 1)} × {n2(r.A)} = {n2(r.Gp)} kN ; Q = q × A = {nombre(r.d.q, 1)} × {n2(r.A)} = {n2(r.Qp)} kN
      </>
    ),
    poteau: (r) => (
      <>
        poids du poteau sur un niveau : {nombre(POIDS_VOLUMIQUE_BA, 0)} × {n2(r.d.a)}² × {n2(r.d.h)} = {n2(r.PPniveau)} kN
      </>
    ),
    totaux: (r) => (
      <>
        en pied, sur {nombre(r.d.niveaux, 0)} niveau{r.d.niveaux > 1 ? 'x' : ''} : G = {nombre(r.d.niveaux, 0)} × ({n2(r.Gp)} + {n2(r.PPniveau)}) = <strong>{n2(r.G)} kN</strong> ; Q = {nombre(r.d.niveaux, 0)} × {n2(r.Qp)} ={' '}
        <strong>{n2(r.Q)} kN</strong>
      </>
    ),
    elu: (r) => (
      <>
        service : N = G + Q = <strong>{n2(r.Nser)} kN</strong> ; ELU : {nombre(GAMMA_G, 2)} G + {nombre(GAMMA_Q, 1)} Q = <strong>{n2(r.Nelu)} kN</strong>
      </>
    ),
    sol: (r) => (
      <>
        sous la semelle : σ = N / B² = {n2(r.Nser)} / {n2(r.d.B)}² = <strong>{n2(r.sigma)} kPa</strong> (poids de la semelle négligé)
      </>
    ),
  },
  schema: ({ r }) => <DescenteSchema d={r.d} r={r} />,
};

export const CALCULS_PROJET = {
  planning: planningDef,
  descenteCharges: descenteDef,
} as const;
