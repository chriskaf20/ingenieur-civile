# Avancement

**Phase en cours :** 4 (contenu module par module). Modules L1.2, L1.3 et L1.4 terminés ; L1.5 enchaîné à la demande de l'utilisateur.

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Niveau N0 complet (N0.1 à N0.7), L1.1 (introduction), L1.2 (analyse), L1.3 (statique).
- L1.4 Algèbre linéaire : 7 leçons, mini-projet (treillis résolu par matrices), examen ; calculs `lib/calc/lineaire.ts` (produit, Gauss pas à pas, déterminant, inverse, rang, rotations, valeurs propres, K u = F) ; 8 fiches (`components/calculs/lineaire.tsx`) ; schémas et vue 3D dans `components/schemas/Lineaire.tsx` ; composant `<Matrice>` (pedago) disponible dans toutes les leçons.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L1.4 tiennent en A4.
- 253 tests au vert, build au vert.

**Prochaine étape :** module L1.5 (chimie des matériaux).

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27, 34 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 à 33 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
