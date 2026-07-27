
import { searchArticles, getPaper } from '../src/lib/openalex';

async function main() {
  // More targeted searches
  const queries = [
    '"magnesium" "heart rate variability"',
    '"magnesium" "vagal" "randomized"',
    '"magnesium supplementation" "autonomic"',
    '"magnesium" "RMSSD" OR "HF-HRV"',
    '"magnesium glycinate" OR "magnesium citrate" "HRV"',
  ];
  
  for (const q of queries) {
    console.log(`\n=== ${q} ===`);
    const papers = await searchArticles(q, { limit: 3 });
    for (const p of papers) {
      console.log(`${p.pmid ? 'PMID '+p.pmid : 'N/A'.padEnd(8)} | ${p.year} | ${p.cited_by.toString().padStart(4)} cit.`);
      console.log(`   ${p.title?.substring(0, 120)}`);
      if (p.abstract) console.log(`   ${p.abstract.substring(0, 200)}`);
      console.log('');
    }
  }
}
main();
