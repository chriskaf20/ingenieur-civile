// Fiches de calcul du module N0.1 (méthode de travail). Les valeurs viennent de lib/calc/methode.ts.

import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { Hachures, hachure } from '@/components/drawing/Hachures';
import type { DefinitionCalcul, Entrees } from '@/components/gabarits/typesCalcul';
import { num } from '@/components/gabarits/typesCalcul';
import {
  budgetSemaine,
  courbeOubli,
  EXEMPLE_BUDGET,
  EXEMPLE_DALLE,
  EXEMPLE_LINTEAU,
  HEURES_SEMAINE,
  INTERVALLES_REVISION,
  planRevisions,
  poidsElement,
  POIDS_VOLUMIQUE_BA,
  POIDS_VOLUMIQUE_BETON,
  semaineDuJour,
  unChiffre,
  volumeDalle,
  type DonneesBudget,
  type DonneesDalle,
  type DonneesPoids,
  type PlanRevisions,
  type ResultatBudget,
  type ResultatDalle,
  type ResultatPoids,
} from '@/lib/calc/methode';
import { points } from '@/lib/drawing/repere';
import { grandeur, nombre } from '@/lib/format';

const n2 = (x: number) => nombre(x, 2);
const liste = (xs: readonly number[]) => (xs.length ? xs.map((x) => nombre(x, 0)).join(', ') : 'aucune');

// ---------- Révisions espacées (N0.1.1) ----------
type ResRevisions = PlanRevisions & { jourCours: number; jourExamen: number };

/** Frise du semestre : cours, révisions (avant / après l'examen) et examen. */
function FriseRevisions({ r }: { r: ResRevisions }) {
  const fin = Math.max(r.jourExamen, ...r.jours) + 3;
  const x0 = 30;
  const lg = 560;
  const sx = (j: number) => x0 + (j / fin) * lg;
  const y = 70;
  const semaines = Array.from({ length: Math.floor(fin / 7) + 1 }, (_, i) => i * 7);
  return (
    <Figure
      alt={`Frise : cours le jour ${r.jourCours}, révisions les jours ${liste(r.jours)}, examen le jour ${r.jourExamen}`}
      largeur={620}
      hauteur={128}
    >
      <line x1={x0} y1={y} x2={x0 + lg} y2={y} className="t-moyen" />
      {semaines.map((s) => (
        <g key={s}>
          <line x1={sx(s)} y1={y - 4} x2={sx(s)} y2={y + 4} className="t-fin" />
          {s > 0 ? (
            <Etiquette x={sx(s - 3.5)} y={y + 30} ancre="middle" taille={10} classe="etiquette">
              S{semaineDuJour(s)}
            </Etiquette>
          ) : null}
        </g>
      ))}
      <circle cx={sx(r.jourCours)} cy={y} r={7} fill="var(--color-encre)" />
      <Etiquette x={sx(r.jourCours)} y={y - 14} ancre="middle" taille={11.5} gras classe="encre">
        cours (j {r.jourCours})
      </Etiquette>
      {r.jours.map((j, i) => {
        const utile = j < r.jourExamen;
        return (
          <g key={j}>
            <circle
              cx={sx(j)}
              cy={y}
              r={5}
              fill={utile ? 'var(--color-validation)' : 'var(--halo)'}
              stroke={utile ? 'var(--color-validation)' : 'var(--trait-doux)'}
              strokeDasharray={utile ? undefined : '2 2'}
            />
            <Etiquette x={sx(j)} y={y + (i % 2 ? -14 : 18)} ancre="middle" taille={10.5}>
              J+{INTERVALLES_REVISION[i] ?? '?'}
            </Etiquette>
          </g>
        );
      })}
      <rect x={sx(r.jourExamen) - 6} y={y - 6} width={12} height={12} fill="var(--color-correction)" />
      <Etiquette x={sx(r.jourExamen)} y={y - 30} ancre="middle" taille={11.5} gras>
        examen (j {r.jourExamen})
      </Etiquette>
      <Etiquette x={x0} y={118} taille={10.5} classe="etiquette">
        ● révision avant l’examen   ○ révision après l’examen   S = semaine
      </Etiquette>
    </Figure>
  );
}

/** Courbes de principe (modèle-jouet) : sans révision et avec révisions espacées. */
export function CourbesOubli({ revisions = INTERVALLES_REVISION as readonly number[], tMax = 30 }: { revisions?: readonly number[]; tMax?: number }) {
  const x0 = 50;
  const lg = 540;
  const y0 = 170;
  const ht = 130;
  const sx = (t: number) => x0 + (t / tMax) * lg;
  const sy = (R: number) => y0 - R * ht;
  const sans = courbeOubli([], tMax).map(([t, R]) => [sx(t), sy(R)] as const);
  const avec = courbeOubli(revisions, tMax).map(([t, R]) => [sx(t), sy(R)] as const);
  return (
    <Figure
      alt="Courbes de principe de l'oubli : sans révision, le souvenir s'effondre en quelques jours ; avec des révisions à J+1, J+3, J+7, J+14 et J+30, il remonte à chaque fois et baisse de moins en moins vite."
      largeur={620}
      hauteur={215}
    >
      <line x1={x0} y1={y0} x2={x0 + lg} y2={y0} className="t-moyen" />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - ht - 12} className="t-moyen" />
      <Etiquette x={x0 - 6} y={y0 - ht + 4} ancre="end" taille={10.5}>
        tout
      </Etiquette>
      <Etiquette x={x0 - 6} y={y0 + 4} ancre="end" taille={10.5}>
        rien
      </Etiquette>
      <Etiquette x={x0 - 34} y={y0 - ht / 2} ancre="middle" taille={11} rotation={-90}>
        ce qu’on retient
      </Etiquette>
      {[0, 7, 14, 21, 28].map((t) => (
        <Etiquette key={t} x={sx(t)} y={y0 + 16} ancre="middle" taille={10.5}>
          {t === 0 ? 'cours' : `J+${t}`}
        </Etiquette>
      ))}
      <polyline points={points(sans)} fill="none" stroke="var(--color-correction)" strokeWidth={2} strokeDasharray="6 3" />
      <polyline points={points(avec)} fill="none" stroke="var(--color-validation)" strokeWidth={2.2} />
      {revisions
        .filter((t) => t <= tMax)
        .map((t) => (
          <line key={t} x1={sx(t)} y1={y0} x2={sx(t)} y2={sy(1)} className="t-fin" strokeDasharray="2 3" />
        ))}
      <Etiquette x={sx(4)} y={y0 - 12} taille={11.5} gras>
        sans révision
      </Etiquette>
      <Etiquette x={sx(15)} y={sy(1) - 4} taille={11.5} gras>
        avec révisions espacées
      </Etiquette>
      <Etiquette x={x0} y={208} taille={10} classe="etiquette">
        Courbes de principe (modèle simplifié) : l’allure compte, pas les valeurs.
      </Etiquette>
    </Figure>
  );
}

const revisions: DefinitionCalcul<ResRevisions> = {
  champs: [
    { cle: 'jourCours', libelle: 'jour du cours dans le semestre', symbole: 'j₀', unite: 'jour', min: 1, max: 100, pas: 1, decimales: 0 },
    { cle: 'jourExamen', libelle: 'jour de l’examen', symbole: 'jₑ', unite: 'jour', min: 2, max: 140, pas: 1, decimales: 0 },
  ],
  defaut: { jourCours: 10, jourExamen: 35 },
  calculer: (e) => {
    const jourCours = num(e, 'jourCours');
    const jourExamen = num(e, 'jourExamen');
    return { ...planRevisions(jourCours, jourExamen), jourCours, jourExamen };
  },
  valeurs: {
    jours: (r) => liste(r.jours),
    avant: (r) => `${r.avant.length} révision${r.avant.length > 1 ? 's' : ''} sur ${r.jours.length}`,
    delai: (r) => grandeur(r.delai, 0, 'jours'),
    apres: (r) => liste(r.apres),
  },
  lignes: {
    jours: (r) => (
      <>
        {r.jours.map((j, i) => (
          <span key={j}>
            {i ? ' ; ' : ''}
            {r.jourCours} + {INTERVALLES_REVISION[i]} = <strong>{j}</strong>
          </span>
        ))}
      </>
    ),
    tri: (r) => (
      <>
        avant le jour {r.jourExamen} : <strong>{liste(r.avant)}</strong> · après : {liste(r.apres)}
      </>
    ),
  },
  schema: ({ r }) => <FriseRevisions r={r} />,
  alerte: (r) => (r.delai <= 0 ? 'L’examen doit avoir lieu après le cours : corrige les jours.' : undefined),
};

// ---------- Poids d'un linteau (N0.1.3) ----------
type ResPoids = ResultatPoids & { d: DonneesPoids };
const versPoids = (e: Entrees): DonneesPoids => ({ L: num(e, 'L'), b: num(e, 'b'), h: num(e, 'h'), gamma: num(e, 'gamma') });

function SchemaLinteau({ d }: { d: DonneesPoids }) {
  const k = Math.min(150, 380 / d.L, 110 / d.h);
  const L = d.L * k;
  const h = d.h * k;
  const b = d.b * k;
  const x0 = 40;
  const y0 = 40;
  const xs = x0 + L + 70;
  return (
    <Figure alt={`Linteau en béton armé de ${n2(d.L)} m de long, section ${n2(d.b)} × ${n2(d.h)} m, en élévation et en coupe`} largeur={620} hauteur={y0 + h + 70}>
      <Hachures prefixe="lin" types={['ba']} />
      <Etiquette x={x0} y={22} taille={12} gras classe="titre-vue">
        ÉLÉVATION
      </Etiquette>
      <rect x={x0} y={y0} width={L} height={h} fill="var(--fond-beton)" className="t-fort" />
      <Cote x1={x0} y1={y0 + h} x2={x0 + L} y2={y0 + h} decalage={-22} texte={`L = ${n2(d.L)} m`} />
      <Cote x1={x0} y1={y0} x2={x0} y2={y0 + h} decalage={-16} texte={`h = ${n2(d.h)}`} />
      <Etiquette x={xs} y={22} taille={12} gras classe="titre-vue">
        COUPE
      </Etiquette>
      <rect x={xs} y={y0} width={b} height={h} fill={hachure('lin', 'ba')} className="t-fort" />
      <Cote x1={xs} y1={y0 + h} x2={xs + b} y2={y0 + h} decalage={-22} texte={`b = ${n2(d.b)}`} />
      <Cote x1={xs + b} y1={y0 + h} x2={xs + b} y2={y0} decalage={-16} texte={`h = ${n2(d.h)}`} />
      <Etiquette x={xs + b + 40} y={y0 + h / 2 + 4} taille={11.5}>
        γ = {nombre(d.gamma, 0)} kN/m³
      </Etiquette>
    </Figure>
  );
}

const poids: DefinitionCalcul<ResPoids> = {
  champs: [
    { cle: 'L', libelle: 'longueur', symbole: 'L', unite: 'm', min: 0.5, max: 8, pas: 0.05, decimales: 2 },
    { cle: 'b', libelle: 'largeur', symbole: 'b', unite: 'm', min: 0.1, max: 0.6, pas: 0.01, decimales: 2 },
    { cle: 'h', libelle: 'hauteur', symbole: 'h', unite: 'm', min: 0.1, max: 1, pas: 0.01, decimales: 2 },
    {
      type: 'choix',
      cle: 'gamma',
      libelle: 'poids volumique (EN 1991-1-1, tab. A.1)',
      symbole: 'γ',
      options: [
        { valeur: POIDS_VOLUMIQUE_BA, libelle: `béton armé : ${POIDS_VOLUMIQUE_BA} kN/m³` },
        { valeur: POIDS_VOLUMIQUE_BETON, libelle: `béton non armé : ${POIDS_VOLUMIQUE_BETON} kN/m³` },
      ],
    },
  ],
  defaut: { ...EXEMPLE_LINTEAU },
  calculer: (e) => {
    const d = versPoids(e);
    return { ...poidsElement(d), d };
  },
  valeurs: {
    poids: (r) => grandeur(r.poids, 2, 'kN'),
    lineique: (r) => grandeur(r.chargeLineique, 2, 'kN/m'),
    masse: (r) => grandeur(r.masse, 0, 'kg'),
    volume: (r) => grandeur(r.volume, 3, 'm³'),
  },
  lignes: {
    volume: (r) => (
      <>
        V = L × b × h = {n2(r.d.L)} m × {n2(r.d.b)} m × {n2(r.d.h)} m = <strong>{nombre(r.volume, 3)} m³</strong>
      </>
    ),
    poids: (r) => (
      <>
        P = V × γ = {nombre(r.volume, 3)} m³ × {nombre(r.d.gamma, 0)} kN/m³ = <strong>{n2(r.poids)} kN</strong>
      </>
    ),
    lineique: (r) => (
      <>
        g = b × h × γ = {n2(r.d.b)} m × {n2(r.d.h)} m × {nombre(r.d.gamma, 0)} kN/m³ = <strong>{n2(r.chargeLineique)} kN/m</strong>
      </>
    ),
    masse: (r) => (
      <>
        m = P ÷ g = {nombre(r.poids * 1000, 0)} N ÷ 9,81 m/s² ≈ <strong>{nombre(r.masse, 0)} kg</strong>
      </>
    ),
    estimation: (r) => (
      <>
        {nombre(unChiffre(r.d.L), 2)} × {nombre(unChiffre(r.d.b), 2)} × {nombre(unChiffre(r.d.h), 2)} × {nombre(r.d.gamma, 0)} ≈ {nombre(r.estimation, 1)} kN, écart{' '}
        {nombre(Math.abs(r.ecartEstimation) * 100, 0)} % → {Math.abs(r.ecartEstimation) <= 0.5 ? 'même ordre de grandeur ✓' : 'à revoir ✗'}
      </>
    ),
  },
  schema: ({ r }) => <SchemaLinteau d={r.d} />,
};

// ---------- Volume d'une dalle (N0.1.4) ----------
type ResDalle = ResultatDalle & { d: DonneesDalle };
const versDalle = (e: Entrees): DonneesDalle => ({ L: num(e, 'L'), l: num(e, 'l'), e: num(e, 'e'), pas: num(e, 'pas') });

function PlanDalle({ d }: { d: DonneesDalle }) {
  const k = Math.min(400 / d.L, 170 / d.l);
  const L = d.L * k;
  const l = d.l * k;
  const x0 = 70;
  const y0 = 30;
  return (
    <Figure alt={`Plan d'une dalle de ${n2(d.L)} m sur ${n2(d.l)} m, épaisseur ${nombre(d.e, 0)} cm`} largeur={620} hauteur={y0 + l + 50}>
      <Hachures prefixe="dal" types={['ba']} />
      <rect x={x0} y={y0} width={L} height={l} fill={hachure('dal', 'ba')} className="t-fort" />
      <Cote x1={x0} y1={y0 + l} x2={x0 + L} y2={y0 + l} decalage={-22} texte={`L = ${n2(d.L)} m`} />
      <Cote x1={x0} y1={y0} x2={x0} y2={y0 + l} decalage={-22} texte={`l = ${n2(d.l)} m`} />
      <Etiquette x={x0 + L + 16} y={y0 + l / 2} taille={12} gras classe="encre">
        e = {nombre(d.e, 0)} cm
      </Etiquette>
      <Etiquette x={x0 + L + 16} y={y0 + l / 2 + 16} taille={11} classe="etiquette">
        (épaisseur)
      </Etiquette>
    </Figure>
  );
}

const dalle: DefinitionCalcul<ResDalle> = {
  champs: [
    { cle: 'L', libelle: 'longueur', symbole: 'L', unite: 'm', min: 1, max: 12, pas: 0.05, decimales: 2 },
    { cle: 'l', libelle: 'largeur', symbole: 'l', unite: 'm', min: 1, max: 12, pas: 0.05, decimales: 2 },
    { cle: 'e', libelle: 'épaisseur', symbole: 'e', unite: 'cm', min: 8, max: 30, pas: 1, decimales: 0 },
    {
      type: 'choix',
      cle: 'pas',
      libelle: 'livraison par multiples de',
      symbole: 'p',
      options: [0.25, 0.5, 1].map((p) => ({ valeur: p, libelle: grandeur(p, 2, 'm³') })),
    },
  ],
  defaut: { ...EXEMPLE_DALLE },
  calculer: (e) => {
    const d = versDalle(e);
    return { ...volumeDalle(d), d };
  },
  valeurs: {
    volume: (r) => grandeur(r.volumeAffiche, 2, 'm³'),
    commande: (r) => grandeur(r.volumeCommande, 2, 'm³'),
    surface: (r) => grandeur(r.surface, 2, 'm²'),
    trop: (r) => grandeur(r.volumeArrondiTrop, 2, 'm³'),
    manque: (r) => grandeur(r.volume - r.volumeArrondiTrop, 3, 'm³'),
  },
  lignes: {
    surface: (r) => (
      <>
        S = L × l = {n2(r.d.L)} m × {n2(r.d.l)} m = <strong>{nombre(r.surface, 2)} m²</strong>
      </>
    ),
    epaisseur: (r) => (
      <>
        e = {nombre(r.d.e, 0)} cm = {nombre(r.d.e, 0)} ÷ 100 m = <strong>{n2(r.epaisseur)} m</strong>
      </>
    ),
    volume: (r) => (
      <>
        V = S × e = {nombre(r.surface, 2)} m² × {n2(r.epaisseur)} m = {nombre(r.volume, 3)} m³ ≈ <strong>{n2(r.volumeAffiche)} m³</strong>
      </>
    ),
    commande: (r) => (
      <>
        {nombre(r.volume, 3)} m³ ÷ {n2(r.d.pas)} m³ = {n2(r.volume / r.d.pas)} → arrondi au-dessus : {nombre(r.volumeCommande / r.d.pas, 0)} × {n2(r.d.pas)} ={' '}
        <strong>{n2(r.volumeCommande)} m³</strong>
      </>
    ),
    trop: (r) => (
      <>
        S ≈ {nombre(r.surface, 0)} m² puis {nombre(r.surface, 0)} × {n2(r.epaisseur)} = {n2(r.volumeArrondiTrop)} m³ : il manque {nombre(r.volume - r.volumeArrondiTrop, 3)} m³ ✗
      </>
    ),
  },
  schema: ({ r }) => <PlanDalle d={r.d} />,
};

// ---------- Budget-temps (N0.1.5) ----------
type ResBudget = ResultatBudget & { d: DonneesBudget };
const COULEURS_BUDGET: Record<string, string> = {
  cours: 'var(--color-encre)',
  perso: 'var(--color-validation)',
  sommeil: 'var(--color-acier)',
  vie: 'var(--color-terre)',
  transport: 'var(--color-brique)',
  libre: 'var(--color-beton-clair)',
};

/** Barre de 168 h découpée en postes. */
export function BarreSemaine({ r }: { r: ResultatBudget }) {
  const x0 = 20;
  const lg = 580;
  const total = Math.max(HEURES_SEMAINE, r.engage);
  let x = x0;
  return (
    <Figure alt={`Semaine de ${HEURES_SEMAINE} heures : ${r.parts.map((p) => `${p.libelle} ${nombre(p.heures, 1)} h`).join(', ')}`} largeur={620} hauteur={136}>
      {r.parts.map((p, i) => {
        const w = (p.heures / total) * lg;
        const xi = x;
        x += w;
        if (w <= 0) return null;
        return (
          <g key={p.cle}>
            <rect x={xi} y={34} width={w} height={34} fill={COULEURS_BUDGET[p.cle]} stroke="var(--halo)" strokeWidth={1} />
            {w > 30 ? (
              <Etiquette x={xi + w / 2} y={i % 2 ? 90 : 26} ancre="middle" taille={11}>
                {p.libelle} {nombre(p.heures, 1)} h
              </Etiquette>
            ) : null}
          </g>
        );
      })}
      <Cote x1={x0} y1={68} x2={x0 + (HEURES_SEMAINE / total) * lg} y2={68} decalage={-50} texte={`une semaine = 7 × 24 = ${HEURES_SEMAINE} h`} />
    </Figure>
  );
}

const versBudget = (e: Entrees): DonneesBudget => ({
  cours: num(e, 'cours'),
  ratio: num(e, 'ratio'),
  sommeil: num(e, 'sommeil'),
  vie: num(e, 'vie'),
  transport: num(e, 'transport'),
  joursTransport: num(e, 'joursTransport'),
});

const budget: DefinitionCalcul<ResBudget> = {
  champs: [
    { cle: 'cours', libelle: 'cours par semaine', symbole: 'C', unite: 'h', min: 10, max: 40, pas: 1, decimales: 0 },
    { cle: 'ratio', libelle: 'travail perso par heure de cours', symbole: 'k', unite: 'h/h', min: 0, max: 3, pas: 0.25, decimales: 2 },
    { cle: 'sommeil', libelle: 'sommeil par nuit', symbole: 's', unite: 'h', min: 5, max: 10, pas: 0.5, decimales: 1 },
    { cle: 'vie', libelle: 'repas, hygiène, tâches par jour', symbole: 'v', unite: 'h', min: 0.5, max: 5, pas: 0.5, decimales: 1 },
    { cle: 'transport', libelle: 'transport par jour', symbole: 't', unite: 'h', min: 0, max: 5, pas: 0.25, decimales: 2 },
    { cle: 'joursTransport', libelle: 'jours de transport par semaine', symbole: 'n', unite: 'j', min: 0, max: 7, pas: 1, decimales: 0 },
  ],
  defaut: { ...EXEMPLE_BUDGET },
  calculer: (e) => {
    const d = versBudget(e);
    return { ...budgetSemaine(d), d };
  },
  valeurs: {
    libre: (r) => grandeur(r.libre, 1, 'h'),
    perso: (r) => grandeur(r.perso, 1, 'h'),
    engage: (r) => grandeur(r.engage, 1, 'h'),
    libreJour: (r) => grandeur(r.libre / 7, 1, 'h'),
  },
  lignes: {
    postes: (r) => (
      <>
        perso = {nombre(r.d.cours, 0)} × {n2(r.d.ratio)} = {nombre(r.perso, 1)} h ; sommeil = 7 × {nombre(r.d.sommeil, 1)} = {nombre(r.sommeil, 1)} h ; vie = 7 ×{' '}
        {nombre(r.d.vie, 1)} = {nombre(r.vie, 1)} h ; transport = {n2(r.d.transport)} × {r.d.joursTransport} = {nombre(r.transport, 1)} h
      </>
    ),
    total: (r) => (
      <>
        engagé = {nombre(r.d.cours, 0)} + {nombre(r.perso, 1)} + {nombre(r.sommeil, 1)} + {nombre(r.vie, 1)} + {nombre(r.transport, 1)} = <strong>{nombre(r.engage, 1)} h</strong>
      </>
    ),
    libre: (r) => (
      <>
        libre = {HEURES_SEMAINE} − {nombre(r.engage, 1)} = <strong>{nombre(r.libre, 1)} h</strong>, soit {nombre(r.libre / 7, 1)} h par jour
      </>
    ),
  },
  schema: ({ r }) => <BarreSemaine r={r} />,
  alerte: (r) => (r.libre < 0 ? `Ta semaine dépasse ${HEURES_SEMAINE} h de ${nombre(-r.libre, 1)} h : ce planning est impossible, il faut réduire un poste.` : undefined),
};

export const CALCULS_METHODE = { revisions, poids, dalle, budget } as const;
