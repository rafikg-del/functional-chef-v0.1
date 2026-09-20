# Design — Functional Chef Patient B2C (autonome)

> **Date** : 2026-09-20  
> **Statut** : Draft for user review (Superpowers brainstorm)  
> **Repo** : `rafikg-del/functional-chef-v0.1`  
> **Approche** : A — parcours `/patient` dans le repo actuel

## 1. Goal

Permettre à un **patient** (B2C autonome, sans praticien dans la boucle) de :

1. Créer un **compte complet** (profil + historique)
2. **Uploader** une analyse de sang (PDF) et **corriger / saisir** les biomarqueurs
3. Décrire son **problème** et ses **objectifs**
4. Recevoir un **plan culinaire** : **menu 7 jours simplifié + liste de courses**

Ce n’est **pas** un dispositif médical, pas un diagnostic, pas un traitement. Ton : aide culinaire personnalisée.

## 2. Non-goals (MVP)

- Chat / validation médecin, pré-consultation praticien
- Paiement, abonnements
- App native
- Multi-labo avancé au-delà de Synlab + saisie manuelle
- Programme 2–4 semaines
- Exposition UI des bottlenecks, seuils, cascade, tiers T1/T2/T3, pipeline (secret industriel)
- Claims cliniques / concordance / MDR Phase 2

## 3. Users & success

| Acteur | Besoin |
|--------|--------|
| Patient | Compte → upload/édition labo → objectifs → menu semaine + courses, historisable |
| Opérateur (Rafik) | Même deploy Vercel/Supabase ; RLS patient ≠ praticien |

**Succès MVP** : un patient nouveau peut, en session réelle, obtenir un plan 7j sauvegardé et le retrouver dans l’historique, sans voir la méthode interne.

## 4. Architecture

- **Même** app Next.js 14 + Supabase + Anthropic
- Namespace routes : `/patient/*`
- Rôle auth : `patient` (distinct du praticien)
- Moteur de raisonnement + parser PDF **uniquement serveur** ; réponses API/UI **sanitisées** (pas de fuite méthode)
- Réutilise : `synlab-pdf-parser`, libs reasoning/compose en adaptant la **présentation** sortie patient (menu semaine, pas fiche praticien)

```
[Auth patient] → [Consent] → [Upload PDF | manuel]
        → [Edit biomarkers] → [Problem + goals]
        → [POST /api/patient/plans] → [Plan 7j + groceries]
        → [History /plans/[id]]
```

## 5. Routes (UI)

| Route | Rôle |
|-------|------|
| `/patient` | Landing patient (promesse + CTA compte) |
| `/patient/auth` | Inscription / connexion |
| `/patient/onboarding` | Profil : exclusions alimentaires, allergies, prefs |
| `/patient/new` | Wizard : labo → objectifs → génération |
| `/patient/plans` | Historique |
| `/patient/plans/[id]` | Détail plan (jours + courses), régénérer, export PDF simple |

Lien discret « Espace praticiens » vers `/` cabinet — tunnels non mélangés.

## 6. Data model (Supabase)

Nouvelles tables (migration dédiée, ex. `005_patient_b2c.sql`) :

### `patient_profiles`
- `user_id` (PK, FK auth.users)
- `display_name`
- `dietary_exclusions` (jsonb)
- `allergies` (jsonb)
- `household_size` (int, optional)
- `created_at` / `updated_at`

### `patient_labs`
- `id`, `user_id`
- `source` (`pdf` \| `manual` \| `pdf_edited`)
- `storage_path` (PDF, nullable)
- `parsed_biomarkers` (jsonb)
- `edited_biomarkers` (jsonb) — source de vérité pour le plan
- `created_at`

### `patient_intakes`
- `id`, `user_id`, `lab_id` (nullable)
- `problem_text` (text)
- `goals_text` (text)
- `goal_tags` (text[], optional)
- `created_at`

### `patient_plans`
- `id`, `user_id`, `intake_id`
- `status` (`ready` \| `failed` \| `draft`)
- `menu_7d` (jsonb) — structure jour → repas → plat
- `grocery_list` (jsonb) — items groupés
- `generation_meta` (jsonb) — **interne** (model, fixture/live) ; **ne pas** renvoyer les champs moteur sensibles au client
- `created_at`

**RLS** : `auth.uid() = user_id` sur toutes les tables patient. Aucun accès praticien aux lignes patient (et inversement) sauf future feature explicite hors MVP.

## 7. APIs

| Method | Path | Comportement |
|--------|------|----------------|
| POST | `/api/patient/parse-lab` | PDF → biomarqueurs ; 422 → invite saisie manuelle |
| POST | `/api/patient/labs` | Persiste lab (édité) |
| POST | `/api/patient/plans` | Crée intake + génère plan ; Anthropic si dispo sinon fallback déterministe/catalogue |
| GET | `/api/patient/plans` | Liste historique |
| GET | `/api/patient/plans/[id]` | Détail sanitizé |
| POST | `/api/patient/plans/[id]/regenerate` | Nouveau menu sous contraintes |

Auth obligatoire (session patient). Pas d’anon insert de plans.

### Shape client du plan (sanitisé)

```json
{
  "id": "…",
  "days": [
    {
      "day": 1,
      "label": "Lundi",
      "meals": [
        { "slot": "breakfast", "title": "…", "summary": "…" },
        { "slot": "lunch", "title": "…", "summary": "…" },
        { "slot": "dinner", "title": "…", "summary": "…" }
      ]
    }
  ],
  "grocery_list": [
    { "aisle": "Légumes", "items": ["…"] }
  ],
  "disclaimer": "Aide culinaire. Pas un avis médical."
}
```

Interdit dans la réponse client : ids bottleneck, scores internes, seuils, PMIDs pipeline, tiers EBM, traces de classification brutes.

## 8. UX details

- Mobile-first, français
- Wizard `/patient/new` en 3 étapes visibles
- Revue biomarqueurs : table éditable (valeur + unité si connue)
- Objectifs : textarea + tags optionnels (énergie, digestion, poids, glycémie ressentie — **ressenti**, pas diagnostic)
- Résultat : onglets Jours | Courses ; CTA régénérer / exporter
- Consentement explicite avant premier upload (conservation données santé sensibles)

## 9. Error handling

| Cas | Comportement |
|-----|----------------|
| PDF illisible / non Synlab | Message FR + bascule saisie manuelle |
| Anthropic down / timeout | Fallback déterministe ; plan quand même `ready` si possible |
| Validation biomarqueurs vides | Bloquer génération avec message |
| RLS / auth | 401/403 standard |

Jamais de succès simulé (pas de localStorage comme source de vérité).

## 10. Security & privacy

- Données de santé : RLS + storage bucket privé par `user_id`
- Minimisation : pas de PHI tiers ; email compte uniquement
- Soft delete / export ultérieurs hors MVP mais schema prêt (`deleted_at` optional)
- Alignement pages privacy : mention parcours patient B2C

## 11. Testing

- Unit : sanitization de réponse plan (aucune clé interdite)
- Unit : merge PDF parse + édition manuelle
- Integration : génération fixture → shape 7 jours + courses
- Authz : patient A ne lit pas plans patient B

## 12. Implementation notes

- Ne pas modifier la landing praticien pour exposer la méthode
- CTA patient depuis footer/`/patient` seulement (ou lien discret)
- Documenter ops : appliquer migration `005_…` sur Supabase prod
- Suivre TDD (Superpowers) à l’implémentation

## 13. Open decisions (resolved in brainstorm)

| Décision | Choix |
|----------|--------|
| Rôle | Autonome B2C |
| Plan | Culinaire (plats, menus, courses) |
| Compte | Complet dès le départ |
| Ampleur | Menu 7 jours + courses |
| Labo | PDF + correction / saisie manuelle |
| Architecture | `/patient` dans repo actuel |

## 14. Approval

- [x] Design sections approved in chat (2026-09-20)
- [ ] User review of this written spec
- [x] Superpowers `writing-plans` → `docs/superpowers/plans/2026-09-20-patient-b2c.md`
- [x] Lots 1–2 merged (lib, migration 005, APIs)
- [ ] Lot 3 UI / ops (`/patient` shell + wizard) — PR in review
