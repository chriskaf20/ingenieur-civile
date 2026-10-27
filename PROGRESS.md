# Avancement

**Phase en cours :** plage demandée « L1.3 à L1.8 » terminée (schémas de L1.3 à L1.5 enrichis ; L1.6, L1.7 et L1.8 rédigés). En attente de la consigne suivante.

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Phase 4 : N0.1 à N0.7 et L1.1 à L1.8 complets (leçons, mini-projets, examens) ; leçons vitrines L3.3, L3.6, L3.8.
- Schémas : `Diagrammes.tsx`, `PoutreModele.tsx`, `Projections.tsx` (trois vues, isométrie, cavalière), `Logement.tsx` (plan, façade, coupe d'un même modèle). N0.1 : 58 figures ; L1.3 : 143 ; L1.4 : 67 ; L1.5 : 72 ; L1.6 : 159 ; L1.7 : 81 (moteur de tableur `lib/calc/tableur.ts`) ; L1.8 : 67 (`Topographie.tsx`) ; aucune page de cours, d'erreurs ou de terrain sans figure dans ces modules.
- `<FicheCalcul depart={…}>` : une fiche peut repartir de valeurs propres à une leçon.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L1.8 tiennent en A4.
- 313 tests au vert, build au vert.

**Prochaine étape :** au choix de l'utilisateur : schémas de N0.2 à N0.7, L1.1 et L1.2 (encore peu illustrés), ou rédaction du niveau L2.

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27, 34, 44, 45, 49 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 à 33, 35 à 43, 46 à 48 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
