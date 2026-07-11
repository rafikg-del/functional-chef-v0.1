#!/usr/bin/env tsx
/**
 * Extract text from a PDF with page markers for bottleneck extraction.
 *
 * Usage:
 *   npm run pdf:extract -- docs/extractions/_sources/mon-livre.pdf
 *   npm run pdf:extract -- input.pdf --from 142 --to 198
 *   npm run pdf:extract -- input.pdf --output docs/extractions/_sources/input.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

interface PdfTextItem {
  str: string;
}

interface CliOptions {
  input: string;
  from: number;
  to?: number;
  output?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const positional: string[] = [];
  let from = 1;
  let to: number | undefined;
  let output: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--from') {
      from = Number(argv[++i]);
    } else if (arg === '--to') {
      to = Number(argv[++i]);
    } else if (arg === '--output' || arg === '-o') {
      output = argv[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  if (positional.length === 0) {
    console.error('Error: PDF path required.\n');
    printHelp();
    process.exit(1);
  }

  if (!Number.isFinite(from) || from < 1) {
    console.error('Error: --from must be a positive integer.');
    process.exit(1);
  }
  if (to !== undefined && (!Number.isFinite(to) || to < from)) {
    console.error('Error: --to must be >= --from.');
    process.exit(1);
  }

  return { input: positional[0], from, to, output };
}

function printHelp(): void {
  console.log(`Extract PDF text with page markers for Functional Chef bottleneck extraction.

Usage:
  npm run pdf:extract -- <input.pdf> [options]

Options:
  --from <n>       First page (default: 1)
  --to <n>         Last page (default: last page of PDF)
  --output, -o     Write markdown to file instead of stdout
  --help, -h       Show this help

Examples:
  npm run pdf:extract -- docs/extractions/_sources/livre.pdf
  npm run pdf:extract -- etude.pdf --from 1 --to 12 -o docs/extractions/_sources/etude-p1-12.md
`);
}

function pageText(items: PdfTextItem[]): string {
  return items
    .map((item) => item.str)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function defaultOutputPath(inputPath: string, from: number, to: number): string {
  const base = path.basename(inputPath, path.extname(inputPath));
  const suffix = from === 1 && to ? '' : `-p${from}-${to}`;
  return path.join(
    path.dirname(path.resolve(inputPath)),
    `${base}${suffix}.extracted.md`
  );
}

async function extractPdf(options: CliOptions): Promise<string> {
  const absPath = path.resolve(options.input);
  if (!fs.existsSync(absPath)) {
    throw new Error(`PDF not found: ${absPath}`);
  }
  if (path.extname(absPath).toLowerCase() !== '.pdf') {
    throw new Error(`Not a PDF file: ${absPath}`);
  }

  const data = new Uint8Array(fs.readFileSync(absPath));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;

  const from = options.from;
  const to = options.to ?? doc.numPages;
  if (from > doc.numPages) {
    throw new Error(`--from ${from} exceeds PDF length (${doc.numPages} pages).`);
  }
  const last = Math.min(to, doc.numPages);

  const lines: string[] = [
    `# PDF extract — ${path.basename(absPath)}`,
    '',
    `- **Source**: \`${absPath}\``,
    `- **Pages**: ${from}–${last} / ${doc.numPages}`,
    `- **Extracted**: ${new Date().toISOString()}`,
    '',
    '> Format for bottleneck-extraction subagent. Each page is prefixed with `[p.N]`.',
    '',
  ];

  for (let pageNum = from; pageNum <= last; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const text = pageText(content.items as PdfTextItem[]);

    lines.push('---');
    lines.push('');
    lines.push(`[p.${pageNum}]`);
    lines.push('');
    lines.push(text || '_(page vide ou texte non extractible — scan/OCR requis)_');
    lines.push('');
  }

  return lines.join('\n');
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const markdown = await extractPdf(options);

  if (options.output) {
    const outPath = path.resolve(options.output);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown, 'utf-8');
    const pageCount =
      (options.to ?? markdown.match(/\[p\.\d+\]/g)?.length ?? 0) ||
      markdown.match(/\[p\.\d+\]/g)?.length ||
      0;
    console.log(`✓ ${outPath} (${pageCount} pages)`);
    return;
  }

  // Default: write next to PDF as .extracted.md
  const absInput = path.resolve(options.input);
  const doc = await getDocument({
    data: new Uint8Array(fs.readFileSync(absInput)),
    useSystemFonts: true,
  }).promise;
  const to = options.to ?? doc.numPages;
  const outPath = defaultOutputPath(absInput, options.from, to);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, markdown, 'utf-8');
  console.log(`✓ ${outPath}`);
  console.log(`  Pages ${options.from}–${Math.min(to, doc.numPages)} / ${doc.numPages}`);
}

main().catch((err: Error) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
