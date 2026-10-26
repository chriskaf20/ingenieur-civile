# Avancement

**Phase en cours :** enrichissement en schémas de tout le contenu existant (demande utilisateur), module par module dans l'ordre du parcours, arrêt après chaque module. N0.1 terminé ; attendre « continue » pour N0.2.

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Phase 4 : N0.1 à N0.7 et L1.1 à L1.5 complets (leçons, mini-projets, examens) ; leçons vitrines L1.6, L3.3, L3.6, L3.8.
- Schémas : diagrammes génériques `components/drawing/Diagrammes.tsx` (flux, cycle, comparaison, barres ; espace insécable = pas de coupure). N0.1 : 12 → 58 figures, plus aucune page de cours, d'erreurs ou de terrain sans figure.
- `<FicheCalcul depart={…}>` : une fiche peut repartir de valeurs propres à une leçon.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L1.5 tiennent en A4.
- 271 tests au vert, build au vert.

**Prochaine étape :** schémas de N0.2, puis N0.3 à L1.5 et les leçons vitrines ; ensuite le module L1.6.

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27, 34 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 à 33, 35 à 40 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
