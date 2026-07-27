/**
 * OpenAlex API client — recherche de littérature scientifique
 *
 * Source de données du connecteur FastTrack Literature (OpenAlex).
 * 250M publications. Gratuit, pas de clé requise (rate limit généreux).
 *
 * Usage:
 *   import { searchPapers, getPaper } from '@/lib/openalex';
 *   const papers = await searchArticles('nutritional biomarkers insulin resistance meta-analysis 2025');
 *   const paper = await getPaper('10.1056/AIoa2501001');
 */

const BASE = 'https://api.openalex.org';

export interface OpenAlexPaper {
  id: string;
  doi: string | null;
  title: string;
  authors: string[];
  year: number | null;
  journal: string | null;
  cited_by: number;
  abstract: string | null;
  pmid: string | null;
  pmcid: string | null;
  oa_url: string | null; // open access PDF
  concepts: string[];     // MeSH-like topics
}

interface RawOpenAlexWork {
  id: string;
  doi: string | null;
  title: string;
  authorships: { author: { display_name: string } }[];
  publication_year: number | null;
  cited_by_count: number;
  abstract_inverted_index: Record<string, number[]> | null;
  primary_location: {
    source: { display_name: string | null } | null;
    landing_page_url: string | null;
  } | null;
  open_access: {
    oa_url: string | null;
    oa_status: string | null;
  } | null;
  ids: {
    pmid: string | null;
    pmcid: string | null;
  } | null;
  concepts: { display_name: string; score: number }[];
}

function reconstructAbstract(inverted: Record<string, number[]> | null): string | null {
  if (!inverted) return null;
  const words: [number, string][] = [];
  for (const [word, positions] of Object.entries(inverted)) {
    for (const pos of positions) {
      words.push([pos, word]);
    }
  }
  words.sort((a, b) => a[0] - b[0]);
  return words.map(w => w[1]).join(' ');
}

function mapPaper(w: RawOpenAlexWork): OpenAlexPaper {
  return {
    id: w.id.replace('https://openalex.org/', ''),
    doi: w.doi?.replace('https://doi.org/', '') ?? null,
    title: w.title ?? '?',
    authors: w.authorships?.map(a => a.author.display_name) ?? [],
    year: w.publication_year,
    journal: w.primary_location?.source?.display_name ?? null,
    cited_by: w.cited_by_count ?? 0,
    abstract: reconstructAbstract(w.abstract_inverted_index),
    pmid: w.ids?.pmid?.replace('https://pubmed.ncbi.nlm.nih.gov/', '') ?? null,
    pmcid: w.ids?.pmcid ?? null,
    oa_url: w.open_access?.oa_url ?? null,
    concepts: (w.concepts ?? []).filter(c => c.score > 0.3).map(c => c.display_name),
  };
}

/**
 * Search articles by keywords.
 * Filters: from_year, to_year, min_citations, limit (max 200)
 */
export async function searchArticles(
  query: string,
  opts?: {
    from_year?: number;
    to_year?: number;
    min_citations?: number;
    limit?: number;
  }
): Promise<OpenAlexPaper[]> {
  const params = new URLSearchParams({
    search: query,
    per_page: String(Math.min(opts?.limit ?? 10, 200)),
    sort: 'cited_by_count:desc',
  });

  if (opts?.from_year) params.set('filter', `from_publication_date:${opts.from_year}-01-01`);
  if (opts?.to_year) {
    params.set('filter', params.get('filter')
      ? `${params.get('filter')},to_publication_date:${opts.to_year}-12-31`
      : `to_publication_date:${opts.to_year}-12-31`);
  }

  const url = `${BASE}/works?${params.toString()}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'FunctionalChef/1.0' } });
  if (!res.ok) throw new Error(`OpenAlex error ${res.status}`);

  const data = await res.json();
  return (data.results ?? []).map(mapPaper);
}

/**
 * Get a single paper by DOI.
 */
export async function getPaper(doi: string): Promise<OpenAlexPaper | null> {
  const cleanDoi = doi.replace('https://doi.org/', '');
  const url = `${BASE}/works/doi:${cleanDoi}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'FunctionalChef/1.0' } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`OpenAlex error ${res.status}`);
  }
  const data = await res.json();
  return mapPaper(data);
}

/**
 * Get papers by concept / topic (e.g. "insulin resistance", "gut microbiome")
 */
export async function searchByConcept(
  concept: string,
  opts?: { min_citations?: number; limit?: number; year?: number }
): Promise<OpenAlexPaper[]> {
  const filter = `concept.display_name:${concept.toLowerCase().replace(/\s+/g, '-')}`;
  const params = new URLSearchParams({
    filter,
    per_page: String(Math.min(opts?.limit ?? 10, 200)),
    sort: 'cited_by_count:desc',
  });
  if (opts?.year) params.set('filter', `${filter},publication_year:${opts.year}`);
  if (opts?.min_citations) params.set('filter', `${params.get('filter')},cited_by_count:>${opts.min_citations}`);

  const url = `${BASE}/works?${params.toString()}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'FunctionalChef/1.0' } });
  if (!res.ok) throw new Error(`OpenAlex error ${res.status}`);

  const data = await res.json();
  return (data.results ?? []).map(mapPaper);
}
