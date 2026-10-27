# Avancement

**Phase en cours :** rédaction de L1.6 à L1.8 (demande utilisateur), modules enchaînés avec build, tests, A4, commit et push après chacun. Schémas de N0.1 et L1.3 à L1.5 enrichis ; L1.6 et L1.7 terminés ; en cours : L1.8.

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Phase 4 : N0.1 à N0.7 et L1.1 à L1.7 complets (leçons, mini-projets, examens) ; leçons vitrines L3.3, L3.6, L3.8.
- Schémas : `Diagrammes.tsx`, `PoutreModele.tsx`, `Projections.tsx` (trois vues, isométrie, cavalière) et `Logement.tsx` (plan, façade, coupe tirés d'un même modèle). N0.1 : 58 figures ; L1.3 : 143 ; L1.4 : 67 ; L1.5 : 72 ; L1.6 : 159 (`DessinCours1-4.tsx`) ; L1.7 : 81 (`InfoCours1-2.tsx`, moteur de tableur `lib/calc/tableur.ts`) ; aucune page de cours, d'erreurs ou de terrain sans figure dans ces modules.
- `<FicheCalcul depart={…}>` : une fiche peut repartir de valeurs propres à une leçon.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L1.7 tiennent en A4.
- 303 tests au vert, build au vert.

**Prochaine étape :** rédiger L1.8 (topographie I), avec beaucoup de schémas dès la rédaction.

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27, 34, 44, 45 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 à 33, 35 à 43, 46 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
