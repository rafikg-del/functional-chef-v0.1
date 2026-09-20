# Patient B2C — ops & smoke

Parcours autonome `/patient` : compte → laboratoire (PDF ou saisie) → objectifs → menu 7 jours + liste de courses. **Aide culinaire, pas un dispositif médical.**

Les APIs exigent `app_metadata.role = 'patient'`. Le moteur (bottlenecks, seuils, T1/T2/T3, cascade) reste serveur ; les réponses client passent par `sanitizePlanForClient`.

## 1. Environnement

Même stack que le cabinet (Vercel + Supabase). Variables déjà utilisées :

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth + Postgres + Storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | Attribuer `app_metadata.role` via `POST /api/patient/claim-role` |
| `ANTHROPIC_API_KEY` | Optionnel. Absent ou en échec → menu déterministe (catalogue), statut `ready` |

Pas de paiement, pas de chat médecin.

## 2. Appliquer la migration `005`

Fichier : `supabase/migrations/005_patient_b2c.sql`

Elle ajoute les colonnes B2C sur `patient_profiles` (`user_id`, `display_name`, `dietary_exclusions`, `allergies`, `household_size`), crée `patient_labs`, `patient_intakes`, `patient_plans`, active le RLS `auth.uid() = user_id`, et le bucket privé `patient-labs` (préfixe `user_id/`).

**Prod / staging Supabase**

```bash
# linked project
npx supabase db push

# ou coller 005_patient_b2c.sql dans SQL Editor, une fois
```

Vérifier : tables listées, policies « Patients can … own … », bucket `patient-labs` non public.

## 3. Attribuer `app_metadata.role = 'patient'`

Sans ce rôle, les APIs répondent **403**. Trois options (une suffit) :

### A. Inscription via `/patient/auth` (recommandé)

`POST /api/patient/claim-role` (session requise) pose `role=patient` **uniquement** si le compte n’a pas déjà un autre rôle (praticien / admin). Puis `refreshSession()` côté client.

Nécessite `SUPABASE_SERVICE_ROLE_KEY` sur Vercel.

### B. Auth Hook Supabase

Sur `user.created` (ou Custom Access Token), forcer `app_metadata.role = 'patient'` pour les inscriptions issues de `/patient`. Ne pas écraser un rôle praticien.

### C. SQL manuel (smoke / debug)

```sql
-- remplacer l’UUID
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"patient"}'::jsonb
where id = '<USER_UUID>';
```

Ensuite **déconnexion / reconnexion** (le JWT doit contenir le rôle).

## 4. Routes

| Route | Accès |
|-------|--------|
| `/patient` | Public (promesse + CTA compte) |
| `/patient/auth` | Public (inscription / connexion) |
| `/patient/onboarding` | Session requise — profil, exclusions, allergies |
| `/patient/new` | Session + rôle patient — wizard 3 étapes |
| `/patient/plans` | Historique |
| `/patient/plans/[id]` | Détail, régénérer, imprimer / PDF |

Middleware : `/patient` et `/patient/auth` publics ; le reste de `/patient/*` redirige vers `/patient/auth?next=…` si pas de session.

Lien discret **Espace patient** : footer de la landing praticien (`/`) uniquement.

## 5. Smoke checklist

Cocher dans un projet où `005` est appliqué et Auth configuré.

1. [ ] Déconnecté : `GET /patient` → 200, français, mention « pas un dispositif médical », **aucun** bottleneck / T1 / seuil.
2. [ ] Déconnecté : `GET /patient/plans` → redirection `/patient/auth`.
3. [ ] Footer de `/` : lien « Espace patient » ; pas de copie méthode sur ce lien.
4. [ ] Inscription email sur `/patient/auth` → compte créé.
5. [ ] `app_metadata.role` = `patient` (claim-role, hook, ou SQL + re-login).
6. [ ] Onboarding : exclusions + allergies enregistrées (`patient_profiles.user_id`).
7. [ ] `/patient/new` étape 1 : PDF Synlab **ou** saisie manuelle d’au moins un biomarqueur.
8. [ ] PDF illisible → message FR + bascule saisie manuelle (pas de succès simulé).
9. [ ] Étape 2 : problème et/ou objectifs + **consentement** coché.
10. [ ] Étape 3 : submit → `/patient/plans/[id]` avec 7 jours + courses + disclaimer.
11. [ ] Historique `/patient/plans` liste le menu ; rechargement le retrouve (pas de localStorage comme source de vérité).
12. [ ] Régénérer sur le détail remplace le menu, même id.
13. [ ] Compte **praticien** sur `/patient/plans` → message « pas un compte patient », **pas** de boucle de redirection.
14. [ ] Réponse JSON d’un plan : pas de `bottleneck`, `scores`, `T1/T2`, `classification`, `generation_meta`.

## 6. Interdit dans l’UI patient

Ne jamais afficher : ids bottleneck, scores, seuils (ex. HOMA-IR 1.5), cascade, tiers EBM T1/T2/T3, traces de classification, PMIDs pipeline.

Vérif locale :

```bash
rg -n -i 'bottleneck|id="methode"|T1 =|HOMA-IR 1.5|T1/T2/T3' src/app/patient src/components/patient
```

Attendu : aucune occurrence.

## 7. Dépannage

| Symptôme | Piste |
|----------|--------|
| 403 sur `/api/patient/*` | Rôle absent du JWT → claim-role + refresh, ou SQL §3.C + re-login |
| 503 claim-role | `SUPABASE_SERVICE_ROLE_KEY` manquante |
| PDF 422 | Normal hors Synlab ; saisir à la main |
| Menu « vide » / timeout LLM | Fallback catalogue ; vérifier qu’un biomarqueur est bien envoyé |
| Insert profil échoue | Migration 005 non appliquée ; contrainte `user_id` XOR `professional_id` |
