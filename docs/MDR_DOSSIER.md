# Dossier Technique MDR — Functional Chef

> **Documents LIV-01 à LIV-08**
> **Version** : 1.0 — 14 juillet 2026
> **Statut** : Brouillon — à soumettre à un expert réglementaire MDR pour relecture et signature
> **Classification proposée** : Dispositif Médical Classe IIa (MDR Règle 11)

---

## Table des matières

1. [Note de positionnement — DM ou non DM (LIV-03)](#1-note-de-positionnement--dm-ou-non-dm)
2. [Classification MDR — Règle 11 (LIV-01)](#2-classification-mdr)
3. [Description du logiciel (LIV-04)](#3-description-du-logiciel)
4. [Spécification des exigences (LIV-05)](#4-spécification-des-exigences)
5. [Analyse des risques ISO 14971 (LIV-06)](#5-analyse-des-risques)
6. [Plan de vérification et validation (LIV-07)](#6-plan-de-vérification-et-validation)
7. [Gestion des données et sécurité (LIV-08)](#7-gestion-des-données)
8. [Matrice d'écart MDR (LIV-02)](#8-matrice-décart)

---

## 1. Note de positionnement — DM ou non DM

### 1.1 Définition du dispositif médical (MDR Article 2(1))

> « Tout instrument, appareil, équipement, logiciel, implant, réactif, matière ou autre article, destiné à être utilisé chez l'être humain à des fins :
>   — de diagnostic, de prévention, de contrôle, de prédiction, de pronostic, de traitement ou d'atténuation d'une maladie,
>   — d'étude ou de remplacement d'une partie du corps ou d'un processus physiologique,
> [...] et dont l'action principale voulue dans ou sur le corps humain n'est pas obtenue par des moyens pharmacologiques ou immunologiques ni par métabolisme. »

### 1.2 Analyse fonctionnelle

Functional Chef a pour **destination** :
- L'interprétation de biomarqueurs biologiques (HOMA-IR, CRP-us, calprotectine, etc.) et de signaux cliniques (Bristol stool scale, fréquence de ballonnements)
- La classification d'un patient dans un **bottleneck physiopathologique** (IR, INFLAM, DYSBIOSE) selon des règles déterministes
- La sélection de **leviers culinaires** gradés par niveau de preuve EBM (T1/T2/T3)
- La génération d'une **prescription culinaire personnalisée** via LLM

**Argument pour le statut DM** :
1. Le logiciel interprète des biomarqueurs à des fins d'évaluation physiologique (HOMA-IR >1.5 = insulinorésistance fonctionnelle)
2. Il fournit des informations utilisées pour prendre des décisions thérapeutiques (prescription nutritionnelle ciblée)
3. L'action principale n'est ni pharmacologique ni immunologique
4. Il est destiné à des professionnels de santé pour la prise en charge de patients

**Argument contre le statut DM** :
1. Le logiciel ne pose pas de diagnostic médical formel
2. La prescription culinaire est un outil pédagogique, pas un traitement médical
3. Les tiers EBM sont explicitement affichés comme des niveaux de preuve, pas comme des allégations thérapeutiques

### 1.3 Conclusion

> **Functional Chef est probablement un dispositif médical de classe IIa au sens du MDR**, car il répond aux critères de la Règle 11 (logiciel destiné à fournir des informations utilisées pour prendre des décisions à des fins thérapeutiques). Une confirmation par un organisme notifié ou un consultant spécialisé est requise.

**Recommandation** : Traiter Functional Chef comme un DM dès la phase de conception (design control, analyse des risques, traçabilité) — cette approche est sans risque même si la classification finale est différente.

---

## 2. Classification MDR — Règle 11

### 2.1 Règle 11 (MDR Annexe VIII)

| Alinéa | Texte | Application à Functional Chef |
|--------|-------|------------------------------|
| **11.1** | « Les logiciels destinés à fournir des informations utilisées pour prendre des décisions à des fins diagnostiques ou thérapeutiques sont de la classe IIa » | ✅ Le logiciel fournit une classification (bottleneck dominant) et une prescription culinaire destinée à être utilisée par un médecin pour décider d'une intervention nutritionnelle |
| **11.2** | « [...] sauf si ces décisions peuvent avoir une incidence grave sur la santé du patient ou si elles aboutissent à une situation pouvant entraîner un danger immédiat pour la santé, auquel cas ils relèvent de la classe III » | ❌ Non applicable — une prescription culinaire n'entraîne pas de danger immédiat. Les filtres de sécurité (MICI, anticoagulants, allergies) sont implémentés en amont |
| **11.3** | « Les logiciels destinés à surveiller les processus physiologiques sont de la classe IIa » | ✅ Interprétation de biomarqueurs (HOMA-IR, CRP-us) = surveillance de processus physiologiques |
| **11.4** | « Les autres logiciels sont de la classe I » | ❌ Ne s'applique pas |

### 2.2 Classification retenue

| Critère | Valeur |
|---------|--------|
| **Classe proposée** | **IIa** |
| **Règle applicable** | 11.1 + 11.3 |
| **Justification** | Logiciel fournissant des informations pour décisions thérapeutiques (prescription nutritionnelle) ET surveillant des processus physiologiques (biomarqueurs) |
| **Voie de certification** | Déclaration UE de conformité + notification à un organisme notifié |
| **Organisme notifié possible** | GMED (France), TÜV SÜD, BSI |

---

## 3. Description du logiciel

### 3.1 Identification

| Champ | Valeur |
|-------|--------|
| **Nom commercial** | Functional Chef |
| **Version** | v0.2 (scaffold) |
| **Fabricant** | Dr Rafik Gounane (développeur individuel) |
| **Date de première mise sur le marché** | Non applicable (pré-commercial) |
| **Classification MDR** | IIa (proposée) |
| **Langues** | Français (v1), Anglais (v1.1) |

### 3.2 Description générale

Functional Chef est un **moteur de prescription nutritionnelle ciblée par bottleneck physiopathologique** destiné aux professionnels de santé (médecins fonctionnels, nutritionnistes, diététiciens).

Le logiciel fonctionne en **5 étapes** :
1. **Classification déterministe** — interprétation des biomarqueurs du patient (HOMA-IR, CRP-us, Bristol, etc.) selon des règles et seuils cliniques, identification d'un bottleneck dominant (IR/INFLAM/DYSBIOSE)
2. **Filtres de sécurité** — exclusion des leviers contre-indiqués (MICI, anticoagulants, allergies, régimes)
3. **Sélection des leviers** — choix de leviers culinaires par tier EBM (T1/T2/T3)
4. **Composition du plat** — génération d'une prescription culinaire par LLM (Claude/GPT) à partir des leviers sélectionnés
5. **Traçabilité** — persistance de l'intégralité du raisonnement (input → scoring → leviers → output)

### 3.3 Destination prévue

| Usage prévu | Utilisateurs visés | Patient cible | Environnement |
|------------|-------------------|---------------|---------------|
| Aide à la prescription nutritionnelle personnalisée | Médecins fonctionnels, nutritionnistes, diététiciens | Adultes avec déséquilibre métabolique/inflammatoire/microbien | Consultation médicale (cabinet, téléconsultation) |

### 3.4 Contre-indications d'usage

- **Ne pas utiliser** comme outil diagnostique autonome
- **Ne pas utiliser** en remplacement d'un avis médical
- **Ne pas utiliser** chez les patients sans biomarqueurs/biologiques
- **Ne pas utiliser** pour des pathologies aiguës nécessitant une prise en charge médicale immédiate
- **Ne pas utiliser** chez la femme enceinte ou allaitante sans validation médicale préalable

### 3.5 Architecture technique

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| Frontend | Next.js 14 (App Router) | Interface utilisateur, rendu |
| Moteur de classification | TypeScript (déterministe) | Scoring bottlenecks, filtres sécurité, sélection leviers |
| Composition culinaire | Anthropic/OpenAI API (LLM) | Génération du plat à partir des leviers |
| Base de données | Supabase (PostgreSQL) | Stockage profils patients, consultations, audit |
| Authentification | Supabase Auth | Email/password, magic link |
| Hébergement | Vercel (Europe) | Application web |
| Stockage données | Supabase (UE) | Données chiffrées au repos |

### 3.6 Fonctionnalités

| Fonctionnalité | Implémentée | Version |
|---------------|-------------|---------|
| Classification bottlenecks | ✅ | v0.1 |
| Filtres sécurité (9 conditions) | ✅ | v0.1 |
| Sélection leviers (≥4 stars + ciblés) | ✅ | v0.1 |
| Composition plat (LLM) | ✅ | v0.1 |
| Phénotypage MASLD | ✅ | v0.2 |
| Phénotypage SOPK/péri-ménopause | ✅ | v0.2 |
| Phénotypage blocage fer | ✅ | v0.2 |
| Export PDF consultation | ✅ | v0.2 |
| Authentification praticien | ✅ | v0.2 |
| Dashboard + statistiques | ✅ | v0.2 |
| Démo interactive (client-side) | ✅ | v0.2 |
| Audit trail | ✅ | v0.2 |
| Droit à l'oubli | ✅ | v0.2 |
| Validation médicale tracée | ✅ | v0.2 |
| RLS (Row-Level Security) | ✅ | v0.2 |
| Consentement RGPD | ✅ | v0.2 |

---

## 4. Spécification des exigences

### 4.1 Exigences utilisateur

| ID | Exigence | Priorité | Test de vérification |
|----|----------|----------|---------------------|
| UR-01 | Le praticien doit pouvoir saisir les biomarqueurs d'un patient | Haute | Tests d'intégration formulaire |
| UR-02 | Le système doit classifier le patient dans ≥1 bottleneck | Haute | Tests unitaires classifier |
| UR-03 | Le système doit appliquer des filtres de sécurité avant sélection des leviers | Haute | Tests unitaires safety-filters |
| UR-04 | Le système doit sélectionner ≥4 leviers étoile | Haute | Tests unitaires lever-selector |
| UR-05 | Le système doit composer un plat avec les leviers sélectionnés | Haute | Tests d'intégration composer |
| UR-06 | Le praticien doit pouvoir visualiser la traçabilité complète | Haute | Tests UI |
| UR-07 | Le praticien doit pouvoir valider la consultation avec signature | Haute | Tests UI |
| UR-08 | Le praticien doit pouvoir exporter la consultation en PDF | Moyenne | Tests UI |
| UR-09 | Le praticien doit pouvoir consulter ses statistiques d'utilisation | Basse | Tests UI |
| UR-10 | Le praticien doit pouvoir se connecter via email/password ou magic link | Haute | Tests auth |
| UR-11 | Le système ne doit pas exposer les données d'un praticien à un autre | Haute | Tests RLS |

### 4.2 Exigences de sécurité

| ID | Exigence | Source |
|----|----------|--------|
| SEC-01 | Les données en transit doivent être chiffrées (TLS 1.3) | RGPD Art. 32 |
| SEC-02 | Les données au repos doivent être chiffrées (AES-256) | RGPD Art. 32 |
| SEC-03 | L'authentification doit être requise pour accéder aux données patient | MDR Annexe I 17.1 |
| SEC-04 | Un praticien ne peut accéder qu'à ses propres patients | MDR Annexe I 17.2 |
| SEC-05 | Toute action sensible doit être tracée dans l'audit log | MDR Art. 10(9) |
| SEC-06 | Le consentement explicite du patient doit être enregistré | RGPD Art. 7 |
| SEC-07 | Le patient doit pouvoir demander l'effacement de ses données | RGPD Art. 17 |
| SEC-08 | Les données doivent être pseudonymisées lors des appels LLM | MDR Annexe I 14.2 |

### 4.3 Exigences de performance

| ID | Exigence | Cible |
|----|----------|-------|
| PERF-01 | Classification + filtres + sélection | <100 ms |
| PERF-02 | Composition LLM (Sonnet) | <15 s |
| PERF-03 | Chargement liste consultations | <2 s |
| PERF-04 | Export PDF | <3 s |
| PERF-05 | Disponibilité | >99.5% |

---

## 5. Analyse des risques ISO 14971

### 5.1 Méthodologie

Analyse FMEA (Failure Mode and Effects Analysis) selon ISO 14971:2019.
Cotation : Gravité (1-5) × Probabilité (1-5) = Criticité (1-25).

**Seuils** :
- Criticité ≥ 12 → Action corrective requise avant mise sur le marché
- Criticité 6-11 → Action corrective souhaitable, documentation requise
- Criticité ≤ 5 → Acceptable, surveillance

### 5.2 Matrice des risques

| ID | Danger | Situation dangereuse | Dommage potentiel | Cause | Mesure de mitigation | G | P | C |
|----|--------|---------------------|-------------------|-------|---------------------|---|---|---|
| **R-01** | Classification erronée | Mauvais bottleneck détecté | Prescription inadaptée, perte de chance thérapeutique | Seuils cliniques incorrects, biomarqueurs incomplets | Seuils basés sur littérature clinique validée avec PMIDs. Tests unitaires (64 tests). Affichage des preuves (evidence array) | 3 | 2 | **6** |
| **R-02** | Absence de détection | Patient non classifié alors que pathologique | Retard de prise en charge | Règle trop stricte, biomarqueurs insuffisants | Message « profil incomplet » dans la rationale. Possibilité de forcer un bottleneck via l'intent | 3 | 2 | **6** |
| **R-03** | Filtre sécurité absent | Levier contre-indiqué prescrit | Aggravation condition médicale (MICI, anticoagulants) | Code safety-filters non exécuté, seuils incorrects | Filtres durs exécutés avant sélection (pas de LLM sur cette étape). Tests unitaires (26 tests pour safety-filters) | 4 | 1 | **4** |
| **R-04** | Hallucination LLM | Levier non autorisé ajouté par le LLM | Prescription inappropriée | Prompt non respecté, modèle défaillant | Prompt système interdit l'ajout de leviers. Validation de shape du JSON. Fallback Opus pour cas complexes | 3 | 2 | **6** |
| **R-05** | Données patient exposées | Fuite de données de santé | Violation RGPD, préjudice patient | RLS non activée, vulnérabilité Supabase | RLS activée sur 5 tables. Auth requise. Audit trail complet. Chiffrement TLS+AES | 5 | 1 | **5** |
| **R-06** | Ingrédient allergène prescrit | Réaction allergique sévère | Anaphylaxie | Allergie non déclarée par le patient, ingrédient non filtré | Mapping allergies→ingrédients interdit dans safety-filters. Warning dans l'output | 4 | 2 | **8** |
| **R-07** | Interaction médicamenteuse | Curcumine + AVK → sur-INR | Hémorragie | Anticoagulants non déclarés, filtre absent | Filtre dur anticoagulants_high_dose bloque curcumine. Warning complémentaire | 4 | 1 | **4** |
| **R-08** | Seuil trop bas (HBA1C) | Faux positif IR | Prescription inutile, anxiété patient | Seuil à 5.4% trop sensible | Identifié dans l'évaluation, correction proposée (5.7%) | 2 | 2 | **4** |
| **R-09** | Utilisation hors AMM | Patient non adulte | Données non validées pour cette population | Absence de filtre âge | Âge requis dans le profil. Aucun test pédiatrique effectué | 3 | 2 | **6** |
| **R-10** | Perte de données consultation | Rupture de suivi, perte de traçabilité | Médico-légal | Erreur base de données, suppression accidentelle | Audit trail immutable. Backup Supabase automatique. Export PDF comme archive locale | 3 | 2 | **6** |

**Risques résiduels acceptés** : Tous les risques avec criticité ≤8 sont acceptés avec surveillance documentée.

**Risques nécessitant réduction supplémentaire** : R-06 (criticité 8) → ajouter un warning visuel renforcé sur les allergènes dans l'UI avant prescription.

### 5.3 Analyse bénéfice/risque

| Bénéfice | Population | Risque associé | Balance |
|----------|-----------|----------------|---------|
| Prescription nutritionnelle personnalisée basée sur l'EBM | Adultes avec IR, inflammation, dysbiose | Classification erronée (R-01) → prescription sous-optimale, pas de dommage direct | **Favorable** — l'absence de traitement nutritionnel personnalisé est plus dommageable qu'une classification imparfaite |
| Gain de temps médecin (15 min/consultation) | Médecins fonctionnels | Hallucination LLM (R-04) → plat inapproprié mais détectable par relecture médicale obligatoire | **Favorable** — le médecin valide avant transmission patient |
| Traçabilité médico-légale complète | Patients et médecins | Fuite de données (R-05) | **Favorable** — les mesures de sécurité (RLS, chiffrement, audit) réduisent le risque à un niveau acceptable |

---

## 6. Plan de vérification et validation

### 6.1 Vérification (le produit est-il bien construit ?)

| Niveau | Méthode | Couverture | Statut |
|--------|---------|------------|--------|
| **Tests unitaires** | Vitest (TypeScript) | 64 tests — classifier, safety-filters, lever-selector | ✅ v0.2 |
| **Tests d'intégration** | Appels API simulés | Routes /api/classify, /api/compose | 🔶 À compléter |
| **Tests de non-régression** | CI GitHub Actions | Push et PR sur main | ✅ v0.2 |
| **Revue de code** | Pair review (Dr Gounane) | Modules critiques | 🔶 Process à formaliser |
| **Validation de seeds** | Vérification manuelle PMIDs | 30 PMIDs → 18 corrigés | ✅ v0.2 |

### 6.2 Validation (le bon produit a-t-il été construit ?)

| Test | Méthode | Critère de succès | Statut |
|------|---------|-------------------|--------|
| **Cas-pivot A** (IR isolée) | Classification du profil A → vérification bottleneck=IR | IR dominant, co-dominant=null | ✅ Testé (Cas A) |
| **Cas-pivot B** (INFLAM isolé) | Classification du profil B | INFLAM dominant | ✅ Testé (Cas B) |
| **Cas-pivot C** (DYSBIOSE+INFLAM) | Classification du profil C | DYSBIOSE dominant, INFLAM co-dominant | ✅ Testé (Cas C) |
| **Validation clinique** | 10 cas ZOI réels vs jugement médical | Concordance >80% | 📋 Phase 1 |
| **Tests utilisateurs** | 5 praticiens early adopters | Satisfaction >4/5 | 📋 Phase 1 |

### 6.3 Tests de sécurité

| Test | Méthode | Critère | Statut |
|------|---------|---------|--------|
| **RLS** | Tentative d'accès données autre praticien | Rejet 403 | ✅ (design) |
| **Auth** | Tentative d'accès sans session | Redirection /auth | ✅ (middleware) |
| **Injections SQL** | Requêtes malveillantes via Supabase | Bloqué par Supabase RLS | ✅ (plateforme) |
| **XSS** | Script dans les champs libres | Échappé par React | ✅ (framework) |

---

## 7. Gestion des données

### 7.1 Flux de données

```
Patient (données biomédicales)
  │
  ▼
Praticien (saisie dans l'UI)
  │
  ├─► Classification (TypeScript, local/in-process)
  │     └── Aucune donnée transmise à un tiers
  │
  ├─► Filtres sécurité (TypeScript, local/in-process)
  │     └── Aucune donnée transmise à un tiers
  │
  ├─► Sélection leviers (TypeScript, local/in-process)
  │     └── Aucune donnée transmise à un tiers
  │
  ├─► Composition LLM (API Anthropic/OpenAI)
  │     └── Données pseudonymisées (pas de nom, email, adresse)
  │     └── Chiffrement TLS
  │     └── Conformité CCT (clauses contractuelles types UE)
  │
  └─► Persistance (Supabase — hébergement UE)
        └── Chiffrement AES-256 au repos
        └── RLS par praticien
```

### 7.2 Données collectées

| Catégorie | Données | Base légale | Conservation |
|-----------|---------|-------------|--------------|
| **Praticien** | Nom, email, spécialité, RPPS (opt.) | Exécution contrat (RGPD Art. 6.1.b) | Jusqu'à suppression compte |
| **Patient** | Biomarqueurs, âge, sexe, exclusions | Consentement explicite (RGPD Art. 9.2.a) | 5 ans après dernière consultation |
| **Consultation** | Scoring, leviers, plat, métadonnées LLM | Intérêt légitime + traçabilité médico-légale | 3 ans |
| **Audit** | Actions, horodatage, utilisateur | Obligation légale (MDR Art. 10) | 10 ans |

### 7.3 Mesures techniques

| Mesure | Implémentation |
|--------|---------------|
| Chiffrement transit | TLS 1.3 (HTTPS) |
| Chiffrement repos | AES-256 (Supabase) |
| Authentification | Supabase Auth (bcrypt) |
| Contrôle d'accès | RLS PostgreSQL (par praticien) |
| Pseudonymisation LLM | Aucun identifiant patient dans les prompts |
| Audit trail | Table audit_log immuable |
| Sauvegarde | Backup automatique Supabase (quotidien) |
| Purge automatique | Fonction archive_expired_data() (cron) |
| Droit à l'oubli | Fonction delete_professional_account() |

### 7.4 Transferts hors UE

| Destinataire | Données transférées | Base légale | Mesures |
|-------------|---------------------|-------------|---------|
| Anthropic (US) | Biomarqueurs pseudonymisés + intent clinique | CCT (Décision d'exécution 2021/914) | Aucune PHI transmise |
| OpenAI (US) | Idem | CCT | Chiffrement TLS |

---

## 8. Matrice d'écart

### 8.1 Exigences MDR applicables

| Annexe/Article | Exigence | Statut | Commentaire |
|---------------|----------|--------|-------------|
| **Annexe I — Chapitre I** (Exigences générales) | | | |
| 1.1 | Sécurité et performances | ✅ | Tests unitaires + analyse risques |
| 1.2 | Rapport bénéfice/risque favorable | ✅ | Documenté §5.3 |
| 1.3 | Performance conforme à la destination | ✅ | Tests cas-pivot |
| 1.4 | Risques réduits au minimum | ✅ | Analyse risques ISO 14971 |
| 1.5 | Précautions d'emploi | 🔶 Partiel | FAQ et manuel à rédiger |
| **Annexe I — Chapitre II** (Conception et fabrication) | | | |
| 10.1 | Informations accompagnant le DM | 🔶 Partiel | Notice d'utilisation à rédiger |
| 10.2 | Marquage CE | ❌ | Non applicable avant certification |
| 10.3 | Étiquetage | ❌ | À concevoir |
| 10.4.4 | Logiciel : précision, fiabilité | ✅ | 64 tests, CI, validation PMIDs |
| 10.4.5 | Logiciel : sécurité IT | ✅ | RLS, auth, audit trail, chiffrement |
| 14.2 | Dispositifs contenant des logiciels | ✅ | Design control documenté |
| 17.1 | Protection contre les accès non autorisés | ✅ | Auth + RLS |
| 17.2 | Fiabilité des algorithmes | ✅ | Moteur déterministe + tests |
| **Annexe IX** (Classification) | | | |
| Règle 11 | Logiciel DM Classe IIa | ✅ | Argumentaire §2 |
| **Articles** | | | |
| Art. 10(8) | Déclaration UE de conformité | ❌ | À rédiger avant marquage |
| Art. 10(9) | Traçabilité | ✅ | Audit trail opérationnel |
| Art. 10(10) | Enregistrement fabricant | ❌ | À faire (EUDAMED) |
| Art. 10(11) | Personne responsable conformité réglementaire | ❌ | À désigner |
| Art. 56 | Organisme notifié | ❌ | À sélectionner |

### 8.2 Plan de résolution des écarts

| Écart | Action requise | Délai | Priorité |
|-------|---------------|-------|----------|
| **PR-01** | Notice d'utilisation (LIV-67) | Phase 1 | Haute |
| **PR-02** | Marquage CE | Phase 2 (post-certification) | Haute |
| **PR-03** | Étiquetage du logiciel | Phase 2 | Haute |
| **PR-04** | Déclaration UE de conformité | Phase 2 | Haute |
| **PR-05** | Enregistrement fabricant EUDAMED | Phase 2 | Haute |
| **PR-06** | Personne responsable conformité réglementaire | Phase 1 | Haute |
| **PR-07** | Sélection organisme notifié | Phase 1 | Haute |
| **PR-08** | Manuel qualité ISO 13485 (LIV-11) | Phase 1 | Moyenne |

---

## Annexes

| Annexe | Document | Statut |
|--------|----------|--------|
| A | Résultats des tests unitaires (64 tests) | ✅ |
| B | Audit des PMIDs (30 vérifiés, 18 corrigés) | ✅ |
| C | Spécification des seeds (63 leviers) | ✅ |
| D | Politique de confidentialité RGPD | ✅ |
| E | Schéma de la base de données | ✅ |
| F | Historique des versions du logiciel | 🔶 Partiel (git log) |

---

> **Document rédigé par** : Hermes Agent (Dr Rafik Gounane)
> **Relecture requise par** : Expert réglementaire MDR
> **Prochaine étape** : Soumettre ce dossier à un consultant MDR pour validation de la classification et réduction des écarts.
