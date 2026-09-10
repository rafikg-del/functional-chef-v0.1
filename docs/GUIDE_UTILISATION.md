# Guide d'utilisation — Functional Chef

> **Document** : LIV-67 — Guide praticien
> **Version** : v1.1 — 10 septembre 2026
> **Public** : Médecins fonctionnels, nutritionnistes, diététiciens

---

## Limites / non dispositif médical

> **Functional Chef n’est pas un dispositif médical.**  
> C’est un outil d’aide à la prescription nutritionnelle. Il ne pose pas de diagnostic. Il ne remplace pas un avis médical. Toute sortie (classification, leviers, plat, PDF) doit être **relue et validée par le praticien** avant transmission au patient.  
> Périmètre v0.2 : 3 bottlenecks (IR, INFLAM, DYSBIOSE), usage adulte, pas de pédiatrie. Les tiers EBM (T1/T2/T3) sont auto-déclarés, en revue scientifique. Qualification MDR et relecture avocat : **en attente**.

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
❌ Un dispositif médical (non certifié MDR à ce jour)  
❌ Un remplacement du jugement clinique  
❌ Un espace patient en libre-service

---

## 2. Premiers pas

### 2.1 Routes réelles de l’application

Les URLs ci-dessous correspondent au code (`src/app`). Il n’y a pas de bouton « Inscription » sur la landing : la beta passe par une **pré-inscription** puis une **invitation**.

| Route | Rôle | Auth |
|-------|------|------|
| `/` | Landing + CTA beta | Public |
| `/demo` | Cas A/B/C, classification + aperçu culinaire **sans compte** | Public, **pas** une session prod |
| `/beta` | Pré-inscription waitlist (table `beta_waitlist`) | Public |
| `/privacy` | Politique de confidentialité | Public |
| `/auth` | Connexion / création de compte / Magic Link | Public |
| `/auth/callback` | Retour OAuth/Magic Link | — |
| `/auth/profile` | Profil professionnel (nom, spécialité, RPPS optionnel) | Connecté |
| `/consent` | Consentement RGPD praticien | Connecté |
| `/dashboard` | Tableau de bord | Connecté |
| `/dashboard/consultations` | Liste des consultations | Connecté |
| `/dashboard/consultations/[id]` | Détail, validation, export PDF | Connecté |
| `/dashboard/stats` | Statistiques d’activité | Connecté |
| `/dashboard/settings` | Compte / mot de passe | Connecté |
| `/dashboard/audit` | Journal d’audit | Connecté |
| `/consultation` | Nouvelle consultation (intent → plat) | Connecté |
| `/prescription/[id]` | Vue impression (gabarit ; brancher l’id réel en prod) | Public (à durcir) |

Documents hors UI (GitHub `docs/`) : `GUIDE_UTILISATION.md`, `FAQ.md`, `NOTE_PATIENT.md`, `BETA_LAUNCH_RUNBOOK.md`.

### 2.2 Configuration requise

| Élément | Spécification |
|---------|---------------|
| **Navigateur** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| **Connexion** | Internet pour composition LLM et compte ; `/demo` fonctionne sans login ni clé Anthropic |
| **Compte** | Email professionnel **invité** (pas d’auto-inscription ouverte) |
| **Clé API** | Côté serveur (Anthropic). La démo `/demo` n’en a pas besoin (aperçu catalogue / déterministe) |

### 2.3 Création de compte (praticien invité)

1. Ouvrez `/auth` (lien reçu par email d’invitation, ou header « Connexion »)
2. Onglet **Inscription** : email professionnel + mot de passe (8 caractères min.) **ou** Magic Link
3. Vérifiez l’email via le lien (`/auth/callback`)
4. Complétez `/auth/profile` (nom, spécialité, RPPS optionnel)
5. Acceptez `/consent` (conditions + politique)
6. Vous arrivez sur `/dashboard`

La landing **ne crée pas** de compte. `/beta` enregistre seulement la file d’attente.

### 2.4 Connexion

- **Email + mot de passe** : `/auth` → Connexion
- **Magic Link** : `/auth` → Magic Link
- **Google SSO** : si le provider est activé dans Supabase Auth
- **Déconnexion** : sidebar du dashboard

---

## 3. Utilisation — Guide pas à pas

### 3.1 Créer une consultation

1. Depuis `/dashboard`, cliquez sur **Nouvelle consultation** (lien `/consultation`)
2. Renseignez les informations du patient :
   - **Biomarqueurs** : HOMA-IR, CRP-us, Omega-3 Index, etc.
   - **Signaux cliniques** : Bristol stool scale, ballonnements
   - **Contraintes** : allergies, régimes, conditions médicales
3. Saisissez l'**intent clinique** — par exemple : « Déjeuner anti-IR, post-charge glucidique du matin »
4. Cliquez sur **Générer le plat fonctionnel**

### 3.2 Utiliser un cas test

Pour vous familiariser **sans compte**, ouvrez **`/demo`** :

| Cas | Profil | Bottleneck attendu |
|-----|--------|-------------------|
| **A** | F 48 ans, HOMA-IR 2.1, TG/HDL 1.8 | IR isolée |
| **B** | H 62 ans, CRP-us 2.4, OmegaIndex 4.5% | INFLAM isolé |
| **C** | F 35 ans, Bristol 6, ballonnements quotidiens | DYSBIOSE + INFLAM |

`/demo` n’est **pas** une session production : pas de dossier patient, pas d’export PDF tracé. La classification, les leviers T1–T3 et un aperçu de plat sont déterministes (catalogue). Claude n’est utilisé que si `ANTHROPIC_API_KEY` est présent — la démo ne casse pas sinon.

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

1. Ouvrez `/dashboard/consultations` puis la fiche `/dashboard/consultations/[id]`
2. Vérifiez l'ensemble des résultats (classification, leviers, plat)
3. Ajoutez une **note de validation** (optionnelle)
4. Cliquez sur **Valider**
5. La validation est horodatée. L’export PDF et la vue `/prescription/[id]` viennent ensuite.

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

Une démo est accessible **sans authentification** à l'adresse **`/demo`** :

- 3 cas cliniques préchargés (A/B/C) + saisie personnalisée
- Édition en direct des biomarqueurs
- Classification temps réel (moteur 100% client-side)
- Aperçu d’architecture culinaire **schématique** (pas un plat Claude)

Idéale pour découvrir l’outil sans créer de compte. Pour rejoindre la beta : **`/beta`**.

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

`/dashboard/consultations` liste vos consultations avec :
- **Filtres** : toutes / en attente de validation / validées
- **Recherche** : par intent clinique
- **Indicateurs** : bottleneck dominant, statut validation, date, modèle LLM

Les listes fictives n’apparaissent que si `NEXT_PUBLIC_USE_MOCK_DATA=true` (interdit en production).

### 6.3 Statistiques

`/dashboard/stats` affiche, **à partir de vos vraies consultations** :
- Nombre total de consultations et consultations du mois
- Nombre de patients suivis
- Répartition des bottlenecks
- Top leviers
- Activité mensuelle
- Qualité EBM moyenne (ratio T1/T2/T3)

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

Voir aussi l’encadré **Limites / non DM** en tête de ce guide.

- **3 bottlenecks seulement** en v0.2 — ne couvre pas l'intégralité de la médecine fonctionnelle
- **Pas de gestion pédiatrique** — usage adulte uniquement
- **Composition LLM** côté serveur (clé Anthropic) — `/demo` classifie sans
- **Pas d'étude de validation clinique publiée** — les tiers EBM sont auto-déclarés (revue CS en cours)
- **Waitlist ≠ compte** — `/beta` n’ouvre pas `/dashboard`

---

## 8. Dépannage

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| « Aucun bottleneck déclenché » | Biomarqueurs insuffisants | Ajoutez plus de marqueurs ou utilisez un cas préchargé |
| La classification semble fausse | Seuils trop stricts pour ce profil | Vérifiez les valeurs, consultez la rationale détaillée |
| Le plat ne se génère pas | Clé API LLM manquante côté serveur | Utilisez `/demo` pour la classification, ou vérifiez `ANTHROPIC_API_KEY` |
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
| **Guide** | `docs/GUIDE_UTILISATION.md` |
| **FAQ** | `docs/FAQ.md` (mentions juridiques : pending avocat/CS) |
| **Runbook beta** | `docs/BETA_LAUNCH_RUNBOOK.md` |
| **GitHub** | [rafikg-del/functional-chef-v0.1](https://github.com/rafikg-del/functional-chef-v0.1) |
| **Email support** | support@functional-chef.app |
| **Signalement bug** | Issues GitHub |

---

> **Version** : v1.1 — 10 septembre 2026  
> **Prochaine révision** : après relecture avocat / CS  
> **Rédaction** : Hermes Agent  
> **Relecture clinique** : Dr Rafik Gounane
