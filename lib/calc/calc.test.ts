import { describe, expect, it } from 'vitest';
import { longueurPapier, longueurReelle } from './dessin';
import { escalierDroit, EXEMPLE_ESCALIER, profilEscalier } from './escalier';
import { EXEMPLE_MUR, murCloture } from './murCloture';
import { cercleMohr, poutreUniforme } from './rdm';
import { EXEMPLE_PLATEFORME, remblaiPlateforme } from './terrassement';

/*
 * Cas vérifié à la main : exemple L3.8.7.
 * Plateforme 30 × 20 m, cote projet 101,20 ; TN aux coins 100,20 / 100,50 / 100,80 / 100,40 ; talus 3/2 (m = 1,5).
 *  hauteurs : h1 = 1,00 ; h2 = 0,70 ; h3 = 0,40 ; h4 = 0,80 m → moyenne 2,90 / 4 = 0,725 m
 *  plateforme : 600 m² × 0,725 m = 435,00 m³
 *  côtés : 1-2 : 1,5 × 30 × (1 + 0,7 + 0,49) / 6 = 16,425 ; 2-3 : 1,5 × 20 × 0,93 / 6 = 4,650
 *          3-4 : 1,5 × 30 × 1,12 / 6 = 8,400 ; 4-1 : 1,5 × 20 × 2,44 / 6 = 12,200 → 41,675 m³
 *  coins : 1,5² / 3 × (1 + 0,343 + 0,064 + 0,512) = 0,75 × 1,919 = 1,439 m³
 *  total : 435,000 + 41,675 + 1,439 = 478,114 m³
 */
describe('remblai de plateforme : exemple L3.8.7', () => {
  const r = remblaiPlateforme(EXEMPLE_PLATEFORME);
  it('hauteurs et volume sous la plateforme', () => {
    r.h.forEach((x, i) => expect(x).toBeCloseTo([1, 0.7, 0.4, 0.8][i]!, 9));
    expect(r.hMoyenne).toBeCloseTo(0.725, 9);
    expect(r.volumePlateforme).toBeCloseTo(435, 6);
  });
  it('talus et total', () => {
    expect(r.volumesCotes[0]).toBeCloseTo(16.425, 6);
    expect(r.volumesCotes[1]).toBeCloseTo(4.65, 6);
    expect(r.volumesCotes[2]).toBeCloseTo(8.4, 6);
    expect(r.volumesCotes[3]).toBeCloseTo(12.2, 6);
    expect(r.volumesCoins.reduce((a, b) => a + b, 0)).toBeCloseTo(1.43925, 6);
    expect(r.volumeTotal).toBeCloseTo(478.11425, 5);
    expect(r.valide).toBe(true);
  });
  it('dessine le pied de talus à m·h des bords', () => {
    expect(r.piedDeTalus).toHaveLength(12);
    expect(r.piedDeTalus[0]![1]).toBeCloseTo(-1.5, 9); // coin 1 : 1,5 × 1,00
  });
  it('refuse un coin en déblai', () => {
    const d = remblaiPlateforme({ ...EXEMPLE_PLATEFORME, Zp: 100.6 });
    expect(d.valide).toBe(false);
  });
  it('terrain plat : volume = S·h + talus', () => {
    // 10 × 10 m, h = 1 m, m = 1 : côtés 4 × 1 × 10 × 3 / 6 = 20 ; coins 4 × 1/3 → 100 + 20 + 1,333
    const p = remblaiPlateforme({ L: 10, l: 10, Zp: 1, tn: [0, 0, 0, 0], m: 1 });
    expect(p.volumeTotal).toBeCloseTo(100 + 20 + 4 / 3, 9);
  });
});

/*
 * Cas vérifié à la main : exemple L3.6.9.
 * H = 3,00 m, h visée 0,17 m → 3,00 / 0,17 = 17,6 → n = 18 contremarches, h = 3,00 / 18 = 0,1667 m
 * Blondel 0,63 : g = 0,63 − 2 × 0,1667 = 0,2967 m ; volées de 9 + 9 contremarches (8 marches chacune)
 * reculement = 8 × 0,2967 + 1,20 + 8 × 0,2967 = 5,947 m ; palier à 9 × 0,1667 = 1,50 m
 * inclinaison = arctan(0,1667 / 0,2967) = 29,33° ; rampant = 8 × √(0,2967² + 0,1667²) = 2,722 m
 */
describe('escalier droit : exemple L3.6.9', () => {
  const r = escalierDroit(EXEMPLE_ESCALIER);
  it('tracé par Blondel', () => {
    expect(r.n).toBe(18);
    expect(r.h).toBeCloseTo(0.166667, 6);
    expect(r.g).toBeCloseTo(0.296667, 6);
    expect(r.blondel).toBeCloseTo(0.63, 12);
    expect([r.n1, r.n2]).toEqual([9, 9]);
    expect(r.hauteurPalier).toBeCloseTo(1.5, 12);
    expect(r.reculement).toBeCloseTo(5.946667, 6);
    expect(r.angle).toBeCloseTo(29.327, 3);
    expect(r.rampant1).toBeCloseTo(2.72222, 5);
    expect(r.valide).toBe(true);
  });
  it('profil fermé du haut vers le pied', () => {
    const { dessus, dessous } = profilEscalier(EXEMPLE_ESCALIER, r);
    expect(dessus[0]).toEqual([0, 3]);
    const fin = dessus[dessus.length - 1]!;
    expect(fin[0]).toBeCloseTo(r.reculement, 9);
    expect(fin[1]).toBeCloseTo(0, 9);
    // 2 points par marche (contremarche + giron), moins le giron absent en fin de volée, + palier
    expect(dessus).toHaveLength(1 + (2 * 9 - 1) + 1 + (2 * 9 - 1));
    // le dessous du palier est à 1,50 − 0,15 = 1,35 m, et ses extrémités sont dans le bon ordre
    expect(dessous[1]![1]).toBeCloseTo(1.35, 9);
    expect(dessous[1]![0]).toBeGreaterThan(dessous[2]![0]);
  });
  it('signale un module hors de l’intervalle de Blondel', () => {
    expect(escalierDroit({ ...EXEMPLE_ESCALIER, M: 0.7 }).valide).toBe(false);
  });
});

/*
 * Cas vérifié à la main : exemple L3.6.6.
 * L = 24 m, poteaux tous les 3 m au plus → 8 travées de 3,00 m, 9 poteaux de 20 × 20
 * longueur nette = 24 − 9 × 0,20 = 22,20 m
 * niveaux : fond de fouille −0,60 ; dessus semelle −0,35 ; dessus soubassement +0,05 ; dessus chaînage bas +0,25 ;
 *           dessous chaînage haut +1,85 → élévation 1,60 m = 8 rangs de 0,20 m
 * fouille 24 × 0,50 × 0,60 = 7,20 m³ ; propreté 0,60 m³ ; semelle 2,40 m³
 * chaînage bas 22,20 × 0,20 × 0,20 = 0,888 m³ ; chaînage haut 22,20 × 0,15 × 0,15 = 0,4995 m³
 * poteaux 9 × 0,20 × 0,20 × 2,35 = 0,846 m³ → béton armé 4,6335 m³
 * blocs : 12,5 /m² ; soubassement 22,20 × 0,40 = 8,88 m² → 111 × 1,05 = 116,55 → 117
 *         élévation 22,20 × 1,60 = 35,52 m² → 444 × 1,05 = 466,2 → 467
 */
describe('mur de clôture : exemple L3.6.6', () => {
  const r = murCloture(EXEMPLE_MUR);
  it('travées et niveaux', () => {
    expect([r.travees, r.poteaux]).toEqual([8, 9]);
    expect(r.espacement).toBeCloseTo(3, 12);
    expect(r.longueurNette).toBeCloseTo(22.2, 9);
    expect(r.zDessusSemelle).toBeCloseTo(-0.35, 9);
    expect(r.zDessusChainageBas).toBeCloseTo(0.25, 9);
    expect(r.rangsElevation).toBeCloseTo(8, 9);
    expect(r.messages).toEqual([]);
  });
  it('quantités', () => {
    expect(r.volumeFouille).toBeCloseTo(7.2, 9);
    expect(r.volumeSemelle).toBeCloseTo(2.4, 9);
    expect(r.volumePoteaux).toBeCloseTo(0.846, 9);
    expect(r.volumeBetonArme).toBeCloseTo(4.6335, 9);
    expect(r.blocsParM2).toBeCloseTo(12.5, 9);
    expect(r.blocsSoubassement).toBe(117);
    expect(r.blocsElevation).toBe(467);
  });
  it('arrondit le nombre de travées vers le haut', () => {
    expect(murCloture({ ...EXEMPLE_MUR, L: 25 }).travees).toBe(9); // 25 / 3 = 8,33 → 9
  });
});

describe('échelles et RDM', () => {
  it('lecture à l’échelle', () => {
    expect(longueurReelle(54, 50)).toBeCloseTo(2.7, 12); // 54 mm × 50 = 2 700 mm
    expect(longueurPapier(3.6, 50)).toBeCloseTo(72, 12); // 3 600 mm / 50
  });
  it('poutre sous charge uniforme', () => {
    const p = poutreUniforme(10, 6); // qL²/8 = 10 × 36 / 8 = 45 kN·m
    expect(p.momentMax).toBeCloseTo(45, 12);
    expect(p.moment(3)).toBeCloseTo(45, 12);
    expect(p.effortTranchant(0)).toBeCloseTo(30, 12);
  });
  it('cercle de Mohr', () => {
    // σx = 80, σy = 20, τ = 40 : centre 50, rayon √(30² + 40²) = 50 → σ1 = 100, σ2 = 0, θp = ½·arctan(80/60) = 26,57°
    const m = cercleMohr(80, 20, 40);
    expect(m.centre).toBe(50);
    expect(m.rayon).toBeCloseTo(50, 12);
    expect(m.s1).toBeCloseTo(100, 12);
    expect(m.s2).toBeCloseTo(0, 12);
    expect(m.angleP).toBeCloseTo(26.565, 3);
  });
});
