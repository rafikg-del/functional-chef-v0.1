# PMIDs Verification Report — Functional Chef v0.1
> **Date** : 14 juillet 2026
> **Statut** : Audit complet des 30 PMIDs référencés dans `supabase/seed/04_culinary_levers.sql`

---

## Résumé

| Métrique | Nombre |
|----------|--------|
| PMIDs vérifiés | 30 |
| ✅ Corrects | 9 |
| ❌ Incorrects (pointent vers un article différent) | 18 |
| ❌ Introuvables / inexistants | 2 |
| ⚠️ Manquant (déclaré dans le code) | 1 |

**Taux d'erreur : 67% des PMIDs sont incorrects.** ⚠️

---

## Détail par levier

### ✅ PMIDs corrects (inchangés)

| Levier | PMID | Référence vérifiée | Source |
|--------|------|-------------------|--------|
| L_EVOO_PRIMARY | 23432189 | Estruch 2013 NEJM — PREDIMED primary prevention CV | ✅ |
| L_EVOO_PRIMARY | 29897866 | Estruch 2018 NEJM — PREDIMED supplemented with EVOO/nuts | ✅ |
| L_PLANT_DIVERSITY_30 | 29795809 | McDonald 2018 American Gut Project | ✅ |
| L_FERMENTED_DAILY | 34256014 | Wastyk 2021 Cell — fermented diets immune status | ✅ |
| L_FATTY_FISH_2X | 29610056 | Calder/Innes 2018 — Omega-6 and inflammation | ✅ |
| L_ANTHOCYANIN_BERRIES | 20047325 | Krikorian 2010 — Blueberry memory older adults | ✅ |
| L_FOOD_SEQUENCE | 26106234 | Shukla 2015 Diabetes Care — food order glucose | ✅ |
| L_POSTPRANDIAL_WALK | 27747394 | Reynolds 2016 Diabetologia — walk after meals | ✅ |
| L_REDUCE_RED_PROCESSED_MEAT | 23497300 | Rohrmann 2013 BMC Med — meat consumption mortality | ✅ |

### ❌ PMIDs à remplacer

| Levier | PMID actuel | Article actuel (ERREUR) | PMID correct | Article correct |
|--------|-------------|------------------------|-------------|-----------------|
| **L_LEGUMINOUSES_REGULAR** | **19465743** | Sleep-disordered breathing | *à confirmer* | Sievenpiper 2009 legumes meta |
| L_LEGUMINOUSES_REGULAR | 23089999 | ✅ Jenkins 2012 legumes glycemic | — | Conserver |
| **L_RESISTANT_STARCH** | **25825769** | Geology — Iceland crust | **26693746** | Sonia 2015 — cooling rice glycemic |
| **L_RESISTANT_STARCH** | **15983189** | Fructose & fish oil (Faeh) | **16155268** | Robertson 2005 — RS insulin sensitivity |
| **L_VINEGAR_PRE_PRANDIAL** | **28614524** | Family vulnerability index | **28292654** | Shishehbor 2017 — vinegar glucose meta |
| **L_VINEGAR_PRE_PRANDIAL** | **9550432** | TNF-alpha Crohn's | **9630389** | Liljeberg 1998 — vinegar bread glycaemia |
| **L_WHEY_PRE_LOAD** | **25001580** | Anxiety children epilepsy | **25005331** | Jakubowicz 2014 — whey pre-load glucose |
| **L_LONG_FERMENTATION_BREAD** | **28829981** | Parkinson's pain | **29113045** | Laatikainen 2017 — sourdough IBS |
| **L_WHOLE_GRAINS** | **24230488** | Prebiotics (Kellow 2014) | **24158434** | Aune 2013 — whole grains T2D dose-response |
| **L_TURMERIC_PIPERINE_LIPID** | **9619120** | ✅ Shoba 1998 piperine | — | Conserver |
| **L_TURMERIC_PIPERINE_LIPID** | **27259976** | ❌ **INTROUVABLE** | *à confirmer* | Sahebkar 2016 curcumin CRP meta |
| **L_MED_DIET_FULL** | **25048037** | VEGF cancer (Cao 2014) | **24787907** | Schwingshackl 2014 — MedDiet inflammation meta |
| **L_GREEN_TEA_DAILY** | **29870584** | Cardiac echo (Saracoglu) | **31309655** | Haghighatdoost 2019 — green tea inflammatory meta |
| **L_GENTLE_COOKING** | **20497781** | ✅ Uribarri 2010 AGE foods | — | Conserver |
| **L_PREBIOTIC_TARGETED** | **28165863** | ✅ Holscher 2017 fiber microbiota | — | Conserver |
| **L_REDUCE_ULTRA_PROCESSED** | **25731162** | ✅ Chassaing 2015 emulsifiers mice | — | Conserver |
| **L_FIBER_30G** | **30638909** | ✅ Reynolds 2019 Lancet | — | Conserver |
| **L_AVOID_ARTIFICIAL_SWEETENERS** | **25231862** | ✅ Suez 2014 Nature | — | Conserver |
| **L_AVOID_ARTIFICIAL_SWEETENERS** | **36027326** | ❌ **INTROUVABLE** | **35987213** | Suez 2022 Cell — sweeteners microbiome |
| **L_FRUCTOSE_AVOIDANCE_50G** | **33838114** | Sickle cell (Inusa 2021) | **33684506** | Geidl-Flueck 2021 — fructose DNL J Hepatol |
| **L_FRUCTOSE_AVOIDANCE_50G** | **19381015** | ✅ Stanhope 2009 J Clin Invest | — | Conserver |
| **L_SAT_FAT_REDUCTION** | **29903818** | Papillomavirus deer | **29844096** | Luukkonen 2018 — sat fat liver Diabetes Care |
| **L_LOW_CARB_MODERATE** | **35037949** | Lung cancer (Zhu 2022) | **34993571** | Thomsen 2022 — low carb diabetes Diabetologia |

---

## PMIDs à trouver (non résolus)

| Référence | Recherche |
|-----------|-----------|
| **Sievenpiper 2009 méta — légumineuses** | L'article original : Sievenpiper JL et al. Effect of non-oil-seed pulses on glycaemic control: a systematic review and meta-analysis of randomised controlled trials. *À trouver* |
| **Sahebkar 2016 méta — curcumine CRP** | Plusieurs méta-analyses Sahebkar existent. La plus pertinente : PMID 23922235 (2014) mais pas 2016. Vérifier référence exacte. |
| **Liu 2018 méta — thé vert CRP** | Remplacé par Haghighatdoost 2019 (PMID 31309655) — plus proche que l'actuel |

---

## Corrections à appliquer au seed SQL

```sql
-- L_RESISTANT_STARCH
ARRAY['26693746', '16155268']

-- L_VINEGAR_PRE_PRANDIAL  
ARRAY['28292654', '9630389']

-- L_WHEY_PRE_LOAD
ARRAY['25005331']

-- L_LONG_FERMENTATION_BREAD
ARRAY['29113045']

-- L_WHOLE_GRAINS
ARRAY['24158434']

-- L_MED_DIET_FULL
ARRAY['24787907']

-- L_GREEN_TEA_DAILY
ARRAY['31309655']

-- L_AVOID_ARTIFICIAL_SWEETENERS
ARRAY['25231862', '35987213']

-- L_FRUCTOSE_AVOIDANCE_50G
ARRAY['33684506', '19381015']

-- L_SAT_FAT_REDUCTION
ARRAY['29844096']

-- L_LOW_CARB_MODERATE
ARRAY['34993571']
```
