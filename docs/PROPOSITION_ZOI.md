# Proposition de partenariat — Functional Chef × ZOI Analyse Patient

> **Document** : LIV-57
> **Date** : 14 juillet 2026
> **De** : Dr Rafik Gounane
> **Pour** : Équipe ZOI Analyse Patient
> **Objet** : Intégration du module de prescription nutritionnelle EBM-driven dans la plateforme ZOI

---

## Résumé exécutif

Functional Chef est un moteur de prescription nutritionnelle ciblée par **bottleneck physiopathologique** (IR, INFLAM, DYSBIOSE), avec **EBM tiering explicite** (T1/T2/T3) sur chaque levier mobilisé. Il convertit les biomarqueurs d'un patient en une **prescription culinaire personnalisée, tracée et validable** par le médecin.

ZOI Analyse Patient est une plateforme d'analyse fonctionnelle. L'intégration d'un module nutritionnel natif, pluggable dans le parcours ZOI, créerait une **différenciation concurrentielle forte** face aux outils d'analyse standalone qui ne proposent pas de sortie thérapeutique opérationnelle.

**Proposition** : Intégrer Functional Chef comme module de sortie nutritionnelle dans ZOI, en marque blanche ou en module complémentaire, avec partage de revenus ou licence forfaitaire.

---

## 1. Contexte — Pourquoi maintenant ?

### 1.1 Le marché de la nutrition fonctionnelle explose

| Indicateur | Valeur | Source |
|-----------|--------|--------|
| Marché nutrition digital | $16B (2024) → $31B (2030) | MarketsandMarkets |
| Function Health | $350M levés, $2.5B valorisation | TechCrunch 2025 |
| Zoe | 100K+ abonnés à $348/an | TechCrunch 2024 |
| Nourish | Licorne $1B | TechCrunch 2025 |

### 1.2 Le gap que personne ne comble

Les plateformes d'analyse (dont ZOI) fournissent un **diagnostic fonctionnel** (bilan biologique, interprétation). Mais **aucune ne propose une sortie thérapeutique culinaire opérationnelle**. Le médecin reçoit un bilan, puis doit construire artisanalement le plan nutritionnel.

Functional Chef comble ce gap : bilan → bottleneck → prescription culinaire → PDF tracé.

### 1.3 La fenêtre de tir

- Zoe, Function Health, InsideTracker sont B2C uniquement
- Aucun concurrent B2B n'occupe l'espace « analyse → prescription culinaire »
- La fenêtre est ouverte **12-18 mois** avant qu'un concurrent n'arrive

---

## 2. Functional Chef — Ce qui est prêt

### 2.1 Moteur fonctionnel

| Composant | Statut |
|-----------|--------|
| Classification déterministe (3 bottlenecks) | ✅ Production |
| 63 leviers culinaires tiered EBM-F | ✅ Production |
| Filtres sécurité (9 conditions médicales) | ✅ Production |
| Composition plat (Claude API / GPT-4o-mini) | ✅ Production |
| Phénotypes avancés (MASLD, SOPK, fer) | ✅ v0.2 |
| Export PDF avec empreinte numérique | ✅ v0.2 |

### 2.2 Qualité scientifique

| Élément | Détail |
|---------|--------|
| PMIDs vérifiés | 30 vérifiés, 18 corrigés (audit juillet 2026) |
| Tests unitaires | 64 tests, CI GitHub Actions |
| EBM tiering | T1 = méta-RCT, T2 = RCT modeste, T3 = mécanistique |
| Références | PMIDs réels, pas d'invention de référence |

### 2.3 Sécurité et conformité

| Mesure | Statut |
|--------|--------|
| Auth Supabase (email, magic link) | ✅ |
| RLS (isolation praticien) | ✅ |
| Audit trail | ✅ |
| Consentement RGPD | ✅ |
| Droit à l'oubli | ✅ |
| Politique de confidentialité | ✅ |
| Dossier MDR (Classe IIa) | ✅ Rédigé, validation expert en cours |

---

## 3. Proposition d'intégration

### 3.1 Architecture technique

```
Patient ZOI
    │
    ▼
Bilan biologique ZOI ──► API Functional Chef ──► Prescription culinaire
                              │                         │
                              ▼                         ▼
                         Classification             PDF export
                         Sélection leviers          Traçabilité
                         Composition plat           Validation médecin
```

### 3.2 Modes d'intégration

#### Option A — Module embarqué (recommandé)

Functional Chef est intégré comme une **sortie native** de ZOI. Après le bilan biologique, le médecin clique « Générer une prescription culinaire » et reçoit le résultat sans quitter ZOI.

**Avantages** : Expérience utilisateur fluide, pas de changement de contexte, valeur ajoutée perçue comme native.

**Effort technique** :
- Appel API REST depuis ZOI vers Functional Chef (ou déploiement dédié)
- Retour JSON structuré → affichage dans l'UI ZOI
- PDF exportable depuis ZOI

#### Option B — Lien profond

Functional Chef reste une application séparée, avec un **bouton d'export** depuis ZOI qui pré-remplit les biomarqueurs et redirige.

**Avantages** : Indépendance des codebases, pas de maintenance croisée.

**Inconvénients** : Changement de contexte, moins fluide.

### 3.3 Flux de données

```
ZOI envoie à Functional Chef (JSON) :
{
  "patient": {
    "biomarker_values": {
      "HOMA_IR": 2.1,
      "CRP_US": 2.4,
      "TG_HDL_RATIO": 1.8,
      ...
    },
    "clinical_signals": {
      "BRISTOL_SCORE": 6,
      "BLOATING_FREQ": 5
    },
    "exclusions": {
      "allergies": ["nuts"],
      "medical": ["MICI_active"]
    },
    "context": {
      "cuisine_pref": "mediterranean",
      "time_per_meal": 30
    }
  },
  "intent": "Dîner anti-inflammatoire",
  "meal_type": "dinner"
}

Functional Chef répond (JSON) :
{
  "classification": {
    "dominant": "INFLAM",
    "co_dominant": null,
    "scores": [...],
    "rationale": "..."
  },
  "levers": [...],
  "dish": {
    "title": "...",
    "ingredients": [...],
    "steps": [...],
    "expected_effects": {...},
    "shopping_list": [...],
    "ebm_summary": {"T1": 4, "T2": 3, "T3": 0}
  },
  "warnings": [],
  "pdf_url": "..." // URL du PDF généré
}
```

---

## 4. Bénéfices mutuels

### 4.1 Pour ZOI

| Bénéfice | Impact |
|----------|--------|
| **Différenciation concurrentielle** | ZOI devient la seule plateforme d'analyse qui propose une **sortie thérapeutique opérationnelle** (pas juste un bilan) |
| **Rétention praticien** | Un module nutritionnel intégré réduit le turnover — le praticien a tout dans ZOI |
| **Hausse du panier moyen** | Module complémentaire facturable (5-10 €/consultation ou abonnement) |
| **Données utilisateurs** | Compréhension des prescriptions nutritionnelles les plus fréquentes |
| **Positionnement EBM** | Crédibilité scientifique renforcée par l'EBM tiering |

### 4.2 Pour Functional Chef

| Bénéfice | Impact |
|----------|--------|
| **Accès aux utilisateurs ZOI** | Distribution immédiate auprès de 500+ praticiens (vs building from scratch) |
| **Cas cliniques réels** | Validation du moteur sur données réelles |
| **Feedback produit** | Itérations rapides basées sur l'usage réel |
| **Crédibilité** | Intégration avec une plateforme existante = validation de la proposition de valeur |

### 4.3 Pour le praticien ZOI

| Bénéfice | Impact |
|----------|--------|
| **Gain de temps** | 15-20 min économisées par consultation (conception artisanale du plan nutritionnel) |
| **Traçabilité** | Prescription tracée, validée, exportable — couverture médico-légale |
| **Qualité EBM** | Accès à 63 leviers gradés T1/T2/T3 sans avoir à faire la veille scientifique soi-même |
| **Personnalisation** | Prescription adaptée aux biomarqueurs réels du patient |

---

## 5. Plan d'intégration

### Phase 0 — Démonstration (J+0 à J+14)

- [ ] Démo live du moteur Functional Chef sur 3 cas ZOI réels
- [ ] Comparaison sortie Functional Chef vs plan nutritionnel artisanal
- [ ] Validation de la pertinence clinique par l'équipe ZOI

### Phase 1 — Intégration API (J+15 à J+45)

- [ ] Déploiement d'une instance Functional Chef dédiée (ou API publique sécurisée)
- [ ] Spécification des endpoints (classify, compose, export-pdf)
- [ ] Tests d'intégration avec données ZOI anonymisées
- [ ] Sécurisation (API key, rate limiting, chiffrement)

### Phase 2 — Beta (J+46 à J+90)

- [ ] Ouverture à 10 praticiens ZOI pilotes
- [ ] Collecte de feedback qualitatif (satisfaction, temps gagné, pertinence)
- [ ] Itérations correctives

### Phase 3 — Production (J+91 à J+180)

- [ ] Déploiement général à l'ensemble des utilisateurs ZOI
- [ ] Activation du modèle économique
- [ ] Suivi des KPIs : consultations/mois, leviers populaires, satisfaction

---

## 6. Modèle économique

### 6.1 Options proposées

#### Option 1 — Licence SaaS (recommandée pour ZOI)

Functional Chef est facturé à ZOI sur une base mensuelle forfaitaire :
- **Starter** : 500 €/mois (jusqu'à 500 consultations/mois)
- **Pro** : 1 500 €/mois (jusqu'à 2 000 consultations/mois)
- **Enterprise** : Sur devis (illimité)

#### Option 2 — Partage de revenus

- ZOI facture le module à ses utilisateurs (ex : 5 €/consultation ou abonnement module)
- Reverse 40% à Functional Chef

#### Option 3 — Marque blanche

- Licence annuelle : 15 000 €/an
- Functional Chef devient invisible — la sortie nutritionnelle s'affiche comme un module ZOI
- Mise à jour du référentiel incluse (trimestrielle)

### 6.2 Coûts variables

Le seul coût récurrent est celui des appels LLM pour la composition du plat :

| Modèle | Coût/consultation | 500 consultations/mois |
|--------|-------------------|----------------------|
| GPT-4o-mini | ~0.002 € | ~1 € |
| Claude Sonnet 4 | ~0.03 € | ~15 € |
| Gemini 2.0 Flash | ~0.0001 € | ~0.05 € |

**Recommandation** : Utiliser GPT-4o-mini par défaut, avec fallback Claude Sonnet pour les cas complexes (triple co-dominance).

---

## 7. Périmètre et limites

### 7.1 Ce que Functional Chef apporte

- ✅ Classification physiopathologique (3 bottlenecks)
- ✅ Sélection de leviers EBM-tiered (63 leviers)
- ✅ Composition culinaire personnalisée
- ✅ Export PDF tracé
- ✅ Filtres sécurité
- ✅ Phénotypes avancés

### 7.2 Ce que Functional Chef n'apporte PAS

- ❌ Bilan biologique (déjà dans ZOI)
- ❌ Interprétation génétique
- ❌ Gestion des compléments alimentaires
- ❌ Suivi longitudinal patient
- ❌ Téléconsultation
- ❌ Facturation / encaissement

---

## 8. Prochaines étapes

1. ✅ **Ce document** — proposition de partenariat
2. 🔄 **Démo** — présentation du moteur à l'équipe ZOI (call 30 min)
3. 🔄 **Cas test** — appliquer Functional Chef à 3 patients ZOI réels
4. 🔄 **Spécification API** — définir les endpoints précis
5. 🔄 **Intégration Phase 1** — déploiement de l'API

---

## Contact

**Dr Rafik Gounane**  
[Mail] rafik@functional-chef.app  
[GitHub] rafikg-del/functional-chef-v0.1  
[Web] functional-chef.app (démo en ligne)

---

> **Document** : Proposition de partenariat Functional Chef × ZOI Analyse Patient  
> **Version** : v1.0 — 14 juillet 2026  
> **Statut** : Brouillon — à valider avant envoi
