# Stratégie : surpasser un LLM bien prompté

> Analyse des écarts point par point, avec solutions implémentables.
> Date : 14 juillet 2026

---

## 1. Classification : les cas limites nous échappent

**Problème :** nos seuils sont binaires. HOMA-IR 1.5 → major, 1.4 → rien. Un LLM voit la nuance.

**Solution — Score de suspicion continu :**

| Actuel | Cible |
|--------|-------|
| HOMA-IR 1.4 → 0 major → rien | HOMA-IR 1.4 → **surveillance** (score 0.8/3) |
| CRP 0.9 → pas trigger | CRP 0.9 + tendance haussière → **alerte préclinique** |

Implémentation :
```
triggered (binaire)     → pour décision thérapeutique
suspicion_score (0-1)   → pour alerte précoce, affiché au médecin
trend (↑ stable ↓)      → basé sur historique si disponible
```

**Priorité : 🔴** — Impact fort, effort moyen (2h)

---

## 2. Contexte clinique : on ignore la narrative patient

**Problème :** Un patient avec HOMA-IR 1.3 + fatigue + antécédents familiaux DT2 + SOPK = IR probable. Nous on voit juste HOMA-IR 1.3 → pas trigger. Le LLM voit le tableau complet.

**Solution — Signaux cliniques souples :**

Ajouter dans `PatientProfile.context` :
```typescript
soft_signals: {
  fatigue_postprandiale: boolean;
  fringales_glucidiques: boolean;
  antécédents_familiaux_dt2: boolean;
  prise_poids_recente_kg: number;
  syndrome_premenstruel_aggravation: boolean;
}
```

Règle : si ≥2 soft_signals + 1 major → trigger (« IR probable, confirmer »). Si ≥3 soft_signals sans major → suspicion.

**Priorité : 🔴** — Impact très fort, effort faible (1h)

---

## 3. Recommandations : personnalisation vs template

**Problème :** Nos recettes sont standards. Un LLM adapte à la culture, au budget, aux allergies, aux goûts.

**Solution — Profil patient enrichi :**

```typescript
patient_preferences: {
  cuisine_type: 'mediterraneenne' | 'asiatique' | 'francaise' | 'orientale';
  budget: 'normal' | 'reduit';
  cooking_skill: 'debutant' | 'intermediaire' | 'avance';
  time_available_min: number; // temps cuisson max
  food_aversions: string[];
  seasonal_preference: boolean;
}
```

Transmettre ces champs au LLM dans l'étape 4 (composition) pour une adaptation réelle.

**Priorité : 🔴** — Impact très fort, effort faible (30 min)

---

## 4. Cohérence longitudinale : suivre l'évolution

**Problème :** Nous faisons une photo à T0. Le LLM ne fait pas mieux. Mais sur plusieurs consultations, notre moteur doit montrer l'évolution.

**Solution — Treemap de progression :**

```typescript
consultation_history: {
  previous_id: string;
  date: string;
  biomarkers: { code: string; value: number }[];
  dominant_bottleneck: string;
  adherence_score: 'bonne' | 'partielle' | 'faible';
}[]
```

Afficher dans la consultation courante :
```
 HOMA-IR : 2.3 → 1.9 → 1.6 (J0 → J+28 → J+56) 
 CRP :     1.8 → 1.4 → 1.1
 Levier le plus efficace : vinaigre + séquence (↓ HOMA -40%)
```

**Priorité : 🟡** — Bon impact, effort moyen (3h)

---

## 5. Communication patient : le ton fait la différence

**Problème :** On écrit comme un dossier médical. Le LLM adapte son ton au patient.

**Solution — Deux modes de sortie :**

```
Mode médecin (actuel)   : PMIDs, tiers, dosage précis, CI
Mode patient (nouveau)  : langage simple, pourquoi/pas seulement quoi, encouragements
```

Implémentation : un second prompt LLM + template simplifié, accessible via `/prescription/[id]/patient` (sans les PMIDs ni les termes techniques)

**Priorité : 🟡** — Impact moyen, effort faible (1h)

---

## 6. Déclenchement des phénotypes : enrichissement manquant

**Problème :** On a 3 phénotypes (MASLD, PCOS, fer). Un LLM en détecterait 10+.

**Solution — Pipeline de phénotypes détaché :**

Les phénotypes ne devraient pas être dans le classifieur principal (qui est binaire) mais dans un **module de détection secondaire** qui tourne après :

```typescript
// Détaché du classifieur principal
function detectPhenotypes(patient, classification): Phenotype[] {
  const detected = [];
  // existants
  if (isMasld(patient, classification)) detected.push('hepatic_masld');
  if (isPcos(patient, classification)) detected.push('pcos_adipose');
  if (isIronBlockade(patient)) detected.push('functional_iron_blockade');
  // nouveaux
  if (isInflammagingChronic(patient)) detected.push('chronic_low_grade_inflammaging');
  if (isMetabolicSyndrome(patient)) detected.push('metabolic_syndrome_pre');
  if (isSibo(patient)) detected.push('sibo_confirmed');
  if (isHpaDysregulation(patient)) detected.push('hpa_axis_dysregulation');
  return detected;
}
```

Chaque phénotype active des leviers spécifiques (boost) et des recommandations de suivi.

**Priorité : 🟡** — Bon impact, effort moyen (2h)

---

## 7. Précision exécutive : notre seul vrai avantage

**Problème :** On a déjà la précision, mais on peut aller plus loin.

**Solution — Renforcer ce qu'on fait déjà mieux :**

| Ce qu'on fait mieux | Niveau actuel | Cible |
|---------------------|---------------|-------|
| **Doses précises** | « 15 ml vinaigre » | « 15 ml (1 c.s.) dans 100 ml eau, 10 min AVANT repas, pas pendant » |
| **Contre-indications** | Par levier | Par levier **+** par combinaison de leviers |
| **Interactions** | Médicaments | Médicaments + autres leviers + aliments |
| **Critères d'escalade** | 3 critères fixes | Arbre décisionnel adaptatif |
| **Suivi** | Prochaine date | Calendrier progressif avec jalons |

**Priorité : 🟢** — En cours, continuer

---

## 8. Tableau de bord comparatif : cible finale

| Critère | LLM bien prompté | Notre moteur aujourd'hui | Notre moteur cible |
|---------|-----------------|------------------------|-------------------|
| **Classification précise** | RARE (varie) | ✅ Binaire | ✅ Binaire + suspicion |
| **Cas limites rattrapés** | ✅ Bon | ❌ Manqués | ✅ Suspicion score |
| **Précision doses/protocoles** | ❌ Vagues | ✅ Bon | ✅ Excellent |
| **Contre-indications** | ❌ Oublie | ✅ Par levier | ✅ Par levier + combinaisons |
| **Personnalisation** | ✅ Bonne | ❌ Template | ✅ Via préférences patient |
| **Cohérence longitudinale** | ❌ Aucune | ❌ Aucune | ✅ Treemap progression |
| **Nuance clinique** | ✅ Bonne | ❌ Binaire | ✅ Soft signals |
| **Détection phénotypes** | ✅ Honnête | 🟡 3 phénotypes | ✅ 7+ phénotypes |
| **Communication patient** | ✅ Adaptative | ❌ Clinique | ✅ Deux modes |
| **EBM visible** | ❌ Rien | ✅ Tiers PMIDs | ✅ Tiers + suspicion |
| **Reproductibilité** | ❌ Variable | ✅ Parfaite | ✅ Parfaite |
| **Certifiable MDR** | ❌ Impossible | ✅ Possible | ✅ Possible |

## Plan d'implémentation

| # | Action | Effort | Dépendances |
|---|--------|--------|-------------|
| 1 | **Soft signals** dans profile + classifieur | 1h | Type PatientProfile |
| 2 | **Suspicion score** (non binaire) | 2h | Refacto classifieur |
| 3 | **Préférences patient** → prompt LLM | 30 min | Type + template prompt |
| 4 | **Mode patient** /prescription/[id]/patient | 1h | Template simplifié |
| 5 | **Pipeline phénotypes** détaché | 2h | Module detectPhenotypes() |
| 6 | **Treemap progression** | 3h | Consultation history |
| 7 | **Arbre escalade adaptatif** | 1h | Règles conditionnelles |

**Total : ~10h** pour passer de « bon assistant » à « clairement supérieur à un LLM seul ».
