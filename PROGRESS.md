# Avancement

**Phase en cours :** 4 (contenu module par module). Modules L1.2 à L1.5 terminés (enchaînés à la demande de l'utilisateur) ; attendre « continue » pour L1.6.

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Niveau N0 complet (N0.1 à N0.7) ; L1.1 (introduction), L1.2 (analyse), L1.3 (statique), L1.4 (algèbre linéaire).
- L1.5 Chimie des matériaux : 9 leçons, mini-projet (fiche d'analyse d'une dégradation), examen ; calculs `lib/calc/chimie.ts` (masses molaires, équilibrage, stœchiométrie, pH, Bogue, hydratation, chaux et plâtre, Faraday, carbonatation, classes XA, adjuvants, analyse d'eau) ; 8 fiches (`components/calculs/chimie.tsx`) ; schémas et vue 3D dans `components/schemas/Chimie.tsx`.
- `<FicheCalcul depart={…}>` : une fiche peut repartir de valeurs propres à une leçon.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L1.5 tiennent en A4.
- 271 tests au vert, build au vert.

**Prochaine étape :** module L1.6.

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27, 34 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 à 33, 35 à 40 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
