# MVP démo publique — Functional Chef

Parcours visiteur **sans compte praticien** : landing → démo → waitlist.

Hors périmètre de ce MVP : dashboard auth, signatures MDR/CS, Phase 2 clinique, concordance, nouveaux cas DYSBIOSE, gaming de seuils.

---

## Critères de succès

Un visiteur froid peut :

1. Comprendre le produit sur `/` en ≤ 30 s (CTA démo + pré-inscription, bandeau non-DM).
2. Ouvrir `/demo` **sans login**, choisir A / B / C (ou personnalisé), voir une classification FR, puis un **aperçu de prescription culinaire** (leviers T1–T3 + plat).
3. Aller vers `/beta` via un CTA évident.
4. Soumettre la waitlist **pour de vrai** quand Supabase + migration 004 sont en place. Sinon : message FR honnête + checklist opérateur — **jamais** un succès simulé (localStorage n’est plus le chemin).

La démo ne doit pas :

- exiger une session Auth ;
- tomber en 500 si `ANTHROPIC_API_KEY` est absente ;
- tomber en 500 si Supabase est absent (les pages `/`, `/demo`, `/beta` restent up ; seul le POST waitlist échoue clairement).

---

## Smoke checklist (humain, 5 min)

Navigation privée, production ou preview :

- [ ] `GET /` → 200. NonDmNotice visible. Primaire = pré-inscription `/beta`. Secondaire = démo sans compte.
- [ ] `GET /demo` → 200 **sans** redirection `/auth`.
- [ ] Cas A → dominant **IR**, leviers + plat (lentilles / vinaigre).
- [ ] Cas B → dominant **INFLAM**, leviers + plat (poisson gras / crucifères).
- [ ] Cas C → dominant **DYSBIOSE**, co-dominant INFLAM, plat avec T1 et au moins un T3 catalogue.
- [ ] CTA « Pré-inscription beta » depuis les résultats → `/beta`.
- [ ] `POST /api/beta-waitlist` payload valide :
  - **config OK** → 201, ligne dans `beta_waitlist` ;
  - **table / RLS / env manquants** → 503 ou 500 avec `error` FR + `operator_checklist` (pas 201).
- [ ] `POST /api/demo-compose` sans clé Anthropic → 200, `dish_source` = `fixture` ou `deterministic`.

CI : `npm run type-check` et `npm test` (inclut parser waitlist + chargement des cas démo).

---

## Variables d’environnement

Voir `.env.example`.

| Variable | Public MVP | Notes |
|----------|------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Requis pour waitlist** | Placeholder `YOUR_PROJECT` = traité comme non configuré |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Requis pour waitlist** | INSERT RLS `anon` sur `beta_waitlist` |
| `SUPABASE_SERVICE_ROLE_KEY` | Non requis pour `/demo` | Dashboard / compose praticien |
| `ANTHROPIC_API_KEY` | **Optionnel** | Sans clé : aperçu catalogue. Avec clé : `/api/demo-compose` peut passer en `live` |
| `NEXT_PUBLIC_APP_URL` | Recommandé en prod | |

`/`, `/demo`, `/beta` restent joignables si Supabase n’est pas configuré (middleware fail-open hors dashboard).

---

## Appliquer la migration 004 (ops humain)

Si `POST /api/beta-waitlist` renvoie 500/503 (`waitlist_table_missing` ou insert générique) :

1. Ouvrir le projet **Supabase de production** (celui pointé par `NEXT_PUBLIC_SUPABASE_URL` Vercel).
2. SQL Editor → coller `supabase/migrations/004_beta_waitlist.sql` → Run.  
   Ou : `supabase link --project-ref <ref>` puis `supabase db push`.
3. Confirmer : table `beta_waitlist`, RLS forcée, policy INSERT `anon` + `authenticated`, SELECT admin only.
4. Vercel → Production (+ Preview) : `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` renseignés, **redéployer**.
5. Retester `/beta` avec un email unique. Attendu : 201. Doublon : 409.

Détail runbook beta : `docs/BETA_LAUNCH_RUNBOOK.md`.

---

## Limites connues

- L’aperçu culinaire A/B/C est un **fixture catalogue** (plus un plat déterministe pour le profil custom). Ce n’est pas un dossier patient, pas un export PDF, pas une validation CS.
- Les effets 2-4 h / 4 sem / 12 sem sont ceux de la **littérature des leviers**, pas une mesure sur le plat affiché.
- Composition Claude publique seulement si la clé serveur est présente ; échec LLM → retour silencieux au fixture.
- Waitlist prod : **appliquer 004** reste une action humaine. Le code ne crée pas la table tout seul.
- Auth dashboard, consentement, hash de consultation : hors MVP public.
- Concordance LIV-25/27 et claims T1 « validés » : hors périmètre ; pas de nouveau cas DYSBIOSE inventé.

---

## Fichiers utiles

| Chemin | Rôle |
|--------|------|
| `src/app/page.tsx` | Landing |
| `src/app/demo/page.tsx` | Démo publique |
| `src/lib/demo/` | Cas, catalogue leviers, runner, fixtures plats |
| `src/app/beta/page.tsx` | Formulaire waitlist |
| `src/app/api/beta-waitlist/route.ts` | POST réel |
| `src/app/api/demo-compose/route.ts` | POST public, fallback sans Anthropic |
| `supabase/migrations/004_beta_waitlist.sql` | Table + RLS |
