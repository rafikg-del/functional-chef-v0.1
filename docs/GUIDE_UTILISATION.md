# Guide d'utilisation — Functional Chef

> **Document** : LIV-67 — Guide praticien
> **Version** : v1.0 — 14 juillet 2026
> **Public** : Médecins fonctionnels, nutritionnistes, diététiciens

---

## 1. Introduction

### 1.1 Qu'est-ce que Functional Chef ?

Functional Chef est un **moteur de prescription nutritionnelle ciblée par bottleneck physiopathologique**. Il ne génère pas des recettes — il traduit un objectif physiopathologique (lever un bottleneck métabolique, inflammatoire ou microbien) en **architecture culinaire opérationnelle** avec **EBM tiering explicite** (T1/T2/T3) sur chaque levier mobilisé.

### 1.2 À qui s'adresse-t-il ?

- Médecins fonctionnels et nutritionnels
- Diététicien(ne)s et nutritionnistes
- Tout professionnel de santé pratiquant la prescription nutritionnelle personnalisée

### 1.3 Ce que Functional Chef n'est pas

❌ Un générateur de recettes génériques  
❌ Un outil de diagnostic médical  
❌ Un dispositif médical autonome (nécessite validation humaine)  
❌ Un remplacement du jugement clinique

---

## 2. Premiers pas

### 2.1 Configuration requise

| Élément | Spécification |
|---------|---------------|
| **Navigateur** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| **Connexion** | Internet (appels LLM) |
| **Compte** | Email professionnel |
| **Clé API** | Anthropic ou OpenAI (optionnel, la démo fonctionne sans) |

### 2.2 Création de compte

1. Accédez à **[URL de l'application]**
2. Cliquez sur **Inscription**
3. Renseignez votre email professionnel et un mot de passe (8 caractères min.)
4. Vérifiez votre email via le lien reçu
5. Complétez votre profil professionnel (nom, spécialité, RPPS optionnel)
6. Acceptez les conditions d'utilisation et la politique de confidentialité

### 2.3 Connexion

- **Email + mot de passe** : connexion classique
- **Magic Link** : un lien de connexion unique envoyé par email (pas de mot de passe à retenir)

---

## 3. Utilisation — Guide pas à pas

### 3.1 Créer une consultation

1. Depuis le tableau de bord, cliquez sur **Nouvelle consultation**
2. Renseignez les informations du patient :
   - **Biomarqueurs** : HOMA-IR, CRP-us, Omega-3 Index, etc.
   - **Signaux cliniques** : Bristol stool scale, ballonnements
   - **Contraintes** : allergies, régimes, conditions médicales
3. Saisissez l'**intent clinique** — par exemple : « Déjeuner anti-IR, post-charge glucidique du matin »
4. Cliquez sur **Générer le plat fonctionnel**

### 3.2 Utiliser un cas test

Pour vous familiariser avec l'outil, 3 cas préchargés sont disponibles :

| Cas | Profil | Bottleneck attendu |
|-----|--------|-------------------|
| **A** | F 48 ans, HOMA-IR 2.1, TG/HDL 1.8 | IR isolée |
| **B** | H 62 ans, CRP-us 2.4, OmegaIndex 4.5% | INFLAM isolé |
| **C** | F 35 ans, Bristol 6, ballonnements quotidiens | DYSBIOSE + INFLAM |

### 3.3 Lire les résultats

Le résultat d'une consultation s'affiche en plusieurs sections :

#### a) Classification
Le moteur affiche le **bottleneck dominant** (IR / INFLAM / DYSBIOSE) et l'éventuel **co-dominant**. Chaque bottleneck reçoit :
- Un **score pondéré** (points)
- Le détail des **biomarqueurs déclenchés** (majeurs, modérés, mineurs)
- La **rationale** du moteur

#### b) Leviers sélectionnés
Liste des interventions culinaires avec pour chacune :
- **Badge EBM** : T1 (méta-analyse RCT), T2 (RCT modeste), T3 (mécanistique)
- **Effet attendu** : description quantitative
- **Rôle** : ★ universel (transversal, ≥2 bottlenecks) ou ciblé

#### c) Plat composé
- Titre fonctionnel du plat
- Architecture nutritionnelle (50% végétaux / 20-30% protéines / 20% lipides)
- Ingrédients avec quantités
- Protocole de cuisson (étapes, temps, température)
- Effets biologiques attendus (2-4h / 4 sem / 12 sem)
- Liste de courses
- Avertissements éventuels

#### d) Badges EBM-F
Chaque levier activé est accompagné d'un badge coloré :

| Badge | Signification | Exemple |
|-------|---------------|---------|
| 🟢 **T1** | ≥1 méta-analyse de RCT humains | Vinaigre pré-prandial (Shishehbor 2017, n=11 RCT) |
| 🟡 **T2** | RCT modeste ou cohorte solide | Curcumine culinaire (Sahebkar 2016) |
| 🔴 **T3** | Mécanistique / observationnel | Bouillon d'os (données mécanistiques) |

### 3.4 Valider une consultation

Avant de transmettre le résultat à un patient, le médecin doit valider la consultation :

1. Ouvrez la consultation depuis la **liste des consultations**
2. Vérifiez l'ensemble des résultats (classification, leviers, plat)
3. Ajoutez une **note de validation** (optionnelle)
4. Cliquez sur **✅ Valider**
5. La validation est horodatée et signée électroniquement dans l'audit trail

### 3.5 Exporter en PDF

1. Depuis le détail d'une consultation, cliquez sur **📄 Export PDF**
2. Le PDF téléchargé contient :
   - L'en-tête avec l'intent clinique
   - La classification complète avec les scores
   - La liste des leviers mobilisés
   - La prescription culinaire (ingrédients, protocole)
   - Les effets biologiques attendus
   - La liste de courses
   - Les avertissements
   - L'empreinte numérique (hash de traçabilité)

---

## 4. Démo interactive

Une démo est accessible sans authentification à l'adresse **`/demo`** :

- 3 cas cliniques préchargés modifiables
- Édition en direct des biomarqueurs
- Classification temps réel (moteur 100% client-side)
- Aperçu de la prescription culinaire

Idéale pour découvrir l'outil sans créer de compte.

---

## 5. Interprétation des résultats

### 5.1 Les 3 bottlenecks

| Bottleneck | Définition | Marqueur clé | Cible |
|-----------|------------|-------------|-------|
| **IR** | Perte précoce du signal insulinique (HOMA-IR 1.5-2.5) | HOMA-IR, TG/HDL, insuline à jeun | ↑ sensibilité insulinique |
| **INFLAM** | Inflammation chronique bas grade (CRP-us 1-3 mg/L) | CRP-us, Omega-3 Index, AA/EPA | ↓ NF-κB, ↓ CRP |
| **DYSBIOSE** | Altération composition microbiote intestinal | Bristol, ballonnements, calprotectine | ↑ diversité, ↑ butyrate |

### 5.2 Phénotypes spéciaux

| Phénotype | Bottleneck parent | Condition | Leviers priorisés |
|-----------|------------------|-----------|-------------------|
| **hepatic_masld** | IR | Stéatose confirmée par imagerie (PDFF ≥5% ou MRS >5.56%) | Anti-DNL, anti-fructose |
| **pcos_adipose** | IR | F + SHBG bas + acide urique ≥350 µmol/L + obésité abdominale | Insulinosensibilisateurs, séquence alimentaire |
| **functional_iron_blockade** | INFLAM | TSAT <20% | Décaler thé/café, éviter curcumine haute dose |

### 5.3 La cascade causale

En cas de triple co-dominance (les 3 bottlenecks déclenchés), le moteur applique une priorité :
**IR → INFLAM → DYSBIOSE**

> ⚠️ **Note** : Cette cascade est un **postulat de design**, pas une règle clinique validée. En pratique, les 3 bottlenecks sont interconnectés et l'ordre reflète une hypothèse causale amont → aval.

---

## 6. Gestion des patients

### 6.1 Créer un profil patient

Les profils patients sont créés automatiquement lors de la première consultation. Chaque patient est lié à votre compte praticien — aucun autre praticien ne peut y accéder.

### 6.2 Suivi des consultations

Le tableau de bord liste toutes vos consultations avec :
- **Filtres** : toutes / en attente de validation / validées
- **Recherche** : par intent clinique
- **Indicateurs** : bottleneck dominant, statut validation, date, modèle LLM

### 6.3 Statistiques

La page Statistiques affiche :
- Nombre total de consultations et consultations du mois
- Nombre de patients suivis
- Répartition des bottlenecks diagnostiqués
- Top leviers les plus prescrits
- Activité mensuelle
- Qualité EBM moyenne (ratio T1/T2/T3 par plat)

---

## 7. Bonnes pratiques

### 7.1 Pour une classification fiable

- **Minimum de biomarqueurs recommandé** : ≥3 marqueurs IR + ≥2 marqueurs INFLAM + ≥2 signaux DYSBIOSE
- **Préférer des dosages récents** (<3 mois). Les biomarqueurs évoluent
- **Renseigner le sexe** du patient (nécessaire pour les phénotypes spécifiques)
- **Déclarer toutes les allergies et conditions médicales** pour activer les filtres de sécurité

### 7.2 Pour une prescription pertinente

- **Préciser le contexte** : cuisine préférée, temps disponible, budget, équipement
- **Adapter le type de repas** : petit-déjeuner, déjeuner, dîner, collation, journée complète
- **Toujours valider médicalement** avant transmission au patient

### 7.3 Limites à connaître

- **3 bottlenecks seulement** en v0.2 — ne couvre pas l'intégralité de la médecine fonctionnelle
- **Pas de gestion pédiatrique** — usage adulte uniquement
- **Composition LLM dépendante de la clé API** — le moteur de classification fonctionne sans
- **Pas d'étude de validation clinique** — les tiers EBM sont auto-déclarés (en cours de revue par le comité scientifique)

---

## 8. Dépannage

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| « Aucun bottleneck déclenché » | Biomarqueurs insuffisants | Ajoutez plus de marqueurs ou utilisez un cas préchargé |
| La classification semble fausse | Seuils trop stricts pour ce profil | Vérifiez les valeurs, consultez la rationale détaillée |
| Le plat ne se génère pas | Clé API LLM manquante | Configurez ANTHROPIC_API_KEY ou utilisez la démo |
| Erreur « Session expirée » | Token auth expiré | Reconnectez-vous |
| Consultation non trouvée | Filtre RLS actif | Seules vos consultations sont visibles |
| Le PDF ne se télécharge pas | Bloqueur de pop-up | Autorisez les pop-ups pour ce site |

---

## 9. Sécurité et conformité

- **Données chiffrées** en transit (TLS 1.3) et au repos (AES-256)
- **RLS** : isolation totale entre praticiens
- **Audit trail** : toutes les actions sensibles sont tracées (10 ans)
- **RGPD** : consentement explicite, droit à l'oubli, portabilité
- **Appels LLM** : données pseudonymisées (aucun identifiant direct)

---

## 10. Contact et support

| Canal | Adresse |
|-------|---------|
| **Documentation** | `/docs` |
| **GitHub** | [rafikg-del/functional-chef-v0.1](https://github.com/rafikg-del/functional-chef-v0.1) |
| **Email support** | support@functional-chef.app |
| **Signalement bug** | Issues GitHub |

---

> **Version** : v1.0 — 14 juillet 2026  
> **Prochaine révision** : 14 janvier 2027  
> **Rédaction** : Hermes Agent  
> **Relecture clinique** : Dr Rafik Gounane
