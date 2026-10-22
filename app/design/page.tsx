import { SectionFerraillee } from '@/components/drawing/Armatures';
import { Cote } from '@/components/drawing/Cote';
import { CoupeFondation, Escalier2D, hauteurCoupeFondation, hauteurEscalier2D } from '@/components/drawing/Elements';
import { Figure } from '@/components/drawing/Figure';
import { CercleMohr, CourbeGranulo, Diagramme } from '@/components/drawing/Graphes';
import { LegendeHachures, TYPES_HACHURES } from '@/components/drawing/Hachures';
import { AppuiDouble, AppuiSimple, ChargePonctuelle, ChargeRepartie, Encastrement } from '@/components/drawing/Mecanique';
import { Hachures } from '@/components/drawing/Hachures';
import { Axe, Niveau, NiveauPlan, Nord, RepereCoupe } from '@/components/drawing/Reperes';
import { TerrainNaturel } from '@/components/drawing/Terrain';
import { escalierDroit, EXEMPLE_ESCALIER } from '@/lib/calc/escalier';
import { poutreUniforme } from '@/lib/calc/rdm';

export const metadata = { title: 'Design system' };

const COULEURS = [
  ['encre', 'Bleu encre : texte d’accent, valeurs calculées'],
  ['correction', 'Rouge correction : étapes, erreurs, charges'],
  ['validation', 'Vert validation : résultats, bonnes réponses'],
  ['beton', 'Gris béton : texte secondaire'],
  ['brique', 'Brique : maçonnerie'],
  ['terre', 'Terre : sols, terrain'],
  ['acier', 'Acier : charpente, armatures'],
] as const;

function Carte({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-black/10 bg-papier p-4">
      <h3 className="mb-2 font-technique text-lg font-bold text-encre">{titre}</h3>
      {children}
    </section>
  );
}

export default function Design() {
  const esc = escalierDroit(EXEMPLE_ESCALIER);
  const p = poutreUniforme(10, 6);
  const m = Array.from({ length: 31 }, (_, i) => [(6 * i) / 30, p.moment((6 * i) / 30)] as const);
  const v = Array.from({ length: 31 }, (_, i) => [(6 * i) / 30, p.effortTranchant((6 * i) / 30)] as const);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-technique text-3xl font-bold text-encre">Design system</h1>
      <p className="mt-1 text-beton">Tokens, polices, gabarits et primitives SVG paramétriques (components/drawing/).</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Carte titre="Palette">
          <ul className="grid gap-1.5">
            {COULEURS.map(([nom, sens]) => (
              <li key={nom} className="flex items-center gap-3">
                <span className="h-7 w-12 rounded border border-black/10" style={{ background: `var(--color-${nom})` }} />
                <span className="font-technique font-semibold">{nom}</span>
                <span className="text-[0.92rem] text-beton">{sens}</span>
              </li>
            ))}
          </ul>
        </Carte>
        <Carte titre="Polices">
          <p className="font-technique text-xl font-semibold">Barlow Condensed : planches et infographies</p>
          <p className="mt-1 text-lg">Source Sans 3 : texte du cours, lisible à l’écran et à l’impression.</p>
          <p className="mt-1 font-manuscrite text-xl text-encre">Kalam : annotations du cahier, V = 478,11 m³</p>
        </Carte>
        <Carte titre="Hachures normalisées (usuelles)">
          <LegendeHachures types={TYPES_HACHURES} prefixe="ds" />
        </Carte>
        <Carte titre="Cotes, axes, niveaux, repères">
          <Figure alt="Exemples de cote, d'axe avec repère de file, de niveaux, de repère de coupe et de nord" largeur={420} hauteur={220}>
            <Hachures prefixe="ds-t" types={['terre']} />
            <Cote x1={30} y1={60} x2={260} y2={60} decalage={18} texte="4,50" />
            <Cote x1={300} y1={150} x2={300} y2={40} decalage={-16} texte="2,80" extremite="fleche" />
            <Axe x1={60} y1={100} x2={260} y2={100} repere="A" />
            <Niveau x={40} y={150} texte="±0,00" />
            <NiveauPlan x={140} y={150} texte="+0,15" />
            <RepereCoupe x1={60} y1={196} x2={240} y2={196} nom="1" sens={-1} />
            <Nord x={370} y={60} />
            <TerrainNaturel prefixe="ds-t" pts={[[320, 190], [410, 175]]} />
          </Figure>
        </Carte>
        <Carte titre="Charges et appuis">
          <Figure alt="Poutre sur appui double et appui simple, sous charge répartie et charge ponctuelle, et console encastrée" largeur={420} hauteur={170}>
            <Hachures prefixe="ds-a" types={['terre', 'ba']} />
            <line x1={40} y1={80} x2={280} y2={80} className="t-fort" />
            <ChargeRepartie x1={40} x2={280} y={80} texte="q = 10 kN/m" />
            <ChargePonctuelle x={200} y={80} texte="F" longueur={50} />
            <AppuiDouble x={40} y={80} prefixe="ds-a" />
            <AppuiSimple x={280} y={80} />
            <Encastrement x={330} y={120} cote="gauche" prefixe="ds-a" />
            <line x1={330} y1={120} x2={410} y2={120} className="t-fort" />
            <ChargePonctuelle x={410} y={120} longueur={36} />
          </Figure>
        </Carte>
        <Carte titre="Diagrammes M et V">
          <Figure alt="Moment fléchissant et effort tranchant d'une poutre sur deux appuis de 6 m sous 10 kN/m" largeur={600} hauteur={260}>
            <Hachures prefixe="ds-d" types={['terre']} />
            <Diagramme L={6} valeurs={m} unite="kN·m" nom="M" y={40} prefixe="ds-d" />
            <Diagramme L={6} valeurs={v} unite="kN" nom="V" y={190} amplitude={40} positifEnHaut appuis={false} />
          </Figure>
        </Carte>
        <Carte titre="Section ferraillée">
          <Figure alt="Section de poteau 30 × 30 cm avec 8 HA 12 et cadres HA 6" largeur={330} hauteur={300}>
            <SectionFerraillee b={0.3} h={0.3} enrobage={25} phiL={12} phiT={6} n={8} echelle={700} x={60} y={36} prefixe="ds-s" />
          </Figure>
        </Carte>
        <Carte titre="Coupe de fondation">
          <Figure alt="Coupe d'une semelle isolée de 1,20 m sous poteau de 30 cm" largeur={460} hauteur={hauteurCoupeFondation(1.2, 1)}>
            <CoupeFondation B={1.2} hs={0.3} a={0.3} D={1} prefixe="ds-f" />
          </Figure>
        </Carte>
        <Carte titre="Escalier (profil paramétrique)">
          <Figure alt="Profil d'un escalier droit à deux volées" largeur={620} hauteur={hauteurEscalier2D(EXEMPLE_ESCALIER, esc)}>
            <Escalier2D d={EXEMPLE_ESCALIER} r={esc} prefixe="ds-e" />
          </Figure>
        </Carte>
        <Carte titre="Cercle de Mohr">
          <Figure alt="Cercle de Mohr pour σx = 80 MPa, σy = 20 MPa, τxy = 40 MPa" largeur={480} hauteur={480}>
            <CercleMohr sx={80} sy={20} txy={40} />
          </Figure>
        </Carte>
        <Carte titre="Courbe granulométrique">
          <Figure alt="Courbe granulométrique d'un sable" largeur={620} hauteur={330}>
            <CourbeGranulo mesures={[[0.063, 2], [0.125, 6], [0.25, 18], [0.5, 42], [1, 66], [2, 84], [4, 97], [8, 100]]} />
          </Figure>
        </Carte>
      </div>
    </div>
  );
}
