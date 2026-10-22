import { BarreCoupe, Cadre } from '@/components/drawing/Armatures';
import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure, Renvoi } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { Axe, Niveau, RepereCoupe } from '@/components/drawing/Reperes';
import { TerrainNaturel } from '@/components/drawing/Terrain';
import { FERRAILLAGE_PRINCIPE_MUR as FER, type DonneesMurCloture, type ResultatMurCloture } from '@/lib/calc/murCloture';
import { creerRepere, points, type Repere } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

type Props = { d: DonneesMurCloture; r: ResultatMurCloture; largeur?: number };

const cm = (m: number) => nombre(m * 100, 0);
const niv = (z: number) => (Math.abs(z) < 1e-9 ? '±0,00' : `${z > 0 ? '+' : '−'}${nombre(Math.abs(z), 2)}`);

/** Partie représentée des vues partielles : deux travées et l'amorce de la troisième. */
function finPartielle(d: DonneesMurCloture, r: ResultatMurCloture): number {
  return Math.min(d.L, 2 * r.espacement + d.a + 0.55 * r.panneau);
}

function rectM(rep: Repere, x0: number, y0: number, x1: number, y1: number) {
  return { x: rep.x(Math.min(x0, x1)), y: rep.y(Math.max(y0, y1)), width: rep.lx(Math.abs(x1 - x0)), height: rep.ly(Math.abs(y1 - y0)) };
}

/** Trait d'interruption (zigzag) pour une vue partielle. */
function Interruption({ x, y0, y1 }: { x: number; y0: number; y1: number }) {
  const m = (y0 + y1) / 2;
  return <polyline points={`${x},${y0} ${x},${m - 8} ${x - 6},${m - 3} ${x + 6},${m + 3} ${x},${m + 8} ${x},${y1}`} className="t-fin" />;
}

export function MurPlan({ d, r, largeur = 640 }: Props) {
  const xFin = finPartielle(d, r);
  const e = d.epaisseurBlocElevation;
  const rep = creerRepere({ xmin: -0.75, xmax: xFin + 0.35, ymin: -0.95, ymax: 0.9 }, largeur, 14);
  const axes = [0, 1, 2].map((i) => i * r.espacement + d.a / 2).filter((x) => x < xFin);
  const x11 = d.a + r.panneau / 2;
  const x22 = r.espacement + d.a / 2;
  return (
    <Figure alt="Vue en plan partielle du mur de clôture : maçonnerie entre poteaux raidisseurs, semelle filante en tirets, repères des coupes 1-1 et 2-2" largeur={rep.largeur} hauteur={rep.hauteur} largeurMin={560}>
      <Hachures prefixe="mp" types={['ba', 'maconnerie']} />
      <rect {...rectM(rep, 0, -d.B / 2, xFin, d.B / 2)} className="t-cache" />
      <rect {...rectM(rep, 0, -e / 2, xFin, e / 2)} fill={hachure('mp', 'maconnerie')} className="t-fort" />
      {axes.map((x, i) => (
        <rect key={i} {...rectM(rep, x - d.a / 2, -d.a / 2, x + d.a / 2, d.a / 2)} fill={hachure('mp', 'ba')} className="t-fort" />
      ))}
      <Interruption x={rep.x(xFin)} y0={rep.y(0.35)} y1={rep.y(-0.35)} />
      <Axe x1={rep.x(-0.35)} y1={rep.y(0)} x2={rep.x(xFin + 0.2)} y2={rep.y(0)} repere="A" />
      {axes.map((x, i) => (
        <Axe key={i} x1={rep.x(x)} y1={rep.y(0.5)} x2={rep.x(x)} y2={rep.y(-0.62)} repere={String(i + 1)} />
      ))}
      <RepereCoupe x1={rep.x(x11)} y1={rep.y(0.34)} x2={rep.x(x11)} y2={rep.y(-0.34)} nom="1" />
      <RepereCoupe x1={rep.x(x22)} y1={rep.y(0.34)} x2={rep.x(x22)} y2={rep.y(-0.34)} nom="2" />
      {axes.slice(0, 2).map((x, i) => (
        <Cote key={i} x1={rep.x(x)} y1={rep.y(-0.62)} x2={rep.x(x + r.espacement)} y2={rep.y(-0.62)} decalage={-10} texte={nombre(r.espacement, 3)} />
      ))}
      <Cote x1={rep.x(d.a)} y1={rep.y(0.2)} x2={rep.x(d.a + r.panneau)} y2={rep.y(0.2)} decalage={6} texte={nombre(r.panneau, 3)} />
      
    </Figure>
  );
}

export function MurElevation({ d, r, largeur = 640 }: Props) {
  const xFin = finPartielle(d, r);
  const rep = creerRepere({ xmin: -0.75, xmax: xFin + 0.35, ymin: r.zFondFouille - 0.12, ymax: d.H + 0.28 }, largeur, 14);
  const poteaux = [0, 1, 2].map((i) => i * r.espacement).filter((x) => x < xFin);
  const rangs: number[] = [];
  for (let z = r.zDessusChainageBas + d.moduleHauteur; z < r.zDessousChainageHaut - 1e-6; z += d.moduleHauteur) rangs.push(z);
  const joints: Array<[number, number, number]> = [];
  for (let k = 0; k < Math.round(r.rangsElevation); k++) {
    const z0 = r.zDessusChainageBas + k * d.moduleHauteur;
    for (let x = (k % 2 ? d.moduleLongueur / 2 : 0) + d.a; x < xFin; x += d.moduleLongueur) joints.push([x, z0, z0 + d.moduleHauteur]);
  }
  return (
    <Figure alt="Élévation partielle du mur de clôture : poteaux raidisseurs, chaînages haut et bas, rangs de blocs à joints croisés, fondation enterrée en tirets" largeur={rep.largeur} hauteur={rep.hauteur} largeurMin={560}>
      <Hachures prefixe="me" types={['terre']} />
      <rect {...rectM(rep, 0, 0, xFin, r.zDessusChainageBas)} fill="var(--fond-beton)" className="t-moyen" />
      <rect {...rectM(rep, 0, r.zDessusChainageBas, xFin, r.zDessousChainageHaut)} fill="var(--fond-macon)" className="t-moyen" />
      {rangs.map((z) => (
        <line key={z} x1={rep.x(0)} y1={rep.y(z)} x2={rep.x(xFin)} y2={rep.y(z)} className="t-fin" />
      ))}
      {joints.map(([x, z0, z1], i) => (
        <line key={i} x1={rep.x(x)} y1={rep.y(z0)} x2={rep.x(x)} y2={rep.y(z1)} className="t-fin" />
      ))}
      <rect {...rectM(rep, 0, r.zDessousChainageHaut, xFin, d.H)} fill="var(--fond-ba)" className="t-moyen" />
      {poteaux.map((x) => (
        <rect key={x} {...rectM(rep, x, 0, x + d.a, d.H)} fill="var(--fond-ba)" className="t-fort" />
      ))}
      <rect {...rectM(rep, 0, r.zFondFouille, xFin, r.zFondFouille + d.ePropre + d.hSemelle)} className="t-cache" />
      <rect {...rectM(rep, 0, r.zDessusSemelle, xFin, 0)} className="t-cache" />
      <Interruption x={rep.x(xFin)} y0={rep.y(d.H + 0.08)} y1={rep.y(r.zFondFouille - 0.05)} />
      <TerrainNaturel prefixe="me" pts={[[rep.x(-0.75), rep.y(0)], [rep.x(xFin + 0.35), rep.y(0)]]} />
      <Niveau x={rep.x(-0.62)} y={rep.y(0)} texte="±0,00" />
      <Niveau x={rep.x(-0.62)} y={rep.y(d.H)} texte={niv(d.H)} />
      <Niveau x={rep.x(-0.62)} y={rep.y(r.zFondFouille)} texte={niv(r.zFondFouille)} />
      <Cote x1={rep.x(xFin + 0.2)} y1={rep.y(0)} x2={rep.x(xFin + 0.2)} y2={rep.y(d.H)} decalage={0} texte={`H = ${nombre(d.H, 2)}`} />
      <Renvoi de={[rep.x(r.espacement + d.a + 0.15 * r.panneau), rep.y(d.H) - 16]} vers={[rep.x(r.espacement + d.a + 0.3 * r.panneau), rep.y(d.H - d.hChainageHaut / 2)]} texte="chaînage haut" />
      <Renvoi de={[rep.x(d.a + 0.45 * r.panneau), rep.y(0.7)]} vers={[rep.x(d.a + 0.6 * r.panneau), rep.y((r.zDessusSoubassement + r.zDessusChainageBas) / 2)]} texte="chaînage bas" />
    </Figure>
  );
}

function Coupe({ d, r, largeur = 330, poteau }: Props & { poteau: boolean }) {
  const rep = creerRepere({ xmin: -1.2, xmax: 0.78, ymin: r.zFondFouille - 0.16, ymax: d.H + 0.16 }, largeur, 12);
  const R = (u0: number, z0: number, u1: number, z1: number) => rectM(rep, u0, z0, u1, z1);
  const pre = poteau ? 'c2' : 'c1';
  const ep = d.epaisseurBlocElevation;
  const es = d.epaisseurBlocSoubassement;
  const mm = (v: number) => rep.lx(v / 1000);
  const cnom = 0.03; // enrobage de dessin (m), illustratif
  const barresRect = (u0: number, z0: number, u1: number, z1: number, phi: number) =>
    [
      [u0 + cnom, z0 + cnom],
      [u1 - cnom, z0 + cnom],
      [u1 - cnom, z1 - cnom],
      [u0 + cnom, z1 - cnom],
    ].map(([u, z], i) => <BarreCoupe key={i} cx={rep.x(u!)} cy={rep.y(z!)} r={mm(phi) / 2 + 0.6} />);
  const tnG = [[rep.x(-1.2), rep.y(0)], [rep.x(-d.B / 2 - 0.05), rep.y(0)]] as const;
  const tnD = [[rep.x(d.B / 2 + 0.05), rep.y(0)], [rep.x(0.78), rep.y(0)]] as const;
  return (
    <>
      <Hachures prefixe={pre} types={['ba', 'beton', 'maconnerie', 'terre', 'remblai']} />
      <rect {...R(-d.B / 2 - 0.05, r.zFondFouille, d.B / 2 + 0.05, 0)} fill={hachure(pre, 'remblai')} />
      <rect {...R(-1.2, r.zFondFouille - 0.16, -d.B / 2 - 0.05, 0)} fill={hachure(pre, 'terre')} />
      <rect {...R(d.B / 2 + 0.05, r.zFondFouille - 0.16, 0.78, 0)} fill={hachure(pre, 'terre')} />
      <rect {...R(-d.B / 2 - 0.05, r.zFondFouille - 0.16, d.B / 2 + 0.05, r.zFondFouille)} fill={hachure(pre, 'terre')} />
      <rect {...R(-d.B / 2, r.zFondFouille, d.B / 2, r.zFondFouille + d.ePropre)} fill={hachure(pre, 'beton')} className="t-moyen" />
      <rect {...R(-d.B / 2, r.zFondFouille + d.ePropre, d.B / 2, r.zDessusSemelle)} fill={hachure(pre, 'ba')} className="t-fort" />
      {[-0.17, 0, 0.17].map((u) => (
        <BarreCoupe key={u} cx={rep.x(u)} cy={rep.y(r.zFondFouille + d.ePropre + 0.05)} r={mm(10) / 2 + 0.6} />
      ))}
      <line x1={rep.x(-d.B / 2 + 0.04)} y1={rep.y(r.zFondFouille + d.ePropre + 0.04)} x2={rep.x(d.B / 2 - 0.04)} y2={rep.y(r.zFondFouille + d.ePropre + 0.04)} className="t-armature" strokeWidth={1.2} />
      {poteau ? (
        <>
          <rect {...R(-d.a / 2, r.zDessusSemelle, d.a / 2, d.H)} fill={hachure(pre, 'ba')} className="t-fort" />
          {[-d.a / 2 + cnom, d.a / 2 - cnom].map((u) => (
            <polyline
              key={u}
              points={points([
                [rep.x(u + Math.sign(u) * 0.14), rep.y(r.zFondFouille + d.ePropre + 0.07)],
                [rep.x(u), rep.y(r.zFondFouille + d.ePropre + 0.07)],
                [rep.x(u), rep.y(d.H - cnom)],
              ])}
              className="t-armature"
            />
          ))}
          {Array.from({ length: Math.floor((d.H - cnom - r.zDessusSemelle - 0.05) / 0.15) + 1 }, (_, i) => r.zDessusSemelle + 0.05 + i * 0.15).map((z) => (
            <line key={z} x1={rep.x(-d.a / 2 + cnom - 0.008)} y1={rep.y(z)} x2={rep.x(d.a / 2 - cnom + 0.008)} y2={rep.y(z)} className="t-armature" strokeWidth={0.9} />
          ))}
        </>
      ) : (
        <>
          <rect {...R(-es / 2, r.zDessusSemelle, es / 2, r.zDessusSoubassement)} fill={hachure(pre, 'maconnerie')} className="t-fort" />
          <rect {...R(-d.bChainageBas / 2, r.zDessusSoubassement, d.bChainageBas / 2, r.zDessusChainageBas)} fill={hachure(pre, 'ba')} className="t-fort" />
          {barresRect(-d.bChainageBas / 2, r.zDessusSoubassement, d.bChainageBas / 2, r.zDessusChainageBas, 10)}
          <rect {...R(-ep / 2, r.zDessusChainageBas, ep / 2, r.zDessousChainageHaut)} fill={hachure(pre, 'maconnerie')} className="t-fort" />
          <rect {...R(-d.bChainageHaut / 2, r.zDessousChainageHaut, d.bChainageHaut / 2, d.H)} fill={hachure(pre, 'ba')} className="t-fort" />
          {barresRect(-d.bChainageHaut / 2, r.zDessousChainageHaut, d.bChainageHaut / 2, d.H, 8)}
          <Cadre x={rep.x(-d.bChainageBas / 2 + 0.02)} y={rep.y(r.zDessusChainageBas - 0.02)} l={rep.lx(d.bChainageBas - 0.04)} h={rep.ly(d.hChainageBas - 0.04)} epaisseur={1} rayon={2} />
          <Cadre x={rep.x(-d.bChainageHaut / 2 + 0.02)} y={rep.y(d.H - 0.02)} l={rep.lx(d.bChainageHaut - 0.04)} h={rep.ly(d.hChainageHaut - 0.04)} epaisseur={1} rayon={2} />
        </>
      )}
      <TerrainNaturel prefixe={pre} pts={tnG} texte={null} epaisseur={0} />
      <TerrainNaturel prefixe={pre} pts={tnD} texte="TN" epaisseur={0} />
      {[d.H, r.zDessousChainageHaut, r.zDessusChainageBas, 0, r.zDessusSemelle, r.zFondFouille]
        .filter((z, i) => !poteau || i === 0 || i >= 3)
        .map((z) => (
          <Niveau key={z} x={rep.x(0.4)} y={rep.y(z)} texte={niv(z)} longueur={40} />
        ))}
      <Cote x1={rep.x(-d.B / 2)} y1={rep.y(r.zFondFouille)} x2={rep.x(d.B / 2)} y2={rep.y(r.zFondFouille)} decalage={-10} texte={cm(d.B)} />
      <Cote x1={rep.x(-0.36)} y1={rep.y(r.zFondFouille)} x2={rep.x(-0.36)} y2={rep.y(0)} decalage={0} texte={cm(d.D)} />
      {poteau ? (
        <>
          <Renvoi de={[rep.x(-1.17), rep.y(d.H - 0.1)]} vers={[rep.x(-d.a / 2), rep.y(d.H - 0.25)]} texte={`poteau ${cm(d.a)} × ${cm(d.a)}`} />
          <Renvoi de={[rep.x(-1.17), rep.y(1.35)]} vers={[rep.x(-d.a / 2 + cnom), rep.y(1.2)]} texte={FER.poteau} />
          <Renvoi de={[rep.x(-1.17), rep.y(0.75)]} vers={[rep.x(-0.02), rep.y(0.65)]} texte={FER.cadresPoteau.replace('cadres ', 'cad. ')} />
          <Renvoi de={[rep.x(-1.17), rep.y(r.zDessusSemelle + 0.3)]} vers={[rep.x(-d.B / 2 + 0.06), rep.y(r.zFondFouille + d.ePropre + 0.12)]} texte="attentes ancrées" />
        </>
      ) : (
        <>
          <Renvoi de={[rep.x(-1.17), rep.y(d.H + 0.06)]} vers={[rep.x(-d.bChainageHaut / 2), rep.y(d.H - 0.07)]} texte={`chaînage ${cm(d.bChainageHaut)}×${cm(d.hChainageHaut)}`} />
          <Renvoi de={[rep.x(-1.17), rep.y(1.2)]} vers={[rep.x(-ep / 2), rep.y(1.05)]} texte={`blocs creux de ${cm(ep)}`} />
          <Renvoi de={[rep.x(-1.17), rep.y(0.5)]} vers={[rep.x(-d.bChainageBas / 2), rep.y(0.15)]} texte={`chaînage ${cm(d.bChainageBas)}×${cm(d.hChainageBas)}`} />
          <Renvoi de={[rep.x(-1.17), rep.y(r.zDessusSemelle + 0.2)]} vers={[rep.x(-es / 2), rep.y(r.zDessusSemelle + 0.15)]} texte={`blocs pleins de ${cm(es)}`} />
        </>
      )}
      <Renvoi de={[rep.x(-1.17), rep.y(r.zFondFouille - 0.04)]} vers={[rep.x(-d.B / 2 + 0.05), rep.y(r.zFondFouille + d.ePropre + 0.1)]} texte={`semelle ${cm(d.B)}×${cm(d.hSemelle)}`} />
    </>
  );
}

export function MurCoupe({ d, r, poteau, largeur = 330 }: Props & { poteau: boolean }) {
  const rep = creerRepere({ xmin: -1.2, xmax: 0.78, ymin: r.zFondFouille - 0.16, ymax: d.H + 0.16 }, largeur, 12);
  return (
    <Figure
      alt={poteau ? 'Coupe 2-2 au droit d’un poteau raidisseur : poteau en béton armé ancré dans la semelle filante' : 'Coupe 1-1 dans un panneau : semelle filante, soubassement en blocs pleins, chaînage bas, élévation en blocs creux, chaînage haut'}
      largeur={rep.largeur}
      hauteur={rep.hauteur}
      largeurMin={300}
    >
      <Coupe d={d} r={r} poteau={poteau} largeur={largeur} />
    </Figure>
  );
}

/** Petite élévation schématique pour la fiche de calcul (travées et poteaux). */
export function MurSchema({ d, r, largeur = 620 }: Props) {
  const rep = creerRepere({ xmin: -0.4, xmax: d.L + 0.4, ymin: -0.7, ymax: d.H + 0.45 }, largeur, 8);
  const poteaux = Array.from({ length: r.poteaux }, (_, i) => i * r.espacement);
  return (
    <Figure alt={`Élévation schématique : ${r.poteaux} poteaux, ${r.travees} travées de ${nombre(r.espacement, 3)} m d'entraxe`} largeur={rep.largeur} hauteur={rep.hauteur}>
      <rect {...rectM(rep, 0, 0, d.L, d.H)} fill="var(--fond-macon)" className="t-moyen" />
      {poteaux.map((x) => (
        <rect key={x} {...rectM(rep, x, 0, x + d.a, d.H)} fill="var(--color-acier)" />
      ))}
      <line x1={rep.x(-0.4)} y1={rep.y(0)} x2={rep.x(d.L + 0.4)} y2={rep.y(0)} className="t-fort" />
      <Cote x1={rep.x(0)} y1={rep.y(0)} x2={rep.x(d.L)} y2={rep.y(0)} decalage={-18} texte={`L = ${nombre(d.L, 2)} m · ${r.travees} travées`} />
      <Cote x1={rep.x(d.a / 2)} y1={rep.y(d.H)} x2={rep.x(d.a / 2 + r.espacement)} y2={rep.y(d.H)} decalage={10} texte={nombre(r.espacement, 3)} />
    </Figure>
  );
}
