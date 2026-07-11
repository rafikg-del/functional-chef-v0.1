---
name: agent-cours-didactiques
description: Agent auto-test et auto-correction pour la création de cours didactiques et du moteur Functional Chef. Utiliser quand l'utilisateur demande de valider, tester ou corriger automatiquement un agent, un cours didactique, ou le pipeline nutritionnel jusqu'à ce que tout soit fonctionnel.
---

# Agent cours didactiques — Test & correction automatique

## Objectif

Boucler **test → diagnostic → correction → re-test** jusqu'à obtenir un rapport **« Tout est OK »**.

## Workflow obligatoire

1. **Lancer la validation**
   ```bash
   npm run validate
   ```
   Ou avec vérification TypeScript :
   ```bash
   npm run agent:validate
   ```

2. **Si exit code ≠ 0** — lire le rapport et les `fix_hint` :
   - Échecs `classifier.*` → `src/lib/reasoning/bottleneck-classifier.ts` ou `src/lib/testing/fixtures.ts`
   - Échecs `safety.*` → `src/lib/reasoning/safety-filters.ts`
   - Échecs `levers.*` → `src/lib/reasoning/lever-selector.ts`
   - Échecs `composer.*` → `src/lib/anthropic/prompts.ts` ou `src/lib/reasoning/dish-composer.ts`
   - Erreurs TypeScript → corriger les types dans `src/lib/reasoning/types.ts`

3. **Corriger** — changements minimaux, ciblés sur la cause racine.

4. **Re-lancer** `npm run validate` jusqu'à exit 0.

5. **Annoncer à l'utilisateur** (en français) :
   > ✅ Tout est OK — Les 3 cas-pivot (IR, INFLAM, DYSBIOSE) passent. Le moteur est fonctionnel.

## Cas-pivot attendus

| Cas | Profil | Bottleneck dominant |
|-----|--------|---------------------|
| A | F 48 ans, HOMA-IR 2.1, TG/HDL 1.8 | IR |
| B | H 62 ans, CRP-us 2.4, OmegaIndex 4.5% | INFLAM |
| C | F 35 ans, Bristol 6, ballonnements | DYSBIOSE |

## Création d'un nouveau cours didactique / agent

Lors de la création d'un **nouveau module pédagogique** (ex. DU-MFL, TP nutrition) :

1. Ajouter un cas de validation dans `src/lib/testing/fixtures.ts` (`VALIDATION_CASES`).
2. Ajouter le contrôle correspondant dans `src/lib/testing/validation-runner.ts` si logique spécifique.
3. Mettre à jour `IntentForm.tsx` si cas exposé en UI.
4. Boucler `npm run validate` jusqu'à succès.

## Ce que l'agent ne fait PAS automatiquement

- Appels API Anthropic réels (coût + clé requise) — les tests sont **déterministes**.
- Connexion Supabase — les fixtures embarquent le référentiel minimal.

## Commandes

| Commande | Rôle |
|----------|------|
| `npm run validate` | Tests cas-pivot + pipeline |
| `npm run agent:validate` | Validation + type-check + instructions agent |
| `npm run type-check` | Compilation TypeScript seule |
