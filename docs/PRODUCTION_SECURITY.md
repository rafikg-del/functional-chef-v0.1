# Production — sécurité & données (Phase 1, LIV-28…38)

> Note opérationnelle. **Pas une conclusion juridique MDR.** Aucun secret, aucun PHI.

## Ce qui a été durci dans le code

| Sujet | Changement |
|-------|------------|
| Mock vs live | Les pages dashboard (liste, détail, stats) n’affichent plus MOCK en cas d’erreur ou de liste vide. MOCK uniquement si `NEXT_PUBLIC_USE_MOCK_DATA=true`. |
| LIV-62 | `POST /api/consultations/:id/validate` (session obligatoire) → `validated_at` / `validated_by` / note + `audit_log`. RPC `validate_consultation` (migration 003). |
| LIV-65 | Empreinte **SHA-256** (Web Crypto / Node crypto) sur le payload canonique. Colonne `consultations.content_hash`. Persistée à la validation et à l’export PDF/JSON. |
| LIV-36 | `classify` / `compose` écrivent `audit_log` si un utilisateur est connecté. Métadonnées : bottleneck dominant, ids — **pas** de biomarqueurs. |
| LIV-35 | `POST /api/account/delete` appelle `delete_professional_account(auth.uid())` puis tente `auth.admin.deleteUser`. UI : `/dashboard/settings`. |
| LIV-37 | `/dashboard/audit` — liste filtrable, RLS (le praticien ne voit que ses lignes). |
| RLS | Migration 003 : `UPDATE` consultations (propriétaire), `INSERT` audit_log (soi-même), RPC validate, `delete_professional_account` refuse tout `auth.uid()` ≠ cible. |

Composer : une consultation n’est persistée que si un `professional_profiles` existe pour la session. Un appel anonyme (démo / script) reçoit toujours le JSON mais **n’écrit pas** en base.

## Migrations à appliquer sur le projet Supabase

Dans l’ordre, SQL Editor ou `supabase db push` :

1. `supabase/migrations/001_init_schema.sql`
2. `supabase/migrations/002_auth_profiles.sql`
3. `supabase/migrations/003_content_hash_and_rls.sql`
4. Seeds `01` → `06` (référentiel, pas de PHI)

Cron de rétention (LIV-34) : planifier `SELECT archive_expired_data();` (rôle `service_role` uniquement). Non branché ici — à configurer dans le dashboard Supabase (pg_cron / scheduled function).

## Vérifier le RLS avec un second utilisateur de test

Préparer **deux** comptes Auth (email+password), chacun avec une ligne `professional_profiles` (`user_id` = `auth.users.id`).

1. Connecté en tant que **praticien A**, créer une consultation (page `/consultation` → compose persisté).
2. Noter l’UUID `consultations.id` (liste dashboard ou réponse JSON `consultation_id`).
3. Déconnexion. Connexion **praticien B**.
4. Contrôles attendus (échec = fuite RLS) :
   - `GET` dashboard consultations : la ligne de A **n’apparaît pas**.
   - `POST /api/consultations/<id-A>/validate` → **404** (pas 200).
   - Dans le SQL Editor, en tant que B (client anon + JWT B) : `select * from consultations where id = '<id-A>'` → 0 lignes.
   - `select * from audit_log` → uniquement les actions de B.
5. Droit à l’oubli : B appelle `POST /api/account/delete` puis vérifier que le profil B a disparu et que A voit toujours **ses** consultations.

Ne pas coller de vrais biomarqueurs patients dans ces comptes de test.

## Variables d’environnement

Voir `.env.example`. En beta réelle :

- `NEXT_PUBLIC_USE_MOCK_DATA` **absent ou false**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` / URL du projet **live** (pas de placeholders)
- `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur (compose/classify référentiel + delete Auth). Jamais `NEXT_PUBLIC_`.

## Auth providers (config projet, pas code)

Le code expose email/mot de passe, magic link, reset password, bouton Google. À activer dans **Authentication → Providers** du projet Supabase. Sans provider Google, le bouton échoue de façon visible (pas de fallback silencieux).

## Checklist LIV-28 … LIV-38

| ID | Intitulé | Statut code | Bloqué sur config projet live |
|----|----------|-------------|-------------------------------|
| **LIV-28** | Auth email/password, magic link, Google SSO, reset | Pages `/auth` + callback | Google provider, templates email, URL de redirection |
| **LIV-29** | RLS patient / consultation / audit | Policies 002 + 003 | **Test d’intrusion à 2 users** ci-dessus ; Confirm Email |
| **LIV-30** | `professional_profiles` | Table + dashboard | Onboarding profil (RPPS) à remplir en beta |
| **LIV-31** | `patient_profiles` rattaché | Colonnes + RLS | UI dossier patient dédiée encore partielle |
| **LIV-32** | Consentement horodaté | `/consent` + `accepted_terms_at` | Version politique figée avocat |
| **LIV-33** | Politique de confidentialité | `/privacy` | **Relecture avocat** |
| **LIV-34** | Rétention + cron | `archive_expired_data()` | **pg_cron / scheduled function** |
| **LIV-35** | Droit à l’oubli | RPC + `POST /api/account/delete` + settings | Clé service role pour supprimer `auth.users` |
| **LIV-36** | `audit_log` classify/compose | Hooks API | Tables présentes après 002 |
| **LIV-37** | UI audit | `/dashboard/audit` | — |
| **LIV-38** | Export PDF + JSON horodaté | SHA-256 + `content_hash` | Colonne 003 appliquée |

## Comment fumer les tests CI

```bash
npm test
npm run type-check
```

Pas de fixture PHI. Les hashes SHA-256 sont vérifiés sur des chaînes publiques (`abc`).
