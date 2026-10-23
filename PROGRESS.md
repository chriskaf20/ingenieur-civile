# Avancement

**Phase en cours :** 4 (contenu module par module). Module N0.4 terminé, en attente de « continue ».

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- N0.1 Méthode de travail, N0.2 Algèbre et fonctions, N0.3 Unités et ordres de grandeur : leçons, mini-projets, examens.
- N0.4 Trigonométrie : 6 leçons, mini-projet (ferme en W), examen ; calculs `lib/calc/trigo.ts` ; 7 fiches interactives (`components/calculs/trigo.tsx`) ; schémas et vues 3D `components/schemas/Trigo.tsx` ; planche « profil en travers ».
- Contrôle `postbuild` (`scripts/verifier-ids.mjs`) : le build échoue si une page définit deux fois un motif SVG (hachures perdues dans le lecteur paginé) ; défaut corrigé dans L3.8.7 et N0.4.3.
- Contrôle A4 automatisé (Chrome headless) : toutes les feuilles de N0.1 à N0.4 tiennent en A4, aucune erreur console.
- 120 tests au vert, build au vert (115 pages).

**Prochaine étape :** module N0.5 (géométrie plane et dans l'espace).

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
