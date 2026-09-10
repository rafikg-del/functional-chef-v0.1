# Beta Launch Runbook — Functional Chef

> **Document** : LIV-70 — Runbook d’entrée en beta
> **Public** : opérateur (Dr Rafik Gounane + relais technique)
> **Principe** : la beta est une invitation contrôlée, pas une ouverture grand public.

Ce document liste les **étapes code** (Vercel, Supabase, seed, premier praticien) et les **actions humaines** qui restent hors repo.

---

## 0. Prérequis

| Élément | Statut attendu |
|---------|----------------|
| Repo `rafikg-del/functional-chef-v0.1` sur `main` | vert CI (type-check, vitest, cas A/B/C) |
| Projet Supabase (région UE) | créé, Auth email activé |
| Projet Vercel | lié au repo, preview + production |
| Compte Anthropic | clé API, budget d’alerte |
| Domaine | `functional-chef.app` ou sous-domaine Vercel |

Ne commitez jamais de secrets. Copier `.env.example` vers les stores Vercel / Supabase seulement.

---

## 1. Supabase — migrations + seed

1. Lier le projet :
   ```bash
   supabase link --project-ref <PROJECT_REF>
   supabase db push
   ```
   Migrations attendues :
   - `001_init_schema.sql` — référentiel + consultations
   - `002_auth_profiles.sql` — profils praticiens, RLS, audit, consentement
   - `003_content_hash_and_rls.sql` — hash SHA-256, RLS update, validate RPC
   - `004_beta_waitlist.sql` — pré-inscription (insert public, select admin)
2. Seed du référentiel, dans l’ordre :
   ```bash
   # SQL editor, ou :
   npm run db:seed   # requiert DATABASE_URL
   ```
   Fichiers : `01_bottlenecks` → `02_biomarkers` → `03_biomarker_thresholds` → `04_culinary_levers` → `05_lever_bottleneck_map` → `06_bioavailability_synergies`.
3. Auth :
   - Enable Email (password + Magic Link).
   - Redirect URLs : `https://<prod>/auth/callback` et l’URL Vercel preview.
   - Confirm email **on** pour la beta (pas d’auto-confirm grand public).
4. Admin waitlist :
   - Dans Authentication → Users, poser `app_metadata.role = "admin"` sur le compte opérateur.
   - Sans ce claim, RLS refuse le `SELECT` sur `beta_waitlist` (le `service_role` reste utilisable dans le SQL editor).
5. Vérifier RLS : un client anon doit **pouvoir INSERT** dans `beta_waitlist` et **ne pas pouvoir SELECT**.

---

## 2. Vercel — variables d’environnement

Production **et** Preview, à partir de `.env.example` :

| Variable | Prod |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (jamais `NEXT_PUBLIC_`) |
| `DATABASE_URL` | optionnel (seed / ops) |
| `ANTHROPIC_API_KEY` | secret |
| `ANTHROPIC_MODEL_PRIMARY` | `claude-sonnet-4-20250514` |
| `ANTHROPIC_MODEL_COMPLEX` | `claude-opus-4-7` |
| `NEXT_PUBLIC_APP_URL` | URL canonique HTTPS |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_USE_MOCK_DATA` | **`false`** (fail-closed dashboard si erreur Supabase) |

Déployer `main`. Smoke :

- `/` — CTA pré-inscription visible, bandeau non-DM
- `/demo` — cas A, B, C classifient **sans login**
- `/beta` — un POST réel crée une ligne `beta_waitlist`
- `/auth` — Magic Link / password
- `/dashboard` — liste vide si aucune consultation (pas de faux dossiers)

---

## 3. Premier praticien invité

1. Lire `beta_waitlist` (SQL editor ou user admin).
2. Envoyer un email d’invitation **humain** (pas un dump de liste) :
   - lien `/auth` (créer un compte avec l’email pré-inscrit)
   - lien `/demo` pour s’entraîner hors-ligne
   - lien vers `docs/GUIDE_UTILISATION.md` et `docs/NOTE_PATIENT.md`
3. Le praticien :
   1. Crée le compte (`/auth`)
   2. Complète `/auth/profile`
   3. Accepte `/consent`
   4. Lance une consultation (`/consultation`)
   5. Valide depuis `/dashboard/consultations/[id]` **avant** tout envoi patient
4. Opérateur : vérifier qu’une ligne `consultations` existe avec `professional_id` renseigné, et qu’un second compte **ne voit pas** cette ligne (RLS).

---

## 4. Actions humaines (hors code)

Ces items **ne sont pas** fermés par ce PR. Les bloquer explicitement avant d’élargir au-delà de 5 early adopters.

| Action | Owner | Livrable | Bloquant beta élargie ? |
|--------|-------|----------|-------------------------|
| Relecture avocat (RGPD, CGU, qualification DM) | Avocat santé / data | FAQ + privacy tamponnés | Oui |
| Relecture comité scientifique (tiers EBM, protocoles LIV-24+) | CS | Note de non-objection | Oui pour claims T1 |
| Assurance RC pro + cyber | Courtier | Attestation | Oui avant patients réels hors cabinet fondateur |
| Recrutement 5 early adopters (réseau ZOI / FM) | Dr Gounane | 5 emails + 1 call démo chacun | Objectif GTM, pas un gate technique |
| Hébergement données de santé (HDS) si la qualification l’exige | Ops | Contrat / région | À trancher avec l’avocat |
| DPO désigné + registre des traitements | Ops | Fiche CNIL interne | Oui RGPD |

Jusqu’à ces relectures : **pas de claim thérapeutique**, pas de « dispositif médical », pas de publicité grand public. L’outil reste une aide à la prescription sous responsabilité du praticien.

---

## 5. Jour J — checklist opérateur (15 min)

- [ ] `NEXT_PUBLIC_USE_MOCK_DATA=false` sur Vercel production
- [ ] Migrations 001–004 appliquées
- [ ] Seed 01–06 exécuté
- [ ] Un test `/beta` apparaît dans `beta_waitlist`
- [ ] Cas A/B/C OK sur `/demo` en navigation privée
- [ ] Un compte test voit **ses** consultations seulement
- [ ] Premier invité a reçu GUIDE + NOTE_PATIENT + `/privacy`
- [ ] Budget Anthropic + alerte dépassement
- [ ] Issue GitHub ouverte pour chaque bug J0

---

## 6. Rollback

- Feature flags : remettre la landing sur `/demo` uniquement n’est pas nécessaire — la waitlist peut rester ouverte.
- Urgence data : désactiver Auth (Supabase) et retirer `ANTHROPIC_API_KEY` de Vercel arrête composition + sessions.
- La démo `/demo` continue de fonctionner hors-ligne sans secrets.

---

> **Version** : v1.0 — 10 septembre 2026  
> **Prochaine révision** : après relecture avocat / CS
