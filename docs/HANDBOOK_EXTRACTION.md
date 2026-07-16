# Enrichissements issus du Handbook of Biomarkers and Precision Medicine

> **Source** : Carini, Fidock, van Gool (eds.) — CRC Press 2019, 659 pages
> **Extraction** : 14 juillet 2026
> **Objectif** : Identifier les biomarqueurs et concepts utilisables pour enrichir Functional Chef

---

## Résumé des chapitres exploités

| Section | Pages | Thème | Pertinence FC |
|---------|-------|-------|---------------|
| 1.1 | 29-34 | Définition et cadre des biomarqueurs | 🟡 Cadre conceptuel |
| 7.13 | 472-479 | Microbiome intestinal et maladie cœliaque | 🔴 Très élevée |
| 8.2 | 496-507 | Médecine stratifiée dans les maladies auto-immunes | 🟡 Nouveaux bottlenecks |
| 8.4 | 528-540 | Biomarqueurs cardiovasculaires | 🟡 Nouveaux bottlenecks |

---

## 1. Enrichissement du bottleneck DYSBIOSE (section 7.13)

### Nouvelles connaissances

Le chapitre 7.13 (Fasano, Serena, Sapone) confirme et enrichit notre compréhension de la dysbiose :

| Concept | Application dans Functional Chef |
|---------|--------------------------------|
| **Ratio Actinobacteria:Firmicutes/Bacteroidetes** réduit dans le DT1 | Marqueur discriminant possible pour le lien IR→DYSBIOSE |
| **Baisse des producteurs de SCFA** (Clostridia) dans le DT1 | Renforce la pertinence des leviers L_FIBER_30G, L_RESISTANT_STARCH, L_PREBIOTIC |
| **Microbiome de l'intestin grêle** différent du côlon | Distinction à garder en tête pour les recommandations |
| **Dysbiose associée au DT1 ET au DT2** | Valide notre cascade IR→DYSBIOSE |
| **Régime riche en gras/protéines → enrichissement Bacteroidetes** | Information pour personnaliser selon le régime |
| **Régime riche en glucides → enrichissement Prevotella** | Information pour personnaliser |

### Recommandation

✅ **Aucun changement immédiat** — notre modèle DYSBIOSE est cohérent avec la littérature. Les leviers prébiotiques et fibres sont alignés.

---

## 2. Nouveaux biomarqueurs cardiovasculaires (section 8.4)

### Biomarqueurs identifiés

| Biomarqueur | Utilité clinique | Applicable à FC ? |
|-------------|-----------------|-------------------|
| **Troponine (hs-cTn)** | Nécrose myocardique, risque CV | ❌ Trop spécifique, usage cardiologique |
| **BNP / NT-proBNP** | Insuffisance cardiaque, stress myocytaire | ❌ Cardio uniquement |
| **H-FABP** | Ischémie myocardique précoce | ❌ Cardio uniquement |
| **Copeptine** | Marqueur de stress, pronostic ACS | ❌ Cardio |
| **CK-MB** | Nécrose myocardique (historique) | ❌ Obsolète |

### Conclusion

**Aucun biomarqueur cardiovasculaire n'est pertinent pour Functional Chef** en v0.2. Les marqueurs cardiaques sont trop spécifiques pour un outil de nutrition fonctionnelle.  
→ Peut-être pertinent pour un futur bottleneck « Risque cardiométabolique » en v0.4.

---

## 3. Cadre conceptuel des biomarqueurs (section 1.1)

### Définition NIH (utile pour notre documentation)

> *« Un biomarqueur est une caractéristique mesurée et évaluée objectivement comme indicateur de processus biologiques normaux, de processus pathogéniques, ou de réponses pharmacologiques à une intervention thérapeutique. »*

### Types de biomarqueurs (applicables à FC)

| Type | Définition | Exemple FC |
|------|------------|------------|
| **Diagnostique** | Détection précoce d'une maladie | HOMA-IR >1.5 = IR fonctionnelle |
| **Susceptibilité/risque** | Risque de développer une maladie | CRP-us >1 mg/L = risque inflammatoire |
| **Pronostique** | Évolution de la maladie | Calprotectine >50 = sévérité dysbiose |
| **Prédictif** | Réponse à un traitement | Identification du bottleneck = prédiction des leviers efficaces |
| **Mécanistique** | Mécanisme d'action | SHBG basse → mécanisme hyperinsulinémie |
| **Pharmacodynamique** | Réponse pharmacologique | Évolution des biomarqueurs après intervention |

### Ce que ça apporte à FC

| Concept | Action |
|---------|--------|
| Nos biomarqueurs sont des **diagnostiques** et des **pronostiques** | ✅ Déjà implémenté |
| Nous utilisons aussi des **prédictifs** indirects (le bottleneck prédit quels leviers marchent) | ✅ Déjà implémenté |
| Distinction claire entre les types de biomarqueurs | → Ajouter dans la documentation (GUIDE_UTILISATION.md) |

---

## 4. Pistes pour de nouveaux bottlenecks (section 8.2)

### Auto-immunité — un futur bottleneck ?

La section 8.2 couvre la PR, le LED, la sclérodermie. Pour Functional Chef, les **marqueurs auto-immuns accessibles** seraient :

| Marqueur | Disponibilité | Pertinence nutritionnelle |
|----------|--------------|--------------------------|
| **ACPA / Facteur rhumatoïde** | Spécialisé | Faible — pas modifiable par l'alimentation |
| **Anti-CCP** | Spécialisé | Faible |
| **C3/C4 (complément)** | Standard | Moyen — modulé par inflammation |
| **CRP-us** | ✅ Déjà dans FC | Présent dans INFLAM |
| **Ferritine** | ✅ Déjà dans FC | Présent dans INFLAM |

**Conclusion** : Pas de nouveau bottleneck auto-immun pertinent pour l'instant. Les marqueurs sont trop spécialisés et peu modifiables par l'alimentation.

### Métabolique — extension possible

La section 8.4 évoque la classification de Braunwald (2008) qui divise les biomarqueurs CV en 7 catégories. Pour un futur bottleneck **« Risque cardiométabolique »**, nous pourrions ajouter :

| Marqueur | Déjà dans FC ? | Seuil proposé |
|----------|---------------|---------------|
| **Lp-PLA2** | ❌ Non | >200 ng/mL |
| **Homocystéine** | ❌ Non | >15 µmol/L |
| **sdLDL** | ❌ Non | >50 mg/dL |
| **ApoB** | ✅ Oui (moderate IR) | Déjà utilisé |
| **Lipoprotéine(a)** | ❌ Non | >50 mg/dL |

---

## 5. Recommandations finales

### 🔴 À intégrer immédiatement

| Action | Justification |
|--------|---------------|
| **Aucune** — les chapitres extraits ne contiennent pas de nouveaux biomarqueurs actionnables pour FC | Le handbook est centré sur le développement pharmaceutique, pas sur la nutrition fonctionnelle |

### 🟡 À garder pour v0.3-v0.4

| Piste | Détail |
|-------|--------|
| **Bottleneck « Risque cardiométabolique »** | Ajouter Lp-PLA2, homocystéine, sdLDL, Lp(a) comme marqueurs |
| **Classification des biomarqueurs** | Ajouter les 6 types (diagnostique, risque, etc.) dans la doc |
| **Confirmation microbiome** | Le chapitre 7.13 valide notre approche DYSBIOSE |

### Verdict

> **Le Handbook of Biomarkers and Precision Medicine (2019) est un excellent ouvrage de référence pour le cadre conceptuel et la validation de notre approche, mais il n'apporte pas de nouveaux biomarqueurs actionnables immédiatement pour Functional Chef.** Les chapitres sont centrés sur le développement pharmaceutique et les essais cliniques, pas sur la nutrition fonctionnelle. Les chapitres les plus pertinents (microbiome, auto-immunité) confortent notre architecture existante sans nécessiter de changements.
