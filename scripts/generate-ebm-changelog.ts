/**
 * LIV-17 — Génère le changelog EBM depuis les seeds SQL chargeables.
 *
 * Source de vérité : INSERT INTO culinary_levers / lever_bottleneck_map.
 * Ne fabrique aucun PMID. Les tuples SQL orphelins (hors INSERT) sont listés
 * séparément et ne sont PAS présentés comme chargés en base.
 *
 * Usage : npx tsx scripts/generate-ebm-changelog.ts
 *         npm run changelog:ebm
 */

import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LEVER_SEED = join(ROOT, 'supabase/seed/04_culinary_levers.sql');
const MAP_SEED = join(ROOT, 'supabase/seed/05_lever_bottleneck_map.sql');
const AUDIT = join(ROOT, 'docs/PMIDS_AUDIT.md');
const OUT = join(ROOT, 'docs/quality/LIV-17_CHANGELOG_EBM.md');

const TODAY = '2026-09-10';

interface Lever {
  id: string;
  name_fr: string;
  category: string;
  ebm_tier: string;
  primary_reference: string | null;
  pubmed_ids: string[];
  pubmed_raw: string | null;
  is_universal_star: boolean;
  insert_index: number;
}

interface MapRow {
  lever_id: string;
  bottleneck_id: string;
  tier: string;
  priority: number;
}

/** PMIDs still present in seed that PMIDS_AUDIT marked incorrect / missing. */
const OPEN_AUDIT_FLAGS: Record<string, { pmid: string; reason: string }[]> = {
  L_LEGUMINOUSES_REGULAR: [
    {
      pmid: '19465743',
      reason:
        'PMIDS_AUDIT : PMID actuel pointe vers un article sommeil (sleep-disordered breathing), pas Sievenpiper 2009. PMID Sievenpiper non résolu — non inventé ici.',
    },
  ],
  L_TURMERIC_PIPERINE_LIPID: [
    {
      pmid: '27259976',
      reason:
        'PMIDS_AUDIT : PMID introuvable. Sahebkar 2016 CRP non confirmé — non inventé ici.',
    },
  ],
  L_REDUCE_FREE_SUGAR_10PCT: [
    {
      pmid: '(null)',
      reason:
        'Seed : pubmed_ids NULL. primary_reference indique « PMID à confirmer » (Lambert 2025 / EASL 2024). Aucun PMID n’est inventé.',
    },
  ],
};

function gitHead(): string {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'inconnu';
  }
}

/**
 * Extraire les blocs VALUES d’un INSERT en s’appuyant sur les lignes :
 * début = `INSERT INTO <table>`, fin = ligne `);` (hors tuples orphelins).
 * Évite un scan caractère-à-caractère sur tout le fichier (apostrophes SQL mixtes).
 */
function extractInsertValueBlocks(sql: string, table: string): string[] {
  const lines = sql.split('\n');
  const blocks: string[] = [];
  let current: string[] | null = null;
  const startRe = new RegExp(`INSERT INTO ${table}\\b`, 'i');
  for (const line of lines) {
    if (startRe.test(line)) {
      current = [];
      continue;
    }
    if (current) {
      current.push(line);
      if (line.trim() === ');') {
        blocks.push(current.join('\n'));
        current = null;
      }
    }
  }
  return blocks;
}

function splitTuples(valuesBlock: string): string[] {
  const tuples: string[] = [];
  let i = 0;
  let guard = 0;
  while (i < valuesBlock.length && guard++ < valuesBlock.length + 32) {
    while (i < valuesBlock.length && valuesBlock[i] !== '(') i++;
    if (i >= valuesBlock.length) break;
    const after = valuesBlock.slice(i, i + 40);
    if (!/\(\s*'L_/.test(after)) {
      i++;
      continue;
    }
    const start = i;
    let depth = 0;
    let inStr = false;
    while (i < valuesBlock.length) {
      const c = valuesBlock[i];
      if (inStr) {
        if (c === '\\' && (valuesBlock[i + 1] === "'" || valuesBlock[i + 1] === '\\')) {
          i += 2;
          continue;
        }
        if (c === "'" && valuesBlock[i + 1] === "'") {
          i += 2;
          continue;
        }
        if (c === "'") inStr = false;
        i++;
        continue;
      }
      if (c === "'") {
        inStr = true;
        i++;
        continue;
      }
      if (c === '(') depth++;
      if (c === ')') {
        depth--;
        if (depth === 0) {
          tuples.push(valuesBlock.slice(start, i + 1));
          i++;
          break;
        }
      }
      i++;
    }
    if (i === start) i++;
  }
  return tuples;
}

function parseFields(tuple: string): string[] {
  const inner = tuple.trim();
  if (!inner.startsWith('(') || !inner.endsWith(')')) return [];
  const body = inner.slice(1, -1);
  const fields: string[] = [];
  let i = 0;
  let guard = 0;
  while (i < body.length && guard++ < body.length + 32) {
    while (i < body.length && /[\s,]/.test(body[i])) i++;
    if (i >= body.length) break;
    if (body.startsWith('--', i)) {
      const nl = body.indexOf('\n', i);
      i = nl === -1 ? body.length : nl + 1;
      continue;
    }
    if (body[i] === "'") {
      i++;
      let s = '';
      while (i < body.length) {
        if (body[i] === '\\' && (body[i + 1] === "'" || body[i + 1] === '\\')) {
          s += body[i + 1];
          i += 2;
          continue;
        }
        if (body[i] === "'" && body[i + 1] === "'") {
          s += "'";
          i += 2;
          continue;
        }
        if (body[i] === "'") {
          i++;
          break;
        }
        s += body[i];
        i++;
      }
      fields.push(s);
      continue;
    }
    if (body.slice(i, i + 5).toUpperCase() === 'ARRAY') {
      const lb = body.indexOf('[', i);
      if (lb === -1) {
        i += 5;
        continue;
      }
      let depth = 0;
      let j = lb;
      let inStr = false;
      let closed = false;
      while (j < body.length) {
        const c = body[j];
        if (inStr) {
          if (c === '\\' && (body[j + 1] === "'" || body[j + 1] === '\\')) {
            j += 2;
            continue;
          }
          if (c === "'" && body[j + 1] === "'") {
            j += 2;
            continue;
          }
          if (c === "'") inStr = false;
          j++;
          continue;
        }
        if (c === "'") {
          inStr = true;
          j++;
          continue;
        }
        if (c === '[') depth++;
        if (c === ']') {
          depth--;
          if (depth === 0) {
            fields.push(body.slice(i, j + 1));
            i = j + 1;
            closed = true;
            break;
          }
        }
        j++;
      }
      if (!closed) i = Math.min(i + 5, body.length);
      continue;
    }
    if (body.slice(i, i + 4).toUpperCase() === 'NULL') {
      fields.push('NULL');
      i += 4;
      continue;
    }
    if (body.slice(i, i + 4).toLowerCase() === 'true') {
      fields.push('true');
      i += 4;
      continue;
    }
    if (body.slice(i, i + 5).toLowerCase() === 'false') {
      fields.push('false');
      i += 5;
      continue;
    }
    let j = i;
    while (j < body.length && body[j] !== ',') j++;
    fields.push(body.slice(i, j).trim());
    i = j;
  }
  return fields;
}

function parsePubmedArray(raw: string | undefined): string[] {
  if (!raw || raw.toUpperCase() === 'NULL') return [];
  const ids: string[] = [];
  const re = /'([^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    if (m[1]) ids.push(m[1]);
  }
  return ids;
}

function parseLevers(sql: string): Lever[] {
  const blocks = extractInsertValueBlocks(sql, 'culinary_levers');
  const levers: Lever[] = [];
  const seen = new Set<string>();
  blocks.forEach((block, insert_index) => {
    for (const tuple of splitTuples(block)) {
      const f = parseFields(tuple);
      if (f.length < 9) continue;
      const id = f[0];
      if (!id?.startsWith('L_')) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      levers.push({
        id,
        name_fr: f[1] ?? '',
        category: f[4] ?? '',
        ebm_tier: f[6] ?? '',
        primary_reference: f[7] === 'NULL' ? null : f[7] ?? null,
        pubmed_ids: parsePubmedArray(f[8]),
        pubmed_raw: f[8] === 'NULL' ? null : f[8] ?? null,
        is_universal_star: (f[13] ?? '').toLowerCase() === 'true',
        insert_index,
      });
    }
  });
  return levers;
}

function parseMap(sql: string): MapRow[] {
  const rows: MapRow[] = [];
  const re =
    /\(\s*'(L_[A-Z0-9_]+)'\s*,\s*'(IR|INFLAM|DYSBIOSE)'\s*,\s*'(T[123])'\s*,\s*(\d+)\s*,/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    rows.push({
      lever_id: m[1],
      bottleneck_id: m[2],
      tier: m[3],
      priority: Number(m[4]) || 0,
    });
  }
  return rows;
}

/** Première ligne du mapping qui termine l’INSERT par `');` (bug seed si trop tôt). */
function mappingInsertBreakLine(sql: string): number | null {
  const lines = sql.split('\n');
  let inInsert = false;
  for (let n = 0; n < lines.length; n++) {
    if (/INSERT INTO lever_bottleneck_map\b/i.test(lines[n])) inInsert = true;
    if (inInsert && /\);?\s*$/.test(lines[n]) && /\('L_/.test(lines[n]) && lines[n].includes("');")) {
      return n + 1;
    }
  }
  return null;
}

function orphanLeverIds(sql: string, loaded: Set<string>): string[] {
  const lines = sql.split('\n');
  let lastInsertEnd = -1;
  let inInsert = false;
  for (let n = 0; n < lines.length; n++) {
    if (/INSERT INTO culinary_levers\b/i.test(lines[n])) inInsert = true;
    if (inInsert && lines[n].trim() === ');') {
      lastInsertEnd = n;
      inInsert = false;
    }
  }
  const tail = lastInsertEnd >= 0 ? lines.slice(lastInsertEnd + 1).join('\n') : sql;
  const ids: string[] = [];
  const seen = new Set<string>();
  const re = /'(L_[A-Z0-9_]+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tail)) !== null) {
    if (!loaded.has(m[1]) && !seen.has(m[1])) {
      seen.add(m[1]);
      ids.push(m[1]);
    }
  }
  return ids;
}

function pmidLooksNumeric(id: string): boolean {
  return /^\d{5,8}$/.test(id);
}

function escapeCell(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function mapCell(rows: MapRow[]): string {
  if (rows.length === 0) return '—';
  return rows
    .sort((a, b) => a.bottleneck_id.localeCompare(b.bottleneck_id))
    .map((r) => `${r.bottleneck_id}:${r.tier}`)
    .join(', ');
}

function generate(): string {
  const leverSql = readFileSync(LEVER_SEED, 'utf8');
  const mapSql = readFileSync(MAP_SEED, 'utf8');
  const auditExists = (() => {
    try {
      readFileSync(AUDIT, 'utf8');
      return true;
    } catch {
      return false;
    }
  })();

  const levers = parseLevers(leverSql);
  const map = parseMap(mapSql);
  const mapBreakLine = mappingInsertBreakLine(mapSql);
  const loadedIds = new Set(levers.map((l) => l.id));
  const orphans = orphanLeverIds(leverSql, loadedIds);
  const mapByLever = new Map<string, MapRow[]>();
  for (const row of map) {
    const list = mapByLever.get(row.lever_id) ?? [];
    list.push(row);
    mapByLever.set(row.lever_id, list);
  }

  const mapOrphans = [...new Set(map.map((r) => r.lever_id))].filter((id) => !loadedIds.has(id));
  const unmapped = levers.filter((l) => !mapByLever.has(l.id)).map((l) => l.id);

  const t1 = levers.filter((l) => l.ebm_tier === 'T1').length;
  const t2 = levers.filter((l) => l.ebm_tier === 'T2').length;
  const t3 = levers.filter((l) => l.ebm_tier === 'T3').length;
  const noPmid = levers.filter((l) => l.pubmed_ids.length === 0);
  const nonNumericPmids = levers.flatMap((l) =>
    l.pubmed_ids.filter((p) => !pmidLooksNumeric(p)).map((p) => ({ id: l.id, pmid: p }))
  );

  const openFlags = levers.filter((l) => OPEN_AUDIT_FLAGS[l.id]);
  const sha = gitHead();
  const v01 = levers.filter((l) => l.insert_index === 0);
  const v02 = levers.filter((l) => l.insert_index === 1);

  const lines: string[] = [];
  lines.push('# LIV-17 — Changelog EBM (référentiel `culinary_levers`)');
  lines.push('');
  lines.push('> **Identifiant** : FC-REG-EBM / LIV-17');
  lines.push('> **Version** : 0.1 (snapshot initial)');
  lines.push('> **Statut** : **Brouillon — signature humaine requise**');
  lines.push(`> **Date du snapshot** : ${TODAY}`);
  lines.push(`> **SHA git** : \`${sha}\``);
  lines.push('> **Sources** : `supabase/seed/04_culinary_levers.sql`, `supabase/seed/05_lever_bottleneck_map.sql`');
  lines.push('> **Génération** : `npm run changelog:ebm` (`scripts/generate-ebm-changelog.ts`)');
  lines.push('> **Ne pas signer ce fichier tel quel** : les tiers sont auto-déclarés ; **0 fiche LIV-16 signée CS**.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 1. Contrôle documentaire');
  lines.push('');
  lines.push('| Champ | Valeur |');
  lines.push('|-------|--------|');
  lines.push('| Nature | Registre de traçabilité des tiers EBM-F |');
  lines.push('| Périmètre | Leviers **chargeables** via `INSERT INTO culinary_levers` uniquement |');
  lines.push('| Hors-périmètre | Tuples SQL orphelins après le 2ᵉ INSERT (non exécutables) ; PMIDs inventés ; signatures CS fictives |');
  lines.push('| Revue CS | **Aucune** à la date du snapshot |');
  lines.push('| Réévaluation | Tous les 6 mois ou à chaque modification de tier (LIV-15) |');
  lines.push('');
  lines.push('### 1.1 Signatures (vacantes)');
  lines.push('');
  lines.push('| Rôle | Nom | Date | Décision | Signature |');
  lines.push('|------|-----|------|----------|-----------|');
  lines.push('| Rédacteur technique | | | Prise d’acte du snapshot | |');
  lines.push('| Membre CS | | | Revue de l’historique | |');
  lines.push('| Fabricant | | | Approbation du registre | |');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 2. Méthode du snapshot');
  lines.push('');
  lines.push('1. Parser les blocs `INSERT INTO culinary_levers ... VALUES` (2 blocs dans le seed actuel).');
  lines.push('2. Extraire `id`, `name_fr`, `category`, `ebm_tier`, `primary_reference`, `pubmed_ids`, `is_universal_star`.');
  lines.push('3. Joindre `lever_bottleneck_map` (tier par bottleneck).');
  lines.push('4. Recouper avec [`docs/PMIDS_AUDIT.md`](../PMIDS_AUDIT.md) **sans corriger** les PMIDs dans ce fichier.');
  lines.push('5. Lister les identifiants `L_*` présents dans le fichier seed **après** le dernier INSERT valide : ce ne sont **pas** des leviers en base.');
  lines.push('');
  lines.push('Ce document est un **historique initial** (état v0.1 + extension v0.2 du seed). Il n’existe pas d’historique git par levier antérieur à ce snapshot.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 3. Synthèse');
  lines.push('');
  lines.push('| Métrique | Valeur |');
  lines.push('|----------|--------|');
  lines.push(`| Leviers chargeables | **${levers.length}** |`);
  lines.push(`| Bloc INSERT 1 (baseline v0.1) | ${v01.length} |`);
  lines.push(`| Bloc INSERT 2 (extension v0.2) | ${v02.length} |`);
  lines.push(`| T1 / T2 / T3 (tier global) | ${t1} / ${t2} / ${t3} |`);
  lines.push(`| Étoiles universelles | ${levers.filter((l) => l.is_universal_star).length} |`);
  lines.push(`| Sans PMID | ${noPmid.length} |`);
  lines.push(`| Écarts audit PMID encore ouverts | ${openFlags.length} |`);
  lines.push(`| Fiches LIV-16 signées | **0 / ${levers.length}** |`);
  lines.push(`| Tuples SQL orphelins (hors INSERT) | ${orphans.length} |`);
  lines.push(`| Lignes mapping parsées | ${map.length} |`);
  lines.push(`| Mapping sans levier chargeable | ${mapOrphans.length} |`);
  lines.push(`| Leviers chargeables sans mapping | ${unmapped.length} |`);
  lines.push('| Rupture INSERT mapping (point-virgule prématuré) | ' + (mapBreakLine ? `ligne ${mapBreakLine} de 05_lever_bottleneck_map.sql` : 'non détectée') + ' |');
  lines.push(`| Audit PMIDs historique | ${auditExists ? 'présent (`docs/PMIDS_AUDIT.md`)' : 'absent'} |`);
  lines.push('');
  lines.push(
    '**Lecture honnête** : le référentiel opérationnel, si `04_culinary_levers.sql` est exécuté tel quel, est de **' +
      String(levers.length) +
      ' leviers**. Les ' +
      String(orphans.length) +
      " identifiants orphelins du §8 (détox, suppléments, lifestyle) **ne sont pas chargés**. Le mapping `05` contient des IDs sans levier parent (FK cassée si exécuté après un seed strict) et des point-virgules prématurés (§7.3) qui interrompent l'INSERT PostgreSQL."
  );
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 4. Historique des versions du référentiel');
  lines.push('');
  lines.push('| Version | Date | Nature | Leviers concernés | Preuve | Signature CS |');
  lines.push('|---------|------|--------|-------------------|--------|--------------|');
  lines.push(`| v0.1 baseline | 2026-07 (seed) | Création INSERT #1 | ${v01.map((l) => l.id).join(', ')} | \`04_culinary_levers.sql\` | **Non** |`);
  lines.push(`| v0.2 extension | 2026-07 (seed) | Ajout INSERT #2 (catalogue LIV-47) | ${v02.map((l) => l.id).join(', ')} | LIV-47 + seed | **Non** |`);
  lines.push(`| v0.2-snapshot | ${TODAY} | Premier registre LIV-17 généré | ${levers.length} chargeables | ce fichier / \`${sha}\` | **Non** |`);
  lines.push('');
  lines.push('Toute modification ultérieure de `ebm_tier` ou de `pubmed_ids` doit ajouter une ligne ici **et** une fiche LIV-16 (procédure LIV-15).');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 5. Écarts PMID ouverts (ne pas « corriger » sans source)');
  lines.push('');
  lines.push('Recoupement avec [`docs/PMIDS_AUDIT.md`](../PMIDS_AUDIT.md) (30 PMIDs du baseline, taux d’erreur historique 67 %). Les corrections listées dans l’audit **déjà présentes** dans le seed (vinaigre, amidon résistant, whey, etc.) ne sont pas re-listées. Restent ouverts :');
  lines.push('');
  lines.push('| Levier | PMID seed | Statut |');
  lines.push('|--------|-----------|--------|');
  for (const lever of openFlags) {
    for (const flag of OPEN_AUDIT_FLAGS[lever.id]) {
      lines.push(`| \`${lever.id}\` | ${flag.pmid} | ${flag.reason} |`);
    }
  }
  if (noPmid.length) {
    for (const l of noPmid) {
      if (!OPEN_AUDIT_FLAGS[l.id]) {
        lines.push(`| \`${l.id}\` | *(vide)* | Pas de PMID dans le seed. Réf. : ${escapeCell(l.primary_reference ?? '—')} |`);
      }
    }
  }
  if (nonNumericPmids.length) {
    lines.push('');
    lines.push('PMID non numériques dans les INSERT chargeables :');
    for (const x of nonNumericPmids) {
      lines.push(`- \`${x.id}\` : \`${x.pmid}\``);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 6. Registre des leviers chargeables');
  lines.push('');
  lines.push('Tiers **globaux** = `culinary_levers.ebm_tier`. Tiers bottleneck = `lever_bottleneck_map.tier_for_bottleneck`.');
  lines.push('');
  lines.push('| ID | Nom FR | Cat. | Tier | Star | PMIDs | Mapping | Revue CS |');
  lines.push('|----|--------|------|------|------|-------|---------|----------|');
  for (const l of levers) {
    const pmids = l.pubmed_ids.length ? l.pubmed_ids.join(', ') : '—';
    const flag = OPEN_AUDIT_FLAGS[l.id] ? ' ⚠️ audit' : '';
    lines.push(
      `| \`${l.id}\` | ${escapeCell(l.name_fr)} | ${l.category} | **${l.ebm_tier}** | ${l.is_universal_star ? 'oui' : ''} | ${pmids}${flag} | ${mapCell(mapByLever.get(l.id) ?? [])} | **non** |`
    );
  }
  lines.push('');
  lines.push('### 6.1 Références pivot (texte seed)');
  lines.push('');
  lines.push('| ID | primary_reference |');
  lines.push('|----|-------------------|');
  for (const l of levers) {
    lines.push(`| \`${l.id}\` | ${escapeCell(l.primary_reference ?? '—')} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 7. Intégrité mapping');
  lines.push('');
  if (unmapped.length) {
    lines.push('### 7.1 Leviers chargeables sans ligne `lever_bottleneck_map`');
    lines.push('');
    for (const id of unmapped) lines.push(`- \`${id}\``);
    lines.push('');
  } else {
    lines.push('Tous les leviers chargeables ont au moins une ligne de mapping.');
    lines.push('');
  }
  if (mapOrphans.length) {
    lines.push('### 7.2 Lignes de mapping dont le levier n’est **pas** dans un INSERT `culinary_levers`');
    lines.push('');
    lines.push('Ces IDs casseraient une FK si le mapping était appliqué après un seed strict. Ils correspondent pour la plupart aux tuples orphelins du §8.');
    lines.push('');
    lines.push('| ID mapping orphelin | Bottlenecks |');
    lines.push('|---------------------|-------------|');
    for (const id of mapOrphans.sort()) {
      lines.push(`| \`${id}\` | ${mapCell(mapByLever.get(id) ?? [])} |`);
    }
    lines.push('');
  }
  lines.push('### 7.3 Syntaxe `05_lever_bottleneck_map.sql`');
  lines.push('');
  if (mapBreakLine) {
    lines.push(
      "Plusieurs lignes se terminent par `');` au lieu de `'),`. **Première rupture** : ligne **" +
        String(mapBreakLine) +
        "**. Un client PostgreSQL strict arrête l'INSERT à cet endroit ; le reste du fichier n'est pas chargé. Le tableau ci-dessus parse **toutes** les lignes à des fins de traçabilité, ce qui **surestime** ce qui serait réellement inséré."
    );
  } else {
    lines.push('Aucune rupture `);` prématurée détectée dans le mapping.');
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 8. Identifiants SQL orphelins (non chargés)');
  lines.push('');
  lines.push('Présents dans `04_culinary_levers.sql` **après** le `;` du second INSERT. Ce ne sont **pas** des leviers du moteur tant qu’un `INSERT INTO culinary_levers` valide n’est pas rédigé (catégories `supplement` / `lifestyle` / `beverage` / `spice` hors CHECK du schéma `001_init_schema.sql`).');
  lines.push('');
  if (orphans.length === 0) {
    lines.push('*Aucun identifiant orphelin détecté.*');
  } else {
    lines.push(`**${orphans.length} identifiants** :`);
    lines.push('');
    lines.push(orphans.map((id) => `\`${id}\``).join(', '));
  }
  lines.push('');
  lines.push('Ces IDs ne reçoivent **pas** de tier opérationnel dans ce changelog.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 9. Journal des modifications de tier (post-snapshot)');
  lines.push('');
  lines.push('Table à renseigner à chaque évolution (LIV-15). Aucune modification de tier n’est enregistrée à ce jour.');
  lines.push('');
  lines.push('| Date | Levier | Tier avant | Tier après | PMID ajouté/retiré | Fiche LIV-16 | Reviewer CS | SHA |');
  lines.push('|------|--------|------------|------------|--------------------|--------------|-------------|-----|');
  lines.push('| — | — | — | — | — | — | — | — |');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 10. Disclaimer');
  lines.push('');
  lines.push('Les badges T1/T2/T3 de ce snapshot sont des **déclarations d’auteur** dans le seed. Ils ne constituent pas une validation scientifique externe. L’engagement produit ([`docs/EBM_TIERING.md`](../EBM_TIERING.md)) : *aucun T1 sans validation d’au moins un médecin du CS* — **non tenu** à ce jour.');
  lines.push('');
  lines.push('> Document généré automatiquement. Toute édition manuelle de la section 6 sera écrasée au prochain `npm run changelog:ebm`. Éditer les sections 1 (signatures) et 9 (journal) via PR, ou étendre le générateur.');
  lines.push('');

  return lines.join('\n');
}

function main(): void {
  mkdirSync(dirname(OUT), { recursive: true });
  const md = generate();
  writeFileSync(OUT, md, 'utf8');
  const levers = parseLevers(readFileSync(LEVER_SEED, 'utf8'));
  if (levers.length < 50) {
    throw new Error(`Parser LIV-17 : trop peu de leviers (${levers.length}). Vérifier le seed / parser.`);
  }
  process.stdout.write(`LIV-17 écrit : ${OUT} (${levers.length} leviers chargeables)\n`);
}

main();
