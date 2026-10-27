import { describe, expect, it } from 'vitest';
import { masseLineique } from './acier';
import {
  analyseLogement,
  angleDePente,
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
  nombreBarresReparties,
  nomenclatureMenuiseries,
  nomenclaturePoutre,
  positionsFiles,
  rangIndice,
  retardIndice,
  studio,
  surfacesPieces,
} from './plans';

describe('coupes et niveaux', () => {
  it('calcule la hauteur sous plafond', () => {
    // plancher : 0,16 + 0,05 + 0,015 = 0,225 m ; HSP = 2,90 − 0,225 = 2,675 m
    expect(hauteurSousPlafond(EXEMPLE_PLANCHER)).toEqual({ plancher: 0.225, hsp: 2.675 });
  });

  it('passe des niveaux aux altitudes et à la pente', () => {
    // 312,45 − 0,40 = 312,05 m ; 312,45 + 3,06 = 315,51 m ; brut étage 3,06 − 0,06 = 3,00 m
    // rampe : 0,40 / 6,00 = 6,67 % ; arctan(0,0667) = 3,81°
    const n = niveaux(EXEMPLE_NIVEAUX);
    expect(n.altTN).toBeCloseTo(312.05, 9);
    expect(n.altEtage).toBeCloseTo(315.51, 9);
    expect(n.brutRdc).toBeCloseTo(-0.06, 9);
    expect(n.brutEtage).toBeCloseTo(3, 9);
    expect(n.pente).toBeCloseTo(6.6667, 3);
    expect(n.angle).toBeCloseTo(3.814, 3);
    expect(angleDePente(100)).toBeCloseTo(45, 9);
    expect(positionsFiles([4.2, 3.6, 4.2])).toEqual([0, 4.2, 7.8, 12]);
  });

  it('choisit les échelles du dossier', () => {
    // A3 : zone 390 × 277 ; place utile 350 × (277 − 40 − 40) = 350 × 197 mm.
    // Parcelle 30 × 20 m : 30 m au 1/100 = 300 mm ; 20 m au 1/100 = 200 mm > 197 → 1/200.
    // Maison 12,6 × 9,2 m au 1/50 : 252 × 184 mm, tient → 1/50.
    const e = echellesDossier(EXEMPLE_DOSSIER);
    expect(e.dispo).toEqual({ largeur: 350, hauteur: 197 });
    expect(e.masse).toBe(200);
    expect(e.niveau).toBe(50);
  });
});

describe('surfaces, aciers et menuiseries', () => {
  it('additionne les surfaces', () => {
    const s = surfacesPieces([{ nom: 'séjour', longueur: 4.4, largeur: 5.6 }, { nom: 'chambre', longueur: 3.9, largeur: 3.4 }]);
    // 24,64 + 13,26 = 37,90 m²
    expect(s.total).toBeCloseTo(37.9, 9);
  });

  it('établit la nomenclature d’une poutre', () => {
    // cadres sur 4,00 − 2 × 0,05 = 3,90 m tous les 0,15 m : 3,90 / 0,15 = 26 intervalles → 27 cadres
    expect(nombreBarresReparties(3.9, 0.15)).toBe(27);
    // filantes : 4,00 − 2 × 0,03 = 3,94 m ; cadre : 2 × (0,14 + 0,34) + 2 × 0,08 = 1,12 m
    // masses : HA 12 = 7 850 × π × 0,012² / 4 = 0,888 kg/m → 3 × 3,94 × 0,888 = 10,49 kg ;
    // HA 10 : 2 × 3,94 × 0,617 = 4,86 kg ; HA 6 : 27 × 1,12 × 0,222 = 6,71 kg ; total ≈ 22,06 kg
    const n = nomenclaturePoutre(EXEMPLE_POUTRE_FER);
    expect(n.filante).toBeCloseTo(3.94, 9);
    expect(n.nCadres).toBe(27);
    expect(n.cadre).toBeCloseTo(1.12, 9);
    expect(masseLineique(12)).toBeCloseTo(0.888, 3);
    expect(n.lignes[0]!.masse).toBeCloseTo(10.49, 2);
    expect(n.masse).toBeCloseTo(22.06, 1);
  });

  it('suit les indices et additionne les menuiseries', () => {
    expect(rangIndice('C')).toBe(3);
    expect(retardIndice('B', 'D')).toBe(2);
    // 0,9 × 2,1 = 1,89 ; 3 × 1,2 × 1,2 = 4,32 ; 0,6 × 0,6 = 0,36 → 6,57 m² pour 5 baies
    const m = nomenclatureMenuiseries(EXEMPLE_MENUISERIES);
    expect(m.total).toBeCloseTo(6.57, 9);
    expect(m.nombre).toBe(5);
  });
});

describe('modèle de logement', () => {
  it('analyse le studio du mini-projet', () => {
    const a = analyseLogement(studio(EXEMPLE_STUDIO));
    // hors tout : 5,60 + 2 × 0,20 = 6,00 m ; 4,00 + 0,40 = 4,40 m ; emprise 26,40 m²
    expect(a.exterieur).toEqual({ L: 6, l: 4.4 });
    expect(a.emprise).toBeCloseTo(26.4, 9);
    // pièce principale : 5,60 × 4,00 − (1,60 + 0,10) × (1,80 + 0,10) = 22,40 − 3,23 = 19,17 m² ; salle d'eau 1,60 × 1,80 = 2,88 m²
    expect(a.pieces[0]!.surface).toBeCloseTo(19.17, 9);
    expect(a.pieces[1]!.surface).toBeCloseTo(2.88, 9);
    expect(a.surfaceTotale).toBeCloseTo(22.05, 9);
    // façade sud : 0,20 + 0,80 = 1,00 | F1 1,20 | 3,80 − 2,00 = 1,80 | P1 0,90 | 5,60 + 0,20 − 4,70 = 1,10 → 6,00 m
    expect(a.facades.sud.partielles).toEqual([1, 1.2, 1.8, 0.9, 1.1]);
    expect(a.facades.sud.total).toBeCloseTo(6, 9);
    // dessus de dalle 2,70 + 0,15 = 2,85 ; acrotère 3,25 ; hors sol 3,25 + 0,30 = 3,55 m
    expect(a.niveaux.dessusDalle).toBeCloseTo(2.85, 9);
    expect(a.niveaux.acrotere).toBeCloseTo(3.25, 9);
    expect(a.hauteurHorsSol).toBeCloseTo(3.55, 9);
  });

  it('analyse la maison de deux pièces', () => {
    const a = analyseLogement(maison(EXEMPLE_MAISON));
    // séjour 4,40 × 5,60 = 24,64 ; chambre 3,90 × 3,40 = 13,26 ; salle d'eau 3,90 × 2,10 = 8,19 → 46,09 m²
    expect(a.pieces.map((p) => p.surface)).toEqual([24.64, 13.26, 8.19]);
    expect(a.surfaceTotale).toBeCloseTo(46.09, 9);
    expect(a.facades.sud.total).toBeCloseTo(8.8, 9);
  });
});
