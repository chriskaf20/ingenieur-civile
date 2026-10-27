# Avancement

**Phase en cours :** rédaction du niveau L2 (L2.1 à L2.10), modules enchaînés. L2.1 terminé.

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Phase 4 : N0.1 à N0.7, L1.1 à L1.8 et L2.1 complets (leçons, mini-projets, examens) ; leçons vitrines L3.3, L3.6, L3.8.
- Schémas : `Diagrammes.tsx`, `PoutreModele.tsx`, `Projections.tsx`, `Logement.tsx`, `Topographie.tsx`, `EquaDiff.tsx` (L2.1 : 70 figures) ; aucune page de cours, d'erreurs ou de terrain sans figure de L1.3 à L2.1.
- `<FicheCalcul depart={…}>` : une fiche peut repartir de valeurs propres à une leçon.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L2.1 tiennent en A4.
- 320 tests au vert, build au vert.

**Prochaine étape :** L2.2 Probabilités et statistiques, puis L2.3 à L2.10.

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27, 34, 44, 45, 49, 50 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 à 33, 35 à 43, 46 à 48, 51 à 53 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
