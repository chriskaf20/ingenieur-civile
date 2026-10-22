# Cursus — Génie Civil Académie

Parcours complet, du bac à l'ingénieur civil confirmé. Ce document sert de référence pour produire le contenu (Phase 4).

## Conventions

- **Identifiants** : `Niveau.Module.Leçon` (ex. `L3.3.5`). `P` = mini-projet de synthèse, `EX` = examen de fin de module. En prérequis, `L2.4` désigne un module entier et `∗` toutes les leçons du module.
- **Gabarits** : A `FicheCalcul` · B `PlancheTechnique` · C `Infographie` · D `FicheMemo` · E `Vue3D`. Toutes les leçons contiennent une fiche mémo (D) et un quiz : D n'est indiqué que là où il domine. Dans une leçon sans calcul, l'exemple résolu (étape 5) est une étude de cas guidée au format A, sans entrée modifiable.
- **Marqueurs** : ★ leçon vitrine (Phase 2) · `RDC` étude de cas d'Afrique centrale · `FR` comparaison Eurocodes ↔ BAEL 91 ou autres règles françaises encore pratiquées · ⚠ donnée à confirmer (voir A_VERIFIER.md).
- **Durée** : temps d'étude estimé (cours, exemple, exercices, quiz).
- **Déblocage** : un module devient « recommandé » quand ses modules prérequis sont validés (quiz ≥ 70 %). Pas de blocage strict par défaut.
- **Ordre** : l'ordre indiqué est l'ordre conseillé ; les modules d'un même niveau peuvent se suivre en parallèle. Un module de Pratique professionnelle s'ouvre dès que ses prérequis sont validés.

## Compléments ajoutés à la base

- N0.1 *Méthode de travail* placée en premier ; fonctions exp/ln, unités anciennes encore rencontrées sur les chantiers.
- L3.2 *Bases de calcul et actions (EC0, EC1)* : module commun avant le béton armé, l'acier et le bois.
- Résistance au cisaillement des sols (L3.4), physique du bâtiment en climat tropical, réseaux du bâtiment et sécurité incendie (L3.6).
- Lutte antiérosive et ravines de Kinshasa, assainissement autonome, VRD de lotissement (M1.3, M1.10).
- Aperçus EC4 (mixte) et EC1-2 (ponts) ; maçonnerie chaînée en zone sismique.
- Engins de terrassement et rendements, rédaction technique, anglais technique (PP).

## Vue d'ensemble

<!-- RESUME:DEBUT -->
| Niveau | Modules | Leçons | Mini-projets + examens | Durée estimée |
|---|---|---|---|---|
| Niveau 0 — Mise à niveau | 7 | 46 | 14 | 61 h |
| L1 — Fondamentaux | 8 | 74 | 16 | 134 h |
| L2 — Bases de l'ingénieur | 10 | 97 | 20 | 191 h |
| L3 — Cœur du métier | 9 | 116 | 18 | 236 h |
| M1 — Approfondissement | 10 | 95 | 20 | 228 h |
| M2 — Spécialisation et projet | 11 | 98 | 22 | 228 h |
| Pratique professionnelle | 8 | 51 | 16 | 92 h |
| **Total** | **63** | **577** | **126** | **1170 h** |

| Module | Titre | Leçons | Durée |
|---|---|---|---|
| N0.1 | Méthode de travail à l'université | 6 | 6 h |
| N0.2 | Algèbre et fonctions | 9 | 13 h |
| N0.3 | Unités, conversions et ordres de grandeur | 7 | 9 h |
| N0.4 | Trigonométrie | 6 | 9 h |
| N0.5 | Géométrie plane et dans l'espace | 6 | 9 h |
| N0.6 | Vecteurs | 5 | 7 h |
| N0.7 | Physique de base | 7 | 9 h |
| L1.1 | Introduction au génie civil et aux métiers du BTP | 8 | 11 h |
| L1.2 | Analyse : dérivées et intégrales | 10 | 20 h |
| L1.3 | Mécanique générale et statique | 12 | 22 h |
| L1.4 | Algèbre linéaire | 7 | 14 h |
| L1.5 | Chimie des matériaux | 9 | 15 h |
| L1.6 | Dessin technique et lecture de plans | 12 | 20 h |
| L1.7 | Informatique de l'ingénieur | 8 | 17 h |
| L1.8 | Topographie I | 8 | 17 h |
| L2.1 | Équations différentielles | 7 | 14 h |
| L2.2 | Probabilités et statistiques | 9 | 18 h |
| L2.3 | Méthodes numériques | 7 | 14 h |
| L2.4 | Résistance des matériaux I | 11 | 23 h |
| L2.5 | Résistance des matériaux II | 9 | 21 h |
| L2.6 | Matériaux de construction | 18 | 31 h |
| L2.7 | Géologie de l'ingénieur | 9 | 16 h |
| L2.8 | Mécanique des fluides | 9 | 18 h |
| L2.9 | Topographie II | 10 | 20 h |
| L2.10 | DAO : principes d'AutoCAD | 8 | 17 h |
| L3.1 | Calcul des structures | 15 | 34 h |
| L3.2 | Bases de calcul et actions (EC0, EC1) | 10 | 20 h |
| L3.3 | Béton armé I | 13 | 28 h |
| L3.4 | Mécanique des sols I | 15 | 28 h |
| L3.5 | Hydraulique générale et hydrologie | 13 | 27 h |
| L3.6 | Technologie de construction | 17 | 31 h |
| L3.7 | Métré, quantitatifs et devis (DQE) | 11 | 22 h |
| L3.8 | Routes I : tracé, terrassements, cubatures | 12 | 26 h |
| L3.9 | Construction métallique I | 10 | 21 h |
| M1.1 | Béton armé II | 12 | 29 h |
| M1.2 | Béton précontraint | 8 | 18 h |
| M1.3 | Mécanique des sols II | 10 | 25 h |
| M1.4 | Fondations superficielles et profondes | 10 | 24 h |
| M1.5 | Construction métallique II | 9 | 24 h |
| M1.6 | Construction bois | 7 | 17 h |
| M1.7 | Dynamique des structures et parasismique | 10 | 24 h |
| M1.8 | Méthode des éléments finis | 8 | 20 h |
| M1.9 | Chaussées : dimensionnement | 9 | 21 h |
| M1.10 | Hydraulique urbaine : eau potable, assainissement, drainage | 12 | 28 h |
| M2.1 | Ouvrages d'art (ponts) | 11 | 27 h |
| M2.2 | Barrages et ouvrages hydrauliques | 9 | 22 h |
| M2.3 | Géotechnique avancée | 9 | 22 h |
| M2.4 | Pathologie et réhabilitation des ouvrages | 9 | 20 h |
| M2.5 | BIM | 6 | 14 h |
| M2.6 | Management de projet | 8 | 17 h |
| M2.7 | Économie de la construction | 6 | 14 h |
| M2.8 | Marchés et contrats | 8 | 17 h |
| M2.9 | HSE et sécurité de chantier | 8 | 14 h |
| M2.10 | Environnement et études d'impact | 7 | 13 h |
| M2.11 | Projet de fin d'études guidé : bâtiment R+3 | 17 | 51 h |
| PP.1 | Conduite de travaux | 9 | 17 h |
| PP.2 | Implantation des ouvrages | 6 | 13 h |
| PP.3 | Contrôle qualité et essais | 9 | 16 h |
| PP.4 | Réception des ouvrages | 5 | 8 h |
| PP.5 | Lire de vrais dossiers de plans | 6 | 15 h |
| PP.6 | Notes de calcul et rapports | 6 | 10 h |
| PP.7 | Déontologie et responsabilité | 4 | 7 h |
| PP.8 | Devenir ingénieur civil | 6 | 8 h |

*Tableaux générés automatiquement à partir des lignes du cursus (durées arrondies à l'heure).*
<!-- RESUME:FIN -->

---

## Niveau 0 — Mise à niveau

*But : consolider les outils du lycée dont l'ingénieur se sert tous les jours.*

### N0.1 — Méthode de travail à l'université
Prérequis module : —

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| N0.1.1 | Apprendre efficacement : rappel actif et répétition espacée | Organiser ses révisions selon les méthodes les plus efficaces | — | 45 min | C |
| N0.1.2 | Prendre des notes et construire ses fiches | Transformer un cours en fiches de révision utiles | N0.1.1 | 45 min | C D |
| N0.1.3 | Résoudre un problème d'ingénieur en 5 étapes | Appliquer la démarche données → schéma → hypothèses → calcul → vérification | — | 1 h | A C |
| N0.1.4 | Présenter un calcul : unités, arrondis, résultat encadré | Rédiger une application numérique propre et vérifiable | N0.1.3 | 45 min | A |
| N0.1.5 | Organiser son année : planning, examens, stress | Construire un planning de semestre réaliste | — | 45 min | C |
| N0.1.6 | Chercher et vérifier une information technique | Distinguer une source fiable (norme, ouvrage, cours) d'une source douteuse | — | 45 min | C |
| N0.1.P | Mini-projet : mon plan d'étude du semestre | Planifier son semestre et ses révisions | ∗ | 1 h | C |
| N0.1.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 30 min | A |

### N0.2 — Algèbre et fonctions
Prérequis module : —

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Calcul numérique** | | | | |
| N0.2.1 | Fractions, puissances et racines | Calculer sans erreur avec fractions, puissances et racines | — | 1 h | A |
| N0.2.2 | Notation scientifique, chiffres significatifs, arrondis | Présenter un résultat avec une précision adaptée | N0.2.1 | 45 min | A |
| N0.2.3 | Proportionnalité, pourcentages, règle de trois | Résoudre un problème de dosage, de pente ou d'échelle | N0.2.1 | 45 min | A |
| | **Ch. 2 — Équations** | | | | |
| N0.2.4 | Expressions littérales et identités remarquables | Développer, factoriser et transformer une formule | N0.2.1 | 1 h | A |
| N0.2.5 | Équations et inéquations du premier degré | Isoler une inconnue dans une formule technique | N0.2.4 | 1 h | A |
| N0.2.6 | Systèmes linéaires à 2 et 3 inconnues | Résoudre un système par substitution et par combinaison | N0.2.5 | 1 h 30 | A |
| N0.2.7 | Équation du second degré | Résoudre un trinôme et interpréter ses racines | N0.2.5 | 1 h | A |
| | **Ch. 3 — Fonctions** | | | | |
| N0.2.8 | Fonctions et lecture de graphiques | Lire, tracer et interpréter une courbe (pente, variations) | N0.2.5 | 1 h | A C |
| N0.2.9 | Fonctions usuelles : affines, polynômes, puissances, exp, ln | Reconnaître et manipuler les fonctions usuelles | N0.2.8 | 1 h 30 | A |
| N0.2.P | Mini-projet : les formules du chantier | Appliquer l'algèbre à des formules réelles (dosage, pente, échelle) | ∗ | 2 h | A |
| N0.2.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h | A |

### N0.3 — Unités, conversions et ordres de grandeur
Prérequis module : N0.2

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| N0.3.1 | Le Système international : unités et préfixes | Identifier unités de base, unités dérivées et préfixes SI | — | 45 min | A |
| N0.3.2 | Longueurs, surfaces, volumes : conversions | Convertir sans erreur m², m³, L et ha | N0.3.1 | 45 min | A |
| N0.3.3 | Masse, poids, force, pression : kg, N, kN, Pa, MPa | Distinguer masse et poids, convertir forces et contraintes | N0.3.2 | 1 h | A |
| N0.3.4 | Masse volumique et poids volumique des matériaux | Calculer le poids propre d'un élément en béton, acier ou terre | N0.3.3 | 1 h | A C |
| N0.3.5 | Analyse dimensionnelle | Vérifier l'homogénéité d'une formule | N0.3.3 | 45 min | A |
| N0.3.6 | Unités anciennes et anglo-saxonnes encore rencontrées | Convertir tonne-force, kgf/cm², bar, pouce et pied | N0.3.3 | 45 min | A |
| N0.3.7 | Ordres de grandeur du génie civil | Estimer rapidement charges, portées et dimensions courantes | N0.3.4 | 1 h | C |
| N0.3.P | Mini-projet : poids propre d'une dalle, d'une poutre et d'un mur | Calculer et contrôler par ordre de grandeur des poids propres | ∗ | 1 h 30 | A C |
| N0.3.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h | A |

### N0.4 — Trigonométrie
Prérequis module : N0.2

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| N0.4.1 | Angles : degrés, radians, grades | Convertir un angle entre degrés, radians et grades (gon) | N0.2.3 | 45 min | A |
| N0.4.2 | Triangle rectangle : Pythagore, sinus, cosinus, tangente | Calculer les côtés et les angles d'un triangle rectangle | N0.4.1 | 1 h | A E |
| N0.4.3 | Pentes : %, ‰, angle et rapport 1/n | Convertir une pente d'une écriture à l'autre | N0.4.2 | 45 min | A B |
| N0.4.4 | Cercle trigonométrique et formules usuelles | Utiliser les relations trigonométriques fondamentales | N0.4.2 | 1 h | A |
| N0.4.5 | Triangle quelconque : loi des sinus, Al-Kashi | Résoudre un triangle quelconque issu d'une mesure de terrain | N0.4.4 | 1 h | A |
| N0.4.6 | Application : toiture, rampe et talus | Calculer longueurs et angles d'une toiture, d'une rampe ou d'un talus | N0.4.3 | 1 h | A E |
| N0.4.P | Mini-projet : géométrie d'une ferme de toiture | Déterminer longueurs et angles de toutes les barres d'une ferme | ∗ | 2 h | A E |
| N0.4.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h | A |

### N0.5 — Géométrie plane et dans l'espace
Prérequis module : N0.2, N0.4

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| N0.5.1 | Figures planes : périmètres et aires | Calculer l'aire de surfaces composées (parcelle, dalle) | N0.2.1 | 1 h | A |
| N0.5.2 | Thalès et figures semblables | Utiliser Thalès pour les échelles et les mesures indirectes | N0.5.1 | 45 min | A |
| N0.5.3 | Solides : volumes et surfaces | Calculer le volume de prismes, cylindres, cônes et troncs | N0.5.1 | 1 h 30 | A E |
| N0.5.4 | Repérage : coordonnées cartésiennes et polaires | Placer des points et calculer distances et angles | N0.4.4 | 1 h | A |
| N0.5.5 | Du volume aux vues : initiation aux projections | Passer d'un objet 3D à ses vues 2D et inversement | N0.5.3 | 1 h | B E |
| N0.5.6 | Centre de gravité de surfaces simples | Localiser le centre de gravité d'une surface composée | N0.5.1 | 1 h | A |
| N0.5.P | Mini-projet : aires et volumes d'une petite maison | Calculer surfaces, volumes de fouilles et volumes de béton | ∗ | 2 h | A B |
| N0.5.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h | A |

### N0.6 — Vecteurs
Prérequis module : N0.4, N0.5

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| N0.6.1 | Notion de vecteur | Représenter une force par sa direction, son sens et sa norme | N0.5.4 | 45 min | A |
| N0.6.2 | Somme de vecteurs et produit par un nombre | Additionner des forces graphiquement et par le calcul | N0.6.1 | 1 h | A |
| N0.6.3 | Composantes et projections | Décomposer une force selon deux axes | N0.6.2, N0.4.2 | 1 h | A |
| N0.6.4 | Produit scalaire | Calculer l'angle entre deux directions et le travail d'une force | N0.6.3 | 1 h | A |
| N0.6.5 | Produit vectoriel et moment d'une force | Calculer le moment d'une force en 2D puis en 3D | N0.6.4 | 1 h | A E |
| N0.6.P | Mini-projet : efforts dans les haubans d'un mât | Décomposer les efforts d'un mât haubané | ∗ | 1 h 30 | A E |
| N0.6.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h | A |

### N0.7 — Physique de base
Prérequis module : N0.3, N0.6

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| N0.7.1 | Cinématique : position, vitesse, accélération | Décrire un mouvement rectiligne, calculer vitesse et accélération | N0.2.8 | 1 h | A |
| N0.7.2 | Les lois de Newton | Relier forces et mouvement | N0.6.2 | 1 h | A |
| N0.7.3 | Poids, frottement et plan incliné | Calculer une force de frottement et la condition de glissement | N0.7.2 | 1 h | A E |
| N0.7.4 | Travail, énergie, puissance | Calculer l'énergie et la puissance d'une pompe ou d'un treuil | N0.7.2 | 1 h | A |
| N0.7.5 | Pression, hydrostatique, poussée d'Archimède | Calculer la pression de l'eau en profondeur et la poussée | N0.3.3 | 1 h | A B |
| N0.7.6 | Température et dilatation thermique | Calculer l'allongement thermique d'un élément et justifier un joint | N0.3.1 | 45 min | A |
| N0.7.7 | Électricité utile au chantier | Calculer puissance et courant pour choisir un groupe électrogène | N0.3.1 | 45 min | A |
| N0.7.P | Mini-projet : physique d'un château d'eau | Calculer poids, pression au pied et énergie de pompage | ∗ | 1 h 30 | A |
| N0.7.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h | A |

---

## L1 — Fondamentaux

*But : acquérir les outils mathématiques, mécaniques et graphiques de base, et découvrir le métier.*

### L1.1 — Introduction au génie civil et aux métiers du BTP
Prérequis module : —

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L1.1.1 | Le génie civil : domaines et grands ouvrages | Situer les grands domaines du génie civil et leurs ouvrages | — | 45 min | C |
| L1.1.2 | Les acteurs d'un projet | Distinguer maître d'ouvrage, maître d'œuvre, entreprise et bureau de contrôle | L1.1.1 | 1 h | C |
| L1.1.3 | Les métiers du BTP, du compagnon à l'ingénieur | Décrire les métiers d'un chantier et d'un bureau d'études | L1.1.2 | 45 min | C |
| L1.1.4 | Les phases d'un projet, de l'idée à la réception | Ordonner les phases d'un projet et leurs livrables | L1.1.2 | 1 h | C |
| L1.1.5 | Anatomie d'un bâtiment | Nommer fondations, structure, enveloppe et équipements | — | 1 h | E C |
| L1.1.6 | Le cheminement des charges | Suivre une charge de la toiture jusqu'au sol | L1.1.5 | 1 h | C E |
| L1.1.7 | Normes et règlements : Eurocodes, BAEL, DTU `FR` | Situer les textes de référence et leur statut | L1.1.4 | 1 h | C |
| L1.1.8 | Construire en Afrique centrale : climat, sols, matériaux `RDC` | Identifier les contraintes propres aux chantiers en RDC | L1.1.5 | 1 h | C |
| L1.1.P | Mini-projet : rapport de visite de chantier | Observer un chantier (réel ou virtuel) et rédiger un rapport illustré | ∗ | 2 h | C |
| L1.1.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h | A |

### L1.2 — Analyse : dérivées et intégrales
Prérequis module : N0.2

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Limites et dérivées** | | | | |
| L1.2.1 | Limites et continuité | Calculer des limites simples et reconnaître une fonction continue | N0.2.9 | 1 h 30 | A |
| L1.2.2 | La dérivée : pente et taux de variation | Interpréter la dérivée comme une pente ou une vitesse de variation | L1.2.1 | 1 h 30 | A |
| L1.2.3 | Règles de dérivation | Dériver sommes, produits, quotients et fonctions composées | L1.2.2 | 1 h 30 | A |
| L1.2.4 | Variations, extremums et optimisation | Trouver le maximum d'une fonction (ex. moment fléchissant maximal) | L1.2.3 | 1 h 30 | A |
| L1.2.5 | Approximations et développements limités | Linéariser une fonction (petits angles, petites déformations) | L1.2.3 | 1 h 30 | A |
| | **Ch. 2 — Intégrales** | | | | |
| L1.2.6 | Primitives et intégrale définie | Calculer une intégrale et l'interpréter comme une aire | L1.2.3 | 1 h 30 | A |
| L1.2.7 | Techniques d'intégration | Intégrer par parties et par changement de variable | L1.2.6 | 1 h 30 | A |
| L1.2.8 | Applications : aires, volumes, centres de gravité, inerties | Calculer par intégration aire, centre de gravité et moment d'inertie | L1.2.6, N0.5.6 | 2 h | A E |
| | **Ch. 3 — Fonctions de plusieurs variables** | | | | |
| L1.2.9 | Dérivées partielles | Calculer des dérivées partielles et un gradient | L1.2.3 | 1 h 30 | A |
| L1.2.10 | Intégrales doubles | Calculer l'aire et les moments d'une surface par intégrale double | L1.2.9, L1.2.8 | 1 h 30 | A |
| L1.2.P | Mini-projet : caractéristiques d'une section en T | Calculer aire, centre de gravité et inertie d'une section en T par intégration | ∗ | 2 h | A |
| L1.2.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L1.3 — Mécanique générale et statique
Prérequis module : N0.6, N0.7

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Forces et moments** | | | | |
| L1.3.1 | Actions mécaniques et modélisation des forces | Modéliser charges, poids et réactions par des forces | N0.7.3 | 1 h | A C |
| L1.3.2 | Moment d'une force et couple | Calculer le moment d'une force par rapport à un point | N0.6.5 | 1 h 30 | A |
| L1.3.3 | Torseur des actions mécaniques | Réduire un ensemble de forces en un point | L1.3.2 | 1 h 30 | A |
| | **Ch. 2 — Équilibre** | | | | |
| L1.3.4 | Principe fondamental de la statique (plan) | Écrire et résoudre les équations d'équilibre d'un solide | L1.3.3 | 1 h 30 | A |
| L1.3.5 | Liaisons et appuis : appui simple, articulation, encastrement | Associer chaque appui à ses réactions | L1.3.4 | 1 h 30 | A E |
| L1.3.6 | Réactions d'appui d'une poutre | Calculer les réactions sous charges ponctuelles et réparties | L1.3.5 | 1 h 30 | A |
| L1.3.7 | Systèmes isostatiques et hyperstatiques | Déterminer le degré d'hyperstaticité d'une structure | L1.3.6 | 1 h | A |
| | **Ch. 3 — Applications** | | | | |
| L1.3.8 | Treillis : méthode des nœuds | Calculer les efforts dans les barres d'un treillis par les nœuds | L1.3.6 | 1 h 30 | A B |
| L1.3.9 | Treillis : méthode des sections (Ritter) | Calculer directement l'effort dans une barre choisie | L1.3.8 | 1 h 30 | A |
| L1.3.10 | Frottement, glissement et renversement | Vérifier le glissement et le renversement d'un mur poids | L1.3.4, N0.7.3 | 1 h 30 | A E |
| L1.3.11 | Centres de gravité et moments statiques | Calculer le centre de gravité d'une section composée | N0.5.6, L1.3.2 | 1 h 30 | A |
| L1.3.12 | Statique dans l'espace (aperçu) | Écrire l'équilibre d'un solide en 3D | L1.3.4 | 1 h | A E |
| L1.3.P | Mini-projet : ferme de toiture en bois | Calculer réactions et efforts dans toutes les barres d'une ferme | ∗ | 3 h | A B |
| L1.3.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L1.4 — Algèbre linéaire
Prérequis module : N0.2, N0.6

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L1.4.1 | Matrices et opérations | Additionner, multiplier et transposer des matrices | N0.2.6 | 1 h 30 | A |
| L1.4.2 | Systèmes linéaires et pivot de Gauss | Résoudre un système par la méthode du pivot | L1.4.1 | 1 h 30 | A |
| L1.4.3 | Déterminant et matrice inverse | Calculer un déterminant et inverser une matrice | L1.4.2 | 1 h 30 | A |
| L1.4.4 | Espaces vectoriels, bases et rang | Déterminer le rang d'un système et l'existence de solutions | L1.4.3 | 1 h 30 | A |
| L1.4.5 | Applications linéaires et changement de repère | Changer de repère par une matrice de rotation | L1.4.4, N0.6.3 | 1 h 30 | A E |
| L1.4.6 | Valeurs propres et vecteurs propres | Calculer valeurs et vecteurs propres d'une matrice 2×2 ou 3×3 | L1.4.5 | 1 h 30 | A |
| L1.4.7 | Aperçu : une structure comme système K·u = F | Écrire l'équilibre d'une structure simple sous forme matricielle | L1.4.2, L1.3.8 | 1 h | A B |
| L1.4.P | Mini-projet : un treillis résolu par matrices | Résoudre les efforts d'un treillis par un système matriciel | ∗ | 2 h | A |
| L1.4.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L1.5 — Chimie des matériaux
Prérequis module : N0.3

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L1.5.1 | Atomes, liaisons et structure de la matière | Relier le type de liaison aux propriétés d'un matériau | — | 1 h | C |
| L1.5.2 | Réactions chimiques et stœchiométrie | Équilibrer une réaction et calculer des quantités de matière | L1.5.1 | 1 h 30 | A |
| L1.5.3 | Acides, bases et pH | Mesurer et interpréter le pH d'une eau ou d'un sol | L1.5.2 | 1 h | A |
| L1.5.4 | Chimie du ciment : clinker et hydratation | Expliquer la prise et le durcissement du ciment | L1.5.2 | 1 h 30 | C |
| L1.5.5 | Chaux et plâtre | Comparer la prise de la chaux et du plâtre à celle du ciment | L1.5.4 | 1 h | C |
| L1.5.6 | Corrosion des aciers | Expliquer le mécanisme électrochimique de la corrosion | L1.5.3 | 1 h 30 | C E |
| L1.5.7 | Agressions chimiques du béton : carbonatation, sulfates, alcali-réaction | Identifier les attaques chimiques du béton et leurs parades | L1.5.4 | 1 h 30 | C |
| L1.5.8 | Polymères, bitumes et adjuvants | Décrire la chimie des bitumes, des résines et des adjuvants | L1.5.1 | 1 h | C |
| L1.5.9 | Chimie de l'eau : gâchage et consommation | Juger si une eau convient au gâchage ou à la consommation | L1.5.3 | 1 h | A C |
| L1.5.P | Mini-projet : fiche d'analyse d'une dégradation | Relier une dégradation observée à sa cause chimique | ∗ | 2 h | C |
| L1.5.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h 30 | A |

### L1.6 — Dessin technique et lecture de plans
Prérequis module : N0.5

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Bases** | | | | |
| L1.6.1 | Formats, traits et écritures | Choisir le format, le type et l'épaisseur de trait selon l'usage | — | 1 h | B |
| L1.6.2 | Échelles | Lire une dimension sur un plan et choisir une échelle | N0.2.3 | 1 h | A B |
| L1.6.3 | Projections orthogonales | Construire les vues de face, de dessus et de côté | N0.5.5 | 1 h 30 | B E |
| L1.6.4 | Perspectives isométrique et cavalière | Dessiner un objet simple en perspective | L1.6.3 | 1 h 30 | E |
| | **Ch. 2 — Conventions** | | | | |
| L1.6.5 | ★ Symboles de base en génie civil | Lire et utiliser les symboles courants des plans | L1.6.1 | 1 h | D B |
| L1.6.6 | Cotation | Coter un plan selon les règles, sans ambiguïté | L1.6.2 | 1 h 30 | B |
| L1.6.7 | Coupes, sections et hachures | Lire et tracer une coupe repérée avec les hachures normalisées | L1.6.3 | 1 h 30 | B |
| L1.6.8 | Niveaux, axes et repères de files | Lire les niveaux et le quadrillage d'axes d'un bâtiment | L1.6.6 | 1 h | B |
| | **Ch. 3 — Lecture de plans** | | | | |
| L1.6.9 | Le dossier de plans d'un bâtiment | Identifier les pièces d'un dossier : architecture, structure, réseaux | L1.6.8 | 1 h 30 | B C |
| L1.6.10 | Lire un plan d'architecture | Lire un plan de niveau, une façade et une coupe | L1.6.9 | 1 h 30 | B |
| L1.6.11 | Lire un plan de coffrage et de ferraillage (initiation) | Repérer éléments, sections et armatures sur un plan de structure | L1.6.10 | 1 h 30 | B E |
| L1.6.12 | Cartouche, indices et nomenclatures | Lire un cartouche et suivre les révisions d'un plan | L1.6.9 | 45 min | B |
| L1.6.P | Mini-projet : plan, façade et coupe d'un studio | Dessiner à la main le dossier simple d'un studio | ∗ | 3 h | B |
| L1.6.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L1.7 — Informatique de l'ingénieur
Prérequis module : N0.2

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Tableur** | | | | |
| L1.7.1 | Tableur : formules et références | Écrire des formules avec références relatives et absolues | — | 1 h 30 | A |
| L1.7.2 | Tableur : fonctions utiles | Utiliser SI, RECHERCHEV et SOMMEPROD dans un calcul technique | L1.7.1 | 1 h 30 | A |
| L1.7.3 | Tableur : graphiques et note de calcul | Présenter un calcul tabulé lisible et vérifiable | L1.7.2 | 1 h | A |
| | **Ch. 2 — Python** | | | | |
| L1.7.4 | Python : variables, types et opérations | Écrire ses premiers calculs en Python | — | 1 h 30 | A |
| L1.7.5 | Python : conditions, boucles et fonctions | Structurer un calcul en fonctions réutilisables | L1.7.4 | 1 h 30 | A |
| L1.7.6 | Python : listes, dictionnaires, fichiers CSV | Lire et traiter un fichier de mesures | L1.7.5 | 1 h 30 | A |
| L1.7.7 | Python : NumPy et Matplotlib | Calculer sur des tableaux et tracer des courbes | L1.7.6 | 2 h | A |
| L1.7.8 | Fiabiliser un calcul : tests et vérification | Tester une fonction de calcul sur un cas connu | L1.7.7 | 1 h 30 | A |
| L1.7.P | Mini-projet : calculateur de réactions d'appui | Programmer le calcul des réactions d'une poutre (tableur et Python) | ∗, L1.3.6 | 3 h | A |
| L1.7.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L1.8 — Topographie I
Prérequis module : N0.4, N0.5

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L1.8.1 | La topographie : rôle, référentiels, coordonnées | Situer un point dans un système de coordonnées (dont UTM) | N0.5.4 | 1 h | C |
| L1.8.2 | Mesure des distances | Mesurer une distance et appliquer les corrections usuelles | L1.8.1 | 1 h 30 | A |
| L1.8.3 | Mesure des angles : théodolite et station totale | Lire un angle horizontal et vertical en grades | N0.4.1 | 1 h 30 | A E |
| L1.8.4 | Nivellement direct | Déterminer une dénivelée au niveau optique | L1.8.1 | 2 h | A B |
| L1.8.5 | Carnet de nivellement et fermeture | Tenir un carnet, calculer et compenser une fermeture | L1.8.4 | 1 h 30 | A |
| L1.8.6 | Gisements et coordonnées | Résoudre les problèmes direct et inverse | L1.8.3 | 1 h 30 | A |
| L1.8.7 | Erreurs et tolérances | Distinguer erreurs systématiques et accidentelles, vérifier une tolérance | L1.8.5 | 1 h | A |
| L1.8.8 | Lever simple et plan topographique | Lever une parcelle et dessiner son plan | L1.8.6 | 1 h 30 | B |
| L1.8.P | Mini-projet : nivellement d'un terrain à bâtir | Niveler un terrain et produire un plan coté | ∗ | 3 h | A B |
| L1.8.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

---

## L2 — Bases de l'ingénieur

*But : maîtriser la résistance des matériaux, les matériaux de construction et les outils de calcul.*

### L2.1 — Équations différentielles
Prérequis module : L1.2

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L2.1.1 | Qu'est-ce qu'une équation différentielle ? | Reconnaître une équation différentielle et son ordre | L1.2.7 | 1 h | A |
| L2.1.2 | Équations du premier ordre | Résoudre une équation séparable ou linéaire du premier ordre | L2.1.1 | 1 h 30 | A |
| L2.1.3 | Application : vidange d'un réservoir | Modéliser une décroissance exponentielle | L2.1.2 | 1 h 30 | A |
| L2.1.4 | Équations du second ordre à coefficients constants | Résoudre une équation du second ordre avec second membre | L2.1.2 | 1 h 30 | A |
| L2.1.5 | Application : oscillateur masse-ressort amorti | Calculer la période et l'amortissement d'un oscillateur | L2.1.4 | 1 h 30 | A C |
| L2.1.6 | Application : la déformée d'une poutre (aperçu) | Intégrer l'équation de la déformée d'une poutre simple | L2.1.4, L1.3.6 | 1 h 30 | A |
| L2.1.7 | Équations aux dérivées partielles (aperçu) | Reconnaître les équations de la chaleur, des ondes et de la consolidation | L2.1.4, L1.2.9 | 1 h 30 | A C |
| L2.1.P | Mini-projet : vidange d'un château d'eau | Calculer le temps de vidange d'un réservoir | ∗ | 2 h | A |
| L2.1.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L2.2 — Probabilités et statistiques
Prérequis module : L1.2

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L2.2.1 | Statistique descriptive | Calculer moyenne et écart-type, tracer un histogramme | N0.2.9 | 1 h 30 | A |
| L2.2.2 | Probabilités : événements et conditionnement | Calculer une probabilité simple et conditionnelle | — | 1 h 30 | A |
| L2.2.3 | Variables aléatoires et lois discrètes | Utiliser les lois binomiale et de Poisson | L2.2.2 | 1 h 30 | A |
| L2.2.4 | Loi normale et fractiles | Calculer un fractile d'une loi normale | L2.2.3 | 1 h 30 | A |
| L2.2.5 | Résistance caractéristique du béton | Interpréter fck comme le fractile 5 % des résistances | L2.2.4 | 1 h 30 | A C |
| L2.2.6 | Estimation et intervalles de confiance | Estimer une moyenne et son intervalle de confiance | L2.2.4 | 1 h 30 | A |
| L2.2.7 | Régression linéaire et corrélation | Ajuster une droite à des mesures et juger la corrélation | L2.2.1 | 1 h 30 | A |
| L2.2.8 | Valeurs extrêmes et période de retour | Relier période de retour et probabilité de dépassement (pluies, crues) | L2.2.4 | 1 h 30 | A C |
| L2.2.9 | Fiabilité : l'origine des coefficients partiels | Expliquer pourquoi on majore les charges et on minore les résistances | L2.2.5 | 1 h 30 | C |
| L2.2.P | Mini-projet : résultats d'écrasement d'un chantier | Analyser une série d'essais et conclure sur la conformité du béton | ∗ | 2 h | A |
| L2.2.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L2.3 — Méthodes numériques
Prérequis module : L1.4, L1.7, L2.1

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L2.3.1 | Erreurs numériques et précision | Évaluer les erreurs d'arrondi et de troncature | L1.7.7 | 1 h | A |
| L2.3.2 | Équations non linéaires : dichotomie et Newton | Résoudre numériquement f(x) = 0 | L2.3.1 | 1 h 30 | A |
| L2.3.3 | Interpolation | Interpoler dans un tableau normatif | L2.3.1 | 1 h 30 | A |
| L2.3.4 | Intégration numérique : trapèzes et Simpson | Calculer une aire ou un volume à partir de mesures | L1.2.6 | 1 h 30 | A |
| L2.3.5 | Systèmes linéaires de grande taille | Résoudre un système par Gauss, Cholesky ou une méthode itérative | L1.4.2 | 1 h 30 | A |
| L2.3.6 | Équations différentielles : Euler et Runge-Kutta | Intégrer une équation différentielle pas à pas | L2.1.4 | 1 h 30 | A |
| L2.3.7 | Différences finies (aperçu) | Discrétiser une équation pour la résoudre sur une grille | L2.3.6 | 1 h 30 | A |
| L2.3.P | Mini-projet : cubatures par Simpson en Python | Programmer le calcul d'un volume de terrassement | ∗ | 2 h | A |
| L2.3.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L2.4 — Résistance des matériaux I
Prérequis module : L1.2, L1.3

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Efforts internes** | | | | |
| L2.4.1 | Hypothèses de la RDM et notion de contrainte | Définir contrainte et déformation, énoncer les hypothèses de la RDM | L1.3.6 | 1 h 30 | C A |
| L2.4.2 | Efforts internes N, V, M : méthode des coupures | Calculer N, V et M dans une section | L2.4.1 | 2 h | A |
| L2.4.3 | Diagrammes N, V, M d'une poutre isostatique | Tracer les diagrammes d'une poutre sous charges courantes | L2.4.2 | 2 h | A |
| L2.4.4 | Relations entre charge, effort tranchant et moment | Utiliser dV/dx et dM/dx pour tracer et vérifier les diagrammes | L2.4.3, L1.2.6 | 1 h 30 | A |
| | **Ch. 2 — Sollicitations simples** | | | | |
| L2.4.5 | Traction et compression simples, loi de Hooke | Calculer la contrainte et l'allongement d'une barre | L2.4.1 | 1 h 30 | A |
| L2.4.6 | Caractéristiques des sections : inertie et théorème de Huygens | Calculer le moment quadratique d'une section composée | L1.3.11 | 2 h | A |
| L2.4.7 | Flexion simple : contraintes normales | Calculer σ = M·y/I et repérer la fibre la plus sollicitée | L2.4.6, L2.4.3 | 2 h | A E |
| L2.4.8 | Flexion simple : contraintes de cisaillement | Calculer la contrainte de cisaillement dans une section | L2.4.7 | 1 h 30 | A |
| L2.4.9 | Torsion des arbres circulaires | Calculer la contrainte et l'angle de torsion | L2.4.5 | 1 h 30 | A |
| L2.4.10 | Cisaillement simple : boulons et assemblages | Vérifier une cheville ou un boulon au cisaillement | L2.4.5 | 1 h | A |
| L2.4.11 | Dimensionner une section en flexion | Choisir une section qui respecte une contrainte limite | L2.4.7 | 1 h 30 | A |
| L2.4.P | Mini-projet : solive de plancher en bois | Dimensionner une solive sous charges de plancher | ∗ | 3 h | A B |
| L2.4.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L2.5 — Résistance des matériaux II
Prérequis module : L2.4, L2.1

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L2.5.1 | Déformée des poutres : ligne élastique | Calculer la flèche d'une poutre par intégration | L2.4.7, L2.1.6 | 2 h | A |
| L2.5.2 | Superposition et formulaire de flèches | Combiner des cas de charge tabulés | L2.5.1 | 1 h 30 | A |
| L2.5.3 | Méthodes énergétiques : théorème de Castigliano | Calculer un déplacement par l'énergie de déformation | L2.5.1 | 2 h | A |
| L2.5.4 | Flexion composée et noyau central | Calculer les contraintes sous effort normal et moment combinés | L2.4.7 | 1 h 30 | A |
| L2.5.5 | Flexion déviée | Calculer les contraintes en flexion selon deux axes | L2.5.4 | 1 h 30 | A |
| L2.5.6 | Contraintes principales et cercle de Mohr | Déterminer les contraintes principales avec le cercle de Mohr | L2.4.8 | 2 h | A |
| L2.5.7 | Déformations et loi de Hooke généralisée | Relier contraintes et déformations en 2D et en 3D | L2.5.6 | 1 h 30 | A |
| L2.5.8 | Flambement : charge critique d'Euler | Calculer la charge critique et l'élancement d'un poteau | L2.5.1 | 2 h | A E |
| L2.5.9 | Premières poutres hyperstatiques : théorème des trois moments | Calculer une poutre continue à deux travées | L2.5.1 | 2 h | A |
| L2.5.P | Mini-projet : poutre console de balcon | Vérifier les contraintes et la flèche d'une console | ∗ | 3 h | A B |
| L2.5.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L2.6 — Matériaux de construction
Prérequis module : N0.3, L1.5

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Généralités** | | | | |
| L2.6.1 | Propriétés physiques des matériaux | Calculer masse volumique, porosité et absorption | N0.3.4 | 1 h 30 | A C |
| L2.6.2 | Comportement mécanique : l'essai de traction | Lire une courbe contrainte-déformation (ductile, fragile) | L2.4.5 | 1 h 30 | A C |
| | **Ch. 2 — Liants et granulats** | | | | |
| L2.6.3 | Ciments : types et classes | Choisir un ciment (CEM I à V, classes 32,5 à 52,5) selon l'usage | L1.5.4 | 1 h 30 | C |
| L2.6.4 | Granulats : origine, classes, qualités | Caractériser un granulat (d/D, propreté, forme) | — | 1 h 30 | C |
| L2.6.5 | Analyse granulométrique et module de finesse | Tracer une courbe granulométrique et calculer le module de finesse | L2.6.4 | 1 h 30 | A |
| L2.6.6 | Eau de gâchage et adjuvants | Choisir un adjuvant selon l'effet recherché | L1.5.8 | 1 h | C |
| | **Ch. 3 — Béton et mortier** | | | | |
| L2.6.7 | Béton frais : ouvrabilité et cône d'Abrams | Mesurer l'affaissement et classer un béton (S1 à S5) | L2.6.3 | 1 h 30 | A E |
| L2.6.8 | Formulation du béton : méthode Dreux-Gorisse | Calculer les quantités de ciment, sable, gravier et eau pour 1 m³ | L2.6.5, L2.6.7 | 3 h | A C |
| L2.6.9 | Béton durci : résistance et classes | Lire une classe C25/30 et interpréter un essai d'écrasement | L2.6.7 | 1 h 30 | A |
| L2.6.10 | Durabilité : classes d'exposition | Choisir la classe d'exposition et ses exigences (EN 206) | L2.6.9 | 1 h 30 | C |
| L2.6.11 | Mise en œuvre et cure en climat chaud `RDC` | Organiser malaxage, transport, vibration et cure sous climat tropical | L2.6.9 | 1 h 30 | C |
| L2.6.12 | Mortiers : dosages et usages | Choisir et doser un mortier de pose ou d'enduit | L2.6.3 | 1 h | A |
| | **Ch. 4 — Aciers, bois, maçonnerie et autres matériaux** | | | | |
| L2.6.13 | Aciers pour béton armé | Identifier nuances, diamètres et masses linéiques des armatures | L2.6.2 | 1 h 30 | C |
| L2.6.14 | Aciers de construction et profilés | Lire la désignation d'un profilé et d'une nuance (S235 à S355) | L2.6.2 | 1 h | C |
| L2.6.15 | Bois : structure, humidité, classes, essences locales `RDC` | Choisir un bois de structure selon sa classe et son usage | L2.6.2 | 1 h 30 | C |
| L2.6.16 | Maçonnerie : parpaings, briques cuites, BTC `RDC` | Comparer les éléments de maçonnerie disponibles localement | L2.6.1 | 1 h 30 | C |
| L2.6.17 | Matériaux locaux en RDC `RDC` | Évaluer sables de rivière, latérite, granulats de carrière et bambou | L2.6.4 | 1 h | C |
| L2.6.18 | Bitumes, géosynthétiques et autres matériaux | Situer l'usage des bitumes, verres, plastiques et géosynthétiques | L1.5.8 | 1 h | C |
| L2.6.P | Mini-projet : formuler un C25/30 avec des matériaux locaux `RDC` | Formuler et contrôler un béton avec des granulats disponibles en RDC | ∗ | 3 h | A |
| L2.6.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L2.7 — Géologie de l'ingénieur
Prérequis module : L1.5

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L2.7.1 | La Terre : structure, tectonique, cycle des roches | Expliquer la formation et l'évolution des roches | — | 1 h | C |
| L2.7.2 | Identifier les roches | Reconnaître les principales roches magmatiques, sédimentaires et métamorphiques | L2.7.1 | 1 h 30 | C |
| L2.7.3 | Altération des roches, formation des sols, latéritisation `RDC` | Expliquer la formation des sols tropicaux et des latérites | L2.7.2 | 1 h 30 | C |
| L2.7.4 | Minéraux argileux et argiles gonflantes | Relier la minéralogie d'une argile à son gonflement | L2.7.3 | 1 h 30 | C |
| L2.7.5 | Cartes et coupes géologiques | Lire une carte géologique et construire une coupe | L2.7.2 | 1 h 30 | B |
| L2.7.6 | Hydrogéologie : nappes et perméabilité | Situer une nappe et prévoir son effet sur un ouvrage | L2.7.3 | 1 h 30 | C B |
| L2.7.7 | Risques géologiques : séismes, volcans, glissements, érosion `RDC` | Identifier les risques géologiques d'un site (rift du Kivu, ravines) | L2.7.1 | 1 h 30 | C |
| L2.7.8 | Géologie de la RDC et zones minières `RDC` | Situer les grands ensembles géologiques et miniers de la RDC | L2.7.2 | 1 h | C |
| L2.7.9 | Reconnaître le sous-sol : sondages, puits, géophysique | Choisir une méthode de reconnaissance adaptée | L2.7.5 | 1 h 30 | C B |
| L2.7.P | Mini-projet : coupe géologique le long d'un tracé routier | Établir une coupe et en déduire les risques du tracé | ∗ | 2 h | B |
| L2.7.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h 30 | A |

### L2.8 — Mécanique des fluides
Prérequis module : L1.2, N0.7

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L2.8.1 | Propriétés des fluides | Définir masse volumique, viscosité et compressibilité | N0.3.4 | 1 h | A |
| L2.8.2 | Hydrostatique : poussée sur une paroi plane | Calculer la poussée de l'eau et son point d'application | N0.7.5, L1.3.11 | 2 h | A B |
| L2.8.3 | Parois courbes et flottaison | Calculer une poussée sur paroi courbe et la stabilité d'un flotteur | L2.8.2 | 1 h 30 | A |
| L2.8.4 | Débit et équation de continuité | Relier débit, vitesse et section | L2.8.1 | 1 h 30 | A |
| L2.8.5 | Théorème de Bernoulli | Appliquer Bernoulli à un écoulement en conduite | L2.8.4 | 2 h | A C |
| L2.8.6 | Régimes d'écoulement et nombre de Reynolds | Déterminer si un écoulement est laminaire ou turbulent | L2.8.5 | 1 h 30 | A |
| L2.8.7 | Pertes de charge linéaires et singulières | Calculer les pertes de charge d'une conduite | L2.8.6 | 2 h | A |
| L2.8.8 | Quantité de mouvement : forces sur un coude | Calculer l'effort d'un écoulement sur un coude ou une vanne | L2.8.5 | 1 h 30 | A |
| L2.8.9 | Similitude et modèles réduits | Transposer un essai sur modèle à l'ouvrage réel | L2.8.6 | 1 h | A |
| L2.8.P | Mini-projet : citerne et conduite d'alimentation | Vérifier la poussée sur une citerne et le débit de sa conduite | ∗ | 2 h | A B |
| L2.8.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L2.9 — Topographie II
Prérequis module : L1.8

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L2.9.1 | Cheminement polygonal | Calculer et compenser une polygonale | L1.8.6 | 2 h | A |
| L2.9.2 | Intersection et relèvement | Déterminer un point par intersection ou par relèvement | L2.9.1 | 1 h 30 | A |
| L2.9.3 | Nivellement trigonométrique | Calculer une dénivelée à partir d'un angle vertical | L1.8.4, L1.8.3 | 1 h 30 | A |
| L2.9.4 | Lever de détails à la station totale | Organiser et coder un lever de détails | L2.9.1 | 1 h 30 | B |
| L2.9.5 | Courbes de niveau et modèle numérique de terrain | Interpoler et tracer des courbes de niveau | L2.9.4 | 1 h 30 | A B |
| L2.9.6 | Profils en long et en travers | Établir des profils à partir d'un lever | L2.9.5 | 1 h 30 | B |
| L2.9.7 | GNSS : principes et RTK | Choisir un mode GNSS selon la précision visée | L1.8.1 | 1 h 30 | C |
| L2.9.8 | Drones et photogrammétrie (aperçu) | Situer l'apport des drones pour lever un site | L2.9.5 | 1 h | C |
| L2.9.9 | Surfaces et volumes à partir d'un lever | Calculer surfaces et volumes depuis des points levés | L2.9.5, L2.3.4 | 1 h 30 | A |
| L2.9.10 | SIG : principes et usages (aperçu) | Situer l'usage d'un SIG dans un projet | L2.9.5 | 1 h | C |
| L2.9.P | Mini-projet : plan topographique d'une parcelle | Produire un plan coté avec courbes de niveau | ∗ | 3 h | A B |
| L2.9.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L2.10 — DAO : principes d'AutoCAD
Prérequis module : L1.6

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L2.10.1 | Interface, unités, coordonnées et gabarit | Configurer un dessin en mètres et saisir des coordonnées | L1.6.2 | 1 h 30 | B |
| L2.10.2 | Commandes de dessin et de modification | Dessiner un plan simple avec les commandes de base | L2.10.1 | 2 h | B |
| L2.10.3 | Calques, types de lignes et épaisseurs | Organiser un dessin en calques normalisés | L2.10.2 | 1 h | B |
| L2.10.4 | Cotation, textes et hachures | Coter et habiller un plan selon les règles du dessin technique | L2.10.3, L1.6.6 | 1 h 30 | B |
| L2.10.5 | Blocs, attributs et références externes | Créer une bibliothèque de blocs et lier des fichiers | L2.10.3 | 1 h 30 | B |
| L2.10.6 | Présentations, fenêtres et échelles | Mettre en page plusieurs vues à l'échelle sur une planche | L2.10.4 | 1 h 30 | B |
| L2.10.7 | Impression, PDF et livraison des plans | Produire des PDF conformes aux conventions de livraison | L2.10.6 | 1 h | B |
| L2.10.8 | Logiciels alternatifs gratuits | Comparer les alternatives libres à AutoCAD | L2.10.2 | 45 min | C |
| L2.10.P | Mini-projet : dossier DAO d'un studio | Redessiner en DAO le dossier du mini-projet L1.6.P | ∗ | 4 h | B |
| L2.10.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

---

## L3 — Cœur du métier

*But : calculer, concevoir, métrer et construire les ouvrages courants.*

### L3.1 — Calcul des structures
Prérequis module : L1.4, L2.4, L2.5

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Structures isostatiques** | | | | |
| L3.1.1 | Modéliser une structure | Passer d'un ouvrage réel à son schéma mécanique | L2.4.3 | 1 h 30 | A B |
| L3.1.2 | Portiques et arcs isostatiques | Tracer N, V, M d'un portique ou d'un arc à trois articulations | L3.1.1 | 2 h | A |
| L3.1.3 | Treillis isostatiques : étude complète | Calculer et vérifier un treillis de toiture | L1.3.9 | 1 h 30 | A |
| L3.1.4 | Lignes d'influence | Placer une charge mobile pour obtenir l'effet maximal | L3.1.2 | 2 h | A |
| L3.1.5 | Travaux virtuels et calcul des déplacements | Calculer un déplacement par l'intégrale de Mohr | L2.5.3 | 2 h | A |
| | **Ch. 2 — Méthode des forces** | | | | |
| L3.1.6 | Degré d'hyperstaticité et choix d'une méthode | Choisir entre méthode des forces, méthode des déplacements et Cross | L1.3.7 | 1 h | A C |
| L3.1.7 | Méthode des forces : principe | Écrire les équations de compatibilité d'une structure hyperstatique | L3.1.5 | 2 h | A |
| L3.1.8 | Méthode des forces : poutres continues et portiques | Calculer une poutre continue et un portique simple | L3.1.7 | 2 h | A |
| L3.1.9 | Effets de la température et des tassements d'appui | Calculer les efforts dus à un tassement ou à un gradient thermique | L3.1.8 | 1 h 30 | A |
| | **Ch. 3 — Méthode des déplacements et méthode de Cross** | | | | |
| L3.1.10 | Méthode des déplacements : rigidités | Établir les moments d'encastrement et les rigidités des barres | L3.1.7 | 2 h | A |
| L3.1.11 | Méthode des déplacements : portiques | Calculer un portique à nœuds fixes puis à nœuds déplaçables | L3.1.10 | 2 h | A |
| L3.1.12 | Méthode de Cross : principe | Calculer les facteurs de répartition et de transmission | L3.1.10 | 2 h | A |
| L3.1.13 | Méthode de Cross : poutres continues et portiques | Mener un calcul de Cross complet | L3.1.12 | 2 h | A |
| L3.1.14 | Calcul matriciel des structures | Assembler la matrice de rigidité d'un portique | L3.1.11, L1.4.7 | 2 h | A |
| L3.1.15 | Logiciels de calcul : contrôler les résultats | Vérifier un résultat de logiciel par un calcul simple | L3.1.14 | 1 h 30 | C |
| L3.1.P | Mini-projet : portique de hangar | Calculer un portique par Cross et comparer au calcul matriciel | ∗ | 4 h | A B |
| L3.1.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### L3.2 — Bases de calcul et actions (EC0, EC1)
Prérequis module : L2.2, L2.4

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L3.2.1 | Philosophie de la sécurité : états limites `FR` | Expliquer ELU, ELS et la méthode des coefficients partiels | L2.2.9 | 1 h 30 | C |
| L3.2.2 | Durée d'utilisation et situations de projet | Choisir la durée d'utilisation et les situations à vérifier (EC0) | L3.2.1 | 1 h | C |
| L3.2.3 | Classification des actions | Classer une action en permanente, variable ou accidentelle | L3.2.1 | 1 h | C |
| L3.2.4 | Poids propres et charges permanentes (EC1-1-1) | Évaluer les charges permanentes d'un plancher | L3.2.3, N0.3.4 | 1 h 30 | A |
| L3.2.5 | Charges d'exploitation des bâtiments (EC1-1-1) | Choisir la charge d'exploitation selon la catégorie d'usage | L3.2.3 | 1 h 30 | A |
| L3.2.6 | Combinaisons d'actions ELU et ELS | Former les combinaisons fondamentales et caractéristiques | L3.2.4, L3.2.5 | 2 h | A |
| L3.2.7 | Actions du vent (EC1-1-4) : principes ⚠ | Calculer une pression de vent sur une façade simple | L3.2.3 | 1 h 30 | A |
| L3.2.8 | Actions thermiques et autres actions | Situer les actions thermiques, de chantier et accidentelles | L3.2.3 | 1 h | C |
| L3.2.9 | Descente de charges d'un bâtiment | Cumuler les charges de la toiture jusqu'aux fondations | L3.2.6 | 2 h | A C |
| L3.2.10 | Eurocodes et BAEL : comparer les approches `FR` | Comparer combinaisons et coefficients de l'EC0 et du BAEL 91 | L3.2.6 | 1 h 30 | C |
| L3.2.P | Mini-projet : descente de charges d'un R+2 | Établir la descente de charges complète d'un immeuble | ∗ | 3 h | A C |
| L3.2.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L3.3 — Béton armé I
Prérequis module : L2.4, L2.6, L3.2

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Principes** | | | | |
| L3.3.1 | Pourquoi armer le béton ? | Expliquer le rôle du béton et de l'acier dans une poutre | L2.6.9, L2.4.7 | 1 h | C E |
| L3.3.2 | Lois de comportement de calcul (EC2) | Utiliser les diagrammes de calcul du béton et de l'acier | L3.2.1 | 1 h 30 | A |
| L3.3.3 | Enrobage et durabilité (EC2 §4.4.1) | Calculer l'enrobage nominal selon la classe d'exposition | L2.6.10 | 1 h 30 | A |
| L3.3.4 | Adhérence, ancrage et recouvrement | Calculer une longueur d'ancrage et de recouvrement | L3.3.2 | 1 h 30 | A E |
| | **Ch. 2 — Compression et traction** | | | | |
| L3.3.5 | ★ Poteau en compression centrée `FR` | Dimensionner et ferrailler un poteau (EC2 comparé au BAEL) | L3.3.2, L3.2.9 | 2 h | C A E |
| L3.3.6 | Tirant en traction simple | Dimensionner les armatures d'un tirant | L3.3.2 | 1 h | A |
| | **Ch. 3 — Flexion et effort tranchant** | | | | |
| L3.3.7 | Flexion simple à l'ELU : section rectangulaire | Calculer les armatures d'une poutre rectangulaire | L3.3.2 | 2 h | A |
| L3.3.8 | Flexion simple : section en T | Calculer une poutre en T solidaire d'une dalle | L3.3.7 | 1 h 30 | A |
| L3.3.9 | Vérifications à l'ELS : contraintes, fissuration, flèche | Vérifier une poutre en service | L3.3.7 | 2 h | A |
| L3.3.10 | Effort tranchant : bielles et cadres | Calculer les armatures transversales d'une poutre | L3.3.7 | 2 h | A E |
| L3.3.11 | Dispositions constructives et plan de ferraillage d'une poutre | Dessiner le ferraillage complet d'une poutre | L3.3.10, L3.3.4 | 1 h 30 | B E |
| | **Ch. 4 — Dalles et fondations simples** | | | | |
| L3.3.12 | Dalle portant dans un seul sens | Calculer une dalle pleine sur deux appuis | L3.3.7 | 1 h 30 | A |
| L3.3.13 | Semelle isolée sous poteau `FR` | Dimensionner une semelle par la méthode des bielles | L3.3.5 | 2 h | A B |
| L3.3.P | Mini-projet : poutre, poteau et semelle d'un R+1 | Rédiger la note de calcul et les plans d'un portique de R+1 | ∗ | 4 h | A B C |
| L3.3.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### L3.4 — Mécanique des sols I
Prérequis module : L2.7, L2.8

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Identification** | | | | |
| L3.4.1 | Le sol, un milieu à trois phases | Représenter un sol en grains, eau et air | L2.7.3 | 1 h 30 | A E |
| L3.4.2 | Paramètres d'état d'un sol | Calculer teneur en eau, indice des vides, degré de saturation et poids volumiques | L3.4.1 | 2 h | A |
| L3.4.3 | Granulométrie des sols | Interpréter une courbe granulométrique (tamisage, sédimentométrie) | L2.6.5 | 1 h 30 | A |
| L3.4.4 | Limites d'Atterberg | Déterminer wL, wP et l'indice de plasticité | L3.4.2 | 1 h 30 | A |
| L3.4.5 | Valeur de bleu et équivalent de sable | Mesurer la propreté et l'argilosité d'un sol | L3.4.3 | 1 h | A |
| L3.4.6 | Classification des sols (GTR, USCS) | Classer un sol à partir de ses essais d'identification | L3.4.4, L3.4.5 | 1 h 30 | A D |
| | **Ch. 2 — Essais mécaniques et hydrauliques** | | | | |
| L3.4.7 | Compactage : essai Proctor | Déterminer l'optimum Proctor et l'objectif de compactage | L3.4.2 | 1 h 30 | A |
| L3.4.8 | Portance : essai CBR | Calculer un indice CBR et l'interpréter | L3.4.7 | 1 h 30 | A |
| L3.4.9 | Perméabilité et loi de Darcy | Calculer un débit d'infiltration à travers un sol | L2.8.4 | 1 h 30 | A |
| L3.4.10 | Contraintes effectives (Terzaghi) | Calculer la contrainte effective en profondeur | L3.4.2 | 1 h 30 | A B |
| L3.4.11 | Diffusion des contraintes sous une charge | Calculer l'accroissement de contrainte sous une fondation | L3.4.10 | 1 h 30 | A |
| L3.4.12 | Résistance au cisaillement : Mohr-Coulomb | Déterminer c et φ à partir d'essais de cisaillement et triaxiaux | L3.4.10, L2.5.6 | 2 h | A |
| | **Ch. 3 — Sols tropicaux et rapport de sol** | | | | |
| L3.4.13 | Sols latéritiques `RDC` | Identifier un graveleux latéritique et juger son usage | L3.4.6 | 1 h 30 | C A |
| L3.4.14 | Argiles gonflantes `RDC` | Reconnaître une argile gonflante et estimer le risque | L3.4.4, L2.7.4 | 1 h 30 | C A |
| L3.4.15 | Lire un rapport géotechnique | Extraire d'un rapport les données utiles au projet | L3.4.6 | 1 h 30 | C B |
| L3.4.P | Mini-projet : sol de plateforme routière | Identifier, classer et juger un sol de plateforme à partir d'essais | ∗ | 3 h | A |
| L3.4.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L3.5 — Hydraulique générale et hydrologie
Prérequis module : L2.2, L2.8

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Écoulements en charge** | | | | |
| L3.5.1 | Pertes de charge : Darcy-Weisbach et Colebrook | Calculer une perte de charge avec le coefficient de frottement | L2.8.7 | 2 h | A |
| L3.5.2 | Formules pratiques : Hazen-Williams, Manning-Strickler | Choisir et appliquer une formule empirique de pertes de charge | L3.5.1 | 1 h 30 | A |
| L3.5.3 | Réseaux de conduites : série, parallèle, maillés | Équilibrer un réseau maillé par la méthode de Hardy Cross | L3.5.2 | 2 h | A |
| L3.5.4 | Pompes : courbes, point de fonctionnement, NPSH | Choisir une pompe pour un refoulement | L3.5.1 | 2 h | A C |
| L3.5.5 | Coup de bélier (aperçu) | Estimer la surpression due à une fermeture brusque | L3.5.1 | 1 h | A |
| | **Ch. 2 — Écoulements à surface libre** | | | | |
| L3.5.6 | Régime uniforme : Manning-Strickler | Calculer le débit d'un canal ou d'un fossé | L2.8.7 | 2 h | A |
| L3.5.7 | Énergie spécifique, régime critique, ressaut | Identifier un régime fluvial ou torrentiel et prévoir un ressaut | L3.5.6 | 2 h | A |
| L3.5.8 | Déversoirs et orifices | Calculer le débit d'un déversoir ou d'un orifice | L3.5.7 | 1 h 30 | A |
| | **Ch. 3 — Hydrologie** | | | | |
| L3.5.9 | Cycle de l'eau et bassin versant | Délimiter un bassin versant et calculer ses caractéristiques | L2.9.5 | 1 h 30 | C B |
| L3.5.10 | Pluies intenses : courbes IDF en climat tropical `RDC` ⚠ | Lire une courbe intensité-durée-fréquence | L2.2.8 | 1 h 30 | A C |
| L3.5.11 | Débit de pointe : méthode rationnelle | Calculer le débit de pointe d'un petit bassin versant | L3.5.10, L3.5.9 | 1 h 30 | A |
| L3.5.12 | Hydrogrammes et crues de projet (aperçu) | Situer les méthodes d'estimation des crues | L3.5.11 | 1 h 30 | A |
| L3.5.13 | Dimensionner un fossé et un dalot | Dimensionner un ouvrage de drainage pour une crue de projet | L3.5.6, L3.5.11 | 2 h | A B |
| L3.5.P | Mini-projet : drainage d'une piste en saison des pluies `RDC` | Dimensionner les fossés et les dalots d'une piste | ∗ | 3 h | A B |
| L3.5.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L3.6 — Technologie de construction
Prérequis module : L1.6, L2.6

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Gros œuvre** | | | | |
| L3.6.1 | Installation de chantier et implantation | Organiser l'installation et implanter un bâtiment | L1.8.4 | 1 h 30 | B C |
| L3.6.2 | Terrassements : fouilles, talus, blindages | Choisir le mode de terrassement et de soutènement provisoire | L1.1.5 | 1 h 30 | E C |
| L3.6.3 | Fondations superficielles : semelles, radiers, longrines | Décrire la réalisation des fondations superficielles | L3.6.2 | 1 h 30 | B E |
| L3.6.4 | Soubassement, hérisson et dallage | Décrire un soubassement et un dallage sur terre-plein | L3.6.3 | 1 h 30 | B E |
| L3.6.5 | Murs en maçonnerie : appareillages, chaînages, linteaux | Concevoir un mur en maçonnerie chaînée | L2.6.16 | 1 h 30 | E B |
| L3.6.6 | ★ Mur de clôture : conception et planche d'exécution | Concevoir un mur de clôture et lire sa planche d'exécution | L3.6.5, L3.6.3, L1.6.7 | 2 h | B A |
| L3.6.7 | Ossature en béton armé : coffrages et étaiement | Décrire la réalisation des poteaux, poutres et voiles | L3.6.5 | 1 h 30 | E C |
| L3.6.8 | Planchers : dalle pleine, hourdis, prédalles | Comparer les types de planchers et leur mise en œuvre | L3.6.7 | 1 h 30 | E B |
| L3.6.9 | ★ Escaliers : vocabulaire, tracé et escalier autoporteur | Tracer un escalier confortable (relation de Blondel) et nommer ses éléments | L3.6.8, N0.4.6 | 2 h | E A |
| L3.6.10 | Charpentes et couvertures en climat tropical `RDC` | Choisir une couverture et la protéger du vent et des pluies | L1.3.8 | 1 h 30 | E B |
| | **Ch. 2 — Second œuvre et équipements** | | | | |
| L3.6.11 | Étanchéité : terrasses, soubassements, pièces humides | Choisir un procédé d'étanchéité | L3.6.8 | 1 h 30 | B |
| L3.6.12 | Enduits, carrelages et revêtements | Décrire la mise en œuvre des revêtements courants | L3.6.5 | 1 h | C |
| L3.6.13 | Menuiseries, cloisons et faux plafonds | Situer les éléments de second œuvre et leurs interfaces | L3.6.5 | 1 h | C |
| L3.6.14 | Plomberie sanitaire du bâtiment | Tracer l'alimentation et l'évacuation d'un logement | L2.8.4 | 1 h 30 | B |
| L3.6.15 | Électricité du bâtiment et réservations | Coordonner les réseaux électriques avec la structure | — | 1 h | C |
| L3.6.16 | Confort en climat tropical : ventilation, soleil, humidité `RDC` | Concevoir une enveloppe adaptée au climat tropical | L3.6.10 | 1 h 30 | C |
| L3.6.17 | Sécurité incendie (principes) | Appliquer les principes de base de la sécurité incendie | L3.6.7 | 1 h | C |
| L3.6.P | Mini-projet : carnet de détails d'une maison R+1 | Dessiner les détails constructifs clés d'une maison | ∗ | 4 h | B E |
| L3.6.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L3.7 — Métré, quantitatifs et devis (DQE)
Prérequis module : L1.6, L3.6

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L3.7.1 | Le métré : rôle, vocabulaire et unités | Distinguer avant-métré, métré et attachement | L1.6.10 | 1 h | C D |
| L3.7.2 | Méthode de l'avant-métré | Décomposer un ouvrage en postes et métrer dans l'ordre | L3.7.1 | 1 h 30 | A B |
| L3.7.3 | Métré des terrassements et des fondations | Métrer fouilles, remblais, béton de propreté et semelles | L3.7.2 | 2 h | A B |
| L3.7.4 | Métré de la maçonnerie et des enduits | Métrer murs, ouvertures et enduits | L3.7.2 | 1 h 30 | A |
| L3.7.5 | Métré du béton et des coffrages | Métrer le béton et le coffrage d'une ossature | L3.7.2 | 1 h 30 | A |
| L3.7.6 | Quantitatif des aciers : nomenclature | Établir une nomenclature d'armatures et sa masse | L3.7.5, L2.6.13 | 2 h | A B |
| L3.7.7 | Des volumes aux matériaux : ciment, sable, gravier, eau | Convertir des volumes de béton et de mortier en matériaux | L2.6.8 | 1 h 30 | A C |
| L3.7.8 | Sous-détail de prix | Construire un prix unitaire : main-d'œuvre, matériaux, matériel, frais, marge | L3.7.7 | 2 h | A |
| L3.7.9 | Bordereau des prix et DQE | Établir un devis quantitatif et estimatif | L3.7.8 | 1 h 30 | A |
| L3.7.10 | Métré et devis au tableur | Automatiser un DQE dans un tableur | L3.7.9, L1.7.3 | 1 h 30 | A |
| L3.7.11 | Prix en RDC : coûts locaux, importations, aléas `RDC` | Adapter un prix aux réalités du marché local | L3.7.8 | 1 h | C |
| L3.7.P | Mini-projet : DQE du mur de clôture | Établir le DQE complet du mur de clôture de L3.6.6 | ∗ | 3 h | A B |
| L3.7.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L3.8 — Routes I : tracé, terrassements, cubatures
Prérequis module : L2.9, L3.4

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Géométrie de la route** | | | | |
| L3.8.1 | La route : fonctions, classes et composantes | Décrire les composantes d'une route et sa classification | — | 1 h | C E |
| L3.8.2 | Trafic et vitesse de référence | Relier trafic, vitesse et caractéristiques géométriques | L3.8.1 | 1 h 30 | A |
| L3.8.3 | Tracé en plan : alignements et courbes | Calculer une courbe circulaire et son raccordement progressif | L2.9.6 | 2 h | A B |
| L3.8.4 | Profil en long : déclivités et raccordements | Calculer un raccordement parabolique | L3.8.3 | 2 h | A B |
| L3.8.5 | Profil en travers : chaussée, accotements, dévers, fossés | Dessiner un profil en travers type | L3.8.4 | 1 h 30 | B |
| | **Ch. 2 — Terrassements et cubatures** | | | | |
| L3.8.6 | Terrassements : déblais, remblais, foisonnement, compactage | Prévoir le foisonnement et le compactage des terres | L3.4.7 | 1 h 30 | C E |
| L3.8.7 | ★ Volume de remblai d'une plateforme | Calculer pas à pas le volume de remblai d'une plateforme | L3.8.6, N0.5.3 | 2 h | A B |
| L3.8.8 | Cubatures par la méthode des profils | Calculer déblais et remblais entre profils en travers | L3.8.7 | 2 h | A |
| L3.8.9 | Mouvement des terres : épure de Brückner | Optimiser les transports de terre | L3.8.8 | 2 h | A |
| | **Ch. 3 — Routes en contexte tropical** | | | | |
| L3.8.10 | Routes en terre et en latérite `RDC` | Concevoir et entretenir une route en terre | L3.4.13 | 1 h 30 | C B |
| L3.8.11 | Drainage routier : fossés, buses, dalots, exutoires `RDC` | Concevoir le drainage d'une route | L3.5.13 | 1 h 30 | B |
| L3.8.12 | Pistes en zone minière `RDC` | Adapter le tracé et la structure aux engins miniers | L3.8.10 | 1 h 30 | C |
| L3.8.P | Mini-projet : avant-projet d'un kilomètre de route | Établir tracé en plan, profil en long et cubatures d'un tronçon | ∗ | 4 h | A B |
| L3.8.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### L3.9 — Construction métallique I
Prérequis module : L2.5, L2.6, L3.2

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| L3.9.1 | L'acier de construction : produits et usages | Choisir un profilé selon sa fonction | L2.6.14 | 1 h | C E |
| L3.9.2 | Bases de l'EC3 : coefficients γM et classes de sections | Déterminer la classe d'une section | L3.2.1 | 1 h 30 | A |
| L3.9.3 | Traction et compression des sections | Vérifier une barre tendue ou comprimée | L3.9.2 | 1 h 30 | A |
| L3.9.4 | Flexion et cisaillement des sections | Vérifier une poutre en flexion | L3.9.3 | 1 h 30 | A |
| L3.9.5 | Flambement des barres comprimées | Vérifier un poteau au flambement (courbes européennes) | L3.9.3, L2.5.8 | 2 h | A |
| L3.9.6 | Déversement des poutres (aperçu) | Expliquer et estimer le risque de déversement | L3.9.5 | 1 h 30 | A E |
| L3.9.7 | Assemblages boulonnés | Vérifier un assemblage boulonné simple | L3.9.3 | 2 h | A E |
| L3.9.8 | Assemblages soudés | Vérifier un cordon de soudure d'angle | L3.9.3 | 1 h 30 | A E |
| L3.9.9 | Conception d'un hangar métallique | Organiser portiques, pannes et contreventements | L3.9.4 | 1 h 30 | E B |
| L3.9.10 | Corrosion et incendie en climat tropical `RDC` | Choisir une protection anticorrosion et une protection au feu | L1.5.6 | 1 h | C |
| L3.9.P | Mini-projet : pannes et portique d'un hangar | Dimensionner les pannes et le portique d'un hangar | ∗ | 4 h | A B |
| L3.9.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

---

## M1 — Approfondissement

*But : concevoir des ouvrages complets et maîtriser les méthodes avancées de calcul.*

### M1.1 — Béton armé II
Prérequis module : L3.1, L3.3

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Sections et éléments** | | | | |
| M1.1.1 | Flexion composée | Calculer une section partiellement ou entièrement comprimée | L3.3.8 | 2 h | A |
| M1.1.2 | Poteaux élancés : effets du second ordre (EC2 §5.8) | Vérifier un poteau élancé | M1.1.1 | 2 h | A |
| M1.1.3 | Dalles portant dans deux directions | Calculer une dalle sur quatre appuis | L3.3.12 | 2 h | A B |
| M1.1.4 | Planchers à corps creux et poutrelles `FR` | Calculer une poutrelle de plancher à hourdis | L3.6.8, L3.3.8 | 1 h 30 | A B |
| M1.1.5 | Poutres continues de bâtiment `FR` | Calculer une poutre continue (EC2 et méthode forfaitaire du BAEL) | L3.1.13 | 2 h | A |
| M1.1.6 | Voiles en béton armé | Vérifier et ferrailler un voile | M1.1.1 | 1 h 30 | A E |
| M1.1.7 | Escalier en béton armé | Calculer la paillasse et le palier d'un escalier | L3.6.9, L3.3.12 | 2 h | A E |
| M1.1.8 | Torsion | Calculer les armatures de torsion d'une poutre | L3.3.10 | 1 h 30 | A |
| | **Ch. 2 — Fondations et ouvrages particuliers** | | | | |
| M1.1.9 | Semelles filantes et radiers | Dimensionner une semelle filante et un radier simple | L3.3.13 | 2 h | A B |
| M1.1.10 | Longrines et semelles excentrées | Équilibrer une semelle excentrée par une longrine | M1.1.9 | 1 h 30 | A B |
| M1.1.11 | Réservoirs en béton armé (aperçu) | Concevoir un réservoir étanche | M1.1.3 | 1 h 30 | A E |
| M1.1.12 | Plans d'exécution : coffrage, ferraillage, nomenclatures | Produire les plans d'exécution d'un élément | L3.3.11 | 2 h | B |
| M1.1.P | Mini-projet : dalle et escalier d'un R+2 | Rédiger la note de calcul et les plans d'une dalle et d'un escalier | ∗ | 4 h | A B E |
| M1.1.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### M1.2 — Béton précontraint
Prérequis module : M1.1

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M1.2.1 | Principe de la précontrainte | Expliquer pourquoi on précomprime le béton | L3.3.9 | 1 h 30 | C E |
| M1.2.2 | Pré-tension et post-tension | Décrire les deux technologies et leurs usages | M1.2.1 | 1 h 30 | E C |
| M1.2.3 | Contraintes en section et fuseau de passage | Placer le câble dans le fuseau de passage | M1.2.1 | 2 h | A B |
| M1.2.4 | Pertes instantanées | Calculer les pertes par frottement, recul d'ancrage et raccourcissement | M1.2.3 | 2 h | A |
| M1.2.5 | Pertes différées : retrait, fluage, relaxation | Estimer les pertes différées | M1.2.4 | 1 h 30 | A |
| M1.2.6 | Vérifications ELS et ELU | Vérifier une poutre précontrainte en service et à rupture | M1.2.5 | 2 h | A |
| M1.2.7 | Zones d'about et diffusion (aperçu) | Ferrailler une zone d'ancrage | M1.2.6 | 1 h 30 | A E |
| M1.2.8 | Applications : poutres de pont, dalles alvéolées | Situer les usages courants de la précontrainte | M1.2.6 | 1 h | C |
| M1.2.P | Mini-projet : poutre précontrainte par pré-tension | Vérifier une poutre préfabriquée | ∗ | 3 h | A |
| M1.2.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### M1.3 — Mécanique des sols II
Prérequis module : L2.1, L3.4

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Tassements** | | | | |
| M1.3.1 | Compressibilité : essai œdométrique | Interpréter une courbe œdométrique | L3.4.10 | 2 h | A |
| M1.3.2 | Consolidation | Calculer l'évolution d'un tassement dans le temps | M1.3.1, L2.1.7 | 2 h | A |
| M1.3.3 | Calcul des tassements | Calculer le tassement d'une couche compressible | M1.3.2, L3.4.11 | 2 h | A |
| | **Ch. 2 — Soutènements et pentes** | | | | |
| M1.3.4 | Cisaillement drainé et non drainé | Choisir les paramètres adaptés au court et au long terme | L3.4.12 | 1 h 30 | A |
| M1.3.5 | Poussée et butée : Rankine et Coulomb | Calculer la poussée des terres sur un écran | M1.3.4 | 2 h | A B |
| M1.3.6 | Murs de soutènement : stabilité externe | Vérifier un mur au glissement, au renversement et au poinçonnement | M1.3.5, L1.3.10 | 2 h | A B |
| M1.3.7 | Rideaux de palplanches et parois (aperçu) | Prédimensionner un rideau en console | M1.3.5 | 1 h 30 | A E |
| M1.3.8 | Stabilité des pentes : Fellenius et Bishop | Calculer le coefficient de sécurité d'un talus | M1.3.4 | 2 h | A B |
| M1.3.9 | Écoulements dans les sols : renard et gradient critique | Vérifier le risque de renard sous un ouvrage | L3.4.9 | 1 h 30 | A B |
| M1.3.10 | Érosion et ravines de Kinshasa `RDC` | Analyser une ravine et proposer des parades | M1.3.8 | 1 h 30 | C B |
| M1.3.P | Mini-projet : mur de soutènement en béton armé | Vérifier la stabilité externe et ferrailler le mur | ∗ | 4 h | A B |
| M1.3.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### M1.4 — Fondations superficielles et profondes
Prérequis module : L3.3, M1.3

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Fondations superficielles** | | | | |
| M1.4.1 | Choisir un type de fondation | Choisir une fondation selon le sol et la structure | L3.4.15 | 1 h 30 | C |
| M1.4.2 | Capacité portante des fondations superficielles (EC7) | Calculer la capacité portante d'une semelle | M1.3.4 | 2 h | A |
| M1.4.3 | Méthode pressiométrique `FR` | Calculer une semelle à partir d'essais pressiométriques | M1.4.2 | 2 h | A |
| M1.4.4 | Tassements des fondations superficielles | Vérifier les tassements absolus et différentiels | M1.3.3 | 2 h | A |
| M1.4.5 | Fonder sur argiles gonflantes et latérites `RDC` | Adapter les fondations aux sols gonflants | M1.4.4, L3.4.14 | 1 h 30 | C B |
| | **Ch. 2 — Fondations profondes** | | | | |
| M1.4.6 | Pieux : types et mise en œuvre | Choisir un type de pieu | M1.4.1 | 1 h 30 | E C |
| M1.4.7 | Capacité portante des pieux | Calculer la portance d'un pieu isolé | M1.4.6 | 2 h | A |
| M1.4.8 | Groupes de pieux et frottement négatif | Vérifier un groupe de pieux | M1.4.7 | 1 h 30 | A |
| M1.4.9 | Semelles sur pieux | Ferrailler une semelle sur pieux par la méthode des bielles | M1.4.8, L3.3.13 | 2 h | A B |
| M1.4.10 | Amélioration des sols (aperçu) | Situer les techniques d'amélioration des sols | M1.4.1 | 1 h | C |
| M1.4.P | Mini-projet : fondations d'un R+3 sur argile gonflante `RDC` | Choisir et dimensionner les fondations d'un immeuble | ∗ | 4 h | A B |
| M1.4.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### M1.5 — Construction métallique II
Prérequis module : L3.9

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M1.5.1 | Analyse globale : imperfections et second ordre | Choisir le type d'analyse d'un portique (EC3 §5) | L3.9.5 | 2 h | A |
| M1.5.2 | Flexion composée et interaction M-N | Vérifier un poteau comprimé et fléchi | M1.5.1 | 2 h | A |
| M1.5.3 | Déversement : vérification complète | Vérifier une poutre au déversement | L3.9.6 | 2 h | A |
| M1.5.4 | Assemblages : platines d'about et pieds de poteaux | Vérifier un pied de poteau articulé | L3.9.7 | 2 h | A E |
| M1.5.5 | Vent sur un hangar (EC1-1-4) ⚠ | Calculer les actions du vent sur un bâtiment industriel | L3.2.7 | 2 h | A B |
| M1.5.6 | Contreventements et stabilité d'ensemble | Concevoir le contreventement d'un hangar | M1.5.5 | 1 h 30 | E B |
| M1.5.7 | Construction mixte acier-béton (EC4, aperçu) | Situer le fonctionnement d'une poutre mixte | M1.5.2 | 1 h 30 | A E |
| M1.5.8 | Profils formés à froid (aperçu) | Situer l'usage des profils minces | L3.9.4 | 1 h | C |
| M1.5.9 | Plans d'atelier, montage et contrôle | Lire un plan d'atelier et organiser le montage | M1.5.4 | 1 h 30 | B |
| M1.5.P | Mini-projet : hangar métallique de 20 m de portée | Rédiger la note de calcul complète d'un hangar | ∗ | 5 h | A B |
| M1.5.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### M1.6 — Construction bois
Prérequis module : L2.6, L3.2

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M1.6.1 | Le bois, matériau de structure | Expliquer anisotropie, humidité, classes de service et durée de charge | L2.6.15 | 1 h 30 | C |
| M1.6.2 | Bases de l'EC5 : kmod, γM, classes de résistance | Calculer une résistance de calcul du bois | M1.6.1, L3.2.1 | 1 h 30 | A |
| M1.6.3 | Éléments tendus, comprimés et fléchis | Vérifier une solive et un poteau en bois | M1.6.2 | 2 h | A |
| M1.6.4 | Instabilités : flambement et déversement | Vérifier un élément élancé en bois | M1.6.3 | 1 h 30 | A |
| M1.6.5 | Assemblages : pointes, boulons, connecteurs | Vérifier un assemblage boulonné en bois | M1.6.3 | 2 h | A E |
| M1.6.6 | Charpentes traditionnelles et fermettes | Concevoir la charpente d'une maison | M1.6.5 | 1 h 30 | E B |
| M1.6.7 | Durabilité et essences tropicales `RDC` | Protéger le bois contre les termites et les champignons | M1.6.1 | 1 h | C |
| M1.6.P | Mini-projet : charpente bois d'une maison | Dimensionner fermes, pannes et assemblages | ∗ | 4 h | A B |
| M1.6.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### M1.7 — Dynamique des structures et parasismique
Prérequis module : L2.1, L3.1

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Dynamique** | | | | |
| M1.7.1 | Oscillateur à un degré de liberté | Calculer la période propre et la réponse libre amortie | L2.1.5 | 2 h | A |
| M1.7.2 | Vibrations forcées et résonance | Calculer le facteur d'amplification dynamique | M1.7.1 | 1 h 30 | A |
| M1.7.3 | Systèmes à plusieurs degrés de liberté : modes propres | Calculer les modes propres d'un bâtiment simple | M1.7.2, L1.4.6 | 2 h | A |
| | **Ch. 2 — Parasismique (EC8)** | | | | |
| M1.7.4 | Les séismes et la sismicité de l'Afrique centrale `RDC` ⚠ | Expliquer magnitude, intensité et aléa sismique du rift | L2.7.7 | 1 h 30 | C |
| M1.7.5 | Spectre de réponse (EC8) | Lire et construire un spectre de calcul | M1.7.3 | 2 h | A C |
| M1.7.6 | Méthode des forces latérales | Calculer et répartir l'effort sismique d'un bâtiment | M1.7.5 | 2 h | A |
| M1.7.7 | Analyse modale spectrale (principe) | Combiner les réponses modales | M1.7.6 | 1 h 30 | A |
| M1.7.8 | Conception parasismique | Appliquer régularité, contreventement et ductilité | M1.7.6 | 1 h 30 | C E |
| M1.7.9 | Dispositions constructives parasismiques en béton armé | Ferrailler les zones critiques et les nœuds | M1.7.8, L3.3.11 | 1 h 30 | B E |
| M1.7.10 | Maçonnerie chaînée en zone sismique | Concevoir une maison en maçonnerie chaînée | M1.7.8 | 1 h | E B |
| M1.7.P | Mini-projet : analyse sismique d'un R+3 à Bukavu `RDC` ⚠ | Mener une analyse simplifiée par forces latérales | ∗ | 4 h | A |
| M1.7.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### M1.8 — Méthode des éléments finis
Prérequis module : L2.3, L3.1

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M1.8.1 | L'idée des éléments finis | Expliquer la discrétisation d'une structure | L3.1.14 | 1 h 30 | C |
| M1.8.2 | Élément barre : rigidité et assemblage | Assembler la matrice de rigidité d'un treillis | M1.8.1 | 2 h | A |
| M1.8.3 | Élément poutre 2D | Construire la matrice d'un élément poutre | M1.8.2 | 2 h | A |
| M1.8.4 | Conditions aux limites et résolution | Imposer les appuis et résoudre K·u = F | M1.8.3 | 1 h 30 | A |
| M1.8.5 | Éléments plans : membranes et plaques (principes) | Situer les éléments 2D et leurs usages | M1.8.4 | 2 h | A |
| M1.8.6 | Maillage, convergence et erreurs | Juger la qualité d'un maillage | M1.8.5 | 1 h 30 | A |
| M1.8.7 | Programmer un treillis en Python | Coder une MEF de treillis et la tester | M1.8.4, L1.7.8 | 2 h | A |
| M1.8.8 | Utiliser un logiciel avec esprit critique | Repérer les erreurs de modélisation courantes | M1.8.6 | 1 h 30 | C |
| M1.8.P | Mini-projet : Cross, MEF Python et logiciel | Comparer trois calculs d'un même portique | ∗ | 4 h | A |
| M1.8.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### M1.9 — Chaussées : dimensionnement
Prérequis module : L3.4, L3.8

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M1.9.1 | Structure d'une chaussée | Nommer les couches et leur rôle | L3.8.5 | 1 h | E C |
| M1.9.2 | Trafic et agressivité des essieux | Calculer un trafic cumulé en essieux équivalents | M1.9.1 | 1 h 30 | A |
| M1.9.3 | Sol support et classes de plateforme | Classer une plateforme à partir du CBR | L3.4.8 | 1 h 30 | A |
| M1.9.4 | Méthode CBR | Dimensionner une chaussée souple par la méthode CBR | M1.9.3, M1.9.2 | 2 h | A |
| M1.9.5 | Méthode catalogue : guide CEBTP pour pays tropicaux `FR` ⚠ | Dimensionner avec un catalogue de structures | M1.9.4 | 2 h | A C |
| M1.9.6 | Matériaux de chaussée : latérite, GNT, grave-ciment, enrobés `RDC` | Choisir les matériaux de chaque couche | M1.9.1, L3.4.13 | 1 h 30 | C |
| M1.9.7 | Revêtements : enduits superficiels, enrobés, pavés | Choisir un revêtement selon le trafic et le budget | M1.9.6 | 1 h 30 | C E |
| M1.9.8 | Dégradations et entretien | Diagnostiquer une dégradation et choisir l'entretien | M1.9.7 | 1 h 30 | C |
| M1.9.9 | Chaussées sur sols gonflants et en zone tropicale `RDC` | Adapter la structure et le drainage au climat tropical | M1.9.8, L3.4.14 | 1 h 30 | C |
| M1.9.P | Mini-projet : chaussée d'une voie urbaine à Lubumbashi `RDC` | Dimensionner une chaussée et son drainage | ∗ | 4 h | A B |
| M1.9.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### M1.10 — Hydraulique urbaine : eau potable, assainissement, drainage
Prérequis module : L3.5

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Adduction et distribution d'eau** | | | | |
| M1.10.1 | Besoins en eau | Estimer les besoins et les débits de pointe d'une population | L2.2.1 | 1 h 30 | A |
| M1.10.2 | Captage et traitement (aperçu) | Décrire la filière de production d'eau potable | M1.10.1 | 1 h 30 | C |
| M1.10.3 | Adduction gravitaire et par refoulement | Dimensionner une conduite d'adduction | L3.5.4 | 2 h | A B |
| M1.10.4 | Réservoirs : capacité et implantation | Calculer la capacité d'un réservoir | M1.10.3 | 1 h 30 | A E |
| M1.10.5 | Réseaux de distribution | Dimensionner un réseau ramifié ou maillé | L3.5.3 | 2 h | A B |
| | **Ch. 2 — Assainissement** | | | | |
| M1.10.6 | Eaux usées : débits et systèmes | Calculer les débits d'eaux usées et choisir entre séparatif et unitaire | M1.10.1 | 1 h 30 | A |
| M1.10.7 | Collecteurs gravitaires | Dimensionner un collecteur et vérifier l'autocurage | L3.5.6 | 2 h | A B |
| M1.10.8 | Assainissement autonome `RDC` | Dimensionner une fosse septique et un puits perdu | M1.10.6 | 1 h 30 | A B |
| M1.10.9 | Traitement des eaux usées (aperçu) | Décrire une filière de traitement | M1.10.6 | 1 h | C |
| | **Ch. 3 — Eaux pluviales et VRD** | | | | |
| M1.10.10 | Eaux pluviales urbaines | Dimensionner caniveaux et collecteurs pluviaux | L3.5.11 | 2 h | A B |
| M1.10.11 | Lutte antiérosive en milieu urbain `RDC` | Concevoir un drainage qui protège contre le ravinement | M1.10.10, M1.3.10 | 1 h 30 | C B |
| M1.10.12 | VRD d'un lotissement | Coordonner la voirie et les réseaux d'un lotissement | M1.10.10 | 1 h 30 | B |
| M1.10.P | Mini-projet : réseaux d'un lotissement de 200 parcelles `RDC` | Concevoir eau potable, assainissement et drainage | ∗ | 5 h | A B |
| M1.10.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

---

## M2 — Spécialisation et projet

*But : traiter les grands ouvrages, piloter un projet et conduire un projet de bâtiment de bout en bout.*

### M2.1 — Ouvrages d'art (ponts)
Prérequis module : M1.1, M1.2, M1.4

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Conception et charges** | | | | |
| M2.1.1 | Typologie des ponts | Choisir un type de pont selon la portée et le site | M1.2.8 | 1 h 30 | C E |
| M2.1.2 | Concevoir un franchissement | Fixer l'implantation, le gabarit et le débouché hydraulique | L3.5.12 | 1 h 30 | B C |
| M2.1.3 | Charges routières (EC1-2) | Appliquer les modèles de charges de trafic | M2.1.1 | 2 h | A |
| M2.1.4 | Lignes d'influence appliquées aux ponts | Placer les charges pour obtenir les effets maximaux | L3.1.4, M2.1.3 | 2 h | A |
| | **Ch. 2 — Tabliers, appuis et petits ouvrages** | | | | |
| M2.1.5 | Pont-dalle en béton armé | Calculer un pont-dalle | M2.1.4 | 2 h | A B |
| M2.1.6 | Ponts à poutres : répartition transversale `FR` | Répartir les charges entre poutres (Courbon, Guyon-Massonnet) | M2.1.5 | 2 h | A |
| M2.1.7 | Appareils d'appui et joints de chaussée | Choisir et vérifier un appareil d'appui en élastomère fretté | M2.1.5 | 1 h 30 | E A |
| M2.1.8 | Piles, culées et fondations | Vérifier une culée et ses fondations | M1.4.7 | 2 h | A B |
| M2.1.9 | Ponts métalliques, mixtes et modulaires `RDC` | Situer les ponts métalliques et modulaires courants en RDC | M1.5.7 | 1 h 30 | C E |
| M2.1.10 | Dalots et buses | Dimensionner un dalot cadre | L3.8.11 | 2 h | A B |
| M2.1.11 | Inspection et entretien des ponts | Organiser une inspection | M2.1.7 | 1 h | C |
| M2.1.P | Mini-projet : pont-dalle de 15 m sur une rivière `RDC` | Établir l'avant-projet hydraulique, structurel et de fondation | ∗ | 5 h | A B |
| M2.1.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### M2.2 — Barrages et ouvrages hydrauliques
Prérequis module : L3.5, M1.3

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M2.2.1 | Types de barrages | Choisir un type de barrage selon le site | L2.7.6 | 1 h 30 | C E |
| M2.2.2 | Crue de projet et laminage | Calculer le laminage d'une crue par une retenue | L3.5.12 | 2 h | A |
| M2.2.3 | Barrage poids : stabilité | Vérifier le glissement, le renversement et les sous-pressions | M1.3.6 | 2 h | A B |
| M2.2.4 | Barrage en terre : filtres, drains, stabilité | Concevoir le profil et le drainage d'une digue en terre | M1.3.9, M1.3.8 | 2 h | A B |
| M2.2.5 | Évacuateurs de crues et dissipation d'énergie | Dimensionner un déversoir et un bassin de dissipation | L3.5.8 | 1 h 30 | A B |
| M2.2.6 | Digues à résidus miniers `RDC` | Expliquer les risques et la conception d'une digue à résidus | M2.2.4 | 1 h 30 | C B |
| M2.2.7 | Aménagements hydroélectriques `RDC` | Calculer la puissance d'une micro-centrale | M2.2.5 | 1 h 30 | A C |
| M2.2.8 | Protection des berges et digues fluviales | Concevoir une protection de berge | M2.2.4 | 1 h 30 | B |
| M2.2.9 | Auscultation et sécurité des barrages | Lire un dispositif d'auscultation | M2.2.3 | 1 h | C |
| M2.2.P | Mini-projet : petite retenue collinaire en terre | Prédimensionner la digue et l'évacuateur | ∗ | 4 h | A B |
| M2.2.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### M2.3 — Géotechnique avancée
Prérequis module : M1.3, M1.4, M1.8

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M2.3.1 | Programme de reconnaissance (EC7-2) | Définir un programme d'investigations adapté | L3.4.15 | 1 h 30 | C |
| M2.3.2 | Essais in situ : SPT, CPT, pressiomètre, plaque | Interpréter des essais in situ | M2.3.1 | 2 h | A |
| M2.3.3 | Comportement des sols et modèles de calcul | Choisir un modèle de comportement adapté | M1.3.4 | 2 h | A |
| M2.3.4 | Soutènements complexes : parois, tirants, clouage | Prédimensionner une paroi ancrée | M1.3.7 | 2 h | A E |
| M2.3.5 | Excavations et rabattement de nappe | Dimensionner un rabattement | M1.3.9 | 1 h 30 | A B |
| M2.3.6 | Géosynthétiques et sols renforcés | Dimensionner un remblai renforcé simple | M2.3.4 | 1 h 30 | E A |
| M2.3.7 | Géotechnique minière : fosses, verses, terrils `RDC` | Évaluer la stabilité d'une verse ou d'un talus de fosse | M1.3.8 | 1 h 30 | C B |
| M2.3.8 | Sols gonflants et effondrables : essais et parades `RDC` | Choisir des parades contre le gonflement et l'effondrement | L3.4.14 | 1 h 30 | A |
| M2.3.9 | Calcul géotechnique numérique (aperçu) | Situer les apports et les limites d'un calcul numérique | M1.8.6 | 1 h 30 | A |
| M2.3.P | Mini-projet : stabiliser un versant raviné `RDC` | Rédiger une note de stabilisation de versant | ∗ | 4 h | A B |
| M2.3.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 3 h | A |

### M2.4 — Pathologie et réhabilitation des ouvrages
Prérequis module : M1.1, M1.4

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M2.4.1 | La démarche de diagnostic | Mener un diagnostic, de l'observation à la conclusion | L1.5.7 | 1 h 30 | C |
| M2.4.2 | Lire les fissures | Relier une famille de fissures à sa cause probable | M2.4.1 | 2 h | C E |
| M2.4.3 | Corrosion des armatures : diagnostic et traitement | Évaluer et traiter une corrosion d'armatures | L1.5.6 | 1 h 30 | C E |
| M2.4.4 | Pathologies liées au sol `RDC` | Diagnostiquer tassements différentiels et gonflements | M1.4.5 | 1 h 30 | C E |
| M2.4.5 | Humidité et infiltrations | Traiter infiltrations et remontées capillaires | M2.4.1 | 1 h | C |
| M2.4.6 | Essais non destructifs | Choisir et interpréter un essai non destructif | M2.4.1 | 1 h 30 | A |
| M2.4.7 | Réparer et renforcer | Choisir une technique de réparation ou de renforcement | M2.4.3 | 2 h | A E |
| M2.4.8 | Reprise en sous-œuvre | Concevoir une reprise en sous-œuvre | M2.4.4 | 1 h 30 | E B |
| M2.4.9 | Surélever un bâtiment existant `RDC` | Vérifier la faisabilité d'une surélévation | M2.4.7 | 1 h 30 | A |
| M2.4.P | Mini-projet : diagnostic d'un bâtiment fissuré | Rédiger un rapport de diagnostic et de confortement | ∗ | 4 h | C A |
| M2.4.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### M2.5 — BIM
Prérequis module : L2.10, L3.7

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M2.5.1 | Le BIM : principes et maquette numérique | Expliquer ce que le BIM change dans un projet | L2.10.6 | 1 h | C |
| M2.5.2 | Formats et interopérabilité : IFC, BCF | Échanger une maquette entre logiciels | M2.5.1 | 1 h | C |
| M2.5.3 | Modéliser un bâtiment | Construire une maquette d'architecture et de structure | M2.5.2 | 2 h | E B |
| M2.5.4 | Coordination et détection de conflits | Détecter et traiter un conflit entre corps d'état | M2.5.3 | 1 h 30 | C |
| M2.5.5 | Quantités issues de la maquette | Extraire des quantités et les comparer au métré | M2.5.3, L3.7.9 | 1 h 30 | A |
| M2.5.6 | Convention BIM de projet | Rédiger les règles BIM d'un projet | M2.5.4 | 1 h | C |
| M2.5.P | Mini-projet : maquette structurelle et quantités | Modéliser une structure simple et en extraire le métré | ∗ | 4 h | E A |
| M2.5.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h 30 | A |

### M2.6 — Management de projet
Prérequis module : L1.1, L3.7

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M2.6.1 | Le projet : objectifs et contraintes | Expliquer l'équilibre entre coût, délai et qualité | L1.1.4 | 1 h | C |
| M2.6.2 | Découper un projet : organigramme des tâches | Décomposer un projet en tâches | M2.6.1 | 1 h 30 | A C |
| M2.6.3 | Diagramme de Gantt | Construire un Gantt avec durées et liens | M2.6.2 | 1 h 30 | A |
| M2.6.4 | Réseau PERT et chemin critique | Calculer les dates au plus tôt, au plus tard et le chemin critique | M2.6.3 | 2 h | A |
| M2.6.5 | Marges et méthode des potentiels | Calculer les marges totales et libres | M2.6.4 | 1 h 30 | A |
| M2.6.6 | Ressources, cadences et lissage | Équilibrer les ressources d'un planning | M2.6.5 | 1 h 30 | A |
| M2.6.7 | Suivi d'avancement et gestion des risques | Mesurer l'avancement et gérer les risques | M2.6.6 | 1 h 30 | A C |
| M2.6.8 | Planifier avec la saison des pluies `RDC` | Intégrer les intempéries au planning | M2.6.4 | 1 h | A C |
| M2.6.P | Mini-projet : planning d'un R+3 | Construire le PERT et le Gantt d'un immeuble | ∗ | 3 h | A |
| M2.6.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### M2.7 — Économie de la construction
Prérequis module : L3.7

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M2.7.1 | Coût global d'un ouvrage | Calculer le coût global : investissement, exploitation, entretien | L3.7.9 | 1 h 30 | A |
| M2.7.2 | Estimer par ratios | Estimer un projet par ratios selon la phase d'étude | M2.7.1 | 1 h 30 | A |
| M2.7.3 | Actualisation, révision des prix, change `RDC` | Réviser un prix par une formule paramétrique | M2.7.1 | 1 h 30 | A |
| M2.7.4 | Rentabilité : VAN, TRI, analyse coût-bénéfice | Calculer la VAN et le TRI d'un projet | M2.7.3 | 2 h | A |
| M2.7.5 | Trésorerie de chantier et situations de travaux | Établir une situation de travaux et un plan de trésorerie | M2.7.1 | 1 h 30 | A |
| M2.7.6 | Optimiser la conception : analyse de la valeur | Comparer des variantes par leur coût et leur valeur | M2.7.2 | 1 h | C |
| M2.7.P | Mini-projet : bilan économique d'un immeuble de rapport | Estimer le coût et la rentabilité d'un immeuble | ∗ | 3 h | A |
| M2.7.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### M2.8 — Marchés et contrats
Prérequis module : L1.1, L3.7

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M2.8.1 | Commande publique et commande privée | Distinguer les modes de passation des marchés | L1.1.2 | 1 h | C |
| M2.8.2 | Le dossier d'appel d'offres | Identifier et analyser les pièces d'un dossier d'appel d'offres | M2.8.1 | 1 h 30 | C |
| M2.8.3 | CCAP, CCTP et spécifications techniques | Rédiger un article de CCTP | M2.8.2 | 1 h 30 | C |
| M2.8.4 | Répondre à un appel d'offres, analyser les offres | Évaluer et classer des offres | M2.8.2 | 1 h 30 | A C |
| M2.8.5 | Contrats FIDIC : livres rouge, jaune et argent | Choisir le modèle FIDIC adapté à un projet | M2.8.1 | 2 h | C |
| M2.8.6 | L'Ingénieur FIDIC, réclamations et litiges | Instruire une réclamation selon les clauses FIDIC | M2.8.5 | 1 h 30 | C |
| M2.8.7 | Avenants, pénalités, garanties et cautions | Calculer des pénalités de retard et une retenue de garantie | M2.8.3 | 1 h 30 | C A |
| M2.8.8 | Marchés publics en RDC et bailleurs de fonds `RDC` ⚠ | Situer le cadre des marchés publics en RDC | M2.8.1 | 1 h | C |
| M2.8.P | Mini-projet : offre technique pour un appel d'offres | Analyser un dossier et rédiger une offre technique | ∗ | 3 h | C |
| M2.8.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 2 h | A |

### M2.9 — HSE et sécurité de chantier
Prérequis module : L3.6

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M2.9.1 | Principes de prévention et responsabilités | Appliquer les principes généraux de prévention | — | 1 h | C |
| M2.9.2 | Analyse des risques et plan HSE | Évaluer des risques et rédiger un plan HSE | M2.9.1 | 1 h 30 | C A |
| M2.9.3 | Travail en hauteur et échafaudages | Prévenir les chutes de hauteur | M2.9.2 | 1 h 30 | E C |
| M2.9.4 | Fouilles et risque d'ensevelissement | Sécuriser une fouille | M2.9.2 | 1 h | E C |
| M2.9.5 | Levage, engins et circulation | Organiser la circulation et le levage | M2.9.2 | 1 h | C |
| M2.9.6 | Électricité, incendie et produits dangereux | Prévenir les risques électriques et chimiques | M2.9.2 | 1 h | C |
| M2.9.7 | Santé au travail : EPI, chaleur, paludisme `RDC` | Protéger la santé des équipes en climat tropical | M2.9.1 | 1 h | C |
| M2.9.8 | Accident : réagir, analyser, prévenir | Analyser un accident par l'arbre des causes | M2.9.2 | 1 h | C |
| M2.9.P | Mini-projet : plan HSE d'un chantier R+3 | Rédiger le plan HSE d'un chantier | ∗ | 3 h | C |
| M2.9.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h 30 | A |

### M2.10 — Environnement et études d'impact
Prérequis module : L3.5, L3.8

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| M2.10.1 | Développement durable et construction | Situer les enjeux environnementaux du BTP | — | 1 h | C |
| M2.10.2 | L'étude d'impact environnemental et social | Décrire les étapes d'une EIES | M2.10.1 | 1 h 30 | C |
| M2.10.3 | Impacts des chantiers | Identifier bruit, poussières, rejets et déchets d'un chantier | M2.10.2 | 1 h | C |
| M2.10.4 | Plan de gestion environnementale et sociale | Rédiger des mesures d'atténuation | M2.10.3 | 1 h 30 | C |
| M2.10.5 | Bilan carbone d'un ouvrage | Estimer l'ordre de grandeur des émissions d'un ouvrage | L3.7.7 | 1 h 30 | A |
| M2.10.6 | Cadre environnemental en RDC et normes des bailleurs `RDC` ⚠ | Situer les exigences congolaises et internationales | M2.10.2 | 1 h | C |
| M2.10.7 | Réinstallation et consultation des populations | Organiser une consultation publique | M2.10.4 | 1 h | C |
| M2.10.P | Mini-projet : matrice d'impacts d'une route rurale `RDC` | Évaluer les impacts d'un projet routier | ∗ | 3 h | C |
| M2.10.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h 30 | A |

### M2.11 — Projet de fin d'études guidé : bâtiment R+3
Prérequis module : L3.7, M1.1, M1.4, M1.7, M2.6

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| | **Ch. 1 — Conception** | | | | |
| M2.11.1 | Le projet : programme et cahier des charges | Analyser le programme d'un immeuble R+3 | — | 1 h | C B |
| M2.11.2 | Esquisse et avant-projet : plans d'architecture | Produire les plans d'architecture | L1.6.10 | 3 h | B |
| M2.11.3 | Conception structurale : trame, système porteur, joints | Choisir le système porteur et la trame | M2.11.2 | 2 h | B E |
| M2.11.4 | Étude de sol et choix des fondations | Exploiter un rapport de sol pour choisir les fondations | M1.4.1 | 2 h | A C |
| | **Ch. 2 — Notes de calcul** | | | | |
| M2.11.5 | Hypothèses de calcul et descente de charges | Fixer les hypothèses et descendre les charges | L3.2.9 | 3 h | A C |
| M2.11.6 | Prédimensionnement | Prédimensionner dalles, poutres et poteaux | M2.11.5 | 2 h | A |
| M2.11.7 | Planchers et dalles | Calculer les planchers | M1.1.4, M2.11.6 | 3 h | A B |
| M2.11.8 | Poutres et portiques sous vent et séisme | Calculer le contreventement sous vent et séisme | M1.7.6, M2.11.6 | 4 h | A |
| M2.11.9 | Poteaux et voiles | Calculer et ferrailler les poteaux et les voiles | M1.1.2, M2.11.8 | 3 h | A |
| M2.11.10 | Escalier | Calculer l'escalier | M1.1.7 | 2 h | A E |
| M2.11.11 | Fondations | Calculer les fondations | M1.4.4, M2.11.9 | 3 h | A B |
| | **Ch. 3 — Dossier d'exécution et pilotage** | | | | |
| M2.11.12 | Plans d'exécution : coffrage et ferraillage | Produire les plans d'exécution | M1.1.12 | 4 h | B |
| M2.11.13 | Réseaux : plomberie, assainissement, eaux pluviales | Concevoir les réseaux du bâtiment | M1.10.8 | 2 h | B |
| M2.11.14 | Rédiger la note de calcul | Assembler une note de calcul complète et vérifiable | PP.6.1 | 2 h | A |
| M2.11.15 | Métré, DQE et devis | Établir le devis estimatif complet | L3.7.9 | 3 h | A |
| M2.11.16 | Planning d'exécution | Établir le planning des travaux | M2.6.4 | 2 h | A |
| M2.11.17 | Préparer la soutenance | Présenter et défendre son projet | M2.11.14 | 1 h 30 | C |
| M2.11.P | Dossier final du projet | Assembler le dossier complet : plans, notes de calcul, devis, planning | ∗ | 6 h | A B C |
| M2.11.EX | Soutenance simulée | Répondre aux questions d'un jury | ∗ | 2 h | C |

---

## PP — Pratique professionnelle

*But : passer de l'école au chantier et au bureau d'études. Chaque module s'ouvre dès que ses prérequis sont validés ; PP.8 est accessible dès la L1. Les dossiers étudiés sont des cas réalistes reconstitués, pas des documents réels.*

### PP.1 — Conduite de travaux
Prérequis module : L3.6, M2.6

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| PP.1.1 | Le conducteur de travaux | Décrire les missions et la journée d'un conducteur de travaux | L1.1.3 | 1 h | C |
| PP.1.2 | Préparer un chantier : installation et méthodes | Dessiner un plan d'installation de chantier | L3.6.1 | 1 h 30 | B C |
| PP.1.3 | Engins de terrassement : choix et rendements | Calculer le rendement d'un atelier de terrassement | L3.8.6 | 1 h 30 | A |
| PP.1.4 | Approvisionner un chantier enclavé `RDC` | Planifier les approvisionnements d'un chantier isolé | PP.1.2 | 1 h 30 | A C |
| PP.1.5 | Équipes, cadences et sous-traitants | Calculer des cadences et des effectifs | PP.1.2 | 1 h 30 | A |
| PP.1.6 | Réunions, journal et comptes rendus | Tenir un journal de chantier et rédiger un compte rendu | PP.1.1 | 1 h | C |
| PP.1.7 | Organiser un bétonnage | Organiser coffrage, ferraillage et coulage d'une dalle | L3.6.7 | 1 h 30 | C E |
| PP.1.8 | Suivre les coûts et les délais | Comparer le prévu et le réalisé, puis réagir | M2.7.5 | 1 h 30 | A |
| PP.1.9 | Le chantier en saison des pluies `RDC` | Protéger le chantier et adapter les méthodes | PP.1.2 | 1 h | C |
| PP.1.P | Mini-projet : démarrer un chantier | Préparer l'installation et le planning des trois premières semaines | ∗ | 3 h | B A |
| PP.1.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h 30 | A |

### PP.2 — Implantation des ouvrages
Prérequis module : L2.9

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| PP.2.1 | Principes : repères et polygonale de base | Mettre en place un canevas d'implantation | L2.9.1 | 1 h 30 | B |
| PP.2.2 | Implanter un bâtiment : chaises et cordeaux | Implanter les axes d'un bâtiment au ruban et à l'équerre | PP.2.1 | 1 h 30 | E B |
| PP.2.3 | Implanter par coordonnées à la station totale | Calculer et implanter des points par rayonnement | PP.2.1 | 1 h 30 | A B |
| PP.2.4 | Implanter les niveaux | Reporter un niveau de référence sur le chantier | L1.8.4 | 1 h | A |
| PP.2.5 | Implanter une route : axe, courbes, profils | Calculer les points d'implantation d'une courbe | L3.8.3 | 2 h | A B |
| PP.2.6 | Contrôles et tolérances | Contrôler une implantation | PP.2.3 | 1 h | A |
| PP.2.P | Mini-projet : carnet d'implantation d'un R+3 | Préparer le carnet d'implantation d'un immeuble | ∗ | 3 h | A B |
| PP.2.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h 30 | A |

### PP.3 — Contrôle qualité et essais
Prérequis module : L2.6, L3.4

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| PP.3.1 | Plan d'assurance qualité et points d'arrêt | Définir les contrôles et les points d'arrêt d'un chantier | — | 1 h | C |
| PP.3.2 | Le cône d'Abrams sur chantier | Réaliser et interpréter un essai d'affaissement | L2.6.7 | 1 h | A E |
| PP.3.3 | Éprouvettes de béton | Confectionner, conserver et interpréter des éprouvettes | L2.6.9 | 1 h 30 | A |
| PP.3.4 | Granulométrie au laboratoire de chantier | Réaliser une analyse granulométrique | L2.6.5 | 1 h 30 | A |
| PP.3.5 | Proctor et contrôle du compactage en place | Vérifier un compactage par mesure de densité en place | L3.4.7 | 1 h 30 | A |
| PP.3.6 | CBR et essai de plaque | Contrôler la portance d'une plateforme | L3.4.8 | 1 h 30 | A |
| PP.3.7 | Contrôler les armatures avant bétonnage | Contrôler un ferraillage avant coulage | L3.3.11 | 1 h | E C |
| PP.3.8 | Contrôler les couches de chaussée | Contrôler épaisseurs, compacité et enrobés | M1.9.7 | 1 h | A |
| PP.3.9 | Traiter les non-conformités | Traiter une non-conformité | PP.3.1 | 1 h | C |
| PP.3.P | Mini-projet : dossier qualité d'une dalle | Constituer le dossier qualité d'un bétonnage | ∗ | 3 h | A C |
| PP.3.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h 30 | A |

### PP.4 — Réception des ouvrages
Prérequis module : M2.8

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| PP.4.1 | La réception : définition et effets | Expliquer les effets juridiques de la réception | M2.8.7 | 1 h | C |
| PP.4.2 | Opérations préalables et réserves | Rédiger une liste de réserves | PP.4.1 | 1 h | C |
| PP.4.3 | Les garanties après réception `FR` ⚠ | Distinguer garanties de parfait achèvement, biennale et décennale | PP.4.1 | 1 h | C |
| PP.4.4 | DOE et plans de récolement | Constituer le dossier des ouvrages exécutés | PP.4.2 | 1 h | B |
| PP.4.5 | Réceptions provisoire et définitive : FIDIC et RDC `RDC` ⚠ | Conduire une réception dans un marché FIDIC | M2.8.5 | 1 h | C |
| PP.4.P | Mini-projet : PV de réception avec réserves | Rédiger un PV de réception à partir d'une visite | ∗ | 2 h | C |
| PP.4.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h | A |

### PP.5 — Lire de vrais dossiers de plans
Prérequis module : L1.6, L3.3

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| PP.5.1 | Méthode de lecture d'un dossier complet | Parcourir un dossier dans le bon ordre | L1.6.9 | 1 h | C B |
| PP.5.2 | Le dossier d'une villa | Lire l'architecture et la structure d'une villa | PP.5.1 | 2 h | B |
| PP.5.3 | Le dossier d'un immeuble R+3 | Lire le coffrage et le ferraillage d'un immeuble | PP.5.2, L3.3.11 | 2 h | B |
| PP.5.4 | Un dossier routier | Lire le plan, le profil en long et les profils en travers | L3.8.5 | 2 h | B |
| PP.5.5 | Un dossier de réseaux | Lire un plan d'assainissement et d'eau potable | M1.10.7 | 1 h 30 | B |
| PP.5.6 | Repérer les incohérences entre plans | Détecter les conflits entre plans d'architecture et de structure | PP.5.3 | 1 h 30 | B |
| PP.5.P | Mini-projet : analyse critique d'un dossier | Rédiger la liste commentée des anomalies d'un dossier | ∗ | 3 h | B |
| PP.5.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h 30 | A |

### PP.6 — Notes de calcul et rapports
Prérequis module : L3.3

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| PP.6.1 | Structure d'une note de calcul | Organiser une note de calcul vérifiable | L3.2.9 | 1 h 30 | A |
| PP.6.2 | Hypothèses, références et traçabilité | Justifier chaque hypothèse par sa référence | PP.6.1 | 1 h | C |
| PP.6.3 | Rapport technique et rapport de stage | Structurer un rapport technique | — | 1 h 30 | C |
| PP.6.4 | Compte rendu de visite et rapport d'expertise | Rédiger un constat factuel | PP.6.3 | 1 h | C |
| PP.6.5 | Écrire clair : style, figures, tableaux | Rédiger des phrases, des figures et des tableaux lisibles | — | 1 h | C |
| PP.6.6 | Présenter oralement un projet | Préparer une présentation technique | PP.6.5 | 1 h | C |
| PP.6.P | Mini-projet : note de calcul d'une poutre | Rédiger une note de calcul complète | ∗ | 2 h | A |
| PP.6.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h | A |

### PP.7 — Déontologie et responsabilité
Prérequis module : L1.1

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| PP.7.1 | Éthique de l'ingénieur | Placer la sécurité du public avant toute autre considération | — | 1 h | C |
| PP.7.2 | Les responsabilités de l'ingénieur ⚠ | Distinguer responsabilités civile, pénale et professionnelle | PP.7.1 | 1 h | C |
| PP.7.3 | Intégrité : conflits d'intérêts et corruption `RDC` | Réagir face à une pression ou à une offre de corruption | PP.7.1 | 1 h | C |
| PP.7.4 | Leçons des effondrements | Tirer les leçons d'effondrements documentés | PP.7.1 | 1 h 30 | C |
| PP.7.P | Mini-projet : un dilemme éthique | Argumenter une décision face à un dilemme professionnel | ∗ | 1 h 30 | C |
| PP.7.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 1 h | A |

### PP.8 — Devenir ingénieur civil
Prérequis module : —

| ID | Leçon | Objectif | Prérequis | Durée | Gab. |
|---|---|---|---|---|---|
| PP.8.1 | Le parcours : système LMD et diplôme d'ingénieur ⚠ | Situer les diplômes et les voies d'accès au métier | — | 45 min | C |
| PP.8.2 | Stages : trouver, réussir, valoriser | Préparer et valoriser un stage | — | 1 h | C |
| PP.8.3 | CV, lettre et entretien dans le BTP | Rédiger un CV et préparer un entretien | — | 1 h | C |
| PP.8.4 | L'ordre professionnel et l'exercice légal ⚠ | Connaître les conditions d'inscription et d'exercice | PP.8.1 | 1 h | C |
| PP.8.5 | Anglais technique du BTP | Comprendre le vocabulaire anglais d'un chantier et d'un contrat | — | 1 h 30 | C D |
| PP.8.6 | Se spécialiser et se former toute sa vie | Bâtir son plan de formation continue | PP.8.4 | 45 min | C |
| PP.8.P | Mini-projet : mon plan de carrière à cinq ans | Construire un plan de carrière réaliste | ∗ | 1 h | C |
| PP.8.EX | Examen du module | Valider le module (seuil 70 %) | ∗ | 30 min | A |
