# Avancement

**Phase en cours :** enrichissement en schémas terminé pour N0.1, L1.3, L1.4 et L1.5. Rédaction de L1.6 à L1.8 demandée, mais en pause à la demande de l'utilisateur (2026-10-27) : attendre son feu vert.

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Phase 4 : N0.1 à N0.7 et L1.1 à L1.5 complets (leçons, mini-projets, examens) ; leçons vitrines L1.6.5, L3.3, L3.6, L3.8.
- Schémas : `components/drawing/Diagrammes.tsx` (flux, cycle, comparaison, barres) et `PoutreModele.tsx` (poutre, appuis, charges, réactions, cotes). N0.1 : 12 → 58 figures ; L1.3 : 29 → 143 (`StatiqueCours1-3.tsx`) ; L1.4 : 19 → 67 (`LineaireCours1-2.tsx`) ; L1.5 : 20 → 72 (`ChimieCours1-2.tsx`) ; dans ces modules, plus aucune page de cours, d'erreurs ou de terrain sans figure.
- `<FicheCalcul depart={…}>` : une fiche peut repartir de valeurs propres à une leçon.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L1.5 tiennent en A4.
- 271 tests au vert, build au vert.

**Prochaine étape :** sur feu vert de l'utilisateur, rédiger L1.6 (compléter autour de L1.6.5), L1.7 et L1.8, avec beaucoup de schémas dès la rédaction.

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27, 34 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 à 33, 35 à 40 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
