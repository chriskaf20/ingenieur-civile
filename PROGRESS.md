# Avancement

**Phase en cours :** rédaction du niveau L2 (L2.1 à L2.10). Plage demandée L2.4–L2.6 terminée ; L2.1 à L2.6 complets. En attente de la consigne suivante.

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Phase 4 : N0.1 à N0.7, L1.1 à L1.8, L2.1 à L2.6 complets (leçons, mini-projets, examens) ; leçons vitrines L3.3, L3.6, L3.8.
- Schémas : `EquaDiff.tsx` (L2.1 : 70 figures), `Probas.tsx` (L2.2 : 86), `Numerique.tsx` (L2.3 : 70), `Rdm1.tsx` (L2.4 : 106), `Rdm2.tsx` (L2.5 : 91), `Materiaux2.tsx` (L2.6 : 173) ; aucune page de cours, d’erreurs ou de terrain sans figure de L1.3 à L2.6.
- `<FicheCalcul depart={…}>` : une fiche peut repartir de valeurs propres à une leçon. Page Objectifs : prérequis sur deux colonnes au-delà de 10 entrées.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L2.6 tiennent en A4.
- 378 tests au vert, build au vert.

**Prochaine étape :** au choix de l'utilisateur : L2.7 Géologie de l'ingénieur, puis L2.8 à L2.10.

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27, 34, 44, 45, 49, 50, 55, 65, 66, 68, 75, 79, 80, 83, 87 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 à 33, 35 à 43, 46 à 48, 51 à 54, 56 à 64, 67, 69 à 74, 76 à 78, 81, 82, 84 à 86 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
