/**
 * LIV-14 — Registre des modifications logicielles (léger).
 *
 * Lie les tags git contrôlés → registre Markdown.
 * Sans tag : produit un pré-registre honnête (pas de release contrôlée).
 *
 * Usage :
 *   npx tsx scripts/generate-software-changelog.ts
 *   npm run changelog:software
 *
 * Convention de tags (LIV-12 / LIV-14) :
 *   vX.Y.Z          release logicielle (ISO 13485 — maîtrise des changements)
 *   liv-NN-vX.Y     gel d’un livrable documentaire
 */

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'docs/quality/REGISTRE_RELEASES.md');
const TODAY = '2026-09-10';

interface TagRow {
  name: string;
  date: string;
  sha: string;
  subject: string;
  kind: 'software' | 'document' | 'other';
}

function git(cmd: string): string {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function classifyTag(name: string): TagRow['kind'] {
  if (/^v\d+\.\d+\.\d+$/.test(name)) return 'software';
  if (/^liv-\d+-v\d+(\.\d+)?$/i.test(name)) return 'document';
  return 'other';
}

function listTags(): TagRow[] {
  let raw = '';
  try {
    raw = git(
      'git for-each-ref --sort=-creatordate --format="%(refname:short)|%(creatordate:short)|%(objectname:short)|%(subject)" refs/tags'
    );
  } catch {
    return [];
  }
  if (!raw) return [];
  return raw.split('\n').filter(Boolean).map((line) => {
    const [name, date, sha, ...rest] = line.split('|');
    return {
      name,
      date,
      sha,
      subject: rest.join('|'),
      kind: classifyTag(name),
    };
  });
}

function recentMerges(limit = 15): { sha: string; date: string; subject: string }[] {
  const raw = git(`git log --merges --format="%h|%ad|%s" --date=short -n ${limit}`);
  if (!raw) return [];
  return raw.split('\n').filter(Boolean).map((line) => {
    const [sha, date, ...rest] = line.split('|');
    return { sha, date, subject: rest.join('|') };
  });
}

function headSha(): string {
  try {
    return git('git rev-parse --short HEAD');
  } catch {
    return 'inconnu';
  }
}

function generate(): string {
  const tags = listTags();
  const software = tags.filter((t) => t.kind === 'software');
  const docs = tags.filter((t) => t.kind === 'document');
  const other = tags.filter((t) => t.kind === 'other');
  const merges = recentMerges();
  const sha = headSha();

  const lines: string[] = [];
  lines.push('# Registre des releases logicielles (LIV-14)');
  lines.push('');
  lines.push('> **Identifiant** : FC-REG-SW / LIV-14');
  lines.push('> **Statut** : **Brouillon — signature humaine requise**');
  lines.push(`> **Généré le** : ${TODAY}`);
  lines.push(`> **SHA** : \`${sha}\``);
  lines.push('> **Commande** : `npm run changelog:software`');
  lines.push('> **Procédure** : [`LIV-14_REGISTRE_LOGICIEL.md`](LIV-14_REGISTRE_LOGICIEL.md)');
  lines.push('');
  lines.push('Ce fichier est **écrasé** à chaque génération. Ne pas y coller de signatures : elles appartiennent à la procédure LIV-14 et aux tags annotés.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 1. Releases logicielles (`vX.Y.Z`)');
  lines.push('');
  if (software.length === 0) {
    lines.push('**Aucune.** Aucun tag `vX.Y.Z` n’existe sur ce dépôt à la date du snapshot. Il n’y a donc **pas** de version logicielle contrôlée au sens LIV-12 (gel + revue). Le `package.json` déclare `0.1.0` sans tag correspondant.');
    lines.push('');
  } else {
    lines.push('| Tag | Date | SHA | Message |');
    lines.push('|-----|------|-----|---------|');
    for (const t of software) {
      lines.push(`| \`${t.name}\` | ${t.date} | \`${t.sha}\` | ${t.subject.replace(/\|/g, ' ')} |`);
    }
    lines.push('');
  }

  lines.push('## 2. Gels documentaires (`liv-NN-vX.Y`)');
  lines.push('');
  if (docs.length === 0) {
    lines.push('**Aucun** tag de gel documentaire. Les livrables (LIV-24, pack LIV-25, etc.) existent sur `main` mais ne sont pas gelés par tag.');
    lines.push('');
  } else {
    lines.push('| Tag | Date | SHA | Message |');
    lines.push('|-----|------|-----|---------|');
    for (const t of docs) {
      lines.push(`| \`${t.name}\` | ${t.date} | \`${t.sha}\` | ${t.subject.replace(/\|/g, ' ')} |`);
    }
    lines.push('');
  }

  if (other.length) {
    lines.push('## 3. Autres tags (hors convention)');
    lines.push('');
    lines.push('| Tag | Date | SHA | Message |');
    lines.push('|-----|------|-----|---------|');
    for (const t of other) {
      lines.push(`| \`${t.name}\` | ${t.date} | \`${t.sha}\` | ${t.subject.replace(/\|/g, ' ')} |`);
    }
    lines.push('');
  }

  lines.push('## 4. Pré-registre — merges récents (non contrôlés)');
  lines.push('');
  lines.push('Historique git informatif. **Ce n’est pas** un registre de changements 13485 : pas de revue formelle, pas de tag, pas d’évaluation d’impact.');
  lines.push('');
  if (merges.length === 0) {
    lines.push('*Aucun merge commit trouvé.*');
  } else {
    lines.push('| Date | SHA | Sujet |');
    lines.push('|------|-----|-------|');
    for (const m of merges) {
      lines.push(`| ${m.date} | \`${m.sha}\` | ${m.subject.replace(/\|/g, ' ')} |`);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 5. Comment enregistrer une release');
  lines.push('');
  lines.push('```bash');
  lines.push('# après revue PR + checklist LIV-14');
  lines.push('git tag -a v0.2.0 -m "Functional Chef v0.2.0 — description de l’impact"');
  lines.push('git push origin v0.2.0');
  lines.push('npm run changelog:software');
  lines.push('# committer REGISTRE_RELEASES.md sur une PR de registre');
  lines.push('```');
  lines.push('');
  lines.push('Le workflow GitHub `release-register.yml` (LIV-14) rappelle cette étape sur push de tag ; il **n’approuve pas** la release.');
  lines.push('');

  return lines.join('\n');
}

function main(): void {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, generate(), 'utf8');
  process.stdout.write(`Registre logiciel écrit : ${OUT}\n`);
}

main();
