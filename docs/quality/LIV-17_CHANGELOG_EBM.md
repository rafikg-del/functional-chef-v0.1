# LIV-17 — Changelog EBM (référentiel `culinary_levers`)

> **Identifiant** : FC-REG-EBM / LIV-17
> **Version** : 0.1 (snapshot initial)
> **Statut** : **Brouillon — signature humaine requise**
> **Date du snapshot** : 2026-09-10
> **SHA git** : `018a354`
> **Sources** : `supabase/seed/04_culinary_levers.sql`, `supabase/seed/05_lever_bottleneck_map.sql`
> **Génération** : `npm run changelog:ebm` (`scripts/generate-ebm-changelog.ts`)
> **Ne pas signer ce fichier tel quel** : les tiers sont auto-déclarés ; **0 fiche LIV-16 signée CS**.

---

## 1. Contrôle documentaire

| Champ | Valeur |
|-------|--------|
| Nature | Registre de traçabilité des tiers EBM-F |
| Périmètre | Leviers **chargeables** via `INSERT INTO culinary_levers` uniquement |
| Hors-périmètre | Tuples SQL orphelins après le 2ᵉ INSERT (non exécutables) ; PMIDs inventés ; signatures CS fictives |
| Revue CS | **Aucune** à la date du snapshot |
| Réévaluation | Tous les 6 mois ou à chaque modification de tier (LIV-15) |

### 1.1 Signatures (vacantes)

| Rôle | Nom | Date | Décision | Signature |
|------|-----|------|----------|-----------|
| Rédacteur technique | | | Prise d’acte du snapshot | |
| Membre CS | | | Revue de l’historique | |
| Fabricant | | | Approbation du registre | |

---

## 2. Méthode du snapshot

1. Parser les blocs `INSERT INTO culinary_levers ... VALUES` (2 blocs dans le seed actuel).
2. Extraire `id`, `name_fr`, `category`, `ebm_tier`, `primary_reference`, `pubmed_ids`, `is_universal_star`.
3. Joindre `lever_bottleneck_map` (tier par bottleneck).
4. Recouper avec [`docs/PMIDS_AUDIT.md`](../PMIDS_AUDIT.md) **sans corriger** les PMIDs dans ce fichier.
5. Lister les identifiants `L_*` présents dans le fichier seed **après** le dernier INSERT valide : ce ne sont **pas** des leviers en base.

Ce document est un **historique initial** (état v0.1 + extension v0.2 du seed). Il n’existe pas d’historique git par levier antérieur à ce snapshot.

---

## 3. Synthèse

| Métrique | Valeur |
|----------|--------|
| Leviers chargeables | **63** |
| Bloc INSERT 1 (baseline v0.1) | 28 |
| Bloc INSERT 2 (extension v0.2) | 35 |
| T1 / T2 / T3 (tier global) | 26 / 31 / 6 |
| Étoiles universelles | 11 |
| Sans PMID | 2 |
| Écarts audit PMID encore ouverts | 3 |
| Fiches LIV-16 signées | **0 / 63** |
| Tuples SQL orphelins (hors INSERT) | 42 |
| Lignes mapping parsées | 202 |
| Mapping sans levier chargeable | 42 |
| Leviers chargeables sans mapping | 0 |
| Rupture INSERT mapping (point-virgule prématuré) | ligne 81 de 05_lever_bottleneck_map.sql |
| Audit PMIDs historique | présent (`docs/PMIDS_AUDIT.md`) |

**Lecture honnête** : le référentiel opérationnel, si `04_culinary_levers.sql` est exécuté tel quel, est de **63 leviers**. Les 42 identifiants orphelins du §8 (détox, suppléments, lifestyle) **ne sont pas chargés**. Le mapping `05` contient des IDs sans levier parent (FK cassée si exécuté après un seed strict) et des point-virgules prématurés (§7.3) qui interrompent l'INSERT PostgreSQL.

---

## 4. Historique des versions du référentiel

| Version | Date | Nature | Leviers concernés | Preuve | Signature CS |
|---------|------|--------|-------------------|--------|--------------|
| v0.1 baseline | 2026-07 (seed) | Création INSERT #1 | L_EVOO_PRIMARY, L_LEGUMINOUSES_REGULAR, L_RESISTANT_STARCH, L_PLANT_DIVERSITY_30, L_FERMENTED_DAILY, L_FATTY_FISH_2X, L_CRUCIFEROUS_STEAM, L_ANTHOCYANIN_BERRIES, L_VINEGAR_PRE_PRANDIAL, L_FOOD_SEQUENCE, L_WHEY_PRE_LOAD, L_LONG_FERMENTATION_BREAD, L_POSTPRANDIAL_WALK, L_WHOLE_GRAINS, L_TURMERIC_PIPERINE_LIPID, L_MED_DIET_FULL, L_REDUCE_RED_PROCESSED_MEAT, L_GREEN_TEA_DAILY, L_GENTLE_COOKING, L_PREBIOTIC_TARGETED, L_REDUCE_ULTRA_PROCESSED, L_FIBER_30G, L_AVOID_ARTIFICIAL_SWEETENERS, L_BONE_BROTH, L_FRUCTOSE_AVOIDANCE_50G, L_REDUCE_FREE_SUGAR_10PCT, L_SAT_FAT_REDUCTION, L_LOW_CARB_MODERATE | `04_culinary_levers.sql` | **Non** |
| v0.2 extension | 2026-07 (seed) | Ajout INSERT #2 (catalogue LIV-47) | L_CINNAMON_POLYPHENOLS, L_FENUGREEK_SEEDS, L_CHIA_SEEDS, L_AVOCADO_DAILY, L_NUTS_MIX_30G, L_DARK_CHOCOLATE_20G, L_PROTEIN_DISTRIBUTION, L_LOW_GI_MEAL_PATTERN, L_GINGER_FRESH, L_GARLIC_RAW, L_POMEGRANATE_JUICE_WEEKLY, L_TART_CHERRY, L_COFFEE_FILTER, L_VITAMIN_D_FOODS, L_ROSEMARY_HERBS, L_MEDITERRANEAN_WEEKLY_MEAL, L_FRUIT_2_DAY, L_PSYLLIUM_FIBER, L_FLAX_SEEDS_GROUND, L_OATS_BETA_GLUCAN, L_GREEN_BANANA_FLOUR, L_MISO_FERMENTED, L_KIMCHI_SAUERKRAUT, L_KEFIR_WATER_DAIRY, L_COCONUT_YOGURT_PROBIOTIC, L_APPLE_PECTIN, L_DIVERSE_SALAD_RAW, L_MEAL_TIMING_12H, L_SLOW_EATING, L_HYDRATION_OPTIMAL, L_MUSHROOMS_WEEKLY, L_SEAWEED_WEEKLY, L_CITRUS_POLYPHENOLS, L_SATURATED_FAT_SWAP, L_EVOO_CRU_FINITION | LIV-47 + seed | **Non** |
| v0.2-snapshot | 2026-09-10 | Premier registre LIV-17 généré | 63 chargeables | ce fichier / `018a354` | **Non** |

Toute modification ultérieure de `ebm_tier` ou de `pubmed_ids` doit ajouter une ligne ici **et** une fiche LIV-16 (procédure LIV-15).

---

## 5. Écarts PMID ouverts (ne pas « corriger » sans source)

Recoupement avec [`docs/PMIDS_AUDIT.md`](../PMIDS_AUDIT.md) (30 PMIDs du baseline, taux d’erreur historique 67 %). Les corrections listées dans l’audit **déjà présentes** dans le seed (vinaigre, amidon résistant, whey, etc.) ne sont pas re-listées. Restent ouverts :

| Levier | PMID seed | Statut |
|--------|-----------|--------|
| `L_LEGUMINOUSES_REGULAR` | 19465743 | PMIDS_AUDIT : PMID actuel pointe vers un article sommeil (sleep-disordered breathing), pas Sievenpiper 2009. PMID Sievenpiper non résolu — non inventé ici. |
| `L_TURMERIC_PIPERINE_LIPID` | 27259976 | PMIDS_AUDIT : PMID introuvable. Sahebkar 2016 CRP non confirmé — non inventé ici. |
| `L_REDUCE_FREE_SUGAR_10PCT` | (null) | Seed : pubmed_ids NULL. primary_reference indique « PMID à confirmer » (Lambert 2025 / EASL 2024). Aucun PMID n’est inventé. |
| `L_BONE_BROTH` | *(vide)* | Pas de PMID dans le seed. Réf. : Données mécanistiques ; études cliniques humaines limitées |

---

## 6. Registre des leviers chargeables

Tiers **globaux** = `culinary_levers.ebm_tier`. Tiers bottleneck = `lever_bottleneck_map.tier_for_bottleneck`.

| ID | Nom FR | Cat. | Tier | Star | PMIDs | Mapping | Revue CS |
|----|--------|------|------|------|-------|---------|----------|
| `L_EVOO_PRIMARY` | Huile d'olive extra vierge en première intention | ingredient | **T1** | oui | 23432189, 29897866 | DYSBIOSE:T2, INFLAM:T1, IR:T1 | **non** |
| `L_LEGUMINOUSES_REGULAR` | Légumineuses 3-4 portions/semaine | ingredient | **T1** | oui | 19465743, 23089999 ⚠️ audit | DYSBIOSE:T1, INFLAM:T2, IR:T1 | **non** |
| `L_RESISTANT_STARCH` | Refroidissement amidon ≥24h (riz, pâtes, pomme de terre) | preparation | **T1** | oui | 26693746, 16155268 | DYSBIOSE:T2, IR:T1 | **non** |
| `L_PLANT_DIVERSITY_30` | Diversité ≥30 plantes différentes/semaine | ingredient | **T1** | oui | 29795809 | DYSBIOSE:T1, INFLAM:T2, IR:T2 | **non** |
| `L_FERMENTED_DAILY` | Aliments fermentés diversifiés ≥1 portion/jour | fermentation | **T1** | oui | 34256014 | DYSBIOSE:T1, INFLAM:T2, IR:T2 | **non** |
| `L_FATTY_FISH_2X` | Poisson gras 2-3 portions/semaine | ingredient | **T1** | oui | 29610056 | INFLAM:T1, IR:T2 | **non** |
| `L_CRUCIFEROUS_STEAM` | Crucifères vapeur courte (≤4 min) | cooking | **T1** | oui | 18975959 | DYSBIOSE:T2, INFLAM:T1, IR:T2 | **non** |
| `L_ANTHOCYANIN_BERRIES` | Anthocyanes 200-400g/semaine (baies) | ingredient | **T1** | oui | 20047325 | DYSBIOSE:T2, INFLAM:T1, IR:T2 | **non** |
| `L_VINEGAR_PRE_PRANDIAL` | Vinaigre pré-prandial 15-30 ml | timing | **T1** |  | 28292654, 9630389 | IR:T1 | **non** |
| `L_FOOD_SEQUENCE` | Séquence alimentaire : légumes → protéines → glucides | sequence | **T1** |  | 26106234 | IR:T1 | **non** |
| `L_WHEY_PRE_LOAD` | Whey 20g pré-prandial (15 min avant repas glucidique) | timing | **T2** |  | 25005331 | IR:T2 | **non** |
| `L_LONG_FERMENTATION_BREAD` | Pain à fermentation longue 12-24h (levain) | fermentation | **T2** |  | 29113045 | DYSBIOSE:T2, IR:T2 | **non** |
| `L_POSTPRANDIAL_WALK` | Marche 10-15 min postprandiale | timing | **T1** |  | 27747394 | INFLAM:T2, IR:T1, IR:T1 | **non** |
| `L_WHOLE_GRAINS` | Substitution farines raffinées → céréales complètes | ingredient | **T1** |  | 24158434 | IR:T1 | **non** |
| `L_TURMERIC_PIPERINE_LIPID` | Curcuma + pipérine + lipide chaud | preparation | **T2** |  | 9619120, 27259976 ⚠️ audit | DYSBIOSE:T2, INFLAM:T2, IR:T3 | **non** |
| `L_MED_DIET_FULL` | Régime méditerranéen complet (pattern) | ingredient | **T1** |  | 24787907 | INFLAM:T1, IR:T1 | **non** |
| `L_REDUCE_RED_PROCESSED_MEAT` | Réduction viande rouge transformée <100g/semaine | avoidance | **T1** |  | 23497300 | INFLAM:T1 | **non** |
| `L_GREEN_TEA_DAILY` | Thé vert 3-4 tasses/jour | ingredient | **T2** |  | 31309655 | INFLAM:T2 | **non** |
| `L_GENTLE_COOKING` | Cuisson douce ≤120°C (vapeur, papillote, basse T°) | cooking | **T2** |  | 20497781 | DYSBIOSE:T2, INFLAM:T2 | **non** |
| `L_PREBIOTIC_TARGETED` | Prébiotiques ciblés (chicorée, ail, oignon, poireau, asperge, banane verte, topinambour) | ingredient | **T1** |  | 28165863 | DYSBIOSE:T1 | **non** |
| `L_REDUCE_ULTRA_PROCESSED` | Réduction aliments ultra-transformés (<20% calories) | avoidance | **T2** |  | 25731162 | DYSBIOSE:T2, INFLAM:T2, IR:T2 | **non** |
| `L_FIBER_30G` | Fibres totales 30-40 g/jour | ingredient | **T1** |  | 30638909 | DYSBIOSE:T1, INFLAM:T1, IR:T1 | **non** |
| `L_AVOID_ARTIFICIAL_SWEETENERS` | Éviter édulcorants artificiels (sucralose, saccharine) | avoidance | **T2** |  | 25231862, 35987213 | DYSBIOSE:T2 | **non** |
| `L_BONE_BROTH` | Bouillon d'os (mijoté 12-24h) | preparation | **T3** |  | — | DYSBIOSE:T3 | **non** |
| `L_FRUCTOSE_AVOIDANCE_50G` | Éviter excès fructose libre (>50 g/j) | avoidance | **T2** |  | 33684506, 19381015 | IR:T2 | **non** |
| `L_REDUCE_FREE_SUGAR_10PCT` | Limiter sucres libres ≤10% apport énergétique | avoidance | **T3** |  | — ⚠️ audit | IR:T3 | **non** |
| `L_SAT_FAT_REDUCTION` | Réduire AG saturés vs AGPI (MUFA/omega-3) | ingredient | **T2** |  | 29844096 | IR:T2 | **non** |
| `L_LOW_CARB_MODERATE` | Restriction glucidique modérée ciblée DNL | dose | **T1** |  | 34993571 | IR:T1 | **non** |
| `L_CINNAMON_POLYPHENOLS` | Cannelle (Ceylan) 1-3 g/jour avec repas glucidique | ingredient | **T1** |  | 23818067, 28011956 | IR:T1 | **non** |
| `L_FENUGREEK_SEEDS` | Fenugrec (graines trempées ou germées) | ingredient | **T1** |  | 25006949 | IR:T1 | **non** |
| `L_CHIA_SEEDS` | Graines de chia 15-30 g/j | ingredient | **T2** |  | 28272120 | INFLAM:T2, IR:T1 | **non** |
| `L_AVOCADO_DAILY` | Avocat ½-1/jour | ingredient | **T2** |  | 34617419, 29659968 | INFLAM:T2, IR:T1 | **non** |
| `L_NUTS_MIX_30G` | Oléagineux mix 30 g/j (noix, amandes, noisettes) | ingredient | **T1** | oui | 25411245, 18784301 | DYSBIOSE:T2, INFLAM:T1, IR:T1 | **non** |
| `L_DARK_CHOCOLATE_20G` | Chocolat noir ≥85% cacao 20 g/j | ingredient | **T2** |  | 15883455, 22869837 | DYSBIOSE:T2, INFLAM:T2, IR:T2 | **non** |
| `L_PROTEIN_DISTRIBUTION` | Distribution protéines 20-30 g/repas (3-4 repas) | timing | **T2** |  | 24760976, 29863639 | INFLAM:T2, IR:T2 | **non** |
| `L_LOW_GI_MEAL_PATTERN` | Composition repas à faible IG (fibres + protéines + lipides à chaque repas glucidique) | preparation | **T1** |  | 6117467, 30983560 | IR:T1 | **non** |
| `L_GINGER_FRESH` | Gingembre frais 5-10 g/j | ingredient | **T2** |  | 23515042, 33848235 | DYSBIOSE:T3, INFLAM:T2 | **non** |
| `L_GARLIC_RAW` | Ail cru écrasé 1-3 gousses/j | ingredient | **T2** |  | 27015631 | DYSBIOSE:T2, INFLAM:T2, IR:T3 | **non** |
| `L_POMEGRANATE_JUICE_WEEKLY` | Grenade (fruit ou jus pur) 150 ml 3-4×/sem | ingredient | **T2** |  | 26412200 | DYSBIOSE:T3, INFLAM:T2, IR:T3 | **non** |
| `L_TART_CHERRY` | Cerise acidulée (griotte) 200g fruits ou 200ml jus 3-4×/sem | ingredient | **T2** |  | 29685686, 19855314 | INFLAM:T2, IR:T2 | **non** |
| `L_COFFEE_FILTER` | Café filtre 2-3 tasses/j (non sucré) | ingredient | **T2** | oui | 28649191, 27619280 | DYSBIOSE:T2, INFLAM:T2, IR:T2 | **non** |
| `L_VITAMIN_D_FOODS` | Aliments riches en vitamine D (poisson gras, œuf, champignons UV) | ingredient | **T2** |  | 28202713 | DYSBIOSE:T3, INFLAM:T2, IR:T2 | **non** |
| `L_ROSEMARY_HERBS` | Herbes aromatiques quotidiennes (romarin, origan, thym, menthe) | ingredient | **T3** |  | 30154330 | DYSBIOSE:T3, INFLAM:T2 | **non** |
| `L_MEDITERRANEAN_WEEKLY_MEAL` | Pattern : 2×/sem poisson gras + 1-2 jours sans viande | timing | **T2** |  | 30924793 | INFLAM:T1, IR:T2 | **non** |
| `L_FRUIT_2_DAY` | Fruits entiers 2-3 portions/j (pas de jus) | ingredient | **T1** |  | 28244348, 23843730 | DYSBIOSE:T2, INFLAM:T1, IR:T2 | **non** |
| `L_PSYLLIUM_FIBER` | Psyllium (ispaghula) 5-10 g/j | ingredient | **T1** |  | 26231922, 28675898 | DYSBIOSE:T1, DYSBIOSE:T1, IR:T2, IR:T1 | **non** |
| `L_FLAX_SEEDS_GROUND` | Graines de lin moulues 10-20 g/j | ingredient | **T2** |  | 19061773 | DYSBIOSE:T2, INFLAM:T2, IR:T2 | **non** |
| `L_OATS_BETA_GLUCAN` | Avoine complète / β-glucane 40-60 g/j | ingredient | **T1** |  | 27702431 | DYSBIOSE:T1, IR:T1 | **non** |
| `L_GREEN_BANANA_FLOUR` | Banane verte / plantain vert (farine 30-50 g/j) | ingredient | **T2** |  | 33158077 | DYSBIOSE:T2, IR:T1 | **non** |
| `L_MISO_FERMENTED` | Miso (pâte soja fermentée) 1 c.s./jour | fermentation | **T3** |  | 27616673, 21044902 | DYSBIOSE:T2, INFLAM:T3 | **non** |
| `L_KIMCHI_SAUERKRAUT` | Légumes lactofermentés (choucroute crue, kimchi) 50-100 g/j | fermentation | **T2** |  | 32566240, 32108597 | DYSBIOSE:T2, INFLAM:T3 | **non** |
| `L_KEFIR_WATER_DAIRY` | Kéfir (lait ou eau) 150-200 ml/jour | fermentation | **T2** |  | 29721950, 26898463 | DYSBIOSE:T1, INFLAM:T2 | **non** |
| `L_COCONUT_YOGURT_PROBIOTIC` | Yaourts / laits fermentés probiotiques diversifiés | fermentation | **T2** |  | 28360887 | DYSBIOSE:T2, INFLAM:T3 | **non** |
| `L_APPLE_PECTIN` | Pomme entière + peau 1-2/j (pectine) | ingredient | **T2** |  | 25750143 | DYSBIOSE:T2, IR:T2 | **non** |
| `L_DIVERSE_SALAD_RAW` | Salade crue diversifiée ≥5 espèces/jour | preparation | **T2** |  | 34049938 | DYSBIOSE:T2, INFLAM:T2, IR:T2 | **non** |
| `L_MEAL_TIMING_12H` | Fenêtre alimentaire ≤12h/j (time-restricted eating) | timing | **T1** | oui | 30075275, 31950749, 33996959 | DYSBIOSE:T2, INFLAM:T2, IR:T1 | **non** |
| `L_SLOW_EATING` | Repas ≥20 min, mastication complète (≥20×/bouchée) | timing | **T2** |  | 26255023 | DYSBIOSE:T2, INFLAM:T3, IR:T2 | **non** |
| `L_HYDRATION_OPTIMAL` | Hydratation 30 ml/kg/j, eau prioritaire | dose | **T2** |  | 24056810 | DYSBIOSE:T2, INFLAM:T3, IR:T2 | **non** |
| `L_MUSHROOMS_WEEKLY` | Champignons variés 200-300 g/sem (shiitake, pleurote, Paris) | ingredient | **T3** |  | 28879373 | DYSBIOSE:T3, INFLAM:T2, IR:T3 | **non** |
| `L_SEAWEED_WEEKLY` | Alques marines 5-15 g/sem (wakame, kombu, nori) | ingredient | **T3** |  | 24724429 | DYSBIOSE:T2, INFLAM:T3 | **non** |
| `L_CITRUS_POLYPHENOLS` | Agrumes entiers (pamplemousse, orange, citron) — zeste + pulpe | ingredient | **T2** |  | 27431609 | DYSBIOSE:T3, INFLAM:T2, IR:T2 | **non** |
| `L_SATURATED_FAT_SWAP` | Substitution graisses saturées → insaturées (cuisson, lait, viande) | avoidance | **T1** |  | 27508875, 26041611 | INFLAM:T1, IR:T1 | **non** |
| `L_EVOO_CRU_FINITION` | Huile d'olive extra vierge en finition crue | cooking | **T2** |  | 20122463 | INFLAM:T1, IR:T1 | **non** |

### 6.1 Références pivot (texte seed)

| ID | primary_reference |
|----|-------------------|
| `L_EVOO_PRIMARY` | PREDIMED 2018 / Estruch 2013 NEJM |
| `L_LEGUMINOUSES_REGULAR` | Sievenpiper 2009 méta / Jenkins 2012 RCT |
| `L_RESISTANT_STARCH` | Sonia 2015 / Robertson 2005 / Englyst classification |
| `L_PLANT_DIVERSITY_30` | McDonald 2018 American Gut Project (n=11k) |
| `L_FERMENTED_DAILY` | Wastyk 2021 RCT Cell Host Microbe |
| `L_FATTY_FISH_2X` | Calder 2018 / Wei 2024 méta CRP |
| `L_CRUCIFEROUS_STEAM` | Vermeulen 2008 (cuisson) / Riedl 2009 |
| `L_ANTHOCYANIN_BERRIES` | Joseph 2014 / Krikorian 2010 |
| `L_VINEGAR_PRE_PRANDIAL` | Méta-analyse Shishehbor 2017 / Liljeberg 1998 |
| `L_FOOD_SEQUENCE` | Shukla 2015 / Imai 2014 RCT |
| `L_WHEY_PRE_LOAD` | Jakubowicz 2014 RCT / Hutchison 2015 |
| `L_LONG_FERMENTATION_BREAD` | De Angelis 2007 / Scazzina 2009 / Laatikainen 2017 |
| `L_POSTPRANDIAL_WALK` | Reynolds 2016 / Buffey 2022 méta |
| `L_WHOLE_GRAINS` | Aune 2013 méta dose-response |
| `L_TURMERIC_PIPERINE_LIPID` | Shoba 1998 / Sahebkar 2016 méta |
| `L_MED_DIET_FULL` | Schwingshackl 2014 méta / PREDIMED |
| `L_REDUCE_RED_PROCESSED_MEAT` | Rohrmann 2013 / Pan 2012 cohortes |
| `L_GREEN_TEA_DAILY` | Haghighatdoost 2019 méta |
| `L_GENTLE_COOKING` | Uribarri 2010 |
| `L_PREBIOTIC_TARGETED` | Holscher 2017 méta |
| `L_REDUCE_ULTRA_PROCESSED` | Chassaing 2015 souris / Whelan 2024 humain |
| `L_FIBER_30G` | Reynolds 2019 méta Lancet |
| `L_AVOID_ARTIFICIAL_SWEETENERS` | Suez 2014 Nature / Suez 2022 Cell |
| `L_BONE_BROTH` | Données mécanistiques ; études cliniques humaines limitées |
| `L_FRUCTOSE_AVOIDANCE_50G` | Geidl-Flueck 2021 J Hepatol RCT / Stanhope 2009 J Clin Invest |
| `L_REDUCE_FREE_SUGAR_10PCT` | EASL-EASD-EASO 2024 guidelines (J Hepatol 2024). Lambert 2025 JCI e174233 — PMID à confirmer |
| `L_SAT_FAT_REDUCTION` | Luukkonen 2018 Diabetes Care RCT |
| `L_LOW_CARB_MODERATE` | Thomsen 2022 Diabetologia RCT |
| `L_CINNAMON_POLYPHENOLS` | Allen 2013 méta / Davis 2017 méta |
| `L_FENUGREEK_SEEDS` | Neelakantan 2014 méta |
| `L_CHIA_SEEDS` | Vuksan 2017 RCT / Toscano 2015 méta |
| `L_AVOCADO_DAILY` | Petersen 2021 / Mahmassani 2018 méta |
| `L_NUTS_MIX_30G` | Afshin 2014 méta / Salas-Salvadó 2008 PREDIMED |
| `L_DARK_CHOCOLATE_20G` | Grassi 2005 RCT / Hooper 2012 méta flavanols |
| `L_PROTEIN_DISTRIBUTION` | Mamerow 2014 / Schoenfeld 2018 méta |
| `L_LOW_GI_MEAL_PATTERN` | Jenkins 1981 / Livesey 2019 méta |
| `L_GINGER_FRESH` | Mashhadi 2013 / Marx 2021 méta |
| `L_GARLIC_RAW` | Ried 2016 méta / Schwingshackl 2020 |
| `L_POMEGRANATE_JUICE_WEEKLY` | Sahebkar 2016 méta / Banihani 2017 |
| `L_TART_CHERRY` | Kelley 2018 méta / Howatson 2010 RCT |
| `L_COFFEE_FILTER` | Poole 2017 BMJ méta / Grosso 2016 méta |
| `L_VITAMIN_D_FOODS` | Martineau 2017 méta / Autier 2014 méta |
| `L_ROSEMARY_HERBS` | Nieto 2018 / Pérez-Fons 2010 |
| `L_MEDITERRANEAN_WEEKLY_MEAL` | Martinez-Gonzalez 2019 PREDIMED-Plus |
| `L_FRUIT_2_DAY` | Aune 2017 BMJ méta / Muraki 2013 |
| `L_PSYLLIUM_FIBER` | McRorie 2015 / Lambeau 2017 méta |
| `L_FLAX_SEEDS_GROUND` | Pan 2009 méta / Goyal 2014 |
| `L_OATS_BETA_GLUCAN` | Ho 2016 méta / EFSA 2011 health claim |
| `L_GREEN_BANANA_FLOUR` | Cassani 2020 / Langkilde 2002 |
| `L_MISO_FERMENTED` | Rios-Hoyo 2016 / Nakanishi 2010 |
| `L_KIMCHI_SAUERKRAUT` | Sun 2020 / Han 2020 |
| `L_KEFIR_WATER_DAIRY` | Kim 2018 méta / Bourrie 2016 |
| `L_COCONUT_YOGURT_PROBIOTIC` | Burton 2017 méta / Savaiano 2014 |
| `L_APPLE_PECTIN` | Koutsos 2015 / Hyson 2011 méta |
| `L_DIVERSE_SALAD_RAW` | Ludwig 2021 BMJ / D'Cunha 2024 |
| `L_MEAL_TIMING_12H` | Sutton 2018 CR / Wilkinson 2020 / Currenti 2021 méta |
| `L_SLOW_EATING` | Ohkuma 2015 méta / Zhu 2018 |
| `L_HYDRATION_OPTIMAL` | Perrier 2013 / Armstrong 2012 |
| `L_MUSHROOMS_WEEKLY` | Jayachandran 2017 / Chandra 2021 |
| `L_SEAWEED_WEEKLY` | Brown 2014 / Teas 2013 |
| `L_CITRUS_POLYPHENOLS` | Mulvihill 2016 / Tholstrup 2018 |
| `L_SATURATED_FAT_SWAP` | Wang 2016 méta / Guasch-Ferré 2015 |
| `L_EVOO_CRU_FINITION` | Cicerale 2010 / Lozano-Castellón 2020 |

---

## 7. Intégrité mapping

Tous les leviers chargeables ont au moins une ligne de mapping.

### 7.2 Lignes de mapping dont le levier n’est **pas** dans un INSERT `culinary_levers`

Ces IDs casseraient une FK si le mapping était appliqué après un seed strict. Ils correspondent pour la plupart aux tuples orphelins du §8.

| ID mapping orphelin | Bottlenecks |
|---------------------|-------------|
| `L_ALA_ANTIOXIDANT` | INFLAM:T2, IR:T3 |
| `L_ASHWAGANDHA` | INFLAM:T1, IR:T2 |
| `L_AVOCADO_MUFA` | INFLAM:T2, IR:T1 |
| `L_BERRIES_ANTHOCYANINS` | INFLAM:T1, IR:T2 |
| `L_BONE_BROTH_COLLAGEN` | DYSBIOSE:T3 |
| `L_BORAGE_GLA` | INFLAM:T2 |
| `L_B_COMPLEX_ACTIVE` | INFLAM:T2, IR:T3 |
| `L_CARBS_POSTEXERCISE` | IR:T3 |
| `L_CARNITINE` | IR:T2 |
| `L_CHLORELLA_DETOX` | INFLAM:T3 |
| `L_CHROMIUM_SUPP` | IR:T1 |
| `L_CINNAMON_IR` | IR:T1 |
| `L_CLA_GRASSFED` | IR:T3 |
| `L_COFFEE_CARDIO` | INFLAM:T2, IR:T2 |
| `L_CREATINE` | IR:T3 |
| `L_FAST_12H_MITO` | DYSBIOSE:T3, INFLAM:T3, IR:T2 |
| `L_FERMENTED_VEGGIES` | DYSBIOSE:T1, INFLAM:T2 |
| `L_FLAXSEED` | INFLAM:T2, IR:T3 |
| `L_GARLIC_KYOLIC` | DYSBIOSE:T3, INFLAM:T2 |
| `L_GINGER_ANTI_INFLAM` | INFLAM:T2 |
| `L_GLYCINE_DETOX` | DYSBIOSE:T3, INFLAM:T3 |
| `L_GRAPESEED_POLY` | DYSBIOSE:T3, INFLAM:T3 |
| `L_GREEN_TEA_MATCHA` | INFLAM:T1, IR:T2 |
| `L_INOSITOL_FOOD` | INFLAM:T2, IR:T1 |
| `L_LUTEIN_EYES` | INFLAM:T3 |
| `L_MCT_COCONUT` | DYSBIOSE:T3, IR:T2 |
| `L_MILK_RECOVERY` | IR:T3 |
| `L_MILK_THISTLE` | INFLAM:T2 |
| `L_MSM_DETOX` | INFLAM:T3 |
| `L_NAC_FOOD` | DYSBIOSE:T3, INFLAM:T2 |
| `L_OMEGA3_HIGH_DOSE` | INFLAM:T2, IR:T3 |
| `L_PS_COGNITION` | INFLAM:T3 |
| `L_ROSEMARY_DETOX` | INFLAM:T3 |
| `L_SAUNA_DETOX` | INFLAM:T2 |
| `L_SLEEP_HYGIENE` | DYSBIOSE:T2, INFLAM:T1, IR:T1 |
| `L_SODIUM_BICARB` | INFLAM:T3 |
| `L_TAURINE_DETOX` | INFLAM:T3 |
| `L_TURMERIC_BLACKPEPPER` | INFLAM:T1, IR:T2 |
| `L_VITAMIN_C` | INFLAM:T2 |
| `L_VITAMIN_E_SUPP` | INFLAM:T2 |
| `L_WHEY_DETOX` | INFLAM:T2, IR:T3 |
| `L_WHOLE_FOOD_BASELINE` | DYSBIOSE:T1, INFLAM:T1, IR:T1 |

### 7.3 Syntaxe `05_lever_bottleneck_map.sql`

Plusieurs lignes se terminent par `');` au lieu de `'),`. **Première rupture** : ligne **81**. Un client PostgreSQL strict arrête l'INSERT à cet endroit ; le reste du fichier n'est pas chargé. Le tableau ci-dessus parse **toutes** les lignes à des fins de traçabilité, ce qui **surestime** ce qui serait réellement inséré.

---

## 8. Identifiants SQL orphelins (non chargés)

Présents dans `04_culinary_levers.sql` **après** le `;` du second INSERT. Ce ne sont **pas** des leviers du moteur tant qu’un `INSERT INTO culinary_levers` valide n’est pas rédigé (catégories `supplement` / `lifestyle` / `beverage` / `spice` hors CHECK du schéma `001_init_schema.sql`).

**42 identifiants** :

`L_CHROMIUM_SUPP`, `L_INOSITOL_FOOD`, `L_GREEN_TEA_MATCHA`, `L_TURMERIC_BLACKPEPPER`, `L_GINGER_ANTI_INFLAM`, `L_BERRIES_ANTHOCYANINS`, `L_BONE_BROTH_COLLAGEN`, `L_FERMENTED_VEGGIES`, `L_AVOCADO_MUFA`, `L_CINNAMON_IR`, `L_COFFEE_CARDIO`, `L_ASHWAGANDHA`, `L_NAC_FOOD`, `L_SLEEP_HYGIENE`, `L_FLAXSEED`, `L_MCT_COCONUT`, `L_BORAGE_GLA`, `L_CLA_GRASSFED`, `L_WHOLE_FOOD_BASELINE`, `L_B_COMPLEX_ACTIVE`, `L_CARNITINE`, `L_VITAMIN_C`, `L_MILK_RECOVERY`, `L_CREATINE`, `L_SODIUM_BICARB`, `L_CARBS_POSTEXERCISE`, `L_ALA_ANTIOXIDANT`, `L_FAST_12H_MITO`, `L_VITAMIN_E_SUPP`, `L_GRAPESEED_POLY`, `L_LUTEIN_EYES`, `L_PS_COGNITION`, `L_MILK_THISTLE`, `L_WHEY_DETOX`, `L_TAURINE_DETOX`, `L_GLYCINE_DETOX`, `L_GARLIC_KYOLIC`, `L_OMEGA3_HIGH_DOSE`, `L_ROSEMARY_DETOX`, `L_SAUNA_DETOX`, `L_CHLORELLA_DETOX`, `L_MSM_DETOX`

Ces IDs ne reçoivent **pas** de tier opérationnel dans ce changelog.

---

## 9. Journal des modifications de tier (post-snapshot)

Table à renseigner à chaque évolution (LIV-15). Aucune modification de tier n’est enregistrée à ce jour.

| Date | Levier | Tier avant | Tier après | PMID ajouté/retiré | Fiche LIV-16 | Reviewer CS | SHA |
|------|--------|------------|------------|--------------------|--------------|-------------|-----|
| — | — | — | — | — | — | — | — |

---

## 10. Disclaimer

Les badges T1/T2/T3 de ce snapshot sont des **déclarations d’auteur** dans le seed. Ils ne constituent pas une validation scientifique externe. L’engagement produit ([`docs/EBM_TIERING.md`](../EBM_TIERING.md)) : *aucun T1 sans validation d’au moins un médecin du CS* — **non tenu** à ce jour.

> Document généré automatiquement. Toute édition manuelle de la section 6 sera écrasée au prochain `npm run changelog:ebm`. Éditer les sections 1 (signatures) et 9 (journal) via PR, ou étendre le générateur.
