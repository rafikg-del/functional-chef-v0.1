/**
 * ============================================================
 * PubMed literature retrieval
 * ============================================================
 *
 * Server-side helper around NCBI E-utilities. It retrieves a small,
 * auditable abstract set for the Research Agent without adding a runtime
 * dependency or storing literature locally.
 */

import type { LiteratureEvidenceInput } from './types';

export interface PubMedSearchInput {
  problem: string;
  target_bottleneck_name?: string;
  query?: string;
  max_results?: number;
}

export interface PubMedSearchResult {
  query: string;
  pmids: string[];
  papers: LiteratureEvidenceInput[];
  warnings: string[];
}

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const DEFAULT_MAX_RESULTS = 6;
const MAX_RESULTS_CAP = 12;

function clampResultCount(value: number | undefined): number {
  if (!value || Number.isNaN(value)) return DEFAULT_MAX_RESULTS;
  return Math.max(1, Math.min(MAX_RESULTS_CAP, Math.floor(value)));
}

function buildQuery(input: PubMedSearchInput): string {
  if (input.query?.trim()) return input.query.trim();

  const target = input.target_bottleneck_name?.trim();
  const problem = input.problem.trim();
  const nutritionFilter =
    '(diet[Title/Abstract] OR dietary[Title/Abstract] OR nutrition[Title/Abstract] OR food[Title/Abstract] OR meal[Title/Abstract] OR ingredient*[Title/Abstract] OR polyphenol*[Title/Abstract] OR protein[Title/Abstract] OR fiber[Title/Abstract])';
  const evidenceFilter =
    '(clinical trial[Publication Type] OR randomized[Title/Abstract] OR systematic review[Publication Type] OR meta-analysis[Publication Type] OR cohort[Title/Abstract] OR biomarker*[Title/Abstract] OR mechanism*[Title/Abstract])';

  return [target ? `(${target})` : undefined, `(${problem})`, nutritionFilter, evidenceFilter]
    .filter(Boolean)
    .join(' AND ');
}

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripXmlTags(text: string): string {
  return decodeXml(text.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function firstTag(block: string, tagName: string): string | undefined {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? stripXmlTags(match[1]) : undefined;
}

function allTags(block: string, tagName: string): string[] {
  const matches = block.matchAll(
    new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'gi')
  );
  return Array.from(matches)
    .map((match) => stripXmlTags(match[1]))
    .filter(Boolean);
}

function articleId(block: string, idType: string): string | undefined {
  const match = block.match(
    new RegExp(`<ArticleId\\s+IdType=["']${idType}["']>([\\s\\S]*?)<\\/ArticleId>`, 'i')
  );
  return match ? stripXmlTags(match[1]) : undefined;
}

function publicationYear(block: string): number | undefined {
  const articleDateYear = block.match(/<ArticleDate[^>]*>[\s\S]*?<Year>(\d{4})<\/Year>/i);
  const pubDateYear = block.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/i);
  const medlineDateYear = block.match(/<MedlineDate>(\d{4})/i);
  const year = articleDateYear?.[1] ?? pubDateYear?.[1] ?? medlineDateYear?.[1];
  return year ? Number(year) : undefined;
}

function articleAuthors(block: string): string[] {
  const authorBlocks = block.match(/<Author\b[\s\S]*?<\/Author>/gi) ?? [];
  return authorBlocks
    .map((authorBlock) => {
      const lastName = firstTag(authorBlock, 'LastName');
      const initials = firstTag(authorBlock, 'Initials');
      const collective = firstTag(authorBlock, 'CollectiveName');
      if (lastName) return [lastName, initials].filter(Boolean).join(' ');
      return collective;
    })
    .filter((author): author is string => Boolean(author))
    .slice(0, 8);
}

function parsePubMedXml(xml: string): LiteratureEvidenceInput[] {
  const articleBlocks = xml.match(/<PubmedArticle\b[\s\S]*?<\/PubmedArticle>/gi) ?? [];

  return articleBlocks
    .map((block): LiteratureEvidenceInput | null => {
      const pmid = firstTag(block, 'PMID');
      const title = firstTag(block, 'ArticleTitle');
      if (!pmid || !title) return null;

      const abstractParts = allTags(block, 'AbstractText');
      const abstract = abstractParts.length > 0 ? abstractParts.join('\n') : undefined;
      const doi = articleId(block, 'doi');

      return {
        title,
        authors: articleAuthors(block),
        journal: firstTag(block, 'Title'),
        year: publicationYear(block),
        pmid,
        doi,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        abstract,
      };
    })
    .filter((paper): paper is LiteratureEvidenceInput => Boolean(paper));
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!response.ok) {
    throw new Error(`PubMed request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

async function fetchText(url: URL): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: 'application/xml,text/xml' },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!response.ok) {
    throw new Error(`PubMed fetch failed (${response.status})`);
  }
  return response.text();
}

export async function searchPubMedLiterature(input: PubMedSearchInput): Promise<PubMedSearchResult> {
  const maxResults = clampResultCount(input.max_results);
  const query = buildQuery(input);
  const warnings: string[] = [];

  const commonParams = {
    tool: 'functional-chef',
    email: process.env.NCBI_EMAIL ?? 'not-provided@example.com',
  };

  const searchUrl = new URL(`${EUTILS_BASE}/esearch.fcgi`);
  searchUrl.search = new URLSearchParams({
    ...commonParams,
    db: 'pubmed',
    retmode: 'json',
    sort: 'relevance',
    retmax: String(maxResults),
    term: query,
  }).toString();

  const search = await fetchJson<{ esearchresult?: { idlist?: string[] } }>(searchUrl);
  const pmids = search.esearchresult?.idlist ?? [];
  if (pmids.length === 0) {
    return {
      query,
      pmids: [],
      papers: [],
      warnings: ['PubMed n’a retourné aucun PMID pour cette requête.'],
    };
  }

  const fetchUrl = new URL(`${EUTILS_BASE}/efetch.fcgi`);
  fetchUrl.search = new URLSearchParams({
    ...commonParams,
    db: 'pubmed',
    retmode: 'xml',
    id: pmids.join(','),
  }).toString();

  const xml = await fetchText(fetchUrl);
  const papers = parsePubMedXml(xml);
  if (papers.length < pmids.length) {
    warnings.push(
      `${pmids.length - papers.length} PMID(s) n’ont pas pu être convertis en entrée littérature.`
    );
  }

  return { query, pmids, papers, warnings };
}
