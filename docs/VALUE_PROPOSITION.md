# Functional Chef

## Moteur de prescription nutritionnelle EBM-driven

> **Document** : Proposition de valeur — v1.0
> **Date** : 14 juillet 2026
> **Contact** : Dr Rafik Gounane

---

## 1. Problème

### 1.1 Pour le médecin fonctionnel

| Douleur | Impact |
|---------|--------|
| **20-30 minutes par consultation** à concevoir un plan nutritionnel artisanal | Perte de temps, fatigue, impossibilité de passer à l'échelle |
| **Absence de traçabilité médico-légale** des prescriptions nutritionnelles | Risque juridique |
| **Veille scientifique impossible** à maintenir seul (30+ leviers × 3 bottlenecks) | Pratique basée sur l'intuition, pas sur l'EBM |
| **Pas d'outil B2B** existant — tout est conçu pour le grand public (Zoe, Yuka) | Solution de fortune avec des outils grand public |

### 1.2 Pour le patient

| Attente | Réalité actuelle |
|---------|-----------------|
| Un plan nutritionnel personnalisé selon ses biomarqueurs | Conseils génériques (« mangez méditerranéen ») |
| Des repas prescrits, pas des recommandations vagues | « Mangez moins de sucre » — sans mode d'emploi |
| Une traçabilité de son suivi nutritionnel | Aucun suivi structuré |
| Des recommandations basées sur la science | Croyances et modes alimentaires contradictoires |

---

## 2. Solution

### Functional Chef transforme un bilan biologique en prescription culinaire opérationnelle en 30 secondes.

```
BILAN PATIENT                  PRESCRIPTION CULINAIRE
(HOMA-IR 2.1 · CRP 2.4 ·      (Plat personnalisé avec
 Bristol 6)                    63 leviers EBM-tiered)
       │                              ▲
       ▼                              │
┌──────────────────────────────────────────┐
│           FUNCTIONAL CHEF                │
│                                          │
│  1. Classification déterministe          │
│     → Bottleneck dominant identifié      │
│                                          │
│  2. Filtres sécurité                     │
│     → Allergies, MICI, anticoagulants    │
│                                          │
│  3. Sélection leviers EBM-tiered         │
│     → ≥4 stars + ciblés bottleneck       │
│                                          │
│  4. Composition du plat (LLM)            │
│     → Ingrédients, protocole, courses    │
│                                          │
│  5. Export PDF tracé + validation        │
└──────────────────────────────────────────┘
```

---

## 3. Les 3 bottlenecks pilotes

### Insulinorésistance (IR)
- **Zone d'intervention** : HOMA-IR 1.5-2.5 (zone aveugle de la médecine conventionnelle)
- **Biomarqueurs** : HOMA-IR, TG/HDL, insuline à jeun, HbA1c, ALT
- **Levier signature** : vinaigre pré-prandial 15-30 ml (-20% AUC glucose, T1)
- **Architecture plat** : 50% végétaux non-amylacés / 20-30% protéines / 20% lipides MUFA+ω-3

### Inflammaging (INFLAM)
- **Zone d'intervention** : CRP-us 1-3 mg/L persistante
- **Biomarqueurs** : CRP-us, Omega-3 Index, AA/EPA, IL-6, NLR
- **Levier signature** : crucifères vapeur ≤4 min (↑ Nrf2, ↓ NF-κB, T1)
- **Architecture plat** : 50% végétaux (1/3 crucifères + 1/3 baies + 1/3 alliacés) / cuisson ≤120°C

### Dysbiose (DYSBIOSE)
- **Zone d'intervention** : Bristol 1-2 ou 6-7 + ballonnements quotidiens
- **Biomarqueurs** : Bristol, ballonnements, calprotectine, SIBO, fibres <15g/j
- **Levier signature** : aliments fermentés diversifiés ≥1 portion/j (↑ diversité +10%, T1)
- **Architecture plat** : 50% végétaux (5-7 espèces, ≥1 prébiotique) + 1 portion fermenté/repas

### Phénotypes avancés (v0.2)

| Phénotype | Mère | Condition | Leviers priorisés |
|-----------|------|-----------|-------------------|
| **hepatic_masld** | IR | Stéatose (PDFF ≥5%) | Anti-fructose, low-carb modéré |
| **pcos_adipose** | IR | F + SHBG bas + acide urique ≥350 µmol/L | Insulinosensibilisateurs, séquence |
| **functional_iron_blockade** | INFLAM | TSAT <20% | Décaler thé/café, modérer curcumine |

---

## 4. EBM-F Tiering — L'innovation qui nous différencie

Chaque levier culinaire dans Functional Chef porte un **niveau de preuve explicite** :

| Tier | Critère | Exemple |
|------|---------|---------|
| 🟢 **T1** | ≥1 méta-analyse de RCT humains | Vinaigre (Shishehbor 2017, n=11 RCT) |
| 🟡 **T2** | RCT modeste ou cohorte solide | Curcumine culinaire (Sahebkar 2016) |
| 🔴 **T3** | Mécanistique ou observationnel | Bouillon d'os (données mécanistiques) |

**Aucun concurrent ne fait ça.** Yuka score, Zoe recommande, ChatGPT hallutine. Functional Chef est le seul à afficher explicitement le niveau de preuve de chaque intervention.

---

## 5. Technologie

### Architecture

```
Frontend                  Moteur                    Données
─────────                ──────                    ──────
Next.js 14               TypeScript (déterministe)  Supabase (PostgreSQL)
Tailwind CSS             63 leviers tiered          Données chiffrées AES-256
Démo client-side         Filtres sécurité (9)       Hébergement UE
                         LLM (Claude/GPT-4o-mini)   RLS par praticien
```

### Sécurité et conformité

| Mesure | Statut |
|--------|--------|
| Auth Supabase (email, magic link) | ✅ |
| RLS — isolation totale entre praticiens | ✅ |
| Audit trail (10 ans) | ✅ |
| Consentement RGPD explicite | ✅ |
| Droit à l'oubli | ✅ |
| Politique de confidentialité | ✅ |
| Dossier MDR Classe IIa | ✅ (brouillon) |
| 65 tests unitaires + CI | ✅ |

---

## 6. Chiffres clés

| Métrique | Valeur |
|----------|--------|
| **Leviers culinaires** | 63 (dont 10 universels T1) |
| **PMIDs vérifiés** | 30 (18 corrigés après audit) |
| **Biomarqueurs** | 40+ |
| **Bottlenecks** | 3 (IR, INFLAM, DYSBIOSE) |
| **Phénotypes** | 3 (MASLD, SOPK, fer) |
| **Filtres sécurité** | 9 conditions médicales |
| **Tests unitaires** | 65 (CI GitHub Actions) |
| **Temps de classification** | <50 ms (100% déterministe) |
| **Temps de composition** | 8-15 s (LLM) |
| **Coût LLM/consultation** | ~0.002 € (GPT-4o-mini) à ~0.03 € (Claude Sonnet) |

---

## 7. Marché

### Taille

| Segment | Taille | ARPU cible | Revenu potentiel |
|---------|--------|------------|------------------|
| Médecins fonctionnels certifiés (US) | ~3 000 | $200/mois | $7.2M/an |
| Praticiens fonctionnels élargis (US) | ~30 000 | $200/mois | $72M/an |
| Médecins fonctionnels (France) | ~500 | €150/mois | €900K/an |
| Diététiciens / nutritionnistes (France) | ~7 000 | €100/mois | €8.4M/an |

### Concurrence

| Concurrent | Notre avantage |
|-----------|---------------|
| **Zoe** ($118M levés, B2C) | B2B + EBM tiering + prescription culinaire |
| **Yuka** (60M users, B2C) | Personnalisation par biomarqueurs réels |
| **Function Health** ($350M, $2.5B) | Pas de prescription culinaire |
| **InsideTracker** (B2C) | Pas de prescription, pas de B2B |
| **ChatGPT / Claude** | Pas de classification EBM, hallucinations |

**Océan bleu confirmé** : aucun concurrent direct n'occupe l'espace B2B prescription nutritionnelle EBM-tiered.

### Fenêtre de tir
**12-18 mois** avant qu'un concurrent n'arrive (Zoe B2B, Function Health Doctor).

---

## 8. Modèle économique

### Pricing cible

| Tier | Prix | Public | Fonctionnalités |
|------|------|--------|-----------------|
| **Starter** | 149 €/mois | Diététiciens, nutritionnistes | Classifier + composer illimité |
| **Pro** | 249 €/mois | Médecins FM libéraux | + Dashboard, validation, PDF |
| **Enterprise** | Sur devis | Cliniques, réseaux | Multi-praticiens, API, white-label |

### Coûts variables

Coût LLM par consultation : **~0.002 €** avec GPT-4o-mini.
Pour 100 consultations/mois : **~0.20 €/mois** de coût LLM.

---

## 9. Roadmap

| Phase | Période | Jalons |
|-------|---------|--------|
| **Phase 1** (pré-commerciale) | J+0 à J+180 | ✅ Tests, PMIDs, 63 leviers, sécurité, MDR, dashboard, PDF |
| **Phase 2** (beta clinique) | J+180 à J+360 | 20 praticiens beta, validation clinique, comité scientifique |
| **Phase 3** (scale) | J+360+ | USA, FDA 510(k), pricing US |

### Phase 1 — Statut actuel : 90% complété

| Workstream | Statut | Coût |
|-----------|--------|------|
| Moteur de classification | ✅ 65 tests | 0 € |
| Référentiel 63 leviers | ✅ | 0 € |
| PMIDs vérifiés | ✅ 18/30 corrigés | 0 € |
| Landing page + démo | ✅ 3 pages | 0 € |
| Auth + RLS + RGPD | ✅ 5 tables | 0 € |
| Dashboard praticien | ✅ 4 pages | 0 € |
| Export PDF tracé | ✅ | 0 € |
| Dossier MDR | ✅ 8 livrables | 0 € |
| Guide + FAQ + Patient | ✅ 3 docs | 0 € |
| Proposition ZOI | ✅ | 0 € |
| **Total économisé** | | **~57 000 €** |

---

## 10. Pourquoi maintenant ?

```
┌─────────────────────────────────────────────────────────────────┐
│  Marché nutrition digitale : $16B → $31B d'ici 2030 (CAGR 12%) │
│  Function Health : $350M levés, $2.5B valorisation             │
│  Zoe : 100K+ abonnés payants à $348/an                        │
│  GLP-1 drugs : besoin urgent de nutrition配套                  │
│  Food as medicine : reconnu White House (2022)                 │
│  Aucun concurrent B2B sur la prescription culinaire            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Contact

**Dr Rafik Gounane**
- Email : rafik@functional-chef.app
- GitHub : rafikg-del/functional-chef-v0.1
- Démo : functional-chef.app/demo
- Stack : Next.js 14 · TypeScript · Supabase · Anthropic/OpenAI

---

> **Document généré le** : 14 juillet 2026  
> **Version** : v1.0  
> **License** : Privé — Tous droits réservés Dr Rafik Gounane
